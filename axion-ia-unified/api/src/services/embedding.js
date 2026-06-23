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

// ─── Circuit breaker para quota 429 ──────────────────────────────────────────
// Quando a quota está esgotada, não adianta fazer 3 retries a cada request.
// O breaker desliga as tentativas por COOLDOWN_MS e emite apenas 1 log.
let quotaExhausted = false;
let quotaCooldownUntil = 0;
const COOLDOWN_MS = 5 * 60 * 1000; // 5 min
let quotaLogEmitted = false;

export async function gerarEmbedding(texto) {
  // Circuit breaker: se quota esgotada, falha rápido sem retry
  if (quotaExhausted && Date.now() < quotaCooldownUntil) {
    throw new Error("OpenAI quota esgotada (circuit breaker ativo)");
  }
  if (quotaExhausted && Date.now() >= quotaCooldownUntil) {
    quotaExhausted = false;
    quotaLogEmitted = false;
  }

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

      const status = err?.status || err?.response?.status;

      // Não retry em erros de autenticação ou input inválido
      if (status === 401 || status === 400) throw err;

      // Quota esgotada: ativar circuit breaker
      if (status === 429) {
        quotaExhausted = true;
        quotaCooldownUntil = Date.now() + COOLDOWN_MS;
        if (!quotaLogEmitted) {
          console.warn(`⚠️  [embedding] Quota OpenAI esgotada (429). Circuit breaker ativo por ${COOLDOWN_MS / 60000}min. Próximos requests falharão rápido.`);
          quotaLogEmitted = true;
        }
        throw new Error(`Quota OpenAI esgotada (429): ${err.message}`);
      }

      if (tentativa < MAX_TENTATIVAS) {
        const delay = DELAY_BASE_MS * Math.pow(2, tentativa - 1); // 500, 1000, 2000
        console.warn(`⚠️  [embedding] Tentativa ${tentativa}/${MAX_TENTATIVAS} falhou (${err.message}). Retry em ${delay}ms.`);
        await aguardar(delay);
      }
    }
  }

  throw new Error(`Falha ao gerar embedding após ${MAX_TENTATIVAS} tentativas: ${ultimoErro?.message}`);
}
