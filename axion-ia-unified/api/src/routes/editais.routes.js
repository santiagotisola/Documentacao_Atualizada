/**
 * 🏛️ EDITAIS & CONFORMIDADE ROUTES
 * 
 * Rotas para PNCP, conformidade, roadmap, specs e análise de editais
 * 
 * @module routes/editais
 * @created 2026-06-21
 * @refactor Fase 1 - Quick Wins
 */

import express from "express";
import { buscarPNCP, importarSelecionados, coletarProduto, obterConfig as coletorConfig, salvarConfig as coletorSalvar, statusColetor, listarOperacoes as coletorOperacoes } from "../coletor-controller.js";
import { adicionarFonte, listarFontes, obterFonte, removerFonte, analisarFonteById, mapaCobertura, sugestoesPorProduto } from "../fontes-controller.js";
import { gerarRoadmapHandler, listarRoadmapsHandler, obterRoadmapHandler, atualizarItemHandler, adicionarItemHandler } from "../roadmap-controller.js";
import { gerarSpecHandler, listarSpecsHandler, obterSpecHandler, atualizarStatusSpecHandler } from "../spec-controller.js";
import { gerarConformidadeHandler, listarConformidadeHandler, obterConformidadeHandler, removerConformidadeHandler, gerarAnalisaMultiProdutoHandler, obterAnalisaMultiProdutoHandler, listarAnalisasMultiProdutoHandler, obterComparacaoHandler, obterLacunasHandler, obterRecomendacoesHandler } from "../conformidade-controller.js";
import { buscarEditaisGovHandler, importarEditalHandler, analisarEditalRapidoHandler, listarEditaisImportadosHandler, autoAnalisarTodosHandler, analiseAvancadaHandler, uploadEditalHandler, uploadEditalMiddleware, listarSitesHandler } from "../edital-controller.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════
// COLETOR PNCP
// ═══════════════════════════════════════════════════════════════════

router.get("/coletor/operacoes", coletorOperacoes);
router.get("/coletor/pncp", buscarPNCP);
router.post("/coletor/pncp/importar", importarSelecionados);
router.post("/coletor/pncp/coletar", coletarProduto);
router.get("/coletor/config", coletorConfig);
router.post("/coletor/config", coletorSalvar);
router.get("/coletor/status", statusColetor);

// ═══════════════════════════════════════════════════════════════════
// FONTES DE PESQUISA
// ═══════════════════════════════════════════════════════════════════

router.post("/fontes", adicionarFonte);
router.get("/fontes", listarFontes);
router.get("/fontes/mapa/:produto", mapaCobertura);
router.get("/fontes/sugestoes/:produto", sugestoesPorProduto);
router.get("/fontes/:id", obterFonte);
router.post("/fontes/:id/analisar", analisarFonteById);
router.delete("/fontes/:id", removerFonte);

// ═══════════════════════════════════════════════════════════════════
// ROADMAP
// ═══════════════════════════════════════════════════════════════════

router.post("/roadmap/gerar", gerarRoadmapHandler);
router.get("/roadmap", listarRoadmapsHandler);
router.get("/roadmap/:id", obterRoadmapHandler);
router.patch("/roadmap/:id/item/:itemId", atualizarItemHandler);
router.post("/roadmap/:id/item", adicionarItemHandler);

// ═══════════════════════════════════════════════════════════════════
// SPECS / PRD
// ═══════════════════════════════════════════════════════════════════

router.post("/spec/gerar", gerarSpecHandler);
router.get("/spec", listarSpecsHandler);
router.get("/spec/:id", obterSpecHandler);
router.patch("/spec/:id/status", atualizarStatusSpecHandler);

// ═══════════════════════════════════════════════════════════════════
// CONFORMIDADE COM EDITAIS
// ═══════════════════════════════════════════════════════════════════

// Análise Multi-Produto (AxHub + AxTon + AxCross simultâneos)
router.post("/conformidade/multi/gerar", gerarAnalisaMultiProdutoHandler);
router.get("/conformidade/multi", listarAnalisasMultiProdutoHandler);
router.get("/conformidade/multi/:id/comparacao", obterComparacaoHandler);
router.get("/conformidade/multi/:id/lacunas", obterLacunasHandler);
router.get("/conformidade/multi/:id/recomendacoes", obterRecomendacoesHandler);
router.get("/conformidade/multi/:id", obterAnalisaMultiProdutoHandler);

// Conformidade Simples (Um Produto por Vez)
router.post("/conformidade/gerar", gerarConformidadeHandler);
router.get("/conformidade", listarConformidadeHandler);
router.get("/conformidade/:id", obterConformidadeHandler);
router.delete("/conformidade/:id", removerConformidadeHandler);

// ═══════════════════════════════════════════════════════════════════
// EDITAIS GOV.BR
// ═══════════════════════════════════════════════════════════════════

router.get("/editais-gov/buscar", buscarEditaisGovHandler);
router.post("/editais-gov/importar", importarEditalHandler);
router.post("/editais-gov/analisar-rapido", analisarEditalRapidoHandler);
router.get("/editais-gov/importados", listarEditaisImportadosHandler);
router.post("/editais-gov/auto-analisar", autoAnalisarTodosHandler);
router.post("/editais-gov/analise-avancada", analiseAvancadaHandler);
router.post("/editais-gov/upload", uploadEditalMiddleware, uploadEditalHandler);
router.get("/editais-gov/sites", listarSitesHandler);

export default router;
