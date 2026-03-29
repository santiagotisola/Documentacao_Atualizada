import express from "express";
import { processarMensagem, consultarHistorico, consultarPendentes, consultarEstatisticas } from "./controller.js";
import { listarTickets, detalheTicket, classificarTicket, responderTicketIA, processarPendentes as processarHelpdeskPendentes, listarCategorias } from "./helpdesk-controller.js";

const router = express.Router();

// AxionIA Chat
router.post("/chat", processarMensagem);

// Logs e estatísticas
router.get("/logs/historico", consultarHistorico);
router.get("/logs/pendentes", consultarPendentes);
router.get("/logs/estatisticas", consultarEstatisticas);

// Helpdesk Jitbit
router.get("/helpdesk/tickets", listarTickets);
router.get("/helpdesk/ticket/:id", detalheTicket);
router.post("/helpdesk/classificar/:id", classificarTicket);
router.post("/helpdesk/responder/:id", responderTicketIA);
router.post("/helpdesk/processar", processarHelpdeskPendentes);
router.get("/helpdesk/categorias", listarCategorias);

export default router;
