/**
 * agent/orchestrator.js — Orquestrador central do AxionAgent
 *
 * Coordena a execução sequencial/paralela das tasks, agrega resultados,
 * atualiza o estado global e dispara notificações quando necessário.
 *
 * Design:
 *  - Health checks sempre rodam primeiro (em paralelo)
 *  - Se saúde crítica (todos offline) → aborta demais pipelines
 *  - Tasks de reconhecimento e IA rodam em paralelo após health OK
 *  - Alertas são consolidados de todas as tasks e enviados ao Telegram
 *    (uma única mensagem por ciclo para evitar spam)
 */

import {
  taskHealthCheck,
  taskReconhecimento,
  taskIAStats,
  taskMonitoramentos,
  taskNotificarTelegram,
} from "./tasks.js";
import { agentState } from "./state.js";

export class Orchestrator {
  constructor(config) {
    this.config = config;
  }

  // ─── Ponto de entrada público ─────────────────────────────────────────────

  async execute() {
    agentState.iniciar();

    const erros  = [];
    const resultado = {};
    let   alertas_ciclo = [];

    try {
      // ── FASE 1: Health Check (sempre, independente do mode) ───────────────
      resultado.health = await taskHealthCheck();

      if (resultado.health.offline) {
        // Todos os serviços offline → abortar sem executar pipelines de dados
        const msg = "🔴 *AxionAgent* — TODOS os serviços offline. Pipelines abortados.";
        await taskNotificarTelegram(msg, this.config);
        agentState.falhar(["Todos os serviços offline"]);
        return this._saida(resultado, [], "abortado_offline");
      }

      // ── FASE 2: Pipelines paralelos ───────────────────────────────────────
      const pipelines = [];

      if (this._deve("recognition")) {
        pipelines.push(
          taskReconhecimento(this.config)
            .then(r  => { resultado.reconhecimento = r; })
            .catch(e => { resultado.reconhecimento = { ok: false, erro: e.message }; erros.push(`reconhecimento: ${e.message}`); })
        );
      }

      if (this._deve("ia_stats")) {
        pipelines.push(
          taskIAStats()
            .then(r  => { resultado.ia = r; })
            .catch(e => { resultado.ia = { ok: false, erro: e.message }; erros.push(`ia_stats: ${e.message}`); })
        );
      }

      if (this._deve("alerts")) {
        pipelines.push(
          taskMonitoramentos()
            .then(r  => { resultado.monitoramentos = r; })
            .catch(e => { resultado.monitoramentos = { ok: false, erro: e.message }; erros.push(`monitoramentos: ${e.message}`); })
        );
      }

      await Promise.all(pipelines);

      // ── FASE 3: Consolidar alertas ────────────────────────────────────────
      alertas_ciclo = this._consolidarAlertas(resultado);

      // ── FASE 4: Notificação Telegram (apenas se há alertas) ───────────────
      if (alertas_ciclo.length > 0) {
        const msg = this._formatarMensagemTelegram(alertas_ciclo, resultado.health);
        resultado.notificacao = await taskNotificarTelegram(msg, this.config);
      } else {
        resultado.notificacao = { ok: true, motivo: "Sem alertas — notificação não enviada." };
      }

    } catch (err) {
      erros.push(`fatal: ${err.message}`);
      agentState.falhar(erros);
      return this._saida(resultado, erros, "error");
    }

    // ── Métricas do ciclo para o state ────────────────────────────────────
    const metricas = {
      health_ok:            resultado.health?.ok ? 1 : 0,
      health_falha:         resultado.health?.ok ? 0 : 1,
      alertas_detectados:   alertas_ciclo.length,
      validacoes_ok:        resultado.monitoramentos?.ok ? 1 : 0,
      validacoes_erro:      resultado.monitoramentos?.ok ? 0 : 1,
      heartbeat_offline:    (resultado.reconhecimento?.alertas || [])
                              .filter(a => a.tipo === "heartbeat_offline").length,
    };

    const saida = this._saida(resultado, erros, erros.length > 0 ? "parcial" : "completed");
    saida.metricas = metricas;
    saida.resumo   = this._resumo(resultado, alertas_ciclo);

    agentState.concluir(saida);
    return saida;
  }

  // ─── Helpers privados ─────────────────────────────────────────────────────

  _deve(tarefa) {
    const mode = this.config.mode;
    if (mode === "full")        return true;
    if (mode === "health")      return false;
    if (mode === "recognition") return tarefa === "recognition";
    if (mode === "validation")  return tarefa === "alerts";
    return this.config[`enable_${tarefa}`] !== false;
  }

  _consolidarAlertas(resultado) {
    const lista = [];

    // Alertas de heartbeat do reconhecimento
    for (const a of resultado.reconhecimento?.alertas || []) {
      lista.push(a);
    }

    // Monitoramentos expirando
    if (resultado.monitoramentos?.alerta_expiracao) {
      lista.push({
        sistema: "AxHub",
        tipo: "monitoramento_expirando",
        descricao: `${resultado.monitoramentos.expirando_24h} monitoramento(s) expiram em 24h`
      });
    }

    // Health degradado
    if (resultado.health?.degradado) {
      const offline = Object.entries(resultado.health.servicos || {})
        .filter(([, s]) => !s.conectado)
        .map(([nome]) => nome);
      lista.push({
        sistema: "Infraestrutura",
        tipo: "servico_offline",
        descricao: `Serviço(s) offline: ${offline.join(", ")}`
      });
    }

    return lista;
  }

  _formatarMensagemTelegram(alertas, health) {
    const linhas = [
      `⚠️ *AxionAgent — ${alertas.length} alerta(s) detectado(s)*`,
      `🕐 ${new Date().toLocaleString("pt-BR")}`,
      ""
    ];

    for (const a of alertas) {
      const icone = a.tipo === "heartbeat_offline"    ? "🔴"
                  : a.tipo === "servico_offline"       ? "⛔"
                  : a.tipo === "monitoramento_expirando" ? "🟡"
                  : "⚠️";
      linhas.push(`${icone} *${a.sistema}* — ${a.descricao}`);
    }

    linhas.push("", `✅ ${health?.resumo || ""}`);
    return linhas.join("\n");
  }

  _resumo(resultado, alertas) {
    const partes = [];
    if (resultado.health?.resumo)         partes.push(resultado.health.resumo);
    if (resultado.reconhecimento)         partes.push(`reconhecimento: ${resultado.reconhecimento.ok ? "✅" : "⚠️"}`);
    if (resultado.ia?.kb_total !== undefined) partes.push(`KB: ${resultado.ia.kb_total} entradas`);
    if (alertas.length > 0)               partes.push(`${alertas.length} alerta(s)`);
    return partes.join(" | ");
  }

  _saida(resultado, erros, status) {
    return {
      status,
      executado_em: new Date().toISOString(),
      erros,
      resultados: resultado
    };
  }
}
