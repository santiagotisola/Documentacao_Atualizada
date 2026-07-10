/**
 * agent/config.js — Configuração central do AxionAgent
 *
 * Lida com valores do .env e fornece defaults seguros.
 * Não use process.env diretamente nos outros módulos do agente —
 * importe sempre a partir daqui para facilitar testes e overrides.
 */

export const AGENT_CONFIG = {
  // Modo de execução do pipeline
  // "full"         → todas as tarefas
  // "health"       → apenas health checks
  // "validation"   → apenas validação de fluxo de alertas
  // "recognition"  → apenas reconhecimento de passagens/heartbeat
  mode: process.env.AGENT_MODE || "full",

  // Intervalo do scheduler autônomo (minutos). 0 = desativado.
  scheduler_interval_min: parseInt(process.env.AGENT_INTERVAL || "0"),

  // Habilita tarefas individuais
  enable_health_check:  true,
  enable_recognition:   true,
  enable_validation:    process.env.AGENT_VALIDATION !== "false",
  enable_alerts:        process.env.AGENT_ALERTS !== "false",
  enable_ia_stats:      true,

  // Limiares
  heartbeat_stale_min:    parseInt(process.env.AGENT_HEARTBEAT_STALE || "10"),   // equipamento sem sinal → alerta
  passagem_stale_min:     parseInt(process.env.AGENT_PASSAGEM_STALE  || "60"),   // sem passagem → alerta
  openai_timeout_ms:      parseInt(process.env.AGENT_OPENAI_TIMEOUT  || "8000"),

  // Telegram (reaproveitado do validate-controller)
  telegram_token:   process.env.TELEGRAM_TOKEN   || "",
  telegram_chat_id: process.env.TELEGRAM_CHAT_ID || "",
};
