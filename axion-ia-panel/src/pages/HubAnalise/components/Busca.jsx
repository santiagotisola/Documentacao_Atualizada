import { useEffect } from 'react';

const Busca = ({ metricas, setMetricas }) => {
  useEffect(() => { setMetricas(prev => ({ ...prev, buscasRealizadas: 345 })); }, [setMetricas]);

  return (
    <div className="busca">
      <h2>🔍 Busca Unificada</h2>
      <p className="subtitle">Busque em Sistemas, Imagens e Documentos de forma unificada</p>
      <div className="busca-form">
        <div className="search-types">
          <button className="type-btn active">📦 Sistemas</button>
          <button className="type-btn">📸 Imagens</button>
          <button className="type-btn">📄 Documentos</button>
        </div>
        <div className="search-input-group">
          <input type="text" placeholder="Digite sua busca..." className="search-input" />
          <button className="btn-search">🔍 Buscar</button>
        </div>
        <div className="filters">
          <select><option>Todos os Sites</option></select>
          <input type="date" placeholder="Data Início" />
          <input type="date" placeholder="Data Fim" />
        </div>
      </div>
      <div className="resultados">
        <h3>Resultados Recentes</h3>
        <p className="empty-state">Faça uma busca para ver os resultados</p>
      </div>
      <style>{`
        .busca h2 { margin: 0 0 0.5rem 0; }
        .subtitle { color: #64748b; margin: 0 0 1.5rem 0; }
        .busca-form { background: white; padding: 2rem; border-radius: 8px; margin-bottom: 1.5rem; }
        .search-types { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
        .type-btn { padding: 0.5rem 1rem; border: 1px solid #e2e8f0; background: white; border-radius: 4px; cursor: pointer; transition: all 0.2s; }
        .type-btn.active { background: #667eea; color: white; border-color: #667eea; }
        .search-input-group { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
        .search-input { flex: 1; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 1rem; }
        .btn-search { padding: 0.75rem 2rem; background: #667eea; color: white; border: none; border-radius: 4px; font-weight: 600; cursor: pointer; }
        .filters { display: flex; gap: 0.5rem; }
        .filters select, .filters input { flex: 1; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; }
        .resultados { background: white; padding: 2rem; border-radius: 8px; }
        .resultados h3 { margin: 0 0 1rem 0; }
        .empty-state { text-align: center; padding: 3rem; color: #64748b; }
      `}</style>
    </div>
  );
};

export default Busca;