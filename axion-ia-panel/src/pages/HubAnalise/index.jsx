import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import './HubAnalise.css';

import Busca from './components/Busca';
import Diagnosticos from './components/Diagnosticos';
import Imagens from './components/Imagens';
import Logs from './components/Logs';
import Casos from './components/Casos';
import IpemPe from './components/IpemPe';
import CorrecaoLotes from './components/CorrecaoLotes';
import DeparaEquipamentos from './components/DeparaEquipamentos';
import { ALL_CREDENCIAIS } from '../../data/sitesCredentials';

const MODULOS = [
  { id: 'correcao-lotes', icon: '🔧', label: 'Correção de Lotes',         desc: 'Corrige automaticamente lotes de exportação com erro — SERPRO / Consultar Dados', cor: '#dc2626' },
  { id: 'depara-equip',   icon: '🔄', label: 'Depara Equipamentos',       desc: 'Compara equipamentos AxHub × AxCross e identifica divergências', cor: '#7c3aed' },
  { id: 'ipem',           icon: '📷', label: 'Câmeras / Equipamentos',    desc: 'Gestão de equipamentos Hikvision — inventário, config e clonagem', cor: '#0891b2' },
  { id: 'casos',          icon: '🚗', label: 'Diagnóstico de Exportação', desc: 'Valide placas e corrija erros em lotes', cor: '#667eea' },
  { id: 'busca',          icon: '🔍', label: 'Busca Unificada',           desc: 'Pesquise infrações, placas e passagens', cor: '#0284c7' },
  { id: 'diagnosticos',   icon: '🩺', label: 'Diagnósticos',              desc: 'Health check e status dos sistemas', cor: '#7c3aed' },
  { id: 'imagens',        icon: '📸', label: 'Análise de Imagens',        desc: 'Triagem e auditoria de imagens', cor: '#d97706' },
  { id: 'logs',           icon: '📜', label: 'Logs de Envio',             desc: 'Histórico de transmissões ao SGI', cor: '#374151' },
];

// ─── Dropdown unificado: Sites e Módulos usam o mesmo componente visual ───────
function FiltroDropdown({ label, cor, itens, itensSelecionados, onToggle, onTodos, onLimpar, onFechar, renderItem }) {
  const [filtro, setFiltro] = useState('');
  const c = cor || '#667eea';
  const filtrados = filtro.trim()
    ? itens.filter(it => { const i = renderItem(it); return (i.label + ' ' + (i.sub || '')).toLowerCase().includes(filtro.toLowerCase()); })
    : itens;

  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 6px)', left: 0,
      background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0',
      boxShadow: '0 16px 40px rgba(0,0,0,0.15)', zIndex: 300,
      overflow: 'hidden', minWidth: '280px', maxWidth: '380px',
    }}>
      {/* Filtro */}
      <div style={{ padding: '0.6rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
        <input
          autoFocus value={filtro} onChange={e => setFiltro(e.target.value)}
          placeholder={`🔍 Filtrar ${label.toLowerCase()}...`}
          style={{ width: '100%', padding: '0.4rem 0.7rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem', outline: 'none', background: 'white', color: '#374151', boxSizing: 'border-box' }}
        />
      </div>

      {/* Ações rápidas */}
      <div style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '0.4rem', alignItems: 'center', background: '#f8fafc' }}>
        <button onClick={onTodos} style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid #bbf7d0', background: '#f0fdf4', cursor: 'pointer', color: '#16a34a', fontWeight: 700 }}>✓ Todos</button>
        <button onClick={onLimpar} style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer', color: '#dc2626', fontWeight: 700 }}>✕ Limpar</button>
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#9ca3af' }}>{itensSelecionados.length}/{filtrados.length}</span>
      </div>

      {/* Lista de itens */}
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {filtrados.length === 0
          ? <div style={{ padding: '1.5rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.82rem' }}>Nenhum item encontrado</div>
          : filtrados.map(it => {
              const info = renderItem(it);
              const ativo = itensSelecionados.some(s => s.id === it.id);
              const ic = info.cor || c;
              return (
                <div key={it.id} onClick={() => onToggle(it)} style={{
                  padding: '0.55rem 0.75rem', cursor: 'pointer',
                  display: 'flex', gap: '0.6rem', alignItems: 'center',
                  background: ativo ? `${ic}14` : 'transparent',
                  borderLeft: `3px solid ${ativo ? ic : 'transparent'}`,
                  transition: 'all 0.1s',
                }}>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{info.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#1a202c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{info.label}</div>
                    {info.sub && <div style={{ fontSize: '0.68rem', color: '#9ca3af', marginTop: '0.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{info.sub}</div>}
                  </div>
                  {info.badge && (
                    <span style={{ fontSize: '0.62rem', padding: '0.12rem 0.4rem', borderRadius: '4px', fontWeight: 700, background: info.badge.bg, color: info.badge.color, flexShrink: 0 }}>
                      {info.badge.text}
                    </span>
                  )}
                  <div style={{ width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0, border: `2px solid ${ativo ? ic : '#d1d5db'}`, background: ativo ? ic : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {ativo && <span style={{ color: 'white', fontSize: '0.55rem', fontWeight: 900 }}>✓</span>}
                  </div>
                </div>
              );
            })}
      </div>

      {/* Botão aplicar */}
      <div style={{ padding: '0.6rem', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
        <button onClick={onFechar} style={{
          width: '100%', padding: '0.5rem', borderRadius: '8px', border: 'none',
          background: `linear-gradient(135deg, ${c}, ${c}bb)`,
          color: 'white', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
        }}>
          {itensSelecionados.length > 0
            ? `Aplicar — ${itensSelecionados.length} ${label.toLowerCase()} selecionado${itensSelecionados.length > 1 ? 's' : ''}`
            : 'Fechar'}
        </button>
      </div>
    </div>
  );
}

const HubAnalise = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Estado de módulos
  const [ativos, setAtivos] = useState(() => {
    const saved = searchParams.get('modulos');
    if (saved) return saved.split(',').filter(id => MODULOS.find(m => m.id === id));
    return ['correcao-lotes'];
  });

  // Estado de sites (contexto global)
  const [sitesAtivos, setSitesAtivos] = useState(() => {
    const savedSite = searchParams.get('site');
    if (savedSite) {
      const found = ALL_CREDENCIAIS.find(s => s.id === savedSite || s.url === savedSite);
      return found ? [found] : [];
    }
    return [];
  });

  const [siteAberto, setSiteAberto]         = useState(false);
  const siteRef                             = useRef(null);
  const [selectorAberto, setSelectorAberto] = useState(false);
  const selectorRef                         = useRef(null);

  const [consultaAtiva, setConsultaAtiva]   = useState(null);
  const [filtrosGlobais, setFiltrosGlobais] = useState({ site: 'todos', dataInicio: null, dataFim: null });
  const [metricas, setMetricas]             = useState({ buscasRealizadas: 0, diagnosticosAtivos: 0, imagensAnalisadas: 0, logsProcessados: 0 });

  // Sync URL params
  useEffect(() => {
    const params = { modulos: ativos.join(',') };
    if (sitesAtivos.length === 1) params.site = sitesAtivos[0].id;
    setSearchParams(params);
  }, [ativos, sitesAtivos, setSearchParams]);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const close = (e) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target)) setSelectorAberto(false);
      if (siteRef.current && !siteRef.current.contains(e.target)) setSiteAberto(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const toggle          = (id)   => setAtivos(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const selecionarTodos = ()     => setAtivos(MODULOS.map(m => m.id));
  const limparTodos     = ()     => setAtivos([]);
  const toggleSite      = (site) => setSitesAtivos(prev => prev.some(s => s.id === site.id) ? prev.filter(s => s.id !== site.id) : [...prev, site]);
  const limparSites     = ()     => setSitesAtivos([]);

  const siteAtivo = sitesAtivos[0] || null;

  const propsComuns = {
    consultaAtiva, setConsultaAtiva,
    filtrosGlobais, setFiltrosGlobais,
    metricas, setMetricas,
    setAbaAtiva: (id) => { if (!ativos.includes(id)) setAtivos(prev => [...prev, id]); },
    siteAtivo,
    sitesAtivos,
  };

  const visiveis = MODULOS.filter(m => ativos.includes(m.id));

  const labelSeletor =
    ativos.length === 0              ? 'Selecionar módulos...'   :
    ativos.length === MODULOS.length ? 'Todos os módulos ativos' :
    `${ativos.length} módulo${ativos.length > 1 ? 's' : ''} ativo${ativos.length > 1 ? 's' : ''}`;

  const labelSite =
    sitesAtivos.length === 0 ? 'Selecionar site...' :
    sitesAtivos.length === 1 ? sitesAtivos[0].nome  :
    `${sitesAtivos.length} sites selecionados`;

  const corSite = sitesAtivos.length > 0 ? (sitesAtivos[0].sistema === 'AxHub' ? '#1d4ed8' : '#15803d') : '#667eea';

  return (
    <div className="hub-analise">

      {/* ─── BARRA SUPERIOR ─────────────────────────────────────────────────────── */}
      <div style={{
        background: 'white', borderBottom: '2px solid #e2e8f0',
        padding: '0.75rem 1.5rem',
        display: 'flex', gap: '0.875rem', alignItems: 'center',
        flexWrap: 'wrap', flexShrink: 0,
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0, background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🔬</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1a202c', lineHeight: 1, letterSpacing: '-0.02em' }}>
              AxHub <span style={{ color: '#667eea' }}>Analisador</span>
            </div>
            <div style={{ fontSize: '0.6rem', color: '#9ca3af', marginTop: '0.15rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Análise Unificada de Sistemas
            </div>
          </div>
        </div>

        <div style={{ width: '1px', height: '32px', background: '#e2e8f0', flexShrink: 0 }} />

        {/* Seletor de SITES */}
        <div ref={siteRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setSiteAberto(v => !v)}
            style={{
              padding: '0.45rem 0.875rem', borderRadius: '10px',
              border: `1.5px solid ${siteAberto || sitesAtivos.length > 0 ? corSite : '#e2e8f0'}`,
              background: siteAberto ? '#f0f4ff' : sitesAtivos.length > 0 ? `${corSite}0d` : '#f8fafc',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
              transition: 'all 0.15s', minWidth: '180px',
            }}
          >
            <span style={{ fontSize: '0.9rem' }}>🌐</span>
            <span style={{ flex: 1, fontSize: '0.82rem', color: sitesAtivos.length > 0 ? corSite : '#374151', fontWeight: sitesAtivos.length > 0 ? 700 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {labelSite}
            </span>
            <span style={{ color: '#9ca3af', fontSize: '0.65rem', transition: 'transform 0.2s', transform: siteAberto ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>▼</span>
          </button>

          {siteAberto && (
            <FiltroDropdown
              label="Sites"
              cor="#667eea"
              itens={ALL_CREDENCIAIS}
              itensSelecionados={sitesAtivos}
              onToggle={toggleSite}
              onTodos={() => setSitesAtivos([...ALL_CREDENCIAIS])}
              onLimpar={limparSites}
              onFechar={() => setSiteAberto(false)}
              renderItem={s => ({
                icon: s.sistema === 'AxHub' ? '🔵' : '🟢',
                label: s.nome,
                sub: `${s.url} · ${s.estado || '—'} · ${s.tipo || ''}`,
                cor: s.sistema === 'AxHub' ? '#1d4ed8' : '#15803d',
                badge: { text: s.sistema, bg: s.sistema === 'AxHub' ? '#dbeafe' : '#dcfce7', color: s.sistema === 'AxHub' ? '#1d4ed8' : '#15803d' },
              })}
            />
          )}
        </div>

        {/* Chips dos sites ativos */}
        {sitesAtivos.length > 0 && (
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', maxWidth: '300px' }}>
            {sitesAtivos.map(s => (
              <span key={s.id} onClick={() => toggleSite(s)} title={`${s.url} — clique para remover`} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                padding: '0.2rem 0.5rem', borderRadius: '20px', cursor: 'pointer',
                background: s.sistema === 'AxHub' ? '#dbeafe' : '#dcfce7',
                border: `1px solid ${s.sistema === 'AxHub' ? '#93c5fd' : '#86efac'}`,
                fontSize: '0.72rem', fontWeight: 700,
                color: s.sistema === 'AxHub' ? '#1d4ed8' : '#15803d',
              }}>
                🌐 {s.nome} <span style={{ opacity: 0.5, fontSize: '0.6rem' }}>✕</span>
              </span>
            ))}
          </div>
        )}

        {sitesAtivos.length > 1 && (
          <span style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', background: '#fef3c7', border: '1px solid #fde68a', fontSize: '0.72rem', fontWeight: 700, color: '#92400e', flexShrink: 0 }}>
            ⚡ Modo Comparação
          </span>
        )}

        <div style={{ width: '1px', height: '32px', background: '#e2e8f0', flexShrink: 0 }} />

        {/* Seletor de Módulos */}
        <div ref={selectorRef} style={{ position: 'relative', flexShrink: 0, width: '210px' }}>
          <button
            onClick={() => setSelectorAberto(v => !v)}
            style={{
              width: '100%', padding: '0.45rem 0.875rem', borderRadius: '10px',
              border: `1.5px solid ${selectorAberto || ativos.length > 0 ? '#667eea' : '#e2e8f0'}`,
              background: selectorAberto ? '#f0f4ff' : ativos.length > 0 ? '#667eea0d' : '#f8fafc',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: '0.9rem' }}>📊</span>
            <span style={{ flex: 1, fontSize: '0.82rem', color: ativos.length > 0 ? '#667eea' : '#374151', fontWeight: ativos.length > 0 ? 700 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {labelSeletor}
            </span>
            <span style={{ color: '#9ca3af', fontSize: '0.65rem', transition: 'transform 0.2s', transform: selectorAberto ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>▼</span>
          </button>

          {selectorAberto && (
            <FiltroDropdown
              label="Módulos"
              cor="#667eea"
              itens={MODULOS}
              itensSelecionados={MODULOS.filter(m => ativos.includes(m.id))}
              onToggle={m => toggle(m.id)}
              onTodos={selecionarTodos}
              onLimpar={limparTodos}
              onFechar={() => setSelectorAberto(false)}
              renderItem={m => ({ icon: m.icon, label: m.label, sub: m.desc, cor: m.cor })}
            />
          )}
        </div>

        {/* Chips módulos ativos */}
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
          {MODULOS.filter(m => ativos.includes(m.id)).map(m => (
            <span key={m.id} onClick={() => toggle(m.id)} title={`${m.desc} — clique para remover`} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.2rem 0.5rem', borderRadius: '20px',
              background: `${m.cor}15`, border: `1px solid ${m.cor}44`,
              fontSize: '0.72rem', fontWeight: 600, color: m.cor,
              cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', transition: 'all 0.15s',
            }}>
              {m.icon} {m.label} <span style={{ opacity: 0.5, fontSize: '0.6rem' }}>✕</span>
            </span>
          ))}
        </div>
      </div>

      {/* ─── BANNER DE CONTEXTO DO SITE ──────────────────────────────────────────── */}
      {sitesAtivos.length > 0 && (
        <div style={{
          background: sitesAtivos.length > 1
            ? 'linear-gradient(135deg, #fef3c7, #fffbeb)'
            : 'linear-gradient(135deg, #eff6ff, #f0f4ff)',
          borderBottom: `2px solid ${sitesAtivos.length > 1 ? '#fde68a' : '#c7d2fe'}`,
          padding: '0.5rem 1.5rem',
          display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', flexShrink: 0,
        }}>
          <span style={{ fontSize: '0.78rem', color: sitesAtivos.length > 1 ? '#92400e' : '#3730a3', fontWeight: 700 }}>
            {sitesAtivos.length > 1 ? '⚡ Comparando:' : '🌐 Contexto:'}
          </span>
          {sitesAtivos.map(s => (
            <span key={s.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#374151' }}>
              <span style={{ fontWeight: 700, color: s.sistema === 'AxHub' ? '#1d4ed8' : '#15803d' }}>{s.nome}</span>
              <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1', fontFamily: 'monospace', fontSize: '0.72rem', textDecoration: 'none' }}>
                {s.url}
              </a>
              <span style={{ color: '#9ca3af', fontSize: '0.7rem' }}>({s.tipo} · {s.estado})</span>
            </span>
          ))}
          {sitesAtivos.length > 1 && (
            <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#92400e', fontStyle: 'italic' }}>
              Todos os módulos analisarão os {sitesAtivos.length} sites selecionados
            </span>
          )}
        </div>
      )}

      {/* ─── ÁREA DE CONTEÚDO ────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Estado vazio — sem módulos */}
        {ativos.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'linear-gradient(135deg, #667eea22, #764ba222)', border: '2px dashed #667eea55', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', marginBottom: '1.25rem' }}>🔬</div>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 800, color: '#1a202c' }}>
              Bem-vindo ao <span style={{ color: '#667eea' }}>AxHub Analisador</span>
            </h2>
            <p style={{ margin: '0 0 0.5rem', color: '#6b7280', fontSize: '0.875rem', maxWidth: '420px', lineHeight: 1.7 }}>
              Selecione um <strong>site</strong> no topo para definir o contexto e depois escolha os <strong>módulos</strong> de análise.
            </p>
            <p style={{ margin: '0 0 1.75rem', color: '#9ca3af', fontSize: '0.8rem', maxWidth: '380px' }}>
              Você pode selecionar múltiplos sites para comparação ou analisar um por vez.
            </p>
            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '520px' }}>
              {MODULOS.map(m => (
                <button key={m.id} onClick={() => toggle(m.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '10px', border: `1.5px solid ${m.cor}44`, background: `${m.cor}0d`, color: m.cor, fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Módulos ativos */}
        {visiveis.map((modulo, idx) => (
          <div key={modulo.id}>
            {ativos.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0.625rem 1rem', background: 'white', borderRadius: '10px', border: `1px solid ${modulo.cor}33`, borderLeft: `4px solid ${modulo.cor}` }}>
                <span style={{ fontSize: '1.2rem' }}>{modulo.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a202c' }}>{modulo.label}</div>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{modulo.desc}</div>
                </div>
                {siteAtivo && (
                  <span style={{ fontSize: '0.72rem', color: '#6b7280', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                    🌐 {siteAtivo.nome}
                  </span>
                )}
                <button onClick={() => toggle(modulo.id)} style={{ padding: '0.25rem 0.625rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#9ca3af', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                  ✕ Fechar
                </button>
              </div>
            )}
            <div>
              {modulo.id === 'correcao-lotes' && <CorrecaoLotes {...propsComuns} />}
              {modulo.id === 'depara-equip'   && <DeparaEquipamentos {...propsComuns} />}
              {modulo.id === 'ipem'           && <IpemPe       {...propsComuns} />}
              {modulo.id === 'busca'          && <Busca        {...propsComuns} />}
              {modulo.id === 'diagnosticos'   && <Diagnosticos {...propsComuns} />}
              {modulo.id === 'imagens'        && <Imagens      {...propsComuns} />}
              {modulo.id === 'logs'           && <Logs         {...propsComuns} />}
              {modulo.id === 'casos'          && <Casos        {...propsComuns} />}
            </div>
            {idx < visiveis.length - 1 && (
              <div style={{ height: '2px', marginTop: '1.5rem', background: `linear-gradient(90deg, transparent, ${modulo.cor}44 30%, ${visiveis[idx + 1].cor}44 70%, transparent)` }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HubAnalise;
