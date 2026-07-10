import { Log } from "../models/log.model.js";
import { KB } from "../models/kb.model.js";

export async function analisarChamados() {
  const totalLogs = await Log.countDocuments();
  const totalKB = await KB.countDocuments();

  // Contagem por origem
  const porOrigem = await Log.aggregate([
    { $group: { _id: "$origem", total: { $sum: 1 } } },
    { $sort: { total: -1 } }
  ]);

  // Últimos 7 dias — volume por dia
  const seteDiasAtras = new Date();
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

  const porDia = await Log.aggregate([
    { $match: { createdAt: { $gte: seteDiasAtras } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        total: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Top módulos mencionados
  const porModulo = await Log.aggregate([
    { $match: { modulo: { $ne: null } } },
    { $group: { _id: "$modulo", total: { $sum: 1 } } },
    { $sort: { total: -1 } },
    { $limit: 10 }
  ]);

  // Taxa de resolução KB vs OpenAI
  const resolvidoKB = porOrigem.find(o => o._id === "kb")?.total || 0;
  const resolvidoEmbed = porOrigem.find(o => o._id === "embedding")?.total || 0;
  const resolvidoIA = porOrigem.find(o => o._id === "openai")?.total || 0;

  const taxaKB = totalLogs > 0
    ? (((resolvidoKB + resolvidoEmbed) / totalLogs) * 100).toFixed(1)
    : 0;

  return {
    totalInteracoes: totalLogs,
    totalEntradasKB: totalKB,
    taxaResolucaoKB: `${taxaKB}%`,
    porOrigem: Object.fromEntries(porOrigem.map(o => [o._id, o.total])),
    volumePorDia: porDia,
    topModulos: porModulo,
    resolucao: {
      kb: resolvidoKB,
      embedding: resolvidoEmbed,
      openai: resolvidoIA
    }
  };
}
