import React, { useState } from "react";
import { Link } from "react-router-dom";

/* ════════════════════════════════════════════════════════════════
   MAPA DE OPERAÇÕES — Cenário interativo de fluxos interligados
   ════════════════════════════════════════════════════════════════ */

const NODES = [
  // ── ENTRADA (fontes de dados) ──
  { id: "pncp", label: "PNCP Gov.br", icon: "🏛️", group: "entrada", x: 50, y: 60, desc: "Portal Nacional de Contratações Públicas — busca automática de editais de fiscalização eletrônica", link: "/editais-gov" },
  { id: "jitbit", label: "Jitbit Helpdesk", icon: "🎧", group: "entrada", x: 50, y: 200, desc: "Sistema externo de tickets — polling automático a cada 2 min puxa novos chamados", link: "/helpdesk" },
  { id: "whatsapp", label: "WhatsApp", icon: "💬", group: "entrada", x: 50, y: 340, desc: "Canal de atendimento via WhatsApp — fluxo conversacional com menu, fotos e criação de tickets", link: "/whatsapp" },
  { id: "axhub_db", label: "AxHub (SQL Server)", icon: "🗄️", group: "entrada", x: 50, y: 480, desc: "Banco SQL Server — 70+ telas: infrações, passagens, equipamentos, triagens, operações, faixas" },
  { id: "axton_db", label: "AxTon (MongoDB)", icon: "🗄️", group: "entrada", x: 50, y: 560, desc: "Banco MongoDB — pesagem veicular, classificações, configurações de balança" },
  { id: "axcross_db", label: "AxCross (SQL Server)", icon: "🗄️", group: "entrada", x: 50, y: 640, desc: "Banco SQL Server — cruzamento de placas, monitoramento online, alertas SignalR" },
  { id: "upload", label: "Upload Imagens", icon: "📸", group: "entrada", x: 50, y: 780, desc: "Imagens de câmeras, placas, ocupação — entrada para pipeline de análise visual" },

  // ── PROCESSAMENTO (núcleo IA) ──
  { id: "editais", label: "Busca de Editais", icon: "🔍", group: "processamento", x: 280, y: 60, desc: "Scraping do PNCP → importação → análise rápida contra 3 produtos", link: "/editais-gov" },
  { id: "conformidade", label: "Conformidade", icon: "🛡️", group: "processamento", x: 500, y: 60, desc: "Extração heurística + IA → scoring por requisito → justificativas técnicas → veredicto APTO/INAPTO", link: "/conformidade" },
  { id: "multi", label: "Multi-Produto", icon: "📊", group: "processamento", x: 500, y: 160, desc: "Análise simultânea AxHub vs AxTon vs AxCross — matriz de cobertura e lacunas", link: "/analisa-multi" },
  { id: "helpdesk", label: "Helpdesk IA", icon: "🎫", group: "processamento", x: 280, y: 200, desc: "Classificação automática + sugestão de resposta via KB/GPT → fila de aprovação", link: "/helpdesk" },
  { id: "chat", label: "Chat IA", icon: "🤖", group: "processamento", x: 280, y: 340, desc: "Engine: mensagem → classificador KB → se não encontrou → GPT-4o-mini com prompt especializado", link: "/chat" },
  { id: "dashboards", label: "Dashboards Produto", icon: "📊", group: "processamento", x: 280, y: 540, desc: "KPIs por produto: equipamentos, operações, infrações, passagens, heartbeat, triagens", link: "/dashboard" },
  { id: "relatorio", label: "Relatório de Fluxo", icon: "📈", group: "processamento", x: 280, y: 660, desc: "Heatmap hora×dia de passagens e imagens por equipamento — dados do AxHub", link: "/relatorio-fluxo" },
  { id: "analise_img", label: "Análise de Imagens", icon: "📷", group: "processamento", x: 280, y: 780, desc: "GPT-4o Vision: ocupação, roda, cor, placa → scoring de confiança → lote até 500", link: "/analise-imagens" },

  // ── QUALIDADE (revisão & validação) ──
  { id: "fila", label: "Fila de Revisão", icon: "✅", group: "qualidade", x: 500, y: 400, desc: "Items com confiança < 60% → revisão humana → aprovação/rejeição → feedback loop", link: "/confianca" },
  { id: "sla", label: "SLA Compliance", icon: "🎯", group: "qualidade", x: 500, y: 300, desc: "Met vs Breached vs Aberto por prioridade — compliance % por site e período", link: "/sla-compliance" },
  { id: "sites", label: "Sites × Chamados", icon: "🏢", group: "qualidade", x: 500, y: 500, desc: "Mapeamento de sites com categorias Jitbit — health score por contrato", link: "/chamados-sites" },

  // ── INTELIGÊNCIA (planejamento) ──
  { id: "roadmap", label: "Roadmap", icon: "🗺️", group: "inteligencia", x: 720, y: 60, desc: "Gaps de conformidade → itens priorizados (Alta/Média/Baixa) → Planejado → Especificado → Desenvolvido", link: "/roadmap" },
  { id: "specs", label: "Specs Técnicas", icon: "📐", group: "inteligencia", x: 720, y: 160, desc: "Geração automática de PRD a partir do item do roadmap: user stories, critérios de aceitação", link: "/specs" },
  { id: "fontes", label: "Fontes de Pesquisa", icon: "🔎", group: "inteligencia", x: 720, y: 260, desc: "URLs de referência → análise de cobertura → mapa por produto → sugestões de melhoria", link: "/fontes" },

  // ── CONHECIMENTO (base & aprendizado) ──
  { id: "kb", label: "Knowledge Base", icon: "📚", group: "conhecimento", x: 720, y: 400, desc: "1000+ entradas com embeddings vetoriais — busca semântica via cosine similarity", link: "/kb" },
  { id: "treino", label: "Treinamento", icon: "🎓", group: "conhecimento", x: 720, y: 500, desc: "Adiciona pares pergunta/resposta → gera embedding → enriquece KB continuamente", link: "/treinamento" },
  { id: "gerar_doc", label: "Gerador de Docs", icon: "📄", group: "conhecimento", x: 720, y: 600, desc: "IA gera documentação por produto a partir de contexto + screenshots → export PDF/Word", link: "/gerar-doc" },

  // ── SAÍDA (resultados) ──
  { id: "hub", label: "Intelligence Hub", icon: "🧠", group: "saida", x: 940, y: 300, desc: "Dashboard unificado: health score, sites, chamados, performance, relatórios — visão 360°", link: "/intelligence-hub" },
  { id: "agent", label: "Agente Autônomo", icon: "⚡", group: "saida", x: 940, y: 460, desc: "Orquestrador: health check, reconhecimento de equipamentos, validação de integridade — cron automático" },
  { id: "logs", label: "Logs & Auditoria", icon: "📋", group: "saida", x: 940, y: 600, desc: "Registro de todas as operações: mensagens, origens, scores, histórico de conversas", link: "/logs" },
];

const CONNECTIONS = [
  // PNCP → Editais → Conformidade → Multi → Roadmap → Specs
  { from: "pncp", to: "editais", label: "scraping", type: "data" },
  { from: "editais", to: "conformidade", label: "analisar edital", type: "data" },
  { from: "conformidade", to: "multi", label: "3 produtos", type: "process" },
  { from: "conformidade", to: "fila", label: "confiança < 60%", type: "quality" },
  { from: "multi", to: "roadmap", label: "lacunas", type: "intelligence" },
  { from: "roadmap", to: "specs", label: "gerar PRD", type: "intelligence" },
  { from: "fontes", to: "conformidade", label: "referências", type: "data" },
  { from: "fontes", to: "roadmap", label: "gaps", type: "intelligence" },

  // Jitbit → Helpdesk → Chat IA → KB
  { from: "jitbit", to: "helpdesk", label: "polling 2min", type: "data" },
  { from: "helpdesk", to: "chat", label: "classificar", type: "process" },
  { from: "helpdesk", to: "fila", label: "revisão humana", type: "quality" },
  { from: "helpdesk", to: "sla", label: "métricas SLA", type: "quality" },
  { from: "helpdesk", to: "sites", label: "por site", type: "process" },
  { from: "chat", to: "kb", label: "busca semântica", type: "knowledge" },

  // WhatsApp → Chat IA → Helpdesk
  { from: "whatsapp", to: "chat", label: "mensagens", type: "data" },
  { from: "whatsapp", to: "helpdesk", label: "criar ticket", type: "process" },

  // Bancos → Dashboards → Relatório → Intelligence Hub
  { from: "axhub_db", to: "dashboards", label: "KPIs", type: "data" },
  { from: "axton_db", to: "dashboards", label: "KPIs", type: "data" },
  { from: "axcross_db", to: "dashboards", label: "KPIs", type: "data" },
  { from: "axhub_db", to: "relatorio", label: "passagens", type: "data" },
  { from: "dashboards", to: "hub", label: "consolidar", type: "process" },
  { from: "relatorio", to: "hub", label: "métricas", type: "process" },

  // Upload → Análise Imagens → Fila
  { from: "upload", to: "analise_img", label: "imagens", type: "data" },
  { from: "analise_img", to: "fila", label: "confiança < 60%", type: "quality" },

  // KB ← Treinamento, Doc
  { from: "treino", to: "kb", label: "pares Q&A", type: "knowledge" },
  { from: "gerar_doc", to: "kb", label: "reindexar", type: "knowledge" },

  // Tudo → Intelligence Hub
  { from: "sla", to: "hub", label: "compliance", type: "process" },
  { from: "sites", to: "hub", label: "por site", type: "process" },
  { from: "fila", to: "hub", label: "pendentes", type: "quality" },
  { from: "fila", to: "conformidade", label: "atualizar veredicto", type: "quality" },

  // Agent orquestra tudo
  { from: "hub", to: "agent", label: "estado", type: "process" },
  { from: "agent", to: "logs", label: "registrar", type: "data" },
  { from: "helpdesk", to: "logs", label: "registrar", type: "data" },
  { from: "chat", to: "logs", label: "registrar", type: "data" },
];

const PIPELINES = [
  {
    id: "edital",
    name: "Pipeline de Editais",
    icon: "🏛️",
    color: "#3b82f6",
    desc: "Da busca no PNCP até a geração de especificações técnicas",
    steps: ["pncp", "editais", "conformidade", "multi", "fila", "roadmap", "specs"],
    summary: "Busca editais → Extrai requisitos → Analisa conformidade 3 produtos → Revisa incertos → Gera roadmap → Cria PRDs"
  },
  {
    id: "atendimento",
    name: "Pipeline de Atendimento",
    icon: "🎧",
    color: "#10b981",
    desc: "Do ticket até a resolução com IA e controle de qualidade",
    steps: ["jitbit", "whatsapp", "helpdesk", "chat", "kb", "fila", "sla", "sites"],
    summary: "Jitbit/WhatsApp → Classificação IA → Busca KB → Sugere resposta → Revisão humana → Mede SLA → Agrupa por site"
  },
  {
    id: "imagem",
    name: "Pipeline de Imagens",
    icon: "📷",
    color: "#f59e0b",
    desc: "Do upload da câmera até a validação humana de qualidade",
    steps: ["upload", "analise_img", "fila"],
    summary: "Upload → Pré-processamento (sharp) → GPT-4o Vision → Score confiança → Se < 60% → Fila revisão humana"
  },
  {
    id: "operacional",
    name: "Pipeline Operacional",
    icon: "📊",
    color: "#8b5cf6",
    desc: "Dos bancos de produção até o painel unificado",
    steps: ["axhub_db", "axton_db", "axcross_db", "dashboards", "relatorio", "hub", "agent"],
    summary: "3 bancos de produção → KPIs por produto → Relatório de fluxo → Intelligence Hub → Agente autônomo (cron)"
  },
  {
    id: "conhecimento",
    name: "Pipeline de Conhecimento",
    icon: "📚",
    color: "#ec4899",
    desc: "Da documentação até a resposta inteligente no chat",
    steps: ["gerar_doc", "treino", "kb", "chat"],
    summary: "Gera documentação IA → Treina pares Q&A → Embeddings vetoriais → Busca semântica no Chat IA"
  },
];

const GROUP_COLORS = {
  entrada: { bg: "rgba(99,102,241,0.08)", border: "#6366f1", label: "🔵 Fontes de Dados" },
  processamento: { bg: "rgba(59,130,246,0.08)", border: "#3b82f6", label: "🔷 Processamento" },
  qualidade: { bg: "rgba(16,185,129,0.08)", border: "#10b981", label: "🟢 Qualidade" },
  inteligencia: { bg: "rgba(245,158,11,0.08)", border: "#f59e0b", label: "🟡 Inteligência" },
  conhecimento: { bg: "rgba(236,72,153,0.08)", border: "#ec4899", label: "🩷 Conhecimento" },
  saida: { bg: "rgba(139,92,246,0.08)", border: "#8b5cf6", label: "🟣 Resultado" },
};

const CONNECTION_COLORS = {
  data: "#6366f1",
  process: "#3b82f6",
  quality: "#10b981",
  intelligence: "#f59e0b",
  knowledge: "#ec4899",
};

export default function MapaOperacoes() {
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const activeSteps = selectedPipeline ? PIPELINES.find(p => p.id === selectedPipeline)?.steps || [] : [];
  const activeConns = selectedPipeline
    ? CONNECTIONS.filter(c => activeSteps.includes(c.from) && activeSteps.includes(c.to))
    : CONNECTIONS;

  const relatedNodes = hoveredNode
    ? new Set([
        hoveredNode,
        ...CONNECTIONS.filter(c => c.from === hoveredNode).map(c => c.to),
        ...CONNECTIONS.filter(c => c.to === hoveredNode).map(c => c.from),
      ])
    : null;

  const nodePos = {};
  NODES.forEach(n => { nodePos[n.id] = { x: n.x, y: n.y }; });

  const W = 1060, H = 870;

  return (
    <div style={{ padding: "0 1.5rem 2rem" }}>
      {/* ── Pipeline selector ── */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.2rem" }}>
        <button
          onClick={() => setSelectedPipeline(null)}
          style={{
            padding: "0.5rem 1rem", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)",
            background: !selectedPipeline ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.05)",
            color: "#e2e8f0", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600,
          }}
        >
          🔗 Todas as Conexões
        </button>
        {PIPELINES.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedPipeline(selectedPipeline === p.id ? null : p.id)}
            style={{
              padding: "0.5rem 1rem", borderRadius: 8,
              border: `1px solid ${selectedPipeline === p.id ? p.color : "rgba(255,255,255,0.15)"}`,
              background: selectedPipeline === p.id ? `${p.color}30` : "rgba(255,255,255,0.05)",
              color: selectedPipeline === p.id ? p.color : "#94a3b8",
              cursor: "pointer", fontSize: "0.82rem", fontWeight: 600,
            }}
          >
            {p.icon} {p.name}
          </button>
        ))}
      </div>

      {/* ── Pipeline description ── */}
      {selectedPipeline && (() => {
        const p = PIPELINES.find(pp => pp.id === selectedPipeline);
        return (
          <div style={{
            background: `${p.color}15`, border: `1px solid ${p.color}40`, borderRadius: 12,
            padding: "1rem 1.2rem", marginBottom: "1.2rem",
          }}>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: p.color, marginBottom: "0.3rem" }}>
              {p.icon} {p.name} — {p.desc}
            </div>
            <div style={{ fontSize: "0.85rem", color: "#cbd5e1", lineHeight: 1.6 }}>{p.summary}</div>
            <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.6rem", flexWrap: "wrap" }}>
              {p.steps.map((s, i) => {
                const node = NODES.find(n => n.id === s);
                return (
                  <React.Fragment key={s}>
                    <span style={{
                      background: `${p.color}25`, color: p.color, padding: "2px 10px",
                      borderRadius: 6, fontSize: "0.78rem", fontWeight: 600,
                    }}>
                      {node?.icon} {node?.label}
                    </span>
                    {i < p.steps.length - 1 && <span style={{ color: "#475569" }}>→</span>}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── Map SVG ── */}
      <div style={{
        background: "rgba(255,255,255,0.03)", borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)", overflow: "auto",
      }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: 900, height: "auto" }}>
          <defs>
            {Object.entries(CONNECTION_COLORS).map(([type, color]) => (
              <marker key={type} id={`arrow-${type}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d={`M0 0L10 5L0 10z`} fill={color} opacity="0.7" />
              </marker>
            ))}
          </defs>

          {/* Group backgrounds */}
          <rect x="20" y="30" width="200" height="780" rx="16" fill={GROUP_COLORS.entrada.bg} stroke={GROUP_COLORS.entrada.border} strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
          <text x="120" y="22" textAnchor="middle" fontSize="11" fill={GROUP_COLORS.entrada.border} fontWeight="700">{GROUP_COLORS.entrada.label}</text>

          <rect x="235" y="30" width="210" height="290" rx="16" fill={GROUP_COLORS.processamento.bg} stroke={GROUP_COLORS.processamento.border} strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
          <text x="340" y="22" textAnchor="middle" fontSize="11" fill={GROUP_COLORS.processamento.border} fontWeight="700">{GROUP_COLORS.processamento.label}</text>

          <rect x="460" y="270" width="200" height="270" rx="16" fill={GROUP_COLORS.qualidade.bg} stroke={GROUP_COLORS.qualidade.border} strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
          <text x="560" y="262" textAnchor="middle" fontSize="11" fill={GROUP_COLORS.qualidade.border} fontWeight="700">{GROUP_COLORS.qualidade.label}</text>

          <rect x="680" y="30" width="180" height="270" rx="16" fill={GROUP_COLORS.inteligencia.bg} stroke={GROUP_COLORS.inteligencia.border} strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
          <text x="770" y="22" textAnchor="middle" fontSize="11" fill={GROUP_COLORS.inteligencia.border} fontWeight="700">{GROUP_COLORS.inteligencia.label}</text>

          <rect x="680" y="370" width="180" height="280" rx="16" fill={GROUP_COLORS.conhecimento.bg} stroke={GROUP_COLORS.conhecimento.border} strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
          <text x="770" y="362" textAnchor="middle" fontSize="11" fill={GROUP_COLORS.conhecimento.border} fontWeight="700">{GROUP_COLORS.conhecimento.label}</text>

          <rect x="900" y="270" width="140" height="380" rx="16" fill={GROUP_COLORS.saida.bg} stroke={GROUP_COLORS.saida.border} strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
          <text x="970" y="262" textAnchor="middle" fontSize="11" fill={GROUP_COLORS.saida.border} fontWeight="700">{GROUP_COLORS.saida.label}</text>

          {/* Connections */}
          {activeConns.map((c, i) => {
            const f = nodePos[c.from], t = nodePos[c.to];
            if (!f || !t) return null;
            const dimmed = selectedPipeline && !activeSteps.includes(c.from);
            const relHighlight = relatedNodes && relatedNodes.has(c.from) && relatedNodes.has(c.to);
            const opacity = dimmed ? 0.08 : relHighlight ? 0.9 : relatedNodes ? 0.15 : 0.35;
            const color = CONNECTION_COLORS[c.type] || "#64748b";
            const mx = (f.x + t.x) / 2, my = (f.y + t.y) / 2;
            return (
              <g key={i}>
                <line x1={f.x + 60} y1={f.y} x2={t.x - 60} y2={t.y}
                  stroke={color} strokeWidth={relHighlight ? 2.5 : 1.5} opacity={opacity}
                  markerEnd={`url(#arrow-${c.type})`}
                />
                {(opacity > 0.2) && (
                  <text x={mx} y={my - 6} textAnchor="middle" fontSize="8" fill={color} opacity={0.8} fontWeight="600">
                    {c.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {NODES.map(n => {
            const dimmed = selectedPipeline && !activeSteps.includes(n.id);
            const isHovered = hoveredNode === n.id;
            const isRelated = relatedNodes?.has(n.id);
            const isSelected = selectedNode === n.id;
            const opacity = dimmed ? 0.15 : isHovered ? 1 : isRelated ? 0.95 : relatedNodes ? 0.3 : 0.85;
            const gc = GROUP_COLORS[n.group];
            return (
              <g key={n.id} opacity={opacity}
                onMouseEnter={() => setHoveredNode(n.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setSelectedNode(selectedNode === n.id ? null : n.id)}
                style={{ cursor: "pointer" }}
              >
                <rect x={n.x - 55} y={n.y - 18} width={110} height={36} rx={10}
                  fill={isHovered || isSelected ? `${gc.border}30` : "rgba(15,23,42,0.8)"}
                  stroke={isHovered || isSelected ? gc.border : `${gc.border}50`}
                  strokeWidth={isHovered || isSelected ? 2 : 1}
                />
                <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize="11" fontWeight="700"
                  fill={isHovered || isSelected ? "#f8fafc" : "#cbd5e1"}>
                  {n.icon} {n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── Node detail panel ── */}
      {selectedNode && (() => {
        const n = NODES.find(nd => nd.id === selectedNode);
        const incoming = CONNECTIONS.filter(c => c.to === selectedNode);
        const outgoing = CONNECTIONS.filter(c => c.from === selectedNode);
        const gc = GROUP_COLORS[n.group];
        return (
          <div style={{
            marginTop: "1rem", background: "rgba(255,255,255,0.04)",
            border: `1px solid ${gc.border}40`, borderRadius: 12, padding: "1.2rem",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
              <div>
                <span style={{ fontSize: "1.3rem" }}>{n.icon}</span>{" "}
                <span style={{ fontSize: "1.1rem", fontWeight: 700, color: gc.border }}>{n.label}</span>
                <span style={{ marginLeft: 12, fontSize: "0.75rem", color: "#64748b", background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: 6 }}>{gc.label}</span>
              </div>
              {n.link && (
                <Link to={n.link} style={{
                  background: `${gc.border}20`, color: gc.border, padding: "6px 14px",
                  borderRadius: 8, fontSize: "0.8rem", fontWeight: 600, textDecoration: "none",
                  border: `1px solid ${gc.border}40`,
                }}>
                  Abrir página →
                </Link>
              )}
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.88rem", lineHeight: 1.6, marginBottom: "1rem" }}>{n.desc}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "0.4rem" }}>⬅️ Recebe de ({incoming.length})</div>
                {incoming.length === 0 ? <div style={{ color: "#475569", fontSize: "0.82rem" }}>Fonte primária (sem dependência)</div> :
                  incoming.map((c, i) => {
                    const src = NODES.find(nd => nd.id === c.from);
                    return (
                      <div key={i} style={{ fontSize: "0.82rem", color: "#cbd5e1", padding: "2px 0" }}>
                        {src?.icon} <strong>{src?.label}</strong> <span style={{ color: CONNECTION_COLORS[c.type], fontSize: "0.75rem" }}>({c.label})</span>
                      </div>
                    );
                  })
                }
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "0.4rem" }}>➡️ Alimenta ({outgoing.length})</div>
                {outgoing.length === 0 ? <div style={{ color: "#475569", fontSize: "0.82rem" }}>Destino final (resultado)</div> :
                  outgoing.map((c, i) => {
                    const tgt = NODES.find(nd => nd.id === c.to);
                    return (
                      <div key={i} style={{ fontSize: "0.82rem", color: "#cbd5e1", padding: "2px 0" }}>
                        {tgt?.icon} <strong>{tgt?.label}</strong> <span style={{ color: CONNECTION_COLORS[c.type], fontSize: "0.75rem" }}>({c.label})</span>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Legend ── */}
      <div style={{ marginTop: "1.2rem", display: "flex", gap: "1.5rem", flexWrap: "wrap", fontSize: "0.78rem", color: "#64748b" }}>
        <span><span style={{ display: "inline-block", width: 12, height: 3, background: "#6366f1", marginRight: 4, verticalAlign: "middle", borderRadius: 2 }} /> Dados</span>
        <span><span style={{ display: "inline-block", width: 12, height: 3, background: "#3b82f6", marginRight: 4, verticalAlign: "middle", borderRadius: 2 }} /> Processo</span>
        <span><span style={{ display: "inline-block", width: 12, height: 3, background: "#10b981", marginRight: 4, verticalAlign: "middle", borderRadius: 2 }} /> Qualidade</span>
        <span><span style={{ display: "inline-block", width: 12, height: 3, background: "#f59e0b", marginRight: 4, verticalAlign: "middle", borderRadius: 2 }} /> Inteligência</span>
        <span><span style={{ display: "inline-block", width: 12, height: 3, background: "#ec4899", marginRight: 4, verticalAlign: "middle", borderRadius: 2 }} /> Conhecimento</span>
      </div>
    </div>
  );
}
