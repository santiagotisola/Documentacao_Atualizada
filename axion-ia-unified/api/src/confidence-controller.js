/**
 * confidence-controller.js
 * Endpoints REST para gerenciar fila de revisão de confiança.
 *
 * Endpoints:
 *   GET  /api/confianca/fila              → lista itens pendentes
 *   GET  /api/confianca/estatisticas      → KPIs da fila
 *   POST /api/confianca/:id/revisar       → marca como revisado
 *   GET  /api/confianca/:id               → detalhe de um item
 *   GET  /api/confianca/exportar/csv      → exporta fila em CSV
 */

import {
  listarFilaRevisao,
  obterEstatisticasRevisao,
  marcarRevisado,
  exportarFilaCsv,
  resolverFilasAutomaticamente,
} from "./services/confidence-queue.js";
import ConfiancaRevisao from "./models/confianca-revisao.model.js";

const PRODUTOS_VALIDOS = ["axhub", "axton", "axcross"];

/**
 * GET /api/confianca/fila?produto=axhub&status=PENDENTE&prioridade=ALTA&limite=50
 */
export async function listarFilaHandler(req, res) {
  try {
    const {
      produto,
      status = "PENDENTE",
      prioridade,
      conformidadeId,
      limite = 50,
    } = req.query;

    // Validar produto
    if (produto && !PRODUTOS_VALIDOS.includes(produto)) {
      return res.status(400).json({ erro: "Produto inválido" });
    }

    const { items, total } = await listarFilaRevisao({
      produto: produto || null,
      status,
      prioridade: prioridade || null,
      conformidadeId: conformidadeId || null,
      limite: Math.min(Number(limite) || 50, 500),
    });

    return res.json({
      total,
      items: items.map(item => ({
        _id: item._id,
        conformidadeId: item.conformidadeId,
        produto: item.produto,
        requisito: item.requisito,
        confianca: item.confianca,
        nivelConfianca: item.nivelConfianca,
        resultado_automatico: item.resultado_automatico,
        resultado_revisao: item.resultado_revisao,
        prioridade: item.prioridade,
        status: item.status,
        motivos: item.motivos,
        evidencias: item.evidencias,
        data_criacao: item.data_criacao,
        data_revisao: item.data_revisao,
        revisor_id: item.revisor_id,
      })),
    });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

/**
 * GET /api/confianca/estatisticas?produto=axhub
 */
export async function obterEstatisticasHandler(req, res) {
  try {
    const { produto } = req.query;

    if (produto && !PRODUTOS_VALIDOS.includes(produto)) {
      return res.status(400).json({ erro: "Produto inválido" });
    }

    const stats = await obterEstatisticasRevisao(produto || null);

    return res.json(stats);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

/**
 * GET /api/confianca/:id
 */
export async function obterItemHandler(req, res) {
  try {
    const { id } = req.params;

    const item = await ConfiancaRevisao.findById(id);

    if (!item) {
      return res.status(404).json({ erro: "Item não encontrado" });
    }

    return res.json(item);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

/**
 * POST /api/confianca/:id/revisar
 * Body: { resultado_revisao, observacoes, revisor_id, justificativa }
 */
export async function marcarRevisadoHandler(req, res) {
  try {
    const { id } = req.params;
    const { resultado_revisao, observacoes, revisor_id, justificativa } =
      req.body;

    if (!resultado_revisao) {
      return res
        .status(400)
        .json({
          erro: "Campo obrigatório: resultado_revisao (atendido|parcial|nao_atendido)",
        });
    }

    if (!["atendido", "parcial", "nao_atendido"].includes(resultado_revisao)) {
      return res.status(400).json({
        erro: "resultado_revisao inválido (use: atendido, parcial, nao_atendido)",
      });
    }

    const item = await marcarRevisado({
      id,
      resultado_revisao,
      observacoes: observacoes || "",
      revisor_id: revisor_id || "DESCONHECIDO",
      justificativa: justificativa || "",
    });

    return res.json({
      sucesso: true,
      item,
    });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

/**
 * POST /api/confianca/conformidade/:conformidadeId/auto-resolver
 * Auto-resolve itens com confiança alta (>= limiar)
 */
export async function autoResolverHandler(req, res) {
  try {
    const { conformidadeId } = req.params;
    const { limiar = 0.8 } = req.query;

    const resultado = await resolverFilasAutomaticamente(
      conformidadeId,
      Number(limiar)
    );

    return res.json({
      sucesso: true,
      auto_resolvidos: resultado.total,
      items: resultado.itens,
    });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

/**
 * GET /api/confianca/exportar/csv?produto=axhub
 */
export async function exportarCsvHandler(req, res) {
  try {
    const { produto } = req.query;

    if (produto && !PRODUTOS_VALIDOS.includes(produto)) {
      return res.status(400).json({ erro: "Produto inválido" });
    }

    const csv = await exportarFilaCsv(produto || null);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=fila-revisao.csv"
    );

    return res.send(csv);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

/**
 * POST /api/confianca/:id/descartar
 * Descarta um item da fila (não será revisado)
 */
export async function descartarItemHandler(req, res) {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const item = await ConfiancaRevisao.findByIdAndUpdate(
      id,
      {
        status: "DESCARTADO",
        justificativa_revisao: motivo || "Descartado pelo usuário",
        data_revisao: new Date(),
      },
      { new: true }
    );

    return res.json({ sucesso: true, item });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}
