/**
 * ══════════════════════════════════════════════════════════════
 * APLICAR CORREÇÃO — ITScam 450 (modo direto, não-interativo)
 * ══════════════════════════════════════════════════════════════
 * 
 * Aplica correção num equipamento ou em todos de um caso.
 * OBRIGATÓRIO informar --caso e (--equip OU --todos).
 * 
 * USO:
 *   node auditoria-itscam/corrigir.mjs --caso=03 --equip=GOEC6O033   → 1 equipamento
 *   node auditoria-itscam/corrigir.mjs --caso=04 --todos             → todos do caso (pede S/N)
 *   node auditoria-itscam/corrigir.mjs --caso=06 --todos --sim       → todos sem confirmar
 * 
 * FLAGS:
 *   --caso=XX      Obrigatório. Número do caso (01-08)
 *   --equip=XXX    Filtra por nome do equipamento (parcial)
 *   --todos        Corrige todos os equipamentos do caso
 *   --sim          Não pede confirmação (cuidado!)
 *   --dry          Simula sem aplicar (mostra payload)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { createInterface } from 'readline';

const TUNNEL_BASE = 'https://{UUID}-80.tunnel.varco.cloud';
const CREDENTIALS = { username: 'admin', password: '#econocr@' };
const TIMEOUT_MS = 25000;
const LOG_DIR = './auditoria-itscam/logs-correcao';

const args = process.argv.slice(2);
const getArg = (name) => args.find(a => a.startsWith(`--${name}=`))?.split('=')[1] || null;
const hasFlag = (name) => args.includes(`--${name}`);

const CASO_ID = getArg('caso');
const FILTRO_EQUIP = getArg('equip');
const TODOS = hasFlag('todos');
const AUTO_SIM = hasFlag('sim');
const DRY_RUN = hasFlag('dry');

if (!CASO_ID) {
  console.log(`
  USO:
    node auditoria-itscam/corrigir.mjs --caso=03 --equip=GOEC6O033
    node auditoria-itscam/corrigir.mjs --caso=04 --todos
    node auditoria-itscam/corrigir.mjs --caso=06 --todos --sim
    node auditoria-itscam/corrigir.mjs --caso=03 --equip=040 --dry
  `);
  process.exit(0);
}

if (!FILTRO_EQUIP && !TODOS) {
  console.log('\n  ❌ Informe --equip=NOME ou --todos\n');
  process.exit(1);
}

// ═══════════════════════════════════════════════════════════════
// CASOS
// ═══════════════════════════════════════════════════════════════

const CASOS = {
  '01': {
    titulo: 'VARCO Desabilitado',
    endpoint_leitura: '/api/system/maintenance/remoteaccess',
    endpoint_escrita: '/api/system/maintenance/remoteaccess',
    equipamentos: [
      { nome: 'GOEC6O019 - Faixa 1', uuid: '6f6eddc7-f900-4d4f-8040-f7d1775d1d1d', ip: '45.70.144.143' },
      { nome: 'GOEC6O019 - Faixa 2', uuid: 'b8925732-54cf-4f01-b4ec-c8bcb1b3bd2e', ip: '45.70.144.143' },
      { nome: 'GOEC6O023 - Faixa 1', uuid: '64e60ba4-79b7-4447-b726-a3f032327907', ip: '177.25.228.3' },
      { nome: 'GOEC6O049 - Faixa 1', uuid: 'ad0db63e-bb6e-4cb1-99eb-960f486cb692', ip: '191.58.159.123' },
      { nome: 'GOEC6O049 - Faixa 2', uuid: '3a8b23c7-edf3-43d3-b9be-9211674777e3', ip: '191.58.159.123' },
      { nome: 'GOEC6O052 - Faixa 1', uuid: '49cbc26f-7a42-47d6-9d32-bc66f740e886', ip: '187.68.165.85' },
    ],
    buildPayload: (equip) => ({
      remoteAccess: { varco: { enabled: true, edgeServer: 'edge.varco.io', provisionKey: 'yk-pzGzXLGmz6-iO3GhdR7hinksDN7aek-kjQ4WYl_c=', deviceName: equip.nome.toUpperCase() } }
    }),
    validar: (d) => {
      const v = d?.remoteAccess?.varco || d?.varco || {};
      return { ok: v.enabled === true, erros: v.enabled !== true ? [`enabled=${v.enabled}`] : [] };
    },
    acesso_local: true,
  },
  '02': {
    titulo: 'Câmera P&B (profile=23483→0)',
    endpoint_leitura: '/api/image/profiles',
    endpoint_escrita: '/api/image/profiles/1',
    equipamentos: [
      { nome: 'GOEC6O008 - Faixa 1', uuid: '5d6880f0-e8f2-4ff0-be25-00c3b31d6522' },
    ],
    buildPayload: (equip, data) => {
      const profiles = Array.isArray(data) ? data : data?.profiles || [];
      const noturno = JSON.parse(JSON.stringify(profiles[1] || {}));
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
    validar: (d) => {
      const profiles = Array.isArray(d) ? d : d?.profiles || [];
      const up = profiles[1]?.transitions?.upper || {};
      const erros = [];
      if (up.profile !== 0) erros.push(`upper.profile=${up.profile} (correto: 0)`);
      if (up.level !== 35) erros.push(`upper.level=${up.level} (correto: 35)`);
      return { ok: erros.length === 0, erros };
    },
  },
  '03': {
    titulo: 'Transições com Horário → 00:00:00',
    endpoint_leitura: '/api/image/profiles',
    multi_endpoint: true,
    endpoints_escrita: ['/api/image/profiles/0', '/api/image/profiles/1'],
    equipamentos: [
      { nome: 'GOEC6O033 - Faixa 2', uuid: '34ebe844-ba8e-49f4-bc6f-45d5724ee381' },
      { nome: 'GOEC6O040 - Faixa 1', uuid: '9b5328e3-104b-4afc-b3ce-8880066ca995' },
      { nome: 'GOEC6O040 - Faixa 2', uuid: '416aff7e-4c34-4356-bbac-aa66d34ffead' },
      { nome: 'GOEC6O055 - Faixa 1', uuid: '1d0b2132-a825-4823-ab8f-8ce4aa829138' },
      { nome: 'GOEC6O055 - Faixa 2', uuid: 'fe5f7cf3-a8dd-41e8-b975-72921dbddeac' },
    ],
    buildPayload: (equip, data, idx) => {
      const profiles = Array.isArray(data) ? data : data?.profiles || [];
      const perfil = JSON.parse(JSON.stringify(profiles[idx] || {}));
      if (perfil.transitions) {
        perfil.transitions.lower.startTime = '00:00:00';
        perfil.transitions.lower.endTime = '00:00:00';
        perfil.transitions.lower.level = 10;
        perfil.transitions.lower.holdTime = 60000;
        perfil.transitions.upper.startTime = '00:00:00';
        perfil.transitions.upper.endTime = '00:00:00';
        perfil.transitions.upper.level = 35;
        perfil.transitions.upper.holdTime = 60000;
        if (idx === 1) perfil.transitions.upper.profile = 0;
      }
      return perfil;
    },
    validar: (d) => {
      const profiles = Array.isArray(d) ? d : d?.profiles || [];
      const erros = [];
      profiles.forEach((p, i) => {
        const t = p?.transitions || {};
        ['lower', 'upper'].forEach(tipo => {
          if (t[tipo]?.startTime !== '00:00:00') erros.push(`P${i}.${tipo}.startTime=${t[tipo]?.startTime}`);
          if (t[tipo]?.endTime !== '00:00:00') erros.push(`P${i}.${tipo}.endTime=${t[tipo]?.endTime}`);
        });
      });
      return { ok: erros.length === 0, erros };
    },
  },
  '04': {
    titulo: 'Classificador → queue=1, threads=1',
    endpoint_leitura: '/api/equipment/classifier',
    endpoint_escrita: '/api/equipment/classifier',
    equipamentos: [
      { nome: 'GOEC6O010 - Faixa 1', uuid: 'abf8fedb-4f1b-471f-a6bd-4e00484d5737' },
      { nome: 'GOEC6O010 - Faixa 2', uuid: '481dd19b-4968-4759-860b-35f9ec09c206' },
      { nome: 'GOEC6O011 - Faixa 2', uuid: 'd0595c80-9ea7-49af-b2a0-d305d688e567' },
      { nome: 'GOEC6O028 - Faixa 1', uuid: '1f460cd7-f607-4c79-8a8e-50a8228850a4' },
      { nome: 'GOEC6O052 - Faixa 2', uuid: '8244f568-59f3-4f27-932e-86cc2eb10fc3' },
      { nome: 'GOEC6O058 - Faixa 2', uuid: '6561d5fd-0aba-413b-a60a-a0d7e1b61b6d' },
    ],
    buildPayload: () => ({ classifier: { processingQueue: 1, processingThreads: 1 } }),
    validar: (d) => {
      const c = d?.classifier || d || {};
      const erros = [];
      if (c.processingQueue !== 1) erros.push(`queue=${c.processingQueue}`);
      if (c.processingThreads !== 1) erros.push(`threads=${c.processingThreads}`);
      return { ok: erros.length === 0, erros };
    },
  },
  '05': {
    titulo: 'Level → lower=10, upper=35',
    endpoint_leitura: '/api/image/profiles',
    multi_endpoint: true,
    endpoints_escrita: ['/api/image/profiles/0', '/api/image/profiles/1'],
    equipamentos: [
      { nome: 'GOEC6O009 - Faixa 1', uuid: 'c296d7bf-0d3b-4da1-bf1d-3e4fe998e4a1' },
      { nome: 'GOEC6O009 - Faixa 2', uuid: 'ef0e72ca-d3a5-4f4e-bbf6-40f3737bda3f' },
      { nome: 'GOEC6O013 - Faixa 2', uuid: '36896650-1bca-4093-9631-667b73bdd93d' },
      { nome: 'GOEC6O008 - Faixa 1', uuid: '5d6880f0-e8f2-4ff0-be25-00c3b31d6522' },
    ],
    buildPayload: (equip, data, idx) => {
      const profiles = Array.isArray(data) ? data : data?.profiles || [];
      const perfil = JSON.parse(JSON.stringify(profiles[idx] || {}));
      if (perfil.transitions) {
        perfil.transitions.lower.level = 10;
        perfil.transitions.upper.level = 35;
      }
      return perfil;
    },
    validar: (d) => {
      const profiles = Array.isArray(d) ? d : d?.profiles || [];
      const erros = [];
      profiles.forEach((p, i) => {
        if (p?.transitions?.lower?.level !== 10) erros.push(`P${i}.lower.level=${p?.transitions?.lower?.level}`);
        if (p?.transitions?.upper?.level !== 35) erros.push(`P${i}.upper.level=${p?.transitions?.upper?.level}`);
      });
      return { ok: erros.length === 0, erros };
    },
  },
  '06': {
    titulo: 'OCR maxPlates → 2',
    endpoint_leitura: '/api/equipment/ocr',
    endpoint_escrita: '/api/equipment/ocr',
    equipamentos: [
      { nome: 'GOEC6O009 - Faixa 2', uuid: 'ef0e72ca-d3a5-4f4e-bbf6-40f3737bda3f' },
      { nome: 'GOEC6O055 - Faixa 2', uuid: 'fe5f7cf3-a8dd-41e8-b975-72921dbddeac' },
    ],
    buildPayload: (equip, data) => {
      const ocr = data?.ocr ? JSON.parse(JSON.stringify(data.ocr)) : {};
      ocr.maxPlates = 2;
      return { ocr };
    },
    validar: (d) => {
      const o = d?.ocr || d || {};
      return { ok: o.maxPlates === 2, erros: o.maxPlates !== 2 ? [`maxPlates=${o.maxPlates}`] : [] };
    },
  },
  '07': {
    titulo: 'Snapshot Crop → desabilitado',
    endpoint_leitura: '/api/equipment/misc',
    endpoint_escrita: '/api/equipment/misc',
    equipamentos: [
      { nome: 'GOEC6O003 - Faixa 2', uuid: 'ea779324-56d4-4ea5-bfb6-63b4cf751621' },
      { nome: 'GOEC6O008 - Faixa 1', uuid: '5d6880f0-e8f2-4ff0-be25-00c3b31d6522' },
      { nome: 'GOEC6O013 - Faixa 1', uuid: '7d9bf2eb-0f9a-4691-bffd-e003fc3781ed' },
    ],
    buildPayload: (equip, data) => {
      const misc = data ? JSON.parse(JSON.stringify(data)) : {};
      if (misc.snapshotCrop) misc.snapshotCrop.enable = false;
      else misc.snapshotCrop = { enable: false, mode: 'static' };
      return misc;
    },
    validar: (d) => {
      const sc = d?.snapshotCrop || {};
      return { ok: sc.enable === false, erros: sc.enable !== false ? [`enable=${sc.enable}`] : [] };
    },
  },
  '08': {
    titulo: 'Gateway → 192.168.0.1',
    endpoint_leitura: '/api/system/network/ethernet',
    endpoint_escrita: '/api/system/network/ethernet',
    equipamentos: [
      { nome: 'GOEC6O046 - Faixa 1', uuid: '1e26be92-70e4-468f-a582-4e015282a4fe' },
      { nome: 'GOEC6O046 - Faixa 2', uuid: '4d68163e-8462-4dce-adad-df3b0d7c76af' },
    ],
    buildPayload: (equip, data) => {
      const net = data ? JSON.parse(JSON.stringify(data)) : {};
      if (net.ipv4Primary) net.ipv4Primary.gateway = '192.168.0.1';
      return net;
    },
    validar: (d) => {
      const gw = d?.ipv4Primary?.gateway;
      return { ok: gw === '192.168.0.1', erros: gw !== '192.168.0.1' ? [`gateway=${gw}`] : [] };
    },
    nota: '⚠️ CUIDADO: Alterar gateway pode desconectar o equipamento!',
  },
};

// ═══════════════════════════════════════════════════════════════
// FUNÇÕES
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
    return data.token || data.access_token || null;
  } catch { return null; }
}

async function ler(baseUrl, token, endpoint) {
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    const res = await fetch(`${baseUrl}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}` }, signal: ctrl.signal,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function gravar(baseUrl, token, endpoint, payload) {
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    const res = await fetch(`${baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), signal: ctrl.signal,
    });
    return { ok: res.ok, status: res.status };
  } catch (e) { return { ok: false, status: 0, erro: e.message }; }
}

async function confirmar(msg) {
  if (AUTO_SIM) return true;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(`  ${msg} (S/N): `, resp => {
      rl.close();
      resolve(resp.toUpperCase() === 'S');
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
  const casoNum = CASO_ID.padStart(2, '0');
  const caso = CASOS[casoNum];
  
  if (!caso) {
    console.log(`\n  ❌ Caso "${CASO_ID}" não existe. Use 01-08.\n`);
    process.exit(1);
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  CORREÇÃO — CASO ${casoNum}: ${caso.titulo}`);
  console.log(`  Modo: ${DRY_RUN ? '🔍 DRY-RUN (simulação)' : '⚡ APLICAÇÃO REAL'}`);
  if (caso.nota) console.log(`  ${caso.nota}`);
  console.log('═══════════════════════════════════════════════════════════════');

  let equips = caso.equipamentos;
  if (FILTRO_EQUIP) {
    equips = equips.filter(e => e.nome.toLowerCase().includes(FILTRO_EQUIP.toLowerCase()));
    if (equips.length === 0) {
      console.log(`\n  ❌ Nenhum equipamento encontrado com "${FILTRO_EQUIP}"\n`);
      process.exit(1);
    }
  }

  if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true });
  const log = { caso: casoNum, inicio: new Date().toISOString(), operacoes: [] };
  
  const res = { aplicados: 0, ja_ok: 0, falha: 0, cancelados: 0 };

  for (const equip of equips) {
    console.log(`\n┌─── ${equip.nome}`);
    
    if (caso.acesso_local) {
      console.log(`│  ⚠️  Este caso requer ACESSO LOCAL via IP: ${equip.ip}`);
      console.log(`│  O tunnel não funciona pois VARCO está desabilitado.`);
      console.log(`│  Use: http://${equip.ip} no navegador.`);
      res.falha++;
      continue;
    }

    const baseUrl = TUNNEL_BASE.replace('{UUID}', equip.uuid);
    
    // 1) Autenticar
    process.stdout.write(`│  Conectando...`);
    const token = await autenticar(baseUrl);
    if (!token) {
      console.log(' ❌ OFFLINE');
      log.operacoes.push({ equip: equip.nome, resultado: 'OFFLINE' });
      res.falha++;
      continue;
    }
    console.log(' ✅');
    
    // 2) Ler atual
    process.stdout.write(`│  Lendo config...`);
    const dados = await ler(baseUrl, token, caso.endpoint_leitura);
    if (!dados) {
      console.log(' ❌ ERRO');
      log.operacoes.push({ equip: equip.nome, resultado: 'ERRO_LEITURA' });
      res.falha++;
      continue;
    }
    console.log(' ✅');
    
    // 3) Validar
    const val = caso.validar(dados);
    if (val.ok) {
      console.log(`│  ✅ JÁ CORRETO — nada a alterar`);
      log.operacoes.push({ equip: equip.nome, resultado: 'JA_OK' });
      res.ja_ok++;
      continue;
    }
    
    console.log(`│  ❌ Erros encontrados:`);
    for (const e of val.erros) {
      console.log(`│     • ${e}`);
    }
    
    // 4) DRY-RUN?
    if (DRY_RUN) {
      if (caso.multi_endpoint) {
        for (let i = 0; i < caso.endpoints_escrita.length; i++) {
          const payload = caso.buildPayload(equip, dados, i);
          console.log(`│  [DRY] PUT ${caso.endpoints_escrita[i]}`);
          console.log(`│  [DRY] Payload: ${JSON.stringify(payload).substring(0, 120)}...`);
        }
      } else {
        const payload = caso.buildPayload(equip, dados);
        console.log(`│  [DRY] PUT ${caso.endpoint_escrita}`);
        console.log(`│  [DRY] Payload: ${JSON.stringify(payload).substring(0, 120)}...`);
      }
      log.operacoes.push({ equip: equip.nome, resultado: 'DRY_RUN' });
      continue;
    }
    
    // 5) Confirmar
    const ok = await confirmar(`❓ Aplicar correção em ${equip.nome}?`);
    if (!ok) {
      console.log(`│  ⏭️  Cancelado`);
      log.operacoes.push({ equip: equip.nome, resultado: 'CANCELADO' });
      res.cancelados++;
      continue;
    }
    
    // 6) Aplicar
    process.stdout.write(`│  Aplicando...`);
    let sucesso = true;
    
    if (caso.multi_endpoint) {
      for (let i = 0; i < caso.endpoints_escrita.length; i++) {
        const payload = caso.buildPayload(equip, dados, i);
        const r = await gravar(baseUrl, token, caso.endpoints_escrita[i], payload);
        if (!r.ok) { sucesso = false; console.log(` ❌ Erro no perfil ${i}`); break; }
      }
      if (sucesso) console.log(' ✅ Ambos os perfis');
    } else {
      const payload = caso.buildPayload(equip, dados);
      const r = await gravar(baseUrl, token, caso.endpoint_escrita, payload);
      if (r.ok) console.log(' ✅');
      else { sucesso = false; console.log(` ❌ HTTP ${r.status}`); }
    }
    
    // 7) Verificar
    if (sucesso) {
      process.stdout.write(`│  Verificando...`);
      const dadosNovos = await ler(baseUrl, token, caso.endpoint_leitura);
      const valNova = caso.validar(dadosNovos || {});
      if (valNova.ok) {
        console.log(' ✅ CONFIRMADO');
        log.operacoes.push({ equip: equip.nome, resultado: 'APLICADO', backup: dados });
        res.aplicados++;
      } else {
        console.log(` ⚠️ Ainda com erros: ${valNova.erros.join(', ')}`);
        log.operacoes.push({ equip: equip.nome, resultado: 'PARCIAL', backup: dados });
        res.aplicados++;
      }
    } else {
      log.operacoes.push({ equip: equip.nome, resultado: 'FALHA', backup: dados });
      res.falha++;
    }
  }

  // Salvar log
  log.fim = new Date().toISOString();
  log.resumo = res;
  const logFile = `${LOG_DIR}/correcao-caso${casoNum}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  writeFileSync(logFile, JSON.stringify(log, null, 2));

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  ✅ Aplicados: ${res.aplicados} | ✅ Já OK: ${res.ja_ok} | ⏭️ Cancelados: ${res.cancelados} | ❌ Falha: ${res.falha}`);
  console.log(`  📄 Log: ${logFile}`);
  console.log('═══════════════════════════════════════════════════════════════\n');
}

main().catch(console.error);
