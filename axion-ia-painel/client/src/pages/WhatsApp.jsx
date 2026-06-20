import { useEffect, useState, useRef } from "react";
import { api } from "../services/api";

export default function WhatsApp() {
  const [status, setStatus]         = useState(null);
  const [sessoes, setSessoes]       = useState([]);
  const [sessSel, setSessSel]       = useState(null);
  const [loadingInicio, setLoadingInicio] = useState(false);
  const [envio, setEnvio]           = useState({ telefone: "", mensagem: "" });
  const [enviando, setEnviando]     = useState(false);
  const [feedbackEnvio, setFeedbackEnvio] = useState(null);
  const [view, setView]             = useState("dashboard"); // dashboard | sessoes | enviar
  const [erro, setErro]             = useState(null);
  const poolingRef = useRef(null);

  useEffect(() => {
    carregarStatus();
    carregarSessoes();
    poolingRef.current = setInterval(() => {
      carregarStatus();
      if (view === "sessoes") carregarSessoes();
    }, 5000);
    return () => clearInterval(poolingRef.current);
  }, [view]);

  async function carregarStatus() {
    try {
      const r = await api.get("/whatsapp/status");
      setStatus(r.data);
      setErro(null);
    } catch {
      setErro("API indisponível");
    }
  }

  async function carregarSessoes() {
    try {
      const r = await api.get("/whatsapp/sessoes");
      setSessoes(r.data.sessoes || []);
    } catch { /* silencioso */ }
  }

  async function iniciarConexao() {
    setLoadingInicio(true);
    try {
      await api.post("/whatsapp/iniciar");
      setTimeout(carregarStatus, 2000);
    } catch (err) {
      setErro(err.response?.data?.erro || "Erro ao iniciar");
    } finally {
      setLoadingInicio(false);
    }
  }

  async function encerrarSessao(telefone) {
    if (!window.confirm(`Encerrar sessão de ${telefone}?`)) return;
    try {
      await api.delete(`/whatsapp/sessao/${telefone}`);
      carregarSessoes();
    } catch { /* silencioso */ }
  }

  async function enviarMensagem(e) {
    e.preventDefault();
    setEnviando(true);
    setFeedbackEnvio(null);
    try {
      await api.post("/whatsapp/send", envio);
      setFeedbackEnvio({ tipo: "success", msg: "Mensagem enviada com sucesso!" });
      setEnvio(p => ({ ...p, mensagem: "" }));
    } catch (err) {
      setFeedbackEnvio({ tipo: "error", msg: err.response?.data?.erro || "Erro ao enviar" });
    } finally {
      setEnviando(false);
    }
  }

  const statusCor = {
    conectado:     { bg: "rgba(34,197,94,0.12)",  cor: "#22c55e",  label: "Conectado" },
    qr_pendente:   { bg: "rgba(245,158,11,0.12)", cor: "#f59e0b",  label: "QR Pendente" },
    conectando:    { bg: "rgba(99,102,241,0.12)", cor: "var(--accent)", label: "Conectando..." },
    desconectado:  { bg: "rgba(239,68,68,0.12)",  cor: "#ef4444",  label: "Desconectado" },
  };
  const sc = statusCor[status?.status] || statusCor.desconectado;

  const estadoLabel = {
    inicio: "Início",
    menu: "Menu",
    aguardando_assunto: "Aguard. Assunto",
    aguardando_sistema: "Aguard. Sistema",
    aguardando_descricao: "Aguard. Descrição",
    aguardando_categoria: "Aguard. Categoria",
    aguardando_foto: "Aguard. Foto",
    confirmando_ticket: "Confirm. Ticket",
    ticket_criado: "Ticket Criado",
    consultando_numero: "Consultando",
    respondendo_numero: "Respond. Nº",
    respondendo_mensagem: "Respondendo",
    aguardando_modulo_duvida: "Seleção Módulo",
    aguardando_duvida: "Aguard. Dúvida",
    respondendo_duvida: "IA Respondendo",
    encerrado: "Encerrado",
  };

  function formatarNumero(num) {
    if (!num) return "";
    const limpo = num.replace(/@.*$/, "");
    if (limpo.length >= 12) {
      return `+${limpo.slice(0,2)} ${limpo.slice(2,4)} ${limpo.slice(4)}`;
    }
    return limpo;
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">WhatsApp</h2>
        <span className="page-subtitle">Integração Jitbit Helpdesk via WhatsApp</span>
      </div>

      {/* Barra de navegação */}
      <div className="filters-row" style={{ marginBottom: "1.25rem", gap: "0.5rem" }}>
        {["dashboard", "sessoes", "enviar"].map(v => (
          <button key={v} className="btn"
            onClick={() => setView(v)}
            style={{
              background: view === v ? "rgba(99,102,241,0.12)" : "var(--surface)",
              color: view === v ? "var(--accent)" : "var(--text-muted)",
              border: `1px solid ${view === v ? "var(--accent)" : "var(--border)"}`,
              fontWeight: view === v ? 700 : 400,
            }}>
            {{ dashboard: "Dashboard", sessoes: `Sessões (${sessoes.length})`, enviar: "Enviar Mensagem" }[v]}
          </button>
        ))}
        <button className="btn" style={{ marginLeft: "auto", background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
          onClick={() => { carregarStatus(); carregarSessoes(); }}>
          Atualizar
        </button>
      </div>

      {erro && (
        <div className="alert alert-error" style={{ marginBottom: "1rem" }}>{erro}</div>
      )}

      {/* ===== DASHBOARD ===== */}
      {view === "dashboard" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>

          {/* Card Status */}
          <div className="card" style={{ borderTop: `2px solid ${sc.cor}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Status da Conexão</div>
                <span style={{ padding: "4px 14px", borderRadius: 12, fontSize: "0.88rem", fontWeight: 700, background: sc.bg, color: sc.cor }}>
                  {sc.label}
                </span>
              </div>
              <div style={{ fontSize: "2.5rem" }}>
                {status?.status === "conectado" ? "✅" : status?.status === "qr_pendente" ? "📱" : "❌"}
              </div>
            </div>

            {status?.numero && (
              <div style={{ marginBottom: "0.75rem" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 2 }}>Número conectado</div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{formatarNumero(status.numero)}</div>
              </div>
            )}

            {status?.status === "qr_pendente" && (
              <div style={{ marginBottom: "0.75rem" }}>
                {status?.qr_base64 ? (
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "0.82rem", color: "#f59e0b", marginBottom: "0.75rem" }}>
                      📱 Escaneie com o WhatsApp do número de atendimento:
                    </p>
                    <img src={status.qr_base64} alt="QR Code WhatsApp"
                      style={{ width: 220, height: 220, borderRadius: 8, border: "3px solid #f59e0b", background: "#fff", padding: 4 }} />
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                      O QR expira em ~20 segundos — a tela atualiza automaticamente
                    </p>
                  </div>
                ) : (
                  <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)", fontSize: "0.82rem", color: "#f59e0b" }}>
                    ⏳ Gerando QR code... aguarde.
                  </div>
                )}
              </div>
            )}

            {(status?.status === "desconectado" || !status) && (
              <button className="btn btn-primary" onClick={iniciarConexao} disabled={loadingInicio}
                style={{ width: "100%", marginTop: "0.5rem" }}>
                {loadingInicio ? "Iniciando..." : "Conectar WhatsApp"}
              </button>
            )}

            {status?.status === "conectado" && (
              <div>
                <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.25)", fontSize: "0.82rem", color: "#16a34a", marginBottom: "0.5rem" }}>
                  ✅ Pronto para receber mensagens e abrir chamados
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button className="btn" style={{ flex: 1, fontSize: "0.78rem", background: "rgba(99,102,241,0.08)", color: "var(--accent)", border: "1px solid rgba(99,102,241,0.25)" }}
                    onClick={() => { setView("enviar"); }}>
                    ✉️ Enviar Mensagem
                  </button>
                  <button className="btn" style={{ flex: 1, fontSize: "0.78rem", background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}
                    onClick={() => { if (window.confirm("Desconectar WhatsApp? Será necessário escanear QR novamente.")) { api.post("/whatsapp/desconectar").catch(() => {}); setTimeout(carregarStatus, 2000); } }}>
                    ⏏️ Desconectar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Card Estatísticas */}
          <div className="card">
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.75rem" }}>Sessões Ativas</div>
            <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--accent)", marginBottom: "0.25rem" }}>{sessoes.length}</div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>conversas em andamento</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {[
                { label: "Menu", val: sessoes.filter(s => s.estado === "menu" || s.estado === "inicio").length, cor: "var(--accent)" },
                { label: "Abrindo Chamado", val: sessoes.filter(s => ["aguardando_assunto","aguardando_sistema","aguardando_descricao","aguardando_categoria","aguardando_foto","confirmando_ticket","ticket_criado"].includes(s.estado)).length, cor: "#f59e0b" },
                { label: "Consultando", val: sessoes.filter(s => ["consultando_numero","aguardando_modulo_duvida","aguardando_duvida","respondendo_duvida"].includes(s.estado)).length, cor: "#8b5cf6" },
                { label: "Respondendo", val: sessoes.filter(s => ["respondendo_numero","respondendo_mensagem"].includes(s.estado)).length, cor: "#22c55e" },
              ].map(s => (
                <div key={s.label} style={{ padding: "10px 12px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "1.4rem", fontWeight: 700, color: s.cor }}>{s.val}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Card Como usar */}
          <div className="card" style={{ gridColumn: "1 / -1" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.75rem" }}>Como Funciona</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
              {[
                { icon: "1️⃣", titulo: "Conectar", desc: "Clique em Conectar WhatsApp e escaneie o QR code no terminal com o número de atendimento." },
                { icon: "💬", titulo: "Cliente envia mensagem", desc: "O cliente envia qualquer mensagem para o número. O bot responde automaticamente com o menu." },
                { icon: "🎫", titulo: "Abertura de chamado", desc: "Cliente escolhe opção 1, informa assunto e descrição. A IA tria e cria o ticket no Jitbit." },
                { icon: "🔍", titulo: "Consulta e resposta", desc: "Cliente pode consultar status do chamado ou enviar resposta diretamente pelo WhatsApp." },
              ].map(p => (
                <div key={p.titulo} style={{ padding: "12px 14px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>{p.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.3rem" }}>{p.titulo}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== SESSÕES ===== */}
      {view === "sessoes" && (
        <div style={{ display: "grid", gridTemplateColumns: sessSel ? "340px 1fr" : "1fr", gap: "1rem" }}>
          <div>
            {sessoes.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "2.5rem" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>💬</div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Nenhuma sessão ativa ainda.<br />Quando um cliente enviar mensagem, aparecerá aqui.</p>
              </div>
            ) : (
              sessoes.map(s => (
                <div key={s.telefone} className="card"
                  onClick={() => setSessSel(sessSel?.telefone === s.telefone ? null : s)}
                  style={{
                    marginBottom: "0.75rem", cursor: "pointer",
                    borderLeft: `3px solid ${s.estado === "encerrado" ? "#6b7280" : "var(--accent)"}`,
                    outline: sessSel?.telefone === s.telefone ? "2px solid var(--accent)" : "none",
                    opacity: s.estado === "encerrado" ? 0.6 : 1,
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: 2 }}>{s.nome || s.telefone}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>{s.telefone}</div>
                      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 5, background: "rgba(99,102,241,0.1)", color: "var(--accent)" }}>
                          {estadoLabel[s.estado] || s.estado}
                        </span>
                        {s.ultimoTicketId && (
                          <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 5, background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
                            #{s.ultimoTicketId}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", whiteSpace: "nowrap", marginLeft: "0.5rem" }}>
                      {s.ultimaMensagem ? new Date(s.ultimaMensagem).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "-"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {sessSel && (
            <div className="card" style={{ alignSelf: "start", borderLeft: "3px solid var(--accent)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1rem" }}>{sessSel.nome || sessSel.telefone}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{sessSel.telefone}</div>
                </div>
                <button onClick={() => setSessSel(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1.3rem" }}>×</button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1rem" }}>
                {[
                  { label: "Estado", val: estadoLabel[sessSel.estado] || sessSel.estado },
                  { label: "Último ticket", val: sessSel.ultimoTicketId ? `#${sessSel.ultimoTicketId}` : "-" },
                  { label: "Criado em", val: sessSel.createdAt ? new Date(sessSel.createdAt).toLocaleDateString("pt-BR") : "-" },
                  { label: "Última msg", val: sessSel.ultimaMensagem ? new Date(sessSel.ultimaMensagem).toLocaleString("pt-BR") : "-" },
                ].map(i => (
                  <div key={i.label} style={{ padding: "8px 10px", borderRadius: 7, background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginBottom: 2 }}>{i.label}</div>
                    <div style={{ fontWeight: 600, fontSize: "0.82rem" }}>{i.val}</div>
                  </div>
                ))}
              </div>

              {sessSel.dadosParciais?.assunto && (
                <div style={{ marginBottom: "0.75rem", padding: "10px 12px", borderRadius: 8, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: 3 }}>Em andamento</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>{sessSel.dadosParciais.assunto}</div>
                  {sessSel.dadosParciais.descricao && (
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 4 }}>{sessSel.dadosParciais.descricao.substring(0, 120)}...</div>
                  )}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                <button className="btn btn-primary" style={{ fontSize: "0.82rem" }}
                  onClick={() => { setView("enviar"); setEnvio(p => ({ ...p, telefone: sessSel.telefone })); }}>
                  Enviar mensagem
                </button>
                <button className="btn" style={{ fontSize: "0.82rem", background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}
                  onClick={() => encerrarSessao(sessSel.telefone)}>
                  Encerrar sessão
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== ENVIAR MENSAGEM ===== */}
      {view === "enviar" && (
        <div style={{ maxWidth: 520 }}>
          <div className="card">
            <h3 style={{ fontSize: "1rem", marginBottom: "1.25rem" }}>Enviar Mensagem Manual</h3>

            {feedbackEnvio && (
              <div className={`alert ${feedbackEnvio.tipo === "success" ? "alert-success" : "alert-error"}`} style={{ marginBottom: "1rem" }}>
                {feedbackEnvio.msg}
              </div>
            )}

            <form onSubmit={enviarMensagem}>
              <div className="form-group">
                <label>Telefone (com DDD e código do país)</label>
                <input
                  value={envio.telefone}
                  onChange={e => setEnvio(p => ({ ...p, telefone: e.target.value }))}
                  placeholder="5511999999999"
                  required
                />
                <small style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Formato: 55 + DDD + número (ex: 5511999999999)</small>
              </div>

              <div className="form-group">
                <label>Mensagem</label>
                <textarea
                  value={envio.mensagem}
                  onChange={e => setEnvio(p => ({ ...p, mensagem: e.target.value }))}
                  placeholder="Digite a mensagem..."
                  rows={5}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button type="submit" className="btn btn-primary" disabled={enviando || status?.status !== "conectado"}>
                  {enviando ? "Enviando..." : "Enviar"}
                </button>
                {status?.status !== "conectado" && (
                  <span style={{ fontSize: "0.78rem", color: "#ef4444", alignSelf: "center" }}>WhatsApp não conectado</span>
                )}
              </div>
            </form>
          </div>

          <div className="card" style={{ marginTop: "1rem" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase" }}>Comandos do Bot</div>
            {[
              { cmd: "menu / oi / olá", desc: "Exibe o menu principal" },
              { cmd: "1", desc: "Abrir novo chamado" },
              { cmd: "2", desc: "Consultar chamado por número" },
              { cmd: "3", desc: "Responder chamado existente" },
              { cmd: "4", desc: "Dúvidas do sistema (FAQ com IA)" },
              { cmd: "0", desc: "Solicitar atendente humano" },
            ].map(c => (
              <div key={c.cmd} style={{ display: "flex", gap: "0.75rem", padding: "6px 0", borderBottom: "1px solid var(--border)", fontSize: "0.82rem" }}>
                <code style={{ minWidth: 120, color: "var(--accent)", background: "rgba(99,102,241,0.08)", padding: "2px 6px", borderRadius: 4 }}>{c.cmd}</code>
                <span style={{ color: "var(--text-muted)" }}>{c.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
