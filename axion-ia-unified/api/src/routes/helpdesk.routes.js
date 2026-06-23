/**
 * 🎧 HELPDESK ROUTES
 * 
 * Rotas para helpdesk Jitbit, tickets, polling, SLA e sites
 * 
 * @module routes/helpdesk
 * @created 2026-06-21
 * @refactor Fase 1 - Quick Wins
 */

import express from "express";
import { listarTickets, detalheTicket, classificarTicket, responderTicketIA, processarPendentes, listarCategorias, criarChamado, statusPolling, iniciarPolling, pausarPolling, retomarPolling, limparPolling, obterFila, setModoRevisao, aprovarFila, rejeitarFila, listarTecnicosHelpdesk, gerarPlanilhaHoras, relatarSlaCompliance } from "../helpdesk-controller.js";
import { sitesOverview, obterMapa, associarSite, desassociarSite, ticketsPorSite } from "../sites-helpdesk-controller.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════
// TICKETS
// ═══════════════════════════════════════════════════════════════════

router.get("/helpdesk/tickets", listarTickets);
router.get("/helpdesk/ticket/:id", detalheTicket);
router.post("/helpdesk/classificar/:id", classificarTicket);
router.post("/helpdesk/responder/:id", responderTicketIA);
router.post("/helpdesk/processar", processarPendentes);
router.get("/helpdesk/categorias", listarCategorias);
router.post("/helpdesk/criar", criarChamado);

// ═══════════════════════════════════════════════════════════════════
// POLLING AUTOMÁTICO
// ═══════════════════════════════════════════════════════════════════

router.get("/helpdesk/polling", statusPolling);
router.post("/helpdesk/polling/iniciar", iniciarPolling);
router.post("/helpdesk/polling/pausar", pausarPolling);
router.post("/helpdesk/polling/retomar", retomarPolling);
router.post("/helpdesk/polling/limpar", limparPolling);

// ═══════════════════════════════════════════════════════════════════
// FILA DE REVISÃO HUMANA
// ═══════════════════════════════════════════════════════════════════

router.get("/helpdesk/fila", obterFila);
router.post("/helpdesk/fila/modo", setModoRevisao);
router.post("/helpdesk/fila/:id/aprovar", aprovarFila);
router.post("/helpdesk/fila/:id/rejeitar", rejeitarFila);

// ═══════════════════════════════════════════════════════════════════
// PLANILHA DE HORAS & SLA
// ═══════════════════════════════════════════════════════════════════

router.get("/helpdesk/tecnicos", listarTecnicosHelpdesk);
router.get("/helpdesk/planilha-horas", gerarPlanilhaHoras);
router.get("/helpdesk/sla-compliance", relatarSlaCompliance);

// ═══════════════════════════════════════════════════════════════════
// INTEGRAÇÃO SITES × HELPDESK
// ═══════════════════════════════════════════════════════════════════

router.get("/helpdesk/sites-overview", sitesOverview);
router.get("/helpdesk/mapa-sites", obterMapa);
router.post("/helpdesk/mapa-sites", associarSite);
router.delete("/helpdesk/mapa-sites/:categoriaId", desassociarSite);
router.get("/helpdesk/site/:siteId/tickets", ticketsPorSite);

export default router;
