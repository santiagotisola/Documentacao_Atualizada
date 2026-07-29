import React, { useState } from "react";
import axios from "axios";
import { FileText, FileCode, Presentation, Download, Loader, CheckCircle, AlertCircle, Plus, Trash2 } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3100/api";

const FORMATOS = [
  { id: "pdf",  label: "PDF",         Icon: FileText,     cor: "#ef4444", mime: "application/pdf",           ext: "pdf" },
  { id: "docx", label: "Word (DOCX)", Icon: FileCode,     cor: "#2563eb", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ext: "docx" },
  { id: "pptx", label: "PowerPoint",  Icon: Presentation, cor: "#f97316", mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", ext: "pptx" },
];

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function PresentationCenter() {
  const [formato, setFormato]   = useState("pdf");
  const [titulo, setTitulo]     = useState("");
  const [gerando, setGerando]   = useState(false);
  const [resultado, setResultado] = useState(null);

  // ─── PDF: editor HTML simples ─────────────────────────────────────────────
  const [htmlContent, setHtmlContent] = useState(`<h1>Relatório de Site</h1>
<table>
  <tr><th>Cliente</th><td>IBAMETRO</td><th>Produto</th><td>AxHub v1.2.3</td></tr>
  <tr><th>Data</th><td>${new Date().toLocaleDateString("pt-BR")}</td><th>Status</th><td>Online</td></tr>
</table>
<h2>Observações</h2>
<p>Sistema operando normalmente. Todos os equipamentos com heartbeat ativo.</p>`);

  // ─── DOCX: seções ─────────────────────────────────────────────────────────
  const [secoes, setSecoes] = useState([
    { titulo: "Resumo Executivo", paragrafos: ["Sistema auditado com sucesso. Todos os módulos operacionais."] },
  ]);

  // ─── PPTX: slides ─────────────────────────────────────────────────────────
  const [subtitulo, setSubtitulo] = useState("Axion Tecnologia");
  const [slides, setSlides] = useState([
    { titulo: "Visão Geral", bullets: ["Sistema: AxHub", "Sites ativos: 18", "Versão: v1.2.3"] },
    { titulo: "Equipamentos", bullets: ["Total: 72 dispositivos", "Online: 68 (94%)", "Offline: 4 (6%)"] },
  ]);

  // ─── Gerar ────────────────────────────────────────────────────────────────

  async function gerar() {
    if (!titulo.trim()) return;
    setGerando(true);
    setResultado(null);
    try {
      let body, endpoint;

      if (formato === "pdf") {
        body = { titulo, html: htmlContent, orientacao: "portrait" };
        endpoint = "presentation/pdf";
      } else if (formato === "docx") {
        body = { titulo, secoes };
        endpoint = "presentation/docx";
      } else {
        body = { titulo, subtitulo, slides };
        endpoint = "presentation/pptx";
      }

      const resp = await axios.post(`${API}/${endpoint}`, body, { responseType: "blob" });
      const fmt  = FORMATOS.find(f => f.id === formato);
      const nome = `${titulo.slice(0, 30).toLowerCase().replace(/\s+/g, "-")}.${fmt.ext}`;
      downloadBlob(resp.data, nome);
      setResultado({ ok: true, nome });
    } catch (err) {
      setResultado({ ok: false, erro: err.response?.data?.erro || err.message });
    } finally {
      setGerando(false);
    }
  }

  // ─── Helpers DOCX ─────────────────────────────────────────────────────────

  function addSecao() { setSecoes([...secoes, { titulo: "", paragrafos: [""] }]); }
  function removeSecao(i) { setSecoes(secoes.filter((_, idx) => idx !== i)); }
  function updateSecao(i, campo, val) { const s = [...secoes]; s[i][campo] = val; setSecoes(s); }
  function addParagrafo(i) { const s = [...secoes]; s[i].paragrafos.push(""); setSecoes(s); }
  function updateParagrafo(i, j, val) { const s = [...secoes]; s[i].paragrafos[j] = val; setSecoes(s); }
  function removeParagrafo(i, j) { const s = [...secoes]; s[i].paragrafos.splice(j, 1); setSecoes(s); }

  // ─── Helpers PPTX ─────────────────────────────────────────────────────────

  function addSlide() { setSlides([...slides, { titulo: "", bullets: [""] }]); }
  function removeSlide(i) { setSlides(slides.filter((_, idx) => idx !== i)); }
  function updateSlide(i, campo, val) { const s = [...slides]; s[i][campo] = val; setSlides(s); }
  function addBullet(i) { const s = [...slides]; s[i].bullets.push(""); setSlides(s); }
  function updateBullet(i, j, val) { const s = [...slides]; s[i].bullets[j] = val; setSlides(s); }
  function removeBullet(i, j) { const s = [...slides]; s[i].bullets.splice(j, 1); setSlides(s); }

  const inp = { background: "#1a1a1a", border: "1px solid #3d3d3d", color: "#f3f3f3", borderRadius: "6px", padding: "8px 10px", fontSize: "13px", width: "100%", boxSizing: "border-box" };

  return (
    <div style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <FileText size={28} color="#60cdff" strokeWidth={1.5} />
        <div>
          <h2 style={{ margin: 0, color: "#f3f3f3", fontWeight: 600 }}>Presentation Center</h2>
          <p style={{ margin: 0, color: "#8b8b8b", fontSize: "13px" }}>Geração de documentos PDF, Word e PowerPoint</p>
        </div>
      </div>

      {/* Seleção de formato */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {FORMATOS.map(f => {
          const Icon = f.Icon;
          const ativo = formato === f.id;
          return (
            <button key={f.id} onClick={() => setFormato(f.id)}
              style={{ flex: 1, background: ativo ? f.cor + "22" : "#2d2d2d", border: `1px solid ${ativo ? f.cor : "#3d3d3d"}`, color: ativo ? f.cor : "#8b8b8b", borderRadius: "8px", padding: "14px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", transition: "all .2s" }}>
              <Icon size={24} strokeWidth={1.5} />
              <span style={{ fontSize: "12px", fontWeight: ativo ? 600 : 400 }}>{f.label}</span>
            </button>
          );
        })}
      </div>

      {/* Título */}
      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", fontSize: "12px", color: "#8b8b8b", marginBottom: "6px" }}>Título do documento *</label>
        <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Relatório de Auditoria — IBAMETRO — Jul/2026" style={inp} />
      </div>

      {/* Editor por formato */}
      {formato === "pdf" && (
        <div>
          <label style={{ display: "block", fontSize: "12px", color: "#8b8b8b", marginBottom: "6px" }}>Conteúdo HTML</label>
          <textarea value={htmlContent} onChange={e => setHtmlContent(e.target.value)} rows={14}
            style={{ ...inp, fontFamily: "monospace", fontSize: "12px", resize: "vertical" }} />
          <p style={{ fontSize: "11px", color: "#555", marginTop: "6px" }}>
            Suporte a: &lt;h1&gt;, &lt;h2&gt;, &lt;table&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt; — classes: badge-green, badge-red, badge-yellow
          </p>
        </div>
      )}

      {formato === "docx" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <label style={{ fontSize: "12px", color: "#8b8b8b" }}>Seções do documento</label>
            <button onClick={addSecao} style={{ background: "#3d3d3d", border: "none", color: "#60cdff", borderRadius: "6px", padding: "4px 10px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}><Plus size={12} /> Seção</button>
          </div>
          {secoes.map((s, i) => (
            <div key={i} style={{ background: "#2d2d2d", borderRadius: "8px", padding: "12px 14px", marginBottom: "10px", border: "1px solid #3d3d3d" }}>
              <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <input value={s.titulo} onChange={e => updateSecao(i, "titulo", e.target.value)} placeholder="Título da seção"
                  style={{ ...inp, flex: 1 }} />
                <button onClick={() => removeSecao(i)} style={{ background: "#ef444422", border: "none", color: "#ef4444", borderRadius: "6px", padding: "6px 10px", cursor: "pointer" }}><Trash2 size={13} /></button>
              </div>
              {s.paragrafos.map((p, j) => (
                <div key={j} style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
                  <textarea value={p} onChange={e => updateParagrafo(i, j, e.target.value)} placeholder="Parágrafo..." rows={2}
                    style={{ ...inp, flex: 1, resize: "vertical" }} />
                  <button onClick={() => removeParagrafo(i, j)} style={{ background: "transparent", border: "none", color: "#555", cursor: "pointer", padding: "4px" }}><Trash2 size={11} /></button>
                </div>
              ))}
              <button onClick={() => addParagrafo(i)} style={{ background: "transparent", border: "1px dashed #3d3d3d", color: "#555", borderRadius: "4px", padding: "4px 10px", cursor: "pointer", fontSize: "11px", width: "100%" }}>+ Parágrafo</button>
            </div>
          ))}
        </div>
      )}

      {formato === "pptx" && (
        <div>
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "#8b8b8b", marginBottom: "6px" }}>Subtítulo (slide de capa)</label>
            <input value={subtitulo} onChange={e => setSubtitulo(e.target.value)} style={inp} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <label style={{ fontSize: "12px", color: "#8b8b8b" }}>Slides ({slides.length})</label>
            <button onClick={addSlide} style={{ background: "#3d3d3d", border: "none", color: "#f97316", borderRadius: "6px", padding: "4px 10px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}><Plus size={12} /> Slide</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "10px" }}>
            {slides.map((s, i) => (
              <div key={i} style={{ background: "#2d2d2d", borderRadius: "8px", padding: "12px 14px", border: "1px solid #3d3d3d" }}>
                <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                  <input value={s.titulo} onChange={e => updateSlide(i, "titulo", e.target.value)} placeholder={`Slide ${i + 1} — Título`}
                    style={{ ...inp, flex: 1, fontSize: "12px" }} />
                  <button onClick={() => removeSlide(i)} style={{ background: "transparent", border: "none", color: "#555", cursor: "pointer" }}><Trash2 size={13} /></button>
                </div>
                {(s.bullets || []).map((b, j) => (
                  <div key={j} style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                    <span style={{ color: "#555", paddingTop: "9px", fontSize: "10px" }}>•</span>
                    <input value={b} onChange={e => updateBullet(i, j, e.target.value)} placeholder="Ponto..."
                      style={{ ...inp, flex: 1, fontSize: "12px", padding: "6px 8px" }} />
                    <button onClick={() => removeBullet(i, j)} style={{ background: "transparent", border: "none", color: "#555", cursor: "pointer" }}><Trash2 size={11} /></button>
                  </div>
                ))}
                <button onClick={() => addBullet(i)} style={{ background: "transparent", border: "1px dashed #3d3d3d", color: "#555", borderRadius: "4px", padding: "3px 8px", cursor: "pointer", fontSize: "11px", width: "100%", marginTop: "4px" }}>+ Bullet</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botão gerar */}
      <div style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={gerar} disabled={gerando || !titulo.trim()}
          style={{ background: gerando || !titulo ? "#333" : "#60cdff", border: "none", color: gerando || !titulo ? "#555" : "#111", borderRadius: "8px", padding: "10px 24px", cursor: gerando || !titulo ? "default" : "pointer", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          {gerando ? <Loader size={16} className="spin" /> : <Download size={16} />}
          {gerando ? "Gerando..." : `Gerar ${FORMATOS.find(f => f.id === formato)?.label}`}
        </button>

        {resultado && (
          resultado.ok
            ? <span style={{ color: "#10b981", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}><CheckCircle size={14} /> {resultado.nome} baixado!</span>
            : <span style={{ color: "#ef4444", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}><AlertCircle size={14} /> {resultado.erro}</span>
        )}
      </div>

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
