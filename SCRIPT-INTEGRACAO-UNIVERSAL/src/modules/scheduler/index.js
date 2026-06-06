import { Router } from "express";
import cron from "node-cron";
import { gerarResposta, decidirAcao } from "../ia-engine/engine.js";
import { listarTickets, responderTicket } from "../helpdesk/service.js";
import { Ticket } from "../helpdesk/models/ticket.model.js";

export const schedulerRouter = Router();

// Estado do scheduler
const estado = {
  ativo: false,
  ultimaExecucao: null,
  proximaExecucao: null,
  estatisticas: {
    ciclos: 0,
    auto_respondidos: 0,
    sugeridos: 0,
    escalados: 0,
    erros: 0
  },
  jobs: []
};

let cronJob = null;

// ============================================
// CICLO PRINCIPAL DE POLLING
// ============================================
async function executarCiclo() {
  if (!estado.ativo) return;

  const inicio = Date.now();
  estado.ultimaExecucao = new Date().toISOString();
  estado.estatisticas.ciclos++;

  try {
    // Buscar tickets sem resposta
    const tickets = await listarTickets({ status: "aberto" });
    
    for (const ticket of tickets) {
      try {
        // Extrair texto do ticket
        const textoTicket = `${ticket.assunto || ""}\n${ticket.descricao || ""}`.trim();
        if (!textoTicket) continue;

        // Gerar resposta via IA
        const resultado = await gerarResposta(textoTicket, { modulo: ticket.categoria });
        const decisao = decidirAcao(resultado.score);

        const modoRevisao = process.env.MODO_REVISAO === "true";

        if (decisao === "AUTO_RESPONDER" && !modoRevisao) {
          // Enviar resposta automaticamente
          await responderTicket(ticket.id || ticket.numero, resultado.resposta, { autor: "IA Auto", origem: "ia" });
          estado.estatisticas.auto_respondidos++;
        } else if (decisao === "SUGERIR" || (decisao === "AUTO_RESPONDER" && modoRevisao)) {
          // Adicionar à fila de revisão
          await Ticket.findOneAndUpdate(
            { $or: [{ _id: ticket.id }, { numero: ticket.numero }] },
            { ia_sugestao: { resposta: resultado.resposta, score: resultado.score, status: "pendente" } }
          );
          estado.estatisticas.sugeridos++;
        } else {
          // Escalar para humano
          estado.estatisticas.escalados++;
        }
      } catch (err) {
        estado.estatisticas.erros++;
        console.error(`⚠️ Erro processando ticket ${ticket.numero}:`, err.message);
      }
    }
  } catch (err) {
    estado.estatisticas.erros++;
    console.error("❌ Erro no ciclo de polling:", err.message);
  }

  console.log(`🔄 Ciclo #${estado.estatisticas.ciclos} concluído em ${Date.now() - inicio}ms`);
}

// ============================================
// CONTROLE DO SCHEDULER
// ============================================
export function iniciarScheduler() {
  const intervalo = parseInt(process.env.POLLING_INTERVAL) || 2;
  
  cronJob = cron.schedule(`*/${intervalo} * * * *`, executarCiclo, { scheduled: true });
  estado.ativo = true;
  
  console.log(`⏱️ Scheduler iniciado — polling a cada ${intervalo} minutos`);
}

function pararScheduler() {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
  }
  estado.ativo = false;
  console.log("⏸️ Scheduler pausado");
}

// ============================================
// ROTAS
// ============================================

// GET /api/scheduler/status
schedulerRouter.get("/status", (req, res) => {
  res.json({
    ativo: estado.ativo,
    ultimaExecucao: estado.ultimaExecucao,
    intervalo_minutos: parseInt(process.env.POLLING_INTERVAL) || 2,
    modo_revisao: process.env.MODO_REVISAO === "true",
    estatisticas: estado.estatisticas
  });
});

// POST /api/scheduler/start
schedulerRouter.post("/start", (req, res) => {
  if (estado.ativo) return res.json({ mensagem: "Scheduler já está ativo" });
  iniciarScheduler();
  res.json({ sucesso: true, mensagem: "Scheduler iniciado" });
});

// POST /api/scheduler/stop
schedulerRouter.post("/stop", (req, res) => {
  pararScheduler();
  res.json({ sucesso: true, mensagem: "Scheduler pausado" });
});

// POST /api/scheduler/executar-agora — Força execução imediata
schedulerRouter.post("/executar-agora", async (req, res) => {
  try {
    await executarCiclo();
    res.json({ sucesso: true, estatisticas: estado.estatisticas });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /api/scheduler/reset-stats — Resetar contadores
schedulerRouter.post("/reset-stats", (req, res) => {
  estado.estatisticas = { ciclos: 0, auto_respondidos: 0, sugeridos: 0, escalados: 0, erros: 0 };
  res.json({ sucesso: true });
});
