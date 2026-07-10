const { MongoClient } = require('mongodb');

// Enum InfractionType (numérico no banco)
const INFRACTION_TYPES = { 0: 'ExcessPBT', 1: 'ExcessAxle', 2: 'ExcessAxlePBT' };

(async () => {
  const c = await MongoClient.connect('mongodb://admin:admin123@localhost:27017/?authSource=admin');
  const db = c.db('AxTon');

  const config = await db.collection('configurations').findOne({});
  const tolPBT = config.TolerancePercentage || 5;
  const tolEixo = config.TolerancePercentageAxle || 12.5;
  const limite50t = config.InfractionLimitAxlePBT || 50000;

  console.log('═'.repeat(70));
  console.log('  VALIDAÇÃO COMPLETA — Lei 14.229/2021 vs AxTon');
  console.log('  Tolerância PBT:', tolPBT + '%  |  Eixo:', tolEixo + '%  |  Limite:', limite50t);
  console.log('═'.repeat(70));

  // Buscar TODAS as pesagens finalizadas
  const pesagens = await db.collection('weighings').find({ WeighingStatus: 1 }).toArray();
  console.log(`\nTotal pesagens finalizadas: ${pesagens.length}`);

  let stats = {
    total: pesagens.length,
    comInfracao: 0,
    semInfracao: 0,
    // Bugs encontrados
    bugTipo1_excessoPBT_semInfracao: [], // Tem excesso PBT mas sem infração
    bugTipo2_excessoEixo_semPBT_autuado: [], // Eixo autuado sem excesso PBT (≤50t) - INDEVIDO
    bugTipo3_tipoErrado: [], // InfractionType gravado diferente do correto
    bugTipo4_correto: [] // Infrações corretas
  };

  for (const r of pesagens) {
    if (!r.WeighingAxleGroups || r.WeighingAxleGroups.length === 0) continue;

    const pbtConstatado = r.WeighingAxleGroups.reduce(
      (sum, g) => sum + (g.WeighingAxles ? g.WeighingAxles.reduce((s, a) => s + (a.Weight || 0), 0) : 0), 0
    );
    const pbtConsiderado = r.RegulatedPBT * (1 + tolPBT / 100);
    const excessoPBT = pbtConstatado - pbtConsiderado;

    const eixosExcesso = [];
    for (const g of r.WeighingAxleGroups) {
      const pesoEixo = g.WeighingAxles ? g.WeighingAxles.reduce((s, a) => s + (a.Weight || 0), 0) : 0;
      const eixoConsiderado = g.RegulatedPBT * (1 + tolEixo / 100);
      if (pesoEixo > eixoConsiderado) {
        eixosExcesso.push({ code: g.Code, excesso: pesoEixo - eixoConsiderado });
      }
    }

    // Tipo correto segundo a lei
    let tipoCorreto = null;
    if (r.RegulatedPBT <= limite50t) {
      if (excessoPBT > 0 && eixosExcesso.length > 0) tipoCorreto = 2; // ExcessAxlePBT
      else if (excessoPBT > 0) tipoCorreto = 0; // ExcessPBT
      else tipoCorreto = null; // Sem infração
    } else {
      if (excessoPBT > 0 && eixosExcesso.length > 0) tipoCorreto = 2;
      else if (excessoPBT > 0) tipoCorreto = 0;
      else if (eixosExcesso.length > 0) tipoCorreto = 1;
    }

    const tipoGravado = r.Infraction ? r.Infraction.InfractionType : null;

    if (r.Infraction) {
      stats.comInfracao++;
    } else {
      stats.semInfracao++;
    }

    // Classificar bug
    if (r.RegulatedPBT <= limite50t) {
      if (excessoPBT > 0 && !r.Infraction) {
        // Tem excesso PBT mas NÃO gerou infração
        stats.bugTipo1_excessoPBT_semInfracao.push({
          placa: r.LicensePlate, data: r.WeighingDate,
          pbtReg: r.RegulatedPBT, pbtConst: pbtConstatado, excesso: excessoPBT
        });
      } else if (excessoPBT <= 0 && r.Infraction && tipoGravado === 1) {
        // Eixo autuado SEM excesso PBT — AUTUAÇÃO INDEVIDA
        stats.bugTipo2_excessoEixo_semPBT_autuado.push({
          placa: r.LicensePlate, data: r.WeighingDate,
          pbtReg: r.RegulatedPBT, pbtConst: pbtConstatado, excessoPBT: excessoPBT,
          eixos: eixosExcesso, tipoGravado: INFRACTION_TYPES[tipoGravado]
        });
      } else if (r.Infraction && tipoGravado !== tipoCorreto) {
        // Tipo errado gravado
        stats.bugTipo3_tipoErrado.push({
          placa: r.LicensePlate, data: r.WeighingDate,
          pbtReg: r.RegulatedPBT, pbtConst: pbtConstatado, excessoPBT: excessoPBT,
          eixos: eixosExcesso,
          tipoGravado: INFRACTION_TYPES[tipoGravado] || tipoGravado,
          tipoCorreto: INFRACTION_TYPES[tipoCorreto] || tipoCorreto
        });
      } else if (r.Infraction && tipoGravado === tipoCorreto) {
        stats.bugTipo4_correto.push({ placa: r.LicensePlate });
      }
    } else {
      // > 50t — verificar se está correto
      if (r.Infraction && tipoGravado === tipoCorreto) {
        stats.bugTipo4_correto.push({ placa: r.LicensePlate });
      } else if (r.Infraction && tipoGravado !== tipoCorreto) {
        stats.bugTipo3_tipoErrado.push({
          placa: r.LicensePlate, data: r.WeighingDate,
          pbtReg: r.RegulatedPBT, pbtConst: pbtConstatado, excessoPBT: excessoPBT,
          eixos: eixosExcesso,
          tipoGravado: INFRACTION_TYPES[tipoGravado] || tipoGravado,
          tipoCorreto: INFRACTION_TYPES[tipoCorreto] || tipoCorreto,
          nota: '> 50t'
        });
      }
    }
  }

  console.log('\n' + '━'.repeat(70));
  console.log('  RESULTADOS DA VALIDAÇÃO');
  console.log('━'.repeat(70));
  console.log(`\n  Pesagens com infração: ${stats.comInfracao}`);
  console.log(`  Pesagens sem infração: ${stats.semInfracao}`);

  console.log(`\n  🔴 BUG TIPO 1 — Excesso PBT ignorado (≤50t, sem infração gerada): ${stats.bugTipo1_excessoPBT_semInfracao.length}`);
  if (stats.bugTipo1_excessoPBT_semInfracao.length > 0) {
    console.log('     Exemplos:');
    for (const b of stats.bugTipo1_excessoPBT_semInfracao.slice(0, 5)) {
      console.log(`       ${b.placa} | ${b.data} | PBT Reg: ${b.pbtReg} | Const: ${b.pbtConst} | Excesso: +${b.excesso.toFixed(0)}`);
    }
  }

  console.log(`\n  🔴 BUG TIPO 2 — Autuação INDEVIDA (eixo autuado sem excesso PBT, ≤50t): ${stats.bugTipo2_excessoEixo_semPBT_autuado.length}`);
  if (stats.bugTipo2_excessoEixo_semPBT_autuado.length > 0) {
    console.log('     ⚠️ Lei 14.229 Art. 5º II PROÍBE esta autuação!');
    console.log('     Exemplos:');
    for (const b of stats.bugTipo2_excessoEixo_semPBT_autuado.slice(0, 5)) {
      console.log(`       ${b.placa} | ${b.data} | PBT: ${b.pbtConst}/${b.pbtReg} (${b.excessoPBT > 0 ? 'excede' : 'DENTRO'}) | Tipo: ${b.tipoGravado}`);
    }
  }

  console.log(`\n  🔴 BUG TIPO 3 — InfractionType ERRADO (gravado ≠ correto): ${stats.bugTipo3_tipoErrado.length}`);
  if (stats.bugTipo3_tipoErrado.length > 0) {
    console.log('     Exemplos:');
    for (const b of stats.bugTipo3_tipoErrado.slice(0, 10)) {
      console.log(`       ${b.placa} | ${b.data} | Gravado: ${b.tipoGravado} | Correto: ${b.tipoCorreto} | ExcPBT: ${b.excessoPBT > 0 ? '+' + b.excessoPBT.toFixed(0) : b.excessoPBT.toFixed(0)} | Eixos: ${b.eixos.length > 0 ? b.eixos.map(e => e.code).join(',') : 'nenhum'}`);
    }
  }

  console.log(`\n  ✅ Infrações CORRETAS: ${stats.bugTipo4_correto.length}`);

  // Distribuição de InfractionType
  const dist = await db.collection('weighings').aggregate([
    { $match: { Infraction: { $ne: null } } },
    { $group: { _id: '$Infraction.InfractionType', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();
  console.log('\n  Distribuição InfractionType no banco:');
  for (const d of dist) {
    console.log(`    Tipo ${d._id} (${INFRACTION_TYPES[d._id] || '?'}): ${d.count}`);
  }

  // Pesagens ≤ 50t vs > 50t
  const lte50 = await db.collection('weighings').countDocuments({ RegulatedPBT: { $lte: 50000 }, WeighingStatus: 1 });
  const gt50 = await db.collection('weighings').countDocuments({ RegulatedPBT: { $gt: 50000 }, WeighingStatus: 1 });
  console.log(`\n  Pesagens ≤ 50t: ${lte50}`);
  console.log(`  Pesagens > 50t: ${gt50}`);

  console.log('\n' + '═'.repeat(70));
  await c.close();
})();
