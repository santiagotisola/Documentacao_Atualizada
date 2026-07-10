/**
 * ══════════════════════════════════════════════════════════════════════════
 * VALIDAR CONFIGURAÇÃO — ITScam 450
 * ══════════════════════════════════════════════════════════════════════════
 * 
 * Coleta configuração ATUAL + usuários de cada equipamento via VARCO tunnel,
 * compara contra o script padrão (config-padrao/padrao-faixa-*.json) e gera
 * relatório organizado mostrando:
 * 
 *   ✅ Equipamentos CONFORMES ao script padrão
 *   ⚠️  Equipamentos ALTERADOS (com detalhes de O QUE mudou)
 *   👤 QUEM fez login por último em cada equipamento (potencial autor da alteração)
 *   ❌ Equipamentos OFFLINE
 * 
 * USO:
 *   node auditoria-itscam/validar-config.mjs                     → coleta + valida tudo
 *   node auditoria-itscam/validar-config.mjs --local             → usa dados já coletados
 *   node auditoria-itscam/validar-config.mjs --equip=GOEC6O010   → filtra
 *   node auditoria-itscam/validar-config.mjs --json              → saída JSON pura
 * 
 * SAÍDA:
 *   auditoria-itscam/validacao-config.json
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_DIR = resolve(__dirname);

const CREDENTIALS = { username: 'admin', password: '#econocr@' };
const TUNNEL_BASE = 'https://{UUID}-80.tunnel.varco.cloud';
const TIMEOUT_MS = 20000;
const BATCH_SIZE = 5;

// ═══════════════════════════════════════════════════════════════
// ARGS
// ═══════════════════════════════════════════════════════════════
const args = process.argv.slice(2);
const getArg = (name) => args.find(a => a.startsWith(`--${name}=`))?.split('=')[1] || null;
const hasFlag = (name) => args.includes(`--${name}`);

const FILTRO_EQUIP = getArg('equip');
const LOCAL_MODE = hasFlag('local');
const JSON_OUTPUT = hasFlag('json');

// ═══════════════════════════════════════════════════════════════
// CONFIGURAÇÃO PADRÃO (SCRIPT DE REFERÊNCIA)
// ═══════════════════════════════════════════════════════════════
const PADRAO_F1 = JSON.parse(readFileSync(resolve(BASE_DIR, 'config-padrao/padrao-faixa-1.json'), 'utf8'));
const PADRAO_F2 = JSON.parse(readFileSync(resolve(BASE_DIR, 'config-padrao/padrao-faixa-2.json'), 'utf8'));

function getPadrao(nome) {
  return nome.toLowerCase().includes('faixa 2') || nome.includes('- F2') ? PADRAO_F2 : PADRAO_F1;
}

function getFaixaNum(nome) {
  return nome.toLowerCase().includes('faixa 2') || nome.includes('- F2') ? 2 : 1;
}

// ═══════════════════════════════════════════════════════════════
// REGRAS DE VALIDAÇÃO (vs script padrão)
// ═══════════════════════════════════════════════════════════════
const REGRAS = [
  // ─── VARCO ───
  { id: 'VARCO_ENABLED', secao: 'varco', titulo: 'VARCO Habilitado', menu: 'Sistema > Manutenção > Acesso Remoto', severidade: 'critico',
    extrair: (raw) => raw?.varco?.remoteAccess?.varco?.enabled,
    esperado: (pad) => pad.varco.remoteAccess.varco.enabled },
  { id: 'VARCO_EDGE', secao: 'varco', titulo: 'VARCO Edge Server', menu: 'Sistema > Manutenção > Acesso Remoto', severidade: 'critico',
    extrair: (raw) => raw?.varco?.remoteAccess?.varco?.edgeServer,
    esperado: (pad) => pad.varco.remoteAccess.varco.edgeServer },
  { id: 'VARCO_KEY', secao: 'varco', titulo: 'VARCO Provision Key', menu: 'Sistema > Manutenção > Acesso Remoto', severidade: 'critico',
    extrair: (raw) => raw?.varco?.remoteAccess?.varco?.provisionKey,
    esperado: (pad) => pad.varco.remoteAccess.varco.provisionKey },

  // ─── PROFILES (Transições) ───
  { id: 'PROFILE_LOWER_LEVEL', secao: 'profiles', titulo: 'Transição Lower Level', menu: 'Imagem > Perfis > Transições', severidade: 'alto',
    extrair: (raw) => raw?.profiles?.map(p => p?.transitions?.lower?.level),
    esperado: (pad) => pad.profiles.transitions.lower.level,
    comparar: (atual, esp) => Array.isArray(atual) ? atual.every(v => v === esp) : atual === esp },
  { id: 'PROFILE_UPPER_LEVEL', secao: 'profiles', titulo: 'Transição Upper Level', menu: 'Imagem > Perfis > Transições', severidade: 'alto',
    extrair: (raw) => raw?.profiles?.map(p => p?.transitions?.upper?.level),
    esperado: (pad) => pad.profiles.transitions.upper.level,
    comparar: (atual, esp) => Array.isArray(atual) ? atual.every(v => v === esp) : atual === esp },
  { id: 'PROFILE_LOWER_TIME', secao: 'profiles', titulo: 'Transição Lower startTime/endTime', menu: 'Imagem > Perfis > Transições', severidade: 'alto',
    extrair: (raw) => raw?.profiles?.map(p => ({ start: p?.transitions?.lower?.startTime, end: p?.transitions?.lower?.endTime })),
    esperado: () => '00:00:00',
    comparar: (atual, esp) => Array.isArray(atual) ? atual.every(v => v?.start === esp && v?.end === esp) : true },
  { id: 'PROFILE_UPPER_TIME', secao: 'profiles', titulo: 'Transição Upper startTime/endTime', menu: 'Imagem > Perfis > Transições', severidade: 'alto',
    extrair: (raw) => raw?.profiles?.map(p => ({ start: p?.transitions?.upper?.startTime, end: p?.transitions?.upper?.endTime })),
    esperado: () => '00:00:00',
    comparar: (atual, esp) => Array.isArray(atual) ? atual.every(v => v?.start === esp && v?.end === esp) : true },
  { id: 'PROFILE_UPPER_PROFILE', secao: 'profiles', titulo: 'Perfil Noturno → Destino (P&B=0)', menu: 'Imagem > Perfis > Transições', severidade: 'critico',
    extrair: (raw) => raw?.profiles?.[1]?.transitions?.upper?.profile,
    esperado: (pad) => pad.profiles.transitions.upper.profile },

  // ─── OCR ───
  { id: 'OCR_ENABLED', secao: 'ocr', titulo: 'OCR Habilitado', menu: 'Equipamento > OCR', severidade: 'critico',
    extrair: (raw) => raw?.ocr?.ocr?.enabled,
    esperado: (pad) => pad.ocr.ocr.enabled },
  { id: 'OCR_MAX_PLATES', secao: 'ocr', titulo: 'OCR Max Plates', menu: 'Equipamento > OCR', severidade: 'alto',
    extrair: (raw) => raw?.ocr?.ocr?.maxPlates,
    esperado: (pad) => pad.ocr.ocr.maxPlates },
  { id: 'OCR_COUNTRY', secao: 'ocr', titulo: 'OCR Country Code (76=BR)', menu: 'Equipamento > OCR', severidade: 'critico',
    extrair: (raw) => raw?.ocr?.ocr?.countryCode,
    esperado: (pad) => pad.ocr.ocr.countryCode },
  { id: 'OCR_PROC_MODE', secao: 'ocr', titulo: 'OCR Processing Mode', menu: 'Equipamento > OCR', severidade: 'medio',
    extrair: (raw) => raw?.ocr?.ocr?.processingMode,
    esperado: (pad) => pad.ocr.ocr.processingMode },
  { id: 'OCR_PROC_QUEUE', secao: 'ocr', titulo: 'OCR Processing Queue', menu: 'Equipamento > OCR', severidade: 'medio',
    extrair: (raw) => raw?.ocr?.ocr?.processingQueue,
    esperado: (pad) => pad.ocr.ocr.processingQueue },
  { id: 'OCR_PROC_THREADS', secao: 'ocr', titulo: 'OCR Processing Threads', menu: 'Equipamento > OCR', severidade: 'medio',
    extrair: (raw) => raw?.ocr?.ocr?.processingThreads,
    esperado: (pad) => pad.ocr.ocr.processingThreads },
  { id: 'OCR_VEHICLE_TYPE', secao: 'ocr', titulo: 'OCR Vehicle Type', menu: 'Equipamento > OCR', severidade: 'alto',
    extrair: (raw) => raw?.ocr?.ocr?.vehicleType,
    esperado: (pad) => pad.ocr.ocr.vehicleType },
  { id: 'OCR_MAX_LOW_PROB', secao: 'ocr', titulo: 'OCR Max Low Prob Chars', menu: 'Equipamento > OCR', severidade: 'medio',
    extrair: (raw) => raw?.ocr?.ocr?.maxLowProbChars,
    esperado: (pad) => pad.ocr.ocr.maxLowProbChars },
  { id: 'OCR_USE_CLASSIFIER', secao: 'ocr', titulo: 'OCR Usa Resultado do Classificador', menu: 'Equipamento > OCR', severidade: 'medio',
    extrair: (raw) => raw?.ocr?.ocr?.useClassifierResult,
    esperado: (pad) => pad.ocr.ocr.useClassifierResult },

  // ─── CLASSIFICADOR ───
  { id: 'CLASS_ENABLED', secao: 'classifier', titulo: 'Classificador Habilitado', menu: 'Equipamento > Classificador', severidade: 'critico',
    extrair: (raw) => raw?.classifier?.classifier?.enabled,
    esperado: (pad) => pad.classifier.classifier.enabled },
  { id: 'CLASS_QUEUE', secao: 'classifier', titulo: 'Classificador Queue', menu: 'Equipamento > Classificador', severidade: 'alto',
    extrair: (raw) => raw?.classifier?.classifier?.processingQueue,
    esperado: (pad) => pad.classifier.classifier.processingQueue },
  { id: 'CLASS_THREADS', secao: 'classifier', titulo: 'Classificador Threads', menu: 'Equipamento > Classificador', severidade: 'alto',
    extrair: (raw) => raw?.classifier?.classifier?.processingThreads,
    esperado: (pad) => pad.classifier.classifier.processingThreads },
  { id: 'CLASS_MIN_PROB', secao: 'classifier', titulo: 'Classificador Probabilidade Mínima', menu: 'Equipamento > Classificador', severidade: 'medio',
    extrair: (raw) => raw?.classifier?.classifier?.minProbability,
    esperado: (pad) => pad.classifier.classifier.minProbability },

  // ─── MISC ───
  { id: 'SNAPSHOT_CROP', secao: 'misc', titulo: 'Snapshot Crop Desabilitado', menu: 'Equipamento > Diversos', severidade: 'medio',
    extrair: (raw) => raw?.misc?.snapshotCrop?.enable,
    esperado: (pad) => pad.misc.snapshotCrop.enable },

  // ─── DATE/TIME ───
  { id: 'NTP_ENABLED', secao: 'dateTime', titulo: 'NTP Habilitado', menu: 'Equipamento > Data e Hora', severidade: 'alto',
    extrair: (raw) => raw?.dateTime?.useNTPServer,
    esperado: (pad) => pad.dateTime.useNTPServer },
  { id: 'TIMEZONE', secao: 'dateTime', titulo: 'Timezone', menu: 'Equipamento > Data e Hora', severidade: 'alto',
    extrair: (raw) => raw?.dateTime?.timezone,
    esperado: (pad) => pad.dateTime.timezone,
    comparar: (atual, esp) => JSON.stringify(atual) === JSON.stringify(esp) },
  { id: 'NTP_SERVER', secao: 'dateTime', titulo: 'NTP Server', menu: 'Equipamento > Data e Hora', severidade: 'medio',
    extrair: (raw) => raw?.dateTime?.ntpServerAddress,
    esperado: (pad) => pad.dateTime.ntpServerAddress,
    comparar: (atual, esp) => JSON.stringify(atual) === JSON.stringify(esp) },

  // ─── VIDEO ───
  { id: 'VIDEO_FPS', secao: 'video', titulo: 'Vídeo Framerate', menu: 'Vídeo > Streams', severidade: 'medio',
    extrair: (raw) => raw?.video?.mjpeg?.main?.framerate,
    esperado: (pad) => pad.video.mjpeg.main.framerate },
  { id: 'VIDEO_QUALITY', secao: 'video', titulo: 'Vídeo Qualidade', menu: 'Vídeo > Streams', severidade: 'medio',
    extrair: (raw) => raw?.video?.mjpeg?.main?.quality,
    esperado: (pad) => pad.video.mjpeg.main.quality },

  // ─── SNMP/FTP ───
  { id: 'SNMP_OFF', secao: 'snmp', titulo: 'SNMP Desabilitado', menu: 'Sistema > SNMP', severidade: 'baixo',
    extrair: (raw) => raw?.snmp?.enabled,
    esperado: (pad) => pad.snmp.enabled },
  { id: 'FTP_OFF', secao: 'ftp', titulo: 'FTP Desabilitado', menu: 'Equipamento > Servidores > FTP', severidade: 'baixo',
    extrair: (raw) => raw?.ftp?.ftp?.enable,
    esperado: (pad) => pad.ftp.ftp.enable },
  { id: 'REBOOT_SCHED', secao: 'reboot', titulo: 'Reboot Agendado Desabilitado', menu: 'Sistema > Manutenção > Reboot Automático', severidade: 'baixo',
    extrair: (raw) => raw?.reboot?.scheduled?.enabled,
    esperado: (pad) => pad.reboot.scheduled.enabled },
  { id: 'REBOOT_PERIODIC', secao: 'reboot', titulo: 'Reboot Periódico Desabilitado', menu: 'Sistema > Manutenção > Reboot Automático', severidade: 'baixo',
    extrair: (raw) => raw?.reboot?.periodic?.enabled,
    esperado: (pad) => pad.reboot.periodic.enabled },
];

// ═══════════════════════════════════════════════════════════════
// COLETA LIVE (config + users)
// ═══════════════════════════════════════════════════════════════
const CONFIG_ENDPOINTS = [
  '/api/system/maintenance/remoteaccess',
  '/api/image/profiles',
  '/api/equipment/ocr',
  '/api/equipment/classifier',
  '/api/equipment/misc',
  '/api/equipment/servers/ftp',
  '/api/system/monitoring/snmp',
  '/api/system/maintenance/automaticreboot',
  '/api/equipment/dateAndTime',
  '/api/video/streams',
  '/api/system/firmware',
];

async function coletarDevice(dev) {
  const base = TUNNEL_BASE.replace('{UUID}', dev.uuid);
  const resultado = { nome: dev.name || dev.nome, uuid: dev.uuid, ip: dev.ip || '' };

  try {
    // Auth
    const authRes = await fetch(base + '/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ params: CREDENTIALS }),
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });
    if (!authRes.ok) return { ...resultado, status: 'offline', error: 'AUTH_FAILED', raw: null, users: null };
    const { token } = await authRes.json();

    // Collect config
    const raw = {};
    for (const ep of CONFIG_ENDPOINTS) {
      const key = ep.split('/').pop();
      try {
        const r = await fetch(base + ep, {
          headers: { Authorization: 'Bearer ' + token },
          signal: AbortSignal.timeout(TIMEOUT_MS)
        });
        if (r.ok) {
          const ct = r.headers.get('content-type') || '';
          if (ct.includes('json')) raw[key] = await r.json();
        }
      } catch (_) {}
    }

    // Collect users
    let users = null;
    try {
      const uRes = await fetch(base + '/api/system/users', {
        headers: { Authorization: 'Bearer ' + token },
        signal: AbortSignal.timeout(TIMEOUT_MS)
      });
      if (uRes.ok) {
        const ct = uRes.headers.get('content-type') || '';
        if (ct.includes('json')) users = await uRes.json();
      }
    } catch (_) {}

    return {
      ...resultado,
      status: 'online',
      raw: {
        varco: raw.remoteaccess || null,
        profiles: raw.profiles || null,
        ocr: raw.ocr || null,
        classifier: raw.classifier || null,
        misc: raw.misc || null,
        ftp: raw.ftp || null,
        snmp: raw.snmp || null,
        reboot: raw.automaticreboot || null,
        dateTime: raw.dateAndTime || null,
        video: raw.streams || null,
        firmware: raw.firmware || null,
      },
      users: Array.isArray(users) ? users : null,
    };
  } catch (e) {
    return { ...resultado, status: 'offline', error: e.message, raw: null, users: null };
  }
}

// ═══════════════════════════════════════════════════════════════
// VALIDAÇÃO
// ═══════════════════════════════════════════════════════════════
function validarDevice(dev) {
  if (!dev.raw) return { ...dev, conformidade: 'offline', alteracoes: [], score: 0 };

  const padrao = getPadrao(dev.nome);
  const alteracoes = [];

  for (const regra of REGRAS) {
    const atual = regra.extrair(dev.raw);
    const esperado = regra.esperado(padrao);
    const comparar = regra.comparar || ((a, e) => JSON.stringify(a) === JSON.stringify(e));
    const ok = comparar(atual, esperado);

    if (!ok) {
      alteracoes.push({
        id: regra.id,
        titulo: regra.titulo,
        secao: regra.secao,
        menu: regra.menu,
        severidade: regra.severidade,
        valorAtual: atual,
        valorEsperado: esperado,
      });
    }
  }

  // Determine user who last logged in
  let ultimoAcesso = null;
  if (dev.users && dev.users.length > 0) {
    const sorted = [...dev.users].sort((a, b) => (b.lastLoggedIn || 0) - (a.lastLoggedIn || 0));
    ultimoAcesso = {
      usuario: sorted[0].username,
      isAdmin: sorted[0].isAdmin,
      dataLogin: sorted[0].lastLoggedIn ? new Date(sorted[0].lastLoggedIn).toISOString() : null,
      tempoAtras: sorted[0].lastLoggedIn ? tempoRelativo(sorted[0].lastLoggedIn) : 'desconhecido',
    };
  }

  return {
    nome: dev.nome,
    uuid: dev.uuid,
    ip: dev.ip,
    faixa: getFaixaNum(dev.nome),
    status: 'online',
    firmware: dev.raw?.firmware?.version || 'desconhecido',
    conformidade: alteracoes.length === 0 ? 'conforme' : 'alterado',
    totalRegras: REGRAS.length,
    regrasOK: REGRAS.length - alteracoes.length,
    alteracoes,
    users: dev.users,
    ultimoAcesso,
    score: Math.round(((REGRAS.length - alteracoes.length) / REGRAS.length) * 100),
  };
}

function tempoRelativo(ts) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${min}min atrás`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  const dias = Math.floor(hrs / 24);
  return `${dias}d atrás`;
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  VALIDAÇÃO DE CONFIGURAÇÃO — ITScam 450 vs Script Padrão    ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const inventory = JSON.parse(readFileSync(resolve(BASE_DIR, 'devices-inventory.json'), 'utf8'));
  let devices = inventory.devices || inventory;

  if (FILTRO_EQUIP) {
    devices = devices.filter(d => (d.name || d.nome).toLowerCase().includes(FILTRO_EQUIP.toLowerCase()));
    console.log(`🔎 Filtro: "${FILTRO_EQUIP}" → ${devices.length} equipamentos\n`);
  }

  console.log(`📡 Equipamentos no inventário: ${devices.length}`);
  console.log(`📏 Regras de validação: ${REGRAS.length}`);
  console.log(`📋 Script padrão: config-padrao/padrao-faixa-{1,2}.json\n`);

  let results;

  if (LOCAL_MODE) {
    // Use existing analise-dados.json
    console.log('📂 Modo LOCAL — usando dados já coletados (analise-dados.json)\n');
    const dataPath = resolve(BASE_DIR, 'analise-dados.json');
    if (!existsSync(dataPath)) { console.error('❌ analise-dados.json não encontrado.'); process.exit(1); }
    const data = JSON.parse(readFileSync(dataPath, 'utf8'));
    const devData = data.devices || data;
    
    // Map with inventory for enrichment
    results = devData.map(d => validarDevice(d));
  } else {
    // Live collection
    console.log('🔄 Coletando configuração + usuários de cada equipamento...\n');
    const collected = [];
    const start = Date.now();

    for (let i = 0; i < devices.length; i += BATCH_SIZE) {
      const batch = devices.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(batch.map(d => coletarDevice(d)));
      collected.push(...batchResults);
      const ok = collected.filter(r => r.status === 'online').length;
      const fail = collected.filter(r => r.status === 'offline').length;
      process.stdout.write(`\r  [${collected.length}/${devices.length}] ✅ ${ok} online | ❌ ${fail} offline | ⏱️ ${Math.round((Date.now() - start) / 1000)}s`);
    }
    console.log('\n');

    // Validate each
    results = collected.map(d => validarDevice(d));
  }

  // ═══════════════════════════════════════════════════════════════
  // ORGANIZE RESULTS
  // ═══════════════════════════════════════════════════════════════
  const conformes = results.filter(r => r.conformidade === 'conforme');
  const alterados = results.filter(r => r.conformidade === 'alterado');
  const offline = results.filter(r => r.conformidade === 'offline');

  // Group alterados by same pattern of changes
  const groupMap = new Map();
  alterados.forEach(d => {
    const key = d.alteracoes.map(a => a.id).sort().join('|');
    if (!groupMap.has(key)) groupMap.set(key, { alteracoes: d.alteracoes, dispositivos: [] });
    groupMap.get(key).dispositivos.push(d);
  });
  const grupos = [...groupMap.values()].sort((a, b) => b.dispositivos.length - a.dispositivos.length);

  // ═══════════════════════════════════════════════════════════════
  // OUTPUT
  // ═══════════════════════════════════════════════════════════════
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  RESUMO DA VALIDAÇÃO');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  📊 Total inventário:  ${results.length}`);
  console.log(`  ✅ CONFORMES:         ${conformes.length} (${Math.round(conformes.length/results.length*100)}%)`);
  console.log(`  ⚠️  ALTERADOS:         ${alterados.length} (${Math.round(alterados.length/results.length*100)}%)`);
  console.log(`  ❌ OFFLINE:           ${offline.length}`);
  console.log(`  🔀 Grupos variação:   ${grupos.length}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  // ─── CONFORMES ─────────────────────────────────────────────
  console.log('┌──────────────────────────────────────────────────────────────');
  console.log('│ ✅ EQUIPAMENTOS CONFORMES AO SCRIPT PADRÃO');
  console.log('│    Todos os parâmetros idênticos à configuração de referência');
  console.log('├──────────────────────────────────────────────────────────────');
  if (conformes.length === 0) {
    console.log('│  (nenhum equipamento 100% conforme)');
  } else {
    conformes.forEach(d => {
      const login = d.ultimoAcesso ? `👤 ${d.ultimoAcesso.usuario} (${d.ultimoAcesso.tempoAtras})` : '';
      console.log(`│  ✅ ${d.nome.padEnd(25)} ${d.firmware.padEnd(8)} Score: ${d.score}%  ${login}`);
    });
  }
  console.log('└──────────────────────────────────────────────────────────────\n');

  // ─── ALTERADOS (por grupo) ─────────────────────────────────
  console.log('┌──────────────────────────────────────────────────────────────');
  console.log('│ ⚠️  EQUIPAMENTOS COM ALTERAÇÕES (organizados por grupo)');
  console.log('│    Parâmetros diferentes do script padrão');
  console.log('├──────────────────────────────────────────────────────────────');

  grupos.forEach((grupo, idx) => {
    console.log(`│`);
    console.log(`│  ╔═ GRUPO ${idx + 1} ═══ ${grupo.dispositivos.length} equipamento(s) ═══ ${grupo.alteracoes.length} alteração(ões) ═╗`);
    console.log(`│  ║`);
    console.log(`│  ║  Alterações em relação ao script:`);
    grupo.alteracoes.forEach(a => {
      const sev = a.severidade === 'critico' ? '🔴' : a.severidade === 'alto' ? '🟠' : a.severidade === 'medio' ? '🟡' : '🔵';
      const atual = formatVal(a.valorAtual);
      const esperado = formatVal(a.valorEsperado);
      console.log(`│  ║    ${sev} ${a.titulo}`);
      console.log(`│  ║       Menu: ${a.menu}`);
      console.log(`│  ║       Atual: ${atual}  →  Esperado: ${esperado}`);
    });
    console.log(`│  ║`);
    console.log(`│  ║  Equipamentos neste grupo:`);
    grupo.dispositivos.forEach(d => {
      const login = d.ultimoAcesso
        ? `👤 ${d.ultimoAcesso.usuario} em ${d.ultimoAcesso.dataLogin ? new Date(d.ultimoAcesso.dataLogin).toLocaleString('pt-BR') : '?'} (${d.ultimoAcesso.tempoAtras})`
        : '👤 (sem dados de login)';
      console.log(`│  ║    ⚠️  ${d.nome.padEnd(25)} F${d.faixa} | Score: ${d.score}% | ${login}`);
    });
    console.log(`│  ╚${'═'.repeat(60)}╝`);
  });

  console.log('└──────────────────────────────────────────────────────────────\n');

  // ─── OFFLINE ───────────────────────────────────────────────
  if (offline.length > 0) {
    console.log('┌──────────────────────────────────────────────────────────────');
    console.log('│ ❌ EQUIPAMENTOS OFFLINE (sem comunicação)');
    console.log('├──────────────────────────────────────────────────────────────');
    offline.forEach(d => {
      console.log(`│  ❌ ${(d.nome || '?').padEnd(25)} ${d.ip || ''}`);
    });
    console.log('└──────────────────────────────────────────────────────────────\n');
  }

  // ─── TRACKING DE ACESSO ────────────────────────────────────
  const comLogin = results.filter(r => r.ultimoAcesso?.dataLogin);
  if (comLogin.length > 0) {
    console.log('┌──────────────────────────────────────────────────────────────');
    console.log('│ 👤 RASTREAMENTO DE ACESSO — Último login por equipamento');
    console.log('├──────────────────────────────────────────────────────────────');
    
    // Sort by most recent login
    const porLogin = [...comLogin].sort((a, b) => new Date(b.ultimoAcesso.dataLogin) - new Date(a.ultimoAcesso.dataLogin));
    
    // Show unique timestamps (group by time)
    const loginTimes = new Map();
    porLogin.forEach(d => {
      const ts = d.ultimoAcesso.dataLogin?.slice(0, 16); // minute precision
      if (!loginTimes.has(ts)) loginTimes.set(ts, []);
      loginTimes.get(ts).push(d);
    });

    for (const [ts, devs] of loginTimes) {
      const dt = new Date(ts).toLocaleString('pt-BR');
      const user = devs[0].ultimoAcesso.usuario;
      const status = devs.some(d => d.conformidade === 'alterado') ? '⚠️' : '✅';
      console.log(`│  ${status} ${dt} — ${user} — ${devs.length} equip(s): ${devs.map(d => d.nome.split(' - ')[0]).filter((v,i,a) => a.indexOf(v) === i).join(', ')}`);
    }
    console.log('└──────────────────────────────────────────────────────────────\n');
  }

  // ═══════════════════════════════════════════════════════════════
  // SAVE JSON
  // ═══════════════════════════════════════════════════════════════
  const output = {
    geradoEm: new Date().toISOString(),
    scriptPadrao: { faixa1: 'config-padrao/padrao-faixa-1.json', faixa2: 'config-padrao/padrao-faixa-2.json' },
    totalRegras: REGRAS.length,
    resumo: {
      total: results.length,
      conformes: conformes.length,
      alterados: alterados.length,
      offline: offline.length,
      grupos: grupos.length,
      percentConformes: Math.round(conformes.length / results.length * 100),
    },
    conformes: conformes.map(d => ({ nome: d.nome, faixa: d.faixa, firmware: d.firmware, score: d.score, ultimoAcesso: d.ultimoAcesso })),
    grupos: grupos.map((g, i) => ({
      grupo: i + 1,
      totalEquipamentos: g.dispositivos.length,
      alteracoes: g.alteracoes.map(a => ({ id: a.id, titulo: a.titulo, severidade: a.severidade, menu: a.menu, valorAtual: a.valorAtual, valorEsperado: a.valorEsperado })),
      dispositivos: g.dispositivos.map(d => ({ nome: d.nome, faixa: d.faixa, firmware: d.firmware, score: d.score, ultimoAcesso: d.ultimoAcesso })),
    })),
    offline: offline.map(d => ({ nome: d.nome || '?', uuid: d.uuid, ip: d.ip })),
  };

  const outPath = resolve(BASE_DIR, 'validacao-config.json');
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`💾 Relatório salvo: auditoria-itscam/validacao-config.json (${Math.round(JSON.stringify(output).length / 1024)}KB)`);

  if (JSON_OUTPUT) {
    console.log('\n' + JSON.stringify(output, null, 2));
  }
}

function formatVal(val) {
  if (val === null || val === undefined) return '∅ (vazio)';
  if (Array.isArray(val)) return val.map(v => typeof v === 'object' ? JSON.stringify(v) : String(v)).join(', ');
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

main().catch(e => { console.error('❌ Erro:', e.message); process.exit(1); });
