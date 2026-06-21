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
