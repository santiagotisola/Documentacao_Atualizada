/**
 * Roadmap Service
 */
import Roadmap from '../models/roadmap.model.js';

export async function listarRoadmap(filtros = {}) {
  const query = {};
  if (filtros.produto) query.produto = filtros.produto;
  if (filtros.fase) query.fase = filtros.fase;
  if (filtros.prioridade) query.prioridade = filtros.prioridade;
  
  return await Roadmap.find(query).sort({ prioridade: -1, dataInicio: 1 });
}

export async function criarItem(dados) {
  const item = new Roadmap(dados);
  return await item.save();
}

export async function atualizarItem(id, dados) {
  return await Roadmap.findByIdAndUpdate(id, dados, { new: true });
}

export async function deletarItem(id) {
  return await Roadmap.findByIdAndDelete(id);
}

export async function obterTimeline() {
  const items = await Roadmap.find({ dataInicio: { $ne: null } }).sort({ dataInicio: 1 });
  return items;
}
