import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function KnowledgeBase() {
  const [entradas, setEntradas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/kb")
      .then(res => setEntradas(res.data.entradas || []))
      .catch(() => setEntradas([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="page-title">Knowledge Base</h2>

      <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
        {entradas.length} entradas com embeddings no MongoDB
      </p>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Carregando...</p>
      ) : entradas.length === 0 ? (
        <div className="alert alert-error">
          Nenhuma entrada encontrada. Execute o seed: <code>node src/scripts/seed-kb.js</code>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Pergunta</th>
              <th>Módulo</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {entradas.map(e => (
              <tr key={e._id}>
                <td>{e.pergunta}</td>
                <td><span className="badge badge-kb">{e.modulo}</span></td>
                <td style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                  {new Date(e.createdAt).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
