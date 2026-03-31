import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function gerarEmbedding(texto) {
  const res = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: texto
  });

  return res.data[0].embedding;
}
