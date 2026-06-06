import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  mensagem: { type: String, required: true },
  resposta: String,
  origem: { type: String, enum: ["kb", "semantica", "llm", "erro"], default: "llm" },
  score: Number,
  modulo: String,
  sessionId: String,
  tempo_ms: Number
}, { timestamps: true });

logSchema.index({ sessionId: 1 });
logSchema.index({ createdAt: -1 });

export const Log = mongoose.model("Log", logSchema);
