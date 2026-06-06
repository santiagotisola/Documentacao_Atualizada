import { Router } from "express";
import mongoose from "mongoose";

export const crmRouter = Router();

// ============================================
// MODEL — Contato CRM
// ============================================
const contatoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  telefone: { type: String, index: true },
  email: String,
  empresa: String,
  tags: [String],
  segmento: String,
  origem: { type: String, enum: ["whatsapp", "helpdesk", "manual", "importacao"], default: "manual" },
  dados_extra: mongoose.Schema.Types.Mixed,
  historico: [{
    tipo: { type: String, enum: ["mensagem", "ticket", "nota", "ligacao", "email"] },
    resumo: String,
    data: { type: Date, default: Date.now },
    referencia_id: String
  }],
  ultimo_contato: Date,
  score: { type: Number, default: 0 },
  ativo: { type: Boolean, default: true }
}, { timestamps: true });

contatoSchema.index({ nome: "text", empresa: "text", email: "text" });

const Contato = mongoose.models.Contato || mongoose.model("Contato", contatoSchema);

// ============================================
// ROTAS CRUD
// ============================================

// GET /api/crm/contatos — Listar com filtros
crmRouter.get("/contatos", async (req, res) => {
  try {
    const { pagina = 1, limite = 50, busca, segmento, tag, origem } = req.query;
    const filtro = { ativo: true };

    if (busca) filtro.$text = { $search: busca };
    if (segmento) filtro.segmento = segmento;
    if (tag) filtro.tags = tag;
    if (origem) filtro.origem = origem;

    const skip = (parseInt(pagina) - 1) * parseInt(limite);
    const [contatos, total] = await Promise.all([
      Contato.find(filtro).sort({ ultimo_contato: -1 }).skip(skip).limit(parseInt(limite)).lean(),
      Contato.countDocuments(filtro)
    ]);

    res.json({ contatos, total, pagina: parseInt(pagina), paginas: Math.ceil(total / parseInt(limite)) });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/crm/contatos/:id — Detalhe com histórico
crmRouter.get("/contatos/:id", async (req, res) => {
  try {
    const contato = await Contato.findById(req.params.id).lean();
    if (!contato) return res.status(404).json({ erro: "Contato não encontrado" });
    res.json(contato);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /api/crm/contatos — Criar contato
crmRouter.post("/contatos", async (req, res) => {
  try {
    const { nome, telefone, email, empresa, tags, segmento, origem, dados_extra } = req.body;
    if (!nome) return res.status(400).json({ erro: "nome é obrigatório" });

    // Verificar duplicata por telefone
    if (telefone) {
      const existente = await Contato.findOne({ telefone, ativo: true });
      if (existente) return res.status(409).json({ erro: "Telefone já cadastrado", contato_id: existente._id });
    }

    const contato = await Contato.create({ nome, telefone, email, empresa, tags, segmento, origem, dados_extra });
    res.status(201).json(contato);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// PUT /api/crm/contatos/:id — Atualizar
crmRouter.put("/contatos/:id", async (req, res) => {
  try {
    const { nome, telefone, email, empresa, tags, segmento, dados_extra } = req.body;
    const contato = await Contato.findByIdAndUpdate(
      req.params.id,
      { $set: { nome, telefone, email, empresa, tags, segmento, dados_extra } },
      { new: true, runValidators: true }
    );
    if (!contato) return res.status(404).json({ erro: "Contato não encontrado" });
    res.json(contato);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// DELETE /api/crm/contatos/:id — Soft delete
crmRouter.delete("/contatos/:id", async (req, res) => {
  try {
    await Contato.findByIdAndUpdate(req.params.id, { ativo: false });
    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ============================================
// HISTÓRICO UNIFICADO
// ============================================

// POST /api/crm/contatos/:id/historico — Adicionar evento
crmRouter.post("/contatos/:id/historico", async (req, res) => {
  try {
    const { tipo, resumo, referencia_id } = req.body;
    if (!tipo || !resumo) return res.status(400).json({ erro: "tipo e resumo obrigatórios" });

    const contato = await Contato.findByIdAndUpdate(
      req.params.id,
      {
        $push: { historico: { tipo, resumo, referencia_id, data: new Date() } },
        $set: { ultimo_contato: new Date() }
      },
      { new: true }
    );
    if (!contato) return res.status(404).json({ erro: "Contato não encontrado" });
    res.json({ sucesso: true, historico: contato.historico.slice(-10) });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ============================================
// BUSCA POR TELEFONE (usado pelo WhatsApp)
// ============================================

// GET /api/crm/buscar-telefone/:telefone
crmRouter.get("/buscar-telefone/:telefone", async (req, res) => {
  try {
    const telefone = req.params.telefone.replace(/\D/g, "");
    const contato = await Contato.findOne({
      telefone: { $regex: telefone.slice(-8) },
      ativo: true
    }).lean();

    if (!contato) return res.status(404).json({ encontrado: false });
    res.json({ encontrado: true, contato });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ============================================
// SEGMENTAÇÃO
// ============================================

// GET /api/crm/segmentos — Listar segmentos com contagem
crmRouter.get("/segmentos", async (req, res) => {
  try {
    const segmentos = await Contato.aggregate([
      { $match: { ativo: true } },
      { $group: { _id: "$segmento", total: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);
    res.json(segmentos.map(s => ({ segmento: s._id || "Sem segmento", total: s.total })));
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /api/crm/segmentar — Aplicar segmento a múltiplos contatos
crmRouter.post("/segmentar", async (req, res) => {
  try {
    const { contato_ids, segmento } = req.body;
    if (!contato_ids?.length || !segmento) {
      return res.status(400).json({ erro: "contato_ids e segmento obrigatórios" });
    }

    const resultado = await Contato.updateMany(
      { _id: { $in: contato_ids } },
      { $set: { segmento } }
    );
    res.json({ sucesso: true, modificados: resultado.modifiedCount });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ============================================
// ESTATÍSTICAS
// ============================================

// GET /api/crm/stats
crmRouter.get("/stats", async (req, res) => {
  try {
    const [total, por_origem, por_segmento, recentes] = await Promise.all([
      Contato.countDocuments({ ativo: true }),
      Contato.aggregate([
        { $match: { ativo: true } },
        { $group: { _id: "$origem", total: { $sum: 1 } } }
      ]),
      Contato.aggregate([
        { $match: { ativo: true } },
        { $group: { _id: "$segmento", total: { $sum: 1 } } },
        { $sort: { total: -1 } },
        { $limit: 10 }
      ]),
      Contato.countDocuments({
        ativo: true,
        ultimo_contato: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
    ]);

    res.json({ total, ativos_7dias: recentes, por_origem, por_segmento });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});
