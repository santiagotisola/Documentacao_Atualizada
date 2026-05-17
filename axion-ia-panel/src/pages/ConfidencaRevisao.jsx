import { useState, useEffect } from "react";
import { apiFetch, getConfiguredUrl, getApiToken } from "../services/api";

export default function ConfidencaRevisao() {
  const [aba, setAba] = useState("fila");  // "fila" | "stats"
  const [produto, setProduto] = useState("axhub");
  const [status, setStatus] = useState("PENDENTE");
  const [prioridade, setPrioridade] = useState(""); // "" = todos
  const [fila, setFila] = useState([]);
  const [stats, setStats] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [selecionado, setSelecionado] = useState(null);
  const [msg, setMsg] = useState("");

  // Revisão de item
  const [resultado, setResultado] = useState(""); // "atendido" | "parcial" | "nao_atendido"
  const [observacoes, setObservacoes] = useState("");
  const [revisor_id, setRevisor_id] = useState("USER");

  useEffect(() => {
    carregarFila();
  }, [produto, status, prioridade]);

  async function carregarFila() {
    setCarregando(true);
    setMsg("");
    try {
      const params = new URLSearchParams({ produto, status });
      if (prioridade) params.append("prioridade", prioridade);

      const r = await apiFetch(`/confianca/fila?${params}`);
      const d = await r.json();
      setFila(d.items || []);
    } catch (err) {
      setMsg(`Erro ao carregar fila: ${err.message}`);
    }
    setCarregando(false);
  }

  async function carregarStats() {
    try {
      const params = new URLSearchParams();
      if (produto) params.append("produto", produto);

      const r = await apiFetch(`/confianca/estatisticas?${params}`);
      const d = await r.json();
      setStats(d);
    } catch (err) {
      setMsg(`Erro ao carregar estatísticas: ${err.message}`);
    }
  }

  function selecionarItem(item) {
    setSelecionado(item);
    setResultado("");
    setObservacoes("");
  }

  async function marcarRevisado() {
    if (!selecionado || !resultado) {
      setMsg("Selecione um resultado antes de revisar");
      return;
    }

    try {
      const r = await apiFetch(`/confianca/${selecionado._id}/revisar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resultado_revisao: resultado,
          observacoes,
          revisor_id,
          justificativa: observacoes,
        }),
      });

      const d = await r.json();
      if (!r.ok) throw new Error(d.erro);

      setMsg("✅ Item revisado com sucesso!");
      setSelecionado(null);
      setTimeout(() => carregarFila(), 1000);
    } catch (err) {
      setMsg(`❌ Erro ao revisar: ${err.message}`);
    }
  }

  async function descartar() {
    if (!selecionado) return;

    try {
      const r = await apiFetch(`/confianca/${selecionado._id}/descartar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivo: "Descartado pelo revisor" }),
      });

      const d = await r.json();
      if (!r.ok) throw new Error(d.erro);

      setMsg("✅ Item descartado");
      setSelecionado(null);
      setTimeout(() => carregarFila(), 1000);
    } catch (err) {
      setMsg(`❌ Erro: ${err.message}`);
    }
  }

  async function exportarCsv() {
    try {
      const params = new URLSearchParams();
      if (produto) params.append("produto", produto);
      const token = getApiToken();
      if (token) params.append("token", token);

      window.location.href = `${getConfiguredUrl()}/confianca/exportar/csv?${params}`;
    } catch (err) {
      setMsg(`Erro ao exportar: ${err.message}`);
    }
  }

  const NIVEIS_COR = {
    MUITO_BAIXA: { bg: "rgba(239,68,68,0.15)", texto: "#f87171" },
    BAIXA: { bg: "rgba(239,68,68,0.12)", texto: "#f87171" },
    MEDIA: { bg: "rgba(245,158,11,0.15)", texto: "#fbbf24" },
    ALTA: { bg: "rgba(34,197,94,0.15)", texto: "#4ade80" },
    MUITO_ALTA: { bg: "rgba(34,197,94,0.2)", texto: "#4ade80" },
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>🔍 Fila de Revisão — Itens com Baixa Confiança</h1>

      {/* Tabs */}
      <div style={{ marginBottom: "20px", borderBottom: "2px solid #ddd" }}>
        <button
          onClick={() => setAba("fila")}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            background: aba === "fila" ? "#007bff" : "#f0f0f0",
            color: aba === "fila" ? "white" : "black",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          📋 Fila de Revisão
        </button>
        <button
          onClick={() => {
            setAba("stats");
            carregarStats();
          }}
          style={{
            padding: "10px 20px",
            background: aba === "stats" ? "#007bff" : "#f0f0f0",
            color: aba === "stats" ? "white" : "black",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          📊 Estatísticas
        </button>
      </div>

      {msg && (
        <div
          style={{
            padding: "12px",
            marginBottom: "20px",
            background: msg.includes("✅") ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
            color: msg.includes("✅") ? "#4ade80" : "#f87171",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        >
          {msg}
        </div>
      )}

      {aba === "fila" && (
        <>
          {/* Filtros */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "10px",
              marginBottom: "20px",
              padding: "15px",
              background: "#f9f9f9",
              borderRadius: "4px",
            }}
          >
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Produto
              </label>
              <select
                value={produto}
                onChange={e => setProduto(e.target.value)}
                style={{ width: "100%", padding: "8px" }}
              >
                <option value="axhub">AxHub</option>
                <option value="axton">AxTon</option>
                <option value="axcross">AxCross</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                style={{ width: "100%", padding: "8px" }}
              >
                <option value="PENDENTE">Pendente</option>
                <option value="REVISADO">Revisado</option>
                <option value="DESCARTADO">Descartado</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Prioridade
              </label>
              <select
                value={prioridade}
                onChange={e => setPrioridade(e.target.value)}
                style={{ width: "100%", padding: "8px" }}
              >
                <option value="">Todos</option>
                <option value="ALTA">ALTA</option>
                <option value="MEDIA">MÉDIA</option>
                <option value="NORMAL">NORMAL</option>
                <option value="BAIXA">BAIXA</option>
              </select>
            </div>
          </div>

          {/* Botões de ação */}
          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={() => carregarFila()}
              style={{
                padding: "8px 16px",
                marginRight: "10px",
                background: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              🔄 Atualizar
            </button>
            <button
              onClick={exportarCsv}
              style={{
                padding: "8px 16px",
                background: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              📥 Exportar CSV
            </button>
          </div>

          {carregando && <p>Carregando...</p>}

          {/* Lista de itens */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>
            {/* Coluna esquerda: lista */}
            <div style={{ maxHeight: "600px", overflowY: "auto", border: "1px solid #ddd" }}>
              {fila.length === 0 ? (
                <p style={{ padding: "20px", color: "#999" }}>Nenhum item na fila</p>
              ) : (
                fila.map(item => {
                  const cor = NIVEIS_COR[item.nivelConfianca] || NIVEIS_COR.MEDIA;
                  return (
                    <div
                      key={item._id}
                      onClick={() => selecionarItem(item)}
                      style={{
                        padding: "12px",
                        borderBottom: "1px solid #eee",
                        cursor: "pointer",
                        background:
                          selecionado?._id === item._id ? "#e7f3ff" : "white",
                        borderLeft:
                          selecionado?._id === item._id
                            ? "4px solid #007bff"
                            : "4px solid transparent",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "5px",
                        }}
                      >
                        <strong>{item.produto.toUpperCase()}</strong>
                        <span
                          style={{
                            ...cor,
                            padding: "2px 8px",
                            borderRadius: "3px",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          {item.nivelConfianca}
                        </span>
                      </div>
                      <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "#666" }}>
                        {item.requisito.substring(0, 60)}...
                      </p>
                      <p style={{ margin: "0", fontSize: "11px", color: "#999" }}>
                        Confiança: {(item.confianca * 100).toFixed(0)}%
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Coluna direita: detalhe e revisão */}
            {selecionado && (
              <div
                style={{
                  padding: "20px",
                  background: "#f9f9f9",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  maxHeight: "600px",
                  overflowY: "auto",
                }}
              >
                <h3>Revisar Item</h3>

                <div style={{ marginBottom: "15px" }}>
                  <strong>Requisito:</strong>
                  <p style={{ marginTop: "5px", fontStyle: "italic" }}>
                    {selecionado.requisito}
                  </p>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <strong>Confiança Automática:</strong>
                  <p>
                    {(selecionado.confianca * 100).toFixed(0)}%{" "}
                    <span
                      style={{
                        ...NIVEIS_COR[selecionado.nivelConfianca],
                        padding: "2px 6px",
                        borderRadius: "3px",
                        fontSize: "12px",
                      }}
                    >
                      {selecionado.nivelConfianca}
                    </span>
                  </p>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <strong>Motivos da Baixa Confiança:</strong>
                  <ul style={{ margin: "5px 0 0 20px" }}>
                    {selecionado.motivos?.map((m, i) => (
                      <li key={i} style={{ fontSize: "12px", marginBottom: "3px" }}>
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <strong>Evidências Encontradas:</strong>
                  <ul style={{ margin: "5px 0 0 20px" }}>
                    {selecionado.evidencias?.map((e, i) => (
                      <li key={i} style={{ fontSize: "12px", marginBottom: "3px" }}>
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                    Resultado da Revisão
                  </label>
                  <select
                    value={resultado}
                    onChange={e => setResultado(e.target.value)}
                    style={{ width: "100%", padding: "8px" }}
                  >
                    <option value="">Selecione...</option>
                    <option value="atendido">✅ Atendido</option>
                    <option value="parcial">⚠️ Parcialmente Atendido</option>
                    <option value="nao_atendido">❌ Não Atendido</option>
                  </select>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                    Observações
                  </label>
                  <textarea
                    value={observacoes}
                    onChange={e => setObservacoes(e.target.value)}
                    placeholder="Adicione notas sobre sua revisão"
                    style={{
                      width: "100%",
                      height: "80px",
                      padding: "8px",
                      fontFamily: "Arial",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={marcarRevisado}
                    disabled={!resultado}
                    style={{
                      flex: 1,
                      padding: "10px",
                      background: resultado ? "#28a745" : "#ccc",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: resultado ? "pointer" : "default",
                      fontWeight: "bold",
                    }}
                  >
                    ✅ Confirmar Revisão
                  </button>
                  <button
                    onClick={descartar}
                    style={{
                      flex: 1,
                      padding: "10px",
                      background: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    🗑️ Descartar
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {aba === "stats" && stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "20px",
          }}
        >
          <div style={{ padding: "20px", background: "#f0f0f0", borderRadius: "4px" }}>
            <h3>Total de Itens</h3>
            <p style={{ fontSize: "32px", fontWeight: "bold", margin: "10px 0" }}>
              {stats.total}
            </p>
          </div>

          <div style={{ padding: "20px", background: "rgba(34,197,94,0.15)", borderRadius: "4px" }}>
            <h3>Revisados</h3>
            <p style={{ fontSize: "32px", fontWeight: "bold", margin: "10px 0" }}>
              {stats.revisados}
            </p>
            <p style={{ fontSize: "14px", color: "#94a3b8" }}>
              {stats.taxa_conclusao}% completo
            </p>
          </div>

          <div style={{ padding: "20px", background: "rgba(245,158,11,0.15)", borderRadius: "4px" }}>
            <h3>Pendentes</h3>
            <p style={{ fontSize: "32px", fontWeight: "bold", margin: "10px 0" }}>
              {stats.pendentes}
            </p>
          </div>

          <div style={{ padding: "20px", background: "#cfe2ff", borderRadius: "4px" }}>
            <h3>Por Nível de Confiança</h3>
            <ul style={{ margin: "10px 0" }}>
              {stats.por_nivel?.map((item, i) => (
                <li key={i} style={{ fontSize: "14px", marginBottom: "5px" }}>
                  {item._id}: {item.count} itens
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
