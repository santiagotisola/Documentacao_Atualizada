import { useState, useEffect, useRef } from "react";
import { apiFetch } from "../services/api";
import ConfidencaRevisao from "./ConfidencaRevisao";

const PRODUTOS = [
  { value: "axhub",   label: "AxHub",   icon: "🖥️",  cor: "#3b82f6" },
  { value: "axton",   label: "AxTon",   icon: "⚖️",  cor: "#8b5cf6" },
  { value: "axcross", label: "AxCross", icon: "🚦",  cor: "#10b981" },
];

const STATUS_COR = {
  atendido:     { bg: "rgba(34,197,94,0.15)", texto: "#4ade80", label: "✅ Atendido" },
  parcial:      { bg: "rgba(245,158,11,0.15)", texto: "#fbbf24", label: "⚠️ Parcial" },
  nao_atendido: { bg: "rgba(239,68,68,0.15)", texto: "#f87171", label: "❌ Não Atendido" },
};

const VEREDICTO_COR = {
  APTO:               { bg: "rgba(34,197,94,0.15)", texto: "#4ade80", label: "✅ APTO" },
  PARCIALMENTE_APTO:  { bg: "rgba(245,158,11,0.15)", texto: "#fbbf24", label: "⚠️ PARCIALMENTE APTO" },
  INAPTO:             { bg: "rgba(239,68,68,0.15)", texto: "#f87171", label: "❌ INAPTO" },
};

const ABAS = [
  { id: "lista",    label: "📋 Relatórios Gerados" },
  { id: "novo",     label: "➕ Novo Relatório" },
  { id: "revisao",  label: "🔍 Fila de Revisão" },
];

// Etapas visuais do progresso de análise
const ETAPAS = [
  { id: 1, label: "Extraindo texto",          descricao: "Processando o documento" },
  { id: 2, label: "Identificando requisitos", descricao: "Heurística + IA" },
  { id: 3, label: "Verificando cobertura",    descricao: "Keywords + GPT semântico" },
  { id: 4, label: "Gerando justificativas",   descricao: "Análise técnica via IA" },
];

export default function Conformidade({ embedded = false, preloadData = null }) {
  const [produto, setProduto]         = useState("axhub");
  const [aba, setAba]                 = useState("lista");
  const [lista, setLista]             = useState([]);
  const [selecionado, setSelecionado] = useState(null);
  const [carregando, setCarregando]   = useState(false);
  const [gerando, setGerando]         = useState(false);
  const [etapaAtual, setEtapaAtual]   = useState(0); // 0 = idle
  const [msg, setMsg]                 = useState("");
  const [filtroStatus, setFiltroStatus] = useState("nao_atendido");
  const fileInputRef = useRef(null);

  // Formulário
  const [tituloEdital, setTituloEdital] = useState("");
  const [textoEdital, setTextoEdital]   = useState("");
  const [comIA, setComIA]               = useState(true);
  const [dragOver, setDragOver]         = useState(false);
  const [extraindo, setExtraindo]       = useState(false);
  const [infoArquivo, setInfoArquivo]   = useState(null); // { nome, palavras, chars }

  useEffect(() => { carregarLista(); }, [produto]);

  // Pré-preenche se veio de "Fontes de Pesquisa → 📜 Conformidade" (só no mount)
  useEffect(() => {
    // Prioridade 1: prop direta (overlay inline)
    const data = preloadData || (() => {
      const raw = sessionStorage.getItem("conformidade_preload");
      if (!raw) return null;
      sessionStorage.removeItem("conformidade_preload");
      try { return JSON.parse(raw); } catch { return null; }
    })();
    if (!data) return;
    const { titulo, conteudo, produto: prodPreload } = data;
    if (titulo)      setTituloEdital(titulo);
    if (conteudo)    setTextoEdital(conteudo);
    if (prodPreload) setProduto(prodPreload);
    setAba("novo");
    setInfoArquivo({
      nome: titulo || "Documento importado",
      palavras: (conteudo || "").split(/\s+/).filter(Boolean).length,
      chars: (conteudo || "").length,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function carregarLista() {
    setCarregando(true);
    setSelecionado(null);
    try {
      const r = await apiFetch(`/conformidade?produto=${produto}`);
      const d = await r.json();
      setLista(d.lista || []);
    } catch { setMsg("Erro ao carregar relatórios."); }
    setCarregando(false);
  }

  async function carregarDetalhe(id) {
    setCarregando(true);
    setSelecionado(null);
    try {
      const r = await apiFetch(`/conformidade/${id}`);
      const d = await r.json();
      setSelecionado(d);
    } catch { setMsg("Erro ao carregar detalhe."); }
    setCarregando(false);
  }

  // ── Upload de arquivo (PDF/DOCX/TXT/imagem) ──────────────────
  async function processarArquivo(file) {
    if (!file) return;
    setExtraindo(true);
    setInfoArquivo(null);
    setMsg("");

    const data = new FormData();
    data.append("arquivo", file);

    try {
      const r = await apiFetch(`/doc/upload-contexto`, { method: "POST", body: data });
      if (!r.ok) {
        const e = await r.json();
        setMsg(`❌ Erro ao extrair arquivo: ${e.erro}`);
        return;
      }
      const d = await r.json();
      setTextoEdital(d.texto);
      if (!tituloEdital) setTituloEdital(file.name.replace(/\.[^.]+$/, ""));
      setInfoArquivo({ nome: d.nomeArquivo, palavras: d.palavrasExtraidas, chars: d.caracteres });
    } catch {
      setMsg("❌ Erro ao processar o arquivo. Verifique se a API está rodando.");
    } finally {
      setExtraindo(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processarArquivo(file);
  }

  function handleFileInput(e) {
    processarArquivo(e.target.files[0]);
    e.target.value = "";
  }

  // ── Gerar relatório com progresso por etapas ─────────────────
  async function gerarRelatorio() {
    if (!textoEdital.trim()) { setMsg("⚠️ Cole o texto do edital ou faça upload de um arquivo."); return; }
    setGerando(true);
    setMsg("");
    setEtapaAtual(1);

    // Simula progresso das etapas com base no tempo esperado
    // Etapa 1 e 2 avançam rapidamente, 3 e 4 dependem da IA
    const timers = [
      setTimeout(() => setEtapaAtual(2), 800),
      setTimeout(() => setEtapaAtual(3), 2500),
      setTimeout(() => setEtapaAtual(4), comIA ? 8000 : 4000),
    ];

    try {
      const r = await apiFetch(`/conformidade/gerar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produto,
          tituloEdital: tituloEdital || "Edital sem título",
          textoEdital,
          comJustificativas: comIA,
        }),
      });
      timers.forEach(clearTimeout);
      const d = await r.json();
      if (!r.ok) {
        setMsg(`❌ Erro: ${d.erro}`);
        setEtapaAtual(0);
      } else {
        setEtapaAtual(5); // concluído
        const { stats } = d;
        setMsg(`✅ Relatório gerado — ${stats.total} requisitos analisados. Conformidade: ${stats.percentual}% (${VEREDICTO_COR[stats.veredicto]?.label}).`);
        setTimeout(() => {
          setTituloEdital("");
          setTextoEdital("");
          setInfoArquivo(null);
          setEtapaAtual(0);
          setAba("lista");
          carregarLista().then(() => carregarDetalhe(d.relatorio._id));
        }, 1800);
      }
    } catch {
      timers.forEach(clearTimeout);
      setMsg("❌ Erro ao conectar com a API.");
      setEtapaAtual(0);
    }
    setGerando(false);
  }

  async function removerRelatorio(id, e) {
    e.stopPropagation();
    if (!confirm("Remover este relatório?")) return;
    try {
      await apiFetch(`/conformidade/${id}`, { method: "DELETE" });
      if (selecionado?._id === id) setSelecionado(null);
      await carregarLista();
    } catch { setMsg("Erro ao remover."); }
  }

  const itensFiltrados = selecionado?.itens?.filter(i =>
    filtroStatus === "todos" || i.status === filtroStatus
  ) || [];

  return (
    <div className={embedded ? "" : "page-container"}>
      {!embedded && (
        <div className="page-header">
          <h2 className="page-title">📜 Conformidade com Editais</h2>
          <span className="page-subtitle">
            Analisa se o sistema atende os requisitos de um edital ou Termo de Referência para licitação.
          </span>
        </div>
      )}

      {/* Seletor de produto */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {PRODUTOS.map(p => (
          <button
            key={p.value}
            className={`tab-btn ${produto === p.value ? "active" : ""}`}
            onClick={() => { setProduto(p.value); setMsg(""); }}
            style={produto === p.value ? { borderColor: p.cor, color: p.cor } : {}}
          >
            {p.icon} {p.label}
          </button>
        ))}
      </div>

      {/* Abas */}
      <div className="tab-bar" style={{ marginBottom: "1.5rem" }}>
        {ABAS.map(a => (
          <button
            key={a.id}
            className={`tab-btn ${aba === a.id ? "active" : ""}`}
            onClick={() => { setAba(a.id); setMsg(""); }}
          >
            {a.label}
          </button>
        ))}
      </div>

      {msg && (
        <div style={{
          padding: "10px 14px",
          background: msg.startsWith("✅") ? "rgba(34,197,94,0.15)" : msg.startsWith("⏳") ? "rgba(59,130,246,0.15)" : "rgba(239,68,68,0.15)",
          borderRadius: 6,
          marginBottom: 14,
          fontSize: 13,
          color: msg.startsWith("✅") ? "#4ade80" : msg.startsWith("⏳") ? "#60a5fa" : "#f87171",
        }}>{msg}</div>
      )}

      {/* ── ABA: NOVO RELATÓRIO ── */}
      {aba === "novo" && (
        <div style={{ maxWidth: 820 }}>
          <div style={{ background: "#f8f9fc", border: "1px solid #dde", borderRadius: 10, padding: 24, marginBottom: 20 }}>
            <h4 style={{ margin: "0 0 16px", fontSize: 15 }}>
              Novo Relatório de Conformidade — {produto.toUpperCase()}
            </h4>

            {/* ── Upload de arquivo ── */}
            <label style={labelStyle}>
              📎 Upload do Edital / Termo de Referência{" "}
              <span style={{ color: "#888", fontWeight: 400 }}>(PDF, DOCX, TXT, imagem)</span>
            </label>
            <div
              onClick={() => !extraindo && fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              style={{
                border: `2px dashed ${dragOver ? "#2563eb" : "#c5cae9"}`,
                borderRadius: 8,
                padding: "18px 20px",
                textAlign: "center",
                cursor: extraindo ? "wait" : "pointer",
                background: dragOver ? "#eff6ff" : "#fff",
                marginBottom: 12,
                transition: "all 0.2s",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,.md,.png,.jpg,.jpeg,.webp"
                style={{ display: "none" }}
                onChange={handleFileInput}
              />
              {extraindo ? (
                <span style={{ color: "#2563eb", fontSize: 13 }}>⏳ Extraindo texto do arquivo...</span>
              ) : infoArquivo ? (
                <div style={{ fontSize: 13 }}>
                  <span style={{ color: "#155724", fontWeight: 600 }}>✅ {infoArquivo.nome}</span>
                  <span style={{ color: "#888", marginLeft: 10 }}>
                    {infoArquivo.palavras.toLocaleString("pt-BR")} palavras · {infoArquivo.chars.toLocaleString("pt-BR")} chars
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); setInfoArquivo(null); setTextoEdital(""); }}
                    style={{ marginLeft: 12, background: "none", border: "none", color: "#e34c4c", cursor: "pointer", fontSize: 13 }}
                  >✕ remover</button>
                </div>
              ) : (
                <span style={{ color: "#888", fontSize: 13 }}>
                  Arraste um arquivo aqui ou <strong style={{ color: "#2563eb" }}>clique para selecionar</strong>
                  <br />
                  <small>PDF, DOCX, TXT · OCR automático para imagens e PDFs escaneados</small>
                </span>
              )}
            </div>

            {/* ── Título do edital ── */}
            <label style={labelStyle}>Título do Edital / TR</label>
            <input
              value={tituloEdital}
              onChange={e => setTituloEdital(e.target.value)}
              placeholder="Ex: Pregão Eletrônico nº 032/2026 — DETRAN-SP"
              style={inputStyle}
            />

            {/* ── Texto (pode ser preenchido pelo upload ou manualmente) ── */}
            <label style={{ ...labelStyle, marginTop: 12 }}>
              Texto do Edital{" "}
              <span style={{ color: "#888", fontWeight: 400 }}>
                (preenchido automaticamente pelo upload, ou cole manualmente)
              </span>
              {textoEdital && (
                <span style={{ marginLeft: 10, color: "#27ae60", fontSize: 11, fontWeight: 600 }}>
                  {textoEdital.split(/\s+/).filter(Boolean).length.toLocaleString("pt-BR")} palavras
                </span>
              )}
            </label>
            <textarea
              value={textoEdital}
              onChange={e => setTextoEdital(e.target.value)}
              placeholder={"Cole aqui o texto do edital ou faça o upload acima...\n\nExemplo:\n1. O sistema deve registrar infrações de trânsito.\n2. O software deverá emitir relatórios por período.\na) Permitir exportação em Excel.\n..."}
              rows={10}
              style={{ ...inputStyle, fontFamily: "monospace", fontSize: 12, resize: "vertical" }}
            />

            {/* ── Opções ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
              <input
                type="checkbox"
                id="comIA"
                checked={comIA}
                onChange={e => setComIA(e.target.checked)}
                style={{ width: 15, height: 15 }}
              />
              <label htmlFor="comIA" style={{ fontSize: 13, color: "#555", cursor: "pointer" }}>
                Gerar justificativas técnicas via IA{" "}
                <span style={{ color: "#888" }}>(recomendado — requer OpenAI)</span>
              </label>
            </div>

            {/* ── Indicador de progresso por etapas ── */}
            {gerando && etapaAtual > 0 && (
              <div style={{ marginTop: 18, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "14px 16px" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 10 }}>
                  Análise em andamento...
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {ETAPAS.map(etapa => {
                    const status = etapaAtual > etapa.id ? "done" : etapaAtual === etapa.id ? "active" : "pending";
                    return (
                      <div key={etapa.id} style={{ flex: 1, textAlign: "center" }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: "50%",
                          margin: "0 auto 6px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 13, fontWeight: 700,
                          background: status === "done" ? "#d4edda" : status === "active" ? "#2563eb" : "#e9ecef",
                          color: status === "done" ? "#155724" : status === "active" ? "#fff" : "#999",
                          transition: "all 0.3s",
                        }}>
                          {status === "done" ? "✓" : etapa.id}
                        </div>
                        <div style={{ fontSize: 10, color: status === "pending" ? "#bbb" : "#444", lineHeight: 1.3 }}>
                          {etapa.label}
                        </div>
                        <div style={{ fontSize: 9, color: "#aaa" }}>{etapa.descricao}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={gerarRelatorio}
              disabled={gerando || !textoEdital.trim()}
              style={{
                marginTop: 18,
                padding: "10px 28px",
                background: gerando ? "#94a3b8" : "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 7,
                fontSize: 14,
                fontWeight: 600,
                cursor: gerando ? "not-allowed" : "pointer",
                transition: "background 0.2s",
              }}
            >
              {gerando ? "⏳ Analisando..." : "🔍 Gerar Relatório de Conformidade"}
            </button>
          </div>

          <div style={{ background: "#fffbea", border: "1px solid #ffe082", borderRadius: 8, padding: "12px 16px", fontSize: 12, color: "#6b4c00" }}>
            <strong>💡 Como funciona:</strong> O sistema extrai os requisitos do texto colado e cruza com toda a documentação do {produto.toUpperCase()} (
            {produto === "axhub" ? "14 módulos documentados" : produto === "axton" ? "portal AxTon" : "portal AxCross"}).
            Cada requisito recebe o status{" "}
            <strong>Atendido</strong> (documentado com alta cobertura),{" "}
            <strong>Parcial</strong> (documentação parcial) ou{" "}
            <strong>Não Atendido</strong> (sem cobertura na documentação).
          </div>
        </div>
      )}

      {/* ── ABA: LISTA ── */}
      {aba === "lista" && (
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          {/* Lista lateral */}
          <div style={{ width: 320, flexShrink: 0, border: "1px solid #dde", borderRadius: 8, overflow: "hidden" }}>
            {carregando && !selecionado && (
              <p style={{ padding: 12, color: "#888", fontSize: 13 }}>Carregando...</p>
            )}
            {!carregando && lista.length === 0 && (
              <div style={{ padding: 32, textAlign: "center", color: "#aaa" }}>
                <p style={{ fontSize: 36 }}>📜</p>
                <p style={{ fontSize: 13 }}>Nenhum relatório gerado ainda.</p>
                <button
                  onClick={() => setAba("novo")}
                  style={{ marginTop: 8, padding: "7px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}
                >
                  ➕ Gerar primeiro relatório
                </button>
              </div>
            )}
            {lista.map(rel => {
              const vc = VEREDICTO_COR[rel.veredicto] || VEREDICTO_COR.INAPTO;
              return (
                <div
                  key={rel._id}
                  onClick={() => carregarDetalhe(rel._id)}
                  style={{
                    padding: "12px 14px",
                    borderBottom: "1px solid #eee",
                    cursor: "pointer",
                    background: selecionado?._id === rel._id ? "#f0f4ff" : "#fff",
                    borderLeft: selecionado?._id === rel._id ? "3px solid #2563eb" : "3px solid transparent",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#222", flex: 1, lineHeight: 1.3 }}>
                      {rel.tituloEdital}
                    </span>
                    <button
                      onClick={e => removerRelatorio(rel._id, e)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 16, padding: "0 2px", lineHeight: 1 }}
                      title="Remover"
                    >×</button>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: vc.bg, color: vc.texto, fontWeight: 600 }}>
                      {vc.label}
                    </span>
                    <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: "#f0f4ff", color: "#2563eb" }}>
                      {rel.percentualConformidade}%
                    </span>
                    <span style={{ fontSize: 11, color: "#888" }}>
                      {rel.totalRequisitos} requisitos
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>
                    {new Date(rel.createdAt).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detalhe */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {!selecionado && !carregando && (
              <div style={{ padding: 40, textAlign: "center", color: "#ccc" }}>
                <p style={{ fontSize: 40 }}>👈</p>
                <p style={{ fontSize: 14 }}>Selecione um relatório para ver os detalhes.</p>
              </div>
            )}
            {carregando && <p style={{ padding: 20, color: "#888" }}>Carregando...</p>}

            {selecionado && !carregando && (
              <div>
                {/* Cabeçalho do relatório */}
                <div style={{ background: "#f8f9fc", border: "1px solid #dde", borderRadius: 10, padding: "16px 20px", marginBottom: 16 }}>
                  <h3 style={{ margin: "0 0 8px", fontSize: 17 }}>{selecionado.tituloEdital}</h3>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    {(() => {
                      const vc = VEREDICTO_COR[selecionado.veredicto];
                      return (
                        <span style={{ fontSize: 14, fontWeight: 700, padding: "4px 12px", borderRadius: 6, background: vc.bg, color: vc.texto }}>
                          {vc.label}
                        </span>
                      );
                    })()}
                    <span style={{ fontSize: 14, color: "#555" }}>
                      Conformidade: <strong>{selecionado.percentualConformidade}%</strong>
                    </span>
                    <span style={{ fontSize: 13, color: "#888" }}>
                      {selecionado.totalDocumentosAnalisados} docs analisados
                    </span>
                  </div>

                  {/* Barra de progresso */}
                  <div style={{ marginTop: 14, background: "#e9ecef", borderRadius: 8, height: 10, overflow: "hidden" }}>
                    <div style={{
                      width: `${selecionado.percentualConformidade}%`,
                      height: "100%",
                      background: selecionado.percentualConformidade >= 80 ? "#27ae60" : selecionado.percentualConformidade >= 50 ? "#f39c12" : "#e74c3c",
                      transition: "width 0.5s",
                    }} />
                  </div>

                  {/* Estatísticas */}
                  <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
                    {[
                      { label: "✅ Atendidos",    val: selecionado.atendidos,    bg: "#d4edda", txt: "#155724" },
                      { label: "⚠️ Parciais",     val: selecionado.parciais,     bg: "#fff3cd", txt: "#856404" },
                      { label: "❌ Não Atendidos", val: selecionado.naoAtendidos, bg: "#f8d7da", txt: "#721c24" },
                    ].map(s => (
                      <div key={s.label} style={{ flex: 1, textAlign: "center", padding: "10px 6px", borderRadius: 8, background: s.bg }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: s.txt }}>{s.val}</div>
                        <div style={{ fontSize: 11, color: s.txt, marginTop: 2 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Filtro de itens */}
                <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "#555" }}>Filtrar:</span>
                  {[
                    { id: "todos",        label: "Todos" },
                    { id: "atendido",     label: "✅ Atendidos" },
                    { id: "parcial",      label: "⚠️ Parciais" },
                    { id: "nao_atendido", label: "❌ Não Atendidos" },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFiltroStatus(f.id)}
                      style={{
                        padding: "4px 12px",
                        borderRadius: 5,
                        border: "1px solid",
                        borderColor: filtroStatus === f.id ? "#2563eb" : "#ccc",
                        background: filtroStatus === f.id ? "#eff6ff" : "#fff",
                        color: filtroStatus === f.id ? "#2563eb" : "#555",
                        fontSize: 12,
                        cursor: "pointer",
                        fontWeight: filtroStatus === f.id ? 600 : 400,
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                  <span style={{ fontSize: 12, color: "#888", marginLeft: "auto" }}>{itensFiltrados.length} item(ns)</span>
                </div>

                {/* Lista de requisitos */}
                <ListaRequisitos itens={itensFiltrados} produto={selecionado.produto} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ABA: REVISÃO ── */}
      {aba === "revisao" && (
        <ConfidencaRevisao embedded />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════
// COMPONENTE: Lista de Requisitos expandível
// ══════════════════════════════════════════════════
const COR_BORDA = { atendido: "#27ae60", parcial: "#f39c12", nao_atendido: "#e74c3c" };

/**
 * Classifica o tipo de requisito e retorna interpretação contextual.
 * Retorna null se for uma cláusula jurídica/financeira que não é requisito do software.
 */
function interpretarRequisito(requisito) {
  const r = (requisito || "").toLowerCase();

  // ── CLÁUSULAS JURÍDICAS/FINANCEIRAS ──────────────────────────────────
  // Estas são obrigações contratuais DA EMPRESA (não do software).
  // O sistema de conformidade não deve avaliar estas — são o departamento jurídico/financeiro que cuida.
  if (/seguro[\s-]garantia|ap[oó]lice|cauc[íi]o|garantia\s+(em\s+dinheiro|contratual|financeira)|t[íi]tulo\s+da\s+d[íi]vida|fundo\s+de\s+garantia/i.test(r))
    return {
      tipo: "juridico",
      titulo: "Garantia Contratual (responsabilidade jurídica)",
      significado: `Este item é uma CLÁUSULA DE GARANTIA FINANCEIRA do contrato, não um requisito do software. Significa que sua empresa precisa apresentar um "seguro-garantia" ou caução (em dinheiro, título ou apólice de seguro) equivalente a um percentual do valor do contrato.\n\nIsso é uma exigência para a EMPRESA, não para o sistema em si.`,
      acao: "Solicite ao setor jurídico/financeiro que emita a garantia contratual no valor e modalidade exigidos. Isso geralmente é feito antes ou no ato da assinatura do contrato.",
      onde: "Departamento Jurídico / Financeiro da empresa",
      urgencia: "Alta",
    };

  if (/foro\s+(eleito|competente)|comarca|na\s+comarca|tribunal/i.test(r))
    return {
      tipo: "juridico",
      titulo: "Foro Jurídico (cláusula de local para processos)",
      significado: "Define em qual cidade/tribunal serão resolvidos eventuais conflitos judiciais. É uma cláusula padrão de contratos e NÃO é um requisito técnico do software.",
      acao: "Nenhuma ação técnica necessária. Esta cláusula é aceita automaticamente ao assinar o contrato.",
      onde: "Contrato (cláusula padrão)",
      urgencia: "Baixa",
    };

  if (/rescis[aã]o\s+(unilateral|contratual)|rescisão\s+do\s+contrato/i.test(r))
    return {
      tipo: "juridico",
      titulo: "Rescisão Contratual",
      significado: "Define as condições em que o contrato pode ser rescindido por qualquer das partes. É uma cláusula jurídica padrão, NÃO um requisito do software.",
      acao: "Nenhuma ação técnica necessária. Revise com o jurídico se as condições de rescisão são aceitáveis para sua empresa.",
      onde: "Departamento Jurídico",
      urgencia: "Baixa",
    };

  if (/penalidade|san[çc][aã]o\s+administrativa|multa\s+contratual|notificação\s+prévia/i.test(r))
    return {
      tipo: "juridico",
      titulo: "Penalidades / Sanções Administrativas",
      significado: "Define as multas e sanções que sua empresa pode sofrer caso descumpra prazos ou cláusulas. É uma cláusula jurídica, NÃO um requisito técnico do software.",
      acao: "Revise com o jurídico os prazos e obrigações para evitar multas. Garanta que os SLAs acordados sejam cumpridos.",
      onde: "Departamento Jurídico",
      urgencia: "Média",
    };

  if (/reajuste|equil[íi]brio\s+econ[oô]mico|reequil[íi]brio|[íi]ndice\s+de\s+reajuste/i.test(r))
    return {
      tipo: "juridico",
      titulo: "Reajuste de Valores",
      significado: "Define como o valor do contrato será corrigido ao longo do tempo (ex: IPCA, INPC). É uma cláusula financeira, NÃO um requisito técnico.",
      acao: "Verifique com o financeiro se o índice de reajuste previsto é adequado para cobrir os custos ao longo do contrato.",
      onde: "Departamento Financeiro",
      urgencia: "Baixa",
    };

  if (/dotação\s+orçament|empenho|nota\s+de\s+empenho|subconta|programa[çc][aã]o\s+orçament/i.test(r))
    return {
      tipo: "juridico",
      titulo: "Dotação Orçamentária / Empenho",
      significado: "Indica de qual verba orçamentária o pagamento será feito. É uma cláusula administrativa do órgão contratante, NÃO um requisito do software.",
      acao: "Nenhuma ação técnica necessária. O empenho é feito pelo órgão público contratante.",
      onde: "Setor financeiro do órgão contratante",
      urgencia: "Baixa",
    };

  if (/ordem\s+de\s+servi[çc]o|aceite\s+(definitivo|provis[oó]rio)|recebimento\s+(definitivo|provis[oó]rio)/i.test(r))
    return {
      tipo: "juridico",
      titulo: "Processo de Aceite / Recebimento",
      significado: "Define como o órgão público vai formalizar o recebimento do sistema (provisório = entrega inicial; definitivo = após período de uso sem problemas). NÃO é um requisito técnico do software em si.",
      acao: "Garanta que os critérios de aceite estejam claros na proposta: o que será entregue, em qual prazo e quais funcionalidades estarão disponíveis no aceite provisório e definitivo.",
      onde: "Proposta técnica — Seção de Entregas e Aceite",
      urgencia: "Média",
    };

  // ── REQUISITOS TÉCNICOS DO SOFTWARE ──────────────────────────────────

  if (/objeto\s*(da|do)\s*(contrata|aquisi|presta)|escopo\s*(do\s*)?sistema|finalidade\s*(do|da)\s*(solu|sistema|softwre)/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Objeto / Escopo do Sistema",
      significado: "O contrato precisa que o sistema atenda ao propósito central descrito: o que o software faz, para quem e qual problema resolve. A documentação deve deixar claro que o sistema cumpre exatamente o escopo contratado.",
      acao: "Crie ou atualize a página de Visão Geral do sistema descrevendo: o que o sistema faz, os módulos principais, para quais órgãos/operações foi desenvolvido.",
      onde: "docs/primeiros-passos/visao-geral.md",
      urgencia: "Alta",
    };

  if (/integra[çc][aã]o|integrar\s+(com|ao)|api\s+rest|webservice|web\s+service|interoperabilidade/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Integração com outros sistemas",
      significado: "O contrato exige que o software se comunique com outro sistema do governo ou plataforma (ex: SINESP, RENAINF, DETRAN, DENATRAN, SENATRAN, sistema municipal).",
      acao: "Documente quais integrações já existem: nome do sistema, tipo de comunicação (API REST, arquivo, web service), dados trocados e periodicidade.",
      onde: "docs/referencia-tecnica/integracoes.md",
      urgencia: "Alta",
    };

  if (/relat[oó]rio|exporta[çc][aã]o|excel|pdf\s+do\s+relat|dashboard|painel\s+gerencial/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Relatórios e Exportação de Dados",
      significado: "O contrato exige que o sistema gere relatórios gerenciais, estatísticos ou operacionais. Também pode exigir exportação em formatos específicos (PDF, Excel, CSV).",
      acao: "Liste todos os relatórios disponíveis. Para cada um: nome, descrição, filtros disponíveis, formatos de exportação. Inclua screenshots.",
      onde: "docs/relatorios/",
      urgencia: "Média",
    };

  if (/usu[áa]rio|acesso|login|senha|permiss[aã]o|perfil\s+de\s+acesso|hierarquia|controle\s+de\s+acesso/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Controle de Acesso e Perfis de Usuário",
      significado: "O sistema precisa controlar quem pode acessar o quê. Diferentes usuários têm diferentes permissões (ex: operador vê só seu posto; gestor vê todos).",
      acao: "Documente os perfis de acesso existentes (ex: Administrador, Operador, Fiscalizador), o que cada perfil pode fazer e como criar/gerenciar usuários.",
      onde: "docs/controle-acesso/",
      urgencia: "Média",
    };

  if (/pesagem|peso|balan[çc]a|tara|eixo|excesso\s+de\s+carga|peso\s+bruto\s+total/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Controle de Pesagem Veicular",
      significado: "O contrato exige que o sistema realize pesagem de veículos, calcule excesso de carga por eixo, gere auto de infração por sobrepeso e registre tudo digitalmente.",
      acao: "Documente: fluxo completo de uma pesagem, limites legais por tipo de eixo, como é gerado o auto de infração por excesso, relatórios de pesagens.",
      onde: "docs/pesagem/",
      urgencia: "Alta",
    };

  if (/infra[çc][aã]o\s+de\s+tr[âa]nsito|auto\s+de\s+infra[çc][aã]o|autu[ao][çrc][aã]o|notifica[çc][aã]o\s+de\s+infra[çc][aã]o|ait\b|renainf|sinaut/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Registro de Infrações de Trânsito",
      significado: "O sistema deve ser capaz de registrar infrações de trânsito, gerar AITs (Autos de Infração de Trânsito), enviar para o RENAINF e gerenciar o ciclo completo da infração.",
      acao: "Documente: tipos de infração suportados, fluxo de geração do AIT, integração com RENAINF, processo de notificação ao infrator, recursos e cancelamentos.",
      onde: "docs/infracoes/",
      urgencia: "Alta",
    };

  if (/suporte\s+t[eé]cnico|atendimento\s+t[eé]cnico|sla|prazo\s+de\s+atend|tempo\s+de\s+resposta|chamado/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Suporte Técnico e SLA",
      significado: "O contrato define prazos máximos para sua empresa responder e resolver problemas técnicos. Cada tipo de problema tem um prazo diferente (crítico = horas; baixo = dias).",
      acao: "Elabore um documento de SLA com: categorias de chamado (crítico/alto/médio/baixo), tempo máximo de resposta e resolução para cada categoria, canais de atendimento disponíveis.",
      onde: "Proposta técnica — Anexo de SLA",
      urgencia: "Alta",
    };

  if (/treinamento|capacita[çc][aã]o|instru[çc][aã]o\s+(de\s+uso|t[eé]cnica)|curso\s+de\s+opera[çc][aã]o/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Treinamento dos Usuários",
      significado: "O contrato exige que sua empresa capacite os funcionários do órgão a usar o sistema. Inclui definir carga horária, metodologia e material de apoio.",
      acao: "Elabore um Plano de Capacitação com: carga horária (ex: 16h), modalidade (presencial/remoto), público-alvo, conteúdo programático, material didático a entregar.",
      onde: "Proposta técnica — Plano de Treinamento / Implantação",
      urgencia: "Média",
    };

  if (/lgpd|lei\s+geral\s+de\s+prote[çc][aã]o|dado\s+pessoal|privacidade|tratamento\s+de\s+dados|anonimiza[çc][aã]o/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Conformidade com a LGPD",
      significado: "O contrato exige que o software trate dados pessoais de acordo com a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018): consentimento, finalidade, segurança e direitos do titular.",
      acao: "Documente: quais dados pessoais o sistema coleta, com qual finalidade, por quanto tempo são retidos, como são protegidos, como o titular pode solicitar exclusão.",
      onde: "docs/referencia-tecnica/lgpd.md",
      urgencia: "Alta",
    };

  if (/criptograf|https|ssl|tls|certificado\s+digital|vpn|firewall|log\s+de\s+auditoria|trilha\s+de\s+auditoria/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Segurança da Informação",
      significado: "O contrato exige que o sistema use criptografia, HTTPS, certificado digital ou mantenha logs de auditoria (trilha de quem fez o quê e quando).",
      acao: "Documente: protocolos de segurança usados (HTTPS/TLS), controle de sessão, log de auditoria (quais ações são registradas), política de backup.",
      onde: "docs/referencia-tecnica/seguranca.md",
      urgencia: "Alta",
    };

  if (/aferi[çc][aã]o|calibra[çc][aã]o|inmetro|certifica[çc][aã]o\s+do\s+equipamento|equipamento\s+aprovado/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Aferição e Certificação de Equipamentos",
      significado: "O edital exige que os equipamentos físicos (balanças, radares, sensores) tenham certificado de aferição vigente pelo INMETRO, comprovando que medem com precisão.",
      acao: "Anexe os certificados de aferição válidos de cada equipamento. Documente o processo de re-aferição periódica e quem é responsável por solicitá-la.",
      onde: "Proposta técnica — Anexo de Equipamentos",
      urgencia: "Alta",
    };

  if (/implanta[çc][aã]o|instala[çc][aã]o\s+do\s+sistema|configura[çc][aã]o\s+do\s+ambiente|migra[çc][aã]o\s+de\s+dados/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Processo de Implantação",
      significado: "O contrato define como o sistema será colocado em operação no órgão: quem instala, em quanto tempo, como os dados antigos são migrados e quando começa a operar.",
      acao: "Elabore um Plano de Implantação com: cronograma de entrega (fases), equipe responsável, dependências do cliente (infraestrutura, acesso), processo de homologação.",
      onde: "Proposta técnica — Plano de Implantação",
      urgencia: "Média",
    };

  if (/disponibilidade|uptime|indisponibilidade|janela\s+de\s+manuten[çc][aã]o|24\s*(h|horas)|7\s*dias/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Disponibilidade do Sistema",
      significado: "O contrato define um percentual mínimo de tempo que o sistema deve estar funcionando (ex: 99,5% de uptime). Quedas além do permitido geram multas.",
      acao: "Informe na proposta técnica: percentual de uptime garantido, janela de manutenção programada (quando o sistema pode ficar fora do ar), monitoramento utilizado.",
      onde: "Proposta técnica — Anexo de SLA / Disponibilidade",
      urgencia: "Alta",
    };

  if (/backup|c[oó]pia\s+de\s+seguran[çc]a|recupera[çc][aã]o\s+de\s+dados|rpo|rto/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Backup e Recuperação de Dados",
      significado: "O contrato exige que o sistema faça cópias de segurança periódicas dos dados e que seja possível restaurá-los em caso de falha.",
      acao: "Documente a política de backup: frequência (diário/semanal), retenção (por quanto tempo guarda), tipo (incremental/completo), tempo máximo de restauração.",
      onde: "docs/referencia-tecnica/backup.md",
      urgencia: "Alta",
    };

  if (/monitoramento|fiscaliza[çc][aã]o\s+eletr[oô]nica|video|imagem|c[âa]mera|ocr\s+de\s+placa|reconhecimento\s+de\s+placa/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Monitoramento e Fiscalização Eletrônica",
      significado: "O sistema deve capturar imagens de veículos, reconhecer placas (OCR), registrar passagens e cruzar com bases de dados (RENAVAM, SINESP) automaticamente.",
      acao: "Documente: câmeras suportadas, processo de captura e OCR de placa, integração com bases externas, tempo de retenção das imagens.",
      onde: "docs/operacoes/monitoramento.md",
      urgencia: "Alta",
    };

  if (/cronotac[oó]grafo|jornada\s+de\s+trabalho\s+do\s+motorista|disco\s+(diagrama|tacogr[áa]fico)|tempo\s+de\s+direc[çc][aã]o/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Controle de Cronotacógrafo",
      significado: "O sistema deve controlar o uso do cronotacógrafo pelos motoristas: verificar se o disco está correto, calcular tempo de direção/descanso e gerar infrações por violações.",
      acao: "Documente: tipos de cronotacógrafo suportados (analógico/digital), como é feita a leitura do disco, cálculo de jornada, geração de auto por irregularidade.",
      onde: "docs/cronotacografo/",
      urgencia: "Alta",
    };

  if (/objeto\s+(do|da|deste|do\s+presente)\s+(instrumento|contrato|ajuste|termo)|contrata[çc][aã]o\s+de\s+(empresa|fornecedor|prestador)|presta[çc][aã]o\s+de\s+servi[çc]os/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Objeto / Finalidade do Contrato",
      significado: `Este item descreve o propósito central do contrato — ou seja, o que foi contratado, para que serve e qual é a missão principal do sistema.\n\nTrecho: "${requisito}"\n\nA documentação deve deixar claro que o sistema entrega exatamente o que foi contratado.`,
      acao: "Garanta que a documentação do sistema descreva claramente: o que o software faz, quais problemas resolve, quais órgãos/setores atende e quais são suas funcionalidades centrais.",
      onde: "docs/primeiros-passos/visao-geral.md",
      urgencia: "Alta",
    };

  if (/prazo\s+(de\s+entrega|de\s+execu[çc][aã]o|de\s+vigência|contratual)|vigência\s+do\s+contrato|execu[çc][aã]o\s+do\s+objeto/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Prazos de Execução / Vigência",
      significado: `Define quando o sistema precisa estar entregue e por quanto tempo o contrato é válido.\n\nTrecho: "${requisito}"\n\nO não cumprimento dos prazos pode gerar multas contratuais.`,
      acao: "Elabore um cronograma de entregas compatível com o prazo contratual. Inclua marcos: implantação, treinamento, aceite provisório e aceite definitivo.",
      onde: "Proposta técnica — Cronograma de Implantação",
      urgencia: "Alta",
    };

  if (/hardware|servidor|infraestrutura|hospedagem|data\s*center|nuvem|cloud|vm\b|m[áa]quina\s+virtual/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Infraestrutura / Hospedagem do Sistema",
      significado: `O contrato especifica onde e como o sistema deve ser hospedado: servidores físicos, nuvem (cloud), máquina virtual ou data center do órgão.\n\nTrecho: "${requisito}"\n\nÉ preciso documentar a arquitetura de infraestrutura usada.`,
      acao: "Documente a infraestrutura: tipo de hospedagem (nuvem/dedicado), especificações do servidor (CPU, RAM, armazenamento), redundância, provedor utilizado.",
      onde: "docs/referencia-tecnica/infraestrutura.md",
      urgencia: "Alta",
    };

  if (/manual\s+(do\s+usu[áa]rio|de\s+opera[çc][aã]o|t[eé]cnico|de\s+instala[çc][aã]o)|documenta[çc][aã]o\s+t[eé]cnica|especifica[çc][aã]o\s+t[eé]cnica/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Documentação Técnica / Manual do Sistema",
      significado: `O contrato exige que sua empresa entregue documentação formal do sistema — manuais, guias de operação ou especificação técnica.\n\nTrecho: "${requisito}"\n\nEssa documentação é entregue junto com o sistema e fica com o órgão.`,
      acao: "Produza a documentação exigida: manual do usuário com prints de tela, guia do administrador, documentação de instalação/configuração do ambiente.",
      onde: "docs/ (entregável contratual)",
      urgencia: "Média",
    };

  if (/audit\s*log|registro\s+de\s+opera[çc][õo]es|hist[oó]rico\s+de\s+altera[çc][õo]es|rastreabilidade|quem\s+(acessou|alterou|excluiu)/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Auditoria e Rastreabilidade de Ações",
      significado: `O sistema precisa registrar tudo que os usuários fazem: quem acessou, o que alterou, quando e de qual IP. Isso garante rastreabilidade total das ações.\n\nTrecho: "${requisito}"\n\nEssencial para controle de fraudes e auditorias externas.`,
      acao: "Documente o sistema de log de auditoria: quais ações são registradas, por quanto tempo são retidos os logs, quem pode consultá-los e como exportá-los.",
      onde: "docs/referencia-tecnica/auditoria.md",
      urgencia: "Alta",
    };

  if (/multiusu[áa]rio|m[uú]ltiplos\s+usu[áa]rios|acesso\s+simult[âa]neo|sess[aã]o\s+concorrente/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Múltiplos Usuários Simultâneos",
      significado: `O sistema deve ser capaz de atender vários usuários ao mesmo tempo sem perda de desempenho.\n\nTrecho: "${requisito}"\n\nIsso é um requisito de concorrência e escalabilidade do sistema.`,
      acao: "Informe na proposta técnica: quantidade máxima de usuários simultâneos suportados, resultado de testes de carga realizados, arquitetura que garante a concorrência.",
      onde: "docs/referencia-tecnica/desempenho.md",
      urgencia: "Média",
    };

  if (/mobile|aplicativo\s+(m[oó]vel|android|ios)|app\b|celular|dispositivo\s+m[oó]vel|tablet/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Aplicativo Mobile",
      significado: `O contrato exige uma versão mobile do sistema (app para Android/iOS ou aplicativo para tablets/celulares usado em campo).\n\nTrecho: "${requisito}"\n\nSe não houver app, é preciso documentar como a operação mobile é suprida (ex: site responsivo).`,
      acao: "Documente se há app mobile disponível: plataformas (Android/iOS), funcionalidades disponíveis no mobile, operação offline e sincronização.",
      onde: "docs/operacoes/mobile.md",
      urgencia: "Alta",
    };

  if (/impress[aã]o|impressora|etiqueta|c[oó]digo\s+de\s+barras|qr\s*code|recibo|comprovante/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Impressão e Comprovantes",
      significado: `O sistema deve gerar documentos impressos: comprovantes, recibos, etiquetas, relatórios físicos ou documentos com código de barras/QR code.\n\nTrecho: "${requisito}"\n\nVerifique se o sistema já tem essa funcionalidade de impressão implementada.`,
      acao: "Documente quais documentos podem ser impressos, o layout padrão, impressoras compatíveis e se há impressão de etiqueta/código de barras.",
      onde: "docs/operacoes/impressao.md",
      urgencia: "Média",
    };

  // ── FALLBACK INTELIGENTE — analisa o texto para gerar explicação útil ──
  const extrairContexto = (texto) => {
    const t = texto.toLowerCase();
    const temas = [];
    if (/sistema|software|aplica[çc][aã]o|plataforma/.test(t)) temas.push("funcionalidade do sistema");
    if (/dados|banco\s+de\s+dados|registro|informa[çc][aã]o/.test(t)) temas.push("gestão de dados");
    if (/usu[áa]rio|operador|fiscaliz|funcion[áa]rio/.test(t)) temas.push("usuários do sistema");
    if (/prazo|data|cronograma|entrega/.test(t)) temas.push("prazos e entregas");
    if (/relat[oó]rio|consulta|pesquisa|visualiza/.test(t)) temas.push("consultas e relatórios");
    if (/configura|parâmetro|parametriza|personaliz/.test(t)) temas.push("configuração do sistema");
    if (/notifica|alerta|aviso|mensagem/.test(t)) temas.push("notificações e alertas");
    if (/importa|exporta|arquivo|planilha/.test(t)) temas.push("importação/exportação de dados");
    if (/processo|fluxo|workflow|aprova[çc][aã]o/.test(t)) temas.push("fluxo de processos");
    if (/contrato|licitação|edital|proposta/.test(t)) temas.push("contexto contratual/licitatório");
    return temas.length > 0
      ? `Com base nos termos encontrados, este item parece ser sobre: **${temas.join(", ")}**.`
      : "Não foi possível identificar automaticamente o tema deste item.";
  };

  const contexto = extrairContexto(requisito);

  return {
    tipo: "desconhecido",
    titulo: "Requisito a revisar manualmente",
    significado: `${contexto}\n\nTrecho original do contrato:\n"${requisito}"\n\nEste item precisa de revisão manual para confirmar se o sistema já o atende e onde isso está documentado.`,
    acao: "1. Leia o trecho completo no contrato para entender o contexto.\n2. Verifique se o sistema já atende essa exigência.\n3. Se atender: adicione documentação comprovando (prints, descrição da funcionalidade).\n4. Se não atender: registre no roadmap como pendência para a licitação.",
    onde: "docs/ (identificar seção correta após análise manual)",
    urgencia: "Média",
  };
}

function ListaRequisitos({ itens, produto }) {
  const [expandido, setExpandido] = useState(null);

  if (!itens.length) {
    return <p style={{ color: "#888", fontSize: 13 }}>Nenhum item neste filtro.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {itens.map(item => {
        const sc        = STATUS_COR[item.status];
        const borda     = COR_BORDA[item.status];
        const aberto    = expandido === item.numero;
        const interp    = (item.status !== "atendido") ? interpretarRequisito(item.requisito) : null;
        const eJuridico = interp?.tipo === "juridico";
        const corUrg    = interp?.urgencia === "Alta" ? "#e74c3c" : interp?.urgencia === "Média" ? "#f39c12" : "#27ae60";

        return (
          <div key={item.numero} style={{ border: "1px solid #eee", borderRadius: 8, background: "#fff", borderLeft: `4px solid ${borda}`, overflow: "hidden" }}>
            {/* Linha principal */}
            <div
              style={{ padding: "11px 14px", cursor: item.status !== "atendido" ? "pointer" : "default", display: "flex", gap: 10, alignItems: "flex-start" }}
              onClick={() => item.status !== "atendido" && setExpandido(aberto ? null : item.numero)}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: "#aaa", minWidth: 28, paddingTop: 1 }}>#{item.numero}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 4px", fontSize: 13, color: "#222", lineHeight: 1.5, fontWeight: item.status === "nao_atendido" ? 600 : 400 }}>
                  {item.requisito}
                </p>
                {interp && !aberto && (
                  <span style={{ fontSize: 11, color: eJuridico ? "#8b5cf6" : "#888", fontStyle: "italic" }}>
                    {eJuridico
                      ? `⚖️ ${interp.titulo} — clique para entender`
                      : item.status === "nao_atendido"
                        ? "❌ Sem cobertura — clique para ver o que fazer"
                        : "⚠️ Parcialmente coberto — clique para ver como completar"}
                  </span>
                )}
                {item.status === "atendido" && item.referenciaDoc && (
                  <span style={{ fontSize: 11, color: "#2563eb" }}>📄 {item.referenciaDoc}</span>
                )}
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                {eJuridico && (
                  <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 10, background: "#ede9fe", color: "#6d28d9", fontWeight: 700 }}>
                    ⚖️ Jurídico
                  </span>
                )}
                {interp && !eJuridico && (
                  <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 10, background: corUrg + "18", color: corUrg, fontWeight: 700 }}>
                    {interp.urgencia}
                  </span>
                )}
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: sc.bg, color: sc.texto, fontWeight: 600, whiteSpace: "nowrap" }}>
                  {sc.label}
                </span>
                {item.status !== "atendido" && (
                  <span style={{ color: "#aaa", fontSize: 12 }}>{aberto ? "▲" : "▼"}</span>
                )}
              </div>
            </div>

            {/* Painel expandido */}
            {aberto && interp && (
              <div style={{ borderTop: "1px solid #f0f0f0", padding: "12px 14px 14px 14px", background: eJuridico ? "#faf5ff" : "#fafafa" }}>

                {/* Banner jurídico */}
                {eJuridico && (
                  <div style={{ marginBottom: 12, padding: "10px 14px", background: "#ede9fe", borderRadius: 7, border: "1px solid #c4b5fd" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#5b21b6", marginBottom: 4 }}>
                      ⚖️ ATENÇÃO: Esta é uma cláusula jurídica/financeira do contrato
                    </div>
                    <div style={{ fontSize: 12, color: "#6d28d9", lineHeight: 1.5 }}>
                      Este item <strong>NÃO é um requisito do software</strong> — é uma obrigação contratual da empresa perante o órgão público. Precisa de ação do departamento jurídico/financeiro, não de desenvolvimento.
                    </div>
                  </div>
                )}

                {/* Banner desconhecido */}
                {interp.tipo === "desconhecido" && (
                  <div style={{ marginBottom: 12, padding: "10px 14px", background: "#fffbeb", borderRadius: 7, border: "1px solid #fcd34d" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#92400e", marginBottom: 4 }}>
                      🔍 Este item precisa de revisão manual
                    </div>
                    <div style={{ fontSize: 12, color: "#78350f", lineHeight: 1.5 }}>
                      O sistema identificou o trecho abaixo no contrato mas não reconheceu automaticamente a qual funcionalidade ele se refere. Leia o contexto completo no contrato original para determinar se o sistema já atende ou se é necessário desenvolver/documentar algo.
                    </div>
                  </div>
                )}

                {/* Justificativa da IA */}
                {item.justificativa && !eJuridico && (
                  <div style={{ marginBottom: 10, padding: "8px 12px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#888", marginBottom: 3 }}>🤖 ANÁLISE DA IA</div>
                    <p style={{ margin: 0, fontSize: 12, color: "#555", fontStyle: "italic", lineHeight: 1.5 }}>{item.justificativa}</p>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {/* O que significa */}
                  <div style={{ gridColumn: "1 / -1", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#666", marginBottom: 4 }}>
                      📋 O QUE ESTE ITEM SIGNIFICA — {interp.titulo}
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: "#333", lineHeight: 1.7, whiteSpace: "pre-line" }}>{interp.significado}</p>
                  </div>

                  {/* O que fazer */}
                  <div style={{ background: eJuridico ? "#f5f3ff" : interp.tipo === "desconhecido" ? "#fffbeb" : "#fff8e1", border: `1px solid ${eJuridico ? "#c4b5fd" : interp.tipo === "desconhecido" ? "#fcd34d" : "#ffe082"}`, borderRadius: 6, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: eJuridico ? "#5b21b6" : "#856404", marginBottom: 4 }}>
                      ✏️ O QUE PRECISA SER FEITO
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: eJuridico ? "#4c1d95" : "#6b4c00", lineHeight: 1.7, whiteSpace: "pre-line" }}>{interp.acao}</p>
                  </div>

                  {/* Onde */}
                  <div style={{ background: "#f0f4ff", border: "1px solid #c7d2fe", borderRadius: 6, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#3730a3", marginBottom: 4 }}>
                      📁 {eJuridico ? "QUEM DEVE TRATAR" : "ONDE DOCUMENTAR"}
                    </div>
                    <code style={{ fontSize: 11, color: "#1e40af", wordBreak: "break-all" }}>{interp.onde}</code>
                    {item.referenciaDoc && item.status === "parcial" && !eJuridico && (
                      <div style={{ marginTop: 6, fontSize: 11, color: "#555" }}>
                        Referência parcial em: <span style={{ color: "#2563eb" }}>{item.referenciaDoc}</span>
                      </div>
                    )}
                  </div>

                  {/* Impacto — só para funcional */}
                  {!eJuridico && (
                    <div style={{ gridColumn: "1 / -1", background: item.status === "nao_atendido" ? "#fff1f2" : "#fffbea", border: `1px solid ${item.status === "nao_atendido" ? "#fecaca" : "#ffe082"}`, borderRadius: 6, padding: "10px 12px" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: item.status === "nao_atendido" ? "#991b1b" : "#856404", marginBottom: 4 }}>
                        🏆 IMPACTO NA LICITAÇÃO
                      </div>
                      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: item.status === "nao_atendido" ? "#7f1d1d" : "#6b4c00" }}>
                        {item.status === "nao_atendido"
                          ? `Este requisito não possui cobertura na documentação do ${produto?.toUpperCase() || "sistema"}. A comissão técnica pode desclassificar a proposta por não comprovar atendimento. Ação urgente necessária.`
                          : `Cobertura parcial detectada. A documentação menciona o tema mas não detalha o atendimento específico. Isso pode gerar questionamentos da comissão durante a análise.`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#444",
  marginBottom: 5,
  marginTop: 14,
};

const inputStyle = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid #ccc",
  fontSize: 13,
  boxSizing: "border-box",
};
