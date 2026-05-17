import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType } from 'docx';
import { readFileSync, writeFileSync } from 'fs';

const mdPath = 'ANALISE-PROTECAO-IMAGENS-AZURE-COMPLETO.md';
const outputPath = 'ANALISE-PROTECAO-IMAGENS-AZURE-COMPLETO.docx';

const content = readFileSync(mdPath, 'utf-8');
const lines = content.split('\n');

const children = [];

for (const line of lines) {
  const trimmed = line.trim();

  if (trimmed === '' || trimmed === '---') {
    children.push(new Paragraph({ children: [new TextRun('')] }));
    continue;
  }

  if (trimmed.startsWith('# ')) {
    const text = trimmed.replace(/^# /, '').replace(/[*`]/g, '');
    children.push(new Paragraph({
      text,
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    }));
    continue;
  }

  if (trimmed.startsWith('## ')) {
    const text = trimmed.replace(/^## /, '').replace(/[*`]/g, '');
    children.push(new Paragraph({
      text,
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 150 },
    }));
    continue;
  }

  if (trimmed.startsWith('### ')) {
    const text = trimmed.replace(/^### /, '').replace(/[*`]/g, '');
    children.push(new Paragraph({
      text,
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 200, after: 100 },
    }));
    continue;
  }

  if (trimmed.startsWith('#### ')) {
    const text = trimmed.replace(/^#### /, '').replace(/[*`]/g, '');
    children.push(new Paragraph({
      children: [new TextRun({ text, bold: true, size: 22 })],
      spacing: { before: 160, after: 80 },
    }));
    continue;
  }

  // Tabelas pipe
  if (trimmed.startsWith('|')) {
    const cells = trimmed.split('|').filter(c => c.trim() !== '').map(c => c.trim());
    // Linha separadora de tabela
    if (cells.every(c => /^[-:]+$/.test(c))) continue;

    const isHeader = children.length > 0 && 
      children[children.length - 1]?.options?.style === 'table-header';

    const row = new TableRow({
      children: cells.map(cellText => new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ 
            text: cellText.replace(/\*\*/g, '').replace(/`/g, ''), 
            bold: isHeader,
            size: 18,
          })],
        })],
        width: { size: Math.floor(9000 / cells.length), type: WidthType.DXA },
        shading: isHeader ? { type: ShadingType.SOLID, color: '4472C4', fill: '4472C4' } : undefined,
      })),
    });

    // Procurar tabela existente ou criar nova
    const lastItem = children[children.length - 1];
    if (lastItem instanceof Table) {
      lastItem.root.push(row);
    } else {
      children.push(new Table({
        rows: [row],
        width: { size: 9000, type: WidthType.DXA },
      }));
    }
    continue;
  }

  // Blocos de código
  if (trimmed.startsWith('```')) {
    children.push(new Paragraph({
      children: [new TextRun({ text: '', size: 18 })],
    }));
    continue;
  }

  // Bullet points
  if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
    const text = trimmed.replace(/^[-*] /, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/`/g, '');
    children.push(new Paragraph({
      bullet: { level: 0 },
      children: [new TextRun({ text, size: 20 })],
    }));
    continue;
  }

  // Sub-bullet
  if (trimmed.startsWith('  - ') || trimmed.startsWith('  * ') || trimmed.startsWith('    - ')) {
    const text = trimmed.replace(/^\s+[-*] /, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/`/g, '');
    children.push(new Paragraph({
      bullet: { level: 1 },
      children: [new TextRun({ text, size: 20 })],
    }));
    continue;
  }

  // Parágrafo normal - limpar markdown inline
  const cleaned = trimmed
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^[✅❌⏰🔒📋📸🎥🌐☁️🖥️⚠️📄🛡️🎯💰]/u, '')
    .trim();

  if (cleaned) {
    const isBold = trimmed.startsWith('✅') || trimmed.startsWith('❌') || 
                   trimmed.startsWith('**') || trimmed.match(/^\d+\./);

    children.push(new Paragraph({
      children: [new TextRun({ 
        text: cleaned, 
        size: 20,
        bold: isBold,
      })],
      spacing: { after: 80 },
    }));
  }
}

const doc = new Document({
  creator: 'Axion Tecnologia',
  title: 'Análise de Proteção de Imagens - Azure Blob Storage',
  description: 'Arquitetura completa de proteção e backup com Azure Blob Storage',
  styles: {
    paragraphStyles: [
      {
        id: 'Heading1',
        name: 'Heading 1',
        run: { size: 36, bold: true, color: '1F4E78', font: 'Calibri' },
        paragraph: { spacing: { before: 400, after: 200 } },
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        run: { size: 28, bold: true, color: '2E74B5', font: 'Calibri' },
        paragraph: { spacing: { before: 300, after: 150 } },
      },
      {
        id: 'Heading3',
        name: 'Heading 3',
        run: { size: 24, bold: true, color: '4472C4', font: 'Calibri' },
        paragraph: { spacing: { before: 200, after: 100 } },
      },
    ],
  },
  sections: [{
    properties: {
      page: {
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    children,
  }],
});

const buffer = await Packer.toBuffer(doc);
writeFileSync(outputPath, buffer);
console.log('Documento Word gerado com sucesso!');
console.log('Arquivo:', outputPath);
console.log('Tamanho:', (buffer.length / 1024).toFixed(2), 'KB');
