import React from 'react';
import './ExecutionProgress.css';

const STATUS_ICON = {
  running: '⏳',
  success: '✅',
  warning: '⚠️',
  error: '❌',
  pending: '⬜',
};

const STATUS_CLASS = {
  running: 'step--running',
  success: 'step--success',
  warning: 'step--warning',
  error:   'step--error',
  pending: 'step--pending',
};

/**
 * Painel de progresso em tempo real para execução de scripts
 */
const ExecutionProgress = ({ steps = [], totalSteps = 7, status = 'running', onClose, results }) => {
  const completed = steps.filter(s => s.status === 'success' || s.status === 'warning').length;
  const failed    = steps.filter(s => s.status === 'error').length;
  const pct       = totalSteps > 0 ? Math.min(100, Math.round((completed / totalSteps) * 100)) : 0;
  const isDone    = status === 'success' || status === 'error';

  return (
    <div className="exec-progress">
      {/* Header */}
      <div className={`exec-progress__header exec-progress__header--${status}`}>
        <div className="exec-header-left">
          <span className="exec-header-icon">
            {status === 'running' ? '⚡' : status === 'success' ? '✅' : '❌'}
          </span>
          <div>
            <h3>
              {status === 'running' && 'Executando no AxHub...'}
              {status === 'success' && 'Execução concluída com sucesso!'}
              {status === 'error' && 'Execução finalizada com erros'}
            </h3>
            <span className="exec-header-sub">
              {completed} de {totalSteps} passos concluídos
              {failed > 0 && ` • ${failed} com erro`}
              {results?.duration && ` • ${results.duration}s`}
            </span>
          </div>
        </div>
        {isDone && onClose && (
          <button onClick={onClose} className="exec-close-btn">✕ Fechar</button>
        )}
      </div>

      {/* Barra de progresso */}
      <div className="exec-progress__bar-wrap">
        <div
          className={`exec-progress__bar exec-progress__bar--${status}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="exec-progress__pct">{pct}%</div>

      {/* Passos */}
      <div className="exec-steps">
        {steps.map((step, i) => (
          <div key={i} className={`exec-step ${STATUS_CLASS[step.status] || ''}`}>
            <div className="exec-step__header">
              <span className="exec-step__icon">{STATUS_ICON[step.status] || '⬜'}</span>
              <span className="exec-step__num">Passo {step.step}</span>
              <span className="exec-step__label">{step.label}</span>
              {step.status === 'running' && <span className="exec-spinner" />}
            </div>
            <div className="exec-step__message">{step.message}</div>
            {step.screenshot && (
              <div className="exec-step__screenshot">
                <img
                  src={step.screenshot}
                  alt={`Screenshot passo ${step.step}`}
                  onClick={() => window.open(step.screenshot, '_blank')}
                  title="Clique para ampliar"
                />
              </div>
            )}
          </div>
        ))}

        {/* Passos pendentes */}
        {Array.from({ length: Math.max(0, totalSteps - steps.length) }).map((_, i) => (
          <div key={`pending-${i}`} className="exec-step step--pending">
            <div className="exec-step__header">
              <span className="exec-step__icon">⬜</span>
              <span className="exec-step__num">Passo {steps.length + i + 1}</span>
              <span className="exec-step__label exec-step__label--pending">Aguardando...</span>
            </div>
          </div>
        ))}
      </div>

      {/* Resumo final */}
      {isDone && results?.createdIds && Object.keys(results.createdIds).length > 0 && (
        <div className="exec-summary">
          <h4>📋 Cadastros realizados</h4>
          <ul>
            {results.createdIds.fabricante  && <li>🏭 Fabricante: <strong>{results.createdIds.fabricante}</strong></li>}
            {results.createdIds.tipo        && <li>📋 Tipo: <strong>{results.createdIds.tipo}</strong></li>}
            {results.createdIds.modelo      && <li>🔧 Modelo: <strong>{results.createdIds.modelo}</strong></li>}
            {results.createdIds.grupo       && <li>📁 Grupo: <strong>{results.createdIds.grupo}</strong></li>}
            {results.createdIds.equipamento && <li>📡 Equipamento: <strong>{results.createdIds.equipamento}</strong></li>}
          </ul>
          <a
            href="https://homologacao.axhub.axion.ws/equipamento"
            target="_blank"
            rel="noreferrer"
            className="exec-link-axhub"
          >
            🔗 Abrir AxHub — Equipamentos
          </a>
        </div>
      )}
    </div>
  );
};

export default ExecutionProgress;
