import { useState, useEffect, useRef } from "react";
import { apiFetch } from "../services/api";

const ANO_ATUAL = new Date().getFullYear();
const ANOS = Array.from({ length: ANO_ATUAL - 2023 }, (_, i) => 2024 + i);

const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

// Gradiente de cor baseado no valor relativo à linha (máx da linha)
function corCelula(valor, maximo) {
  if (!valor || valor === 0 || !maximo) return { bg: "#1e293b", color: "#94a3b8" };
  const pct = valor / maximo;
  if (pct > 0.85) return { bg: "#dc2626", color: "#fff" };   // vermelho
  if (pct > 0.65) return { bg: "#ea580c", color: "#fff" };   // laranja
  if (pct > 0.40) return { bg: "#ca8a04", color: "#fff" };   // amarelo
  if (pct > 0.20) return { bg: "#16a34a", color: "#fff" };   // verde
  return { bg: "#0f766e", color: "#e2e8f0" };                 // teal (baixo)
}

export default function RelatorioFluxo() {
  const hoje = new Date();
  const [tipo, setTipo]               = useState("passagens");
  const [mes, setMes]                 = useState(hoje.getMonth() + 1);
  const [ano, setAno]                 = useState(hoje.getFullYear());
  const [equipamento, setEquipamento] = useState("TODOS");
  const [equipamentos, setEquipamentos] = useState([]);
  const [dados, setDados]             = useState(null);
  const [carregando, setCarregando]   = useState(false);
  const [erro, setErro]               = useState("");
  const tabelaRef = useRef(null);

  // Carrega lista de equipamentos ao montar
  useEffect(() => {
    apiFetch(`/relatorio/equipamentos`)
      .then(r => r.json())
      .then(d => setEquipamentos(d.equipamentos || []))
      .catch(() => {});
  }, []);

  async function buscar() {
    setCarregando(true);
    setErro("");
    setDados(null);
    try {
      const r = await apiFetch(`/relatorio/${tipo}?mes=${mes}&ano=${ano}&equipamento=${encodeURIComponent(equipamento)}`);
      const d = await r.json();
      if (!r.ok) {
        setErro(d.erro || "Erro ao buscar dados.");
        return;
      }
      setDados(d);
    } catch { setErro("Erro de comunicação com a API. Verifique se o AxHub está conectado."); }
    setCarregando(false);
  }

  function exportarExcel() {
    if (!dados) return;
    // Monta CSV simples e abre como download
    const cols = Array.from({ length: dados.totalDias }, (_, i) => i + 1);
    const header = ["Equip/Faixa", ...cols.map(d => `Dia ${d}`), "Total"].join(";");
    const linhas = dados.linhas.map(l => {
      const cells = cols.map(d => l.dias[d] ?? 0);
      return [l.equipFaixa, ...cells, l.total].join(";");
    });

    const csv = "\uFEFF" + [header, ...linhas].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `relatorio-${tipo}-${MESES[mes-1]}-${ano}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const dias = dados ? Array.from({ length: dados.totalDias }, (_, i) => i + 1) : [];

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>📊 Relatório Fluxo Diário</h2>
        <p className="page-desc">Matriz de {tipo === "passagens" ? "passagens" : "imagens"} por Equipamento/Faixa × Dia do mês.</p>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 16 }}>
        {/* Tipo */}
        <div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>TIPO</div>
          <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", border: "1px solid #334155" }}>
            {["passagens", "imagens"].map(t => (
              <button key={t} onClick={() => setTipo(t)}
                style={{ padding: "6px 14px", background: tipo === t ? "#2563eb" : "#1e293b", color: tipo === t ? "#fff" : "#94a3b8", border: "none", cursor: "pointer", fontWeight: tipo === t ? 700 : 400, fontSize: 13 }}>
                {t === "passagens" ? "🚗 Passagens" : "📷 Imagens"}
              </button>
            ))}
          </div>
        </div>

        {/* Mês */}
        <div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>MÊS</div>
          <select value={mes} onChange={e => setMes(Number(e.target.value))}
            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #334155", background: "#1e293b", color: "#e2e8f0", fontSize: 13 }}>
            {MESES.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
        </div>

        {/* Ano */}
        <div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>ANO</div>
          <select value={ano} onChange={e => setAno(Number(e.target.value))}
            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #334155", background: "#1e293b", color: "#e2e8f0", fontSize: 13 }}>
            {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        {/* Equipamento */}
        <div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>EQUIPAMENTO</div>
          <select value={equipamento} onChange={e => setEquipamento(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #334155", background: "#1e293b", color: "#e2e8f0", fontSize: 13, maxWidth: 220 }}>
            <option value="TODOS">TODOS</option>
            {equipamentos.map(eq => <option key={eq} value={eq}>{eq}</option>)}
          </select>
        </div>

        <button onClick={buscar} disabled={carregando}
          style={{ padding: "8px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 13, alignSelf: "flex-end" }}>
          {carregando ? "⏳ Buscando..." : "🔍 Consultar"}
        </button>

        {dados && (
          <button onClick={exportarExcel}
            style={{ padding: "8px 16px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 13, alignSelf: "flex-end" }}>
            ⬇️ Exportar CSV
          </button>
        )}
      </div>

      {/* Erro */}
      {erro && (
        <div style={{ background: "#450a0a", border: "1px solid #dc2626", color: "#fca5a5", padding: "10px 14px", borderRadius: 6, marginBottom: 12, fontSize: 13 }}>
          {erro}
        </div>
      )}

      {/* Sumário */}
      {dados && (
        <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
          {[
            { label: "Tipo", val: tipo === "passagens" ? "🚗 Passagens" : "📷 Imagens" },
            { label: "Período", val: `${MESES[dados.mes - 1]}/${dados.ano}` },
            { label: "Equip/Faixas", val: dados.totalLinhas },
            { label: "Total Geral", val: dados.linhas.reduce((s, l) => s + l.total, 0).toLocaleString("pt-BR") },
          ].map(({ label, val }) => (
            <div key={label} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "8px 16px", textAlign: "center", minWidth: 100 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#60a5fa" }}>{val}</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabela matricial */}
      {dados && dados.linhas.length > 0 && (
        <div ref={tabelaRef} style={{ overflowX: "auto", overflowY: "auto", maxHeight: "72vh" }}>
          <table style={{ borderCollapse: "collapse", fontSize: 11, minWidth: "max-content", tableLayout: "fixed" }}>
            <thead>
              <tr>
                <th style={{
                  position: "sticky", left: 0, top: 0, zIndex: 3,
                  background: "#0f172a", color: "#94a3b8", padding: "6px 10px",
                  border: "1px solid #1e293b", textAlign: "left", minWidth: 140, fontWeight: 700,
                }}>
                  Equip./Dia
                </th>
                {dias.map(d => (
                  <th key={d} style={{
                    position: "sticky", top: 0, zIndex: 2,
                    background: "#0f172a", color: "#94a3b8", padding: "5px 4px",
                    border: "1px solid #1e293b", textAlign: "center", width: 38, fontWeight: 600,
                  }}>{d}</th>
                ))}
                <th style={{
                  position: "sticky", top: 0, right: 0, zIndex: 3,
                  background: "#1e3a5f", color: "#93c5fd", padding: "5px 8px",
                  border: "1px solid #1e293b", textAlign: "center", width: 60, fontWeight: 700,
                }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {dados.linhas.map((linha, idx) => {
                const maxLinha = Math.max(...dias.map(d => linha.dias[d] || 0));
                return (
                  <tr key={linha.equipFaixa}>
                    <td style={{
                      position: "sticky", left: 0, zIndex: 1,
                      background: idx % 2 === 0 ? "#0f172a" : "#111827",
                      color: "#e2e8f0", padding: "4px 10px",
                      border: "1px solid #1e293b", fontWeight: 600, fontSize: 11, whiteSpace: "nowrap",
                    }}>
                      {linha.equipFaixa}
                    </td>
                    {dias.map(d => {
                      const val = linha.dias[d] || 0;
                      const { bg, color } = corCelula(val, maxLinha);
                      return (
                        <td key={d} style={{
                          background: bg, color,
                          padding: "4px 2px", border: "1px solid #1e293b",
                          textAlign: "center", fontWeight: val > 0 ? 600 : 400,
                          fontSize: 11,
                        }}>
                          {val > 0 ? val.toLocaleString("pt-BR") : "—"}
                        </td>
                      );
                    })}
                    <td style={{
                      position: "sticky", right: 0,
                      background: "#1e3a5f", color: "#93c5fd",
                      padding: "4px 8px", border: "1px solid #1e293b",
                      textAlign: "center", fontWeight: 700, fontSize: 11,
                    }}>
                      {linha.total.toLocaleString("pt-BR")}
                    </td>
                  </tr>
                );
              })}
              <tr style={{ fontWeight: 700 }}>
                <td style={{
                  position: "sticky", left: 0, zIndex: 1,
                  background: "#0f172a", color: "#60a5fa",
                  padding: "4px 10px", border: "1px solid #1e293b",
                  fontSize: 11, whiteSpace: "nowrap",
                }}>TOTAL / DIA</td>
                {dias.map(d => {
                  const totalDia = dados.linhas.reduce((s, l) => s + (l.dias[d] || 0), 0);
                  return (
                    <td key={d} style={{
                      background: "#0f172a", color: "#60a5fa",
                      padding: "4px 2px", border: "1px solid #1e293b",
                      textAlign: "center", fontSize: 11,
                    }}>
                      {totalDia > 0 ? totalDia.toLocaleString("pt-BR") : "—"}
                    </td>
                  );
                })}
                <td style={{
                  position: "sticky", right: 0,
                  background: "#1e3a5f", color: "#93c5fd",
                  padding: "4px 8px", border: "1px solid #1e293b",
                  textAlign: "center", fontSize: 11,
                }}>
                  {dados.linhas.reduce((s, l) => s + l.total, 0).toLocaleString("pt-BR")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {dados && dados.linhas.length === 0 && !carregando && (
        <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
          <p style={{ fontSize: 36 }}>📊</p>
          <p>Nenhum dado encontrado para o período selecionado.</p>
          <p style={{ fontSize: 12 }}>Verifique se o banco AxHub está conectado e se há registros para {MESES[mes-1]}/{ano}.</p>
        </div>
      )}

      {!dados && !carregando && (
        <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
          <p style={{ fontSize: 36 }}>🗂️</p>
          <p>Selecione o tipo, período e equipamento, depois clique em <strong>Consultar</strong>.</p>
        </div>
      )}

      {/* Legenda */}
      <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "#94a3b8" }}>Legenda (relativo ao máximo da linha):</span>
        {[
          { bg: "#0f766e", label: "Baixo (< 20%)" },
          { bg: "#16a34a", label: "Normal (20–40%)" },
          { bg: "#ca8a04", label: "Médio (40–65%)" },
          { bg: "#ea580c", label: "Alto (65–85%)" },
          { bg: "#dc2626", label: "Muito alto (> 85%)" },
        ].map(({ bg, label }) => (
          <span key={bg} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
            <span style={{ width: 14, height: 14, background: bg, borderRadius: 3, display: "inline-block" }}></span>
            <span style={{ color: "#94a3b8" }}>{label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
