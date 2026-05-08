/**
 * Importa histórico de chamados fechados do Jitbit para o MongoDB KB.
 * Filtra apenas tickets com resposta técnica real e gera embeddings.
 *
 * Uso: node src/scripts/seed-jitbit.js
 * Uso (dry-run): node src/scripts/seed-jitbit.js --dry-run
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import { KB } from "../models/kb.model.js";
import { gerarEmbedding } from "../services/embedding.js";
import { buscarTickets, buscarComentarios } from "../jitbit.js";

dotenv.config();

const DRY_RUN = process.argv.includes("--dry-run");
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/axion-ia";

/** Máximo de tickets a buscar por rodada */
const TICKETS_POR_BATCH = 300;

/** Tamanho mínimo aceitável para assunto e resposta */
const MIN_ASSUNTO = 10;
const MIN_RESPOSTA = 30;

/**
 * Frases genéricas demais que não ensinam nada à IA.
 * Comentários que contenham qualquer uma delas são descartados.
 */
const FRASES_IGNORADAS = [
  "verificando",
  "em análise",
  "aguardando",
  "em andamento",
  "obrigado",
  "pode fechar",
  "encerrando",
  "fechando",
  "ok, obrigado",
  "resolvido, obrigado",
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Remove tags HTML de uma string */
function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Verifica se o texto é genérico demais */
function ehRespostaGenérica(texto) {
  const lower = texto.toLowerCase();
  return FRASES_IGNORADAS.some((frase) => lower.includes(frase));
}

/**
 * Infere o módulo KB com base no nome da categoria Jitbit.
 * Se não reconhecer, retorna "jitbit".
 */
function inferirModulo(categoria) {
  if (!categoria) return "jitbit";
  const lower = categoria.toLowerCase();
  if (lower.includes("axhub") || lower.includes("bhtr") || lower.includes("der")) return "axhub";
  if (lower.includes("axton") || lower.includes("pesag") || lower.includes("balança")) return "axton";
  if (lower.includes("axcross") || lower.includes("monitoramento") || lower.includes("cruzamento")) return "axcross";
  return "jitbit";
}

/**
 * Escolhe o melhor comentário técnico de uma lista.
 * Prioridade: técnicos (não é o usuário do ticket), mais longo, não genérico.
 */
function escolherMelhorComentario(comentarios, userId) {
  // Filtra comentários de técnicos (userId diferente do criador do ticket)
  const deTecnico = comentarios.filter(
    (c) => c.UserID !== userId && !ehRespostaGenérica(stripHtml(c.Body))
  );

  if (deTecnico.length === 0) return null;

  // Escolhe o mais longo (geralmente mais completo)
  return deTecnico.sort((a, b) => {
    const lenA = (a.Body || "").length;
    const lenB = (b.Body || "").length;
    return lenB - lenA;
  })[0];
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

  // Busca tickets fechados (statusId=3 = Closed no Jitbit)
  console.log(`🌐 Buscando últimos ${TICKETS_POR_BATCH} tickets fechados no Jitbit...`);
  let tickets;
  try {
    tickets = await buscarTickets({ mode: "all", statusId: 3, count: TICKETS_POR_BATCH });
  } catch (err) {
    console.error("❌ Erro ao buscar tickets:", err.message);
    process.exit(1);
  }

  console.log(`📋 ${tickets.length} tickets encontrados\n`);

  let totalImportados = 0;
  let totalPulados = 0;
  let totalSemResposta = 0;
  let totalErros = 0;

  for (const ticket of tickets) {
    const assunto = (ticket.Subject || "").trim();

    // Filtra assuntos muito curtos
    if (assunto.length < MIN_ASSUNTO) {
      totalPulados++;
      continue;
    }

    // Chave única baseada no ID do ticket
    const chaveUnica = `jitbit::ticket::${ticket.IssueID}`;

    if (!DRY_RUN) {
      const existente = await KB.findOne({ pergunta: { $regex: `\\[#${ticket.IssueID}\\]` } });
      if (existente) {
        process.stdout.write(`  ⏭  #${ticket.IssueID} já existe\r`);
        totalPulados++;
        continue;
      }
    }

    // Busca comentários do ticket
    let comentarios;
    try {
      comentarios = await buscarComentarios(ticket.IssueID);
    } catch (err) {
      console.error(`  ❌ Erro ao buscar comentários do ticket #${ticket.IssueID}: ${err.message}`);
      totalErros++;
      continue;
    }

    if (!comentarios || comentarios.length === 0) {
      totalSemResposta++;
      continue;
    }

    const melhorComentario = escolherMelhorComentario(comentarios, ticket.UserID);
    if (!melhorComentario) {
      totalSemResposta++;
      continue;
    }

    const respostaLimpa = stripHtml(melhorComentario.Body);
    if (respostaLimpa.length < MIN_RESPOSTA) {
      totalSemResposta++;
      continue;
    }

    // Monta pergunta (assunto + descrição do ticket se disponível)
    const descricaoTicket = ticket.Body ? `\n${stripHtml(ticket.Body)}` : "";
    const pergunta = `[#${ticket.IssueID}] ${assunto}`;
    const resposta = respostaLimpa;
    const modulo = inferirModulo(ticket.CategoryName);

    if (DRY_RUN) {
      console.log(`  [dry] #${ticket.IssueID} [${modulo}] — "${assunto.slice(0, 60)}"`);
      console.log(`         Resposta: "${resposta.slice(0, 80)}..."`);
      totalImportados++;
      continue;
    }

    try {
      const textoEmbedding = `${assunto}${descricaoTicket}\n${resposta}`;
      const embedding = await gerarEmbedding(textoEmbedding);

      await KB.create({ pergunta, resposta, modulo, embedding });

      totalImportados++;
      process.stdout.write(`  ✅ #${ticket.IssueID} [${modulo}] importado\r`);
    } catch (err) {
      console.error(`  ❌ #${ticket.IssueID} — ${err.message}`);
      totalErros++;
    }
  }

  console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Importados      : ${totalImportados}`);
  console.log(`⏭  Pulados         : ${totalPulados}`);
  console.log(`💬 Sem resp. técnica: ${totalSemResposta}`);
  console.log(`❌ Erros           : ${totalErros}`);

  if (!DRY_RUN) {
    await mongoose.disconnect();
  }
  process.exit(0);
}

seed().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
