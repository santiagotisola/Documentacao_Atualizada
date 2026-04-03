import mongoose from "mongoose";

const SugestaoSchema = new mongoose.Schema({
  acao:    { type: String }, // "criar" | "revisar" | "expandir"
  produto: { type: String },
  secao:   { type: String },
  titulo:  { type: String },
  motivo:  { type: String },
}, { _id: false });

const CoberturaItemSchema = new mongoose.Schema({
  topico:  { type: String },
  coberto: { type: Boolean, default: false },
  docs:    { type: [String], default: [] },  // caminhos dos .md que cobrem o tópico
}, { _id: false });

const AnaliseSchema = new mongoose.Schema({
  topicosEncontrados: { type: [String], default: [] },
  cobertura:          { type: [CoberturaItemSchema], default: [] },
  lacunas:            { type: [String], default: [] },
  sugestoes:          { type: [SugestaoSchema], default: [] },
  totalTopicos:       { type: Number, default: 0 },
  totalCobertos:      { type: Number, default: 0 },
  percentualCobertura:{ type: Number, default: 0 },
  analisadoEm:        { type: Date },
}, { _id: false });

const FonteSchema = new mongoose.Schema({
  produto:  { type: String, required: true, enum: ["axhub", "axton", "axcross"] },
  titulo:   { type: String, required: true, trim: true },
  tipo:     { type: String, default: "manual", enum: ["manual", "especificacao", "relatorio", "requisito", "outro"] },
  conteudo: { type: String, required: true },
  arquivo:  { type: String, default: null },      // nome do arquivo original (se houver)
  status:   { type: String, default: "pendente", enum: ["pendente", "analisado"] },
  analise:  { type: AnaliseSchema, default: null },
}, { timestamps: true });

FonteSchema.index({ produto: 1 });
FonteSchema.index({ status: 1 });

export const Fonte = mongoose.model("fonte", FonteSchema);
