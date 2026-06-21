/**
 * ⏳ LOADING SPINNER COMPONENT
 * 
 * Componente reutilizável para estados de carregamento
 * Usado em queries, forms, e qualquer operação assíncrona
 * 
 * @created 2026-06-21
 * @refactor Fase 1 - Quick Wins
 */

import React from 'react';
import PropTypes from 'prop-types';
import './LoadingSpinner.css';

/**
 * Componente Loading Spinner
 * 
 * @param {Object} props
 * @param {string} [props.size] - Tamanho: 'small', 'medium', 'large' (padrão: 'medium')
 * @param {string} [props.color] - Cor do spinner (padrão: '#3b82f6')
 * @param {string} [props.text] - Texto opcional a exibir abaixo do spinner
 * @param {boolean} [props.fullScreen] - Se deve ocupar a tela inteira com overlay
 * @param {string} [props.className] - Classes CSS adicionais
 */
export default function LoadingSpinner({
  size = 'medium',
  color = '#3b82f6',
  text,
  fullScreen = false,
  className = ''
}) {
  const spinnerClasses = `
    loading-spinner
    loading-spinner--${size}
    ${fullScreen ? 'loading-spinner--fullscreen' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const spinnerContent = (
    <div className="loading-spinner__container">
      <div
        className="loading-spinner__circle"
        style={{ borderTopColor: color }}
      />
      {text && <p className="loading-spinner__text">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={spinnerClasses}>
        <div className="loading-spinner__overlay" />
        {spinnerContent}
      </div>
    );
  }

  return <div className={spinnerClasses}>{spinnerContent}</div>;
}

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.string,
  text: PropTypes.string,
  fullScreen: PropTypes.bool,
  className: PropTypes.string
};

// ═══════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════

/**
 * Loading state para cards/seções
 */
export function LoadingCard({ text = 'Carregando...', height = '200px' }) {
  return (
    <div style={{ minHeight: height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingSpinner text={text} />
    </div>
  );
}

LoadingCard.propTypes = {
  text: PropTypes.string,
  height: PropTypes.string
};

/**
 * Loading state para botões
 */
export function LoadingButton({ text = 'Aguarde...' }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
      <LoadingSpinner size="small" />
      {text}
    </span>
  );
}

LoadingButton.propTypes = {
  text: PropTypes.string
};
