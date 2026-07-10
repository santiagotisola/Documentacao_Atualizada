/**
 * seed.mjs — Popula o MongoDB com dados iniciais de demonstração
 *
 * Uso: node --env-file=.env seed.mjs
 *      node --env-file=.env seed.mjs --reset   (limpa e repopula)
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/axion-ia";
const RESET = process.argv.includes("--reset");

// ─── Models (inline para evitar dependência circular) ─────────────────────────
const KBSchema = new mongoose.Schema({
  pergunta: String, resposta: String, modulo: { type: String, default: "geral" },
  embedding: { type: [Number], default: [] }
}, { timestamps: true });

const FonteSchema = new mongoose.Schema({
  produto: String, titulo: String, tipo: { type: String, default: "manual" },
  conteudo: String, arquivo: String, status: { type: String, default: "pendente" }
}, { timestamps: true });

const RoadmapSchema = new mongoose.Schema({
  produto: String, geradoEm: { type: Date, default: Date.now }, status: { type: String, default: "rascunho" },
  totalFontes: Number, itens: [{
    titulo: String, descricao: String, prioridade: Number,
    impacto: String, complexidade: String, categoria: String, status: { type: String, default: "pendente" }
  }]
});

const ConformidadeSchema = new mongoose.Schema({
  produto: String, tituloEdital: String, totalRequisitos: Number,
  atendidos: Number, parciais: Number, naoAtendidos: Number,
  percentualConformidade: Number, veredicto: String,
  totalDocumentosAnalisados: Number,
  itens: [{ numero: Number, requisito: String, status: String, score: Number, justificativa: String }]
}, { timestamps: true });

const KB = mongoose.model("kb", KBSchema);
const Fonte = mongoose.model("fonte", FonteSchema);
const Roadmap = mongoose.model("Roadmap", RoadmapSchema);
const Conformidade = mongoose.model("Conformidade", ConformidadeSchema);

// ─── Dados seed ──────────────────────────────────────────────────────────────

const kbEntradas = [
  { modulo: "axhub", pergunta: "Como cadastrar um novo equipamento no AxHub?", resposta: "Acesse Menu > Equipamentos > Novo. Preencha os campos obrigatórios: número de série, tipo, localização e IP. Clique em Salvar." },
  { modulo: "axhub", pergunta: "Como gerar um relatório de infrações?", resposta: "Acesse Menu > Relatórios > Infrações. Selecione o período, o tipo de infração e o equipamento desejado. Clique em Gerar Relatório." },
  { modulo: "axhub", pergunta: "Como verificar o status de um equipamento?", resposta: "Acesse Menu > Monitoramento > Dashboard. Os equipamentos são exibidos com status verde (online), amarelo (alerta) e vermelho (offline)." },
  { modulo: "axton", pergunta: "Como realizar uma pesagem manual no AxTon?", resposta: "Acesse Menu > Pesagens > Nova Pesagem. Insira a placa do veículo, selecione a balança e clique em Iniciar Pesagem. O sistema registrará automaticamente o peso." },
  { modulo: "axton", pergunta: "Como reclassificar uma pesagem?", resposta: "Acesse Menu > Pesagens > Histórico. Localize a pesagem, clique em Detalhes e depois em Reclassificar. Informe o motivo e confirme." },
  { modulo: "axcross", pergunta: "Como configurar um alerta de cruzamento?", resposta: "Acesse Menu > Alertas > Novo Alerta. Selecione o tipo (veículo monitorado, restrição ou furto/roubo), informe a placa e defina a vigência." },
  { modulo: "axcross", pergunta: "Como verificar cruzamentos recentes?", resposta: "Acesse Menu > Cruzamentos > Tempo Real. A tela exibe os últimos cruzamentos com placa, local, data/hora e tipo de alerta associado." },
  { modulo: "geral", pergunta: "Como alterar minha senha?", resposta: "Acesse o ícone do seu perfil no canto superior direito > Alterar Senha. Informe a senha atual, a nova senha e confirme." },
  { modulo: "geral", pergunta: "Como entrar em contato com o suporte?", resposta: "Abra um chamado pelo portal desk.axiontecnologia.com.br ou envie e-mail para suporte@axiontecnologia.com.br. O SLA padrão é de 4 horas para prioridade normal." },
  { modulo: "geral", pergunta: "Quais navegadores são suportados?", resposta: "Recomendamos Google Chrome 90+ ou Microsoft Edge 90+. Firefox e Safari têm suporte limitado para funcionalidades de monitoramento em tempo real." },
];

const fontes = [
  { produto: "axhub", titulo: "Manual do Usuário AxHub v4.2", tipo: "manual", conteudo: "Manual completo do sistema AxHub para operadores e administradores. Cobre cadastros, monitoramento, relatórios e administração.", status: "analisado" },
  { produto: "axhub", titulo: "Especificação Técnica - Módulo de Infrações", tipo: "especificacao", conteudo: "Especificação detalhada do fluxo de processamento de infrações: captura de imagem, OCR de placa, validação, geração de AIT e transmissão ao DETRAN.", status: "analisado" },
  { produto: "axton", titulo: "Manual de Operação AxTon v3.1", tipo: "manual", conteudo: "Manual operacional do sistema de pesagem veicular. Inclui procedimentos de pesagem, reclassificação, calibração e relatórios.", status: "analisado" },
  { produto: "axcross", titulo: "Guia de Configuração AxCross", tipo: "manual", conteudo: "Guia para configuração do sistema de cruzamento de dados: cadastro de alertas, monitoramento de veículos, integração com bases externas.", status: "pendente" },
];

const roadmaps = [
  {
    produto: "axhub", status: "publicado", totalFontes: 3,
    itens: [
      { titulo: "Dashboard de monitoramento em tempo real", descricao: "Painel com mapa interativo e status de equipamentos atualizado a cada 30s", prioridade: 1, impacto: "Redução de 50% no tempo de detecção de falhas", complexidade: "alta", categoria: "monitoramento", status: "pendente" },
      { titulo: "Integração API INMETRO", descricao: "Sincronização automática de certificados de calibração via API do INMETRO", prioridade: 2, impacto: "Conformidade regulatória automatizada", complexidade: "media", categoria: "integração", status: "pendente" },
      { titulo: "Relatório de conformidade automatizado", descricao: "Geração automática de relatório de conformidade para editais de licitação", prioridade: 1, impacto: "Agilidade em processos licitatórios", complexidade: "media", categoria: "relatórios", status: "especificado" },
    ]
  },
  {
    produto: "axton", status: "rascunho", totalFontes: 2,
    itens: [
      { titulo: "Módulo de pesagem dinâmica", descricao: "Pesagem de veículos em movimento sem necessidade de parada na balança", prioridade: 1, impacto: "Aumento de 300% na capacidade de pesagem", complexidade: "alta", categoria: "pesagem", status: "pendente" },
      { titulo: "App mobile para fiscais", descricao: "Aplicativo mobile para fiscais em campo com acesso a pesagens e infrações", prioridade: 2, impacto: "Mobilidade operacional", complexidade: "media", categoria: "mobile", status: "pendente" },
    ]
  }
];

const conformidades = [
  {
    produto: "axhub",
    tituloEdital: "Pregão Eletrônico nº 001/2026 — Fiscalização Eletrônica de Velocidade",
    totalRequisitos: 5, atendidos: 3, parciais: 1, naoAtendidos: 1,
    percentualConformidade: 70, veredicto: "PARCIALMENTE_APTO",
    totalDocumentosAnalisados: 12,
    itens: [
      { numero: 1, requisito: "Sistema de detecção de velocidade com precisão de ±2km/h", status: "atendido", score: 0.95, justificativa: "Equipamento homologado pelo INMETRO com margem de ±1km/h" },
      { numero: 2, requisito: "Captura de imagem com resolução mínima de 5MP", status: "atendido", score: 0.92, justificativa: "Câmeras de 8MP instaladas em todos os pontos" },
      { numero: 3, requisito: "Transmissão de dados em tempo real ao órgão autuador", status: "atendido", score: 0.88, justificativa: "API REST com transmissão a cada 30 segundos" },
      { numero: 4, requisito: "OCR de placas com taxa de acerto superior a 98%", status: "parcial", score: 0.65, justificativa: "Taxa atual de 96.5% — necessita calibração do modelo OCR" },
      { numero: 5, requisito: "Integração com sistema RENAINF do DENATRAN", status: "nao_atendido", score: 0.15, justificativa: "Integração não implementada — requer desenvolvimento de conector RENAINF" },
    ]
  }
];

// ─── Execução ────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("📦 Conectado:", MONGO_URI.replace(/\/\/[^@]+@/, "//***:***@"));

  if (RESET) {
    console.log("🗑️  Limpando collections...");
    await Promise.all([KB.deleteMany({}), Fonte.deleteMany({}), Roadmap.deleteMany({}), Conformidade.deleteMany({})]);
  }

  // KB
  const kbExist = await KB.countDocuments();
  if (kbExist === 0) {
    await KB.insertMany(kbEntradas);
    console.log(`✅ KB: ${kbEntradas.length} entradas`);
  } else {
    console.log(`ℹ️  KB: já contém ${kbExist} entradas — pulando`);
  }

  // Fontes
  const fontesExist = await Fonte.countDocuments();
  if (fontesExist === 0) {
    await Fonte.insertMany(fontes);
    console.log(`✅ Fontes: ${fontes.length} documentos`);
  } else {
    console.log(`ℹ️  Fontes: já contém ${fontesExist} documentos — pulando`);
  }

  // Roadmap
  const roadmapExist = await Roadmap.countDocuments();
  if (roadmapExist === 0) {
    await Roadmap.insertMany(roadmaps);
    console.log(`✅ Roadmap: ${roadmaps.length} planos`);
  } else {
    console.log(`ℹ️  Roadmap: já contém ${roadmapExist} planos — pulando`);
  }

  // Conformidade
  const confExist = await Conformidade.countDocuments();
  if (confExist === 0) {
    await Conformidade.insertMany(conformidades);
    console.log(`✅ Conformidade: ${conformidades.length} análises`);
  } else {
    console.log(`ℹ️  Conformidade: já contém ${confExist} análises — pulando`);
  }

  console.log("\n🎉 Seed completo!");
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error("❌ Erro no seed:", err.message);
  process.exit(1);
});
