/**
 * 🎨 UI COMPONENTS LIBRARY
 * 
 * Biblioteca de componentes reutilizáveis do sistema Axion
 * 
 * @created 2026-06-21
 * @refactor Fase 1 - Quick Wins
 * 
 * @example
 * // Importar componentes individuais
 * import { KPICard, StatusBadge, LoadingSpinner } from '@/components/ui';
 * 
 * // Ou importar tudo
 * import * as UI from '@/components/ui';
 */

// Core components
export { default as KPICard } from './KPICard';
export { default as StatusBadge, getVariantFromBoolean, getStatusInfo } from './StatusBadge';
export { default as LoadingSpinner, LoadingCard, LoadingButton } from './LoadingSpinner';
export { default as DataTable } from './DataTable';

// Re-export types (quando migrar para TypeScript)
// export type { KPICardProps } from './KPICard';
// export type { StatusBadgeProps } from './StatusBadge';
// export type { LoadingSpinnerProps } from './LoadingSpinner';
// export type { DataTableProps } from './DataTable';
