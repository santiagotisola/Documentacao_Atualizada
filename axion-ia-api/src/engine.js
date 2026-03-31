import OpenAI from "openai";
import dotenv from "dotenv";
import { systemPrompt } from "./prompt.js";
import { classificarMensagem } from "./classifier.js";
import { salvarHistorico, salvarNaoRespondida } from "./logger.js";
import { buscarRespostaSemantica } from "./services/search.js";
import { Log } from "./models/log.model.js";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function logMongo(dados) {
  try { await Log.create(dados); } catch (_) { /* fallback silencioso */ }
}

export async function gerarResposta(mensagem) {

  // 1. Classificação por keywords (mais rápido, sem custo)
  const contexto = classificarMensagem(mensagem);

  if (contexto) {
    const resposta = `
Assunto: ${contexto.assunto}

Análise:
Foi identificado comportamento relacionado ao cenário informado.

Causa:
${contexto.causa}

Ação:
${contexto.acao}

Status:
${contexto.status}
`;

    salvarHistorico({ mensagem, origem: 'kb', resposta });
    logMongo({ mensagem, resposta, origem: 'kb', score: 1.0 });

    return { resposta, origem: 'kb', score: 1.0 };
  }

  // 2. Busca semântica por embeddings (entende significado)
  try {
    const resultado = await buscarRespostaSemantica(mensagem);

    if (resultado) {
      salvarHistorico({ mensagem, origem: 'embedding', resposta: resultado.resposta });
      logMongo({
        mensagem,
        resposta: resultado.resposta,
        origem: 'embedding',
        score: resultado.score,
        modulo: resultado.modulo
      });

      return {
        resposta: resultado.resposta,
        origem: 'embedding',
        score: resultado.score,
        modulo: resultado.modulo
      };
    }
  } catch (err) {
    console.error("[embedding-search] Erro:", err.message);
  }

  // 3. Fallback IA (OpenAI)
  salvarNaoRespondida(mensagem);

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: mensagem }
    ]
  });

  const resposta = response.choices[0].message.content;

  salvarHistorico({ mensagem, origem: 'openai', resposta });
  logMongo({ mensagem, resposta, origem: 'openai', score: 0.5 });

  return { resposta, origem: 'openai', score: 0.5 };
}
