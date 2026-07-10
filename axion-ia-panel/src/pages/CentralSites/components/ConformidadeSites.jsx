import React, { useMemo, useState } from 'react';
import { ShieldCheck, XCircle, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { calcHealthScore } from '../../../utils/siteUtils';

/* ═══════════════════════════════════════════════════════════════════
   Conformidade — Status de conformidade por site + detalhamento
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

const REQUISITOS = [
  { id: 'ativo',       label: 'Site Ativo',              icon: '🟢', check: (s)     => s.status === 'ativo' },
  { id: 'versao',      label: 'Versão Mínima ≥ v.1.2.0', icon: '🏷️', check: (s)     => s.versao && s.versao >= 'v.1.2.0' },
  { id: 'ocr',         label: 'OCR ≥ 80%',               icon: '📷', check: (s)     => s.ocr != null && s.ocr >= 80 },
  { id: 'equip',       label: 'Equipamentos Registrados', icon: '📡', check: (s)     => (typeof s.equipamentos === 'object' ? s.equipamentos?.total : s.equipamentos) > 0 },
  { id: 'semCriticos', label: 'Sem Chamados Críticos',    icon: '🔴', check: (s, sc) => (sc?.chamados?.criticos || 0) === 0 },
  { id: 'chamados',    label: 'Chamados Abertos ≤ 2',    icon: '🎫', check: (s, sc) => (sc?.chamados?.abertos || 0) <= 2 },
  { id: 'health',      label: 'Health Score ≥ 70%',      icon: '💚', check: (s, sc) => (sc?.healthScore || calcHealthScore(s, null)) >= 70 },
  { id: 'afericao',    label: 'Aferição Registrada',     icon: '📋', check: (s)     => !!s.data_afericao },
];

function BadgeVeredicto({ pct }) {
  const { label, bg, color } = pct === 100
    ? { label: 'APTO', bg: '#dcfce7', color: '#166534' }
    : pct >= 70
    ? { label: 'PARCIAL', bg: '#fef9c3', color: '#92400e' }
    : { label: 'INAPTO', bg: '#fee2e2', color: '#991b1b' };
  return <span style={{ background: bg, color, borderRadius: 4, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>{label}</span>;
}

export default function ConformidadeSites({ sitesComScore = [] }) {
  const [expandido, setExpandido] = useState(null);

  const analise = useMemo(() => {
    return sitesComScore.filter(s => s.status === 'ativo').map(site => {
      const reqs = REQUISITOS.map(req => ({
        ...req,
        ok: req.check(site, site),
      }));
      const pct = Math.round((reqs.filter(r => r.ok).length / reqs.length) * 100);
      return { site, reqs, pct };
    }).sort((a, b) => b.pct - a.pct);
  }, [sitesComScore]);

  const resumo = useMemo(() => ({
    aptos: analise.filter(a => a.pct === 100).length,
    parciais: analise.filter(a => a.pct >= 70 && a.pct < 100).length,
    inaptos: analise.filter(a => a.pct < 70).length,
    media: analise.length ? Math.round(analise.reduce((acc, a) => acc + a.pct, 0) / analise.length) : 0,
  }), [analise]);

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
        {[
          { label: 'APTOS', value: resumo.aptos, color: C.success },
          { label: 'PARCIALMENTE APTOS', value: resumo.parciais, color: C.warning },
          { label: 'INAPTOS', value: resumo.inaptos, color: resumo.inaptos > 0 ? C.danger : C.muted },
          { label: 'CONFORMIDADE MÉDIA', value: `${resumo.media}%`, color: resumo.media >= 80 ? C.success : resumo.media >= 60 ? C.warning : C.danger },
        ].map(k => (
          <div key={k.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, borderTop: `3px solid ${k.color}` }}>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{k.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Lista de sites expandível */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck size={14} style={{ color: C.accent }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Conformidade por Site ({analise.length})</span>
        </div>
        <div>
          {analise.map(({ site, reqs, pct }) => {
            const isExpanded = expandido === site.id;
            const nok = reqs.filter(r => !r.ok);
            return (
              <div key={site.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                <button
                  onClick={() => setExpandido(isExpanded ? null : site.id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{site.nome}</span>
                    <span style={{ fontSize: 11, color: C.muted }}>{site.sistema} · {site.estado}</span>
                    <BadgeVeredicto pct={pct} />
                    {nok.length > 0 && (
                      <span style={{ fontSize: 11, color: C.danger }}>
                        <AlertTriangle size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                        {nok.length} pendência{nok.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  {/* Barra de progresso */}
                  <div style={{ width: 100, height: 6, background: C.bg, borderRadius: 3, overflow: 'hidden', border: `1px solid ${C.border}` }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? C.success : pct >= 70 ? C.warning : C.danger, borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: pct === 100 ? C.success : pct >= 70 ? C.warning : C.danger, minWidth: 36 }}>{pct}%</span>
                  {isExpanded ? <ChevronUp size={14} style={{ color: C.muted }} /> : <ChevronDown size={14} style={{ color: C.muted }} />}
                </button>
                {isExpanded && (
                  <div style={{ background: C.bg, borderTop: `1px solid ${C.border}`, padding: '12px 20px 16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 }}>
                      {reqs.map(req => (
                        <div key={req.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: C.text }}>
                          {req.ok
                            ? <CheckCircle2 size={13} style={{ color: C.success, flexShrink: 0 }} />
                            : <XCircle size={13} style={{ color: C.danger, flexShrink: 0 }} />}
                          <span style={{ marginRight: 4 }}>{req.icon}</span>
                          <span style={{ color: req.ok ? C.text : C.danger }}>{req.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {analise.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: C.muted }}>Nenhum site ativo encontrado</div>
          )}
        </div>
      </div>

    </div>
  );
}
