import dotenv from "dotenv";

dotenv.config();

const JITBIT_DEFAULT_URL = "https://desk.axiontecnologia.com.br/helpdesk";
const JITBIT_DEFAULT_USER = "Santiago@axiontecnologia.com.br";
const JITBIT_DEFAULT_PASS = "Axion#2026";

function getJitbitUser() {
  return process.env.JITBIT_USER || JITBIT_DEFAULT_USER;
}

function getJitbitPass() {
  return process.env.JITBIT_PASS || JITBIT_DEFAULT_PASS;
}

function getBase() {
  return (process.env.JITBIT_URL || JITBIT_DEFAULT_URL).replace(/\/+$/, "");
}

function getAuthHeader() {
  if (process.env.JITBIT_TOKEN) {
    return { "Authorization": `Bearer ${process.env.JITBIT_TOKEN}` };
  }
  const credentials = Buffer.from(`${getJitbitUser()}:${getJitbitPass()}`).toString("base64");
  return { "Authorization": `Basic ${credentials}` };
}

async function jitbitRequest(endpoint, method = "GET", body = null) {
  const url = `${getBase()}/api${endpoint}`;

  // Timeout de 15s — evita travar workers se o Jitbit estiver lento/fora
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);

  const options = {
    method,
    signal: controller.signal,
    headers: {
      ...getAuthHeader(),
      "Content-Type": "application/json"
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const txt = await response.text().catch(() => "");
      throw new Error(`Jitbit API ${response.status}: ${txt || response.statusText}`);
    }

    return response.json();
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error(`Jitbit API timeout (>15s) no endpoint ${endpoint}`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Buscar tickets (com filtros opcionais)
 * mode: "unanswered" | "all" | "unclosed" | "handledbyme"
 */
export async function buscarTickets({
  mode = "unanswered",
  count = 20,
  sectionId = null,
  techId = null,
  userId = null,
  dateFrom = null,
  dateTo = null,
  statusId = null,
  priorityId = null,
  handledByUserIdList = null,
} = {}) {
  let endpoint = `/Tickets?mode=${mode}&count=${count}`;
  if (sectionId)            endpoint += `&sectionId=${sectionId}`;
  if (techId)               endpoint += `&techId=${techId}`;
  if (userId)               endpoint += `&userId=${userId}`;
  if (dateFrom)             endpoint += `&dateFrom=${encodeURIComponent(dateFrom)}`;
  if (dateTo)               endpoint += `&dateTo=${encodeURIComponent(dateTo)}`;
  if (statusId !== null && statusId !== "") endpoint += `&statusId=${statusId}`;
  if (priorityId !== null && priorityId !== "") endpoint += `&priorityId=${priorityId}`;
  if (handledByUserIdList)  endpoint += `&handledByUserIdList=${handledByUserIdList}`;
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

  const url = `${getBase()}/api/Comment`;
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
  // categoryId=0 é inválido — buscar a primeira categoria disponível
  let catId = parseInt(categoryId, 10);
  if (!catId || catId <= 0) {
    try {
      const cats = await buscarCategorias();
      catId = cats?.[0]?.CategoryID;
      if (!catId) throw new Error("Nenhuma categoria encontrada no Jitbit");
    } catch (e) {
      throw new Error(`Não foi possível determinar a categoria: ${e.message}`);
    }
  }

  const credentials = Buffer.from(`${email}:${senha}`).toString("base64");
  const params = new URLSearchParams();
  params.append("categoryId", catId);
  params.append("subject", assunto);
  params.append("body", descricao);
  params.append("priorityId", "1");

  const url = `${getBase()}/api/Ticket`;
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

  const text = await response.text();
  const ticketId = parseInt(text.trim(), 10);
  if (isNaN(ticketId)) {
    // Jitbit retornou HTML ou texto inesperado — provavelmente sessão expirou
    throw new Error("AUTH_FAILED");
  }
  return { sucesso: true, ticketId };
}

/**
 * Extrair lista de técnicos únicos a partir dos tickets recentes
 */
export async function listarTecnicos() {
  const tickets = await jitbitRequest("/Tickets?mode=1&count=300");
  const mapa = {};
  for (const t of tickets) {
    if (t.AssignedToUserID && t.TechFirstName) {
      const id = t.AssignedToUserID;
      if (!mapa[id]) {
        mapa[id] = {
          UserID: id,
          FirstName: t.TechFirstName || "",
          LastName:  t.TechLastName  || "",
          Email:     t.Technician    || "",
        };
      }
    }
  }
  return Object.values(mapa).sort((a, b) =>
    `${a.FirstName} ${a.LastName}`.localeCompare(`${b.FirstName} ${b.LastName}`)
  );
}

/**
 * Buscar tickets com filtros de técnico e período
 * mode 1 = todos os tickets
 */
export async function buscarTicketsFiltrados({ tecnicoId = null, dataInicio = null, dataFim = null, count = 300 } = {}) {
  let endpoint = `/Tickets?mode=1&count=${Math.min(count, 300)}`;
  if (tecnicoId) endpoint += `&assigneeUserId=${tecnicoId}`;
  if (dataInicio) endpoint += `&dateFrom=${encodeURIComponent(dataInicio)}`;
  if (dataFim)    endpoint += `&dateTo=${encodeURIComponent(dataFim)}`;
  return jitbitRequest(endpoint);
}

/**
 * Anexar arquivo (imagem) a um ticket existente
 * @param {number} ticketId
 * @param {string} filename - nome do arquivo ex: foto.jpg
 * @param {Buffer} buffer   - conteúdo binário
 * @param {string} mimeType - ex: image/jpeg
 */
export async function anexarArquivo(ticketId, filename, buffer, mimeType = "image/jpeg") {
  // Endpoint correto: /api/AttachFile com campo "uploadFile" e "id" no corpo
  const boundary = `----FormBoundary${Date.now().toString(16)}`;

  const partId = Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="id"\r\n\r\n` +
    `${ticketId}\r\n`
  );
  const partFile = Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="uploadFile"; filename="${filename}"\r\n` +
    `Content-Type: ${mimeType}\r\n\r\n`
  );
  const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([partId, partFile, buffer, footer]);

  const url = `${getBase()}/api/AttachFile`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      ...getAuthHeader(),
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      "Content-Length": String(body.length),
    },
    body,
  });

  if (!response.ok) {
    const msg = await response.text().catch(() => "");
    throw new Error(`Jitbit AttachFile ${response.status}: ${msg || response.statusText}`);
  }
  return { sucesso: true };
}

/**
 * Atribuir técnico a um ticket
 * @param {number} ticketId
 * @param {number} techUserId - UserID do técnico no Jitbit
 */
export async function atribuirTecnico(ticketId, techUserId) {
  const params = new URLSearchParams();
  params.append("id", ticketId);
  params.append("techId", techUserId);

  const url = `${getBase()}/api/UpdateTicket`;
  const response = await fetch(url, {
    method: "POST",
    headers: { ...getAuthHeader(), "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`Jitbit UpdateTicket ${response.status}: ${response.statusText}`);
  }
  return { sucesso: true };
}

/**
 * Listar usuários/técnicos disponíveis no Jitbit
 */
export async function listarUsuarios() {
  return jitbitRequest("/UserList");
}
