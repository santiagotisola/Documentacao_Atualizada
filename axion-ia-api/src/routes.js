import express from "express";
import { processarMensagem, consultarHistorico, consultarPendentes, consultarEstatisticas, treinarIA, consultarLogsMongo, consultarAnalise, listarEntradasKB } from "./controller.js";
import { listarTickets, detalheTicket, classificarTicket, responderTicketIA, processarPendentes as processarHelpdeskPendentes, listarCategorias, criarChamado, statusPolling, iniciarPolling, pausarPolling, retomarPolling, limparPolling, obterFila, setModoRevisao, aprovarFila, rejeitarFila, listarTecnicosHelpdesk, gerarPlanilhaHoras } from "./helpdesk-controller.js";
import { statusConexao, resumoGeral, listarEquipamentos, listarOperacoes, statsInfracoes, heartbeatEquipamentos, listarTabelas, listarMonitoramentos, ultimasPassagens, statsTriagens } from "./axhub-controller.js";
import { statusConexao as axtonStatus, resumoGeral as axtonResumo, listarTabelas as axtonTabelas, ultimasPesagens as axtonPesagens, ultimasInfracoes as axtonInfracoes, heartbeatEquipamentos as axtonHeartbeat } from "./axton-controller.js";
import { statusConexao as axcrossStatus, resumoGeral as axcrossResumo, listarEquipamentos as axcrossEquipamentos, statsPassagens as axcrossPassagens, heartbeatEquipamentos as axcrossHeartbeat, listarTabelas as axcrossTabelas, listarLocais as axcrossLocais, listarOperacoes as axcrossOperacoes } from "./axcross-controller.js";
import { obterConfig, salvarConfig, testarMongo } from "./config-controller.js";
import { gerarDoc, salvarDoc, listarImagens, listarSecoes } from "./doc-controller.js";
import { adicionarFonte, listarFontes, obterFonte, removerFonte, analisarFonteById, mapaCobertura, sugestoesPorProduto } from "./fontes-controller.js";
import { buscarPNCP, importarSelecionados, coletarProduto, obterConfig as coletorConfig, salvarConfig as coletorSalvar, statusColetor, listarOperacoes as coletorOperacoes } from "./coletor-controller.js";
import { gerarRoadmapHandler, listarRoadmapsHandler, obterRoadmapHandler, atualizarItemHandler } from "./roadmap-controller.js";
import { gerarSpecHandler, listarSpecsHandler, obterSpecHandler, atualizarStatusSpecHandler } from "./spec-controller.js";
import { relatorioPassagens, relatorioImagens, listarEquipamentosRelatorio } from "./relatorio-controller.js";
import { uploadMiddlewareComErro, uploadContexto } from "./upload-controller.js";
import { gerarConformidadeHandler, listarConformidadeHandler, obterConformidadeHandler, removerConformidadeHandler } from "./conformidade-controller.js";
import { iniciarConexao, statusConexao as waStatus, listarSessoes, detalhesSessao, encerrarSessao, enviarManual } from "./whatsapp-controller.js";

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

// Polling automático
router.get("/helpdesk/polling", statusPolling);
router.post("/helpdesk/polling/iniciar", iniciarPolling);
router.post("/helpdesk/polling/pausar", pausarPolling);
router.post("/helpdesk/polling/retomar", retomarPolling);
router.post("/helpdesk/polling/limpar", limparPolling);

// Fila de revisão humana
router.get("/helpdesk/fila", obterFila);
router.post("/helpdesk/fila/modo", setModoRevisao);
router.post("/helpdesk/fila/:id/aprovar", aprovarFila);
router.post("/helpdesk/fila/:id/rejeitar", rejeitarFila);

// Planilha de Horas
router.get("/helpdesk/tecnicos", listarTecnicosHelpdesk);
router.get("/helpdesk/planilha-horas", gerarPlanilhaHoras);

// AxHub — SQL Server
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

// AxTon — SQL Server
router.get("/axton/status", axtonStatus);
router.get("/axton/resumo", axtonResumo);
router.get("/axton/pesagens", axtonPesagens);
router.get("/axton/infracoes", axtonInfracoes);
router.get("/axton/heartbeat", axtonHeartbeat);
router.get("/axton/tabelas", axtonTabelas);

// AxCross — SQL Server
router.get("/axcross/status", axcrossStatus);
router.get("/axcross/resumo", axcrossResumo);
router.get("/axcross/equipamentos", axcrossEquipamentos);
router.get("/axcross/locais", axcrossLocais);
router.get("/axcross/operacoes", axcrossOperacoes);
router.get("/axcross/passagens", axcrossPassagens);
router.get("/axcross/heartbeat", axcrossHeartbeat);
router.get("/axcross/tabelas", axcrossTabelas);

// Geração de Documentação (AxionIA Docs)
router.post("/doc/gerar", gerarDoc);
router.post("/doc/salvar", salvarDoc);
router.get("/doc/imagens/:produto", listarImagens);
router.get("/doc/secoes/:produto", listarSecoes);
router.post("/doc/upload-contexto", uploadMiddlewareComErro, uploadContexto);

// Relatórios Fluxo Diário (AxHub)
router.get("/relatorio/passagens", relatorioPassagens);
router.get("/relatorio/imagens", relatorioImagens);
router.get("/relatorio/equipamentos", listarEquipamentosRelatorio);

// Configuração
router.get("/config", obterConfig);
router.post("/config", salvarConfig);
router.post("/config/testar-mongo", testarMongo);

// ─── Coletor de Fontes Externas (PNCP + portais gov) ───
router.get("/coletor/operacoes", coletorOperacoes);
router.get("/coletor/pncp", buscarPNCP);
router.post("/coletor/pncp/importar", importarSelecionados);
router.post("/coletor/pncp/coletar", coletarProduto);
router.get("/coletor/config", coletorConfig);
router.post("/coletor/config", coletorSalvar);
router.get("/coletor/status", statusColetor);

// ─── Fontes de Pesquisa (análise de usabilidade — ISOLADO da KB/IA) ───
router.post("/fontes", adicionarFonte);
router.get("/fontes", listarFontes);
router.get("/fontes/mapa/:produto", mapaCobertura);
router.get("/fontes/sugestoes/:produto", sugestoesPorProduto);
router.get("/fontes/:id", obterFonte);
router.post("/fontes/:id/analisar", analisarFonteById);
router.delete("/fontes/:id", removerFonte);

// ─── Roadmap (geração de backlog a partir de lacunas — ISOLADO da KB/IA) ───
router.post("/roadmap/gerar", gerarRoadmapHandler);
router.get("/roadmap", listarRoadmapsHandler);
router.get("/roadmap/:id", obterRoadmapHandler);
router.patch("/roadmap/:id/item/:itemId", atualizarItemHandler);

// ─── Specs / PRD (especificação técnica de funcionalidades) ───
router.post("/spec/gerar", gerarSpecHandler);
router.get("/spec", listarSpecsHandler);
router.get("/spec/:id", obterSpecHandler);
router.patch("/spec/:id/status", atualizarStatusSpecHandler);

// ─── Conformidade com Editais / Licitações ───────────────────────
router.post("/conformidade/gerar", gerarConformidadeHandler);
router.get("/conformidade", listarConformidadeHandler);
router.get("/conformidade/:id", obterConformidadeHandler);
router.delete("/conformidade/:id", removerConformidadeHandler);

// WhatsApp
router.post("/whatsapp/iniciar", iniciarConexao);
router.get("/whatsapp/status", waStatus);
router.get("/whatsapp/sessoes", listarSessoes);
router.get("/whatsapp/sessao/:telefone", detalhesSessao);
router.delete("/whatsapp/sessao/:telefone", encerrarSessao);
router.post("/whatsapp/send", enviarManual);

export default router;
