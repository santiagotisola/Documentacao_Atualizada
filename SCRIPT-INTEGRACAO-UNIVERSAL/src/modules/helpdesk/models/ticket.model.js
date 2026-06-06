import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  numero: { type: Number, unique: true },
  assunto: { type: String, required: true },
  descricao: { type: String, required: true },
  status: { type: String, enum: ["aberto", "em_andamento", "aguardando_cliente", "resolvido", "fechado"], default: "aberto" },
  prioridade: { type: String, enum: ["baixa", "media", "alta", "critica"], default: "media" },
  categoria: { type: String, default: "geral" },
  criado_por: {
    nome: String,
    email: String,
    telefone: String
  },
  atribuido_a: {
    nome: String,
    id: String
  },
  comentarios: [{
    autor: String,
    texto: String,
    data: { type: Date, default: Date.now },
    privado: { type: Boolean, default: false },
    origem: { type: String, enum: ["humano", "ia", "sistema"], default: "humano" }
  }],
  anexos: [{
    nome: String,
    path: String,
    tipo: String,
    tamanho_kb: Number
  }],
  sla: {
    prazo_horas: Number,
    vence_em: Date,
    violado: { type: Boolean, default: false }
  },
  origem: { type: String, enum: ["whatsapp", "email", "portal", "telefone", "api"], default: "api" },
  ia_sugestao: {
    resposta: String,
    score: Number,
    status: { type: String, enum: ["pendente", "aprovada", "rejeitada", "enviada"], default: "pendente" }
  },
  fechado_em: Date
}, { timestamps: true });

ticketSchema.index({ status: 1 });
ticketSchema.index({ "criado_por.telefone": 1 });
ticketSchema.index({ numero: 1 });

// Auto-increment numero
ticketSchema.pre("save", async function (next) {
  if (this.isNew && !this.numero) {
    const ultimo = await this.constructor.findOne().sort({ numero: -1 }).lean();
    this.numero = (ultimo?.numero || 1000) + 1;
  }
  next();
});

export const Ticket = mongoose.model("Ticket", ticketSchema);
