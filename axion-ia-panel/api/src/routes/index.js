/**
 * 🗂️ ROUTES INDEX
 * 
 * Importa e organiza todos os módulos de rotas da API
 * 
 * @created 2026-06-21
 * @refactor Fase 1 - Quick Wins
 * 
 * Estrutura modular (8 módulos):
 * - chat.routes.js - Chat IA, logs, embeddings, KB
 * - helpdesk.routes.js - Helpdesk, tickets, polling, SLA
 * - products.routes.js - AxHub, AxTon, AxCross, relatórios
 * - editais.routes.js - PNCP, conformidade, roadmap, specs
 * - admin.routes.js - Config, admin, docs, agent
 * - analise.routes.js - Imagens, OCR, jobs, validações
 * - crm.routes.js - CRM, contatos, clientes, equipamentos
 * - varco.routes.js - VARCO, WhatsApp, validation manager
 * - portal.routes.js - Portal do Cidadão (consultas, contestações, auth)
 */

import express from "express";
import chatRoutes from "./chat.routes.js";
import helpdeskRoutes from "./helpdesk.routes.js";
import productsRoutes from "./products.routes.js";
import editaisRoutes from "./editais.routes.js";
import adminRoutes from "./admin.routes.js";
import analiseRoutes from "./analise.routes.js";
import crmRoutes from "./crm.routes.js";
import varcoRoutes from "./varco.routes.js";
import portalRoutes from "./portal.routes.js";
import qualityRoutes from "./quality.routes.js";
import missionRoutes from "./mission.routes.js";
import presentationRoutes from "./presentation.routes.js";
import odooProxyRoutes from "./odoo-proxy.routes.js";
import loteExportacaoRoutes from "./lote-exportacao.routes.js";
import deparaEquipamentosRoutes from "./depara-equipamentos.routes.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════
// REGISTRA MÓDULOS DE ROTAS
// ═══════════════════════════════════════════════════════════════════

router.use(chatRoutes);      // Chat IA, logs, embeddings
router.use(helpdeskRoutes);  // Helpdesk Jitbit
router.use(productsRoutes);  // AxHub, AxTon, AxCross
router.use(editaisRoutes);   // PNCP, conformidade, editais
router.use(adminRoutes);     // Config, admin, agent
router.use(analiseRoutes);   // Imagens, OCR, jobs
router.use(crmRoutes);       // CRM, contatos, clientes
router.use(varcoRoutes);     // VARCO, WhatsApp, validation
router.use(qualityRoutes);        // Quality Platform PIEQ
router.use(missionRoutes);        // Mission Engine
router.use(presentationRoutes);   // Presentation Engine (PDF/DOCX/PPTX)
router.use("/portal", portalRoutes); // Portal do Cidadão
router.use(odooProxyRoutes);         // Odoo Proxy (Discuss, Chat, Canais)
router.use(loteExportacaoRoutes);    // Correção de Lotes de Exportação AxHub
router.use(deparaEquipamentosRoutes); // Depara de Equipamentos AxHub × AxCross

export default router;
