import React, { useMemo, useState } from 'react';
import { BarChart3, CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';
import { calcHealthScore } from '../../../utils/siteUtils';

/* ═══════════════════════════════════════════════════════════════════
   Indicadores — Painel de indicadores consolidados por site/produto
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

const INDICADORES_DEF = [
  { id: 'versao',       label: 'Versão ≥ v.1.2.0',         peso: 15, check: s       => s.versao && s.versao >= 'v.1.2.0' },
  { id: 'ocr',          label: 'OCR ≥ 80%',                peso: 20, check: s       => s.ocr != null && s.ocr >= 80 },
  { id: 'equip',        label: 'Equipamentos configurados', peso: 15, check: s       => (typeof s.equipamentos === 'object' ? s.equipamentos?.total : s.equipamentos) > 0 },
  { id: 'ativo',        label: 'Site ativo',                peso: 20, check: s       => s.status === 'ativo' },
  { id: 'health',       label: 'Health Score ≥ 70%',       peso: 20, check: (s, sc) => (sc?.healthScore || calcHealthScore(s, null)) >= 70 },
  { id: 'chamados',     label: 'Chamados abertos ≤ 2',     peso: 10, check: (s, sc) => (sc?.chamados?.abertos || 0) <= 2 },
];

function ScoreCircle({ score, size = 60 }) {
  const color = score >= 80 ? C.success : score >= 60 ? C.warning : C.danger;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={(size/2)-4} fill="none" stroke={C.border} strokeWidth={5} />
        <circle
          cx={size/2} cy={size/2} r={(size/2)-4} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={`${((size/2)-4)*2*Math.PI}`}
          strokeDashoffset={`${((size/2)-4)*2*Math.PI*(1 - score/100)}`}
          strokeLinecap="round"
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.22, fontWeight: 800, color }}>
        {score}%
      </div>
    </div>
  );
}

export default function IndicadoresSites({ sitesComScore = [], chamadosData }) {
  const [grupo, setGrupo] = useState('todos');

  const sitesGrupo = useMemo(() => {
    if (grupo === 'todos') return sitesComScore;
    return sitesComScore.filter(s => s.sistema?.toLowerCase() === grupo);
  }, [sitesComScore, grupo]);

  const sitesAtivos = useMemo(() => sitesGrupo.filter(s => s.status === 'ativo'), [sitesGrupo]);

  const scoreGlobal = useMemo(() => {
    if (!sitesAtivos.length) return 0;
    const totalPontos = INDICADORES_DEF.reduce((acc, ind) => acc + ind.peso, 0);
    const pontosPorSite = sitesAtivos.map(s => {
      const pontos = INDICADORES_DEF.reduce((acc, ind) => {
        return acc + (ind.check(s, s) ? ind.peso : 0);
      }, 0);
      return (pontos / totalPontos) * 100;
    });
    return Math.round(pontosPorSite.reduce((a, v) => a + v, 0) / pontosPorSite.length);
  }, [sitesAtivos]);

  const tabelaIndicadores = useMemo(() => {
    return INDICADORES_DEF.map(ind => {
      const ok = sitesAtivos.filter(s => ind.check(s, s)).length;
      const nok = sitesAtivos.length - ok;
      return { ...ind, ok, nok, pct: sitesAtivos.length ? Math.round((ok / sitesAtivos.length) * 100) : 0 };
    });
  }, [sitesAtivos]);

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Filtro de grupo */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[['todos', 'Todos'], ['axhub', 'AxHub'], ['axcross', 'AxCross']].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setGrupo(v)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
              border: `1px solid ${grupo === v ? C.accent : C.border}`,
              background: grupo === v ? '#eff6ff' : C.bg,
              color: grupo === v ? C.accent : C.muted,
              fontWeight: grupo === v ? 600 : 400,
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Score global + indicadores de resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 24, alignItems: 'center', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <ScoreCircle score={scoreGlobal} size={80} />
          <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Score Global</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
          {tabelaIndicadores.map(ind => (
            <div key={ind.id} style={{ background: C.bg, borderRadius: 6, padding: '10px 12px' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: ind.pct >= 80 ? C.success : ind.pct >= 60 ? C.warning : C.danger }}>{ind.pct}%</div>
              <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.3 }}>{ind.label}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{ind.ok}/{sitesAtivos.length} sites</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabela de conformidade por indicador */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart3 size={14} style={{ color: C.accent }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Indicadores por Critério</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.bg }}>
                {['Indicador', 'Peso', '✅ Conforme', '❌ Não conforme', '% Conformidade'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: C.muted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tabelaIndicadores.map((ind, i) => (
                <tr key={ind.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.surface : C.bg }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: C.text }}>{ind.label}</td>
                  <td style={{ padding: '10px 14px', color: C.muted }}>{ind.peso}%</td>
                  <td style={{ padding: '10px 14px', color: C.success, fontWeight: 600 }}>{ind.ok}</td>
                  <td style={{ padding: '10px 14px', color: ind.nok > 0 ? C.danger : C.muted, fontWeight: ind.nok > 0 ? 600 : 400 }}>{ind.nok}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, height: 8, background: C.bg, borderRadius: 4, overflow: 'hidden', border: `1px solid ${C.border}` }}>
                        <div style={{ height: '100%', width: `${ind.pct}%`, background: ind.pct >= 80 ? C.success : ind.pct >= 60 ? C.warning : C.danger, borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: ind.pct >= 80 ? C.success : ind.pct >= 60 ? C.warning : C.danger, minWidth: 40 }}>{ind.pct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabela site x indicadores */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 600, color: C.text }}>
          Conformidade por Site
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: C.bg }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', color: C.muted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>Site</th>
                {INDICADORES_DEF.map(ind => (
                  <th key={ind.id} style={{ padding: '10px 8px', textAlign: 'center', color: C.muted, fontWeight: 600, borderBottom: `1px solid ${C.border}`, fontSize: 10, whiteSpace: 'nowrap' }}>
                    {ind.label.split(' ')[0]}
                  </th>
                ))}
                <th style={{ padding: '10px 14px', textAlign: 'center', color: C.muted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {sitesAtivos.map((s, i) => {
                const resultados = INDICADORES_DEF.map(ind => ind.check(s, s));
                const score = Math.round((resultados.filter(Boolean).length / INDICADORES_DEF.length) * 100);
                return (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.surface : C.bg }}>
                    <td style={{ padding: '8px 14px', fontWeight: 600, color: C.text }}>{s.nome}</td>
                    {resultados.map((ok, j) => (
                      <td key={j} style={{ padding: '8px', textAlign: 'center' }}>
                        {ok ? <CheckCircle2 size={13} style={{ color: C.success }} /> : <XCircle size={13} style={{ color: C.danger }} />}
                      </td>
                    ))}
                    <td style={{ padding: '8px 14px', textAlign: 'center', fontWeight: 700, color: score >= 80 ? C.success : score >= 60 ? C.warning : C.danger }}>
                      {score}%
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
