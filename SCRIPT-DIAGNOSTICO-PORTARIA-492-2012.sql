-- ==================================================
-- SCRIPT DE DIAGNÓSTICO: ERRO "492 de 17/07/2012"
-- Sistema: AxHub STRANS
-- Data: 2026-06-15
-- Contexto: Imagem de 11/06/2026 mostra data errada
-- ==================================================

USE [NOME_DO_BANCO_STRANS]; -- ALTERAR PARA O NOME CORRETO DO BANCO
GO

PRINT '============================================'
PRINT '1. VERIFICAR TODOS OS MODELOS VSIS-OCR'
PRINT '============================================'
SELECT 
    Id,
    Marca,
    Modelo,
    NumeroPortaria,
    Portaria,
    DataAtualizacao,
    AtualizadoPor,
    CASE 
        WHEN Portaria LIKE '%2012%' OR Portaria LIKE '%17/07%' THEN '❌ ERRO ENCONTRADO!'
        WHEN Portaria LIKE '%2021%' THEN '✅ CORRETO'
        ELSE '⚠️ VERIFICAR'
    END as Status
FROM TBModeloEquipamentos
WHERE Modelo LIKE '%VSIS%' OR Modelo LIKE '%OCR%' OR Marca LIKE '%VELSIS%'
ORDER BY DataAtualizacao DESC
GO

PRINT ''
PRINT '============================================'
PRINT '2. VERIFICAR CONFIGURAÇÕES GLOBAIS'
PRINT '============================================'
SELECT 
    Id,
    TipoConfiguracao,
    ValorConfiguracao,
    DataAtualizacao,
    AtualizadoPor
FROM TBConfiguracoes
WHERE 
    ValorConfiguracao LIKE '%492%'
    OR ValorConfiguracao LIKE '%2012%'
    OR ValorConfiguracao LIKE '%17/07%'
    OR ValorConfiguracao LIKE '%portaria%'
    OR TipoConfiguracao LIKE '%portaria%'
GO

PRINT ''
PRINT '============================================'
PRINT '3. VERIFICAR MODELO USADO PELO EQUIPAMENTO T5402'
PRINT '============================================'
SELECT 
    e.Codigo as Equipamento,
    e.Id as EquipamentoId,
    m.Id as ModeloId,
    m.Marca,
    m.Modelo,
    m.NumeroPortaria,
    m.Portaria,
    m.DataAtualizacao,
    CASE 
        WHEN m.Portaria LIKE '%2012%' THEN '❌ ESTE É O MODELO COM ERRO!'
        WHEN m.Portaria LIKE '%2021%' THEN '✅ Modelo correto'
        ELSE '⚠️ Verificar'
    END as Status
FROM TBEquipamentos e
INNER JOIN TBModeloEquipamentos m ON e.ModeloEquipamento_id = m.Id
WHERE e.Codigo IN ('T5402', 'T5403')
ORDER BY e.Codigo
GO

PRINT ''
PRINT '============================================'
PRINT '4. VERIFICAR AFERICOES DA OPERACAO 359a6427'
PRINT '============================================'
SELECT 
    o.Id as OperacaoId,
    e.Codigo as Equipamento,
    f.Id as FaixaId,
    f.NumeroFaixa,
    a.Id as AfericaoId,
    a.NumeroInmetro,
    a.NumeroLaudo,
    a.DataAfericao,
    a.DataVencimento
FROM TBOperacoes o
INNER JOIN TBEquipamentos e ON o.Equipamento_id = e.Id
INNER JOIN TBFaixas f ON f.Operacao_id = o.Id
LEFT JOIN TBFaixasAfericoes fa ON fa.Faixa_id = f.Id
LEFT JOIN TBAfericoes a ON a.Id = fa.Afericao_id
WHERE o.Id = '359a6427-d58d-490e-ab3b-362504f5c7ef'
ORDER BY f.NumeroFaixa
GO

PRINT ''
PRINT '============================================'
PRINT '5. BUSCAR TEXTO "2012" EM TODAS AS TABELAS'
PRINT '============================================'

-- TBModeloEquipamentos
SELECT 
    'TBModeloEquipamentos' as Tabela,
    CAST(Id AS NVARCHAR(50)) as Id,
    Modelo as Campo1,
    Portaria as Campo2,
    '---' as Campo3
FROM TBModeloEquipamentos
WHERE Portaria LIKE '%2012%' OR Portaria LIKE '%17/07%'

UNION ALL

-- TBConfiguracoes
SELECT 
    'TBConfiguracoes' as Tabela,
    CAST(Id AS NVARCHAR(50)) as Id,
    TipoConfiguracao as Campo1,
    ValorConfiguracao as Campo2,
    '---' as Campo3
FROM TBConfiguracoes
WHERE ValorConfiguracao LIKE '%2012%' OR ValorConfiguracao LIKE '%17/07%'
GO

PRINT ''
PRINT '============================================'
PRINT '6. VERIFICAR ESTRUTURA COMPLETA TBAFERICOES'
PRINT '============================================'
-- Ver TODOS os campos de TBAfericoes (pode ter campo não documentado)
SELECT TOP 1 * FROM TBAfericoes
GO

PRINT ''
PRINT '============================================'
PRINT '7. CONTAR QUANTOS MODELOS VSIS-OCR EXISTEM'
PRINT '============================================'
SELECT 
    COUNT(*) as TotalModelos,
    COUNT(DISTINCT Portaria) as PortariasDistintas,
    STRING_AGG(CAST(Portaria AS NVARCHAR(MAX)), ' | ') as TodasPortarias
FROM TBModeloEquipamentos
WHERE Modelo LIKE '%VSIS%'
GO

PRINT ''
PRINT '============================================'
PRINT '8. LISTAR TODAS AS PORTARIAS CADASTRADAS'
PRINT '============================================'
SELECT DISTINCT
    Portaria,
    COUNT(*) as QtdModelos,
    STRING_AGG(Modelo, ', ') as Modelos
FROM TBModeloEquipamentos
WHERE Portaria IS NOT NULL AND Portaria <> ''
GROUP BY Portaria
ORDER BY COUNT(*) DESC
GO

PRINT ''
PRINT '============================================'
PRINT '9. VERIFICAR INFRAÇÕES RECENTES (11/06/2026)'
PRINT '============================================'
SELECT TOP 10
    i.Id,
    i.DataHoraInfracao,
    i.Placa,
    e.Codigo as Equipamento,
    m.Modelo,
    m.Portaria,
    o.Id as OperacaoId,
    t.Nome as NomeTarja
FROM TBInfracoes i
INNER JOIN TBEquipamentos e ON i.Equipamento_id = e.Id
INNER JOIN TBModeloEquipamentos m ON e.ModeloEquipamento_id = m.Id
LEFT JOIN TBOperacoes o ON i.Operacao_id = o.Id
LEFT JOIN TBTarjas t ON o.Tarja_id = t.Id
WHERE 
    CAST(i.DataHoraInfracao AS DATE) = '2026-06-11'
    AND e.Codigo IN ('T5402', 'T5403')
ORDER BY i.DataHoraInfracao DESC
GO

PRINT ''
PRINT '============================================'
PRINT '10. VERIFICAR SE EXISTE CAMPO CUSTOMIZADO'
PRINT '============================================'
-- Verificar colunas de TBAfericoes
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'TBAfericoes'
ORDER BY ORDINAL_POSITION
GO

PRINT ''
PRINT '============================================'
PRINT '11. VERIFICAR TARJA AXION COMPLETA'
PRINT '============================================'
SELECT 
    Id,
    Nome,
    LEN(Template) as TamanhoTemplate,
    CASE 
        WHEN Template LIKE '%2012%' THEN '❌ CONTÉM 2012 HARDCODED!'
        WHEN Template LIKE '%{PortariaNaoMetrologico}%' THEN '✅ Usa placeholder'
        ELSE '⚠️ Verificar template'
    END as Status,
    LEFT(Template, 500) as TemplateInicio
FROM TBTarjas
WHERE Nome LIKE '%Axion%' OR Id = '7c63d905-76d5-4824-bb91-2251e62dc77d'
GO

PRINT ''
PRINT '============================================'
PRINT 'DIAGNÓSTICO CONCLUÍDO'
PRINT '============================================'
PRINT ''
PRINT 'ANÁLISE DOS RESULTADOS:'
PRINT '- Se encontrou "❌ ERRO ENCONTRADO!" na seção 1: O erro está em TBModeloEquipamentos'
PRINT '- Se encontrou registros na seção 2: O erro está em TBConfiguracoes'
PRINT '- Se encontrou registros na seção 5: O erro está em alguma tabela específica'
PRINT '- Se a seção 11 mostrar "❌ CONTÉM 2012 HARDCODED!": O erro está no template da tarja'
PRINT ''
PRINT 'AÇÃO CORRETIVA:'
PRINT '1. Identificar qual tabela contém o valor "492 de 17/07/2012"'
PRINT '2. UPDATE na tabela identificada para corrigir a portaria'
PRINT '3. Reprocessar as infrações do dia 11/06/2026 para atualizar as tarjas'
