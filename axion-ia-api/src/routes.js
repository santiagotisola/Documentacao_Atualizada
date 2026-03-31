import express from "express";
import { processarMensagem, consultarHistorico, consultarPendentes, consultarEstatisticas, treinarIA, consultarLogsMongo, consultarAnalise, listarEntradasKB } from "./controller.js";
import { listarTickets, detalheTicket, classificarTicket, responderTicketIA, processarPendentes as processarHelpdeskPendentes, listarCategorias, criarChamado } from "./helpdesk-controller.js";
import { statusConexao, resumoGeral, listarEquipamentos, listarOperacoes, statsInfracoes, heartbeatEquipamentos, listarTabelas } from "./axhub-controller.js";
import { statusConexao as axtonStatus, resumoGeral as axtonResumo, listarTabelas as axtonTabelas } from "./axton-controller.js";
import { statusConexao as axcrossStatus, resumoGeral as axcrossResumo, listarEquipamentos as axcrossEquipamentos, statsPassagens as axcrossPassagens, heartbeatEquipamentos as axcrossHeartbeat, listarTabelas as axcrossTabelas } from "./axcross-controller.js";
import { obterConfig, salvarConfig, testarMongo } from "./config-controller.js";

const router = express.Router();

// AxionIA Chat
router.post("/chat", processarMensagem);

// Logs e estatísticas (arquivo)
router.get("/logs/historico", consultarHistorico);
router.get("/logs/pendentes", consultarPendentes);
router.get("/logs/estatisticas", consultarEstatisticas);

// Embeddings — Treinamento, Logs, Análise, KB
router.post("/treinar", treinarIA);
router.get("/logs", consultarLogsMongo);
router.get("/analise", consultarAnalise);
router.get("/kb", listarEntradasKB);

// Helpdesk Jitbit
router.get("/helpdesk/tickets", listarTickets);
router.get("/helpdesk/ticket/:id", detalheTicket);
router.post("/helpdesk/classificar/:id", classificarTicket);
router.post("/helpdesk/responder/:id", responderTicketIA);
router.post("/helpdesk/processar", processarHelpdeskPendentes);
router.get("/helpdesk/categorias", listarCategorias);
router.post("/helpdesk/criar", criarChamado);

// AxHub — SQL Server
router.get("/axhub/status", statusConexao);
router.get("/axhub/resumo", resumoGeral);
router.get("/axhub/equipamentos", listarEquipamentos);
router.get("/axhub/operacoes", listarOperacoes);
router.get("/axhub/infracoes", statsInfracoes);
router.get("/axhub/heartbeat", heartbeatEquipamentos);
router.get("/axhub/tabelas", listarTabelas);

// AxTon — SQL Server
router.get("/axton/status", axtonStatus);
router.get("/axton/resumo", axtonResumo);
router.get("/axton/tabelas", axtonTabelas);

// AxCross — SQL Server
router.get("/axcross/status", axcrossStatus);
router.get("/axcross/resumo", axcrossResumo);
router.get("/axcross/equipamentos", axcrossEquipamentos);
router.get("/axcross/passagens", axcrossPassagens);
router.get("/axcross/heartbeat", axcrossHeartbeat);
router.get("/axcross/tabelas", axcrossTabelas);

// Configuração
router.get("/config", obterConfig);
router.post("/config", salvarConfig);
router.post("/config/testar-mongo", testarMongo);

export default router;
