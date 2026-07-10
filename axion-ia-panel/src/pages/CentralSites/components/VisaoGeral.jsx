import React from 'react';
import { TIPOS_CONTRATO } from '../../../data/sitesData';
import { Badge } from '../../../components/common';
import { useNavigate } from 'react-router-dom';

/* ═══════════════════════════════════════════════════════════════════
   Aba: Visão Geral — Cards de Sites
   ═══════════════════════════════════════════════════════════════════ */

function getBadgeColor(tipo) {
  const t = TIPOS_CONTRATO?.find(tc => {
    if (tc.id === 'metrologia' && tipo === 'Metrologia') return true;
    if (tc.id === 'transito-municipal' && tipo === 'Trânsito Municipal') return true;
    if (tc.id === 'transito-estadual' && tipo === 'Trânsito Estadual') return true;
    if (tc.id === 'rodovias' && tipo === 'Rodovias') return true;
    if (tc.id === 'fiscal' && tipo === 'Fiscal') return true;
    return false;
  });
  return t?.cor || '#666';
}

function StatusDot({ status }) {
  const cor = status === 'ativo' ? '#22c55e' : '#dc2626';
  return <span style={{ color: cor, fontSize: '1rem', marginRight: '4px' }}>●</span>;
}

function VisaoGeral({ todosSites, sitesSelecionados, toggleSelecionarSite, setAbaAtiva, filtros, setFiltros, setSite, activeSite }) {
  const navigate = useNavigate();

  // Ativar site no contexto global e redirecionar
  const handleAtivar = (e, site) => {
    e.stopPropagation(); // não disparar o toggleSelecionar
    const produto = site.sistema === 'AxHub' ? 'axhub' : site.sistema === 'AxCross' ? 'axcross' : site.sistema?.toLowerCase();
    setSite({ ...site, produto }, 'central-sites');
  };

  const isAtivo = (site) => activeSite?.id === site.id;
  
  // Filtrar sites
  const sitesFiltrados = todosSites.filter(site => {
    if (filtros.sistema !== 'todos' && site.sistema !== filtros.sistema) return false;
    if (filtros.status !== 'todos' && site.status !== filtros.status) return false;
    if (filtros.busca) {
      const busca = filtros.busca.toLowerCase();
      return site.nome.toLowerCase().includes(busca) || 
             site.estado?.toLowerCase().includes(busca) ||
             site.orgao?.toLowerCase().includes(busca);
    }
    return true;
  });

  return (
    <div>
      {/* Filtros */}
      <div className="cs-filtros">
        <div className="cs-filtro-item">
          <label>Sistema</label>
          <select 
            value={filtros.sistema} 
            onChange={(e) => setFiltros({...filtros, sistema: e.target.value})}
          >
            <option value="todos">Todos</option>
            <option value="AxHub">AxHub</option>
            <option value="AxCross">AxCross</option>
          </select>
        </div>

        <div className="cs-filtro-item">
          <label>Status</label>
          <select 
            value={filtros.status} 
            onChange={(e) => setFiltros({...filtros, status: e.target.value})}
          >
            <option value="todos">Todos</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
        </div>

        <div className="cs-filtro-item">
          <label>Buscar</label>
          <input 
            type="text"
            placeholder="Nome, estado, órgão..."
            value={filtros.busca}
            onChange={(e) => setFiltros({...filtros, busca: e.target.value})}
          />
        </div>

        <div style={{ flex: 1 }}></div>

        {sitesSelecionados.length >= 2 && (
          <button 
            className="cs-btn cs-btn-primary"
            onClick={() => setAbaAtiva('comparativo')}
            style={{ alignSelf: 'flex-end' }}
          >
            ⚖️ Comparar {sitesSelecionados.length} Sites
          </button>
        )}
      </div>

      <p style={{ fontSize: '0.875rem', color: 'var(--cs-text-secondary)', marginBottom: '16px' }}>
        {sitesFiltrados.length} site{sitesFiltrados.length !== 1 ? 's' : ''} encontrado{sitesFiltrados.length !== 1 ? 's' : ''}
      </p>

      {/* Grid de Cards */}
      <div className="cs-grid">
        {sitesFiltrados.map(site => (
          <div
            key={site.id}
            className={`cs-card ${sitesSelecionados.includes(site.id) ? 'selected' : ''}`}
            onClick={() => toggleSelecionarSite(site.id)}
          >
            {/* Header do card */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
                <StatusDot status={site.status} />
                {site.nome} <span style={{ color: 'var(--cs-text-secondary)', fontWeight: 400 }}>({site.sistema})</span>
              </h4>
              <Badge color={getBadgeColor(site.tipo)}>{site.tipo}</Badge>
            </div>

            {/* Meta */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px', fontSize: '0.8125rem', color: 'var(--cs-text-secondary)' }}>
              <span>📍 {site.estado}</span>
              {site.sistema === 'AxHub' && site.versao && <span>🏷️ {site.versao}</span>}
              {site.sistema === 'AxHub' && site.menuCount && <span>📋 {site.menuCount} menus</span>}
            </div>

            {/* Stats */}
            {site.sistema === 'AxHub' && site.status === 'ativo' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--cs-primary)' }}>
                    {site.bi?.length || 0}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cs-text-secondary)' }}>BI Reports</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--cs-primary)' }}>
                    {site.equipamentos?.total || '—'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cs-text-secondary)' }}>Equip.</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: site.ocr > 80 ? '#22c55e' : site.ocr > 60 ? '#f59e0b' : '#dc2626' }}>
                    {site.ocr ? `${site.ocr}%` : '—'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cs-text-secondary)' }}>OCR</div>
                </div>
              </div>
            )}

            {site.sistema === 'AxCross' && site.status === 'ativo' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--cs-primary)' }}>
                    {site.equipamentos || 0}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cs-text-secondary)' }}>Equip.</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--cs-primary)' }}>
                    {site.faixas || 0}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cs-text-secondary)' }}>Faixas</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--cs-primary)' }}>
                    {site.passagensDia ? site.passagensDia.toLocaleString('pt-BR') : '—'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cs-text-secondary)' }}>Pass/dia</div>
                </div>
              </div>
            )}

            {site.observacoes && (
              <p style={{ fontSize: '0.75rem', color: 'var(--cs-text-secondary)', marginTop: '12px', marginBottom: 0 }}>
                💡 {site.observacoes}
              </p>
            )}

            {/* Rodapé do card: ações rápidas */}
            <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 10, borderTop: '1px solid #f0f0f0', alignItems: 'center' }}>
              {isAtivo(site) ? (
                <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                  ✓ Contexto ativo
                </span>
              ) : (
                <button
                  onClick={(e) => handleAtivar(e, site)}
                  title="Definir este site como contexto ativo no painel"
                  style={{
                    fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 20, cursor: 'pointer', border: '1px solid #d1d5db',
                    background: '#f9fafb', color: '#374151', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#374151'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#374151'; }}
                >
                  📌 Ativar
                </button>
              )}
              {site.url && (
                <a
                  href={site.url} target="_blank" rel="noreferrer"
                  onClick={e => e.stopPropagation()}
                  style={{ fontSize: 11, color: '#6b7280', marginLeft: 'auto', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}
                >
                  ↗ Abrir sistema
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {sitesFiltrados.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--cs-text-secondary)' }}>
          <p style={{ fontSize: '1.125rem', marginBottom: '8px' }}>Nenhum site encontrado</p>
          <p style={{ fontSize: '0.875rem' }}>Tente ajustar os filtros ou busca</p>
        </div>
      )}
    </div>
  );
}

export default VisaoGeral;
