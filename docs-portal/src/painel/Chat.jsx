import { useState } from "react";
import { api } from "../services/api";

export default function Chat() {
  const [mensagem, setMensagem] = useState("");
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    if (!mensagem.trim() || loading) return;

    const msg = mensagem.trim();
    setHistorico(prev => [...prev, { tipo: "user", texto: msg }]);
    setMensagem("");
    setLoading(true);

    try {
      const res = await api.post("/chat", { mensagem: msg });
      setHistorico(prev => [...prev, { tipo: "bot", texto: res.data.resposta }]);
    } catch {
      setHistorico(prev => [...prev, { tipo: "bot", texto: "Erro ao conectar com a API." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-container">
      <h2 className="page-title">Chat AxionIA</h2>

      <div className="chat-messages">
        {historico.length === 0 && (
          <p style={{ color: "var(--text-muted)", textAlign: "center", marginTop: "2rem" }}>
            Envie uma mensagem para começar
          </p>
        )}
        {historico.map((h, i) => (
          <div key={i} className={`chat-msg ${h.tipo}`}>
            <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", margin: 0 }}>
              {h.texto}
            </pre>
          </div>
        ))}
        {loading && (
          <div className="chat-msg bot" style={{ opacity: 0.6 }}>
            Pensando...
          </div>
        )}
      </div>

      <form onSubmit={enviar} className="chat-input-row">
        <input
          value={mensagem}
          onChange={e => setMensagem(e.target.value)}
          placeholder="Digite sua mensagem..."
          disabled={loading}
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          Enviar
        </button>
      </form>
    </div>
  );
}
