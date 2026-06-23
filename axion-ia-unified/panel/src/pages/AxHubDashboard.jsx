import { useState } from "react";
import { KPICard, StatusBadge, LoadingSpinner, DataTable } from "../components/ui";
import { useAxHubStatus, useAxHubResumo, useAxHubTabelas } from "../hooks";
import { Database, Activity, AlertCircle, Users, TrendingUp, FileText } from "lucide-react";

export default function AxHubDashboard() {
  const [tab, setTab] = useState("resumo");
  
  const { data: status, isLoading: loadingStatus } = useAxHubStatus();
  const { data: resumo, isLoading: loadingResumo } = useAxHubResumo({ enabled: status?.conectado });
  const { data: tabelas, isLoading: loadingTabelas } = useAxHubTabelas({ enabled: tab === "tabelas" });

  if (loadingStatus) return <LoadingSpinner message="Verificando conexão SQL Server..." />;

  return (
    <div>
      <h2 className="page-title">AxHub — SQL Server</h2>

      {/* Status de conexão */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Database size={24} style={{ color: "var(--accent)" }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <StatusBadge 
                variant={status?.conectado ? "success" : "error"} 
                dot
              >
                {status?.conectado ? "Conectado" : "Desconectado"}
              </StatusBadge>
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
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
              onClick={() => setTab("tabelas")} style={tab !== "tabelas" ? { background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" } : {}}>
              Tabelas
            </button>
          </div>

          {/* Resumo */}
          {tab === "resumo" && (
            <>
              {loadingResumo && <LoadingSpinner />}
              {resumo && (
                <div className="cards-grid">
                  <KPICard 
                    icon={<Activity />} 
                    label="Equipamentos" 
                    value={resumo.equipamentos} 
                    size="medium"
                  />
                  <KPICard 
                    icon={<TrendingUp />} 
                    label="Operações" 
                    value={resumo.operacoes} 
                    size="medium"
                  />
                  <KPICard 
                    icon={<AlertCircle />} 
                    label="Infrações" 
                    value={resumo.infracoes} 
                    size="medium"
                  />
                  <KPICard 
                    icon={<Activity />} 
                    label="Passagens" 
                    value={resumo.passagens} 
                    size="medium"
                  />
                  <KPICard 
                    icon={<FileText />} 
                    label="Triagens" 
                    value={resumo.triagens} 
                    size="medium"
                  />
                  <KPICard 
                    icon={<Users />} 
                    label="Usuários" 
                    value={resumo.usuarios} 
                    size="medium"
                  />
                </div>
              )}
            </>
          )}

          {/* Tabelas */}
          {tab === "tabelas" && (
            <>
              {loadingTabelas && <LoadingSpinner />}
              {tabelas && (
                <div>
                  <p style={{ color: "var(--text-muted)", marginBottom: "1rem", fontSize: "0.85rem" }}>
                    {tabelas.length} tabelas no banco AxHub
                  </p>
                  <DataTable 
                    columns={[
                      { key: "tabela", label: "Tabela", render: (val) => <span style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{val}</span> },
                      { key: "registros", label: "Registros", align: "right", render: (val) => Number(val).toLocaleString("pt-BR") }
                    ]}
                    data={tabelas}
                    sortable
                    striped
                    hover
                  />
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
