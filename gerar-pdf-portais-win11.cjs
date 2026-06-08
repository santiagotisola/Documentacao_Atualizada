/**
 * Gerar PDF completo dos portais AxHub, AxTon e AxCross
 * Usa Puppeteer para renderizar cada página e concatenar em PDF
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:3099';

const portais = [
  {
    nome: 'AxTon',
    baseUrl: '/AxTon.Docs',
    paginas: [
      '/docs/',
      '/docs/primeiros-passos/login',
      '/docs/primeiros-passos/navegacao',
      '/docs/primeiros-passos/dashboard',
      '/docs/pesagem/iniciar-pesagem',
      '/docs/pesagem/postos',
      '/docs/pesagem/ticket-aberto',
      '/docs/pesagem/ticket-fechado',
      '/docs/pesagem/reclassificar',
      '/docs/pesagem/liberar-pesagem',
      '/docs/pesagem/motivos',
      '/docs/operacoes/cadastro-operacoes',
      '/docs/operacoes/monitoramento-online',
      '/docs/infracoes/exportacao',
      '/docs/cadastros/locais',
      '/docs/cadastros/classificacao-veiculos',
      '/docs/sistema/configuracoes',
      '/docs/administracao/usuarios',
      '/docs/administracao/perfis-acesso',
      '/docs/relatorios/relatorio-passagens',
    ]
  },
  {
    nome: 'AxHub',
    baseUrl: '/AxHub.Docs',
    paginas: [
      '/docs/',
      '/docs/primeiros-passos/login',
      '/docs/primeiros-passos/navegacao',
      '/docs/primeiros-passos/dashboard',
      '/docs/infracoes/triagem',
      '/docs/infracoes/auditoria',
      '/docs/infracoes/exportacao',
      '/docs/pesagem/postos',
      '/docs/pesagem/ticket-aberto',
      '/docs/pesagem/ticket-fechado',
      '/docs/operacoes/cadastro-operacoes',
      '/docs/operacoes/monitoramento-online',
      '/docs/cadastros-basicos/fabricantes',
      '/docs/relatorios/relatorio-passagens',
    ]
  },
  {
    nome: 'AxCross',
    baseUrl: '/AxCross.Docs',
    paginas: [
      '/docs/',
      '/docs/primeiros-passos/login',
      '/docs/primeiros-passos/navegacao',
      '/docs/primeiros-passos/dashboard',
      '/docs/operacoes/cadastro-operacoes',
      '/docs/operacoes/monitoramento-online',
      '/docs/operacoes/veiculos-monitorados',
      '/docs/operacoes/alertas',
      '/docs/cadastros/locais',
      '/docs/cadastros/equipamentos',
      '/docs/relatorios/relatorio-passagens',
      '/docs/administracao/usuarios',
      '/docs/sistema/configuracoes',
    ]
  }
];

async function gerarPDF() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });

  for (const portal of portais) {
    console.log(`\n📄 Gerando PDF: ${portal.nome}...`);
    const pdfPages = [];

    for (const pagina of portal.paginas) {
      const url = `${BASE}${portal.baseUrl}${pagina}`;
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
        // Remover navbar, sidebar e footer para PDF limpo
        await page.evaluate(() => {
          document.querySelectorAll('nav, .navbar, .theme-doc-sidebar-container, footer, .pagination-nav, .theme-doc-toc-desktop').forEach(el => el.remove());
          const main = document.querySelector('article') || document.querySelector('main');
          if (main) {
            main.style.maxWidth = '100%';
            main.style.padding = '2rem';
            main.style.margin = '0';
          }
        });
        const pdf = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: { top: '1.5cm', bottom: '1.5cm', left: '1.5cm', right: '1.5cm' }
        });
        pdfPages.push(pdf);
        console.log(`  ✓ ${pagina}`);
      } catch (err) {
        console.log(`  ✗ ${pagina} — ${err.message.substring(0, 60)}`);
      }
    }

    // Salvar PDF combinado usando PDFLib
    if (pdfPages.length > 0) {
      const { PDFDocument } = require('pdf-lib');
      const mergedPdf = await PDFDocument.create();
      
      for (const pdfBytes of pdfPages) {
        const doc = await PDFDocument.load(pdfBytes);
        const pages = await mergedPdf.copyPages(doc, doc.getPageIndices());
        pages.forEach(p => mergedPdf.addPage(p));
      }

      const outputPath = path.join(__dirname, `Manual-${portal.nome}-v1.0.0.pdf`);
      const mergedBytes = await mergedPdf.save();
      fs.writeFileSync(outputPath, mergedBytes);
      console.log(`  📁 Salvo: ${outputPath} (${(mergedBytes.length / 1024 / 1024).toFixed(1)} MB)`);
    }
  }

  await browser.close();
  console.log('\n✅ Todos os PDFs gerados!');
}

gerarPDF().catch(err => { console.error('ERRO:', err); process.exit(1); });
