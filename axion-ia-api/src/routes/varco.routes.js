/**
 * 🎥 VARCO & VALIDATION ROUTES
 * 
 * Rotas para VARCO, WhatsApp e validation manager
 * 
 * @module routes/varco
 * @created 2026-06-21
 * @refactor Fase 1 - Quick Wins
 */

import express from "express";
import { validarDispositivo, validarLote, analisarIncidente, heartbeatGeral, listarFrota, auditoriaStatus, auditoriaAprimorada, configPadrao, recoletaVarco, planoCorrecao, gerarPlano, aplicarCorrecao } from "../varco-controller.js";
import { iniciarConexao, statusConexao, listarSessoes, detalhesSessao, encerrarSessao, enviarManual, enviarComBotoes, desconectar, restart } from "../whatsapp-controller.js";
import { startValidation, discoverUI, discoverAPI, getReport, listValidations } from "../validation-manager-controller.js";
import { startVisualValidation, getVisualValidationStatus, getVisualValidationReport, getScreenshot, listVisualValidations } from "../visual-validation-controller.js";
import { scanProject, applyFix, applyBatchFix, applyToAllSimilar, getGlossary, scanURL, scanURLBatch, scanSiteComplete } from "../linguistic-controller.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════
// VARCO - VALIDADOR DE INTEGRAÇÃO
// ═══════════════════════════════════════════════════════════════════

router.post("/varco/validar-dispositivo", validarDispositivo);
router.post("/varco/validar-lote", validarLote);
router.post("/varco/analisar-incidente", analisarIncidente);
router.get("/varco/heartbeat", heartbeatGeral);
router.get("/varco/frota", listarFrota);
router.get("/varco/auditoria", auditoriaStatus);
router.post("/varco/auditoria-aprimorada", auditoriaAprimorada);
router.get("/varco/config-padrao", configPadrao);
router.post("/varco/recoleta", recoletaVarco);
router.post("/varco/plano-correcao", planoCorrecao);
router.post("/varco/plano-correcao/gerar", gerarPlano);
router.post("/varco/plano-correcao/aplicar", aplicarCorrecao);

// ═══════════════════════════════════════════════════════════════════
// WHATSAPP
// ═══════════════════════════════════════════════════════════════════

router.post("/whatsapp/iniciar", iniciarConexao);
router.get("/whatsapp/status", statusConexao);
router.get("/whatsapp/sessoes", listarSessoes);
router.get("/whatsapp/sessao/:telefone", detalhesSessao);
router.delete("/whatsapp/sessao/:telefone", encerrarSessao);
router.post("/whatsapp/send", enviarManual);
router.post("/whatsapp/send-buttons", enviarComBotoes);
router.post("/whatsapp/desconectar", desconectar);
router.post("/whatsapp/restart", restart);

// ═══════════════════════════════════════════════════════════════════
// VALIDATION MANAGER (UI + API)
// ═══════════════════════════════════════════════════════════════════

router.post("/validation/start", startValidation);
router.post("/validation/discover/ui", discoverUI);
router.post("/validation/discover/api", discoverAPI);
router.get("/validation/report/:id", getReport);
router.get("/validation/list", listValidations);

// ═══════════════════════════════════════════════════════════════════
// VISUAL VALIDATION (Screenshots + Ortografia)
// ═══════════════════════════════════════════════════════════════════

router.post("/visual-validation/start", startVisualValidation);
router.get("/visual-validation/status/:id", getVisualValidationStatus);
router.get("/visual-validation/report/:id", getVisualValidationReport);
router.get("/visual-validation/screenshot/:id/:index", getScreenshot);
router.get("/visual-validation/list", listVisualValidations);

// ═══════════════════════════════════════════════════════════════════
// LINGUISTIC VALIDATION (Ortografia + Gramática + Terminologia)
// ═══════════════════════════════════════════════════════════════════

// Scan de projetos locais
router.post("/linguistic/scan", scanProject);
router.post("/linguistic/fix", applyFix);
router.post("/linguistic/fix-batch", applyBatchFix);
router.post("/linguistic/fix-all-similar", applyToAllSimilar);
router.get("/linguistic/glossary", getGlossary);

// Scan de URLs/Sites
router.post("/linguistic/scan-url", scanURL);
router.post("/linguistic/scan-urls", scanURLBatch);
router.post("/linguistic/scan-site-complete", scanSiteComplete);

export default router;
