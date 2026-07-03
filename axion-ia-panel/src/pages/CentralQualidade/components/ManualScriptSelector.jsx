import React, { useState, useEffect } from 'react';
import './ManualScriptSelector.css';

/**
 * Componente para selecionar scripts extraídos dos manuais
 * Permite filtrar por produto, módulo e script específico
 */
const ManualScriptSelector = ({ onScriptSelect, selectedScript, onCreateScript, customScripts = [] }) => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState('');
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carregar produtos disponíveis
  useEffect(() => {
    loadProducts();
  }, []);

  // Carregar módulos quando produto é selecionado
  useEffect(() => {
    if (selectedProduct) {
      loadModules(selectedProduct);
    } else {
      setModules([]);
      setScripts([]);
    }
  }, [selectedProduct]);

  // Carregar scripts quando módulo é selecionado
  useEffect(() => {
    if (selectedProduct && selectedModule) {
      loadScripts(selectedProduct, selectedModule);
    } else {
      setScripts([]);
    }
  }, [selectedProduct, selectedModule]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/manual-scripts/products');
      const data = await response.json();

      if (data.success && data.products) {
        setProducts(data.products);
      } else {
        throw new Error('Erro ao carregar produtos');
      }
    } catch (err) {
      setError('Erro ao carregar produtos dos manuais');
      console.error('Erro ao carregar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadModules = async (productId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/manual-scripts/${productId}/modules`);
      const data = await response.json();

      if (data.success && data.modules) {
        setModules(data.modules);
      } else {
        throw new Error('Erro ao carregar módulos');
      }
    } catch (err) {
      setError('Erro ao carregar módulos do manual');
      console.error('Erro ao carregar módulos:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadScripts = async (productId, moduleId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/manual-scripts/${productId}/${moduleId}/scripts`);
      const data = await response.json();

      if (data.success && data.scripts) {
        setScripts(data.scripts);
      } else {
        throw new Error('Erro ao carregar scripts');
      }
    } catch (err) {
      setError('Erro ao carregar scripts do manual');
      console.error('Erro ao carregar scripts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScriptClick = (script) => {
    onScriptSelect({
      ...script,
      product: selectedProduct,
      module: selectedModule
    });
  };

  // Scripts do manual + scripts criados manualmente para o módulo atual
  const allScripts = [
    ...scripts,
    ...customScripts.filter(s =>
      s.product === selectedProduct && s.module === selectedModule
    )
  ];

  return (
    <div className="manual-script-selector">
      <div className="selector-header">
        <h3>📘 Scripts dos Manuais</h3>
        <p>Escolha um script gerado automaticamente da documentação</p>
      </div>

      {/* Seleção de produto */}
      <div className="selector-group">
        <label>Produto:</label>
        <div className="product-grid">
          {products.map(product => (
            <button
              key={product.id}
              className={`product-card ${selectedProduct === product.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedProduct(product.id);
                setSelectedModule('');
              }}
            >
              <span className="product-icon">{product.icon}</span>
              <span className="product-name">{product.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Seleção de módulo */}
      {modules.length > 0 && (
        <div className="selector-group">
          <label>Módulo:</label>
          <div className="module-list">
            {modules.map(module => (
              <button
                key={module.id}
                className={`module-item ${selectedModule === module.id ? 'active' : ''}`}
                onClick={() => setSelectedModule(module.id)}
              >
                <span className="module-icon">{module.icon}</span>
                <span className="module-name">{module.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lista de scripts */}
      {allScripts.length > 0 && (
        <div className="selector-group">
          <div className="scripts-header">
            <label>Scripts Disponíveis ({allScripts.length}):</label>
            {onCreateScript && (
              <button
                className="btn-create-script"
                onClick={() => onCreateScript({ product: selectedProduct, module: selectedModule })}
                title="Criar novo script manualmente para este módulo"
              >
                ✏️ Criar Script
              </button>
            )}
          </div>
          <div className="scripts-list">
            {allScripts.map(script => (
              <div
                key={script.id}
                className={`script-card ${selectedScript?.id === script.id ? 'selected' : ''} ${script.source === 'manual' ? 'script-card--manual' : ''}`}
                onClick={() => handleScriptClick(script)}
              >
                <div className="script-header">
                  <h4>
                    {script.name}
                    {script.source === 'manual' && <span className="badge-manual">✏️ Manual</span>}
                  </h4>
                  <span className="script-badge">
                    {script.steps} passos • {script.estimatedTime}
                  </span>
                </div>
                <p className="script-description">{script.description}</p>
                {script.dataSchema?.fields?.length > 0 ? (
                  <div className="script-fields">
                    <span className="fields-label">
                      📝 {script.dataSchema.fields.length} campos •{' '}
                      {script.dataSchema.fields.filter(f => f.required).length} obrigatórios
                    </span>
                  </div>
                ) : (
                  <div className="script-fields">
                    <span className="fields-label fields-empty">
                      ⚠️ Sem campos detectados —{' '}
                      {onCreateScript && (
                        <button
                          className="link-add-fields"
                          onClick={(e) => { e.stopPropagation(); onCreateScript(script); }}
                        >
                          adicionar campos
                        </button>
                      )}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="selector-loading">
          <div className="spinner"></div>
          <p>Carregando...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="selector-error">
          <p>⚠️ {error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && selectedModule && allScripts.length === 0 && (
        <div className="selector-empty">
          <p>📭 Nenhum script disponível para este módulo</p>
          {onCreateScript && (
            <button
              className="btn-create-script-empty"
              onClick={() => onCreateScript({ product: selectedProduct, module: selectedModule })}
            >
              ✏️ Criar Script para este módulo
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ManualScriptSelector;
