/**
 * roadmap-engine.js
 * Transforma lacunas detectadas pelo comparador em um backlog priorizado.
 *
 * Fluxo:
 *  1. Busca todas as fontes analisadas do produto no MongoDB.
 *  2. Consolida sugestões (via comparador.consolidarSugestoes).
 *  3. Clusteriza sugestões similares para evitar duplicação.
 *  4. Calcula prioridade, impacto estimado e complexidade.
 *  5. Persiste o roadmap gerado.
 *
 * ISOLAMENTO: não lê nem escreve em kb.json / engine.js.
 */

import { Fonte } from "../models/fonte.model.js";
import Roadmap from "../models/roadmap.model.js";
import { consolidarSugestoes } from "./comparador.js";
import { normalizarTexto, removerAcentos } from "./normalizador.js";

// ─── Pesos de prioridade por categoria ───────────────────────────
const PESO_CATEGORIA = {
  "infracoes":         1,
  "pesagem":           1,
  "operacoes":         1,
  "primeiros-passos":  2,
  "veiculos":          2,
  "relatorios":        2,
  "medicoes":          2,
  "controle-acesso":   3,
  "administracao":     3,
  "cronotacografo":    3,
  "referencia-tecnica":4,
  "glossario":         5,
};

// ─── Estimativa de complexidade por palavras-chave ───────────────
const COMPLEXIDADE_PATTERNS = {
  alta:  /integra[çc]|api|banco|importa|exporta|automatiz|cronogram/i,
  media: /relatorio|relat[oó]rio|configura|parametro|notific|gestao/i,
  baixa: /glossario|definic|conceito|manual|guia|como/i,
};

function estimarComplexidade(titulo) {
  const t = titulo;
  if (COMPLEXIDADE_PATTERNS.alta.test(t))  return "alta";
  if (COMPLEXIDADE_PATTERNS.baixa.test(t)) return "baixa";
  return "media";
}

function estimarImpacto(titulo, categoria) {
  const peso = PESO_CATEGORIA[categoria] || 3;
  if (peso === 1) return "Alto — área operacional crítica";
  if (peso === 2) return "Médio — melhora usabilidade";
  return "Baixo — documentação de suporte";
}

// ─── Clusterização simples por similaridade de tokens ────────────

function tokenizar(titulo) {
  return removerAcentos(titulo)
    .split(/\s+/)
    .filter(t => t.length > 3)
    .sort();
}

function similaridade(a, b) {
  const ta = new Set(tokenizar(a));
  const tb = new Set(tokenizar(b));
  const intersecao = [...ta].filter(t => tb.has(t)).length;
  const uniao = new Set([...ta, ...tb]).size;
  return uniao === 0 ? 0 : intersecao / uniao;
}

/**
 * Agrupa sugestões similares (Jaccard ≥ 0.45).
 * Retorna um item representativo por cluster.
 */
function clusterizar(sugestoes) {
  const visitados = new Set();
  const clusters = [];

  for (let i = 0; i < sugestoes.length; i++) {
    if (visitados.has(i)) continue;
    const cluster = [i];
    for (let j = i + 1; j < sugestoes.length; j++) {
      if (!visitados.has(j) && similaridade(sugestoes[i].titulo, sugestoes[j].titulo) >= 0.45) {
        cluster.push(j);
        visitados.add(j);
      }
    }
    visitados.add(i);
    // Representante: o de maior título (mais descritivo)
    const rep = cluster.reduce((best, idx) =>
      sugestoes[idx].titulo.length > sugestoes[best].titulo.length ? idx : best, cluster[0]);
    clusters.push({ ...sugestoes[rep], contagemSimilares: cluster.length });
  }

  return clusters;
}

// ─── Função principal ─────────────────────────────────────────────

/**
 * Gera (ou regenera) o roadmap de um produto a partir das fontes analisadas.
 * @param {string} produto - "axhub" | "axton" | "axcross"
 * @returns {Object} roadmap salvo
 */
export async function gerarRoadmap(produto) {
  // 1. Busca fontes com análise concluída
  const fontes = await Fonte.find({ produto, status: "analisado" }).lean();
  if (fontes.length === 0) {
    throw new Error(`Nenhuma fonte analisada encontrada para "${produto}".`);
  }

  // 2. Consolida sugestões
  const sugestoes = await consolidarSugestoes(fontes);

  // 3. Clusteriza
  const clusteres = clusterizar(sugestoes);

  // 4. Constrói itens
  const itens = clusteres.map((s, idx) => ({
    titulo:       s.titulo,
    descricao:    s.motivo || "",
    prioridade:   PESO_CATEGORIA[s.secao] || 3,
    impacto:      estimarImpacto(s.titulo, s.secao),
    complexidade: estimarComplexidade(s.titulo),
    categoria:    s.secao || "operacoes",
    fontes:       fontes.filter(f => f.analise?.sugestoes?.some(sg => sg.titulo === s.titulo)).map(f => f.titulo),
    status:       "pendente",
  }));

  // Ordena por prioridade asc, depois título
  itens.sort((a, b) => a.prioridade - b.prioridade || a.titulo.localeCompare(b.titulo));

  // 5. Persiste
  const roadmap = await Roadmap.create({
    produto,
    itens,
    totalFontes: fontes.length,
    status: "rascunho",
  });

  return roadmap;
}

/**
 * Lista todos os roadmaps de um produto (ou todos).
 */
export async function listarRoadmaps(produto) {
  const filtro = produto ? { produto } : {};
  return Roadmap.find(filtro, { itens: 0 }).sort({ geradoEm: -1 }).lean();
}

/**
 * Retorna um roadmap completo por ID.
 */
export async function obterRoadmap(id) {
  return Roadmap.findById(id).lean();
}
