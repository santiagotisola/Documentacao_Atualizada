import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Espera com backoff exponencial: 500ms → 1s → 2s
async function aguardar(ms) {
  return new Promise(r => setTimeout(r, ms));
}

const MAX_TENTATIVAS = 3;
const DELAY_BASE_MS  = 500;

export async function gerarEmbedding(texto) {
  let ultimoErro;

  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    try {
      const res = await client.embeddings.create({
        model: "text-embedding-3-small",
        input: texto
      });
      return res.data[0].embedding;
    } catch (err) {
      ultimoErro = err;

      // Não retry em erros de autenticação ou input inválido
      const status = err?.status || err?.response?.status;
      if (status === 401 || status === 400) throw err;

      if (tentativa < MAX_TENTATIVAS) {
        const delay = DELAY_BASE_MS * Math.pow(2, tentativa - 1); // 500, 1000, 2000
        console.warn(`⚠️  [embedding] Tentativa ${tentativa}/${MAX_TENTATIVAS} falhou (${err.message}). Retry em ${delay}ms.`);
        await aguardar(delay);
      }
    }
  }

  throw new Error(`Falha ao gerar embedding após ${MAX_TENTATIVAS} tentativas: ${ultimoErro?.message}`);
}
