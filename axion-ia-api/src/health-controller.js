/**
 * health-controller.js
 *
 * GET /api/health
 * Retorna status real de todos os serviços dependentes com tempo de resposta.
 * Não requer autenticação — é rota pública para monitoramento externo.
 */

import mongoose from "mongoose";
import OpenAI from "openai";
import { conectar as conectarAxHub } from "./services/axhub-db.js";
import { conectar as conectarAxTon } from "./services/axton-db.js";
import { conectar as conectarAxCross } from "./services/axcross-db.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function checarMongo() {
  const inicio = Date.now();
  try {
    if (mongoose.connection.readyState !== 1) throw new Error("não conectado");
    await mongoose.connection.db.admin().ping();
    return { ok: true, ms: Date.now() - inicio };
  } catch (err) {
    return { ok: false, ms: Date.now() - inicio, erro: err.message };
  }
}

async function checarSql(conectar, nome) {
  const inicio = Date.now();
  try {
    const pool = await conectar();
    await pool.request().query("SELECT 1 AS ok");
    return { ok: true, ms: Date.now() - inicio };
  } catch (err) {
    return { ok: false, ms: Date.now() - inicio, erro: err.message };
  }
}

async function checarOpenAI() {
  const inicio = Date.now();
  try {
    if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY não configurada");
    // Usa o endpoint mais barato — listagem de modelos (sem custo)
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      await openai.models.list({ signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
    return { ok: true, ms: Date.now() - inicio };
  } catch (err) {
    const msg = err.name === "AbortError" ? "timeout >5s" : err.message;
    return { ok: false, ms: Date.now() - inicio, erro: msg };
  }
}

export async function healthCheck(req, res) {
  const [mongo, axhub, axton, axcross, openaiStatus] = await Promise.allSettled([
    checarMongo(),
    checarSql(conectarAxHub,  "AxHub"),
    checarSql(conectarAxTon,  "AxTon"),
    checarSql(conectarAxCross,"AxCross"),
    checarOpenAI(),
  ]);

  const servicos = {
    mongodb:  mongo.value       || { ok: false, erro: mongo.reason?.message },
    axhub:    axhub.value       || { ok: false, erro: axhub.reason?.message },
    axton:    axton.value       || { ok: false, erro: axton.reason?.message },
    axcross:  axcross.value     || { ok: false, erro: axcross.reason?.message },
    openai:   openaiStatus.value|| { ok: false, erro: openaiStatus.reason?.message },
  };

  const todosOk    = Object.values(servicos).every(s => s.ok);
  const algumOk    = Object.values(servicos).some(s => s.ok);
  const statusHttp = todosOk ? 200 : algumOk ? 207 : 503;

  return res.status(statusHttp).json({
    status:    todosOk ? "healthy" : algumOk ? "degraded" : "unhealthy",
    timestamp: new Date().toISOString(),
    requestId: req.requestId || null,
    versao:    "3.0.0",
    servicos,
  });
}
