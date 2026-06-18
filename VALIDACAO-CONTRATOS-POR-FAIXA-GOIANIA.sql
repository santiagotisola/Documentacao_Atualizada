-- ============================================================================
-- VALIDAÇÃO DE CONTRATOS POR FAIXA - MEDIÇÃO GOIÂNIA
-- ============================================================================
-- Objetivo: Verificar se cada faixa dos equipamentos possui contrato vinculado
-- Equipamentos: GYN1R801 (problemático) vs GYN1R803/804/805 (referência)
-- Data: 2026-06-18
-- ============================================================================

USE AxHub_Goiania; -- Ajustar nome do banco se necessário
GO

-- ============================================================================
-- QUERY 1: VALIDAÇÃO COMPLETA DE CONTRATOS POR FAIXA
-- ============================================================================
-- Mostra para cada faixa se há contrato vinculado e seus detalhes

SELECT 
    e.CodigoEquipamento AS 'Equipamento',
    f.NumeroFaixa AS 'Faixa',
    f.Id AS 'FaixaId',
    
    -- Informações do Contrato
    c.Id AS 'ContratoId',
    c.NumeroContrato AS 'Num. Contrato',
    c.Status AS 'Status Contrato',
    CONVERT(VARCHAR(10), c.DataInicio, 103) AS 'Início Contrato',
    CONVERT(VARCHAR(10), c.DataFim, 103) AS 'Fim Contrato',
    
    -- Verificação de Vigência para Maio/2026
    CASE 
        WHEN c.Id IS NULL THEN '❌ SEM CONTRATO'
        WHEN c.Status = 0 THEN '⚠️ CONTRATO INATIVO'
        WHEN '2026-05-01' < c.DataInicio THEN '⚠️ CONTRATO AINDA NÃO INICIADO'
        WHEN '2026-05-31' > c.DataFim THEN '⚠️ CONTRATO EXPIRADO'
        WHEN c.Status = 1 
             AND '2026-05-01' >= c.DataInicio 
             AND '2026-05-31' <= c.DataFim THEN '✅ CONTRATO VÁLIDO'
        ELSE '⚠️ VERIFICAR VIGÊNCIA'
    END AS 'Validação Maio/2026',
    
    -- Vínculo Equipamento-Contrato
    ce.Id AS 'VinculoId',
    CASE 
        WHEN ce.Id IS NULL THEN '❌ EQUIPAMENTO NÃO VINCULADO'
        ELSE '✅ EQUIPAMENTO VINCULADO'
    END AS 'Status Vínculo'

FROM TBEquipamentos e
INNER JOIN TBFaixas f ON f.EquipamentoId = e.Id
LEFT JOIN TBContratosEquipamentos ce ON ce.EquipamentoId = e.Id
LEFT JOIN TBContratos c ON c.Id = ce.ContratoId

WHERE e.CodigoEquipamento IN ('GYN1R801', 'GYN1R803', 'GYN1R804', 'GYN1R805')

ORDER BY 
    e.CodigoEquipamento,
    f.NumeroFaixa;

-- ============================================================================
-- QUERY 2: RECURSOS POR FAIXA COM VALIDAÇÃO DE CONTRATO
-- ============================================================================
-- Mostra se cada faixa tem recursos cadastrados E vinculados a contrato válido

SELECT 
    e.CodigoEquipamento AS 'Equipamento',
    f.NumeroFaixa AS 'Faixa',
    
    -- Dados do Recurso
    r.Id AS 'RecursoId',
    r.ValorPrevisto AS 'Valor Previsto',
    r.Bdi AS 'BDI %',
    CASE WHEN r.Status = 1 THEN 'Ativo' ELSE 'Inativo' END AS 'Status Recurso',
    CONVERT(VARCHAR(10), r.DataInicio, 103) AS 'Início Recurso',
    CONVERT(VARCHAR(10), r.DataFim, 103) AS 'Fim Recurso',
    
    -- Dados do Contrato vinculado ao Recurso
    c.Id AS 'ContratoId',
    c.NumeroContrato AS 'Num. Contrato',
    CASE WHEN c.Status = 1 THEN 'Ativo' ELSE 'Inativo' END AS 'Status Contrato',
    
    -- Diagnóstico Completo
    CASE 
        WHEN r.Id IS NULL THEN '🔴 RECURSO NÃO CADASTRADO'
        WHEN r.ContratoId IS NULL THEN '🔴 RECURSO SEM CONTRATO VINCULADO'
        WHEN c.Id IS NULL THEN '🔴 CONTRATO NÃO ENCONTRADO'
        WHEN c.Status = 0 THEN '🔴 CONTRATO INATIVO'
        WHEN r.Status = 0 THEN '🔴 RECURSO INATIVO'
        WHEN r.ValorPrevisto IS NULL OR r.ValorPrevisto = 0 THEN '🔴 VALOR PREVISTO ZERADO'
        WHEN r.Bdi IS NULL OR r.Bdi = 0 THEN '🟡 BDI ZERADO (Opcional)'
        WHEN '2026-05-01' < r.DataInicio OR '2026-05-31' > r.DataFim THEN '🔴 VIGÊNCIA RECURSO INVÁLIDA'
        WHEN '2026-05-01' < c.DataInicio OR '2026-05-31' > c.DataFim THEN '🔴 VIGÊNCIA CONTRATO INVÁLIDA'
        ELSE '✅ CONFIGURAÇÃO OK'
    END AS 'Diagnóstico'

FROM TBEquipamentos e
INNER JOIN TBFaixas f ON f.EquipamentoId = e.Id
LEFT JOIN TBRecursos r ON r.EquipamentoId = e.Id AND r.FaixaId = f.Id
LEFT JOIN TBContratos c ON c.Id = r.ContratoId

WHERE e.CodigoEquipamento IN ('GYN1R801', 'GYN1R803', 'GYN1R804', 'GYN1R805')

ORDER BY 
    e.CodigoEquipamento,
    f.NumeroFaixa;

-- ============================================================================
-- QUERY 3: COMPARATIVO RESUMIDO - GYN1R801 vs REFERÊNCIA
-- ============================================================================
-- Resumo mostrando diferenças de configuração

SELECT 
    e.CodigoEquipamento AS 'Equipamento',
    COUNT(DISTINCT f.Id) AS 'Total Faixas',
    COUNT(DISTINCT r.Id) AS 'Faixas com Recurso',
    COUNT(DISTINCT CASE WHEN r.ContratoId IS NOT NULL THEN r.Id END) AS 'Recursos com Contrato',
    COUNT(DISTINCT CASE WHEN c.Status = 1 THEN r.Id END) AS 'Recursos com Contrato Ativo',
    
    -- Status Geral
    CASE 
        WHEN COUNT(DISTINCT f.Id) = COUNT(DISTINCT CASE WHEN r.Id IS NOT NULL 
                                                         AND r.ContratoId IS NOT NULL 
                                                         AND c.Status = 1 
                                                         AND r.ValorPrevisto > 0 
                                                    THEN r.Id END)
        THEN '✅ TODAS FAIXAS OK'
        ELSE '❌ PROBLEMA DETECTADO'
    END AS 'Status Geral'

FROM TBEquipamentos e
INNER JOIN TBFaixas f ON f.EquipamentoId = e.Id
LEFT JOIN TBRecursos r ON r.EquipamentoId = e.Id AND r.FaixaId = f.Id
LEFT JOIN TBContratos c ON c.Id = r.ContratoId

WHERE e.CodigoEquipamento IN ('GYN1R801', 'GYN1R803', 'GYN1R804', 'GYN1R805')

GROUP BY e.CodigoEquipamento
ORDER BY e.CodigoEquipamento;

-- ============================================================================
-- QUERY 4: CONTRATOS ATIVOS NO PERÍODO MAIO/2026
-- ============================================================================
-- Lista todos os contratos que deveriam estar ativos em Maio/2026

SELECT 
    c.Id AS 'ContratoId',
    c.NumeroContrato AS 'Num. Contrato',
    c.Status AS 'Status',
    CONVERT(VARCHAR(10), c.DataInicio, 103) AS 'Início',
    CONVERT(VARCHAR(10), c.DataFim, 103) AS 'Fim',
    
    -- Equipamentos vinculados
    STRING_AGG(e.CodigoEquipamento, ', ') AS 'Equipamentos Vinculados',
    
    -- Validação para Maio/2026
    CASE 
        WHEN c.Status = 0 THEN '❌ INATIVO'
        WHEN '2026-05-01' < c.DataInicio THEN '❌ NÃO INICIADO'
        WHEN '2026-05-31' > c.DataFim THEN '❌ EXPIRADO'
        WHEN c.Status = 1 
             AND '2026-05-01' >= c.DataInicio 
             AND '2026-05-31' <= c.DataFim THEN '✅ VÁLIDO'
        ELSE '⚠️ VERIFICAR'
    END AS 'Validação Maio/2026'

FROM TBContratos c
LEFT JOIN TBContratosEquipamentos ce ON ce.ContratoId = c.Id
LEFT JOIN TBEquipamentos e ON e.Id = ce.EquipamentoId

WHERE e.CodigoEquipamento IN ('GYN1R801', 'GYN1R803', 'GYN1R804', 'GYN1R805')
   OR c.Id IN (
       SELECT DISTINCT r.ContratoId 
       FROM TBRecursos r
       INNER JOIN TBEquipamentos eq ON eq.Id = r.EquipamentoId
       WHERE eq.CodigoEquipamento IN ('GYN1R801', 'GYN1R803', 'GYN1R804', 'GYN1R805')
   )

GROUP BY 
    c.Id, c.NumeroContrato, c.Status, c.DataInicio, c.DataFim

ORDER BY c.NumeroContrato;

-- ============================================================================
-- QUERY 5: SCRIPT DE CORREÇÃO - VINCULAR CONTRATO ÀS FAIXAS SEM RECURSO
-- ============================================================================
-- Execute este script SOMENTE após identificar o ContratoId correto na Query 4

/*
-- ATENÇÃO: Substitua @ContratoId pelo ID do contrato válido encontrado na Query 4
-- ATENÇÃO: Revise os valores de ValorPrevisto e Bdi conforme o contrato

DECLARE @ContratoId INT = NULL; -- PREENCHER COM O ID DO CONTRATO
DECLARE @ValorPrevisto DECIMAL(18,2) = 15000.00; -- AJUSTAR CONFORME CONTRATO
DECLARE @Bdi DECIMAL(5,2) = 25.00; -- AJUSTAR CONFORME CONTRATO
DECLARE @DataInicio DATE = '2026-01-01'; -- AJUSTAR CONFORME CONTRATO
DECLARE @DataFim DATE = '2026-12-31'; -- AJUSTAR CONFORME CONTRATO

-- Inserir recursos para faixas do GYN1R801 que não possuem
INSERT INTO TBRecursos (
    EquipamentoId,
    FaixaId,
    ContratoId,
    ValorPrevisto,
    Bdi,
    Status,
    DataInicio,
    DataFim,
    DataCriacao,
    UsuarioCriacaoId
)
SELECT 
    e.Id AS EquipamentoId,
    f.Id AS FaixaId,
    @ContratoId AS ContratoId,
    @ValorPrevisto AS ValorPrevisto,
    @Bdi AS Bdi,
    1 AS Status, -- Ativo
    @DataInicio AS DataInicio,
    @DataFim AS DataFim,
    GETDATE() AS DataCriacao,
    1 AS UsuarioCriacaoId -- AJUSTAR conforme usuário logado
FROM TBEquipamentos e
INNER JOIN TBFaixas f ON f.EquipamentoId = e.Id
WHERE e.CodigoEquipamento = 'GYN1R801'
  AND NOT EXISTS (
      SELECT 1 FROM TBRecursos r 
      WHERE r.EquipamentoId = e.Id AND r.FaixaId = f.Id
  );

-- Verificar inserção
SELECT 'Recursos inseridos para GYN1R801:', @@ROWCOUNT AS 'Total';
*/

-- ============================================================================
-- FIM DO SCRIPT DE VALIDAÇÃO
-- ============================================================================
-- Resultado Esperado:
-- - Query 1: Lista completa de faixas com status de contrato
-- - Query 2: Diagnóstico detalhado apontando problema exato
-- - Query 3: Comparativo resumido mostrando diferenças
-- - Query 4: Contratos disponíveis para vincular
-- - Query 5: Script de correção (comentado para segurança)
-- ============================================================================
