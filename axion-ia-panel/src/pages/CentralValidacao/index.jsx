import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './CentralValidacao.css';

// Componentes das abas
import Dashboard from './components/Dashboard';
import FilaTrabalho from './components/FilaTrabalho';
import ValidacaoVisual from './components/ValidacaoVisual';
import ValidacaoLinguistica from './components/ValidacaoLinguistica';
import RevisaoIA from './components/RevisaoIA';
import Auditoria from './components/Auditoria';
import Configuracoes from './components/Configuracoes';
import ValidadorAxCross from '../CentralAtendimento/components/ValidadorAxCross';

const CentralValidacao = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'dashboard';
  const [abaAtiva, setAbaAtiva] = useState(tabFromUrl);
  
  // Estado compartilhado entre abas
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [filtros, setFiltros] = useState({
    produto: 'todos',
    prioridade: 'todas',
    operador: 'todos'
  });
  const [estatisticas, setEstatisticas] = useState({
    aguardando: 0,
    validados: 0,
    rejeitados: 0,
    taxaAprovacao: 0
  });

  // Atualizar URL quando mudar de aba
  useEffect(() => {
    setSearchParams({ tab: abaAtiva });
  }, [abaAtiva, setSearchParams]);

  // Props compartilhadas entre componentes
  const propsComuns = {
    itemSelecionado,
    setItemSelecionado,
    filtros,
    setFiltros,
    estatisticas,
    setEstatisticas,
    setAbaAtiva
  };

  const abas = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'fila', icon: '📋', label: 'Fila de Trabalho' },
    { id: 'visual', icon: '🖼️', label: 'Validação Visual' },
    { id: 'linguistica', icon: '🔤', label: 'Validação Linguística' },
    { id: 'ia', icon: '🤖', label: 'Revisão IA' },
    { id: 'auditoria', icon: '🔍', label: 'Auditoria' },
    { id: 'config', icon: '⚙️', label: 'Configurações' },
    { id: 'validador-axcross', icon: '🔬', label: 'Validador AxCross' }
  ];

  return (
    <div className="central-validacao">
      {/* Header */}
      <div className="central-header">
        <div className="central-title">
          <h1>✅ Central de Validação</h1>
          <p>Hub unificado de Validação revisão e controle de qualidade</p>
        </div>
        
        {/* Stats rápidas */}
        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <div className="stat-value">{estatisticas.aguardando}</div>
              <div className="stat-label">Aguardando</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <div className="stat-value">{estatisticas.validados}</div>
              <div className="stat-label">Validados</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-info">
              <div className="stat-value">{estatisticas.taxaAprovacao}%</div>
              <div className="stat-label">Taxa Aprovação</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de navegação */}
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

      {/* Conteúdo das abas */}
      <div className="central-content">
        {abaAtiva === 'dashboard' && <Dashboard {...propsComuns} />}
        {abaAtiva === 'fila' && <FilaTrabalho {...propsComuns} />}
        {abaAtiva === 'visual' && <ValidacaoVisual {...propsComuns} />}
        {abaAtiva === 'linguistica' && <ValidacaoLinguistica {...propsComuns} />}
        {abaAtiva === 'ia' && <RevisaoIA {...propsComuns} />}
        {abaAtiva === 'auditoria' && <Auditoria {...propsComuns} />}
        {abaAtiva === 'config' && <Configuracoes {...propsComuns} />}
        {abaAtiva === 'validador-axcross' && <ValidadorAxCross />}
      </div>
    </div>
  );
};

export default CentralValidacao;
