const { MongoClient } = require('mongodb');

(async () => {
  const client = await MongoClient.connect('mongodb://admin:admin123@localhost:27017/?authSource=admin');
  const db = client.db('AxTon');
  
  const placas = ['OXY6J95', 'SJW1J10'];
  
  for (const placa of placas) {
    const docs = await db.collection('weighings').find({ LicensePlate: placa }).sort({ WeighingDate: 1 }).toArray();
    console.log(`\n${'='.repeat(60)}`);
    console.log(`=== ${placa} — ${docs.length} pesagem(ns) ===`);
    console.log('='.repeat(60));
    
    for (const p of docs) {
      const pbtConst = p.WeighingAxleGroups.reduce((s, g) => s + g.WeighingAxles.reduce((ss, a) => ss + a.Weight, 0), 0);
      const pbtConsiderado = p.RegulatedPBT * 1.05;
      const excessoPBT = pbtConst - pbtConsiderado;
      
      const eixosInfo = p.WeighingAxleGroups.map(g => {
        const ec = g.WeighingAxles.reduce((ss, a) => ss + a.Weight, 0);
        const eCons = g.RegulatedPBT * 1.125;
        const excesso = ec - eCons;
        return {
          nome: g.Name || `Tipo${g.AxleGroupType}`,
          regulamentado: g.RegulatedPBT,
          constatado: ec,
          considerado: eCons,
          excesso: excesso > 0 ? excesso : 0,
          temExcesso: excesso > 0
        };
      });
      
      const eixosComExcesso = eixosInfo.filter(e => e.temExcesso);
      
      // Determinar tipo correto
      let tipoCorreto;
      if (p.RegulatedPBT <= 50000) {
        if (excessoPBT > 0 && eixosComExcesso.length > 0) tipoCorreto = 2; // ExcessAxlePBT
        else if (excessoPBT > 0) tipoCorreto = 0; // ExcessPBT
        else if (eixosComExcesso.length > 0) tipoCorreto = -1; // INDEVIDA
        else tipoCorreto = null;
      } else {
        if (excessoPBT > 0 && eixosComExcesso.length > 0) tipoCorreto = 2;
        else if (excessoPBT > 0) tipoCorreto = 0;
        else if (eixosComExcesso.length > 0) tipoCorreto = 1;
        else tipoCorreto = null;
      }
      
      const tipoNomes = { 0: 'ExcessPBT', 1: 'ExcessAxle', 2: 'ExcessAxlePBT', '-1': 'INDEVIDA (lei proíbe)' };
      const gravado = p.Infraction?.InfractionType;
      const correto = tipoCorreto;
      const status = gravado === correto ? '✅ CORRETO' : '❌ DIVERGENTE';
      
      console.log(`\n--- Pesagem #${p.WeighingNumber} ---`);
      console.log(`  Data: ${new Date(p.WeighingDate).toISOString().slice(0, 19)}`);
      console.log(`  Classificação: ${p.Classification || 'N/A'}`);
      console.log(`  PBT Regulamentado: ${p.RegulatedPBT} (${p.RegulatedPBT <= 50000 ? '≤' : '>'} 50t)`);
      console.log(`  PBT Constatado: ${pbtConst}`);
      console.log(`  PBT Considerado: ${pbtConsiderado}`);
      console.log(`  Excesso PBT: ${excessoPBT > 0 ? '+' + excessoPBT : excessoPBT + ' (dentro)'}`);
      console.log(`  Eixos:`);
      for (const e of eixosInfo) {
        console.log(`    ${e.nome}: Const=${e.constatado} Reg=${e.regulamentado} Cons=${e.considerado} Excesso=${e.temExcesso ? '+' + e.excesso : '0 (dentro)'}`);
      }
      console.log(`  WeighingStatus: ${p.WeighingStatus}`);
      console.log(`  Infraction: ${p.Infraction ? `Type=${gravado} (${tipoNomes[gravado]}) Code=${p.Infraction.InfractionCode} AIT=${p.Infraction.Ait}` : 'NENHUMA'}`);
      console.log(`  Tipo Correto: ${correto !== null ? `${correto} (${tipoNomes[correto]})` : 'Sem infração'}`);
      console.log(`  VEREDICTO: ${status}`);
    }
  }
  
  await client.close();
})();
