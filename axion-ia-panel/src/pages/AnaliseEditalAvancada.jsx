/**
 * AnaliseEditalAvancada.jsx — Análise Completa de Editais
 * Upload de edital → decomposição categórica → de-para → concorrentes → mercado → prompt adequação
 */

import React, { useState, useEffect } from "react";
import { api } from "../services/api";

const TABS = [
  { id: "input", label: "📋 Informar Edital", icon: "📋" },
  { id: "categorias", label: "📊 Decomposição", icon: "📊" },
  { id: "depara", label: "🔄 De-Para", icon: "🔄" },
  { id: "concorrentes", label: "🏆 Concorrentes", icon: "🏆" },
  { id: "mercado", label: "🌐 Mercado", icon: "🌐" },
  { id: "adequacao", label: "🔧 Adequação", icon: "🔧" },
  { id: "resumo", label: "📈 Resumo", icon: "📈" },
];

export default function AnaliseEditalAvancada() {
  const [tab, setTab] = useState("input");
  const [textoEdital, setTextoEdital] = useState("");
  const [titulo, setTitulo] = useState("");
  const [orgao, setOrgao] = useState("");
  const [regiao, setRegiao] = useState("");
  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [uploadando, setUploadando] = useState(false);
  const [progresso, setProgresso] = useState("");
  const [erro, setErro] = useState("");
  const [arquivoInfo, setArquivoInfo] = useState(null);
  const [sites, setSites] = useState(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [siteSelecionado, setSiteSelecionado] = useState("");
  const [filtroCat, setFiltroCat] = useState("");

  // Carregar catálogo de sites ao montar
  useEffect(() => {
    api.get("/sites").then(r => setSites(r.data)).catch(() => {});
  }, []);

  // Upload de arquivo → extrair texto → preencher textarea
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadando(true);
    setErro("");
    setProgresso(`📂 Extraindo texto de "${file.name}"...`);

    try {
      const formData = new FormData();
      formData.append("arquivo", file);

      const response = await api.post("/edital/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { texto, arquivo, caracteres, linhas } = response.data;
      setTextoEdital(texto);
      setArquivoInfo({ arquivo, caracteres, linhas });
      setProgresso("");

      // Tentar extrair título/órgão do texto
      const primeiraLinha = texto.split("\n").find(l => l.trim().length > 10);
      if (primeiraLinha && !titulo) {
        const match = primeiraLinha.match(/pregão|edital|concorrência|tomada|convite|rdc/i);
        if (match) setTitulo(primeiraLinha.trim().slice(0, 120));
      }
    } catch (err) {
      setErro(err.response?.data?.erro || `Erro ao processar "${file.name}"`);
      setProgresso("");
    } finally {
      setUploadando(false);
    }
  };

  const handleAnalisar = async () => {
    if (textoEdital.trim().length < 50) {
      setErro("Cole o texto do edital (mínimo 50 caracteres)");
      return;
    }

    setCarregando(true);
    setErro("");
    setProgresso("🔍 Processando análise completa do edital...");

    try {
      const response = await api.post("/edital/analise-avancada", {
        textoEdital,
        titulo: titulo || "Edital Informado",
        orgao: orgao || "Não identificado",
        regiao: regiao || "Não informada",
        siteId: siteSelecionado || null,
        incluirConcorrentes: true,
        incluirMercado: true,
        incluirPromptAdequacao: true,
      });

      setResultado(response.data);
      setTab("categorias");
      setProgresso("");
    } catch (err) {
      setErro(err.response?.data?.erro || err.message);
    } finally {
      setCarregando(false);
    }
  };

  const STATUS_COLORS = {
    atende: { bg: "#065f4620", color: "#10b981", label: "✅ Atende" },
    parcial: { bg: "#92400e20", color: "#f59e0b", label: "⚠️ Parcial" },
    nao_atende: { bg: "#7f1d1d20", color: "#ef4444", label: "❌ Não Atende" },
    "n/a": { bg: "#1e293b", color: "#64748b", label: "—" },
  };

  return (
    <div style={{ padding: "0 1.5rem 2rem" }}>
      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", marginBottom: "1.2rem", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "0.8rem" }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => (t.id === "input" || resultado) && setTab(t.id)}
            disabled={t.id !== "input" && !resultado}
            style={{
              padding: "0.5rem 1rem", borderRadius: 8, border: "none",
              background: tab === t.id ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.04)",
              color: tab === t.id ? "#a5b4fc" : t.id !== "input" && !resultado ? "#334155" : "#94a3b8",
              cursor: t.id === "input" || resultado ? "pointer" : "not-allowed",
              fontSize: "0.82rem", fontWeight: 600, transition: "all 0.2s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ TAB INPUT ═══ */}
      {tab === "input" && (
        <div style={{ maxWidth: 800 }}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", color: "#94a3b8", fontSize: "0.82rem", marginBottom: 4, fontWeight: 600 }}>Título do Edital</label>
            <input
              type="text" value={titulo} onChange={e => setTitulo(e.target.value)}
              placeholder="Ex: Pregão Eletrônico nº 001/2026 - Fiscalização Eletrônica"
              style={{ width: "100%", padding: "0.6rem 1rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#e2e8f0", fontSize: "0.9rem" }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={{ display: "block", color: "#94a3b8", fontSize: "0.82rem", marginBottom: 4, fontWeight: 600 }}>Órgão Licitante</label>
              <input
                type="text" value={orgao} onChange={e => setOrgao(e.target.value)}
                placeholder="Ex: Prefeitura de Aparecida de Goiânia"
                style={{ width: "100%", padding: "0.6rem 1rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#e2e8f0", fontSize: "0.9rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", color: "#94a3b8", fontSize: "0.82rem", marginBottom: 4, fontWeight: 600 }}>Região</label>
              <input
                type="text" value={regiao} onChange={e => setRegiao(e.target.value)}
                placeholder="Ex: GO/Aparecida de Goiânia"
                style={{ width: "100%", padding: "0.6rem 1rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#e2e8f0", fontSize: "0.9rem" }}
              />
            </div>
          </div>

          {/* ─── SELETOR DE SISTEMA / SITE ─── */}
          {sites && (
            <div style={{ marginBottom: "1rem", background: "rgba(99,102,241,0.06)", borderRadius: 12, padding: "1rem", border: "1px solid rgba(99,102,241,0.15)" }}>
              <label style={{ display: "block", color: "#a5b4fc", fontSize: "0.82rem", marginBottom: 8, fontWeight: 700 }}>
                🖥️ Validar contra qual sistema?
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div>
                  <label style={{ display: "block", color: "#94a3b8", fontSize: "0.75rem", marginBottom: 4 }}>Produto</label>
                  <select
                    value={produtoSelecionado}
                    onChange={e => { setProdutoSelecionado(e.target.value); setSiteSelecionado(""); }}
                    style={{ width: "100%", padding: "0.55rem 0.8rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#e2e8f0", fontSize: "0.85rem" }}
                  >
                    <option value="">— Selecionar produto —</option>
                    {Object.entries(sites).filter(([k]) => k !== "outros").map(([key, prod]) => (
                      <option key={key} value={key}>{prod.icon} {prod.label} — {prod.descricao}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", color: "#94a3b8", fontSize: "0.75rem", marginBottom: 4 }}>Instância / Site</label>
                  <select
                    value={siteSelecionado}
                    onChange={e => setSiteSelecionado(e.target.value)}
                    disabled={!produtoSelecionado}
                    style={{ width: "100%", padding: "0.55rem 0.8rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: produtoSelecionado ? "#e2e8f0" : "#475569", fontSize: "0.85rem" }}
                  >
                    <option value="">— Selecionar site —</option>
                    {produtoSelecionado && sites[produtoSelecionado]?.sites.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nome} ({s.regiao}) {s.tipo === "homologacao" ? "🧪" : "🟢"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {siteSelecionado && sites[produtoSelecionado] && (() => {
                const site = sites[produtoSelecionado].sites.find(s => s.id === siteSelecionado);
                return site ? (
                  <div style={{ marginTop: 8, padding: "0.5rem 0.8rem", background: "rgba(16,185,129,0.08)", borderRadius: 8, fontSize: "0.78rem", color: "#6ee7b7" }}>
                    ✅ Análise será validada contra: <strong>{sites[produtoSelecionado].icon} {site.nome}</strong> — <a href={site.url} target="_blank" rel="noopener noreferrer" style={{ color: "#a5b4fc" }}>{site.url}</a>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", color: "#94a3b8", fontSize: "0.82rem", marginBottom: 4, fontWeight: 600 }}>
              📂 Upload do Edital (PDF, DOCX, TXT)
            </label>
            <div style={{
              border: "2px dashed rgba(99,102,241,0.3)", borderRadius: 12, padding: "1.2rem",
              background: "rgba(99,102,241,0.04)", textAlign: "center", position: "relative",
              transition: "all 0.2s",
            }}>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt,.xlsx"
                onChange={handleUpload}
                disabled={uploadando}
                style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
              />
              {uploadando ? (
                <div style={{ color: "#a5b4fc", fontSize: "0.9rem" }}>⏳ Extraindo texto do arquivo...</div>
              ) : arquivoInfo ? (
                <div>
                  <div style={{ color: "#10b981", fontSize: "0.9rem", fontWeight: 700 }}>✅ {arquivoInfo.arquivo}</div>
                  <div style={{ color: "#64748b", fontSize: "0.78rem", marginTop: 4 }}>
                    {arquivoInfo.caracteres.toLocaleString()} caracteres • {arquivoInfo.linhas} linhas extraídas
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "0.75rem", marginTop: 4 }}>Clique para trocar o arquivo</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: "1.5rem", marginBottom: 4 }}>📄</div>
                  <div style={{ color: "#a5b4fc", fontSize: "0.9rem", fontWeight: 600 }}>Arraste ou clique para enviar</div>
                  <div style={{ color: "#64748b", fontSize: "0.78rem", marginTop: 4 }}>PDF, DOCX, TXT — Máx 30MB</div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            <span style={{ color: "#475569", fontSize: "0.78rem", fontWeight: 600 }}>ou cole o texto manualmente</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", color: "#94a3b8", fontSize: "0.82rem", marginBottom: 4, fontWeight: 600 }}>
              Texto do Edital / Termo de Referência
            </label>
            <textarea
              value={textoEdital}
              onChange={e => setTextoEdital(e.target.value)}
              placeholder="Cole aqui o texto completo do edital, termo de referência ou memorial descritivo..."
              rows={16}
              style={{ width: "100%", padding: "1rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#e2e8f0", fontSize: "0.85rem", lineHeight: 1.6, resize: "vertical", fontFamily: "monospace" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: "0.75rem", color: "#64748b" }}>
              <span>{textoEdital.length.toLocaleString()} caracteres</span>
              <span>Mínimo: 50 caracteres</span>
            </div>
          </div>

          {erro && <div style={{ background: "#7f1d1d20", border: "1px solid #ef444440", borderRadius: 8, padding: "0.8rem", color: "#fca5a5", marginBottom: "1rem" }}>❌ {erro}</div>}
          {progresso && <div style={{ background: "#1e1b4b40", border: "1px solid #6366f140", borderRadius: 8, padding: "0.8rem", color: "#a5b4fc", marginBottom: "1rem" }}>{progresso}</div>}

          <button
            onClick={handleAnalisar}
            disabled={carregando || textoEdital.length < 50}
            style={{
              padding: "0.8rem 2rem", background: carregando ? "#334155" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff", border: "none", borderRadius: 10, fontSize: "0.95rem", fontWeight: 700,
              cursor: carregando ? "wait" : "pointer", width: "100%",
            }}
          >
            {carregando ? "⏳ Processando análise avançada..." : "🚀 Analisar Edital Completo"}
          </button>

          <div style={{ marginTop: "1.5rem", background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "1rem", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h4 style={{ color: "#a5b4fc", margin: "0 0 0.5rem", fontSize: "0.85rem" }}>📌 O que será analisado:</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.3rem", fontSize: "0.8rem", color: "#94a3b8" }}>
              <span>🖥️ Hardware (equipamentos, sensores)</span>
              <span>💻 Software (sistemas, funcionalidades)</span>
              <span>🏗️ Infraestrutura (rede, cloud)</span>
              <span>⚙️ Processos (workflows, operação)</span>
              <span>👥 Funções/Equipe (técnicos, certificações)</span>
              <span>📋 Documentos (certidões, atestados)</span>
              <span>📜 Normas (CONTRAN, INMETRO, ABNT)</span>
              <span>💰 Comercial (preços, garantias)</span>
            </div>
            <div style={{ marginTop: "0.8rem", fontSize: "0.78rem", color: "#64748b", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.6rem" }}>
              + De-Para (edital vs projetos) • Análise de Concorrentes • Validação de Mercado • Prompt de Adequação
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB CATEGORIAS ═══ */}
      {tab === "categorias" && resultado?.categorias && (
        <div>
          <h3 style={{ color: "#e2e8f0", marginBottom: "1rem" }}>📊 Decomposição do Edital por Categoria</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
            {Object.entries(resultado.categorias).map(([key, cat]) => (
              <div key={key} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                  <span style={{ fontSize: "1rem", fontWeight: 700, color: "#e2e8f0" }}>{cat.icon} {cat.label}</span>
                  <span style={{ background: "rgba(99,102,241,0.2)", color: "#a5b4fc", padding: "2px 10px", borderRadius: 12, fontSize: "0.78rem", fontWeight: 700 }}>{cat.total} itens</span>
                </div>
                <div style={{ maxHeight: 200, overflow: "auto" }}>
                  {cat.itens.slice(0, 8).map((item, i) => (
                    <div key={i} style={{ fontSize: "0.78rem", color: "#94a3b8", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ color: "#6366f1", fontWeight: 600 }}>L{item.linha}</span> {item.texto.slice(0, 120)}
                    </div>
                  ))}
                  {cat.total > 8 && <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4 }}>+{cat.total - 8} itens...</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ TAB DE-PARA ═══ */}
      {tab === "depara" && resultado?.dePara && (
        <div>
          <h3 style={{ color: "#e2e8f0", marginBottom: "0.5rem" }}>🔄 De-Para: Edital vs Projetos</h3>
          {resultado.dePara.resumo && (
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.2rem", flexWrap: "wrap" }}>
              {[
                { label: "Total", value: resultado.dePara.resumo.totalRequisitos, color: "#a5b4fc" },
                { label: "Atende", value: resultado.dePara.resumo.atendeCompleto, color: "#10b981" },
                { label: "Parcial", value: resultado.dePara.resumo.atendeParcial, color: "#f59e0b" },
                { label: "Não Atende", value: resultado.dePara.resumo.naoAtende, color: "#ef4444" },
                { label: "Cobertura", value: `${resultado.dePara.resumo.percentualCobertura}%`, color: "#8b5cf6" },
              ].map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "0.6rem 1.2rem", textAlign: "center" }}>
                  <div style={{ fontSize: "1.3rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* ─── DIAGNÓSTICO POR CATEGORIA ─── */}
          {resultado.dePara.diagnosticoPorCategoria && (
            <div style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ color: "#a5b4fc", marginBottom: "0.6rem", fontSize: "0.9rem" }}>📊 Diagnóstico por Categoria</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.6rem" }}>
                {Object.entries(resultado.dePara.diagnosticoPorCategoria).map(([key, cat]) => {
                  const cob = cat.cobertura || 0;
                  const corBarra = cob >= 70 ? "#10b981" : cob >= 40 ? "#f59e0b" : "#ef4444";
                  return (
                    <div key={key} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "0.7rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#e2e8f0" }}>{cat.icon} {cat.label}</span>
                        <span style={{ fontSize: "0.85rem", fontWeight: 800, color: corBarra }}>{cob}%</span>
                      </div>
                      <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden", marginBottom: "0.4rem" }}>
                        <div style={{ width: `${cob}%`, height: "100%", background: corBarra, borderRadius: 3, transition: "width 0.5s" }} />
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.7rem" }}>
                        <span style={{ color: "#10b981" }}>✅ {cat.atende}</span>
                        <span style={{ color: "#f59e0b" }}>⚠️ {cat.parcial}</span>
                        <span style={{ color: "#ef4444" }}>❌ {cat.naoAtende}</span>
                        {cat.naPuro > 0 && <span style={{ color: "#475569" }}>— {cat.naPuro}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── FILTRO POR CATEGORIA ─── */}
          {(() => {
            const cats = [...new Set((resultado.dePara.itens || []).map(i => i.categoria))];
            return (
              <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", marginBottom: "0.8rem" }}>
                <button
                  onClick={() => setFiltroCat("")}
                  style={{ padding: "3px 10px", borderRadius: 6, border: "none", background: !filtroCat ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.06)", color: !filtroCat ? "#a5b4fc" : "#64748b", fontSize: "0.72rem", cursor: "pointer", fontWeight: 600 }}
                >Todos</button>
                {cats.map(c => (
                  <button
                    key={c}
                    onClick={() => setFiltroCat(c === filtroCat ? "" : c)}
                    style={{ padding: "3px 10px", borderRadius: 6, border: "none", background: filtroCat === c ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.06)", color: filtroCat === c ? "#a5b4fc" : "#94a3b8", fontSize: "0.72rem", cursor: "pointer" }}
                  >{c}</button>
                ))}
              </div>
            );
          })()}

          <div style={{ overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
                  <th style={{ textAlign: "left", padding: "8px", color: "#94a3b8" }}>Requisito</th>
                  <th style={{ textAlign: "center", padding: "8px", color: "#94a3b8", width: 80 }}>AxHub</th>
                  <th style={{ textAlign: "center", padding: "8px", color: "#94a3b8", width: 80 }}>AxTon</th>
                  <th style={{ textAlign: "center", padding: "8px", color: "#94a3b8", width: 80 }}>AxCross</th>
                  <th style={{ textAlign: "left", padding: "8px", color: "#94a3b8" }}>Onde Atende / Solução</th>
                  <th style={{ textAlign: "center", padding: "8px", color: "#94a3b8", width: 70 }}>Validar</th>
                </tr>
              </thead>
              <tbody>
                {(resultado.dePara.itens || [])
                  .filter(item => !filtroCat || item.categoria === filtroCat)
                  .map((item, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "8px", color: "#cbd5e1", maxWidth: 280 }}>
                      <div style={{ fontSize: "0.78rem" }}>{item.requisito?.slice(0, 100)}</div>
                      <span style={{ fontSize: "0.65rem", color: "#6366f1", fontWeight: 600 }}>{item.categoria}</span>
                      {item.prioridade && item.prioridade !== "media" && (
                        <span style={{ marginLeft: 6, fontSize: "0.62rem", padding: "1px 5px", borderRadius: 4, background: item.prioridade === "critica" ? "#ef444420" : item.prioridade === "alta" ? "#f59e0b20" : "#10b98120", color: item.prioridade === "critica" ? "#ef4444" : item.prioridade === "alta" ? "#f59e0b" : "#10b981" }}>
                          {item.prioridade}
                        </span>
                      )}
                    </td>
                    {["statusAxHub", "statusAxTon", "statusAxCross"].map(col => {
                      const s = STATUS_COLORS[item[col]] || STATUS_COLORS["n/a"];
                      return <td key={col} style={{ textAlign: "center", padding: "4px" }}><span style={{ background: s.bg, color: s.color, padding: "2px 8px", borderRadius: 6, fontSize: "0.72rem" }}>{s.label}</span></td>;
                    })}
                    <td style={{ padding: "8px", maxWidth: 300 }}>
                      {item.ondeAtende && <div style={{ fontSize: "0.73rem", color: "#6ee7b7", marginBottom: 2 }}>{item.ondeAtende.slice(0, 120)}</div>}
                      {item.lacuna && <div style={{ fontSize: "0.73rem", color: "#fca5a5", marginBottom: 2 }}>{item.lacuna.slice(0, 120)}</div>}
                      {item.solucao && (
                        <div style={{ marginTop: 4, background: "rgba(255,255,255,0.03)", border: `1px solid ${item.solucao.cor}30`, borderRadius: 8, padding: "6px 8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
                            <span style={{ fontSize: "0.8rem" }}>{item.solucao.icon}</span>
                            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: item.solucao.cor }}>{item.solucao.label}</span>
                            <span style={{ fontSize: "0.6rem", color: "#475569", marginLeft: "auto" }}>⏱ {item.solucao.prazo}</span>
                          </div>
                          <div style={{ fontSize: "0.68rem", color: "#94a3b8", lineHeight: 1.3, marginBottom: 3 }}>{item.solucao.descricao?.slice(0, 150)}</div>
                          <div style={{ fontSize: "0.65rem", color: "#a5b4fc" }}>▸ {item.solucao.acao?.slice(0, 120)}</div>
                          <div style={{ display: "flex", gap: 8, marginTop: 3, fontSize: "0.62rem" }}>
                            <span style={{ color: "#64748b" }}>👤 {item.solucao.responsavel}</span>
                            <span style={{ color: item.solucao.complexidade === "alta" ? "#ef4444" : item.solucao.complexidade === "media" ? "#f59e0b" : "#10b981" }}>
                              {item.solucao.complexidade === "alta" ? "🔴" : item.solucao.complexidade === "media" ? "🟡" : "🟢"} {item.solucao.complexidade}
                            </span>
                          </div>
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: "center", padding: "4px" }}>
                      {item.validacao?.url ? (
                        <a href={item.validacao.url} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: "0.7rem", color: "#a5b4fc", textDecoration: "none", background: "rgba(99,102,241,0.15)", padding: "3px 8px", borderRadius: 6, display: "inline-block" }}
                          title={`${item.validacao.teste}\n${item.validacao.url}`}
                        >🔗 Abrir</a>
                      ) : item.validacao?.path ? (
                        <span style={{ fontSize: "0.68rem", color: "#475569" }} title={item.validacao.teste}>{item.validacao.path}</span>
                      ) : (
                        <span style={{ fontSize: "0.68rem", color: "#334155" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ─── PAINEL RESUMO DE SOLUÇÕES ─── */}
          {(() => {
            const itensComSolucao = (resultado.dePara.itens || []).filter(i => i.solucao);
            if (itensComSolucao.length === 0) return null;

            // Agrupar por tipo de solução
            const porTipo = {};
            itensComSolucao.forEach(i => {
              const tipo = i.solucao.label;
              if (!porTipo[tipo]) porTipo[tipo] = { icon: i.solucao.icon, cor: i.solucao.cor, itens: [] };
              porTipo[tipo].itens.push(i);
            });

            return (
              <div style={{ marginTop: "1.2rem", background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)", borderRadius: 10, padding: "1rem" }}>
                <h4 style={{ color: "#fca5a5", marginBottom: "0.7rem", fontSize: "0.9rem" }}>🛠️ Plano de Ação — {itensComSolucao.length} {itensComSolucao.length === 1 ? "item requer" : "itens requerem"} solução</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.6rem" }}>
                  {Object.entries(porTipo).map(([tipo, data]) => (
                    <div key={tipo} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${data.cor}25`, borderRadius: 8, padding: "0.7rem" }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: data.cor, marginBottom: "0.4rem" }}>
                        {data.icon} {tipo} ({data.itens.length})
                      </div>
                      {data.itens.map((it, idx) => (
                        <div key={idx} style={{ fontSize: "0.7rem", color: "#94a3b8", padding: "3px 0", borderBottom: idx < data.itens.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                          <div style={{ color: "#cbd5e1", fontWeight: 600 }}>{it.requisito?.slice(0, 80)}</div>
                          <div style={{ color: "#64748b", marginTop: 2 }}>▸ {it.solucao.acao?.slice(0, 100)}</div>
                          <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                            <span style={{ color: "#475569" }}>⏱ {it.solucao.prazo}</span>
                            <span style={{ color: "#475569" }}>👤 {it.solucao.responsavel}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {resultado.dePara._nota && (
            <div style={{ marginTop: "1rem", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 8, padding: "0.7rem", fontSize: "0.75rem", color: "#94a3b8" }}>
              ℹ️ {resultado.dePara._nota}
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB CONCORRENTES ═══ */}
      {tab === "concorrentes" && resultado?.concorrentes && (
        <div>
          <h3 style={{ color: "#e2e8f0", marginBottom: "1rem" }}>🏆 Análise de Concorrentes vs Edital</h3>

          {/* Alertas de conflito */}
          {resultado.concorrentes.alertasConflito?.length > 0 && (
            <div style={{ background: "#7f1d1d15", border: "1px solid #ef444440", borderRadius: 12, padding: "1rem", marginBottom: "1.2rem" }}>
              <h4 style={{ color: "#fca5a5", margin: "0 0 0.5rem", fontSize: "0.9rem" }}>⚠️ Alertas de Conflito / Risco ({resultado.concorrentes.alertasConflito.length})</h4>
              {resultado.concorrentes.alertasConflito.map((a, i) => (
                <div key={i} style={{ fontSize: "0.82rem", color: "#fca5a5", padding: "4px 0", display: "flex", alignItems: "center", gap: 8 }}>
                  <strong>{a.empresa}</strong> — {a.descricao}
                  <span style={{ background: a.risco === "alto" ? "#ef444430" : "#f59e0b30", color: a.risco === "alto" ? "#ef4444" : "#f59e0b", padding: "1px 8px", borderRadius: 6, fontSize: "0.7rem", whiteSpace: "nowrap" }}>
                    {a.risco === "alto" ? "🔴" : "🟡"} {a.risco}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Quem atende 100% */}
          {resultado.concorrentes.quemAtende100 && (
            <div style={{ background: resultado.concorrentes.quemAtende100.suspeitaDirecionamento ? "#7f1d1d15" : "#065f4615", border: `1px solid ${resultado.concorrentes.quemAtende100.suspeitaDirecionamento ? "#ef444440" : "#10b98140"}`, borderRadius: 12, padding: "1rem", marginBottom: "1.2rem" }}>
              <h4 style={{ color: resultado.concorrentes.quemAtende100.suspeitaDirecionamento ? "#fca5a5" : "#6ee7b7", margin: "0 0 0.3rem", fontSize: "0.9rem" }}>
                {resultado.concorrentes.quemAtende100.suspeitaDirecionamento ? "🚨" : "🏅"} {resultado.concorrentes.quemAtende100.empresa}
              </h4>
              <p style={{ color: "#94a3b8", fontSize: "0.82rem", margin: 0 }}>{resultado.concorrentes.quemAtende100.justificativa}</p>
              {resultado.concorrentes.quemAtende100.suspeitaDirecionamento && (
                <div style={{ marginTop: "0.5rem", fontSize: "0.78rem", color: "#fca5a5" }}>
                  <strong>⚠️ Possível direcionamento:</strong>
                  <ul style={{ margin: "4px 0", paddingLeft: "1.2rem" }}>
                    {(resultado.concorrentes.quemAtende100.evidencias || []).filter(Boolean).map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Ranking com barras e nível de ameaça */}
          <div style={{ display: "grid", gap: "0.6rem" }}>
            {(resultado.concorrentes.ranking || []).map((emp, i) => {
              const pct = emp.percentualAtendimento || 0;
              const corPct = pct >= 70 ? "#10b981" : pct >= 40 ? "#f59e0b" : "#ef4444";
              const bgPct = pct >= 70 ? "#065f4630" : pct >= 40 ? "#92400e30" : "#7f1d1d30";
              const ameacaCor = emp.nivelAmeaca === "alto" ? "#ef4444" : emp.nivelAmeaca === "medio" ? "#f59e0b" : "#10b981";
              const ameacaBg = emp.nivelAmeaca === "alto" ? "#ef444425" : emp.nivelAmeaca === "medio" ? "#f59e0b25" : "#10b98125";
              const ameacaIcon = emp.nivelAmeaca === "alto" ? "🔴" : emp.nivelAmeaca === "medio" ? "🟡" : "🟢";
              return (
                <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${emp.nivelAmeaca === "alto" ? "rgba(239,68,68,0.25)" : emp.nivelAmeaca === "medio" ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.08)"}`, borderRadius: 12, padding: "0.8rem 1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "1.1rem", fontWeight: 800, color: i === 0 ? "#fbbf24" : i < 3 ? "#e2e8f0" : "#94a3b8", minWidth: 28 }}>#{i + 1}</span>
                      <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#e2e8f0" }}>{emp.empresa}</span>
                      <span style={{ background: ameacaBg, color: ameacaCor, padding: "1px 8px", borderRadius: 6, fontSize: "0.65rem", fontWeight: 700 }}>{ameacaIcon} {emp.nivelAmeaca || "?"}</span>
                      {emp.conflitoPotencial && <span style={{ background: "#ef444425", color: "#ef4444", padding: "1px 6px", borderRadius: 4, fontSize: "0.62rem", fontWeight: 600 }}>⚠️ RISCO</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "0.68rem", color: "#64748b", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 4 }}>
                        {emp.distanciaRegional === "local" ? "📍 Local" : emp.distanciaRegional === "estadual" ? "🗺️ Estadual" : emp.distanciaRegional === "internacional" ? "🌍 Internacional" : "🇧🇷 Nacional"}
                      </span>
                      <span style={{ background: bgPct, color: corPct, padding: "3px 12px", borderRadius: 8, fontSize: "0.9rem", fontWeight: 800, minWidth: 48, textAlign: "center" }}>{pct}%</span>
                    </div>
                  </div>
                  {/* Barra de progresso */}
                  <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden", marginBottom: "0.5rem" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: corPct, borderRadius: 3, transition: "width 0.5s" }} />
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.4rem" }}>{emp.segmento}</div>
                  {/* Onde supera Axion */}
                  {(emp.superaAxionEm || []).length > 0 && (
                    <div style={{ background: "#7f1d1d15", border: "1px solid #ef444420", borderRadius: 8, padding: "6px 10px", marginBottom: "0.4rem", fontSize: "0.74rem" }}>
                      <span style={{ color: "#fca5a5", fontWeight: 700 }}>⚡ Supera Axion em: </span>
                      <span style={{ color: "#f87171" }}>
                        {emp.superaAxionEm.map(s => `${s.cat} (+${s.diff}pp)`).join(" · ")}
                      </span>
                    </div>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", fontSize: "0.76rem" }}>
                    <div>
                      <span style={{ color: "#10b981", fontWeight: 600 }}>✅ </span>
                      <span style={{ color: "#94a3b8" }}>{(emp.pontosFortes || []).slice(0, 3).join(" · ")}</span>
                    </div>
                    <div>
                      <span style={{ color: "#ef4444", fontWeight: 600 }}>❌ </span>
                      <span style={{ color: "#94a3b8" }}>{(emp.pontosFracos || []).slice(0, 2).join(" · ")}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ═══ MATRIZ COMPARATIVA POR CATEGORIA ═══ */}
          {resultado.concorrentes.matrizCategoria && Object.keys(resultado.concorrentes.matrizCategoria).length > 0 && (
            <div style={{ marginTop: "1.5rem" }}>
              <h4 style={{ color: "#e2e8f0", marginBottom: "0.8rem", fontSize: "0.95rem" }}>📊 Matriz Comparativa por Categoria</h4>
              <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.06)" }}>
                      <th style={{ textAlign: "left", padding: "10px 12px", color: "#94a3b8", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.08)", minWidth: 160 }}>Categoria</th>
                      <th style={{ textAlign: "center", padding: "10px 8px", color: "#a5b4fc", fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,0.08)", minWidth: 80, background: "rgba(99,102,241,0.08)" }}>🎯 Axion</th>
                      {(Object.values(resultado.concorrentes.matrizCategoria)[0]?.concorrentes || []).map((c, ci) => (
                        <th key={ci} style={{ textAlign: "center", padding: "10px 8px", color: "#94a3b8", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.08)", minWidth: 80 }}>{c.empresa}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(resultado.concorrentes.matrizCategoria).map(([catKey, catData]) => (
                      <tr key={catKey} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "8px 12px", color: "#cbd5e1", fontWeight: 500 }}>
                          {catData.icon} {catData.label}
                          <span style={{ color: "#475569", fontSize: "0.7rem", marginLeft: 6 }}>({catData.totalReqs} req.)</span>
                        </td>
                        <td style={{ textAlign: "center", padding: "8px", background: "rgba(99,102,241,0.05)" }}>
                          <span style={{ fontWeight: 800, fontSize: "0.88rem", color: "#a5b4fc" }}>{catData.axion?.pct ?? "—"}%</span>
                        </td>
                        {(catData.concorrentes || []).map((conc, ci) => {
                          const axPct = catData.axion?.pct || 0;
                          const superaAxion = conc.pct > axPct + 5;
                          const inferiorAxion = conc.pct < axPct - 10;
                          const cellColor = superaAxion ? "#ef4444" : inferiorAxion ? "#10b981" : "#94a3b8";
                          const cellBg = superaAxion ? "rgba(239,68,68,0.08)" : inferiorAxion ? "rgba(16,185,129,0.05)" : "transparent";
                          return (
                            <td key={ci} style={{ textAlign: "center", padding: "8px", background: cellBg }}>
                              <span style={{ fontWeight: 700, color: cellColor }}>{conc.pct}%</span>
                              {superaAxion && <span style={{ display: "block", fontSize: "0.6rem", color: "#ef4444" }}>⬆️ supera</span>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ fontSize: "0.7rem", color: "#475569", marginTop: 6 }}>
                <span style={{ color: "#ef4444" }}>■</span> Supera Axion &nbsp;
                <span style={{ color: "#10b981" }}>■</span> Inferior à Axion &nbsp;
                <span style={{ color: "#94a3b8" }}>■</span> Similar
              </div>
            </div>
          )}

          {/* Posição Axion — destaque */}
          {resultado.concorrentes.posicaoAxion && (
            <div style={{ marginTop: "1.2rem", background: "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.08) 100%)", border: "2px solid rgba(99,102,241,0.3)", borderRadius: 14, padding: "1.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
                <h4 style={{ color: "#a5b4fc", margin: 0, fontSize: "1rem" }}>🎯 Posição Axion Tecnologia</h4>
                {resultado.concorrentes.posicaoAxion.percentualAtendimento != null && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 120, height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${resultado.concorrentes.posicaoAxion.percentualAtendimento}%`, height: "100%", background: "linear-gradient(90deg, #6366f1, #a78bfa)", borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: "1.4rem", fontWeight: 900, color: "#a5b4fc" }}>{resultado.concorrentes.posicaoAxion.percentualAtendimento}%</span>
                  </div>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.82rem" }}>
                <div>
                  <div style={{ color: "#10b981", fontWeight: 700, marginBottom: 6, fontSize: "0.85rem" }}>✅ Vantagens Competitivas</div>
                  {(resultado.concorrentes.posicaoAxion.vantagensCompetitivas || []).map((v, i) => <div key={i} style={{ color: "#cbd5e1", padding: "3px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>• {v}</div>)}
                </div>
                <div>
                  <div style={{ color: "#f59e0b", fontWeight: 700, marginBottom: 6, fontSize: "0.85rem" }}>⚠️ Pontos de Atenção</div>
                  {(resultado.concorrentes.posicaoAxion.gapsVsConcorrentes || []).map((g, i) => <div key={i} style={{ color: "#cbd5e1", padding: "3px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>• {g}</div>)}
                </div>
              </div>
            </div>
          )}

          {/* Nota da análise */}
          {resultado.concorrentes._nota && (
            <div style={{ marginTop: "0.8rem", fontSize: "0.73rem", color: "#475569", fontStyle: "italic" }}>
              ℹ️ {resultado.concorrentes._nota}
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB MERCADO ═══ */}
      {tab === "mercado" && resultado?.mercado && (
        <div>
          <h3 style={{ color: "#e2e8f0", marginBottom: "1rem" }}>🌐 Validação de Mercado SaaS</h3>

          {/* Concorrente direto */}
          {resultado.mercado.concorrenteDireto && (
            <div style={{ background: resultado.mercado.concorrenteDireto.existe ? "#92400e15" : "#065f4615", border: `1px solid ${resultado.mercado.concorrenteDireto.existe ? "#f59e0b40" : "#10b98140"}`, borderRadius: 12, padding: "1rem", marginBottom: "1.2rem" }}>
              <h4 style={{ color: resultado.mercado.concorrenteDireto.existe ? "#fbbf24" : "#6ee7b7", margin: "0 0 0.3rem", fontSize: "0.9rem" }}>
                {resultado.mercado.concorrenteDireto.existe ? "⚠️ Existem concorrentes diretos" : "🏆 Sem concorrente direto no mercado"}
              </h4>
              <p style={{ color: "#94a3b8", fontSize: "0.82rem", margin: 0 }}>{resultado.mercado.concorrenteDireto.comparacao}</p>
            </div>
          )}

          {/* Dores do cliente */}
          {/* ═══ SOLUÇÕES DE MERCADO PARA GAPS ═══ */}
          {(resultado.mercado.solucoesMercado || []).length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ color: "#c084fc", marginBottom: "0.8rem", fontSize: "1rem" }}>🛒 Soluções Disponíveis no Mercado para os Gaps</h4>
              <p style={{ color: "#64748b", fontSize: "0.78rem", marginBottom: "0.8rem" }}>
                Requisitos que o sistema não atende ou atende parcialmente — com soluções encontradas no mercado e regras de negócio para implementação.
              </p>
              <div style={{ display: "grid", gap: "0.6rem" }}>
                {resultado.mercado.solucoesMercado.map((sol, i) => {
                  const corStatus = sol.status === "nao_atende" ? "#ef4444" : "#f59e0b";
                  const bgStatus = sol.status === "nao_atende" ? "#ef444418" : "#f59e0b18";
                  const labelStatus = sol.status === "nao_atende" ? "❌ Não atende" : "⚠️ Parcial";
                  const corCompl = sol.complexidade === "alta" ? "#ef4444" : sol.complexidade === "media" ? "#f59e0b" : "#10b981";
                  const iconTipo = { hardware: "🔧", software: "💻", infra: "🏗️", processo: "⚙️", documento: "📋", norma: "📜", comercial: "💰" }[sol.tipo] || "📌";
                  return (
                    <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 12, padding: "1rem", borderLeft: `4px solid ${corStatus}` }}>
                      {/* Header: requisito + status */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: "0.72rem", color: corStatus, background: bgStatus, padding: "1px 8px", borderRadius: 6, fontWeight: 600 }}>{labelStatus}</span>
                          <span style={{ fontSize: "0.72rem", color: "#64748b", marginLeft: 6 }}>{iconTipo} {sol.categoria}</span>
                        </div>
                        <div style={{ display: "flex", gap: 4 }}>
                          <span style={{ fontSize: "0.65rem", background: `${corCompl}20`, color: corCompl, padding: "1px 6px", borderRadius: 4 }}>⚡ {sol.complexidade}</span>
                          {sol.prioridade && <span style={{ fontSize: "0.65rem", background: "rgba(139,92,246,0.15)", color: "#c084fc", padding: "1px 6px", borderRadius: 4 }}>🎯 {sol.prioridade}</span>}
                        </div>
                      </div>
                      <div style={{ color: "#cbd5e1", fontSize: "0.82rem", fontWeight: 500, marginBottom: "0.5rem" }}>{sol.requisito}</div>

                      {/* Solução de mercado */}
                      <div style={{ background: "rgba(139,92,246,0.08)", borderRadius: 8, padding: "0.6rem 0.8rem", marginBottom: "0.5rem" }}>
                        <div style={{ color: "#c084fc", fontSize: "0.75rem", fontWeight: 700, marginBottom: 3 }}>🛒 Solução no Mercado:</div>
                        <div style={{ color: "#e2e8f0", fontSize: "0.82rem" }}>{sol.solucaoMercado}</div>
                        {sol.fornecedores?.length > 0 && (
                          <div style={{ marginTop: 4, display: "flex", flexWrap: "wrap", gap: 4 }}>
                            {sol.fornecedores.map((f, fi) => (
                              <span key={fi} style={{ fontSize: "0.68rem", background: "rgba(255,255,255,0.08)", color: "#94a3b8", padding: "1px 8px", borderRadius: 4 }}>{f}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Regra de negócio */}
                      <div style={{ background: "rgba(16,185,129,0.06)", borderRadius: 8, padding: "0.6rem 0.8rem", border: "1px solid rgba(16,185,129,0.15)" }}>
                        <div style={{ color: "#6ee7b7", fontSize: "0.75rem", fontWeight: 700, marginBottom: 3 }}>📐 Regra de Negócio para Implementação:</div>
                        <div style={{ color: "#cbd5e1", fontSize: "0.8rem", lineHeight: 1.5 }}>{sol.regraDeNegocio}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: "0.6rem", fontSize: "0.72rem", color: "#475569", fontStyle: "italic" }}>
                ℹ️ {resultado.mercado.solucoesMercado.length} solução(ões) de mercado mapeada(s) para os gaps do sistema. As regras de negócio podem ser usadas diretamente como especificação para desenvolvimento.
              </div>
            </div>
          )}

          {/* Dores do cliente */}
          <div style={{ marginBottom: "1.2rem" }}>
            <h4 style={{ color: "#f87171", marginBottom: "0.5rem" }}>🔥 Maiores Dores dos Clientes</h4>
            <div style={{ display: "grid", gap: "0.5rem" }}>
              {(resultado.mercado.doresCliente || []).map((d, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "0.8rem", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#e2e8f0", fontWeight: 600, fontSize: "0.85rem" }}>{d.dor}</span>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <span style={{ fontSize: "0.7rem", background: d.impacto === "alto" ? "#ef444430" : "#f59e0b30", color: d.impacto === "alto" ? "#ef4444" : "#f59e0b", padding: "1px 8px", borderRadius: 6 }}>Impacto {d.impacto}</span>
                      <span style={{ fontSize: "0.7rem", background: d.nossoSaaS_resolve ? "#10b98130" : "#ef444430", color: d.nossoSaaS_resolve ? "#10b981" : "#ef4444", padding: "1px 8px", borderRadius: 6 }}>
                        {d.nossoSaaS_resolve ? "✅ Resolvemos" : "❌ Não resolvemos"}
                      </span>
                    </div>
                  </div>
                  {d.como && <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 4 }}>{d.como}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Tendências */}
          <div style={{ marginBottom: "1.2rem" }}>
            <h4 style={{ color: "#a5b4fc", marginBottom: "0.5rem" }}>📈 Tendências de Mercado 2025-2026</h4>
            <div style={{ display: "grid", gap: "0.5rem" }}>
              {(resultado.mercado.tendenciasMercado || []).map((t, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "0.8rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ color: "#e2e8f0", fontWeight: 600, fontSize: "0.85rem" }}>{t.tendencia}</span>
                    <span style={{ marginLeft: 8, fontSize: "0.7rem", background: "rgba(99,102,241,0.2)", color: "#a5b4fc", padding: "1px 8px", borderRadius: 6 }}>{t.maturidade}</span>
                  </div>
                  <span style={{ fontSize: "0.7rem", background: t.nossoSaaS_tem ? "#10b98130" : "#f59e0b30", color: t.nossoSaaS_tem ? "#10b981" : "#f59e0b", padding: "2px 10px", borderRadius: 6 }}>
                    {t.nossoSaaS_tem ? "✅ Temos" : "🔨 Implementar"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Para ficar 100% */}
          <div style={{ marginBottom: "1.2rem" }}>
            <h4 style={{ color: "#fbbf24", marginBottom: "0.5rem" }}>🎯 Para Ficar 100% Operacional</h4>
            <div style={{ display: "grid", gap: "0.5rem" }}>
              {(resultado.mercado.paraFicar100 || []).map((p, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "0.8rem", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#e2e8f0", fontWeight: 600, fontSize: "0.85rem" }}>{p.funcionalidade}</span>
                    <span style={{ fontSize: "0.7rem", background: p.prioridade === "critica" ? "#ef444430" : p.prioridade === "alta" ? "#f59e0b30" : "#10b98130", color: p.prioridade === "critica" ? "#ef4444" : p.prioridade === "alta" ? "#f59e0b" : "#10b981", padding: "1px 8px", borderRadius: 6 }}>{p.prioridade}</span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 4 }}>⏱️ {p.esforco} • {p.impactoMercado}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Validação lógica */}
          {resultado.mercado.validacaoLogica && (
            <div style={{ background: resultado.mercado.validacaoLogica.pipelineValido ? "#065f4615" : "#7f1d1d15", border: `1px solid ${resultado.mercado.validacaoLogica.pipelineValido ? "#10b98140" : "#ef444440"}`, borderRadius: 12, padding: "1rem" }}>
              <h4 style={{ color: resultado.mercado.validacaoLogica.pipelineValido ? "#6ee7b7" : "#fca5a5", margin: "0 0 0.5rem" }}>
                {resultado.mercado.validacaoLogica.pipelineValido ? "✅" : "⚠️"} Validação da Lógica do SaaS
              </h4>
              <p style={{ color: "#94a3b8", fontSize: "0.82rem", margin: "0 0 0.5rem" }}>{resultado.mercado.validacaoLogica.benchmarkMercado}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.8rem" }}>
                <div>
                  <div style={{ color: "#10b981", fontWeight: 600 }}>Pontos Fortes:</div>
                  {(resultado.mercado.validacaoLogica.pontosFortesLogica || []).map((p, i) => <div key={i} style={{ color: "#94a3b8" }}>• {p}</div>)}
                </div>
                <div>
                  <div style={{ color: "#f59e0b", fontWeight: 600 }}>Melhorias:</div>
                  {(resultado.mercado.validacaoLogica.melhorias || []).map((m, i) => <div key={i} style={{ color: "#94a3b8" }}>• {m}</div>)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB ADEQUAÇÃO ═══ */}
      {tab === "adequacao" && resultado?.promptAdequacao && (
        <div>
          <h3 style={{ color: "#e2e8f0", marginBottom: "1rem" }}>🔧 Prompt de Correção/Adequação</h3>

          {resultado.promptAdequacao.estimativaEsforco && (
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.2rem", flexWrap: "wrap" }}>
              <div style={{ background: "rgba(139,92,246,0.1)", borderRadius: 10, padding: "0.8rem 1.5rem", textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#a78bfa" }}>{resultado.promptAdequacao.estimativaEsforco.totalHoras}h</div>
                <div style={{ fontSize: "0.72rem", color: "#64748b" }}>Esforço Total</div>
              </div>
              {Object.entries(resultado.promptAdequacao.estimativaEsforco.porPrioridade || {}).map(([pri, hrs]) => (
                <div key={pri} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "0.6rem 1.2rem", textAlign: "center" }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: pri === "critica" ? "#ef4444" : pri === "alta" ? "#f59e0b" : "#10b981" }}>{hrs}h</div>
                  <div style={{ fontSize: "0.7rem", color: "#64748b" }}>{pri}</div>
                </div>
              ))}
            </div>
          )}

          {/* Ações prioritárias */}
          <h4 style={{ color: "#a5b4fc", marginBottom: "0.5rem" }}>📋 Ações Prioritárias</h4>
          <div style={{ display: "grid", gap: "0.5rem", marginBottom: "1.5rem" }}>
            {(resultado.promptAdequacao.acoesPrioritarias || []).map((a, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "0.8rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#e2e8f0", fontSize: "0.85rem" }}>{a.acao}</span>
                <div style={{ display: "flex", gap: "0.3rem" }}>
                  <span style={{ fontSize: "0.7rem", background: "rgba(99,102,241,0.2)", color: "#a5b4fc", padding: "1px 8px", borderRadius: 6 }}>{a.produto}</span>
                  <span style={{ fontSize: "0.7rem", background: "rgba(255,255,255,0.08)", color: "#94a3b8", padding: "1px 8px", borderRadius: 6 }}>{a.prazo}</span>
                  <span style={{ fontSize: "0.7rem", background: a.complexidade === "alta" ? "#ef444430" : a.complexidade === "media" ? "#f59e0b30" : "#10b98130", color: a.complexidade === "alta" ? "#ef4444" : a.complexidade === "media" ? "#f59e0b" : "#10b981", padding: "1px 8px", borderRadius: 6 }}>{a.complexidade}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Prompt completo */}
          <h4 style={{ color: "#a5b4fc", marginBottom: "0.5rem" }}>📝 Prompt de Adequação (copiar para uso)</h4>
          <div style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "1.2rem", fontFamily: "monospace", fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.8, whiteSpace: "pre-wrap", maxHeight: 400, overflow: "auto" }}>
            {resultado.promptAdequacao.promptCorrecao}
          </div>
        </div>
      )}

      {/* ═══ TAB RESUMO ═══ */}
      {tab === "resumo" && resultado?.resumoExecutivo && (
        <div>
          <h3 style={{ color: "#e2e8f0", marginBottom: "1rem" }}>📈 Resumo Executivo</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ background: "rgba(99,102,241,0.1)", borderRadius: 12, padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#a5b4fc" }}>{resultado.resumoExecutivo.totalRequisitosIdentificados}</div>
              <div style={{ fontSize: "0.78rem", color: "#64748b" }}>Requisitos Identificados</div>
            </div>
            <div style={{ background: "rgba(16,185,129,0.1)", borderRadius: 12, padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#10b981" }}>{resultado.resumoExecutivo.coberturaGeral}%</div>
              <div style={{ fontSize: "0.78rem", color: "#64748b" }}>Cobertura Geral</div>
            </div>
            <div style={{ background: "rgba(139,92,246,0.1)", borderRadius: 12, padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#a78bfa" }}>{resultado.resumoExecutivo.posicaoMercado || "—"}%</div>
              <div style={{ fontSize: "0.78rem", color: "#64748b" }}>Posição vs Mercado</div>
            </div>
            <div style={{ background: resultado.resumoExecutivo.pipelineValidado ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", borderRadius: 12, padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: resultado.resumoExecutivo.pipelineValidado ? "#10b981" : "#ef4444" }}>{resultado.resumoExecutivo.pipelineValidado ? "✅" : "⚠️"}</div>
              <div style={{ fontSize: "0.78rem", color: "#64748b" }}>Pipeline Validado</div>
            </div>
            <div style={{ background: resultado.resumoExecutivo.temConcorrenteDireto ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)", borderRadius: 12, padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: resultado.resumoExecutivo.temConcorrenteDireto ? "#f59e0b" : "#10b981" }}>{resultado.resumoExecutivo.temConcorrenteDireto ? "⚠️" : "🏆"}</div>
              <div style={{ fontSize: "0.78rem", color: "#64748b" }}>Concorrente Direto</div>
            </div>
            <div style={{ background: resultado.resumoExecutivo.alertasConflito > 0 ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)", borderRadius: 12, padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: resultado.resumoExecutivo.alertasConflito > 0 ? "#ef4444" : "#10b981" }}>{resultado.resumoExecutivo.alertasConflito}</div>
              <div style={{ fontSize: "0.78rem", color: "#64748b" }}>Alertas de Conflito</div>
            </div>
          </div>

          {/* Distribuição por categoria */}
          <h4 style={{ color: "#94a3b8", marginBottom: "0.5rem", fontSize: "0.85rem" }}>Distribuição por Categoria</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.5rem" }}>
            {(resultado.resumoExecutivo.distribuicaoCategoria || []).map((cat, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "0.6rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#cbd5e1", fontSize: "0.82rem" }}>{cat.icon} {cat.categoria}</span>
                <span style={{ color: "#a5b4fc", fontWeight: 700, fontSize: "0.82rem" }}>{cat.total} ({cat.percentual}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
