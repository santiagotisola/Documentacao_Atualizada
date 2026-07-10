import { useEffect } from 'react';

const Dashboard = ({ estatisticas, setEstatisticas }) => {
  useEffect(() => {
    // Simular carregamento de estatísticas
    setEstatisticas({
      aguardando: 142,
      validados: 1248,
      rejeitados: 89,
      taxaAprovacao: 93.4
    });
  }, [setEstatisticas]);

  return (
    <div className="dashboard-validacao">
      <h2>📊 Dashboard de Validação</h2>
      
      <div className="dashboard-grid">
        {/* Métricas principais */}
        <div className="dashboard-card">
          <h3>Métricas Gerais</h3>
          <div className="metricas-lista">
            <div className="metrica-item">
              <span className="metrica-label">Total Aguardando:</span>
              <span className="metrica-valor">{estatisticas.aguardando}</span>
            </div>
            <div className="metrica-item">
              <span className="metrica-label">Validados Hoje:</span>
              <span className="metrica-valor">{estatisticas.validados}</span>
            </div>
            <div className="metrica-item">
              <span className="metrica-label">Rejeitados:</span>
              <span className="metrica-valor danger">{estatisticas.rejeitados}</span>
            </div>
            <div className="metrica-item">
              <span className="metrica-label">Taxa de Aprovação:</span>
              <span className="metrica-valor success">{estatisticas.taxaAprovacao}%</span>
            </div>
          </div>
        </div>

        {/* Performance por operador */}
        <div className="dashboard-card">
          <h3>Performance por Operador</h3>
          <div className="operadores-lista">
            <div className="operador-item">
              <div className="operador-info">
                <span className="operador-nome">João Silva</span>
                <span className="operador-stats">342 Validações | 95% aprovação</span>
              </div>
              <div className="operador-badge success">✅ Excelente</div>
            </div>
            <div className="operador-item">
              <div className="operador-info">
                <span className="operador-nome">Maria Santos</span>
                <span className="operador-stats">298 Validações | 92% aprovação</span>
              </div>
              <div className="operador-badge success">✅ Ótimo</div>
            </div>
            <div className="operador-item">
              <div className="operador-info">
                <span className="operador-nome">Pedro Oliveira</span>
                <span className="operador-stats">256 Validações | 88% aprovação</span>
              </div>
              <div className="operador-badge warning">⚠️ Bom</div>
            </div>
          </div>
        </div>

        {/* Gráfico de tendência (placeholder) */}
        <div className="dashboard-card wide">
          <h3>Tendência de Validações (Últimos 7 dias)</h3>
          <div className="grafico-placeholder">
            <p>📈 Gráfico de linha mostrando volume de Validações por dia</p>
            <p className="text-muted">Implementar com biblioteca de gráficos (Chart.js ou Recharts)</p>
          </div>
        </div>

        {/* SLA */}
        <div className="dashboard-card">
          <h3>SLA de Validação</h3>
          <div className="sla-info">
            <div className="sla-item">
              <span className="sla-label">Tempo Médio:</span>
              <span className="sla-valor">2h 34min</span>
            </div>
            <div className="sla-item">
              <span className="sla-label">Meta SLA:</span>
              <span className="sla-valor">4 horas</span>
            </div>
            <div className="sla-item">
              <span className="sla-label">Compliance:</span>
              <span className="sla-valor success">96.8%</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-validacao h2 {
          margin: 0 0 1.5rem 0;
          color: #1a202c;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .dashboard-card {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .dashboard-card.wide {
          grid-column: 1 / -1;
        }

        .dashboard-card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          color: #1a202c;
        }

        .metricas-lista, .sla-info {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .metrica-item, .sla-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .metrica-label, .sla-label {
          color: #64748b;
          font-size: 0.9rem;
        }

        .metrica-valor, .sla-valor {
          font-weight: 600;
          font-size: 1.1rem;
          color: #1a202c;
        }

        .metrica-valor.success, .sla-valor.success {
          color: #10b981;
        }

        .metrica-valor.danger {
          color: #ef4444;
        }

        .operadores-lista {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .operador-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #f8f9fc;
          border-radius: 6px;
        }

        .operador-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .operador-nome {
          font-weight: 600;
          color: #1a202c;
        }

        .operador-stats {
          font-size: 0.85rem;
          color: #64748b;
        }

        .operador-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .operador-badge.success {
          background: #d1fae5;
          color: #065f46;
        }

        .operador-badge.warning {
          background: #fef3c7;
          color: #92400e;
        }

        .grafico-placeholder {
          background: #f8f9fc;
          border: 2px dashed #cbd5e1;
          border-radius: 6px;
          padding: 3rem 2rem;
          text-align: center;
          color: #64748b;
        }

        .text-muted {
          font-size: 0.85rem;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
