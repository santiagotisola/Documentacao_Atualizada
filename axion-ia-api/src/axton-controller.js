import { conectar, testarConexao } from "./services/axton-db.js";

// GET /api/axton/status
export async function statusConexao(req, res) {
  const status = await testarConexao();
  return res.json(status);
}

// GET /api/axton/resumo
export async function resumoGeral(req, res) {
  try {
    const pool = await conectar();

    const [
      equipamentos,
      operacoes,
      pesagens,
      infracoes,
      usuarios
    ] = await Promise.all([
      pool.request().query("SELECT COUNT(*) AS total FROM TBEquipamentos"),
      pool.request().query("SELECT COUNT(*) AS total FROM TBOperacoes"),
      pool.request().query("SELECT COUNT(*) AS total FROM TBPesagens"),
      pool.request().query("SELECT COUNT(*) AS total FROM TBInfracoes"),
      pool.request().query("SELECT COUNT(*) AS total FROM TBUsuarios")
    ]);

    return res.json({
      equipamentos: equipamentos.recordset[0].total,
      operacoes:    operacoes.recordset[0].total,
      pesagens:     pesagens.recordset[0].total,
      infracoes:    infracoes.recordset[0].total,
      usuarios:     usuarios.recordset[0].total
    });
  } catch (err) {
    return res.status(500).json({ erro: "Erro ao consultar AxTon", detalhe: err.message });
  }
}

// GET /api/axton/tabelas
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
