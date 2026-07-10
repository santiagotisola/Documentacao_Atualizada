import React from 'react';
import './StatCard.css';

/**
 * StatCard - Componente unificado para exibir métricas/estatísticas
 * 
 * @param {string|number} value - Valor principal a exibir
 * @param {string} label - Rótulo descritivo
 * @param {string} [color] - Cor personalizada para o valor
 * @param {string} [size='medium'] - Tamanho do card: 'small' | 'medium' | 'large'
 * @param {string} [className] - Classes CSS adicionais
 * @param {React.ReactNode} [icon] - Ícone opcional ao lado do valor
 */
export const StatCard = ({ 
  value, 
  label, 
  color, 
  size = 'medium', 
  className = '',
  icon
}) => {
  const sizeClasses = {
    small: 'stat-card-sm',
    medium: 'stat-card-md',
    large: 'stat-card-lg'
  };
  
  return (
    <div className={`stat-card ${sizeClasses[size]} ${className}`}>
      <div className="stat-card-value" style={color ? { color } : undefined}>
        {icon && <span className="stat-card-icon">{icon}</span>}
        {value}
      </div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
};

export default StatCard;
