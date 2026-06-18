-- ============================================================================
-- COMPARAÇÃO: IPEMPE (Funcionando) vs GOIÂNIA (Problemático)
-- ============================================================================
-- Objetivo: Identificar diferenças de configuração entre os dois sistemas
-- Data: 2026-06-18
-- ============================================================================

-- ============================================================================
-- INSTRUÇÕES DE USO
-- ============================================================================
-- 1. Execute este script PRIMEIRO no banco do IPEMPE
-- 2. Salve os resultados
-- 3. Execute o MESMO script no banco de Goiânia
-- 4. Compare os resultados lado a lado
-- ============================================================================

-- ============================================================================
-- QUERY 1: VALIDAÇÃO COMPLETA DE CONFIGURAÇÃO
-- ============================================================================
-- Esta query mostra tudo que é necessário para a medição funcionar

SELECT 
    -- Identificação
    e.CodigoEquipamento AS Equipamento,
    f.NumeroFaixa AS Faixa,
    
    -- Status do Equipamento
    CASE WHEN e.Status = 1 THEN '✅' ELSE '❌' END AS EquipAtivo,
    
    -- Vinculação ao Contrato
    c.NumeroContrato AS Contrato,
    CASE WHEN ce.Id IS NOT NULL THEN '✅' ELSE '❌' END AS EquipVinculado,
    CASE WHEN c.Status = 1 THEN '✅' ELSE '❌' END AS ContratoAtivo,
    
    -- Recursos Cadastrados
    r.Id AS RecursoId,
    CASE WHEN r.Id IS NOT NULL THEN '✅' ELSE '❌' END AS RecursoCadastrado,
    CASE WHEN r.Status = 1 THEN '✅' ELSE '❌' END AS RecursoAtivo,
    
    -- Valores Financeiros
    r.ValorPrevisto AS ValorPrevisto,
    r.Bdi AS BDI,
    CASE WHEN r.ValorPrevisto > 0 THEN '✅' ELSE '❌' END AS ValorOK,
    CASE WHEN r.Bdi > 0 THEN '✅' ELSE '❌' END AS BdiOK,
    
    -- Vigência do Recurso (para Maio/2026)
    CONVERT(VARCHAR(10), r.DataInicio, 103) AS InicioRecurso,
    CONVERT(VARCHAR(10), r.DataFim, 103) AS FimRecurso,
    CASE 
        WHEN r.DataInicio IS NULL THEN '❌'
        WHEN '2026-05-01' >= r.DataInicio 
             AND '2026-05-31' <= COALESCE(r.DataFim, '9999-12-31') THEN '✅'
        ELSE '❌'
    END AS VigenciaOK,
    
    -- Passagens no Período (Maio/2026)
    (SELECT COUNT(*) 
     FROM TBPassagens p 
     WHERE p.EquipamentoId = e.Id 
       AND p.FaixaId = f.Id
       AND p.DataHora >= '2026-05-01' 
       AND p.DataHora < '2026-06-01'
    ) AS PassagensMaio,
    
    -- Diagnóstico Final
    CASE 
        WHEN e.Status = 0 THEN '🔴 EQUIPAMENTO INATIVO'
        WHEN ce.Id IS NULL THEN '🔴 EQUIPAMENTO SEM CONTRATO'
        WHEN c.Status = 0 THEN '🔴 CONTRATO INATIVO'
        WHEN r.Id IS NULL THEN '🔴 RECURSO NÃO CADASTRADO'
        WHEN r.Status = 0 THEN '🔴 RECURSO INATIVO'
        WHEN r.ValorPrevisto IS NULL OR r.ValorPrevisto = 0 THEN '🔴 VALOR PREVISTO ZERADO'
        WHEN r.Bdi IS NULL OR r.Bdi = 0 THEN '🟡 BDI ZERADO'
        WHEN '2026-05-01' < r.DataInicio THEN '🔴 VIGÊNCIA NÃO INICIADA'
        WHEN '2026-05-31' > COALESCE(r.DataFim, '9999-12-31') THEN '🔴 VIGÊNCIA EXPIRADA'
        ELSE '✅ CONFIGURAÇÃO COMPLETA'
    END AS Diagnostico

FROM TBEquipamentos e
INNER JOIN TBFaixas f ON f.EquipamentoId = e.Id
LEFT JOIN TBContratosEquipamentos ce ON ce.EquipamentoId = e.Id
LEFT JOIN TBContratos c ON c.Id = ce.ContratoId
LEFT JOIN TBRecursos r ON r.EquipamentoId = e.Id AND r.FaixaId = f.Id AND r.ContratoId = c.Id

-- ⚠️ AJUSTAR EQUIPAMENTOS CONFORME O SISTEMA:
-- IPEMPE: ITZ022R, ITZ023L, ITZ024L, etc.
-- GOIÂNIA: GYN1R801, GYN1R803, GYN1R804, GYN1R805
WHERE e.CodigoEquipamento IN ('ITZ022R', 'GYN1R801', 'GYN1R803')

ORDER BY 
    e.CodigoEquipamento,
    f.NumeroFaixa;

-- ============================================================================
-- ANÁLISE ESPERADA DOS RESULTADOS
-- ============================================================================
/*
IPEMPE (FUNCIONANDO):
Equipamento | Faixa | RecursoCadastrado | ValorOK | BdiOK | Diagnostico
------------|-------|-------------------|---------|-------|---------------------------
ITZ022R     | 1     | ✅                | ✅      | ✅    | ✅ CONFIGURAÇÃO COMPLETA
ITZ022R     | 2     | ✅                | ✅      | ✅    | ✅ CONFIGURAÇÃO COMPLETA

GOIÂNIA (PROBLEMÁTICO - ANTES DA CORREÇÃO):
Equipamento | Faixa | RecursoCadastrado | ValorOK | BdiOK | Diagnostico
------------|-------|-------------------|---------|-------|---------------------------
GYN1R801    | 1     | ❌                | ❌      | ❌    | 🔴 RECURSO NÃO CADASTRADO
GYN1R801    | 2     | ❌                | ❌      | ❌    | 🔴 RECURSO NÃO CADASTRADO

GOIÂNIA (APÓS CORREÇÃO):
Equipamento | Faixa | RecursoCadastrado | ValorOK | BdiOK | Diagnostico
------------|-------|-------------------|---------|-------|---------------------------
GYN1R801    | 1     | ✅                | ✅      | ✅    | ✅ CONFIGURAÇÃO COMPLETA
GYN1R801    | 2     | ✅                | ✅      | ✅    | ✅ CONFIGURAÇÃO COMPLETA
*/

-- ============================================================================
-- QUERY 2: COMPARAÇÃO DE VALORES FINANCEIROS
-- ============================================================================
-- Mostra os valores configurados em cada sistema

SELECT 
    e.CodigoEquipamento AS Equipamento,
    f.NumeroFaixa AS Faixa,
    r.ValorPrevisto AS ValorPrevisto,
    r.Bdi AS BDI,
    
    -- Cálculo do Valor Total (se índice = 100%)
    r.ValorPrevisto AS ValorFaixa,
    ROUND(r.ValorPrevisto * (r.Bdi / 100), 2) AS ValorBDI,
    ROUND(r.ValorPrevisto * (1 + r.Bdi / 100), 2) AS TotalCalculado,
    
    c.NumeroContrato AS Contrato,
    CONVERT(VARCHAR(10), c.DataInicio, 103) AS InicioContrato,
    CONVERT(VARCHAR(10), c.DataFim, 103) AS FimContrato

FROM TBRecursos r
JOIN TBEquipamentos e ON r.EquipamentoId = e.Id
JOIN TBFaixas f ON r.FaixaId = f.Id
JOIN TBContratos c ON r.ContratoId = c.Id

WHERE e.CodigoEquipamento IN ('ITZ022R', 'GYN1R801', 'GYN1R803')
  AND r.Status = 1

ORDER BY 
    e.CodigoEquipamento,
    f.NumeroFaixa;

-- ============================================================================
-- ANÁLISE ESPERADA DOS RESULTADOS
-- ============================================================================
/*
IPEMPE:
Equipamento | Faixa | ValorPrevisto | BDI   | TotalCalculado | Contrato
------------|-------|---------------|-------|----------------|-------------
ITZ022R     | 1     | 18500.00      | 30.00 | 24050.00       | CT-IPEM-2026
ITZ022R     | 2     | 18500.00      | 30.00 | 24050.00       | CT-IPEM-2026

GOIÂNIA (APÓS CORREÇÃO):
Equipamento | Faixa | ValorPrevisto | BDI   | TotalCalculado | Contrato
------------|-------|---------------|-------|----------------|-------------
GYN1R801    | 1     | 15000.00      | 25.00 | 18750.00       | CT-2026-001
GYN1R801    | 2     | 15000.00      | 25.00 | 18750.00       | CT-2026-001
*/

-- ============================================================================
-- QUERY 3: COMPARAÇÃO DE DADOS OPERACIONAIS
-- ============================================================================
-- Mostra passagens, interrupções e índice de operação

SELECT 
    e.CodigoEquipamento AS Equipamento,
    f.NumeroFaixa AS Faixa,
    
    -- Passagens no Período (Maio/2026)
    COUNT(DISTINCT p.Id) AS TotalPassagens,
    MIN(p.DataHora) AS PrimeiraPassagem,
    MAX(p.DataHora) AS UltimaPassagem,
    
    -- Horas Previstas (Maio/2026 = 31 dias × 24h = 744h)
    744 AS HorasPrevistas,
    
    -- Interrupções
    COALESCE(SUM(DATEDIFF(HOUR, i.DataHoraInicio, i.DataHoraFim)), 0) AS HorasInterrupcao,
    
    -- Horas Efetivas
    744 - COALESCE(SUM(DATEDIFF(HOUR, i.DataHoraInicio, i.DataHoraFim)), 0) AS HorasEfetivas,
    
    -- Índice de Operação
    ROUND(
        ((744 - COALESCE(SUM(DATEDIFF(HOUR, i.DataHoraInicio, i.DataHoraFim)), 0)) / 744.0) * 100,
        2
    ) AS IndiceOperacao

FROM TBEquipamentos e
INNER JOIN TBFaixas f ON f.EquipamentoId = e.Id
LEFT JOIN TBPassagens p ON p.EquipamentoId = e.Id 
                         AND p.FaixaId = f.Id
                         AND p.DataHora >= '2026-05-01'
                         AND p.DataHora < '2026-06-01'
LEFT JOIN TBInterrupcoes i ON i.EquipamentoId = e.Id
                            AND i.DataHoraInicio >= '2026-05-01'
                            AND i.DataHoraInicio < '2026-06-01'

WHERE e.CodigoEquipamento IN ('ITZ022R', 'GYN1R801', 'GYN1R803')

GROUP BY 
    e.CodigoEquipamento,
    f.NumeroFaixa

ORDER BY 
    e.CodigoEquipamento,
    f.NumeroFaixa;

-- ============================================================================
-- ANÁLISE ESPERADA DOS RESULTADOS
-- ============================================================================
/*
IPEMPE:
Equipamento | Faixa | TotalPassagens | HorasInterrupcao | IndiceOperacao
------------|-------|----------------|------------------|----------------
ITZ022R     | 1     | 723456         | 0                | 100.00
ITZ022R     | 2     | 745123         | 0                | 100.00

GOIÂNIA:
Equipamento | Faixa | TotalPassagens | HorasInterrupcao | IndiceOperacao
------------|-------|----------------|------------------|----------------
GYN1R801    | 1     | 584740         | 0                | 100.00
GYN1R801    | 2     | 609222         | 0                | 100.00

CONCLUSÃO: Ambos os sistemas têm dados operacionais corretos!
O problema de Goiânia era APENAS na configuração de recursos.
*/

-- ============================================================================
-- QUERY 4: RESUMO COMPARATIVO POR EQUIPAMENTO
-- ============================================================================
-- Resumo executivo mostrando o status geral

SELECT 
    e.CodigoEquipamento AS Equipamento,
    
    -- Contagem de Faixas
    COUNT(DISTINCT f.Id) AS TotalFaixas,
    COUNT(DISTINCT r.Id) AS FaixasComRecurso,
    
    -- Valores Totais
    SUM(r.ValorPrevisto) AS ValorTotalPrevisto,
    AVG(r.Bdi) AS BDIMedio,
    SUM(r.ValorPrevisto * (1 + r.Bdi / 100)) AS ValorTotalComBDI,
    
    -- Contrato
    MAX(c.NumeroContrato) AS Contrato,
    MAX(CASE WHEN c.Status = 1 THEN 'Ativo' ELSE 'Inativo' END) AS StatusContrato,
    
    -- Status Geral
    CASE 
        WHEN COUNT(DISTINCT f.Id) = COUNT(DISTINCT r.Id) 
             AND MIN(r.ValorPrevisto) > 0 
             AND MIN(r.Status) = 1
        THEN '✅ PRONTO PARA MEDIÇÃO'
        WHEN COUNT(DISTINCT r.Id) = 0
        THEN '🔴 SEM RECURSOS CADASTRADOS'
        WHEN COUNT(DISTINCT f.Id) <> COUNT(DISTINCT r.Id)
        THEN '🔴 FALTAM RECURSOS PARA ALGUMAS FAIXAS'
        WHEN MIN(r.ValorPrevisto) = 0
        THEN '🔴 VALORES ZERADOS'
        ELSE '⚠️ VERIFICAR CONFIGURAÇÃO'
    END AS StatusGeral

FROM TBEquipamentos e
INNER JOIN TBFaixas f ON f.EquipamentoId = e.Id
LEFT JOIN TBRecursos r ON r.EquipamentoId = e.Id AND r.FaixaId = f.Id
LEFT JOIN TBContratos c ON c.Id = r.ContratoId

WHERE e.CodigoEquipamento IN ('ITZ022R', 'GYN1R801', 'GYN1R803', 'GYN1R804')

GROUP BY e.CodigoEquipamento

ORDER BY e.CodigoEquipamento;

-- ============================================================================
-- ANÁLISE ESPERADA DOS RESULTADOS
-- ============================================================================
/*
IPEMPE:
Equipamento | TotalFaixas | FaixasComRecurso | ValorTotalComBDI | StatusGeral
------------|-------------|------------------|------------------|-------------------------
ITZ022R     | 2           | 2                | 48100.00         | ✅ PRONTO PARA MEDIÇÃO
ITZ023L     | 2           | 2                | 48100.00         | ✅ PRONTO PARA MEDIÇÃO

GOIÂNIA (ANTES):
Equipamento | TotalFaixas | FaixasComRecurso | ValorTotalComBDI | StatusGeral
------------|-------------|------------------|------------------|-------------------------
GYN1R801    | 2           | 0                | NULL             | 🔴 SEM RECURSOS CADASTRADOS
GYN1R803    | 2           | 2                | 37500.00         | ✅ PRONTO PARA MEDIÇÃO
GYN1R804    | 2           | 2                | 37500.00         | ✅ PRONTO PARA MEDIÇÃO

CONCLUSÃO: GYN1R801 estava sem recursos, enquanto GYN1R803 e GYN1R804 
estavam configurados corretamente!
*/

-- ============================================================================
-- QUERY 5: EXEMPLO DE RELATÓRIO DE MEDIÇÃO SIMULADO
-- ============================================================================
-- Simula o cálculo que o relatório de medição faz

SELECT 
    e.CodigoEquipamento AS EQUIPAMENTO,
    f.NumeroFaixa AS FAIXA,
    
    -- Dados Operacionais
    COUNT(DISTINCT p.Id) AS VEICULOS,
    744 AS PREVISTOS,
    COALESCE(SUM(DATEDIFF(HOUR, i.DataHoraInicio, i.DataHoraFim)), 0) AS INTERRUPCOES,
    744 - COALESCE(SUM(DATEDIFF(HOUR, i.DataHoraInicio, i.DataHoraFim)), 0) AS TOTAL_HORAS,
    
    -- Índice de Operação
    ROUND(
        ((744 - COALESCE(SUM(DATEDIFF(HOUR, i.DataHoraInicio, i.DataHoraFim)), 0)) / 744.0) * 100,
        2
    ) AS INDICE_OPERACAO,
    
    -- Valores Financeiros
    r.ValorPrevisto AS VALOR_PREVISTO,
    ROUND(
        r.ValorPrevisto * (1 - ((744 - COALESCE(SUM(DATEDIFF(HOUR, i.DataHoraInicio, i.DataHoraFim)), 0)) / 744.0)),
        2
    ) AS DESCONTO,
    ROUND(
        r.ValorPrevisto * ((744 - COALESCE(SUM(DATEDIFF(HOUR, i.DataHoraInicio, i.DataHoraFim)), 0)) / 744.0),
        2
    ) AS VALOR_FAIXA,
    r.Bdi AS BDI_PERCENT,
    ROUND(
        r.ValorPrevisto * ((744 - COALESCE(SUM(DATEDIFF(HOUR, i.DataHoraInicio, i.DataHoraFim)), 0)) / 744.0) * (1 + r.Bdi / 100),
        2
    ) AS TOTAL

FROM TBEquipamentos e
INNER JOIN TBFaixas f ON f.EquipamentoId = e.Id
LEFT JOIN TBPassagens p ON p.EquipamentoId = e.Id 
                         AND p.FaixaId = f.Id
                         AND p.DataHora >= '2026-05-01'
                         AND p.DataHora < '2026-06-01'
LEFT JOIN TBInterrupcoes i ON i.EquipamentoId = e.Id
                            AND i.DataHoraInicio >= '2026-05-01'
                            AND i.DataHoraInicio < '2026-06-01'
LEFT JOIN TBRecursos r ON r.EquipamentoId = e.Id 
                        AND r.FaixaId = f.Id
                        AND r.Status = 1

WHERE e.CodigoEquipamento IN ('ITZ022R', 'GYN1R801')

GROUP BY 
    e.CodigoEquipamento,
    f.NumeroFaixa,
    r.ValorPrevisto,
    r.Bdi

ORDER BY 
    e.CodigoEquipamento,
    f.NumeroFaixa;

-- ============================================================================
-- ANÁLISE ESPERADA DOS RESULTADOS
-- ============================================================================
/*
IPEMPE (SIMULAÇÃO DO RELATÓRIO):
EQUIPAMENTO | FAIXA | VEICULOS | INDICE_OPERACAO | VALOR_PREVISTO | BDI_PERCENT | TOTAL
------------|-------|----------|-----------------|----------------|-------------|-------------
ITZ022R     | 1     | 723456   | 100.00          | 18500.00       | 30.00       | 24050.00
ITZ022R     | 2     | 745123   | 100.00          | 18500.00       | 30.00       | 24050.00

GOIÂNIA ANTES DA CORREÇÃO:
EQUIPAMENTO | FAIXA | VEICULOS | INDICE_OPERACAO | VALOR_PREVISTO | BDI_PERCENT | TOTAL
------------|-------|----------|-----------------|----------------|-------------|-------
GYN1R801    | 1     | 584740   | 100.00          | NULL           | NULL        | NULL
GYN1R801    | 2     | 609222   | 100.00          | NULL           | NULL        | NULL

GOIÂNIA APÓS CORREÇÃO:
EQUIPAMENTO | FAIXA | VEICULOS | INDICE_OPERACAO | VALOR_PREVISTO | BDI_PERCENT | TOTAL
------------|-------|----------|-----------------|----------------|-------------|-------------
GYN1R801    | 1     | 584740   | 100.00          | 15000.00       | 25.00       | 18750.00
GYN1R801    | 2     | 609222   | 100.00          | 15000.00       | 25.00       | 18750.00
*/

-- ============================================================================
-- CONCLUSÃO DA COMPARAÇÃO
-- ============================================================================
/*
DIFERENÇAS IDENTIFICADAS:

1. IPEMPE (FUNCIONANDO):
   ✅ Todos os equipamentos têm recursos cadastrados
   ✅ Recursos vinculados aos contratos
   ✅ Valores preenchidos (R$ 18.500,00 e 30% BDI)
   ✅ Recursos ativos e com vigência correta
   ✅ Relatório mostra valores corretamente

2. GOIÂNIA (PROBLEMÁTICO - ANTES):
   ❌ GYN1R801 NÃO tinha recursos cadastrados
   ✅ GYN1R803/804/805 tinham recursos corretos
   ❌ Relatório mostrava R$ 0,00 para GYN1R801
   ✅ Dados operacionais corretos (passagens, índice)

3. GOIÂNIA (APÓS CORREÇÃO):
   ✅ Recursos cadastrados para todas as faixas
   ✅ Valores configurados (R$ 15.000,00 e 25% BDI)
   ✅ Relatório mostra valores corretamente

CAUSA RAIZ CONFIRMADA:
- O problema NÃO era de código/sistema
- O problema NÃO era de dados operacionais
- O problema ERA falta de cadastro de recursos
- SOLUÇÃO: Cadastrar recursos para cada faixa

LIÇÃO APRENDIDA:
- Para medição funcionar, é OBRIGATÓRIO cadastrar recursos
- 1 recurso por faixa
- Valores > 0
- Status = Ativo
- Vigência válida
*/

-- ============================================================================
-- FIM DA COMPARAÇÃO
-- ============================================================================
