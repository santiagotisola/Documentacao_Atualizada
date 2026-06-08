/**
 * RECOLETA DE DADOS — ITScam 450 (72 equipamentos via VARCO tunnel)
 * Atualiza analise-dados.json com dados frescos de todos os endpoints relevantes.
 */
import { readFileSync, writeFileSync } from 'fs';

const CREDENTIALS = { username: 'admin', password: '#econocr@' };
const TUNNEL_BASE = 'https://{UUID}-80.tunnel.varco.cloud';
const TIMEOUT_MS = 20000;
const BATCH_SIZE = 5;

// Load inventory
const inventory = JSON.parse(readFileSync('./auditoria-itscam/devices-inventory.json', 'utf8'));
const devices = inventory.devices || inventory;
console.log(`🔍 Dispositivos para coletar: ${devices.length}`);

const ENDPOINTS = [
  '/api/system/maintenance/remoteaccess',
  '/api/image/profiles',
  '/api/equipment/ocr',
  '/api/equipment/classifier',
  '/api/equipment/misc',
  '/api/equipment/servers/ftp',
  '/api/equipment/ioPorts',
  '/api/system/monitoring/snmp',
  '/api/system/maintenance/automaticreboot',
  '/api/equipment/dateAndTime',
  '/api/video/streams',
  '/api/system/firmware',
];

async function collectDevice(dev) {
  const base = TUNNEL_BASE.replace('{UUID}', dev.uuid);
  try {
    const authRes = await fetch(base + '/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ params: CREDENTIALS }),
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });
    if (!authRes.ok) return { nome: dev.name || dev.nome, uuid: dev.uuid, ip: dev.ip || '', raw: null, error: 'AUTH_FAILED' };
    const { token } = await authRes.json();

    const raw = {};
    for (const ep of ENDPOINTS) {
      const key = ep.split('/').pop();
      try {
        const r = await fetch(base + ep, {
          headers: { Authorization: 'Bearer ' + token },
          signal: AbortSignal.timeout(TIMEOUT_MS)
        });
        if (r.ok) raw[key] = await r.json();
      } catch (_) { /* skip timeout */ }
    }

    return {
      nome: dev.name || dev.nome,
      uuid: dev.uuid,
      ip: dev.ip || '',
      raw: {
        varco: raw.remoteaccess || null,
        profiles: raw.profiles || null,
        ocr: raw.ocr || null,
        classifier: raw.classifier || null,
        misc: raw.misc || null,
        ftp: raw.ftp || null,
        ioPorts: raw.ioPorts || null,
        snmp: raw.snmp || null,
        reboot: raw.automaticreboot || null,
        dateTime: raw.dateAndTime || null,
        video: raw.streams || null,
        firmware: raw.firmware || null,
      }
    };
  } catch (e) {
    return { nome: dev.name || dev.nome, uuid: dev.uuid, ip: dev.ip || '', raw: null, error: e.message };
  }
}

// Process in batches
const results = [];
const start = Date.now();

for (let i = 0; i < devices.length; i += BATCH_SIZE) {
  const batch = devices.slice(i, i + BATCH_SIZE);
  const batchResults = await Promise.all(batch.map(d => collectDevice(d)));
  results.push(...batchResults);
  const ok = results.filter(r => r.raw).length;
  const fail = results.filter(r => !r.raw).length;
  const elapsed = Math.round((Date.now() - start) / 1000);
  process.stdout.write(`\r  [${results.length}/${devices.length}] ✅ OK:${ok} ❌ FAIL:${fail} ⏱️ ${elapsed}s   `);
}

const ok = results.filter(r => r.raw).length;
const fail = results.filter(r => !r.raw).length;
const elapsed = Math.round((Date.now() - start) / 1000);

console.log(`\n\n═══════════════════════════════════════`);
console.log(`  Coleta concluída em ${elapsed}s`);
console.log(`  ✅ OK: ${ok} | ❌ FAIL: ${fail}`);
console.log(`═══════════════════════════════════════\n`);

if (fail > 0) {
  console.log('Dispositivos com falha:');
  results.filter(r => !r.raw).forEach(r => console.log(`  ❌ ${r.nome} — ${r.error}`));
  console.log('');
}

// Save with new structure (compatible with API)
const output = {
  total: results.length,
  inventario: devices.length,
  ultimaAtualizacao: new Date().toISOString(),
  devices: results
};
writeFileSync('./auditoria-itscam/analise-dados.json', JSON.stringify(output, null, 2));
console.log('💾 Salvo: auditoria-itscam/analise-dados.json');
console.log(`   Tamanho: ${Math.round(JSON.stringify(output).length / 1024)}KB`);
