import mongoose from "mongoose";

const specSchema = new mongoose.Schema({
  produto:     { type: String, required: true },
  titulo:      { type: String, required: true },
  criadoEm:   { type: Date, default: Date.now },
  roadmapItem: { type: mongoose.Schema.Types.ObjectId, ref: "Roadmap", default: null },
  spec: {
    objetivo:      { type: String, default: "" },
    usuarios:      [{ type: String }],
    requisitos:    [{ type: String }],
    regrasNegocio: [{ type: String }],
    arquitetura:   { type: String, default: "" },
    pseudoCodigo:  { type: String, default: "" },
    criteriosAceitacao: [{ type: String }],
    riscos:        [{ type: String }],
  },
  status: { type: String, enum: ["rascunho", "revisao", "aprovado"], default: "rascunho" },
});

export default mongoose.model("Spec", specSchema);
