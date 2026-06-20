/**
 * analise-imagem.js
 * Serviço de análise visual de imagens operacionais (infrações, pesagens, cruzamentos).
 *
 * ESCOPO: imagens reais dos sistemas AxHub / AxTon / AxCross / AxionIA.
 * Não confundir com extrator.js (OCR de documentos em memória) nem com
 * docs/img/ (screenshots dos manuais Docusaurus — não passam por aqui).
 *
 * Pasta de armazenamento: axion-ia-api/uploads/analise/{sistema}/
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import sharp from "sharp";
import dotenv from "dotenv";
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Pasta raiz de análise (fora de docs/img/) ────────────────────────────────
export const UPLOADS_ANALISE = path.resolve(__dirname, "../../uploads/analise");

// ─── Prompts especializados por sistema ──────────────────────────────────────

const PROMPTS_SISTEMA = {
  axhub: `Você é um analista de imagens de fiscalização de trânsito do sistema AxHub.
Analise esta imagem e identifique:
- Placa do veículo (se visível)
- Tipo de veículo (carro, caminhão, moto, ônibus)
- Velocidade exibida (se aplicável)
- Status da infração (válida, descartada, pendente)
- Qualidade da imagem (boa, ruim, ilegível)
- Anomalias ou problemas visuais detectados
- Equipamento/câmera responsável (se identificável no rodapé)
Retorne um JSON com os campos: placa, tipo_veiculo, velocidade, status_infracao, qualidade_imagem, anomalias, observacoes.`,

  axton: `Você é um analista de imagens do sistema de pesagem veicular AxTon.
Analise esta imagem e identifique:
- Placa do veículo (se visível)
- Tipo/categoria do veículo (eixos visíveis, classificação)
- Peso exibido na balança (se visível)
- Ticket ou número de pesagem (se visível)
- Condições da pesagem (veículo parado corretamente, desvio de balança)
- Anomalias detectadas
Retorne um JSON com os campos: placa, tipo_veiculo, peso_indicado, numero_ticket, condicao_pesagem, anomalias, observacoes.`,

  axcross: `Você é um analista de imagens do sistema de monitoramento por cruzamento de placas AxCross.
Analise esta imagem e identifique:
- Placa do veículo (se visível — principal foco)
- Qualidade da captura da placa (legível, parcial, ilegível)
- Local/câmera de captura (se visível)
- Data/hora exibidos na imagem (se visível)
- Condições de iluminação e visibilidade
- Anomalias ou problemas no equipamento
Retorne um JSON com os campos: placa, qualidade_placa, local_captura, data_hora, condicoes, anomalias, observacoes.`,

  axionia: `Você é um analista do sistema AxionIA.
Analise esta imagem de interface/dashboard e identifique:
- Tipo de tela (chat, helpdesk, kb, dashboard, configurações)
- Problemas visuais ou de usabilidade
- Erros exibidos na interface
- Informações relevantes visíveis
Retorne um JSON com os campos: tipo_tela, problemas_ui, erros_visíveis, informacoes_relevantes, observacoes.`,

  geral: `Analise esta imagem e descreva:
- O que está sendo exibido
- Texto visível
- Elementos relevantes
- Anomalias ou problemas identificados
Retorne um JSON com os campos: descricao, texto_visivel, elementos_relevantes, anomalias, observacoes.`,
};

// ─── Validações ───────────────────────────────────────────────────────────────

const SISTEMAS_VALIDOS = ["axhub", "axton", "axcross", "axionia"];
const EXTS_VALIDAS = ["jpg", "jpeg", "png", "webp", "gif", "bmp"];
const MIME_VALIDOS = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp"];
const MAX_TAMANHO_MB = 20;

export function validarImagem(file) {
  if (!file) throw new Error("Nenhuma imagem enviada.");

  const ext = file.originalname.split(".").pop().toLowerCase();
  if (!EXTS_VALIDAS.includes(ext)) {
    throw new Error(`Extensão não suportada: .${ext}. Use: ${EXTS_VALIDAS.join(", ")}`);
  }
  if (!MIME_VALIDOS.includes(file.mimetype)) {
    throw new Error(`Tipo MIME não suportado: ${file.mimetype}`);
  }
  if (file.size > MAX_TAMANHO_MB * 1024 * 1024) {
    throw new Error(`Imagem muito grande (${Math.round(file.size / 1024 / 1024)}MB). Máximo: ${MAX_TAMANHO_MB}MB`);
  }
}

export function validarSistema(sistema) {
  if (!SISTEMAS_VALIDOS.includes(sistema)) {
    throw new Error(`Sistema inválido: "${sistema}". Use: ${SISTEMAS_VALIDOS.join(", ")}`);
  }
}

// ─── Análise via OpenAI Vision ────────────────────────────────────────────────

export async function analisarImagem(buffer, mimetype, sistema = "geral", contexto = "") {
  if (!process.env.OPENAI_API_KEY) {
    return {
      erro: "OPENAI_API_KEY não configurada.",
      fallback: true,
      sistema,
      timestamp: new Date().toISOString(),
    };
  }

  const prompt = PROMPTS_SISTEMA[sistema] ?? PROMPTS_SISTEMA.geral;
  const promptFinal = contexto
    ? `${prompt}\n\nContexto adicional fornecido: ${contexto}`
    : prompt;

  const ext = mimetype.split("/")[1] || "jpeg";
  const base64 = buffer.toString("base64");
  const dataUrl = `data:${mimetype};base64,${base64}`;

  const resp = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: promptFinal },
          { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
        ],
      },
    ],
    max_tokens: 1000,
    response_format: { type: "json_object" },
  });

  const rawContent = resp.choices[0]?.message?.content ?? "{}";

  let resultado;
  try {
    resultado = JSON.parse(rawContent);
  } catch {
    resultado = { raw: rawContent };
  }

  return {
    sistema,
    modelo: "gpt-4o",
    timestamp: new Date().toISOString(),
    tokens_usados: resp.usage?.total_tokens ?? null,
    resultado,
  };
}

// ─── Salvar imagem em disco (pasta uploads/analise/{sistema}/) ────────────────

export function salvarImagemAnalise(buffer, originalname, sistema) {
  validarSistema(sistema);

  const pastaDestino = path.join(UPLOADS_ANALISE, sistema);

  // Garante que a pasta existe
  if (!fs.existsSync(pastaDestino)) {
    fs.mkdirSync(pastaDestino, { recursive: true });
  }

  // Nome único: timestamp_nome-original
  const ts = Date.now();
  const nomeSeguro = originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
  const nomeArquivo = `${ts}_${nomeSeguro}`;
  const caminhoCompleto = path.join(pastaDestino, nomeArquivo);

  fs.writeFileSync(caminhoCompleto, buffer);

  return {
    nomeArquivo,
    caminho: caminhoCompleto,
    relativo: `uploads/analise/${sistema}/${nomeArquivo}`,
    tamanhoKB: Math.round(buffer.length / 1024),
  };
}

// ─── Listar imagens salvas por sistema ───────────────────────────────────────

export function listarImagensAnalise(sistema) {
  if (sistema && !SISTEMAS_VALIDOS.includes(sistema)) {
    throw new Error(`Sistema inválido: "${sistema}". Use: ${SISTEMAS_VALIDOS.join(", ")}`);
  }

  const pastas = sistema ? [sistema] : SISTEMAS_VALIDOS;
  const resultado = {};

  for (const s of pastas) {
    const pasta = path.join(UPLOADS_ANALISE, s);
    if (!fs.existsSync(pasta)) {
      resultado[s] = [];
      continue;
    }

    const arquivos = fs.readdirSync(pasta)
      .filter((f) => EXTS_VALIDAS.includes(f.split(".").pop().toLowerCase()))
      .map((f) => {
        const stats = fs.statSync(path.join(pasta, f));
        return {
          nome: f,
          sistema: s,
          tamanhoKB: Math.round(stats.size / 1024),
          criadoEm: stats.mtime.toISOString(),
          url: `/uploads/analise/${s}/${f}`,
        };
      })
      .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));

    resultado[s] = arquivos;
  }

  return sistema ? resultado[sistema] : resultado;
}

// ─── Resolver pasta de forma segura (sem path traversal) ─────────────────────
// Aceita:
//   - nome de sistema: "axhub" | "axton" | "axcross" | "axionia"
//   - caminho relativo dentro do projeto (ex: "AxHub/docs-portal/docs/img")
//   - caminho absoluto DESDE QUE dentro da raiz do projeto

const PROJETO_ROOT = path.resolve(__dirname, "../../../"); // axion-ia-api/src → root

export function resolverPastaSegura(pasta) {
  // Se for um dos sistemas gerenciados, resolve direto
  if (SISTEMAS_VALIDOS.includes(pasta)) {
    return path.join(UPLOADS_ANALISE, pasta);
  }

  // Caminho absoluto (ex: C:\Users\...) — aceito diretamente (painel local)
  if (path.isAbsolute(pasta)) {
    const normalizado = path.normalize(pasta);
    // Bloqueia apenas traversal com ".." que altere o caminho
    if (normalizado !== pasta.replace(/\//g, "\\") && normalizado.includes("..")) {
      throw new Error("Caminho inválido: não são permitidos traversal com '..'");
    }
    if (!fs.existsSync(normalizado)) {
      throw new Error(`Pasta não encontrada: ${normalizado}`);
    }
    return normalizado;
  }

  // Caminho relativo — resolve a partir da raiz do projeto
  const candidato = path.resolve(PROJETO_ROOT, pasta);
  const normalizado = path.normalize(candidato);

  // Previne directory traversal em caminhos relativos
  if (!normalizado.startsWith(path.normalize(PROJETO_ROOT))) {
    throw new Error(
      `Caminho relativo fora do projeto não é permitido. Use um caminho absoluto ou relativo à raiz (ex: "AxHub/docs-portal/docs/img").`
    );
  }

  if (!fs.existsSync(normalizado)) {
    throw new Error(`Pasta não encontrada: ${normalizado}`);
  }

  return normalizado;
}

// ─── Listar imagens de uma pasta qualquer (para o comparador) ─────────────────

export function listarImagensDaPasta(caminhoPasta) {
  const pastaReal = resolverPastaSegura(caminhoPasta);

  const arquivos = fs
    .readdirSync(pastaReal)
    .filter((f) => EXTS_VALIDAS.includes(f.split(".").pop().toLowerCase()))
    .map((f) => {
      const fullPath = path.join(pastaReal, f);
      const stats = fs.statSync(fullPath);
      return {
        nome: f,
        caminho: fullPath,
        tamanhoKB: Math.round(stats.size / 1024),
      };
    });

  return { pastaReal, arquivos };
}

// ─── Comparar imagem de referência com todas as imagens de uma pasta ──────────
// Retorna array de resultados com score de similaridade (0–10), ordenado desc.
// maxImagens: limite de imagens processadas (evita custo excessivo de tokens)

export async function compararComPasta(
  refBuffer,
  refMime,
  caminhoPasta,
  sistema = "geral",
  contexto = "",
  maxImagens = 20
) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY não configurada.");
  }

  const { pastaReal, arquivos } = listarImagensDaPasta(caminhoPasta);

  if (arquivos.length === 0) {
    return { pastaReal, totalEncontradas: 0, processadas: 0, resultados: [] };
  }

  // Converte referência para base64 / data URL
  const refBase64  = refBuffer.toString("base64");
  const refDataUrl = `data:${refMime};base64,${refBase64}`;

  // Limita para não explodir a conta de tokens
  const aProcessar = arquivos.slice(0, maxImagens);

  // Processa em paralelo em lotes de 5
  const LOTE = 5;
  const resultados = [];

  for (let i = 0; i < aProcessar.length; i += LOTE) {
    const lote = aProcessar.slice(i, i + LOTE);

    const promessas = lote.map(async (img) => {
      try {
        const imgBuffer  = fs.readFileSync(img.caminho);
        const ext        = img.nome.split(".").pop().toLowerCase();
        const imgMime    = `image/${ext === "jpg" ? "jpeg" : ext}`;
        const imgBase64  = imgBuffer.toString("base64");
        const imgDataUrl = `data:${imgMime};base64,${imgBase64}`;

        const contextoExtra = contexto ? `\nContexto: ${contexto}` : "";

        const resp = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Você está comparando duas imagens no contexto do sistema ${sistema.toUpperCase()}.

A PRIMEIRA imagem é a REFERÊNCIA.
A SEGUNDA imagem é o CANDIDATO a ser comparado.${contextoExtra}

Avalie a similaridade visual e de conteúdo entre as duas imagens e retorne um JSON com:
{
  "similaridade": <número de 0 a 10, onde 10 = idênticas>,
  "placa_referencia": "<placa detectada na referência, ou null>",
  "placa_candidato": "<placa detectada no candidato, ou null>",
  "mesmo_veiculo": <true|false|null — se for possível determinar>,
  "elementos_comuns": ["<elemento comum 1>", "..."],
  "diferencas": ["<diferença 1>", "..."],
  "observacoes": "<observação relevante>"
}`,
                },
                { type: "image_url", image_url: { url: refDataUrl, detail: "low" } },
                { type: "image_url", image_url: { url: imgDataUrl, detail: "low" } },
              ],
            },
          ],
          max_tokens: 400,
          response_format: { type: "json_object" },
        });

        const raw = resp.choices[0]?.message?.content ?? "{}";
        let dados;
        try { dados = JSON.parse(raw); } catch { dados = { raw }; }

        return {
          nome: img.nome,
          tamanhoKB: img.tamanhoKB,
          url: `/uploads/analise/${path.relative(UPLOADS_ANALISE, path.dirname(img.caminho)).replace(/\\/g, "/")}/${img.nome}`,
          caminhoRelativo: path.relative(PROJETO_ROOT, img.caminho).replace(/\\/g, "/"),
          tokens_usados: resp.usage?.total_tokens ?? null,
          ...dados,
        };
      } catch (err) {
        return {
          nome: img.nome,
          tamanhoKB: img.tamanhoKB,
          caminhoRelativo: path.relative(PROJETO_ROOT, img.caminho).replace(/\\/g, "/"),
          similaridade: null,
          erro: err.message,
        };
      }
    });

    const loteResultados = await Promise.all(promessas);
    resultados.push(...loteResultados);
  }

  // Ordena por similaridade decrescente (nulos no fim)
  resultados.sort((a, b) => {
    if (a.similaridade == null) return 1;
    if (b.similaridade == null) return -1;
    return b.similaridade - a.similaridade;
  });

  return {
    pastaReal,
    totalEncontradas: arquivos.length,
    processadas: aProcessar.length,
    resultados,
  };
}

// ─── Remover imagem salva ─────────────────────────────────────────────────────

export function removerImagemAnalise(sistema, nomeArquivo) {
  validarSistema(sistema);

  // Garante que o nome não contenha traversal de path
  const nomeSanitizado = path.basename(nomeArquivo);
  const caminho = path.join(UPLOADS_ANALISE, sistema, nomeSanitizado);

  if (!fs.existsSync(caminho)) {
    throw new Error(`Arquivo não encontrado: ${nomeSanitizado}`);
  }

  fs.unlinkSync(caminho);
  return { removido: nomeSanitizado, sistema };
}

// ── COMPARAÇÃO LOCAL (sem tokens OpenAI) ──────────────────────────────────────

const HASH_SIZE = 16; // 16x16 = 256 bits → bom equilíbrio precisão/velocidade

/**
 * Gera Average Hash (aHash) de um buffer de imagem usando sharp.
 * Redimensiona para HASH_SIZE x HASH_SIZE em escala de cinza,
 * calcula a média dos pixels e retorna um array de bits (0/1).
 */
async function gerarAHash(buffer) {
  const { data } = await sharp(buffer)
    .resize(HASH_SIZE, HASH_SIZE, { fit: "fill" })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Array.from(data);
  const media = pixels.reduce((s, v) => s + v, 0) / pixels.length;
  return pixels.map((v) => (v >= media ? 1 : 0));
}

// Exportações públicas para uso pelo job-queue.js
export const gerarAHashPublico        = gerarAHash;
export const distanciaHammingPublica  = distanciaHamming;
export const hammingParaScorePublico  = hammingParaScore;

/**
 * Distância de Hamming entre dois hashes (arrays de bits).
 * Retorna número de bits diferentes.
 */
function distanciaHamming(h1, h2) {
  let dist = 0;
  for (let i = 0; i < h1.length; i++) {
    if (h1[i] !== h2[i]) dist++;
  }
  return dist;
}

/**
 * Converte distância de Hamming em score 0–10.
 * Hash de 256 bits: distância máxima teórica = 256.
 * Imagens idênticas → 0, completamente diferentes → ~128 (distribuição aleatória).
 * Usamos 80 como limiar de "totalmente diferente" para dar mais resolução.
 */
function hammingParaScore(distancia) {
  const MAX_DIST = HASH_SIZE * HASH_SIZE * 0.35; // ~89 bits
  const score = Math.max(0, 10 - (distancia / MAX_DIST) * 10);
  return Math.round(score * 10) / 10;
}

/**
 * Compara uma imagem de referência com todas as imagens de uma pasta
 * usando Average Hash — completamente local, sem chamadas à API OpenAI.
 *
 * @param {Buffer} refBuffer    Buffer da imagem de referência
 * @param {string} caminhoPasta  Nome do sistema OU caminho relativo dentro do projeto
 * @param {number} maxImagens   Limite de imagens a processar (default 200)
 * @returns {Object} { totalEncontradas, processadas, resultados[] }
 */
export async function compararComPastaLocal(refBuffer, caminhoPasta, maxImagens = 500, offset = 0, caracteristicas = "") {
  const pastaAbsoluta = resolverPastaSegura(caminhoPasta);

  const EXTENSOES_VALIDAS = [".jpg", ".jpeg", ".png", ".webp", ".bmp"];

  const todosArquivos = fs.readdirSync(pastaAbsoluta)
    .filter((f) => EXTENSOES_VALIDAS.includes(path.extname(f).toLowerCase()))
    .sort(); // ordena para paginação estável

  const totalEncontradas = todosArquivos.length;

  // Paginação: pega o slice a partir do offset
  const arquivos = todosArquivos.slice(offset, offset + maxImagens);

  // Gera hash da referência uma vez
  const hashRef = await gerarAHash(refBuffer);

  // Processa todas em paralelo (operação local é leve)
  const resultados = await Promise.all(
    arquivos.map(async (nomeArq) => {
      const caminhoArq = path.join(pastaAbsoluta, nomeArq);
      try {
        const bufArq = fs.readFileSync(caminhoArq);
        const hashArq = await gerarAHash(bufArq);
        const distancia = distanciaHamming(hashRef, hashArq);
        const similaridade = hammingParaScore(distancia);

        // URL relativa para servir a imagem (só funciona em uploads/analise/)
        const relativo = path.relative(
          path.resolve(PROJETO_ROOT, "axion-ia-api", "uploads"),
          caminhoArq
        );
        const url = relativo.startsWith("..") ? null : `/uploads/${relativo.replace(/\\/g, "/")}`;

        // Bônus de score por características no nome do arquivo
        let bonusCaracteristicas = 0;
        let matchCaracteristicas = [];
        if (caracteristicas) {
          const termos = caracteristicas.toLowerCase().split(/[\s,;]+/).filter(Boolean);
          const nomeLower = nomeArq.toLowerCase();
          for (const t of termos) {
            if (nomeLower.includes(t)) {
              bonusCaracteristicas += 0.5;
              matchCaracteristicas.push(t);
            }
          }
        }

        return {
          nome: nomeArq,
          similaridade: Math.min(10, Math.round((similaridade + bonusCaracteristicas) * 10) / 10),
          similaridadeHash: similaridade,
          distanciaHamming: distancia,
          matchCaracteristicas,
          url,
          caminhoAbsoluto: caminhoArq,
          modo: "local",
        };
      } catch (err) {
        return { nome: nomeArq, similaridade: 0, erro: err.message, modo: "local" };
      }
    })
  );

  resultados.sort((a, b) => b.similaridade - a.similaridade);

  return {
    totalEncontradas,
    processadas: arquivos.length,
    offset,
    proximoOffset: offset + arquivos.length,
    temMais: offset + arquivos.length < totalEncontradas,
    pasta: caminhoPasta,
    modo: "local",
    criterio: {
      algoritmo: "aHash (Average Hash)",
      descricao: "Reduz cada imagem para 16×16 pixels em escala de cinza e compara a distribuição de brilho via distância de Hamming (bits diferentes no hash de 256 bits).",
      escala: "0 = completamente diferente · 10 = idêntica",
      limites: { alta: "≥ 7.0", media: "4.0 – 6.9", baixa: "< 4.0" },
    },
    resultados,
  };
}

// ─── Helper: processa array em lotes sequenciais com delay entre lotes ─────────
// Evita esgotar rate-limit da OpenAI (RPM/TPM) ao enviar muitas imagens de vez.
async function processarEmLotes(items, fn, loteSize = 5, delayMs = 400) {
  const resultados = [];
  for (let i = 0; i < items.length; i += loteSize) {
    const lote = items.slice(i, i + loteSize);
    const res = await Promise.all(lote.map(fn));
    resultados.push(...res);
    if (i + loteSize < items.length) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  return resultados;
}

// ─── Classificar ocupação de motocicleta: solo (só piloto) vs. garupa ─────────
// Usa GPT-4o-mini (mais barato) para detecção semântica — aceita até 50 imagens.

export async function classificarOcupacaoImagens(caminhos, referenciaBase64 = null) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY não configurada.");
  }

  const resultados = await processarEmLotes(caminhos, async (caminho) => {
      try {
        const ext = path.extname(caminho).toLowerCase().replace(".", "");
        const buffer = fs.readFileSync(caminho);
        const mimeType = `image/${ext === "jpg" ? "jpeg" : ext}`;
        const base64 = buffer.toString("base64");
        const dataUrl = `data:${mimeType};base64,${base64}`;

        const temReferencia = referenciaBase64 && typeof referenciaBase64 === "string" && referenciaBase64.startsWith("data:image");

        const promptTexto = temReferencia
          ? `Você está analisando imagens de câmera de monitoramento de trânsito — geralmente VISÃO TRASEIRA ou AÉREA da moto.

A PRIMEIRA IMAGEM é a REFERÊNCIA (veículo/pessoa que estou buscando).
A SEGUNDA IMAGEM é a imagem da pasta a ser classificada.

TAREFA: contar quantas pessoas estão NA moto (piloto + passageiro).

COMO IDENTIFICAR GARUPA (2 pessoas) EM CÂMERA TRASEIRA:
- O torso traseiro é MAIS LARGO do que o de uma pessoa só → GARUPA
- Dois pares de ombros sobrepostos (um atrás do outro) → GARUPA
- Duas cabeças/capacetes visíveis → GARUPA
- Quatro pernas visíveis nos lados da moto → GARUPA
- Alguém visivelmente sentado ATRÁS do piloto, mesmo parcialmente visível → GARUPA
- Silhueta mais "alta" do que o esperado para 1 pessoa → pode ser GARUPA
- Ombros muito largos de forma não-proporcional → GARUPA

COMO IDENTIFICAR SOLO (1 pessoa):
- Apenas um conjunto de ombros/torso
- Apenas um capacete
- Largura normal de um piloto

REGRA IMPORTANTE: Na dúvida entre SOLO e GARUPA, prefira "garupa" — é pior filtrar incorretamente do que ter falso positivo.

Use a referência para contextualizar.
Responda APENAS com JSON: {"ocupacao":"solo"} ou {"ocupacao":"garupa"} ou {"ocupacao":"indefinido"}`
          : `Você está analisando uma imagem de câmera de monitoramento de trânsito — geralmente VISÃO TRASEIRA ou AÉREA da moto.

TAREFA: contar quantas pessoas estão NA moto (piloto + passageiro).

COMO IDENTIFICAR GARUPA (2 pessoas) EM CÂMERA TRASEIRA:
- O torso traseiro é MAIS LARGO do que o de uma pessoa só → GARUPA
- Dois pares de ombros sobrepostos (um atrás do outro) → GARUPA
- Duas cabeças/capacetes visíveis → GARUPA
- Quatro pernas visíveis nos lados da moto → GARUPA
- Alguém sentado ATRÁS do piloto, mesmo parcialmente visível → GARUPA
- Silhueta mais "alta" do que o esperado para 1 pessoa → pode ser GARUPA
- Ombros muito largos de forma não-proporcional → GARUPA

COMO IDENTIFICAR SOLO (1 pessoa):
- Apenas um conjunto de ombros/torso
- Apenas um capacete
- Apenas dois membros/pernas visíveis

REGRA IMPORTANTE: Na dúvida entre SOLO e GARUPA, prefira "garupa" — é pior filtrar incorretamente do que ter falso positivo.

Use "indefinido" SOMENTE se não há nenhuma moto/pessoa visível.

Responda APENAS com JSON: {"ocupacao":"solo"} ou {"ocupacao":"garupa"} ou {"ocupacao":"indefinido"}`;

        const content = [
          { type: "text", text: promptTexto },
          ...(temReferencia ? [{ type: "image_url", image_url: { url: referenciaBase64, detail: "low" } }] : []),
          { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
        ];

        const resp = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content }],
          max_tokens: 30,
          response_format: { type: "json_object" },
        });

        const raw = resp.choices[0]?.message?.content ?? '{"ocupacao":"indefinido"}';
        let dados;
        try { dados = JSON.parse(raw); } catch { dados = { ocupacao: "indefinido" }; }

        const validos = ["solo", "garupa", "indefinido"];
        return {
          caminho,
          ocupacao: validos.includes(dados.ocupacao) ? dados.ocupacao : "indefinido",
          tokens: resp.usage?.total_tokens ?? 0,
        };
      } catch (err) {
        return { caminho, ocupacao: "erro", erro: err.message };
      }
  });

  return resultados;
}

// ─── Classificar tipo de roda das motos ────────────────────────────────────────
// Usa GPT-4o-mini para identificar se a moto tem roda de raio ou liga leve.

export async function classificarTipoRodaImagens(caminhos, referenciaBase64 = null) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY não configurada.");
  }

  const resultados = await processarEmLotes(caminhos, async (caminho) => {
      try {
        const ext = path.extname(caminho).toLowerCase().replace(".", "");
        const buffer = fs.readFileSync(caminho);
        const mimeType = `image/${ext === "jpg" ? "jpeg" : ext}`;
        const base64 = buffer.toString("base64");
        const dataUrl = `data:${mimeType};base64,${base64}`;

        const temReferencia = referenciaBase64 && typeof referenciaBase64 === "string" && referenciaBase64.startsWith("data:image");

        const promptTexto = temReferencia
          ? `Você está analisando imagens de câmera de monitoramento de trânsito — geralmente VISÃO TRASEIRA da moto.

A PRIMEIRA IMAGEM é a REFERÊNCIA (moto que estou buscando).
A SEGUNDA IMAGEM é a imagem da pasta a ser classificada.

Sua tarefa: identificar o tipo da RODA TRASEIRA da motocicleta na segunda imagem.

Em câmera traseira a RODA TRASEIRA fica visível abaixo do banco/carenagem. Olhe para ela.

COMO IDENTIFICAR — RODA DE RAIO:
- Raios FINOS e individuais de metal visíveis entre o cubo e o aro
- Aspecto "vazado", dá para ver através da roda
- Comum em motos trail, motocross, utilitárias antigas, CG 150/160, Titan, Fan
- A roda parece uma "teia" ou "roda de bicicleta"

COMO IDENTIFICAR — LIGA LEVE:
- Roda SÓLIDA ou com raios LARGOS e fundidos (3 a 7 raios grossos)
- Não dá para ver "através" da roda facilmente
- Aspecto mais "compacto" e moderno
- Comum em motos esportivas, scooters, PCX, NMax, CB 300, Hornet

CRITÉRIOS:
- "raio": roda traseira com raios finos e individuais visíveis
- "liga_leve": roda traseira sólida ou com raios largos fundidos
- "indefinido": APENAS se a roda traseira não aparece na imagem ou está completamente encoberta

ATENÇÃO: Em câmera traseira a roda traseira quase sempre aparece. Prefira classificar a "indefinido".
Use a referência para contextualizar.
Responda APENAS com JSON: {"tipo_roda":"raio"} ou {"tipo_roda":"liga_leve"} ou {"tipo_roda":"indefinido"}`
          : `Você está analisando uma imagem de câmera de monitoramento de trânsito — geralmente VISÃO TRASEIRA da moto.

Sua tarefa: identificar o tipo da RODA TRASEIRA da motocicleta.

Em câmera traseira a RODA TRASEIRA fica visível abaixo do banco/carenagem. Olhe para ela.

COMO IDENTIFICAR — RODA DE RAIO:
- Raios FINOS e individuais de metal visíveis entre o cubo e o aro
- Aspecto "vazado", dá para ver através da roda
- Comum em motos trail, motocross, utilitárias, CG 150/160, Titan, Fan, Bros
- A roda parece uma "teia" ou "roda de bicicleta"

COMO IDENTIFICAR — LIGA LEVE:
- Roda SÓLIDA ou com raios LARGOS e fundidos (3 a 7 raios grossos)
- Não dá para ver "através" da roda facilmente
- Aspecto mais "compacto" e moderno
- Comum em motos esportivas, scooters, PCX, NMax, CB 300, Hornet, Fazer

CRITÉRIOS:
- "raio": roda traseira com raios finos e individuais visíveis
- "liga_leve": roda traseira sólida ou com raios largos fundidos
- "indefinido": APENAS se a roda traseira não aparece na imagem ou está completamente encoberta/cortada

ATENÇÃO: Em câmera traseira a roda traseira quase sempre é visível na parte inferior da imagem. Analise com cuidado mesmo em imagens de baixa qualidade. "indefinido" é ÚLTIMO RECURSO.
Responda APENAS com JSON: {"tipo_roda":"raio"} ou {"tipo_roda":"liga_leve"} ou {"tipo_roda":"indefinido"}`;

        const content = [
          { type: "text", text: promptTexto },
          ...(temReferencia ? [{ type: "image_url", image_url: { url: referenciaBase64, detail: "low" } }] : []),
          { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
        ];

        const resp = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content }],
          max_tokens: 30,
          response_format: { type: "json_object" },
        });

        const raw = resp.choices[0]?.message?.content ?? '{"tipo_roda":"indefinido"}';
        let dados;
        try { dados = JSON.parse(raw); } catch { dados = { tipo_roda: "indefinido" }; }

        const validos = ["raio", "liga_leve", "indefinido"];
        return {
          caminho,
          tipo_roda: validos.includes(dados.tipo_roda) ? dados.tipo_roda : "indefinido",
          tokens: resp.usage?.total_tokens ?? 0,
        };
      } catch (err) {
        return { caminho, tipo_roda: "erro", erro: err.message };
      }
  });

  return resultados;
}

// ─── Classificar cor da camisa/roupa do piloto ────────────────────────────────
// Usa GPT-4o-mini para identificar a cor da roupa do piloto da moto.

export async function classificarCorCamisaImagens(caminhos, referenciaBase64 = null) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY não configurada.");
  }

  const resultados = await processarEmLotes(caminhos, async (caminho) => {
      try {
        const ext = path.extname(caminho).toLowerCase().replace(".", "");
        const buffer = fs.readFileSync(caminho);
        const mimeType = `image/${ext === "jpg" ? "jpeg" : ext}`;
        const base64 = buffer.toString("base64");
        const dataUrl = `data:${mimeType};base64,${base64}`;

        const temReferencia = referenciaBase64 && typeof referenciaBase64 === "string" && referenciaBase64.startsWith("data:image");

        const promptTexto = temReferencia
          ? `Você está analisando imagens de câmera de monitoramento de trânsito — geralmente VISÃO TRASEIRA da moto.

A PRIMEIRA IMAGEM é a REFERÊNCIA (moto/piloto que estou buscando).
A SEGUNDA IMAGEM é a imagem da pasta a ser classificada.

Sua tarefa: identificar a cor DOMINANTE da roupa visível nas COSTAS do piloto (parte superior: costas, ombros, tronco).

O QUE OBSERVAR (câmera traseira):
- Cor das costas da camisa, camiseta ou jaqueta
- Para entregadores: cor do colete/uniforme/jaqueta de delivery (iFood = vermelho/laranja, Rappi = azul/amarelo, Loggi = azul)
- A cor do colete de entregador conta como cor da roupa
- Se houver mochila/bag cobrindo as costas, observe a cor da roupa nos ombros/laterais

CRITÉRIOS (escolha apenas um):
- "vermelha": vermelho, laranja-avermelhado, coral, vinho
- "marrom": marrom, caramelo, ocre, terracota
- "preta": preto, preto fosco, muito escuro
- "branca": branco, cinza muito claro, bege claro
- "azul": azul (qualquer tom — claro, médio ou escuro)
- "verde": verde (qualquer tom)
- "amarela": amarelo, laranja brilhante
- "outra": outra cor não listada
- "indefinido": APENAS se as costas/ombros do piloto NÃO estão visíveis (ex: imagem completamente escura, moto vista de frente sem mostrar costas, ou qualidade zero)

Use a referência para contextualizar. NÃO use "indefinido" se qualquer cor for visível nas costas da pessoa.
Responda APENAS com JSON: {"cor_camisa":"vermelha"} (ou outra cor da lista)`
          : `Você está analisando uma imagem de câmera de monitoramento de trânsito — geralmente VISÃO TRASEIRA da moto.

Sua tarefa: identificar a cor DOMINANTE da roupa visível nas COSTAS do piloto (parte superior: costas, ombros, tronco).

O QUE OBSERVAR (câmera traseira):
- Cor das costas da camisa, camiseta ou jaqueta
- Para entregadores: cor do colete/uniforme/jaqueta de delivery (iFood = vermelho/laranja, Rappi = azul/amarelo)
- A cor do colete de entregador conta como cor da roupa
- Se houver mochila/bag cobrindo as costas, observe a cor da roupa nos ombros/laterais visíveis

CRITÉRIOS (escolha apenas um):
- "vermelha": vermelho, laranja-avermelhado, coral, vinho
- "marrom": marrom, caramelo, ocre, terracota
- "preta": preto, preto fosco, muito escuro
- "branca": branco, cinza muito claro, bege claro
- "azul": azul (qualquer tom)
- "verde": verde (qualquer tom)
- "amarela": amarelo, laranja brilhante
- "outra": outra cor não listada
- "indefinido": APENAS se as costas/ombros do piloto NÃO estão visíveis (imagem completamente escura, sem pessoa, ou qualidade zero)

ATENÇÃO: NÃO use "indefinido" se qualquer cor for visível nas costas/ombros da pessoa. Sempre classifique se houver pista visual.
Responda APENAS com JSON: {"cor_camisa":"vermelha"} (ou outra cor da lista)`;

        const content = [
          { type: "text", text: promptTexto },
          ...(temReferencia ? [{ type: "image_url", image_url: { url: referenciaBase64, detail: "low" } }] : []),
          { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
        ];

        const resp = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content }],
          max_tokens: 30,
          response_format: { type: "json_object" },
        });

        const raw = resp.choices[0]?.message?.content ?? '{"cor_camisa":"indefinido"}';
        let dados;
        try { dados = JSON.parse(raw); } catch { dados = { cor_camisa: "indefinido" }; }

        const validos = ["vermelha", "marrom", "preta", "branca", "azul", "verde", "amarela", "outra", "indefinido"];
        return {
          caminho,
          cor_camisa: validos.includes(dados.cor_camisa) ? dados.cor_camisa : "indefinido",
          tokens: resp.usage?.total_tokens ?? 0,
        };
      } catch (err) {
        return { caminho, cor_camisa: "erro", erro: err.message };
      }
  });

  return resultados;
}

// ─── Gerar sugestão de características a partir de imagem de referência ────────
// Usa GPT-4o para extrair descritores visuais objetivos para uso como filtro.

export async function gerarCaracteristicasImagem(buffer, mimetype) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY não configurada.");
  }

  const base64  = buffer.toString("base64");
  const dataUrl = `data:${mimetype};base64,${base64}`;

  const resp = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{
      role: "user",
      content: [
        {
          type: "text",
          text: `Analise esta imagem de monitoramento de trânsito e extraia características visuais objetivas para usar como filtro de busca em um sistema de comparação de imagens.

Retorne APENAS um JSON com o formato:
{
  "caracteristicas": "<lista de termos separados por vírgula, ex: moto preta, capacete escuro, piloto solo, camiseta cinza, placa vermelha>",
  "tipo_veiculo": "<moto|carro|caminhao|onibus|outro>",
  "ocupacao": "<solo|garupa|multiplos|indefinido>",
  "cor_principal": "<cor dominante do veículo>",
  "detalhe_placa": "<placa se visível, ou null>",
  "confianca": "<alta|media|baixa — qualidade geral da imagem para identificação>"
}

Seja objetivo. Use termos curtos em português que aparecerão nos nomes de arquivos ou nas características visuais das imagens candidatas.`,
        },
        { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
      ],
    }],
    max_tokens: 300,
    response_format: { type: "json_object" },
  });

  const raw = resp.choices[0]?.message?.content ?? "{}";
  let dados;
  try { dados = JSON.parse(raw); } catch { dados = {}; }

  return {
    caracteristicas: dados.caracteristicas ?? "",
    tipo_veiculo:    dados.tipo_veiculo   ?? "indefinido",
    ocupacao:        dados.ocupacao       ?? "indefinido",
    cor_principal:   dados.cor_principal  ?? null,
    detalhe_placa:   dados.detalhe_placa  ?? null,
    confianca:       dados.confianca      ?? "baixa",
    tokens:          resp.usage?.total_tokens ?? 0,
  };
}

// ─── Classificar presença de mochila ─────────────────────────────────────────
// Usa GPT-4o-mini para identificar se o piloto/passageiro carrega mochila.

export async function classificarMochilaImagens(caminhos, referenciaBase64 = null) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY não configurada.");
  }

  const resultados = await processarEmLotes(caminhos, async (caminho) => {
      try {
        const ext = path.extname(caminho).toLowerCase().replace(".", "");
        const buffer = fs.readFileSync(caminho);
        const mimeType = `image/${ext === "jpg" ? "jpeg" : ext}`;
        const base64 = buffer.toString("base64");
        const dataUrl = `data:${mimeType};base64,${base64}`;

        const temReferencia = referenciaBase64 && typeof referenciaBase64 === "string" && referenciaBase64.startsWith("data:image");

        const promptTexto = temReferencia
          ? `Você está analisando imagens de câmera de monitoramento de trânsito — geralmente VISÃO TRASEIRA ou AÉREA da moto.

A PRIMEIRA IMAGEM é a REFERÊNCIA (moto/piloto que estou buscando).
A SEGUNDA IMAGEM é a imagem da pasta a ser classificada.

TAREFA: detectar se há QUALQUER OBJETO ou VOLUME nas costas do piloto/passageiro ou no bagageiro da moto.

RETORNE "com_mochila" SE QUALQUER UM DESTES ESTIVER PRESENTE:
- Mochila (escolar, esportiva, de trabalho, qualquer tipo)
- Bag térmica de entregador (iFood vermelho, Rappi, Loggi, etc.)
- Baú / caixa plástica no bagageiro traseiro
- Caixa de delivery, cesto, grade, aramado
- Sacola plástica, sacola de supermercado, sacola de compras
- Mala, bolsa, maleta, embrulho, fardo
- Qualquer objeto amarrado, pendurado ou carregado nas costas ou garupa
- Volume que projeta além do contorno natural do corpo do piloto
- Colete com bolsos volumosos nas costas

RETORNE "sem_mochila" APENAS SE:
- O piloto/garupa estão sem NENHUM objeto nas costas ou no bagageiro
- Só há roupa/capacete visíveis — nada sobressaindo

RETORNE "indefinido" SOMENTE SE:
- Nenhuma moto/motocicleta é visível na imagem
- A imagem é completamente escura, borrada ou ilegível

Use a referência para contextualizar o padrão visual.
Responda APENAS com JSON: {"mochila":"com_mochila"} ou {"mochila":"sem_mochila"} ou {"mochila":"indefinido"}`
          : `Você está analisando uma imagem de câmera de monitoramento de trânsito — geralmente VISÃO TRASEIRA ou AÉREA da moto.

TAREFA: detectar se há QUALQUER OBJETO ou VOLUME nas costas do piloto/passageiro ou no bagageiro da moto.

RETORNE "com_mochila" SE QUALQUER UM DESTES ESTIVER PRESENTE:
- Mochila (escolar, esportiva, de trabalho, qualquer tipo)
- Bag térmica de entregador (iFood vermelho, Rappi, Loggi, etc.)
- Baú / caixa plástica no bagageiro traseiro
- Caixa de delivery, cesto, grade, aramado
- Sacola plástica, sacola de supermercado, sacola de compras
- Mala, bolsa, maleta, embrulho, fardo
- Qualquer objeto amarrado, pendurado ou carregado nas costas ou garupa
- Volume que projeta além do contorno natural do corpo do piloto
- Colete com bolsos volumosos nas costas

RETORNE "sem_mochila" APENAS SE:
- O piloto/garupa estão sem NENHUM objeto nas costas ou no bagageiro
- Só há roupa/capacete visíveis — nada sobressaindo

RETORNE "indefinido" SOMENTE SE:
- Nenhuma moto/motocicleta é visível na imagem
- A imagem é completamente escura, borrada ou ilegível

ATENÇÃO: Em câmeras traseiras, volumes nas costas são bem visíveis. Errar para "com_mochila" é melhor do que perder um objeto real.
Responda APENAS com JSON: {"mochila":"com_mochila"} ou {"mochila":"sem_mochila"} ou {"mochila":"indefinido"}`;

        const content = [
          { type: "text", text: promptTexto },
          ...(temReferencia ? [{ type: "image_url", image_url: { url: referenciaBase64, detail: "low" } }] : []),
          { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
        ];

        const resp = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content }],
          max_tokens: 30,
          response_format: { type: "json_object" },
        });

        const raw = resp.choices[0]?.message?.content ?? '{"mochila":"indefinido"}';
        let dados;
        try { dados = JSON.parse(raw); } catch { dados = { mochila: "indefinido" }; }

        const validos = ["com_mochila", "sem_mochila", "indefinido"];
        return {
          caminho,
          mochila: validos.includes(dados.mochila) ? dados.mochila : "indefinido",
          tokens: resp.usage?.total_tokens ?? 0,
        };
      } catch (err) {
        return { caminho, mochila: "erro", erro: err.message };
      }
  });

  return resultados;
}

// ─── Classificar cor da calça do piloto ───────────────────────────────────────
// Usa GPT-4o-mini para identificar se a calça/roupa das pernas é escura ou clara.

export async function classificarCalcaImagens(caminhos, referenciaBase64 = null) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY não configurada.");
  }

  const resultados = await processarEmLotes(caminhos, async (caminho) => {
      try {
        const ext = path.extname(caminho).toLowerCase().replace(".", "");
        const buffer = fs.readFileSync(caminho);
        const mimeType = `image/${ext === "jpg" ? "jpeg" : ext}`;
        const base64 = buffer.toString("base64");
        const dataUrl = `data:${mimeType};base64,${base64}`;

        const temReferencia = referenciaBase64 && typeof referenciaBase64 === "string" && referenciaBase64.startsWith("data:image");

        const promptTexto = temReferencia
          ? `Você está analisando imagens de câmera de monitoramento de trânsito.

A PRIMEIRA IMAGEM é a REFERÊNCIA (moto/piloto que estou buscando).
A SEGUNDA IMAGEM é a imagem da pasta a ser classificada.

Sua tarefa: identificar a cor/tom da calça ou roupa das pernas do piloto da motocicleta na segunda imagem.

CRITÉRIOS:
- "escura": calça preta, azul escuro (jeans escuro, marinho), cinza escuro ou qualquer tom escuro
- "clara": calça branca, bege, cáqui, jeans claro, cinza claro ou qualquer tom claro/médio-claro
- "indefinido": pernas não visíveis (moto cobre), muito distante/embaçado, ou genuinamente impossível

Use a referência para contextualizar o padrão visual.
Responda APENAS com JSON: {"calca":"escura"} ou {"calca":"clara"} ou {"calca":"indefinido"}`
          : `Você está analisando uma imagem de câmera de monitoramento de trânsito. Identifique a cor da calça/roupa das pernas do piloto da motocicleta.

CRITÉRIOS:
- "escura": calça preta, azul escuro (jeans escuro, marinho), cinza escuro ou qualquer tom escuro
- "clara": calça branca, bege, cáqui, jeans claro, cinza claro ou qualquer tom claro/médio-claro
- "indefinido": pernas não visíveis (moto cobre as pernas), muito distante/embaçado, ou genuinamente impossível

Mesmo em imagens distantes, tente identificar o contraste claro/escuro nas pernas. Use "indefinido" apenas se genuinamente impossível.
Responda APENAS com JSON: {"calca":"escura"} ou {"calca":"clara"} ou {"calca":"indefinido"}`;

        const content = [
          { type: "text", text: promptTexto },
          ...(temReferencia ? [{ type: "image_url", image_url: { url: referenciaBase64, detail: "low" } }] : []),
          { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
        ];

        const resp = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content }],
          max_tokens: 30,
          response_format: { type: "json_object" },
        });

        const raw = resp.choices[0]?.message?.content ?? '{"calca":"indefinido"}';
        let dados;
        try { dados = JSON.parse(raw); } catch { dados = { calca: "indefinido" }; }

        const validos = ["escura", "clara", "indefinido"];
        return {
          caminho,
          calca: validos.includes(dados.calca) ? dados.calca : "indefinido",
          tokens: resp.usage?.total_tokens ?? 0,
        };
      } catch (err) {
        return { caminho, calca: "erro", erro: err.message };
      }
  });

  return resultados;
}

// ─── Ler placa de imagens via OCR especializado (câmera de vigilância) ────────
// Usa GPT-4o com detail:"high" + pré-processamento sharp para máxima leitura.
// Lotes de 3 com delay 1200ms — GPT-4o é mais lento/caro que mini.

export async function lerPlacaLote(caminhos, aprimorar = true) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY não configurada.");
  }

  const resultados = await processarEmLotes(caminhos, async (caminho) => {
    try {
      const ext = path.extname(caminho).toLowerCase().replace(".", "");
      const mimeType = `image/${ext === "jpg" ? "jpeg" : ext}`;

      let dataUrl;
      if (aprimorar) {
        // Upscale + sharpen + normalize para melhorar leitura de placa pequena/desfocada
        const aprimorado = await sharp(caminho)
          .resize({ width: 2048, height: 2048, fit: "inside", withoutEnlargement: false, kernel: "cubic" })
          .sharpen({ sigma: 2.5, m1: 0, m2: 4 })
          .normalize()
          .jpeg({ quality: 95 })
          .toBuffer();
        dataUrl = `data:image/jpeg;base64,${aprimorado.toString("base64")}`;
      } else {
        const buffer = fs.readFileSync(caminho);
        dataUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
      }

      const resp = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{
          role: "user",
          content: [
            {
              type: "text",
              text: `Você é um sistema especializado em leitura de placas veiculares em câmeras de vigilância de trânsito.

TAREFA: Localize e leia a placa da motocicleta nesta imagem.

FORMATOS DE PLACA BRASILEIRA:
- Padrão antigo: 3 letras + hífen + 4 números (ex: ABC-1234)
- Padrão Mercosul: 3 letras + 1 número + 1 letra + 2 números (ex: ABC1D23)

ORIENTAÇÕES:
- A placa traseira fica na parte inferior/traseira da moto, abaixo do banco e do banco traseiro
- A câmera pode estar acima (vista aérea) ou lateral/traseira — analise toda a imagem
- Câmeras de vigilância têm baixa resolução — tente ler mesmo se estiver levemente desfocada
- Se conseguiu ler parte da placa, coloque "?" nos caracteres incertos (ex: "A?C-1?34")
- Analise TODOS os veículos visíveis se houver mais de um, foque na moto
- NÃO invente placa — se não conseguir ler nada, retorne null

RESPONDA APENAS com JSON:
{
  "placa": "<placa lida com formato ABC-1234 ou ABC1D23, ou null se não encontrada>",
  "parcial": <true se leitura incompleta com '?', false se completa>,
  "confianca": "<alta|media|baixa>",
  "posicao_placa": "<ex: placa traseira visível, canto inferior esquerdo>",
  "observacoes": "<ex: ângulo 45°, desfoque leve, placa coberta parcialmente>"
}`,
            },
            { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
          ],
        }],
        max_tokens: 200,
        response_format: { type: "json_object" },
      });

      const raw = resp.choices[0]?.message?.content ?? "{}";
      let dados;
      try { dados = JSON.parse(raw); } catch { dados = {}; }

      return {
        caminho,
        placa:         dados.placa         ?? null,
        parcial:       dados.parcial        ?? false,
        confianca:     dados.confianca      ?? "baixa",
        posicao_placa: dados.posicao_placa  ?? "nao_localizada",
        observacoes:   dados.observacoes    ?? "",
        tokens:        resp.usage?.total_tokens ?? 0,
      };
    } catch (err) {
      return { caminho, placa: "erro", erro: err.message };
    }
  }, 3, 1200); // lotes de 3 — GPT-4o é mais pesado que mini

  return resultados;
}
