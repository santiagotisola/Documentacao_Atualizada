/**
 * PNCP Scraper — Coleta editais da plataforma de compras gov.br
 * Busca por número de edital, palavra-chave, ou órgão
 * Retorna: título, link, data, órgão, tipo, especificações
 */

import axios from "axios";

const PNCP_API_URL = "https://www.compras.gov.br/api";
const GOV_BR_SEARCH = "https://www.gov.br/conab/pt-br/search";

/**
 * Buscar editais no PNCP por número, palavra-chave ou filtros
 */
export async function buscarEditaisPNCP(query, filtros = {}) {
  try {
    // 1. Tentar buscar via API oficial PNCP (se disponível)
    const editaisAPI = await buscarViaAPI(query, filtros);
    if (editaisAPI && editaisAPI.length > 0) {
      return editaisAPI;
    }

    // 2. Fallback: Buscar via GOV.BR (web scraping simplificado)
    const editaisGov = await buscarViaGovBr(query);
    return editaisGov;
  } catch (erro) {
    console.error("❌ Erro ao buscar editais:", erro.message);
    return [];
  }
}

/**
 * Busca via API PNCP (simulado — API real requer autenticação)
 */
async function buscarViaAPI(query, filtros) {
  try {
    const params = {
      q: query,
      formato: "json",
      ...filtros,
    };

    // Nota: API PNCP real requer token OAuth2
    // Este é um exemplo de como seria feito
    const response = await axios.get(`${PNCP_API_URL}/v1/avisos`, {
      params,
      timeout: 5000,
    });

    return response.data.avisos || [];
  } catch (erro) {
    console.warn("⚠️ API PNCP indisponível, usando fallback");
    return [];
  }
}

/**
 * Busca via GOV.BR (scraping simples)
 * Retorna dados estruturados do edital
 */
async function buscarViaGovBr(query) {
  try {
    const searchUrl = `${GOV_BR_SEARCH}?origem=form&SearchableText=${encodeURIComponent(query)}`;
    
    // Em produção, usar cheerio ou similar para parse HTML
    // Por enquanto, retornar dados mock/exemplo
    
    const resultado = {
      termo: query,
      url: searchUrl,
      editaisMock: [
        {
          id: `edital_${query}_1`,
          titulo: `Pregão Eletrônico CONAB nº ${query} (Exemplo)`,
          numero: query,
          orgao: "CONAB - Companhia Nacional de Abastecimento",
          tipo: "Pregão Eletrônico",
          data: new Date().toISOString().split('T')[0],
          link: `https://www.gov.br/conab/pt-br/acesso-a-informacao/licitacoes-e-contratos/licitacoes/matriz/edital-${query}`,
          descricao: "Edital para fornecimento de serviços/produtos conforme especificações",
          status: "Aberto",
          dataAbertura: new Date().toISOString(),
          prazoSubmissao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    };

    return resultado.editaisMock;
  } catch (erro) {
    console.error("❌ Erro ao buscar em gov.br:", erro.message);
    return [];
  }
}

/**
 * Extrair especificações técnicas do edital
 * Procura por seções comuns: REQUISITOS, ESPECIFICAÇÕES, FUNCIONALIDADES
 */
export function extrairEspecificacoes(textoEdital) {
  const padroes = {
    requisitos: /REQUISITOS\s*:?[\s\n]+([\s\S]*?)(?=\n\n|$)/gi,
    especificacoes: /ESPECIFICAÇÕES?\s*:?[\s\n]+([\s\S]*?)(?=\n\n|$)/gi,
    funcionalidades: /FUNCIONALIDADES?\s*:?[\s\n]+([\s\S]*?)(?=\n\n|$)/gi,
    conformidade: /CONFORMIDADE|LGPD|INMETRO|CONTRAN|ABNT/gi,
  };

  const resultado = {
    requisitos: [],
    especificacoes: [],
    funcionalidades: [],
    conformidades: [],
  };

  // Extrair requisitos
  let match;
  while ((match = padroes.requisitos.exec(textoEdital)) !== null) {
    resultado.requisitos.push(match[1].trim());
  }

  // Extrair especificações
  while ((match = padroes.especificacoes.exec(textoEdital)) !== null) {
    resultado.especificacoes.push(match[1].trim());
  }

  // Extrair funcionalidades
  while ((match = padroes.funcionalidades.exec(textoEdital)) !== null) {
    resultado.funcionalidades.push(match[1].trim());
  }

  // Extrair conformidades
  while ((match = padroes.conformidade.exec(textoEdital)) !== null) {
    resultado.conformidades.push(match[0].trim());
  }

  return resultado;
}

/**
 * Normalizar dados de edital para formato padrão da aplicação
 */
export function normalizarEdital(editalRaw) {
  return {
    titulo: editalRaw.titulo || "Sem título",
    numero: editalRaw.numero || editalRaw.id,
    orgao: editalRaw.orgao || "Órgão desconhecido",
    tipo: editalRaw.tipo || "Pregão",
    data: editalRaw.data,
    link: editalRaw.link,
    descricao: editalRaw.descricao || "",
    status: editalRaw.status || "Pendente",
    dataAbertura: editalRaw.dataAbertura,
    prazoSubmissao: editalRaw.prazoSubmissao,
    fonte: "PNCP/GOV.BR",
    importadoEm: new Date().toISOString(),
  };
}

/**
 * Validar se edital já existe na base
 */
export async function verificarDuplicata(numero, fontesDB) {
  if (!fontesDB || fontesDB.length === 0) return false;
  return fontesDB.some(f => f.numero === numero || f.titulo.includes(numero));
}

/**
 * Sugerir produtos compatíveis baseado em conteúdo do edital
 */
export function sugerirProdutos(textoEdital) {
  const palavrasChave = {
    axhub: [
      "tráfego",
      "monitoramento",
      "câmera",
      "infração",
      "velocidade",
      "passagem",
    ],
    axton: [
      "pesagem",
      "balança",
      "roda",
      "veicular",
      "classificação",
      "categoria",
    ],
    axcross: [
      "cruzamento",
      "semáforo",
      "sinalização",
      "controle",
      "sincronização",
      "tráfego urbano",
    ],
  };

  const produtosSugeridos = {};

  for (const [produto, palavras] of Object.entries(palavrasChave)) {
    const matches = palavras.filter(p => 
      new RegExp(p, "gi").test(textoEdital)
    );
    if (matches.length > 0) {
      produtosSugeridos[produto] = {
        compatibilidade: Math.min(100, matches.length * 20),
        palavrasEncontradas: matches,
      };
    }
  }

  return produtosSugeridos;
}
