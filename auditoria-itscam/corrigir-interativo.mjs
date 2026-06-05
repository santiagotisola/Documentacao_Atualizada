/**
 * ══════════════════════════════════════════════════════════════════
 * SCRIPT INTERATIVO DE CORREÇÃO — Auditoria ITScam 450 SETRANS-GO
 * ══════════════════════════════════════════════════════════════════
 * 
 * Permite aplicar correções caso a caso, equipamento a equipamento,
 * com validação prévia e confirmação obrigatória antes de cada ação.
 * 
 * USO:
 *   node auditoria-itscam/corrigir-interativo.mjs
 * 
 * FLUXO:
 *   1. Selecionar o CASO (01–08)
 *   2. Ver equipamentos afetados e diagnóstico em tempo real
 *   3. Escolher: um equipamento específico, ou TODOS
 *   4. Para cada equipamento:
 *      a) Conecta via tunnel e lê configuração ATUAL
 *      b) Compara com referência e mostra DE → PARA
 *      c) Pede confirmação (S/N) antes de aplicar
 *      d) Aplica e valida o resultado
 *   5. Gera log detalhado de tudo que foi feito
 * 
 * SEGURANÇA:
 *   - NENHUMA alteração é feita sem confirmação explícita
 *   - Backup do valor anterior é salvo antes de cada alteração
 *   - Log completo com timestamp em auditoria-itscam/logs-correcao/
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { createInterface } from 'readline';

// ═══════════════════════════════════════════════════════════════
// CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════════

const TUNNEL_BASE = 'https://{UUID}-80.tunnel.varco.cloud';
const CREDENTIALS = { username: 'admin', password: '#econocr@' };
const TIMEOUT_MS = 30000;
const LOG_DIR = './auditoria-itscam/logs-correcao';
const INVENTORY_FILE = './auditoria-itscam/devices-inventory.json';

// ═══════════════════════════════════════════════════════════════
// DEFINIÇÃO DOS 8 CASOS (alinhados com GUIA-CORRECAO-CONSOLIDADO.md)
// ═══════════════════════════════════════════════════════════════

const CASOS = [
  {
    id: 'CASO-01',
    titulo: 'VARCO Tunnel Desabilitado',
    severidade: '🔴 CRÍTICA',
    descricao: 'Equipamentos sem conectividade remota. VARCO desabilitado.',
    tela: 'SISTEMA → Manutenção → Acesso Remoto',
    endpoint_leitura: '/api/system/maintenance/remoteaccess',
    endpoint_escrita: '/api/system/maintenance/remoteaccess',
    method: 'PUT',
    equipamentos: [
      { nome: 'GOEC6O019 - Faixa 1', uuid: '6f6eddc7-f900-4d4f-8040-f7d1775d1d1d', ip: '45.70.144.143' },
      { nome: 'GOEC6O019 - Faixa 2', uuid: 'b8925732-54cf-4f01-b4ec-c8bcb1b3bd2e', ip: '45.70.144.143' },
      { nome: 'GOEC6O023 - Faixa 1', uuid: '64e60ba4-79b7-4447-b726-a3f032327907', ip: '177.25.228.3' },
      { nome: 'GOEC6O049 - Faixa 1', uuid: 'ad0db63e-bb6e-4cb1-99eb-960f486cb692', ip: '191.58.159.123' },
      { nome: 'GOEC6O049 - Faixa 2', uuid: '3a8b23c7-edf3-43d3-b9be-9211674777e3', ip: '191.58.159.123' },
      { nome: 'GOEC6O052 - Faixa 1', uuid: '49cbc26f-7a42-47d6-9d32-bc66f740e886', ip: '187.68.165.85' },
    ],
    valores_corretos: {
      varco: {
        enabled: true,
        edgeServer: 'edge.varco.io',
        provisionKey: 'yk-pzGzXLGmz6-iO3GhdR7hinksDN7aek-kjQ4WYl_c=',
      }
    },
    buildPayload: (equip) => ({
      remoteAccess: {
        varco: {
          enabled: true,
          edgeServer: 'edge.varco.io',
          provisionKey: 'yk-pzGzXLGmz6-iO3GhdR7hinksDN7aek-kjQ4WYl_c=',
          deviceName: equip.nome.replace(' - ', ' - ').toUpperCase(),
        }
      }
    }),
    validar: (data) => {
      const v = data?.remoteAccess?.varco || data?.varco || {};
      return {
        precisaCorrecao: v.enabled !== true,
        campos: [
          { campo: 'varco.enabled', atual: v.enabled ?? 'null', correto: true, errado: v.enabled !== true },
          { campo: 'varco.edgeServer', atual: v.edgeServer ?? 'null', correto: 'edge.varco.io', errado: v.edgeServer !== 'edge.varco.io' },
          { campo: 'varco.provisionKey', atual: v.provisionKey ? '(definido)' : 'null', correto: '(definido)', errado: !v.provisionKey },
        ]
      };
    },
    nota: '⚠️ REQUER ACESSO LOCAL (IP público). Tunnel não funciona se VARCO está desabilitado!',
    acesso_via_tunnel: false,
  },
  {
    id: 'CASO-02',
    titulo: 'Câmera Travada em P&B (profile errado + transições)',
    severidade: '🔴 CRÍTICA',
    descricao: 'Perfil Noturno upper.profile aponta para si mesmo (23483). Câmera fica presa em P&B.',
    tela: 'IMAGEM → Perfis de Imagem → Perfil Noturno → Transições',
    endpoint_leitura: '/api/image/profiles',
    endpoint_escrita: '/api/image/profiles/1',
    method: 'PUT',
    equipamentos: [
      { nome: 'GOEC6O008 - Faixa 1', uuid: '5d6880f0-e8f2-4ff0-be25-00c3b31d6522', ip: '191.58.135.61' },
    ],
    valores_corretos: {
      'noturno.transitions.upper.profile': 0,
      'noturno.transitions.upper.level': 35,
      'noturno.transitions.upper.startTime': '00:00:00',
      'noturno.transitions.upper.endTime': '00:00:00',
      'noturno.transitions.lower.endTime': '00:00:00',
      'diurno.transitions.lower.endTime': '00:00:00',
      'diurno.transitions.upper.startTime': '00:00:00',
      'diurno.transitions.upper.level': 35,
    },
    buildPayload: (equip, currentData) => {
      // Pega o perfil noturno atual e corrige os campos
      const profiles = Array.isArray(currentData) ? currentData : currentData?.profiles || [];
      const noturno = profiles[1] ? JSON.parse(JSON.stringify(profiles[1])) : {};
      if (noturno.transitions) {
        noturno.transitions.upper.profile = 0;
        noturno.transitions.upper.level = 35;
        noturno.transitions.upper.startTime = '00:00:00';
        noturno.transitions.upper.endTime = '00:00:00';
        noturno.transitions.lower.startTime = '00:00:00';
        noturno.transitions.lower.endTime = '00:00:00';
      }
      return noturno;
    },
    validar: (data) => {
      const profiles = Array.isArray(data) ? data : data?.profiles || [];
      const noturno = profiles[1] || {};
      const t = noturno.transitions || {};
      const upper = t.upper || {};
      const lower = t.lower || {};
      return {
        precisaCorrecao: upper.profile !== 0 || upper.level !== 35,
        campos: [
          { campo: 'noturno.upper.profile', atual: upper.profile, correto: 0, errado: upper.profile !== 0 },
          { campo: 'noturno.upper.level', atual: upper.level, correto: 35, errado: upper.level !== 35 },
          { campo: 'noturno.upper.startTime', atual: upper.startTime, correto: '00:00:00', errado: upper.startTime !== '00:00:00' },
          { campo: 'noturno.upper.endTime', atual: upper.endTime, correto: '00:00:00', errado: upper.endTime !== '00:00:00' },
          { campo: 'noturno.lower.endTime', atual: lower.endTime, correto: '00:00:00', errado: lower.endTime !== '00:00:00' },
        ]
      };
    },
    acesso_via_tunnel: true,
  },
  {
    id: 'CASO-03',
    titulo: 'Transições com Janelas de Horário',
    severidade: '🟠 ALTA',
    descricao: 'startTime/endTime com horários específicos. Devem ser 00:00:00 para funcionar 24h por luminosidade.',
    tela: 'IMAGEM → Perfis de Imagem → [Diurno/Noturno] → Transições',
    endpoint_leitura: '/api/image/profiles',
    endpoint_escrita_diurno: '/api/image/profiles/0',
    endpoint_escrita_noturno: '/api/image/profiles/1',
    method: 'PUT',
    equipamentos: [
      { nome: 'GOEC6O033 - Faixa 2', uuid: '34ebe844-ba8e-49f4-bc6f-45d5724ee381', ip: '45.168.254.127' },
      { nome: 'GOEC6O040 - Faixa 1', uuid: '9b5328e3-104b-4afc-b3ce-8880066ca995', ip: '201.71.213.219' },
      { nome: 'GOEC6O040 - Faixa 2', uuid: '416aff7e-4c34-4356-bbac-aa66d34ffead', ip: '201.71.213.219' },
      { nome: 'GOEC6O055 - Faixa 1', uuid: '1d0b2132-a825-4823-ab8f-8ce4aa829138', ip: '191.37.226.77' },
      { nome: 'GOEC6O055 - Faixa 2', uuid: 'fe5f7cf3-a8dd-41e8-b975-72921dbddeac', ip: '191.37.226.77' },
    ],
    valores_corretos: {
      'startTime': '00:00:00',
      'endTime': '00:00:00',
      'lower.level': 10,
      'upper.level': 35,
      'upper.profile': 0,
    },
    buildPayload: (equip, currentData, perfilIndex) => {
      const profiles = Array.isArray(currentData) ? currentData : currentData?.profiles || [];
      const perfil = profiles[perfilIndex] ? JSON.parse(JSON.stringify(profiles[perfilIndex])) : {};
      if (perfil.transitions) {
        perfil.transitions.lower.startTime = '00:00:00';
        perfil.transitions.lower.endTime = '00:00:00';
        perfil.transitions.lower.level = 10;
        perfil.transitions.lower.holdTime = 60000;
        perfil.transitions.upper.startTime = '00:00:00';
        perfil.transitions.upper.endTime = '00:00:00';
        perfil.transitions.upper.level = 35;
        perfil.transitions.upper.holdTime = 60000;
        perfil.transitions.upper.profile = perfilIndex === 1 ? 0 : perfil.transitions.upper.profile;
      }
      return perfil;
    },
    validar: (data) => {
      const profiles = Array.isArray(data) ? data : data?.profiles || [];
      const campos = [];
      let precisaCorrecao = false;
      ['Diurno', 'Noturno'].forEach((nome, idx) => {
        const p = profiles[idx] || {};
        const t = p.transitions || {};
        ['lower', 'upper'].forEach(tipo => {
          const tr = t[tipo] || {};
          if (tr.startTime !== '00:00:00') {
            campos.push({ campo: `${nome}.${tipo}.startTime`, atual: tr.startTime, correto: '00:00:00', errado: true });
            precisaCorrecao = true;
          }
          if (tr.endTime !== '00:00:00') {
            campos.push({ campo: `${nome}.${tipo}.endTime`, atual: tr.endTime, correto: '00:00:00', errado: true });
            precisaCorrecao = true;
          }
        });
        if (t.lower?.level !== 10) {
          campos.push({ campo: `${nome}.lower.level`, atual: t.lower?.level, correto: 10, errado: true });
          precisaCorrecao = true;
        }
        if (t.upper?.level !== 35) {
          campos.push({ campo: `${nome}.upper.level`, atual: t.upper?.level, correto: 35, errado: true });
          precisaCorrecao = true;
        }
      });
      return { precisaCorrecao, campos };
    },
    multi_endpoint: true,
    acesso_via_tunnel: true,
  },
  {
    id: 'CASO-04',
    titulo: 'Classificador processingQueue/Threads Alto',
    severidade: '🔵 BAIXA',
    descricao: 'Classificador com queue/threads > 1. Padrão deve ser 1/1.',
    tela: 'EQUIPAMENTO → Classificador',
    endpoint_leitura: '/api/equipment/classifier',
    endpoint_escrita: '/api/equipment/classifier',
    method: 'PUT',
    equipamentos: [
      { nome: 'GOEC6O010 - Faixa 1', uuid: 'abf8fedb-4f1b-471f-a6bd-4e00484d5737', ip: '138.97.25.44' },
      { nome: 'GOEC6O010 - Faixa 2', uuid: '481dd19b-4968-4759-860b-35f9ec09c206', ip: '138.97.25.44' },
      { nome: 'GOEC6O011 - Faixa 2', uuid: 'd0595c80-9ea7-49af-b2a0-d305d688e567', ip: '187.61.123.9' },
      { nome: 'GOEC6O028 - Faixa 1', uuid: '1f460cd7-f607-4c79-8a8e-50a8228850a4', ip: '177.25.234.226' },
      { nome: 'GOEC6O052 - Faixa 2', uuid: '8244f568-59f3-4f27-932e-86cc2eb10fc3', ip: '187.68.165.85' },
      { nome: 'GOEC6O058 - Faixa 2', uuid: '6561d5fd-0aba-413b-a60a-a0d7e1b61b6d', ip: '187.68.160.38' },
    ],
    valores_corretos: { processingQueue: 1, processingThreads: 1 },
    buildPayload: () => ({ classifier: { processingQueue: 1, processingThreads: 1 } }),
    validar: (data) => {
      const c = data?.classifier || data || {};
      return {
        precisaCorrecao: c.processingQueue !== 1 || c.processingThreads !== 1,
        campos: [
          { campo: 'classifier.processingQueue', atual: c.processingQueue, correto: 1, errado: c.processingQueue !== 1 },
          { campo: 'classifier.processingThreads', atual: c.processingThreads, correto: 1, errado: c.processingThreads !== 1 },
        ]
      };
    },
    acesso_via_tunnel: true,
  },
  {
    id: 'CASO-05',
    titulo: 'Níveis de Transição (Level) Diferentes',
    severidade: '🟡 MÉDIA',
    descricao: 'lower.level e/ou upper.level fora do padrão (10/35).',
    tela: 'IMAGEM → Perfis de Imagem → [Perfil] → Transições',
    endpoint_leitura: '/api/image/profiles',
    endpoint_escrita_diurno: '/api/image/profiles/0',
    endpoint_escrita_noturno: '/api/image/profiles/1',
    method: 'PUT',
    equipamentos: [
      { nome: 'GOEC6O009 - Faixa 1', uuid: 'c296d7bf-0d3b-4da1-bf1d-3e4fe998e4a1', ip: '191.58.150.37' },
      { nome: 'GOEC6O009 - Faixa 2', uuid: 'ef0e72ca-d3a5-4f4e-bbf6-40f3737bda3f', ip: '191.58.150.37' },
      { nome: 'GOEC6O013 - Faixa 2', uuid: '36896650-1bca-4093-9631-667b73bdd93d', ip: '191.58.151.247' },
      { nome: 'GOEC6O008 - Faixa 1', uuid: '5d6880f0-e8f2-4ff0-be25-00c3b31d6522', ip: '191.58.135.61' },
    ],
    valores_corretos: { 'lower.level': 10, 'upper.level': 35 },
    buildPayload: (equip, currentData, perfilIndex) => {
      const profiles = Array.isArray(currentData) ? currentData : currentData?.profiles || [];
      const perfil = profiles[perfilIndex] ? JSON.parse(JSON.stringify(profiles[perfilIndex])) : {};
      if (perfil.transitions) {
        perfil.transitions.lower.level = 10;
        perfil.transitions.upper.level = 35;
      }
      return perfil;
    },
    validar: (data) => {
      const profiles = Array.isArray(data) ? data : data?.profiles || [];
      const campos = [];
      let precisaCorrecao = false;
      ['Diurno', 'Noturno'].forEach((nome, idx) => {
        const p = profiles[idx] || {};
        const t = p.transitions || {};
        if (t.lower?.level !== 10) {
          campos.push({ campo: `${nome}.lower.level`, atual: t.lower?.level, correto: 10, errado: true });
          precisaCorrecao = true;
        }
        if (t.upper?.level !== 35) {
          campos.push({ campo: `${nome}.upper.level`, atual: t.upper?.level, correto: 35, errado: true });
          precisaCorrecao = true;
        }
      });
      return { precisaCorrecao, campos };
    },
    multi_endpoint: true,
    acesso_via_tunnel: true,
  },
  {
    id: 'CASO-06',
    titulo: 'OCR maxPlates Reduzido (1 → 2)',
    severidade: '🔵 BAIXA',
    descricao: 'maxPlates=1 limita detecção. Padrão é 2.',
    tela: 'EQUIPAMENTO → OCR → Max Plates',
    endpoint_leitura: '/api/equipment/ocr',
    endpoint_escrita: '/api/equipment/ocr',
    method: 'PUT',
    equipamentos: [
      { nome: 'GOEC6O009 - Faixa 2', uuid: 'ef0e72ca-d3a5-4f4e-bbf6-40f3737bda3f', ip: '191.58.150.37' },
      { nome: 'GOEC6O055 - Faixa 2', uuid: 'fe5f7cf3-a8dd-41e8-b975-72921dbddeac', ip: '191.37.226.77' },
    ],
    valores_corretos: { maxPlates: 2 },
    buildPayload: (equip, currentData) => {
      const ocr = currentData?.ocr ? JSON.parse(JSON.stringify(currentData.ocr)) : {};
      ocr.maxPlates = 2;
      return { ocr };
    },
    validar: (data) => {
      const o = data?.ocr || data || {};
      return {
        precisaCorrecao: o.maxPlates !== 2,
        campos: [
          { campo: 'ocr.maxPlates', atual: o.maxPlates, correto: 2, errado: o.maxPlates !== 2 },
        ]
      };
    },
    acesso_via_tunnel: true,
  },
  {
    id: 'CASO-07',
    titulo: 'Snapshot Crop Habilitado',
    severidade: '🔵 BAIXA',
    descricao: 'snapshotCrop habilitado recorta imagem. Deve ser desabilitado.',
    tela: 'EQUIPAMENTO → Diversos → Snapshot Crop',
    endpoint_leitura: '/api/equipment/misc',
    endpoint_escrita: '/api/equipment/misc',
    method: 'PUT',
    equipamentos: [
      { nome: 'GOEC6O003 - Faixa 2', uuid: 'ea779324-56d4-4ea5-bfb6-63b4cf751621', ip: '177.25.238.161' },
      { nome: 'GOEC6O008 - Faixa 1', uuid: '5d6880f0-e8f2-4ff0-be25-00c3b31d6522', ip: '191.58.135.61' },
      { nome: 'GOEC6O013 - Faixa 1', uuid: '7d9bf2eb-0f9a-4691-bffd-e003fc3781ed', ip: '191.58.151.247' },
    ],
    valores_corretos: { 'snapshotCrop.enable': false },
    buildPayload: (equip, currentData) => {
      const misc = currentData ? JSON.parse(JSON.stringify(currentData)) : {};
      if (misc.snapshotCrop) misc.snapshotCrop.enable = false;
      else misc.snapshotCrop = { enable: false, mode: 'static' };
      return misc;
    },
    validar: (data) => {
      const sc = data?.snapshotCrop || {};
      return {
        precisaCorrecao: sc.enable !== false,
        campos: [
          { campo: 'snapshotCrop.enable', atual: sc.enable, correto: false, errado: sc.enable !== false },
          { campo: 'snapshotCrop.mode', atual: sc.mode, correto: 'static', errado: sc.mode !== 'static' },
        ]
      };
    },
    acesso_via_tunnel: true,
  },
  {
    id: 'CASO-08',
    titulo: 'Gateway Diferente do Padrão',
    severidade: '⚪ INFORMATIVA',
    descricao: 'Gateway 192.168.1.1 ao invés de 192.168.0.1. PODE SER INTENCIONAL!',
    tela: 'SISTEMA → Rede → Ethernet → IPv4 Primary',
    endpoint_leitura: '/api/system/network/ethernet',
    endpoint_escrita: '/api/system/network/ethernet',
    method: 'PUT',
    equipamentos: [
      { nome: 'GOEC6O046 - Faixa 1', uuid: '1e26be92-70e4-468f-a582-4e015282a4fe', ip: '170.81.67.214' },
      { nome: 'GOEC6O046 - Faixa 2', uuid: '4d68163e-8462-4dce-adad-df3b0d7c76af', ip: '170.81.67.214' },
    ],
    valores_corretos: { gateway: '192.168.0.1' },
    buildPayload: (equip, currentData) => {
      const net = currentData ? JSON.parse(JSON.stringify(currentData)) : {};
      if (net.ipv4Primary) net.ipv4Primary.gateway = '192.168.0.1';
      return net;
    },
    validar: (data) => {
      const gw = data?.ipv4Primary?.gateway || data?.gateway;
      return {
        precisaCorrecao: gw !== '192.168.0.1',
        campos: [
          { campo: 'ethernet.ipv4Primary.gateway', atual: gw, correto: '192.168.0.1', errado: gw !== '192.168.0.1' },
        ]
      };
    },
    nota: '⚠️ RISCO: Alterar gateway pode DESCONECTAR o equipamento! Confirme com equipe de campo.',
    acesso_via_tunnel: true,
  },
];

// ═══════════════════════════════════════════════════════════════
// INTERFACE INTERATIVA (readline)
// ═══════════════════════════════════════════════════════════════

const rl = createInterface({ input: process.stdin, output: process.stdout });
const pergunta = (msg) => new Promise(resolve => rl.question(msg, resolve));

function cls() { console.clear(); }

function header(titulo) {
  console.log('\n' + '═'.repeat(70));
  console.log(`  ${titulo}`);
  console.log('═'.repeat(70));
}

function subheader(titulo) {
  console.log(`\n┌─── ${titulo}`);
}

// ═══════════════════════════════════════════════════════════════
// FUNÇÕES DE REDE (API da câmera)
// ═══════════════════════════════════════════════════════════════

async function autenticar(baseUrl) {
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
    return data.token || data.access_token || null;
  } catch { return null; }
  finally { clearTimeout(timeout); }
}

async function lerEndpoint(baseUrl, token, endpoint) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      signal: controller.signal,
    });
    if (!res.ok) return { _error: `HTTP ${res.status}` };
    return await res.json();
  } catch (e) { return { _error: e.message }; }
  finally { clearTimeout(timeout); }
}

async function gravarEndpoint(baseUrl, token, endpoint, payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const text = await res.text();
    return { ok: res.ok, status: res.status, body: text };
  } catch (e) { return { ok: false, status: 0, body: e.message }; }
  finally { clearTimeout(timeout); }
}

// ═══════════════════════════════════════════════════════════════
// LOG
// ═══════════════════════════════════════════════════════════════

const sessionLog = {
  inicio: new Date().toISOString(),
  operacoes: [],
};

function logOperacao(op) {
  sessionLog.operacoes.push({ ...op, timestamp: new Date().toISOString() });
}

function salvarLog() {
  if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true });
  const filename = `interativo-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const filepath = `${LOG_DIR}/${filename}`;
  sessionLog.fim = new Date().toISOString();
  sessionLog.resumo = {
    total: sessionLog.operacoes.length,
    aplicados: sessionLog.operacoes.filter(o => o.resultado === 'APLICADO').length,
    ja_ok: sessionLog.operacoes.filter(o => o.resultado === 'JA_CORRETO').length,
    falha: sessionLog.operacoes.filter(o => o.resultado === 'FALHA').length,
    cancelados: sessionLog.operacoes.filter(o => o.resultado === 'CANCELADO').length,
  };
  writeFileSync(filepath, JSON.stringify(sessionLog, null, 2));
  return filepath;
}

// ═══════════════════════════════════════════════════════════════
// FLUXO PRINCIPAL
// ═══════════════════════════════════════════════════════════════

async function menuPrincipal() {
  cls();
  header('PLANO DE CORREÇÃO INTERATIVO — ITScam 450 SETRANS-GO');
  console.log('\n  Selecione o CASO que deseja corrigir:\n');

  CASOS.forEach((caso, i) => {
    console.log(`  [${i + 1}] ${caso.severidade} ${caso.id} — ${caso.titulo} (${caso.equipamentos.length} equip.)`);
  });

  console.log('\n  [D] Diagnóstico rápido — verificar TODOS os equipamentos');
  console.log('  [Q] Sair\n');

  const resp = await pergunta('  Opção: ');
  
  if (resp.toUpperCase() === 'Q') return 'sair';
  if (resp.toUpperCase() === 'D') return 'diagnostico';
  
  const num = parseInt(resp);
  if (num >= 1 && num <= 8) return num - 1;
  
  console.log('  ❌ Opção inválida.');
  await pergunta('  [Enter para continuar]');
  return menuPrincipal();
}

async function menuEquipamento(caso) {
  header(`${caso.id} — ${caso.titulo}`);
  console.log(`\n  ${caso.descricao}`);
  console.log(`  Severidade: ${caso.severidade}`);
  console.log(`  Tela: ${caso.tela}`);
  if (caso.nota) console.log(`\n  ${caso.nota}`);
  
  console.log('\n  Equipamentos afetados:\n');
  caso.equipamentos.forEach((eq, i) => {
    const tunnel = caso.acesso_via_tunnel 
      ? `https://${eq.uuid}-80.tunnel.varco.cloud`
      : `http://${eq.ip}`;
    console.log(`  [${i + 1}] ${eq.nome} — ${tunnel}`);
  });

  console.log(`\n  [T] Corrigir TODOS (com confirmação individual)`);
  console.log(`  [V] Apenas VALIDAR todos (leitura, sem alteração)`);
  console.log(`  [M] Voltar ao menu\n`);

  const resp = await pergunta('  Opção: ');
  
  if (resp.toUpperCase() === 'M') return 'menu';
  if (resp.toUpperCase() === 'T') return 'todos';
  if (resp.toUpperCase() === 'V') return 'validar';
  
  const num = parseInt(resp);
  if (num >= 1 && num <= caso.equipamentos.length) return num - 1;
  
  console.log('  ❌ Opção inválida.');
  await pergunta('  [Enter para continuar]');
  return menuEquipamento(caso);
}

async function processarEquipamento(caso, equip, modoValidacao = false) {
  subheader(`${equip.nome}`);
  
  const baseUrl = caso.acesso_via_tunnel 
    ? TUNNEL_BASE.replace('{UUID}', equip.uuid)
    : `http://${equip.ip}`;
  
  console.log(`│  URL: ${baseUrl}`);
  process.stdout.write('│  Autenticando...');
  
  const token = await autenticar(baseUrl);
  if (!token) {
    console.log(' ❌ FALHA (equipamento offline ou inacessível)');
    logOperacao({ caso: caso.id, equip: equip.nome, resultado: 'FALHA', erro: 'AUTH_FAILED' });
    return { sucesso: false, motivo: 'AUTH_FAILED' };
  }
  console.log(' ✅ OK');
  
  // Ler configuração atual
  process.stdout.write('│  Lendo configuração atual...');
  const dadosAtuais = await lerEndpoint(baseUrl, token, caso.endpoint_leitura);
  if (dadosAtuais._error) {
    console.log(` ❌ Erro: ${dadosAtuais._error}`);
    logOperacao({ caso: caso.id, equip: equip.nome, resultado: 'FALHA', erro: dadosAtuais._error });
    return { sucesso: false, motivo: dadosAtuais._error };
  }
  console.log(' ✅ OK');
  
  // Validar
  const validacao = caso.validar(dadosAtuais);
  
  console.log('│');
  console.log('│  ┌──────────────────────────────────────────────────────────');
  console.log('│  │  DIAGNÓSTICO:');
  
  if (!validacao.precisaCorrecao) {
    console.log('│  │  ✅ EQUIPAMENTO JÁ ESTÁ CORRETO — nada a alterar');
    console.log('│  └──────────────────────────────────────────────────────────');
    logOperacao({ caso: caso.id, equip: equip.nome, resultado: 'JA_CORRETO' });
    return { sucesso: true, motivo: 'JA_CORRETO' };
  }
  
  console.log('│  │');
  console.log('│  │  Campo                          │ Atual        │ Correto      │ Status');
  console.log('│  │  ─────────────────────────────────────────────────────────────────────');
  
  for (const campo of validacao.campos) {
    const status = campo.errado ? '❌ ERRADO' : '✅ OK';
    const atual = String(campo.atual).padEnd(12);
    const correto = String(campo.correto).padEnd(12);
    const nome = campo.campo.padEnd(30);
    console.log(`│  │  ${nome} │ ${atual} │ ${correto} │ ${status}`);
  }
  
  console.log('│  └──────────────────────────────────────────────────────────');
  
  if (modoValidacao) {
    logOperacao({ caso: caso.id, equip: equip.nome, resultado: 'VALIDADO', campos: validacao.campos });
    return { sucesso: true, motivo: 'VALIDADO' };
  }
  
  // Pedir confirmação
  console.log('│');
  const confirmacao = await pergunta('│  ❓ Aplicar correção neste equipamento? (S/N): ');
  
  if (confirmacao.toUpperCase() !== 'S') {
    console.log('│  ⏭️  Pulado pelo operador.');
    logOperacao({ caso: caso.id, equip: equip.nome, resultado: 'CANCELADO' });
    return { sucesso: true, motivo: 'CANCELADO' };
  }
  
  // Aplicar correção
  process.stdout.write('│  Aplicando correção...');
  
  let resultadoOk = true;
  
  if (caso.multi_endpoint) {
    // Casos 03 e 05: precisa gravar nos 2 perfis separadamente
    for (let perfIdx = 0; perfIdx <= 1; perfIdx++) {
      const endpoint = perfIdx === 0 ? caso.endpoint_escrita_diurno : caso.endpoint_escrita_noturno;
      const payload = caso.buildPayload(equip, dadosAtuais, perfIdx);
      const resultado = await gravarEndpoint(baseUrl, token, endpoint, payload);
      if (!resultado.ok) {
        console.log(` ❌ Erro no perfil ${perfIdx === 0 ? 'Diurno' : 'Noturno'}: ${resultado.status}`);
        resultadoOk = false;
        break;
      }
    }
    if (resultadoOk) console.log(' ✅ Ambos os perfis atualizados');
  } else {
    const payload = caso.buildPayload(equip, dadosAtuais);
    const resultado = await gravarEndpoint(baseUrl, token, caso.endpoint_escrita, payload);
    if (resultado.ok) {
      console.log(' ✅ Aplicado com sucesso');
    } else {
      console.log(` ❌ Erro HTTP ${resultado.status}: ${resultado.body.substring(0, 100)}`);
      resultadoOk = false;
    }
  }
  
  if (resultadoOk) {
    // Re-ler para confirmar
    process.stdout.write('│  Verificando resultado...');
    const dadosNovos = await lerEndpoint(baseUrl, token, caso.endpoint_leitura);
    const validacaoNova = caso.validar(dadosNovos);
    if (!validacaoNova.precisaCorrecao) {
      console.log(' ✅ CONFIRMADO — valores corretos!');
      logOperacao({ caso: caso.id, equip: equip.nome, resultado: 'APLICADO', backup: dadosAtuais });
    } else {
      console.log(' ⚠️ Valores ainda divergem (pode precisar de reinício)');
      logOperacao({ caso: caso.id, equip: equip.nome, resultado: 'APLICADO_PARCIAL', backup: dadosAtuais });
    }
  } else {
    logOperacao({ caso: caso.id, equip: equip.nome, resultado: 'FALHA', backup: dadosAtuais });
  }
  
  return { sucesso: resultadoOk, motivo: resultadoOk ? 'APLICADO' : 'FALHA' };
}

async function diagnosticoRapido() {
  header('DIAGNÓSTICO RÁPIDO — Verificar status de TODOS os equipamentos');
  console.log('\n  Conectando a cada equipamento para verificar configuração atual...\n');
  
  const inventory = JSON.parse(readFileSync(INVENTORY_FILE, 'utf8'));
  let online = 0, offline = 0;
  
  for (const device of inventory) {
    const baseUrl = TUNNEL_BASE.replace('{UUID}', device.uuid);
    process.stdout.write(`  ${device.name.padEnd(25)}`);
    const token = await autenticar(baseUrl);
    if (token) {
      console.log('✅ ONLINE');
      online++;
    } else {
      console.log('❌ OFFLINE');
      offline++;
    }
  }
  
  console.log(`\n  Resultado: ${online} online, ${offline} offline, ${inventory.length} total`);
  await pergunta('\n  [Enter para voltar ao menu]');
}

async function executarCaso(casoIndex) {
  const caso = CASOS[casoIndex];
  const opcao = await menuEquipamento(caso);
  
  if (opcao === 'menu') return;
  
  if (opcao === 'validar') {
    console.log('\n  📋 MODO VALIDAÇÃO — Apenas leitura, sem alterações\n');
    for (const equip of caso.equipamentos) {
      await processarEquipamento(caso, equip, true);
    }
    await pergunta('\n  [Enter para voltar ao menu]');
    return;
  }
  
  if (opcao === 'todos') {
    console.log('\n  🔄 MODO CORREÇÃO EM CADEIA — Confirmação individual para cada equipamento\n');
    const resultados = { aplicados: 0, ja_ok: 0, falha: 0, cancelados: 0 };
    
    for (const equip of caso.equipamentos) {
      const r = await processarEquipamento(caso, equip, false);
      if (r.motivo === 'APLICADO') resultados.aplicados++;
      else if (r.motivo === 'JA_CORRETO') resultados.ja_ok++;
      else if (r.motivo === 'CANCELADO') resultados.cancelados++;
      else resultados.falha++;
      console.log('│');
    }
    
    console.log('\n  ═══ RESUMO DA CADEIA ═══');
    console.log(`  ✅ Aplicados: ${resultados.aplicados}`);
    console.log(`  ✅ Já corretos: ${resultados.ja_ok}`);
    console.log(`  ⏭️  Cancelados: ${resultados.cancelados}`);
    console.log(`  ❌ Falha: ${resultados.falha}`);
    await pergunta('\n  [Enter para voltar ao menu]');
    return;
  }
  
  // Equipamento individual
  if (typeof opcao === 'number') {
    await processarEquipamento(caso, caso.equipamentos[opcao], false);
    await pergunta('\n  [Enter para voltar ao menu]');
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
  console.log('\n  Carregando inventário...');
  if (!existsSync(INVENTORY_FILE)) {
    console.error(`  ❌ Arquivo não encontrado: ${INVENTORY_FILE}`);
    console.error('  Execute a partir da raiz do projeto.');
    process.exit(1);
  }
  
  while (true) {
    const opcao = await menuPrincipal();
    
    if (opcao === 'sair') {
      const logFile = salvarLog();
      console.log(`\n  📄 Log salvo em: ${logFile}`);
      console.log('  Até logo!\n');
      rl.close();
      return;
    }
    
    if (opcao === 'diagnostico') {
      await diagnosticoRapido();
      continue;
    }
    
    if (typeof opcao === 'number') {
      await executarCaso(opcao);
    }
  }
}

main().catch(e => {
  console.error('Erro fatal:', e);
  process.exit(1);
});
