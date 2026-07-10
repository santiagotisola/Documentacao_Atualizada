const Configuracoes = () => {
  return (
    <div className="configuracoes">
      <h2>⚙️ Configurações</h2>
      <div className="config-sections">
        <div className="config-section">
          <h3>Regras de Validação</h3>
          <div className="form-group">
            <label>Threshold de Confiança OCR (%):</label>
            <input type="number" defaultValue="80" min="0" max="100" />
          </div>
          <div className="form-group">
            <label>Validação Automática:</label>
            <select>
              <option>Desabilitado</option>
              <option>Apenas alta confiança (&gt;95%)</option>
              <option>Confiança média e alta (&gt;80%)</option>
            </select>
          </div>
        </div>
        <div className="config-section">
          <h3>Atribuição de Trabalho</h3>
          <div className="form-group">
            <label>Modo de Atribuição:</label>
            <select>
              <option>Manual (operador escolhe)</option>
              <option>Automático (round-robin)</option>
              <option>Por carga (balanceado)</option>
            </select>
          </div>
        </div>
        <div className="config-section">
          <h3>Notificações</h3>
          <div className="checkbox-group">
            <label><input type="checkbox" defaultChecked /> Notificar novos itens na fila</label>
            <label><input type="checkbox" defaultChecked /> Alertar SLA próximo do vencimento</label>
            <label><input type="checkbox" /> Resumo diário por e-mail</label>
          </div>
        </div>
        <div className="config-section">
          <button className="btn-save">💾 Salvar Configurações</button>
        </div>
      </div>
      <style>{`
        .configuracoes h2 { margin: 0 0 1.5rem 0; }
        .config-sections { display: grid; gap: 1.5rem; }
        .config-section { background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .config-section h3 { margin: 0 0 1rem 0; font-size: 1.1rem; }
        .form-group { margin-bottom: 1rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
        .form-group input, .form-group select { width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; }
        .checkbox-group { display: flex; flex-direction: column; gap: 0.75rem; }
        .checkbox-group label { display: flex; align-items: center; gap: 0.5rem; }
        .btn-save { width: 100%; padding: 0.75rem; background: #667eea; color: white; border: none; border-radius: 4px; font-weight: 600; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default Configuracoes;