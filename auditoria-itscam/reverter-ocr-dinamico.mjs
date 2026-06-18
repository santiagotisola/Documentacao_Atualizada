#!/usr/bin/env node
/**
 * ══════════════════════════════════════════════════════════════
 * REVERTER OCR — Dinâmico (lê do cache)
 * Reverte TODOS equipamentos com OCR != 4/4 para 4/4
 * ══════════════════════════════════════════════════════════════
 */

import fs from 'fs';

const TUNNEL_BASE = 'https://{UUID}-80.tunnel.varco.cloud';
const CREDENTIALS = { username: 'admin', password: '#econocr@' };
const TIMEOUT_MS = 25000;

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

async function reverter(baseUrl, token) {
  try {
    const ctrl1 = new AbortController();
    setTimeout(() => ctrl1.abort(), TIMEOUT_MS);
    const res1 = await fetch(`${baseUrl}/api/equipment/ocr`, {
      headers: { 'Authorization': `Bearer ${token}` },
      signal: ctrl1.signal,
    });
    if (!res1.ok) return false;
    const ocr = await res1.json();
    
    ocr.ocr.processingQueue = 4;
    ocr.ocr.processingThreads = 4;
    
    const ctrl2 = new AbortController();
    setTimeout(() => ctrl2.abort(), TIMEOUT_MS);
    const res2 = await fetch(`${baseUrl}/api/equipment/ocr`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(ocr),
      signal: ctrl2.signal,
    });
    return res2.ok;
  } catch { return false; }
}

async function main() {
  // Ler do cache
  const cache = JSON.parse(fs.readFileSync('./auditoria-itscam/analise-dados.json', 'utf8'));
  
  // Filtrar equipamentos com OCR incorreto
  const equipamentos = cache.devices.filter(dev => {
    const q = dev.raw?.ocr?.ocr?.processingQueue;
    const t = dev.raw?.ocr?.ocr?.processingThreads;
    return q !== 4 || t !== 4;
  }).map(dev => ({
    nome: dev.nome,
    uuid: dev.uuid
  }));
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  REVERSÃO DINÂMICA — OCR queue/threads → 4/4');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log(`📊 Equipamentos a reverter: ${equipamentos.length}\n`);
  
  let sucesso = 0;
  let falha = 0;
  
  for (const equip of equipamentos) {
    process.stdout.write(`${equip.nome}... `);
    const baseUrl = TUNNEL_BASE.replace('{UUID}', equip.uuid);
    const token = await autenticar(baseUrl);
    if (!token) {
      console.log('❌ OFFLINE');
      falha++;
      continue;
    }
    const ok = await reverter(baseUrl, token);
    if (ok) {
      console.log('✅ REVERTIDO');
      sucesso++;
    } else {
      console.log('❌ FALHA');
      falha++;
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  ✅ Sucesso: ${sucesso} | ❌ Falha: ${falha}`);
  console.log('═══════════════════════════════════════════════════════════════\n');
}

main();
