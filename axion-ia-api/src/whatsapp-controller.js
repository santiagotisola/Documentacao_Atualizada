/**
 * whatsapp-controller.js
 * Endpoints REST para gerenciar a integração WhatsApp via painel.
 */

import { iniciarWhatsApp, enviarMensagem, enviarMensagemComBotoes, obterEstado, obterQR, desconectarWhatsApp } from "./services/whatsapp.service.js";
import { processarMensagemWA } from "./whatsapp-flow.js";
import { WhatsAppSessao } from "./models/whatsapp-sessao.model.js";

/**
 * POST /api/whatsapp/iniciar — Inicia a conexão WhatsApp (exibe QR no terminal)
 */
export async function iniciarConexao(req, res) {
  const estado = obterEstado();
  // Se já está conectado ou conectando, não re-iniciar
  if (estado.status === "conectado" || estado.status === "conectando" || estado.status === "qr_pendente") {
    return res.json({ ok: true, mensagem: "WhatsApp já está iniciado", estado });
  }
  try {
    iniciarWhatsApp(processarMensagemWA).catch(err => {
      console.error("❌ [WhatsApp] Falha ao iniciar:", err.message);
    });
    res.json({ ok: true, mensagem: "Iniciando WhatsApp... Verifique o QR code no terminal da API.", estado: obterEstado() });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

/**
 * GET /api/whatsapp/status — Retorna status da conexão
 */
export function statusConexao(req, res) {
  const estado = obterEstado();
  res.json({ ...estado });
}

/**
 * GET /api/whatsapp/sessoes — Lista sessões ativas
 */
export async function listarSessoes(req, res) {
  try {
    const sessoes = await WhatsAppSessao.find({ ativo: true })
      .sort({ ultimaMensagem: -1 })
      .limit(100)
      .lean();
    res.json({ total: sessoes.length, sessoes });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

/**
 * GET /api/whatsapp/sessao/:telefone — Detalhe de uma sessão
 */
export async function detalhesSessao(req, res) {
  try {
    const sessao = await WhatsAppSessao.findOne({ telefone: req.params.telefone }).lean();
    if (!sessao) return res.status(404).json({ erro: "Sessão não encontrada" });
    res.json(sessao);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

/**
 * DELETE /api/whatsapp/sessao/:telefone — Encerra/reseta sessão
 */
export async function encerrarSessao(req, res) {
  try {
    await WhatsAppSessao.updateOne(
      { telefone: req.params.telefone },
      { estado: "encerrado", ativo: false }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

/**
 * POST /api/whatsapp/send — Envia mensagem manual para um número
 * Body: { telefone, mensagem }
 */
export async function enviarManual(req, res) {
  const { telefone, mensagem } = req.body;
  if (!telefone || !mensagem) {
    return res.status(400).json({ erro: "Campos obrigatórios: telefone, mensagem" });
  }
  try {
    await enviarMensagem(telefone, mensagem);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

/**
 * POST /api/whatsapp/send-buttons — Envia mensagem com botões (teste)
 * Body: { telefone, mensagem, botoes: [{id, texto}], rodape? }
 */
export async function enviarComBotoes(req, res) {
  const { telefone, mensagem, botoes, rodape } = req.body;
  if (!telefone || !mensagem || !botoes) {
    return res.status(400).json({ erro: "Campos obrigatórios: telefone, mensagem, botoes" });
  }
  try {
    await enviarMensagemComBotoes(telefone, mensagem, botoes, rodape || "");
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

/**
 * POST /api/whatsapp/desconectar — Desconecta o WhatsApp
 */
export async function desconectar(req, res) {
  try {
    await desconectarWhatsApp();
    res.json({ ok: true, mensagem: "WhatsApp desconectado" });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}
