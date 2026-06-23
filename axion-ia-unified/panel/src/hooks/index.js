/**
 * 🪝 REACT QUERY HOOKS INDEX
 * 
 * Export centralizado de todos os custom hooks do sistema
 * 
 * @created 2026-06-21
 * @refactor Fase 1 - Quick Wins
 * 
 * @example
 * // Importar hooks individuais
 * import { useAxHubResumo, useHelpdeskTickets } from '@/hooks';
 * 
 * // Usar no componente
 * const { data, isLoading, error } = useAxHubResumo();
 */

// Products (AxHub, AxTon, AxCross)
export {
  productKeys,
  useAxHubStatus,
  useAxHubResumo,
  useAxHubEquipamentos,
  useAxHubInfracoes,
  useAxHubHeartbeat,
  useAxTonStatus,
  useAxTonResumo,
  useAxTonPesagens,
  useAxCrossStatus,
  useAxCrossResumo,
  useAxCrossPassagens
} from './useProducts';

// Helpdesk
export {
  helpdeskKeys,
  useHelpdeskTickets,
  useHelpdeskTicket,
  useHelpdeskCategorias,
  useHelpdeskTecnicos,
  useHelpdeskSLA,
  useHelpdeskSitesOverview,
  useHelpdeskFila,
  useHelpdeskPolling,
  useClassificarTicket,
  useResponderTicketIA,
  useCriarChamado,
  useAprovarFila,
  useRejeitarFila,
  useIniciarPolling,
  usePausarPolling
} from './useHelpdesk';

// TODO: Adicionar mais hooks conforme necessário
// - useEditais (busca PNCP, análise, roadmap)
// - useValidation (validation manager, visual validation)
// - useConfig (configurações do sistema)
// - useCRM (contatos, clientes, equipamentos)
