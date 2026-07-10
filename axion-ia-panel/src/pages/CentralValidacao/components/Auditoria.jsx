const Auditoria = () => {
  return (
    <div className="auditoria">
      <h2>🔍 Auditoria</h2>
      <div className="auditoria-grid">
        <div className="auditoria-card">
          <h3>Qualidade por Operador</h3>
          <div className="operador-lista">
            <div className="operador-item">
              <span className="nome">João Silva</span>
              <span className="qualidade success">98%</span>
            </div>
            <div className="operador-item">
              <span className="nome">Maria Santos</span>
              <span className="qualidade success">95%</span>
            </div>
            <div className="operador-item">
              <span className="nome">Pedro Oliveira</span>
              <span className="qualidade warning">87%</span>
            </div>
          </div>
        </div>
        <div className="auditoria-card">
          <h3>Retrabalho</h3>
          <p className="metrica">Taxa de Retrabalho: <strong>4.2%</strong></p>
          <p className="desc">12 itens precisaram de revisão nos últimos 7 dias</p>
        </div>
        <div className="auditoria-card wide">
          <h3>Histórico de Validações</h3>
          <p>Tabela com histórico completo de Validações filtros por período, operador, tipo...</p>
        </div>
      </div>
      <style>{`
        .auditoria h2 { margin: 0 0 1.5rem 0; }
        .auditoria-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
        .auditoria-card { background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .auditoria-card.wide { grid-column: 1 / -1; }
        .auditoria-card h3 { margin: 0 0 1rem 0; }
        .operador-lista { display: flex; flex-direction: column; gap: 0.75rem; }
        .operador-item { display: flex; justify-content: space-between; padding: 0.75rem; background: #f8f9fc; border-radius: 4px; }
        .qualidade { font-weight: 600; }
        .qualidade.success { color: #10b981; }
        .qualidade.warning { color: #f59e0b; }
        .metrica { font-size: 1.1rem; margin: 0.5rem 0; }
        .desc { color: #64748b; font-size: 0.9rem; }
      `}</style>
    </div>
  );
};

export default Auditoria;