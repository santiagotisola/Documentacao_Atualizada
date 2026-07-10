/**
 * agent/state.js — Estado global do AxionAgent
 *
 * Mantém snapshot em memória de cada ciclo de execução.
 * Exporta uma instância singleton para que o orchestrator,
 * o controller e o scheduler compartilhem o mesmo estado.
 *
 * Nota de escala: em ambiente multi-instância esse estado
 * deve ser migrado para Redis. Por ora, escopo é single-node.
 */

const MAX_HISTORICO = 50; // execuções mantidas no histórico

class SystemState {
  constructor() {
    this.status        = "idle";      // idle | running | completed | error
    this.iniciado_em   = null;        // ISO string do boot do agente
    this.ultima_execucao = null;      // ISO string da última run
    this.proxima_execucao = null;     // ISO string (se scheduler ativo)
    this.ciclos        = 0;
    this.erros_totais  = 0;

    // Resultado do último ciclo completo
    this.ultimo_resultado = null;

    // Histórico compacto das últimas MAX_HISTORICO runs
    this.historico = [];

    // Métricas acumuladas de todos os ciclos
    this.metricas = {
      health_ok:       0,
      health_falha:    0,
      alertas_detectados: 0,
      validacoes_ok:   0,
      validacoes_erro: 0,
      heartbeat_offline: 0,
    };
  }

  iniciar() {
    this.status       = "running";
    this.ultima_execucao = new Date().toISOString();
    if (!this.iniciado_em) this.iniciado_em = this.ultima_execucao;
    this.ciclos++;
  }

  concluir(resultado) {
    this.status          = "completed";
    this.ultimo_resultado = resultado;

    // Acumular métricas do ciclo
    const m = resultado?.metricas || {};
    for (const [k, v] of Object.entries(m)) {
      if (typeof v === "number" && k in this.metricas) {
        this.metricas[k] += v;
      }
    }

    // Registrar no histórico (rotação)
    this.historico.unshift({
      ts:     this.ultima_execucao,
      ciclo:  this.ciclos,
      status: "completed",
      resumo: resultado?.resumo || null
    });
    if (this.historico.length > MAX_HISTORICO) {
      this.historico.splice(MAX_HISTORICO);
    }
  }

  falhar(erros) {
    this.status = "error";
    this.erros_totais += erros.length;

    this.historico.unshift({
      ts:     this.ultima_execucao,
      ciclo:  this.ciclos,
      status: "error",
      erros
    });
    if (this.historico.length > MAX_HISTORICO) {
      this.historico.splice(MAX_HISTORICO);
    }
  }

  definirProxima(isoStr) {
    this.proxima_execucao = isoStr;
  }

  snapshot() {
    return {
      status:           this.status,
      iniciado_em:      this.iniciado_em,
      ultima_execucao:  this.ultima_execucao,
      proxima_execucao: this.proxima_execucao,
      ciclos:           this.ciclos,
      erros_totais:     this.erros_totais,
      metricas:         { ...this.metricas },
    };
  }
}

// Singleton — compartilhado entre orchestrator, controller e scheduler
export const agentState = new SystemState();
