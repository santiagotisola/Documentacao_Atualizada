import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";
import { AXHUB_SITES, AXCROSS_SITES } from "../data/sitesData.js";
import {
  Brain, LayoutDashboard, ScanSearch, Headphones,
  ScanLine, Target, ShieldCheck, Globe, Shield, TrendingUp,
  ArrowRight, RefreshCw, BarChart3, Map
} from "lucide-react";

/* ─── Gauge SVG (tema claro) ─── */
function Gauge({ value, max = 100, color, size = 120, label, unit = "%" }) {
  const r = (size - 18) / 2;
  const circ = 2 * Math.PI * r;
  const pct = typeof value === "number" ? Math.min(1, Math.max(0, value / max)) : 0;
  const offset = circ - pct * circ;
  const cx = size / 2, cy = size / 2;
  const display = value === null ? "—" : (unit === "%" ? `${value}%` : String(value));
  return (
    <div style={{ textAlign: "center" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e8edf4" strokeWidth={11} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 1.2s ease" }} />
        <text x="50%" y="46%" textAnchor="middle" dominantBaseline="central"
          fill="#1e293b" fontSize={size * 0.18} fontWeight="800">{display}</text>
        <text x="50%" y="66%" textAnchor="middle" dominantBaseline="central"
          fill="#94a3b8" fontSize={size * 0.085}>{label}</text>
      </svg>
    </div>
  );
}

/* ─── KPI Card (gauge + link) ─── */
function KpiCard({ value, max, color, label, unit, linkTo, linkLabel }) {
  return (
    <Link to={linkTo} className="hp-kpi-card" style={{ "--kpi-color": color }}>
      <Gauge value={value} max={max} color={color} size={120} label={label} unit={unit} />
      <div className="hp-kpi-link">{linkLabel} <ArrowRight size={12} /></div>
    </Link>
  );
}

/* ─── Progress bar ─── */
function ProgressRow({ label, value, max, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: "#64748b" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{value}/{max}</span>
      </div>
      <div style={{ height: 6, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 1.2s ease" }} />
      </div>
    </div>
  );
}

/* ─── Dashboard Module Card ─── */
function ModuleCard({ icon: Icon, title, color, metric, metricLabel, desc, to, href, tag }) {
  const inner = (
    <div className="hp-module-card" style={{ "--mc-color": color }}>
      <div className="hp-mc-header">
        <div className="hp-mc-icon" style={{ background: color + "18" }}>
          <Icon size={18} color={color} strokeWidth={1.8} />
        </div>
        {tag && <span className="hp-mc-tag" style={{ color, background: color + "12" }}>{tag}</span>}
      </div>
      <div className="hp-mc-metric" style={{ color }}>{metric}</div>
      <div className="hp-mc-metric-lbl">{metricLabel}</div>
      <div className="hp-mc-title">{title}</div>
      <div className="hp-mc-desc">{desc}</div>
      <div className="hp-mc-link" style={{ color }}>
        {href ? "Abrir Docs" : "Ver Dashboard"} <ArrowRight size={12} />
      </div>
    </div>
  );
  if (href) return <a href={href} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>{inner}</a>;
  return <Link to={to} style={{ textDecoration: "none" }}>{inner}</Link>;
}

/* ─── Home Page ─── */
export default function HomePage() {
  const [metrics, setMetrics] = useState({ tickets: null, loading: true });

  const allSites = useMemo(() => [...AXHUB_SITES, ...AXCROSS_SITES], []);
  const activeSites = useMemo(() => allSites.filter(s => s.status === "ativo"), [allSites]);

  const topSites = useMemo(() =>
    [...activeSites]
      .filter(s => s.equipamentos)
      .sort((a, b) => {
        const ae = typeof a.equipamentos === "number" ? a.equipamentos : (a.equipamentos?.total || 0);
        const be = typeof b.equipamentos === "number" ? b.equipamentos : (b.equipamentos?.total || 0);
        return be - ae;
      })
      .slice(0, 5),
    [activeSites]
  );

  const fetchMetrics = () => {
    setMetrics(m => ({ ...m, loading: true }));
    api.get("/helpdesk/tickets?mode=0&count=200")
      .then(r => setMetrics({ tickets: r.data.total ?? 0, loading: false }))
      .catch(() => setMetrics({ tickets: null, loading: false }));
  };

  useEffect(() => { fetchMetrics(); }, []);

  const HEALTH = 89;
  const OCR = 70.6;
  const SITES_PCT = Math.round((activeSites.length / allSites.length) * 100);

  return (
    <div className="home-page">

      {/* ══ Header ══ */}
      <section className="hp-header">
        <div className="hp-header-inner">
          <div>
            <div className="hp-badge">Plataforma Unificada de Inteligência</div>
            <h1 className="hp-title">Axion Tecnologia</h1>
            <p className="hp-sub">Gestão inteligente de trânsito, pesagem veicular e monitoramento cruzado</p>
          </div>
          <button className="hp-refresh" onClick={fetchMetrics} title="Atualizar">
            <RefreshCw size={13} style={{ animation: metrics.loading ? "spin 1s linear infinite" : "none" }} />
            Atualizar
          </button>
        </div>
      </section>

      {/* ══ KPI Gauges ══ */}
      <section className="hp-kpis">
        <div className="hp-kpis-grid">
          <KpiCard value={HEALTH} color="#3b82f6" label="Health Score" linkTo="/analise" linkLabel="Intelligence Hub" />
          <KpiCard value={OCR} color="#06b6d4" label="OCR Médio" linkTo="/analise-imagens" linkLabel="Análise de Imagens" />
          <KpiCard value={SITES_PCT} color="#10b981" label="Sites Ativos" linkTo="/operations-hub" linkLabel="Operations Hub" />
          <KpiCard value={metrics.tickets !== null ? Math.min(metrics.tickets, 999) : null}
            max={200} unit="" color="#f59e0b" label="Tickets Abertos" linkTo="/central-atendimento?tab=helpdesk" linkLabel="Helpdesk" />
        </div>

        {/* Mini bottom stats */}
        <div className="hp-stats-row">
          <div className="hp-stats-block">
            <div className="hp-stats-label">Top Sites por Equipamentos</div>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-end", justifyContent: "center" }}>
              {topSites.map((s, i) => {
                const eq = typeof s.equipamentos === "number" ? s.equipamentos : (s.equipamentos?.total || 0);
                const maxEq = typeof topSites[0]?.equipamentos === "number" ? topSites[0].equipamentos : (topSites[0]?.equipamentos?.total || 1);
                const h = Math.max(12, Math.round((eq / maxEq) * 64));
                const colors = ["#3b82f6", "#06b6d4", "#10b981", "#8b5cf6", "#f59e0b"];
                return (
                  <div key={s.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 10, color: colors[i], fontWeight: 700 }}>{eq}</span>
                    <div style={{ width: 16, height: h, borderRadius: "3px 3px 0 0", background: colors[i], opacity: 0.85 }} />
                    <span style={{ fontSize: 9, color: "#94a3b8", maxWidth: 44, textAlign: "center", lineHeight: 1.2 }}>
                      {s.nome.slice(0, 7)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="hp-stats-block" style={{ minWidth: 220 }}>
            <div className="hp-stats-label">Distribuição por Sistema</div>
            <ProgressRow label="AxHub" value={AXHUB_SITES.filter(s => s.status === "ativo").length} max={AXHUB_SITES.length} color="#3b82f6" />
            <ProgressRow label="AxCross" value={AXCROSS_SITES.filter(s => s.status === "ativo").length} max={AXCROSS_SITES.length} color="#f59e0b" />
            <ProgressRow label="Total Ativos" value={activeSites.length} max={allSites.length} color="#10b981" />
          </div>
        </div>
      </section>

      {/* ══ Módulos ══ */}
      <section className="hp-modules">
        <h2 className="hp-section-title">Módulos do Sistema</h2>
        <div className="hp-modules-grid">
          <ModuleCard icon={Brain} title="Intelligence Hub" color="#3b82f6"
            metric={`${HEALTH}%`} metricLabel="health score médio"
            desc="Conformidade, health scores e anomalias por site"
            to="/analise" tag="Live" />
          <ModuleCard icon={LayoutDashboard} title="Operations Hub" color="#6366f1"
            metric={String(activeSites.length)} metricLabel={`de ${allSites.length} sites`}
            desc="KPIs operacionais, performance e mapa de rede"
            to="/operations-hub" tag="Hub" />
          <ModuleCard icon={Headphones} title="Helpdesk" color="#ef4444"
            metric={metrics.tickets !== null ? String(metrics.tickets) : "—"}
            metricLabel="tickets abertos"
            desc="Chamados Jitbit com triagem e resposta via IA"
            to="/central-atendimento?tab=helpdesk" tag="Jitbit" />
          <ModuleCard icon={ScanLine} title="Análise de Imagens" color="#8b5cf6"
            metric={`${OCR}%`} metricLabel="OCR médio AxHub"
            desc="Análise contextual com GPT-4o Vision"
            to="/analise-imagens" tag="GPT-4o" />
          <ModuleCard icon={Target} title="SLA Compliance" color="#10b981"
            metric="SLA" metricLabel="métricas de atendimento"
            desc="Conformidade por prioridade, técnico e categoria"
            to="/sla-compliance" />
          <ModuleCard icon={ShieldCheck} title="Conformidade" color="#f59e0b"
            metric="Editais" metricLabel="validação de requisitos"
            desc="Requisitos técnicos por contrato e edital"
            to="/conformidade" />
          <ModuleCard icon={ScanSearch} title="Análise de Sites" color="#06b6d4"
            metric={String(activeSites.length)} metricLabel="sites monitorados"
            desc="Auditoria, anomalias e plano de correção"
            to="/analise" />
          <ModuleCard icon={BarChart3} title="Relatórios" color="#a78bfa"
            metric="PDF" metricLabel="exportação e relatórios"
            desc="Fluxo, SLA, planilha de horas e mais"
            to="/relatorio-fluxo" />
          <ModuleCard icon={Map} title="AxHub Analisador" color="#667eea"
            metric="5" metricLabel="módulos unificados"
            desc="Diagnóstico de exportação, placas, busca e logs"
            to="/hub-analise" />
        </div>
      </section>

      {/* ══ Produtos ══ */}
      <section className="products-section">
        <h2 className="section-heading dark">Nossos Produtos</h2>
        <div className="products-grid">
          <article className="product-card">
            <Globe size={28} strokeWidth={1.5} />
            <h3>AxHub</h3>
            <p>Gestão de trânsito e infrações com OCR e inteligência artificial</p>
            <a href="http://localhost:3010/AxHub.Docs" target="_blank" rel="noreferrer" className="product-link">
              Ver Documentação <ArrowRight size={14} />
            </a>
          </article>
          <article className="product-card">
            <Shield size={28} strokeWidth={1.5} />
            <h3>AxTon</h3>
            <p>Pesagem veicular automatizada com controle de conformidade</p>
            <a href="http://localhost:3011/AxTon.Docs" target="_blank" rel="noreferrer" className="product-link">
              Ver Documentação <ArrowRight size={14} />
            </a>
          </article>
          <article className="product-card">
            <TrendingUp size={28} strokeWidth={1.5} />
            <h3>AxCross</h3>
            <p>Monitoramento cruzado de veículos com alertas em tempo real</p>
            <a href="http://localhost:3012/AxCross.Docs" target="_blank" rel="noreferrer" className="product-link">
              Ver Documentação <ArrowRight size={14} />
            </a>
          </article>
        </div>
      </section>

    </div>
  );
}
