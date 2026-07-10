/**
 * leitura-controller.js — Agente AxionIA de Leitura Estratégica
 *
 * Converte texto, PDF ou documento em conhecimento estruturado aplicando
 * o método 80/20 (Pareto): extrai apenas os 20% mais relevantes.
 *
 * ROTAS:
 *  POST /api/leitura/analisar     → analisa texto puro (body JSON)
 *  POST /api/leitura/upload       → analisa arquivo (PDF, DOCX, XLSX, TXT)
 *
 * OUTPUT padrão:
 *  {
 *    resumo_estrategico,
 *    insights_chave,
 *    acoes_praticas,
 *    modelo_mental,
 *    nivel_confianca,
 *    tipo_leitura,
 *    tokens_processados
 *  }
 */

import multer from "multer";
import { z } from "zod";
import OpenAI from "openai";
import { extrairTexto } from "./services/extrator.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Multer — upload em memória ───────────────────────────────────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter(_req, file, cb) {
    const exts = ["pdf", "docx", "doc", "xlsx", "xls", "csv", "txt", "md"];
    const ext = file.originalname.split(".").pop().toLowerCase();
    if (exts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo não suportado: .${ext}. Use: ${exts.join(", ")}`));
    }
  }
});

export function uploadLeituraMiddleware(req, res, next) {
  upload.single("arquivo")(req, res, (err) => {
    if (err) return res.status(422).json({ erro: err.message });
    next();
  });
}

// ─── Schemas de validação ─────────────────────────────────────────────────────

const TIPOS_LEITURA = ["rapida", "profunda", "tecnica", "executiva"];
const NIVEIS_DETALHE = ["baixo", "medio", "alto"];

const schemaAnalisar = z.object({
  texto:            z.string().min(50, "Texto muito curto — mínimo 50 caracteres").max(80000, "Texto muito longo — máximo 80.000 caracteres"),
  tipo_leitura:     z.enum(["rapida", "profunda", "tecnica", "executiva"]).default("profunda"),
  objetivo_usuario: z.string().max(500).optional(),
  nivel_detalhe:    z.enum(["baixo", "medio", "alto"]).default("medio")
});

// ─── Montagem do prompt por tipo de leitura ───────────────────────────────────

function buildSystemPrompt(tipo, objetivo, nivel) {
  const instrucoesTipo = {
    rapida:    "Foque apenas nos pontos mais críticos. Seja extremamente conciso. Máximo 5 insights.",
    profunda:  "Analise em profundidade. Extraia nuances e conexões entre ideias. Até 10 insights.",
    tecnica:   "Foque em dados, metodologias, evidências e implementações técnicas. Seja preciso.",
    executiva: "Extraia apenas decisões e impactos de negócio. Elimine detalhes operacionais."
  };

  const instrucaoNivel = {
    baixo:  "Respostas ultra-curtas. 1-2 linhas por campo.",
    medio:  "Respostas balanceadas. 2-4 linhas por campo.",
    alto:   "Respostas detalhadas. Até 6 linhas por campo com exemplos quando necessário."
  };

  return `Você é o agente AxionIA de Leitura Estratégica.
Sua função é extrair os 20% mais relevantes de qualquer conteúdo (princípio de Pareto) e transformar em conhecimento acionável.

TIPO DE ANÁLISE: ${tipo.toUpperCase()} — ${instrucoesTipo[tipo]}
NÍVEL DE DETALHE: ${nivel.toUpperCase()} — ${instrucaoNivel[nivel]}
${objetivo ? `\nOBJETIVO DO USUÁRIO: ${objetivo}` : ""}

REGRAS OBRIGATÓRIAS:
- NUNCA repetir texto original desnecessariamente
- NUNCA ser vago ou genérico
- SEMPRE priorizar aplicabilidade prática
- Se o conteúdo for fraco ou vazio, sinalizar com nivel_confianca < 40
- Eliminar redundâncias e informações irrelevantes
- modelo_mental deve ser uma frase-fórmula tipo "X = A + B + C"

Retorne SOMENTE um JSON válido com EXATAMENTE esta estrutura:
{
  "resumo_estrategico": "síntese clara em até 10 linhas",
  "insights_chave": ["insight 1", "insight 2", "..."],
  "acoes_praticas": ["ação aplicável 1", "ação aplicável 2", "..."],
  "modelo_mental": "framework simplificado em uma frase",
  "nivel_confianca": 0,
  "qualidade_conteudo": "alta | media | baixa",
  "advertencias": ["aviso se houver problema com o conteúdo"]
}`;
}

// ─── Chunking — divide texto longo em blocos processáveis ────────────────────

function chunkTexto(texto, maxChars = 12000) {
  if (texto.length <= maxChars) return [texto];
  const chunks = [];
  let i = 0;
  while (i < texto.length) {
    // Tentar cortar em parágrafo
    let fim = Math.min(i + maxChars, texto.length);
    const ultimoParag = texto.lastIndexOf("\n\n", fim);
    if (ultimoParag > i + maxChars * 0.5) fim = ultimoParag;
    chunks.push(texto.slice(i, fim).trim());
    i = fim;
  }
  return chunks;
}

// ─── Análise principal (motor compartilhado) ─────────────────────────────────

async function executarAnalise(texto, { tipo_leitura, objetivo_usuario, nivel_detalhe }) {
  const chunks = chunkTexto(texto);
  const resultados = [];

  for (const chunk of chunks) {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.15,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt(tipo_leitura, objetivo_usuario, nivel_detalhe) },
        { role: "user",   content: `Analise o seguinte conteúdo:\n\n${chunk}` }
      ]
    });

    try {
      resultados.push(JSON.parse(response.choices[0].message.content));
    } catch {
      resultados.push({ resumo_estrategico: response.choices[0].message.content, insights_chave: [], acoes_praticas: [], modelo_mental: "", nivel_confianca: 30 });
    }
  }

  // Map-reduce: consolidar múltiplos chunks em resultado único
  if (resultados.length === 1) return resultados[0];

  const consolidado = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.1,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Você é um consolidador de análises. Receba ${resultados.length} análises parciais do mesmo documento e consolide em UMA análise final coerente, eliminando duplicidades. Retorne SOMENTE JSON com: resumo_estrategico, insights_chave, acoes_praticas, modelo_mental, nivel_confianca, qualidade_conteudo, advertencias.`
      },
      {
        role: "user",
        content: `Análises parciais:\n${JSON.stringify(resultados, null, 2)}`
      }
    ]
  });

  try {
    return JSON.parse(consolidado.choices[0].message.content);
  } catch {
    // Fallback: retornar o primeiro resultado
    return resultados[0];
  }
}

// ─── POST /api/leitura/analisar ───────────────────────────────────────────────

export async function analisarTexto(req, res) {
  const parse = schemaAnalisar.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ erro: parse.error.errors[0].message });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ erro: "OPENAI_API_KEY não configurada." });
  }

  const { texto, tipo_leitura, objetivo_usuario, nivel_detalhe } = parse.data;

  try {
    const analise = await executarAnalise(texto, { tipo_leitura, objetivo_usuario, nivel_detalhe });

    return res.json({
      ...analise,
      tipo_leitura,
      nivel_detalhe,
      objetivo_usuario: objetivo_usuario || null,
      caracteres_processados: texto.length,
      chunks_processados: chunkTexto(texto).length,
      analisado_em: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// ─── POST /api/leitura/upload ─────────────────────────────────────────────────

export async function analisarArquivo(req, res) {
  if (!req.file) {
    return res.status(400).json({ erro: "Envie um arquivo no campo 'arquivo'." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ erro: "OPENAI_API_KEY não configurada." });
  }

  const tipo_leitura     = TIPOS_LEITURA.includes(req.body?.tipo_leitura)  ? req.body.tipo_leitura  : "profunda";
  const nivel_detalhe    = NIVEIS_DETALHE.includes(req.body?.nivel_detalhe) ? req.body.nivel_detalhe : "medio";
  const objetivo_usuario = req.body?.objetivo_usuario || null;

  try {
    // Extrair texto do arquivo via extrator.js (suporta PDF, DOCX, XLSX, TXT)
    const texto = await extrairTexto(req.file.buffer, req.file.mimetype, req.file.originalname);

    if (!texto || texto.trim().length < 50) {
      return res.status(422).json({
        erro: "Não foi possível extrair texto suficiente do arquivo.",
        dica: "Verifique se o arquivo não está protegido por senha, vazio ou corrompido."
      });
    }

    const analise = await executarAnalise(texto, { tipo_leitura, objetivo_usuario, nivel_detalhe });

    return res.json({
      ...analise,
      arquivo: req.file.originalname,
      tamanho_bytes: req.file.size,
      tipo_leitura,
      nivel_detalhe,
      objetivo_usuario,
      caracteres_extraidos: texto.length,
      chunks_processados: chunkTexto(texto).length,
      analisado_em: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}
