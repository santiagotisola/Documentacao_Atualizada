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
import { statusConexao, resumoGeral, listarEquipamentos, listarOperacoes, statsInfracoes, heartbeatEquipamentos, listarTabelas, listarMonitoramentos, ultimasPassagens, statsTriagens, mapaPassagens, deParaPassagens } from "../axhub-controller.js";
import { statusConexao as axtonStatus, resumoGeral as axtonResumo, listarTabelas as axtonTabelas, ultimasPesagens as axtonPesagens, ultimasInfracoes as axtonInfracoes, heartbeatEquipamentos as axtonHeartbeat } from "../axton-controller.js";
import { statusConexao as axcrossStatus, resumoGeral as axcrossResumo, listarEquipamentos as axcrossEquipamentos, statsPassagens as axcrossPassagens, heartbeatEquipamentos as axcrossHeartbeat, listarTabelas as axcrossTabelas, listarLocais as axcrossLocais, listarOperacoes as axcrossOperacoes, diagnosticoClassificacao as axcrossDiagnosticoClassificacao, configurarConexao as axcrossConfigurar, obterConfig as axcrossConfig, investigarUrl as axcrossInvestigar, investigarPublicoEndpoint as axcrossInvestigarPublico, classificacaoStats as axcrossClassificacaoStats, compararEquipamentos as axcrossCompararEquipamentos, compararViaUrlEndpoint as axcrossCompararViaUrl, classificacaoTimeline as axcrossClassificacaoTimeline, ecosistema as axcrossEcosistema, frotaAnalise as axcrossFrotaAnalise, mapaDados as axcrossMapaDados } from "../axcross-controller.js";
import { listarSistemas, listarEquipamentos as medicaoListarEquipamentos, gerarDiagnostico, analisarSistema } from "../medicao-controller.js";
import { relatorioPassagens, relatorioImagens, listarEquipamentosRelatorio } from "../relatorio-controller.js";
import { listarContratosHandler, listarTiposHandler, gerarRelatorioHandler, listarRelatoriosHandler, obterRelatorioHandler, removerRelatorioHandler } from "../relatorio-contrato-controller.js";
import { buscarLiveStats, buscarLiveStatsBatch } from "../sites-stats-controller.js";
import { buscarVersoesSites, statusVersoesSites } from "../sites-versions-controller.js";

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
router.get("/axhub/mapa-passagens", mapaPassagens);       // Heatmap dia×hora por equipamento
router.get("/axhub/depara-passagens", deParaPassagens);   // De-Para entre dois equipamentos

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
router.get("/axcross/diagnostico-classificacao", axcrossDiagnosticoClassificacao);
router.get("/axcross/config", axcrossConfig);
router.post("/axcross/configurar", axcrossConfigurar);
router.post("/axcross/investigar", axcrossInvestigar);
router.post("/axcross/investigar-publico", axcrossInvestigarPublico);
router.get("/axcross/classificacao-stats", axcrossClassificacaoStats);
router.get("/axcross/classificacao-timeline", axcrossClassificacaoTimeline);
router.get("/axcross/ecosistema", axcrossEcosistema);
router.get("/axcross/frota-analise", axcrossFrotaAnalise);
router.get("/axcross/mapa-dados", axcrossMapaDados);
router.post("/axcross/comparar-equipamentos", axcrossCompararEquipamentos);
router.post("/axcross/comparar-via-url", axcrossCompararViaUrl);

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

// ═══════════════════════════════════════════════════════════════════
// SITES — DADOS AO VIVO (equipamentos, heartbeat)
// ═══════════════════════════════════════════════════════════════════

router.get("/sites/live-stats", buscarLiveStats);
router.post("/sites/live-stats-batch", buscarLiveStatsBatch);
router.post("/sites/versions",        buscarVersoesSites);
router.get("/sites/versions/status",  statusVersoesSites);

export default router;
