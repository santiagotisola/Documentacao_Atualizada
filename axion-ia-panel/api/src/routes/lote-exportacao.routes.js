/**
 * lote-exportacao.routes.js
 * Rotas de automação para correção de Lotes de Exportação — AxHub
 */

import express from "express";
import { analisarLotes, corrigirLotes, detalharLote } from "../lote-exportacao-controller.js";

const router = express.Router();

// POST /api/lote-exportacao/analisar  — lista lotes com erro no site
router.post("/lote-exportacao/analisar", analisarLotes);

// POST /api/lote-exportacao/corrigir  — corrige automaticamente todos (ou um) lote(s) com erro
router.post("/lote-exportacao/corrigir", corrigirLotes);

// POST /api/lote-exportacao/detalhe   — abre detalhe de um lote específico
router.post("/lote-exportacao/detalhe", detalharLote);

export default router;
