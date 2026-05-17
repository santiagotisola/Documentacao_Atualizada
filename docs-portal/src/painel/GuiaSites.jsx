import React, { useState, useMemo } from 'react';
import { AXHUB_SITES, AXCROSS_SITES } from '../data/sitesData';
import './GuiaSites.css';

/* ═══════════════════════════════════════════════════════════════════════
   Guia por Site — Mostra particularidades de cada URL/contrato
   ═══════════════════════════════════════════════════════════════════════ */

const TODOS_SITES = [
  ...AXHUB_SITES.map(s => ({ ...s, sistema: 'AxHub' })),
  ...AXCROSS_SITES.map(s => ({ ...s, sistema: 'AxCross' })),
];

/* ── Helpers ─────────────────────────────────────────────────────────── */

// Base padrão AxHub (80 menus, 9 BI reports metrologia)
const BI_BASE_METROLOGIA = [
  'Diário de Disponibilidade',
  'Índice de OCR',
  'Índice de OCR - Data x Hora',
  'Exportação Crono',
  'Ineração Crono',
  'Triagem Crono Data/Equip',
  'Relatório de Triagem por Usuário',
  'Relatório Média de Fluxo por Porte',
  'Relatório Processamento de Imagens',
];

const FEATURES_POSSIVEIS = [
  'Inerações Descartadas',
  'Consulta de Placas',
  'Bloqueio de Operação',
  'Acessos Por IP',
];

function getBadgeColor(tipo) {
  const map = {
    'Metrologia': '#3498db',
    'Trânsito Municipal': '#e74c3c',
    'Trânsito Estadual': '#e67e22',
    'Rodovias': '#2ecc71',
    'Fiscal': '#9b59b6',
  };
  return map[tipo] || '#666';
}

/* ── Componentes ─────────────────────────────────────────────────────── */

function SiteSelector({ sites, selecionado, onChange }) {
  return (
    <div className="gs-selector">
      <label>🌐 Selecionar Site (URL)</label>
      <select value={selecionado} onChange={e => onChange(e.target.value)}>
        <option value="">— Selecione um site —</option>
        {sites.map(s => (
          <option key={s.id} value={s.id}>
            [{s.sistema}] {s.nome} — {s.url}
          </option>
        ))}
      </select>
    </div>
  );
}

function FichaAxHub({ site }) {
  const biExclusivos = (site.bi || []).filter(b => !BI_BASE_METROLOGIA.includes(b));
  const biBase = (site.bi || []).filter(b => BI_BASE_METROLOGIA.includes(b));

  return (
    <div className="gs-ficha">
      {/* Header */}
      <div className="gs-ficha-header">
        <div>
          <h2>
            <span className="gs-status-dot" style={{ color: site.status === 'ativo' ? '#27ae60' : '#e74c3c' }}>●</span>
            {site.nome}
          </h2>
          <p className="gs-orgao">{site.orgao}</p>
          <a href={site.url} target="_blank" rel="noopener noreferrer" className="gs-url-link">
            🔗 {site.url}
          </a>
        </div>
        <span className="gs-badge" style={{ background: getBadgeColor(site.tipo) }}>{site.tipo}</span>
      </div>

      {/* Info Grid */}
      <div className="gs-info-grid">
        <div className="gs-info-card">
          <span className="gs-info-label">Estado</span>
          <span className="gs-info-valor">📍 {site.estado}</span>
        </div>
        <div className="gs-info-card">
          <span className="gs-info-label">Versão</span>
          <span className="gs-info-valor">🏷️ {site.versao || '—'}</span>
        </div>
        <div className="gs-info-card">
          <span className="gs-info-label">Menus</span>
          <span className="gs-info-valor">📋 {site.menuCount || '—'}</span>
        </div>
        <div className="gs-info-card">
          <span className="gs-info-label">OCR</span>
          <span className="gs-info-valor">{site.ocr ? `${site.ocr}%` : '—'}</span>
        </div>
        <div className="gs-info-card">
          <span className="gs-info-label">Equipamentos</span>
          <span className="gs-info-valor">📡 {site.equipamentos?.total || '—'}</span>
        </div>
        <div className="gs-info-card">
          <span className="gs-info-label">Passagens/dia</span>
          <span className="gs-info-valor">{site.passagensDia ? site.passagensDia.toLocaleString('pt-BR') : '—'}</span>
        </div>
      </div>

      {/* Funcionalidades Ativas */}
      <div className="gs-secao">
        <h3>🔧 Funcionalidades Ativas</h3>
        <p className="gs-secao-desc">
          Base padrão: 80 menus. Este site possui <strong>{site.menuCount || 80}</strong> menus
          {site.extras?.length > 0 ? ` (+${site.extras.length} extras)` : ' (apenas base)'}
        </p>
        <div className="gs-funcionalidades-grid">
          {FEATURES_POSSIVEIS.map(feat => {
            const ativo = (site.extras || []).includes(feat);
            return (
              <div key={feat} className={`gs-feature-item ${ativo ? 'ativo' : 'inativo'}`}>
                <span className="gs-feature-icon">{ativo ? '✅' : '❌'}</span>
                <span>{feat}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Layout Operações */}
      <div className="gs-secao">
        <h3>🔧 Tela de Operações — Colunas</h3>
        <p className="gs-secao-desc">
          Layout: <strong>{(site.operacoesColunas || []).includes('Homol.') ? 'Metrologia' : 'Trânsito'}</strong>
        </p>
        <div className="gs-colunas-lista">
          {(site.operacoesColunas || []).map(col => (
            <span key={col} className="gs-coluna-tag">{col}</span>
          ))}
        </div>
      </div>

      {/* Equipamentos */}
      <div className="gs-secao">
        <h3>📡 Equipamentos & Fabricantes</h3>
        <div className="gs-equip-grid">
          <div>
            <h4>Grupos Operacionais</h4>
            {(site.equipamentos?.grupos || []).length > 0 ? (
              <ul className="gs-lista">
                {site.equipamentos.grupos.map(g => <li key={g}>{g}</li>)}
              </ul>
            ) : <p className="gs-vazio">Nenhum grupo configurado</p>}
          </div>
          <div>
            <h4>Fabricantes</h4>
            {(site.fabricantes || []).length > 0 ? (
              <ul className="gs-lista">
                {site.fabricantes.map(e => <li key={e}>{e}</li>)}
              </ul>
            ) : <p className="gs-vazio">Não informado</p>}
          </div>
        </div>
      </div>

      {/* Relatórios BI */}
      <div className="gs-secao">
        <h3>📈 Relatórios BI ({(site.bi || []).length} disponíveis)</h3>
        {biExclusivos.length > 0 && (
          <div className="gs-bi-exclusivos">
            <h4>⭐ Exclusivos deste site</h4>
            <ul className="gs-lista">
              {biExclusivos.map(b => <li key={b}>📊 {b}</li>)}
            </ul>
          </div>
        )}
        <div className="gs-bi-padrao">
          <h4>📋 Padrão</h4>
          <ul className="gs-lista">
            {biBase.map(b => <li key={b}>{b}</li>)}
          </ul>
        </div>
      </div>

      {/* Observações */}
      {site.observacoes && (
        <div className="gs-secao gs-observacoes">
          <h3>💡 Observações</h3>
          <p>{site.observacoes}</p>
        </div>
      )}
    </div>
  );
}

function FichaAxCross({ site }) {
  return (
    <div className="gs-ficha">
      {/* Header */}
      <div className="gs-ficha-header">
        <div>
          <h2>
            <span className="gs-status-dot" style={{ color: site.status === 'ativo' ? '#27ae60' : '#e74c3c' }}>●</span>
            {site.nome}
          </h2>
          <p className="gs-orgao">{site.orgao}</p>
          <a href={site.url} target="_blank" rel="noopener noreferrer" className="gs-url-link">
            🔗 {site.url}
          </a>
        </div>
        <span className="gs-badge" style={{ background: getBadgeColor(site.tipo) }}>{site.tipo}</span>
      </div>

      {/* Info Grid */}
      <div className="gs-info-grid">
        <div className="gs-info-card">
          <span className="gs-info-label">Estado</span>
          <span className="gs-info-valor">📍 {site.estado}</span>
        </div>
        <div className="gs-info-card">
          <span className="gs-info-label">Equipamentos</span>
          <span className="gs-info-valor">📡 {site.equipamentos}</span>
        </div>
        <div className="gs-info-card">
          <span className="gs-info-label">Faixas</span>
          <span className="gs-info-valor">🛤️ {site.faixas}</span>
        </div>
        <div className="gs-info-card">
          <span className="gs-info-label">Alertas</span>
          <span className="gs-info-valor">🚨 {site.alertas}</span>
        </div>
        <div className="gs-info-card">
          <span className="gs-info-label">Veículos Monitorados</span>
          <span className="gs-info-valor">🚗 {site.veiculos?.toLocaleString('pt-BR') || '0'}</span>
        </div>
        <div className="gs-info-card">
          <span className="gs-info-label">Passagens/dia</span>
          <span className="gs-info-valor">{site.passagensDia ? site.passagensDia.toLocaleString('pt-BR') : '—'}</span>
        </div>
      </div>

      {/* MDF-e */}
      {site.menuExtra && (
        <div className="gs-secao gs-mdfe">
          <h3>📄 Módulo Exclusivo: {site.menuExtra}</h3>
          {site.mdfe && (
            <div className="gs-mdfe-detalhe">
              <p><strong>Título:</strong> {site.mdfe.titulo}</p>
              <p><strong>Subtítulo:</strong> {site.mdfe.subtitulo}</p>
              <div className="gs-equip-grid">
                <div>
                  <h4>Sub-menus</h4>
                  <ul className="gs-lista">
                    {site.mdfe.subMenus.map(m => <li key={m}>{m}</li>)}
                  </ul>
                </div>
                <div>
                  <h4>Métricas</h4>
                  <ul className="gs-lista">
                    {site.mdfe.metricas.map(m => <li key={m}>{m}</li>)}
                  </ul>
                </div>
              </div>
              <h4>Colunas MDF-e</h4>
              <div className="gs-colunas-lista">
                {site.mdfe.colunasMDFe.map(col => (
                  <span key={col} className="gs-coluna-tag">{col}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Observações */}
      {site.observacoes && (
        <div className="gs-secao gs-observacoes">
          <h3>💡 Observações</h3>
          <p>{site.observacoes}</p>
        </div>
      )}
    </div>
  );
}

/* ── Página Principal ────────────────────────────────────────────────── */

function GuiaSites() {
  const [sistemaFiltro, setSistemaFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [siteSelecionado, setSiteSelecionado] = useState('');

  const sitesFiltrados = useMemo(() => {
    return TODOS_SITES.filter(site => {
      if (sistemaFiltro && site.sistema !== sistemaFiltro) return false;
      if (tipoFiltro && site.tipo !== tipoFiltro) return false;
      if (estadoFiltro && site.estado !== estadoFiltro) return false;
      return true;
    });
  }, [sistemaFiltro, tipoFiltro, estadoFiltro]);

  const sistemas = ['AxHub', 'AxCross'];
  const tipos = [...new Set(TODOS_SITES.map(s => s.tipo).filter(Boolean))].sort();
  const estados = [...new Set(TODOS_SITES.map(s => s.estado).filter(Boolean))].sort();

  const siteAtual = TODOS_SITES.find(s => s.id === siteSelecionado);

  return (
    <>
      <div className="gs-page">
        {/* Header */}
        <div className="gs-header">
          <h1>📋 Guia por Site</h1>
          <p>
            Cada site (URL) possui suas particularidades — funcionalidades, relatórios, equipamentos e configurações
            podem variar entre contratos. Selecione um site para ver seu manual específico.
          </p>
        </div>

        {/* Filtros */}
        <div className="gs-filtros">
          <div className="gs-filtro-grupo">
            <label>Sistema</label>
            <select value={sistemaFiltro} onChange={e => { setSistemaFiltro(e.target.value); setSiteSelecionado(''); }}>
              <option value="">Todos</option>
              {sistemas.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="gs-filtro-grupo">
            <label>Tipo de Contrato</label>
            <select value={tipoFiltro} onChange={e => { setTipoFiltro(e.target.value); setSiteSelecionado(''); }}>
              <option value="">Todos</option>
              {tipos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="gs-filtro-grupo">
            <label>Estado</label>
            <select value={estadoFiltro} onChange={e => { setEstadoFiltro(e.target.value); setSiteSelecionado(''); }}>
              <option value="">Todos</option>
              {estados.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
        </div>

        {/* Seletor de Site */}
        <SiteSelector
          sites={sitesFiltrados}
          selecionado={siteSelecionado}
          onChange={setSiteSelecionado}
        />

        {/* Resumo rápido */}
        {!siteSelecionado && (
          <div className="gs-resumo">
            <h3>Sites disponíveis ({sitesFiltrados.length})</h3>
            <div className="gs-sites-lista">
              {sitesFiltrados.map(site => (
                <button
                  key={site.id}
                  className="gs-site-btn"
                  onClick={() => setSiteSelecionado(site.id)}
                  style={{ borderLeftColor: getBadgeColor(site.tipo) }}
                >
                  <span className="gs-site-btn-sistema">{site.sistema}</span>
                  <span className="gs-site-btn-nome">{site.nome}</span>
                  <span className="gs-site-btn-estado">{site.estado}</span>
                  <span className="gs-site-btn-url">{site.url}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ficha do Site */}
        {siteAtual && siteAtual.sistema === 'AxHub' && <FichaAxHub site={siteAtual} />}
        {siteAtual && siteAtual.sistema === 'AxCross' && <FichaAxCross site={siteAtual} />}
      </div>
    </>
  );
}

export default GuiaSites;
