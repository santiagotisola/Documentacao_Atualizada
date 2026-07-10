/**
 * multi-product-analysis.js
 * Analisa um edital contra os 3 produtos (AxHub, AxTon, AxCross) simultaneamente
 * Retorna análise estruturada por produto e por tipo de requisito
 */

import { gerarRelatorioConformidade } from "./conformidade.js";
import { agruparPorTipo, descreverTipo, emojiTipo } from "./requirement-classifier.js";
import { avaliarConfiancaRequisito } from "./confidence-scorer.js";

const PRODUTOS = ["axhub", "axton", "axcross"];

const NOMES_PRODUTO = {
  axhub: "🖥️ AxHub",
  axton: "⚖️ AxTon",
  axcross: "🚦 AxCross",
};

const DESCRICOES_PRODUTO = {
  axhub: "Gestão de Helpdesk e Conformidade",
  axton: "Pesagem e Classificação Veicular",
  axcross: "Monitoramento de Cruzamentos",
};

/**
 * Analisa um edital contra os 3 produtos simultaneamente
 * @param {Object} opcoes - { tituloEdital, textoEdital, comJustificativas }
 * @returns {Promise<Object>} - Análise estruturada
 */
export async function analisarMultiploProdutos({
  tituloEdital,
  textoEdital,
  comJustificativas = true,
}) {
  console.log(`[Multi-Product Analysis] Analisando edital contra 3 produtos...`);
  
  const inicio = Date.now();
  const analises = {};
  const resumo = {
    tituloEdital,
    dataAnalise: new Date(),
    requisitosTotal: 0,
    produtosAnalisados: [],
    resumoPorTipo: {},
    resumoPorProduto: {},
  };

  // Analisar cada produto
  for (const produto of PRODUTOS) {
    try {
      console.log(`  → Analisando ${NOMES_PRODUTO[produto]}...`);
      
      const resultado = await gerarRelatorioConformidade({
        produto,
        tituloEdital,
        textoEdital,
        comJustificativas,
      });

      const { relatorio, stats } = resultado;

      // Adicionar confiança aos itens
      const itensComConfianca = (relatorio.itens || []).map(item => ({
        ...item,
        confianca: avaliarConfiancaRequisito(
          { texto: item.requisito, origem: item.origem },
          []
        ),
      }));

      // Agrupar por tipo
      const itensPorTipo = agruparPorTipo(itensComConfianca);

      analises[produto] = {
        nome: NOMES_PRODUTO[produto],
        descricao: DESCRICOES_PRODUTO[produto],
        veredicto: relatorio.veredicto || "INAPTO",
        percentualAtendimento: stats?.percentualAtendimento || 0,
        totalRequisitos: stats?.totalRequisitos || 0,
        atendidos: stats?.atendidos || 0,
        parciais: stats?.parciais || 0,
        naoAtendidos: stats?.naoAtendidos || 0,
        itens: itensComConfianca,
        itensPorTipo,
        stats,
      };

      resumo.produtosAnalisados.push({
        nome: NOMES_PRODUTO[produto],
        veredicto: relatorio.veredicto || "INAPTO",
        atendimento: (stats?.percentualAtendimento || 0),
      });

      resumo.requisitosTotal = Math.max(resumo.requisitosTotal, stats?.totalRequisitos || 0);
    } catch (erro) {
      console.error(`  ✗ Erro ao analisar ${produto}:`, erro.message);
      analises[produto] = {
        nome: NOMES_PRODUTO[produto],
        erro: erro.message,
      };
    }
  }

  // Consolidar resumo por tipo
  for (const [produto, dados] of Object.entries(analises)) {
    if (dados.itensPorTipo) {
      for (const [tipo, itens] of Object.entries(dados.itensPorTipo)) {
        if (!resumo.resumoPorTipo[tipo]) {
          resumo.resumoPorTipo[tipo] = {
            tipo,
            descricao: descreverTipo(tipo),
            emoji: emojiTipo(tipo),
            totalRequisitos: 0,
            atendidosPorProduto: {},
            parciais: {},
            naoAtendidos: {},
          };
        }

        for (const produto2 of PRODUTOS) {
          if (!resumo.resumoPorTipo[tipo].atendidosPorProduto[produto2]) {
            resumo.resumoPorTipo[tipo].atendidosPorProduto[produto2] = 0;
            resumo.resumoPorTipo[tipo].parciais[produto2] = 0;
            resumo.resumoPorTipo[tipo].naoAtendidos[produto2] = 0;
          }
        }

        resumo.resumoPorTipo[tipo].totalRequisitos = itens.length;
        
        const atendidos = itens.filter(i => i.status === "ATENDIDO").length;
        const parciaisCount = itens.filter(i => i.status === "PARCIAL").length;
        const nao = itens.filter(i => i.status === "NÃO_ATENDIDO").length;

        resumo.resumoPorTipo[tipo].atendidosPorProduto[produto] = atendidos;
        resumo.resumoPorTipo[tipo].parciais[produto] = parciaisCount;
        resumo.resumoPorTipo[tipo].naoAtendidos[produto] = nao;
      }
    }
  }

  // Consolidar resumo por produto
  for (const [produto, dados] of Object.entries(analises)) {
    if (!dados.erro) {
      resumo.resumoPorProduto[produto] = {
        nome: dados.nome,
        descricao: dados.descricao,
        veredicto: dados.veredicto,
        atendimento: `${dados.percentualAtendimento.toFixed(1)}%`,
        atendidos: dados.atendidos,
        parciais: dados.parciais,
        naoAtendidos: dados.naoAtendidos,
        totalRequisitos: dados.totalRequisitos,
      };
    }
  }

  const duracao = ((Date.now() - inicio) / 1000).toFixed(2);
  console.log(`[Multi-Product Analysis] ✅ Análise concluída em ${duracao}s`);

  return {
    resumo,
    analisesPorProduto: analises,
    geradoEm: new Date(),
  };
}

/**
 * Compara o mesmo tipo de requisito entre os 3 produtos
 * Útil para ver qual produto melhor atende cada categoria
 * @param {Object} analises - Resultado de analisarMultiploProdutos
 * @returns {Object} - Comparação por tipo
 */
export function compararPorTipo(analises) {
  const comparacao = {};

  for (const [tipo, dados] of Object.entries(analises.resumo.resumoPorTipo)) {
    comparacao[tipo] = {
      tipo: dados.tipo,
      descricao: dados.descricao,
      emoji: dados.emoji,
      totalRequisitos: dados.totalRequisitos,
      produtosRanking: PRODUTOS
        .map(p => ({
          produto: NOMES_PRODUTO[p],
          atendidos: dados.atendidosPorProduto[p] || 0,
          parciais: dados.parciais[p] || 0,
          naoAtendidos: dados.naoAtendidos[p] || 0,
          taxa: ((dados.atendidosPorProduto[p] || 0) / dados.totalRequisitos * 100).toFixed(1),
        }))
        .sort((a, b) => parseFloat(b.taxa) - parseFloat(a.taxa)),
    };
  }

  return comparacao;
}

/**
 * Identifica o que falta em cada produto
 * @param {Object} analises - Resultado de analisarMultiploProdutos
 * @returns {Object} - O que falta por produto
 */
export function identificarLacunas(analises) {
  const lacunas = {};

  for (const [produto, dados] of Object.entries(analises.analisesPorProduto)) {
    if (dados.erro) continue;

    lacunas[produto] = {
      nome: dados.nome,
      descricao: dados.descricao,
      naoAtendidos: dados.itens
        .filter(i => i.status === "NÃO_ATENDIDO")
        .map(i => ({
          requisito: i.requisito,
          tipo: i.tipo,
          motivo: i.justificativa || "Sem justificativa",
        })),
      parciais: dados.itens
        .filter(i => i.status === "PARCIAL")
        .map(i => ({
          requisito: i.requisito,
          tipo: i.tipo,
          situacaoAtual: i.justificativa || "Implementação parcial",
        })),
    };
  }

  return lacunas;
}

/**
 * Gera recomendações de melhoria
 * @param {Object} analises - Resultado de analisarMultiploProdutos
 * @returns {Array} - Recomendações
 */
export function gerarRecomendacoes(analises) {
  const recomendacoes = [];
  const lacunas = identificarLacunas(analises);

  for (const [produto, dados] of Object.entries(lacunas)) {
    if (dados.naoAtendidos.length > 0) {
      recomendacoes.push({
        produto: dados.nome,
        prioridade: "ALTA",
        tipo: "Requisitos Não Atendidos",
        quantidade: dados.naoAtendidos.length,
        requisitos: dados.naoAtendidos.slice(0, 5),
        acao: `Implementar ${dados.naoAtendidos.length} requisitos não atendidos em ${dados.nome}`,
      });
    }

    if (dados.parciais.length > 0) {
      recomendacoes.push({
        produto: dados.nome,
        prioridade: "MÉDIA",
        tipo: "Requisitos Parciais",
        quantidade: dados.parciais.length,
        requisitos: dados.parciais.slice(0, 5),
        acao: `Complementar implementação de ${dados.parciais.length} requisitos parciais em ${dados.nome}`,
      });
    }
  }

  // Ordenar por prioridade
  const ordem = { ALTA: 0, MÉDIA: 1, BAIXA: 2 };
  return recomendacoes.sort((a, b) => ordem[a.prioridade] - ordem[b.prioridade]);
}
