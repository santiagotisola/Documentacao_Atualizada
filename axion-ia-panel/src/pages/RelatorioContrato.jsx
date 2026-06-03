import { useState, useEffect } from "react";
import { api } from "../services/api";

export default function RelatorioContrato() {
  const [contratos, setContratos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [relatorios, setRelatorios] = useState([]);
  const [filtroContrato, setFiltroContrato] = useState("");

  const [form, setForm] = useState({ contrato: "", tipo: "viabilidade-integracao", contexto: "" });
  const [gerando, setGerando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState("gerar"); // "gerar" | "historico" | "preview"
  const [arquivo, setArquivo] = useState(null);
  const [extraindo, setExtraindo] = useState(false);

  useEffect(() => {
    api.get("/relatorio-contrato/contratos").then(r => setContratos(r.data.contratos || [])).catch(() => {});
    api.get("/relatorio-contrato/tipos").then(r => setTipos(r.data.tipos || [])).catch(() => {});
    carregarHistorico();
  }, []);

  function carregarHistorico() {
    const params = filtroContrato ? `?contrato=${filtroContrato}` : "";
    api.get(`/relatorio-contrato${params}`).then(r => setRelatorios(r.data.relatorios || [])).catch(() => {});
  }

  useEffect(() => { carregarHistorico(); }, [filtroContrato]);

  async function handleGerar(e) {
    e.preventDefault();
    if (!form.contrato || !form.contexto.trim()) {
      setErro("Selecione um contrato e forneça o contexto/requisitos.");
      return;
    }
    setGerando(true);
    setErro(null);
    setResultado(null);
    try {
      const r = await api.post("/relatorio-contrato/gerar", form);
      setResultado(r.data);
      setAbaAtiva("preview");
      carregarHistorico();
    } catch (err) {
      setErro(err.response?.data?.erro || err.message || "Erro ao gerar relatório");
    }
    setGerando(false);
  }

  async function handleVerDetalhe(id) {
    try {
      const r = await api.get(`/relatorio-contrato/${id}`);
      setResultado(r.data);
      setAbaAtiva("preview");
    } catch {
      setErro("Erro ao carregar relatório");
    }
  }

  async function handleRemover(id) {
    if (!confirm("Remover este relatório?")) return;
    try {
      await api.delete(`/relatorio-contrato/${id}`);
      carregarHistorico();
      if (resultado?._id === id) setResultado(null);
    } catch {
      setErro("Erro ao remover");
    }
  }

  const contratosAxhub = contratos.filter(c => c.produto === "axhub");
  const contratosAxcross = contratos.filter(c => c.produto === "axcross");

  return (
    <div className="relatorio-contrato-page">
      {/* Abas */}
      <div className="rc-tabs">
        <button className={abaAtiva === "gerar" ? "active" : ""} onClick={() => setAbaAtiva("gerar")}>
          📝 Gerar Relatório
        </button>
        <button className={abaAtiva === "historico" ? "active" : ""} onClick={() => setAbaAtiva("historico")}>
          📋 Histórico ({relatorios.length})
        </button>
        {resultado && (
          <button className={abaAtiva === "preview" ? "active" : ""} onClick={() => setAbaAtiva("preview")}>
            📄 Visualizar
          </button>
        )}
      </div>

      {erro && <div className="rc-erro">{erro}</div>}

      {/* ─── Aba Gerar ─── */}
      {abaAtiva === "gerar" && (
        <form className="rc-form" onSubmit={handleGerar}>
          <div className="rc-form-row">
            <div className="rc-field">
              <label>Contrato / Site</label>
              <select value={form.contrato} onChange={e => setForm(f => ({ ...f, contrato: e.target.value }))}>
                <option value="">— Selecione o contrato —</option>
                <optgroup label="AxHub">
                  {contratosAxhub.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nome} — {c.orgao} ({c.estado})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="AxCross">
                  {contratosAxcross.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nome} — {c.orgao} ({c.estado})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="rc-field">
              <label>Tipo de Relatório</label>
              <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                {tipos.map(t => (
                  <option key={t.id} value={t.id}>{t.label} — {t.descricao}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="rc-field">
            <label>📎 Arquivo (ofício, edital, especificação)</label>
            <div className="rc-file-upload">
              <input
                type="file"
                accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.txt,.md,.png,.jpg,.jpeg"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setArquivo(file);
                  setExtraindo(true);
                  setErro(null);
                  try {
                    const fd = new FormData();
                    fd.append("arquivo", file);
                    const r = await api.post("/doc/upload-contexto", fd, {
                      headers: { "Content-Type": "multipart/form-data" },
                    });
                    setForm(f => ({ ...f, contexto: r.data.texto || "" }));
                  } catch (err) {
                    setErro("Erro ao extrair texto do arquivo: " + (err.response?.data?.erro || err.message));
                  }
                  setExtraindo(false);
                }}
              />
              {arquivo && (
                <span className="rc-file-info">
                  {arquivo.name} ({(arquivo.size / 1024).toFixed(0)} KB)
                  {extraindo && " — extraindo texto..."}
                </span>
              )}
            </div>
            <small>Selecione um arquivo PDF, Word, Excel, TXT ou imagem. O texto será extraído automaticamente.</small>
          </div>

          <div className="rc-field">
            <label>Contexto / Requisitos</label>
            <textarea
              rows={10}
              placeholder="O texto do arquivo aparecerá aqui automaticamente, ou digite/cole manualmente..."
              value={form.contexto}
              onChange={e => setForm(f => ({ ...f, contexto: e.target.value }))}
            />
            <small>Extraído do arquivo ou editável manualmente.</small>
          </div>

          <button type="submit" className="rc-btn-gerar" disabled={gerando}>
            {gerando ? "⏳ Gerando análise via IA..." : "🚀 Gerar Relatório"}
          </button>

          {/* Info do contrato selecionado */}
          {form.contrato && (() => {
            const sel = contratos.find(c => c.id === form.contrato);
            if (!sel) return null;
            return (
              <div className="rc-info-contrato">
                <h4>{sel.nome} — {sel.orgao}</h4>
                <div className="rc-info-grid">
                  <span><strong>Estado:</strong> {sel.estado}</span>
                  <span><strong>Tipo:</strong> {sel.tipo}</span>
                  <span><strong>Produto:</strong> {sel.produto}</span>
                  <span><strong>Status:</strong> {sel.status}</span>
                  {sel.equipamentos > 0 && <span><strong>Equipamentos:</strong> {sel.equipamentos}</span>}
                  {sel.fabricantes?.length > 0 && <span><strong>Fabricantes:</strong> {sel.fabricantes.join(", ")}</span>}
                </div>
              </div>
            );
          })()}
        </form>
      )}

      {/* ─── Aba Histórico ─── */}
      {abaAtiva === "historico" && (
        <div className="rc-historico">
          <div className="rc-filtro-historico">
            <select value={filtroContrato} onChange={e => setFiltroContrato(e.target.value)}>
              <option value="">Todos os contratos</option>
              {contratos.map(c => (
                <option key={c.id} value={c.id}>{c.nome} ({c.estado})</option>
              ))}
            </select>
          </div>

          {relatorios.length === 0 ? (
            <p className="rc-empty">Nenhum relatório gerado ainda.</p>
          ) : (
            <table className="rc-tabela">
              <thead>
                <tr>
                  <th>Contrato</th>
                  <th>Tipo</th>
                  <th>Título</th>
                  <th>Score</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {relatorios.map(r => (
                  <tr key={r._id}>
                    <td><strong>{r.contrato}</strong></td>
                    <td><span className="rc-badge">{r.tipo}</span></td>
                    <td>{r.titulo}</td>
                    <td>
                      <span className={`rc-score ${r.metadados?.score_viabilidade >= 70 ? "alto" : r.metadados?.score_viabilidade >= 40 ? "medio" : "baixo"}`}>
                        {r.metadados?.score_viabilidade || "—"}
                      </span>
                    </td>
                    <td>{new Date(r.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td>
                      <button className="rc-btn-sm" onClick={() => handleVerDetalhe(r._id)}>Ver</button>
                      <button className="rc-btn-sm danger" onClick={() => handleRemover(r._id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ─── Aba Preview ─── */}
      {abaAtiva === "preview" && resultado && (
        <div className="rc-preview">
          <div className="rc-preview-header">
            <h3>{resultado.titulo}</h3>
            {resultado.metadados?.score_viabilidade != null && (
              <div className={`rc-score-badge ${resultado.metadados.score_viabilidade >= 70 ? "alto" : resultado.metadados.score_viabilidade >= 40 ? "medio" : "baixo"}`}>
                Score: {resultado.metadados.score_viabilidade}/100
              </div>
            )}
            {resultado.metadados?.tempo_geracao_ms && (
              <small>Gerado em {(resultado.metadados.tempo_geracao_ms / 1000).toFixed(1)}s</small>
            )}
          </div>

          {/* Render markdown simples */}
          <div className="rc-markdown">
            <pre>{resultado.markdown}</pre>
          </div>

          {/* Dados estruturados */}
          {resultado.resultado?.campos_analise && (
            <div className="rc-campos-table">
              <h4>Mapeamento de Campos</h4>
              <table>
                <thead>
                  <tr>
                    <th>Campo</th>
                    <th>Status</th>
                    <th>Fonte AxHub</th>
                    <th>Obs</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.resultado.campos_analise.map((c, i) => (
                    <tr key={i} className={`status-${c.status?.toLowerCase()}`}>
                      <td><strong>{c.campo_solicitado}</strong></td>
                      <td>
                        <span className={`rc-status-icon ${c.status}`}>
                          {c.status === "DISPONIVEL" ? "✅" : c.status === "PARCIAL" ? "⚠️" : "❌"}
                          {" "}{c.status}
                        </span>
                      </td>
                      <td>{c.fonte_axhub || "—"}</td>
                      <td>{c.observacao || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <style>{`
        .relatorio-contrato-page { max-width: 1100px; margin: 0 auto; }
        .rc-tabs { display: flex; gap: 4px; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 0; }
        .rc-tabs button { padding: 10px 20px; border: none; background: transparent; cursor: pointer; font-size: 14px; font-weight: 500; border-bottom: 3px solid transparent; color: #64748b; transition: all .2s; }
        .rc-tabs button.active { color: #2563eb; border-bottom-color: #2563eb; }
        .rc-tabs button:hover:not(.active) { color: #334155; }
        .rc-erro { background: #fef2f2; border: 1px solid #fca5a5; color: #dc2626; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; }
        .rc-form { display: flex; flex-direction: column; gap: 16px; }
        .rc-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .rc-field { display: flex; flex-direction: column; gap: 6px; }
        .rc-field label { font-weight: 600; font-size: 13px; color: #374151; }
        .rc-field select, .rc-field textarea { padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; }
        .rc-field textarea { font-family: 'JetBrains Mono', monospace; resize: vertical; min-height: 160px; }
        .rc-field small { color: #6b7280; font-size: 12px; }
        .rc-btn-gerar { padding: 14px 28px; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all .2s; }
        .rc-btn-gerar:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,235,.3); }
        .rc-btn-gerar:disabled { opacity: .6; cursor: wait; }
        .rc-info-contrato { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-top: 8px; }
        .rc-info-contrato h4 { margin: 0 0 10px; font-size: 15px; color: #1e293b; }
        .rc-info-grid { display: flex; flex-wrap: wrap; gap: 12px 24px; font-size: 13px; color: #475569; }
        .rc-historico { }
        .rc-filtro-historico { margin-bottom: 16px; }
        .rc-filtro-historico select { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; }
        .rc-tabela { width: 100%; border-collapse: collapse; font-size: 13px; }
        .rc-tabela th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0; }
        .rc-tabela td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
        .rc-tabela tr:hover td { background: #f8fafc; }
        .rc-badge { background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
        .rc-score { font-weight: 700; font-size: 14px; }
        .rc-score.alto { color: #16a34a; }
        .rc-score.medio { color: #d97706; }
        .rc-score.baixo { color: #dc2626; }
        .rc-btn-sm { padding: 4px 10px; border: 1px solid #d1d5db; background: white; border-radius: 4px; cursor: pointer; font-size: 12px; margin-right: 4px; }
        .rc-btn-sm:hover { background: #f1f5f9; }
        .rc-btn-sm.danger:hover { background: #fef2f2; border-color: #fca5a5; }
        .rc-empty { color: #6b7280; text-align: center; padding: 40px 0; }
        .rc-preview { }
        .rc-preview-header { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0; }
        .rc-preview-header h3 { margin: 0; font-size: 18px; color: #1e293b; }
        .rc-score-badge { padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 14px; }
        .rc-score-badge.alto { background: #dcfce7; color: #166534; }
        .rc-score-badge.medio { background: #fef3c7; color: #92400e; }
        .rc-score-badge.baixo { background: #fef2f2; color: #991b1b; }
        .rc-markdown { background: #1e293b; color: #e2e8f0; padding: 20px; border-radius: 10px; overflow-x: auto; margin-bottom: 20px; }
        .rc-markdown pre { margin: 0; white-space: pre-wrap; font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.6; }
        .rc-campos-table { margin-top: 16px; }
        .rc-campos-table h4 { margin-bottom: 12px; }
        .rc-campos-table table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .rc-campos-table th { background: #f1f5f9; padding: 8px 12px; text-align: left; font-weight: 600; }
        .rc-campos-table td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
        .rc-status-icon.DISPONIVEL { color: #16a34a; }
        .rc-status-icon.PARCIAL { color: #d97706; }
        .rc-status-icon.INDISPONIVEL { color: #dc2626; }
        tr.status-indisponivel td { background: #fef2f2; }
        tr.status-parcial td { background: #fffbeb; }
        @media (max-width: 768px) {
          .rc-form-row { grid-template-columns: 1fr; }
          .rc-tabs { flex-wrap: wrap; }
        }
      `}</style>
    </div>
  );
}
