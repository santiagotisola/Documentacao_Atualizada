/**
 * whatsapp-transport.js
 * Camada de abstração para transporte WhatsApp.
 * 
 * Permite alternar entre providers (Baileys / Cloud API) via env:
 *   WHATSAPP_PROVIDER=baileys (padrão) | cloud_api
 * 
 * Fase 2 da implementação de botões interativos.
 */

/**
 * @typedef {Object} TransportProvider
 * @property {(jid: string, texto: string) => Promise<void>} enviarTexto
 * @property {(jid: string, pergunta: string, opcoes: string[], ids?: string[]) => Promise<any>} enviarPoll
 * @property {(jid: string, corpo: string, textoBotao: string, secoes: Array, extras?: object) => Promise<void>} enviarLista
 * @property {(jid: string, texto: string, botoes: Array) => Promise<void>} enviarBotoes
 * @property {(jid: string, buffer: Buffer, caption?: string) => Promise<void>} enviarImagem
 * @property {(jid: string, pergunta: string, opcoes: Array<{id:string,texto:string}>) => Promise<void>} enviarConfirmacao
 * @property {() => object} obterEstado
 * @property {() => string|null} obterQR
 * @property {() => Promise<void>} desconectar
 * @property {(numero: string) => Promise<{exists:boolean, jid:string|null, nome:string|null}>} verificarNumero
 * @property {string} provider
 */

import * as baileys from "./whatsapp.service.js";

/**
 * Provider atual baseado no Baileys (já existente).
 * Adapta as funções existentes para a interface padronizada.
 */
const baileysProvider = {
  provider: "baileys",
  enviarTexto: baileys.enviarMensagem,
  enviarPoll: baileys.enviarPoll,
  enviarLista: baileys.enviarListaSelecao,
  enviarBotoes: baileys.enviarMensagemComBotoes,
  enviarImagem: baileys.enviarImagem,
  enviarConfirmacao: baileys.enviarConfirmacao,
  obterEstado: baileys.obterEstado,
  obterQR: baileys.obterQR,
  desconectar: baileys.desconectarWhatsApp,
  verificarNumero: baileys.verificarNumeroWhatsApp,
  iniciar: baileys.iniciarWhatsApp,
};

/**
 * Provider Cloud API (Meta Business Platform).
 * Implementação preparatória — requer WHATSAPP_CLOUD_* no .env
 * 
 * Vantagens do Cloud API:
 * - Reply Buttons (até 3 botões) funcionam nativamente
 * - List Messages (até 10 seções, 10 itens cada) funcionam nativamente
 * - WhatsApp Flows (formulários multi-step) suportados
 * - Sem necessidade de manter sessão/QR
 * 
 * Requisitos:
 *   WHATSAPP_CLOUD_TOKEN=<access_token>
 *   WHATSAPP_CLOUD_PHONE_ID=<phone_number_id>
 *   WHATSAPP_CLOUD_WEBHOOK_TOKEN=<verify_token>
 */
const cloudApiProvider = {
  provider: "cloud_api",

  async enviarTexto(jid, texto) {
    const phoneNumber = jid.replace(/@.*$/, "");
    await cloudApiRequest("messages", {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "text",
      text: { body: texto },
    });
  },

  async enviarPoll(jid, pergunta, opcoes, ids = null) {
    // Cloud API não tem poll nativa — usar Reply Buttons (≤3) ou List (>3)
    const phoneNumber = jid.replace(/@.*$/, "");
    const mappedIds = ids || opcoes.map((_, i) => String(i + 1));
    if (opcoes.length <= 3) {
      // Reply Buttons — máximo 3 botões
      await cloudApiRequest("messages", {
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: pergunta },
          action: {
            buttons: opcoes.map((op, i) => ({
              type: "reply",
              reply: {
                id: mappedIds[i],
                title: op.substring(0, 20), // max 20 chars
              },
            })),
          },
        },
      });
    } else {
      // List Message — até 10 itens
      await cloudApiRequest("messages", {
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "interactive",
        interactive: {
          type: "list",
          body: { text: pergunta },
          action: {
            button: "Ver opções",
            sections: [{
              title: "Opções",
              rows: opcoes.map((op, i) => ({
                id: ids?.[i] || String(i + 1),
                title: op.substring(0, 24), // max 24 chars
              })),
            }],
          },
        },
      });
    }
  },

  async enviarLista(jid, corpo, textoBotao, secoes, extras = {}) {
    const phoneNumber = jid.replace(/@.*$/, "");
    await cloudApiRequest("messages", {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "interactive",
      interactive: {
        type: "list",
        header: extras.titulo ? { type: "text", text: extras.titulo } : undefined,
        body: { text: corpo },
        footer: extras.rodape ? { text: extras.rodape } : undefined,
        action: {
          button: textoBotao,
          sections: secoes.map(sec => ({
            title: sec.titulo || "Opções",
            rows: sec.opcoes.map(op => ({
              id: op.id,
              title: op.titulo.substring(0, 24),
              description: op.descricao?.substring(0, 72) || undefined,
            })),
          })),
        },
      },
    });
  },

  async enviarBotoes(jid, texto, botoes) {
    const phoneNumber = jid.replace(/@.*$/, "");
    const buttons = botoes.slice(0, 3).map(b => ({
      type: "reply",
      reply: { id: b.id || b.buttonId, title: (b.texto || b.buttonText?.displayText || "").substring(0, 20) },
    }));
    await cloudApiRequest("messages", {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: texto },
        action: { buttons },
      },
    });
  },

  async enviarImagem(jid, buffer, caption = "") {
    const phoneNumber = jid.replace(/@.*$/, "");
    // Cloud API requer upload prévio ou URL pública
    // Para MVP, converter buffer em base64 e usar upload
    const mediaId = await uploadMedia(buffer, "image/jpeg");
    await cloudApiRequest("messages", {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "image",
      image: { id: mediaId, caption },
    });
  },

  async enviarConfirmacao(jid, pergunta, opcoes) {
    // Cloud API: usar Reply Buttons para confirmação
    return this.enviarBotoes(jid, pergunta, opcoes.slice(0, 3));
  },

  obterEstado() {
    return { status: "conectado", provider: "cloud_api", numero: process.env.WHATSAPP_CLOUD_PHONE_ID };
  },

  obterQR() { return null; }, // Cloud API não usa QR

  async desconectar() { /* noop — Cloud API é stateless */ },

  async verificarNumero(numero) {
    // Cloud API não tem onWhatsApp — assume que existe
    return { exists: true, jid: `${numero}@s.whatsapp.net`, nome: null };
  },

  async iniciar(callback) {
    // Cloud API: webhook recebe mensagens (configurado no controller)
    console.log("☁️  [WhatsApp Cloud API] Provider ativo. Configure o webhook em /whatsapp/webhook");
    return { provider: "cloud_api" };
  },
};

// ─── Cloud API HTTP helpers ────────────────────────────────────────────────────

const CLOUD_API_BASE = "https://graph.facebook.com/v21.0";

async function cloudApiRequest(endpoint, body) {
  const phoneId = process.env.WHATSAPP_CLOUD_PHONE_ID;
  const token = process.env.WHATSAPP_CLOUD_TOKEN;
  if (!phoneId || !token) throw new Error("Cloud API não configurada (WHATSAPP_CLOUD_PHONE_ID / WHATSAPP_CLOUD_TOKEN)");

  const url = `${CLOUD_API_BASE}/${phoneId}/${endpoint}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Cloud API error ${res.status}: ${JSON.stringify(err.error || err)}`);
  }
  return res.json();
}

async function uploadMedia(buffer, mimeType) {
  const phoneId = process.env.WHATSAPP_CLOUD_PHONE_ID;
  const token = process.env.WHATSAPP_CLOUD_TOKEN;
  const url = `${CLOUD_API_BASE}/${phoneId}/media`;

  const formData = new FormData();
  formData.append("messaging_product", "whatsapp");
  formData.append("type", mimeType);
  formData.append("file", new Blob([buffer], { type: mimeType }), "file");

  const res = await fetch(url, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) throw new Error(`Upload media failed: ${res.status}`);
  const data = await res.json();
  return data.id;
}

// ─── Provider selector ─────────────────────────────────────────────────────────

const PROVIDER = process.env.WHATSAPP_PROVIDER || "baileys";

/** @type {TransportProvider} */
let activeProvider;

if (PROVIDER === "cloud_api") {
  activeProvider = cloudApiProvider;
} else {
  activeProvider = baileysProvider;
}

export default activeProvider;
export { activeProvider as transport, baileysProvider, cloudApiProvider };
