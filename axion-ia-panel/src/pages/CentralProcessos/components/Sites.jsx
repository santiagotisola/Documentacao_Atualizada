import React from 'react';
import { Link } from 'react-router-dom';

/* ═══════════════════════════════════════════════════════════════════
   Componente: Sites
   Estratégia: Link para /central-sites (evitar duplicação)
   ═══════════════════════════════════════════════════════════════════ */

function Sites({ todosSites }) {
  const totalAtivos = todosSites.filter(s => s.status === 'ativo').length;
  const totalAxhub = todosSites.filter(s => s.sistema === 'AxHub').length;
  const totalAxcross = todosSites.filter(s => s.sistema === 'AxCross').length;

  return (
    <div>
      <div className="cp-card" style={{ maxWidth: '600px', margin: '0 auto', cursor: 'default' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px' }}>
          🏢 Gerenciamento de Sites
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--cp-text-secondary)', marginBottom: '24px' }}>
          O gerenciamento completo de sites foi movido para um módulo dedicado com funcionalidades avançadas:
          Visão Geral, Lista Completa, Comparação, Guia Detalhado e Chamados.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--cp-primary)' }}>{todosSites.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--cp-text-secondary)' }}>Total</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#60a5fa' }}>{totalAxhub}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--cp-text-secondary)' }}>AxHub</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#8b5cf6' }}>{totalAxcross}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--cp-text-secondary)' }}>AxCross</div>
          </div>
        </div>

        <Link to="/central-sites" className="cp-btn cp-btn-primary" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>
          🏢 Abrir Central de Sites →
        </Link>

        <p style={{ fontSize: '0.75rem', color: 'var(--cp-text-secondary)', marginTop: '16px', textAlign: 'center' }}>
          {totalAtivos} sites ativos • Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>
      </div>
    </div>
  );
}

export default Sites;
