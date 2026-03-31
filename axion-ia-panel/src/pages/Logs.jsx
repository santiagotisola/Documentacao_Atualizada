import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);

  function carregar(origem) {
    setLoading(true);
    const params = origem ? `?origem=${origem}` : "";
    api.get(`/logs${params}`)
      .then(res => setLogs(res.data.logs || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { carregar(filtro); }, [filtro]);

  return (
    <div>
      <h2 className="page-title">Logs de Interações</h2>

      <div className="filters-row">
        <select value={filtro} onChange={e => setFiltro(e.target.value)}>
          <option value="">Todas origens</option>
          <option value="kb">KB (keywords)</option>
          <option value="embedding">Embeddings</option>
          <option value="openai">OpenAI (fallback)</option>
        </select>
        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          {logs.length} registro(s)
        </span>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Carregando...</p>
      ) : logs.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>Nenhum log encontrado</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Mensagem</th>
              <th>Origem</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l, i) => (
              <tr key={l._id || i}>
                <td style={{ whiteSpace: "nowrap", fontSize: "0.8rem" }}>
                  {new Date(l.createdAt).toLocaleString("pt-BR")}
                </td>
                <td style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {l.mensagem}
                </td>
                <td>
                  <span className={`badge badge-${l.origem}`}>
                    {l.origem}
                  </span>
                </td>
                <td>
                  {l.score ? `${(l.score * 100).toFixed(1)}%` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
