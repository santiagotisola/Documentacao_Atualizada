import makeWASocket, { useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys";
import qrcode from "qrcode-terminal";
import { processarMensagem } from "./flow.js";

let sock = null;
let statusConexao = "desconectado";
let qrAtual = null;

/**
 * Inicia conexão com WhatsApp via Baileys
 */
export async function iniciarWhatsApp() {
  const authDir = process.env.WHATSAPP_AUTH_DIR || "./whatsapp-auth";
  const { state, saveCreds } = await useMultiFileAuthState(authDir);

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  });

  // Evento: atualização de conexão
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrAtual = qr;
      statusConexao = "aguardando_qr";
      qrcode.generate(qr, { small: true });
      console.log("📱 QR Code gerado — escaneie com o WhatsApp");
    }

    if (connection === "open") {
      statusConexao = "conectado";
      qrAtual = null;
      console.log("✅ WhatsApp conectado!");
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      statusConexao = "desconectado";
      
      if (reason !== DisconnectReason.loggedOut) {
        console.log("🔄 Reconectando WhatsApp...");
        setTimeout(iniciarWhatsApp, 3000);
      } else {
        console.log("⚠️ WhatsApp deslogado. Necessário novo QR.");
      }
    }
  });

  // Evento: salvar credenciais
  sock.ev.on("creds.update", saveCreds);

  // Evento: mensagem recebida
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      if (msg.key.fromMe) continue; // Ignorar mensagens próprias

      const telefone = msg.key.remoteJid.replace("@s.whatsapp.net", "");
      const nome = msg.pushName || "";
      const texto = msg.message?.conversation 
        || msg.message?.extendedTextMessage?.text 
        || "";
      const tipoMsg = msg.message?.imageMessage ? "image" 
        : msg.message?.audioMessage ? "audio" 
        : msg.message?.documentMessage ? "document" 
        : "text";

      if (texto || tipoMsg !== "text") {
        await processarMensagem(telefone, nome, texto, { tipo: tipoMsg, msg, remoteJid: msg.key.remoteJid });
      }
    }
  });

  return sock;
}

/**
 * Envia mensagem de texto para um número
 */
export async function enviarMensagem(telefone, texto) {
  if (!sock || statusConexao !== "conectado") {
    throw new Error("WhatsApp não conectado");
  }
  const jid = telefone.includes("@") ? telefone : `${telefone}@s.whatsapp.net`;
  await sock.sendMessage(jid, { text: texto });
}

/**
 * Envia mensagem com botões
 */
export async function enviarBotoes(telefone, texto, botoes) {
  if (!sock || statusConexao !== "conectado") {
    throw new Error("WhatsApp não conectado");
  }
  const jid = telefone.includes("@") ? telefone : `${telefone}@s.whatsapp.net`;
  
  // Baileys v7: botões via lista
  const sections = [{
    title: "Opções",
    rows: botoes.map((b, i) => ({ title: b.texto || b, rowId: b.id || `btn_${i}` }))
  }];

  await sock.sendMessage(jid, {
    text: texto,
    footer: "Selecione uma opção",
    title: "",
    buttonText: "Ver opções",
    sections
  });
}

/**
 * Retorna status da conexão
 */
export function getStatus() {
  return { status: statusConexao, qrDisponivel: !!qrAtual };
}

/**
 * Desconecta WhatsApp
 */
export async function desconectar() {
  if (sock) {
    await sock.logout();
    sock = null;
    statusConexao = "desconectado";
  }
}
