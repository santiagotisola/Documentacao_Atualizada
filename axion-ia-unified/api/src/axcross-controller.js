/**
 * 📡 AXCROSS CONTROLLER
 * 
 * Controller para AxCross (sistema de cruzamento e monitoramento veicular)
 * Refatorado para usar generic-product-controller
 * 
 * @refactor Fase 1 - Quick Wins (2026-06-21)
 */

import { conectar } from "./services/axcross-db.js";
import * as dbService from "./services/axcross-db.js";
import { createProductController } from "./controllers/products/generic-product.controller.js";
import { AXCROSS_CONFIG } from "./config/products-config.js";

// ═══════════════════════════════════════════════════════════════════
// FUNÇÕES GENÉRICAS (via generic-product-controller)
// ═══════════════════════════════════════════════════════════════════

const baseController = createProductController(dbService, AXCROSS_CONFIG);

// Exporta funções genéricas diretamente do base controller
export const statusConexao = baseController.statusConexao;
export const resumoGeral = baseController.resumoGeral;
export const listarEquipamentos = baseController.listarEquipamentos;
export const heartbeatEquipamentos = baseController.heartbeatEquipamentos;
export const listarTabelas = baseController.listarTabelas;

// ═══════════════════════════════════════════════════════════════════
// FUNÇÕES ESPECÍFICAS DO AXCROSS
// ═══════════════════════════════════════════════════════════════════

// GET /api/axcross/passagens
export async function statsPassagens(req, res) {
  try {
    const pool = await conectar();

    const total = await pool.request().query("SELECT COUNT(*) AS total FROM TBPassagens");

    const porLocal = await pool.request().query(`
      SELECT TOP 10 l.Nome, COUNT(*) AS total
      FROM TBPassagens p
      JOIN TBLocais l ON p.LocalId = l.Id
      GROUP BY l.Nome
      ORDER BY total DESC
    `);

    const ultimas = await pool.request().query(`
      SELECT TOP 10
        p.Id, p.Placa, p.DataPassagem, p.Velocidade,
        l.Nome AS Local, f.Nome AS Faixa
      FROM TBPassagens p
      LEFT JOIN TBLocais l ON p.LocalId = l.Id
      LEFT JOIN TBFaixas f ON p.FaixaId = f.Id
      ORDER BY p.DataPassagem DESC
    `);

    return res.json({
      total: total.recordset[0].total,
      porLocal: porLocal.recordset,
      ultimas: ultimas.recordset
    });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// GET /api/axcross/locais — locais de cruzamento cadastrados
export async function listarLocais(req, res) {
  try {
    const pool = await conectar();
    const result = await pool.request().query(`
      SELECT
        l.Id, l.Nome, l.Endereco, l.Cidade, l.UF, l.Ativo,
        l.Latitude, l.Longitude,
        COUNT(e.Id) AS TotalEquipamentos
      FROM TBLocais l
      LEFT JOIN TBEquipamentos e ON e.LocalId = l.Id
      GROUP BY l.Id, l.Nome, l.Endereco, l.Cidade, l.UF, l.Ativo, l.Latitude, l.Longitude
      ORDER BY l.Nome
    `);

    return res.json({ total: result.recordset.length, locais: result.recordset });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// GET /api/axcross/operacoes — operações de monitoramento recentes
export async function listarOperacoes(req, res) {
  try {
    const pool = await conectar();
    const result = await pool.request().query(`
      SELECT TOP 50
        o.Id, o.Descricao, o.DataInicio, o.DataFim, o.Status,
        l.Nome AS Local,
        e.Nome AS Equipamento
      FROM TBOperacoes o
      LEFT JOIN TBLocais      l ON o.LocalId       = l.Id
      LEFT JOIN TBEquipamentos e ON o.EquipamentoId = e.Id
      ORDER BY o.DataInicio DESC
    `);

    return res.json({ total: result.recordset.length, operacoes: result.recordset });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}
