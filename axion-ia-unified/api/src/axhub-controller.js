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
