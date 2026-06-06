import mongoose from "mongoose";

const kbSchema = new mongoose.Schema({
  pergunta: { type: String, required: true },
  resposta: { type: String, required: true },
  modulo: { type: String, default: "geral" },
  tags: [String],
  embedding: [Number],
  ativo: { type: Boolean, default: true },
  prioridade: { type: Number, default: 1 }
}, { timestamps: true });

kbSchema.index({ modulo: 1 });
kbSchema.index({ tags: 1 });

export const KB = mongoose.model("KB", kbSchema);
