import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSiteContext } from '../../context/SiteContext.jsx';
import QuickSelect from '../../components/QuickSelect.jsx';
import './CentralRelatorios.css';

// Componentes das abas
import Operacionais from './components/Operacionais';
import VARCO from './components/VARCO';
import Medicao from './components/Medicao';
import SLA from './components/SLA';

const CentralRelatorios = () => {
  const { activeSite } = useSiteContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'operacionais';
  const [abaAtiva, setAbaAtiva] = useState(tabFromUrl);
  
  const [metricas, setMetricas] = useState({
    relatoriosGerados: 0,
    equipamentosMonitorados: 0,
    sitesAtivos: 0,
    slaCompliance: 0
  });

  useEffect(() => {
    setSearchParams({ tab: abaAtiva });
  }, [abaAtiva, setSearchParams]);

  const propsComuns = { metricas, setMetricas, setAbaAtiva, siteContexto: activeSite };

  const abas = [
    { id: 'operacionais', icon: '📊', label: 'Operacionais' },
    { id: 'varco', icon: '📡', label: 'VARCO Monitor' },
    { id: 'medicao', icon: '🩺', label: 'Medição' },
    { id: 'sla', icon: '✅', label: 'SLA' }
  ];

  return (
    <div className="central-relatorios">
      <div className="central-header">
        <div className="central-title">
          <h1>📈 Central de Relatórios</h1>
          <p>Relatórios operacionais, monitoramento e métricas de SLA</p>
        </div>
        <div className="quick-stats">
          <div className="stat-card"><div className="stat-icon">📄</div><div className="stat-info"><div className="stat-value">{metricas.relatoriosGerados}</div><div className="stat-label">Relatórios</div></div></div>
          <div className="stat-card"><div className="stat-icon">📡</div><div className="stat-info"><div className="stat-value">{metricas.equipamentosMonitorados}</div><div className="stat-label">Equipamentos</div></div></div>
          <div className="stat-card"><div className="stat-icon">✅</div><div className="stat-info"><div className="stat-value">{metricas.slaCompliance}%</div><div className="stat-label">SLA</div></div></div>
        </div>
      </div>
      <div style={{ padding: '8px 0 4px' }}>
        <QuickSelect options={abas} value={abaAtiva} onChange={setAbaAtiva} color="#10b981" label="Relatório" />
      </div>
      <div className="central-content">
        {abaAtiva === 'operacionais' && <Operacionais {...propsComuns} />}
        {abaAtiva === 'varco' && <VARCO {...propsComuns} />}
        {abaAtiva === 'medicao' && <Medicao {...propsComuns} />}
        {abaAtiva === 'sla' && <SLA {...propsComuns} />}
      </div>
    </div>
  );
};

export default CentralRelatorios;
