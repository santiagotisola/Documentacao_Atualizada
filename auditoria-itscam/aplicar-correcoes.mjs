/**
 * Script de Aplicação de Correções - Auditoria ITScam 450
 * 
 * Aplica correções priorizadas nos equipamentos com divergências.
 * Executa em modo DRY-RUN por padrão (--apply para aplicar de fato).
 * 
 * Uso:
 *   node auditoria-itscam/aplicar-correcoes.mjs                  # Dry-run (simula)
 *   node auditoria-itscam/aplicar-correcoes.mjs --apply          # Aplica de fato
 *   node auditoria-itscam/aplicar-correcoes.mjs --apply --only=P1  # Só prioridade 1
 *   node auditoria-itscam/aplicar-correcoes.mjs --apply --device=GOEC6O008  # Só um device
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// ═══════════════════════════════════════════════════════════════
// CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════════

const TUNNEL_BASE = 'https://{UUID}-80.tunnel.varco.cloud';
const CREDENTIALS = { username: 'admin', password: '#econocr@' };
const TIMEOUT_MS = 30000;
const DELAY_BETWEEN_REQUESTS = 1000;
const RESULTS_DIR = './auditoria-itscam/resultados';
const LOG_DIR = './auditoria-itscam/logs-correcao';

const DRY_RUN = !process.argv.includes('--apply');
const ONLY_PRIORITY = process.argv.find(a => a.startsWith('--only='))?.split('=')[1] || null;
const ONLY_DEVICE = process.argv.find(a => a.startsWith('--device='))?.split('=')[1] || null;

// ═══════════════════════════════════════════════════════════════
// DEFINIÇÃO DAS CORREÇÕES
// ═══════════════════════════════════════════════════════════════

const CORRECOES = [
  // ─── PRIORIDADE 1: CRÍTICA ─────────────────────────────────
  {
    id: 'P1-01',
    prioridade: 'P1',
    descricao: 'Classificador - processingQueue=1, processingThreads=1',
    endpoint: '/api/equipment/classifier',
    method: 'PUT',
    payload: { classifier: { processingQueue: 1, processingThreads: 1 } },
    dispositivos: [
      'GOEC6O003 - Faixa 2', 'GOEC6O004 - Faixa 1', 'GOEC6O004 - Faixa 2',
      'GOEC6O006 - Faixa 1', 'GOEC6O006 - Faixa 2', 'GOEC6O007 - Faixa 1', 'GOEC6O007 - Faixa 2',
      'GOEC6O008 - Faixa 2', 'GOEC6O013 - Faixa 1', 'GOEC6O013 - Faixa 2',
      'GOEC6O018 - Faixa 1', 'GOEC6O018 - Faixa 2', 'GOEC6O020 - Faixa 1', 'GOEC6O020 - Faixa 2',
      'GOEC6O021 - Faixa 1', 'GOEC6O022 - Faixa 1', 'GOEC6O022 - Faixa 2',
      'GOEC6O029 - Faixa 1', 'GOEC6O029 - Faixa 2', 'GOEC6O033 - Faixa 1', 'GOEC6O033 - Faixa 2',
      'GOEC6O036 - Faixa 1', 'GOEC6O040 - Faixa 1', 'GOEC6O040 - Faixa 2',
      'GOEC6O041 - Faixa 1', 'GOEC6O041 - Faixa 2', 'GOEC6O043 - Faixa 1', 'GOEC6O043 - Faixa 2',
      'GOEC6O045 - Faixa 1', 'GOEC6O045 - Faixa 2', 'GOEC6O046 - Faixa 1', 'GOEC6O046 - Faixa 2',
      'GOEC6O048 - Faixa 1', 'GOEC6O048 - Faixa 2', 'GOEC6O050 - Faixa 1', 'GOEC6O050 - Faixa 2',
      'GOEC6O051 - Faixa 1', 'GOEC6O051 - Faixa 2', 'GOEC6O053 - Faixa 1', 'GOEC6O053 - Faixa 2',
      'GOEC6O054 - Faixa 1', 'GOEC6O054 - Faixa 2', 'GOEC6O055 - Faixa 1',
      'GOEC6O056 - Faixa 1', 'GOEC6O056 - Faixa 2', 'GOEC6O057 - Faixa 1', 'GOEC6O057 - Faixa 2',
      'GOEC6O059 - Faixa 1', 'GOEC6O059 - Faixa 2',
    ],
    validacao: (currentData) => currentData?.classifier?.processingQueue !== 1,
  },

  {
    id: 'P1-02',
    prioridade: 'P1',
    descricao: 'Vídeo - useTriggerFrames=true, framerate=12, quality=85',
    endpoint: '/api/video/streams',
    method: 'PUT',
    payload: { mjpeg: { main: { framerate: 12, quality: 85, useTriggerFrames: true } } },
    dispositivos: [
      'GOEC6O008 - Faixa 1', 'GOEC6O020 - Faixa 1', 'GOEC6O028 - Faixa 1',
      'GOEC6O041 - Faixa 1', 'GOEC6O045 - Faixa 1', 'GOEC6O050 - Faixa 1', 'GOEC6O051 - Faixa 1',
    ],
    validacao: (currentData) => currentData?.mjpeg?.main?.useTriggerFrames !== true,
  },

  {
    id: 'P1-03',
    prioridade: 'P1',
    descricao: 'OCR - processingThreads=4, processingQueue=4, processingMode=3, timeout=1000',
    endpoint: '/api/equipment/ocr',
    method: 'PUT',
    payload: { ocr: { processingThreads: 4, processingQueue: 4, processingMode: 3, processingTimeout: 1000 } },
    dispositivos: [
      'GOEC6O008 - Faixa 1', 'GOEC6O010 - Faixa 1', 'GOEC6O011 - Faixa 2',
      'GOEC6O028 - Faixa 1', 'GOEC6O055 - Faixa 2',
    ],
    validacao: (currentData) => currentData?.ocr?.processingThreads !== 4,
  },

  {
    id: 'P1-04',
    prioridade: 'P1',
    descricao: 'OCR - vehicleType=3, maxPlates=2',
    endpoint: '/api/equipment/ocr',
    method: 'PUT',
    payload: { ocr: { vehicleType: 3, maxPlates: 2 } },
    dispositivos: [
      'GOEC6O009 - Faixa 1', 'GOEC6O009 - Faixa 2', 'GOEC6O055 - Faixa 2',
    ],
    validacao: (currentData) => currentData?.ocr?.vehicleType !== 3 || currentData?.ocr?.maxPlates !== 2,
  },

  // ─── PRIORIDADE 2: ALTA ────────────────────────────────────
  {
    id: 'P2-01',
    prioridade: 'P2',
    descricao: 'NTP - ntpServerAddress = time.google.com',
    endpoint: '/api/equipment/dateAndTime',
    method: 'PUT',
    payload: { ntpServerAddress: ['time.google.com'] },
    dispositivos: [
      'GOEC6O011 - Faixa 2', 'GOEC6O028 - Faixa 1',
    ],
    validacao: (currentData) => currentData?.ntpServerAddress?.[0] !== 'time.google.com',
  },

  {
    id: 'P2-02',
    prioridade: 'P2',
    descricao: 'IO Ports - earlyUs=7 para flash outputs',
    endpoint: '/api/equipment/ioPorts',
    method: 'PUT',
    payload: [
      { port: 1, earlyUs: 7, isReserved: true, type: 'flash', protection: 'itslux' },
      { port: 3, earlyUs: 7, isReserved: true, type: 'flash', protection: 'itslux' },
    ],
    dispositivos: ['GOEC6O008 - Faixa 1'],
    validacao: (currentData) => Array.isArray(currentData) && currentData[0]?.earlyUs !== 7,
  },

  {
    id: 'P2-03',
    prioridade: 'P2',
    descricao: 'IO Ports - isReserved=true para flash outputs',
    endpoint: '/api/equipment/ioPorts',
    method: 'PUT',
    payload: [
      { port: 1, isReserved: true, type: 'flash', protection: 'itslux' },
      { port: 3, isReserved: true, type: 'flash', protection: 'itslux' },
    ],
    dispositivos: ['GOEC6O033 - Faixa 2'],
    validacao: (currentData) => Array.isArray(currentData) && !currentData[0]?.isReserved,
  },

  {
    id: 'P2-04',
    prioridade: 'P2',
    descricao: 'Classificador - sceneType=0, minProbability=20',
    endpoint: '/api/equipment/classifier',
    method: 'PUT',
    payload: { classifier: { sceneType: 0, minProbability: 20 } },
    dispositivos: [
      'GOEC6O009 - Faixa 1', 'GOEC6O009 - Faixa 2', 'GOEC6O011 - Faixa 2',
      'GOEC6O028 - Faixa 1', 'GOEC6O054 - Faixa 1', 'GOEC6O055 - Faixa 2',
    ],
    validacao: (currentData) => currentData?.classifier?.sceneType !== 0 || currentData?.classifier?.minProbability !== 20,
  },

  // ─── PRIORIDADE 3: MÉDIA ───────────────────────────────────
  {
    id: 'P3-01',
    prioridade: 'P3',
    descricao: 'SNMP - desabilitar',
    endpoint: '/api/system/monitoring/snmp',
    method: 'PUT',
    payload: { enabled: false, v2: { enabled: false, community: '' } },
    dispositivos: ['GOEC6O009 - Faixa 1', 'GOEC6O009 - Faixa 2'],
    validacao: (currentData) => currentData?.enabled !== false,
  },

  {
    id: 'P3-02',
    prioridade: 'P3',
    descricao: 'Reboot automático - desabilitar',
    endpoint: '/api/system/maintenance/automaticreboot',
    method: 'PUT',
    payload: { scheduled: { enabled: false, weekdays: [0], hour: 0 }, periodic: { enabled: false, hours: 24 } },
    dispositivos: ['GOEC6O009 - Faixa 1', 'GOEC6O009 - Faixa 2'],
    validacao: (currentData) => currentData?.scheduled?.enabled !== false,
  },

  {
    id: 'P3-03',
    prioridade: 'P3',
    descricao: 'FTP - limpar credenciais client',
    endpoint: '/api/equipment/servers/ftp',
    method: 'PUT',
    payload: { ftp: { username: '', password: '' } },
    dispositivos: ['GOEC6O036 - Faixa 1', 'GOEC6O054 - Faixa 2'],
    validacao: (currentData) => currentData?.ftp?.username !== '',
  },
];

// ═══════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES
// ═══════════════════════════════════════════════════════════════

async function authenticateDevice(baseUrl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${baseUrl}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(CREDENTIALS),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.token || data.access_token || null;
  } catch { return null; }
  finally { clearTimeout(timeout); }
}

async function getCurrentValue(baseUrl, token, endpoint) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      signal: controller.signal,
    });
    if (!res.ok) return { _error: res.status };
    return await res.json();
  } catch (e) { return { _error: e.message }; }
  finally { clearTimeout(timeout); }
}

async function applyCorrection(baseUrl, token, endpoint, method, payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const responseText = await res.text();
    return { ok: res.ok, status: res.status, response: responseText };
  } catch (e) { return { ok: false, status: 0, response: e.message }; }
  finally { clearTimeout(timeout); }
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  APLICAÇÃO DE CORREÇÕES - ITScam 450');
  console.log(`  Modo: ${DRY_RUN ? '🔍 DRY-RUN (simulação)' : '⚡ APLICAÇÃO REAL'}`);
  if (ONLY_PRIORITY) console.log(`  Filtro prioridade: ${ONLY_PRIORITY}`);
  if (ONLY_DEVICE) console.log(`  Filtro device: ${ONLY_DEVICE}`);
  console.log('═══════════════════════════════════════════════════\n');

  if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true });

  // Carregar inventário
  const inventory = JSON.parse(readFileSync('./auditoria-itscam/devices-inventory.json', 'utf8'));

  // Filtrar correções por prioridade
  let correcoes = CORRECOES;
  if (ONLY_PRIORITY) {
    correcoes = correcoes.filter(c => c.prioridade === ONLY_PRIORITY);
  }

  const log = {
    inicio: new Date().toISOString(),
    modo: DRY_RUN ? 'dry-run' : 'apply',
    correcoes: [],
    resumo: { total: 0, sucesso: 0, falha: 0, skipped: 0 },
  };

  for (const correcao of correcoes) {
    console.log(`\n┌─── ${correcao.id}: ${correcao.descricao}`);
    console.log(`│    Endpoint: ${correcao.endpoint}`);
    console.log(`│    Dispositivos: ${correcao.dispositivos.length}`);

    let dispositivos = correcao.dispositivos;
    if (ONLY_DEVICE) {
      dispositivos = dispositivos.filter(d => d.includes(ONLY_DEVICE));
      if (dispositivos.length === 0) {
        console.log(`│    ⏭️  Nenhum dispositivo matches filter`);
        continue;
      }
    }

    for (const deviceName of dispositivos) {
      const device = inventory.find(d => d.name === deviceName);
      if (!device) {
        console.log(`│    ⚠️  ${deviceName} - Não encontrado no inventário`);
        log.correcoes.push({ correcao: correcao.id, device: deviceName, status: 'NOT_FOUND' });
        log.resumo.skipped++;
        continue;
      }

      const baseUrl = TUNNEL_BASE.replace('{UUID}', device.uuid);
      log.resumo.total++;

      if (DRY_RUN) {
        console.log(`│    📋 ${deviceName} → SIMULADO (${correcao.endpoint})`);
        log.correcoes.push({
          correcao: correcao.id,
          device: deviceName,
          endpoint: correcao.endpoint,
          payload: correcao.payload,
          status: 'DRY_RUN',
        });
        log.resumo.sucesso++;
        continue;
      }

      // --- MODO REAL ---
      process.stdout.write(`│    🔧 ${deviceName}...`);

      // 1. Autenticar
      const token = await authenticateDevice(baseUrl);
      if (!token) {
        console.log(' ❌ AUTH_FAILED');
        log.correcoes.push({ correcao: correcao.id, device: deviceName, status: 'AUTH_FAILED' });
        log.resumo.falha++;
        continue;
      }

      // 2. Ler valor atual (backup)
      const currentValue = await getCurrentValue(baseUrl, token, correcao.endpoint);
      
      // 3. Validar se realmente precisa correção
      if (correcao.validacao && !correcao.validacao(currentValue)) {
        console.log(' ✅ Já correto');
        log.correcoes.push({ correcao: correcao.id, device: deviceName, status: 'ALREADY_OK' });
        log.resumo.skipped++;
        continue;
      }

      // 4. Aplicar correção
      const result = await applyCorrection(baseUrl, token, correcao.endpoint, correcao.method, correcao.payload);

      if (result.ok) {
        console.log(' ✅ Aplicado');
        log.correcoes.push({
          correcao: correcao.id,
          device: deviceName,
          status: 'APPLIED',
          backup: currentValue,
          response: result.response,
        });
        log.resumo.sucesso++;
      } else {
        console.log(` ❌ Erro ${result.status}: ${result.response.substring(0, 100)}`);
        log.correcoes.push({
          correcao: correcao.id,
          device: deviceName,
          status: 'FAILED',
          error: result.response,
          httpStatus: result.status,
        });
        log.resumo.falha++;
      }

      // Delay entre requests
      await new Promise(r => setTimeout(r, DELAY_BETWEEN_REQUESTS));
    }
  }

  log.fim = new Date().toISOString();

  // Salvar log
  const logFile = join(LOG_DIR, `correcoes-${DRY_RUN ? 'dryrun' : 'applied'}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  writeFileSync(logFile, JSON.stringify(log, null, 2));

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  RESUMO DA EXECUÇÃO');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Total operações: ${log.resumo.total}`);
  console.log(`  ✅ Sucesso: ${log.resumo.sucesso}`);
  console.log(`  ❌ Falha: ${log.resumo.falha}`);
  console.log(`  ⏭️  Skipped: ${log.resumo.skipped}`);
  console.log(`  📄 Log: ${logFile}`);
  console.log('═══════════════════════════════════════════════════\n');
}

main().catch(console.error);
