import dotenv from "dotenv";

dotenv.config();

const JITBIT_BASE = process.env.JITBIT_URL || "https://desk.axiontecnologia.com.br";
const JITBIT_USER = process.env.JITBIT_USER;
const JITBIT_PASS = process.env.JITBIT_PASS;

function getAuthHeader() {
  const credentials = Buffer.from(`${JITBIT_USER}:${JITBIT_PASS}`).toString("base64");
  return { "Authorization": `Basic ${credentials}` };
}

async function jitbitRequest(endpoint, method = "GET", body = null) {
  const url = `${JITBIT_BASE}/api${endpoint}`;
  const options = {
    method,
    headers: {
      ...getAuthHeader(),
      "Content-Type": "application/json"
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Jitbit API ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Buscar tickets (com filtros opcionais)
 * mode: 0=unanswered, 1=all, 2=answered, 3=closed
 */
export async function buscarTickets({ mode = 0, count = 20, sectionId = null } = {}) {
  let endpoint = `/Tickets?mode=${mode}&count=${count}`;
  if (sectionId) endpoint += `&sectionId=${sectionId}`;
  return jitbitRequest(endpoint);
}

/**
 * Buscar detalhes de um ticket
 */
export async function buscarTicket(ticketId) {
  return jitbitRequest(`/Ticket?id=${ticketId}`);
}

/**
 * Buscar comentários de um ticket
 */
export async function buscarComentarios(ticketId) {
  return jitbitRequest(`/Comments?id=${ticketId}`);
}

/**
 * Postar resposta em um ticket
 */
export async function responderTicket(ticketId, corpo) {
  const params = new URLSearchParams();
  params.append("id", ticketId);
  params.append("body", corpo);

  const url = `${JITBIT_BASE}/api/Comment`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      ...getAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params.toString()
  });

  if (!response.ok) {
    throw new Error(`Jitbit Comment ${response.status}: ${response.statusText}`);
  }

  return { sucesso: true, ticketId };
}

/**
 * Buscar categorias/seções
 */
export async function buscarCategorias() {
  return jitbitRequest("/Categories");
}

/**
 * Criar ticket no Jitbit usando credenciais do próprio usuário
 */
export async function criarTicketUsuario(email, senha, assunto, descricao, categoryId) {
  const credentials = Buffer.from(`${email}:${senha}`).toString("base64");
  const params = new URLSearchParams();
  params.append("categoryId", categoryId || 0);
  params.append("subject", assunto);
  params.append("body", descricao);
  params.append("priorityId", "1");

  const url = `${JITBIT_BASE}/api/Ticket`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params.toString()
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("AUTH_FAILED");
    }
    throw new Error(`Jitbit ${response.status}: ${response.statusText}`);
  }

  const ticketId = await response.text();
  return { sucesso: true, ticketId: ticketId.trim() };
}
