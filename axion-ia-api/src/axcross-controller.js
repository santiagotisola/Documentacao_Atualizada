import { conectar, testarConexao } from "./services/axcross-db.js";

// GET /api/axcross/status
export async function statusConexao(req, res) {
  const status = await testarConexao();
  return res.json(status);
}

// GET /api/axcross/resumo
export async function resumoGeral(req, res) {
  try {
    const pool = await conectar();

    const [
      equipamentos,
      operacoes,
      passagens,
      locais,
      usuarios
    ] = await Promise.all([
      pool.request().query("SELECT COUNT(*) AS total FROM TBEquipamentos"),
      pool.request().query("SELECT COUNT(*) AS total FROM TBOperacoes"),
      pool.request().query("SELECT COUNT(*) AS total FROM TBPassagens"),
      pool.request().query("SELECT COUNT(*) AS total FROM TBLocais"),
      pool.request().query("SELECT COUNT(*) AS total FROM TBUsuarios")
    ]);

    return res.json({
      equipamentos: equipamentos.recordset[0].total,
      operacoes:    operacoes.recordset[0].total,
      passagens:    passagens.recordset[0].total,
      locais:       locais.recordset[0].total,
      usuarios:     usuarios.recordset[0].total
    });
  } catch (err) {
    return res.status(500).json({ erro: "Erro ao consultar AxCross", detalhe: err.message });
  }
}

// GET /api/axcross/equipamentos
export async function listarEquipamentos(req, res) {
  try {
    const pool = await conectar();
    const result = await pool.request().query(`
      SELECT TOP 100
        e.Id, e.Nome, e.Tipo, e.Fabricante, e.Modelo, e.IP, e.Ativo,
        l.Nome AS Local
      FROM TBEquipamentos e
      LEFT JOIN TBLocais l ON e.LocalId = l.Id
      ORDER BY e.Nome
    `);

    return res.json({ total: result.recordset.length, equipamentos: result.recordset });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

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

// GET /api/axcross/heartbeat
export async function heartbeatEquipamentos(req, res) {
  try {
    const pool = await conectar();
    const result = await pool.request().query(`
      SELECT TOP 50
        e.Nome AS Equipamento, e.IP,
        h.Status, h.UltimoSinal
      FROM TBHeartbeatEquipamentos h
      JOIN TBEquipamentos e ON h.EquipamentoId = e.Id
      ORDER BY h.UltimoSinal DESC
    `);

    return res.json({ total: result.recordset.length, heartbeat: result.recordset });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// GET /api/axcross/tabelas
export async function listarTabelas(req, res) {
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

    return res.json({ total: result.recordset.length, tabelas: result.recordset });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}
