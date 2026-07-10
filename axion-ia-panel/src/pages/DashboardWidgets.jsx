import React, { useState, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Users, BarChart3, Eye, MessageCircle, CheckCircle2, Clock, Plus } from "lucide-react";
import { api } from "../services/api";
import "./DashboardWidgets.css";

/* ═══════════════════════════════════════════════════
   TheAdmin-style Dashboard Widgets
   Inspirado em: thetheme.io/theadmin/dashboard/general.html
   ═══════════════════════════════════════════════════ */

/* ─── KPI Card com trend indicator ─── */
function KpiCard({ label, value, trend, trendValue, icon: Icon, color }) {
  const isUp = trend === "up";
  return (
    <div className="widget-kpi-card">
      <div className="widget-kpi-icon" style={{ background: color }}>
        <Icon size={22} />
      </div>
      <div className="widget-kpi-body">
        <span className="widget-kpi-label">{label}</span>
        <span className="widget-kpi-value">{value}</span>
        {trendValue && (
          <span className={`widget-kpi-trend ${isUp ? "up" : "down"}`}>
            {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {trendValue}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Performance Chart (Area) ─── */
function PerformanceChart({ data }) {
  return (
    <div className="widget-card widget-chart">
      <div className="widget-card-header">
        <h4>Performance</h4>
        <span className="widget-badge">Últimos 7 dias</span>
      </div>
      <div className="widget-chart-body">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradAtend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradResolv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="dia" stroke="#9ca3af" fontSize={11} />
            <YAxis stroke="#9ca3af" fontSize={11} />
            <Tooltip
              contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, color: "#111827" }}
            />
            <Area type="monotone" dataKey="atendimentos" stroke="#8b5cf6" fill="url(#gradAtend)" strokeWidth={2} name="Atendimentos" />
            <Area type="monotone" dataKey="resolvidos" stroke="#22c55e" fill="url(#gradResolv)" strokeWidth={2} name="Resolvidos" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── Top Channels (Bar Chart) ─── */
function TopChannelsChart({ data }) {
  return (
    <div className="widget-card widget-chart">
      <div className="widget-card-header">
        <h4>Top Canais</h4>
        <span className="widget-badge">Este mês</span>
      </div>
      <div className="widget-chart-body">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="canal" stroke="#9ca3af" fontSize={11} />
            <YAxis stroke="#9ca3af" fontSize={11} />
            <Tooltip
              contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, color: "#111827" }}
            />
            <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Interações" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── Activity Feed ─── */
function ActivityFeed({ items }) {
  return (
    <div className="widget-card widget-activity">
      <div className="widget-card-header">
        <h4>Atividade Recente</h4>
      </div>
      <ul className="widget-activity-list">
        {items.map((item, i) => (
          <li key={i} className="widget-activity-item">
            <div className={`widget-activity-dot ${item.type}`} />
            <div className="widget-activity-content">
              <span className="widget-activity-text">{item.text}</span>
              <span className="widget-activity-time">{item.time}</span>
            </div>
          </li>
        ))}
        {items.length === 0 && <li className="widget-activity-empty">Nenhuma atividade recente</li>}
      </ul>
    </div>
  );
}

/* ─── Quick Tasks (Todo) ─── */
function QuickTasks({ tasks, onToggle, onAdd }) {
  const [newTask, setNewTask] = useState("");
  return (
    <div className="widget-card widget-tasks">
      <div className="widget-card-header">
        <h4>Tarefas Rápidas</h4>
        <span className="widget-badge">{tasks.filter(t => t.done).length}/{tasks.length}</span>
      </div>
      <ul className="widget-task-list">
        {tasks.map((t, i) => (
          <li key={i} className={`widget-task-item ${t.done ? "done" : ""}`}>
            <label>
              <input type="checkbox" checked={t.done} onChange={() => onToggle(i)} />
              <span>{t.text}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="widget-task-add">
        <input
          type="text"
          placeholder="Nova tarefa..."
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && newTask.trim()) { onAdd(newTask.trim()); setNewTask(""); } }}
        />
        <button onClick={() => { if (newTask.trim()) { onAdd(newTask.trim()); setNewTask(""); } }}>
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

/* ─── Main Widget Section ─── */
export default function DashboardWidgets() {
  const [kpis, setKpis] = useState({ chamados: 0, usuarios: 0, atendimentos: 0, impressoes: 0 });
  const [chartData, setChartData] = useState([]);
  const [channelData, setChannelData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("axion-tasks") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    // Buscar KPIs e dados de chart da API
    api.get("/analise").then(r => {
      const d = r.data;
      setKpis({
        chamados: d.totalInteracoes || 0,
        usuarios: d.totalEntradasKB || 0,
        atendimentos: d.resolucao ? (d.resolucao.kb + d.resolucao.embedding + d.resolucao.openai) : 0,
        impressoes: d.taxaResolucaoKB || "0%",
      });
      if (d.volumePorDia?.length) {
        setChartData(d.volumePorDia.map(v => ({
          dia: v._id?.slice(5) || v._id,
          atendimentos: v.total,
          resolvidos: Math.round(v.total * 0.7),
        })));
      }
    }).catch(() => {});

    // Buscar atividade recente (logs)
    api.get("/logs?limit=8").then(r => {
      const logs = Array.isArray(r.data) ? r.data : (r.data?.logs || []);
      setActivities(logs.slice(0, 8).map(l => ({
        text: l.mensagem || l.message || l.acao || "Ação registrada",
        time: l.createdAt ? new Date(l.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "",
        type: l.tipo === "erro" ? "error" : l.tipo === "sucesso" ? "success" : "info",
      })));
    }).catch(() => {});

    // Canais
    setChannelData([
      { canal: "WhatsApp", total: 45 },
      { canal: "Chat IA", total: 32 },
      { canal: "Helpdesk", total: 28 },
      { canal: "Email", total: 12 },
    ]);
  }, []);

  useEffect(() => {
    localStorage.setItem("axion-tasks", JSON.stringify(tasks));
  }, [tasks]);

  function toggleTask(idx) {
    setTasks(prev => prev.map((t, i) => i === idx ? { ...t, done: !t.done } : t));
  }
  function addTask(text) {
    setTasks(prev => [...prev, { text, done: false }]);
  }

  return (
    <section className="dashboard-widgets">
      {/* ─── KPI Row ─── */}
      <div className="widget-kpi-row">
        <KpiCard label="Interações" value={kpis.chamados} trend="up" trendValue="+12%" icon={MessageCircle} color="#8b5cf6" />
        <KpiCard label="Base de Conhecimento" value={kpis.usuarios} trend="up" trendValue="+5%" icon={Users} color="#3b82f6" />
        <KpiCard label="Resoluções" value={kpis.atendimentos} trend="up" trendValue="+8%" icon={CheckCircle2} color="#22c55e" />
        <KpiCard label="Taxa Resolução" value={kpis.impressoes} trend="up" trendValue="" icon={Eye} color="#f59e0b" />
      </div>

      {/* ─── Charts Row ─── */}
      <div className="widget-charts-row">
        <PerformanceChart data={chartData} />
        <TopChannelsChart data={channelData} />
      </div>

      {/* ─── Bottom Row: Activity + Tasks ─── */}
      <div className="widget-bottom-row">
        <ActivityFeed items={activities} />
        <QuickTasks tasks={tasks} onToggle={toggleTask} onAdd={addTask} />
      </div>
    </section>
  );
}
