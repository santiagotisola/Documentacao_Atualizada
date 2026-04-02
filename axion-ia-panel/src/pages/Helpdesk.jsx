import { useEffect, useState, useRef } from "react";
import { api } from "../services/api";

export default function Helpdesk() {
  const [tickets, setTickets]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [ticketSel, setTicketSel]   = useState(null);
  const [detalhes, setDetalhes]     = useState(null);
  const [carregandoDet, setCarregandoDet] = useState(false);
  const [modo, setModo]             = useState(0);
  const [acao, setAcao]             = useState(null);
  const [novoTicket, setNovoTicket] = useState({ subject: "", body: "", categoryId: "" });
  const [categorias, setCategorias] = useState([]);
  const [view, setView]             = useState("lista");

  // Polling
  const [polling, setPolling]       = useState(null);
  const [intervalo, setIntervalo]   = useState(2);
  const [pollingAcao, setPollingAcao] = useState(null);
  const pollingTimer = useRef(null);

  // Fila de revisao
  const [fila, setFila]             = useState(null);
  const [itemSel, setItemSel]       = useState(null);
  const [editandoResp, setEditandoResp] = useState("");
  const [acaoFila, setAcaoFila]     = useState(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");
  const filaTimer = useRef(null);

  const MODOS = [
    { value: 0, label: "Abertos" },
    { value: 1, label: "Nao respondidos" },
    { value: 3, label: "Todos" },
  ];

  useEffect(() => {
    api.get("/helpdesk/categorias").then(r => setCategorias(r.data.categorias || [])).catch(() => {});
    carregarStatusPolling();
    carregarFila();
  }, []);

  useEffect(() => {
    if (view === "polling") {
      pollingTimer.current = setInterval(carregarStatusPolling, 10000);
    } else {
      clearInterval(pollingTimer.current);
    }
    if (view === "fila") {
      filaTimer.current = setInterval(carregarFila, 8000);
    } else {
      clearInterval(filaTimer.current);
    }
    return () => { clearInterval(pollingTimer.current); clearInterval(filaTimer.current); };
  }, [view]);

  useEffect(() => { carregarTickets(); }, [modo]);

  function carregarStatusPolling() {
    api.get("/helpdesk/polling").then(r => { setPolling(r.data); setIntervalo(r.data.intervalo_minutos || 2); }).catch(() => {});
  }

  function carregarFila() {
    api.get("/helpdesk/fila").then(r => setFila(r.data)).catch(() => {});
  }

  function carregarTickets() {
    setLoading(true); setTicketSel(null); setDetalhes(null);
    api.get(`/helpdesk/tickets?mode=${modo}&count=50`)
      .then(r => setTickets(r.data.tickets || []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }

  function abrirDetalhe(ticket) {
    setTicketSel(ticket); setDetalhes(null); setAcao(null); setView("detalhe"); setCarregandoDet(true);
    api.get(`/helpdesk/ticket/${ticket.IssueID}`)
      .then(r => setDetalhes(r.data))
      .catch(() => setDetalhes({ erro: "Erro ao carregar" }))
      .finally(() => setCarregandoDet(false));
  }

  async function controlarPolling(ac) {
    setPollingAcao(ac);
    try {
      if (ac === "iniciar")       { const r = await api.post("/helpdesk/polling/iniciar", { intervalo }); setPolling(r.data); }
      else if (ac === "pausar")   { const r = await api.post("/helpdesk/polling/pausar"); setPolling(r.data); }
      else if (ac === "retomar")  { const r = await api.post("/helpdesk/polling/retomar"); setPolling(r.data); }
      else if (ac === "limpar")   { await api.post("/helpdesk/polling/limpar"); carregarStatusPolling(); }
    } catch { /* silencioso */ }
    setPollingAcao(null);
  }

  async function toggleModoRevisao() {
    await api.post("/helpdesk/fila/modo", { ativo: !fila?.modo_revisao }).catch(() => {});
    carregarFila();
  }

  async function aprovar(item, respostaEditada) {
    setAcaoFila("aprovando_" + item.id);
    try {
      await api.post(`/helpdesk/fila/${item.id}/aprovar`, { resposta_editada: respostaEditada || null });
      setItemSel(null);
      carregarFila();
    } catch (e) { alert(e.response?.data?.erro || "Erro ao aprovar"); }
    setAcaoFila(null);
  }

  async function rejeitar(item) {
    setAcaoFila("rejeitando_" + item.id);
    try {
      await api.post(`/helpdesk/fila/${item.id}/rejeitar`, { motivo: motivoRejeicao });
      setItemSel(null); setMotivoRejeicao(""); carregarFila();
    } catch (e) { alert(e.response?.data?.erro || "Erro ao rejeitar"); }
    setAcaoFila(null);
  }

  async function classificar(ticketId) {
    setAcao({ tipo: "classificando", ticketId, resultado: null, enviando: true });
    try {
      const r = await api.post(`/helpdesk/classificar/${ticketId}`);
      setAcao({ tipo: "classificado", ticketId, resultado: r.data, enviando: false });
    } catch { setAcao({ tipo: "erro", ticketId, resultado: null, enviando: false }); }
  }

  async function responderIA(ticketId) {
    if (!window.confirm("A IA ira postar uma resposta automaticamente no Jitbit. Continuar?")) return;
    setAcao({ tipo: "respondendo", ticketId, resultado: null, enviando: true });
    try {
      const r = await api.post(`/helpdesk/responder/${ticketId}`);
      setAcao({ tipo: "respondido", ticketId, resultado: r.data, enviando: false });
    } catch { setAcao({ tipo: "erro", ticketId, resultado: null, enviando: false }); }
  }

  async function criarTicket(e) {
    e.preventDefault();
    try {
      const r = await api.post("/helpdesk/criar", novoTicket);
      alert(`Ticket criado! ID: ${r.data.ticketId || r.data.id || "-"}`);
      setNovoTicket({ subject: "", body: "", categoryId: "" });
      setView("lista"); carregarTickets();
    } catch (err) { alert(err.response?.data?.erro || "Erro ao criar ticket"); }
  }

  const filaPendente  = fila?.itens?.filter(i => i.status === "pendente") || [];
  const filaHistorico = fila?.itens?.filter(i => i.status !== "pendente") || [];
  const scoreColor = s => s >= 0.85 ? "#22c55e" : s >= 0.65 ? "#f59e0b" : "#ef4444";
  const scoreBg    = s => s >= 0.85 ? "rgba(34,197,94,0.1)" : s >= 0.65 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)";
  const decisaoLabel = d => d === "AUTO_RESPONDER" ? "Alta confianca" : d === "SUGERIR" ? "Moderada" : "Baixa";

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Helpdesk Jitbit</h2>
        <span className="page-subtitle">Gestao de chamados com IA</span>
      </div>

      {/* Barra superior */}
      <div className="filters-row" style={{ marginBottom: "1.25rem", gap: "0.5rem", flexWrap: "wrap" }}>
        {view === "criar" ? (
          <button className="btn" style={{ background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }} onClick={() => setView("lista")}>
            ← Voltar
          </button>
        ) : (
          <>
            {view !== "polling" && view !== "fila" && MODOS.map(m => (
              <button key={m.value} className={`btn ${modo === m.value && view === "lista" ? "btn-primary" : ""}`}
                style={modo !== m.value || view !== "lista" ? { background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" } : {}}
                onClick={() => { setModo(m.value); setView("lista"); }}>
                {m.label}
              </button>
            ))}

            <button className="btn" onClick={() => { setView("fila"); carregarFila(); }}
              style={{ position: "relative", background: view === "fila" ? "rgba(139,92,246,0.15)" : "var(--surface)", color: view === "fila" ? "#8b5cf6" : "var(--text-muted)", border: `1px solid ${view === "fila" ? "#8b5cf6" : "var(--border)"}`, fontWeight: view === "fila" ? 700 : 400 }}>
              Fila de Revisao
              {filaPendente.length > 0 && (
                <span style={{ position: "absolute", top: -6, right: -6, background: "#ef4444", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {filaPendente.length}
                </span>
              )}
            </button>

            {view !== "polling" && view !== "fila" && (
              <>
                <button className="btn" style={{ background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)", marginLeft: "auto" }} onClick={() => setView("criar")}>+ Novo Chamado</button>
                <button className="btn" style={{ background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }} onClick={carregarTickets}>Atualizar</button>
              </>
            )}

            {(view === "polling" || view === "fila" || view === "detalhe") && (
              <button className="btn" style={{ background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)", marginLeft: "auto" }} onClick={() => setView("lista")}>
                ← Voltar
              </button>
            )}

            <button className="btn" onClick={() => { setView("polling"); carregarStatusPolling(); }}
              style={{ border: `1px solid ${polling?.ativo ? "var(--success)" : "var(--border)"}`, color: polling?.ativo ? "var(--success)" : "var(--text-muted)", background: "var(--surface)", fontWeight: view === "polling" ? 700 : 400 }}>
              {polling?.ativo ? "Polling ON" : "Polling OFF"}
            </button>
          </>
        )}
      </div>

      {/* ===== FILA DE REVISAO ===== */}
      {view === "fila" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", marginBottom: 2 }}>Fila de Revisao Humana</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>Avalie as sugestoes da IA antes de enviar ao cliente</p>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <div onClick={toggleModoRevisao} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "6px 12px", borderRadius: 8, cursor: "pointer", background: fila?.modo_revisao ? "rgba(139,92,246,0.1)" : "rgba(34,197,94,0.1)", border: `1px solid ${fila?.modo_revisao ? "#8b5cf6" : "#22c55e"}` }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: fila?.modo_revisao ? "#8b5cf6" : "#22c55e" }}>
                  {fila?.modo_revisao ? "Modo Revisao" : "Modo Automatico"}
                </span>
                <div style={{ width: 36, height: 20, borderRadius: 10, background: fila?.modo_revisao ? "#8b5cf6" : "#22c55e", position: "relative" }}>
                  <div style={{ position: "absolute", top: 2, left: fila?.modo_revisao ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                </div>
              </div>
              <button className="btn" style={{ background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)", fontSize: "0.82rem" }} onClick={carregarFila}>Atualizar</button>
            </div>
          </div>

          <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: "1rem", fontSize: "0.8rem", background: fila?.modo_revisao ? "rgba(139,92,246,0.07)" : "rgba(34,197,94,0.07)", border: `1px solid ${fila?.modo_revisao ? "rgba(139,92,246,0.3)" : "rgba(34,197,94,0.3)"}`, color: fila?.modo_revisao ? "#8b5cf6" : "#16a34a" }}>
            {fila?.modo_revisao
              ? "Modo Revisao ativo - todas as respostas da IA aguardam sua aprovacao antes de serem enviadas ao cliente."
              : "Modo Automatico - respostas com score >= 85% sao enviadas direto. Fila mostra apenas SUGERIR e ESCALAR."}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: itemSel ? "340px 1fr" : "1fr", gap: "1rem" }}>
            {/* Lista da fila */}
            <div>
              {filaPendente.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Ok</div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Fila vazia - nenhuma resposta aguardando revisao</p>
                </div>
              ) : (
                filaPendente.map(item => (
                  <div key={item.id} className="card" onClick={() => { setItemSel(item); setEditandoResp(item.resposta); setMotivoRejeicao(""); }}
                    style={{ marginBottom: "0.75rem", cursor: "pointer", borderLeft: `3px solid ${scoreColor(item.score)}`, background: itemSel?.id === item.id ? "rgba(99,102,241,0.06)" : "var(--card)", outline: itemSel?.id === item.id ? "2px solid var(--accent)" : "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.7rem", color: "var(--accent)", marginBottom: 2 }}>#{item.ticketId}</div>
                        <div style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: "0.35rem", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.assunto}</div>
                        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "0.7rem", padding: "2px 7px", borderRadius: 4, background: scoreBg(item.score), color: scoreColor(item.score), fontWeight: 700 }}>{(item.score * 100).toFixed(0)}%</span>
                          <span style={{ fontSize: "0.7rem", padding: "2px 7px", borderRadius: 4, background: "rgba(99,102,241,0.1)", color: "var(--accent)" }}>{item.origem}</span>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{decisaoLabel(item.decisao_ia)}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", flexShrink: 0 }}>
                        <button onClick={e => { e.stopPropagation(); aprovar(item, null); }} disabled={!!acaoFila}
                          style={{ padding: "4px 10px", borderRadius: 6, background: "#22c55e", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}>
                          {acaoFila === "aprovando_" + item.id ? "..." : "OK"}
                        </button>
                        <button onClick={e => { e.stopPropagation(); setItemSel(item); setEditandoResp(item.resposta); }}
                          style={{ padding: "4px 10px", borderRadius: 6, background: "var(--surface)", color: "var(--accent)", border: "1px solid var(--accent)", cursor: "pointer", fontSize: "0.75rem" }}>
                          Ed.
                        </button>
                        <button onClick={e => { e.stopPropagation(); rejeitar(item); }} disabled={!!acaoFila}
                          style={{ padding: "4px 10px", borderRadius: 6, background: "var(--surface)", color: "#ef4444", border: "1px solid #ef4444", cursor: "pointer", fontSize: "0.75rem" }}>
                          X
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
                      {new Date(item.criado_em).toLocaleString("pt-BR")}
                    </div>
                  </div>
                ))
              )}
              {filaHistorico.length > 0 && (
                <details style={{ marginTop: "0.75rem" }}>
                  <summary style={{ fontSize: "0.8rem", color: "var(--text-muted)", cursor: "pointer", padding: "0.5rem" }}>
                    Historico ({filaHistorico.length} processados)
                  </summary>
                  {filaHistorico.map(item => (
                    <div key={item.id} className="card" style={{ marginBottom: "0.5rem", opacity: 0.7, borderLeft: `3px solid ${item.status === "aprovado" ? "#22c55e" : "#ef4444"}` }}>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: item.status === "aprovado" ? "#22c55e" : "#ef4444" }}>{item.status === "aprovado" ? "Enviado" : "Rejeitado"}</span>
                        <span style={{ fontSize: "0.8rem" }}>#{item.ticketId} - {item.assunto}</span>
                      </div>
                    </div>
                  ))}
                </details>
              )}
            </div>

            {/* Painel lateral de edicao */}
            {itemSel && (
              <div>
                <div className="card" style={{ borderLeft: "3px solid var(--accent)", background: "rgba(99,102,241,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <div>
                      <div style={{ fontSize: "0.7rem", color: "var(--accent)" }}>Ticket #{itemSel.ticketId}</div>
                      <div style={{ fontWeight: 700, fontSize: "1rem" }}>{itemSel.assunto}</div>
                    </div>
                    <button onClick={() => setItemSel(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1.2rem" }}>x</button>
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.35rem" }}>Pergunta do cliente</div>
                    <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", fontSize: "0.85rem", lineHeight: 1.5 }}>
                      {itemSel.texto || itemSel.assunto}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                    <div style={{ padding: "4px 10px", borderRadius: 6, background: scoreBg(itemSel.score), fontSize: "0.78rem", fontWeight: 700, color: scoreColor(itemSel.score) }}>
                      Score: {(itemSel.score * 100).toFixed(1)}%
                    </div>
                    <div style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(99,102,241,0.1)", fontSize: "0.78rem", color: "var(--accent)" }}>
                      {itemSel.origem}
                    </div>
                    <div style={{ padding: "4px 10px", borderRadius: 6, background: "var(--surface)", fontSize: "0.78rem", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                      {decisaoLabel(itemSel.decisao_ia)}
                    </div>
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Resposta da IA (editavel)</div>
                      <button onClick={() => setEditandoResp(itemSel.resposta)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.72rem", color: "var(--accent)" }}>
                        Restaurar original
                      </button>
                    </div>
                    <textarea value={editandoResp} onChange={e => setEditandoResp(e.target.value)} rows={10}
                      style={{ width: "100%", borderRadius: 8, padding: "10px 12px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.875rem", lineHeight: 1.6, resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                    {editandoResp !== itemSel.resposta && (
                      <div style={{ fontSize: "0.72rem", color: "#f59e0b", marginTop: 4 }}>Resposta foi editada</div>
                    )}
                  </div>

                  <button onClick={() => aprovar(itemSel, editandoResp !== itemSel.resposta ? editandoResp : null)} disabled={!!acaoFila}
                    style={{ width: "100%", padding: "10px", borderRadius: 8, background: "#22c55e", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.75rem" }}>
                    {acaoFila?.startsWith("aprovando") ? "Enviando..." : editandoResp !== itemSel.resposta ? "Aprovar com Edicao" : "Aprovar e Enviar"}
                  </button>

                  <details>
                    <summary style={{ fontSize: "0.8rem", color: "#ef4444", cursor: "pointer", padding: "0.4rem 0" }}>
                      Rejeitar resposta
                    </summary>
                    <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
                      <input value={motivoRejeicao} onChange={e => setMotivoRejeicao(e.target.value)} placeholder="Motivo (opcional)"
                        style={{ flex: 1, padding: "8px 12px", borderRadius: 8, background: "var(--bg)", border: "1px solid rgba(239,68,68,0.4)", color: "var(--text)", fontSize: "0.85rem", outline: "none" }} />
                      <button onClick={() => rejeitar(itemSel)} disabled={!!acaoFila}
                        style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.4)", cursor: "pointer", fontWeight: 600 }}>
                        {acaoFila?.startsWith("rejeitando") ? "..." : "Rejeitar"}
                      </button>
                    </div>
                  </details>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== POLLING ===== */}
      {view === "polling" && (
        <div style={{ maxWidth: 720 }}>
          <h3 style={{ marginBottom: "1.25rem", fontSize: "1.1rem" }}>Polling Automatico</h3>

          <div className="card" style={{ marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 3 }}>STATUS</div>
                <span style={{ padding: "4px 12px", borderRadius: 12, fontSize: "0.85rem", fontWeight: 700, background: polling?.ativo ? "rgba(34,197,94,0.12)" : "rgba(107,114,128,0.12)", color: polling?.ativo ? "var(--success)" : "var(--text-muted)" }}>
                  {polling?.ativo ? "ATIVO" : "PAUSADO"}
                </span>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 3 }}>INTERVALO</div>
                <span style={{ fontWeight: 600 }}>{polling?.intervalo_minutos || "-"} min</span>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 3 }}>ULTIMA EXECUCAO</div>
                <span style={{ fontSize: "0.8rem" }}>{polling?.ultima_execucao ? new Date(polling.ultima_execucao).toLocaleTimeString("pt-BR") : "-"}</span>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 3 }}>PROXIMA</div>
                <span style={{ fontSize: "0.8rem" }}>{polling?.proxima_execucao ? new Date(polling.proxima_execucao).toLocaleTimeString("pt-BR") : "-"}</span>
              </div>
            </div>
            {polling?.stats && (
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", paddingTop: "0.75rem", borderTop: "1px solid var(--border)" }}>
                {[
                  { label: "Ciclos",       val: polling.stats.execucoes,            color: "var(--accent)" },
                  { label: "Processados",  val: polling.stats.tickets_processados,  color: "var(--accent)" },
                  { label: "Auto-resp.",   val: polling.stats.auto_respondidos,     color: "var(--success)" },
                  { label: "Sugeridos",    val: polling.stats.sugeridos,            color: "#f59e0b" },
                  { label: "Escalados",    val: polling.stats.escalados,            color: "#8b5cf6" },
                  { label: "Erros",        val: polling.stats.erros,               color: "var(--danger)" },
                ].map(s => (
                  <div key={s.label} style={{ minWidth: 70 }}>
                    <div style={{ fontSize: "1.3rem", fontWeight: 700, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ marginBottom: "1.25rem" }}>
            <h4 style={{ fontSize: "0.9rem", marginBottom: "0.75rem" }}>Controles</h4>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Intervalo (min):</label>
                <input type="number" min="1" max="60" value={intervalo} onChange={e => setIntervalo(parseInt(e.target.value) || 2)}
                  style={{ width: 60, padding: "4px 8px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: "0.85rem" }} />
              </div>
              {!polling?.ativo ? (
                <button className="btn btn-primary" onClick={() => controlarPolling("iniciar")} disabled={!!pollingAcao} style={{ fontSize: "0.85rem" }}>
                  {pollingAcao === "iniciar" ? "Iniciando..." : "Iniciar Polling"}
                </button>
              ) : (
                <button className="btn" onClick={() => controlarPolling("pausar")} disabled={!!pollingAcao}
                  style={{ fontSize: "0.85rem", background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                  {pollingAcao === "pausar" ? "Pausando..." : "Pausar"}
                </button>
              )}
              <button className="btn" onClick={() => controlarPolling("limpar")} disabled={!!pollingAcao}
                style={{ fontSize: "0.85rem", background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                Limpar Cache
              </button>
              <button className="btn" onClick={carregarStatusPolling} style={{ fontSize: "0.85rem", background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)", marginLeft: "auto" }}>
                Atualizar
              </button>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.75rem", marginBottom: 0 }}>
              Score >= 85% resposta automatica · Score >= 65% sugestao para humano · Score abaixo de 65% escalado
            </p>
          </div>

          <div className="card">
            <h4 style={{ fontSize: "0.9rem", marginBottom: "0.75rem" }}>Ultimas Execucoes</h4>
            {!polling?.ultimo_log?.length ? (
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Nenhuma execucao registrada ainda.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {polling.ultimo_log.map((l, i) => (
                  <div key={i} style={{ padding: "0.5rem 0.75rem", borderRadius: 8, fontSize: "0.78rem", background: l.tipo === "auto" ? "rgba(34,197,94,0.07)" : l.tipo === "erro" ? "rgba(239,68,68,0.07)" : l.tipo === "escalar" ? "rgba(139,92,246,0.07)" : l.tipo === "sugerir" ? "rgba(245,158,11,0.07)" : "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                      <span style={{ color: "var(--text-muted)", whiteSpace: "nowrap" }}>{new Date(l.ts).toLocaleTimeString("pt-BR")}</span>
                      <span style={{ fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", color: l.tipo === "auto" ? "var(--success)" : l.tipo === "erro" ? "var(--danger)" : l.tipo === "escalar" ? "#8b5cf6" : l.tipo === "sugerir" ? "#f59e0b" : "var(--accent)" }}>
                        {l.tipo}
                      </span>
                      {l.ticketId && <span style={{ color: "var(--accent)" }}>#{l.ticketId}</span>}
                      <span style={{ color: "var(--text-muted)" }}>{l.assunto || l.msg}</span>
                    </div>
                    {l.sugestao && <div style={{ marginTop: 4, color: "var(--text)", paddingLeft: "calc(60px + 0.75rem)" }}>{l.sugestao}...</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== CRIAR TICKET ===== */}
      {view === "criar" && (
        <div style={{ maxWidth: 600 }}>
          <h3 style={{ marginBottom: "1.25rem", fontSize: "1.1rem" }}>Novo Chamado</h3>
          <form onSubmit={criarTicket}>
            <div className="form-group">
              <label>Assunto</label>
              <input value={novoTicket.subject} onChange={e => setNovoTicket(p => ({ ...p, subject: e.target.value }))} placeholder="Descreva o problema brevemente" required />
            </div>
            <div className="form-group">
              <label>Descricao</label>
              <textarea value={novoTicket.body} onChange={e => setNovoTicket(p => ({ ...p, body: e.target.value }))} placeholder="Detalhes do problema..." required />
            </div>
            <div className="form-group">
              <label>Categoria</label>
              <select value={novoTicket.categoryId} onChange={e => setNovoTicket(p => ({ ...p, categoryId: e.target.value }))}>
                <option value="">- selecionar -</option>
                {categorias.map(c => <option key={c.CategoryID} value={c.CategoryID}>{c.Name}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Criar Chamado</button>
          </form>
        </div>
      )}

      {/* ===== LISTA DE TICKETS ===== */}
      {view === "lista" && (
        <>
          {loading ? (
            <p className="text-muted">Carregando tickets...</p>
          ) : tickets.length === 0 ? (
            <div className="alert alert-error">Nenhum ticket encontrado. Verifique a configuracao do Jitbit em Configuracoes.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Assunto</th>
                  <th>Solicitante</th>
                  <th>Categoria</th>
                  <th>Data</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.IssueID} style={{ cursor: "pointer" }}>
                    <td style={{ fontWeight: 600, color: "var(--accent)" }}>#{t.IssueID}</td>
                    <td style={{ maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} onClick={() => abrirDetalhe(t)} title={t.Subject}>
                      {t.Subject}
                    </td>
                    <td style={{ fontSize: "0.85rem" }}>{t.UserName || "-"}</td>
                    <td><span className="badge badge-kb" style={{ whiteSpace: "nowrap" }}>{t.Category || "-"}</span></td>
                    <td style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>{t.Date ? new Date(t.Date).toLocaleDateString("pt-BR") : "-"}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.35rem" }}>
                        <button className="btn btn-primary" style={{ padding: "0.3rem 0.65rem", fontSize: "0.78rem" }} onClick={() => abrirDetalhe(t)}>Ver</button>
                        <button className="btn" style={{ padding: "0.3rem 0.65rem", fontSize: "0.78rem", background: "var(--surface)", color: "var(--accent)", border: "1px solid var(--accent)" }} onClick={() => { abrirDetalhe(t); classificar(t.IssueID); }}>
                          IA
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* ===== DETALHE DO TICKET ===== */}
      {view === "detalhe" && ticketSel && (
        <div style={{ maxWidth: 760 }}>
          <div className="card" style={{ marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
              <div>
                <div style={{ fontSize: "0.8rem", color: "var(--accent)", marginBottom: "0.25rem" }}>Ticket #{ticketSel.IssueID}</div>
                <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>{ticketSel.Subject}</h3>
                <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  {ticketSel.UserName} · {ticketSel.Category} · {ticketSel.Date ? new Date(ticketSel.Date).toLocaleString("pt-BR") : ""}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button className="btn" style={{ background: "var(--surface)", color: "var(--accent)", border: "1px solid var(--accent)", fontSize: "0.85rem" }} onClick={() => classificar(ticketSel.IssueID)} disabled={acao?.enviando}>
                  Sugerir Resposta
                </button>
                <button className="btn btn-primary" style={{ fontSize: "0.85rem" }} onClick={() => responderIA(ticketSel.IssueID)} disabled={acao?.enviando}>
                  Responder via IA
                </button>
              </div>
            </div>
          </div>

          {acao && acao.ticketId === ticketSel.IssueID && (
            <div style={{ marginBottom: "1.25rem" }}>
              {acao.enviando && (
                <div className="alert" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid var(--accent)", color: "var(--accent)" }}>
                  {acao.tipo === "classificando" ? "Gerando sugestao de resposta..." : "Enviando resposta para o Jitbit..."}
                </div>
              )}
              {!acao.enviando && acao.tipo === "classificado" && acao.resultado && (
                <div className="card">
                  <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                    <span className="badge badge-kb">origem: {acao.resultado.origem}</span>
                    {acao.resultado.score && <span className="badge badge-embedding">score: {(acao.resultado.score * 100).toFixed(1)}%</span>}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>Sugestao da IA:</div>
                  <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: "0.9rem", lineHeight: 1.6 }}>{acao.resultado.sugestaoResposta}</pre>
                </div>
              )}
              {!acao.enviando && acao.tipo === "respondido" && <div className="alert alert-success">Resposta postada no Jitbit com sucesso!</div>}
              {!acao.enviando && acao.tipo === "erro" && <div className="alert alert-error">Erro ao processar. Verifique se a API esta configurada corretamente.</div>}
            </div>
          )}

          {carregandoDet && <p className="text-muted">Carregando detalhes...</p>}
          {detalhes && !detalhes.erro && (
            <>
              {detalhes.ticket?.Body && (
                <div className="card" style={{ marginBottom: "1rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase" }}>Descricao</div>
                  <div style={{ fontSize: "0.9rem", lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: detalhes.ticket.Body }} />
                </div>
              )}
              {detalhes.comentarios?.length > 0 && (
                <div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.75rem", textTransform: "uppercase" }}>
                    {detalhes.comentarios.length} comentario(s)
                  </div>
                  {detalhes.comentarios.map((c, i) => (
                    <div key={i} className="card" style={{ marginBottom: "0.75rem", borderLeft: "3px solid var(--accent)" }}>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                        {c.UserName} · {c.Date ? new Date(c.Date).toLocaleString("pt-BR") : ""}
                      </div>
                      <div style={{ fontSize: "0.875rem", lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: c.Body || c.Text || "" }} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
