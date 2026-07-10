/**
 * CORREÇÃO BATCH — 7 dispositivos divergentes (06/07/2026)
 *
 * Divergências identificadas após recoleta de dados frescos:
 *   GOEC6O002 F1  → SnapshotCrop.enable=true  (correto: false)
 *   GOEC6O009 F1  → sceneType=1, minProbability=60, SNMP=true, Reboot.scheduled=true
 *   GOEC6O009 F2  → minProbability=50, SNMP=true, Reboot.scheduled=true, P0.upper.profile=1, P1.upper.level=40
 *   GOEC6O011 F2  → OCR.processingMode=2, sceneType=1
 *   GOEC6O013 F2  → P1.upper.level=30
 *   GOEC6O028 F1  → OCR.processingMode=2, sceneType=1
 *   GOEC6O055 F2  → sceneType=1, minProbability=60
 */

const CREDENTIALS = { username: 'admin', password: '#econocr@' };
const TUNNEL = (uuid) => `https://${uuid}-80.tunnel.varco.cloud`;
const TIMEOUT = 20_000;

const TARGETS = [
  {
    nome: 'GOEC6O002 - Faixa 1',
    uuid: 'c5de0eb2-761e-427a-9efb-e85b7576203d',
    correcoes: [
      { desc: 'SnapshotCrop.enable → false', endpoint: '/api/equipment/misc', payload: { snapshotCrop: { enable: false } } },
    ],
  },
  {
    nome: 'GOEC6O009 - Faixa 1',
    uuid: 'c296d7bf-0d3b-4da1-bf1d-3e4fe998e4a1',
    correcoes: [
      { desc: 'Classificador.sceneType→0 + minProbability→20', endpoint: '/api/equipment/classifier', payload: { classifier: { sceneType: 0, minProbability: 20 } } },
      // SNMP e Reboot: endpoint REST somente leitura — corrigir via UI web manualmente
      { desc: '⚠️  SNMP.enabled (manual: Sistema > Monitoramento > SNMP)', skip: true },
      { desc: '⚠️  Reboot.scheduled (manual: Sistema > Manutenção > Reinício)', skip: true },
    ],
  },
  {
    nome: 'GOEC6O009 - Faixa 2',
    uuid: 'ef0e72ca-d3a5-4f4e-bbf6-40f3737bda3f',
    correcoes: [
      { desc: 'Classificador.minProbability → 20', endpoint: '/api/equipment/classifier', payload: { classifier: { minProbability: 20 } } },
      // SNMP e Reboot: endpoint REST somente leitura — corrigir via UI web manualmente
      { desc: '⚠️  SNMP.enabled (manual: Sistema > Monitoramento > SNMP)', skip: true },
      { desc: '⚠️  Reboot.scheduled (manual: Sistema > Manutenção > Reinício)', skip: true },
      // Profiles: usa delta PUT com ID real (não envia campos read-only como lens.focus)
      { desc: 'P0 (id=0) upper.profile → 0', endpoint: '/api/image/profiles/0', payload: { transitions: { upper: { profile: 0 } } } },
      { desc: 'P1 (Noturno) upper.level → 35', endpoint: null, noturnoFix: true, fields: { 'transitions.upper.level': 35 } },
    ],
  },
  {
    nome: 'GOEC6O011 - Faixa 2',
    uuid: 'd0595c80-9ea7-49af-b2a0-d305d688e567',
    correcoes: [
      { desc: 'OCR.processingMode → 3', endpoint: '/api/equipment/ocr', payload: { ocr: { processingMode: 3 } } },
      { desc: 'Classificador.sceneType → 0', endpoint: '/api/equipment/classifier', payload: { classifier: { sceneType: 0 } } },
    ],
  },
  {
    nome: 'GOEC6O013 - Faixa 2',
    uuid: '36896650-1bca-4093-9631-667b73bdd93d',
    correcoes: [
      { desc: 'P1 (Noturno) upper.level → 35', endpoint: null, noturnoFix: true, fields: { 'transitions.upper.level': 35 } },
    ],
  },
  {
    nome: 'GOEC6O028 - Faixa 1',
    uuid: '1f460cd7-f607-4c79-8a8e-50a8228850a4',
    correcoes: [
      { desc: 'OCR.processingMode → 3', endpoint: '/api/equipment/ocr', payload: { ocr: { processingMode: 3 } } },
      { desc: 'Classificador.sceneType → 0', endpoint: '/api/equipment/classifier', payload: { classifier: { sceneType: 0 } } },
    ],
  },
  {
    nome: 'GOEC6O055 - Faixa 2',
    uuid: 'fe5f7cf3-a8dd-41e8-b975-72921dbddeac',
    correcoes: [
      { desc: 'Classificador.sceneType→0 + minProbability→20', endpoint: '/api/equipment/classifier', payload: { classifier: { sceneType: 0, minProbability: 20 } } },
    ],
  },
];

// ── helpers ─────────────────────────────────────────────────────────────────

function setNested(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (cur[parts[i]] === undefined) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

async function autenticar(base) {
  const r = await fetch(`${base}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ params: CREDENTIALS }),
    signal: AbortSignal.timeout(TIMEOUT),
  });
  if (!r.ok) throw new Error(`Auth falhou: HTTP ${r.status}`);
  const { token } = await r.json();
  if (!token) throw new Error('Token não retornado');
  return token;
}

async function putDelta(base, token, endpoint, payload) {
  const r = await fetch(`${base}${endpoint}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(TIMEOUT),
  });
  if (!r.ok) {
    const body = await r.text().catch(() => '');
    throw new Error(`HTTP ${r.status} — ${body}`);
  }
  return await r.json().catch(() => ({}));
}

async function getEndpoint(base, token, endpoint) {
  const r = await fetch(`${base}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(TIMEOUT),
  });
  if (!r.ok) throw new Error(`GET ${endpoint} HTTP ${r.status}`);
  return r.json();
}

// Noturno: usa delta PUT com ID real do profile (evita campos read-only como lens.focus)
async function corrigirNoturno(base, token, fields) {
  const profiles = await getEndpoint(base, token, '/api/image/profiles');
  const noturnoId = profiles[1]?.id;
  if (noturnoId === undefined) throw new Error('Profile Noturno sem id');
  // Monta delta mínimo a partir dos fields
  const delta = {};
  for (const [path, val] of Object.entries(fields)) setNested(delta, path, val);
  return await putDelta(base, token, `/api/image/profiles/${noturnoId}`, delta);
}

// ── main ─────────────────────────────────────────────────────────────────────

let totalOk = 0, totalFail = 0;

for (const target of TARGETS) {
  const base = TUNNEL(target.uuid);
  console.log(`\n┌─ ${target.nome} (${target.uuid.slice(0, 8)}...)`);

  let token;
  try {
    token = await autenticar(base);
  } catch (e) {
    console.log(`│  ❌ Auth falhou: ${e.message}`);
    totalFail += target.correcoes.length;
    continue;
  }
  console.log(`│  🔑 Auth OK`);

  for (const corr of target.correcoes) {
    if (corr.skip) {
      console.log(`│  ${corr.desc}`);
      continue;
    }
    try {
      if (corr.noturnoFix) {
        await corrigirNoturno(base, token, corr.fields);
      } else {
        await putDelta(base, token, corr.endpoint, corr.payload);
      }
      console.log(`│  ✅ ${corr.desc}`);
      totalOk++;
    } catch (e) {
      console.log(`│  ❌ ${corr.desc} → ${e.message}`);
      totalFail++;
    }
  }
  console.log(`└─ OK`);
}

console.log(`\n${'═'.repeat(50)}`);
console.log(`  ✅ ${totalOk} correções aplicadas | ❌ ${totalFail} falhas`);
console.log(`${'═'.repeat(50)}\n`);
