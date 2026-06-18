-- ================================================================
-- SCRIPT DE DIAGNÓSTICO: MEDIÇÃO GOIÂNIA - VALORES ZERADOS
-- Equipamento: GYN1R801 vs GYN1R803/804/805
-- Data: 18/06/2026
-- ================================================================
-- INSTRUÇÕES:
-- 1. Conecte-se ao SQL Server de Goiânia
-- 2. Selecione o banco de dados AxHub_Goiania (ou nome equivalente)
-- 3. Execute este script completo
-- 4. Copie TODOS os resultados e cole no arquivo de resposta
-- ================================================================

PRINT '========================================';
PRINT 'DIAGNÓSTICO: MEDIÇÃO GOIÂNIA';
PRINT 'Data: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '========================================';
PRINT '';

-- ================================================================
-- QUERY 1: Verificar se os equipamentos existem
-- ================================================================
PRINT '--- QUERY 1: EQUIPAMENTOS ---';
SELECT 
    Id AS EquipamentoId,
    CodigoEquipamento,
    Descricao,
    GrupoId,
    Status,
    CASE 
        WHEN Status = 1 THEN 'Ativo'
        WHEN Status = 0 THEN 'Inativo'
        ELSE 'Outro'
    END AS StatusDesc
FROM TBEquipamentos
WHERE CodigoEquipamento IN ('GYN1R801', 'GYN1R803', 'GYN1R804', 'GYN1R805')
ORDER BY CodigoEquipamento;

PRINT '';
PRINT '--- INTERPRETAÇÃO ---';
PRINT 'Se algum equipamento não aparecer: Equipamento não existe no banco';
PRINT 'Se Status = 0 (Inativo): Equipamento desativado';
PRINT '';

-- ================================================================
-- QUERY 2: Verificar faixas de cada equipamento
-- ================================================================
PRINT '--- QUERY 2: FAIXAS DOS EQUIPAMENTOS ---';
SELECT 
    e.CodigoEquipamento,
    f.Id AS FaixaId,
    f.NumeroFaixa,
    f.EquipamentoId,
    f.Status,
    CASE 
        WHEN f.Status = 1 THEN 'Ativa'
        WHEN f.Status = 0 THEN 'Inativa'
        ELSE 'Outro'
    END AS StatusDesc
FROM TBEquipamentos e
INNER JOIN TBFaixas f ON f.EquipamentoId = e.Id
WHERE e.CodigoEquipamento IN ('GYN1R801', 'GYN1R803', 'GYN1R804', 'GYN1R805')
ORDER BY e.CodigoEquipamento, f.NumeroFaixa;

PRINT '';
PRINT '--- INTERPRETAÇÃO ---';
PRINT 'Cada equipamento deve ter 2 faixas (Faixa 1 e Faixa 2)';
PRINT 'Se faixas não aparecerem: Faixas não cadastradas';
PRINT '';

-- ================================================================
-- QUERY 3: CHAVE DO DIAGNÓSTICO - Verificar RECURSOS
-- ================================================================
PRINT '--- QUERY 3: RECURSOS (CHAVE DO PROBLEMA) ---';
SELECT 
    e.CodigoEquipamento,
    f.NumeroFaixa,
    r.Id AS RecursoId,
    r.Descricao AS RecursoDescricao,
    r.ValorPrevisto,
    r.Bdi,
    r.DataInicio,
    r.DataFim,
    r.Status,
    CASE 
        WHEN r.Status = 1 THEN 'Ativo'
        WHEN r.Status = 0 THEN 'Inativo'
        WHEN r.Status IS NULL THEN 'RECURSO NÃO EXISTE'
        ELSE 'Outro'
    END AS StatusDesc,
    c.Id AS ContratoId,
    c.NumeroContrato,
    c.Orgao
FROM TBEquipamentos e
INNER JOIN TBFaixas f ON f.EquipamentoId = e.Id
LEFT JOIN TBRecursos r ON (r.EquipamentoId = e.Id AND r.FaixaId = f.Id)
LEFT JOIN TBContratos c ON r.ContratoId = c.Id
WHERE e.CodigoEquipamento IN ('GYN1R801', 'GYN1R803', 'GYN1R804', 'GYN1R805')
ORDER BY e.CodigoEquipamento, f.NumeroFaixa;

PRINT '';
PRINT '--- INTERPRETAÇÃO CRÍTICA ---';
PRINT '🔴 Se RecursoId = NULL para GYN1R801: RECURSO NÃO CADASTRADO (CAUSA RAIZ)';
PRINT '🔴 Se ValorPrevisto = 0 ou NULL: Valor não configurado';
PRINT '🔴 Se Bdi = 0 ou NULL: BDI não configurado';
PRINT '🔴 Se Status = 0: Recurso inativo';
PRINT '🔴 Se ContratoId = NULL: Recurso não vinculado a contrato';
PRINT '✅ Compare GYN1R801 com GYN1R803/804/805';
PRINT '';

-- ================================================================
-- QUERY 4: Resumo comparativo - Contagem de recursos
-- ================================================================
PRINT '--- QUERY 4: RESUMO COMPARATIVO ---';
SELECT 
    e.CodigoEquipamento,
    COUNT(DISTINCT f.Id) AS QtdFaixasCadastradas,
    COUNT(DISTINCT r.Id) AS QtdRecursosCadastrados,
    COUNT(DISTINCT CASE WHEN r.Status = 1 THEN r.Id END) AS QtdRecursosAtivos,
    SUM(CASE WHEN r.ValorPrevisto > 0 THEN 1 ELSE 0 END) AS QtdRecursosComValor,
    AVG(r.ValorPrevisto) AS ValorPrevistoMedio,
    AVG(r.Bdi) AS BdiMedio
FROM TBEquipamentos e
LEFT JOIN TBFaixas f ON f.EquipamentoId = e.Id
LEFT JOIN TBRecursos r ON r.EquipamentoId = e.Id
WHERE e.CodigoEquipamento IN ('GYN1R801', 'GYN1R803', 'GYN1R804', 'GYN1R805')
GROUP BY e.CodigoEquipamento
ORDER BY e.CodigoEquipamento;

PRINT '';
PRINT '--- INTERPRETAÇÃO ---';
PRINT 'GYN1R801 deve ter valores similares aos outros equipamentos';
PRINT 'Se QtdRecursosCadastrados = 0: Nenhum recurso cadastrado (PROBLEMA)';
PRINT 'Se QtdRecursosComValor = 0: Recursos existem mas sem valor configurado';
PRINT '';

-- ================================================================
-- QUERY 5: Verificar contratos ativos
-- ================================================================
PRINT '--- QUERY 5: CONTRATOS ATIVOS ---';
SELECT 
    c.Id AS ContratoId,
    c.NumeroContrato,
    c.Orgao,
    c.VigenciaInicio,
    c.VigenciaFim,
    c.Status,
    CASE 
        WHEN c.Status = 1 THEN 'Ativo'
        WHEN c.Status = 0 THEN 'Inativo'
        ELSE 'Outro'
    END AS StatusDesc,
    CASE 
        WHEN GETDATE() BETWEEN c.VigenciaInicio AND c.VigenciaFim THEN 'Vigente'
        WHEN GETDATE() < c.VigenciaInicio THEN 'Futuro'
        WHEN GETDATE() > c.VigenciaFim THEN 'Expirado'
        ELSE 'Indefinido'
    END AS VigenciaStatus
FROM TBContratos c
WHERE c.Orgao LIKE '%Goiânia%' OR c.Orgao LIKE '%SMT%' OR c.Orgao LIKE '%Goi%'
ORDER BY c.Id DESC;

PRINT '';

-- ================================================================
-- QUERY 6: Verificar vinculação equipamento x contrato
-- ================================================================
PRINT '--- QUERY 6: VINCULAÇÃO EQUIPAMENTO x CONTRATO ---';
SELECT 
    e.CodigoEquipamento,
    ce.ContratoId,
    c.NumeroContrato,
    c.Orgao,
    c.Status AS ContratoStatus,
    CASE 
        WHEN c.Status = 1 THEN 'Ativo'
        WHEN c.Status = 0 THEN 'Inativo'
        ELSE 'Outro'
    END AS StatusDesc
FROM TBEquipamentos e
LEFT JOIN TBContratosEquipamentos ce ON ce.EquipamentoId = e.Id
LEFT JOIN TBContratos c ON c.Id = ce.ContratoId
WHERE e.CodigoEquipamento IN ('GYN1R801', 'GYN1R803', 'GYN1R804', 'GYN1R805')
ORDER BY e.CodigoEquipamento;

PRINT '';
PRINT '--- INTERPRETAÇÃO ---';
PRINT 'Se ContratoId = NULL: Equipamento NÃO vinculado a contrato';
PRINT 'Todos os 4 equipamentos devem estar vinculados ao mesmo contrato';
PRINT '';

-- ================================================================
-- QUERY 7: Verificar passagens em Maio/2026 (dados operacionais)
-- ================================================================
PRINT '--- QUERY 7: PASSAGENS MAIO/2026 (VALIDAÇÃO OPERACIONAL) ---';
SELECT 
    e.CodigoEquipamento,
    f.NumeroFaixa,
    COUNT(*) AS TotalPassagens,
    MIN(p.DataHora) AS PrimeiraPassagem,
    MAX(p.DataHora) AS UltimaPassagem,
    COUNT(DISTINCT CAST(p.DataHora AS DATE)) AS DiasComPassagens
FROM TBEquipamentos e
INNER JOIN TBFaixas f ON f.EquipamentoId = e.Id
INNER JOIN TBPassagens p ON p.FaixaId = f.Id
WHERE e.CodigoEquipamento IN ('GYN1R801', 'GYN1R803', 'GYN1R804', 'GYN1R805')
  AND p.DataHora >= '2026-05-01 00:00:00'
  AND p.DataHora < '2026-06-01 00:00:00'
GROUP BY e.CodigoEquipamento, f.NumeroFaixa
ORDER BY e.CodigoEquipamento, f.NumeroFaixa;

PRINT '';
PRINT '--- INTERPRETAÇÃO ---';
PRINT 'Confirma que GYN1R801 está capturando passagens (dados operacionais OK)';
PRINT 'O problema é apenas nos valores financeiros, não na operação';
PRINT '';

-- ================================================================
-- QUERY 8: Detalhamento completo de recursos do GYN1R803 (referência)
-- ================================================================
PRINT '--- QUERY 8: CONFIGURAÇÃO DE REFERÊNCIA (GYN1R803) ---';
SELECT 
    'GYN1R803 - CONFIGURAÇÃO CORRETA' AS Observacao,
    e.CodigoEquipamento,
    f.NumeroFaixa,
    r.Id AS RecursoId,
    r.Descricao,
    r.Tipo,
    r.ValorPrevisto,
    r.Bdi,
    r.DataInicio,
    r.DataFim,
    r.Status,
    r.ContratoId,
    c.NumeroContrato
FROM TBEquipamentos e
INNER JOIN TBFaixas f ON f.EquipamentoId = e.Id
INNER JOIN TBRecursos r ON r.EquipamentoId = e.Id AND r.FaixaId = f.Id
LEFT JOIN TBContratos c ON c.Id = r.ContratoId
WHERE e.CodigoEquipamento = 'GYN1R803'
ORDER BY f.NumeroFaixa;

PRINT '';
PRINT '--- AÇÃO NECESSÁRIA ---';
PRINT 'Use estes valores como REFERÊNCIA para cadastrar recursos do GYN1R801';
PRINT 'Copie os valores de ValorPrevisto e Bdi do GYN1R803';
PRINT '';

-- ================================================================
-- QUERY 9: Detalhamento completo de recursos do GYN1R801 (problema)
-- ================================================================
PRINT '--- QUERY 9: CONFIGURAÇÃO ATUAL GYN1R801 (PROBLEMÁTICA) ---';
SELECT 
    'GYN1R801 - CONFIGURAÇÃO ATUAL' AS Observacao,
    e.CodigoEquipamento,
    f.NumeroFaixa,
    r.Id AS RecursoId,
    r.Descricao,
    r.Tipo,
    r.ValorPrevisto,
    r.Bdi,
    r.DataInicio,
    r.DataFim,
    r.Status,
    r.ContratoId,
    c.NumeroContrato,
    CASE 
        WHEN r.Id IS NULL THEN '🔴 RECURSO NÃO EXISTE - CADASTRAR'
        WHEN r.ValorPrevisto IS NULL OR r.ValorPrevisto = 0 THEN '🔴 VALOR PREVISTO ZERADO - CORRIGIR'
        WHEN r.Bdi IS NULL OR r.Bdi = 0 THEN '🔴 BDI ZERADO - CORRIGIR'
        WHEN r.Status = 0 THEN '🔴 RECURSO INATIVO - ATIVAR'
        WHEN r.ContratoId IS NULL THEN '🔴 SEM CONTRATO VINCULADO - VINCULAR'
        ELSE '✅ OK'
    END AS DiagnosticoProblema
FROM TBEquipamentos e
INNER JOIN TBFaixas f ON f.EquipamentoId = e.Id
LEFT JOIN TBRecursos r ON r.EquipamentoId = e.Id AND r.FaixaId = f.Id
LEFT JOIN TBContratos c ON c.Id = r.ContratoId
WHERE e.CodigoEquipamento = 'GYN1R801'
ORDER BY f.NumeroFaixa;

PRINT '';
PRINT '========================================';
PRINT 'FIM DO DIAGNÓSTICO';
PRINT '========================================';
PRINT '';
PRINT '🎯 PRÓXIMO PASSO:';
PRINT '   1. Analise a coluna "DiagnosticoProblema" na Query 9';
PRINT '   2. Use os valores da Query 8 (GYN1R803) como referência';
PRINT '   3. Execute o script de CORREÇÃO se necessário';
PRINT '';

-- ================================================================
-- VERIFICAÇÃO DE TABELAS (caso Query 3 falhe)
-- ================================================================
PRINT '--- VERIFICAÇÃO: ESTRUTURA DE TABELAS ---';
IF OBJECT_ID('TBRecursos', 'U') IS NULL
BEGIN
    PRINT '❌ ERRO: Tabela TBRecursos não existe no banco!';
    PRINT '   Verifique se o banco de dados está correto.';
END
ELSE
BEGIN
    PRINT '✅ Tabela TBRecursos existe';
    
    -- Verificar se a tabela tem registros
    DECLARE @TotalRecursos INT;
    SELECT @TotalRecursos = COUNT(*) FROM TBRecursos;
    PRINT '   Total de recursos no banco: ' + CAST(@TotalRecursos AS VARCHAR);
    
    IF @TotalRecursos = 0
    BEGIN
        PRINT '⚠️ ATENÇÃO: Tabela TBRecursos está vazia!';
        PRINT '   Nenhum equipamento possui recursos cadastrados.';
    END
END
PRINT '';

-- ================================================================
-- FIM DO SCRIPT
-- ================================================================
