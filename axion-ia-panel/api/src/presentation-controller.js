/**
 * presentation-controller.js
 * Presentation Engine — Geração de PDF, DOCX e PPTX
 *
 * Outputs suportados:
 *   PDF   → Puppeteer (HTML → PDF)
 *   DOCX  → docx npm
 *   PPTX  → pptxgenjs
 */

import puppeteer from "puppeteer";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } from "docx";
import pptxgen from "pptxgenjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TMP_DIR = path.join(__dirname, "../../tmp/presentations");
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

// ─── Helpers ─────────────────────────────────────────────────────────────────

function tratar(err, res, msg = "Erro ao gerar documento") {
  console.error(`[Presentation] ${msg}:`, err.message);
  return res.status(500).json({ erro: msg, detalhe: err.message });
}

function gerarNomeArquivo(titulo, ext) {
  const slug = titulo.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 40);
  const ts = new Date().toISOString().slice(0, 10);
  return `${slug}-${ts}.${ext}`;
}

// ─── PDF ─────────────────────────────────────────────────────────────────────

/**
 * POST /presentation/pdf
 * Body: { titulo, html, orientacao? }
 * Retorna: PDF binary (application/pdf)
 */
export async function gerarPDF(req, res) {
  let browser;
  try {
    const { titulo = "Documento", html, orientacao = "portrait" } = req.body;
    if (!html) return res.status(400).json({ erro: "Campo 'html' obrigatório" });

    browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();

    const htmlCompleto = `
<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<style>
  body { font-family: Segoe UI, Arial, sans-serif; font-size: 12px; color: #1a1a1a; margin: 0; padding: 24px; }
  h1 { font-size: 20px; color: #1a56db; border-bottom: 2px solid #1a56db; padding-bottom: 8px; }
  h2 { font-size: 15px; color: #333; margin-top: 20px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  th { background: #1a56db; color: white; padding: 6px 10px; text-align: left; font-size: 11px; }
  td { padding: 5px 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
  tr:nth-child(even) { background: #f9fafb; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 600; }
  .badge-green { background: #d1fae5; color: #065f46; }
  .badge-red { background: #fee2e2; color: #991b1b; }
  .badge-yellow { background: #fef3c7; color: #92400e; }
  footer { margin-top: 32px; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 8px; }
</style></head><body>
${html}
<footer>Gerado por Axion IA Platform — ${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR")}</footer>
</body></html>`;

    await page.setContent(htmlCompleto, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      landscape: orientacao === "landscape",
      margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
      printBackground: true,
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${gerarNomeArquivo(titulo, "pdf")}"`,
      "Content-Length": pdf.length,
    });
    res.send(Buffer.from(pdf));
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    tratar(err, res, "Erro ao gerar PDF");
  }
}

// ─── DOCX ────────────────────────────────────────────────────────────────────

/**
 * POST /presentation/docx
 * Body: { titulo, secoes: [{ titulo, paragrafos[], tabela? }] }
 * Retorna: DOCX binary
 */
export async function gerarDOCX(req, res) {
  try {
    const { titulo = "Documento", secoes = [] } = req.body;

    const children = [
      new Paragraph({
        text: titulo,
        heading: HeadingLevel.TITLE,
        spacing: { after: 400 },
      }),
      new Paragraph({
        children: [new TextRun({ text: `Gerado em ${new Date().toLocaleDateString("pt-BR")}`, color: "888888", size: 18 })],
        spacing: { after: 400 },
      }),
    ];

    for (const secao of secoes) {
      if (secao.titulo) {
        children.push(new Paragraph({ text: secao.titulo, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
      }
      for (const p of (secao.paragrafos || [])) {
        children.push(new Paragraph({ children: [new TextRun({ text: p })], spacing: { after: 120 } }));
      }
      if (secao.tabela && secao.tabela.length > 0) {
        const linhas = secao.tabela.map(linha =>
          new TableRow({
            children: linha.map(cell =>
              new TableCell({
                width: { size: Math.floor(9000 / linha.length), type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: String(cell), size: 18 })] })],
              })
            ),
          })
        );
        children.push(new Table({ rows: linhas, width: { size: 9000, type: WidthType.DXA } }));
        children.push(new Paragraph({ text: "", spacing: { after: 200 } }));
      }
    }

    const doc = new Document({ sections: [{ children }] });
    const buffer = await Packer.toBuffer(doc);

    res.set({
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${gerarNomeArquivo(titulo, "docx")}"`,
      "Content-Length": buffer.length,
    });
    res.send(buffer);
  } catch (err) { tratar(err, res, "Erro ao gerar DOCX"); }
}

// ─── PPTX ────────────────────────────────────────────────────────────────────

/**
 * POST /presentation/pptx
 * Body: {
 *   titulo, subtitulo?,
 *   slides: [{ titulo, conteudo?, bullets?: string[], tipo?: "titulo"|"conteudo"|"dados" }]
 * }
 * Retorna: PPTX binary
 */
export async function gerarPPTX(req, res) {
  const nomeArquivo = gerarNomeArquivo(req.body?.titulo || "Apresentacao", "pptx");
  const caminhoArquivo = path.join(TMP_DIR, nomeArquivo);

  try {
    const { titulo = "Apresentação", subtitulo = "Axion Tecnologia", slides = [] } = req.body;

    const pptx = new pptxgen();
    pptx.layout = "LAYOUT_16x9";
    pptx.theme = { headFontFace: "Segoe UI", bodyFontFace: "Segoe UI" };

    // Slide capa
    const slideCapa = pptx.addSlide();
    slideCapa.background = { color: "1a56db" };
    slideCapa.addText(titulo, {
      x: 0.5, y: 1.5, w: "90%", h: 1.2,
      fontSize: 36, bold: true, color: "FFFFFF", align: "center",
    });
    slideCapa.addText(subtitulo, {
      x: 0.5, y: 2.9, w: "90%", h: 0.6,
      fontSize: 18, color: "93C5FD", align: "center",
    });
    slideCapa.addText(`Gerado em ${new Date().toLocaleDateString("pt-BR")} — Axion IA Platform`, {
      x: 0.5, y: 4.5, w: "90%", h: 0.4,
      fontSize: 11, color: "BFDBFE", align: "center",
    });

    // Slides de conteúdo
    for (const s of slides) {
      const slide = pptx.addSlide();
      slide.background = { color: "FFFFFF" };

      // Barra superior
      slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 0.7, fill: { color: "1a56db" } });
      slide.addText(s.titulo || "", {
        x: 0.3, y: 0.1, w: "95%", h: 0.5,
        fontSize: 18, bold: true, color: "FFFFFF",
      });

      let posY = 0.9;

      if (s.conteudo) {
        slide.addText(s.conteudo, { x: 0.4, y: posY, w: "92%", h: 0.8, fontSize: 14, color: "374151" });
        posY += 0.9;
      }

      if (s.bullets && s.bullets.length > 0) {
        const bulletText = s.bullets.map(b => ({ text: `• ${b}`, options: { fontSize: 13, color: "374151", breakLine: true } }));
        slide.addText(bulletText, { x: 0.4, y: posY, w: "92%", h: 5 - posY, fontSize: 13 });
      }
    }

    // Slide final
    const slideFinal = pptx.addSlide();
    slideFinal.background = { color: "111827" };
    slideFinal.addText("Obrigado", { x: 0.5, y: 2.0, w: "90%", h: 1, fontSize: 40, bold: true, color: "60CDFF", align: "center" });
    slideFinal.addText("axiontecnologia.com.br", { x: 0.5, y: 3.2, w: "90%", h: 0.5, fontSize: 16, color: "9CA3AF", align: "center" });

    await pptx.writeFile({ fileName: caminhoArquivo });

    const buffer = fs.readFileSync(caminhoArquivo);
    fs.unlinkSync(caminhoArquivo);

    res.set({
      "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
      "Content-Length": buffer.length,
    });
    res.send(buffer);
  } catch (err) {
    if (fs.existsSync(caminhoArquivo)) fs.unlinkSync(caminhoArquivo);
    tratar(err, res, "Erro ao gerar PPTX");
  }
}

// ─── TEMPLATES PRONTOS ────────────────────────────────────────────────────────

/**
 * POST /presentation/relatorio-missao
 * Gera PDF de relatório de missão a partir do ID
 */
export async function gerarRelatorioPDF(req, res) {
  try {
    const { missionId, dados } = req.body;

    // Monta HTML de relatório padrão
    const d = dados || {};
    const html = `
<h1>${d.titulo || "Relatório de Missão"}</h1>
<table>
  <tr><th>Cliente</th><td>${d.clienteNome || "—"}</td><th>Produto</th><td>${d.produto || "—"}</td></tr>
  <tr><th>Tipo</th><td>${d.tipo || "—"}</td><th>Status</th><td>${d.status || "—"}</td></tr>
  <tr><th>Início</th><td>${d.inicio ? new Date(d.inicio).toLocaleString("pt-BR") : "—"}</td>
      <th>Duração</th><td>${d.duracao_min ? d.duracao_min + " min" : "—"}</td></tr>
  <tr><th>Responsável</th><td>${d.responsavel || "—"}</td><th>Agente</th><td>${d.agente || "—"}</td></tr>
</table>
${d.resultado ? `
<h2>Resultado</h2>
<table>
  <tr><th>Sucesso</th><td><span class="badge ${d.resultado.sucesso ? "badge-green" : "badge-red"}">${d.resultado.sucesso ? "✓ Sim" : "✗ Não"}</span></td>
      <th>Score</th><td>${d.resultado.score ?? "—"}</td></tr>
  <tr><th>Verificados</th><td>${d.resultado.itensVerificados || 0}</td>
      <th>OK / Falha</th><td>${d.resultado.itensOk || 0} / ${d.resultado.itensFalha || 0}</td></tr>
</table>
${d.resultado.observacoes ? `<p>${d.resultado.observacoes}</p>` : ""}
` : ""}
${d.evidencias && d.evidencias.length > 0 ? `
<h2>Evidências (${d.evidencias.length})</h2>
<table>
  <tr><th>Tipo</th><th>Tela</th><th>Site</th><th>Capturado em</th><th>Descrição</th></tr>
  ${d.evidencias.map(e => `<tr><td>${e.tipo}</td><td>${e.tela || "—"}</td><td>${e.site || "—"}</td><td>${e.capturadoEm ? new Date(e.capturadoEm).toLocaleString("pt-BR") : "—"}</td><td>${e.descricao || "—"}</td></tr>`).join("")}
</table>` : ""}
`;

    req.body = { titulo: d.titulo || "Relatório de Missão", html };
    return gerarPDF(req, res);
  } catch (err) { tratar(err, res, "Erro ao gerar relatório"); }
}

/**
 * GET /presentation/templates
 * Lista templates disponíveis
 */
export function listarTemplates(req, res) {
  res.json({
    templates: [
      { id: "relatorio-missao", nome: "Relatório de Missão", formatos: ["pdf"] },
      { id: "auditoria-site",   nome: "Auditoria de Site",   formatos: ["pdf", "docx"] },
      { id: "conformidade",     nome: "Conformidade de Edital", formatos: ["pdf", "docx"] },
      { id: "apresentacao",     nome: "Apresentação Executiva", formatos: ["pptx"] },
    ]
  });
}
