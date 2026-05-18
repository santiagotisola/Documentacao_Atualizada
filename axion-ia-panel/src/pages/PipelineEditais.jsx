/**
 * PipelineEditais.jsx — Ecossistema Unificado de Editais
 * Fluxo completo: Análise de Editais (busca + decomposição + multi-produto) → Conformidade → Revisão → Roadmap → Specs
 */

import { useState } from "react";
import Conformidade from "./Conformidade";
import AnaliseEditalAvancada from "./AnaliseEditalAvancada";
import ConfidencaRevisao from "./ConfidencaRevisao";
import Roadmap from "./Roadmap";
import Specs from "./Specs";

const ETAPAS = [
  { id: "avancada",     label: "Análise de Editais",  icon: "📊", desc: "Busque, analise e compare — decomposição, de-para, concorrentes, mercado e multi-produto" },
  { id: "conformidade", label: "Conformidade",        icon: "📋", desc: "Análise detalhada de conformidade por produto individual" },
  { id: "revisao",      label: "Revisão",             icon: "✅", desc: "Revise itens de baixa confiança" },
  { id: "roadmap",      label: "Roadmap",             icon: "🗺️", desc: "Planeje implementação das lacunas" },
  { id: "specs",        label: "Specs",               icon: "📐", desc: "Gere especificações técnicas (PRD)" },
];

export default function PipelineEditais() {
  const [etapa, setEtapa] = useState("avancada");

  const etapaAtual = ETAPAS.find(e => e.id === etapa);
  const idxAtual = ETAPAS.findIndex(e => e.id === etapa);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      {/* Pipeline steps */}
      <div style={{ padding: "16px 20px 0", flexShrink: 0 }}>
        <div style={{
          display: "flex",
          gap: 2,
          padding: "12px 0",
          overflowX: "auto",
          borderBottom: "1px solid #e5e7eb",
        }}>
          {ETAPAS.map((e, i) => {
            const isActive = e.id === etapa;
            const isPast = i < idxAtual;
            return (
              <div key={e.id} style={{ display: "flex", alignItems: "center" }}>
                <button
                  onClick={() => setEtapa(e.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: isActive ? "2px solid #2563eb" : "1px solid transparent",
                    background: isActive ? "#eff6ff" : isPast ? "#f0fdf4" : "#f9fafb",
                    color: isActive ? "#1d4ed8" : isPast ? "#16a34a" : "#6b7280",
                    cursor: "pointer",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 13,
                    whiteSpace: "nowrap",
                    transition: "all 0.15s",
                  }}
                  title={e.desc}
                >
                  <span style={{ fontSize: 16 }}>{isPast ? "✓" : e.icon}</span>
                  <span>{e.label}</span>
                </button>
                {i < ETAPAS.length - 1 && (
                  <span style={{ color: "#d1d5db", fontSize: 14, margin: "0 2px", userSelect: "none" }}>›</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Step description */}
        <div style={{
          padding: "10px 0 12px",
          fontSize: 13,
          color: "#64748b",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <span style={{ fontSize: 18 }}>{etapaAtual.icon}</span>
          <span><strong>{etapaAtual.label}</strong> — {etapaAtual.desc}</span>
          <span style={{
            marginLeft: "auto",
            fontSize: 11,
            padding: "2px 10px",
            borderRadius: 10,
            background: "#f1f5f9",
            color: "#475569",
          }}>
            Etapa {idxAtual + 1} de {ETAPAS.length}
          </span>
        </div>
      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflow: "auto", padding: "0 20px 20px" }}>
        {etapa === "avancada"     && <AnaliseEditalAvancada embedded />}
        {etapa === "conformidade" && <Conformidade embedded />}
        {etapa === "revisao"      && <ConfidencaRevisao embedded />}
        {etapa === "roadmap"      && <Roadmap embedded />}
        {etapa === "specs"        && <Specs embedded />}
      </div>
    </div>
  );
}
