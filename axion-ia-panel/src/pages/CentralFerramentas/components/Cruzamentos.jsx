import { useState, useEffect } from 'react';
import { FileSpreadsheet, FileText, CheckCircle, XCircle, AlertCircle, RefreshCw, Download } from 'lucide-react';
import './Cruzamentos.css';

const Cruzamentos = () => {
  const [filtros, setFiltros] = useState({
    dataInicio: '',
    dataFim: '',
    localId: '',
    equipamentoId: '',
    faixaId: '',
    sort: 'DataPassagem',
    order: 'desc'
  });

  const [passagens, setPassagens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validacaoAtiva, setValidacaoAtiva] = useState(false);
  const [metricas, setMetricas] = useState(null);

  const [locais] = useState([
    { id: 1, nome: 'Cruzamento Central' },
    { id: 2, nome: 'Rodovia BR-153' },
    { id: 3, nome: 'Avenida Principal' }
  ]);

  const [equipamentos] = useState([
    { id: 1, nome: 'CAM-001' },
    { id: 2, nome: 'CAM-002' },
    { id: 3, nome: 'SENSOR-001' }
  ]);

  const [faixas] = useState([
    { id: 1, nome: 'Faixa 1' },
    { id: 2, nome: 'Faixa 2' },
    { id: 3, nome: 'Faixa 3' }
  ]);

  const camposOrdenacao = [
    { value: 'DataPassagem', label: 'Data/Hora' },
    { value: 'Placa', label: 'Placa' },
    { value: 'Velocidade', label: 'Velocidade' },
    { value: 'Equipamento', label: 'Equipamento' },
    { value: 'Faixa', label: 'Faixa' },
    { value: 'Local', label: 'Local' }
  ];

  // Dados simulados de passagens
  const passagensSimuladas = [
    { id: 1, dataPassagem: '2026-06-23 14:35:22', placa: 'ABC1234', velocidade: 65, local: 'Cruzamento Central', faixa: 'Faixa 1', equipamento: 'CAM-001' },
    { id: 2, dataPassagem: '2026-06-23 14:28:15', placa: 'XYZ9876', velocidade: 72, local: 'Rodovia BR-153', faixa: 'Faixa 2', equipamento: 'CAM-002' },
    { id: 3, dataPassagem: '2026-06-23 14:15:48', placa: 'DEF5678', velocidade: 58, local: 'Avenida Principal', faixa: 'Faixa 1', equipamento: 'SENSOR-001' },
    { id: 4, dataPassagem: '2026-06-23 13:52:33', placa: 'GHI2468', velocidade: 81, local: 'Cruzamento Central', faixa: 'Faixa 3', equipamento: 'CAM-001' },
    { id: 5, dataPassagem: '2026-06-23 13:41:09', placa: 'JKL1357', velocidade: 68, local: 'Rodovia BR-153', faixa: 'Faixa 2', equipamento: 'CAM-002' }
  ];

  useEffect(() => {
    handleConsultar();
  }, []);

  const handleConsultar = () => {
    setLoading(true);
    setTimeout(() => {
      let resultado = [...passagensSimuladas];
      
      // Aplicar ordenação
      resultado.sort((a, b) => {
        const campo = filtros.sort;
        let valorA = a[campo.toLowerCase()] || a[campo];
        let valorB = b[campo.toLowerCase()] || b[campo];
        
        if (campo === 'DataPassagem') {
          valorA = new Date(valorA);
          valorB = new Date(valorB);
        }
        
        if (filtros.order === 'asc') {
          return valorA > valorB ? 1 : -1;
        } else {
          return valorA < valorB ? 1 : -1;
        }
      });

      setPassagens(resultado);
      setLoading(false);
    }, 800);
  };

  const handleValidar = () => {
    setValidacaoAtiva(true);
    setTimeout(() => {
      setMetricas({
        conformidade: 85,
        total: 27,
        implementadas: 3,
        parciais: 4,
        ausentes: 20,
        problemas: [
          { tipo: 'warning', descricao: 'Ordenação por Classificação não implementada' },
          { tipo: 'error', descricao: 'Exportação XLSX não preserva filtros' },
          { tipo: 'warning', descricao: 'Validação de consistência não implementada' }
        ]
      });
      setValidacaoAtiva(false);
    }, 1500);
  };

  const handleExportar = (formato) => {
    const params = new URLSearchParams(filtros);
    window.open(`/api/axcross/relatorio/passagens/${formato}?${params.toString()}`, '_blank');
  };

  const handleOrdenar = (campo) => {
    if (filtros.sort === campo) {
      setFiltros({ ...filtros, order: filtros.order === 'asc' ? 'desc' : 'asc' });
    } else {
      setFiltros({ ...filtros, sort: campo, order: 'desc' });
    }
    setTimeout(handleConsultar, 100);
  };

  return (
    <div className="axcross-passagens">
      <div className="passagens-header">
        <div>
          <h2>🚦 Relatório de Passagens AxCross</h2>
          <p>Consulta e validação de passagens com ordenação dinâmica e exportação</p>
        </div>
        <button className="btn-relatorio" onClick={() => window.open('/VALIDACAO-RELATORIO-PASSAGENS-AXCROSS-v4.0.md', '_blank')}>
          <Download size={16} />
          Relatório Completo
        </button>
      </div>

      <div className="passagens-container">
        {/* Painel de Filtros */}
        <div className="filtros-panel">
          <h3>📋 Filtros</h3>
          <div className="filtro-group">
            <label>Data Início</label>
            <input
              type="date"
              value={filtros.dataInicio}
              onChange={e => setFiltros({...filtros, dataInicio: e.target.value})}
            />
          </div>
          <div className="filtro-group">
            <label>Data Fim</label>
            <input
              type="date"
              value={filtros.dataFim}
              onChange={e => setFiltros({...filtros, dataFim: e.target.value})}
            />
          </div>
          <div className="filtro-group">
            <label>Local</label>
            <select value={filtros.localId} onChange={e => setFiltros({...filtros, localId: e.target.value})}>
              <option value="">Todos</option>
              {locais.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
            </select>
          </div>
          <div className="filtro-group">
            <label>Equipamento</label>
            <select value={filtros.equipamentoId} onChange={e => setFiltros({...filtros, equipamentoId: e.target.value})}>
              <option value="">Todos</option>
              {equipamentos.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
            </select>
          </div>
          <div className="filtro-group">
            <label>Faixa</label>
            <select value={filtros.faixaId} onChange={e => setFiltros({...filtros, faixaId: e.target.value})}>
              <option value="">Todas</option>
              {faixas.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
          </div>

          <h3 style={{marginTop: '1.5rem'}}>🔄 Ordenação</h3>
          <div className="filtro-group">
            <label>Ordenar por</label>
            <select value={filtros.sort} onChange={e => setFiltros({...filtros, sort: e.target.value})}>
              {camposOrdenacao.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="filtro-group">
            <label>Ordem</label>
            <select value={filtros.order} onChange={e => setFiltros({...filtros, order: e.target.value})}>
              <option value="desc">Decrescente ↓</option>
              <option value="asc">Crescente ↑</option>
            </select>
          </div>

          <button className="btn-consultar" onClick={handleConsultar} disabled={loading}>
            {loading ? <><RefreshCw size={16} className="spin" /> Carregando...</> : '🔍 Consultar'}
          </button>

          <h3 style={{marginTop: '1.5rem'}}>📊 Validação</h3>
          <button className="btn-validar-mini" onClick={handleValidar} disabled={validacaoAtiva}>
            {validacaoAtiva ? <><RefreshCw size={14} className="spin" /> Validando...</> : 'Validar Config'}
          </button>

          {metricas && (
            <div className="metricas-mini">
              <div className="conformidade-mini">
                <div className="conf-value" style={{color: metricas.conformidade >= 80 ? '#10b981' : '#f59e0b'}}>
                  {metricas.conformidade}%
                </div>
                <div className="conf-label">Conformidade</div>
              </div>
              <div className="metricas-grid-mini">
                <div className="metrica-mini success">
                  <div>{metricas.implementadas}</div>
                  <span>OK</span>
                </div>
                <div className="metrica-mini warning">
                  <div>{metricas.parciais}</div>
                  <span>Parcial</span>
                </div>
                <div className="metrica-mini error">
                  <div>{metricas.ausentes}</div>
                  <span>Ausente</span>
                </div>
              </div>
              {metricas.problemas.length > 0 && (
                <div className="problemas-mini">
                  <h4>⚠️ Problemas</h4>
                  {metricas.problemas.map((p, i) => (
                    <div key={i} className={`problema-mini ${p.tipo}`}>
                      {p.tipo === 'error' ? <XCircle size={12} /> : <AlertCircle size={12} />}
                      <span>{p.descricao}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <h3 style={{marginTop: '1.5rem'}}>📤 Exportar</h3>
          <div className="export-buttons-mini">
            <button className="btn-export-mini xlsx" onClick={() => handleExportar('xlsx')}>
              <FileSpreadsheet size={14} />
              XLSX
            </button>
            <button className="btn-export-mini csv" onClick={() => handleExportar('csv')}>
              <FileText size={14} />
              CSV
            </button>
            <button className="btn-export-mini pdf" onClick={() => handleExportar('pdf')}>
              <FileText size={14} />
              PDF
            </button>
          </div>
        </div>

        {/* Tabela de Passagens */}
        <div className="passagens-main">
          <div className="passagens-toolbar">
            <div className="passagens-info">
              <strong>{passagens.length}</strong> passagens encontradas
            </div>
          </div>

          <div className="passagens-table-wrapper">
            <table className="passagens-table">
              <thead>
                <tr>
                  <th onClick={() => handleOrdenar('DataPassagem')} style={{cursor: 'pointer'}}>
                    Data/Hora {filtros.sort === 'DataPassagem' && (filtros.order === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleOrdenar('Placa')} style={{cursor: 'pointer'}}>
                    Placa {filtros.sort === 'Placa' && (filtros.order === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleOrdenar('Velocidade')} style={{cursor: 'pointer'}}>
                    Velocidade {filtros.sort === 'Velocidade' && (filtros.order === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleOrdenar('Local')} style={{cursor: 'pointer'}}>
                    Local {filtros.sort === 'Local' && (filtros.order === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleOrdenar('Faixa')} style={{cursor: 'pointer'}}>
                    Faixa {filtros.sort === 'Faixa' && (filtros.order === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleOrdenar('Equipamento')} style={{cursor: 'pointer'}}>
                    Equipamento {filtros.sort === 'Equipamento' && (filtros.order === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {passagens.map(p => (
                  <tr key={p.id}>
                    <td>{p.dataPassagem}</td>
                    <td><strong>{p.placa}</strong></td>
                    <td>{p.velocidade} km/h</td>
                    <td>{p.local}</td>
                    <td>{p.faixa}</td>
                    <td>{p.equipamento}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cruzamentos;