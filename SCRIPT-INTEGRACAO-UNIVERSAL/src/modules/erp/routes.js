import { Router } from "express";
import * as erp from "./service.js";

export const erpRouter = Router();

// GET /api/erp/status — Testar conexão
erpRouter.get("/status", async (req, res) => {
  try {
    const status = await erp.testarConexaoERP();
    res.json(status);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/erp/estoque/:codigo — Consultar produto
erpRouter.get("/estoque/:codigo", async (req, res) => {
  try {
    const dados = await erp.consultarProduto({ codigo: req.params.codigo });
    res.json(dados);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/erp/estoque — Buscar produto por nome ou EAN
erpRouter.get("/estoque", async (req, res) => {
  try {
    const { nome, ean } = req.query;
    const dados = await erp.consultarProduto({ nome, ean });
    res.json(dados);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/erp/estoque-baixo — Produtos abaixo do mínimo
erpRouter.get("/estoque-baixo", async (req, res) => {
  try {
    const dados = await erp.listarEstoqueBaixo();
    res.json(dados);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/erp/financeiro/receber — Contas a receber
erpRouter.get("/financeiro/receber", async (req, res) => {
  try {
    const { cliente_id, status, vencimento_de, vencimento_ate } = req.query;
    const dados = await erp.consultarContasReceber({ cliente_id, status, vencimento_de, vencimento_ate });
    res.json(dados);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/erp/financeiro/pagar — Contas a pagar
erpRouter.get("/financeiro/pagar", async (req, res) => {
  try {
    const { fornecedor_id, vencimento_de, vencimento_ate } = req.query;
    const dados = await erp.consultarContasPagar({ fornecedor_id, vencimento_de, vencimento_ate });
    res.json(dados);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/erp/vendas — Histórico de vendas
erpRouter.get("/vendas", async (req, res) => {
  try {
    const { data_de, data_ate, cliente_id, limite } = req.query;
    const dados = await erp.consultarVendas({ data_de, data_ate, cliente_id, limite: parseInt(limite) });
    res.json(dados);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/erp/ranking/produtos — Ranking mais vendidos
erpRouter.get("/ranking/produtos", async (req, res) => {
  try {
    const { periodo_dias, limite } = req.query;
    const dados = await erp.rankingProdutos({ periodo_dias: parseInt(periodo_dias), limite: parseInt(limite) });
    res.json(dados);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/erp/clientes — Buscar cliente
erpRouter.get("/clientes", async (req, res) => {
  try {
    const { cpf_cnpj, nome, telefone } = req.query;
    const dados = await erp.buscarCliente({ cpf_cnpj, nome, telefone });
    res.json(dados);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});
