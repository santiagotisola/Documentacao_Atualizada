/**
 * whatsapp-flows.js
 * Fase 3: Definições de WhatsApp Flows (formulários interativos multi-step).
 * 
 * WhatsApp Flows permite criar formulários nativos com:
 * - Campos de texto, dropdown, date-picker
 * - Múltiplas telas (steps)
 * - Validação client-side
 * - Submit com JSON estruturado
 * 
 * Requisitos para ativação:
 * - WhatsApp Cloud API configurada (WHATSAPP_PROVIDER=cloud_api)
 * - Flows publicados no Meta Business Manager
 * - Endpoint de dados registrado (/whatsapp/flow-data)
 * 
 * Este módulo define os schemas dos flows e o handler de dados.
 */

// ─── Flow Definitions ──────────────────────────────────────────────────────────

/**
 * Flow: Abertura de Chamado (Ticket)
 * Substitui o fluxo linear de perguntas por um formulário único.
 */
export const FLOW_ABERTURA_CHAMADO = {
  id: "FLOW_TICKET_001",
  name: "Abertura de Chamado",
  description: "Formulário para abrir novo chamado de suporte",
  screens: [
    {
      id: "SCREEN_TICKET_INFO",
      title: "Novo Chamado",
      data: {},
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "TextInput",
            "input-type": "text",
            required: true,
            name: "assunto",
            label: "Assunto",
            "helper-text": "Ex: Erro no relatório de passagens",
          },
          {
            type: "TextArea",
            required: true,
            name: "descricao",
            label: "Descrição do problema",
            "helper-text": "Descreva com detalhes o que está acontecendo",
          },
          {
            type: "Dropdown",
            required: true,
            name: "sistema",
            label: "Sistema",
            "data-source": [
              { id: "axhub", title: "AxHub" },
              { id: "axton", title: "AxTon" },
              { id: "axcross", title: "AxCross" },
              { id: "multi360", title: "Multi360" },
              { id: "sigef", title: "SIGEF" },
              { id: "speed", title: "Speed" },
              { id: "octopus", title: "Octopus" },
              { id: "rede", title: "Rede/Infra" },
              { id: "contrato", title: "Contrato/Financeiro" },
              { id: "outros", title: "Outros" },
              { id: "na", title: "Não se aplica" },
            ],
          },
          {
            type: "Footer",
            label: "Enviar chamado",
            "on-click-action": {
              name: "complete",
              payload: {},
            },
          },
        ],
      },
    },
  ],
};

/**
 * Flow: Solicitação de Compras
 * Substitui o fluxo linear de pedido de compras por formulário estruturado.
 */
export const FLOW_PEDIDO_COMPRAS = {
  id: "FLOW_COMPRAS_001",
  name: "Pedido de Compras",
  description: "Formulário para solicitar compra/reposição de material",
  screens: [
    {
      id: "SCREEN_COMPRA_DADOS",
      title: "Dados do Pedido",
      data: {},
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "TextInput",
            "input-type": "text",
            required: true,
            name: "titulo",
            label: "Título do pedido",
            "helper-text": "Ex: Reposição de HD para servidor",
          },
          {
            type: "TextArea",
            required: true,
            name: "motivo",
            label: "Motivo/Justificativa",
          },
          {
            type: "Dropdown",
            required: false,
            name: "sistema",
            label: "Sistema (se aplicável)",
            "data-source": [
              { id: "axhub", title: "AxHub" },
              { id: "axton", title: "AxTon" },
              { id: "axcross", title: "AxCross" },
              { id: "infra", title: "Infraestrutura" },
              { id: "geral", title: "Uso geral" },
            ],
          },
          {
            type: "Dropdown",
            required: true,
            name: "prioridade",
            label: "Prioridade",
            "data-source": [
              { id: "baixa", title: "Baixa" },
              { id: "normal", title: "Normal" },
              { id: "alta", title: "Alta" },
              { id: "urgente", title: "Urgente" },
            ],
          },
          {
            type: "Footer",
            label: "Próximo",
            "on-click-action": {
              name: "navigate",
              next: { type: "screen", name: "SCREEN_COMPRA_ITENS" },
              payload: {},
            },
          },
        ],
      },
    },
    {
      id: "SCREEN_COMPRA_ITENS",
      title: "Itens do Pedido",
      data: {},
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "TextArea",
            required: true,
            name: "itens",
            label: "Liste os itens (um por linha)",
            "helper-text": "Formato: quantidade - descrição\nEx: 2 - HD SSD 1TB\n1 - Cabo HDMI 3m",
          },
          {
            type: "TextInput",
            "input-type": "text",
            required: false,
            name: "observacoes",
            label: "Observações adicionais",
          },
          {
            type: "Footer",
            label: "Enviar pedido",
            "on-click-action": {
              name: "complete",
              payload: {},
            },
          },
        ],
      },
    },
  ],
};

// ─── Flow Data Handler ─────────────────────────────────────────────────────────

/**
 * Processa dados recebidos de um WhatsApp Flow completo.
 * Chamado pelo webhook quando o Flow é completado.
 * 
 * @param {string} flowId - ID do flow (FLOW_TICKET_001, FLOW_COMPRAS_001)
 * @param {object} data - dados do formulário preenchido
 * @param {string} telefone - número do remetente
 * @returns {{ success: boolean, message?: string }}
 */
export async function processarFlowCompleto(flowId, data, telefone) {
  switch (flowId) {
    case "FLOW_TICKET_001":
      return processarFlowTicket(data, telefone);
    case "FLOW_COMPRAS_001":
      return processarFlowCompras(data, telefone);
    default:
      console.warn(`⚠️ [Flows] Flow desconhecido: ${flowId}`);
      return { success: false, message: `Flow "${flowId}" não reconhecido` };
  }
}

async function processarFlowTicket(data, telefone) {
  const { assunto, descricao, sistema } = data;
  console.log(`📋 [Flows] Ticket via Flow: "${assunto}" — sistema: ${sistema} — tel: ${telefone}`);
  // TODO: Integrar com criarTicketUsuario() do jitbit.js quando Cloud API ativado
  return { success: true, message: `Chamado "${assunto}" recebido via Flow` };
}

async function processarFlowCompras(data, telefone) {
  const { titulo, motivo, sistema, prioridade, itens, observacoes } = data;
  console.log(`🛒 [Flows] Compra via Flow: "${titulo}" — prioridade: ${prioridade} — tel: ${telefone}`);
  // TODO: Integrar com PedidoCompra.create() quando Cloud API ativado
  return { success: true, message: `Pedido "${titulo}" recebido via Flow` };
}

// ─── Flow Trigger (envia mensagem com botão que abre o Flow) ──────────────────

/**
 * Envia uma mensagem interativa que abre um Flow registrado.
 * Requer Cloud API + Flow publicado no Meta Business Manager.
 * 
 * @param {string} telefoneOuJid
 * @param {string} flowId - ID do flow no Meta (registrado via API)
 * @param {string} headerText - título
 * @param {string} bodyText - descrição
 * @param {string} buttonText - texto do botão CTA
 */
export async function enviarFlow(telefoneOuJid, flowId, headerText, bodyText, buttonText) {
  const PROVIDER = process.env.WHATSAPP_PROVIDER;
  if (PROVIDER !== "cloud_api") {
    console.log(`⚠️ [Flows] WhatsApp Flows requer Cloud API. Provider atual: ${PROVIDER || "baileys"}`);
    return null;
  }

  const phoneNumber = telefoneOuJid.replace(/@.*$/, "");
  const phoneId = process.env.WHATSAPP_CLOUD_PHONE_ID;
  const token = process.env.WHATSAPP_CLOUD_TOKEN;

  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "interactive",
      interactive: {
        type: "flow",
        header: { type: "text", text: headerText },
        body: { text: bodyText },
        footer: { text: "Axion Tecnologia" },
        action: {
          name: "flow",
          parameters: {
            flow_message_version: "3",
            flow_id: flowId,
            flow_cta: buttonText,
            mode: "published",
          },
        },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error(`❌ [Flows] Erro ao enviar flow: ${JSON.stringify(err)}`);
    return null;
  }
  return res.json();
}

// ─── Webhook handler para Flow Data ───────────────────────────────────────────

/**
 * Handler para o endpoint POST /whatsapp/flow-data
 * Recebe dados do Flow quando o usuário completa o formulário.
 * 
 * Registrar no controller:
 *   router.post("/flow-data", handleFlowData);
 */
export function handleFlowData(req, res) {
  try {
    const { flow_token, action, screen, data } = req.body;

    if (action === "ping") {
      // Health check do Meta
      return res.json({ data: { status: "active" } });
    }

    if (action === "data_exchange") {
      // Meta solicitando dados para popular o flow (dropdown dinâmico, etc.)
      return res.json({ data: {}, screen: screen || "SUCCESS" });
    }

    // action === "COMPLETE" — flow finalizado
    console.log(`✅ [Flows] Flow completo. Token: ${flow_token}, Dados:`, JSON.stringify(data));

    // Responder 200 imediatamente (Meta espera resposta rápida)
    res.json({ success: true });

    // Processar assíncronamente
    // TODO: Extrair telefone do flow_token e processar
  } catch (err) {
    console.error("❌ [Flows] Erro no handler:", err.message);
    res.status(500).json({ error: "Internal error" });
  }
}
