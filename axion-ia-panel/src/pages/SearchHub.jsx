import React, { useState } from "react";
import { Search, Image, FileText, Activity } from "lucide-react";
import ValidationHub from "./ValidationHub";
import AnaliseImagens from "./AnaliseImagens";
import FontesPesquisa from "./FontesPesquisa";
import "./SearchHub.css";

const MAIN_TABS = [
  { 
    id: "sistemas", 
    label: "Sistemas", 
    icon: Activity,
    desc: "Validação UI/API e Visual de sites AxHub/AxCross"
  },
  { 
    id: "imagens", 
    label: "Imagens", 
    icon: Image,
    desc: "Análise, galeria, comparação e processamento em lote"
  },
  { 
    id: "documentos", 
    label: "Documentos", 
    icon: FileText,
    desc: "Fontes de pesquisa e análise de conformidade"
  }
];

export default function SearchHub() {
  const [activeMainTab, setActiveMainTab] = useState("sistemas");

  return (
    <div className="search-hub-container">
      {/* Header unificado */}
      <div className="search-hub-header">
        <div className="search-hub-title-section">
          <Search className="search-hub-icon" size={32} />
          <div>
            <h1 className="search-hub-title">Search Hub</h1>
            <p className="search-hub-subtitle">
              Central unificada de buscas e análises — Sistemas, Imagens e Documentos
            </p>
          </div>
        </div>
      </div>

      {/* Abas principais */}
      <div className="search-hub-main-tabs">
        {MAIN_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeMainTab === tab.id;
          
          return (
            <button
              key={tab.id}
              className={`search-hub-main-tab ${isActive ? "active" : ""}`}
              onClick={() => setActiveMainTab(tab.id)}
            >
              <Icon size={20} />
              <div className="search-hub-tab-content">
                <span className="search-hub-tab-label">{tab.label}</span>
                <span className="search-hub-tab-desc">{tab.desc}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Conteúdo das abas */}
      <div className="search-hub-content">
        {activeMainTab === "sistemas" && (
          <div className="search-hub-embedded">
            <ValidationHub />
          </div>
        )}

        {activeMainTab === "imagens" && (
          <div className="search-hub-embedded">
            <AnaliseImagens />
          </div>
        )}

        {activeMainTab === "documentos" && (
          <div className="search-hub-embedded">
            <FontesPesquisa />
          </div>
        )}
      </div>
    </div>
  );
}
