import React, { useState, useEffect, useMemo } from "react";

const API = "http://localhost:3100/api";

const MESES = [
  { valor: 1, label: "Janeiro" }, { valor: 2, label: "Fevereiro" },
  { valor: 3, label: "Marco" },   { valor: 4, label: "Abril" },
  { valor: 5, label: "Maio" },    { valor: 6, label: "Junho" },
  { valor: 7, label: "Julho" },   { valor: 8, label: "Agosto" },
  { valor: 9, label: "Setembro" },{ valor: 10, label: "Outubro" },
  { valor: 11, label: "Novembro" },{ valor: 12, label: "Dezembro" },
];

const DEMO_EQUIPAMENTOS = [
  "F-DIP-D0496","F-DIP-D0497","F-DIP-D0671","F-DIP-D0672",
  "F-DIP-D0673","F-DIP-D0674","F-DIP-D0675",
];

const DEMO_LINHAS = [
  { equipFaixa:"F-DIP-D0496 FX1", dias:{1:9243,2:7814,3:5309,4:8660,5:8847,6:8989,7:9505,8:9716,9:7900,10:5343,11:8755,12:1357}, total:95538 },
  { equipFaixa:"F-DIP-D0496 FX2", dias:{1:9941,2:8400,3:5867,4:9325,5:9324,6:9852,7:10244,8:10315,9:8679,10:5835,11:9475,12:1503}, total:98760 },
  { equipFaixa:"F-DIP-D0496 FX3", dias:{1:10459,2:9759,3:7027,4:9762,5:9533,6:10166,7:10543,8:10396,9:9758,10:7032,11:9930,12:1792}, total:106157 },
  { equipFaixa:"F-DIP-D0496 FX4", dias:{1:9759,2:9550,3:7326,4:9134,5:8785,6:9301,7:9830,8:9566,9:9526,10:7174,11:9143,12:1675}, total:100769 },
  { equipFaixa:"F-DIP-D0497 FX1", dias:{1:10364,2:8407,3:6137,4:10818,5:9679,6:9572,7:10177,8:9996,9:8430,10:7121,11:9742,12:2399}, total:102842 },
  { equipFaixa:"F-DIP-D0497 FX2", dias:{1:6925,2:5574,3:4078,4:6524,5:6824,6:6880,7:6985,8:6624,9:5508,10:4461,11:6944,12:1679}, total:69006 },
  { equipFaixa:"F-DIP-D0497 FX3", dias:{1:9999,2:8144,3:5173,4:9047,5:9480,6:9286,7:9715,8:10040,9:7798,10:5819,11:9013,12:1601}, total:95115 },
  { equipFaixa:"F-DIP-D0497 FX4", dias:{1:11885,2:10791,3:7664,4:10914,5:10852,6:8344,8:8307,9:10183,10:8191,11:10914,12:2247}, total:100292 },
  { equipFaixa:"F-DIP-D0671 FX1", dias:{1:1145,2:2007,3:1856,4:908,5:946,6:980,7:1097,8:831,9:1673,10:2726,11:468}, total:14637 },
  { equipFaixa:"F-DIP-D0671 FX2", dias:{1:812,2:1332,3:1168,4:699,5:643,6:778,7:875,8:785,9:1081,10:1679,11:315}, total:10167 },
  { equipFaixa:"F-DIP-D0672 FX1", dias:{1:2319,2:2704,3:2105,4:1515,5:1535,6:2024,7:2112,8:756,9:2775,10:2002,11:1811,12:270}, total:21928 },
  { equipFaixa:"F-DIP-D0672 FX2", dias:{1:4994,2:5065,3:4167,4:3686,5:3467,6:4208,7:4522,8:2497,9:5238,10:4432,11:5274,12:1207}, total:48757 },
  { equipFaixa:"F-DIP-D0672 FX3", dias:{1:13292,2:12503,3:9274,4:12110,5:11652,6:12609,7:12552,8:12297,9:12434,10:9903,11:12265,12:3061}, total:133952 },
  { equipFaixa:"F-DIP-D0672 FX4", dias:{1:11162,2:10008,3:6596,4:10027,5:9598,6:10538,7:10419,8:10327,9:9702,10:7479,11:9770,12:2332}, total:107958 },
  { equipFaixa:"F-DIP-D0673 FX1", dias:{1:2780,2:2349,3:1628,4:2442,5:2639,6:2107,7:2713,8:2855,9:2232,10:1556,11:2490,12:426}, total:26217 },
  { equipFaixa:"F-DIP-D0674 FX1", dias:{1:1370,2:1817,3:1547,4:1204,5:1560,6:1284,7:1316,8:1214,9:1660,10:2196,11:1364,12:266}, total:16798 },
  { equipFaixa:"F-DIP-D0674 FX2", dias:{1:1365,2:1658,3:1270,4:1144,5:1021,6:1246,7:1292,8:1395,9:1661,10:1723,11:1269,12:249}, total:15293 },
  { equipFaixa:"F-DIP-D0675 FX1", dias:{1:1816,2:3048,3:2683,4:1402,5:1375,6:1491,7:1649,8:1307,9:2350,10:3749,11:1722,12:248}, total:22840 },
  { equipFaixa:"F-DIP-D0675 FX2", dias:{1:1618,2:2505,3:2095,4:1276,5:1111,6:1377,7:1454,8:1321,9:1901,10:2872,11:1524,12:280}, total:21334 },
];

const DEMO_RESULTADO = {
  tipo: "passagens", mes: 8, ano: 2025,
  totalDias: 12, totalLinhas: DEMO_LINHAS.length,
  linhas: DEMO_LINHAS,
  equipamentos: DEMO_EQUIPAMENTOS,
  _isDemo: true,
};

function corCalor(valor, maxLinha) {
  if (!valor || maxLinha === 0) return {};
  const pct = valor / maxLinha;
  if (pct > 0.85) return { background: "#ef4444", color: "#fff" };
  if (pct > 0.65) return { background: "#f97316", color: "#fff" };
  if (pct > 0.40) return { background: "#eab308", color: "#1e293b" };
  if (pct > 0.20) return { background: "#22c55e", color: "#fff" };
  return { background: "#0ea5e9", color: "#fff" };
}

function exportarCSV(linhas, diasVisiveis, equipFiltro, mes, ano, tipo) {
  const cabecalho = ["Equip./Faixa", ...diasVisiveis.map(d => "Dia " + d), "Total"];
  const rows = linhas.map(l => {
    const total = diasVisiveis.reduce((s, d) => s + (Number(l.dias[d]) || 0), 0);
    return [l.equipFaixa, ...diasVisiveis.map(d => l.dias[d] || ""), total];
  });
  const csv = [cabecalho, ...rows].map(r => r.join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "fluxo_" + tipo + "_" + equipFiltro + "_" + String(mes).padStart(2,"0") + "_" + ano + ".csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function RelatorioFluxoTabela() {
  const hoje = new Date();
  const [tipo, setTipo]                 = useState("passagens");
  const [equipamentos, setEquipamentos] = useState(DEMO_EQUIPAMENTOS);
  const [equipamento, setEquipamento]   = useState("TODOS");
  const [mes, setMes]   = useState(8);
  const [ano, setAno]   = useState(2025);
  const [loading, setLoading]     = useState(false);
  const [resultado, setResultado] = useState(DEMO_RESULTADO);
  const [apiOnline, setApiOnline] = useState(null);

  useEffect(() => {
    fetch(API + "/relatorio/equipamentos", { signal: AbortSignal.timeout(3000) })
      .then(r => r.json())
      .then(d => {
        if (d.equipamentos && d.equipamentos.length) {
          setEquipamentos(d.equipamentos);
          setApiOnline(true);
        } else {
          setApiOnline(false);
        }
      })
      .catch(() => setApiOnline(false));
  }, []);

  async function consultar() {
    setLoading(true);

    if (!apiOnline) {
      await new Promise(r => setTimeout(r, 300));
      // Dados demo disponíveis apenas para Agosto/2025
      const periodoValido = (mes === 8 && ano === 2025);
      const linhasFiltradas = periodoValido
        ? DEMO_LINHAS.filter(l => equipamento === "TODOS" || l.equipFaixa.startsWith(equipamento))
        : [];
      setResultado({
        ...DEMO_RESULTADO,
        tipo, mes, ano,
        totalLinhas: linhasFiltradas.length,
        linhas: linhasFiltradas,
        _isDemo: true,
      });
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams({ mes, ano, equipamento });
      const endpoint = tipo === "passagens" ? "/relatorio/passagens?" + params : "/relatorio/imagens?" + params;
      const r = await fetch(API + endpoint);
      const d = await r.json();
      if (!r.ok) throw new Error(d.erro || "Erro");
      setResultado({ ...d, _isDemo: false });
    } catch {
      const linhasFiltradas = DEMO_LINHAS.filter(l =>
        equipamento === "TODOS" || l.equipFaixa.startsWith(equipamento)
      );
      setResultado({ ...DEMO_RESULTADO, tipo, mes, ano, totalLinhas: linhasFiltradas.length, linhas: linhasFiltradas, _isDemo: true });
    }
    setLoading(false);
  }

  const diasVisiveis = useMemo(() => {
    if (!resultado) return [];
    const set = new Set();
    resultado.linhas.forEach(l => Object.keys(l.dias).forEach(d => {
      if (Number(l.dias[d]) > 0) set.add(Number(d));
    }));
    return Array.from(set).sort((a, b) => a - b);
  }, [resultado]);

  return (
    <div style={{ fontFamily: "sans-serif", fontSize: 13 }}>

      {apiOnline === false && (
        <div style={{ background:"#fefce8", border:"1px solid #fde047", borderRadius:8, padding:"8px 14px", marginBottom:12, fontSize:12, color:"#92400e", display:"flex", alignItems:"center", gap:8 }}>
          <span>⚠️</span>
          <span><strong>Modo demonstração</strong> — banco não configurado. Dados de exemplo disponíveis apenas para <strong>Agosto/2025</strong>. Outros períodos retornarão sem registros.</span>
        </div>
      )}
      {apiOnline === true && (
        <div style={{ background:"#f0fdf4", border:"1px solid #86efac", borderRadius:8, padding:"8px 14px", marginBottom:12, fontSize:12, color:"#166534", display:"flex", alignItems:"center", gap:8 }}>
          <span>✅</span>
          <span><strong>Conectado ao banco AxHub</strong> — dados em tempo real.</span>
        </div>
      )}

      <div style={{ display:"flex", flexWrap:"wrap", gap:12, alignItems:"flex-end", background:"#f1f5f9", padding:"14px 16px", borderRadius:10, marginBottom:16, border:"1px solid #e2e8f0" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          <label style={{ fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>Tipo</label>
          <div style={{ display:"flex", borderRadius:6, overflow:"hidden", border:"1px solid #cbd5e1" }}>
            {["passagens","imagens"].map(t => (
              <button key={t} onClick={() => setTipo(t)} style={{ padding:"6px 14px", border:"none", cursor:"pointer", fontWeight:600, fontSize:12, background: tipo===t ? "#1e40af" : "#fff", color: tipo===t ? "#fff" : "#475569" }}>
                {t === "passagens" ? "Passagens" : "Imagens"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          <label style={{ fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>Equipamento</label>
          <select value={equipamento} onChange={e => setEquipamento(e.target.value)} style={{ padding:"6px 10px", borderRadius:6, border:"1px solid #cbd5e1", minWidth:195, fontSize:13 }}>
            <option value="TODOS">TODOS</option>
            {equipamentos.map(eq => <option key={eq} value={eq}>{eq}</option>)}
          </select>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          <label style={{ fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>Mes</label>
          <select value={mes} onChange={e => setMes(Number(e.target.value))} style={{ padding:"6px 10px", borderRadius:6, border:"1px solid #cbd5e1", minWidth:130, fontSize:13 }}>
            {MESES.map(m => <option key={m.valor} value={m.valor}>{m.label}</option>)}
          </select>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          <label style={{ fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>Ano</label>
          <input type="number" value={ano} onChange={e => setAno(Number(e.target.value))} min={2020} max={hoje.getFullYear()+1} style={{ padding:"6px 10px", borderRadius:6, border:"1px solid #cbd5e1", width:84, fontSize:13 }} />
        </div>

        <button onClick={consultar} disabled={loading} style={{ padding:"7px 22px", borderRadius:6, border:"none", background: loading ? "#94a3b8" : "#1e40af", color:"#fff", cursor: loading ? "not-allowed" : "pointer", fontWeight:700, fontSize:13, alignSelf:"flex-end" }}>
          {loading ? "Consultando..." : "Consultar"}
        </button>

        {resultado && (
          <button onClick={() => exportarCSV(resultado.linhas, diasVisiveis, equipamento, mes, ano, tipo)} style={{ padding:"7px 14px", borderRadius:6, border:"none", background:"#0ea5e9", color:"#fff", cursor:"pointer", fontWeight:600, fontSize:13, alignSelf:"flex-end" }}>
            CSV
          </button>
        )}
      </div>

      {resultado && !loading && (
        <>
          <div style={{ color:"#475569", fontSize:13, marginBottom:10 }}>
            <strong>Equipamento: {equipamento}</strong> | <strong>Mes/Ano: {String(resultado.mes).padStart(2,"0")}/{resultado.ano}</strong> | {resultado.tipo} | {resultado.totalLinhas} linha(s) - {diasVisiveis.length} dia(s)
            {resultado._isDemo && <span style={{ marginLeft:10, background:"#fde047", color:"#78350f", padding:"2px 8px", borderRadius:10, fontSize:11, fontWeight:700 }}>DEMO</span>}
          </div>

          {resultado.totalLinhas === 0 ? (
            <div style={{ textAlign:"center", padding:"32px 0", color:"#94a3b8", border:"1px solid #e2e8f0", borderRadius:8 }}>
              {resultado._isDemo
                ? <span>Sem dados de demonstração para <strong>{String(resultado.mes).padStart(2,"0")}/{resultado.ano}</strong>.<br/>Selecione <strong>Agosto/2025</strong> para ver os dados de exemplo.</span>
                : <span>Nenhum registro encontrado para o período selecionado.</span>
              }
            </div>
          ) : (
            <div style={{ overflowX:"auto", borderRadius:8, border:"1px solid #e2e8f0", boxShadow:"0 1px 4px #0001" }}>
              <table style={{ borderCollapse:"collapse", width:"100%" }}>
                <thead>
                  <tr style={{ background:"#1e40af", color:"#fff" }}>
                    <th style={{ padding:"8px 14px", textAlign:"left", position:"sticky", left:0, background:"#1e40af", zIndex:2, whiteSpace:"nowrap", borderRight:"2px solid #3b82f6", minWidth:175, fontSize:12 }}>Equip./Faixa</th>
                    {diasVisiveis.map(d => (
                      <th key={d} style={{ padding:"8px 5px", textAlign:"center", minWidth:48, fontWeight:700, fontSize:12, borderLeft:"1px solid #3b82f6" }}>{d}</th>
                    ))}
                    <th style={{ padding:"8px 12px", textAlign:"center", position:"sticky", right:0, background:"#1e3a8a", zIndex:2, borderLeft:"2px solid #3b82f6", fontSize:12, minWidth:72 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.linhas.map((linha, i) => {
                    const vals = Object.values(linha.dias).map(Number).filter(v => v > 0);
                    const maxLinha = vals.length ? Math.max(...vals) : 0;
                    const total = diasVisiveis.reduce((s, d) => s + (Number(linha.dias[d]) || 0), 0);
                    return (
                      <tr key={linha.equipFaixa} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff" }}>
                        <td style={{ padding:"5px 14px", fontWeight:600, position:"sticky", left:0, background: i%2===0 ? "#f1f5f9" : "#f8fafc", zIndex:1, borderRight:"2px solid #e2e8f0", whiteSpace:"nowrap", fontSize:12, color:"#1e293b" }}>{linha.equipFaixa}</td>
                        {diasVisiveis.map(d => {
                          const val = Number(linha.dias[d]) || null;
                          return (
                            <td key={d} style={{ padding:"5px 4px", textAlign:"center", fontSize:12, borderLeft:"1px solid #e2e8f0", fontWeight: val ? 600 : 400, ...corCalor(val, maxLinha) }}>
                              {val ? val.toLocaleString("pt-BR") : <span style={{ color:"#cbd5e1" }}>-</span>}
                            </td>
                          );
                        })}
                        <td style={{ padding:"5px 12px", textAlign:"center", fontWeight:700, position:"sticky", right:0, background: i%2===0 ? "#e0f2fe" : "#f0f9ff", borderLeft:"2px solid #e2e8f0", fontSize:12, color:"#0369a1" }}>
                          {total.toLocaleString("pt-BR")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginTop:12, fontSize:11, color:"#475569" }}>
            <strong style={{ alignSelf:"center" }}>Intensidade:</strong>
            {[
              { cor:"#0ea5e9", txt:"Baixo (< 20%)" },
              { cor:"#22c55e", txt:"Moderado (20-40%)" },
              { cor:"#eab308", txt:"Medio-alto (40-65%)" },
              { cor:"#f97316", txt:"Alto (65-85%)" },
              { cor:"#ef4444", txt:"Maximo (> 85%)" },
            ].map(l => (
              <span key={l.cor} style={{ display:"flex", alignItems:"center", gap:4 }}>
                <span style={{ width:14, height:14, background:l.cor, borderRadius:3, display:"inline-block" }} />
                {l.txt}
              </span>
            ))}
          </div>
        </>
      )}

      {loading && (
        <div style={{ textAlign:"center", padding:"40px 0", color:"#64748b" }}>
          <p>Consultando...</p>
        </div>
      )}
    </div>
  );
}
