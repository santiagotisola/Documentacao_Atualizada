// Correções: Video FPS/Quality + Classifier Queue/Threads
// Executar: node auditoria-itscam/corrigir-novos-2026-07-06.mjs

const TUNNEL_BASE = 'https://{UUID}-80.tunnel.varco.cloud';
const CREDENTIALS = { username: 'admin', password: '#econocr@' };

async function auth(base) {
  const r = await fetch(base + '/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ params: CREDENTIALS }),
    signal: AbortSignal.timeout(15000)
  });
  if (!r.ok) throw new Error(`Auth ${r.status}`);
  const { token } = await r.json();
  return token;
}

async function putDelta(base, token, endpoint, payload) {
  const r = await fetch(base + endpoint, {
    method: 'PUT',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000)
  });
  const txt = await r.text();
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${txt.slice(0, 150)}`);
  return JSON.parse(txt);
}

const targets = [
  {
    nome: 'GOEC6O011 - Faixa 2',
    uuid: 'd0595c80-9ea7-49af-b2a0-d305d688e567',
    correcoes: [
      // NTP: não funciona via REST (500 Internal server error) — pular
      { desc: '⚠️  NTP (manual: Equipamento > Data e Hora > Servidor NTP = time.google.com)', skip: true },
      { desc: 'Video FPS → 12', endpoint: '/api/video/streams', payload: { mjpeg: { main: { framerate: 12 } } } },
    ],
  },
  {
    nome: 'GOEC6O028 - Faixa 1',
    uuid: '1f460cd7-f607-4c79-8a8e-50a8228850a4',
    correcoes: [
      { desc: '⚠️  NTP (manual: Equipamento > Data e Hora > Servidor NTP = time.google.com)', skip: true },
      { desc: 'Video FPS → 12 + Quality → 85', endpoint: '/api/video/streams', payload: { mjpeg: { main: { framerate: 12, quality: 85 } } } },
    ],
  },
  {
    nome: 'GOEC6O055 - Faixa 2',
    uuid: 'fe5f7cf3-a8dd-41e8-b975-72921dbddeac',
    correcoes: [
      { desc: 'Video FPS → 12', endpoint: '/api/video/streams', payload: { mjpeg: { main: { framerate: 12 } } } },
    ],
  },
  {
    nome: 'GOEC6O058 - Faixa 2',
    uuid: '6561d5fd-0aba-413b-a60a-a0d7e1b61b6d',
    correcoes: [
      { desc: 'Classifier processingQueue → 1 + processingThreads → 1', endpoint: '/api/equipment/classifier', payload: { classifier: { processingQueue: 1, processingThreads: 1 } } },
    ],
  },
];

let totalOk = 0, totalFail = 0;

for (const target of targets) {
  const base = TUNNEL_BASE.replace('{UUID}', target.uuid);
  const short = target.uuid.slice(0, 8) + '...';
  console.log(`\n┌─ ${target.nome} (${short})`);
  try {
    const token = await auth(base);
    console.log('│  🔑 Auth OK');
    for (const corr of target.correcoes) {
      if (corr.skip) { console.log(`│  ${corr.desc}`); continue; }
      try {
        const r = await putDelta(base, token, corr.endpoint, corr.payload);
        console.log(`│  ✅ ${corr.desc}`);
        totalOk++;
      } catch (e) {
        console.log(`│  ❌ ${corr.desc} → ${e.message}`);
        totalFail++;
      }
    }
    console.log('└─ OK');
  } catch (e) {
    console.log(`└─ ❌ ERRO: ${e.message}`);
    totalFail++;
  }
}

console.log('\n' + '═'.repeat(50));
console.log(`  ✅ ${totalOk} correções aplicadas | ❌ ${totalFail} falhas`);
console.log('═'.repeat(50));
