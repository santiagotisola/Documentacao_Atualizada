/**
 * ══════════════════════════════════════════════════════════════
 * ANÁLISE COMPLETA DE CONFIGURAÇÃO — TODOS os 72 Dispositivos
 * ══════════════════════════════════════════════════════════════
 * 
 * Conecta em TODOS os dispositivos via VARCO tunnel, coleta
 * configurações completas, e gera relatório comparativo.
 * 
 * Agrupa equipamentos com configurações idênticas e mostra
 * os "de-para" (diferenças) de cada grupo vs referência.
 * 
 * USO:
 *   node auditoria-itscam/analise-varco-completa.mjs
 *   node auditoria-itscam/analise-varco-completa.mjs --offline  (usa dados já coletados)
 * 
 * SAÍDA:
 *   auditoria-itscam/RELATORIO-VARCO-COMPLETO.md
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const TUNNEL_BASE = 'https://{UUID}-80.tunnel.varco.cloud';
const CREDENTIALS = { username: 'admin', password: '#econocr@' };
const TIMEOUT_MS = 20000;
const INVENTORY_FILE = './auditoria-itscam/devices-inventory.json';
const RESULTS_DIR = './auditoria-itscam/resultados';
const USE_OFFLINE = process.argv.includes('--offline');

// Endpoints a coletar para análise completa
const ENDPOINTS = [
  { id: 'varco', path: '/api/system/maintenance/remoteaccess', label: 'VARCO / Acesso Remoto' },
  { id: 'profiles', path: '/api/image/profiles', label: 'Perfis de Imagem (Transições)' },
  { id: 'ocr', path: '/api/equipment/ocr', label: 'OCR' },
  { id: 'classifier', path: '/api/equipment/classifier', label: 'Classificador' },
  { id: 'misc', path: '/api/equipment/misc', label: 'Diversos (Snapshot Crop)' },
  { id: 'network', path: '/api/equipment/network/ethernet', label: 'Rede/Ethernet' },
  { id: 'servers', path: '/api/equipment/servers/ftp', label: 'Servidores FTP' },
  { id: 'lince', path: '/api/equipment/servers/lince', label: 'Servidores Lince' },
  { id: 'itscampro', path: '/api/equipment/servers/itscampro', label: 'Servidores ITScamPro' },
  { id: 'ioPorts', path: '/api/equipment/ioPorts', label: 'Portas IO' },
  { id: 'snmp', path: '/api/system/monitoring/snmp', label: 'SNMP' },
  { id: 'reboot', path: '/api/system/maintenance/automaticreboot', label: 'Reboot Automático' },
  { id: 'info', path: '/api/equipment/info', label: 'Info Hardware' },
  { id: 'firmware', path: '/api/system/firmware', label: 'Firmware' },
  { id: 'storage', path: '/api/system/maintenance/storage/usage', label: 'Storage' },
  { id: 'dateTime', path: '/api/equipment/dateAndTime', label: 'Data/Hora/NTP' },
  { id: 'lanes', path: '/api/equipment/lanes', label: 'Faixas' },
  { id: 'video', path: '/api/video/streams', label: 'Vídeo/Streams' },
];

// ═══════════════════════════════════════════════════════════════
// FUNÇÕES DE REDE
// ═══════════════════════════════════════════════════════════════

async function autenticar(baseUrl) {
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    const res = await fetch(`${baseUrl}/api/auth`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ params: CREDENTIALS }), signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.token || null;
  } catch { return null; }
}

async function ler(baseUrl, token, path) {
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    const res = await fetch(`${baseUrl}${path}`, {
      headers: { 'Authorization': `Bearer ${token}` }, signal: ctrl.signal,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

// ═══════════════════════════════════════════════════════════════
// COLETA OFFLINE (dados já salvos)
// ═══════════════════════════════════════════════════════════════

function carregarDadosOffline() {
  const devices = [];
  const files = readdirSync(RESULTS_DIR).filter(f => f.endsWith('.json') && !f.startsWith('_') && !f.startsWith('PLANILHA'));
  
  for (const file of files) {
    try {
      const data = JSON.parse(readFileSync(join(RESULTS_DIR, file), 'utf8'));
      const deviceInfo = data._device || {};
      const nome = typeof deviceInfo === 'string' ? deviceInfo : deviceInfo.name || file.replace('.json', '').replace(/_/g, ' ');
      const menus = data.menus || {};
      
      // Extrair dados relevantes de cada seção
      // A estrutura é: menus[seção][endpoint] = { nome, data }
      // O campo 'data' contém os valores reais
      const getVal = (section, endpoint) => {
        const entry = menus[section]?.[endpoint];
        if (!entry) return null;
        return entry.data !== undefined ? entry.data : entry;
      };
      
      const device = { nome, raw: {} };
      
      // VARCO
      device.raw.varco = getVal('05-SISTEMA/05c-MANUTENCAO', '/api/system/maintenance/remoteaccess');
      device.raw.reboot = getVal('05-SISTEMA/05c-MANUTENCAO', '/api/system/maintenance/automaticreboot');
      
      // Profiles
      device.raw.profiles = getVal('02-IMAGEM', '/api/image/profiles');
      
      // OCR
      device.raw.ocr = getVal('04-EQUIPAMENTO/04a-OCR', '/api/equipment/ocr');
      
      // Classificador
      device.raw.classifier = getVal('04-EQUIPAMENTO/04b-CLASSIFICADOR', '/api/equipment/classifier');
      
      // Misc
      device.raw.misc = getVal('04-EQUIPAMENTO/04i-DIVERSOS', '/api/equipment/misc');
      
      // Network
      device.raw.network = getVal('05-SISTEMA/05b-REDE', '/api/equipment/network/ethernet');
      
      // Servidores
      device.raw.ftp = getVal('04-EQUIPAMENTO/04f-SERVIDORES', '/api/equipment/servers/ftp');
      device.raw.lince = getVal('04-EQUIPAMENTO/04f-SERVIDORES', '/api/equipment/servers/lince');
      device.raw.itscampro = getVal('04-EQUIPAMENTO/04f-SERVIDORES', '/api/equipment/servers/itscampro');
      device.raw.restPresets = getVal('04-EQUIPAMENTO/04f-SERVIDORES', '/api/equipment/servers/restPresets');
      
      // IO Ports
      device.raw.ioPorts = getVal('04-EQUIPAMENTO/04h-PORTAS-IO', '/api/equipment/ioPorts');
      
      // SNMP
      device.raw.snmp = getVal('05-SISTEMA/05d-MONITORAMENTO', '/api/system/monitoring/snmp');
      
      // Info
      device.raw.info = getVal('01-ESTADO-ATUAL', '/api/equipment/info');
      device.raw.firmware = getVal('01-ESTADO-ATUAL', '/api/system/firmware');
      device.raw.storage = getVal('01-ESTADO-ATUAL', '/api/system/maintenance/storage/usage');
      
      // DateTime
      device.raw.dateTime = getVal('05-SISTEMA/05a-GERAL', '/api/equipment/dateAndTime');
      
      // Video
      device.raw.video = getVal('03-VIDEO', '/api/video/streams');
      
      // Lanes
      device.raw.lanes = getVal('04-EQUIPAMENTO/04c-FAIXAS', '/api/equipment/lanes');
      
      devices.push(device);
    } catch (e) {
      // skip invalid files
    }
  }
  
  return devices;
}

// ═══════════════════════════════════════════════════════════════
// COLETA ONLINE (acesso ao vivo via tunnel)
// ═══════════════════════════════════════════════════════════════

async function coletarOnline() {
  const inventory = JSON.parse(readFileSync(INVENTORY_FILE, 'utf8'));
  const devices = [];
  
  console.log(`\n  Coletando configuração de ${inventory.length} dispositivos...\n`);
  
  for (let i = 0; i < inventory.length; i++) {
    const inv = inventory[i];
    process.stdout.write(`  [${String(i+1).padStart(2)}/${inventory.length}] ${inv.name.padEnd(25)}`);
    
    const baseUrl = TUNNEL_BASE.replace('{UUID}', inv.uuid);
    const token = await autenticar(baseUrl);
    
    if (!token) {
      console.log('❌ OFFLINE');
      devices.push({ nome: inv.name, raw: null, status: 'offline' });
      continue;
    }
    
    const device = { nome: inv.name, uuid: inv.uuid, ip: inv.ip, raw: {}, status: 'online' };
    
    for (const ep of ENDPOINTS) {
      device.raw[ep.id] = await ler(baseUrl, token, ep.path);
    }
    
    console.log('✅');
    devices.push(device);
    
    // Delay para não sobrecarregar
    await new Promise(r => setTimeout(r, 500));
  }
  
  return devices;
}

// ═══════════════════════════════════════════════════════════════
// EXTRAÇÃO DE PARÂMETROS COMPARÁVEIS
// ═══════════════════════════════════════════════════════════════

function extrairParametros(device) {
  const raw = device.raw;
  if (!raw) return null;
  
  const params = {};
  
  // ─── VARCO ───
  const varco = raw.varco?.remoteAccess?.varco || raw.varco?.varco || raw.varco || {};
  params['VARCO.enabled'] = varco.enabled ?? null;
  params['VARCO.edgeServer'] = varco.edgeServer ?? null;
  
  // ─── PERFIS / TRANSIÇÕES ───
  const profiles = Array.isArray(raw.profiles) ? raw.profiles : raw.profiles?.profiles || [];
  for (let i = 0; i < 2; i++) {
    const nome = i === 0 ? 'Diurno' : 'Noturno';
    const t = profiles[i]?.transitions || {};
    params[`${nome}.lower.startTime`] = t.lower?.startTime ?? null;
    params[`${nome}.lower.endTime`] = t.lower?.endTime ?? null;
    params[`${nome}.lower.level`] = t.lower?.level ?? null;
    params[`${nome}.lower.holdTime`] = t.lower?.holdTime ?? null;
    params[`${nome}.upper.startTime`] = t.upper?.startTime ?? null;
    params[`${nome}.upper.endTime`] = t.upper?.endTime ?? null;
    params[`${nome}.upper.level`] = t.upper?.level ?? null;
    params[`${nome}.upper.holdTime`] = t.upper?.holdTime ?? null;
    params[`${nome}.upper.profile`] = t.upper?.profile ?? null;
  }
  
  // ─── OCR ───
  const ocr = raw.ocr?.ocr || raw.ocr || {};
  params['OCR.enabled'] = ocr.enabled ?? null;
  params['OCR.countryCode'] = ocr.countryCode ?? null;
  params['OCR.maxPlates'] = ocr.maxPlates ?? null;
  params['OCR.lowProbChar'] = ocr.lowProbChar ?? null;
  params['OCR.maxLowProbChars'] = ocr.maxLowProbChars ?? null;
  params['OCR.processingQueue'] = ocr.processingQueue ?? null;
  params['OCR.processingThreads'] = ocr.processingThreads ?? null;
  params['OCR.processingMode'] = ocr.processingMode ?? null;
  params['OCR.vehicleType'] = ocr.vehicleType ?? null;
  
  // ─── CLASSIFICADOR ───
  const cls = raw.classifier?.classifier || raw.classifier || {};
  params['Classificador.enabled'] = cls.enabled ?? null;
  params['Classificador.processingQueue'] = cls.processingQueue ?? null;
  params['Classificador.processingThreads'] = cls.processingThreads ?? null;
  params['Classificador.sceneType'] = cls.sceneType ?? null;
  params['Classificador.minProbability'] = cls.minProbability ?? null;
  
  // ─── MISC / SNAPSHOT CROP ───
  const misc = raw.misc || {};
  params['SnapshotCrop.enable'] = misc.snapshotCrop?.enable ?? null;
  params['SnapshotCrop.mode'] = misc.snapshotCrop?.mode ?? null;
  
  // ─── REDE ───
  const net = raw.network || {};
  params['Rede.gateway'] = net.ipv4Primary?.gateway ?? net.gateway ?? null;
  params['Rede.dns'] = net.ipv4Primary?.dns ?? net.dns ?? null;
  params['Rede.dhcp'] = net.ipv4Primary?.dhcp ?? null;
  
  // ─── SERVIDORES ───
  const ftp = raw.ftp || {};
  params['FTP.enable'] = ftp.enable ?? ftp.ftp?.enable ?? null;
  
  const lince = raw.lince || {};
  params['Lince.enabled'] = lince.enabled ?? null;
  
  const itscampro = raw.itscampro || {};
  params['ITScamPro.enable'] = itscampro.enable ?? null;
  
  // ─── IO PORTS ───
  const io = Array.isArray(raw.ioPorts) ? raw.ioPorts : raw.ioPorts?.outputs || [];
  if (io.length >= 1) {
    params['IO.port1.earlyUs'] = io[0]?.earlyUs ?? null;
    params['IO.port1.isReserved'] = io[0]?.isReserved ?? null;
  }
  if (io.length >= 3) {
    params['IO.port3.earlyUs'] = io[2]?.earlyUs ?? null;
    params['IO.port3.isReserved'] = io[2]?.isReserved ?? null;
  }
  
  // ─── SNMP ───
  const snmp = raw.snmp || {};
  params['SNMP.enabled'] = snmp.enabled ?? null;
  
  // ─── REBOOT AUTO ───
  const reb = raw.reboot || {};
  params['Reboot.scheduled.enabled'] = reb.scheduled?.enabled ?? null;
  params['Reboot.periodic.enabled'] = reb.periodic?.enabled ?? null;
  
  // ─── DATE/TIME ───
  const dt = raw.dateTime || {};
  params['NTP.server'] = dt.ntpServerAddress?.[0] ?? dt.ntpServer ?? null;
  params['Timezone'] = Array.isArray(dt.timezone) ? dt.timezone.join('/') : dt.timezone ?? null;
  
  // ─── VIDEO ───
  const video = raw.video || {};
  const mjpeg = video.mjpeg?.main || {};
  params['Video.framerate'] = mjpeg.framerate ?? null;
  params['Video.quality'] = mjpeg.quality ?? null;
  params['Video.useTriggerFrames'] = mjpeg.useTriggerFrames ?? null;
  
  // ─── FIRMWARE ───
  const fw = raw.firmware || raw.info || {};
  params['Firmware.version'] = fw.version || fw.firmwareVersion || null;
  
  return params;
}

// ═══════════════════════════════════════════════════════════════
// ANÁLISE COMPARATIVA
// ═══════════════════════════════════════════════════════════════

function analisar(devices) {
  // 1. Extrair parâmetros de todos
  const todosParams = [];
  for (const dev of devices) {
    const params = extrairParametros(dev);
    todosParams.push({ nome: dev.nome, status: dev.status || (params ? 'online' : 'offline'), params });
  }
  
  // 2. Identificar referência
  const ref = todosParams.find(d => d.nome.includes('GOEC6O045') && d.nome.includes('Faixa 1'));
  if (!ref || !ref.params) {
    console.log('  ⚠️ Referência GOEC6O045-F1 não encontrada nos dados!');
    return null;
  }
  
  // 3. Calcular divergências de cada dispositivo vs referência
  const resultados = [];
  for (const dev of todosParams) {
    if (!dev.params) {
      resultados.push({ ...dev, divergencias: [], totalDiv: -1 });
      continue;
    }
    
    const divs = [];
    for (const [campo, valorRef] of Object.entries(ref.params)) {
      const valorDev = dev.params[campo];
      // Ignorar campos que são específicos de cada device
      if (campo === 'VARCO.edgeServer' && valorRef === valorDev) continue;
      if (campo === 'Firmware.version') continue; // firmware pode variar
      if (campo === 'Noturno.upper.profile' && valorDev !== 0 && valorDev !== null) {
        // Profile noturno: deve ser 0 (ou o ID do diurno local)
        // O importante é que NÃO seja igual ao próprio ID do noturno
        // Vamos marcar como divergente se != 0 e != valorRef
        if (valorDev !== 0 && valorDev !== valorRef) {
          divs.push({ campo, atual: valorDev, ref: valorRef, nota: 'profile ID diferente' });
        }
        continue;
      }
      if (campo === 'Diurno.upper.profile') continue; // profile diurno varia por device
      if (campo === 'Diurno.lower.profile' || campo === 'Noturno.lower.profile') continue;
      
      if (valorDev !== valorRef && valorRef !== null) {
        divs.push({ campo, atual: valorDev, ref: valorRef });
      }
    }
    
    resultados.push({ ...dev, divergencias: divs, totalDiv: divs.length });
  }
  
  // 4. Agrupar por "perfil de configuração" (mesmas divergências)
  const grupos = {};
  for (const dev of resultados) {
    if (dev.totalDiv === -1) continue; // offline
    const key = dev.divergencias.map(d => `${d.campo}=${d.atual}`).sort().join('|') || 'CONFORME';
    if (!grupos[key]) grupos[key] = { divergencias: dev.divergencias, dispositivos: [] };
    grupos[key].dispositivos.push(dev.nome);
  }
  
  return { ref, resultados, grupos, todosParams };
}

// ═══════════════════════════════════════════════════════════════
// GERAÇÃO DO RELATÓRIO
// ═══════════════════════════════════════════════════════════════

function gerarRelatorio(analise) {
  const { ref, resultados, grupos, todosParams } = analise;
  const lines = [];
  const l = (s) => lines.push(s);
  
  l('# RELATÓRIO COMPLETO — Configuração VARCO / ITScam 450 SETRANS-GO');
  l('');
  l(`**Data:** ${new Date().toISOString().split('T')[0]}`);
  l(`**Total dispositivos:** ${resultados.length}`);
  l(`**Online/coletados:** ${resultados.filter(r => r.totalDiv >= 0).length}`);
  l(`**Offline:** ${resultados.filter(r => r.totalDiv === -1).length}`);
  l(`**Referência:** ${ref.nome}`);
  l('');
  l('---');
  l('');
  
  // ═══ RESUMO EXECUTIVO ═══
  l('## 1. RESUMO EXECUTIVO');
  l('');
  
  const conformes = Object.entries(grupos).find(([k]) => k === 'CONFORME');
  const divergentes = Object.entries(grupos).filter(([k]) => k !== 'CONFORME');
  
  l(`| Categoria | Qtd | % |`);
  l(`|---|---|---|`);
  l(`| ✅ 100% Conformes (idênticos à referência) | ${conformes ? conformes[1].dispositivos.length : 0} | ${conformes ? Math.round(conformes[1].dispositivos.length / resultados.filter(r=>r.totalDiv>=0).length * 100) : 0}% |`);
  l(`| ⚠️ Com divergências | ${divergentes.reduce((a, [,g]) => a + g.dispositivos.length, 0)} | ${Math.round(divergentes.reduce((a, [,g]) => a + g.dispositivos.length, 0) / resultados.filter(r=>r.totalDiv>=0).length * 100)}% |`);
  l(`| ❌ Offline | ${resultados.filter(r => r.totalDiv === -1).length} | — |`);
  l(`| 📊 Grupos de configuração distintos | ${Object.keys(grupos).length} | — |`);
  l('');
  
  // ═══ EQUIPAMENTO REFERÊNCIA ═══
  l('## 2. CONFIGURAÇÃO REFERÊNCIA (GOEC6O045 - Faixa 1)');
  l('');
  l('Todos os valores abaixo são os **corretos**. Qualquer dispositivo com valor diferente precisa ser avaliado.');
  l('');
  l('| Seção | Parâmetro | Valor Correto |');
  l('|---|---|---|');
  
  const secoes = {};
  for (const [campo, valor] of Object.entries(ref.params)) {
    const secao = campo.split('.')[0];
    if (!secoes[secao]) secoes[secao] = [];
    secoes[secao].push({ campo, valor });
  }
  
  for (const [secao, campos] of Object.entries(secoes)) {
    for (const { campo, valor } of campos) {
      if (valor !== null) {
        l(`| ${secao} | \`${campo}\` | \`${valor}\` |`);
      }
    }
  }
  l('');
  
  // ═══ DISPOSITIVOS 100% CONFORMES ═══
  l('## 3. DISPOSITIVOS 100% CONFORMES');
  l('');
  if (conformes) {
    l(`${conformes[1].dispositivos.length} equipamentos com **ZERO divergências** — configuração idêntica à referência:`);
    l('');
    conformes[1].dispositivos.forEach((d, i) => l(`${i+1}. ${d}`));
  } else {
    l('Nenhum dispositivo 100% conforme encontrado.');
  }
  l('');
  
  // ═══ AGRUPAMENTO POR PERFIL ═══
  l('## 4. GRUPOS DE CONFIGURAÇÃO (dispositivos com mesmas divergências)');
  l('');
  l('Dispositivos agrupados por **padrão idêntico de configuração**. Cada grupo tem exatamente os mesmos campos divergentes com os mesmos valores.');
  l('');
  
  let grupoIdx = 0;
  const gruposSorted = divergentes.sort((a, b) => b[1].dispositivos.length - a[1].dispositivos.length);
  
  for (const [key, grupo] of gruposSorted) {
    grupoIdx++;
    l(`### Grupo ${grupoIdx} — ${grupo.dispositivos.length} equipamento(s) | ${grupo.divergencias.length} divergência(s)`);
    l('');
    l('**Equipamentos:**');
    grupo.dispositivos.forEach(d => l(`- ${d}`));
    l('');
    l('**Divergências vs Referência:**');
    l('');
    l('| Parâmetro | Valor ATUAL (errado) | Valor CORRETO (referência) | Ação |');
    l('|---|---|---|---|');
    for (const div of grupo.divergencias) {
      l(`| \`${div.campo}\` | **${div.atual}** | ${div.ref} | → Alterar p/ ${div.ref} |`);
    }
    l('');
  }
  
  // ═══ DISPOSITIVOS OFFLINE ═══
  const offlines = resultados.filter(r => r.totalDiv === -1);
  if (offlines.length > 0) {
    l('## 5. DISPOSITIVOS OFFLINE (não acessíveis)');
    l('');
    l('| # | Equipamento | Motivo |');
    l('|---|---|---|');
    offlines.forEach((d, i) => l(`| ${i+1} | ${d.nome} | Tunnel inativo / VARCO desabilitado |`));
    l('');
  }
  
  // ═══ TABELA COMPLETA ═══
  l('## 6. TABELA COMPLETA — Status de Cada Equipamento');
  l('');
  l('| # | Equipamento | Status | Divergências | Grupo |');
  l('|---|---|---|---|---|');
  
  const resultadosSorted = [...resultados].sort((a, b) => a.nome.localeCompare(b.nome));
  resultadosSorted.forEach((dev, i) => {
    if (dev.totalDiv === -1) {
      l(`| ${i+1} | ${dev.nome} | ❌ Offline | — | — |`);
    } else if (dev.totalDiv === 0) {
      l(`| ${i+1} | ${dev.nome} | ✅ Conforme | 0 | Referência |`);
    } else {
      // Encontrar grupo
      let gNum = 0;
      for (const [k, g] of gruposSorted) {
        gNum++;
        if (g.dispositivos.includes(dev.nome)) break;
      }
      l(`| ${i+1} | ${dev.nome} | ⚠️ Divergente | ${dev.totalDiv} | Grupo ${gNum} |`);
    }
  });
  l('');
  
  // ═══ ANÁLISE DE PARÂMETROS ESPECÍFICOS ═══
  l('## 7. ANÁLISE POR PARÂMETRO — Distribuição de Valores');
  l('');
  l('Para cada parâmetro, mostra quantos dispositivos usam cada valor:');
  l('');
  
  // Pegar parâmetros com variação
  const paramStats = {};
  for (const dev of todosParams) {
    if (!dev.params) continue;
    for (const [campo, valor] of Object.entries(dev.params)) {
      if (!paramStats[campo]) paramStats[campo] = {};
      const key = String(valor);
      if (!paramStats[campo][key]) paramStats[campo][key] = [];
      paramStats[campo][key].push(dev.nome);
    }
  }
  
  // Mostrar apenas parâmetros que têm variação
  const paramsComVariacao = Object.entries(paramStats)
    .filter(([campo, vals]) => Object.keys(vals).length > 1)
    .filter(([campo]) => !campo.includes('profile') || campo === 'Noturno.upper.profile')
    .sort(([a], [b]) => a.localeCompare(b));
  
  for (const [campo, vals] of paramsComVariacao) {
    const valorRef = String(ref.params[campo]);
    l(`### \`${campo}\``);
    l('');
    l(`| Valor | Qtd | Correto? | Equipamentos |`);
    l(`|---|---|---|---|`);
    
    const valsSorted = Object.entries(vals).sort((a, b) => b[1].length - a[1].length);
    for (const [valor, devs] of valsSorted) {
      const isCorreto = valor === valorRef ? '✅ SIM' : '❌ NÃO';
      const lista = devs.length > 5 ? `${devs.slice(0, 3).join(', ')} ... (+${devs.length - 3})` : devs.join(', ');
      l(`| \`${valor}\` | ${devs.length} | ${isCorreto} | ${lista} |`);
    }
    l('');
  }
  
  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  ANÁLISE COMPLETA DE CONFIGURAÇÃO — ITScam 450 / VARCO');
  console.log(`  Modo: ${USE_OFFLINE ? '📂 OFFLINE (dados salvos)' : '🌐 ONLINE (acesso ao vivo)'}`);
  console.log('═══════════════════════════════════════════════════════════════');
  
  let devices;
  
  if (USE_OFFLINE) {
    console.log('\n  Carregando dados do diretório resultados/...');
    devices = carregarDadosOffline();
    console.log(`  ${devices.length} dispositivos carregados.`);
  } else {
    devices = await coletarOnline();
  }
  
  if (devices.length === 0) {
    console.log('\n  ❌ Nenhum dispositivo encontrado!\n');
    return;
  }
  
  console.log('\n  Analisando configurações...');
  const analise = analisar(devices);
  
  if (!analise) {
    console.log('\n  ❌ Erro na análise.\n');
    return;
  }
  
  console.log('  Gerando relatório...');
  const relatorio = gerarRelatorio(analise);
  
  const outputFile = './auditoria-itscam/RELATORIO-VARCO-COMPLETO.md';
  writeFileSync(outputFile, relatorio);
  
  console.log(`\n  ✅ Relatório gerado: ${outputFile}`);
  
  // Resumo no console
  const { grupos, resultados } = analise;
  const conformes = grupos['CONFORME'];
  console.log(`\n  📊 RESUMO:`);
  console.log(`     Total: ${resultados.length} dispositivos`);
  console.log(`     ✅ Conformes: ${conformes ? conformes.dispositivos.length : 0}`);
  console.log(`     ⚠️ Divergentes: ${resultados.filter(r => r.totalDiv > 0).length}`);
  console.log(`     ❌ Offline: ${resultados.filter(r => r.totalDiv === -1).length}`);
  console.log(`     📁 Grupos distintos: ${Object.keys(grupos).length}`);
  console.log('');
}

main().catch(console.error);
