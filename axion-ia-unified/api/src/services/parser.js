/**
 * parser.js
 * Converte dados brutos (PNCP, HTML, texto) para formato Markdown estruturado.
 * Também extrai tópicos para uso no comparador.
 */

import { normalizarTexto } from "./normalizador.js";

/**
 * Converte um item do PNCP para Markdown estruturado.
 * @param {Object} item - resultado de pncp.service normalizado
 * @returns {string} markdown
 */
export function pncpParaMd(item) {
  const valor = item.valor
    ? `R$ ${Number(item.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
    : "Não informado";

  const data = item.dataPublicacao
    ? new Date(item.dataPublicacao).toLocaleDateString("pt-BR")
    : "Não informada";

  return `# ${limpar(item.titulo)}

## Órgão
${limpar(item.orgao)}${item.uf ? ` — ${item.uf}` : ""}

## Modalidade
${limpar(item.modalidade)}

## Descrição
${limpar(item.descricao || item.titulo)}

## Valor Estimado
${valor}

## Data de Publicação
${data}

## Número / Referência
${item.numero}

## Link
${item.link || "Não disponível"}

---
*Fonte: PNCP — Coletado automaticamente pelo AxionIA*
*Palavra-chave de busca: ${item.palavraChaveBusca || "—"}*
`;
}

/**
 * Converte um texto bruto (colado pelo usuário) para Markdown limpo.
 * Remove HTML tags, normaliza espaços, preserva estrutura de linhas.
 * @param {string} texto
 * @returns {string}
 */
export function textoParaMd(texto) {
  // Remove tags HTML
  let md = texto
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<h([1-6])[^>]*>/gi, (_, n) => "#".repeat(Number(n)) + " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return md;
}

/**
 * Extrai tópicos principais de um texto (Markdown OU texto puro de edital/contrato).
 * @param {string} md
 * @returns {string[]}
 */
export function extrairTopicosParaComparacao(md) {
  const topicos = new Set();
  const texto = normalizarTexto(md);

  // ── 1. Markdown: headings ##
  for (const m of md.matchAll(/^#{1,3}\s+(.+)/gm)) {
    const t = m[1].replace(/[*`]/g, "").trim();
    if (t.length > 3 && t.length < 120) topicos.add(t);
  }

  // ── 2. Markdown: negrito **texto**
  for (const m of md.matchAll(/\*\*([^*]{4,80})\*\*/g)) {
    topicos.add(m[1].trim());
  }

  // ── 3. Markdown: listas - item
  for (const m of md.matchAll(/^[-•]\s+(.{4,80})/gm)) {
    topicos.add(m[1].replace(/[*`]/g, "").trim());
  }

  // ── 4. Contratos/Editais: CLÁUSULA X - TÍTULO (tudo maiúsculo)
  for (const m of md.matchAll(/^(CL[AÁ]USULA\s+[IVXLCDM\d]+[\s\-–—]+.{3,80})/gmi)) {
    topicos.add(m[1].trim());
  }

  // ── 5. Artigos numerados: Art. 1º / ARTIGO 1
  for (const m of md.matchAll(/^(ART(?:IGO|\.)\s*\d+[ºª°]?\s*[-–—]?\s*.{3,80})/gmi)) {
    topicos.add(m[1].trim());
  }

  // ── 6. Itens numerados: 1.2.3 Texto
  for (const m of md.matchAll(/^(\d+(?:\.\d+)*[\s\.\)]+)(.{10,100})/gm)) {
    const t = (m[2] || "").replace(/[*`]/g, "").trim();
    if (t.length > 5) topicos.add(t);
  }

  // ── 7. Letras de alínea: a) texto / a. texto
  for (const m of md.matchAll(/^[a-z]\)\s+(.{10,120})/gm)) {
    topicos.add(m[1].replace(/[*`]/g, "").trim());
  }

  // ── 8. Linhas em CAIXA ALTA (títulos de seção em contratos/editais)
  for (const linha of md.split("\n")) {
    const l = linha.trim();
    if (l.length > 5 && l.length < 120 && l === l.toUpperCase() && /[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ]{4,}/.test(l)) {
      topicos.add(l);
    }
  }

  // ── 9. Linhas com verbos de requisito (deve, deverá, deverão, precisa, necessário)
  const REQUISITO = /\b(dever[áa]|dever[ãa]o|deve\s+(?:possuir|ter|conter|incluir|contemplar|realizar|suportar|permitir|garantir)|precisa\s+(?:ter|possuir)|é\s+(?:obrigatório|necessário|requerido))/i;
  for (const linha of md.split("\n")) {
    const l = linha.trim();
    if (l.length > 15 && l.length < 200 && REQUISITO.test(l)) {
      topicos.add(l.replace(/[*`#]/g, "").trim().slice(0, 150));
    }
  }

  // ── 10. Palavras-chave de domínio (fallback para documentos mistos)
  const DOMINIOS = /pesagem|infracao|infração|radar|equipamento|balança|semáforo|placa|monitoramento|fiscalização|cronotacógrafo|aferição|relatório|licitação|contrato|edital|objeto|escopo|especificação|funcionalidade/i;
  for (const linha of md.split("\n")) {
    const l = linha.trim();
    if (l.length > 10 && l.length < 150 && DOMINIOS.test(l)) {
      topicos.add(l.replace(/[*`#]/g, "").trim());
    }
  }

  return [...topicos].filter(t => t.length > 3);
}

/**
 * Monta o título sugerido do documento a partir de um item PNCP.
 */
export function tituloPncp(item) {
  const orgao = (item.orgao || "").split("/")[0].trim().substring(0, 40);
  const titulo = (item.titulo || "").substring(0, 60);
  return `PNCP — ${titulo} (${orgao})`;
}

// ─── helper ──────────────────────────────────────────────────────
function limpar(str = "") {
  return String(str).replace(/\s+/g, " ").trim() || "Não informado";
}
