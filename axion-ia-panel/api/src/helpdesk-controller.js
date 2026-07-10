import { buscarTickets, buscarTicket, buscarComentarios, responderTicket, buscarCategorias, criarTicketUsuario, listarTecnicos, buscarTicketsFiltrados } from "./jitbit.js";
import { gerarResposta } from "./engine.js";
import { salvarHistorico } from "./logger.js";
import * as scheduler from "./scheduler.js";

/**
 * GET /api/helpdesk/tickets — Lista tickets com filtros
 */
export async function listarTickets(req, res) {
  try {
    const mode       = parseInt(req.query.mode) || 0;
    const count      = parseInt(req.query.count) || 50;
    const sectionId  = req.query.sectionId  || null;
    const techId     = req.query.techId     || null;
    const userId     = req.query.userId     || null;
    const dateFrom   = req.query.dateFrom   || null;
    const dateTo     = req.query.dateTo     || null;
    const statusId   = req.query.statusId   !== undefined ? req.query.statusId : null;
    const priorityId = req.query.priorityId !== undefined ? req.query.priorityId : null;

    const tickets = await buscarTickets({ mode, count, sectionId, techId, userId, dateFrom, dateTo, statusId, priorityId });
    return res.json({ total: tickets.length, tickets });
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao buscar tickets", detalhe: error.message });
  }
}

/**
 * GET /api/helpdesk/ticket/:id — Detalhes de um ticket
 */
export async function detalheTicket(req, res) {
  try {
    const ticket = await buscarTicket(req.params.id);
    const comentarios = await buscarComentarios(req.params.id);
    return res.json({ ticket, comentarios });
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao buscar ticket", detalhe: error.message });
  }
}

/**
 * POST /api/helpdesk/classificar/:id — Classifica um ticket usando AxionIA
 */
export async function classificarTicket(req, res) {
  try {
    const ticket = await buscarTicket(req.params.id);
    const textoTicket = `${ticket.Subject || ""} ${ticket.Body || ""}`.trim();

    if (!textoTicket) {
      return res.status(400).json({ erro: "Ticket sem conteúdo para classificar" });
    }

    const resultado = await gerarResposta(textoTicket);

    return res.json({
      ticketId: req.params.id,
      assuntoOriginal: ticket.Subject,
      sugestaoResposta: resultado.resposta,
      origem: resultado.origem,
      score: resultado.score,
      autoEnviado: false
    });
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao classificar ticket", detalhe: error.message });
  }
}

/**
 * POST /api/helpdesk/responder/:id — Classifica E responde automaticamente
 */
export async function responderTicketIA(req, res) {
  try {
    const ticket = await buscarTicket(req.params.id);
    const textoTicket = `${ticket.Subject || ""} ${ticket.Body || ""}`.trim();

    if (!textoTicket) {
      return res.status(400).json({ erro: "Ticket sem conteúdo" });
    }

    const resultado = await gerarResposta(textoTicket);

    // Postar resposta no Jitbit
    await responderTicket(req.params.id, resultado.resposta);

    // Log da interação helpdesk
    salvarHistorico({
      mensagem: `[HELPDESK #${req.params.id}] ${textoTicket}`,
      origem: "helpdesk",
      resposta: resultado.resposta
    });

    return res.json({
      ticketId: req.params.id,
      assuntoOriginal: ticket.Subject,
      respostaEnviada: resultado.resposta,
      origem: resultado.origem,
      score: resultado.score,
      autoEnviado: true
    });
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao responder ticket", detalhe: error.message });
  }
}

/**
 * POST /api/helpdesk/processar — Processa todos os tickets não respondidos
 */
/**
 * Thresholds de confiança para decisão automática
 * score >= 0.85 → AUTO_RESPONDER (envia direto ao Jitbit)
 * score >= 0.65 → SUGERIR (retorna sugestão, não envia)
 * score < 0.65  → ESCALAR (marca para análise humana)
 */
const SCORE_AUTO = 0.85;
const SCORE_SUGERIR = 0.65;

function decidirAcao(score) {
  if (score >= SCORE_AUTO) return "AUTO_RESPONDER";
  if (score >= SCORE_SUGERIR) return "SUGERIR";
  return "ESCALAR";
}

export async function processarPendentes(req, res) {
  try {
    const autoEnviar = req.query.auto === "true";
    const tickets = await buscarTickets({ mode: 0, count: 50 });
    const resultados = [];

    for (const ticket of tickets) {
      const textoTicket = `${ticket.Subject || ""} ${ticket.Body || ""}`.trim();
      if (!textoTicket) continue;

      const resultado = await gerarResposta(textoTicket);
      const decisao = decidirAcao(resultado.score);
      let enviado = false;

      // Auto-enviar apenas se score alto E parâmetro auto=true
      if (autoEnviar && decisao === "AUTO_RESPONDER") {
        try {
          await responderTicket(ticket.TicketID, resultado.resposta);
          enviado = true;
          salvarHistorico({
            mensagem: `[HELPDESK-AUTO #${ticket.TicketID}] ${textoTicket}`,
            origem: "helpdesk-auto",
            resposta: resultado.resposta
          });
        } catch (_) { /* falha silenciosa — não bloqueia batch */ }
      }

      resultados.push({
        ticketId: ticket.TicketID,
        assunto: ticket.Subject,
        sugestao: resultado.resposta,
        origem: resultado.origem,
        score: resultado.score,
        decisao,
        autoEnviado: enviado
      });
    }

    const stats = {
      total: resultados.length,
      autoRespondidos: resultados.filter(r => r.autoEnviado).length,
      sugeridos: resultados.filter(r => r.decisao === "SUGERIR").length,
      escalados: resultados.filter(r => r.decisao === "ESCALAR").length
    };

    return res.json({
      ...stats,
      resultados
    });
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao processar pendentes", detalhe: error.message });
  }
}

/**
 * GET /api/helpdesk/categorias — Lista categorias do Jitbit
 */
export async function listarCategorias(req, res) {
  try {
    const categorias = await buscarCategorias();
    return res.json({ total: categorias.length, categorias });
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao buscar categorias", detalhe: error.message });
  }
}

/**
 * POST /api/helpdesk/criar — Cria chamado no Jitbit com credenciais do usuário
 */
export async function criarChamado(req, res) {
  try {
    const { email, senha, assunto, descricao } = req.body;
    if (!email || !senha || !assunto || !descricao) {
      return res.status(400).json({ erro: "Campos obrigatórios: email, senha, assunto, descricao" });
    }

    const resultado = await criarTicketUsuario(email, senha, assunto, descricao);

    salvarHistorico({
      mensagem: `[HELPDESK-NOVO] ${assunto} — ${email}`,
      origem: "helpdesk-widget",
      resposta: `Chamado #${resultado.ticketId} criado`
    });

    return res.json(resultado);
  } catch (error) {
    if (error.message === "AUTH_FAILED") {
      return res.status(401).json({ erro: "Login ou senha inválidos. Verifique suas credenciais do Help Desk." });
    }
    return res.status(500).json({ erro: "Erro ao criar chamado", detalhe: error.message });
  }
}

/**
 * GET /api/helpdesk/polling — Status do polling automático
 */
export function statusPolling(req, res) {
  return res.json(scheduler.obterStatus());
}

/**
 * POST /api/helpdesk/polling/iniciar — Ativa o polling
 * Body: { intervalo: 2 } (minutos, opcional)
 */
export function iniciarPolling(req, res) {
  const intervalo = req.body?.intervalo || process.env.POLLING_INTERVAL || 2;
  const status = scheduler.iniciar(intervalo);
  return res.json({ mensagem: "Polling iniciado", ...status });
}

/**
 * POST /api/helpdesk/polling/pausar — Pausa o polling
 */
export function pausarPolling(req, res) {
  const status = scheduler.pausar();
  return res.json({ mensagem: "Polling pausado", ...status });
}

/**
 * POST /api/helpdesk/polling/retomar — Retoma o polling pausado
 */
export function retomarPolling(req, res) {
  const status = scheduler.retomar();
  return res.json({ mensagem: "Polling retomado", ...status });
}

/**
 * POST /api/helpdesk/polling/limpar — Limpa cache de tickets vistos
 */
export function limparPolling(req, res) {
  const resultado = scheduler.limparTicketsVistos();
  return res.json({ mensagem: "Cache limpo", ...resultado });
}

// ── Fila de revisão ────────────────────────────────────────────────────────

/**
 * GET /api/helpdesk/fila — Retorna itens da fila de revisão humana
 */
export function obterFila(req, res) {
  return res.json(scheduler.obterFila());
}

/**
 * POST /api/helpdesk/fila/modo — Liga/desliga modo revisão
 */
export function setModoRevisao(req, res) {
  const { ativo } = req.body;
  return res.json(scheduler.setModoRevisao(ativo !== false));
}

/**
 * POST /api/helpdesk/fila/:id/aprovar — Aprova e envia resposta (com opcional edição)
 */
export async function aprovarFila(req, res) {
  try {
    const id = parseInt(req.params.id);
    const { resposta_editada } = req.body;
    const item = await scheduler.aprovarItem(id, resposta_editada || null);
    return res.json({ mensagem: "Resposta enviada ao Jitbit", item });
  } catch (err) {
    return res.status(400).json({ erro: err.message });
  }
}

/**
 * POST /api/helpdesk/fila/:id/rejeitar — Rejeita item da fila
 */
export function rejeitarFila(req, res) {
  try {
    const id = parseInt(req.params.id);
    const { motivo } = req.body;
    const item = scheduler.rejeitarItem(id, motivo || "");
    return res.json({ mensagem: "Item rejeitado", item });
  } catch (err) {
    return res.status(400).json({ erro: err.message });
  }
}

// ── Planilha de Horas ─────────────────────────────────────────────────────

/**
 * GET /api/helpdesk/tecnicos — Lista técnicos disponíveis no Jitbit
 */
export async function listarTecnicosHelpdesk(req, res) {
  try {
    const tecnicos = await listarTecnicos();
    return res.json({ tecnicos: Array.isArray(tecnicos) ? tecnicos : [] });
  } catch (err) {
    return res.status(500).json({ erro: "Erro ao listar técnicos", detalhe: err.message });
  }
}

/**
 * GET /api/helpdesk/planilha-horas
 * Query: tecnicoId, tecnicoNome, dataInicio (YYYY-MM-DD), dataFim (YYYY-MM-DD)
 *
 * Retorna atividades do técnico no período, formatadas para planilha.
 * Cada linha = 1 ticket encerrado onde o técnico foi responsável ou comentou.
 */
export async function gerarPlanilhaHoras(req, res) {
  const { tecnicoId, tecnicoNome, dataInicio, dataFim } = req.query;

  if (!dataInicio || !dataFim) {
    return res.status(400).json({ erro: "Parâmetros obrigatórios: dataInicio, dataFim (YYYY-MM-DD)" });
  }

  try {
    // Busca tickets no período, opcionalmente filtrado por técnico
    const tickets = await buscarTicketsFiltrados({
      tecnicoId: tecnicoId || null,
      dataInicio,
      dataFim,
      count: 500,
    });

    const dtInicio = new Date(dataInicio);
    const dtFim    = new Date(dataFim + "T23:59:59Z");

    // Filtra por data e, se não veio tecnicoId, filtra por nome parcial
    const filtrados = tickets.filter(t => {
      const dataRef = t.ResolvedDate || t.LastUpdated || t.IssueDate;
      const dt = new Date(dataRef);
      if (dt < dtInicio || dt > dtFim) return false;

      if (!tecnicoId && tecnicoNome) {
        const nomeCompleto = `${t.TechFirstName || ""} ${t.TechLastName || ""}`.toLowerCase();
        const email = (t.Technician || "").toLowerCase();
        const busca = tecnicoNome.toLowerCase();
        return nomeCompleto.includes(busca) || email.includes(busca);
      }
      return true;
    });

    // Monta linhas da planilha
    const linhas = filtrados.map(t => {
      const dataAtiv = t.ResolvedDate || t.LastUpdated || t.IssueDate;
      const data = new Date(dataAtiv);
      const dataFormatada = data.toLocaleDateString("pt-BR");
      const horasGastas = t.TimeSpentInSeconds > 0
        ? (t.TimeSpentInSeconds / 3600).toFixed(2).replace(".", ",")
        : "";

      const tecNome = [t.TechFirstName, t.TechLastName].filter(Boolean).join(" ") || t.Technician || "";
      const descricao = `Atendimento Help Desk - Chamado #${t.IssueID} - ${t.Subject}`;
      const cliente   = t.CompanyName || "";
      const categoria = t.Category || "";

      return {
        data: dataFormatada,
        dataISO: dataAtiv,
        chamado: t.IssueID,
        assunto: t.Subject,
        descricao,
        tecnico: tecNome,
        cliente,
        categoria,
        status: t.Status,
        horasGastas,
        url: `https://desk.axiontecnologia.com.br/helpdesk/Ticket/${t.IssueID}`,
      };
    });

    // Ordena por data crescente
    linhas.sort((a, b) => new Date(a.dataISO) - new Date(b.dataISO));

    return res.json({
      total: linhas.length,
      periodo: { dataInicio, dataFim },
      tecnico: tecnicoNome || tecnicoId || "Todos",
      linhas,
    });
  } catch (err) {
    return res.status(500).json({ erro: "Erro ao gerar planilha de horas", detalhe: err.message });
  }
}

// ── SLA Compliance ────────────────────────────────────────────────────────

/**
 * GET /api/helpdesk/sla-compliance
 * Query:
 *   dateFrom           YYYY-MM-DD  (obrigatório)
 *   dateTo             YYYY-MM-DD  (obrigatório)
 *   sectionId          ID da categoria/seção (opcional)
 *   priority           Low|Normal|High|Critical (opcional)
 *   responseTarget     horas meta de resposta    (default: 24)
 *   resolutionTarget   horas meta de resolução   (default: 72)
 *   count              máx tickets a buscar      (default: 300)
 *
 * Calcula SLA de resposta e resolução para cada ticket do período.
 * - Response time  = 1º comentário (tech) - data de criação
 * - Resolution time = ResolvedDate - data de criação (apenas tickets fechados)
 */
export async function relatarSlaCompliance(req, res) {
  const {
    dateFrom,
    dateTo,
    sectionId       = null,
    priority        = null,
    responseTarget  = "24",
    resolutionTarget = "72",
    count           = "300",
  } = req.query;

  if (!dateFrom || !dateTo) {
    return res.status(400).json({ erro: "Parâmetros obrigatórios: dateFrom, dateTo (YYYY-MM-DD)" });
  }

  const responseTargetMin   = Number(responseTarget)   * 60;   // converte h → min
  const resolutionTargetMin = Number(resolutionTarget) * 60;

  try {
    const todos = await buscarTicketsFiltrados({
      dataInicio: dateFrom,
      dataFim:    dateTo,
      count:      Math.min(Number(count), 500),
    });

    // Filtra por data de criação, seção e prioridade
    const dtInicio = new Date(dateFrom);
    const dtFim    = new Date(dateTo + "T23:59:59Z");

    const filtrados = todos.filter(t => {
      const dt = new Date(t.IssueDate);
      if (isNaN(dt) || dt < dtInicio || dt > dtFim) return false;
      if (sectionId && String(t.CategoryID) !== String(sectionId)) return false;
      if (priority  && (t.Priority || "").toLowerCase() !== priority.toLowerCase()) return false;
      return true;
    });

    // Busca primeiro comentário REAL (não-sistema) de cada ticket em paralelo — lotes de 8
    const primeiraResposta = new Map(); // IssueID → Date
    const LOTE = 8;
    for (let i = 0; i < filtrados.length; i += LOTE) {
      const lote = filtrados.slice(i, i + LOTE);
      const resultados = await Promise.allSettled(
        lote.map(async t => {
          const comentarios = await buscarComentarios(t.IssueID);
          const lista = Array.isArray(comentarios) ? comentarios : [];
          // Filtra comentários de sistema (automáticos) — IsSystem === true
          const primeiroReal = lista.find(c => !c.IsSystem);
          // Campo real do Jitbit: CommentDate (fallback para outros nomes)
          const dataStr = primeiroReal
            ? (primeiroReal.CommentDate ?? primeiroReal.PostedDate ?? primeiroReal.Date ?? primeiroReal.Created ?? null)
            : null;
          return { id: t.IssueID, dataStr };
        })
      );
      for (const r of resultados) {
        if (r.status === "fulfilled" && r.value.dataStr) {
          const dt = new Date(r.value.dataStr);
          if (!isNaN(dt)) primeiraResposta.set(r.value.id, dt);
        }
      }
    }

    // Monta linha por ticket
    const JITBIT_BASE = "https://desk.axiontecnologia.com.br";

    const tickets = filtrados.map(t => {
      const criado = new Date(t.IssueDate);

      // ── Response SLA ─────────────────────────────────────────────────────
      const dtResposta    = primeiraResposta.get(t.IssueID) ?? null;
      const responseMins  = dtResposta ? Math.round((dtResposta - criado) / 60000) : null;
      const responseSla   = responseMins !== null
        ? (responseMins <= responseTargetMin ? "Met" : "Breached")
        : null;

      // ── Resolution SLA ───────────────────────────────────────────────────
      const dtResolucao      = t.ResolvedDate ? new Date(t.ResolvedDate) : null;
      const resolutionMins   = dtResolucao ? Math.round((dtResolucao - criado) / 60000) : null;
      const resolutionSla    = resolutionMins !== null
        ? (resolutionMins <= resolutionTargetMin ? "Met" : "Breached")
        : null; // ticket ainda aberto → sem avaliação

      return {
        ticketId:       t.IssueID,
        assunto:        t.Subject || "",
        prioridade:     t.Priority || "Normal",
        categoria:      t.Category || "",
        status:         t.Status || "",
        criado:         t.IssueDate,
        responseMins,
        responseSla,
        resolutionMins,
        resolutionSla,
        url: `${JITBIT_BASE}/helpdesk/Ticket/${t.IssueID}`,
      };
    });

    // ── Agregados ─────────────────────────────────────────────────────────
    const comResposta    = tickets.filter(t => t.responseSla   !== null);
    const comResolucao   = tickets.filter(t => t.resolutionSla !== null);
    const responseMet    = comResposta.filter(t => t.responseSla   === "Met").length;
    const resolutionMet  = comResolucao.filter(t => t.resolutionSla === "Met").length;

    const pct = (num, den) =>
      den > 0 ? Math.round((num / den) * 1000) / 10 : null;

    return res.json({
      periodo:      { dateFrom, dateTo },
      configuracao: {
        responseTarget:   Number(responseTarget),
        resolutionTarget: Number(resolutionTarget),
      },
      totais: {
        total:      tickets.length,
        response: {
          avaliados:  comResposta.length,
          met:        responseMet,
          breached:   comResposta.length - responseMet,
          percentual: pct(responseMet, comResposta.length),
        },
        resolution: {
          avaliados:  comResolucao.length,
          met:        resolutionMet,
          breached:   comResolucao.length - resolutionMet,
          percentual: pct(resolutionMet, comResolucao.length),
        },
      },
      tickets,
    });
  } catch (err) {
    return res.status(500).json({ erro: "Erro ao calcular SLA compliance", detalhe: err.message });
  }
}

