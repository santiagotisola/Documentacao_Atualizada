/**
 * equipamento.model.js
 * Inventário de Equipamentos de Infraestrutura (ZeroTier/AnyDesk/Rede)
 * 
 * Origem: Planilha "ID ZERO TIER MASTER.xlsx"
 * Vínculo: clienteSlug → Cliente model
 * 
 * Representa ativos de TI em campo (OCRs, tablets, notebooks)
 * conectados via VPN ZeroTier à rede Axion.
 */

import mongoose from "mongoose";

const EquipamentoSchema = new mongoose.Schema({
  // === Identificação ===
  alias:          { type: String, required: true, unique: true, index: true }, // ex: "econ-ocr005@ad"
  clienteSlug:    { type: String, required: true, index: true }, // ex: "economia" → vínculo com Cliente
  site:           { type: String, required: true }, // nome da aba/site (ex: "ECONOMIA", "IMEPI")
  
  // === Tipo e Fabricante ===
  tipo:           { type: String, enum: ["ocr", "radar", "balanca", "tablet", "notebook", "servidor", "outro"], default: "ocr" },
  fabricante:     { type: String, enum: ["Axion", "Pumatronix", "outro"], default: "Axion" },

  // === ZeroTier VPN ===
  zerotierNodeId: { type: String, default: null, index: true }, // hex 10 chars (ex: "E33AFEFE40")
  zerotierIp:     { type: String, default: null }, // IP estático VPN (ex: "172.27.2.5")
  redeAxion:      { type: Boolean, default: false }, // true = conectado à rede 6ab565387ae6bb9b

  // === Acesso Remoto ===
  anydeskAlias:   { type: String, default: null }, // ex: "econ-ocr005@ad"
  anydeskId:      { type: String, default: null }, // ID numérico AnyDesk
  
  // === Rede / Serviço ===
  porta:          { type: Number, default: 80 }, // porta exposta (HTTP/serviço)
  zabbix:         { type: String, enum: ["OK", "pendente", "nao_configurado"], default: "nao_configurado" },

  // === Status Operacional ===
  status:         { type: String, enum: ["ativo", "desativado", "retirado", "manutencao"], default: "ativo", index: true },
  observacoes:    { type: String, default: null },

  // === Localização (derivado do cliente) ===
  uf:             { type: String, default: null },

  // === Controle ===
  importadoEm:    { type: Date, default: Date.now },
}, { timestamps: true });

EquipamentoSchema.index({ clienteSlug: 1, status: 1 });
EquipamentoSchema.index({ uf: 1 });
EquipamentoSchema.index({ zerotierIp: 1 });
EquipamentoSchema.index({ alias: "text", observacoes: "text", anydeskAlias: "text" });

export const Equipamento = mongoose.model("equipamento", EquipamentoSchema);
