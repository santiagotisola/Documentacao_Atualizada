/**
 * mission.model.js
 * Mission Engine — Operações formais do ecossistema Axion
 *
 * Cada Missão representa uma operação estruturada realizada
 * em um cliente/produto: Auditoria, Deploy, Treinamento, etc.
 *
 * Relacionamentos:
 *   Mission → Cliente (slug)
 *   Mission → Evidências (screenshots, JSONs, HTMLs capturados)
 *   Mission → KnowledgeObject (conhecimento gerado)
 *   Mission → Ticket Jitbit (chamado vinculado)
 */

import mongoose from "mongoose";

const EvidenciaSchema = new mongoose.Schema({
  tipo:        { type: String, enum: ["screenshot", "html", "json", "log", "documento", "video"], default: "screenshot" },
  url:         { type: String, default: null },       // URL pública ou caminho local
  base64:      { type: String, default: null },       // imagem inline (se pequena)
  descricao:   { type: String, default: "" },
  capturadoEm: { type: Date, default: Date.now },
  tela:        { type: String, default: null },       // ex: "Triagem", "Equipamentos"
  site:        { type: String, default: null },       // ex: "ibametro"
}, { _id: false });

const ResultadoSchema = new mongoose.Schema({
  sucesso:       { type: Boolean, default: null },
  observacoes:   { type: String, default: "" },
  score:         { type: Number, default: null },     // 0-100
  itensVerificados: { type: Number, default: 0 },
  itensOk:         { type: Number, default: 0 },
  itensFalha:      { type: Number, default: 0 },
  documentoGeradoId: { type: mongoose.Schema.Types.ObjectId, ref: "KnowledgeObject", default: null },
  relatorioUrl:  { type: String, default: null },
}, { _id: false });

const MissionSchema = new mongoose.Schema({

  // === Identificação ===
  titulo:       { type: String, required: true },
  descricao:    { type: String, default: "" },
  tipo:         {
    type: String,
    required: true,
    enum: ["Audit", "Deployment", "Migration", "Training", "Support",
           "Validation", "Comparison", "Monitoring", "Homologation", "Investigation"],
  },

  // === Alvo ===
  clienteSlug:  { type: String, required: true, index: true }, // ex: "ibametro"
  clienteNome:  { type: String, default: "" },
  produto:      { type: String, enum: ["axhub", "axton", "axcross", "multi"], default: "axhub" },
  versao:       { type: String, default: null },  // versão do sistema auditado

  // === Responsável ===
  responsavel:  { type: String, default: "Sistema" },
  agente:       { type: String, enum: ["manual", "varco", "orchestrator", "cuti"], default: "manual" },

  // === Tempo ===
  inicio:       { type: Date, default: Date.now },
  fim:          { type: Date, default: null },
  duracao_min:  { type: Number, default: null },  // calculado ao concluir

  // === Status ===
  status:       {
    type: String,
    enum: ["planejada", "em_execucao", "concluida", "cancelada", "pausada"],
    default: "planejada",
    index: true,
  },

  // === Evidências capturadas ===
  evidencias:   [EvidenciaSchema],

  // === Resultado ===
  resultado:    { type: ResultadoSchema, default: null },

  // === Referências cruzadas ===
  ticketJitbitId:    { type: Number, default: null },
  varcoJobId:        { type: mongoose.Schema.Types.ObjectId, ref: "Job", default: null },
  knowledgeObjectIds:[{ type: mongoose.Schema.Types.ObjectId, ref: "KnowledgeObject" }],

  // === Configuração da missão ===
  config: {
    url:           { type: String, default: null },         // URL remota acessada
    telas:         [{ type: String }],                      // telas visitadas
    autoCaptura:   { type: Boolean, default: false },       // VARCO captura automático
    gerarRelatorio:{ type: Boolean, default: true },
    notificar:     { type: Boolean, default: false },
  },

  // === Tags ===
  tags: [{ type: String }],

}, { timestamps: true });

// Índices
MissionSchema.index({ tipo: 1, status: 1 });
MissionSchema.index({ clienteSlug: 1, createdAt: -1 });
MissionSchema.index({ agente: 1, status: 1 });

// Ao concluir, calcula duração automaticamente
MissionSchema.pre("save", async function () {
  if (this.status === "concluida" && this.fim && this.inicio) {
    this.duracao_min = Math.round((new Date(this.fim) - new Date(this.inicio)) / 60_000);
  }
});

export const Mission = mongoose.model("Mission", MissionSchema);
