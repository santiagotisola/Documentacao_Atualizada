import { useEffect } from 'react';

const ChatIA = ({ metricas, setMetricas }) => {
  useEffect(() => {
    setMetricas(prev => ({ ...prev, chatAtivos: 12 }));
  }, [setMetricas]);

  return (
    <div className="chat-ia">
      <h2>🤖 Chat IA - Assistente Axion</h2>
      <div className="chat-container">
        <div className="chat-sidebar">
          <h3>Conversães Ativas (12)</h3>
          <div className="conversas-lista">
            <div className="conversa-item active">
              <div className="avatar">👤</div>
              <div className="conversa-info">
                <span className="nome">João Silva</span>
                <span className="preview">Como acessar Relatório</span>
              </div>
              <span className="badge">2</span>
            </div>
            <div className="conversa-item">
              <div className="avatar">👤</div>
              <div className="conversa-info">
                <span className="nome">Maria Santos</span>
                <span className="preview">Qual o status do ticket...</span>
              </div>
            </div>
          </div>
        </div>
        <div className="chat-main">
          <div className="chat-header">
            <h4>João Silva - Contrato: IPEM-PE</h4>
          </div>
          <div className="chat-messages">
            <div className="message user">
              <p>Como faço para acessar o Relatório de medição?</p>
              <span className="time">10:23</span>
            </div>
            <div className="message ia">
              <p>Para acessar o Relatório de medição, vá em Medição → Recursos → Relatório Mensal. Posso ajudar com mais alguma coisa?</p>
              <span className="time">10:23</span>
            </div>
          </div>
          <div className="chat-input">
            <input type="text" placeholder="Digite sua mensagem..." />
            <button>➡️ Enviar</button>
          </div>
        </div>
      </div>
      <style>{`
        .chat-ia h2 { margin: 0 0 1.5rem 0; }
        .chat-container { display: grid; grid-template-columns: 300px 1fr; gap: 1rem; height: 600px; background: white; border-radius: 8px; overflow: hidden; }
        .chat-sidebar { border-right: 1px solid #e2e8f0; padding: 1rem; overflow-y: auto; }
        .chat-sidebar h3 { font-size: 0.9rem; margin: 0 0 1rem 0; color: #64748b; }
        .conversas-lista { display: flex; flex-direction: column; gap: 0.5rem; }
        .conversa-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border-radius: 6px; cursor: pointer; transition: background 0.2s; }
        .conversa-item:hover { background: #f8f9fc; }
        .conversa-item.active { background: #e0e7ff; }
        .avatar { font-size: 1.5rem; }
        .conversa-info { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; }
        .nome { font-weight: 600; font-size: 0.9rem; }
        .preview { font-size: 0.8rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .badge { background: #ef4444; color: white; padding: 0.25rem 0.5rem; border-radius: 10px; font-size: 0.75rem; font-weight: 600; }
        .chat-main { display: flex; flex-direction: column; }
        .chat-header { padding: 1rem; border-bottom: 1px solid #e2e8f0; }
        .chat-header h4 { margin: 0; }
        .chat-messages { flex: 1; padding: 1rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; }
        .message { max-width: 70%; padding: 0.75rem 1rem; border-radius: 8px; }
        .message.user { align-self: flex-end; background: #667eea; color: white; }
        .message.ia { align-self: flex-start; background: #f1f5f9; }
        .message p { margin: 0 0 0.25rem 0; }
        .time { font-size: 0.75rem; opacity: 0.7; }
        .chat-input { display: flex; gap: 0.5rem; padding: 1rem; border-top: 1px solid #e2e8f0; }
        .chat-input input { flex: 1; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 4px; }
        .chat-input button { padding: 0.75rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 4px; font-weight: 600; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default ChatIA;