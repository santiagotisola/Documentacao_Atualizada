/**
 * Mapeamento Categorias Jitbit ↔ Sites AxHub/AxCross/AxTon
 *
 * Cada categoria Jitbit mapeia para um CLIENTE que pode usar múltiplos sistemas.
 * A detecção do sistema (AxHub, AxCross, AxTon) é feita por análise do assunto do ticket.
 *
 * Categorias sem match ficam em "naoAssociados" e podem ser vinculadas manualmente.
 */

// Mapeamento: categoryId → { axhub, axcross, axton } (IDs dos sites por sistema)
const MAPA_CATEGORIA_SITE = {
  553819: { axhub: 'ibametro',  axcross: null,              axton: null },
  553820: { axhub: 'imepi',     axcross: null,              axton: 'imepi' },
  562901: { axhub: 'imeqpb',    axcross: null,              axton: null },
  562905: { axhub: 'imetropa',  axcross: null,              axton: null },
  620933: { axhub: 'ipemce',    axcross: 'ipemce-cross',    axton: 'ipemce' },
  652541: { axhub: 'ipemmt',    axcross: 'ipemmt-cross',    axton: null },
  624885: { axhub: 'ipempe',    axcross: 'ipempe-cross',    axton: null },
  553822: { axhub: 'itps',      axcross: null,              axton: null },
  553815: { axhub: 'economia',  axcross: null,              axton: 'economia' },
  553818: { axhub: 'detranma',  axcross: 'detranma-cross',  axton: null },
  553823: { axhub: 'detranpi',  axcross: 'detranpi-cross',  axton: 'detranpi' },
  553830: { axhub: 'strans',    axcross: null,              axton: 'strans' },
  603237: { axhub: 'goiania',   axcross: 'setrans-cross',   axton: 'goiania' },
  618250: { axhub: null,        axcross: 'imperatriz-cross', axton: null },
  // Não associados automaticamente (podem ser vinculados manualmente):
  // 553816: BHTrans, 553817: DER/SE, 553821: INMEQ/MA, 653370: SEFAZ/SE,
  // 562904: SMST-BoaVista, 553824: SMTT/SãoLuís, 625973: WAY306
};

// Regex para detectar sistema pelo assunto do ticket
const REGEX_AXCROSS = /ax[\s-]?cross|cruzamento|monitoramento.*online|passagens.*cruzamento/i;
const REGEX_AXTON = /ax[\s-]?ton|axton|pesagem|pesag|balança|peso|ponto.*pesagem|ticket.*pesagem/i;

/**
 * Detecta o sistema (axhub | axcross | axton) pelo assunto do ticket
 */
export function detectarSistema(subject) {
  if (!subject) return 'axhub';
  if (REGEX_AXCROSS.test(subject)) return 'axcross';
  if (REGEX_AXTON.test(subject)) return 'axton';
  return 'axhub';
}

/**
 * Dado um categoryId e um assunto, retorna o siteId correto
 */
export function getSiteIdPorTicket(categoryId, subject) {
  const entry = associacoesManuais[categoryId] || MAPA_CATEGORIA_SITE[categoryId];
  if (!entry) return null;
  // Associação manual simples (string)
  if (typeof entry === 'string') return entry;
  const sistema = detectarSistema(subject);
  return entry[sistema] || entry.axhub || null;
}

// Associações manuais (persistidas em memória — reset ao reiniciar)
let associacoesManuais = {};

export function getMapaCompleto() {
  return { ...MAPA_CATEGORIA_SITE, ...associacoesManuais };
}

export function getMapaFlat() {
  // Retorna mapa plano categoryId → siteId default (axhub) para compatibilidade
  const flat = {};
  for (const [catId, entry] of Object.entries(MAPA_CATEGORIA_SITE)) {
    if (typeof entry === 'string') flat[catId] = entry;
    else flat[catId] = entry.axhub || entry.axcross || entry.axton || null;
  }
  for (const [catId, entry] of Object.entries(associacoesManuais)) {
    if (typeof entry === 'string') flat[catId] = entry;
    else flat[catId] = entry.axhub || entry.axcross || entry.axton || null;
  }
  return flat;
}

export function getSiteIdPorCategoria(categoryId) {
  const entry = associacoesManuais[categoryId] || MAPA_CATEGORIA_SITE[categoryId];
  if (!entry) return null;
  if (typeof entry === 'string') return entry;
  return entry.axhub || entry.axcross || entry.axton || null;
}

export function associarManual(categoryId, siteId) {
  associacoesManuais[categoryId] = siteId;
}

export function removerAssociacao(categoryId) {
  delete associacoesManuais[categoryId];
}

export function getAssociacoesManuais() {
  return { ...associacoesManuais };
}

export function getCategoriasNaoAssociadas(categorias) {
  const mapa = { ...MAPA_CATEGORIA_SITE, ...associacoesManuais };
  return categorias.filter(c => !mapa[c.CategoryID]);
}
