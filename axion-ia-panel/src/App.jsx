import React, { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink, Link, useLocation } from "react-router-dom";
import {
  Brain, LayoutDashboard, Globe,
  Bot, MessageCircle, Headphones,
  ScanSearch, ScanLine, CheckCircle2, BookMarked,
  ShieldCheck, BarChart3,
  Landmark, PieChart, Map, Ruler,
  FileText, Search, Clock, GraduationCap, ScrollText,
  Settings, ExternalLink, Menu, X
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
import Roadmap from "./pages/Roadmap.jsx";
import Specs from "./pages/Specs.jsx";
import RelatorioFluxo from "./pages/RelatorioFluxo.jsx";
import Conformidade from "./pages/Conformidade.jsx";
import AnalisaMultiProduto from "./pages/AnalisaMultiProduto.jsx";
import ConfidencaRevisao from "./pages/ConfidencaRevisao.jsx";
import PlanilhaHoras from "./pages/PlanilhaHoras.jsx";
import WhatsApp from "./pages/WhatsApp.jsx";
import AnaliseImagens from "./pages/AnaliseImagens.jsx";
import MapaOperacoes from "./pages/MapaOperacoes.jsx";
import AnaliseEditalAvancada from "./pages/AnaliseEditalAvancada.jsx";
import BuscaEditaisGov from "./pages/BuscaEditaisGov.jsx";
import AnalisesSites from "./pages/AnalisesSites.jsx";
import IntelligenceHub from "./pages/IntelligenceHub.jsx";
import HomePage from "./pages/HomePage.jsx";
import "./App.css";
import "./pages/docusaurus-compat.css";

/* ─── Page metadata for gradient headers ─── */
const PAGE_INFO = {
  "/intelligence-hub": { title: "Intelligence Hub", subtitle: "Gerenciador unificado de dados, relatórios e performance", icon: "🧠" },
  "/mapa-operacoes": { title: "Mapa de Operações", subtitle: "Ecossistema completo: fluxos, processos, sites e acessos", icon: "🔗" },
  "/dashboard": { title: "Dashboard", subtitle: "Visão geral dos sistemas e serviços", icon: "📊" },
  "/analise": { title: "Análise de Sites", subtitle: "Comparativo de contratos e operações por site", icon: "🔍" },

  "/chat": { title: "Chat IA", subtitle: "Assistente inteligente AxionIA", icon: "🤖" },
  "/whatsapp": { title: "WhatsApp", subtitle: "Integração e atendimento via WhatsApp", icon: "💬" },
  "/helpdesk": { title: "Helpdesk", subtitle: "Gestão de tickets e atendimento Jitbit", icon: "🎧" },
  "/analise-imagens": { title: "Análise de Imagens", subtitle: "OCR, validação e qualidade de capturas", icon: "📷" },
  "/confianca": { title: "Fila de Revisão", subtitle: "Revisão de confiança OCR por lote", icon: "✅" },

  "/conformidade": { title: "Conformidade", subtitle: "Verificação de requisitos de editais", icon: "🛡️" },
  "/relatorio-fluxo": { title: "Relatório de Fluxo", subtitle: "Métricas de atendimento e fluxo operacional", icon: "📊" },
  "/editais-gov": { title: "Editais Gov", subtitle: "Busca e análise de editais no PNCP", icon: "🏛️" },
  "/analise-edital": { title: "Análise Avançada de Edital", subtitle: "Decomposição, De-Para, Concorrentes e Mercado", icon: "📊" },
  "/analisa-multi": { title: "Multi-Produto", subtitle: "Análise comparativa entre produtos", icon: "📊" },
  "/roadmap": { title: "Roadmap", subtitle: "Planejamento e evolução de produto", icon: "🗺️" },
  "/specs": { title: "Specs Técnicas", subtitle: "Especificações técnicas dos sistemas", icon: "📐" },
  "/kb": { title: "Knowledge Base", subtitle: "Base de conhecimento com embeddings", icon: "📚" },
  "/gerar-doc": { title: "Gerador de Docs", subtitle: "Documentação automatizada com IA", icon: "📄" },
  "/fontes": { title: "Fontes de Pesquisa", subtitle: "URLs e referências de pesquisa", icon: "🔎" },
  "/treinamento": { title: "Treinamento", subtitle: "Capacitação e aprendizado da IA", icon: "🎓" },
  "/planilha-horas": { title: "Planilha de Horas", subtitle: "Controle de tempo e atividades", icon: "⏱️" },
  "/logs": { title: "Logs do Sistema", subtitle: "Auditoria e rastreio de operações", icon: "📋" },
  "/config": { title: "Configurações", subtitle: "Configurações do sistema e conexões", icon: "⚙️" },
};

const MENU_SECTIONS = [
  {
    group: "Operação",
    items: [
      { to: "/intelligence-hub", icon: Brain, label: "Intelligence Hub" },
      { to: "/mapa-operacoes", icon: Globe, label: "Mapa de Operações" },
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
    group: "Qualidade",
    items: [
      { to: "/analise-imagens", icon: ScanLine, label: "Análise de Imagens" },
      { to: "/confianca", icon: CheckCircle2, label: "Fila de Revisão" },
      { to: "/conformidade", icon: ShieldCheck, label: "Conformidade" },
      { to: "/relatorio-fluxo", icon: BarChart3, label: "Relatório de Fluxo" },
    ]
  },
  {
    group: "Inteligência",
    items: [
      { to: "/editais-gov", icon: Landmark, label: "Editais Gov" },
      { to: "/analise-edital", icon: PieChart, label: "Análise de Edital" },
      { to: "/analisa-multi", icon: PieChart, label: "Multi-Produto" },
      { to: "/roadmap", icon: Map, label: "Roadmap" },
      { to: "/specs", icon: Ruler, label: "Specs Técnicas" },
    ]
  },
  {
    group: "Recursos",
    items: [
      { to: "/kb", icon: BookMarked, label: "Knowledge Base" },
      { to: "/gerar-doc", icon: FileText, label: "Gerador de Docs" },
      { to: "/fontes", icon: Search, label: "Fontes de Pesquisa" },
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
      {!isHome && PAGE_INFO[location.pathname] && (
        <section className="inner-page-hero">
          <div className="inner-page-hero-inner">
            <span className="inner-page-hero-icon">{PAGE_INFO[location.pathname].icon}</span>
            <div>
              <h1 className="inner-page-hero-title">{PAGE_INFO[location.pathname].title}</h1>
              <p className="inner-page-hero-subtitle">{PAGE_INFO[location.pathname].subtitle}</p>
            </div>
          </div>
        </section>
      )}

      {/* ─── Main content ─── */}
      <main className={isHome ? "portal-home" : "page-content"}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/intelligence-hub" element={<IntelligenceHub />} />
          <Route path="/mapa-operacoes" element={<MapaOperacoes />} />
          <Route path="/analise" element={<AnalisesSites />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/helpdesk" element={<Helpdesk />} />
          <Route path="/gerar-doc" element={<GerarDoc />} />
          <Route path="/fontes" element={<FontesPesquisa />} />
          <Route path="/editais-gov" element={<BuscaEditaisGov />} />
          <Route path="/analise-edital" element={<AnaliseEditalAvancada />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/specs" element={<Specs />} />
          <Route path="/conformidade" element={<Conformidade />} />
          <Route path="/analisa-multi" element={<AnalisaMultiProduto />} />
          <Route path="/confianca" element={<ConfidencaRevisao />} />
          <Route path="/relatorio-fluxo" element={<RelatorioFluxo />} />
          <Route path="/planilha-horas" element={<PlanilhaHoras />} />

          <Route path="/whatsapp" element={<WhatsApp />} />
          <Route path="/analise-imagens" element={<AnaliseImagens />} />
          <Route path="/treinamento" element={<Treinamento />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/kb" element={<KnowledgeBase />} />
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
