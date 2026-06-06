import { Router } from "express";
import { iniciarWhatsApp, getStatus, enviarMensagem, enviarBotoes, desconectar } from "./connection.js";
import { WhatsAppSessao } from "./models/sessao.model.js";

export const whatsappRouter = Router();

// POST /api/whatsapp/iniciar — Inicia conexão (gera QR)
whatsappRouter.post("/iniciar", async (req, res) => {
  try {
    if (process.env.WHATSAPP_ENABLED !== "true") {
      return res.status(400).json({ erro: "WhatsApp desabilitado. Configure WHATSAPP_ENABLED=true" });
    }
    await iniciarWhatsApp();
    res.json({ sucesso: true, mensagem: "WhatsApp iniciando. Verifique o terminal para QR Code." });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/whatsapp/status — Status da conexão
whatsappRouter.get("/status", (req, res) => {
  res.json(getStatus());
});

// POST /api/whatsapp/send — Enviar mensagem manual
whatsappRouter.post("/send", async (req, res) => {
  try {
    const { telefone, mensagem } = req.body;
    if (!telefone || !mensagem) {
      return res.status(400).json({ erro: "Campos 'telefone' e 'mensagem' são obrigatórios" });
    }
    await enviarMensagem(telefone, mensagem);
    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /api/whatsapp/send-buttons — Enviar com botões
whatsappRouter.post("/send-buttons", async (req, res) => {
  try {
    const { telefone, texto, botoes } = req.body;
    if (!telefone || !texto || !botoes) {
      return res.status(400).json({ erro: "Campos 'telefone', 'texto' e 'botoes' são obrigatórios" });
    }
    await enviarBotoes(telefone, texto, botoes);
    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/whatsapp/sessoes — Listar sessões ativas
whatsappRouter.get("/sessoes", async (req, res) => {
  try {
    const sessoes = await WhatsAppSessao.find({ ativo: true })
      .select("telefone nome estado ultimaMensagem lgpdAceito")
      .sort({ ultimaMensagem: -1 })
      .lean();
    res.json(sessoes);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/whatsapp/sessao/:telefone — Detalhes da sessão
whatsappRouter.get("/sessao/:telefone", async (req, res) => {
  try {
    const sessao = await WhatsAppSessao.findOne({ telefone: req.params.telefone }).lean();
    if (!sessao) return res.status(404).json({ erro: "Sessão não encontrada" });
    res.json(sessao);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// DELETE /api/whatsapp/sessao/:telefone — Encerrar sessão
whatsappRouter.delete("/sessao/:telefone", async (req, res) => {
  try {
    await WhatsAppSessao.findOneAndUpdate(
      { telefone: req.params.telefone },
      { ativo: false, estado: "encerrado" }
    );
    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /api/whatsapp/desconectar — Desconectar WhatsApp
whatsappRouter.post("/desconectar", async (req, res) => {
  try {
    await desconectar();
    res.json({ sucesso: true, mensagem: "WhatsApp desconectado" });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});
