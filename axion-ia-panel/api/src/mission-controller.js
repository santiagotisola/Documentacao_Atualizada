/**
 * mission-controller.js
 * Mission Engine — CRUD + execução de missões operacionais
 *
 * Operações suportadas:
 *   Audit, Deployment, Migration, Training, Support,
 *   Validation, Comparison, Monitoring, Homologation, Investigation
 */

import { Mission } from "./models/mission.model.js";
import { Cliente } from "./models/cliente.model.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function tratar(err, res, msg = "Erro interno") {
  console.error(`[Mission] ${msg}:`, err.message);
  return res.status(500).json({ erro: msg, detalhe: err.message });
}

// ─── LISTAR ──────────────────────────────────────────────────────────────────

export async function listarMissions(req, res) {
  try {
    const { tipo, status, clienteSlug, agente, page = 1, limit = 20 } = req.query;
    const filtro = {};
    if (tipo)        filtro.tipo = tipo;
    if (status)      filtro.status = status;
    if (clienteSlug) filtro.clienteSlug = clienteSlug;
    if (agente)      filtro.agente = agente;

    const total = await Mission.countDocuments(filtro);
    const missions = await Mission.find(filtro)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select("-evidencias.base64"); // não retornar base64 na listagem

    res.json({ total, pagina: Number(page), missions });
  } catch (err) { tratar(err, res, "Erro ao listar missões"); }
}

// ─── DETALHE ─────────────────────────────────────────────────────────────────

export async function detalheMission(req, res) {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) return res.status(404).json({ erro: "Missão não encontrada" });
    res.json(mission);
  } catch (err) { tratar(err, res, "Erro ao buscar missão"); }
}

// ─── CRIAR ───────────────────────────────────────────────────────────────────

export async function criarMission(req, res) {
  try {
    const { titulo, tipo, clienteSlug, produto, descricao, responsavel, agente, config, tags } = req.body;

    if (!titulo || !tipo || !clienteSlug) {
      return res.status(400).json({ erro: "titulo, tipo e clienteSlug são obrigatórios" });
    }

    // Busca nome do cliente
    let clienteNome = clienteSlug;
    const cliente = await Cliente.findOne({ slug: clienteSlug });
    if (cliente) clienteNome = cliente.nome;

    const mission = await Mission.create({
      titulo, tipo, clienteSlug, clienteNome, produto, descricao,
      responsavel: responsavel || "Sistema",
      agente: agente || "manual",
      config: config || {},
      tags: tags || [],
      status: "planejada",
      inicio: new Date(),
    });

    res.status(201).json(mission);
  } catch (err) { tratar(err, res, "Erro ao criar missão"); }
}

// ─── INICIAR ─────────────────────────────────────────────────────────────────

export async function iniciarMission(req, res) {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) return res.status(404).json({ erro: "Missão não encontrada" });
    if (mission.status === "em_execucao") return res.status(409).json({ erro: "Missão já em execução" });

    mission.status = "em_execucao";
    mission.inicio = new Date();
    await mission.save();

    res.json({ mensagem: "Missão iniciada", mission });
  } catch (err) { tratar(err, res, "Erro ao iniciar missão"); }
}

// ─── CONCLUIR ────────────────────────────────────────────────────────────────

export async function concluirMission(req, res) {
  try {
    const { sucesso, observacoes, score, itensVerificados, itensOk, itensFalha } = req.body;
    const mission = await Mission.findById(req.params.id);
    if (!mission) return res.status(404).json({ erro: "Missão não encontrada" });

    mission.status = "concluida";
    mission.fim = new Date();
    mission.resultado = {
      sucesso: sucesso ?? true,
      observacoes: observacoes || "",
      score: score || null,
      itensVerificados: itensVerificados || 0,
      itensOk: itensOk || 0,
      itensFalha: itensFalha || 0,
    };
    await mission.save();

    res.json({ mensagem: "Missão concluída", mission });
  } catch (err) { tratar(err, res, "Erro ao concluir missão"); }
}

// ─── CANCELAR ────────────────────────────────────────────────────────────────

export async function cancelarMission(req, res) {
  try {
    const mission = await Mission.findByIdAndUpdate(
      req.params.id,
      { status: "cancelada", fim: new Date() },
      { new: true }
    );
    if (!mission) return res.status(404).json({ erro: "Missão não encontrada" });
    res.json({ mensagem: "Missão cancelada", mission });
  } catch (err) { tratar(err, res, "Erro ao cancelar missão"); }
}

// ─── ADICIONAR EVIDÊNCIA ─────────────────────────────────────────────────────

export async function adicionarEvidencia(req, res) {
  try {
    const { tipo, url, base64, descricao, tela, site } = req.body;
    const mission = await Mission.findById(req.params.id);
    if (!mission) return res.status(404).json({ erro: "Missão não encontrada" });

    mission.evidencias.push({ tipo, url, base64, descricao, tela, site, capturadoEm: new Date() });
    await mission.save();

    res.json({ mensagem: "Evidência adicionada", total: mission.evidencias.length });
  } catch (err) { tratar(err, res, "Erro ao adicionar evidência"); }
}

// ─── ESTATÍSTICAS ────────────────────────────────────────────────────────────

export async function statsMissions(req, res) {
  try {
    const [porTipo, porStatus, porAgente] = await Promise.all([
      Mission.aggregate([{ $group: { _id: "$tipo", total: { $sum: 1 }, concluidas: { $sum: { $cond: [{ $eq: ["$status", "concluida"] }, 1, 0] } } } }]),
      Mission.aggregate([{ $group: { _id: "$status", total: { $sum: 1 } } }]),
      Mission.aggregate([{ $group: { _id: "$agente", total: { $sum: 1 } } }]),
    ]);

    const [total, ultimaSemana] = await Promise.all([
      Mission.countDocuments(),
      Mission.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
    ]);

    const concluidas = await Mission.countDocuments({ status: "concluida" });
    const taxaSucesso = concluidas > 0
      ? await Mission.countDocuments({ status: "concluida", "resultado.sucesso": true })
      : 0;

    res.json({
      total,
      ultimaSemana,
      concluidas,
      taxaSucesso: concluidas > 0 ? Math.round((taxaSucesso / concluidas) * 100) : null,
      porTipo,
      porStatus,
      porAgente,
    });
  } catch (err) { tratar(err, res, "Erro ao calcular stats"); }
}

// ─── MISSÕES POR CLIENTE ─────────────────────────────────────────────────────

export async function missionsPorCliente(req, res) {
  try {
    const { slug } = req.params;
    const missions = await Mission.find({ clienteSlug: slug })
      .sort({ createdAt: -1 })
      .limit(50)
      .select("-evidencias.base64");
    res.json({ clienteSlug: slug, total: missions.length, missions });
  } catch (err) { tratar(err, res, "Erro ao buscar missões do cliente"); }
}
