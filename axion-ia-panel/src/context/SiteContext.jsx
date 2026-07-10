/**
 * SiteContext — Contexto global compartilhado entre todos os módulos
 *
 * Permite que qualquer módulo:
 *  - LEIA qual site/produto está ativo
 *  - DEFINA o contexto ao navegar para um site
 *  - AÇÕES RÁPIDAS: executar CUTI, ver chamados, ver relatório do site ativo
 *
 * Persiste em localStorage para sobreviver a recarregamentos.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SiteContext = createContext(null);

const STORAGE_KEY = 'axion_active_context';

/**
 * Shape do contexto ativo:
 * {
 *   site: { id, nome, perfil, produto, ambiente, url, login } | null,
 *   produto: 'axhub' | 'axcross' | 'axton' | 'varco' | null,
 *   contrato: string | null,   ← ex: 'DETRAN-GO', 'SENATRAN'
 *   origem: string | null,      ← qual módulo definiu o contexto
 * }
 */
const DEFAULT_CTX = { site: null, produto: null, contrato: null, origem: null };

export function SiteContextProvider({ children }) {
  const [ctx, setCtxState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_CTX;
    } catch {
      return DEFAULT_CTX;
    }
  });

  // Persiste no localStorage sempre que muda
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ctx)); } catch {}
  }, [ctx]);

  /** Define o site/produto ativo. Pode ser chamado de qualquer módulo. */
  const setContext = useCallback((updates, origem = 'manual') => {
    setCtxState(prev => ({ ...prev, ...updates, origem }));
  }, []);

  /** Define apenas o produto ativo (sem site específico) */
  const setProduto = useCallback((produto, origem = 'manual') => {
    setCtxState(prev => ({ ...prev, produto, origem }));
  }, []);

  /** Define um site completo como ativo */
  const setSite = useCallback((site, origem = 'manual') => {
    setCtxState(prev => ({
      ...prev,
      site,
      produto: site?.produto || prev.produto,
      contrato: site?.contrato || prev.contrato,
      origem,
    }));
  }, []);

  /** Limpa o contexto */
  const clearContext = useCallback(() => {
    setCtxState(DEFAULT_CTX);
  }, []);

  const value = {
    // Estado atual
    activeSite:     ctx.site,
    activeProduto:  ctx.produto,
    activeContrato: ctx.contrato,
    activeOrigem:   ctx.origem,
    ctx,

    // Actions
    setContext,
    setProduto,
    setSite,
    clearContext,

    // Helpers
    hasSite:    !!ctx.site,
    isAxHub:    ctx.produto === 'axhub',
    isAxCross:  ctx.produto === 'axcross',
    isAxTon:    ctx.produto === 'axton',
    isVarco:    ctx.produto === 'varco',

    // Label humanizado
    siteLabel: ctx.site
      ? `${ctx.site.nome}${ctx.site.perfil ? ` (${ctx.site.perfil})` : ''}`
      : ctx.produto
        ? ctx.produto.toUpperCase()
        : null,

    // Cor por produto
    produtoColor: {
      axhub:  '#ef4444',
      axcross: '#10b981',
      axton:  '#f59e0b',
      varco:  '#8b5cf6',
    }[ctx.produto] || '#6b7280',
  };

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

/** Hook para usar o contexto em qualquer componente */
export function useSiteContext() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSiteContext must be used inside SiteContextProvider');
  return ctx;
}

export default SiteContext;
