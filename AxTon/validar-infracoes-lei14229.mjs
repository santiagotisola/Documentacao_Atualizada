/**
 * Script de Validação — Lógica de Infrações AxTon vs Lei 14.229/2021
 * 
 * Execução (da pasta axion-ia-api que tem o driver mongodb):
 *   cd axion-ia-api
 *   node ../AxTon/validar-infracoes-lei14229.mjs [MONGO_URI]
 * 
 * Exemplos:
 *   node ../AxTon/validar-infracoes-lei14229.mjs mongodb://localhost:27017/AxTon
 *   node ../AxTon/validar-infracoes-lei14229.mjs mongodb://admin:pass@192.168.1.100:27017/AxTon?authSource=admin
 * 
 * Valida:
 *   1. Config: InfractionLimitAxlePBT e InfractionMinAllInfraction
 *   2. Pesagens ≤ 50t com infração APENAS de eixo (Bug — lei exige PBT primeiro)
 *   3. Pesagens ≤ 50t com excesso PBT mas sem infração (Bug — sistema ignora PBT)
 *   4. Placa SJW1J10 específica
 *   5. Pesagens > 50t com ExcessAxlePBT (deve estar correto)
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// Resolve mongodb from axion-ia-api/node_modules
const { MongoClient } = require('../axion-ia-api/node_modules/mongodb');

const MONGO_URI = process.argv[2] || process.env.AXTON_MONGO_URI || 'mongodb://localhost:27017/AxTon';
const TOLERANCE_PBT = 5; // 5%
const TOLERANCE_AXLE = 12.5; // 12,5%
const LIMIT_50T = 50000; // kg

console.log('═══════════════════════════════════════════════════════════');
console.log('  VALIDAÇÃO — Infrações AxTon vs Lei 14.229/2021');
console.log('═══════════════════════════════════════════════════════════');
console.log(`  MongoDB: ${MONGO_URI}`);
console.log(`  Data: ${new Date().toLocaleString('pt-BR')}`);
console.log('═══════════════════════════════════════════════════════════\n');

let client;
try {
  client = await MongoClient.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
} catch (err) {
  console.error('❌ Não foi possível conectar ao MongoDB:', err.message);
  console.error('\nUso: node validar-infracoes-lei14229.mjs mongodb://<host>:<port>/<database>');
  process.exit(1);
}

const db = client.db();
const dbName = db.databaseName;
console.log(`✅ Conectado ao banco: ${dbName}\n`);

// Listar collections disponíveis
const collections = (await db.listCollections().toArray()).map(c => c.name);
console.log(`📦 Collections encontradas: ${collections.join(', ')}\n`);

// ═══════════════════════════════════════════════════════════
// 1. CONFIGURAÇÃO DO SISTEMA
// ═══════════════════════════════════════════════════════════
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  1. CONFIGURAÇÃO DO SISTEMA');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const configCol = collections.find(c => /^configuration/i.test(c)) || 'Configuration';
const config = await db.collection(configCol).findOne({});

if (config) {
  const campos = [
    'TolerancePercentage', 'TolerancePercentageAxle',
    'InfractionLimitAxlePBT', 'InfractionMinAllInfraction',
    'StructPBT', 'StructAxle', 'StructAxlePBT'
  ];
  console.log(`  Collection: ${configCol}`);
  for (const campo of campos) {
    const val = config[campo] ?? '(não encontrado)';
    console.log(`  ${campo}: ${val}`);
  }
  
  const limitAxlePBT = config.InfractionLimitAxlePBT;
  const minAll = config.InfractionMinAllInfraction;
  
  if (limitAxlePBT === 50000) {
    console.log(`\n  ⚠️  InfractionLimitAxlePBT = 50000 — CONFIRMA o threshold de 50t`);
  }
  if (minAll && minAll > limitAxlePBT) {
    console.log(`  ⚠️  InfractionMinAllInfraction (${minAll}) > InfractionLimitAxlePBT (${limitAxlePBT})`);
    console.log(`     → Gap de ${minAll - limitAxlePBT} kg entre "só PBT/Eixo" e "ambos"`);
  }
} else {
  console.log('  ❌ Collection Configuration não encontrada ou vazia');
}

// ═══════════════════════════════════════════════════════════
// 2. PESAGENS COM INFRAÇÃO (Weighing)
// ═══════════════════════════════════════════════════════════
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  2. PESAGENS COM INFRAÇÃO — ANÁLISE DE DIVERGÊNCIA');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const weighCol = collections.find(c => /^weighing/i.test(c)) || 'Weighing';
const totalPesagens = await db.collection(weighCol).countDocuments({});
console.log(`  Total de pesagens: ${totalPesagens}`);

// 2a. Pesagens ≤ 50t com infração APENAS de eixo
// BUG: se PBT ≤ 50t E tem excesso no PBT, sistema deveria dar ExcessPBT ou ExcessAxlePBT
const bugAxleOnly = await db.collection(weighCol).find({
  RegulatedPBT: { $lte: LIMIT_50T, $gt: 0 },
  'Infraction.InfractionType': 'ExcessAxle'
}).toArray();

console.log(`\n  🔴 BUG POTENCIAL: Veículos ≤ 50t com infração "ExcessAxle" apenas:`);
console.log(`     Encontrados: ${bugAxleOnly.length} registros`);

let bugConfirmados = 0;
const exemplosBug = [];

for (const w of bugAxleOnly) {
  const pbtReg = w.RegulatedPBT || 0;
  const pbtConst = w.GrossWeight || w.TotalWeight || 0;
  const pbtConsiderado = pbtReg * (1 + TOLERANCE_PBT / 100);
  const excessoPBT = pbtConst - pbtConsiderado;
  
  if (excessoPBT > 0) {
    bugConfirmados++;
    if (exemplosBug.length < 5) {
      exemplosBug.push({
        placa: w.Plate || w.LicensePlate || '—',
        pbtReg,
        pbtConst,
        pbtConsiderado: Math.round(pbtConsiderado),
        excessoPBT: Math.round(excessoPBT),
        infracao: w.Infraction?.InfractionType,
        data: w.WeighingDate || w.CreatedAt || '—'
      });
    }
  }
}

console.log(`     ❌ BUGS CONFIRMADOS (excesso PBT ignorado): ${bugConfirmados}`);
if (exemplosBug.length > 0) {
  console.log('\n     Exemplos:');
  for (const ex of exemplosBug) {
    console.log(`       Placa: ${ex.placa} | PBT Reg: ${ex.pbtReg}kg | Constatado: ${ex.pbtConst}kg | Excesso PBT: ${ex.excessoPBT}kg | Infração: ${ex.infracao} | Data: ${ex.data}`);
  }
}

// 2b. Pesagens ≤ 50t que NÃO têm infração mas deveriam (PBT excedido)
const semInfracao = await db.collection(weighCol).find({
  RegulatedPBT: { $lte: LIMIT_50T, $gt: 0 },
  $or: [
    { 'Infraction': null },
    { 'Infraction': { $exists: false } },
    { 'Infraction.InfractionType': { $in: [null, '', 'None'] } }
  ]
}).toArray();

let pbtExcedidoSemInfracao = 0;
const exemplosSemInfracao = [];

for (const w of semInfracao) {
  const pbtReg = w.RegulatedPBT || 0;
  const pbtConst = w.GrossWeight || w.TotalWeight || 0;
  const pbtConsiderado = pbtReg * (1 + TOLERANCE_PBT / 100);
  const excessoPBT = pbtConst - pbtConsiderado;
  
  if (excessoPBT > 0) {
    pbtExcedidoSemInfracao++;
    if (exemplosSemInfracao.length < 5) {
      exemplosSemInfracao.push({
        placa: w.Plate || w.LicensePlate || '—',
        pbtReg,
        pbtConst,
        excessoPBT: Math.round(excessoPBT)
      });
    }
  }
}

console.log(`\n  🔴 Veículos ≤ 50t SEM infração mas com excesso de PBT:`);
console.log(`     Encontrados: ${pbtExcedidoSemInfracao} registros`);
if (exemplosSemInfracao.length > 0) {
  console.log('     Exemplos:');
  for (const ex of exemplosSemInfracao) {
    console.log(`       Placa: ${ex.placa} | PBT Reg: ${ex.pbtReg}kg | Constatado: ${ex.pbtConst}kg | Excesso: ${ex.excessoPBT}kg (sem infração!)`);
  }
}

// 2c. Pesagens ≤ 50t com eixo excedido MAS PBT dentro da tolerância
// BUG INVERSO: sistema gera infração de eixo quando NÃO deveria (lei proíbe)
const eixoSemPBT = [];
for (const w of bugAxleOnly) {
  const pbtReg = w.RegulatedPBT || 0;
  const pbtConst = w.GrossWeight || w.TotalWeight || 0;
  const pbtConsiderado = pbtReg * (1 + TOLERANCE_PBT / 100);
  const excessoPBT = pbtConst - pbtConsiderado;
  
  if (excessoPBT <= 0) {
    // PBT está DENTRO da tolerância → lei proíbe autuar por eixo
    eixoSemPBT.push({
      placa: w.Plate || w.LicensePlate || '—',
      pbtReg,
      pbtConst,
      pbtConsiderado: Math.round(pbtConsiderado),
      infracao: w.Infraction?.InfractionType
    });
  }
}

console.log(`\n  🔴 AUTUAÇÕES INDEVIDAS (eixo autuado sem PBT exceder, ≤ 50t):`);
console.log(`     Lei 14.229 Art. 5º II: NÃO pode fiscalizar eixo se PBT ≤ 50t e PBT dentro da tolerância`);
console.log(`     Encontrados: ${eixoSemPBT.length} registros INDEVIDAMENTE autuados`);
if (eixoSemPBT.length > 0 && eixoSemPBT.length <= 10) {
  for (const ex of eixoSemPBT.slice(0, 5)) {
    console.log(`       Placa: ${ex.placa} | PBT Reg: ${ex.pbtReg}kg | Constatado: ${ex.pbtConst}kg (≤ ${ex.pbtConsiderado}kg tolerância) → infração INDEVIDA`);
  }
}

// ═══════════════════════════════════════════════════════════
// 3. BUSCAR PLACA SJW1J10
// ═══════════════════════════════════════════════════════════
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  3. PLACA ESPECÍFICA: SJW1J10');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const sjw = await db.collection(weighCol).findOne({
  $or: [
    { Plate: /SJW1J10/i },
    { LicensePlate: /SJW1J10/i },
    { 'Vehicle.Plate': /SJW1J10/i }
  ]
});

if (sjw) {
  console.log('  ✅ Registro encontrado!');
  console.log(`  ${JSON.stringify(sjw, null, 2).substring(0, 2000)}`);
  
  // Validar cálculos
  const pbtReg = sjw.RegulatedPBT || 0;
  const pbtConst = sjw.GrossWeight || sjw.TotalWeight || 0;
  const pbtConsiderado = pbtReg * 1.05;
  const excessoPBT = pbtConst - pbtConsiderado;
  
  console.log('\n  📊 CÁLCULOS:');
  console.log(`     PBT Regulamentado: ${pbtReg} kg`);
  console.log(`     PBT Considerado (5%): ${pbtConsiderado} kg`);
  console.log(`     PBT Constatado: ${pbtConst} kg`);
  console.log(`     Excesso PBT: ${excessoPBT > 0 ? excessoPBT + ' kg ← EXCEDE' : 'Dentro da tolerância'}`);
  console.log(`     Infração registrada: ${sjw.Infraction?.InfractionType || '—'}`);
  
  if (excessoPBT > 0 && sjw.Infraction?.InfractionType === 'ExcessAxle') {
    console.log('\n  ❌ CONFIRMADO: Placa SJW1J10 tem excesso de PBT (${Math.round(excessoPBT)}kg)');
    console.log('     mas infração registrada é apenas "ExcessAxle".');
    console.log('     DEVERIA SER: "ExcessAxlePBT" (cumulativo conforme §2º)');
  }
} else {
  console.log('  ⚠️  Placa SJW1J10 não encontrada. Tente campos: Plate, LicensePlate, Vehicle.Plate');
  console.log('     Pode ter sido exportada com outro formato de placa.');
}

// ═══════════════════════════════════════════════════════════
// 4. PESAGENS > 50t (devem estar corretas)
// ═══════════════════════════════════════════════════════════
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  4. PESAGENS > 50t (validação de controle)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const acima50 = await db.collection(weighCol).countDocuments({
  RegulatedPBT: { $gt: LIMIT_50T }
});
const acima50PBT = await db.collection(weighCol).countDocuments({
  RegulatedPBT: { $gt: LIMIT_50T },
  'Infraction.InfractionType': 'ExcessPBT'
});
const acima50Axle = await db.collection(weighCol).countDocuments({
  RegulatedPBT: { $gt: LIMIT_50T },
  'Infraction.InfractionType': 'ExcessAxle'
});
const acima50Both = await db.collection(weighCol).countDocuments({
  RegulatedPBT: { $gt: LIMIT_50T },
  'Infraction.InfractionType': 'ExcessAxlePBT'
});

console.log(`  Total pesagens > 50t: ${acima50}`);
console.log(`  Com infração ExcessPBT: ${acima50PBT}`);
console.log(`  Com infração ExcessAxle: ${acima50Axle}`);
console.log(`  Com infração ExcessAxlePBT: ${acima50Both}`);
console.log(`  → Para > 50t, a lógica parece ${acima50Both > 0 ? '✅ CORRETA (gera cumulativas)' : '⚠️ verificar manualmente'}`);

// ═══════════════════════════════════════════════════════════
// 5. ESTATÍSTICAS GERAIS
// ═══════════════════════════════════════════════════════════
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  5. ESTATÍSTICAS GERAIS DE INFRAÇÕES');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const stats = await db.collection(weighCol).aggregate([
  { $group: { 
    _id: '$Infraction.InfractionType', 
    count: { $sum: 1 },
    avgPBT: { $avg: '$RegulatedPBT' }
  }},
  { $sort: { count: -1 } }
]).toArray();

console.log('  Tipo de Infração          | Qtd     | PBT Médio Reg.');
console.log('  ─────────────────────────────────────────────────────');
for (const s of stats) {
  const tipo = (s._id || 'Sem infração').padEnd(25);
  const qtd = String(s.count).padStart(6);
  const avg = s.avgPBT ? `${Math.round(s.avgPBT)} kg` : '—';
  console.log(`  ${tipo} | ${qtd}  | ${avg}`);
}

// ═══════════════════════════════════════════════════════════
// RESUMO
// ═══════════════════════════════════════════════════════════
console.log('\n═══════════════════════════════════════════════════════════');
console.log('  RESUMO DA VALIDAÇÃO');
console.log('═══════════════════════════════════════════════════════════\n');

const totalBugs = bugConfirmados + pbtExcedidoSemInfracao + eixoSemPBT.length;

if (totalBugs > 0) {
  console.log(`  🔴 DIVERGÊNCIA CONFIRMADA — ${totalBugs} registros afetados:`);
  console.log(`     • ${bugConfirmados} com excesso PBT mas infração registrada apenas como "Eixo"`);
  console.log(`     • ${pbtExcedidoSemInfracao} com excesso PBT mas SEM nenhuma infração`);
  console.log(`     • ${eixoSemPBT.length} autuados por eixo INDEVIDAMENTE (PBT dentro da tolerância)`);
  console.log('\n  📋 RECOMENDAÇÃO:');
  console.log('     Corrigir Weighing.cs: inverter lógica do threshold 50t');
  console.log('     Art. 1º §1º: ≤ 50t → verificar APENAS PBT');
  console.log('     Art. 1º §2º: se PBT exceder → TAMBÉM verificar eixo (cumulativo)');
} else if (totalPesagens === 0) {
  console.log('  ⚠️  Nenhuma pesagem encontrada no banco. Verifique:');
  console.log('     - Nome da collection (Weighing, weighings, pesagens?)');
  console.log('     - Nome dos campos (RegulatedPBT, GrossWeight, Plate?)');
} else {
  console.log('  ✅ Nenhuma divergência encontrada nos dados analisados.');
  console.log('     (pode ser que os nomes dos campos sejam diferentes do esperado)');
}

console.log('\n═══════════════════════════════════════════════════════════\n');

await client.close();
process.exit(0);
