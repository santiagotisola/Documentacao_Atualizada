/**
 * Correção: Diurno.upper.startTime / Noturno.upper.startTime
 * Altera de 06:00:00 / 18:01:00 para 00:00:00 nos 6 equipamentos afetados.
 *
 * Estratégia: GET profiles → ajustar transitions.upper.startTime → PUT profiles
 * 
 * Uso: node auditoria-itscam/corrigir-transicao-upper-start.mjs [--dry]
 */

const DEVICES = [
  { nome: "GOEC6O008 - Faixa 1", uuid: "5d6880f0-e8f2-4ff0-be25-00c3b31d6522" },
  { nome: "GOEC6O033 - Faixa 2", uuid: "34ebe844-ba8e-49f4-bc6f-45d5724ee381" },
  { nome: "GOEC6O040 - Faixa 1", uuid: "9b5328e3-104b-4afc-b3ce-8880066ca995" },
  { nome: "GOEC6O040 - Faixa 2", uuid: "416aff7e-4c34-4356-bbac-aa66d34ffead" },
  { nome: "GOEC6O055 - Faixa 1", uuid: "1d0b2132-a825-4823-ab8f-8ce4aa829138" },
  { nome: "GOEC6O055 - Faixa 2", uuid: "fe5f7cf3-a8dd-41e8-b975-72921dbddeac" },
];

const CREDENTIALS = { username: "admin", password: "#econocr@" };
const TIMEOUT = 15000;
const DRY_RUN = process.argv.includes("--dry");

async function fetchJSON(url, opts = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally { clearTimeout(timer); }
}

async function authenticate(baseUrl) {
  const data = await fetchJSON(`${baseUrl}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ params: CREDENTIALS }),
  });
  return data.token || data.accessToken;
}

async function corrigirDispositivo(dev) {
  const baseUrl = `https://${dev.uuid}-80.tunnel.varco.cloud`;
  
  // 1. Autenticar
  const token = await authenticate(baseUrl);
  const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };
  
  // 2. GET profiles (retorna array com id, name, transitions...)
  const profiles = await fetchJSON(`${baseUrl}/api/image/profiles`, { headers });
  
  let alteracoes = [];
  
  // 3. Para cada perfil, verificar e corrigir transitions
  for (const profile of profiles) {
    const trans = profile.transitions;
    if (!trans) continue;
    
    let mudou = false;
    const fixes = { ...trans };
    
    // Corrigir upper.startTime
    if (trans.upper && trans.upper.startTime !== "00:00:00") {
      alteracoes.push(`  ${profile.name} (id:${profile.id}) upper.startTime: ${trans.upper.startTime} → 00:00:00`);
      fixes.upper = { ...fixes.upper, startTime: "00:00:00" };
      mudou = true;
    }
    
    // Corrigir upper.endTime
    if (trans.upper && trans.upper.endTime !== "00:00:00") {
      alteracoes.push(`  ${profile.name} (id:${profile.id}) upper.endTime: ${trans.upper.endTime} → 00:00:00`);
      fixes.upper = { ...fixes.upper, endTime: "00:00:00" };
      mudou = true;
    }
    
    // Corrigir lower.startTime
    if (trans.lower && trans.lower.startTime !== "00:00:00") {
      alteracoes.push(`  ${profile.name} (id:${profile.id}) lower.startTime: ${trans.lower.startTime} → 00:00:00`);
      fixes.lower = { ...fixes.lower, startTime: "00:00:00" };
      mudou = true;
    }
    
    // Corrigir lower.endTime
    if (trans.lower && trans.lower.endTime !== "00:00:00") {
      alteracoes.push(`  ${profile.name} (id:${profile.id}) lower.endTime: ${trans.lower.endTime} → 00:00:00`);
      fixes.lower = { ...fixes.lower, endTime: "00:00:00" };
      mudou = true;
    }
    
    if (mudou && !DRY_RUN) {
      // 4. PUT com payload mínimo (apenas transitions) usando o ID do perfil
      await fetchJSON(`${baseUrl}/api/image/profiles/${profile.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ transitions: fixes }),
      });
    }
  }
  
  return alteracoes;
}

// ═══ MAIN ═══
console.log("╔═══════════════════════════════════════════════════════════════╗");
console.log("║  CORREÇÃO: Transições startTime/endTime → 00:00:00          ║");
console.log(`║  Modo: ${DRY_RUN ? "DRY RUN (simulação)" : "APLICAÇÃO REAL"}                                  ║`);
console.log(`║  Dispositivos: ${DEVICES.length}                                            ║`);
console.log("╚═══════════════════════════════════════════════════════════════╝\n");

let sucesso = 0, falhas = 0;

for (const dev of DEVICES) {
  process.stdout.write(`  ${dev.nome.padEnd(25)} `);
  try {
    const alteracoes = await corrigirDispositivo(dev);
    if (alteracoes.length === 0) {
      console.log("✅ Já está correto (sem alterações necessárias)");
    } else {
      console.log(DRY_RUN ? `🔍 ${alteracoes.length} alteração(ões) necessárias:` : `✅ ${alteracoes.length} alteração(ões) aplicadas:`);
      alteracoes.forEach(a => console.log(`     ${a}`));
    }
    sucesso++;
  } catch (err) {
    console.log(`❌ Erro: ${err.message}`);
    falhas++;
  }
}

console.log(`\n═══════════════════════════════════════════════════════════════`);
console.log(`  Resultado: ${sucesso} OK | ${falhas} falhas`);
if (DRY_RUN) console.log("  ⚠️  Modo DRY RUN — nada foi alterado. Execute sem --dry para aplicar.");
else console.log("  ✅ Correções aplicadas. Execute validar-config.mjs para confirmar.");
console.log(`═══════════════════════════════════════════════════════════════`);
