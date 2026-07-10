import React, { useState } from 'react';
import { Shield, Search, Activity, FileText, Database, Eye, Zap } from 'lucide-react';
import './Validacao.css';

// Importar componentes existentes (temporário)
import ValidationHub from '../ValidationHub';
import DiagnosticHub from '../DiagnosticHub';

const TABS = [
  {
    id: 'validacao',
    label: 'Validação UI/API',
    icon: Shield,
    desc: 'Validação completa de sistemas (interface e APIs)'
  },
  {
    id: 'visual',
    label: 'Validação Visual',
    icon: Eye,
    desc: 'Screenshots, comparação visual e testes de layout'
  },
  {
    id: 'diagnostico',
    label: 'Diagnósticos',
    icon: Activity,
    desc: 'Medição de equipamentos, passagens e heartbeats'
  },
  {
    id: 'health',
    label: 'Health Check',
    icon: Zap,
    desc: 'Status de disponibilidade e performance dos sites'
  },
  {
    id: 'logs',
    label: 'Logs & Queries',
    icon: FileText,
    desc: 'Consulta de logs e queries SQL personalizadas'
  },
  {
    id: 'descoberta',
    label: 'Descoberta',
    icon: Search,
    desc: 'Busca e descoberta automática de sistemas'
  }
];

export default function Validacao() {
  const [activeTab, setActiveTab] = useState('validacao');

  return (
    <div className="validacao-container">
      {/* Header */}
      <div className="validacao-header">
        <Shield className="validacao-icon" size={36} />
        <div>
          <h1 className="validacao-title">Gerenciador de Validação de Sistemas</h1>
          <p className="validacao-subtitle">
            Central unificada de validação, diagnóstico e monitoramento — AxHub, AxCross e AxTon
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="validacao-tabs">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              className={`validacao-tab ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={20} />
              <div className="validacao-tab-content">
                <span className="validacao-tab-label">{tab.label}</span>
                <span className="validacao-tab-desc">{tab.desc}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="validacao-content">
        {activeTab === 'validacao' && (
          <div className="validacao-embedded">
            <ValidationHub initialTab="ui-api" />
          </div>
        )}

        {activeTab === 'visual' && (
          <div className="validacao-embedded">
            <ValidationHub initialTab="visual" />
          </div>
        )}

        {activeTab === 'diagnostico' && (
          <div className="validacao-embedded">
            <DiagnosticHub initialType="medicao" />
          </div>
        )}

        {activeTab === 'health' && (
          <div className="validacao-embedded">
            <DiagnosticHub initialType="health" />
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="validacao-embedded">
            <DiagnosticHub initialType="logs" />
          </div>
        )}

        {activeTab === 'descoberta' && (
          <div className="validacao-descoberta">
            <div className="validacao-empty-state">
              <Search size={64} className="validacao-empty-icon" />
              <h3>Descoberta Automática de Sistemas</h3>
              <p>Funcionalidade em desenvolvimento</p>
              <p className="text-sm text-gray-500 mt-2">
                Esta aba permitirá buscar e descobrir automaticamente sistemas,
                APIs e endpoints disponíveis na rede.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
