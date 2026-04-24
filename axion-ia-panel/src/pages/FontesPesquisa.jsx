import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  const [operacoes, setOperacoes] = useState([]);
  const [operacaoAtiva, setOperacaoAtiva] = useState(null); // id da operação selecionada
  const [busca, setBusca] = useState("");
  const [modoLivre, setModoLivre] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [termoBuscado, setTermoBuscado] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [coletando, setColetando] = useState(false);
  const [status, setStatus] = useState(null);
  const [selecionados, setSelecionados] = useState([]);
  const [importando, setImportando] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get("/coletor/status"),
      api.get(`/coletor/operacoes?produto=${produto}`),
    ]).then(([rs, ro]) => {
      setStatus(rs.data);
      setOperacoes(ro.data.operacoes || []);
    }).catch(() => {});
  }, [produto]);

  async function buscarPorOperacao(op) {
    setOperacaoAtiva(op.id);
    setModoLivre(false);
    setBusca(op.palavras[0]);
    setMsg(null);
    setSelecionados([]);
    setCarregando(true);
    try {
      const r = await api.get(`/coletor/pncp?produto=${produto}&q=${encodeURIComponent(op.palavras[0])}&tamanhoPagina=20`);
      setResultado(r.data);
      setTermoBuscado(op.palavras[0]);
    } catch {
      setMsg({ tipo: "error", texto: "Erro ao buscar no PNCP. Tente novamente." });
    } finally {
      setCarregando(false);
    }
  }

  async function handleBuscarLivre() {
    if (!busca.trim()) return;
    setOperacaoAtiva(null);
    setCarregando(true);
    setMsg(null);
    setSelecionados([]);
    try {
      const r = await api.get(`/coletor/pncp?produto=${produto}&q=${encodeURIComponent(busca)}&tamanhoPagina=20`);
      setResultado(r.data);
      setTermoBuscado(busca);
    } catch {
      setMsg({ tipo: "error", texto: "Erro ao buscar no PNCP. Tente novamente." });
    } finally {
      setCarregando(false);
    }
  }

  async function handleColetar() {
    if (!confirm(`Coletar TODOS os editais relacionados ao ${produto.toUpperCase()} do PNCP?\nIsso pode levar alguns segundos.`)) return;
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

  const operacaoSelecionada = operacoes.find(o => o.id === operacaoAtiva);

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
              <span><strong>Última:</strong> {new Date(status.ultimaColeta).toLocaleString("pt-BR")}</span>
            )}
            <span><strong>Total novas:</strong> {status.totalNovos || 0}</span>
            <button
              className="btn"
              onClick={handleColetar}
              disabled={coletando}
              style={{ marginLeft: "auto", fontSize: "0.78rem" }}
              title="Coleta com todas as palavras-chave das operações do sistema"
            >
              {coletando ? "⏳ Coletando..." : "🤖 Coleta Completa"}
            </button>
          </div>
        </div>
      )}

      {msg && (
        <div className={`alert alert-${msg.tipo}`} style={{ marginBottom: "1rem" }}>
          {msg.texto}
        </div>
      )}

      {/* Seção 1: Operações do sistema */}
      {produto === "axhub" && operacoes.length > 0 && (
        <div className="card" style={{ marginBottom: "1rem" }}>
          <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.75rem" }}>
            🏢 Buscar por Operação do {produto.toUpperCase()}
            <span style={{ fontWeight: 400, fontSize: "0.78rem", color: "var(--text-muted)", marginLeft: 8 }}>
              — clique para buscar editais relacionados a cada operação que o sistema gerencia
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.5rem" }}>
            {operacoes.map(op => (
              <button
                key={op.id}
                onClick={() => buscarPorOperacao(op)}
                disabled={carregando}
                style={{
                  background: operacaoAtiva === op.id ? "var(--accent)" : "var(--surface2)",
                  color: operacaoAtiva === op.id ? "#fff" : "var(--text)",
                  border: operacaoAtiva === op.id ? "2px solid var(--accent)" : "2px solid transparent",
                  borderRadius: 8,
                  padding: "0.6rem 0.75rem",
                  textAlign: "left",
                  cursor: carregando ? "not-allowed" : "pointer",
                  fontSize: "0.82rem",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontSize: "1.1rem", marginBottom: 2 }}>{op.icone} <strong>{op.nome}</strong></div>
                <div style={{ fontSize: "0.72rem", opacity: 0.75 }}>{op.descricao}</div>
              </button>
            ))}
          </div>
          {operacaoSelecionada && (
            <div style={{ marginTop: "0.75rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Buscando: <strong>{operacaoSelecionada.palavras.join(" · ")}</strong>
            </div>
          )}
        </div>
      )}

      {/* Seção 2: Busca livre */}
      <div className="card" style={{ marginBottom: "1rem" }}>
        <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.5rem" }}>
          🔍 Busca Livre por Palavra-chave
          <span style={{ fontWeight: 400, fontSize: "0.78rem", color: "var(--text-muted)", marginLeft: 8 }}>
            — pesquise qualquer termo independente das operações do sistema
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder="Ex: sistema semafórico, gestão frota, telemetria veicular..."
            value={modoLivre ? busca : ""}
            onChange={e => { setBusca(e.target.value); setModoLivre(true); setOperacaoAtiva(null); }}
            onFocus={() => setModoLivre(true)}
            onKeyDown={e => e.key === "Enter" && handleBuscarLivre()}
          />
          <button
            className="btn btn-primary"
            onClick={handleBuscarLivre}
            disabled={carregando || !(modoLivre ? busca.trim() : false)}
          >
            {carregando && modoLivre ? "Buscando..." : "Buscar"}
          </button>
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
          💡 Use isso para descobrir oportunidades de mercado e avaliar se o sistema pode ser adaptado para novas demandas.
        </div>
      </div>

      {/* Seção 3: Resultados */}
      {carregando && (
        <div className="card" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
          ⏳ Consultando o PNCP...
        </div>
      )}

      {!carregando && resultado && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {resultado.total} resultado(s) para <strong>"{termoBuscado}"</strong>
              {operacaoSelecionada && (
                <span style={{
                  marginLeft: 8, background: "var(--accent)", color: "#fff",
                  padding: "0.1rem 0.5rem", borderRadius: 10, fontSize: "0.72rem",
                }}>
                  {operacaoSelecionada.icone} {operacaoSelecionada.nome}
                </span>
              )}
            </span>
            {selecionados.length > 0 && (
              <button className="btn btn-primary" onClick={handleImportar} disabled={importando}>
                {importando ? "Importando..." : `📥 Importar ${selecionados.length} selecionado(s)`}
              </button>
            )}
          </div>

          {resultado.items.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "1.5rem", color: "var(--text-muted)" }}>
              Nenhum edital encontrado para <strong>"{termoBuscado}"</strong> no PNCP.
              {operacaoSelecionada && (
                <div style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}>
                  Tente buscar por: {operacaoSelecionada.palavras.slice(1, 4).map(p => (
                    <button key={p} className="btn" style={{ margin: "0.2rem", fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}
                      onClick={() => { setBusca(p); setModoLivre(false); buscarPorOperacao({ ...operacaoSelecionada, palavras: [p, ...operacaoSelecionada.palavras] }); }}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 36 }}></th>
                  <th>Título / Órgão</th>
                  <th>Operação</th>
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
                    <td style={{ maxWidth: 280 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: 2 }}>
                        {item.titulo?.substring(0, 75)}{item.titulo?.length > 75 ? "..." : ""}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.orgao}</div>
                    </td>
                    <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                      {item.operacao ? (
                        <span title={item.operacao.nome} style={{
                          background: "var(--accent)", color: "#fff",
                          padding: "0.15rem 0.45rem", borderRadius: 8, fontSize: "0.72rem",
                        }}>
                          {item.operacao.icone} {item.operacao.nome}
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>—</span>
                      )}
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
  const navigate = useNavigate();

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

  async function handleConformidade(fonte) {
    try {
      // Busca conteúdo completo (a listagem omite o campo conteudo)
      const r = await api.get(`/fontes/${fonte._id}`);
      const completo = r.data;
      sessionStorage.setItem("conformidade_preload", JSON.stringify({
        titulo: completo.titulo,
        conteudo: completo.conteudo,
        produto,
      }));
      navigate("/conformidade");
    } catch {
      setMsg({ tipo: "error", texto: "Erro ao carregar conteúdo da fonte para conformidade." });
    }
  }

  async function handleRemover(id) {
    if (!confirm("Remover esta fonte?")) return;
    try {
      await api.delete(`/fontes/${id}`);
      carregar();
    } catch (err) {
      setMsg({ tipo: "error", texto: err.response?.data?.erro || "Erro ao remover fonte." });
    }
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
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                    <button
                      className="btn btn-sm"
                      onClick={() => handleAnalisar(f._id)}
                      disabled={analisando === f._id}
                      title="Rodar análise de cobertura"
                    >
                      {analisando === f._id ? "..." : "🔍 Analisar"}
                    </button>
                    {f.status === "analisado" && (
                      <button
                        className="btn btn-sm"
                        onClick={() => handleConformidade(f)}
                        title="Verificar conformidade deste documento com a documentação do produto"
                        style={{ background: "var(--accent)", color: "#fff", border: "none" }}
                      >
                        📜 Conformidade
                      </button>
                    )}
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
  const [extraindo, setExtraindo] = useState(false);
  const [infoExtracao, setInfoExtracao] = useState(null); // { nome, palavras, caracteres }
  const [dragOver, setDragOver] = useState(false);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setMsg(null);
  }

  async function processarArquivo(file) {
    if (!file) return;
    setExtraindo(true);
    setInfoExtracao(null);
    setMsg(null);

    const data = new FormData();
    data.append("arquivo", file);

    try {
      const r = await api.post("/doc/upload-contexto", data);
      const { texto, nomeArquivo, palavrasExtraidas, caracteres } = r.data;
      setForm(f => ({
        ...f,
        conteudo: texto,
        arquivo: nomeArquivo,
        titulo: f.titulo || nomeArquivo.replace(/\.[^.]+$/, ""),
      }));
      setInfoExtracao({ nome: nomeArquivo, palavras: palavrasExtraidas, caracteres });
    } catch (err) {
      setMsg({ tipo: "error", texto: err.response?.data?.erro || "Erro ao extrair conteúdo do arquivo." });
    } finally {
      setExtraindo(false);
    }
  }

  function handleFileInput(e) {
    processarArquivo(e.target.files[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    processarArquivo(e.dataTransfer.files[0]);
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
      setInfoExtracao(null);
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

        {/* ── Upload de arquivo ── */}
        <div className="form-group">
          <label className="label">Importar Arquivo ou Imagem</label>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragOver ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 10,
              padding: "1.25rem 1rem",
              textAlign: "center",
              background: dragOver ? "var(--surface2)" : "var(--surface)",
              cursor: "pointer",
              transition: "all 0.15s",
              position: "relative",
            }}
            onClick={() => document.getElementById("fonte-file-input").click()}
          >
            <input
              id="fonte-file-input"
              type="file"
              style={{ display: "none" }}
              accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.txt,.md,.png,.jpg,.jpeg,.gif,.webp,.bmp,.svg"
              onChange={handleFileInput}
            />
            {extraindo ? (
              <span style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>⏳ Extraindo conteúdo...</span>
            ) : infoExtracao ? (
              <span style={{ color: "var(--success)", fontSize: "0.88rem" }}>
                ✅ <strong>{infoExtracao.nome}</strong> — {infoExtracao.palavras.toLocaleString("pt-BR")} palavras extraídas
              </span>
            ) : (
              <span style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
                📎 Arraste um arquivo aqui ou <span style={{ color: "var(--accent)", textDecoration: "underline" }}>clique para selecionar</span>
                <br />
                <small style={{ fontSize: "0.75rem" }}>PDF, DOCX, XLSX, TXT, MD, PNG, JPG e outros — máx. 10 MB</small>
              </span>
            )}
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.35rem" }}>
            O texto será extraído automaticamente e preencherá o campo abaixo.
          </p>
        </div>

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
          <label className="label">Nome do Arquivo Original</label>
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
            Cole ou edite o conteúdo. O sistema irá extrair tópicos e compará-los com a documentação existente nos portais.
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
          <button className="btn btn-primary" type="submit" disabled={salvando || extraindo}>
            {salvando ? "Salvando..." : "Salvar Fonte"}
          </button>
          <button
            className="btn"
            type="button"
            onClick={() => { setForm({ titulo: "", tipo: "manual", conteudo: "", arquivo: "" }); setInfoExtracao(null); }}
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
  const [filtro, setFiltro] = useState("lacunas");
  const [expandido, setExpandido] = useState(null);

  const lacunas  = (analise.cobertura || []).filter(c => !c.coberto);
  const cobertos = (analise.cobertura || []).filter(c =>  c.coberto);
  const itens    = filtro === "cobertos" ? cobertos : filtro === "lacunas" ? lacunas : (analise.cobertura || []);

  const corCobertura = analise.percentualCobertura >= 70 ? "var(--success)"
    : analise.percentualCobertura >= 40 ? "var(--warning)" : "var(--error)";

  function getVeredicto() {
    const p = analise.percentualCobertura;
    if (p >= 80) return { cor: "var(--success)", texto: "✅ A documentação cobre bem os requisitos deste documento." };
    if (p >= 50) return { cor: "var(--warning)", texto: "⚠️ Cobertura parcial — parte dos requisitos não está documentada. Ações necessárias antes de concorrer." };
    return { cor: "var(--error)", texto: "❌ Cobertura baixa — a maioria dos requisitos não está coberta. Ações urgentes para participar de licitações." };
  }
  const veredicto = getVeredicto();

  function estimarEsforco(topico) {
    const t = (topico || "").toLowerCase();
    if (/integra|api|banco|importa|exporta|automatiz/.test(t))             return { label: "Alto",  cor: "#e74c3c" };
    if (/cláusula|contrat|legal|jurídic|garantia|prazo|vigência|dotação/.test(t)) return { label: "Médio", cor: "#f39c12" };
    return { label: "Baixo", cor: "#27ae60" };
  }

  function getAcao(item) {
    return (analise.sugestoes || []).find(sg =>
      sg.titulo && item.topico &&
      sg.titulo.toLowerCase().includes(item.topico.toLowerCase().substring(0, 20))
    );
  }

  return (
    <div>
      {/* Interpretação geral */}
      <div style={{
        background: "var(--surface2)", borderLeft: `4px solid ${veredicto.cor}`,
        borderRadius: 8, padding: "0.9rem 1.1rem", marginBottom: "1.25rem",
        border: `1px solid ${veredicto.cor}30`,
      }}>
        <div style={{ fontWeight: 700, color: veredicto.cor, marginBottom: 4 }}>{veredicto.texto}</div>
        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
          Documento: <strong>{titulo}</strong> — {analise.totalTopicos} requisitos identificados.{" "}
          <strong style={{ color: "var(--success)" }}>{analise.totalCobertos} cobertos</strong> e{" "}
          <strong style={{ color: "var(--error)" }}>{lacunas.length} sem cobertura</strong> na documentação do sistema.
        </div>
      </div>

      {/* Cards */}
      <div className="cards-grid" style={{ marginBottom: "1.25rem" }}>
        {[
          { label: "Cobertura Geral",      val: `${analise.percentualCobertura}%`, cor: corCobertura },
          { label: "✅ Cobertos",           val: analise.totalCobertos,             cor: "var(--success)" },
          { label: "❌ Sem Documentação",   val: lacunas.length,                   cor: "var(--error)" },
          { label: "Total de Requisitos",   val: analise.totalTopicos,             cor: undefined },
        ].map(c => (
          <div key={c.label} className="card stat-card">
            <div className="stat-value" style={c.cor ? { color: c.cor } : {}}>{c.val}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Barra */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: 4 }}>
          <span style={{ color: "var(--error)" }}>❌ {lacunas.length} sem cobertura</span>
          <span style={{ color: "var(--success)" }}>✅ {analise.totalCobertos} cobertos</span>
        </div>
        <div style={{ height: 10, background: "var(--surface2)", borderRadius: 6, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${analise.percentualCobertura}%`, background: corCobertura, borderRadius: 6, transition: "width 0.5s ease" }} />
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        {[
          { id: "lacunas",  label: `❌ Faltam (${lacunas.length})` },
          { id: "cobertos", label: `✅ Cobertos (${cobertos.length})` },
          { id: "todos",    label: `Todos (${(analise.cobertura || []).length})` },
        ].map(f => (
          <button key={f.id} className={`tab-btn ${filtro === f.id ? "active" : ""}`}
            onClick={() => setFiltro(f.id)} style={{ fontSize: "0.8rem" }}>
            {f.label}
          </button>
        ))}
        {filtro === "lacunas" && lacunas.length > 0 && (
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginLeft: "auto" }}>
            💡 Clique em um item para ver o que precisa ser feito
          </span>
        )}
      </div>

      {/* Lista */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {itens.map((c, i) => {
          const acao    = getAcao(c);
          const esforco = estimarEsforco(c.topico);
          const aberto  = expandido === i;

          if (c.coberto) {
            return (
              <div key={i} style={{
                padding: "0.6rem 1rem", borderRadius: 6, background: "var(--surface)",
                border: "1px solid var(--border)", borderLeft: "3px solid var(--success)",
                display: "flex", gap: "0.75rem", alignItems: "center",
              }}>
                <span style={{ color: "var(--success)", fontSize: "1.1rem" }}>✅</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: "0.88rem", fontWeight: 500 }}>{c.topico}</span>
                  {c.docs?.length > 0 && (
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>
                      📄 {c.docs.join(" · ")}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div key={i} style={{ borderRadius: 8, border: "1px solid var(--border)", borderLeft: "3px solid var(--error)", background: "var(--surface)", overflow: "hidden" }}>
              <div style={{ padding: "0.75rem 1rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.75rem" }}
                onClick={() => setExpandido(aberto ? null : i)}>
                <span style={{ color: "var(--error)", fontSize: "1rem", flexShrink: 0 }}>❌</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>{c.topico}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 1 }}>
                    Sem cobertura — clique para ver o que precisa ser feito
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: "0.68rem", padding: "2px 7px", borderRadius: 10, background: esforco.cor + "22", color: esforco.cor, fontWeight: 700 }}>
                    Esforço {esforco.label}
                  </span>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{aberto ? "▲" : "▼"}</span>
                </div>
              </div>

              {aberto && (
                <div style={{ padding: "0 1rem 1rem", borderTop: "1px solid var(--border)" }}>
                  <div style={{ marginTop: "0.75rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                    <div style={{ background: "var(--surface2)", borderRadius: 6, padding: "0.75rem" }}>
                      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>🔍 O QUE O DOCUMENTO EXIGE</div>
                      <div style={{ fontSize: "0.82rem" }}>{c.topico}</div>
                    </div>
                    <div style={{ background: "var(--surface2)", borderRadius: 6, padding: "0.75rem" }}>
                      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>📁 ONDE CRIAR</div>
                      <code style={{ fontSize: "0.78rem" }}>
                        docs/{acao?.secao || c.secao || "primeiros-passos"}/
                      </code>
                    </div>
                    <div style={{ background: "var(--surface2)", borderRadius: 6, padding: "0.75rem", gridColumn: "1 / -1" }}>
                      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>✏️ O QUE PRECISA SER FEITO</div>
                      <div style={{ fontSize: "0.82rem", lineHeight: 1.55 }}>
                        {acao?.motivo ||
                          `Criar documentação descrevendo como o sistema atende o requisito "${c.topico}". ` +
                          `Inclua: descrição funcional, fluxo de uso, campos e regras de negócio relacionados.`}
                      </div>
                    </div>
                    <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 6, padding: "0.75rem", gridColumn: "1 / -1" }}>
                      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#856404", marginBottom: 4 }}>🏆 IMPACTO NA LICITAÇÃO</div>
                      <div style={{ fontSize: "0.82rem", color: "#6b4c00", lineHeight: 1.55 }}>
                        Sem esta documentação o sistema pode ser desclassificado por não comprovar atendimento ao requisito.
                        Após documentar, este item passará de ❌ para ✅ na análise de conformidade.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {itens.length === 0 && (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>Nenhum item neste filtro.</div>
        )}
      </div>
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
  const [expandido, setExpandido] = useState(null);

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

  const corGeral = dados.percentualGeral >= 70 ? "var(--success)"
    : dados.percentualGeral >= 40 ? "var(--warning)" : "var(--error)";

  function getImpacto(titulo) {
    const t = (titulo || "").toLowerCase();
    if (/objeto|escopo|especific|requisi|função|funcional|fiscal/.test(t)) return { label: "Alto",  cor: "#e74c3c" };
    if (/prazo|valor|garantia|contrat|legal|dotação/.test(t))              return { label: "Médio", cor: "#f39c12" };
    return { label: "Baixo", cor: "#27ae60" };
  }

  function getEsforco(secao) {
    if (/glossario|referencia/.test(secao)) return "1–2h";
    if (/primeiros|intro/.test(secao))      return "2–4h";
    return "4–8h";
  }

  return (
    <div>
      {/* Header interpretativo */}
      <div style={{
        background: "var(--surface2)", borderRadius: 10, padding: "1rem 1.25rem",
        marginBottom: "1.5rem", borderLeft: `4px solid ${corGeral}`,
        border: `1px solid ${corGeral}30`,
      }}>
        <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 6, color: corGeral }}>
          {dados.percentualGeral >= 70
            ? "✅ Sistema bem posicionado para licitações"
            : dados.percentualGeral >= 40
              ? "⚠️ Melhorias necessárias para participar de licitações"
              : "❌ Lacunas significativas — ações urgentes necessárias"}
        </div>
        <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
          O {produto.toUpperCase()} cobre atualmente <strong>{dados.percentualGeral}%</strong> dos requisitos identificados
          nas {dados.totalFontes} fonte(s) analisada(s). Existem{" "}
          <strong>{dados.totalLacunas} lacunas</strong> que, se corrigidas, fortalecem a elegibilidade do sistema
          em processos licitatórios e de aquisição pública.
        </div>
      </div>

      {/* Métricas */}
      <div className="cards-grid" style={{ marginBottom: "1.5rem" }}>
        {[
          { label: "Cobertura Atual",     val: `${dados.percentualGeral}%`, cor: corGeral },
          { label: "Fontes Analisadas",   val: dados.totalFontes,           cor: undefined },
          { label: "Tópicos Totais",      val: dados.totalTopicos,          cor: undefined },
          { label: "Ações Necessárias",   val: dados.totalLacunas,          cor: "var(--error)" },
        ].map(c => (
          <div key={c.label} className="card stat-card">
            <div className="stat-value" style={c.cor ? { color: c.cor } : {}}>{c.val}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: 4 }}>
          <span>Cobertura atual</span>
          <strong>{dados.percentualGeral}%</strong>
        </div>
        <div style={{ height: 10, background: "var(--surface2)", borderRadius: 6, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${dados.percentualGeral}%`, background: corGeral, borderRadius: 6, transition: "width 0.5s" }} />
        </div>
        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 4 }}>
          {dados.totalCobertos} de {dados.totalTopicos} tópicos cobertos — execute as {dados.totalLacunas} ações abaixo para melhorar
        </div>
      </div>

      {/* Filtro por módulo */}
      {secoes.length > 0 && (
        <div style={{ marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>Filtrar por módulo do sistema:</div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button className={`tab-btn ${filtroSecao === "todas" ? "active" : ""}`}
              style={{ fontSize: "0.78rem" }} onClick={() => setFiltroSecao("todas")}>
              Todas ({dados.sugestoes?.length || 0})
            </button>
            {secoes.map(s => (
              <button key={s} className={`tab-btn ${filtroSecao === s ? "active" : ""}`}
                style={{ fontSize: "0.78rem" }} onClick={() => setFiltroSecao(s)}>
                {s} ({(dados.sugestoes || []).filter(sg => sg.secao === s).length})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Título do plano */}
      <div style={{ marginBottom: "0.75rem" }}>
        <h4 style={{ margin: "0 0 4px", fontSize: "0.9rem" }}>
          📋 Plano de Ação — {sugestoesFiltradas?.length || 0} passo(s)
        </h4>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>
          Cada item abaixo corresponde a uma lacuna na documentação. Clique para ver o que precisa ser criado/modificado,
          onde, e qual o impacto na participação em licitações.
        </p>
      </div>

      {/* Lista de ações passo a passo */}
      {!sugestoesFiltradas?.length ? (
        <p style={{ color: "var(--text-muted)" }}>Nenhuma ação para esta seção.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {sugestoesFiltradas.map((s, i) => {
            const impacto = getImpacto(s.titulo);
            const esforco = getEsforco(s.secao);
            const aberto  = expandido === i;

            return (
              <div key={i} style={{ borderRadius: 8, border: "1px solid var(--border)", borderLeft: `3px solid ${impacto.cor}`, background: "var(--surface)", overflow: "hidden" }}>
                {/* Cabeçalho */}
                <div style={{ padding: "0.9rem 1rem", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: "0.75rem" }}
                  onClick={() => setExpandido(aberto ? null : i)}>
                  <div style={{
                    minWidth: 28, height: 28, borderRadius: "50%", background: "var(--accent)", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700, flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 3 }}>{s.titulo}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Módulo: <strong>{s.secao}</strong> · Ação: <strong>{s.acao}</strong>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end", flexShrink: 0 }}>
                    <span style={{ fontSize: "0.68rem", padding: "2px 8px", borderRadius: 10, fontWeight: 700, background: impacto.cor + "22", color: impacto.cor }}>
                      Impacto {impacto.label}
                    </span>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>⏱ {esforco}</span>
                  </div>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginLeft: 4, flexShrink: 0 }}>{aberto ? "▲" : "▼"}</span>
                </div>

                {/* Detalhe */}
                {aberto && (
                  <div style={{ borderTop: "1px solid var(--border)", padding: "0.9rem 1rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>

                      <div style={{ background: "var(--surface2)", borderRadius: 6, padding: "0.75rem" }}>
                        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: 5, textTransform: "uppercase" }}>🔍 Por que esta ação é necessária</div>
                        <div style={{ fontSize: "0.83rem", lineHeight: 1.55 }}>
                          {s.motivo || `O requisito "${s.titulo}" foi identificado na fonte de pesquisa mas não possui documentação correspondente no portal do ${produto.toUpperCase()}.`}
                        </div>
                      </div>

                      <div style={{ background: "var(--surface2)", borderRadius: 6, padding: "0.75rem" }}>
                        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: 5, textTransform: "uppercase" }}>✏️ O que deve ser criado / modificado</div>
                        <div style={{ fontSize: "0.83rem", lineHeight: 1.55 }}>
                          <strong>Ação:</strong> {s.acao === "criar" ? "Criar novo documento" : "Revisar/expandir documento existente"} no módulo <strong>{s.secao}</strong>.<br />
                          <strong>Estrutura mínima do documento:</strong>
                          <ul style={{ margin: "6px 0 0 16px", padding: 0, lineHeight: 1.8, fontSize: "0.8rem" }}>
                            <li>Descrição da funcionalidade e seu objetivo</li>
                            <li>Como acessar no sistema (menu → tela)</li>
                            <li>Campos, opções e regras de negócio</li>
                            <li>Passo a passo de operação</li>
                            <li>Integração com outros módulos</li>
                          </ul>
                        </div>
                      </div>

                      <div style={{ background: "var(--surface2)", borderRadius: 6, padding: "0.75rem" }}>
                        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: 5, textTransform: "uppercase" }}>📁 Localização no projeto</div>
                        <code style={{ fontSize: "0.8rem", background: "var(--surface)", padding: "3px 8px", borderRadius: 4 }}>
                          {produto}/docs-portal/docs/{s.secao}/
                        </code>
                      </div>

                      <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 6, padding: "0.75rem" }}>
                        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#856404", marginBottom: 5, textTransform: "uppercase" }}>🏆 Ganho para participação em licitações</div>
                        <div style={{ fontSize: "0.83rem", color: "#6b4c00", lineHeight: 1.55 }}>
                          Ao documentar este requisito, o sistema passa a <strong>comprovar formalmente</strong> que atende "{s.titulo}".
                          Isso aumenta a pontuação técnica na análise de conformidade e reduz o risco de desclassificação.
                          <strong> Impacto estimado: {impacto.label}</strong> na elegibilidade do sistema para este tipo de licitação.
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Rodapé */}
      {sugestoesFiltradas?.length > 0 && (
        <div style={{ marginTop: "1.5rem", background: "var(--surface2)", borderRadius: 8, padding: "0.9rem 1.1rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <strong>Resumo:</strong> {sugestoesFiltradas.length} ação(ões) para {filtroSecao === "todas" ? "todos os módulos" : `o módulo "${filtroSecao}"`}.
          Após concluir todas, a cobertura do sistema em relação às fontes analisadas será substancialmente maior,
          fortalecendo a proposta técnica em processos de aquisição pública.
        </div>
      )}
    </div>
  );
}
