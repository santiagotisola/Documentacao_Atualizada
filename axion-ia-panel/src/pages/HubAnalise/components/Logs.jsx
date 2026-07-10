import { useEffect } from 'react';

const Logs = ({ metricas, setMetricas }) => {
  useEffect(() => { setMetricas(prev => ({ ...prev, logsProcessados: 45672 })); }, [setMetricas]);

  const logs = [
    { time: '10:45:23', level: 'INFO', message: 'Validação concluída - Site IPEM-PE' },
    { time: '10:45:18', level: 'WARNING', message: 'Timeout ao conectar com AxHub - Tentando novamente...' },
    { time: '10:45:12', level: 'ERROR', message: 'Falha ao processar imagem - ID 12345' },
    { time: '10:45:05', level: 'INFO', message: 'Sincronização iniciada' }
  ];

  return (
    <div className="logs">
      <h2>📜 Logs do Sistema</h2>
      <p className="subtitle">Auditoria e rastreio de operações</p>
      <div className="logs-filters">
        <select><option>Todos os Níveis</option><option>ERROR</option><option>WARNING</option><option>INFO</option></select>
        <input type="text" placeholder="Buscar nos logs..." />
      </div>
      <div className="logs-viewer">
        {logs.map((log, i) => (
          <div key={i} className={`log-entry ${log.level.toLowerCase()}`}>
            <span className="log-time">{log.time}</span>
            <span className="log-level">{log.level}</span>
            <span className="log-message">{log.message}</span>
          </div>
        ))}
      </div>
      <style>{`
        .logs h2 { margin: 0 0 0.5rem 0; }
        .subtitle { color: #64748b; margin: 0 0 1.5rem 0; }
        .logs-filters { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
        .logs-filters select, .logs-filters input { flex: 1; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; }
        .logs-viewer { background: #1a202c; color: #e2e8f0; padding: 1.5rem; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 0.9rem; max-height: 500px; overflow-y: auto; }
        .log-entry { display: grid; grid-template-columns: 100px 100px 1fr; gap: 1rem; padding: 0.5rem 0; border-bottom: 1px solid #2d3748; }
        .log-time { color: #cbd5e1; }
        .log-level { font-weight: 600; }
        .log-entry.error .log-level { color: #f56565; }
        .log-entry.warning .log-level { color: #ed8936; }
        .log-entry.info .log-level { color: #48bb78; }
        .log-message { color: #e2e8f0; }
      `}</style>
    </div>
  );
};

export default Logs;