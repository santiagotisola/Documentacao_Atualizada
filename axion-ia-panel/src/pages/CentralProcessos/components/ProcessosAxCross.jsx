import React, { useState } from 'react';

/* ═══════════════════════════════════════════════════════════════════
   Componente: Processos AxCross
   6 módulos de monitoramento com sub-itens expandíveis
   ═══════════════════════════════════════════════════════════════════ */

const PROCESSOS_AXCROSS = [
  {
    modulo: "Veículos Monitorados", icone: "🚗",
    itens: [
      "Lista de Veículos Monitorados",
      "Tipos de Ocorrências (vigência automática)",
      "Alertas em Tempo Real",
      "Classificações de Veículos",
      "Importação em Lote",
    ]
  },
  {
    modulo: "Equipamentos", icone: "📡",
    itens: [
      "Lista de Equipamentos",
      "Grupos de Equipamentos",
      "Áreas (regiões geográficas)",
      "Importação em Lote",
    ]
  },
  {
    modulo: "Monitoramento Online", icone: "🗺️",
    itens: [
      "Monitoramento em Tempo Real (SignalR)",
      "Mapa de Equipamentos (Google Maps)",
    ]
  },
  {
    modulo: "Relatórios", icone: "📈",
    itens: [
      "Passagens (filtros avançados)",
      "Mapeamento de Rotas",
      "Rastreamento de Placas",
      "Veículos Monitorados",
      "Ocorrências e Alertas",
      "PDFs Gerados",
    ]
  },
  {
    modulo: "MDF-e (Fiscal)", icone: "📄",
    itens: [
      "Painel Fiscal / Operacional",
      "OCR + SEFAZ (MDF-e)",
      "Monitoramento de Manifesto Eletrônico",
    ]
  },
  {
    modulo: "Configurações", icone: "⚙️",
    itens: [
      "Sistema", "Usuários", "Perfis",
      "Permissões", "Logs", "Sincronização",
    ]
  },
];

function ProcessosAxCross({ filtroSistema, setFiltroSistema }) {
  const [expandido, setExpandido] = useState({});

  const toggleModulo = (modulo) => {
    setExpandido(prev => ({ ...prev, [modulo]: !prev[modulo] }));
  };

  const totalItens = PROCESSOS_AXCROSS.reduce((a, p) => a + p.itens.length, 0);
  
  // Aplicar filtro de sistema (se necessário no futuro)
  const processosFiltrados = PROCESSOS_AXCROSS;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3>🔀 Processos Operacionais - AxCross</h3>
        <div style={{ fontSize: "0.85rem", color: "var(--cp-text-secondary)" }}>
          {PROCESSOS_AXCROSS.length} módulos • {totalItens} processos
        </div>
      </div>

      <div className="cp-grid">
        {processosFiltrados.map((p, idx) => (
          <div key={idx} className="cp-card" style={{ cursor: "pointer" }} onClick={() => toggleModulo(p.modulo)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <div>
                <span style={{ fontSize: "1.3rem", marginRight: "0.5rem" }}>{p.icone}</span>
                <strong style={{ fontSize: "1rem" }}>{p.modulo}</strong>
              </div>
              <span className="cp-badge">{p.itens.length}</span>
            </div>

            {expandido[p.modulo] && (
              <ul style={{ margin: 0, paddingLeft: "1.5rem", fontSize: "0.85rem", color: "var(--cp-text-secondary)", lineHeight: 1.8 }}>
                {p.itens.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
            
            {!expandido[p.modulo] && (
              <div style={{ fontSize: "0.75rem", color: "var(--cp-text-muted)", marginTop: "0.5rem" }}>
                Clique para expandir →
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProcessosAxCross;
