/**
 * crm-controller.js
 * API endpoints para gestão de Contatos e Clientes (CRM)
 */

import { Contato } from "./models/contato.model.js";
import { Cliente } from "./models/cliente.model.js";

// ─── CONTATOS ─────────────────────────────────────────────

/**
 * GET /api/crm/contatos — Lista contatos com filtros e paginação
 * Query: ?page=1&limit=50&q=nome&estado=GO&tag=decisor&cliente=goiania&classificacao=ativo
 */
export async function listarContatos(req, res) {
  try {
    const { page = 1, limit = 50, q, estado, tag, cliente, classificacao, produto } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const filtro = { ativo: true };
    if (q) filtro.$text = { $search: q };
    if (estado) filtro.estado = estado.toUpperCase();
    if (tag) filtro.tags = tag;
    if (cliente) filtro.clienteId = cliente;
    if (classificacao) filtro.classificacao = classificacao;
    if (produto) filtro.produtos = produto;
    
    const [contatos, total] = await Promise.all([
      Contato.find(filtro).sort({ score: -1, nome: 1 }).skip(skip).limit(parseInt(limit)).lean(),
      Contato.countDocuments(filtro),
    ]);
    
    res.json({ total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), contatos });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

/**
 * GET /api/crm/contatos/:telefone — Detalhe de um contato
 */
export async function detalheContato(req, res) {
  try {
    const contato = await Contato.findOne({ 
      $or: [
        { telefone: req.params.telefone },
        { telefoneLimpo: req.params.telefone }
      ]
    }).lean();
    if (!contato) return res.status(404).json({ erro: "Contato não encontrado" });
    res.json(contato);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

/**
 * PUT /api/crm/contatos/:telefone — Atualizar contato (enriquecimento manual)
 */
export async function atualizarContato(req, res) {
  try {
    const { tags, grupo, clienteId, clienteNome, produtos, email, cargo, empresa, classificacao } = req.body;
    const update = { atualizadoEm: new Date() };
    
    if (tags !== undefined) update.tags = tags;
    if (grupo !== undefined) update.grupo = grupo;
    if (clienteId !== undefined) update.clienteId = clienteId;
    if (clienteNome !== undefined) update.clienteNome = clienteNome;
    if (produtos !== undefined) update.produtos = produtos;
    if (email !== undefined) update.email = email;
    if (cargo !== undefined) update.cargo = cargo;
    if (empresa !== undefined) update.empresa = empresa;
    if (classificacao !== undefined) update.classificacao = classificacao;
    
    const contato = await Contato.findOneAndUpdate(
      { $or: [{ telefone: req.params.telefone }, { telefoneLimpo: req.params.telefone }] },
      { $set: update },
      { new: true }
    ).lean();
    
    if (!contato) return res.status(404).json({ erro: "Contato não encontrado" });
    res.json(contato);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

/**
 * GET /api/crm/contatos/stats — Estatísticas gerais dos contatos
 */
export async function statsContatos(req, res) {
  try {
    const [total, porEstado, porClassificacao, porProduto, comCliente] = await Promise.all([
      Contato.countDocuments({ ativo: true }),
      Contato.aggregate([
        { $match: { ativo: true } },
        { $group: { _id: "$estado", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 }
      ]),
      Contato.aggregate([
        { $match: { ativo: true } },
        { $group: { _id: "$classificacao", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Contato.aggregate([
        { $match: { ativo: true, produtos: { $ne: [] } } },
        { $unwind: "$produtos" },
        { $group: { _id: "$produtos", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Contato.countDocuments({ ativo: true, clienteId: { $ne: null } }),
    ]);
    
    res.json({
      total,
      comCliente,
      semCliente: total - comCliente,
      porEstado,
      porClassificacao,
      porProduto,
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

// ─── CLIENTES ─────────────────────────────────────────────

/**
 * GET /api/crm/clientes — Lista todos os clientes
 */
export async function listarClientes(req, res) {
  try {
    const { status, produto } = req.query;
    const filtro = { ativo: true };
    if (status) filtro.statusContrato = status;
    if (produto) filtro.produtos = produto;
    
    const clientes = await Cliente.find(filtro).sort({ nome: 1 }).lean();
    res.json({ total: clientes.length, clientes });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

/**
 * POST /api/crm/clientes — Criar cliente
 */
export async function criarCliente(req, res) {
  try {
    const cliente = await Cliente.create(req.body);
    res.status(201).json(cliente);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ erro: "Cliente com esse slug já existe" });
    res.status(500).json({ erro: err.message });
  }
}

/**
 * PUT /api/crm/clientes/:slug — Atualizar cliente
 */
export async function atualizarCliente(req, res) {
  try {
    const cliente = await Cliente.findOneAndUpdate(
      { slug: req.params.slug },
      { $set: req.body },
      { new: true }
    ).lean();
    if (!cliente) return res.status(404).json({ erro: "Cliente não encontrado" });
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

/**
 * GET /api/crm/clientes/:slug/contatos — Contatos de um cliente
 */
export async function contatosDoCliente(req, res) {
  try {
    const contatos = await Contato.find({ clienteId: req.params.slug, ativo: true })
      .sort({ score: -1, nome: 1 }).lean();
    res.json({ total: contatos.length, contatos });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

// ─── BUSCA INTELIGENTE ────────────────────────────────────

/**
 * GET /api/crm/busca?q=texto — Busca full-text em contatos e clientes
 */
export async function buscaCRM(req, res) {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.status(400).json({ erro: "Query deve ter pelo menos 2 caracteres" });
    
    // Busca por telefone (exato)
    const porTelefone = await Contato.findOne({
      $or: [
        { telefone: { $regex: q.replace(/\D/g, "") } },
        { telefoneLimpo: { $regex: q.replace(/\D/g, "") } }
      ]
    }).lean();
    
    // Busca por nome (text search)
    const porNome = await Contato.find({ $text: { $search: q } })
      .sort({ score: { $meta: "textScore" } }).limit(20).lean();
    
    // Busca em clientes
    const clientes = await Cliente.find({ $text: { $search: q } })
      .sort({ score: { $meta: "textScore" } }).limit(10).lean();
    
    res.json({
      exato: porTelefone || null,
      contatos: porNome,
      clientes,
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}
