import { conectar, testarConexao } from "./services/axhub-db.js";

// GET /api/axhub/status — teste de conexão
export async function statusConexao(req, res) {
  const status = await testarConexao();
  return res.json(status);
}

// GET /api/axhub/resumo — overview geral do banco
export async function resumoGeral(req, res) {
  try {
    const pool = await conectar();

    const [
      equipamentos,
      operacoes,
      infracoes,
      passagens,
      usuarios,
      triagens
    ] = await Promise.all([
      pool.request().query("SELECT COUNT(*) AS total FROM TBEquipamentos"),
      pool.request().query("SELECT COUNT(*) AS total FROM TBOperacoes"),
      pool.request().query("SELECT COUNT(*) AS total FROM TBInfracoes"),
      pool.request().query("SELECT COUNT(*) AS total FROM TBPassagens"),
      pool.request().query("SELECT COUNT(*) AS total FROM TBUsuarios"),
      pool.request().query("SELECT COUNT(*) AS total FROM TBTriagens")
    ]);

    return res.json({
      equipamentos: equipamentos.recordset[0].total,
      operacoes:    operacoes.recordset[0].total,
      infracoes:    infracoes.recordset[0].total,
      passagens:    passagens.recordset[0].total,
      usuarios:     usuarios.recordset[0].total,
      triagens:     triagens.recordset[0].total
    });

  } catch (err) {
    return res.status(500).json({ erro: "Erro ao consultar AxHub", detalhe: err.message });
  }
}

// GET /api/axhub/equipamentos — lista de equipamentos
export async function listarEquipamentos(req, res) {
  try {
    const pool = await conectar();
    const result = await pool.request().query(`
      SELECT TOP 100
        e.IdEquipamento,
        e.NumeroSerie,
        e.Descricao,
        te.Descricao AS TipoEquipamento,
        f.Descricao  AS Fabricante,
        me.Descricao AS Modelo
      FROM TBEquipamentos e
      LEFT JOIN TBTipoEquipamentos te ON e.IdTipoEquipamento = te.IdTipoEquipamento
      LEFT JOIN TBFabricantes f       ON e.IdFabricante       = f.IdFabricante
      LEFT JOIN TBModeloEquipamentos me ON e.IdModeloEquipamento = me.IdModeloEquipamento
      ORDER BY e.IdEquipamento
    `);

    return res.json({ total: result.recordset.length, equipamentos: result.recordset });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

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

// GET /api/axhub/heartbeat — status dos equipamentos (heartbeat)
export async function heartbeatEquipamentos(req, res) {
  try {
    const pool = await conectar();
    const result = await pool.request().query(`
      SELECT TOP 50
        h.IdEquipamento,
        e.Descricao AS Equipamento,
        h.DataHora  AS UltimoHeartbeat,
        e.NumeroSerie
      FROM TBHeartbeatEquipamentos h
      JOIN TBEquipamentos e ON h.IdEquipamento = e.IdEquipamento
      ORDER BY h.DataHora DESC
    `);

    return res.json({ total: result.recordset.length, heartbeats: result.recordset });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// GET /api/axhub/tabelas — lista todas as tabelas e contagem de registros
export async function listarTabelas(req, res) {
  try {
    const pool = await conectar();
    const result = await pool.request().query(`
      SELECT
        t.name        AS tabela,
        p.rows        AS registros
      FROM sys.tables t
      JOIN sys.partitions p ON t.object_id = p.object_id AND p.index_id IN (0,1)
      ORDER BY p.rows DESC
    `);

    return res.json({ total: result.recordset.length, tabelas: result.recordset });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}
