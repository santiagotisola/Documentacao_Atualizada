import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AXHUB_SITES, AXCROSS_SITES } from '../data/sitesData';
import { api } from '../services/api';
import { KPICard as UIKPICard, LoadingSpinner } from '../components/ui';
import { Building2, TrendingUp, Ticket, AlertCircle, Camera, Target, Users, Activity } from 'lucide-react';
import CredenciaisManager from '../components/CredenciaisManager';
import QuickSelect from '../components/QuickSelect.jsx';
import IntelligenceDashboardPage from './IntelligenceDashboard';
import QualityDashboardPage from './CentralQualidade/components/Dashboard';
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

// ── MINI BAR — barra de progresso inline ───────────────────────────
function MiniBar({ value, max, color }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden', minWidth: '60px' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px', transition: 'width 0.3s' }} />
    </div>
  );
}

// ── GAUGE — arco SVG semi-circular (mesmo da HomePage) ──────────────
function OpsGauge({ value, max = 100, color = '#3b82f6', size = 110, label, unit = '%' }) {
  const pct   = max > 0 ? Math.min(1, value / max) : 0;
  const R     = 38;
  const cx    = size / 2;
  const cy    = size / 2 + 8;
  const arc   = Math.PI * R;
  const dash  = pct * arc;
  const gap   = arc - dash;
  const fontSize = value >= 1000 ? 12 : value >= 100 ? 14 : 17;
  return (
    <div className="ops-gauge-wrap">
      <svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size * 0.7}`}>
        <path d={`M${cx - R},${cy} A${R},${R} 0 0 1 ${cx + R},${cy}`}
          fill="none" stroke="#e5e7eb" strokeWidth="7" strokeLinecap="round" />
        <path d={`M${cx - R},${cy} A${R},${R} 0 0 1 ${cx + R},${cy}`}
          fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`} style={{ transition: 'stroke-dasharray 0.6s ease' }} />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={fontSize} fontWeight="700" fill="#1f2937">
          {value}{unit}
        </text>
      </svg>
      {label && <span className="ops-gauge-label">{label}</span>}
    </div>
  );
}

// ── OPS KPI CARD — gauge + sub-info + link ──────────────────────────
function OpsKpiCard({ value, max, color, label, unit = '%', sublabel, link }) {
  const inner = (
    <div className="ops-kpi-new" style={{ '--kpi-color': color }}>
      <OpsGauge value={value} max={max} color={color} unit={unit} />
      <div className="ops-kpi-new-label">{label}</div>
      {sublabel && <div className="ops-kpi-new-sub">{sublabel}</div>}
      {link && <div className="ops-kpi-new-link">Ver detalhes →</div>}
    </div>
  );
  if (link) return <Link to={link} style={{ textDecoration: 'none' }}>{inner}</Link>;
  return inner;
}

// ── LAUNCHER — módulos de acesso rápido ─────────────────────────────
const SERVICOS_LAUNCHER = [
  { icon: '🤖', titulo: 'Chat IA',            desc: 'Assistente inteligente',    link: '/central-atendimento?tab=chat',      cor: '#8b5cf6', cat: 'Atendimento' },
  { icon: '💬', titulo: 'WhatsApp Bot',       desc: 'Atendimento automático',    link: '/central-atendimento?tab=whatsapp',  cor: '#25d366', cat: 'Atendimento' },
  { icon: '🎫', titulo: 'Helpdesk',           desc: 'Tickets Jitbit',            link: '/central-atendimento?tab=helpdesk',  cor: '#ef4444', cat: 'Atendimento' },
  { icon: '🔍', titulo: 'Análise Imagens',    desc: 'OCR e validação',           link: '/hub-analise?tab=imagens',           cor: '#06b6d4', cat: 'Análise' },
  { icon: '🧪', titulo: 'Validação Sistemas', desc: 'Testes automatizados',      link: '/central-validacao',                 cor: '#a855f7', cat: 'Análise' },
  { icon: '✅', titulo: 'Fila de Revisão',    desc: 'Confiança OCR',             link: '/hub-analise?tab=logs',              cor: '#14b8a6', cat: 'Análise' },
  { icon: '📚', titulo: 'Knowledge Base',     desc: 'Base de conhecimento',      link: '/kb',                                cor: '#6366f1', cat: 'Análise' },
  { icon: '🏛️', titulo: 'Editais Gov',        desc: 'Busca PNCP',               link: '/editais-gov',                       cor: '#10b981', cat: 'Inteligência' },
  { icon: '📊', titulo: 'Análise Multi',      desc: 'Comparativo de produtos',   link: '/analisa-multi',                     cor: '#f59e0b', cat: 'Inteligência' },
  { icon: '🗺️', titulo: 'Roadmap',            desc: 'Planejamento de produto',   link: '/roadmap',                           cor: '#0ea5e9', cat: 'Inteligência' },
  { icon: '📐', titulo: 'Specs',              desc: 'Especificações técnicas',   link: '/specs',                             cor: '#64748b', cat: 'Inteligência' },
  { icon: '🎯', titulo: 'SLA Compliance',     desc: 'Conformidade de SLA',       link: '/sla-compliance',                    cor: '#ec4899', cat: 'Qualidade' },
  { icon: '📜', titulo: 'Conformidade',       desc: 'Editais e requisitos',      link: '/conformidade',                      cor: '#d97706', cat: 'Qualidade' },
  { icon: '📄', titulo: 'Gerar Doc',          desc: 'Documentação automática',   link: '/gerar-doc',                         cor: '#f59e0b', cat: 'Admin' },
  { icon: '⏱️', titulo: 'Planilha Horas',     desc: 'Controle de tempo',         link: '/planilha-horas',                    cor: '#0369a1', cat: 'Admin' },
  { icon: '🎓', titulo: 'Treinamento',        desc: 'Capacitação IA',            link: '/treinamento',                       cor: '#4f46e5', cat: 'Admin' },
  { icon: '📋', titulo: 'Logs',               desc: 'Auditoria e rastreio',      link: '/hub-analise?tab=logs',              cor: '#64748b', cat: 'Admin' },
  { icon: '🔬', titulo: 'Análise de Sites',   desc: 'Comparativo de contratos',  link: '/analise',                           cor: '#0891b2', cat: 'Operação' },
  { icon: '📋', titulo: 'Guia por Site',      desc: 'Manual por contrato',       link: '/guia-sites',                        cor: '#059669', cat: 'Operação' },
];
const CATS_LAUNCHER = ['Todos', 'Atendimento', 'Análise', 'Inteligência', 'Qualidade', 'Admin', 'Operação'];

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
  { id: 'dashboard',       label: '📊 Dashboard',       desc: 'KPIs consolidados' },
  { id: 'performance',     label: '⚡ Performance',      desc: 'Health Score & OCR' },
  { id: 'qualidade',       label: '🛡️ Qualidade',        desc: 'Projetos e scans' },
  { id: 'observabilidade', label: '🔭 Observabilidade',  desc: 'Health avançado & anomalias' },
  { id: 'mapa',            label: '🗺️ Mapa Visual',      desc: 'Diagrama interativo' },
  { id: 'launcher',        label: '🚀 Acesso Rápido',    desc: 'Todos os módulos' },
  { id: 'relatorios',      label: '📈 Relatórios',       desc: 'Geração e exportação' },
];

/* ═══════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═══════════════════════════════════════════════════════════════════ */
export default function OperationsHub() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'dashboard';
  const [tab, setTab] = useState(tabFromUrl);

  // Sincronizar URL ao trocar de aba
  useEffect(() => {
    setSearchParams(tab === 'dashboard' ? {} : { tab }, { replace: true });
  }, [tab]);
  const [chamadosData, setChamadosData] = useState(null);
  const [slaData, setSlaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtroSistema, setFiltroSistema] = useState('Todos');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [selectedSite, setSelectedSite] = useState(null);
  const [showCredenciais, setShowCredenciais] = useState(false); // Controla exibição de credenciais
  const [sistemaProcessos, setSistemaProcessos] = useState('AxHub'); // mantido para compatibilidade
  const [filtroLauncher, setFiltroLauncher] = useState('Todos');

  // Redirecionar tabs movidas
  useEffect(() => {
    if (tab === 'processos') navigate('/central-processos?tab=axhub', { replace: true });
    if (tab === 'fluxos')    navigate('/central-processos?tab=fluxos', { replace: true });
    if (tab === 'chamados')  navigate('/central-atendimento?tab=helpdesk', { replace: true });
    if (tab === 'sites')     navigate('/central-sites', { replace: true });
  }, [tab]);

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
      case 'dashboard':       return renderDashboard();
      case 'chamados':        return null; // redirect → /central-atendimento?tab=helpdesk
      case 'sites':           return null; // redirect → /central-sites
      case 'performance':     return renderPerformance();
      case 'sites':           return renderSites();
      case 'qualidade':       return <div style={{padding:'0.5rem 0'}}><QualityDashboardPage /></div>;
      case 'observabilidade': return <div style={{padding:'0.5rem 0'}}><IntelligenceDashboardPage /></div>;
      case 'mapa':            return renderMapa();
      case 'launcher':        return renderLauncher();
      case 'relatorios':      return renderRelatorios();
      default:                return null;
    }
  }

  // ──  Aba: Dashboard ────────────────────────────────────────────────
  function renderDashboard() {
    const topSites  = sitesFiltrados.filter(s => s.healthScore >= 80).slice(0, 6);
    const badSites  = sitesFiltrados.filter(s => s.healthScore < 60).slice(0, 6);
    const allSorted = [...sitesFiltrados].sort((a, b) => b.healthScore - a.healthScore);

    return (
      <div className="ops-dashboard">

        {/* ── Gauges KPI ── */}
        <div className="ops-db-gauges-row">
          <OpsKpiCard value={kpis.avgScore}        max={100}  color="#3b82f6"  label="Health Score Médio"  link="/dashboard" />
          <OpsKpiCard value={kpis.avgOCR}          max={100}  color="#06b6d4"  label="OCR Médio (AxHub)"   link="/analise-imagens" />
          <OpsKpiCard value={kpis.sitesAtivos}     max={kpis.totalSites} color="#22c55e" unit="" label="Sites Ativos" sublabel={`de ${kpis.totalSites} total`} link="/analise" />
          <OpsKpiCard value={kpis.chamadosAbertos} max={Math.max(kpis.chamadosAbertos, 1)} color="#f59e0b" unit="" label="Chamados Abertos" sublabel={`${kpis.criticos} críticos`} link="/helpdesk" />
          {kpis.slaCompliance !== null && (
            <OpsKpiCard value={kpis.slaCompliance} max={100}  color="#8b5cf6"  label="SLA Compliance"      link="/helpdesk" />
          )}
          <OpsKpiCard value={kpis.totalChamados}   max={Math.max(kpis.totalChamados, 1)} color="#ec4899" unit="" label="Total Chamados" sublabel="Últimos 30 dias" link="/helpdesk" />
        </div>

        {/* ── Barra de stats ── */}
        <div className="ops-db-stats-bar">
          {[
            { label: 'Sites Totais',        val: kpis.totalSites },
            { label: 'Sites Ativos',         val: kpis.sitesAtivos },
            { label: 'Health > 80%',         val: sitesComScore.filter(s => s.healthScore >= 80).length },
            { label: 'Tickets Abertos',      val: kpis.chamadosAbertos },
            { label: 'Críticos',             val: kpis.criticos },
            { label: 'Equipamentos (AxHub)', val: AXHUB_SITES.reduce((a, s) => a + (s.equipamentos?.total || 0), 0) },
          ].map(k => (
            <div key={k.label} className="ops-db-stat">
              <span className="ops-db-stat-num">{k.val}</span>
              <span className="ops-db-stat-lbl">{k.label}</span>
            </div>
          ))}
        </div>

        {/* ── Seções lado a lado ── */}
        <div className="ops-db-sections">

          {/* Top Performers */}
          <div className="ops-db-section">
            <div className="ops-db-section-title">
              <span className="ops-db-section-dot" style={{ background: '#22c55e' }} />
              Top Performers — Health ≥ 80%
            </div>
            <div className="ops-db-site-list">
              {topSites.length === 0
                ? <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Nenhum site nesta faixa.</p>
                : topSites.map(s => (
                  <div key={s.id} className="ops-db-site-row">
                    <span className="ops-db-site-name">{s.nome}</span>
                    <div className="ops-db-site-bar">
                      <div style={{ height: '100%', width: `${s.healthScore}%`, background: scoreColor(s.healthScore), borderRadius: '3px', transition: 'width 0.4s' }} />
                    </div>
                    <span className="ops-db-site-score" style={{ color: scoreColor(s.healthScore) }}>{s.healthScore}%</span>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Sites Críticos */}
          <div className="ops-db-section">
            <div className="ops-db-section-title">
              <span className="ops-db-section-dot" style={{ background: '#ef4444' }} />
              Sites Críticos — Health &lt; 60%
            </div>
            <div className="ops-db-site-list">
              {badSites.length === 0
                ? <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Nenhum site crítico 🎉</p>
                : badSites.map(s => (
                  <div key={s.id} className="ops-db-site-row">
                    <span className="ops-db-site-name">{s.nome}</span>
                    <div className="ops-db-site-bar">
                      <div style={{ height: '100%', width: `${s.healthScore}%`, background: scoreColor(s.healthScore), borderRadius: '3px', transition: 'width 0.4s' }} />
                    </div>
                    <span className="ops-db-site-score" style={{ color: scoreColor(s.healthScore) }}>{s.healthScore}%</span>
                    <span className="ops-db-site-chamados">{s.chamados.abertos} tickets</span>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Ranking Geral */}
          <div className="ops-db-section ops-db-section--wide">
            <div className="ops-db-section-title">
              <span className="ops-db-section-dot" style={{ background: '#3b82f6' }} />
              Ranking Geral de Sites
            </div>
            <div className="ops-db-site-list">
              {allSorted.slice(0, 10).map((s, i) => (
                <div key={s.id} className="ops-db-site-row">
                  <span className="ops-db-site-rank">#{i + 1}</span>
                  <span className="ops-db-site-name">{s.nome}</span>
                  <span className="ops-db-site-sistema">{s.sistema}</span>
                  <div className="ops-db-site-bar">
                    <div style={{ height: '100%', width: `${s.healthScore}%`, background: scoreColor(s.healthScore), borderRadius: '3px', transition: 'width 0.4s' }} />
                  </div>
                  <span className="ops-db-site-score" style={{ color: scoreColor(s.healthScore) }}>{s.healthScore}%</span>
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

  // ── Aba: Relatórios ────────────────────────────────────────────────
  function renderRelatorios() {
    return (
      <div className="ops-relatorios">
        <h3>📈 Geração de Relatórios</h3>
        <div className="ops-relatorio-form">
          <p>Selecione o tipo de Relatório e os filtros para geração:</p>
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

  // ── Aba: Performance ────────────────────────────────────────────────
  function renderPerformance() {
    const ranges = [
      { label: '90-100% (Excelente)', min: 90, max: 100, color: '#22c55e' },
      { label: '70-89% (Bom)',        min: 70, max:  89, color: '#84cc16' },
      { label: '50-69% (Regular)',    min: 50, max:  69, color: '#f59e0b' },
      { label: '30-49% (Ruim)',       min: 30, max:  49, color: '#f97316' },
      { label: '0-29% (Crítico)',     min:  0, max:  29, color: '#ef4444' },
    ];
    const scoreDistrib = ranges.map(r => ({
      ...r,
      count: sitesComScore.filter(s => s.healthScore >= r.min && s.healthScore <= r.max).length,
    }));
    const ocrRanking = sitesComScore.filter(s => s.ocr && s.ocr > 0).sort((a, b) => b.ocr - a.ocr);

    return (
      <div className="ops-performance">
        <div className="ops-section">
          <h3>📊 Distribuição de Health Score</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
            {scoreDistrib.map(r => (
              <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ width: '160px', fontSize: '0.85rem', color: '#4b5563', flexShrink: 0 }}>{r.label}</span>
                <div style={{ flex: 1 }}>
                  <MiniBar value={r.count} max={sitesComScore.length} color={r.color} />
                </div>
                <span style={{ width: '24px', fontWeight: 700, color: r.color }}>{r.count}</span>
              </div>
            ))}
          </div>
        </div>

        {ocrRanking.length > 0 && (
          <div className="ops-section">
            <h3>📷 Ranking OCR por Site</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
              {ocrRanking.map((s, i) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ width: '24px', color: '#9ca3af', fontSize: '0.85rem' }}>#{i + 1}</span>
                  <span style={{ flex: 1, fontSize: '0.9rem' }}>{s.nome}</span>
                  <div style={{ width: '120px' }}>
                    <MiniBar value={s.ocr} max={100} color={s.ocr >= 90 ? '#22c55e' : s.ocr >= 70 ? '#f59e0b' : '#ef4444'} />
                  </div>
                  <span style={{ width: '44px', fontWeight: 700, color: s.ocr >= 90 ? '#22c55e' : s.ocr >= 70 ? '#f59e0b' : '#ef4444', textAlign: 'right' }}>{s.ocr}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="ops-section">
          <h3>⚡ Métricas de Gestão</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
            {[
              { titulo: 'Versão Atual (≥v.1.2.0)', valor: `${sitesComScore.filter(s => s.versao && s.versao >= 'v.1.2.0').length} / ${sitesComScore.filter(s => s.versao).length}` },
              { titulo: 'Sites Sem Chamados', valor: sitesComScore.filter(s => s.chamados.abertos === 0).length },
              { titulo: 'Sites com Health > 80%', valor: sitesComScore.filter(s => s.healthScore >= 80).length },
              { titulo: 'Equipamentos (AxHub)', valor: AXHUB_SITES.reduce((a, s) => a + (s.equipamentos?.total || 0), 0) },
            ].map(m => (
              <div key={m.titulo} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>{m.titulo}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{m.valor}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Aba: Acesso Rápido (Launcher) ───────────────────────────────────
  function renderLauncher() {
    const lista = filtroLauncher === 'Todos' ? SERVICOS_LAUNCHER : SERVICOS_LAUNCHER.filter(s => s.cat === filtroLauncher);
    return (
      <div className="ops-launcher">
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {CATS_LAUNCHER.map(c => (
            <button key={c}
              onClick={() => setFiltroLauncher(c)}
              style={{
                padding: '5px 14px', borderRadius: '20px', border: '1px solid',
                cursor: 'pointer', fontSize: '0.85rem', fontWeight: filtroLauncher === c ? 700 : 400,
                background: filtroLauncher === c ? '#3b82f6' : '#fff',
                color: filtroLauncher === c ? '#fff' : '#374151',
                borderColor: filtroLauncher === c ? '#3b82f6' : '#d1d5db',
              }}>{c}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
          {lista.map((s, i) => (
            <div key={i}
              onClick={() => navigate(s.link)}
              style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1rem', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center',
                transition: 'box-shadow 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
              onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'}
              onMouseOut={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: s.cor,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                {s.icon}
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#111827' }}>{s.titulo}</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{s.desc}</div>
            </div>
          ))}
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

      <div className="ops-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`ops-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main className="ops-content">
        {renderTabContent()}
      </main>
    </div>
  );
}
