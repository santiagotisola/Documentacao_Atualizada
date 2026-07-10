import React from 'react';

/* ═══════════════════════════════════════════════════════════════════
   Componente: Acessos
   Grupos de acesso, credenciais e permissões consolidados
   ═══════════════════════════════════════════════════════════════════ */

const GRUPOS_ACESSO = [
  { 
    grupo: "Grupo Axion (suporte)", 
    login: "suporte@axiontecnologia.com.br", 
    senha: "Axion#2023", 
    sites: [
      "homologacao.axhub.axion.ws", "goiania.axhub.axion.ws",
      "imepi.axhub.axion.ws", "ipemmt.axcross.axion.ws",
      "derse.axcross.axion.ws", "economia.axion.ws",
      "economia.axcross.axion.ws", "homologacao.axcross.axion.ws",
      "identity.axion.ws", "ipemce.axcross.axion.ws",
      "strans.axhub.axion.ws",
    ] 
  },
  { 
    grupo: "Grupo Admin (operação)", 
    login: "Admin", 
    senha: "labor5383", 
    sites: [
      "smtt.axhub.axion.ws", "ipemmt.axhub.axion.ws",
      "derse.axhub.axion.ws", "detranma.axhub.axion.ws",
      "detranpi.axhub.axion.ws", "goiania.id.axion.ws",
      "homologacao.axhub.axion.ws", "ibametro.axhub.axion.ws",
      "imepi.axhub.axion.ws", "imeqpb.axhub.axion.ws",
      "imetropa.axhub.axion.ws", "imperatriz.axhub.axion.ws",
      "ipemce.axhub.axion.ws", "itps.axhub.axion.ws",
      "setrans.axhub.axion.ws", "strans.axhub.axion.ws",
    ] 
  },
  { 
    grupo: "Grupo Admin (alt login)", 
    login: "admin", 
    senha: "Labor5383", 
    sites: [
      "goiania.id.axion.ws", "ipempe.axhub.axion.ws", "strans.axhub.axion.ws",
    ] 
  },
  { 
    grupo: "Grupo AxCross (Axion 2025)", 
    login: "suporte@axiontecnologia.com.br", 
    senha: "Axion#2025", 
    sites: [
      "setrans.axcross.axion.ws", "detranma.axcross.axion.ws",
      "goiania.axion.ws", "goiania.id.axion.ws",
      "goiania.axcross.axion.ws",
      "imperatriz.axcross.axion.ws", "ipempe.axcross.axion.ws",
      "sefazpi.axcross.axion.ws",
    ] 
  },
  { 
    grupo: "AxCross DETRANPI", 
    login: "detranpi", 
    senha: "Axion@2025", 
    sites: ["detranpi.axcross.axion.ws"] 
  },
  { 
    grupo: "AxCross IPEMCE", 
    login: "ipemce", 
    senha: "Axion#2023", 
    sites: ["ipemce.axhub.axion.ws"] 
  },
];

function Acessos() {
  const totalSites = GRUPOS_ACESSO.reduce((a, g) => a + g.sites.length, 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3>🔑 Grupos de Acesso e Credenciais</h3>
        <div style={{ fontSize: "0.85rem", color: "var(--cp-text-secondary)" }}>
          {GRUPOS_ACESSO.length} grupos • {totalSites} sites cadastrados
        </div>
      </div>

      <div className="cp-alert cp-alert-info" style={{ marginBottom: "1rem" }}>
        ⚠️ <strong>Atenção:</strong> Esta página contém credenciais sensíveis. 
        Mantenha este conteúdo confidencial e não compartilhe em ambientes não seguros.
      </div>

      <div className="cp-grid">
        {GRUPOS_ACESSO.map((g, idx) => (
          <div key={idx} className="cp-card">
            <h4 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>
              🔑 {g.grupo}
            </h4>

            <div className="cp-tabela" style={{ marginBottom: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "0.5rem", fontSize: "0.85rem" }}>
                <div style={{ fontWeight: 600, color: "var(--cp-text-muted)" }}>Login</div>
                <div style={{ fontFamily: "monospace", background: "var(--cp-bg-muted)", padding: "4px 8px", borderRadius: 4 }}>
                  {g.login}
                </div>

                <div style={{ fontWeight: 600, color: "var(--cp-text-muted)" }}>Senha:</div>
                <div style={{ fontFamily: "monospace", background: "var(--cp-bg-muted)", padding: "4px 8px", borderRadius: 4 }}>
                  {g.senha}
                </div>

                <div style={{ fontWeight: 600, color: "var(--cp-text-muted)" }}>Sites:</div>
                <div>
                  <span className="cp-badge">{g.sites.length} ambientes</span>
                </div>
              </div>
            </div>

            <details>
              <summary style={{ cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, color: "var(--cp-primary)" }}>
                📜 Mostrar lista de sites ({g.sites.length})
              </summary>
              <ul style={{ marginTop: "0.75rem", paddingLeft: "1.5rem", fontSize: "0.8rem", color: "var(--cp-text-secondary)", lineHeight: 1.8 }}>
                {g.sites.map((site, i) => (
                  <li key={i} style={{ fontFamily: "monospace" }}>{site}</li>
                ))}
              </ul>
            </details>
          </div>
        ))}
      </div>

      {/* Seção adicional: Serviços OIDC */}
      <div style={{ marginTop: "2rem" }}>
        <h4 style={{ marginBottom: "1rem" }}>🆔 Serviços de Autenticação (OIDC)</h4>
        <div className="cp-card">
          <div className="cp-tabela">
            <table>
              <thead>
                <tr>
                  <th>Serviço</th>
                  <th>URL</th>
                  <th>Tipo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🆔 Identity Server</td>
                  <td style={{ fontFamily: "monospace" }}>https://identity.axion.ws</td>
                  <td><span className="cp-badge">Auth</span></td>
                  <td><span className="cp-badge cp-badge-success">✓ Ativo</span></td>
                </tr>
                <tr>
                  <td>🆔 Goiânia Identity</td>
                  <td style={{ fontFamily: "monospace" }}>https://goiania.id.axion.ws</td>
                  <td><span className="cp-badge">Auth</span></td>
                  <td><span className="cp-badge cp-badge-success">✓ Ativo</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Acessos;
