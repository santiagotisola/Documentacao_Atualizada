/**
 * ia-adapter.js — Adaptador de IA (Free vs Paid)
 * 
 * Permite mudar entre OpenAI (pago) e Ollama (grátis) via variável de ambiente:
 * IA_MODE=free   → Usa Ollama local (R$ 0)
 * IA_MODE=paid   → Usa OpenAI (R$ 0.01-0.03/req)
 * IA_MODE=hybrid → Usa Ollama para análises + OpenAI apenas para OCR visual
 */

import OpenAI from "openai";
import axios from "axios";

const IA_MODE = process.env.IA_MODE || "hybrid";
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// ─── MAPA DE MODELOS ──────────────────────────────────────────────────────────
const MODELOS = {
  free: {
    analise:     "llama3.2",      // Análise de textos de editais
    embedding:   "nomic-embed-text", // Embeddings semânticos
    ocr_visao:   "llava:13b",     // OCR em imagens/PDFs escaneados
    proposta:    "gemma3:12b",    // Geração de propostas técnicas
    resumo:      "mistral:7b",    // Resumos rápidos
    raciocinio:  "deepseek-r1:8b" // Análises complexas
  },
  paid: {
    analise:    "gpt-4o-mini",   // Mais barato, boa qualidade
    embedding:  "text-embedding-3-small", // Embeddings OpenAI
    ocr_visao:  "gpt-4o",        // Melhor para visão
    proposta:   "gpt-4o",        // Melhor qualidade para propostas
    resumo:     "gpt-4o-mini",
    raciocinio: "gpt-4o"
  }
};

// ─── FUNÇÃO PRINCIPAL DE COMPLETAR TEXTO ─────────────────────────────────────

export async function completar({ prompt, tipo = "analise", temperatura = 0.3, maxTokens = 2000 }) {
  const modo = IA_MODE === "hybrid" ? "free" : IA_MODE;
  
  if (modo === "free" || !openai) {
    return completarOllama({ prompt, modelo: MODELOS.free[tipo], temperatura });
  }
  return completarOpenAI({ prompt, modelo: MODELOS.paid[tipo], temperatura, maxTokens });
}

// ─── OLLAMA (GRÁTIS) ──────────────────────────────────────────────────────────

async function completarOllama({ prompt, modelo, temperatura }) {
  const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
    model: modelo,
    prompt,
    stream: false,
    options: { temperature: temperatura }
  });
  return response.data.response;
}

// ─── OPENAI (PAGO) ────────────────────────────────────────────────────────────

async function completarOpenAI({ prompt, modelo, temperatura, maxTokens }) {
  const response = await openai.chat.completions.create({
    model: modelo,
    messages: [{ role: "user", content: prompt }],
    temperature: temperatura,
    max_tokens: maxTokens
  });
  return response.choices[0].message.content;
}

// ─── EMBEDDINGS ───────────────────────────────────────────────────────────────

export async function gerarEmbedding(texto) {
  const modo = IA_MODE === "hybrid" ? "free" : IA_MODE;

  if (modo === "free" || !openai) {
    const res = await axios.post(`${OLLAMA_URL}/api/embeddings`, {
      model: MODELOS.free.embedding,
      prompt: texto
    });
    return res.data.embedding;
  }

  const res = await openai.embeddings.create({
    model: MODELOS.paid.embedding,
    input: texto
  });
  return res.data[0].embedding;
}

// ─── OCR COM VISÃO ────────────────────────────────────────────────────────────

export async function ocr({ imagemBase64, mimeType = "image/jpeg" }) {
  // Em modo hybrid: usa Ollama para OCR visual (llava)
  // Fallback para OpenAI apenas se llava não estiver disponível
  
  if (IA_MODE === "paid" && openai) {
    return ocrOpenAI({ imagemBase64, mimeType });
  }
  
  try {
    return await ocrOllama(imagemBase64);
  } catch {
    // Fallback para OpenAI se Ollama falhar e houver chave
    if (openai) return ocrOpenAI({ imagemBase64, mimeType });
    throw new Error("OCR indisponível: Ollama offline e sem chave OpenAI");
  }
}

async function ocrOllama(imagemBase64) {
  const res = await axios.post(`${OLLAMA_URL}/api/generate`, {
    model: MODELOS.free.ocr_visao,
    prompt: "Extraia todo o texto desta imagem preservando a estrutura. Retorne apenas o texto.",
    images: [imagemBase64],
    stream: false
  });
  return res.data.response;
}

async function ocrOpenAI({ imagemBase64, mimeType }) {
  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{
      role: "user",
      content: [
        { type: "text", text: "Extraia todo o texto desta imagem preservando a estrutura." },
        { type: "image_url", image_url: { url: `data:${mimeType};base64,${imagemBase64}` } }
      ]
    }],
    max_tokens: 4000
  });
  return res.choices[0].message.content;
}

// ─── STATUS DOS MODELOS ───────────────────────────────────────────────────────

export async function statusModelos() {
  const status = { modo: IA_MODE, modelos_disponiveis: [], openai_ativo: !!openai };

  try {
    const res = await axios.get(`${OLLAMA_URL}/api/tags`);
    status.modelos_disponiveis = res.data.models?.map(m => m.name) || [];
    status.ollama_ativo = true;
  } catch {
    status.ollama_ativo = false;
  }

  return status;
}
