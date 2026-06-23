import React, { useState, useEffect, useMemo } from 'react';
import { AXHUB_SITES, AXCROSS_SITES, MODULOS, TIPOS_CONTRATO } from '../data/sitesData';
import { api } from '../services/api';
import { KPICard, LoadingSpinner } from '../components/ui';
import { Building2, TrendingUp, Ticket, AlertCircle, Camera, Target } from 'lucide-react';
import './IntelligenceHub.css';

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

/* ═══════════════════════════════════════════════════════════════════
   TABS do Intelligence Hub
   ═══════════════════════════════════════════════════════════════════ */
const TABS = [
  { id: 'overview', label: '📊 Visão Geral', desc: 'KPIs consolidados' },
  { id: 'sites', label: '🏢 Sites', desc: 'Performance por site' },
  { id: 'chamados', label: '🎫 Chamados', desc: 'Análise de demandas' },
  { id: 'performance', label: '⚡ Performance', desc: 'Métricas e tendências' },
  { id: 'relatorios', label: '📋 Relatórios', desc: 'Geração consolidada' },
];

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════ */
function scoreColor(score) {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#f59e0b';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

function calcHealthScore(site, chamadosData) {
  let score = 100;
  // OCR contribui 30%
  if (site.ocr) {
    score -= Math.max(0, (95 - site.ocr)) * 0.5;
  } else {
    score -= 10;
  }
  // Versão desatualizada: -10
  if (site.versao && site.versao < 'v.1.2.0') score -= 10;
  // Chamados abertos: cada um reduz 2pts
  const siteChamados = chamadosData?.ranking?.find(r => r.siteId === site.id);
  if (siteChamados) {
    score -= Math.min(30, siteChamados.abertos * 2);
    // Críticos pesam mais
    score -= Math.min(20, (siteChamados.criticos || 0) * 5);
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

function MiniBar({ value, max, color }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="ih-mini-bar">
      <div className="ih-mini-bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

// KPICard agora vem de ../components/ui
// Mantém compatibilidade com props antigas via wrapper
function KPICardCompat({ icon, label, value, sublabel, color }) {
  // Converte emoji para lucide icon se necessário
  const iconMap = {
    '🏢': <Building2 />,
    '💯': <TrendingUp />,
    '🎫': <Ticket />,
    '🔴': <AlertCircle />,
    '📷': <Camera />,
    '🎯': <Target />
  };
  const iconElement = iconMap[icon] || icon;
  
  return (
    <div style={{ borderTop: `3px solid ${color}`, borderRadius: '8px' }}>
      <KPICard 
        icon={iconElement}
        label={label}
        value={value}
        sublabel={sublabel}
        size="medium"
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═══════════════════════════════════════════════════════════════════ */
export default function IntelligenceHub() {
  const [tab, setTab] = useState('overview');
  const [chamadosData, setChamadosData] = useState(null);
  const [slaData, setSlaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtroSistema, setFiltroSistema] = useState('Todos');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [selectedSite, setSelectedSite] = useState(null);

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

  // Cálculos consolidados
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

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="ih-container">
      <header className="ih-header">
        <div className="ih-header-text">
          <h1>🧠 Intelligence Hub</h1>
          <p>Gerenciador unificado de dados, relatórios e performance</p>
        </div>
        <div className="ih-header-score">
          <div className="ih-score-circle" style={{ borderColor: scoreColor(kpis.avgScore) }}>
            <span className="ih-score-num">{kpis.avgScore}</span>
            <span className="ih-score-label">Health</span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="ih-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`ih-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Conteúdo */}
      <div className="ih-content">
        {loading && <LoadingSpinner message="Carregando dados de inteligência..." />}

        {!loading && tab === 'overview' && <OverviewTab kpis={kpis} sitesComScore={sitesComScore} chamadosData={chamadosData} />}
        {!loading && tab === 'sites' && (
          <SitesTab
            sites={sitesFiltrados}
            filtroSistema={filtroSistema}
            setFiltroSistema={setFiltroSistema}
            filtroEstado={filtroEstado}
            setFiltroEstado={setFiltroEstado}
            estados={estados}
            selectedSite={selectedSite}
            setSelectedSite={setSelectedSite}
          />
        )}
        {!loading && tab === 'chamados' && <ChamadosTab chamadosData={chamadosData} sitesComScore={sitesComScore} />}
        {!loading && tab === 'performance' && <PerformanceTab sitesComScore={sitesComScore} slaData={slaData} kpis={kpis} />}
        {!loading && tab === 'relatorios' && <RelatoriosTab sitesComScore={sitesComScore} chamadosData={chamadosData} kpis={kpis} />}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB: Visão Geral
   ═══════════════════════════════════════════════════════════════════ */
function OverviewTab({ kpis, sitesComScore, chamadosData }) {
  const alertas = sitesComScore.filter(s => s.healthScore < 60);
  const topPerformers = sitesComScore.filter(s => s.healthScore >= 80).slice(0, 5);

  return (
    <div className="ih-overview">
      {/* KPIs Grid */}
      <div className="ih-kpi-grid">
        <KPICardCompat icon="🏢" label="Sites Totais" value={kpis.totalSites} sublabel={`${kpis.sitesAtivos} ativos`} color="#3b82f6" />
        <KPICardCompat icon="💯" label="Health Score Médio" value={`${kpis.avgScore}%`} color={scoreColor(kpis.avgScore)} />
        <KPICardCompat icon="🎫" label="Chamados Totais" value={kpis.totalChamados} sublabel={`${kpis.chamadosAbertos} abertos`} color="#8b5cf6" />
        <KPICardCompat icon="🔴" label="Críticos" value={kpis.criticos} color="#ef4444" />
        <KPICardCompat icon="📷" label="OCR Médio" value={`${kpis.avgOCR}%`} color="#06b6d4" />
        <KPICardCompat icon="🎯" label="SLA Compliance" value={kpis.slaCompliance ? `${kpis.slaCompliance}%` : '—'} color="#22c55e" />
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="ih-section ih-alertas">
          <h3>⚠️ Sites que Precisam de Atenção ({alertas.length})</h3>
          <div className="ih-alertas-grid">
            {alertas.slice(0, 8).map(s => (
              <div key={s.id} className="ih-alerta-card">
                <div className="ih-alerta-header">
                  <strong>{s.nome}</strong>
                  <span className="ih-badge" style={{ background: scoreColor(s.healthScore) }}>{s.healthScore}%</span>
                </div>
                <div className="ih-alerta-info">
                  <span>{s.sistema} • {s.estado}</span>
                  {s.chamados.abertos > 0 && <span className="ih-alerta-chamados">🎫 {s.chamados.abertos} abertos</span>}
                  {s.chamados.criticos > 0 && <span className="ih-alerta-critico">🔴 {s.chamados.criticos} críticos</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <div className="ih-section">
          <h3>🏆 Top Performers</h3>
          <div className="ih-top-grid">
            {topPerformers.map((s, i) => (
              <div key={s.id} className="ih-top-item">
                <span className="ih-top-rank">#{i + 1}</span>
                <span className="ih-top-nome">{s.nome}</span>
                <span className="ih-top-sistema">{s.sistema}</span>
                <span className="ih-badge" style={{ background: scoreColor(s.healthScore) }}>{s.healthScore}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Distribuição por sistema */}
      <div className="ih-section">
        <h3>📊 Distribuição por Sistema</h3>
        <div className="ih-distrib-grid">
          {['AxHub', 'AxCross', 'AxTon'].map(sys => {
            const sites = sitesComScore.filter(s => s.sistema === sys);
            const avg = sites.length > 0 ? Math.round(sites.reduce((a, s) => a + s.healthScore, 0) / sites.length) : 0;
            const abertos = sites.reduce((a, s) => a + s.chamados.abertos, 0);
            return (
              <div key={sys} className="ih-distrib-card">
                <h4>{sys}</h4>
                <div className="ih-distrib-stats">
                  <span>{sites.length} sites</span>
                  <span style={{ color: scoreColor(avg) }}>{avg}% health</span>
                  <span>🎫 {abertos} abertos</span>
                </div>
                <MiniBar value={avg} max={100} color={scoreColor(avg)} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB: Sites
   ═══════════════════════════════════════════════════════════════════ */
function SitesTab({ sites, filtroSistema, setFiltroSistema, filtroEstado, setFiltroEstado, estados, selectedSite, setSelectedSite }) {
  return (
    <div className="ih-sites">
      {/* Filtros */}
      <div className="ih-filtros">
        <div className="ih-filtro-group">
          <label>Sistema</label>
          <select value={filtroSistema} onChange={e => setFiltroSistema(e.target.value)}>
            <option>Todos</option>
            <option>AxHub</option>
            <option>AxCross</option>
            <option>AxTon</option>
          </select>
        </div>
        <div className="ih-filtro-group">
          <label>Estado</label>
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option>Todos</option>
            {estados.map(e => <option key={e}>{e}</option>)}
          </select>
        </div>
        <span className="ih-filtro-count">{sites.length} sites</span>
      </div>

      {/* Tabela de Sites */}
      <div className="ih-table-wrap">
        <table className="ih-table">
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
            </tr>
          </thead>
          <tbody>
            {sites.map(s => (
              <tr key={s.id} className={selectedSite === s.id ? 'selected' : ''} onClick={() => setSelectedSite(s.id === selectedSite ? null : s.id)}>
                <td><strong>{s.nome}</strong></td>
                <td><span className={`ih-sys-badge ih-sys-${s.sistema.toLowerCase()}`}>{s.sistema}</span></td>
                <td>{s.estado}</td>
                <td>{s.versao || '—'}</td>
                <td>{s.ocr ? `${s.ocr}%` : '—'}</td>
                <td>
                  {s.chamados.abertos > 0 && <span className="ih-badge-aberto">{s.chamados.abertos}</span>}
                  {s.chamados.criticos > 0 && <span className="ih-badge-critico">{s.chamados.criticos}</span>}
                  {s.chamados.abertos === 0 && '✅'}
                </td>
                <td>
                  <div className="ih-score-cell">
                    <MiniBar value={s.healthScore} max={100} color={scoreColor(s.healthScore)} />
                    <span style={{ color: scoreColor(s.healthScore) }}>{s.healthScore}%</span>
                  </div>
                </td>
                <td>{s.status === 'ativo' ? '🟢' : s.status === 'inacessivel' ? '🔴' : '⚪'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detalhe do site selecionado */}
      {selectedSite && <SiteDetailPanel site={sites.find(s => s.id === selectedSite)} />}
    </div>
  );
}

function SiteDetailPanel({ site }) {
  if (!site) return null;
  return (
    <div className="ih-site-detail">
      <h3>{site.nome} <span className="ih-sys-badge">{site.sistema}</span></h3>
      <div className="ih-detail-grid">
        <div className="ih-detail-item">
          <label>Estado</label><span>{site.estado}</span>
        </div>
        <div className="ih-detail-item">
          <label>Versão</label><span>{site.versao || '—'}</span>
        </div>
        <div className="ih-detail-item">
          <label>OCR</label><span>{site.ocr ? `${site.ocr}%` : '—'}</span>
        </div>
        <div className="ih-detail-item">
          <label>Equipamentos</label><span>{site.equipamentos?.total || '—'}</span>
        </div>
        <div className="ih-detail-item">
          <label>Health Score</label>
          <span style={{ color: scoreColor(site.healthScore), fontWeight: 700 }}>{site.healthScore}%</span>
        </div>
        <div className="ih-detail-item">
          <label>Chamados Abertos</label><span>{site.chamados.abertos}</span>
        </div>
        <div className="ih-detail-item">
          <label>Chamados Críticos</label><span>{site.chamados.criticos || 0}</span>
        </div>
        <div className="ih-detail-item">
          <label>BI Reports</label><span>{site.bi?.length || '—'}</span>
        </div>
      </div>
      {site.observacoes && <p className="ih-detail-obs">📝 {site.observacoes}</p>}
      {site.url && (
        <a href={site.url} target="_blank" rel="noopener noreferrer" className="ih-detail-link">
          🔗 Abrir Sistema
        </a>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB: Chamados
   ═══════════════════════════════════════════════════════════════════ */
function ChamadosTab({ chamadosData, sitesComScore }) {
  const [ordenar, setOrdenar] = useState('abertos');

  const ranking = useMemo(() => {
    if (!chamadosData?.ranking) return [];
    return [...chamadosData.ranking].sort((a, b) => {
      if (ordenar === 'abertos') return b.abertos - a.abertos;
      if (ordenar === 'criticos') return (b.criticos || 0) - (a.criticos || 0);
      return b.total - a.total;
    });
  }, [chamadosData, ordenar]);

  const categorias = useMemo(() => {
    if (!chamadosData?.categorias) return [];
    return chamadosData.categorias.slice(0, 15);
  }, [chamadosData]);

  return (
    <div className="ih-chamados">
      <div className="ih-section">
        <div className="ih-section-header">
          <h3>📊 Ranking de Demandas por Site</h3>
          <select value={ordenar} onChange={e => setOrdenar(e.target.value)} className="ih-select-sm">
            <option value="abertos">Mais Abertos</option>
            <option value="criticos">Mais Críticos</option>
            <option value="total">Maior Volume</option>
          </select>
        </div>
        {ranking.length > 0 ? (
          <div className="ih-table-wrap">
            <table className="ih-table">
              <thead>
                <tr><th>Site</th><th>Sistema</th><th>Abertos</th><th>Críticos</th><th>Total</th><th>Carga</th></tr>
              </thead>
              <tbody>
                {ranking.slice(0, 20).map(r => {
                  const site = sitesComScore.find(s => s.id === r.siteId) || { nome: r.siteId, sistema: '—' };
                  const pct = r.total > 0 ? Math.round((r.abertos / r.total) * 100) : 0;
                  return (
                    <tr key={r.siteId}>
                      <td><strong>{site.nome}</strong></td>
                      <td>{site.sistema}</td>
                      <td><span className="ih-badge-aberto">{r.abertos}</span></td>
                      <td>{r.criticos > 0 ? <span className="ih-badge-critico">{r.criticos}</span> : '—'}</td>
                      <td>{r.total}</td>
                      <td><MiniBar value={pct} max={100} color={pct > 50 ? '#ef4444' : pct > 25 ? '#f59e0b' : '#22c55e'} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="ih-vazio">Nenhum dado de chamados disponível</p>
        )}
      </div>

      {/* Categorias mais comuns */}
      {categorias.length > 0 && (
        <div className="ih-section">
          <h3>🏷️ Categorias Mais Demandadas</h3>
          <div className="ih-cat-grid">
            {categorias.map((c, i) => (
              <div key={i} className="ih-cat-item">
                <span className="ih-cat-nome">{c.nome || c.categoria}</span>
                <span className="ih-cat-count">{c.count || c.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights automáticos */}
      <div className="ih-section">
        <h3>💡 Insights Automáticos</h3>
        <div className="ih-insights">
          {ranking.length > 0 && ranking[0].abertos > 5 && (
            <div className="ih-insight warning">
              <strong>⚠️ Alta Concentração:</strong> {sitesComScore.find(s => s.id === ranking[0].siteId)?.nome || ranking[0].siteId} tem {ranking[0].abertos} chamados abertos — considere priorizar atendimento.
            </div>
          )}
          {sitesComScore.filter(s => s.chamados.criticos > 0).length > 3 && (
            <div className="ih-insight danger">
              <strong>🔴 Múltiplos Críticos:</strong> {sitesComScore.filter(s => s.chamados.criticos > 0).length} sites possuem chamados críticos ativos.
            </div>
          )}
          {sitesComScore.filter(s => s.healthScore < 50).length > 0 && (
            <div className="ih-insight warning">
              <strong>📉 Saúde Baixa:</strong> {sitesComScore.filter(s => s.healthScore < 50).length} sites com score abaixo de 50% — revisão operacional recomendada.
            </div>
          )}
          {kpisInsight(sitesComScore)}
        </div>
      </div>
    </div>
  );
}

function kpisInsight(sitesComScore) {
  const semChamados = sitesComScore.filter(s => s.chamados.abertos === 0 && s.healthScore >= 80);
  if (semChamados.length >= 5) {
    return (
      <div className="ih-insight success">
        <strong>✅ Bom Estado:</strong> {semChamados.length} sites estão sem chamados abertos e com health score acima de 80%.
      </div>
    );
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════════════
   TAB: Performance
   ═══════════════════════════════════════════════════════════════════ */
function PerformanceTab({ sitesComScore, slaData, kpis }) {
  const scoreDistrib = useMemo(() => {
    const ranges = [
      { label: '90-100% (Excelente)', min: 90, max: 100, color: '#22c55e' },
      { label: '70-89% (Bom)', min: 70, max: 89, color: '#84cc16' },
      { label: '50-69% (Regular)', min: 50, max: 69, color: '#f59e0b' },
      { label: '30-49% (Ruim)', min: 30, max: 49, color: '#f97316' },
      { label: '0-29% (Crítico)', min: 0, max: 29, color: '#ef4444' },
    ];
    return ranges.map(r => ({
      ...r,
      count: sitesComScore.filter(s => s.healthScore >= r.min && s.healthScore <= r.max).length,
    }));
  }, [sitesComScore]);

  const ocrRanking = useMemo(() => {
    return sitesComScore
      .filter(s => s.ocr && s.ocr > 0)
      .sort((a, b) => b.ocr - a.ocr);
  }, [sitesComScore]);

  return (
    <div className="ih-performance">
      {/* Distribuição de Health Score */}
      <div className="ih-section">
        <h3>📊 Distribuição de Health Score</h3>
        <div className="ih-distrib-bars">
          {scoreDistrib.map(r => (
            <div key={r.label} className="ih-distrib-row">
              <span className="ih-distrib-label">{r.label}</span>
              <div className="ih-distrib-bar-bg">
                <div
                  className="ih-distrib-bar-fill"
                  style={{ width: `${(r.count / sitesComScore.length) * 100}%`, background: r.color }}
                />
              </div>
              <span className="ih-distrib-count">{r.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* OCR Ranking */}
      {ocrRanking.length > 0 && (
        <div className="ih-section">
          <h3>📷 Ranking OCR por Site</h3>
          <div className="ih-ocr-grid">
            {ocrRanking.map((s, i) => (
              <div key={s.id} className="ih-ocr-item">
                <span className="ih-ocr-rank">#{i + 1}</span>
                <span className="ih-ocr-nome">{s.nome}</span>
                <MiniBar value={s.ocr} max={100} color={s.ocr >= 90 ? '#22c55e' : s.ocr >= 70 ? '#f59e0b' : '#ef4444'} />
                <span className="ih-ocr-val">{s.ocr}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Métricas de gestão */}
      <div className="ih-section">
        <h3>⚡ Métricas de Gestão</h3>
        <div className="ih-metricas-grid">
          <div className="ih-metrica-card">
            <span className="ih-metrica-titulo">Tempo Médio de Resolução</span>
            <span className="ih-metrica-valor">{slaData?.avgResolutionTime || '—'}</span>
          </div>
          <div className="ih-metrica-card">
            <span className="ih-metrica-titulo">Taxa de Primeira Resposta</span>
            <span className="ih-metrica-valor">{slaData?.firstResponseRate ? `${slaData.firstResponseRate}%` : '—'}</span>
          </div>
          <div className="ih-metrica-card">
            <span className="ih-metrica-titulo">Sites com Versão Atual</span>
            <span className="ih-metrica-valor">
              {sitesComScore.filter(s => s.versao && s.versao >= 'v.1.2.0').length} / {sitesComScore.filter(s => s.versao).length}
            </span>
          </div>
          <div className="ih-metrica-card">
            <span className="ih-metrica-titulo">Equipamentos Monitorados</span>
            <span className="ih-metrica-valor">
              {AXHUB_SITES.reduce((a, s) => a + (s.equipamentos?.total || 0), 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB: Relatórios
   ═══════════════════════════════════════════════════════════════════ */
function RelatoriosTab({ sitesComScore, chamadosData, kpis }) {
  const [gerado, setGerado] = useState(null);

  function gerarRelatorio(tipo) {
    const now = new Date().toLocaleString('pt-BR');
    let conteudo = '';

    if (tipo === 'executivo') {
      conteudo = gerarExecutivo(kpis, sitesComScore, now);
    } else if (tipo === 'operacional') {
      conteudo = gerarOperacional(sitesComScore, chamadosData, now);
    } else if (tipo === 'performance') {
      conteudo = gerarPerformanceReport(sitesComScore, kpis, now);
    }
    setGerado({ tipo, conteudo, data: now });
  }

  return (
    <div className="ih-relatorios">
      <div className="ih-section">
        <h3>📋 Geração de Relatórios</h3>
        <p className="ih-section-desc">Gere relatórios consolidados combinando dados de sites, chamados e performance</p>
        <div className="ih-rel-buttons">
          <button className="ih-rel-btn" onClick={() => gerarRelatorio('executivo')}>
            <span>📊</span>
            <strong>Relatório Executivo</strong>
            <small>Visão geral para gestão</small>
          </button>
          <button className="ih-rel-btn" onClick={() => gerarRelatorio('operacional')}>
            <span>🔧</span>
            <strong>Relatório Operacional</strong>
            <small>Detalhamento por site</small>
          </button>
          <button className="ih-rel-btn" onClick={() => gerarRelatorio('performance')}>
            <span>⚡</span>
            <strong>Relatório de Performance</strong>
            <small>Métricas e tendências</small>
          </button>
        </div>
      </div>

      {gerado && (
        <div className="ih-section ih-relatorio-output">
          <div className="ih-rel-header">
            <h3>📄 {gerado.tipo === 'executivo' ? 'Relatório Executivo' : gerado.tipo === 'operacional' ? 'Relatório Operacional' : 'Relatório de Performance'}</h3>
            <button className="ih-btn-copy" onClick={() => { navigator.clipboard.writeText(gerado.conteudo); }}>
              📋 Copiar
            </button>
          </div>
          <pre className="ih-rel-content">{gerado.conteudo}</pre>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Geradores de relatório
   ═══════════════════════════════════════════════════════════════════ */
function gerarExecutivo(kpis, sitesComScore, data) {
  const alertas = sitesComScore.filter(s => s.healthScore < 60);
  return `═══════════════════════════════════════════════════════════
  RELATÓRIO EXECUTIVO — INTELLIGENCE HUB
  Gerado em: ${data}
═══════════════════════════════════════════════════════════

📊 RESUMO GERAL
─────────────────────────────────────────────────────────
• Sites Monitorados: ${kpis.totalSites} (${kpis.sitesAtivos} ativos)
• Health Score Médio: ${kpis.avgScore}%
• Chamados Totais: ${kpis.totalChamados} (${kpis.chamadosAbertos} abertos)
• Chamados Críticos: ${kpis.criticos}
• OCR Médio: ${kpis.avgOCR}%
• SLA Compliance: ${kpis.slaCompliance || 'N/A'}%

⚠️ SITES COM ATENÇÃO NECESSÁRIA (${alertas.length})
─────────────────────────────────────────────────────────
${alertas.map(s => `• ${s.nome} (${s.sistema}/${s.estado}) — Score: ${s.healthScore}% | Chamados: ${s.chamados.abertos} abertos`).join('\n')}

🏆 TOP 5 PERFORMERS
─────────────────────────────────────────────────────────
${sitesComScore.slice(0, 5).map((s, i) => `${i + 1}. ${s.nome} — ${s.healthScore}% (${s.sistema})`).join('\n')}

📈 DISTRIBUIÇÃO POR SISTEMA
─────────────────────────────────────────────────────────
${['AxHub', 'AxCross', 'AxTon'].map(sys => {
  const sites = sitesComScore.filter(s => s.sistema === sys);
  const avg = sites.length > 0 ? Math.round(sites.reduce((a, s) => a + s.healthScore, 0) / sites.length) : 0;
  return `• ${sys}: ${sites.length} sites — Health médio: ${avg}%`;
}).join('\n')}
`;
}

function gerarOperacional(sitesComScore, chamadosData, data) {
  return `═══════════════════════════════════════════════════════════
  RELATÓRIO OPERACIONAL — POR SITE
  Gerado em: ${data}
═══════════════════════════════════════════════════════════

${sitesComScore.map(s => `
┌─ ${s.nome} (${s.sistema} | ${s.estado})
│  Health Score: ${s.healthScore}% | Versão: ${s.versao || '—'} | OCR: ${s.ocr || '—'}%
│  Chamados: ${s.chamados.abertos} abertos | ${s.chamados.criticos || 0} críticos | ${s.chamados.total || 0} total
│  Equipamentos: ${s.equipamentos?.total || '—'} | BI Reports: ${s.bi?.length || '—'}
│  Status: ${s.status || 'ativo'}
└─────────────────────────────────────────────────────────`).join('\n')}
`;
}

function gerarPerformanceReport(sitesComScore, kpis, data) {
  const porFaixa = [
    { faixa: 'Excelente (90-100%)', sites: sitesComScore.filter(s => s.healthScore >= 90) },
    { faixa: 'Bom (70-89%)', sites: sitesComScore.filter(s => s.healthScore >= 70 && s.healthScore < 90) },
    { faixa: 'Regular (50-69%)', sites: sitesComScore.filter(s => s.healthScore >= 50 && s.healthScore < 70) },
    { faixa: 'Crítico (<50%)', sites: sitesComScore.filter(s => s.healthScore < 50) },
  ];

  return `═══════════════════════════════════════════════════════════
  RELATÓRIO DE PERFORMANCE
  Gerado em: ${data}
═══════════════════════════════════════════════════════════

📊 HEALTH SCORE MÉDIO GLOBAL: ${kpis.avgScore}%

📈 DISTRIBUIÇÃO POR FAIXA
─────────────────────────────────────────────────────────
${porFaixa.map(f => `• ${f.faixa}: ${f.sites.length} sites ${f.sites.length > 0 ? '(' + f.sites.map(s => s.nome).join(', ') + ')' : ''}`).join('\n')}

📷 TOP OCR
─────────────────────────────────────────────────────────
${sitesComScore.filter(s => s.ocr).sort((a, b) => b.ocr - a.ocr).map((s, i) => `${i + 1}. ${s.nome}: ${s.ocr}%`).join('\n')}

🎫 CARGA DE CHAMADOS
─────────────────────────────────────────────────────────
• Total de chamados abertos: ${kpis.chamadosAbertos}
• Sites com chamados críticos: ${sitesComScore.filter(s => s.chamados.criticos > 0).length}
• Sites sem demanda: ${sitesComScore.filter(s => s.chamados.abertos === 0).length}

💡 RECOMENDAÇÕES
─────────────────────────────────────────────────────────
${sitesComScore.filter(s => s.healthScore < 50).length > 0 ? '• URGENTE: Revisar operação dos sites com score abaixo de 50%' : '• Nenhum site em estado crítico'}
${sitesComScore.filter(s => s.versao && s.versao < 'v.1.2.0').length > 0 ? `• Atualizar ${sitesComScore.filter(s => s.versao && s.versao < 'v.1.2.0').length} sites para versão mais recente` : ''}
${kpis.chamadosAbertos > 10 ? '• Alto volume de chamados abertos — considere mutirão de atendimento' : ''}
`;
}
