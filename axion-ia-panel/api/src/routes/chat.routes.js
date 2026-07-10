/**
 * 💬 CHAT & IA ROUTES
 * 
 * Rotas para chat IA, logs, embeddings e knowledge base
 * 
 * @module routes/chat
 * @created 2026-06-21
 * @refactor Fase 1 - Quick Wins
 */

import express from "express";
import { processarMensagem, consultarHistorico, consultarPendentes, consultarEstatisticas, treinarIA, consultarLogsMongo, consultarAnalise, listarEntradasKB } from "../controller.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════
// CHAT IA
// ═══════════════════════════════════════════════════════════════════

router.post("/chat", processarMensagem);

// ═══════════════════════════════════════════════════════════════════
// LOGS
// ═══════════════════════════════════════════════════════════════════

router.get("/logs/historico", consultarHistorico);
router.get("/logs/pendentes", consultarPendentes);
router.get("/logs/estatisticas", consultarEstatisticas);
router.get("/logs", consultarLogsMongo);

// ═══════════════════════════════════════════════════════════════════
// EMBEDDINGS & KNOWLEDGE BASE
// ═══════════════════════════════════════════════════════════════════

router.post("/treinar", treinarIA);
router.get("/analise", consultarAnalise);
router.get("/kb", listarEntradasKB);

export default router;
