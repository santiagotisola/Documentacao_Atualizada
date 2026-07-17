/**
 * ⚙️ ADMIN & CONFIG ROUTES
 * 
 * Rotas para configuração, admin, docs, agent scheduler
 * 
 * @module routes/admin
 * @created 2026-06-21
 * @refactor Fase 1 - Quick Wins
 */

import express from "express";
import { obterConfig, salvarConfig, testarMongo } from "../config-controller.js";
import { gerarDoc, salvarDoc, listarImagens, listarSecoes } from "../doc-controller.js";
import { uploadMiddlewareComErro, uploadContexto } from "../upload-controller.js";
import { reindexarDocs, reindexarJitbit, statsKB, limparModuloKB } from "../admin-controller.js";
import { runAgent, runAgentMode, getAgentState, getSchedulerStatus, startScheduler, stopScheduler } from "../agent-controller.js";
import { healthCheck } from "../health-controller.js";
import { listarFilaHandler, obterEstatisticasHandler, obterItemHandler, marcarRevisadoHandler, autoResolverHandler, exportarCsvHandler, descartarItemHandler } from "../confidence-controller.js";
import { corrigirEquipamento, lerConfigEquipamento, aplicarConfigEquipamento } from "../services/itscam-automation.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════════════

router.get("/config", obterConfig);
router.post("/config", salvarConfig);
router.post("/config/testar-mongo", testarMongo);

// ═══════════════════════════════════════════════════════════════════
// GERAÇÃO DE DOCUMENTAÇÃO
// ═══════════════════════════════════════════════════════════════════

router.post("/doc/gerar", gerarDoc);
router.post("/doc/salvar", salvarDoc);
router.get("/doc/imagens/:produto", listarImagens);
router.get("/doc/secoes/:produto", listarSecoes);
router.post("/doc/upload-contexto", uploadMiddlewareComErro, uploadContexto);

// ═══════════════════════════════════════════════════════════════════
// ADMIN - KNOWLEDGE BASE
// ═══════════════════════════════════════════════════════════════════

router.get("/admin/kb/stats", statsKB);
router.post("/admin/reindexar-docs", reindexarDocs);
router.post("/admin/reindexar-jitbit", reindexarJitbit);
router.delete("/admin/kb/:modulo", limparModuloKB);

// ═══════════════════════════════════════════════════════════════════
// AGENT SCHEDULER
// ═══════════════════════════════════════════════════════════════════

router.post("/agent/run", runAgent);
router.post("/agent/run/:mode", runAgentMode);
router.get("/agent/state", getAgentState);
router.get("/agent/scheduler", getSchedulerStatus);
router.post("/agent/scheduler/start", startScheduler);
router.post("/agent/scheduler/stop", stopScheduler);

// ═══════════════════════════════════════════════════════════════════
// PROXY DE URL (para análise de sistemas externos)
// ═══════════════════════════════════════════════════════════════════

router.post("/proxy/fetch-url", async (req, res) => {
  const { url, method = "GET", headers = {}, body } = req.body || {};
  if (!url || typeof url !== "string") {
    return res.status(400).json({ erro: "Parâmetro 'url' obrigatório" });
  }
  // Validação básica: somente URLs HTTP/HTTPS
  if (!/^https?:\/\//i.test(url)) {
    return res.status(400).json({ erro: "URL deve começar com http:// ou https://" });
  }
  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 15000);
    const fetchOpts = {
      method,
      headers: { "User-Agent": "AxionIA-Proxy/1.0", ...headers },
      signal: ctrl.signal,
    };
    if (body && method !== "GET") fetchOpts.body = typeof body === "string" ? body : JSON.stringify(body);
    const response = await fetch(url, fetchOpts);
    clearTimeout(timeout);
    const contentType = response.headers.get("content-type") || "";
    let data;
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Extrair token JWT do cookie 'auth' se presente (ITSCAM login)
    let jwtToken = null;
    const setCookie = response.headers.get("set-cookie");
    if (setCookie && setCookie.includes("auth=")) {
      try {
        const cookieVal = decodeURIComponent(setCookie.match(/auth=([^;]+)/)?.[1] || "");
        const authObj = JSON.parse(cookieVal);
        if (authObj?.token) jwtToken = authObj.token;
      } catch (_) {}
    }
    // Also try to get token from JSON response body
    if (!jwtToken && data?.token) jwtToken = data.token;

    return res.json({
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      contentType,
      data,
      token: jwtToken,
      url,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ erro: err.message, url });
  }
});

// ═══════════════════════════════════════════════════════════════════
// ITSCAM AUTOMATION — Login + Correção automática via Playwright
// ═══════════════════════════════════════════════════════════════════

// POST /api/itscam/corrigir — aplica CR-01 + CR-02 em um equipamento
router.post("/itscam/corrigir", async (req, res) => {
  const { tunnelUrl, minProbability = 60, useClassifierResult = true } = req.body || {};
  if (!tunnelUrl) return res.status(400).json({ erro: "tunnelUrl obrigatório" });
  try {
    const result = await corrigirEquipamento(tunnelUrl, { minProbability, useClassifierResult });
    return res.json({ ok: result.ok, ...result });
  } catch (e) {
    return res.status(500).json({ ok: false, erro: e.message });
  }
});

// POST /api/itscam/corrigir-lote — aplica correções em múltiplos equipamentos
router.post("/itscam/corrigir-lote", async (req, res) => {
  const { equipamentos = [], minProbability = 60, useClassifierResult = true } = req.body || {};
  if (!equipamentos.length) return res.status(400).json({ erro: "equipamentos[] obrigatório" });
  
  const resultados = [];
  for (const eq of equipamentos) {
    if (!eq.tunnelUrl) { resultados.push({ nome: eq.nome, ok: false, erro: "sem tunnelUrl" }); continue; }
    try {
      const r = await corrigirEquipamento(eq.tunnelUrl, { minProbability, useClassifierResult });
      resultados.push({ nome: eq.nome, ...r });
    } catch (e) {
      resultados.push({ nome: eq.nome, ok: false, erro: e.message });
    }
  }
  
  return res.json({
    ok: true,
    total: resultados.length,
    sucesso: resultados.filter(r => r.ok).length,
    falhas: resultados.filter(r => !r.ok).length,
    resultados,
  });
});

// POST /api/itscam/ler-config — lê configuração atual do equipamento
router.post("/itscam/ler-config", async (req, res) => {
  const { tunnelUrl } = req.body || {};
  if (!tunnelUrl) return res.status(400).json({ erro: "tunnelUrl obrigatório" });
  try {
    const result = await lerConfigEquipamento(tunnelUrl);
    return res.json(result);
  } catch (e) {
    return res.status(500).json({ ok: false, erro: e.message });
  }
});

// POST /api/itscam/aplicar-config — aplica campos específicos (De-Para)
router.post("/itscam/aplicar-config", async (req, res) => {
  const { tunnelUrl, campos } = req.body || {};
  if (!tunnelUrl || !campos) return res.status(400).json({ erro: "tunnelUrl e campos obrigatórios" });
  try {
    const result = await aplicarConfigEquipamento(tunnelUrl, campos);
    return res.json(result);
  } catch (e) {
    return res.status(500).json({ ok: false, erro: e.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════

router.get("/health", healthCheck);

// ═══════════════════════════════════════════════════════════════════
// CONFIDENCE QUEUE (Fila de Baixa Confiança)
// ═══════════════════════════════════════════════════════════════════

router.get("/confidence/fila", listarFilaHandler);
router.get("/confidence/estatisticas", obterEstatisticasHandler);
router.get("/confidence/item/:id", obterItemHandler);
router.post("/confidence/item/:id/revisar", marcarRevisadoHandler);
router.post("/confidence/item/:id/auto-resolver", autoResolverHandler);
router.post("/confidence/item/:id/descartar", descartarItemHandler);
router.get("/confidence/exportar-csv", exportarCsvHandler);

export default router;
