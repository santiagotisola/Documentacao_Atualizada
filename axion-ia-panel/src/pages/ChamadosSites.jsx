import React, { useState, useEffect, useMemo } from 'react';
import { AXHUB_SITES, AXCROSS_SITES } from '../data/sitesData';
import { apiFetch } from '../services/api';
import './ChamadosSites.css';

// Sites AxTon (pesagem) — não existem no sitesData, mapeados manualmente
const AXTON_SITES = [
  { id: 'imepi', nome: 'IMEPI', estado: 'PI', orgao: 'IMEPI' },
  { id: 'ipemce', nome: 'IPEM/CE', estado: 'CE', orgao: 'IPEM/CE' },
  { id: 'economia', nome: 'Economia', estado: 'GO', orgao: 'Secretaria de Economia' },
  { id: 'detranpi', nome: 'Detran/PI', estado: 'PI', orgao: 'DETRAN/PI' },
  { id: 'goiania', nome: 'Goiânia', estado: 'GO', orgao: 'SET/GYN' },
];

const TODOS_SITES = [
  ...AXHUB_SITES.map(s => ({ ...s, sistema: 'AxHub' })),
  ...AXCROSS_SITES.map(s => ({ ...s, sistema: 'AxCross' })),
  ...AXTON_SITES.map(s => ({ ...s, sistema: 'AxTon' })),
];

/* ── Helpers ─────────────────────────────────────────────────────────── */

function prioridadeLabel(p) {
  if (p === 2) return { texto: 'Crítica', cor: '#dc2626', icon: '🔴' };
  if (p === 1) return { texto: 'Alta', cor: '#f59e0b', icon: '🟠' };
  if (p === 0) return { texto: 'Normal', cor: '#3b82f6', icon: '🔵' };
  return { texto: 'Baixa', cor: '#6b7280', icon: '⚪' };
}

function tempoAtras(data) {
  if (!data) return '—';
  const diff = Date.now() - new Date(data).getTime();
  const horas = Math.floor(diff / (1000 * 60 * 60));
  if (horas < 1) return 'agora';
  if (horas < 24) return `${horas}h atrás`;
  const dias = Math.floor(horas / 24);
  if (dias < 30) return `${dias}d atrás`;
  return `${Math.floor(dias / 30)}m atrás`;
}

function getSiteInfo(siteId) {
  const found = TODOS_SITES.find(s => s.id === siteId);
  if (found) return found;
  // Fallback para sites não mapeados localmente
  const isCross = siteId.endsWith('-cross');
  const sistema = isCross ? 'AxCross' : 'AxHub';
  return { id: siteId, nome: siteId.toUpperCase().replace(/-/g, ' '), sistema, estado: '—' };
}

/* ── Componentes ─────────────────────────────────────────────────────── */

function KPICards({ kpis }) {
  if (!kpis) return null;
  const cards = [
    { label: 'Total Chamados', valor: kpis.totalTickets, icon: '🎫', cor: '#3b82f6' },
    { label: 'Abertos', valor: kpis.abertos, icon: '📂', cor: '#f59e0b' },
    { label: 'Fechados', valor: kpis.fechados, icon: '✅', cor: '#22c55e' },
    { label: 'Críticos', valor: kpis.criticos, icon: '🔴', cor: '#dc2626' },
    { label: 'Sem Resposta', valor: kpis.semResposta, icon: '⏳', cor: '#8b5cf6' },
    { label: 'Sites c/ Demanda', valor: kpis.sitesComDemanda, icon: '🏢', cor: '#0ea5e9' },
    { label: 'Não Associados', valor: kpis.categoriasNaoAssociadas, icon: '❓', cor: '#6b7280' },
  ];

  return (
    <div className="ch-kpi-grid">
      {cards.map(c => (
        <div key={c.label} className="ch-kpi-card" style={{ borderTopColor: c.cor }}>
          <span className="ch-kpi-icon">{c.icon}</span>
          <span className="ch-kpi-valor">{c.valor ?? 0}</span>
          <span className="ch-kpi-label">{c.label}</span>
        </div>
      ))}
    </div>
  );
}

function RankingTable({ ranking }) {
  if (!ranking || ranking.length === 0) return <p className="ch-vazio">Nenhum site com demanda ativa</p>;
  return (
    <div className="ch-secao">
      <h3>📊 Ranking de Demandas por Site</h3>
      <p className="ch-secao-desc">Sites ordenados pelo volume de chamados abertos — identifique onde concentrar esforços</p>
      <table className="ch-tabela">
        <thead>
          <tr>
            <th>Site</th>
            <th>Sistema</th>
            <th>Estado</th>
            <th>Abertos</th>
            <th>Total</th>
            <th>Críticos</th>
            <th>Proporção</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map(r => {
            const site = getSiteInfo(r.siteId);
            const pct = r.total > 0 ? Math.round((r.abertos / r.total) * 100) : 0;
            return (
              <tr key={r.siteId}>
                <td><strong>{site?.nome || r.siteId}</strong></td>
                <td>{site?.sistema || '—'}</td>
                <td>{site?.estado || '—'}</td>
                <td><span className="ch-badge-aberto">{r.abertos}</span></td>
                <td>{r.total}</td>
                <td>{r.criticos > 0 ? <span className="ch-badge-critico">{r.criticos}</span> : '—'}</td>
                <td>
                  <div className="ch-barra-bg">
                    <div className="ch-barra-fill" style={{ width: `${pct}%`, background: pct > 50 ? '#dc2626' : pct > 25 ? '#f59e0b' : '#22c55e' }} />
                  </div>
                  <span className="ch-barra-pct">{pct}%</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SiteDetail({ siteResumo }) {
  if (!siteResumo) return null;
  const site = getSiteInfo(siteResumo.siteId);
  return (
    <div className="ch-site-detalhe">
      <div className="ch-site-header">
        <h4>{site?.nome || siteResumo.siteId} <span className="ch-site-sistema">{site?.sistema}</span></h4>
        <div className="ch-site-metricas">
          <span>Abertos: <strong>{siteResumo.metricas.abertos}</strong></span>
          <span>Total: <strong>{siteResumo.metricas.total}</strong></span>
          <span>Críticos: <strong>{siteResumo.metricas.criticos}</strong></span>
        </div>
      </div>
      {siteResumo.ticketsAbertos.length > 0 ? (
        <table className="ch-tabela ch-tabela-compact">
          <thead>
            <tr><th>ID</th><th>Assunto</th><th>Prior.</th><th>Status</th><th>Técnico</th><th>Atualizado</th></tr>
          </thead>
          <tbody>
            {siteResumo.ticketsAbertos.map(t => {
              const prio = prioridadeLabel(t.prioridade);
              return (
                <tr key={t.id}>
                  <td>
                    <a href={`https://desk.axiontecnologia.com.br/helpdesk/Ticket/${t.id}`} target="_blank" rel="noopener noreferrer">
                      #{t.id}
                    </a>
                  </td>
                  <td className="ch-assunto">{t.assunto}</td>
                  <td><span title={prio.texto}>{prio.icon}</span></td>
                  <td>{t.status}</td>
                  <td>{t.tecnico || '—'}</td>
                  <td>{tempoAtras(t.atualizado)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="ch-vazio">Sem chamados abertos</p>
      )}
    </div>
  );
}

function DuplicadosPanel({ duplicados }) {
  if (!duplicados || duplicados.length === 0) return null;
  return (
    <div className="ch-secao ch-duplicados">
      <h3>🔄 Possíveis Duplicados</h3>
      <p className="ch-secao-desc">Chamados com assuntos semelhantes que podem ser consolidados para reduzir esforço</p>
      {duplicados.slice(0, 10).map((d, i) => (
        <div key={i} className="ch-dup-item">
          <span className="ch-dup-count">{d.quantidade}×</span>
          <span className="ch-dup-assunto">{d.assuntoNormalizado}</span>
          <div className="ch-dup-tickets">
            {d.tickets.map(t => (
              <a key={t.id} href={`https://desk.axiontecnologia.com.br/helpdesk/Ticket/${t.id}`}
                target="_blank" rel="noopener noreferrer" className="ch-dup-link">
                #{t.id} ({t.status})
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function NaoAssociados({ items, onAssociar }) {
  const [selecionado, setSelecionado] = useState({});
  if (!items || items.length === 0) return null;

  return (
    <div className="ch-secao ch-nao-assoc">
      <h3>❓ Categorias Não Associadas</h3>
      <p className="ch-secao-desc">
        Categorias do helpdesk que não foram automaticamente vinculadas a nenhum site. 
        Associe manualmente abaixo.
      </p>
      <table className="ch-tabela">
        <thead>
          <tr><th>Categoria</th><th>Seção</th><th>Tickets</th><th>Associar a</th><th>Ação</th></tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.categoriaId}>
              <td><strong>{item.categoriaNome}</strong></td>
              <td>{item.secao || '—'}</td>
              <td>{item.tickets}</td>
              <td>
                <select
                  value={selecionado[item.categoriaId] || ''}
                  onChange={e => setSelecionado(prev => ({ ...prev, [item.categoriaId]: e.target.value }))}
                  className="ch-select-mini"
                >
                  <option value="">— Selecionar site —</option>
                  {TODOS_SITES.map(s => (
                    <option key={s.id} value={s.id}>[{s.sistema}] {s.nome}</option>
                  ))}
                </select>
              </td>
              <td>
                <button
                  className="ch-btn-assoc"
                  disabled={!selecionado[item.categoriaId]}
                  onClick={() => {
                    onAssociar(item.categoriaId, selecionado[item.categoriaId]);
                    setSelecionado(prev => { const n = { ...prev }; delete n[item.categoriaId]; return n; });
                  }}
                >
                  Vincular
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InsightsPanel({ data }) {
  if (!data) return null;
  const { kpis, ranking, possivelDuplicados } = data;
  
  const insights = [];

  // Insight: Sites críticos
  const criticos = ranking?.filter(r => r.criticos > 0) || [];
  if (criticos.length > 0) {
    insights.push({
      tipo: 'alerta',
      icon: '🚨',
      titulo: `${criticos.length} site(s) com chamados críticos`,
      detalhe: criticos.map(c => {
        const s = getSiteInfo(c.siteId);
        return `${s?.nome || c.siteId} (${c.criticos} críticos)`;
      }).join(', '),
      recomendacao: 'Priorizar resolução dos chamados críticos — impacto direto no SLA e satisfação do cliente.',
    });
  }

  // Insight: Taxa de resolução
  if (kpis.totalTickets > 0) {
    const taxaResolucao = Math.round((kpis.fechados / kpis.totalTickets) * 100);
    if (taxaResolucao < 70) {
      insights.push({
        tipo: 'atencao',
        icon: '⚠️',
        titulo: `Taxa de resolução: ${taxaResolucao}%`,
        detalhe: `${kpis.abertos} chamados ainda abertos de ${kpis.totalTickets} total.`,
        recomendacao: 'Benchmarks de mercado (Zendesk, Freshdesk) apontam taxa ideal acima de 85%. Considere automação de respostas frequentes e escalonamento por SLA.',
      });
    } else {
      insights.push({
        tipo: 'positivo',
        icon: '✅',
        titulo: `Taxa de resolução: ${taxaResolucao}%`,
        detalhe: 'Dentro do benchmark de mercado para SaaS B2B (>70%).',
        recomendacao: 'Manter o nível — monitorar tendências mensais para antecipar degradação.',
      });
    }
  }

  // Insight: Duplicados
  if (possivelDuplicados?.length > 3) {
    insights.push({
      tipo: 'oportunidade',
      icon: '💡',
      titulo: `${possivelDuplicados.length} padrões de chamados duplicados`,
      detalhe: `Exemplo: "${possivelDuplicados[0]?.assuntoNormalizado}" aparece ${possivelDuplicados[0]?.quantidade}× em diferentes sites.`,
      recomendacao: 'Criar artigos na Knowledge Base para temas recorrentes. Ferramentas como Zendesk e Intercom sugerem deflection rate > 30% com KB bem estruturada.',
    });
  }

  // Insight: Sem resposta
  if (kpis.semResposta > 5) {
    insights.push({
      tipo: 'alerta',
      icon: '⏳',
      titulo: `${kpis.semResposta} chamados sem resposta do suporte`,
      detalhe: 'Tickets atualizados pelo cliente mas sem retorno do técnico.',
      recomendacao: 'First Response Time (FRT) é métrica-chave em SaaS. Meta de mercado: < 4h para prioridade alta, < 24h para normal. Configure alertas automáticos no Jitbit.',
    });
  }

  // Insight: Concentração
  if (ranking?.length > 0) {
    const topSite = ranking[0];
    const topPct = kpis.abertos > 0 ? Math.round((topSite.abertos / kpis.abertos) * 100) : 0;
    if (topPct > 40) {
      const s = getSiteInfo(topSite.siteId);
      insights.push({
        tipo: 'atencao',
        icon: '📊',
        titulo: `${s?.nome || topSite.siteId} concentra ${topPct}% dos chamados abertos`,
        detalhe: `${topSite.abertos} de ${kpis.abertos} chamados abertos são deste site.`,
        recomendacao: 'Investigar causa raiz: pode ser treinamento insuficiente, bug sistêmico, ou contrato com escopo maior. Agendar sessão de onboarding focada.',
      });
    }
  }

  // Insight: LGPD
  insights.push({
    tipo: 'info',
    icon: '🔒',
    titulo: 'Conformidade LGPD',
    detalhe: 'Dados exibidos são operacionais (tickets, categorias, métricas de SLA). Não inclui dados pessoais sensíveis de titulares.',
    recomendacao: 'Manter: não expor CPF/RG de infratores, dados de saúde ou financeiros. Logs de acesso do helpdesk devem ter retenção máxima de 6 meses conforme Art. 16 LGPD.',
  });

  if (insights.length === 0) return null;

  return (
    <div className="ch-secao ch-insights">
      <h3>🧠 Inteligência Operacional</h3>
      <p className="ch-secao-desc">
        Análise automática baseada em benchmarks de mercado (Zendesk, Freshdesk, Intercom, Jira Service Management) 
        e boas práticas de gestão SaaS
      </p>
      {insights.map((ins, i) => (
        <div key={i} className={`ch-insight ch-insight-${ins.tipo}`}>
          <div className="ch-insight-header">
            <span>{ins.icon}</span>
            <strong>{ins.titulo}</strong>
          </div>
          <p className="ch-insight-detalhe">{ins.detalhe}</p>
          <p className="ch-insight-reco">💡 <em>{ins.recomendacao}</em></p>
        </div>
      ))}
    </div>
  );
}

/* ── Página Principal ────────────────────────────────────────────────── */

const TABS = [
  { id: 'overview', label: '📊 Overview' },
  { id: 'por-site', label: '🏢 Por Site' },
  { id: 'duplicados', label: '🔄 Duplicados' },
  { id: 'associacao', label: '🔗 Associação' },
  { id: 'insights', label: '🧠 Insights' },
];

function ChamadosSites({ embedded = false }) {
  const [tab, setTab] = useState('overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [filtroSite, setFiltroSite] = useState('');

  const carregarDados = async () => {
    setLoading(true);
    setErro(null);
    try {
      const resp = await apiFetch(`/helpdesk/sites-overview?mode=all&count=300`);
      if (!resp.ok) throw new Error(`API ${resp.status}`);
      const json = await resp.json();
      setData(json);
    } catch (e) {
      setErro(`Erro ao carregar dados: ${e.message}. Verifique se a API está rodando em localhost:3100.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  const handleAssociar = async (categoriaId, siteId) => {
    try {
      await apiFetch(`/helpdesk/mapa-sites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoriaId, siteId }),
      });
      carregarDados(); // Reload
    } catch (e) {
      alert(`Erro: ${e.message}`);
    }
  };

  const sitesComDados = useMemo(() => {
    if (!data?.sitesResumo) return [];
    let sites = data.sitesResumo;
    if (filtroSite) {
      sites = sites.filter(s => s.siteId === filtroSite);
    }
    return sites.sort((a, b) => b.metricas.abertos - a.metricas.abertos);
  }, [data, filtroSite]);

  return (
    <>
      <div className="ch-page">
        {!embedded && (
        <div className="ch-header">
          <div>
            <h1>🎫 Chamados × Sites</h1>
            <p>
              Visão integrada entre o Helpdesk Jitbit e os sites AxHub/AxCross — demandas abertas, 
              relevância, duplicados e inteligência operacional para tomada de decisão.
            </p>
          </div>
          <button className="ch-btn-reload" onClick={carregarDados} disabled={loading}>
            {loading ? '⏳ Carregando...' : '🔄 Atualizar'}
          </button>
        </div>
        )}
        {embedded && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 4 }}>🎫 Chamados × Sites</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Visão integrada: demandas por site, duplicados e inteligência operacional.
              </p>
            </div>
            <button className="btn" style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)', fontSize: '0.82rem' }} onClick={carregarDados} disabled={loading}>
              {loading ? '⏳...' : '🔄 Atualizar'}
            </button>
          </div>
        )}

        {erro && <div className="ch-erro">{erro}</div>}

        {!erro && !loading && data && (
          <>
            <KPICards kpis={data.kpis} />

            {/* Tabs */}
            <div className="ch-tabs">
              {TABS.map(t => (
                <button
                  key={t.id}
                  className={`ch-tab ${tab === t.id ? 'active' : ''}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Overview */}
            {tab === 'overview' && (
              <>
                <RankingTable ranking={data.ranking} />
                <InsightsPanel data={data} />
              </>
            )}

            {/* Por Site */}
            {tab === 'por-site' && (
              <div className="ch-secao">
                <h3>🏢 Chamados por Site</h3>
                <div className="ch-filtro-site">
                  <select value={filtroSite} onChange={e => setFiltroSite(e.target.value)}>
                    <option value="">Todos os sites com chamados</option>
                    {data.sitesResumo.map(s => {
                      const info = getSiteInfo(s.siteId);
                      return (
                        <option key={s.siteId} value={s.siteId}>
                          [{info?.sistema}] {info?.nome || s.siteId} — {s.metricas.abertos} abertos
                        </option>
                      );
                    })}
                  </select>
                </div>
                {sitesComDados.map(s => <SiteDetail key={s.siteId} siteResumo={s} />)}
              </div>
            )}

            {/* Duplicados */}
            {tab === 'duplicados' && (
              <DuplicadosPanel duplicados={data.possivelDuplicados} />
            )}

            {/* Associação manual */}
            {tab === 'associacao' && (
              <>
                <NaoAssociados items={data.naoAssociados} onAssociar={handleAssociar} />
                <div className="ch-secao">
                  <h3>🗺️ Mapeamento Atual</h3>
                  <p className="ch-secao-desc">Categorias do Jitbit vinculadas a sites AxHub/AxCross</p>
                  <table className="ch-tabela ch-tabela-compact">
                    <thead>
                      <tr><th>Categoria Jitbit</th><th>→</th><th>Site</th><th>Sistema</th></tr>
                    </thead>
                    <tbody>
                      {Object.entries(data.mapa).map(([catId, siteId]) => {
                        const site = getSiteInfo(siteId);
                        return (
                          <tr key={catId}>
                            <td>ID {catId}</td>
                            <td>→</td>
                            <td><strong>{site?.nome || siteId}</strong></td>
                            <td>{site?.sistema || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Insights */}
            {tab === 'insights' && <InsightsPanel data={data} />}
          </>
        )}
      </div>
    </>
  );
}

export default ChamadosSites;
