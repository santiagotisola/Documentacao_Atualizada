import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Target, Plus, Play, CheckCircle, XCircle, Pause,
  Clock, BarChart2, Camera, FileText, Filter, RefreshCw,
  ChevronDown, ChevronRight, AlertCircle, User, Globe,
  Shield, Wrench, BookOpen, Search, Activity, Cpu, Eye
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3100/api";

const TIPOS = [
  { id: "Audit",          label: "Auditoria",        icon: Shield,   cor: "#6366f1" },
  { id: "Deployment",     label: "Deploy",           icon: Cpu,      cor: "#3b82f6" },
  { id: "Migration",      label: "Migração",         icon: Activity, cor: "#f59e0b" },
  { id: "Training",       label: "Treinamento",      icon: BookOpen, cor: "#10b981" },
  { id: "Support",        label: "Suporte",          icon: Wrench,   cor: "#ec4899" },
  { id: "Validation",     label: "Validação",        icon: CheckCircle, cor: "#14b8a6" },
  { id: "Comparison",     label: "Comparação",       icon: Eye,      cor: "#8b5cf6" },
  { id: "Monitoring",     label: "Monitoramento",    icon: BarChart2,cor: "#0ea5e9" },
  { id: "Homologation",   label: "Homologação",      icon: FileText, cor: "#f97316" },
  { id: "Investigation",  label: "Investigação",     icon: Search,   cor: "#ef4444" },
];

const STATUS_BADGE = {
  planejada:    { cor: "#64748b", label: "Planejada" },
  em_execucao:  { cor: "#f59e0b", label: "Em Execução" },
  concluida:    { cor: "#10b981", label: "Concluída" },
  cancelada:    { cor: "#ef4444", label: "Cancelada" },
  pausada:      { cor: "#6366f1", label: "Pausada" },
};

export default function MissionCenter() {
  const [missions, setMissions] = useState([]);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [criando, setCriando]   = useState(false);
  const [filtro, setFiltro]     = useState({ tipo: "", status: "", clienteSlug: "" });
  const [expandida, setExpandida] = useState(null);

  const [form, setForm] = useState({
    titulo: "", tipo: "Audit", clienteSlug: "", produto: "axhub",
    descricao: "", responsavel: "", agente: "manual",
  });

  // ─── Carregar dados ───────────────────────────────────────────────────────

  async function carregar() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtro.tipo)        params.set("tipo", filtro.tipo);
      if (filtro.status)      params.set("status", filtro.status);
      if (filtro.clienteSlug) params.set("clienteSlug", filtro.clienteSlug);

      const [r1, r2] = await Promise.all([
        axios.get(`${API}/missions?${params}`),
        axios.get(`${API}/missions/stats`),
      ]);
      setMissions(r1.data.missions || []);
      setStats(r2.data);
    } catch (err) {
      console.error("Erro ao carregar missões:", err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, [filtro]);

  // ─── Ações ────────────────────────────────────────────────────────────────

  async function criarMission() {
    if (!form.titulo || !form.tipo || !form.clienteSlug) return;
    try {
      await axios.post(`${API}/missions`, form);
      setForm({ titulo: "", tipo: "Audit", clienteSlug: "", produto: "axhub", descricao: "", responsavel: "", agente: "manual" });
      setCriando(false);
      carregar();
    } catch (err) { console.error(err); }
  }

  async function iniciar(id) {
    try { await axios.post(`${API}/missions/${id}/iniciar`); carregar(); } catch {}
  }
  async function concluir(id) {
    const obs = prompt("Observações do resultado:");
    try { await axios.post(`${API}/missions/${id}/concluir`, { sucesso: true, observacoes: obs || "" }); carregar(); } catch {}
  }
  async function cancelar(id) {
    if (!confirm("Cancelar esta missão?")) return;
    try { await axios.post(`${API}/missions/${id}/cancelar`); carregar(); } catch {}
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  const tipoInfo = (tipo) => TIPOS.find(t => t.id === tipo) || TIPOS[0];

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>

      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <Target size={28} color="#60cdff" strokeWidth={1.5} />
        <div>
          <h2 style={{ margin: 0, color: "#f3f3f3", fontWeight: 600 }}>Mission Center</h2>
          <p style={{ margin: 0, color: "#8b8b8b", fontSize: "13px" }}>Operações formais do ecossistema Axion</p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
          <button onClick={carregar} style={{ background: "#3d3d3d", border: "none", color: "#f3f3f3", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
            <RefreshCw size={14} /> Atualizar
          </button>
          <button onClick={() => setCriando(!criando)} style={{ background: "#60cdff", border: "none", color: "#111", borderRadius: "6px", padding: "6px 14px", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
            <Plus size={14} /> Nova Missão
          </button>
        </div>
      </div>

      {/* ─── KPIs ────────────────────────────────────────────────────────── */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "24px" }}>
          {[
            { label: "Total",     valor: stats.total,        cor: "#60cdff" },
            { label: "Semana",    valor: stats.ultimaSemana, cor: "#a78bfa" },
            { label: "Concluídas",valor: stats.concluidas,   cor: "#34d399" },
            { label: "Taxa Sucesso", valor: stats.taxaSucesso != null ? stats.taxaSucesso + "%" : "—", cor: "#fbbf24" },
          ].map(k => (
            <div key={k.label} style={{ background: "#2d2d2d", borderRadius: "10px", padding: "14px 16px", border: "1px solid #3d3d3d" }}>
              <div style={{ fontSize: "22px", fontWeight: 700, color: k.cor }}>{k.valor}</div>
              <div style={{ fontSize: "11px", color: "#8b8b8b", marginTop: "2px" }}>{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Formulário de criação ────────────────────────────────────────── */}
      {criando && (
        <div style={{ background: "#2d2d2d", borderRadius: "10px", padding: "20px", marginBottom: "20px", border: "1px solid #3d3d3d" }}>
          <h3 style={{ margin: "0 0 16px", color: "#f3f3f3", fontSize: "15px" }}>Nova Missão</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <input placeholder="Título *" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })}
              style={{ background: "#1a1a1a", border: "1px solid #3d3d3d", color: "#f3f3f3", borderRadius: "6px", padding: "8px 10px", fontSize: "13px" }} />
            <input placeholder="Cliente slug * (ex: ibametro)" value={form.clienteSlug} onChange={e => setForm({ ...form, clienteSlug: e.target.value })}
              style={{ background: "#1a1a1a", border: "1px solid #3d3d3d", color: "#f3f3f3", borderRadius: "6px", padding: "8px 10px", fontSize: "13px" }} />
            <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}
              style={{ background: "#1a1a1a", border: "1px solid #3d3d3d", color: "#f3f3f3", borderRadius: "6px", padding: "8px 10px", fontSize: "13px" }}>
              {TIPOS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <select value={form.produto} onChange={e => setForm({ ...form, produto: e.target.value })}
              style={{ background: "#1a1a1a", border: "1px solid #3d3d3d", color: "#f3f3f3", borderRadius: "6px", padding: "8px 10px", fontSize: "13px" }}>
              <option value="axhub">AxHub</option>
              <option value="axton">AxTon</option>
              <option value="axcross">AxCross</option>
              <option value="multi">Multi</option>
            </select>
            <select value={form.agente} onChange={e => setForm({ ...form, agente: e.target.value })}
              style={{ background: "#1a1a1a", border: "1px solid #3d3d3d", color: "#f3f3f3", borderRadius: "6px", padding: "8px 10px", fontSize: "13px" }}>
              <option value="manual">Manual</option>
              <option value="varco">VARCO</option>
              <option value="orchestrator">Orchestrator</option>
              <option value="cuti">CUTI</option>
            </select>
            <input placeholder="Responsável" value={form.responsavel} onChange={e => setForm({ ...form, responsavel: e.target.value })}
              style={{ background: "#1a1a1a", border: "1px solid #3d3d3d", color: "#f3f3f3", borderRadius: "6px", padding: "8px 10px", fontSize: "13px" }} />
          </div>
          <textarea placeholder="Descrição (opcional)" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })}
            rows={2} style={{ width: "100%", background: "#1a1a1a", border: "1px solid #3d3d3d", color: "#f3f3f3", borderRadius: "6px", padding: "8px 10px", fontSize: "13px", resize: "vertical", boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <button onClick={criarMission} style={{ background: "#60cdff", border: "none", color: "#111", borderRadius: "6px", padding: "8px 20px", cursor: "pointer", fontWeight: 600 }}>Criar</button>
            <button onClick={() => setCriando(false)} style={{ background: "#3d3d3d", border: "none", color: "#f3f3f3", borderRadius: "6px", padding: "8px 16px", cursor: "pointer" }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* ─── Filtros ─────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
        <select value={filtro.tipo} onChange={e => setFiltro({ ...filtro, tipo: e.target.value })}
          style={{ background: "#2d2d2d", border: "1px solid #3d3d3d", color: "#f3f3f3", borderRadius: "6px", padding: "6px 10px", fontSize: "12px" }}>
          <option value="">Todos os tipos</option>
          {TIPOS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <select value={filtro.status} onChange={e => setFiltro({ ...filtro, status: e.target.value })}
          style={{ background: "#2d2d2d", border: "1px solid #3d3d3d", color: "#f3f3f3", borderRadius: "6px", padding: "6px 10px", fontSize: "12px" }}>
          <option value="">Todos os status</option>
          {Object.entries(STATUS_BADGE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <input placeholder="Filtrar por cliente..." value={filtro.clienteSlug} onChange={e => setFiltro({ ...filtro, clienteSlug: e.target.value })}
          style={{ background: "#2d2d2d", border: "1px solid #3d3d3d", color: "#f3f3f3", borderRadius: "6px", padding: "6px 10px", fontSize: "12px", minWidth: "180px" }} />
      </div>

      {/* ─── Lista de missões ─────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#8b8b8b" }}>Carregando missões...</div>
      ) : missions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#8b8b8b" }}>
          <Target size={40} color="#3d3d3d" style={{ marginBottom: "12px" }} />
          <div>Nenhuma missão encontrada</div>
          <button onClick={() => setCriando(true)} style={{ marginTop: "12px", background: "#60cdff", border: "none", color: "#111", borderRadius: "6px", padding: "8px 18px", cursor: "pointer", fontWeight: 600 }}>
            Criar primeira missão
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {missions.map(m => {
            const ti = tipoInfo(m.tipo);
            const st = STATUS_BADGE[m.status] || STATUS_BADGE.planejada;
            const Icon = ti.icon;
            const exp = expandida === m._id;

            return (
              <div key={m._id} style={{ background: "#2d2d2d", borderRadius: "10px", border: "1px solid #3d3d3d", overflow: "hidden" }}>
                <div
                  onClick={() => setExpandida(exp ? null : m._id)}
                  style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
                >
                  <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: ti.cor + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={18} color={ti.cor} strokeWidth={1.5} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                      <span style={{ fontWeight: 600, color: "#f3f3f3", fontSize: "14px" }}>{m.titulo}</span>
                      <span style={{ fontSize: "11px", background: ti.cor + "22", color: ti.cor, borderRadius: "4px", padding: "1px 6px" }}>{ti.label}</span>
                      <span style={{ fontSize: "11px", background: st.cor + "22", color: st.cor, borderRadius: "4px", padding: "1px 6px" }}>{st.label}</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#8b8b8b", display: "flex", gap: "12px" }}>
                      <span><Globe size={11} style={{ marginRight: "3px" }} />{m.clienteNome || m.clienteSlug}</span>
                      <span>{m.produto?.toUpperCase()}</span>
                      {m.agente !== "manual" && <span>🤖 {m.agente}</span>}
                      {m.evidencias?.length > 0 && <span><Camera size={11} style={{ marginRight: "3px" }} />{m.evidencias.length} evidências</span>}
                      {m.duracao_min && <span><Clock size={11} style={{ marginRight: "3px" }} />{m.duracao_min}min</span>}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {m.status === "planejada" && (
                      <button onClick={e => { e.stopPropagation(); iniciar(m._id); }}
                        style={{ background: "#f59e0b22", border: "1px solid #f59e0b44", color: "#f59e0b", borderRadius: "6px", padding: "4px 10px", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Play size={11} /> Iniciar
                      </button>
                    )}
                    {m.status === "em_execucao" && (
                      <button onClick={e => { e.stopPropagation(); concluir(m._id); }}
                        style={{ background: "#10b98122", border: "1px solid #10b98144", color: "#10b981", borderRadius: "6px", padding: "4px 10px", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <CheckCircle size={11} /> Concluir
                      </button>
                    )}
                    {["planejada", "em_execucao"].includes(m.status) && (
                      <button onClick={e => { e.stopPropagation(); cancelar(m._id); }}
                        style={{ background: "#ef444422", border: "1px solid #ef444444", color: "#ef4444", borderRadius: "6px", padding: "4px 10px", cursor: "pointer", fontSize: "11px" }}>
                        <XCircle size={11} />
                      </button>
                    )}
                    {exp ? <ChevronDown size={14} color="#8b8b8b" /> : <ChevronRight size={14} color="#8b8b8b" />}
                  </div>
                </div>

                {exp && (
                  <div style={{ padding: "0 16px 16px", borderTop: "1px solid #3d3d3d" }}>
                    {m.descricao && <p style={{ color: "#8b8b8b", fontSize: "13px", margin: "12px 0 8px" }}>{m.descricao}</p>}
                    {m.resultado && (
                      <div style={{ background: "#1a1a1a", borderRadius: "6px", padding: "10px 14px", marginTop: "8px" }}>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#f3f3f3", marginBottom: "6px" }}>Resultado</div>
                        <div style={{ fontSize: "12px", color: "#8b8b8b", display: "flex", gap: "20px" }}>
                          <span>Sucesso: <span style={{ color: m.resultado.sucesso ? "#10b981" : "#ef4444" }}>{m.resultado.sucesso ? "Sim" : "Não"}</span></span>
                          {m.resultado.score != null && <span>Score: {m.resultado.score}</span>}
                          {m.resultado.observacoes && <span>{m.resultado.observacoes}</span>}
                        </div>
                      </div>
                    )}
                    <div style={{ fontSize: "11px", color: "#555", marginTop: "10px" }}>
                      Criada em {new Date(m.createdAt).toLocaleString("pt-BR")}
                      {m.fim && ` · Concluída em ${new Date(m.fim).toLocaleString("pt-BR")}`}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
