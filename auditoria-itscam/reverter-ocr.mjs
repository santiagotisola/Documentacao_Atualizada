#!/usr/bin/env node
/**
 * ══════════════════════════════════════════════════════════════
 * REVERTER OCR — Volta processingQueue e processingThreads para 4
 * ══════════════════════════════════════════════════════════════
 */

const TUNNEL_BASE = 'https://{UUID}-80.tunnel.varco.cloud';
const CREDENTIALS = { username: 'admin', password: '#econocr@' };
const TIMEOUT_MS = 25000;

// TODOS os equipamentos afetados pela execução errada do Caso 09 (62 total)
const equipamentos = [
  { nome: 'GOEC6O002 - Faixa 1', uuid: 'c5de0eb2-761e-427a-9efb-e85b7576203d' },
  { nome: 'GOEC6O002 - Faixa 2', uuid: 'fb1a2de8-aa93-4515-8d09-baee3bec45b1' },
  { nome: 'GOEC6O003 - Faixa 1', uuid: '1792282c-bacb-4808-8ff6-e44404b72de5' },
  { nome: 'GOEC6O003 - Faixa 2', uuid: 'ea779324-56d4-4ea5-bfb6-63b4cf751621' },
  { nome: 'GOEC6O004 - Faixa 1', uuid: 'fe1f2f2d-327c-4e87-b865-0b9d32cca00b' },
  { nome: 'GOEC6O004 - Faixa 2', uuid: 'abe3e1cd-9071-4dc9-8ce8-5c51d4417fce' },
  { nome: 'GOEC6O005 - Faixa 1', uuid: '0b6cdb29-2876-40fd-8e57-51572a2a1021' },
  { nome: 'GOEC6O005 - Faixa 2', uuid: '3df4eaee-9d2d-480d-b04c-faf75662dc70' },
  { nome: 'GOEC6O006 - Faixa 1', uuid: '29a63deb-dfe5-4765-a10a-57485f03f301' },
  { nome: 'GOEC6O006 - Faixa 2', uuid: 'a8f7026c-21b1-4415-8978-51788088124d' },
  { nome: 'GOEC6O007 - Faixa 1', uuid: '2c1ab0be-d0a3-4742-98ed-a916cb12fa22' },
  { nome: 'GOEC6O007 - Faixa 2', uuid: '33e77a95-b079-4ce2-9d03-69d5f2c82293' },
  { nome: 'GOEC6O008 - Faixa 2', uuid: 'd741e55b-19d6-4b2d-9c55-3651c310e1b1' },
  { nome: 'GOEC6O009 - Faixa 1', uuid: 'c296d7bf-0d3b-4da1-bf1d-3e4fe998e4a1' },
  { nome: 'GOEC6O009 - Faixa 2', uuid: 'ef0e72ca-d3a5-4f4e-bbf6-40f3737bda3f' },
  { nome: 'GOEC6O010 - Faixa 1', uuid: 'abf8fedb-4f1b-471f-a6bd-4e00484d5737' },
  { nome: 'GOEC6O010 - Faixa 2', uuid: '481dd19b-4968-4759-860b-35f9ec09c206' },
  { nome: 'GOEC6O011 - Faixa 1', uuid: '259688db-e246-42df-b327-192de761ec5d' },
  { nome: 'GOEC6O011 - Faixa 2', uuid: 'd0595c80-9ea7-49af-b2a0-d305d688e567' },
  { nome: 'GOEC6O013 - Faixa 1', uuid: '7d9bf2eb-0f9a-4691-bffd-e003fc3781ed' },
  { nome: 'GOEC6O013 - Faixa 2', uuid: '36896650-1bca-4093-9631-667b73bdd93d' },
  { nome: 'GOEC6O018 - Faixa 2', uuid: 'ef5d6c89-dd3e-475a-a8a3-e95a52ba0dc2' },
  { nome: 'GOEC6O020 - Faixa 1', uuid: '8c26ef19-7a14-45c5-8ac9-5eb0d5413a9b' },
  { nome: 'GOEC6O020 - Faixa 2', uuid: 'c0e5d0b5-2dc7-4e75-ab80-c1c98ca0e32c' },
  { nome: 'GOEC6O021 - Faixa 1', uuid: '74cece68-b6ae-49e8-afbe-ab45b13e0fa1' },
  { nome: 'GOEC6O022 - Faixa 1', uuid: 'ec00b844-08c8-446e-8e32-1a79fd0c374f' },
  { nome: 'GOEC6O022 - Faixa 2', uuid: '99eb83d1-73a7-4f68-82be-78b4e3c56d91' },
  { nome: 'GOEC6O028 - Faixa 1', uuid: '1f460cd7-f607-4c79-8a8e-50a8228850a4' },
  { nome: 'GOEC6O029 - Faixa 1', uuid: 'eb4f7f0c-e89d-416e-923f-aba9f39bd4e7' },
  { nome: 'GOEC6O029 - Faixa 2', uuid: 'e2ab6e91-cbf3-4a3a-87bb-2c95dd9efeef' },
  { nome: 'GOEC6O033 - Faixa 1', uuid: '1a42d44f-e0f3-4fd9-88bf-d3d81b2e0ec1' },
  { nome: 'GOEC6O033 - Faixa 2', uuid: '6ca2b8fb-8a91-4d1c-b2ca-89a40a20a00f' },
  { nome: 'GOEC6O036 - Faixa 1', uuid: 'e1b80d95-3b19-4bf3-b868-b7ae05ee2ba2' },
  { nome: 'GOEC6O040 - Faixa 1', uuid: 'e60a8f49-f662-45d6-a58d-7acbc3c76398' },
  { nome: 'GOEC6O040 - Faixa 2', uuid: 'f8cb4f21-c7b7-40e9-9fc9-4ebcf63c17f4' },
  { nome: 'GOEC6O043 - Faixa 1', uuid: '99bc7b7a-cbad-48a6-af3e-1ec93c77d78e' },
  { nome: 'GOEC6O043 - Faixa 2', uuid: '1edde8dd-a7fe-4ee0-a12b-dda40e0ff94c' },
  { nome: 'GOEC6O045 - Faixa 1', uuid: 'c47c0868-b2a9-4ef7-86e0-deb26cbef25d' },
  { nome: 'GOEC6O045 - Faixa 2', uuid: '97d2de40-0ea4-417d-b7eb-b5e62eb5f382' },
  { nome: 'GOEC6O046 - Faixa 1', uuid: 'dc0c9ac0-fe88-447a-b6e2-8ea1e8e7bb04' },
  { nome: 'GOEC6O046 - Faixa 2', uuid: '0faa9cdc-52e7-42ef-8a7f-4f62e83ba87a' },
  { nome: 'GOEC6O048 - Faixa 1', uuid: 'e76e8c97-52a2-44c0-9c2f-b6fc87119c9a' },
  { nome: 'GOEC6O048 - Faixa 2', uuid: '66b10ac8-fd14-4097-a12d-5dff7e0ac0a2' },
  { nome: 'GOEC6O049 - Faixa 1', uuid: 'afdea49d-80c8-4c45-8e71-38f51e7a7b8a' },
  { nome: 'GOEC6O049 - Faixa 2', uuid: '1f5cf17a-10a8-45b8-b4f1-21c1e4eace2c' },
  { nome: 'GOEC6O050 - Faixa 1', uuid: 'cd1cffec-3f80-4267-96e8-e34fb64e6d6f' },
  { nome: 'GOEC6O050 - Faixa 2', uuid: '2f0b1210-c7ab-4759-9806-86e72e067d0c' },
  { nome: 'GOEC6O051 - Faixa 1', uuid: 'ca9e78c7-3edc-4fad-96d1-f4b93bb31c14' },
  { nome: 'GOEC6O051 - Faixa 2', uuid: 'eed06e49-a6e1-4cff-a03e-bcb5e1e2c17e' },
  { nome: 'GOEC6O052 - Faixa 2', uuid: '8244f568-59f3-4f27-932e-86cc2eb10fc3' },
  { nome: 'GOEC6O052- Faixa 1', uuid: '0d1fa2dc-adba-4c6c-90d5-e2a1b3b63bf5' },
  { nome: 'GOEC6O053 - Faixa 1', uuid: '23a5ffad-ff92-4e8e-bf9e-ed81d3ef6e0c' },
  { nome: 'GOEC6O053 - Faixa 2', uuid: 'f99ebe4b-e24c-462c-902b-58efe83c33e8' },
  { nome: 'GOEC6O054 - Faixa 1', uuid: 'fd1f1c95-ba0e-41c5-bf94-94a57b38ead4' },
  // GOEC6O054-F2 não foi afetado (estava correto)
  { nome: 'GOEC6O055 - Faixa 1', uuid: 'a27aa0ba-7cb2-4c1a-bc1b-4e28f1e88f82' },
  { nome: 'GOEC6O055 - Faixa 2', uuid: 'b7d7cbd8-2e4f-41e7-a3b4-96e5354fbae3' },
  { nome: 'GOEC6O056 - Faixa 1', uuid: '7d6c7fd9-1c65-4c69-bf3f-c71ae67c97ef' },
  { nome: 'GOEC6O056 - Faixa 2', uuid: '5fa0c13e-cb10-4b00-9c5f-5eee0ca28ff5' },
  { nome: 'GOEC6O057 - Faixa 1', uuid: 'cd0d1d7a-6dc9-47a7-8daf-9be583dbfd1b' },
  { nome: 'GOEC6O057 - Faixa 2', uuid: 'e75b5c5d-e8ab-4784-ba60-7a8ce7ad1a55' },
  { nome: 'GOEC6O059 - Faixa 1', uuid: '94aad32f-f23b-4a0f-bc93-05f25bc4a35c' },
  { nome: 'GOEC6O059 - Faixa 2', uuid: '34c3cd8d-c0f9-4e87-b0e0-b7f3bd9f1a09' },
];

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

async function reverter(baseUrl, token) {
  try {
    // Ler configuração atual
    const ctrl1 = new AbortController();
    setTimeout(() => ctrl1.abort(), TIMEOUT_MS);
    const res1 = await fetch(`${baseUrl}/api/equipment/ocr`, {
      headers: { 'Authorization': `Bearer ${token}` },
      signal: ctrl1.signal,
    });
    if (!res1.ok) return false;
    const ocr = await res1.json();
    
    // Reverter para 4/4
    ocr.ocr.processingQueue = 4;
    ocr.ocr.processingThreads = 4;
    
    // Aplicar
    const ctrl2 = new AbortController();
    setTimeout(() => ctrl2.abort(), TIMEOUT_MS);
    const res2 = await fetch(`${baseUrl}/api/equipment/ocr`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(ocr),
      signal: ctrl2.signal,
    });
    return res2.ok;
  } catch { return false; }
}

async function main() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  REVERSÃO — OCR queue/threads → 4/4');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  let sucesso = 0;
  let falha = 0;
  
  for (const equip of equipamentos) {
    process.stdout.write(`${equip.nome}... `);
    const baseUrl = TUNNEL_BASE.replace('{UUID}', equip.uuid);
    const token = await autenticar(baseUrl);
    if (!token) {
      console.log('❌ OFFLINE');
      falha++;
      continue;
    }
    const ok = await reverter(baseUrl, token);
    if (ok) {
      console.log('✅ REVERTIDO');
      sucesso++;
    } else {
      console.log('❌ FALHA');
      falha++;
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  ✅ Sucesso: ${sucesso} | ❌ Falha: ${falha}`);
  console.log('═══════════════════════════════════════════════════════════════\n');
}

main();
