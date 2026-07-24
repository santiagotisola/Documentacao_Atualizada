/**
 * depara-equipamentos.routes.js
 * Rotas do Depara de Equipamentos AxHub × AxCross
 */

import express from "express";
import { compararEquipamentos, compararMultiContratos, buscarAxHubDireto } from "../depara-equipamentos-controller.js";

const router = express.Router();

// POST /api/depara-equipamentos/comparar
router.post("/depara-equipamentos/comparar", compararEquipamentos);

// POST /api/depara-equipamentos/multi
router.post("/depara-equipamentos/multi", compararMultiContratos);

// POST /api/depara-equipamentos/axhub-direto — busca dados AxHub com cookie de sessão (sem Playwright)
router.post("/depara-equipamentos/axhub-direto", buscarAxHubDireto);

export default router;
