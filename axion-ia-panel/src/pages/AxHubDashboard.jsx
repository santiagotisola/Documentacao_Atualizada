import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function AxHubDashboard() {
  const [status, setStatus]   = useState(null);
  const [resumo, setResumo]   = useState(null);
  const [tabelas, setTabelas] = useState(null);
  const [tab, setTab]         = useState("resumo");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/axhub/status")
      .then(res => setStatus(res.data))
      .catch(() => setStatus({ conectado: false, erro: "API indisponível" }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (status?.conectado) {
      api.get("/axhub/resumo").then(r => setResumo(r.data)).catch(() => {});
    }
  }, [status]);

  function carregarTabelas() {
    setTab("tabelas");
    if (!tabelas) {
      api.get("/axhub/tabelas").then(r => setTabelas(r.data.tabelas)).catch(() => setTabelas([]));
    }
  }

  if (loading) return <p style={{ color: "var(--text-muted)" }}>Verificando conexão SQL Server...</p>;

  return (
    <div>
      <h2 className="page-title">AxHub — SQL Server</h2>

      {/* Status de conexão */}
      <div className="card" style={{ marginBottom: "1.5rem", borderLeft: `4px solid ${status?.conectado ? "var(--success)" : "var(--danger)"}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{
            width: 12, height: 12, borderRadius: "50%",
            background: status?.conectado ? "var(--success)" : "var(--danger)",
            display: "inline-block"
          }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: "1rem" }}>
              {status?.conectado ? "Conectado" : "Desconectado"}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              {status?.servidor}/{status?.banco}
              {status?.erro && <span style={{ color: "var(--danger)", marginLeft: "0.5rem" }}>— {status.erro}</span>}
            </div>
          </div>
        </div>
      </div>

      {!status?.conectado && (
        <div className="card" style={{ maxWidth: 500 }}>
          <h3 style={{ marginBottom: "1rem", fontSize: "1rem" }}>Configuração necessária</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>
            Defina as variáveis no <code style={{ color: "var(--accent)" }}>.env</code> do axion-ia-api:
          </p>
          <pre style={{
            background: "var(--bg)", padding: "1rem", borderRadius: 6,
            fontSize: "0.85rem", lineHeight: 1.6, border: "1px solid var(--border)"
          }}>
{`AXHUB_DB_HOST=seu-servidor
AXHUB_DB_PORT=1433
AXHUB_DB_NAME=AxHub
AXHUB_DB_USER=seu-usuario
AXHUB_DB_PASS=sua-senha`}
          </pre>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.75rem" }}>
            Depois reinicie a API: <code style={{ color: "var(--accent)" }}>npm start</code>
          </p>
        </div>
      )}

      {status?.conectado && (
        <>
          {/* Tabs */}
          <div className="filters-row" style={{ marginBottom: "1.5rem" }}>
            <button className={`btn ${tab === "resumo" ? "btn-primary" : ""}`}
              onClick={() => setTab("resumo")} style={tab !== "resumo" ? { background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" } : {}}>
              Resumo
            </button>
            <button className={`btn ${tab === "tabelas" ? "btn-primary" : ""}`}
              onClick={carregarTabelas} style={tab !== "tabelas" ? { background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" } : {}}>
              Tabelas
            </button>
          </div>

          {/* Resumo */}
          {tab === "resumo" && resumo && (
            <div className="cards-grid">
              <StatCard label="Equipamentos" value={resumo.equipamentos} color="var(--accent)" />
              <StatCard label="Operações"    value={resumo.operacoes}    color="var(--success)" />
              <StatCard label="Infrações"    value={resumo.infracoes}    color="var(--danger)" />
              <StatCard label="Passagens"    value={resumo.passagens}    color="var(--warning)" />
              <StatCard label="Triagens"     value={resumo.triagens}     color="var(--accent)" />
              <StatCard label="Usuários"     value={resumo.usuarios}     color="var(--text-muted)" />
            </div>
          )}

          {tab === "resumo" && !resumo && (
            <p style={{ color: "var(--text-muted)" }}>Carregando dados...</p>
          )}

          {/* Tabelas */}
          {tab === "tabelas" && tabelas && (
            <div>
              <p style={{ color: "var(--text-muted)", marginBottom: "1rem", fontSize: "0.85rem" }}>
                {tabelas.length} tabelas no banco AxHub
              </p>
              <table className="data-table">
                <thead>
                  <tr><th>Tabela</th><th style={{ textAlign: "right" }}>Registros</th></tr>
                </thead>
                <tbody>
                  {tabelas.map(t => (
                    <tr key={t.tabela}>
                      <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{t.tabela}</td>
                      <td style={{ textAlign: "right" }}>{Number(t.registros).toLocaleString("pt-BR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "tabelas" && !tabelas && (
            <p style={{ color: "var(--text-muted)" }}>Carregando tabelas...</p>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="card">
      <div className="label">{label}</div>
      <div className="value" style={{ color }}>
        {typeof value === "number" ? value.toLocaleString("pt-BR") : value ?? "—"}
      </div>
    </div>
  );
}
