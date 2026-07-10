import React, { useMemo } from 'react';
import { HeartPulse, CheckCircle2, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { calcHealthScore, scoreColor } from '../../../utils/siteUtils';

/* ═══════════════════════════════════════════════════════════════════
   Health Check — Status de saúde por site
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

const CHECKS = [
  { id: 'online',      label: 'Online',                   peso: 25, check: (s) => s.status === 'ativo' },
  { id: 'versao',      label: 'Versão atualizada',         peso: 15, check: (s) => s.versao && s.versao >= 'v.1.2.0' },
  { id: 'ocr',         label: 'OCR funcionando',           peso: 20, check: (s) => s.ocr != null && s.ocr >= 70 },
  { id: 'equip',       label: 'Equipamentos ativos',       peso: 15, check: (s) => (typeof s.equipamentos === 'object' ? s.equipamentos?.total : s.equipamentos) > 0 },
  { id: 'url',         label: 'URL configurada',           peso: 10, check: (s) => !!s.url },
  { id: 'chamados',    label: 'Chamados sob controle',     peso: 15, check: (s, sc) => (sc?.chamados?.abertos || 0) <= 3 && (sc?.chamados?.criticos || 0) === 0 },
];

function HealthBadge({ score }) {
  if (score >= 85) return <span style={{ background: '#dcfce7', color: '#166534', borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700 }}>🟢 Saudável</span>;
  if (score >= 60) return <span style={{ background: '#fef9c3', color: '#92400e', borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700 }}>🟡 Atenção</span>;
  return <span style={{ background: '#fee2e2', color: '#991b1b', borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700 }}>🔴 Crítico</span>;
}

export default function HealthCheck({ sitesComScore = [], chamadosData, onRefresh }) {
  const analise = useMemo(() => {
    return sitesComScore.map(site => {
      const checks = CHECKS.map(c => ({
        ...c,
        ok: c.check(site, site),
      }));
      const pontosMaximos = CHECKS.reduce((acc, c) => acc + c.peso, 0);
      const pontos = checks.filter(c => c.ok).reduce((acc, c) => acc + c.peso, 0);
      const health = Math.round((pontos / pontosMaximos) * 100);
      return { site, checks, health, pontos, pontosMaximos };
    }).sort((a, b) => b.health - a.health);
  }, [sitesComScore]);

  const resumo = useMemo(() => ({
    saudavel: analise.filter(a => a.health >= 85).length,
    atencao: analise.filter(a => a.health >= 60 && a.health < 85).length,
    critico: analise.filter(a => a.health < 60).length,
    media: analise.length ? Math.round(analise.reduce((acc, a) => acc + a.health, 0) / analise.length) : 0,
  }), [analise]);

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
        {[
          { label: 'SAUDÁVEIS', value: resumo.saudavel, color: C.success },
          { label: 'ATENÇÃO', value: resumo.atencao, color: C.warning },
          { label: 'CRÍTICOS', value: resumo.critico, color: resumo.critico > 0 ? C.danger : C.muted },
          { label: 'HEALTH MÉDIO', value: `${resumo.media}%`, color: scoreColor(resumo.media) },
        ].map(k => (
          <div key={k.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, borderTop: `3px solid ${k.color}` }}>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{k.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Checklist por site */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HeartPulse size={14} style={{ color: C.accent }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Health Check — {analise.length} sites</span>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.text, cursor: 'pointer', fontSize: 12 }}
            >
              <RefreshCw size={12} /> Atualizar
            </button>
          )}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: C.bg }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', color: C.muted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>Site</th>
                {CHECKS.map(c => (
                  <th key={c.id} style={{ padding: '10px 8px', textAlign: 'center', color: C.muted, fontWeight: 600, borderBottom: `1px solid ${C.border}`, fontSize: 10, whiteSpace: 'nowrap', maxWidth: 80 }}>
                    {c.label}
                    <div style={{ fontWeight: 400, fontSize: 9 }}>{c.peso}pts</div>
                  </th>
                ))}
                <th style={{ padding: '10px 14px', textAlign: 'center', color: C.muted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>Health</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', color: C.muted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {analise.map(({ site, checks, health }, i) => (
                <tr key={site.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.surface : C.bg }}>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontWeight: 600, color: C.text }}>{site.nome}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>{site.sistema} · {site.estado}</div>
                  </td>
                  {checks.map(c => (
                    <td key={c.id} style={{ padding: '10px 8px', textAlign: 'center' }}>
                      {c.ok
                        ? <CheckCircle2 size={14} style={{ color: C.success }} />
                        : <XCircle size={14} style={{ color: C.danger }} />}
                    </td>
                  ))}
                  <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: scoreColor(health), fontSize: 15 }}>{health}%</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    <HealthBadge score={health} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legenda dos checks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
        {CHECKS.map(c => (
          <div key={c.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: '8px 12px', fontSize: 12, color: C.muted }}>
            <strong style={{ color: C.text }}>{c.label}</strong> — {c.peso} pontos
          </div>
        ))}
      </div>

    </div>
  );
}
