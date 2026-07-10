/**
 * cliente.model.js
 * Clientes/Empresas/Órgãos do ecossistema Axion
 * 
 * Representa a entidade EMPRESA (não o contato individual).
 * Cada cliente pode ter N contatos, N produtos e N sites.
 */

import mongoose from "mongoose";

const ClienteSchema = new mongoose.Schema({
  // === Identificação ===
  slug:           { type: String, required: true, unique: true, index: true }, // ex: "goiania", "ipemce"
  nome:           { type: String, required: true }, // Nome oficial
  nomeFantasia:   { type: String, default: null },
  cnpj:           { type: String, default: null },
  tipo:           { type: String, enum: ["orgao_publico", "concessionaria", "empresa_privada", "parceiro"], default: "orgao_publico" },
  
  // === Localização ===
  uf:             { type: String, default: null },
  cidade:         { type: String, default: null },
  endereco:       { type: String, default: null },
  
  // === Contrato ===
  produtos:       [{ type: String, enum: ["axhub", "axton", "axcross"] }],
  statusContrato: { type: String, enum: ["ativo", "implantacao", "negociacao", "encerrado", "prospect"], default: "ativo" },
  dataInicio:     { type: Date, default: null },
  dataFim:        { type: Date, default: null },
  valorMensal:    { type: Number, default: null },
  
  // === Referências cruzadas ===
  categoriaJitbit:  { type: Number, default: null }, // CategoryID no Jitbit
  siteIdAxhub:      { type: String, default: null }, // match com sitesData
  siteIdAxcross:    { type: String, default: null },
  siteIdAxton:      { type: String, default: null },
  
  // === Métricas (calculadas) ===
  totalContatos:      { type: Number, default: 0 },
  totalTickets:       { type: Number, default: 0 },
  ticketsAbertos:     { type: Number, default: 0 },
  slaPercentual:      { type: Number, default: null },
  satisfacao:         { type: Number, default: null }, // NPS 0-10
  
  // === VARCO Remote — acesso ao sistema do cliente ===
  // SEGURANÇA: senha em texto plano necessária para login em sistemas legados.
  // Acesso restrito ao VARCO Agent. Nunca retornado em listagens públicas.
  varco: {
    url:            { type: String, default: null, select: false },  // ex: https://ibametro.axhub.com.br
    login:          { type: String, default: null, select: false },
    senha:          { type: String, default: null, select: false },  // legado — sem hash
    configuradoEm:  { type: Date,   default: null },
  },

  // === Controle ===
  ativo:          { type: Boolean, default: true },
}, { timestamps: true });

ClienteSchema.index({ produtos: 1, statusContrato: 1 });
ClienteSchema.index({ uf: 1 });
ClienteSchema.index({ nome: "text", nomeFantasia: "text" });

export const Cliente = mongoose.model("cliente", ClienteSchema);

