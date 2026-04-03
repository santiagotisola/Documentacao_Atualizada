/**
 * extrator.js
 * Extrai texto de arquivos PDF, DOCX e XLSX para uso como contexto na geração de docs.
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);

/**
 * Extrai texto de um buffer conforme o tipo de arquivo.
 * @param {Buffer} buffer  - conteúdo do arquivo
 * @param {string} mimetype - mime type do arquivo
 * @param {string} originalname - nome original do arquivo
 * @returns {Promise<string>} texto extraído
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
        // Limita a 200 linhas por planilha para não estourar o contexto da IA
        const primeiras = data.split("\n").slice(0, 200).join("\n");
        linhas.push(primeiras);
      }
    }

    return limpar(linhas.join("\n\n"));
  }

  // ─── Texto puro ───────────────────────────────────────────────
  if (mimetype.startsWith("text/") || ext === "txt" || ext === "md") {
    return limpar(buffer.toString("utf8"));
  }

  // ─── Imagens ─────────────────────────────────────────────────
  const extsImagem = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"];
  if (mimetype.startsWith("image/") || extsImagem.includes(ext)) {
    const tamanhoKB = Math.round(buffer.length / 1024);
    return `[Imagem anexada: ${originalname} (${tamanhoKB} KB) — arquivo visual; utilize o campo "Contexto adicional" para descrever o conteúdo desta imagem para a IA.]`;
  }

  throw new Error(`Tipo de arquivo não suportado: ${mimetype} (${ext}). Use PDF, DOCX, XLSX, CSV, TXT ou imagens (PNG, JPG, etc).`);
}

function limpar(texto) {
  return texto
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")  // máximo 3 linhas em branco consecutivas
    .replace(/[ \t]{10,}/g, "   ") // colapsa espaços excessivos
    .trim()
    .slice(0, 12000); // limite de segurança para o contexto da IA (~3000 tokens)
}
