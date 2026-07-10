import React, { useState, useMemo } from 'react';
import { Brain, RefreshCw, Sparkles, AlertTriangle, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';
import { api } from '../../../services/api';

/* ═══════════════════════════════════════════════════════════════════
   IA Insights — Análise inteligente do ecossistema de sites
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

const TIPOS_ANALISE = [
  { id: 'resumo', label: 'Resumo Executivo', icon: Sparkles, prompt: 'Gere um resumo executivo em 5 pontos sobre o estado atual dos sites, incluindo pontos fortes e fracos.' },
  { id: 'anomalias', label: 'Detecção de Anomalias', icon: AlertTriangle, prompt: 'Analise os dados e identifique anomalias, padrões suspeitos ou situações que requerem atenção imediata nos sites.' },
  { id: 'predicao', label: 'Predição de Falhas', icon: TrendingDown, prompt: 'Com base nos dados de health score, OCR e chamados, prediga quais sites têm maior risco de problemas nas próximas semanas.' },
  { id: 'melhorias', label: 'Recomendações de Melhoria', icon: TrendingUp, prompt: 'Sugira ações concretas de melhoria para os 3 sites com pior performance, priorizando por impacto.' },
  { id: 'comparacao', label: 'Comparação Inteligente', icon: CheckCircle2, prompt: 'Compare AxHub vs AxCross: quais diferenças estruturais existem? Qual sistema está em melhor situação operacional?' },
];

export default function IAInsights({ sitesComScore = [], chamadosData }) {
  const [tipoAtivo, setTipoAtivo] = useState('resumo');
  const [resultados, setResultados] = useState({});
  const [loading, setLoading] = useState({});

  const contexto = useMemo(() => {
    const ativos = sitesComScore.filter(s => s.status === 'ativo');
    return {
      totalSites: sitesComScore.length,
      ativos: ativos.length,
      mediaHealth: ativos.length ? Math.round(ativos.reduce((a, s) => a + (s.healthScore || 0), 0) / ativos.length) : 0,
      mediaOcr: (() => { const c = ativos.filter(s => s.ocr != null); return c.length ? Math.round(c.reduce((a, s) => a + s.ocr, 0) / c.length) : 0; })(),
      totalChamados: (chamadosData?.ranking || []).reduce((a, r) => a + (r.abertos || 0), 0),
      criticos: (chamadosData?.ranking || []).reduce((a, r) => a + (r.criticos || 0), 0),
      pioresHealth: ativos.sort((a, b) => (a.healthScore || 0) - (b.healthScore || 0)).slice(0, 3).map(s => ({ nome: s.nome, health: s.healthScore, sistema: s.sistema })),
      melhoresHealth: ativos.sort((a, b) => (b.healthScore || 0) - (a.healthScore || 0)).slice(0, 3).map(s => ({ nome: s.nome, health: s.healthScore, sistema: s.sistema })),
    };
  }, [sitesComScore, chamadosData]);

  async function gerarInsight(tipo) {
    const tipoInfo = TIPOS_ANALISE.find(t => t.id === tipo);
    if (!tipoInfo) return;
    setLoading(l => ({ ...l, [tipo]: true }));
    try {
      const resp = await api.post('/agent/run', {
        task: tipoInfo.prompt,
        context: JSON.stringify(contexto),
      });
      const resultado = resp.data?.result || resp.data?.response || 'Análise concluída.';
      setResultados(r => ({ ...r, [tipo]: { texto: resultado, geradoEm: new Date() } }));
    } catch {
      setResultados(r => ({ ...r, [tipo]: { texto: 'Serviço de IA temporariamente indisponível.', geradoEm: new Date(), erro: true } }));
    } finally {
      setLoading(l => ({ ...l, [tipo]: false }));
    }
  }

  const tipoAtualInfo = TIPOS_ANALISE.find(t => t.id === tipoAtivo);
  const resultadoAtual = resultados[tipoAtivo];
  const loadingAtual = loading[tipoAtivo];

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Brain size={20} style={{ color: C.accent }} />
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.text }}>IA Insights</h3>
          <p style={{ margin: 0, fontSize: 12, color: C.muted }}>Análise inteligente do ecossistema — powered by AxionIA</p>
        </div>
      </div>

      {/* Contexto resumido */}
      <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '12px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
        {[
          { l: 'Sites analisados', v: contexto.totalSites },
          { l: 'Sites ativos', v: contexto.ativos },
          { l: 'Health médio', v: `${contexto.mediaHealth}%` },
          { l: 'OCR médio', v: `${contexto.mediaOcr}%` },
          { l: 'Chamados abertos', v: contexto.totalChamados },
          { l: 'Críticos', v: contexto.criticos },
        ].map(item => (
          <div key={item.l} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#0c4a6e' }}>{item.v}</div>
            <div style={{ fontSize: 10, color: '#075985' }}>{item.l}</div>
          </div>
        ))}
      </div>

      {/* Seleção de tipo de análise */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {TIPOS_ANALISE.map(tipo => {
          const Icon = tipo.icon;
          const temResultado = !!resultados[tipo.id];
          return (
            <button
              key={tipo.id}
              onClick={() => setTipoAtivo(tipo.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
                border: `1px solid ${tipoAtivo === tipo.id ? C.accent : C.border}`,
                background: tipoAtivo === tipo.id ? '#eff6ff' : C.bg,
                color: tipoAtivo === tipo.id ? C.accent : C.muted,
                fontWeight: tipoAtivo === tipo.id ? 600 : 400,
                fontSize: 13,
              }}
            >
              <Icon size={13} />
              {tipo.label}
              {temResultado && <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.success }} />}
            </button>
          );
        })}
      </div>

      {/* Área de análise selecionada */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {tipoAtualInfo && <tipoAtualInfo.icon size={16} style={{ color: C.accent }} />}
            <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{tipoAtualInfo?.label}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {resultadoAtual && (
              <span style={{ fontSize: 11, color: C.muted }}>
                Gerado: {resultadoAtual.geradoEm.toLocaleTimeString('pt-BR')}
              </span>
            )}
            <button
              onClick={() => gerarInsight(tipoAtivo)}
              disabled={loadingAtual}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6,
                background: C.accent, color: '#fff', border: 'none', cursor: loadingAtual ? 'not-allowed' : 'pointer',
                fontSize: 12, fontWeight: 600, opacity: loadingAtual ? 0.7 : 1,
              }}
            >
              {loadingAtual ? <RefreshCw size={12} /> : <Brain size={12} />}
              {loadingAtual ? 'Analisando…' : resultadoAtual ? 'Reanalisar' : 'Gerar análise'}
            </button>
          </div>
        </div>

        {loadingAtual && (
          <div style={{ textAlign: 'center', padding: '32px', color: C.muted }}>
            <Brain size={32} style={{ opacity: 0.3, marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
            <p style={{ margin: 0, fontSize: 13 }}>AxionIA está analisando os dados…</p>
            <p style={{ margin: '4px 0 0', fontSize: 12 }}>Isso pode levar alguns segundos</p>
          </div>
        )}

        {!loadingAtual && resultadoAtual && (
          <div style={{
            background: resultadoAtual.erro ? '#fef2f2' : '#f8fafc',
            border: `1px solid ${resultadoAtual.erro ? '#fecaca' : C.border}`,
            borderRadius: 6, padding: 16, fontSize: 13, color: C.text, lineHeight: 1.7, whiteSpace: 'pre-wrap',
          }}>
            {resultadoAtual.texto}
          </div>
        )}

        {!loadingAtual && !resultadoAtual && (
          <div style={{ textAlign: 'center', padding: '32px', color: C.muted }}>
            <Sparkles size={32} style={{ opacity: 0.2, display: 'block', margin: '0 auto 12px' }} />
            <p style={{ margin: 0, fontSize: 13 }}>Clique em "Gerar análise" para iniciar</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: C.muted }}>
              Serão analisados {contexto.totalSites} sites com dados reais
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
