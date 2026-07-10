/**
 * Script para importar kb.json existente para o MongoDB com embeddings.
 * Uso: node src/scripts/seed-kb.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import { createRequire } from "module";
import { KB } from "../models/kb.model.js";
import { gerarEmbedding } from "../services/embedding.js";

dotenv.config();

const require = createRequire(import.meta.url);
const kb = require("../kb.json");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/axion-ia";

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("📦 MongoDB conectado");

  const entries = Object.entries(kb);
  console.log(`📝 ${entries.length} entradas para importar\n`);

  let importadas = 0;
  let puladas = 0;

  for (const [key, item] of entries) {
    // Verifica se já existe (evita duplicatas em re-runs)
    const existente = await KB.findOne({ pergunta: item.assunto });
    if (existente) {
      console.log(`  ⏭ ${key} — já existe`);
      puladas++;
      continue;
    }

    // Monta texto para embedding: combina keywords + assunto + causa
    const textoEmbedding = [
      item.assunto,
      ...item.keywords,
      item.causa
    ].join(". ");

    // Monta resposta formatada
    const resposta = [
      `Assunto: ${item.assunto}`,
      `Análise: Foi identificado comportamento relacionado ao cenário informado.`,
      `Causa: ${item.causa}`,
      `Ação: ${item.acao}`,
      `Status: ${item.status}`
    ].join("\n");

    try {
      const embedding = await gerarEmbedding(textoEmbedding);

      await KB.create({
        pergunta: item.assunto,
        resposta,
        modulo: key,
        embedding
      });

      importadas++;
      console.log(`  ✅ ${key} — embedding gerado (${embedding.length} dims)`);
    } catch (err) {
      console.error(`  ❌ ${key} — erro: ${err.message}`);
    }
  }

  console.log(`\n✅ Seed concluído: ${importadas} importadas, ${puladas} puladas`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
