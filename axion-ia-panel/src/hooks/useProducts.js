/**
 * 🔌 REACT QUERY HOOKS - PRODUCTS
 * 
 * Custom hooks para queries de produtos (AxHub, AxTon, AxCross)
 * Usa React Query para cache, refetch automático, e gerenciamento de estado
 * 
 * @created 2026-06-21
 * @refactor Fase 1 - Quick Wins
 */

import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

// ═══════════════════════════════════════════════════════════════════
// QUERY KEYS (para invalidação e cache)
// ═══════════════════════════════════════════════════════════════════

export const productKeys = {
  all: ['products'],
  
  // AxHub
  axhub: () => [...productKeys.all, 'axhub'],
  axhubStatus: () => [...productKeys.axhub(), 'status'],
  axhubResumo: () => [...productKeys.axhub(), 'resumo'],
  axhubEquipamentos: () => [...productKeys.axhub(), 'equipamentos'],
  axhubOperacoes: () => [...productKeys.axhub(), 'operacoes'],
  axhubInfracoes: () => [...productKeys.axhub(), 'infracoes'],
  axhubHeartbeat: () => [...productKeys.axhub(), 'heartbeat'],
  
  // AxTon
  axton: () => [...productKeys.all, 'axton'],
  axtonStatus: () => [...productKeys.axton(), 'status'],
  axtonResumo: () => [...productKeys.axton(), 'resumo'],
  axtonPesagens: () => [...productKeys.axton(), 'pesagens'],
  axtonInfracoes: () => [...productKeys.axton(), 'infracoes'],
  
  // AxCross
  axcross: () => [...productKeys.all, 'axcross'],
  axcrossStatus: () => [...productKeys.axcross(), 'status'],
  axcrossResumo: () => [...productKeys.axcross(), 'resumo'],
  axcrossEquipamentos: () => [...productKeys.axcross(), 'equipamentos'],
  axcrossPassagens: () => [...productKeys.axcross(), 'passagens'],
};

// ═══════════════════════════════════════════════════════════════════
// AXHUB HOOKS
// ═══════════════════════════════════════════════════════════════════

/**
 * Hook para obter status de conexão do AxHub
 * @param {Object} options - Opções do useQuery
 */
export function useAxHubStatus(options = {}) {
  return useQuery({
    queryKey: productKeys.axhubStatus(),
    queryFn: async () => {
      const { data } = await api.get('/axhub/status');
      return data;
    },
    staleTime: 60_000, // 1 minuto
    ...options
  });
}

/**
 * Hook para obter resumo geral do AxHub
 * @param {Object} options - Opções do useQuery
 */
export function useAxHubResumo(options = {}) {
  return useQuery({
    queryKey: productKeys.axhubResumo(),
    queryFn: async () => {
      const { data } = await api.get('/axhub/resumo');
      return data;
    },
    staleTime: 30_000, // 30 segundos
    ...options
  });
}

/**
 * Hook para listar equipamentos do AxHub
 * @param {Object} options - Opções do useQuery
 */
export function useAxHubEquipamentos(options = {}) {
  return useQuery({
    queryKey: productKeys.axhubEquipamentos(),
    queryFn: async () => {
      const { data } = await api.get('/axhub/equipamentos');
      return data;
    },
    staleTime: 60_000, // 1 minuto
    ...options
  });
}

/**
 * Hook para obter estatísticas de infrações do AxHub
 * @param {Object} options - Opções do useQuery
 */
export function useAxHubInfracoes(options = {}) {
  return useQuery({
    queryKey: productKeys.axhubInfracoes(),
    queryFn: async () => {
      const { data } = await api.get('/axhub/infracoes');
      return data;
    },
    staleTime: 30_000,
    ...options
  });
}

/**
 * Hook para obter heartbeat dos equipamentos AxHub
 * @param {Object} options - Opções do useQuery
 */
export function useAxHubHeartbeat(options = {}) {
  return useQuery({
    queryKey: productKeys.axhubHeartbeat(),
    queryFn: async () => {
      const { data } = await api.get('/axhub/heartbeat');
      return data;
    },
    staleTime: 30_000,
    refetchInterval: 60_000, // Refetch a cada 1 minuto
    ...options
  });
}

/**
 * Hook para listar tabelas do banco AxHub
 * @param {Object} options - Opções do useQuery
 */
export function useAxHubTabelas(options = {}) {
  return useQuery({
    queryKey: [...productKeys.axhub(), 'tabelas'],
    queryFn: async () => {
      const { data } = await api.get('/axhub/tabelas');
      return data.tabelas;
    },
    staleTime: 300_000, // 5 minutos (tabelas mudam raramente)
    ...options
  });
}

// ═══════════════════════════════════════════════════════════════════
// AXTON HOOKS
// ═══════════════════════════════════════════════════════════════════

/**
 * Hook para obter status de conexão do AxTon
 */
export function useAxTonStatus(options = {}) {
  return useQuery({
    queryKey: productKeys.axtonStatus(),
    queryFn: async () => {
      const { data } = await api.get('/axton/status');
      return data;
    },
    staleTime: 60_000,
    ...options
  });
}

/**
 * Hook para obter resumo geral do AxTon
 */
export function useAxTonResumo(options = {}) {
  return useQuery({
    queryKey: productKeys.axtonResumo(),
    queryFn: async () => {
      const { data } = await api.get('/axton/resumo');
      return data;
    },
    staleTime: 30_000,
    ...options
  });
}

/**
 * Hook para obter últimas pesagens do AxTon
 */
export function useAxTonPesagens(options = {}) {
  return useQuery({
    queryKey: productKeys.axtonPesagens(),
    queryFn: async () => {
      const { data } = await api.get('/axton/pesagens');
      return data;
    },
    staleTime: 30_000,
    ...options
  });
}

// ═══════════════════════════════════════════════════════════════════
// AXCROSS HOOKS
// ═══════════════════════════════════════════════════════════════════

/**
 * Hook para obter status de conexão do AxCross
 */
export function useAxCrossStatus(options = {}) {
  return useQuery({
    queryKey: productKeys.axcrossStatus(),
    queryFn: async () => {
      const { data } = await api.get('/axcross/status');
      return data;
    },
    staleTime: 60_000,
    ...options
  });
}

/**
 * Hook para obter resumo geral do AxCross
 */
export function useAxCrossResumo(options = {}) {
  return useQuery({
    queryKey: productKeys.axcrossResumo(),
    queryFn: async () => {
      const { data } = await api.get('/axcross/resumo');
      return data;
    },
    staleTime: 30_000,
    ...options
  });
}

/**
 * Hook para obter estatísticas de passagens do AxCross
 */
export function useAxCrossPassagens(options = {}) {
  return useQuery({
    queryKey: productKeys.axcrossPassagens(),
    queryFn: async () => {
      const { data } = await api.get('/axcross/passagens');
      return data;
    },
    staleTime: 30_000,
    ...options
  });
}
