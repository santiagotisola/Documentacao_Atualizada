import React from 'react';
import { Loader2 } from 'lucide-react';
import './LoadingState.css';

/**
 * LoadingSpinner - Spinner simples animado
 * 
 * @param {number} [size=24] - Tamanho do spinner em pixels
 * @param {string} [className] - Classes CSS adicionais
 */
export const LoadingSpinner = ({ size = 24, className = '' }) => (
  <Loader2 
    size={size} 
    className={`loading-spinner ${className}`} 
  />
);

/**
 * LoadingState - Estado de carregamento com spinner e mensagem
 * 
 * @param {string} [message="Carregando..."] - Mensagem de carregamento
 * @param {string} [size='medium'] - Tamanho: 'small' | 'medium' | 'large'
 */
export const LoadingState = ({ message = "Carregando...", size = 'medium' }) => {
  const sizes = { 
    small: 20, 
    medium: 32, 
    large: 48 
  };
  
  return (
    <div className="loading-state">
      <LoadingSpinner size={sizes[size]} />
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

/**
 * LoadingOverlay - Overlay de carregamento sobre conteúdo
 * 
 * @param {React.ReactNode} [children] - Conteúdo customizado (default: LoadingState)
 * @param {boolean} [blur=true] - Aplicar blur no fundo
 */
export const LoadingOverlay = ({ children, blur = true }) => (
  <div className={`loading-overlay ${blur ? 'loading-overlay-blur' : ''}`}>
    <div className="loading-overlay-content">
      {children || <LoadingState />}
    </div>
  </div>
);

/**
 * LoadingButton - Botão com estado de carregamento
 * 
 * @param {boolean} loading - Se está carregando
 * @param {React.ReactNode} children - Conteúdo do botão
 * @param {string} [loadingText] - Texto durante carregamento
 * @param {object} [props] - Props adicionais do botão
 */
export const LoadingButton = ({ loading, children, loadingText, ...props }) => (
  <button {...props} disabled={loading || props.disabled}>
    {loading && <LoadingSpinner size={16} />}
    {loading && loadingText ? loadingText : children}
  </button>
);

export default LoadingState;
