/**
 * analise-imagem-controller.js
 * Endpoints para análise visual de imagens operacionais (AxHub / AxTon / AxCross / AxionIA).
 *
 * ROTAS:
 *   POST /api/analise-imagem/analisar          → analisa em memória (sem salvar)
 *   POST /api/analise-imagem/salvar-e-analisar → salva em disco + analisa
 *   GET  /api/analise-imagem/listar            → lista imagens salvas (todos sistemas)
 *   GET  /api/analise-imagem/listar/:sistema   → lista imagens de um sistema
 *   DELETE /api/analise-imagem/:sistema/:nome  → remove imagem salva
 *
 * Separação de responsabilidades:
 *   - docs/img/              → screenshots de manuais Docusaurus (nunca passam aqui)
 *   - /api/doc/upload-contexto → OCR de documentos em memória (extrator.js)
 *   - /api/analise-imagem    → imagens operacionais com análise contextual por sistema
 */

import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mime from "mime-types";
import {
  analisarImagem,
  salvarImagemAnalise,
  listarImagensAnalise,
  listarImagensDaPasta,
  compararComPasta,
  compararComPastaLocal,
  removerImagemAnalise,
  validarImagem,
  validarSistema,
  resolverPastaSegura,
  UPLOADS_ANALISE,
  classificarOcupacaoImagens,
  classificarTipoRodaImagens,
  classificarCorCamisaImagens,
  classificarMochilaImagens,
  classificarCalcaImagens,
  gerarCaracteristicasImagem,
  lerPlacaLote,
} from "./services/analise-imagem.js";

// ─── Multer: memória (buffer disponível para análise imediata) ────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter(_req, file, cb) {
    const ext = file.originalname.split(".").pop().toLowerCase();
    const permitidos = ["jpg", "jpeg", "png", "webp", "gif", "bmp"];
    if (permitidos.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de imagem não suportado: .${ext}. Use: ${permitidos.join(", ")}`));
    }
  },
});

/**
 * Middleware multer com tratamento de erro como JSON.
 */
export function uploadImagemMiddleware(req, res, next) {
  upload.single("imagem")(req, res, (err) => {
    if (err) {
      return res.status(422).json({ erro: err.message });
    }
    next();
  });
}

// ─── POST /api/analise-imagem/analisar ────────────────────────────────────────
// Analisa imagem em memória (não persiste em disco).
// Body (multipart): imagem (file), sistema (string), contexto (string, opcional)

export async function analisarSemSalvar(req, res) {
  try {
    validarImagem(req.file);
    const { sistema = "geral", contexto = "" } = req.body;

    const analise = await analisarImagem(
      req.file.buffer,
      req.file.mimetype,
      sistema,
      contexto
    );

    return res.json({
      sucesso: true,
      arquivo: req.file.originalname,
      tamanhoKB: Math.round(req.file.size / 1024),
      salvo: false,
      analise,
    });
  } catch (err) {
    return res.status(422).json({ erro: err.message });
  }
}

// ─── POST /api/analise-imagem/salvar-e-analisar ───────────────────────────────
// Salva a imagem em uploads/analise/{sistema}/ e retorna a análise.
// Body (multipart): imagem (file), sistema (string), contexto (string, opcional)

export async function salvarEAnalisar(req, res) {
  try {
    validarImagem(req.file);
    const { sistema, contexto = "" } = req.body;
    validarSistema(sistema);

    // Salva em disco primeiro
    const infoArquivo = salvarImagemAnalise(
      req.file.buffer,
      req.file.originalname,
      sistema
    );

    // Analisa
    const analise = await analisarImagem(
      req.file.buffer,
      req.file.mimetype,
      sistema,
      contexto
    );

    return res.json({
      sucesso: true,
      arquivo: infoArquivo,
      salvo: true,
      analise,
    });
  } catch (err) {
    return res.status(422).json({ erro: err.message });
  }
}

// ─── GET /api/analise-imagem/listar ──────────────────────────────────────────
// Lista todas as imagens salvas em todos os sistemas.

export function listarTodas(req, res) {
  try {
    const imagens = listarImagensAnalise(null);
    const total = Object.values(imagens).reduce((acc, arr) => acc + arr.length, 0);
    return res.json({ sucesso: true, total, imagens });
  } catch (err) {
    return res.status(400).json({ erro: err.message });
  }
}

// ─── GET /api/analise-imagem/listar/:sistema ─────────────────────────────────
// Lista imagens de um sistema específico.

export function listarPorSistema(req, res) {
  try {
    const { sistema } = req.params;
    const imagens = listarImagensAnalise(sistema);
    return res.json({ sucesso: true, sistema, total: imagens.length, imagens });
  } catch (err) {
    return res.status(400).json({ erro: err.message });
  }
}

// ─── DELETE /api/analise-imagem/:sistema/:nome ───────────────────────────────
// Remove uma imagem salva.

export function removerImagem(req, res) {
  try {
    const { sistema, nome } = req.params;
    const resultado = removerImagemAnalise(sistema, nome);
    return res.json({ sucesso: true, ...resultado });
  } catch (err) {
    return res.status(404).json({ erro: err.message });
  }
}
// ─── GET /api/analise-imagem/listar-pasta ──────────────────────────────────────────────
// Lista imagens de qualquer pasta do projeto (para o comparador).
// Query: ?pasta=axhub  ou  ?pasta=AxHub/docs-portal/docs/img

export function listarPasta(req, res) {
  const { pasta } = req.query;
  if (!pasta) return res.status(400).json({ erro: 'Parâmetro "pasta" obrigatório.' });
  try {
    const { pastaReal, arquivos } = listarImagensDaPasta(pasta);
    return res.json({
      sucesso: true,
      pasta,
      pastaReal,
      total: arquivos.length,
      arquivos: arquivos.map((a) => ({ nome: a.nome, tamanhoKB: a.tamanhoKB })),
    });
  } catch (err) {
    return res.status(400).json({ erro: err.message });
  }
}

// ─── POST /api/analise-imagem/comparar-pasta ────────────────────────────────────────────
// Compara imagem de referência contra todas as imagens de uma pasta.
// Body (multipart): imagem (file), pasta (string), sistema (string),
//                   contexto (string), maxImagens (number, default 20)

export async function compararPasta(req, res) {
  try {
    validarImagem(req.file);
    const { pasta, sistema = "geral", contexto = "", maxImagens = 20 } = req.body;

    if (!pasta) {
      return res.status(400).json({ erro: 'Parâmetro "pasta" obrigatório.' });
    }

    const resultado = await compararComPasta(
      req.file.buffer,
      req.file.mimetype,
      pasta,
      sistema,
      contexto,
      Number(maxImagens)
    );

    return res.json({ sucesso: true, ...resultado });
  } catch (err) {
    return res.status(422).json({ erro: err.message });
  }
}

// ── Comparação local (aHash — sem OpenAI, gratuito) ───────────────────────────
// ─── GET /api/analise-imagem/imagem-externa?p=<base64_caminho> ──────────────
// Serve uma imagem de qualquer caminho absoluto no sistema de arquivos local.
// Segurança: apenas arquivos de imagem, sem directory traversal.

export async function servirImagemExterna(req, res) {
  try {
    const encoded = req.query.p;
    if (!encoded) return res.status(400).json({ erro: 'Parâmetro "p" obrigatório.' });

    let caminho;
    try {
      caminho = Buffer.from(encoded, "base64").toString("utf8");
    } catch {
      return res.status(400).json({ erro: "Parâmetro inválido." });
    }

    // Normalizar separadores e resolver path absoluto
    const normalizado = path.resolve(caminho.replace(/\//g, path.sep));

    // ─── Contenção de path traversal ─────────────────────────────────────────
    // Apenas caminhos dentro de uploads/analise/ ou pastas de imagens conhecidas
    const PASTAS_PERMITIDAS = [
      path.resolve(UPLOADS_ANALISE),
      path.resolve(path.join(path.dirname(fileURLToPath(import.meta.url)), "../../AxHub")),
      path.resolve(path.join(path.dirname(fileURLToPath(import.meta.url)), "../../AxTon")),
      path.resolve(path.join(path.dirname(fileURLToPath(import.meta.url)), "../../AxCross")),
    ];

    const dentroDePassaPasta = PASTAS_PERMITIDAS.some(p => normalizado.startsWith(p + path.sep) || normalizado.startsWith(p));
    if (!dentroDePassaPasta) {
      return res.status(403).json({ erro: "Acesso negado: caminho fora das pastas permitidas." });
    }

    const ext = normalizado.split(".").pop().toLowerCase();
    const permitidos = ["jpg", "jpeg", "png", "webp", "bmp", "gif"];

    if (!permitidos.includes(ext)) {
      return res.status(400).json({ erro: "Tipo de arquivo não permitido." });
    }
    if (!fs.existsSync(normalizado)) {
      return res.status(404).json({ erro: "Arquivo não encontrado." });
    }

    const contentType = mime.lookup(normalizado) || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "private, max-age=3600");
    return res.sendFile(normalizado);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

export async function compararPastaLocal(req, res) {
  try {
    validarImagem(req.file);
    const { pasta, maxImagens = 500, offset = 0, caracteristicas = "" } = req.body;

    if (!pasta) {
      return res.status(400).json({ erro: 'Parâmetro "pasta" obrigatório.' });
    }

    const resultado = await compararComPastaLocal(
      req.file.buffer,
      pasta,
      Number(maxImagens) || 500,
      Number(offset) || 0,
      String(caracteristicas)
    );

    return res.json({ sucesso: true, ...resultado });
  } catch (err) {
    return res.status(422).json({ erro: err.message });
  }
}

// ─── POST /api/analise-imagem/classificar-ocupacao ───────────────────────────
// Detecta se cada imagem tem só o piloto (solo) ou piloto + passageiro (garupa).
// Body JSON: { caminhos: string[] }  — máximo 50 caminhos absolutos por chamada.

// ─── POST /api/analise-imagem/gerar-caracteristicas ─────────────────────────
// Analisa imagem de referência e retorna sugestão de características para filtro.
// Body (multipart): imagem (file)

export async function gerarCaracteristicas(req, res) {
  try {
    validarImagem(req.file);
    const resultado = await gerarCaracteristicasImagem(req.file.buffer, req.file.mimetype);
    return res.json({ sucesso: true, ...resultado });
  } catch (err) {
    return res.status(422).json({ erro: err.message });
  }
}

export async function classificarCorCamisa(req, res) {
  try {
    const { caminhos, referenciaBase64 } = req.body;
    if (!Array.isArray(caminhos) || caminhos.length === 0)
      return res.status(400).json({ erro: "Informe um array de caminhos em 'caminhos'." });
    if (caminhos.length > 50)
      return res.status(400).json({ erro: "Máximo de 50 imagens por chamada." });
    const EXTS = [".jpg", ".jpeg", ".png", ".webp", ".bmp"];
    for (const c of caminhos) {
      if (typeof c !== "string") return res.status(400).json({ erro: "Caminhos devem ser strings." });
      if (!EXTS.includes(path.extname(c).toLowerCase())) return res.status(400).json({ erro: `Extensão inválida: ${path.basename(c)}` });
      if (!fs.existsSync(c)) return res.status(400).json({ erro: `Arquivo não encontrado: ${path.basename(c)}` });
    }
    const resultados = await classificarCorCamisaImagens(caminhos, referenciaBase64 ?? null);
    return res.json({ sucesso: true, resultados });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

export async function classificarRoda(req, res) {
  try {
    const { caminhos, referenciaBase64 } = req.body;

    if (!Array.isArray(caminhos) || caminhos.length === 0) {
      return res.status(400).json({ erro: "Informe um array de caminhos em 'caminhos'." });
    }
    if (caminhos.length > 50) {
      return res.status(400).json({ erro: "Máximo de 50 imagens por chamada." });
    }

    const EXTS = [".jpg", ".jpeg", ".png", ".webp", ".bmp"];
    for (const c of caminhos) {
      if (typeof c !== "string") {
        return res.status(400).json({ erro: "Caminhos devem ser strings." });
      }
      const ext = path.extname(c).toLowerCase();
      if (!EXTS.includes(ext)) {
        return res.status(400).json({ erro: `Extensão inválida: ${path.basename(c)}` });
      }
      if (!fs.existsSync(c)) {
        return res.status(400).json({ erro: `Arquivo não encontrado: ${path.basename(c)}` });
      }
    }

    const resultados = await classificarTipoRodaImagens(caminhos, referenciaBase64 ?? null);
    return res.json({ sucesso: true, resultados });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

export async function classificarMochila(req, res) {
  try {
    const { caminhos, referenciaBase64 } = req.body;
    if (!Array.isArray(caminhos) || caminhos.length === 0)
      return res.status(400).json({ erro: "Informe um array de caminhos em 'caminhos'." });
    if (caminhos.length > 50)
      return res.status(400).json({ erro: "Máximo de 50 imagens por chamada." });
    const EXTS = [".jpg", ".jpeg", ".png", ".webp", ".bmp"];
    for (const c of caminhos) {
      if (typeof c !== "string") return res.status(400).json({ erro: "Caminhos devem ser strings." });
      if (!EXTS.includes(path.extname(c).toLowerCase())) return res.status(400).json({ erro: `Extensão inválida: ${path.basename(c)}` });
      if (!fs.existsSync(c)) return res.status(400).json({ erro: `Arquivo não encontrado: ${path.basename(c)}` });
    }
    const resultados = await classificarMochilaImagens(caminhos, referenciaBase64 ?? null);
    return res.json({ sucesso: true, resultados });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

export async function classificarCalca(req, res) {
  try {
    const { caminhos, referenciaBase64 } = req.body;
    if (!Array.isArray(caminhos) || caminhos.length === 0)
      return res.status(400).json({ erro: "Informe um array de caminhos em 'caminhos'." });
    if (caminhos.length > 50)
      return res.status(400).json({ erro: "Máximo de 50 imagens por chamada." });
    const EXTS = [".jpg", ".jpeg", ".png", ".webp", ".bmp"];
    for (const c of caminhos) {
      if (typeof c !== "string") return res.status(400).json({ erro: "Caminhos devem ser strings." });
      if (!EXTS.includes(path.extname(c).toLowerCase())) return res.status(400).json({ erro: `Extensão inválida: ${path.basename(c)}` });
      if (!fs.existsSync(c)) return res.status(400).json({ erro: `Arquivo não encontrado: ${path.basename(c)}` });
    }
    const resultados = await classificarCalcaImagens(caminhos, referenciaBase64 ?? null);
    return res.json({ sucesso: true, resultados });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

export async function classificarOcupacao(req, res) {
  try {
    const { caminhos, referenciaBase64 } = req.body;

    if (!Array.isArray(caminhos) || caminhos.length === 0) {
      return res.status(400).json({ erro: "Informe um array de caminhos em 'caminhos'." });
    }
    if (caminhos.length > 50) {
      return res.status(400).json({ erro: "Máximo de 50 imagens por chamada." });
    }

    const EXTS = [".jpg", ".jpeg", ".png", ".webp", ".bmp"];
    for (const c of caminhos) {
      if (typeof c !== "string") {
        return res.status(400).json({ erro: "Caminhos devem ser strings." });
      }
      const ext = path.extname(c).toLowerCase();
      if (!EXTS.includes(ext)) {
        return res.status(400).json({ erro: `Extensão inválida: ${path.basename(c)}` });
      }
      if (!fs.existsSync(c)) {
        return res.status(400).json({ erro: `Arquivo não encontrado: ${path.basename(c)}` });
      }
    }

    const resultados = await classificarOcupacaoImagens(caminhos, referenciaBase64 ?? null);
    return res.json({ sucesso: true, resultados });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// ─── POST /api/analise-imagem/ler-placa ──────────────────────────────────────
// Lê placas de motos via GPT-4o + pré-processamento sharp.
// Body JSON: { caminhos: string[], aprimorar?: boolean }

export async function lerPlacas(req, res) {
  try {
    const { caminhos, aprimorar = true } = req.body;
    if (!Array.isArray(caminhos) || caminhos.length === 0)
      return res.status(400).json({ erro: "Informe um array de caminhos em 'caminhos'." });
    if (caminhos.length > 30)
      return res.status(400).json({ erro: "Máximo de 30 imagens por chamada (GPT-4o)." });
    const EXTS = [".jpg", ".jpeg", ".png", ".webp", ".bmp"];
    for (const c of caminhos) {
      if (typeof c !== "string") return res.status(400).json({ erro: "Caminhos devem ser strings." });
      if (!EXTS.includes(path.extname(c).toLowerCase())) return res.status(400).json({ erro: `Extensão inválida: ${path.basename(c)}` });
      if (!fs.existsSync(c)) return res.status(400).json({ erro: `Arquivo não encontrado: ${path.basename(c)}` });
    }
    const resultados = await lerPlacaLote(caminhos, aprimorar !== false);
    return res.json({ sucesso: true, resultados });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}