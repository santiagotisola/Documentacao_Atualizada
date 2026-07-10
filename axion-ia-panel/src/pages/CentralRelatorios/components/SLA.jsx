import { useState, useEffect } from "react";
import { apiFetch } from "../../../services/api";

const JITBIT_BASE = "https://desk.axiontecnologia.com.br";

const PRIORIDADES = [
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

function cor(prioridade) {
  return {
    Critical: "#ef4444",
    High:     "#f97316",
    Normal:   "#60a5fa",
    Low:      "#94a3b8",
  }[prioridade] || "#60a5fa";
}

// ── Gráfico de rosca simples (SVG, sem dependência) ──────────────────────────
function DonutChart({ met, breached, naoAvaliados, label }) {
  const total     = met + breached + naoAvaliados;
  if (total === 0) return <div style={{ color: "#94a3b8", fontSize: 12 }}>Sem dados</div>;

  const R = 44, cx = 60, cy = 60, stroke = 18;
  const circ = 2 * Math.PI * R;

  function slice(valor, offset, fill) {
    const dash = (valor / total) * circ;
    return (
      <circle
        key={fill}
        cx={cx} cy={cy} r={R}
        fill="none"
        stroke={fill}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={-offset}
        strokeLinecap="butt"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    );
  }

  const offMet      = 0;
  const offBreached = (met     / total) * circ;
  const offNone     = offBreached + (breached / total) * circ;

  const pct = met + breached > 0
    ? Math.round((met / (met + breached)) * 10) / 0.1
    : null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <svg width={120} height={120} viewBox="0 0 120 120">
        {slice(met,          offMet,      "#22c55e")}
        {slice(breached,     offBreached, "#ef4444")}
        {slice(naoAvaliados, offNone,     "#334155")}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#f1f5f9" fontSize="15" fontWeight="700">
          {pct !== null ? `${pct}%` : "—"}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#94a3b8" fontSize="8">
          {label}
        </text>
      </svg>
      <div style={{ fontSize: 12 }}>
        {[
          { cor: "#22c55e", txt: `Met: ${met}` },
          { cor: "#ef4444", txt: `Breached: ${breached}` },
          { cor: "#334155", txt: `Abertos: ${naoAvaliados}` },
        ].map(({ cor: c, txt }) => (
          <div key={txt} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "inline-block", flexShrink: 0 }} />
            <span style={{ color: "#94a3b8" }}>{txt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Card KPI ─────────────────────────────────────────────────────────────────
function KpiCard({ titulo, valor, sub, destaque }) {
  return (
    <div style={{
      background: "#1e293b",
      border: `1px solid ${destaque ? "#2563eb" : "#334155"}`,
      borderRadius: 10,
      padding: "14px 20px",
      minWidth: 160,
      flex: "1 1 160px",
    }}>
      <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
        {titulo}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: destaque ? "#60a5fa" : "#f1f5f9" }}>
        {valor ?? "—"}
      </div>
      {sub && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ── Célula SLA colorida ───────────────────────────────────────────────────────
function SlaBadge({ valor }) {
  if (valor === null || valor === undefined)
    return <span style={{ color: "#475569" }}>—</span>;
  const met = valor === "Met";
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: 12,
      fontSize: 12,
      fontWeight: 700,
      background: met ? "#14532d" : "#450a0a",
      color:      met ? "#4ade80"  : "#f87171",
    }}>
      {met ? "Met" : "Breached"}
    </span>
  );
}

function fmtMin(mins) {
  if (mins === null || mins === undefined) return "—";
  if (mins < 60)  return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

// ── Página principal ─────────────────────────────────────────────────────────
export default function SLA() {
  const hoje = new Date();
  const ano  = hoje.getFullYear();
  const mes  = String(hoje.getMonth() + 1).padStart(2, "0");
  const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();

  const [dateFrom,         setDateFrom]         = useState(`${ano}-${mes}-01`);
  const [dateTo,           setDateTo]           = useState(`${ano}-${mes}-${String(ultimoDia).padStart(2, "0")}`);
  const [sectionId,        setSectionId]        = useState("");
  const [priority,         setPriority]         = useState("");
  const [responseTarget,   setResponseTarget]   = useState("24");
  const [resolutionTarget, setResolutionTarget] = useState("72");
  const [categorias,       setCategorias]       = useState([]);
  const [dados,            setDados]            = useState(null);
  const [carregando,       setCarregando]       = useState(false);
  const [erro,             setErro]             = useState("");
  const [ordenacao,        setOrdenacao]        = useState({ campo: "ticketId", asc: true });
  const [filtroTabela,     setFiltroTabela]     = useState("todos"); // todos | breached

  // Carregar categorias
  useEffect(() => {
    apiFetch(`/helpdesk/categorias`)
      .then(r => r.json())
      .then(d => setCategorias(d.categorias || []))
      .catch(() => {});
  }, []);

  async function buscar() {
    setCarregando(true);
    setErro("");
    setDados(null);
    try {
      const params = new URLSearchParams({
        dateFrom,
        dateTo,
        responseTarget,
        resolutionTarget,
      });
      if (sectionId) params.set("sectionId", sectionId);
      if (priority)  params.set("priority",  priority);

      const r = await apiFetch(`/helpdesk/sla-compliance?${params}`);
      const d = await r.json();
      if (!r.ok) { setErro(d.erro || "Erro ao buscar dados."); return; }
      setDados(d);
    } catch {
      setErro("Erro de comunicação com a API.");
    } finally {
      setCarregando(false);
    }
  }

  function exportarCSV() {
    if (!dados) return;
    const header = [
      "Ticket", "Assunto", "Prioridade", "Categoria", "Status",
      "Response (min)", "Response SLA", "Resolution (min)", "Resolution SLA", "URL"
    ].join(";");
    const linhas = dados.tickets.map(t => [
      t.ticketId,
      `"${(t.assunto || "").replace(/"/g, "'")}"`,
      PRIORIDADE_PT[t.prioridade] || t.prioridade,
      t.categoria,
      t.status,
      t.responseMins  ?? "",
      t.responseSla   ?? "",
      t.resolutionMins ?? "",
      t.resolutionSla  ?? "",
      t.url,
    ].join(";"));
    const csv  = "\uFEFF" + [header, ...linhas].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `sla-compliance-${dateFrom}-${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Ordena e filtra tabela
  const ticketsVisiveis = dados
    ? [...dados.tickets]
        .filter(t => {
          if (filtroTabela === "breached")
            return t.responseSla === "Breached" || t.resolutionSla === "Breached";
          return true;
        })
        .sort((a, b) => {
          const { campo, asc } = ordenacao;
          const va = a[campo] ?? -Infinity;
          const vb = b[campo] ?? -Infinity;
          if (va < vb) return asc ? -1 : 1;
          if (va > vb) return asc ? 1  : -1;
          return 0;
        })
    : [];

  function toggleOrdem(campo) {
    setOrdenacao(o => ({ campo, asc: o.campo === campo ? !o.asc : true }));
  }

  const totais = dados?.totais;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>📊 SLA Compliance — Help Desk</h2>
        <p className="page-desc">
          Percentual de chamados que atenderam os targets de resposta e resolução no período selecionado.
        </p>
      </div>

      {/* ── Filtros ─────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 16 }}>

        {/* Categoria */}
        <div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>CATEGORIA</div>
          <select value={sectionId} onChange={e => setSectionId(e.target.value)}
            style={stSelect}>
            <option value="">— Todas —</option>
            {categorias.map(c => (
              <option key={c.CategoryID} value={c.CategoryID}>{c.Name}</option>
            ))}
          </select>
        </div>

        {/* Prioridade */}
        <div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>PRIORIDADE</div>
          <select value={priority} onChange={e => setPriority(e.target.value)} style={stSelect}>
            {PRIORIDADES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>

        {/* Data De */}
        <div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>DE</div>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={stInput} />
        </div>

        {/* Data Até */}
        <div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>ATÉ</div>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={stInput} />
        </div>

        {/* Target Resposta */}
        <div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>META RESPOSTA (h)</div>
          <input type="number" min="1" value={responseTarget}
            onChange={e => setResponseTarget(e.target.value)}
            style={{ ...stInput, width: 70 }} />
        </div>

        {/* Target Resolução */}
        <div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>META RESOLUÇÃO (h)</div>
          <input type="number" min="1" value={resolutionTarget}
            onChange={e => setResolutionTarget(e.target.value)}
            style={{ ...stInput, width: 80 }} />
        </div>

        <button onClick={buscar} disabled={carregando} style={stBtnPrimary}>
          {carregando ? "⏳ Calculando..." : "🔍 Gerar Relatório"}
        </button>

        {dados && (
          <button onClick={exportarCSV} style={stBtnSuccess}>
            ⬇️ Exportar CSV
          </button>
        )}
      </div>

      {/* ── Erro ──────────────────────────────────────────────────────────────── */}
      {erro && (
        <div style={{ background: "#450a0a", border: "1px solid #dc2626", color: "#fca5a5", padding: "10px 14px", borderRadius: 6, marginBottom: 12, fontSize: 13 }}>
          {erro}
        </div>
      )}

      {/* ── Loading ───────────────────────────────────────────────────────────── */}
      {carregando && (
        <div style={{ textAlign: "center", padding: 48, color: "#94a3b8" }}>
          <div style={{ fontSize: 32 }}>⏳</div>
          <div style={{ marginTop: 8 }}>Buscando tickets e calculando SLA...</div>
          <div style={{ fontSize: 12, marginTop: 4, color: "#94a3b8" }}>
            Pode demorar alguns segundos dependendo do volume de chamados.
          </div>
        </div>
      )}

      {/* ── Resultados ────────────────────────────────────────────────────────── */}
      {dados && !carregando && (
        <>
          {/* Cards KPI */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
            <KpiCard
              titulo="Total de Chamados"
              valor={totais.total}
              sub={`${dateFrom} → ${dateTo}`}
            />
            <KpiCard
              titulo={`Response SLA (${dados.configuracao.responseTarget}h)`}
              valor={totais.response.percentual !== null ? `${totais.response.percentual}%` : "—"}
              sub={`${totais.response.met} / ${totais.response.avaliados} atendidos`}
              destaque
            />
            <KpiCard
              titulo={`Resolution SLA (${dados.configuracao.resolutionTarget}h)`}
              valor={totais.resolution.percentual !== null ? `${totais.resolution.percentual}%` : "—"}
              sub={`${totais.resolution.met} / ${totais.resolution.avaliados} atendidos`}
              destaque
            />
            <KpiCard
              titulo="Breached"
              valor={totais.response.breached + totais.resolution.breached}
              sub={`${totais.response.breached} resposta  ·  ${totais.resolution.breached} resolução`}
            />
          </div>

          {/* Gráficos */}
          <div style={{ display: "flex", gap: 24, marginBottom: 24, flexWrap: "wrap" }}>
            <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: "16px 20px" }}>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>RESPONSE SLA</div>
              <DonutChart
                met={totais.response.met}
                breached={totais.response.breached}
                naoAvaliados={totais.total - totais.response.avaliados}
                label="Resposta"
              />
            </div>
            <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: "16px 20px" }}>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>RESOLUTION SLA</div>
              <DonutChart
                met={totais.resolution.met}
                breached={totais.resolution.breached}
                naoAvaliados={totais.total - totais.resolution.avaliados}
                label="Resolução"
              />
            </div>
          </div>

          {/* Filtro rápido tabela */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {[
              { val: "todos",    label: `Todos (${dados.tickets.length})` },
              { val: "breached", label: `Breached (${dados.tickets.filter(t => t.responseSla === "Breached" || t.resolutionSla === "Breached").length})` },
            ].map(({ val, label }) => (
              <button key={val} onClick={() => setFiltroTabela(val)}
                style={{
                  padding: "5px 14px",
                  borderRadius: 6,
                  border: "1px solid #334155",
                  background: filtroTabela === val ? "#2563eb" : "#1e293b",
                  color: filtroTabela === val ? "#fff" : "#94a3b8",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                }}>
                {label}
              </button>
            ))}
          </div>

          {/* Tabela */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#0f172a" }}>
                  {[
                    { campo: "ticketId",       label: "Ticket" },
                    { campo: "assunto",         label: "Assunto" },
                    { campo: "prioridade",      label: "Prioridade" },
                    { campo: "responseMins",    label: "Resposta" },
                    { campo: "responseSla",     label: "Response SLA" },
                    { campo: "resolutionMins",  label: "Resolução" },
                    { campo: "resolutionSla",   label: "Resolution SLA" },
                  ].map(({ campo, label }) => (
                    <th key={campo}
                      onClick={() => toggleOrdem(campo)}
                      style={stTh}>
                      {label}
                      {ordenacao.campo === campo ? (ordenacao.asc ? " ▲" : " ▼") : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ticketsVisiveis.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>
                      Nenhum chamado encontrado.
                    </td>
                  </tr>
                ) : ticketsVisiveis.map((t, i) => {
                  const breached = t.responseSla === "Breached" || t.resolutionSla === "Breached";
                  return (
                    <tr key={t.ticketId}
                      style={{
                        background: breached ? "#1c0a0a" : i % 2 === 0 ? "#0f172a" : "#111827",
                        borderLeft: breached ? "3px solid #ef4444" : "3px solid transparent",
                      }}>
                      {/* Ticket */}
                      <td style={stTd}>
                        <a href={`${JITBIT_BASE}/helpdesk/Ticket/${t.ticketId}`}
                          target="_blank" rel="noopener noreferrer"
                          style={{ color: "#60a5fa", textDecoration: "none" }}>
                          #{t.ticketId}
                        </a>
                      </td>
                      {/* Assunto */}
                      <td style={{ ...stTd, maxWidth: 280 }}>
                        <a href={`${JITBIT_BASE}/helpdesk/Ticket/${t.ticketId}`}
                          target="_blank" rel="noopener noreferrer"
                          style={{ color: "#e2e8f0", textDecoration: "none" }}
                          title={t.assunto}>
                          {t.assunto.length > 50 ? t.assunto.slice(0, 50) + "…" : t.assunto}
                        </a>
                      </td>
                      {/* Prioridade */}
                      <td style={stTd}>
                        <span style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 10,
                          fontSize: 11,
                          fontWeight: 600,
                          background: cor(t.prioridade) + "22",
                          color: cor(t.prioridade),
                          border: `1px solid ${cor(t.prioridade)}44`,
                        }}>
                          {PRIORIDADE_PT[t.prioridade] || t.prioridade}
                        </span>
                      </td>
                      {/* Response mins */}
                      <td style={{ ...stTd, color: "#94a3b8" }}>{fmtMin(t.responseMins)}</td>
                      {/* Response SLA */}
                      <td style={stTd}><SlaBadge valor={t.responseSla} /></td>
                      {/* Resolution mins */}
                      <td style={{ ...stTd, color: "#94a3b8" }}>{fmtMin(t.resolutionMins)}</td>
                      {/* Resolution SLA */}
                      <td style={stTd}><SlaBadge valor={t.resolutionSla} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 10, fontSize: 11, color: "#94a3b8", textAlign: "right" }}>
            {ticketsVisiveis.length} de {dados.tickets.length} chamados exibidos
            &nbsp;·&nbsp;
            Meta resposta: {dados.configuracao.responseTarget}h
            &nbsp;·&nbsp;
            Meta resolução: {dados.configuracao.resolutionTarget}h
          </div>
        </>
      )}
    </div>
  );
}

// ── Estilos compartilhados ────────────────────────────────────────────────────
const stSelect = {
  padding: "6px 10px",
  borderRadius: 6,
  border: "1px solid #334155",
  background: "#1e293b",
  color: "#e2e8f0",
  fontSize: 13,
  minWidth: 160,
};
const stInput = {
  padding: "6px 10px",
  borderRadius: 6,
  border: "1px solid #334155",
  background: "#1e293b",
  color: "#e2e8f0",
  fontSize: 13,
  width: 130,
};
const stBtnPrimary = {
  padding: "8px 20px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 13,
  alignSelf: "flex-end",
};
const stBtnSuccess = {
  padding: "8px 16px",
  background: "#16a34a",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 13,
  alignSelf: "flex-end",
};
const stTh = {
  padding: "8px 10px",
  border: "1px solid #1e293b",
  color: "#94a3b8",
  textAlign: "left",
  fontWeight: 700,
  whiteSpace: "nowrap",
  cursor: "pointer",
  userSelect: "none",
};
const stTd = {
  padding: "7px 10px",
  border: "1px solid #1e293b",
  color: "#e2e8f0",
  verticalAlign: "middle",
};
