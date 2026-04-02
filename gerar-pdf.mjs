import puppeteer from "puppeteer-core";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUTPUT_DIR = path.join(__dirname, "pdfs");

const DOCS = [
  {
    url: "http://localhost:3010/AxHub.Docs/referencia-tecnica/classificacao-veiculos-integracao",
    file: "AxHub - Classificacao de Veiculos - Integracao.pdf",
  },
  {
    url: "http://localhost:3012/AxCross.Docs/referencia-tecnica/classificacao-veiculos-integracao",
    file: "AxCross - Classificacao de Veiculos - Integracao.pdf",
  },
  {
    url: "http://localhost:3010/AxHub.Docs/referencia-tecnica/consulta-automatica-veiculos",
    file: "AxHub - Consulta Automatica de Dados de Veiculos.pdf",
  },
];

async function gerarPDF(browser, url, outputPath) {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

  // Esconder nav lateral e header para o PDF ficar mais limpo
  await page.addStyleTag({
    content: `
      .navbar, .theme-doc-sidebar-container,
      .pagination-nav, .theme-doc-footer,
      nav.breadcrumbs, .table-of-contents { display: none !important; }
      .main-wrapper { max-width: 100% !important; }
      .container { max-width: 900px !important; margin: 0 auto !important; }
      article { padding: 0 !important; }
      @media print { * { color-adjust: exact !important; } }
    `,
  });

  await page.pdf({
    path: outputPath,
    format: "A4",
    margin: { top: "25mm", right: "20mm", bottom: "25mm", left: "20mm" },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size:9px;width:100%;text-align:center;color:#666;padding:0 20mm;">
        Axion Tecnologia — Documentação Técnica
      </div>`,
    footerTemplate: `
      <div style="font-size:9px;width:100%;text-align:center;color:#666;padding:0 20mm;">
        Página <span class="pageNumber"></span> de <span class="totalPages"></span>
      </div>`,
  });

  await page.close();
  console.log(`  [OK] ${path.basename(outputPath)}`);
}

async function main() {
  if (!existsSync(OUTPUT_DIR)) await mkdir(OUTPUT_DIR, { recursive: true });

  console.log("Iniciando Chrome...");
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  console.log("Gerando PDFs...");
  for (const doc of DOCS) {
    const outputPath = path.join(OUTPUT_DIR, doc.file);
    process.stdout.write(`  Processando: ${doc.file} ... `);
    try {
      await gerarPDF(browser, doc.url, outputPath);
    } catch (err) {
      console.error(`\n  [ERRO] ${doc.file}: ${err.message}`);
    }
  }

  await browser.close();
  console.log(`\nPDFs salvos em: ${OUTPUT_DIR}`);
}

main().catch(console.error);
