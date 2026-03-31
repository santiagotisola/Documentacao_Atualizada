import { KB } from "../models/kb.model.js";
import { gerarEmbedding } from "./embedding.js";
import cosineSimilarity from "cosine-similarity";

const THRESHOLD = 0.80;

export async function buscarRespostaSemantica(pergunta) {
  const embeddingPergunta = await gerarEmbedding(pergunta);

  const registros = await KB.find({}, { pergunta: 1, resposta: 1, modulo: 1, embedding: 1 }).lean();

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
