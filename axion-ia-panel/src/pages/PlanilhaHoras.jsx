import { useState, useEffect } from "react";

const API = "http://localhost:3100/api";

export default function PlanilhaHoras() {
  const hoje = new Date();
  const primeiroDiaMes = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-01`;
  const ultimoDiaMes   = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(
    new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate()
  ).padStart(2, "0")}`;

  const [tecnicos, setTecnicos]       = useState([]);
  const [tecnicoId, setTecnicoId]     = useState("");
  const [tecnicoNome, setTecnicoNome] = useState("");
  const [dataInicio, setDataInicio]   = useState(primeiroDiaMes);
  const [dataFim, setDataFim]         = useState(ultimoDiaMes);
  const [dados, setDados]             = useState(null);
  const [carregando, setCarregando]   = useState(false);
  const [erro, setErro]               = useState("");

  useEffect(() => {
    fetch(`${API}/helpdesk/tecnicos`)
      .then(r => r.json())
      .then(d => setTecnicos(d.tecnicos || []))
      .catch(() => {});
  }, []);

  function selecionarTecnico(e) {
    const val = e.target.value;
    setTecnicoId(val);
    const tec = tecnicos.find(t => String(t.UserID) === val);
    setTecnicoNome(tec ? `${tec.FirstName} ${tec.LastName}` : "");
  }

  async function buscar() {
    setCarregando(true);
    setErro("");
    setDados(null);
    try {
      const params = new URLSearchParams({ dataInicio, dataFim });
      if (tecnicoId)   params.set("tecnicoId", tecnicoId);
      if (tecnicoNome) params.set("tecnicoNome", tecnicoNome);
      const r = await fetch(`${API}/helpdesk/planilha-horas?${params}`);
      const d = await r.json();
      if (!r.ok) { setErro(d.erro || "Erro ao buscar dados."); return; }
      setDados(d);
    } catch {
      setErro("Erro de comunicação com a API.");
    }
    setCarregando(false);
  }

  function exportarCSV() {
    if (!dados) return;
    const header = ["Data", "Chamado", "Descrição", "Técnico", "Cliente", "Categoria", "Horas", "Status", "URL"].join(";");
    const linhas = dados.linhas.map(l =>
      [l.data, l.chamado, `"${l.descricao}"`, l.tecnico, l.cliente, l.categoria, l.horasGastas, l.status, l.url].join(";")
    );
    const csv  = "\uFEFF" + [header, ...linhas].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `planilha-horas-${dataInicio}-a-${dataFim}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Agrupa linhas por data para exibição
  const linhasPorDia = dados
    ? dados.linhas.reduce((acc, l) => {
        (acc[l.data] = acc[l.data] || []).push(l);
        return acc;
      }, {})
    : {};

  const totalHoras = dados
    ? dados.linhas
        .reduce((s, l) => s + (parseFloat((l.horasGastas || "0").replace(",", ".")) || 0), 0)
        .toFixed(2)
    : 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>🗂️ Planilha de Horas — Help Desk</h2>
        <p className="page-desc">Atividades do técnico por período, formatadas para preenchimento da planilha.</p>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 16 }}>

        {/* Técnico */}
        <div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>TÉCNICO</div>
          <select value={tecnicoId} onChange={selecionarTecnico}
            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #334155", background: "#1e293b", color: "#e2e8f0", fontSize: 13, minWidth: 200 }}>
            <option value="">— Todos —</option>
            {tecnicos.map(t => (
              <option key={t.UserID} value={t.UserID}>
                {t.FirstName} {t.LastName}
              </option>
            ))}
          </select>
        </div>

        {/* Data Início */}
        <div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>DATA INÍCIO</div>
          <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #334155", background: "#1e293b", color: "#e2e8f0", fontSize: 13 }} />
        </div>

        {/* Data Fim */}
        <div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>DATA FIM</div>
          <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #334155", background: "#1e293b", color: "#e2e8f0", fontSize: 13 }} />
        </div>

        <button onClick={buscar} disabled={carregando}
          style={{ padding: "8px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 13, alignSelf: "flex-end" }}>
          {carregando ? "⏳ Buscando..." : "🔍 Consultar"}
        </button>

        {dados && (
          <button onClick={exportarCSV}
            style={{ padding: "8px 16px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 13, alignSelf: "flex-end" }}>
            ⬇️ Exportar CSV
          </button>
        )}
      </div>

      {erro && (
        <div style={{ background: "#450a0a", border: "1px solid #dc2626", color: "#fca5a5", padding: "10px 14px", borderRadius: 6, marginBottom: 12, fontSize: 13 }}>
          {erro}
        </div>
      )}

      {/* Cards de resumo */}
      {dados && (
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          {[
            { label: "Técnico", val: dados.tecnico },
            { label: "Período", val: `${dataInicio} → ${dataFim}` },
            { label: "Atendimentos", val: dados.total },
            { label: "Total Horas", val: `${totalHoras}h` },
          ].map(({ label, val }) => (
            <div key={label} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "8px 16px", textAlign: "center", minWidth: 120 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#60a5fa" }}>{val}</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabela agrupada por dia */}
      {dados && dados.total > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#0f172a" }}>
                {["Data", "Chamado", "Descrição", "Técnico", "Cliente", "Categoria", "Horas", "Status"].map(col => (
                  <th key={col} style={{ padding: "8px 10px", border: "1px solid #1e293b", color: "#94a3b8", textAlign: "left", fontWeight: 700, whiteSpace: "nowrap" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(linhasPorDia).map(([dia, itens]) => (
                itens.map((l, idx) => (
                  <tr key={l.chamado + idx} style={{ background: idx % 2 === 0 ? "#0f172a" : "#111827" }}>
                    {idx === 0 ? (
                      <td rowSpan={itens.length} style={{
                        padding: "8px 10px", border: "1px solid #1e293b",
                        color: "#60a5fa", fontWeight: 700, whiteSpace: "nowrap",
                        verticalAlign: "top", background: "#0f172a",
                      }}>
                        {dia}
                        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
                          {itens.length} chamado{itens.length > 1 ? "s" : ""}
                        </div>
                      </td>
                    ) : null}
                    <td style={{ padding: "6px 10px", border: "1px solid #1e293b", color: "#93c5fd", whiteSpace: "nowrap" }}>
                      <a href={l.url} target="_blank" rel="noreferrer" style={{ color: "#93c5fd", textDecoration: "none" }}>
                        #{l.chamado}
                      </a>
                    </td>
                    <td style={{ padding: "6px 10px", border: "1px solid #1e293b", color: "#e2e8f0", maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      title={l.descricao}>
                      {l.descricao}
                    </td>
                    <td style={{ padding: "6px 10px", border: "1px solid #1e293b", color: "#a3e635", whiteSpace: "nowrap" }}>{l.tecnico}</td>
                    <td style={{ padding: "6px 10px", border: "1px solid #1e293b", color: "#cbd5e1", whiteSpace: "nowrap" }}>{l.cliente}</td>
                    <td style={{ padding: "6px 10px", border: "1px solid #1e293b", color: "#94a3b8", whiteSpace: "nowrap" }}>{l.categoria}</td>
                    <td style={{ padding: "6px 10px", border: "1px solid #1e293b", color: "#fbbf24", textAlign: "center", whiteSpace: "nowrap" }}>
                      {l.horasGastas ? `${l.horasGastas}h` : "—"}
                    </td>
                    <td style={{ padding: "6px 10px", border: "1px solid #1e293b", whiteSpace: "nowrap" }}>
                      <span style={{
                        padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600,
                        background: l.status === "Encerrado" ? "#14532d" : "#1e3a5f",
                        color: l.status === "Encerrado" ? "#86efac" : "#93c5fd",
                      }}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      )}

      {dados && dados.total === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
          <p style={{ fontSize: 36 }}>🗂️</p>
          <p>Nenhuma atividade encontrada para o período e técnico selecionados.</p>
        </div>
      )}

      {!dados && !carregando && (
        <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
          <p style={{ fontSize: 36 }}>⏱️</p>
          <p>Selecione o técnico e o período, depois clique em <strong>Consultar</strong>.</p>
          <p style={{ fontSize: 12, marginTop: 8 }}>
            O texto da coluna <strong>Descrição</strong> segue o padrão:<br />
            <code style={{ color: "#60a5fa" }}>Atendimento Help Desk - Chamado #XXXXX - [Assunto]</code>
          </p>
        </div>
      )}
    </div>
  );
}
