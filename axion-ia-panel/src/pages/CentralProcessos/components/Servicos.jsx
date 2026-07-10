import React from 'react';

/* ═══════════════════════════════════════════════════════════════════
   Componente: Serviços Auxiliares
   OIDC, SMTP, Azure Storage, Jitbit, WhatsApp, PNCP
   ═══════════════════════════════════════════════════════════════════ */

const SERVICOS_AUXILIARES = [
  { 
    id: "oidc", 
    nome: "Identity Server (OIDC)", 
    icone: "🆔", 
    tipo: "Autenticação", 
    url: "https://identity.axion.ws", 
    status: "ativo",
    descricao: "Servidor de identidade centralizado para todos os produtos Axion",
    configuracao: "OpenID Connect + OAuth 2.0"
  },
  { 
    id: "smtp", 
    nome: "SMTP (E-mail)", 
    icone: "✉️", 
    tipo: "Comunicação", 
    url: "smtp.gmail.com:587", 
    status: "ativo",
    descricao: "Servidor SMTP para envio de e-mails (notificações, alertas, relatórios)",
    configuracao: "TLS, autenticação via app password"
  },
  { 
    id: "azure", 
    nome: "Azure Storage", 
    icone: "☁️", 
    tipo: "Armazenamento", 
    url: "axionimagesstorage.blob.core.windows.net", 
    status: "ativo",
    descricao: "Armazenamento de imagens de infrações (OCR, placas, panoramicas)",
    configuracao: "Blob Storage, SAS tokens, retenção 5 anos"
  },
  { 
    id: "jitbit", 
    nome: "Jitbit Helpdesk", 
    icone: "🎫", 
    tipo: "Helpdesk", 
    url: "https://desk.axiontecnologia.com.br/helpdesk", 
    status: "ativo",
    descricao: "Sistema de tickets para atendimento ao cliente",
    configuracao: "Polling a cada 2 minutos, API REST"
  },
  { 
    id: "whatsapp", 
    nome: "WhatsApp Business", 
    icone: "💬", 
    tipo: "Atendimento", 
    url: "api.whatsapp.com", 
    status: "ativo",
    descricao: "Canal de atendimento via WhatsApp integrado com AxionIA",
    configuracao: "WhatsApp Business API, webhooks"
  },
  { 
    id: "pncp", 
    nome: "PNCP Gov.br", 
    icone: "🏛️", 
    tipo: "Editais", 
    url: "https://pncp.gov.br", 
    status: "ativo",
    descricao: "Portal Nacional de Contratações Públicas - busca automática de editais",
    configuracao: "Scraping via API REST, polling diário"
  },
  { 
    id: "openai", 
    nome: "OpenAI API", 
    icone: "🤖", 
    tipo: "IA", 
    url: "https://api.openai.com/v1", 
    status: "ativo",
    descricao: "GPT-4o-mini para chat, GPT-4o Vision para análise de imagens, embeddings",
    configuracao: "API Key, modelos: gpt-4o-mini, gpt-4o, text-embedding-ada-002"
  },
];

function Servicos() {
  const totalAtivos = SERVICOS_AUXILIARES.filter(s => s.status === "ativo").length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3>🌐 Serviços Auxiliares</h3>
        <div style={{ fontSize: "0.85rem", color: "var(--cp-text-secondary)" }}>
          {SERVICOS_AUXILIARES.length} serviços • {totalAtivos} ativos
        </div>
      </div>

      <div className="cp-grid">
        {SERVICOS_AUXILIARES.map((s, idx) => (
          <div key={idx} className="cp-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
              <div>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{s.icone}</div>
                <h4 style={{ margin: "0 0 0.25rem", fontSize: "1rem" }}>{s.nome}</h4>
                <span className="cp-badge">{s.tipo}</span>
              </div>
              <span className={`cp-badge ${s.status === "ativo" ? "cp-badge-success" : "cp-badge-danger"}`}>
                {s.status === "ativo" ? "✓ Ativo" : "✕ Inativo"}
              </span>
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--cp-text-secondary)", marginBottom: "1rem", lineHeight: 1.5 }}>
              {s.descricao}
            </p>

            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--cp-text-muted)", marginBottom: "0.25rem" }}>
                🔗 ENDPOINT
              </div>
              <div style={{ 
                fontFamily: "monospace", 
                fontSize: "0.8rem", 
                background: "var(--cp-bg-muted)", 
                padding: "6px 10px", 
                borderRadius: 4,
                wordBreak: "break-all"
              }}>
                {s.url}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--cp-text-muted)", marginBottom: "0.25rem" }}>
                ⚙️ CONFIGURAÇÃO
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--cp-text-secondary)" }}>
                {s.configuracao}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Seção adicional: Portais e Sites */}
      <div style={{ marginTop: "2rem" }}>
        <h4 style={{ marginBottom: "1rem" }}>🌐 Portais e Serviços Web</h4>
        <div className="cp-card">
          <div className="cp-tabela">
            <table>
              <thead>
                <tr>
                  <th>Portal</th>
                  <th>URL</th>
                  <th>Tipo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🌐 Portal Economia</td>
                  <td style={{ fontFamily: "monospace" }}>https://economia.axion.ws</td>
                  <td><span className="cp-badge">Serviço</span></td>
                  <td><span className="cp-badge cp-badge-success">✓ Ativo</span></td>
                </tr>
                <tr>
                  <td>🌐 Portal Goiânia</td>
                  <td style={{ fontFamily: "monospace" }}>https://goiania.axion.ws</td>
                  <td><span className="cp-badge">Portal</span></td>
                  <td><span className="cp-badge cp-badge-success">✓ Ativo</span></td>
                </tr>
                <tr>
                  <td>🌐 Site Institucional</td>
                  <td style={{ fontFamily: "monospace" }}>https://axiontecnologia.com.br</td>
                  <td><span className="cp-badge">Site</span></td>
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

export default Servicos;
