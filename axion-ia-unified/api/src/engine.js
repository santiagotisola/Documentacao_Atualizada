import OpenAI from "openai";
import dotenv from "dotenv";
import { systemPrompt, whatsappPrompt } from "./prompt.js";
import { classificarMensagem } from "./classifier.js";
import { salvarHistorico, salvarNaoRespondida } from "./logger.js";
import { buscarRespostaSemantica } from "./services/search.js";
import { Log } from "./models/log.model.js";

dotenv.config();

// ─── Memória de sessão (em memória — descartada ao reiniciar) ────────────────
// Chave: sessionId | Valor: array de { role, content } das últimas 6 trocas
const memoriasSessao = new Map();
const MAX_TURNOS_SESSAO = 6; // 3 pares user/assistant

function obterContextoSessao(sessionId) {
  if (!sessionId) return [];
  return memoriasSessao.get(sessionId) || [];
}

function atualizarContextoSessao(sessionId, mensagem, resposta) {
  if (!sessionId) return;
  const historico = memoriasSessao.get(sessionId) || [];
  historico.push({ role: "user", content: mensagem });
  historico.push({ role: "assistant", content: resposta });
  // Manter apenas os últimos MAX_TURNOS_SESSAO pares
  const corte = historico.length > MAX_TURNOS_SESSAO * 2 ? historico.length - MAX_TURNOS_SESSAO * 2 : 0;
  memoriasSessao.set(sessionId, historico.slice(corte));
}

export function limparSessao(sessionId) {
  memoriasSessao.delete(sessionId);
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function logMongo(dados) {
  try { await Log.create(dados); } catch (_) { /* fallback silencioso */ }
}

export async function gerarResposta(mensagem, { sessionId } = {}) {

  // 1. Classificação por keywords (mais rápido, sem custo)
  const contexto = classificarMensagem(mensagem);

  if (contexto) {
    const resposta = `
Assunto: ${contexto.assunto}

Análise:
Foi identificado comportamento relacionado ao cenário informado.

Causa:
${contexto.causa}

Ação:
${contexto.acao}

Status:
${contexto.status}
`;

    salvarHistorico({ mensagem, origem: 'kb', resposta });
    logMongo({ mensagem, resposta, origem: 'kb', score: 1.0 });
    atualizarContextoSessao(sessionId, mensagem, resposta);

    return { resposta, origem: 'kb', score: 1.0 };
  }

  // 2. Busca semântica por embeddings (entende significado)
  try {
    const resultado = await buscarRespostaSemantica(mensagem);

    if (resultado) {
      salvarHistorico({ mensagem, origem: 'embedding', resposta: resultado.resposta });
      logMongo({
        mensagem,
        resposta: resultado.resposta,
        origem: 'embedding',
        score: resultado.score,
        modulo: resultado.modulo
      });
      atualizarContextoSessao(sessionId, mensagem, resultado.resposta);

      return {
        resposta: resultado.resposta,
        origem: 'embedding',
        score: resultado.score,
        modulo: resultado.modulo
      };
    }
  } catch (err) {
    console.error("[embedding-search] Erro:", err.message);
  }

  // 3. Fallback IA (OpenAI) — com contexto de sessão
  salvarNaoRespondida(mensagem);

  const historicoSessao = obterContextoSessao(sessionId);

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      { role: "system", content: systemPrompt },
      ...historicoSessao, // contexto das últimas trocas
      { role: "user", content: mensagem }
    ]
  });

  const resposta = response.choices[0].message.content;

  salvarHistorico({ mensagem, origem: 'openai', resposta });
  logMongo({ mensagem, resposta, origem: 'openai', score: 0.5 });
  atualizarContextoSessao(sessionId, mensagem, resposta);

  return { resposta, origem: 'openai', score: 0.5 };
}

// Versão otimizada para WhatsApp — respostas curtas e sem formatação laudo
export async function gerarRespostaWA(mensagem) {
  // 1. Classificação por keywords (sem custo)
  const contexto = classificarMensagem(mensagem);
  if (contexto) {
    // Reformatar resposta de forma curta para WhatsApp
    const resposta = `${contexto.acao}`;
    salvarHistorico({ mensagem, origem: 'kb', resposta });
    return { resposta, origem: 'kb', score: 1.0 };
  }

  // 2. Busca semântica por embeddings
  try {
    const resultado = await buscarRespostaSemantica(mensagem);
    if (resultado) {
      salvarHistorico({ mensagem, origem: 'embedding', resposta: resultado.resposta });
      return { resposta: resultado.resposta, origem: 'embedding', score: resultado.score, modulo: resultado.modulo };
    }
  } catch (err) {
    console.error("[embedding-search] Erro:", err.message);
  }

  // 3. Fallback OpenAI com prompt curto para WhatsApp
  salvarNaoRespondida(mensagem);
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 300,
      messages: [
        { role: "system", content: whatsappPrompt },
        { role: "user", content: mensagem }
      ]
    });

    const resposta = response.choices[0].message.content;
    salvarHistorico({ mensagem, origem: 'openai', resposta });
    logMongo({ mensagem, resposta, origem: 'openai', score: 0.5 });
    return { resposta, origem: 'openai', score: 0.5 };
  } catch (err) {
    console.error("[openai-fallback] Erro:", err.message);
    return { resposta: null, origem: 'nenhuma', score: 0 };
  }
}
