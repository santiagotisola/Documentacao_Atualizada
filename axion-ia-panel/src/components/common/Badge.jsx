import React from 'react';
import './Badge.css';

/**
 * Badge - Componente unificado para badges/tags
 * 
 * @param {React.ReactNode} children - Conteúdo do badge
 * @param {string} [variant='default'] - Estilo: 'default' | 'success' | 'danger' | 'warning' | 'info' | 'primary' | 'secondary'
 * @param {string} [color] - Cor personalizada (sobrescreve variant)
 * @param {string} [size='md'] - Tamanho: 'sm' | 'md' | 'lg'
 * @param {string} [className] - Classes CSS adicionais
 * @param {React.ReactNode} [icon] - Ícone opcional antes do texto
 */
export const Badge = ({ 
  children, 
  variant = 'default', 
  color, 
  size = 'md',
  className = '',
  icon
}) => {
  const variants = {
    default: 'badge-default',
    success: 'badge-success',
    danger: 'badge-danger',
    warning: 'badge-warning',
    info: 'badge-info',
    primary: 'badge-primary',
    secondary: 'badge-secondary'
  };
  
  const sizes = {
    sm: 'badge-sm',
    md: 'badge-md',
    lg: 'badge-lg'
  };
  
  return (
    <span 
      className={`badge ${variants[variant]} ${sizes[size]} ${className}`}
      style={color ? { backgroundColor: color } : undefined}
    >
      {icon && <span className="badge-icon">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
