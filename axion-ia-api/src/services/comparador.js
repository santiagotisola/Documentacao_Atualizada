/**
 * comparador.js
 * Serviço de comparação entre fontes de pesquisa e documentação existente.
 *
 * Fluxo:
 *  1. Varre todos os .md do portal do produto e constrói um mapa de cobertura.
 *  2. Extrai tópicos do texto-fonte (headings, negrito, linhas de menu).
 *  3. Cruza os dois conjuntos e detecta lacunas.
 *  4. Gera sugestões de documentos a criar/revisar.
 *
 * ISOLAMENTO: este serviço NUNCA alimenta kb.json, KB (MongoDB) ou engine.js.
 * É usado exclusivamente para análise de usabilidade e planejamento de docs.
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Caminhos dos portais de documentação (relativo a axion-ia-api/src/services/)
const PORTAIS = {
  axhub:   path.resolve(__dirname, "../../../AxHub/docs-portal/docs"),
  axton:   path.resolve(__dirname, "../../../AxTon/docs-portal/docs"),
  axcross: path.resolve(__dirname, "../../../AxCross/docs-portal/docs"),
};

// Mapeamento de seções → labels amigáveis por produto
const SECOES_LABELS = {
  axhub: {
    "primeiros-passos": "Primeiros Passos",
    "operacoes":        "Operações",
    "infracoes":        "Infrações",
    "pesagem":          "Pesagem",
    "veiculos":         "Veículos",
    "relatorios":       "Relatórios",
    "administracao":    "Administração",
    "cadastros-basicos":"Cadastros Básicos",
    "controle-acesso":  "Controle de Acesso",
    "medicoes":         "Medições / Aferição",
    "cronotacografo":   "Cronotacógrafo",
    "balanca":          "Balança",
    "referencia-tecnica":"Referência Técnica",
    "glossario":        "Glossário",
  },
  axton: {
    "primeiros-passos": "Primeiros Passos",
    "operacoes":        "Operações",
    "pesagem":          "Pesagem",
    "infracoes":        "Infrações",
    "veiculos":         "Veículos",
    "medicoes":         "Medições / Aferição",
    "relatorios":       "Relatórios",
    "administracao":    "Administração",
    "cadastros":        "Cadastros",
    "cadastros-basicos":"Cadastros Básicos",
    "controle-acesso":  "Controle de Acesso",
    "sistema":          "Sistema",
    "referencia-tecnica":"Referência Técnica",
    "glossario":        "Glossário",
  },
  axcross: {
    "primeiros-passos": "Primeiros Passos",
    "operacoes":        "Operações",
    "cadastros":        "Cadastros",
    "relatorios":       "Relatórios",
    "administracao":    "Administração",
    "sistema":          "Sistema",
    "referencia-tecnica":"Referência Técnica",
    "glossario":        "Glossário",
  },
};

// ─────────────────────────────────────────────────────────────────
// 1. LER DOCUMENTAÇÃO EXISTENTE
// ─────────────────────────────────────────────────────────────────

/**
 * Lê recursivamente todos os .md de um diretório e retorna metadados.
 */
async function walkMd(dir, base = "") {
  const entries = [];
  let items;
  try { items = await fs.readdir(dir, { withFileTypes: true }); }
  catch { return entries; }

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const rel = base ? `${base}/${item.name}` : item.name;

    if (item.isDirectory()) {
      entries.push(...await walkMd(fullPath, rel));
    } else if (item.isFile() && item.name.endsWith(".md")) {
      entries.push({ fullPath, rel, name: item.name });
    }
  }
  return entries;
}

/**
 * Extrai o título (primeiro # ou nome do arquivo) e headings de um arquivo .md.
 */
async function extrairMetadadosMd(fullPath, rel) {
  let conteudo = "";
  try { conteudo = await fs.readFile(fullPath, "utf8"); } catch { return null; }

  const linhas = conteudo.split("\n");
  let titulo = null;
  const headings = [];

  for (const linha of linhas) {
    const matchH1 = linha.match(/^#\s+(.+)/);
    const matchH2 = linha.match(/^##\s+(.+)/);
    const matchH3 = linha.match(/^###\s+(.+)/);
    if (matchH1 && !titulo) titulo = matchH1[1].trim();
    if (matchH2) headings.push(matchH2[1].trim());
    if (matchH3) headings.push(matchH3[1].trim());
  }

  if (!titulo) {
    titulo = path.basename(rel, ".md").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  }

  // Seção = primeiro diretório do caminho relativo
  const secao = rel.includes("/") ? rel.split("/")[0] : "raiz";

  return { rel, titulo, secao, headings, palavrasChave: extrairPalavrasChave(conteudo) };
}

/**
 * Extrai palavras-chave relevantes de um texto .md.
 */
function extrairPalavrasChave(texto) {
  const palavras = new Set();

  // Negritos: **texto**
  for (const m of texto.matchAll(/\*\*([^*]{3,60})\*\*/g)) {
    palavras.add(normalizar(m[1]));
  }
  // Backticks inline: `texto`
  for (const m of texto.matchAll(/`([^`]{3,40})`/g)) {
    palavras.add(normalizar(m[1]));
  }
  // Headings H2/H3
  for (const m of texto.matchAll(/^#{2,3}\s+(.+)/gm)) {
    palavras.add(normalizar(m[1]));
  }

  return [...palavras].filter(Boolean);
}

/**
 * Normaliza string para comparação (minúsculas, sem acentos, sem pontuação).
 */
function normalizar(str) {
  return str
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Constrói o mapa de cobertura completo para um produto.
 * Retorna array de { rel, titulo, secao, headings, palavrasChave }
 */
async function construirMapaCobertura(produto) {
  const docDir = PORTAIS[produto];
  const arquivos = await walkMd(docDir);
  const mapa = [];

  for (const arq of arquivos) {
    const meta = await extrairMetadadosMd(arq.fullPath, arq.rel);
    if (meta) mapa.push(meta);
  }

  return mapa;
}

// ─────────────────────────────────────────────────────────────────
// 2. EXTRAIR TÓPICOS DA FONTE
// ─────────────────────────────────────────────────────────────────

/**
 * Extrai tópicos de um texto-fonte (manual, especificação, etc.).
 * Procura headings markdown, linhas que parecem seções de menu, e texto em negrito.
 */
function extrairTopicosDoTexto(texto) {
  const topicos = new Set();

  // Headings markdown
  for (const m of texto.matchAll(/^#{1,4}\s+(.+)/gm)) {
    const t = m[1].replace(/[*`]/g, "").trim();
    if (t.length > 2 && t.length < 120) topicos.add(t);
  }

  // Negritos
  for (const m of texto.matchAll(/\*\*([^*]{3,80})\*\*/g)) {
    topicos.add(m[1].trim());
  }

  // Linhas que começam com número (lista numerada = funcionalidades)
  for (const m of texto.matchAll(/^\d+[\.\)]\s+(.{5,80})/gm)) {
    topicos.add(m[1].trim());
  }

  // Linhas com ":" que parecem rótulos de menu/campo
  for (const m of texto.matchAll(/^[-•]\s+(.{3,80})/gm)) {
    topicos.add(m[1].trim());
  }

  // Linhas em MAIÚSCULAS (seções de sistemas legados)
  for (const linha of texto.split("\n")) {
    const trimada = linha.trim();
    if (trimada.length > 3 && trimada.length < 80 && trimada === trimada.toUpperCase() && /[A-Z]/.test(trimada)) {
      topicos.add(trimada);
    }
  }

  // Remove linhas muito curtas ou que são só pontuação
  return [...topicos].filter(t => t.length > 3 && /\w/.test(t));
}

// ─────────────────────────────────────────────────────────────────
// 3. CRUZAR FONTE × DOCUMENTAÇÃO
// ─────────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "de", "da", "do", "dos", "das", "em", "no", "na", "nos", "nas",
  "um", "uma", "o", "a", "os", "as", "e", "ou", "para", "com",
  "por", "que", "se", "ao", "pelo", "pela", "como", "mais", "este",
  "este", "essa", "esse", "isso", "para", "ser", "foi"
]);

/**
 * Verifica se um tópico está coberto no mapa de documentação.
 * Retorna { coberto, docs[] }
 */
function verificarCobertura(topico, mapa) {
  const topicoNorm = normalizar(topico);
  const tokens = topicoNorm.split(" ").filter(t => t.length > 2 && !STOP_WORDS.has(t));

  if (tokens.length === 0) return { coberto: false, docs: [] };

  const docsMatchados = [];

  for (const doc of mapa) {
    let pontos = 0;

    // Match no título
    const tituloNorm = normalizar(doc.titulo);
    for (const token of tokens) {
      if (tituloNorm.includes(token)) pontos += 3;
    }

    // Match nos headings H2/H3
    for (const h of doc.headings) {
      const hNorm = normalizar(h);
      for (const token of tokens) {
        if (hNorm.includes(token)) pontos += 2;
      }
    }

    // Match nas palavras-chave extraídas do doc
    for (const pc of doc.palavrasChave) {
      for (const token of tokens) {
        if (pc.includes(token)) pontos += 1;
      }
    }

    // Threshold: pelo menos 2 pontos ou cobertura de ≥50% dos tokens relevantes
    const cobertura = tokens.filter(t => normalizar(doc.titulo).includes(t) || doc.headings.some(h => normalizar(h).includes(t))).length;
    const percCobertura = tokens.length > 0 ? cobertura / tokens.length : 0;

    if (pontos >= 3 || percCobertura >= 0.5) {
      docsMatchados.push(doc.rel);
    }
  }

  return {
    coberto: docsMatchados.length > 0,
    docs: [...new Set(docsMatchados)],
  };
}

/**
 * Sugere em qual seção um tópico deveria ser documentado.
 */
function sugerirSecao(topico, produto) {
  const t = normalizar(topico);
  const secoes = SECOES_LABELS[produto] || {};

  const mapeamento = {
    "configuracao|parametro|configurar|instalar|instalacao": "primeiros-passos",
    "relatorio|exportar|exportacao|pdf|excel": "relatorios",
    "usuario|acesso|login|senha|permissao|perfil": "controle-acesso",
    "veiculo|placa|marca|modelo|categoria|especie": "veiculos",
    "pesagem|peso|balanca|tara|carga|eixo": "pesagem",
    "infracao|multa|autuacao|notificacao|penalidade": "infracoes",
    "aferição|aferimento|calibracao|certificado": "medicoes",
    "equipamento|camera|radar|sensor|dispositivo|leitor": "operacoes",
    "crono|tacografo|jornada|motorista": "cronotacografo",
    "integração|api|banco|tabela|importacao|exportacao": "referencia-tecnica",
    "glossario|definicao|conceito|sigla": "glossario",
    "administracao|admin|manutencao|backup": "administracao",
  };

  for (const [pattern, secao] of Object.entries(mapeamento)) {
    if (new RegExp(pattern, "i").test(t)) {
      if (secao in secoes) return secao;
    }
  }

  return Object.keys(secoes)[0] || "operacoes";
}

// ─────────────────────────────────────────────────────────────────
// 4. FUNÇÃO PRINCIPAL: ANALISAR FONTE
// ─────────────────────────────────────────────────────────────────

/**
 * Analisa uma fonte de pesquisa contra a documentação existente.
 * @param {string} produto - "axhub" | "axton" | "axcross"
 * @param {string} conteudo - texto completo da fonte
 * @returns {Object} resultado da análise
 */
export async function analisarFonte(produto, conteudo) {
  const mapa = await construirMapaCobertura(produto);
  const topicosEncontrados = extrairTopicosDoTexto(conteudo);

  const cobertura = [];
  const lacunas = [];

  for (const topico of topicosEncontrados) {
    const resultado = verificarCobertura(topico, mapa);
    cobertura.push({ topico, coberto: resultado.coberto, docs: resultado.docs });
    if (!resultado.coberto) lacunas.push(topico);
  }

  // Gera sugestões para cada lacuna
  const sugestoes = lacunas.map(lacuna => ({
    acao:    "criar",
    produto,
    secao:   sugerirSecao(lacuna, produto),
    titulo:  formatarTituloSugestao(lacuna),
    motivo:  `Tópico "${lacuna}" identificado na fonte mas sem documentação correspondente.`,
  }));

  // Agrupa sugestões por seção para eliminar duplicatas
  const sugestoesDeduplicadas = deduplicarSugestoes(sugestoes);

  const totalTopicos = cobertura.length;
  const totalCobertos = cobertura.filter(c => c.coberto).length;
  const percentualCobertura = totalTopicos > 0
    ? Math.round((totalCobertos / totalTopicos) * 100)
    : 0;

  return {
    topicosEncontrados,
    cobertura,
    lacunas,
    sugestoes: sugestoesDeduplicadas,
    totalTopicos,
    totalCobertos,
    percentualCobertura,
    analisadoEm: new Date(),
  };
}

/**
 * Retorna o mapa de cobertura atual do produto (para exibição no painel).
 */
export async function obterMapaCobertura(produto) {
  const mapa = await construirMapaCobertura(produto);
  const secoes = SECOES_LABELS[produto] || {};

  const agrupado = {};
  for (const doc of mapa) {
    const label = secoes[doc.secao] || doc.secao;
    if (!agrupado[label]) agrupado[label] = [];
    agrupado[label].push({ titulo: doc.titulo, caminho: doc.rel, headings: doc.headings });
  }

  return {
    produto,
    totalDocs: mapa.length,
    totalSecoes: Object.keys(agrupado).length,
    secoes: agrupado,
  };
}

/**
 * Consolida sugestões de TODAS as fontes de um produto.
 */
export async function consolidarSugestoes(fontes) {
  const todas = fontes.flatMap(f => f.analise?.sugestoes || []);
  return deduplicarSugestoes(todas).sort((a, b) => {
    // Ordena por seção e prioridade
    if (a.secao < b.secao) return -1;
    if (a.secao > b.secao) return 1;
    return a.titulo.localeCompare(b.titulo);
  });
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

function formatarTituloSugestao(topico) {
  return topico
    .replace(/^#{1,4}\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((p, i) => i === 0 ? p.charAt(0).toUpperCase() + p.slice(1) : p)
    .join(" ");
}

function deduplicarSugestoes(sugestoes) {
  const vistos = new Set();
  return sugestoes.filter(s => {
    const chave = normalizar(`${s.produto}/${s.secao}/${s.titulo}`);
    if (vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
}
