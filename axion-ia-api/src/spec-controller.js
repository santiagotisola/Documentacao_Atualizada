/**
 * spec-controller.js
 * Endpoints REST para geração e consulta de specs (PRDs).
 */

import { gerarSpec, listarSpecs, obterSpec, atualizarStatusSpec } from "./services/spec-engine.js";

export async function gerarSpecHandler(req, res) {
  const { produto, item, roadmapItemId } = req.body;
  if (!produto || !item?.titulo) {
    return res.status(400).json({ erro: "Campos 'produto' e 'item.titulo' são obrigatórios." });
  }

  try {
    const resultado = await gerarSpec(item, produto, roadmapItemId || null);
    res.json({ sucesso: true, ...resultado });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

export async function listarSpecsHandler(req, res) {
  const { produto } = req.query;
  try {
    const lista = await listarSpecs(produto);
    res.json({ lista, total: lista.length });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

export async function obterSpecHandler(req, res) {
  const { id } = req.params;
  try {
    const spec = await obterSpec(id);
    if (!spec) return res.status(404).json({ erro: "Spec não encontrada." });
    res.json(spec);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

export async function atualizarStatusSpecHandler(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  const statusValidos = ["rascunho", "revisao", "aprovado"];
  if (!statusValidos.includes(status)) {
    return res.status(400).json({ erro: `Status inválido. Use: ${statusValidos.join(", ")}` });
  }

  try {
    const spec = await atualizarStatusSpec(id, status);
    if (!spec) return res.status(404).json({ erro: "Spec não encontrada." });
    res.json({ sucesso: true, spec });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}
