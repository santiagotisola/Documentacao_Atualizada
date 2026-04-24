/**
 * whatsapp.service.js
 * Gerencia a conexão WhatsApp via Baileys (100% gratuito, sem servidor externo).
 * O QR code aparece no terminal na primeira execução — escanear com o WhatsApp do número de atendimento.
 * A sessão é salva em src/whatsapp-auth/ e reutilizada nos próximos starts.
 */

import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, downloadMediaMessage } from "@whiskeysockets/baileys";
import qrcode from "qrcode-terminal";
import QRCode from "qrcode";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_PATH = path.resolve(__dirname, "..", "whatsapp-auth");

let sock = null;
let conectado = false;
let qrAtual = null;
let onMensagem = null; // callback externo

const estado = {
  status: "desconectado", // desconectado | conectando | qr_pendente | conectado
  qr: null,
  numero: null,
  erros: 0,
};

/**
 * Inicia a conexão WhatsApp.
 * @param {function} callbackMensagem - fn(telefone, nome, texto) chamada ao receber mensagem
 */
export async function iniciarWhatsApp(callbackMensagem) {
  onMensagem = callbackMensagem;

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_PATH);
  const { version } = await fetchLatestBaileysVersion();

  estado.status = "conectando";

  sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false, // controlamos manualmente
    browser: ["AxionIA", "Chrome", "1.0"],
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 30000,
  });

  // Salvar credenciais sempre que atualizar
  sock.ev.on("creds.update", saveCreds);

  // Eventos de conexão
  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      estado.status = "qr_pendente";
      estado.qr = qr;
      qrAtual = qr;
      // Gerar imagem base64 para o painel
      QRCode.toDataURL(qr, { width: 300, margin: 2 }).then(url => {
        estado.qr_base64 = url;
      }).catch(() => {});
      // Também exibir no terminal como fallback
      console.log("\n📱 [WhatsApp] QR code disponível no painel em /whatsapp. Também exibido abaixo:\n");
      qrcode.generate(qr, { small: true });
      console.log("\n");
    }

    if (connection === "open") {
      conectado = true;
      estado.status = "conectado";
      estado.qr = null;
      estado.numero = sock.user?.id?.replace(/:.*@/, "@") || null;
      console.log("✅ [WhatsApp] Conectado como:", estado.numero);
    }

    if (connection === "close") {
      conectado = false;
      estado.status = "desconectado";
      const codigo = lastDisconnect?.error?.output?.statusCode;
      const deveReconectar = codigo !== DisconnectReason.loggedOut;
      console.log("⚠️  [WhatsApp] Desconectado. Código:", codigo, "| Reconectar:", deveReconectar);
      if (deveReconectar) {
        setTimeout(() => iniciarWhatsApp(onMensagem), 5000);
      } else {
        estado.status = "desconectado";
        estado.erros++;
      }
    }
  });

  // Receber mensagens
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const msg of messages) {
      if (msg.key.fromMe) continue; // ignorar mensagens enviadas por nós
      if (!msg.message) continue;

      const remoteJid = msg.key.remoteJid || "";
      // Normaliza telefone para armazenamento (remove sufixos)
      const telefone = remoteJid.replace(/@s\.whatsapp\.net$/, "").replace(/@lid$/, "").replace(/@.*$/, "");
      const nome = msg.pushName || telefone;
      const texto =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        "";

      // Baixar imagem se houver
      let midia = null;
      if (msg.message.imageMessage) {
        try {
          const imgBuffer = await downloadMediaMessage(msg, "buffer", {}, { reuploadRequest: sock.updateMediaMessage });
          midia = {
            buffer: imgBuffer,
            mimeType: msg.message.imageMessage.mimetype || "image/jpeg",
            filename: `foto_${Date.now()}.jpg`,
            downloadOk: true,
          };
          console.log(`🖼️  [WhatsApp] Imagem recebida (${imgBuffer.length} bytes)`);
        } catch (err) {
          console.error("❌ [WhatsApp] Erro ao baixar imagem:", err.message);
          // Marcar que recebemos uma imagem mesmo sem conseguir baixar
          midia = { buffer: null, downloadOk: false, filename: `foto_${Date.now()}.jpg` };
        }
      }

      // Só ignorar se for mensagem completamente vazia (sem texto nem imagem)
      if (!texto.trim() && !midia) continue;

      console.log(`📨 [WhatsApp] ${nome} (${remoteJid}): ${texto || "[imagem]"}`);

      if (onMensagem) {
        try {
          // Passa o remoteJid completo para o flow poder responder corretamente
          await onMensagem(telefone, nome, texto.trim(), midia, remoteJid);
        } catch (err) {
          console.error("❌ [WhatsApp] Erro no callback de mensagem:", err.message);
        }
      }
    }
  });
}

/**
 * Envia uma mensagem de texto para um número ou JID completo.
 * @param {string} telefoneOuJid - número (5511...) ou JID completo (xxx@s.whatsapp.net / xxx@lid)
 * @param {string} texto - mensagem a enviar
 */
export async function enviarMensagem(telefoneOuJid, texto) {
  if (!sock || !conectado) {
    throw new Error("WhatsApp não está conectado");
  }
  // Se já contém @, usar diretamente; senão, montar JID
  const jid = telefoneOuJid.includes("@") ? telefoneOuJid : `${telefoneOuJid}@s.whatsapp.net`;
  await sock.sendMessage(jid, { text: texto });
}

/**
 * Envia uma imagem para um número ou JID completo.
 */
export async function enviarImagem(telefoneOuJid, buffer, caption = "", mimeType = "image/jpeg") {
  if (!sock || !conectado) throw new Error("WhatsApp não está conectado");
  const jid = telefoneOuJid.includes("@") ? telefoneOuJid : `${telefoneOuJid}@s.whatsapp.net`;
  await sock.sendMessage(jid, { image: buffer, caption, mimetype: mimeType });
}

/**
 * Retorna o estado atual da conexão (para o painel)
 */
export function obterEstado() {
  return { ...estado };
}

/**
 * Retorna o QR code atual (base64 ou string) para exibir no painel
 */
export function obterQR() {
  return qrAtual;
}
