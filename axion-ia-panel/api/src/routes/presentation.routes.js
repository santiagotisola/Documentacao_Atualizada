/**
 * presentation.routes.js
 * Presentation Engine — PDF, DOCX, PPTX
 */

import express from "express";
import { gerarPDF, gerarDOCX, gerarPPTX, gerarRelatorioPDF, listarTemplates } from "../presentation-controller.js";

const router = express.Router();

// ─── GERAÇÃO ─────────────────────────────────────────────────────────────────

router.post("/presentation/pdf",              gerarPDF);
router.post("/presentation/docx",             gerarDOCX);
router.post("/presentation/pptx",             gerarPPTX);

// ─── TEMPLATES ───────────────────────────────────────────────────────────────

router.get("/presentation/templates",         listarTemplates);
router.post("/presentation/relatorio-missao", gerarRelatorioPDF);

export default router;
