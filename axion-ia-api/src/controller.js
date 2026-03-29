import { gerarResposta } from "./engine.js";
import { obterHistorico, obterNaoRespondidas, obterEstatisticas } from "./logger.js";

export async function processarMensagem(req, res) {
  try {
    const { mensagem } = req.body;

    if (!mensagem) {
      return res.status(400).json({
        erro: "Mensagem não informada"
      });
    }

    const resposta = await gerarResposta(mensagem);

    return res.json({
      sucesso: true,
      resposta
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
