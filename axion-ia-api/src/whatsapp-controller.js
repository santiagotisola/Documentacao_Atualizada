/**
 * whatsapp-controller.js
 * Endpoints REST para gerenciar a integração WhatsApp via painel.
 */

import { iniciarWhatsApp, enviarMensagem, obterEstado, obterQR } from "./services/whatsapp.service.js";
import { processarMensagemWA } from "./whatsapp-flow.js";
import { WhatsAppSessao } from "./models/whatsapp-sessao.model.js";

let inicializado = false;

/**
 * POST /api/whatsapp/iniciar — Inicia a conexão WhatsApp (exibe QR no terminal)
 */
export async function iniciarConexao(req, res) {
  if (inicializado) {
    return res.json({ ok: true, mensagem: "WhatsApp já está iniciado", estado: obterEstado() });
  }
  try {
    inicializado = true;
    iniciarWhatsApp(processarMensagemWA).catch(err => {
      console.error("❌ [WhatsApp] Falha ao iniciar:", err.message);
      inicializado = false;
    });
    res.json({ ok: true, mensagem: "Iniciando WhatsApp... Verifique o QR code no terminal da API.", estado: obterEstado() });
  } catch (err) {
    inicializado = false;
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
