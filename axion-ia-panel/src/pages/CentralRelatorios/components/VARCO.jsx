import { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';

const VARCO = ({ metricas, setMetricas }) => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => { 
    setTimeout(() => {
      setMetricas(prev => ({ ...prev, equipamentosMonitorados: 72 }));
      setLoading(false);
    }, 500);
  }, [setMetricas]);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
        <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", marginBottom: "1rem" }} />
        <p>Carregando VARCO Monitor...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="varco">
      <h2>📡 VARCO Monitor — Análise Completa</h2>
      <p style={{color:'#64748b',marginBottom:'1.5rem'}}>
        Ferramenta completa de análise e auditoria de configurações da frota ITScam 450 — SETRANS-GO
      </p>

      {/* Alerta para usar componente dedicado */}
      <div style={{ 
        padding: "1.5rem", 
        background: "rgba(96,205,255,0.06)", 
        border: "1px solid rgba(96,205,255,0.18)", 
        borderRadius: "8px", 
        marginBottom: "1.5rem" 
      }}>
        <div style={{ fontSize: "14px", fontWeight: 600, color: "#667eea", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ExternalLink size={16} />
          🔧 Painel Completo Disponível
        </div>
        <div style={{ fontSize: "13px", color: "#475569", lineHeight: "1.7" }}>
          <p style={{ margin: "0 0 0.75rem 0" }}>
            O <strong style={{ color: "#1e293b" }}>VARCO Monitor</strong> possui um painel dedicado com recursos avançados de análise e auditoria de configurações:
          </p>
          <ul style={{ margin: "0 0 0.75rem 0", paddingLeft: "1.25rem", listStyleType: "disc" }}>
            <li><strong>Auditoria Completa:</strong> Análise de Firmware, OCR, Classificador, VARCO, NTP, Transições Diurno/Noturno, FTP, IO Ports, SNMP, Video</li>
            <li><strong>Consenso de Frota:</strong> Identifica conformes vs divergentes por votação de maioria</li>
            <li><strong>Agrupamento Inteligente:</strong> Equipamentos com mesmas divergências agrupados automaticamente</li>
            <li><strong>Plano de Correção:</strong> Geração automatizada com severidade (Crítico, Alto, Médio, Baixo)</li>
            <li><strong>Comandos de Correção:</strong> Scripts prontos para aplicação via API REST</li>
            <li><strong>Túneis VARCO:</strong> Links diretos para acesso aos Equipamentos (https://[UUID]-80.tunnel.varco.cloud)</li>
            <li><strong>Análise vs Padrão:</strong> 26 regras de Validação contra Configuração de referência</li>
            <li><strong>Inventário Completo:</strong> Status online/offline com detalhes técnicos</li>
          </ul>
          <div style={{ 
            padding: "1rem", 
            background: "white", 
            borderRadius: "6px", 
            border: "1px solid #e2e8f0",
            marginTop: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div>
              <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "0.25rem" }}>
                Acesse o painel completo:
              </div>
              <code style={{ 
                fontSize: "14px", 
                fontWeight: 600, 
                color: "#667eea",
                fontFamily: "monospace"
              }}>
                /varco-monitor
              </code>
            </div>
            <a 
              href="/varco-monitor" 
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                padding: "0.75rem 1.5rem",
                background: "#667eea",
                color: "white",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              Abrir Painel <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Visão resumida para esta aba */}
      <div style={{background:'white',padding:'1.5rem',borderRadius:'8px',marginBottom:'1.5rem'}}>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "15px", color: "#1e293b" }}>
          📊 Resumo Rápido — Frota ITScam 450
        </h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:'1rem'}}>
          <div style={{textAlign:'center',padding:'1.25rem',background:'#f0fdf4',borderRadius:'8px',border:'1px solid #bbf7d0'}}>
            <div style={{fontSize:'2.5rem',fontWeight:'bold',color:'#10b981',marginBottom:'0.25rem'}}>68</div>
            <div style={{color:'#64748b',fontSize:'12px',fontWeight:'500'}}>Online</div>
          </div>
          <div style={{textAlign:'center',padding:'1.25rem',background:'#fef2f2',borderRadius:'8px',border:'1px solid #fecaca'}}>
            <div style={{fontSize:'2.5rem',fontWeight:'bold',color:'#ef4444',marginBottom:'0.25rem'}}>4</div>
            <div style={{color:'#64748b',fontSize:'12px',fontWeight:'500'}}>Offline</div>
          </div>
          <div style={{textAlign:'center',padding:'1.25rem',background:'#eff6ff',borderRadius:'8px',border:'1px solid #bfdbfe'}}>
            <div style={{fontSize:'2.5rem',fontWeight:'bold',color:'#667eea',marginBottom:'0.25rem'}}>94.4%</div>
            <div style={{color:'#64748b',fontSize:'12px',fontWeight:'500'}}>Disponibilidade</div>
          </div>
          <div style={{textAlign:'center',padding:'1.25rem',background:'#fef9e7',borderRadius:'8px',border:'1px solid #fed7aa'}}>
            <div style={{fontSize:'2.5rem',fontWeight:'bold',color:'#f59e0b',marginBottom:'0.25rem'}}>72</div>
            <div style={{color:'#64748b',fontSize:'12px',fontWeight:'500'}}>Total Dispositivos</div>
          </div>
        </div>
      </div>

      {/* Recursos do painel completo */}
      <div style={{background:'white',padding:'1.5rem',borderRadius:'8px'}}>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "15px", color: "#1e293b" }}>
          🚀 Recursos do Painel Completo
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          {[
            { icon: "🔍", title: "Auditoria & Correções", desc: "Análise detalhada de 50+ parâmetros com plano de ação e insights de campo" },
            { icon: "🎯", title: "vs Padrão", desc: "26 regras de validação contra configuração ideal com REST API Client" },
            { icon: "👥", title: "Grupos", desc: "Agrupamento inteligente de equipamentos com divergências idênticas" },
            { icon: "📋", title: "Inventário", desc: "Status completo: online/offline, firmware, UUID, túnel VARCO" },
            { icon: "⚡", title: "Comandos", desc: "Scripts de correção automatizada: corrigir.mjs, corrigir-grupo.mjs" },
            { icon: "🔐", title: "Túneis VARCO", desc: "Acesso direto aos equipamentos via UUID-80.tunnel.varco.cloud" }
          ].map((feature, i) => (
            <div key={i} style={{ 
              padding: "1.25rem", 
              background: "#f8f9fc", 
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              transition: "all 0.2s",
              cursor: "pointer"
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{feature.icon}</div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b", marginBottom: "0.5rem" }}>
                {feature.title}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", lineHeight: "1.5" }}>
                {feature.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Credenciais de acesso */}
      <div style={{ 
        marginTop: "1.5rem",
        padding: "1.25rem", 
        background: "rgba(16,185,129,0.05)", 
        border: "1px solid rgba(16,185,129,0.2)", 
        borderRadius: "8px"
      }}>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#059669", marginBottom: "0.5rem" }}>
          🔐 Credenciais de Acesso aos Túneis VARCO
        </div>
        <div style={{ fontSize: "12px", color: "#475569", display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <div>
            <span style={{ color: "#64748b" }}>Login</span>{" "}
            <code style={{ 
              background: "rgba(255,255,255,0.7)", 
              padding: "2px 8px", 
              borderRadius: "4px", 
              color: "#1e293b", 
              fontWeight: 600,
              fontSize: "13px"
            }}>Admin</code>
          </div>
          <div>
            <span style={{ color: "#64748b" }}>Senha:</span>{" "}
            <code style={{ 
              background: "rgba(255,255,255,0.7)", 
              padding: "2px 8px", 
              borderRadius: "4px", 
              color: "#1e293b", 
              fontWeight: 600,
              fontSize: "13px"
            }}>#econocr@</code>
          </div>
        </div>
        <div style={{ fontSize: "11px", color: "#64748b", marginTop: "0.5rem" }}>
          Use essas credenciais para acessar a interface web dos equipamentos através dos links com UUID
        </div>
      </div>
    </div>
  );
};

export default VARCO;