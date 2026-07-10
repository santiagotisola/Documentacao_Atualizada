import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '../../../components/common';
import { scoreColor } from '../../../utils/siteUtils';

/* ═══════════════════════════════════════════════════════════════════
   Aba: Lista Geral — Tabela Completa com Auditoria de Monitoramento
   ═══════════════════════════════════════════════════════════════════ */

// Helpers para extrair campos de auditoria
const getCadastro = (eq) => typeof eq === 'object' ? (eq?.total ?? null) : (eq ?? null);
const getDashboard = (eq) => typeof eq === 'object' ? (eq?.monitorados ?? null) : null;
const getDesab = (eq) => typeof eq === 'object' ? (eq?.desabMonitoramento ?? null) : null;
const getDiferenca = (eq) => {
  const c = getCadastro(eq);
  const d = getDashboard(eq);
  return c !== null && d !== null ? c - d : null;
};

function PopupAuditoria({ popup, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  if (!popup) return null;
  const { site, type, anchorRect } = popup;
  const eq = site.equipamentos || {};

  const style = {
    position: 'fixed',
    top: Math.min(anchorRect.bottom + 4, window.innerHeight - 280),
    left: Math.max(0, Math.min(anchorRect.left, window.innerWidth - 300)),
    width: 280,
    background: 'var(--cs-background)',
    border: '1px solid var(--cs-border)',
    borderRadius: 10,
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    zIndex: 9999,
    padding: '14px 16px',
    fontSize: '0.8125rem',
  };

  if (type === 'dashboard') {
    return (
      <div ref={ref} style={style}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <strong style={{ color:'var(--cs-text-primary)' }}>📡 Resumo Monitoramento</strong>
          <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--cs-text-secondary)',fontSize:16 }}>×</button>
        </div>
        <div style={{ color:'var(--cs-text-secondary)', fontSize:'0.75rem', marginBottom:8 }}>{site.nome} · {site.dataVerificacao || eq.dataVerificacao || '—'}</div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <tbody>
            {[
              ['Cadastro Operações', eq.total, '#94a3b8'],
              ['Dashboard (monitorados)', eq.monitorados, '#3b82f6'],
              ['🟢 Online', eq.online, '#22c55e'],
              ['🟡 Offline < 1h', eq.offline_menos1h, '#f59e0b'],
              ['🔴 Offline > 1h', eq.offline_mais1h, '#ef4444'],
              ['💀 Offline > 30 dias', eq.offline_mais30dias, '#6b7280'],
              ['Desab. Monitoramento', eq.desabMonitoramento, '#a78bfa'],
            ].map(([label, val, color]) => val != null ? (
              <tr key={label}>
                <td style={{ padding:'3px 0', color:'var(--cs-text-secondary)' }}>{label}</td>
                <td style={{ padding:'3px 0', textAlign:'right', fontWeight:700, color }}>{val}</td>
              </tr>
            ) : null)}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === 'diferenca') {
    const detalhes     = eq.diferenca_detalhes    || [];
    const equipamentos = eq.diferenca_equipamentos || [];
    const total  = getDiferenca(eq);
    const hasEq  = equipamentos.length > 0;

    const MOTIVO = {
      'OPERAÇÃO_EXPIRADA':        { label:'Op. Expirada',   cor:'#ef4444', bg:'rgba(239,68,68,0.1)'  },
      'TIPO_PESAGEM_ESTATÍSTICA': { label:'Pesagem Estat.', cor:'#6366f1', bg:'rgba(99,102,241,0.1)' },
      'HOMOLOGAÇÃO_PENDENTE':     { label:'Homolog. Pend.', cor:'#3b82f6', bg:'rgba(59,130,246,0.1)' },
      'TIPO_OCR':                 { label:'Tipo OCR',       cor:'#8b5cf6', bg:'rgba(139,92,246,0.1)' },
      'DESABILITAR_MONITORAMENTO':{ label:'Desabilitado',   cor:'#f59e0b', bg:'rgba(245,158,11,0.1)' },
    };

    const popW     = hasEq ? 950 : 280;
    const popStyle = {
      ...style,
      width: popW,
      left: Math.max(8, Math.min(anchorRect.left, window.innerWidth - popW - 8)),
      top:  Math.min(anchorRect.bottom + 4, window.innerHeight - (hasEq ? 460 : 280)),
    };

    return (
      <div ref={ref} style={popStyle}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <strong style={{ color:'var(--cs-text-primary)' }}>⚖️ Diferença Cadastro × Dashboard</strong>
          <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--cs-text-secondary)',fontSize:16 }}>×</button>
        </div>
        <div style={{ color:'var(--cs-text-secondary)', fontSize:'0.75rem', marginBottom:8 }}>
          {site.nome} — <strong style={{ color:'var(--cs-text-primary)' }}>{total ?? '?'}</strong> equipamento{total !== 1 ? 's' : ''} fora do dashboard
        </div>

        {detalhes.length > 0 && (
          <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom: hasEq ? 10 : 0 }}>
            {detalhes.map((d, i) => {
              const cor = d.tipo === 'critico' ? '#ef4444' : d.tipo === 'atencao' ? '#f59e0b' : '#3b82f6';
              const bg  = d.tipo === 'critico' ? 'rgba(239,68,68,0.1)' : d.tipo === 'atencao' ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.08)';
              return (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:5, background:bg, borderRadius:5, padding:'3px 7px', borderLeft:`3px solid ${cor}`, fontSize:'0.73rem' }}>
                  <span style={{ fontWeight:700, color:cor }}>{d.quantidade}×</span>
                  <span style={{ color:'var(--cs-text-secondary)' }}>{d.motivo}</span>
                </div>
              );
            })}
          </div>
        )}

        {hasEq && (
          <>
            <div style={{ borderTop:'1px solid var(--cs-border)', margin:'2px 0 8px' }} />
            <div style={{ display:'grid', gridTemplateColumns:'82px 90px 140px 118px 1fr', gap:'0 8px', padding:'0 2px 4px', borderBottom:'1px solid var(--cs-border)', marginBottom:4 }}>
              {['Código','Homologação','Desabilitar Monitoramento','Regra','Como Corrigir'].map(h => (
                <span key={h} style={{ fontSize:'0.68rem', color:'var(--cs-text-secondary)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em' }}>{h}</span>
              ))}
            </div>
            <div style={{ maxHeight:340, overflowY:'auto', display:'flex', flexDirection:'column', gap:1 }}>
              {equipamentos.map((e, i) => {
                const m = MOTIVO[e.motivo] || { label:e.motivo, cor:'#94a3b8', bg:'rgba(148,163,184,0.1)' };
                return (
                  <div key={e.cod} style={{ display:'grid', gridTemplateColumns:'82px 90px 140px 118px 1fr', gap:'0 8px', padding:'4px 2px', borderRadius:4, background: i % 2 === 0 ? 'rgba(0,0,0,0.025)' : 'transparent', alignItems:'start' }}>
                    <div>
                      <div style={{ fontWeight:700, color:'var(--cs-text-primary)', fontSize:'0.8rem', fontFamily:'monospace' }}>{e.cod}</div>
                      <div style={{ color:'var(--cs-text-secondary)', fontSize:'0.67rem' }}>{e.fab}</div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', marginTop:2 }}>
                      {e.homologacao ? (
                        <span style={{ color:'#3b82f6', fontWeight:700, fontSize:'0.7rem', background:'rgba(59,130,246,0.1)', padding:'2px 7px', borderRadius:4, border:'1px solid rgba(59,130,246,0.3)' }}>✓ Sim</span>
                      ) : e.homologacao === false ? (
                        <span style={{ color:'#94a3b8', fontSize:'0.7rem' }}>Não</span>
                      ) : (
                        <span style={{ color:'#94a3b8', fontSize:'0.7rem' }}>—</span>
                      )}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', marginTop:2 }}>
                      {e.motivo === 'DESABILITAR_MONITORAMENTO' ? (
                        <span style={{ color:'#f59e0b', fontWeight:700, fontSize:'0.7rem', background:'rgba(245,158,11,0.1)', padding:'2px 7px', borderRadius:4, border:'1px solid rgba(245,158,11,0.3)' }}>✓ Sim</span>
                      ) : (
                        <span style={{ color:'#94a3b8', fontSize:'0.7rem' }}>Não</span>
                      )}
                    </div>
                    <span style={{ display:'inline-block', background:m.bg, color:m.cor, borderRadius:4, padding:'1px 6px', fontSize:'0.69rem', fontWeight:700, whiteSpace:'nowrap', border:`1px solid ${m.cor}33`, marginTop:2 }}>{m.label}</span>
                    <div style={{ color:'var(--cs-text-secondary)', fontSize:'0.71rem', lineHeight:1.45, paddingTop:2 }}>{e.correcao}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {!hasEq && detalhes.length === 0 && (
          <p style={{ color:'var(--cs-text-secondary)', textAlign:'center', padding:'8px 0' }}>Sem detalhes disponíveis</p>
        )}
      </div>
    );
  }

  return null;
}

function ListaGeral({ todosSites, sitesComScore, filtros, setFiltros, navegarParaDetalhe }) {
  const [ordenacao, setOrdenacao] = useState({ campo: 'nome', direcao: 'asc' });
  const [popup, setPopup] = useState(null);

  // Usar sitesComScore (com healthScore + chamados) se disponível, senão todosSites
  const dadosBase = sitesComScore || todosSites;

  // Estados únicos para filtro
  const estados = [...new Set(todosSites.map(s => s.estado).filter(Boolean))].sort();

  // Filtrar sites
  let sitesFiltrados = dadosBase.filter(site => {
    if (filtros.sistema !== 'todos' && site.sistema !== filtros.sistema) return false;
    if (filtros.status !== 'todos' && site.status !== filtros.status) return false;
    if (filtros.estado && filtros.estado !== 'todos' && site.estado !== filtros.estado) return false;
    if (filtros.busca) {
      const busca = filtros.busca.toLowerCase();
      return site.nome.toLowerCase().includes(busca) || 
             site.estado?.toLowerCase().includes(busca);
    }
    return true;
  });

  // Ordenar
  sitesFiltrados = [...sitesFiltrados].sort((a, b) => {
    let valorA = a[ordenacao.campo];
    let valorB = b[ordenacao.campo];

    if (ordenacao.campo === 'cadastro')   { valorA = getCadastro(a.equipamentos); valorB = getCadastro(b.equipamentos); }
    if (ordenacao.campo === 'dashboard')  { valorA = getDashboard(a.equipamentos); valorB = getDashboard(b.equipamentos); }
    if (ordenacao.campo === 'diferenca')  { valorA = getDiferenca(a.equipamentos); valorB = getDiferenca(b.equipamentos); }
    if (ordenacao.campo === 'chamados')   { valorA = a.chamados?.abertos ?? 0; valorB = b.chamados?.abertos ?? 0; }

    if (valorA == null) valorA = -1;
    if (valorB == null) valorB = -1;

    if (typeof valorA === 'number' && typeof valorB === 'number') {
      return ordenacao.direcao === 'asc' ? valorA - valorB : valorB - valorA;
    }
    const strA = String(valorA).toLowerCase();
    const strB = String(valorB).toLowerCase();
    return ordenacao.direcao === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
  });

  const handleOrdenar = (campo) => {
    setOrdenacao(prev => ({
      campo,
      direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc'
    }));
  };

  const openPopup = (e, site, type) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setPopup({ site, type, anchorRect: rect });
  };

  const Th = ({ campo, children, center }) => (
    <th onClick={() => handleOrdenar(campo)} style={{ cursor: 'pointer', textAlign: center ? 'center' : 'left' }}>
      {children} {ordenacao.campo === campo && (ordenacao.direcao === 'asc' ? '↑' : '↓')}
    </th>
  );

  return (
    <div>
      <PopupAuditoria popup={popup} onClose={() => setPopup(null)} />

      {/* Filtros */}
      <div className="cs-filtros">
        <div className="cs-filtro-item">
          <label>Sistema</label>
          <select value={filtros.sistema} onChange={(e) => setFiltros({...filtros, sistema: e.target.value})}>
            <option value="todos">Todos</option>
            <option value="AxHub">AxHub</option>
            <option value="AxCross">AxCross</option>
          </select>
        </div>
        <div className="cs-filtro-item">
          <label>Status</label>
          <select value={filtros.status} onChange={(e) => setFiltros({...filtros, status: e.target.value})}>
            <option value="todos">Todos</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
        </div>
        <div className="cs-filtro-item">
          <label>Estado</label>
          <select value={filtros.estado || 'todos'} onChange={(e) => setFiltros({...filtros, estado: e.target.value})}>
            <option value="todos">Todos</option>
            {estados.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div className="cs-filtro-item">
          <label>Buscar</label>
          <input type="text" placeholder="Nome, estado..." value={filtros.busca} onChange={(e) => setFiltros({...filtros, busca: e.target.value})} />
        </div>
      </div>

      <p style={{ fontSize: '0.875rem', color: 'var(--cs-text-secondary)', marginBottom: '16px' }}>
        {sitesFiltrados.length} site{sitesFiltrados.length !== 1 ? 's' : ''} na lista
      </p>

      {/* Tabela */}
      <div className="cs-tabela-container">
        <table className="cs-tabela">
          <thead>
            <tr>
              <Th campo="nome">Site</Th>
              <Th campo="sistema">Sistema</Th>
              <Th campo="estado">UF</Th>
              <th>URL</th>
              <Th campo="versao">Versão</Th>
              <Th campo="cadastro" center>Cadastro</Th>
              <Th campo="dashboard" center>Dashboard</Th>
              <th style={{ textAlign: 'center' }}>Status Equip.</th>
              <Th campo="diferenca" center>Diferença</Th>
              <Th campo="ocr" center>OCR</Th>
              <Th campo="chamados" center>Chamados</Th>
              <Th campo="healthScore" center>Health</Th>
              <Th campo="status">Status</Th>
            </tr>
          </thead>
          <tbody>
            {sitesFiltrados.map(site => {
              const eq = site.equipamentos || {};
              const cadastro   = getCadastro(eq);
              const dashboard  = getDashboard(eq);
              const desab      = getDesab(eq);
              const diferenca  = getDiferenca(eq);
              const hasDiff    = diferenca !== null;
              const hasAudit   = dashboard !== null;
              const diffCritico  = eq.diferenca_detalhes?.some(d => d.tipo === 'critico');
              const diffAtencao  = eq.diferenca_detalhes?.some(d => d.tipo === 'atencao');
              const diffColor    = !hasDiff ? '#94a3b8' : diferenca === 0 ? '#22c55e' : diffCritico ? '#ef4444' : diffAtencao ? '#f59e0b' : '#3b82f6';

              return (
                <tr key={site.id} onClick={() => navegarParaDetalhe(site.id)}>

                  {/* Site */}
                  <td style={{ fontWeight: 600 }}>
                    {site.nome} <span style={{ color: 'var(--cs-text-secondary)', fontWeight: 400 }}>({site.sistema})</span>
                  </td>

                  {/* Sistema */}
                  <td>
                    <Badge variant={site.sistema === 'AxHub' ? 'primary' : 'warning'} size="sm">
                      {site.sistema}
                    </Badge>
                  </td>

                  {/* UF */}
                  <td>{site.estado || '—'}</td>

                  {/* URL */}
                  <td>
                    <a href={site.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                       style={{ color: 'var(--cs-primary)', textDecoration: 'none', fontSize: '0.8125rem' }}>
                      {(site.url || '').replace('https://', '').substring(0, 28)}…
                    </a>
                  </td>

                  {/* Versão */}
                  <td>{site.versao || '—'}</td>

                  {/* Cadastro */}
                  <td style={{ textAlign: 'center' }}>
                    <span title={eq._isLive ? `Dados ao vivo — ${eq._liveAt ? new Date(eq._liveAt).toLocaleTimeString('pt-BR') : ''}` : (eq.dataVerificacao ? `Verificado em ${eq.dataVerificacao}` : '')}>
                      {cadastro ?? '—'}
                      {eq._isLive && <sup style={{ fontSize: '0.6rem', color: '#3b82f6', marginLeft: 2 }}>⚡</sup>}
                      {!eq._isLive && eq.dataVerificacao && <sup style={{ fontSize: '0.6rem', color: '#22c55e', marginLeft: 2 }}>✓</sup>}
                    </span>
                  </td>

                  {/* Dashboard — clicável */}
                  <td style={{ textAlign: 'center' }}>
                    {hasAudit ? (
                      <button onClick={(e) => openPopup(e, site, 'dashboard')} className="cs-audit-btn cs-audit-btn--blue"
                        title="Ver detalhes de monitoramento">
                        {dashboard}
                      </button>
                    ) : <span style={{ color: 'var(--cs-text-secondary)' }}>—</span>}
                  </td>

                  {/* Status Equipamentos — mini pills */}
                  <td style={{ textAlign: 'center' }}>
                    {hasAudit && eq.online != null ? (
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <span className="cs-pill cs-pill--green" title="Online">🟢 {eq.online}</span>
                        {eq.offline_menos1h > 0 && <span className="cs-pill cs-pill--yellow" title="Offline &lt; 1h">🟡 {eq.offline_menos1h}</span>}
                        {eq.offline_mais1h > 0 && <span className="cs-pill cs-pill--red" title="Offline &gt; 1h">🔴 {eq.offline_mais1h}</span>}
                      </div>
                    ) : <span style={{ color: 'var(--cs-text-secondary)' }}>—</span>}
                  </td>

                  {/* Diferença — clicável */}
                  <td style={{ textAlign: 'center' }}>
                    {hasDiff ? (
                      <button onClick={(e) => openPopup(e, site, 'diferenca')} className="cs-audit-btn"
                        style={{ color: diffColor, borderColor: diffColor + '40', background: diffColor + '10' }}
                        title="Ver motivos da diferença">
                        {diferenca === 0 ? '✓ 0' : diferenca}
                        {(diffCritico || diffAtencao) && <sup style={{ fontSize: '0.6rem', marginLeft: 2 }}>{diffCritico ? '⚠' : '!'}</sup>}
                      </button>
                    ) : <span style={{ color: 'var(--cs-text-secondary)' }}>—</span>}
                  </td>

                  {/* OCR */}
                  <td style={{ textAlign: 'center', fontWeight: 600, color: site.ocr > 80 ? '#22c55e' : site.ocr > 60 ? '#f59e0b' : '#dc2626' }}>
                    {site.ocr ? `${site.ocr}%` : '—'}
                  </td>

                  {/* Chamados */}
                  <td style={{ textAlign: 'center' }}>
                    {site.chamados ? (
                      <span>
                        <span style={{ fontWeight: 700, color: site.chamados.abertos > 0 ? '#f87171' : '#94a3b8' }}>{site.chamados.abertos}</span>
                        {site.chamados.criticos > 0 && (
                          <span style={{ marginLeft: 4, padding: '1px 6px', background: '#7f1d1d', color: '#fca5a5', borderRadius: 8, fontSize: 10, fontWeight: 700 }}>
                            {site.chamados.criticos} crít.
                          </span>
                        )}
                      </span>
                    ) : '—'}
                  </td>

                  {/* Health */}
                  <td style={{ textAlign: 'center' }}>
                    {site.healthScore != null ? (
                      <span style={{ fontWeight: 700, color: scoreColor(site.healthScore) }}>{site.healthScore}%</span>
                    ) : '—'}
                  </td>

                  {/* Status */}
                  <td>
                    <Badge variant={site.status === 'ativo' ? 'success' : 'default'} size="sm">
                      {site.status === 'ativo' ? '● Ativo' : '● Inativo'}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sitesFiltrados.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--cs-text-secondary)' }}>
          <p style={{ fontSize: '1.125rem', marginBottom: '8px' }}>Nenhum site encontrado</p>
          <p style={{ fontSize: '0.875rem' }}>Tente ajustar os filtros</p>
        </div>
      )}
    </div>
  );
}

export default ListaGeral;
