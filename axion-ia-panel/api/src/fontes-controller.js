/**
 * fontes-controller.js
 * Endpoints REST para o módulo "Fontes de Pesquisa".
 *
 * ISOLAMENTO: estas fontes são usadas APENAS para análise de usabilidade
 * e comparação com a documentação. NUNCA são injetadas na KB ou no engine
 * de suporte (kb.json / KB MongoDB / engine.js).
 */

import { Fonte } from "./models/fonte.model.js";
import { analisarFonte, obterMapaCobertura, consolidarSugestoes } from "./services/comparador.js";

const PRODUTOS_VALIDOS = ["axhub", "axton", "axcross"];

// ─────────────────────────────────────────────────────────────────
// POST /api/fontes
// Adiciona uma nova fonte de pesquisa.
// ─────────────────────────────────────────────────────────────────
export async function adicionarFonte(req, res) {
  try {
    const { produto, titulo, tipo, conteudo, arquivo } = req.body;

    if (!produto || !titulo || !conteudo) {
      return res.status(400).json({ erro: "Campos obrigatórios: produto, titulo, conteudo" });
    }
    if (!PRODUTOS_VALIDOS.includes(produto.toLowerCase())) {
      return res.status(400).json({ erro: `Produto inválido. Use: ${PRODUTOS_VALIDOS.join(", ")}` });
    }
    if (conteudo.length < 20) {
      return res.status(400).json({ erro: "Conteúdo muito curto (mínimo 20 caracteres)" });
    }

    const fonte = await Fonte.create({
      produto: produto.toLowerCase(),
      titulo: titulo.trim(),
      tipo: tipo || "manual",
      conteudo,
      arquivo: arquivo || null,
      status: "pendente",
    });

    return res.status(201).json({ sucesso: true, fonte });
  } catch (err) {
    console.error("[fontes] Erro ao adicionar:", err.message);
    return res.status(500).json({ erro: err.message });
  }
}

// ─────────────────────────────────────────────────────────────────
// GET /api/fontes
// Lista todas as fontes (com filtro opcional por produto).
// ─────────────────────────────────────────────────────────────────
export async function listarFontes(req, res) {
  try {
    const { produto } = req.query;
    const filtro = produto ? { produto: produto.toLowerCase() } : {};

    const fontes = await Fonte.find(filtro)
      .select("-conteudo")   // não retorna o conteúdo completo na listagem
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ total: fontes.length, fontes });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// ─────────────────────────────────────────────────────────────────
// GET /api/fontes/:id
// Retorna uma fonte completa (com conteúdo e análise).
// ─────────────────────────────────────────────────────────────────
export async function obterFonte(req, res) {
  try {
    const fonte = await Fonte.findById(req.params.id).lean();
    if (!fonte) return res.status(404).json({ erro: "Fonte não encontrada" });
    return res.json(fonte);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// ─────────────────────────────────────────────────────────────────
// DELETE /api/fontes/:id
// Remove uma fonte.
// ─────────────────────────────────────────────────────────────────
export async function removerFonte(req, res) {
  try {
    const fonte = await Fonte.findByIdAndDelete(req.params.id);
    if (!fonte) return res.status(404).json({ erro: "Fonte não encontrada" });
    return res.json({ sucesso: true, removido: req.params.id });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// ─────────────────────────────────────────────────────────────────
// POST /api/fontes/:id/analisar
// Executa a análise de cobertura de uma fonte contra a documentação.
// ─────────────────────────────────────────────────────────────────
export async function analisarFonteById(req, res) {
  try {
    const fonte = await Fonte.findById(req.params.id);
    if (!fonte) return res.status(404).json({ erro: "Fonte não encontrada" });

    const analise = await analisarFonte(fonte.produto, fonte.conteudo);

    fonte.analise = analise;
    fonte.status = "analisado";
    await fonte.save();

    return res.json({
      sucesso: true,
      id: fonte._id,
      produto: fonte.produto,
      titulo: fonte.titulo,
      analise,
    });
  } catch (err) {
    console.error("[fontes] Erro ao analisar:", err.message);
    return res.status(500).json({ erro: err.message });
  }
}

// ─────────────────────────────────────────────────────────────────
// GET /api/fontes/mapa/:produto
// Retorna o mapa de cobertura completo da documentação de um produto.
// ─────────────────────────────────────────────────────────────────
export async function mapaCobertura(req, res) {
  try {
    const produto = req.params.produto.toLowerCase();
    if (!PRODUTOS_VALIDOS.includes(produto)) {
      return res.status(400).json({ erro: `Produto inválido. Use: ${PRODUTOS_VALIDOS.join(", ")}` });
    }

    const mapa = await obterMapaCobertura(produto);
    return res.json(mapa);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// ─────────────────────────────────────────────────────────────────
// GET /api/fontes/sugestoes/:produto
// Consolida sugestões de melhoria de todas as fontes de um produto.
// ─────────────────────────────────────────────────────────────────
export async function sugestoesPorProduto(req, res) {
  try {
    const produto = req.params.produto.toLowerCase();
    if (!PRODUTOS_VALIDOS.includes(produto)) {
      return res.status(400).json({ erro: `Produto inválido. Use: ${PRODUTOS_VALIDOS.join(", ")}` });
    }

    const fontes = await Fonte.find({ produto, status: "analisado" }).lean();
    const sugestoes = await consolidarSugestoes(fontes);

    const totalLacunas = fontes.reduce((acc, f) => acc + (f.analise?.lacunas?.length || 0), 0);
    const totalTopicos = fontes.reduce((acc, f) => acc + (f.analise?.totalTopicos || 0), 0);
    const totalCobertos = fontes.reduce((acc, f) => acc + (f.analise?.totalCobertos || 0), 0);
    const percentualGeral = totalTopicos > 0 ? Math.round((totalCobertos / totalTopicos) * 100) : 0;

    return res.json({
      produto,
      totalFontes: fontes.length,
      totalTopicos,
      totalCobertos,
      totalLacunas,
      percentualGeral,
      sugestoes,
    });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}
