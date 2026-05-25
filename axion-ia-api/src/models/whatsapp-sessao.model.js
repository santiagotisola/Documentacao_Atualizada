import mongoose from "mongoose";

const WhatsAppSessaoSchema = new mongoose.Schema({
  telefone:      { type: String, required: true, unique: true }, // ex: 5511999999999
  nome:          { type: String, default: "" },
  estado:        {
    type: String,
    enum: [
      "inicio",
      "aguardando_lgpd",
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
      // Compras
      "compras_titulo",
      "compras_motivo",
      "compras_sistema",
      "compras_cliente",
      "compras_tipo",
      "compras_substituicao",
      "compras_devolucao",
      "compras_motivo_nao_devolucao",
      "compras_itens",
      "compras_destino",
      "compras_prioridade",
      "compras_aprovador",
      "compras_confirmacao",
      "compras_consulta",
      "compras_motivo_rejeicao",
      "atendente",
      "encerrado"
    ],
    default: "inicio"
  },
  dadosParciais: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  lgpdAceito:       { type: Boolean, default: false },
  lgpdAceitoEm:     { type: Date, default: null },
  ultimoTicketId:   { type: Number, default: null },
  ultimaMensagem:   { type: Date, default: Date.now },
  ativo:            { type: Boolean, default: true },
}, { timestamps: true });

WhatsAppSessaoSchema.index({ ultimaMensagem: -1 });

// Expirar sessões inativas depois de 24h (TTL index)
WhatsAppSessaoSchema.index({ ultimaMensagem: 1 }, { expireAfterSeconds: 86400 });

export const WhatsAppSessao = mongoose.model("whatsapp_sessao", WhatsAppSessaoSchema);
