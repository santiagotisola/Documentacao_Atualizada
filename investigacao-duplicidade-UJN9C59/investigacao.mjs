/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * INVESTIGAÇÃO COMPLETA — DUPLICIDADE DE INFRAÇÃO — PLACA UJN9C59
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Ticket: #100423690
 * Solicitante: Karla Ramira (SMTT)
 * Data do evento: 07/06/2026
 * Equipamento: SL316R-2
 * Local: Avenida Edson Brandão, 283 - Anil - FAIXA 2
 * 
 * Objetivo: Identificar a causa raiz da duplicidade de processamento
 *           sem geração de alerta no sistema.
 * 
 * Conexão: SMTT AxHub SQL Server
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import sql from "mssql";
import crypto from "crypto";
import fs from "fs";
import path from "path";

// ─── CONFIGURAÇÃO DE CONEXÃO ─────────────────────────────────────────────────
// Preencher com credenciais do banco SMTT antes de executar
const CONFIG = {
  server:   process.env.SMTT_DB_HOST || "PREENCHER_HOST",
  port:     parseInt(process.env.SMTT_DB_PORT) || 1433,
  database: process.env.SMTT_DB_NAME || "AxHub",
  user:     process.env.SMTT_DB_USER || "PREENCHER_USUARIO",
  password: process.env.SMTT_DB_PASS || "PREENCHER_SENHA",
  options: {
    encrypt: false,
    trustServerCertificate: true
  },
  connectionTimeout: 15000,
  requestTimeout: 30000
};

// ─── PARÂMETROS DO CASO ──────────────────────────────────────────────────────
const CASO = {
  placa: "UJN9C59",
  data: "2026-06-07",
  equipamento: "SL316R-2",
  local: "Avenida Edson Brandão, 283 - Anil",
  faixa: 2,
  horario_fabricante_img1: "16:30:22",
  horario_fabricante_img2: "16:30:33",
  horario_axhub_ambas: "16:30:22",
  ticket: "100423690"
};

// ─── RESULTADO DA INVESTIGAÇÃO ───────────────────────────────────────────────
const RESULTADO = {
  caso: CASO,
  executado_em: new Date().toISOString(),
  etapas: [],
  conclusao: null,
  divergencias: [],
  recomendacoes: []
};

function log(etapa, dados) {
  console.log(`\n${"═".repeat(70)}`);
  console.log(`  ETAPA: ${etapa}`);
  console.log(`${"═".repeat(70)}`);
  console.log(JSON.stringify(dados, null, 2));
  RESULTADO.etapas.push({ etapa, dados, timestamp: new Date().toISOString() });
}

// ═══════════════════════════════════════════════════════════════════════════════
// ETAPA 1 — LOCALIZAR TODAS AS INFRAÇÕES DA PLACA NA DATA
// ═══════════════════════════════════════════════════════════════════════════════
async function etapa1_localizarInfracoes(pool) {
  const result = await pool.request()
    .input("placa", sql.VarChar, CASO.placa)
    .input("dataInicio", sql.DateTime, `${CASO.data} 00:00:00`)
    .input("dataFim", sql.DateTime, `${CASO.data} 23:59:59`)
    .query(`
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
      WHERE i.Placa = @placa
        AND i.DataHoraInfracao BETWEEN @dataInicio AND @dataFim
      ORDER BY i.DataHoraInfracao ASC
    `);

  log("1 - LOCALIZAR INFRAÇÕES", {
    total_registros: result.recordset.length,
    registros: result.recordset
  });

  return result.recordset;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ETAPA 2 — COMPARAR DATA/HORA, VELOCIDADES, ENQUADRAMENTO
// ═══════════════════════════════════════════════════════════════════════════════
async function etapa2_compararRegistros(pool, infracoes) {
  if (infracoes.length < 2) {
    log("2 - COMPARAÇÃO DE REGISTROS", { resultado: "Menos de 2 registros encontrados — sem duplicidade." });
    return null;
  }

  const comparacao = [];
  for (let i = 0; i < infracoes.length - 1; i++) {
    for (let j = i + 1; j < infracoes.length; j++) {
      const a = infracoes[i];
      const b = infracoes[j];
      const diffMs = Math.abs(new Date(a.DataHoraInfracao) - new Date(b.DataHoraInfracao));
      
      comparacao.push({
        par: `${a.IdInfracao} vs ${b.IdInfracao}`,
        diferenca_temporal_ms: diffMs,
        diferenca_temporal_seg: (diffMs / 1000).toFixed(1),
        mesmo_equipamento: a.IdEquipamento === b.IdEquipamento,
        mesma_faixa: a.IdFaixa === b.IdFaixa,
        mesmo_local: a.IdLocal === b.IdLocal,
        mesma_velocidade_medida: a.VelocidadeMedida === b.VelocidadeMedida,
        mesma_velocidade_considerada: a.VelocidadeConsiderada === b.VelocidadeConsiderada,
        mesma_velocidade_regulamentada: a.VelocidadeRegulamentada === b.VelocidadeRegulamentada,
        mesmo_protocolo: a.Protocolo === b.Protocolo,
        velocidade_A: { medida: a.VelocidadeMedida, considerada: a.VelocidadeConsiderada, regulamentada: a.VelocidadeRegulamentada },
        velocidade_B: { medida: b.VelocidadeMedida, considerada: b.VelocidadeConsiderada, regulamentada: b.VelocidadeRegulamentada },
        dataHora_A: a.DataHoraInfracao,
        dataHora_B: b.DataHoraInfracao,
        protocolo_A: a.Protocolo,
        protocolo_B: b.Protocolo,
        importacao_A: a.DataHoraImportacao,
        importacao_B: b.DataHoraImportacao,
        potencial_duplicidade: diffMs < 60000 && a.IdEquipamento === b.IdEquipamento && a.IdFaixa === b.IdFaixa
      });
    }
  }

  log("2 - COMPARAÇÃO DE REGISTROS", { comparacoes: comparacao });
  return comparacao;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ETAPA 3 — COMPARAR IMAGENS (HASH, NOME, TAMANHO)
// ═══════════════════════════════════════════════════════════════════════════════
async function etapa3_compararImagens(pool, infracoes) {
  const ids = infracoes.map(i => i.IdInfracao);
  
  // Buscar imagens associadas
  const result = await pool.request()
    .query(`
      SELECT 
        im.IdImagem,
        im.IdInfracao,
        im.NomeArquivo,
        im.Tamanho,
        im.TipoImagem,
        im.DataHoraCaptura,
        im.CaminhoArquivo,
        im.Hash,
        im.Largura,
        im.Altura
      FROM TBImagens im
      WHERE im.IdInfracao IN (${ids.join(",")})
      ORDER BY im.IdInfracao, im.IdImagem
    `);

  // Se não encontrar na TBImagens, tentar TBInfracoesImagens
  let imagens = result.recordset;
  if (imagens.length === 0) {
    try {
      const alt = await pool.request()
        .query(`
          SELECT 
            ii.IdInfracaoImagem AS IdImagem,
            ii.IdInfracao,
            ii.NomeArquivo,
            ii.Caminho AS CaminhoArquivo,
            ii.Tamanho,
            ii.Tipo AS TipoImagem,
            ii.DataHora AS DataHoraCaptura
          FROM TBInfracoesImagens ii
          WHERE ii.IdInfracao IN (${ids.join(",")})
          ORDER BY ii.IdInfracao, ii.IdInfracaoImagem
        `);
      imagens = alt.recordset;
    } catch (e) {
      // Tabela pode não existir — tentar nome alternativo
      try {
        const alt2 = await pool.request()
          .query(`
            SELECT 
              IdImagemInfracao AS IdImagem,
              IdInfracao,
              Nome AS NomeArquivo,
              Caminho AS CaminhoArquivo,
              Tamanho
            FROM TBImagensInfracoes
            WHERE IdInfracao IN (${ids.join(",")})
            ORDER BY IdInfracao
          `);
        imagens = alt2.recordset;
      } catch (e2) {
        // Último recurso
      }
    }
  }

  // Comparar hashes se disponíveis
  const hashComparacao = [];
  if (imagens.length >= 2) {
    for (let i = 0; i < imagens.length - 1; i++) {
      for (let j = i + 1; j < imagens.length; j++) {
        hashComparacao.push({
          imagem_A: imagens[i].NomeArquivo,
          imagem_B: imagens[j].NomeArquivo,
          mesmo_hash: imagens[i].Hash && imagens[j].Hash && imagens[i].Hash === imagens[j].Hash,
          mesmo_tamanho: imagens[i].Tamanho === imagens[j].Tamanho,
          mesmo_nome: imagens[i].NomeArquivo === imagens[j].NomeArquivo,
          tamanho_A: imagens[i].Tamanho,
          tamanho_B: imagens[j].Tamanho,
          hash_A: imagens[i].Hash || "N/D",
          hash_B: imagens[j].Hash || "N/D"
        });
      }
    }
  }

  log("3 - COMPARAÇÃO DE IMAGENS", {
    total_imagens: imagens.length,
    imagens,
    comparacao_hash: hashComparacao
  });

  return { imagens, hashComparacao };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ETAPA 4 — VERIFICAR INTEGRAÇÕES RECEBIDAS (LOG DE IMPORTAÇÃO)
// ═══════════════════════════════════════════════════════════════════════════════
async function etapa4_verificarIntegracoes(pool, infracoes) {
  const ids = infracoes.map(i => i.IdInfracao);
  
  // Tentar localizar logs de importação/integração
  let logs = [];
  
  // Tabela de logs de importação (varia conforme versão do AxHub)
  const tentativas = [
    `SELECT * FROM TBLogsImportacao WHERE IdInfracao IN (${ids.join(",")}) ORDER BY DataHora`,
    `SELECT * FROM TBImportacoes WHERE IdInfracao IN (${ids.join(",")}) ORDER BY DataHoraImportacao`,
    `SELECT * FROM TBLogsIntegracao WHERE Placa = '${CASO.placa}' AND DataHora BETWEEN '${CASO.data} 00:00:00' AND '${CASO.data} 23:59:59'`,
    `SELECT * FROM TBLogs WHERE Descricao LIKE '%${CASO.placa}%' AND DataHora BETWEEN '${CASO.data} 00:00:00' AND '${CASO.data} 23:59:59'`,
    `SELECT TOP 20 * FROM TBHistoricoImportacoes WHERE DataImportacao BETWEEN '${CASO.data} 00:00:00' AND '${CASO.data} 23:59:59' ORDER BY DataImportacao DESC`
  ];

  for (const query of tentativas) {
    try {
      const r = await pool.request().query(query);
      if (r.recordset.length > 0) {
        logs.push({ query_usada: query.substring(0, 60) + "...", registros: r.recordset });
      }
    } catch (e) {
      // Tabela não existe nesta versão — ignorar
    }
  }

  // Verificar operações na data (para entender lotes de importação)
  const operacoes = await pool.request()
    .input("data", sql.DateTime, `${CASO.data}`)
    .query(`
      SELECT 
        o.IdOperacao,
        o.DataHoraInicio,
        o.DataHoraFim,
        e.Descricao AS Equipamento,
        o.TotalRegistros,
        o.Status
      FROM TBOperacoes o
      LEFT JOIN TBEquipamentos e ON o.IdEquipamento = e.IdEquipamento
      WHERE CAST(o.DataHoraInicio AS DATE) = @data
        AND e.Descricao LIKE '%SL316R%'
      ORDER BY o.DataHoraInicio
    `);

  log("4 - VERIFICAR INTEGRAÇÕES", {
    logs_encontrados: logs.length,
    logs,
    operacoes_dia: operacoes.recordset
  });

  return { logs, operacoes: operacoes.recordset };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ETAPA 5 — AUDITAR LOGS HTTP / REQUEST IDs
// ═══════════════════════════════════════════════════════════════════════════════
async function etapa5_auditarLogsHTTP(pool) {
  let logs = [];
  
  const tentativas = [
    `SELECT TOP 20 * FROM TBWebServiceLogs WHERE DataHora BETWEEN '${CASO.data} 16:00:00' AND '${CASO.data} 17:00:00' ORDER BY DataHora`,
    `SELECT TOP 20 * FROM TBLogsWebService WHERE DataHora BETWEEN '${CASO.data} 16:00:00' AND '${CASO.data} 17:00:00' ORDER BY DataHora`,
    `SELECT TOP 20 * FROM TBApiLogs WHERE Data BETWEEN '${CASO.data} 16:00:00' AND '${CASO.data} 17:00:00'`,
    `SELECT TOP 20 * FROM TBIntegracaoLogs WHERE Data BETWEEN '${CASO.data} 16:00:00' AND '${CASO.data} 17:00:00'`
  ];

  for (const query of tentativas) {
    try {
      const r = await pool.request().query(query);
      if (r.recordset.length > 0) {
        logs.push({ fonte: query.split("FROM ")[1]?.split(" WHERE")[0], registros: r.recordset });
      }
    } catch (e) {
      // Tabela não existe
    }
  }

  log("5 - AUDITORIA DE LOGS HTTP", {
    tabelas_encontradas: logs.length,
    logs
  });

  return logs;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ETAPA 6 — VERIFICAR ENQUADRAMENTOS
// ═══════════════════════════════════════════════════════════════════════════════
async function etapa6_verificarEnquadramentos(pool, infracoes) {
  const ids = infracoes.map(i => i.IdInfracao);
  
  const result = await pool.request()
    .query(`
      SELECT 
        ie.IdInfracao,
        ie.IdEnquadramento,
        en.Codigo,
        en.Descricao AS EnquadramentoDescricao,
        en.Artigo,
        en.Inciso,
        en.Paragrafo
      FROM TBInfracoesEnquadramentos ie
      JOIN TBEnquadramentos en ON ie.IdEnquadramento = en.IdEnquadramento
      WHERE ie.IdInfracao IN (${ids.join(",")})
      ORDER BY ie.IdInfracao
    `);

  // Comparar enquadramentos entre as infrações
  const porInfracao = {};
  for (const r of result.recordset) {
    if (!porInfracao[r.IdInfracao]) porInfracao[r.IdInfracao] = [];
    porInfracao[r.IdInfracao].push(r);
  }

  const enquadramentosDiferentes = ids.length >= 2 
    ? JSON.stringify(porInfracao[ids[0]]) !== JSON.stringify(porInfracao[ids[1]])
    : false;

  log("6 - ENQUADRAMENTOS", {
    total: result.recordset.length,
    por_infracao: porInfracao,
    enquadramentos_diferentes: enquadramentosDiferentes,
    divergencia: enquadramentosDiferentes 
      ? "⚠️ ENQUADRAMENTOS DIFERENTES entre as infrações — possível inconsistência!"
      : "Enquadramentos idênticos"
  });

  if (enquadramentosDiferentes) {
    RESULTADO.divergencias.push({
      campo: "Enquadramento",
      descricao: "Enquadramentos diferentes entre infrações que parecem duplicatas",
      valores: porInfracao
    });
  }

  return { porInfracao, enquadramentosDiferentes };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ETAPA 7 — VERIFICAR TRIAGENS
// ═══════════════════════════════════════════════════════════════════════════════
async function etapa7_verificarTriagens(pool, infracoes) {
  const ids = infracoes.map(i => i.IdInfracao);
  
  const result = await pool.request()
    .query(`
      SELECT 
        t.IdTriagem,
        t.IdInfracao,
        t.Status,
        t.DataHoraTriagem,
        t.IdUsuario,
        t.Motivo,
        t.Observacao,
        u.Nome AS Analista
      FROM TBTriagens t
      LEFT JOIN TBUsuarios u ON t.IdUsuario = u.IdUsuario
      WHERE t.IdInfracao IN (${ids.join(",")})
      ORDER BY t.DataHoraTriagem
    `);

  log("7 - STATUS DAS TRIAGENS", {
    total: result.recordset.length,
    triagens: result.recordset
  });

  return result.recordset;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ETAPA 8 — VERIFICAR HISTÓRICO DE ALTERAÇÕES
// ═══════════════════════════════════════════════════════════════════════════════
async function etapa8_verificarAlteracoes(pool, infracoes) {
  const ids = infracoes.map(i => i.IdInfracao);
  let historico = [];
  
  const tentativas = [
    `SELECT * FROM TBHistoricoInfracoes WHERE IdInfracao IN (${ids.join(",")}) ORDER BY DataHora`,
    `SELECT * FROM TBAuditoria WHERE Tabela = 'TBInfracoes' AND IdRegistro IN (${ids.join(",")}) ORDER BY DataHora`,
    `SELECT * FROM TBLogAlteracoes WHERE Tabela LIKE '%Infrac%' AND IdRegistro IN (${ids.join(",")}) ORDER BY Data`
  ];

  for (const query of tentativas) {
    try {
      const r = await pool.request().query(query);
      if (r.recordset.length > 0) {
        historico.push({ fonte: query.split("FROM ")[1]?.split(" WHERE")[0], registros: r.recordset });
      }
    } catch (e) {
      // Tabela não existe
    }
  }

  log("8 - HISTÓRICO DE ALTERAÇÕES", {
    tabelas_com_historico: historico.length,
    historico
  });

  return historico;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ETAPA 9 — VERIFICAR TOLERÂNCIA TEMPORAL E REGRAS DE DEDUPLICAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════
async function etapa9_verificarRegrasDuplicidade(pool) {
  let configuracoes = [];
  
  const tentativas = [
    `SELECT * FROM TBConfiguracoes WHERE Chave LIKE '%duplic%' OR Chave LIKE '%toleran%' OR Chave LIKE '%janela%'`,
    `SELECT * FROM TBParametros WHERE Nome LIKE '%duplic%' OR Nome LIKE '%toleran%' OR Nome LIKE '%janela%'`,
    `SELECT * FROM TBConfigSistema WHERE Parametro LIKE '%duplic%' OR Parametro LIKE '%toleran%'`,
    `SELECT * FROM TBConfiguracoes WHERE Grupo = 'Importacao' OR Grupo = 'Integracao'`,
    `SELECT * FROM TBParametrosSistema WHERE Categoria LIKE '%import%' OR Categoria LIKE '%integra%'`
  ];

  for (const query of tentativas) {
    try {
      const r = await pool.request().query(query);
      if (r.recordset.length > 0) {
        configuracoes.push({ fonte: query.split("FROM ")[1]?.split(" WHERE")[0], registros: r.recordset });
      }
    } catch (e) {
      // Tabela não existe
    }
  }

  // Verificar stored procedures relacionadas
  let procedures = [];
  try {
    const sp = await pool.request().query(`
      SELECT 
        ROUTINE_NAME,
        ROUTINE_TYPE,
        CREATED,
        LAST_ALTERED
      FROM INFORMATION_SCHEMA.ROUTINES
      WHERE ROUTINE_NAME LIKE '%duplic%'
        OR ROUTINE_NAME LIKE '%import%'
        OR ROUTINE_NAME LIKE '%validar%'
        OR ROUTINE_NAME LIKE '%integra%'
      ORDER BY ROUTINE_NAME
    `);
    procedures = sp.recordset;
  } catch (e) {}

  // Verificar triggers na TBInfracoes
  let triggers = [];
  try {
    const tr = await pool.request().query(`
      SELECT 
        t.name AS TriggerName,
        te.type_desc AS EventType,
        OBJECT_NAME(t.parent_id) AS TableName
      FROM sys.triggers t
      JOIN sys.trigger_events te ON t.object_id = te.object_id
      WHERE OBJECT_NAME(t.parent_id) IN ('TBInfracoes', 'TBTriagens', 'TBPassagens')
    `);
    triggers = tr.recordset;
  } catch (e) {}

  log("9 - REGRAS DE DEDUPLICAÇÃO", {
    configuracoes_encontradas: configuracoes.length,
    configuracoes,
    procedures_relacionadas: procedures,
    triggers_tabelas_infracoes: triggers,
    analise: procedures.length === 0 && configuracoes.length === 0
      ? "⚠️ NENHUMA REGRA DE DEDUPLICAÇÃO ENCONTRADA — sistema não possui validação automática de duplicidade!"
      : "Regras encontradas — verificar se cobrem o cenário"
  });

  return { configuracoes, procedures, triggers };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ETAPA 10 — SIMULAÇÃO: DEVERIA TER GERADO ALERTA?
// ═══════════════════════════════════════════════════════════════════════════════
function etapa10_simularDuplicidade(infracoes, comparacoes) {
  if (!comparacoes || comparacoes.length === 0) {
    log("10 - SIMULAÇÃO DE DUPLICIDADE", { resultado: "Sem pares para simular." });
    return;
  }

  const criteriosPadrao = {
    tolerancia_temporal_seg: 60,
    campos_comparacao: ["placa", "equipamento", "faixa", "velocidade_medida"],
    descricao: "Se mesma placa + mesmo equipamento + mesma faixa + mesma velocidade + intervalo < 60s → DUPLICIDADE"
  };

  const simulacoes = comparacoes.map(c => {
    const ehDuplicidade = 
      c.mesmo_equipamento &&
      c.mesma_faixa &&
      c.mesma_velocidade_medida &&
      parseFloat(c.diferenca_temporal_seg) <= criteriosPadrao.tolerancia_temporal_seg;

    return {
      par: c.par,
      criterios_atendidos: {
        mesmo_equipamento: c.mesmo_equipamento,
        mesma_faixa: c.mesma_faixa,
        mesma_velocidade: c.mesma_velocidade_medida,
        dentro_tolerancia_temporal: parseFloat(c.diferenca_temporal_seg) <= criteriosPadrao.tolerancia_temporal_seg,
        diferenca_seg: c.diferenca_temporal_seg
      },
      veredicto: ehDuplicidade ? "🔴 DUPLICIDADE CONFIRMADA — DEVERIA TER GERADO ALERTA" : "🟢 NÃO É DUPLICIDADE",
      justificativa: ehDuplicidade
        ? `Mesma placa (${CASO.placa}), equipamento, faixa e velocidade com apenas ${c.diferenca_temporal_seg}s de diferença. Trata-se de DUPLICIDADE que deveria ter sido bloqueada na importação.`
        : "Registros diferem em critérios suficientes para serem considerados eventos distintos."
    };
  });

  log("10 - SIMULAÇÃO DE DUPLICIDADE", {
    criterios_utilizados: criteriosPadrao,
    simulacoes
  });

  return simulacoes;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ETAPA 11 — VERIFICAR DIFERENÇA HORÁRIO FABRICANTE vs BANCO vs INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════
function etapa11_validarHorarios(infracoes) {
  const analise = infracoes.map(inf => ({
    IdInfracao: inf.IdInfracao,
    horario_banco: inf.DataHoraInfracao,
    horario_fabricante_esperado_1: `${CASO.data} ${CASO.horario_fabricante_img1}`,
    horario_fabricante_esperado_2: `${CASO.data} ${CASO.horario_fabricante_img2}`,
    observacao_karla: "No AxHub ambas aparecem como 16:30:22 — fabricante mostra 16:30:22 e 16:30:33",
    divergencia_detectada: null
  }));

  // Detectar divergência
  if (infracoes.length >= 2) {
    const h1 = new Date(infracoes[0].DataHoraInfracao);
    const h2 = new Date(infracoes[1].DataHoraInfracao);
    const diffSeg = Math.abs(h1 - h2) / 1000;
    
    if (diffSeg === 0) {
      analise.push({
        tipo: "DIVERGÊNCIA_HORÁRIO",
        descricao: "⚠️ HORÁRIOS IDÊNTICOS NO BANCO para dois registros que o fabricante enviou com 11 segundos de diferença (16:30:22 vs 16:30:33). Possível truncamento ou arredondamento durante importação.",
        diferenca_fabricante_seg: 11,
        diferenca_banco_seg: diffSeg,
        hipotese: "O sistema pode estar arredondando/truncando timestamps, ou o fabricante enviou o mesmo timestamp em ambas."
      });
      RESULTADO.divergencias.push({
        campo: "Horário",
        descricao: "Fabricante enviou horários distintos (11s diferença) mas banco gravou o mesmo horário",
        valor_fabricante: ["16:30:22", "16:30:33"],
        valor_banco: "ambos 16:30:22"
      });
    }
  }

  log("11 - VALIDAÇÃO DE HORÁRIOS", { analise });
  return analise;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ETAPA 12 — VERIFICAR VELOCIDADES (TARJA vs BANCO vs INTERFACE)
// ═══════════════════════════════════════════════════════════════════════════════
function etapa12_validarVelocidades(infracoes) {
  const analise = infracoes.map((inf, idx) => ({
    IdInfracao: inf.IdInfracao,
    velocidade_medida_banco: inf.VelocidadeMedida,
    velocidade_considerada_banco: inf.VelocidadeConsiderada,
    velocidade_regulamentada_banco: inf.VelocidadeRegulamentada,
    observacao_karla: idx === 1
      ? "Velocidade está divergente entre tarja e sistema para a segunda imagem"
      : "Velocidade confere na primeira imagem"
  }));

  // Comparar velocidades entre as infrações
  if (infracoes.length >= 2) {
    const a = infracoes[0];
    const b = infracoes[1];
    
    if (a.VelocidadeMedida !== b.VelocidadeMedida || a.VelocidadeConsiderada !== b.VelocidadeConsiderada) {
      analise.push({
        tipo: "DIVERGÊNCIA_VELOCIDADE",
        descricao: "⚠️ VELOCIDADES DIFERENTES entre registros que são potencialmente duplicados!",
        registro_1: { medida: a.VelocidadeMedida, considerada: a.VelocidadeConsiderada },
        registro_2: { medida: b.VelocidadeMedida, considerada: b.VelocidadeConsiderada },
        hipotese: "Dados foram alterados após importação, ou o fabricante enviou velocidades diferentes nos dois eventos."
      });
      RESULTADO.divergencias.push({
        campo: "Velocidade",
        descricao: "Velocidades diferentes entre registros potencialmente duplicados",
        valores: {
          registro_1: { medida: a.VelocidadeMedida, considerada: a.VelocidadeConsiderada },
          registro_2: { medida: b.VelocidadeMedida, considerada: b.VelocidadeConsiderada }
        }
      });
    }
  }

  log("12 - VALIDAÇÃO DE VELOCIDADES", { analise });
  return analise;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ETAPA 13 — ESQUEMA DAS TABELAS ENVOLVIDAS
// ═══════════════════════════════════════════════════════════════════════════════
async function etapa13_esquemaTabelas(pool) {
  const tabelas = ["TBInfracoes", "TBTriagens", "TBPassagens", "TBEquipamentos", "TBImagens", "TBInfracoesImagens"];
  const esquemas = {};
  
  for (const tabela of tabelas) {
    try {
      const r = await pool.request()
        .input("tabela", sql.VarChar, tabela)
        .query(`
          SELECT 
            COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_NAME = @tabela
          ORDER BY ORDINAL_POSITION
        `);
      if (r.recordset.length > 0) {
        esquemas[tabela] = r.recordset;
      }
    } catch (e) {}
  }

  log("13 - ESQUEMA DAS TABELAS", { tabelas_encontradas: Object.keys(esquemas), esquemas });
  return esquemas;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONCLUSÃO FINAL
// ═══════════════════════════════════════════════════════════════════════════════
function gerarConclusao(infracoes, comparacoes, regras, simulacoes) {
  const conclusao = {
    quantidade_registros_encontrados: infracoes.length,
    duplicidade_confirmada: false,
    origem_provavel: null,
    divergencias_total: RESULTADO.divergencias.length,
    causa_raiz: null,
    severidade: null,
    recomendacoes: []
  };

  // Determinar se é duplicidade
  if (simulacoes && simulacoes.some(s => s.veredicto.includes("CONFIRMADA"))) {
    conclusao.duplicidade_confirmada = true;
  }

  // Determinar origem
  if (conclusao.duplicidade_confirmada) {
    // Verificar se o fabricante enviou duas vezes OU se foi reprocessamento
    if (infracoes.length >= 2) {
      const diffImportacao = infracoes[1]?.DataHoraImportacao && infracoes[0]?.DataHoraImportacao
        ? Math.abs(new Date(infracoes[1].DataHoraImportacao) - new Date(infracoes[0].DataHoraImportacao))
        : null;

      if (diffImportacao !== null && diffImportacao < 5000) {
        conclusao.origem_provavel = "FABRICANTE_ENVIO_DUPLICADO";
        conclusao.causa_raiz = "O fabricante (equipamento SL316R-2) enviou duas integrações do mesmo evento de captura em sequência rápida. O AxHub não possui mecanismo de deduplicação na importação para bloquear registros duplicados.";
      } else if (diffImportacao !== null && diffImportacao > 5000) {
        conclusao.origem_provavel = "REPROCESSAMENTO_INTEGRACAO";
        conclusao.causa_raiz = "Os registros foram importados em momentos diferentes, indicando retry/reenvio pela API do fabricante ou reprocessamento do lote de importação.";
      } else {
        conclusao.origem_provavel = "FALHA_DEDUPLICACAO_AXHUB";
        conclusao.causa_raiz = "O AxHub não implementa verificação de duplicidade na importação de infrações. Qualquer evento que chegue pela integração é gravado sem validação de existência prévia.";
      }
    }

    conclusao.severidade = "ALTA";
    conclusao.recomendacoes = [
      {
        prioridade: "CRITICA",
        acao: "Implementar validação de duplicidade na importação de infrações",
        detalhe: "Antes de gravar nova infração, verificar se já existe registro com mesma placa + equipamento + faixa + horário (±60s). Se existir, bloquear e registrar log.",
        impacto: "Previne 100% das duplicidades futuras por envio duplicado do fabricante"
      },
      {
        prioridade: "ALTA",
        acao: "Criar alerta automático de possível duplicidade",
        detalhe: "Trigger ou job que detecta infrações com mesmo conjunto (placa, equipamento, faixa) em janela < 60s e gera notificação para o operador.",
        impacto: "Permite identificação rápida de casos existentes"
      },
      {
        prioridade: "ALTA",
        acao: "Auditar registros existentes para identificar outros casos de duplicidade",
        detalhe: "Executar query de varredura no banco para encontrar outros pares de infrações potencialmente duplicados.",
        impacto: "Identifica escopo do problema — pode haver centenas de casos não detectados"
      },
      {
        prioridade: "MEDIA",
        acao: "Investigar firmware/configuração do equipamento SL316R-2",
        detalhe: "Verificar se o equipamento Pumatronix/ITSCAM está configurado com retry automático ou se houve falha de acknowledge na integração que causou reenvio.",
        impacto: "Elimina a causa na origem (fabricante)"
      },
      {
        prioridade: "MEDIA",
        acao: "Corrigir os registros duplicados encontrados neste caso",
        detalhe: "Descartar uma das infrações duplicadas na triagem com motivo 'Duplicidade de envio pelo fabricante'. Manter a que possui dados corretos na tarja.",
        impacto: "Resolve o caso específico do ticket #100423690"
      },
      {
        prioridade: "BAIXA",
        acao: "Implementar log de integração detalhado",
        detalhe: "Registrar RequestId, UUID, timestamp de recebimento e payload hash para cada evento recebido do fabricante, permitindo auditoria retroativa.",
        impacto: "Facilita diagnóstico de casos futuros"
      }
    ];
  }

  RESULTADO.conclusao = conclusao;
  RESULTADO.recomendacoes = conclusao.recomendacoes;

  log("CONCLUSÃO FINAL", conclusao);
  return conclusao;
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUERY DE VARREDURA — BUSCAR OUTRAS DUPLICIDADES NO BANCO
// ═══════════════════════════════════════════════════════════════════════════════
async function queryVarreduraDuplicidades(pool) {
  const query = `
    -- VARREDURA DE DUPLICIDADES — Últimos 30 dias
    -- Critério: mesma placa + equipamento + faixa + diferença < 60 segundos
    SELECT 
      a.IdInfracao AS IdInfracao_A,
      b.IdInfracao AS IdInfracao_B,
      a.Placa,
      a.DataHoraInfracao AS Hora_A,
      b.DataHoraInfracao AS Hora_B,
      DATEDIFF(SECOND, a.DataHoraInfracao, b.DataHoraInfracao) AS DiferencaSegundos,
      a.VelocidadeMedida AS VelMedida_A,
      b.VelocidadeMedida AS VelMedida_B,
      e.Descricao AS Equipamento
    FROM TBInfracoes a
    INNER JOIN TBInfracoes b 
      ON a.Placa = b.Placa
      AND a.IdEquipamento = b.IdEquipamento
      AND a.IdFaixa = b.IdFaixa
      AND a.IdInfracao < b.IdInfracao
      AND DATEDIFF(SECOND, a.DataHoraInfracao, b.DataHoraInfracao) BETWEEN 0 AND 60
    LEFT JOIN TBEquipamentos e ON a.IdEquipamento = e.IdEquipamento
    WHERE a.DataHoraInfracao >= DATEADD(DAY, -30, GETDATE())
    ORDER BY a.DataHoraInfracao DESC
  `;

  try {
    const r = await pool.request().query(query);
    log("VARREDURA DE DUPLICIDADES (30 dias)", {
      total_pares_duplicados: r.recordset.length,
      primeiros_20: r.recordset.slice(0, 20)
    });
    return r.recordset;
  } catch (e) {
    log("VARREDURA DE DUPLICIDADES (30 dias)", { erro: e.message });
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXECUÇÃO PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
async function executar() {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  INVESTIGAÇÃO DE DUPLICIDADE DE INFRAÇÃO                                    ║
║  Placa: ${CASO.placa} | Data: ${CASO.data} | Equip: ${CASO.equipamento}              ║
║  Ticket: #${CASO.ticket} | Solicitante: Karla Ramira (SMTT)                ║
╚══════════════════════════════════════════════════════════════════════════════╝
  `);

  let pool;
  try {
    console.log("🔌 Conectando ao banco SMTT AxHub...");
    pool = await sql.connect(CONFIG);
    console.log(`✅ Conectado: ${CONFIG.server}/${CONFIG.database}`);
  } catch (err) {
    console.error(`❌ Falha na conexão: ${err.message}`);
    console.error("\n⚠️  Configure as variáveis SMTT_DB_HOST, SMTT_DB_USER, SMTT_DB_PASS no ambiente ou edite o script.");
    process.exit(1);
  }

  try {
    // Execução sequencial das etapas
    const infracoes = await etapa1_localizarInfracoes(pool);
    const comparacoes = await etapa2_compararRegistros(pool, infracoes);
    await etapa3_compararImagens(pool, infracoes);
    await etapa4_verificarIntegracoes(pool, infracoes);
    await etapa5_auditarLogsHTTP(pool);
    await etapa6_verificarEnquadramentos(pool, infracoes);
    await etapa7_verificarTriagens(pool, infracoes);
    await etapa8_verificarAlteracoes(pool, infracoes);
    const regras = await etapa9_verificarRegrasDuplicidade(pool);
    const simulacoes = etapa10_simularDuplicidade(infracoes, comparacoes);
    etapa11_validarHorarios(infracoes);
    etapa12_validarVelocidades(infracoes);
    await etapa13_esquemaTabelas(pool);
    
    // Varredura geral
    await queryVarreduraDuplicidades(pool);

    // Conclusão
    gerarConclusao(infracoes, comparacoes, regras, simulacoes);

  } catch (err) {
    console.error(`\n❌ Erro durante investigação: ${err.message}`);
    RESULTADO.erro = err.message;
  } finally {
    await pool.close();
  }

  // Salvar resultado
  const outputPath = path.resolve(process.cwd(), "resultado-investigacao.json");
  fs.writeFileSync(outputPath, JSON.stringify(RESULTADO, null, 2), "utf8");
  console.log(`\n📄 Resultado salvo em: ${outputPath}`);
  
  console.log(`\n${"═".repeat(70)}`);
  console.log("  RESUMO DA INVESTIGAÇÃO");
  console.log(`${"═".repeat(70)}`);
  console.log(`  Registros encontrados: ${RESULTADO.conclusao?.quantidade_registros_encontrados || 0}`);
  console.log(`  Duplicidade confirmada: ${RESULTADO.conclusao?.duplicidade_confirmada ? "SIM 🔴" : "NÃO"}`);
  console.log(`  Origem provável: ${RESULTADO.conclusao?.origem_provavel || "Indeterminada"}`);
  console.log(`  Divergências: ${RESULTADO.divergencias.length}`);
  console.log(`  Recomendações: ${RESULTADO.recomendacoes.length}`);
  console.log(`${"═".repeat(70)}\n`);
}

executar().catch(console.error);
