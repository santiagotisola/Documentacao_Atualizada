import React, { useState, useMemo } from 'react';
import { Globe, Wifi, WifiOff, Tag, Monitor, Camera, LayoutGrid, Zap, CheckCircle, ShieldCheck, BookOpen, ScanLine, AlertTriangle, Bell, HeartPulse, ClipboardCheck } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════
   Dashboard Executivo — 16 indicadores globais de todos os sites
   ═══════════════════════════════════════════════════════════════════ */

const C = {
  bg: 'var(--cs-surface)',
  surface: 'var(--cs-background)',
  border: 'var(--cs-border)',
  text: 'var(--cs-text-primary)',
  muted: 'var(--cs-text-secondary)',
  accent: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
};

function KpiCard({ icon: Icon, label, value, sub, color = C.accent, trend }) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      borderTop: `3px solid ${color}`,
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.muted, fontSize: 11, fontWeight: 600 }}>
        <Icon size={14} style={{ color }} />
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: C.text, lineHeight: 1 }}>{value ?? '—'}</div>
      {sub && <div style={{ fontSize: 12, color: C.muted }}>{sub}</div>}
      {trend !== undefined && (
        <div style={{ fontSize: 11, color: trend >= 0 ? C.success : C.danger }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs. mês anterior
        </div>
      )}
    </div>
  );
}

const FILTRO_INICIAL = {
  cliente: '',
  estado: '',
  produto: 'todos',
  versao: '',
  ambiente: 'todos',
  status: 'todos',
};

export default function DashboardExecutivo({ todosSites = [], sitesComScore = [], chamadosData }) {
  const [filtros, setFiltros] = useState(FILTRO_INICIAL);
  const [expand, setExpand] = useState(false);

  /* ── Filtrar sites ────────────────────────────────────────── */
  const sitesFiltrados = useMemo(() => {
    return sitesComScore.filter(s => {
      if (filtros.produto !== 'todos' && s.sistema?.toLowerCase() !== filtros.produto.toLowerCase()) return false;
      if (filtros.status !== 'todos' && s.status !== filtros.status) return false;
      if (filtros.estado && !s.estado?.toLowerCase().includes(filtros.estado.toLowerCase())) return false;
      if (filtros.versao && s.versao && !s.versao.includes(filtros.versao)) return false;
      return true;
    });
  }, [sitesComScore, filtros]);

  /* ── KPIs calculados ─────────────────────────────────────── */
  const kpis = useMemo(() => {
    const ativos = sitesFiltrados.filter(s => s.status === 'ativo');
    const inativos = sitesFiltrados.filter(s => s.status !== 'ativo');

    const versoes = [...new Set(ativos.map(s => s.versao).filter(Boolean))];
    const maxVersao = versoes.sort().reverse()[0] || '—';

    const totalEquip = ativos.reduce((acc, s) => {
      const eq = typeof s.equipamentos === 'object' ? s.equipamentos?.total : s.equipamentos;
      return acc + (eq || 0);
    }, 0);

    const withOcr = ativos.filter(s => s.ocr != null);
    const avgOcr = withOcr.length
      ? Math.round(withOcr.reduce((a, s) => a + s.ocr, 0) / withOcr.length)
      : 0;

    const totalMenus = ativos.reduce((acc, s) => acc + (s.menuCount || 0), 0);

    const healthScores = ativos.map(s => s.healthScore || 0);
    const avgHealth = healthScores.length
      ? Math.round(healthScores.reduce((a, v) => a + v, 0) / healthScores.length)
      : 0;
    const highHealth = healthScores.filter(h => h >= 80).length;

    const chamadosAbertos = (chamadosData?.ranking || []).reduce((acc, r) => acc + (r.abertos || 0), 0);
    const chamadosCriticos = (chamadosData?.ranking || []).reduce((acc, r) => acc + (r.criticos || 0), 0);
    const chamadosTotal = (chamadosData?.ranking || []).reduce((acc, r) => acc + (r.total || 0), 0);

    const disponibilidade = ativos.length > 0
      ? Math.round((ativos.length / sitesFiltrados.length) * 100)
      : 0;

    return {
      totalSites: sitesFiltrados.length,
      online: ativos.length,
      offline: inativos.length,
      versaoLatest: maxVersao,
      totalEquip,
      avgOcr,
      totalMenus,
      avgHealth,
      disponibilidade,
      seguranca: 100 - chamadosCriticos * 10 > 0 ? 100 - chamadosCriticos * 10 : 0,
      cobertura: highHealth,
      scansTotal: chamadosTotal,
      criticos: chamadosCriticos,
      alertas: chamadosAbertos,
      healthOk: highHealth,
      ultimaAuditoria: chamadosData ? 'Hoje' : '—',
    };
  }, [sitesFiltrados, chamadosData]);

  const handleFiltro = (key, val) => setFiltros(f => ({ ...f, [key]: val }));

  const estados = useMemo(() => [...new Set(todosSites.map(s => s.estado).filter(Boolean))].sort(), [todosSites]);

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Filtros ─────────────────────────────────────────── */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expand ? 12 : 0 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Filtros</span>
          <button
            onClick={() => setExpand(e => !e)}
            style={{ fontSize: 12, color: C.accent, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {expand ? 'Ocultar filtros' : 'Mostrar filtros'}
          </button>
        </div>
        {expand && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
            {[
              { key: 'produto', label: 'Produto', options: [['todos', 'Todos'], ['axhub', 'AxHub'], ['axcross', 'AxCross']] },
              { key: 'status', label: 'Status', options: [['todos', 'Todos'], ['ativo', 'Ativo'], ['inativo', 'Inativo']] },
            ].map(({ key, label, options }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 11, color: C.muted, marginBottom: 4 }}>{label}</label>
                <select
                  value={filtros[key]}
                  onChange={e => handleFiltro(key, e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, background: C.bg, color: C.text }}
                >
                  {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: 11, color: C.muted, marginBottom: 4 }}>Estado</label>
              <select
                value={filtros.estado}
                onChange={e => handleFiltro('estado', e.target.value)}
                style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, background: C.bg, color: C.text }}
              >
                <option value="">Todos</option>
                {estados.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: C.muted, marginBottom: 4 }}>Versão</label>
              <input
                value={filtros.versao}
                onChange={e => handleFiltro('versao', e.target.value)}
                placeholder="Ex: v.1.2"
                style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, background: C.bg, color: C.text, boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                onClick={() => setFiltros(FILTRO_INICIAL)}
                style={{ width: '100%', padding: '7px 12px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.muted, fontSize: 12, cursor: 'pointer' }}
              >
                Limpar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Grid de KPIs ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 14 }}>
        <KpiCard icon={Globe}         label="Sites"           value={kpis.totalSites}           sub="Total cadastrado"         color={C.accent} />
        <KpiCard icon={Wifi}          label="Online"          value={kpis.online}               sub="Sites ativos"             color={C.success} />
        <KpiCard icon={WifiOff}       label="Offline"         value={kpis.offline}              sub="Sites inativos"           color={kpis.offline > 0 ? C.danger : C.muted} />
        <KpiCard icon={Tag}           label="Versão"          value={kpis.versaoLatest}         sub="Versão mais recente"      color="#8b5cf6" />
        <KpiCard icon={Monitor}       label="Equipamentos"    value={kpis.totalEquip}           sub="Total nos sites ativos"   color="#0ea5e9" />
        <KpiCard icon={Camera}        label="OCR Médio"       value={`${kpis.avgOcr}%`}         sub="Taxa de leitura"          color={kpis.avgOcr >= 80 ? C.success : kpis.avgOcr >= 60 ? C.warning : C.danger} />
        <KpiCard icon={LayoutGrid}    label="Menus"           value={kpis.totalMenus}           sub="Total de menus habilitados" color="#f97316" />
        <KpiCard icon={Zap}           label="Performance"     value={`${kpis.avgHealth}%`}      sub="Health score médio"       color={kpis.avgHealth >= 80 ? C.success : C.warning} />
        <KpiCard icon={CheckCircle}   label="Disponibilidade" value={`${kpis.disponibilidade}%`} sub="Uptime geral"            color={kpis.disponibilidade >= 90 ? C.success : C.warning} />
        <KpiCard icon={ShieldCheck}   label="Segurança"       value={`${kpis.seguranca}%`}      sub="Score de segurança"       color={kpis.seguranca >= 80 ? C.success : C.danger} />
        <KpiCard icon={BookOpen}      label="Cobertura"       value={kpis.cobertura}            sub="Sites com health ≥ 80%"  color="#06b6d4" />
        <KpiCard icon={ScanLine}      label="Scans"           value={kpis.scansTotal}           sub="Total de chamados"        color="#84cc16" />
        <KpiCard icon={AlertTriangle} label="Críticos"        value={kpis.criticos}             sub="Chamados críticos"        color={kpis.criticos > 0 ? C.danger : C.success} />
        <KpiCard icon={Bell}          label="Alertas"         value={kpis.alertas}              sub="Chamados abertos"         color={kpis.alertas > 5 ? C.warning : C.muted} />
        <KpiCard icon={HeartPulse}    label="Health Check"    value={`${kpis.healthOk}`}        sub="Sites com score alto"     color="#ec4899" />
        <KpiCard icon={ClipboardCheck} label="Última Auditoria" value={kpis.ultimaAuditoria}   sub="Data da última revisão"   color="#64748b" />
      </div>

      {/* ── Tabela resumo por site ───────────────────────────── */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 600, color: C.text }}>
          Resumo por Site ({sitesFiltrados.length} sites)
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: C.bg }}>
                {['Site', 'Sistema', 'Estado', 'Status', 'Versão', 'Equip.', 'OCR %', 'Health', 'Chamados'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: C.muted, fontWeight: 600, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sitesFiltrados.map((s, i) => {
                const equip = typeof s.equipamentos === 'object' ? s.equipamentos?.total : s.equipamentos;
                const health = s.healthScore || 0;
                const healthColor = health >= 80 ? C.success : health >= 60 ? C.warning : C.danger;
                return (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.surface : C.bg }}>
                    <td style={{ padding: '9px 12px', fontWeight: 600, color: C.text }}>{s.nome}</td>
                    <td style={{ padding: '9px 12px', color: s.sistema === 'AxHub' ? '#3b82f6' : '#8b5cf6', fontWeight: 600 }}>{s.sistema}</td>
                    <td style={{ padding: '9px 12px', color: C.muted }}>{s.estado || '—'}</td>
                    <td style={{ padding: '9px 12px' }}>
                      <span style={{
                        background: s.status === 'ativo' ? '#dcfce7' : '#fee2e2',
                        color: s.status === 'ativo' ? '#166534' : '#991b1b',
                        borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600
                      }}>{s.status}</span>
                    </td>
                    <td style={{ padding: '9px 12px', color: C.muted }}>{s.versao || '—'}</td>
                    <td style={{ padding: '9px 12px', color: C.text }}>{equip || '—'}</td>
                    <td style={{ padding: '9px 12px', fontWeight: 600, color: s.ocr >= 80 ? C.success : s.ocr >= 60 ? C.warning : C.danger }}>
                      {s.ocr ? `${s.ocr}%` : '—'}
                    </td>
                    <td style={{ padding: '9px 12px', fontWeight: 700, color: healthColor }}>{health}%</td>
                    <td style={{ padding: '9px 12px', color: (s.chamados?.abertos || 0) > 2 ? C.warning : C.text }}>
                      {s.chamados?.abertos ?? 0} abertos
                      {(s.chamados?.criticos || 0) > 0 && <span style={{ color: C.danger, marginLeft: 6 }}>· {s.chamados.criticos} crítico(s)</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
