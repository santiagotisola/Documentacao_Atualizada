import React, { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink, Link, useLocation } from "react-router-dom";
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
  FileSearch, Layers, CheckCircle, ClipboardCheck, BookOpen, GitBranch, FileCode, Database
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
import MapaOperacoes from "./pages/MapaOperacoes.jsx";
import PipelineEditais from "./pages/PipelineEditais.jsx";
import AnalisesSites from "./pages/AnalisesSites.jsx";
import IntelligenceHub from "./pages/IntelligenceHub.jsx";
import OperationsHub from "./pages/OperationsHub.jsx";
import PainelProcessos from "./pages/PainelProcessos.jsx";
import VarcoMonitor from "./pages/VarcoMonitor.jsx";
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
import "./App.css";
import "./pages/docusaurus-compat.css";

/* ─── Page metadata for headers ─── */
const PAGE_INFO = {
  "/operations-hub": { title: "Operations Hub", subtitle: "Centro de comando operacional — Processos, Métricas e Inteligência", Icon: Brain },
  "/intelligence-hub": { title: "Intelligence Hub", subtitle: "Gerenciador unificado de dados, relatórios e performance", Icon: Brain },
  "/mapa-operacoes": { title: "Mapa de Operações", subtitle: "Ecossistema completo: fluxos, processos, sites e acessos", Icon: Globe },
  "/painel-processos": { title: "Painel de Processos", subtitle: "Sites, credenciais, métricas e processos operacionais", Icon: ClipboardList },
  "/dashboard": { title: "Dashboard", subtitle: "Visão geral dos sistemas e serviços", Icon: LayoutDashboard },
  "/analise": { title: "Análise de Sites", subtitle: "Comparativo de contratos e operações por site", Icon: ScanSearch },

  "/chat": { title: "Chat IA", subtitle: "Assistente inteligente AxionIA", Icon: Bot },
  "/whatsapp": { title: "WhatsApp", subtitle: "Integração e atendimento via WhatsApp", Icon: MessageCircle },
  "/helpdesk": { title: "Helpdesk", subtitle: "Gestão de tickets e atendimento Jitbit", Icon: Headphones },
  "/search-hub": { title: "Search Hub", subtitle: "Central unificada de buscas — Sistemas, Imagens e Documentos", Icon: Search },
  "/diagnostic-hub": { title: "Diagnostic Hub", subtitle: "Central de diagnóstico — Medição, Health, Logs e Queries", Icon: Activity },
  "/analise-imagens": { title: "Análise de Imagens", subtitle: "OCR, validação e qualidade de capturas", Icon: Camera },
  "/validation-hub": { title: "Validation Hub", subtitle: "Validação unificada (UI + API + Visual) com seleção de sites", Icon: TestTube },
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
  "/duplicidade": { title: "Auditoria de Duplicidades", subtitle: "Detecção e análise de infrações duplicadas no AxHub", Icon: Shield },
  "/diagnostico-medicao": { title: "Diagnóstico de Medição", subtitle: "Análise inteligente de equipamentos com valores zerados no relatório", Icon: Activity },
  "/ferramentas/consulta-infracoes": { title: "Consultar Infrações", subtitle: "Ferramenta de análise e suporte — Consulte infrações por CPF ou Placa (AxHub)", Icon: Search },
  "/ferramentas/resultados-infracoes": { title: "Resultados da Consulta", subtitle: "Análise detalhada de infrações encontradas", Icon: FileText },
  "/ferramentas/pesagem": { title: "Análise de Pesagem AxTon", subtitle: "Ferramenta de suporte — Consulte pesagens veiculares", Icon: Scale },
  "/ferramentas/cruzamentos": { title: "Monitoramento AxCross", subtitle: "Ferramenta de suporte — Consulte cruzamentos e alertas", Icon: Navigation },
  "/quality": { title: "Quality Engineering Platform", subtitle: "Plataforma de análise automatizada de qualidade, segurança e performance", Icon: Shield },
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
};

const MENU_SECTIONS = [
  {
    group: "Operação",
    items: [
      { to: "/operations-hub", icon: Brain, label: "Operations Hub" },
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/intelligence-dashboard", icon: PieChart, label: "Intelligence Dashboard" },
      { to: "/axhub-dashboard", icon: Database, label: "AxHub Dashboard" },
      { to: "/mapa-operacoes", icon: Map, label: "Mapa de Operações" },
      { to: "/painel-processos", icon: PieChart, label: "Painel de Processos" },
      { to: "/analise", icon: ScanSearch, label: "Análise de Sites" },
    ]
  },
  {
    group: "Atendimento",
    items: [
      { to: "/chat", icon: Bot, label: "Chat IA" },
      { to: "/whatsapp", icon: MessageCircle, label: "WhatsApp" },
      { to: "/helpdesk", icon: Headphones, label: "Helpdesk" },
      { to: "/chamados-sites", icon: Headphones, label: "Chamados Sites" },
    ]
  },
  {
    group: "Ferramentas",
    items: [
      { to: "/ferramentas/consulta-infracoes", icon: Search, label: "Consultar Infrações" },
      { to: "/ferramentas/pesagem", icon: Scale, label: "Análise Pesagem (AxTon)" },
      { to: "/ferramentas/cruzamentos", icon: Navigation, label: "Cruzamentos (AxCross)" },
    ]
  },
  {
    group: "Busca & Análise",
    items: [
      { to: "/search-hub", icon: Search, label: "Search Hub" },
      { to: "/diagnostic-hub", icon: Activity, label: "Diagnostic Hub" },
      { to: "/analise-imagens", icon: Camera, label: "Análise de Imagens" },
    ]
  },
  {
    group: "Validação",
    items: [
      { to: "/validation-hub", icon: TestTube, label: "Validation Hub" },
      { to: "/validation-manager", icon: TestTube, label: "Validation Manager" },
      { to: "/visual-validation", icon: Eye, label: "Validação Visual" },
      { to: "/confianca-revisao", icon: ClipboardCheck, label: "Fila de Revisão" },
    ]
  },
  {
    group: "Qualidade & Relatórios",
    items: [
      { to: "/quality", icon: Shield, label: "Quality Platform" },
      { to: "/duplicidade", icon: Shield, label: "Auditoria Duplicidades" },
      { to: "/varco", icon: Radio, label: "VARCO Monitor" },
      { to: "/diagnostico-medicao", icon: Activity, label: "Diagnóstico Medição" },
      { to: "/relatorio-contrato", icon: ClipboardList, label: "Relatório por Contrato" },
      { to: "/relatorio-fluxo", icon: BarChart3, label: "Relatório de Fluxo" },
      { to: "/sla-compliance", icon: Activity, label: "SLA Compliance" },
    ]
  },
  {
    group: "Inteligência",
    items: [
      { to: "/pipeline-editais", icon: Landmark, label: "Pipeline de Editais" },
      { to: "/busca-editais-gov", icon: Search, label: "Busca Editais Gov.br" },
      { to: "/analise-edital-avancada", icon: FileSearch, label: "Análise Avançada" },
      { to: "/analisa-multi-produto", icon: Layers, label: "Análise Multi-Produto" },
      { to: "/conformidade", icon: CheckCircle, label: "Conformidade" },
    ]
  },
  {
    group: "Gestão",
    items: [
      { to: "/roadmap", icon: GitBranch, label: "Roadmap Produtos" },
      { to: "/specs", icon: FileCode, label: "Especificações" },
    ]
  },
  {
    group: "Recursos",
    items: [
      { to: "/kb", icon: BookMarked, label: "Knowledge Base" },
      { to: "/gerar-doc", icon: FileText, label: "Gerador de Docs" },
      { to: "/guia-sites", icon: BookOpen, label: "Guia de Sites" },
      { to: "/treinamento", icon: GraduationCap, label: "Treinamento" },
      { to: "/planilha-horas", icon: Clock, label: "Planilha de Horas" },
      { to: "/logs", icon: ScrollText, label: "Logs do Sistema" },
    ]
  },
];

function AppContent() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="portal-layout">
      {/* ─── Top utility bar ─── */}
      <div className="top-bar">
        <div className="top-bar-inner">
          <span className="top-bar-left">Axion Tecnologia — Gerenciador v3.0</span>
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
          <Route path="/" element={<HomePage />} />
          <Route path="/operations-hub" element={<OperationsHub />} />
          <Route path="/intelligence-hub" element={<IntelligenceHub />} />
          <Route path="/mapa-operacoes" element={<MapaOperacoes />} />
          <Route path="/painel-processos" element={<PainelProcessos />} />
          <Route path="/analise" element={<AnalisesSites />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/helpdesk" element={<Helpdesk />} />
          <Route path="/gerar-doc" element={<GerarDoc />} />
          <Route path="/fontes" element={<FontesPesquisa />} />
          <Route path="/pipeline-editais" element={<PipelineEditais />} />
          <Route path="/relatorio-fluxo" element={<RelatorioFluxo />} />
          <Route path="/relatorio-contrato" element={<RelatorioContrato />} />
          <Route path="/planilha-horas" element={<PlanilhaHoras />} />

          <Route path="/whatsapp" element={<WhatsApp />} />
          <Route path="/search-hub" element={<SearchHub />} />
          <Route path="/diagnostic-hub" element={<DiagnosticHub />} />
          <Route path="/analise-imagens" element={<AnaliseImagens />} />
          <Route path="/validation-hub" element={<ValidationHub />} />
          <Route path="/validation-manager" element={<ValidationManager />} />
          <Route path="/visual-validation" element={<VisualValidationManager />} />
          <Route path="/fontes" element={<FontesPesquisa />} />
          <Route path="/treinamento" element={<Treinamento />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/kb" element={<KnowledgeBase />} />
          <Route path="/varco" element={<VarcoMonitor />} />
          <Route path="/duplicidade" element={<DuplicidadeInfracoes />} />
          <Route path="/diagnostico-medicao" element={<DiagnosticoMedicao />} />
          <Route path="/intelligence-dashboard" element={<IntelligenceDashboard />} />
          <Route path="/ferramentas/consulta-infracoes" element={<ConsultaInfracoes />} />
          <Route path="/ferramentas/resultados-infracoes" element={<ResultadosInfracoes />} />
          <Route path="/ferramentas/pesagem" element={<AnalisePesagem />} />
          <Route path="/ferramentas/cruzamentos" element={<ConsultaCruzamentos />} />
          <Route path="/quality" element={<QualityDashboard />} />
          <Route path="/chamados-sites" element={<ChamadosSites />} />
          <Route path="/sla-compliance" element={<SlaCompliance />} />
          <Route path="/axhub-dashboard" element={<AxHubDashboard />} />
          <Route path="/busca-editais-gov" element={<BuscaEditaisGov />} />
          <Route path="/analise-edital-avancada" element={<AnaliseEditalAvancada />} />
          <Route path="/analisa-multi-produto" element={<AnalisaMultiProduto />} />
          <Route path="/conformidade" element={<Conformidade />} />
          <Route path="/confianca-revisao" element={<ConfidencaRevisao />} />
          <Route path="/guia-sites" element={<GuiaSites />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/specs" element={<Specs />} />
          <Route path="/config" element={<Configuracoes />} />


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
              <Link to="/kb">Knowledge Base</Link>
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

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
