import React, { useState } from 'react';

/* ═══════════════════════════════════════════════════════════════════
   Componente: Fluxos Detalhados (BPM)
   7 fluxos de processo mapeados passo-a-passo com diagramas SVG
   ═══════════════════════════════════════════════════════════════════ */

const FLUXOS_DETALHADOS = [
  {
    id: "infracao", titulo: "Processo de Infração (Início → Exportação)", sistema: "AxHub", cor: "#3b82f6",
    descricao: "Fluxo completo desde a captura da imagem pelo equipamento até a exportação do auto de infração para o órgão autuador.",
    etapas: [
      { passo: 1, nome: "Captura", descricao: "Equipamento de campo detecta infração e captura imagens (frontal, traseira, panorâmica)", ator: "Equipamento", local: "Operações - Monitoramento Online" },
      { passo: 2, nome: "Recepção", descricao: "Sistema recebe passagem via API/FTP e armazena no banco com metadados (velocidade, data, faixa)", ator: "Sistema", local: "Automático (background)" },
      { passo: 3, nome: "OCR", descricao: "Pipeline de reconhecimento de placas processa as imagens e extrai caracteres", ator: "Sistema", local: "Automático" },
      { passo: 4, nome: "Triagem", descricao: "Operador analisa infração: valida placa, verifica enquadramento, confere imagens, aprova ou descarta", ator: "Operador", local: "Infrações - Triagem" },
      { passo: 5, nome: "Exceções", descricao: "Regras automáticas descartam infrações (veículos oficiais, placas em whitelist, horários especiais)", ator: "Sistema", local: "Infrações - Exceções" },
      { passo: 6, nome: "Auditoria", descricao: "Auditor revisa infrações triadas por amostragem - valida qualidade do trabalho do operador", ator: "Auditor", local: "Infrações - Auditoria" },
      { passo: 7, nome: "Exportação", descricao: "Lote de infrações validadas é exportado no layout do órgão (DETRAN/Município) via arquivo ou API", ator: "Sistema/Operador", local: "Infrações - Exportação" },
      { passo: 8, nome: "Confirmação", descricao: "Órgão confirma recebimento - logs de envio registram sucesso/falha por lote", ator: "Órgão Externo", local: "Relatórios - Logs de Envios" },
    ]
  },
  {
    id: "pesagem", titulo: "Processo de Pesagem Veicular (Balança)", sistema: "AxHub / AxTon", cor: "#10b981",
    descricao: "Fluxo de pesagem em postos rodoviários - do momento que o veículo entra na balança até o fechamento do ticket.",
    etapas: [
      { passo: 1, nome: "Entrada no Posto", descricao: "Veículo é direcionado para a balança. Sistema inicia leitura de peso e captura de placa", ator: "Operador/Sistema", local: "Pesagem - Postos" },
      { passo: 2, nome: "Leitura de Peso", descricao: "Balança registra peso bruto. Sistema compara com PBT permitido para o tipo de veículo", ator: "Sistema", local: "Automático (sensor)" },
      { passo: 3, nome: "Classificação", descricao: "Veículo é classificado automaticamente por tipo/eixos. Operador pode reclassificar se necessário", ator: "Sistema/Operador", local: "Pesagem - Reclassificação" },
      { passo: 4, nome: "Abertura de Ticket", descricao: "Ticket de pesagem é criado com dados: placa, peso, classificação, fotos, horário", ator: "Sistema", local: "Pesagem - Tickets em Aberto" },
      { passo: 5, nome: "Verificação", descricao: "Se excesso de peso: calcular percentual acima do permitido. Se dentro: liberação imediata", ator: "Operador", local: "Pesagem - Tickets em Aberto" },
      { passo: 6, nome: "Liberação/Retenção", descricao: "Veículo regular: liberar. Excesso: reter para transbordo ou autuação", ator: "Operador", local: "Pesagem - Liberar Pesagem" },
      { passo: 7, nome: "Fechamento", descricao: "Ticket fechado com resultado final: liberado, autuado, ou reclassificado", ator: "Operador", local: "Pesagem - Tickets Fechados" },
    ]
  },
  {
    id: "monitoramento", titulo: "Processo de Monitoramento Online (AxCross)", sistema: "AxCross", cor: "#f97316",
    descricao: "Fluxo de cruzamento de placas em tempo real - da passagem do veículo até o disparo de alertas.",
    etapas: [
      { passo: 1, nome: "Passagem", descricao: "Veículo passa por câmera OCR. Sistema captura placa, data/hora, local, imagem", ator: "Equipamento", local: "Automático (campo)" },
      { passo: 2, nome: "Reconhecimento OCR", descricao: "Placa é processada pelo engine OCR. Resultado com confiança é registrado", ator: "Sistema", local: "Automático" },
      { passo: 3, nome: "Cruzamento", descricao: "Placa reconhecida é comparada em tempo real com base de veículos monitorados", ator: "Sistema (SignalR)", local: "Monitoramento Online" },
      { passo: 4, nome: "Match/Alerta", descricao: "Se placa consta na base: alerta é disparado com tipo de ocorrência (furto, mandado, etc.)", ator: "Sistema", local: "Veículos Monitorados - Alertas" },
      { passo: 5, nome: "Notificação", descricao: "Operador recebe alerta visual/sonoro no painel. Informações do veículo e ocorrência são exibidas", ator: "Operador", local: "Monitoramento Online - Mapa" },
      { passo: 6, nome: "Ação", descricao: "Operador aciona equipe de campo para abordagem ou registra ocorrência no relatório", ator: "Operador/Campo", local: "Relatórios - Ocorrências e Alertas" },
      { passo: 7, nome: "Registro", descricao: "Passagem e ação tomada são registradas para auditoria e relatórios futuros", ator: "Sistema", local: "Relatórios - Passagens" },
    ]
  },
  {
    id: "medicao", titulo: "Processo de Medição Contratual", sistema: "AxHub", cor: "#8b5cf6",
    descricao: "Fluxo de medição de performance dos equipamentos para faturamento - do contrato até a medição final.",
    etapas: [
      { passo: 1, nome: "Contrato", descricao: "Cadastro do contrato com: cliente, vigência, equipamentos vinculados, índices mínimos", ator: "Gerente", local: "Medição - Contratos" },
      { passo: 2, nome: "Índices de Performance", descricao: "Definição dos KPIs: disponibilidade mínima (%), OCR mínimo (%), uptime esperado", ator: "Gerente", local: "Medição - Índices de Performance" },
      { passo: 3, nome: "Coleta Automática", descricao: "Sistema calcula diariamente: heartbeats, passagens, falhas, disponibilidade por equipamento", ator: "Sistema", local: "Automático (cron)" },
      { passo: 4, nome: "Registrar Interrupções", descricao: "Eventos que justificam indisponibilidade: manutenção preventiva, vandalismo, quedas de energia", ator: "Operador", local: "Medição - Interrupções" },
      { passo: 5, nome: "Criar Medição", descricao: "Gerar medição do período: sistema consolida dados e aplica descontos por indisponibilidade", ator: "Gerente/Sistema", local: "Medição - Criar Medição" },
      { passo: 6, nome: "Revisão", descricao: "Conferência dos valores: total de dias, disponibilidade real vs mínima, penalidades aplicadas", ator: "Gerente", local: "Medição - Medições Finalizadas" },
      { passo: 7, nome: "Finalização", descricao: "Medição aprovada - gera relatório para faturamento - exporta para financeiro", ator: "Gerente", local: "Medição - Medições Finalizadas" },
    ]
  },
  {
    id: "helpdesk-flow", titulo: "Processo de Atendimento Helpdesk (com IA)", sistema: "AxionIA + Jitbit", cor: "#ec4899",
    descricao: "Fluxo completo de atendimento ao cliente - do chamado até a resolução com assistência de IA.",
    etapas: [
      { passo: 1, nome: "Abertura", descricao: "Cliente abre chamado via Jitbit (e-mail, portal) ou via WhatsApp. Ticket é criado com assunto e descrição", ator: "Cliente", local: "Jitbit / WhatsApp" },
      { passo: 2, nome: "Polling", descricao: "AxionIA faz polling a cada 2 minutos e puxa novos tickets não respondidos", ator: "Sistema (cron)", local: "Automático" },
      { passo: 3, nome: "Classificação IA", descricao: "Engine classifica o ticket: produto (AxHub/AxTon/AxCross), categoria, prioridade, site", ator: "IA", local: "Helpdesk - Classificar" },
      { passo: 4, nome: "Busca KB", descricao: "IA busca na Knowledge Base por resposta similar (cosine similarity > 0.7)", ator: "IA", local: "Knowledge Base (embeddings)" },
      { passo: 5, nome: "Geração de Resposta", descricao: "Se KB encontrou: usa resposta existente. Se não: GPT-4o gera resposta com contexto do produto", ator: "IA", local: "Engine - GPT-4o" },
      { passo: 6, nome: "Fila de Revisão", descricao: "Resposta sugerida vai para fila de aprovação humana. Técnico pode editar, aprovar ou rejeitar", ator: "Técnico", local: "Helpdesk - Fila de Revisão" },
      { passo: 7, nome: "Envio", descricao: "Após aprovação: resposta é postada no Jitbit como comentário. Cliente é notificado", ator: "Sistema", local: "Jitbit (API)" },
      { passo: 8, nome: "SLA", descricao: "Métricas de tempo de resposta são calculadas por prioridade e site para compliance report", ator: "Sistema", local: "SLA Compliance" },
    ]
  },
  {
    id: "operacao", titulo: "Processo de Operação de Equipamento", sistema: "AxHub", cor: "#f59e0b",
    descricao: "Fluxo de cadastro e gestão de operações de equipamentos de campo - da instalação ao monitoramento.",
    etapas: [
      { passo: 1, nome: "Cadastro de Equipamento", descricao: "Registrar equipamento: fabricante, modelo, grupo, número de série, configurações", ator: "Gerente", local: "Equipamentos - Lista" },
      { passo: 2, nome: "Aferição", descricao: "Registrar certificado INMETRO: data da aferição, validade, número do certificado, portaria", ator: "Operador", local: "Operações - Aferições" },
      { passo: 3, nome: "Cadastro de Operação", descricao: "Criar operação: vincular equipamento, definir local (lat/lng), velocidade regulamentada, faixas", ator: "Operador", local: "Operações - Cadastro" },
      { passo: 4, nome: "Ativação", descricao: "Operação é ativada - equipamento começa a registrar passagens e gerar eventos", ator: "Operador", local: "Operações - Cadastro" },
      { passo: 5, nome: "Monitoramento", descricao: "Painel em tempo real mostra heartbeat, últimas passagens, status de comunicação", ator: "Operador", local: "Operações - Monitoramento Online" },
      { passo: 6, nome: "Eventos", descricao: "Sistema registra eventos: offline, sem comunicação, falha de câmera, energia", ator: "Sistema", local: "Operações - Eventos de Equipamentos" },
      { passo: 7, nome: "Manutenção", descricao: "Quando evento crítico: técnico é acionado, registra interrupção na medição", ator: "Técnico", local: "Medição - Interrupções" },
    ]
  },
];

function FluxosDetalhados({ selectedFluxo, setSelectedFluxo, setSelectedNode, setAbaAtiva }) {
  // Usa selectedFluxo do container (estado compartilhado)
  const fluxoAberto = selectedFluxo;
  
  // Mapeamento: fluxo → nó do mapa relacionado
  const getNoRelacionado = (fluxoId) => {
    const mapeamento = {
      'infracao': 'analise_img',
      'pesagem': 'axton_db',
      'monitoramento': 'axcross_db',
      'medicao': 'dashboards',
      'helpdesk-flow': 'helpdesk',
      'operacao': 'dashboards',
    };
    return mapeamento[fluxoId];
  };

  if (fluxoAberto) {
    const f = FLUXOS_DETALHADOS.find(fl => fl.id === fluxoAberto);
    const svgW = Math.max(f.etapas.length * 280 + 80, 1400);
    const svgH = 360;
    const noRelacionado = getNoRelacionado(fluxoAberto);

    return (
      <div>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <button onClick={() => setSelectedFluxo(null)} className="cp-btn cp-btn-secondary">
            ← Voltar aos fluxos
          </button>
          {noRelacionado && (
            <button 
              onClick={() => { 
                setSelectedNode(noRelacionado); 
                setAbaAtiva('mapa'); 
              }} 
              className="cp-btn cp-btn-secondary"
            >
              🗺️ Ver no Mapa Visual
            </button>
          )}
        </div>
        
        <div style={{ borderLeft: `3px solid ${f.cor}`, paddingLeft: "1rem", marginBottom: "1rem" }}>
          <h3 style={{ color: f.cor, margin: "0 0 0.3rem" }}>{f.titulo}</h3>
          <p style={{ color: "var(--cp-text-secondary)", margin: "0 0 0.5rem" }}>{f.descricao}</p>
          <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.8rem", color: "var(--cp-text-muted)" }}>
            <span>🏷️ {f.sistema}</span>
            <span>📊 {f.etapas.length} etapas</span>
          </div>
        </div>

        {/* MAPA VISUAL DO PROCESSO (SVG flowchart) */}
        <div className="cp-card" style={{ marginBottom: "1.5rem", padding: "1rem" }}>
          <div style={{ fontSize: "1rem", marginBottom: "1rem", fontWeight: 700 }}>📐 MAPA VISUAL DO FLUXO</div>
          <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: "100%", minWidth: 1100, height: "auto", maxHeight: "500px" }}>
            <defs>
              <marker id="flow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M0 0L10 5L0 10z" fill={f.cor} opacity="1" />
              </marker>
              <filter id="text-shadow">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.8" floodColor="#000" />
              </filter>
            </defs>
            {f.etapas.map((e, i) => {
              const cx = 140 + i * 280;
              const cy = 180;
              const isFirst = i === 0;
              const isLast = i === f.etapas.length - 1;
              const isSystem = e.ator === "Sistema" || e.ator === "IA" || e.ator === "Sistema (cron)" || e.ator === "Sistema (SignalR)";
              const nodeShape = isFirst ? "start" : isLast ? "end" : isSystem ? "auto" : "manual";
              const nodeWidth = 180;
              const nodeHeight = 80;
              return (
                <g key={i}>
                  {/* Connection arrow */}
                  {i > 0 && <line x1={140 + (i-1) * 280 + nodeWidth/2} y1={cy} x2={cx - nodeWidth/2 - 10} y2={cy} stroke={f.cor} strokeWidth="4" opacity="0.8" markerEnd="url(#flow-arrow)" />}
                  
                  {/* Node background */}
                  {nodeShape === "start" && <circle cx={cx} cy={cy} r={50} fill={`${f.cor}40`} stroke={f.cor} strokeWidth="4" />}
                  {nodeShape === "end" && <><circle cx={cx} cy={cy} r={50} fill={`${f.cor}40`} stroke={f.cor} strokeWidth="4" /><circle cx={cx} cy={cy} r={42} fill="none" stroke={f.cor} strokeWidth="3" /></>}
                  {nodeShape === "auto" && <rect x={cx - nodeWidth/2} y={cy - nodeHeight/2} width={nodeWidth} height={nodeHeight} rx={12} fill={`${f.cor}25`} stroke={f.cor} strokeWidth="3" strokeDasharray="8 4" />}
                  {nodeShape === "manual" && <rect x={cx - nodeWidth/2} y={cy - nodeHeight/2} width={nodeWidth} height={nodeHeight} rx={12} fill={`${f.cor}30`} stroke={f.cor} strokeWidth="3" />}
                  
                  {/* Step number badge */}
                  <circle cx={cx - 70} cy={cy - 35} r={18} fill={f.cor} stroke="#fff" strokeWidth="2" />
                  <text x={cx - 70} y={cy - 28} textAnchor="middle" fontSize="20" fill="#fff" fontWeight="900">{e.passo}</text>
                  
                  {/* Label background para melhor legibilidade */}
                  <rect x={cx - 85} y={cy - 12} width={170} height={28} rx={6} fill="rgba(0,0,0,0.6)" />
                  
                  {/* Label (nome da etapa) */}
                  <text x={cx} y={cy + 6} textAnchor="middle" fontSize="18" fill="#ffffff" fontWeight="800" filter="url(#text-shadow)">
                    {e.nome.length > 18 ? e.nome.slice(0, 17) + ".." : e.nome}
                  </text>
                  
                  {/* Actor label com background */}
                  <rect x={cx - 75} y={cy + 60} width={150} height={30} rx={6} fill="rgba(15,23,42,0.95)" stroke={f.cor} strokeWidth="1.5" />
                  <text x={cx} y={cy + 80} textAnchor="middle" fontSize="15" fill="#fff" fontWeight="700">{e.ator}</text>
                </g>
              );
            })}
            
            {/* Legend */}
            <g transform="translate(20, 20)">
              <rect x="0" y="0" width="380" height="80" rx="10" fill="rgba(15,23,42,0.95)" stroke={f.cor} strokeWidth="2" />
              <text x="15" y="28" fontSize="16" fill="#fff" fontWeight="900">LEGENDA:</text>
              
              <rect x="15" y="42" width="20" height="20" rx="8" fill={`${f.cor}25`} stroke={f.cor} strokeWidth="2.5" strokeDasharray="6 3" />
              <text x="45" y="57" fontSize="15" fill="#fff" fontWeight="700">Automático</text>
              
              <rect x="145" y="42" width="20" height="20" rx="4" fill={`${f.cor}30`} stroke={f.cor} strokeWidth="2.5" />
              <text x="175" y="57" fontSize="15" fill="#fff" fontWeight="700">Manual</text>
              
              <circle cx="285" cy="52" r="10" fill={`${f.cor}40`} stroke={f.cor} strokeWidth="2.5" />
              <text x="305" y="57" fontSize="15" fill="#fff" fontWeight="700">Início/Fim</text>
            </g>
          </svg>
        </div>

        {/* TIMELINE DETALHADA */}
        <div style={{ fontSize: "0.75rem", color: "var(--cp-text-muted)", marginBottom: "0.5rem", fontWeight: 600, textTransform: "uppercase" }}>
          Detalhamento por Etapa
        </div>
        <div style={{ position: "relative", paddingLeft: "2rem" }}>
          {f.etapas.map((e, i) => (
            <div 
              key={i} 
              style={{ 
                position: "relative", 
                paddingBottom: i < f.etapas.length - 1 ? "1.5rem" : 0, 
                borderLeft: i < f.etapas.length - 1 ? `2px solid ${f.cor}40` : "none", 
                paddingLeft: "1.5rem", 
                marginLeft: "0.5rem" 
              }}
            >
              <div style={{ 
                position: "absolute", 
                left: "-0.55rem", 
                top: "0.15rem", 
                width: "1rem", 
                height: "1rem", 
                borderRadius: "50%", 
                background: f.cor, 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                fontSize: "0.6rem", 
                color: "#fff", 
                fontWeight: 700 
              }}>
                {e.passo}
              </div>
              <div className="cp-card" style={{ padding: "0.75rem 1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                  <strong style={{ fontSize: "0.9rem" }}>{e.nome}</strong>
                  <span className="cp-badge" style={{ background: "var(--cp-bg-muted)" }}>{e.ator}</span>
                </div>
                <p style={{ color: "var(--cp-text-secondary)", fontSize: "0.82rem", margin: "0 0 0.3rem", lineHeight: 1.5 }}>
                  {e.descricao}
                </p>
                <div style={{ fontSize: "0.75rem", color: f.cor }}>📍 {e.local}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Vista de Grade (todos os fluxos)
  return (
    <div>
      <h3 style={{ marginBottom: "1rem" }}>📐 Fluxos de Processo Detalhados (BPM) - {FLUXOS_DETALHADOS.length} processos mapeados</h3>
      <div className="cp-grid">
        {FLUXOS_DETALHADOS.map(f => (
          <div 
            key={f.id} 
            className="cp-card" 
            style={{ cursor: "pointer", borderLeft: `3px solid ${f.cor}` }} 
            onClick={() => setSelectedFluxo(f.id)}
          >
            <h4 style={{ color: f.cor, marginBottom: "0.5rem" }}>{f.titulo}</h4>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
              <span className={`cp-badge cp-badge-${f.sistema.includes("AxCross") ? "axcross" : "axhub"}`}>
                {f.sistema}
              </span>
              <span className="cp-badge">{f.etapas.length} etapas</span>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--cp-text-secondary)", margin: 0 }}>{f.descricao}</p>
            <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
              {f.etapas.slice(0, 4).map((e, i) => (
                <span key={i} className="cp-badge" style={{ background: `${f.cor}20`, color: f.cor }}>
                  {e.nome}
                </span>
              ))}
              {f.etapas.length > 4 && (
                <span style={{ color: "var(--cp-text-muted)", fontSize: "0.7rem" }}>+{f.etapas.length - 4}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FluxosDetalhados;
