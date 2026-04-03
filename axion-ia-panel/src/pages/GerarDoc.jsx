import { useState, useEffect, useRef } from "react";

const API = "http://localhost:3100/api";

const PRODUTOS = [
  { value: "axhub", label: "AxHub — Sistema de Trânsito" },
  { value: "axton", label: "AxTon — Sistema de Pesagem" },
  { value: "axcross", label: "AxCross — Monitoramento de Cruzamentos" },
];

const TIPOS = [
  "Guia Analítico",
  "Manual do Usuário",
  "Tutorial Passo a Passo",
  "Referência Rápida",
  "Guia de Configuração",
  "Procedimento Operacional",
];

export default function GerarDoc() {
  const [form, setForm] = useState({
    produto: "axhub",
    tema: "",
    secao: "",
    tipo: "Guia Analítico",
    detalhes: "",
    sidebar_position: 1,
  });

  const [secoes, setSecoes] = useState([]);
  const [gerando, setGerando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);
  const [mensagemSalvo, setMensagemSalvo] = useState(null);
  const [abaSelecionada, setAbaSelecionada] = useState("editor"); // "editor" | "preview"

  // Upload de arquivo de contexto
  const [arquivoContexto, setArquivoContexto] = useState(null); // { nome, texto, palavras }
  const [uploadando, setUploadando] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputFileRef = useRef(null);

  // Carrega as seções quando muda o produto
  useEffect(() => {
    setForm((f) => ({ ...f, secao: "" }));
    fetch(`${API}/doc/secoes/${form.produto}`)
      .then((r) => r.json())
      .then((d) => setSecoes(d.secoes || []))
      .catch(() => setSecoes([]));
  }, [form.produto]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErro(null);
    setMensagemSalvo(null);
  }

  async function handleArquivo(file) {
    if (!file) return;
    setUploadando(true);
    setErro(null);
    try {
      const fd = new FormData();
      fd.append("arquivo", file);
      const r = await fetch(`${API}/doc/upload-contexto`, { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) { setErro(d.erro || "Erro no upload."); return; }
      setArquivoContexto({ nome: d.nomeArquivo, texto: d.texto, palavras: d.palavrasExtraidas });
    } catch { setErro("Falha no upload do arquivo."); }
    setUploadando(false);
  }

  function handleDrop(e) {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleArquivo(file);
  }

  function removerArquivo() { setArquivoContexto(null); }

  async function handleGerar() {
    if (!form.tema.trim()) {
      setErro("Informe o tema do documento.");
      return;
    }
    if (!form.secao) {
      setErro("Selecione a seção do portal.");
      return;
    }

    setGerando(true);
    setErro(null);
    setResultado(null);
    setMensagemSalvo(null);

    try {
      // Concatena texto extraído do arquivo ao campo detalhes
      const payload = { ...form };
      if (arquivoContexto?.texto) {
        payload.detalhes = [
          form.detalhes || "",
          `\n\n--- Conteúdo extraído do arquivo "${arquivoContexto.nome}" ---\n`,
          arquivoContexto.texto,
        ].join("").trim();
      }

      const res = await fetch(`${API}/doc/gerar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro || "Erro ao gerar documento.");
        return;
      }

      setResultado(data);
      setAbaSelecionada(data.offline ? "editor" : "editor");
    } catch (e) {
      setErro("Falha de comunicação com a API. Verifique se o axion-ia-api está rodando.");
    } finally {
      setGerando(false);
    }
  }

  async function handleSalvar() {
    if (!resultado) return;

    setSalvando(true);
    setMensagemSalvo(null);
    setErro(null);

    try {
      const res = await fetch(`${API}/doc/salvar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conteudo: resultado.conteudo,
          produto: resultado.produto,
          secao: resultado.secao,
          nomeArquivo: resultado.nomeArquivo,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro || "Erro ao salvar no portal.");
        return;
      }

      setMensagemSalvo(data.mensagem);
    } catch (e) {
      setErro("Falha ao salvar: " + e.message);
    } finally {
      setSalvando(false);
    }
  }

  function handleCopiar() {
    if (!resultado) return;
    navigator.clipboard.writeText(resultado.conteudo);
  }

  function handleEditar(e) {
    setResultado((r) => ({ ...r, conteudo: e.target.value }));
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>📄 Gerar Documentação</h2>
        <p className="page-subtitle">
          Descreva o que deseja documentar e a AxionIA gera um material no padrão dos portais — com imagens, tabelas, checklists e admonitions.
        </p>
      </div>

      <div className="gerar-doc-layout">
        {/* Formulário */}
        <div className="gerar-doc-form card">
          <h3>Configurar o documento</h3>

          <div className="form-group">
            <label>Produto</label>
            <select name="produto" value={form.produto} onChange={handleChange}>
              {PRODUTOS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Seção no portal</label>
            <select name="secao" value={form.secao} onChange={handleChange}>
              <option value="">— Selecione —</option>
              {secoes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Tema / Título do documento</label>
            <input
              type="text"
              name="tema"
              value={form.tema}
              onChange={handleChange}
              placeholder="Ex: Manual de Auditoria, Como Exportar Infrações..."
            />
          </div>

          <div className="form-group">
            <label>Tipo de material</label>
            <select name="tipo" value={form.tipo} onChange={handleChange}>
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Posição na sidebar</label>
            <input
              type="number"
              name="sidebar_position"
              value={form.sidebar_position}
              onChange={handleChange}
              min={1}
              max={20}
            />
          </div>

          {/* Upload de arquivo de contexto */}
          <div className="form-group">
            <label>Arquivo de referência (opcional)</label>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputFileRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? "var(--accent,#4f8ef7)" : "var(--border,#333)"}`,
                borderRadius: 8, padding: "14px 12px", textAlign: "center", cursor: "pointer",
                background: dragOver ? "rgba(79,142,247,0.07)" : "transparent",
                transition: "all 0.2s",
              }}>
              {uploadando
                ? <span style={{ fontSize: 12, color: "#94a3b8" }}>⏳ Extraindo texto...</span>
                : arquivoContexto
                  ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left" }}>
                      <span style={{ fontSize: 12 }}>📎 <strong>{arquivoContexto.nome}</strong> — {arquivoContexto.palavras.toLocaleString("pt-BR")} palavras</span>
                      <button onClick={e => { e.stopPropagation(); removerArquivo(); }}
                        style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>✕</button>
                    </div>
                  )
                  : <span style={{ fontSize: 12, color: "#64748b" }}>📂 Arraste ou clique para anexar PDF, DOCX, XLSX, TXT<br/><small>A IA usará o conteúdo como contexto</small></span>
              }
              <input ref={inputFileRef} type="file" accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.txt,.md"
                style={{ display: "none" }} onChange={e => handleArquivo(e.target.files[0])} />
            </div>
          </div>

          <div className="form-group">
            <label>Contexto adicional (opcional)</label>
            <textarea
              name="detalhes"
              value={form.detalhes}
              onChange={handleChange}
              rows={4}
              placeholder="Descreva detalhes específicos: quem usa, casos especiais, campos importantes da tela, fluxo do processo..."
            />
          </div>

          {erro && (
            <div className="alert alert-error">
              <strong>⚠️ {erro}</strong>
            </div>
          )}

          <button className="btn btn-primary btn-full" onClick={handleGerar} disabled={gerando}>
            {gerando ? "⏳ Gerando documento..." : "✨ Gerar com AxionIA"}
          </button>

          <p className="hint-text">
            💡 Requer <strong>OPENAI_API_KEY</strong> configurada no .env
          </p>
        </div>

        {/* Resultado */}
        <div className="gerar-doc-result">
          {!resultado && !gerando && (
            <div className="card empty-state">
              <div className="empty-icon">📝</div>
              <p>
                Preencha o formulário ao lado e clique em <strong>Gerar com AxionIA</strong>.
              </p>
              <p className="text-muted">
                A IA vai criar um guia analítico completo com imagens, tabelas, checklists e fluxo do processo — pronto para o portal Docusaurus.
              </p>
            </div>
          )}

          {gerando && (
            <div className="card empty-state">
              <div className="loading-spinner" />
              <p>Gerando documento com AxionIA...</p>
              <p className="text-muted">Isso pode levar alguns segundos.</p>
            </div>
          )}

          {resultado && (
            <div className="card resultado-card">
              {/* Header do resultado */}
              <div className="resultado-header">
                <div className="resultado-info">
                  <span className={`badge ${resultado.offline ? "badge-yellow" : "badge-green"}`}>
                    {resultado.offline ? "⚠️ Template offline" : "✅ Gerado com IA"}
                  </span>
                  <span className="resultado-filename">📄 {resultado.nomeArquivo}</span>
                  <span className="text-muted">
                    {resultado.produto} / {resultado.secao}
                  </span>
                </div>
                <div className="resultado-actions">
                  <button className="btn btn-sm" onClick={handleCopiar}>
                    📋 Copiar
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={handleSalvar}
                    disabled={salvando}
                  >
                    {salvando ? "⏳ Salvando..." : "💾 Salvar no portal"}
                  </button>
                </div>
              </div>

              {mensagemSalvo && (
                <div className="alert alert-success">
                  ✅ {mensagemSalvo}
                </div>
              )}

              {resultado.offline && resultado.aviso && (
                <div className="alert alert-warning">
                  ✏️ <strong>Modo offline:</strong> {resultado.aviso}
                </div>
              )}

              {/* Abas Editor / Preview */}
              <div className="tab-bar">
                <button
                  className={`tab-btn ${abaSelecionada === "editor" ? "active" : ""}`}
                  onClick={() => setAbaSelecionada("editor")}
                >
                  Markdown Editor
                </button>
                <button
                  className={`tab-btn ${abaSelecionada === "preview" ? "active" : ""}`}
                  onClick={() => setAbaSelecionada("preview")}
                >
                  Pré-visualização (bruta)
                </button>
              </div>

              {abaSelecionada === "editor" && (
                <textarea
                  className="markdown-editor"
                  value={resultado.conteudo}
                  onChange={handleEditar}
                  spellCheck={false}
                />
              )}

              {abaSelecionada === "preview" && (
                <pre className="markdown-preview">{resultado.conteudo}</pre>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .page-container {
          padding: 1.5rem;
          max-width: 100%;
        }
        .page-header {
          margin-bottom: 1.5rem;
        }
        .page-header h2 {
          font-size: 1.4rem;
          margin-bottom: 0.25rem;
        }
        .page-subtitle {
          color: var(--text-muted, #888);
          font-size: 0.9rem;
        }
        .gerar-doc-layout {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 1.25rem;
          align-items: start;
        }
        .gerar-doc-form h3 {
          font-size: 1rem;
          margin-bottom: 1rem;
          color: var(--accent, #4f8ef7);
        }
        .form-group {
          margin-bottom: 0.9rem;
        }
        .form-group label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 0.3rem;
          color: var(--text-muted, #888);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.5rem 0.75rem;
          background: var(--bg, #1a1a2e);
          border: 1px solid var(--border, #333);
          border-radius: 6px;
          color: var(--text, #eee);
          font-size: 0.9rem;
          box-sizing: border-box;
        }
        .form-group textarea {
          resize: vertical;
          font-family: inherit;
        }
        .btn-full {
          width: 100%;
          margin-top: 0.5rem;
        }
        .hint-text {
          font-size: 0.75rem;
          color: var(--text-muted, #888);
          text-align: center;
          margin-top: 0.5rem;
        }
        .alert {
          padding: 0.6rem 0.9rem;
          border-radius: 6px;
          margin-bottom: 0.75rem;
          font-size: 0.85rem;
        }
        .alert-error {
          background: rgba(220, 53, 69, 0.15);
          border: 1px solid rgba(220, 53, 69, 0.4);
          color: #f87171;
        }
        .alert-success {
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #4ade80;
          margin-bottom: 0.75rem;
        }
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          text-align: center;
          gap: 0.75rem;
        }
        .empty-icon {
          font-size: 3rem;
        }
        .text-muted {
          color: var(--text-muted, #888);
          font-size: 0.85rem;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border, #333);
          border-top-color: var(--accent, #4f8ef7);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .resultado-card {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .resultado-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .resultado-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .resultado-filename {
          font-weight: 600;
          font-size: 0.9rem;
        }
        .resultado-actions {
          display: flex;
          gap: 0.5rem;
        }
        .badge {
          padding: 0.2rem 0.6rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .alert-warning {
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.35);
          color: #fbbf24;
          margin-bottom: 0.75rem;
        }
        .badge-yellow {
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.35);
        }
        .tab-bar {
          display: flex;
          gap: 0.25rem;
          border-bottom: 1px solid var(--border, #333);
          padding-bottom: 0;
        }
        .tab-btn {
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          padding: 0.4rem 0.9rem;
          cursor: pointer;
          color: var(--text-muted, #888);
          font-size: 0.85rem;
          transition: color 0.15s, border-color 0.15s;
        }
        .tab-btn.active {
          color: var(--accent, #4f8ef7);
          border-bottom-color: var(--accent, #4f8ef7);
        }
        .markdown-editor {
          width: 100%;
          min-height: 520px;
          padding: 1rem;
          background: var(--bg, #1a1a2e);
          border: 1px solid var(--border, #333);
          border-radius: 6px;
          color: var(--text, #eee);
          font-family: "Fira Code", "Cascadia Code", monospace;
          font-size: 0.82rem;
          line-height: 1.6;
          resize: vertical;
          box-sizing: border-box;
        }
        .markdown-preview {
          width: 100%;
          min-height: 520px;
          padding: 1rem;
          background: var(--bg, #1a1a2e);
          border: 1px solid var(--border, #333);
          border-radius: 6px;
          color: var(--text, #eee);
          font-family: "Fira Code", "Cascadia Code", monospace;
          font-size: 0.82rem;
          line-height: 1.6;
          white-space: pre-wrap;
          word-break: break-word;
          overflow: auto;
          box-sizing: border-box;
        }
        .card {
          background: var(--surface, #1e1e3f);
          border: 1px solid var(--border, #333);
          border-radius: 8px;
          padding: 1.25rem;
        }
        .btn {
          padding: 0.4rem 0.9rem;
          border-radius: 6px;
          border: 1px solid var(--border, #333);
          background: var(--surface, #1e1e3f);
          color: var(--text, #eee);
          cursor: pointer;
          font-size: 0.85rem;
          transition: opacity 0.15s;
        }
        .btn:hover { opacity: 0.85; }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-sm { padding: 0.3rem 0.7rem; font-size: 0.8rem; }
        .btn-primary {
          background: var(--accent, #4f8ef7);
          border-color: var(--accent, #4f8ef7);
          color: #fff;
        }
        @media (max-width: 900px) {
          .gerar-doc-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
