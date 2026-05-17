import { useState, useEffect, useRef } from "react";
import { apiFetch } from "../services/api";

const PRODUTOS = [
  { value: "axhub",   label: "AxHub",   icon: "???",  cor: "#3b82f6" },
  { value: "axton",   label: "AxTon",   icon: "??",  cor: "#8b5cf6" },
  { value: "axcross", label: "AxCross", icon: "??",  cor: "#10b981" },
];

const STATUS_COR = {
  atendido:     { bg: "rgba(34,197,94,0.15)", texto: "#4ade80", label: "? Atendido" },
  parcial:      { bg: "rgba(245,158,11,0.15)", texto: "#fbbf24", label: "?? Parcial" },
  nao_atendido: { bg: "rgba(239,68,68,0.15)", texto: "#f87171", label: "? N�o Atendido" },
};

const VEREDICTO_COR = {
  APTO:               { bg: "rgba(34,197,94,0.15)", texto: "#4ade80", label: "? APTO" },
  PARCIALMENTE_APTO:  { bg: "rgba(245,158,11,0.15)", texto: "#fbbf24", label: "?? PARCIALMENTE APTO" },
  INAPTO:             { bg: "rgba(239,68,68,0.15)", texto: "#f87171", label: "? INAPTO" },
};

const ABAS = [
  { id: "lista",  label: "?? Relat�rios Gerados" },
  { id: "novo",   label: "? Novo Relat�rio" },
];

// Etapas visuais do progresso de an�lise
const ETAPAS = [
  { id: 1, label: "Extraindo texto",          descricao: "Processando o documento" },
  { id: 2, label: "Identificando requisitos", descricao: "Heur�stica + IA" },
  { id: 3, label: "Verificando cobertura",    descricao: "Keywords + GPT sem�ntico" },
  { id: 4, label: "Gerando justificativas",   descricao: "An�lise t�cnica via IA" },
];

export default function Conformidade() {
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

  // Formul�rio
  const [tituloEdital, setTituloEdital] = useState("");
  const [textoEdital, setTextoEdital]   = useState("");
  const [comIA, setComIA]               = useState(true);
  const [dragOver, setDragOver]         = useState(false);
  const [extraindo, setExtraindo]       = useState(false);
  const [infoArquivo, setInfoArquivo]   = useState(null); // { nome, palavras, chars }

  useEffect(() => { carregarLista(); }, [produto]);

  // Pr�-preenche se veio de "Fontes de Pesquisa ? ?? Conformidade" (s� no mount)
  useEffect(() => {
    const preload = sessionStorage.getItem("conformidade_preload");
    if (!preload) return;
    try {
      const { titulo, conteudo, produto: prodPreload } = JSON.parse(preload);
      if (titulo)      setTituloEdital(titulo);
      if (conteudo)    setTextoEdital(conteudo);
      if (prodPreload) setProduto(prodPreload);
      setAba("novo");
      setInfoArquivo({
        nome: titulo || "Documento importado",
        palavras: (conteudo || "").split(/\s+/).filter(Boolean).length,
        chars: (conteudo || "").length,
      });
    } catch { /* ignora dados corrompidos */ }
    sessionStorage.removeItem("conformidade_preload");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function carregarLista() {
    setCarregando(true);
    setSelecionado(null);
    try {
      const r = await apiFetch(`/conformidade?produto=${produto}`);
      const d = await r.json();
      setLista(d.lista || []);
    } catch { setMsg("Erro ao carregar relat�rios."); }
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

  // -- Upload de arquivo (PDF/DOCX/TXT/imagem) ------------------
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
        setMsg(`? Erro ao extrair arquivo: ${e.erro}`);
        return;
      }
      const d = await r.json();
      setTextoEdital(d.texto);
      if (!tituloEdital) setTituloEdital(file.name.replace(/\.[^.]+$/, ""));
      setInfoArquivo({ nome: d.nomeArquivo, palavras: d.palavrasExtraidas, chars: d.caracteres });
    } catch {
      setMsg("? Erro ao processar o arquivo. Verifique se a API est� rodando.");
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

  // -- Gerar relat�rio com progresso por etapas -----------------
  async function gerarRelatorio() {
    if (!textoEdital.trim()) { setMsg("?? Cole o texto do edital ou fa�a upload de um arquivo."); return; }
    setGerando(true);
    setMsg("");
    setEtapaAtual(1);

    // Simula progresso das etapas com base no tempo esperado
    // Etapa 1 e 2 avan�am rapidamente, 3 e 4 dependem da IA
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
          tituloEdital: tituloEdital || "Edital sem t�tulo",
          textoEdital,
          comJustificativas: comIA,
        }),
      });
      timers.forEach(clearTimeout);
      const d = await r.json();
      if (!r.ok) {
        setMsg(`? Erro: ${d.erro}`);
        setEtapaAtual(0);
      } else {
        setEtapaAtual(5); // conclu�do
        const { stats } = d;
        setMsg(`? Relat�rio gerado � ${stats.total} requisitos analisados. Conformidade: ${stats.percentual}% (${VEREDICTO_COR[stats.veredicto]?.label}).`);
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
      setMsg("? Erro ao conectar com a API.");
      setEtapaAtual(0);
    }
    setGerando(false);
  }

  async function removerRelatorio(id, e) {
    e.stopPropagation();
    if (!confirm("Remover este relat�rio?")) return;
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
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">?? Conformidade com Editais</h2>
        <span className="page-subtitle">
          Analisa se o sistema atende os requisitos de um edital ou Termo de Refer�ncia para licita��o.
        </span>
      </div>

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
          background: msg.startsWith("?") ? "rgba(34,197,94,0.15)" : msg.startsWith("?") ? "rgba(59,130,246,0.15)" : "rgba(239,68,68,0.15)",
          borderRadius: 6,
          marginBottom: 14,
          fontSize: 13,
          color: msg.startsWith("?") ? "#4ade80" : msg.startsWith("?") ? "#60a5fa" : "#f87171",
        }}>{msg}</div>
      )}

      {/* -- ABA: NOVO RELAT�RIO -- */}
      {aba === "novo" && (
        <div style={{ maxWidth: 820 }}>
          <div style={{ background: "#f8f9fc", border: "1px solid #dde", borderRadius: 10, padding: 24, marginBottom: 20 }}>
            <h4 style={{ margin: "0 0 16px", fontSize: 15 }}>
              Novo Relat�rio de Conformidade � {produto.toUpperCase()}
            </h4>

            {/* -- Upload de arquivo -- */}
            <label style={labelStyle}>
              ?? Upload do Edital / Termo de Refer�ncia{" "}
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
                <span style={{ color: "#2563eb", fontSize: 13 }}>? Extraindo texto do arquivo...</span>
              ) : infoArquivo ? (
                <div style={{ fontSize: 13 }}>
                  <span style={{ color: "#155724", fontWeight: 600 }}>? {infoArquivo.nome}</span>
                  <span style={{ color: "#888", marginLeft: 10 }}>
                    {infoArquivo.palavras.toLocaleString("pt-BR")} palavras � {infoArquivo.chars.toLocaleString("pt-BR")} chars
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); setInfoArquivo(null); setTextoEdital(""); }}
                    style={{ marginLeft: 12, background: "none", border: "none", color: "#e34c4c", cursor: "pointer", fontSize: 13 }}
                  >? remover</button>
                </div>
              ) : (
                <span style={{ color: "#888", fontSize: 13 }}>
                  Arraste um arquivo aqui ou <strong style={{ color: "#2563eb" }}>clique para selecionar</strong>
                  <br />
                  <small>PDF, DOCX, TXT � OCR autom�tico para imagens e PDFs escaneados</small>
                </span>
              )}
            </div>

            {/* -- T�tulo do edital -- */}
            <label style={labelStyle}>T�tulo do Edital / TR</label>
            <input
              value={tituloEdital}
              onChange={e => setTituloEdital(e.target.value)}
              placeholder="Ex: Preg�o Eletr�nico n� 032/2026 � DETRAN-SP"
              style={inputStyle}
            />

            {/* -- Texto (pode ser preenchido pelo upload ou manualmente) -- */}
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
              placeholder={"Cole aqui o texto do edital ou fa�a o upload acima...\n\nExemplo:\n1. O sistema deve registrar infra��es de tr�nsito.\n2. O software dever� emitir relat�rios por per�odo.\na) Permitir exporta��o em Excel.\n..."}
              rows={10}
              style={{ ...inputStyle, fontFamily: "monospace", fontSize: 12, resize: "vertical" }}
            />

            {/* -- Op��es -- */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
              <input
                type="checkbox"
                id="comIA"
                checked={comIA}
                onChange={e => setComIA(e.target.checked)}
                style={{ width: 15, height: 15 }}
              />
              <label htmlFor="comIA" style={{ fontSize: 13, color: "#555", cursor: "pointer" }}>
                Gerar justificativas t�cnicas via IA{" "}
                <span style={{ color: "#888" }}>(recomendado � requer OpenAI)</span>
              </label>
            </div>

            {/* -- Indicador de progresso por etapas -- */}
            {gerando && etapaAtual > 0 && (
              <div style={{ marginTop: 18, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "14px 16px" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 10 }}>
                  An�lise em andamento...
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
                          {status === "done" ? "?" : etapa.id}
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
              {gerando ? "? Analisando..." : "?? Gerar Relat�rio de Conformidade"}
            </button>
          </div>

          <div style={{ background: "#fffbea", border: "1px solid #ffe082", borderRadius: 8, padding: "12px 16px", fontSize: 12, color: "#6b4c00" }}>
            <strong>?? Como funciona:</strong> O sistema extrai os requisitos do texto colado e cruza com toda a documenta��o do {produto.toUpperCase()} (
            {produto === "axhub" ? "14 m�dulos documentados" : produto === "axton" ? "portal AxTon" : "portal AxCross"}).
            Cada requisito recebe o status{" "}
            <strong>Atendido</strong> (documentado com alta cobertura),{" "}
            <strong>Parcial</strong> (documenta��o parcial) ou{" "}
            <strong>N�o Atendido</strong> (sem cobertura na documenta��o).
          </div>
        </div>
      )}

      {/* -- ABA: LISTA -- */}
      {aba === "lista" && (
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          {/* Lista lateral */}
          <div style={{ width: 320, flexShrink: 0, border: "1px solid #dde", borderRadius: 8, overflow: "hidden" }}>
            {carregando && !selecionado && (
              <p style={{ padding: 12, color: "#888", fontSize: 13 }}>Carregando...</p>
            )}
            {!carregando && lista.length === 0 && (
              <div style={{ padding: 32, textAlign: "center", color: "#aaa" }}>
                <p style={{ fontSize: 36 }}>??</p>
                <p style={{ fontSize: 13 }}>Nenhum relat�rio gerado ainda.</p>
                <button
                  onClick={() => setAba("novo")}
                  style={{ marginTop: 8, padding: "7px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}
                >
                  ? Gerar primeiro relat�rio
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
                    >�</button>
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
                <p style={{ fontSize: 40 }}>??</p>
                <p style={{ fontSize: 14 }}>Selecione um relat�rio para ver os detalhes.</p>
              </div>
            )}
            {carregando && <p style={{ padding: 20, color: "#888" }}>Carregando...</p>}

            {selecionado && !carregando && (
              <div>
                {/* Cabe�alho do relat�rio */}
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

                  {/* Estat�sticas */}
                  <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
                    {[
                      { label: "? Atendidos",    val: selecionado.atendidos,    bg: "#d4edda", txt: "#155724" },
                      { label: "?? Parciais",     val: selecionado.parciais,     bg: "#fff3cd", txt: "#856404" },
                      { label: "? N�o Atendidos", val: selecionado.naoAtendidos, bg: "#f8d7da", txt: "#721c24" },
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
                    { id: "atendido",     label: "? Atendidos" },
                    { id: "parcial",      label: "?? Parciais" },
                    { id: "nao_atendido", label: "? N�o Atendidos" },
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
    </div>
  );
}

// --------------------------------------------------
// COMPONENTE: Lista de Requisitos expand�vel
// --------------------------------------------------
const COR_BORDA = { atendido: "#27ae60", parcial: "#f39c12", nao_atendido: "#e74c3c" };

/**
 * Classifica o tipo de requisito e retorna interpreta��o contextual.
 * Retorna null se for uma cl�usula jur�dica/financeira que n�o � requisito do software.
 */
function interpretarRequisito(requisito) {
  const r = (requisito || "").toLowerCase();

  // -- CL�USULAS JUR�DICAS/FINANCEIRAS ----------------------------------
  // Estas s�o obriga��es contratuais DA EMPRESA (n�o do software).
  // O sistema de conformidade n�o deve avaliar estas � s�o o departamento jur�dico/financeiro que cuida.
  if (/seguro[\s-]garantia|ap[o�]lice|cauc[�i]o|garantia\s+(em\s+dinheiro|contratual|financeira)|t[�i]tulo\s+da\s+d[�i]vida|fundo\s+de\s+garantia/i.test(r))
    return {
      tipo: "juridico",
      titulo: "Garantia Contratual (responsabilidade jur�dica)",
      significado: `Este item � uma CL�USULA DE GARANTIA FINANCEIRA do contrato, n�o um requisito do software. Significa que sua empresa precisa apresentar um "seguro-garantia" ou cau��o (em dinheiro, t�tulo ou ap�lice de seguro) equivalente a um percentual do valor do contrato.\n\nIsso � uma exig�ncia para a EMPRESA, n�o para o sistema em si.`,
      acao: "Solicite ao setor jur�dico/financeiro que emita a garantia contratual no valor e modalidade exigidos. Isso geralmente � feito antes ou no ato da assinatura do contrato.",
      onde: "Departamento Jur�dico / Financeiro da empresa",
      urgencia: "Alta",
    };

  if (/foro\s+(eleito|competente)|comarca|na\s+comarca|tribunal/i.test(r))
    return {
      tipo: "juridico",
      titulo: "Foro Jur�dico (cl�usula de local para processos)",
      significado: "Define em qual cidade/tribunal ser�o resolvidos eventuais conflitos judiciais. � uma cl�usula padr�o de contratos e N�O � um requisito t�cnico do software.",
      acao: "Nenhuma a��o t�cnica necess�ria. Esta cl�usula � aceita automaticamente ao assinar o contrato.",
      onde: "Contrato (cl�usula padr�o)",
      urgencia: "Baixa",
    };

  if (/rescis[a�]o\s+(unilateral|contratual)|rescis�o\s+do\s+contrato/i.test(r))
    return {
      tipo: "juridico",
      titulo: "Rescis�o Contratual",
      significado: "Define as condi��es em que o contrato pode ser rescindido por qualquer das partes. � uma cl�usula jur�dica padr�o, N�O um requisito do software.",
      acao: "Nenhuma a��o t�cnica necess�ria. Revise com o jur�dico se as condi��es de rescis�o s�o aceit�veis para sua empresa.",
      onde: "Departamento Jur�dico",
      urgencia: "Baixa",
    };

  if (/penalidade|san[�c][a�]o\s+administrativa|multa\s+contratual|notifica��o\s+pr�via/i.test(r))
    return {
      tipo: "juridico",
      titulo: "Penalidades / San��es Administrativas",
      significado: "Define as multas e san��es que sua empresa pode sofrer caso descumpra prazos ou cl�usulas. � uma cl�usula jur�dica, N�O um requisito t�cnico do software.",
      acao: "Revise com o jur�dico os prazos e obriga��es para evitar multas. Garanta que os SLAs acordados sejam cumpridos.",
      onde: "Departamento Jur�dico",
      urgencia: "M�dia",
    };

  if (/reajuste|equil[�i]brio\s+econ[o�]mico|reequil[�i]brio|[�i]ndice\s+de\s+reajuste/i.test(r))
    return {
      tipo: "juridico",
      titulo: "Reajuste de Valores",
      significado: "Define como o valor do contrato ser� corrigido ao longo do tempo (ex: IPCA, INPC). � uma cl�usula financeira, N�O um requisito t�cnico.",
      acao: "Verifique com o financeiro se o �ndice de reajuste previsto � adequado para cobrir os custos ao longo do contrato.",
      onde: "Departamento Financeiro",
      urgencia: "Baixa",
    };

  if (/dota��o\s+or�ament|empenho|nota\s+de\s+empenho|subconta|programa[�c][a�]o\s+or�ament/i.test(r))
    return {
      tipo: "juridico",
      titulo: "Dota��o Or�ament�ria / Empenho",
      significado: "Indica de qual verba or�ament�ria o pagamento ser� feito. � uma cl�usula administrativa do �rg�o contratante, N�O um requisito do software.",
      acao: "Nenhuma a��o t�cnica necess�ria. O empenho � feito pelo �rg�o p�blico contratante.",
      onde: "Setor financeiro do �rg�o contratante",
      urgencia: "Baixa",
    };

  if (/ordem\s+de\s+servi[�c]o|aceite\s+(definitivo|provis[o�]rio)|recebimento\s+(definitivo|provis[o�]rio)/i.test(r))
    return {
      tipo: "juridico",
      titulo: "Processo de Aceite / Recebimento",
      significado: "Define como o �rg�o p�blico vai formalizar o recebimento do sistema (provis�rio = entrega inicial; definitivo = ap�s per�odo de uso sem problemas). N�O � um requisito t�cnico do software em si.",
      acao: "Garanta que os crit�rios de aceite estejam claros na proposta: o que ser� entregue, em qual prazo e quais funcionalidades estar�o dispon�veis no aceite provis�rio e definitivo.",
      onde: "Proposta t�cnica � Se��o de Entregas e Aceite",
      urgencia: "M�dia",
    };

  // -- REQUISITOS T�CNICOS DO SOFTWARE ----------------------------------

  if (/objeto\s*(da|do)\s*(contrata|aquisi|presta)|escopo\s*(do\s*)?sistema|finalidade\s*(do|da)\s*(solu|sistema|softwre)/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Objeto / Escopo do Sistema",
      significado: "O contrato precisa que o sistema atenda ao prop�sito central descrito: o que o software faz, para quem e qual problema resolve. A documenta��o deve deixar claro que o sistema cumpre exatamente o escopo contratado.",
      acao: "Crie ou atualize a p�gina de Vis�o Geral do sistema descrevendo: o que o sistema faz, os m�dulos principais, para quais �rg�os/opera��es foi desenvolvido.",
      onde: "docs/primeiros-passos/visao-geral.md",
      urgencia: "Alta",
    };

  if (/integra[�c][a�]o|integrar\s+(com|ao)|api\s+rest|webservice|web\s+service|interoperabilidade/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Integra��o com outros sistemas",
      significado: "O contrato exige que o software se comunique com outro sistema do governo ou plataforma (ex: SINESP, RENAINF, DETRAN, DENATRAN, SENATRAN, sistema municipal).",
      acao: "Documente quais integra��es j� existem: nome do sistema, tipo de comunica��o (API REST, arquivo, web service), dados trocados e periodicidade.",
      onde: "docs/referencia-tecnica/integracoes.md",
      urgencia: "Alta",
    };

  if (/relat[o�]rio|exporta[�c][a�]o|excel|pdf\s+do\s+relat|dashboard|painel\s+gerencial/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Relat�rios e Exporta��o de Dados",
      significado: "O contrato exige que o sistema gere relat�rios gerenciais, estat�sticos ou operacionais. Tamb�m pode exigir exporta��o em formatos espec�ficos (PDF, Excel, CSV).",
      acao: "Liste todos os relat�rios dispon�veis. Para cada um: nome, descri��o, filtros dispon�veis, formatos de exporta��o. Inclua screenshots.",
      onde: "docs/relatorios/",
      urgencia: "M�dia",
    };

  if (/usu[�a]rio|acesso|login|senha|permiss[a�]o|perfil\s+de\s+acesso|hierarquia|controle\s+de\s+acesso/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Controle de Acesso e Perfis de Usu�rio",
      significado: "O sistema precisa controlar quem pode acessar o qu�. Diferentes usu�rios t�m diferentes permiss�es (ex: operador v� s� seu posto; gestor v� todos).",
      acao: "Documente os perfis de acesso existentes (ex: Administrador, Operador, Fiscalizador), o que cada perfil pode fazer e como criar/gerenciar usu�rios.",
      onde: "docs/controle-acesso/",
      urgencia: "M�dia",
    };

  if (/pesagem|peso|balan[�c]a|tara|eixo|excesso\s+de\s+carga|peso\s+bruto\s+total/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Controle de Pesagem Veicular",
      significado: "O contrato exige que o sistema realize pesagem de ve�culos, calcule excesso de carga por eixo, gere auto de infra��o por sobrepeso e registre tudo digitalmente.",
      acao: "Documente: fluxo completo de uma pesagem, limites legais por tipo de eixo, como � gerado o auto de infra��o por excesso, relat�rios de pesagens.",
      onde: "docs/pesagem/",
      urgencia: "Alta",
    };

  if (/infra[�c][a�]o\s+de\s+tr[�a]nsito|auto\s+de\s+infra[�c][a�]o|autu[ao][�rc][a�]o|notifica[�c][a�]o\s+de\s+infra[�c][a�]o|ait\b|renainf|sinaut/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Registro de Infra��es de Tr�nsito",
      significado: "O sistema deve ser capaz de registrar infra��es de tr�nsito, gerar AITs (Autos de Infra��o de Tr�nsito), enviar para o RENAINF e gerenciar o ciclo completo da infra��o.",
      acao: "Documente: tipos de infra��o suportados, fluxo de gera��o do AIT, integra��o com RENAINF, processo de notifica��o ao infrator, recursos e cancelamentos.",
      onde: "docs/infracoes/",
      urgencia: "Alta",
    };

  if (/suporte\s+t[e�]cnico|atendimento\s+t[e�]cnico|sla|prazo\s+de\s+atend|tempo\s+de\s+resposta|chamado/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Suporte T�cnico e SLA",
      significado: "O contrato define prazos m�ximos para sua empresa responder e resolver problemas t�cnicos. Cada tipo de problema tem um prazo diferente (cr�tico = horas; baixo = dias).",
      acao: "Elabore um documento de SLA com: categorias de chamado (cr�tico/alto/m�dio/baixo), tempo m�ximo de resposta e resolu��o para cada categoria, canais de atendimento dispon�veis.",
      onde: "Proposta t�cnica � Anexo de SLA",
      urgencia: "Alta",
    };

  if (/treinamento|capacita[�c][a�]o|instru[�c][a�]o\s+(de\s+uso|t[e�]cnica)|curso\s+de\s+opera[�c][a�]o/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Treinamento dos Usu�rios",
      significado: "O contrato exige que sua empresa capacite os funcion�rios do �rg�o a usar o sistema. Inclui definir carga hor�ria, metodologia e material de apoio.",
      acao: "Elabore um Plano de Capacita��o com: carga hor�ria (ex: 16h), modalidade (presencial/remoto), p�blico-alvo, conte�do program�tico, material did�tico a entregar.",
      onde: "Proposta t�cnica � Plano de Treinamento / Implanta��o",
      urgencia: "M�dia",
    };

  if (/lgpd|lei\s+geral\s+de\s+prote[�c][a�]o|dado\s+pessoal|privacidade|tratamento\s+de\s+dados|anonimiza[�c][a�]o/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Conformidade com a LGPD",
      significado: "O contrato exige que o software trate dados pessoais de acordo com a Lei Geral de Prote��o de Dados (LGPD � Lei 13.709/2018): consentimento, finalidade, seguran�a e direitos do titular.",
      acao: "Documente: quais dados pessoais o sistema coleta, com qual finalidade, por quanto tempo s�o retidos, como s�o protegidos, como o titular pode solicitar exclus�o.",
      onde: "docs/referencia-tecnica/lgpd.md",
      urgencia: "Alta",
    };

  if (/criptograf|https|ssl|tls|certificado\s+digital|vpn|firewall|log\s+de\s+auditoria|trilha\s+de\s+auditoria/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Seguran�a da Informa��o",
      significado: "O contrato exige que o sistema use criptografia, HTTPS, certificado digital ou mantenha logs de auditoria (trilha de quem fez o qu� e quando).",
      acao: "Documente: protocolos de seguran�a usados (HTTPS/TLS), controle de sess�o, log de auditoria (quais a��es s�o registradas), pol�tica de backup.",
      onde: "docs/referencia-tecnica/seguranca.md",
      urgencia: "Alta",
    };

  if (/aferi[�c][a�]o|calibra[�c][a�]o|inmetro|certifica[�c][a�]o\s+do\s+equipamento|equipamento\s+aprovado/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Aferi��o e Certifica��o de Equipamentos",
      significado: "O edital exige que os equipamentos f�sicos (balan�as, radares, sensores) tenham certificado de aferi��o vigente pelo INMETRO, comprovando que medem com precis�o.",
      acao: "Anexe os certificados de aferi��o v�lidos de cada equipamento. Documente o processo de re-aferi��o peri�dica e quem � respons�vel por solicit�-la.",
      onde: "Proposta t�cnica � Anexo de Equipamentos",
      urgencia: "Alta",
    };

  if (/implanta[�c][a�]o|instala[�c][a�]o\s+do\s+sistema|configura[�c][a�]o\s+do\s+ambiente|migra[�c][a�]o\s+de\s+dados/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Processo de Implanta��o",
      significado: "O contrato define como o sistema ser� colocado em opera��o no �rg�o: quem instala, em quanto tempo, como os dados antigos s�o migrados e quando come�a a operar.",
      acao: "Elabore um Plano de Implanta��o com: cronograma de entrega (fases), equipe respons�vel, depend�ncias do cliente (infraestrutura, acesso), processo de homologa��o.",
      onde: "Proposta t�cnica � Plano de Implanta��o",
      urgencia: "M�dia",
    };

  if (/disponibilidade|uptime|indisponibilidade|janela\s+de\s+manuten[�c][a�]o|24\s*(h|horas)|7\s*dias/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Disponibilidade do Sistema",
      significado: "O contrato define um percentual m�nimo de tempo que o sistema deve estar funcionando (ex: 99,5% de uptime). Quedas al�m do permitido geram multas.",
      acao: "Informe na proposta t�cnica: percentual de uptime garantido, janela de manuten��o programada (quando o sistema pode ficar fora do ar), monitoramento utilizado.",
      onde: "Proposta t�cnica � Anexo de SLA / Disponibilidade",
      urgencia: "Alta",
    };

  if (/backup|c[o�]pia\s+de\s+seguran[�c]a|recupera[�c][a�]o\s+de\s+dados|rpo|rto/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Backup e Recupera��o de Dados",
      significado: "O contrato exige que o sistema fa�a c�pias de seguran�a peri�dicas dos dados e que seja poss�vel restaur�-los em caso de falha.",
      acao: "Documente a pol�tica de backup: frequ�ncia (di�rio/semanal), reten��o (por quanto tempo guarda), tipo (incremental/completo), tempo m�ximo de restaura��o.",
      onde: "docs/referencia-tecnica/backup.md",
      urgencia: "Alta",
    };

  if (/monitoramento|fiscaliza[�c][a�]o\s+eletr[o�]nica|video|imagem|c[�a]mera|ocr\s+de\s+placa|reconhecimento\s+de\s+placa/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Monitoramento e Fiscaliza��o Eletr�nica",
      significado: "O sistema deve capturar imagens de ve�culos, reconhecer placas (OCR), registrar passagens e cruzar com bases de dados (RENAVAM, SINESP) automaticamente.",
      acao: "Documente: c�meras suportadas, processo de captura e OCR de placa, integra��o com bases externas, tempo de reten��o das imagens.",
      onde: "docs/operacoes/monitoramento.md",
      urgencia: "Alta",
    };

  if (/cronotac[o�]grafo|jornada\s+de\s+trabalho\s+do\s+motorista|disco\s+(diagrama|tacogr[�a]fico)|tempo\s+de\s+direc[�c][a�]o/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Controle de Cronotac�grafo",
      significado: "O sistema deve controlar o uso do cronotac�grafo pelos motoristas: verificar se o disco est� correto, calcular tempo de dire��o/descanso e gerar infra��es por viola��es.",
      acao: "Documente: tipos de cronotac�grafo suportados (anal�gico/digital), como � feita a leitura do disco, c�lculo de jornada, gera��o de auto por irregularidade.",
      onde: "docs/cronotacografo/",
      urgencia: "Alta",
    };

  if (/objeto\s+(do|da|deste|do\s+presente)\s+(instrumento|contrato|ajuste|termo)|contrata[�c][a�]o\s+de\s+(empresa|fornecedor|prestador)|presta[�c][a�]o\s+de\s+servi[�c]os/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Objeto / Finalidade do Contrato",
      significado: `Este item descreve o prop�sito central do contrato � ou seja, o que foi contratado, para que serve e qual � a miss�o principal do sistema.\n\nTrecho: "${requisito}"\n\nA documenta��o deve deixar claro que o sistema entrega exatamente o que foi contratado.`,
      acao: "Garanta que a documenta��o do sistema descreva claramente: o que o software faz, quais problemas resolve, quais �rg�os/setores atende e quais s�o suas funcionalidades centrais.",
      onde: "docs/primeiros-passos/visao-geral.md",
      urgencia: "Alta",
    };

  if (/prazo\s+(de\s+entrega|de\s+execu[�c][a�]o|de\s+vig�ncia|contratual)|vig�ncia\s+do\s+contrato|execu[�c][a�]o\s+do\s+objeto/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Prazos de Execu��o / Vig�ncia",
      significado: `Define quando o sistema precisa estar entregue e por quanto tempo o contrato � v�lido.\n\nTrecho: "${requisito}"\n\nO n�o cumprimento dos prazos pode gerar multas contratuais.`,
      acao: "Elabore um cronograma de entregas compat�vel com o prazo contratual. Inclua marcos: implanta��o, treinamento, aceite provis�rio e aceite definitivo.",
      onde: "Proposta t�cnica � Cronograma de Implanta��o",
      urgencia: "Alta",
    };

  if (/hardware|servidor|infraestrutura|hospedagem|data\s*center|nuvem|cloud|vm\b|m[�a]quina\s+virtual/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Infraestrutura / Hospedagem do Sistema",
      significado: `O contrato especifica onde e como o sistema deve ser hospedado: servidores f�sicos, nuvem (cloud), m�quina virtual ou data center do �rg�o.\n\nTrecho: "${requisito}"\n\n� preciso documentar a arquitetura de infraestrutura usada.`,
      acao: "Documente a infraestrutura: tipo de hospedagem (nuvem/dedicado), especifica��es do servidor (CPU, RAM, armazenamento), redund�ncia, provedor utilizado.",
      onde: "docs/referencia-tecnica/infraestrutura.md",
      urgencia: "Alta",
    };

  if (/manual\s+(do\s+usu[�a]rio|de\s+opera[�c][a�]o|t[e�]cnico|de\s+instala[�c][a�]o)|documenta[�c][a�]o\s+t[e�]cnica|especifica[�c][a�]o\s+t[e�]cnica/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Documenta��o T�cnica / Manual do Sistema",
      significado: `O contrato exige que sua empresa entregue documenta��o formal do sistema � manuais, guias de opera��o ou especifica��o t�cnica.\n\nTrecho: "${requisito}"\n\nEssa documenta��o � entregue junto com o sistema e fica com o �rg�o.`,
      acao: "Produza a documenta��o exigida: manual do usu�rio com prints de tela, guia do administrador, documenta��o de instala��o/configura��o do ambiente.",
      onde: "docs/ (entreg�vel contratual)",
      urgencia: "M�dia",
    };

  if (/audit\s*log|registro\s+de\s+opera[�c][�o]es|hist[o�]rico\s+de\s+altera[�c][�o]es|rastreabilidade|quem\s+(acessou|alterou|excluiu)/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Auditoria e Rastreabilidade de A��es",
      significado: `O sistema precisa registrar tudo que os usu�rios fazem: quem acessou, o que alterou, quando e de qual IP. Isso garante rastreabilidade total das a��es.\n\nTrecho: "${requisito}"\n\nEssencial para controle de fraudes e auditorias externas.`,
      acao: "Documente o sistema de log de auditoria: quais a��es s�o registradas, por quanto tempo s�o retidos os logs, quem pode consult�-los e como export�-los.",
      onde: "docs/referencia-tecnica/auditoria.md",
      urgencia: "Alta",
    };

  if (/multiusu[�a]rio|m[u�]ltiplos\s+usu[�a]rios|acesso\s+simult[�a]neo|sess[a�]o\s+concorrente/i.test(r))
    return {
      tipo: "funcional",
      titulo: "M�ltiplos Usu�rios Simult�neos",
      significado: `O sistema deve ser capaz de atender v�rios usu�rios ao mesmo tempo sem perda de desempenho.\n\nTrecho: "${requisito}"\n\nIsso � um requisito de concorr�ncia e escalabilidade do sistema.`,
      acao: "Informe na proposta t�cnica: quantidade m�xima de usu�rios simult�neos suportados, resultado de testes de carga realizados, arquitetura que garante a concorr�ncia.",
      onde: "docs/referencia-tecnica/desempenho.md",
      urgencia: "M�dia",
    };

  if (/mobile|aplicativo\s+(m[o�]vel|android|ios)|app\b|celular|dispositivo\s+m[o�]vel|tablet/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Aplicativo Mobile",
      significado: `O contrato exige uma vers�o mobile do sistema (app para Android/iOS ou aplicativo para tablets/celulares usado em campo).\n\nTrecho: "${requisito}"\n\nSe n�o houver app, � preciso documentar como a opera��o mobile � suprida (ex: site responsivo).`,
      acao: "Documente se h� app mobile dispon�vel: plataformas (Android/iOS), funcionalidades dispon�veis no mobile, opera��o offline e sincroniza��o.",
      onde: "docs/operacoes/mobile.md",
      urgencia: "Alta",
    };

  if (/impress[a�]o|impressora|etiqueta|c[o�]digo\s+de\s+barras|qr\s*code|recibo|comprovante/i.test(r))
    return {
      tipo: "funcional",
      titulo: "Impress�o e Comprovantes",
      significado: `O sistema deve gerar documentos impressos: comprovantes, recibos, etiquetas, relat�rios f�sicos ou documentos com c�digo de barras/QR code.\n\nTrecho: "${requisito}"\n\nVerifique se o sistema j� tem essa funcionalidade de impress�o implementada.`,
      acao: "Documente quais documentos podem ser impressos, o layout padr�o, impressoras compat�veis e se h� impress�o de etiqueta/c�digo de barras.",
      onde: "docs/operacoes/impressao.md",
      urgencia: "M�dia",
    };

  // -- FALLBACK INTELIGENTE � analisa o texto para gerar explica��o �til --
  const extrairContexto = (texto) => {
    const t = texto.toLowerCase();
    const temas = [];
    if (/sistema|software|aplica[�c][a�]o|plataforma/.test(t)) temas.push("funcionalidade do sistema");
    if (/dados|banco\s+de\s+dados|registro|informa[�c][a�]o/.test(t)) temas.push("gest�o de dados");
    if (/usu[�a]rio|operador|fiscaliz|funcion[�a]rio/.test(t)) temas.push("usu�rios do sistema");
    if (/prazo|data|cronograma|entrega/.test(t)) temas.push("prazos e entregas");
    if (/relat[o�]rio|consulta|pesquisa|visualiza/.test(t)) temas.push("consultas e relat�rios");
    if (/configura|par�metro|parametriza|personaliz/.test(t)) temas.push("configura��o do sistema");
    if (/notifica|alerta|aviso|mensagem/.test(t)) temas.push("notifica��es e alertas");
    if (/importa|exporta|arquivo|planilha/.test(t)) temas.push("importa��o/exporta��o de dados");
    if (/processo|fluxo|workflow|aprova[�c][a�]o/.test(t)) temas.push("fluxo de processos");
    if (/contrato|licita��o|edital|proposta/.test(t)) temas.push("contexto contratual/licitat�rio");
    return temas.length > 0
      ? `Com base nos termos encontrados, este item parece ser sobre: **${temas.join(", ")}**.`
      : "N�o foi poss�vel identificar automaticamente o tema deste item.";
  };

  const contexto = extrairContexto(requisito);

  return {
    tipo: "desconhecido",
    titulo: "Requisito a revisar manualmente",
    significado: `${contexto}\n\nTrecho original do contrato:\n"${requisito}"\n\nEste item precisa de revis�o manual para confirmar se o sistema j� o atende e onde isso est� documentado.`,
    acao: "1. Leia o trecho completo no contrato para entender o contexto.\n2. Verifique se o sistema j� atende essa exig�ncia.\n3. Se atender: adicione documenta��o comprovando (prints, descri��o da funcionalidade).\n4. Se n�o atender: registre no roadmap como pend�ncia para a licita��o.",
    onde: "docs/ (identificar se��o correta ap�s an�lise manual)",
    urgencia: "M�dia",
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
        const corUrg    = interp?.urgencia === "Alta" ? "#e74c3c" : interp?.urgencia === "M�dia" ? "#f39c12" : "#27ae60";

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
                      ? `?? ${interp.titulo} � clique para entender`
                      : item.status === "nao_atendido"
                        ? "? Sem cobertura � clique para ver o que fazer"
                        : "?? Parcialmente coberto � clique para ver como completar"}
                  </span>
                )}
                {item.status === "atendido" && item.referenciaDoc && (
                  <span style={{ fontSize: 11, color: "#2563eb" }}>?? {item.referenciaDoc}</span>
                )}
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                {eJuridico && (
                  <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 10, background: "#ede9fe", color: "#6d28d9", fontWeight: 700 }}>
                    ?? Jur�dico
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
                  <span style={{ color: "#aaa", fontSize: 12 }}>{aberto ? "?" : "?"}</span>
                )}
              </div>
            </div>

            {/* Painel expandido */}
            {aberto && interp && (
              <div style={{ borderTop: "1px solid #f0f0f0", padding: "12px 14px 14px 14px", background: eJuridico ? "#faf5ff" : "#fafafa" }}>

                {/* Banner jur�dico */}
                {eJuridico && (
                  <div style={{ marginBottom: 12, padding: "10px 14px", background: "#ede9fe", borderRadius: 7, border: "1px solid #c4b5fd" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#5b21b6", marginBottom: 4 }}>
                      ?? ATEN��O: Esta � uma cl�usula jur�dica/financeira do contrato
                    </div>
                    <div style={{ fontSize: 12, color: "#6d28d9", lineHeight: 1.5 }}>
                      Este item <strong>N�O � um requisito do software</strong> � � uma obriga��o contratual da empresa perante o �rg�o p�blico. Precisa de a��o do departamento jur�dico/financeiro, n�o de desenvolvimento.
                    </div>
                  </div>
                )}

                {/* Banner desconhecido */}
                {interp.tipo === "desconhecido" && (
                  <div style={{ marginBottom: 12, padding: "10px 14px", background: "#fffbeb", borderRadius: 7, border: "1px solid #fcd34d" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#92400e", marginBottom: 4 }}>
                      ?? Este item precisa de revis�o manual
                    </div>
                    <div style={{ fontSize: 12, color: "#78350f", lineHeight: 1.5 }}>
                      O sistema identificou o trecho abaixo no contrato mas n�o reconheceu automaticamente a qual funcionalidade ele se refere. Leia o contexto completo no contrato original para determinar se o sistema j� atende ou se � necess�rio desenvolver/documentar algo.
                    </div>
                  </div>
                )}

                {/* Justificativa da IA */}
                {item.justificativa && !eJuridico && (
                  <div style={{ marginBottom: 10, padding: "8px 12px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#888", marginBottom: 3 }}>?? AN�LISE DA IA</div>
                    <p style={{ margin: 0, fontSize: 12, color: "#555", fontStyle: "italic", lineHeight: 1.5 }}>{item.justificativa}</p>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {/* O que significa */}
                  <div style={{ gridColumn: "1 / -1", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#666", marginBottom: 4 }}>
                      ?? O QUE ESTE ITEM SIGNIFICA � {interp.titulo}
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: "#333", lineHeight: 1.7, whiteSpace: "pre-line" }}>{interp.significado}</p>
                  </div>

                  {/* O que fazer */}
                  <div style={{ background: eJuridico ? "#f5f3ff" : interp.tipo === "desconhecido" ? "#fffbeb" : "#fff8e1", border: `1px solid ${eJuridico ? "#c4b5fd" : interp.tipo === "desconhecido" ? "#fcd34d" : "#ffe082"}`, borderRadius: 6, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: eJuridico ? "#5b21b6" : "#856404", marginBottom: 4 }}>
                      ?? O QUE PRECISA SER FEITO
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: eJuridico ? "#4c1d95" : "#6b4c00", lineHeight: 1.7, whiteSpace: "pre-line" }}>{interp.acao}</p>
                  </div>

                  {/* Onde */}
                  <div style={{ background: "#f0f4ff", border: "1px solid #c7d2fe", borderRadius: 6, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#3730a3", marginBottom: 4 }}>
                      ?? {eJuridico ? "QUEM DEVE TRATAR" : "ONDE DOCUMENTAR"}
                    </div>
                    <code style={{ fontSize: 11, color: "#1e40af", wordBreak: "break-all" }}>{interp.onde}</code>
                    {item.referenciaDoc && item.status === "parcial" && !eJuridico && (
                      <div style={{ marginTop: 6, fontSize: 11, color: "#555" }}>
                        Refer�ncia parcial em: <span style={{ color: "#2563eb" }}>{item.referenciaDoc}</span>
                      </div>
                    )}
                  </div>

                  {/* Impacto � s� para funcional */}
                  {!eJuridico && (
                    <div style={{ gridColumn: "1 / -1", background: item.status === "nao_atendido" ? "#fff1f2" : "#fffbea", border: `1px solid ${item.status === "nao_atendido" ? "#fecaca" : "#ffe082"}`, borderRadius: 6, padding: "10px 12px" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: item.status === "nao_atendido" ? "#991b1b" : "#856404", marginBottom: 4 }}>
                        ?? IMPACTO NA LICITA��O
                      </div>
                      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: item.status === "nao_atendido" ? "#7f1d1d" : "#6b4c00" }}>
                        {item.status === "nao_atendido"
                          ? `Este requisito n�o possui cobertura na documenta��o do ${produto?.toUpperCase() || "sistema"}. A comiss�o t�cnica pode desclassificar a proposta por n�o comprovar atendimento. A��o urgente necess�ria.`
                          : `Cobertura parcial detectada. A documenta��o menciona o tema mas n�o detalha o atendimento espec�fico. Isso pode gerar questionamentos da comiss�o durante a an�lise.`}
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
