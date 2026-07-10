import React, { useState } from 'react';

/* ═══════════════════════════════════════════════════════════════════
   Componente: Processos AxHub
   9 módulos operacionais com sub-itens expandíveis
   ═══════════════════════════════════════════════════════════════════ */

const PROCESSOS_AXHUB = [
  {
    modulo: "Infrações", icone: "🚨",
    itens: [
      "Triagem (validação de infrações)",
      "Auditoria (revisão de triagens)",
      "Consulta de Infrações",
      "Exportação (envio para órgãos)",
      "Exceções (regras automáticas)",
      "Infrações Descartadas",
    ]
  },
  {
    modulo: "Operações", icone: "🔧",
    itens: [
      "Cadastro de Operações",
      "Aferições (certificados INMETRO)",
      "Faixas (monitoramento)",
      "Monitoramento Online",
      "Eventos de Equipamentos",
      "Consulta de Placas",
    ]
  },
  {
    modulo: "Equipamentos", icone: "📡",
    itens: [
      "Fabricantes",
      "Tipos de Equipamentos",
      "Modelos de Equipamentos",
      "Grupos de Equipamentos",
      "Lista de Equipamentos",
    ]
  },
  {
    modulo: "Medição", icone: "📏",
    itens: [
      "Contratos",
      "Índices de Performance",
      "Criar Medição",
      "Interrupções",
      "Medições Finalizadas",
      "Recursos",
    ]
  },
  {
    modulo: "Pesagem / Balança", icone: "⚖️",
    itens: [
      "Postos de Pesagem",
      "Tickets em Aberto",
      "Tickets Fechados",
      "Liberar Pesagem",
      "Reclassificação",
      "Motivos",
    ]
  },
  {
    modulo: "Cronotacógrafo", icone: "⏱️",
    itens: [
      "Triagem Cronotacógrafo",
      "Consulta Cronotacógrafo",
    ]
  },
  {
    modulo: "Relatórios / BI", icone: "📈",
    itens: [
      "Relatório de Infrações",
      "Eventos de Equipamentos",
      "Passagens / Fluxo",
      "Fluxo Diário",
      "Falhas Sequenciais",
      "Discrepâncias",
      "Logs de Envios",
      "Lote de Importação",
      "Power BI (dashboards)",
    ]
  },
  {
    modulo: "Veículos", icone: "🚗",
    itens: [
      "Tipos", "Espécies", "Marcas", "Modelos",
      "Cores", "Categorias", "Classificações", "Municípios",
    ]
  },
  {
    modulo: "Controle de Acesso", icone: "🔐",
    itens: [
      "Usuários", "Perfis de Acesso",
      "Permissões", "Logs de Acesso", "Restrição por IP",
    ]
  },
  {
    modulo: "Administração", icone: "⚙️",
    itens: [
      "Configurações do Sistema", "Arcos", "Enquadramentos",
      "Formas de Autuação", "Layouts de Arquivos",
      "Motivos de Descarte", "Regiões", "Sequenciais",
      "Tarjas", "Tipos de Aferições", "Tipos de Imagens",
      "Webhooks", "Configuração Power BI",
    ]
  },
];

function ProcessosAxHub({ filtroSistema, setFiltroSistema }) {
  const [expandido, setExpandido] = useState({});

  const toggleModulo = (modulo) => {
    setExpandido(prev => ({ ...prev, [modulo]: !prev[modulo] }));
  };

  const totalItens = PROCESSOS_AXHUB.reduce((a, p) => a + p.itens.length, 0);
  
  // Aplicar filtro de sistema (se necessário no futuro)
  const processosFiltrados = PROCESSOS_AXHUB;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3>🚨 Processos Operacionais - AxHub</h3>
        <div style={{ fontSize: "0.85rem", color: "var(--cp-text-secondary)" }}>
          {PROCESSOS_AXHUB.length} módulos • {totalItens} processos
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

export default ProcessosAxHub;
