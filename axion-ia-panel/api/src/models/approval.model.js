import mongoose from "mongoose";

const approvalSchema = new mongoose.Schema({
  tipo:       { type: String, enum: ["roadmap", "spec"], required: true },
  referenciaId: { type: mongoose.Schema.Types.ObjectId, required: true },
  produto:    { type: String, default: "" },
  titulo:     { type: String, default: "" },
  aprovado:   { type: Boolean, default: false },
  observacao: { type: String, default: "" },
  criadoEm:  { type: Date, default: Date.now },
  avaliadoEm:{ type: Date, default: null },
});

export default mongoose.model("Approval", approvalSchema);
