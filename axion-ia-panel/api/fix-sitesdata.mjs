import { readFileSync, writeFileSync } from 'fs';

const file = 'C:/Users/Santiago/Axiondocs/Axion.Docs/axion-ia-panel/src/data/sitesData.js';
let content = readFileSync(file, 'utf8');

const axcrossStart = content.indexOf('export const AXCROSS_SITES');
const before = content.substring(0, axcrossStart);
let after = content.substring(axcrossStart);

// Adicionar versao: 'v.1.2.0' a sites AxCross que não têm o campo (CRLF e LF)
after = after.replace(
  /(\s+status: 'ativo',\r?\n)(\s+equipamentos:)/g,
  "$1    versao: 'v.1.2.0',\n$2"
);

// SMSTRR para AXHUB_SITES
const smstrr = `
  {
    id: 'smstrr',
    nome: 'SMSTRR',
    url: 'https://smstrr.axhub.axion.ws',
    estado: 'RR',
    orgao: 'Secretaria Municipal de Servi\u00e7os e Tr\u00e2nsito \u2014 Boa Vista',
    tipo: 'Tr\u00e2nsito Municipal',
    versao: 'v.1.1.0',
    menuCount: null,
    extras: [],
    status: 'ativo',
    bi: [],
    equipamentos: { total: 0, grupos: [] },
    fabricantes: [],
    ocr: null,
    operacoesColunas: [],
    passagensDia: null,
    observacoes: 'Boa Vista-RR. Vers\u00e3o v.1.1.0 confirmada em 21/07/2026.',
  },
`;

// smtt-cross para AXCROSS_SITES
const smttCross = `
  {
    id: 'smtt-cross',
    nome: 'SMTT',
    url: 'https://smtt.axcross.axion.ws',
    estado: 'AL',
    orgao: 'Superintend\u00eancia Municipal de Transportes e Tr\u00e2nsito',
    tipo: 'Tr\u00e2nsito Municipal',
    status: 'ativo',
    versao: 'v.1.2.0',
    equipamentos: null,
    faixas: null,
    alertas: null,
    veiculos: null,
    passagensDia: null,
    menuExtra: null,
    observacoes: 'Adicionado em 21/07/2026.',
  },
`;

// Inserir SMSTRR antes do ]; do AXHUB_SITES
const axhubEnd = before.lastIndexOf('];');
const newBefore = before.substring(0, axhubEnd) + smstrr + '];';

// Inserir smtt-cross antes do ]; do AXCROSS_SITES
const axcrossEnd = after.lastIndexOf('];');
const newAfter = after.substring(0, axcrossEnd) + smttCross + '];' + after.substring(axcrossEnd + 2);

const result = newBefore + newAfter;
writeFileSync(file, result, 'utf8');

// Verificar
console.log('smstrr:', result.includes("id: 'smstrr'"));
console.log('smtt-cross:', result.includes("id: 'smtt-cross'"));
const versaoEx = result.match(/id: 'derse-cross'[\s\S]{0,250}versao: '[^']+'/)?.[0]?.match(/versao: '[^']+'/)?.[0];
console.log('versao derse-cross:', versaoEx);
console.log('Concluído');
