const PIEQ = () => {
  return (
    <div className="pieq">
      <h2>🛡️ PIEQ Platform</h2>
      <p style={{color: '#64748b', marginBottom: '1.5rem'}}>Plataforma de Quality Engineering — Análise automatizada</p>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3>Módulos Disponíveis</h3>
        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ padding: '1rem', background: '#f8f9fc', borderRadius: '6px', borderLeft: '3px solid #667eea' }}>
            <strong>📊 Análise de Código</strong>
            <p style={{margin: '0.5rem 0 0 0', color: '#64748b'}}>Análise estática, qualidade, complexidade</p>
          </div>
          <div style={{ padding: '1rem', background: '#f8f9fc', borderRadius: '6px', borderLeft: '3px solid #10b981' }}>
            <strong>🔒 Segurança</strong>
            <p style={{margin: '0.5rem 0 0 0', color: '#64748b'}}>Vulnerabilidades, OWASP, dependências</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PIEQ;