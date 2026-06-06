import { logger } from "./logger.js";

/**
 * ERROR HANDLER CENTRALIZADO
 * Captura todos os erros não tratados e retorna formato padronizado.
 */

// Erros operacionais conhecidos
class AppError extends Error {
  constructor(mensagem, statusCode = 400, codigo = "ERRO_GENERICO") {
    super(mensagem);
    this.statusCode = statusCode;
    this.codigo = codigo;
    this.operacional = true;
  }
}

// Middleware de erro global (deve ser o último app.use)
function errorHandler(err, req, res, next) {
  // Erro de JSON malformado
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ erro: "JSON inválido no body da requisição", codigo: "JSON_INVALIDO" });
  }

  // Erro de payload muito grande
  if (err.type === "entity.too.large") {
    return res.status(413).json({ erro: "Payload excede o limite permitido", codigo: "PAYLOAD_GRANDE" });
  }

  // Erro operacional (controlado)
  if (err.operacional) {
    return res.status(err.statusCode).json({ erro: err.message, codigo: err.codigo });
  }

  // Erro de validação Mongoose
  if (err.name === "ValidationError") {
    const campos = Object.values(err.errors).map(e => ({ campo: e.path, mensagem: e.message }));
    return res.status(400).json({ erro: "Erro de validação", codigo: "VALIDACAO", campos });
  }

  // Erro de cast Mongoose (ID inválido)
  if (err.name === "CastError") {
    return res.status(400).json({ erro: `Valor inválido para ${err.path}: ${err.value}`, codigo: "ID_INVALIDO" });
  }

  // Erro de duplicata MongoDB
  if (err.code === 11000) {
    const campo = Object.keys(err.keyPattern)[0];
    return res.status(409).json({ erro: `Registro duplicado: ${campo}`, codigo: "DUPLICADO" });
  }

  // Erro inesperado (não expor detalhes em produção)
  logger.error("Erro não tratado", { 
    erro: err.message, 
    stack: err.stack,
    path: req.originalUrl,
    method: req.method
  });

  const mensagem = process.env.NODE_ENV === "production" 
    ? "Erro interno do servidor" 
    : err.message;

  res.status(500).json({ erro: mensagem, codigo: "ERRO_INTERNO" });
}

// Capturar promessas não tratadas
function configurarHandlersGlobais() {
  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled Rejection", { erro: reason?.message || reason });
  });

  process.on("uncaughtException", (err) => {
    logger.error("Uncaught Exception — encerrando processo", { erro: err.message, stack: err.stack });
    process.exit(1);
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    logger.info("SIGTERM recebido — encerrando graciosamente...");
    process.exit(0);
  });

  process.on("SIGINT", () => {
    logger.info("SIGINT recebido — encerrando...");
    process.exit(0);
  });
}

export { AppError, errorHandler, configurarHandlersGlobais };
