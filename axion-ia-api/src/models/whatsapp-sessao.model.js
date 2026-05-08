import mongoose from "mongoose";

const WhatsAppSessaoSchema = new mongoose.Schema({
  telefone:      { type: String, required: true, unique: true }, // ex: 5511999999999
  nome:          { type: String, default: "" },
  estado:        {
    type: String,
    enum: [
      "inicio",
      "menu",
      "aguardando_assunto",
      "aguardando_sistema",
      "aguardando_descricao",
      "aguardando_categoria",
      "aguardando_foto",
      "confirmando_ticket",
      "ticket_criado",
      "consultando_numero",
      "respondendo_numero",
      "respondendo_mensagem",
      "aguardando_modulo_duvida",
      "aguardando_duvida",
      "respondendo_duvida",
      "encerrado"
    ],
    default: "inicio"
  },
  dadosParciais: {
    assunto:      { type: String, default: null },
    sistema:      { type: String, default: null },
    descricao:    { type: String, default: null },
    categoriaId:  { type: Number, default: null },
    categoriaNome:{ type: String, default: null },
    ticketId:     { type: Number, default: null },
    temFoto:      { type: Boolean, default: false },
  },
  ultimoTicketId:   { type: Number, default: null },
  ultimaMensagem:   { type: Date, default: Date.now },
  ativo:            { type: Boolean, default: true },
}, { timestamps: true });

WhatsAppSessaoSchema.index({ ultimaMensagem: -1 });

// Expirar sessões inativas depois de 24h (TTL index)
WhatsAppSessaoSchema.index({ ultimaMensagem: 1 }, { expireAfterSeconds: 86400 });

export const WhatsAppSessao = mongoose.model("whatsapp_sessao", WhatsAppSessaoSchema);
