import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setApiUrl, getConfiguredUrl } from "../services/api";

/* ═══════════════════════════════════════════════════
   Grid de serviços — acesso rápido
   ═══════════════════════════════════════════════════ */
const SERVICOS = [
  // ── 1. Atendimento (entrada do chamado) ──
  { icon: "🤖", titulo: "Chat IA",           desc: "Assistente inteligente",    link: "/chat",            cor: "#8b5cf6", cat: "Atendimento" },
  { icon: "💬", titulo: "WhatsApp Bot",      desc: "Atendimento automático",    link: "/whatsapp",        cor: "#25d366", cat: "Atendimento" },
  { icon: "🎫", titulo: "Helpdesk",          desc: "Tickets Jitbit",            link: "/helpdesk",        cor: "#ef4444", cat: "Atendimento" },

  // ── 2. Análise (processamento do chamado) ──
  { icon: "🔍", titulo: "Análise Imagens",   desc: "OCR e validação",           link: "/analise-imagens", cor: "#06b6d4", cat: "Análise" },
  { icon: "✅", titulo: "Fila de Revisão",   desc: "Confiança OCR",             link: "/confianca",       cor: "#14b8a6", cat: "Análise" },
  { icon: "📚", titulo: "Knowledge Base",    desc: "Base de conhecimento",      link: "/kb",              cor: "#6366f1", cat: "Análise" },

  // ── 3. Sistemas (operação) ──
  { icon: "🖥️", titulo: "AxHub",             desc: "Fiscalização eletrônica",   link: "https://economia.axhub.axion.ws",     cor: "#3498db", cat: "Sistemas", ext: true },
  { icon: "🚦", titulo: "AxCross",           desc: "Cruzamento de dados",       link: "https://economia.axcross.axion.ws",   cor: "#e67e22", cat: "Sistemas", ext: true },
  { icon: "⚖️", titulo: "AxTon",             desc: "Pesagem veicular (desktop)", link: null,                                  cor: "#1abc9c", cat: "Sistemas" },
  { icon: "📘", titulo: "Manual AxHub",      desc: "Documentação completa",     link: "http://localhost:3010/AxHub.Docs/",   cor: "#2980b9", cat: "Sistemas", ext: true },
  { icon: "📗", titulo: "Manual AxTon",      desc: "Documentação completa",     link: "http://localhost:3011/AxTon.Docs/",   cor: "#16a085", cat: "Sistemas", ext: true },
  { icon: "📙", titulo: "Manual AxCross",    desc: "Documentação completa",     link: "http://localhost:3012/AxCross.Docs/", cor: "#d35400", cat: "Sistemas", ext: true },

  // ── 4. Qualidade (controle e métricas) ──
  { icon: "🎯", titulo: "SLA Compliance",    desc: "Conformidade de SLA",       link: "/sla-compliance",  cor: "#ec4899", cat: "Qualidade" },
  { icon: "📜", titulo: "Conformidade",      desc: "Editais e requisitos",      link: "/conformidade",    cor: "#d97706", cat: "Qualidade" },
  { icon: "📊", titulo: "Relatório Fluxo",   desc: "Métricas de atendimento",   link: "/relatorio-fluxo", cor: "#a855f7", cat: "Qualidade" },

  // ── 5. Inteligência (planejamento e mercado) ──
  { icon: "🏛️", titulo: "Editais Gov",       desc: "Busca PNCP",               link: "/editais-gov",     cor: "#10b981", cat: "Inteligência" },
  { icon: "📊", titulo: "Análise Multi",     desc: "Comparativo de produtos",   link: "/analisa-multi",   cor: "#f59e0b", cat: "Inteligência" },
  { icon: "🗺️", titulo: "Roadmap",           desc: "Planejamento de produto",   link: "/roadmap",         cor: "#0ea5e9", cat: "Inteligência" },
  { icon: "📐", titulo: "Specs",             desc: "Especificações técnicas",   link: "/specs",           cor: "#64748b", cat: "Inteligência" },

  // ── 6. Administração ──
  { icon: "📄", titulo: "Gerar Doc",         desc: "Documentação automática",   link: "/gerar-doc",       cor: "#f59e0b", cat: "Admin" },
  { icon: "🔎", titulo: "Fontes Pesquisa",   desc: "URLs e referências",        link: "/fontes",          cor: "#78716c", cat: "Admin" },
  { icon: "⏱️", titulo: "Planilha Horas",    desc: "Controle de tempo",         link: "/planilha-horas",  cor: "#0369a1", cat: "Admin" },
  { icon: "🎓", titulo: "Treinamento",       desc: "Capacitação IA",            link: "/treinamento",     cor: "#4f46e5", cat: "Admin" },
  { icon: "📋", titulo: "Logs",              desc: "Auditoria e rastreio",      link: "/logs",            cor: "#64748b", cat: "Admin" },

  // ── 7. Operação (migrado do docs-portal) ──
  { icon: "🔬", titulo: "Análise de Sites",  desc: "Comparativo de contratos",  link: "/analise-sites",   cor: "#0891b2", cat: "Operação" },
  { icon: "📋", titulo: "Guia por Site",     desc: "Manual por contrato",       link: "/guia-sites",      cor: "#059669", cat: "Operação" },
  { icon: "🎫", titulo: "Chamados × Sites",  desc: "Helpdesk por site",         link: "/chamados-sites",  cor: "#7c3aed", cat: "Operação" },
];

const CATEGORIAS = ["Todos", "Atendimento", "Análise", "Sistemas", "Qualidade", "Inteligência", "Admin", "Operação"];

const TABS = [
  { id: "geral",   label: "Visão Geral",    icon: "📊" },
  { id: "axhub",   label: "AxHub",           icon: "🖥️" },
  { id: "axton",   label: "AxTon",           icon: "⚖️" },
  { id: "axcross", label: "AxCross",         icon: "🚦" },
  { id: "config",  label: "Configurações",   icon: "⚙️" },
];

function ServiceCard({ icon, titulo, desc, link, cor, onClick }) {
  return (
    <div className="service-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onClick()}>
      <div className="service-icon" style={{ background: cor }}>{icon}</div>
      <div className="service-titulo">{titulo}</div>
      <div className="service-desc">{desc}</div>
    </div>
  );
}

export default function Dashboard() {
  const [tab, setTab] = useState("geral");
  const [filtro, setFiltro] = useState("Todos");
  const [helpdeskKpi, setHelpdeskKpi] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/helpdesk/sites-overview")
      .then(r => {
        const d = r.data;
        setHelpdeskKpi({
          totalChamados: d.totalTickets || 0,
          sitesAtivos: d.sites?.length || 0,
          abertos: d.sites?.reduce((s, x) => s + (x.abertos || 0), 0) || 0,
        });
      })
      .catch(() => {});
  }, []);

  const servicosFiltrados = filtro === "Todos"
    ? SERVICOS
    : SERVICOS.filter(s => s.cat === filtro);

  function handleServiceClick(s) {
    if (s.ext && s.link) {
      window.open(s.link, "_blank", "noopener,noreferrer");
    } else if (s.link) {
      navigate(s.link);
    } else {
      // AxTon desktop — ativa a tab
      const tabMap = { "AxTon": "axton" };
      if (tabMap[s.titulo]) setTab(tabMap[s.titulo]);
    }
  }

  return (
    <div>
      <div className="dash-hero">
        <h2 className="dash-hero-title">AxionIA</h2>
        <p className="dash-hero-sub">Plataforma Inteligente de Gestão de Trânsito</p>
        <div className="dash-stats-bar">
          <div className="dash-stat"><span className="dash-stat-num">3</span><span className="dash-stat-label">Sistemas</span></div>
          <div className="dash-stat"><span className="dash-stat-num">{SERVICOS.length}</span><span className="dash-stat-label">Módulos</span></div>
          <div className="dash-stat"><span className="dash-stat-num">24/7</span><span className="dash-stat-label">WhatsApp</span></div>
          <div className="dash-stat"><span className="dash-stat-num">IA</span><span className="dash-stat-label">Classificação</span></div>
          {helpdeskKpi && (
            <>
              <div className="dash-stat"><span className="dash-stat-num">{helpdeskKpi.totalChamados}</span><span className="dash-stat-label">Chamados</span></div>
              <div className="dash-stat"><span className="dash-stat-num">{helpdeskKpi.abertos}</span><span className="dash-stat-label">Abertos</span></div>
            </>
          )}
        </div>
      </div>

      <div className="service-section">
        <div className="service-filter-bar">
          {CATEGORIAS.map(c => (
            <button key={c}
              className={`service-filter-btn ${filtro === c ? "active" : ""}`}
              onClick={() => setFiltro(c)}>{c}</button>
          ))}
        </div>
        <div className="service-grid">
          {servicosFiltrados.map((s, i) => (
            <ServiceCard key={i} {...s} onClick={() => handleServiceClick(s)} />
          ))}
        </div>
      </div>

      <div className="dash-analytics-section">
        <h3 className="dash-analytics-title">Analytics</h3>
        <div className="tab-bar">
          {TABS.map(t => (
            <button key={t.id}
              className={`tab-btn ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}>
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
