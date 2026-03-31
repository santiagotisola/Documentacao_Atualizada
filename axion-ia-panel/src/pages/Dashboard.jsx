import { useEffect, useState } from "react";
import { api, setApiUrl, getConfiguredUrl } from "../services/api";

const TABS = [
  { id: "geral",   label: "Visão Geral",    icon: "📊" },
  { id: "axhub",   label: "AxHub",           icon: "🖥️" },
  { id: "axton",   label: "AxTon",           icon: "⚖️" },
  { id: "axcross", label: "AxCross",         icon: "🚦" },
  { id: "config",  label: "Configurações",   icon: "⚙️" },
];

export default function Dashboard() {
  const [tab, setTab] = useState("geral");

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Dashboard</h2>
        <span className="page-subtitle">AxionIA — Painel Unificado</span>
      </div>

      <div className="tab-bar">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab-btn ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            <span className="tab-icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {tab === "geral"  && <TabVisaoGeral />}
        {tab === "axhub"  && <TabAxHub />}
        {tab === "axton"  && <TabAxTon />}
        {tab === "axcross" && <TabAxCross />}
        {tab === "config" && <TabConfiguracoes />}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TAB: Visão Geral (Analytics AxionIA)
   ═══════════════════════════════════════════════════ */
function TabVisaoGeral() {
  const [dados, setDados] = useState(null);
  const [erro, setErro]   = useState(null);

  useEffect(() => {
    api.get("/analise")
      .then(res => setDados(res.data))
      .catch(() => setErro("API indisponível — verifique a conexão na aba Configurações"));
  }, []);

  if (erro) return <div className="alert alert-error">{erro}</div>;
  if (!dados) return <p className="text-muted">Carregando...</p>;

  return (
    <>
      <div className="cards-grid">
        <StatCard label="Total Interações" value={dados.totalInteracoes} />
        <StatCard label="Entradas KB" value={dados.totalEntradasKB} />
        <StatCard label="Taxa Resolução KB" value={dados.taxaResolucaoKB} color="var(--success)" />
      </div>

      <div className="cards-grid">
        <StatCard label="Via KB (keywords)" value={dados.resolucao?.kb || 0} color="var(--success)" />
        <StatCard label="Via Embeddings" value={dados.resolucao?.embedding || 0} color="var(--accent)" />
        <StatCard label="Via OpenAI (fallback)" value={dados.resolucao?.openai || 0} color="var(--warning)" />
      </div>

      {dados.volumePorDia?.length > 0 && (
        <div className="card" style={{ marginBottom: "1rem" }}>
          <div className="label" style={{ marginBottom: "0.75rem" }}>Volume últimos 7 dias</div>
          <table className="data-table">
            <thead><tr><th>Dia</th><th>Interações</th></tr></thead>
            <tbody>
              {dados.volumePorDia.map(d => (
                <tr key={d._id}><td>{d._id}</td><td>{d.total}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {dados.topModulos?.length > 0 && (
        <div className="card">
          <div className="label" style={{ marginBottom: "0.75rem" }}>Top Módulos</div>
          <table className="data-table">
            <thead><tr><th>Módulo</th><th>Interações</th></tr></thead>
            <tbody>
              {dados.topModulos.map(m => (
                <tr key={m._id}><td>{m._id}</td><td>{m.total}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════
   TAB: AxHub (SQL Server)
   ═══════════════════════════════════════════════════ */
function TabAxHub() {
  const [status, setStatus]   = useState(null);
  const [resumo, setResumo]   = useState(null);
  const [tabelas, setTabelas] = useState(null);
  const [subtab, setSubtab]   = useState("resumo");
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
    setSubtab("tabelas");
    if (!tabelas) {
      api.get("/axhub/tabelas").then(r => setTabelas(r.data.tabelas)).catch(() => setTabelas([]));
    }
  }

  if (loading) return <p className="text-muted">Verificando conexão SQL Server...</p>;

  return (
    <>
      <ConnectionCard
        titulo="SQL Server — AxHub"
        conectado={status?.conectado}
        servidor={status?.servidor}
        banco={status?.banco}
        erro={status?.erro}
        envVars={["AXHUB_DB_HOST", "AXHUB_DB_PORT", "AXHUB_DB_NAME", "AXHUB_DB_USER", "AXHUB_DB_PASS"]}
      />

      {status?.conectado && (
        <>
          <div className="subtab-bar">
            <button className={`subtab-btn ${subtab === "resumo" ? "active" : ""}`}
              onClick={() => setSubtab("resumo")}>Resumo</button>
            <button className={`subtab-btn ${subtab === "tabelas" ? "active" : ""}`}
              onClick={carregarTabelas}>Tabelas</button>
          </div>

          {subtab === "resumo" && resumo && (
            <div className="cards-grid">
              <StatCard label="Equipamentos" value={resumo.equipamentos} color="var(--accent)" />
              <StatCard label="Operações"    value={resumo.operacoes}    color="var(--success)" />
              <StatCard label="Infrações"    value={resumo.infracoes}    color="var(--danger)" />
              <StatCard label="Passagens"    value={resumo.passagens}    color="var(--warning)" />
              <StatCard label="Triagens"     value={resumo.triagens}     color="var(--accent)" />
              <StatCard label="Usuários"     value={resumo.usuarios}     color="var(--text-muted)" />
            </div>
          )}
          {subtab === "resumo" && !resumo && <p className="text-muted">Carregando dados...</p>}

          {subtab === "tabelas" && tabelas && (
            <div>
              <p className="text-muted" style={{ marginBottom: "1rem" }}>{tabelas.length} tabelas no banco AxHub</p>
              <table className="data-table">
                <thead><tr><th>Tabela</th><th style={{ textAlign: "right" }}>Registros</th></tr></thead>
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
          {subtab === "tabelas" && !tabelas && <p className="text-muted">Carregando tabelas...</p>}
        </>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════
   TAB: AxTon (SQL Server)
   ═══════════════════════════════════════════════════ */
function TabAxTon() {
  const [status, setStatus]   = useState(null);
  const [resumo, setResumo]   = useState(null);
  const [tabelas, setTabelas] = useState(null);
  const [subtab, setSubtab]   = useState("resumo");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/axton/status")
      .then(res => setStatus(res.data))
      .catch(() => setStatus({ conectado: false, erro: "API indisponível" }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (status?.conectado) {
      api.get("/axton/resumo").then(r => setResumo(r.data)).catch(() => {});
    }
  }, [status]);

  function carregarTabelas() {
    setSubtab("tabelas");
    if (!tabelas) {
      api.get("/axton/tabelas").then(r => setTabelas(r.data.tabelas)).catch(() => setTabelas([]));
    }
  }

  if (loading) return <p className="text-muted">Verificando conexão SQL Server...</p>;

  return (
    <>
      <ConnectionCard
        titulo="SQL Server — AxTon"
        conectado={status?.conectado}
        servidor={status?.servidor}
        banco={status?.banco}
        erro={status?.erro}
        envVars={["AXTON_DB_HOST", "AXTON_DB_PORT", "AXTON_DB_NAME", "AXTON_DB_USER", "AXTON_DB_PASS"]}
      />

      {status?.conectado && (
        <>
          <div className="subtab-bar">
            <button className={`subtab-btn ${subtab === "resumo" ? "active" : ""}`}
              onClick={() => setSubtab("resumo")}>Resumo</button>
            <button className={`subtab-btn ${subtab === "tabelas" ? "active" : ""}`}
              onClick={carregarTabelas}>Tabelas</button>
          </div>

          {subtab === "resumo" && resumo && (
            <div className="cards-grid">
              <StatCard label="Equipamentos" value={resumo.equipamentos} color="var(--accent)" />
              <StatCard label="Operações"    value={resumo.operacoes}    color="var(--success)" />
              <StatCard label="Pesagens"     value={resumo.pesagens}     color="var(--warning)" />
              <StatCard label="Infrações"    value={resumo.infracoes}    color="var(--danger)" />
              <StatCard label="Usuários"     value={resumo.usuarios}     color="var(--text-muted)" />
            </div>
          )}
          {subtab === "resumo" && !resumo && <p className="text-muted">Carregando dados...</p>}

          {subtab === "tabelas" && tabelas && (
            <div>
              <p className="text-muted" style={{ marginBottom: "1rem" }}>{tabelas.length} tabelas no banco AxTon</p>
              <table className="data-table">
                <thead><tr><th>Tabela</th><th style={{ textAlign: "right" }}>Registros</th></tr></thead>
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
          {subtab === "tabelas" && !tabelas && <p className="text-muted">Carregando tabelas...</p>}
        </>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════
   TAB: AxCross (SQL Server)
   ═══════════════════════════════════════════════════ */
function TabAxCross() {
  const [status, setStatus]   = useState(null);
  const [resumo, setResumo]   = useState(null);
  const [tabelas, setTabelas] = useState(null);
  const [subtab, setSubtab]   = useState("resumo");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/axcross/status")
      .then(res => setStatus(res.data))
      .catch(() => setStatus({ conectado: false, erro: "API indisponível" }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (status?.conectado) {
      api.get("/axcross/resumo").then(r => setResumo(r.data)).catch(() => {});
    }
  }, [status]);

  function carregarTabelas() {
    setSubtab("tabelas");
    if (!tabelas) {
      api.get("/axcross/tabelas").then(r => setTabelas(r.data.tabelas)).catch(() => setTabelas([]));
    }
  }

  if (loading) return <p className="text-muted">Verificando conexão SQL Server...</p>;

  return (
    <>
      <ConnectionCard
        titulo="SQL Server — AxCross"
        conectado={status?.conectado}
        servidor={status?.servidor}
        banco={status?.banco}
        erro={status?.erro}
        envVars={["AXCROSS_DB_HOST", "AXCROSS_DB_PORT", "AXCROSS_DB_NAME", "AXCROSS_DB_USER", "AXCROSS_DB_PASS"]}
      />

      {status?.conectado && (
        <>
          <div className="subtab-bar">
            <button className={`subtab-btn ${subtab === "resumo" ? "active" : ""}`}
              onClick={() => setSubtab("resumo")}>Resumo</button>
            <button className={`subtab-btn ${subtab === "tabelas" ? "active" : ""}`}
              onClick={carregarTabelas}>Tabelas</button>
          </div>

          {subtab === "resumo" && resumo && (
            <div className="cards-grid">
              <StatCard label="Equipamentos" value={resumo.equipamentos} color="var(--accent)" />
              <StatCard label="Operações"    value={resumo.operacoes}    color="var(--success)" />
              <StatCard label="Passagens"    value={resumo.passagens}    color="var(--warning)" />
              <StatCard label="Locais"       value={resumo.locais}       color="#e67e22" />
              <StatCard label="Usuários"     value={resumo.usuarios}     color="var(--text-muted)" />
            </div>
          )}
          {subtab === "resumo" && !resumo && <p className="text-muted">Carregando dados...</p>}

          {subtab === "tabelas" && tabelas && (
            <div>
              <p className="text-muted" style={{ marginBottom: "1rem" }}>{tabelas.length} tabelas no banco AxCross</p>
              <table className="data-table">
                <thead><tr><th>Tabela</th><th style={{ textAlign: "right" }}>Registros</th></tr></thead>
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
          {subtab === "tabelas" && !tabelas && <p className="text-muted">Carregando tabelas...</p>}
        </>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════
   TAB: Configurações
   ═══════════════════════════════════════════════════ */
function TabConfiguracoes() {
  const [apiUrl, setApiUrlLocal]    = useState(getConfiguredUrl());
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting]       = useState(false);
  const [saved, setSaved]           = useState(false);

  function salvar(e) {
    e.preventDefault();
    setApiUrl(apiUrl.trim());
    setSaved(true);
    setTestResult(null);
    setTimeout(() => setSaved(false), 3000);
  }

  async function testarConexao() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.get("/analise");
      setTestResult({ ok: true, msg: `API respondeu — ${res.data.totalInteracoes ?? 0} interações registradas` });
    } catch {
      setTestResult({ ok: false, msg: "Falha ao conectar. Verifique a URL e se a API está rodando." });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <div className="config-section">
        <h3 className="config-title">🔗 Conexão da API</h3>
        <p className="text-muted" style={{ marginBottom: "1rem", fontSize: "0.85rem" }}>
          URL base da API AxionIA. Padrão: <code style={{ color: "var(--accent)" }}>http://localhost:3100/api</code>
        </p>
        <form onSubmit={salvar}>
          <div className="config-row">
            <input className="config-input" value={apiUrl}
              onChange={e => setApiUrlLocal(e.target.value)}
              placeholder="http://localhost:3100/api" />
            <button type="submit" className="btn btn-primary">Salvar</button>
            <button type="button" className="btn btn-outline" onClick={testarConexao} disabled={testing}>
              {testing ? "Testando..." : "Testar"}
            </button>
          </div>
        </form>
        {saved && <div className="alert alert-success" style={{ marginTop: "0.75rem" }}>URL salva com sucesso</div>}
        {testResult && (
          <div className={`alert ${testResult.ok ? "alert-success" : "alert-error"}`} style={{ marginTop: "0.75rem" }}>
            {testResult.msg}
          </div>
        )}
      </div>

      <div className="config-section">
        <h3 className="config-title">🖥️ AxHub — SQL Server</h3>
        <p className="text-muted" style={{ marginBottom: "1rem", fontSize: "0.85rem" }}>
          Configuração no <code style={{ color: "var(--accent)" }}>.env</code> da API (axion-ia-api):
        </p>
        <pre className="config-pre">{`AXHUB_DB_HOST=seu-servidor\nAXHUB_DB_PORT=1433\nAXHUB_DB_NAME=AxHub\nAXHUB_DB_USER=seu-usuario\nAXHUB_DB_PASS=sua-senha`}</pre>
      </div>

      <div className="config-section">
        <h3 className="config-title">⚖️ AxTon — SQL Server</h3>
        <p className="text-muted" style={{ marginBottom: "1rem", fontSize: "0.85rem" }}>
          Configuração no <code style={{ color: "var(--accent)" }}>.env</code> da API (axion-ia-api):
        </p>
        <pre className="config-pre">{`AXTON_DB_HOST=seu-servidor\nAXTON_DB_PORT=1433\nAXTON_DB_NAME=AxTon\nAXTON_DB_USER=seu-usuario\nAXTON_DB_PASS=sua-senha`}</pre>
      </div>

      <div className="config-section">
        <h3 className="config-title">🚦 AxCross — SQL Server</h3>
        <p className="text-muted" style={{ marginBottom: "1rem", fontSize: "0.85rem" }}>
          Configuração no <code style={{ color: "var(--accent)" }}>.env</code> da API (axion-ia-api):
        </p>
        <pre className="config-pre">{`AXCROSS_DB_HOST=seu-servidor\nAXCROSS_DB_PORT=1433\nAXCROSS_DB_NAME=AxCross\nAXCROSS_DB_USER=seu-usuario\nAXCROSS_DB_PASS=sua-senha`}</pre>
      </div>

      <div className="config-section">
        <h3 className="config-title">🤖 OpenAI</h3>
        <p className="text-muted" style={{ marginBottom: "1rem", fontSize: "0.85rem" }}>
          Chave para embeddings e fallback GPT:
        </p>
        <pre className="config-pre">{`OPENAI_API_KEY=sk-...sua-chave`}</pre>
      </div>

      <div className="config-section">
        <h3 className="config-title">🍃 MongoDB</h3>
        <p className="text-muted" style={{ marginBottom: "1rem", fontSize: "0.85rem" }}>
          Base de embeddings e logs:
        </p>
        <pre className="config-pre">{`MONGO_URI=mongodb://localhost:27017/axion-ia`}</pre>
      </div>

      <p className="text-muted" style={{ fontSize: "0.8rem", marginTop: "1.5rem" }}>
        Após alterar variáveis no .env, reinicie a API: <code style={{ color: "var(--accent)" }}>npm start</code>
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Componentes reutilizáveis
   ═══════════════════════════════════════════════════ */
function StatCard({ label, value, color }) {
  return (
    <div className="card">
      <div className="label">{label}</div>
      <div className="value" style={color ? { color } : {}}>
        {typeof value === "number" ? value.toLocaleString("pt-BR") : value ?? "—"}
      </div>
    </div>
  );
}

function ConnectionCard({ titulo, conectado, servidor, banco, erro, envVars }) {
  return (
    <div className="connection-card" data-status={conectado ? "ok" : "fail"}>
      <div className="connection-header">
        <span className={`status-dot ${conectado ? "green" : "red"}`} />
        <div>
          <div className="connection-title">{titulo}</div>
          <div className="connection-detail">
            {conectado ? `${servidor}/${banco}` : erro || "Desconectado"}
          </div>
        </div>
      </div>
      {!conectado && (
        <div className="connection-help">
          <p>Configure no <code>.env</code> da API:</p>
          <pre className="config-pre">{envVars.map(v => `${v}=...`).join("\n")}</pre>
        </div>
      )}
    </div>
  );
}
