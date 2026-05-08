/**
 * gerar-knowledge-base.mjs
 * Lê todos os .md de cada portal de docs e gera os knowledge-base.json
 * para os widgets de suporte de AxHub, AxTon e AxCross.
 *
 * Uso: node gerar-knowledge-base.mjs
 *      node gerar-knowledge-base.mjs --dry-run   (exibe no console sem gravar)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.argv.includes("--dry-run");

// ─── Configuração dos portais ─────────────────────────────────────────────────

const PORTALS = [
  {
    system: "AxHub",
    docsDir: path.join(__dirname, "AxHub/docs-portal/docs"),
    outputFile: path.join(__dirname, "AxHub/widget/knowledge-base.json"),
    version: "4.0.0",
    description: "Base de conhecimento do assistente AxionIA para o sistema AxHub — gestão de equipamentos de fiscalização",
  },
  {
    system: "AxTon",
    docsDir: path.join(__dirname, "AxTon/docs-portal/docs"),
    outputFile: path.join(__dirname, "AxTon/widget/knowledge-base.json"),
    version: "3.0.0",
    description: "Base de conhecimento do assistente AxionIA para o sistema AxTon — pesagem veicular",
    dataSourceLinks: {
      documentation: "/AxTon.Docs/",
      database: "AxTon.sql",
      widget: "axton-suporte.js",
      searchBase: "base-pesquisa-suporte.md",
    },
  },
  {
    system: "AxCross",
    docsDir: path.join(__dirname, "AxCross/docs-portal/docs"),
    outputFile: path.join(__dirname, "AxCross/widget/knowledge-base.json"),
    version: "2.0.0",
    description: "Base de conhecimento do assistente AxionIA para o sistema AxCross — monitoramento por cruzamento de placas",
  },
];

// ─── Mapeamento de módulos (pasta → nome legível) ─────────────────────────────

const MODULE_NAMES = {
  "primeiros-passos": "Primeiros Passos",
  "administracao": "Administração",
  "cadastros-basicos": "Cadastros Básicos",
  "cadastros": "Cadastros",
  "controle-acesso": "Controle de Acesso",
  "balanca": "Balança",
  "pesagem": "Pesagem",
  "veiculos": "Veículos",
  "medicoes": "Medições",
  "operacoes": "Operações",
  "infracoes": "Infrações",
  "relatorios": "Relatórios",
  "referencia-tecnica": "Referência Técnica",
  "glossario": "Glossário",
  "cronotacografo": "Cronotacógrafo",
  "sistema": "Sistema",
  "root": "Geral",
};

// ─── Keywords extras por módulo ───────────────────────────────────────────────

const MODULE_KEYWORDS = {
  "primeiros-passos": ["login", "acesso", "senha", "entrar", "primeiro acesso", "inicio", "começar"],
  "administracao": ["configuracao", "administracao", "sistema", "admin", "configurar"],
  "cadastros-basicos": ["cadastro", "registrar", "criar", "novo", "adicionar"],
  "cadastros": ["cadastro", "registrar", "criar", "novo", "adicionar"],
  "controle-acesso": ["usuario", "permissao", "perfil", "acesso", "grupo", "papel"],
  "balanca": ["balanca", "peso", "medicao", "sensor", "pesagem"],
  "pesagem": ["pesagem", "peso", "veiculo", "balanca", "pesar", "ticket"],
  "veiculos": ["veiculo", "carro", "caminhao", "placa", "tipo veiculo"],
  "medicoes": ["medicao", "aferição", "sensor", "calibrar"],
  "operacoes": ["operacao", "equipamento", "faixa", "radar", "camera"],
  "infracoes": ["infracao", "multa", "auto", "autuacao", "triagem", "exportacao"],
  "relatorios": ["relatorio", "exportar", "consulta", "dados", "planilha"],
  "referencia-tecnica": ["api", "integracao", "tecnico", "referencia", "documentacao"],
  "glossario": ["glossario", "termo", "definicao", "conceito", "significado"],
  "sistema": ["sistema", "configuracao", "parametro", "opcao"],
  "root": [],
};

// ─── Helpers de parsing ───────────────────────────────────────────────────────

function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!match) return { title: null, description: null, rest: content };

  const fm = match[1];
  const title = (fm.match(/^title:\s*["']?(.+?)["']?\s*$/m) || [])[1]?.trim() ?? null;
  const description = (fm.match(/^description:\s*["']?(.+?)["']?\s*$/m) || [])[1]?.trim() ?? null;
  return { title, description, rest: content.slice(match[0].length) };
}

function extractH1(text) {
  const m = text.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : null;
}

function extractHeadings(text) {
  const headings = [];
  for (const m of text.matchAll(/^#{2,4}\s+(.+)$/gm)) {
    headings.push(m[1].trim());
  }
  return headings;
}

function extractFirstParagraph(text) {
  // Remove headers, images, tables, blank lines
  const lines = text.split("\n");
  const paragraphLines = [];
  let inTable = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("#")) continue;
    if (trimmed.startsWith("!")) continue; // image
    if (trimmed.startsWith("|")) { inTable = true; continue; }
    if (inTable && !trimmed.startsWith("|")) { inTable = false; }
    if (inTable) continue;
    paragraphLines.push(trimmed);
    if (paragraphLines.length >= 3) break;
  }

  return paragraphLines.join(" ").replace(/\*\*/g, "").replace(/\*/g, "").trim();
}

function extractSteps(text) {
  // Procura seções de "como fazer" com listas numeradas
  const steps = [];
  const orderedListRe = /^\d+\.\s+(.+)$/gm;
  for (const m of text.matchAll(orderedListRe)) {
    const step = m[1].replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim();
    if (step.length > 3) steps.push(step);
  }
  return steps.slice(0, 10); // máximo 10 passos
}

function extractPath(text) {
  // Busca "Menu lateral" ou "Como acessar" + conteúdo
  const pathPattern = text.match(/(?:Menu lateral|Como acessar|Acesso)[^\n]*[-→:]\s*([^\n]{5,80})/i);
  if (pathPattern) {
    return pathPattern[1]
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[-→]/g, "→")
      .trim();
  }
  // Fallback: pega linha com "Menu lateral"
  const menuLine = text.match(/Menu lateral[^\n]{0,80}/i);
  if (menuLine) {
    return menuLine[0]
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/[-→]/g, "→")
      .trim();
  }
  return null;
}

function extractRelated(text) {
  // Busca tabela "Navegacao relacionada"
  const related = [];
  const navSection = text.match(/##\s+Navegac[aã]o relacionada([\s\S]*?)(?:##|$)/i);
  if (navSection) {
    for (const m of navSection[1].matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)) {
      // extrai o path do link e gera um id
      const linkPath = m[2]
        .replace(/^\.\.\//, "")
        .replace(/^\.\//, "")
        .replace(/\.md$/, "")
        .replace(/\//g, "-");
      related.push(linkPath);
    }
  }
  return related.slice(0, 5);
}

function generateKeywords(title, description, headings, module) {
  const rawTerms = [title ?? "", description ?? "", ...(headings ?? [])];
  const text = rawTerms.join(" ").toLowerCase();

  // Remove caracteres especiais e divide em palavras
  const words = text
    .replace(/[^\w\sáéíóúâêôãõàü]/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));

  // Deduplicar
  const unique = [...new Set(words)];

  // Adicionar keywords do módulo
  const moduleKW = MODULE_KEYWORDS[module] ?? [];

  // Adicionar variações do título
  const titleKws = [
    title?.toLowerCase(),
    title?.toLowerCase().replace(/ção/g, "cao").replace(/ções/g, "coes").replace(/ã/g, "a").replace(/é/g, "e").replace(/á/g, "a").replace(/ú/g, "u").replace(/ó/g, "o").replace(/í/g, "i").replace(/ê/g, "e").replace(/â/g, "a").replace(/ô/g, "o"),
  ].filter(Boolean);

  return [...new Set([...titleKws, ...unique.slice(0, 6), ...moduleKW.slice(0, 4)])].slice(0, 15);
}

const STOPWORDS = new Set([
  "para", "como", "com", "uma", "este", "essa", "esse", "esta", "pelo", "pela",
  "seus", "suas", "quando", "onde", "qual", "quais", "após", "antes", "entre",
  "cada", "todo", "toda", "todos", "todas", "mais", "menos", "muito", "pouco",
  "pode", "deve", "será", "foram", "são", "está", "estão", "pelo", "pela",
  "mais", "para", "pelo", "pela", "num", "numa", "nos", "nas", "dos", "das",
  "pelo", "pela", "ser", "ter", "que", "não", "sim", "tem", "vez", "tipo",
]);

function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function moduleFromDir(dirName) {
  return MODULE_NAMES[dirName] ?? dirName;
}

// ─── Parser principal de arquivo .md ─────────────────────────────────────────

function parseMdFile(filePath, docsDir, system) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { title: fmTitle, description: fmDesc, rest } = parseFrontmatter(raw);

  const h1 = extractH1(rest);
  const title = fmTitle ?? h1 ?? path.basename(filePath, ".md");
  const description = fmDesc ?? extractFirstParagraph(rest);
  const headings = extractHeadings(rest);

  // Caminho relativo dentro de docs/
  const relPath = path.relative(docsDir, filePath).replace(/\\/g, "/");
  const docUrl = relPath.replace(/\.md$/, "");

  // Módulo = pasta pai (ou 'root' se for direto em docs/)
  const parts = relPath.split("/");
  const moduleDir = parts.length > 1 ? parts[0] : "root";
  const moduleLabel = moduleFromDir(moduleDir);

  // ID = slugify do docUrl
  const id = slugify(docUrl);

  const steps = extractSteps(rest);
  const pathStr = extractPath(rest);
  const related = extractRelated(rest);
  const keywords = generateKeywords(title, description, headings, moduleDir);

  return {
    id,
    title,
    module: moduleLabel,
    keywords,
    content: description,
    steps,
    path: pathStr ?? `Menu lateral → ${moduleLabel} → ${title}`,
    docUrl,
    related,
    dbTables: [],
  };
}

// ─── Coleta todos os .md de um portal ────────────────────────────────────────

function collectMdFiles(docsDir) {
  const results = [];

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Pula pastas de imagens e pastas especiais
        if (["img", "images", ".docusaurus", "node_modules", "build"].includes(entry.name)) continue;
        walk(full);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        // Pula intro.md e glossário (conteúdo genérico)
        if (["intro.md"].includes(entry.name)) continue;
        results.push(full);
      }
    }
  }

  walk(docsDir);
  return results.sort();
}

// ─── Gera um portal completo ──────────────────────────────────────────────────

function generatePortal(portal) {
  const { system, docsDir, outputFile, version, description, dataSourceLinks } = portal;

  console.log(`\n${"─".repeat(60)}`);
  console.log(`  ${system} → ${path.relative(__dirname, docsDir)}`);
  console.log(`${"─".repeat(60)}`);

  if (!fs.existsSync(docsDir)) {
    console.warn(`  ⚠️  Pasta não encontrada: ${docsDir}`);
    return;
  }

  const mdFiles = collectMdFiles(docsDir);
  console.log(`  📄 ${mdFiles.length} arquivos .md encontrados`);

  const entries = [];
  let errors = 0;

  for (const filePath of mdFiles) {
    try {
      const entry = parseMdFile(filePath, docsDir, system);
      entries.push(entry);
      console.log(`  ✅ ${entry.docUrl} — "${entry.title}"`);
    } catch (err) {
      console.error(`  ❌ ${filePath}: ${err.message}`);
      errors++;
    }
  }

  const output = {
    version,
    updated: new Date().toISOString().split("T")[0],
    system,
    description,
    ...(dataSourceLinks ? { dataSourceLinks } : {}),
    totalEntries: entries.length,
    entries,
  };

  if (DRY_RUN) {
    console.log(`\n  [DRY-RUN] Saída para: ${path.relative(__dirname, outputFile)}`);
    console.log(`  Total: ${entries.length} entradas, ${errors} erros`);
  } else {
    fs.writeFileSync(outputFile, JSON.stringify(output, null, 2), "utf-8");
    console.log(`\n  💾 Gravado: ${path.relative(__dirname, outputFile)}`);
    console.log(`  Total: ${entries.length} entradas, ${errors} erros`);
  }
}

// ─── Entry point ──────────────────────────────────────────────────────────────

console.log("╔══════════════════════════════════════════════════════════╗");
console.log("║   GERADOR DE KNOWLEDGE-BASE.JSON — Axion Docs            ║");
console.log(`║   ${new Date().toLocaleString("pt-BR")}${" ".repeat(Math.max(0, 39 - new Date().toLocaleString("pt-BR").length))}║`);
console.log(DRY_RUN ? "║   MODE: DRY-RUN (nenhum arquivo será gravado)            ║" : "║   MODE: PRODUÇÃO                                         ║");
console.log("╚══════════════════════════════════════════════════════════╝");

for (const portal of PORTALS) {
  generatePortal(portal);
}

console.log("\n✨ Concluído!\n");
