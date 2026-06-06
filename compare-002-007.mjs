import fs from 'fs';
const dir = './auditoria-itscam/resultados';
const files = ['GOEC6O002_-_Faixa_1.json', 'GOEC6O007_-_Faixa_1.json', 'GOEC6O022_-_Faixa_1.json'];
const data = files.map(f => JSON.parse(fs.readFileSync(dir + '/' + f, 'utf8')));

console.log('=== COMPARACAO 002 (FUNCIONA) vs 007/022 (NAO FUNCIONA) ===\n');

// Basic info
console.log('--- INFO BASICA ---');
data.forEach(d => {
  const v = d.menus['01-ESTADO-ATUAL']['/api/equipment/misc/readonly/volatile'].data;
  const s = d.menus['01-ESTADO-ATUAL']['/api/system/maintenance/storage/usage'].data;
  console.log(`${d._device.name} | IP=${d._device.ip} | uptime=${(v.ae.lastRun/3600000).toFixed(1)}h | storage=${Math.round(s.disk.used/1048576)}MB`);
});

// REST presets
console.log('\n--- REST PRESETS ---');
data.forEach(d => {
  const p = d.menus['04-EQUIPAMENTO/04f-SERVIDORES']['/api/equipment/servers/restapiclient/presets'].data;
  console.log(`\n${d._device.name}:`);
  for (const [name, pr] of Object.entries(p)) {
    console.log(`  ${name}: enabled=${pr.enabled} host="${pr.url?.host || ''}" path="${pr.url?.path || ''}" scheme=${pr.url?.scheme || ''}`);
  }
});

// FTP, ITScam Pro, Lince
console.log('\n--- SERVIDORES ---');
data.forEach(d => {
  const f = d.menus['04-EQUIPAMENTO/04f-SERVIDORES']['/api/equipment/servers/ftp'].data;
  const i = d.menus['04-EQUIPAMENTO/04f-SERVIDORES']['/api/equipment/servers/itscampro'].data;
  const l = d.menus['04-EQUIPAMENTO/04f-SERVIDORES']['/api/equipment/servers/lince'].data;
  console.log(`${d._device.name} | FTP=${f.ftp.enable} | ITScamPro=${i.itscampro.enable}(${i.itscampro.status}) | Lince=${l.lince.enabled}`);
});

// VARCO
console.log('\n--- VARCO ---');
data.forEach(d => {
  const v = d.menus['05-SISTEMA/05c-MANUTENCAO']['/api/system/maintenance/remoteaccess'].data;
  console.log(`${d._device.name} | varco=${v.remoteAccess.varco.enabled} | device="${v.remoteAccess.varco.deviceName}"`);
});

// Network
console.log('\n--- REDE ---');
data.forEach(d => {
  const net = d.menus['05-SISTEMA/05b-REDE']['/api/equipment/network'].data;
  console.log(`${d._device.name} | local=${net.ethernet.ipv4Primary.address} | gw=${net.ethernet.ipv4Primary.gateway} | dns=${net.ethernet.ipv4Primary.dns}`);
});

// Deep diff - check ALL keys at top level to find ANY difference
console.log('\n\n--- DEEP DIFF: Buscando QUALQUER diferença entre 002 e 007 ---');
const menus002 = Object.keys(data[0].menus);
const menus007 = Object.keys(data[1].menus);

// Check if 002 has different menus
const only002 = menus002.filter(m => !menus007.includes(m));
const only007 = menus007.filter(m => !menus002.includes(m));
if (only002.length) console.log('Menus APENAS no 002:', only002);
if (only007.length) console.log('Menus APENAS no 007:', only007);

// For each menu, check endpoints
for (const menu of menus002) {
  if (!data[1].menus[menu]) continue;
  const endpoints002 = Object.keys(data[0].menus[menu]);
  const endpoints007 = Object.keys(data[1].menus[menu]);
  
  const onlyIn002 = endpoints002.filter(e => !endpoints007.includes(e));
  const onlyIn007 = endpoints007.filter(e => !endpoints002.includes(e));
  
  if (onlyIn002.length) console.log(`[${menu}] Endpoints APENAS no 002:`, onlyIn002);
  if (onlyIn007.length) console.log(`[${menu}] Endpoints APENAS no 007:`, onlyIn007);
}

// Compare JSON stringify of key fields
console.log('\n--- COMPARACAO CAMPO A CAMPO (DIFERENCAS APENAS) ---');
for (const menu of menus002) {
  if (!data[1].menus[menu]) continue;
  for (const endpoint of Object.keys(data[0].menus[menu])) {
    if (!data[1].menus[menu][endpoint]) continue;
    const json002 = JSON.stringify(data[0].menus[menu][endpoint].data);
    const json007 = JSON.stringify(data[1].menus[menu][endpoint].data);
    if (json002 !== json007) {
      // Found a difference! Show it
      const d002 = data[0].menus[menu][endpoint].data;
      const d007 = data[1].menus[menu][endpoint].data;
      
      // Shallow diff
      const allKeys = new Set([...Object.keys(d002 || {}), ...Object.keys(d007 || {})]);
      for (const key of allKeys) {
        const v002 = JSON.stringify(d002?.[key]);
        const v007 = JSON.stringify(d007?.[key]);
        if (v002 !== v007) {
          // Only show meaningful diffs (not volatile data like lastRun, fps, etc)
          if (endpoint.includes('volatile') || endpoint.includes('storage')) continue;
          console.log(`DIFF [${endpoint}] .${key}:`);
          console.log(`  002: ${v002?.substring(0, 200)}`);
          console.log(`  007: ${v007?.substring(0, 200)}`);
        }
      }
    }
  }
}
