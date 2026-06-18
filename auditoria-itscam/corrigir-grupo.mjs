#!/usr/bin/env node
/**
 * ══════════════════════════════════════════════════════════════
 * CORREÇÃO AUTOMÁTICA — Executa correções baseado em validação
 * ══════════════════════════════════════════════════════════════
 * 
 * Valida todos os equipamentos e executa correções necessárias
 * automaticamente.
 * 
 * USO:
 *   node auditoria-itscam/corrigir-grupo.mjs --sim
 *   node auditoria-itscam/corrigir-grupo.mjs --dry
 */

import { execSync } from 'child_process';

const args = process.argv.slice(2);
const hasFlag = (name) => args.includes(`--${name}`);

const AUTO_SIM = hasFlag('sim');
const DRY_RUN = hasFlag('dry');

if (!AUTO_SIM && !DRY_RUN) {
  console.log(`
  USO:
    node auditoria-itscam/corrigir-grupo.mjs --sim    (aplica correções)
    node auditoria-itscam/corrigir-grupo.mjs --dry    (apenas simula)
  `);
  process.exit(0);
}

console.log('═══════════════════════════════════════════════════════════════');
console.log(`  CORREÇÃO AUTOMÁTICA POR CASOS`);
console.log(`  Modo: ${DRY_RUN ? '🧪 SIMULAÇÃO' : '⚡ APLICAÇÃO REAL'}`);
console.log('═══════════════════════════════════════════════════════════════\n');

// Lista de casos para corrigir (excluindo 01 que requer acesso local, e 02/03 específicos)
const casos = ['04', '05', '06', '07', '08'];

let totalSucesso = 0;
let totalFalhas = 0;

for (const caso of casos) {
  console.log(`\n┌─── CASO ${caso}`);
  console.log(`│  Executando correções...\n`);
  
  try {
    const flags = DRY_RUN ? '--dry' : '--sim';
    const cmd = `node auditoria-itscam/corrigir.mjs --caso=${caso} --todos ${flags}`;
    
    const output = execSync(cmd, { 
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    // Extrair resumo do output
    const resumoMatch = output.match(/✅ Aplicados: (\d+).*?✅ Já OK: (\d+).*?❌ Falha: (\d+)/s);
    if (resumoMatch) {
      const aplicados = parseInt(resumoMatch[1]);
      const jaOk = parseInt(resumoMatch[2]);
      const falhas = parseInt(resumoMatch[3]);
      
      totalSucesso += aplicados;
      totalFalhas += falhas;
      
      console.log(`│  ✅ Aplicados: ${aplicados}`);
      console.log(`│  ✅ Já OK: ${jaOk}`);
      console.log(`│  ❌ Falhas: ${falhas}`);
    } else {
      console.log('│  ⚠️  Não foi possível extrair resultado');
    }
    
  } catch (error) {
    console.log(`│  ❌ Erro ao executar caso ${caso}`);
    totalFalhas++;
  }
}

console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`  ✅ Total corrigido: ${totalSucesso} equipamentos`);
console.log(`  ❌ Total com falha: ${totalFalhas} equipamentos`);
console.log('═══════════════════════════════════════════════════════════════\n');

process.exit(totalFalhas > 0 ? 1 : 0);
