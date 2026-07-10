/**
 * ContextBar — Barra de contexto global
 *
 * Aparece em todas as páginas quando um site/produto está ativo.
 * Mostra o site atual com dropdown de troca rápida + ações de navegação cruzada.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSiteContext } from '../context/SiteContext.jsx';
import { X, ExternalLink, TestTube, Headphones, BarChart3, Globe, ChevronDown, Search } from 'lucide-react';
import { AXHUB_SITES, AXCROSS_SITES } from '../data/sitesData.js';

const PRODUTO_ICONS = {
  axhub:   '🚦',
  axcross: '📡',
  axton:   '⚖️',
  varco:   '📹',
};

const QUICK_ACTIONS = [
  { label: 'Chamados', icon: Headphones, to: () => '/central-sites?tab=chamados', title: 'Ver chamados deste site' },
  { label: 'CUTI',     icon: TestTube,   to: () => '/cuti',                        title: 'Executar testes neste ambiente' },
  { label: 'Relatório',icon: BarChart3,  to: () => '/central-relatorios',          title: 'Ver relatórios' },
  { label: 'Sites',    icon: Globe,      to: () => '/central-sites',               title: 'Central de Sites' },
];

// Lista unificada de todos os sites para o dropdown
const ALL_SITES_DROPDOWN = [
  ...AXHUB_SITES.map(s => ({ ...s, produto: 'axhub' })),
  ...AXCROSS_SITES.map(s => ({ ...s, produto: 'axcross' })),
];

export default function ContextBar() {
  const { activeSite, activeProduto, siteLabel, produtoColor, hasSite, clearContext, setSite } = useSiteContext();
  const navigate = useNavigate();
  const [expanded,     setExpanded]     = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [search,       setSearch]       = useState('');
  const dropdownRef = useRef(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showDropdown]);

  if (!hasSite && !activeProduto) return null;

  const icon   = PRODUTO_ICONS[activeProduto] || '🌐';
  const bg     = `${produtoColor}18`;
  const border = `${produtoColor}44`;

  // Filtragem do dropdown
  const q = search.toLowerCase();
  const filtered = q
    ? ALL_SITES_DROPDOWN.filter(s =>
        s.nome.toLowerCase().includes(q) || s.estado?.toLowerCase().includes(q)
      )
    : ALL_SITES_DROPDOWN;
  const axhubList   = filtered.filter(s => s.produto === 'axhub');
  const axcrossList = filtered.filter(s => s.produto === 'axcross');

  const handleSelectSite = (site) => {
    setSite({ ...site }, 'context-bar');
    setShowDropdown(false);
    setSearch('');
  };

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: bg, borderBottom: `2px solid ${border}`,
      padding: '0 16px', display: 'flex', alignItems: 'center', gap: 10,
      fontSize: 12, minHeight: 36, backdropFilter: 'blur(4px)',
    }}>

      {/* ── Seletor de site com dropdown ── */}
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          onClick={() => { setShowDropdown(p => !p); setSearch(''); }}
          title="Trocar site ativo"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontWeight: 700, color: produtoColor,
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '4px 6px', borderRadius: 6, transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = `${produtoColor}22`}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <span>{icon}</span>
          <span style={{ whiteSpace: 'nowrap' }}>{siteLabel || activeProduto?.toUpperCase()}</span>
          <ChevronDown
            size={11}
            style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', opacity: 0.7 }}
          />
        </button>

        {showDropdown && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0,
            background: 'white', border: `1px solid ${border}`,
            borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.13)',
            width: 260, maxHeight: 380, display: 'flex', flexDirection: 'column',
            zIndex: 200, overflow: 'hidden',
          }}>
            {/* Campo de busca */}
            <div style={{ padding: '8px 10px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Search size={12} style={{ color: '#9ca3af', flexShrink: 0 }} />
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar site..."
                style={{ border: 'none', outline: 'none', fontSize: 12, flex: 1, color: '#374151', background: 'transparent' }}
              />
            </div>

            {/* Lista agrupada */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {axhubList.length > 0 && (
                <>
                  <div style={{ padding: '6px 10px 2px', fontSize: 10, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#fafafa' }}>
                    🚦 AxHub
                  </div>
                  {axhubList.map(site => {
                    const isActive = activeSite?.id === site.id;
                    return (
                      <button
                        key={site.id}
                        onClick={() => handleSelectSite(site)}
                        style={{
                          width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '6px 12px', background: isActive ? '#fef2f2' : 'none',
                          border: 'none', cursor: 'pointer', fontSize: 12,
                          borderLeft: isActive ? '3px solid #ef4444' : '3px solid transparent',
                        }}
                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f9fafb'; }}
                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'none'; }}
                      >
                        <span style={{ fontWeight: isActive ? 700 : 500, color: '#111827' }}>{site.nome}</span>
                        <span style={{ fontSize: 10, color: '#9ca3af' }}>{site.estado}</span>
                      </button>
                    );
                  })}
                </>
              )}

              {axcrossList.length > 0 && (
                <>
                  <div style={{ padding: '6px 10px 2px', fontSize: 10, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#fafafa' }}>
                    📡 AxCross
                  </div>
                  {axcrossList.map(site => {
                    const isActive = activeSite?.id === site.id;
                    return (
                      <button
                        key={site.id}
                        onClick={() => handleSelectSite(site)}
                        style={{
                          width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '6px 12px', background: isActive ? '#ecfdf5' : 'none',
                          border: 'none', cursor: 'pointer', fontSize: 12,
                          borderLeft: isActive ? '3px solid #10b981' : '3px solid transparent',
                        }}
                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f9fafb'; }}
                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'none'; }}
                      >
                        <span style={{ fontWeight: isActive ? 700 : 500, color: '#111827' }}>{site.nome}</span>
                        <span style={{ fontSize: 10, color: '#9ca3af' }}>{site.estado}</span>
                      </button>
                    );
                  })}
                </>
              )}

              {filtered.length === 0 && (
                <div style={{ padding: 16, textAlign: 'center', color: '#9ca3af', fontSize: 11 }}>
                  Nenhum site encontrado
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Link externo do site ativo */}
      {activeSite?.url && (
        <a href={activeSite.url} target="_blank" rel="noreferrer"
          title="Abrir site externo"
          style={{ color: produtoColor, opacity: 0.7, lineHeight: 1 }}>
          <ExternalLink size={11} />
        </a>
      )}

      <div style={{ width: 1, height: 18, background: border }} />

      {/* ── Ações rápidas ── */}
      {expanded && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, flexWrap: 'wrap' }}>
          {QUICK_ACTIONS.map(({ label, icon: Icon, to, title }) => (
            <button
              key={label}
              title={title}
              onClick={() => navigate(to({ site: activeSite, produto: activeProduto }))}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '3px 10px', borderRadius: 20,
                background: 'white', border: `1px solid ${border}`,
                color: '#374151', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = produtoColor; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#374151'; }}
            >
              <Icon size={11} />
              {label}
            </button>
          ))}

          {activeSite?.url && (
            <button
              title="Abrir sistema no navegador"
              onClick={() => window.open(activeSite.url, '_blank')}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '3px 10px', borderRadius: 20,
                background: produtoColor, border: `1px solid ${produtoColor}`,
                color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}
            >
              <ExternalLink size={11} />
              Abrir Sistema
            </button>
          )}
        </div>
      )}

      {/* ── Recolher / Expandir ── */}
      <button
        onClick={() => setExpanded(p => !p)}
        title={expanded ? 'Recolher barra' : 'Expandir barra'}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: produtoColor, padding: '0 4px', lineHeight: 1, marginLeft: 'auto' }}
      >
        <ChevronDown size={14} style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
      </button>

      {/* ── Limpar contexto ── */}
      <button
        onClick={clearContext}
        title="Remover contexto ativo"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0 4px', lineHeight: 1 }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
