import rateLimit from "express-rate-limit";

/**
 * MIDDLEWARES DE SEGURANÇA
 * Helmet (headers), Rate Limiting, sanitização básica
 */

// ============================================
// RATE LIMITING
// ============================================

// Limite geral: 100 req/min por IP
export const limiteGeral = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: "Muitas requisições. Tente novamente em 1 minuto." }
});

// Limite para IA: 20 req/min (mais caro em recursos)
export const limiteIA = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_IA) || 20,
  message: { erro: "Limite de requisições IA atingido. Aguarde 1 minuto." }
});

// Limite de login/auth: 5 tentativas/min
export const limiteAuth = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { erro: "Muitas tentativas. Bloqueado por 1 minuto." }
});

// ============================================
// SECURITY HEADERS (inline, sem helmet)
// ============================================
export function securityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("Content-Security-Policy", "default-src 'self'");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.removeHeader("X-Powered-By");
  next();
}

// ============================================
// SANITIZAÇÃO DE ENTRADA
// ============================================
export function sanitizarEntrada(req, res, next) {
  if (req.body && typeof req.body === "object") {
    sanitizarObjeto(req.body);
  }
  if (req.query && typeof req.query === "object") {
    sanitizarObjeto(req.query);
  }
  next();
}

function sanitizarObjeto(obj) {
  for (const key of Object.keys(obj)) {
    // Bloquear NoSQL injection ($gt, $ne, etc.)
    if (key.startsWith("$")) {
      delete obj[key];
      continue;
    }
    if (typeof obj[key] === "string") {
      // Remover caracteres perigosos para scripts
      obj[key] = obj[key].replace(/<script[^>]*>.*?<\/script>/gi, "");
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      sanitizarObjeto(obj[key]);
    }
  }
}

// ============================================
// CORS CONFIGURÁVEL
// ============================================
export function getCorsConfig() {
  const origins = process.env.CORS_ORIGIN?.split(",").map(o => o.trim()) || ["*"];
  return {
    origin: origins.includes("*") ? true : origins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400
  };
}
