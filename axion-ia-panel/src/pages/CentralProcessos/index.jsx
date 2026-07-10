import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AXHUB_SITES, AXCROSS_SITES } from '../../data/sitesData';
import { StatCard } from '../../components/common';
import QuickSelect from '../../components/QuickSelect.jsx';
import MapaVisual from './components/MapaVisual';
import PipelineEditais from '../PipelineEditais';
import FluxosDetalhados from './components/FluxosDetalhados';
import ProcessosAxHub from './components/ProcessosAxHub';
import ProcessosAxCross from './components/ProcessosAxCross';
import Acessos from './components/Acessos';
import Servicos from './components/Servicos';
import './CentralProcessos.css';

/* ===================================================================
   CENTRAL DE PROCESSOS — Ecossistema Unificado
   Consolida: Painel Processos + Mapa de Operações + Pipeline de Editais
   8 Abas: Mapa, Fluxos, Pipeline, AxHub, AxCross, Sites, Acessos, Serviços
   =================================================================== */

function CentralProcessos() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Estado — deep-link via ?tab=
  const tabFromUrl = searchParams.get('tab') || 'mapa';
  const [abaAtiva, setAbaAtiva] = useState(tabFromUrl);

  // Sincronizar URL ao trocar de aba
  useEffect(() => {
    setSearchParams(abaAtiva === 'mapa' ? {} : { tab: abaAtiva }, { replace: true });
  }, [abaAtiva]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [selectedFluxo, setSelectedFluxo] = useState(null);
  const [filtroSistema, setFiltroSistema] = useState('todos');
  const [zoom, setZoom] = useState(1);

  // Dados consolidados
  const todosSites = useMemo(() => [
    ...AXHUB_SITES.map(s => ({ ...s, sistema: 'AxHub' })),
    ...AXCROSS_SITES.map(s => ({ ...s, sistema: 'AxCross' })),
  ], []);

  const totalAtivos = todosSites.filter(s => s.status === 'ativo').length;
  const totalAxhub = todosSites.filter(s => s.sistema === 'AxHub').length;
  const totalAxcross = todosSites.filter(s => s.sistema === 'AxCross').length;

  // Props compartilhadas
  const propsComuns = {
    selectedNode,
    setSelectedNode,
    selectedPipeline,
    setSelectedPipeline,
    selectedFluxo,
    setSelectedFluxo,
    filtroSistema,
    setFiltroSistema,
    zoom,
    setZoom,
    setAbaAtiva,
    todosSites,
  };

  // Navegação contextual avançada (mapa → abas)
  const navegarParaAba = (nodeId) => {
    setSelectedNode(nodeId);
    
    // Mapeamento inteligente: nó → aba correspondente
    const mapeamentoAbas = {
      // Bancos de dados → Processos
      'axhub_db': 'axhub',
      'axcross_db': 'axcross',
      'axton_db': 'axhub', // AxTon usa processos AxHub
      
      // Serviços externos → Aba Serviços
      'jitbit': 'servicos',
      'whatsapp': 'servicos',
      'upload': 'servicos',

      // Pipeline de Editais → Aba pipeline
      'pncp': 'pipeline',
      'editais': 'pipeline',
      'conformidade': 'pipeline',

      // Processamento → Fica no Mapa (já está)
      'helpdesk': 'mapa',
      'chat': 'mapa',
      
      // Sites → OperationsHub aba Sites
      'sites': 'mapa', // sem aba própria — redireciona para OperationsHub
      
      // Conhecimento → Fica no Mapa
      'kb': 'mapa',
      'treino': 'mapa',
      'gerar_doc': 'mapa',
    };
    
    const abaDestino = mapeamentoAbas[nodeId];
    if (abaDestino && abaDestino !== 'mapa') {
      // Pequeno delay para melhor UX (mostra o nó selecionado antes de mudar)
      setTimeout(() => setAbaAtiva(abaDestino), 300);
    }
  };

  // Definição de abas
  const ABAS = [
    { id: 'mapa',     label: '🗺️ Mapa Visual',         desc: 'Diagrama interativo do ecossistema' },
    { id: 'fluxos',   label: '📐 Fluxos BPM',           desc: 'Processos passo-a-passo' },
    { id: 'pipeline', label: '🏛️ Pipeline de Editais',  desc: 'Análise → Revisão → Roadmap → Specs' },
    { id: 'axhub',    label: '🚨 AxHub',                desc: '9 módulos operacionais' },
    { id: 'axcross',  label: '🔀 AxCross',              desc: '6 módulos de monitoramento' },

    { id: 'acessos',  label: '🔑 Acessos',              desc: 'Credenciais e permissões' },
    { id: 'servicos', label: '🌐 Serviços',             desc: 'OIDC, SMTP, Azure, etc.' },
  ];

  // Renderização condicional de abas
  const renderizarConteudo = () => {
    switch (abaAtiva) {
      case 'mapa':
        return <MapaVisual {...propsComuns} navegarParaAba={navegarParaAba} />;
      case 'fluxos':
        return <FluxosDetalhados {...propsComuns} />;
      case 'pipeline':
        return <PipelineEditais />;
      case 'axhub':
        return <ProcessosAxHub {...propsComuns} />;
      case 'axcross':
        return <ProcessosAxCross {...propsComuns} />;
      case 'acessos':
        return <Acessos {...propsComuns} />;
      case 'servicos':
        return <Servicos {...propsComuns} />;
      default:
        return <MapaVisual {...propsComuns} navegarParaAba={navegarParaAba} />;
    }
  };

  return (
    <div className="cp-container">
      {/* Header */}
      <div className="cp-header">
        <div>
          <h1 className="cp-titulo">🔄 Central de Processos</h1>
          <p className="cp-subtitulo">
            Ecossistema completo: Mapa Visual, Fluxos BPM, Processos AxHub/AxCross e Serviços
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="cp-stats">
        <StatCard value={todosSites.length} label="Sites Total" />
        <StatCard value={totalAxhub} label="AxHub" color="#60a5fa" />
        <StatCard value={totalAxcross} label="AxCross" color="#f97316" />
        <StatCard value={totalAtivos} label="Ativos" color="#22c55e" />
        <StatCard value="27" label="Nós no Mapa" />
        <StatCard value="5" label="Pipelines IA" />
        <StatCard value="7" label="Fluxos BPM" />
      </div>

      {/* Navegação de abas */}
      <div style={{ padding: '8px 0 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <QuickSelect options={ABAS} value={abaAtiva} onChange={setAbaAtiva} color="#3b82f6" label="Módulo" width={260} />
        {ABAS.find(a => a.id === abaAtiva)?.desc && (
          <span style={{ fontSize: 12, color: '#9ca3af' }}>{ABAS.find(a => a.id === abaAtiva).desc}</span>
        )}
      </div>

      {/* Descrição da aba ativa */}
      <div className="cp-descricao-aba">
        <span className="cp-icone-info">ℹ️</span>
        <span>{ABAS.find(a => a.id === abaAtiva)?.desc}</span>
      </div>

      {/* Conteúdo da aba ativa */}
      <main className="cp-conteudo">
        {renderizarConteudo()}
      </main>

      {/* Footer */}
      <div className="cp-footer">
        <span>{todosSites.length} sites • {totalAtivos} ativos</span>
        <span>Última atualização: {new Date().toLocaleDateString('pt-BR')}</span>
        <span>Central de Processos v2.0.0</span>
      </div>
    </div>
  );
}

export default CentralProcessos;
