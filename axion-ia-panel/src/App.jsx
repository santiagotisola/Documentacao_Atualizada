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
  Camera, Construction, PieChart, Map, Shield, Activity, TestTube, Eye
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
};

const MENU_SECTIONS = [
  {
    group: "Operação",
    items: [
      { to: "/operations-hub", icon: Brain, label: "Operations Hub" },
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/analise", icon: ScanSearch, label: "Análise de Sites" },
    ]
  },
  {
    group: "Atendimento",
    items: [
      { to: "/chat", icon: Bot, label: "Chat IA" },
      { to: "/whatsapp", icon: MessageCircle, label: "WhatsApp" },
      { to: "/helpdesk", icon: Headphones, label: "Helpdesk" },
    ]
  },
  {
    group: "Busca & Análise",
    items: [
      { to: "/search-hub", icon: Search, label: "Search Hub" },
      { to: "/diagnostic-hub", icon: Activity, label: "Diagnostic Hub" },
    ]
  },
  {
    group: "Qualidade",
    items: [
      { to: "/duplicidade", icon: Shield, label: "Auditoria Duplicidades" },
      { to: "/varco", icon: Radio, label: "VARCO Monitor" },
      { to: "/relatorio-contrato", icon: ClipboardList, label: "Relatório por Contrato" },
      { to: "/relatorio-fluxo", icon: BarChart3, label: "Relatório de Fluxo" },
    ]
  },
  {
    group: "Inteligência",
    items: [
      { to: "/pipeline-editais", icon: Landmark, label: "Pipeline de Editais" },
    ]
  },
  {
    group: "Recursos",
    items: [
      { to: "/kb", icon: BookMarked, label: "Knowledge Base" },
      { to: "/gerar-doc", icon: FileText, label: "Gerador de Docs" },
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
