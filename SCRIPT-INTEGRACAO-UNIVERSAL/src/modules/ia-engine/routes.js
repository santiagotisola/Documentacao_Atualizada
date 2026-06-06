import { Router } from "express";
import { gerarResposta, treinar } from "./engine.js";
import { KB } from "./models/kb.model.js";
import { Log } from "./models/log.model.js";

export const iaRouter = Router();

// POST /api/ia/chat — Endpoint principal de conversação
iaRouter.post("/chat", async (req, res) => {
  try {
    const { mensagem, sessionId, modulo } = req.body;
    if (!mensagem) return res.status(400).json({ erro: "Campo 'mensagem' é obrigatório" });

    const resultado = await gerarResposta(mensagem, { sessionId, modulo });
    res.json(resultado);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /api/ia/treinar — Adicionar conhecimento à KB
iaRouter.post("/treinar", async (req, res) => {
  try {
    const { pergunta, resposta, modulo, tags } = req.body;
    if (!pergunta || !resposta) {
      return res.status(400).json({ erro: "Campos 'pergunta' e 'resposta' são obrigatórios" });
    }

    const entrada = await treinar({ pergunta, resposta, modulo, tags });
    res.json({ sucesso: true, id: entrada._id, mensagem: "Conhecimento adicionado com sucesso" });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/ia/kb — Listar Knowledge Base
iaRouter.get("/kb", async (req, res) => {
  try {
    const { modulo, page = 1, limit = 50 } = req.query;
    const filtro = { ativo: true };
    if (modulo) filtro.modulo = modulo;

    const total = await KB.countDocuments(filtro);
    const dados = await KB.find(filtro)
      .select("-embedding")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.json({ dados, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// DELETE /api/ia/kb/:id — Remover entrada da KB
iaRouter.delete("/kb/:id", async (req, res) => {
  try {
    await KB.findByIdAndUpdate(req.params.id, { ativo: false });
    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/ia/logs — Histórico de conversas
iaRouter.get("/logs", async (req, res) => {
  try {
    const { sessionId, desde, ate, page = 1, limit = 100 } = req.query;
    const filtro = {};
    if (sessionId) filtro.sessionId = sessionId;
    if (desde || ate) {
      filtro.createdAt = {};
      if (desde) filtro.createdAt.$gte = new Date(desde);
      if (ate) filtro.createdAt.$lte = new Date(ate);
    }

    const dados = await Log.find(filtro)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.json({ dados, total: await Log.countDocuments(filtro) });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/ia/stats — Estatísticas da KB
iaRouter.get("/stats", async (req, res) => {
  try {
    const totalKB = await KB.countDocuments({ ativo: true });
    const porModulo = await KB.aggregate([
      { $match: { ativo: true } },
      { $group: { _id: "$modulo", count: { $sum: 1 } } }
    ]);
    const logsHoje = await Log.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    res.json({ totalKB, porModulo, logsHoje });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});
