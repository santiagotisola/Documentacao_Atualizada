/**
 * extrator.js
 * Extrai texto de arquivos PDF, DOCX, XLSX, TXT e IMAGENS (via OCR com OpenAI Vision).
 */

import { createRequire } from "module";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const require = createRequire(import.meta.url);
const openai  = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Extrai texto de um buffer conforme o tipo de arquivo.
 * Imagens são transcritas via OCR (OpenAI Vision). Se não houver chave OpenAI,
 * extrai metadados básicos como fallback.
 * @param {Buffer} buffer
 * @param {string} mimetype
 * @param {string} originalname
 * @returns {Promise<string>}
 */
export async function extrairTexto(buffer, mimetype, originalname) {
  const ext = originalname.split(".").pop().toLowerCase();

  // ─── PDF ─────────────────────────────────────────────────────
  if (mimetype === "application/pdf" || ext === "pdf") {
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    return limpar(data.text);
  }

  // ─── DOCX / DOC ──────────────────────────────────────────────
  if (
    mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimetype === "application/msword" ||
    ext === "docx" || ext === "doc"
  ) {
    const mammoth = require("mammoth");
    const result  = await mammoth.extractRawText({ buffer });
    return limpar(result.value);
  }

  // ─── XLSX / XLS / CSV ────────────────────────────────────────
  if (
    mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mimetype === "application/vnd.ms-excel" ||
    mimetype === "text/csv" ||
    ext === "xlsx" || ext === "xls" || ext === "csv"
  ) {
    const XLSX = require("xlsx");
    const wb   = XLSX.read(buffer, { type: "buffer" });
    const linhas = [];
    for (const sheetName of wb.SheetNames) {
      const ws   = wb.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_csv(ws);
      if (data.trim()) {
        linhas.push(`=== Planilha: ${sheetName} ===`);
        linhas.push(data.split("\n").slice(0, 200).join("\n"));
      }
    }
    return limpar(linhas.join("\n\n"));
  }

  // ─── Texto puro ───────────────────────────────────────────────
  if (mimetype.startsWith("text/") || ext === "txt" || ext === "md") {
    return limpar(buffer.toString("utf8"));
  }

  // ─── Imagens — OCR via OpenAI Vision ────────────────────────
  const extsImagem = ["png", "jpg", "jpeg", "gif", "webp", "bmp"];
  if (mimetype.startsWith("image/") || extsImagem.includes(ext)) {
    return await transcreverImagem(buffer, mimetype, originalname, ext);
  }

  // ─── SVG (texto) ─────────────────────────────────────────────
  if (ext === "svg") {
    return limpar(buffer.toString("utf8"));
  }

  throw new Error(`Tipo de arquivo não suportado: ${mimetype} (${ext}). Use PDF, DOCX, XLSX, CSV, TXT, PNG, JPG, JPEG, WEBP ou GIF.`);
}

// ─── OCR via OpenAI Vision ────────────────────────────────────

async function transcreverImagem(buffer, mimetype, originalname, ext) {
  const tamanhoKB = Math.round(buffer.length / 1024);

  // Sem chave OpenAI: retorna aviso útil
  if (!process.env.OPENAI_API_KEY) {
    return `[Imagem: ${originalname} (${tamanhoKB} KB) — sem chave OPENAI_API_KEY configurada para transcrição automática. Configure OPENAI_API_KEY no .env para habilitar OCR.]`;
  }

  try {
    // Converte para base64
    const mimeReal = mimetype.startsWith("image/") ? mimetype : `image/${ext}`;
    const base64   = buffer.toString("base64");
    const dataUrl  = `data:${mimeReal};base64,${base64}`;

    const resp = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Você é um sistema de OCR e análise de documentos. Transcreva COMPLETAMENTE todo o texto visível nesta imagem, preservando a estrutura (cláusulas, artigos, numerações, tabelas, listas).

Se for um documento/contrato/edital: extraia TODOS os requisitos, cláusulas, obrigações e especificações técnicas.
Se for uma planilha ou tabela: transcreva linha por linha.
Se for um diagrama/fluxograma: descreva as etapas e fluxos.
Se for uma foto de documento físico: transcreva o texto mesmo que parcialmente legível.

Retorne apenas o texto transcrito, sem comentários adicionais.`,
            },
            {
              type: "image_url",
              image_url: { url: dataUrl, detail: "high" },
            },
          ],
        },
      ],
      max_tokens: 4000,
    });

    const transcricao = resp.choices[0]?.message?.content || "";
    if (!transcricao.trim()) {
      return `[Imagem: ${originalname} — nenhum texto identificado na imagem.]`;
    }
    return limpar(`[Transcrição OCR — ${originalname} (${tamanhoKB} KB)]\n\n${transcricao}`);

  } catch (err) {
    // Fallback se Vision falhar (ex: imagem muito grande, formato não suportado)
    console.error("[extrator] OCR falhou:", err.message);
    return `[Imagem: ${originalname} (${tamanhoKB} KB) — falha na transcrição automática: ${err.message}. Descreva o conteúdo manualmente no campo "Conteúdo do Documento".]`;
  }
}

// ─── helper ──────────────────────────────────────────────────────
function limpar(texto) {
  return texto
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .replace(/[ \t]{10,}/g, "   ")
    .trim()
    .slice(0, 16000); // aumentado para acomodar transcrições longas de imagens
}
