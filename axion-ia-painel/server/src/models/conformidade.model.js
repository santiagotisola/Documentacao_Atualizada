import mongoose from "mongoose";

const itemConformidadeSchema = new mongoose.Schema({
  numero:        { type: Number, required: true },
  requisito:     { type: String, required: true },
  origem:        { type: String, enum: ["heuristica", "openai"], default: "heuristica" },
  status:        { type: String, enum: ["atendido", "parcial", "nao_atendido"], required: true },
  score:         { type: Number, default: 0 },
  referenciaDoc: { type: String, default: null },
  topDocs:       [{ type: String }],
  justificativa: { type: String, default: null },
});

const conformidadeSchema = new mongoose.Schema(
  {
    produto:                   { type: String, required: true },
    tituloEdital:              { type: String, required: true },
    totalRequisitos:           { type: Number, default: 0 },
    atendidos:                 { type: Number, default: 0 },
    parciais:                  { type: Number, default: 0 },
    naoAtendidos:              { type: Number, default: 0 },
    percentualConformidade:    { type: Number, default: 0 },
    veredicto:                 { type: String, enum: ["APTO", "PARCIALMENTE_APTO", "INAPTO"], default: "INAPTO" },
    totalDocumentosAnalisados: { type: Number, default: 0 },
    itens:                     [itemConformidadeSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Conformidade", conformidadeSchema);
