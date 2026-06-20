import { buscarTickets, buscarCategorias } from "./jitbit.js";
import {
  getMapaCompleto,
  getMapaFlat,
  getSiteIdPorTicket,
  detectarSistema,
  associarManual,
  removerAssociacao,
  getAssociacoesManuais,
  getCategoriasNaoAssociadas,
} from "./mapa-sites-helpdesk.js";

/**
 * GET /api/helpdesk/sites-overview
 * Retorna visão consolidada: categorias × sites × tickets agrupados
 * Query: mode (unclosed|all), count (max 300)
 */
export async function sitesOverview(req, res) {
  try {
    const mode = req.query.mode || "unclosed";
    const count = Math.min(parseInt(req.query.count) || 300, 300);

    const [categorias, tickets] = await Promise.all([
      buscarCategorias(),
      buscarTickets({ mode, count }),
    ]);

    const mapa = getMapaCompleto();

    // Agrupar tickets por categoryId
    const ticketsPorCategoria = {};
    for (const t of tickets) {
      const catId = t.CategoryID;
      if (!ticketsPorCategoria[catId]) ticketsPorCategoria[catId] = [];
      ticketsPorCategoria[catId].push(t);
    }

    // Montar resultado por site (detecta sistema pelo assunto do ticket)
    const porSite = {};
    const naoAssociados = [];

    for (const cat of categorias) {
      const entry = mapa[cat.CategoryID];
      const catTickets = ticketsPorCategoria[cat.CategoryID] || [];

      if (!entry) {
        if (catTickets.length > 0) {
          naoAssociados.push({
            categoriaId: cat.CategoryID,
            categoriaNome: cat.Name,
            secao: cat.Section,
            tickets: catTickets.length,
            abertos: catTickets.filter(t => t.StatusID !== 3).length,
            ultimoTicket: catTickets.length > 0
              ? catTickets.sort((a, b) => new Date(b.LastUpdated) - new Date(a.LastUpdated))[0]
              : null,
          });
        }
        continue;
      }

      // Para cada ticket, detectar sistema e atribuir ao site correto
      for (const t of catTickets) {
        const siteId = getSiteIdPorTicket(cat.CategoryID, t.Subject);
        if (!siteId) continue;

        if (!porSite[siteId]) {
          porSite[siteId] = {
            siteId,
            sistema: detectarSistema(t.Subject),
            categorias: [],
            tickets: [],
            metricas: { total: 0, abertos: 0, fechados: 0, criticos: 0, alta: 0, normal: 0, baixa: 0 },
          };
        }

        // Adicionar categoria se ainda não estiver
        if (!porSite[siteId].categorias.find(c => c.id === cat.CategoryID)) {
          porSite[siteId].categorias.push({
            id: cat.CategoryID,
            nome: cat.Name,
            secao: cat.Section,
          });
        }

        porSite[siteId].tickets.push(t);
        porSite[siteId].metricas.total++;
        if (t.StatusID === 3) porSite[siteId].metricas.fechados++;
        else porSite[siteId].metricas.abertos++;
        if (t.Priority === 2) porSite[siteId].metricas.criticos++;
        else if (t.Priority === 1) porSite[siteId].metricas.alta++;
        else if (t.Priority === 0) porSite[siteId].metricas.normal++;
        else porSite[siteId].metricas.baixa++;
      }
    }

    // KPIs globais
    const kpis = {
      totalTickets: tickets.length,
      abertos: tickets.filter(t => t.StatusID !== 3).length,
      fechados: tickets.filter(t => t.StatusID === 3).length,
      criticos: tickets.filter(t => t.Priority === 2).length,
      semResposta: tickets.filter(t => t.UpdatedByUser && !t.UpdatedByPerformer).length,
      sitesComDemanda: Object.keys(porSite).filter(k => porSite[k].metricas.abertos > 0).length,
      categoriasNaoAssociadas: naoAssociados.length,
    };

    // Top sites por volume
    const ranking = Object.values(porSite)
      .sort((a, b) => b.metricas.abertos - a.metricas.abertos)
      .map(s => ({
        siteId: s.siteId,
        abertos: s.metricas.abertos,
        total: s.metricas.total,
        criticos: s.metricas.criticos,
      }));

    // Análise de duplicatas (tickets com assuntos semelhantes)
    const assuntosNorm = {};
    for (const t of tickets) {
      const key = (t.Subject || "")
        .toLowerCase()
        .replace(/[^a-záàâãéèêíïóôõöúçñ ]/g, "")
        .replace(/\s+/g, " ")
        .trim();
      if (key.length < 5) continue;
      if (!assuntosNorm[key]) assuntosNorm[key] = [];
      assuntosNorm[key].push({ id: t.IssueID, subject: t.Subject, categoryId: t.CategoryID, status: t.Status });
    }
    const possivelDuplicados = Object.entries(assuntosNorm)
      .filter(([, arr]) => arr.length > 1)
      .map(([assunto, arr]) => ({ assuntoNormalizado: assunto, quantidade: arr.length, tickets: arr }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 20);

    // Tickets resumidos por site (sem body pesado)
    const sitesResumo = Object.values(porSite).map(s => ({
      siteId: s.siteId,
      categorias: s.categorias,
      metricas: s.metricas,
      ticketsAbertos: s.tickets
        .filter(t => t.StatusID !== 3)
        .sort((a, b) => new Date(b.LastUpdated) - new Date(a.LastUpdated))
        .slice(0, 10)
        .map(t => ({
          id: t.IssueID,
          assunto: t.Subject,
          status: t.Status,
          prioridade: t.Priority,
          criadoEm: t.IssueDate,
          atualizado: t.LastUpdated,
          tecnico: t.TechFirstName ? `${t.TechFirstName} ${t.TechLastName || ""}`.trim() : null,
        })),
    }));

    return res.json({
      kpis,
      ranking,
      sitesResumo,
      naoAssociados,
      possivelDuplicados,
      mapa: getMapaFlat(),
      associacoesManuais: getAssociacoesManuais(),
    });
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao gerar overview", detalhe: error.message });
  }
}

/**
 * GET /api/helpdesk/mapa-sites
 * Retorna o mapeamento atual categorias ↔ sites
 */
export async function obterMapa(req, res) {
  try {
    const categorias = await buscarCategorias();
    const mapa = getMapaFlat();
    const manuais = getAssociacoesManuais();

    const resultado = categorias.map(cat => ({
      categoriaId: cat.CategoryID,
      categoriaNome: cat.Name,
      secao: cat.Section,
      siteAssociado: mapa[cat.CategoryID] || null,
      associacaoManual: !!manuais[cat.CategoryID],
    }));

    const naoAssociadas = resultado.filter(r => !r.siteAssociado);

    return res.json({
      total: resultado.length,
      associadas: resultado.filter(r => r.siteAssociado).length,
      naoAssociadas: naoAssociadas.length,
      mapeamentos: resultado,
      categoriasLivres: naoAssociadas,
    });
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao obter mapa", detalhe: error.message });
  }
}

/**
 * POST /api/helpdesk/mapa-sites
 * Associa manualmente uma categoria a um site
 * Body: { categoriaId, siteId }
 */
export function associarSite(req, res) {
  const { categoriaId, siteId } = req.body;
  if (!categoriaId || !siteId) {
    return res.status(400).json({ erro: "Campos obrigatórios: categoriaId, siteId" });
  }
  associarManual(parseInt(categoriaId), siteId);
  return res.json({ mensagem: "Associação criada", categoriaId, siteId, mapa: getMapaFlat() });
}

/**
 * DELETE /api/helpdesk/mapa-sites/:categoriaId
 * Remove associação manual
 */
export function desassociarSite(req, res) {
  const catId = parseInt(req.params.categoriaId);
  removerAssociacao(catId);
  return res.json({ mensagem: "Associação removida", categoriaId: catId });
}

/**
 * GET /api/helpdesk/site/:siteId/tickets
 * Retorna tickets de um site específico
 */
export async function ticketsPorSite(req, res) {
  try {
    const { siteId } = req.params;
    const mode = req.query.mode || "all";
    const count = Math.min(parseInt(req.query.count) || 100, 300);
    const mapa = getMapaFlat();

    // Encontrar categoryIds que mapeiam para este site
    const categoryIds = Object.entries(mapa)
      .filter(([, sid]) => sid === siteId)
      .map(([catId]) => parseInt(catId));

    if (categoryIds.length === 0) {
      return res.json({ siteId, tickets: [], total: 0, aviso: "Nenhuma categoria associada a este site" });
    }

    // Buscar tickets de cada categoria
    const allTickets = [];
    for (const catId of categoryIds) {
      const tickets = await buscarTickets({ mode, count, categoryId: catId });
      allTickets.push(...tickets);
    }

    // Ordenar por data
    allTickets.sort((a, b) => new Date(b.LastUpdated) - new Date(a.LastUpdated));

    // Métricas
    const metricas = {
      total: allTickets.length,
      abertos: allTickets.filter(t => t.StatusID !== 3).length,
      fechados: allTickets.filter(t => t.StatusID === 3).length,
      criticos: allTickets.filter(t => t.Priority === 2).length,
      tempoMedioResolucao: calcularTempoMedio(allTickets.filter(t => t.ResolvedDate)),
    };

    return res.json({
      siteId,
      categoryIds,
      metricas,
      tickets: allTickets.map(t => ({
        id: t.IssueID,
        assunto: t.Subject,
        status: t.Status,
        statusId: t.StatusID,
        prioridade: t.Priority,
        categoria: t.Category,
        criadoEm: t.IssueDate,
        atualizado: t.LastUpdated,
        resolvido: t.ResolvedDate,
        tecnico: t.TechFirstName ? `${t.TechFirstName} ${t.TechLastName || ""}`.trim() : null,
        criador: t.UserName,
      })),
    });
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao buscar tickets do site", detalhe: error.message });
  }
}

function calcularTempoMedio(ticketsResolvidos) {
  if (ticketsResolvidos.length === 0) return null;
  const tempos = ticketsResolvidos.map(t => {
    const inicio = new Date(t.IssueDate);
    const fim = new Date(t.ResolvedDate);
    return (fim - inicio) / (1000 * 60 * 60); // horas
  });
  const media = tempos.reduce((a, b) => a + b, 0) / tempos.length;
  return Math.round(media * 10) / 10; // 1 decimal
}
