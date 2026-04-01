/**
 * scheduler.js — Polling automático do Jitbit Helpdesk
 *
 * Verifica tickets não respondidos a cada POLLING_INTERVAL minutos.
 * Para cada ticket novo:
 *   score >= 0.85 → AUTO_RESPONDER (envia direto ao Jitbit)
 *   score >= 0.65 → registra no log como SUGERIR (aguarda humano)
 *   score < 0.65  → registra como ESCALAR
 *
 * Controle em memória (não reinicial):
 *   iniciar()   → ativa o cron
 *   pausar()    → suspende sem descartar estado
 *   obterStatus() → retorna estado atual e estatísticas
 */

import cron from "node-cron";
import { buscarTickets, responderTicket } from "./jitbit.js";
import { gerarResposta } from "./engine.js";
import { salvarHistorico } from "./logger.js";

const SCORE_AUTO    = 0.85;
const SCORE_SUGERIR = 0.65;

// Estado do scheduler (em memória)
const estado = {
  ativo: false,
  iniciado_em: null,
  ultima_execucao: null,
  proxima_execucao: null,
  execucoes: 0,
  tickets_processados: 0,
  auto_respondidos: 0,
  sugeridos: 0,
  escalados: 0,
  erros: 0,
  ultimo_log: [],          // últimos 20 registros
  tickets_vistos: new Set(), // IDs já processados nesta sessão
};

let taskCron = null;
let intervaloMinutos = parseInt(process.env.POLLING_INTERVAL || "2");

function decidirAcao(score) {
  if (score >= SCORE_AUTO)    return "AUTO_RESPONDER";
  if (score >= SCORE_SUGERIR) return "SUGERIR";
  return "ESCALAR";
}

function registrarLog(entry) {
  estado.ultimo_log.unshift({ ts: new Date().toISOString(), ...entry });
  if (estado.ultimo_log.length > 20) estado.ultimo_log.pop();
}

async function executarCiclo() {
  estado.execucoes++;
  estado.ultima_execucao = new Date().toISOString();
  calcularProxima();

  let tickets = [];
  try {
    tickets = await buscarTickets({ mode: 0, count: 50 }); // mode 0 = não respondidos
  } catch (err) {
    estado.erros++;
    registrarLog({ tipo: "erro", msg: `Falha ao buscar tickets: ${err.message}` });
    return;
  }

  const novos = tickets.filter(t => !estado.tickets_vistos.has(t.IssueID));

  if (novos.length === 0) {
    registrarLog({ tipo: "info", msg: `Nenhum ticket novo (${tickets.length} verificados)` });
    return;
  }

  registrarLog({ tipo: "info", msg: `${novos.length} ticket(s) novo(s) encontrado(s)` });

  for (const ticket of novos) {
    estado.tickets_vistos.add(ticket.IssueID);
    estado.tickets_processados++;

    const texto = `${ticket.Subject || ""} ${ticket.Body || ""}`.trim();
    if (!texto) continue;

    let resultado;
    try {
      resultado = await gerarResposta(texto);
    } catch (err) {
      estado.erros++;
      registrarLog({ tipo: "erro", ticketId: ticket.IssueID, msg: `Erro ao gerar resposta: ${err.message}` });
      continue;
    }

    const decisao = decidirAcao(resultado.score);

    if (decisao === "AUTO_RESPONDER") {
      try {
        await responderTicket(ticket.IssueID, resultado.resposta);
        estado.auto_respondidos++;
        salvarHistorico({
          mensagem: `[POLLING-AUTO #${ticket.IssueID}] ${texto.substring(0, 100)}`,
          origem: "polling",
          resposta: resultado.resposta
        });
        registrarLog({
          tipo: "auto",
          ticketId: ticket.IssueID,
          assunto: ticket.Subject,
          score: resultado.score,
          msg: "Resposta enviada automaticamente"
        });
      } catch (err) {
        estado.erros++;
        registrarLog({ tipo: "erro", ticketId: ticket.IssueID, msg: `Falha ao responder: ${err.message}` });
      }
    } else {
      if (decisao === "SUGERIR") estado.sugeridos++;
      else estado.escalados++;

      salvarHistorico({
        mensagem: `[POLLING-${decisao} #${ticket.IssueID}] ${texto.substring(0, 100)}`,
        origem: `polling-${decisao.toLowerCase()}`,
        resposta: resultado.resposta
      });
      registrarLog({
        tipo: decisao === "SUGERIR" ? "sugerir" : "escalar",
        ticketId: ticket.IssueID,
        assunto: ticket.Subject,
        score: resultado.score,
        sugestao: resultado.resposta.substring(0, 120),
        msg: decisao === "SUGERIR" ? "Sugestão salva — aguarda revisão humana" : "Escalado para análise humana"
      });
    }
  }
}

function calcularProxima() {
  const agora = new Date();
  agora.setMinutes(agora.getMinutes() + intervaloMinutos);
  estado.proxima_execucao = agora.toISOString();
}

export function iniciar(intervalo = null) {
  if (intervalo) intervaloMinutos = parseInt(intervalo);

  if (taskCron) {
    taskCron.stop();
    taskCron = null;
  }

  // Expressão cron: executar a cada N minutos
  const expr = `*/${intervaloMinutos} * * * *`;

  taskCron = cron.schedule(expr, executarCiclo, { scheduled: true, timezone: "America/Sao_Paulo" });

  estado.ativo = true;
  estado.iniciado_em = new Date().toISOString();
  calcularProxima();

  console.log(`⏱️  Polling Jitbit ativado — intervalo: ${intervaloMinutos}min (${expr})`);

  // Executa imediatamente na primeira vez
  executarCiclo().catch(() => {});

  return obterStatus();
}

export function pausar() {
  if (taskCron) {
    taskCron.stop();
  }
  estado.ativo = false;
  estado.proxima_execucao = null;
  console.log("⏸️  Polling Jitbit pausado");
  return obterStatus();
}

export function retomar() {
  if (!taskCron) return iniciar();
  taskCron.start();
  estado.ativo = true;
  calcularProxima();
  console.log("▶️  Polling Jitbit retomado");
  return obterStatus();
}

export function obterStatus() {
  return {
    ativo: estado.ativo,
    intervalo_minutos: intervaloMinutos,
    iniciado_em: estado.iniciado_em,
    ultima_execucao: estado.ultima_execucao,
    proxima_execucao: estado.proxima_execucao,
    stats: {
      execucoes: estado.execucoes,
      tickets_processados: estado.tickets_processados,
      auto_respondidos: estado.auto_respondidos,
      sugeridos: estado.sugeridos,
      escalados: estado.escalados,
      erros: estado.erros,
    },
    ultimo_log: estado.ultimo_log,
  };
}

export function limparTicketsVistos() {
  const total = estado.tickets_vistos.size;
  estado.tickets_vistos.clear();
  return { limpos: total };
}
