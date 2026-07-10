/**
 * relatorio-contrato-controller.js
 * Endpoints para geração de relatórios técnicos por contrato via IA.
 *
 * Endpoints:
 *   GET  /api/relatorio-contrato/contratos      → lista contratos disponíveis
 *   GET  /api/relatorio-contrato/tipos          → lista tipos de relatório
 *   POST /api/relatorio-contrato/gerar          → gera novo relatório
 *   GET  /api/relatorio-contrato                → lista relatórios gerados
 *   GET  /api/relatorio-contrato/:id            → detalhe completo
 *   DELETE /api/relatorio-contrato/:id          → remove relatório
 */

import {
  gerarRelatorio,
  listarRelatorios,
  obterRelatorio,
  removerRelatorio,
  listarContratos,
  listarTiposRelatorio,
} from "./services/relatorio-contrato.js";

// GET /api/relatorio-contrato/contratos
export async function listarContratosHandler(req, res) {
  try {
    const contratos = await listarContratos();
    return res.json({ total: contratos.length, contratos });
  } catch (err) {
    return res.status(500).json({ erro: "Erro ao listar contratos", detalhe: err.message });
  }
}

// GET /api/relatorio-contrato/tipos
export function listarTiposHandler(req, res) {
  const tipos = listarTiposRelatorio();
  return res.json({ tipos });
}

// POST /api/relatorio-contrato/gerar
// Body: { contrato, produto?, tipo, contexto }
export async function gerarRelatorioHandler(req, res) {
  const { contrato, produto, tipo, contexto } = req.body;

  if (!contrato || !tipo || !contexto) {
    return res.status(400).json({ erro: "Campos obrigatórios: contrato, tipo, contexto" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ erro: "OPENAI_API_KEY não configurada." });
  }

  try {
    const doc = await gerarRelatorio({
      contrato,
      produto: produto || "axhub",
      tipo,
      contexto,
    });

    return res.json({
      id: doc._id,
      titulo: doc.titulo,
      status: doc.status,
      score: doc.metadados.score_viabilidade,
      tempo_ms: doc.metadados.tempo_geracao_ms,
      markdown: doc.markdown,
      resultado: doc.resultado,
    });
  } catch (err) {
    return res.status(500).json({ erro: "Erro ao gerar relatório", detalhe: err.message });
  }
}

// GET /api/relatorio-contrato?contrato=&tipo=&limite=
export async function listarRelatoriosHandler(req, res) {
  const { contrato, tipo, limite } = req.query;
  try {
    const lista = await listarRelatorios({
      contrato: contrato || undefined,
      tipo: tipo || undefined,
      limite: limite ? parseInt(limite) : 20,
    });
    return res.json({ total: lista.length, relatorios: lista });
  } catch (err) {
    return res.status(500).json({ erro: "Erro ao listar relatórios", detalhe: err.message });
  }
}

// GET /api/relatorio-contrato/:id
export async function obterRelatorioHandler(req, res) {
  try {
    const doc = await obterRelatorio(req.params.id);
    if (!doc) return res.status(404).json({ erro: "Relatório não encontrado" });
    return res.json(doc);
  } catch (err) {
    return res.status(500).json({ erro: "Erro ao obter relatório", detalhe: err.message });
  }
}

// DELETE /api/relatorio-contrato/:id
export async function removerRelatorioHandler(req, res) {
  try {
    const doc = await removerRelatorio(req.params.id);
    if (!doc) return res.status(404).json({ erro: "Relatório não encontrado" });
    return res.json({ removido: true, id: req.params.id });
  } catch (err) {
    return res.status(500).json({ erro: "Erro ao remover relatório", detalhe: err.message });
  }
}
