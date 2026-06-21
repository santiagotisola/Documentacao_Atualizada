/**
 * 🏷️ STATUS BADGE COMPONENT
 * 
 * Componente reutilizável para exibir badges de status
 * Usado para indicar estados: ativo/inativo, success/warning/error, etc.
 * 
 * @created 2026-06-21
 * @refactor Fase 1 - Quick Wins
 */

import React from 'react';
import './StatusBadge.css';

/**
 * Componente Status Badge
 * 
 * @param {Object} props
 * @param {string} props.label - Texto a exibir no badge
 * @param {string} [props.variant] - Variante: 'success', 'warning', 'error', 'info', 'neutral' (padrão: 'neutral')
 * @param {string} [props.size] - Tamanho: 'small', 'medium', 'large' (padrão: 'medium')
 * @param {React.ReactNode} [props.icon] - Ícone opcional
 * @param {boolean} [props.outlined] - Usar estilo outlined (borda, sem fundo)
 * @param {function} [props.onClick] - Callback quando clicado
 * @param {string} [props.className] - Classes CSS adicionais
 */
export default function StatusBadge({
  label,
  variant = 'neutral',
  size = 'medium',
  icon,
  outlined = false,
  onClick,
  className = ''
}) {
  const isClickable = typeof onClick === 'function';

  const badgeClasses = `
    status-badge
    status-badge--${variant}
    status-badge--${size}
    ${outlined ? 'status-badge--outlined' : ''}
    ${isClickable ? 'status-badge--clickable' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <span
      className={badgeClasses}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyPress={isClickable ? (e) => { if (e.key === 'Enter') onClick(e); } : undefined}
    >
      {icon && <span className="status-badge__icon">{icon}</span>}
      <span className="status-badge__label">{label}</span>
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS (para uso comum)
// ═══════════════════════════════════════════════════════════════════

/**
 * Retorna variant baseado em valor booleano
 * @param {boolean} isActive - Se está ativo
 * @returns {string} 'success' ou 'error'
 */
export function getVariantFromBoolean(isActive) {
  return isActive ? 'success' : 'error';
}

/**
 * Retorna variant e label baseado em status string
 * @param {string} status - Status do sistema
 * @returns {{ variant: string, label: string }}
 */
export function getStatusInfo(status) {
  const statusMap = {
    'ativo': { variant: 'success', label: 'Ativo' },
    'inativo': { variant: 'error', label: 'Inativo' },
    'pendente': { variant: 'warning', label: 'Pendente' },
    'online': { variant: 'success', label: 'Online' },
    'offline': { variant: 'error', label: 'Offline' },
    'warning': { variant: 'warning', label: 'Atenção' },
    'processando': { variant: 'info', label: 'Processando' },
    'concluido': { variant: 'success', label: 'Concluído' },
    'erro': { variant: 'error', label: 'Erro' },
    'cancelado': { variant: 'neutral', label: 'Cancelado' }
  };

  const normalized = status?.toLowerCase();
  return statusMap[normalized] || { variant: 'neutral', label: status };
}
