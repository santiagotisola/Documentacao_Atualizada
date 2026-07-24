/**
 * depara-equipamentos.routes.js
 * Rotas do Depara de Equipamentos AxHub × AxCross
 */

import express from "express";
import { compararEquipamentos, compararMultiContratos, buscarAxHubDireto, compararComListaHub, receberHubData, obterHubData, statusStore, capturarTodosAxHub } from "../depara-equipamentos-controller.js";

const router = express.Router();

router.post("/depara-equipamentos/comparar",        compararEquipamentos);
router.post("/depara-equipamentos/multi",            compararMultiContratos);
router.post("/depara-equipamentos/axhub-direto",     buscarAxHubDireto);
router.post("/depara-equipamentos/com-lista-hub",    compararComListaHub);
router.post("/depara-equipamentos/receive-hub-data", receberHubData);
router.get("/depara-equipamentos/hub-data/:key",     obterHubData);
router.get("/depara-equipamentos/store-status",      statusStore);
router.post("/depara-equipamentos/capturar-todos",   capturarTodosAxHub);

export default router;
