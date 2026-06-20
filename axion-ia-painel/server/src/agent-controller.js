/**
 * agent-controller.js — Endpoints REST do AxionAgent
 *
 * POST /api/agent/run              → executa um ciclo completo agora
 * POST /api/agent/run/:mode        → ciclo com mode específico (health|recognition|full)
 * GET  /api/agent/state            → estado atual + histórico
 * GET  /api/agent/scheduler        → status do scheduler
 * POST /api/agent/scheduler/start  → inicia scheduler (body: { interval_min })
 * POST /api/agent/scheduler/stop   → para scheduler
 */

import { axioniAgent } from "./agent/agent.js";

// ─── POST /api/agent/run ─────────────────────────────────────────────────────

export async function runAgent(req, res) {
  const { mode, ...overrides } = req.body || {};

  const config = {};
  if (mode) config.mode = mode;
  Object.assign(config, overrides);

  try {
    const resultado = await axioniAgent.run(config);
    return res.json(resultado);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// ─── POST /api/agent/run/:mode ───────────────────────────────────────────────

export async function runAgentMode(req, res) {
  const modos = ["full", "health", "recognition", "validation"];
  const mode  = req.params.mode;

  if (!modos.includes(mode)) {
    return res.status(400).json({
      erro: `Mode inválido: "${mode}". Use: ${modos.join(", ")}`
    });
  }

  try {
    const resultado = await axioniAgent.run({ mode });
    return res.json(resultado);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// ─── GET /api/agent/state ────────────────────────────────────────────────────

export function getAgentState(req, res) {
  const snapshot = axioniAgent.state.snapshot();

  // Inclui o último resultado e o histórico compacto
  return res.json({
    ...snapshot,
    ultimo_resultado: axioniAgent.state.ultimo_resultado,
    historico:        axioniAgent.state.historico.slice(0, 20),
    scheduler_ativo:  axioniAgent.schedulerAtivo()
  });
}

// ─── GET /api/agent/scheduler ────────────────────────────────────────────────

export function getSchedulerStatus(req, res) {
  return res.json({
    ativo:            axioniAgent.schedulerAtivo(),
    proxima_execucao: axioniAgent.state.proxima_execucao,
    ciclos:           axioniAgent.state.ciclos,
    config: {
      mode:                axioniAgent.config.mode,
      scheduler_interval:  axioniAgent.config.scheduler_interval_min,
      enable_health_check: axioniAgent.config.enable_health_check,
      enable_recognition:  axioniAgent.config.enable_recognition,
      enable_alerts:       axioniAgent.config.enable_alerts,
    }
  });
}

// ─── POST /api/agent/scheduler/start ─────────────────────────────────────────

export function startScheduler(req, res) {
  const { interval_min } = req.body || {};

  if (axioniAgent.schedulerAtivo()) {
    return res.status(409).json({ erro: "Scheduler já está ativo. Pare primeiro." });
  }

  const min = parseInt(interval_min) || axioniAgent.config.scheduler_interval_min;
  if (!min || min < 1) {
    return res.status(400).json({
      erro: "Informe interval_min >= 1 no body ou configure AGENT_INTERVAL no .env."
    });
  }

  // Atualizar config se passado novo intervalo
  if (interval_min) {
    axioniAgent.atualizarConfig({ scheduler_interval_min: min });
  }

  const ok = axioniAgent.iniciarScheduler(min);
  return res.json({
    ok,
    mensagem: ok ? `Scheduler iniciado — ciclos a cada ${min} minuto(s).` : "Não foi possível iniciar.",
    proxima_execucao: axioniAgent.state.proxima_execucao
  });
}

// ─── POST /api/agent/scheduler/stop ──────────────────────────────────────────

export function stopScheduler(req, res) {
  const ok = axioniAgent.pararScheduler();
  return res.json({
    ok,
    mensagem: ok ? "Scheduler parado." : "Scheduler não estava ativo."
  });
}
