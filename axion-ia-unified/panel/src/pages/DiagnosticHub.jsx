import React, { useState, useEffect } from 'react';
import { Activity, Search, Database, FileText, TrendingUp, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import DiagnosticoMedicao from './DiagnosticoMedicao';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/ui';
import './DiagnosticHub.css';

const DIAGNOSTIC_TYPES = [
  {
    id: 'medicao',
    label: 'Medição de Equipamentos',
    icon: Activity,
    desc: 'Diagnóstico de passagens, heartbeats e valores zerados'
  },
  {
    id: 'health',
    label: 'Health Check Sites',
    icon: TrendingUp,
    desc: 'Status de disponibilidade e performance dos sites'
  },
  {
    id: 'logs',
    label: 'Logs e Monitoramento',
    icon: FileText,
    desc: 'Consulta de logs de API e erros do sistema'
  },
  {
    id: 'query',
    label: 'Query Personalizada',
    icon: Database,
    desc: 'Execute consultas SQL personalizadas nos bancos'
  }
];

export default function DiagnosticHub() {
  const [activeType, setActiveType] = useState('medicao');
  const [healthData, setHealthData] = useState(null);
  const [logsData, setLogsData] = useState([]);
  const [queryResult, setQueryResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para Query Personalizada
  const [sqlQuery, setSqlQuery] = useState('');
  const [selectedDb, setSelectedDb] = useState('axhub');

  // Estados para Logs
  const [logLevel, setLogLevel] = useState('all'); // all, error, warn, info
  const [logLimit, setLogLimit] = useState(100);

  // Carregar health check automaticamente
  useEffect(() => {
    if (activeType === 'health') {
      loadHealthCheck();
    } else if (activeType === 'logs') {
      loadLogs();
    }
  }, [activeType]);

  const loadHealthCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/helpdesk/sites-overview');
      setHealthData(data);
    } catch (err) {
      setError('Erro ao carregar health check: ' + (err.response?.data?.erro || err.message));
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/logs?level=${logLevel}&limit=${logLimit}`);
      setLogsData(data.logs || []);
    } catch (err) {
      setError('Erro ao carregar logs: ' + (err.response?.data?.erro || err.message));
    } finally {
      setLoading(false);
    }
  };

  const executeQuery = async () => {
    if (!sqlQuery.trim()) {
      setError('Digite uma consulta SQL');
      return;
    }

    setLoading(true);
    setError(null);
    setQueryResult(null);

    try {
      const { data } = await api.post('/query/execute', {
        database: selectedDb,
        query: sqlQuery
      });
      setQueryResult(data);
    } catch (err) {
      setError('Erro ao executar query: ' + (err.response?.data?.erro || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="diagnostic-hub-container">
      {/* Header */}
      <div className="diagnostic-hub-header">
        <div className="diagnostic-hub-title-section">
          <Search className="diagnostic-hub-icon" size={32} />
          <div>
            <h1 className="diagnostic-hub-title">Diagnostic Hub</h1>
            <p className="diagnostic-hub-subtitle">
              Central unificada de diagnóstico e consultas — Medição, Health, Logs e Queries
            </p>
          </div>
        </div>
      </div>

      {/* Abas de tipo de diagnóstico */}
      <div className="diagnostic-hub-types">
        {DIAGNOSTIC_TYPES.map(type => {
          const Icon = type.icon;
          const isActive = activeType === type.id;

          return (
            <button
              key={type.id}
              className={`diagnostic-hub-type-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveType(type.id)}
            >
              <Icon size={20} />
              <div className="diagnostic-hub-type-content">
                <span className="diagnostic-hub-type-label">{type.label}</span>
                <span className="diagnostic-hub-type-desc">{type.desc}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Conteúdo */}
      <div className="diagnostic-hub-content">
        {/* Medição de Equipamentos */}
        {activeType === 'medicao' && (
          <div className="diagnostic-hub-embedded">
            <DiagnosticoMedicao />
          </div>
        )}

        {/* Health Check Sites */}
        {activeType === 'health' && (
          <div className="diagnostic-health-section">
            <div className="diagnostic-section-header">
              <h3>
                <TrendingUp size={20} />
                Status dos Sites
              </h3>
              <button 
                className="diagnostic-refresh-btn"
                onClick={loadHealthCheck}
                disabled={loading}
              >
                {loading ? <Loader size={16} className="spinning" /> : '🔄'} Atualizar
              </button>
            </div>

            {error && (
              <div className="diagnostic-error">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {healthData && (
              <div className="diagnostic-health-grid">
                <div className="diagnostic-health-card">
                  <div className="diagnostic-health-label">Total de Sites</div>
                  <div className="diagnostic-health-value">{healthData.totalSites || 0}</div>
                </div>
                <div className="diagnostic-health-card success">
                  <div className="diagnostic-health-label">Online</div>
                  <div className="diagnostic-health-value">{healthData.online || 0}</div>
                </div>
                <div className="diagnostic-health-card error">
                  <div className="diagnostic-health-label">Offline</div>
                  <div className="diagnostic-health-value">{healthData.offline || 0}</div>
                </div>
                <div className="diagnostic-health-card warning">
                  <div className="diagnostic-health-label">Health Score Médio</div>
                  <div className="diagnostic-health-value">{healthData.avgHealth || 0}%</div>
                </div>
              </div>
            )}

            {healthData?.sites && (
              <div className="diagnostic-sites-table">
                <table>
                  <thead>
                    <tr>
                      <th>Site</th>
                      <th>Sistema</th>
                      <th>Estado</th>
                      <th>Status</th>
                      <th>Health Score</th>
                      <th>Última Verificação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {healthData.sites.map((site, idx) => (
                      <tr key={idx}>
                        <td>{site.nome}</td>
                        <td><span className="diagnostic-badge">{site.sistema}</span></td>
                        <td>{site.estado}</td>
                        <td>
                          <span className={`diagnostic-status ${site.status}`}>
                            {site.status === 'online' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                            {site.status}
                          </span>
                        </td>
                        <td>
                          <span className={`diagnostic-health-badge ${
                            site.healthScore >= 80 ? 'success' : 
                            site.healthScore >= 60 ? 'warning' : 'error'
                          }`}>
                            {site.healthScore}%
                          </span>
                        </td>
                        <td>{site.lastCheck || 'Nunca'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Logs */}
        {activeType === 'logs' && (
          <div className="diagnostic-logs-section">
            <div className="diagnostic-section-header">
              <h3>
                <FileText size={20} />
                Logs do Sistema
              </h3>
              <div className="diagnostic-logs-controls">
                <select 
                  value={logLevel} 
                  onChange={(e) => setLogLevel(e.target.value)}
                  className="diagnostic-select"
                >
                  <option value="all">Todos</option>
                  <option value="error">Apenas Erros</option>
                  <option value="warn">Avisos</option>
                  <option value="info">Info</option>
                </select>
                <input
                  type="number"
                  value={logLimit}
                  onChange={(e) => setLogLimit(parseInt(e.target.value))}
                  min="10"
                  max="1000"
                  className="diagnostic-input-small"
                  placeholder="Limite"
                />
                <button 
                  className="diagnostic-refresh-btn"
                  onClick={loadLogs}
                  disabled={loading}
                >
                  {loading ? <Loader size={16} className="spinning" /> : '🔄'} Carregar
                </button>
              </div>
            </div>

            {error && (
              <div className="diagnostic-error">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="diagnostic-logs-list">
              {logsData.length === 0 ? (
                <div className="diagnostic-empty">Nenhum log encontrado</div>
              ) : (
                logsData.map((log, idx) => (
                  <div key={idx} className={`diagnostic-log-item ${log.level}`}>
                    <div className="diagnostic-log-header">
                      <span className={`diagnostic-log-level ${log.level}`}>
                        {log.level.toUpperCase()}
                      </span>
                      <span className="diagnostic-log-time">{log.timestamp}</span>
                    </div>
                    <div className="diagnostic-log-message">{log.message}</div>
                    {log.details && (
                      <pre className="diagnostic-log-details">{JSON.stringify(log.details, null, 2)}</pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Query Personalizada */}
        {activeType === 'query' && (
          <div className="diagnostic-query-section">
            <div className="diagnostic-section-header">
              <h3>
                <Database size={20} />
                Query SQL Personalizada
              </h3>
            </div>

            <div className="diagnostic-query-form">
              <div className="diagnostic-form-group">
                <label>Banco de Dados:</label>
                <select 
                  value={selectedDb} 
                  onChange={(e) => setSelectedDb(e.target.value)}
                  className="diagnostic-select"
                >
                  <option value="axhub">AxHub (SQL Server)</option>
                  <option value="axton">AxTon (SQL Server)</option>
                  <option value="axcross">AxCross (MongoDB)</option>
                  <option value="axionia">AxionIA (MongoDB)</option>
                </select>
              </div>

              <div className="diagnostic-form-group">
                <label>Consulta SQL:</label>
                <textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  className="diagnostic-textarea"
                  rows={8}
                  placeholder={`Exemplo:\n\nSELECT TOP 10 *\nFROM Infracao\nWHERE DataOcorrencia >= DATEADD(day, -7, GETDATE())\nORDER BY DataOcorrencia DESC`}
                />
              </div>

              <button 
                className="diagnostic-execute-btn"
                onClick={executeQuery}
                disabled={loading || !sqlQuery.trim()}
              >
                {loading ? (
                  <>
                    <Loader size={16} className="spinning" />
                    Executando...
                  </>
                ) : (
                  <>
                    <Database size={16} />
                    Executar Query
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="diagnostic-error">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {queryResult && (
              <div className="diagnostic-query-result">
                <div className="diagnostic-result-header">
                  <CheckCircle size={16} />
                  <strong>Resultado:</strong> {queryResult.rowCount} linha(s) retornada(s)
                  <span className="diagnostic-result-time">
                    Tempo: {queryResult.executionTime}ms
                  </span>
                </div>

                {queryResult.rows && queryResult.rows.length > 0 && (
                  <div className="diagnostic-result-table-container">
                    <table className="diagnostic-result-table">
                      <thead>
                        <tr>
                          {Object.keys(queryResult.rows[0]).map(col => (
                            <th key={col}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResult.rows.map((row, idx) => (
                          <tr key={idx}>
                            {Object.values(row).map((val, i) => (
                              <td key={i}>
                                {val === null ? <span className="diagnostic-null">NULL</span> : String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
