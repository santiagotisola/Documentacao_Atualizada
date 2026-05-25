import XLSX from 'xlsx';
import { writeFileSync } from 'fs';

const wb = XLSX.readFile('ID ZERO TIER MASTER.xlsx');

console.log('=== PLANILHA: ID ZERO TIER MASTER.xlsx ===');
console.log(`Abas (sheets): ${wb.SheetNames.join(', ')}`);
console.log('');

const resultado = {};

for (const sheetName of wb.SheetNames) {
  const ws = wb.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
  
  console.log(`\n--- Aba: "${sheetName}" ---`);
  console.log(`Linhas: ${data.length}`);
  
  if (data.length > 0) {
    const colunas = Object.keys(data[0]);
    console.log(`Colunas (${colunas.length}): ${colunas.join(' | ')}`);
    
    // Amostras
    console.log('\nPrimeiras 5 linhas:');
    for (let i = 0; i < Math.min(5, data.length); i++) {
      console.log(JSON.stringify(data[i]));
    }
    
    // Estatísticas por coluna
    console.log('\nEstatísticas por coluna:');
    for (const col of colunas) {
      const valores = data.map(r => r[col]).filter(v => v !== '' && v !== null && v !== undefined);
      const unicos = new Set(valores);
      console.log(`  ${col}: ${valores.length} preenchidos, ${unicos.size} únicos`);
      if (unicos.size <= 20 && unicos.size > 0) {
        // Mostrar distribuição
        const dist = {};
        valores.forEach(v => { dist[v] = (dist[v] || 0) + 1; });
        const sorted = Object.entries(dist).sort((a, b) => b[1] - a[1]);
        console.log(`    Valores: ${sorted.map(([k, v]) => `${k}(${v})`).join(', ')}`);
      }
    }
  }
  
  resultado[sheetName] = data;
}

// Exportar tudo como JSON para análise mais detalhada
writeFileSync('id-zero-tier-master-dados.json', JSON.stringify(resultado, null, 2));
console.log('\n\n=== Dados completos exportados para id-zero-tier-master-dados.json ===');
