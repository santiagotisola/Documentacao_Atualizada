import { useEffect } from 'react';

const Historico = ({ metricas, setMetricas }) => {
  useEffect(() => {
    setMetricas(prev => ({ ...prev, tempoMedioResposta: 45 }));
  }, [setMetricas]);

  return (
    <div className="historico">
      <h2>📊 Histórico Unificado</h2>
      <div className="historico-stats">
        <div className="stat-box">
          <div className="stat-num">1.248</div>
          <div className="stat-label">Atendimentos Total</div>
        </div>
        <div className="stat-box">
          <div className="stat-num">45min</div>
          <div className="stat-label">Tempo Médio</div>
        </div>
        <div className="stat-box">
          <div className="stat-num">96%</div>
          <div className="stat-label">Satisfação</div>
        </div>
      </div>
      <div className="timeline">
        <h3>Atividades Recentes</h3>
        <div className="timeline-item">
          <span className="timeline-time">10:45</span>
          <span className="timeline-type chat">🤖 Chat</span>
          <span className="timeline-desc">João Silva - Encerrado com sucesso</span>
        </div>
        <div className="timeline-item">
          <span className="timeline-time">10:30</span>
          <span className="timeline-type whatsapp">💬 WhatsApp</span>
          <span className="timeline-desc">+55 62 99999-1234 - Respondido</span>
        </div>
        <div className="timeline-item">
          <span className="timeline-time">10:15</span>
          <span className="timeline-type ticket">🎫 Ticket</span>
          <span className="timeline-desc">#HLP-1234 - Resolvido</span>
        </div>
      </div>
      <style>{`
        .historico h2 { margin: 0 0 1.5rem 0; }
        .historico-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .stat-box { background: white; padding: 1.5rem; border-radius: 8px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .stat-num { font-size: 2rem; font-weight: bold; color: #667eea; }
        .stat-label { color: #64748b; margin-top: 0.5rem; }
        .timeline { background: white; padding: 1.5rem; border-radius: 8px; }
        .timeline h3 { margin: 0 0 1rem 0; }
        .timeline-item { display: grid; grid-template-columns: 80px 120px 1fr; gap: 1rem; padding: 1rem; border-left: 3px solid #e2e8f0; margin-bottom: 0.5rem; }
        .timeline-time { font-weight: 600; color: #64748b; }
        .timeline-type { padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem; text-align: center; }
        .timeline-type.chat { background: #e0e7ff; color: #3730a3; }
        .timeline-type.whatsapp { background: #d1fae5; color: #065f46; }
        .timeline-type.ticket { background: #fce7f3; color: #9f1239; }
      `}</style>
    </div>
  );
};

export default Historico;