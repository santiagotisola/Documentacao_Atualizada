import { readFileSync } from 'fs';

const f1 = JSON.parse(readFileSync('auditoria-itscam/resultados/GOEC6O007_-_Faixa_1.json','utf8'));
const f2 = JSON.parse(readFileSync('auditoria-itscam/resultados/GOEC6O007_-_Faixa_2.json','utf8'));

console.log('=== GOEC6O007 - Faixa 1 (SEM IMAGEM) vs Faixa 2 (COM IMAGEM) ===\n');
console.log('UUID Faixa 1:', f1._device.uuid);
console.log('UUID Faixa 2:', f2._device.uuid);
console.log('IP Faixa 1:', f1._device.ip);
console.log('IP Faixa 2:', f2._device.ip);
console.log('MAC Faixa 1:', f1.menus['01-ESTADO-ATUAL']['/api/equipment/info'].data.macAddress);
console.log('MAC Faixa 2:', f2.menus['01-ESTADO-ATUAL']['/api/equipment/info'].data.macAddress);
console.log('');

// REST presets
const p1 = f1.menus['04-EQUIPAMENTO/04f-SERVIDORES']['/api/equipment/servers/restapiclient/presets'].data;
const p2 = f2.menus['04-EQUIPAMENTO/04f-SERVIDORES']['/api/equipment/servers/restapiclient/presets'].data;

console.log('--- REST PRESETS ---');
for (const key of Object.keys(p1)) {
  const h1 = p1[key]?.url?.host || '';
  const h2 = p2[key]?.url?.host || '';
  const e1 = p1[key]?.enabled;
  const e2 = p2[key]?.enabled;
  const diff = (h1 !== h2 || e1 !== e2) ? ' *** DIFERENTE ***' : '';
  console.log(`  ${key}:`);
  console.log(`    F1: enabled=${e1} host="${h1}"`);
  console.log(`    F2: enabled=${e2} host="${h2}"${diff}`);
}

// VARCO - paths podem variar entre coletas
const varcoMenu1 = f1.menus['05-SISTEMA/05d-ACESSO-REMOTO'] || f1.menus['05-SISTEMA/05c-MANUTENCAO'];
const varcoMenu2 = f2.menus['05-SISTEMA/05d-ACESSO-REMOTO'] || f2.menus['05-SISTEMA/05c-MANUTENCAO'];
const varcoData1 = varcoMenu1?.['/api/system/maintenance/remoteaccess']?.data?.remoteAccess?.varco;
const varcoData2 = varcoMenu2?.['/api/system/maintenance/remoteaccess']?.data?.remoteAccess?.varco;
const v1 = varcoData1 || {};
const v2 = varcoData2 || {};
console.log('\n--- VARCO ---');
console.log(`  F1: enabled=${v1.enabled} device="${v1.deviceName}"`);
console.log(`  F2: enabled=${v2.enabled} device="${v2.deviceName}"`);
console.log(`  ProvisionKey igual? ${v1.provisionKey === v2.provisionKey}`);
console.log(`  EdgeServer igual? ${v1.edgeServer === v2.edgeServer}`);

// Uptime
const u1 = f1.menus['01-ESTADO-ATUAL']['/api/system/uptime']?.data;
const u2 = f2.menus['01-ESTADO-ATUAL']['/api/system/uptime']?.data;
console.log('\n--- UPTIME ---');
console.log(`  F1: ${u1 ? (u1.uptime/3600).toFixed(1) + 'h' : 'N/A'}`);
console.log(`  F2: ${u2 ? (u2.uptime/3600).toFixed(1) + 'h' : 'N/A'}`);

// Rede
const n1 = (f1.menus['03-REDE'] || f1.menus['05-SISTEMA/05b-REDE'])?.['/api/network/address']?.data;
const n2 = (f2.menus['03-REDE'] || f2.menus['05-SISTEMA/05b-REDE'])?.['/api/network/address']?.data;
console.log('\n--- REDE ---');
console.log(`  F1: ip=${n1?.staticAddress} gw=${n1?.gateway} dns=${n1?.dns}`);
console.log(`  F2: ip=${n2?.staticAddress} gw=${n2?.gateway} dns=${n2?.dns}`);

// Servers (FTP, ITScamPro, Lince)
const srv1 = f1.menus['04-EQUIPAMENTO/04f-SERVIDORES'];
const srv2 = f2.menus['04-EQUIPAMENTO/04f-SERVIDORES'];

const ftp1 = srv1['/api/equipment/servers/ftp']?.data;
const ftp2 = srv2['/api/equipment/servers/ftp']?.data;
const its1 = srv1['/api/equipment/servers/itscampro']?.data;
const its2 = srv2['/api/equipment/servers/itscampro']?.data;

console.log('\n--- SERVIDORES ---');
console.log(`  FTP F1: enabled=${ftp1?.enabled}`);
console.log(`  FTP F2: enabled=${ftp2?.enabled}`);
console.log(`  ITScamPro F1: enabled=${its1?.enabled} status=${its1?.status}`);
console.log(`  ITScamPro F2: enabled=${its2?.enabled} status=${its2?.status}`);

// Storage
const st1 = f1.menus['01-ESTADO-ATUAL']['/api/system/storage']?.data;
const st2 = f2.menus['01-ESTADO-ATUAL']['/api/system/storage']?.data;
console.log('\n--- STORAGE ---');
if (st1) console.log(`  F1: ${(st1.available/1024/1024).toFixed(0)}MB disponivel`);
if (st2) console.log(`  F2: ${(st2.available/1024/1024).toFixed(0)}MB disponivel`);

// Deep diff - comparar TODOS os campos procurando a diferença real
console.log('\n\n=== DEEP DIFF: Todas diferenças relevantes ===\n');

function flatten(obj, prefix = '') {
  const result = {};
  for (const [k, v] of Object.entries(obj || {})) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(result, flatten(v, path));
    } else {
      result[path] = JSON.stringify(v);
    }
  }
  return result;
}

// Ignorar campos que sabemos que são diferentes (hardware)
const ignore = ['macAddress', 'serialNumber', 'equipmentName', 'deviceName', 'currentDateAndTime', 'lastLoggedIn', 'deviceId', 'serial'];

const flat1 = flatten(f1.menus);
const flat2 = flatten(f2.menus);

let diffs = 0;
for (const key of Object.keys(flat1)) {
  if (flat2[key] !== undefined && flat1[key] !== flat2[key]) {
    // Skip hardware-specific
    if (ignore.some(i => key.includes(i))) continue;
    if (key.includes('boards')) continue;
    if (key.includes('licenses')) continue;
    if (key.includes('ocr')) continue;
    if (key.includes('image/profiles')) continue;
    if (key.includes('snapshotCrop')) continue;
    
    diffs++;
    if (diffs <= 30) {
      console.log(`DIFF [${key}]`);
      console.log(`  F1: ${flat1[key].substring(0, 100)}`);
      console.log(`  F2: ${flat2[key].substring(0, 100)}`);
      console.log('');
    }
  }
}
console.log(`\nTotal diferenças (excl. hardware): ${diffs}`);
