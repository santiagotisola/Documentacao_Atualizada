import mongoose from "mongoose";

const whatsappSessaoSchema = new mongoose.Schema({
  telefone: { type: String, required: true, unique: true, index: true },
  nome: { type: String, default: "" },
  estado: { type: String, default: "inicio" },
  dadosParciais: { type: mongoose.Schema.Types.Mixed, default: {} },
  lgpdAceito: { type: Boolean, default: false },
  ultimoTicketId: Number,
  remoteJid: String,
  pesquisaEnviada: { type: Boolean, default: false },
  ultimaMensagem: { type: Date, default: Date.now },
  ativo: { type: Boolean, default: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

// TTL: sessão expira após 24h sem atividade
whatsappSessaoSchema.index({ ultimaMensagem: 1 }, { expireAfterSeconds: 86400 });

export const WhatsAppSessao = mongoose.model("WhatsAppSessao", whatsappSessaoSchema);
