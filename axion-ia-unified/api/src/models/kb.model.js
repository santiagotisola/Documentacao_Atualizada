import mongoose from "mongoose";

const KBSchema = new mongoose.Schema({
  pergunta:  { type: String, required: true },
  resposta:  { type: String, required: true },
  modulo:    { type: String, default: "geral" },
  embedding: { type: [Number], required: true }
}, { timestamps: true });

// Índice para buscas por módulo
KBSchema.index({ modulo: 1 });

export const KB = mongoose.model("kb", KBSchema);
