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
import {
  analisarMultiploProdutos,
  compararPorTipo,
  identificarLacunas,
  gerarRecomendacoes,
} from "./services/multi-product-analysis.js";
import ConformidadeMulti from "./models/conformidade-multi.model.js";

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

// ═════════════════════════════════════════════════════════════════
// ANÁLISE MULTI-PRODUTO (3 Produtos Simultâneos)
// ═════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
// POST /api/conformidade/multi/gerar
// Body: { tituloEdital, textoEdital, comJustificativas? }
// Retorna: Análise contra AxHub, AxTon e AxCross simultaneamente
// ─────────────────────────────────────────────────────────────────
export async function gerarAnalisaMultiProdutoHandler(req, res) {
  const { tituloEdital, textoEdital, comJustificativas = true } = req.body;

  if (!textoEdital) {
    return res.status(400).json({ erro: "Campo obrigatório: textoEdital" });
  }
  if (textoEdital.length < 50) {
    return res.status(400).json({ erro: "textoEdital muito curto (mínimo 50 caracteres)" });
  }

  try {
    console.log("[Conformidade Multi] Iniciando análise multi-produto...");
    const analise = await analisarMultiploProdutos({
      tituloEdital: tituloEdital || "Análise de Edital",
      textoEdital,
      comJustificativas,
    });

    // Salvar no MongoDB
    const doc = new ConformidadeMulti({
      tituloEdital: tituloEdital || "Análise de Edital",
      resumo: analise.resumo,
      analisesPorProduto: analise.analisesPorProduto,
      comparacao: compararPorTipo(analise),
      lacunas: identificarLacunas(analise),
      recomendacoes: gerarRecomendacoes(analise),
    });
    await doc.save();

    return res.status(201).json({
      sucesso: true,
      id: doc._id,
      analise: {
        resumo: analise.resumo,
        comparacao: doc.comparacao,
        lacunas: doc.lacunas,
        recomendacoes: doc.recomendacoes,
      },
    });
  } catch (err) {
    console.error("[Conformidade Multi] Erro:", err.message);
    return res.status(500).json({ erro: err.message });
  }
}

// ─────────────────────────────────────────────────────────────────
// GET /api/conformidade/multi/:id
// Retorna análise multi-produto completa salva
// ─────────────────────────────────────────────────────────────────
export async function obterAnalisaMultiProdutoHandler(req, res) {
  const { id } = req.params;
  try {
    const doc = await ConformidadeMulti.findById(id);
    if (!doc) return res.status(404).json({ erro: "Análise não encontrada." });
    return res.json(doc);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// ─────────────────────────────────────────────────────────────────
// GET /api/conformidade/multi
// Lista todas as análises multi-produto
// ─────────────────────────────────────────────────────────────────
export async function listarAnalisasMultiProdutoHandler(req, res) {
  try {
    const lista = await ConformidadeMulti.find()
      .select("_id tituloEdital resumo createdAt")
      .sort({ createdAt: -1 })
      .limit(50);
    return res.json({ lista, total: lista.length });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// ─────────────────────────────────────────────────────────────────
// GET /api/conformidade/multi/:id/comparacao
// Comparação detalhada por tipo de requisito
// ─────────────────────────────────────────────────────────────────
export async function obterComparacaoHandler(req, res) {
  const { id } = req.params;
  try {
    const doc = await ConformidadeMulti.findById(id);
    if (!doc) return res.status(404).json({ erro: "Análise não encontrada." });
    return res.json({
      tituloEdital: doc.tituloEdital,
      comparacao: doc.comparacao,
      resumoPorTipo: doc.resumo.resumoPorTipo,
    });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// ─────────────────────────────────────────────────────────────────
// GET /api/conformidade/multi/:id/lacunas
// O que falta em cada produto
// ─────────────────────────────────────────────────────────────────
export async function obterLacunasHandler(req, res) {
  const { id } = req.params;
  try {
    const doc = await ConformidadeMulti.findById(id);
    if (!doc) return res.status(404).json({ erro: "Análise não encontrada." });
    return res.json({
      tituloEdital: doc.tituloEdital,
      lacunas: doc.lacunas,
    });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// ─────────────────────────────────────────────────────────────────
// GET /api/conformidade/multi/:id/recomendacoes
// Recomendações de melhoria
// ─────────────────────────────────────────────────────────────────
export async function obterRecomendacoesHandler(req, res) {
  const { id } = req.params;
  try {
    const doc = await ConformidadeMulti.findById(id);
    if (!doc) return res.status(404).json({ erro: "Análise não encontrada." });
    return res.json({
      tituloEdital: doc.tituloEdital,
      recomendacoes: doc.recomendacoes,
    });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}
