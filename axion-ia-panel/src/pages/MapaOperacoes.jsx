import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { AXHUB_SITES, AXCROSS_SITES } from "../data/sitesData";
import QuickSelect from "../components/QuickSelect.jsx";
import "./PainelProcessos.css";

/* =================================================================
   MAPA DE OPERACOES - Ecossistema unificado
   - Mapa Visual (diagrama SVG de fluxos IA)
   - Fluxos Detalhados (BPM passo-a-passo)
   - Processos AxHub / AxCross (modulos e subprocessos)
   - Sites (todos os ambientes)
   - Acessos (grupos e credenciais)
   ================================================================= */

// DADOS DO MAPA VISUAL
const NODES = [
  { id: "pncp", label: "PNCP Gov.br", icon: "\u{1F3DB}\uFE0F", group: "entrada", x: 50, y: 60, desc: "Portal Nacional de Contratacoes Publicas - busca automatica de editais", link: "/editais-gov" },
  { id: "jitbit", label: "Jitbit Helpdesk", icon: "\u{1F3A7}", group: "entrada", x: 50, y: 200, desc: "Sistema externo de tickets - polling automatico a cada 2 min", link: "/helpdesk" },
  { id: "whatsapp", label: "WhatsApp", icon: "\u{1F4AC}", group: "entrada", x: 50, y: 340, desc: "Canal de atendimento via WhatsApp", link: "/whatsapp" },
  { id: "axhub_db", label: "AxHub (SQL Server)", icon: "\u{1F5C4}\uFE0F", group: "entrada", x: 50, y: 480, desc: "Banco SQL Server - 70+ telas" },
  { id: "axton_db", label: "AxTon (MongoDB)", icon: "\u{1F5C4}\uFE0F", group: "entrada", x: 50, y: 560, desc: "Banco MongoDB - pesagem veicular" },
  { id: "axcross_db", label: "AxCross (SQL Server)", icon: "\u{1F5C4}\uFE0F", group: "entrada", x: 50, y: 640, desc: "Banco SQL Server - cruzamento de placas" },
  { id: "upload", label: "Upload Imagens", icon: "\u{1F4F8}", group: "entrada", x: 50, y: 780, desc: "Imagens de cameras, placas, ocupacao" },
  { id: "editais", label: "Busca de Editais", icon: "\u{1F50D}", group: "processamento", x: 280, y: 60, desc: "Scraping do PNCP - importacao e analise", link: "/editais-gov" },
  { id: "conformidade", label: "Conformidade", icon: "\u{1F6E1}\uFE0F", group: "processamento", x: 500, y: 60, desc: "Scoring por requisito - veredicto APTO/INAPTO", link: "/conformidade" },
  { id: "multi", label: "Multi-Produto", icon: "\u{1F4CA}", group: "processamento", x: 500, y: 160, desc: "Analise simultanea AxHub vs AxTon vs AxCross", link: "/analisa-multi" },
  { id: "helpdesk", label: "Helpdesk IA", icon: "\u{1F3AB}", group: "processamento", x: 280, y: 200, desc: "Classificacao automatica + sugestao de resposta", link: "/helpdesk" },
  { id: "chat", label: "Chat IA", icon: "\u{1F916}", group: "processamento", x: 280, y: 340, desc: "Engine: mensagem - classificador KB - GPT-4o-mini", link: "/chat" },
  { id: "dashboards", label: "Dashboards Produto", icon: "\u{1F4CA}", group: "processamento", x: 280, y: 540, desc: "KPIs por produto", link: "/dashboard" },
  { id: "relatorio", label: "Relatorio de Fluxo", icon: "\u{1F4C8}", group: "processamento", x: 280, y: 660, desc: "Heatmap hora x dia de passagens", link: "/relatorio-fluxo" },
  { id: "analise_img", label: "Analise de Imagens", icon: "\u{1F4F7}", group: "processamento", x: 280, y: 780, desc: "GPT-4o Vision: scoring de confianca", link: "/analise-imagens" },
  { id: "fila", label: "Fila de Revisao", icon: "\u2705", group: "qualidade", x: 500, y: 400, desc: "Confianca < 60% - revisao humana", link: "/confianca" },
  { id: "sla", label: "SLA Compliance", icon: "\u{1F3AF}", group: "qualidade", x: 500, y: 300, desc: "Met vs Breached vs Aberto por prioridade", link: "/sla-compliance" },
  { id: "sites", label: "Sites x Chamados", icon: "\u{1F3E2}", group: "qualidade", x: 500, y: 500, desc: "Mapeamento de sites com categorias Jitbit", link: "/chamados-sites" },
  { id: "roadmap", label: "Roadmap", icon: "\u{1F5FA}\uFE0F", group: "inteligencia", x: 720, y: 60, desc: "Gaps de conformidade priorizados", link: "/roadmap" },
  { id: "specs", label: "Specs Tecnicas", icon: "\u{1F4D0}", group: "inteligencia", x: 720, y: 160, desc: "Geracao automatica de PRD", link: "/specs" },
  { id: "fontes", label: "Fontes de Pesquisa", icon: "\u{1F50E}", group: "inteligencia", x: 720, y: 260, desc: "URLs de referencia e cobertura", link: "/fontes" },
  { id: "kb", label: "Knowledge Base", icon: "\u{1F4DA}", group: "conhecimento", x: 720, y: 400, desc: "1000+ entradas com embeddings vetoriais", link: "/kb" },
  { id: "treino", label: "Treinamento", icon: "\u{1F393}", group: "conhecimento", x: 720, y: 500, desc: "Pares pergunta/resposta - gera embedding", link: "/treinamento" },
  { id: "gerar_doc", label: "Gerador de Docs", icon: "\u{1F4C4}", group: "conhecimento", x: 720, y: 600, desc: "IA gera documentacao por produto", link: "/gerar-doc" },
  { id: "hub", label: "Intelligence Hub", icon: "\u{1F9E0}", group: "saida", x: 940, y: 300, desc: "Dashboard unificado - visao 360", link: "/intelligence-hub" },
  { id: "agent", label: "Agente Autonomo", icon: "\u26A1", group: "saida", x: 940, y: 460, desc: "Orquestrador: health check, validacao" },
  { id: "logs", label: "Logs & Auditoria", icon: "\u{1F4CB}", group: "saida", x: 940, y: 600, desc: "Registro de todas as operacoes", link: "/logs" },
];

const CONNECTIONS = [
  { from: "pncp", to: "editais", label: "scraping", type: "data" },
  { from: "editais", to: "conformidade", label: "analisar edital", type: "data" },
  { from: "conformidade", to: "multi", label: "3 produtos", type: "process" },
  { from: "conformidade", to: "fila", label: "confianca < 60%", type: "quality" },
  { from: "multi", to: "roadmap", label: "lacunas", type: "intelligence" },
  { from: "roadmap", to: "specs", label: "gerar PRD", type: "intelligence" },
  { from: "fontes", to: "conformidade", label: "referencias", type: "data" },
  { from: "fontes", to: "roadmap", label: "gaps", type: "intelligence" },
  { from: "jitbit", to: "helpdesk", label: "polling 2min", type: "data" },
  { from: "helpdesk", to: "chat", label: "classificar", type: "process" },
  { from: "helpdesk", to: "fila", label: "revisao humana", type: "quality" },
  { from: "helpdesk", to: "sla", label: "metricas SLA", type: "quality" },
  { from: "helpdesk", to: "sites", label: "por site", type: "process" },
  { from: "chat", to: "kb", label: "busca semantica", type: "knowledge" },
  { from: "whatsapp", to: "chat", label: "mensagens", type: "data" },
  { from: "whatsapp", to: "helpdesk", label: "criar ticket", type: "process" },
  { from: "axhub_db", to: "dashboards", label: "KPIs", type: "data" },
  { from: "axton_db", to: "dashboards", label: "KPIs", type: "data" },
  { from: "axcross_db", to: "dashboards", label: "KPIs", type: "data" },
  { from: "axhub_db", to: "relatorio", label: "passagens", type: "data" },
  { from: "dashboards", to: "hub", label: "consolidar", type: "process" },
  { from: "relatorio", to: "hub", label: "metricas", type: "process" },
  { from: "upload", to: "analise_img", label: "imagens", type: "data" },
  { from: "analise_img", to: "fila", label: "confianca < 60%", type: "quality" },
  { from: "treino", to: "kb", label: "pares Q&A", type: "knowledge" },
  { from: "gerar_doc", to: "kb", label: "reindexar", type: "knowledge" },
  { from: "sla", to: "hub", label: "compliance", type: "process" },
  { from: "sites", to: "hub", label: "por site", type: "process" },
  { from: "fila", to: "hub", label: "pendentes", type: "quality" },
  { from: "hub", to: "agent", label: "estado", type: "process" },
  { from: "agent", to: "logs", label: "registrar", type: "data" },
  { from: "helpdesk", to: "logs", label: "registrar", type: "data" },
  { from: "chat", to: "logs", label: "registrar", type: "data" },
];

const PIPELINES = [
  { id: "edital", name: "Pipeline de Editais", icon: "\u{1F3DB}\uFE0F", color: "#3b82f6", steps: ["pncp", "editais", "conformidade", "multi", "fila", "roadmap", "specs"], summary: "Busca editais - Extrai requisitos - Analisa conformidade - Gera roadmap - Cria PRDs" },
  { id: "atendimento", name: "Pipeline de Atendimento", icon: "\u{1F3A7}", color: "#10b981", steps: ["jitbit", "whatsapp", "helpdesk", "chat", "kb", "fila", "sla", "sites"], summary: "Jitbit/WhatsApp - Classificacao IA - Busca KB - Sugere resposta - Mede SLA" },
  { id: "imagem", name: "Pipeline de Imagens", icon: "\u{1F4F7}", color: "#f59e0b", steps: ["upload", "analise_img", "fila"], summary: "Upload - GPT-4o Vision - Score confianca - Fila revisao humana" },
  { id: "operacional", name: "Pipeline Operacional", icon: "\u{1F4CA}", color: "#8b5cf6", steps: ["axhub_db", "axton_db", "axcross_db", "dashboards", "relatorio", "hub", "agent"], summary: "3 bancos - KPIs - Relatorio de fluxo - Intelligence Hub - Agente autonomo" },
  { id: "conhecimento", name: "Pipeline de Conhecimento", icon: "\u{1F4DA}", color: "#ec4899", steps: ["gerar_doc", "treino", "kb", "chat"], summary: "Gera docs - Treina Q&A - Embeddings - Chat IA" },
];

const GROUP_COLORS = {
  entrada: { bg: "rgba(99,102,241,0.08)", border: "#6366f1", label: "\u{1F535} Fontes de Dados" },
  processamento: { bg: "rgba(59,130,246,0.08)", border: "#3b82f6", label: "\u{1F537} Processamento" },
  qualidade: { bg: "rgba(16,185,129,0.08)", border: "#10b981", label: "\u{1F7E2} Qualidade" },
  inteligencia: { bg: "rgba(245,158,11,0.08)", border: "#f59e0b", label: "\u{1F7E1} Inteligencia" },
  conhecimento: { bg: "rgba(236,72,153,0.08)", border: "#ec4899", label: "\u{1FA77} Conhecimento" },
  saida: { bg: "rgba(139,92,246,0.08)", border: "#8b5cf6", label: "\u{1F7E3} Resultado" },
};
const CONNECTION_COLORS = { data: "#6366f1", process: "#3b82f6", quality: "#10b981", intelligence: "#f59e0b", knowledge: "#ec4899" };

// PROCESSOS OPERACIONAIS
const PROCESSOS_AXHUB = [
  { modulo: "Infracoes", icone: "\u{1F6A8}", itens: ["Triagem (validacao de infracoes)", "Auditoria (revisao de triagens)", "Consulta de Infracoes", "Exportacao (envio para orgaos)", "Excecoes (regras automaticas)", "Infracoes Descartadas"] },
  { modulo: "Operacoes", icone: "\u{1F527}", itens: ["Cadastro de Operacoes", "Afericoes (certificados INMETRO)", "Faixas (monitoramento)", "Monitoramento Online", "Eventos de Equipamentos", "Consulta de Placas"] },
  { modulo: "Equipamentos", icone: "\u{1F4E1}", itens: ["Fabricantes", "Tipos de Equipamentos", "Modelos de Equipamentos", "Grupos de Equipamentos", "Lista de Equipamentos"] },
  { modulo: "Medicao", icone: "\u{1F4CF}", itens: ["Contratos", "Indices de Performance", "Criar Medicao", "Interrupcoes", "Medicoes Finalizadas", "Recursos"] },
  { modulo: "Pesagem / Balanca", icone: "\u2696\uFE0F", itens: ["Postos de Pesagem", "Tickets em Aberto", "Tickets Fechados", "Liberar Pesagem", "Reclassificacao", "Motivos"] },
  { modulo: "Cronotacografo", icone: "\u23F1\uFE0F", itens: ["Triagem Cronotacografo", "Consulta Cronotacografo"] },
  { modulo: "Relatorios / BI", icone: "\u{1F4C8}", itens: ["Infracoes", "Eventos de Equipamentos", "Passagens / Fluxo", "Fluxo Diario", "Falhas Sequenciais", "Discrepancias", "Logs de Envios", "Lote de Importacao", "Power BI (dashboards)"] },
  { modulo: "Veiculos", icone: "\u{1F697}", itens: ["Tipos", "Especies", "Marcas", "Modelos", "Cores", "Categorias", "Classificacoes", "Municipios"] },
  { modulo: "Controle de Acesso", icone: "\u{1F510}", itens: ["Usuarios", "Perfis de Acesso", "Permissoes", "Logs de Acesso", "Restricao por IP"] },
  { modulo: "Administracao", icone: "\u2699\uFE0F", itens: ["Configuracoes do Sistema", "Arcos", "Enquadramentos", "Formas de Autuacao", "Layouts de Arquivos", "Motivos de Descarte", "Regioes", "Sequenciais", "Tarjas", "Tipos de Afericoes", "Tipos de Imagens", "Webhooks", "Power BI"] },
];

const PROCESSOS_AXCROSS = [
  { modulo: "Veiculos Monitorados", icone: "\u{1F697}", itens: ["Lista de Veiculos Monitorados", "Tipos de Ocorrencias (vigencia automatica)", "Alertas em Tempo Real", "Classificacoes de Veiculos", "Importacao em Lote"] },
  { modulo: "Equipamentos", icone: "\u{1F4E1}", itens: ["Lista de Equipamentos", "Grupos de Equipamentos", "Areas (regioes geograficas)", "Importacao em Lote"] },
  { modulo: "Monitoramento Online", icone: "\u{1F5FA}\uFE0F", itens: ["Monitoramento em Tempo Real (SignalR)", "Mapa de Equipamentos (Google Maps)"] },
  { modulo: "Relatorios", icone: "\u{1F4C8}", itens: ["Passagens (filtros avancados)", "Mapeamento de Rotas", "Rastreamento de Placas", "Veiculos Monitorados", "Ocorrencias e Alertas", "PDFs Gerados"] },
  { modulo: "MDF-e (Fiscal)", icone: "\u{1F4C4}", itens: ["Painel Fiscal / Operacional", "OCR + SEFAZ (MDF-e)", "Monitoramento de Manifesto Eletronico"] },
  { modulo: "Configuracoes", icone: "\u2699\uFE0F", itens: ["Sistema", "Usuarios", "Perfis", "Permissoes", "Logs", "Sincronizacao"] },
];

// FLUXOS DETALHADOS (BPM)
const FLUXOS_DETALHADOS = [
  {
    id: "infracao", titulo: "Processo de Infracao (Inicio - Exportacao)", sistema: "AxHub", cor: "#3b82f6",
    descricao: "Fluxo completo desde a captura da imagem pelo equipamento ate a exportacao do auto de infracao para o orgao autuador.",
    etapas: [
      { passo: 1, nome: "Captura", descricao: "Equipamento de campo detecta infracao e captura imagens (frontal, traseira, panoramica)", ator: "Equipamento", local: "Operacoes - Monitoramento Online" },
      { passo: 2, nome: "Recepcao", descricao: "Sistema recebe passagem via API/FTP e armazena no banco com metadados (velocidade, data, faixa)", ator: "Sistema", local: "Automatico (background)" },
      { passo: 3, nome: "OCR", descricao: "Pipeline de reconhecimento de placas processa as imagens e extrai caracteres", ator: "Sistema", local: "Automatico" },
      { passo: 4, nome: "Triagem", descricao: "Operador analisa infracao: valida placa, verifica enquadramento, confere imagens, aprova ou descarta", ator: "Operador", local: "Infracoes - Triagem" },
      { passo: 5, nome: "Excecoes", descricao: "Regras automaticas descartam infracoes (veiculos oficiais, placas em whitelist, horarios especiais)", ator: "Sistema", local: "Infracoes - Excecoes" },
      { passo: 6, nome: "Auditoria", descricao: "Auditor revisa infracoes triadas por amostragem - valida qualidade do trabalho do operador", ator: "Auditor", local: "Infracoes - Auditoria" },
      { passo: 7, nome: "Exportacao", descricao: "Lote de infracoes validadas e exportado no layout do orgao (DETRAN/Municipio) via arquivo ou API", ator: "Sistema/Operador", local: "Infracoes - Exportacao" },
      { passo: 8, nome: "Confirmacao", descricao: "Orgao confirma recebimento - logs de envio registram sucesso/falha por lote", ator: "Orgao Externo", local: "Relatorios - Logs de Envios" },
    ]
  },
  {
    id: "pesagem", titulo: "Processo de Pesagem Veicular (Balanca)", sistema: "AxHub / AxTon", cor: "#10b981",
    descricao: "Fluxo de pesagem em postos rodoviarios - do momento que o veiculo entra na balanca ate o fechamento do ticket.",
    etapas: [
      { passo: 1, nome: "Entrada no Posto", descricao: "Veiculo e direcionado para a balanca. Sistema inicia leitura de peso e captura de placa", ator: "Operador/Sistema", local: "Pesagem - Postos" },
      { passo: 2, nome: "Leitura de Peso", descricao: "Balanca registra peso bruto. Sistema compara com PBT permitido para o tipo de veiculo", ator: "Sistema", local: "Automatico (sensor)" },
      { passo: 3, nome: "Classificacao", descricao: "Veiculo e classificado automaticamente por tipo/eixos. Operador pode reclassificar se necessario", ator: "Sistema/Operador", local: "Pesagem - Reclassificacao" },
      { passo: 4, nome: "Abertura de Ticket", descricao: "Ticket de pesagem e criado com dados: placa, peso, classificacao, fotos, horario", ator: "Sistema", local: "Pesagem - Tickets em Aberto" },
      { passo: 5, nome: "Verificacao", descricao: "Se excesso de peso: calcular percentual acima do permitido. Se dentro: liberacao imediata", ator: "Operador", local: "Pesagem - Tickets em Aberto" },
      { passo: 6, nome: "Liberacao/Retencao", descricao: "Veiculo regular: liberar. Excesso: reter para transbordo ou autuacao", ator: "Operador", local: "Pesagem - Liberar Pesagem" },
      { passo: 7, nome: "Fechamento", descricao: "Ticket fechado com resultado final: liberado, autuado, ou reclassificado", ator: "Operador", local: "Pesagem - Tickets Fechados" },
    ]
  },
  {
    id: "monitoramento", titulo: "Processo de Monitoramento Online (AxCross)", sistema: "AxCross", cor: "#f97316",
    descricao: "Fluxo de cruzamento de placas em tempo real - da passagem do veiculo ate o disparo de alertas.",
    etapas: [
      { passo: 1, nome: "Passagem", descricao: "Veiculo passa por camera OCR. Sistema captura placa, data/hora, local, imagem", ator: "Equipamento", local: "Automatico (campo)" },
      { passo: 2, nome: "Reconhecimento OCR", descricao: "Placa e processada pelo engine OCR. Resultado com confianca e registrado", ator: "Sistema", local: "Automatico" },
      { passo: 3, nome: "Cruzamento", descricao: "Placa reconhecida e comparada em tempo real com base de veiculos monitorados", ator: "Sistema (SignalR)", local: "Monitoramento Online" },
      { passo: 4, nome: "Match/Alerta", descricao: "Se placa consta na base: alerta e disparado com tipo de ocorrencia (furto, mandado, etc.)", ator: "Sistema", local: "Veiculos Monitorados - Alertas" },
      { passo: 5, nome: "Notificacao", descricao: "Operador recebe alerta visual/sonoro no painel. Informacoes do veiculo e ocorrencia sao exibidas", ator: "Operador", local: "Monitoramento Online - Mapa" },
      { passo: 6, nome: "Acao", descricao: "Operador aciona equipe de campo para abordagem ou registra ocorrencia no relatorio", ator: "Operador/Campo", local: "Relatorios - Ocorrencias e Alertas" },
      { passo: 7, nome: "Registro", descricao: "Passagem e acao tomada sao registradas para auditoria e relatorios futuros", ator: "Sistema", local: "Relatorios - Passagens" },
    ]
  },
  {
    id: "medicao", titulo: "Processo de Medicao Contratual", sistema: "AxHub", cor: "#8b5cf6",
    descricao: "Fluxo de medicao de performance dos equipamentos para faturamento - do contrato ate a medicao final.",
    etapas: [
      { passo: 1, nome: "Contrato", descricao: "Cadastro do contrato com: cliente, vigencia, equipamentos vinculados, indices minimos", ator: "Gerente", local: "Medicao - Contratos" },
      { passo: 2, nome: "Indices de Performance", descricao: "Definicao dos KPIs: disponibilidade minima (%), OCR minimo (%), uptime esperado", ator: "Gerente", local: "Medicao - Indices de Performance" },
      { passo: 3, nome: "Coleta Automatica", descricao: "Sistema calcula diariamente: heartbeats, passagens, falhas, disponibilidade por equipamento", ator: "Sistema", local: "Automatico (cron)" },
      { passo: 4, nome: "Registrar Interrupcoes", descricao: "Eventos que justificam indisponibilidade: manutencao preventiva, vandalismo, quedas de energia", ator: "Operador", local: "Medicao - Interrupcoes" },
      { passo: 5, nome: "Criar Medicao", descricao: "Gerar medicao do periodo: sistema consolida dados e aplica descontos por indisponibilidade", ator: "Gerente/Sistema", local: "Medicao - Criar Medicao" },
      { passo: 6, nome: "Revisao", descricao: "Conferencia dos valores: total de dias, disponibilidade real vs minima, penalidades aplicadas", ator: "Gerente", local: "Medicao - Medicoes Finalizadas" },
      { passo: 7, nome: "Finalizacao", descricao: "Medicao aprovada - gera relatorio para faturamento - exporta para financeiro", ator: "Gerente", local: "Medicao - Medicoes Finalizadas" },
    ]
  },
  {
    id: "helpdesk-flow", titulo: "Processo de Atendimento Helpdesk (com IA)", sistema: "AxionIA + Jitbit", cor: "#ec4899",
    descricao: "Fluxo completo de atendimento ao cliente - do chamado ate a resolucao com assistencia de IA.",
    etapas: [
      { passo: 1, nome: "Abertura", descricao: "Cliente abre chamado via Jitbit (e-mail, portal) ou via WhatsApp. Ticket e criado com assunto e descricao", ator: "Cliente", local: "Jitbit / WhatsApp" },
      { passo: 2, nome: "Polling", descricao: "AxionIA faz polling a cada 2 minutos e puxa novos tickets nao respondidos", ator: "Sistema (cron)", local: "Automatico" },
      { passo: 3, nome: "Classificacao IA", descricao: "Engine classifica o ticket: produto (AxHub/AxTon/AxCross), categoria, prioridade, site", ator: "IA", local: "Helpdesk - Classificar" },
      { passo: 4, nome: "Busca KB", descricao: "IA busca na Knowledge Base por resposta similar (cosine similarity > 0.7)", ator: "IA", local: "Knowledge Base (embeddings)" },
      { passo: 5, nome: "Geracao de Resposta", descricao: "Se KB encontrou: usa resposta existente. Se nao: GPT-4o gera resposta com contexto do produto", ator: "IA", local: "Engine - GPT-4o" },
      { passo: 6, nome: "Fila de Revisao", descricao: "Resposta sugerida vai para fila de aprovacao humana. Tecnico pode editar, aprovar ou rejeitar", ator: "Tecnico", local: "Helpdesk - Fila de Revisao" },
      { passo: 7, nome: "Envio", descricao: "Apos aprovacao: resposta e postada no Jitbit como comentario. Cliente e notificado", ator: "Sistema", local: "Jitbit (API)" },
      { passo: 8, nome: "SLA", descricao: "Metricas de tempo de resposta sao calculadas por prioridade e site para compliance report", ator: "Sistema", local: "SLA Compliance" },
    ]
  },
  {
    id: "operacao", titulo: "Processo de Operacao de Equipamento", sistema: "AxHub", cor: "#f59e0b",
    descricao: "Fluxo de cadastro e gestao de operacoes de equipamentos de campo - da instalacao ao monitoramento.",
    etapas: [
      { passo: 1, nome: "Cadastro de Equipamento", descricao: "Registrar equipamento: fabricante, modelo, grupo, numero de serie, configuracoes", ator: "Gerente", local: "Equipamentos - Lista" },
      { passo: 2, nome: "Afericao", descricao: "Registrar certificado INMETRO: data da afericao, validade, numero do certificado, portaria", ator: "Operador", local: "Operacoes - Afericoes" },
      { passo: 3, nome: "Cadastro de Operacao", descricao: "Criar operacao: vincular equipamento, definir local (lat/lng), velocidade regulamentada, faixas", ator: "Operador", local: "Operacoes - Cadastro" },
      { passo: 4, nome: "Ativacao", descricao: "Operacao e ativada - equipamento comeca a registrar passagens e gerar eventos", ator: "Operador", local: "Operacoes - Cadastro" },
      { passo: 5, nome: "Monitoramento", descricao: "Painel em tempo real mostra heartbeat, ultimas passagens, status de comunicacao", ator: "Operador", local: "Operacoes - Monitoramento Online" },
      { passo: 6, nome: "Eventos", descricao: "Sistema registra eventos: offline, sem comunicacao, falha de camera, energia", ator: "Sistema", local: "Operacoes - Eventos de Equipamentos" },
      { passo: 7, nome: "Manutencao", descricao: "Quando evento critico: tecnico e acionado, registra interrupcao na medicao", ator: "Tecnico", local: "Medicao - Interrupcoes" },
    ]
  },
];

// SITES E ACESSOS
const AXCROSS_EXTRA = [
  { id: "detranpi-cross", nome: "DETRANPI", url: "https://detranpi.axcross.axion.ws", estado: "PI", status: "ativo" },
  { id: "ipemmt-cross", nome: "IPEMMT", url: "https://ipemmt.axcross.axion.ws", estado: "MT", status: "ativo" },
  { id: "derse-cross", nome: "DERSE", url: "https://derse.axcross.axion.ws", estado: "SE", status: "ativo" },
  { id: "ipemce-cross", nome: "IPEMCE", url: "https://ipemce.axcross.axion.ws", estado: "CE", status: "ativo" },
  { id: "setrans-cross", nome: "SETRANS", url: "https://setrans.axcross.axion.ws", estado: "GO", status: "ativo" },
  { id: "detranma-cross", nome: "DETRANMA", url: "https://detranma.axcross.axion.ws", estado: "MA", status: "ativo" },
  { id: "imperatriz-cross", nome: "IMPERATRIZ", url: "https://imperatriz.axcross.axion.ws", estado: "MA", status: "ativo" },
  { id: "ipempe-cross", nome: "IPEMPE", url: "https://ipempe.axcross.axion.ws", estado: "PE", status: "ativo" },
  { id: "sefazpi-cross", nome: "SEFAZPI", url: "https://sefazpi.axcross.axion.ws", estado: "PI", status: "ativo" },
  { id: "goiania-cross", nome: "GOIÂNIA", url: "https://goiania.axcross.axion.ws", estado: "GO", status: "ativo" },
  { id: "economia-cross", nome: "ECONOMIA", url: "https://economia.axcross.axion.ws", estado: "GO", status: "ativo" },
  { id: "homologacao-cross", nome: "HOMOLOGACAO", url: "https://homologacao.axcross.axion.ws", estado: "-", status: "ativo" },
];

const GRUPOS_ACESSO = [
  { grupo: "Grupo Axion (suporte)", login: "suporte@axiontecnologia.com.br", senha: "Axion#2023", sites: ["homologacao.axhub.axion.ws", "goiania.axhub.axion.ws", "imepi.axhub.axion.ws", "ipemmt.axcross.axion.ws", "derse.axcross.axion.ws", "economia.axion.ws", "economia.axcross.axion.ws", "homologacao.axcross.axion.ws", "identity.axion.ws", "ipemce.axcross.axion.ws", "strans.axhub.axion.ws"] },
  { grupo: "Grupo Admin (operacao)", login: "Admin", senha: "labor5383", sites: ["smtt.axhub.axion.ws", "ipemmt.axhub.axion.ws", "derse.axhub.axion.ws", "detranma.axhub.axion.ws", "detranpi.axhub.axion.ws", "goiania.id.axion.ws", "homologacao.axhub.axion.ws", "ibametro.axhub.axion.ws", "imepi.axhub.axion.ws", "imeqpb.axhub.axion.ws", "imetropa.axhub.axion.ws", "imperatriz.axhub.axion.ws", "ipemce.axhub.axion.ws", "itps.axhub.axion.ws", "setrans.axhub.axion.ws", "strans.axhub.axion.ws"] },
  { grupo: "Grupo Admin (alt)", login: "admin", senha: "Labor5383", sites: ["goiania.id.axion.ws", "ipempe.axhub.axion.ws", "strans.axhub.axion.ws"] },
  { grupo: "Grupo AxCross (2025)", login: "suporte@axiontecnologia.com.br", senha: "Axion#2025", sites: ["setrans.axcross.axion.ws", "detranma.axcross.axion.ws", "goiania.axion.ws", "goiania.id.axion.ws", "goiania.axcross.axion.ws", "imperatriz.axcross.axion.ws", "ipempe.axcross.axion.ws", "sefazpi.axcross.axion.ws"] },
  { grupo: "AxCross DETRANPI", login: "detranpi", senha: "Axion@2025", sites: ["detranpi.axcross.axion.ws"] },
  { grupo: "AxCross IPEMCE", login: "ipemce", senha: "Axion#2023", sites: ["ipemce.axhub.axion.ws"] },
];

// ===== COMPONENTE PRINCIPAL =====
export default function MapaOperacoes() {
  const [aba, setAba] = useState("mapa");
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filtroSistema, setFiltroSistema] = useState("todos");
  const [busca, setBusca] = useState("");
  const [fluxoAberto, setFluxoAberto] = useState(null);
  
  // Estados para zoom e pan
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [buscaNo, setBuscaNo] = useState("");

  const todosSites = useMemo(() => {
    const axhub = AXHUB_SITES.map(s => ({ ...s, sistema: "AxHub" }));
    const axcross = AXCROSS_SITES.map(s => ({ ...s, sistema: "AxCross" }));
    const extras = AXCROSS_EXTRA.filter(e => !AXCROSS_SITES.some(s => s.id === e.id)).map(s => ({ ...s, sistema: "AxCross" }));
    return [...axhub, ...axcross, ...extras];
  }, []);

  const sitesFiltrados = useMemo(() => {
    let lista = todosSites;
    if (filtroSistema !== "todos") lista = lista.filter(s => s.sistema === filtroSistema);
    if (busca) { const q = busca.toLowerCase(); lista = lista.filter(s => s.nome.toLowerCase().includes(q) || (s.estado || "").toLowerCase().includes(q) || (s.url || "").toLowerCase().includes(q)); }
    return lista;
  }, [todosSites, filtroSistema, busca]);

  const activeSteps = selectedPipeline ? PIPELINES.find(p => p.id === selectedPipeline)?.steps || [] : [];
  const activeConns = selectedPipeline ? CONNECTIONS.filter(c => activeSteps.includes(c.from) && activeSteps.includes(c.to)) : CONNECTIONS;
  const relatedNodes = hoveredNode ? new Set([hoveredNode, ...CONNECTIONS.filter(c => c.from === hoveredNode).map(c => c.to), ...CONNECTIONS.filter(c => c.to === hoveredNode).map(c => c.from)]) : null;
  const nodePos = {}; NODES.forEach(n => { nodePos[n.id] = { x: n.x, y: n.y }; });

  // Funções de zoom e pan
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleZoomReset = () => { setZoom(1); setPanX(0); setPanY(0); };
  
  const handleMouseDown = (e) => {
    if (e.target.tagName !== 'rect' && e.target.tagName !== 'text') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
    }
  };
  
  const handleMouseMove = (e) => {
    if (isDragging) {
      setPanX(e.clientX - dragStart.x);
      setPanY(e.clientY - dragStart.y);
    }
  };
  
  const handleMouseUp = () => setIsDragging(false);
  
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    setZoom(prev => Math.min(Math.max(prev + delta, 0.5), 3));
  };
  
  // Buscar nós
  const nosFiltrados = useMemo(() => {
    if (!buscaNo) return NODES;
    const q = buscaNo.toLowerCase();
    return NODES.filter(n => 
      n.label.toLowerCase().includes(q) || 
      n.desc.toLowerCase().includes(q) ||
      n.id.toLowerCase().includes(q)
    );
  }, [buscaNo]);
  
  const noDestacado = useMemo(() => {
    if (!buscaNo || nosFiltrados.length === 0) return null;
    return nosFiltrados[0].id;
  }, [buscaNo, nosFiltrados]);

  const ABAS = [
    { id: "mapa", label: "\u{1F517} Mapa Visual" },
    { id: "fluxos", label: "\u{1F4D0} Fluxos Detalhados" },
    { id: "processos", label: "\u{1F4CB} Processos" },
    { id: "sites", label: "\u{1F3E2} Sites" },
    { id: "acessos", label: "\u{1F511} Acessos" },
  ];

  return (
    <div className="pp-container">
      {/* Stats */}
      <div className="pp-stats">
        <div className="pp-stat"><div className="pp-stat-value">{todosSites.length}</div><div className="pp-stat-label">Sites</div></div>
        <div className="pp-stat"><div className="pp-stat-value" style={{ color: "#60a5fa" }}>{PROCESSOS_AXHUB.reduce((a, p) => a + p.itens.length, 0)}</div><div className="pp-stat-label">Processos AxHub</div></div>
        <div className="pp-stat"><div className="pp-stat-value" style={{ color: "#f97316" }}>{PROCESSOS_AXCROSS.reduce((a, p) => a + p.itens.length, 0)}</div><div className="pp-stat-label">Processos AxCross</div></div>
        <div className="pp-stat"><div className="pp-stat-value" style={{ color: "#22c55e" }}>{FLUXOS_DETALHADOS.length}</div><div className="pp-stat-label">Fluxos BPM</div></div>
        <div className="pp-stat"><div className="pp-stat-value" style={{ color: "#8b5cf6" }}>{PIPELINES.length}</div><div className="pp-stat-label">Pipelines IA</div></div>
        <div className="pp-stat"><div className="pp-stat-value">{NODES.length}</div><div className="pp-stat-label">Nos no Mapa</div></div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '8px 0 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <QuickSelect options={ABAS} value={aba} onChange={setAba} color="#6366f1" label="Seção" />
      </div>

      {/* ABA: MAPA VISUAL */}
      {aba === "mapa" && (
        <div>
          {/* Controles de Zoom e Busca */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            <input 
              type="text" 
              placeholder="🔍 Buscar nó no mapa..."
              value={buscaNo}
              onChange={(e) => setBuscaNo(e.target.value)}
              style={{
                flex: "1 1 300px",
                padding: "0.6rem 1rem",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 8,
                color: "#e2e8f0",
                fontSize: "0.85rem"
              }}
            />
            
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <button 
                onClick={handleZoomOut}
                title="Zoom Out"
                style={{
                  padding: "0.5rem 0.8rem",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 6,
                  color: "#e2e8f0",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "bold"
                }}
              >
                -
              </button>
              
              <span style={{ 
                fontSize: "0.8rem", 
                color: "#94a3b8", 
                minWidth: "50px", 
                textAlign: "center",
                fontFamily: "monospace"
              }}>
                {(zoom * 100).toFixed(0)}%
              </span>
              
              <button 
                onClick={handleZoomIn}
                title="Zoom In"
                style={{
                  padding: "0.5rem 0.8rem",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 6,
                  color: "#e2e8f0",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "bold"
                }}
              >
                +
              </button>
              
              <button 
                onClick={handleZoomReset}
                title="Reset View"
                style={{
                  padding: "0.5rem 1rem",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 6,
                  color: "#e2e8f0",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: 600
                }}
              >
                🎯 Reset
              </button>
              
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                style={{
                  padding: "0.5rem 1rem",
                  background: isFullscreen ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 6,
                  color: "#e2e8f0",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: 600
                }}
              >
                {isFullscreen ? "🗗 Exit" : "⛶ Full"}
              </button>
            </div>
          </div>
          
          {/* Resultados da busca */}
          {buscaNo && nosFiltrados.length > 0 && (
            <div style={{
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: 8,
              padding: "0.75rem 1rem",
              marginBottom: "1rem",
              fontSize: "0.85rem",
              color: "#e2e8f0"
            }}>
              🔍 {nosFiltrados.length} nó{nosFiltrados.length > 1 ? 's' : ''} encontrado{nosFiltrados.length > 1 ? 's' : ''}: {' '}
              {nosFiltrados.slice(0, 5).map(n => n.label).join(", ")}
              {nosFiltrados.length > 5 && ` e mais ${nosFiltrados.length - 5}...`}
            </div>
          )}
          
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.2rem" }}>
            <button onClick={() => setSelectedPipeline(null)} style={{ padding: "0.5rem 1rem", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: !selectedPipeline ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.05)", color: "#e2e8f0", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>🔗 Todas</button>
            {PIPELINES.map(p => (
              <button key={p.id} onClick={() => setSelectedPipeline(selectedPipeline === p.id ? null : p.id)} style={{ padding: "0.5rem 1rem", borderRadius: 8, border: `1px solid ${selectedPipeline === p.id ? p.color : "rgba(255,255,255,0.15)"}`, background: selectedPipeline === p.id ? `${p.color}30` : "rgba(255,255,255,0.05)", color: selectedPipeline === p.id ? p.color : "#94a3b8", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>{p.icon} {p.name}</button>
            ))}
          </div>

          {selectedPipeline && (() => { const p = PIPELINES.find(pp => pp.id === selectedPipeline); return (
            <div style={{ background: `${p.color}15`, border: `1px solid ${p.color}40`, borderRadius: 12, padding: "1rem 1.2rem", marginBottom: "1.2rem" }}>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: p.color, marginBottom: "0.3rem" }}>{p.icon} {p.name}</div>
              <div style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>{p.summary}</div>
              <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.6rem", flexWrap: "wrap" }}>
                {p.steps.map((s, i) => { const node = NODES.find(n => n.id === s); return (<React.Fragment key={s}><span style={{ background: `${p.color}25`, color: p.color, padding: "2px 10px", borderRadius: 6, fontSize: "0.78rem", fontWeight: 600 }}>{node?.icon} {node?.label}</span>{i < p.steps.length - 1 && <span style={{ color: "#475569" }}>→</span>}</React.Fragment>); })}
              </div>
            </div>
          ); })()}

          <div 
            style={{ 
              background: "rgba(255,255,255,0.03)", 
              borderRadius: 16, 
              border: "1px solid rgba(255,255,255,0.08)", 
              overflow: "hidden",
              position: isFullscreen ? "fixed" : "relative",
              top: isFullscreen ? 0 : "auto",
              left: isFullscreen ? 0 : "auto",
              width: isFullscreen ? "100vw" : "100%",
              height: isFullscreen ? "100vh" : "auto",
              zIndex: isFullscreen ? 9999 : 1,
              display: "flex",
              flexDirection: "column"
            }}
          >
            {/* Header no modo fullscreen */}
            {isFullscreen && (
              <div style={{
                background: "rgba(15,23,42,0.95)",
                padding: "1rem",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span style={{ color: "#e2e8f0", fontWeight: 600 }}>🗺️ Mapa de Operações - Modo Fullscreen</span>
                <button 
                  onClick={() => setIsFullscreen(false)}
                  style={{
                    padding: "0.4rem 1rem",
                    background: "rgba(239,68,68,0.2)",
                    border: "1px solid rgba(239,68,68,0.4)",
                    borderRadius: 6,
                    color: "#fca5a5",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: 600
                  }}
                >
                  ✕ Fechar
                </button>
              </div>
            )}
            
            <div 
              style={{ 
                flex: 1,
                overflow: "hidden",
                position: "relative",
                cursor: isDragging ? "grabbing" : "grab"
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              {/* SVG com zoom e pan */}
              <svg 
                viewBox="0 0 1060 870" 
                style={{ 
                  width: "100%", 
                  minWidth: isFullscreen ? "100%" : 900, 
                  height: isFullscreen ? "100%" : "auto",
                  transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px)`,
                  transformOrigin: "center center",
                  transition: isDragging ? "none" : "transform 0.1s ease-out"
                }}
              >
              <defs>{Object.entries(CONNECTION_COLORS).map(([type, color]) => (<marker key={type} id={`arrow-${type}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill={color} opacity="0.7" /></marker>))}</defs>
              <rect x="20" y="30" width="200" height="780" rx="16" fill={GROUP_COLORS.entrada.bg} stroke={GROUP_COLORS.entrada.border} strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
              <text x="120" y="22" textAnchor="middle" fontSize="11" fill={GROUP_COLORS.entrada.border} fontWeight="700">{GROUP_COLORS.entrada.label}</text>
              <rect x="235" y="30" width="210" height="290" rx="16" fill={GROUP_COLORS.processamento.bg} stroke={GROUP_COLORS.processamento.border} strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
              <text x="340" y="22" textAnchor="middle" fontSize="11" fill={GROUP_COLORS.processamento.border} fontWeight="700">{GROUP_COLORS.processamento.label}</text>
              <rect x="460" y="270" width="200" height="270" rx="16" fill={GROUP_COLORS.qualidade.bg} stroke={GROUP_COLORS.qualidade.border} strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
              <text x="560" y="262" textAnchor="middle" fontSize="11" fill={GROUP_COLORS.qualidade.border} fontWeight="700">{GROUP_COLORS.qualidade.label}</text>
              <rect x="680" y="30" width="180" height="270" rx="16" fill={GROUP_COLORS.inteligencia.bg} stroke={GROUP_COLORS.inteligencia.border} strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
              <text x="770" y="22" textAnchor="middle" fontSize="11" fill={GROUP_COLORS.inteligencia.border} fontWeight="700">{GROUP_COLORS.inteligencia.label}</text>
              <rect x="680" y="370" width="180" height="280" rx="16" fill={GROUP_COLORS.conhecimento.bg} stroke={GROUP_COLORS.conhecimento.border} strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
              <text x="770" y="362" textAnchor="middle" fontSize="11" fill={GROUP_COLORS.conhecimento.border} fontWeight="700">{GROUP_COLORS.conhecimento.label}</text>
              <rect x="900" y="270" width="140" height="380" rx="16" fill={GROUP_COLORS.saida.bg} stroke={GROUP_COLORS.saida.border} strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
              <text x="970" y="262" textAnchor="middle" fontSize="11" fill={GROUP_COLORS.saida.border} fontWeight="700">{GROUP_COLORS.saida.label}</text>
              {activeConns.map((c, i) => { const f = nodePos[c.from], t = nodePos[c.to]; if (!f || !t) return null; const dimmed = selectedPipeline && !activeSteps.includes(c.from); const relHighlight = relatedNodes && relatedNodes.has(c.from) && relatedNodes.has(c.to); const opacity = dimmed ? 0.08 : relHighlight ? 0.9 : relatedNodes ? 0.15 : 0.35; const color = CONNECTION_COLORS[c.type] || "#64748b"; const mx = (f.x + t.x) / 2, my = (f.y + t.y) / 2; return (<g key={i}><line x1={f.x + 60} y1={f.y} x2={t.x - 60} y2={t.y} stroke={color} strokeWidth={relHighlight ? 2.5 : 1.5} opacity={opacity} markerEnd={`url(#arrow-${c.type})`} />{opacity > 0.2 && <text x={mx} y={my - 6} textAnchor="middle" fontSize="8" fill={color} opacity={0.8} fontWeight="600">{c.label}</text>}</g>); })}
              {NODES.map(n => { 
                const dimmed = selectedPipeline && !activeSteps.includes(n.id); 
                const isHovered = hoveredNode === n.id; 
                const isRelated = relatedNodes?.has(n.id); 
                const isSearchHighlighted = noDestacado === n.id;
                const isSearchResult = buscaNo && nosFiltrados.some(nf => nf.id === n.id);
                const opacity = dimmed ? 0.15 : isHovered || isSearchHighlighted ? 1 : isRelated || isSearchResult ? 0.95 : relatedNodes ? 0.3 : 0.85; 
                const gc = GROUP_COLORS[n.group]; 
                return (
                  <g key={n.id} opacity={opacity} onMouseEnter={() => setHoveredNode(n.id)} onMouseLeave={() => setHoveredNode(null)} onClick={() => setSelectedNode(selectedNode === n.id ? null : n.id)} style={{ cursor: "pointer" }}>
                    <rect 
                      x={n.x - 55} 
                      y={n.y - 18} 
                      width={110} 
                      height={36} 
                      rx={10} 
                      fill={isHovered || isSearchHighlighted ? `${gc.border}30` : "rgba(15,23,42,0.8)"} 
                      stroke={isSearchHighlighted ? "#fbbf24" : isHovered ? gc.border : `${gc.border}50`} 
                      strokeWidth={isSearchHighlighted ? 3 : isHovered ? 2 : 1} 
                    />
                    {isSearchHighlighted && (
                      <rect 
                        x={n.x - 58} 
                        y={n.y - 21} 
                        width={116} 
                        height={42} 
                        rx={12} 
                        fill="none" 
                        stroke="#fbbf24" 
                        strokeWidth={2} 
                        opacity={0.6}
                        strokeDasharray="4 2"
                      >
                        <animate attributeName="stroke-opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
                      </rect>
                    )}
                    <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize="11" fontWeight="700" fill={isHovered || isSearchHighlighted ? "#f8fafc" : "#cbd5e1"}>{n.icon} {n.label}</text>
                  </g>
                ); 
              })}
            </svg>
            
            {/* Minimap */}
            <div style={{
              position: "absolute",
              bottom: "1rem",
              right: "1rem",
              width: "150px",
              height: "120px",
              background: "rgba(15,23,42,0.9)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 8,
              overflow: "hidden",
              pointerEvents: "none"
            }}>
              <svg viewBox="0 0 1060 870" style={{ width: "100%", height: "100%" }}>
                <rect width="1060" height="870" fill="rgba(15,23,42,0.5)" />
                {NODES.map(n => (
                  <circle 
                    key={n.id} 
                    cx={n.x} 
                    cy={n.y} 
                    r={4} 
                    fill={selectedNode === n.id ? "#fbbf24" : GROUP_COLORS[n.group].border} 
                    opacity={0.6}
                  />
                ))}
                {/* Viewport indicator */}
                <rect 
                  x="0" 
                  y="0" 
                  width={1060 / zoom} 
                  height={870 / zoom} 
                  fill="none" 
                  stroke="#60a5fa" 
                  strokeWidth={2 / zoom}
                  opacity={0.5}
                />
              </svg>
              <div style={{
                position: "absolute",
                top: 4,
                left: 4,
                fontSize: "0.65rem",
                color: "rgba(255,255,255,0.6)",
                fontWeight: 600
              }}>
                MINIMAP
              </div>
            </div>
            </div>
          </div>

          {selectedNode && (() => { const n = NODES.find(nd => nd.id === selectedNode); const incoming = CONNECTIONS.filter(c => c.to === selectedNode); const outgoing = CONNECTIONS.filter(c => c.from === selectedNode); const gc = GROUP_COLORS[n.group]; return (
            <div style={{ marginTop: "1rem", background: "rgba(255,255,255,0.04)", border: `1px solid ${gc.border}40`, borderRadius: 12, padding: "1.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
                <div><span style={{ fontSize: "1.3rem" }}>{n.icon}</span> <span style={{ fontSize: "1.1rem", fontWeight: 700, color: gc.border }}>{n.label}</span></div>
                {n.link && <Link to={n.link} style={{ background: `${gc.border}20`, color: gc.border, padding: "6px 14px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 600, textDecoration: "none", border: `1px solid ${gc.border}40` }}>Abrir pagina {"\u2192"}</Link>}
              </div>
              <p style={{ color: "#94a3b8", fontSize: "0.88rem", lineHeight: 1.6, margin: 0 }}>{n.desc}</p>
              {/* Link para fluxo detalhado se existir */}
              {(() => { const fluxoRelacionado = FLUXOS_DETALHADOS.find(f => n.desc.toLowerCase().includes(f.id) || f.titulo.toLowerCase().includes(n.label.toLowerCase()) || (n.id === "helpdesk" && f.id === "helpdesk-flow") || (n.id === "analise_img" && f.id === Use Infração (com acento) || (n.id === "conformidade" && f.id === "medicao")); return fluxoRelacionado ? (<button onClick={() => { setAba("fluxos"); setFluxoAberto(fluxoRelacionado.id); setSelectedNode(null); }} style={{ marginTop: "0.6rem", background: `${fluxoRelacionado.cor}20`, border: `1px solid ${fluxoRelacionado.cor}40`, color: fluxoRelacionado.cor, padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}>{"\u{1F4D0}"} Ver fluxo: {fluxoRelacionado.titulo}</button>) : null; })()}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                <div><div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "0.4rem" }}>{"\u2B05\uFE0F"} Recebe de ({incoming.length})</div>{incoming.map((c, i) => { const src = NODES.find(nd => nd.id === c.from); return <div key={i} style={{ fontSize: "0.82rem", color: "#cbd5e1", marginBottom: 4 }}>{src?.icon} {src?.label} <span style={{ color: "#64748b" }}>({c.label})</span></div>; })}{incoming.length === 0 && <div style={{ color: "#475569", fontSize: "0.82rem" }}>Fonte primaria</div>}</div>
                <div><div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "0.4rem" }}>{"\u27A1\uFE0F"} Envia para ({outgoing.length})</div>{outgoing.map((c, i) => { const tgt = NODES.find(nd => nd.id === c.to); return <div key={i} style={{ fontSize: "0.82rem", color: "#cbd5e1", marginBottom: 4 }}>{tgt?.icon} {tgt?.label} <span style={{ color: "#64748b" }}>({c.label})</span></div>; })}{outgoing.length === 0 && <div style={{ color: "#475569", fontSize: "0.82rem" }}>Ponto final</div>}</div>
              </div>
            </div>
          ); })()}
        </div>
      )}

      {/* ABA: FLUXOS DETALHADOS */}
      {aba === "fluxos" && (
        <div className="pp-section">
          <h3>{"\u{1F4D0}"} Fluxos de Processo Detalhados (BPM) - {FLUXOS_DETALHADOS.length} processos mapeados</h3>
          {!fluxoAberto ? (
            <div className="pp-proc-grid">
              {FLUXOS_DETALHADOS.map(f => (
                <div key={f.id} className="pp-proc-card" style={{ cursor: "pointer", borderLeft: `3px solid ${f.cor}` }} onClick={() => setFluxoAberto(f.id)}>
                  <h4 style={{ color: f.cor }}>{f.titulo}</h4>
                  <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.5rem" }}>
                    <span className={`pp-badge pp-badge-${f.sistema.includes("AxCross") ? "axcross" : "axhub"}`}>{f.sistema}</span>
                    <span style={{ marginLeft: "0.5rem" }}>{f.etapas.length} etapas</span>
                  </div>
                  <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.6)", margin: 0 }}>{f.descricao}</p>
                  <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                    {f.etapas.slice(0, 4).map((e, i) => (
                      <span key={i} style={{ background: `${f.cor}20`, color: f.cor, padding: "2px 8px", borderRadius: 4, fontSize: "0.7rem" }}>{e.nome}</span>
                    ))}
                    {f.etapas.length > 4 && <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem" }}>+{f.etapas.length - 4}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (() => {
            const f = FLUXOS_DETALHADOS.find(fl => fl.id === fluxoAberto);
            const svgW = Math.max(f.etapas.length * 280 + 80, 1400);
            const svgH = 360;
            return (
              <div>
                <button onClick={() => setFluxoAberto(null)} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#e2e8f0", padding: "0.4rem 1rem", borderRadius: 6, cursor: "pointer", marginBottom: "1rem", fontSize: "0.82rem" }}>← Voltar aos fluxos</button>
                <div style={{ borderLeft: `3px solid ${f.cor}`, paddingLeft: "1rem", marginBottom: "1rem" }}>
                  <h3 style={{ color: f.cor, margin: "0 0 0.3rem" }}>{f.titulo}</h3>
                  <p style={{ color: "rgba(255,255,255,0.6)", margin: "0 0 0.5rem", fontSize: "0.88rem" }}>{f.descricao}</p>
                  <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>
                    <span>🏷️ {f.sistema}</span>
                    <span>📊 {f.etapas.length} etapas</span>
                  </div>
                </div>

                {/* MAPA VISUAL DO PROCESSO (SVG flowchart) */}
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", overflow: "auto", marginBottom: "1.5rem", padding: "1rem" }}>
                  <div style={{ fontSize: "1rem", color: "#e2e8f0", marginBottom: "1rem", fontWeight: 700 }}>📐 MAPA VISUAL DO FLUXO</div>
                  <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: "100%", minWidth: 1100, height: "auto", maxHeight: "500px" }}>
                    <defs>
                      <marker id="flow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill={f.cor} opacity="1" /></marker>
                      <filter id="text-shadow">
                        <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.8" floodColor="#000" />
                      </filter>
                    </defs>
                    {f.etapas.map((e, i) => {
                      const cx = 140 + i * 280;
                      const cy = 180;
                      const isFirst = i === 0;
                      const isLast = i === f.etapas.length - 1;
                      const isSystem = e.ator === "Sistema" || e.ator === "IA" || e.ator === "Sistema (cron)" || e.ator === "Sistema (SignalR)";
                      const nodeShape = isFirst ? "start" : isLast ? "end" : isSystem ? "auto" : "manual";
                      const nodeWidth = 180;
                      const nodeHeight = 80;
                      return (
                        <g key={i}>
                          {/* Connection arrow */}
                          {i > 0 && <line x1={140 + (i-1) * 280 + nodeWidth/2} y1={cy} x2={cx - nodeWidth/2 - 10} y2={cy} stroke={f.cor} strokeWidth="4" opacity="0.8" markerEnd="url(#flow-arrow)" />}
                          
                          {/* Node background */}
                          {nodeShape === "start" && <circle cx={cx} cy={cy} r={50} fill={`${f.cor}40`} stroke={f.cor} strokeWidth="4" />}
                          {nodeShape === "end" && <><circle cx={cx} cy={cy} r={50} fill={`${f.cor}40`} stroke={f.cor} strokeWidth="4" /><circle cx={cx} cy={cy} r={42} fill="none" stroke={f.cor} strokeWidth="3" /></>}
                          {nodeShape === "auto" && <rect x={cx - nodeWidth/2} y={cy - nodeHeight/2} width={nodeWidth} height={nodeHeight} rx={12} fill={`${f.cor}25`} stroke={f.cor} strokeWidth="3" strokeDasharray="8 4" />}
                          {nodeShape === "manual" && <rect x={cx - nodeWidth/2} y={cy - nodeHeight/2} width={nodeWidth} height={nodeHeight} rx={12} fill={`${f.cor}30`} stroke={f.cor} strokeWidth="3" />}
                          
                          {/* Step number badge */}
                          <circle cx={cx - 70} cy={cy - 35} r={18} fill={f.cor} stroke="#fff" strokeWidth="2" />
                          <text x={cx - 70} y={cy - 28} textAnchor="middle" fontSize="20" fill="#fff" fontWeight="900">{e.passo}</text>
                          
                          {/* Label background para melhor legibilidade */}
                          <rect x={cx - 85} y={cy - 12} width={170} height={28} rx={6} fill="rgba(0,0,0,0.6)" />
                          
                          {/* Label (nome da etapa) - MUITO MAIOR */}
                          <text x={cx} y={cy + 6} textAnchor="middle" fontSize="18" fill="#ffffff" fontWeight="800" filter="url(#text-shadow)">
                            {e.nome.length > 18 ? e.nome.slice(0, 17) + ".." : e.nome}
                          </text>
                          
                          {/* Actor label com background */}
                          <rect x={cx - 75} y={cy + 60} width={150} height={30} rx={6} fill="rgba(15,23,42,0.95)" stroke={f.cor} strokeWidth="1.5" />
                          <text x={cx} y={cy + 80} textAnchor="middle" fontSize="15" fill="#fff" fontWeight="700">{e.ator}</text>
                        </g>
                      );
                    })}
                    
                    {/* Legend - MUITO MAIOR E MAIS LEGÍVEL */}
                    <g transform="translate(20, 20)">
                      <rect x="0" y="0" width="380" height="80" rx="10" fill="rgba(15,23,42,0.95)" stroke={f.cor} strokeWidth="2" />
                      <text x="15" y="28" fontSize="16" fill="#fff" fontWeight="900">LEGENDA:</text>
                      
                      <rect x="15" y="42" width="20" height="20" rx="8" fill={`${f.cor}25`} stroke={f.cor} strokeWidth="2.5" strokeDasharray="6 3" />
                      <text x="45" y="57" fontSize="15" fill="#fff" fontWeight="700">Automático</text>
                      
                      <rect x="145" y="42" width="20" height="20" rx="4" fill={`${f.cor}30`} stroke={f.cor} strokeWidth="2.5" />
                      <text x="175" y="57" fontSize="15" fill="#fff" fontWeight="700">Manual</text>
                      
                      <circle cx="285" cy="52" r="10" fill={`${f.cor}40`} stroke={f.cor} strokeWidth="2.5" />
                      <text x="305" y="57" fontSize="15" fill="#fff" fontWeight="700">Início/Fim</text>
                    </g>
                  </svg>
                </div>

                {/* TIMELINE DETALHADA */}
                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginBottom: "0.5rem", fontWeight: 600 }}>DETALHAMENTO POR ETAPA</div>
                <div style={{ position: "relative", paddingLeft: "2rem" }}>
                  {f.etapas.map((e, i) => (
                    <div key={i} style={{ position: "relative", paddingBottom: i < f.etapas.length - 1 ? "1.5rem" : 0, borderLeft: i < f.etapas.length - 1 ? `2px solid ${f.cor}40` : "none", paddingLeft: "1.5rem", marginLeft: "0.5rem" }}>
                      <div style={{ position: "absolute", left: "-0.55rem", top: "0.15rem", width: "1rem", height: "1rem", borderRadius: "50%", background: f.cor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: "#fff", fontWeight: 700 }}>{e.passo}</div>
                      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "0.75rem 1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                          <strong style={{ color: "#f1f5f9", fontSize: "0.9rem" }}>{e.nome}</strong>
                          <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: 4 }}>{e.ator}</span>
                        </div>
                        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.82rem", margin: "0 0 0.3rem", lineHeight: 1.5 }}>{e.descricao}</p>
                        <div style={{ fontSize: "0.75rem", color: f.cor }}>{"\u{1F4CD}"} {e.local}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ABA: PROCESSOS */}
      {aba === "processos" && (
        <div className="pp-section">
          <h3>{"\u{1F4CB}"} Todos os Processos - AxHub ({PROCESSOS_AXHUB.reduce((a, p) => a + p.itens.length, 0)}) + AxCross ({PROCESSOS_AXCROSS.reduce((a, p) => a + p.itens.length, 0)})</h3>
          <h4 style={{ color: "#60a5fa", margin: "1rem 0 0.75rem" }}>AxHub - {PROCESSOS_AXHUB.length} modulos</h4>
          <div className="pp-proc-grid">
            {PROCESSOS_AXHUB.map(p => {
              const fluxoLink = FLUXOS_DETALHADOS.find(f => f.titulo.toLowerCase().includes(p.modulo.toLowerCase().split(" ")[0]) || (p.modulo === "Infracoes" && f.id === "infracao") || (p.modulo === "Pesagem / Balanca" && f.id === "pesagem") || (p.modulo === "Operacoes" && f.id === "operacao") || (p.modulo === "Medicao" && f.id === "medicao"));
              return (
                <div key={p.modulo} className="pp-proc-card">
                  <h4>{p.icone} {p.modulo} <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>({p.itens.length})</span></h4>
                  <ul className="pp-proc-list">{p.itens.map((item, i) => <li key={i}>{item}</li>)}</ul>
                  {fluxoLink && <button onClick={() => { setAba("fluxos"); setFluxoAberto(fluxoLink.id); }} style={{ marginTop: "0.5rem", background: `${fluxoLink.cor}15`, border: `1px solid ${fluxoLink.cor}30`, color: fluxoLink.cor, padding: "3px 10px", borderRadius: 5, cursor: "pointer", fontSize: "0.72rem", fontWeight: 600 }}>{"\u{1F4D0}"} Ver mapa do processo</button>}
                </div>
              );
            })}
          </div>
          <h4 style={{ color: "#f97316", margin: "1.5rem 0 0.75rem" }}>AxCross - {PROCESSOS_AXCROSS.length} modulos</h4>
          <div className="pp-proc-grid">
            {PROCESSOS_AXCROSS.map(p => {
              const fluxoLink = FLUXOS_DETALHADOS.find(f => (p.modulo === "Monitoramento Online" && f.id === "monitoramento") || (p.modulo === "Veiculos Monitorados" && f.id === "monitoramento"));
              return (
                <div key={p.modulo} className="pp-proc-card">
                  <h4>{p.icone} {p.modulo} <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>({p.itens.length})</span></h4>
                  <ul className="pp-proc-list">{p.itens.map((item, i) => <li key={i}>{item}</li>)}</ul>
                  {fluxoLink && <button onClick={() => { setAba("fluxos"); setFluxoAberto(fluxoLink.id); }} style={{ marginTop: "0.5rem", background: `${fluxoLink.cor}15`, border: `1px solid ${fluxoLink.cor}30`, color: fluxoLink.cor, padding: "3px 10px", borderRadius: 5, cursor: "pointer", fontSize: "0.72rem", fontWeight: 600 }}>{"\u{1F4D0}"} Ver mapa do processo</button>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA: SITES */}
      {aba === "sites" && (
        <div className="pp-section">
          <div className="pp-filtros">
            <div className="pp-filtro-group"><label>Sistema</label><select value={filtroSistema} onChange={e => setFiltroSistema(e.target.value)}><option value="todos">Todos</option><option value="AxHub">AxHub</option><option value="AxCross">AxCross</option></select></div>
            <input className="pp-search" placeholder="Buscar site..." value={busca} onChange={e => setBusca(e.target.value)} />
            <div className="pp-filtro-count">{sitesFiltrados.length} sites</div>
          </div>
          <div className="pp-table-wrap">
            <table className="pp-table">
              <thead><tr><th>Site</th><th>Sistema</th><th>UF</th><th>URL</th><th>Status</th></tr></thead>
              <tbody>
                {sitesFiltrados.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.nome}</td>
                    <td><span className={`pp-badge pp-badge-${s.sistema.toLowerCase()}`}>{s.sistema}</span></td>
                    <td>{s.estado || "-"}</td>
                    <td><a href={s.url} target="_blank" rel="noreferrer" className="pp-link">{(s.url || "").replace("https://", "")}</a></td>
                    <td><span className={`pp-badge pp-badge-${s.status === "ativo" ? "ativo" : "inativo"}`}>{s.status === "ativo" ? "\u25CF Ativo" : "\u25CF Inativo"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA: ACESSOS */}
      {aba === "acessos" && (
        <div className="pp-section">
          <h3>{"\u{1F511}"} Grupos de Acesso ({GRUPOS_ACESSO.length} grupos)</h3>
          <div className="pp-cred-grid">
            {GRUPOS_ACESSO.map((g, i) => (
              <div key={i} className="pp-cred-card">
                <h4>{g.grupo}</h4>
                <div className="pp-cred-info"><span>{"\u{1F464}"} {g.login}</span><span>{"\u2022"}</span><span>{g.sites.length} sites</span></div>
                <div className="pp-cred-sites">
                  {g.sites.map((s, j) => (<a key={j} href={`https://${s}`} target="_blank" rel="noreferrer" className="pp-cred-site" style={{ cursor: "pointer", textDecoration: "none", color: "#e2e8f0" }}>{s}</a>))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
