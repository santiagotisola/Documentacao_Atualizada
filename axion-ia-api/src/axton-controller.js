/**
 * ⚖️ AXTON CONTROLLER
 * 
 * Controller para AxTon (sistema de pesagem veicular)
 * Refatorado para usar generic-product-controller
 * 
 * @refactor Fase 1 - Quick Wins (2026-06-21)
 */

import { conectar } from "./services/axton-db.js";
import * as dbService from "./services/axton-db.js";
import { createProductController } from "./controllers/products/generic-product.controller.js";
import { AXTON_CONFIG } from "./config/products-config.js";

// ═══════════════════════════════════════════════════════════════════
// FUNÇÕES GENÉRICAS (via generic-product-controller)
// ═══════════════════════════════════════════════════════════════════

const baseController = createProductController(dbService, AXTON_CONFIG);

// Exporta funções genéricas diretamente do base controller
export const statusConexao = baseController.statusConexao;
export const resumoGeral = baseController.resumoGeral;
export const listarEquipamentos = baseController.listarEquipamentos;
export const heartbeatEquipamentos = baseController.heartbeatEquipamentos;
export const listarTabelas = baseController.listarTabelas;

// ═══════════════════════════════════════════════════════════════════
// FUNÇÕES ESPECÍFICAS DO AXTON
// ═══════════════════════════════════════════════════════════════════

// GET /api/axton/pesagens — últimas pesagens registradas
export async function ultimasPesagens(req, res) {
  try {
    const pool = await conectar();
    const result = await pool.request().query(`
      SELECT TOP 20
        p.IdPesagem,
        p.DataHoraPesagem,
        p.Placa,
        p.PBT,
        p.Status,
        e.Descricao AS Equipamento,
        o.DataHoraInicio AS InicioOperacao
      FROM TBPesagens p
      LEFT JOIN TBEquipamentos e ON p.IdEquipamento = e.IdEquipamento
      LEFT JOIN TBOperacoes o    ON p.IdOperacao    = o.IdOperacao
      ORDER BY p.DataHoraPesagem DESC
    `);

    return res.json({ total: result.recordset.length, pesagens: result.recordset });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// GET /api/axton/infracoes — últimas infrações (pesagem + eixo)
export async function ultimasInfracoes(req, res) {
  try {
    const pool = await conectar();
    const result = await pool.request().query(`
      SELECT TOP 20
        i.IdInfracao,
        i.DataHoraInfracao,
        i.Placa,
        i.TipoInfracao,
        i.PBTRegulamentado,
        i.PBTMedido,
        i.Status,
        e.Descricao AS Equipamento
      FROM TBInfracoes i
      LEFT JOIN TBEquipamentos e ON i.IdEquipamento = e.IdEquipamento
      ORDER BY i.DataHoraInfracao DESC
    `);

    return res.json({ total: result.recordset.length, infracoes: result.recordset });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}
