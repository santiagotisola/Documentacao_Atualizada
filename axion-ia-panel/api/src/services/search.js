import { KB } from "../models/kb.model.js";
import { gerarEmbedding } from "./embedding.js";
import cosineSimilarity from "cosine-similarity";

const THRESHOLD = 0.80;

// Limite máximo de registros carregados por busca.
// Evita load completo da coleção em memória quando o KB é grande.
// Prioriza os mais recentes (maior probabilidade de relevância).
const MAX_REGISTROS = 500;

export async function buscarRespostaSemantica(pergunta, opcoes = {}) {
  const { modulo } = opcoes;

  const embeddingPergunta = await gerarEmbedding(pergunta);

  // Filtrar por módulo quando informado — reduz drasticamente o espaço de busca
  const filtro = modulo ? { modulo } : {};

  const registros = await KB
    .find(filtro, { pergunta: 1, resposta: 1, modulo: 1, embedding: 1 })
    .sort({ createdAt: -1 })
    .limit(MAX_REGISTROS)
    .lean();

  if (registros.length === 0) return null;

  let melhor = null;
  let scoreMax = 0;

  for (const item of registros) {
    const score = cosineSimilarity(embeddingPergunta, item.embedding);

    if (score > scoreMax) {
      scoreMax = score;
      melhor = item;
    }
  }

  if (scoreMax >= THRESHOLD) {
    return {
      resposta: melhor.resposta,
      perguntaOriginal: melhor.pergunta,
      modulo: melhor.modulo,
      score: scoreMax
    };
  }

  return null;
}
