/**
 * AUDITORIA COMPLETA ITScam 450 - Coleta de Configurações
 * 
 * Este script coleta TODAS as configurações de todos os 70 equipamentos
 * via tunnels Varco, organizadas por menu/endpoint da API.
 * 
 * Execução: node auditoria-itscam/coletar-configuracoes.mjs
 * 
 * Pré-requisitos:
 * - Node.js 18+ (suporte a fetch nativo)
 * - Acesso aos túneis Varco (vpn/internet)
 * - Credenciais: admin / #econocr@
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// ═══════════════════════════════════════════════════════════════
// CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════════

const CREDENTIALS = { username: 'admin', password: '#econocr@' };
const TUNNEL_BASE = 'https://{UUID}-80.tunnel.varco.cloud';
const CONCURRENCY = 3; // Limitar requisições simultâneas (túneis são lentos)
const TIMEOUT_MS = 30000; // 30s timeout por request
const OUTPUT_DIR = './auditoria-itscam/resultados';

// ═══════════════════════════════════════════════════════════════
// ENDPOINTS POR MENU (mapeados da interface ITScam 450)
// ═══════════════════════════════════════════════════════════════

const MENUS = {
  '01-ESTADO-ATUAL': {
    descricao: 'Menu Estado Atual - Informações gerais do equipamento',
    endpoints: [
      { path: '/api/equipment/info', nome: 'Info Equipamento' },
      { path: '/api/equipment/boards', nome: 'Placas/Hardware' },
      { path: '/api/system/firmware', nome: 'Firmware' },
      { path: '/api/system/maintenance/storage/usage', nome: 'Storage' },
      { path: '/api/equipment/misc/readonly/volatile', nome: 'Dados Voláteis (CPU, Temp)' },
      { path: '/api/equipment/misc/readonly/constants', nome: 'Constantes Sistema' },
    ]
  },
  '02-IMAGEM': {
    descricao: 'Menu Imagem - Perfis, transições, exposição, cor, lente',
    endpoints: [
      { path: '/api/image/profiles', nome: 'Perfis de Imagem (Diurno/Noturno)' },
      { path: '/api/equipment/transitioner', nome: 'Transicionador de Perfis' },
      { path: '/api/equipment/autofocus', nome: 'Autofoco' },
    ]
  },
  '03-VIDEO': {
    descricao: 'Menu Vídeo - Streams, codificação',
    endpoints: [
      { path: '/api/video/streams', nome: 'Streams de Vídeo' },
    ]
  },
  '04-EQUIPAMENTO': {
    descricao: 'Menu Equipamento - OCR, classificador, faixas, servidores',
    submenus: {
      '04a-OCR': {
        endpoints: [
          { path: '/api/equipment/ocr', nome: 'Config OCR' },
        ]
      },
      '04b-CLASSIFICADOR': {
        endpoints: [
          { path: '/api/equipment/classifier', nome: 'Classificador Veicular' },
        ]
      },
      '04c-FAIXAS': {
        endpoints: [
          { path: '/api/equipment/lanes', nome: 'Faixas de Trânsito' },
        ]
      },
      '04d-ANALYTICS': {
        endpoints: [
          { path: '/api/equipment/analytics', nome: 'Analytics' },
        ]
      },
      '04e-INDICADOR-VEICULO': {
        endpoints: [
          { path: '/api/equipment/vehicleIndicator', nome: 'Indicador de Veículo' },
        ]
      },
      '04f-SERVIDORES': {
        endpoints: [
          { path: '/api/equipment/servers/ftp', nome: 'Servidor FTP' },
          { path: '/api/equipment/servers/lince', nome: 'Servidor Lince' },
          { path: '/api/equipment/servers/lince/status', nome: 'Status Lince' },
          { path: '/api/equipment/servers/itscampro', nome: 'ITScam Pro' },
          { path: '/api/equipment/servers/itscampro/status', nome: 'Status ITScam Pro' },
          { path: '/api/equipment/servers/protocols', nome: 'Protocolos' },
          { path: '/api/equipment/servers/restapiclient/presets', nome: 'REST API Client Presets' },
        ]
      },
      '04g-ASSINATURA-IMAGEM': {
        endpoints: [
          { path: '/api/equipment/imageSign', nome: 'Assinatura de Imagem' },
        ]
      },
      '04h-PORTAS-IO': {
        endpoints: [
          { path: '/api/equipment/ioPorts', nome: 'Portas IO' },
          { path: '/api/equipment/ioBasic', nome: 'IO Básico' },
        ]
      },
      '04i-DIVERSOS': {
        endpoints: [
          { path: '/api/equipment/misc', nome: 'Configurações Diversas' },
        ]
      },
    }
  },
  '05-SISTEMA': {
    descricao: 'Menu Sistema - Rede, data/hora, manutenção, segurança',
    submenus: {
      '05a-GERAL': {
        endpoints: [
          { path: '/api/equipment/general', nome: 'Config Geral' },
          { path: '/api/equipment/dateAndTime', nome: 'Data e Hora' },
        ]
      },
      '05b-REDE': {
        endpoints: [
          { path: '/api/equipment/network', nome: 'Rede Completa' },
          { path: '/api/equipment/network/ethernet', nome: 'Ethernet' },
          { path: '/api/equipment/network/firewall', nome: 'Firewall' },
          { path: '/api/equipment/network/routes', nome: 'Rotas' },
        ]
      },
      '05c-MANUTENCAO': {
        endpoints: [
          { path: '/api/system/maintenance/automaticreboot', nome: 'Reboot Automático' },
          { path: '/api/system/maintenance/remoteaccess', nome: 'Acesso Remoto' },
          { path: '/api/system/maintenance/sdcard', nome: 'SDCard' },
        ]
      },
      '05d-MONITORAMENTO': {
        endpoints: [
          { path: '/api/system/monitoring/snmp', nome: 'SNMP' },
        ]
      },
      '05e-LICENCAS': {
        endpoints: [
          { path: '/api/system/licenses', nome: 'Licenças' },
        ]
      },
      '05f-USUARIOS': {
        endpoints: [
          { path: '/api/system/users', nome: 'Usuários' },
        ]
      },
    }
  }
};

// ═══════════════════════════════════════════════════════════════
// FUNÇÕES DE COLETA
// ═══════════════════════════════════════════════════════════════

async function authenticateDevice(baseUrl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  
  try {
    const res = await fetch(`${baseUrl}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ params: CREDENTIALS }),
      signal: controller.signal,
    });
    
    if (!res.ok) return null;
    const data = await res.json();
    return data.token;
  } catch (e) {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchEndpoint(baseUrl, token, endpoint) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  
  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      signal: controller.signal,
    });
    
    if (!res.ok) return { _error: res.status, _statusText: res.statusText };
    return await res.json();
  } catch (e) {
    return { _error: 'TIMEOUT', _message: e.message };
  } finally {
    clearTimeout(timeout);
  }
}

async function collectDeviceData(device) {
  const baseUrl = TUNNEL_BASE.replace('{UUID}', device.uuid);
  console.log(`  🔗 Conectando: ${device.name} (${device.uuid.substring(0,8)}...)`);
  
  const token = await authenticateDevice(baseUrl);
  if (!token) {
    console.log(`  ❌ Falha auth: ${device.name}`);
    return { _device: device, _error: 'AUTH_FAILED', _timestamp: new Date().toISOString() };
  }
  
  console.log(`  ✅ Autenticado: ${device.name}`);
  
  const result = {
    _device: device,
    _timestamp: new Date().toISOString(),
    _tunnelUrl: baseUrl,
    menus: {}
  };
  
  // Flatten all endpoints from MENUS structure
  const allEndpoints = [];
  for (const [menuKey, menu] of Object.entries(MENUS)) {
    if (menu.endpoints) {
      for (const ep of menu.endpoints) {
        allEndpoints.push({ menuKey, submenuKey: null, ...ep });
      }
    }
    if (menu.submenus) {
      for (const [subKey, sub] of Object.entries(menu.submenus)) {
        for (const ep of sub.endpoints) {
          allEndpoints.push({ menuKey, submenuKey: subKey, ...ep });
        }
      }
    }
  }
  
  // Fetch sequencially (tunnels can't handle too many parallel requests)
  for (const ep of allEndpoints) {
    const key = ep.submenuKey ? `${ep.menuKey}/${ep.submenuKey}` : ep.menuKey;
    if (!result.menus[key]) result.menus[key] = {};
    
    const data = await fetchEndpoint(baseUrl, token, ep.path);
    result.menus[key][ep.path] = {
      nome: ep.nome,
      data
    };
    
    // Small delay between requests to not overload tunnel
    await new Promise(r => setTimeout(r, 500));
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════════
// PROCESSAMENTO EM LOTE COM CONCURRENCY
// ═══════════════════════════════════════════════════════════════

async function processInBatches(devices, batchSize) {
  const results = [];
  
  for (let i = 0; i < devices.length; i += batchSize) {
    const batch = devices.slice(i, i + batchSize);
    console.log(`\n📦 Processando batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(devices.length/batchSize)} (${batch.map(d => d.name).join(', ')})`);
    
    const batchResults = await Promise.all(batch.map(d => collectDeviceData(d)));
    results.push(...batchResults);
    
    // Salvar cada equipamento individualmente (resiliência a falhas)
    for (const result of batchResults) {
      const safeName = result._device.name.replace(/[^a-zA-Z0-9-_]/g, '_');
      const file = join(OUTPUT_DIR, `${safeName}.json`);
      writeFileSync(file, JSON.stringify(result, null, 2));
    }
    
    // Salvar progresso parcial
    const progressFile = join(OUTPUT_DIR, '_progress.json');
    writeFileSync(progressFile, JSON.stringify({
      total: devices.length,
      completed: results.length,
      lastUpdate: new Date().toISOString()
    }, null, 2));
    
    // Pausa entre batches
    if (i + batchSize < devices.length) {
      console.log('  ⏳ Aguardando 2s antes do próximo batch...');
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  
  return results;
}

// ═══════════════════════════════════════════════════════════════
// GERAÇÃO DE RELATÓRIOS DE COMPARAÇÃO
// ═══════════════════════════════════════════════════════════════

function generateComparisonReport(results) {
  const report = {
    metadata: {
      dataColeta: new Date().toISOString(),
      totalEquipamentos: results.length,
      equipamentosComErro: results.filter(r => r._error).length,
    },
    porMenu: {},
    divergencias: [],
    correcoes: []
  };
  
  // Equipamento referência (GOEC6O058 - Faixa 1)
  const referencia = results.find(r => r._device?.name?.includes('GOEC6O058') && r._device?.name?.includes('Faixa 1'));
  
  if (!referencia || referencia._error) {
    report.metadata.aviso = 'Equipamento referência (GOEC6O058) não disponível';
    return report;
  }
  
  // Para cada menu, comparar todos os equipamentos com a referência
  for (const [menuKey, menuData] of Object.entries(referencia.menus || {})) {
    report.porMenu[menuKey] = {
      endpoints: {},
      divergenciasCount: 0
    };
    
    for (const [endpoint, epData] of Object.entries(menuData)) {
      const refConfig = epData.data;
      const comparisons = [];
      
      for (const result of results) {
        if (result._error || result === referencia) continue;
        
        const deviceMenuData = result.menus?.[menuKey]?.[endpoint]?.data;
        if (!deviceMenuData) continue;
        
        const diffs = deepDiff(refConfig, deviceMenuData, '');
        if (diffs.length > 0) {
          comparisons.push({
            device: result._device.name,
            diferencas: diffs
          });
        }
      }
      
      report.porMenu[menuKey].endpoints[endpoint] = {
        nome: epData.nome,
        referencia: referencia._device?.name,
        equipamentosComDiferenca: comparisons.length,
        detalhes: comparisons
      };
      
      report.porMenu[menuKey].divergenciasCount += comparisons.length;
    }
  }
  
  return report;
}

function deepDiff(ref, target, path) {
  const diffs = [];
  
  if (ref === null || target === null) {
    if (ref !== target) diffs.push({ path, ref, target, tipo: 'valor_diferente' });
    return diffs;
  }
  
  if (typeof ref !== typeof target) {
    diffs.push({ path, ref, target, tipo: 'tipo_diferente' });
    return diffs;
  }
  
  if (Array.isArray(ref)) {
    if (!Array.isArray(target)) {
      diffs.push({ path, tipo: 'tipo_diferente', ref: 'array', target: typeof target });
      return diffs;
    }
    if (ref.length !== target.length) {
      diffs.push({ path, tipo: 'tamanho_array', ref: ref.length, target: target.length });
    }
    const maxLen = Math.min(ref.length, target.length);
    for (let i = 0; i < maxLen; i++) {
      diffs.push(...deepDiff(ref[i], target[i], `${path}[${i}]`));
    }
    return diffs;
  }
  
  if (typeof ref === 'object') {
    const allKeys = new Set([...Object.keys(ref), ...Object.keys(target)]);
    for (const key of allKeys) {
      // Ignorar campos voláteis que mudam a cada leitura
      if (['_timestamp', 'active', 'uptime', 'temperature', 'cpuUsage'].includes(key)) continue;
      
      if (!(key in ref)) {
        diffs.push({ path: `${path}.${key}`, tipo: 'campo_extra', target: target[key] });
      } else if (!(key in target)) {
        diffs.push({ path: `${path}.${key}`, tipo: 'campo_ausente', ref: ref[key] });
      } else {
        diffs.push(...deepDiff(ref[key], target[key], `${path}.${key}`));
      }
    }
    return diffs;
  }
  
  if (ref !== target) {
    diffs.push({ path, ref, target, tipo: 'valor_diferente' });
  }
  
  return diffs;
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  AUDITORIA COMPLETA ITScam 450 - 70 Equipamentos');
  console.log('═══════════════════════════════════════════════════\n');
  
  // Criar diretório de saída
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });
  
  // Carregar inventário
  const devices = JSON.parse(readFileSync('./auditoria-itscam/devices-inventory.json', 'utf8'));
  console.log(`📋 ${devices.length} equipamentos no inventário\n`);
  
  // Coletar dados
  console.log('🚀 Iniciando coleta...\n');
  const startTime = Date.now();
  const results = await processInBatches(devices, CONCURRENCY);
  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  
  console.log(`\n✅ Coleta concluída em ${elapsed} minutos`);
  console.log(`   Sucesso: ${results.filter(r => !r._error).length}/${devices.length}`);
  console.log(`   Falhas: ${results.filter(r => r._error).length}/${devices.length}`);
  
  // Salvar dados brutos por equipamento
  for (const result of results) {
    const safeName = result._device.name.replace(/[^a-zA-Z0-9-_]/g, '_');
    const file = join(OUTPUT_DIR, `${safeName}.json`);
    writeFileSync(file, JSON.stringify(result, null, 2));
  }
  
  // Salvar tudo consolidado
  writeFileSync(join(OUTPUT_DIR, '_ALL_DEVICES.json'), JSON.stringify(results, null, 2));
  
  // Gerar relatório de comparação
  console.log('\n📊 Gerando relatório de comparação...');
  const report = generateComparisonReport(results);
  writeFileSync(join(OUTPUT_DIR, '_RELATORIO_COMPARACAO.json'), JSON.stringify(report, null, 2));
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  ARQUIVOS GERADOS:');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  📁 ${OUTPUT_DIR}/`);
  console.log(`     ├── _ALL_DEVICES.json (todos os dados brutos)`);
  console.log(`     ├── _RELATORIO_COMPARACAO.json (análise de divergências)`);
  console.log(`     ├── _progress.json (progresso da coleta)`);
  console.log(`     └── [70 arquivos individuais por equipamento]`);
  console.log('═══════════════════════════════════════════════════\n');
}

main().catch(console.error);
