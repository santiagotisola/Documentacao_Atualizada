import mongoose from "mongoose";

const LogSchema = new mongoose.Schema({
  mensagem:  { type: String, required: true },
  resposta:  { type: String, required: true },
  origem:    { type: String, enum: ["kb", "embedding", "openai"], required: true },
  score:     { type: Number, default: null },
  modulo:    { type: String, default: null }
}, { timestamps: true });

// Índice para consultas por origem e data
LogSchema.index({ origem: 1 });
LogSchema.index({ createdAt: -1 });

export const Log = mongoose.model("log", LogSchema);
