#!/usr/bin/env node
/**
 * ══════════════════════════════════════════════════════════════
 * CORREÇÃO — VehicleType = 3 (Todos os tipos de veículos)
 * ══════════════════════════════════════════════════════════════
 * 
 * Corrige o problema CRÍTICO de equipamentos configurados para
 * ler APENAS carros (vehicleType=1), ignorando motos, caminhões
 * e ônibus.
 * 
 * USO:
 *   node auditoria-itscam/corrigir-vehicletype.mjs --equip=GOEC6O009
 *   node auditoria-itscam/corrigir-vehicletype.mjs --todos
 *   node auditoria-itscam/corrigir-vehicletype.mjs --todos --sim
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const TUNNEL_BASE = 'https://{UUID}-80.tunnel.varco.cloud';
const CREDENTIALS = { username: 'admin', password: '#econocr@' };
const TIMEOUT_MS = 25000;
const LOG_DIR = './auditoria-itscam/logs-correcao';

const args = process.argv.slice(2);
const getArg = (name) => args.find(a => a.startsWith(`--${name}=`))?.split('=')[1] || null;
const hasFlag = (name) => args.includes(`--${name}`);

const FILTRO_EQUIP = getArg('equip');
const TODOS = hasFlag('todos');
const AUTO_SIM = hasFlag('sim');
const DRY_RUN = hasFlag('dry');

if (!FILTRO_EQUIP && !TODOS) {
  console.log(`
  USO:
    node auditoria-itscam/corrigir-vehicletype.mjs --equip=GOEC6O009
    node auditoria-itscam/corrigir-vehicletype.mjs --todos
    node auditoria-itscam/corrigir-vehicletype.mjs --todos --sim
    node auditoria-itscam/corrigir-vehicletype.mjs --dry
  `);
  process.exit(0);
}

// Equipamentos com vehicleType = 1 (somente carros)
const EQUIPAMENTOS = [
  { nome: 'GOEC6O009 - Faixa 1', uuid: 'c296d7bf-0d3b-4da1-bf1d-3e4fe998e4a1' },
  { nome: 'GOEC6O009 - Faixa 2', uuid: 'ef0e72ca-d3a5-4f4e-bbf6-40f3737bda3f' },
];

const ENDPOINT_LEITURA = '/api/equipment/ocr';
const ENDPOINT_ESCRITA = '/api/equipment/ocr';

// ═══════════════════════════════════════════════════════════════
// FUNÇÕES
// ═══════════════════════════════════════════════════════════════

async function autenticar(baseUrl) {
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    const res = await fetch(`${baseUrl}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ params: CREDENTIALS }),
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.token || data.access_token || null;
  } catch { return null; }
}

async function ler(baseUrl, token, endpoint) {
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    const res = await fetch(`${baseUrl}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function gravar(baseUrl, token, endpoint, payload) {
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    const res = await fetch(`${baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    return res.ok;
  } catch { return false; }
}

function validar(data) {
  const ocr = data?.ocr || data || {};
  const erros = [];
  if (ocr.vehicleType !== 3) {
    erros.push(`vehicleType=${ocr.vehicleType} (correto: 3)`);
  }
  return { ok: erros.length === 0, erros };
}

function buildPayload(data) {
  const ocr = data?.ocr ? JSON.parse(JSON.stringify(data.ocr)) : {};
  ocr.vehicleType = 3;
  return { ocr };
}

// ═══════════════════════════════════════════════════════════════
// EXECUÇÃO
// ═══════════════════════════════════════════════════════════════

console.log('═══════════════════════════════════════════════════════════════');
console.log('  CORREÇÃO — VehicleType = 3 (Todos os tipos de veículos)');
console.log(`  Modo: ${DRY_RUN ? '🧪 SIMULAÇÃO' : '⚡ APLICAÇÃO REAL'}`);
console.log('═══════════════════════════════════════════════════════════════\n');

const filtrados = EQUIPAMENTOS.filter(e => 
  !FILTRO_EQUIP || e.nome.toLowerCase().includes(FILTRO_EQUIP.toLowerCase())
);

if (filtrados.length === 0) {
  console.log('  ❌ Nenhum equipamento encontrado\n');
  process.exit(1);
}

if (!DRY_RUN && !AUTO_SIM && TODOS) {
  console.log(`\n  ⚠️  Aplicar em ${filtrados.length} equipamentos?`);
  console.log(`      ${filtrados.map(e => e.nome).join(', ')}\n`);
  process.exit(0);
}

const log = {
  caso: 'VehicleType',
  inicio: new Date().toISOString(),
  operacoes: [],
};

let aplicados = 0;
let jaOk = 0;
let falhas = 0;

for (const equip of filtrados) {
  console.log(`┌─── ${equip.nome}`);
  
  const baseUrl = TUNNEL_BASE.replace('{UUID}', equip.uuid);
  
  // Conectar
  console.log(`│  Conectando...`, '');
  const token = await autenticar(baseUrl);
  if (!token) {
    console.log('❌ OFFLINE');
    log.operacoes.push({ equip: equip.nome, resultado: 'OFFLINE' });
    falhas++;
    continue;
  }
  console.log('✅');
  
  // Ler config
  console.log(`│  Lendo config...`, '');
  const config = await ler(baseUrl, token, ENDPOINT_LEITURA);
  if (!config) {
    console.log('❌ Erro ao ler');
    log.operacoes.push({ equip: equip.nome, resultado: 'ERRO_LEITURA' });
    falhas++;
    continue;
  }
  console.log('✅');
  
  // Validar
  const val = validar(config);
  if (val.ok) {
    console.log(`│  ✅ JÁ CORRETO — nada a alterar\n`);
    log.operacoes.push({ equip: equip.nome, resultado: 'JA_OK' });
    jaOk++;
    continue;
  }
  
  // Mostrar erros
  console.log(`│  ❌ Erros encontrados:`);
  val.erros.forEach(e => console.log(`│     • ${e}`));
  
  if (DRY_RUN) {
    const payload = buildPayload(config);
    console.log(`│  🧪 PAYLOAD (simulação):`);
    console.log(JSON.stringify(payload, null, 2).split('\n').map(l => `│  ${l}`).join('\n'));
    log.operacoes.push({ equip: equip.nome, resultado: 'DRY_RUN', payload });
    aplicados++;
    continue;
  }
  
  // Aplicar
  console.log(`│  Aplicando...`, '');
  const payload = buildPayload(config);
  const ok = await gravar(baseUrl, token, ENDPOINT_ESCRITA, payload);
  
  if (ok) {
    console.log('✅ Aplicado\n');
    log.operacoes.push({ equip: equip.nome, resultado: 'APLICADO', payload });
    aplicados++;
  } else {
    console.log('❌ Falha ao gravar\n');
    log.operacoes.push({ equip: equip.nome, resultado: 'FALHA', payload });
    falhas++;
  }
}

log.fim = new Date().toISOString();
log.aplicados = aplicados;
log.jaOk = jaOk;
log.falhas = falhas;

// Salvar log
try {
  mkdirSync(LOG_DIR, { recursive: true });
  const nomeLog = `${LOG_DIR}/correcao-vehicletype-${new Date().toISOString().replace(/:/g, '-')}.json`;
  writeFileSync(nomeLog, JSON.stringify(log, null, 2));
  log.arquivo = nomeLog;
} catch (e) {
  console.error('  ⚠️ Erro ao salvar log:', e.message);
}

console.log('═══════════════════════════════════════════════════════════════');
console.log(`  ✅ Aplicados: ${aplicados} | ✅ Já OK: ${jaOk} | ⏭️ Cancelados: 0 | ❌ Falha: ${falhas}`);
if (log.arquivo) console.log(`  📄 Log: ${log.arquivo}`);
console.log('═══════════════════════════════════════════════════════════════');

process.exit(falhas > 0 ? 1 : 0);
