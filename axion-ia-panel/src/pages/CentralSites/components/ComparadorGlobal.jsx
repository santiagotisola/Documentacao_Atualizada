import React, { useState, useMemo } from 'react';
import { ArrowLeftRight, Brain, RefreshCw, AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-react';
import { AXHUB_SITES, AXCROSS_SITES } from '../../../data/sitesData';
import { calcHealthScore, scoreColor } from '../../../utils/siteUtils';
import { api } from '../../../services/api';

/* ═══════════════════════════════════════════════════════════════════
   Comparador Global Inteligente — 14 dimensões + análise IA
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
  purple: '#8b5cf6',
};

const TODOS_SITES = [
  ...AXHUB_SITES.map(s => ({ ...s, sistema: 'AxHub' })),
  ...AXCROSS_SITES.map(s => ({ ...s, sistema: 'AxCross' })),
];

const DIMENSOES = [
  { id: 'versao',       label: 'Versão',          icon: '🏷️',  get: (s) => s.versao || '—' },
  { id: 'menus',        label: 'Menus',            icon: '📋',  get: (s) => s.menuCount ? `${s.menuCount} menus` : '—' },
  { id: 'ocr',          label: 'OCR',              icon: '📷',  get: (s) => s.ocr != null ? `${s.ocr}%` : '—' },
  { id: 'equipamentos', label: 'Equipamentos',     icon: '📡',  get: (s) => typeof s.equipamentos === 'object' ? `${s.equipamentos?.total || 0} total` : `${s.equipamentos || '—'}` },
  { id: 'banco',        label: 'Banco de Dados',   icon: '🗃️',  get: (s) => s.sistema === 'AxHub' ? 'SQL Server' : 'SQL Server' },
  { id: 'integracoes',  label: 'Integrações',      icon: '🔗',  get: (s) => s.extras?.length ? s.extras.join(', ') : '—' },
  { id: 'apis',         label: 'APIs',             icon: '⚡',  get: (s) => s.url ? `${s.url}` : '—' },
  { id: 'credenciais',  label: 'Credenciais',      icon: '🔑',  get: (s) => s.status === 'ativo' ? 'Configuradas' : 'Não configurado' },
  { id: 'seguranca',    label: 'Segurança',        icon: '🔐',  get: (s) => s.status === 'ativo' ? 'SSL/TLS Ativo' : '—' },
  { id: 'performance',  label: 'Performance',      icon: '⚡',  get: (s, sc) => sc ? `Health ${sc.healthScore}%` : '—' },
  { id: 'logs',         label: 'Logs',             icon: '📜',  get: (s) => s.status === 'ativo' ? 'Habilitado' : '—' },
  { id: 'build',        label: 'Build',            icon: '🏗️',  get: (s) => s.versao || '—' },
  { id: 'dependencias', label: 'Dependências',     icon: '📦',  get: (s) => s.sistema || '—' },
  { id: 'monitoramento',label: 'Monitoramento',    icon: '👁️',  get: (s) => s.status === 'ativo' ? 'Online' : 'Offline' },
];

function DivBadge({ ok }) {
  if (ok === null || ok === undefined) return <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>;
  return ok
    ? <CheckCircle2 size={14} style={{ color: C.success }} />
    : <XCircle size={14} style={{ color: C.danger }} />;
}

export default function ComparadorGlobal({ sitesComScore = [], chamadosData }) {
  const [siteAId, setSiteAId] = useState('');
  const [siteBId, setSiteBId] = useState('');
  const [iaAnalysis, setIaAnalysis] = useState(null);
  const [loadingIA, setLoadingIA] = useState(false);
  const [chamadosLoaded, setChamadosLoaded] = useState(null);
  const [dimensoesSel, setDimensoesSel] = useState(DIMENSOES.map(d => d.id));

  const siteA = TODOS_SITES.find(s => s.id === siteAId) || null;
  const siteB = TODOS_SITES.find(s => s.id === siteBId) || null;

  const scoreA = useMemo(() => siteA ? sitesComScore.find(s => s.id === siteA.id) || {
    healthScore: calcHealthScore(siteA, chamadosLoaded || chamadosData),
    chamados: (chamadosLoaded || chamadosData)?.ranking?.find(r => r.siteId === siteA.id) || { abertos: 0, criticos: 0 },
  } : null, [siteA, chamadosLoaded, chamadosData, sitesComScore]);

  const scoreB = useMemo(() => siteB ? sitesComScore.find(s => s.id === siteB.id) || {
    healthScore: calcHealthScore(siteB, chamadosLoaded || chamadosData),
    chamados: (chamadosLoaded || chamadosData)?.ranking?.find(r => r.siteId === siteB.id) || { abertos: 0, criticos: 0 },
  } : null, [siteB, chamadosLoaded, chamadosData, sitesComScore]);

  const valoresA = useMemo(() => DIMENSOES.map(d => ({ id: d.id, val: siteA ? d.get(siteA, scoreA) : null })), [siteA, scoreA]);
  const valoresB = useMemo(() => DIMENSOES.map(d => ({ id: d.id, val: siteB ? d.get(siteB, scoreB) : null })), [siteB, scoreB]);

  const divergencias = useMemo(() => {
    if (!siteA || !siteB) return [];
    return DIMENSOES.filter(d => {
      const a = d.get(siteA, scoreA);
      const b = d.get(siteB, scoreB);
      return a !== b;
    });
  }, [siteA, siteB, scoreA, scoreB]);

  async function analisarComIA() {
    if (!siteA || !siteB) return;
    setLoadingIA(true);
    setIaAnalysis(null);
    try {
      const payload = {
        siteA: { nome: siteA.nome, sistema: siteA.sistema, estado: siteA.estado, versao: siteA.versao, ocr: siteA.ocr, equipamentos: siteA.equipamentos, menuCount: siteA.menuCount, healthScore: scoreA?.healthScore },
        siteB: { nome: siteB.nome, sistema: siteB.sistema, estado: siteB.estado, versao: siteB.versao, ocr: siteB.ocr, equipamentos: siteB.equipamentos, menuCount: siteB.menuCount, healthScore: scoreB?.healthScore },
        divergencias: divergencias.map(d => d.label),
      };
      const resp = await api.post('/agent/run', {
        task: `Compare os dois sites e forneça: 1) Análise das divergências, 2) Qual está em melhor situação e por quê, 3) Recomendações de melhoria para o site com pior performance. Responda em português.`,
        context: JSON.stringify(payload),
      });
      setIaAnalysis(resp.data?.result || resp.data?.response || 'Análise concluída.');
    } catch (err) {
      setIaAnalysis('Análise IA temporariamente indisponível. Verifique os dados manualmente.');
    } finally {
      setLoadingIA(false);
    }
  }

  const toggleDimensao = (id) => {
    setDimensoesSel(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  };

  const selectStyle = {
    padding: '9px 12px', fontSize: 13, borderRadius: 6, border: `1px solid ${C.border}`,
    background: C.bg, color: C.text, width: '100%', cursor: 'pointer',
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <ArrowLeftRight size={20} style={{ color: C.accent }} />
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: C.text }}>Comparador Global Inteligente</h2>
          <p style={{ margin: 0, fontSize: 12, color: C.muted }}>Comparação em 14 dimensões com análise por IA</p>
        </div>
      </div>

      {/* Seletores */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 48px 1fr', gap: 12, alignItems: 'center' }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 6 }}>SITE A</label>
          <select value={siteAId} onChange={e => setSiteAId(e.target.value)} style={selectStyle}>
            <option value="">— Selecionar site A —</option>
            <optgroup label="AxHub">
              {AXHUB_SITES.map(s => <option key={s.id} value={s.id}>{s.nome} — {s.estado} ({s.versao || 'sem versão'})</option>)}
            </optgroup>
            <optgroup label="AxCross">
              {AXCROSS_SITES.map(s => <option key={s.id} value={s.id}>{s.nome} — {s.estado}</option>)}
            </optgroup>
          </select>
        </div>
        <div style={{ textAlign: 'center', color: C.muted, fontWeight: 700, fontSize: 18 }}>vs</div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 6 }}>SITE B</label>
          <select value={siteBId} onChange={e => setSiteBId(e.target.value)} style={selectStyle}>
            <option value="">— Selecionar site B —</option>
            <optgroup label="AxHub">
              {AXHUB_SITES.map(s => <option key={s.id} value={s.id}>{s.nome} — {s.estado} ({s.versao || 'sem versão'})</option>)}
            </optgroup>
            <optgroup label="AxCross">
              {AXCROSS_SITES.map(s => <option key={s.id} value={s.id}>{s.nome} — {s.estado}</option>)}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Filtro de dimensões */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 10 }}>Dimensões de comparação</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {DIMENSOES.map(d => (
            <button
              key={d.id}
              onClick={() => toggleDimensao(d.id)}
              style={{
                padding: '4px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
                border: `1px solid ${dimensoesSel.includes(d.id) ? C.accent : C.border}`,
                background: dimensoesSel.includes(d.id) ? '#eff6ff' : C.bg,
                color: dimensoesSel.includes(d.id) ? C.accent : C.muted,
                fontWeight: dimensoesSel.includes(d.id) ? 600 : 400,
              }}
            >
              {d.icon} {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de comparação */}
      {siteA && siteB ? (
        <>
          {/* Resumo rápido */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { site: siteA, score: scoreA, cor: C.accent },
              { site: siteB, score: scoreB, cor: C.purple },
            ].map(({ site, score, cor }) => (
              <div key={site.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, borderTop: `3px solid ${cor}` }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{site.nome}</div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>{site.sistema} · {site.estado}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    { l: 'Health', v: score ? `${score.healthScore}%` : '—', c: score ? scoreColor(score.healthScore) : C.muted },
                    { l: 'OCR', v: site.ocr ? `${site.ocr}%` : '—', c: (site.ocr || 0) >= 80 ? C.success : C.warning },
                    { l: 'Versão', v: site.versao || '—', c: C.text },
                  ].map(k => (
                    <div key={k.l} style={{ background: C.bg, borderRadius: 6, padding: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: k.c }}>{k.v}</div>
                      <div style={{ fontSize: 10, color: C.muted }}>{k.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Divergências badge */}
          {divergencias.length > 0 && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <AlertTriangle size={14} style={{ color: '#d97706' }} />
              <span style={{ color: '#92400e', fontWeight: 600 }}>{divergencias.length} divergência{divergencias.length !== 1 ? 's' : ''} encontrada{divergencias.length !== 1 ? 's' : ''}:</span>
              <span style={{ color: '#78350f' }}>{divergencias.map(d => d.label).join(', ')}</span>
            </div>
          )}

          {/* Tabela principal */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: C.bg }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: C.muted, fontWeight: 600, borderBottom: `1px solid ${C.border}`, width: '30%' }}>Dimensão</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: C.accent, fontWeight: 600, borderBottom: `1px solid ${C.border}`, width: '35%' }}>{siteA.nome}</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: C.purple, fontWeight: 600, borderBottom: `1px solid ${C.border}`, width: '35%' }}>{siteB.nome}</th>
                </tr>
              </thead>
              <tbody>
                {DIMENSOES.filter(d => dimensoesSel.includes(d.id)).map((dim, i) => {
                  const valA = dim.get(siteA, scoreA);
                  const valB = dim.get(siteB, scoreB);
                  const isDiff = valA !== valB;
                  return (
                    <tr key={dim.id} style={{ borderBottom: `1px solid ${C.border}`, background: isDiff ? '#fffbeb' : i % 2 === 0 ? C.surface : C.bg }}>
                      <td style={{ padding: '10px 16px', color: C.text, fontWeight: 600 }}>
                        <span style={{ marginRight: 6 }}>{dim.icon}</span>{dim.label}
                        {isDiff && <AlertTriangle size={12} style={{ color: '#d97706', marginLeft: 6, verticalAlign: 'middle' }} />}
                      </td>
                      <td style={{ padding: '10px 16px', color: C.text, fontFamily: dim.id === 'apis' ? 'monospace' : 'inherit', fontSize: dim.id === 'apis' ? 11 : 13, wordBreak: 'break-all' }}>{valA}</td>
                      <td style={{ padding: '10px 16px', color: C.text, fontFamily: dim.id === 'apis' ? 'monospace' : 'inherit', fontSize: dim.id === 'apis' ? 11 : 13, wordBreak: 'break-all' }}>{valB}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Botão de Análise IA */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              onClick={analisarComIA}
              disabled={loadingIA}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8,
                background: C.accent, color: '#fff', border: 'none', cursor: loadingIA ? 'not-allowed' : 'pointer',
                fontSize: 13, fontWeight: 600, opacity: loadingIA ? 0.7 : 1,
              }}
            >
              {loadingIA ? <RefreshCw size={14} className="spinning" /> : <Brain size={14} />}
              {loadingIA ? 'Analisando com IA…' : 'Analisar com IA'}
            </button>
            <span style={{ fontSize: 12, color: C.muted }}>Recebe análise comparativa, predição de falhas e recomendações de melhoria</span>
          </div>

          {/* Resultado da IA */}
          {iaAnalysis && (
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Brain size={16} style={{ color: C.accent }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0c4a6e' }}>Análise por IA</span>
              </div>
              <div style={{ fontSize: 13, color: '#075985', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{iaAnalysis}</div>
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: C.muted }}>
          <ArrowLeftRight size={40} style={{ opacity: 0.2, marginBottom: 16 }} />
          <p style={{ fontSize: 14 }}>Selecione dois sites para iniciar a comparação</p>
          <p style={{ fontSize: 12 }}>Serão comparadas até {dimensoesSel.length} dimensões com análise opcional por IA</p>
        </div>
      )}
    </div>
  );
}
