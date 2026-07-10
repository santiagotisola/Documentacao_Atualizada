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
import { validarDispositivo, validarLote, analisarIncidente, heartbeatGeral, listarFrota, auditoriaStatus, auditoriaAprimorada, configPadrao, recoletaVarco, planoCorrecao, gerarPlano, aplicarCorrecao, itscamLer, itscamAplicar, itscamAplicarLote, relatorioErros, relatorioDownload } from "../varco-controller.js";
import { iniciarConexao, statusConexao, listarSessoes, detalhesSessao, encerrarSessao, enviarManual, enviarComBotoes, desconectar, restart } from "../whatsapp-controller.js";
import { startValidation, discoverUI, discoverAPI, getReport, listValidations } from "../validation-manager-controller.js";
import { startVisualValidation, getVisualValidationStatus, getVisualValidationReport, getScreenshot, listVisualValidations } from "../visual-validation-controller.js";
import { navegarRemoto, auditarRemoto, configurarVarco, testarConexao, listarVarcos } from "../varco-remote-controller.js";

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
router.get("/varco/auditoria-aprimorada", auditoriaAprimorada);
router.get("/varco/config-padrao", configPadrao);
router.post("/varco/recoleta", recoletaVarco);
router.get("/varco/relatorio", relatorioErros);
router.get("/varco/relatorio/download", relatorioDownload);
router.get("/varco/plano-correcao", planoCorrecao);
router.post("/varco/plano-correcao/gerar", gerarPlano);
router.post("/varco/plano-correcao/aplicar", aplicarCorrecao);

// ═══════════════════════════════════════════════════════════════════
// ITSCAM — Proxy REST direto aos equipamentos via tunnel
// ═══════════════════════════════════════════════════════════════════
router.post("/varco/itscam/ler", itscamLer);
router.post("/varco/itscam/aplicar", itscamAplicar);
router.post("/varco/itscam/aplicar-lote", itscamAplicarLote);

// ═══════════════════════════════════════════════════════════════════
// VARCO REMOTE — Acesso remoto a sites clientes
// ═══════════════════════════════════════════════════════════════════

router.get("/varco/remote/list",             listarVarcos);
router.post("/varco/remote/navigate",        navegarRemoto);
router.post("/varco/remote/auditar",         auditarRemoto);
router.post("/varco/remote/testar/:slug",    testarConexao);
router.patch("/varco/remote/config/:slug",   configurarVarco);

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

export default router;
