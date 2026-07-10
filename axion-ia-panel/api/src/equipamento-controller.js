/**
 * equipamento-controller.js
 * CRUD + consultas para inventário de equipamentos (ZeroTier/AnyDesk)
 */

import { Equipamento } from "./models/equipamento.model.js";

// ─── LISTAGEM ────────────────────────────────────────────────

/**
 * GET /api/crm/equipamentos
 * Query: ?page=1&limit=50&cliente=economia&status=ativo&uf=GO&tipo=ocr&q=texto
 */
export async function listarEquipamentosCRM(req, res) {
  try {
    const { page = 1, limit = 50, cliente, status, uf, tipo, fabricante, q } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filtro = {};
    if (cliente) filtro.clienteSlug = cliente;
    if (status) filtro.status = status;
    if (uf) filtro.uf = uf.toUpperCase();
    if (tipo) filtro.tipo = tipo;
    if (fabricante) filtro.fabricante = fabricante;
    if (q) filtro.$text = { $search: q };

    const [equipamentos, total] = await Promise.all([
      Equipamento.find(filtro).sort({ clienteSlug: 1, alias: 1 }).skip(skip).limit(parseInt(limit)).lean(),
      Equipamento.countDocuments(filtro),
    ]);

    res.json({ equipamentos, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

/**
 * GET /api/crm/equipamentos/stats
 * KPIs: total, por cliente, por UF, por status, por fabricante
 */
export async function statsEquipamentos(req, res) {
  try {
    const [total, porCliente, porUf, porStatus, porFabricante, porTipo] = await Promise.all([
      Equipamento.countDocuments(),
      Equipamento.aggregate([{ $group: { _id: "$clienteSlug", total: { $sum: 1 } } }, { $sort: { total: -1 } }]),
      Equipamento.aggregate([{ $group: { _id: "$uf", total: { $sum: 1 } } }, { $sort: { total: -1 } }]),
      Equipamento.aggregate([{ $group: { _id: "$status", total: { $sum: 1 } } }]),
      Equipamento.aggregate([{ $group: { _id: "$fabricante", total: { $sum: 1 } } }]),
      Equipamento.aggregate([{ $group: { _id: "$tipo", total: { $sum: 1 } } }]),
    ]);

    const naRede = await Equipamento.countDocuments({ redeAxion: true });
    const comZabbix = await Equipamento.countDocuments({ zabbix: "OK" });

    res.json({ total, naRede, comZabbix, porCliente, porUf, porStatus, porFabricante, porTipo });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

// ─── DETALHE ─────────────────────────────────────────────────

/**
 * GET /api/crm/equipamentos/:alias
 */
export async function detalheEquipamento(req, res) {
  try {
    const eq = await Equipamento.findOne({ alias: req.params.alias }).lean();
    if (!eq) return res.status(404).json({ erro: "Equipamento não encontrado" });
    res.json(eq);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

// ─── ATUALIZAR ───────────────────────────────────────────────

/**
 * PUT /api/crm/equipamentos/:alias
 */
export async function atualizarEquipamento(req, res) {
  try {
    const updates = {};
    const allowed = ["tipo", "fabricante", "zerotierNodeId", "zerotierIp", "redeAxion", "anydeskAlias", "anydeskId", "porta", "zabbix", "status", "observacoes", "uf", "clienteSlug"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const eq = await Equipamento.findOneAndUpdate({ alias: req.params.alias }, { $set: updates }, { new: true }).lean();
    if (!eq) return res.status(404).json({ erro: "Equipamento não encontrado" });
    res.json(eq);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

// ─── POR CLIENTE ─────────────────────────────────────────────

/**
 * GET /api/crm/clientes/:slug/equipamentos
 */
export async function equipamentosDoCliente(req, res) {
  try {
    const equipamentos = await Equipamento.find({ clienteSlug: req.params.slug }).sort({ alias: 1 }).lean();
    res.json({ clienteSlug: req.params.slug, total: equipamentos.length, equipamentos });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

// ─── BUSCA ───────────────────────────────────────────────────

/**
 * GET /api/crm/equipamentos/busca?q=texto
 * Busca por alias, IP ZeroTier, AnyDesk ID ou observações
 */
export async function buscaEquipamento(req, res) {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ erro: "Parâmetro q obrigatório" });

    // Tentar busca exata por IP ou alias primeiro
    let resultados = await Equipamento.find({
      $or: [
        { alias: { $regex: q, $options: "i" } },
        { zerotierIp: q },
        { zerotierNodeId: { $regex: q, $options: "i" } },
        { anydeskId: { $regex: q, $options: "i" } },
        { anydeskAlias: { $regex: q, $options: "i" } },
      ]
    }).limit(20).lean();

    // Se não encontrou, tenta text search
    if (resultados.length === 0) {
      resultados = await Equipamento.find({ $text: { $search: q } }).limit(20).lean();
    }

    res.json({ q, total: resultados.length, resultados });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}
