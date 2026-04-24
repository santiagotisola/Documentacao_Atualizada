/**
 * conformidade-controller.js
 * Endpoints REST para o módulo de Relatório de Conformidade com Editais.
 *
 * Endpoints:
 *   POST /api/conformidade/gerar         → gera relatório de conformidade
 *   GET  /api/conformidade               → lista relatórios (com filtro ?produto=)
 *   GET  /api/conformidade/:id           → detalhe completo com itens
 *   DELETE /api/conformidade/:id         → remove relatório
 */

import {
  gerarRelatorioConformidade,
  listarRelatorios,
  obterRelatorio,
  removerRelatorio,
} from "./services/conformidade.js";

const PRODUTOS_VALIDOS = ["axhub", "axton", "axcross"];

// ─────────────────────────────────────────────────────────────────
// POST /api/conformidade/gerar
// Body: { produto, tituloEdital, textoEdital, comJustificativas? }
// ─────────────────────────────────────────────────────────────────
export async function gerarConformidadeHandler(req, res) {
  const { produto, tituloEdital, textoEdital, comJustificativas = true } = req.body;

  if (!produto || !textoEdital) {
    return res.status(400).json({ erro: "Campos obrigatórios: produto, textoEdital" });
  }
  if (!PRODUTOS_VALIDOS.includes(produto.toLowerCase())) {
    return res.status(400).json({ erro: `Produto inválido. Use: ${PRODUTOS_VALIDOS.join(", ")}` });
  }
  if (textoEdital.length < 50) {
    return res.status(400).json({ erro: "textoEdital muito curto (mínimo 50 caracteres)" });
  }

  try {
    const resultado = await gerarRelatorioConformidade({
      produto:          produto.toLowerCase(),
      tituloEdital:     tituloEdital || "Edital sem título",
      textoEdital,
      comJustificativas,
    });
    return res.status(201).json({ sucesso: true, ...resultado });
  } catch (err) {
    console.error("[conformidade] Erro ao gerar:", err.message);
    return res.status(500).json({ erro: err.message });
  }
}

// ─────────────────────────────────────────────────────────────────
// GET /api/conformidade?produto=axhub
// ─────────────────────────────────────────────────────────────────
export async function listarConformidadeHandler(req, res) {
  const { produto } = req.query;
  try {
    const lista = await listarRelatorios(produto || null);
    return res.json({ lista, total: lista.length });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// ─────────────────────────────────────────────────────────────────
// GET /api/conformidade/:id
// ─────────────────────────────────────────────────────────────────
export async function obterConformidadeHandler(req, res) {
  const { id } = req.params;
  try {
    const relatorio = await obterRelatorio(id);
    if (!relatorio) return res.status(404).json({ erro: "Relatório não encontrado." });
    return res.json(relatorio);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// ─────────────────────────────────────────────────────────────────
// DELETE /api/conformidade/:id
// ─────────────────────────────────────────────────────────────────
export async function removerConformidadeHandler(req, res) {
  const { id } = req.params;
  try {
    const removido = await removerRelatorio(id);
    if (!removido) return res.status(404).json({ erro: "Relatório não encontrado." });
    return res.json({ sucesso: true });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}
