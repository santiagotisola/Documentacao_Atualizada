import { useState, useEffect } from "react";
import { apiFetch } from "../services/api";

const PRODUTOS = ["axhub", "axton", "axcross"];

const COMPLEXIDADE_CORES = { baixa: "#27ae60", media: "#f39c12", alta: "#e74c3c" };
const PRIORIDADE_LABEL = { 1: "🔴 Alta", 2: "🟡 Média", 3: "🟢 Baixa", 4: "⚪ Baixa", 5: "⚪ Mínima" };

export default function Roadmap() {
  const [produto, setProduto]       = useState("axhub");
  const [roadmaps, setRoadmaps]     = useState([]);
  const [selecionado, setSelecionado] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [gerando, setGerando]       = useState(false);
  const [msg, setMsg]               = useState("");
  const [gerandoSpec, setGerandoSpec] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState("todos");

  useEffect(() => { carregarRoadmaps(); }, [produto]);

  async function carregarRoadmaps() {
    setCarregando(true);
    try {
      const r = await apiFetch(`/roadmap?produto=${produto}`);
      const d = await r.json();
      setRoadmaps(d.lista || []);
      if (d.lista?.length > 0) {
        await carregarDetalhe(d.lista[0]._id);
      } else {
        setSelecionado(null);
      }
    } catch { setMsg("Erro ao carregar roadmaps."); }
    setCarregando(false);
  }

  async function carregarDetalhe(id) {
    setCarregando(true);
    try {
      const r = await apiFetch(`/roadmap/${id}`);
      const d = await r.json();
      setSelecionado(d);
    } catch { setMsg("Erro ao carregar detalhe."); }
    setCarregando(false);
  }

  async function gerarNovoRoadmap() {
    setGerando(true);
    setMsg("");
    try {
      const r = await apiFetch(`/roadmap/gerar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produto }),
      });
      const d = await r.json();
      if (!r.ok) { setMsg(`Erro: ${d.erro}`); }
      else {
        setMsg(`✅ Roadmap gerado — ${d.roadmap.itens.length} itens.`);
        await carregarRoadmaps();
      }
    } catch { setMsg("Erro ao gerar roadmap."); }
    setGerando(false);
  }

  async function atualizarStatus(itemId, status) {
    if (!selecionado) return;
    try {
      await apiFetch(`/roadmap/${selecionado._id}/item/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await carregarDetalhe(selecionado._id);
    } catch { setMsg("Erro ao atualizar status."); }
  }

  async function gerarSpecItem(item) {
    setGerandoSpec(item._id);
    setMsg("");
    try {
      const r = await apiFetch(`/spec/gerar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produto,
          item: { titulo: item.titulo, descricao: item.descricao, categoria: item.categoria, impacto: item.impacto, complexidade: item.complexidade, fontes: item.fontes },
          roadmapItemId: item._id,
        }),
      });
      const d = await r.json();
      if (!r.ok) { setMsg(`Erro: ${d.erro}`); }
      else {
        setMsg(`✅ Spec gerada para "${item.titulo}" (${d.origem === "openai" ? "via IA" : "template local"}).`);
        await atualizarStatus(item._id, "especificado");
      }
    } catch { setMsg("Erro ao gerar spec."); }
    setGerandoSpec(null);
  }

  const itensFiltrados = selecionado?.itens?.filter(i => {
    if (filtroStatus === "todos") return true;
    return i.status === filtroStatus;
  }) ?? [];

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>🗺️ Roadmap de Produto</h2>
        <p className="page-desc">Backlog gerado automaticamente a partir de lacunas identificadas nas fontes de pesquisa.</p>
      </div>

      {/* Toolbar */}
      <div className="toolbar" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
        <select value={produto} onChange={e => { setProduto(e.target.value); setMsg(""); }}
          style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}>
          {PRODUTOS.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
        </select>

        <button onClick={gerarNovoRoadmap} disabled={gerando}
          style={{ padding: "6px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
          {gerando ? "⏳ Gerando..." : "⚙️ Gerar Roadmap"}
        </button>

        {roadmaps.length > 1 && (
          <select onChange={e => carregarDetalhe(e.target.value)}
            style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #ccc", fontSize: 13 }}>
            {roadmaps.map(rm => (
              <option key={rm._id} value={rm._id}>
                {new Date(rm.geradoEm).toLocaleDateString("pt-BR")} — {rm.itens?.length ?? "?"} itens
              </option>
            ))}
          </select>
        )}

        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}
          style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #ccc", fontSize: 13 }}>
          <option value="todos">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="especificado">Especificado</option>
          <option value="aprovado">Aprovado</option>
          <option value="descartado">Descartado</option>
        </select>
      </div>

      {msg && <div style={{ padding: "8px 14px", background: msg.startsWith("✅") ? "#d4edda" : "#f8d7da", borderRadius: 6, marginBottom: 12, fontSize: 13 }}>{msg}</div>}

      {carregando && <p style={{ color: "#888" }}>Carregando...</p>}

      {!carregando && !selecionado && (
        <div style={{ textAlign: "center", padding: 60, color: "#aaa" }}>
          <p style={{ fontSize: 40 }}>🗺️</p>
          <p>Nenhum roadmap gerado ainda para <strong>{produto.toUpperCase()}</strong>.</p>
          <p style={{ fontSize: 13 }}>Adicione fontes analisadas em <em>Fontes de Pesquisa</em> e clique em "Gerar Roadmap".</p>
        </div>
      )}

      {selecionado && (
        <>
          {/* Resumo */}
          <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            {[
              { label: "Total de itens", val: selecionado.itens?.length ?? 0 },
              { label: "Fontes usadas", val: selecionado.totalFontes ?? 0 },
              { label: "Pendentes", val: selecionado.itens?.filter(i => i.status === "pendente").length ?? 0 },
              { label: "Especificados", val: selecionado.itens?.filter(i => i.status === "especificado").length ?? 0 },
              { label: "Aprovados", val: selecionado.itens?.filter(i => i.status === "aprovado").length ?? 0 },
            ].map(({ label, val }) => (
              <div key={label} style={{ flex: "1 1 100px", minWidth: 100, background: "#f8faff", border: "1px solid #ddd", borderRadius: 8, padding: "10px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#2563eb" }}>{val}</div>
                <div style={{ fontSize: 12, color: "#777" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Tabela de itens */}
          {itensFiltrados.length === 0
            ? <p style={{ color: "#aaa", textAlign: "center" }}>Nenhum item com status "{filtroStatus}".</p>
            : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f0f4ff", borderBottom: "2px solid #ddd" }}>
                      <th style={{ padding: "8px 12px", textAlign: "left" }}>Funcionalidade</th>
                      <th style={{ padding: "8px 12px", textAlign: "center" }}>Prioridade</th>
                      <th style={{ padding: "8px 12px", textAlign: "center" }}>Complexidade</th>
                      <th style={{ padding: "8px 12px", textAlign: "left" }}>Categoria</th>
                      <th style={{ padding: "8px 12px", textAlign: "center" }}>Status</th>
                      <th style={{ padding: "8px 12px", textAlign: "center" }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itensFiltrados.map((item, idx) => (
                      <tr key={item._id} style={{ borderBottom: "1px solid #eee", background: idx % 2 === 0 ? "#fff" : "#fafafa" }}>
                        <td style={{ padding: "8px 12px", maxWidth: 300 }}>
                          <strong>{item.titulo}</strong>
                          {item.descricao && <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{item.descricao}</div>}
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "center" }}>
                          {PRIORIDADE_LABEL[item.prioridade] || item.prioridade}
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "center" }}>
                          <span style={{
                            display: "inline-block", padding: "2px 8px", borderRadius: 12,
                            background: COMPLEXIDADE_CORES[item.complexidade] + "22",
                            color: COMPLEXIDADE_CORES[item.complexidade],
                            fontWeight: 600, fontSize: 12
                          }}>{item.complexidade}</span>
                        </td>
                        <td style={{ padding: "8px 12px", fontSize: 12, color: "#555" }}>{item.categoria}</td>
                        <td style={{ padding: "8px 12px", textAlign: "center" }}>
                          <select value={item.status}
                            onChange={e => atualizarStatus(item._id, e.target.value)}
                            style={{ fontSize: 12, padding: "2px 6px", borderRadius: 4, border: "1px solid #ccc" }}>
                            <option value="pendente">Pendente</option>
                            <option value="especificado">Especificado</option>
                            <option value="aprovado">Aprovado</option>
                            <option value="descartado">Descartado</option>
                          </select>
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "center" }}>
                          {item.status !== "descartado" && (
                            <button
                              onClick={() => gerarSpecItem(item)}
                              disabled={gerandoSpec === item._id}
                              style={{
                                padding: "3px 10px", fontSize: 12,
                                background: item.status === "especificado" ? "#e9ecef" : "#2563eb",
                                color: item.status === "especificado" ? "#666" : "#fff",
                                border: "none", borderRadius: 4, cursor: "pointer"
                              }}>
                              {gerandoSpec === item._id ? "⏳" : "📐 Spec"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </>
      )}
    </div>
  );
}
