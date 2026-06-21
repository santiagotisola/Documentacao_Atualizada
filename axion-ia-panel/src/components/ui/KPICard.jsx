/**
 * 📊 KPI CARD COMPONENT
 * 
 * Componente reutilizável para exibir KPIs (Key Performance Indicators)
 * Usado em dashboards, operations hub, e outras visualizações
 * 
 * @created 2026-06-21
 * @refactor Fase 1 - Quick Wins
 */

import React from 'react';
import PropTypes from 'prop-types';
import './KPICard.css';

/**
 * Componente KPI Card
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Ícone do KPI (componente Lucide ou emoji)
 * @param {string} props.label - Rótulo do KPI
 * @param {string|number} props.value - Valor principal do KPI
 * @param {string} [props.sublabel] - Rótulo secundário opcional
 * @param {string} [props.color] - Cor do card (padrão: #3b82f6)
 * @param {string} [props.trend] - Tendência: 'up', 'down', 'neutral'
 * @param {string} [props.trendValue] - Valor da tendência (ex: '+12%')
 * @param {string} [props.size] - Tamanho: 'small', 'medium', 'large' (padrão: 'medium')
 * @param {function} [props.onClick] - Callback quando clicado (torna o card clicável)
 * @param {string} [props.className] - Classes CSS adicionais
 */
export default function KPICard({
  icon,
  label,
  value,
  sublabel,
  color = '#3b82f6',
  trend,
  trendValue,
  size = 'medium',
  onClick,
  className = ''
}) {
  const isClickable = typeof onClick === 'function';
  const trendIcon = trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→';
  const trendColor = trend === 'up' ? 'var(--success)' : trend === 'down' ? 'var(--error)' : 'var(--text-muted)';

  const cardClasses = `
    kpi-card 
    kpi-card--${size}
    ${isClickable ? 'kpi-card--clickable' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div
      className={cardClasses}
      style={{ borderTopColor: color }}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyPress={isClickable ? (e) => { if (e.key === 'Enter') onClick(e); } : undefined}
    >
      <span className="kpi-card__icon" style={{ color }}>
        {icon}
      </span>
      
      <span className="kpi-card__value">{value}</span>
      
      <span className="kpi-card__label">{label}</span>
      
      {sublabel && (
        <span className="kpi-card__sublabel">{sublabel}</span>
      )}
      
      {trend && (
        <div className="kpi-card__trend" style={{ color: trendColor }}>
          <span className="kpi-card__trend-icon">{trendIcon}</span>
          {trendValue && <span className="kpi-card__trend-value">{trendValue}</span>}
        </div>
      )}
    </div>
  );
}

KPICard.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  sublabel: PropTypes.string,
  color: PropTypes.string,
  trend: PropTypes.oneOf(['up', 'down', 'neutral']),
  trendValue: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  onClick: PropTypes.func,
  className: PropTypes.string
};
