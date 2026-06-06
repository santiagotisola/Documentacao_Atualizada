import { KB } from "./models/kb.model.js";
import { Log } from "./models/log.model.js";
import { gerarEmbedding, gerarRespostaLLM, cosineSimilarity } from "./openai.service.js";

// Cache de sessões (em memória)
const sessoes = new Map();

/**
 * ENGINE PRINCIPAL — 3 camadas de processamento:
 * 1. Keywords (gratuito, instantâneo)
 * 2. Embeddings (custo mínimo, ~200ms)
 * 3. LLM (custo maior, ~2s)
 */
export async function gerarResposta(mensagem, { sessionId, modulo } = {}) {
  const inicio = Date.now();

  try {
    // === CAMADA 1: Keywords ===
    const respostaKB = await buscarPorKeywords(mensagem, modulo);
    if (respostaKB) {
      await registrarLog(mensagem, respostaKB.resposta, "kb", 1.0, modulo, sessionId, Date.now() - inicio);
      return { resposta: respostaKB.resposta, origem: "kb", score: 1.0, tempo_ms: Date.now() - inicio };
    }

    // === CAMADA 2: Busca Semântica ===
    const respostaSem = await buscarSemantica(mensagem, modulo);
    if (respostaSem && respostaSem.score >= 0.80) {
      await registrarLog(mensagem, respostaSem.resposta, "semantica", respostaSem.score, modulo, sessionId, Date.now() - inicio);
      return { resposta: respostaSem.resposta, origem: "semantica", score: respostaSem.score, tempo_ms: Date.now() - inicio };
    }

    // === CAMADA 3: LLM ===
    const historico = obterHistoricoSessao(sessionId);
    const contexto = respostaSem ? `Resposta parcial encontrada (score ${respostaSem.score.toFixed(2)}):\n${respostaSem.resposta}` : "";
    
    const respostaLLM = await gerarRespostaLLM(mensagem, { contextoKB: contexto, historico });
    
    // Salvar no histórico da sessão
    salvarHistoricoSessao(sessionId, mensagem, respostaLLM);
    
    await registrarLog(mensagem, respostaLLM, "llm", respostaSem?.score || 0, modulo, sessionId, Date.now() - inicio);
    return { resposta: respostaLLM, origem: "llm", score: respostaSem?.score || 0, tempo_ms: Date.now() - inicio };

  } catch (err) {
    console.error("❌ Engine erro:", err.message);
    await registrarLog(mensagem, err.message, "erro", 0, modulo, sessionId, Date.now() - inicio);
    return { resposta: "Desculpe, ocorreu um erro ao processar sua mensagem. Vou encaminhar para um atendente.", origem: "erro", score: 0 };
  }
}

/**
 * Camada 1: Busca por keywords na KB
 */
async function buscarPorKeywords(mensagem, modulo) {
  const termos = mensagem.toLowerCase().trim();
  const filtro = { ativo: true };
  if (modulo) filtro.modulo = modulo;

  const entradas = await KB.find(filtro).lean();
  
  for (const entrada of entradas) {
    const keywords = entrada.pergunta.toLowerCase().split("|").map(k => k.trim());
    for (const kw of keywords) {
      if (termos.includes(kw) || kw.includes(termos)) {
        return entrada;
      }
    }
  }
  return null;
}

/**
 * Camada 2: Busca semântica por embeddings
 */
async function buscarSemantica(mensagem, modulo) {
  const embedding = await gerarEmbedding(mensagem);
  
  const filtro = { ativo: true, embedding: { $exists: true, $ne: [] } };
  if (modulo) filtro.modulo = modulo;

  const entradas = await KB.find(filtro).lean();
  
  let melhor = null;
  let scoreMax = 0;

  for (const entrada of entradas) {
    if (!entrada.embedding?.length) continue;
    const score = cosineSimilarity(embedding, entrada.embedding);
    if (score > scoreMax) {
      scoreMax = score;
      melhor = entrada;
    }
  }

  if (melhor && scoreMax >= 0.60) {
    return { resposta: melhor.resposta, score: scoreMax, modulo: melhor.modulo };
  }
  return null;
}

/**
 * Treinar KB com nova entrada (gera embedding automaticamente)
 */
export async function treinar({ pergunta, resposta, modulo = "geral", tags = [] }) {
  const embedding = await gerarEmbedding(pergunta);
  
  const entrada = await KB.create({
    pergunta,
    resposta,
    modulo,
    tags,
    embedding
  });

  return entrada;
}

/**
 * Gerenciamento de histórico de sessão (em memória)
 */
function obterHistoricoSessao(sessionId) {
  if (!sessionId) return [];
  return sessoes.get(sessionId) || [];
}

function salvarHistoricoSessao(sessionId, mensagem, resposta) {
  if (!sessionId) return;
  const historico = sessoes.get(sessionId) || [];
  historico.push({ role: "user", content: mensagem });
  historico.push({ role: "assistant", content: resposta });
  // Manter apenas últimas 10 mensagens
  if (historico.length > 20) historico.splice(0, historico.length - 20);
  sessoes.set(sessionId, historico);
}

/**
 * Registrar log da interação
 */
async function registrarLog(mensagem, resposta, origem, score, modulo, sessionId, tempo_ms) {
  try {
    await Log.create({ mensagem, resposta, origem, score, modulo, sessionId, tempo_ms });
  } catch (e) { /* não falhar por log */ }
}

/**
 * Avaliar decisão baseada no score
 */
export function decidirAcao(score) {
  const limiteAuto = parseFloat(process.env.SCORE_AUTO_RESPOSTA) || 0.85;
  const limiteSugestao = parseFloat(process.env.SCORE_SUGESTAO) || 0.65;

  if (score >= limiteAuto) return "AUTO_RESPONDER";
  if (score >= limiteSugestao) return "SUGERIR";
  return "ESCALAR";
}
