import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import './HubAnalise.css';

import Busca from './components/Busca';
import Diagnosticos from './components/Diagnosticos';
import Imagens from './components/Imagens';
import Logs from './components/Logs';
import Casos from './components/Casos';
import IpemPe from './components/IpemPe';

const MODULOS = [
  { id: 'ipem',         icon: '📷', label: 'IPEM-PE Câmeras',           desc: 'Gestão de equipamentos Hikvision — inventário, config e clonagem', cor: '#0891b2' },
  { id: 'casos',        icon: '🚗', label: 'Diagnóstico de Exportação', desc: 'Valide placas e corrija erros em lotes',  cor: '#667eea' },
  { id: 'busca',        icon: '🔍', label: 'Busca Unificada',           desc: 'Pesquise infrações, placas e passagens', cor: '#0284c7' },
  { id: 'diagnosticos', icon: '🩺', label: 'Diagnósticos',              desc: 'Health check e status dos sistemas',      cor: '#7c3aed' },
  { id: 'imagens',      icon: '📸', label: 'Análise de Imagens',        desc: 'Triagem e auditoria de imagens',          cor: '#d97706' },
  { id: 'logs',         icon: '📜', label: 'Logs de Envio',             desc: 'Histórico de transmissões ao SGI',        cor: '#374151' },
];

const HubAnalise = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [ativos, setAtivos] = useState(() => {
    const saved = searchParams.get('modulos');
    if (saved) return saved.split(',').filter(id => MODULOS.find(m => m.id === id));
    return ['ipem'];
  });

  const [selectorAberto, setSelectorAberto] = useState(false);
  const [filtroSelector, setFiltroSelector] = useState('');
  const selectorRef = useRef(null);

  const [consultaAtiva, setConsultaAtiva]   = useState(null);
  const [filtrosGlobais, setFiltrosGlobais] = useState({ site: 'todos', dataInicio: null, dataFim: null });
  const [metricas, setMetricas]             = useState({ buscasRealizadas: 0, diagnosticosAtivos: 0, imagensAnalisadas: 0, logsProcessados: 0 });

  useEffect(() => {
    setSearchParams({ modulos: ativos.join(',') });
  }, [ativos, setSearchParams]);

  useEffect(() => {
    const close = (e) => { if (selectorRef.current && !selectorRef.current.contains(e.target)) setSelectorAberto(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const toggle       = (id) => setAtivos(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const selecionarTodos = () => setAtivos(MODULOS.map(m => m.id));
  const limparTodos     = () => setAtivos([]);

  const propsComuns = {
    consultaAtiva, setConsultaAtiva,
    filtrosGlobais, setFiltrosGlobais,
    metricas, setMetricas,
    setAbaAtiva: (id) => { if (!ativos.includes(id)) setAtivos(prev => [...prev, id]); },
  };

  const visíveis = MODULOS.filter(m => ativos.includes(m.id));
  const filtrados = filtroSelector.trim()
    ? MODULOS.filter(m => m.label.toLowerCase().includes(filtroSelector.toLowerCase()) || m.desc.toLowerCase().includes(filtroSelector.toLowerCase()))
    : MODULOS;

  const labelSeletor =
    ativos.length === 0             ? 'Selecionar módulos...'  :
    ativos.length === MODULOS.length ? 'Todos os módulos ativos' :
    `${ativos.length} módulo${ativos.length > 1 ? 's' : ''} ativo${ativos.length > 1 ? 's' : ''}`;

  return (
    <div className="hub-analise">

      {/* ══════════════ BARRA SUPERIOR ══════════════ */}
      <div style={{
        background: 'white',
        borderBottom: '2px solid #e2e8f0',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap',
        flexShrink: 0,
      }}>

        {/* ─ Logo ─ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
          }}>
            🔬
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1a202c', lineHeight: 1, letterSpacing: '-0.02em' }}>
              AxHub <span style={{ color: '#667eea' }}>Analisador</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '0.15rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Análise Unificada de Sistemas
            </div>
          </div>
        </div>

        <div style={{ width: '1px', height: '32px', background: '#e2e8f0', flexShrink: 0 }} />

        {/* ─ Seletor de módulos (combobox) ─ */}
        <div ref={selectorRef} style={{ position: 'relative', flexShrink: 0, width: '240px' }}>
          <button
            onClick={() => setSelectorAberto(v => !v)}
            style={{
              width: '100%', padding: '0.5rem 0.875rem', borderRadius: '10px',
              border: `1.5px solid ${selectorAberto ? '#667eea' : '#e2e8f0'}`,
              background: selectorAberto ? '#f0f4ff' : '#f8fafc',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: '0.9rem' }}>📊</span>
            <span style={{ flex: 1, fontSize: '0.82rem', color: '#374151', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {labelSeletor}
            </span>
            <span style={{ color: '#9ca3af', fontSize: '0.7rem', transition: 'transform 0.2s', transform: selectorAberto ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>▼</span>
          </button>

          {selectorAberto && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0,
              background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0',
              boxShadow: '0 12px 32px rgba(0,0,0,0.14)', zIndex: 200,
              overflow: 'hidden', width: '300px',
            }}>
              {/* Filtro interno */}
              <div style={{ padding: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                <input
                  autoFocus
                  value={filtroSelector}
                  onChange={e => setFiltroSelector(e.target.value)}
                  placeholder="🔍 Filtrar módulos..."
                  style={{ width: '100%', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem', color: '#374151', outline: 'none', boxSizing: 'border-box', background: '#f8fafc' }}
                />
              </div>

              {/* Ações rápidas */}
              <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button onClick={selecionarTodos} style={{ fontSize: '0.72rem', padding: '0.25rem 0.625rem', borderRadius: '6px', border: '1px solid #bbf7d0', background: '#f0fdf4', cursor: 'pointer', color: '#16a34a', fontWeight: 700 }}>✅ Todos</button>
                <button onClick={limparTodos}     style={{ fontSize: '0.72rem', padding: '0.25rem 0.625rem', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer', color: '#dc2626', fontWeight: 700 }}>✕ Limpar</button>
                <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#9ca3af' }}>{ativos.length}/{MODULOS.length}</span>
              </div>

              {/* Lista de módulos */}
              <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                {filtrados.map(m => {
                  const ativo = ativos.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      onClick={() => toggle(m.id)}
                      style={{
                        padding: '0.75rem 1rem', cursor: 'pointer',
                        display: 'flex', gap: '0.75rem', alignItems: 'center',
                        background: ativo ? `${m.cor}0d` : 'transparent',
                        borderLeft: `3px solid ${ativo ? m.cor : 'transparent'}`,
                        transition: 'all 0.1s',
                      }}
                    >
                      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{m.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#1a202c' }}>{m.label}</div>
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.1rem' }}>{m.desc}</div>
                      </div>
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
                        border: `2px solid ${ativo ? m.cor : '#d1d5db'}`,
                        background: ativo ? m.cor : 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {ativo && <span style={{ color: 'white', fontSize: '0.6rem', fontWeight: 800 }}>✓</span>}
                      </div>
                    </div>
                  );
                })}
                {filtrados.length === 0 && (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.82rem' }}>Nenhum módulo encontrado</div>
                )}
              </div>

              {/* Botão aplicar */}
              <div style={{ padding: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                <button
                  onClick={() => setSelectorAberto(false)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  Aplicar — {ativos.length} módulo{ativos.length !== 1 ? 's' : ''} ativo{ativos.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─ Chips dos módulos ativos ─ */}
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
          {ativos.length === 0 && (
            <span style={{ fontSize: '0.78rem', color: '#9ca3af', fontStyle: 'italic', alignSelf: 'center' }}>
              Nenhum módulo selecionado
            </span>
          )}
          {MODULOS.filter(m => ativos.includes(m.id)).map(m => (
            <span
              key={m.id}
              onClick={() => toggle(m.id)}
              title={`${m.desc} — clique para remover`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                padding: '0.25rem 0.625rem', borderRadius: '20px',
                background: `${m.cor}15`, border: `1px solid ${m.cor}44`,
                fontSize: '0.75rem', fontWeight: 600, color: m.cor,
                cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              {m.icon} {m.label} <span style={{ opacity: 0.5, fontSize: '0.65rem' }}>✕</span>
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════ ÁREA DE CONTEÚDO ══════════════ */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Estado vazio */}
        {ativos.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '20px',
              background: 'linear-gradient(135deg, #667eea22, #764ba222)',
              border: '2px dashed #667eea55',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.5rem', marginBottom: '1.25rem',
            }}>
              🔬
            </div>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 800, color: '#1a202c' }}>
              Bem-vindo ao <span style={{ color: '#667eea' }}>AxHub Analisador</span>
            </h2>
            <p style={{ margin: '0 0 1.75rem', color: '#6b7280', fontSize: '0.875rem', maxWidth: '400px', lineHeight: 1.7 }}>
              Selecione um ou mais módulos para analisar. Você pode exibir vários módulos ao mesmo tempo na mesma tela.
            </p>
            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '520px' }}>
              {MODULOS.map(m => (
                <button
                  key={m.id}
                  onClick={() => toggle(m.id)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.5rem 1rem', borderRadius: '10px',
                    border: `1.5px solid ${m.cor}44`, background: `${m.cor}0d`,
                    color: m.cor, fontWeight: 600, fontSize: '0.82rem',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Módulos ativos */}
        {visíveis.map((modulo, idx) => (
          <div key={modulo.id}>
            {/* Cabeçalho separador — só quando há mais de 1 módulo */}
            {ativos.length > 1 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                marginBottom: '1rem', padding: '0.625rem 1rem',
                background: 'white', borderRadius: '10px',
                border: `1px solid ${modulo.cor}33`, borderLeft: `4px solid ${modulo.cor}`,
              }}>
                <span style={{ fontSize: '1.2rem' }}>{modulo.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a202c' }}>{modulo.label}</div>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{modulo.desc}</div>
                </div>
                <button
                  onClick={() => toggle(modulo.id)}
                  style={{ padding: '0.25rem 0.625rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#9ca3af', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                >
                  ✕ Fechar
                </button>
              </div>
            )}

            {/* Conteúdo do módulo */}
            <div>
              {modulo.id === 'ipem'         && <IpemPe />}
              {modulo.id === 'busca'        && <Busca {...propsComuns} />}
              {modulo.id === 'diagnosticos' && <Diagnosticos {...propsComuns} />}
              {modulo.id === 'imagens'      && <Imagens {...propsComuns} />}
              {modulo.id === 'logs'         && <Logs {...propsComuns} />}
              {modulo.id === 'casos'        && <Casos />}
            </div>

            {/* Divisor gradiente entre módulos */}
            {idx < visíveis.length - 1 && (
              <div style={{
                height: '2px', marginTop: '1.5rem',
                background: `linear-gradient(90deg, transparent, ${modulo.cor}44 30%, ${visíveis[idx + 1].cor}44 70%, transparent)`,
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HubAnalise;
