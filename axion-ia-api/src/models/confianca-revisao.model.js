/**
 * confianca-revisao.model.js
 * Schema MongoDB para itens em fila de revisão (baixa confiança).
 */

import mongoose from "mongoose";

const confiancaRevisaoSchema = new mongoose.Schema(
  {
    // Referência ao relatório de conformidade
    conformidadeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conformidade",
      required: true,
      index: true,
    },

    // Produto analisado
    produto: {
      type: String,
      enum: ["axhub", "axton", "axcross"],
      required: true,
      index: true,
    },

    // Texto do requisito
    requisito: {
      type: String,
      required: true,
    },

    // Score de confiança (0-1)
    confianca: {
      type: Number,
      min: 0,
      max: 1,
      required: true,
    },

    // Nível de confiança categorizado
    nivelConfianca: {
      type: String,
      enum: ["MUITO_BAIXA", "BAIXA", "MEDIA", "ALTA", "MUITO_ALTA"],
      required: true,
    },

    // Resultado da análise automática
    resultado_automatico: {
      type: String,
      enum: ["atendido", "parcial", "nao_atendido"],
      required: true,
    },

    // Resultado após revisão humana
    resultado_revisao: {
      type: String,
      enum: ["atendido", "parcial", "nao_atendido"],
      default: null,
    },

    // Observações do revisor
    observacoes_revisao: String,

    // Justificativa da revisão
    justificativa_revisao: String,

    // ID do revisor (usuário que revisou)
    revisor_id: String,

    // Data da revisão
    data_revisao: Date,

    // Motivos da baixa confiança
    motivos: [String],

    // Evidências encontradas
    evidencias: [String],

    // Prioridade de revisão
    prioridade: {
      type: String,
      enum: ["BAIXA", "NORMAL", "MEDIA", "ALTA"],
      default: "NORMAL",
      index: true,
    },

    // Status
    status: {
      type: String,
      enum: ["PENDENTE", "REVISADO", "DESCARTADO"],
      default: "PENDENTE",
      index: true,
    },

    // Data de criação
    data_criacao: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "confianca_revisao",
  }
);

export default mongoose.model("ConfiancaRevisao", confiancaRevisaoSchema);
