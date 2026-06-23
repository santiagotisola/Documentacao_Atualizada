/**
 * 🎧 REACT QUERY HOOKS - HELPDESK
 * 
 * Custom hooks para queries de helpdesk (tickets, SLA, categorias)
 * Usa React Query para cache, refetch automático, e gerenciamento de estado
 * 
 * @created 2026-06-21
 * @refactor Fase 1 - Quick Wins
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

// ═══════════════════════════════════════════════════════════════════
// QUERY KEYS
// ═══════════════════════════════════════════════════════════════════

export const helpdeskKeys = {
  all: ['helpdesk'],
  tickets: (filters) => [...helpdeskKeys.all, 'tickets', filters],
  ticket: (id) => [...helpdeskKeys.all, 'ticket', id],
  categorias: () => [...helpdeskKeys.all, 'categorias'],
  tecnicos: () => [...helpdeskKeys.all, 'tecnicos'],
  sla: () => [...helpdeskKeys.all, 'sla'],
  sitesOverview: () => [...helpdeskKeys.all, 'sites-overview'],
  fila: () => [...helpdeskKeys.all, 'fila'],
  polling: () => [...helpdeskKeys.all, 'polling']
};

// ═══════════════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════════════

/**
 * Hook para listar tickets do helpdesk
 * @param {Object} filters - Filtros (status, categoria, etc.)
 * @param {Object} options - Opções do useQuery
 */
export function useHelpdeskTickets(filters = {}, options = {}) {
  return useQuery({
    queryKey: helpdeskKeys.tickets(filters),
    queryFn: async () => {
      const { data } = await api.get('/helpdesk/tickets', { params: filters });
      return data;
    },
    staleTime: 30_000, // 30 segundos
    ...options
  });
}

/**
 * Hook para obter detalhes de um ticket específico
 * @param {string|number} ticketId - ID do ticket
 * @param {Object} options - Opções do useQuery
 */
export function useHelpdeskTicket(ticketId, options = {}) {
  return useQuery({
    queryKey: helpdeskKeys.ticket(ticketId),
    queryFn: async () => {
      const { data } = await api.get(`/helpdesk/ticket/${ticketId}`);
      return data;
    },
    staleTime: 60_000, // 1 minuto
    enabled: !!ticketId, // Só executa se ticketId existir
    ...options
  });
}

/**
 * Hook para listar categorias do helpdesk
 */
export function useHelpdeskCategorias(options = {}) {
  return useQuery({
    queryKey: helpdeskKeys.categorias(),
    queryFn: async () => {
      const { data } = await api.get('/helpdesk/categorias');
      return data;
    },
    staleTime: 300_000, // 5 minutos (categorias mudam raramente)
    ...options
  });
}

/**
 * Hook para listar técnicos do helpdesk
 */
export function useHelpdeskTecnicos(options = {}) {
  return useQuery({
    queryKey: helpdeskKeys.tecnicos(),
    queryFn: async () => {
      const { data } = await api.get('/helpdesk/tecnicos');
      return data;
    },
    staleTime: 300_000, // 5 minutos
    ...options
  });
}

/**
 * Hook para obter compliance de SLA
 */
export function useHelpdeskSLA(options = {}) {
  return useQuery({
    queryKey: helpdeskKeys.sla(),
    queryFn: async () => {
      const { data } = await api.get('/helpdesk/sla-compliance');
      return data;
    },
    staleTime: 60_000, // 1 minuto
    ...options
  });
}

/**
 * Hook para obter overview de sites com tickets
 */
export function useHelpdeskSitesOverview(options = {}) {
  return useQuery({
    queryKey: helpdeskKeys.sitesOverview(),
    queryFn: async () => {
      const { data } = await api.get('/helpdesk/sites-overview');
      return data;
    },
    staleTime: 60_000,
    ...options
  });
}

/**
 * Hook para obter fila de revisão humana
 */
export function useHelpdeskFila(options = {}) {
  return useQuery({
    queryKey: helpdeskKeys.fila(),
    queryFn: async () => {
      const { data } = await api.get('/helpdesk/fila');
      return data;
    },
    staleTime: 30_000,
    refetchInterval: 60_000, // Refetch a cada 1 minuto
    ...options
  });
}

/**
 * Hook para obter status do polling automático
 */
export function useHelpdeskPolling(options = {}) {
  return useQuery({
    queryKey: helpdeskKeys.polling(),
    queryFn: async () => {
      const { data } = await api.get('/helpdesk/polling');
      return data;
    },
    staleTime: 10_000, // 10 segundos
    refetchInterval: 30_000, // Refetch a cada 30 segundos
    ...options
  });
}

// ═══════════════════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Hook para classificar um ticket
 */
export function useClassificarTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, classificacao }) => {
      const { data } = await api.post(`/helpdesk/classificar/${ticketId}`, classificacao);
      return data;
    },
    onSuccess: (data, { ticketId }) => {
      // Invalida cache do ticket específico
      queryClient.invalidateQueries({ queryKey: helpdeskKeys.ticket(ticketId) });
      // Invalida lista de tickets
      queryClient.invalidateQueries({ queryKey: helpdeskKeys.tickets() });
    }
  });
}

/**
 * Hook para responder um ticket com IA
 */
export function useResponderTicketIA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, resposta }) => {
      const { data } = await api.post(`/helpdesk/responder/${ticketId}`, { resposta });
      return data;
    },
    onSuccess: (data, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: helpdeskKeys.ticket(ticketId) });
      queryClient.invalidateQueries({ queryKey: helpdeskKeys.tickets() });
    }
  });
}

/**
 * Hook para criar um novo chamado
 */
export function useCriarChamado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chamado) => {
      const { data } = await api.post('/helpdesk/criar', chamado);
      return data;
    },
    onSuccess: () => {
      // Invalida lista de tickets para incluir o novo
      queryClient.invalidateQueries({ queryKey: helpdeskKeys.tickets() });
    }
  });
}

/**
 * Hook para aprovar item da fila de revisão
 */
export function useAprovarFila() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ajustes }) => {
      const { data } = await api.post(`/helpdesk/fila/${id}/aprovar`, { ajustes });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: helpdeskKeys.fila() });
      queryClient.invalidateQueries({ queryKey: helpdeskKeys.tickets() });
    }
  });
}

/**
 * Hook para rejeitar item da fila de revisão
 */
export function useRejeitarFila() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, motivo }) => {
      const { data } = await api.post(`/helpdesk/fila/${id}/rejeitar`, { motivo });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: helpdeskKeys.fila() });
    }
  });
}

/**
 * Hook para iniciar polling automático
 */
export function useIniciarPolling() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/helpdesk/polling/iniciar');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: helpdeskKeys.polling() });
    }
  });
}

/**
 * Hook para pausar polling automático
 */
export function usePausarPolling() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/helpdesk/polling/pausar');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: helpdeskKeys.polling() });
    }
  });
}
