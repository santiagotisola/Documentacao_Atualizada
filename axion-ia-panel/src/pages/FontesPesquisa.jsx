import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";

const PRODUTOS = [
  { value: "axhub",   label: "AxHub",   icon: "🖥️",  cor: "#3b82f6" },
  { value: "axton",   label: "AxTon",   icon: "⚖️",  cor: "#8b5cf6" },
  { value: "axcross", label: "AxCross", icon: "🚦",  cor: "#10b981" },
];

const TIPOS = [
  { value: "manual",       label: "Manual do Usuário" },
  { value: "especificacao",label: "Especificação Técnica" },
  { value: "relatorio",    label: "Relatório de Usabilidade" },
  { value: "requisito",    label: "Requisito / Funcionalidade" },
  { value: "outro",        label: "Outro" },
];

// ─── ABAS PRINCIPAIS ──────────────────────────────────────────────
const ABAS = [
  { id: "fontes",    label: "📋 Fontes Cadastradas" },
  { id: "pncp",     label: "🔎 Coletar do PNCP"    },
  { id: "adicionar", label: "+ Adicionar Fonte"     },
  { id: "analise",   label: "📊 Análise de Cobertura" },
  { id: "sugestoes", label: "💡 Sugestões de Melhoria" },
];

export default function FontesPesquisa() {
  const [produto, setProduto] = useState("axhub");
  const [aba, setAba] = useState("fontes");

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Fontes de Pesquisa</h2>
        <span className="page-subtitle">
          Repositório de documentos para análise de usabilidade e cobertura de documentação.
          <br />
          <small style={{ color: "var(--warning)", fontWeight: 600 }}>
            ⚠️ Estas fontes NÃO alimentam a base de conhecimento da IA de suporte — usadas apenas para comparação.
          </small>
        </span>
      </div>

      {/* Seletor de produto */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {PRODUTOS.map(p => (
          <button
            key={p.value}
            className={`tab-btn ${produto === p.value ? "active" : ""}`}
            onClick={() => setProduto(p.value)}
            style={produto === p.value ? { borderColor: p.cor, color: p.cor } : {}}
          >
            {p.icon} {p.label}
          </button>
        ))}
      </div>

      {/* Abas de funcionalidade */}
      <div className="tab-bar" style={{ marginBottom: "1.5rem" }}>
        {ABAS.map(a => (
          <button
            key={a.id}
            className={`tab-btn ${aba === a.id ? "active" : ""}`}
            onClick={() => setAba(a.id)}
          >
            {a.label}
          </button>
        ))}
      </div>

      {aba === "fontes"    && <TabFontes produto={produto} onAnalisar={() => setAba("analise")} />}
      {aba === "pncp"     && <TabPNCP produto={produto} onImportado={() => setAba("fontes")} />}
      {aba === "adicionar" && <TabAdicionar produto={produto} onSucesso={() => setAba("fontes")} />}
      {aba === "analise"   && <TabAnalise produto={produto} />}
      {aba === "sugestoes" && <TabSugestoes produto={produto} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ABA: Coletar do PNCP
// ═══════════════════════════════════════════════════════
function TabPNCP({ produto, onImportado }) {
  const [busca, setBusca] = useState("");
  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [coletando, setColetando] = useState(false);
  const [status, setStatus] = useState(null);
  const [selecionados, setSelecionados] = useState([]);
  const [importando, setImportando] = useState(false);
  const [msg, setMsg] = useState(null);
  const [palavrasConfig, setPalavrasConfig] = useState([]);
  const [novaPalavra, setNovaPalavra] = useState("");
  const [mostrarConfig, setMostrarConfig] = useState(false);

  // Carrega status do coletor e config ao montar
  useEffect(() => {
    Promise.all([
      api.get("/coletor/status"),
      api.get("/coletor/config"),
    ]).then(([rs, rc]) => {
      setStatus(rs.data);
      setPalavrasConfig(rc.data.adicionais?.[produto] || []);
    }).catch(() => {});
  }, [produto]);

  async function handleBuscar() {
    if (!busca.trim()) return;
    setCarregando(true);
    setMsg(null);
    setSelecionados([]);
    try {
      const r = await api.get(`/coletor/pncp?produto=${produto}&q=${encodeURIComponent(busca)}&tamanhoPagina=15`);
      setResultado(r.data);
    } catch {
      setMsg({ tipo: "error", texto: "Erro ao buscar no PNCP. Tente novamente." });
    } finally {
      setCarregando(false);
    }
  }

  async function handleColetar() {
    if (!confirm(`Coletar TODOS os editais relacionados ao ${produto.toUpperCase()} do PNCP? Isso pode levar alguns segundos.`)) return;
    setColetando(true);
    setMsg(null);
    try {
      const r = await api.post("/coletor/pncp/coletar", { produto });
      setMsg({
        tipo: "success",
        texto: `Coleta concluída: ${r.data.totalEncontrados} encontrados, ${r.data.novasFontes} novas fontes adicionadas.`,
      });
    } catch (err) {
      setMsg({ tipo: "error", texto: err.response?.data?.erro || "Erro na coleta" });
    } finally {
      setColetando(false);
      // Atualiza status
      api.get("/coletor/status").then(r => setStatus(r.data)).catch(() => {});
    }
  }

  async function handleImportar() {
    if (!selecionados.length) return;
    setImportando(true);
    try {
      const itens = resultado.items.filter(i => selecionados.includes(i.numero));
      const r = await api.post("/coletor/pncp/importar", { itens, produto });
      setMsg({
        tipo: "success",
        texto: `${r.data.salvos} fonte(s) importadas.${r.data.duplicados ? ` (${r.data.duplicados} duplicadas ignoradas)` : ""}`,
      });
      setSelecionados([]);
      setTimeout(onImportado, 1500);
    } catch (err) {
      setMsg({ tipo: "error", texto: err.response?.data?.erro || "Erro ao importar" });
    } finally {
      setImportando(false);
    }
  }

  function toggleSelecionado(numero) {
    setSelecionados(s => s.includes(numero) ? s.filter(x => x !== numero) : [...s, numero]);
  }

  async function salvarPalavras() {
    try {
      await api.post("/coletor/config", { produto, palavras: palavrasConfig });
      setMsg({ tipo: "success", texto: "Palavras-chave salvas!" });
    } catch { setMsg({ tipo: "error", texto: "Erro ao salvar" }); }
  }

  return (
    <div>
      {/* Status da coleta automática */}
      {status && (
        <div className="card" style={{ marginBottom: "1rem", padding: "0.75rem 1rem" }}>
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap", fontSize: "0.82rem" }}>
            <span>
              <strong>Coleta automática:</strong>{" "}
              <span style={{ color: status.agendada ? "var(--success)" : "var(--text-muted)" }}>
                {status.agendada ? "Agendada (a cada 6h)" : "Desabilitada"}
              </span>
              {!status.agendada && (
                <span style={{ marginLeft: 6, color: "var(--text-muted)", fontSize: "0.75rem" }}>
                  — ative com <code>PNCP_COLETA_ATIVA=true</code> no .env
                </span>
              )}
            </span>
            {status.ultimaColeta && (
              <span>
                <strong>Última:</strong>{" "}
                {new Date(status.ultimaColeta).toLocaleString("pt-BR")}
              </span>
            )}
            <span><strong>Total novas:</strong> {status.totalNovos || 0}</span>
          </div>
        </div>
      )}

      {msg && (
        <div className={`alert alert-${msg.tipo}`} style={{ marginBottom: "1rem" }}>
          {msg.texto}
        </div>
      )}

      {/* Busca manual */}
      <div className="card" style={{ marginBottom: "1rem" }}>
        <div style={{ marginBottom: "0.75rem", fontWeight: 600, fontSize: "0.9rem" }}>
          Busca Manual no PNCP — <span style={{ color: "var(--accent)" }}>{produto.toUpperCase()}</span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder="Ex: radar velocidade, pesagem veicular, sistema monitoramento..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleBuscar()}
          />
          <button className="btn btn-primary" onClick={handleBuscar} disabled={carregando || !busca.trim()}>
            {carregando ? "Buscando..." : "🔍 Buscar"}
          </button>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            className="btn"
            onClick={handleColetar}
            disabled={coletando}
            title="Busca com todas as palavras-chave configuradas para este produto"
          >
            {coletando ? "Coletando..." : "🤖 Coleta Automática Completa"}
          </button>
          <button
            className="btn"
            onClick={() => setMostrarConfig(v => !v)}
            style={{ fontSize: "0.8rem" }}
          >
            ⚙️ Palavras-chave
          </button>
        </div>
      </div>

      {/* Configurar palavras-chave adicionais */}
      {mostrarConfig && (
        <div className="card" style={{ marginBottom: "1rem" }}>
          <div style={{ fontWeight: 600, marginBottom: "0.5rem", fontSize: "0.85rem" }}>
            Palavras-chave adicionais — {produto.toUpperCase()}
          </div>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <input
              className="input"
              style={{ flex: 1 }}
              placeholder="Adicionar palavra-chave..."
              value={novaPalavra}
              onChange={e => setNovaPalavra(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && novaPalavra.trim()) {
                  setPalavrasConfig(p => [...p, novaPalavra.trim()]);
                  setNovaPalavra("");
                }
              }}
            />
            <button
              className="btn"
              onClick={() => { if (novaPalavra.trim()) { setPalavrasConfig(p => [...p, novaPalavra.trim()]); setNovaPalavra(""); } }}
            >
              + Adicionar
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.75rem" }}>
            {palavrasConfig.map((p, i) => (
              <span key={i} style={{
                background: "var(--accent)", color: "#fff",
                padding: "0.2rem 0.6rem", borderRadius: 12, fontSize: "0.78rem",
                display: "flex", alignItems: "center", gap: 4,
              }}>
                {p}
                <button
                  onClick={() => setPalavrasConfig(ps => ps.filter((_, j) => j !== i))}
                  style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 0, fontSize: "0.9rem" }}
                >×</button>
              </span>
            ))}
            {palavrasConfig.length === 0 && (
              <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Nenhuma palavra adicional configurada.</span>
            )}
          </div>
          <button className="btn btn-primary" onClick={salvarPalavras}>Salvar</button>
        </div>
      )}

      {/* Resultados da busca */}
      {resultado && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {resultado.total} resultado(s) encontrado(s)
            </span>
            {selecionados.length > 0 && (
              <button
                className="btn btn-primary"
                onClick={handleImportar}
                disabled={importando}
              >
                {importando ? "Importando..." : `📥 Importar ${selecionados.length} selecionado(s)`}
              </button>
            )}
          </div>

          {resultado.items.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "1.5rem", color: "var(--text-muted)" }}>
              Nenhum resultado encontrado para "<strong>{busca}</strong>" no PNCP.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 36 }}></th>
                  <th>Título / Órgão</th>
                  <th>UF</th>
                  <th>Modalidade</th>
                  <th>Publicação</th>
                  <th>Valor Est.</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {resultado.items.map(item => (
                  <tr key={item.numero} style={selecionados.includes(item.numero) ? { background: "var(--surface2)" } : {}}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selecionados.includes(item.numero)}
                        onChange={() => toggleSelecionado(item.numero)}
                        style={{ cursor: "pointer" }}
                      />
                    </td>
                    <td style={{ maxWidth: 320 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: 2 }}>
                        {item.titulo?.substring(0, 80)}{item.titulo?.length > 80 ? "..." : ""}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.orgao}</div>
                    </td>
                    <td style={{ textAlign: "center" }}>{item.uf || "—"}</td>
                    <td style={{ fontSize: "0.78rem" }}>{item.modalidade}</td>
                    <td style={{ fontSize: "0.78rem", whiteSpace: "nowrap" }}>
                      {item.dataPublicacao ? new Date(item.dataPublicacao).toLocaleDateString("pt-BR") : "—"}
                    </td>
                    <td style={{ fontSize: "0.78rem" }}>
                      {item.valor ? `R$ ${Number(item.valor).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}` : "—"}
                    </td>
                    <td>
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.75rem", color: "var(--accent)" }}>
                          🔗 Ver
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ABA: Fontes Cadastradas
// ═══════════════════════════════════════════════════════
function TabFontes({ produto, onAnalisar }) {
  const [fontes, setFontes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [analisando, setAnalisando] = useState(null);
  const [msg, setMsg] = useState(null);

  const carregar = useCallback(() => {
    setCarregando(true);
    api.get(`/fontes?produto=${produto}`)
      .then(r => setFontes(r.data.fontes || []))
      .catch(() => setFontes([]))
      .finally(() => setCarregando(false));
  }, [produto]);

  useEffect(() => { carregar(); }, [carregar]);

  async function handleAnalisar(id) {
    setAnalisando(id);
    setMsg(null);
    try {
      const r = await api.post(`/fontes/${id}/analisar`);
      const a = r.data.analise;
      setMsg({
        tipo: "success",
        texto: `Análise concluída: ${a.totalTopicos} tópicos, ${a.percentualCobertura}% cobertos, ${a.lacunas?.length || 0} lacunas.`,
      });
      carregar();
    } catch (err) {
      setMsg({ tipo: "error", texto: err.response?.data?.erro || "Erro ao analisar" });
    } finally {
      setAnalisando(null);
    }
  }

  async function handleRemover(id) {
    if (!confirm("Remover esta fonte?")) return;
    try {
      await api.delete(`/fontes/${id}`);
      carregar();
    } catch { /* silencioso */ }
  }

  if (carregando) return <p style={{ color: "var(--text-muted)" }}>Carregando...</p>;

  return (
    <div>
      {msg && (
        <div className={`alert alert-${msg.tipo}`} style={{ marginBottom: "1rem" }}>
          {msg.texto}
        </div>
      )}

      {fontes.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ color: "var(--text-muted)" }}>
            Nenhuma fonte cadastrada para <strong>{produto.toUpperCase()}</strong>.
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Use a aba "+ Adicionar Fonte" para inserir um manual, especificação ou requisito.
          </p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Cobertura</th>
              <th>Tópicos</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {fontes.map(f => (
              <tr key={f._id}>
                <td style={{ maxWidth: 280 }}>
                  <strong>{f.titulo}</strong>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {new Date(f.createdAt).toLocaleDateString("pt-BR")}
                  </div>
                </td>
                <td>
                  <span className="badge" style={{ background: "var(--surface2)", fontSize: "0.75rem" }}>
                    {TIPOS.find(t => t.value === f.tipo)?.label || f.tipo}
                  </span>
                </td>
                <td>
                  <span
                    className="badge"
                    style={{
                      background: f.status === "analisado" ? "var(--success)" : "var(--warning)",
                      color: "#fff",
                      fontSize: "0.75rem",
                    }}
                  >
                    {f.status === "analisado" ? "Analisado" : "Pendente"}
                  </span>
                </td>
                <td style={{ textAlign: "center" }}>
                  {f.analise ? (
                    <span style={{
                      fontWeight: 700,
                      color: f.analise.percentualCobertura >= 70 ? "var(--success)" :
                             f.analise.percentualCobertura >= 40 ? "var(--warning)" : "var(--error)",
                    }}>
                      {f.analise.percentualCobertura}%
                    </span>
                  ) : "—"}
                </td>
                <td style={{ textAlign: "center" }}>
                  {f.analise ? `${f.analise.totalTopicos}` : "—"}
                </td>
                <td>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <button
                      className="btn btn-sm"
                      onClick={() => handleAnalisar(f._id)}
                      disabled={analisando === f._id}
                      title="Rodar análise de cobertura"
                    >
                      {analisando === f._id ? "..." : "🔍 Analisar"}
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleRemover(f._id)}
                      title="Remover fonte"
                    >
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ABA: Adicionar Fonte
// ═══════════════════════════════════════════════════════
function TabAdicionar({ produto, onSucesso }) {
  const [form, setForm] = useState({
    titulo: "",
    tipo: "manual",
    conteudo: "",
    arquivo: "",
  });
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState(null);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setMsg(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.titulo.trim() || form.conteudo.trim().length < 20) {
      setMsg({ tipo: "error", texto: "Preencha o título e o conteúdo (mínimo 20 caracteres)." });
      return;
    }

    setSalvando(true);
    try {
      await api.post("/fontes", { ...form, produto });
      setMsg({ tipo: "success", texto: "Fonte adicionada com sucesso!" });
      setForm({ titulo: "", tipo: "manual", conteudo: "", arquivo: "" });
      setTimeout(onSucesso, 1200);
    } catch (err) {
      setMsg({ tipo: "error", texto: err.response?.data?.erro || "Erro ao salvar" });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 800 }}>
      <h3 style={{ marginBottom: "1.25rem", fontSize: "1rem" }}>
        Nova Fonte de Pesquisa — <strong>{produto.toUpperCase()}</strong>
      </h3>

      {msg && (
        <div className={`alert alert-${msg.tipo}`} style={{ marginBottom: "1rem" }}>
          {msg.texto}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label">Título da Fonte *</label>
          <input
            className="input"
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            placeholder="Ex: Manual AxHub v3.2 — Módulo de Infrações"
          />
        </div>

        <div className="form-group">
          <label className="label">Tipo de Documento</label>
          <select className="input" name="tipo" value={form.tipo} onChange={handleChange}>
            {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="label">Nome do Arquivo Original (opcional)</label>
          <input
            className="input"
            name="arquivo"
            value={form.arquivo}
            onChange={handleChange}
            placeholder="Ex: manual-axhub-v3.2.pdf"
          />
        </div>

        <div className="form-group">
          <label className="label">Conteúdo do Documento *</label>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
            Cole o conteúdo extraído do documento (texto, markdown, HTML limpo). O sistema irá
            extrair tópicos e compará-los com a documentação existente nos portais.
          </p>
          <textarea
            className="input"
            name="conteudo"
            value={form.conteudo}
            onChange={handleChange}
            rows={18}
            placeholder={`Cole aqui o conteúdo do documento...\n\nExemplos aceitos:\n- Texto copiado de um PDF\n- Markdown com headings (## Seção)\n- Lista de funcionalidades\n- Especificações técnicas\n- Notas de reunião sobre o sistema`}
            style={{ fontFamily: "monospace", fontSize: "0.85rem", resize: "vertical" }}
          />
          <div style={{ textAlign: "right", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            {form.conteudo.length} caracteres
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
          <button className="btn btn-primary" type="submit" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar Fonte"}
          </button>
          <button
            className="btn"
            type="button"
            onClick={() => setForm({ titulo: "", tipo: "manual", conteudo: "", arquivo: "" })}
          >
            Limpar
          </button>
        </div>
      </form>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ABA: Análise de Cobertura
// ═══════════════════════════════════════════════════════
function TabAnalise({ produto }) {
  const [fontes, setFontes] = useState([]);
  const [fonteSel, setFonteSel] = useState(null);
  const [detalhe, setDetalhe] = useState(null);
  const [mapa, setMapa] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [vista, setVista] = useState("fonte"); // "fonte" | "mapa"

  useEffect(() => {
    setCarregando(true);
    Promise.all([
      api.get(`/fontes?produto=${produto}`),
      api.get(`/fontes/mapa/${produto}`),
    ]).then(([rf, rm]) => {
      const analisadas = (rf.data.fontes || []).filter(f => f.status === "analisado");
      setFontes(analisadas);
      setMapa(rm.data);
      if (analisadas.length > 0) setFonteSel(analisadas[0]._id);
    }).catch(() => {}).finally(() => setCarregando(false));
  }, [produto]);

  useEffect(() => {
    if (!fonteSel) return;
    api.get(`/fontes/${fonteSel}`)
      .then(r => setDetalhe(r.data))
      .catch(() => setDetalhe(null));
  }, [fonteSel]);

  if (carregando) return <p style={{ color: "var(--text-muted)" }}>Carregando...</p>;

  return (
    <div>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button className={`tab-btn ${vista === "fonte" ? "active" : ""}`} onClick={() => setVista("fonte")}>
          Por Fonte
        </button>
        <button className={`tab-btn ${vista === "mapa" ? "active" : ""}`} onClick={() => setVista("mapa")}>
          Mapa da Documentação
        </button>
      </div>

      {vista === "fonte" && (
        <>
          {fontes.length === 0 ? (
            <div className="alert alert-error">
              Nenhuma fonte analisada para {produto.toUpperCase()}. Vá em "Fontes Cadastradas" e clique em "Analisar".
            </div>
          ) : (
            <>
              <div style={{ marginBottom: "1rem" }}>
                <label className="label">Selecionar Fonte</label>
                <select
                  className="input"
                  style={{ maxWidth: 500 }}
                  value={fonteSel || ""}
                  onChange={e => setFonteSel(e.target.value)}
                >
                  {fontes.map(f => (
                    <option key={f._id} value={f._id}>
                      {f.titulo} — {f.analise?.percentualCobertura ?? "?"}% coberto
                    </option>
                  ))}
                </select>
              </div>

              {detalhe?.analise && <PainelAnalise analise={detalhe.analise} titulo={detalhe.titulo} />}
            </>
          )}
        </>
      )}

      {vista === "mapa" && mapa && <PainelMapa mapa={mapa} />}
    </div>
  );
}

function PainelAnalise({ analise, titulo }) {
  const [filtro, setFiltro] = useState("todos"); // todos | cobertos | lacunas

  const itens = (analise.cobertura || []).filter(c => {
    if (filtro === "cobertos") return c.coberto;
    if (filtro === "lacunas")  return !c.coberto;
    return true;
  });

  const corCobertura = analise.percentualCobertura >= 70 ? "var(--success)" :
                       analise.percentualCobertura >= 40 ? "var(--warning)" : "var(--error)";

  return (
    <div>
      {/* Cards resumo */}
      <div className="cards-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="card stat-card">
          <div className="stat-value" style={{ color: corCobertura }}>
            {analise.percentualCobertura}%
          </div>
          <div className="stat-label">Cobertura Geral</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{analise.totalTopicos}</div>
          <div className="stat-label">Tópicos Identificados</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value" style={{ color: "var(--success)" }}>{analise.totalCobertos}</div>
          <div className="stat-label">Cobertos</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value" style={{ color: "var(--error)" }}>{analise.lacunas?.length || 0}</div>
          <div className="stat-label">Lacunas</div>
        </div>
      </div>

      {/* Barra de progresso */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ height: 8, background: "var(--surface2)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${analise.percentualCobertura}%`,
            background: corCobertura,
            borderRadius: 4,
            transition: "width 0.5s ease",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>
          <span>0%</span>
          <span style={{ fontWeight: 600 }}>{titulo}</span>
          <span>100%</span>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        {[
          { id: "todos",    label: "Todos" },
          { id: "cobertos", label: "✅ Cobertos" },
          { id: "lacunas",  label: "❌ Lacunas" },
        ].map(f => (
          <button
            key={f.id}
            className={`tab-btn ${filtro === f.id ? "active" : ""}`}
            onClick={() => setFiltro(f.id)}
            style={{ fontSize: "0.8rem", padding: "0.3rem 0.75rem" }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tabela de cobertura */}
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: 36 }}></th>
            <th>Tópico Identificado</th>
            <th>Documentos que cobrem</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((c, i) => (
            <tr key={i}>
              <td style={{ textAlign: "center", fontSize: "1rem" }}>
                {c.coberto ? "✅" : "❌"}
              </td>
              <td>{c.topico}</td>
              <td style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {c.docs?.length > 0
                  ? c.docs.map(d => <span key={d} style={{ marginRight: 6 }}>{d}</span>)
                  : <em>Sem cobertura</em>}
              </td>
            </tr>
          ))}
          {itens.length === 0 && (
            <tr><td colSpan={3} style={{ textAlign: "center", color: "var(--text-muted)" }}>Nenhum item neste filtro.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function PainelMapa({ mapa }) {
  return (
    <div>
      <div className="cards-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="card stat-card">
          <div className="stat-value">{mapa.totalDocs}</div>
          <div className="stat-label">Documentos no Portal</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{mapa.totalSecoes}</div>
          <div className="stat-label">Seções Cobertas</div>
        </div>
      </div>

      {Object.entries(mapa.secoes || {}).map(([secao, docs]) => (
        <div key={secao} className="card" style={{ marginBottom: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <strong style={{ fontSize: "0.9rem" }}>{secao}</strong>
            <span className="badge" style={{ background: "var(--accent)", color: "#fff" }}>
              {docs.length} doc{docs.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {docs.map(d => (
              <span key={d.caminho} title={d.caminho} style={{
                background: "var(--surface2)",
                padding: "0.2rem 0.6rem",
                borderRadius: 4,
                fontSize: "0.75rem",
                color: "var(--text)",
              }}>
                {d.titulo}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ABA: Sugestões de Melhoria
// ═══════════════════════════════════════════════════════
function TabSugestoes({ produto }) {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [filtroSecao, setFiltroSecao] = useState("todas");

  useEffect(() => {
    setCarregando(true);
    api.get(`/fontes/sugestoes/${produto}`)
      .then(r => setDados(r.data))
      .catch(() => setDados(null))
      .finally(() => setCarregando(false));
  }, [produto]);

  if (carregando) return <p style={{ color: "var(--text-muted)" }}>Carregando...</p>;

  if (!dados || dados.totalFontes === 0) {
    return (
      <div className="alert alert-error">
        Nenhuma fonte analisada para {produto.toUpperCase()}. Adicione fontes e execute a análise primeiro.
      </div>
    );
  }

  const secoes = [...new Set((dados.sugestoes || []).map(s => s.secao))].sort();
  const sugestoesFiltradas = filtroSecao === "todas"
    ? dados.sugestoes
    : dados.sugestoes.filter(s => s.secao === filtroSecao);

  const corGeral = dados.percentualGeral >= 70 ? "var(--success)" :
                   dados.percentualGeral >= 40 ? "var(--warning)" : "var(--error)";

  return (
    <div>
      {/* Resumo */}
      <div className="cards-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="card stat-card">
          <div className="stat-value" style={{ color: corGeral }}>{dados.percentualGeral}%</div>
          <div className="stat-label">Cobertura Consolidada</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{dados.totalFontes}</div>
          <div className="stat-label">Fontes Analisadas</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{dados.totalTopicos}</div>
          <div className="stat-label">Tópicos no Total</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value" style={{ color: "var(--error)" }}>{dados.totalLacunas}</div>
          <div className="stat-label">Lacunas Detectadas</div>
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <div style={{ height: 10, background: "var(--surface2)", borderRadius: 6, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${dados.percentualGeral}%`,
            background: corGeral,
            borderRadius: 6,
            transition: "width 0.5s",
          }} />
        </div>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>
          {dados.totalCobertos} de {dados.totalTopicos} tópicos cobertos pela documentação atual
        </p>
      </div>

      {/* Filtro por seção */}
      {secoes.length > 0 && (
        <div style={{ marginBottom: "1.25rem" }}>
          <label className="label">Filtrar por Seção</label>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              className={`tab-btn ${filtroSecao === "todas" ? "active" : ""}`}
              style={{ fontSize: "0.78rem" }}
              onClick={() => setFiltroSecao("todas")}
            >
              Todas ({dados.sugestoes?.length || 0})
            </button>
            {secoes.map(s => (
              <button
                key={s}
                className={`tab-btn ${filtroSecao === s ? "active" : ""}`}
                style={{ fontSize: "0.78rem" }}
                onClick={() => setFiltroSecao(s)}
              >
                {s} ({(dados.sugestoes || []).filter(sg => sg.secao === s).length})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lista de sugestões */}
      {sugestoesFiltradas?.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>Nenhuma sugestão para esta seção.</p>
      ) : (
        <div>
          {sugestoesFiltradas.map((s, i) => (
            <div key={i} className="card" style={{
              marginBottom: "0.6rem",
              borderLeft: "3px solid var(--accent)",
              padding: "0.8rem 1rem",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                    💡 {s.titulo}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    {s.motivo}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", alignItems: "flex-end", minWidth: 140 }}>
                  <span className="badge" style={{ background: "var(--accent)", color: "#fff", fontSize: "0.72rem" }}>
                    {s.acao?.toUpperCase()}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "right" }}>
                    {s.produto?.toUpperCase()} / {s.secao}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
