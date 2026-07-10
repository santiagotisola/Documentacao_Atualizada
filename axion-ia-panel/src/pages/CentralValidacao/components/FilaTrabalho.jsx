import { useState } from 'react';

const FilaTrabalho = ({ filtros, setFiltros, setItemSelecionado, setAbaAtiva }) => {
  const [itens] = useState([
    { id: 1, tipo: 'Infração', produto: 'AxHub', prioridade: 'alta', operador: null, status: 'aguardando' },
    { id: 2, tipo: 'Pesagem', produto: 'AxTon', prioridade: 'média', operador: null, status: 'aguardando' },
    { id: 3, tipo: 'Cruzamento', produto: 'AxCross', prioridade: 'alta', operador: 'João Silva', status: 'em_validacao' },
    { id: 4, tipo: 'Infração', produto: 'AxHub', prioridade: 'baixa', operador: null, status: 'aguardando' },
    { id: 5, tipo: 'Medição', produto: 'AxHub', prioridade: 'média', operador: 'Maria Santos', status: 'em_validacao' }
  ]);

  const handleValidar = (item) => {
    setItemSelecionado(item);
    if (item.tipo === 'Infração') {
      setAbaAtiva('visual');
    } else {
      setAbaAtiva('ia');
    }
  };

  const getPrioridadeClass = (prioridade) => {
    const classes = {
      'alta': 'prioridade-alta',
      'média': 'prioridade-media',
      'baixa': 'prioridade-baixa'
    };
    return classes[prioridade] || '';
  };

  return (
    <div className="fila-trabalho">
      <h2>📋 Fila de Trabalho</h2>

      {/* Filtros */}
      <div className="filtros-container">
        <select 
          value={filtros.produto} 
          onChange={(e) => setFiltros({...filtros, produto: e.target.value})}
        >
          <option value="todos">Todos os Produtos</option>
          <option value="AxHub">AxHub</option>
          <option value="AxTon">AxTon</option>
          <option value="AxCross">AxCross</option>
        </select>

        <select 
          value={filtros.prioridade} 
          onChange={(e) => setFiltros({...filtros, prioridade: e.target.value})}
        >
          <option value="todas">Todas as Prioridades</option>
          <option value="alta">Alta</option>
          <option value="média">Média</option>
          <option value="baixa">Baixa</option>
        </select>

        <select 
          value={filtros.operador} 
          onChange={(e) => setFiltros({...filtros, operador: e.target.value})}
        >
          <option value="todos">Todos os Operadores</option>
          <option value="livre">Não Atribuídos</option>
          <option value="meus">Meus Itens</option>
        </select>
      </div>

      {/* Lista de itens */}
      <div className="itens-lista">
        {itens.map(item => (
          <div key={item.id} className="item-card">
            <div className="item-header">
              <span className={`prioridade-badge ${getPrioridadeClass(item.prioridade)}`}>
                {item.prioridade.toUpperCase()}
              </span>
              <span className="produto-badge">{item.produto}</span>
            </div>
            
            <div className="item-body">
              <h4>{item.tipo} #{item.id}</h4>
              <p>Status: {item.status === 'aguardando' ? '⏳ Aguardando' : '🔄 Em Validação'}</p>
              {item.operador && <p>Operador: {item.operador}</p>}
            </div>

            <div className="item-actions">
              {!item.operador ? (
                <button className="btn-primary" onClick={() => handleValidar(item)}>
                  ✅ Validar Agora
                </button>
              ) : (
                <button className="btn-secondary" disabled>
                  🔒 Em uso por {item.operador}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .fila-trabalho h2 {
          margin: 0 0 1.5rem 0;
        }

        .filtros-container {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .filtros-container select {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
        }

        .itens-lista {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1rem;
        }

        .item-card {
          background: white;
          border-radius: 8px;
          padding: 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .item-header {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .prioridade-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .prioridade-alta {
          background: #fee2e2;
          color: #991b1b;
        }

        .prioridade-media {
          background: #fef3c7;
          color: #92400e;
        }

        .prioridade-baixa {
          background: #dbeafe;
          color: #1e40af;
        }

        .produto-badge {
          padding: 0.25rem 0.5rem;
          background: #e0e7ff;
          color: #3730a3;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .item-body h4 {
          margin: 0 0 0.5rem 0;
        }

        .item-body p {
          margin: 0.25rem 0;
          font-size: 0.9rem;
          color: #64748b;
        }

        .item-actions {
          margin-top: 1rem;
          display: flex;
          gap: 0.5rem;
        }

        .btn-primary, .btn-secondary {
          flex: 1;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #667eea;
          color: white;
        }

        .btn-primary:hover {
          background: #5568d3;
        }

        .btn-secondary {
          background: #e2e8f0;
          color: #64748b;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default FilaTrabalho;
