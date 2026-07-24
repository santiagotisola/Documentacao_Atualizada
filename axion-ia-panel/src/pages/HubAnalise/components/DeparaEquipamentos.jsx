/**
 * DeparaEquipamentos.jsx
 * Compara equipamentos AxHub × AxCross para o mesmo contrato.
 * UI: seletor via botão de pesquisa (não tabela inline).
 */
import { useState, useMemo, useEffect, useRef } from 'react';
import { CREDENCIAIS_AXHUB, CREDENCIAIS_AXCROSS } from '../../../data/sitesCredentials';

const API = '/api/depara-equipamentos';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function listarPares() {
  return CREDENCIAIS_AXHUB.map(hub => {
    const cross = CREDENCIAIS_AXCROSS.find(c => c.nome.toLowerCase() === hub.nome.toLowerCase());
    return cross ? { nome: hub.nome, hub, cross } : null;
  }).filter(Boolean);
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ tipo, label }) {
  const cfg = {
    ambos: { bg: '#f0fdf4', border: '#bbf7d0', cor: '#15803d', icon: '✅' },
    hub:   { bg: '#eff6ff', border: '#bfdbfe', cor: '#1d4ed8', icon: '🔵' },
    cross: { bg: '#fdf4ff', border: '#e9d5ff', cor: '#7c3aed', icon: '🟣' },
    erro:  { bg: '#fef2f2', border: '#fecaca', cor: '#b91c1c', icon: '❌' },
  };
  const c = cfg[tipo] || cfg.ambos;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:'0.25rem', padding:'0.15rem 0.5rem', borderRadius:'20px', fontSize:'0.7rem', fontWeight:700, background:c.bg, border:`1px solid ${c.border}`, color:c.cor }}>
      {c.icon} {label}
    </span>
  );
}

// ─── Card resultado ───────────────────────────────────────────────────────────
function CardResultado({ resultado }) {
  const [expandido, setExpandido] = useState(true);
  const [aba, setAba] = useState('depara');
  const [busca, setBusca] = useState('');
  const { nome, axhubUrl, axcrossUrl, totais, emAmbos, apenasHub, apenasCross, passos, erro } = resultado;
  const filtrar = (lista) => !busca ? lista : lista.filter(e =>
    e.codigo?.toLowerCase().includes(busca.toLowerCase()) || e.descricao?.toLowerCase().includes(busca.toLowerCase())
  );
  const corBorda = erro ? '#fecaca' : (apenasHub?.length || apenasCross?.length) ? '#fde68a' : '#bbf7d0';

  return (
    <div style={{ background:'white', borderRadius:'14px', border:`1.5px solid ${corBorda}`, overflow:'hidden' }}>
      <div style={{ padding:'1rem 1.25rem', cursor:'pointer', display:'flex', gap:'0.875rem', alignItems:'center' }} onClick={() => setExpandido(v => !v)}>
        <div style={{ width:'40px', height:'40px', borderRadius:'10px', flexShrink:0, background: erro ? '#fef2f2' : 'linear-gradient(135deg,#1d4ed8,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.25rem' }}>
          {erro ? '❌' : (apenasHub?.length || apenasCross?.length) ? '⚠️' : '✅'}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:800, fontSize:'0.95rem', color:'#1a202c' }}>{nome}</div>
          {!erro && totais && (
            <div style={{ display:'flex', gap:'0.4rem', marginTop:'0.25rem', flexWrap:'wrap' }}>
              <Badge tipo="hub"   label={`AxHub: ${totais.axhub}`} />
              <Badge tipo="cross" label={`AxCross: ${totais.axcross}`} />
              <Badge tipo="ambos" label={`Ambos: ${totais.emAmbos}`} />
              {totais.apenasHub   > 0 && <Badge tipo="hub"   label={`Só AxHub: ${totais.apenasHub}`} />}
              {totais.apenasCross > 0 && <Badge tipo="cross" label={`Só AxCross: ${totais.apenasCross}`} />}
            </div>
          )}
          {erro && <div style={{ fontSize:'0.78rem', color:'#b91c1c', marginTop:'0.2rem' }}>Erro: {erro}</div>}
        </div>
        <div style={{ display:'flex', gap:'0.4rem', flexShrink:0 }}>
          {axhubUrl && <a href={`${axhubUrl}/operacao`} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{ fontSize:'0.72rem', color:'#1d4ed8', padding:'0.2rem 0.5rem', border:'1px solid #bfdbfe', borderRadius:'6px', textDecoration:'none', background:'#eff6ff' }}>AxHub ↗</a>}
          {axcrossUrl && <a href={`${axcrossUrl}/equipments/equipment/equipment`} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{ fontSize:'0.72rem', color:'#7c3aed', padding:'0.2rem 0.5rem', border:'1px solid #e9d5ff', borderRadius:'6px', textDecoration:'none', background:'#fdf4ff' }}>AxCross ↗</a>}
          <span style={{ color:'#9ca3af', fontSize:'0.65rem' }}>{expandido ? '▲' : '▼'}</span>
        </div>
      </div>

      {expandido && !erro && totais && (
        <div style={{ borderTop:'1px solid #f1f5f9' }}>
          <div style={{ display:'flex', borderBottom:'1px solid #f1f5f9', background:'#f8fafc' }}>
            {[
              { id:'depara', label:'🔄 Depara',     count: (apenasHub?.length||0)+(apenasCross?.length||0) },
              { id:'hub',    label:'🔵 Só AxHub',   count: apenasHub?.length },
              { id:'cross',  label:'🟣 Só AxCross', count: apenasCross?.length },
              { id:'ambos',  label:'✅ Em ambos',    count: emAmbos?.length },
              { id:'log',    label:'📡 Log',         count: null },
            ].map(t => (
              <button key={t.id} onClick={() => setAba(t.id)} style={{ padding:'0.6rem 1rem', border:'none', background:'transparent', cursor:'pointer', fontSize:'0.78rem', fontWeight: aba===t.id ? 700 : 500, color: aba===t.id ? '#667eea' : '#6b7280', borderBottom: aba===t.id ? '2px solid #667eea' : '2px solid transparent', display:'flex', alignItems:'center', gap:'0.3rem' }}>
                {t.label}
                {t.count > 0 && <span style={{ background:'#fde68a', color:'#374151', borderRadius:'20px', padding:'0 0.4rem', fontSize:'0.65rem', fontWeight:800 }}>{t.count}</span>}
              </button>
            ))}
          </div>
          <div style={{ padding:'1rem 1.25rem' }}>
            {aba !== 'log' && (
              <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="🔍 Filtrar..." style={{ width:'100%', padding:'0.4rem 0.75rem', borderRadius:'8px', border:'1px solid #e2e8f0', fontSize:'0.82rem', outline:'none', marginBottom:'0.875rem', boxSizing:'border-box', background:'#f8fafc' }} />
            )}
            {aba === 'depara' && (
              !apenasHub?.length && !apenasCross?.length
                ? <div style={{ padding:'2rem', textAlign:'center', color:'#15803d', fontWeight:600, fontSize:'0.875rem' }}>✅ Nenhuma divergência! Todos os {totais.emAmbos} equipamentos estão em ambos os sistemas.</div>
                : <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                    {[
                      { lista: apenasHub,   tipo:'hub',   titulo:`🔵 Só no AxHub`,    sub:'faltam no AxCross', bg:'#eff6ff', bd:'#bfdbfe', cor:'#1d4ed8', href:`${axhubUrl}/operacao`,                                      sistema:'AxHub'   },
                      { lista: apenasCross, tipo:'cross', titulo:`🟣 Só no AxCross`,  sub:'faltam no AxHub',   bg:'#fdf4ff', bd:'#e9d5ff', cor:'#7c3aed', href:`${axcrossUrl}/equipments/equipment/equipment`,               sistema:'AxCross' },
                    ].map(({ lista, titulo, sub, bg, bd, cor, href, sistema }) => (
                      <div key={titulo}>
                        <div style={{ fontWeight:700, fontSize:'0.8rem', color:cor, marginBottom:'0.5rem', display:'flex', gap:'0.5rem', alignItems:'center' }}>
                          <a href={href} target="_blank" rel="noopener noreferrer" style={{ color:cor, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'0.3rem' }}
                            title={`Abrir ${sistema} — ${href}`}>
                            {titulo} ({lista?.length || 0})
                            <span style={{ fontSize:'0.65rem', opacity:0.7 }}>↗</span>
                          </a>
                          <span style={{ fontSize:'0.65rem', color:'#6b7280', fontWeight:400 }}>— {sub}</span>
                        </div>
                        {!lista?.length
                          ? <div style={{ padding:'0.75rem', background:'#f0fdf4', borderRadius:'8px', fontSize:'0.78rem', color:'#15803d' }}>✅ Nenhum</div>
                          : <div style={{ maxHeight:'280px', overflowY:'auto' }}>
                              {filtrar(lista).map((e,i) => (
                                <div key={i} style={{ display:'flex', gap:'0.5rem', padding:'0.4rem 0.6rem', borderRadius:'6px', marginBottom:'0.25rem', background:bg, border:`1px solid ${bd}`, fontSize:'0.78rem' }}>
                                  <span style={{ fontWeight:700, color:cor, minWidth:'80px' }}>{e.codigo}</span>
                                  <span style={{ color:'#374151', flex:1 }}>{e.descricao}</span>
                                </div>
                              ))}
                            </div>}
                      </div>
                    ))}
                  </div>
            )}
            {(aba === 'hub' || aba === 'cross' || aba === 'ambos') && (() => {
              const lista   = aba==='hub' ? apenasHub : aba==='cross' ? apenasCross : emAmbos;
              const cor     = aba==='hub' ? '#1d4ed8' : aba==='cross' ? '#7c3aed' : '#15803d';
              const bgRow   = aba==='hub' ? '#eff6ff' : aba==='cross' ? '#fdf4ff' : '#f0fdf4';
              const linkUrl = aba==='hub'
                ? `${axhubUrl}/operacao`
                : aba==='cross'
                ? `${axcrossUrl}/equipments/equipment/equipment`
                : null;
              const sistNome = aba==='hub' ? 'AxHub' : aba==='cross' ? 'AxCross' : null;

              if (!lista?.length) return <div style={{ padding:'1.5rem', textAlign:'center', color:'#9ca3af' }}>Nenhum equipamento</div>;
              return (
                <div>
                  {linkUrl && (
                    <div style={{ marginBottom:'0.75rem', display:'flex', gap:'0.5rem', alignItems:'center' }}>
                      <a href={linkUrl} target="_blank" rel="noopener noreferrer"
                        style={{ display:'inline-flex', alignItems:'center', gap:'0.375rem', padding:'0.3rem 0.75rem', borderRadius:'8px', border:`1px solid ${cor}44`, background:`${cor}0d`, color:cor, textDecoration:'none', fontSize:'0.78rem', fontWeight:700 }}>
                        {aba==='hub' ? '🔵' : '🟣'} Abrir {sistNome} — {linkUrl} ↗
                      </a>
                    </div>
                  )}
                  <div style={{ maxHeight:'360px', overflowY:'auto' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.78rem' }}>
                      <thead><tr style={{ background:'#f8fafc', position:'sticky', top:0 }}>
                        {['Código','Descrição','Extra'].map(h => <th key={h} style={{ padding:'0.4rem 0.6rem', textAlign:'left', fontWeight:700, color:'#374151', borderBottom:'1px solid #e2e8f0' }}>{h}</th>)}
                      </tr></thead>
                      <tbody>{filtrar(lista).map((e,i) => (
                        <tr key={i} style={{ background: i%2===0 ? bgRow : 'white' }}>
                          <td style={{ padding:'0.4rem 0.6rem', fontWeight:700, color:cor }}>{e.codigo}</td>
                          <td style={{ padding:'0.4rem 0.6rem', color:'#374151' }}>{e.descricao||'—'}</td>
                          <td style={{ padding:'0.4rem 0.6rem', color:'#9ca3af', fontSize:'0.72rem' }}>{e.extra||'—'}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
            {aba === 'log' && passos?.length > 0 && (
              <div style={{ background:'#0f172a', borderRadius:'8px', padding:'0.875rem', maxHeight:'260px', overflowY:'auto', fontFamily:'monospace', fontSize:'0.75rem' }}>
                {passos.map((p,i) => (
                  <div key={i} style={{ display:'flex', gap:'0.5rem', marginBottom:'0.2rem' }}>
                    <span style={{ color:'#64748b', flexShrink:0 }}>{new Date(p.ts).toLocaleTimeString('pt-BR')}</span>
                    <span style={{ color: p.tipo==='erro' ? '#fca5a5' : p.tipo==='ok' ? '#86efac' : '#cbd5e1' }}>{p.msg}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Dropdown de pesquisa de contratos ────────────────────────────────────────
function PesquisaContratos({ onSelecionar, selecionados, onFechar }) {
  const [busca, setBusca] = useState('');
  const [abaAtiva, setAbaAtiva] = useState('pares'); // pares | axhub | axcross
  const [hubSelecionado, setHubSelecionado]     = useState(null);
  const [crossSelecionado, setCrossSelecionado] = useState(null);

  const pares  = useMemo(() => listarPares(), []);
  const todasHub   = CREDENCIAIS_AXHUB;
  const todasCross = CREDENCIAIS_AXCROSS;

  const filtrar = (lista) => !busca.trim() ? lista : lista.filter(s =>
    s?.nome?.toLowerCase()?.includes(busca.toLowerCase()) ||
    s?.url?.toLowerCase()?.includes(busca.toLowerCase()) ||
    (s?.estado||'').toLowerCase().includes(busca.toLowerCase()) ||
    (s?.tipo||'').toLowerCase().includes(busca.toLowerCase())
  );

  const paresFiltrados  = filtrar(pares);
  const hubFiltrados    = filtrar(todasHub);
  const crossFiltrados  = filtrar(todasCross);

  const jaTemPar = (nome) => selecionados.some(s => s.nome === nome);

  const handleAdicionarPar = (par) => {
    if (!jaTemPar(par.nome)) onSelecionar(par);
  };

  const handleAdicionarManual = () => {
    if (!hubSelecionado || !crossSelecionado) return;
    const par = {
      nome: `${hubSelecionado.nome} × ${crossSelecionado.nome}`,
      hub: hubSelecionado,
      cross: crossSelecionado,
    };
    onSelecionar(par);
    setHubSelecionado(null);
    setCrossSelecionado(null);
  };

  const abas = [
    { id:'pares',   label:`🔄 Pares`,    count: pares.length },
    { id:'axhub',   label:`🔵 AxHub`,    count: todasHub.length },
    { id:'axcross', label:`🟣 AxCross`,  count: todasCross.length },
  ];

  return (
    <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, zIndex:400, background:'white', borderRadius:'14px', border:'1.5px solid #e2e8f0', boxShadow:'0 16px 40px rgba(0,0,0,0.15)', width:'520px', overflow:'hidden' }}>
      {/* Cabeçalho */}
      <div style={{ padding:'0.75rem 1rem', borderBottom:'1px solid #f1f5f9', display:'flex', gap:'0.75rem', alignItems:'center' }}>
        <input
          autoFocus
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="🔍 Pesquisar por nome, URL, estado ou tipo..."
          style={{ flex:1, padding:'0.4rem 0.75rem', borderRadius:'8px', border:'1.5px solid #e2e8f0', fontSize:'0.82rem', outline:'none', background:'#f8fafc' }}
        />
        <button onClick={onFechar} style={{ padding:'0.3rem 0.625rem', borderRadius:'6px', border:'1px solid #e2e8f0', background:'white', cursor:'pointer', color:'#9ca3af', fontWeight:700, fontSize:'0.82rem' }}>✕</button>
      </div>

      {/* Abas */}
      <div style={{ display:'flex', borderBottom:'1px solid #f1f5f9', background:'#f8fafc' }}>
        {abas.map(a => (
          <button key={a.id} onClick={() => setAbaAtiva(a.id)} style={{ flex:1, padding:'0.55rem 0.5rem', border:'none', background:'transparent', cursor:'pointer', fontSize:'0.78rem', fontWeight: abaAtiva===a.id ? 700 : 500, color: abaAtiva===a.id ? '#667eea' : '#6b7280', borderBottom: abaAtiva===a.id ? '2px solid #667eea' : '2px solid transparent', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.3rem' }}>
            {a.label} <span style={{ background:'#f1f5f9', borderRadius:'20px', padding:'0 0.35rem', fontSize:'0.65rem', color:'#374151' }}>{a.count}</span>
          </button>
        ))}
      </div>

      {/* Lista de pares */}
      {abaAtiva === 'pares' && (
        <div style={{ maxHeight:'320px', overflowY:'auto' }}>
          {paresFiltrados.length === 0 && <div style={{ padding:'2rem', textAlign:'center', color:'#9ca3af', fontSize:'0.82rem' }}>Nenhum par encontrado</div>}
          {paresFiltrados.map(par => {
            const jaTem = jaTemPar(par.nome);
            return (
              <div key={par.nome} style={{ padding:'0.75rem 1rem', display:'flex', gap:'0.75rem', alignItems:'center', borderBottom:'1px solid #f8fafc', background: jaTem ? '#f5f3ff' : 'white', cursor: jaTem ? 'default' : 'pointer', transition:'background 0.1s' }}
                onClick={() => !jaTem && handleAdicionarPar(par)}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:'0.875rem', color:'#1a202c', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    {par.nome}
                    <span style={{ fontSize:'0.65rem', background:'#f3f4f6', color:'#6b7280', padding:'0.1rem 0.35rem', borderRadius:'4px' }}>{par.hub.estado} · {par.hub.tipo}</span>
                  </div>
                  <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.25rem', fontSize:'0.72rem' }}>
                    <span style={{ color:'#1d4ed8', fontFamily:'monospace' }}>🔵 {par.hub.url.replace('https://','')}</span>
                    <span style={{ color:'#7c3aed', fontFamily:'monospace' }}>🟣 {par.cross.url.replace('https://','')}</span>
                  </div>
                </div>
                {jaTem
                  ? <span style={{ fontSize:'0.72rem', background:'#ede9fe', color:'#7c3aed', borderRadius:'20px', padding:'0.15rem 0.5rem', fontWeight:700 }}>✓ Adicionado</span>
                  : <button style={{ padding:'0.3rem 0.75rem', borderRadius:'8px', border:'1px solid #e9d5ff', background:'#fdf4ff', color:'#7c3aed', fontWeight:700, fontSize:'0.75rem', cursor:'pointer' }}>+ Adicionar</button>}
              </div>
            );
          })}
        </div>
      )}

      {/* AxHub individual */}
      {abaAtiva === 'axhub' && (
        <>
          <div style={{ maxHeight:'220px', overflowY:'auto' }}>
            {hubFiltrados.map(s => {
              const sel = hubSelecionado?.id === s.id;
              return (
                <div key={s.id} onClick={() => setHubSelecionado(s)} style={{ padding:'0.6rem 1rem', display:'flex', gap:'0.75rem', alignItems:'center', cursor:'pointer', background: sel ? '#eff6ff' : 'white', borderLeft:`3px solid ${sel ? '#1d4ed8' : 'transparent'}`, transition:'background 0.1s', borderBottom:'1px solid #f8fafc' }}>
                  <div style={{ width:'14px', height:'14px', borderRadius:'50%', border:`2px solid ${sel ? '#1d4ed8' : '#d1d5db'}`, background: sel ? '#1d4ed8' : 'white', flexShrink:0 }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <span style={{ fontWeight:600, fontSize:'0.82rem', color:'#1a202c' }}>{s.nome}</span>
                    <span style={{ fontSize:'0.7rem', color:'#9ca3af', marginLeft:'0.375rem' }}>{s.estado} · {s.tipo}</span>
                  </div>
                  <span style={{ color:'#1d4ed8', fontFamily:'monospace', fontSize:'0.7rem' }}>{s.url.replace('https://','')}</span>
                </div>
              );
            })}
          </div>
          {hubSelecionado && (
            <div style={{ padding:'0.625rem 1rem', background:'#eff6ff', borderTop:'1px solid #bfdbfe', display:'flex', gap:'0.5rem', alignItems:'center', fontSize:'0.78rem' }}>
              <span style={{ flex:1, color:'#1d4ed8', fontWeight:600 }}>🔵 AxHub: {hubSelecionado.nome}</span>
              <span style={{ color:'#6b7280' }}>→ agora selecione o AxCross na aba 🟣</span>
              <button onClick={() => { setAbaAtiva('axcross'); setBusca(''); }} style={{ padding:'0.25rem 0.625rem', borderRadius:'6px', border:'1px solid #bfdbfe', background:'#1d4ed8', color:'white', cursor:'pointer', fontWeight:700, fontSize:'0.72rem' }}>Ir para AxCross →</button>
            </div>
          )}
        </>
      )}

      {/* AxCross individual */}
      {abaAtiva === 'axcross' && (
        <>
          <div style={{ maxHeight:'220px', overflowY:'auto' }}>
            {crossFiltrados.map(s => {
              const sel = crossSelecionado?.id === s.id;
              return (
                <div key={s.id} onClick={() => setCrossSelecionado(s)} style={{ padding:'0.6rem 1rem', display:'flex', gap:'0.75rem', alignItems:'center', cursor:'pointer', background: sel ? '#fdf4ff' : 'white', borderLeft:`3px solid ${sel ? '#7c3aed' : 'transparent'}`, transition:'background 0.1s', borderBottom:'1px solid #f8fafc' }}>
                  <div style={{ width:'14px', height:'14px', borderRadius:'50%', border:`2px solid ${sel ? '#7c3aed' : '#d1d5db'}`, background: sel ? '#7c3aed' : 'white', flexShrink:0 }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <span style={{ fontWeight:600, fontSize:'0.82rem', color:'#1a202c' }}>{s.nome}</span>
                    <span style={{ fontSize:'0.7rem', color:'#9ca3af', marginLeft:'0.375rem' }}>{s.estado} · {s.tipo}</span>
                  </div>
                  <span style={{ color:'#7c3aed', fontFamily:'monospace', fontSize:'0.7rem' }}>{s.url.replace('https://','')}</span>
                </div>
              );
            })}
          </div>
          {hubSelecionado && crossSelecionado && (
            <div style={{ padding:'0.75rem 1rem', background:'#f5f3ff', borderTop:'1px solid #e9d5ff', display:'flex', gap:'0.75rem', alignItems:'center' }}>
              <div style={{ flex:1, fontSize:'0.78rem' }}>
                <span style={{ color:'#1d4ed8', fontWeight:600 }}>🔵 {hubSelecionado.nome}</span>
                <span style={{ color:'#9ca3af', margin:'0 0.375rem' }}>×</span>
                <span style={{ color:'#7c3aed', fontWeight:600 }}>🟣 {crossSelecionado.nome}</span>
              </div>
              <button onClick={handleAdicionarManual} style={{ padding:'0.35rem 0.875rem', borderRadius:'8px', border:'none', background:'linear-gradient(135deg,#1d4ed8,#7c3aed)', color:'white', fontWeight:700, fontSize:'0.78rem', cursor:'pointer' }}>✓ Adicionar par</button>
            </div>
          )}
          {!hubSelecionado && (
            <div style={{ padding:'0.625rem 1rem', background:'#fffbeb', borderTop:'1px solid #fde68a', fontSize:'0.78rem', color:'#92400e' }}>
              ⚠️ Selecione primeiro um site AxHub na aba 🔵
              <button onClick={() => { setAbaAtiva('axhub'); setBusca(''); }} style={{ marginLeft:'0.75rem', padding:'0.2rem 0.5rem', borderRadius:'6px', border:'1px solid #fde68a', background:'#f59e0b', color:'white', cursor:'pointer', fontWeight:700, fontSize:'0.72rem' }}>← Ir para AxHub</button>
            </div>
          )}
        </>
      )}

      {/* Rodapé */}
      <div style={{ padding:'0.625rem 1rem', borderTop:'1px solid #f1f5f9', display:'flex', gap:'0.5rem', alignItems:'center', background:'#f8fafc' }}>
        <span style={{ fontSize:'0.72rem', color:'#9ca3af', flex:1 }}>
          {selecionados.length} par(es) selecionado(s) · Pares na aba 🔄 = auto-preenchidos · Abas 🔵🟣 = seleção manual
        </span>
        <button onClick={onFechar} style={{ padding:'0.35rem 0.875rem', borderRadius:'8px', border:'none', background:'linear-gradient(135deg,#667eea,#764ba2)', color:'white', fontWeight:700, fontSize:'0.78rem', cursor:'pointer' }}>
          {selecionados.length > 0 ? `Confirmar — ${selecionados.length} par(es)` : 'Fechar'}
        </button>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function DeparaEquipamentos({ siteAtivo = null, sitesAtivos = [] }) {
  const pares = useMemo(() => listarPares(), []);
  const [selecionados, setSelecionados]     = useState([]);
  const [pesquisaAberta, setPesquisaAberta] = useState(false);
  const [etapa, setEtapa]                   = useState('idle');
  const [resultados, setResultados]         = useState([]);
  const [erroMsg, setErroMsg]               = useState('');
  const [cookies, setCookies]               = useState({}); // { nomePar: cookieStr }
  const [mostrarCookies, setMostrarCookies] = useState(false);
  const searchRef                           = useRef(null);

  // Auto-seleciona pelo contexto global
  useEffect(() => {
    if (sitesAtivos.length > 0) {
      const novos = sitesAtivos
        .map(site => pares.find(p => p.nome.toLowerCase() === site.nome.toLowerCase()))
        .filter(Boolean)
        .filter(p => !selecionados.find(s => s.nome === p.nome));
      if (novos.length) setSelecionados(prev => [...prev, ...novos]);
    }
  }, [sitesAtivos.map(s => s.id).join(',')]);

  useEffect(() => {
    const close = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setPesquisaAberta(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const adicionarPar = (par) => { setSelecionados(prev => [...prev, par]); };
  const removerPar   = (nome) => setSelecionados(prev => prev.filter(s => s.nome !== nome));

  const executarDepara = async () => {
    if (!selecionados.length) return;
    setEtapa('executando');
    setResultados([]);
    setErroMsg('');
    try {
      const resultados = [];
      for (const s of selecionados) {
        // Tenta 1: dados do AxHub enviados pelo bookmarklet
        let axhubEquipamentos = null;
        const hubKey = s.hub.url.replace(/https?:\/\//, '').split('/')[0];
        try {
          const stored = await fetch(`/api/depara-equipamentos/hub-data/${hubKey}`);
          if (stored.ok) {
            const d = await stored.json();
            if (d.equipamentos?.length > 0) {
              axhubEquipamentos = d.equipamentos;
            }
          }
        } catch { /* bookmarklet não usado */ }

        // Tenta 2: busca CORS da sessão atual do browser
        // Usa parâmetros do Kendo Grid para buscar TODOS os itens (pageSize=100)
        if (!axhubEquipamentos) {
          try {
            const hubResp = await fetch(
              `${s.hub.url}/operacao/datahandler?pageSize=100&page=1&skip=0&take=100`,
              { credentials: 'include', headers: { 'X-Requested-With': 'XMLHttpRequest' }, mode: 'cors' }
            );
            if (hubResp.ok) {
              const hubData = await hubResp.json();
              const equips = (hubData.Data || []).map(e => ({
                codigo: e.Equipamento?.Descricao || '',
                grupo: e.GrupoEquipamento || '',
                fabricante: e.FabricanteNome || '',
              })).filter(e => e.codigo);
              if (equips.length > 0) axhubEquipamentos = equips;
            }
          } catch { /* CORS bloqueado */ }
        }

        let endpoint, body;
        if (axhubEquipamentos && axhubEquipamentos.length > 0) {
          // Usa lista pré-buscada (sem Playwright para AxHub)
          endpoint = `${API}/com-lista-hub`;
          body = {
            nome: s.nome,
            axhubUrl: s.hub.url,
            axhubEquipamentos,
            axcrossUrl:   s.cross.url, axcrossLogin: s.cross.login, axcrossSenha: s.cross.senha,
          };
        } else {
          // Fallback: Playwright + cookie se disponível
          endpoint = `${API}/multi`;
          body = {
            contratos: [{
              nome: s.nome,
              axhubUrl: s.hub.url, axhubLogin: s.hub.login, axhubSenha: s.hub.senha,
              axcrossUrl: s.cross.url, axcrossLogin: s.cross.login, axcrossSenha: s.cross.senha,
              ...(cookies[s.nome] ? { axhubCookie: cookies[s.nome] } : {}),
            }],
          };
        }

        const res  = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const text = await res.text();
        if (!text) throw new Error(`API retornou resposta vazia (HTTP ${res.status}).`);
        let data;
        try { data = JSON.parse(text); } catch { throw new Error(`Resposta inválida: ${text.substring(0, 100)}`); }
        if (!res.ok) throw new Error(data?.erro || `Erro HTTP ${res.status}`);

        // Normaliza resultado (multi retorna { resultados: [...] }, com-lista-hub retorna direto)
        const resultado = endpoint.includes('/multi') ? (data.resultados?.[0] || data) : data;
        resultados.push(resultado);
      }
      setResultados(resultados);
      setEtapa('concluido');
    } catch (err) {
      setErroMsg(err.message);
      setEtapa('erro');
    }
  };

  const carregando = etapa === 'executando';

  // ─── Captura em lote de todos os sites ──────────────────────────────────────
  const [capturandoTodos, setCapturandoTodos] = useState(false);
  const [resultadoCaptura, setResultadoCaptura] = useState(null);

  const capturarTodosOsSites = async () => {
    setCapturandoTodos(true);
    setResultadoCaptura(null);
    try {
      const sites = pares.map(p => ({
        nome:     p.nome,
        axhubUrl: p.hub.url,
        login:    p.hub.login,
        senha:    p.hub.senha,
      }));
      const res  = await fetch(`${API}/capturar-todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sites }),
      });
      const data = await res.json();
      setResultadoCaptura(data);
    } catch (err) {
      setResultadoCaptura({ erro: err.message });
    } finally {
      setCapturandoTodos(false);
    }
  };

  // Totais do resumo
  const totalHub    = resultados.reduce((s, r) => s + (r.totais?.axhub    || 0), 0);
  const totalCross  = resultados.reduce((s, r) => s + (r.totais?.axcross  || 0), 0);
  const totalAmbos  = resultados.reduce((s, r) => s + (r.totais?.emAmbos  || 0), 0);
  const totalSoHub  = resultados.reduce((s, r) => s + (r.totais?.apenasHub|| 0), 0);
  const totalSoCross= resultados.reduce((s, r) => s + (r.totais?.apenasCross||0), 0);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

      {/* Cabeçalho */}
      <div style={{ background:'linear-gradient(135deg,#1d4ed808,#7c3aed08)', border:'1.5px solid #c7d2fe', borderRadius:'12px', padding:'1.125rem 1.5rem' }}>
        <div style={{ display:'flex', gap:'0.875rem', alignItems:'flex-start' }}>
          <div style={{ fontSize:'1.75rem', flexShrink:0 }}>🔄</div>
          <div>
            <h2 style={{ margin:'0 0 0.375rem', fontSize:'1.05rem', fontWeight:800, color:'#1a202c' }}>Depara de Equipamentos — AxHub × AxCross</h2>
            <p style={{ margin:0, fontSize:'0.8rem', color:'#6b7280', lineHeight:1.65 }}>
              Compara equipamentos do <strong style={{ color:'#1d4ed8' }}>AxHub</strong> (<code>/operacao</code>) com os do{' '}
              <strong style={{ color:'#7c3aed' }}>AxCross</strong> (<code>/equipments/equipment/equipment</code>). Identifica divergências entre os dois sistemas.
            </p>
          </div>
        </div>
      </div>

      {/* ── Painel de Captura em Lote ─────────────────────────────── */}
      <div style={{ background:'white', borderRadius:'12px', border:'1.5px solid #e2e8f0', padding:'1rem 1.25rem' }}>
        <div style={{ display:'flex', gap:'0.875rem', alignItems:'center', flexWrap:'wrap' }}>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:'0.875rem', color:'#1a202c' }}>⚡ Captura em Lote — Todos os Sites</div>
            <div style={{ fontSize:'0.75rem', color:'#9ca3af', marginTop:'0.15rem' }}>
              Tenta login em todos os {pares.length} contratos AxHub e armazena os equipamentos para o depara.
              Funciona melhor quando o Chrome já tem sessões ativas.
            </div>
          </div>
          <button
            onClick={capturarTodosOsSites}
            disabled={capturandoTodos}
            style={{ padding:'0.5rem 1.25rem', borderRadius:'10px', border:'none', cursor: capturandoTodos ? 'not-allowed' : 'pointer', background: capturandoTodos ? '#e2e8f0' : 'linear-gradient(135deg,#0284c7,#0891b2)', color: capturandoTodos ? '#9ca3af' : 'white', fontWeight:700, fontSize:'0.82rem', flexShrink:0 }}
          >
            {capturandoTodos ? `⏳ Capturando ${pares.length} sites...` : `🔄 Capturar Todos (${pares.length} sites)`}
          </button>
        </div>

        {resultadoCaptura && (
          <div style={{ marginTop:'0.875rem', borderTop:'1px solid #f1f5f9', paddingTop:'0.875rem' }}>
            {resultadoCaptura.erro ? (
              <div style={{ color:'#b91c1c', fontSize:'0.8rem' }}>❌ {resultadoCaptura.erro}</div>
            ) : (
              <>
                <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', marginBottom:'0.625rem' }}>
                  <span style={{ fontSize:'0.8rem', fontWeight:700, color:'#15803d' }}>✅ {resultadoCaptura.sucesso} sites capturados</span>
                  {resultadoCaptura.falha > 0 && <span style={{ fontSize:'0.8rem', fontWeight:700, color:'#b91c1c' }}>❌ {resultadoCaptura.falha} falharam</span>}
                  <span style={{ fontSize:'0.75rem', color:'#9ca3af' }}>— selecione os contratos e clique "Executar Depara"</span>
                </div>
                <div style={{ display:'flex', gap:'0.375rem', flexWrap:'wrap' }}>
                  {resultadoCaptura.resultados?.map(r => (
                    <span key={r.nome} style={{ display:'inline-flex', alignItems:'center', gap:'0.25rem', padding:'0.2rem 0.5rem', borderRadius:'20px', fontSize:'0.72rem', fontWeight:600, background: r.ok ? '#f0fdf4' : '#fef2f2', border:`1px solid ${r.ok ? '#bbf7d0' : '#fecaca'}`, color: r.ok ? '#15803d' : '#b91c1c' }}>
                      {r.ok ? '✅' : '❌'} {r.nome} {r.ok ? `(${r.total})` : ''}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Seletor com botão de pesquisa */}
      <div style={{ background:'white', borderRadius:'12px', border:'1.5px solid #e2e8f0', padding:'1rem 1.25rem' }}>
        <div style={{ display:'flex', gap:'0.875rem', alignItems:'center', flexWrap:'wrap' }}>
          <div style={{ fontWeight:700, fontSize:'0.875rem', color:'#1a202c' }}>📋 Contratos para depara</div>

          {/* Botão pesquisar */}
          <div ref={searchRef} style={{ position:'relative' }}>
            <button
              onClick={() => setPesquisaAberta(v => !v)}
              style={{ padding:'0.5rem 1.125rem', borderRadius:'10px', border:`1.5px solid ${pesquisaAberta ? '#667eea' : '#e2e8f0'}`, background: pesquisaAberta ? '#f0f4ff' : '#f8fafc', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.82rem', fontWeight:600, color: pesquisaAberta ? '#667eea' : '#374151', transition:'all 0.15s' }}
            >
              🔍 Pesquisar contrato {pesquisaAberta ? '▲' : '▼'}
            </button>
            {pesquisaAberta && (
              <PesquisaContratos
                onSelecionar={adicionarPar}
                selecionados={selecionados}
                onFechar={() => setPesquisaAberta(false)}
              />
            )}
          </div>

          {selecionados.length > 0 && (
            <button onClick={() => setSelecionados([])} style={{ fontSize:'0.72rem', padding:'0.3rem 0.625rem', borderRadius:'6px', border:'1px solid #fecaca', background:'#fef2f2', cursor:'pointer', color:'#dc2626', fontWeight:700 }}>✕ Limpar</button>
          )}

          <span style={{ fontSize:'0.75rem', color:'#9ca3af', marginLeft:'auto' }}>
            {selecionados.length} par(es) · {pares.length} disponíveis com AxHub + AxCross
          </span>
        </div>

        {/* Chips dos selecionados */}
        {selecionados.length > 0 && (
          <div style={{ display:'flex', gap:'0.375rem', flexWrap:'wrap', marginTop:'0.75rem' }}>
            {selecionados.map(s => (
              <span key={s.nome} style={{ display:'inline-flex', alignItems:'center', gap:'0.375rem', padding:'0.3rem 0.75rem', borderRadius:'20px', background:'#f5f3ff', border:'1px solid #e9d5ff', fontSize:'0.78rem', fontWeight:600, color:'#7c3aed' }}>
                🔄 {s.nome}
                <span style={{ fontSize:'0.7rem', color:'#9ca3af', fontWeight:400 }}>
                  🔵{s.hub.nome} × 🟣{s.cross.nome}
                </span>
                <button onClick={() => removerPar(s.nome)} style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af', fontSize:'0.65rem', padding:'0', lineHeight:1 }}>✕</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bookmarklet + Cookie para AxHub com Turnstile */}
      {selecionados.length > 0 && (
        <div style={{ background:'white', borderRadius:'12px', border:'1.5px solid #e2e8f0', overflow:'hidden' }}>
          <div
            style={{ padding:'0.75rem 1.25rem', cursor:'pointer', display:'flex', gap:'0.5rem', alignItems:'center' }}
            onClick={() => setMostrarCookies(v => !v)}
          >
            <span style={{ fontSize:'0.9rem' }}>🔑</span>
            <div style={{ flex:1 }}>
              <span style={{ fontWeight:700, fontSize:'0.85rem', color:'#374151' }}>Dados do AxHub</span>
              <span style={{ fontSize:'0.75rem', color:'#9ca3af', marginLeft:'0.5rem' }}>
                Como fornecer os dados de equipamentos do AxHub (Cloudflare Turnstile)
              </span>
            </div>
            <span style={{ fontSize:'0.72rem', color:'#9ca3af', fontWeight:600 }}>
              {Object.keys(cookies).filter(k => cookies[k]).length > 0 ? '✅ cookie' : 'Clique para ver opções'}
            </span>
            <span style={{ color:'#9ca3af', fontSize:'0.65rem' }}>{mostrarCookies ? '▲' : '▼'}</span>
          </div>

          {mostrarCookies && (
            <div style={{ borderTop:'1px solid #f1f5f9', padding:'1rem 1.25rem', display:'flex', flexDirection:'column', gap:'1rem' }}>

              {/* Opção 1 — Bookmarklet (recomendado) */}
              <div style={{ background:'#f0fdf4', border:'1.5px solid #bbf7d0', borderRadius:'10px', padding:'1rem' }}>
                <div style={{ fontWeight:700, fontSize:'0.85rem', color:'#15803d', marginBottom:'0.5rem' }}>
                  ⭐ Opção 1 — Bookmarklet (recomendado, mais fácil)
                </div>
                <ol style={{ margin:'0 0 0.75rem', paddingLeft:'1.25rem', fontSize:'0.78rem', color:'#374151', lineHeight:1.8 }}>
                  <li>Arraste o link abaixo para a <strong>barra de favoritos</strong> do seu navegador</li>
                  <li>Acesse o site AxHub no navegador e faça login</li>
                  <li>Clique no favorito <strong>"📤 Enviar AxHub"</strong></li>
                  <li>Volte aqui e clique <strong>"Executar Depara"</strong></li>
                </ol>
                {selecionados.map(s => {
                  const hubKey = s.hub.url.replace(/https?:\/\//, '').split('/')[0];
                  const apiUrl = 'http://localhost:3100/api/depara-equipamentos/receive-hub-data';
                  // Bookmarklet como concatenação de strings (sem template literals que quebram JSX)
                  const bmCode = "(function(){"
                    + "var url='" + s.hub.url + "';"
                    + "var key='" + hubKey + "';"
                    + "var api='" + apiUrl + "';"
                    + "fetch('/operacao/datahandler?pageSize=100&page=1&skip=0&take=100',{credentials:'include',headers:{'X-Requested-With':'XMLHttpRequest'}})"
                    + ".then(function(r){return r.json();})"
                    + ".then(function(d){"
                    + "var eq=(d.Data||[]).map(function(e){return{codigo:(e.Equipamento&&e.Equipamento.Descricao)||'',grupo:e.GrupoEquipamento||'',fabricante:e.FabricanteNome||''};}).filter(function(e){return e.codigo;});"
                    + "return fetch(api,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:url,key:key,equipamentos:eq})});"
                    + "})"
                    + ".then(function(r){return r.json();})"
                    + ".then(function(r){alert('\\u2705 '+r.total+' equipamentos enviados para o Axion IA!');})"
                    + ".catch(function(e){alert('\\u274C Erro: '+e.message);});"
                    + "})();";
                  return (
                    <div key={s.nome} style={{ marginBottom:'0.5rem', display:'flex', gap:'0.625rem', alignItems:'center' }}>
                      <span style={{ fontSize:'0.78rem', color:'#374151', flexShrink:0 }}>📌 {s.nome}</span>
                      <a
                        href={'javascript:' + bmCode}
                        onClick={e => { e.preventDefault(); alert('Arraste este link para a barra de favoritos. NÃO clique diretamente aqui — funciona só na página do AxHub.'); }}
                        style={{ display:'inline-flex', alignItems:'center', gap:'0.375rem', padding:'0.35rem 0.875rem', borderRadius:'8px', background:'linear-gradient(135deg,#15803d,#16a34a)', color:'white', textDecoration:'none', fontSize:'0.78rem', fontWeight:700, cursor:'grab', userSelect:'none' }}
                        draggable="true"
                      >
                        📤 Enviar AxHub ({s.nome})
                      </a>
                    </div>
                  );
                })}
              </div>

              {/* Opção 2 — Cookie manual */}
              <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:'10px', padding:'1rem' }}>
                <div style={{ fontWeight:700, fontSize:'0.82rem', color:'#92400e', marginBottom:'0.5rem' }}>
                  🔑 Opção 2 — Cookie de sessão (manual)
                </div>
                <p style={{ margin:'0 0 0.625rem', fontSize:'0.75rem', color:'#78350f' }}>
                  F12 → Application → Cookies → domínio AxHub → copie <code>.AspNetCore.Session</code> → cole abaixo
                </p>
                {selecionados.map(s => (
                  <div key={s.nome} style={{ marginBottom:'0.625rem' }}>
                    <label style={{ fontSize:'0.75rem', fontWeight:600, color:'#374151', display:'block', marginBottom:'0.25rem' }}>
                      {s.nome} — <a href={`${s.hub.url}/Home/Login`} target="_blank" rel="noopener noreferrer" style={{ color:'#6366f1', fontSize:'0.72rem' }}>{s.hub.url} ↗</a>
                    </label>
                    <div style={{ display:'flex', gap:'0.5rem' }}>
                      <input
                        type="text"
                        value={cookies[s.nome] || ''}
                        onChange={e => setCookies(prev => ({ ...prev, [s.nome]: e.target.value }))}
                        placeholder=".AspNetCore.Session=CfDJ8H..."
                        style={{ flex:1, padding:'0.4rem 0.625rem', borderRadius:'7px', border:`1.5px solid ${cookies[s.nome] ? '#bbf7d0' : '#e2e8f0'}`, fontSize:'0.75rem', fontFamily:'monospace', outline:'none' }}
                      />
                      {cookies[s.nome] && <button onClick={() => setCookies(prev => ({ ...prev, [s.nome]: '' }))} style={{ padding:'0.25rem 0.4rem', borderRadius:'6px', border:'1px solid #fecaca', background:'#fef2f2', color:'#dc2626', cursor:'pointer', fontSize:'0.7rem' }}>✕</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ações */}
      <div style={{ display:'flex', gap:'0.875rem', alignItems:'center', flexWrap:'wrap' }}>
        <button
          onClick={executarDepara}
          disabled={!selecionados.length || carregando}
          style={{ padding:'0.625rem 1.5rem', borderRadius:'10px', border:'none', cursor: selecionados.length && !carregando ? 'pointer' : 'not-allowed', background: selecionados.length && !carregando ? 'linear-gradient(135deg,#1d4ed8,#7c3aed)' : '#e2e8f0', color: selecionados.length && !carregando ? 'white' : '#9ca3af', fontWeight:700, fontSize:'0.875rem', display:'flex', alignItems:'center', gap:'0.5rem' }}
        >
          {carregando ? `⏳ Executando (${selecionados.length} contrato${selecionados.length>1?'s':''})...` : `🔄 Executar Depara — ${selecionados.length} contrato${selecionados.length!==1?'s':''}`}
        </button>
        {etapa === 'concluido' && (
          <button onClick={() => { setEtapa('idle'); setResultados([]); }} style={{ padding:'0.5rem 1rem', borderRadius:'8px', border:'1.5px solid #e2e8f0', background:'white', color:'#374151', fontSize:'0.82rem', cursor:'pointer', fontWeight:600 }}>🔄 Novo depara</button>
        )}
        {carregando && <span style={{ fontSize:'0.78rem', color:'#6b7280', fontStyle:'italic' }}>Acessando AxHub e AxCross via automação — pode levar alguns minutos...</span>}
      </div>

      {/* Erro */}
      {etapa === 'erro' && erroMsg && (
        <div style={{ background:'#fef2f2', border:'1.5px solid #fecaca', borderRadius:'10px', padding:'1rem 1.25rem', color:'#b91c1c', fontSize:'0.85rem' }}>
          ❌ <strong>Erro:</strong> {erroMsg}
        </div>
      )}

      {/* Resumo executivo */}
      {etapa === 'concluido' && resultados.length > 0 && (
        <div style={{ background:'linear-gradient(135deg,#f0f4ff,#f5f3ff)', border:'1.5px solid #c7d2fe', borderRadius:'12px', padding:'1.125rem 1.5rem' }}>
          <div style={{ fontWeight:800, fontSize:'0.9rem', color:'#1a202c', marginBottom:'0.875rem' }}>📊 Resumo — {resultados.length} contrato(s)</div>
          <div style={{ display:'flex', gap:'1.5rem', flexWrap:'wrap' }}>
            {[
              { label:'AxHub',      value:totalHub,              cor:'#1d4ed8' },
              { label:'AxCross',    value:totalCross,            cor:'#7c3aed' },
              { label:'Em Ambos',   value:totalAmbos,            cor:'#15803d' },
              { label:'Só AxHub',   value:totalSoHub,            cor:'#1d4ed8' },
              { label:'Só AxCross', value:totalSoCross,          cor:'#7c3aed' },
              { label:'Divergências',value:totalSoHub+totalSoCross, cor:'#92400e' },
            ].map(m => (
              <div key={m.label} style={{ display:'flex', flexDirection:'column', alignItems:'center', minWidth:'70px' }}>
                <div style={{ fontSize:'1.5rem', fontWeight:800, color:m.cor }}>{m.value}</div>
                <div style={{ fontSize:'0.7rem', color:'#6b7280', textAlign:'center', marginTop:'0.1rem' }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resultados por contrato */}
      {resultados.map((r, i) => <CardResultado key={i} resultado={r} />)}

      {/* Guia vazio */}
      {etapa === 'idle' && !selecionados.length && (
        <div style={{ background:'white', borderRadius:'12px', border:'1.5px solid #e2e8f0', padding:'1.5rem' }}>
          <div style={{ fontWeight:700, fontSize:'0.9rem', color:'#1a202c', marginBottom:'1rem' }}>📖 Como funciona</div>
          {[
            { n:'1', t:'Clique em "🔍 Pesquisar contrato"', d:'Abre o seletor com busca por nome, URL, estado ou tipo. Aba Pares mostra contratos que têm AxHub + AxCross. Abas individuais permitem montar pares manualmente.' },
            { n:'2', t:'Selecione um ou mais pares', d:'Na aba Pares, clique "+ Adicionar". Nas abas individuais, selecione primeiro o AxHub e depois o AxCross.' },
            { n:'3', t:'Clique em "Executar Depara"', d:'O sistema acessa ambos os sistemas via automação e extrai a lista de equipamentos de cada um.' },
            { n:'4', t:'Veja as divergências', d:'Equipamentos só no AxHub, só no AxCross e em ambos são mostrados lado a lado com filtro de busca.' },
          ].map(p => (
            <div key={p.n} style={{ display:'flex', gap:'0.875rem', marginBottom:'0.875rem' }}>
              <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'linear-gradient(135deg,#1d4ed8,#7c3aed)', color:'white', fontWeight:800, fontSize:'0.78rem', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{p.n}</div>
              <div><div style={{ fontWeight:700, fontSize:'0.85rem', color:'#1a202c' }}>{p.t}</div><div style={{ fontSize:'0.78rem', color:'#6b7280', marginTop:'0.15rem' }}>{p.d}</div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
