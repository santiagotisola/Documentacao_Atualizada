import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Navigate } from 'react-router-dom';
import { useSiteContext } from '../../context/SiteContext.jsx';
import { api } from '../../services/api.js';
import './CentralAtendimento.css';

// Componentes das abas
import ChatIA from './components/ChatIA';
import WhatsApp from './components/WhatsApp';
import Helpdesk from './components/Helpdesk';
import Historico from './components/Historico';
const CentralAtendimento = () => {
  const { activeSite } = useSiteContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabFromUrl = searchParams.get('tab') || 'chat';
  const [abaAtiva, setAbaAtiva] = useState(tabFromUrl);

  // Quando chega com site ativo, ir para Central de Sites (único ponto)
  useEffect(() => {
    if (activeSite && abaAtiva === 'chat') navigate('/central-sites?tab=chamados', { replace: true });
  }, [activeSite]);
  
  // Métricas do header
  const [metricasLoading, setMetricasLoading] = useState(false);

  const fetchMetricas = useCallback(async () => {
    setMetricasLoading(true);
    try {
      const [abertosRes, chatRes] = await Promise.allSettled([
        api.get('/helpdesk/tickets?mode=0&count=200'),
        api.get('/chat/sessions?status=active&limit=1'),
      ]);

      const ticketsAbertos = abertosRes.status === 'fulfilled'
        ? (abertosRes.value.data.total ?? (abertosRes.value.data.tickets || []).length)
        : 0;

      const chatAtivos = chatRes.status === 'fulfilled'
        ? (chatRes.value.data.total ?? chatRes.value.data.count ?? 0)
        : 0;

      setMetricas(prev => ({
        ...prev,
        ticketsAbertos,
        chatAtivos,
      }));
    } catch { /* mantém zeros em caso de falha total */ }
    finally { setMetricasLoading(false); }
  }, []);

  useEffect(() => { fetchMetricas(); }, [fetchMetricas]);

  // Estado compartilhado
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [ticketAtivo, setTicketAtivo] = useState(null);
  const [conversaAtiva, setConversaAtiva] = useState(null);
  const [metricas, setMetricas] = useState({
    chatAtivos: 0,
    whatsappPendentes: 0,
    ticketsAbertos: 0,
    tempoMedioResposta: 0
  });

  useEffect(() => {
    if (abaAtiva === 'validador') return; // redireciona para CentralValidacao
    setSearchParams({ tab: abaAtiva });
  }, [abaAtiva, setSearchParams]);

  const propsComuns = {
    clienteSelecionado,
    setClienteSelecionado,
    ticketAtivo,
    setTicketAtivo,
    conversaAtiva,
    setConversaAtiva,
    metricas,
    setMetricas,
    setAbaAtiva,
    siteContexto: activeSite,
  };

  const abas = [
    { id: 'chat', icon: '🤖', label: 'Chat IA' },
    { id: 'whatsapp', icon: '💬', label: 'WhatsApp' },
    { id: 'helpdesk', icon: '🎧', label: 'Helpdesk' },
    { id: 'historico', icon: '📊', label: 'Histórico' }
  ];

  // Redirect após todos os hooks (regra do React)
  if (tabFromUrl === 'validador') {
    return <Navigate to="/central-validacao?tab=validador-axcross" replace />;
  }

  return (
    <div className="central-atendimento">
      {/* Header */}
      <div className="central-header">
        <div className="central-title">
          <h1>🎧 Central de Atendimento</h1>
          <p>Hub unificado de atendimento — Chat IA, WhatsApp, Helpdesk e Gestão por Site</p>
        </div>
        <button
          className="central-refresh-btn"
          onClick={fetchMetricas}
          disabled={metricasLoading}
          title="Atualizar métricas"
        >
          {metricasLoading ? '⏳' : '🔄'} Atualizar
        </button>
        
        {/* Métricas rápidas */}
        <div className="quick-stats">
          <div className="stat-card chat">
            <div className="stat-icon">🤖</div>
            <div className="stat-info">
              <div className="stat-value">{metricas.chatAtivos}</div>
              <div className="stat-label">Chat Ativos</div>
            </div>
          </div>
          <div className="stat-card whatsapp">
            <div className="stat-icon">💬</div>
            <div className="stat-info">
              <div className="stat-value">{metricas.whatsappPendentes}</div>
              <div className="stat-label">WhatsApp</div>
            </div>
          </div>
          <div className="stat-card tickets">
            <div className="stat-icon">🎫</div>
            <div className="stat-info">
              <div className="stat-value">{metricas.ticketsAbertos}</div>
              <div className="stat-label">Tickets</div>
            </div>
          </div>
          <div className="stat-card tempo">
            <div className="stat-icon">⏱️</div>
            <div className="stat-info">
              <div className="stat-value">{metricas.tempoMedioResposta}min</div>
              <div className="stat-label">Tempo Médio</div>
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
            {aba.label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="central-content">
        {abaAtiva === 'chat' && <ChatIA {...propsComuns} />}
        {abaAtiva === 'whatsapp' && <WhatsApp {...propsComuns} />}
        {abaAtiva === 'helpdesk' && <Helpdesk {...propsComuns} />}
        {abaAtiva === 'historico' && <Historico {...propsComuns} />}
      </div>
    </div>
  );
};

export default CentralAtendimento;
