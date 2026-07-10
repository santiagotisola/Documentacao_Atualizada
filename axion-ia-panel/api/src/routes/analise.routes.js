/**
 * 📷 ANÁLISE & OCR ROUTES
 * 
 * Rotas para análise de imagens, OCR, jobs e validações
 * 
 * @module routes/analise
 * @created 2026-06-21
 * @refactor Fase 1 - Quick Wins
 */

import express from "express";
import { uploadImagemMiddleware, analisarSemSalvar, salvarEAnalisar, listarTodas, listarPorSistema, listarPasta, compararPasta, compararPastaLocal, servirImagemExterna, removerImagem, classificarOcupacao, classificarRoda, classificarCorCamisa, classificarMochila, classificarCalca, gerarCaracteristicas, lerPlacas } from "../analise-imagem-controller.js";
import { uploadJobMiddleware, criarJobHandler, listarJobs, obterJob, removerJob } from "../job-controller.js";
import { analisarTexto, analisarArquivo, uploadLeituraMiddleware } from "../leitura-controller.js";
import { validarFluxoAlerta } from "../validate-controller.js";
import { buscarInfracoes, varreduraDuplicidades, detalheInfracao, compararInfracoes, estatisticasDuplicidades } from "../duplicidade-controller.js";
import { testarLogin, alterarSenha, validarAcesso } from "../credenciais-controller.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════
// ANÁLISE DE IMAGENS OPERACIONAIS
// ═══════════════════════════════════════════════════════════════════

router.post("/analise-imagem/analisar", uploadImagemMiddleware, analisarSemSalvar);
router.post("/analise-imagem/salvar-e-analisar", uploadImagemMiddleware, salvarEAnalisar);
router.post("/analise-imagem/comparar-pasta", uploadImagemMiddleware, compararPasta);
router.post("/analise-imagem/comparar-pasta-local", uploadImagemMiddleware, compararPastaLocal);
router.get("/analise-imagem/imagem-externa", servirImagemExterna);
router.post("/analise-imagem/gerar-caracteristicas", uploadImagemMiddleware, gerarCaracteristicas);
router.post("/analise-imagem/classificar-ocupacao", classificarOcupacao);
router.post("/analise-imagem/classificar-roda", classificarRoda);
router.post("/analise-imagem/classificar-cor-camisa", classificarCorCamisa);
router.post("/analise-imagem/classificar-mochila", classificarMochila);
router.post("/analise-imagem/classificar-calca", classificarCalca);
router.post("/analise-imagem/ler-placa", lerPlacas);
router.get("/analise-imagem/listar", listarTodas);
router.get("/analise-imagem/listar/:sistema", listarPorSistema);
router.get("/analise-imagem/listar-pasta", listarPasta);
router.delete("/analise-imagem/:sistema/:nome", removerImagem);

// ═══════════════════════════════════════════════════════════════════
// JOBS - PROCESSAMENTO EM LOTE
// ═══════════════════════════════════════════════════════════════════

router.post("/jobs/comparar-pasta", uploadJobMiddleware, criarJobHandler);
router.get("/jobs", listarJobs);
router.get("/jobs/:id", obterJob);
router.delete("/jobs/:id", removerJob);

// ═══════════════════════════════════════════════════════════════════
// LEITURA & OCR
// ═══════════════════════════════════════════════════════════════════

router.post("/leitura/analisar-texto", analisarTexto);
router.post("/leitura/analisar-arquivo", uploadLeituraMiddleware, analisarArquivo);

// ═══════════════════════════════════════════════════════════════════
// VALIDAÇÃO DE FLUXO DE ALERTAS
// ═══════════════════════════════════════════════════════════════════

router.post("/validate-alert-flow", validarFluxoAlerta);

// ═══════════════════════════════════════════════════════════════════
// AUDITORIA DE DUPLICIDADES
// ═══════════════════════════════════════════════════════════════════

router.get("/duplicidade/buscar", buscarInfracoes);
router.post("/duplicidade/varredura", varreduraDuplicidades);
router.get("/duplicidade/detalhe/:id", detalheInfracao);
router.post("/duplicidade/comparar", compararInfracoes);
router.get("/duplicidade/estatisticas", estatisticasDuplicidades);

// ═══════════════════════════════════════════════════════════════════
// CREDENCIAIS (Teste de Acesso)
// ═══════════════════════════════════════════════════════════════════

router.post("/credenciais/testar-login", testarLogin);
router.post("/credenciais/alterar-senha", alterarSenha);
router.post("/credenciais/validar-acesso", validarAcesso);

export default router;
