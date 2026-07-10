/**
 * 👥 CRM ROUTES
 * 
 * Rotas para CRM, contatos, clientes e equipamentos
 * 
 * @module routes/crm
 * @created 2026-06-21
 * @refactor Fase 1 - Quick Wins
 */

import express from "express";
import { listarContatos, detalheContato, atualizarContato, statsContatos, listarClientes, criarCliente, atualizarCliente, contatosDoCliente, buscaCRM } from "../crm-controller.js";
import { listarEquipamentosCRM, statsEquipamentos, detalheEquipamento, atualizarEquipamento, equipamentosDoCliente, buscaEquipamento } from "../equipamento-controller.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════
// CONTATOS
// ═══════════════════════════════════════════════════════════════════

router.get("/crm/contatos", listarContatos);
router.get("/crm/contato/:id", detalheContato);
router.patch("/crm/contato/:id", atualizarContato);
router.get("/crm/contatos/stats", statsContatos);
router.get("/crm/buscar", buscaCRM);

// ═══════════════════════════════════════════════════════════════════
// CLIENTES
// ═══════════════════════════════════════════════════════════════════

router.get("/crm/clientes", listarClientes);
router.post("/crm/cliente", criarCliente);
router.patch("/crm/cliente/:id", atualizarCliente);
router.get("/crm/cliente/:id/contatos", contatosDoCliente);

// ═══════════════════════════════════════════════════════════════════
// EQUIPAMENTOS CRM
// ═══════════════════════════════════════════════════════════════════

router.get("/crm/equipamentos", listarEquipamentosCRM);
router.get("/crm/equipamento/:id", detalheEquipamento);
router.patch("/crm/equipamento/:id", atualizarEquipamento);
router.get("/crm/equipamentos/stats", statsEquipamentos);
router.get("/crm/cliente/:id/equipamentos", equipamentosDoCliente);
router.get("/crm/equipamento/buscar", buscaEquipamento);

export default router;
