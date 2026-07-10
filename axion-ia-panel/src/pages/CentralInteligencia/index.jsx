import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './CentralInteligencia.css';

import Pipeline from './components/Pipeline';
import Busca from './components/Busca';
import Analise from './components/Analise';
import MultiProduto from './components/MultiProduto';
import Conformidade from './components/Conformidade';

const CentralInteligencia = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'pipeline';
  const [abaAtiva, setAbaAtiva] = useState(tabFromUrl);
  
  const [metricas, setMetricas] = useState({
    editaisAtivos: 0,
    analisesPendentes: 0,
    conformidade: 0,
    oportunidades: 0
  });

  useEffect(() => {
    setSearchParams({ tab: abaAtiva });
  }, [abaAtiva, setSearchParams]);

  const propsComuns = { metricas, setMetricas, setAbaAtiva };

  const abas = [
    { id: 'pipeline', icon: '🏗️', label: 'Pipeline' },
    { id: 'busca', icon: '🔍', label: 'Busca Editais' },
    { id: 'analise', icon: '📊', label: 'Análise Avançada' },
    { id: 'multi', icon: '🎯', label: 'Multi-Produto' },
    { id: 'conformidade', icon: '✅', label: 'Conformidade' }
  ];

  return (
    <div className="central-inteligencia">
      <div className="central-header">
        <div className="central-title">
          <h1>🧠 Central de Inteligência de Mercado</h1>
          <p>Pipeline completo: Buscar → Analisar → Avaliar → Propor</p>
        </div>
        <div className="quick-stats">
          <div className="stat-card"><div className="stat-icon">📋</div><div className="stat-info"><div className="stat-value">{metricas.editaisAtivos}</div><div className="stat-label">Editais</div></div></div>
          <div className="stat-card"><div className="stat-icon">📊</div><div className="stat-info"><div className="stat-value">{metricas.analisesPendentes}</div><div className="stat-label">Análises</div></div></div>
          <div className="stat-card"><div className="stat-icon">✅</div><div className="stat-info"><div className="stat-value">{metricas.conformidade}%</div><div className="stat-label">Conformidade</div></div></div>
          <div className="stat-card"><div className="stat-icon">🎯</div><div className="stat-info"><div className="stat-value">{metricas.oportunidades}</div><div className="stat-label">Oportunidades</div></div></div>
        </div>
      </div>
      <div className="central-tabs">
        {abas.map(aba => (
          <button key={aba.id} className={`tab-button ${abaAtiva === aba.id ? 'active' : ''}`} onClick={() => setAbaAtiva(aba.id)}>
            <span className="tab-icon">{aba.icon}</span><span className="tab-label">{aba.label}</span>
          </button>
        ))}
      </div>
      <div className="central-content">
        {abaAtiva === 'pipeline' && <Pipeline {...propsComuns} />}
        {abaAtiva === 'busca' && <Busca {...propsComuns} />}
        {abaAtiva === 'analise' && <Analise {...propsComuns} />}
        {abaAtiva === 'multi' && <MultiProduto {...propsComuns} />}
        {abaAtiva === 'conformidade' && <Conformidade {...propsComuns} />}
      </div>
    </div>
  );
};

export default CentralInteligencia;
