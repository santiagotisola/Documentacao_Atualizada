import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AXHUB_SITES, AXCROSS_SITES } from '../../data/sitesData';
import { useSiteContext } from '../../context/SiteContext.jsx';
import { api } from '../../services/api';
import { calcHealthScore } from '../../utils/siteUtils';
import './CentralSites.css';

// Importar componentes das abas — originais
import VisaoGeral from './components/VisaoGeral';
import ListaGeral from './components/ListaGeral';
import Comparativo from './components/Comparativo';
import GuiaDetalhado from './components/GuiaDetalhado';
import CredenciaisSites from './components/CredenciaisSites';

// Importar componentes novos v3.0
import DashboardExecutivo from './components/DashboardExecutivo';
import ComparadorGlobal from './components/ComparadorGlobal';
import Timeline from './components/Timeline';
import Performance from './components/Performance';
import OCRSites from './components/OCRSites';
import EquipamentosSites from './components/EquipamentosSites';
import APISites from './components/APISites';
import IAInsights from './components/IAInsights';
import IndicadoresSites from './components/IndicadoresSites';
import ConformidadeSites from './components/ConformidadeSites';
import HealthCheck from './components/HealthCheck';
import AuditoriaSites from './components/AuditoriaSites';
import SegurancaSites from './components/SegurancaSites';

/* ═══════════════════════════════════════════════════════════════════
   CENTRAL DE SITES — Container Único
   Todas as funcionalidades de sites em um único local
   ═══════════════════════════════════════════════════════════════════ */

function CentralSites() {
  const { setSite, activeSite } = useSiteContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // ─── Estado da navegação — suporta ?tab= para deep-link ───────
  const tabFromUrl = searchParams.get('tab') || 'dashboard';
  const [abaAtiva, setAbaAtiva] = useState(tabFromUrl);

  // Redirecionar ?tab=chamados para o Helpdesk unificado + sincronizar URL → estado
  useEffect(() => {
    if (tabFromUrl === 'chamados') {
      navigate('/central-atendimento?tab=helpdesk', { replace: true });
      return;
    }
    if (tabFromUrl && tabFromUrl !== abaAtiva) {
      setAbaAtiva(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Sincronizar estado → URL ao trocar de aba
  useEffect(() => {
    if (abaAtiva === 'chamados') return;
    setSearchParams({ tab: abaAtiva }, { replace: true });
  }, [abaAtiva]);

  // ─── Dados dinâmicos — chamados por site (de /helpdesk/sites-overview) ───
  const [chamadosData, setChamadosData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // ─── Versões ao vivo capturadas de cada site ─────────────────────────────
  const [liveVersions, setLiveVersions] = useState({}); // { siteId: 'v.1.2.5' }
  const [isFetchingVersions, setIsFetchingVersions] = useState(false);
  const [versionsProgress, setVersionsProgress] = useState({ ok: 0, total: 0 });

  const buscarVersoes = useCallback(async () => {
    setIsFetchingVersions(true);
    setVersionsProgress({ ok: 0, total: 0 });
    try {
      // 1. Inicia o job no backend
      const inicio = await api.post('/sites/versions');
      if (inicio.data?.status === 'em_andamento') {
        // Job já estava rodando — usa resultados parciais
        const parcial = {};
        (inicio.data.resultados || []).forEach(r => { if (r.versao) parcial[r.id] = r.versao; });
        setLiveVersions(prev => ({ ...prev, ...parcial }));
        setVersionsProgress(inicio.data.progresso || { ok: 0, total: 0 });
      }

      // 2. Polling a cada 3s até concluir
      const poll = async () => {
        try {
          const status = await api.get('/sites/versions/status');
          const { progresso, resultados, status: s } = status.data;
          const mapa = {};
          (resultados || []).forEach(r => { if (r.versao) mapa[r.id] = r.versao; });
          setLiveVersions(prev => ({ ...prev, ...mapa }));
          setVersionsProgress(progresso || { ok: 0, total: 0 });
          if (s === 'em_andamento') {
            setTimeout(poll, 3000);
          } else {
            setIsFetchingVersions(false);
          }
        } catch (_) {
          setIsFetchingVersions(false);
        }
      };

      setTimeout(poll, 3000);
    } catch (_) {
      setIsFetchingVersions(false);
    }
  }, []);

  // ─── Dados ao vivo de equipamentos (sobrepõem dados estáticos quando disponíveis) ──
  const [liveEquipData, setLiveEquipData] = useState({}); // { siteId: { total, online, ... } }
  const [isSyncingEquip, setIsSyncingEquip] = useState(false);
  const [lastSyncEquip, setLastSyncEquip] = useState(null);
  const autoRefreshRef = useRef(null);

  // ─── Extrai credenciais do campo observações (padrão: "Credencial: user/senha") ──
  const extrairCredencial = useCallback((observacoes) => {
    if (!observacoes) return null;
    const match = observacoes.match(/[Cc]redencial[:\s]+(\S+)\/(\S+)/);
    if (match) return { login: match[1], senha: match[2] };
    return null;
  }, []);

  // ─── Busca dados ao vivo de equipamentos dos sites AxHub ──────────────
  const sincronizarEquipamentos = useCallback(async (sitesParaSincronizar) => {
    setIsSyncingEquip(true);
    try {
      // Monta lista de sites com credenciais disponíveis
      const sitesComCredencial = (sitesParaSincronizar || AXHUB_SITES).reduce((acc, site) => {
        const cred = extrairCredencial(site.observacoes);
        if (cred && site.url && site.status === 'ativo') {
          acc.push({
            siteId: site.id,
            url: site.url,
            login: cred.login,
            senha: cred.senha,
          });
        }
        return acc;
      }, []);

      if (sitesComCredencial.length === 0) return;

      const resp = await api.post('/sites/live-stats-batch', {
        sites: sitesComCredencial,
      });

      if (resp.data?.resultados) {
        const novosMapa = { ...liveEquipData };
        resp.data.resultados.forEach((r) => {
          if (r.sucesso && r.dados && r.siteId) {
            novosMapa[r.siteId] = {
              ...r.dados,
              _liveAt: r.timestamp,
            };
          }
        });
        setLiveEquipData(novosMapa);
        setLastSyncEquip(new Date());
      }
    } catch (_) {
      // Falha silenciosa — mantém dados estáticos
    } finally {
      setIsSyncingEquip(false);
    }
  }, [AXHUB_SITES, liveEquipData, extrairCredencial]);

  useEffect(() => {
    let mounted = true;
    setIsRefreshing(true);
    api.get('/helpdesk/sites-overview')
      .then(r => { if (mounted) { setChamadosData(r.data); setLastUpdated(new Date()); } })
      .catch(() => {})
      .finally(() => { if (mounted) setIsRefreshing(false); });
    return () => { mounted = false; };
  }, [refreshKey]);

  // ─── Auto-refresh a cada 10 minutos ──────────────────────────────────
  useEffect(() => {
    autoRefreshRef.current = setInterval(() => {
      setRefreshKey(k => k + 1);
    }, 10 * 60 * 1000);
    return () => clearInterval(autoRefreshRef.current);
  }, []);

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
    sincronizarEquipamentos();
    buscarVersoes();
  };

  // ─── Estado compartilhado entre abas ──────────────────────────
  const [sitesSelecionados, setSitesSelecionados] = useState([]);
  const [siteParaDetalhe, setSiteParaDetalhe] = useState(null);
  const [filtros, setFiltros] = useState({
    sistema: 'todos',
    status: 'todos',
    busca: ''
  });

  // ─── Consolidar todos os sites (estático) ───────────────────
  const todosSites = useMemo(() => {
    const axhub = AXHUB_SITES.map(s => ({ ...s, sistema: 'AxHub' }));
    const axcross = AXCROSS_SITES.map(s => ({ ...s, sistema: 'AxCross' }));
    return [...axhub, ...axcross];
  }, []);

  // ─── Sites enriquecidos com Health Score + Chamados dinâmicos + Equip ao vivo ─
  const sitesComScore = useMemo(() => {
    return todosSites.map(site => {
      const equipLive = liveEquipData[site.id];
      const equipMesclado = equipLive
        ? { ...site.equipamentos, ...equipLive, _isLive: true }
        : site.equipamentos;
      const versaoLive = liveVersions[site.id];
      return {
        ...site,
        versao: versaoLive || site.versao,      // live sobrepõe estático
        _versaoLive: !!versaoLive,
        equipamentos: equipMesclado,
        healthScore: calcHealthScore({ ...site, equipamentos: equipMesclado }, chamadosData),
        chamados: chamadosData?.ranking?.find(r => r.siteId === site.id) || { abertos: 0, total: 0, criticos: 0 },
      };
    });
  }, [todosSites, chamadosData, liveEquipData, liveVersions]);

  // ─── Estatísticas globais ─────────────────────────────────────
  const stats = useMemo(() => {
    const ativos = todosSites.filter(s => s.status === 'ativo').length;
    const total = todosSites.length;
    return {
      total,
      ativos,
      axhub: todosSites.filter(s => s.sistema === 'AxHub').length,
      axcross: todosSites.filter(s => s.sistema === 'AxCross').length
    };
  }, [todosSites]);

  // ─── Configuração das abas v3.0 ──────────────────────────────
  const ABAS = [
    // ── Operação existente ────────────────────────────────────
    { id: 'dashboard',      label: '📊 Dashboard',         badge: null,  grupo: 'visao',      desc: 'Dashboard executivo com 16 indicadores globais' },
    { id: 'visao-geral',    label: '🏢 Visão Geral',       badge: stats.total, grupo: 'visao', desc: 'Cards de todos os sites com métricas principais' },
    { id: 'lista',          label: '📋 Lista',             badge: null,  grupo: 'visao',      desc: 'Tabela com todos os sites e seus dados' },
    { id: 'guia',           label: '🔍 Guia',              badge: null,  grupo: 'visao',      desc: 'Ficha completa individual por site' },
    { id: 'credenciais',    label: '🔑 Credenciais',       badge: null,  grupo: 'visao',      desc: 'Gerencie URLs e senhas de acesso por site' },
    // ── Análise técnica ────────────────────────────────────────
    { id: 'performance',    label: '⚡ Performance',       badge: null,  grupo: 'analise',    desc: 'Ranking de performance por site' },
    { id: 'ocr',            label: '📷 OCR',               badge: null,  grupo: 'analise',    desc: 'Taxas de leitura e qualidade de captura por site' },
    { id: 'equipamentos',   label: '📡 Equipamentos',      badge: null,  grupo: 'analise',    desc: 'Visão consolidada de equipamentos por site' },
    { id: 'apis',           label: '⚡ APIs',              badge: null,  grupo: 'analise',    desc: 'Status e saúde das APIs por site' },
    // ── Qualidade ─────────────────────────────────────────────
    { id: 'saude',          label: '💚 Health Check',      badge: null,  grupo: 'qualidade',  desc: 'Status de saúde geral por site' },
    { id: 'indicadores',    label: '📈 Indicadores',       badge: null,  grupo: 'qualidade',  desc: 'Painel de indicadores consolidados' },
    { id: 'conformidade',   label: '✅ Conformidade',      badge: null,  grupo: 'qualidade',  desc: 'Status de conformidade por requisito e site' },
    { id: 'auditoria',      label: '🔍 Auditoria',         badge: null,  grupo: 'qualidade',  desc: 'Auditoria de conformidade e diagnóstico detalhado' },
    { id: 'seguranca',      label: '🔐 Segurança',         badge: null,  grupo: 'qualidade',  desc: 'Vulnerabilidades, HTTPS e compliance de segurança' },
    // ── Comparação ────────────────────────────────────────────
    { id: 'comparativo',    label: '⚖️ Comparar Sites',   badge: sitesSelecionados.length || null, grupo: 'comparacao', desc: 'Comparação lado a lado de funcionalidades' },
    { id: 'comparador',     label: '🔬 Comparador Global', badge: null,  grupo: 'comparacao', desc: 'Comparação em 14 dimensões com análise por IA' },
    // ── Inteligência ──────────────────────────────────────────
    { id: 'ia-insights',    label: '🧠 IA Insights',       badge: null,  grupo: 'ia',         desc: 'Análise inteligente e predições do ecossistema' },
    { id: 'timeline',       label: '🕐 Timeline',          badge: null,  grupo: 'ia',         desc: 'Histórico de versões e eventos por site' },
  ];

  // ─── Handlers compartilhados ──────────────────────────────────
  const toggleSelecionarSite = (id) => {
    setSitesSelecionados(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  const navegarParaDetalhe = (id) => {
    setSiteParaDetalhe(id);
    setAbaAtiva('guia');
  };

  const limparSelecao = () => {
    setSitesSelecionados([]);
  };

  // ─── Props comuns para todas as abas ──────────────────────────
  const propsComuns = {
    // Dados
    todosSites,
    sitesComScore,
    chamadosData,
    sitesSelecionados,
    siteParaDetalhe,
    filtros,
    stats,
    liveEquipData,
    isSyncingEquip,
    lastSyncEquip,
    onSincronizarEquip: sincronizarEquipamentos,
    
    // Setters
    setSitesSelecionados,
    setSiteParaDetalhe,
    setFiltros,
    setAbaAtiva,
    
    // Actions
    toggleSelecionarSite,
    navegarParaDetalhe,
    limparSelecao,

    // Contexto global
    setSite,
    activeSite,
  };

  // ─── Renderizar componente da aba ativa ───────────────────────
  const renderizarConteudo = () => {
    switch (abaAtiva) {
      // ── Visão
      case 'dashboard':
        return <DashboardExecutivo todosSites={todosSites} sitesComScore={sitesComScore} chamadosData={chamadosData} />;
      case 'visao-geral':
        return <VisaoGeral {...propsComuns} />;
      case 'lista':
        return <ListaGeral {...propsComuns} />;
      case 'comparativo':
        return <Comparativo {...propsComuns} />;
      case 'guia':
        return <GuiaDetalhado {...propsComuns} />;
      case 'credenciais':
        return <CredenciaisSites />;
      // ── Análise técnica
      case 'performance':
        return <Performance sitesComScore={sitesComScore} chamadosData={chamadosData} />;
      case 'ocr':
        return <OCRSites sitesComScore={sitesComScore} />;
      case 'equipamentos':
        return <EquipamentosSites sitesComScore={sitesComScore} liveEquipData={liveEquipData} isSyncingEquip={isSyncingEquip} lastSyncEquip={lastSyncEquip} onSincronizarEquip={sincronizarEquipamentos} />;
      case 'apis':
        return <APISites sitesComScore={sitesComScore} />;
      // ── Qualidade
      case 'saude':
        return <HealthCheck sitesComScore={sitesComScore} chamadosData={chamadosData} onRefresh={handleRefresh} />;
      case 'indicadores':
        return <IndicadoresSites sitesComScore={sitesComScore} chamadosData={chamadosData} />;
      case 'conformidade':
        return <ConformidadeSites sitesComScore={sitesComScore} />;
      case 'auditoria':
        return <AuditoriaSites />;
      case 'seguranca':
        return <SegurancaSites sitesComScore={sitesComScore} />;
      // ── Comparação
      case 'comparador':
        return <ComparadorGlobal sitesComScore={sitesComScore} chamadosData={chamadosData} />;
      // ── Inteligência
      case 'ia-insights':
        return <IAInsights sitesComScore={sitesComScore} chamadosData={chamadosData} />;
      case 'timeline':
        return <Timeline todosSites={todosSites} />;
      default:
        return <DashboardExecutivo todosSites={todosSites} sitesComScore={sitesComScore} chamadosData={chamadosData} />;
    }
  };

  // ─── Descrição da aba ativa ───────────────────────────────────
  const abaAtual = ABAS.find(a => a.id === abaAtiva);

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div className="central-sites-container">
      
      {/* ═══ HEADER ═══ */}
      <header className="cs-header">
        <div className="cs-header-left">
          <h1 className="cs-titulo">🏢 Central de Sites v3.0</h1>
          <p className="cs-subtitulo">
            Ecossistema operacional unificado — {stats.total} sites · {stats.axhub} AxHub · {stats.axcross} AxCross · 18 módulos
          </p>
        </div>
        <div className="cs-header-right">
          {sitesSelecionados.length > 0 && (
            <div className="cs-selecao-info">
              <span>{sitesSelecionados.length} site{sitesSelecionados.length !== 1 ? 's' : ''} selecionado{sitesSelecionados.length !== 1 ? 's' : ''}</span>
              <button className="cs-btn-limpar" onClick={limparSelecao}>✕ Limpar</button>
            </div>
          )}
          <button
            className={`cs-btn-refresh ${(isRefreshing || isSyncingEquip || isFetchingVersions) ? 'cs-btn-refresh--spinning' : ''}`}
            onClick={handleRefresh}
            disabled={isRefreshing || isSyncingEquip || isFetchingVersions}
            title={lastUpdated ? `Última atualização: ${lastUpdated.toLocaleTimeString('pt-BR')}` : 'Atualizar dados'}
          >
            <span className="cs-refresh-icon">↻</span>
            <span className="cs-refresh-label">
              {isFetchingVersions
                ? `Versões… ${versionsProgress.ok}/${versionsProgress.total || '?'}`
                : isRefreshing ? 'Atualizando…'
                : isSyncingEquip ? 'Sincronizando…'
                : Object.keys(liveVersions).length > 0
                  ? `✓ ${Object.keys(liveVersions).length} versões`
                  : 'Atualizar'}
            </span>
          </button>
        </div>
      </header>

      {/* ═══ NAVEGAÇÃO DE ABAS — dois níveis ═══ */}
      <nav className="cs-navegacao-abas" style={{ height: 'auto', flexDirection: 'column', padding: 0, gap: 0 }}>
        {/* Nível 1 — grupos */}
        <div style={{ display: 'flex', gap: 0, padding: '0 16px', borderBottom: '1px solid var(--cs-border)', overflowX: 'auto', flexShrink: 0 }}>
          {[
            { grupo: 'visao',      label: 'Visão' },
            { grupo: 'analise',    label: 'Análise' },
            { grupo: 'qualidade',  label: 'Qualidade' },
            { grupo: 'comparacao', label: 'Comparação' },
            { grupo: 'ia',         label: 'IA & Timeline' },
          ].map(({ grupo, label }) => {
            const grupoAtivo = ABAS.find(a => a.id === abaAtiva)?.grupo === grupo;
            return (
              <button
                key={grupo}
                onClick={() => {
                  const primeiraAba = ABAS.find(a => a.grupo === grupo);
                  if (primeiraAba) setAbaAtiva(primeiraAba.id);
                }}
                style={{
                  padding: '9px 18px', fontSize: 12, fontWeight: grupoAtivo ? 700 : 500,
                  color: grupoAtivo ? 'var(--cs-primary)' : 'var(--cs-text-secondary)',
                  background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                  borderBottom: grupoAtivo ? '2px solid var(--cs-primary)' : '2px solid transparent',
                  marginBottom: -1, transition: 'all 0.15s',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
        {/* Nível 2 — abas do grupo ativo */}
        <div style={{ display: 'flex', gap: 4, padding: '6px 16px', overflowX: 'auto', alignItems: 'center', minHeight: 44 }}>
          {ABAS.filter(a => a.grupo === (ABAS.find(ab => ab.id === abaAtiva)?.grupo || 'visao')).map(aba => (
            <button
              key={aba.id}
              className={`cs-aba ${abaAtiva === aba.id ? 'active' : ''}`}
              onClick={() => setAbaAtiva(aba.id)}
              title={aba.desc}
              style={{ fontSize: 12, padding: '5px 12px', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              <span className="cs-aba-label">{aba.label}</span>
              {aba.badge != null && <span className="cs-aba-badge">{aba.badge}</span>}
            </button>
          ))}
        </div>
      </nav>

      {/* ═══ DESCRIÇÃO DA ABA ═══ */}
      {abaAtual && (
        <div className="cs-aba-descricao">
          <span className="cs-desc-icon">ℹ️</span>
          <span className="cs-desc-texto">{abaAtual.desc}</span>
        </div>
      )}

      {/* ═══ CONTEÚDO DA ABA ═══ */}
      <main className="cs-conteudo">
        {renderizarConteudo()}
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="cs-footer">
        <span className="cs-footer-item">
          <span className="cs-status-dot active"></span>
          {stats.ativos} sites ativos
        </span>
        <span className="cs-footer-item">
          Helpdesk: {lastUpdated ? lastUpdated.toLocaleTimeString('pt-BR') : '—'}
        </span>
        {lastSyncEquip && (
          <span className="cs-footer-item">
            Equip.: {lastSyncEquip.toLocaleTimeString('pt-BR')}
            {Object.keys(liveEquipData).length > 0 && (
              <span style={{ color: '#22c55e', marginLeft: 4 }}>
                · {Object.keys(liveEquipData).length} ao vivo
              </span>
            )}
          </span>
        )}
        <span className="cs-footer-item">
          Central de Sites v3.0.0 · 18 módulos
        </span>
      </footer>

    </div>
  );
}

export default CentralSites;
