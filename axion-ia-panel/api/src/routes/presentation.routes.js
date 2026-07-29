/**
 * presentation.routes.js
 * Presentation Engine — PDF, DOCX, PPTX + Studio Enterprise
 */

import express from "express";
import { gerarPDF, gerarDOCX, gerarPPTX, gerarRelatorioPDF, listarTemplates } from "../presentation-controller.js";
import { gerarProjeto, analisarImpacto, aplicarUpdate, statusProjeto, executarAgente } from "../presentation-studio-controller.js";

const router = express.Router();

// ─── GERAÇÃO CLÁSSICA ─────────────────────────────────────────────────────────
router.post("/presentation/pdf",              gerarPDF);
router.post("/presentation/docx",             gerarDOCX);
router.post("/presentation/pptx",             gerarPPTX);
router.get("/presentation/templates",         listarTemplates);
router.post("/presentation/relatorio-missao", gerarRelatorioPDF);

// ─── STUDIO ENTERPRISE ────────────────────────────────────────────────────────
// POST /api/presentation/generate  — Gera projeto completo a partir do projeto.json
router.post("/presentation/generate",         gerarProjeto);

// POST /api/presentation/impact     — Analisa impacto de um arquivo alterado
router.post("/presentation/impact",           analisarImpacto);

// POST /api/presentation/update     — Aplica cascade de atualizações (confirmado)
router.post("/presentation/update",           aplicarUpdate);

// GET  /api/presentation/status     — Status do último projeto gerado
router.get("/presentation/status",            statusProjeto);

// POST /api/presentation/agent      — Executa um agente específico do pipeline
router.post("/presentation/agent",            executarAgente);

// POST /api/presentation/pipeline   — Executa pipeline completo (usado pelo painel)
router.post("/presentation/pipeline",         gerarProjeto);

export default router;
