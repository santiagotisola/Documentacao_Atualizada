/**
 * auth.js — Middleware de autenticação por Bearer Token
 *
 * Todas as rotas /api/* são protegidas por um token estático definido no .env:
 *   API_TOKEN=<seu-token-secreto>
 *
 * Se API_TOKEN não estiver configurado, a API roda sem auth
 * (compatibilidade retroativa — exibe warning no boot).
 *
 * Uso:
 *   Authorization: Bearer <API_TOKEN>
 *   — ou —
 *   x-api-token: <API_TOKEN>   (alternativa para widgets/scripts sem suporte a Bearer)
 *
 * Rotas públicas (sem token):
 *   GET /  (status da API)
 *   POST /api/chat  (widget de suporte — acesso público intencional)
 */

const TOKEN = process.env.API_TOKEN || "";

if (!TOKEN) {
  console.warn(
    "⚠️  [auth] API_TOKEN não configurado — API rodando SEM autenticação. " +
    "Defina API_TOKEN=<token-seguro> no .env para proteger os endpoints administrativos."
  );
}

// Rotas que NÃO requerem token mesmo com API_TOKEN configurado
// NOTA: paths sem prefixo /api porque o middleware é montado em app.use("/api", authMiddleware)
const ROTAS_PUBLICAS = [
  { method: "POST", path: "/chat" },
  { method: "GET",  path: "/axhub/status" },
  { method: "GET",  path: "/axton/status" },
  { method: "GET",  path: "/axcross/status" },
  { method: "GET",  path: "/health" },
  { method: "GET",  path: "/varco/frota" },
  { method: "GET",  path: "/varco/auditoria" },
  { method: "GET",  path: "/varco/auditoria-aprimorada" },
  { method: "GET",  path: "/varco/config-padrao" },
  { method: "POST", path: "/varco/recoleta" },
  { method: "GET",  path: "/varco/plano-correcao" },
  { method: "POST", path: "/varco/gerar-plano" },
  { method: "POST", path: "/varco/aplicar-correcao" },
];

function rotaPublica(req) {
  return ROTAS_PUBLICAS.some(
    r => r.method === req.method && req.path.startsWith(r.path)
  );
}

export function authMiddleware(req, res, next) {
  // Sem token configurado → sem proteção (retrocompatibilidade)
  if (!TOKEN) return next();

  // Rotas públicas passam direto
  if (rotaPublica(req)) return next();

  const authHeader = req.headers["authorization"] || "";
  const headerToken = req.headers["x-api-token"] || "";

  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const received = bearer || headerToken;

  if (!received) {
    return res.status(401).json({
      erro: "Token de autenticação ausente.",
      hint: "Envie 'Authorization: Bearer <token>' ou 'x-api-token: <token>'"
    });
  }

  // Comparação em tempo constante (previne timing attack)
  if (!timingSafeEqual(received, TOKEN)) {
    return res.status(403).json({ erro: "Token inválido." });
  }

  next();
}

// Comparação segura sem depender de crypto (disponível apenas em Node 15+)
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
