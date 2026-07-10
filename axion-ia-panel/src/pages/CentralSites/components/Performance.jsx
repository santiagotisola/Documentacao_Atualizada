import React, { useMemo } from 'react';
import { Zap, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { scoreColor } from '../../../utils/siteUtils';

/* ═══════════════════════════════════════════════════════════════════
   Performance — Métricas de desempenho por site
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

function BarraProgresso({ value, max = 100, color }) {
  const pct = Math.min((value / max) * 100, 100);
  const c = color || (pct >= 80 ? C.success : pct >= 60 ? C.warning : C.danger);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 8, background: C.bg, borderRadius: 4, overflow: 'hidden', border: `1px solid ${C.border}` }}>
        <div style={{ height: '100%', width: `${pct}%`, background: c, borderRadius: 4, transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: c, minWidth: 36, textAlign: 'right' }}>{Math.round(pct)}%</span>
    </div>
  );
}

export default function Performance({ sitesComScore = [], chamadosData }) {
  const sitesAtivos = useMemo(() => sitesComScore.filter(s => s.status === 'ativo'), [sitesComScore]);

  const ranking = useMemo(() => {
    return [...sitesAtivos]
      .map(s => ({
        ...s,
        score: s.healthScore || 0,
        ocr: s.ocr || 0,
        equip: typeof s.equipamentos === 'object' ? s.equipamentos?.total || 0 : s.equipamentos || 0,
        chamados: s.chamados?.abertos || 0,
        criticos: s.chamados?.criticos || 0,
        perf: Math.round(
          ((s.healthScore || 0) * 0.4) +
          ((s.ocr || 0) * 0.3) +
          (Math.max(0, 100 - (s.chamados?.abertos || 0) * 10) * 0.2) +
          (Math.max(0, 100 - (s.chamados?.criticos || 0) * 25) * 0.1)
        ),
      }))
      .sort((a, b) => b.perf - a.perf);
  }, [sitesAtivos]);

  const top = ranking[0];
  const bottom = ranking[ranking.length - 1];

  const media = useMemo(() => {
    if (!ranking.length) return 0;
    return Math.round(ranking.reduce((acc, s) => acc + s.perf, 0) / ranking.length);
  }, [ranking]);

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* KPIs de performance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, borderTop: `3px solid ${C.success}` }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 8 }}>MELHOR PERFORMANCE</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{top?.nome || '—'}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.success }}>{top?.perf || 0}%</div>
          <div style={{ fontSize: 11, color: C.muted }}>{top?.sistema} · {top?.estado}</div>
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, borderTop: `3px solid #3b82f6` }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 8 }}>MÉDIA GERAL</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.accent }}>{media}%</div>
          <div style={{ fontSize: 12, color: C.muted }}>{sitesAtivos.length} sites ativos</div>
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, borderTop: `3px solid ${C.danger}` }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 8 }}>REQUER ATENÇÃO</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{bottom?.nome || '—'}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.danger }}>{bottom?.perf || 0}%</div>
          <div style={{ fontSize: 11, color: C.muted }}>{bottom?.sistema} · {bottom?.estado}</div>
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, borderTop: `3px solid ${C.warning}` }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 8 }}>SITES ALTO RISCO</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.warning }}>{ranking.filter(s => s.perf < 60).length}</div>
          <div style={{ fontSize: 12, color: C.muted }}>performance &lt; 60%</div>
        </div>
      </div>

      {/* Ranking completo */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={15} style={{ color: C.accent }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Ranking de Performance ({ranking.length} sites)</span>
        </div>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ranking.map((s, idx) => (
            <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: idx === 0 ? '#fef08a' : idx < 3 ? C.bg : C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: C.muted, border: `1px solid ${C.border}` }}>
                    {idx + 1}
                  </span>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{s.nome}</span>
                    <span style={{ fontSize: 11, color: C.muted, marginLeft: 8 }}>{s.sistema} · {s.estado}</span>
                  </div>
                  {s.criticos > 0 && <AlertTriangle size={12} style={{ color: C.danger }} />}
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 11, color: C.muted }}>
                  <span>OCR: <strong style={{ color: s.ocr >= 80 ? C.success : C.warning }}>{s.ocr}%</strong></span>
                  <span>Health: <strong style={{ color: scoreColor(s.score) }}>{s.score}%</strong></span>
                  <span>Chamados: <strong style={{ color: s.chamados > 2 ? C.warning : C.text }}>{s.chamados}</strong></span>
                </div>
              </div>
              <BarraProgresso value={s.perf} />
            </div>
          ))}
          {ranking.length === 0 && (
            <p style={{ textAlign: 'center', color: C.muted, fontSize: 13 }}>Nenhum site ativo encontrado</p>
          )}
        </div>
      </div>

      {/* Nota metodológica */}
      <div style={{ background: '#f8fafc', border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 16px', fontSize: 12, color: C.muted }}>
        <strong>Metodologia:</strong> Score de Performance = Health Score (40%) + OCR (30%) + Chamados abertos (20%) + Chamados críticos (10%)
      </div>
    </div>
  );
}
