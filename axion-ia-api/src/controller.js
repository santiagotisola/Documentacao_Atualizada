import { gerarResposta } from "./engine.js";
import { obterHistorico, obterNaoRespondidas, obterEstatisticas } from "./logger.js";
import { treinar } from "./services/training.js";
import { analisarChamados } from "./services/analise.js";
import { Log } from "./models/log.model.js";
import { KB } from "./models/kb.model.js";

export async function processarMensagem(req, res) {
  try {
    const { mensagem } = req.body;

    if (!mensagem) {
      return res.status(400).json({
        erro: "Mensagem não informada"
      });
    }

    const resultado = await gerarResposta(mensagem);

    return res.json({
      sucesso: true,
      resposta: resultado.resposta,
      origem: resultado.origem,
      score: resultado.score
    });

  } catch (error) {
    return res.status(500).json({
      erro: "Erro interno",
      detalhe: error.message
    });
  }
}

export function consultarHistorico(req, res) {
  const historico = obterHistorico();
  return res.json({ total: historico.length, historico });
}

export function consultarPendentes(req, res) {
  const pendentes = obterNaoRespondidas();
  return res.json({ total: pendentes.length, pendentes });
}

export function consultarEstatisticas(req, res) {
  const stats = obterEstatisticas();
  return res.json(stats);
}

// --- Novos endpoints: Treinamento, Logs Mongo, Análise ---

export async function treinarIA(req, res) {
  try {
    const { pergunta, resposta, modulo } = req.body;

    if (!pergunta || !resposta) {
      return res.status(400).json({ erro: "pergunta e resposta são obrigatórios" });
    }

    const doc = await treinar(pergunta, resposta, modulo || "geral");

    return res.json({
      ok: true,
      id: doc._id,
      modulo: doc.modulo
    });

  } catch (error) {
    return res.status(500).json({ erro: "Erro ao treinar", detalhe: error.message });
  }
}

export async function consultarLogsMongo(req, res) {
  try {
    const limite = Math.min(parseInt(req.query.limite) || 50, 200);
    const origem = req.query.origem;

    const filtro = origem ? { origem } : {};
    const logs = await Log.find(filtro)
      .sort({ createdAt: -1 })
      .limit(limite)
      .lean();

    return res.json({ total: logs.length, logs });

  } catch (error) {
    return res.json({ total: 0, logs: [], erro: error.message });
  }
}

export async function consultarAnalise(req, res) {
  try {
    const dados = await analisarChamados();
    return res.json(dados);
  } catch (error) {
    return res.status(500).json({ erro: "Erro na análise", detalhe: error.message });
  }
}

export async function listarEntradasKB(req, res) {
  try {
    const entradas = await KB.find({}, { embedding: 0 })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ total: entradas.length, entradas });
  } catch (error) {
    return res.json({ total: 0, entradas: [], erro: error.message });
  }
}
