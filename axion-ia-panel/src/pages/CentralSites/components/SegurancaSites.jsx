import React, { useState, useMemo } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, XCircle, RefreshCw, Lock, Unlock } from 'lucide-react';
import { AXHUB_SITES, AXCROSS_SITES } from '../../../data/sitesData';

/* ═══════════════════════════════════════════════════════════════════
   Segurança — Status de segurança por site
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

const CHECKS_SEGURANCA = [
  { id: 'https',        label: 'HTTPS/SSL',              icon: Lock,        check: s => s.url?.startsWith('https') },
  { id: 'credencial',   label: 'Credenciais configuradas', icon: ShieldCheck, check: s => s.status === 'ativo' },
  { id: 'versao',       label: 'Versão mínima',           icon: CheckCircle2,check: s => s.versao && s.versao >= 'v.1.2.0' },
  { id: 'ativo',        label: 'Site ativo',              icon: CheckCircle2,check: s => s.status === 'ativo' },
  { id: 'afericao',     label: 'Aferição em dia',         icon: ShieldCheck, check: s => !!s.data_afericao },
];

const VULNERABILIDADES_SIMULADAS = [
  { id: 'deps_outdated', severidade: 'media', titulo: 'Dependências desatualizadas', desc: '3 pacotes com atualizações pendentes de segurança', corrigivel: true },
  { id: 'http_sites',    severidade: 'alta',  titulo: 'Sites sem HTTPS',             desc: 'Alguns sites acessíveis via HTTP sem redirecionamento', corrigivel: true },
  { id: 'credentials',  severidade: 'baixa', titulo: 'Senhas padrão detectadas',    desc: 'Verificar se credenciais padrão foram alteradas', corrigivel: true },
];

function SeveridadeBadge({ nivel }) {
  const map = {
    alta: { bg: '#fee2e2', color: '#991b1b', label: 'Alta' },
    media: { bg: '#fef9c3', color: '#92400e', label: 'Média' },
    baixa: { bg: '#f0f9ff', color: '#075985', label: 'Baixa' },
  };
  const { bg, color, label } = map[nivel] || map.baixa;
  return <span style={{ background: bg, color, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{label}</span>;
}

export default function SegurancaSites({ sitesComScore = [] }) {
  const [filtro, setFiltro] = useState('todos');

  const allSites = useMemo(() => [
    ...AXHUB_SITES.map(s => ({ ...s, sistema: 'AxHub' })),
    ...AXCROSS_SITES.map(s => ({ ...s, sistema: 'AxCross' })),
  ], []);

  const analise = useMemo(() => {
    return allSites.map(site => {
      const checks = CHECKS_SEGURANCA.map(c => ({
        ...c,
        ok: c.check(site),
      }));
      const score = Math.round((checks.filter(c => c.ok).length / checks.length) * 100);
      return { site, checks, score };
    }).sort((a, b) => a.score - b.score);
  }, [allSites]);

  const filtrados = useMemo(() => {
    if (filtro === 'critico') return analise.filter(a => a.score < 60);
    if (filtro === 'atencao') return analise.filter(a => a.score >= 60 && a.score < 80);
    if (filtro === 'ok') return analise.filter(a => a.score >= 80);
    return analise;
  }, [analise, filtro]);

  const resumo = useMemo(() => ({
    ok: analise.filter(a => a.score >= 80).length,
    atencao: analise.filter(a => a.score >= 60 && a.score < 80).length,
    critico: analise.filter(a => a.score < 60).length,
    media: analise.length ? Math.round(analise.reduce((acc, a) => acc + a.score, 0) / analise.length) : 0,
    semHttps: allSites.filter(s => !s.url?.startsWith('https')).length,
  }), [analise, allSites]);

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
        {[
          { label: 'SCORE MÉDIO', value: `${resumo.media}%`, color: resumo.media >= 80 ? C.success : resumo.media >= 60 ? C.warning : C.danger },
          { label: 'SEGUROS', value: resumo.ok, color: C.success },
          { label: 'ATENÇÃO', value: resumo.atencao, color: C.warning },
          { label: 'CRÍTICOS', value: resumo.critico, color: resumo.critico > 0 ? C.danger : C.muted },
          { label: 'SEM HTTPS', value: resumo.semHttps, color: resumo.semHttps > 0 ? C.warning : C.success },
        ].map(k => (
          <div key={k.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, borderTop: `3px solid ${k.color}` }}>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{k.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Vulnerabilidades identificadas */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={14} style={{ color: C.warning }} />
          Vulnerabilidades Identificadas
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {VULNERABILIDADES_SIMULADAS.map(vuln => (
            <div key={vuln.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', background: C.bg, borderRadius: 6, border: `1px solid ${C.border}` }}>
              <ShieldAlert size={16} style={{ color: vuln.severidade === 'alta' ? C.danger : vuln.severidade === 'media' ? C.warning : C.accent, marginTop: 1, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{vuln.titulo}</span>
                  <SeveridadeBadge nivel={vuln.severidade} />
                  {vuln.corrigivel && <span style={{ fontSize: 10, color: C.success, fontWeight: 600 }}>● Corrigível</span>}
                </div>
                <span style={{ fontSize: 12, color: C.muted }}>{vuln.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[['todos', 'Todos'], ['critico', '🔴 Crítico'], ['atencao', '🟡 Atenção'], ['ok', '🟢 Seguro']].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setFiltro(v)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
              border: `1px solid ${filtro === v ? C.accent : C.border}`,
              background: filtro === v ? '#eff6ff' : C.bg,
              color: filtro === v ? C.accent : C.muted,
              fontWeight: filtro === v ? 600 : 400,
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Tabela de sites */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: C.bg }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', color: C.muted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>Site</th>
                {CHECKS_SEGURANCA.map(c => (
                  <th key={c.id} style={{ padding: '10px 8px', textAlign: 'center', color: C.muted, fontWeight: 600, borderBottom: `1px solid ${C.border}`, fontSize: 10, maxWidth: 80 }}>
                    {c.label}
                  </th>
                ))}
                <th style={{ padding: '10px 14px', textAlign: 'center', color: C.muted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(({ site, checks, score }, i) => (
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
                  <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: score >= 80 ? C.success : score >= 60 ? C.warning : C.danger, fontSize: 14 }}>
                    {score}%
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr><td colSpan={CHECKS_SEGURANCA.length + 2} style={{ textAlign: 'center', padding: 40, color: C.muted }}>Nenhum site encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
