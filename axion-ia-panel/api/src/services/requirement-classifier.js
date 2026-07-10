/**
 * requirement-classifier.js
 * Classifica requisitos por tipo: SOFTWARE, HARDWARE, INTEGRAÇÃO, RELATÓRIO, SEGURANÇA, etc.
 */

const PATTERNS = {
  software: {
    keywords: [
      "sistema", "software", "aplicação", "módulo", "funcionalidade",
      "interface", "tela", "menu", "botão", "formulário", "validação",
      "regra de negócio", "processamento", "algoritmo", "cálculo",
      "banco de dados", "armazenar", "persistir", "consultar",
      "api", "webservice", "endpoint", "integração", "sincronização",
      "relatório", "gráfico", "dashboard", "export", "import"
    ],
  },
  
  hardware: {
    keywords: [
      "hardware", "impressora", "scanner", "leitor", "dispositivo",
      "câmera", "sensor", "balança", "terminal", "equipamento",
      "placa", "processador", "memória", "disco", "rede",
      "lan", "wifi", "ethernet", "modem", "comunicação",
      "máquina", "periférico"
    ],
  },
  
  integração: {
    keywords: [
      "integração", "api", "webservice", "interface", "comunicação",
      "sincronizar", "conexão", "banco de dados", "banco externo",
      "sistema externo", "terceiros", "fornecedor", "partner",
      "sso", "ldap", "active directory", "autenticação",
      "enviar dados", "receber dados", "troca de dados"
    ],
  },
  
  segurança: {
    keywords: [
      "segurança", "autenticação", "autorização", "permissão",
      "criptografia", "senha", "token", "acesso", "controle",
      "auditoria", "log", "rastreabilidade", "backup",
      "recuperação", "redundância", "disponibilidade",
      "usuário", "perfil", "papel", "privilégio"
    ],
  },
  
  relatório: {
    keywords: [
      "relatório", "gráfico", "dashboard", "export", "pdf",
      "excel", "csv", "planilha", "consulta", "filtro",
      "período", "data", "intervalo", "estatística",
      "análise", "visão", "visualização"
    ],
  },
  
  conformidade: {
    keywords: [
      "conformidade", "regulação", "lei", "decreto", "resolução",
      "norma", "padrão", "normatização", "legislação",
      "requisito", "obrigação", "exigência", "auditoria",
      "compliance", "aderência"
    ],
  },
  
  performance: {
    keywords: [
      "performance", "velocidade", "tempo resposta", "latência",
      "throughput", "escalabilidade", "carga", "simultaneidade",
      "usuários", "transações", "requisições", "otimização"
    ],
  },
  
  usabilidade: {
    keywords: [
      "interface", "usabilidade", "experiência", "user experience",
      "ux", "ui", "acessibilidade", "intuitivo", "fácil",
      "navegação", "menu", "desenho", "visual", "layout"
    ],
  },
};

/**
 * Classifica um requisito por tipo
 * @param {string|Object} requisito - Texto do requisito ou objeto com propriedade requisito
 * @returns {string} - Tipo principal (SOFTWARE, HARDWARE, INTEGRAÇÃO, etc.)
 */
export function classificarTipoRequisito(requisito) {
  // Extrair texto se for objeto
  let texto = typeof requisito === "string" ? requisito : (requisito?.requisito || "");
  
  if (!texto || typeof texto !== "string") {
    return "GERAL";
  }
  
  texto = texto.toLowerCase();
  const scores = {};

  // Contar coincidências para cada tipo
  for (const [tipo, config] of Object.entries(PATTERNS)) {
    let hits = 0;
    for (const keyword of config.keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      hits += (texto.match(regex) || []).length;
    }
    scores[tipo] = hits;
  }

  // Retornar tipo com maior score
  const melhorTipo = Object.entries(scores).sort(([, a], [, b]) => b - a)[0];
  return melhorTipo[1] > 0 ? melhorTipo[0].toUpperCase() : "GERAL";
}

/**
 * Classifica todos os requisitos e agrupa por tipo
 * @param {Array} requisitos - Lista de requisitos
 * @returns {Object} - Requisitos agrupados por tipo com contagem
 */
export function agruparPorTipo(requisitos) {
  const grupos = {};

  for (const req of requisitos) {
    const tipo = classificarTipoRequisito(req.requisito || req);
    if (!grupos[tipo]) {
      grupos[tipo] = [];
    }
    grupos[tipo].push({
      ...req,
      tipo,
    });
  }

  return grupos;
}

/**
 * Retorna descrição amigável para cada tipo
 * @param {string} tipo - Tipo do requisito
 * @returns {string} - Descrição
 */
export function descreverTipo(tipo) {
  const descricoes = {
    SOFTWARE: "Funcionalidades e Processamento",
    HARDWARE: "Equipamentos e Dispositivos",
    INTEGRAÇÃO: "Comunicação entre Sistemas",
    SEGURANÇA: "Controle de Acesso e Proteção",
    RELATÓRIO: "Geração de Relatórios e Análises",
    CONFORMIDADE: "Conformidade Regulatória",
    PERFORMANCE: "Desempenho e Escalabilidade",
    USABILIDADE: "Interface e Experiência",
    GERAL: "Requisitos Gerais",
  };
  return descricoes[tipo] || tipo;
}

/**
 * Retorna emoji para cada tipo
 * @param {string} tipo - Tipo do requisito
 * @returns {string} - Emoji
 */
export function emojiTipo(tipo) {
  const emojis = {
    SOFTWARE: "💻",
    HARDWARE: "⚙️",
    INTEGRAÇÃO: "🔗",
    SEGURANÇA: "🔐",
    RELATÓRIO: "📊",
    CONFORMIDADE: "📋",
    PERFORMANCE: "⚡",
    USABILIDADE: "🎨",
    GERAL: "📌",
  };
  return emojis[tipo] || "📌";
}
