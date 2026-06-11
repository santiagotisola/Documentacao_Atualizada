import express from "express";
import { processarMensagem, consultarHistorico, consultarPendentes, consultarEstatisticas, treinarIA, consultarLogsMongo, consultarAnalise, listarEntradasKB } from "./controller.js";
import { listarTickets, detalheTicket, classificarTicket, responderTicketIA, processarPendentes as processarHelpdeskPendentes, listarCategorias, criarChamado, statusPolling, iniciarPolling, pausarPolling, retomarPolling, limparPolling, obterFila, setModoRevisao, aprovarFila, rejeitarFila, listarTecnicosHelpdesk, gerarPlanilhaHoras, relatarSlaCompliance } from "./helpdesk-controller.js";
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
import { gerarConformidadeHandler, listarConformidadeHandler, obterConformidadeHandler, removerConformidadeHandler, gerarAnalisaMultiProdutoHandler, obterAnalisaMultiProdutoHandler, listarAnalisasMultiProdutoHandler, obterComparacaoHandler, obterLacunasHandler, obterRecomendacoesHandler } from "./conformidade-controller.js";
import { iniciarConexao, statusConexao as waStatus, listarSessoes, detalhesSessao, encerrarSessao, enviarManual, enviarComBotoes, desconectar, restart } from "./whatsapp-controller.js";
import { reindexarDocs, reindexarJitbit, statsKB, limparModuloKB } from "./admin-controller.js";
import { uploadImagemMiddleware, analisarSemSalvar, salvarEAnalisar, listarTodas, listarPorSistema, listarPasta, compararPasta, compararPastaLocal, servirImagemExterna, removerImagem, classificarOcupacao, classificarRoda, classificarCorCamisa, classificarMochila, classificarCalca, gerarCaracteristicas, lerPlacas } from "./analise-imagem-controller.js";
import { uploadJobMiddleware, criarJobHandler, listarJobs, obterJob, removerJob } from "./job-controller.js";
import { validarFluxoAlerta } from "./validate-controller.js";
import { runAgent, runAgentMode, getAgentState, getSchedulerStatus, startScheduler, stopScheduler } from "./agent-controller.js";
import { validarDispositivo, validarLote, analisarIncidente, heartbeatGeral, listarFrota, auditoriaStatus, auditoriaAprimorada, configPadrao, recoletaVarco, planoCorrecao, gerarPlano, aplicarCorrecao } from "./varco-controller.js";
import { analisarTexto, analisarArquivo, uploadLeituraMiddleware } from "./leitura-controller.js";
import { healthCheck } from "./health-controller.js";
import { listarFilaHandler, obterEstatisticasHandler, obterItemHandler, marcarRevisadoHandler, autoResolverHandler, exportarCsvHandler, descartarItemHandler } from "./confidence-controller.js";
import { listarContatos, detalheContato, atualizarContato, statsContatos, listarClientes, criarCliente, atualizarCliente, contatosDoCliente, buscaCRM } from "./crm-controller.js";
import { listarEquipamentosCRM, statsEquipamentos, detalheEquipamento, atualizarEquipamento, equipamentosDoCliente, buscaEquipamento } from "./equipamento-controller.js";
import { buscarEditaisGovHandler, importarEditalHandler, analisarEditalRapidoHandler, listarEditaisImportadosHandler, autoAnalisarTodosHandler, analiseAvancadaHandler, uploadEditalHandler, uploadEditalMiddleware, listarSitesHandler } from "./edital-controller.js";
import { sitesOverview, obterMapa, associarSite, desassociarSite, ticketsPorSite } from "./sites-helpdesk-controller.js";
import { listarContratosHandler, listarTiposHandler, gerarRelatorioHandler, listarRelatoriosHandler, obterRelatorioHandler, removerRelatorioHandler } from "./relatorio-contrato-controller.js";
import { testarLogin, alterarSenha, validarAcesso } from "./credenciais-controller.js";
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

// Integração Sites × Helpdesk (análise operacional)
router.get("/helpdesk/sites-overview", sitesOverview);
router.get("/helpdesk/mapa-sites", obterMapa);
router.post("/helpdesk/mapa-sites", associarSite);
router.delete("/helpdesk/mapa-sites/:categoriaId", desassociarSite);
router.get("/helpdesk/site/:siteId/tickets", ticketsPorSite);

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

// Relatórios por Contrato (IA)
router.get("/relatorio-contrato/contratos", listarContratosHandler);
router.get("/relatorio-contrato/tipos", listarTiposHandler);
router.post("/relatorio-contrato/gerar", gerarRelatorioHandler);
router.get("/relatorio-contrato", listarRelatoriosHandler);
router.get("/relatorio-contrato/:id", obterRelatorioHandler);
router.delete("/relatorio-contrato/:id", removerRelatorioHandler);

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

// ─── Análise Multi-Produto (AxHub + AxTon + AxCross simultâneos) ─ DEVE VIR ANTES DE :id
router.post("/conformidade/multi/gerar", gerarAnalisaMultiProdutoHandler);
router.get("/conformidade/multi", listarAnalisasMultiProdutoHandler);
router.get("/conformidade/multi/:id/comparacao", obterComparacaoHandler);
router.get("/conformidade/multi/:id/lacunas", obterLacunasHandler);
router.get("/conformidade/multi/:id/recomendacoes", obterRecomendacoesHandler);
router.get("/conformidade/multi/:id", obterAnalisaMultiProdutoHandler);

// ─── Conformidade Simples (Um Produto por Vez)
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
router.post("/whatsapp/send-buttons", enviarComBotoes);
router.post("/whatsapp/desconectar", desconectar);
router.post("/whatsapp/restart", restart);

// ─── Análise de Imagens Operacionais ─────────────────────────────────────────
// Pasta: uploads/analise/{sistema}/  (≠ docs/img/ que são screenshots dos manuais)
// Sistemas aceitos: axhub | axton | axcross | axionia
router.post("/analise-imagem/analisar", uploadImagemMiddleware, analisarSemSalvar);
router.post("/analise-imagem/salvar-e-analisar", uploadImagemMiddleware, salvarEAnalisar);
router.post("/analise-imagem/comparar-pasta", uploadImagemMiddleware, compararPasta);
router.post("/analise-imagem/comparar-pasta-local", uploadImagemMiddleware, compararPastaLocal);
router.get("/analise-imagem/imagem-externa", servirImagemExterna);
router.post("/analise-imagem/gerar-caracteristicas", uploadImagemMiddleware, gerarCaracteristicas);
router.post("/analise-imagem/classificar-ocupacao", classificarOcupacao);
router.post("/analise-imagem/classificar-roda",     classificarRoda);
router.post("/analise-imagem/classificar-cor-camisa", classificarCorCamisa);
router.post("/analise-imagem/classificar-mochila",  classificarMochila);
router.post("/analise-imagem/classificar-calca",    classificarCalca);
router.post("/analise-imagem/ler-placa",            lerPlacas);
router.get("/analise-imagem/listar", listarTodas);
router.get("/analise-imagem/listar/:sistema", listarPorSistema);
router.get("/analise-imagem/listar-pasta", listarPasta);
router.delete("/analise-imagem/:sistema/:nome", removerImagem);

// ─── Jobs — Processamento em lote ────────────────────────────────────────────
router.post("/jobs/comparar-pasta", uploadJobMiddleware, criarJobHandler);
router.get("/jobs",     listarJobs);
router.get("/jobs/:id", obterJob);
router.delete("/jobs/:id", removerJob);

// ─── Admin — Re-indexação da KB ──────────────────────────────────────────────
router.get("/admin/kb/stats", statsKB);
router.post("/admin/reindexar-docs", reindexarDocs);
router.post("/admin/reindexar-jitbit", reindexarJitbit);
router.delete("/admin/kb/:modulo", limparModuloKB);

// ─── AxionIA Core — Validação de Fluxo de Alertas ────────────────────────────
router.post("/validate-alert-flow", validarFluxoAlerta);

// ─── AxionAgent — Orquestrador Central ───────────────────────────────────────
router.post("/agent/run",               runAgent);
router.post("/agent/run/:mode",         runAgentMode);
router.get("/agent/state",              getAgentState);
router.get("/agent/scheduler",          getSchedulerStatus);
router.post("/agent/scheduler/start",   startScheduler);
router.post("/agent/scheduler/stop",    stopScheduler);

// ─── VARCO — Validador de integração câmeras → AxHub ─────────────────────────
router.post("/varco/validar-dispositivo", validarDispositivo);
router.post("/varco/validar-lote",        validarLote);
router.post("/varco/analisar-incidente",  analisarIncidente);
router.get("/varco/heartbeat",            heartbeatGeral);
router.get("/varco/frota",                listarFrota);
router.get("/varco/auditoria",            auditoriaStatus);
router.get("/varco/auditoria-aprimorada", auditoriaAprimorada);
router.get("/varco/config-padrao",        configPadrao);
router.post("/varco/recoleta",            recoletaVarco);
router.get("/varco/plano-correcao",       planoCorrecao);
router.post("/varco/gerar-plano",         gerarPlano);
router.post("/varco/aplicar-correcao",    aplicarCorrecao);

// ─── Leitura Estratégica — Agente 80/20 ──────────────────────────────────────
router.post("/leitura/analisar",          analisarTexto);
router.post("/leitura/upload",            uploadLeituraMiddleware, analisarArquivo);

// ─── SLA Compliance — Relatório Jitbit ───────────────────────────────────
router.get("/helpdesk/sla-compliance", relatarSlaCompliance);
router.get("/helpdesk/relatorio-sla", relatarSlaCompliance);

// ─── Health Check — monitoramento externo ────────────────────────────────────
router.get("/health", healthCheck);

// ─── Confiança — Fila de Revisão de Itens com Baixa Confiança ───────────────────────────
router.get("/confianca/fila",                         listarFilaHandler);
router.get("/confianca/estatisticas",                obterEstatisticasHandler);
router.get("/confianca/:id",                         obterItemHandler);
router.post("/confianca/:id/revisar",                marcarRevisadoHandler);
router.post("/confianca/:id/descartar",              descartarItemHandler);
router.post("/confianca/conformidade/:conformidadeId/auto-resolver", autoResolverHandler);
router.get("/confianca/exportar/csv",                exportarCsvHandler);

// ─── Editais — Busca, importação e análise automática de editais gov ───────────────────────
router.get("/edital/buscar",                        buscarEditaisGovHandler);
router.post("/edital/importar",                     importarEditalHandler);
router.post("/edital/analisar-rapido",              analisarEditalRapidoHandler);
router.post("/edital/analise-avancada",             analiseAvancadaHandler);
router.post("/edital/upload",                       uploadEditalMiddleware, uploadEditalHandler);
router.get("/sites",                                listarSitesHandler);
router.get("/edital-avancado/sites",                listarSitesHandler);
router.get("/edital",                               listarEditaisImportadosHandler);
router.get("/edital/historico",                     listarEditaisImportadosHandler);
router.post("/edital/auto-analisar-todos",          autoAnalisarTodosHandler);

// ─── CRM — Contatos e Clientes ───────────────────────────────────────────────
router.get("/crm/contatos",              listarContatos);
router.get("/crm/contatos/stats",        statsContatos);
router.get("/crm/contatos/:telefone",    detalheContato);
router.put("/crm/contatos/:telefone",    atualizarContato);
router.get("/crm/clientes",             listarClientes);
router.post("/crm/clientes",            criarCliente);
router.put("/crm/clientes/:slug",       atualizarCliente);
router.get("/crm/clientes/:slug/contatos", contatosDoCliente);
router.get("/crm/clientes/:slug/equipamentos", equipamentosDoCliente);
router.get("/crm/equipamentos",              listarEquipamentosCRM);
router.get("/crm/equipamentos/stats",        statsEquipamentos);
router.get("/crm/equipamentos/busca",        buscaEquipamento);
router.get("/crm/equipamentos/:alias",       detalheEquipamento);
router.put("/crm/equipamentos/:alias",       atualizarEquipamento);
router.get("/crm/busca",                buscaCRM);

// ─── Credenciais — Gerenciamento de Senhas ───────────────────────────────────
router.post("/credenciais/login",          testarLogin);
router.post("/credenciais/alterar-senha",  alterarSenha);
router.post("/credenciais/validar",        validarAcesso);

export default router;
