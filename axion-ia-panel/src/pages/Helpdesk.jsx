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
  const [view, setView]             = useState("lista"); // lista | detalhe | criar | polling

  // Polling
  const [polling, setPolling]       = useState(null);
  const [intervalo, setIntervalo]   = useState(2);
  const [pollingAcao, setPollingAcao] = useState(null); // "iniciando" | "pausando" | null
  const pollingTimer = useRef(null);

  const MODOS = [
    { value: 0,  label: "Abertos" },
    { value: 1,  label: "Não respondidos" },
    { value: 3,  label: "Todos" },
  ];

  useEffect(() => {
    api.get("/helpdesk/categorias")
      .then(r => setCategorias(r.data.categorias || []))
      .catch(() => {});
    carregarStatusPolling();
  }, []);

  // Atualiza status do polling a cada 10s enquanto a aba estiver aberta
  useEffect(() => {
    if (view === "polling") {
      pollingTimer.current = setInterval(carregarStatusPolling, 10000);
    } else {
      clearInterval(pollingTimer.current);
    }
    return () => clearInterval(pollingTimer.current);
  }, [view]);

  function carregarStatusPolling() {
    api.get("/helpdesk/polling")
      .then(r => { setPolling(r.data); setIntervalo(r.data.intervalo_minutos || 2); })
      .catch(() => {});
  }

  async function controlarPolling(acao) {
    setPollingAcao(acao);
    try {
      if (acao === "iniciar") {
        const r = await api.post("/helpdesk/polling/iniciar", { intervalo });
        setPolling(r.data);
      } else if (acao === "pausar") {
        const r = await api.post("/helpdesk/polling/pausar");
        setPolling(r.data);
      } else if (acao === "retomar") {
        const r = await api.post("/helpdesk/polling/retomar");
        setPolling(r.data);
      } else if (acao === "limpar") {
        await api.post("/helpdesk/polling/limpar");
        carregarStatusPolling();
      }
    } catch { /* silencioso */ }
    setPollingAcao(null);
  }

  useEffect(() => {
    carregarTickets();
  }, [modo]);

  function carregarTickets() {
    setLoading(true);
    setTicketSel(null);
    setDetalhes(null);
    api.get(`/helpdesk/tickets?mode=${modo}&count=50`)
      .then(r => setTickets(r.data.tickets || []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }

  function abrirDetalhe(ticket) {
    setTicketSel(ticket);
    setDetalhes(null);
    setAcao(null);
    setView("detalhe");
    setCarregandoDet(true);
    api.get(`/helpdesk/ticket/${ticket.IssueID}`)
      .then(r => setDetalhes(r.data))
      .catch(() => setDetalhes({ erro: "Erro ao carregar" }))
      .finally(() => setCarregandoDet(false));
  }

  async function classificar(ticketId) {
    setAcao({ tipo: "classificando", ticketId, resultado: null, enviando: true });
    try {
      const r = await api.post(`/helpdesk/classificar/${ticketId}`);
      setAcao({ tipo: "classificado", ticketId, resultado: r.data, enviando: false });
    } catch {
      setAcao({ tipo: "erro", ticketId, resultado: null, enviando: false });
    }
  }

  async function responderIA(ticketId) {
    if (!window.confirm("A IA irá postar uma resposta automaticamente no Jitbit. Continuar?")) return;
    setAcao({ tipo: "respondendo", ticketId, resultado: null, enviando: true });
    try {
      const r = await api.post(`/helpdesk/responder/${ticketId}`);
      setAcao({ tipo: "respondido", ticketId, resultado: r.data, enviando: false });
    } catch {
      setAcao({ tipo: "erro", ticketId, resultado: null, enviando: false });
    }
  }

  async function criarTicket(e) {
    e.preventDefault();
    try {
      const r = await api.post("/helpdesk/criar", novoTicket);
      alert(`Ticket criado com sucesso! ID: ${r.data.ticketId || r.data.id || "—"}`);
      setNovoTicket({ subject: "", body: "", categoryId: "" });
      setView("lista");
      carregarTickets();
    } catch (err) {
      alert(err.response?.data?.erro || "Erro ao criar ticket");
    }
  }

  /* ───── Renderização ───── */
  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Helpdesk Jitbit</h2>
        <span className="page-subtitle">Gestão de chamados com IA</span>
      </div>

      {/* Barra superior */}
      <div className="filters-row" style={{ marginBottom: "1.25rem" }}>
        {view !== "criar" && view !== "polling" ? (
          <>
            {MODOS.map(m => (
              <button
                key={m.value}
                className={`btn ${modo === m.value && view === "lista" ? "btn-primary" : ""}`}
                style={modo !== m.value || view !== "lista" ? { background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" } : {}}
                onClick={() => { setModo(m.value); setView("lista"); }}
              >
                {m.label}
              </button>
            ))}
            <button
              className="btn"
              style={{ background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)", marginLeft: "auto" }}
              onClick={() => setView("criar")}
            >
              + Novo Chamado
            </button>
            <button
              className="btn"
              style={{ background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
              onClick={carregarTickets}
            >
              ↻ Atualizar
            </button>
            <button
              className="btn"
              style={{
                border: `1px solid ${polling?.ativo ? "var(--success)" : "var(--border)"}`,
                color: polling?.ativo ? "var(--success)" : "var(--text-muted)",
                background: "var(--surface)",
              }}
              onClick={() => { setView("polling"); carregarStatusPolling(); }}
              title="Polling automático"
            >
              {polling?.ativo ? "⏱ Polling ON" : "⏱ Polling OFF"}
            </button>
          </>
        ) : (
          <button
            className="btn"
            style={{ background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
            onClick={() => setView("lista")}
          >
            ← Voltar
          </button>
        )}
      </div>

      {/* Vista: Polling */}
      {view === "polling" && (
        <div style={{ maxWidth: 720 }}>
          <h3 style={{ marginBottom: "1.25rem", fontSize: "1.1rem" }}>⏱ Polling Automático</h3>

          {/* Status */}
          <div className="card" style={{ marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 3 }}>STATUS</div>
                <span style={{
                  padding: "4px 12px", borderRadius: 12, fontSize: "0.85rem", fontWeight: 700,
                  background: polling?.ativo ? "rgba(34,197,94,0.12)" : "rgba(107,114,128,0.12)",
                  color: polling?.ativo ? "var(--success)" : "var(--text-muted)"
                }}>
                  {polling?.ativo ? "● ATIVO" : "○ PAUSADO"}
                </span>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 3 }}>INTERVALO</div>
                <span style={{ fontWeight: 600 }}>{polling?.intervalo_minutos || "—"} min</span>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 3 }}>ÚLTIMA EXECUÇÃO</div>
                <span style={{ fontSize: "0.8rem" }}>{polling?.ultima_execucao ? new Date(polling.ultima_execucao).toLocaleTimeString("pt-BR") : "—"}</span>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 3 }}>PRÓXIMA</div>
                <span style={{ fontSize: "0.8rem" }}>{polling?.proxima_execucao ? new Date(polling.proxima_execucao).toLocaleTimeString("pt-BR") : "—"}</span>
              </div>
            </div>

            {/* Stats */}
            {polling?.stats && (
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", paddingTop: "0.75rem", borderTop: "1px solid var(--border)" }}>
                {[
                  { label: "Ciclos", val: polling.stats.execucoes, color: "var(--accent)" },
                  { label: "Processados", val: polling.stats.tickets_processados, color: "var(--accent)" },
                  { label: "Auto-resp.", val: polling.stats.auto_respondidos, color: "var(--success)" },
                  { label: "Sugeridos", val: polling.stats.sugeridos, color: "#f59e0b" },
                  { label: "Escalados", val: polling.stats.escalados, color: "#8b5cf6" },
                  { label: "Erros", val: polling.stats.erros, color: "var(--danger)" },
                ].map(s => (
                  <div key={s.label} style={{ minWidth: 70 }}>
                    <div style={{ fontSize: "1.3rem", fontWeight: 700, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Controles */}
          <div className="card" style={{ marginBottom: "1.25rem" }}>
            <h4 style={{ fontSize: "0.9rem", marginBottom: "0.75rem" }}>Controles</h4>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Intervalo (min):</label>
                <input
                  type="number" min="1" max="60" value={intervalo}
                  onChange={e => setIntervalo(parseInt(e.target.value) || 2)}
                  style={{ width: 60, padding: "4px 8px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: "0.85rem" }}
                />
              </div>
              {!polling?.ativo ? (
                <button
                  className="btn btn-primary"
                  onClick={() => controlarPolling("iniciar")}
                  disabled={!!pollingAcao}
                  style={{ fontSize: "0.85rem" }}
                >
                  {pollingAcao === "iniciar" ? "Iniciando..." : "▶ Iniciar Polling"}
                </button>
              ) : (
                <button
                  className="btn"
                  onClick={() => controlarPolling("pausar")}
                  disabled={!!pollingAcao}
                  style={{ fontSize: "0.85rem", background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                >
                  {pollingAcao === "pausar" ? "Pausando..." : "⏸ Pausar"}
                </button>
              )}
              <button
                className="btn"
                onClick={() => controlarPolling("limpar")}
                disabled={!!pollingAcao}
                style={{ fontSize: "0.85rem", background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                title="Limpa os IDs de tickets já processados para reprocessar do zero"
              >
                🗑 Limpar Cache
              </button>
              <button
                className="btn"
                onClick={carregarStatusPolling}
                style={{ fontSize: "0.85rem", background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)",  marginLeft: "auto" }}
              >
                ↻ Atualizar
              </button>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.75rem", marginBottom: 0 }}>
              Score ≥ 85% → resposta automática · Score ≥ 65% → sugestão para humano · Score &lt; 65% → escalado
            </p>
          </div>

          {/* Log */}
          <div className="card">
            <h4 style={{ fontSize: "0.9rem", marginBottom: "0.75rem" }}>Últimas Execuções</h4>
            {!polling?.ultimo_log?.length ? (
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Nenhuma execução registrada ainda.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {polling.ultimo_log.map((l, i) => (
                  <div key={i} style={{
                    padding: "0.5rem 0.75rem", borderRadius: 8, fontSize: "0.78rem",
                    background: l.tipo === "auto" ? "rgba(34,197,94,0.07)"
                      : l.tipo === "erro" ? "rgba(239,68,68,0.07)"
                      : l.tipo === "escalar" ? "rgba(139,92,246,0.07)"
                      : l.tipo === "sugerir" ? "rgba(245,158,11,0.07)"
                      : "rgba(255,255,255,0.03)",
                    border: "1px solid var(--border)"
                  }}>
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                      <span style={{ color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {new Date(l.ts).toLocaleTimeString("pt-BR")}
                      </span>
                      <span style={{
                        fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase",
                        color: l.tipo === "auto" ? "var(--success)"
                          : l.tipo === "erro" ? "var(--danger)"
                          : l.tipo === "escalar" ? "#8b5cf6"
                          : l.tipo === "sugerir" ? "#f59e0b"
                          : "var(--accent)"
                      }}>
                        {l.tipo}
                      </span>
                      {l.ticketId && <span style={{ color: "var(--accent)" }}>#{l.ticketId}</span>}
                      <span style={{ color: "var(--text-muted)" }}>{l.assunto || l.msg}</span>
                    </div>
                    {l.sugestao && (
                      <div style={{ marginTop: 4, color: "var(--text)", paddingLeft: "calc(60px + 0.75rem)" }}>
                        {l.sugestao}…
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vista: Criar ticket */}
      {view === "criar" && (
        <div style={{ maxWidth: 600 }}>
          <h3 style={{ marginBottom: "1.25rem", fontSize: "1.1rem" }}>Novo Chamado</h3>
          <form onSubmit={criarTicket}>
            <div className="form-group">
              <label>Assunto</label>
              <input
                value={novoTicket.subject}
                onChange={e => setNovoTicket(p => ({ ...p, subject: e.target.value }))}
                placeholder="Descreva o problema brevemente"
                required
              />
            </div>
            <div className="form-group">
              <label>Descrição</label>
              <textarea
                value={novoTicket.body}
                onChange={e => setNovoTicket(p => ({ ...p, body: e.target.value }))}
                placeholder="Detalhes do problema..."
                required
              />
            </div>
            <div className="form-group">
              <label>Categoria</label>
              <select
                value={novoTicket.categoryId}
                onChange={e => setNovoTicket(p => ({ ...p, categoryId: e.target.value }))}
              >
                <option value="">— selecionar —</option>
                {categorias.map(c => (
                  <option key={c.CategoryID} value={c.CategoryID}>{c.Name}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Criar Chamado</button>
          </form>
        </div>
      )}

      {/* Vista: Lista de tickets */}
      {view === "lista" && (
        <>
          {loading ? (
            <p className="text-muted">Carregando tickets...</p>
          ) : tickets.length === 0 ? (
            <div className="alert alert-error">
              Nenhum ticket encontrado. Verifique a configuração do Jitbit em Configurações.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Assunto</th>
                  <th>Solicitante</th>
                  <th>Categoria</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.IssueID} style={{ cursor: "pointer" }}>
                    <td style={{ fontWeight: 600, color: "var(--accent)" }}>#{t.IssueID}</td>
                    <td
                      style={{ maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      onClick={() => abrirDetalhe(t)}
                      title={t.Subject}
                    >
                      {t.Subject}
                    </td>
                    <td style={{ fontSize: "0.85rem" }}>{t.UserName || "—"}</td>
                    <td>
                      <span className="badge badge-kb" style={{ whiteSpace: "nowrap" }}>
                        {t.Category || "—"}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                      {t.Date ? new Date(t.Date).toLocaleDateString("pt-BR") : "—"}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.35rem" }}>
                        <button
                          className="btn btn-primary"
                          style={{ padding: "0.3rem 0.65rem", fontSize: "0.78rem" }}
                          onClick={() => abrirDetalhe(t)}
                        >
                          Ver
                        </button>
                        <button
                          className="btn"
                          style={{ padding: "0.3rem 0.65rem", fontSize: "0.78rem", background: "var(--surface)", color: "var(--accent)", border: "1px solid var(--accent)" }}
                          onClick={() => { setView("detalhe"); abrirDetalhe(t); classificar(t.IssueID); }}
                        >
                          🤖 Classificar
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

      {/* Vista: Detalhe do ticket */}
      {view === "detalhe" && ticketSel && (
        <div style={{ maxWidth: 760 }}>
          <button
            className="btn"
            style={{ background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)", marginBottom: "1rem" }}
            onClick={() => { setView("lista"); setAcao(null); }}
          >
            ← Voltar
          </button>

          <div className="card" style={{ marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
              <div>
                <div style={{ fontSize: "0.8rem", color: "var(--accent)", marginBottom: "0.25rem" }}>
                  Ticket #{ticketSel.IssueID}
                </div>
                <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>{ticketSel.Subject}</h3>
                <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  {ticketSel.UserName} · {ticketSel.Category} · {ticketSel.Date ? new Date(ticketSel.Date).toLocaleString("pt-BR") : ""}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button
                  className="btn"
                  style={{ background: "var(--surface)", color: "var(--accent)", border: "1px solid var(--accent)", fontSize: "0.85rem" }}
                  onClick={() => classificar(ticketSel.IssueID)}
                  disabled={acao?.enviando}
                >
                  🤖 Sugerir Resposta
                </button>
                <button
                  className="btn btn-primary"
                  style={{ fontSize: "0.85rem" }}
                  onClick={() => responderIA(ticketSel.IssueID)}
                  disabled={acao?.enviando}
                >
                  ✈️ Responder via IA
                </button>
              </div>
            </div>
          </div>

          {/* Resultado da IA */}
          {acao && acao.ticketId === ticketSel.IssueID && (
            <div style={{ marginBottom: "1.25rem" }}>
              {acao.enviando && (
                <div className="alert" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid var(--accent)", color: "var(--accent)" }}>
                  {acao.tipo === "classificando" ? "🤖 Gerando sugestão de resposta..." : "✈️ Enviando resposta para o Jitbit..."}
                </div>
              )}
              {!acao.enviando && acao.tipo === "classificado" && acao.resultado && (
                <div className="card">
                  <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                    <span className="badge badge-kb">origem: {acao.resultado.origem}</span>
                    {acao.resultado.score && (
                      <span className="badge badge-embedding">score: {(acao.resultado.score * 100).toFixed(1)}%</span>
                    )}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>Sugestão da IA:</div>
                  <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: "0.9rem", lineHeight: 1.6 }}>
                    {acao.resultado.sugestaoResposta}
                  </pre>
                </div>
              )}
              {!acao.enviando && acao.tipo === "respondido" && (
                <div className="alert alert-success">✓ Resposta postada no Jitbit com sucesso!</div>
              )}
              {!acao.enviando && acao.tipo === "erro" && (
                <div className="alert alert-error">Erro ao processar. Verifique se a API está configurada corretamente.</div>
              )}
            </div>
          )}

          {/* Conteúdo e comentários */}
          {carregandoDet && <p className="text-muted">Carregando detalhes...</p>}
          {detalhes && !detalhes.erro && (
            <>
              {detalhes.ticket?.Body && (
                <div className="card" style={{ marginBottom: "1rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase" }}>Descrição</div>
                  <div
                    style={{ fontSize: "0.9rem", lineHeight: 1.6 }}
                    dangerouslySetInnerHTML={{ __html: detalhes.ticket.Body }}
                  />
                </div>
              )}

              {detalhes.comentarios?.length > 0 && (
                <div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.75rem", textTransform: "uppercase" }}>
                    {detalhes.comentarios.length} comentário(s)
                  </div>
                  {detalhes.comentarios.map((c, i) => (
                    <div key={i} className="card" style={{ marginBottom: "0.75rem", borderLeft: "3px solid var(--accent)" }}>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                        {c.UserName} · {c.Date ? new Date(c.Date).toLocaleString("pt-BR") : ""}
                      </div>
                      <div
                        style={{ fontSize: "0.875rem", lineHeight: 1.6 }}
                        dangerouslySetInnerHTML={{ __html: c.Body || c.Text || "" }}
                      />
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
