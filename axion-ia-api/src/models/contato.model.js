/**
 * contato.model.js
 * Base de Contatos CRM — Integração Multi360 → AxionIA
 * 
 * Origem: Planilha Google Contacts (Multi360)
 * Destino: MongoDB collection "contatos"
 * 
 * Cada contato pode ser associado a:
 *   - Um cliente (empresa/órgão)
 *   - Um ou mais produtos (AxHub, AxTon, AxCross)
 *   - Sessões WhatsApp (match por telefone)
 *   - Tickets Jitbit (match por nome/email)
 */

import mongoose from "mongoose";

const ContatoSchema = new mongoose.Schema({
  // === Dados importados do Multi360/Google Contacts ===
  nome:           { type: String, required: true, index: true },
  primeiroNome:   { type: String, default: "" },
  sobrenome:      { type: String, default: "" },
  telefone:       { type: String, required: true, unique: true, index: true },
  telefoneLimpo:  { type: String, index: true }, // apenas dígitos (para match)
  ddd:            { type: String, default: "" },
  estado:         { type: String, default: "" }, // UF derivada do DDD
  
  // === Enriquecimento CRM ===
  email:          { type: String, default: null },
  cargo:          { type: String, default: null },
  empresa:        { type: String, default: null },
  
  // === Associações ===
  clienteId:      { type: String, default: null, index: true }, // ID do site/cliente (ex: "goiania", "ipemce")
  clienteNome:    { type: String, default: null },
  produtos:       [{ type: String, enum: ["axhub", "axton", "axcross", "axionia"] }],
  
  // === Tags e Segmentação ===
  tags:           [{ type: String }], // ex: ["decisor", "técnico", "financeiro", "operador"]
  grupo:          { type: String, default: "geral" }, // ex: "operadores", "gestores", "comercial"
  origem:         { type: String, default: "multi360" }, // multi360 | manual | whatsapp | jitbit
  linhaWhatsApp:  { type: String, default: null }, // número da linha WA que captou (556296943770)
  
  // === Interações (preenchido automaticamente) ===
  totalInteracoes:    { type: Number, default: 0 },
  ultimaInteracao:    { type: Date, default: null },
  totalTickets:       { type: Number, default: 0 },
  ultimoTicketId:     { type: Number, default: null },
  totalMensagensWA:   { type: Number, default: 0 },
  lgpdAceito:         { type: Boolean, default: false },
  lgpdAceitoEm:       { type: Date, default: null },
  
  // === Scoring e Classificação ===
  score:          { type: Number, default: 0 }, // 0-100, calculado por atividade
  classificacao:  { type: String, enum: ["lead", "ativo", "inativo", "churned"], default: "lead" },
  
  // === Controle ===
  ativo:          { type: Boolean, default: true },
  importadoEm:    { type: Date, default: Date.now },
  atualizadoEm:   { type: Date, default: Date.now },
}, { timestamps: true });

// Índices compostos para performance
ContatoSchema.index({ clienteId: 1, produtos: 1 });
ContatoSchema.index({ ddd: 1, estado: 1 });
ContatoSchema.index({ classificacao: 1, score: -1 });
ContatoSchema.index({ tags: 1 });
ContatoSchema.index({ nome: "text", empresa: "text" }); // Full-text search

export const Contato = mongoose.model("contato", ContatoSchema);
