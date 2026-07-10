import React, { useState, useMemo } from 'react';
import { AXHUB_SITES, AXCROSS_SITES } from '../../../data/sitesData';
import CredenciaisManager from '../../../components/CredenciaisManager';
import { scoreColor } from '../../../utils/siteUtils';

/* ═══════════════════════════════════════════════════════════════════
   Aba: Guia Detalhado — Ficha Completa Individual
   ═══════════════════════════════════════════════════════════════════ */

function GuiaDetalhado({ siteParaDetalhe, setSiteParaDetalhe, setAbaAtiva, sitesComScore }) {
  const [sistema, setSistema] = useState('axhub');
  const [showCredenciais, setShowCredenciais] = useState(false);

  const TODOS_SITES = useMemo(() => [
    ...AXHUB_SITES.map(s => ({ ...s, sistema: 'AxHub' })),
    ...AXCROSS_SITES.map(s => ({ ...s, sistema: 'AxCross' })),
  ], []);

  // Buscar site atual
  const site = TODOS_SITES.find(s => s.id === siteParaDetalhe) || null;
  // Dados dinâmicos do site (healthScore + chamados)
  const siteScore = sitesComScore?.find(s => s.id === siteParaDetalhe) || null;

  // Se não tem site selecionado, mostrar seletor
  if (!site) {
    return (
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px' }}>
          Selecione um Site para Ver Detalhes
        </h2>
        
        <div style={{ maxWidth: '600px' }}>
          <div className="cs-filtro-item">
            <label>Sistema</label>
            <select value={sistema} onChange={(e) => setSistema(e.target.value)}>
              <option value="axhub">AxHub</option>
              <option value="axcross">AxCross</option>
            </select>
          </div>

          <div className="cs-filtro-item" style={{ marginTop: '16px' }}>
            <label>Site</label>
            <select 
              value={siteParaDetalhe || ''} 
              onChange={(e) => setSiteParaDetalhe(e.target.value)}
            >
              <option value="">-- Selecione um site --</option>
              {TODOS_SITES
                .filter(s => s.sistema.toLowerCase() === sistema)
                .map(s => (
                  <option key={s.id} value={s.id}>
                    [{s.sistema}] {s.nome} - {s.estado} ({s.tipo})
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>
    );
  }

  // Badge de tipo
  const getBadgeColor = (tipo) => {
    const map = {
      'Metrologia': '#3498db',
      'Trânsito Municipal': '#e74c3c',
      'Trânsito Estadual': '#e67e22',
      'Rodovias': '#2ecc71',
      'Fiscal': '#9b59b6',
    };
    return map[tipo] || '#666';
  };

  return (
    <div>
      {/* Seletor rápido */}
      <div style={{ marginBottom: '24px' }}>
        <select 
          value={siteParaDetalhe || ''} 
          onChange={(e) => setSiteParaDetalhe(e.target.value)}
          style={{ padding: '10px 16px', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid var(--cs-border)' }}
        >
          {TODOS_SITES.map(s => (
            <option key={s.id} value={s.id}>
              [{s.sistema}] {s.nome} - {s.estado}
            </option>
          ))}
        </select>
      </div>

      {/* Header do Site */}
      <div style={{ background: 'var(--cs-background)', border: '1px solid var(--cs-border)', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 8px 0' }}>
              <span style={{ color: site.status === 'ativo' ? '#22c55e' : '#dc2626', marginRight: '8px' }}>●</span>
              {site.nome} <span style={{ color: 'var(--cs-text-secondary)', fontWeight: 400, fontSize: '1.5rem' }}>({site.sistema})</span>
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--cs-text-secondary)', margin: 0 }}>
              {site.orgao}
            </p>
          </div>
          <span style={{ padding: '8px 16px', borderRadius: '6px', background: getBadgeColor(site.tipo), color: 'white', fontWeight: 600 }}>
            {site.tipo}
          </span>
        </div>
        
        <a 
          href={site.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ color: 'var(--cs-primary)', textDecoration: 'none', fontSize: '0.875rem' }}
        >
          🔗 {site.url}
        </a>
      </div>

      {/* Grid de Informações */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="cs-card" style={{ cursor: 'default' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--cs-text-secondary)', marginBottom: '4px' }}>Estado</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>📍 {site.estado}</div>
        </div>
        <div className="cs-card" style={{ cursor: 'default' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--cs-text-secondary)', marginBottom: '4px' }}>Versão</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>🏷️ {site.versao || '—'}</div>
        </div>
        <div className="cs-card" style={{ cursor: 'default' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--cs-text-secondary)', marginBottom: '4px' }}>Menus</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>📋 {site.menuCount || '—'}</div>
        </div>
        <div className="cs-card" style={{ cursor: 'default' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--cs-text-secondary)', marginBottom: '4px' }}>Status</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: site.status === 'ativo' ? '#22c55e' : '#dc2626' }}>
            {site.status === 'ativo' ? '✓ Ativo' : '✗ Inativo'}
          </div>
        </div>
        {siteScore && (
          <>
            <div className="cs-card" style={{ cursor: 'default' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--cs-text-secondary)', marginBottom: '4px' }}>Health Score</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: scoreColor(siteScore.healthScore) }}>
                {siteScore.healthScore}%
              </div>
            </div>
            <div className="cs-card" style={{ cursor: 'default' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--cs-text-secondary)', marginBottom: '4px' }}>Chamados Abertos</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: siteScore.chamados.abertos > 0 ? '#f87171' : '#22c55e' }}>
                🎫 {siteScore.chamados.abertos}
                {siteScore.chamados.criticos > 0 && <span style={{ fontSize: '0.9rem', marginLeft: 6, color: '#fca5a5' }}>({siteScore.chamados.criticos} crít.)</span>}
              </div>
            </div>
          </>
        )}
      </div>

      {/* AxHub - Informações Específicas */}
      {site.sistema === 'AxHub' && (
        <>
          {/* OCR e Equipamentos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="cs-card" style={{ cursor: 'default' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--cs-text-secondary)', marginBottom: '4px' }}>OCR %</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: site.ocr > 80 ? '#22c55e' : site.ocr > 60 ? '#f59e0b' : '#dc2626' }}>
                {site.ocr ? `${site.ocr}%` : '—'}
              </div>
            </div>
            <div className="cs-card" style={{ cursor: 'default' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--cs-text-secondary)', marginBottom: '4px' }}>Equipamentos</div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>📡 {site.equipamentos?.total || '—'}</div>
            </div>
            <div className="cs-card" style={{ cursor: 'default' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--cs-text-secondary)', marginBottom: '4px' }}>Relatórios BI</div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>📊 {site.bi?.length || 0}</div>
            </div>
          </div>

          {/* Funcionalidades Ativas */}
          {site.extras && site.extras.length > 0 && (
            <div className="cs-card" style={{ cursor: 'default', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '12px' }}>🔧 Funcionalidades Ativas</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                {site.extras.map(extra => (
                  <div key={extra} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#22c55e', fontSize: '1.125rem' }}>✓</span>
                    <span style={{ fontSize: '0.875rem' }}>{extra}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fabricantes e Grupos */}
          {(site.fabricantes || site.equipamentos?.grupos) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {site.fabricantes && site.fabricantes.length > 0 && (
                <div className="cs-card" style={{ cursor: 'default' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', color: 'var(--cs-text-secondary)' }}>Fabricantes</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {site.fabricantes.map(f => <li key={f}>{f}</li>)}
                  </ul>
                </div>
              )}
              {site.equipamentos?.grupos && site.equipamentos.grupos.length > 0 && (
                <div className="cs-card" style={{ cursor: 'default' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', color: 'var(--cs-text-secondary)' }}>Grupos Operacionais</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {site.equipamentos.grupos.map(g => <li key={g}>{g}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Relatórios BI */}
          {site.bi && site.bi.length > 0 && (
            <div className="cs-card" style={{ cursor: 'default', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '12px' }}>
                📈 Relatórios BI ({site.bi.length})
              </h3>
              <ul style={{ columns: 2, columnGap: '20px', margin: 0, paddingLeft: '20px', fontSize: '0.875rem' }}>
                {site.bi.map(bi => (
                  <li key={bi} style={{ marginBottom: '6px' }}>📊 {bi}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* AxCross - Informações Específicas */}
      {site.sistema === 'AxCross' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="cs-card" style={{ cursor: 'default' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--cs-text-secondary)', marginBottom: '4px' }}>Equipamentos</div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>📡 {site.equipamentos || '—'}</div>
          </div>
          <div className="cs-card" style={{ cursor: 'default' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--cs-text-secondary)', marginBottom: '4px' }}>Faixas</div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{site.faixas || '—'}</div>
          </div>
          <div className="cs-card" style={{ cursor: 'default' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--cs-text-secondary)', marginBottom: '4px' }}>Veículos Monitorados</div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{site.veiculos?.toLocaleString('pt-BR') || '0'}</div>
          </div>
          <div className="cs-card" style={{ cursor: 'default' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--cs-text-secondary)', marginBottom: '4px' }}>Passagens/dia</div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{site.passagensDia?.toLocaleString('pt-BR') || '—'}</div>
          </div>
        </div>
      )}

      {/* Observações */}
      {site.observacoes && (
        <div className="cs-card" style={{ cursor: 'default', background: 'rgba(59, 130, 246, 0.05)', borderColor: 'var(--cs-primary)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px' }}>💡 Observações</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--cs-text-primary)' }}>
            {site.observacoes}
          </p>
        </div>
      )}

      {/* Botões de Ação */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
        <button 
          className="cs-btn cs-btn-primary"
          onClick={() => setAbaAtiva('chamados')}
        >
          🎫 Ver Chamados deste Site
        </button>
        <button 
          className="cs-btn cs-btn-secondary"
          onClick={() => setShowCredenciais(v => !v)}
        >
          🔐 {showCredenciais ? 'Ocultar' : 'Ver'} Credenciais
        </button>
        <button 
          className="cs-btn cs-btn-secondary"
          onClick={() => setSiteParaDetalhe(null)}
        >
          ← Voltar ao Seletor
        </button>
      </div>

      {/* Gerenciador de Credenciais */}
      {showCredenciais && (
        <div style={{ marginTop: 24, background: 'var(--cs-background)', border: '1px solid var(--cs-border)', borderRadius: 10, padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>🔐 Gerenciador de Credenciais — {site.nome}</h3>
            <button className="cs-btn cs-btn-secondary" style={{ padding: '4px 12px', fontSize: '0.82rem' }} onClick={() => setShowCredenciais(false)}>✕ Fechar</button>
          </div>
          <CredenciaisManager selectedSite={site} />
        </div>
      )}
    </div>
  );
}

export default GuiaDetalhado;
