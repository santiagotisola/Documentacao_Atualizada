import OpenAI from "openai";
import { systemPrompt } from "./prompt.js";
import { classificarMensagem } from "./classifier.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "SUA_API_KEY_AQUI"
});

export async function gerarResposta(mensagem) {

  // 1. Classificação
  const contexto = classificarMensagem(mensagem);

  // 2. Se encontrou na base (RESPOSTA INTELIGENTE)
  if (contexto) {
    return `
Assunto: ${contexto.assunto}

Análise:
Foi identificado comportamento relacionado ao cenário descrito.

Causa:
${contexto.causa}

Ação:
${contexto.acao}

Status:
${contexto.status}
`;
  }

  // 3. Se NÃO encontrou (usa IA com controle)
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: mensagem }
    ]
  });

  return response.choices[0].message.content;
}
