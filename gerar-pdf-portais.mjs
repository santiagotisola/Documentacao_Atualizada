/**
 * gerar-pdf-portais.mjs
 * Gera PDFs completos do AxHub.Docs e AxCross.Docs.
 * Sobe um servidor HTTP temporário para cada build, garantindo que imagens e assets carreguem.
 * Uso: node gerar-pdf-portais.mjs [axhub|axcross|ambos]
 */

import puppeteer from "puppeteer-core";
import http from "http";
import { mkdir, writeFile, readFile } from "fs/promises";
import { existsSync, statSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUTPUT_DIR = path.join(__dirname, "pdfs");

const AXHUB_BUILD   = path.join(__dirname, "AxHub", "docs-portal", "build");
const AXCROSS_BUILD = path.join(__dirname, "AxCross", "docs-portal", "build");

// ── Páginas AxHub ─────────────────────────────────────────────────────────────
const AXHUB_PAGINAS = [
  "intro",
  "primeiros-passos/login",
  "primeiros-passos/navegacao",
  "primeiros-passos/dashboard",
  "infracoes/consulta-infracoes",
  "infracoes/triagem",
  "infracoes/manual-triagem",
  "infracoes/como-auditar-infracoes",
  "infracoes/guia-completo-infracoes",
  "infracoes/auditoria",
  "infracoes/exportacao",
  "infracoes/excecoes",
  "infracoes/infracoes-descartadas",
  "operacoes/cadastro-operacoes",
  "operacoes/faixas",
  "operacoes/afericoes",
  "operacoes/monitoramento-online",
  "operacoes/consulta-placas",
  "operacoes/eventos-equipamentos",
  "cadastros-basicos/equipamentos",
  "cadastros-basicos/grupos-equipamentos",
  "cadastros-basicos/tipos-equipamentos",
  "cadastros-basicos/modelos-equipamentos",
  "cadastros-basicos/fabricantes",
  "veiculos/classificacoes-veiculos",
  "veiculos/categorias-veiculo",
  "veiculos/tipos-veiculos",
  "veiculos/marcas-veiculos",
  "veiculos/modelos-veiculos",
  "veiculos/cores",
  "veiculos/especie-veiculo",
  "veiculos/municipios",
  "administracao/configuracoes-sistema",
  "administracao/enquadramentos",
  "administracao/configuracoes-enquadramento",
  "administracao/formas-autuacao",
  "administracao/motivos-descartes",
  "administracao/tarjas",
  "administracao/tipos-imagens",
  "administracao/tipos-afericoes",
  "administracao/layouts-arquivos",
  "administracao/sequenciais-infracoes",
  "administracao/sequenciais-lote-exportacao",
  "administracao/arcos",
  "administracao/regioes",
  "administracao/webhooks",
  "administracao/relatorios-power-bi",
  "controle-acesso/usuarios",
  "controle-acesso/perfis-acesso",
  "controle-acesso/permissoes",
  "controle-acesso/acessos-por-ip",
  "controle-acesso/logs-acesso",
  "relatorios/relatorio-infracoes",
  "relatorios/relatorio-passagens",
  "relatorios/fluxo-diario-veiculos",
  "relatorios/fluxo-diario-equipamento-faixa",
  "relatorios/processamento-imagens",
  "relatorios/processamento-por-usuario",
  "relatorios/eventos-equipamentos",
  "relatorios/falhas-sequenciais",
  "relatorios/lote-importacao",
  "relatorios/relatorio-discrepancias",
  "relatorios/relatorio-logs-envios",
  "relatorios/mapa-fluxo-passagens",
  "relatorios/power-bi",
  "medicoes/contratos",
  "medicoes/criar-medicao",
  "medicoes/indices-performance",
  "medicoes/interrupcoes",
  "medicoes/recursos",
  "medicoes/medicoes-finalizadas",
  "balanca/pesagem",
  "balanca/triagem-balanca",
  "pesagem/postos",
  "pesagem/ticket-aberto",
  "pesagem/ticket-fechado",
  "pesagem/liberar-pesagem",
  "pesagem/reclassificar",
  "pesagem/motivos",
  "cronotacografo/consulta",
  "cronotacografo/triagem",
  "referencia-tecnica/banco-de-dados",
  "referencia-tecnica/classificacao-veiculos-integracao",
  "referencia-tecnica/consulta-automatica-veiculos",
  "glossario/infracao",
  "glossario/autuacao",
  "glossario/enquadramento",
  "glossario/triagem",
  "glossario/afericao",
  "glossario/lote-exportacao",
  "glossario/cronotacografo",
  "glossario/medicao-desempenho",
];

// ── Páginas AxCross ───────────────────────────────────────────────────────────
const AXCROSS_PAGINAS = [
  "intro",
  "primeiros-passos/login",
  "primeiros-passos/navegacao",
  "primeiros-passos/dashboard",
  "operacoes/cadastro-operacoes",
  "operacoes/veiculos-monitorados",
  "operacoes/alertas",
  "operacoes/vigencia-alertas",
  "operacoes/monitoramento-online",
  "cadastros/equipamentos",
  "cadastros/grupos-equipamentos",
  "cadastros/faixas",
  "cadastros/locais",
  "administracao/usuarios",
  "administracao/perfis-acesso",
  "administracao/permissoes",
  "relatorios/relatorio-passagens",
  "sistema/configuracoes",
  "referencia-tecnica/banco-de-dados",
  "referencia-tecnica/classificacao-veiculos-integracao",
  "glossario/equipamento",
  "glossario/operacao",
  "glossario/passagem",
];

// ── Servidor HTTP estático temporário ───────────────────────────────────────
function mimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    ".html": "text/html; charset=utf-8",
    ".js":   "application/javascript",
    ".css":  "text/css",
    ".png":  "image/png",
    ".jpg":  "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif":  "image/gif",
    ".svg":  "image/svg+xml",
    ".ico":  "image/x-icon",
    ".webp": "image/webp",
    ".woff": "font/woff",
    ".woff2":"font/woff2",
    ".ttf":  "font/ttf",
    ".json": "application/json",
  }[ext] ?? "application/octet-stream";
}

async function iniciarServidor(buildDir, baseUrl, porta) {
  // normaliza baseUrl para que sempre termine com /
  const base = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";

  const server = http.createServer(async (req, res) => {
    let reqPath = req.url.split("?")[0];
    // remove prefixo baseUrl (ex: /AxHub.Docs/)
    if (reqPath.startsWith(base)) {
      reqPath = "/" + reqPath.slice(base.length);
    } else if (reqPath === base.slice(0, -1)) {
      reqPath = "/";
    }

    let filePath = path.join(buildDir, reqPath);
    // se for diretório, serve index.html
    if (existsSync(filePath) && statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    if (existsSync(filePath) && statSync(filePath).isFile()) {
      let content = await readFile(filePath);
      const mime = mimeType(filePath);
      // Strips lazy loading from HTML so images load immediately via HTTP
      if (mime.startsWith("text/html")) {
        content = Buffer.from(
          content.toString("utf-8")
            .replace(/\s+loading="lazy"/g, "")
            .replace(/\s+decoding="async"/g, "")
        );
      }
      res.writeHead(200, { "Content-Type": mime });
      res.end(content);
    } else {
      res.writeHead(404); res.end("Not found");
    }
  });

  await new Promise((resolve, reject) => {
    server.listen(porta, "127.0.0.1", resolve);
    server.on("error", reject);
  });
  return server;
}

// ── CSS para limpar a UI antes do PDF ─────────────────────────────────────────
const CSS_LIMPAR = `
  .navbar, .theme-doc-sidebar-container,
  .pagination-nav, .theme-doc-footer,
  nav.breadcrumbs, .table-of-contents,
  .theme-edit-this-page, .theme-admonition-note > .admonition-heading svg { display: none !important; }
  .main-wrapper { max-width: 100% !important; }
  .container { max-width: 860px !important; margin: 0 auto !important; }
  article { padding: 0 !important; }
  @media print { * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; } }
`;

// ── Gerar PDF de uma página via HTTP ────────────────────────────────────────
async function gerarPaginaPDF(browser, url) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900 });
  try {
    // networkidle0 aguarda todos os requests (incluindo imagens) terminarem.
    // Como o servidor já remove loading="lazy" do HTML, as imagens carregam normalmente.
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
    await page.addStyleTag({ content: CSS_LIMPAR });
    return await page.pdf({
      format: "A4",
      margin: { top: "20mm", right: "18mm", bottom: "22mm", left: "18mm" },
      printBackground: true,
    });
  } finally {
    await page.close();
  }
}

function lancarChrome() {
  return puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-web-security",
           "--disable-gpu", "--memory-pressure-off"],
  });
}

// ── Gerar PDF completo de um portal ──────────────────────────────────────────
const PAGINAS_POR_BROWSER = 20; // reinicia Chrome a cada N páginas

async function gerarPortal(nome, buildDir, baseUrl, porta, paginas, outputFile) {
  console.log(`\n📄 ${nome} — ${paginas.length} páginas`);

  // Sobe servidor HTTP temporário servindo o build na porta escolhida
  const servidor = await iniciarServidor(buildDir, baseUrl, porta);
  const base = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
  console.log(`  Servidor: http://127.0.0.1:${porta}${base}`);

  const buffers = [];
  let browser = null;

  try {
    for (let i = 0; i < paginas.length; i++) {
      // Reinicia o Chrome a cada PAGINAS_POR_BROWSER páginas
      if (i % PAGINAS_POR_BROWSER === 0) {
        if (browser) { try { await browser.close(); } catch {} }
        process.stdout.write(`  [Chrome] Iniciando instância ${Math.floor(i / PAGINAS_POR_BROWSER) + 1}...\n`);
        browser = await lancarChrome();
      }

      const slug = paginas[i];
      const url = slug === "intro"
        ? `http://127.0.0.1:${porta}${base}`
        : `http://127.0.0.1:${porta}${base}${slug}`;
      process.stdout.write(`  [${String(i + 1).padStart(2, "0")}/${paginas.length}] ${slug} ... `);
      try {
        const buf = await gerarPaginaPDF(browser, url);
        buffers.push(buf);
        console.log("ok");
      } catch (err) {
        console.log(`ERRO: ${err.message}`);
      }
    }
  } finally {
    if (browser) { try { await browser.close(); } catch {} }
    servidor.close();
  }

  // Concatenar PDFs usando o módulo pdf-lib se disponível, senão salvar separados
  try {
    const { PDFDocument } = await import("pdf-lib");
    const merged = await PDFDocument.create();
    for (const buf of buffers) {
      try {
        const doc = await PDFDocument.load(buf);
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach(p => merged.addPage(p));
      } catch { /* pula página com erro */ }
    }
    const finalBytes = await merged.save();
    await writeFile(outputFile, finalBytes);
    console.log(`  ✅ Salvo: ${path.basename(outputFile)} (${(finalBytes.length / 1024 / 1024).toFixed(1)} MB)`);
  } catch {
    // pdf-lib não instalado: salva o primeiro buffer como fallback
    if (buffers[0]) {
      await writeFile(outputFile, buffers[0]);
      console.log(`  ⚠️  pdf-lib não disponível — salvo apenas a 1ª página. Instale: npm install pdf-lib`);
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const arg = process.argv[2] ?? "ambos";

  if (!existsSync(OUTPUT_DIR)) await mkdir(OUTPUT_DIR, { recursive: true });

  if (arg === "axhub" || arg === "ambos") {
    await gerarPortal(
      "AxHub.Docs",
      AXHUB_BUILD,
      "/AxHub.Docs/",
      4010,
      AXHUB_PAGINAS,
      path.join(OUTPUT_DIR, `AxHub-Docs-Completo-${new Date().toISOString().slice(0,10)}.pdf`)
    );
  }

  if (arg === "axcross" || arg === "ambos") {
    await gerarPortal(
      "AxCross.Docs",
      AXCROSS_BUILD,
      "/AxCross.Docs/",
      4012,
      AXCROSS_PAGINAS,
      path.join(OUTPUT_DIR, `AxCross-Docs-Completo-${new Date().toISOString().slice(0,10)}.pdf`)
    );
  }

  console.log(`\n📁 PDFs em: ${OUTPUT_DIR}`);
}

main().catch(err => { console.error(err); process.exit(1); });
