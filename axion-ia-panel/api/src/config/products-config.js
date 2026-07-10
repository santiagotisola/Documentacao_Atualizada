/**
 * 🔧 CONFIGURAÇÃO DOS PRODUTOS AXION
 * 
 * Define estruturas de dados específicas de cada produto
 * Usado pelo generic-product-controller para queries dinâmicas
 * 
 * @created 2026-06-21
 * @refactor Fase 1 - Quick Wins
 */

export const AXHUB_CONFIG = {
  productName: 'AxHub',
  
  // Tabelas para resumo geral (contagem)
  tables: {
    resumo: [
      'TBEquipamentos',
      'TBOperacoes',
      'TBInfracoes',
      'TBPassagens',
      'TBUsuarios',
      'TBTriagens'
    ],
    
    // Query para listar equipamentos
    equipamentos: {
      query: `
        SELECT TOP {{LIMIT}}
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
      `
    },
    
    // Query para heartbeat (última comunicação dos equipamentos)
    heartbeat: {
      query: `
        SELECT
          e.IdEquipamento,
          e.NumeroSerie,
          e.Descricao,
          MAX(p.DataHora) AS UltimaPassagem,
          DATEDIFF(MINUTE, MAX(p.DataHora), GETDATE()) AS MinutosSemComunicacao,
          CASE
            WHEN DATEDIFF(MINUTE, MAX(p.DataHora), GETDATE()) < 60 THEN 'online'
            WHEN DATEDIFF(MINUTE, MAX(p.DataHora), GETDATE()) < 1440 THEN 'warning'
            ELSE 'offline'
          END AS Status
        FROM TBEquipamentos e
        LEFT JOIN TBPassagens p ON e.IdEquipamento = p.IdEquipamento
        GROUP BY e.IdEquipamento, e.NumeroSerie, e.Descricao
        ORDER BY UltimaPassagem DESC
      `
    }
  }
};

export const AXTON_CONFIG = {
  productName: 'AxTon',
  
  tables: {
    resumo: [
      'TBEquipamentos',
      'TBOperacoes',
      'TBPesagens',
      'TBInfracoes',
      'TBUsuarios'
    ],
    
    equipamentos: {
      query: `
        SELECT TOP {{LIMIT}}
          e.IdEquipamento,
          e.NumeroSerie,
          e.Descricao,
          te.Descricao AS TipoEquipamento,
          f.Descricao  AS Fabricante,
          me.Descricao AS Modelo,
          e.Capacidade,
          e.NumeroInmetro
        FROM TBEquipamentos e
        LEFT JOIN TBTipoEquipamentos te ON e.IdTipoEquipamento = te.IdTipoEquipamento
        LEFT JOIN TBFabricantes f       ON e.IdFabricante       = f.IdFabricante
        LEFT JOIN TBModeloEquipamentos me ON e.IdModeloEquipamento = me.IdModeloEquipamento
        ORDER BY e.IdEquipamento
      `
    },
    
    heartbeat: {
      query: `
        SELECT
          e.IdEquipamento,
          e.NumeroSerie,
          e.Descricao,
          MAX(p.DataHoraPesagem) AS UltimaPesagem,
          DATEDIFF(MINUTE, MAX(p.DataHoraPesagem), GETDATE()) AS MinutosSemComunicacao,
          CASE
            WHEN DATEDIFF(MINUTE, MAX(p.DataHoraPesagem), GETDATE()) < 120 THEN 'online'
            WHEN DATEDIFF(MINUTE, MAX(p.DataHoraPesagem), GETDATE()) < 2880 THEN 'warning'
            ELSE 'offline'
          END AS Status
        FROM TBEquipamentos e
        LEFT JOIN TBPesagens p ON e.IdEquipamento = p.IdEquipamento
        GROUP BY e.IdEquipamento, e.NumeroSerie, e.Descricao
        ORDER BY UltimaPesagem DESC
      `
    }
  }
};

export const AXCROSS_CONFIG = {
  productName: 'AxCross',
  
  tables: {
    resumo: [
      'TBEquipamentos',
      'TBOperacoes',
      'TBPassagens',
      'TBLocais',
      'TBUsuarios'
    ],
    
    equipamentos: {
      query: `
        SELECT TOP {{LIMIT}}
          e.Id,
          e.Nome,
          e.Tipo,
          e.Fabricante,
          e.Modelo,
          e.IP,
          e.Ativo,
          l.Nome AS Local
        FROM TBEquipamentos e
        LEFT JOIN TBLocais l ON e.LocalId = l.Id
        ORDER BY e.Nome
      `
    },
    
    heartbeat: {
      query: `
        SELECT
          e.Id,
          e.Nome,
          MAX(p.DataPassagem) AS UltimaPassagem,
          DATEDIFF(MINUTE, MAX(p.DataPassagem), GETDATE()) AS MinutosSemComunicacao,
          CASE
            WHEN DATEDIFF(MINUTE, MAX(p.DataPassagem), GETDATE()) < 60 THEN 'online'
            WHEN DATEDIFF(MINUTE, MAX(p.DataPassagem), GETDATE()) < 1440 THEN 'warning'
            ELSE 'offline'
          END AS Status
        FROM TBEquipamentos e
        LEFT JOIN TBPassagens p ON e.EquipamentoId = p.EquipamentoId
        GROUP BY e.Id, e.Nome
        ORDER BY UltimaPassagem DESC
      `
    }
  }
};
