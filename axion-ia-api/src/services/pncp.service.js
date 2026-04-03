/**
 * pncp.service.js
 * Integração com o Portal Nacional de Contratações Públicas (PNCP).
 * API pública — sem autenticação — sem SICAF necessário.
 *
 * Documentação: https://pncp.gov.br/api/consulta/swagger-ui/index.html
 */

import axios from "axios";

const BASE_URL = "https://pncp.gov.br/api/consulta/v1";

// Timeout conservador para não travar o scheduler
const TIMEOUT_MS = 15000;

// Palavras-chave de busca padrão por produto
// Alinhadas com o domínio de cada sistema
export const PALAVRAS_CHAVE_PRODUTO = {
  axhub: [
    "fiscalização eletrônica",
    "radar velocidade",
    "sistema de monitoramento viário",
    "equipamento de trânsito",
    "pesagem veicular",
    "controller de tráfego",
    "leitor de placa",
    "cronotacógrafo",
    "sistema integrado trânsito",
    "detector veicular",
  ],
  axton: [
    "posto de pesagem",
    "balança rodoviária",
    "controle de peso veicular",
    "sistema pesagem",
    "tacógrafo",
    "jornada motorista",
    "peso bruto total",
    "balança veicular",
  ],
  axcross: [
    "semáforo inteligente",
    "cruzamento monitorado",
    "controle de cruzamento",
    "interseção viária",
    "leitura de placa cruzamento",
    "sistema de rotatória",
    "câmera cruzamento",
    "detecção passagem",
  ],
};

/**
 * Busca contratações publicadas no PNCP por palavra-chave.
 * @param {Object} opts
 * @param {string} opts.palavraChave
 * @param {number} opts.pagina
 * @param {number} opts.tamanhoPagina
 * @param {string} opts.dataInicial - "YYYYMMDD"
 * @param {string} opts.dataFinal   - "YYYYMMDD"
 * @returns {Promise<Array>}
 */
export async function buscarContratacoes({ palavraChave = "", pagina = 1, tamanhoPagina = 10, dataInicial, dataFinal } = {}) {
  // Default: últimos 30 dias
  const hoje = new Date();
  const trinta = new Date(hoje);
  trinta.setDate(hoje.getDate() - 30);

  const di = dataInicial || formatarData(trinta);
  const df = dataFinal   || formatarData(hoje);

  try {
    const resp = await axios.get(`${BASE_URL}/contratacoes/publicacao`, {
      params: {
        dataInicial: di,
        dataFinal:   df,
        pagina,
        tamanhoPagina,
        ...(palavraChave ? { q: palavraChave } : {}),
      },
      timeout: TIMEOUT_MS,
      headers: { Accept: "application/json" },
    });

    const items = resp.data?.data || resp.data?.content || resp.data?.items || [];

    return items.map(normalizar);
  } catch (err) {
    // Fallback: tenta endpoint alternativo
    try {
      const resp2 = await axios.get(`${BASE_URL}/contratacoes`, {
        params: { dataInicial: di, dataFinal: df, pagina, tamanhoPagina, palavraChave },
        timeout: TIMEOUT_MS,
        headers: { Accept: "application/json" },
      });
      const items2 = resp2.data?.data || resp2.data?.content || resp2.data?.items || [];
      return items2.map(normalizar);
    } catch (err2) {
      console.warn(`[PNCP] Falha na busca: ${err2.message}`);
      return [];
    }
  }
}

/**
 * Busca por múltiplas palavras-chave de um produto (coleta completa).
 * @param {string} produto - "axhub" | "axton" | "axcross"
 * @param {string[]} [palavrasExtra] - palavras adicionais configuradas
 * @returns {Promise<Array>}
 */
export async function coletarPorProduto(produto, palavrasExtra = []) {
  const palavras = [
    ...(PALAVRAS_CHAVE_PRODUTO[produto] || []),
    ...palavrasExtra,
  ];

  const resultados = [];
  const vistos = new Set();

  for (const palavra of palavras) {
    await esperar(500); // throttle gentil
    const items = await buscarContratacoes({ palavraChave: palavra, tamanhoPagina: 5 });

    for (const item of items) {
      if (!vistos.has(item.numero)) {
        vistos.add(item.numero);
        resultados.push({ ...item, palavraChaveBusca: palavra, produto });
      }
    }
  }

  return resultados;
}

// ─── helpers ─────────────────────────────────────────────────────

function normalizar(item) {
  return {
    numero:       item.numeroCompra || item.codigoCompra || item.numero || item.id || "N/D",
    titulo:       item.objetoCompra || item.objeto || item.descricao || item.titulo || "Sem título",
    orgao:        item.orgaoEntidade?.razaoSocial || item.orgao?.nome || item.nomeOrgao || "Órgão não informado",
    uf:           item.unidadeOrgao?.ufSigla || item.orgaoEntidade?.uf || item.uf || "",
    dataPublicacao: item.dataPublicacaoPncp || item.dataAbertura || item.data || new Date().toISOString(),
    modalidade:   item.modalidadeNome || item.modalidade || "Não informada",
    valor:        item.valorTotalEstimado || item.valor || null,
    link:         item.linkSistemaOrigem || item.urlEdital || item.url || `https://pncp.gov.br/app/editais/${item.cnpj}/${item.ano}/${item.sequencial}`,
    descricao:    item.informacaoComplementar || item.descricaoDetalhada || item.objetoCompra || "",
    cnpj:         item.orgaoEntidade?.cnpj || item.cnpj || "",
    ano:          item.anoCompra || new Date().getFullYear(),
    sequencial:   item.sequencialCompra || 0,
  };
}

function formatarData(d) {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

function esperar(ms) {
  return new Promise(r => setTimeout(r, ms));
}
