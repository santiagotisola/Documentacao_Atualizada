import { useEffect, useState, useRef } from "react";
import { api, apiFetch } from "../services/api";
import { Badge } from "../components/common";
import ChamadosSites from "./ChamadosSites";

const FILTROS_INICIAL = {
  sectionId: "",
  techId: "",
  dateFrom: "",
  dateTo: "",
  statusId: "",
  priorityId: "",
  somenteMeus: false,
};

const STATUS_OPCOES = [
  { value: "", label: "Todos" },
  { value: "1", label: "Novo" },
  { value: "2", label: "Em atendimento" },
  { value: "3", label: "Aguardando resposta" },
  { value: "4", label: "Resolvido" },
  { value: "5", label: "Fechado" },
];

const PRIORIDADE_OPCOES = [
  { value: "", label: "Todas" },
  { value: "0", label: "Baixa" },
  { value: "1", label: "Normal" },
  { value: "2", label: "Alta" },
  { value: "3", label: "Crítica" },
];

// ── SLA Compliance helpers ───────────────────────────────────────────────────
const JITBIT_BASE = "https://desk.axiontecnologia.com.br";

const SLA_PRIORIDADES = [
  { value: "",         label: "Todas" },
  { value: "Critical", label: "Crítico" },
  { value: "High",     label: "Alta" },
  { value: "Normal",   label: "Normal" },
  { value: "Low",      label: "Baixa" },
];

const PRIORIDADE_PT = {
  Critical: "Crítico",
  High:     "Alta",
  Normal:   "Normal",
  Low:      "Baixa",
};

function corSla(prioridade) {
  return { Critical: "#ef4444", High: "#f97316", Normal: "#60a5fa", Low: "#94a3b8" }[prioridade] || "#60a5fa";
}

function DonutChart({ met, breached, naoAvaliados, label }) {
  const total = met + breached + naoAvaliados;
  if (total === 0) return <div style={{ color: "#94a3b8", fontSize: 12 }}>Sem dados</div>;
  const R = 44, cx = 60, cy = 60, stroke = 18;
  const circ = 2 * Math.PI * R;
  function slice(valor, offset, fill) {
    const dash = (valor / total) * circ;
    return <circle key={fill} cx={cx} cy={cy} r={R} fill="none" stroke={fill} strokeWidth={stroke} strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-offset} strokeLinecap="butt" transform={`rotate(-90 ${cx} ${cy})`} />;
  }
  const offMet = 0, offBreached = (met / total) * circ, offNone = offBreached + (breached / total) * circ;
  const pct = met + breached > 0 ? Math.round((met / (met + breached)) * 10) / 0.1 : null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <svg width={120} height={120} viewBox="0 0 120 120">
        {slice(met, offMet, "#22c55e")}
        {slice(breached, offBreached, "#ef4444")}
        {slice(naoAvaliados, offNone, "#334155")}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#f1f5f9" fontSize="15" fontWeight="700">{pct !== null ? `${pct}%` : "—"}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#94a3b8" fontSize="8">{label}</text>
      </svg>
      <div style={{ fontSize: 12 }}>
        {[{ cor: "#22c55e", txt: `Met: ${met}` }, { cor: "#ef4444", txt: `Breached: ${breached}` }, { cor: "#334155", txt: `Abertos: ${naoAvaliados}` }].map(({ cor: c, txt }) => (
          <div key={txt} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "inline-block", flexShrink: 0 }} />
            <span style={{ color: "#94a3b8" }}>{txt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function KpiCard({ titulo, valor, sub, destaque }) {
  return (
    <div style={{ background: "#1e293b", border: `1px solid ${destaque ? "#2563eb" : "#334155"}`, borderRadius: 10, padding: "14px 20px", minWidth: 160, flex: "1 1 160px" }}>
      <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{titulo}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: destaque ? "#60a5fa" : "#f1f5f9" }}>{valor ?? "—"}</div>
      {sub && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function SlaBadge({ valor }) {
  if (valor === null || valor === undefined) return <span style={{ color: "#475569" }}>—</span>;
  const met = valor === "Met";
  return <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 12, fontSize: 12, fontWeight: 700, background: met ? "#14532d" : "#450a0a", color: met ? "#4ade80" : "#f87171" }}>{met ? "Met" : "Breached"}</span>;
}

function fmtMin(mins) {
  if (mins === null || mins === undefined) return "—";
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

const slaStyles = {
  select: { padding: "6px 10px", borderRadius: 6, border: "1px solid #334155", background: "#1e293b", color: "#e2e8f0", fontSize: 13, minWidth: 160 },
  input: { padding: "6px 10px", borderRadius: 6, border: "1px solid #334155", background: "#1e293b", color: "#e2e8f0", fontSize: 13, width: 130 },
  btnPrimary: { padding: "8px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 13, alignSelf: "flex-end" },
  btnSuccess: { padding: "8px 16px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 13, alignSelf: "flex-end" },
  th: { padding: "8px 10px", border: "1px solid #1e293b", color: "#94a3b8", textAlign: "left", fontWeight: 700, whiteSpace: "nowrap", cursor: "pointer", userSelect: "none" },
  td: { padding: "7px 10px", border: "1px solid #1e293b", color: "#e2e8f0", verticalAlign: "middle" },
};

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
  const [tecnicos, setTecnicos]     = useState([]);
  const [view, setView]             = useState("lista");

  // Filtros
  const [filtros, setFiltros]       = useState(FILTROS_INICIAL);
  const [filtroAberto, setFiltroAberto] = useState(false);
  const [filtrosAtivos, setFiltrosAtivos] = useState({});

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

  // SLA Compliance state
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = String(hoje.getMonth() + 1).padStart(2, "0");
  const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
  const [slaDateFrom, setSlaDateFrom]             = useState(`${anoAtual}-${mesAtual}-01`);
  const [slaDateTo, setSlaDateTo]                 = useState(`${anoAtual}-${mesAtual}-${String(ultimoDia).padStart(2, "0")}`);
  const [slaSectionId, setSlaSectionId]           = useState("");
  const [slaPriority, setSlaPriority]             = useState("");
  const [slaResponseTarget, setSlaResponseTarget] = useState("24");
  const [slaResolutionTarget, setSlaResolutionTarget] = useState("72");
  const [slaDados, setSlaDados]                   = useState(null);
  const [slaCarregando, setSlaCarregando]         = useState(false);
  const [slaErro, setSlaErro]                     = useState("");
  const [slaOrdenacao, setSlaOrdenacao]           = useState({ campo: "ticketId", asc: true });
  const [slaFiltroTabela, setSlaFiltroTabela]     = useState("todos");

  const MODOS = [
    { value: 0, label: "Abertos" },
    { value: 1, label: "Nao respondidos" },
    { value: 3, label: "Todos" },
    { value: 2, label: "Encerrados" },
  ];

  useEffect(() => {
    api.get("/helpdesk/categorias").then(r => setCategorias(r.data.categorias || [])).catch(() => {});
    api.get("/helpdesk/tecnicos").then(r => setTecnicos(r.data.tecnicos || [])).catch(() => {});
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

  const [erroTickets, setErroTickets] = useState(null);

  function carregarTickets(filtrosAplicar) {
    setLoading(true); setTicketSel(null); setDetalhes(null); setErroTickets(null);
    const f = filtrosAplicar || filtrosAtivos;
    const params = new URLSearchParams({ mode: modo, count: 50 });
    if (f.sectionId)  params.set("sectionId", f.sectionId);
    if (f.techId)     params.set("techId", f.techId);
    if (f.dateFrom)   params.set("dateFrom", f.dateFrom);
    if (f.dateTo)     params.set("dateTo", f.dateTo);
    if (f.statusId)   params.set("statusId", f.statusId);
    if (f.priorityId) params.set("priorityId", f.priorityId);
    api.get(`/helpdesk/tickets?${params.toString()}`)
      .then(r => setTickets(r.data.tickets || []))
      .catch(err => {
        setTickets([]);
        const detalhe = err.response?.data?.detalhe || err.message || "Erro de conexão";
        setErroTickets(detalhe);
      })
      .finally(() => setLoading(false));
  }

  function aplicarFiltros() {
    setFiltrosAtivos({ ...filtros });
    setFiltroAberto(false);
    carregarTickets(filtros);
  }

  function resetarFiltros() {
    setFiltros(FILTROS_INICIAL);
    setFiltrosAtivos({});
    setFiltroAberto(false);
    carregarTickets({});
  }

  const temFiltrosAtivos = Object.entries(filtrosAtivos).some(([k, v]) => v && v !== "");

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

  // ── SLA Compliance functions ────────────────────────────────────────────────
  async function buscarSla() {
    setSlaCarregando(true);
    setSlaErro("");
    setSlaDados(null);
    try {
      const params = new URLSearchParams({ dateFrom: slaDateFrom, dateTo: slaDateTo, responseTarget: slaResponseTarget, resolutionTarget: slaResolutionTarget });
      if (slaSectionId) params.set("sectionId", slaSectionId);
      if (slaPriority)  params.set("priority", slaPriority);
      const r = await apiFetch(`/helpdesk/sla-compliance?${params}`);
      const d = await r.json();
      if (!r.ok) { setSlaErro(d.erro || "Erro ao buscar dados."); return; }
      setSlaDados(d);
    } catch { setSlaErro("Erro de comunicação com a API."); }
    finally { setSlaCarregando(false); }
  }

  function exportarSlaCsv() {
    if (!slaDados) return;
    const header = ["Ticket","Assunto","Prioridade","Categoria","Status","Response (min)","Response SLA","Resolution (min)","Resolution SLA","URL"].join(";");
    const linhas = slaDados.tickets.map(t => [t.ticketId, `"${(t.assunto||"").replace(/"/g,"'")}"`, PRIORIDADE_PT[t.prioridade]||t.prioridade, t.categoria, t.status, t.responseMins??"", t.responseSla??"", t.resolutionMins??"", t.resolutionSla??"", t.url].join(";"));
    const csv = "\uFEFF" + [header, ...linhas].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `sla-compliance-${slaDateFrom}-${slaDateTo}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const slaTicketsVisiveis = slaDados
    ? [...slaDados.tickets]
        .filter(t => slaFiltroTabela === "breached" ? (t.responseSla === "Breached" || t.resolutionSla === "Breached") : true)
        .sort((a, b) => { const { campo, asc } = slaOrdenacao; const va = a[campo] ?? -Infinity; const vb = b[campo] ?? -Infinity; if (va < vb) return asc ? -1 : 1; if (va > vb) return asc ? 1 : -1; return 0; })
    : [];

  // ── Calcular Ranking de Sites por Volume ──────────────────────────────────
  const chamadosRanking = slaDados
    ? Object.values(
        slaDados.tickets.reduce((acc, ticket) => {
          const siteId = ticket.site || ticket.siteId || "outros";
          const siteNome = ticket.siteNome || siteId;
          if (!acc[siteId]) {
            acc[siteId] = { siteId, siteNome, total: 0, met: 0, breached: 0 };
          }
          acc[siteId].total++;
          if (ticket.responseSla === "Met" && ticket.resolutionSla === "Met") {
            acc[siteId].met++;
          }
          if (ticket.responseSla === "Breached" || ticket.resolutionSla === "Breached") {
            acc[siteId].breached++;
          }
          return acc;
        }, {})
      )
        .sort((a, b) => b.total - a.total)
        .slice(0, 15)
    : [];

  function toggleSlaOrdem(campo) { setSlaOrdenacao(o => ({ campo, asc: o.campo === campo ? !o.asc : true })); }

  const slaTotais = slaDados?.totais;

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
            {view !== "polling" && view !== "fila" && view !== "sla" && view !== "sites" && MODOS.map(m => (
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

            <button className="btn" onClick={() => setView("sla")}
              style={{ background: view === "sla" ? "rgba(37,99,235,0.15)" : "var(--surface)", color: view === "sla" ? "#2563eb" : "var(--text-muted)", border: `1px solid ${view === "sla" ? "#2563eb" : "var(--border)"}`, fontWeight: view === "sla" ? 700 : 400 }}>
              🎯 SLA
            </button>

            <button className="btn" onClick={() => setView("sites")}
              style={{ background: view === "sites" ? "rgba(14,165,233,0.15)" : "var(--surface)", color: view === "sites" ? "#0ea5e9" : "var(--text-muted)", border: `1px solid ${view === "sites" ? "#0ea5e9" : "var(--border)"}`, fontWeight: view === "sites" ? 700 : 400 }}>
              🎫 Sites
            </button>

            {view !== "polling" && view !== "fila" && view !== "sla" && view !== "sites" && (
              <>
                <button className="btn" style={{ background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)", marginLeft: "auto" }} onClick={() => setView("criar")}>+ Novo Chamado</button>
                <button className="btn" style={{ background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }} onClick={() => carregarTickets()}>Atualizar</button>
                <button className="btn" onClick={() => setFiltroAberto(p => !p)}
                  style={{ position: "relative", background: filtroAberto ? "rgba(99,102,241,0.12)" : "var(--surface)", color: filtroAberto ? "var(--accent)" : "var(--text-muted)", border: `1px solid ${filtroAberto || temFiltrosAtivos ? "var(--accent)" : "var(--border)"}` }}>
                  Filtrar
                  {temFiltrosAtivos && (
                    <span style={{ position: "absolute", top: -5, right: -5, width: 10, height: 10, borderRadius: "50%", background: "var(--accent)" }} />
                  )}
                </button>
              </>
            )}

            {(view === "polling" || view === "fila" || view === "detalhe" || view === "sla" || view === "sites") && (
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

      {/* ===== PAINEL DE FILTROS ===== */}
      {filtroAberto && view === "lista" && (
        <div className="card" style={{ marginBottom: "1.25rem", borderTop: "2px solid var(--accent)", padding: "1.25rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 4, display: "block" }}>Data de</label>
              <input type="date" value={filtros.dateFrom}
                onChange={e => setFiltros(p => ({ ...p, dateFrom: e.target.value }))}
                style={{ width: "100%", padding: "7px 10px", borderRadius: 7, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.85rem" }} />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 4, display: "block" }}>Data até</label>
              <input type="date" value={filtros.dateTo}
                onChange={e => setFiltros(p => ({ ...p, dateTo: e.target.value }))}
                style={{ width: "100%", padding: "7px 10px", borderRadius: 7, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.85rem" }} />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 4, display: "block" }}>Status</label>
              <select value={filtros.statusId} onChange={e => setFiltros(p => ({ ...p, statusId: e.target.value }))}
                style={{ width: "100%", padding: "7px 10px", borderRadius: 7, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.85rem" }}>
                {STATUS_OPCOES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 4, display: "block" }}>Prioridade</label>
              <select value={filtros.priorityId} onChange={e => setFiltros(p => ({ ...p, priorityId: e.target.value }))}
                style={{ width: "100%", padding: "7px 10px", borderRadius: 7, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.85rem" }}>
                {PRIORIDADE_OPCOES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 4, display: "block" }}>Departamento</label>
              <select value={filtros.sectionId} onChange={e => setFiltros(p => ({ ...p, sectionId: e.target.value }))}
                style={{ width: "100%", padding: "7px 10px", borderRadius: 7, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.85rem" }}>
                <option value="">Todos</option>
                {categorias.map(c => <option key={c.CategoryID} value={c.CategoryID}>{c.Name}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 4, display: "block" }}>Técnico</label>
              <select value={filtros.techId} onChange={e => setFiltros(p => ({ ...p, techId: e.target.value }))}
                style={{ width: "100%", padding: "7px 10px", borderRadius: 7, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.85rem" }}>
                <option value="">Todos</option>
                {tecnicos.map(t => <option key={t.UserID} value={t.UserID}>{t.FirstName} {t.LastName}</option>)}
              </select>
            </div>

          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", paddingTop: "0.75rem", borderTop: "1px solid var(--border)" }}>
            <button className="btn btn-primary" style={{ fontSize: "0.85rem" }} onClick={aplicarFiltros}>Aplicar</button>
            <button className="btn" style={{ fontSize: "0.85rem", background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }} onClick={resetarFiltros}>Reset</button>
            {temFiltrosAtivos && (
              <span style={{ fontSize: "0.75rem", color: "var(--accent)", marginLeft: "auto" }}>
                Filtros ativos
              </span>
            )}
          </div>
        </div>
      )}

      {/* ===== CHAMADOS × SITES ===== */}
      {view === "sites" && (
        <ChamadosSites embedded />
      )}

      {/* ===== SLA COMPLIANCE ===== */}
      {view === "sla" && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: 4 }}>📊 SLA Compliance</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
              Percentual de chamados que atenderam os targets de resposta e resolução no período selecionado.
            </p>
          </div>

          {/* Filtros SLA */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>CATEGORIA</div>
              <select value={slaSectionId} onChange={e => setSlaSectionId(e.target.value)} style={slaStyles.select}>
                <option value="">— Todas —</option>
                {categorias.map(c => <option key={c.CategoryID} value={c.CategoryID}>{c.Name}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>PRIORIDADE</div>
              <select value={slaPriority} onChange={e => setSlaPriority(e.target.value)} style={slaStyles.select}>
                {SLA_PRIORIDADES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>DE</div>
              <input type="date" value={slaDateFrom} onChange={e => setSlaDateFrom(e.target.value)} style={slaStyles.input} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>ATÉ</div>
              <input type="date" value={slaDateTo} onChange={e => setSlaDateTo(e.target.value)} style={slaStyles.input} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>META RESPOSTA (h)</div>
              <input type="number" min="1" value={slaResponseTarget} onChange={e => setSlaResponseTarget(e.target.value)} style={{ ...slaStyles.input, width: 70 }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>META RESOLUÇÃO (h)</div>
              <input type="number" min="1" value={slaResolutionTarget} onChange={e => setSlaResolutionTarget(e.target.value)} style={{ ...slaStyles.input, width: 80 }} />
            </div>
            <button onClick={buscarSla} disabled={slaCarregando} style={slaStyles.btnPrimary}>
              {slaCarregando ? "⏳ Calculando..." : "🔍 Gerar Relatório"}
            </button>
            {slaDados && <button onClick={exportarSlaCsv} style={slaStyles.btnSuccess}>⬇️ Exportar CSV</button>}
          </div>

          {slaErro && (
            <div style={{ background: "#450a0a", border: "1px solid #dc2626", color: "#fca5a5", padding: "10px 14px", borderRadius: 6, marginBottom: 12, fontSize: 13 }}>{slaErro}</div>
          )}

          {slaCarregando && (
            <div style={{ textAlign: "center", padding: 48, color: "#94a3b8" }}>
              <div style={{ fontSize: 32 }}>⏳</div>
              <div style={{ marginTop: 8 }}>Buscando tickets e calculando SLA...</div>
              <div style={{ fontSize: 12, marginTop: 4, color: "#94a3b8" }}>Pode demorar alguns segundos dependendo do volume de chamados.</div>
            </div>
          )}

          {slaDados && !slaCarregando && (
            <>
              {/* Cards KPI */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
                <KpiCard titulo="Total de Chamados" valor={slaTotais.total} sub={`${slaDateFrom} → ${slaDateTo}`} />
                <KpiCard titulo={`Response SLA (${slaDados.configuracao.responseTarget}h)`} valor={slaTotais.response.percentual !== null ? `${slaTotais.response.percentual}%` : "—"} sub={`${slaTotais.response.met} / ${slaTotais.response.avaliados} atendidos`} destaque />
                <KpiCard titulo={`Resolution SLA (${slaDados.configuracao.resolutionTarget}h)`} valor={slaTotais.resolution.percentual !== null ? `${slaTotais.resolution.percentual}%` : "—"} sub={`${slaTotais.resolution.met} / ${slaTotais.resolution.avaliados} atendidos`} destaque />
                <KpiCard titulo="Breached" valor={slaTotais.response.breached + slaTotais.resolution.breached} sub={`${slaTotais.response.breached} resposta  ·  ${slaTotais.resolution.breached} resolução`} />
              </div>

              {/* Gráficos */}
              <div style={{ display: "flex", gap: 24, marginBottom: 24, flexWrap: "wrap" }}>
                <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: "16px 20px" }}>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>RESPONSE SLA</div>
                  <DonutChart met={slaTotais.response.met} breached={slaTotais.response.breached} naoAvaliados={slaTotais.total - slaTotais.response.avaliados} label="Resposta" />
                </div>
                <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: "16px 20px" }}>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>RESOLUTION SLA</div>
                  <DonutChart met={slaTotais.resolution.met} breached={slaTotais.resolution.breached} naoAvaliados={slaTotais.total - slaTotais.resolution.avaliados} label="Resolução" />
                </div>
              </div>

              {/* Ranking de Sites por Volume de Chamados */}
              {chamadosRanking.length > 0 && (
                <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: "16px 20px", marginBottom: 24 }}>
                  <div style={{ fontSize: 14, color: "#94a3b8", fontWeight: 700, marginBottom: 12 }}>🏢 RANKING DE SITES POR VOLUME</div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>
                      <thead>
                        <tr style={{ background: "#0f172a" }}>
                          <th style={{ ...slaStyles.th, width: "50%" }}>Site</th>
                          <th style={{ ...slaStyles.th, textAlign: "center" }}>Total</th>
                          <th style={{ ...slaStyles.th, textAlign: "center" }}>Breached</th>
                          <th style={{ ...slaStyles.th, textAlign: "center" }}>Compliance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chamadosRanking.map((site, i) => {
                          const compliance = site.total > 0 ? Math.round((site.met / site.total) * 100) : 0;
                          return (
                            <tr key={i} style={{ background: i % 2 === 0 ? "#0f172a" : "#111827" }}>
                              <td style={slaStyles.td}><strong>{site.siteNome || site.siteId || "N/A"}</strong></td>
                              <td style={{ ...slaStyles.td, textAlign: "center" }}>{site.total}</td>
                              <td style={{ ...slaStyles.td, textAlign: "center" }}>
                                {site.breached > 0 ? (
                                  <span style={{ color: "#ef4444", fontWeight: 700 }}>{site.breached}</span>
                                ) : (
                                  <span style={{ color: "#94a3b8" }}>0</span>
                                )}
                              </td>
                              <td style={{ ...slaStyles.td, textAlign: "center" }}>
                                <span style={{ 
                                  padding: "2px 10px", 
                                  borderRadius: 12, 
                                  fontSize: 11, 
                                  fontWeight: 700,
                                  background: compliance >= 80 ? "#14532d" : compliance >= 60 ? "#854d0e" : "#450a0a",
                                  color: compliance >= 80 ? "#4ade80" : compliance >= 60 ? "#fbbf24" : "#f87171"
                                }}>
                                  {compliance}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Filtro rápido tabela */}
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {[
                  { val: "todos", label: `Todos (${slaDados.tickets.length})` },
                  { val: "breached", label: `Breached (${slaDados.tickets.filter(t => t.responseSla === "Breached" || t.resolutionSla === "Breached").length})` },
                ].map(({ val, label }) => (
                  <button key={val} onClick={() => setSlaFiltroTabela(val)}
                    style={{ padding: "5px 14px", borderRadius: 6, border: "1px solid #334155", background: slaFiltroTabela === val ? "#2563eb" : "#1e293b", color: slaFiltroTabela === val ? "#fff" : "#94a3b8", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Tabela SLA */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "#0f172a" }}>
                      {[
                        { campo: "ticketId", label: "Ticket" },
                        { campo: "assunto", label: "Assunto" },
                        { campo: "prioridade", label: "Prioridade" },
                        { campo: "responseMins", label: "Resposta" },
                        { campo: "responseSla", label: "Response SLA" },
                        { campo: "resolutionMins", label: "Resolução" },
                        { campo: "resolutionSla", label: "Resolution SLA" },
                      ].map(({ campo, label }) => (
                        <th key={campo} onClick={() => toggleSlaOrdem(campo)} style={slaStyles.th}>
                          {label}{slaOrdenacao.campo === campo ? (slaOrdenacao.asc ? " ▲" : " ▼") : ""}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {slaTicketsVisiveis.length === 0 ? (
                      <tr><td colSpan={7} style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>Nenhum chamado encontrado.</td></tr>
                    ) : slaTicketsVisiveis.map((t, i) => {
                      const breached = t.responseSla === "Breached" || t.resolutionSla === "Breached";
                      return (
                        <tr key={t.ticketId} style={{ background: breached ? "#1c0a0a" : i % 2 === 0 ? "#0f172a" : "#111827", borderLeft: breached ? "3px solid #ef4444" : "3px solid transparent" }}>
                          <td style={slaStyles.td}>
                            <a href={`${JITBIT_BASE}/helpdesk/Ticket/${t.ticketId}`} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa", textDecoration: "none" }}>#{t.ticketId}</a>
                          </td>
                          <td style={{ ...slaStyles.td, maxWidth: 280 }}>
                            <a href={`${JITBIT_BASE}/helpdesk/Ticket/${t.ticketId}`} target="_blank" rel="noopener noreferrer" style={{ color: "#e2e8f0", textDecoration: "none" }} title={t.assunto}>
                              {t.assunto.length > 50 ? t.assunto.slice(0, 50) + "…" : t.assunto}
                            </a>
                          </td>
                          <td style={slaStyles.td}>
                            <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600, background: corSla(t.prioridade) + "22", color: corSla(t.prioridade), border: `1px solid ${corSla(t.prioridade)}44` }}>
                              {PRIORIDADE_PT[t.prioridade] || t.prioridade}
                            </span>
                          </td>
                          <td style={{ ...slaStyles.td, color: "#94a3b8" }}>{fmtMin(t.responseMins)}</td>
                          <td style={slaStyles.td}><SlaBadge valor={t.responseSla} /></td>
                          <td style={{ ...slaStyles.td, color: "#94a3b8" }}>{fmtMin(t.resolutionMins)}</td>
                          <td style={slaStyles.td}><SlaBadge valor={t.resolutionSla} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: 10, fontSize: 11, color: "#94a3b8", textAlign: "right" }}>
                {slaTicketsVisiveis.length} de {slaDados.tickets.length} chamados exibidos
                &nbsp;·&nbsp;Meta resposta: {slaDados.configuracao.responseTarget}h
                &nbsp;·&nbsp;Meta resolução: {slaDados.configuracao.resolutionTarget}h
              </div>
            </>
          )}
        </div>
      )}

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
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 3 }}>última EXECUCAO</div>
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
              Score {">="} 85% resposta automatica · Score {">="} 65% sugestao para humano · Score abaixo de 65% escalado
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
          ) : erroTickets ? (
            <div className="alert alert-error" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
              <span>⚠️ Erro ao buscar tickets: <strong>{erroTickets}</strong></span>
              <button className="btn" style={{ whiteSpace: "nowrap", flexShrink: 0 }} onClick={carregarTickets}>🔄 Tentar novamente</button>
            </div>
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
                  <th>Prioridade</th>
                  <th>Técnico</th>
                  <th>Data</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.IssueID} style={{ cursor: "pointer" }}>
                    <td style={{ fontWeight: 600, color: "var(--accent)" }}>#{t.IssueID}</td>
                    <td style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} onClick={() => abrirDetalhe(t)} title={t.Subject}>
                      {t.Subject}
                    </td>
                    <td style={{ fontSize: "0.85rem" }}>{t.UserName || "-"}</td>
                    <td><Badge variant="info" size="sm">{t.Category || "-"}</Badge></td>
                    <td style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                      {t.PriorityName ? (
                        <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: "0.75rem", fontWeight: 600,
                          background: t.PriorityName === "Crítica" ? "rgba(239,68,68,0.12)" : t.PriorityName === "Alta" ? "rgba(245,158,11,0.12)" : "rgba(99,102,241,0.1)",
                          color: t.PriorityName === "Crítica" ? "#ef4444" : t.PriorityName === "Alta" ? "#f59e0b" : "var(--accent)" }}>
                          {t.PriorityName}
                        </span>
                      ) : "-"}
                    </td>
                    <td style={{ fontSize: "0.8rem" }}>{t.TechFirstName ? `${t.TechFirstName} ${t.TechLastName || ""}`.trim() : "-"}</td>
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
                    <Badge variant="info" size="sm">origem: {acao.resultado.origem}</Badge>
                    {acao.resultado.score && <Badge variant="secondary" size="sm">score: {(acao.resultado.score * 100).toFixed(1)}%</Badge>}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>Sugestao da IA:</div>
                  <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: "0.9rem", lineHeight: 1.6 }}>{acao.resultado.sugestaoResposta}</pre>
                </div>
              )}
              {!acao.enviando && acao.tipo === "respondido" && <div className="alert alert-success">Resposta postada no Jitbit com sucesso!</div>}
              {!acao.enviando && acao.tipo === "erro" && <div className="alert alert-error">Erro ao processar. Verifique se a API está configurada corretamente.</div>}
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
