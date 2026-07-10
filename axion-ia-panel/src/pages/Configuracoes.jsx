import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, getConfiguredUrl, setApiUrl, getApiToken, setApiToken } from "../services/api";
import AxHubDashboard from "./AxHubDashboard.jsx";
import KnowledgeBase from "./KnowledgeBase.jsx";

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
  const [searchParams] = useSearchParams();
  const [abaConfig, setAbaConfig] = useState(searchParams.get("tab") || 'vars');

  // Sincroniza tab quando URL muda (ex: redirect de /axhub-dashboard ou /kb)
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setAbaConfig(tab);
  }, [searchParams]);
  const [config, setConfig] = useState({});
  const [conexoes, setConexoes] = useState({});
  const [apiUrl, setApiUrlLocal] = useState(getConfiguredUrl());
  const [apiToken, setApiTokenLocal] = useState(getApiToken());
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

  function salvarToken() {
    setApiToken(apiToken.trim());
    setFeedback({ tipo: "success", msg: "Token atualizado. Recarregando configuração..." });
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

  if (loading) return <p style={{ color: "var(--text-muted)" }}>Carregando Configuração</p>;

  return (
    <div style={{ maxWidth: 720 }}>
      <h2 className="page-title">⚙️ Configurações</h2>

      {/* Barra de tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', borderBottom: '2px solid var(--border)', overflowX: 'auto' }}>
        {[
          { id: 'vars',           label: '⚙️ Variáveis & Conexões' },
          { id: 'axhub-sql',      label: '🗄️ AxHub SQL' },
          { id: 'axton-sql',      label: '🗄️ AxTon SQL' },
          { id: 'axcross-sql',    label: '🗄️ AxCross SQL' },
          { id: 'axhub-dashboard',label: '📊 AxHub Dashboard' },
          { id: 'kb',             label: '📚 Knowledge Base' },
        ].map(t => (
          <button key={t.id} onClick={() => setAbaConfig(t.id)} style={{
            padding: '8px 16px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
            background: 'transparent', fontWeight: abaConfig === t.id ? 700 : 400,
            color: abaConfig === t.id ? 'var(--accent)' : 'var(--text-muted)',
            borderBottom: abaConfig === t.id ? '2px solid var(--accent)' : '2px solid transparent',
            marginBottom: '-2px', fontSize: '0.875rem',
          }}>{t.label}</button>
        ))}
      </div>

      {abaConfig === 'axhub-sql'       && <SqlMonitorTab produto="AxHub"   apiPath="axhub"   campos={['AXHUB_DB_HOST','AXHUB_DB_PORT','AXHUB_DB_NAME','AXHUB_DB_USER','AXHUB_DB_PASS']} />}
      {abaConfig === 'axton-sql'       && <SqlMonitorTab produto="AxTon"   apiPath="axton"   campos={['AXTON_DB_HOST','AXTON_DB_PORT','AXTON_DB_NAME','AXTON_DB_USER','AXTON_DB_PASS']} />}
      {abaConfig === 'axcross-sql'     && <SqlMonitorTab produto="AxCross" apiPath="axcross" campos={['AXCROSS_DB_HOST','AXCROSS_DB_PORT','AXCROSS_DB_NAME','AXCROSS_DB_USER','AXCROSS_DB_PASS']} />}
      {abaConfig === 'axhub-dashboard' && <AxHubDashboard />}
      {abaConfig === 'kb'              && <KnowledgeBase />}

      {abaConfig === 'vars' && <>
        {feedback && (
          <div className={`alert alert-${feedback.tipo}`}>{feedback.msg}</div>
        )}

      {/* URL do Painel → API */}
      <div className="card config-section">
        <h3 className="config-section-title">Conexão do Use Dashboard</h3>
        <p className="config-hint">URL base e token de autenticação da AxionIA API (salvos no navegador)</p>
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
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", marginTop: "0.75rem" }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>API Token <code style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>API_TOKEN</code></label>
            <input
              type="password"
              value={apiToken}
              onChange={e => setApiTokenLocal(e.target.value)}
              placeholder="Cole o token definido no .env da API"
              autoComplete="off"
            />
          </div>
          <button type="button" className="btn btn-primary" onClick={salvarToken} style={{ height: 38 }}>
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
      </>}
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

/* ════════════════════════════════════════════════════════════
   Monitor SQL genérico — reutilizado para AxHub, AxTon, AxCross
   ════════════════════════════════════════════════════════════ */
function SqlMonitorTab({ produto, apiPath, campos }) {
  const [status, setStatus]   = useState(null);
  const [resumo, setResumo]   = useState(null);
  const [tabelas, setTabelas] = useState(null);
  const [subtab, setSubtab]   = useState('resumo');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/${apiPath}/status`)
      .then(r => setStatus(r.data))
      .catch(() => setStatus({ conectado: false, erro: 'API indisponível' }))
      .finally(() => setLoading(false));
  }, [apiPath]);

  useEffect(() => {
    if (status?.conectado) {
      api.get(`/${apiPath}/resumo`).then(r => setResumo(r.data)).catch(() => {});
    }
  }, [status, apiPath]);

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Verificando conexão SQL Server...</p>;

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Status card */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
            background: status?.conectado ? 'var(--success)' : 'var(--danger)' }} />
          <div>
            <strong style={{ color: status?.conectado ? 'var(--success)' : 'var(--danger)' }}>
              {status?.conectado ? '✓ Conectado' : '✗ Desconectado'}
            </strong>
            {status?.servidor && (
              <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                {status.servidor}/{status.banco}
              </span>
            )}
            {status?.erro && (
              <span style={{ color: 'var(--danger)', marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                — {status.erro}
              </span>
            )}
          </div>
        </div>
      </div>

      {!status?.conectado && (
        <div className="card config-section">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
            Configure as variáveis em <strong>⚙️ Variáveis & Conexões</strong> e reinicie a API.
          </p>
          <pre style={{ background: 'var(--bg)', padding: '0.75rem', borderRadius: 6,
            fontSize: '0.8rem', border: '1px solid var(--border)', lineHeight: 1.7 }}>
            {campos.map(c => `${c}=valor`).join('\n')}
          </pre>
        </div>
      )}

      {status?.conectado && (
        <>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {[['resumo', 'Resumo'], ['tabelas', 'Tabelas']].map(([id, label]) => (
              <button key={id}
                className={`btn ${subtab === id ? 'btn-primary' : ''}`}
                onClick={() => {
                  setSubtab(id);
                  if (id === 'tabelas' && !tabelas)
                    api.get(`/${apiPath}/tabelas`).then(r => setTabelas(r.data.tabelas)).catch(() => setTabelas([]));
                }}
                style={subtab !== id ? { background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' } : {}}>
                {label}
              </button>
            ))}
          </div>

          {subtab === 'resumo' && resumo && (
            <div className="cards-grid">
              {Object.entries(resumo).map(([k, v]) => (
                <div key={k} className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent)' }}>
                    {typeof v === 'number' ? Number(v).toLocaleString('pt-BR') : v}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem', textTransform: 'capitalize' }}>
                    {k}
                  </div>
                </div>
              ))}
            </div>
          )}
          {subtab === 'resumo' && !resumo && <p style={{ color: 'var(--text-muted)' }}>Carregando dados...</p>}

          {subtab === 'tabelas' && tabelas && (
            <div className="card">
              <p style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                {tabelas.length} tabelas no banco {produto}
              </p>
              <table className="data-table">
                <thead><tr><th>Tabela</th><th style={{ textAlign: 'right' }}>Registros</th></tr></thead>
                <tbody>
                  {tabelas.map(t => (
                    <tr key={t.tabela}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{t.tabela}</td>
                      <td style={{ textAlign: 'right' }}>{Number(t.registros).toLocaleString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {subtab === 'tabelas' && !tabelas && <p style={{ color: 'var(--text-muted)' }}>Carregando tabelas...</p>}
        </>
      )}
    </div>
  );
}
