/**
 * depara-equipamentos.routes.js
 * Rotas do Depara de Equipamentos AxHub × AxCross
 */

import express from "express";
import { compararEquipamentos, compararMultiContratos, buscarAxHubDireto, compararComListaHub } from "../depara-equipamentos-controller.js";

const router = express.Router();

router.post("/depara-equipamentos/comparar",     compararEquipamentos);
router.post("/depara-equipamentos/multi",         compararMultiContratos);
router.post("/depara-equipamentos/axhub-direto",  buscarAxHubDireto);
// Aceita lista pré-buscada do AxHub + busca AxCross automaticamente
router.post("/depara-equipamentos/com-lista-hub", compararComListaHub);

export default router;
