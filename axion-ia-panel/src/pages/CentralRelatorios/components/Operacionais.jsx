import { useState, useEffect } from "react";
import { api } from "../../../services/api";

export default function Operacionais({ siteContexto = null }) {
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
    api.get("/relatorio-contrato/contratos").then(r => {
      const lista = r.data.contratos || [];
      setContratos(lista);
      // Pr\u00e9-selecionar contrato pelo nome do site ativo
      if (siteContexto?.nome) {
        const match = lista.find(c =>
          c.toLowerCase().includes(siteContexto.nome.toLowerCase()) ||
          siteContexto.nome.toLowerCase().includes(c.toLowerCase())
        );
        if (match) {
          setFiltroContrato(match);
          setForm(prev => ({ ...prev, contrato: match }));
        }
      }
    }).catch(() => {});
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
      setErro("Selecione um contrato e forne�a o contexto/requisitos.");
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
      setErro(err.response?.data?.erro || err.message || "Erro ao gerar relat�rio");
    }
    setGerando(false);
  }

  async function handleVerDetalhe(id) {
    try {
      const r = await api.get(`/relatorio-contrato/${id}`);
      setResultado(r.data);
      setAbaAtiva("preview");
    } catch {
      setErro("Erro ao carregar relat�rio");
    }
  }

  async function handleRemover(id) {
    if (!confirm("Remover este relat�rio?")) return;
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
          ?? Gerar Relat�rio
        </button>
        <button className={abaAtiva === "historico" ? "active" : ""} onClick={() => setAbaAtiva("historico")}>
          ?? Hist�rico ({relatorios.length})
        </button>
        {resultado && (
          <button className={abaAtiva === "preview" ? "active" : ""} onClick={() => setAbaAtiva("preview")}>
            ?? Visualizar
          </button>
        )}
      </div>

      {erro && <div className="rc-erro">{erro}</div>}

      {/* --- Aba Gerar --- */}
      {abaAtiva === "gerar" && (
        <form className="rc-form" onSubmit={handleGerar}>
          <div className="rc-form-row">
            <div className="rc-field">
              <label>Contrato / Site</label>
              <select value={form.contrato} onChange={e => setForm(f => ({ ...f, contrato: e.target.value }))}>
                <option value="">� Selecione o contrato �</option>
                <optgroup label="AxHub">
                  {contratosAxhub.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nome} � {c.orgao} ({c.estado})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="AxCross">
                  {contratosAxcross.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nome} � {c.orgao} ({c.estado})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="rc-field">
              <label>Tipo de Relat�rio</label>
              <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                {tipos.map(t => (
                  <option key={t.id} value={t.id}>{t.label} � {t.descricao}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="rc-field">
            <label>?? Arquivo (of�cio, edital, especifica��o)</label>
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
                  {extraindo && " � extraindo texto..."}
                </span>
              )}
            </div>
            <small>Selecione um arquivo PDF, Word, Excel, TXT ou imagem. O texto ser� extra�do automaticamente.</small>
          </div>

          <div className="rc-field">
            <label>Contexto / Requisitos</label>
            <textarea
              rows={10}
              placeholder="O texto do arquivo aparecer� aqui automaticamente, ou digite/cole manualmente..."
              value={form.contexto}
              onChange={e => setForm(f => ({ ...f, contexto: e.target.value }))}
            />
            <small>Extra�do do arquivo ou edit�vel manualmente.</small>
          </div>

          <button type="submit" className="rc-btn-gerar" disabled={gerando}>
            {gerando ? "? Gerando an�lise via IA..." : "?? Gerar Relat�rio"}
          </button>

          {/* Info do contrato selecionado � Dashboard r�pido */}
          {form.contrato && (() => {
            const sel = contratos.find(c => c.id === form.contrato);
            if (!sel) return null;
            return (
              <div className="rc-info-contrato">
                <h4>{sel.nome} � {sel.orgao}</h4>
                <div className="rc-info-grid">
                  <span><strong>Estado:</strong> {sel.estado}</span>
                  <span><strong>Tipo:</strong> {sel.tipo}</span>
                  <span><strong>Produto:</strong> {sel.produto}</span>
                  <span><strong>Status:</strong> {sel.status === "ativo" ? "?? Ativo" : "?? " + sel.status}</span>
                </div>
                {/* Mini KPIs do contrato */}
                <div className="rc-mini-kpis">
                  {sel.equipamentos > 0 && (
                    <div className="rc-mini-kpi">
                      <span className="rc-mini-val">{sel.equipamentos}</span>
                      <span className="rc-mini-lbl">Equip.</span>
                    </div>
                  )}
                  {sel.ocr != null && (
                    <div className={`rc-mini-kpi ${sel.ocr >= 90 ? "ok" : sel.ocr >= 75 ? "warn" : "fail"}`}>
                      <span className="rc-mini-val">{sel.ocr}%</span>
                      <span className="rc-mini-lbl">OCR</span>
                    </div>
                  )}
                  {sel.bi_reports > 0 && (
                    <div className="rc-mini-kpi">
                      <span className="rc-mini-val">{sel.bi_reports}</span>
                      <span className="rc-mini-lbl">BI Reports</span>
                    </div>
                  )}
                  {sel.passagens_dia != null && (
                    <div className="rc-mini-kpi">
                      <span className="rc-mini-val">{(sel.passagens_dia / 1000).toFixed(0)}k</span>
                      <span className="rc-mini-lbl">Pass./dia</span>
                    </div>
                  )}
                  {sel.fabricantes?.length > 0 && (
                    <div className="rc-mini-kpi">
                      <span className="rc-mini-val">{sel.fabricantes.join(", ")}</span>
                      <span className="rc-mini-lbl">Fabricantes</span>
                    </div>
                  )}
                  {sel.versao && (
                    <div className="rc-mini-kpi">
                      <span className="rc-mini-val">{sel.versao}</span>
                      <span className="rc-mini-lbl">Vers�o</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </form>
      )}

      {/* --- Aba Hist�rico --- */}
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
            <p className="rc-empty">Nenhum Relat�rio gerado ainda.</p>
          ) : (
            <table className="rc-tabela">
              <thead>
                <tr>
                  <th>Contrato</th>
                  <th>Tipo</th>
                  <th>T�tulo</th>
                  <th>Score</th>
                  <th>Data</th>
                  <th>A��es</th>
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
                        {r.metadados?.score_viabilidade || "�"}
                      </span>
                    </td>
                    <td>{new Date(r.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td>
                      <button className="rc-btn-sm" onClick={() => handleVerDetalhe(r._id)}>Ver</button>
                      <button className="rc-btn-sm danger" onClick={() => handleRemover(r._id)}>???</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* --- Aba Preview --- */}
      {abaAtiva === "preview" && resultado && (() => {
        const res = resultado.resultado || {};
        const meta = resultado.metadados || {};
        const score = meta.score_viabilidade ?? res.score_viabilidade ?? res.score_cobertura ?? null;
        const scoreClass = score >= 70 ? "alto" : score >= 40 ? "medio" : "baixo";
        const scoreLabel = score >= 70 ? "VI�VEL" : score >= 40 ? "PARCIAL" : "CR�TICO";
        const camposDisp = res.campos_analise?.filter(c => c.status === "DISPONIVEL").length || meta.campos_disponiveis || 0;
        const camposParcial = res.campos_analise?.filter(c => c.status === "PARCIAL").length || 0;
        const camposFalt = res.campos_analise?.filter(c => c.status === "INDISPONIVEL").length || meta.campos_faltantes || 0;
        const totalCampos = camposDisp + camposParcial + camposFalt;
        const gaps = res.gaps?.length || res.gaps_identificados?.length || 0;
        const metricas = res.metricas || {};

        // Contrato selecionado
        const siteInfo = contratos.find(c => c.id === resultado.contrato);

        return (
          <div className="rc-preview">
            {/* -- Cabe�alho executivo -- */}
            <div className="rc-exec-header">
              <div className="rc-exec-title">
                <h3>{resultado.titulo}</h3>
                <div className="rc-exec-meta">
                  {siteInfo && <span>?? {siteInfo.orgao} � {siteInfo.estado}</span>}
                  <span>?? {new Date(resultado.createdAt || Date.now()).toLocaleDateString("pt-BR")}</span>
                  {meta.tempo_geracao_ms && <span>?? {(meta.tempo_geracao_ms / 1000).toFixed(1)}s</span>}
                  {meta.gerado_por_ia && <span className="rc-ia-badge">?? IA</span>}
                </div>
              </div>
              {score != null && (
                <div className={`rc-score-ring ${scoreClass}`}>
                  <div className="rc-score-number">{score}</div>
                  <div className="rc-score-label">{scoreLabel}</div>
                </div>
              )}
            </div>

            {/* -- Dashboard de KPIs -- */}
            <div className="rc-kpi-grid">
              {score != null && (
                <div className={`rc-kpi-card ${scoreClass}`}>
                  <div className="rc-kpi-icon">??</div>
                  <div className="rc-kpi-value">{score}<small>/100</small></div>
                  <div className="rc-kpi-label">Score Geral</div>
                  <div className="rc-kpi-bar">
                    <div className="rc-kpi-bar-fill" style={{ width: `${score}%` }}></div>
                  </div>
                </div>
              )}

              {totalCampos > 0 && (
                <div className="rc-kpi-card">
                  <div className="rc-kpi-icon">???</div>
                  <div className="rc-kpi-value">{camposDisp}<small>/{totalCampos}</small></div>
                  <div className="rc-kpi-label">Campos Dispon�veis</div>
                  <div className="rc-kpi-breakdown">
                    <span className="rc-kpi-ok">? {camposDisp}</span>
                    <span className="rc-kpi-warn">?? {camposParcial}</span>
                    <span className="rc-kpi-fail">? {camposFalt}</span>
                  </div>
                </div>
              )}

              {gaps > 0 && (
                <div className="rc-kpi-card alerta">
                  <div className="rc-kpi-icon">??</div>
                  <div className="rc-kpi-value">{gaps}</div>
                  <div className="rc-kpi-label">Gaps Identificados</div>
                  <div className="rc-kpi-hint">Requer aten��o</div>
                </div>
              )}

              {metricas.equipamentos != null && (
                <div className="rc-kpi-card">
                  <div className="rc-kpi-icon">??</div>
                  <div className="rc-kpi-value">{metricas.equipamentos}</div>
                  <div className="rc-kpi-label">Equipamentos</div>
                  {metricas.fabricantes?.length > 0 && (
                    <div className="rc-kpi-hint">{metricas.fabricantes.join(", ")}</div>
                  )}
                </div>
              )}

              {metricas.passagens_dia != null && (
                <div className="rc-kpi-card">
                  <div className="rc-kpi-icon">??</div>
                  <div className="rc-kpi-value">{metricas.passagens_dia.toLocaleString("pt-BR")}</div>
                  <div className="rc-kpi-label">Passagens/dia</div>
                </div>
              )}

              {metricas.ocr != null && (
                <div className={`rc-kpi-card ${metricas.ocr >= 90 ? "alto" : metricas.ocr >= 75 ? "medio" : "baixo"}`}>
                  <div className="rc-kpi-icon">??</div>
                  <div className="rc-kpi-value">{metricas.ocr}%</div>
                  <div className="rc-kpi-label">�ndice OCR</div>
                  <div className="rc-kpi-bar">
                    <div className="rc-kpi-bar-fill" style={{ width: `${metricas.ocr}%` }}></div>
                  </div>
                </div>
              )}

              {metricas.bi_reports != null && (
                <div className="rc-kpi-card">
                  <div className="rc-kpi-icon">??</div>
                  <div className="rc-kpi-value">{metricas.bi_reports}</div>
                  <div className="rc-kpi-label">Relat�rios BI</div>
                </div>
              )}

              {res.status_geral && (
                <div className={`rc-kpi-card ${res.status_geral === "operacional" ? "alto" : res.status_geral === "atencao" ? "medio" : "baixo"}`}>
                  <div className="rc-kpi-icon">{res.status_geral === "operacional" ? "??" : res.status_geral === "atencao" ? "??" : "??"}</div>
                  <div className="rc-kpi-value" style={{ fontSize: "16px" }}>{res.status_geral.toUpperCase()}</div>
                  <div className="rc-kpi-label">Status Operacional</div>
                </div>
              )}

              {res.estimativa_esforco && (
                <div className="rc-kpi-card">
                  <div className="rc-kpi-icon">?</div>
                  <div className="rc-kpi-value" style={{ fontSize: "16px" }}>{res.estimativa_esforco.toUpperCase()}</div>
                  <div className="rc-kpi-label">Esfor�o Estimado</div>
                </div>
              )}
            </div>

            {/* -- Resumo Executivo -- */}
            {res.resumo && (
              <div className="rc-section rc-resumo">
                <h4>?? Resumo Executivo</h4>
                <p>{res.resumo}</p>
              </div>
            )}

            {/* -- Indicadores de Decis�o (pontos destaque + riscos + oportunidades) -- */}
            {(res.pontos_destaque?.length > 0 || res.riscos?.length > 0 || res.oportunidades?.length > 0) && (
              <div className="rc-decisao-grid">
                {res.pontos_destaque?.length > 0 && (
                  <div className="rc-decisao-card destaque">
                    <h5>? Pontos Fortes</h5>
                    <ul>{res.pontos_destaque.map((p, i) => <li key={i}>{p}</li>)}</ul>
                  </div>
                )}
                {res.riscos?.length > 0 && (
                  <div className="rc-decisao-card risco">
                    <h5>?? Riscos</h5>
                    <ul>{res.riscos.map((r, i) => <li key={i}>{r}</li>)}</ul>
                  </div>
                )}
                {res.oportunidades?.length > 0 && (
                  <div className="rc-decisao-card oportunidade">
                    <h5>?? Oportunidades</h5>
                    <ul>{res.oportunidades.map((o, i) => <li key={i}>{o}</li>)}</ul>
                  </div>
                )}
              </div>
            )}

            {/* -- Requisitos atendidos -- */}
            {res.requisitos_atendidos?.length > 0 && (
              <div className="rc-section">
                <h4>? Requisitos Atendidos ({res.requisitos_atendidos.length})</h4>
                <div className="rc-req-list">
                  {res.requisitos_atendidos.map((r, i) => (
                    <div key={i} className="rc-req-item ok">
                      <span className="rc-req-badge">?</span>
                      <div>
                        <strong>{r.requisito}</strong>
                        <small>{r.como}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* -- Gaps -- */}
            {res.gaps_identificados?.length > 0 && (
              <div className="rc-section">
                <h4>?? Gaps Identificados ({res.gaps_identificados.length})</h4>
                <div className="rc-req-list">
                  {res.gaps_identificados.map((g, i) => (
                    <div key={i} className={`rc-req-item gap sev-${g.severidade}`}>
                      <span className="rc-req-badge">{g.severidade === "critico" ? "??" : g.severidade === "medio" ? "??" : "??"}</span>
                      <div>
                        <strong>{g.requisito}</strong>
                        <small>Proposta: {g.proposta}</small>
                        <span className="rc-sev-tag">{g.severidade}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* -- Mapeamento de Campos (tabela detalhada) -- */}
            {res.campos_analise?.length > 0 && (
              <div className="rc-section">
                <h4>??? Mapeamento de Campos ({totalCampos})</h4>
                <div className="rc-campos-summary">
                  <span className="rc-chip ok">? {camposDisp} dispon�veis</span>
                  <span className="rc-chip warn">?? {camposParcial} parciais</span>
                  <span className="rc-chip fail">? {camposFalt} indispon�veis</span>
                </div>
                <table className="rc-campos-table">
                  <thead>
                    <tr>
                      <th>Campo Solicitado</th>
                      <th>Status</th>
                      <th>Fonte AxHub</th>
                      <th>Observa��o</th>
                    </tr>
                  </thead>
                  <tbody>
                    {res.campos_analise.map((c, i) => (
                      <tr key={i} className={`status-${c.status?.toLowerCase()}`}>
                        <td><strong>{c.campo_solicitado}</strong></td>
                        <td>
                          <span className={`rc-status-pill ${c.status?.toLowerCase()}`}>
                            {c.status === "DISPONIVEL" ? "?" : c.status === "PARCIAL" ? "??" : "?"}
                            {" "}{c.status}
                          </span>
                        </td>
                        <td><code>{c.fonte_axhub || "�"}</code></td>
                        <td>{c.observacao || "�"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* -- Op��es de Entrega -- */}
            {res.opcoes_entrega?.length > 0 && (
              <div className="rc-section">
                <h4>?? Op��es de Entrega</h4>
                <div className="rc-opcoes-grid">
                  {res.opcoes_entrega.map((op, i) => (
                    <div key={i} className="rc-opcao-card">
                      <div className="rc-opcao-header">
                        <span className="rc-opcao-letra">{op.opcao}</span>
                        <strong>{op.titulo}</strong>
                        <span className={`rc-esforco-tag ${op.esforco?.toLowerCase()}`}>{op.esforco}</span>
                      </div>
                      <p>{op.descricao}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* -- Recomenda��es / Pr�ximos Passos -- */}
            {(res.recomendacoes?.length > 0 || res.proximos_passos?.length > 0) && (
              <div className="rc-section">
                <h4>?? Pr�ximos Passos</h4>
                <ol className="rc-passos-list">
                  {(res.proximos_passos || res.recomendacoes || []).map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* -- SQL Proposta -- */}
            {res.query_sql && (
              <div className="rc-section">
                <h4>?? Query SQL Proposta</h4>
                <pre className="rc-sql-block">{res.query_sql}</pre>
              </div>
            )}

            {/* -- Markdown completo (colaps�vel) -- */}
            <details className="rc-section rc-markdown-details">
              <summary>?? Relat�rio completo (Markdown)</summary>
              <div className="rc-markdown">
                <pre>{resultado.markdown}</pre>
              </div>
            </details>
          </div>
        );
      })()}

      <style>{`
        .relatorio-contrato-page { max-width: 1200px; margin: 0 auto; }

        /* -- Tabs -- */
        .rc-tabs { display: flex; gap: 4px; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 0; }
        .rc-tabs button { padding: 10px 20px; border: none; background: transparent; cursor: pointer; font-size: 14px; font-weight: 500; border-bottom: 3px solid transparent; color: #6b7280; transition: all .2s; }
        .rc-tabs button.active { color: #3b82f6; border-bottom-color: #3b82f6; }
        .rc-tabs button:hover:not(.active) { color: #111827; }

        /* -- Form -- */
        .rc-erro { background: #fef2f2; border: 1px solid #fca5a5; color: #dc2626; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; }
        .rc-form { display: flex; flex-direction: column; gap: 16px; }
        .rc-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .rc-field { display: flex; flex-direction: column; gap: 6px; }
        .rc-field label { font-weight: 600; font-size: 13px; color: #374151; }
        .rc-field select, .rc-field textarea { padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: #fff; color: #111827; }
        .rc-field select:focus, .rc-field textarea:focus { border-color: #3b82f6; outline: none; box-shadow: 0 0 0 2px rgba(59,130,246,0.1); }
        .rc-field textarea { font-family: 'JetBrains Mono', monospace; resize: vertical; min-height: 160px; }
        .rc-field small { color: #6b7280; font-size: 12px; }
        .rc-file-upload input[type="file"] { color: #374151; }
        .rc-file-info { color: #3b82f6; font-size: 12px; }
        .rc-btn-gerar { padding: 14px 28px; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all .2s; }
        .rc-btn-gerar:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,235,.3); }
        .rc-btn-gerar:disabled { opacity: .6; cursor: wait; }
        .rc-info-contrato { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin-top: 8px; }
        .rc-info-contrato h4 { margin: 0 0 10px; font-size: 15px; color: #111827; }
        .rc-info-grid { display: flex; flex-wrap: wrap; gap: 12px 24px; font-size: 13px; color: #6b7280; margin-bottom: 14px; }
        .rc-mini-kpis { display: flex; gap: 10px; flex-wrap: wrap; padding-top: 12px; border-top: 1px solid #e5e7eb; }
        .rc-mini-kpi { display: flex; flex-direction: column; align-items: center; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 14px; min-width: 70px; }
        .rc-mini-kpi.ok { border-color: rgba(34,197,94,0.4); background: rgba(34,197,94,0.04); }
        .rc-mini-kpi.warn { border-color: rgba(245,158,11,0.4); background: rgba(245,158,11,0.04); }
        .rc-mini-kpi.fail { border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.04); }
        .rc-mini-val { font-size: 16px; font-weight: 700; color: #111827; }
        .rc-mini-kpi.ok .rc-mini-val { color: #16a34a; }
        .rc-mini-kpi.warn .rc-mini-val { color: #d97706; }
        .rc-mini-kpi.fail .rc-mini-val { color: #dc2626; }
        .rc-mini-lbl { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.3px; margin-top: 2px; }

        /* -- Hist�rico -- */
        .rc-filtro-historico { margin-bottom: 16px; }
        .rc-filtro-historico select { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; background: #fff; color: #111827; }
        .rc-tabela { width: 100%; border-collapse: collapse; font-size: 13px; }
        .rc-tabela th { background: #f9fafb; padding: 10px 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; }
        .rc-tabela td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #111827; }
        .rc-tabela tr:hover td { background: #f0f9ff; }
        .rc-badge { background: #eff6ff; color: #3b82f6; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
        .rc-score { font-weight: 700; font-size: 14px; }
        .rc-score.alto { color: #16a34a; }
        .rc-score.medio { color: #d97706; }
        .rc-score.baixo { color: #dc2626; }
        .rc-btn-sm { padding: 4px 10px; border: 1px solid #e5e7eb; background: #fff; border-radius: 4px; cursor: pointer; font-size: 12px; margin-right: 4px; color: #374151; }
        .rc-btn-sm:hover { background: #eff6ff; border-color: #bfdbfe; }
        .rc-btn-sm.danger:hover { background: #fef2f2; border-color: #fca5a5; }
        .rc-empty { color: #9ca3af; text-align: center; padding: 40px 0; }

        /* -- PREVIEW � Executive Layout -- */
        .rc-exec-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb; }
        .rc-exec-title h3 { margin: 0 0 8px; font-size: 20px; color: #111827; font-weight: 700; }
        .rc-exec-meta { display: flex; gap: 16px; flex-wrap: wrap; font-size: 12px; color: #6b7280; }
        .rc-ia-badge { background: #f5f3ff; color: #7c3aed; padding: 2px 8px; border-radius: 4px; font-weight: 600; }

        /* Score Ring */
        .rc-score-ring { width: 80px; height: 80px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; border: 4px solid; }
        .rc-score-ring.alto { border-color: #22c55e; background: rgba(34,197,94,0.06); }
        .rc-score-ring.medio { border-color: #f59e0b; background: rgba(245,158,11,0.06); }
        .rc-score-ring.baixo { border-color: #ef4444; background: rgba(239,68,68,0.06); }
        .rc-score-number { font-size: 24px; font-weight: 800; color: #111827; line-height: 1; }
        .rc-score-label { font-size: 9px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
        .rc-score-ring.alto .rc-score-label { color: #16a34a; }
        .rc-score-ring.medio .rc-score-label { color: #d97706; }
        .rc-score-ring.baixo .rc-score-label { color: #dc2626; }

        /* -- KPI Grid -- */
        .rc-kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 24px; }
        .rc-kpi-card { background: #fff; border: 1px solid #e5e7eb; border-top: 3px solid #e5e7eb; border-radius: 12px; padding: 16px; text-align: center; transition: all .2s; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .rc-kpi-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); transform: translateY(-2px); }
        .rc-kpi-card.alto { border-top-color: #22c55e; }
        .rc-kpi-card.medio { border-top-color: #f59e0b; }
        .rc-kpi-card.baixo { border-top-color: #ef4444; }
        .rc-kpi-card.alerta { border-top-color: #ef4444; background: #fef2f2; }
        .rc-kpi-icon { font-size: 20px; margin-bottom: 6px; }
        .rc-kpi-value { font-size: 28px; font-weight: 800; color: #111827; line-height: 1.2; }
        .rc-kpi-value small { font-size: 14px; font-weight: 400; color: #6b7280; }
        .rc-kpi-label { font-size: 11px; color: #6b7280; margin-top: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
        .rc-kpi-bar { height: 4px; background: #e5e7eb; border-radius: 2px; margin-top: 8px; overflow: hidden; }
        .rc-kpi-bar-fill { height: 100%; border-radius: 2px; transition: width .6s ease; }
        .rc-kpi-card.alto .rc-kpi-bar-fill { background: #22c55e; }
        .rc-kpi-card.medio .rc-kpi-bar-fill { background: #f59e0b; }
        .rc-kpi-card.baixo .rc-kpi-bar-fill { background: #ef4444; }
        .rc-kpi-breakdown { display: flex; gap: 8px; justify-content: center; margin-top: 8px; font-size: 11px; }
        .rc-kpi-ok { color: #16a34a; }
        .rc-kpi-warn { color: #d97706; }
        .rc-kpi-fail { color: #dc2626; }
        .rc-kpi-hint { font-size: 10px; color: #6b7280; margin-top: 4px; }

        /* -- Sections -- */
        .rc-section { margin-bottom: 20px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; }
        .rc-section h4 { margin: 0 0 14px; font-size: 15px; color: #111827; font-weight: 700; }
        .rc-resumo p { color: #374151; font-size: 14px; line-height: 1.7; margin: 0; }

        /* -- Decis�o Grid -- */
        .rc-decisao-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 24px; }
        .rc-decisao-card { border-radius: 12px; padding: 16px; border: 1px solid #e5e7eb; background: #fff; }
        .rc-decisao-card.destaque { background: rgba(34,197,94,0.04); border-color: rgba(34,197,94,0.25); }
        .rc-decisao-card.risco { background: rgba(239,68,68,0.04); border-color: rgba(239,68,68,0.25); }
        .rc-decisao-card.oportunidade { background: rgba(59,130,246,0.04); border-color: rgba(59,130,246,0.25); }
        .rc-decisao-card h5 { margin: 0 0 10px; font-size: 13px; font-weight: 700; }
        .rc-decisao-card.destaque h5 { color: #16a34a; }
        .rc-decisao-card.risco h5 { color: #dc2626; }
        .rc-decisao-card.oportunidade h5 { color: #2563eb; }
        .rc-decisao-card ul { list-style: none; padding: 0; margin: 0; }
        .rc-decisao-card li { padding: 5px 0; font-size: 13px; color: #374151; border-bottom: 1px solid #f1f5f9; }
        .rc-decisao-card li:last-child { border-bottom: none; }
        .rc-decisao-card li::before { content: "? "; opacity: 0.4; }

        /* -- Requisitos / Gaps list -- */
        .rc-req-list { display: flex; flex-direction: column; gap: 8px; }
        .rc-req-item { display: flex; gap: 12px; align-items: flex-start; padding: 10px 14px; border-radius: 8px; background: #fff; border: 1px solid #e5e7eb; }
        .rc-req-item.ok { border-left: 3px solid #22c55e; }
        .rc-req-item.gap { border-left: 3px solid #ef4444; }
        .rc-req-item.gap.sev-medio { border-left-color: #f59e0b; }
        .rc-req-item.gap.sev-baixo { border-left-color: #3b82f6; }
        .rc-req-badge { font-size: 16px; flex-shrink: 0; margin-top: 2px; }
        .rc-req-item div { display: flex; flex-direction: column; gap: 2px; }
        .rc-req-item strong { font-size: 13px; color: #111827; }
        .rc-req-item small { font-size: 12px; color: #6b7280; }
        .rc-sev-tag { display: inline-block; margin-top: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; background: #fef2f2; color: #dc2626; width: fit-content; }

        /* -- Campos Table -- */
        .rc-campos-summary { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
        .rc-chip { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; }
        .rc-chip.ok { background: #f0fdf4; color: #16a34a; }
        .rc-chip.warn { background: #fffbeb; color: #d97706; }
        .rc-chip.fail { background: #fef2f2; color: #dc2626; }
        .rc-campos-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .rc-campos-table th { background: #f9fafb; padding: 10px 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb; }
        .rc-campos-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #111827; }
        .rc-campos-table code { background: #eff6ff; color: #2563eb; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
        .rc-status-pill { padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
        .rc-status-pill.disponivel { background: #f0fdf4; color: #16a34a; }
        .rc-status-pill.parcial { background: #fffbeb; color: #d97706; }
        .rc-status-pill.indisponivel { background: #fef2f2; color: #dc2626; }
        tr.status-indisponivel td { background: #fef9f9; }
        tr.status-parcial td { background: #fffdf4; }

        /* -- Op��es de Entrega -- */
        .rc-opcoes-grid { display: grid; gap: 10px; }
        .rc-opcao-card { padding: 14px; border-radius: 8px; background: #fff; border: 1px solid #e5e7eb; }
        .rc-opcao-header { display: flex; gap: 10px; align-items: center; margin-bottom: 6px; }
        .rc-opcao-letra { background: #2563eb; color: white; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; flex-shrink: 0; }
        .rc-opcao-header strong { color: #111827; font-size: 14px; }
        .rc-esforco-tag { padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
        .rc-esforco-tag.baixo { background: #f0fdf4; color: #16a34a; }
        .rc-esforco-tag.medio { background: #fffbeb; color: #d97706; }
        .rc-esforco-tag.alto { background: #fef2f2; color: #dc2626; }
        .rc-opcao-card p { margin: 0; font-size: 13px; color: #374151; }

        /* -- Passos / Recomenda��es -- */
        .rc-passos-list { padding-left: 20px; margin: 0; }
        .rc-passos-list li { padding: 6px 0; color: #374151; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
        .rc-passos-list li:last-child { border-bottom: none; }
        .rc-passos-list li::marker { color: #3b82f6; font-weight: 700; }

        /* -- SQL Block -- */
        .rc-sql-block { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #1e40af; overflow-x: auto; white-space: pre-wrap; margin: 0; }

        /* -- Markdown -- */
        .rc-markdown-details { cursor: pointer; }
        .rc-markdown-details summary { font-size: 13px; color: #6b7280; font-weight: 600; cursor: pointer; padding: 4px 0; }
        .rc-markdown-details summary:hover { color: #3b82f6; }
        .rc-markdown { background: #f8fafc; color: #111827; padding: 20px; border-radius: 8px; overflow-x: auto; margin-top: 12px; border: 1px solid #e5e7eb; }
        .rc-markdown pre { margin: 0; white-space: pre-wrap; font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1.6; }

        @media (max-width: 768px) {
          .rc-form-row { grid-template-columns: 1fr; }
          .rc-tabs { flex-wrap: wrap; }
          .rc-exec-header { flex-direction: column; }
          .rc-kpi-grid { grid-template-columns: repeat(2, 1fr); }
          .rc-decisao-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
