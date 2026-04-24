import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.resolve(__dirname, "..", ".env");

// Chaves editáveis (whitelist)
const CHAVES_PERMITIDAS = [
  "PORT", "MONGO_URI", "CORS_ORIGIN",
  "OPENAI_API_KEY",
  "JITBIT_URL", "JITBIT_USER", "JITBIT_PASS",
  "AXHUB_DB_HOST", "AXHUB_DB_PORT", "AXHUB_DB_NAME", "AXHUB_DB_USER", "AXHUB_DB_PASS", "AXHUB_DB_ENCRYPT",
  "AXTON_DB_HOST", "AXTON_DB_PORT", "AXTON_DB_NAME", "AXTON_DB_USER", "AXTON_DB_PASS", "AXTON_DB_ENCRYPT",
  "AXCROSS_DB_HOST", "AXCROSS_DB_PORT", "AXCROSS_DB_NAME", "AXCROSS_DB_USER", "AXCROSS_DB_PASS", "AXCROSS_DB_ENCRYPT"
];

// Chaves cujo valor é mascarado no GET
const CHAVES_SENSIVEIS = ["OPENAI_API_KEY", "JITBIT_PASS", "AXHUB_DB_PASS", "AXTON_DB_PASS", "AXCROSS_DB_PASS"];

function lerEnv() {
  if (!fs.existsSync(ENV_PATH)) return {};
  const linhas = fs.readFileSync(ENV_PATH, "utf-8").split("\n");
  const obj = {};
  for (const linha of linhas) {
    const trimmed = linha.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const chave = trimmed.substring(0, idx).trim();
    const valor = trimmed.substring(idx + 1).trim();
    obj[chave] = valor;
  }
  return obj;
}

function salvarEnv(obj) {
  const linhas = [];
  const grupos = {
    api: ["PORT", "CORS_ORIGIN"],
    openai: ["OPENAI_API_KEY"],
    mongo: ["MONGO_URI"],
    jitbit: ["JITBIT_URL", "JITBIT_USER", "JITBIT_PASS"],
    axhub: ["AXHUB_DB_HOST", "AXHUB_DB_PORT", "AXHUB_DB_NAME", "AXHUB_DB_USER", "AXHUB_DB_PASS", "AXHUB_DB_ENCRYPT"],
    axton: ["AXTON_DB_HOST", "AXTON_DB_PORT", "AXTON_DB_NAME", "AXTON_DB_USER", "AXTON_DB_PASS", "AXTON_DB_ENCRYPT"],
    axcross: ["AXCROSS_DB_HOST", "AXCROSS_DB_PORT", "AXCROSS_DB_NAME", "AXCROSS_DB_USER", "AXCROSS_DB_PASS", "AXCROSS_DB_ENCRYPT"]
  };

  linhas.push("# API");
  for (const k of grupos.api) if (obj[k] !== undefined) linhas.push(`${k}=${obj[k]}`);
  linhas.push("", "# OpenAI");
  for (const k of grupos.openai) if (obj[k] !== undefined) linhas.push(`${k}=${obj[k]}`);
  linhas.push("", "# MongoDB");
  for (const k of grupos.mongo) if (obj[k] !== undefined) linhas.push(`${k}=${obj[k]}`);
  linhas.push("", "# Jitbit Helpdesk");
  for (const k of grupos.jitbit) if (obj[k] !== undefined) linhas.push(`${k}=${obj[k]}`);
  linhas.push("", "# AxHub SQL Server");
  for (const k of grupos.axhub) if (obj[k] !== undefined) linhas.push(`${k}=${obj[k]}`);
  linhas.push("", "# AxTon SQL Server");
  for (const k of grupos.axton) if (obj[k] !== undefined) linhas.push(`${k}=${obj[k]}`);
  linhas.push("", "# AxCross SQL Server");
  for (const k of grupos.axcross) if (obj[k] !== undefined) linhas.push(`${k}=${obj[k]}`);

  fs.writeFileSync(ENV_PATH, linhas.join("\n") + "\n", "utf-8");
}

function mascarar(valor) {
  if (!valor || valor.length <= 4) return "••••";
  return valor.substring(0, 3) + "•".repeat(Math.min(valor.length - 3, 12));
}

// GET /api/config — retorna configuração atual (senhas mascaradas)
export function obterConfig(req, res) {
  const env = lerEnv();

  const config = {};
  for (const chave of CHAVES_PERMITIDAS) {
    const valor = env[chave] || "";
    config[chave] = CHAVES_SENSIVEIS.includes(chave) && valor ? mascarar(valor) : valor;
  }

  // Status de conexões
  const mongoConectado = mongoose.connection.readyState === 1;

  res.json({
    config,
    conexoes: {
      mongodb: { conectado: mongoConectado, uri: env.MONGO_URI || "" },
      axhub_sql: { configurado: !!(env.AXHUB_DB_USER && env.AXHUB_DB_HOST) },
      axton_sql: { configurado: !!(env.AXTON_DB_USER && env.AXTON_DB_HOST) },
      axcross_sql: { configurado: !!(env.AXCROSS_DB_USER && env.AXCROSS_DB_HOST) }
    }
  });
}

// POST /api/config — atualiza .env (requer restart para aplicar)
export function salvarConfig(req, res) {
  const novasConfig = req.body;

  if (!novasConfig || typeof novasConfig !== "object") {
    return res.status(400).json({ erro: "Body inválido" });
  }

  try {
    // Ler env atual e mesclar somente chaves permitidas
    const envAtual = lerEnv();

    for (const [chave, valor] of Object.entries(novasConfig)) {
      if (!CHAVES_PERMITIDAS.includes(chave)) continue;
      // Ignorar valores mascarados (não sobrescrever senha com máscaras)
      if (CHAVES_SENSIVEIS.includes(chave) && /^.{0,3}•+$/.test(valor)) continue;
      envAtual[chave] = valor;
    }

    salvarEnv(envAtual);

    // Atualizar process.env em memória com valores não-sensíveis
    for (const chave of CHAVES_PERMITIDAS) {
      if (envAtual[chave] !== undefined) {
        process.env[chave] = envAtual[chave];
      }
    }

    res.json({ ok: true, mensagem: "Configuração salva. Reinicie a API para aplicar mudanças de conexão." });
  } catch (err) {
    res.status(500).json({ erro: `Erro ao gravar configuração: ${err.message}` });
  }
}

// POST /api/config/testar-mongo — testa conexão MongoDB
export async function testarMongo(req, res) {
  const { uri } = req.body || {};
  const mongoUri = uri || process.env.MONGO_URI || "mongodb://localhost:27017/axion-ia";

  try {
    if (mongoose.connection.readyState === 1) {
      return res.json({ conectado: true, uri: mongoUri });
    }
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    res.json({ conectado: true, uri: mongoUri });
  } catch (err) {
    res.json({ conectado: false, uri: mongoUri, erro: err.message });
  }
}
