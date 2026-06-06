import fs from 'fs';
import path from 'path';

const dir = './auditoria-itscam/resultados';
const files = fs.readdirSync(dir).filter(f => f.startsWith('GOEC6O') && f.endsWith('.json'));
const results = [];

for (const file of files) {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    const name = data._device?.name || file;
    const ip = data._device?.ip || '';
    const uuid = data._device?.uuid || '';
    const tunnelUrl = data._tunnelUrl || '';
    
    // Volatile data - uptime
    const volatile = data.menus?.['01-ESTADO-ATUAL']?.['/api/equipment/misc/readonly/volatile']?.data;
    const lastRun = volatile?.ae?.lastRun || 0;
    const uptimeHours = (lastRun / 3600000).toFixed(1);
    
    // REST API Client presets
    const presets = data.menus?.['04-EQUIPAMENTO/04f-SERVIDORES']?.['/api/equipment/servers/restapiclient/presets']?.data;
    
    let pumaHost = '', pumaPath = '', pumaEnabled = false, pumaTimeout = 0, pumaRetries = 0;
    let compatHost = '', compatPath = '', compatEnabled = false;
    let heliosHost = '', heliosEnabled = false;
    let rfbHost = '', rfbEnabled = false;
    let otherPresets = [];
    
    if (presets) {
      if (presets.pumatronix) {
        pumaEnabled = presets.pumatronix.enabled;
        pumaHost = presets.pumatronix.url?.host || '';
        pumaPath = presets.pumatronix.url?.path || '';
        pumaTimeout = presets.pumatronix.timeout || 0;
        pumaRetries = presets.pumatronix.retries || 0;
      }
      if (presets.pumatronixCompat_v1_7_6) {
        compatEnabled = presets.pumatronixCompat_v1_7_6.enabled;
        compatHost = presets.pumatronixCompat_v1_7_6.url?.host || '';
        compatPath = presets.pumatronixCompat_v1_7_6.url?.path || '';
      }
      if (presets.helios) {
        heliosEnabled = presets.helios.enabled;
        heliosHost = presets.helios.url?.host || '';
      }
      if (presets.RFB) {
        rfbEnabled = presets.RFB.enabled;
        rfbHost = presets.RFB.url?.host || '';
      }
      // Check for any other presets with actual hosts
      for (const key of Object.keys(presets)) {
        if (!['pumatronix','pumatronixCompat_v1_7_6','helios','RFB'].includes(key)) {
          otherPresets.push({ name: key, enabled: presets[key].enabled, host: presets[key].url?.host || '', path: presets[key].url?.path || '' });
        }
      }
    }
    
    // FTP
    const ftpData = data.menus?.['04-EQUIPAMENTO/04f-SERVIDORES']?.['/api/equipment/servers/ftp']?.data;
    const ftpEnabled = ftpData?.ftp?.enable || false;
    const ftpAddress = ftpData?.ftp?.address || '';
    
    // ITScam Pro
    const itscamPro = data.menus?.['04-EQUIPAMENTO/04f-SERVIDORES']?.['/api/equipment/servers/itscampro']?.data;
    const itscamProEnabled = itscamPro?.itscampro?.enable || false;
    const itscamProStatus = itscamPro?.itscampro?.status || '';
    
    // VARCO
    const varco = data.menus?.['05-SISTEMA/05c-MANUTENCAO']?.['/api/system/maintenance/remoteaccess']?.data;
    const varcoEnabled = varco?.remoteAccess?.varco?.enabled || false;
    const varcoDevice = varco?.remoteAccess?.varco?.deviceName || '';
    
    // Storage
    const storage = data.menus?.['01-ESTADO-ATUAL']?.['/api/system/maintenance/storage/usage']?.data;
    const storageUsed = storage?.disk?.used || 0;
    const storageTotal = storage?.disk?.total || 0;
    
    results.push({
      name, ip, uuid, uptimeHours, lastRun,
      pumaEnabled, pumaHost, pumaPath, pumaTimeout, pumaRetries,
      compatEnabled, compatHost, compatPath,
      heliosEnabled, heliosHost,
      rfbEnabled, rfbHost,
      otherPresets,
      ftpEnabled, ftpAddress,
      itscamProEnabled, itscamProStatus,
      varcoEnabled, varcoDevice,
      storageUsedMB: Math.round(storageUsed / 1048576),
      storageTotalMB: Math.round(storageTotal / 1048576)
    });
  } catch(e) {
    console.error('Error parsing ' + file + ': ' + e.message);
  }
}

// Sort by name
results.sort((a,b) => a.name.localeCompare(b.name));

// Save full analysis
fs.writeFileSync('./auditoria-itscam/resultados/_ANALISE_ENVIOS.json', JSON.stringify(results, null, 2));

console.log('=== ANALISE DE ENVIO DE IMAGENS - TODOS OS EQUIPAMENTOS ===\n');
console.log('Total equipamentos analisados: ' + results.length);
console.log('');

// Categorize
const withPumaHost = results.filter(r => r.pumaHost !== '');
const withCompatHost = results.filter(r => r.compatHost !== '');
const withAnyRestHost = results.filter(r => r.pumaHost !== '' || r.compatHost !== '' || r.otherPresets.some(p => p.host !== ''));
const withoutAnyHost = results.filter(r => r.pumaHost === '' && r.compatHost === '' && !r.otherPresets.some(p => p.host !== '' && p.enabled));

console.log('--- CATEGORIAS ---');
console.log('Com host pumatronix configurado: ' + withPumaHost.length);
console.log('Com host pumatronixCompat configurado: ' + withCompatHost.length);
console.log('Com QUALQUER REST host configurado: ' + withAnyRestHost.length);
console.log('SEM nenhum host REST para envio direto: ' + withoutAnyHost.length);
console.log('');

// FTP analysis
const ftpActive = results.filter(r => r.ftpEnabled);
console.log('FTP habilitado: ' + ftpActive.length);
if (ftpActive.length > 0) {
  ftpActive.forEach(r => console.log('  ' + r.name + ' -> ' + r.ftpAddress));
}

// ITScam Pro analysis
const itscamActive = results.filter(r => r.itscamProEnabled);
console.log('ITScam Pro habilitado: ' + itscamActive.length);

// VARCO analysis
const varcoActive = results.filter(r => r.varcoEnabled);
console.log('VARCO Tunnel ativo: ' + varcoActive.length + '/' + results.length);
console.log('');

// Helios/RFB
const heliosActive = results.filter(r => r.heliosEnabled && r.heliosHost !== '');
const rfbActive = results.filter(r => r.rfbEnabled && r.rfbHost !== '');
console.log('Helios (PM-MG) configurado: ' + heliosActive.length);
console.log('RFB (Receita Federal) configurado: ' + rfbActive.length);
console.log('');

// Other presets with hosts
const withOtherHosts = results.filter(r => r.otherPresets.some(p => p.host !== ''));
if (withOtherHosts.length > 0) {
  console.log('--- EQUIPAMENTOS COM PRESETS EXTRAS (host configurado) ---');
  withOtherHosts.forEach(r => {
    const extras = r.otherPresets.filter(p => p.host !== '');
    extras.forEach(p => console.log('  ' + r.name + ' | preset=' + p.name + ' | host=' + p.host + p.path + ' | enabled=' + p.enabled));
  });
  console.log('');
}

// Uptime analysis
console.log('--- UPTIME (ÚLTIMAS REINICIALIZAÇÕES) ---');
const sorted = [...results].sort((a,b) => a.lastRun - b.lastRun);
console.log('Equipamentos com MENOR uptime (reiniciaram recentemente):');
sorted.slice(0,10).forEach(r => {
  const days = (r.lastRun / 86400000).toFixed(2);
  console.log('  ' + r.name.padEnd(25) + ' | uptime=' + r.uptimeHours + 'h (' + days + ' dias)');
});
console.log('');
console.log('Equipamentos com MAIOR uptime (mais estáveis):');
sorted.slice(-5).forEach(r => {
  const days = (r.lastRun / 86400000).toFixed(2);
  console.log('  ' + r.name.padEnd(25) + ' | uptime=' + r.uptimeHours + 'h (' + days + ' dias)');
});

// DE-PARA: Key insight
console.log('\n\n=== DE-PARA: O QUE FAZ FUNCIONAR vs O QUE NÃO FUNCIONA ===\n');
console.log('TODOS os ' + results.length + ' equipamentos possuem:');
console.log('  - pumatronix preset ENABLED = ' + results.filter(r => r.pumaEnabled).length + '/' + results.length);
console.log('  - pumatronix host VAZIO = ' + results.filter(r => r.pumaHost === '').length + '/' + results.length);
console.log('  - pumatronixCompat preset ENABLED = ' + results.filter(r => r.compatEnabled).length + '/' + results.length);
console.log('  - pumatronixCompat host VAZIO = ' + results.filter(r => r.compatHost === '').length + '/' + results.length);
console.log('  - FTP DESABILITADO = ' + results.filter(r => !r.ftpEnabled).length + '/' + results.length);
console.log('  - ITScam Pro DESABILITADO = ' + results.filter(r => !r.itscamProEnabled).length + '/' + results.length);
console.log('  - VARCO Tunnel ATIVO = ' + varcoActive.length + '/' + results.length);
console.log('');
console.log('CONCLUSÃO: O envio direto via REST API Client (pumatronix preset) NÃO ESTÁ');
console.log('CONFIGURADO em NENHUM equipamento. O único canal possível é via VARCO Cloud.');
