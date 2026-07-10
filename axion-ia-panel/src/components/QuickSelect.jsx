/**
 * QuickSelect — Seletor dropdown rápido reutilizável
 *
 * Substitui listas de botões inline (tabs, filtros) por um dropdown compacto.
 * Mesmo estilo visual da ContextBar.
 *
 * Props:
 *   options    [{id, label, desc?, icon?, badge?}]  — lista de opções
 *   value      string                               — id da opção ativa
 *   onChange   (id) => void                         — callback ao selecionar
 *   color?     string                               — cor de destaque (default #3b82f6)
 *   label?     string                               — rótulo prefixo (ex: "Seção:")
 *   showSearch? bool                               — forçar busca (auto quando > 6 opções)
 *   width?     number|string                        — largura mínima do dropdown (default 220)
 *
 * Exemplo:
 *   <QuickSelect
 *     options={TABS}
 *     value={tab}
 *     onChange={setTab}
 *     color="#3b82f6"
 *     label="Seção"
 *   />
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export default function QuickSelect({
  options = [],
  value,
  onChange,
  color = '#3b82f6',
  label,
  showSearch,
  width = 220,
}) {
  const [open, setOpen]   = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  // Busca automática quando houver mais de 6 opções
  const useSearch = showSearch !== undefined ? showSearch : options.length > 6;

  // Fechar ao clicar fora
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const active   = options.find(o => o.id === value);
  const filtered = search
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const bg     = `${color}12`;
  const border = `${color}40`;

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      {/* Rótulo prefixo opcional */}
      {label && (
        <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, whiteSpace: 'nowrap' }}>
          {label}
        </span>
      )}

      {/* Botão trigger */}
      <button
        onClick={() => { setOpen(p => !p); setSearch(''); }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 8,
          background: bg, border: `1.5px solid ${border}`,
          color, fontWeight: 700, fontSize: 13, cursor: 'pointer',
          transition: 'box-shadow 0.15s',
          boxShadow: open ? `0 0 0 3px ${color}22` : 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {active?.icon && <span style={{ fontSize: 15, lineHeight: 1 }}>{active.icon}</span>}
        <span>{active?.label ?? '— selecionar —'}</span>
        {active?.badge != null && (
          <span style={{
            background: '#ef4444', color: '#fff',
            borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 700,
          }}>
            {active.badge}
          </span>
        )}
        <ChevronDown
          size={13}
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', opacity: 0.7 }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0,
          background: '#fff', border: `1px solid ${border}`,
          borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.13)',
          minWidth: width, maxWidth: 360, maxHeight: 340,
          display: 'flex', flexDirection: 'column',
          zIndex: 300, overflow: 'hidden',
        }}>
          {/* Campo de busca */}
          {useSearch && (
            <div style={{
              padding: '8px 10px', borderBottom: '1px solid #f0f0f0',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Search size={12} style={{ color: '#9ca3af', flexShrink: 0 }} />
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filtrar..."
                style={{
                  border: 'none', outline: 'none',
                  fontSize: 12, flex: 1, color: '#374151', background: 'transparent',
                }}
              />
            </div>
          )}

          {/* Lista de opções */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.map(opt => {
              const isActive = opt.id === value;
              return (
                <button
                  key={opt.id}
                  onClick={() => { onChange(opt.id); setOpen(false); setSearch(''); }}
                  style={{
                    width: '100%', textAlign: 'left',
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '8px 12px',
                    background: isActive ? `${color}12` : 'transparent',
                    border: 'none', cursor: 'pointer',
                    borderLeft: isActive ? `3px solid ${color}` : '3px solid transparent',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f9fafb'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  {opt.icon && (
                    <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>
                      {opt.icon}
                    </span>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        fontSize: 13,
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? color : '#111827',
                        whiteSpace: 'nowrap',
                      }}>
                        {opt.label}
                      </span>
                      {opt.badge != null && (
                        <span style={{
                          background: '#ef4444', color: '#fff',
                          borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 700,
                        }}>
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    {opt.desc && (
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
                        {opt.desc}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div style={{ padding: 16, textAlign: 'center', color: '#9ca3af', fontSize: 11 }}>
                Nenhuma opção encontrada
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
