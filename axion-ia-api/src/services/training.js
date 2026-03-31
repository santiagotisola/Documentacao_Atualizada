import { KB } from "../models/kb.model.js";
import { gerarEmbedding } from "./embedding.js";

export async function treinar(pergunta, resposta, modulo = "geral") {
  const embedding = await gerarEmbedding(pergunta);

  const doc = await KB.create({
    pergunta,
    resposta,
    modulo,
    embedding
  });

  return doc;
}
