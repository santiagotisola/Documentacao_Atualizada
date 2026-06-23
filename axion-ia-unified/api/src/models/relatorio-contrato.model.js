import mongoose from "mongoose";

const relatorioContratoSchema = new mongoose.Schema({
  contrato: { type: String, required: true, index: true },        // id do site (ex: "derse", "strans")
  produto: { type: String, required: true, enum: ["axhub", "axton", "axcross"] },
  tipo: { type: String, required: true },                          // ex: "viabilidade-integracao", "gap-analysis", "conformidade"
  titulo: { type: String, required: true },
  contexto: { type: String, default: "" },                         // texto/contexto fornecido pelo usuário
  resultado: { type: mongoose.Schema.Types.Mixed, required: true }, // JSON estruturado com a análise
  markdown: { type: String, default: "" },                         // versão MD renderizável
  status: { type: String, default: "concluido", enum: ["gerando", "concluido", "erro"] },
  erro: { type: String, default: null },
  metadados: {
    campos_disponiveis: { type: Number, default: 0 },
    campos_faltantes: { type: Number, default: 0 },
    score_viabilidade: { type: Number, default: 0 },               // 0-100
    tempo_geracao_ms: { type: Number, default: 0 },
  },
}, { timestamps: true });

relatorioContratoSchema.index({ contrato: 1, tipo: 1, createdAt: -1 });

export default mongoose.model("RelatorioContrato", relatorioContratoSchema);
