/**
 * gerar-pdf-lgpd.mjs
 * Gera PDF da Política de Privacidade LGPD a partir do Markdown.
 * Uso: node gerar-pdf-lgpd.mjs
 */

import puppeteer from "puppeteer-core";
import { readFileSync, existsSync } from "fs";
import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const INPUT = path.join(__dirname, "pdfs", "POLITICA-PRIVACIDADE-LGPD-AXION.md");
const OUTPUT = path.join(__dirname, "pdfs", "POLITICA-PRIVACIDADE-LGPD-AXION.pdf");

// Converte markdown básico para HTML
function mdToHtml(md) {
  let html = md
    // Escape HTML
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    // Headings
    .replace(/^######\s+(.+)$/gm, "<h6>$1</h6>")
    .replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>")
    .replace(/^####\s+(.+)$/gm, "<h4>$1</h4>")
    .replace(/^###\s+(.+)$/gm, "<h3>$1</h3>")
    .replace(/^##\s+(.+)$/gm, "<h2>$1</h2>")
    .replace(/^#\s+(.+)$/gm, "<h1>$1</h1>")
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Inline code
    .replace(/`(.+?)`/g, "<code>$1</code>")
    // Horizontal rule
    .replace(/^---$/gm, "<hr>")
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Unordered lists
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    // Checkmarks
    .replace(/❌/g, "&#10060;")
    .replace(/✅/g, "&#9989;")
    .replace(/⚠️/g, "&#9888;&#65039;");

  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");

  // Tables
  html = html.replace(/^(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)+)/gm, (match, header, sep, body) => {
    const headers = header.split("|").filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join("");
    const rows = body.trim().split("\n").map(row => {
      const cells = row.split("|").filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join("");
      return `<tr>${cells}</tr>`;
    }).join("");
    return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
  });

  // Paragraphs (lines that aren't already wrapped)
  html = html.split("\n").map(line => {
    const trimmed = line.trim();
    if (!trimmed) return "";
    if (/^<(h[1-6]|ul|ol|li|table|thead|tbody|tr|th|td|hr|div|p)/.test(trimmed)) return line;
    return `<p>${trimmed}</p>`;
  }).join("\n");

  return html;
}

async function main() {
  if (!existsSync(INPUT)) {
    console.error("❌ Arquivo não encontrado:", INPUT);
    process.exit(1);
  }

  const md = readFileSync(INPUT, "utf-8");
  const bodyHtml = mdToHtml(md);

  const fullHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  @page { margin: 2cm 2.5cm; }
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #1a1a1a;
  }
  h1 { font-size: 18pt; color: #0d47a1; border-bottom: 3px solid #0d47a1; padding-bottom: 8px; margin-top: 30px; }
  h2 { font-size: 14pt; color: #1565c0; margin-top: 24px; border-bottom: 1px solid #e0e0e0; padding-bottom: 4px; }
  h3 { font-size: 12pt; color: #1976d2; margin-top: 18px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 10pt; }
  th { background: #e3f2fd; color: #0d47a1; text-align: left; padding: 8px 10px; border: 1px solid #bbdefb; }
  td { padding: 6px 10px; border: 1px solid #e0e0e0; }
  tr:nth-child(even) td { background: #fafafa; }
  code { background: #f5f5f5; padding: 2px 5px; border-radius: 3px; font-size: 10pt; }
  hr { border: none; border-top: 2px solid #e0e0e0; margin: 20px 0; }
  ul { padding-left: 20px; }
  li { margin-bottom: 4px; }
  a { color: #1565c0; text-decoration: none; }
  strong { color: #0d47a1; }
  .footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 8pt; color: #666; border-top: 1px solid #e0e0e0; padding-top: 5px; }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;

  await mkdir(path.dirname(OUTPUT), { recursive: true });

  console.log("🚀 Gerando PDF da Política de Privacidade LGPD...");

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(fullHtml, { waitUntil: "networkidle0" });

  await page.pdf({
    path: OUTPUT,
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-size:8pt;width:100%;text-align:center;color:#999;padding-top:5px;">Axion Tecnologia — Política de Privacidade e Proteção de Dados Pessoais (LGPD)</div>`,
    footerTemplate: `<div style="font-size:8pt;width:100%;text-align:center;color:#999;padding-bottom:5px;">Página <span class="pageNumber"></span> de <span class="totalPages"></span> | Versão 1.0 — Maio/2026</div>`,
    margin: { top: "80px", bottom: "60px", left: "60px", right: "60px" },
  });

  await browser.close();
  console.log("✅ PDF gerado com sucesso:", OUTPUT);
}

main().catch(err => { console.error("❌ Erro:", err.message); process.exit(1); });
