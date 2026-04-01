import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import routes from "./routes.js";
import { conectar as conectarAxHub } from "./services/axhub-db.js";
import { conectar as conectarAxTon } from "./services/axton-db.js";
import { conectar as conectarAxCross } from "./services/axcross-db.js";
import { iniciar as iniciarPolling } from "./scheduler.js";

dotenv.config();

const app = express();
app.use(express.json());

// CORS para painel React (dev)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = (process.env.CORS_ORIGIN || "http://localhost:3001,http://localhost:3003").split(",");
  if (allowed.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use("/api", routes);

// Rota raiz — status da API
app.get("/", (req, res) => {
  res.json({
    nome: "AxionIA API",
    versao: "2.0",
    status: "online",
    endpoints: {
      chat: "POST /api/chat",
      helpdesk: "GET /api/helpdesk/tickets",
      criarChamado: "POST /api/helpdesk/criar",
      logs: "GET /api/logs/historico",
      kb: "GET /api/kb",
      axhub: "GET /api/axhub/status",
      axton: "GET /api/axton/status"
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

  app.listen(PORT, () => {
    console.log(`🚀 AxionIA API rodando na porta ${PORT}`);

    // Iniciar polling automático do Jitbit (se credenciais configuradas)
    if (process.env.JITBIT_URL && process.env.JITBIT_USER && process.env.JITBIT_PASS) {
      const intervalo = process.env.POLLING_INTERVAL || 2;
      iniciarPolling(intervalo);
    } else {
      console.log("ℹ️  Polling Jitbit inativo — configure JITBIT_URL, JITBIT_USER e JITBIT_PASS no .env");
    }
  });
}

iniciar();
