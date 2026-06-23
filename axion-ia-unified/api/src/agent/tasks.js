/**
 * agent/tasks.js — Tarefas atômicas do AxionAgent
 *
 * Cada função executa uma unidade de trabalho isolada e retorna
 * um objeto padronizado { ok, dados?, erro? }.
 *
 * As tasks NÃO têm efeitos colaterais além de leitura de banco
 * e envio de notificação Telegram quando configurado.
 */

import mongoose from "mongoose";
import axios from "axios";
import { testarConexao as testarAxHub, conectar as conectarAxHub } from "../services/axhub-db.js";
import { testarConexao as testarAxTon, conectar as conectarAxTon } from "../services/axton-db.js";
import { testarConexao as testarAxCross, conectar as conectarAxCross } from "../services/axcross-db.js";
import { Log } from "../models/log.model.js";
import { KB } from "../models/kb.model.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function tarefa(ok, dados = {}) {
  return { ok, executado_em: new Date().toISOString(), ...dados };
}

function minutosAtras(data) {
  if (!data) return Infinity;
  return (Date.now() - new Date(data).getTime()) / 60_000;
}

// ─── TAREFA 1: Health Check de todos os módulos ───────────────────────────────

export async function taskHealthCheck() {
  const [axhub, axton, axcross] = await Promise.allSettled([
    testarAxHub(),
    testarAxTon(),
    testarAxCross()
  ]);

  const mongoStatus = mongoose.connection.readyState === 1
    ? { conectado: true }
    : { conectado: false, erro: "readyState=" + mongoose.connection.readyState };

  let openaiOk = false;
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      const r = await axios.get("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
        timeout: 6000
      });
      openaiOk = r.status === 200;
    }
  } catch (_) {}

  const servicos = {
    axhub:   axhub.status  === "fulfilled" ? axhub.value  : { conectado: false, erro: axhub.reason?.message },
    axton:   axton.status  === "fulfilled" ? axton.value  : { conectado: false, erro: axton.reason?.message },
    axcross: axcross.status === "fulfilled" ? axcross.value : { conectado: false, erro: axcross.reason?.message },
    mongodb: mongoStatus,
    openai:  { conectado: openaiOk }
  };

  const totalOk = Object.values(servicos).filter(s => s.conectado).length;
  const total   = Object.keys(servicos).length;

  return tarefa(totalOk === total, {
    servicos,
    resumo: `${totalOk}/${total} serviços online`,
    degradado: totalOk > 0 && totalOk < total,
    offline: totalOk === 0
  });
}

// ─── TAREFA 2: Reconhecimento — heartbeat e atividade recente dos equipamentos ─

export async function taskReconhecimento(config) {
  const staleMin = config.heartbeat_stale_min || 10;

  const resultados = {};
  const alertas = [];

  // AxHub — equipamentos sem heartbeat
  try {
    const pool = await conectarAxHub();
    const r = await pool.request().query(`
      SELECT TOP 20
        e.Descricao AS Equipamento,
        h.DataHora  AS UltimoHeartbeat
      FROM TBHeartbeatEquipamentos h
      JOIN TBEquipamentos e ON h.IdEquipamento = e.IdEquipamento
      ORDER BY h.DataHora DESC
    `);
    const offline = r.recordset.filter(eq => minutosAtras(eq.UltimoHeartbeat) > staleMin);
    resultados.axhub = {
      total_equipamentos: r.recordset.length,
      offline: offline.length,
      equipamentos_offline: offline.map(e => e.Equipamento)
    };
    if (offline.length > 0) {
      alertas.push({
        sistema: "AxHub",
        tipo: "heartbeat_offline",
        descricao: `${offline.length} equipamento(s) sem sinal há +${staleMin} min`,
        equipamentos: offline.map(e => e.Equipamento)
      });
    }
  } catch (err) {
    resultados.axhub = { erro: err.message };
  }

  // AxTon — pesagens recentes (últimos 30 min)
  try {
    const pool = await conectarAxTon();
    const r = await pool.request().query(`
      SELECT COUNT(*) AS total
      FROM TBPesagens
      WHERE DataHoraPesagem >= DATEADD(MINUTE, -30, GETDATE())
    `);
    resultados.axton = { pesagens_30min: r.recordset[0]?.total ?? 0 };
  } catch (err) {
    resultados.axton = { erro: err.message };
  }

  // AxCross — passagens recentes (últimos 30 min) e equipamentos offline
  try {
    const pool = await conectarAxCross();
    const [passagens, hb] = await Promise.all([
      pool.request().query(`
        SELECT COUNT(*) AS total
        FROM TBPassagens
        WHERE DataPassagem >= DATEADD(MINUTE, -30, GETDATE())
      `),
      pool.request().query(`
        SELECT TOP 20
          e.Nome AS Equipamento, h.Status, h.UltimoSinal
        FROM TBHeartbeatEquipamentos h
        JOIN TBEquipamentos e ON h.EquipamentoId = e.Id
        ORDER BY h.UltimoSinal DESC
      `)
    ]);
    const offlineCross = hb.recordset.filter(eq => minutosAtras(eq.UltimoSinal) > staleMin);
    resultados.axcross = {
      passagens_30min: passagens.recordset[0]?.total ?? 0,
      offline: offlineCross.length,
      equipamentos_offline: offlineCross.map(e => e.Equipamento)
    };
    if (offlineCross.length > 0) {
      alertas.push({
        sistema: "AxCross",
        tipo: "heartbeat_offline",
        descricao: `${offlineCross.length} câmera(s) sem sinal há +${staleMin} min`,
        equipamentos: offlineCross.map(e => e.Equipamento)
      });
    }
  } catch (err) {
    resultados.axcross = { erro: err.message };
  }

  return tarefa(alertas.length === 0, {
    sistemas: resultados,
    alertas,
    total_alertas: alertas.length
  });
}

// ─── TAREFA 3: Stats da IA (KB + logs) ───────────────────────────────────────

export async function taskIAStats() {
  try {
    const [totalKB, totalLogs, origens] = await Promise.all([
      KB.countDocuments(),
      Log.countDocuments(),
      Log.aggregate([
        { $group: { _id: "$origem", total: { $sum: 1 } } },
        { $sort:  { total: -1 } }
      ])
    ]);

    // Custo estimado: calls OpenAI nas últimas 24h
    const ontem = new Date(Date.now() - 86_400_000);
    const openaiCalls = await Log.countDocuments({
      origem: "openai",
      createdAt: { $gte: ontem }
    });

    return tarefa(true, {
      kb_total:    totalKB,
      logs_total:  totalLogs,
      por_origem:  Object.fromEntries(origens.map(o => [o._id, o.total])),
      openai_calls_24h: openaiCalls,
      kb_saudavel: totalKB > 0
    });
  } catch (err) {
    return tarefa(false, { erro: err.message });
  }
}

// ─── TAREFA 4: Monitoramentos ativos no AxHub ─────────────────────────────────

export async function taskMonitoramentos() {
  try {
    const pool = await conectarAxHub();

    const [ativos, expirando] = await Promise.all([
      pool.request().query(`
        SELECT COUNT(*) AS total FROM TBMonitoramentos WHERE Ativo = 1
      `),
      // Monitoramentos que expiram nas próximas 24h (se coluna DataFim existir)
      pool.request().query(`
        SELECT COUNT(*) AS total
        FROM TBMonitoramentos
        WHERE Ativo = 1
          AND DataFim IS NOT NULL
          AND DataFim BETWEEN GETDATE() AND DATEADD(HOUR, 24, GETDATE())
      `).catch(() => ({ recordset: [{ total: 0 }] }))
    ]);

    const nAtivos   = ativos.recordset[0]?.total ?? 0;
    const nExpira   = expirando.recordset[0]?.total ?? 0;

    return tarefa(true, {
      monitoramentos_ativos: nAtivos,
      expirando_24h: nExpira,
      alerta_expiracao: nExpira > 0
    });
  } catch (err) {
    return tarefa(false, { erro: err.message });
  }
}

// ─── TAREFA 5: Notificação Telegram (opcional) ────────────────────────────────

export async function taskNotificarTelegram(mensagem, config) {
  const { telegram_token, telegram_chat_id } = config;
  if (!telegram_token || !telegram_chat_id) {
    return tarefa(false, { motivo: "Telegram não configurado." });
  }

  try {
    const r = await axios.post(
      `https://api.telegram.org/bot${telegram_token}/sendMessage`,
      { chat_id: telegram_chat_id, text: mensagem, parse_mode: "Markdown" },
      { timeout: 8000 }
    );
    return tarefa(true, { message_id: r.data?.result?.message_id });
  } catch (err) {
    return tarefa(false, { erro: err.response?.data?.description || err.message });
  }
}
