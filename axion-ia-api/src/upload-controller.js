/**
 * upload-controller.js
 * Endpoint para upload de arquivo e extração de texto para contexto da geração de docs.
 * Usa multer (memória) + extrator.js. Arquivo não é persistido em disco.
 */

import multer from "multer";
import { extrairTexto } from "./services/extrator.js";

// Multer em memória — arquivo não toca o disco
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter(_req, file, cb) {
    const permitidos = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "text/plain",
    ];
    const ext = file.originalname.split(".").pop().toLowerCase();
    const extsPermitidas = ["pdf", "docx", "doc", "xlsx", "xls", "csv", "txt", "md"];

    if (permitidos.includes(file.mimetype) || extsPermitidas.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de arquivo não permitido: ${file.originalname}`));
    }
  },
});

// Middleware multer exportado para ser usado na rota
export const uploadMiddleware = upload.single("arquivo");

// POST /api/doc/upload-contexto
export async function uploadContexto(req, res) {
  if (!req.file) {
    return res.status(400).json({ erro: "Nenhum arquivo enviado. Use o campo 'arquivo'." });
  }

  try {
    const texto = await extrairTexto(req.file.buffer, req.file.mimetype, req.file.originalname);
    const palavras = texto.split(/\s+/).filter(Boolean).length;

    return res.json({
      sucesso: true,
      nomeArquivo: req.file.originalname,
      tamanho: req.file.size,
      palavrasExtraidas: palavras,
      caracteres: texto.length,
      texto,
    });
  } catch (err) {
    return res.status(422).json({ erro: err.message });
  }
}
