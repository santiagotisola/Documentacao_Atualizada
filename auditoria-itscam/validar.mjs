/**
 * ══════════════════════════════════════════════════════════════
 * VALIDAR CORREÇÕES — ITScam 450 (modo não-interativo)
 * ══════════════════════════════════════════════════════════════
 * 
 * Conecta nos equipamentos e mostra o que precisa corrigir,
 * SEM ALTERAR NADA. Apenas leitura.
 * 
 * USO RÁPIDO:
 *   node auditoria-itscam/validar.mjs                    → Valida TODOS os casos
 *   node auditoria-itscam/validar.mjs --caso=03          → Valida só o CASO 03
 *   node auditoria-itscam/validar.mjs --equip=GOEC6O008  → Valida só um equipamento
 *   node auditoria-itscam/validar.mjs --caso=02 --equip=GOEC6O008
 * 
 * PARA APLICAR CORREÇÃO (após validar):
 *   node auditoria-itscam/corrigir.mjs --caso=03 --equip=GOEC6O033  → Corrige 1 equip.
 *   node auditoria-itscam/corrigir.mjs --caso=03 --todos            → Corrige todos do caso
 *   node auditoria-itscam/corrigir.mjs --caso=03 --todos --sim      → Sem pedir confirmação
 */

import { readFileSync, existsSync } from 'fs';

const TUNNEL_BASE = 'https://{UUID}-80.tunnel.varco.cloud';
const CREDENTIALS = { username: 'admin', password: '#econocr@' };
const TIMEOUT_MS = 20000;

// ═══════════════════════════════════════════════════════════════
// PARSE ARGS
// ═══════════════════════════════════════════════════════════════

const args = process.argv.slice(2);
const getArg = (name) => args.find(a => a.startsWith(`--${name}=`))?.split('=')[1] || null;
const hasFlag = (name) => args.includes(`--${name}`);

const FILTRO_CASO = getArg('caso');    // ex: "03" ou "3"
const FILTRO_EQUIP = getArg('equip');  // ex: "GOEC6O008" ou "008"

// ═══════════════════════════════════════════════════════════════
// CASOS (dados mínimos para validação)
// ═══════════════════════════════════════════════════════════════

const CASOS = [
  {
    id: '01', titulo: 'VARCO Desabilitado', severidade: '🔴',
    endpoint: '/api/system/maintenance/remoteaccess',
    equipamentos: [
      { nome: 'GOEC6O019 - Faixa 1', uuid: '6f6eddc7-f900-4d4f-8040-f7d1775d1d1d' },
      { nome: 'GOEC6O019 - Faixa 2', uuid: 'b8925732-54cf-4f01-b4ec-c8bcb1b3bd2e' },
      { nome: 'GOEC6O023 - Faixa 1', uuid: '64e60ba4-79b7-4447-b726-a3f032327907' },
      { nome: 'GOEC6O049 - Faixa 1', uuid: 'ad0db63e-bb6e-4cb1-99eb-960f486cb692' },
      { nome: 'GOEC6O049 - Faixa 2', uuid: '3a8b23c7-edf3-43d3-b9be-9211674777e3' },
      { nome: 'GOEC6O052 - Faixa 1', uuid: '49cbc26f-7a42-47d6-9d32-bc66f740e886' },
    ],
    validar: (d) => {
      const v = d?.remoteAccess?.varco || d?.varco || {};
      return [
        { campo: 'varco.enabled', atual: v.enabled ?? 'null', correto: true, ok: v.enabled === true },
        { campo: 'varco.edgeServer', atual: v.edgeServer ?? 'null', correto: 'edge.varco.io', ok: v.edgeServer === 'edge.varco.io' },
      ];
    },
    acesso_local: true, // não acessa via tunnel pois VARCO está desabilitado
  },
  {
    id: '02', titulo: 'Câmera P&B (profile errado)', severidade: '🔴',
    endpoint: '/api/image/profiles',
    equipamentos: [
      { nome: 'GOEC6O008 - Faixa 1', uuid: '5d6880f0-e8f2-4ff0-be25-00c3b31d6522' },
    ],
    validar: (d) => {
      const profiles = Array.isArray(d) ? d : d?.profiles || [];
      const n = profiles[1]?.transitions || {};
      return [
        { campo: 'Noturno.upper.profile', atual: n.upper?.profile, correto: 0, ok: n.upper?.profile === 0 },
        { campo: 'Noturno.upper.level', atual: n.upper?.level, correto: 35, ok: n.upper?.level === 35 },
        { campo: 'Noturno.upper.startTime', atual: n.upper?.startTime, correto: '00:00:00', ok: n.upper?.startTime === '00:00:00' },
        { campo: 'Noturno.lower.endTime', atual: n.lower?.endTime, correto: '00:00:00', ok: n.lower?.endTime === '00:00:00' },
        { campo: 'Diurno.upper.startTime', atual: profiles[0]?.transitions?.upper?.startTime, correto: '00:00:00', ok: profiles[0]?.transitions?.upper?.startTime === '00:00:00' },
        { campo: 'Diurno.upper.level', atual: profiles[0]?.transitions?.upper?.level, correto: 35, ok: profiles[0]?.transitions?.upper?.level === 35 },
      ];
    },
  },
  {
    id: '03', titulo: 'Transições com Horário', severidade: '🟠',
    endpoint: '/api/image/profiles',
    equipamentos: [
      { nome: 'GOEC6O033 - Faixa 2', uuid: '34ebe844-ba8e-49f4-bc6f-45d5724ee381' },
      { nome: 'GOEC6O040 - Faixa 1', uuid: '9b5328e3-104b-4afc-b3ce-8880066ca995' },
      { nome: 'GOEC6O040 - Faixa 2', uuid: '416aff7e-4c34-4356-bbac-aa66d34ffead' },
      { nome: 'GOEC6O055 - Faixa 1', uuid: '1d0b2132-a825-4823-ab8f-8ce4aa829138' },
      { nome: 'GOEC6O055 - Faixa 2', uuid: 'fe5f7cf3-a8dd-41e8-b975-72921dbddeac' },
    ],
    validar: (d) => {
      const profiles = Array.isArray(d) ? d : d?.profiles || [];
      const campos = [];
      ['Diurno', 'Noturno'].forEach((nome, idx) => {
        const t = profiles[idx]?.transitions || {};
        campos.push({ campo: `${nome}.lower.startTime`, atual: t.lower?.startTime, correto: '00:00:00', ok: t.lower?.startTime === '00:00:00' });
        campos.push({ campo: `${nome}.lower.endTime`, atual: t.lower?.endTime, correto: '00:00:00', ok: t.lower?.endTime === '00:00:00' });
        campos.push({ campo: `${nome}.upper.startTime`, atual: t.upper?.startTime, correto: '00:00:00', ok: t.upper?.startTime === '00:00:00' });
        campos.push({ campo: `${nome}.upper.endTime`, atual: t.upper?.endTime, correto: '00:00:00', ok: t.upper?.endTime === '00:00:00' });
      });
      campos.push({ campo: 'Diurno.lower.level', atual: profiles[0]?.transitions?.lower?.level, correto: 10, ok: profiles[0]?.transitions?.lower?.level === 10 });
      return campos;
    },
  },
  {
    id: '04', titulo: 'Classificador queue/threads', severidade: '🔵',
    endpoint: '/api/equipment/classifier',
    equipamentos: [
      { nome: 'GOEC6O010 - Faixa 1', uuid: 'abf8fedb-4f1b-471f-a6bd-4e00484d5737' },
      { nome: 'GOEC6O010 - Faixa 2', uuid: '481dd19b-4968-4759-860b-35f9ec09c206' },
      { nome: 'GOEC6O011 - Faixa 2', uuid: 'd0595c80-9ea7-49af-b2a0-d305d688e567' },
      { nome: 'GOEC6O028 - Faixa 1', uuid: '1f460cd7-f607-4c79-8a8e-50a8228850a4' },
      { nome: 'GOEC6O052 - Faixa 2', uuid: '8244f568-59f3-4f27-932e-86cc2eb10fc3' },
      { nome: 'GOEC6O058 - Faixa 2', uuid: '6561d5fd-0aba-413b-a60a-a0d7e1b61b6d' },
    ],
    validar: (d) => {
      const c = d?.classifier || d || {};
      return [
        { campo: 'processingQueue', atual: c.processingQueue, correto: 1, ok: c.processingQueue === 1 },
        { campo: 'processingThreads', atual: c.processingThreads, correto: 1, ok: c.processingThreads === 1 },
      ];
    },
  },
  {
    id: '05', titulo: 'Níveis Level (10/35)', severidade: '🟡',
    endpoint: '/api/image/profiles',
    equipamentos: [
      { nome: 'GOEC6O009 - Faixa 1', uuid: 'c296d7bf-0d3b-4da1-bf1d-3e4fe998e4a1' },
      { nome: 'GOEC6O009 - Faixa 2', uuid: 'ef0e72ca-d3a5-4f4e-bbf6-40f3737bda3f' },
      { nome: 'GOEC6O013 - Faixa 2', uuid: '36896650-1bca-4093-9631-667b73bdd93d' },
      { nome: 'GOEC6O008 - Faixa 1', uuid: '5d6880f0-e8f2-4ff0-be25-00c3b31d6522' },
    ],
    validar: (d) => {
      const profiles = Array.isArray(d) ? d : d?.profiles || [];
      const campos = [];
      ['Diurno', 'Noturno'].forEach((nome, idx) => {
        const t = profiles[idx]?.transitions || {};
        campos.push({ campo: `${nome}.lower.level`, atual: t.lower?.level, correto: 10, ok: t.lower?.level === 10 });
        campos.push({ campo: `${nome}.upper.level`, atual: t.upper?.level, correto: 35, ok: t.upper?.level === 35 });
      });
      return campos;
    },
  },
  {
    id: '06', titulo: 'OCR maxPlates (1→2)', severidade: '🔵',
    endpoint: '/api/equipment/ocr',
    equipamentos: [
      { nome: 'GOEC6O009 - Faixa 2', uuid: 'ef0e72ca-d3a5-4f4e-bbf6-40f3737bda3f' },
      { nome: 'GOEC6O055 - Faixa 2', uuid: 'fe5f7cf3-a8dd-41e8-b975-72921dbddeac' },
    ],
    validar: (d) => {
      const o = d?.ocr || d || {};
      return [
        { campo: 'ocr.maxPlates', atual: o.maxPlates, correto: 2, ok: o.maxPlates === 2 },
      ];
    },
  },
  {
    id: '07', titulo: 'Snapshot Crop (desabilitar)', severidade: '🔵',
    endpoint: '/api/equipment/misc',
    equipamentos: [
      { nome: 'GOEC6O003 - Faixa 2', uuid: 'ea779324-56d4-4ea5-bfb6-63b4cf751621' },
      { nome: 'GOEC6O008 - Faixa 1', uuid: '5d6880f0-e8f2-4ff0-be25-00c3b31d6522' },
      { nome: 'GOEC6O013 - Faixa 1', uuid: '7d9bf2eb-0f9a-4691-bffd-e003fc3781ed' },
    ],
    validar: (d) => {
      const sc = d?.snapshotCrop || {};
      return [
        { campo: 'snapshotCrop.enable', atual: sc.enable, correto: false, ok: sc.enable === false },
      ];
    },
  },
  {
    id: '08', titulo: 'Gateway (192.168.0.1)', severidade: '⚪',
    endpoint: '/api/system/network/ethernet',
    equipamentos: [
      { nome: 'GOEC6O046 - Faixa 1', uuid: '1e26be92-70e4-468f-a582-4e015282a4fe' },
      { nome: 'GOEC6O046 - Faixa 2', uuid: '4d68163e-8462-4dce-adad-df3b0d7c76af' },
    ],
    validar: (d) => {
      const gw = d?.ipv4Primary?.gateway || d?.gateway;
      return [
        { campo: 'gateway', atual: gw, correto: '192.168.0.1', ok: gw === '192.168.0.1' },
      ];
    },
  },
];

// ═══════════════════════════════════════════════════════════════
// FUNÇÕES
// ═══════════════════════════════════════════════════════════════

async function autenticar(baseUrl) {
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    const res = await fetch(`${baseUrl}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ params: CREDENTIALS }),
      signal: ctrl.signal,
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
      headers: { 'Authorization': `Bearer ${token}` },
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  VALIDAÇÃO DE CONFIGURAÇÃO — ITScam 450 SETRANS-GO');
  console.log('  Modo: 📋 SOMENTE LEITURA (nada será alterado)');
  if (FILTRO_CASO) console.log(`  Filtro caso: ${FILTRO_CASO}`);
  if (FILTRO_EQUIP) console.log(`  Filtro equipamento: ${FILTRO_EQUIP}`);
  console.log('═══════════════════════════════════════════════════════════════');

  let casos = CASOS;
  if (FILTRO_CASO) {
    const num = FILTRO_CASO.padStart(2, '0');
    casos = casos.filter(c => c.id === num);
    if (casos.length === 0) {
      console.log(`\n  ❌ Caso "${FILTRO_CASO}" não encontrado. Use 01-08.\n`);
      return;
    }
  }

  const resumo = { total: 0, ok: 0, errado: 0, offline: 0 };

  for (const caso of casos) {
    console.log(`\n┌─── CASO ${caso.id} ${caso.severidade} ${caso.titulo}`);
    
    let equips = caso.equipamentos;
    if (FILTRO_EQUIP) {
      equips = equips.filter(e => e.nome.toLowerCase().includes(FILTRO_EQUIP.toLowerCase()));
      if (equips.length === 0) {
        console.log(`│  (nenhum equipamento matches "${FILTRO_EQUIP}")`);
        continue;
      }
    }

    for (const equip of equips) {
      resumo.total++;
      const baseUrl = caso.acesso_local 
        ? null // CASO 01 precisa IP direto
        : TUNNEL_BASE.replace('{UUID}', equip.uuid);
      
      if (!baseUrl) {
        console.log(`│  ${equip.nome.padEnd(25)} ⚠️  REQUER ACESSO LOCAL (IP: ${equip.ip || '?'})`);
        resumo.offline++;
        continue;
      }

      process.stdout.write(`│  ${equip.nome.padEnd(25)}`);
      
      const token = await autenticar(baseUrl);
      if (!token) {
        console.log('❌ OFFLINE');
        resumo.offline++;
        continue;
      }
      
      const dados = await ler(baseUrl, token, caso.endpoint);
      if (!dados) {
        console.log('❌ ERRO LEITURA');
        resumo.offline++;
        continue;
      }
      
      const campos = caso.validar(dados);
      const erros = campos.filter(c => !c.ok);
      
      if (erros.length === 0) {
        console.log('✅ CORRETO');
        resumo.ok++;
      } else {
        console.log(`❌ ${erros.length} campo(s) errado(s):`);
        resumo.errado++;
        for (const e of erros) {
          console.log(`│     ${e.campo}: ${e.atual} → deveria ser ${e.correto}`);
        }
      }
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  RESUMO:');
  console.log(`  ✅ Corretos: ${resumo.ok}/${resumo.total}`);
  console.log(`  ❌ Com erro: ${resumo.errado}/${resumo.total}`);
  console.log(`  ⬚ Offline/local: ${resumo.offline}/${resumo.total}`);
  console.log('═══════════════════════════════════════════════════════════════\n');
}

main().catch(console.error);
