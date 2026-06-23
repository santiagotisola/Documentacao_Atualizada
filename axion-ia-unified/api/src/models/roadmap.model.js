import mongoose from "mongoose";

const itemRoadmapSchema = new mongoose.Schema({
  titulo:       { type: String, required: true },
  descricao:    { type: String, default: "" },
  prioridade:   { type: Number, default: 0 },   // 1=alta, 2=media, 3=baixa
  impacto:      { type: String, default: "" },
  complexidade: { type: String, enum: ["baixa", "media", "alta"], default: "media" },
  categoria:    { type: String, default: "" },
  fontes:       [{ type: String }],              // títulos das fontes de origem
  status:       { type: String, enum: ["pendente", "especificado", "aprovado", "descartado"], default: "pendente" },
});

const roadmapSchema = new mongoose.Schema({
  produto:    { type: String, required: true },
  geradoEm:   { type: Date, default: Date.now },
  itens:      [itemRoadmapSchema],
  totalFontes:{ type: Number, default: 0 },
  status:     { type: String, enum: ["rascunho", "publicado", "arquivado"], default: "rascunho" },
});

export default mongoose.model("Roadmap", roadmapSchema);
