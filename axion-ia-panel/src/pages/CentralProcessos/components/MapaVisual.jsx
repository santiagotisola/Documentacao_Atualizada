import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

/* ═══════════════════════════════════════════════════════════════════
   Componente: Mapa Visual - Ecossistema AxionIA
   Diagrama SVG interativo com 27 nós, 30+ conexões e 5 pipelines
   ═══════════════════════════════════════════════════════════════════ */

// ─── DADOS DO MAPA ──────────────────────────────────────────────────
const NODES = [
  { id: "pncp", label: "PNCP Gov.br", icon: "🏛️", group: "entrada", x: 50, y: 60, desc: "Portal Nacional de Contratações Públicas - busca automática de editais", link: "/editais-gov" },
  { id: "jitbit", label: "Jitbit Helpdesk", icon: "🎧", group: "entrada", x: 50, y: 200, desc: "Sistema externo de tickets - polling automático a cada 2 min", link: "/helpdesk" },
  { id: "whatsapp", label: "WhatsApp", icon: "💬", group: "entrada", x: 50, y: 340, desc: "Canal de atendimento via WhatsApp", link: "/whatsapp" },
  { id: "axhub_db", label: "AxHub (SQL Server)", icon: "🗄️", group: "entrada", x: 50, y: 480, desc: "Banco SQL Server - 70+ telas" },
  { id: "axton_db", label: "AxTon (MongoDB)", icon: "🗄️", group: "entrada", x: 50, y: 560, desc: "Banco MongoDB - pesagem veicular" },
  { id: "axcross_db", label: "AxCross (SQL Server)", icon: "🗄️", group: "entrada", x: 50, y: 640, desc: "Banco SQL Server - cruzamento de placas" },
  { id: "upload", label: "Upload Imagens", icon: "📸", group: "entrada", x: 50, y: 780, desc: "Imagens de câmeras, placas, ocupação" },
  { id: "editais", label: "Busca de Editais", icon: "🔍", group: "processamento", x: 280, y: 60, desc: "Scraping do PNCP - importação e análise", link: "/editais-gov" },
  { id: "conformidade", label: "Conformidade", icon: "🛡️", group: "processamento", x: 500, y: 60, desc: "Scoring por requisito - veredicto APTO/INAPTO", link: "/conformidade" },
  { id: "multi", label: "Multi-Produto", icon: "📊", group: "processamento", x: 500, y: 160, desc: "Análise simultânea AxHub vs AxTon vs AxCross", link: "/analisa-multi" },
  { id: "helpdesk", label: "Helpdesk IA", icon: "🎫", group: "processamento", x: 280, y: 200, desc: "Classificação automática + sugestão de resposta", link: "/helpdesk" },
  { id: "chat", label: "Chat IA", icon: "🤖", group: "processamento", x: 280, y: 340, desc: "Engine: mensagem → classificador KB → GPT-4o-mini", link: "/chat" },
  { id: "dashboards", label: "Dashboards Produto", icon: "📊", group: "processamento", x: 280, y: 540, desc: "KPIs por produto", link: "/dashboard" },
  { id: "relatorio", label: "Relatório de Fluxo", icon: "📈", group: "processamento", x: 280, y: 660, desc: "Heatmap hora x dia de passagens", link: "/relatorio-fluxo" },
  { id: "analise_img", label: "Análise de Imagens", icon: "📷", group: "processamento", x: 280, y: 780, desc: "GPT-4o Vision: scoring de confiança", link: "/analise-imagens" },
  { id: "fila", label: "Fila de Revisão", icon: "✅", group: "qualidade", x: 500, y: 400, desc: "Confiança < 60% - revisão humana", link: "/confianca" },
  { id: "sla", label: "SLA Compliance", icon: "🎯", group: "qualidade", x: 500, y: 300, desc: "Met vs Breached vs Aberto por prioridade", link: "/sla-compliance" },
  { id: "sites", label: "Sites x Chamados", icon: "🏢", group: "qualidade", x: 500, y: 500, desc: "Métricas e credenciais por site", link: "/operations-hub?tab=sites" },
  { id: "roadmap", label: "Roadmap", icon: "🗺️", group: "inteligencia", x: 720, y: 60, desc: "Gaps de conformidade priorizados", link: "/roadmap" },
  { id: "specs", label: "Specs Técnicas", icon: "📐", group: "inteligencia", x: 720, y: 160, desc: "Geração automática de PRD", link: "/specs" },
  { id: "fontes", label: "Fontes de Pesquisa", icon: "🔎", group: "inteligencia", x: 720, y: 260, desc: "URLs de referência e cobertura", link: "/fontes" },
  { id: "kb", label: "Knowledge Base", icon: "📚", group: "conhecimento", x: 720, y: 400, desc: "1000+ entradas com embeddings vetoriais", link: "/kb" },
  { id: "treino", label: "Treinamento", icon: "🎓", group: "conhecimento", x: 720, y: 500, desc: "Pares pergunta/resposta - gera embedding", link: "/treinamento" },
  { id: "gerar_doc", label: "Gerador de Docs", icon: "📄", group: "conhecimento", x: 720, y: 600, desc: "IA gera documentação por produto", link: "/gerar-doc" },
  { id: "hub", label: "Intelligence Hub", icon: "🧠", group: "saida", x: 940, y: 300, desc: "Dashboard unificado - visão 360", link: "/intelligence-hub" },
  { id: "agent", label: "Agente Autônomo", icon: "⚡", group: "saida", x: 940, y: 460, desc: "Orquestrador: health check, validação" },
  { id: "logs", label: "Logs & Auditoria", icon: "📋", group: "saida", x: 940, y: 600, desc: "Registro de todas as operações", link: "/logs" },
];

const CONNECTIONS = [
  { from: "pncp", to: "editais", label: "scraping", type: "data" },
  { from: "editais", to: "conformidade", label: "analisar edital", type: "data" },
  { from: "conformidade", to: "multi", label: "3 produtos", type: "process" },
  { from: "conformidade", to: "fila", label: "confiança < 60%", type: "quality" },
  { from: "multi", to: "roadmap", label: "lacunas", type: "intelligence" },
  { from: "roadmap", to: "specs", label: "gerar PRD", type: "intelligence" },
  { from: "fontes", to: "conformidade", label: "referências", type: "data" },
  { from: "fontes", to: "roadmap", label: "gaps", type: "intelligence" },
  { from: "jitbit", to: "helpdesk", label: "polling 2min", type: "data" },
  { from: "helpdesk", to: "chat", label: "classificar", type: "process" },
  { from: "helpdesk", to: "fila", label: "revisão humana", type: "quality" },
  { from: "helpdesk", to: "sla", label: "métricas SLA", type: "quality" },
  { from: "helpdesk", to: "sites", label: "por site", type: "process" },
  { from: "chat", to: "kb", label: "busca semântica", type: "knowledge" },
  { from: "whatsapp", to: "chat", label: "mensagens", type: "data" },
  { from: "whatsapp", to: "helpdesk", label: "criar ticket", type: "process" },
  { from: "axhub_db", to: "dashboards", label: "KPIs", type: "data" },
  { from: "axton_db", to: "dashboards", label: "KPIs", type: "data" },
  { from: "axcross_db", to: "dashboards", label: "KPIs", type: "data" },
  { from: "axhub_db", to: "relatorio", label: "passagens", type: "data" },
  { from: "dashboards", to: "hub", label: "consolidar", type: "process" },
  { from: "relatorio", to: "hub", label: "métricas", type: "process" },
  { from: "upload", to: "analise_img", label: "imagens", type: "data" },
  { from: "analise_img", to: "fila", label: "confiança < 60%", type: "quality" },
  { from: "treino", to: "kb", label: "pares Q&A", type: "knowledge" },
  { from: "gerar_doc", to: "kb", label: "reindexar", type: "knowledge" },
  { from: "sla", to: "hub", label: "compliance", type: "process" },
  { from: "sites", to: "hub", label: "por site", type: "process" },
  { from: "fila", to: "hub", label: "pendentes", type: "quality" },
  { from: "hub", to: "agent", label: "estado", type: "process" },
  { from: "agent", to: "logs", label: "registrar", type: "data" },
  { from: "helpdesk", to: "logs", label: "registrar", type: "data" },
  { from: "chat", to: "logs", label: "registrar", type: "data" },
];

const PIPELINES = [
  { id: "edital", name: "Pipeline de Editais", icon: "🏛️", color: "#3b82f6", steps: ["pncp", "editais", "conformidade", "multi", "fila", "roadmap", "specs"], summary: "Busca editais → Extrai requisitos → Analisa conformidade → Gera roadmap → Cria PRDs" },
  { id: "atendimento", name: "Pipeline de Atendimento", icon: "🎧", color: "#10b981", steps: ["jitbit", "whatsapp", "helpdesk", "chat", "kb", "fila", "sla", "sites"], summary: "Jitbit/WhatsApp → Classificação IA → Busca KB → Sugere resposta → Mede SLA" },
  { id: "imagem", name: "Pipeline de Imagens", icon: "📷", color: "#f59e0b", steps: ["upload", "analise_img", "fila"], summary: "Upload → GPT-4o Vision → Score confiança → Fila revisão humana" },
  { id: "operacional", name: "Pipeline Operacional", icon: "📊", color: "#8b5cf6", steps: ["axhub_db", "axton_db", "axcross_db", "dashboards", "relatorio", "hub", "agent"], summary: "3 bancos → KPIs → Relatório de fluxo → Intelligence Hub → Agente autônomo" },
  { id: "conhecimento", name: "Pipeline de Conhecimento", icon: "📚", color: "#ec4899", steps: ["gerar_doc", "treino", "kb", "chat"], summary: "Gera docs → Treina Q&A → Embeddings → Chat IA" },
];

const GROUP_COLORS = {
  entrada: { bg: "rgba(99,102,241,0.08)", border: "#6366f1", label: "🔵 Fontes de Dados" },
  processamento: { bg: "rgba(59,130,246,0.08)", border: "#3b82f6", label: "🔷 Processamento" },
  qualidade: { bg: "rgba(16,185,129,0.08)", border: "#10b981", label: "🟢 Qualidade" },
  inteligencia: { bg: "rgba(245,158,11,0.08)", border: "#f59e0b", label: "🟡 Inteligência" },
  conhecimento: { bg: "rgba(236,72,153,0.08)", border: "#ec4899", label: "🩷 Conhecimento" },
  saida: { bg: "rgba(139,92,246,0.08)", border: "#8b5cf6", label: "🟣 Resultado" },
};

const CONNECTION_COLORS = { data: "#6366f1", process: "#3b82f6", quality: "#10b981", intelligence: "#f59e0b", knowledge: "#ec4899" };

// ─── COMPONENTE ─────────────────────────────────────────────────────
function MapaVisual({ selectedNode, setSelectedNode, selectedPipeline, setSelectedPipeline, selectedFluxo, setSelectedFluxo, zoom, setZoom, setAbaAtiva, navegarParaAba }) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [buscaNo, setBuscaNo] = useState("");

  // Lógica de filtros e relacionamentos
  const activeSteps = selectedPipeline ? PIPELINES.find(p => p.id === selectedPipeline)?.steps || [] : [];
  const activeConns = selectedPipeline ? CONNECTIONS.filter(c => activeSteps.includes(c.from) && activeSteps.includes(c.to)) : CONNECTIONS;
  const relatedNodes = hoveredNode ? new Set([hoveredNode, ...CONNECTIONS.filter(c => c.from === hoveredNode).map(c => c.to), ...CONNECTIONS.filter(c => c.to === hoveredNode).map(c => c.from)]) : null;
  const nodePos = {}; NODES.forEach(n => { nodePos[n.id] = { x: n.x, y: n.y }; });

  // Controles de zoom e pan
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleZoomReset = () => { setZoom(1); setPanX(0); setPanY(0); };
  
  const handleMouseDown = (e) => {
    if (e.target.tagName !== 'rect' && e.target.tagName !== 'text') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
    }
  };
  
  const handleMouseMove = (e) => {
    if (isDragging) {
      setPanX(e.clientX - dragStart.x);
      setPanY(e.clientY - dragStart.y);
    }
  };
  
  const handleMouseUp = () => setIsDragging(false);
  
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    setZoom(prev => Math.min(Math.max(prev + delta, 0.5), 3));
  };
  
  // Mapeamento: nó → fluxo BPM relacionado
  const getFluxoRelacionado = (nodeId) => {
    const mapeamento = {
      'analise_img': 'infracao',
      'conformidade': 'infracao',
      'axhub_db': 'infracao',
      'helpdesk': 'helpdesk-flow',
      'jitbit': 'helpdesk-flow',
      'whatsapp': 'helpdesk-flow',
      'chat': 'helpdesk-flow',
      'axcross_db': 'monitoramento',
      'dashboards': 'operacao',
    };
    return mapeamento[nodeId];
  };
  
  // Buscar nós
  const nosFiltrados = useMemo(() => {
    if (!buscaNo) return NODES;
    const q = buscaNo.toLowerCase();
    return NODES.filter(n => 
      n.label.toLowerCase().includes(q) || 
      n.desc.toLowerCase().includes(q) ||
      n.id.toLowerCase().includes(q)
    );
  }, [buscaNo]);
  
  const noDestacado = useMemo(() => {
    if (!buscaNo || nosFiltrados.length === 0) return null;
    return nosFiltrados[0].id;
  }, [buscaNo, nosFiltrados]);

  return (
    <div>
      {/* Controles de Zoom e Busca */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <input 
          type="text" 
          placeholder="🔍 Buscar nó no mapa..."
          value={buscaNo}
          onChange={(e) => setBuscaNo(e.target.value)}
          className="cp-input"
          style={{ flex: "1 1 300px" }}
        />
        
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button onClick={handleZoomOut} className="cp-btn cp-btn-secondary" title="Zoom Out">-</button>
          <span style={{ fontSize: "0.8rem", color: "var(--cp-text-secondary)", minWidth: "50px", textAlign: "center", fontFamily: "monospace" }}>
            {(zoom * 100).toFixed(0)}%
          </span>
          <button onClick={handleZoomIn} className="cp-btn cp-btn-secondary" title="Zoom In">+</button>
          <button onClick={handleZoomReset} className="cp-btn cp-btn-secondary">🎯 Reset</button>
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="cp-btn cp-btn-secondary">
            {isFullscreen ? "🗗 Exit" : "⛶ Full"}
          </button>
        </div>
      </div>
      
      {/* Resultados da busca */}
      {buscaNo && nosFiltrados.length > 0 && (
        <div className="cp-alert cp-alert-info" style={{ marginBottom: "1rem" }}>
          🔍 {nosFiltrados.length} nó{nosFiltrados.length > 1 ? 's' : ''} encontrado{nosFiltrados.length > 1 ? 's' : ''}: {' '}
          {nosFiltrados.slice(0, 5).map(n => n.label).join(", ")}
          {nosFiltrados.length > 5 && ` e mais ${nosFiltrados.length - 5}...`}
        </div>
      )}
      
      {/* Seletor de Pipeline */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.2rem" }}>
        <button 
          onClick={() => setSelectedPipeline(null)} 
          className={`cp-btn ${!selectedPipeline ? 'cp-btn-primary' : 'cp-btn-secondary'}`}
        >
          🔗 Todas
        </button>
        {PIPELINES.map(p => (
          <button 
            key={p.id} 
            onClick={() => setSelectedPipeline(selectedPipeline === p.id ? null : p.id)} 
            className="cp-btn cp-btn-secondary"
            style={{ 
              borderColor: selectedPipeline === p.id ? p.color : undefined,
              background: selectedPipeline === p.id ? `${p.color}30` : undefined,
              color: selectedPipeline === p.id ? p.color : undefined
            }}
          >
            {p.icon} {p.name}
          </button>
        ))}
      </div>

      {/* Resumo do Pipeline Selecionado */}
      {selectedPipeline && (() => { 
        const p = PIPELINES.find(pp => pp.id === selectedPipeline); 
        return (
          <div style={{ background: `${p.color}15`, border: `1px solid ${p.color}40`, borderRadius: 12, padding: "1rem 1.2rem", marginBottom: "1.2rem" }}>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: p.color, marginBottom: "0.3rem" }}>{p.icon} {p.name}</div>
            <div style={{ fontSize: "0.85rem", color: "var(--cp-text-secondary)" }}>{p.summary}</div>
            <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.6rem", flexWrap: "wrap" }}>
              {p.steps.map((s, i) => { 
                const node = NODES.find(n => n.id === s); 
                return (
                  <React.Fragment key={s}>
                    <span className="cp-badge" style={{ background: `${p.color}25`, color: p.color }}>{node?.icon} {node?.label}</span>
                    {i < p.steps.length - 1 && <span style={{ color: "var(--cp-text-muted)" }}>→</span>}
                  </React.Fragment>
                ); 
              })}
            </div>
          </div>
        ); 
      })()}

      {/* Mapa SVG Container */}
      <div 
        className="cp-card"
        style={{ 
          position: isFullscreen ? "fixed" : "relative",
          top: isFullscreen ? 0 : "auto",
          left: isFullscreen ? 0 : "auto",
          width: isFullscreen ? "100vw" : "100%",
          height: isFullscreen ? "100vh" : "auto",
          zIndex: isFullscreen ? 9999 : 1,
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* Header no modo fullscreen */}
        {isFullscreen && (
          <div style={{
            background: "var(--cp-bg-secondary)",
            padding: "1rem",
            borderBottom: "1px solid var(--cp-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span style={{ fontWeight: 600 }}>🗺️ Mapa de Operações - Modo Fullscreen</span>
            <button onClick={() => setIsFullscreen(false)} className="cp-btn cp-btn-danger">
              ✕ Fechar
            </button>
          </div>
        )}
        
        <div 
          style={{ 
            flex: 1,
            overflow: "hidden",
            position: "relative",
            cursor: isDragging ? "grabbing" : "grab"
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* SVG com zoom e pan */}
          <svg 
            viewBox="0 0 1060 870" 
            style={{ 
              width: "100%", 
              minWidth: isFullscreen ? "100%" : 900, 
              height: isFullscreen ? "100%" : "auto",
              transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px)`,
              transformOrigin: "center center",
              transition: isDragging ? "none" : "transform 0.1s ease-out"
            }}
          >
            <defs>
              {Object.entries(CONNECTION_COLORS).map(([type, color]) => (
                <marker key={type} id={`arrow-${type}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                  <path d="M0 0L10 5L0 10z" fill={color} opacity="0.7" />
                </marker>
              ))}
            </defs>
            
            {/* Grupos */}
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
            
            {/* Conexões */}
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
                  <line x1={f.x + 60} y1={f.y} x2={t.x - 60} y2={t.y} stroke={color} strokeWidth={relHighlight ? 2.5 : 1.5} opacity={opacity} markerEnd={`url(#arrow-${c.type})`} />
                  {opacity > 0.2 && <text x={mx} y={my - 6} textAnchor="middle" fontSize="8" fill={color} opacity={0.8} fontWeight="600">{c.label}</text>}
                </g>
              ); 
            })}
            
            {/* Nós */}
            {NODES.map(n => { 
              const dimmed = selectedPipeline && !activeSteps.includes(n.id); 
              const isHovered = hoveredNode === n.id; 
              const isRelated = relatedNodes?.has(n.id); 
              const isSearchHighlighted = noDestacado === n.id;
              const isSearchResult = buscaNo && nosFiltrados.some(nf => nf.id === n.id);
              const opacity = dimmed ? 0.15 : isHovered || isSearchHighlighted ? 1 : isRelated || isSearchResult ? 0.95 : relatedNodes ? 0.3 : 0.85; 
              const gc = GROUP_COLORS[n.group]; 
              return (
                <g key={n.id} opacity={opacity} onMouseEnter={() => setHoveredNode(n.id)} onMouseLeave={() => setHoveredNode(null)} onClick={() => navegarParaAba(selectedNode === n.id ? null : n.id)} style={{ cursor: "pointer" }}>
                  <rect 
                    x={n.x - 55} 
                    y={n.y - 18} 
                    width={110} 
                    height={36} 
                    rx={10} 
                    fill={isHovered || isSearchHighlighted ? `${gc.border}30` : "rgba(15,23,42,0.8)"} 
                    stroke={isSearchHighlighted ? "#fbbf24" : isHovered ? gc.border : `${gc.border}50`} 
                    strokeWidth={isSearchHighlighted ? 3 : isHovered ? 2 : 1} 
                  />
                  {isSearchHighlighted && (
                    <rect 
                      x={n.x - 58} 
                      y={n.y - 21} 
                      width={116} 
                      height={42} 
                      rx={12} 
                      fill="none" 
                      stroke="#fbbf24" 
                      strokeWidth={2} 
                      opacity={0.6}
                      strokeDasharray="4 2"
                    >
                      <animate attributeName="stroke-opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
                    </rect>
                  )}
                  <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize="11" fontWeight="700" fill={isHovered || isSearchHighlighted ? "#f8fafc" : "#cbd5e1"}>{n.icon} {n.label}</text>
                </g>
              ); 
            })}
          </svg>
          
          {/* Minimap */}
          <div style={{
            position: "absolute",
            bottom: "1rem",
            right: "1rem",
            width: "150px",
            height: "120px",
            background: "rgba(15,23,42,0.9)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 8,
            overflow: "hidden",
            pointerEvents: "none"
          }}>
            <svg viewBox="0 0 1060 870" style={{ width: "100%", height: "100%" }}>
              <rect width="1060" height="870" fill="rgba(15,23,42,0.5)" />
              {NODES.map(n => (
                <circle 
                  key={n.id} 
                  cx={n.x} 
                  cy={n.y} 
                  r={4} 
                  fill={selectedNode === n.id ? "#fbbf24" : GROUP_COLORS[n.group].border} 
                  opacity={0.6}
                />
              ))}
              {/* Viewport indicator */}
              <rect 
                x="0" 
                y="0" 
                width={1060 / zoom} 
                height={870 / zoom} 
                fill="none" 
                stroke="#60a5fa" 
                strokeWidth={2 / zoom}
                opacity={0.5}
              />
            </svg>
            <div style={{
              position: "absolute",
              top: 4,
              left: 4,
              fontSize: "0.65rem",
              color: "rgba(255,255,255,0.6)",
              fontWeight: 600
            }}>
              MINIMAP
            </div>
          </div>
        </div>
      </div>

      {/* Detalhes do Nó Selecionado */}
      {selectedNode && (() => { 
        const n = NODES.find(nd => nd.id === selectedNode); 
        const incoming = CONNECTIONS.filter(c => c.to === selectedNode); 
        const outgoing = CONNECTIONS.filter(c => c.from === selectedNode); 
        const gc = GROUP_COLORS[n.group];
        const fluxoRelacionado = getFluxoRelacionado(selectedNode);
        return (
          <div className="cp-card" style={{ marginTop: "1rem", borderLeft: `3px solid ${gc.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
              <div>
                <span style={{ fontSize: "1.3rem" }}>{n.icon}</span> 
                <span style={{ fontSize: "1.1rem", fontWeight: 700, color: gc.border, marginLeft: "0.5rem" }}>{n.label}</span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {n.link && (
                  <Link to={n.link} className="cp-btn cp-btn-primary" style={{ textDecoration: "none" }}>
                    Abrir página →
                  </Link>
                )}
                {fluxoRelacionado && (
                  <button 
                    onClick={() => { 
                      setSelectedFluxo(fluxoRelacionado); 
                      setAbaAtiva('fluxos'); 
                    }} 
                    className="cp-btn cp-btn-secondary"
                  >
                    📐 Ver Fluxo BPM
                  </button>
                )}
              </div>
            </div>
            <p style={{ color: "var(--cp-text-secondary)", marginBottom: "1rem" }}>{n.desc}</p>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--cp-text-muted)", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                  ⬅️ Recebe de ({incoming.length})
                </div>
                {incoming.map((c, i) => { 
                  const src = NODES.find(nd => nd.id === c.from); 
                  return (
                    <div key={i} style={{ fontSize: "0.82rem", marginBottom: 4 }}>
                      {src?.icon} {src?.label} <span style={{ color: "var(--cp-text-muted)" }}>({c.label})</span>
                    </div>
                  ); 
                })}
                {incoming.length === 0 && <div style={{ color: "var(--cp-text-muted)", fontSize: "0.82rem" }}>Fonte primária</div>}
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--cp-text-muted)", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                  ➡️ Envia para ({outgoing.length})
                </div>
                {outgoing.map((c, i) => { 
                  const tgt = NODES.find(nd => nd.id === c.to); 
                  return (
                    <div key={i} style={{ fontSize: "0.82rem", marginBottom: 4 }}>
                      {tgt?.icon} {tgt?.label} <span style={{ color: "var(--cp-text-muted)" }}>({c.label})</span>
                    </div>
                  ); 
                })}
                {outgoing.length === 0 && <div style={{ color: "var(--cp-text-muted)", fontSize: "0.82rem" }}>Ponto final</div>}
              </div>
            </div>
          </div>
        ); 
      })()}
    </div>
  );
}

export default MapaVisual;
