import React, { useState, useMemo } from 'react';
import { AXHUB_SITES, AXCROSS_SITES } from '../data/sitesData';
import { StatCard } from '../components/common';
import QuickSelect from '../components/QuickSelect.jsx';
import './IntelligenceDashboard.css';

/* ═══════════════════════════════════════════════════════════════════════
   INTELLIGENCE DASHBOARD — Observabilidade Operacional Avançada
   Visualizações: Health Score, Heatmap de Atividade, Anomaly Detection,
   Capacity Planning, Radar Chart, Network Topology
   ═══════════════════════════════════════════════════════════════════════ */

// ─── Cálculo de Health Score por site ──────────────────────────────────
function calcHealthScore(site, sistema) {
  let score = 0;
  let maxScore = 0;

  if (sistema === 'axhub') {
    // Equipamentos funcionando (peso 25)
    maxScore += 25;
    const eq = site.equipamentos?.total;
    if (eq === null) score += 15; // não coletado = neutro
    else if (eq > 0) score += 25;
    else if (eq === 0) score += 5;

    // OCR acima de 70% (peso 25)
    maxScore += 25;
    if (site.ocr) {
      score += Math.min(25, (site.ocr / 100) * 25);
    } else {
      score += 12; // sem dados = neutro
    }

    // Relatórios BI ativos (peso 20)
    maxScore += 20;
    const biCount = site.bi?.length || 0;
    score += Math.min(20, (biCount / 9) * 20);

    // Versão atualizada (peso 15)
    maxScore += 15;
    if (site.versao === 'v.1.2.0') score += 15;
    else if (site.versao === 'v.1.1.1' || site.versao === 'v.1.1.0') score += 10;
    else if (site.versao === 'v.1.0.0') score += 6;

    // Funcionalidades extras (peso 15)
    maxScore += 15;
    score += Math.min(15, (site.extras?.length || 0) * 3.75);
  } else {
    // AxCross
    maxScore += 25;
    if (site.equipamentos > 0) score += 25;

    maxScore += 25;
    if (site.passagensDia > 0) score += 25;
    else score += 5;

    maxScore += 20;
    if (site.veiculos > 100) score += 20;
    else if (site.veiculos > 0) score += 10;

    maxScore += 15;
    if (site.faixas > 50) score += 15;
    else if (site.faixas > 0) score += (site.faixas / 50) * 15;

    maxScore += 15;
    if (site.alertas > 0) score += 15;
    else score += 5;
  }

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

// ─── Detecção de anomalias ──────────────────────────────────────────
function detectAnomalies(sites, sistema) {
  const anomalies = [];

  if (sistema === 'axhub') {
    sites.forEach(site => {
      // Sites recém-adicionados (sem dados coletados) — não alertar
      if (site.observacoes?.includes('pendentes de coleta')) return;

      if (site.equipamentos?.total === 0 && site.status === 'ativo' && site.tipo !== 'Homologação') {
        anomalies.push({
          site: site.nome, tipo: 'warning', severity: 'medium',
          msg: 'Sem equipamentos cadastrados',
          contexto: `Site do tipo "${site.tipo}" em ${site.estado}. Equipamentos devem ser cadastrados em Operações → Lista. Pode indicar contrato em fase de implantação ou migração pendente.`,
          acao: 'Verificar contrato e cadastrar parque de equipamentos',
        });
      }
      if (site.ocr != null && site.ocr < 60) {
        anomalies.push({
          site: site.nome, tipo: 'critical', severity: 'high',
          msg: `OCR muito baixo (${site.ocr}%)`,
          contexto: `Taxa de reconhecimento de placas está ${(70 - site.ocr).toFixed(1)}% abaixo do mínimo aceitável (70%). Isso impacta diretamente a qualidade das autuações — imagens sem placa legível são descartadas na triagem.`,
          acao: 'Analisar amostras de imagem → verificar câmeras/lentes → ajustar engine OCR',
        });
      }
      if (site.versao === 'v.1.0.0' && site.tipo !== 'Metrologia') {
        anomalies.push({
          site: site.nome, tipo: 'info', severity: 'low',
          msg: 'Versão desatualizada (v.1.0.0)',
          contexto: `Site está na versão legada v.1.0.0. A v.1.2.0 inclui melhorias de OCR, integração BI expandida e módulos extras. Sites de metrologia são exceção (layout diferente por natureza).`,
          acao: 'Agendar janela de manutenção para atualização',
        });
      }
      if ((!site.bi || site.bi.length === 0) && site.tipo !== 'Homologação') {
        anomalies.push({
          site: site.nome, tipo: 'warning', severity: 'medium',
          msg: 'Sem relatórios BI configurados',
          contexto: `Nenhum dashboard Power BI vinculado. O site perde visibilidade de KPIs operacionais (OCR, disponibilidade, fluxo, triagem). O padrão mínimo é 5 relatórios.`,
          acao: 'Criar workspace BI → publicar relatórios → vincular em Relatórios BI',
        });
      }
    });
  } else {
    // AxCross
    const avgPass = sites.filter(s => s.passagensDia > 0).reduce((a, s) => a + s.passagensDia, 0) / sites.filter(s => s.passagensDia > 0).length || 0;

    sites.forEach(site => {
      // Sites recém-adicionados ou homologação — não alertar
      if (site.observacoes?.includes('pendentes de coleta')) return;
      if (site.tipo === 'Homologação') return;

      // CRÍTICO: Muitos equipamentos mas zero passagens
      if (site.equipamentos > 50 && site.passagensDia === 0) {
        const temVeiculos = site.veiculos > 0;
        anomalies.push({
          site: site.nome, tipo: 'critical', severity: 'high',
          msg: `${site.equipamentos} equip. × ${site.faixas || 0} faixas sem passagens`,
          contexto: temVeiculos
            ? `Infraestrutura completa (${site.equipamentos} equipamentos, ${site.faixas} faixas, ${site.veiculos.toLocaleString('pt-BR')} veículos monitorados) mas ZERO passagens registradas hoje. Provável: manutenção programada, falha de comunicação SignalR, ou processamento em fila.`
            : `${site.equipamentos} equipamentos cadastrados mas sem fluxo. Verificar se os pontos de monitoramento estão operacionais e comunicando com o servidor.`,
          acao: temVeiculos
            ? 'Verificar SignalR/comunicação → checar fila de processamento → consultar equipe de campo'
            : 'Diagnosticar integração equipamento ↔ servidor',
        });
      }

      // ATENÇÃO: Sem veículos — mas SÓ se o tipo do contrato exige (NÃO fiscal/MDF-e)
      if (site.veiculos === 0 && site.equipamentos > 0 && site.tipo !== 'Fiscal') {
        anomalies.push({
          site: site.nome, tipo: 'warning', severity: 'medium',
          msg: 'Sem base de veículos para cruzamento',
          contexto: `O site tem ${site.equipamentos} equipamentos e ${site.faixas || 0} faixas ativas mas nenhum veículo cadastrado para cruzamento de alertas. O monitoramento funciona (registra passagens) mas sem a funcionalidade de alerta por placa.`,
          acao: 'Solicitar lista de veículos ao órgão → importar via tela de Importação → configurar alertas',
        });
      }

      // INFO: Volume atípico (muito acima da média)
      if (site.passagensDia > avgPass * 2 && avgPass > 0) {
        anomalies.push({
          site: site.nome, tipo: 'info', severity: 'low',
          msg: `Volume alto: ${site.passagensDia.toLocaleString('pt-BR')} pass/dia (${Math.round(site.passagensDia / avgPass)}× a média)`,
          contexto: `Média da rede: ${Math.round(avgPass).toLocaleString('pt-BR')} passagens/dia. Este site registra ${Math.round(site.passagensDia / avgPass)}× mais. Pode ser normal (via de alto fluxo) ou indicar duplicação de registros.`,
          acao: 'Monitorar — se constante, é característica da via; se pico, investigar duplicação',
        });
      }

      // ATENÇÃO: Equipamentos zerados em site que deveria ter
      if (site.equipamentos === 0 && site.tipo !== 'Homologação' && !site.observacoes?.includes('pendentes')) {
        anomalies.push({
          site: site.nome, tipo: 'warning', severity: 'medium',
          msg: 'Nenhum ponto de monitoramento cadastrado',
          contexto: `Site do tipo "${site.tipo}" sem equipamentos. Pode ser: (1) contrato em fase de implantação, (2) dados não migrados do sistema anterior, ou (3) cadastro pendente pela equipe de operação.`,
          acao: 'Confirmar status do contrato → mapear pontos de campo → cadastrar equipamentos',
        });
      }
    });
  }

  return anomalies.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });
}

// ─── Simulação de heatmap (últimas 24h por hora) ────────────────────
function generateHeatmapData(sites) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  return days.map((day, di) => ({
    day,
    hours: hours.map(h => {
      // Simula padrão realista baseado em dados reais
      const baseTraffic = sites.reduce((a, s) => a + (s.passagensDia || 0), 0);
      const hourFactor = h >= 6 && h <= 9 ? 1.8 : h >= 17 && h <= 19 ? 1.6 : h >= 10 && h <= 16 ? 1.2 : h >= 22 || h <= 5 ? 0.3 : 0.8;
      const dayFactor = di <= 4 ? 1.0 : 0.6;
      const noise = 0.8 + Math.random() * 0.4;
      const value = Math.round((baseTraffic / 24) * hourFactor * dayFactor * noise);
      return { hour: h, value, intensity: Math.min(1, (hourFactor * dayFactor * noise) / 1.8) };
    })
  }));
}

// ─── Capacity Planning ──────────────────────────────────────────────
function calcCapacity(sites, sistema) {
  if (sistema === 'axcross') {
    const totalEquip = sites.reduce((a, s) => a + (s.equipamentos || 0), 0);
    const totalFaixas = sites.reduce((a, s) => a + (s.faixas || 0), 0);
    const totalPass = sites.reduce((a, s) => a + (s.passagensDia || 0), 0);
    const avgPassPerEquip = totalEquip > 0 ? Math.round(totalPass / totalEquip) : 0;
    const maxCapacityPerEquip = 1500; // theoretical max per equipment per day per faixa
    const utilization = totalEquip > 0 ? Math.round((avgPassPerEquip / maxCapacityPerEquip) * 100) : 0;

    return {
      totalEquip,
      totalFaixas,
      totalPass,
      avgPassPerEquip,
      utilization: Math.min(100, utilization),
      projectedGrowth: 12, // % projetado
      timeToCapacity: utilization > 80 ? '< 6 meses' : utilization > 60 ? '12-18 meses' : '> 24 meses',
      recommendation: utilization > 80 ? 'Expansão urgente' : utilization > 60 ? 'Planejar expansão' : 'Capacidade adequada'
    };
  }

  const totalEquip = sites.reduce((a, s) => a + (s.equipamentos?.total || 0), 0);
  const sitesComBI = sites.filter(s => s.bi?.length > 0).length;
  const sitesAtualizados = sites.filter(s => s.versao === 'v.1.2.0').length;

  return {
    totalEquip,
    sitesComBI,
    sitesAtualizados,
    coverage: Math.round((sitesComBI / sites.length) * 100),
    updateCoverage: Math.round((sitesAtualizados / sites.length) * 100),
    recommendation: sitesAtualizados < sites.length / 2 ? 'Atualizar contratos legados' : 'Manutenção preventiva'
  };
}

// ─── SaaS Metrics — Métricas de mercado ──────────────────────────────
function calcSaaSMetrics(axhubSites, axcrossSites, healthScores, anomalies) {
  const allSites = [...axhubSites, ...axcrossSites];
  const totalSites = allSites.length;
  const activeSites = allSites.filter(s => s.status === 'ativo');
  const totalEquipAxhub = axhubSites.reduce((a, s) => a + (s.equipamentos?.total || 0), 0);
  const totalEquipAxcross = axcrossSites.reduce((a, s) => a + (s.equipamentos || 0), 0);
  const totalEquip = totalEquipAxhub + totalEquipAxcross;
  const totalPass = axcrossSites.reduce((a, s) => a + (s.passagensDia || 0), 0);
  const totalFaixas = axcrossSites.reduce((a, s) => a + (s.faixas || 0), 0);
  const totalVeiculos = axcrossSites.reduce((a, s) => a + (s.veiculos || 0), 0);

  // SLA Compliance (baseado em sites com equipamentos ativos comunicando)
  const sitesOperacionais = axcrossSites.filter(s => s.equipamentos > 0 && s.passagensDia > 0).length;
  const sitesComEquip = axcrossSites.filter(s => s.equipamentos > 0).length;
  const slaCompliance = sitesComEquip > 0 ? Math.round((sitesOperacionais / sitesComEquip) * 100) : 0;

  // Feature Adoption (sites que utilizam funcionalidades avançadas)
  const sitesComBI = axhubSites.filter(s => s.bi?.length >= 5).length;
  const sitesComExtras = axhubSites.filter(s => s.extras?.length >= 3).length;
  const sitesComOCR = axhubSites.filter(s => s.ocr != null && s.ocr > 70).length;
  const sitesV12 = axhubSites.filter(s => s.versao === 'v.1.2.0').length;
  const featureAdoption = axhubSites.length > 0
    ? Math.round(((sitesComBI + sitesComExtras + sitesComOCR + sitesV12) / (axhubSites.length * 4)) * 100)
    : 0;

  // Churn Risk Score (sites com Health < 40 ou múltiplas anomalias)
  const healthBySite = {};
  healthScores.forEach(h => { healthBySite[h.site.id] = h.score; });
  const sitesAtRisk = healthScores.filter(h => h.score < 40).length;
  const churnRisk = totalSites > 0 ? Math.round((sitesAtRisk / totalSites) * 100) : 0;

  // NPS Estimado (baseado em health score médio, uso de features, anomalias)
  const avgHealth = healthScores.reduce((a, h) => a + h.score, 0) / healthScores.length || 0;
  const anomalyPenalty = Math.min(20, anomalies.filter(a => a.severity === 'high').length * 10);
  const npsEstimado = Math.round(Math.min(100, Math.max(-100, (avgHealth - 50) * 2 - anomalyPenalty)));

  // MTTR Simulado (based on SLA)
  const criticalCount = anomalies.filter(a => a.severity === 'high').length;
  const mttrHours = criticalCount > 3 ? 12 : criticalCount > 0 ? 6 : 2;

  // MRR e Revenue Impact
  const avgContractValuePerSite = 15000; // R$ médio contrato mensal por site
  const mrr = activeSites.length * avgContractValuePerSite;
  const atRiskRevenue = sitesAtRisk * avgContractValuePerSite;

  // Uptime (sites operacionais vs total)
  const uptime = activeSites.length > 0 ? ((activeSites.length - criticalCount) / activeSites.length * 100).toFixed(2) : '100.00';

  // Market positioning data
  const marketComparison = [
    {
      provider: 'Axion (Atual)',
      ours: true,
      metrics: {
        sites: totalSites,
        equipamentos: totalEquip,
        passagensDia: totalPass,
        sla: slaCompliance,
        uptime: parseFloat(uptime),
        featureAdoption,
        estados: [...new Set(allSites.map(s => s.estado).filter(Boolean))].length,
        produtos: 3, // AxHub, AxCross, AxTon
        bi: sitesComBI,
        ocr: sitesComOCR,
        avgHealth: Math.round(avgHealth),
      }
    },
    {
      provider: 'Velsis/Kapsch',
      ours: false,
      metrics: {
        sites: 80,
        equipamentos: 5000,
        passagensDia: 2000000,
        sla: 99,
        uptime: 99.9,
        featureAdoption: 75,
        estados: 20,
        produtos: 4,
        bi: 60,
        ocr: 65,
        avgHealth: 82,
      },
      fonte: 'Estimativa baseada em portfólio público e participações em certames'
    },
    {
      provider: 'Perkons/FLIR',
      ours: false,
      metrics: {
        sites: 120,
        equipamentos: 8000,
        passagensDia: 4000000,
        sla: 99,
        uptime: 99.9,
        featureAdoption: 80,
        estados: 24,
        produtos: 5,
        bi: 90,
        ocr: 100,
        avgHealth: 88,
      },
      fonte: 'Estimativa — líder de mercado de fiscalização eletrônica'
    },
  ];

  // Gap Analysis — onde o Axion pode melhorar
  const gaps = [];
  if (slaCompliance < 95) gaps.push({ area: 'SLA Compliance', atual: `${slaCompliance}%`, meta: '≥ 99%', impacto: 'Alto', acao: 'Implementar monitoramento proativo + auto-recovery' });
  if (featureAdoption < 60) gaps.push({ area: 'Feature Adoption', atual: `${featureAdoption}%`, meta: '≥ 70%', impacto: 'Médio', acao: 'Programa de onboarding + success manager por contrato' });
  if (sitesComBI < axhubSites.length * 0.8) gaps.push({ area: 'Cobertura BI', atual: `${sitesComBI}/${axhubSites.length}`, meta: '100%', impacto: 'Médio', acao: 'Deploy BI padronizado em todos os sites' });
  if (sitesV12 < axhubSites.length * 0.8) gaps.push({ area: 'Versão Atualizada', atual: `${sitesV12}/${axhubSites.length}`, meta: '100%', impacto: 'Alto', acao: 'Ciclo de atualização trimestral obrigatório' });
  if (churnRisk > 10) gaps.push({ area: 'Churn Risk', atual: `${churnRisk}%`, meta: '< 5%', impacto: 'Crítico', acao: 'Customer Success dedicado para sites em risco' });
  if (parseFloat(uptime) < 99.5) gaps.push({ area: 'Uptime', atual: `${uptime}%`, meta: '≥ 99.9%', impacto: 'Crítico', acao: 'HA (alta disponibilidade) + failover automático + alertas Datadog' });
  if (totalPass < 500000) gaps.push({ area: 'Volume Processado', atual: `${(totalPass / 1000).toFixed(0)}k/dia`, meta: '> 500k/dia', impacto: 'Médio', acao: 'Expandir contratos existentes + prospectar novos' });
  gaps.push({ area: 'Observabilidade', atual: 'Parcial', meta: 'Full-stack', impacto: 'Alto', acao: 'APM (Datadog/New Relic) + logs centralizados + distributed tracing' });
  gaps.push({ area: 'Self-Service Portal', atual: 'Não', meta: 'Sim', impacto: 'Médio', acao: 'Portal do cliente com status em tempo real, abertura de tickets, docs' });

  return {
    totalSites, activeSites: activeSites.length, totalEquip, totalPass, totalFaixas, totalVeiculos,
    slaCompliance, featureAdoption, churnRisk, npsEstimado, mttrHours, mrr, atRiskRevenue, uptime,
    sitesAtRisk, sitesComBI, sitesComExtras, sitesComOCR, sitesV12,
    marketComparison, gaps,
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   Componentes Visuais
   ═══════════════════════════════════════════════════════════════════════ */

/* ─── Gauge circular para tema claro ─── */
function LightGauge({ value, color, size = 130 }) {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - Math.min(1, Math.max(0, value / 100)) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e8edf4" strokeWidth="10" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transform:'rotate(-90deg)', transformOrigin:'50% 50%', transition:'stroke-dashoffset 1.2s ease' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        fill="#1e293b" fontSize={size * 0.19} fontWeight="800">{value}%</text>
    </svg>
  );
}

/* ─── Overview Dashboard — Layout inspirado no design de referência ─── */
function OverviewDashboard({ healthScores, avgHealth, anomalies, activeSites, sites, saasMetrics, correctionPlan }) {
  const avgOCR = useMemo(() => {
    const withOCR = AXHUB_SITES.filter(s => s.status === 'ativo' && s.ocr);
    if (!withOCR.length) return 0;
    return Math.round(withOCR.reduce((a, s) => a + s.ocr, 0) / withOCR.length);
  }, []);

  const sitesOnlinePct = sites.length ? Math.round(activeSites.length / sites.length * 100) : 0;
  const slaPct = saasMetrics?.slaCompliance || 0;

  const GAUGES = [
    { value: avgHealth,       label: 'Health Score',  sub: 'média geral',    color: avgHealth >= 80 ? '#22c55e' : avgHealth >= 60 ? '#f59e0b' : '#ef4444' },
    { value: avgOCR,          label: 'OCR Médio',     sub: 'sites AxHub',    color: '#3b82f6' },
    { value: sitesOnlinePct,  label: 'Sites Ativos',  sub: `${activeSites.length} de ${sites.length}`, color: '#8b5cf6' },
    { value: slaPct,          label: 'SLA',           sub: 'compliance',     color: slaPct >= 95 ? '#22c55e' : '#f59e0b' },
  ];

  // Top 8 sites para bar chart
  const top8 = healthScores.slice(0, 8);
  const maxBar = 130;

  // 5 piores e 5 melhores
  const worst5 = [...healthScores].sort((a, b) => a.score - b.score).slice(0, 5);
  const best5  = healthScores.slice(0, 5);

  // Anomalias agrupadas
  const sevGroups = [
    { label: 'Crítico',  count: anomalies.filter(a => a.severity === 'high').length,   color: '#ef4444' },
    { label: 'Atenção',  count: anomalies.filter(a => a.severity === 'medium').length,  color: '#f59e0b' },
    { label: 'Baixo',    count: anomalies.filter(a => a.severity === 'low').length,     color: '#22c55e' },
  ];
  const maxSev = Math.max(...sevGroups.map(g => g.count), 1);

  const card = { background: '#fff', borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Linha 1: 4 Gauges conectados ── */}
      <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 16px' }}>
        {GAUGES.map((g, i) => (
          <React.Fragment key={g.label}>
            <div style={{ textAlign: 'center', minWidth: 140, padding: '0 8px' }}>
              <LightGauge value={g.value} color={g.color} size={120} />
              <div style={{ fontWeight: 800, fontSize: 14, color: '#1e293b', marginTop: 6, letterSpacing: '0.01em' }}>{g.label}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{g.sub}</div>
            </div>
            {i < 3 && (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', maxWidth: 80 }}>
                <div style={{ height: 2, flex: 1, background: 'linear-gradient(90deg,#e2e8f0,#cbd5e1)' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#cbd5e1', flexShrink: 0 }} />
                <div style={{ height: 2, flex: 1, background: 'linear-gradient(90deg,#cbd5e1,#e2e8f0)' }} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ── Linha 2: 2 Gráficos de barras ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Esquerda: Health Score por Site */}
        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#374151', marginBottom: 16, display:'flex', justifyContent:'space-between' }}>
            <span>📊 Health Score por Site</span>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>Top {top8.length} sites</span>
          </div>
          <svg width="100%" viewBox={`0 0 ${top8.length * 44} 160`} preserveAspectRatio="xMidYMid meet">
            {/* Gridlines */}
            {[25,50,75,100].map(v => (
              <line key={v} x1={0} y1={maxBar - (v/100)*maxBar} x2={top8.length*44} y2={maxBar-(v/100)*maxBar}
                stroke="#f1f5f9" strokeWidth={1} />
            ))}
            {[25,50,75,100].map(v => (
              <text key={`t${v}`} x={2} y={maxBar-(v/100)*maxBar-2} fontSize={8} fill="#cbd5e1">{v}%</text>
            ))}
            {top8.map(({ site, score }, i) => {
              const barH = (score / 100) * maxBar;
              const x = i * 44 + 6;
              const c = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
              return (
                <g key={site.id}>
                  {/* Shadow bar */}
                  <rect x={x+2} y={maxBar-barH+2} width={28} height={barH} rx={5} fill={c} fillOpacity={0.12} />
                  {/* Main bar */}
                  <rect x={x} y={maxBar-barH} width={28} height={barH} rx={5} fill={c} fillOpacity={0.9} />
                  {/* Score label */}
                  <text x={x+14} y={maxBar-barH-5} textAnchor="middle" fontSize={9} fill={c} fontWeight={700}>{score}%</text>
                  {/* Site label */}
                  <text x={x+14} y={maxBar+14} textAnchor="middle" fontSize={9} fill="#94a3b8">{site.nome.slice(0,5)}</text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Direita: Anomalias por Severidade */}
        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#374151', marginBottom: 16, display:'flex', justifyContent:'space-between' }}>
            <span>⚡ Anomalias por Severidade</span>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>{anomalies.length} total</span>
          </div>
          <svg width="100%" viewBox="0 0 280 160" preserveAspectRatio="xMidYMid meet">
            {/* Gridlines */}
            {[0,25,50,75,100].map(pct => {
              const y = maxBar - (pct/100)*maxBar;
              return <line key={pct} x1={30} y1={y} x2={280} y2={y} stroke="#f1f5f9" strokeWidth={1} />;
            })}
            {sevGroups.map((g, i) => {
              const barH = (g.count / maxSev) * maxBar;
              const x = 40 + i * 80;
              return (
                <g key={g.label}>
                  <rect x={x+4} y={maxBar-barH+2} width={50} height={barH} rx={5} fill={g.color} fillOpacity={0.12} />
                  <rect x={x} y={maxBar-barH} width={50} height={barH} rx={5} fill={g.color} fillOpacity={0.85} />
                  <text x={x+25} y={maxBar-barH-6} textAnchor="middle" fontSize={11} fill={g.color} fontWeight={800}>{g.count}</text>
                  <text x={x+25} y={maxBar+14} textAnchor="middle" fontSize={10} fill="#94a3b8">{g.label}</text>
                </g>
              );
            })}
          </svg>
          <div style={{ display:'flex', gap:12, justifyContent:'center', marginTop:4 }}>
            {sevGroups.map(g => (
              <div key={g.label} style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#6b7280' }}>
                <div style={{ width:10, height:10, borderRadius:3, background:g.color }} />
                {g.label}: <strong style={{ color:'#374151' }}>{g.count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Linha 3: Colunas (piores) + Barras horizontais (melhores) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Esquerda: Top 5 piores — colunas verticais */}
        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#374151', marginBottom: 16 }}>
            🔴 5 Sites Críticos
          </div>
          <svg width="100%" viewBox="0 0 280 160" preserveAspectRatio="xMidYMid meet">
            {[25,50,75,100].map(v => (
              <line key={v} x1={30} y1={maxBar-(v/100)*maxBar} x2={280} y2={maxBar-(v/100)*maxBar}
                stroke="#f1f5f9" strokeWidth={1} />
            ))}
            {worst5.map(({ site, score }, i) => {
              const barH = (score / 100) * maxBar;
              const x = 34 + i * 48;
              const c = score >= 60 ? '#f59e0b' : '#ef4444';
              return (
                <g key={site.id}>
                  <rect x={x+2} y={maxBar-barH+2} width={36} height={barH} rx={5} fill={c} fillOpacity={0.12} />
                  <rect x={x} y={maxBar-barH} width={36} height={barH} rx={5} fill={`url(#grad-${i})`} />
                  <defs>
                    <linearGradient id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={c} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={c} stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <text x={x+18} y={maxBar-barH-5} textAnchor="middle" fontSize={9} fill={c} fontWeight={700}>{score}%</text>
                  <text x={x+18} y={maxBar+14} textAnchor="middle" fontSize={8} fill="#94a3b8">{site.nome.slice(0,5)}</text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Direita: Top 5 melhores — barras horizontais */}
        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#374151', marginBottom: 12 }}>
            🟢 5 Sites em Destaque
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {best5.map(({ site, score }, i) => {
              const c = score >= 80 ? '#22c55e' : '#f59e0b';
              const labels = ['A','B','C','D','E'];
              return (
                <div key={site.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: `${c}18`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize: 10, fontWeight: 800, color: c, flexShrink: 0 }}>
                    {labels[i]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{site.nome}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: c }}>{score}%</span>
                    </div>
                    <div style={{ height: 8, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${score}%`, borderRadius: 10,
                        background: `linear-gradient(90deg, ${c}cc, ${c})`,
                        transition: 'width 1s ease',
                      }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function RadialGauge({ value, label, color, size = 100 }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const statusColor = value >= 80 ? '#22c55e' : value >= 60 ? '#f59e0b' : value >= 40 ? '#f97316' : '#ef4444';

  return (
    <div className="radial-gauge" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color || statusColor} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="50%" y="48%" textAnchor="middle" fill="#fff" fontSize="1.1rem" fontWeight="700">
          {value}%
        </text>
        <text x="50%" y="68%" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="0.55rem">
          {label}
        </text>
      </svg>
    </div>
  );
}

function HealthScoreCard({ site, score, sistema, onClick }) {
  const sist = site._sistema || sistema;
  const gradient = score >= 80 ? 'linear-gradient(135deg, #065f46, #059669)'
    : score >= 60 ? 'linear-gradient(135deg, #78350f, #d97706)'
    : score >= 40 ? 'linear-gradient(135deg, #7c2d12, #ea580c)'
    : 'linear-gradient(135deg, #7f1d1d, #dc2626)';

  return (
    <div className="health-card" style={{ background: gradient }} onClick={onClick}>
      <div className="health-card-top">
        <span className="health-card-name">{site.nome}</span>
        <span className="health-card-estado">{sist === 'axhub' ? '🔵' : '🟠'} {site.estado}</span>
      </div>
      <div className="health-card-score">
        <RadialGauge value={score} label="Health" size={72} />
      </div>
      <div className="health-card-meta">
        {sist === 'axhub' ? (
          <>
            <span>{site.equipamentos?.total || 0} equip</span>
            <span>{site.bi?.length || 0} BI</span>
          </>
        ) : (
          <>
            <span>{site.equipamentos || 0} equip</span>
            <span>{(site.passagensDia || 0).toLocaleString('pt-BR')} p/d</span>
          </>
        )}
      </div>
    </div>
  );
}

function AnomalyPanel({ anomalies }) {
  const icons = { critical: '🔴', warning: '🟡', info: '🔵' };
  const labels = { high: 'Crítico', medium: 'Atenção', low: 'Info' };

  if (anomalies.length === 0) {
    return (
      <div className="anomaly-panel anomaly-clear">
        <div className="anomaly-icon">✅</div>
        <p>Nenhuma anomalia detectada. Todos os indicadores dentro dos parâmetros.</p>
      </div>
    );
  }

  return (
    <div className="anomaly-panel">
      <div className="anomaly-header">
        <h3>⚡ Anomaly Detection</h3>
        <span className="anomaly-count">{anomalies.length} alertas</span>
      </div>
      <div className="anomaly-list">
        {anomalies.map((a, i) => (
          <div key={i} className={`anomaly-item anomaly-${a.severity}`}>
            <span className="anomaly-badge">{icons[a.tipo]} {labels[a.severity]}</span>
            <span className="anomaly-site">{a.site}</span>
            <span className="anomaly-msg">{a.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeatmapChart({ data }) {
  const [hovered, setHovered] = useState(null);
  const allValues = data.flatMap(d => d.hours.map(h => h.value));
  const maxVal = Math.max(...allValues);
  const minVal = Math.min(...allValues.filter(v => v > 0));
  const totalDay = data.map(d => d.hours.reduce((a, h) => a + h.value, 0));
  const maxDayTotal = Math.max(...totalDay);

  // Blue gradient: dark → light blue
  function getHeatColor(intensity) {
    if (intensity <= 0.05) return 'rgba(15, 23, 42, 0.8)';
    const r = Math.round(30 + intensity * 70);
    const g = Math.round(58 + intensity * 120);
    const b = Math.round(138 + intensity * 117);
    const a = 0.5 + intensity * 0.5;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  // Peak hour identification
  const peakHours = data.map(d => {
    const maxH = d.hours.reduce((best, h) => h.value > best.value ? h : best, d.hours[0]);
    return { day: d.day, hour: maxH.hour, value: maxH.value };
  });

  // Summary stats
  const totalPassagens = allValues.reduce((a, v) => a + v, 0);
  const avgPerHour = Math.round(totalPassagens / allValues.length);
  const peakGlobal = peakHours.reduce((best, p) => p.value > best.value ? p : best, peakHours[0]);
  const lowHours = data[0]?.hours.filter(h => h.intensity < 0.15).length || 0;

  return (
    <div className="heatmap-container">
      <div className="heatmap-header">
        <h3>📊 Heatmap de Tráfego — Passagens por Hora/Dia</h3>
        <div className="heatmap-legend-multi">
          <span className="heatmap-legend-label">Baixo</span>
          <div className="heatmap-legend-gradient" />
          <span className="heatmap-legend-label">Alto</span>
        </div>
      </div>

      {/* Stats bar */}
      <div className="heatmap-stats">
        <StatCard value={`${(totalPassagens / 1000000).toFixed(1)}M`} label="Total/Semana" className="heatmap-stat" />
        <StatCard value={`${(avgPerHour / 1000).toFixed(1)}k`} label="Média/Hora" className="heatmap-stat" />
        <StatCard value={`${peakGlobal.day} ${peakGlobal.hour}h`} label={`Pico (${(peakGlobal.value / 1000).toFixed(1)}k)`} className="heatmap-stat highlight" />
        <StatCard value={`${lowHours}h`} label="Horas baixas/dia" className="heatmap-stat" />
      </div>

      <div className="heatmap-grid-enhanced">
        {/* Hour headers */}
        <div className="heatmap-row-header">
          <div className="heatmap-day-col" />
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className={`heatmap-hour-col ${i >= 6 && i <= 9 ? 'rush' : i >= 17 && i <= 19 ? 'rush' : ''}`}>
              {i}h
            </div>
          ))}
          <div className="heatmap-total-col">Total</div>
        </div>

        {/* Data rows */}
        {data.map((row, ri) => {
          const dayTotal = row.hours.reduce((a, h) => a + h.value, 0);
          const dayPct = maxDayTotal > 0 ? (dayTotal / maxDayTotal) : 0;
          return (
            <div key={ri} className={`heatmap-data-row ${ri >= 5 ? 'weekend' : ''}`}>
              <div className="heatmap-day-col">
                <span className="day-name">{row.day}</span>
                {ri >= 5 && <span className="day-badge">FDS</span>}
              </div>
              {row.hours.map((cell, ci) => {
                const normalizedVal = maxVal > 0 ? (cell.value - minVal) / (maxVal - minVal) : 0;
                const isPeak = cell.value === peakGlobal.value;
                const isHovered = hovered?.ri === ri && hovered?.ci === ci;
                return (
                  <div
                    key={ci}
                    className={`heatmap-cell-enhanced ${isPeak ? 'peak' : ''} ${isHovered ? 'hovered' : ''}`}
                    style={{ backgroundColor: getHeatColor(normalizedVal) }}
                    onMouseEnter={() => setHovered({ ri, ci, day: row.day, hour: cell.hour, value: cell.value })}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {isPeak && <span className="peak-indicator">★</span>}
                  </div>
                );
              })}
              <div className="heatmap-total-col">
                <div className="total-bar-bg">
                  <div className="total-bar-fill" style={{ width: `${dayPct * 100}%` }} />
                </div>
                <span className="total-value">{(dayTotal / 1000).toFixed(0)}k</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tooltip */}
      {hovered && (
        <div className="heatmap-tooltip">
          <strong>{hovered.day} {hovered.hour}h</strong>
          <span className="tooltip-value">{hovered.value.toLocaleString('pt-BR')} passagens</span>
          <span className="tooltip-pct">{maxVal > 0 ? Math.round((hovered.value / maxVal) * 100) : 0}% do pico</span>
        </div>
      )}

      {/* Rush hour indicators */}
      <div className="heatmap-insights">
        <div className="insight-item rush-morning">
          <span className="insight-icon">🌅</span>
          <span className="insight-text">Rush Manhã: 6h-9h</span>
        </div>
        <div className="insight-item rush-evening">
          <span className="insight-icon">🌆</span>
          <span className="insight-text">Rush Tarde: 17h-19h</span>
        </div>
        <div className="insight-item low">
          <span className="insight-icon">🌙</span>
          <span className="insight-text">Madrugada: 0h-5h (tráfego mínimo)</span>
        </div>
        <div className="insight-item weekend">
          <span className="insight-icon">📉</span>
          <span className="insight-text">Fim de semana: ~40% menor volume</span>
        </div>
      </div>
    </div>
  );
}

function RadarChart({ sites, sistema }) {
  // In "todos" mode, use unified dimensions
  const effectiveSistema = sistema === 'todos' ? 'unified' : sistema;
  const dimensions = effectiveSistema === 'axhub'
    ? ['Equipamentos', 'BI Reports', 'OCR', 'Versão', 'Extras']
    : ['Equipamentos', 'Faixas', 'Passagens', 'Veículos', 'Health'];

  const maxValues = effectiveSistema === 'axhub'
    ? [260, 13, 100, 3, 4]
    : [260, 600, 65000, 425000, 100];

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

  // Deduplicar sites por nome (quando "todos", mesmo site aparece 2x: AxHub + AxCross)
  const uniqueSitesMap = {};
  sites.forEach(s => {
    const nome = s.nome;
    const sist = s._sistema || (s.faixas != null ? 'axcross' : 'axhub');
    if (!uniqueSitesMap[nome]) {
      uniqueSitesMap[nome] = { nome, estado: s.estado || '', equipamentos: 0, faixas: 0, passagensDia: 0, veiculos: 0, _health: [] };
    }
    const eq = sist === 'axhub' ? (s.equipamentos?.total || 0) : (s.equipamentos || 0);
    uniqueSitesMap[nome].equipamentos += eq;
    uniqueSitesMap[nome].faixas += (s.faixas || 0);
    uniqueSitesMap[nome].passagensDia += (s.passagensDia || 0);
    uniqueSitesMap[nome].veiculos += (s.veiculos || 0);
    uniqueSitesMap[nome]._health.push(calcHealthScore(s, sist));
    // Preserve axhub-specific fields from first entry
    if (sist === 'axhub' && !uniqueSitesMap[nome]._axhub) {
      uniqueSitesMap[nome]._axhub = s;
    }
  });
  const dedupedSites = Object.values(uniqueSitesMap).map(s => ({
    ...s,
    health: s._health.length ? Math.round(s._health.reduce((a, v) => a + v, 0) / s._health.length) : 0
  }));

  // Mostrar top 5 sites
  const topSites = [...dedupedSites]
    .sort((a, b) => b.equipamentos - a.equipamentos)
    .slice(0, 5);

  const size = 420;
  const center = size / 2;
  const maxRadius = size / 2 - 50;

  function getPoint(dimIdx, value, maxVal) {
    const angle = (Math.PI * 2 * dimIdx) / dimensions.length - Math.PI / 2;
    const radius = (value / maxVal) * maxRadius;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle)
    };
  }

  return (
    <div className="radar-container">
      <h3>🕸️ Radar Comparativo — Top 5 Sites</h3>
      <div className="radar-wrapper">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Grid circles */}
          {[0.25, 0.5, 0.75, 1].map(scale => (
            <circle
              key={scale}
              cx={center} cy={center} r={maxRadius * scale}
              fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1"
            />
          ))}
          {/* Axis lines */}
          {dimensions.map((_, i) => {
            const angle = (Math.PI * 2 * i) / dimensions.length - Math.PI / 2;
            return (
              <line
                key={i}
                x1={center} y1={center}
                x2={center + maxRadius * Math.cos(angle)}
                y2={center + maxRadius * Math.sin(angle)}
                stroke="rgba(255,255,255,0.12)" strokeWidth="1"
              />
            );
          })}
          {/* Axis labels */}
          {dimensions.map((dim, i) => {
            const angle = (Math.PI * 2 * i) / dimensions.length - Math.PI / 2;
            const lx = center + (maxRadius + 30) * Math.cos(angle);
            const ly = center + (maxRadius + 30) * Math.sin(angle);
            return (
              <text key={i} x={lx} y={ly} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="0.7rem">
                {dim}
              </text>
            );
          })}
          {/* Data polygons */}
          {topSites.map((site, si) => {
            let values;
            if (effectiveSistema === 'axhub' && site._axhub) {
              const s = site._axhub;
              const vMap = { 'v.1.0.0': 1, 'v.1.1.0': 2, 'v.1.1.1': 2, 'v.1.2.0': 3 };
              values = [
                s.equipamentos?.total || 0,
                s.bi?.length || 0,
                s.ocr || 50,
                vMap[s.versao] || 0,
                s.extras?.length || 0
              ];
            } else {
              values = [
                site.equipamentos || 0,
                site.faixas || 0,
                site.passagensDia || 0,
                site.veiculos || 0,
                site.health || 0
              ];
            }

            const points = values.map((v, di) => getPoint(di, Math.min(v, maxValues[di]), maxValues[di]));
            const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

            return (
              <g key={si}>
                <path
                  d={pathD}
                  fill={colors[si]}
                  fillOpacity="0.15"
                  stroke={colors[si]}
                  strokeWidth="2"
                  strokeOpacity="0.8"
                />
                {points.map((p, pi) => (
                  <circle key={pi} cx={p.x} cy={p.y} r="3" fill={colors[si]} />
                ))}
              </g>
            );
          })}
        </svg>
        <div className="radar-legend">
          {topSites.map((site, i) => (
            <div key={i} className="radar-legend-item">
              <span className="radar-legend-dot" style={{ background: colors[i] }} />
              {site.estado ? `${site.estado} — ${site.nome}` : site.nome}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CapacityPanel({ capacity, sistema }) {
  return (
    <div className="capacity-panel">
      <h3>📈 Capacity Planning & Projeções</h3>
      <div className="capacity-grid">
        {(sistema === 'axcross' || sistema === 'todos') && (
          <>
            <div className="capacity-item">
              <div className="capacity-value">{capacity.totalEquip?.toLocaleString('pt-BR')}</div>
              <div className="capacity-label">Equipamentos</div>
            </div>
            <div className="capacity-item">
              <div className="capacity-value">{(capacity.totalFaixas || 0).toLocaleString('pt-BR')}</div>
              <div className="capacity-label">Faixas Ativas</div>
            </div>
            <div className="capacity-item">
              <div className="capacity-value">{(capacity.avgPassPerEquip || 0).toLocaleString('pt-BR')}</div>
              <div className="capacity-label">Pass./Equip./Dia</div>
            </div>
            <div className="capacity-item highlight">
              <div className="capacity-value">{capacity.utilization || 0}%</div>
              <div className="capacity-label">Utilização</div>
              <div className="capacity-bar">
                <div
                  className="capacity-bar-fill"
                  style={{
                    width: `${capacity.utilization || 0}%`,
                    background: (capacity.utilization || 0) > 80 ? '#ef4444' : (capacity.utilization || 0) > 60 ? '#f59e0b' : '#22c55e'
                  }}
                />
              </div>
            </div>
            <div className="capacity-item">
              <div className="capacity-value">{capacity.projectedGrowth || 12}%</div>
              <div className="capacity-label">Cresc. Projetado/Ano</div>
            </div>
            <div className="capacity-item">
              <div className="capacity-value text-sm">{capacity.timeToCapacity || '—'}</div>
              <div className="capacity-label">Tempo até Saturação</div>
            </div>
          </>
        )}
        {sistema === 'axhub' && (
          <>
            <div className="capacity-item">
              <div className="capacity-value">{capacity.totalEquip}</div>
              <div className="capacity-label">Equipamentos Total</div>
            </div>
            <div className="capacity-item">
              <div className="capacity-value">{capacity.sitesComBI}</div>
              <div className="capacity-label">Sites com BI</div>
            </div>
            <div className="capacity-item">
              <div className="capacity-value">{capacity.sitesAtualizados}</div>
              <div className="capacity-label">Sites v.1.2.0</div>
            </div>
            <div className="capacity-item highlight">
              <div className="capacity-value">{capacity.coverage}%</div>
              <div className="capacity-label">Cobertura BI</div>
              <div className="capacity-bar">
                <div className="capacity-bar-fill" style={{ width: `${capacity.coverage}%` }} />
              </div>
            </div>
            <div className="capacity-item highlight">
              <div className="capacity-value">{capacity.updateCoverage}%</div>
              <div className="capacity-label">Atualização</div>
              <div className="capacity-bar">
                <div className="capacity-bar-fill" style={{ width: `${capacity.updateCoverage}%`, background: capacity.updateCoverage > 70 ? '#22c55e' : '#f59e0b' }} />
              </div>
            </div>
          </>
        )}
        {sistema === 'todos' && (
          <>
            <div className="capacity-item highlight">
              <div className="capacity-value">{capacity.coverage || 0}%</div>
              <div className="capacity-label">Cobertura BI (AxHub)</div>
              <div className="capacity-bar">
                <div className="capacity-bar-fill" style={{ width: `${capacity.coverage || 0}%` }} />
              </div>
            </div>
            <div className="capacity-item highlight">
              <div className="capacity-value">{capacity.updateCoverage || 0}%</div>
              <div className="capacity-label">Atualização (AxHub)</div>
              <div className="capacity-bar">
                <div className="capacity-bar-fill" style={{ width: `${capacity.updateCoverage || 0}%`, background: (capacity.updateCoverage || 0) > 70 ? '#22c55e' : '#f59e0b' }} />
              </div>
            </div>
          </>
        )}
      </div>
      <div className="capacity-recommendation">
        <span className="capacity-rec-icon">💡</span>
        <span>{capacity.recommendation}</span>
      </div>
    </div>
  );
}

function NetworkTopology({ sites, sistema }) {
  const size = 400;
  const center = size / 2;

  const nodes = sites.filter(s => s.status === 'ativo').map((site, i, arr) => {
    const angle = (Math.PI * 2 * i) / arr.length - Math.PI / 2;
    const radius = 140;
    const sist = site._sistema || (site.faixas != null ? 'axcross' : 'axhub');
    const eq = sist === 'axhub' ? (site.equipamentos?.total || 0) : (site.equipamentos || 0);
    const nodeSize = Math.max(8, Math.min(24, eq / 10));
    return {
      ...site,
      _sistema: sist,
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
      size: nodeSize,
      angle
    };
  });

  // Links between sites sharing same state
  const links = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (nodes[i].estado === nodes[j].estado && nodes[i].estado !== '—') {
        links.push({ from: nodes[i], to: nodes[j] });
      }
    }
  }

  return (
    <div className="topology-container">
      <h3>🌐 Network Topology — Conexões por Estado</h3>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="topology-svg">
        {/* Central hub */}
        <circle cx={center} cy={center} r="20" fill="rgba(96,205,255,0.15)" stroke="#60cdff" strokeWidth="2" />
        <text x={center} y={center + 4} textAnchor="middle" fill="#60cdff" fontSize="0.6rem" fontWeight="600">
          AXION
        </text>

        {/* Links */}
        {links.map((link, i) => (
          <line
            key={`link-${i}`}
            x1={link.from.x} y1={link.from.y}
            x2={link.to.x} y2={link.to.y}
            stroke="rgba(96,205,255,0.15)" strokeWidth="1" strokeDasharray="4,4"
          />
        ))}

        {/* Spokes from center */}
        {nodes.map((node, i) => (
          <line
            key={`spoke-${i}`}
            x1={center} y1={center}
            x2={node.x} y2={node.y}
            stroke="rgba(255,255,255,0.06)" strokeWidth="1"
          />
        ))}

        {/* Nodes */}
        {nodes.map((node, i) => {
          const sist = node._sistema || (node.faixas != null ? 'axcross' : 'axhub');
          const health = calcHealthScore(node, sist);
          const color = health >= 80 ? '#22c55e' : health >= 60 ? '#f59e0b' : '#ef4444';
          return (
            <g key={i}>
              <circle
                cx={node.x} cy={node.y} r={node.size}
                fill={color} fillOpacity="0.3"
                stroke={color} strokeWidth="2"
              />
              <text
                x={node.x}
                y={node.y + node.size + 12}
                textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="0.5rem"
              >
                {node.nome}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="topology-legend">
        <span><span className="topo-dot" style={{ background: '#22c55e' }} /> Health ≥ 80%</span>
        <span><span className="topo-dot" style={{ background: '#f59e0b' }} /> Health 60-79%</span>
        <span><span className="topo-dot" style={{ background: '#ef4444' }} /> Health &lt; 60%</span>
        <span>⬤ Tamanho = Nº Equipamentos</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Auditoria de Conformidade — Estilo VARCO
   Compara cada site contra benchmark (consenso = site mais completo)
   ═══════════════════════════════════════════════════════════════════════ */

const AUDIT_CRITERIA_AXHUB = [
  { id: 'versao', label: 'Versão Sistema', peso: 20, benchmark: 'v.1.2.0', check: s => s.versao === 'v.1.2.0', getValue: s => s.versao || '—', hint: 'Versão do sistema AxHub instalada no site. A v.1.2.0 é a mais recente com todas as funcionalidades. Sites em v.1.0.0 são legados de metrologia. Versões anteriores podem não ter módulos novos como OCR avançado ou integração BI.' },
  { id: 'equipamentos', label: 'Equipamentos Ativos', peso: 20, benchmark: '> 0', check: s => (s.equipamentos?.total || 0) > 0 || s.equipamentos?.total === null, getValue: s => s.equipamentos?.total === null ? 'Não coletado' : `${s.equipamentos?.total || 0}`, hint: 'Quantidade de equipamentos de fiscalização (radares, câmeras OCR, balanças) cadastrados no sistema. Zero indica que o contrato não tem parque de equipamentos ativo ou que a coleta não foi realizada.' },
  { id: 'bi', label: 'Relatórios BI', peso: 15, benchmark: '≥ 5 dashboards', check: s => (s.bi?.length || 0) >= 5, getValue: s => `${s.bi?.length || 0} dashboards`, hint: 'Dashboards Power BI integrados ao sistema, acessíveis em Relatórios → Relatórios BI. O benchmark de 5+ dashboards garante cobertura mínima de KPIs operacionais (OCR, disponibilidade, fluxo, triagem, infrações).' },
  { id: 'ocr', label: 'OCR ≥ 70%', peso: 20, benchmark: '≥ 70%', check: s => s.ocr === null || (s.ocr || 0) >= 70, getValue: s => s.ocr != null ? `${s.ocr}%` : 'Não coletado', hint: 'Taxa de reconhecimento óptico de placas. Abaixo de 70% indica problemas de câmera, lente suja, iluminação ou configuração do engine OCR. Impacta diretamente a qualidade das autuações.' },
  { id: 'extras', label: 'Funcionalidades Extras', peso: 10, benchmark: '≥ 2 ativas', check: s => (s.extras?.length || 0) >= 2, getValue: s => `${s.extras?.length || 0} ativas`, hint: 'Módulos opcionais habilitados além dos 80 menus base: Infrações Descartadas, Consulta de Placas, Bloqueio de Operação, Acessos Por IP. Indicam contratos com escopo expandido.' },
  { id: 'passagens', label: 'Passagens Registradas', peso: 15, benchmark: '> 0 / dia', check: s => s.passagensDia === null || (s.passagensDia || 0) > 0, getValue: s => s.passagensDia != null ? `${s.passagensDia.toLocaleString('pt-BR')}/dia` : 'Não coletado', hint: 'Volume médio de passagens de veículos registradas por dia. Zero indica equipamentos offline, problemas de comunicação ou contrato sem operação ativa de campo.' },
];

const AUDIT_CRITERIA_AXCROSS = [
  { id: 'equipamentos', label: 'Equipamentos Ativos', peso: 25, benchmark: '> 0', check: s => (s.equipamentos || 0) > 0, getValue: s => `${s.equipamentos || 0}`, hint: 'Pontos de monitoramento (câmeras OCR) instalados e cadastrados no AxCross. Cada equipamento cobre uma ou mais faixas de rodovia. Zero significa contrato sem infraestrutura ativa ou em fase de implantação.' },
  { id: 'faixas', label: 'Faixas Monitoradas', peso: 20, benchmark: '> 0', check: s => (s.faixas || 0) > 0, getValue: s => `${s.faixas || 0}`, hint: 'Quantidade de faixas de tráfego com cobertura de câmera. Cada ponto pode ter múltiplas faixas (ida/volta). É a capacidade real de captura simultânea do sistema.' },
  { id: 'passagens', label: 'Passagens/Dia', peso: 20, benchmark: '> 1.000', check: s => (s.passagensDia || 0) > 1000, getValue: s => `${(s.passagensDia || 0).toLocaleString('pt-BR')}`, hint: 'Volume de veículos registrados por dia. Benchmark > 1.000 indica operação ativa com fluxo real. Abaixo disso pode indicar equipamento offline, via de baixo fluxo ou falha de comunicação.' },
  { id: 'veiculos', label: 'Veículos Monitorados', peso: 15, benchmark: '> 100', check: s => (s.veiculos || 0) > 100, getValue: s => `${(s.veiculos || 0).toLocaleString('pt-BR')}`, hint: 'Base de veículos cadastrados para cruzamento de alertas (furto, roubo, mandados judiciais). Quanto maior a base, maior a efetividade do monitoramento cruzado.' },
  { id: 'alertas', label: 'Alertas Configurados', peso: 20, benchmark: '> 0', check: s => (s.alertas || 0) > 0, getValue: s => `${s.alertas || 0}`, hint: 'Regras de alertas ativos para notificação em tempo real quando um veículo monitorado é detectado. Sem alertas, o sistema apenas registra passagens sem ação proativa.' },
];

function auditSite(site, sist) {
  const criteria = sist === 'axhub' ? AUDIT_CRITERIA_AXHUB : AUDIT_CRITERIA_AXCROSS;
  let totalPeso = 0, scorePeso = 0;
  const results = criteria.map(c => {
    const conforme = c.check(site);
    totalPeso += c.peso;
    if (conforme) scorePeso += c.peso;
    return { ...c, conforme, valorAtual: c.getValue(site) };
  });
  return { site, sist, results, compliance: Math.round((scorePeso / totalPeso) * 100), conformes: results.filter(r => r.conforme).length, total: results.length };
}

function AuditView({ sites }) {
  const [expanded, setExpanded] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const audits = useMemo(() =>
    sites.map(s => auditSite(s, s._sistema || (s.faixas != null ? 'axcross' : 'axhub')))
      .sort((a, b) => a.compliance - b.compliance),
    [sites]
  );

  const conformes = audits.filter(a => a.compliance === 100).length;
  const divergentes = audits.filter(a => a.compliance < 100).length;
  const criticos = audits.filter(a => a.compliance < 50).length;

  const filtered = filterStatus === 'all' ? audits
    : filterStatus === 'conforme' ? audits.filter(a => a.compliance === 100)
    : filterStatus === 'divergente' ? audits.filter(a => a.compliance < 100)
    : audits.filter(a => a.compliance < 50);

  return (
    <div className="audit-view">
      <div className="audit-header">
        <h3>🔍 Auditoria de Conformidade</h3>
        <p className="audit-subtitle">Análise parametrizada — cada site vs benchmark operacional ideal</p>
      </div>

      {/* Legenda explicativa */}
      <div className="audit-legend">
        <div className="audit-legend-item">
          <span className="audit-badge badge-conforme">CONFORME</span>
          <span>100% dos critérios atendidos — site opera dentro do padrão ideal</span>
        </div>
        <div className="audit-legend-item">
          <span className="audit-badge badge-divergente">DIVERGENTE</span>
          <span>50-99% — site atende parcialmente mas tem pontos a corrigir</span>
        </div>
        <div className="audit-legend-item">
          <span className="audit-badge badge-critico">CRÍTICO</span>
          <span>&lt;50% — site com múltiplas não-conformidades, requer ação urgente</span>
        </div>
      </div>

      <div className="audit-stats">
        <div className="audit-stat conforme" onClick={() => setFilterStatus(filterStatus === 'conforme' ? 'all' : 'conforme')}>
          <span className="audit-stat-num">{conformes}</span>
          <span className="audit-stat-label">✅ Conformes</span>
        </div>
        <div className="audit-stat divergente" onClick={() => setFilterStatus(filterStatus === 'divergente' ? 'all' : 'divergente')}>
          <span className="audit-stat-num">{divergentes}</span>
          <span className="audit-stat-label">⚠️ Divergentes</span>
        </div>
        <div className="audit-stat critico" onClick={() => setFilterStatus(filterStatus === 'critico' ? 'all' : 'critico')}>
          <span className="audit-stat-num">{criticos}</span>
          <span className="audit-stat-label">🔴 Críticos (&lt;50%)</span>
        </div>
        <div className="audit-stat total">
          <span className="audit-stat-num">{Math.round(audits.reduce((a, x) => a + x.compliance, 0) / audits.length)}%</span>
          <span className="audit-stat-label">📊 Conformidade Média</span>
        </div>
      </div>

      <div className="audit-table">
        <div className="audit-table-header">
          <span className="audit-col-status">Status</span>
          <span className="audit-col-site">Site</span>
          <span className="audit-col-sistema">Sistema</span>
          <span className="audit-col-score">Conformidade</span>
          <span className="audit-col-detail">Critérios</span>
          <span className="audit-col-action"></span>
        </div>
        {filtered.map((audit, idx) => (
          <div key={audit.site.id} className="audit-row-group">
            <div className={`audit-row ${audit.compliance === 100 ? 'row-conforme' : audit.compliance < 50 ? 'row-critico' : 'row-divergente'}`} onClick={() => setExpanded(expanded === idx ? null : idx)}>
              <span className="audit-col-status">
                <span className={`audit-badge ${audit.compliance === 100 ? 'badge-conforme' : audit.compliance < 50 ? 'badge-critico' : 'badge-divergente'}`}>
                  {audit.compliance === 100 ? 'CONFORME' : audit.compliance < 50 ? 'CRÍTICO' : 'DIVERGENTE'}
                </span>
              </span>
              <span className="audit-col-site">{audit.site.nome}</span>
              <span className="audit-col-sistema">{audit.sist === 'axhub' ? '🔵 AxHub' : '🟠 AxCross'}</span>
              <span className="audit-col-score">
                <div className="audit-bar-bg">
                  <div className="audit-bar-fill" style={{ width: `${audit.compliance}%`, background: audit.compliance >= 80 ? '#22c55e' : audit.compliance >= 50 ? '#f59e0b' : '#ef4444' }} />
                </div>
                <span className="audit-pct">{audit.compliance}%</span>
              </span>
              <span className="audit-col-detail">{audit.conformes}/{audit.total} ok</span>
              <span className="audit-col-action">{expanded === idx ? '▲' : '▼'}</span>
            </div>
            {expanded === idx && (
              <div className="audit-detail">
                {audit.results.map(r => (
                  <div key={r.id} className={`audit-param ${r.conforme ? 'param-ok' : 'param-fail'}`}>
                    <span className="param-icon">{r.conforme ? '✅' : '❌'}</span>
                    <span className="param-label">{r.label}</span>
                    <span className="param-valor">{r.valorAtual}</span>
                    <span className="param-benchmark">Benchmark: {r.benchmark}</span>
                    <span className="param-peso">Peso: {r.peso}%</span>
                    {r.hint && <div className="param-hint">{r.hint}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Plano de Correção — Ações automáticas por divergência
   ═══════════════════════════════════════════════════════════════════════ */

const CORRECTION_ACTIONS = {
  'axhub_versao': { acao: 'Atualizar sistema para v.1.2.0', responsavel: 'Equipe Deploy', prazo: '7 dias', impacto: 'Alto', procedimento: 'Agendar janela de manutenção → Backup BD → Deploy nova versão → Validar menus e funcionalidades' },
  'axhub_equipamentos': { acao: 'Cadastrar equipamentos no sistema', responsavel: 'Equipe Operação', prazo: '3 dias', impacto: 'Crítico', procedimento: 'Verificar contrato → Listar equipamentos de campo → Cadastrar em Operações → Vincular a grupos' },
  'axhub_bi': { acao: 'Configurar dashboards Power BI', responsavel: 'Equipe BI/Analytics', prazo: '5 dias', impacto: 'Médio', procedimento: 'Identificar KPIs do contrato → Criar workspace BI → Publicar relatórios → Vincular em Relatórios BI' },
  'axhub_ocr': { acao: 'Investigar e corrigir taxa OCR', responsavel: 'Equipe Qualidade', prazo: '10 dias', impacto: 'Alto', procedimento: 'Analisar amostras de imagem → Verificar câmeras/lentes → Ajustar parâmetros OCR → Monitorar taxa por 7 dias' },
  'axhub_extras': { acao: 'Habilitar funcionalidades contratuais', responsavel: 'Equipe Configuração', prazo: '2 dias', impacto: 'Baixo', procedimento: 'Verificar cláusulas do contrato → Ativar módulos extras → Testar acessos → Comunicar cliente' },
  'axhub_passagens': { acao: 'Verificar integração de passagens', responsavel: 'Equipe Integração', prazo: '5 dias', impacto: 'Alto', procedimento: 'Checar comunicação com equipamentos → Verificar filas → Analisar logs de integração → Corrigir timeout/erros' },
  'axcross_equipamentos': { acao: 'Cadastrar pontos de monitoramento', responsavel: 'Equipe Operação', prazo: '3 dias', impacto: 'Crítico', procedimento: 'Mapear localização dos pontos → Cadastrar em Equipamentos → Configurar OCR → Ativar monitoramento' },
  'axcross_faixas': { acao: 'Configurar faixas de monitoramento', responsavel: 'Equipe Campo', prazo: '5 dias', impacto: 'Alto', procedimento: 'Identificar faixas por ponto → Cadastrar no sistema → Vincular a câmeras → Validar leitura' },
  'axcross_passagens': { acao: 'Diagnosticar fluxo de passagens', responsavel: 'Equipe Suporte', prazo: '3 dias', impacto: 'Alto', procedimento: 'Verificar comunicação equipamento ↔ servidor → Analisar logs SignalR → Checar fila de processamento' },
  'axcross_veiculos': { acao: 'Importar base de veículos monitorados', responsavel: 'Equipe Operação', prazo: '2 dias', impacto: 'Médio', procedimento: 'Solicitar lista ao órgão → Formatar planilha → Importar via tela de Importação → Validar alertas' },
  'axcross_alertas': { acao: 'Configurar regras de alertas', responsavel: 'Equipe Configuração', prazo: '2 dias', impacto: 'Médio', procedimento: 'Definir tipos de ocorrências → Criar classificações → Ativar alertas por tipo → Testar notificações' },
};

function generateCorrectionPlan(sites) {
  const plan = [];
  sites.forEach(site => {
    const sist = site._sistema || (site.faixas != null ? 'axcross' : 'axhub');
    const criteria = sist === 'axhub' ? AUDIT_CRITERIA_AXHUB : AUDIT_CRITERIA_AXCROSS;
    criteria.forEach(c => {
      if (!c.check(site)) {
        const actionKey = `${sist}_${c.id}`;
        const action = CORRECTION_ACTIONS[actionKey];
        if (action) {
          plan.push({
            site: site.nome,
            estado: site.estado,
            sistema: sist,
            criterio: c.label,
            valorAtual: c.getValue(site),
            benchmark: c.benchmark,
            severidade: c.peso >= 20 ? 'alta' : c.peso >= 15 ? 'media' : 'baixa',
            ...action,
          });
        }
      }
    });
  });
  return plan.sort((a, b) => {
    const sev = { alta: 0, media: 1, baixa: 2 };
    return sev[a.severidade] - sev[b.severidade];
  });
}

function CorrectionPlanView({ sites }) {
  const [expandedAction, setExpandedAction] = useState(null);
  const [filterSev, setFilterSev] = useState('all');

  const plan = useMemo(() => generateCorrectionPlan(sites), [sites]);

  const byResponsavel = useMemo(() => {
    const map = {};
    plan.forEach(p => {
      if (!map[p.responsavel]) map[p.responsavel] = [];
      map[p.responsavel].push(p);
    });
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length);
  }, [plan]);

  const filtered = filterSev === 'all' ? plan : plan.filter(p => p.severidade === filterSev);
  const altas = plan.filter(p => p.severidade === 'alta').length;
  const medias = plan.filter(p => p.severidade === 'media').length;
  const baixas = plan.filter(p => p.severidade === 'baixa').length;

  return (
    <div className="correction-view">
      <div className="correction-header">
        <h3>🛠️ Plano de Correção</h3>
        <p className="correction-subtitle">Ações corretivas geradas automaticamente a partir da auditoria de conformidade</p>
      </div>

      <div className="correction-summary">
        <div className="correction-stat" onClick={() => setFilterSev('all')}>
          <span className="correction-stat-num">{plan.length}</span>
          <span className="correction-stat-label">Total Ações</span>
        </div>
        <div className="correction-stat sev-alta" onClick={() => setFilterSev(filterSev === 'alta' ? 'all' : 'alta')}>
          <span className="correction-stat-num">{altas}</span>
          <span className="correction-stat-label">🔴 Alta</span>
        </div>
        <div className="correction-stat sev-media" onClick={() => setFilterSev(filterSev === 'media' ? 'all' : 'media')}>
          <span className="correction-stat-num">{medias}</span>
          <span className="correction-stat-label">🟡 Média</span>
        </div>
        <div className="correction-stat sev-baixa" onClick={() => setFilterSev(filterSev === 'baixa' ? 'all' : 'baixa')}>
          <span className="correction-stat-num">{baixas}</span>
          <span className="correction-stat-label">🟢 Baixa</span>
        </div>
      </div>

      {/* Responsáveis breakdown */}
      <div className="correction-responsaveis">
        <h4>📋 Distribuição por Equipe</h4>
        <div className="responsavel-chips">
          {byResponsavel.map(([resp, items]) => (
            <div key={resp} className="responsavel-chip">
              <span className="resp-name">{resp}</span>
              <span className="resp-count">{items.length}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline de ações */}
      <div className="correction-timeline">
        {filtered.map((item, idx) => (
          <div key={idx} className={`correction-item sev-${item.severidade}`} onClick={() => setExpandedAction(expandedAction === idx ? null : idx)}>
            <div className="correction-item-header">
              <span className={`correction-sev-badge sev-${item.severidade}`}>
                {item.severidade === 'alta' ? '🔴' : item.severidade === 'media' ? '🟡' : '🟢'} {item.severidade.toUpperCase()}
              </span>
              <span className="correction-site">{item.sistema === 'axhub' ? '🔵' : '🟠'} {item.site}</span>
              <span className="correction-criterio">{item.criterio}: <strong>{item.valorAtual}</strong></span>
              <span className="correction-expand">{expandedAction === idx ? '▲' : '▼'}</span>
            </div>
            <div className="correction-item-action">
              <strong>{item.acao}</strong>
            </div>
            {expandedAction === idx && (
              <div className="correction-detail">
                <div className="correction-detail-grid">
                  <div className="detail-field">
                    <span className="detail-label">👤 Responsável</span>
                    <span className="detail-value">{item.responsavel}</span>
                  </div>
                  <div className="detail-field">
                    <span className="detail-label">⏱️ Prazo</span>
                    <span className="detail-value">{item.prazo}</span>
                  </div>
                  <div className="detail-field">
                    <span className="detail-label">💥 Impacto</span>
                    <span className="detail-value">{item.impacto}</span>
                  </div>
                  <div className="detail-field">
                    <span className="detail-label">🎯 Benchmark</span>
                    <span className="detail-value">{item.benchmark}</span>
                  </div>
                </div>
                <div className="correction-procedure">
                  <span className="detail-label">📝 Procedimento</span>
                  <div className="procedure-steps">
                    {item.procedimento.split(' → ').map((step, si) => (
                      <span key={si} className="procedure-step">
                        <span className="step-num">{si + 1}</span>
                        {step}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Health Score Decomposto — Detalhe por critério ao clicar
   ═══════════════════════════════════════════════════════════════════════ */

function HealthDetailModal({ site, onClose }) {
  const sist = site._sistema || (site.faixas != null ? 'axcross' : 'axhub');
  const criteria = sist === 'axhub' ? [
    { label: 'Equipamentos', peso: 25, calc: () => { const eq = site.equipamentos?.total; return eq === null ? 15 : eq > 0 ? 25 : 5; } },
    { label: 'OCR (Qualidade)', peso: 25, calc: () => site.ocr != null ? Math.min(25, (site.ocr / 100) * 25) : 12 },
    { label: 'Relatórios BI', peso: 20, calc: () => Math.min(20, ((site.bi?.length || 0) / 9) * 20) },
    { label: 'Versão Atualizada', peso: 15, calc: () => site.versao === 'v.1.2.0' ? 15 : site.versao === 'v.1.1.1' || site.versao === 'v.1.1.0' ? 10 : 6 },
    { label: 'Funcionalidades Extras', peso: 15, calc: () => Math.min(15, (site.extras?.length || 0) * 3.75) },
  ] : [
    { label: 'Equipamentos', peso: 25, calc: () => site.equipamentos > 0 ? 25 : 0 },
    { label: 'Passagens/Dia', peso: 25, calc: () => site.passagensDia > 0 ? 25 : 5 },
    { label: 'Veículos Monitorados', peso: 20, calc: () => site.veiculos > 100 ? 20 : site.veiculos > 0 ? 10 : 0 },
    { label: 'Faixas', peso: 15, calc: () => site.faixas > 50 ? 15 : site.faixas > 0 ? (site.faixas / 50) * 15 : 0 },
    { label: 'Alertas', peso: 15, calc: () => site.alertas > 0 ? 15 : 5 },
  ];

  const results = criteria.map(c => ({ ...c, score: Math.round(c.calc()), pct: Math.round((c.calc() / c.peso) * 100) }));
  const total = results.reduce((a, r) => a + r.score, 0);

  return (
    <div className="health-modal-overlay" onClick={onClose}>
      <div className="health-modal" onClick={e => e.stopPropagation()}>
        <div className="health-modal-header">
          <h3>{sist === 'axhub' ? '🔵' : '🟠'} {site.nome} — Decomposição Health Score</h3>
          <button className="health-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="health-modal-total">
          <RadialGauge value={total} label="Total" size={100} />
        </div>
        <div className="health-modal-criteria">
          {results.map((r, i) => (
            <div key={i} className="health-criteria-row">
              <span className="criteria-label">{r.label}</span>
              <span className="criteria-peso">Peso: {r.peso}</span>
              <div className="criteria-bar-container">
                <div className="criteria-bar">
                  <div className="criteria-bar-fill" style={{ width: `${r.pct}%`, background: r.pct >= 80 ? '#22c55e' : r.pct >= 50 ? '#f59e0b' : '#ef4444' }} />
                </div>
              </div>
              <span className="criteria-score">{r.score}/{r.peso}</span>
              <span className={`criteria-pct ${r.pct >= 80 ? 'pct-ok' : r.pct >= 50 ? 'pct-warn' : 'pct-fail'}`}>{r.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Anomaly Panel Aprimorado — Com ações sugeridas
   ═══════════════════════════════════════════════════════════════════════ */

function getAnomalyDetails(anomaly) {
  const base = { equipe: 'Suporte', prioridade: 'P3', sla: '48h' };

  if (anomaly.msg.includes('sem passagens')) {
    return {
      equipe: 'Suporte N2',
      prioridade: 'P1',
      sla: '4h',
      onde: {
        sistema: 'AxCross',
        url: anomaly.site === 'GOIÂNIA' ? 'https://goiania.axcross.axion.ws' : `https://${anomaly.site.toLowerCase()}.axcross.axion.ws`,
        menu: 'Dashboard → Passagens Tempo Real',
        complemento: 'Server → SignalR Hub Status | Equipamentos → Lista (verificar status Conexão)',
      },
      passos: [
        { num: 1, acao: 'Verificar se SignalR Hub está ativo', onde: 'AxCross → Dashboard → canto inferior (status conexão)', detalhe: 'Se "Desconectado", reiniciar serviço no IIS do servidor AxCross' },
        { num: 2, acao: 'Checar fila de processamento', onde: 'Servidor → Gerenciador de Tarefas → Serviços AxCross', detalhe: 'Se fila > 10.000, há gargalo no processamento. Verificar disco e RAM' },
        { num: 3, acao: 'Verificar comunicação dos equipamentos', onde: 'AxCross → Equipamentos → Lista → coluna "Última Comunicação"', detalhe: 'Se todos sem comunicação > 1h, problema é no servidor ou rede. Se individual, é o equipamento' },
        { num: 4, acao: 'Consultar equipe de campo', onde: 'Jitbit Helpdesk → Criar ticket para Operação', detalhe: 'Informar: quantos equipamentos, horário da falha, verificar se houve manutenção programada' },
      ],
      causas: ['Manutenção programada (mais provável)', 'Falha de comunicação SignalR', 'Processamento em fila represada', 'Queda de link de dados'],
    };
  }

  if (anomaly.msg.includes('Sem equipamentos') || anomaly.msg.includes('Nenhum ponto')) {
    return {
      equipe: 'Operação',
      prioridade: 'P2',
      sla: '24h',
      onde: {
        sistema: anomaly.site.includes('cross') || anomaly.msg.includes('ponto de monitoramento') ? 'AxCross' : 'AxHub',
        url: `https://${anomaly.site.toLowerCase()}.axhub.axion.ws`,
        menu: 'Operações → Lista de Equipamentos',
        complemento: 'Administração → Grupos → verificar se grupo existe | Cadastro → Novo Equipamento',
      },
      passos: [
        { num: 1, acao: 'Verificar status do contrato', onde: 'Jitbit → Base de Conhecimento → Contratos Ativos', detalhe: 'Confirmar se o cliente já tem equipamentos implantados ou está em fase de setup' },
        { num: 2, acao: 'Verificar se há grupos criados', onde: 'AxHub → Administração → Grupos de Equipamentos', detalhe: 'Pode haver grupos criados mas sem equipamentos dentro. Verificar "Axion", "Pumatronix"' },
        { num: 3, acao: 'Cadastrar parque de equipamentos', onde: 'AxHub → Operações → Cadastro → Importar/Novo', detalhe: 'Usar planilha de implantação do contrato. Preencher: Nome, Faixa, IP, Fabricante, Início Operação' },
        { num: 4, acao: 'Validar comunicação pós-cadastro', onde: 'AxHub → Operações → Lista → coluna "Conexão"', detalhe: 'Após cadastro, aguardar 5min e verificar se equipamento aparece "Online"' },
      ],
      causas: ['Contrato em fase de implantação', 'Migração de sistema anterior pendente', 'Cadastro não realizado pela operação'],
    };
  }

  if (anomaly.msg.includes('OCR muito baixo')) {
    const ocrMatch = anomaly.msg.match(/\((\d+)%\)/);
    const ocrVal = ocrMatch ? ocrMatch[1] : '?';
    return {
      equipe: 'Qualidade',
      prioridade: 'P1',
      sla: '8h',
      onde: {
        sistema: 'AxHub',
        url: `https://${anomaly.site.toLowerCase()}.axhub.axion.ws`,
        menu: 'Operações → Indicadores OCR | Relatórios BI → Índice de OCR',
        complemento: 'BI → Índice de OCR Equipamento×Faixa (identifica qual câmera está baixo)',
      },
      passos: [
        { num: 1, acao: `Identificar quais equipamentos estão abaixo de 70%`, onde: 'AxHub → Relatórios BI → Índice de OCR Equipamento×Faixa', detalhe: `Média atual: ${ocrVal}%. Filtrar equipamentos com OCR < 60% para priorizar` },
        { num: 2, acao: 'Analisar amostras de imagem dos piores', onde: 'AxHub → Triagem → Infrações Pendentes → Imagens', detalhe: 'Verificar: lente suja, posição errada, reflexo, obstrução, placa ilegível por desgaste' },
        { num: 3, acao: 'Ajustar configuração de câmera/OCR', onde: 'Equipamento → Interface Web → Equipamento › Reconhecimento', detalhe: 'Ajustar: lowProbChar, maxLowProbChars, vehicleType. Se lente, acionar técnico de campo' },
        { num: 4, acao: 'Monitorar evolução por 24h', onde: 'AxHub → BI → Índice de OCR Dia×Hora', detalhe: 'Após ajuste, OCR deve subir nas próximas horas. Se não melhorar, escalar para N2' },
      ],
      causas: ['Lentes sujas ou mal posicionadas', 'Configuração de OCR desajustada', 'Placas Mercosul com baixa legibilidade', 'Iluminação noturna insuficiente'],
    };
  }

  if (anomaly.msg.includes('Sem base de veículos') || anomaly.msg.includes('Sem veículos')) {
    return {
      equipe: 'Operação',
      prioridade: 'P2',
      sla: '24h',
      onde: {
        sistema: 'AxCross',
        url: `https://${anomaly.site.toLowerCase()}.axcross.axion.ws`,
        menu: 'Veículos Monitorados → Lista | Importação → Importar Planilha',
        complemento: 'Administração → Alertas → verificar se alertas estão configurados',
      },
      passos: [
        { num: 1, acao: 'Solicitar lista de veículos ao órgão contratante', onde: 'Comunicação com cliente → Email/Ofício', detalhe: 'Solicitar planilha com: Placa, Tipo Alerta, Motivo, Data Vigência. Formatos aceitos: .xlsx, .csv' },
        { num: 2, acao: 'Importar base via tela de Importação', onde: 'AxCross → Importação → Importar Planilha', detalhe: 'Upload da planilha. Sistema valida formato de placa (ABC1D23 ou ABC1234). Relatório de importação mostra sucessos/erros' },
        { num: 3, acao: 'Configurar tipos de alertas', onde: 'AxCross → Administração → Tipos de Alerta', detalhe: 'Criar categorias: Roubo/Furto, Restrição Judicial, Monitoramento. Associar aos veículos importados' },
        { num: 4, acao: 'Testar cruzamento com placa conhecida', onde: 'AxCross → Veículos Monitorados → Adicionar Teste', detalhe: 'Cadastrar placa de teste e verificar se alerta é gerado na próxima passagem' },
      ],
      causas: ['Órgão ainda não forneceu lista', 'Contrato recém-iniciado', 'Migração de sistema anterior não realizada'],
    };
  }

  if (anomaly.msg.includes('Versão desatualizada')) {
    return {
      equipe: 'Deploy',
      prioridade: 'P3',
      sla: '1 semana',
      onde: {
        sistema: 'AxHub',
        url: `https://${anomaly.site.toLowerCase()}.axhub.axion.ws`,
        menu: 'Sobre → Versão | Deploy via pipeline Azure DevOps',
        complemento: 'Azure DevOps → Pipelines → Release → AxHub Deploy',
      },
      passos: [
        { num: 1, acao: 'Verificar compatibilidade e release notes', onde: 'Azure DevOps → Repos → Tags → v.1.2.0', detalhe: 'Confirmar que não há breaking changes para o site específico (customizações, integrações)' },
        { num: 2, acao: 'Agendar janela de manutenção', onde: 'Comunicação com cliente → Email com data/hora', detalhe: 'Preferência: madrugada ou domingo. Informar tempo estimado de indisponibilidade (15-30min)' },
        { num: 3, acao: 'Executar deploy', onde: 'Azure DevOps → Pipelines → Release → Deploy [site]', detalhe: 'Executar pipeline com target do site. Monitorar logs de deploy por erros de migração de BD' },
        { num: 4, acao: 'Validar pós-deploy', onde: 'AxHub [site] → Login → Navegar telas principais', detalhe: 'Verificar: Operações carrega, BI funciona, Triagem abre, API responde. Rollback se falhar' },
      ],
      causas: ['Site não incluído no último ciclo de deploy', 'Cliente solicitou adiamento', 'Customização bloqueia atualização'],
    };
  }

  if (anomaly.msg.includes('Sem relatórios BI')) {
    return {
      equipe: 'BI/Analytics',
      prioridade: 'P2',
      sla: '72h',
      onde: {
        sistema: 'AxHub',
        url: `https://${anomaly.site.toLowerCase()}.axhub.axion.ws`,
        menu: 'Relatórios BI → (vazio) | Power BI Service → Workspaces',
        complemento: 'app.powerbi.com → Workspace do cliente → Publicar relatórios → Vincular no AxHub',
      },
      passos: [
        { num: 1, acao: 'Criar workspace no Power BI Service', onde: 'app.powerbi.com → Workspaces → Novo', detalhe: 'Nome padrão: "AxHub - [SITE]". Adicionar membros da equipe Analytics' },
        { num: 2, acao: 'Publicar relatórios padrão', onde: 'Power BI Desktop → Publicar → Selecionar workspace', detalhe: 'Relatórios mínimos: Disponibilidade Diária, Índice OCR, Fluxo por Hora, Triagem, Tempestividade' },
        { num: 3, acao: 'Configurar conexão de dados', onde: 'Power BI Service → Configurações do Dataset → Parâmetros', detalhe: 'Apontar para o banco do site. Configurar atualização agendada (a cada 1h)' },
        { num: 4, acao: 'Vincular no AxHub', onde: 'AxHub → Administração → Relatórios BI → Adicionar', detalhe: 'Colar URL embed de cada relatório. Definir permissões de visualização por perfil' },
      ],
      causas: ['Site implantado sem etapa de BI', 'Workspace não criado', 'Relatórios publicados mas não vinculados no AxHub'],
    };
  }

  if (anomaly.msg.includes('Volume')) {
    return {
      equipe: 'Monitoramento',
      prioridade: 'P3',
      sla: '72h',
      onde: {
        sistema: 'AxCross',
        url: `https://${anomaly.site.toLowerCase()}.axcross.axion.ws`,
        menu: 'Dashboard → Gráfico de Passagens | Relatórios → Passagens por Hora',
        complemento: 'Banco de dados → SELECT COUNT(*) por hora para identificar pico anômalo',
      },
      passos: [
        { num: 1, acao: 'Analisar distribuição temporal', onde: 'AxCross → Relatórios → Passagens por Hora (últimos 7 dias)', detalhe: 'Verificar se o pico é constante ou pontual. Se constante = via de alto fluxo. Se pico = investigar' },
        { num: 2, acao: 'Verificar duplicação de registros', onde: 'Banco de dados → Query: placas repetidas em < 5s no mesmo ponto', detalhe: 'Se muitas placas aparecem 2-3× seguidas, pode ser bug de trigger duplo no equipamento' },
        { num: 3, acao: 'Classificar como normal ou anômalo', onde: 'Comparar com mesmos dias/horários das semanas anteriores', detalhe: 'Variação < 20% entre semanas = padrão normal da via. > 50% = evento ou erro' },
      ],
      causas: ['Via de alto fluxo (normal)', 'Evento especial (jogo, feriado)', 'Trigger duplicado no equipamento', 'Erro de configuração de faixa'],
    };
  }

  return {
    ...base,
    onde: { sistema: 'AxHub/AxCross', url: '#', menu: 'Dashboard principal', complemento: '' },
    passos: [{ num: 1, acao: 'Investigar manualmente', onde: 'Dashboard do sistema', detalhe: 'Verificar logs e status' }],
    causas: ['A investigar'],
  };
}

function EnhancedAnomalyPanel({ anomalies }) {
  const icons = { critical: '🔴', warning: '🟡', info: '🔵' };
  const labels = { high: 'Crítico', medium: 'Atenção', low: 'Info' };
  const severityColors = { high: '#ef4444', medium: '#f59e0b', low: '#60cdff' };
  const [expanded, setExpanded] = useState(null);

  if (anomalies.length === 0) {
    return (
      <div className="anomaly-panel anomaly-clear">
        <div className="anomaly-icon">✅</div>
        <p>Nenhuma anomalia detectada. Todos os indicadores dentro dos parâmetros.</p>
      </div>
    );
  }

  return (
    <div className="anomaly-panel enhanced">
      <div className="anomaly-header">
        <h3>⚡ Anomaly Detection</h3>
        <span className="anomaly-count">{anomalies.length} alertas</span>
      </div>
      <div className="anomaly-list-enhanced">
        {anomalies.map((a, i) => {
          const details = getAnomalyDetails(a);
          const isExpanded = expanded === i;
          return (
            <div key={i} className={`anomaly-card anomaly-sev-${a.severity}`}>
              {/* Card Header — always visible */}
              <div className="anomaly-card-header" onClick={() => setExpanded(isExpanded ? null : i)}>
                <div className="anomaly-card-left">
                  <span className="anomaly-sev-badge" style={{ borderColor: severityColors[a.severity] }}>
                    {icons[a.tipo]} {labels[a.severity]}
                  </span>
                  <span className="anomaly-card-site">{a.site}</span>
                  <span className="anomaly-card-msg">{a.msg}</span>
                </div>
                <div className="anomaly-card-right">
                  <span className="anomaly-card-team">{details.equipe}</span>
                  <span className="anomaly-card-sla">{details.prioridade} • {details.sla}</span>
                  <span className="anomaly-card-toggle">{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Quick Action bar — always visible */}
              <div className="anomaly-card-quick">
                <span className="anomaly-quick-label">🛠️ Ação:</span>
                <span className="anomaly-quick-text">{a.acao}</span>
                <span className="anomaly-quick-where">📍 {details.onde.menu}</span>
              </div>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="anomaly-card-detail">
                  {/* Section: Onde Verificar */}
                  <div className="anomaly-detail-section anomaly-section-where">
                    <div className="anomaly-section-title">📍 Onde Verificar</div>
                    <div className="anomaly-where-grid">
                      <div className="anomaly-where-item">
                        <span className="anomaly-where-label">Sistema</span>
                        <span className="anomaly-where-value">{details.onde.sistema}</span>
                      </div>
                      <div className="anomaly-where-item">
                        <span className="anomaly-where-label">URL</span>
                        <a href={details.onde.url} target="_blank" rel="noopener noreferrer" className="anomaly-where-link">{details.onde.url}</a>
                      </div>
                      <div className="anomaly-where-item full">
                        <span className="anomaly-where-label">Menu / Tela</span>
                        <span className="anomaly-where-value highlight">{details.onde.menu}</span>
                      </div>
                      {details.onde.complemento && (
                        <div className="anomaly-where-item full">
                          <span className="anomaly-where-label">Verificar também</span>
                          <span className="anomaly-where-value">{details.onde.complemento}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section: Contexto / O que está acontecendo */}
                  {a.contexto && (
                    <div className="anomaly-detail-section anomaly-section-context">
                      <div className="anomaly-section-title">🔍 O que está acontecendo</div>
                      <div className="anomaly-context-body">{a.contexto}</div>
                    </div>
                  )}

                  {/* Section: Causas Prováveis */}
                  {details.causas && (
                    <div className="anomaly-detail-section anomaly-section-causes">
                      <div className="anomaly-section-title">⚠️ Causas Prováveis</div>
                      <div className="anomaly-causes-list">
                        {details.causas.map((c, ci) => (
                          <span key={ci} className="anomaly-cause-tag">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section: Passo a Passo de Correção */}
                  <div className="anomaly-detail-section anomaly-section-steps">
                    <div className="anomaly-section-title">✅ Como Corrigir (Passo a Passo)</div>
                    <div className="anomaly-steps-list">
                      {details.passos.map((p) => (
                        <div key={p.num} className="anomaly-step">
                          <div className="anomaly-step-num">{p.num}</div>
                          <div className="anomaly-step-content">
                            <div className="anomaly-step-action">{p.acao}</div>
                            <div className="anomaly-step-where">📍 {p.onde}</div>
                            <div className="anomaly-step-detail">{p.detalhe}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section: Responsável */}
                  <div className="anomaly-detail-footer">
                    <span className="anomaly-footer-team">👤 Equipe: <strong>{details.equipe}</strong></span>
                    <span className="anomaly-footer-pri">🎯 {details.prioridade}</span>
                    <span className="anomaly-footer-sla">⏱️ SLA: {details.sla}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SaaS Metrics View — Benchmark de Mercado & KPIs
   ═══════════════════════════════════════════════════════════════════════ */

function SaaSMetricsView({ metrics }) {
  const [expandedGap, setExpandedGap] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const formatCurrency = (val) => `R$ ${(val / 1000).toFixed(0)}k`;
  const formatNumber = (val) => val?.toLocaleString('pt-BR') || '0';

  const saasKPIs = [
    { label: 'MRR', value: formatCurrency(metrics.mrr), sublabel: 'Receita Recorrente Mensal', color: '#22c55e', icon: '💰' },
    { label: 'Uptime', value: `${metrics.uptime}%`, sublabel: `Meta SaaS: 99.9%`, color: parseFloat(metrics.uptime) >= 99.5 ? '#22c55e' : '#f59e0b', icon: '🟢' },
    { label: 'SLA', value: `${metrics.slaCompliance}%`, sublabel: 'Sites operando conforme SLA', color: metrics.slaCompliance >= 95 ? '#22c55e' : metrics.slaCompliance >= 80 ? '#f59e0b' : '#ef4444', icon: '📋' },
    { label: 'MTTR', value: `${metrics.mttrHours}h`, sublabel: 'Mean Time to Resolution', color: metrics.mttrHours <= 4 ? '#22c55e' : '#f59e0b', icon: '⏱️' },
    { label: 'NPS', value: metrics.npsEstimado, sublabel: metrics.npsEstimado > 50 ? 'Excelente' : metrics.npsEstimado > 0 ? 'Bom' : 'Crítico', color: metrics.npsEstimado > 50 ? '#22c55e' : metrics.npsEstimado > 0 ? '#f59e0b' : '#ef4444', icon: '📊' },
    { label: 'Churn Risk', value: `${metrics.churnRisk}%`, sublabel: `${metrics.sitesAtRisk} sites em risco`, color: metrics.churnRisk < 10 ? '#22c55e' : metrics.churnRisk < 20 ? '#f59e0b' : '#ef4444', icon: '⚠️' },
    { label: 'Adoption', value: `${metrics.featureAdoption}%`, sublabel: 'Adoção de funcionalidades', color: metrics.featureAdoption >= 60 ? '#22c55e' : '#f59e0b', icon: '🚀' },
    { label: 'At-Risk Rev.', value: formatCurrency(metrics.atRiskRevenue), sublabel: 'Receita em risco de churn', color: metrics.atRiskRevenue > 0 ? '#ef4444' : '#22c55e', icon: '🔥' },
  ];

  return (
    <div className="saas-metrics-view">
      {/* Tabs */}
      <div className="saas-tabs">
        {[
          { id: 'overview', label: '📊 KPIs SaaS' },
          { id: 'market',   label: '🏆 Comparativo de Mercado' },
          { id: 'gaps',     label: '🎯 Gap Analysis' },
          { id: 'maturity', label: '📈 Maturidade' },
        ].map(t => (
          <button key={t.id} className={`saas-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: KPIs Overview */}
      {activeTab === 'overview' && (
        <div className="saas-overview">
          <div className="saas-kpi-grid">
            {saasKPIs.map(kpi => (
              <div key={kpi.label} className="saas-kpi-card">
                <div className="saas-kpi-icon">{kpi.icon}</div>
                <div className="saas-kpi-value" style={{ color: kpi.color }}>{kpi.value}</div>
                <div className="saas-kpi-label">{kpi.label}</div>
                <div className="saas-kpi-sublabel">{kpi.sublabel}</div>
              </div>
            ))}
          </div>

          {/* SaaS Best Practices Checklist */}
          <div className="saas-checklist">
            <h4>🏁 Checklist SaaS — Práticas de Mercado</h4>
            <div className="checklist-grid">
              {[
                { item: 'Monitoramento de uptime 24/7', status: 'partial', detail: 'VARCO monitora câmeras; falta APM nos servidores AxHub/AxCross' },
                { item: 'Alertas proativos (antes do cliente perceber)', status: 'partial', detail: 'Dashboard Intelligence detecta anomalias; falta automação de notificação (PagerDuty/OpsGenie)' },
                { item: 'SLA contratual com penalidades', status: 'yes', detail: 'Contratos de fiscalização eletrônica definem SLA de disponibilidade ≥ 95%' },
                { item: 'Portal self-service do cliente', status: 'no', detail: 'Cliente depende de helpdesk (Jitbit). Padrão SaaS: portal de status + docs + abertura de ticket' },
                { item: 'Onboarding automatizado', status: 'partial', detail: 'Setup inicial manual pela equipe de operação. Padrão SaaS: wizard com checklist autônomo' },
                { item: 'Multi-tenant escalável', status: 'yes', detail: 'Cada site/contrato é um tenant isolado. Infraestrutura compartilha código mas dados são separados' },
                { item: 'CI/CD e zero-downtime deploy', status: 'partial', detail: 'Pipeline Azure DevOps existe; deploy causa indisponibilidade breve (~15min). Falta blue/green' },
                { item: 'Métricas de uso/engajamento', status: 'partial', detail: 'AxHub logs de acesso por IP. Falta: DAU/MAU, session duration, feature usage analytics' },
                { item: 'Customer Health Score', status: 'yes', detail: 'Intelligence Dashboard calcula Health Score com 5 critérios ponderados por produto' },
                { item: 'Playbooks de incidentes (Runbooks)', status: 'yes', detail: 'Anomaly Detection com passo-a-passo de correção + VARCO Guia de Correção Consolidado' },
                { item: 'Data retention & compliance', status: 'yes', detail: 'LGPD compliance para dados de placas/infrações. Retenção conforme legislação de trânsito' },
                { item: 'API pública documentada', status: 'no', detail: 'APIs internas existem (REST). Falta: documentação pública, rate limiting, API keys, developer portal' },
              ].map((c, i) => (
                <div key={i} className={`checklist-item status-${c.status}`}>
                  <span className="checklist-icon">
                    {c.status === 'yes' ? '✅' : c.status === 'partial' ? '🟡' : '❌'}
                  </span>
                  <div className="checklist-content">
                    <span className="checklist-text">{c.item}</span>
                    <span className="checklist-detail">{c.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Market Comparison */}
      {activeTab === 'market' && (
        <div className="saas-market">
          <div className="market-disclaimer">
            <span className="disclaimer-icon">ℹ️</span>
            <span>Dados de concorrentes são estimativas baseadas em informações públicas (licitações, portfólios, cases). Não representam dados oficiais.</span>
          </div>

          <div className="market-table-container">
            <table className="market-table">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Sites</th>
                  <th>Equipamentos</th>
                  <th>Passagens/dia</th>
                  <th>Estados</th>
                  <th>Produtos</th>
                  <th>SLA %</th>
                  <th>Uptime %</th>
                  <th>Feature Adopt.</th>
                  <th>Health Score</th>
                </tr>
              </thead>
              <tbody>
                {metrics.marketComparison.map((mc, i) => (
                  <tr key={i} className={mc.ours ? 'row-ours' : ''}>
                    <td className="market-provider">
                      <span className="provider-name">{mc.provider}</span>
                      {mc.ours && <span className="badge-ours">Nós</span>}
                    </td>
                    <td>{mc.metrics.sites}</td>
                    <td>{formatNumber(mc.metrics.equipamentos)}</td>
                    <td>{formatNumber(mc.metrics.passagensDia)}</td>
                    <td>{mc.metrics.estados}</td>
                    <td>{mc.metrics.produtos}</td>
                    <td className={mc.metrics.sla >= 99 ? 'metric-good' : mc.metrics.sla >= 90 ? 'metric-warn' : 'metric-bad'}>{mc.metrics.sla}%</td>
                    <td className={mc.metrics.uptime >= 99.5 ? 'metric-good' : 'metric-warn'}>{mc.metrics.uptime}%</td>
                    <td>{mc.metrics.featureAdoption}%</td>
                    <td>
                      <span className={`market-health ${mc.metrics.avgHealth >= 80 ? 'h-good' : mc.metrics.avgHealth >= 60 ? 'h-ok' : 'h-bad'}`}>
                        {mc.metrics.avgHealth}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Competitive Positioning Chart (text-based bar chart) */}
          <div className="market-positioning">
            <h4>📊 Posicionamento Competitivo — Dimensões-Chave</h4>
            {['Sites', 'Equipamentos', 'Volume (pass/dia)', 'SLA', 'Feature Adoption'].map((dim, di) => {
              const vals = metrics.marketComparison.map(mc => {
                const keys = ['sites', 'equipamentos', 'passagensDia', 'sla', 'featureAdoption'];
                return { provider: mc.provider, value: mc.metrics[keys[di]], ours: mc.ours };
              });
              const maxVal = Math.max(...vals.map(v => v.value));
              return (
                <div key={dim} className="positioning-row">
                  <span className="positioning-dim">{dim}</span>
                  <div className="positioning-bars">
                    {vals.map((v, vi) => (
                      <div key={vi} className={`positioning-bar-item ${v.ours ? 'bar-ours' : ''}`}>
                        <span className="bar-provider">{v.provider.split('/')[0].split(' ')[0]}</span>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${(v.value / maxVal) * 100}%`, background: v.ours ? '#60cdff' : 'rgba(255,255,255,0.2)' }} />
                        </div>
                        <span className="bar-value">{di === 2 ? `${(v.value / 1000).toFixed(0)}k` : di >= 3 ? `${v.value}%` : v.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Vantagens Competitivas */}
          <div className="market-advantages">
            <h4>💪 Vantagens Competitivas Axion</h4>
            <div className="advantages-grid">
              {[
                { titulo: 'Intelligence Dashboard', desc: 'Painel de observabilidade com Health Score, Anomaly Detection, Correção Automática — nenhum concorrente tem este nível de self-healing', icon: '🧠' },
                { titulo: 'VARCO Fleet Audit', desc: 'Auditoria remota em massa de configuração de câmeras via API, com correção automatizada e consenso por maioria', icon: '🔧' },
                { titulo: 'IA Integrada (AxionIA)', desc: 'Motor de classificação e resposta por embeddings próprio, integrado ao helpdesk para atendimento L1 automático', icon: '🤖' },
                { titulo: 'Multi-Produto Unificado', desc: 'AxHub (fiscalização) + AxCross (monitoramento) + AxTon (pesagem) sob uma plataforma — concorrentes são single-product', icon: '🏗️' },
                { titulo: 'OCR Best-in-Class', desc: 'IBAMETRO com 96.76% de OCR — referência nacional. Engine Pumatronix + tuning por frota', icon: '📸' },
                { titulo: 'Custo Operacional', desc: 'Stack Node.js + React + MongoDB permite escalar com custo 3-5× menor que soluções .NET enterprise', icon: '💸' },
              ].map((adv, i) => (
                <div key={i} className="advantage-card">
                  <span className="advantage-icon">{adv.icon}</span>
                  <div>
                    <div className="advantage-title">{adv.titulo}</div>
                    <div className="advantage-desc">{adv.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Gap Analysis */}
      {activeTab === 'gaps' && (
        <div className="saas-gaps">
          <div className="gaps-header">
            <h4>🎯 Gap Analysis — Onde Melhorar para Nível SaaS Enterprise</h4>
            <p className="gaps-subtitle">Comparação com práticas de mercado (Datadog, PagerDuty, Zendesk, New Relic) aplicadas ao contexto de fiscalização eletrônica</p>
          </div>

          <div className="gaps-summary">
            <div className="gap-stat gap-critical">{metrics.gaps.filter(g => g.impacto === 'Crítico').length} Críticos</div>
            <div className="gap-stat gap-high">{metrics.gaps.filter(g => g.impacto === 'Alto').length} Altos</div>
            <div className="gap-stat gap-medium">{metrics.gaps.filter(g => g.impacto === 'Médio').length} Médios</div>
          </div>

          <div className="gaps-list">
            {metrics.gaps.map((gap, i) => (
              <div key={i} className={`gap-card impact-${gap.impacto.toLowerCase()}`} onClick={() => setExpandedGap(expandedGap === i ? null : i)}>
                <div className="gap-header">
                  <span className={`gap-impact impact-${gap.impacto.toLowerCase()}`}>
                    {gap.impacto === 'Crítico' ? '🔴' : gap.impacto === 'Alto' ? '🟠' : '🟡'} {gap.impacto}
                  </span>
                  <span className="gap-area">{gap.area}</span>
                  <div className="gap-values">
                    <span className="gap-atual">Atual: <strong>{gap.atual}</strong></span>
                    <span className="gap-arrow">→</span>
                    <span className="gap-meta">Meta: <strong>{gap.meta}</strong></span>
                  </div>
                  <span className="gap-toggle">{expandedGap === i ? '▲' : '▼'}</span>
                </div>
                {expandedGap === i && (
                  <div className="gap-detail">
                    <div className="gap-acao">
                      <span className="gap-acao-label">📋 Ação Recomendada:</span>
                      <span className="gap-acao-text">{gap.acao}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Maturity Model */}
      {activeTab === 'maturity' && (
        <div className="saas-maturity">
          <h4>📈 Modelo de Maturidade SaaS — Posição Atual</h4>
          <p className="maturity-subtitle">Baseado no modelo de maturidade SaaS B2B (Gartner/Forrester adaptado para GovTech/Fiscalização)</p>

          <div className="maturity-levels">
            {[
              {
                level: 1, nome: 'Inicial', desc: 'Software on-premise, deploy manual, sem métricas',
                criterios: ['Deploy manual', 'Sem monitoramento', 'Suporte reativo', 'Sem BI'],
                status: 'passed'
              },
              {
                level: 2, nome: 'Gerenciado', desc: 'Multi-tenant básico, contratos por site, deploy semi-automatizado',
                criterios: ['Multi-site', 'Pipeline CI/CD', 'Helpdesk estruturado', 'BI básico'],
                status: 'passed'
              },
              {
                level: 3, nome: 'Definido', desc: 'Observabilidade, Health Score, anomaly detection, correção assistida',
                criterios: ['Health Score por site', 'Anomaly Detection', 'Auditoria automática', 'Runbooks de correção'],
                status: 'current'
              },
              {
                level: 4, nome: 'Quantificado', desc: 'SLA com enforcement, NPS tracking, revenue analytics, predictive maintenance',
                criterios: ['SLA 99.9% enforcement', 'NPS/CSAT real', 'Revenue tracking', 'Predictive alerts'],
                status: 'next'
              },
              {
                level: 5, nome: 'Otimizado', desc: 'Auto-healing, AI-driven ops, self-service portal, marketplace de integrações',
                criterios: ['Auto-remediation', 'AI Ops', 'Customer portal', 'API marketplace'],
                status: 'future'
              },
            ].map(l => (
              <div key={l.level} className={`maturity-level level-${l.status}`}>
                <div className="maturity-level-header">
                  <span className="maturity-num">L{l.level}</span>
                  <span className="maturity-nome">{l.nome}</span>
                  <span className={`maturity-badge badge-${l.status}`}>
                    {l.status === 'passed' ? '✅ Concluído' : l.status === 'current' ? '🔵 Atual' : l.status === 'next' ? '🎯 Próximo' : '🔮 Futuro'}
                  </span>
                </div>
                <div className="maturity-desc">{l.desc}</div>
                <div className="maturity-criterios">
                  {l.criterios.map((c, ci) => (
                    <span key={ci} className={`maturity-criterio ${l.status === 'passed' || l.status === 'current' ? 'criterio-done' : 'criterio-pending'}`}>
                      {l.status === 'passed' || l.status === 'current' ? '✓' : '○'} {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Roadmap para L4 */}
          <div className="maturity-roadmap">
            <h4>🗺️ Roadmap para Nível 4 (Quantificado)</h4>
            <div className="roadmap-timeline">
              {[
                { quarter: 'Q3 2026', items: ['Implementar Datadog APM', 'Portal de status público', 'SLA enforcement com alertas automáticos'] },
                { quarter: 'Q4 2026', items: ['NPS real (pesquisa trimestral)', 'Revenue dashboard por contrato', 'Predictive maintenance via ML'] },
                { quarter: 'Q1 2027', items: ['Self-service portal do cliente', 'API pública + developer docs', 'Auto-scaling de infraestrutura'] },
                { quarter: 'Q2 2027', items: ['Customer Success playbooks', 'Churn prediction model', 'Marketplace de integrações'] },
              ].map((q, qi) => (
                <div key={qi} className="roadmap-quarter">
                  <div className="roadmap-quarter-label">{q.quarter}</div>
                  <div className="roadmap-items">
                    {q.items.map((item, ii) => (
                      <div key={ii} className="roadmap-item">
                        <span className="roadmap-dot" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Saúde & Conformidade — View unificada (Health + Audit + Correção)
   ═══════════════════════════════════════════════════════════════════════ */

function HealthConformityView({ healthScores, activeSites, sistema, anomalies, onHealthDetail }) {
  const [subTab, setSubTab] = useState('overview');
  const [selectedSite, setSelectedSite] = useState(null);
  const [overviewSite, setOverviewSite] = useState(null);
  const [actionsSite, setActionsSite] = useState('__all__');

  const audits = useMemo(() =>
    activeSites.map(s => auditSite(s, s._sistema || (s.faixas != null ? 'axcross' : 'axhub')))
      .sort((a, b) => a.compliance - b.compliance),
    [activeSites]
  );

  const correctionPlan = useMemo(() => generateCorrectionPlan(activeSites), [activeSites]);

  const conformes = audits.filter(a => a.compliance === 100).length;
  const divergentes = audits.filter(a => a.compliance < 100).length;
  const criticos = audits.filter(a => a.compliance < 50).length;

  // Dados consolidados por site
  const siteData = useMemo(() => {
    return healthScores.map(({ site, score }) => {
      const sist = site._sistema || (site.faixas != null ? 'axcross' : 'axhub');
      const audit = audits.find(a => a.site.id === site.id);
      const siteAnomalies = anomalies.filter(a => a.site === site.nome);
      const siteCorrections = correctionPlan.filter(c => c.site === site.nome);
      return { site, score, sist, audit, anomalies: siteAnomalies, corrections: siteCorrections };
    });
  }, [healthScores, audits, anomalies, correctionPlan]);

  return (
    <div className="health-conformity-view">
      {/* Summary bar */}
      <div className="hc-summary">
        <div className="hc-summary-item">
          <span className="hc-sum-value">{healthScores.length}</span>
          <span className="hc-sum-label">Sites Analisados</span>
        </div>
        <div className="hc-summary-item good">
          <span className="hc-sum-value">{conformes}</span>
          <span className="hc-sum-label">✅ Conformes</span>
        </div>
        <div className="hc-summary-item warn">
          <span className="hc-sum-value">{divergentes}</span>
          <span className="hc-sum-label">⚠️ Divergentes</span>
        </div>
        <div className="hc-summary-item bad">
          <span className="hc-sum-value">{criticos}</span>
          <span className="hc-sum-label">🔴 Críticos</span>
        </div>
        <div className="hc-summary-item">
          <span className="hc-sum-value">{correctionPlan.length}</span>
          <span className="hc-sum-label">🛠️ Ações Pendentes</span>
        </div>
      </div>

      {/* Sub-tabs — botões de menu */}
      <div className="hc-subtabs">
        {[
          { id: 'overview', label: '📋 Visão Geral' },
          { id: 'details',  label: '🔍 Por Site' },
          { id: 'actions',  label: '🛠️ Plano de Ações' },
        ].map(t => (
          <button key={t.id} className={`hc-subtab ${subTab === t.id ? 'active' : ''}`} onClick={() => setSubTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Sub-tab: Overview — QuickSelect + detalhe */}
      {subTab === 'overview' && (() => {
        const avgH = Math.round(healthScores.reduce((a, h) => a + h.score, 0) / (healthScores.length || 1));

        const overviewOptions = [
          {
            id: '__all__',
            label: 'Todos os Sites',
            desc: `${healthScores.length} sites · média ${avgH}% · ${conformes} conformes · ${criticos} críticos`,
            badge: `${avgH}%`,
          },
          ...healthScores.map(({ site, score }) => {
            const sist = site._sistema || (site.faixas != null ? 'axcross' : 'axhub');
            const statsText = sist === 'axhub'
              ? `${site.equipamentos?.total || 0} equip · ${site.bi?.length || 0} BI`
              : `${site.equipamentos || 0} equip · ${(site.passagensDia || 0).toLocaleString('pt-BR')} p/d`;
            const c = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
            return { id: site.id, label: site.nome, desc: `${site.estado} · ${statsText}`, badge: `${score}%`, _color: c };
          }),
        ];

        const sel = overviewSite === '__all__'
          ? (
            <div style={{
              marginTop: 16, background: '#fff', borderRadius: 16,
              border: '2px solid #6366f144', boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
              padding: '20px 24px',
            }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#374151', marginBottom: 14 }}>
                📊 Resumo Geral — {healthScores.length} Sites
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10 }}>
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                  <LightGauge value={avgH} color={avgH >= 80 ? '#22c55e' : avgH >= 60 ? '#f59e0b' : '#ef4444'} size={80} />
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Média Health</div>
                </div>
                <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#22c55e' }}>{conformes}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>✅ Conformes</div>
                </div>
                <div style={{ background: '#fffbeb', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b' }}>{divergentes}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>⚠️ Divergentes</div>
                </div>
                <div style={{ background: '#fef2f2', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#ef4444' }}>{criticos}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>🔴 Críticos</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#6366f1' }}>{correctionPlan.length}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>🛠️ Ações</div>
                </div>
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                <button onClick={() => { setSubTab('details'); }}
                  style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                  🔍 Ver Todos os Detalhes
                </button>
                <button onClick={() => { setSubTab('actions'); }}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                  🛠️ Plano de Ações
                </button>
              </div>
            </div>
          )
          : overviewSite
          ? (() => {
              const found = healthScores.find(h => h.site.id === overviewSite);
              if (!found) return null;
              const { site, score } = found;
              const sist = site._sistema || (site.faixas != null ? 'axcross' : 'axhub');
              const audit = audits.find(a => a.site.id === site.id);
              const c = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
              return (
                <div style={{
                  marginTop: 16, background: '#fff', borderRadius: 16,
                  border: `2px solid ${c}44`, boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                  padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap',
                }}>
                  {/* Gauge */}
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <LightGauge value={score} color={c} size={110} />
                    <div style={{ fontSize: 11, fontWeight: 700, color: c, marginTop: 4 }}>Health Score</div>
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontWeight: 800, fontSize: 18, color: '#1e293b' }}>{site.nome}</span>
                      <span style={{ fontSize: 11, background: sist === 'axhub' ? '#eff6ff' : '#f0fdf4', color: sist === 'axhub' ? '#3b82f6' : '#10b981', borderRadius: 20, padding: '2px 10px', fontWeight: 700 }}>
                        {sist === 'axhub' ? '🚦 AxHub' : '📡 AxCross'}
                      </span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>📍 {site.estado}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginTop: 8 }}>
                      {sist === 'axhub' ? (
                        <>
                          <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>{site.equipamentos?.total || 0}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>Equipamentos</div>
                          </div>
                          <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#3b82f6' }}>{site.bi?.length || 0}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>BI Reports</div>
                          </div>
                          {site.ocr != null && (
                            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                              <div style={{ fontSize: 18, fontWeight: 800, color: site.ocr > 80 ? '#22c55e' : '#f59e0b' }}>{site.ocr}%</div>
                              <div style={{ fontSize: 11, color: '#94a3b8' }}>OCR</div>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>{site.equipamentos || 0}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>Equipamentos</div>
                          </div>
                          <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>{site.faixas || 0}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>Faixas</div>
                          </div>
                          <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#6366f1' }}>{(site.passagensDia || 0).toLocaleString('pt-BR')}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>Pass/dia</div>
                          </div>
                        </>
                      )}
                      {audit && (
                        <div style={{ background: audit.compliance === 100 ? '#f0fdf4' : audit.compliance < 50 ? '#fef2f2' : '#fffbeb', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                          <div style={{ fontSize: 18, fontWeight: 800, color: audit.compliance === 100 ? '#22c55e' : audit.compliance < 50 ? '#ef4444' : '#f59e0b' }}>{audit.compliance}%</div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>Conformidade</div>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Ação */}
                  <button
                    onClick={() => { setSelectedSite(overviewSite); setSubTab('details'); }}
                    style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: c, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', flexShrink: 0 }}
                  >
                    🔍 Ver Detalhes
                  </button>
                </div>
              );
            })()
          : (
            <div style={{ marginTop: 12, padding: '16px', background: '#f8fafc', borderRadius: 12, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
              ☝️ Selecione um site acima para ver seu health score e detalhes
            </div>
          );

        return (
          <div>
            <QuickSelect
              options={overviewOptions}
              value={overviewSite}
              onChange={setOverviewSite}
              label="Site"
              color="#6366f1"
              width={340}
              showSearch
            />
            {sel}
          </div>
        );
      })()}

      {/* Sub-tab: Detalhes por site — QuickSelect + detalhe inline */}
      {subTab === 'details' && (() => {
        const avgH = Math.round(healthScores.reduce((a, h) => a + h.score, 0) / (healthScores.length || 1));
        const detailOptions = [
          {
            id: '__all__',
            label: 'Todos os Sites',
            desc: `${healthScores.length} sites · média ${avgH}% · ${criticos} críticos`,
            badge: `${avgH}%`,
          },
          ...healthScores.map(({ site, score }) => {
            const sist = site._sistema || (site.faixas != null ? 'axcross' : 'axhub');
            const statsText = sist === 'axhub'
              ? `${site.equipamentos?.total || 0} equip · ${site.bi?.length || 0} BI`
              : `${site.equipamentos || 0} equip · ${(site.passagensDia || 0).toLocaleString('pt-BR')} p/d`;
            return { id: site.id, label: site.nome, desc: `${site.estado} · ${statsText}`, badge: `${score}%` };
          }),
        ];

        const detailValue = selectedSite || '__all__';
        const handleDetailChange = (v) => setSelectedSite(v === '__all__' ? null : v);

        const visibleData = selectedSite
          ? siteData.filter(d => d.site.id === selectedSite)
          : siteData;

        return (
          <div>
            <QuickSelect
              options={detailOptions}
              value={detailValue}
              onChange={handleDetailChange}
              label="Site"
              color="#6366f1"
              width={340}
              showSearch
            />
            <div className="hc-details" style={{ marginTop: 16 }}>
              {visibleData.map(({ site, score, sist, audit, anomalies: siteAnom, corrections }) => (
                <div key={site.id} className={`hc-site-card ${score >= 80 ? 'hc-good' : score >= 50 ? 'hc-warn' : 'hc-bad'}`}>
                  <div className="hc-site-header">
                    <div className="hc-site-left">
                      <span className="hc-site-badge">{sist === 'axhub' ? '🔵' : '🟠'}</span>
                      <span className="hc-site-name">{site.nome}</span>
                      <span className="hc-site-estado">{site.estado}</span>
                    </div>
                    <div className="hc-site-right">
                      <LightGauge value={score} color={score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'} size={56} />
                      {audit && (
                        <span className={`hc-compliance-badge ${audit.compliance === 100 ? 'badge-conforme' : audit.compliance < 50 ? 'badge-critico' : 'badge-divergente'}`}>
                          {audit.compliance}% conforme
                        </span>
                      )}
                    </div>
                  </div>

                  {audit && audit.compliance < 100 && (
                    <div className="hc-section">
                      <div className="hc-section-title">🔍 Divergências de Conformidade</div>
                      <div className="hc-criteria-list">
                        {audit.results.filter(r => !r.conforme).map(r => (
                          <div key={r.id} className="hc-criteria-item">
                            <span className="hc-crit-icon">❌</span>
                            <span className="hc-crit-label">{r.label}</span>
                            <span className="hc-crit-value">{r.valorAtual}</span>
                            <span className="hc-crit-bench">Meta: {r.benchmark}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {siteAnom.length > 0 && (
                    <div className="hc-section">
                      <div className="hc-section-title">⚡ Alertas ({siteAnom.length})</div>
                      <div className="hc-anomaly-list">
                        {siteAnom.map((a, i) => (
                          <div key={i} className={`hc-anomaly-item sev-${a.severity}`}>
                            <span className="hc-anom-sev">{a.severity === 'high' ? '🔴' : a.severity === 'medium' ? '🟡' : '🔵'}</span>
                            <span className="hc-anom-msg">{a.msg}</span>
                            <span className="hc-anom-action">{a.acao}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {corrections.length > 0 && (
                    <div className="hc-section">
                      <div className="hc-section-title">🛠️ Ações de Correção ({corrections.length})</div>
                      <div className="hc-corrections-list">
                        {corrections.map((c, i) => (
                          <div key={i} className="hc-correction-item">
                            <span className={`hc-corr-sev sev-${c.severidade}`}>{c.severidade === 'alta' ? '🔴' : c.severidade === 'media' ? '🟡' : '🟢'}</span>
                            <div className="hc-corr-content">
                              <span className="hc-corr-action">{c.acao}</span>
                              <span className="hc-corr-meta">{c.responsavel} • {c.prazo}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {audit?.compliance === 100 && siteAnom.length === 0 && (
                    <div className="hc-section hc-all-good">
                      <span>✅ Site em plena conformidade — nenhuma ação necessária</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Sub-tab: Plano de Ações — QuickSelect + lista filtrada */}
      {subTab === 'actions' && (() => {
        // Sites únicos que têm ações
        const sitesComAcoes = [...new Map(correctionPlan.map(c => [c.site, c])).values()];
        const actionsOptions = [
          {
            id: '__all__',
            label: 'Todos os Sites',
            desc: `${correctionPlan.length} ações · ${correctionPlan.filter(c => c.severidade === 'alta').length} urgentes · ${correctionPlan.filter(c => c.severidade === 'media').length} médias`,
            badge: `${correctionPlan.length}`,
          },
          ...sitesComAcoes.map(c => {
            const total = correctionPlan.filter(a => a.site === c.site).length;
            const urgentes = correctionPlan.filter(a => a.site === c.site && a.severidade === 'alta').length;
            return {
              id: c.site,
              label: c.site,
              desc: `${c.estado} · ${c.sistema === 'axhub' ? '🔵 AxHub' : '🟠 AxCross'} · ${total} ação${total !== 1 ? 'ões' : ''}${urgentes ? ` · ${urgentes} urgente${urgentes !== 1 ? 's' : ''}` : ''}`,
              badge: `${total}`,
            };
          }),
        ];

        const visibleActions = actionsSite === '__all__'
          ? correctionPlan
          : correctionPlan.filter(c => c.site === actionsSite);

        const alta = visibleActions.filter(c => c.severidade === 'alta').length;
        const media = visibleActions.filter(c => c.severidade === 'media').length;
        const baixa = visibleActions.filter(c => c.severidade === 'baixa').length;

        return (
          <div>
            <QuickSelect
              options={actionsOptions}
              value={actionsSite}
              onChange={setActionsSite}
              label="Site"
              color="#6366f1"
              width={340}
              showSearch
            />
            <div className="hc-actions" style={{ marginTop: 16 }}>
              <div className="hc-actions-header">
                <h4>🛠️ {actionsSite === '__all__' ? 'Plano de Correção Consolidado' : `Ações — ${actionsSite}`} — {visibleActions.length} ações</h4>
                <div className="hc-actions-stats">
                  <span className="hc-act-stat alta">{alta} urgentes</span>
                  <span className="hc-act-stat media">{media} médias</span>
                  <span className="hc-act-stat baixa">{baixa} baixas</span>
                </div>
              </div>
              <div className="hc-actions-list">
                {visibleActions.map((c, i) => (
                  <div key={i} className={`hc-action-card sev-${c.severidade}`}>
                    <div className="hc-action-header">
                      <span className={`hc-action-sev sev-${c.severidade}`}>
                        {c.severidade === 'alta' ? '🔴 URGENTE' : c.severidade === 'media' ? '🟡 MÉDIA' : '🟢 BAIXA'}
                      </span>
                      <span className="hc-action-site">{c.site} ({c.estado})</span>
                      <span className="hc-action-sistema">{c.sistema === 'axhub' ? '🔵' : '🟠'}</span>
                    </div>
                    <div className="hc-action-body">
                      <div className="hc-action-name">{c.acao}</div>
                      <div className="hc-action-details">
                        <span>👤 {c.responsavel}</span>
                        <span>⏱️ {c.prazo}</span>
                        <span>📋 {c.criterio}: {c.valorAtual} → {c.benchmark}</span>
                      </div>
                      <div className="hc-action-procedure">{c.procedimento}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Comparativo — Radar + Topologia com toggle
   ═══════════════════════════════════════════════════════════════════════ */

function ComparativoView({ sites, sistema }) {
  const [mode, setMode] = useState('radar');

  return (
    <div className="comparativo-view">
      <div className="comp-toggle">
        <button className={`comp-toggle-btn ${mode === 'radar' ? 'active' : ''}`} onClick={() => setMode('radar')}>
          🕸️ Radar Comparativo
        </button>
        <button className={`comp-toggle-btn ${mode === 'topology' ? 'active' : ''}`} onClick={() => setMode('topology')}>
          🌐 Topologia de Rede
        </button>
      </div>
      {mode === 'radar' && <RadarChart sites={sites} sistema={sistema} />}
      {mode === 'topology' && <NetworkTopology sites={sites} sistema={sistema} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Página Principal — Intelligence Dashboard
   ═══════════════════════════════════════════════════════════════════════ */

export default function IntelligenceDashboard() {
  const [sistema, setSistema] = useState('todos');
  const [view, setView] = useState('overview');
  const [healthDetail, setHealthDetail] = useState(null);

  const allAxhub = useMemo(() => AXHUB_SITES.map(s => ({ ...s, _sistema: 'axhub' })), []);
  const allAxcross = useMemo(() => AXCROSS_SITES.map(s => ({ ...s, _sistema: 'axcross' })), []);

  const sites = sistema === 'axhub' ? allAxhub
    : sistema === 'axcross' ? allAxcross
    : [...allAxhub, ...allAxcross];
  const activeSites = sites.filter(s => s.status === 'ativo');

  const healthScores = useMemo(() =>
    activeSites.map(s => ({ site: s, score: calcHealthScore(s, s._sistema || (s.faixas != null ? 'axcross' : 'axhub')) }))
      .sort((a, b) => b.score - a.score),
    [activeSites, sistema]
  );

  const avgHealth = Math.round(healthScores.reduce((a, h) => a + h.score, 0) / healthScores.length || 0);
  const anomalies = useMemo(() => {
    if (sistema === 'todos') {
      return [
        ...detectAnomalies(allAxhub.filter(s => s.status === 'ativo'), 'axhub'),
        ...detectAnomalies(allAxcross.filter(s => s.status === 'ativo'), 'axcross')
      ].sort((a, b) => { const o = { high: 0, medium: 1, low: 2 }; return o[a.severity] - o[b.severity]; });
    }
    return detectAnomalies(activeSites, sistema);
  }, [activeSites, sistema]);
  const heatmapData = useMemo(() => generateHeatmapData(activeSites), [activeSites]);
  const capacity = useMemo(() => {
    if (sistema === 'todos') {
      const axhubCap = calcCapacity(allAxhub.filter(s => s.status === 'ativo'), 'axhub');
      const axcrossCap = calcCapacity(allAxcross.filter(s => s.status === 'ativo'), 'axcross');
      return {
        totalEquip: axhubCap.totalEquip + axcrossCap.totalEquip,
        totalFaixas: axcrossCap.totalFaixas,
        totalPass: axcrossCap.totalPass,
        avgPassPerEquip: axcrossCap.avgPassPerEquip,
        utilization: axcrossCap.utilization,
        projectedGrowth: 12,
        timeToCapacity: axcrossCap.timeToCapacity,
        sitesComBI: axhubCap.sitesComBI,
        sitesAtualizados: axhubCap.sitesAtualizados,
        coverage: axhubCap.coverage,
        updateCoverage: axhubCap.updateCoverage,
        recommendation: axcrossCap.utilization > 80 ? 'Expansão urgente' : 'Capacidade adequada — foco em atualização de contratos legados',
        _combined: true
      };
    }
    return calcCapacity(activeSites, sistema);
  }, [activeSites, sistema]);

  const saasMetrics = useMemo(() => calcSaaSMetrics(
    allAxhub.filter(s => s.status === 'ativo'),
    allAxcross.filter(s => s.status === 'ativo'),
    healthScores,
    anomalies
  ), [healthScores, anomalies]);

  const correctionPlan = useMemo(() => generateCorrectionPlan(activeSites), [activeSites]);

  const VIEWS = [
    { id: 'overview', label: '🎯 Overview', icon: '🎯' },
    { id: 'health', label: '💊 Saúde & Conformidade', icon: '💊' },
    { id: 'saas', label: '📊 Intelligence & Mercado', icon: '📊' },
    { id: 'comparativo', label: '🕸️ Comparativo', icon: '🕸️' },
    { id: 'investigacao', label: '🔥 Investigação', icon: '🔥' },
  ];

  return (
    <div className="intel-dashboard">
      {/* Health Detail Modal */}
      {healthDetail && <HealthDetailModal site={healthDetail} onClose={() => setHealthDetail(null)} />}

      {/* Header */}
      <div className="intel-header">
        <div>
          <h2>🧠 Intelligence Dashboard</h2>
          <p>Observabilidade operacional avançada — Auditoria, Conformidade, Health Score, SaaS Metrics, Benchmark de Mercado</p>
        </div>
        <div className="intel-header-controls">
          <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1.5px solid #e5e7eb' }}>
            {[
              { v: 'todos',   label: 'Todos' },
              { v: 'axhub',   label: '🚦 AxHub' },
              { v: 'axcross', label: '📡 AxCross' },
            ].map(op => (
              <button
                key={op.v}
                onClick={() => setSistema(op.v)}
                style={{
                  padding: '5px 10px', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  background: sistema === op.v ? '#6366f1' : '#f9fafb',
                  color: sistema === op.v ? '#fff' : '#6b7280',
                  transition: 'all 0.15s',
                }}
              >
                {op.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="intel-kpi-strip">
        <div className="intel-kpi">
          <RadialGauge value={avgHealth} label="Avg Health" size={64} />
        </div>
        <div className="intel-kpi text">
          <div className="intel-kpi-value">{activeSites.length}</div>
          <div className="intel-kpi-label">Sites Ativos</div>
        </div>
        {sistema === 'todos' && (
          <>
            <div className="intel-kpi text">
              <div className="intel-kpi-value" style={{ color: '#60a5fa' }}>{allAxhub.filter(s => s.status === 'ativo').length}</div>
              <div className="intel-kpi-label">AxHub</div>
            </div>
            <div className="intel-kpi text">
              <div className="intel-kpi-value" style={{ color: '#f97316' }}>{allAxcross.filter(s => s.status === 'ativo').length}</div>
              <div className="intel-kpi-label">AxCross</div>
            </div>
          </>
        )}
        <div className="intel-kpi text">
          <div className="intel-kpi-value" style={{ color: anomalies.filter(a => a.severity === 'high').length > 0 ? '#ef4444' : '#22c55e' }}>
            {anomalies.filter(a => a.severity === 'high').length}
          </div>
          <div className="intel-kpi-label">Alertas Críticos</div>
        </div>
        <div className="intel-kpi text">
          <div className="intel-kpi-value">{anomalies.filter(a => a.severity === 'medium').length}</div>
          <div className="intel-kpi-label">Atenção</div>
        </div>
        <div className="intel-kpi text">
          <div className="intel-kpi-value" style={{ color: '#60cdff' }}>
            {capacity.totalEquip?.toLocaleString('pt-BR')}
          </div>
          <div className="intel-kpi-label">Equipamentos</div>
        </div>
        <div className="intel-kpi text">
          <div className="intel-kpi-value" style={{ color: parseFloat(saasMetrics.uptime) >= 99.5 ? '#22c55e' : '#f59e0b' }}>
            {saasMetrics.uptime}%
          </div>
          <div className="intel-kpi-label">Uptime</div>
        </div>
        <div className="intel-kpi text">
          <div className="intel-kpi-value" style={{ color: saasMetrics.slaCompliance >= 95 ? '#22c55e' : '#f59e0b' }}>
            {saasMetrics.slaCompliance}%
          </div>
          <div className="intel-kpi-label">SLA</div>
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="intel-nav">
        {VIEWS.map(v => (
          <button
            key={v.id}
            className={`intel-nav-btn ${view === v.id ? 'active' : ''}`}
            onClick={() => setView(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="intel-content">
        {view === 'overview' && (
          <OverviewDashboard
            healthScores={healthScores}
            avgHealth={avgHealth}
            anomalies={anomalies}
            activeSites={activeSites}
            sites={sites}
            saasMetrics={saasMetrics}
            correctionPlan={correctionPlan}
          />
        )}

        {view === 'health' && (
          <HealthConformityView
            healthScores={healthScores}
            activeSites={activeSites}
            sistema={sistema}
            anomalies={anomalies}
            onHealthDetail={setHealthDetail}
          />
        )}

        {view === 'saas' && (
          <SaaSMetricsView metrics={saasMetrics} />
        )}

        {view === 'comparativo' && (
          <ComparativoView sites={activeSites} sistema={sistema} />
        )}

        {view === 'investigacao' && (
          <EnhancedAnomalyPanel anomalies={anomalies} />
        )}
      </div>
    </div>
  );
}
