/**
 * Importa arquivos .md das documentações AxHub, AxTon e AxCross para o MongoDB KB.
 * Cada arquivo vira um ou mais chunks de ~500 chars com embedding gerado pela OpenAI.
 *
 * Uso: node src/scripts/seed-docs.js
 * Uso (dry-run sem OpenAI): node src/scripts/seed-docs.js --dry-run
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { KB } from "../models/kb.model.js";
import { gerarEmbedding } from "../services/embedding.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// scripts/ → src/ → axion-ia-api/ → Axion.Docs/
const ROOT = path.resolve(__dirname, "../../../");
const DRY_RUN = process.argv.includes("--dry-run");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/axion-ia";

/** Mapeamento portal → módulo KB */
const PORTALS = [
  { dir: path.join(ROOT, "AxHub/docs-portal/docs"), modulo: "axhub" },
  { dir: path.join(ROOT, "AxTon/docs-portal/docs"), modulo: "axton" },
  { dir: path.join(ROOT, "AxCross/docs-portal/docs"), modulo: "axcross" },
];

/** Tamanho máximo de cada chunk (em caracteres) */
const CHUNK_SIZE = 500;

// ─────────────────────────────────────────────
// Helpers de parsing
// ─────────────────────────────────────────────

function extrairFrontmatter(conteudo) {
  const match = conteudo.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!match) return { title: null, description: null, resto: conteudo };

  const fm = match[1];
  const title = (fm.match(/^title:\s*(.+)$/m) || [])[1]?.trim() ?? null;
  const description = (fm.match(/^description:\s*(.+)$/m) || [])[1]?.trim() ?? null;
  return { title, description, resto: conteudo.slice(match[0].length) };
}

function limparMarkdown(texto) {
  return texto
    // Remove blocos de código
    .replace(/```[\s\S]*?```/g, "")
    // Remove inline code
    .replace(/`[^`]+`/g, "")
    // Remove imagens
    .replace(/!\[.*?\]\(.*?\)/g, "")
    // Remove links mas mantém texto
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove headers # mas mantém texto
    .replace(/^#+\s*/gm, "")
    // Remove células de tabela e separadores
    .replace(/^\|.*\|$/gm, (linha) =>
      linha.replace(/\|/g, " ").replace(/\s{2,}/g, " ").trim()
    )
    .replace(/^[-|: ]+$/gm, "")
    // Remove bold/italic
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1")
    .replace(/_{1,2}([^_]+)_{1,2}/g, "$1")
    // Remove linhas HTML comentário
    .replace(/<!--[\s\S]*?-->/g, "")
    // Normaliza espaços múltiplos
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function chunkar(texto, titulo, descricao) {
  const linhas = texto.split("\n").filter((l) => l.trim().length > 0);
  const chunks = [];
  let atual = [];
  let tamanhoAtual = 0;

  for (const linha of linhas) {
    if (tamanhoAtual + linha.length > CHUNK_SIZE && atual.length > 0) {
      chunks.push(atual.join("\n").trim());
      atual = [];
      tamanhoAtual = 0;
    }
    atual.push(linha);
    tamanhoAtual += linha.length + 1;
  }

  if (atual.length > 0) {
    chunks.push(atual.join("\n").trim());
  }

  // Adiciona cabeçalho de contexto no primeiro chunk
  if (chunks.length > 0 && titulo) {
    chunks[0] = `${titulo}${descricao ? `: ${descricao}` : ""}\n\n${chunks[0]}`;
  }

  return chunks;
}

// ─────────────────────────────────────────────
// Leitura recursiva de arquivos .md
// ─────────────────────────────────────────────

function listarArquivosMd(dir) {
  const arquivos = [];
  if (!fs.existsSync(dir)) {
    console.warn(`  ⚠  Diretório não encontrado: ${dir}`);
    return arquivos;
  }
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      arquivos.push(...listarArquivosMd(fullPath));
    } else if (item.isFile() && item.name.endsWith(".md")) {
      arquivos.push(fullPath);
    }
  }
  return arquivos;
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────

async function seed() {
  if (!DRY_RUN) {
    await mongoose.connect(MONGO_URI);
    console.log("📦 MongoDB conectado\n");
  } else {
    console.log("🔍 DRY-RUN ativo — nenhum dado será gravado ou chamado à OpenAI\n");
  }

  let totalImportados = 0;
  let totalPulados = 0;
  let totalErros = 0;

  for (const { dir, modulo } of PORTALS) {
    const arquivos = listarArquivosMd(dir);
    console.log(`\n📂 [${modulo.toUpperCase()}] ${arquivos.length} arquivos em ${dir}`);

    for (const arquivo of arquivos) {
      const conteudoBruto = fs.readFileSync(arquivo, "utf-8");
      const { title, description, resto } = extrairFrontmatter(conteudoBruto);
      const textoLimpo = limparMarkdown(resto);

      if (textoLimpo.length < 50) {
        console.log(`  ⏭  Muito curto, pulando: ${path.basename(arquivo)}`);
        continue;
      }

      const chunks = chunkar(textoLimpo, title, description);
      const nomeArquivo = path.relative(dir, arquivo).replace(/\\/g, "/");

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const pergunta = title
          ? `${title}${chunks.length > 1 ? ` (parte ${i + 1})` : ""}`
          : `${nomeArquivo} (parte ${i + 1})`;
        const chaveUnica = `${modulo}::${nomeArquivo}::${i}`;

        if (DRY_RUN) {
          console.log(`  [dry] ${chaveUnica} — ${chunk.length} chars`);
          totalImportados++;
          continue;
        }

        // Verifica duplicata pela chave modulo::arquivo::índice
        const existente = await KB.findOne({ pergunta });
        if (existente) {
          console.log(`  ⏭  ${chaveUnica} — já existe`);
          totalPulados++;
          continue;
        }

        try {
          const textoEmbedding = `${pergunta}\n${chunk}`;
          const embedding = await gerarEmbedding(textoEmbedding);

          await KB.create({ pergunta, resposta: chunk, modulo, embedding });

          totalImportados++;
          process.stdout.write(`  ✅ ${chaveUnica}\r`);
        } catch (err) {
          console.error(`  ❌ ${chaveUnica} — ${err.message}`);
          totalErros++;
        }
      }
    }
  }

  console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Importados : ${totalImportados}`);
  console.log(`⏭  Pulados    : ${totalPulados}`);
  console.log(`❌ Erros      : ${totalErros}`);

  if (!DRY_RUN) {
    await mongoose.disconnect();
  }
  process.exit(0);
}

seed().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
