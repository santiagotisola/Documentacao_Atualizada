import { buscarTickets, buscarTicket, buscarComentarios, responderTicket, buscarCategorias } from "./jitbit.js";
import { gerarResposta } from "./engine.js";
import { salvarHistorico } from "./logger.js";

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

    const resposta = await gerarResposta(textoTicket);

    return res.json({
      ticketId: req.params.id,
      assuntoOriginal: ticket.Subject,
      sugestaoResposta: resposta,
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

    const resposta = await gerarResposta(textoTicket);

    // Postar resposta no Jitbit
    await responderTicket(req.params.id, resposta);

    // Log da interação helpdesk
    salvarHistorico({
      mensagem: `[HELPDESK #${req.params.id}] ${textoTicket}`,
      origem: "helpdesk",
      resposta
    });

    return res.json({
      ticketId: req.params.id,
      assuntoOriginal: ticket.Subject,
      respostaEnviada: resposta,
      autoEnviado: true
    });
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao responder ticket", detalhe: error.message });
  }
}

/**
 * POST /api/helpdesk/processar — Processa todos os tickets não respondidos
 */
export async function processarPendentes(req, res) {
  try {
    const tickets = await buscarTickets({ mode: 0, count: 50 });
    const resultados = [];

    for (const ticket of tickets) {
      const textoTicket = `${ticket.Subject || ""} ${ticket.Body || ""}`.trim();
      if (!textoTicket) continue;

      const resposta = await gerarResposta(textoTicket);

      resultados.push({
        ticketId: ticket.TicketID,
        assunto: ticket.Subject,
        sugestao: resposta,
        autoEnviado: false
      });
    }

    return res.json({
      totalProcessados: resultados.length,
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
