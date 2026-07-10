/**
 * STACK GRATUITA — Substituições de serviços pagos por open-source
 * 
 * CUSTO ATUAL (Estimado com serviços pagos):
 * ├─ OpenAI API:        R$ 500-2.000/mês
 * ├─ Pinecone (vector): R$ 70/mês (plano pago)
 * ├─ AWS/GCP:           R$ 300-800/mês
 * ├─ MongoDB Atlas:     R$ 57/mês (M10)
 * └─ TOTAL:             R$ 927-2.927/mês
 *
 * CUSTO DEPOIS (Stack Free):
 * ├─ Ollama (LLM local): R$ 0 (roda no servidor próprio)
 * ├─ ChromaDB (vector):  R$ 0 (open-source, auto-hospedado)
 * ├─ VPS Hostinger:      R$ 80/mês (já usado no CondoSync)
 * ├─ MongoDB Community:  R$ 0 (self-hosted na VPS)
 * └─ TOTAL:              R$ 80/mês (-97% custo)
 */

// ============================================================================
// 1️⃣  LLM LOCAL — Substituir OpenAI por Ollama (open-source, grátis)
// ============================================================================

// ANTES (pago):
// import OpenAI from "openai";
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// DEPOIS (grátis):
import axios from "axios";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

/**
 * Gera texto com modelo local via Ollama
 * Modelos recomendados:
 *   - llama3.2       (3B — rápido, leve, bom para análises)
 *   - gemma3:12b     (12B — melhor qualidade, precisa de 8GB RAM)
 *   - mistral:7b     (7B — ótimo para extração estruturada)
 *   - deepseek-r1:8b (8B — excelente raciocínio)
 */
export async function gerarTextoLocal({ prompt, modelo = "llama3.2", temperatura = 0.3 }) {
  const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
    model: modelo,
    prompt,
    stream: false,
    options: { temperature: temperatura }
  });
  return response.data.response;
}

/**
 * Gera embeddings locais via Ollama
 * Modelo recomendado: nomic-embed-text (melhor custo-benefício)
 */
export async function gerarEmbeddingLocal(texto) {
  const response = await axios.post(`${OLLAMA_URL}/api/embeddings`, {
    model: "nomic-embed-text",
    prompt: texto
  });
  return response.data.embedding;
}

/**
 * OCR com modelo de visão local (gratuito)
 * Usa: llava:13b ou moondream
 */
export async function ocrLocalComVisao(imagemBase64, prompt = "Extraia todo o texto desta imagem. Preserve a estrutura e formatação.") {
  const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
    model: "llava:13b",
    prompt,
    images: [imagemBase64],
    stream: false,
  });
  return response.data.response;
}

// ============================================================================
// 2️⃣  VECTOR DATABASE — Substituir Pinecone por ChromaDB (grátis)
// ============================================================================

const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";

/**
 * Salvar embedding no ChromaDB (self-hosted)
 */
export async function salvarEmbeddingChroma({ colecao, id, embedding, metadados, documento }) {
  await axios.post(`${CHROMA_URL}/api/v1/collections/${colecao}/add`, {
    ids: [id],
    embeddings: [embedding],
    metadatas: [metadados],
    documents: [documento],
  });
}

/**
 * Buscar documentos similares no ChromaDB
 */
export async function buscarSimilaresChroma({ colecao, embedding, limite = 5 }) {
  const response = await axios.post(`${CHROMA_URL}/api/v1/collections/${colecao}/query`, {
    query_embeddings: [embedding],
    n_results: limite,
  });
  return response.data;
}

/**
 * Criar coleção no ChromaDB
 */
export async function criarColecaoChroma(nome) {
  try {
    await axios.post(`${CHROMA_URL}/api/v1/collections`, { name: nome });
  } catch {
    // Coleção já existe — ignorar
  }
}

// ============================================================================
// 3️⃣  PDF OCR SEM CUSTO — Substituir GPT-4o Vision por Tesseract + Llava
// ============================================================================

import { createWorker } from "tesseract.js"; // 100% gratuito, client-side OCR

/**
 * OCR de imagem com Tesseract.js (totalmente grátis, sem API)
 * Suporte: Português, Inglês, Espanhol (e mais)
 */
export async function ocrTesseract(imagemBuffer) {
  const worker = await createWorker("por+eng"); // Português + Inglês
  const { data: { text } } = await worker.recognize(imagemBuffer);
  await worker.terminate();
  return text;
}

/**
 * Pipeline completo: PDF → Imagens → Tesseract OCR → Texto
 * Usa: pdf2pic (grátis) + tesseract.js (grátis)
 */
export async function ocrPDFGratis(pdfBuffer) {
  const pdfParse = (await import("pdf-parse")).default;

  // Tentar extração nativa primeiro
  try {
    const resultado = await pdfParse(pdfBuffer);
    if (resultado.text.trim().length > 100) {
      return { texto: resultado.text, metodo: "pdf-parse", custo: "R$ 0" };
    }
  } catch {}

  // Fallback: Tesseract.js (PDF escaneado)
  // Para converter PDF → imagem, usar pdf2pic ou poppler
  // Neste exemplo, assumimos que a imagem já foi convertida
  const texto = await ocrTesseract(pdfBuffer);
  return { texto, metodo: "tesseract.js", custo: "R$ 0" };
}

// ============================================================================
// 4️⃣  ANÁLISE DE EDITAL GRÁTIS — Ollama + RAG local
// ============================================================================

/**
 * Analisar conformidade de edital com LLM local (grátis)
 * Substitui: OpenAI gpt-4o (R$ 0.03/1k tokens)
 */
export async function analisarEditalGratis({ textoEdital, produto, criterios }) {
  const prompt = `
Você é um especialista em licitações públicas brasileiras.

EDITAL:
${textoEdital.substring(0, 8000)}

PRODUTO SENDO AVALIADO: ${produto}

CRITÉRIOS DE CONFORMIDADE:
${criterios.join("\n")}

TAREFA:
Avalie se o produto atende cada critério do edital.
Para cada critério, responda: ATENDE / PARCIALMENTE / NÃO ATENDE + justificativa.

Responda em formato JSON:
{
  "veredicto_geral": "APTO / PARCIALMENTE APTO / INAPTO",
  "percentual_conformidade": numero de 0 a 100,
  "criterios": [
    {
      "criterio": "descrição",
      "status": "ATENDE / PARCIALMENTE / NÃO ATENDE",
      "justificativa": "explicação"
    }
  ],
  "recomendacoes": ["lista de melhorias sugeridas"]
}
`;

  const resposta = await gerarTextoLocal({
    prompt,
    modelo: "llama3.2", // Ou gemma3:12b para melhor qualidade
    temperatura: 0.1,    // Baixa temperatura para respostas precisas
  });

  // Parsear JSON
  try {
    const jsonMatch = resposta.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {}

  return { raw: resposta, erro: "Falha ao parsear JSON" };
}

// ============================================================================
// 5️⃣  BUSCA SEMÂNTICA GRATUITA — ChromaDB + nomic-embed-text
// ============================================================================

/**
 * Indexar edital no vector store local (grátis)
 */
export async function indexarEditalGratis({ id, titulo, conteudo, metadados }) {
  // Gerar embedding localmente (sem custo)
  const embedding = await gerarEmbeddingLocal(conteudo);

  // Salvar no ChromaDB
  await salvarEmbeddingChroma({
    colecao: "editais",
    id: id.toString(),
    embedding,
    metadados: { titulo, ...metadados },
    documento: conteudo.substring(0, 5000),
  });
}

/**
 * Buscar editais similares por semântica (grátis)
 */
export async function buscarEditaisSimilaresGratis(consulta) {
  const embedding = await gerarEmbeddingLocal(consulta);
  return buscarSimilaresChroma({
    colecao: "editais",
    embedding,
    limite: 5,
  });
}

// ============================================================================
// 6️⃣  GERAÇÃO DE PROPOSTA TÉCNICA GRÁTIS — Template + Ollama
// ============================================================================

/**
 * Gerar proposta técnica automaticamente (sem custo)
 */
export async function gerarPropostaTecnicaGratis({ edital, produto, empresa }) {
  const prompt = `
Você é um especialista em elaboração de propostas técnicas para licitações públicas.

EDITAL: ${edital.titulo}
REQUISITOS: ${edital.requisitos?.join(", ")}

PRODUTO: ${produto.nome}
EMPRESA: ${empresa.nome}

Gere uma proposta técnica profissional em português incluindo:
1. Apresentação da Empresa
2. Solução Proposta
3. Especificações Técnicas
4. Cronograma de Implantação
5. Suporte e Garantias
6. Diferenciais Competitivos
7. Conformidade com Requisitos do Edital

Seja detalhado, profissional e objetivo.
`;

  return gerarTextoLocal({
    prompt,
    modelo: "gemma3:12b", // Modelo maior para qualidade na proposta
    temperatura: 0.4,
  });
}
