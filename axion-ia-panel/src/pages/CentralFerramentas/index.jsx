import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import QuickSelect from '../../components/QuickSelect.jsx';
import './CentralFerramentas.css';

import Infracoes from './components/Infracoes';
import Pesagem from './components/Pesagem';
import Cruzamentos from './components/Cruzamentos';

const CentralFerramentas = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'infracoes';
  const [abaAtiva, setAbaAtiva] = useState(tabFromUrl);
  
  const [metricas, setMetricas] = useState({
    consultasHoje: 0,
    registrosEncontrados: 0,
    tempoMedio: 0
  });

  useEffect(() => {
    setSearchParams({ tab: abaAtiva });
  }, [abaAtiva, setSearchParams]);

  const propsComuns = { metricas, setMetricas, setAbaAtiva };

  const abas = [
    { id: 'infracoes', icon: '🚗', label: 'Infrações AxHub' },
    { id: 'pesagem', icon: '⚖️', label: 'Pesagem AxTon' },
    { id: 'cruzamentos', icon: '🛡️', label: 'Cruzamentos AxCross' }
  ];

  return (
    <div className="central-ferramentas">
      <div className="central-header">
        <div className="central-title">
          <h1>🔧 Central de Ferramentas</h1>
          <p>Consultas unificadas por produto — Infrações Pesagem e Monitoramento</p>
        </div>
        <div className="quick-stats">
          <div className="stat-card"><div className="stat-icon">🔍</div><div className="stat-info"><div className="stat-value">{metricas.consultasHoje}</div><div className="stat-label">Consultas</div></div></div>
          <div className="stat-card"><div className="stat-icon">📊</div><div className="stat-info"><div className="stat-value">{metricas.registrosEncontrados}</div><div className="stat-label">Registros</div></div></div>
          <div className="stat-card"><div className="stat-icon">⏱️</div><div className="stat-info"><div className="stat-value">{metricas.tempoMedio}s</div><div className="stat-label">Tempo Médio</div></div></div>
        </div>
      </div>
      <div style={{ padding: '8px 0 4px' }}>
        <QuickSelect options={abas} value={abaAtiva} onChange={setAbaAtiva} color="#f59e0b" label="Ferramenta" />
      </div>
      <div className="central-content">
        {abaAtiva === 'infracoes' && <Infracoes {...propsComuns} />}
        {abaAtiva === 'pesagem' && <Pesagem {...propsComuns} />}
        {abaAtiva === 'cruzamentos' && <Cruzamentos {...propsComuns} />}
      </div>
    </div>
  );
};

export default CentralFerramentas;
