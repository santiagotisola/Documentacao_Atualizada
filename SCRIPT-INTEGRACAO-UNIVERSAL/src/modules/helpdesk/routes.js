import { Router } from "express";
import { criarTicket, listarTickets, buscarTicket, responderTicket, atualizarTicket, listarCategorias } from "./service.js";
import { Ticket } from "./models/ticket.model.js";

export const helpdeskRouter = Router();

// POST /api/helpdesk/tickets — Criar ticket
helpdeskRouter.post("/tickets", async (req, res) => {
  try {
    const resultado = await criarTicket(req.body);
    res.status(201).json(resultado);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/helpdesk/tickets — Listar tickets
helpdeskRouter.get("/tickets", async (req, res) => {
  try {
    const { status, atribuido_a, categoria, page, limit } = req.query;
    const tickets = await listarTickets({ status, atribuido_a, categoria, page: parseInt(page), limit: parseInt(limit) });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/helpdesk/tickets/:id — Detalhes do ticket
helpdeskRouter.get("/tickets/:id", async (req, res) => {
  try {
    const ticket = await buscarTicket(req.params.id);
    if (!ticket) return res.status(404).json({ erro: "Ticket não encontrado" });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /api/helpdesk/tickets/:id/responder — Responder ticket
helpdeskRouter.post("/tickets/:id/responder", async (req, res) => {
  try {
    const { resposta, autor, privado } = req.body;
    if (!resposta) return res.status(400).json({ erro: "Campo 'resposta' é obrigatório" });
    await responderTicket(req.params.id, resposta, { autor, privado });
    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// PATCH /api/helpdesk/tickets/:id — Atualizar ticket
helpdeskRouter.patch("/tickets/:id", async (req, res) => {
  try {
    const { status, prioridade, categoria, atribuir_a } = req.body;
    const dados = {};
    if (status) dados.status = status;
    if (prioridade) dados.prioridade = prioridade;
    if (categoria) dados.categoria = categoria;
    if (atribuir_a) dados.atribuido_a = atribuir_a;
    if (status === "fechado") dados.fechado_em = new Date();

    const ticket = await atualizarTicket(req.params.id, dados);
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/helpdesk/categorias — Listar categorias
helpdeskRouter.get("/categorias", async (req, res) => {
  try {
    const categorias = await listarCategorias();
    res.json(categorias);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/helpdesk/fila — Fila de revisão (tickets com sugestão IA pendente)
helpdeskRouter.get("/fila", async (req, res) => {
  try {
    const fila = await Ticket.find({ "ia_sugestao.status": "pendente" })
      .select("numero assunto ia_sugestao criado_por createdAt")
      .sort({ createdAt: -1 })
      .lean();
    res.json(fila);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /api/helpdesk/fila/:id/aprovar — Aprovar sugestão da IA
helpdeskRouter.post("/fila/:id/aprovar", async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ $or: [{ _id: req.params.id }, { numero: parseInt(req.params.id) || 0 }] });
    if (!ticket || !ticket.ia_sugestao) return res.status(404).json({ erro: "Sugestão não encontrada" });

    // Enviar a resposta
    await responderTicket(req.params.id, ticket.ia_sugestao.resposta, { autor: "IA (aprovado)", origem: "ia" });
    ticket.ia_sugestao.status = "enviada";
    await ticket.save();

    res.json({ sucesso: true, mensagem: "Resposta aprovada e enviada" });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /api/helpdesk/fila/:id/rejeitar — Rejeitar sugestão
helpdeskRouter.post("/fila/:id/rejeitar", async (req, res) => {
  try {
    await Ticket.findOneAndUpdate(
      { $or: [{ _id: req.params.id }, { numero: parseInt(req.params.id) || 0 }] },
      { "ia_sugestao.status": "rejeitada" }
    );
    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/helpdesk/dashboard — Métricas
helpdeskRouter.get("/dashboard", async (req, res) => {
  try {
    const [abertos, emAndamento, resolvidos, total] = await Promise.all([
      Ticket.countDocuments({ status: "aberto" }),
      Ticket.countDocuments({ status: "em_andamento" }),
      Ticket.countDocuments({ status: { $in: ["resolvido", "fechado"] } }),
      Ticket.countDocuments()
    ]);

    const slaViolados = await Ticket.countDocuments({ "sla.violado": true, status: { $nin: ["resolvido", "fechado"] } });

    res.json({ abertos, emAndamento, resolvidos, total, slaViolados });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});
