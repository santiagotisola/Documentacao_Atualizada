import { useState, useEffect } from "react";

const API = "http://localhost:3100/api";
const PRODUTOS = ["axhub", "axton", "axcross"];
const STATUS_CORES = { rascunho: "#f39c12", revisao: "#2563eb", aprovado: "#27ae60" };
const STATUS_LABELS = { rascunho: "🟡 Rascunho", revisao: "🔵 Em Revisão", aprovado: "✅ Aprovado" };

export default function Specs() {
  const [produto, setProduto]       = useState("");
  const [specs, setSpecs]           = useState([]);
  const [selecionada, setSelecionada] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [msg, setMsg]               = useState("");

  useEffect(() => { carregarSpecs(); }, [produto]);

  async function carregarSpecs() {
    setCarregando(true);
    try {
      const url = produto ? `${API}/spec?produto=${produto}` : `${API}/spec`;
      const r   = await fetch(url);
      const d   = await r.json();
      setSpecs(d.lista || []);
      setSelecionada(null);
    } catch { setMsg("Erro ao carregar specs."); }
    setCarregando(false);
  }

  async function carregarDetalhe(id) {
    setCarregando(true);
    setSelecionada(null);
    try {
      const r = await fetch(`${API}/spec/${id}`);
      const d = await r.json();
      setSelecionada(d);
    } catch { setMsg("Erro ao carregar detalhe."); }
    setCarregando(false);
  }

  async function atualizarStatus(id, status) {
    try {
      await fetch(`${API}/spec/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setSpecs(prev => prev.map(s => s._id === id ? { ...s, status } : s));
      if (selecionada?._id === id) setSelecionada(prev => ({ ...prev, status }));
      setMsg(`Status atualizado para "${status}".`);
    } catch { setMsg("Erro ao atualizar status."); }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>📐 Especificações Técnicas (PRD)</h2>
        <p className="page-desc">Specs geradas a partir do roadmap — contêm objetivo, requisitos, arquitetura, pseudocódigo e critérios de aceite.</p>
      </div>

      {/* Filtro de produto */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
        <label style={{ fontSize: 13, color: "#555" }}>Filtrar por produto:</label>
        <select value={produto} onChange={e => { setProduto(e.target.value); setMsg(""); }}
          style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #ccc", fontSize: 13 }}>
          <option value="">Todos</option>
          {PRODUTOS.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
        </select>
        <span style={{ fontSize: 12, color: "#888" }}>{specs.length} spec(s) encontrada(s)</span>
      </div>

      {msg && <div style={{ padding: "8px 14px", background: msg.startsWith("✅") || msg.includes("atualizado") ? "#d4edda" : "#f8d7da", borderRadius: 6, marginBottom: 12, fontSize: 13 }}>{msg}</div>}

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* Lista lateral */}
        <div style={{ width: 340, flexShrink: 0, border: "1px solid #dde", borderRadius: 8, overflow: "hidden" }}>
          {carregando && !selecionada && <p style={{ padding: 12, color: "#888", fontSize: 13 }}>Carregando...</p>}
          {!carregando && specs.length === 0 && (
            <div style={{ padding: 24, textAlign: "center", color: "#aaa" }}>
              <p style={{ fontSize: 32 }}>📐</p>
              <p style={{ fontSize: 13 }}>Nenhuma spec encontrada.</p>
              <p style={{ fontSize: 12 }}>Vá em <em>Roadmap</em> e clique em "📐 Spec" em algum item.</p>
            </div>
          )}
          {specs.map((s, idx) => (
            <div key={s._id}
              onClick={() => carregarDetalhe(s._id)}
              style={{
                padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid #eee",
                background: selecionada?._id === s._id ? "#eff6ff" : idx % 2 === 0 ? "#fff" : "#fafafa",
              }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{s.titulo}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 11, background: "#e9ecef", borderRadius: 4, padding: "1px 6px", color: "#555" }}>{s.produto?.toUpperCase()}</span>
                <span style={{
                  fontSize: 11, borderRadius: 4, padding: "1px 6px",
                  background: (STATUS_CORES[s.status] || "#ccc") + "22",
                  color: STATUS_CORES[s.status] || "#666",
                  fontWeight: 600,
                }}>{STATUS_LABELS[s.status] || s.status}</span>
              </div>
              <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>
                {new Date(s.criadoEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
              </div>
            </div>
          ))}
        </div>

        {/* Detalhe da spec */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {!selecionada && !carregando && (
            <div style={{ textAlign: "center", padding: 60, color: "#bbb" }}>
              <p style={{ fontSize: 40 }}>📋</p>
              <p>Selecione uma spec na lista para visualizar.</p>
            </div>
          )}
          {carregando && selecionada === null && specs.length > 0 && (
            <p style={{ color: "#888", padding: 12, fontSize: 13 }}>Carregando spec...</p>
          )}

          {selecionada && (
            <div style={{ background: "#fff", border: "1px solid #dde", borderRadius: 8, padding: 24 }}>
              {/* Header da spec */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18 }}>{selecionada.titulo}</h3>
                  <span style={{ fontSize: 12, color: "#777" }}>
                    {selecionada.produto?.toUpperCase()} · Criado em {new Date(selecionada.criadoEm).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <select value={selecionada.status}
                  onChange={e => atualizarStatus(selecionada._id, e.target.value)}
                  style={{ fontSize: 13, padding: "4px 8px", borderRadius: 6, border: "1px solid #ccc" }}>
                  <option value="rascunho">🟡 Rascunho</option>
                  <option value="revisao">🔵 Em Revisão</option>
                  <option value="aprovado">✅ Aprovado</option>
                </select>
              </div>

              <SpecSecao titulo="🎯 Objetivo" conteudo={selecionada.spec?.objetivo} />
              <SpecLista  titulo="👥 Usuários / Personas" itens={selecionada.spec?.usuarios} />
              <SpecLista  titulo="✅ Requisitos Funcionais" itens={selecionada.spec?.requisitos} />
              <SpecLista  titulo="📋 Regras de Negócio" itens={selecionada.spec?.regrasNegocio} />
              <SpecCodigo titulo="🏗️ Arquitetura" conteudo={selecionada.spec?.arquitetura} linguagem="markdown" />
              <SpecCodigo titulo="💻 Pseudocódigo" conteudo={selecionada.spec?.pseudoCodigo} linguagem="javascript" />
              <SpecLista  titulo="🧪 Critérios de Aceite" itens={selecionada.spec?.criteriosAceitacao} />
              <SpecLista  titulo="⚠️ Riscos" itens={selecionada.spec?.riscos} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-componentes ───────────────────────────────────────────────

function SpecSecao({ titulo, conteudo }) {
  if (!conteudo) return null;
  return (
    <div style={{ marginBottom: 20 }}>
      <h4 style={{ fontSize: 14, margin: "0 0 8px", color: "#333" }}>{titulo}</h4>
      <p style={{ margin: 0, fontSize: 13, color: "#555", lineHeight: 1.6 }}>{conteudo}</p>
    </div>
  );
}

function SpecLista({ titulo, itens }) {
  if (!itens?.length) return null;
  return (
    <div style={{ marginBottom: 20 }}>
      <h4 style={{ fontSize: 14, margin: "0 0 8px", color: "#333" }}>{titulo}</h4>
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        {itens.map((item, i) => (
          <li key={i} style={{ fontSize: 13, color: "#555", marginBottom: 4, lineHeight: 1.5 }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SpecCodigo({ titulo, conteudo, linguagem }) {
  if (!conteudo) return null;
  return (
    <div style={{ marginBottom: 20 }}>
      <h4 style={{ fontSize: 14, margin: "0 0 8px", color: "#333" }}>{titulo}</h4>
      <pre style={{
        background: "#f6f8fa", border: "1px solid #e1e4e8", borderRadius: 6,
        padding: "12px 16px", fontSize: 12, overflowX: "auto", lineHeight: 1.6,
        margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word"
      }}>{conteudo}</pre>
    </div>
  );
}
