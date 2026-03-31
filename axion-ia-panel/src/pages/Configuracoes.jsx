import { useEffect, useState } from "react";
import { api, getConfiguredUrl, setApiUrl } from "../services/api";

const GRUPOS = [
  {
    titulo: "API",
    campos: [
      { chave: "PORT", label: "Porta", placeholder: "3100" },
      { chave: "CORS_ORIGIN", label: "CORS Origin", placeholder: "http://localhost:3003" }
    ]
  },
  {
    titulo: "OpenAI",
    campos: [
      { chave: "OPENAI_API_KEY", label: "API Key", tipo: "password", placeholder: "sk-..." }
    ]
  },
  {
    titulo: "MongoDB",
    campos: [
      { chave: "MONGO_URI", label: "URI de Conexão", placeholder: "mongodb://localhost:27017/axion-ia" }
    ]
  },
  {
    titulo: "Jitbit Helpdesk",
    campos: [
      { chave: "JITBIT_URL", label: "URL", placeholder: "https://desk.axiontecnologia.com.br" },
      { chave: "JITBIT_USER", label: "Usuário", placeholder: "email@empresa.com.br" },
      { chave: "JITBIT_PASS", label: "Senha", tipo: "password", placeholder: "••••" }
    ]
  },
  {
    titulo: "AxHub — SQL Server",
    campos: [
      { chave: "AXHUB_DB_HOST", label: "Servidor", placeholder: "localhost" },
      { chave: "AXHUB_DB_PORT", label: "Porta", placeholder: "1433" },
      { chave: "AXHUB_DB_NAME", label: "Banco", placeholder: "AxHub" },
      { chave: "AXHUB_DB_USER", label: "Usuário", placeholder: "sa" },
      { chave: "AXHUB_DB_PASS", label: "Senha", tipo: "password", placeholder: "••••" },
      { chave: "AXHUB_DB_ENCRYPT", label: "Encrypt", placeholder: "false" }
    ]
  },
  {
    titulo: "AxTon — SQL Server",
    campos: [
      { chave: "AXTON_DB_HOST", label: "Servidor", placeholder: "localhost" },
      { chave: "AXTON_DB_PORT", label: "Porta", placeholder: "1433" },
      { chave: "AXTON_DB_NAME", label: "Banco", placeholder: "AxTon" },
      { chave: "AXTON_DB_USER", label: "Usuário", placeholder: "sa" },
      { chave: "AXTON_DB_PASS", label: "Senha", tipo: "password", placeholder: "••••" },
      { chave: "AXTON_DB_ENCRYPT", label: "Encrypt", placeholder: "false" }
    ]
  },
  {
    titulo: "AxCross — SQL Server",
    campos: [
      { chave: "AXCROSS_DB_HOST", label: "Servidor", placeholder: "localhost" },
      { chave: "AXCROSS_DB_PORT", label: "Porta", placeholder: "1433" },
      { chave: "AXCROSS_DB_NAME", label: "Banco", placeholder: "AxCross" },
      { chave: "AXCROSS_DB_USER", label: "Usuário", placeholder: "sa" },
      { chave: "AXCROSS_DB_PASS", label: "Senha", tipo: "password", placeholder: "••••" },
      { chave: "AXCROSS_DB_ENCRYPT", label: "Encrypt", placeholder: "false" }
    ]
  }
];

export default function Configuracoes() {
  const [config, setConfig] = useState({});
  const [conexoes, setConexoes] = useState({});
  const [apiUrl, setApiUrlLocal] = useState(getConfiguredUrl());
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [testeMongo, setTesteMongo] = useState(null);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setLoading(true);
    try {
      const res = await api.get("/config");
      setConfig(res.data.config || {});
      setConexoes(res.data.conexoes || {});
    } catch {
      setFeedback({ tipo: "error", msg: "Erro ao carregar configuração. Verifique se a API está rodando." });
    } finally {
      setLoading(false);
    }
  }

  function handleChange(chave, valor) {
    setConfig(prev => ({ ...prev, [chave]: valor }));
  }

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true);
    setFeedback(null);
    try {
      const res = await api.post("/config", config);
      setFeedback({ tipo: "success", msg: res.data.mensagem });
    } catch (err) {
      setFeedback({ tipo: "error", msg: err.response?.data?.erro || "Erro ao salvar" });
    } finally {
      setSalvando(false);
    }
  }

  function salvarApiUrl() {
    const url = apiUrl.trim();
    if (!url) return;
    setApiUrl(url);
    setFeedback({ tipo: "success", msg: "URL da API atualizada. Recarregando configuração..." });
    setTimeout(() => { carregar(); setFeedback(null); }, 800);
  }

  async function testarConexaoMongo() {
    setTesteMongo({ status: "testando" });
    try {
      const res = await api.post("/config/testar-mongo", { uri: config.MONGO_URI });
      setTesteMongo(res.data);
    } catch {
      setTesteMongo({ conectado: false, erro: "API indisponível" });
    }
  }

  if (loading) return <p style={{ color: "var(--text-muted)" }}>Carregando configuração...</p>;

  return (
    <div style={{ maxWidth: 720 }}>
      <h2 className="page-title">⚙️ Configurações</h2>

      {feedback && (
        <div className={`alert alert-${feedback.tipo}`}>{feedback.msg}</div>
      )}

      {/* URL do Painel → API */}
      <div className="card config-section">
        <h3 className="config-section-title">Conexão do Painel</h3>
        <p className="config-hint">URL base da AxionIA API (salva no navegador)</p>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>API URL</label>
            <input
              value={apiUrl}
              onChange={e => setApiUrlLocal(e.target.value)}
              placeholder="http://localhost:3100/api"
            />
          </div>
          <button type="button" className="btn btn-primary" onClick={salvarApiUrl} style={{ height: 38 }}>
            Aplicar
          </button>
        </div>
      </div>

      {/* Status de conexões */}
      <div className="card config-section">
        <h3 className="config-section-title">Status das Conexões</h3>
        <div className="config-status-grid">
          <StatusBadge label="MongoDB" conectado={conexoes.mongodb?.conectado} detalhe={conexoes.mongodb?.uri} />
          <StatusBadge label="AxHub SQL" conectado={conexoes.axhub_sql?.configurado} detalhe={conexoes.axhub_sql?.configurado ? "Configurado" : "Não configurado"} />
          <StatusBadge label="AxTon SQL" conectado={conexoes.axton_sql?.configurado} detalhe={conexoes.axton_sql?.configurado ? "Configurado" : "Não configurado"} />
          <StatusBadge label="AxCross SQL" conectado={conexoes.axcross_sql?.configurado} detalhe={conexoes.axcross_sql?.configurado ? "Configurado" : "Não configurado"} />
        </div>
        <button
          type="button"
          className="btn"
          onClick={testarConexaoMongo}
          style={{ marginTop: "0.75rem", background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)", fontSize: "0.8rem" }}
        >
          Testar MongoDB
        </button>
        {testeMongo && (
          <span style={{ marginLeft: "0.75rem", fontSize: "0.8rem", color: testeMongo.conectado ? "var(--success)" : "var(--danger)" }}>
            {testeMongo.status === "testando" ? "Testando..." : testeMongo.conectado ? "✓ Conectado" : `✗ ${testeMongo.erro}`}
          </span>
        )}
      </div>

      {/* Formulário de configuração .env */}
      <form onSubmit={salvar}>
        {GRUPOS.map(grupo => (
          <div key={grupo.titulo} className="card config-section">
            <h3 className="config-section-title">{grupo.titulo}</h3>
            <div className="config-fields">
              {grupo.campos.map(campo => (
                <div key={campo.chave} className="form-group">
                  <label>{campo.label} <code style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>{campo.chave}</code></label>
                  <input
                    type={campo.tipo || "text"}
                    value={config[campo.chave] || ""}
                    onChange={e => handleChange(campo.chave, e.target.value)}
                    placeholder={campo.placeholder}
                    autoComplete="off"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", marginBottom: "2rem" }}>
          <button type="submit" className="btn btn-primary" disabled={salvando}>
            {salvando ? "Salvando..." : "💾 Salvar Configuração"}
          </button>
          <button type="button" className="btn" onClick={carregar}
            style={{ background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
            Recarregar
          </button>
        </div>

        <p className="config-hint" style={{ marginBottom: "2rem" }}>
          ⚠️ Após salvar alterações de conexão (MongoDB, SQL Server), reinicie a API para aplicar.
        </p>
      </form>
    </div>
  );
}

function StatusBadge({ label, conectado, detalhe }) {
  return (
    <div className="config-status-item">
      <span className="config-status-dot" style={{ background: conectado ? "var(--success)" : "var(--danger)" }} />
      <div>
        <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{label}</div>
        <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{detalhe || "—"}</div>
      </div>
    </div>
  );
}
