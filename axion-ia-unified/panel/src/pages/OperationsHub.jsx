import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AXHUB_SITES, AXCROSS_SITES } from '../data/sitesData';
import { api } from '../services/api';
import { KPICard as UIKPICard, LoadingSpinner } from '../components/ui';
import { Building2, TrendingUp, Ticket, AlertCircle, Camera, Target, Users, Activity } from 'lucide-react';
import CredenciaisManager from '../components/CredenciaisManager';
import './OperationsHub.css';

/* ═══════════════════════════════════════════════════════════════════
   OPERATIONS HUB — Centro de Comando Operacional Unificado
   Substitui: Intelligence Hub + Mapa de Operações
   ═══════════════════════════════════════════════════════════════════ */

const AXTON_SITES = [
  { id: 'axton-imepi', nome: 'IMEPI', estado: 'PI', sistema: 'AxTon' },
  { id: 'axton-ipemce', nome: 'IPEM/CE', estado: 'CE', sistema: 'AxTon' },
  { id: 'axton-economia', nome: 'Economia', estado: 'GO', sistema: 'AxTon' },
  { id: 'axton-detranpi', nome: 'Detran/PI', estado: 'PI', sistema: 'AxTon' },
  { id: 'axton-goiania', nome: 'Goiânia', estado: 'GO', sistema: 'AxTon' },
];

const ALL_SITES = [
  ...AXHUB_SITES.map(s => ({ ...s, sistema: 'AxHub' })),
  ...AXCROSS_SITES.map(s => ({ ...s, sistema: 'AxCross' })),
  ...AXTON_SITES,
];

// ── DADOS DO MAPA VISUAL ────────────────────────────────────────────
const NODES = [
  { id: "pncp", label: "PNCP Gov.br", icon: "🏛️", group: "entrada", x: 50, y: 60, desc: "Portal Nacional de Contratações Públicas", link: "/editais-gov" },
  { id: "jitbit", label: "Jitbit Helpdesk", icon: "🎧", group: "entrada", x: 50, y: 200, desc: "Sistema de tickets", link: "/helpdesk" },
  { id: "whatsapp", label: "WhatsApp", icon: "💬", group: "entrada", x: 50, y: 340, desc: "Canal de atendimento", link: "/whatsapp" },
  { id: "axhub_db", label: "AxHub (SQL)", icon: "🗄️", group: "entrada", x: 50, y: 480, desc: "Banco SQL Server" },
  { id: "axton_db", label: "AxTon (MongoDB)", icon: "🗄️", group: "entrada", x: 50, y: 560, desc: "Banco MongoDB" },
  { id: "axcross_db", label: "AxCross (SQL)", icon: "🗄️", group: "entrada", x: 50, y: 640, desc: "Banco SQL Server" },
  { id: "upload", label: "Upload Imagens", icon: "📸", group: "entrada", x: 50, y: 780, desc: "Imagens de câmeras" },
  { id: "editais", label: "Busca de Editais", icon: "🔍", group: "processamento", x: 280, y: 60, desc: "Scraping do PNCP", link: "/editais-gov" },
  { id: "conformidade", label: "Conformidade", icon: "🛡️", group: "processamento", x: 500, y: 60, desc: "Scoring APTO/INAPTO", link: "/conformidade" },
  { id: "multi", label: "Multi-Produto", icon: "📊", group: "processamento", x: 500, y: 160, desc: "Análise 3 produtos", link: "/analisa-multi" },
  { id: "helpdesk", label: "Helpdesk IA", icon: "🎫", group: "processamento", x: 280, y: 200, desc: "Classificação automática", link: "/helpdesk" },
  { id: "chat", label: "Chat IA", icon: "🤖", group: "processamento", x: 280, y: 340, desc: "Engine GPT-4o-mini", link: "/chat" },
  { id: "dashboards", label: "Dashboards Produto", icon: "📊", group: "processamento", x: 280, y: 540, desc: "KPIs por produto", link: "/dashboard" },
  { id: "relatorio", label: "Relatório Fluxo", icon: "📈", group: "processamento", x: 280, y: 660, desc: "Heatmap passagens", link: "/relatorio-fluxo" },
  { id: "analise_img", label: "Análise Imagens", icon: "📷", group: "processamento", x: 280, y: 780, desc: "GPT-4o Vision", link: "/analise-imagens" },
  { id: "fila", label: "Fila de Revisão", icon: "✅", group: "qualidade", x: 500, y: 400, desc: "Revisão humana", link: "/confianca" },
  { id: "sla", label: "SLA Compliance", icon: "🎯", group: "qualidade", x: 500, y: 300, desc: "Met vs Breached", link: "/sla-compliance" },
  { id: "sites", label: "Sites x Chamados", icon: "🏢", group: "qualidade", x: 500, y: 500, desc: "Mapeamento sites", link: "/chamados-sites" },
  { id: "roadmap", label: "Roadmap", icon: "🗺️", group: "inteligencia", x: 720, y: 60, desc: "Gaps priorizados", link: "/roadmap" },
  { id: "specs", label: "Specs Técnicas", icon: "📐", group: "inteligencia", x: 720, y: 160, desc: "Geração PRD", link: "/specs" },
  { id: "fontes", label: "Fontes Pesquisa", icon: "🔎", group: "inteligencia", x: 720, y: 260, desc: "URLs referência", link: "/fontes" },
  { id: "kb", label: "Knowledge Base", icon: "📚", group: "conhecimento", x: 720, y: 400, desc: "1000+ embeddings", link: "/kb" },
  { id: "treino", label: "Treinamento", icon: "🎓", group: "conhecimento", x: 720, y: 500, desc: "Pares Q&A", link: "/treinamento" },
  { id: "gerar_doc", label: "Gerador Docs", icon: "📄", group: "conhecimento", x: 720, y: 600, desc: "Documentação IA", link: "/gerar-doc" },
  { id: "hub", label: "Operations Hub", icon: "🧠", group: "saida", x: 940, y: 300, desc: "Dashboard unificado", link: "/operations-hub" },
  { id: "agent", label: "Agente Autônomo", icon: "⚡", group: "saida", x: 940, y: 460, desc: "Health check automático" },
  { id: "logs", label: "Logs & Auditoria", icon: "📋", group: "saida", x: 940, y: 600, desc: "Registro operações", link: "/logs" },
];

const PIPELINES = [
  { id: "edital", name: "Pipeline de Editais", icon: "🏛️", color: "#3b82f6", summary: "Busca editais → Extrai requisitos → Analisa conformidade → Gera roadmap → Cria PRDs" },
  { id: "atendimento", name: "Pipeline de Atendimento", icon: "🎧", color: "#10b981", summary: "Jitbit/WhatsApp → Classificação IA → Busca KB → Sugere resposta → Mede SLA" },
  { id: "imagem", name: "Pipeline de Imagens", icon: "📷", color: "#f59e0b", summary: "Upload → GPT-4o Vision → Score confiança → Fila revisão humana" },
  { id: "operacional", name: "Pipeline Operacional", icon: "📊", color: "#8b5cf6", summary: "3 bancos → KPIs → Relatório fluxo → Operations Hub → Agente autônomo" },
  { id: "conhecimento", name: "Pipeline de Conhecimento", icon: "📚", color: "#ec4899", summary: "Gera docs → Treina Q&A → Embeddings → Chat IA" },
];

const PROCESSOS_AXHUB = [
  { modulo: "Infrações", icone: "🚨", itens: ["Triagem", "Auditoria", "Consulta", "Exportação", "Exceções", "Descartadas"] },
  { modulo: "Operações", icone: "🔧", itens: ["Cadastro", "Aferições", "Faixas", "Monitoramento", "Eventos", "Consulta Placas"] },
  { modulo: "Equipamentos", icone: "📡", itens: ["Fabricantes", "Tipos", "Modelos", "Grupos", "Lista"] },
  { modulo: "Medição", icone: "📏", itens: ["Contratos", "Performance", "Criar", "Interrupções", "Finalizadas", "Recursos"] },
  { modulo: "Pesagem/Balança", icone: "⚖️", itens: ["Postos", "Tickets Aberto", "Tickets Fechado", "Liberar", "Reclassificar", "Motivos"] },
  { modulo: "Cronotacógrafo", icone: "⏱️", itens: ["Triagem", "Consulta"] },
  { modulo: "Relatórios/BI", icone: "📈", itens: ["Infrações", "Eventos", "Passagens", "Fluxo", "Falhas", "Discrepâncias", "Logs", "Power BI"] },
  { modulo: "Veículos", icone: "🚗", itens: ["Tipos", "Espécies", "Marcas", "Modelos", "Cores", "Categorias", "Classificações", "Municípios"] },
  { modulo: "Controle Acesso", icone: "🔐", itens: ["Usuários", "Perfis", "Permissões", "Logs", "Restrição IP"] },
  { modulo: "Administração", icone: "⚙️", itens: ["Configurações", "Arcos", "Enquadramentos", "Layouts", "Motivos", "Regiões", "Sequenciais", "Tarjas", "Webhooks"] },
];

const PROCESSOS_AXCROSS = [
  { modulo: "Veículos Monitorados", icone: "🚗", itens: ["Lista", "Tipos Ocorrências", "Alertas Tempo Real", "Classificações", "Importação Lote"] },
  { modulo: "Equipamentos", icone: "📡", itens: ["Lista", "Grupos", "Áreas", "Importação"] },
  { modulo: "Monitoramento Online", icone: "🗺️", itens: ["Tempo Real (SignalR)", "Mapa Google Maps"] },
  { modulo: "Relatórios", icone: "📈", itens: ["Passagens", "Rotas", "Rastreamento", "Monitorados", "Ocorrências", "PDFs"] },
  { modulo: "MDF-e (Fiscal)", icone: "📄", itens: ["Painel Fiscal", "OCR + SEFAZ", "Manifesto Eletrônico"] },
  { modulo: "Configurações", icone: "⚙️", itens: ["Sistema", "Usuários", "Perfis", "Permissões", "Logs", "Sincronização"] },
];

// ── HELPERS ─────────────────────────────────────────────────────────
function scoreColor(score) {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#f59e0b';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

function calcHealthScore(site, chamadosData) {
  let score = 100;
  if (site.ocr) score -= Math.max(0, (95 - site.ocr) * 0.5);
  else score -= 10;
  if (site.versao && site.versao < 'v.1.2.0') score -= 10;
  const siteChamados = chamadosData?.ranking?.find(r => r.siteId === site.id);
  if (siteChamados) {
    score -= Math.min(30, siteChamados.abertos * 2);
    score -= Math.min(20, (siteChamados.criticos || 0) * 5);
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Wrapper para manter compatibilidade com props antigas
function KPICard({ icon, label, value, sublabel, color, link }) {
  const iconMap = {
    '🏢': <Building2 />,
    '💯': <TrendingUp />,
    '🎫': <Ticket />,
    '🔴': <AlertCircle />,
    '📷': <Camera />,
    '🎯': <Target />,
    '👥': <Users />,
    '📊': <Activity />
  };
  const iconElement = iconMap[icon] || icon;
  
  const card = (
    <div style={{ borderTop: `3px solid ${color}`, borderRadius: '8px' }}>
      <UIKPICard 
        icon={iconElement}
        label={label}
        value={value}
        sublabel={sublabel}
        size="medium"
        clickable={!!link}
      />
    </div>
  );

  if (link) {
    return <Link to={link} style={{ textDecoration: 'none' }}>{card}</Link>;
  }

  return card;
}

// ── ABAS ────────────────────────────────────────────────────────────
const TABS = [
  { id: 'dashboard', label: '📊 Dashboard', desc: 'KPIs consolidados' },
  { id: 'mapa', label: '🗺️ Mapa Visual', desc: 'Diagrama interativo' },
  { id: 'sites', label: '🏢 Sites & Credenciais', desc: 'Métricas + Acessos' },
  { id: 'processos', label: '📋 Processos', desc: 'AxHub/AxCross' },
  { id: 'fluxos', label: '🔄 Fluxos BPM', desc: 'Passo a passo' },
  { id: 'relatorios', label: '📈 Relatórios', desc: 'Geração e exportação' },
];

/* ═══════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═══════════════════════════════════════════════════════════════════ */
export default function OperationsHub() {
  const [tab, setTab] = useState('dashboard');
  const [chamadosData, setChamadosData] = useState(null);
  const [slaData, setSlaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtroSistema, setFiltroSistema] = useState('Todos');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [selectedSite, setSelectedSite] = useState(null);
  const [showCredenciais, setShowCredenciais] = useState(false); // Controla exibição de credenciais
  const [sistemaProcessos, setSistemaProcessos] = useState('AxHub'); // Estado para aba Processos

  // Busca dados consolidados
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [chamRes, slaRes] = await Promise.all([
          api.get(`/helpdesk/sites-overview`).then(r => r.data).catch(() => null),
          api.get(`/helpdesk/sla-compliance`, { params: { dateFrom: new Date(Date.now()-30*86400000).toISOString().slice(0,10), dateTo: new Date().toISOString().slice(0,10) }, timeout: 15000 }).then(r => r.data).catch(() => null),
        ]);
        if (mounted) {
          if (chamRes) setChamadosData(chamRes);
          if (slaRes) setSlaData(slaRes);
        }
      } catch { /* ignore */ }
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  // Cálculo de sites com score
  const sitesComScore = useMemo(() => {
    return ALL_SITES.map(site => ({
      ...site,
      healthScore: calcHealthScore(site, chamadosData),
      chamados: chamadosData?.ranking?.find(r => r.siteId === site.id) || { abertos: 0, total: 0, criticos: 0 },
    }));
  }, [chamadosData]);

  const sitesFiltrados = useMemo(() => {
    return sitesComScore.filter(s => {
      if (filtroSistema !== 'Todos' && s.sistema !== filtroSistema) return false;
      if (filtroEstado !== 'Todos' && s.estado !== filtroEstado) return false;
      return true;
    }).sort((a, b) => b.healthScore - a.healthScore);
  }, [sitesComScore, filtroSistema, filtroEstado]);

  const estados = [...new Set(ALL_SITES.map(s => s.estado))].sort();

  // KPIs globais
  const kpis = useMemo(() => {
    const totalSites = ALL_SITES.length;
    const sitesAtivos = AXHUB_SITES.filter(s => s.status === 'ativo').length + AXCROSS_SITES.filter(s => s.status === 'ativo').length;
    const avgScore = sitesComScore.length > 0 ? Math.round(sitesComScore.reduce((s, x) => s + x.healthScore, 0) / sitesComScore.length) : 0;
    const totalChamados = chamadosData?.totalTickets || 0;
    const chamadosAbertos = chamadosData?.abertos || chamadosData?.sites?.reduce((s, x) => s + (x.abertos || 0), 0) || 0;
    const criticos = chamadosData?.criticos || 0;
    const avgOCR = AXHUB_SITES.filter(s => s.ocr).length > 0
      ? Math.round(AXHUB_SITES.filter(s => s.ocr).reduce((acc, s) => acc + s.ocr, 0) / AXHUB_SITES.filter(s => s.ocr).length * 10) / 10
      : 0;
    const slaCompliance = slaData?.complianceRate || null;
    return { totalSites, sitesAtivos, avgScore, totalChamados, chamadosAbertos, criticos, avgOCR, slaCompliance };
  }, [sitesComScore, chamadosData, slaData]);

  // ── Render Tabs ─────────────────────────────────────────────────────
  function renderTabContent() {
    switch (tab) {
      case 'dashboard':
        return renderDashboard();
      case 'mapa':
        return renderMapa();
      case 'sites':
        return renderSites();
      case 'processos':
        return renderProcessos();
      case 'fluxos':
        return renderFluxos();
      case 'relatorios':
        return renderRelatorios();
      default:
        return null;
    }
  }

  // ──  Aba: Dashboard ────────────────────────────────────────────────
  function renderDashboard() {
    return (
      <div className="ops-dashboard">
        <div className="ops-kpis-grid">
          <KPICard icon="🏢" label="Sites Totais" value={kpis.totalSites} sublabel={`${kpis.sitesAtivos} ativos`} color="#3b82f6" link="/analise" />
          <KPICard icon="💚" label="Health Score Médio" value={`${kpis.avgScore}%`} color={scoreColor(kpis.avgScore)} link="/dashboard" />
          <KPICard icon="🎫" label="Chamados Abertos" value={kpis.chamadosAbertos} sublabel={`${kpis.criticos} críticos`} color="#f59e0b" link="/helpdesk" />
          <KPICard icon="📸" label="OCR Médio" value={`${kpis.avgOCR}%`} sublabel="AxHub" color="#10b981" link="/analise-imagens" />
          <KPICard icon="🎯" label="SLA Compliance" value={kpis.slaCompliance !== null ? `${kpis.slaCompliance}%` : 'N/A'} color="#8b5cf6" link="/helpdesk" />
          <KPICard icon="📊" label="Total Chamados" value={kpis.totalChamados} sublabel="Últimos 30 dias" color="#ec4899" link="/helpdesk" />
        </div>

        <div className="ops-dashboard-sections">
          <div className="ops-section">
            <h3>🟢 Top Performers (Health &gt; 80%)</h3>
            <div className="ops-sites-mini">
              {sitesFiltrados.filter(s => s.healthScore >= 80).slice(0, 5).map(s => (
                <div key={s.id} className="ops-site-mini">
                  <span className="ops-site-name">{s.nome}</span>
                  <span className="ops-site-score" style={{ color: scoreColor(s.healthScore) }}>{s.healthScore}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ops-section">
            <h3>🔴 Sites Críticos (Health &lt; 60%)</h3>
            <div className="ops-sites-mini">
              {sitesFiltrados.filter(s => s.healthScore < 60).map(s => (
                <div key={s.id} className="ops-site-mini ops-site-critico">
                  <span className="ops-site-name">{s.nome}</span>
                  <span className="ops-site-score" style={{ color: scoreColor(s.healthScore) }}>{s.healthScore}%</span>
                  <span className="ops-site-info">{s.chamados.abertos} chamados abertos</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Aba: Mapa Visual ────────────────────────────────────────────────
  function renderMapa() {
    return (
      <div className="ops-mapa">
        <div className="ops-mapa-header">
          <h3>🗺️ Ecossistema AxionIA — Diagrama de Processos</h3>
          <p>26 nós interativos organizados em 6 grupos: Entrada, Processamento, Qualidade, Inteligência, Conhecimento e Saída</p>
        </div>

        <div className="ops-pipelines">
          <h4>5 Pipelines Principais</h4>
          <div className="ops-pipelines-grid">
            {PIPELINES.map(p => {
              const pipelineLink = 
                p.id === 'edital' ? '/pipeline-editais' :
                p.id === 'atendimento' ? '/helpdesk' :
                p.id === 'imagem' ? '/analise-imagens' :
                p.id === 'operacional' ? '/dashboard' :
                p.id === 'conhecimento' ? '/kb' : null;
              
              return pipelineLink ? (
                <Link key={p.id} to={pipelineLink} className="ops-pipeline-card" style={{ borderLeftColor: p.color, textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                  <span className="ops-pipeline-icon">{p.icon}</span>
                  <strong>{p.name}</strong>
                  <p>{p.summary}</p>
                </Link>
              ) : (
                <div key={p.id} className="ops-pipeline-card" style={{ borderLeftColor: p.color }}>
                  <span className="ops-pipeline-icon">{p.icon}</span>
                  <strong>{p.name}</strong>
                  <p>{p.summary}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="ops-mapa-visual">
          <svg width="1000" height="850" style={{ background: '#f9fafb', borderRadius: '8px' }}>
            {/* Simplified SVG - add full implementation later */}
            {NODES.map(n => (
              <g key={n.id} className={n.link ? 'ops-node-clickable' : ''} style={{ cursor: n.link ? 'pointer' : 'default' }}>
                {n.link ? (
                  <a href={n.link} onClick={(e) => { e.preventDefault(); window.location.href = n.link; }}>
                    <circle cx={n.x} cy={n.y} r="30" fill="#3b82f6" opacity="0.2" className="ops-node-circle" />
                    <text x={n.x} y={n.y} fontSize="20" textAnchor="middle" dominantBaseline="middle" className="ops-node-icon">{n.icon}</text>
                    <text x={n.x} y={n.y + 45} fontSize="11" textAnchor="middle" fill="#374151" className="ops-node-label">{n.label}</text>
                  </a>
                ) : (
                  <>
                    <circle cx={n.x} cy={n.y} r="30" fill="#3b82f6" opacity="0.2" />
                    <text x={n.x} y={n.y} fontSize="20" textAnchor="middle" dominantBaseline="middle">{n.icon}</text>
                    <text x={n.x} y={n.y + 45} fontSize="11" textAnchor="middle" fill="#374151">{n.label}</text>
                  </>
                )}
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  }

  // ── Aba: Sites & Credenciais ───────────────────────────────────────
  function renderSites() {
    return (
      <div className="ops-sites">
        <div className="ops-sites-header">
          <div className="ops-filters">
            <select value={filtroSistema} onChange={e => setFiltroSistema(e.target.value)}>
              <option>Todos</option>
              <option>AxHub</option>
              <option>AxCross</option>
              <option>AxTon</option>
            </select>
            <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              <option>Todos</option>
              {estados.map(e => <option key={e}>{e}</option>)}
            </select>
          </div>
          <div className="ops-sites-actions">
            <button className="ops-btn-secondary" onClick={() => { setShowCredenciais(true); setSelectedSite(null); }}>
              🔐 Gerenciar Credenciais
            </button>
            <span className="ops-sites-count">{sitesFiltrados.length} sites</span>
          </div>
        </div>

        <table className="ops-sites-table">
          <thead>
            <tr>
              <th>Site</th>
              <th>Sistema</th>
              <th>Estado</th>
              <th>Versão</th>
              <th>OCR</th>
              <th>Chamados</th>
              <th>Health Score</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {sitesFiltrados.map(s => (
              <tr key={s.id} onClick={() => setSelectedSite(s)} className={selectedSite?.id === s.id ? 'selected' : ''}>
                <td><strong>{s.nome}</strong></td>
                <td><span className="ops-badge">{s.sistema}</span></td>
                <td>{s.estado}</td>
                <td>{s.versao || 'N/A'}</td>
                <td>{s.ocr ? `${s.ocr}%` : '-'}</td>
                <td>{s.chamados.abertos} {s.chamados.criticos > 0 && <span className="ops-badge-danger">{s.chamados.criticos} crít.</span>}</td>
                <td>
                  <span className="ops-health-score" style={{ color: scoreColor(s.healthScore) }}>
                    {s.healthScore}%
                  </span>
                </td>
                <td><span className={`ops-status-dot ${s.status}`}></span></td>
                <td>
                  <button 
                    className="ops-btn-icon" 
                    onClick={(e) => { e.stopPropagation(); setSelectedSite(s); setShowCredenciais(true); }}
                    title="Ver credenciais"
                  >
                    🔐
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selectedSite && !showCredenciais && (
          <div className="ops-site-detail-panel">
            <button className="ops-close-panel" onClick={() => setSelectedSite(null)}>✕</button>
            <h3>{selectedSite.nome}</h3>
            <div className="ops-detail-grid">
              <div><strong>Sistema:</strong> {selectedSite.sistema}</div>
              <div><strong>Estado:</strong> {selectedSite.estado}</div>
              <div><strong>Versão:</strong> {selectedSite.versao || 'N/A'}</div>
              <div><strong>OCR:</strong> {selectedSite.ocr ? `${selectedSite.ocr}%` : '-'}</div>
              <div><strong>Chamados Abertos:</strong> {selectedSite.chamados.abertos}</div>
              <div><strong>Chamados Críticos:</strong> {selectedSite.chamados.criticos}</div>
              <div><strong>Health Score:</strong> <span style={{ color: scoreColor(selectedSite.healthScore) }}>{selectedSite.healthScore}%</span></div>
            </div>
            <button className="ops-btn-primary" onClick={() => setShowCredenciais(true)}>
              🔐 Ver Credenciais
            </button>
          </div>
        )}

        {showCredenciais && (
          <div className="ops-credenciais-panel">
            <div className="ops-credenciais-header">
              <h3>🔐 Gerenciador de Credenciais</h3>
              <button className="ops-close-panel" onClick={() => { setShowCredenciais(false); setSelectedSite(null); }}>✕</button>
            </div>
            <div className="ops-credenciais-content">
              <CredenciaisManager selectedSite={selectedSite} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Aba: Processos ─────────────────────────────────────────────────
  function renderProcessos() {
    const processos = sistemaProcessos === 'AxHub' ? PROCESSOS_AXHUB : PROCESSOS_AXCROSS;
    
    return (
      <div className="ops-processos">
        <div className="ops-processos-header">
          <h3>📋 Processos Operacionais</h3>
          <div className="ops-sistema-toggle">
            <button className={sistemaProcessos === 'AxHub' ? 'active' : ''} onClick={() => setSistemaProcessos('AxHub')}>AxHub</button>
            <button className={sistemaProcessos === 'AxCross' ? 'active' : ''} onClick={() => setSistemaProcessos('AxCross')}>AxCross</button>
          </div>
        </div>

        <div className="ops-processos-grid">
          {processos.map((p, i) => (
            <div key={i} className="ops-processo-card">
              <div className="ops-processo-header">
                <span className="ops-processo-icon">{p.icone}</span>
                <strong>{p.modulo}</strong>
              </div>
              <ul className="ops-processo-itens">
                {p.itens.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Aba: Fluxos BPM ────────────────────────────────────────────────
  function renderFluxos() {
    return (
      <div className="ops-fluxos">
        <h3>🔄 Fluxos de Processos BPM</h3>
        <p>Fluxos detalhados passo a passo dos principais processos operacionais</p>
        <div className="ops-fluxos-placeholder">
          <p>📊 6 Fluxos Detalhados</p>
          <ul>
            <li>Processo de Infrações (Início → Exportação)</li>
            <li>Processo de Pesagem Veicular (Balança)</li>
            <li>Monitoramento em Tempo Real</li>
            <li>Processo de Medição (Performance)</li>
            <li>Atendimento Helpdesk (Jitbit → Resposta)</li>
            <li>Operação de Equipamentos</li>
          </ul>
        </div>
      </div>
    );
  }

  // ── Aba: Relatórios ────────────────────────────────────────────────
  function renderRelatorios() {
    return (
      <div className="ops-relatorios">
        <h3>📈 Geração de Relatórios</h3>
        <div className="ops-relatorio-form">
          <p>Selecione o tipo de relatório e os filtros para geração:</p>
          <select>
            <option>Relatório de Sites (Consolidado)</option>
            <option>Relatório de Chamados (Por Período)</option>
            <option>Relatório de Performance (Health Score)</option>
            <option>Relatório de SLA (Compliance)</option>
          </select>
          <button className="ops-btn-primary">📥 Gerar Relatório</button>
        </div>
      </div>
    );
  }

  // ── Render Principal ────────────────────────────────────────────────
  return (
    <div className="ops-container">
      <header className="ops-header">
        <div className="ops-header-text">
          <h1>🧠 Operations Hub</h1>
          <p>Centro de comando operacional — Processos, Métricas e Inteligência</p>
        </div>
        <div className="ops-header-stats">
          <span className="ops-health-badge" style={{ background: scoreColor(kpis.avgScore) }}>
            Health: {kpis.avgScore}%
          </span>
        </div>
      </header>

      <nav className="ops-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`ops-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span className="ops-tab-label">{t.label}</span>
            <span className="ops-tab-desc">{t.desc}</span>
          </button>
        ))}
      </nav>

      <main className="ops-content">
        {renderTabContent()}
      </main>
    </div>
  );
}
