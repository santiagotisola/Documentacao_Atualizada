/**
 * conformidade-multi.model.js
 * Schema MongoDB para análise de conformidade contra 3 produtos simultâneos
 */

import mongoose from "mongoose";

const ConformidadeMultiSchema = new mongoose.Schema(
  {
    tituloEdital: {
      type: String,
      required: true,
    },
    resumo: {
      tituloEdital: String,
      dataAnalise: Date,
      requisitosTotal: Number,
      produtosAnalisados: [
        {
          nome: String,
          veredicto: String,
          atendimento: Number,
        },
      ],
      resumoPorTipo: mongoose.Schema.Types.Mixed,
      resumoPorProduto: mongoose.Schema.Types.Mixed,
    },
    analisesPorProduto: {
      axhub: mongoose.Schema.Types.Mixed,
      axton: mongoose.Schema.Types.Mixed,
      axcross: mongoose.Schema.Types.Mixed,
    },
    comparacao: mongoose.Schema.Types.Mixed,
    lacunas: mongoose.Schema.Types.Mixed,
    recomendacoes: [
      {
        produto: String,
        prioridade: {
          type: String,
          enum: ["ALTA", "MÉDIA", "BAIXA"],
        },
        tipo: String,
        quantidade: Number,
        requisitos: mongoose.Schema.Types.Mixed,
        acao: String,
      },
    ],
    criadoPor: String,
    status: {
      type: String,
      enum: ["PENDENTE", "PROCESSADO", "REVISOR", "FINALIZADO"],
      default: "PROCESSADO",
    },
  },
  {
    timestamps: true,
    collection: "conformidade-multi",
  }
);

const ConformidadeMulti = mongoose.model("ConformidadeMulti", ConformidadeMultiSchema);

export default ConformidadeMulti;
