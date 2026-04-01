import { buscarTickets, buscarTicket, buscarComentarios, responderTicket, buscarCategorias, criarTicketUsuario } from "./jitbit.js";
import { gerarResposta } from "./engine.js";
import { salvarHistorico } from "./logger.js";
import * as scheduler from "./scheduler.js";

/**
 * GET /api/helpdesk/tickets — Lista tickets não respondidos
 */
export async function listarTickets(req, res) {
  try {
    const mode = parseInt(req.query.mode) || 0;
    const count = parseInt(req.query.count) || 20;
    const tickets = await buscarTickets({ mode, count });
    return res.json({ total: tickets.length, tickets });
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao buscar tickets", detalhe: error.message });
  }
}

/**
 * GET /api/helpdesk/ticket/:id — Detalhes de um ticket
 */
export async function detalheTicket(req, res) {
  try {
    const ticket = await buscarTicket(req.params.id);
    const comentarios = await buscarComentarios(req.params.id);
    return res.json({ ticket, comentarios });
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao buscar ticket", detalhe: error.message });
  }
}

/**
 * POST /api/helpdesk/classificar/:id — Classifica um ticket usando AxionIA
 */
export async function classificarTicket(req, res) {
  try {
    const ticket = await buscarTicket(req.params.id);
    const textoTicket = `${ticket.Subject || ""} ${ticket.Body || ""}`.trim();

    if (!textoTicket) {
      return res.status(400).json({ erro: "Ticket sem conteúdo para classificar" });
    }

    const resultado = await gerarResposta(textoTicket);

    return res.json({
      ticketId: req.params.id,
      assuntoOriginal: ticket.Subject,
      sugestaoResposta: resultado.resposta,
      origem: resultado.origem,
      score: resultado.score,
      autoEnviado: false
    });
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao classificar ticket", detalhe: error.message });
  }
}

/**
 * POST /api/helpdesk/responder/:id — Classifica E responde automaticamente
 */
export async function responderTicketIA(req, res) {
  try {
    const ticket = await buscarTicket(req.params.id);
    const textoTicket = `${ticket.Subject || ""} ${ticket.Body || ""}`.trim();

    if (!textoTicket) {
      return res.status(400).json({ erro: "Ticket sem conteúdo" });
    }

    const resultado = await gerarResposta(textoTicket);

    // Postar resposta no Jitbit
    await responderTicket(req.params.id, resultado.resposta);

    // Log da interação helpdesk
    salvarHistorico({
      mensagem: `[HELPDESK #${req.params.id}] ${textoTicket}`,
      origem: "helpdesk",
      resposta: resultado.resposta
    });

    return res.json({
      ticketId: req.params.id,
      assuntoOriginal: ticket.Subject,
      respostaEnviada: resultado.resposta,
      origem: resultado.origem,
      score: resultado.score,
      autoEnviado: true
    });
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao responder ticket", detalhe: error.message });
  }
}

/**
 * POST /api/helpdesk/processar — Processa todos os tickets não respondidos
 */
/**
 * Thresholds de confiança para decisão automática
 * score >= 0.85 → AUTO_RESPONDER (envia direto ao Jitbit)
 * score >= 0.65 → SUGERIR (retorna sugestão, não envia)
 * score < 0.65  → ESCALAR (marca para análise humana)
 */
const SCORE_AUTO = 0.85;
const SCORE_SUGERIR = 0.65;

function decidirAcao(score) {
  if (score >= SCORE_AUTO) return "AUTO_RESPONDER";
  if (score >= SCORE_SUGERIR) return "SUGERIR";
  return "ESCALAR";
}

export async function processarPendentes(req, res) {
  try {
    const autoEnviar = req.query.auto === "true";
    const tickets = await buscarTickets({ mode: 0, count: 50 });
    const resultados = [];

    for (const ticket of tickets) {
      const textoTicket = `${ticket.Subject || ""} ${ticket.Body || ""}`.trim();
      if (!textoTicket) continue;

      const resultado = await gerarResposta(textoTicket);
      const decisao = decidirAcao(resultado.score);
      let enviado = false;

      // Auto-enviar apenas se score alto E parâmetro auto=true
      if (autoEnviar && decisao === "AUTO_RESPONDER") {
        try {
          await responderTicket(ticket.TicketID, resultado.resposta);
          enviado = true;
          salvarHistorico({
            mensagem: `[HELPDESK-AUTO #${ticket.TicketID}] ${textoTicket}`,
            origem: "helpdesk-auto",
            resposta: resultado.resposta
          });
        } catch (_) { /* falha silenciosa — não bloqueia batch */ }
      }

      resultados.push({
        ticketId: ticket.TicketID,
        assunto: ticket.Subject,
        sugestao: resultado.resposta,
        origem: resultado.origem,
        score: resultado.score,
        decisao,
        autoEnviado: enviado
      });
    }

    const stats = {
      total: resultados.length,
      autoRespondidos: resultados.filter(r => r.autoEnviado).length,
      sugeridos: resultados.filter(r => r.decisao === "SUGERIR").length,
      escalados: resultados.filter(r => r.decisao === "ESCALAR").length
    };

    return res.json({
      ...stats,
      resultados
    });
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao processar pendentes", detalhe: error.message });
  }
}

/**
 * GET /api/helpdesk/categorias — Lista categorias do Jitbit
 */
export async function listarCategorias(req, res) {
  try {
    const categorias = await buscarCategorias();
    return res.json({ total: categorias.length, categorias });
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao buscar categorias", detalhe: error.message });
  }
}

/**
 * POST /api/helpdesk/criar — Cria chamado no Jitbit com credenciais do usuário
 */
export async function criarChamado(req, res) {
  try {
    const { email, senha, assunto, descricao } = req.body;
    if (!email || !senha || !assunto || !descricao) {
      return res.status(400).json({ erro: "Campos obrigatórios: email, senha, assunto, descricao" });
    }

    const resultado = await criarTicketUsuario(email, senha, assunto, descricao);

    salvarHistorico({
      mensagem: `[HELPDESK-NOVO] ${assunto} — ${email}`,
      origem: "helpdesk-widget",
      resposta: `Chamado #${resultado.ticketId} criado`
    });

    return res.json(resultado);
  } catch (error) {
    if (error.message === "AUTH_FAILED") {
      return res.status(401).json({ erro: "Login ou senha inválidos. Verifique suas credenciais do Help Desk." });
    }
    return res.status(500).json({ erro: "Erro ao criar chamado", detalhe: error.message });
  }
}

/**
 * GET /api/helpdesk/polling — Status do polling automático
 */
export function statusPolling(req, res) {
  return res.json(scheduler.obterStatus());
}

/**
 * POST /api/helpdesk/polling/iniciar — Ativa o polling
 * Body: { intervalo: 2 } (minutos, opcional)
 */
export function iniciarPolling(req, res) {
  const intervalo = req.body?.intervalo || process.env.POLLING_INTERVAL || 2;
  const status = scheduler.iniciar(intervalo);
  return res.json({ mensagem: "Polling iniciado", ...status });
}

/**
 * POST /api/helpdesk/polling/pausar — Pausa o polling
 */
export function pausarPolling(req, res) {
  const status = scheduler.pausar();
  return res.json({ mensagem: "Polling pausado", ...status });
}

/**
 * POST /api/helpdesk/polling/retomar — Retoma o polling pausado
 */
export function retomarPolling(req, res) {
  const status = scheduler.retomar();
  return res.json({ mensagem: "Polling retomado", ...status });
}

/**
 * POST /api/helpdesk/polling/limpar — Limpa cache de tickets vistos
 */
export function limparPolling(req, res) {
  const resultado = scheduler.limparTicketsVistos();
  return res.json({ mensagem: "Cache limpo", ...resultado });
}
