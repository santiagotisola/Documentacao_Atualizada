/**
 * roadmap-controller.js
 * Endpoints REST para geração e consulta de roadmaps.
 */

import { gerarRoadmap, listarRoadmaps, obterRoadmap } from "./services/roadmap-engine.js";
import Roadmap from "./models/roadmap.model.js";

export async function gerarRoadmapHandler(req, res) {
  const { produto } = req.body;
  if (!produto) return res.status(400).json({ erro: "Campo 'produto' obrigatório." });

  try {
    const roadmap = await gerarRoadmap(produto);
    res.json({ sucesso: true, roadmap });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

export async function listarRoadmapsHandler(req, res) {
  const { produto } = req.query;
  try {
    const lista = await listarRoadmaps(produto);
    res.json({ lista, total: lista.length });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

export async function obterRoadmapHandler(req, res) {
  const { id } = req.params;
  try {
    const roadmap = await obterRoadmap(id);
    if (!roadmap) return res.status(404).json({ erro: "Roadmap não encontrado." });
    res.json(roadmap);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

export async function atualizarItemHandler(req, res) {
  const { id, itemId } = req.params;
  const { status } = req.body;
  const statusValidos = ["pendente", "especificado", "aprovado", "descartado"];
  if (!statusValidos.includes(status)) {
    return res.status(400).json({ erro: `Status inválido. Use: ${statusValidos.join(", ")}` });
  }

  try {
    const roadmap = await Roadmap.findOneAndUpdate(
      { _id: id, "itens._id": itemId },
      { $set: { "itens.$.status": status } },
      { new: true }
    ).lean();
    if (!roadmap) return res.status(404).json({ erro: "Roadmap ou item não encontrado." });
    res.json({ sucesso: true, roadmap });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}
