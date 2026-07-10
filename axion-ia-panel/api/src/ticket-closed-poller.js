/**
 * ticket-closed-poller.js — Monitora tickets do Jitbit abertos via WhatsApp.
 * Quando um ticket é fechado/resolvido, dispara a pesquisa de satisfação
 * para o usuário via WhatsApp.
 *
 * Cron: a cada 5 minutos verifica sessões com ultimoTicketId e pesquisaEnviada=false.
 */

import cron from "node-cron";
import { buscarTicket } from "./jitbit.js";
import { WhatsAppSessao } from "./models/whatsapp-sessao.model.js";
import { iniciarPesquisaSatisfacao } from "./whatsapp-flow.js";

// Jitbit StatusId para tickets fechados/resolvidos:
// 1 = New, 2 = In progress, 3 = Closed/Resolved
// (pode variar por configuração — 3 é o padrão para "Closed")
const STATUS_FECHADO = [3];

let task = null;

/**
 * Verifica sessões WhatsApp com tickets pendentes de pesquisa.
 */
async function verificarTicketsFechados() {
  try {
    // Buscar sessões com ticket criado e pesquisa ainda não enviada
    const sessoes = await WhatsAppSessao.find({
      ultimoTicketId: { $ne: null },
      pesquisaEnviada: { $ne: true },
      lgpdAceito: true,
    }).limit(20);

    if (!sessoes.length) return;

    for (const sessao of sessoes) {
      try {
        const ticket = await buscarTicket(sessao.ultimoTicketId);

        if (!ticket) {
          console.log(`⚠️  [TicketPoller] Ticket #${sessao.ultimoTicketId} não encontrado`);
          continue;
        }

        // Verificar se está fechado (StatusId 3 = Closed no Jitbit padrão)
        // Também verificar IsClosed flag se disponível
        const isClosed = ticket.IsClosed || STATUS_FECHADO.includes(ticket.StatusID);

        if (!isClosed) continue;

        // Ticket fechado! Enviar pesquisa de satisfação
        const jid = sessao.remoteJid || `${sessao.telefone}@s.whatsapp.net`;
        console.log(`📋 [TicketPoller] Ticket #${sessao.ultimoTicketId} fechado — enviando pesquisa para ${sessao.telefone}`);

        // Atualizar estado da sessão para receber a pesquisa
        sessao.estado = "avaliacao_nota";
        sessao.pesquisaEnviada = true;
        sessao._remoteJid = jid;
        await sessao.save();

        // Enviar pesquisa
        await iniciarPesquisaSatisfacao(jid);

      } catch (err) {
        console.error(`❌ [TicketPoller] Erro ao verificar ticket #${sessao.ultimoTicketId}:`, err.message);
      }
    }
  } catch (err) {
    console.error("❌ [TicketPoller] Erro geral:", err.message);
  }
}

/**
 * Inicia o cron de verificação de tickets fechados.
 * @param {string} cronExpr - expressão cron (padrão: a cada 5 min)
 */
export function iniciarTicketClosedPoller(cronExpr = "*/5 * * * *") {
  if (task) {
    task.stop();
  }

  task = cron.schedule(cronExpr, verificarTicketsFechados);
  console.log(`📋 [TicketPoller] Monitoramento de tickets fechados ativo (${cronExpr})`);
}

export function pararTicketClosedPoller() {
  if (task) {
    task.stop();
    task = null;
  }
}
