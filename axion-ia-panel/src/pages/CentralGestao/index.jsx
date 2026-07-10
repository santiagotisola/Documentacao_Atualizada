import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import QuickSelect from '../../components/QuickSelect.jsx';
import './CentralGestao.css';

// Componentes das abas
import Roadmap from './components/Roadmap';
import Specs from './components/Specs';
import Backlog from './components/Backlog';

const CentralGestao = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'roadmap';
  const [abaAtiva, setAbaAtiva] = useState(tabFromUrl);
  
  const [metricas, setMetricas] = useState({
    featuresAtivas: 0,
    specsTotal: 0,
    tarefasPendentes: 0,
    progresso: 0
  });

  useEffect(() => {
    setSearchParams({ tab: abaAtiva });
  }, [abaAtiva, setSearchParams]);

  const propsComuns = { metricas, setMetricas, setAbaAtiva };

  const abas = [
    { id: 'roadmap', icon: '🗺️', label: 'Roadmap' },
    { id: 'specs', icon: '📋', label: 'Especificações' },
    { id: 'backlog', icon: '📦', label: 'Backlog' }
  ];

  return (
    <div className="central-gestao">
      <div className="central-header">
        <div className="central-title">
          <h1>🎯 Central de Gestão de Produtos</h1>
          <p>Roadmap, Especificações e Planejamento unificado</p>
        </div>
        <div className="quick-stats">
          <div className="stat-card"><div className="stat-icon">🚀</div><div className="stat-info"><div className="stat-value">{metricas.featuresAtivas}</div><div className="stat-label">Features</div></div></div>
          <div className="stat-card"><div className="stat-icon">📋</div><div className="stat-info"><div className="stat-value">{metricas.specsTotal}</div><div className="stat-label">Specs</div></div></div>
          <div className="stat-card"><div className="stat-icon">📦</div><div className="stat-info"><div className="stat-value">{metricas.tarefasPendentes}</div><div className="stat-label">Tarefas</div></div></div>
          <div className="stat-card"><div className="stat-icon">📈</div><div className="stat-info"><div className="stat-value">{metricas.progresso}%</div><div className="stat-label">Progresso</div></div></div>
        </div>
      </div>
      <div style={{ padding: '8px 0 4px' }}>
        <QuickSelect options={abas} value={abaAtiva} onChange={setAbaAtiva} color="#8b5cf6" label="Módulo" />
      </div>
      <div className="central-content">
        {abaAtiva === 'roadmap' && <Roadmap {...propsComuns} />}
        {abaAtiva === 'specs' && <Specs {...propsComuns} />}
        {abaAtiva === 'backlog' && <Backlog {...propsComuns} />}
      </div>
    </div>
  );
};

export default CentralGestao;
