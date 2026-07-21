import React, { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink, Link, useLocation, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Brain, LayoutDashboard, Globe,
  Bot, MessageCircle, Headphones,
  ScanSearch, ScanLine, BookMarked,
  BarChart3, ClipboardList,
  Landmark, Radio,
  FileText, Search, Clock, GraduationCap, ScrollText,
  Settings, ExternalLink, Menu, X,
  Camera, Construction, PieChart, Map, Shield, Activity, TestTube, Eye,
  Wrench, Scale, Navigation,
  FileSearch, Layers, CheckCircle, ClipboardCheck, BookOpen, GitBranch, FileCode, Database, Target, AlertTriangle
} from "lucide-react";
import Dashboard from "./pages/Dashboard.jsx";
import Treinamento from "./pages/Treinamento.jsx";
import Logs from "./pages/Logs.jsx";
import KnowledgeBase from "./pages/KnowledgeBase.jsx";
import Chat from "./pages/Chat.jsx";
import Configuracoes from "./pages/Configuracoes.jsx";
import Helpdesk from "./pages/Helpdesk.jsx";
import GerarDoc from "./pages/GerarDoc.jsx";
import FontesPesquisa from "./pages/FontesPesquisa.jsx";
import RelatorioFluxo from "./pages/RelatorioFluxo.jsx";
import RelatorioContrato from "./pages/RelatorioContrato.jsx";
import PlanilhaHoras from "./pages/PlanilhaHoras.jsx";
import WhatsApp from "./pages/WhatsApp.jsx";
import AnaliseImagens from "./pages/AnaliseImagens.jsx";
import PipelineEditais from "./pages/PipelineEditais.jsx";
import AnalisesSites from "./pages/AnalisesSites.jsx";
import IntelligenceHub from "./pages/IntelligenceHub.jsx";
import OperationsHub from "./pages/OperationsHub.jsx";
import VarcoMonitor from "./pages/VarcoMonitor.jsx";
import AxCrossManager from "./pages/AxCrossManager.jsx";
import AxCrossClassificacaoDiag from "./pages/AxCrossClassificacaoDiag.jsx";
import DuplicidadeInfracoes from "./pages/DuplicidadeInfracoes.jsx";
import IntelligenceDashboard from "./pages/IntelligenceDashboard.jsx";
import DiagnosticoMedicao from "./pages/DiagnosticoMedicao.jsx";
import ValidationManager from "./pages/ValidationManager.jsx";
import VisualValidationManager from "./pages/VisualValidationManager.jsx";
import ValidationHub from "./pages/ValidationHub.jsx";
import SearchHub from "./pages/SearchHub.jsx";
import DiagnosticHub from "./pages/DiagnosticHub.jsx";
import HomePage from "./pages/HomePage.jsx";
import ConsultaInfracoes from "./pages/Ferramentas/ConsultaInfracoes.jsx";
import ResultadosInfracoes from "./pages/Ferramentas/ResultadosInfracoes.jsx";
import AnalisePesagem from "./pages/Ferramentas/AnalisePesagem.jsx";
import ConsultaCruzamentos from "./pages/Ferramentas/ConsultaCruzamentos.jsx";
import QualityDashboard from "./pages/Quality/Dashboard.jsx";
import QualityModules from "./pages/Quality/Modules.jsx";
import QualityRoadmap from "./pages/Quality/Roadmap.jsx";
import QualityReports from "./pages/Quality/Reports.jsx";
import ChamadosSites from "./pages/ChamadosSites.jsx";
import SlaCompliance from "./pages/SlaCompliance.jsx";
import AnalisaMultiProduto from "./pages/AnalisaMultiProduto.jsx";
import AnaliseEditalAvancada from "./pages/AnaliseEditalAvancada.jsx";
import BuscaEditaisGov from "./pages/BuscaEditaisGov.jsx";
import Conformidade from "./pages/Conformidade.jsx";
import ConfidencaRevisao from "./pages/ConfidencaRevisao.jsx";
import GuiaSites from "./pages/GuiaSites.jsx";
import Roadmap from "./pages/Roadmap.jsx";
import Specs from "./pages/Specs.jsx";
import AxHubDashboard from "./pages/AxHubDashboard.jsx";
import ImplementationPlanner from "./pages/ImplementationPlanner.jsx";
import Validacao from "./pages/Validacao/index.jsx";
import CentralSites from "./pages/CentralSites/index.jsx";
import CentralProcessos from "./pages/CentralProcessos/index.jsx";
import CentralValidacao from "./pages/CentralValidacao/index.jsx";
import CentralAtendimento from "./pages/CentralAtendimento/index.jsx";
import HubAnalise from "./pages/HubAnalise/index.jsx";
import CentralQualidade from "./pages/CentralQualidade/index.jsx";
import CentralRelatorios from "./pages/CentralRelatorios/index.jsx";
import CentralGestao from "./pages/CentralGestao/index.jsx";
import CentralInteligencia from "./pages/CentralInteligencia/index.jsx";
import CentralFerramentas from "./pages/CentralFerramentas/index.jsx";
import CUTI from "./pages/CentralQualidade/CUTI.jsx";
import MissionCenter from "./pages/MissionCenter/index.jsx";
import PresentationCenter from "./pages/PresentationCenter/index.jsx";
import { SiteContextProvider } from "./context/SiteContext.jsx";
import "./App.css";
import "./pages/docusaurus-compat.css";

/* ─── Page metadata for headers ─── */
const PAGE_INFO = {
  "/operations-hub": { title: "Operations Hub", subtitle: "Centro de comando operacional — Processos, Métricas e Inteligência", Icon: Brain },
  "/intelligence-hub": { title: "Intelligence Hub", subtitle: "Gerenciador unificado de dados, relatórios e performance", Icon: Brain },
  "/dashboard": { title: "Dashboard", subtitle: "Visão geral dos sistemas e serviços", Icon: LayoutDashboard },
  "/analise": { title: "Análise de Sites", subtitle: "Comparativo de contratos e operações por site", Icon: ScanSearch },
  "/central-sites": { title: "Central de Sites", subtitle: "Ecossistema operacional v3.0 — Dashboard, Análise, Qualidade, Comparação e IA em 18 módulos unificados", Icon: Globe },
  "/central-processos": { title: "Central de Processos", subtitle: "Ecossistema completo: Mapa Visual, Fluxos BPM, Processos AxHub/AxCross e Serviços", Icon: Activity },
  "/central-validacao": { title: "Central de Validação", subtitle: "Hub unificado de validação, revisão e controle de qualidade — 6 módulos integrados", Icon: CheckCircle },
  "/central-atendimento": { title: "Central de Atendimento", subtitle: "Hub unificado: Chat IA, WhatsApp, Helpdesk e Gestão por Site — Visão 360º do cliente", Icon: Headphones },
  "/hub-analise": { title: "AxHub Analisador", subtitle: "Análise unificada de sistemas — Diagnóstico de exportação, busca, imagens, logs e health", Icon: Search },
  "/central-qualidade": { title: "Central de Qualidade", subtitle: "Quality Engineering, Auditoria e Segurança — PIEQ Platform", Icon: Shield },
  "/cuti": { title: "CUTI - Central Unificada de Testes Inteligentes", subtitle: "AxionIA v4.0 — Interface CUEA (22 Engines) — Scenario Learning & Execution", Icon: TestTube },
  "/central-relatorios": { title: "Central de Relatórios", subtitle: "Relatórios operacionais, VARCO Monitor, Medição e SLA", Icon: BarChart3 },
  "/central-inteligencia": { title: "Central de Inteligência", subtitle: "Pipeline completo: Buscar → Analisar → Avaliar → Propor", Icon: Landmark },
  "/central-gestao": { title: "Central de Gestão", subtitle: "Roadmap, Especificações e Planejamento unificado", Icon: GitBranch },
  "/central-ferramentas": { title: "Central de Ferramentas", subtitle: "Consultas unificadas por produto — Infrações, Pesagem e Monitoramento", Icon: Wrench },

  "/chat": { title: "Chat IA", subtitle: "Assistente inteligente AxionIA", Icon: Bot },
  "/whatsapp": { title: "WhatsApp", subtitle: "Integração e atendimento via WhatsApp", Icon: MessageCircle },
  "/helpdesk": { title: "Helpdesk", subtitle: "Gestão de tickets e atendimento Jitbit", Icon: Headphones },
  "/search-hub": { title: "Search Hub", subtitle: "Central unificada de buscas — Sistemas, Imagens e Documentos", Icon: Search },
  "/diagnostic-hub": { title: "Diagnostic Hub", subtitle: "Central de diagnóstico — Medição, Health, Logs e Queries", Icon: Activity },
  "/analise-imagens": { title: "Análise de Imagens", subtitle: "OCR, validação e qualidade de capturas", Icon: Camera },
  "/validation-hub": { title: "Validation Hub", subtitle: "Validação unificada (UI + API + Visual) com seleção de sites", Icon: TestTube },
  "/validacao": { title: "Gerenciador de Validação", subtitle: "Central unificada: Validação, Diagnóstico, Health Check e Descoberta", Icon: Shield },
  "/validation-manager": { title: "Gerenciador de Validação", subtitle: "Validação automatizada de sistemas web (UI + API)", Icon: TestTube },
  "/visual-validation": { title: "Validação Visual Completa", subtitle: "CRUD, Screenshots, Ortografia e Dependências", Icon: Eye },

  "/pipeline-editais": { title: "Pipeline de Editais", subtitle: "Ecossistema completo: Buscar → Analisar → Revisar → Planejar → Especificar", Icon: Construction },
  "/relatorio-contrato": { title: "Relatório por Contrato", subtitle: "Análises técnicas e viabilidade via IA por site/contrato", Icon: ClipboardList },
  "/relatorio-fluxo": { title: "Relatório de Fluxo", subtitle: "Métricas de atendimento e fluxo operacional", Icon: BarChart3 },

  "/kb": { title: "Knowledge Base", subtitle: "Base de conhecimento com embeddings", Icon: BookMarked },
  "/gerar-doc": { title: "Gerador de Docs", subtitle: "Documentação automatizada com IA", Icon: FileText },
  "/fontes": { title: "Fontes de Pesquisa", subtitle: "URLs e referências de pesquisa", Icon: Search },
  "/treinamento": { title: "Treinamento", subtitle: "Capacitação e aprendizado da IA", Icon: GraduationCap },
  "/planilha-horas": { title: "Planilha de Horas", subtitle: "Controle de tempo e atividades", Icon: Clock },
  "/logs": { title: "Logs do Sistema", subtitle: "Auditoria e rastreio de operações", Icon: ScrollText },
  "/config": { title: "Configurações", subtitle: "Configurações do sistema e conexões", Icon: Settings },
  "/varco": { title: "VARCO Monitor", subtitle: "Monitoramento da frota ITScam 450 — 72 dispositivos SETRANS-GO", Icon: Radio },
  "/axcross-manager": { title: "AxCross Manager", subtitle: "Gerenciador unificado: Dashboard, Passagens, Equipamentos, Sites, Diagnóstico e Suporte", Icon: Navigation },
  "/axcross-classificacao-diag": { title: "Diagnóstico Classificação AxCross", subtitle: "Analisa por que o campo CLASSIFICACAO não retorna dados no mapa de equipamentos", Icon: AlertTriangle },
  "/duplicidade": { title: "Auditoria de Duplicidades", subtitle: "Detecção e análise de infrações duplicadas no AxHub", Icon: Shield },
  "/diagnostico-medicao": { title: "Diagnóstico de Medição", subtitle: "Análise inteligente de equipamentos com valores zerados no relatório", Icon: Activity },
  "/ferramentas/consulta-infracoes": { title: "Consultar Infrações", subtitle: "Ferramenta de análise e suporte — Consulte infrações por CPF ou Placa (AxHub)", Icon: Search },
  "/ferramentas/resultados-infracoes": { title: "Resultados da Consulta", subtitle: "Análise detalhada de infrações encontradas", Icon: FileText },
  "/ferramentas/pesagem": { title: "Análise de Pesagem AxTon", subtitle: "Ferramenta de suporte — Consulte pesagens veiculares", Icon: Scale },
  "/ferramentas/cruzamentos": { title: "Monitoramento AxCross", subtitle: "Ferramenta de suporte — Consulte cruzamentos e alertas", Icon: Navigation },
  "/quality": { title: "Quality Engineering Platform", subtitle: "Plataforma de análise automatizada de qualidade, segurança e performance", Icon: Shield },
  "/quality/modules": { title: "Módulos PIEQ", subtitle: "Capabilities e funcionalidades da plataforma", Icon: Shield },
  "/quality/roadmap": { title: "Roadmap PIEQ", subtitle: "Fases de implementação da plataforma", Icon: GitBranch },
  "/quality/reports": { title: "Relatórios de Quality", subtitle: "Histórico completo de scans e validações", Icon: FileCode },
  "/mapa-operacoes": { title: "Mapa de Operações", subtitle: "Visão completa dos sites e processos operacionais", Icon: Map },
  "/painel-processos": { title: "Painel de Processos", subtitle: "Sites, credenciais e métricas operacionais", Icon: PieChart },
  "/intelligence-dashboard": { title: "Intelligence Dashboard", subtitle: "Dashboard inteligente com analytics e métricas avançadas", Icon: PieChart },
  "/chamados-sites": { title: "Chamados por Site", subtitle: "Gestão operacional de chamados por contrato/site", Icon: Headphones },
  "/sla-compliance": { title: "SLA Compliance", subtitle: "Monitoramento e métricas de SLA por contrato", Icon: Activity },
  "/axhub-dashboard": { title: "AxHub Dashboard", subtitle: "Dashboard SQL Server — Status, resumo e tabelas do AxHub", Icon: Database },
  "/busca-editais-gov": { title: "Busca Editais Gov.br", subtitle: "Busca e importação automática de editais na plataforma PNCP", Icon: Search },
  "/analise-edital-avancada": { title: "Análise Avançada de Editais", subtitle: "Decomposição, de-para, concorrentes e análise de mercado", Icon: FileSearch },
  "/analisa-multi-produto": { title: "Análise Multi-Produto", subtitle: "Análise de edital contra AxHub, AxTon e AxCross", Icon: Layers },
  "/conformidade": { title: "Conformidade", subtitle: "Gestão de relatórios de conformidade e adequação de produtos", Icon: CheckCircle },
  "/confianca-revisao": { title: "Fila de Revisão", subtitle: "Revisão de análises com status, prioridades e validação", Icon: ClipboardCheck },
  "/guia-sites": { title: "Guia de Sites", subtitle: "Particularidades e especificações de cada contrato/cliente", Icon: BookOpen },
  "/roadmap": { title: "Roadmap de Produtos", subtitle: "Planejamento e gestão de features por produto", Icon: GitBranch },
  "/specs": { title: "Especificações Técnicas", subtitle: "Gestão de specs e documentação técnica de produtos", Icon: FileCode },
  "/implementation-planner": { title: "Planejador de Implementação", subtitle: "Gerenciador de tarefas e roadmap de desenvolvimento", Icon: Construction },
  "/mission-center": { title: "Mission Center", subtitle: "Operações formais do ecossistema Axion — Auditoria, Deploy, Validação e mais", Icon: Target },
  "/presentation-center": { title: "Presentation Center", subtitle: "Geração de documentos PDF, Word (DOCX) e PowerPoint (PPTX)", Icon: FileText },
};

const MENU_SECTIONS = [
  {
    group: "Operação",
    items: [
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/intelligence-dashboard", icon: PieChart, label: "Intelligence Dashboard" },
      { to: "/central-sites", icon: Globe, label: "Central de Sites" },
      { to: "/central-processos", icon: Activity, label: "Central de Processos" },
    ]
  },
  {
    group: "Atendimento",
    items: [
      { to: "/central-atendimento", icon: Headphones, label: "Central de Atendimento" },
    ]
  },
  {
    group: "Ferramentas",
    items: [
      { to: "/central-ferramentas", icon: Wrench, label: "Central de Ferramentas" },
      { to: "/varco-monitor", icon: Camera, label: "VARCO Monitor" },
      { to: "/axcross-manager", icon: Navigation, label: "AxCross Manager" },
    ]
  },
  {
    group: "Busca & Análise",
    items: [
      { to: "/hub-analise", icon: Search, label: "AxHub Analisador" },
    ]
  },
  {
    group: "Validação",
    items: [
      { to: "/central-validacao", icon: CheckCircle, label: "Central de Validação" },
    ]
  },
  {
    group: "Qualidade & Relatórios",
    items: [
      { to: "/cuti", icon: TestTube, label: "CUTI - Testes Inteligentes" },
      { to: "/central-relatorios", icon: BarChart3, label: "Central de Relatórios" },
    ]
  },
  {
    group: "Inteligência",
    items: [
      { to: "/central-inteligencia", icon: Landmark, label: "Central de Inteligência" },
    ]
  },
  {
    group: "Gestão",
    items: [
      { to: "/central-gestao", icon: GitBranch, label: "Central de Gestão" },
    ]
  },
  {
    group: "Mission & Docs",
    items: [
      { to: "/mission-center", icon: Target, label: "Mission Center" },
      { to: "/presentation-center", icon: FileText, label: "Presentation Center" },
    ]
  },
  {
    group: "Recursos",
    items: [
      { to: "/gerar-doc", icon: FileText, label: "Gerador de Docs" },
      { to: "/guia-sites", icon: BookOpen, label: "Guia de Sites" },
      { to: "/treinamento", icon: GraduationCap, label: "Treinamento" },
      { to: "/planilha-horas", icon: Clock, label: "Planilha de Horas" },
    ]
  },
];

function AppContent() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/" || location.pathname === "/dashboard";

  return (
    <div className="portal-layout">
      {/* ─── Top utility bar ─── */}
      <div className="top-bar">
        <div className="top-bar-inner">
          <span className="top-bar-left">Axion Tecnologia — Gerenciador v4.0 | 22 Engines Ativos</span>
          <div className="top-bar-right">
            <a href="https://desk.axiontecnologia.com.br/helpdesk" target="_blank" rel="noreferrer"><ExternalLink size={11} /> Jitbit</a>
            <a href="https://axiontecnologia.com.br" target="_blank" rel="noreferrer"><ExternalLink size={11} /> Site</a>
            <a href="https://github.com/Axion-Tecnologia" target="_blank" rel="noreferrer"><ExternalLink size={11} /> GitHub</a>
          </div>
        </div>
      </div>

      {/* ─── Main navbar ─── */}
      <header className="main-navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            <div className="navbar-brand-icon">A</div>
            <span className="navbar-brand-text">AXION</span>
          </Link>
          <button className="navbar-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu principal">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
            <span className="hamburger-label">Menu principal</span>
          </button>
        </div>
      </header>

      {/* ─── Menu overlay ─── */}
      {menuOpen && (
        <div className="menu-overlay" onClick={() => setMenuOpen(false)}>
          <nav className="menu-panel" onClick={e => e.stopPropagation()}>
            <div className="menu-header">
              <Link to="/" className="menu-brand" onClick={() => setMenuOpen(false)}>
                <div className="navbar-brand-icon">A</div>
                <span>Axion Tecnologia</span>
              </Link>
              <button className="menu-close" onClick={() => setMenuOpen(false)}><X size={20} /></button>
            </div>
            <div className="menu-body">
              {MENU_SECTIONS.map((sec, i) => (
                <div key={i} className="menu-section">
                  <h3>{sec.group}</h3>
                  <ul>
                    {sec.items.map(item => (
                      <li key={item.to}>
                        <NavLink to={item.to} onClick={() => setMenuOpen(false)}>
                          <item.icon size={18} strokeWidth={1.8} />
                          <span>{item.label}</span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="menu-section">
                <h3>Sistema</h3>
                <ul>
                  <li>
                    <NavLink to="/config" onClick={() => setMenuOpen(false)}>
                      <Settings size={18} strokeWidth={1.8} />
                      <span>Configurações</span>
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>
            <div className="menu-footer">
              <div className="menu-footer-links">
                <a href="https://desk.axiontecnologia.com.br/helpdesk" target="_blank" rel="noreferrer">Jitbit</a>
                <a href="https://axiontecnologia.com.br" target="_blank" rel="noreferrer">Site</a>
                <a href="https://github.com/Axion-Tecnologia" target="_blank" rel="noreferrer">GitHub</a>
              </div>
              <span>© 2026 Axion Tecnologia</span>
            </div>
          </nav>
        </div>
      )}

      {/* ─── Page Header (inner pages) ─── */}
      {!isHome && PAGE_INFO[location.pathname] && (() => {
        const info = PAGE_INFO[location.pathname];
        const IconComp = info.Icon;
        return (
          <section className="inner-page-hero">
            <div className="inner-page-hero-inner">
              <span className="inner-page-hero-icon">
                {IconComp && <IconComp size={24} strokeWidth={1.5} />}
              </span>
              <div>
                <h1 className="inner-page-hero-title">{info.title}</h1>
                <p className="inner-page-hero-subtitle">{info.subtitle}</p>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ─── Main content ─── */}
      <main className={isHome ? "portal-home" : "page-content"}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/operations-hub" element={<OperationsHub />} />
          <Route path="/intelligence-hub" element={<IntelligenceHub />} />
          
          {/* Redirects: Páginas antigas → Central de Processos */}
          <Route path="/mapa-operacoes" element={<Navigate to="/central-processos" replace />} />
          <Route path="/painel-processos" element={<Navigate to="/central-processos" replace />} />
          
          {/* Redirects: Páginas antigas de validação → Central de Validação */}
          <Route path="/validacao" element={<Navigate to="/central-validacao" replace />} />
          <Route path="/validation-hub" element={<Navigate to="/central-validacao" replace />} />
          <Route path="/validation-manager" element={<Navigate to="/central-validacao" replace />} />
          <Route path="/visual-validation" element={<Navigate to="/central-validacao?tab=visual" replace />} />
          <Route path="/confianca-revisao" element={<Navigate to="/central-validacao?tab=ia" replace />} />
          
          {/* Redirects: Páginas antigas de atendimento → Central de Atendimento */}
          <Route path="/chat" element={<Navigate to="/central-atendimento?tab=chat" replace />} />
          <Route path="/whatsapp" element={<Navigate to="/central-atendimento?tab=whatsapp" replace />} />
          <Route path="/helpdesk" element={<Navigate to="/central-atendimento?tab=helpdesk" replace />} />
          <Route path="/chamados-sites" element={<Navigate to="/central-atendimento?tab=sites" replace />} />
          
          {/* Redirects: Páginas antigas de análise → Hub de Análise */}
          <Route path="/search-hub" element={<Navigate to="/hub-analise?tab=busca" replace />} />
          <Route path="/diagnostic-hub" element={<Navigate to="/hub-analise?tab=diagnosticos" replace />} />
          <Route path="/analise-imagens" element={<Navigate to="/hub-analise?tab=imagens" replace />} />
          <Route path="/logs" element={<Navigate to="/hub-analise?tab=logs" replace />} />
          
          {/* Redirects: Páginas antigas de qualidade → Central de Qualidade */}
          <Route path="/quality" element={<Navigate to="/central-qualidade?tab=pieq" replace />} />
          <Route path="/duplicidade" element={<Navigate to="/central-qualidade?tab=auditoria" replace />} />
          
          {/* Redirects: Páginas antigas de relatórios → Central de Relatórios */}
          <Route path="/varco" element={<Navigate to="/central-relatorios?tab=varco" replace />} />
          <Route path="/diagnostico-medicao" element={<Navigate to="/central-relatorios?tab=medicao" replace />} />
          <Route path="/relatorio-contrato" element={<Navigate to="/central-relatorios?tab=operacionais" replace />} />
          <Route path="/relatorio-fluxo" element={<Navigate to="/central-relatorios?tab=operacionais" replace />} />
          <Route path="/sla-compliance" element={<Navigate to="/central-relatorios?tab=sla" replace />} />
          
          {/* Redirects: Páginas antigas de ferramentas → Central de Ferramentas */}
          <Route path="/ferramentas/consulta-infracoes" element={<Navigate to="/central-ferramentas?tab=infracoes" replace />} />
          <Route path="/ferramentas/pesagem" element={<Navigate to="/central-ferramentas?tab=pesagem" replace />} />
          <Route path="/ferramentas/cruzamentos" element={<Navigate to="/central-ferramentas?tab=cruzamentos" replace />} />
          
          {/* Redirects: Páginas antigas de inteligência → Central de Inteligência */}
          <Route path="/pipeline-editais" element={<Navigate to="/central-inteligencia?tab=pipeline" replace />} />
          <Route path="/busca-editais-gov" element={<Navigate to="/central-inteligencia?tab=busca" replace />} />
          <Route path="/analise-edital-avancada" element={<Navigate to="/central-inteligencia?tab=analise" replace />} />
          <Route path="/analisa-multi-produto" element={<Navigate to="/central-inteligencia?tab=multi" replace />} />
          <Route path="/conformidade" element={<Navigate to="/central-inteligencia?tab=conformidade" replace />} />
          
          {/* Redirects: Páginas antigas de gestão → Central de Gestão */}
          <Route path="/roadmap" element={<Navigate to="/central-gestao?tab=roadmap" replace />} />
          <Route path="/specs" element={<Navigate to="/central-gestao?tab=specs" replace />} />
          <Route path="/implementation-planner" element={<Navigate to="/central-gestao?tab=backlog" replace />} />
          
          <Route path="/central-validacao" element={<CentralValidacao />} />
          <Route path="/central-atendimento" element={<CentralAtendimento />} />
          <Route path="/hub-analise" element={<HubAnalise />} />
          <Route path="/central-qualidade" element={<CentralQualidade />} />
          <Route path="/cuti" element={<CUTI />} />
          <Route path="/central-relatorios" element={<CentralRelatorios />} />
          <Route path="/central-inteligencia" element={<CentralInteligencia />} />
          <Route path="/central-gestao" element={<CentralGestao />} />
          <Route path="/central-ferramentas" element={<CentralFerramentas />} />
          
          {/* VARCO Monitor - Painel completo de auditoria */}
          <Route path="/varco-monitor" element={<VarcoMonitor />} />
          {/* AxCross Manager — Gerenciador Unificado */}
          <Route path="/axcross-manager" element={<AxCrossManager />} />
          {/* Redirect: rota antiga → Manager (tab diagnóstico) */}
          <Route path="/axcross-classificacao-diag" element={<Navigate to="/axcross-manager?tab=diagnostico" replace />} />
          
          <Route path="/analise" element={<AnalisesSites />} />
          <Route path="/central-sites" element={<CentralSites />} />
          <Route path="/central-processos" element={<CentralProcessos />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/gerar-doc" element={<GerarDoc />} />
          <Route path="/fontes" element={<FontesPesquisa />} />
          <Route path="/planilha-horas" element={<PlanilhaHoras />} />

          <Route path="/treinamento" element={<Treinamento />} />
          <Route path="/kb" element={<Navigate to="/config?tab=kb" replace />} />
          <Route path="/intelligence-dashboard" element={<IntelligenceDashboard />} />
          <Route path="/axhub-dashboard" element={<Navigate to="/config?tab=axhub-dashboard" replace />} />
          <Route path="/guia-sites" element={<GuiaSites />} />
          <Route path="/config" element={<Configuracoes />} />
          <Route path="/mission-center" element={<MissionCenter />} />
          <Route path="/presentation-center" element={<PresentationCenter />} />

        </Routes>
      </main>

      {/* ─── Footer ─── */}
      <footer className="portal-footer">
        <div className="footer-inner">
          <div className="footer-columns">
            <div className="footer-col">
              <h4>Produtos</h4>
              <a href="http://localhost:3010/AxHub.Docs" target="_blank" rel="noreferrer">AxHub — Trânsito</a>
              <a href="http://localhost:3011/AxTon.Docs" target="_blank" rel="noreferrer">AxTon — Pesagem</a>
              <a href="http://localhost:3012/AxCross.Docs" target="_blank" rel="noreferrer">AxCross — Monitoramento</a>
            </div>
            <div className="footer-col">
              <h4>Recursos</h4>
              <Link to="/config?tab=kb">Knowledge Base</Link>
              <Link to="/gerar-doc">Gerador de Docs</Link>
              <Link to="/treinamento">Treinamento</Link>
            </div>
            <div className="footer-col">
              <h4>Links Úteis</h4>
              <a href="https://desk.axiontecnologia.com.br/helpdesk" target="_blank" rel="noreferrer">Helpdesk Jitbit</a>
              <a href="https://axiontecnologia.com.br" target="_blank" rel="noreferrer">Site Institucional</a>
              <a href="https://github.com/Axion-Tecnologia" target="_blank" rel="noreferrer">GitHub</a>
            </div>
            <div className="footer-col">
              <h4>Contato</h4>
              <span>Axion Tecnologia</span>
              <span>contato@axiontecnologia.com.br</span>
              <span>Goiânia, GO — Brasil</span>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Axion Tecnologia — Todos os direitos reservados</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Cria uma instância do QueryClient para React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SiteContextProvider>
          <AppContent />
        </SiteContextProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
