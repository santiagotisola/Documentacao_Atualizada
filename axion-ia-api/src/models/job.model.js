import mongoose from "mongoose";

const resultadoItemSchema = new mongoose.Schema({
  nome:             { type: String },
  similaridade:     { type: Number },
  distanciaHamming: { type: Number },
  url:              { type: String },
  modo:             { type: String },
  // campos modo IA
  placa_referencia: { type: String },
  placa_candidato:  { type: String },
  mesmo_veiculo:    { type: Boolean },
  elementos_comuns: [String],
  observacoes:      { type: String },
  erro:             { type: String },
}, { _id: false });

const jobSchema = new mongoose.Schema({
  // Identificação
  tipo:    { type: String, default: "comparar-pasta" },
  modo:    { type: String, enum: ["local", "ia"], default: "local" },

  // Parâmetros
  pasta:      { type: String, required: true },
  sistema:    { type: String },
  contexto:   { type: String },
  maxImagens: { type: Number, default: 500 },

  // Imagem de referência (Buffer serializado como base64)
  refImageBase64: { type: String },
  refImageMime:   { type: String },
  refImageNome:   { type: String },

  // Estado
  status: {
    type: String,
    enum: ["pendente", "processando", "concluido", "erro"],
    default: "pendente",
  },

  // Progresso
  totalEncontradas: { type: Number, default: 0 },
  processadas:      { type: Number, default: 0 },

  // Resultado
  resultados: [resultadoItemSchema],
  erroMensagem: { type: String },

  // Timestamps
  iniciadoEm:  { type: Date },
  concluidoEm: { type: Date },
}, {
  timestamps: true, // createdAt, updatedAt automáticos
});

// Índice para listar jobs recentes com eficiência
jobSchema.index({ createdAt: -1 });
jobSchema.index({ status: 1 });

export const Job = mongoose.model("Job", jobSchema);
