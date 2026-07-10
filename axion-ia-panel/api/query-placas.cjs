const { MongoClient } = require('mongodb');

(async () => {
  const c = await MongoClient.connect('mongodb://admin:admin123@localhost:27017/?authSource=admin');
  const db = c.db('AxTon');

  // Buscar SJW1J10 e OXY6J95
  const results = await db.collection('weighings').find({
    LicensePlate: { $in: ['SJW1J10', 'OXY6J95'] }
  }).sort({ WeighingDate: -1 }).toArray();

  for (const r of results) {
    console.log('\n' + '='.repeat(70));
    console.log('PLACA:', r.LicensePlate);
    console.log('Data:', r.WeighingDate);
    console.log('Classificação:', r.Classification, '| Eixos:', r.Axles);
    console.log('PBT Regulamentado:', r.RegulatedPBT, 'kg');
    console.log('WeighingStatus:', r.WeighingStatus);
    console.log('Infraction:', JSON.stringify(r.Infraction));
    console.log('ExportBatchId:', r.ExportBatchId);
    console.log('WeighingNumber:', r.WeighingNumber);

    let pbtConstatado = 0;
    if (r.WeighingAxleGroups) {
      console.log('\nGrupos de Eixo:');
      for (const g of r.WeighingAxleGroups) {
        const pesoEixo = g.WeighingAxles ? g.WeighingAxles.reduce((s, a) => s + (a.Weight || 0), 0) : 0;
        pbtConstatado += pesoEixo;
        const eixoConsiderado = g.RegulatedPBT * 1.125;
        const excesso = pesoEixo - eixoConsiderado;
        console.log(`  ${g.Code}: RegPBT=${g.RegulatedPBT} Constatado=${pesoEixo} Considerado=${eixoConsiderado.toFixed(0)} Excesso=${excesso > 0 ? '+' + excesso.toFixed(0) : excesso.toFixed(0)}`);
        if (g.WeighingAxles) {
          for (const a of g.WeighingAxles) {
            console.log(`    Eixo ${a.Sequence}: ${a.Weight} kg`);
          }
        }
      }
    }

    const pbtConsiderado = r.RegulatedPBT * 1.05;
    const excessoPBT = pbtConstatado - pbtConsiderado;
    console.log('\n--- CÁLCULOS ---');
    console.log(`PBT Constatado (soma eixos): ${pbtConstatado} kg`);
    console.log(`PBT Considerado (${r.RegulatedPBT} x 1.05): ${pbtConsiderado.toFixed(0)} kg`);
    console.log(`Excesso PBT: ${excessoPBT > 0 ? '+' + excessoPBT.toFixed(0) : excessoPBT.toFixed(0)} kg`);
    console.log(`Tem excesso PBT? ${excessoPBT > 0 ? 'SIM ✅' : 'NÃO'}`);

    // Verificar eixos com excesso
    const eixosExcesso = [];
    if (r.WeighingAxleGroups) {
      for (const g of r.WeighingAxleGroups) {
        const pesoEixo = g.WeighingAxles ? g.WeighingAxles.reduce((s, a) => s + (a.Weight || 0), 0) : 0;
        const eixoConsiderado = g.RegulatedPBT * 1.125;
        if (pesoEixo > eixoConsiderado) {
          eixosExcesso.push({ code: g.Code, excesso: pesoEixo - eixoConsiderado });
        }
      }
    }
    console.log(`Eixos com excesso: ${eixosExcesso.length > 0 ? eixosExcesso.map(e => e.code + ' (+' + e.excesso.toFixed(0) + ')').join(', ') : 'NENHUM'}`);

    // Tipo correto segundo a lei
    let tipoCorreto = null;
    if (r.RegulatedPBT <= 50000) {
      if (excessoPBT > 0 && eixosExcesso.length > 0) tipoCorreto = 'ExcessAxlePBT';
      else if (excessoPBT > 0) tipoCorreto = 'ExcessPBT';
      else tipoCorreto = null; // Sem infração (lei proíbe autuar eixo)
    } else {
      if (excessoPBT > 0 && eixosExcesso.length > 0) tipoCorreto = 'ExcessAxlePBT';
      else if (excessoPBT > 0) tipoCorreto = 'ExcessPBT';
      else if (eixosExcesso.length > 0) tipoCorreto = 'ExcessAxle';
    }

    const tipoGravado = r.Infraction ? (r.Infraction.InfractionType || 'campo ausente') : 'NENHUM (null)';
    console.log('\n--- RESULTADO ---');
    console.log(`RegulatedPBT ${r.RegulatedPBT} ${r.RegulatedPBT <= 50000 ? '≤' : '>'} 50.000 → Regra: ${r.RegulatedPBT <= 50000 ? 'verificar APENAS PBT (§1º)' : 'verificar ambos'}`);
    console.log(`InfractionType GRAVADO: ${tipoGravado}`);
    console.log(`InfractionType CORRETO (lei): ${tipoCorreto || 'NENHUM (lei proíbe autuação)'}`);
    console.log(`STATUS: ${tipoGravado === tipoCorreto ? '✅ CONFORME' : tipoGravado === 'NENHUM (null)' && tipoCorreto ? '❌ INFRAÇÃO NÃO GERADA (perda)' : tipoGravado === 'NENHUM (null)' && !tipoCorreto ? '✅ CORRETO (sem infração)' : '❌ DIVERGENTE'}`);
  }

  // Contar pesagens com infração no banco todo
  const totalInfracoes = await db.collection('weighings').countDocuments({ Infraction: { $ne: null } });
  const totalPesagens = await db.collection('weighings').countDocuments({});
  console.log('\n\n' + '='.repeat(70));
  console.log('ESTATÍSTICAS GERAIS:');
  console.log(`Total pesagens: ${totalPesagens}`);
  console.log(`Pesagens com infração: ${totalInfracoes}`);

  // Config
  const config = await db.collection('configurations').findOne({});
  if (config) {
    console.log('\nCONFIGURAÇÃO:');
    console.log(`  TolerancePercentage: ${config.TolerancePercentage}`);
    console.log(`  TolerancePercentageAxle: ${config.TolerancePercentageAxle}`);
    console.log(`  InfractionLimitAxlePBT: ${config.InfractionLimitAxlePBT}`);
    console.log(`  InfractionMinAllInfraction: ${config.InfractionMinAllInfraction}`);
    console.log(`  StructPBT: ${config.StructPBT}`);
    console.log(`  StructAxle: ${config.StructAxle}`);
    console.log(`  StructAxlePBT: ${config.StructAxlePBT}`);
  }

  await c.close();
})();
