/**
 * LOGGER ESTRUTURADO
 * Logs em JSON para produção, colorido para desenvolvimento.
 * Compatível com ELK Stack, Datadog, CloudWatch.
 */

const NIVEIS = { error: 0, warn: 1, info: 2, debug: 3 };
const NIVEL_ATUAL = NIVEIS[process.env.LOG_LEVEL || "info"] ?? 2;
const IS_PROD = process.env.NODE_ENV === "production";

function formatarJSON(nivel, mensagem, meta = {}) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level: nivel,
    message: mensagem,
    service: process.env.SERVICE_NAME || "integracao-universal",
    ...meta
  });
}

function formatarDev(nivel, mensagem, meta = {}) {
  const cores = { error: "\x1b[31m", warn: "\x1b[33m", info: "\x1b[36m", debug: "\x1b[90m" };
  const reset = "\x1b[0m";
  const cor = cores[nivel] || "";
  const hora = new Date().toLocaleTimeString("pt-BR");
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  return `${cor}[${hora}] ${nivel.toUpperCase().padEnd(5)}${reset} ${mensagem}${metaStr}`;
}

function log(nivel, mensagem, meta) {
  if (NIVEIS[nivel] > NIVEL_ATUAL) return;
  const saida = IS_PROD ? formatarJSON(nivel, mensagem, meta) : formatarDev(nivel, mensagem, meta);
  
  if (nivel === "error") console.error(saida);
  else if (nivel === "warn") console.warn(saida);
  else console.log(saida);
}

export const logger = {
  error: (msg, meta) => log("error", msg, meta),
  warn: (msg, meta) => log("warn", msg, meta),
  info: (msg, meta) => log("info", msg, meta),
  debug: (msg, meta) => log("debug", msg, meta),

  // Middleware Express para log de requisições
  requestLogger(req, res, next) {
    const inicio = Date.now();
    
    res.on("finish", () => {
      const duracao = Date.now() - inicio;
      const meta = {
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        duration_ms: duracao,
        ip: req.ip
      };

      if (res.statusCode >= 500) {
        log("error", `${req.method} ${req.originalUrl} ${res.statusCode}`, meta);
      } else if (res.statusCode >= 400) {
        log("warn", `${req.method} ${req.originalUrl} ${res.statusCode}`, meta);
      } else if (duracao > 5000) {
        log("warn", `SLOW ${req.method} ${req.originalUrl} ${duracao}ms`, meta);
      } else {
        log("info", `${req.method} ${req.originalUrl} ${res.statusCode} ${duracao}ms`, meta);
      }
    });

    next();
  }
};
