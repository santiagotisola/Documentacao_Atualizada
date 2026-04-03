/**
 * relatorio-controller.js
 * Gera relatórios de fluxo diário (passagens e imagens) por equipamento/faixa.
 *
 * Matriz resultante: LinhaEquipFaixa × ColunaDia → contagem
 * Compatível com o modelo solicitado: Equipamento/Faixa × Dia do mês.
 */

import { conectar } from "./services/axhub-db.js";

// ─── Helper: monta matriz esparsa → array para o painel ──────────
function montarMatriz(registros, totalDias) {
  const linhas = {};

  for (const row of registros) {
    const chave = row.EquipFaixa;
    if (!linhas[chave]) {
      linhas[chave] = { equipFaixa: chave, dias: {}, total: 0 };
    }
    linhas[chave].dias[row.Dia] = row.Total;
    linhas[chave].total += Number(row.Total);
  }

  return Object.values(linhas).sort((a, b) => a.equipFaixa.localeCompare(b.equipFaixa));
}

// GET /api/relatorio/fluxo?mes=8&ano=2025&equipamento=TODOS
export async function relatorioPassagens(req, res) {
  const { mes, ano, equipamento = "TODOS" } = req.query;

  if (!mes || !ano) {
    return res.status(400).json({ erro: "Parâmetros obrigatórios: mes, ano" });
  }

  const mesInt = parseInt(mes);
  const anoInt = parseInt(ano);
  const totalDias = new Date(anoInt, mesInt, 0).getDate();

  try {
    const pool = await conectar();

    const filtroEquip = equipamento !== "TODOS"
      ? `AND e.Codigo = @equipamento`
      : "";

    const request = pool.request()
      .input("mes", mesInt)
      .input("ano", anoInt);

    if (equipamento !== "TODOS") {
      request.input("equipamento", equipamento);
    }

    const result = await request.query(`
      SELECT
        e.Codigo + ' FX' + f.NumeroFaixa   AS EquipFaixa,
        DAY(p.DataHoraPassagem)             AS Dia,
        COUNT(*)                            AS Total
      FROM TBPassagens p
      JOIN TBEquipamentos e ON p.Equipamento_id = e.Id
      JOIN TBFaixas f       ON p.Faixa_id = f.Id
      WHERE MONTH(p.DataHoraPassagem) = @mes
        AND YEAR(p.DataHoraPassagem)  = @ano
        ${filtroEquip}
      GROUP BY e.Codigo, f.NumeroFaixa, DAY(p.DataHoraPassagem)
      ORDER BY e.Codigo, f.NumeroFaixa, DAY(p.DataHoraPassagem)
    `);

    const linhas = montarMatriz(result.recordset, totalDias);

    // Lista de equipamentos únicos para o filtro do painel
    const equipamentosResult = await pool.request().query(`
      SELECT DISTINCT Codigo FROM TBEquipamentos ORDER BY Codigo
    `);

    return res.json({
      tipo: "passagens",
      mes: mesInt,
      ano: anoInt,
      totalDias,
      totalLinhas: linhas.length,
      linhas,
      equipamentos: equipamentosResult.recordset.map(r => r.Codigo),
    });
  } catch (err) {
    return res.status(500).json({ erro: "Erro ao gerar relatório de passagens", detalhe: err.message });
  }
}

// GET /api/relatorio/imagens?mes=8&ano=2025&equipamento=TODOS
export async function relatorioImagens(req, res) {
  const { mes, ano, equipamento = "TODOS" } = req.query;

  if (!mes || !ano) {
    return res.status(400).json({ erro: "Parâmetros obrigatórios: mes, ano" });
  }

  const mesInt = parseInt(mes);
  const anoInt = parseInt(ano);
  const totalDias = new Date(anoInt, mesInt, 0).getDate();

  try {
    const pool = await conectar();

    const filtroEquip = equipamento !== "TODOS"
      ? `AND e.Codigo = @equipamento`
      : "";

    const request = pool.request()
      .input("mes", mesInt)
      .input("ano", anoInt);

    if (equipamento !== "TODOS") {
      request.input("equipamento", equipamento);
    }

    const result = await request.query(`
      SELECT
        e.Codigo + ' FX' + f.NumeroFaixa    AS EquipFaixa,
        DAY(pc.DataHoraPassagem)             AS Dia,
        COUNT(ipc.Id)                        AS Total
      FROM TBPassagensConjugadas pc
      JOIN TBEquipamentos e               ON pc.Equipamento_id = e.Id
      JOIN TBFaixas f                     ON pc.Faixa_id = f.Id
      LEFT JOIN TBImagensPassagensConjugadas ipc ON ipc.PassagemConjugada_id = pc.Id
      WHERE MONTH(pc.DataHoraPassagem) = @mes
        AND YEAR(pc.DataHoraPassagem)  = @ano
        ${filtroEquip}
      GROUP BY e.Codigo, f.NumeroFaixa, DAY(pc.DataHoraPassagem)
      ORDER BY e.Codigo, f.NumeroFaixa, DAY(pc.DataHoraPassagem)
    `);

    const linhas = montarMatriz(result.recordset, totalDias);

    const equipamentosResult = await pool.request().query(`
      SELECT DISTINCT Codigo FROM TBEquipamentos ORDER BY Codigo
    `);

    return res.json({
      tipo: "imagens",
      mes: mesInt,
      ano: anoInt,
      totalDias,
      totalLinhas: linhas.length,
      linhas,
      equipamentos: equipamentosResult.recordset.map(r => r.Codigo),
    });
  } catch (err) {
    return res.status(500).json({ erro: "Erro ao gerar relatório de imagens", detalhe: err.message });
  }
}

// GET /api/relatorio/equipamentos — lista equipamentos para o filtro
export async function listarEquipamentosRelatorio(req, res) {
  try {
    const pool = await conectar();
    const result = await pool.request().query(`
      SELECT DISTINCT Codigo FROM TBEquipamentos WHERE Codigo IS NOT NULL ORDER BY Codigo
    `);
    return res.json({ equipamentos: result.recordset.map(r => r.Codigo) });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}
