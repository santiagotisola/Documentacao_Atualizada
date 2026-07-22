import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import routes from "./routes.js";
import { authMiddleware } from "./auth.js";
import { conectar as conectarAxHub } from "./services/axhub-db.js";
import { conectar as conectarAxTon } from "./services/axton-db.js";
import { iniciarWhatsApp } from "./services/whatsapp.service.js";
import { processarMensagemWA } from "./whatsapp-flow.js";
import { conectar as conectarAxCross } from "./services/axcross-db.js";
import { iniciar as iniciarPolling } from "./scheduler.js";
import { iniciarColetaPNCP } from "./scheduler.js";
import { iniciarTicketClosedPoller } from "./ticket-closed-poller.js";
import { axioniAgent } from "./agent/agent.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// ─── Proteção contra crash por erros não tratados ─────────────────────────────
process.on("uncaughtException", (err, origin) => {
  console.error("🔥 [uncaughtException] origin:", origin);
  console.error("🔥 [uncaughtException] message:", err.message);
  console.error("🔥 [uncaughtException] stack:", err.stack);
  // Não encerrar o processo para manter a API online
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("🔥 [unhandledRejection] message:", reason?.message || reason);
  console.error("🔥 [unhandledRejection] stack:", reason?.stack || "(no stack)");
});
process.on("exit", (code) => {
  console.error(`⚠️  [process] Encerrando com código ${code}`);
});

const app = express();

// ─── Segurança ────────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // permite widgets embutidos
  contentSecurityPolicy: false                            // CSP gerenciado pelo Docusaurus
}));

// Rate limiting: 120 req/min por IP (anti-DDoS / anti-scraping)
const limiter = rateLimit({
  windowMs: 60_000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: "Muitas requisições. Tente novamente em 1 minuto." }
});
app.use("/api", limiter);

app.use(express.json({ limit: "5mb" }));

// CorrelationId — injeta x-request-id em toda requisição para rastreabilidade
app.use((req, res, next) => {
  const id = req.headers["x-request-id"] || randomUUID();
  req.requestId = id;
  res.setHeader("x-request-id", id);
  next();
});

// CORS para painel React (dev) — deve vir ANTES do authMiddleware
// para que preflight OPTIONS passe sem token
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = (process.env.CORS_ORIGIN || "http://localhost:3017,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:3014,http://localhost:3015").split(",").map(s => s.trim());
  if (allowed.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-token, x-admin-token, x-request-id");
  res.header("Access-Control-Expose-Headers", "x-request-id");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Servir imagens operacionais salvas (análise) como arquivos estáticos
// Rota: GET /uploads/analise/{sistema}/{arquivo}
// ≠ docs/img/ (screenshots de manuais — servidos pelo Docusaurus)
app.use("/uploads/analise", express.static(path.join(__dirname, "../uploads/analise")));

// Servir documentos públicos (Política de Privacidade LGPD, etc.)
// Rota: GET /public/{arquivo}
app.use("/public", express.static(path.join(__dirname, "../public")));

// ─── Rotas AxionIA v4.0 (36 Engines) - SEM AUTH ──────────────────────────────
import cutiRoutes from "./routes/cuti.routes.js";
import scenariosRoutes from "./routes/scenarios.routes.js";
import orchestratorRoutes from "./routes/orchestrator.routes.js";
import automatedValidationRoutes, { initializeScheduler } from "./routes/automated-validation.routes.js";
import manualScriptsRoutes from "./routes/manual-scripts.routes.js";

// Estas rotas NÃO requerem autenticação (uso interno do painel)
// IMPORTANTE: Devem vir ANTES do authMiddleware
app.use("/api/cuti", cutiRoutes);
app.use("/api/scenarios", scenariosRoutes);
app.use("/api/orchestrator", orchestratorRoutes);
app.use("/api/automated-validation", automatedValidationRoutes);
app.use("/api/manual-scripts", manualScriptsRoutes);

// ─── Rotas AxionIA v4.0 já registradas acima (sem auth) ──────────────────────

// ─── Autenticação JWT (exceto rotas públicas e AxionIA) ──────────────────────
// Autenticação — protege todos os endpoints /api (exceto rotas públicas e AxionIA acima)
app.use("/api", authMiddleware);

// Demais rotas COM autenticação
app.use("/api", routes);

// Rota raiz — status da API
app.get("/", (req, res) => {
  res.json({
    nome: "AxionIA API",
    versao: "4.0", // Atualizado para v4.0
    status: "online",
    engines: 36, // 36 engines ativos (Discovery, Generation, Validation, Intelligence, Autonomous)
    modesAutonomous: ['discover_only', 'full_validation', 'continuous_monitoring', 'regression', 'exploratory', 'comparison', 'learning'],
    endpoints: {
      chat: "POST /api/chat",
      helpdesk: "GET /api/helpdesk/tickets",
      criarChamado: "POST /api/helpdesk/criar",
      logs: "GET /api/logs/historico",
      cuti: "POST /api/cuti/execute",
      scenarios: "GET /api/scenarios",
      recordStart: "POST /api/scenarios/record/start",
      recordStop: "POST /api/scenarios/record/stop",
      orchestrator: "POST /api/orchestrator/execute",
      modes: "GET /api/orchestrator/modes",
      kb: "GET /api/kb",
      axhub: "GET /api/axhub/status",
      axton: "GET /api/axton/status",
      axcross: "GET /api/axcross/status"
    }
  });
});

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/axion-ia";

async function iniciar() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("📦 MongoDB conectado:", MONGO_URI);
  } catch (err) {
    console.warn("⚠️  MongoDB indisponível — rodando sem embeddings:", err.message);
  }

  // SQL Server (AxHub)
  if (process.env.AXHUB_DB_USER) {
    try {
      await conectarAxHub();
    } catch (err) {
      console.warn("⚠️  SQL Server (AxHub) indisponível:", err.message);
    }
  } else {
    console.log("ℹ️  SQL Server (AxHub) não configurado — defina AXHUB_DB_* no .env");
  }

  // SQL Server (AxTon)
  if (process.env.AXTON_DB_USER) {
    try {
      await conectarAxTon();
    } catch (err) {
      console.warn("⚠️  SQL Server (AxTon) indisponível:", err.message);
    }
  } else {
    console.log("ℹ️  SQL Server (AxTon) não configurado — defina AXTON_DB_* no .env");
  }

  // SQL Server (AxCross)
  if (process.env.AXCROSS_DB_USER) {
    try {
      await conectarAxCross();
    } catch (err) {
      console.warn("⚠️  SQL Server (AxCross) indisponível:", err.message);
    }
  } else {
    console.log("ℹ️  SQL Server (AxCross) não configurado — defina AXCROSS_DB_* no .env");
  }

  app.listen(PORT, async () => {
    console.log(`🚀 AxionIA API rodando na porta ${PORT}`);

    // Inicializar scheduler de validações automáticas
    try {
      await initializeScheduler();
      console.log('✅ Scheduler de validações automáticas inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar scheduler:', error);
    }

    // Iniciar polling automático do Jitbit (se credenciais configuradas)
    const temToken = !!process.env.JITBIT_TOKEN;
    const jitbitUrl = process.env.JITBIT_URL || "https://desk.axiontecnologia.com.br/helpdesk";
    const jitbitUser = process.env.JITBIT_USER || "Santiago@axiontecnologia.com.br";
    const jitbitPass = process.env.JITBIT_PASS || "Axion#2026";
    const temBasic = !!(jitbitUrl && jitbitUser && jitbitPass);
    if (temToken || temBasic) {
      const intervalo = process.env.POLLING_INTERVAL || 2;
      const authTipo = temToken ? "Bearer Token" : "Basic Auth";
      iniciarPolling(intervalo);
      console.log(`🔑 Jitbit auth: ${authTipo}`);

      // Monitorar tickets fechados para enviar pesquisa de satisfação
      iniciarTicketClosedPoller();
    } else {
      console.log("ℹ️  Polling Jitbit inativo — configure JITBIT_TOKEN (ou JITBIT_USER+PASS) no .env");
    }

    // Coleta automática PNCP (ativada com PNCP_COLETA_ATIVA=true no .env)
    iniciarColetaPNCP();

    // AxionAgent — scheduler autônomo (ativado com AGENT_INTERVAL=N no .env)
    axioniAgent.iniciarScheduler();

    // Auto-start WhatsApp (se auth existir em whatsapp-auth/)
    if (process.env.WHATSAPP_AUTOSTART !== "false") {
      iniciarWhatsApp(processarMensagemWA).then(() => {
        console.log("📱 [WhatsApp] Auto-start concluído");
      }).catch(err => {
        console.warn("⚠️  [WhatsApp] Auto-start falhou (inicie manualmente via painel):", err.message);
      });
    }
  });
}

iniciar();
