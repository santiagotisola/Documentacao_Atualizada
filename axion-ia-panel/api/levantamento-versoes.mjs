import { AXHUB_SITES, AXCROSS_SITES } from '../src/data/sitesData.js';

const todos = [
  ...AXHUB_SITES.map(s => ({ ...s, sistema: 'AxHub' })),
  ...AXCROSS_SITES.map(s => ({ ...s, sistema: 'AxCross' })),
];

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║  LEVANTAMENTO DE VERSÕES — ' + new Date().toLocaleDateString('pt-BR') + '                  ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

const axhub  = todos.filter(s => s.sistema === 'AxHub');
const axcross = todos.filter(s => s.sistema === 'AxCross');

console.log(`AxHub (${axhub.length} sites) — versões conhecidas: ${axhub.filter(s=>s.versao).length}`);
console.log('─'.repeat(72));
axhub.forEach(s => {
  const v  = s.versao ? s.versao.padEnd(10) : '❓ pendente';
  const st = s.status === 'ativo' ? '✅' : '⚠️ ';
  console.log(`  ${st} ${s.nome.padEnd(14)} ${v}  ${s.url}`);
});

console.log(`\nAxCross (${axcross.length} sites) — versões conhecidas: ${axcross.filter(s=>s.versao).length}`);
console.log('─'.repeat(72));
axcross.forEach(s => {
  const v  = s.versao ? s.versao.padEnd(10) : '❓ pendente';
  const st = s.status === 'ativo' ? '✅' : '⚠️ ';
  console.log(`  ${st} ${s.nome.padEnd(14)} ${v}  ${s.url}`);
});

console.log('\n📊 Resumo:');
console.log(`   Total de sites: ${todos.length} (${axhub.length} AxHub + ${axcross.length} AxCross)`);
console.log(`   Versão confirmada: ${todos.filter(s=>s.versao).length}`);
console.log(`   Versão pendente:   ${todos.filter(s=>!s.versao).length}`);
