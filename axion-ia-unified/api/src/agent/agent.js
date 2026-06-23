/**
 * agent/agent.js — AxionAgent: cérebro operacional do ecossistema
 *
 * Expõe:
 *  - AxionAgent.run()         → executa um ciclo completo manualmente
 *  - AxionAgent.iniciarScheduler() → inicia ciclos periódicos via node-cron
 *  - AxionAgent.pararScheduler()   → para o cron sem destruir estado
 *  - AxionAgent.state              → referência ao singleton de estado
 *
 * O agente é um singleton — importar o mesmo módulo em qualquer parte
 * do código retorna a mesma instância.
 */

import cron from "node-cron";
import { AGENT_CONFIG } from "./config.js";
import { Orchestrator } from "./orchestrator.js";
import { agentState } from "./state.js";

class AxionAgent {
  constructor() {
    this.config       = { ...AGENT_CONFIG };
    this.orchestrator = new Orchestrator(this.config);
    this._cronTask    = null;
    this._running     = false; // mutex — impede execuções sobrepostas
  }

  get state() {
    return agentState;
  }

  // ─── Execução manual (um ciclo) ─────────────────────────────────────────

  async run(overrides = {}) {
    if (this._running) {
      return {
        status: "busy",
        mensagem: "Agente já está em execução. Aguarde o ciclo atual terminar."
      };
    }

    this._running = true;

    // Permitir override pontual de config sem alterar o config global
    if (Object.keys(overrides).length > 0) {
      this.orchestrator = new Orchestrator({ ...this.config, ...overrides });
    }

    try {
      const resultado = await this.orchestrator.execute();
      return resultado;
    } finally {
      this._running = false;
      // Restaurar orquestrador padrão após override pontual
      if (Object.keys(overrides).length > 0) {
        this.orchestrator = new Orchestrator(this.config);
      }
    }
  }

  // ─── Scheduler autônomo ──────────────────────────────────────────────────

  iniciarScheduler(intervalMinutos) {
    const min = intervalMinutos || this.config.scheduler_interval_min;

    if (!min || min <= 0) {
      console.log("ℹ️  [AxionAgent] Scheduler não iniciado (AGENT_INTERVAL não configurado ou = 0).");
      return false;
    }

    if (this._cronTask) {
      console.warn("⚠️  [AxionAgent] Scheduler já está ativo.");
      return false;
    }

    // Expressão cron: a cada N minutos
    const expr = `*/${min} * * * *`;

    this._cronTask = cron.schedule(expr, async () => {
      if (this._running) {
        console.warn("⚠️  [AxionAgent] Ciclo anterior ainda em execução — pulando.");
        return;
      }
      console.log(`🤖 [AxionAgent] Ciclo automático iniciado (${new Date().toLocaleString("pt-BR")})`);
      await this.run().catch(err => {
        console.error("❌ [AxionAgent] Erro no ciclo automático:", err.message);
      });
    });

    // Registrar próxima execução estimada
    const proxima = new Date(Date.now() + min * 60_000).toISOString();
    agentState.definirProxima(proxima);

    console.log(`🤖 [AxionAgent] Scheduler ativo — ciclos a cada ${min} minuto(s).`);
    return true;
  }

  pararScheduler() {
    if (!this._cronTask) return false;
    this._cronTask.stop();
    this._cronTask = null;
    agentState.definirProxima(null);
    console.log("⏹️  [AxionAgent] Scheduler parado.");
    return true;
  }

  schedulerAtivo() {
    return !!this._cronTask;
  }

  // ─── Atualizar config em runtime ─────────────────────────────────────────

  atualizarConfig(novaConfig) {
    this.config       = { ...this.config, ...novaConfig };
    this.orchestrator = new Orchestrator(this.config);
  }
}

// Singleton exportado
export const axioniAgent = new AxionAgent();
