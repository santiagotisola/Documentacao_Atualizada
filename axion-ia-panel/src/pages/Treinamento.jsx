import { useState } from "react";
import { api } from "../services/api";

export default function Treinamento() {
  const [pergunta, setPergunta] = useState("");
  const [resposta, setResposta] = useState("");
  const [modulo, setModulo] = useState("geral");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    if (!pergunta.trim() || !resposta.trim()) return;

    setLoading(true);
    setFeedback(null);

    try {
      const res = await api.post("/treinar", { pergunta, resposta, modulo });

      setFeedback({ tipo: "success", msg: `Treinado com sucesso (ID: ${res.data.id})` });
      setPergunta("");
      setResposta("");
    } catch (err) {
      setFeedback({ tipo: "error", msg: err.response?.data?.erro || "Erro ao treinar" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h2 className="page-title">Treinar IA</h2>

      {feedback && (
        <div className={`alert alert-${feedback.tipo}`}>{feedback.msg}</div>
      )}

      <form onSubmit={enviar}>
        <div className="form-group">
          <label>Pergunta / Cenário</label>
          <input
            value={pergunta}
            onChange={e => setPergunta(e.target.value)}
            placeholder="Ex: erro ao salvar imagem no Equipamento"
          />
        </div>

        <div className="form-group">
          <label>Resposta esperada</label>
          <textarea
            value={resposta}
            onChange={e => setResposta(e.target.value)}
            placeholder="Ex: Verificar serviço de upload e espaço em disco..."
          />
        </div>

        <div className="form-group">
          <label>Módulo</label>
          <select value={modulo} onChange={e => setModulo(e.target.value)}>
            <option value="geral">Geral</option>
            <option value="infracoes">Infrações</option>
            <option value="equipamentos">Equipamentos</option>
            <option value="operacoes">Operações</option>
            <option value="pesagem">Pesagem</option>
            <option value="balanca">Balança</option>
            <option value="controle_acesso">Controle de Acesso</option>
            <option value="veiculos">Veículos</option>
            <option value="administracao">Administração</option>
            <option value="relatorios">Relatórios</option>
            <option value="medicoes">Medições</option>
            <option value="cronotacografo">Cronotacógrafo</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Gerando embedding..." : "Treinar"}
        </button>
      </form>
    </div>
  );
}
