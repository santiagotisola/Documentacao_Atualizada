import mongoose from 'mongoose';

const MONGO_URL = 'mongodb://localhost:27017/axion-ia';

// Define schema
const fonteSchema = new mongoose.Schema({
  titulo: String,
  tipo: String,
  produto: String,
  conteudo: String,
  createdAt: { type: Date, default: Date.now }
});

const Fonte = mongoose.model('fonte', fonteSchema);

// Dados corrigidos com UTF-8 correto
const fontesCorretas = [
  {
    titulo: "Pregão DETRAN - Monitoramento de Tráfego",
    tipo: "especificacao",
    produto: "axhub",
    conteudo: "REQUISITOS DE SOFTWARE: 1. Login Active Directory 2. Relatórios PDF Excel CSV 3. Dashboard gráficos tempo real 4. API REST. REQUISITOS HARDWARE: 1. Câmeras IP 2. Balança eletrônica 3. ANPR. REQUISITOS INTEGRAÇÃO: 1. Sistema infrações 2. Sincronização 3. Alertas WhatsApp 4. Backup Azure. REQUISITOS SEGURANÇA: 1. Criptografia 2. SSL/TLS 3. 2FA 4. RBAC. CONFORMIDADE: LGPD CONTRAN INMETRO."
  },
  {
    titulo: "Pregão 032/2026 - DETRAN MG",
    tipo: "especificacao",
    produto: "axhub",
    conteudo: "Requisitos técnicos para manutenção de equipamentos de trânsito com suporte a câmeras inteligentes, monitoramento de tráfego, relatórios de infrações e integração com múltiplos sistemas de informação."
  },
  {
    titulo: "Pregão AxTon - Pesagem Veicular",
    tipo: "especificacao",
    produto: "axton",
    conteudo: "Sistema de pesagem com classificação automática, relatórios de desempenho, integração com órgãos de fiscalização, validação de documentação, alertas de irregularidades e geração de multas eletrônicas."
  },
  {
    titulo: "Pregão AxCross - Monitoramento de Cruzamentos",
    tipo: "especificacao",
    produto: "axcross",
    conteudo: "Plataforma de monitoramento inteligente de cruzamentos com leitura automática de placas, identificação de padrões, alertas de segurança, relatórios de tráfego e integração com central de operações."
  }
];

async function fixEncoding() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('✅ Conectado ao MongoDB');

    // Remove entradas corrompidas (com caracteres inválidos)
    const deletedCount = await Fonte.deleteMany({ 
      titulo: { $regex: '\\?' } 
    });
    console.log(`🗑️  Removidas ${deletedCount.deletedCount} entradas corrompidas`);

    // Insere dados corrigidos
    const inserted = await Fonte.insertMany(fontesCorretas);
    console.log(`✅ Inseridas ${inserted.length} fontes corrigidas:`);
    
    inserted.forEach(fonte => {
      console.log(`   ✓ ${fonte.titulo} (${fonte.produto})`);
    });

    // Verifica se ficou ok
    const total = await Fonte.countDocuments();
    console.log(`\n📊 Total de fontes no banco: ${total}`);

    await mongoose.disconnect();
    console.log('✅ Desconectado do MongoDB');
    
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

fixEncoding();
