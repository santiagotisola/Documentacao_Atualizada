import { useState, useMemo, useEffect } from 'react';
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

// ─── Seletor de Site ──────────────────────────────────────────────────────────
function SeletorSite({ urlSelecionada, onSelecionar }) {
  const [modo, setModo] = useState('tabela'); // 'tabela' | 'manual'
  const [filtro, setFiltro] = useState('');

  const sitesAxHub = useMemo(() =>
    ALL_CREDENCIAIS.filter(s => s.sistema === 'AxHub'),
    []
  );

  const filtrados = useMemo(() =>
    sitesAxHub.filter(s =>
      !filtro ||
      s.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      s.url.toLowerCase().includes(filtro.toLowerCase()) ||
      (s.estado || '').toLowerCase().includes(filtro.toLowerCase())
    ),
    [sitesAxHub, filtro]
  );

  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '1.5px solid #e2e8f0', overflow: 'hidden' }}>
      {/* Cabeçalho */}
      <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <span style={{ fontSize: '1rem' }}>🌐</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1a202c' }}>Selecionar Contrato / Site</div>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Escolha na tabela ou informe a URL manualmente</div>
        </div>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          <button
            onClick={() => setModo('tabela')}
            style={{ padding: '0.3rem 0.75rem', borderRadius: '8px', border: `1.5px solid ${modo === 'tabela' ? '#667eea' : '#e2e8f0'}`, background: modo === 'tabela' ? '#eff0fe' : 'white', color: modo === 'tabela' ? '#667eea' : '#374151', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
          >
            📋 Tabela
          </button>
          <button
            onClick={() => setModo('manual')}
            style={{ padding: '0.3rem 0.75rem', borderRadius: '8px', border: `1.5px solid ${modo === 'manual' ? '#667eea' : '#e2e8f0'}`, background: modo === 'manual' ? '#eff0fe' : 'white', color: modo === 'manual' ? '#667eea' : '#374151', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
          >
            ✏️ Manual
          </button>
        </div>
      </div>

      {/* Modo manual */}
      {modo === 'manual' && (
        <div style={{ padding: '1rem 1.25rem' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
            URL base do sistema AxHub (ex: https://goiania.axhub.axion.ws)
          </label>
          <input
            type="url"
            value={urlSelecionada || ''}
            onChange={e => onSelecionar({ url: e.target.value, login: '', senha: '' })}
            placeholder="https://..."
            style={{ width: '100%', padding: '0.5rem 0.875rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      )}

      {/* Modo tabela */}
      {modo === 'tabela' && (
        <div>
          <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #f1f5f9' }}>
            <input
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              placeholder="🔍 Filtrar por nome, URL ou estado..."
              style={{ width: '100%', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box', background: '#f8fafc' }}
            />
          </div>
          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', position: 'sticky', top: 0 }}>
                  {['Nome', 'URL', 'Estado', 'Tipo', ''].map(h => (
                    <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 700, color: '#374151', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map(s => {
                  const selecionado = urlSelecionada === s.url;
                  return (
                    <tr
                      key={s.id}
                      onClick={() => onSelecionar(s)}
                      style={{
                        cursor: 'pointer',
                        background: selecionado ? '#eff0fe' : 'transparent',
                        borderLeft: selecionado ? '3px solid #667eea' : '3px solid transparent',
                        transition: 'background 0.1s',
                      }}
                    >
                      <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: '#1a202c' }}>{s.nome}</td>
                      <td style={{ padding: '0.5rem 0.75rem', color: '#6366f1', fontFamily: 'monospace' }}>{s.url}</td>
                      <td style={{ padding: '0.5rem 0.75rem', color: '#6b7280' }}>{s.estado || '—'}</td>
                      <td style={{ padding: '0.5rem 0.75rem', color: '#6b7280' }}>{s.tipo}</td>
                      <td style={{ padding: '0.5rem 0.75rem' }}>
                        {selecionado && <span style={{ background: '#667eea', color: 'white', borderRadius: '4px', padding: '0.15rem 0.4rem', fontSize: '0.65rem', fontWeight: 700 }}>SELECIONADO</span>}
                      </td>
                    </tr>
                  );
                })}
                {!filtrados.length && (
                  <tr><td colSpan={5} style={{ padding: '1.5rem', textAlign: 'center', color: '#9ca3af' }}>Nenhum site encontrado</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Site selecionado */}
      {urlSelecionada && (
        <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #f1f5f9', background: '#f0fdf4', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem' }}>✅</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#15803d' }}>Selecionado:</span>
          <a href={urlSelecionada} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#6366f1', fontFamily: 'monospace' }}>{urlSelecionada}</a>
        </div>
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

      {/* ── Guia manual ────────────────────────────────────────────── */}
      {etapa === 'idle' && !urlBase && (
        <div style={{ background: 'white', borderRadius: '12px', border: '1.5px solid #e2e8f0', padding: '1.5rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a202c', marginBottom: '1rem' }}>📖 Como funciona a correção automática</div>
          {[
            { n: '1', titulo: 'Selecionar o site', desc: 'Escolha o contrato AxHub na tabela acima ou informe a URL manualmente.' },
            { n: '2', titulo: 'Analisar lotes com erro', desc: 'O sistema acessa /loteexportacao, faz login e lista todos os lotes com status "Erro".' },
            { n: '3', titulo: 'Correção automática', desc: 'Para cada lote em erro: abre o detalhe, lê a mensagem de erro, identifica as infrações com problema.' },
            { n: '4', titulo: 'Consultar Dados', desc: 'Para cada infração com problema, acessa o detalhamento e clica em "Consultar Dados" para buscar os dados do veículo no SERPRO.' },
            { n: '5', titulo: 'Nova exportação', desc: 'Após a correção, volte ao sistema e gere uma nova exportação para o lote corrigido.' },
          ].map(p => (
            <div key={p.n} style={{ display: 'flex', gap: '0.875rem', marginBottom: '0.875rem', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', fontWeight: 800, fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{p.n}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a202c' }}>{p.titulo}</div>
                <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.15rem' }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
