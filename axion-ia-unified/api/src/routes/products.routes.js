/**
 * 🚦 PRODUCTS ROUTES
 * 
 * Rotas para produtos Axion: AxHub, AxTon, AxCross
 * Inclui diagnóstico de medição e relatórios
 * 
 * @module routes/products
 * @created 2026-06-21
 * @refactor Fase 1 - Quick Wins
 */

import express from "express";
import { statusConexao, resumoGeral, listarEquipamentos, listarOperacoes, statsInfracoes, heartbeatEquipamentos, listarTabelas, listarMonitoramentos, ultimasPassagens, statsTriagens } from "../axhub-controller.js";
import { statusConexao as axtonStatus, resumoGeral as axtonResumo, listarTabelas as axtonTabelas, ultimasPesagens as axtonPesagens, ultimasInfracoes as axtonInfracoes, heartbeatEquipamentos as axtonHeartbeat } from "../axton-controller.js";
import { statusConexao as axcrossStatus, resumoGeral as axcrossResumo, listarEquipamentos as axcrossEquipamentos, statsPassagens as axcrossPassagens, heartbeatEquipamentos as axcrossHeartbeat, listarTabelas as axcrossTabelas, listarLocais as axcrossLocais, listarOperacoes as axcrossOperacoes } from "../axcross-controller.js";
import { listarSistemas, listarEquipamentos as medicaoListarEquipamentos, gerarDiagnostico, analisarSistema } from "../medicao-controller.js";
import { relatorioPassagens, relatorioImagens, listarEquipamentosRelatorio } from "../relatorio-controller.js";
import { listarContratosHandler, listarTiposHandler, gerarRelatorioHandler, listarRelatoriosHandler, obterRelatorioHandler, removerRelatorioHandler } from "../relatorio-contrato-controller.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════
// AXHUB
// ═══════════════════════════════════════════════════════════════════

router.get("/axhub/status", statusConexao);
router.get("/axhub/resumo", resumoGeral);
router.get("/axhub/equipamentos", listarEquipamentos);
router.get("/axhub/operacoes", listarOperacoes);
router.get("/axhub/infracoes", statsInfracoes);
router.get("/axhub/heartbeat", heartbeatEquipamentos);
router.get("/axhub/monitoramentos", listarMonitoramentos);
router.get("/axhub/passagens", ultimasPassagens);
router.get("/axhub/triagens", statsTriagens);
router.get("/axhub/tabelas", listarTabelas);

// ═══════════════════════════════════════════════════════════════════
// AXTON
// ═══════════════════════════════════════════════════════════════════

router.get("/axton/status", axtonStatus);
router.get("/axton/resumo", axtonResumo);
router.get("/axton/pesagens", axtonPesagens);
router.get("/axton/infracoes", axtonInfracoes);
router.get("/axton/heartbeat", axtonHeartbeat);
router.get("/axton/tabelas", axtonTabelas);

// ═══════════════════════════════════════════════════════════════════
// AXCROSS
// ═══════════════════════════════════════════════════════════════════

router.get("/axcross/status", axcrossStatus);
router.get("/axcross/resumo", axcrossResumo);
router.get("/axcross/equipamentos", axcrossEquipamentos);
router.get("/axcross/locais", axcrossLocais);
router.get("/axcross/operacoes", axcrossOperacoes);
router.get("/axcross/passagens", axcrossPassagens);
router.get("/axcross/heartbeat", axcrossHeartbeat);
router.get("/axcross/tabelas", axcrossTabelas);

// ═══════════════════════════════════════════════════════════════════
// DIAGNÓSTICO DE MEDIÇÃO
// ═══════════════════════════════════════════════════════════════════

router.get("/medicao/sistemas", listarSistemas);
router.get("/medicao/equipamentos", medicaoListarEquipamentos);
router.get("/medicao/diagnostico", gerarDiagnostico);
router.get("/medicao/analise-sistema", analisarSistema);

// ═══════════════════════════════════════════════════════════════════
// RELATÓRIOS
// ═══════════════════════════════════════════════════════════════════

// Relatórios de Fluxo Diário (AxHub)
router.get("/relatorio/passagens", relatorioPassagens);
router.get("/relatorio/imagens", relatorioImagens);
router.get("/relatorio/equipamentos", listarEquipamentosRelatorio);

// Relatórios por Contrato (IA)
router.get("/relatorio-contrato/contratos", listarContratosHandler);
router.get("/relatorio-contrato/tipos", listarTiposHandler);
router.post("/relatorio-contrato/gerar", gerarRelatorioHandler);
router.get("/relatorio-contrato", listarRelatoriosHandler);
router.get("/relatorio-contrato/:id", obterRelatorioHandler);
router.delete("/relatorio-contrato/:id", removerRelatorioHandler);

export default router;
