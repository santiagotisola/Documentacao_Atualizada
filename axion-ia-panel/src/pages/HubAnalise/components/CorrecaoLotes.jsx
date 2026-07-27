import { useState, useMemo, useEffect, useRef } from 'react';
import { ALL_CREDENCIAIS } from '../../../data/sitesCredentials';

const API = '/api/lote-exportacao';

// ─── Paleta de status ─────────────────────────────────────────────────────────
const COR_PASSO = {
  info:   { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', icon: 'ℹ️' },
  ok:     { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', icon: '✅' },
  alerta: { bg: '#fffbeb', border: '#fde68a', text: '#b45309', icon: '⚠️' },
  erro:   { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c', icon: '❌' },
};

// ─── Componente de log de passos ──────────────────────────────────────────────
function LogPassos({ passos }) {
  if (!passos?.length) return null;
  return (
    <div style={{ background: '#0f172a', borderRadius: '10px', padding: '1rem', maxHeight: '300px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.78rem' }}>
      {passos.map((p, i) => {
        const c = COR_PASSO[p.tipo] || COR_PASSO.info;
        return (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem', alignItems: 'flex-start' }}>
            <span style={{ color: '#64748b', flexShrink: 0 }}>{new Date(p.ts).toLocaleTimeString('pt-BR')}</span>
            <span style={{ flexShrink: 0 }}>{c.icon}</span>
            <span style={{ color: p.tipo === 'erro' ? '#fca5a5' : p.tipo === 'ok' ? '#86efac' : p.tipo === 'alerta' ? '#fde68a' : '#cbd5e1' }}>{p.descricao}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Card de resultado de lote ────────────────────────────────────────────────
function CardLote({ resultado, baseUrl }) {
  const [expandido, setExpandido] = useState(false);
  const { idLote, mensagemOriginal, totalInfracoes, correcoesInfracoes, urlDetalhe, erro } = resultado;
  const totalOk = correcoesInfracoes?.filter(c => c.sucesso)?.length ?? 0;

  return (
    <div style={{
      background: 'white', borderRadius: '12px', border: `1.5px solid ${erro ? '#fecaca' : totalOk === totalInfracoes ? '#bbf7d0' : '#fde68a'}`,
      overflow: 'hidden',
    }}>
      <div
        style={{ padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', gap: '0.875rem', alignItems: 'center' }}
        onClick={() => setExpandido(v => !v)}
      >
        <div style={{
          width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
          background: erro ? '#fef2f2' : totalOk === totalInfracoes ? '#f0fdf4' : '#fffbeb',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
        }}>
          {erro ? '❌' : totalOk === totalInfracoes ? '✅' : '⚠️'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a202c' }}>
            Lote #{idLote}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.15rem' }}>
            {erro ? `Erro: ${erro}` : `${totalInfracoes} infração(ões) · ${totalOk} consultada(s) com sucesso`}
          </div>
        </div>
        {urlDetalhe && (
          <a
            href={urlDetalhe}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{ fontSize: '0.75rem', color: '#6366f1', textDecoration: 'none', flexShrink: 0 }}
          >
            🔗 Abrir
          </a>
        )}
        <span style={{ color: '#9ca3af', fontSize: '0.7rem', flexShrink: 0 }}>{expandido ? '▲' : '▼'}</span>
      </div>

      {expandido && (
        <div style={{ borderTop: '1px solid #f1f5f9', padding: '1rem 1.25rem', background: '#f8fafc' }}>
          {mensagemOriginal && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.875rem', fontSize: '0.8rem', color: '#b91c1c' }}>
              <strong>Mensagem de erro:</strong> {mensagemOriginal}
            </div>
          )}
          {correcoesInfracoes?.map((c, i) => (
            <div key={i} style={{
              display: 'flex', gap: '0.75rem', alignItems: 'center',
              padding: '0.5rem 0.75rem', borderRadius: '8px', marginBottom: '0.375rem',
              background: c.sucesso ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${c.sucesso ? '#bbf7d0' : '#fecaca'}`,
            }}>
              <span>{c.sucesso ? '✅' : '❌'}</span>
              <div style={{ flex: 1, fontSize: '0.8rem', color: '#374151' }}>
                <strong>Infração {c.idInfracao}</strong> — {c.mensagem}
              </div>
              {c.url && (
                <a href={c.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.72rem', color: '#6366f1' }}>🔗</a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Seletor de Site (dropdown compacto, mesmo estilo do header) ─────────────
function SeletorSite({ urlSelecionada, onSelecionar }) {
  const [aberto, setAberto] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [modoManual, setModoManual] = useState(false);
  const [infoAberto, setInfoAberto] = useState(false);
  const ref = useRef(null);
  const infoRef = useRef(null);

  const sitesAxHub = useMemo(() => ALL_CREDENCIAIS.filter(s => s.sistema === 'AxHub'), []);

  const filtrados = useMemo(() =>
    sitesAxHub.filter(s =>
      !filtro ||
      s.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      s.url.toLowerCase().includes(filtro.toLowerCase()) ||
      (s.estado || '').toLowerCase().includes(filtro.toLowerCase())
    ),
    [sitesAxHub, filtro]
  );

  const siteSelecionado = sitesAxHub.find(s => s.url === urlSelecionada);

  // Fecha ao clicar fora
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setAberto(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    const close = (e) => { if (infoRef.current && !infoRef.current.contains(e.target)) setInfoAberto(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const PASSOS_INFO = [
    { n: '1', t: 'Selecionar o site',      d: 'Escolha o contrato AxHub na lista ou informe a URL manualmente.' },
    { n: '2', t: 'Analisar lotes com erro', d: 'O sistema acessa /loteexportacao e lista todos os lotes com status "Erro".' },
    { n: '3', t: 'Correção automática',     d: 'Abre o detalhe de cada lote, lê a mensagem de erro e identifica as infrações.' },
    { n: '4', t: 'Consultar Dados',         d: 'Clica em "Consultar Dados" para buscar os dados do veículo no SERPRO.' },
    { n: '5', t: 'Nova exportação',         d: 'Após a correção, gere uma nova exportação para o lote corrigido.' },
  ];

  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
      {/* Botão dropdown */}
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          onClick={() => { setAberto(v => !v); setModoManual(false); }}
          style={{
            padding: '0.45rem 0.875rem', borderRadius: '10px', cursor: 'pointer',
            border: `1.5px solid ${aberto || urlSelecionada ? '#667eea' : '#e2e8f0'}`,
            background: aberto ? '#f0f4ff' : urlSelecionada ? '#667eea0d' : '#f8fafc',
            display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '200px',
            transition: 'all 0.15s',
          }}
        >
          <span>🌐</span>
          <span style={{ flex: 1, fontSize: '0.82rem', color: urlSelecionada ? '#667eea' : '#374151', fontWeight: urlSelecionada ? 700 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {siteSelecionado ? siteSelecionado.nome : urlSelecionada || 'Selecionar site...'}
          </span>
          <span style={{ color: '#9ca3af', fontSize: '0.65rem', transform: aberto ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>▼</span>
        </button>

        {aberto && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 300,
            background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0',
            boxShadow: '0 16px 40px rgba(0,0,0,0.15)', overflow: 'hidden', minWidth: '300px', maxWidth: '420px',
          }}>
            <div style={{ padding: '0.6rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <input
                autoFocus value={filtro} onChange={e => setFiltro(e.target.value)}
                placeholder="🔍 Filtrar por nome, URL ou estado..."
                style={{ width: '100%', padding: '0.4rem 0.7rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem', outline: 'none', background: 'white', color: '#374151', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
              {filtrados.length === 0
                ? <div style={{ padding: '1.5rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.82rem' }}>Nenhum site encontrado</div>
                : filtrados.map(s => {
                    const ativo = urlSelecionada === s.url;
                    return (
                      <div key={s.id} onClick={() => { onSelecionar(s); setAberto(false); setFiltro(''); }} style={{
                        padding: '0.55rem 0.75rem', cursor: 'pointer',
                        display: 'flex', gap: '0.6rem', alignItems: 'center',
                        background: ativo ? '#667eea14' : 'transparent',
                        borderLeft: `3px solid ${ativo ? '#667eea' : 'transparent'}`,
                        transition: 'all 0.1s',
                      }}>
                        <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>🔵</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#1a202c' }}>{s.nome}</div>
                          <div style={{ fontSize: '0.68rem', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.url} · {s.estado || '—'} · {s.tipo}</div>
                        </div>
                        <div style={{ width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0, border: `2px solid ${ativo ? '#667eea' : '#d1d5db'}`, background: ativo ? '#667eea' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {ativo && <span style={{ color: 'white', fontSize: '0.55rem', fontWeight: 900 }}>✓</span>}
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>
        )}
      </div>

      {/* Botão URL Manual */}
      <button
        onClick={() => setModoManual(v => !v)}
        style={{ padding: '0.4rem 0.7rem', borderRadius: '8px', border: `1.5px solid ${modoManual ? '#667eea' : '#e2e8f0'}`, background: modoManual ? '#f0f4ff' : '#f8fafc', color: modoManual ? '#667eea' : '#6b7280', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
      >
        ✏️ URL manual
      </button>

      {/* Botão Como Funciona inline */}
      <div ref={infoRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setInfoAberto(v => !v)}
          style={{ padding: '0.4rem 0.7rem', borderRadius: '8px', border: `1.5px solid ${infoAberto ? '#667eea' : '#e2e8f0'}`, background: infoAberto ? '#f0f4ff' : '#f8fafc', color: infoAberto ? '#667eea' : '#6b7280', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          📖 Como funciona <span style={{ fontSize: '0.6rem', color: '#9ca3af', transform: infoAberto ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
        </button>
        {infoAberto && (
          <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 400, background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 16px 40px rgba(0,0,0,0.15)', overflow: 'hidden', width: '340px' }}>
            <div style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', fontWeight: 700, fontSize: '0.82rem', color: '#374151' }}>📖 Como funciona a correção</div>
            <div style={{ padding: '0.75rem' }}>
              {PASSOS_INFO.map(p => (
                <div key={p.n} style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.6rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', fontWeight: 800, fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{p.n}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#1a202c' }}>{p.t}</div>
                    <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '0.05rem' }}>{p.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input URL manual */}
      {modoManual && (
        <input
          type="url"
          value={urlSelecionada || ''}
          onChange={e => onSelecionar({ url: e.target.value, login: '', senha: '' })}
          placeholder="https://..."
          style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.82rem', outline: 'none', minWidth: '280px' }}
        />
      )}

      {/* Badge site selecionado */}
      {urlSelecionada && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.625rem', borderRadius: '20px', background: '#f0fdf4', border: '1px solid #86efac', fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>
          ✅ <a href={urlSelecionada} target="_blank" rel="noopener noreferrer" style={{ color: '#15803d', fontFamily: 'monospace', fontSize: '0.72rem' }}>{urlSelecionada}</a>
        </span>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function CorrecaoLotes({ siteAtivo = null, sitesAtivos = [] }) {
  // Se há sites selecionados globalmente, usa o primeiro como default
  const [siteSelecionado, setSiteSelecionado] = useState(() => siteAtivo || null);
  const [credLogin, setCredLogin]             = useState(() => siteAtivo?.login || '');
  const [credSenha, setCredSenha]             = useState(() => siteAtivo?.senha || '');

  // Sincroniza quando o siteAtivo global muda
  useEffect(() => {
    if (siteAtivo && (!siteSelecionado || siteSelecionado.id !== siteAtivo.id)) {
      setSiteSelecionado(siteAtivo);
      setCredLogin(siteAtivo.login || '');
      setCredSenha(siteAtivo.senha || '');
      setEtapa('idle');
    }
  }, [siteAtivo?.id]);

  const [etapa, setEtapa]                     = useState('idle');
  const [lotes, setLotes]                     = useState([]);
  const [screenshotLista, setScreenshotLista] = useState(null);
  const [passos, setPassos]                   = useState([]);
  const [resultados, setResultados]           = useState([]);
  const [erroMsg, setErroMsg]                 = useState('');
  const [idLoteFiltro, setIdLoteFiltro]       = useState('');

  // Modo comparação — múltiplos sites
  const [resultadosMulti, setResultadosMulti] = useState({}); // { siteId: { passos, resultados, etapa } }
  const modoComparacao = sitesAtivos.length > 1;

  const handleSelecionar = (site) => {
    setSiteSelecionado(site);
    if (site.login) setCredLogin(site.login);
    if (site.senha) setCredSenha(site.senha);
    setEtapa('idle');
  };

  const urlBase = siteSelecionado?.url || '';

  const analisar = async () => {
    if (!urlBase) return;
    setEtapa('analisando');
    setLotes([]);
    setScreenshotLista(null);
    setErroMsg('');

    try {
      const res = await fetch(`${API}/analisar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlBase, login: credLogin, senha: credSenha }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || 'Erro na análise');

      setLotes(data.lotes || []);
      setScreenshotLista(data.screenshotLista || null);
      setEtapa('analisado');
    } catch (err) {
      setErroMsg(err.message);
      setEtapa('erro');
    }
  };

  // Corrigir todos os sites selecionados em paralelo (modo comparação)
  const corrigirMulti = async () => {
    const sitesParaCorrigir = sitesAtivos.filter(s => s.login && s.senha);
    setResultadosMulti({});

    for (const site of sitesParaCorrigir) {
      setResultadosMulti(prev => ({ ...prev, [site.id]: { etapa: 'corrigindo', passos: [], resultados: [] } }));
      try {
        const body = { url: site.url, login: site.login, senha: site.senha };
        const res = await fetch(`${API}/corrigir`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const data = await res.json();
        setResultadosMulti(prev => ({ ...prev, [site.id]: { etapa: res.ok ? 'corrigido' : 'erro', passos: data.passos || [], resultados: data.resultados || [], erro: !res.ok ? (data.erro || 'Erro') : null } }));
      } catch (err) {
        setResultadosMulti(prev => ({ ...prev, [site.id]: { etapa: 'erro', passos: [], resultados: [], erro: err.message } }));
      }
    }
  };

  const corrigir = async () => {
    if (!urlBase) return;
    setEtapa('corrigindo');
    setPassos([]);
    setResultados([]);
    setErroMsg('');

    try {
      const body = { url: urlBase, login: credLogin, senha: credSenha };
      if (idLoteFiltro.trim()) body.idLote = idLoteFiltro.trim();

      const res = await fetch(`${API}/corrigir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || 'Erro na correção');

      setPassos(data.passos || []);
      setResultados(data.resultados || []);
      setEtapa('corrigido');
    } catch (err) {
      setErroMsg(err.message);
      setEtapa('erro');
    }
  };

  const resetar = () => {
    setEtapa('idle');
    setLotes([]);
    setPassos([]);
    setResultados([]);
    setErroMsg('');
    setScreenshotLista(null);
  };

  const podeContinuar = urlBase && credLogin && credSenha;
  const carregando = etapa === 'analisando' || etapa === 'corrigindo';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Cabeçalho explicativo ──────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea08, #764ba208)',
        border: '1.5px solid #667eea33',
        borderRadius: '12px',
        padding: '1.125rem 1.5rem',
      }}>
        <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
          <div style={{ fontSize: '1.75rem', flexShrink: 0 }}>🔧</div>
          <div>
            <h2 style={{ margin: '0 0 0.375rem', fontSize: '1.05rem', fontWeight: 800, color: '#1a202c' }}>
              Correção Automática de Lotes de Exportação
            </h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.65 }}>
              Este módulo automatiza a identificação e correção de lotes em status <strong>Erro</strong> no AxHub.
              O sistema irá: <strong>(1)</strong> acessar a tela de Lotes de Exportação, <strong>(2)</strong> identificar lotes com erro,
              <strong> (3)</strong> abrir o detalhe de cada lote, <strong>(4)</strong> localizar as infrações com falha,
              <strong> (5)</strong> executar <em>Consultar Dados</em> para atualizar os dados do veículo via SERPRO,
              e <strong>(6)</strong> retornar o relatório de correção. Após a correção, gere uma nova exportação manualmente.
            </p>
          </div>
        </div>
      </div>

      {/* ── Modo Comparação (múltiplos sites) ─────────────────────── */}
      {modoComparacao && (
        <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '12px', padding: '1rem 1.25rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#92400e', marginBottom: '0.75rem' }}>
            ⚡ Modo Comparação — {sitesAtivos.length} sites selecionados
          </div>
          <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
            {sitesAtivos.map(s => {
              const r = resultadosMulti[s.id];
              return (
                <span key={s.id} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600,
                  background: r?.etapa === 'corrigido' ? '#f0fdf4' : r?.etapa === 'erro' ? '#fef2f2' : r?.etapa === 'corrigindo' ? '#eff6ff' : '#f1f5f9',
                  border: `1px solid ${r?.etapa === 'corrigido' ? '#bbf7d0' : r?.etapa === 'erro' ? '#fecaca' : r?.etapa === 'corrigindo' ? '#bfdbfe' : '#e2e8f0'}`,
                  color: r?.etapa === 'corrigido' ? '#15803d' : r?.etapa === 'erro' ? '#b91c1c' : r?.etapa === 'corrigindo' ? '#1d4ed8' : '#374151',
                }}>
                  {r?.etapa === 'corrigido' ? '✅' : r?.etapa === 'erro' ? '❌' : r?.etapa === 'corrigindo' ? '⏳' : '🌐'}
                  {s.nome}
                  {r?.resultados?.length > 0 && <span style={{ opacity: 0.7 }}>· {r.resultados.length} lote(s)</span>}
                </span>
              );
            })}
          </div>
          <button
            onClick={corrigirMulti}
            style={{ padding: '0.625rem 1.375rem', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', fontWeight: 700, fontSize: '0.875rem' }}
          >
            ⚡ Corrigir Todos os Sites Selecionados
          </button>

          {/* Resultados multi */}
          {Object.keys(resultadosMulti).length > 0 && (
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {sitesAtivos.filter(s => resultadosMulti[s.id]).map(s => {
                const r = resultadosMulti[s.id];
                return (
                  <div key={s.id} style={{ background: 'white', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a202c' }}>🌐 {s.nome}</span>
                      <span style={{ fontSize: '0.72rem', color: '#6366f1', fontFamily: 'monospace' }}>{s.url}</span>
                    </div>
                    {r.etapa === 'corrigindo' && <div style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#1d4ed8' }}>⏳ Processando...</div>}
                    {r.erro && <div style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#b91c1c' }}>❌ {r.erro}</div>}
                    {r.resultados?.map((res, i) => <CardLote key={i} resultado={res} baseUrl={s.url} />)}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Seletor de site (só mostra quando NÃO vem por prop global OU sem site) */}
      {!siteAtivo && (
        <SeletorSite
          urlSelecionada={urlBase}
          onSelecionar={handleSelecionar}
        />
      )}

      {/* ── Banner do site ativo (vindo do contexto global) ────────── */}
      {siteAtivo && (
        <div style={{ background: '#f0f4ff', border: '1.5px solid #c7d2fe', borderRadius: '12px', padding: '0.875rem 1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '1.1rem' }}>🌐</span>
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#3730a3' }}>{siteAtivo.nome}</span>
            <span style={{ fontSize: '0.78rem', color: '#6b7280', marginLeft: '0.5rem' }}>({siteAtivo.tipo} · {siteAtivo.estado})</span>
            <div style={{ fontSize: '0.75rem', color: '#6366f1', fontFamily: 'monospace', marginTop: '0.15rem' }}>{siteAtivo.url}</div>
          </div>
          <a href={`${siteAtivo.url}/loteexportacao`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.78rem', color: '#6366f1', textDecoration: 'none', padding: '0.3rem 0.625rem', border: '1px solid #c7d2fe', borderRadius: '8px', background: 'white' }}>
            🔗 Abrir lotes
          </a>
          <button onClick={() => setSiteSelecionado(null)} style={{ fontSize: '0.72rem', padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', color: '#6b7280' }}>
            Trocar site
          </button>
        </div>
      )}

      {/* ── Seletor manual quando clica "Trocar site" ─────────────── */}
      {siteAtivo && !siteSelecionado && (
        <SeletorSite
          urlSelecionada={urlBase}
          onSelecionar={handleSelecionar}
        />
      )}

      {/* ── Credenciais ────────────────────────────────────────────── */}
      {urlBase && (
        <div style={{ background: 'white', borderRadius: '12px', border: '1.5px solid #e2e8f0', padding: '1rem 1.25rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1a202c', marginBottom: '0.75rem' }}>🔑 Credenciais de Acesso</div>
          <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>Login / E-mail</label>
              <input
                value={credLogin}
                onChange={e => setCredLogin(e.target.value)}
                placeholder="admin ou email@..."
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>Senha</label>
              <input
                type="password"
                value={credSenha}
                onChange={e => setCredSenha(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Ações ──────────────────────────────────────────────────── */}
      {urlBase && (
        <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={analisar}
            disabled={!podeContinuar || carregando}
            style={{
              padding: '0.625rem 1.375rem', borderRadius: '10px', border: 'none', cursor: podeContinuar && !carregando ? 'pointer' : 'not-allowed',
              background: podeContinuar && !carregando ? 'linear-gradient(135deg, #0284c7, #0ea5e9)' : '#e2e8f0',
              color: podeContinuar && !carregando ? 'white' : '#9ca3af', fontWeight: 700, fontSize: '0.875rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}
          >
            {etapa === 'analisando' ? '⏳ Analisando...' : '🔍 Analisar Lotes com Erro'}
          </button>

          <button
            onClick={corrigir}
            disabled={!podeContinuar || carregando}
            style={{
              padding: '0.625rem 1.375rem', borderRadius: '10px', border: 'none', cursor: podeContinuar && !carregando ? 'pointer' : 'not-allowed',
              background: podeContinuar && !carregando ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#e2e8f0',
              color: podeContinuar && !carregando ? 'white' : '#9ca3af', fontWeight: 700, fontSize: '0.875rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}
          >
            {etapa === 'corrigindo' ? '⏳ Corrigindo...' : '⚡ Corrigir Automaticamente'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              value={idLoteFiltro}
              onChange={e => setIdLoteFiltro(e.target.value)}
              placeholder="Nº lote específico (opcional)"
              style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.82rem', outline: 'none', width: '200px' }}
            />
          </div>

          {(etapa !== 'idle' && etapa !== 'analisando' && etapa !== 'corrigindo') && (
            <button
              onClick={resetar}
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: 'white', color: '#374151', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}
            >
              🔄 Reiniciar
            </button>
          )}

          <a
            href={`${urlBase}/loteexportacao`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1.5px solid #6366f133', background: '#eff0fe', color: '#6366f1', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600 }}
          >
            🔗 Abrir no Sistema
          </a>
        </div>
      )}

      {/* ── Erro ───────────────────────────────────────────────────── */}
      {etapa === 'erro' && erroMsg && (
        <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '10px', padding: '1rem 1.25rem', color: '#b91c1c', fontSize: '0.85rem' }}>
          ❌ <strong>Erro:</strong> {erroMsg}
        </div>
      )}

      {/* ── Screenshot da lista de lotes ───────────────────────────── */}
      {screenshotLista && (
        <div style={{ background: 'white', borderRadius: '12px', border: '1.5px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: '0.875rem', color: '#1a202c' }}>
            📸 Captura de Tela — Lista de Lotes
          </div>
          <img
            src={`data:image/png;base64,${screenshotLista}`}
            alt="Screenshot lotes"
            style={{ width: '100%', display: 'block' }}
          />
        </div>
      )}

      {/* ── Resultado da análise ────────────────────────────────────── */}
      {etapa === 'analisado' && (
        <div style={{ background: 'white', borderRadius: '12px', border: '1.5px solid #e2e8f0', padding: '1rem 1.25rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1a202c', marginBottom: '0.75rem' }}>
            📋 Lotes com Erro — {lotes.length} encontrado(s)
          </div>
          {!lotes.length && (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>
              ✅ Nenhum lote com erro encontrado! O sistema está correto.
            </div>
          )}
          {lotes.map((l, i) => (
            <div key={i} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.625rem 0.875rem', marginBottom: '0.5rem', fontSize: '0.82rem', color: '#374151', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span>❌</span>
              <span><strong>Lote #{l.idLote}</strong></span>
              <span style={{ color: '#9ca3af' }}>—</span>
              <span>{l.textos?.join(' · ')?.slice(0, 120)}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Resultado da correção ───────────────────────────────────── */}
      {(etapa === 'corrigido' || etapa === 'corrigindo') && passos.length > 0 && (
        <div style={{ background: 'white', borderRadius: '12px', border: '1.5px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: '0.875rem', color: '#1a202c', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            📡 Log de Execução
            {etapa === 'corrigindo' && <span style={{ background: '#fde68a', color: '#92400e', borderRadius: '20px', padding: '0.1rem 0.5rem', fontSize: '0.72rem', fontWeight: 700 }}>EM ANDAMENTO...</span>}
          </div>
          <div style={{ padding: '1rem 1.25rem' }}>
            <LogPassos passos={passos} />
          </div>
        </div>
      )}

      {etapa === 'corrigido' && resultados.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a202c' }}>
            ✅ Resultados — {resultados.length} lote(s) processado(s)
          </div>
          {resultados.map((r, i) => (
            <CardLote key={i} resultado={r} baseUrl={urlBase} />
          ))}
        </div>
      )}


    </div>
  );
}
