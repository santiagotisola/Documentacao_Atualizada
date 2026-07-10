/**
 * duplicidade-controller.js — Auditoria de Infrações Duplicadas
 * 
 * Endpoints para detectar, auditar e gerenciar infrações potencialmente
 * duplicadas no AxHub, com suporte para consultas por placa, equipamento e período.
 * 
 * ROTAS:
 *  GET  /api/duplicidade/buscar       → buscar infrações de uma placa/data
 *  GET  /api/duplicidade/varredura    → varredura geral de duplicidades
 *  GET  /api/duplicidade/detalhe/:id  → detalhes completos de uma infração
 *  GET  /api/duplicidade/comparar     → comparar dois registros lado a lado
 */

import { conectar } from "./services/axhub-db.js";

// ─── GET /api/duplicidade/buscar ─────────────────────────────────────────────
// Query params: placa, dataInicio, dataFim, equipamento, site
export async function buscarInfracoes(req, res) {
  const { placa, dataInicio, dataFim, equipamento } = req.query;

  if (!placa && !dataInicio) {
    return res.status(400).json({ erro: "Informe ao menos 'placa' ou 'dataInicio'." });
  }

  try {
    const pool = await conectar();
    const request = pool.request();

    let where = "WHERE 1=1";
    if (placa) {
      request.input("placa", placa.toUpperCase().replace(/[^A-Z0-9]/g, ""));
      where += " AND i.Placa = @placa";
    }
    if (dataInicio) {
      request.input("dataInicio", dataInicio);
      where += " AND i.DataHoraInfracao >= @dataInicio";
    }
    if (dataFim) {
      request.input("dataFim", dataFim);
      where += " AND i.DataHoraInfracao <= @dataFim";
    }
    if (equipamento) {
      request.input("equipamento", `%${equipamento}%`);
      where += " AND e.Descricao LIKE @equipamento";
    }

    const result = await request.query(`
      SELECT 
        i.IdInfracao,
        i.DataHoraInfracao,
        i.Placa,
        i.VelocidadeMedida,
        i.VelocidadeConsiderada,
        i.VelocidadeRegulamentada,
        i.IdEquipamento,
        i.IdFaixa,
        i.IdLocal,
        i.IdOperacao,
        i.DataHoraImportacao,
        i.Protocolo,
        i.NumeroAIT,
        i.Status,
        e.Descricao AS Equipamento,
        e.NumeroSerie AS SerieEquipamento,
        l.Descricao AS Local,
        f.Descricao AS Faixa,
        f.Numero AS NumeroFaixa
      FROM TBInfracoes i
      LEFT JOIN TBEquipamentos e ON i.IdEquipamento = e.IdEquipamento
      LEFT JOIN TBLocais l ON i.IdLocal = l.IdLocal
      LEFT JOIN TBFaixas f ON i.IdFaixa = f.IdFaixa
      ${where}
      ORDER BY i.DataHoraInfracao ASC
    `);

    // Detectar pares duplicados automaticamente
    const registros = result.recordset;
    const duplicidades = [];

    for (let i = 0; i < registros.length - 1; i++) {
      for (let j = i + 1; j < registros.length; j++) {
        const a = registros[i];
        const b = registros[j];
        const diffMs = Math.abs(new Date(a.DataHoraInfracao) - new Date(b.DataHoraInfracao));
        const diffSeg = diffMs / 1000;

        if (a.IdEquipamento === b.IdEquipamento && a.IdFaixa === b.IdFaixa && diffSeg <= 60) {
          duplicidades.push({
            idA: a.IdInfracao,
            idB: b.IdInfracao,
            diferencaSegundos: diffSeg,
            mesmaVelocidade: a.VelocidadeMedida === b.VelocidadeMedida,
            mesmoEquipamento: true,
            mesmaFaixa: true,
            velocidadeA: a.VelocidadeMedida,
            velocidadeB: b.VelocidadeMedida,
            horaA: a.DataHoraInfracao,
            horaB: b.DataHoraInfracao
          });
        }
      }
    }

    return res.json({
      total: registros.length,
      duplicidades_detectadas: duplicidades.length,
      registros,
      duplicidades
    });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// ─── GET /api/duplicidade/varredura ──────────────────────────────────────────
// Query params: dias (default 30), tolerancia (default 60), limite (default 50)
export async function varreduraDuplicidades(req, res) {
  const dias = parseInt(req.query.dias) || 30;
  const tolerancia = parseInt(req.query.tolerancia) || 60;
  const limite = Math.min(parseInt(req.query.limite) || 50, 200);

  try {
    const pool = await conectar();
    const result = await pool.request()
      .input("dias", dias)
      .input("tolerancia", tolerancia)
      .input("limite", limite)
      .query(`
        SELECT TOP (@limite)
          a.IdInfracao AS IdA,
          b.IdInfracao AS IdB,
          a.Placa,
          a.DataHoraInfracao AS DataHoraA,
          b.DataHoraInfracao AS DataHoraB,
          DATEDIFF(SECOND, a.DataHoraInfracao, b.DataHoraInfracao) AS DiferencaSegundos,
          a.VelocidadeMedida AS VelocidadeA,
          b.VelocidadeMedida AS VelocidadeB,
          a.VelocidadeConsiderada AS VelConsideradaA,
          b.VelocidadeConsiderada AS VelConsideradaB,
          e.Descricao AS Equipamento,
          f.Descricao AS Faixa,
          l.Descricao AS Local,
          a.DataHoraImportacao AS ImportacaoA,
          b.DataHoraImportacao AS ImportacaoB
        FROM TBInfracoes a
        INNER JOIN TBInfracoes b 
          ON a.Placa = b.Placa
          AND a.IdEquipamento = b.IdEquipamento
          AND a.IdFaixa = b.IdFaixa
          AND a.IdInfracao < b.IdInfracao
          AND DATEDIFF(SECOND, a.DataHoraInfracao, b.DataHoraInfracao) BETWEEN 0 AND @tolerancia
        LEFT JOIN TBEquipamentos e ON a.IdEquipamento = e.IdEquipamento
        LEFT JOIN TBFaixas f ON a.IdFaixa = f.IdFaixa
        LEFT JOIN TBLocais l ON a.IdLocal = l.IdLocal
        WHERE a.DataHoraInfracao >= DATEADD(DAY, -@dias, GETDATE())
        ORDER BY a.DataHoraInfracao DESC
      `);

    // Agrupar por placa
    const porPlaca = {};
    for (const r of result.recordset) {
      if (!porPlaca[r.Placa]) porPlaca[r.Placa] = [];
      porPlaca[r.Placa].push(r);
    }

    return res.json({
      total_pares: result.recordset.length,
      placas_afetadas: Object.keys(porPlaca).length,
      parametros: { dias, tolerancia_seg: tolerancia, limite },
      duplicidades: result.recordset,
      resumo_por_placa: Object.entries(porPlaca).map(([placa, itens]) => ({
        placa,
        quantidade: itens.length,
        equipamentos: [...new Set(itens.map(i => i.Equipamento))]
      }))
    });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// ─── GET /api/duplicidade/detalhe/:id ────────────────────────────────────────
export async function detalheInfracao(req, res) {
  const { id } = req.params;
  if (!id || isNaN(id)) return res.status(400).json({ erro: "ID inválido." });

  try {
    const pool = await conectar();

    // Dados da infração
    const infResult = await pool.request()
      .input("id", parseInt(id))
      .query(`
        SELECT 
          i.*,
          e.Descricao AS Equipamento,
          e.NumeroSerie AS SerieEquipamento,
          l.Descricao AS Local,
          f.Descricao AS Faixa,
          f.Numero AS NumeroFaixa
        FROM TBInfracoes i
        LEFT JOIN TBEquipamentos e ON i.IdEquipamento = e.IdEquipamento
        LEFT JOIN TBLocais l ON i.IdLocal = l.IdLocal
        LEFT JOIN TBFaixas f ON i.IdFaixa = f.IdFaixa
        WHERE i.IdInfracao = @id
      `);

    if (infResult.recordset.length === 0) {
      return res.status(404).json({ erro: "Infração não encontrada." });
    }

    const infracao = infResult.recordset[0];

    // Enquadramento
    let enquadramento = [];
    try {
      const enqResult = await pool.request()
        .input("id", parseInt(id))
        .query(`
          SELECT ie.IdEnquadramento, en.Codigo, en.Descricao, en.Artigo, en.Inciso
          FROM TBInfracoesEnquadramentos ie
          JOIN TBEnquadramentos en ON ie.IdEnquadramento = en.IdEnquadramento
          WHERE ie.IdInfracao = @id
        `);
      enquadramento = enqResult.recordset;
    } catch (e) {}

    // Triagem
    let triagem = [];
    try {
      const triResult = await pool.request()
        .input("id", parseInt(id))
        .query(`
          SELECT t.*, u.Nome AS Analista
          FROM TBTriagens t
          LEFT JOIN TBUsuarios u ON t.IdUsuario = u.IdUsuario
          WHERE t.IdInfracao = @id
        `);
      triagem = triResult.recordset;
    } catch (e) {}

    // Imagens
    let imagens = [];
    try {
      const imgResult = await pool.request()
        .input("id", parseInt(id))
        .query(`
          SELECT * FROM TBImagens WHERE IdInfracao = @id
        `);
      imagens = imgResult.recordset;
    } catch (e) {
      try {
        const imgResult2 = await pool.request()
          .input("id", parseInt(id))
          .query(`SELECT * FROM TBInfracoesImagens WHERE IdInfracao = @id`);
        imagens = imgResult2.recordset;
      } catch (e2) {}
    }

    return res.json({
      infracao,
      enquadramento,
      triagem,
      imagens
    });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// ─── GET /api/duplicidade/comparar ───────────────────────────────────────────
// Query params: idA, idB
export async function compararInfracoes(req, res) {
  const { idA, idB } = req.query;
  if (!idA || !idB) return res.status(400).json({ erro: "Informe idA e idB." });

  try {
    const pool = await conectar();

    const result = await pool.request()
      .input("idA", parseInt(idA))
      .input("idB", parseInt(idB))
      .query(`
        SELECT 
          i.IdInfracao,
          i.DataHoraInfracao,
          i.Placa,
          i.VelocidadeMedida,
          i.VelocidadeConsiderada,
          i.VelocidadeRegulamentada,
          i.DataHoraImportacao,
          i.Protocolo,
          i.Status,
          e.Descricao AS Equipamento,
          l.Descricao AS Local,
          f.Descricao AS Faixa
        FROM TBInfracoes i
        LEFT JOIN TBEquipamentos e ON i.IdEquipamento = e.IdEquipamento
        LEFT JOIN TBLocais l ON i.IdLocal = l.IdLocal
        LEFT JOIN TBFaixas f ON i.IdFaixa = f.IdFaixa
        WHERE i.IdInfracao IN (@idA, @idB)
        ORDER BY i.DataHoraInfracao ASC
      `);

    if (result.recordset.length < 2) {
      return res.status(404).json({ erro: "Uma ou ambas as infrações não foram encontradas." });
    }

    const [a, b] = result.recordset;
    const diffMs = Math.abs(new Date(a.DataHoraInfracao) - new Date(b.DataHoraInfracao));

    // Enquadramentos de ambas
    let enqA = [], enqB = [];
    try {
      const eA = await pool.request().input("id", parseInt(idA))
        .query(`SELECT en.Codigo, en.Descricao FROM TBInfracoesEnquadramentos ie JOIN TBEnquadramentos en ON ie.IdEnquadramento = en.IdEnquadramento WHERE ie.IdInfracao = @id`);
      enqA = eA.recordset;
    } catch (e) {}
    try {
      const eB = await pool.request().input("id", parseInt(idB))
        .query(`SELECT en.Codigo, en.Descricao FROM TBInfracoesEnquadramentos ie JOIN TBEnquadramentos en ON ie.IdEnquadramento = en.IdEnquadramento WHERE ie.IdInfracao = @id`);
      enqB = eB.recordset;
    } catch (e) {}

    const comparacao = {
      registroA: a,
      registroB: b,
      enquadramentoA: enqA,
      enquadramentoB: enqB,
      analise: {
        diferencaTemporalMs: diffMs,
        diferencaTemporalSeg: (diffMs / 1000).toFixed(1),
        mesmoEquipamento: a.Equipamento === b.Equipamento,
        mesmaFaixa: a.Faixa === b.Faixa,
        mesmoLocal: a.Local === b.Local,
        mesmaVelocidadeMedida: a.VelocidadeMedida === b.VelocidadeMedida,
        mesmaVelocidadeConsiderada: a.VelocidadeConsiderada === b.VelocidadeConsiderada,
        mesmoEnquadramento: JSON.stringify(enqA) === JSON.stringify(enqB),
        mesmoProtocolo: a.Protocolo === b.Protocolo,
        potencialDuplicidade: diffMs <= 60000 && a.Equipamento === b.Equipamento && a.Faixa === b.Faixa
      },
      divergencias: []
    };

    // Detectar divergências
    if (a.VelocidadeMedida !== b.VelocidadeMedida) {
      comparacao.divergencias.push({ campo: "VelocidadeMedida", valorA: a.VelocidadeMedida, valorB: b.VelocidadeMedida });
    }
    if (a.VelocidadeConsiderada !== b.VelocidadeConsiderada) {
      comparacao.divergencias.push({ campo: "VelocidadeConsiderada", valorA: a.VelocidadeConsiderada, valorB: b.VelocidadeConsiderada });
    }
    if (JSON.stringify(enqA) !== JSON.stringify(enqB)) {
      comparacao.divergencias.push({ campo: "Enquadramento", valorA: enqA, valorB: enqB });
    }
    if (a.DataHoraInfracao?.toString() !== b.DataHoraInfracao?.toString()) {
      comparacao.divergencias.push({ campo: "DataHoraInfracao", valorA: a.DataHoraInfracao, valorB: b.DataHoraInfracao });
    }

    return res.json(comparacao);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// ─── GET /api/duplicidade/estatisticas ───────────────────────────────────────
export async function estatisticasDuplicidades(req, res) {
  const dias = parseInt(req.query.dias) || 30;
  const tolerancia = parseInt(req.query.tolerancia) || 60;

  try {
    const pool = await conectar();

    const [totalGeral, duplicadas, porEquipamento] = await Promise.all([
      pool.request().input("dias", dias).query(`
        SELECT COUNT(*) AS total FROM TBInfracoes WHERE DataHoraInfracao >= DATEADD(DAY, -@dias, GETDATE())
      `),
      pool.request().input("dias", dias).input("tolerancia", tolerancia).query(`
        SELECT COUNT(*) AS total FROM (
          SELECT a.IdInfracao
          FROM TBInfracoes a
          INNER JOIN TBInfracoes b 
            ON a.Placa = b.Placa AND a.IdEquipamento = b.IdEquipamento
            AND a.IdFaixa = b.IdFaixa AND a.IdInfracao < b.IdInfracao
            AND DATEDIFF(SECOND, a.DataHoraInfracao, b.DataHoraInfracao) BETWEEN 0 AND @tolerancia
          WHERE a.DataHoraInfracao >= DATEADD(DAY, -@dias, GETDATE())
        ) sub
      `),
      pool.request().input("dias", dias).input("tolerancia", tolerancia).query(`
        SELECT TOP 10 e.Descricao AS Equipamento, COUNT(*) AS Total
        FROM TBInfracoes a
        INNER JOIN TBInfracoes b 
          ON a.Placa = b.Placa AND a.IdEquipamento = b.IdEquipamento
          AND a.IdFaixa = b.IdFaixa AND a.IdInfracao < b.IdInfracao
          AND DATEDIFF(SECOND, a.DataHoraInfracao, b.DataHoraInfracao) BETWEEN 0 AND @tolerancia
        LEFT JOIN TBEquipamentos e ON a.IdEquipamento = e.IdEquipamento
        WHERE a.DataHoraInfracao >= DATEADD(DAY, -@dias, GETDATE())
        GROUP BY e.Descricao
        ORDER BY Total DESC
      `)
    ]);

    const total = totalGeral.recordset[0].total;
    const dup = duplicadas.recordset[0].total;

    return res.json({
      periodo_dias: dias,
      tolerancia_seg: tolerancia,
      total_infracoes: total,
      pares_duplicados: dup,
      percentual_duplicidade: total > 0 ? ((dup * 2 / total) * 100).toFixed(2) : "0.00",
      por_equipamento: porEquipamento.recordset
    });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}
