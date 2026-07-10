/**
 * Roadmap Controller
 */
import { listarRoadmap, criarItem, atualizarItem, deletarItem, obterTimeline } from '../services/roadmap.service.js';

export async function getRoadmap(req, res, next) {
  try {
    const { produto, fase, prioridade } = req.query;
    const items = await listarRoadmap({ produto, fase, prioridade });
    res.json({ items });
  } catch (error) {
    next(error);
  }
}

export async function createRoadmapItem(req, res, next) {
  try {
    const item = await criarItem(req.body);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
}

export async function updateRoadmapItem(req, res, next) {
  try {
    const item = await atualizarItem(req.params.id, req.body);
    res.json(item);
  } catch (error) {
    next(error);
  }
}

export async function deleteRoadmapItem(req, res, next) {
  try {
    await deletarItem(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function getTimeline(req, res, next) {
  try {
    const timeline = await obterTimeline();
    res.json({ timeline });
  } catch (error) {
    next(error);
  }
}
