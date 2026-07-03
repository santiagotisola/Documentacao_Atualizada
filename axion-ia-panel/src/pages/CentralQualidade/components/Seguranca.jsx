const Seguranca = () => {
  return (
    <div className="seguranca">
      <h2>🔐 Segurança</h2>
      <p style={{color: '#64748b', marginBottom: '1.5rem'}}>Vulnerabilidades, dependências e compliance</p>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3>Status de Segurança</h3>
        <div style={{ marginTop: '1rem' }}>
          <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f8f9fc', borderRadius: '6px' }}>
            <strong style={{color: '#10b981'}}>✅ Nenhuma vulnerabilidade crítica</strong>
          </div>
          <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '6px' }}>
            <strong style={{color: '#92400e'}}>⚠️ 3 dependências com atualizações pendentes</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Seguranca;