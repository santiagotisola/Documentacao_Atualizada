import { Ticket } from "./models/ticket.model.js";
import axios from "axios";

// ============================================
// ADAPTADORES POR PLATAFORMA
// ============================================
const adapters = {
  proprio: {
    criarTicket: async (dados) => {
      const slaConfig = getSLAConfig(dados.prioridade);
      const ticket = await Ticket.create({
        ...dados,
        criado_por: {
          nome: dados.criado_por_nome,
          email: dados.criado_por_email,
          telefone: dados.criado_por_telefone
        },
        sla: slaConfig
      });
      return { id: ticket._id, numero: ticket.numero };
    },
    listarTickets: async (filtros = {}) => {
      const query = {};
      if (filtros.status) query.status = filtros.status;
      if (filtros.atribuido_a) query["atribuido_a.id"] = filtros.atribuido_a;
      if (filtros.categoria) query.categoria = filtros.categoria;

      return Ticket.find(query)
        .sort({ createdAt: -1 })
        .skip(((filtros.page || 1) - 1) * (filtros.limit || 50))
        .limit(filtros.limit || 50)
        .lean();
    },
    buscarTicket: async (id) => {
      return Ticket.findOne({ $or: [{ _id: id }, { numero: parseInt(id) || 0 }] }).lean();
    },
    responderTicket: async (id, resposta, { autor = "Sistema", privado = false, origem = "humano" } = {}) => {
      return Ticket.findOneAndUpdate(
        { $or: [{ _id: id }, { numero: parseInt(id) || 0 }] },
        { $push: { comentarios: { autor, texto: resposta, privado, origem } } },
        { new: true }
      );
    },
    atualizarTicket: async (id, dados) => {
      return Ticket.findOneAndUpdate(
        { $or: [{ _id: id }, { numero: parseInt(id) || 0 }] },
        { $set: dados },
        { new: true }
      );
    },
    listarCategorias: async () => {
      const cats = await Ticket.distinct("categoria");
      return cats.map(c => ({ id: c, nome: c }));
    }
  },

  jitbit: {
    criarTicket: async (dados) => {
      const resp = await jitbitRequest("POST", "/api/Ticket", {
        categoryId: dados.categoria_id,
        subject: dados.assunto,
        body: dados.descricao,
        priorityId: mapPrioridade(dados.prioridade),
        submitterEmail: dados.criado_por_email
      });
      return { id: resp.data, numero: resp.data };
    },
    listarTickets: async (filtros = {}) => {
      const params = new URLSearchParams();
      if (filtros.status === "aberto") params.append("mode", "unanswered");
      params.append("count", filtros.limit || 50);
      const resp = await jitbitRequest("GET", `/api/Tickets?${params}`);
      return resp.data.map(mapTicketJitbit);
    },
    buscarTicket: async (id) => {
      const resp = await jitbitRequest("GET", `/api/Ticket?id=${id}`);
      return mapTicketJitbit(resp.data);
    },
    responderTicket: async (id, resposta) => {
      await jitbitRequest("POST", "/api/Comment", { id, body: resposta });
    },
    listarCategorias: async () => {
      const resp = await jitbitRequest("GET", "/api/Categories");
      return resp.data.map(c => ({ id: c.CategoryID, nome: c.Name }));
    }
  },

  zendesk: {
    criarTicket: async (dados) => {
      const resp = await zendeskRequest("POST", "/tickets.json", {
        ticket: {
          subject: dados.assunto,
          description: dados.descricao,
          priority: dados.prioridade,
          requester: { name: dados.criado_por_nome, email: dados.criado_por_email }
        }
      });
      return { id: resp.data.ticket.id, numero: resp.data.ticket.id };
    },
    listarTickets: async (filtros = {}) => {
      const status = filtros.status || "open";
      const resp = await zendeskRequest("GET", `/tickets.json?status=${status}&page=${filtros.page || 1}`);
      return resp.data.tickets.map(mapTicketZendesk);
    },
    buscarTicket: async (id) => {
      const resp = await zendeskRequest("GET", `/tickets/${id}.json`);
      return mapTicketZendesk(resp.data.ticket);
    },
    responderTicket: async (id, resposta) => {
      await zendeskRequest("PUT", `/tickets/${id}.json`, {
        ticket: { comment: { body: resposta, public: true } }
      });
    },
    listarCategorias: async () => {
      const resp = await zendeskRequest("GET", "/ticket_fields.json");
      return resp.data.ticket_fields.filter(f => f.type === "tagger").map(f => ({ id: f.id, nome: f.title }));
    }
  },

  freshdesk: {
    criarTicket: async (dados) => {
      const resp = await freshdeskRequest("POST", "/tickets", {
        subject: dados.assunto,
        description: dados.descricao,
        priority: mapPrioridadeFreshdesk(dados.prioridade),
        email: dados.criado_por_email || `${dados.criado_por_telefone}@placeholder.com`,
        source: 7 // Chat
      });
      return { id: resp.data.id, numero: resp.data.id };
    },
    listarTickets: async (filtros = {}) => {
      const resp = await freshdeskRequest("GET", `/tickets?filter=open&page=${filtros.page || 1}`);
      return resp.data.map(mapTicketFreshdesk);
    },
    buscarTicket: async (id) => {
      const resp = await freshdeskRequest("GET", `/tickets/${id}?include=conversations`);
      return mapTicketFreshdesk(resp.data);
    },
    responderTicket: async (id, resposta) => {
      await freshdeskRequest("POST", `/tickets/${id}/reply`, { body: resposta });
    },
    listarCategorias: async () => {
      return [{ id: "geral", nome: "Geral" }];
    }
  }
};

// ============================================
// INTERFACE PÚBLICA (usa adaptador configurado)
// ============================================
function getAdapter() {
  const platform = process.env.HELPDESK_PLATFORM || "proprio";
  const adapter = adapters[platform];
  if (!adapter) throw new Error(`Plataforma de helpdesk não suportada: ${platform}`);
  return adapter;
}

export async function criarTicket(dados) { return getAdapter().criarTicket(dados); }
export async function listarTickets(filtros) { return getAdapter().listarTickets(filtros); }
export async function buscarTicket(id) { return getAdapter().buscarTicket(id); }
export async function responderTicket(id, resposta, opts) { return getAdapter().responderTicket(id, resposta, opts); }
export async function atualizarTicket(id, dados) { return getAdapter().atualizarTicket?.(id, dados); }
export async function listarCategorias() { return getAdapter().listarCategorias(); }

/**
 * Cria ticket a partir de webhook externo (normaliza dados)
 */
export async function criarTicketExterno(payload) {
  const dados = {
    assunto: payload.subject || payload.assunto || payload.title || "Ticket via webhook",
    descricao: payload.body || payload.descricao || payload.description || payload.message || "",
    categoria: payload.category || payload.categoria || "geral",
    prioridade: payload.priority || payload.prioridade || "media",
    criado_por_nome: payload.name || payload.nome || payload.requester_name || "Externo",
    criado_por_email: payload.email || payload.requester_email || "",
    criado_por_telefone: payload.phone || payload.telefone || "",
    origem: "webhook"
  };
  return criarTicket(dados);
}

// ============================================
// HELPERS HTTP POR PLATAFORMA
// ============================================
function jitbitRequest(method, path, data) {
  const url = process.env.HELPDESK_URL;
  const creds = Buffer.from(`${process.env.HELPDESK_USER}:${process.env.HELPDESK_PASS}`).toString("base64");
  return axios({ method, url: `${url}${path}`, data, headers: { Authorization: `Basic ${creds}` } });
}

function zendeskRequest(method, path, data) {
  const url = process.env.HELPDESK_URL;
  return axios({ method, url: `${url}${path}`, data, headers: { Authorization: `Bearer ${process.env.HELPDESK_TOKEN}` } });
}

function freshdeskRequest(method, path, data) {
  const url = process.env.HELPDESK_URL;
  const creds = Buffer.from(`${process.env.HELPDESK_TOKEN}:X`).toString("base64");
  return axios({ method, url: `${url}${path}`, data, headers: { Authorization: `Basic ${creds}` } });
}

// ============================================
// MAPEAMENTOS
// ============================================
function mapTicketJitbit(t) {
  return { id: t.TicketID, numero: t.TicketID, assunto: t.Subject, descricao: t.Body, status: t.StatusName, prioridade: t.Priority, categoria: t.CategoryName, criado_em: t.IssueDate };
}
function mapTicketZendesk(t) {
  return { id: t.id, numero: t.id, assunto: t.subject, descricao: t.description, status: t.status, prioridade: t.priority, criado_em: t.created_at };
}
function mapTicketFreshdesk(t) {
  return { id: t.id, numero: t.id, assunto: t.subject, descricao: t.description_text, status: t.status, prioridade: t.priority, criado_em: t.created_at };
}
function mapPrioridade(p) {
  const map = { baixa: 0, media: 1, alta: 2, critica: 3 };
  return map[p] ?? 1;
}
function mapPrioridadeFreshdesk(p) {
  const map = { baixa: 1, media: 2, alta: 3, critica: 4 };
  return map[p] ?? 2;
}

function getSLAConfig(prioridade) {
  const regras = { critica: 2, alta: 8, media: 24, baixa: 72 };
  const horas = regras[prioridade] || 24;
  return { prazo_horas: horas, vence_em: new Date(Date.now() + horas * 60 * 60 * 1000), violado: false };
}
