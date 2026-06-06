import express from "express";
import cors from "cors";
import mongoose from "mongoose";

// === Middlewares de infraestrutura ===
import { securityHeaders, limiteGeral, limiteIA, sanitizarEntrada, getCorsConfig } from "./middlewares/seguranca.js";
import { logger } from "./middlewares/logger.js";
import { errorHandler, configurarHandlersGlobais } from "./middlewares/error-handler.js";

// === Módulos do framework ===
import { iaRouter } from "./modules/ia-engine/routes.js";
import { helpdeskRouter } from "./modules/helpdesk/routes.js";
import { whatsappRouter } from "./modules/whatsapp/routes.js";
import { erpRouter } from "./modules/erp/routes.js";
import { relatorioRouter } from "./modules/relatorios/routes.js";
import { crmRouter } from "./modules/crm/routes.js";
import { schedulerRouter, iniciarScheduler } from "./modules/scheduler/index.js";
import { webhookRouter } from "./modules/webhook/routes.js";
import { dbAdapter } from "./modules/database/adapter.js";

configurarHandlersGlobais();

const app = express();
const PORT = process.env.PORT || 3100;

// === Middlewares de segurança ===
app.use(securityHeaders);
app.use(cors(getCorsConfig()));
app.use(express.json({ limit: "10mb" }));
app.use(sanitizarEntrada);
app.use(limiteGeral);
app.use(logger.requestLogger);

// === Auth middleware (opcional) ===
if (process.env.API_TOKEN) {
  app.use("/api", (req, res, next) => {
    // Permitir webhooks sem token (usam HMAC próprio)
    if (req.path.startsWith("/webhook")) return next();
    // Permitir health check sem token
    if (req.path === "/status") return next();
    
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token !== process.env.API_TOKEN) {
      return res.status(401).json({ erro: "Token inválido" });
    }
    next();
  });
}

// === Rotas ===
app.use("/api/ia", limiteIA, iaRouter);
app.use("/api/helpdesk", helpdeskRouter);
app.use("/api/whatsapp", whatsappRouter);
app.use("/api/erp", erpRouter);
app.use("/api/relatorio", relatorioRouter);
app.use("/api/crm", crmRouter);
app.use("/api/scheduler", schedulerRouter);
app.use("/api/webhook", webhookRouter);

// === Health check ===
app.get("/api/status", async (req, res) => {
  const uptime = process.uptime();
  const memoria = process.memoryUsage();
  
  const status = {
    servidor: "online",
    timestamp: new Date().toISOString(),
    uptime_segundos: Math.round(uptime),
    uptime_humano: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
    memoria: {
      usado_mb: Math.round(memoria.heapUsed / 1024 / 1024),
      total_mb: Math.round(memoria.heapTotal / 1024 / 1024)
    },
    node_version: process.version,
    modulos: {
      ia: true,
      mongodb: mongoose.connection.readyState === 1,
      whatsapp: process.env.WHATSAPP_ENABLED === "true",
      helpdesk: !!process.env.HELPDESK_URL || process.env.HELPDESK_PLATFORM === "proprio",
      erp: !!process.env.ERP_DB_HOST || !!process.env.ERP_API_URL,
      scheduler: process.env.POLLING_ENABLED === "true",
      webhooks: true
    },
    seguranca: {
      auth_token: !!process.env.API_TOKEN,
      webhook_hmac: !!process.env.WEBHOOK_SECRET,
      rate_limit: parseInt(process.env.RATE_LIMIT_MAX) || 100
    }
  };
  res.json(status);
});

// === Error handler (DEVE ser o último middleware) ===
app.use(errorHandler);

// === Inicialização ===
async function iniciar() {
  try {
    // Conectar MongoDB
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/integracao-universal";
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB conectado:", mongoUri);

    // Inicializar conexões de banco externas (se configuradas)
    await dbAdapter.inicializarConexoes();

    // Iniciar scheduler (se habilitado)
    if (process.env.POLLING_ENABLED === "true") {
      iniciarScheduler();
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
      console.log(`📋 Status: http://localhost:${PORT}/api/status`);
      console.log(`🔒 Segurança: rate-limit=${process.env.RATE_LIMIT_MAX || 100}/min, headers=on`);
      console.log(`\n📦 Módulos ativos:`);
      console.log(`   • IA Engine:  /api/ia`);
      console.log(`   • Helpdesk:   /api/helpdesk`);
      console.log(`   • WhatsApp:   /api/whatsapp`);
      console.log(`   • ERP:        /api/erp`);
      console.log(`   • Relatórios: /api/relatorio`);
      console.log(`   • CRM:        /api/crm`);
      console.log(`   • Scheduler:  /api/scheduler`);
      console.log(`   • Webhooks:   /api/webhook\n`);
    });
  } catch (err) {
    console.error("❌ Erro ao iniciar:", err.message);
    process.exit(1);
  }
}

iniciar();
