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
import fs from "fs/promises";
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

  // Garantir que a pasta de auth existe
  await fs.mkdir(AUTH_PATH, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_PATH);
  const { version } = await fetchLatestBaileysVersion();

  // Wrapper com retry para evitar crash por lock de arquivo no Windows
  let salvando = false;
  const saveCredsSafe = async () => {
    if (salvando) return; // evitar escritas simultâneas
    salvando = true;
    for (let i = 0; i < 3; i++) {
      try {
        await saveCreds();
        salvando = false;
        return;
      } catch (err) {
        console.warn(`⚠️  [WhatsApp] Erro ao salvar creds (tentativa ${i + 1}/3):`, err.message);
        await new Promise(r => setTimeout(r, 500 * (i + 1)));
      }
    }
    salvando = false;
    console.error("❌ [WhatsApp] Falha ao salvar credenciais após 3 tentativas");
  };

  estado.status = "conectando";

  sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false, // controlamos manualmente
    browser: ["AxionIA", "Chrome", "1.0"],
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 30000,
  });

  // Salvar credenciais sempre que atualizar (com proteção contra lock)
  sock.ev.on("creds.update", saveCredsSafe);

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

      // Capturar texto de diferentes tipos de mensagem (incluindo botões clicados)
      const texto =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        msg.message.buttonsResponseMessage?.selectedButtonId ||
        msg.message.buttonsResponseMessage?.selectedDisplayText ||
        msg.message.templateButtonReplyMessage?.selectedId ||
        msg.message.templateButtonReplyMessage?.selectedDisplayText ||
        msg.message.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson && JSON.parse(msg.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson)?.id ||
        msg.message.listResponseMessage?.singleSelectReply?.selectedRowId ||
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
 * Envia uma mensagem com botões clicáveis (Quick Reply Buttons).
 * Se os botões falharem (WhatsApp pode bloquear), envia como texto normal.
 * @param {string} telefoneOuJid
 * @param {string} texto - corpo da mensagem
 * @param {{ id: string, texto: string }[]} botoes - array de botões
 * @param {string} [rodape] - texto de rodapé opcional
 */
export async function enviarMensagemComBotoes(telefoneOuJid, texto, botoes, rodape = "") {
  if (!sock || !conectado) {
    throw new Error("WhatsApp não está conectado");
  }
  const jid = telefoneOuJid.includes("@") ? telefoneOuJid : `${telefoneOuJid}@s.whatsapp.net`;

  // Tentar enviar com botões interativos
  try {
    const buttonMessage = {
      text: texto,
      footer: rodape || undefined,
      buttons: botoes.map((b, i) => ({
        buttonId: b.id,
        buttonText: { displayText: b.texto },
        type: 1
      })),
      headerType: 1
    };
    await sock.sendMessage(jid, buttonMessage);
    return;
  } catch (err) {
    console.log(`⚠️ [WhatsApp] Botões não suportados, tentando interactiveMessage...`);
  }

  // Fallback: tentar interactive message (formato mais recente)
  try {
    const interactiveMsg = {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            body: { text: texto },
            footer: rodape ? { text: rodape } : undefined,
            nativeFlowMessage: {
              buttons: botoes.map(b => ({
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({ display_text: b.texto, id: b.id })
              }))
            }
          }
        }
      }
    };
    await sock.relayMessage(jid, interactiveMsg, {});
    return;
  } catch (err2) {
    console.log(`⚠️ [WhatsApp] InteractiveMessage falhou, enviando como texto.`);
  }

  // Fallback final: texto puro
  await sock.sendMessage(jid, { text: texto });
}

/**
 * Envia uma Interactive List Message (modal com seleção tipo radio button).
 * Quando o usuário clica no botão, abre um modal com as opções listadas.
 * A resposta volta como selectedRowId (já capturada pelo handler).
 * 
 * @param {string} telefoneOuJid
 * @param {string} corpo - texto principal da mensagem
 * @param {string} textoBotao - texto do botão que abre o modal (ex: "Ver opções")
 * @param {{ titulo?: string, opcoes: { id: string, titulo: string, descricao?: string }[] }[]} secoes - seções com opções
 * @param {{ titulo?: string, rodape?: string }} [extras] - título e rodapé opcionais
 */
export async function enviarListaSelecao(telefoneOuJid, corpo, textoBotao, secoes, extras = {}) {
  if (!sock || !conectado) throw new Error("WhatsApp não está conectado");
  const jid = telefoneOuJid.includes("@") ? telefoneOuJid : `${telefoneOuJid}@s.whatsapp.net`;

  // Texto formatado com opções numeradas (único método confiável no Baileys Web)
  const textoOpcoes = secoes.map(sec => {
    const header = sec.titulo ? `*${sec.titulo}*\n` : "";
    const rows = sec.opcoes.map(op => `*${op.id}* — ${op.titulo}${op.descricao ? ` _(${op.descricao})_` : ""}`).join("\n");
    return header + rows;
  }).join("\n\n");
  await sock.sendMessage(jid, { text: `${corpo}\n\n${textoOpcoes}` });
}

/**
 * Verifica se um número está registrado no WhatsApp e busca o nome do contato.
 * @param {string} numero - número sem @, ex: "5562999998888"
 * @returns {{ exists: boolean, jid: string|null, nome: string|null }}
 */
export async function verificarNumeroWhatsApp(numero) {
  if (!sock || !conectado) throw new Error("WhatsApp não está conectado");
  const jid = numero.includes("@") ? numero : `${numero}@s.whatsapp.net`;
  try {
    const [result] = await sock.onWhatsApp(jid);
    if (!result?.exists) return { exists: false, jid: null, nome: null };

    // Tentar buscar nome do contato no store
    let nome = null;
    try {
      const contactJid = result.jid;
      // Buscar no store de contatos do baileys
      if (sock.store?.contacts?.[contactJid]) {
        nome = sock.store.contacts[contactJid].name || sock.store.contacts[contactJid].notify || null;
      }
      // Fallback: buscar via getBusinessProfile ou status
      if (!nome) {
        const [profile] = await sock.getBusinessProfile(contactJid).catch(() => [null]);
        if (profile?.wid) nome = profile.description || null;
      }
    } catch (_) { /* sem nome disponível */ }

    return { exists: true, jid: result.jid, nome };
  } catch (err) {
    console.error(`⚠️ [WhatsApp] Erro ao verificar número ${numero}:`, err.message);
    return { exists: false, jid: null, nome: null };
  }
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

/**
 * Desconecta o WhatsApp (logout). Será necessário escanear QR novamente.
 */
export async function desconectarWhatsApp() {
  if (sock) {
    try {
      await sock.logout();
    } catch (_) {
      sock.end(new Error("Desconexão manual"));
    }
    sock = null;
    conectado = false;
    qrAtual = null;
    estado.status = "desconectado";
    estado.qr = null;
    estado.qr_base64 = undefined;
    estado.numero = null;
    console.log("🔌 [WhatsApp] Desconectado manualmente");
  }
}
