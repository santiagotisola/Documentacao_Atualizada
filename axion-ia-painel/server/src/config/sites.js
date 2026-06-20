/**
 * Catálogo de sites/instâncias dos sistemas Axion
 * Cada site tem URL, produto, credenciais (referenciadas via .env) e regras específicas
 */

const SITES = {
  // ════════════════════════════════════════════════════════════════
  // AxHub — Gestão de Trânsito / Fiscalização Eletrônica / Pesagem
  // ════════════════════════════════════════════════════════════════
  axhub: {
    label: "AxHub",
    icon: "🚦",
    descricao: "Sistema de gestão de infrações, passagens, monitoramento de equipamentos e relatórios",
    sites: [
      { id: "axhub-homologacao", nome: "Homologação", url: "https://homologacao.axhub.axion.ws", credencial: "AXHUB_CRED_SUPORTE", regiao: "Nacional", tipo: "homologacao" },
      { id: "axhub-goiania", nome: "Goiânia (SMM)", url: "https://goiania.axhub.axion.ws", credencial: "AXHUB_CRED_SUPORTE", regiao: "GO/Goiânia", tipo: "producao" },
      { id: "axhub-imepi", nome: "IMEPI (Piauí)", url: "https://imepi.axhub.axion.ws", credencial: "AXHUB_CRED_ADMIN", regiao: "PI", tipo: "producao" },
      { id: "axhub-smtt", nome: "SMTT", url: "https://smtt.axhub.axion.ws", credencial: "AXHUB_CRED_ADMIN", regiao: "Nacional", tipo: "producao" },
      { id: "axhub-ipemmt", nome: "IPEM-MT", url: "https://ipemmt.axhub.axion.ws", credencial: "AXHUB_CRED_ADMIN", regiao: "MT", tipo: "producao" },
      { id: "axhub-derse", nome: "DER-SE", url: "https://derse.axhub.axion.ws", credencial: "AXHUB_CRED_SUPORTE", regiao: "SE", tipo: "producao" },
      { id: "axhub-detranma", nome: "DETRAN-MA", url: "https://detranma.axhub.axion.ws", credencial: "AXHUB_CRED_SUPORTE", regiao: "MA", tipo: "producao" },
      { id: "axhub-detranpi", nome: "DETRAN-PI", url: "https://detranpi.axhub.axion.ws", credencial: "AXHUB_CRED_SUPORTE", regiao: "PI", tipo: "producao" },
      { id: "axhub-ibametro", nome: "IBAMETRO (Bahia)", url: "https://ibametro.axhub.axion.ws", credencial: "AXHUB_CRED_SUPORTE", regiao: "BA", tipo: "producao" },
      { id: "axhub-imeqpb", nome: "IMEQ-PB", url: "https://imeqpb.axhub.axion.ws", credencial: "AXHUB_CRED_ADMIN", regiao: "PB", tipo: "producao" },
      { id: "axhub-imetropa", nome: "IMETROPÁ", url: "https://imetropa.axhub.axion.ws", credencial: "AXHUB_CRED_ADMIN", regiao: "PA", tipo: "producao" },
      { id: "axhub-imperatriz", nome: "Imperatriz", url: "https://imperatriz.axhub.axion.ws", credencial: "AXHUB_CRED_SUPORTE", regiao: "MA/Imperatriz", tipo: "producao" },
      { id: "axhub-ipemce", nome: "IPEM-CE", url: "https://ipemce.axhub.axion.ws", credencial: "AXHUB_CRED_SUPORTE", regiao: "CE", tipo: "producao" },
      { id: "axhub-ipempe", nome: "IPEM-PE", url: "https://ipempe.axhub.axion.ws", credencial: "AXHUB_CRED_ADMIN_ALT", regiao: "PE", tipo: "producao" },
      { id: "axhub-itps", nome: "ITPS (Sergipe)", url: "https://itps.axhub.axion.ws", credencial: "AXHUB_CRED_ADMIN", regiao: "SE", tipo: "producao" },
      { id: "axhub-setrans", nome: "SETRANS", url: "https://setrans.axhub.axion.ws", credencial: "AXHUB_CRED_SUPORTE", regiao: "Nacional", tipo: "producao" },
      { id: "axhub-strans", nome: "STRANS", url: "https://strans.axhub.axion.ws", credencial: "AXHUB_CRED_ADMIN_ALT", regiao: "PI/Teresina", tipo: "producao" },
    ],
  },

  // ════════════════════════════════════════════════════════════════
  // AxCross — Monitoramento Veicular / Cruzamento de Placas
  // ════════════════════════════════════════════════════════════════
  axcross: {
    label: "AxCross",
    icon: "📡",
    descricao: "Sistema de cruzamento de placas e monitoramento veicular em tempo real",
    sites: [
      { id: "axcross-homologacao", nome: "Homologação", url: "https://homologacao.axcross.axion.ws", credencial: "AXCROSS_CRED_SUPORTE", regiao: "Nacional", tipo: "homologacao" },
      { id: "axcross-detranpi", nome: "DETRAN-PI", url: "https://detranpi.axcross.axion.ws", credencial: "AXCROSS_CRED_DETRANPI", regiao: "PI", tipo: "producao" },
      { id: "axcross-ipemmt", nome: "IPEM-MT", url: "https://ipemmt.axcross.axion.ws", credencial: "AXCROSS_CRED_SUPORTE", regiao: "MT", tipo: "producao" },
      { id: "axcross-derse", nome: "DER-SE", url: "https://derse.axcross.axion.ws", credencial: "AXCROSS_CRED_SUPORTE", regiao: "SE", tipo: "producao" },
      { id: "axcross-ipemce", nome: "IPEM-CE", url: "https://ipemce.axcross.axion.ws", credencial: "AXCROSS_CRED_SUPORTE", regiao: "CE", tipo: "producao" },
      { id: "axcross-setrans", nome: "SETRANS", url: "https://setrans.axcross.axion.ws", credencial: "AXCROSS_CRED_2025", regiao: "Nacional", tipo: "producao" },
      { id: "axcross-detranma", nome: "DETRAN-MA", url: "https://detranma.axcross.axion.ws", credencial: "AXCROSS_CRED_2025", regiao: "MA", tipo: "producao" },
      { id: "axcross-imperatriz", nome: "Imperatriz", url: "https://imperatriz.axcross.axion.ws", credencial: "AXCROSS_CRED_2025", regiao: "MA/Imperatriz", tipo: "producao" },
      { id: "axcross-ipempe", nome: "IPEM-PE", url: "https://ipempe.axcross.axion.ws", credencial: "AXCROSS_CRED_2025", regiao: "PE", tipo: "producao" },
      { id: "axcross-sefazpi", nome: "SEFAZ-PI", url: "https://sefazpi.axcross.axion.ws", credencial: "AXCROSS_CRED_2025", regiao: "PI", tipo: "producao" },
    ],
  },

  // ════════════════════════════════════════════════════════════════
  // AxTon — Pesagem Veicular
  // ════════════════════════════════════════════════════════════════
  axton: {
    label: "AxTon",
    icon: "⚖️",
    descricao: "Sistema de pesagem veicular (balanças dinâmicas e estáticas)",
    sites: [
      { id: "axton-homologacao", nome: "Homologação", url: "https://homologacao.axhub.axion.ws", credencial: "AXHUB_CRED_SUPORTE", regiao: "Nacional", tipo: "homologacao", nota: "AxTon integrado ao AxHub" },
    ],
  },

  // ════════════════════════════════════════════════════════════════
  // Outros (Identity, Economia)
  // ════════════════════════════════════════════════════════════════
  outros: {
    label: "Outros",
    icon: "🔧",
    descricao: "Serviços auxiliares (Identity, Economia)",
    sites: [
      { id: "identity", nome: "Identity Server", url: "https://identity.axion.ws", credencial: "AXHUB_CRED_SUPORTE", regiao: "Nacional", tipo: "infra" },
      { id: "goiania-id", nome: "Goiânia ID", url: "https://goiania.id.axion.ws", credencial: "AXHUB_CRED_SUPORTE", regiao: "GO/Goiânia", tipo: "infra" },
      { id: "economia", nome: "Economia", url: "https://economia.axion.ws", credencial: "AXHUB_CRED_SUPORTE", regiao: "Nacional", tipo: "infra" },
      { id: "goiania-portal", nome: "Goiânia Portal", url: "https://goiania.axion.ws", credencial: "AXCROSS_CRED_2025", regiao: "GO/Goiânia", tipo: "producao" },
    ],
  },
};

/**
 * Retorna catálogo de sites limpo (sem credenciais) para o frontend
 */
export function listarSites() {
  const resultado = {};
  for (const [produto, config] of Object.entries(SITES)) {
    resultado[produto] = {
      label: config.label,
      icon: config.icon,
      descricao: config.descricao,
      sites: config.sites.map(s => ({
        id: s.id,
        nome: s.nome,
        url: s.url,
        regiao: s.regiao,
        tipo: s.tipo,
        nota: s.nota || null,
      })),
    };
  }
  return resultado;
}

/**
 * Busca config completa de um site (com credenciais) para uso interno
 */
export function getSiteConfig(siteId) {
  for (const [produto, config] of Object.entries(SITES)) {
    const site = config.sites.find(s => s.id === siteId);
    if (site) {
      return { ...site, produto, produtoLabel: config.label };
    }
  }
  return null;
}

/**
 * Resolve credencial de um site a partir do .env
 */
export function resolverCredencial(credencialKey) {
  const CRED_MAP = {
    AXHUB_CRED_SUPORTE: { login: process.env.AXHUB_LOGIN_SUPORTE || "suporte@axiontecnologia.com.br", senha: process.env.AXHUB_SENHA_SUPORTE },
    AXHUB_CRED_ADMIN: { login: process.env.AXHUB_LOGIN_ADMIN || "Admin", senha: process.env.AXHUB_SENHA_ADMIN },
    AXHUB_CRED_ADMIN_ALT: { login: process.env.AXHUB_LOGIN_ADMIN_ALT || "admin", senha: process.env.AXHUB_SENHA_ADMIN_ALT },
    AXCROSS_CRED_SUPORTE: { login: process.env.AXCROSS_LOGIN_SUPORTE || "suporte@axiontecnologia.com.br", senha: process.env.AXCROSS_SENHA_SUPORTE },
    AXCROSS_CRED_DETRANPI: { login: process.env.AXCROSS_LOGIN_DETRANPI, senha: process.env.AXCROSS_SENHA_DETRANPI },
    AXCROSS_CRED_2025: { login: process.env.AXCROSS_LOGIN_2025 || "suporte@axiontecnologia.com.br", senha: process.env.AXCROSS_SENHA_2025 },
  };
  return CRED_MAP[credencialKey] || null;
}

export default SITES;
