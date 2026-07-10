import React from 'react';
import { AXHUB_SITES, AXCROSS_SITES } from '../../../data/sitesData';

/* ═══════════════════════════════════════════════════════════════════
   Aba: Comparativo — Comparação Lado a Lado
   ═══════════════════════════════════════════════════════════════════ */

function Comparativo({ sitesSelecionados, limparSelecao }) {
  
  // Buscar sites completos
  const allSites = [...AXHUB_SITES.map(s => ({...s, sistema: 'AxHub'})), ...AXCROSS_SITES.map(s => ({...s, sistema: 'AxCross'}))];
  const sitesParaComparar = sitesSelecionados.length > 0
    ? allSites.filter(s => sitesSelecionados.includes(s.id))
    : allSites.filter(s => s.status === 'ativo');

  if (sitesParaComparar.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <p style={{ fontSize: '1.25rem', marginBottom: '12px', color: 'var(--cs-text-primary)' }}>
          Nenhum site selecionado para comparar
        </p>
        <p style={{ fontSize: '0.875rem', color: 'var(--cs-text-secondary)', marginBottom: '24px' }}>
          Volte para "Visão Geral" e selecione 2 ou mais sites
        </p>
      </div>
    );
  }

  // Separar por sistema
  const sitesAxHub = sitesParaComparar.filter(s => s.sistema === 'AxHub');
  const sitesAxCross = sitesParaComparar.filter(s => s.sistema === 'AxCross');

  // Funções auxiliares
  const allExtras = [...new Set(sitesAxHub.flatMap(s => s.extras || []))];
  const allBI = [...new Set(sitesAxHub.flatMap(s => s.bi || []))].sort();

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 4px 0' }}>
            Comparação de Sites
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--cs-text-secondary)', margin: 0 }}>
            {sitesParaComparar.length} site{sitesParaComparar.length !== 1 ? 's' : ''} selecionado{sitesParaComparar.length !== 1 ? 's' : ''}
          </p>
        </div>
        {sitesSelecionados.length > 0 && (
          <button className="cs-btn cs-btn-secondary" onClick={limparSelecao}>
            Limpar Seleção
          </button>
        )}
      </div>

      {/* Comparação AxHub */}
      {sitesAxHub.length > 0 && (
        <>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '16px' }}>
            Métricas Gerais — AxHub
          </h3>
          <div className="cs-tabela-container" style={{ marginBottom: '32px' }}>
            <table className="cs-tabela">
              <thead>
                <tr>
                  <th>Métrica</th>
                  {sitesAxHub.map(s => (
                    <th key={s.id}>
                      {s.nome} <span style={{ color: 'var(--cs-text-secondary)', fontWeight: 400, fontSize: '0.75rem' }}>(AxHub)</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Versão</strong></td>
                  {sitesAxHub.map(s => <td key={s.id}>{s.versao || '—'}</td>)}
                </tr>
                <tr>
                  <td><strong>Menus</strong></td>
                  {sitesAxHub.map(s => <td key={s.id}>{s.menuCount || '—'}</td>)}
                </tr>
                <tr>
                  <td><strong>Equipamentos</strong></td>
                  {sitesAxHub.map(s => <td key={s.id}>{s.equipamentos?.total || '—'}</td>)}
                </tr>
                <tr>
                  <td><strong>OCR %</strong></td>
                  {sitesAxHub.map(s => (
                    <td key={s.id} style={{ fontWeight: 600, color: s.ocr > 80 ? '#22c55e' : s.ocr > 60 ? '#f59e0b' : '#dc2626' }}>
                      {s.ocr ? `${s.ocr}%` : '—'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td><strong>Fabricantes</strong></td>
                  {sitesAxHub.map(s => (
                    <td key={s.id} style={{ fontSize: '0.75rem' }}>
                      {s.fabricantes?.join(', ') || '—'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td><strong>Relatórios BI</strong></td>
                  {sitesAxHub.map(s => <td key={s.id}>{s.bi?.length || 0}</td>)}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Funcionalidades Ativas */}
          {allExtras.length > 0 && (
            <>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '16px' }}>
                Funcionalidades Ativas
              </h3>
              <div className="cs-tabela-container" style={{ marginBottom: '32px' }}>
                <table className="cs-tabela">
                  <thead>
                    <tr>
                      <th>Funcionalidade</th>
                      {sitesAxHub.map(s => (
                        <th key={s.id}>
                          {s.nome} <span style={{ color: 'var(--cs-text-secondary)', fontWeight: 400, fontSize: '0.75rem' }}>(AxHub)</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allExtras.map(extra => (
                      <tr key={extra}>
                        <td>{extra}</td>
                        {sitesAxHub.map(s => (
                          <td key={s.id} style={{ textAlign: 'center' }}>
                            {(s.extras || []).includes(extra)
                              ? <span style={{ color: '#22c55e', fontSize: '1.125rem' }}>✓</span>
                              : <span style={{ color: '#dc2626', fontSize: '1.125rem' }}>✗</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Relatórios BI */}
          {allBI.length > 0 && (
            <>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '16px' }}>
                Relatórios BI Disponíveis
              </h3>
              <div className="cs-tabela-container" style={{ marginBottom: '32px' }}>
                <table className="cs-tabela">
                  <thead>
                    <tr>
                      <th>Relatório</th>
                      {sitesAxHub.map(s => (
                        <th key={s.id}>
                          {s.nome} <span style={{ color: 'var(--cs-text-secondary)', fontWeight: 400, fontSize: '0.75rem' }}>(AxHub)</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allBI.slice(0, 15).map(bi => (
                      <tr key={bi}>
                        <td style={{ fontSize: '0.8125rem' }}>{bi}</td>
                        {sitesAxHub.map(s => (
                          <td key={s.id} style={{ textAlign: 'center' }}>
                            {(s.bi || []).includes(bi)
                              ? <span style={{ color: '#22c55e', fontSize: '1.125rem' }}>✓</span>
                              : <span style={{ color: '#dc2626', fontSize: '1.125rem' }}>✗</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {/* Comparação AxCross */}
      {sitesAxCross.length > 0 && (
        <>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '16px' }}>
            Métricas — AxCross
          </h3>
          <div className="cs-tabela-container">
            <table className="cs-tabela">
              <thead>
                <tr>
                  <th>Métrica</th>
                  {sitesAxCross.map(s => (
                    <th key={s.id}>
                      {s.nome} <span style={{ color: 'var(--cs-text-secondary)', fontWeight: 400, fontSize: '0.75rem' }}>(AxCross)</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Equipamentos</strong></td>
                  {sitesAxCross.map(s => <td key={s.id}><strong>{s.equipamentos || '—'}</strong></td>)}
                </tr>
                <tr>
                  <td><strong>Faixas</strong></td>
                  {sitesAxCross.map(s => <td key={s.id}>{s.faixas || '—'}</td>)}
                </tr>
                <tr>
                  <td><strong>Alertas</strong></td>
                  {sitesAxCross.map(s => <td key={s.id}>{s.alertas || '—'}</td>)}
                </tr>
                <tr>
                  <td><strong>Veículos Monitorados</strong></td>
                  {sitesAxCross.map(s => (
                    <td key={s.id}>{s.veiculos?.toLocaleString('pt-BR') || '0'}</td>
                  ))}
                </tr>
                <tr>
                  <td><strong>Passagens/dia</strong></td>
                  {sitesAxCross.map(s => (
                    <td key={s.id}><strong>{s.passagensDia?.toLocaleString('pt-BR') || '—'}</strong></td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default Comparativo;
