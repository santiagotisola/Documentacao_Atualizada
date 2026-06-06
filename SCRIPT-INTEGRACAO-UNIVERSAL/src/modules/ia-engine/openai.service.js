import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL || "https://api.openai.com/v1",
  timeout: 30000,
  maxRetries: 2
});

/**
 * Gera embedding (vetor) de um texto
 */
export async function gerarEmbedding(texto) {
  const modelo = process.env.AI_EMBEDDING_MODEL || "text-embedding-3-small";
  try {
    const resp = await client.embeddings.create({
      model: modelo,
      input: texto.slice(0, 8000) // Limitar tamanho do input
    });
    return resp.data[0].embedding;
  } catch (err) {
    console.error("⚠️ Erro gerando embedding:", err.message);
    return []; // Retorna vazio para não quebrar o fluxo
  }
}

/**
 * Gera resposta via LLM com contexto
 */
export async function gerarRespostaLLM(mensagem, { contextoKB = "", historico = [], systemPrompt = "" } = {}) {
  const modelo = process.env.AI_MODEL || "gpt-4o-mini";
  
  const messages = [
    { role: "system", content: systemPrompt || getDefaultSystemPrompt(contextoKB) },
    ...historico.slice(-10),
    { role: "user", content: mensagem.slice(0, 4000) }
  ];

  try {
    const resp = await client.chat.completions.create({
      model: modelo,
      messages,
      max_tokens: 1500,
      temperature: 0.3
    });
    return resp.choices[0].message.content;
  } catch (err) {
    // Fallback: tentar modelo mais barato se o principal falhar
    if (modelo !== "gpt-4o-mini" && err.status === 429) {
      console.warn("⚠️ Rate limit no modelo principal, usando fallback gpt-4o-mini");
      const resp = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 1000,
        temperature: 0.3
      });
      return resp.choices[0].message.content;
    }
    throw err;
  }
}

function getDefaultSystemPrompt(contexto) {
  const nomeEmpresa = process.env.SERVICE_NAME || "a empresa";
  return `Você é um assistente virtual inteligente de ${nomeEmpresa}. Responda de forma clara, objetiva e profissional.
Se não souber a resposta com certeza, informe que vai encaminhar para um atendente humano.
Não invente informações. Seja conciso.

${contexto ? `Contexto da base de conhecimento:\n${contexto}` : ""}`;
}

/**
 * Calcula similaridade de cosseno entre dois vetores
 */
export function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}
