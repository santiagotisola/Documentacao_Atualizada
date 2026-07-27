/**
 * 🚦 AXHUB CONTROLLER
 * 
 * Controller para AxHub (sistema de fiscalização eletrônica)
 * Refatorado para usar generic-product-controller
 * 
 * @refactor Fase 1 - Quick Wins (2026-06-21)
 */

import { conectar } from "./services/axhub-db.js";
import * as dbService from "./services/axhub-db.js";
import { createProductController } from "./controllers/products/generic-product.controller.js";
import { AXHUB_CONFIG } from "./config/products-config.js";

// ═══════════════════════════════════════════════════════════════════
// FUNÇÕES GENÉRICAS (via generic-product-controller)
// ═══════════════════════════════════════════════════════════════════

const baseController = createProductController(dbService, AXHUB_CONFIG);

// Exporta funções genéricas diretamente do base controller
export const statusConexao = baseController.statusConexao;
export const resumoGeral = baseController.resumoGeral;
export const listarEquipamentos = baseController.listarEquipamentos;
export const heartbeatEquipamentos = baseController.heartbeatEquipamentos;
export const listarTabelas = baseController.listarTabelas;

// ═══════════════════════════════════════════════════════════════════
// FUNÇÕES ESPECÍFICAS DO AXHUB
// ═══════════════════════════════════════════════════════════════════

// GET /api/axhub/operacoes — últimas operações
export async function listarOperacoes(req, res) {
  try {
    const pool = await conectar();
    const result = await pool.request().query(`
      SELECT TOP 50
        o.IdOperacao,
        o.DataHoraInicio,
        o.DataHoraFim,
        e.Descricao AS Equipamento,
        l.Descricao AS Local
      FROM TBOperacoes o
      LEFT JOIN TBEquipamentos e ON o.IdEquipamento = e.IdEquipamento
      LEFT JOIN TBLocais l       ON o.IdLocal       = l.IdLocal
      ORDER BY o.DataHoraInicio DESC
    `);

    return res.json({ total: result.recordset.length, operacoes: result.recordset });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// GET /api/axhub/infracoes/stats — estatísticas de infrações
export async function statsInfracoes(req, res) {
  try {
    const pool = await conectar();

    const [total, porEnquadramento, ultimas] = await Promise.all([
      pool.request().query("SELECT COUNT(*) AS total FROM TBInfracoes"),
      pool.request().query(`
        SELECT TOP 10
          en.Descricao AS Enquadramento,
          COUNT(*)     AS Total
        FROM TBInfracoes i
        JOIN TBInfracoesEnquadramentos ie ON i.IdInfracao = ie.IdInfracao
        JOIN TBEnquadramentos en          ON ie.IdEnquadramento = en.IdEnquadramento
        GROUP BY en.Descricao
        ORDER BY Total DESC
      `),
      pool.request().query(`
        SELECT TOP 10
          i.IdInfracao,
          i.DataHoraInfracao,
          i.Placa,
          e.Descricao AS Equipamento
        FROM TBInfracoes i
        LEFT JOIN TBEquipamentos e ON i.IdEquipamento = e.IdEquipamento
        ORDER BY i.DataHoraInfracao DESC
      `)
    ]);

    return res.json({
      total: total.recordset[0].total,
      porEnquadramento: porEnquadramento.recordset,
      ultimas: ultimas.recordset
    });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// GET /api/axhub/monitoramentos — veículos monitorados com alertas recentes
export async function listarMonitoramentos(req, res) {
  try {
    const pool = await conectar();

    const [ativos, ultimas] = await Promise.all([
      pool.request().query(`
        SELECT COUNT(*) AS total FROM TBMonitoramentos WHERE Ativo = 1
      `),
      pool.request().query(`
        SELECT TOP 20
          pm.IdPassagemMonitoramento,
          pm.DataHora,
          pm.Placa,
          e.Descricao  AS Equipamento,
          l.Descricao  AS Local
        FROM TBPassagensMonitoramentos pm
        LEFT JOIN TBEquipamentos e ON pm.IdEquipamento = e.IdEquipamento
        LEFT JOIN TBLocais l       ON pm.IdLocal = l.IdLocal
        ORDER BY pm.DataHora DESC
      `)
    ]);

    return res.json({
      monitoramentosAtivos: ativos.recordset[0].total,
      ultimasDeteccoes: ultimas.recordset
    });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// GET /api/axhub/passagens — últimas passagens registradas
export async function ultimasPassagens(req, res) {
  try {
    const pool = await conectar();
    const result = await pool.request().query(`
      SELECT TOP 20
        p.IdPassagem,
        p.DataHoraPassagem,
        p.Placa,
        p.Velocidade,
        e.Descricao AS Equipamento,
        l.Descricao AS Local,
        f.Descricao AS Faixa
      FROM TBPassagens p
      LEFT JOIN TBEquipamentos e ON p.IdEquipamento = e.IdEquipamento
      LEFT JOIN TBLocais l       ON p.IdLocal = l.IdLocal
      LEFT JOIN TBFaixas f       ON p.IdFaixa = f.IdFaixa
      ORDER BY p.DataHoraPassagem DESC
    `);

    return res.json({ total: result.recordset.length, passagens: result.recordset });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// GET /api/axhub/triagens — status das triagens (pendentes, aprovadas, descartadas)
export async function statsTriagens(req, res) {
  try {
    const pool = await conectar();
    const result = await pool.request().query(`
      SELECT
        Status,
        COUNT(*) AS Total
      FROM TBTriagens
      GROUP BY Status
      ORDER BY Total DESC
    `);

    return res.json({ porStatus: result.recordset });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// GET /api/axhub/mapa-passagens — heatmap de passagens por hora×dia (igual ao Mapa de Teste AxHub)
// Query params: equipamento (descrição ou parte), mes (YYYY-MM, default=mês atual)
export async function mapaPassagens(req, res) {
  try {
    const pool = await conectar();
    const { equipamento, mes } = req.query;

    // Calcular período
    const mesRef = mes ? new Date(mes + "-01") : new Date();
    const anoMes = `${mesRef.getFullYear()}-${String(mesRef.getMonth() + 1).padStart(2, "0")}`;
    const dataInicio = `${anoMes}-01`;
    const dataFim    = new Date(mesRef.getFullYear(), mesRef.getMonth() + 1, 0);
    const dataFimStr = `${anoMes}-${String(dataFim.getDate()).padStart(2, "0")}`;

    // Buscar equipamentos que correspondem ao filtro
    let equipFilter = "";
    let request = pool.request();
    if (equipamento) {
      equipFilter = "AND UPPER(e.Descricao) LIKE UPPER(@eq)";
      request.input("eq", `%${equipamento}%`);
    }
    request.input("inicio", new Date(dataInicio));
    request.input("fim",    new Date(dataFimStr + "T23:59:59"));

    // Passagens agrupadas por equipamento, faixa, dia e hora
    const result = await request.query(`
      SELECT
        e.Descricao                          AS Equipamento,
        ISNULL(f.Descricao, 'Faixa 1')      AS Faixa,
        DAY(p.DataHoraPassagem)              AS Dia,
        DATEPART(HOUR, p.DataHoraPassagem)   AS Hora,
        COUNT(*)                             AS Total,
        MAX(p.DataHoraPassagem)              AS UltimaPassagem,
        AVG(CAST(p.Velocidade AS FLOAT))     AS VelocidadeMedia
      FROM TBPassagens p
      LEFT JOIN TBEquipamentos e ON p.IdEquipamento = e.IdEquipamento
      LEFT JOIN TBFaixas f       ON p.IdFaixa = f.IdFaixa
      WHERE p.DataHoraPassagem >= @inicio
        AND p.DataHoraPassagem <= @fim
        ${equipFilter}
      GROUP BY e.Descricao, f.Descricao, DAY(p.DataHoraPassagem), DATEPART(HOUR, p.DataHoraPassagem)
      ORDER BY e.Descricao, f.Descricao, DAY(p.DataHoraPassagem), DATEPART(HOUR, p.DataHoraPassagem)
    `);

    // Resumo por equipamento
    const resumoReq = pool.request();
    resumoReq.input("inicio", new Date(dataInicio));
    resumoReq.input("fim",    new Date(dataFimStr + "T23:59:59"));
    if (equipamento) resumoReq.input("eq", `%${equipamento}%`);

    const resumo = await resumoReq.query(`
      SELECT
        e.Descricao                         AS Equipamento,
        e.NumeroSerie                       AS Serial,
        COUNT(*)                            AS TotalPassagens,
        COUNT(DISTINCT DAY(p.DataHoraPassagem)) AS DiasComPassagem,
        MIN(p.DataHoraPassagem)             AS PrimeiraPassagem,
        MAX(p.DataHoraPassagem)             AS UltimaPassagem,
        AVG(CAST(p.Velocidade AS FLOAT))    AS VelocidadeMedia,
        MAX(h.DataHora)                     AS UltimoHeartbeat,
        DATEDIFF(MINUTE, MAX(h.DataHora), GETDATE()) AS MinutosSemHeartbeat
      FROM TBPassagens p
      LEFT JOIN TBEquipamentos e ON p.IdEquipamento = e.IdEquipamento
      LEFT JOIN TBHeartbeatEquipamentos h ON h.IdEquipamento = p.IdEquipamento
      WHERE p.DataHoraPassagem >= @inicio
        AND p.DataHoraPassagem <= @fim
        ${equipFilter}
      GROUP BY e.Descricao, e.NumeroSerie
      ORDER BY TotalPassagens DESC
    `);

    // Organizar em grade dia×hora por equipamento/faixa
    const equipamentos = {};
    result.recordset.forEach(row => {
      const key = `${row.Equipamento}||${row.Faixa}`;
      if (!equipamentos[key]) {
        equipamentos[key] = { equipamento: row.Equipamento, faixa: row.Faixa, grade: {} };
      }
      const cel = `${row.Dia}_${row.Hora}`;
      equipamentos[key].grade[cel] = { total: row.Total, ultima: row.UltimaPassagem, velMedia: Math.round(row.VelocidadeMedia || 0) };
    });

    // Calcular estatísticas de cobertura
    const totalHorasNoMes = dataFim.getDate() * 24;
    const listaEquipamentos = Object.values(equipamentos).map(eq => {
      const celulasCom = Object.keys(eq.grade).length;
      const cobertura  = Math.round((celulasCom / totalHorasNoMes) * 100);
      return { ...eq, celulasCom, totalHorasNoMes, cobertura };
    });

    return res.json({
      ok: true,
      periodo: { mes: anoMes, inicio: dataInicio, fim: dataFimStr, totalDias: dataFim.getDate(), totalHoras: totalHorasNoMes },
      equipamentos: listaEquipamentos,
      resumo: resumo.recordset,
      totalLinhas: result.recordset.length
    });
  } catch (err) {
    return res.status(500).json({ ok: false, erro: err.message });
  }
}

// GET /api/axhub/depara-passagens — De-Para de passagens entre dois equipamentos
// Query params: eq1=GOEC60059, eq2=GOEC60054, mes=2026-07
export async function deParaPassagens(req, res) {
  try {
    const pool = await conectar();
    const { eq1, eq2, mes } = req.query;
    if (!eq1 || !eq2) return res.status(400).json({ ok: false, erro: "Parâmetros eq1 e eq2 são obrigatórios" });

    const mesRef = mes ? new Date(mes + "-01") : new Date();
    const anoMes = `${mesRef.getFullYear()}-${String(mesRef.getMonth() + 1).padStart(2, "0")}`;
    const dataInicio = `${anoMes}-01`;
    const dataFim    = new Date(mesRef.getFullYear(), mesRef.getMonth() + 1, 0);
    const dataFimStr = `${anoMes}-${String(dataFim.getDate()).padStart(2, "0")}`;

    const request = pool.request();
    request.input("eq1", `%${eq1}%`);
    request.input("eq2", `%${eq2}%`);
    request.input("inicio", new Date(dataInicio));
    request.input("fim",    new Date(dataFimStr + "T23:59:59"));

    // Passagens por hora para os dois equipamentos
    const result = await request.query(`
      SELECT
        e.Descricao                          AS Equipamento,
        DATEPART(HOUR, p.DataHoraPassagem)   AS Hora,
        COUNT(*)                             AS Total,
        AVG(CAST(p.Velocidade AS FLOAT))     AS VelMedia
      FROM TBPassagens p
      LEFT JOIN TBEquipamentos e ON p.IdEquipamento = e.IdEquipamento
      WHERE p.DataHoraPassagem >= @inicio
        AND p.DataHoraPassagem <= @fim
        AND (UPPER(e.Descricao) LIKE UPPER(@eq1) OR UPPER(e.Descricao) LIKE UPPER(@eq2))
      GROUP BY e.Descricao, DATEPART(HOUR, p.DataHoraPassagem)
      ORDER BY e.Descricao, Hora
    `);

    // Resumo dos dois
    const req2 = pool.request();
    req2.input("eq1", `%${eq1}%`);
    req2.input("eq2", `%${eq2}%`);
    req2.input("inicio", new Date(dataInicio));
    req2.input("fim",    new Date(dataFimStr + "T23:59:59"));

    const resumo = await req2.query(`
      SELECT
        e.Descricao                         AS Equipamento,
        e.NumeroSerie                       AS Serial,
        te.Descricao                        AS Tipo,
        f2.Descricao                        AS Fabricante,
        COUNT(*)                            AS TotalPassagens,
        COUNT(DISTINCT DAY(p.DataHoraPassagem)) AS DiasComPassagem,
        COUNT(DISTINCT DATEPART(HOUR, p.DataHoraPassagem)) AS HorasDistintas,
        MIN(p.DataHoraPassagem)             AS PrimeiraPassagem,
        MAX(p.DataHoraPassagem)             AS UltimaPassagem,
        AVG(CAST(p.Velocidade AS FLOAT))    AS VelocidadeMedia,
        MAX(h.DataHora)                     AS UltimoHeartbeat,
        DATEDIFF(MINUTE, MAX(h.DataHora), GETDATE()) AS MinutosSemHeartbeat,
        CASE WHEN DATEDIFF(MINUTE, MAX(h.DataHora), GETDATE()) < 5 THEN 'online'
             WHEN DATEDIFF(MINUTE, MAX(h.DataHora), GETDATE()) < 60 THEN 'atencao'
             ELSE 'offline' END             AS StatusHeartbeat
      FROM TBPassagens p
      LEFT JOIN TBEquipamentos e ON p.IdEquipamento = e.IdEquipamento
      LEFT JOIN TBTipoEquipamentos te ON e.IdTipoEquipamento = te.IdTipoEquipamento
      LEFT JOIN TBFabricantes f2 ON e.IdFabricante = f2.IdFabricante
      LEFT JOIN TBHeartbeatEquipamentos h ON h.IdEquipamento = p.IdEquipamento
      WHERE p.DataHoraPassagem >= @inicio
        AND p.DataHoraPassagem <= @fim
        AND (UPPER(e.Descricao) LIKE UPPER(@eq1) OR UPPER(e.Descricao) LIKE UPPER(@eq2))
      GROUP BY e.Descricao, e.NumeroSerie, te.Descricao, f2.Descricao
      ORDER BY TotalPassagens DESC
    `);

    // Organizar por equipamento
    const porEquipamento = {};
    result.recordset.forEach(r => {
      if (!porEquipamento[r.Equipamento]) porEquipamento[r.Equipamento] = Array(24).fill(0);
      porEquipamento[r.Equipamento][r.Hora] = r.Total;
    });

    return res.json({
      ok: true,
      periodo: { mes: anoMes, inicio: dataInicio, fim: dataFimStr },
      porHora: porEquipamento,
      resumo: resumo.recordset
    });
  } catch (err) {
    return res.status(500).json({ ok: false, erro: err.message });
  }
}
