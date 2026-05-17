/**
 * confidence-queue.js
 * Gerencia fila de itens com baixa confiança que precisam revisão humana.
 *
 * Integrado com MongoDB: collection "confianca_revisao"
 */

import ConfiancaRevisao from "../models/confianca-revisao.model.js";

/**
 * Cria entrada na fila de revisão para um item incerto.
 */
export async function adicionarParaRevisao({
  conformidadeId,
  produto,
  requisito,
  confianca,
  nivelConfianca,
  resultado_automatico, // "atendido" | "parcial" | "nao_atendido"
  evidencias,
  motivos,
  prioridade = "NORMAL",
}) {
  try {
    const entrada = new ConfiancaRevisao({
      conformidadeId,
      produto,
      requisito,
      confianca,
      nivelConfianca,
      resultado_automatico,
      resultado_revisao: null, // Será preenchido pelo revistor
      revisor_id: null,
      data_revisao: null,
      observacoes_revisao: null,
      evidencias,
      motivos,
      prioridade,
      status: "PENDENTE",
      data_criacao: new Date(),
    });

    await entrada.save();
    return entrada;
  } catch (err) {
    console.error("[Confiança] Erro ao adicionar para revisão:", err.message);
    throw err;
  }
}

/**
 * Lista itens na fila de revisão com filtros.
 */
export async function listarFilaRevisao({
  produto = null,
  status = "PENDENTE",
  prioridade = null,
  conformidadeId = null,
  limite = 50,
} = {}) {
  try {
    const filtro = { status };

    if (produto) filtro.produto = produto;
    if (prioridade) filtro.prioridade = prioridade;
    if (conformidadeId) filtro.conformidadeId = conformidadeId;

    const items = await ConfiancaRevisao.find(filtro)
      .sort({ prioridade: -1, data_criacao: 1 })
      .limit(limite)
      .lean();

    const total = await ConfiancaRevisao.countDocuments(filtro);

    return { items, total };
  } catch (err) {
    console.error("[Confiança] Erro ao listar fila:", err.message);
    throw err;
  }
}

/**
 * Marca um item como revisado.
 */
export async function marcarRevisado({
  id,
  resultado_revisao,
  observacoes,
  revisor_id,
  justificativa,
}) {
  try {
    const entrada = await ConfiancaRevisao.findByIdAndUpdate(
      id,
      {
        status: "REVISADO",
        resultado_revisao,
        observacoes_revisao: observacoes,
        revisor_id,
        justificativa_revisao: justificativa,
        data_revisao: new Date(),
      },
      { new: true }
    );

    return entrada;
  } catch (err) {
    console.error("[Confiança] Erro ao marcar revisado:", err.message);
    throw err;
  }
}

/**
 * Obtém estatísticas da fila de revisão.
 */
export async function obterEstatisticasRevisao(produto = null) {
  try {
    const filtro = produto ? { produto } : {};

    const total = await ConfiancaRevisao.countDocuments(filtro);
    const pendentes = await ConfiancaRevisao.countDocuments({
      ...filtro,
      status: "PENDENTE",
    });
    const revisados = await ConfiancaRevisao.countDocuments({
      ...filtro,
      status: "REVISADO",
    });

    const porNivel = await ConfiancaRevisao.aggregate([
      { $match: filtro },
      { $group: { _id: "$nivelConfianca", count: { $sum: 1 } } },
    ]);

    const porPrioridade = await ConfiancaRevisao.aggregate([
      { $match: filtro },
      { $group: { _id: "$prioridade", count: { $sum: 1 } } },
    ]);

    return {
      total,
      pendentes,
      revisados,
      taxa_conclusao: total > 0 ? Math.round((revisados / total) * 100) : 0,
      por_nivel: porNivel,
      por_prioridade: porPrioridade,
    };
  } catch (err) {
    console.error("[Confiança] Erro ao calcular estatísticas:", err.message);
    throw err;
  }
}

/**
 * Cria filas em lote a partir de um relatório de conformidade.
 */
export async function criarFilasDoRelatorio(
  conformidadeId,
  itensComBaixaConfianca
) {
  try {
    const filas = [];

    for (const item of itensComBaixaConfianca) {
      const fila = await adicionarParaRevisao({
        conformidadeId,
        produto: item.produto,
        requisito: item.requisito,
        confianca: item.confianca,
        nivelConfianca: item.nivelConfianca,
        resultado_automatico: item.resultado,
        evidencias: item.evidencias || [],
        motivos: item.motivos || [],
        prioridade:
          item.confianca < 0.3 ? "ALTA" :
          item.confianca < 0.5 ? "MEDIA" : "BAIXA",
      });

      filas.push(fila);
    }

    return filas;
  } catch (err) {
    console.error("[Confiança] Erro ao criar filas:", err.message);
    throw err;
  }
}

/**
 * Resolve todos os itens de uma conformidade (marca como revisados automaticamente se confiança alta).
 */
export async function resolverFilasAutomaticamente(
  conformidadeId,
  limiarAutoResolve = 0.8
) {
  try {
    const itens = await ConfiancaRevisao.find({
      conformidadeId,
      status: "PENDENTE",
      confianca: { $gte: limiarAutoResolve },
    });

    const promises = itens.map(item =>
      marcarRevisado({
        id: item._id,
        resultado_revisao: item.resultado_automatico,
        observacoes:
          "Auto-resolvido por confiança alta (>= " + limiarAutoResolve + ")",
        revisor_id: "SISTEMA",
        justificativa: "Score de confiança acima do limiar",
      })
    );

    const resolvidos = await Promise.all(promises);
    return { total: resolvidos.length, itens: resolvidos };
  } catch (err) {
    console.error("[Confiança] Erro ao resolver automaticamente:", err.message);
    throw err;
  }
}

/**
 * Exporta fila para CSV (para revisão externa ou análise).
 */
export async function exportarFilaCsv(produto = null) {
  try {
    const { items } = await listarFilaRevisao({
      produto,
      status: "PENDENTE",
      limite: 1000,
    });

    const csv = [
      "ID,Conformidade,Produto,Requisito,Confiança,Nível,Resultado Auto,Prioridade,Data",
      ...items.map(
        item =>
          `"${item._id}","${item.conformidadeId}","${item.produto}","${item.requisito.replace(/"/g, '""')}",${item.confianca.toFixed(2)},"${item.nivelConfianca}","${item.resultado_automatico}","${item.prioridade}","${item.data_criacao.toISOString()}"`
      ),
    ].join("\n");

    return csv;
  } catch (err) {
    console.error("[Confiança] Erro ao exportar CSV:", err.message);
    throw err;
  }
}
