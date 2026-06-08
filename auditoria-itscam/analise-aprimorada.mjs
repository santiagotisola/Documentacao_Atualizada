/**
 * ══════════════════════════════════════════════════════════════
 * ANÁLISE APRIMORADA — ITScam 450 (72 equipamentos)
 * ══════════════════════════════════════════════════════════════
 * 
 * Compara a configuração ATUAL de cada equipamento contra a
 * configuração PADRÃO definida em config-padrao/padrao-faixa-{1,2}.json.
 * 
 * Também coleta informações sobre:
 * - Usuários configurados no sistema (quem pode alterar)
 * - REST API Client (template de envio ao servidor)
 * - Diferenças detalhadas vs padrão
 * 
 * USO:
 *   node auditoria-itscam/analise-aprimorada.mjs                  → todos
 *   node auditoria-itscam/analise-aprimorada.mjs --equip=GOEC6O010 → filtro
 *   node auditoria-itscam/analise-aprimorada.mjs --coleta          → coleta + análise
 *   node auditoria-itscam/analise-aprimorada.mjs --json            → saída JSON
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
// CONFIGURAÇÃO PADRÃO
// ═══════════════════════════════════════════════════════════════

const PADRAO_F1 = JSON.parse(readFileSync(resolve(BASE_DIR, 'config-padrao/padrao-faixa-1.json'), 'utf8'));
const PADRAO_F2 = JSON.parse(readFileSync(resolve(BASE_DIR, 'config-padrao/padrao-faixa-2.json'), 'utf8'));

function getPadrao(nome) {
  return nome.toLowerCase().includes('faixa 2') || nome.includes('- F2') ? PADRAO_F2 : PADRAO_F1;
}

// ═══════════════════════════════════════════════════════════════
// REGRAS DE VALIDAÇÃO
// ═══════════════════════════════════════════════════════════════

const REGRAS = [
  {
    id: 'VARCO_ENABLED',
    secao: 'varco',
    titulo: 'VARCO Habilitado',
    menu: 'Sistema > Manutenção > Acesso Remoto',
    campo: 'remoteAccess.varco.enabled',
    severidade: 'critico',
    validar: (raw, padrao) => {
      const val = raw?.varco?.remoteAccess?.varco?.enabled;
      const esp = padrao.varco.remoteAccess.varco.enabled;
      return { ok: val === esp, atual: val, esperado: esp };
    }
  },
  {
    id: 'VARCO_EDGE_SERVER',
    secao: 'varco',
    titulo: 'VARCO Edge Server',
    menu: 'Sistema > Manutenção > Acesso Remoto',
    campo: 'remoteAccess.varco.edgeServer',
    severidade: 'critico',
    validar: (raw, padrao) => {
      const val = raw?.varco?.remoteAccess?.varco?.edgeServer;
      const esp = padrao.varco.remoteAccess.varco.edgeServer;
      return { ok: val === esp, atual: val, esperado: esp };
    }
  },
  {
    id: 'VARCO_PROVISION_KEY',
    secao: 'varco',
    titulo: 'VARCO Provision Key',
    menu: 'Sistema > Manutenção > Acesso Remoto',
    campo: 'remoteAccess.varco.provisionKey',
    severidade: 'critico',
    validar: (raw, padrao) => {
      const val = raw?.varco?.remoteAccess?.varco?.provisionKey;
      const esp = padrao.varco.remoteAccess.varco.provisionKey;
      return { ok: val === esp, atual: val, esperado: esp };
    }
  },
  {
    id: 'PROFILE_TRANSITION_LOWER_LEVEL',
    secao: 'profiles',
    titulo: 'Perfil Transição: Lower Level',
    menu: 'Imagem > Perfis > Transições',
    campo: 'transitions.lower.level',
    severidade: 'alto',
    validar: (raw, padrao) => {
      const profiles = raw?.profiles || [];
      const esp = padrao.profiles.transitions.lower.level;
      const erros = [];
      profiles.forEach((p, i) => {
        const val = p?.transitions?.lower?.level;
        if (val !== esp) erros.push({ perfil: i, atual: val, esperado: esp });
      });
      return { ok: erros.length === 0, erros, esperado: esp };
    }
  },
  {
    id: 'PROFILE_TRANSITION_UPPER_LEVEL',
    secao: 'profiles',
    titulo: 'Perfil Transição: Upper Level',
    menu: 'Imagem > Perfis > Transições',
    campo: 'transitions.upper.level',
    severidade: 'alto',
    validar: (raw, padrao) => {
      const profiles = raw?.profiles || [];
      const esp = padrao.profiles.transitions.upper.level;
      const erros = [];
      profiles.forEach((p, i) => {
        const val = p?.transitions?.upper?.level;
        if (val !== esp) erros.push({ perfil: i, atual: val, esperado: esp });
      });
      return { ok: erros.length === 0, erros, esperado: esp };
    }
  },
  {
    id: 'PROFILE_TRANSITION_LOWER_TIME',
    secao: 'profiles',
    titulo: 'Perfil Transição: Lower startTime/endTime',
    menu: 'Imagem > Perfis > Transições',
    campo: 'transitions.lower.startTime / endTime',
    severidade: 'alto',
    validar: (raw, padrao) => {
      const profiles = raw?.profiles || [];
      const erros = [];
      profiles.forEach((p, i) => {
        const st = p?.transitions?.lower?.startTime;
        const et = p?.transitions?.lower?.endTime;
        if (st !== '00:00:00') erros.push({ perfil: i, campo: 'startTime', atual: st, esperado: '00:00:00' });
        if (et !== '00:00:00') erros.push({ perfil: i, campo: 'endTime', atual: et, esperado: '00:00:00' });
      });
      return { ok: erros.length === 0, erros };
    }
  },
  {
    id: 'PROFILE_TRANSITION_UPPER_TIME',
    secao: 'profiles',
    titulo: 'Perfil Transição: Upper startTime/endTime',
    menu: 'Imagem > Perfis > Transições',
    campo: 'transitions.upper.startTime / endTime',
    severidade: 'alto',
    validar: (raw, padrao) => {
      const profiles = raw?.profiles || [];
      const erros = [];
      profiles.forEach((p, i) => {
        const st = p?.transitions?.upper?.startTime;
        const et = p?.transitions?.upper?.endTime;
        if (st !== '00:00:00') erros.push({ perfil: i, campo: 'startTime', atual: st, esperado: '00:00:00' });
        if (et !== '00:00:00') erros.push({ perfil: i, campo: 'endTime', atual: et, esperado: '00:00:00' });
      });
      return { ok: erros.length === 0, erros };
    }
  },
  {
    id: 'PROFILE_TRANSITION_UPPER_PROFILE',
    secao: 'profiles',
    titulo: 'Perfil Transição: Upper Profile (P&B)',
    menu: 'Imagem > Perfis > Transições',
    campo: 'transitions.upper.profile',
    severidade: 'critico',
    validar: (raw, padrao) => {
      const profiles = raw?.profiles || [];
      const esp = padrao.profiles.transitions.upper.profile;
      const erros = [];
      profiles.forEach((p, i) => {
        const val = p?.transitions?.upper?.profile;
        if (i === 1 && val !== esp) erros.push({ perfil: i, atual: val, esperado: esp });
      });
      return { ok: erros.length === 0, erros, esperado: esp };
    }
  },
  {
    id: 'OCR_ENABLED',
    secao: 'ocr',
    titulo: 'OCR Habilitado',
    menu: 'Equipamento > OCR',
    campo: 'ocr.enabled',
    severidade: 'critico',
    validar: (raw, padrao) => {
      const val = raw?.ocr?.ocr?.enabled;
      const esp = padrao.ocr.ocr.enabled;
      return { ok: val === esp, atual: val, esperado: esp };
    }
  },
  {
    id: 'OCR_MAX_PLATES',
    secao: 'ocr',
    titulo: 'OCR Max Plates',
    menu: 'Equipamento > OCR',
    campo: 'ocr.maxPlates',
    severidade: 'alto',
    validar: (raw, padrao) => {
      const val = raw?.ocr?.ocr?.maxPlates;
      const esp = padrao.ocr.ocr.maxPlates;
      return { ok: val === esp, atual: val, esperado: esp };
    }
  },
  {
    id: 'OCR_COUNTRY_CODE',
    secao: 'ocr',
    titulo: 'OCR Country Code (Brasil=76)',
    menu: 'Equipamento > OCR',
    campo: 'ocr.countryCode',
    severidade: 'critico',
    validar: (raw, padrao) => {
      const val = raw?.ocr?.ocr?.countryCode;
      const esp = padrao.ocr.ocr.countryCode;
      return { ok: val === esp, atual: val, esperado: esp };
    }
  },
  {
    id: 'OCR_PROCESSING_MODE',
    secao: 'ocr',
    titulo: 'OCR Processing Mode',
    menu: 'Equipamento > OCR',
    campo: 'ocr.processingMode',
    severidade: 'medio',
    validar: (raw, padrao) => {
      const val = raw?.ocr?.ocr?.processingMode;
      const esp = padrao.ocr.ocr.processingMode;
      return { ok: val === esp, atual: val, esperado: esp };
    }
  },
  {
    id: 'OCR_PROCESSING_QUEUE',
    secao: 'ocr',
    titulo: 'OCR Processing Queue',
    menu: 'Equipamento > OCR',
    campo: 'ocr.processingQueue',
    severidade: 'medio',
    validar: (raw, padrao) => {
      const val = raw?.ocr?.ocr?.processingQueue;
      const esp = padrao.ocr.ocr.processingQueue;
      return { ok: val === esp, atual: val, esperado: esp };
    }
  },
  {
    id: 'OCR_PROCESSING_THREADS',
    secao: 'ocr',
    titulo: 'OCR Processing Threads',
    menu: 'Equipamento > OCR',
    campo: 'ocr.processingThreads',
    severidade: 'medio',
    validar: (raw, padrao) => {
      const val = raw?.ocr?.ocr?.processingThreads;
      const esp = padrao.ocr.ocr.processingThreads;
      return { ok: val === esp, atual: val, esperado: esp };
    }
  },
  {
    id: 'OCR_VEHICLE_TYPE',
    secao: 'ocr',
    titulo: 'OCR Vehicle Type',
    menu: 'Equipamento > OCR',
    campo: 'ocr.vehicleType',
    severidade: 'alto',
    validar: (raw, padrao) => {
      const val = raw?.ocr?.ocr?.vehicleType;
      const esp = padrao.ocr.ocr.vehicleType;
      return { ok: val === esp, atual: val, esperado: esp };
    }
  },
  {
    id: 'CLASSIFIER_QUEUE',
    secao: 'classifier',
    titulo: 'Classificador Queue',
    menu: 'Equipamento > Classificador',
    campo: 'classifier.processingQueue',
    severidade: 'alto',
    validar: (raw, padrao) => {
      const val = raw?.classifier?.classifier?.processingQueue;
      const esp = padrao.classifier.classifier.processingQueue;
      return { ok: val === esp, atual: val, esperado: esp };
    }
  },
  {
    id: 'CLASSIFIER_THREADS',
    secao: 'classifier',
    titulo: 'Classificador Threads',
    menu: 'Equipamento > Classificador',
    campo: 'classifier.processingThreads',
    severidade: 'alto',
    validar: (raw, padrao) => {
      const val = raw?.classifier?.classifier?.processingThreads;
      const esp = padrao.classifier.classifier.processingThreads;
      return { ok: val === esp, atual: val, esperado: esp };
    }
  },
  {
    id: 'CLASSIFIER_ENABLED',
    secao: 'classifier',
    titulo: 'Classificador Habilitado',
    menu: 'Equipamento > Classificador',
    campo: 'classifier.enabled',
    severidade: 'critico',
    validar: (raw, padrao) => {
      const val = raw?.classifier?.classifier?.enabled;
      const esp = padrao.classifier.classifier.enabled;
      return { ok: val === esp, atual: val, esperado: esp };
    }
  },
  {
    id: 'SNAPSHOT_CROP_DISABLED',
    secao: 'misc',
    titulo: 'Snapshot Crop Desabilitado',
    menu: 'Equipamento > Diversos',
    campo: 'snapshotCrop.enable',
    severidade: 'medio',
    validar: (raw, padrao) => {
      const val = raw?.misc?.snapshotCrop?.enable;
      const esp = padrao.misc.snapshotCrop.enable;
      return { ok: val === esp, atual: val, esperado: esp };
    }
  },
  {
    id: 'DATETIME_NTP',
    secao: 'dateTime',
    titulo: 'NTP Habilitado',
    menu: 'Equipamento > Data e Hora',
    campo: 'useNTPServer',
    severidade: 'alto',
    validar: (raw, padrao) => {
      const val = raw?.dateTime?.useNTPServer;
      const esp = padrao.dateTime.useNTPServer;
      return { ok: val === esp, atual: val, esperado: esp };
    }
  },
  {
    id: 'DATETIME_TIMEZONE',
    secao: 'dateTime',
    titulo: 'Timezone (America/Sao_Paulo)',
    menu: 'Equipamento > Data e Hora',
    campo: 'timezone',
    severidade: 'alto',
    validar: (raw, padrao) => {
      const val = raw?.dateTime?.timezone;
      const esp = padrao.dateTime.timezone;
      const ok = JSON.stringify(val) === JSON.stringify(esp);
      return { ok, atual: val?.join('/'), esperado: esp.join('/') };
    }
  },
  {
    id: 'DATETIME_NTP_SERVER',
    secao: 'dateTime',
    titulo: 'Servidor NTP',
    menu: 'Equipamento > Data e Hora',
    campo: 'ntpServerAddress',
    severidade: 'medio',
    validar: (raw, padrao) => {
      const val = raw?.dateTime?.ntpServerAddress;
      const esp = padrao.dateTime.ntpServerAddress;
      const ok = JSON.stringify(val) === JSON.stringify(esp);
      return { ok, atual: val?.join(', '), esperado: esp.join(', ') };
    }
  },
  {
    id: 'VIDEO_FRAMERATE',
    secao: 'video',
    titulo: 'Vídeo Framerate',
    menu: 'Vídeo > Streams',
    campo: 'mjpeg.main.framerate',
    severidade: 'medio',
    validar: (raw, padrao) => {
      const val = raw?.video?.mjpeg?.main?.framerate;
      const esp = padrao.video.mjpeg.main.framerate;
      return { ok: val === esp, atual: val, esperado: esp };
    }
  },
  {
    id: 'VIDEO_QUALITY',
    secao: 'video',
    titulo: 'Vídeo Qualidade JPEG',
    menu: 'Vídeo > Streams',
    campo: 'mjpeg.main.quality',
    severidade: 'medio',
    validar: (raw, padrao) => {
      const val = raw?.video?.mjpeg?.main?.quality;
      const esp = padrao.video.mjpeg.main.quality;
      return { ok: val === esp, atual: val, esperado: esp };
    }
  },
  {
    id: 'SNMP_DISABLED',
    secao: 'snmp',
    titulo: 'SNMP Desabilitado',
    menu: 'Sistema > Monitoramento > SNMP',
    campo: 'enabled',
    severidade: 'baixo',
    validar: (raw, padrao) => {
      const val = raw?.snmp?.enabled;
      const esp = padrao.snmp.enabled;
      return { ok: val === esp, atual: val, esperado: esp };
    }
  },
  {
    id: 'FTP_DISABLED',
    secao: 'ftp',
    titulo: 'FTP Desabilitado',
    menu: 'Equipamento > Servidores > FTP',
    campo: 'ftp.enable',
    severidade: 'baixo',
    validar: (raw, padrao) => {
      const val = raw?.ftp?.ftp?.enable;
      const esp = padrao.ftp.ftp.enable;
      return { ok: val === esp, atual: val, esperado: esp };
    }
  },
];

// ═══════════════════════════════════════════════════════════════
// COLETA DE DADOS EXTRAS (usuários, REST API client)
// ═══════════════════════════════════════════════════════════════

const EXTRA_ENDPOINTS = [
  '/api/system/users',
  '/api/equipment/servers/restApiClient',
  '/api/system/logs',
];

async function coletarExtras(dev) {
  const base = TUNNEL_BASE.replace('{UUID}', dev.uuid);
  try {
    const authRes = await fetch(base + '/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ params: CREDENTIALS }),
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });
    if (!authRes.ok) return { error: 'AUTH_FAILED' };
    const { token } = await authRes.json();

    const extras = {};
    for (const ep of EXTRA_ENDPOINTS) {
      const key = ep.split('/').pop();
      try {
        const r = await fetch(base + ep, {
          headers: { Authorization: 'Bearer ' + token },
          signal: AbortSignal.timeout(TIMEOUT_MS)
        });
        if (r.ok) extras[key] = await r.json();
        else extras[key] = { _error: r.status };
      } catch (e) { extras[key] = { _error: e.message }; }
    }
    return extras;
  } catch (e) {
    return { error: e.message };
  }
}

// ═══════════════════════════════════════════════════════════════
// ANÁLISE
// ═══════════════════════════════════════════════════════════════

function analisarDevice(dev) {
  if (!dev.raw) return { nome: dev.nome, status: 'offline', divergencias: [], extras: null };

  const padrao = getPadrao(dev.nome);
  const divergencias = [];

  for (const regra of REGRAS) {
    const resultado = regra.validar(dev.raw, padrao);
    if (!resultado.ok) {
      divergencias.push({
        id: regra.id,
        titulo: regra.titulo,
        secao: regra.secao,
        menu: regra.menu,
        campo: regra.campo,
        severidade: regra.severidade,
        ...resultado,
      });
    }
  }

  return {
    nome: dev.nome,
    uuid: dev.uuid,
    ip: dev.ip,
    status: 'online',
    firmware: dev.raw?.firmware?.version || 'desconhecido',
    totalRegras: REGRAS.length,
    conformes: REGRAS.length - divergencias.length,
    divergencias,
  };
}

function analisarRestApiClient(extras) {
  if (!extras?.restApiClient) return null;
  const client = extras.restApiClient;
  if (client._error) return { status: 'erro', detalhe: client._error };
  return {
    status: 'coletado',
    dados: client,
  };
}

function analisarUsuarios(extras) {
  if (!extras?.users) return null;
  const users = extras.users;
  if (users._error) return { status: 'erro', detalhe: users._error };
  
  // Lista de usuários configurados no equipamento
  const lista = Array.isArray(users) ? users : users.users || [];
  return {
    status: 'coletado',
    total: lista.length,
    usuarios: lista.map(u => ({
      username: u.username || u.name,
      role: u.role || u.level || 'unknown',
      enabled: u.enabled !== false,
    })),
  };
}

function analisarLogs(extras) {
  if (!extras?.logs) return null;
  const logs = extras.logs;
  if (logs._error) return { status: 'erro', detalhe: logs._error };
  
  // Extrair últimas alterações de configuração dos logs
  const entries = Array.isArray(logs) ? logs : logs.entries || logs.logs || [];
  const alteracoes = entries
    .filter(e => {
      const msg = (e.message || e.msg || '').toLowerCase();
      return msg.includes('config') || msg.includes('setting') || msg.includes('changed') || msg.includes('update');
    })
    .slice(0, 20)
    .map(e => ({
      timestamp: e.timestamp || e.date || e.time,
      usuario: e.user || e.username || 'sistema',
      mensagem: e.message || e.msg,
    }));

  return {
    status: 'coletado',
    totalEntries: entries.length,
    alteracoesRecentes: alteracoes,
  };
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

const args = process.argv.slice(2);
const getArg = (name) => args.find(a => a.startsWith(`--${name}=`))?.split('=')[1] || null;
const hasFlag = (name) => args.includes(`--${name}`);

const FILTRO_EQUIP = getArg('equip');
const COLETAR = hasFlag('coleta');
const JSON_OUTPUT = hasFlag('json');
const APENAS_DIVERGENTES = hasFlag('divergentes');

async function main() {
  console.log('══════════════════════════════════════════════════════');
  console.log('  ANÁLISE APRIMORADA — ITScam 450 vs Config Padrão');
  console.log('══════════════════════════════════════════════════════\n');

  // Load current data
  const dataPath = resolve(BASE_DIR, 'analise-dados.json');
  if (!existsSync(dataPath)) {
    console.error('❌ analise-dados.json não encontrado. Execute recoletar-dados.mjs primeiro.');
    process.exit(1);
  }
  const data = JSON.parse(readFileSync(dataPath, 'utf8'));
  const allDevices = data.devices || data;
  
  console.log(`📊 Dados de: ${data.ultimaAtualizacao || 'desconhecido'}`);
  console.log(`📡 Total dispositivos: ${allDevices.length}`);
  console.log(`📏 Regras de validação: ${REGRAS.length}\n`);

  // Filter
  let devices = allDevices;
  if (FILTRO_EQUIP) {
    devices = devices.filter(d => d.nome.toLowerCase().includes(FILTRO_EQUIP.toLowerCase()));
    console.log(`🔎 Filtro: "${FILTRO_EQUIP}" → ${devices.length} dispositivos\n`);
  }

  // Analyse all
  const resultados = devices.map(d => analisarDevice(d));

  // Collect extras if requested
  let extrasMap = {};
  if (COLETAR) {
    console.log(`\n🔄 Coletando dados extras (usuários, REST API Client, logs)...`);
    for (let i = 0; i < devices.length; i += BATCH_SIZE) {
      const batch = devices.slice(i, i + BATCH_SIZE).filter(d => d.raw);
      const extras = await Promise.all(batch.map(d => coletarExtras(d)));
      batch.forEach((d, idx) => {
        extrasMap[d.uuid] = extras[idx];
      });
      process.stdout.write(`\r  [${Math.min(i + BATCH_SIZE, devices.length)}/${devices.length}]`);
    }
    console.log(' ✅\n');

    // Enrich results with extras
    resultados.forEach(r => {
      const extras = extrasMap[r.uuid];
      if (extras && !extras.error) {
        r.restApiClient = analisarRestApiClient(extras);
        r.usuarios = analisarUsuarios(extras);
        r.logsAlteracao = analisarLogs(extras);
      }
    });
  }

  // Summary
  const online = resultados.filter(r => r.status === 'online');
  const offline = resultados.filter(r => r.status === 'offline');
  const conformes = online.filter(r => r.divergencias.length === 0);
  const divergentes = online.filter(r => r.divergencias.length > 0);

  console.log('─────────────────────────────────────────────────────');
  console.log('  RESUMO');
  console.log('─────────────────────────────────────────────────────');
  console.log(`  ✅ Conformes:    ${conformes.length}`);
  console.log(`  ⚠️  Divergentes:  ${divergentes.length}`);
  console.log(`  ❌ Offline:      ${offline.length}`);
  console.log(`  📊 Total:        ${resultados.length}`);
  console.log('─────────────────────────────────────────────────────\n');

  // Divergence breakdown by severity
  const bySeverity = { critico: 0, alto: 0, medio: 0, baixo: 0 };
  divergentes.forEach(d => d.divergencias.forEach(div => bySeverity[div.severidade]++));
  console.log('  Por severidade:');
  console.log(`    🔴 Crítico: ${bySeverity.critico}`);
  console.log(`    🟠 Alto:    ${bySeverity.alto}`);
  console.log(`    🟡 Médio:   ${bySeverity.medio}`);
  console.log(`    🔵 Baixo:   ${bySeverity.baixo}`);
  console.log('');

  // Top divergences
  const divCount = {};
  divergentes.forEach(d => d.divergencias.forEach(div => {
    divCount[div.id] = (divCount[div.id] || 0) + 1;
  }));
  const topDivs = Object.entries(divCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
  if (topDivs.length > 0) {
    console.log('  Top 10 divergências mais frequentes:');
    topDivs.forEach(([id, count]) => {
      const regra = REGRAS.find(r => r.id === id);
      console.log(`    ${count.toString().padStart(3)}x  ${regra?.titulo || id}`);
    });
    console.log('');
  }

  // Detail output
  if (!JSON_OUTPUT) {
    const toShow = APENAS_DIVERGENTES ? divergentes : divergentes;
    toShow.forEach(d => {
      console.log(`\n┌─ ${d.nome} (${d.firmware})`);
      console.log(`│  Conformes: ${d.conformes}/${d.totalRegras} | Divergências: ${d.divergencias.length}`);
      if (d.usuarios) {
        console.log(`│  👤 Usuários: ${d.usuarios.total} — [${d.usuarios.usuarios.map(u => u.username).join(', ')}]`);
      }
      if (d.restApiClient?.status === 'coletado') {
        console.log(`│  📡 REST API Client: configurado`);
      }
      if (d.logsAlteracao?.alteracoesRecentes?.length > 0) {
        console.log(`│  📝 Alterações recentes: ${d.logsAlteracao.alteracoesRecentes.length}`);
        d.logsAlteracao.alteracoesRecentes.slice(0, 3).forEach(a => {
          console.log(`│     ${a.timestamp} — ${a.usuario}: ${a.mensagem?.slice(0, 60)}`);
        });
      }
      d.divergencias.forEach(div => {
        const sev = div.severidade === 'critico' ? '🔴' : div.severidade === 'alto' ? '🟠' : div.severidade === 'medio' ? '🟡' : '🔵';
        console.log(`│  ${sev} ${div.titulo}`);
        console.log(`│     Menu: ${div.menu} > ${div.campo}`);
        if (div.erros && Array.isArray(div.erros)) {
          div.erros.forEach(e => console.log(`│     Perfil ${e.perfil}: atual=${e.atual} esperado=${e.esperado}`));
        } else {
          console.log(`│     Atual: ${div.atual} | Esperado: ${div.esperado}`);
        }
      });
      console.log(`└─────────────────────────────────────────────`);
    });
  }

  // Save results
  const outputData = {
    geradoEm: new Date().toISOString(),
    dadosBase: data.ultimaAtualizacao,
    totalDispositivos: resultados.length,
    totalRegras: REGRAS.length,
    resumo: {
      conformes: conformes.length,
      divergentes: divergentes.length,
      offline: offline.length,
      porSeveridade: bySeverity,
    },
    topDivergencias: topDivs.map(([id, count]) => ({
      id,
      titulo: REGRAS.find(r => r.id === id)?.titulo,
      count
    })),
    dispositivos: resultados,
  };

  const outPath = resolve(BASE_DIR, 'analise-aprimorada.json');
  writeFileSync(outPath, JSON.stringify(outputData, null, 2));
  console.log(`\n💾 Salvo: auditoria-itscam/analise-aprimorada.json`);
  console.log(`   Tamanho: ${Math.round(JSON.stringify(outputData).length / 1024)}KB`);

  if (JSON_OUTPUT) {
    console.log('\n' + JSON.stringify(outputData, null, 2));
  }
}

main().catch(e => { console.error('❌ Erro:', e.message); process.exit(1); });
