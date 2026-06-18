# 🔍 ANÁLISE: Regras vs Sistema Real - O Que Está Errado

**Data:** 18/06/2026  
**Equipamento:** GYN1R801  
**Problema:** Valores zerados no relatório de medição  

---

## 📋 Regras Documentadas para Cálculo de Medição

### Regra 1: Estrutura Básica Necessária

**O QUE A DOCUMENTAÇÃO DIZ:**
```
Para um equipamento aparecer no relatório de medição com valores calculados:
1. Equipamento deve existir em TBEquipamentos (Status = Ativo)
2. Equipamento deve ter faixas cadastradas em TBFaixas
3. Equipamento deve estar vinculado a um contrato ativo
4. ✅ REGRA CRÍTICA: Equipamento deve ter RECURSOS cadastrados em TBRecursos
```

**O QUE VERIFICAR NO SISTEMA:**
```sql
-- Verifique se GYN1R801 tem recursos
SELECT * FROM TBRecursos r
JOIN TBEquipamentos e ON r.EquipamentoId = e.Id
WHERE e.CodigoEquipamento = 'GYN1R801'
```

**❌ SE RETORNAR 0 LINHAS:** Esta é a causa raiz - recursos não cadastrados

---

### Regra 2: Campos Obrigatórios do Recurso

**O QUE A DOCUMENTAÇÃO DIZ:**
```
Cada recurso (TBRecursos) DEVE ter:
- EquipamentoId: vinculado ao equipamento
- FaixaId: vinculado a uma faixa específica (1 ou 2)
- ContratoId: vinculado ao contrato ativo
- ValorPrevisto: valor mensal (decimal > 0)
- Bdi: percentual de BDI (float > 0)
- Status: 1 (Ativo)
- DataInicio: <= data da medição (01/05/2026)
- DataFim: >= data da medição OU NULL (31/05/2026)
```

**O QUE VERIFICAR NO SISTEMA:**
```sql
-- Verifique os valores dos campos
SELECT 
    e.CodigoEquipamento,
    f.NumeroFaixa,
    r.Id,
    r.ValorPrevisto,
    r.Bdi,
    r.Status,
    r.DataInicio,
    r.DataFim,
    CASE 
        WHEN r.ValorPrevisto IS NULL OR r.ValorPrevisto = 0 THEN '❌ VALOR ZERADO'
        WHEN r.Bdi IS NULL OR r.Bdi = 0 THEN '❌ BDI ZERADO'
        WHEN r.Status = 0 THEN '❌ INATIVO'
        WHEN r.DataInicio > '2026-05-01' THEN '❌ DATA INÍCIO FORA'
        WHEN r.DataFim < '2026-05-31' THEN '❌ DATA FIM EXPIRADA'
        ELSE '✅ OK'
    END AS Validacao
FROM TBRecursos r
JOIN TBEquipamentos e ON r.EquipamentoId = e.Id
JOIN TBFaixas f ON r.FaixaId = f.Id
WHERE e.CodigoEquipamento = 'GYN1R801'
```

**❌ PROBLEMAS POSSÍVEIS:**
- ValorPrevisto = 0 ou NULL → Relatório mostra R$ 0,00
- Bdi = 0 ou NULL → BDI aparece 0,00%
- Status = 0 → Recurso ignorado pelo cálculo
- DataInicio > 01/05/2026 → Recurso não vigente em maio
- DataFim < 31/05/2026 → Recurso expirado

---

### Regra 3: Relacionamento Equipamento → Contrato

**O QUE A DOCUMENTAÇÃO DIZ:**
```
O equipamento DEVE estar vinculado ao contrato através de:
- Tabela TBContratosEquipamentos
- Contrato deve estar ativo (Status = 1)
- Contrato deve estar vigente na data da medição
```

**O QUE VERIFICAR NO SISTEMA:**
```sql
-- Verifique vinculação ao contrato
SELECT 
    e.CodigoEquipamento,
    c.NumeroContrato,
    c.Orgao,
    c.Status AS ContratoStatus,
    c.VigenciaInicio,
    c.VigenciaFim,
    CASE 
        WHEN ce.ContratoId IS NULL THEN '❌ NÃO VINCULADO'
        WHEN c.Status = 0 THEN '❌ CONTRATO INATIVO'
        WHEN '2026-05-01' < c.VigenciaInicio THEN '❌ CONTRATO FUTURO'
        WHEN '2026-05-31' > c.VigenciaFim THEN '❌ CONTRATO EXPIRADO'
        ELSE '✅ OK'
    END AS Validacao
FROM TBEquipamentos e
LEFT JOIN TBContratosEquipamentos ce ON ce.EquipamentoId = e.Id
LEFT JOIN TBContratos c ON c.Id = ce.ContratoId
WHERE e.CodigoEquipamento = 'GYN1R801'
```

**❌ SE Validacao = 'NÃO VINCULADO':** Equipamento não está no contrato

---

### Regra 4: Cálculo dos Valores Financeiros

**O QUE A DOCUMENTAÇÃO DIZ:**
```
Fórmulas de cálculo:

1. VALOR PREVISTO (do recurso):
   = TBRecursos.ValorPrevisto

2. DESCONTO HORAS PARALISADAS:
   = ValorPrevisto × (1 - ÍndiceOperação)
   Exemplo: R$ 15.000 × (1 - 100%) = R$ 0,00

3. VALOR FAIXA:
   = ValorPrevisto - Desconto
   Exemplo: R$ 15.000 - R$ 0,00 = R$ 15.000

4. VALOR BDI:
   = ValorFaixa × (Bdi / 100)
   Exemplo: R$ 15.000 × 0,25 = R$ 3.750

5. TOTAL:
   = ValorFaixa + ValorBDI
   = ValorFaixa × (1 + Bdi/100)
   Exemplo: R$ 15.000 + R$ 3.750 = R$ 18.750
```

**O QUE VERIFICAR NO SISTEMA:**
```sql
-- Simular o cálculo
SELECT 
    e.CodigoEquipamento,
    f.NumeroFaixa,
    r.ValorPrevisto,
    r.Bdi,
    -- Simular cálculo (supondo índice 100%)
    r.ValorPrevisto AS ValorFaixa,
    r.ValorPrevisto * (r.Bdi / 100.0) AS ValorBDI,
    r.ValorPrevisto * (1 + r.Bdi / 100.0) AS Total,
    CASE 
        WHEN r.ValorPrevisto = 0 OR r.ValorPrevisto IS NULL THEN '❌ TOTAL SERÁ R$ 0,00'
        WHEN r.Bdi = 0 OR r.Bdi IS NULL THEN '⚠️ TOTAL SEM BDI'
        ELSE '✅ CALCULARÁ CORRETAMENTE'
    END AS PrevisaoCalculo
FROM TBRecursos r
JOIN TBEquipamentos e ON r.EquipamentoId = e.Id
JOIN TBFaixas f ON r.FaixaId = f.Id
WHERE e.CodigoEquipamento = 'GYN1R801'
```

**❌ SE PrevisaoCalculo = 'TOTAL SERÁ R$ 0,00':** ValorPrevisto zerado causa problema

---

## 🔄 Comparação: GYN1R801 vs GYN1R803

### Configuração Esperada (GYN1R803 - Funcionando)

```sql
-- Execute para ver configuração correta
SELECT 
    e.CodigoEquipamento,
    f.NumeroFaixa,
    r.Id AS RecursoId,
    r.ValorPrevisto,
    r.Bdi,
    r.Status,
    c.NumeroContrato
FROM TBRecursos r
JOIN TBEquipamentos e ON r.EquipamentoId = e.Id
JOIN TBFaixas f ON r.FaixaId = f.Id
LEFT JOIN TBContratos c ON r.ContratoId = c.Id
WHERE e.CodigoEquipamento IN ('GYN1R801', 'GYN1R803')
ORDER BY e.CodigoEquipamento, f.NumeroFaixa
```

**RESULTADO ESPERADO:**

| Equipamento | Faixa | RecursoId | ValorPrevisto | Bdi  | Status | NumeroContrato |
|-------------|-------|-----------|---------------|------|--------|----------------|
| GYN1R801    | 1     | ❌ NULL   | ❌ NULL       | ❌ NULL | NULL   | NULL           |
| GYN1R801    | 2     | ❌ NULL   | ❌ NULL       | ❌ NULL | NULL   | NULL           |
| GYN1R803    | 1     | ✅ 456    | ✅ 15000.00   | ✅ 25  | 1      | CTR-001        |
| GYN1R803    | 2     | ✅ 457    | ✅ 15000.00   | ✅ 25  | 1      | CTR-001        |

**DIAGNÓSTICO:**
- ❌ GYN1R801: RecursoId = NULL → **Recursos não cadastrados** (CAUSA RAIZ)
- ✅ GYN1R803: Todos os campos preenchidos corretamente

---

## 📊 Checklist de Validação - O Que Está Errado?

Execute cada query abaixo e marque ✅ ou ❌:

### ✅ 1. Equipamento Existe?
```sql
SELECT * FROM TBEquipamentos WHERE CodigoEquipamento = 'GYN1R801'
```
- ❌ Retornou 0 linhas: Equipamento não existe
- ✅ Retornou 1 linha: Equipamento existe

### ✅ 2. Faixas Cadastradas?
```sql
SELECT * FROM TBFaixas f
JOIN TBEquipamentos e ON f.EquipamentoId = e.Id
WHERE e.CodigoEquipamento = 'GYN1R801'
```
- ❌ Retornou 0 linhas: Faixas não cadastradas
- ⚠️ Retornou 1 linha: Falta uma faixa
- ✅ Retornou 2 linhas: Faixas OK

### ⚠️ 3. Vinculado ao Contrato?
```sql
SELECT * FROM TBContratosEquipamentos ce
JOIN TBEquipamentos e ON ce.EquipamentoId = e.Id
WHERE e.CodigoEquipamento = 'GYN1R801'
```
- ❌ Retornou 0 linhas: Não vinculado
- ✅ Retornou 1+ linhas: Vinculado

### 🔴 4. Recursos Cadastrados? (CRÍTICO)
```sql
SELECT * FROM TBRecursos r
JOIN TBEquipamentos e ON r.EquipamentoId = e.Id
WHERE e.CodigoEquipamento = 'GYN1R801'
```
- ❌ Retornou 0 linhas: **CAUSA RAIZ - Recursos não existem**
- ⚠️ Retornou 1 linha: Falta recurso para uma faixa
- ✅ Retornou 2 linhas: Recursos existem

### 🔴 5. Valores Configurados? (CRÍTICO)
```sql
SELECT 
    ValorPrevisto,
    Bdi,
    Status
FROM TBRecursos r
JOIN TBEquipamentos e ON r.EquipamentoId = e.Id
WHERE e.CodigoEquipamento = 'GYN1R801'
```
**Verificar:**
- ❌ ValorPrevisto = 0 ou NULL: Valor não configurado
- ❌ Bdi = 0 ou NULL: BDI não configurado
- ❌ Status = 0: Recurso inativo
- ✅ Todos > 0 e Status = 1: Valores OK

### ⚠️ 6. Vigência Correta?
```sql
SELECT 
    DataInicio,
    DataFim
FROM TBRecursos r
JOIN TBEquipamentos e ON r.EquipamentoId = e.Id
WHERE e.CodigoEquipamento = 'GYN1R801'
```
**Verificar:**
- ❌ DataInicio > '2026-05-01': Recurso não vigente em maio
- ❌ DataFim < '2026-05-31': Recurso expirado
- ✅ DataInicio <= 01/05 e DataFim >= 31/05: Vigência OK

---

## 🎯 Diagnóstico Final - Matriz de Problemas

### Cenário A: Recursos Não Existem (Mais Provável)
```
Query: SELECT * FROM TBRecursos WHERE EquipamentoId = [ID do GYN1R801]
Resultado: 0 linhas

❌ PROBLEMA: Recursos não cadastrados na tabela TBRecursos
✅ SOLUÇÃO: Cadastrar 2 recursos (Faixa 1 e Faixa 2) via:
   - Interface: Medição → Recursos → Novo Recurso
   - SQL: INSERT INTO TBRecursos (...)
```

### Cenário B: Recursos Existem Mas Valores Zerados
```
Query: SELECT ValorPrevisto, Bdi FROM TBRecursos WHERE ...
Resultado: ValorPrevisto = 0.00, Bdi = 0.00

❌ PROBLEMA: Recursos cadastrados mas sem valores configurados
✅ SOLUÇÃO: Atualizar valores via:
   - Interface: Medição → Recursos → Editar
   - SQL: UPDATE TBRecursos SET ValorPrevisto = 15000, Bdi = 25 WHERE ...
```

### Cenário C: Recursos Existem Mas Inativos
```
Query: SELECT Status FROM TBRecursos WHERE ...
Resultado: Status = 0

❌ PROBLEMA: Recursos desativados
✅ SOLUÇÃO: Ativar recursos via:
   - Interface: Medição → Recursos → Editar → Status = Ativo
   - SQL: UPDATE TBRecursos SET Status = 1 WHERE ...
```

### Cenário D: Recursos OK Mas Vigência Errada
```
Query: SELECT DataInicio, DataFim FROM TBRecursos WHERE ...
Resultado: DataInicio = '2026-06-01' (futuro)

❌ PROBLEMA: Recurso não vigente no período de medição
✅ SOLUÇÃO: Ajustar datas via:
   - Interface: Medição → Recursos → Editar → DataInicio
   - SQL: UPDATE TBRecursos SET DataInicio = '2026-01-01' WHERE ...
```

---

## 📋 Script de Correção (Após Diagnóstico)

**⚠️ SÓ EXECUTAR APÓS CONFIRMAR O PROBLEMA COM AS QUERIES ACIMA**

### Se Cenário A (Recursos Não Existem):
```sql
-- COPIE OS IDs REAIS DO SISTEMA ANTES DE EXECUTAR!

-- Buscar IDs necessários
DECLARE @EquipamentoId INT = (SELECT Id FROM TBEquipamentos WHERE CodigoEquipamento = 'GYN1R801');
DECLARE @FaixaId1 INT = (SELECT Id FROM TBFaixas WHERE EquipamentoId = @EquipamentoId AND NumeroFaixa = 1);
DECLARE @FaixaId2 INT = (SELECT Id FROM TBFaixas WHERE EquipamentoId = @EquipamentoId AND NumeroFaixa = 2);
DECLARE @ContratoId INT = (SELECT TOP 1 Id FROM TBContratos WHERE Orgao LIKE '%Goiânia%' AND Status = 1);

-- Buscar valores de referência do GYN1R803
DECLARE @ValorRef DECIMAL(19,5);
DECLARE @BdiRef FLOAT;

SELECT TOP 1 
    @ValorRef = ValorPrevisto,
    @BdiRef = Bdi
FROM TBRecursos r
JOIN TBEquipamentos e ON r.EquipamentoId = e.Id
WHERE e.CodigoEquipamento = 'GYN1R803'
  AND r.Status = 1;

-- Inserir recursos
INSERT INTO TBRecursos (
    Descricao, 
    Tipo, 
    EquipamentoId, 
    FaixaId, 
    ContratoId, 
    ValorPrevisto, 
    Bdi, 
    DataInicio, 
    Status
)
VALUES
    ('Faixa 1 - GYN1R801', 'Equipamento', @EquipamentoId, @FaixaId1, @ContratoId, @ValorRef, @BdiRef, '2026-01-01', 1),
    ('Faixa 2 - GYN1R801', 'Equipamento', @EquipamentoId, @FaixaId2, @ContratoId, @ValorRef, @BdiRef, '2026-01-01', 1);

-- Validar inserção
SELECT 'Recursos Criados:' AS Resultado;
SELECT * FROM TBRecursos r
JOIN TBEquipamentos e ON r.EquipamentoId = e.Id
WHERE e.CodigoEquipamento = 'GYN1R801';
```

### Se Cenário B (Valores Zerados):
```sql
-- Atualizar com valores do GYN1R803
UPDATE r
SET 
    r.ValorPrevisto = ref.ValorPrevisto,
    r.Bdi = ref.Bdi,
    r.Status = 1
FROM TBRecursos r
JOIN TBEquipamentos e ON r.EquipamentoId = e.Id
CROSS JOIN (
    SELECT TOP 1 ValorPrevisto, Bdi
    FROM TBRecursos rref
    JOIN TBEquipamentos eref ON rref.EquipamentoId = eref.Id
    WHERE eref.CodigoEquipamento = 'GYN1R803'
      AND rref.Status = 1
) ref
WHERE e.CodigoEquipamento = 'GYN1R801';

-- Validar atualização
SELECT * FROM TBRecursos r
JOIN TBEquipamentos e ON r.EquipamentoId = e.Id
WHERE e.CodigoEquipamento = 'GYN1R801';
```

---

## ✅ Validação Final

Após aplicar a correção, execute:

```sql
-- Validar que valores agora aparecem
SELECT 
    e.CodigoEquipamento,
    f.NumeroFaixa,
    r.ValorPrevisto AS VALOR_PREVISTO,
    r.ValorPrevisto * (1 + r.Bdi/100.0) AS TOTAL_ESPERADO,
    CASE 
        WHEN r.ValorPrevisto > 0 AND r.Bdi > 0 THEN '✅ CORRIGIDO - Valores aparecerão no relatório'
        ELSE '❌ AINDA ZERADO - Verificar novamente'
    END AS Status
FROM TBRecursos r
JOIN TBEquipamentos e ON r.EquipamentoId = e.Id
JOIN TBFaixas f ON r.FaixaId = f.Id
WHERE e.CodigoEquipamento = 'GYN1R801'
ORDER BY f.NumeroFaixa;
```

**RESULTADO ESPERADO:**
```
CodigoEquipamento | NumeroFaixa | VALOR_PREVISTO | TOTAL_ESPERADO | Status
GYN1R801          | 1           | 15000.00       | 18750.00       | ✅ CORRIGIDO
GYN1R801          | 2           | 15000.00       | 18750.00       | ✅ CORRIGIDO
```

---

## 📞 Resumo: O Que Verificar no Sistema

1. **Execute:** SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql
2. **Analise:** Query 3 (Recursos) e Query 9 (Diagnóstico)
3. **Identifique:** Qual cenário (A, B, C ou D) se aplica
4. **Aplique:** Script de correção correspondente
5. **Valide:** Query de validação final
6. **Teste:** Gere relatório de medição e verifique valores

---

**Documentos Relacionados:**
- SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql
- INSTRUCOES-EXECUCAO-SCRIPT-SQL.md
- ROTEIRO-DIAGNOSTICO-COMPARATIVO-MEDICAO-GOIANIA.md

**Data:** 18/06/2026
