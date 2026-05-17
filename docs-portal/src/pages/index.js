import React, { useState, useEffect, lazy, Suspense } from 'react';
import '../css/painel.css';
import '../painel/docusaurus-compat.css';

/* ═══════════════════════════════════════════════════════════════════
   Gerenciador Axion Tecnologia — Plataforma Unificada
   Tudo em um: IA, Análise, Chamados, Performance, Relatórios
   ═══════════════════════════════════════════════════════════════════ */
const IntelligenceHub = lazy(() => import('../painel/IntelligenceHub'));
const Dashboard = lazy(() => import('../painel/Dashboard'));
const Chat = lazy(() => import('../painel/Chat'));
const WhatsApp = lazy(() => import('../painel/WhatsApp'));
const Helpdesk = lazy(() => import('../painel/Helpdesk'));
const AnaliseImagens = lazy(() => import('../painel/AnaliseImagens'));
const ConfidencaRevisao = lazy(() => import('../painel/ConfidencaRevisao'));
const KnowledgeBase = lazy(() => import('../painel/KnowledgeBase'));
const SlaCompliance = lazy(() => import('../painel/SlaCompliance'));
const Conformidade = lazy(() => import('../painel/Conformidade'));
const RelatorioFluxo = lazy(() => import('../painel/RelatorioFluxo'));
const BuscaEditaisGov = lazy(() => import('../painel/BuscaEditaisGov'));
const AnalisaMultiProduto = lazy(() => import('../painel/AnalisaMultiProduto'));
const Roadmap = lazy(() => import('../painel/Roadmap'));
const Specs = lazy(() => import('../painel/Specs'));
const GerarDoc = lazy(() => import('../painel/GerarDoc'));
const FontesPesquisa = lazy(() => import('../painel/FontesPesquisa'));
const PlanilhaHoras = lazy(() => import('../painel/PlanilhaHoras'));
const Treinamento = lazy(() => import('../painel/Treinamento'));
const Logs = lazy(() => import('../painel/Logs'));
const Configuracoes = lazy(() => import('../painel/Configuracoes'));
const AnalisesSites = lazy(() => import('../painel/AnalisesSites'));
const GuiaSites = lazy(() => import('../painel/GuiaSites'));
const ChamadosSites = lazy(() => import('../painel/ChamadosSites'));

/* ═══════════════════════════════════════════════════════════════════ */

const ROUTES = [
  { key: 'intelligence', label: '🧠 Intelligence Hub', component: IntelligenceHub },
  { key: 'dashboard', label: '📊 Dashboard', component: Dashboard },
  { key: '_operacao', group: 'Operação' },
  { key: 'analise', label: '🔬 Análise de Sites', component: AnalisesSites },
  { key: 'guia-sites', label: '📋 Guia por Site', component: GuiaSites },
  { key: 'chamados-sites', label: '🎫 Chamados × Sites', component: ChamadosSites },
  { key: '_atendimento', group: 'Atendimento' },
  { key: 'chat', label: '🤖 Chat IA', component: Chat },
  { key: 'whatsapp', label: '💬 WhatsApp', component: WhatsApp },
  { key: 'helpdesk', label: '🎫 Helpdesk', component: Helpdesk },
  { key: '_analise', group: 'Análise' },
  { key: 'analise-imagens', label: '🔍 Análise Imagens', component: AnaliseImagens },
  { key: 'confianca', label: '✅ Fila de Revisão', component: ConfidencaRevisao },
  { key: 'kb', label: '📚 Knowledge Base', component: KnowledgeBase },
  { key: '_qualidade', group: 'Qualidade' },
  { key: 'sla-compliance', label: '🎯 SLA Compliance', component: SlaCompliance },
  { key: 'conformidade', label: '📜 Conformidade', component: Conformidade },
  { key: 'relatorio-fluxo', label: '📊 Relatório Fluxo', component: RelatorioFluxo },
  { key: '_inteligencia', group: 'Inteligência' },
  { key: 'editais-gov', label: '🏛️ Editais Gov', component: BuscaEditaisGov },
  { key: 'analisa-multi', label: '📊 Análise Multi-Produto', component: AnalisaMultiProduto },
  { key: 'roadmap', label: '🗺️ Roadmap', component: Roadmap },
  { key: 'specs', label: '📐 Specs', component: Specs },
  { key: '_admin', group: 'Administração' },
  { key: 'gerar-doc', label: '📄 Gerar Doc', component: GerarDoc },
  { key: 'fontes', label: '🔎 Fontes de Pesquisa', component: FontesPesquisa },
  { key: 'planilha-horas', label: '⏱️ Planilha de Horas', component: PlanilhaHoras },
  { key: 'treinamento', label: '🎓 Treinamento', component: Treinamento },
  { key: 'logs', label: '📋 Logs', component: Logs },
  { key: '_divider', divider: true },
  { key: 'config', label: '⚙️ Configurações', component: Configuracoes },
];

function getHashPage() {
  if (typeof window === 'undefined') return 'intelligence';
  const hash = window.location.hash.replace('#', '');
  return hash || 'intelligence';
}

export default function Home() {
  const [page, setPage] = useState(getHashPage);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const onHash = () => setPage(getHashPage());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (key) => {
    window.location.hash = key;
    setPage(key);
  };

  const route = ROUTES.find(r => r.key === page && r.component);
  const ActiveComponent = route ? route.component : IntelligenceHub;

  return (
    <div className="painel-root">
      <div className={`app-layout${!sidebarOpen ? ' sidebar-collapsed' : ''}`}>
        <nav className={`sidebar${!sidebarOpen ? ' collapsed' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-brand">
              <h1>Axion</h1>
              <span className="version">Gerenciador v3.0</span>
            </div>
            <button
              className="sidebar-toggle-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? 'Recolher menu' : 'Expandir menu'}
            >
              {sidebarOpen ? '✕' : '☰'}
            </button>
          </div>
          {sidebarOpen && (
            <>
              <ul className="nav-links">
                {ROUTES.map(r => {
                  if (r.group) return <li key={r.key} className="nav-group-label">{r.group}</li>;
                  if (r.divider) return <li key={r.key} className="nav-divider" />;
                  return (
                    <li key={r.key}>
                      <button
                        className={`nav-link-btn${page === r.key ? ' active' : ''}`}
                        onClick={() => navigate(r.key)}
                      >
                        {r.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="sidebar-footer">
                <div className="sidebar-footer-links">
                  <a href="https://desk.axiontecnologia.com.br/helpdesk" target="_blank" rel="noopener noreferrer">Jitbit</a>
                  <a href="https://axiontecnologia.com.br" target="_blank" rel="noopener noreferrer">Site</a>
                  <a href="https://github.com/Axion-Tecnologia" target="_blank" rel="noopener noreferrer">GitHub</a>
                </div>
                <span className="sidebar-footer-copy">© 2026 Axion Tecnologia</span>
              </div>
            </>
          )}
        </nav>
        <main className="main-content">
          <Suspense fallback={<div style={{padding:'2rem',color:'#94a3b8'}}>Carregando...</div>}>
            <ActiveComponent />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
