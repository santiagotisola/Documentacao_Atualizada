import mongoose from 'mongoose';

const MONGO_URL = 'mongodb://localhost:27017/axion-ia';

const fonteSchema = new mongoose.Schema({
  titulo: String,
  tipo: String,
  produto: String,
  conteudo: String,
  createdAt: { type: Date, default: Date.now }
});

const Fonte = mongoose.model('fonte', fonteSchema);

async function cleanupOldDuplicates() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('✅ Conectado ao MongoDB');

    // Get all fontes
    const allFontes = await Fonte.find();
    console.log(`Total de fontes: ${allFontes.length}`);

    // Group by título único (as últimas 4 inseridas têm encoding correto)
    const correctIds = new Set();
    const titlesMap = new Map();

    // Identifica os corretos (últimos inseridos)
    allFontes.slice(-4).forEach(f => {
      correctIds.add(f._id.toString());
      titlesMap.set(f.titulo, f._id.toString());
    });

    console.log(`\n✓ Fontes corretas (UTF-8):`);
    correctIds.forEach(id => {
      const fonte = allFontes.find(f => f._id.toString() === id);
      console.log(`   ${fonte.titulo}`);
    });

    // Remove duplicadas antigas
    let deletedCount = 0;
    for (const fonte of allFontes) {
      if (!correctIds.has(fonte._id.toString())) {
        await Fonte.deleteOne({ _id: fonte._id });
        console.log(`🗑️  Removida: ${fonte.titulo || '(sem título)'}`);
        deletedCount++;
      }
    }

    console.log(`\n✅ Removidas ${deletedCount} entradas antigas`);

    // Verifica estado final
    const final = await Fonte.find();
    console.log(`\n📊 Total final de fontes: ${final.length}`);
    console.log('Fontes restantes:');
    final.forEach(f => console.log(`   ✓ ${f.titulo} (${f.produto})`));

    await mongoose.disconnect();
    console.log('\n✅ Pronto!');
    
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

cleanupOldDuplicates();
