-- ================================================================
-- SCRIPT DE DIAGNÓSTICO PARAMETRIZÁVEL - MEDIÇÃO AXHUB
-- Ferramenta universal para análise de equipamentos com valores zerados
-- ================================================================
-- INSTRUÇÕES DE USO:
-- 1. Conecte-se ao SQL Server do sistema AxHub
-- 2. Selecione o banco de dados correto (ex: AxHub_Goiania)
-- 3. Altere APENAS a linha @CodigoEquipamento abaixo
-- 4. Execute o script completo (F5)
-- 5. Analise os resultados
-- ================================================================

USE master; -- Altere para o banco correto: AxHub_Goiania, AxHub_IPEMPE, etc.
GO

-- ================================================================
-- ⚠️ CONFIGURE AQUI: Informe o código do equipamento
-- ================================================================
DECLARE @CodigoEquipamento VARCHAR(50) = 'GYN1R801'; -- ⬅️ ALTERE AQUI!
-- ================================================================

PRINT '========================================';
PRINT 'DASHBOARD DE DIAGNÓSTICO - MEDIÇÃO AXHUB';
PRINT 'Equipamento: ' + @CodigoEquipamento;
PRINT 'Banco: ' + DB_NAME();
PRINT 'Data/Hora: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '========================================';
PRINT '';

-- ================================================================
-- QUERY 1: DIAGNÓSTICO COMPLETO COM ANÁLISE AUTOMÁTICA
-- ================================================================
PRINT '--- DIAGNÓSTICO COMPLETO ---';
PRINT '';

SELECT 
    e.CodigoEquipamento AS 'Código Equipamento',
    e.Descricao AS 'Descrição Equipamento',
    CASE WHEN e.Status = 1 THEN '✅ Ativo' ELSE '🔴 Inativo' END AS 'Status Equip.',
    f.NumeroFaixa AS 'Faixa',
    CASE WHEN f.Status = 1 THEN '✅ Ativa' ELSE '🔴 Inativa' END AS 'Status Faixa',
    r.Id AS 'Recurso ID',
    r.ValorPrevisto AS 'Valor Previsto',
    r.Bdi AS 'BDI (%)',
    CONVERT(VARCHAR, r.DataInicio, 103) AS 'Recurso Início',
    CONVERT(VARCHAR, r.DataFim, 103) AS 'Recurso Fim',
    CASE WHEN r.Status = 1 THEN '✅ Ativo' WHEN r.Status = 0 THEN '🔴 Inativo' ELSE 'N/A' END AS 'Status Recurso',
    c.NumeroContrato AS 'Nº Contrato',
    c.Orgao AS 'Órgão',
    CASE WHEN c.Status = 1 THEN '✅ Ativo' WHEN c.Status = 0 THEN '🔴 Inativo' ELSE 'N/A' END AS 'Status Contrato',
    CASE 
        WHEN e.Id IS NULL THEN '🔴 EQUIPAMENTO NÃO EXISTE'
        WHEN e.Status = 0 THEN '🔴 EQUIPAMENTO INATIVO'
        WHEN f.Id IS NULL THEN '🔴 FAIXAS NÃO CADASTRADAS'
        WHEN f.Status = 0 THEN '🔴 FAIXA INATIVA'
        WHEN c.Id IS NULL THEN '🔴 SEM CONTRATO VINCULADO'
        WHEN c.Status = 0 THEN '🔴 CONTRATO INATIVO'
        WHEN c.DataInicio > GETDATE() OR c.DataFim < GETDATE() THEN '🔴 CONTRATO FORA DA VIGÊNCIA'
        WHEN r.Id IS NULL THEN '🔴 RECURSO NÃO CADASTRADO ⚠️'
        WHEN r.ValorPrevisto IS NULL OR r.ValorPrevisto = 0 THEN '🔴 VALOR PREVISTO ZERADO'
        WHEN r.Status = 0 THEN '🔴 RECURSO INATIVO'
        WHEN r.DataInicio > GETDATE() OR r.DataFim < GETDATE() THEN '🔴 RECURSO FORA DA VIGÊNCIA'
        WHEN r.Bdi IS NULL OR r.Bdi = 0 THEN '🟡 BDI ZERADO (verificar se é correto)'
        ELSE '✅ CONFIGURAÇÃO OK - VALORES DEVEM APARECER'
    END AS '🎯 DIAGNÓSTICO COMPLETO'
FROM TBEquipamentos e
LEFT JOIN TBFaixas f ON f.EquipamentoId = e.Id
LEFT JOIN TBRecursos r ON (r.EquipamentoId = e.Id AND r.FaixaId = f.Id)
LEFT JOIN TBContratos c ON r.ContratoId = c.Id
WHERE e.CodigoEquipamento = @CodigoEquipamento
ORDER BY f.NumeroFaixa;

PRINT '';
PRINT '--- INTERPRETAÇÃO ---';
PRINT '🔴 = PROBLEMA CRÍTICO (causa valores R$ 0,00 no relatório)';
PRINT '🟡 = ATENÇÃO (pode impactar cálculo, verificar se é intencional)';
PRINT '✅ = Configuração correta';
PRINT '';

-- ================================================================
-- QUERY 2: ANÁLISE QUANTITATIVA
-- ================================================================
PRINT '--- ANÁLISE QUANTITATIVA ---';
PRINT '';

SELECT 
    e.CodigoEquipamento AS 'Equipamento',
    COUNT(DISTINCT f.Id) AS 'Faixas Cadastradas',
    COUNT(DISTINCT r.Id) AS 'Recursos Cadastrados',
    COUNT(DISTINCT f.Id) - COUNT(DISTINCT r.Id) AS 'Recursos Faltando',
    CASE 
        WHEN COUNT(DISTINCT f.Id) = 0 THEN '🔴 NENHUMA FAIXA CADASTRADA'
        WHEN COUNT(DISTINCT r.Id) = 0 THEN '🔴 NENHUM RECURSO CADASTRADO'
        WHEN COUNT(DISTINCT f.Id) = COUNT(DISTINCT r.Id) THEN '✅ OK: 1 recurso por faixa'
        WHEN COUNT(DISTINCT r.Id) < COUNT(DISTINCT f.Id) THEN '🔴 FALTAM ' + CAST(COUNT(DISTINCT f.Id) - COUNT(DISTINCT r.Id) AS VARCHAR) + ' RECURSO(S)'
        ELSE '🟡 MAIS RECURSOS QUE FAIXAS (verificar duplicatas)'
    END AS '🎯 DIAGNÓSTICO QUANTITATIVO'
FROM TBEquipamentos e
LEFT JOIN TBFaixas f ON f.EquipamentoId = e.Id AND f.Status = 1
LEFT JOIN TBRecursos r ON (r.EquipamentoId = e.Id AND r.FaixaId = f.Id AND r.Status = 1)
WHERE e.CodigoEquipamento = @CodigoEquipamento
GROUP BY e.CodigoEquipamento;

PRINT '';

-- ================================================================
-- QUERY 3: CHECKLIST DE VALIDAÇÃO
-- ================================================================
PRINT '--- CHECKLIST DE VALIDAÇÃO ---';
PRINT '';

DECLARE @EquipamentoExiste BIT = 0;
DECLARE @EquipamentoAtivo BIT = 0;
DECLARE @FaixasCadastradas INT = 0;
DECLARE @FaixasAtivas INT = 0;
DECLARE @ContratoVinculado BIT = 0;
DECLARE @ContratoAtivo BIT = 0;
DECLARE @ContratoVigente BIT = 0;
DECLARE @RecursosCadastrados INT = 0;
DECLARE @RecursosAtivos INT = 0;
DECLARE @RecursosComValor INT = 0;
DECLARE @RecursosVigentes INT = 0;

-- Verificar equipamento
IF EXISTS (SELECT 1 FROM TBEquipamentos WHERE CodigoEquipamento = @CodigoEquipamento)
    SET @EquipamentoExiste = 1;

IF EXISTS (SELECT 1 FROM TBEquipamentos WHERE CodigoEquipamento = @CodigoEquipamento AND Status = 1)
    SET @EquipamentoAtivo = 1;

-- Verificar faixas
SELECT @FaixasCadastradas = COUNT(*) FROM TBFaixas f
JOIN TBEquipamentos e ON f.EquipamentoId = e.Id
WHERE e.CodigoEquipamento = @CodigoEquipamento;

SELECT @FaixasAtivas = COUNT(*) FROM TBFaixas f
JOIN TBEquipamentos e ON f.EquipamentoId = e.Id
WHERE e.CodigoEquipamento = @CodigoEquipamento AND f.Status = 1;

-- Verificar contrato
IF EXISTS (
    SELECT 1 FROM TBRecursos r
    JOIN TBEquipamentos e ON r.EquipamentoId = e.Id
    JOIN TBContratos c ON r.ContratoId = c.Id
    WHERE e.CodigoEquipamento = @CodigoEquipamento
)
    SET @ContratoVinculado = 1;

IF EXISTS (
    SELECT 1 FROM TBRecursos r
    JOIN TBEquipamentos e ON r.EquipamentoId = e.Id
    JOIN TBContratos c ON r.ContratoId = c.Id
    WHERE e.CodigoEquipamento = @CodigoEquipamento AND c.Status = 1
)
    SET @ContratoAtivo = 1;

IF EXISTS (
    SELECT 1 FROM TBRecursos r
    JOIN TBEquipamentos e ON r.EquipamentoId = e.Id
    JOIN TBContratos c ON r.ContratoId = c.Id
    WHERE e.CodigoEquipamento = @CodigoEquipamento 
    AND c.DataInicio <= GETDATE() AND c.DataFim >= GETDATE()
)
    SET @ContratoVigente = 1;

-- Verificar recursos
SELECT @RecursosCadastrados = COUNT(*) FROM TBRecursos r
JOIN TBEquipamentos e ON r.EquipamentoId = e.Id
WHERE e.CodigoEquipamento = @CodigoEquipamento;

SELECT @RecursosAtivos = COUNT(*) FROM TBRecursos r
JOIN TBEquipamentos e ON r.EquipamentoId = e.Id
WHERE e.CodigoEquipamento = @CodigoEquipamento AND r.Status = 1;

SELECT @RecursosComValor = COUNT(*) FROM TBRecursos r
JOIN TBEquipamentos e ON r.EquipamentoId = e.Id
WHERE e.CodigoEquipamento = @CodigoEquipamento 
AND r.ValorPrevisto IS NOT NULL AND r.ValorPrevisto > 0;

SELECT @RecursosVigentes = COUNT(*) FROM TBRecursos r
JOIN TBEquipamentos e ON r.EquipamentoId = e.Id
WHERE e.CodigoEquipamento = @CodigoEquipamento 
AND r.DataInicio <= GETDATE() AND r.DataFim >= GETDATE();

-- Exibir checklist
SELECT 
    'Equipamento existe no banco' AS 'Item de Validação',
    CASE WHEN @EquipamentoExiste = 1 THEN '✅ SIM' ELSE '🔴 NÃO' END AS 'Status',
    'Cadastros → Equipamentos' AS 'Onde Verificar',
    CASE WHEN @EquipamentoExiste = 0 THEN 'Cadastrar equipamento' ELSE 'OK' END AS 'Ação Necessária'
UNION ALL
SELECT 
    'Equipamento está Ativo',
    CASE WHEN @EquipamentoAtivo = 1 THEN '✅ SIM' ELSE '🔴 NÃO' END,
    'Cadastros → Equipamentos → Status',
    CASE WHEN @EquipamentoAtivo = 0 THEN 'Ativar equipamento' ELSE 'OK' END
UNION ALL
SELECT 
    'Possui faixas cadastradas',
    CASE WHEN @FaixasCadastradas > 0 THEN '✅ SIM (' + CAST(@FaixasCadastradas AS VARCHAR) + ')' ELSE '🔴 NÃO' END,
    'Cadastros → Equipamentos → Faixas',
    CASE WHEN @FaixasCadastradas = 0 THEN 'Cadastrar faixas (mínimo 2)' ELSE 'OK' END
UNION ALL
SELECT 
    'Faixas estão Ativas',
    CASE WHEN @FaixasAtivas = @FaixasCadastradas THEN '✅ SIM' WHEN @FaixasAtivas > 0 THEN '🟡 PARCIAL' ELSE '🔴 NÃO' END,
    'Cadastros → Equipamentos → Faixas → Status',
    CASE WHEN @FaixasAtivas < @FaixasCadastradas THEN 'Ativar todas as faixas' ELSE 'OK' END
UNION ALL
SELECT 
    'Contrato vinculado',
    CASE WHEN @ContratoVinculado = 1 THEN '✅ SIM' ELSE '🔴 NÃO' END,
    'Cadastros → Contratos → Equipamentos',
    CASE WHEN @ContratoVinculado = 0 THEN 'Vincular equipamento ao contrato' ELSE 'OK' END
UNION ALL
SELECT 
    'Contrato está Ativo',
    CASE WHEN @ContratoAtivo = 1 THEN '✅ SIM' ELSE '🔴 NÃO' END,
    'Cadastros → Contratos → Status',
    CASE WHEN @ContratoAtivo = 0 THEN 'Ativar contrato' ELSE 'OK' END
UNION ALL
SELECT 
    'Contrato dentro da vigência',
    CASE WHEN @ContratoVigente = 1 THEN '✅ SIM' ELSE '🔴 NÃO' END,
    'Cadastros → Contratos → Datas',
    CASE WHEN @ContratoVigente = 0 THEN 'Ajustar datas do contrato' ELSE 'OK' END
UNION ALL
SELECT 
    '⚠️ RECURSOS cadastrados (CRÍTICO)',
    CASE WHEN @RecursosCadastrados > 0 THEN '✅ SIM (' + CAST(@RecursosCadastrados AS VARCHAR) + ')' ELSE '🔴 NÃO' END,
    'Medição → Recursos',
    CASE WHEN @RecursosCadastrados = 0 THEN '⚠️ CADASTRAR RECURSOS (1 por faixa)' ELSE 'OK' END
UNION ALL
SELECT 
    '⚠️ Recursos estão Ativos (CRÍTICO)',
    CASE WHEN @RecursosAtivos = @RecursosCadastrados THEN '✅ SIM' WHEN @RecursosAtivos > 0 THEN '🟡 PARCIAL' ELSE '🔴 NÃO' END,
    'Medição → Recursos → Status',
    CASE WHEN @RecursosAtivos < @RecursosCadastrados THEN '⚠️ ATIVAR RECURSOS' ELSE 'OK' END
UNION ALL
SELECT 
    '⚠️ Recursos com Valor Previsto (CRÍTICO)',
    CASE WHEN @RecursosComValor = @RecursosCadastrados THEN '✅ SIM' WHEN @RecursosComValor > 0 THEN '🟡 PARCIAL' ELSE '🔴 NÃO' END,
    'Medição → Recursos → Valor Previsto',
    CASE WHEN @RecursosComValor < @RecursosCadastrados THEN '⚠️ PREENCHER VALOR PREVISTO' ELSE 'OK' END
UNION ALL
SELECT 
    '⚠️ Recursos dentro da vigência (CRÍTICO)',
    CASE WHEN @RecursosVigentes = @RecursosCadastrados THEN '✅ SIM' WHEN @RecursosVigentes > 0 THEN '🟡 PARCIAL' ELSE '🔴 NÃO' END,
    'Medição → Recursos → Datas',
    CASE WHEN @RecursosVigentes < @RecursosCadastrados THEN '⚠️ AJUSTAR DATAS DOS RECURSOS' ELSE 'OK' END;

PRINT '';

-- ================================================================
-- QUERY 4: SIMULAÇÃO DE CÁLCULO (se recursos existirem)
-- ================================================================
PRINT '--- SIMULAÇÃO DE CÁLCULO DA MEDIÇÃO ---';
PRINT '';

IF @RecursosCadastrados > 0
BEGIN
    SELECT 
        e.CodigoEquipamento AS 'Equipamento',
        f.NumeroFaixa AS 'Faixa',
        r.ValorPrevisto AS 'Valor Previsto (R$)',
        r.Bdi AS 'BDI (%)',
        (r.ValorPrevisto * (r.Bdi / 100)) AS 'Valor BDI (R$)',
        r.ValorPrevisto + (r.ValorPrevisto * (r.Bdi / 100)) AS 'TOTAL por Faixa (R$)',
        CASE 
            WHEN r.ValorPrevisto IS NULL OR r.ValorPrevisto = 0 THEN '🔴 Aparecerá R$ 0,00 no relatório'
            ELSE '✅ Valores aparecerão no relatório'
        END AS 'Resultado Esperado'
    FROM TBEquipamentos e
    JOIN TBFaixas f ON f.EquipamentoId = e.Id
    JOIN TBRecursos r ON (r.EquipamentoId = e.Id AND r.FaixaId = f.Id)
    WHERE e.CodigoEquipamento = @CodigoEquipamento
    ORDER BY f.NumeroFaixa;

    -- Total do equipamento
    PRINT '';
    PRINT '--- TOTAL DO EQUIPAMENTO ---';
    SELECT 
        @CodigoEquipamento AS 'Equipamento',
        SUM(r.ValorPrevisto) AS 'Total Valor Previsto (R$)',
        SUM(r.ValorPrevisto * (r.Bdi / 100)) AS 'Total BDI (R$)',
        SUM(r.ValorPrevisto + (r.ValorPrevisto * (r.Bdi / 100))) AS 'TOTAL GERAL (R$)'
    FROM TBEquipamentos e
    JOIN TBFaixas f ON f.EquipamentoId = e.Id
    JOIN TBRecursos r ON (r.EquipamentoId = e.Id AND r.FaixaId = f.Id)
    WHERE e.CodigoEquipamento = @CodigoEquipamento;
END
ELSE
BEGIN
    PRINT '⚠️ NÃO É POSSÍVEL SIMULAR: Nenhum recurso cadastrado!';
    PRINT 'Relatório mostrará: R$ 0,00 em todos os campos financeiros.';
END

PRINT '';

-- ================================================================
-- QUERY 5: SOLUÇÃO AUTOMÁTICA (Script de INSERT)
-- ================================================================
IF @RecursosCadastrados = 0 AND @FaixasCadastradas > 0
BEGIN
    PRINT '';
    PRINT '========================================';
    PRINT '⚠️ SOLUÇÃO AUTOMÁTICA DETECTADA';
    PRINT '========================================';
    PRINT '';
    PRINT 'PROBLEMA: Recursos não cadastrados';
    PRINT 'SOLUÇÃO: Execute o script abaixo (ajuste os valores primeiro!)';
    PRINT '';
    PRINT '-- ================================================================';
    PRINT '-- SCRIPT DE CORREÇÃO AUTOMÁTICA';
    PRINT '-- ⚠️ AJUSTE OS VALORES ANTES DE EXECUTAR!';
    PRINT '-- ================================================================';
    PRINT '';
    PRINT 'DECLARE @EquipamentoId INT;';
    PRINT 'DECLARE @ContratoId INT;';
    PRINT 'DECLARE @ValorPrevisto DECIMAL(18,2) = 15000.00; -- ⬅️ AJUSTE AQUI';
    PRINT 'DECLARE @Bdi DECIMAL(5,2) = 25.00; -- ⬅️ AJUSTE AQUI';
    PRINT 'DECLARE @DataInicio DATE = ''2026-01-01''; -- ⬅️ AJUSTE AQUI';
    PRINT 'DECLARE @DataFim DATE = ''2026-12-31''; -- ⬅️ AJUSTE AQUI';
    PRINT '';
    PRINT 'SELECT @EquipamentoId = Id FROM TBEquipamentos WHERE CodigoEquipamento = ''' + @CodigoEquipamento + ''';';
    PRINT 'SET @ContratoId = NULL; -- ⬅️ PREENCHA COM O ID DO CONTRATO!';
    PRINT '';
    PRINT '-- Para descobrir o ID do contrato:';
    PRINT '-- SELECT Id, NumeroContrato, Orgao FROM TBContratos WHERE Status = 1;';
    PRINT '';
    PRINT 'INSERT INTO TBRecursos (EquipamentoId, FaixaId, ContratoId, Descricao, ValorPrevisto, Bdi, DataInicio, DataFim, Status)';
    PRINT 'SELECT ';
    PRINT '    @EquipamentoId,';
    PRINT '    f.Id AS FaixaId,';
    PRINT '    @ContratoId,';
    PRINT '    ''Recurso Medição ' + @CodigoEquipamento + ' - Faixa '' + CAST(f.NumeroFaixa AS VARCHAR),';
    PRINT '    @ValorPrevisto,';
    PRINT '    @Bdi,';
    PRINT '    @DataInicio,';
    PRINT '    @DataFim,';
    PRINT '    1 -- Ativo';
    PRINT 'FROM TBFaixas f';
    PRINT 'WHERE f.EquipamentoId = @EquipamentoId AND f.Status = 1;';
    PRINT '';
    PRINT 'PRINT ''✅ Recursos cadastrados com sucesso!'';';
    PRINT '';
END

-- ================================================================
-- RESUMO FINAL
-- ================================================================
PRINT '';
PRINT '========================================';
PRINT 'RESUMO DO DIAGNÓSTICO';
PRINT '========================================';
PRINT '';

IF @EquipamentoExiste = 0
    PRINT '🔴 PROBLEMA: Equipamento não existe no banco';
ELSE IF @EquipamentoAtivo = 0
    PRINT '🔴 PROBLEMA: Equipamento está inativo';
ELSE IF @FaixasCadastradas = 0
    PRINT '🔴 PROBLEMA: Nenhuma faixa cadastrada';
ELSE IF @FaixasAtivas = 0
    PRINT '🔴 PROBLEMA: Todas as faixas estão inativas';
ELSE IF @ContratoVinculado = 0
    PRINT '🔴 PROBLEMA: Equipamento sem contrato vinculado';
ELSE IF @ContratoAtivo = 0
    PRINT '🔴 PROBLEMA: Contrato está inativo';
ELSE IF @ContratoVigente = 0
    PRINT '🔴 PROBLEMA: Contrato fora da vigência';
ELSE IF @RecursosCadastrados = 0
    PRINT '🔴 PROBLEMA PRINCIPAL: RECURSOS NÃO CADASTRADOS ⚠️';
ELSE IF @RecursosAtivos = 0
    PRINT '🔴 PROBLEMA: Recursos cadastrados mas INATIVOS';
ELSE IF @RecursosComValor = 0
    PRINT '🔴 PROBLEMA: Recursos sem Valor Previsto';
ELSE IF @RecursosVigentes = 0
    PRINT '🔴 PROBLEMA: Recursos fora da vigência';
ELSE IF @RecursosCadastrados < @FaixasCadastradas
    PRINT '🔴 PROBLEMA: Faltam recursos (deveria ter 1 por faixa)';
ELSE
    PRINT '✅ CONFIGURAÇÃO OK - Valores devem aparecer no relatório!';

PRINT '';
PRINT 'Equipamento: ' + @CodigoEquipamento;
PRINT 'Faixas: ' + CAST(@FaixasCadastradas AS VARCHAR) + ' cadastradas, ' + CAST(@FaixasAtivas AS VARCHAR) + ' ativas';
PRINT 'Recursos: ' + CAST(@RecursosCadastrados AS VARCHAR) + ' cadastrados, ' + CAST(@RecursosAtivos AS VARCHAR) + ' ativos';
PRINT '';
PRINT '========================================';
PRINT 'FIM DO DIAGNÓSTICO';
PRINT '========================================';

GO
