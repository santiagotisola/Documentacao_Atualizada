/**
 * Análise completa de todos os equipamentos ITSCAM 450
 * Identifica padrão majoritário e lista desvios
 */
import fs from 'fs';
import path from 'path';

const dir = './auditoria-itscam/resultados';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && !f.startsWith('_'));

const equipamentos = [];

for (const file of files) {
  try {
    const d = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    const name = d._device?.name || file.replace('.json', '');
    const uuid = d._device?.uuid || '';
    const ip = d._device?.ip || '';

    // Firmware
    const sysInfo = d.menus?.['05-SISTEMA/05a-GERAL']?.['api/system/info']?.data ||
                    d.menus?.['01-ESTADO-ATUAL']?.['api/system/info']?.data || {};

    // Volatile - uptime, fps, etc
    const volatile = d.menus?.['01-ESTADO-ATUAL']?.['/api/equipment/misc/readonly/volatile']?.data || {};
    const lastRun = volatile?.ae?.lastRun || 0;
    const uptimeHours = (lastRun / 3600000).toFixed(1);
    const fps = volatile?.fps?.mjpeg || 0;
    const profileName = volatile?.profile?.name || '';

    // Storage
    const storage = d.menus?.['01-ESTADO-ATUAL']?.['/api/system/maintenance/storage/usage']?.data || {};
    const diskUsed = storage?.disk?.used || 0;
    const diskTotal = storage?.disk?.total || 0;
    const diskUsedMB = Math.round(diskUsed / 1048576);
    const diskTotalMB = Math.round(diskTotal / 1048576);

    // Info
    const info = d.menus?.['01-ESTADO-ATUAL']?.['/api/equipment/info']?.data || {};
    const mac = info?.macAddress || '';
    const model = info?.model || '';
    const serial = info?.serialNumber || '';

    // Boards
    const boards = d.menus?.['01-ESTADO-ATUAL']?.['/api/equipment/boards']?.data || [];

    // Network
    const net = d.menus?.['05-SISTEMA/05b-REDE']?.['/api/equipment/network']?.data || {};
    const ipLocal = net?.ethernet?.ipv4Primary?.address || '';
    const gateway = net?.ethernet?.ipv4Primary?.gateway || '';
    const dns = net?.ethernet?.ipv4Primary?.dns || '';
    const hostname = net?.ethernet?.hostname || '';

    // VARCO
    const remoteAccess = d.menus?.['05-SISTEMA/05c-MANUTENCAO']?.['/api/system/maintenance/remoteaccess']?.data || {};
    const varcoEnabled = remoteAccess?.remoteAccess?.varco?.enabled || false;
    const varcoDevice = remoteAccess?.remoteAccess?.varco?.deviceName || '';
    const varcoEdge = remoteAccess?.remoteAccess?.varco?.edgeServer || '';
    const varcoKey = remoteAccess?.remoteAccess?.varco?.provisionKey || '';

    // REST presets
    const presets = d.menus?.['04-EQUIPAMENTO/04f-SERVIDORES']?.['/api/equipment/servers/restapiclient/presets']?.data || {};
    const pumaEnabled = presets?.pumatronix?.enabled ?? null;
    const pumaHost = presets?.pumatronix?.url?.host || '';
    const pumaScheme = presets?.pumatronix?.url?.scheme || '';
    const compatEnabled = presets?.pumatronixCompat_v1_7_6?.enabled ?? null;
    const compatHost = presets?.pumatronixCompat_v1_7_6?.url?.host || '';
    const heliosEnabled = presets?.helios?.enabled ?? null;
    const heliosHost = presets?.helios?.url?.host || '';
    const heliosPath = presets?.helios?.url?.path || '';
    const rfbEnabled = presets?.RFB?.enabled ?? null;
    const rfbHost = presets?.RFB?.url?.host || '';

    // FTP
    const ftpData = d.menus?.['04-EQUIPAMENTO/04f-SERVIDORES']?.['/api/equipment/servers/ftp']?.data || {};
    const ftpEnabled = ftpData?.ftp?.enable || false;
    const ftpAddress = ftpData?.ftp?.address || '';

    // ITScam Pro
    const itscamPro = d.menus?.['04-EQUIPAMENTO/04f-SERVIDORES']?.['/api/equipment/servers/itscampro']?.data || {};
    const itscamProEnabled = itscamPro?.itscampro?.enable || false;
    const itscamProStatus = itscamPro?.itscampro?.status || '';
    const itscamProAddress = itscamPro?.itscampro?.address || '';

    // Lince
    const lince = d.menus?.['04-EQUIPAMENTO/04f-SERVIDORES']?.['/api/equipment/servers/lince']?.data || {};
    const linceEnabled = lince?.lince?.enabled || false;

    // Protocols
    const protocols = d.menus?.['04-EQUIPAMENTO/04f-SERVIDORES']?.['/api/equipment/servers/protocols']?.data || {};
    const blockAPI = protocols?.configCgi?.blockAPI ?? null;
    const cougarAuth = protocols?.cougar?.auth?.require ?? null;

    // OCR
    const ocr = d.menus?.['04-EQUIPAMENTO/04a-OCR']?.['/api/equipment/ocr']?.data || {};
    const ocrEnabled = ocr?.ocr?.enabled ?? null;
    const ocrCountry = ocr?.ocr?.countryCode ?? null;
    const ocrMaxPlates = ocr?.ocr?.maxPlates ?? null;
    const ocrMinProb = ocr?.ocr?.minProbability ?? null;
    const ocrLowProbChar = ocr?.ocr?.lowProbChar ?? null;
    const ocrMaxLowProb = ocr?.ocr?.maxLowProbChars ?? null;

    // Classifier
    const classif = d.menus?.['04-EQUIPAMENTO/04b-CLASSIFICADOR']?.['/api/equipment/classifier']?.data || {};
    const classifEnabled = classif?.classifier?.enabled ?? null;
    const classifQueue = classif?.classifier?.processingQueue ?? null;
    const classifThreads = classif?.classifier?.processingThreads ?? null;

    // Image profiles
    const profiles = d.menus?.['02-IMAGEM']?.['/api/image/profiles']?.data || [];
    let diurnoGainMax = null, diurnoShutterMax = null;
    let noturnoGainMax = null, noturnoShutterMax = null;
    let diurnoFlashEnabled = null, noturnoFlashEnabled = null;
    let diurnoLowerLevel = null, diurnoUpperLevel = null;
    let noturnoLowerLevel = null, noturnoUpperLevel = null;
    let noturnoUpperProfile = null;
    let diurnoLowerStart = null, diurnoLowerEnd = null;
    let noturnoUpperStart = null, noturnoUpperEnd = null;

    if (profiles.length >= 2) {
      const p0 = profiles[0]; // Diurno
      const p1 = profiles[1]; // Noturno
      diurnoGainMax = p0?.exposition?.gainMax ?? null;
      diurnoShutterMax = p0?.exposition?.shutterMax ?? null;
      noturnoGainMax = p1?.exposition?.gainMax ?? null;
      noturnoShutterMax = p1?.exposition?.shutterMax ?? null;
      diurnoFlashEnabled = p0?.flash?.enabled ?? null;
      noturnoFlashEnabled = p1?.flash?.enabled ?? null;
      diurnoLowerLevel = p0?.transitions?.lower?.level ?? null;
      diurnoUpperLevel = p0?.transitions?.upper?.level ?? null;
      noturnoLowerLevel = p1?.transitions?.lower?.level ?? null;
      noturnoUpperLevel = p1?.transitions?.upper?.level ?? null;
      noturnoUpperProfile = p1?.transitions?.upper?.profile ?? null;
      diurnoLowerStart = p0?.transitions?.lower?.startTime ?? null;
      diurnoLowerEnd = p0?.transitions?.lower?.endTime ?? null;
      noturnoUpperStart = p1?.transitions?.upper?.startTime ?? null;
      noturnoUpperEnd = p1?.transitions?.upper?.endTime ?? null;
    }

    // Lanes
    const lanes = d.menus?.['04-EQUIPAMENTO/04c-FAIXAS']?.['/api/equipment/lanes']?.data || {};
    const lanesEnabled = lanes?.lanes?.enabled ?? null;

    // General
    const general = d.menus?.['05-SISTEMA/05a-GERAL']?.['/api/equipment/general']?.data || {};
    const equipName = general?.equipmentName || '';

    // Misc
    const misc = d.menus?.['04-EQUIPAMENTO/04i-DIVERSOS']?.['/api/equipment/misc']?.data || {};
    const snapshotCrop = misc?.snapshotCrop?.enable ?? null;
    const snapshotMode = misc?.snapshotCrop?.mode || '';

    // Date/Time
    const dateTime = d.menus?.['05-SISTEMA/05a-GERAL']?.['/api/equipment/dateAndTime']?.data || {};
    const timezone = dateTime?.timezone || '';
    const ntpEnabled = dateTime?.ntp?.enable ?? null;
    const ntpServer = dateTime?.ntp?.server || '';
    const gpsSync = dateTime?.gps?.synchronize ?? null;

    // IO Ports
    const io = d.menus?.['04-EQUIPAMENTO/04h-PORTAS-IO']?.['/api/equipment/io']?.data || {};

    equipamentos.push({
      name, uuid, ip, mac, model, serial, hostname, ipLocal, gateway, dns,
      varcoEnabled, varcoDevice, varcoEdge, varcoKey,
      pumaEnabled, pumaHost, pumaScheme, compatEnabled, compatHost,
      heliosEnabled, heliosHost, heliosPath, rfbEnabled, rfbHost,
      ftpEnabled, ftpAddress, itscamProEnabled, itscamProStatus, itscamProAddress,
      linceEnabled, blockAPI, cougarAuth,
      ocrEnabled, ocrCountry, ocrMaxPlates, ocrMinProb, ocrLowProbChar, ocrMaxLowProb,
      classifEnabled, classifQueue, classifThreads,
      diurnoGainMax, diurnoShutterMax, noturnoGainMax, noturnoShutterMax,
      diurnoFlashEnabled, noturnoFlashEnabled,
      diurnoLowerLevel, diurnoUpperLevel, noturnoLowerLevel, noturnoUpperLevel,
      noturnoUpperProfile,
      diurnoLowerStart, diurnoLowerEnd, noturnoUpperStart, noturnoUpperEnd,
      snapshotCrop, snapshotMode,
      timezone, ntpEnabled, ntpServer, gpsSync,
      uptimeHours: parseFloat(uptimeHours), fps, profileName,
      diskUsedMB, diskTotalMB,
      lanesEnabled
    });
  } catch (e) {
    console.error('Erro em ' + file + ': ' + e.message);
  }
}

// Sort
equipamentos.sort((a, b) => a.name.localeCompare(b.name));
console.log('Total equipamentos carregados:', equipamentos.length);

// ─── Determinar PADRÃO MAJORITÁRIO para cada campo ───────────────────────────
const configFields = [
  'varcoEnabled', 'varcoEdge', 'varcoKey',
  'pumaEnabled', 'pumaHost', 'pumaScheme', 'compatEnabled', 'compatHost',
  'heliosEnabled', 'heliosHost', 'heliosPath', 'rfbEnabled', 'rfbHost',
  'ftpEnabled', 'itscamProEnabled', 'linceEnabled',
  'blockAPI', 'cougarAuth',
  'ocrEnabled', 'ocrCountry', 'ocrMaxPlates', 'ocrMinProb', 'ocrLowProbChar', 'ocrMaxLowProb',
  'classifEnabled', 'classifQueue', 'classifThreads',
  'diurnoGainMax', 'diurnoShutterMax', 'noturnoGainMax', 'noturnoShutterMax',
  'diurnoFlashEnabled', 'noturnoFlashEnabled',
  'diurnoLowerLevel', 'diurnoUpperLevel', 'noturnoLowerLevel', 'noturnoUpperLevel',
  'noturnoUpperProfile',
  'diurnoLowerStart', 'diurnoLowerEnd', 'noturnoUpperStart', 'noturnoUpperEnd',
  'snapshotCrop', 'snapshotMode',
  'timezone', 'ntpEnabled', 'ntpServer', 'gpsSync',
  'gateway', 'dns', 'lanesEnabled'
];

const padrao = {};
const desvios = {}; // { campo: [{ equip, valor, valorPadrao }] }

for (const field of configFields) {
  const counts = {};
  for (const eq of equipamentos) {
    const val = JSON.stringify(eq[field]);
    counts[val] = (counts[val] || 0) + 1;
  }
  // Valor mais frequente = padrão
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  padrao[field] = { valor: sorted[0][0], count: sorted[0][1], total: equipamentos.length };
  
  // Desvios
  desvios[field] = [];
  const valorPadrao = sorted[0][0];
  for (const eq of equipamentos) {
    const val = JSON.stringify(eq[field]);
    if (val !== valorPadrao) {
      desvios[field].push({ equip: eq.name, valor: eq[field], valorPadrao: JSON.parse(valorPadrao) });
    }
  }
}

// ─── Análise de conectividade e uptime ───────────────────────────────────────
const offline = equipamentos.filter(e => !e.varcoEnabled);
const instavel = equipamentos.filter(e => e.varcoEnabled && e.uptimeHours < 0);
const rebootRecente = equipamentos.filter(e => e.varcoEnabled && e.uptimeHours >= 0 && e.uptimeHours < 12);
const filaAlta = equipamentos.filter(e => e.diskUsedMB > 1000);
const operacional = equipamentos.filter(e => e.varcoEnabled && e.uptimeHours >= 12 && e.diskUsedMB <= 1000);

// ─── Gerar relatório ─────────────────────────────────────────────────────────
let report = `# ANÁLISE COMPLETA — 72 EQUIPAMENTOS ITSCAM 450 (GRUPO LABOR)\n\n`;
report += `**Data:** 03/06/2026  \n`;
report += `**Fonte:** Configurações coletadas via VARCO tunnel + Relatório Heartbeat VARCO  \n`;
report += `**Total analisados:** ${equipamentos.length} equipamentos  \n\n`;
report += `---\n\n`;

// ═══ SEÇÃO 1: PADRÃO MAJORITÁRIO ═══
report += `## 1. CONFIGURAÇÃO PADRÃO (Maioria dos equipamentos)\n\n`;
report += `| Parâmetro | Valor Padrão | Equipamentos em conformidade |\n`;
report += `|-----------|-------------|------------------------------|\n`;

const categorias = {
  'Integração VARCO': ['varcoEnabled', 'varcoEdge', 'varcoKey'],
  'REST Pumatronix': ['pumaEnabled', 'pumaHost', 'pumaScheme'],
  'REST PumatronixCompat': ['compatEnabled', 'compatHost'],
  'REST Helios (PM-MG)': ['heliosEnabled', 'heliosHost', 'heliosPath'],
  'REST RFB': ['rfbEnabled', 'rfbHost'],
  'FTP': ['ftpEnabled'],
  'ITScam Pro': ['itscamProEnabled'],
  'Lince': ['linceEnabled'],
  'Protocolos': ['blockAPI', 'cougarAuth'],
  'OCR': ['ocrEnabled', 'ocrCountry', 'ocrMaxPlates', 'ocrMinProb', 'ocrLowProbChar', 'ocrMaxLowProb'],
  'Classificador': ['classifEnabled', 'classifQueue', 'classifThreads'],
  'Perfil Diurno (Expo)': ['diurnoGainMax', 'diurnoShutterMax'],
  'Perfil Noturno (Expo)': ['noturnoGainMax', 'noturnoShutterMax'],
  'Flash': ['diurnoFlashEnabled', 'noturnoFlashEnabled'],
  'Transições (Níveis)': ['diurnoLowerLevel', 'diurnoUpperLevel', 'noturnoLowerLevel', 'noturnoUpperLevel'],
  'Transições (Horários)': ['diurnoLowerStart', 'diurnoLowerEnd', 'noturnoUpperStart', 'noturnoUpperEnd'],
  'Noturno→Diurno Profile': ['noturnoUpperProfile'],
  'Snapshot Crop': ['snapshotCrop', 'snapshotMode'],
  'Data/Hora': ['timezone', 'ntpEnabled', 'ntpServer', 'gpsSync'],
  'Rede': ['gateway', 'dns'],
  'Faixas': ['lanesEnabled']
};

for (const [cat, fields] of Object.entries(categorias)) {
  for (const f of fields) {
    const p = padrao[f];
    const pct = ((p.count / p.total) * 100).toFixed(0);
    const displayVal = p.valor.length > 50 ? p.valor.slice(0, 50) + '...' : p.valor;
    report += `| ${cat} → \`${f}\` | ${displayVal} | ${p.count}/${p.total} (${pct}%) |\n`;
  }
}

// ═══ SEÇÃO 2: DESVIOS ═══
report += `\n---\n\n`;
report += `## 2. EQUIPAMENTOS COM CONFIGURAÇÃO DIFERENTE DO PADRÃO\n\n`;

// Consolidar desvios por equipamento
const desviosPorEquip = {};
for (const [field, devs] of Object.entries(desvios)) {
  for (const d of devs) {
    if (!desviosPorEquip[d.equip]) desviosPorEquip[d.equip] = [];
    desviosPorEquip[d.equip].push({ campo: field, valor: d.valor, padrao: d.valorPadrao });
  }
}

// Ordenar por quantidade de desvios (mais desvios primeiro)
const equipDesviados = Object.entries(desviosPorEquip)
  .map(([equip, devs]) => ({ equip, devs, count: devs.length }))
  .sort((a, b) => b.count - a.count);

report += `### Resumo de desvios por equipamento\n\n`;
report += `| # | Equipamento | Qtd Desvios | Campos com problema |\n`;
report += `|---|-------------|-------------|--------------------|\n`;

for (let i = 0; i < equipDesviados.length; i++) {
  const e = equipDesviados[i];
  const campos = e.devs.map(d => d.campo).join(', ');
  report += `| ${i + 1} | ${e.equip} | ${e.count} | ${campos} |\n`;
}

// ═══ SEÇÃO 3: DETALHES DOS DESVIOS CRÍTICOS ═══
report += `\n---\n\n`;
report += `## 3. DETALHES DOS DESVIOS CRÍTICOS\n\n`;

// VARCO
const varcoDesvios = desvios['varcoEnabled'];
if (varcoDesvios.length > 0) {
  report += `### 3.1 VARCO Desabilitado (${varcoDesvios.length} equipamentos)\n\n`;
  report += `| Equipamento | VARCO | IP Público | Impacto |\n`;
  report += `|-------------|-------|------------|--------|\n`;
  for (const d of varcoDesvios) {
    const eq = equipamentos.find(e => e.name === d.equip);
    report += `| ${d.equip} | ❌ Desabilitado | ${eq.ip} | SEM CONECTIVIDADE REMOTA |\n`;
  }
  report += `\n`;
}

// Transições com horário (não 00:00:00)
const transDesvios = [...new Set([
  ...desvios['diurnoLowerStart'].map(d => d.equip),
  ...desvios['diurnoLowerEnd'].map(d => d.equip),
  ...desvios['noturnoUpperStart'].map(d => d.equip),
  ...desvios['noturnoUpperEnd'].map(d => d.equip)
])];
if (transDesvios.length > 0) {
  report += `### 3.2 Transições com Horário (risco de travar em P&B) — ${transDesvios.length} equipamentos\n\n`;
  report += `| Equipamento | Diurno Lower Start→End | Noturno Upper Start→End | Noturno→Profile |\n`;
  report += `|-------------|----------------------|------------------------|-----------------|\n`;
  for (const eqName of transDesvios) {
    const eq = equipamentos.find(e => e.name === eqName);
    report += `| ${eqName} | ${eq.diurnoLowerStart}→${eq.diurnoLowerEnd} | ${eq.noturnoUpperStart}→${eq.noturnoUpperEnd} | ${eq.noturnoUpperProfile} |\n`;
  }
  report += `\n**Padrão correto:** Todos os horários = \`0\` (00:00:00), noturnoUpperProfile = \`0\`\n\n`;
}

// Noturno upper profile
const profileDesvios = desvios['noturnoUpperProfile'];
if (profileDesvios.length > 0) {
  report += `### 3.3 Noturno Upper Profile INCORRETO (câmera trava em P&B)\n\n`;
  report += `| Equipamento | Valor | Deveria ser | Status |\n`;
  report += `|-------------|-------|-------------|--------|\n`;
  for (const d of profileDesvios) {
    const status = d.valor > 100 ? '🔴 CRÍTICO (aponta pra si)' : '⚠️ Verificar';
    report += `| ${d.equip} | ${d.valor} | 0 | ${status} |\n`;
  }
  report += `\n`;
}

// Classificador
const classifQDesvios = desvios['classifQueue'];
const classifTDesvios = desvios['classifThreads'];
if (classifQDesvios.length > 0 || classifTDesvios.length > 0) {
  const allClassifDesvios = [...new Set([...classifQDesvios.map(d => d.equip), ...classifTDesvios.map(d => d.equip)])];
  report += `### 3.4 Classificador com config diferente — ${allClassifDesvios.length} equipamentos\n\n`;
  report += `| Equipamento | Queue | Threads | Padrão Queue | Padrão Threads |\n`;
  report += `|-------------|-------|---------|--------------|----------------|\n`;
  for (const eqName of allClassifDesvios) {
    const eq = equipamentos.find(e => e.name === eqName);
    report += `| ${eqName} | ${eq.classifQueue} | ${eq.classifThreads} | ${JSON.parse(padrao['classifQueue'].valor)} | ${JSON.parse(padrao['classifThreads'].valor)} |\n`;
  }
  report += `\n`;
}

// Perfis de imagem
const gainDesvios = [...new Set([
  ...desvios['diurnoGainMax'].map(d => d.equip),
  ...desvios['diurnoShutterMax'].map(d => d.equip),
  ...desvios['noturnoGainMax'].map(d => d.equip),
  ...desvios['noturnoShutterMax'].map(d => d.equip)
])];
if (gainDesvios.length > 0) {
  report += `### 3.5 Exposição com valores diferentes — ${gainDesvios.length} equipamentos\n\n`;
  report += `| Equipamento | Diurno Gain | Diurno Shutter | Noturno Gain | Noturno Shutter | Padrão |\n`;
  report += `|-------------|------------|----------------|-------------|-----------------|--------|\n`;
  for (const eqName of gainDesvios) {
    const eq = equipamentos.find(e => e.name === eqName);
    const pGain = JSON.parse(padrao['diurnoGainMax'].valor);
    const pShut = JSON.parse(padrao['diurnoShutterMax'].valor);
    const pNGain = JSON.parse(padrao['noturnoGainMax'].valor);
    const pNShut = JSON.parse(padrao['noturnoShutterMax'].valor);
    const dg = eq.diurnoGainMax !== pGain ? `**${eq.diurnoGainMax}**` : eq.diurnoGainMax;
    const ds = eq.diurnoShutterMax !== pShut ? `**${eq.diurnoShutterMax}**` : eq.diurnoShutterMax;
    const ng = eq.noturnoGainMax !== pNGain ? `**${eq.noturnoGainMax}**` : eq.noturnoGainMax;
    const ns = eq.noturnoShutterMax !== pNShut ? `**${eq.noturnoShutterMax}**` : eq.noturnoShutterMax;
    report += `| ${eqName} | ${dg} | ${ds} | ${ng} | ${ns} | G:${pGain}/${pNGain} S:${pShut}/${pNShut} |\n`;
  }
  report += `\n`;
}

// Flash
const flashDesvios = [...new Set([
  ...desvios['diurnoFlashEnabled'].map(d => d.equip),
  ...desvios['noturnoFlashEnabled'].map(d => d.equip)
])];
if (flashDesvios.length > 0) {
  report += `### 3.6 Flash com config diferente — ${flashDesvios.length} equipamentos\n\n`;
  report += `| Equipamento | Diurno Flash | Noturno Flash | Padrão |\n`;
  report += `|-------------|-------------|---------------|--------|\n`;
  for (const eqName of flashDesvios) {
    const eq = equipamentos.find(e => e.name === eqName);
    report += `| ${eqName} | ${eq.diurnoFlashEnabled} | ${eq.noturnoFlashEnabled} | D:${JSON.parse(padrao['diurnoFlashEnabled'].valor)} / N:${JSON.parse(padrao['noturnoFlashEnabled'].valor)} |\n`;
  }
  report += `\n`;
}

// OCR
const ocrDesvios = [...new Set([
  ...desvios['ocrMinProb'].map(d => d.equip),
  ...desvios['ocrMaxPlates'].map(d => d.equip),
  ...desvios['ocrLowProbChar'].map(d => d.equip),
  ...desvios['ocrMaxLowProb'].map(d => d.equip)
])];
if (ocrDesvios.length > 0) {
  report += `### 3.7 OCR com parâmetros diferentes — ${ocrDesvios.length} equipamentos\n\n`;
  report += `| Equipamento | minProb | maxPlates | lowProbChar | maxLowProb |\n`;
  report += `|-------------|---------|-----------|-------------|------------|\n`;
  for (const eqName of ocrDesvios) {
    const eq = equipamentos.find(e => e.name === eqName);
    const pMinP = JSON.parse(padrao['ocrMinProb'].valor);
    const pMaxP = JSON.parse(padrao['ocrMaxPlates'].valor);
    const pLow = JSON.parse(padrao['ocrLowProbChar'].valor);
    const pMax = JSON.parse(padrao['ocrMaxLowProb'].valor);
    const mp = eq.ocrMinProb !== pMinP ? `**${eq.ocrMinProb}**` : eq.ocrMinProb;
    const mxp = eq.ocrMaxPlates !== pMaxP ? `**${eq.ocrMaxPlates}**` : eq.ocrMaxPlates;
    const lp = eq.ocrLowProbChar !== pLow ? `**${eq.ocrLowProbChar}**` : eq.ocrLowProbChar;
    const mxl = eq.ocrMaxLowProb !== pMax ? `**${eq.ocrMaxLowProb}**` : eq.ocrMaxLowProb;
    report += `| ${eqName} | ${mp} | ${mxp} | ${lp} | ${mxl} |\n`;
  }
  report += `\n`;
}

// ═══ SEÇÃO 4: STATUS OPERACIONAL ═══
report += `---\n\n`;
report += `## 4. STATUS OPERACIONAL (Conectividade e Uptime)\n\n`;
report += `| Status | Qtd | % |\n`;
report += `|--------|-----|---|\n`;
report += `| ✅ Operacional (VARCO + uptime >12h + storage <1GB) | ${operacional.length} | ${(operacional.length/equipamentos.length*100).toFixed(0)}% |\n`;
report += `| 🔄 Reboot Recente (<12h) | ${rebootRecente.length} | ${(rebootRecente.length/equipamentos.length*100).toFixed(0)}% |\n`;
report += `| ⚠️ Clock Instável (uptime negativo) | ${instavel.length} | ${(instavel.length/equipamentos.length*100).toFixed(0)}% |\n`;
report += `| 📦 Fila Acumulada (>1GB storage) | ${filaAlta.length} | ${(filaAlta.length/equipamentos.length*100).toFixed(0)}% |\n`;
report += `| ❌ Offline (VARCO desabilitado) | ${offline.length} | ${(offline.length/equipamentos.length*100).toFixed(0)}% |\n`;

report += `\n### Equipamentos Instáveis (clock/uptime negativo)\n\n`;
report += `| Equipamento | IP | Uptime (h) | Storage (MB) | Observação |\n`;
report += `|-------------|-----|------------|-------------|------------|\n`;
for (const eq of instavel.sort((a, b) => a.uptimeHours - b.uptimeHours)) {
  report += `| ${eq.name} | ${eq.ip} | ${eq.uptimeHours} | ${eq.diskUsedMB} | Clock dessincronizado |\n`;
}

report += `\n### Equipamentos com Fila Acumulada (storage > 1GB)\n\n`;
report += `| Equipamento | IP | Storage Usado | % Disco | Uptime |\n`;
report += `|-------------|-----|--------------|---------|--------|\n`;
for (const eq of filaAlta.sort((a, b) => b.diskUsedMB - a.diskUsedMB)) {
  const pct = (eq.diskUsedMB / eq.diskTotalMB * 100).toFixed(1);
  report += `| ${eq.name} | ${eq.ip} | ${eq.diskUsedMB} MB | ${pct}% | ${eq.uptimeHours}h |\n`;
}

// ═══ SEÇÃO 5: TABELA COMPLETA ═══
report += `\n---\n\n`;
report += `## 5. TABELA COMPLETA — TODOS OS ${equipamentos.length} EQUIPAMENTOS\n\n`;
report += `| # | Equipamento | IP | VARCO | Uptime(h) | Storage(MB) | Desvios | Status |\n`;
report += `|---|-------------|-----|-------|-----------|-------------|---------|--------|\n`;

for (let i = 0; i < equipamentos.length; i++) {
  const eq = equipamentos[i];
  const numDesvios = desviosPorEquip[eq.name]?.length || 0;
  let status = '✅ OK';
  if (!eq.varcoEnabled) status = '❌ OFFLINE';
  else if (eq.uptimeHours < 0) status = '⚠️ INSTÁVEL';
  else if (eq.uptimeHours < 12) status = '🔄 REBOOT';
  else if (eq.diskUsedMB > 1000) status = '📦 FILA';
  
  const desviosMark = numDesvios > 5 ? `**${numDesvios}**` : numDesvios > 0 ? `${numDesvios}` : '0';
  report += `| ${i + 1} | ${eq.name} | ${eq.ip} | ${eq.varcoEnabled ? '✅' : '❌'} | ${eq.uptimeHours} | ${eq.diskUsedMB} | ${desviosMark} | ${status} |\n`;
}

// ═══ SEÇÃO 6: EQUIPAMENTOS 100% EM CONFORMIDADE ═══
report += `\n---\n\n`;
report += `## 6. EQUIPAMENTOS 100% NO PADRÃO (Zero desvios de configuração)\n\n`;
const emConformidade = equipamentos.filter(e => !desviosPorEquip[e.name] || desviosPorEquip[e.name].length === 0);
if (emConformidade.length > 0) {
  report += `**${emConformidade.length} equipamentos** com configuração idêntica ao padrão:\n\n`;
  report += `| # | Equipamento | IP | UUID | VARCO | Uptime | Status |\n`;
  report += `|---|-------------|-----|------|-------|--------|--------|\n`;
  for (let i = 0; i < emConformidade.length; i++) {
    const eq = emConformidade[i];
    let st = '✅ OK';
    if (!eq.varcoEnabled) st = '❌ OFFLINE';
    else if (eq.uptimeHours < 0) st = '⚠️ CLOCK';
    else if (eq.uptimeHours < 12) st = '🔄 REBOOT';
    report += `| ${i + 1} | ${eq.name} | ${eq.ip} | ${eq.uuid.slice(0, 8)}... | ${eq.varcoEnabled ? '✅' : '❌'} | ${eq.uptimeHours}h | ${st} |\n`;
  }
} else {
  report += `Nenhum equipamento tem 100% das configurações idênticas ao padrão majoritário.\n`;
}

// ═══ SEÇÃO 7: RESUMO EXECUTIVO ═══
report += `\n---\n\n`;
report += `## 7. RESUMO EXECUTIVO\n\n`;
report += `### Números gerais\n`;
report += `- **${equipamentos.length}** equipamentos analisados\n`;
report += `- **${emConformidade.length}** em total conformidade (${(emConformidade.length/equipamentos.length*100).toFixed(0)}%)\n`;
report += `- **${equipDesviados.length}** com algum desvio de configuração\n`;
report += `- **${offline.length}** totalmente offline (VARCO desabilitado)\n`;
report += `- **${instavel.length}** com clock dessincronizado\n`;
report += `- **${filaAlta.length}** com fila de imagens acumulada (>1GB)\n\n`;

report += `### Top problemas a resolver\n\n`;
report += `| Prioridade | Problema | Qtd | Ação |\n`;
report += `|-----------|---------|-----|------|\n`;
if (profileDesvios.length > 0) {
  report += `| 🔴 CRÍTICA | Noturno upper profile errado (trava P&B) | ${profileDesvios.length} | Corrigir para 0 |\n`;
}
if (transDesvios.length > 0) {
  report += `| 🟠 ALTA | Transições com horário (risco P&B) | ${transDesvios.length} | Zerar horários |\n`;
}
report += `| 🟠 ALTA | VARCO desabilitado | ${offline.length} | Habilitar remotamente |\n`;
report += `| 🟡 MÉDIA | Clock instável (NTP/GPS) | ${instavel.length} | Reconfigurar NTP |\n`;
report += `| 🟡 MÉDIA | Storage >1GB (fila) | ${filaAlta.length} | Investigar envio |\n`;
if (gainDesvios.length > 0) {
  report += `| 🔵 BAIXA | Exposição diferente do padrão | ${gainDesvios.length} | Padronizar gain/shutter |\n`;
}
if (ocrDesvios.length > 0) {
  report += `| 🔵 BAIXA | OCR parametrizado diferente | ${ocrDesvios.length} | Avaliar se intencional |\n`;
}

report += `\n---\n*Gerado automaticamente — Axion Intelligence Hub — 03/06/2026*\n`;

// Salvar
fs.writeFileSync('./auditoria-itscam/ANALISE-COMPLETA-72-EQUIPAMENTOS.md', report);
console.log('\nRelatório salvo: auditoria-itscam/ANALISE-COMPLETA-72-EQUIPAMENTOS.md');
console.log(`\nResumo rápido:`);
console.log(`  Em conformidade: ${emConformidade.length}/${equipamentos.length}`);
console.log(`  Com desvios: ${equipDesviados.length}`);
console.log(`  Offline: ${offline.length}`);
console.log(`  Instáveis: ${instavel.length}`);
console.log(`  Fila alta: ${filaAlta.length}`);
console.log(`  Top desviado: ${equipDesviados[0]?.equip} (${equipDesviados[0]?.count} desvios)`);
