import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './CentralQualidade.css';

// Componentes das abas
import Dashboard from './components/Dashboard';
import PIEQ from './components/PIEQ';
import Auditoria from './components/Auditoria';
import Seguranca from './components/Seguranca';

const CentralQualidade = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'dashboard';
  const [abaAtiva, setAbaAtiva] = useState(tabFromUrl);
  
  // Estado compartilhado
  const [metricas, setMetricas] = useState({
    scansTotais: 0,
    issuesCriticos: 0,
    coberturaTestes: 0,
    scoreSeg: 0
  });

  useEffect(() => {
    setSearchParams({ tab: abaAtiva });
  }, [abaAtiva, setSearchParams]);

  const propsComuns = {
    metricas,
    setMetricas,
    setAbaAtiva
  };

  const abas = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'pieq', icon: '🛡️', label: 'PIEQ Platform' },
    { id: 'auditoria', icon: '🔍', label: 'Auditoria' },
    { id: 'seguranca', icon: '🔐', label: 'Segurança' }
  ];

  return (
    <div className="central-qualidade">
      {/* Header */}
      <div className="central-header">
        <div className="central-title">
          <h1>🛡️ Central de Qualidade</h1>
          <p>Plataforma integrada de Quality Engineering, Auditoria e Segurança</p>
        </div>
        
        {/* Métricas rápidas */}
        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-icon">🔬</div>
            <div className="stat-info">
              <div className="stat-value">{metricas.scansTotais}</div>
              <div className="stat-label">Scans</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚠️</div>
            <div className="stat-info">
              <div className="stat-value">{metricas.issuesCriticos}</div>
              <div className="stat-label">Críticos</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <div className="stat-value">{metricas.coberturaTestes}%</div>
              <div className="stat-label">Cobertura</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔐</div>
            <div className="stat-info">
              <div className="stat-value">{metricas.scoreSeg}/100</div>
              <div className="stat-label">Score Seg.</div>
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
        {abaAtiva === 'dashboard' && <Dashboard {...propsComuns} />}
        {abaAtiva === 'pieq' && <PIEQ {...propsComuns} />}
        {abaAtiva === 'auditoria' && <Auditoria {...propsComuns} />}
        {abaAtiva === 'seguranca' && <Seguranca {...propsComuns} />}
      </div>
    </div>
  );
};

export default CentralQualidade;
