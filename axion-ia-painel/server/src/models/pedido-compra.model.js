/**
 * pedido-compra.model.js
 * Modelo para Pedidos de Compra via WhatsApp
 * 
 * Fluxo: Solicitante → IA interpreta → Ticket criado → Aprovação → Compras → Entrega
 * Ticket format: PC-ANO-SEQUENCIAL (ex: PC-2026-000154)
 */

import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
  quantidade:   { type: Number, required: true },
  unidade:      { type: String, default: "un" },       // un, m, kg, cx, etc
  descricao:    { type: String, required: true },
  categoria:    { type: String, default: "geral" },    // OCR, CFTV, Rede, Elétrica, etc
  tipo:         { type: String, default: null },       // tipo detectado pela IA
  fabricante:   { type: String, default: null },
  criticidade:  { type: String, enum: ["baixa", "media", "alta", "emergencial"], default: "media" },
}, { _id: false });

const AprovacaoSchema = new mongoose.Schema({
  aprovador:    { type: String, required: true },      // telefone ou email
  nome:         { type: String, default: null },
  papel:        { type: String, default: "gestor" },   // gestor, gerente, diretoria
  decisao:      { type: String, enum: ["pendente", "aprovado", "rejeitado", "info_adicional"], default: "pendente" },
  comentario:   { type: String, default: null },
  dataDecisao:  { type: Date, default: null },
}, { _id: false });

const HistoricoSchema = new mongoose.Schema({
  acao:       { type: String, required: true },
  usuario:    { type: String, default: null },
  data:       { type: Date, default: Date.now },
  detalhes:   { type: String, default: null },
}, { _id: false });

const PedidoCompraSchema = new mongoose.Schema({
  // === Identificação ===
  codigo:         { type: String, required: true, unique: true, index: true }, // PC-2026-000001
  ticketJitbitId: { type: Number, default: null },
  
  // === Solicitante ===
  solicitante: {
    telefone:   { type: String, required: true },
    nome:       { type: String, default: null },
  },
  
  // === Cabeçalho ===
  titulo:         { type: String, required: true },
  motivo:         { type: String, required: true },
  sistema:        { type: String, default: null },       // AxHub, AxOCR, AxRadar, etc
  
  // === Vínculo Contrato/Cliente ===
  clienteSlug:    { type: String, default: null, index: true },
  clienteNome:    { type: String, default: null },
  contrato:       { type: String, default: null },
  
  // === Tipo ===
  tipoSolicitacao: { type: String, enum: ["novo", "substituicao"], default: "novo" },
  
  // === Itens ===
  itens:          [ItemSchema],
  
  // === Destino ===
  destino: {
    endereco:     { type: String, default: null },
    unidade:      { type: String, default: null },
  },
  
  // === Prioridade e Status ===
  prioridade:     { type: String, enum: ["baixa", "media", "alta", "emergencial"], default: "media" },
  status:         { 
    type: String, 
    enum: [
      "rascunho",
      "aguardando_aprovacao",
      "aprovado",
      "reprovado",
      "em_cotacao",
      "em_garantia",
      "aguardando_devolucao",
      "em_logistica",
      "entregue",
      "finalizado",
      "cancelado"
    ], 
    default: "rascunho",
    index: true,
  },
  
  // === Substituição/Garantia ===
  substituicao: {
    equipamentoAlias:  { type: String, default: null },   // alias do equipamento
    numeroSerie:       { type: String, default: null },
    codigoPatrimonio:  { type: String, default: null },
    problemaDescrito:  { type: String, default: null },
    garantiaAte:       { type: Date, default: null },
    haveraDevolucao:   { type: Boolean, default: true },
    motivoNaoDevolucao:{ type: String, default: null },
  },
  
  // === Aprovação ===
  aprovacoes:     [AprovacaoSchema],
  
  // === Rastreabilidade ===
  historico:      [HistoricoSchema],
  
  // === Valor (preenchido após cotação) ===
  valorEstimado:  { type: Number, default: null },
  
  // === Controle ===
  criadoEm:       { type: Date, default: Date.now },
  atualizadoEm:   { type: Date, default: Date.now },
}, { timestamps: true });

PedidoCompraSchema.index({ "solicitante.telefone": 1 });
PedidoCompraSchema.index({ status: 1, prioridade: 1 });

// Auto-gerar código sequencial
PedidoCompraSchema.statics.gerarCodigo = async function() {
  const ano = new Date().getFullYear();
  const prefixo = `PC-${ano}-`;
  const ultimo = await this.findOne({ codigo: { $regex: `^${prefixo}` } }).sort({ codigo: -1 }).lean();
  let seq = 1;
  if (ultimo) {
    const numStr = ultimo.codigo.replace(prefixo, "");
    seq = parseInt(numStr) + 1;
  }
  return `${prefixo}${String(seq).padStart(6, "0")}`;
};

export const PedidoCompra = mongoose.model("pedido_compra", PedidoCompraSchema);
