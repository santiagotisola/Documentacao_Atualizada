import { dbAdapter } from "../database/adapter.js";

/**
 * CONECTOR ERP UNIVERSAL
 * Conecta a qualquer sistema de gestão via API REST ou banco direto.
 * Operações padronizadas independente do ERP.
 */

// ============================================
// OPERAÇÕES DE ESTOQUE
// ============================================

export async function consultarProduto({ codigo, nome, ean }) {
  const tipo = process.env.ERP_CONNECTION_TYPE;

  if (tipo === "api") {
    return consultarProdutoAPI({ codigo, nome, ean });
  }
  
  // Conexão direta ao banco
  const dbType = process.env.ERP_DB_TYPE || "mysql";
  let query;

  if (codigo) {
    query = `SELECT * FROM produtos WHERE codigo = @param0`;
  } else if (ean) {
    query = `SELECT * FROM produtos WHERE ean = @param0`;
  } else if (nome) {
    query = dbType === "mysql" 
      ? `SELECT * FROM produtos WHERE nome LIKE CONCAT('%', @param0, '%') LIMIT 10`
      : `SELECT TOP 10 * FROM produtos WHERE nome LIKE '%' + @param0 + '%'`;
  }

  const resultado = await dbAdapter.executarQuery("erp_principal", query, [codigo || ean || nome]);
  return resultado;
}

export async function listarEstoqueBaixo() {
  const dbType = process.env.ERP_DB_TYPE || "mysql";
  const query = dbType === "mysql"
    ? `SELECT codigo, nome, estoque_atual, estoque_minimo FROM produtos WHERE estoque_atual < estoque_minimo AND ativo = 1 ORDER BY (estoque_minimo - estoque_atual) DESC LIMIT 50`
    : `SELECT TOP 50 codigo, nome, estoque_atual, estoque_minimo FROM produtos WHERE estoque_atual < estoque_minimo AND ativo = 1 ORDER BY (estoque_minimo - estoque_atual) DESC`;

  return dbAdapter.executarQuery("erp_principal", query);
}

// ============================================
// OPERAÇÕES FINANCEIRAS
// ============================================

export async function consultarContasReceber({ cliente_id, status, vencimento_de, vencimento_ate } = {}) {
  let query = `SELECT * FROM contas_receber WHERE 1=1`;
  const params = [];

  if (cliente_id) { query += ` AND cliente_id = @param${params.length}`; params.push(cliente_id); }
  if (status === "vencido") { query += ` AND vencimento < GETDATE() AND status = 'aberto'`; }
  if (vencimento_de) { query += ` AND vencimento >= @param${params.length}`; params.push(vencimento_de); }
  if (vencimento_ate) { query += ` AND vencimento <= @param${params.length}`; params.push(vencimento_ate); }

  query += ` ORDER BY vencimento ASC`;
  return dbAdapter.executarQuery("erp_principal", query, params);
}

export async function consultarContasPagar({ fornecedor_id, vencimento_de, vencimento_ate } = {}) {
  let query = `SELECT * FROM contas_pagar WHERE 1=1`;
  const params = [];

  if (fornecedor_id) { query += ` AND fornecedor_id = @param${params.length}`; params.push(fornecedor_id); }
  if (vencimento_de) { query += ` AND vencimento >= @param${params.length}`; params.push(vencimento_de); }
  if (vencimento_ate) { query += ` AND vencimento <= @param${params.length}`; params.push(vencimento_ate); }

  query += ` ORDER BY vencimento ASC`;
  return dbAdapter.executarQuery("erp_principal", query, params);
}

// ============================================
// OPERAÇÕES DE VENDAS
// ============================================

export async function consultarVendas({ data_de, data_ate, cliente_id, limite = 100 } = {}) {
  let query = `SELECT * FROM vendas WHERE 1=1`;
  const params = [];

  if (data_de) { query += ` AND data_venda >= @param${params.length}`; params.push(data_de); }
  if (data_ate) { query += ` AND data_venda <= @param${params.length}`; params.push(data_ate); }
  if (cliente_id) { query += ` AND cliente_id = @param${params.length}`; params.push(cliente_id); }

  query += ` ORDER BY data_venda DESC LIMIT ${limite}`;
  return dbAdapter.executarQuery("erp_principal", query, params);
}

export async function rankingProdutos({ periodo_dias = 30, limite = 20 } = {}) {
  const dbType = process.env.ERP_DB_TYPE || "mysql";
  const dateFunc = dbType === "mysql" ? "DATE_SUB(NOW(), INTERVAL @param0 DAY)" : "DATEADD(day, -@param0, GETDATE())";
  
  const query = `
    SELECT p.codigo, p.nome, SUM(vi.quantidade) as quantidade_vendida, SUM(vi.total) as faturamento
    FROM venda_itens vi
    JOIN produtos p ON p.codigo = vi.produto_codigo
    JOIN vendas v ON v.id = vi.venda_id
    WHERE v.data_venda >= ${dateFunc}
    GROUP BY p.codigo, p.nome
    ORDER BY quantidade_vendida DESC
    LIMIT ${limite}
  `;

  return dbAdapter.executarQuery("erp_principal", query, [periodo_dias]);
}

// ============================================
// OPERAÇÕES DE CLIENTES
// ============================================

export async function buscarCliente({ cpf_cnpj, nome, telefone }) {
  let query = `SELECT * FROM clientes WHERE 1=1`;
  const params = [];

  if (cpf_cnpj) { query += ` AND cpf_cnpj = @param${params.length}`; params.push(cpf_cnpj); }
  if (telefone) { query += ` AND telefone LIKE @param${params.length}`; params.push(`%${telefone}%`); }
  if (nome) { query += ` AND nome LIKE @param${params.length}`; params.push(`%${nome}%`); }

  query += ` LIMIT 10`;
  return dbAdapter.executarQuery("erp_principal", query, params);
}

// ============================================
// VIA API REST (quando ERP tem API própria)
// ============================================

async function consultarProdutoAPI({ codigo, nome, ean }) {
  const { default: axios } = await import("axios");
  const baseUrl = process.env.ERP_API_URL;
  const token = process.env.ERP_API_TOKEN;
  const headers = { Authorization: `Bearer ${token}` };

  if (codigo) {
    const resp = await axios.get(`${baseUrl}/produtos/${codigo}`, { headers });
    return resp.data;
  }
  if (nome) {
    const resp = await axios.get(`${baseUrl}/produtos?nome=${encodeURIComponent(nome)}`, { headers });
    return resp.data;
  }
  if (ean) {
    const resp = await axios.get(`${baseUrl}/produtos?ean=${ean}`, { headers });
    return resp.data;
  }
}

// ============================================
// TESTE DE CONEXÃO
// ============================================

export async function testarConexaoERP() {
  try {
    if (process.env.ERP_CONNECTION_TYPE === "api") {
      const { default: axios } = await import("axios");
      const resp = await axios.get(`${process.env.ERP_API_URL}/status`, {
        headers: { Authorization: `Bearer ${process.env.ERP_API_TOKEN}` },
        timeout: 5000
      });
      return { conectado: true, tipo: "api", detalhes: resp.data };
    }

    // Teste via banco direto
    const resultado = await dbAdapter.executarQuery("erp_principal", "SELECT 1 as teste");
    return { conectado: true, tipo: "banco_direto", db_type: process.env.ERP_DB_TYPE };
  } catch (err) {
    return { conectado: false, erro: err.message };
  }
}
