import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './HubAnalise.css';

// Componentes das abas
import Busca from './components/Busca';
import Diagnosticos from './components/Diagnosticos';
import Imagens from './components/Imagens';
import Logs from './components/Logs';

const HubAnalise = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'busca';
  const [abaAtiva, setAbaAtiva] = useState(tabFromUrl);
  
  // Estado compartilhado
  const [consultaAtiva, setConsultaAtiva] = useState(null);
  const [filtrosGlobais, setFiltrosGlobais] = useState({
    site: 'todos',
    dataInicio: null,
    dataFim: null
  });
  const [metricas, setMetricas] = useState({
    buscasRealizadas: 0,
    diagnosticosAtivos: 0,
    imagensAnalisadas: 0,
    logsProcessados: 0
  });

  useEffect(() => {
    setSearchParams({ tab: abaAtiva });
  }, [abaAtiva, setSearchParams]);

  const propsComuns = {
    consultaAtiva,
    setConsultaAtiva,
    filtrosGlobais,
    setFiltrosGlobais,
    metricas,
    setMetricas,
    setAbaAtiva
  };

  const abas = [
    { id: 'busca', icon: '🔍', label: 'Busca Unificada' },
    { id: 'diagnosticos', icon: '🩺', label: 'Diagnósticos' },
    { id: 'imagens', icon: '📸', label: 'Análise Imagens' },
    { id: 'logs', icon: '📜', label: 'Logs' }
  ];

  return (
    <div className="hub-analise">
      {/* Header */}
      <div className="central-header">
        <div className="central-title">
          <h1>🔬 Hub de Análise</h1>
          <p>Central unificada de busca, diagnóstico e Análise — Sistemas, Imagens, Logs e Health</p>
        </div>
        
        {/* Métricas rápidas */}
        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-icon">🔍</div>
            <div className="stat-info">
              <div className="stat-value">{metricas.buscasRealizadas}</div>
              <div className="stat-label">Buscas</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🩺</div>
            <div className="stat-info">
              <div className="stat-value">{metricas.diagnosticosAtivos}</div>
              <div className="stat-label">Diagnósticos</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📸</div>
            <div className="stat-info">
              <div className="stat-value">{metricas.imagensAnalisadas}</div>
              <div className="stat-label">Imagens</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📜</div>
            <div className="stat-info">
              <div className="stat-value">{metricas.logsProcessados}</div>
              <div className="stat-label">Logs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="central-tabs">
        {abas.map(aba => (
          <button
            key={aba.id}
            className={`tab-button ${abaAtiva === aba.id ? 'active' : ''}`}
            onClick={() => setAbaAtiva(aba.id)}
          >
            <span className="tab-icon">{aba.icon}</span>
            <span className="tab-label">{aba.label}</span>
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="central-content">
        {abaAtiva === 'busca' && <Busca {...propsComuns} />}
        {abaAtiva === 'diagnosticos' && <Diagnosticos {...propsComuns} />}
        {abaAtiva === 'imagens' && <Imagens {...propsComuns} />}
        {abaAtiva === 'logs' && <Logs {...propsComuns} />}
      </div>
    </div>
  );
};

export default HubAnalise;
