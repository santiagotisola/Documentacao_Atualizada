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
 * Extrai tópicos principais de um Markdown para uso no comparador.
 * @param {string} md
 * @returns {string[]}
 */
export function extrairTopicosParaComparacao(md) {
  const topicos = new Set();
  const texto = normalizarTexto(md);

  // Headings como tópicos diretos
  for (const m of md.matchAll(/^#{1,3}\s+(.+)/gm)) {
    const t = m[1].replace(/[*`]/g, "").trim();
    if (t.length > 3 && t.length < 120) topicos.add(t);
  }

  // Negritos
  for (const m of md.matchAll(/\*\*([^*]{4,80})\*\*/g)) {
    topicos.add(m[1].trim());
  }

  // Linhas de lista
  for (const m of md.matchAll(/^[-•]\s+(.{4,80})/gm)) {
    topicos.add(m[1].replace(/[*`]/g, "").trim());
  }

  // Parágrafos que contêm palavras-chave do domínio
  const DOMINIOS = /pesagem|infracao|infração|radar|equipamento|balança|semáforo|placa|monitoramento|fiscalização|cronotacógrafo|aferição|relatório|licitação|contrato|edital/i;
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
