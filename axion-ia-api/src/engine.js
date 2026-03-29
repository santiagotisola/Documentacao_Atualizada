import OpenAI from "openai";
import dotenv from "dotenv";
import { systemPrompt } from "./prompt.js";
import { classificarMensagem } from "./classifier.js";
import { salvarHistorico, salvarNaoRespondida } from "./logger.js";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function gerarResposta(mensagem) {

  // 1. Classificação
  const contexto = classificarMensagem(mensagem);

  // 2. Resposta via base (mais confiável)
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

    // Log: respondido pelo KB
    salvarHistorico({ mensagem, origem: 'kb', resposta });

    return resposta;
  }

  // 3. IA controlada (fallback)
  // Salva como não respondida pelo KB (para treinamento futuro)
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

  // Log: respondido pela OpenAI
  salvarHistorico({ mensagem, origem: 'openai', resposta });

  return resposta;
}
