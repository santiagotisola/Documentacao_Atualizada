import React, { useState, useEffect } from 'react';
import { Activity, AlertCircle, CheckCircle, Loader, Search, XCircle } from 'lucide-react';
import { api } from '../../../services/api';
import './DiagnosticoMedicao.css';

const Diagnosticos = () => {
  const [sistemasAgrupados, setSistemasAgrupados] = useState({});
  const [sistemaAtual, setSistemaAtual] = useState(null);
  const [grupos, setGrupos] = useState([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState('');
  const [equipamentos, setEquipamentos] = useState([]);
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState('');
  const [diagnostico, setDiagnostico] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [codigoManual, setCodigoManual] = useState('');
  const [mostrarManual, setMostrarManual] = useState(false);
  
  // Carregar sistemas da API ao montar o componente
  useEffect(() => {
    carregarSistemas();
  }, []);
  
  const carregarSistemas = async () => {
    try {
      const response = await api.get('/medicao/sistemas');
      const sistemas = response.data;
      
      // Filtrar apenas AxHub
      const sistemasAxHub = sistemas.filter(s => s.produto === 'AxHub');
      
      // Agrupar sistemas por produto
      const grupos = sistemasAxHub.reduce((acc, sistema) => {
        const produto = sistema.produto || 'Outros';
        if (!acc[produto]) {
          acc[produto] = [];
        }
        acc[produto].push(sistema);
        return acc;
      }, {});
      
      setSistemasAgrupados(grupos);
    } catch (err) {
      console.error('Erro ao carregar sistemas:', err);
      setErro('Erro ao carregar sistemas: ' + (err.response?.data?.erro || err.message));
    }
  };
  
  // Conectar ao sistema
  const conectarSistema = async (sistema) => {
    setSistemaAtual(sistema);
    setLoading(true);
    setErro(null);
    
    try {
      // Buscar equipamentos via API
      const response = await api.get(`/medicao/equipamentos?sistema=${sistema.id}`);
      const data = response.data;
      
      setEquipamentos(data.equipamentos || []);
      
      // Extrair grupos únicos
      const gruposUnicos = [...new Set(data.equipamentos.map(e => e.grupo))];
      setGrupos(gruposUnicos);
      
    } catch (err) {
      console.error('Erro ao conectar:', err);
      setErro('Erro ao conectar ao sistema: ' + (err.response?.data?.erro || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Gerar diagnóstico
  const gerarDiagnostico = async () => {
    if (!equipamentoSelecionado) {
      setErro('Selecione um equipamento');
      return;
    }
    
    setLoading(true);
    setErro(null);
    setDiagnostico(null);
    
    try {
      // Chamar API de diagnóstico
      const response = await api.get(`/medicao/diagnostico?sistema=${sistemaAtual.id}&equipamento=${equipamentoSelecionado}`);
      const diagData = response.data;
      
      setDiagnostico(diagData);
      
    } catch (err) {
      console.error('Erro ao gerar diagnóstico:', err);
      setErro('Erro ao gerar diagnóstico: ' + (err.response?.data?.erro || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Usar código manual
  const usarCodigoManual = () => {
    if (!codigoManual.trim()) {
      alert('Informe o código do equipamento');
      return;
    }
    
    const codigo = codigoManual.trim().toUpperCase();
    
    // Adicionar à lista se não existir
    const existe = equipamentos.find(e => e.codigo === codigo);
    if (!existe) {
      const novoEquip = {
        codigo: codigo,
        descricao: 'Equipamento Inserido Manualmente',
        grupo: 'Manual'
      };
      setEquipamentos([novoEquip, ...equipamentos]);
    }
    
    setEquipamentoSelecionado(codigo);
    setMostrarManual(false);
    setCodigoManual('');
  };
  
  // Voltar para seleção de sistema
  const voltarParaSistemas = () => {
    setSistemaAtual(null);
    setDiagnostico(null);
    setEquipamentoSelecionado('');
    setGrupoSelecionado('');
  };
  
  return (
    <div className="diagnostico-medicao">
      <div className="diagnostico-header">
        <Activity className="header-icon" size={32} />
        <div>
          <h1>Diagnóstico de Medição</h1>
          <p>Análise inteligente de Equipamentos com valores zerados no Relatório de medição</p>
        </div>
      </div>
      
      {/* ETAPA 1: Selecionar Sistema */}
      {!sistemaAtual && (
        <div className="diagnostico-card etapa-conexao">
          <div className="etapa-header">
            <span className="etapa-numero">1</span>
            <h2>Selecione o Sistema AxHub</h2>
          </div>
          
          {Object.keys(sistemasAgrupados).length === 0 ? (
            <div className="loading-sistemas">
              <Loader className="spinner" size={24} />
              <p>Carregando sistemas...</p>
            </div>
          ) : (
            Object.entries(sistemasAgrupados).map(([produto, sistemas]) => (
              <div key={produto} className="grupo-sistemas">
                <h3 className="grupo-titulo">{produto}</h3>
                <div className="sistemas-grid">
                  {sistemas.map(sistema => (
                    <button
                      key={sistema.id}
                      className="sistema-card"
                      onClick={() => conectarSistema(sistema)}
                    >
                      <div className="sistema-info">
                        <span className="sistema-nome">{sistema.nome}</span>
                        {sistema.estado && <span className="sistema-estado">{sistema.estado}</span>}
                      </div>
                      <span className="sistema-url">{sistema.url.replace('https://', '')}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {/* ETAPA 2: Selecionar Equipamento */}
      {sistemaAtual && !diagnostico && (
        <div className="diagnostico-card etapa-equipamento">
          <div className="etapa-header">
            <span className="etapa-numero">2</span>
            <div>
              <h2>Selecione o Equipamento</h2>
              <div className="sistema-conectado">
                <CheckCircle size={16} />
                <span>Sistema conectado: {sistemaAtual.nome}</span>
              </div>
            </div>
            <button 
              className="btn-voltar"
              onClick={() => {
                setSistemaAtual(null);
                setDiagnostico(null);
                setEquipamentoSelecionado('');
              }}
            >
              ← Voltar
            </button>
          </div>
          
          <div className="form-grupo">
            <label>Grupo de Equipamentos</label>
            <select 
              value={grupoSelecionado}
              onChange={(e) => setGrupoSelecionado(e.target.value)}
            >
              <option value="">Todos os Grupos</option>
              {grupos.map(grupo => (
                <option key={grupo} value={grupo}>{grupo}</option>
              ))}
            </select>
          </div>
          
          <div className="form-grupo">
            <label>Equipamento</label>
            <select 
              value={equipamentoSelecionado}
              onChange={(e) => setEquipamentoSelecionado(e.target.value)}
            >
              <option value="">Selecione o Equipamento</option>
              {equipamentos
                .filter(e => !grupoSelecionado || e.grupo === grupoSelecionado)
                .map(equip => (
                  <option key={equip.codigo} value={equip.codigo}>
                    {equip.codigo} - {equip.descricao}
                  </option>
                ))}
            </select>
            <small>Se não encontrar na lista, use o botão "Inserir Manualmente" abaixo</small>
          </div>
          
          {mostrarManual && (
            <div className="manual-input">
              <h4>Inserir Código Manualmente</h4>
              <input
                type="text"
                placeholder="Ex: GYN1R801"
                value={codigoManual}
                onChange={(e) => setCodigoManual(e.target.value.toUpperCase())}
              />
              <button onClick={usarCodigoManual} className="btn-primario">
                Usar Este Código
              </button>
            </div>
          )}
          
          <div className="acoes-equipamento">
            <button 
              className="btn-secundario"
              onClick={() => setMostrarManual(!mostrarManual)}
            >
              {mostrarManual ? 'Cancelar' : '✏️ Inserir Manualmente'}
            </button>
            
            <button 
              className="btn-primario"
              onClick={gerarDiagnostico}
              disabled={!equipamentoSelecionado || loading}
            >
              {loading ? (
                <>
                  <Loader className="spinner" size={16} />
                  Analisando...
                </>
              ) : (
                <>
                  <Search size={16} />
                  Gerar Diagnóstico
                </>
              )}
            </button>
          </div>
          
          {erro && (
            <div className="alerta alerta-erro">
              <AlertCircle size={16} />
              {erro}
            </div>
          )}
        </div>
      )}
      
      {/* ETAPA 3: Resultado do Diagnóstico */}
      {diagnostico && (
        <>
          <div className={`diagnostico-card resultado-${diagnostico.status}`}>
            <div className="resultado-header">
              {diagnostico.status === 'erro' ? (
                <>
                  <XCircle size={48} className="icon-erro" />
                  <div>
                    <h2>🔴 Problema Identificado</h2>
                    <p className="problema-desc">{diagnostico.problema}</p>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle size={48} className="icon-sucesso" />
                  <div>
                    <h2>✅ Configuração Correta</h2>
                    <p className="problema-desc">Equipamento está OK!</p>
                  </div>
                </>
              )}
            </div>
            
            <div className="diagnostico-info">
              <div className="info-card">
                <span className="info-label">Sistema</span>
                <span className="info-value">{sistemaAtual.nome}</span>
              </div>
              <div className="info-card">
                <span className="info-label">Equipamento</span>
                <span className="info-value">{diagnostico.equipamento}</span>
              </div>
              <div className="info-card">
                <span className="info-label">Status</span>
                <span className={`info-value status-${diagnostico.status}`}>
                  {diagnostico.status === 'erro' ? '🔴' : '✅'}
                </span>
              </div>
            </div>
            
            {diagnostico.status === 'erro' && (
              <div className="analise-quantitativa">
                <h3>📊 O que está faltando:</h3>
                <div className="metricas-grid">
                  <div className="metrica ok">
                    <span className="metrica-icon">🛣️</span>
                    <span className="metrica-label">Faixas Cadastradas</span>
                    <span className="metrica-valor">{diagnostico.faixas}</span>
                  </div>
                  <div className="metrica erro">
                    <span className="metrica-icon">💰</span>
                    <span className="metrica-label">Recursos Cadastrados</span>
                    <span className="metrica-valor">{diagnostico.recursos}</span>
                  </div>
                  <div className="metrica alerta">
                    <span className="metrica-icon">⚠️</span>
                    <span className="metrica-label">Recursos Faltando</span>
                    <span className="metrica-valor">{diagnostico.faltando}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="analise-detalhada">
              <h3>Análise Detalhada</h3>
              <div className="checklist">
                <div className={`checklist-item ${diagnostico.detalhes.equipamentoExiste ? 'ok' : 'erro'}`}>
                  {diagnostico.detalhes.equipamentoExiste ? '✅' : '❌'} Equipamento existe no sistema
                </div>
                <div className={`checklist-item ${diagnostico.detalhes.equipamentoAtivo ? 'ok' : 'erro'}`}>
                  {diagnostico.detalhes.equipamentoAtivo ? '✅' : '❌'} Equipamento está Ativo
                </div>
                <div className={`checklist-item ${diagnostico.detalhes.faixasCadastradas ? 'ok' : 'erro'}`}>
                  {diagnostico.detalhes.faixasCadastradas ? '✅' : '❌'} Faixas cadastradas
                </div>
                <div className={`checklist-item ${diagnostico.detalhes.contratoVinculado ? 'ok' : 'erro'}`}>
                  {diagnostico.detalhes.contratoVinculado ? '✅' : '❌'} Contrato vinculado
                </div>
                <div className={`checklist-item ${diagnostico.detalhes.recursosCadastrados ? 'ok' : 'erro'}`}>
                  {diagnostico.detalhes.recursosCadastrados ? '✅' : '❌'} Recursos cadastrados
                </div>
              </div>
            </div>
          </div>
          
          {diagnostico.status === 'erro' && (
            <div className="diagnostico-card solucao-card">
              <h2>✅ Solução: Cadastrar Recursos</h2>
              
              <div className="alerta alerta-info">
                <AlertCircle size={16} />
                <span>Você precisa cadastrar <strong>RECURSOS</strong> para cada faixa do Equipamento no sistema AxHub.</span>
              </div>
              
              <div className="onde-cadastrar">
                <h3>🎯 Onde Cadastrar</h3>
                <div className="caminho-destaque">
                  Medição → Recursos → Novo Recurso
                </div>
              </div>
              
              <div className="passo-passo">
                <h3>📋 Passo a Passo</h3>
                
                <div className="passo-card faixa-1">
                  <h4>✅ Cadastrar Recurso para Faixa 1:</h4>
                  <div className="campos-lista">
                    <div className="campo-item">
                      <strong>Equipamento</strong> Selecione {diagnostico.equipamento}
                    </div>
                    <div className="campo-item">
                      <strong>Faixa:</strong> Selecione <strong>Faixa 1</strong>
                    </div>
                    <div className="campo-item">
                      <strong>Contrato:</strong> Selecione o contrato do órgão
                    </div>
                    <div className="campo-item">
                      <strong>Descrição:</strong> "Recurso Medição {diagnostico.equipamento} - Faixa 1"
                    </div>
                    <div className="campo-item destaque">
                      <strong>Valor Previsto:</strong> R$ 15.000,00 (ou valor do contrato)
                    </div>
                    <div className="campo-item destaque">
                      <strong>BDI (%):</strong> 25,00 (ou % do contrato)
                    </div>
                    <div className="campo-item">
                      <strong>Data Início:</strong> Data de início do contrato
                    </div>
                    <div className="campo-item">
                      <strong>Data Fim:</strong> Data de fim do contrato
                    </div>
                    <div className="campo-item">
                      <strong>Status:</strong> <strong>Ativo</strong>
                    </div>
                  </div>
                  <div className="salvar-box">💾 Clicar em SALVAR</div>
                </div>
                
                <div className="repetir-processo">
                  🔄 REPITA O PROCESSO
                </div>
                
                <div className="passo-card faixa-2">
                  <h4>⚠️ Cadastrar Recurso para Faixa 2:</h4>
                  <div className="campos-lista">
                    <div className="campo-item">
                      <strong>Equipamento</strong> Selecione {diagnostico.equipamento}
                    </div>
                    <div className="campo-item">
                      <strong>Faixa:</strong> Selecione <strong>Faixa 2</strong> ⚠️
                    </div>
                    <div className="campo-item">
                      <strong>Contrato:</strong> Selecione o mesmo contrato
                    </div>
                    <div className="campo-item">
                      <strong>Descrição:</strong> "Recurso Medição {diagnostico.equipamento} - Faixa 2"
                    </div>
                    <div className="campo-item destaque">
                      <strong>Valor Previsto:</strong> R$ 15.000,00 (mesmo valor)
                    </div>
                    <div className="campo-item destaque">
                      <strong>BDI (%):</strong> 25,00 (mesmo %)
                    </div>
                    <div className="campo-item">
                      <strong>Data Início:</strong> Mesma data
                    </div>
                    <div className="campo-item">
                      <strong>Data Fim:</strong> Mesma data
                    </div>
                    <div className="campo-item">
                      <strong>Status:</strong> <strong>Ativo</strong>
                    </div>
                  </div>
                  <div className="salvar-box">💾 Clicar em SALVAR</div>
                </div>
              </div>
              
              <div className="alerta alerta-atencao">
                <AlertCircle size={16} />
                <span><strong>IMPORTANTE:</strong> Cadastre 1 recurso para CADA faixa. Se o Equipamento tem 2 faixas, precisa de 2 recursos.</span>
              </div>
              
              <div className="validacao">
                <h3>✅ Como Validar</h3>
                <ol>
                  <li>Acesse: <strong>{sistemaAtual.url}/medicao/relatoriomedicaoequipamento</strong></li>
                  <li>Selecione: Órgão/Contrato</li>
                  <li>Selecione: Período (ex: Maio/2026)</li>
                  <li>Selecione: Equipamento ({diagnostico.equipamento})</li>
                  <li>Clique em: <strong>Gerar Relatório</strong></li>
                  <li>
                    <div className="resultado-esperado">
                      <strong>✅ Valores esperados:</strong>
                      <ul>
                        <li>VALOR PREVISTO: R$ 15.000,00 (por faixa)</li>
                        <li>BDI: 25,00%</li>
                        <li>TOTAL: R$ 18.750,00 (por faixa)</li>
                        <li><strong>TOTAL Equipamento R$ 37.500,00</strong></li>
                      </ul>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          )}
          
          <div className="acoes-diagnostico">
            <button 
              className="btn-secundario"
              onClick={() => {
                setDiagnostico(null);
                setEquipamentoSelecionado('');
              }}
            >
              ← Analisar Outro Equipamento
            </button>
            
            <button 
              className="btn-secundario"
              onClick={() => {
                setSistemaAtual(null);
                setDiagnostico(null);
                setEquipamentoSelecionado('');
              }}
            >
              Trocar Sistema
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Diagnosticos;
