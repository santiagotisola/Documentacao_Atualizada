/**
 * 🏗️ GENERIC PRODUCT CONTROLLER
 * 
 * Controlador genérico para produtos Axion (AxHub, AxTon, AxCross)
 * Elimina duplicação de código entre os 3 produtos
 * 
 * @created 2026-06-21
 * @refactor Fase 1 - Quick Wins
 */

/**
 * Cria um conjunto de handlers genéricos para um produto
 * @param {Object} dbService - Serviço de banco de dados (axhub-db, axton-db, axcross-db)
 * @param {Object} config - Configuração do produto
 * @returns {Object} Handlers HTTP para Express
 */
export function createProductController(dbService, config) {
  const { conectar, testarConexao } = dbService;
  const { productName, tables } = config;

  /**
   * GET /api/{product}/status
   * Testa conexão com banco de dados do produto
   */
  async function statusConexao(req, res) {
    try {
      const status = await testarConexao();
      return res.json(status);
    } catch (err) {
      return res.status(500).json({ 
        erro: `Erro ao testar conexão ${productName}`, 
        detalhe: err.message 
      });
    }
  }

  /**
   * GET /api/{product}/resumo
   * Retorna overview geral: contagem de registros das tabelas principais
   */
  async function resumoGeral(req, res) {
    try {
      const pool = await conectar();
      
      // Cria queries dinâmicas para cada tabela configurada
      const queries = tables.resumo.map(tableName => 
        pool.request().query(`SELECT COUNT(*) AS total FROM ${tableName}`)
      );

      const results = await Promise.all(queries);
      
      // Mapeia resultados usando os nomes das tabelas
      const resumo = {};
      tables.resumo.forEach((tableName, index) => {
        // Remove prefixo TB e converte para lowercase
        const key = tableName.replace('TB', '').toLowerCase();
        resumo[key] = results[index].recordset[0].total;
      });

      return res.json(resumo);

    } catch (err) {
      return res.status(500).json({ 
        erro: `Erro ao consultar ${productName}`, 
        detalhe: err.message 
      });
    }
  }

  /**
   * GET /api/{product}/equipamentos
   * Lista equipamentos do produto (query genérica)
   */
  async function listarEquipamentos(req, res) {
    try {
      const pool = await conectar();
      const limit = parseInt(req.query.limit) || 100;
      
      const result = await pool.request().query(
        tables.equipamentos.query.replace('{{LIMIT}}', limit)
      );

      return res.json({ 
        total: result.recordset.length, 
        equipamentos: result.recordset 
      });

    } catch (err) {
      return res.status(500).json({ 
        erro: `Erro ao listar equipamentos ${productName}`, 
        detalhe: err.message 
      });
    }
  }

  /**
   * GET /api/{product}/heartbeat
   * Verifica heartbeat/status dos equipamentos (última comunicação)
   */
  async function heartbeatEquipamentos(req, res) {
    try {
      const pool = await conectar();
      
      if (!tables.heartbeat) {
        return res.status(501).json({ 
          erro: "Heartbeat não implementado para este produto" 
        });
      }

      const result = await pool.request().query(tables.heartbeat.query);

      return res.json({ 
        total: result.recordset.length, 
        equipamentos: result.recordset 
      });

    } catch (err) {
      return res.status(500).json({ 
        erro: `Erro ao consultar heartbeat ${productName}`, 
        detalhe: err.message 
      });
    }
  }

  /**
   * GET /api/{product}/tabelas
   * Lista todas as tabelas do banco com contagem de registros
   */
  async function listarTabelas(req, res) {
    try {
      const pool = await conectar();
      const result = await pool.request().query(`
        SELECT
          t.name   AS tabela,
          p.rows   AS registros
        FROM sys.tables t
        JOIN sys.partitions p ON t.object_id = p.object_id AND p.index_id IN (0,1)
        ORDER BY p.rows DESC
      `);

      return res.json({ 
        total: result.recordset.length, 
        tabelas: result.recordset 
      });

    } catch (err) {
      return res.status(500).json({ 
        erro: `Erro ao listar tabelas ${productName}`, 
        detalhe: err.message 
      });
    }
  }

  // Retorna todos os handlers genéricos
  return {
    statusConexao,
    resumoGeral,
    listarEquipamentos,
    heartbeatEquipamentos,
    listarTabelas
  };
}
