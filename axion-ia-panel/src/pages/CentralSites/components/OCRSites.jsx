import React, { useMemo, useState } from 'react';
import { Camera, AlertTriangle, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════
   OCR por Site — Taxas de leitura e qualidade de captura
   ═══════════════════════════════════════════════════════════════════ */

const C = {
  bg: 'var(--cs-surface)',
  surface: 'var(--cs-background)',
  border: 'var(--cs-border)',
  text: 'var(--cs-text-primary)',
  muted: 'var(--cs-text-secondary)',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  accent: '#3b82f6',
};

function OcrBadge({ value }) {
  if (value == null) return <span style={{ color: C.muted, fontSize: 12 }}>—</span>;
  const color = value >= 80 ? C.success : value >= 60 ? C.warning : C.danger;
  const label = value >= 80 ? 'Ótimo' : value >= 60 ? 'Regular' : 'Crítico';
  return (
    <span style={{ background: color + '20', color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
      {value}% · {label}
    </span>
  );
}

export default function OCRSites({ sitesComScore = [] }) {
  const [filtro, setFiltro] = useState('todos');

  const sitesComOCR = useMemo(() => {
    return sitesComScore.filter(s => s.ocr != null && s.status === 'ativo');
  }, [sitesComScore]);

  const semOCR = useMemo(() => {
    return sitesComScore.filter(s => s.ocr == null && s.status === 'ativo');
  }, [sitesComScore]);

  const distribuicao = useMemo(() => ({
    otimo:    sitesComOCR.filter(s => s.ocr >= 80).length,
    regular:  sitesComOCR.filter(s => s.ocr >= 60 && s.ocr < 80).length,
    critico:  sitesComOCR.filter(s => s.ocr < 60).length,
    semDados: semOCR.length,
  }), [sitesComOCR, semOCR]);

  const mediaOcr = useMemo(() => {
    if (!sitesComOCR.length) return 0;
    return Math.round(sitesComOCR.reduce((acc, s) => acc + s.ocr, 0) / sitesComOCR.length);
  }, [sitesComOCR]);

  const sitesFiltrados = useMemo(() => {
    const base = sitesComScore.filter(s => s.status === 'ativo');
    if (filtro === 'otimo') return base.filter(s => (s.ocr || 0) >= 80);
    if (filtro === 'regular') return base.filter(s => (s.ocr || 0) >= 60 && (s.ocr || 0) < 80);
    if (filtro === 'critico') return base.filter(s => (s.ocr || 0) < 60 && s.ocr != null);
    if (filtro === 'sem-dados') return base.filter(s => s.ocr == null);
    return base;
  }, [sitesComScore, filtro]);

  const sorted = useMemo(() => [...sitesFiltrados].sort((a, b) => (b.ocr || -1) - (a.ocr || -1)), [sitesFiltrados]);

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, borderTop: `3px solid ${C.accent}` }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>MÉDIA GERAL</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: mediaOcr >= 80 ? C.success : mediaOcr >= 60 ? C.warning : C.danger }}>{mediaOcr}%</div>
          <div style={{ fontSize: 12, color: C.muted }}>{sitesComOCR.length} sites com dados</div>
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, borderTop: `3px solid ${C.success}` }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>ÓTIMO (≥80%)</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: C.success }}>{distribuicao.otimo}</div>
          <div style={{ fontSize: 12, color: C.muted }}>sites</div>
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, borderTop: `3px solid ${C.warning}` }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>REGULAR (60–79%)</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: C.warning }}>{distribuicao.regular}</div>
          <div style={{ fontSize: 12, color: C.muted }}>sites</div>
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, borderTop: `3px solid ${C.danger}` }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>CRÍTICO (&lt;60%)</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: C.danger }}>{distribuicao.critico}</div>
          <div style={{ fontSize: 12, color: C.muted }}>sites</div>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[
          { key: 'todos', label: 'Todos' },
          { key: 'otimo', label: '✅ Ótimo' },
          { key: 'regular', label: '⚠️ Regular' },
          { key: 'critico', label: '🔴 Crítico' },
          { key: 'sem-dados', label: '❓ Sem dados' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
              border: `1px solid ${filtro === f.key ? C.accent : C.border}`,
              background: filtro === f.key ? '#eff6ff' : C.bg,
              color: filtro === f.key ? C.accent : C.muted,
              fontWeight: filtro === f.key ? 600 : 400,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista de sites com OCR */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Camera size={14} style={{ color: C.accent }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{sorted.length} sites</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.bg }}>
                {['Site', 'Sistema', 'Estado', 'OCR %', 'Status OCR', 'Equipamentos'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: C.muted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((s, i) => {
                const equip = typeof s.equipamentos === 'object' ? s.equipamentos?.total : s.equipamentos;
                return (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.surface : C.bg }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: C.text }}>{s.nome}</td>
                    <td style={{ padding: '10px 14px', color: s.sistema === 'AxHub' ? '#3b82f6' : '#8b5cf6', fontWeight: 600 }}>{s.sistema}</td>
                    <td style={{ padding: '10px 14px', color: C.muted }}>{s.estado || '—'}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, fontSize: 15, color: s.ocr >= 80 ? C.success : s.ocr >= 60 ? C.warning : s.ocr != null ? C.danger : C.muted }}>
                      {s.ocr != null ? `${s.ocr}%` : '—'}
                    </td>
                    <td style={{ padding: '10px 14px' }}><OcrBadge value={s.ocr} /></td>
                    <td style={{ padding: '10px 14px', color: C.text }}>{equip || '—'}</td>
                  </tr>
                );
              })}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: C.muted }}>Nenhum site encontrado</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
