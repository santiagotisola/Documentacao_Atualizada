# 📋 Ciclo Completo de Cadastro para Geração de Medição - AxHub

**Data:** 18/06/2026  
**Sistemas Analisados:** IPEMPE (funcionando) e Goiânia (problemático)  
**Objetivo:** Documentar o relacionamento completo de processos necessários para gerar relatório de medição

---

## 📊 Visão Geral do Processo

```
┌────────────────────────────────────────────────────────────────┐
│                   FLUXO DE MEDIÇÃO AXHUB                       │
└────────────────────────────────────────────────────────────────┘

ETAPA 1: CADASTROS BÁSICOS
├── 1.1 Cadastrar Equipamento (TBEquipamentos)
├── 1.2 Cadastrar Faixas do Equipamento (TBFaixas)
└── 1.3 Ativar Equipamento (Status = Ativo)
         ↓
ETAPA 2: CONFIGURAÇÃO CONTRATUAL
├── 2.1 Cadastrar Contrato (TBContratos)
├── 2.2 Definir Vigência do Contrato
├── 2.3 Vincular Equipamentos ao Contrato (TBContratosEquipamentos)
└── 2.4 Ativar Contrato (Status = Ativo)
         ↓
ETAPA 3: CONFIGURAÇÃO DE RECURSOS (⚠️ CRÍTICO)
├── 3.1 Cadastrar Recurso por Faixa (TBRecursos)
├── 3.2 Vincular Recurso ao Contrato
├── 3.3 Vincular Recurso ao Equipamento
├── 3.4 Vincular Recurso à Faixa Específica
├── 3.5 Definir Valor Previsto (R$)
├── 3.6 Definir BDI (%)
├── 3.7 Definir Vigência do Recurso
└── 3.8 Ativar Recurso (Status = Ativo)
         ↓
ETAPA 4: OPERAÇÃO DO EQUIPAMENTO
├── 4.1 Registro de Passagens (TBPassagens) - Automático
├── 4.2 Registro de Heartbeat (TBHeartbeatEquipamentos) - Automático
└── 4.3 Registro de Interrupções (TBInterrupcoes) - Manual
         ↓
ETAPA 5: GERAÇÃO DO RELATÓRIO
├── 5.1 Acessar: Medição → Nova Medição
├── 5.2 Selecionar Contrato
├── 5.3 Selecionar Período (Mês/Ano)
├── 5.4 Selecionar Equipamentos
├── 5.5 Gerar Relatório
└── 5.6 Validar Valores Calculados
         ↓
ETAPA 6: FINALIZAÇÃO
├── 6.1 Revisar Medição
├── 6.2 Ajustar Interrupções (se necessário)
└── 6.3 Finalizar Medição
```

---

## 🔍 ETAPA 1: Cadastros Básicos

### 1.1 Cadastrar Equipamento

**Menu:** Cadastros → Equipamentos → Novo Equipamento

**Campos Obrigatórios:**
- **Código do Equipamento**: Ex: GYN1R801, ITZ022R
- **Local**: Endereço/localização
- **Status**: Ativo
- **Tipo de Equipamento**: Radar, OCR, Barreira, etc.

**Tabela:** `TBEquipamentos`

**SQL de Validação:**
```sql
-- Verificar se equipamento existe e está ativo
SELECT 
    Id,
    CodigoEquipamento,
    Local,
    Status,
    CASE 
        WHEN Status = 1 THEN '✅ ATIVO'
        ELSE '❌ INATIVO'
    END AS StatusDesc
FROM TBEquipamentos
WHERE CodigoEquipamento = 'GYN1R801';
```

**✅ Resultado Esperado:** 1 linha retornada com Status = 1

---

### 1.2 Cadastrar Faixas do Equipamento

**Menu:** Cadastros → Equipamentos → Editar → Faixas

**Campos Obrigatórios:**
- **Número da Faixa**: 1, 2, 3, etc.
- **Equipamento Id**: Vinculado ao equipamento criado
- **Sentido**: Norte/Sul, Leste/Oeste, etc.

**Tabela:** `TBFaixas`

**SQL de Validação:**
```sql
-- Verificar faixas cadastradas por equipamento
SELECT 
    f.Id AS FaixaId,
    e.CodigoEquipamento,
    f.NumeroFaixa,
    f.Sentido,
    COUNT(f.Id) OVER (PARTITION BY e.Id) AS TotalFaixas
FROM TBFaixas f
JOIN TBEquipamentos e ON f.EquipamentoId = e.Id
WHERE e.CodigoEquipamento = 'GYN1R801'
ORDER BY f.NumeroFaixa;
```

**✅ Resultado Esperado:** Normalmente 2 linhas (Faixa 1 e Faixa 2)

---

## 🔍 ETAPA 2: Configuração Contratual

### 2.1 Cadastrar Contrato

**Menu:** Medição → Contratos → Novo Contrato

**Campos Obrigatórios:**
- **Número do Contrato**: Ex: CT-2026-001, 001/2026-DETRAN/GO
- **Órgão**: DETRAN/GO, IPEM/PE, etc.
- **Data Início**: Ex: 01/01/2026
- **Data Fim**: Ex: 31/12/2026
- **Status**: Ativo

**Tabela:** `TBContratos`

**SQL de Validação:**
```sql
-- Verificar contratos ativos
SELECT 
    Id AS ContratoId,
    NumeroContrato,
    Orgao,
    CONVERT(VARCHAR(10), DataInicio, 103) AS Inicio,
    CONVERT(VARCHAR(10), DataFim, 103) AS Fim,
    Status,
    CASE 
        WHEN Status = 0 THEN '❌ INATIVO'
        WHEN '2026-05-01' < DataInicio THEN '⚠️ NÃO INICIADO'
        WHEN '2026-05-31' > DataFim THEN '⚠️ EXPIRADO'
        WHEN Status = 1 
             AND '2026-05-01' >= DataInicio 
             AND '2026-05-31' <= DataFim THEN '✅ VÁLIDO MAIO/2026'
        ELSE '⚠️ VERIFICAR'
    END AS ValidacaoMaio2026
FROM TBContratos
WHERE Orgao LIKE '%DETRAN%' OR Orgao LIKE '%Goiânia%'
ORDER BY DataInicio DESC;
```

**✅ Resultado Esperado:** Pelo menos 1 contrato com status "✅ VÁLIDO MAIO/2026"

---

### 2.2 Vincular Equipamentos ao Contrato

**Menu:** Medição → Contratos → Editar Contrato → Equipamentos

**Ação:** Selecionar equipamentos que fazem parte deste contrato

**Tabela:** `TBContratosEquipamentos`

**SQL de Validação:**
```sql
-- Verificar vinculação equipamento-contrato
SELECT 
    e.CodigoEquipamento,
    c.NumeroContrato,
    c.Orgao,
    c.Status AS StatusContrato,
    ce.Id AS VinculoId,
    CASE 
        WHEN ce.Id IS NULL THEN '❌ EQUIPAMENTO NÃO VINCULADO'
        WHEN c.Status = 0 THEN '⚠️ CONTRATO INATIVO'
        ELSE '✅ VINCULADO'
    END AS StatusVinculo
FROM TBEquipamentos e
LEFT JOIN TBContratosEquipamentos ce ON ce.EquipamentoId = e.Id
LEFT JOIN TBContratos c ON c.Id = ce.ContratoId
WHERE e.CodigoEquipamento IN ('GYN1R801', 'GYN1R803')
ORDER BY e.CodigoEquipamento;
```

**✅ Resultado Esperado:** Equipamento com StatusVinculo = '✅ VINCULADO'

---

## 🔍 ETAPA 3: Configuração de Recursos ⚠️ **MAIS CRÍTICO**

> **⚠️ ATENÇÃO:** Esta é a etapa mais importante! Sem recursos cadastrados, o relatório mostrará valores zerados mesmo que tudo o mais esteja correto.

### 3.1 Cadastrar Recurso por Faixa

**Menu:** Medição → Recursos → Novo Recurso

**⚠️ IMPORTANTE:** É necessário criar **1 recurso para cada faixa** do equipamento!

**Exemplo:**
- GYN1R801 tem 2 faixas → Criar 2 recursos:
  - Recurso 1: GYN1R801 - Faixa 1
  - Recurso 2: GYN1R801 - Faixa 2

**Campos Obrigatórios:**

| Campo | Exemplo | Observação |
|-------|---------|------------|
| **Descrição** | "Radar GYN1R801 - Faixa 1" | Nome descritivo |
| **Tipo** | Equipamento | Tipo de recurso |
| **Contrato** | CT-2026-001 | ⚠️ OBRIGATÓRIO vincular |
| **Equipamento** | GYN1R801 | ⚠️ OBRIGATÓRIO vincular |
| **Faixa** | 1 | ⚠️ OBRIGATÓRIO especificar |
| **Valor Previsto** | R$ 15.000,00 | ⚠️ OBRIGATÓRIO > 0 |
| **BDI (%)** | 25,00% | ⚠️ OBRIGATÓRIO > 0 |
| **Data Início** | 01/01/2026 | Início da vigência |
| **Data Fim** | 31/12/2026 | Fim da vigência |
| **Status** | Ativo | ⚠️ OBRIGATÓRIO = Ativo |

**Tabela:** `TBRecursos`

**SQL de Validação:**
```sql
-- ⭐ QUERY CRÍTICA: Verificar recursos por faixa
SELECT 
    e.CodigoEquipamento AS Equipamento,
    f.NumeroFaixa AS Faixa,
    r.Id AS RecursoId,
    r.Descricao AS DescricaoRecurso,
    r.ValorPrevisto AS ValorPrevisto,
    r.Bdi AS BDI,
    CASE WHEN r.Status = 1 THEN 'Ativo' ELSE 'Inativo' END AS StatusRecurso,
    CONVERT(VARCHAR(10), r.DataInicio, 103) AS InicioVigencia,
    CONVERT(VARCHAR(10), r.DataFim, 103) AS FimVigencia,
    c.NumeroContrato AS Contrato,
    
    -- ⭐ DIAGNÓSTICO AUTOMÁTICO
    CASE 
        WHEN r.Id IS NULL THEN '🔴 RECURSO NÃO CADASTRADO'
        WHEN r.ContratoId IS NULL THEN '🔴 SEM CONTRATO VINCULADO'
        WHEN c.Id IS NULL THEN '🔴 CONTRATO NÃO ENCONTRADO'
        WHEN c.Status = 0 THEN '🔴 CONTRATO INATIVO'
        WHEN r.Status = 0 THEN '🔴 RECURSO INATIVO'
        WHEN r.ValorPrevisto IS NULL OR r.ValorPrevisto = 0 THEN '🔴 VALOR PREVISTO ZERADO'
        WHEN r.Bdi IS NULL OR r.Bdi = 0 THEN '🟡 BDI ZERADO (Opcional)'
        WHEN '2026-05-01' < r.DataInicio THEN '🔴 VIGÊNCIA NÃO INICIADA'
        WHEN '2026-05-31' > COALESCE(r.DataFim, '9999-12-31') THEN '🔴 VIGÊNCIA EXPIRADA'
        WHEN '2026-05-01' < c.DataInicio OR '2026-05-31' > c.DataFim THEN '🔴 CONTRATO FORA VIGÊNCIA'
        ELSE '✅ CONFIGURAÇÃO OK'
    END AS Diagnostico

FROM TBEquipamentos e
INNER JOIN TBFaixas f ON f.EquipamentoId = e.Id
LEFT JOIN TBRecursos r ON r.EquipamentoId = e.Id AND r.FaixaId = f.Id
LEFT JOIN TBContratos c ON c.Id = r.ContratoId

WHERE e.CodigoEquipamento IN ('GYN1R801', 'GYN1R803', 'GYN1R804', 'ITZ022R')

ORDER BY 
    e.CodigoEquipamento,
    f.NumeroFaixa;
```

**✅ Resultado Esperado:** 
```
Equipamento | Faixa | RecursoId | ValorPrevisto | BDI   | Diagnostico
------------|-------|-----------|---------------|-------|------------------
GYN1R801    | 1     | 1523      | 15000.00      | 25.00 | ✅ CONFIGURAÇÃO OK
GYN1R801    | 2     | 1524      | 15000.00      | 25.00 | ✅ CONFIGURAÇÃO OK
```

**❌ Problema Comum:**
```
Equipamento | Faixa | RecursoId | ValorPrevisto | BDI  | Diagnostico
------------|-------|-----------|---------------|------|------------------------
GYN1R801    | 1     | NULL      | NULL          | NULL | 🔴 RECURSO NÃO CADASTRADO
GYN1R801    | 2     | NULL      | NULL          | NULL | 🔴 RECURSO NÃO CADASTRADO
```

---

### 3.2 Script de Correção: Cadastrar Recursos Ausentes

```sql
-- ⚠️ ATENÇÃO: Ajuste os valores conforme o contrato real!
-- Este script insere recursos para faixas que não possuem

DECLARE @ContratoId INT = 12; -- ⚠️ Obter da query de contratos acima
DECLARE @ValorPrevisto DECIMAL(18,2) = 15000.00; -- ⚠️ Valor mensal por faixa
DECLARE @Bdi DECIMAL(5,2) = 25.00; -- ⚠️ Percentual de BDI
DECLARE @DataInicio DATE = '2026-01-01'; -- ⚠️ Início da vigência
DECLARE @DataFim DATE = '2026-12-31'; -- ⚠️ Fim da vigência
DECLARE @UsuarioId INT = 1; -- ⚠️ ID do usuário que está cadastrando

-- Inserir recursos para cada faixa sem recurso
INSERT INTO TBRecursos (
    Descricao,
    Tipo,
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
    e.CodigoEquipamento + ' - Faixa ' + CAST(f.NumeroFaixa AS VARCHAR) AS Descricao,
    'Equipamento' AS Tipo,
    e.Id AS EquipamentoId,
    f.Id AS FaixaId,
    @ContratoId AS ContratoId,
    @ValorPrevisto AS ValorPrevisto,
    @Bdi AS Bdi,
    1 AS Status, -- Ativo
    @DataInicio AS DataInicio,
    @DataFim AS DataFim,
    GETDATE() AS DataCriacao,
    @UsuarioId AS UsuarioCriacaoId
FROM TBEquipamentos e
INNER JOIN TBFaixas f ON f.EquipamentoId = e.Id
WHERE e.CodigoEquipamento = 'GYN1R801'
  AND NOT EXISTS (
      SELECT 1 FROM TBRecursos r 
      WHERE r.EquipamentoId = e.Id 
        AND r.FaixaId = f.Id
  );

-- Mostrar recursos inseridos
SELECT 
    'Recursos inseridos:' AS Resultado, 
    @@ROWCOUNT AS Quantidade;

-- Validar inserção
SELECT 
    e.CodigoEquipamento,
    f.NumeroFaixa,
    r.Id AS RecursoId,
    r.Descricao,
    r.ValorPrevisto,
    r.Bdi,
    c.NumeroContrato
FROM TBRecursos r
JOIN TBEquipamentos e ON r.EquipamentoId = e.Id
JOIN TBFaixas f ON r.FaixaId = f.Id
JOIN TBContratos c ON r.ContratoId = c.Id
WHERE e.CodigoEquipamento = 'GYN1R801'
ORDER BY f.NumeroFaixa;
```

---

## 🔍 ETAPA 4: Operação do Equipamento

### 4.1 Registro de Passagens (Automático)

**Processo:** Equipamento registra passagens automaticamente

**Tabela:** `TBPassagens`

**SQL de Validação:**
```sql
-- Verificar passagens registradas no período
SELECT 
    e.CodigoEquipamento,
    f.NumeroFaixa,
    COUNT(*) AS TotalPassagens,
    MIN(p.DataHora) AS PrimeiraPassagem,
    MAX(p.DataHora) AS UltimaPassagem,
    DATEDIFF(DAY, MIN(p.DataHora), MAX(p.DataHora)) + 1 AS DiasOperacao
FROM TBPassagens p
JOIN TBEquipamentos e ON p.EquipamentoId = e.Id
JOIN TBFaixas f ON p.FaixaId = f.Id
WHERE e.CodigoEquipamento = 'GYN1R801'
  AND p.DataHora >= '2026-05-01'
  AND p.DataHora < '2026-06-01'
GROUP BY e.CodigoEquipamento, f.NumeroFaixa
ORDER BY e.CodigoEquipamento, f.NumeroFaixa;
```

**✅ Resultado Esperado:**
```
CodigoEquipamento | NumeroFaixa | TotalPassagens | DiasOperacao
------------------|-------------|----------------|-------------
GYN1R801          | 1           | 584740         | 31
GYN1R801          | 2           | 609222         | 31
```

---

### 4.2 Registro de Interrupções (Manual)

**Menu:** Medição → Interrupções → Nova Interrupção

**Campos:**
- **Equipamento**: Selecionar equipamento
- **Data/Hora Início**: Início da interrupção
- **Data/Hora Fim**: Fim da interrupção
- **Motivo**: Descrição do problema
- **Tipo**: Manutenção, Falha, etc.

**Tabela:** `TBInterrupcoes`

**SQL de Validação:**
```sql
-- Verificar interrupções registradas no período
SELECT 
    e.CodigoEquipamento,
    i.DataHoraInicio,
    i.DataHoraFim,
    DATEDIFF(HOUR, i.DataHoraInicio, i.DataHoraFim) AS HorasInterrupcao,
    i.Motivo,
    i.Tipo
FROM TBInterrupcoes i
JOIN TBEquipamentos e ON i.EquipamentoId = e.Id
WHERE e.CodigoEquipamento = 'GYN1R801'
  AND i.DataHoraInicio >= '2026-05-01'
  AND i.DataHoraInicio < '2026-06-01'
ORDER BY i.DataHoraInicio;
```

---

## 🔍 ETAPA 5: Geração do Relatório

### 5.1 Acessar Módulo de Medição

**URL:** `https://goiania.axhub.axion.ws/medicao/relatoriomedicaoequipamento`

**Menu:** Medição → Nova Medição → Relatório de Medição de Equipamento

---

### 5.2 Preencher Filtros

| Filtro | Exemplo | Obrigatório |
|--------|---------|-------------|
| **Contrato** | CT-2026-001 | ✅ Sim |
| **Período** | Maio/2026 | ✅ Sim |
| **Equipamentos** | GYN1R801, GYN1R803 | ✅ Sim |

---

### 5.3 Gerar e Validar Relatório

**Colunas Esperadas:**

| Coluna | Origem | Cálculo |
|--------|--------|---------|
| **EQUIPAMENTO** | TBEquipamentos.CodigoEquipamento | - |
| **FAIXA** | TBFaixas.NumeroFaixa | - |
| **VEÍCULOS** | COUNT(TBPassagens) | No período |
| **PREVISTOS** | Configuração | 744 horas (31 dias × 24h) |
| **INTERRUPÇÕES** | SUM(TBInterrupcoes) | Horas interrompidas |
| **RECURSOS** | SUM(HorasRecursos) | Horas com recursos |
| **TOTAL (HORAS)** | Previstos - Interrupções | - |
| **ÍNDICE OPERAÇÃO** | (Total / Previstos) × 100 | Percentual |
| **DESCONTO** | ValorPrevisto × (1 - Índice) | Valor descontado |
| **VALOR PREVISTO** | TBRecursos.ValorPrevisto | ⚠️ Do recurso |
| **VALOR FAIXA** | ValorPrevisto - Desconto | Valor líquido |
| **BDI (%)** | TBRecursos.Bdi | ⚠️ Do recurso |
| **TOTAL** | ValorFaixa × (1 + BDI/100) | Valor final |

---

## 📊 Fórmulas de Cálculo

### 1. Horas Totais
```
TOTAL (HORAS) = HORAS PREVISTAS - HORAS DE INTERRUPÇÃO
Exemplo: 744h - 0h = 744h
```

### 2. Índice de Operação
```
ÍNDICE OPERAÇÃO = (TOTAL HORAS / HORAS PREVISTAS) × 100
Exemplo: (744 / 744) × 100 = 100,00%
```

### 3. Desconto por Indisponibilidade
```
DESCONTO = VALOR PREVISTO × (1 - ÍNDICE OPERAÇÃO)
Exemplo: R$ 15.000,00 × (1 - 1,00) = R$ 0,00
```

### 4. Valor Faixa (Líquido)
```
VALOR FAIXA = VALOR PREVISTO - DESCONTO
Exemplo: R$ 15.000,00 - R$ 0,00 = R$ 15.000,00
```

### 5. Valor BDI
```
VALOR BDI = VALOR FAIXA × (BDI / 100)
Exemplo: R$ 15.000,00 × 0,25 = R$ 3.750,00
```

### 6. Total Final
```
TOTAL = VALOR FAIXA + VALOR BDI
Exemplo: R$ 15.000,00 + R$ 3.750,00 = R$ 18.750,00
```

---

## ✅ Checklist de Validação Completo

### Antes de Gerar o Relatório

```
CADASTROS BÁSICOS
[ ] Equipamento cadastrado em TBEquipamentos
[ ] Equipamento com Status = Ativo
[ ] Faixas cadastradas em TBFaixas (normalmente 2)
[ ] CodigoEquipamento único e correto

CONTRATO
[ ] Contrato cadastrado em TBContratos
[ ] Contrato com Status = Ativo
[ ] Vigência do contrato cobre o período da medição
[ ] Equipamento vinculado ao contrato (TBContratosEquipamentos)

RECURSOS ⚠️ CRÍTICO
[ ] 1 recurso cadastrado para CADA faixa (TBRecursos)
[ ] Recurso vinculado ao Contrato (ContratoId preenchido)
[ ] Recurso vinculado ao Equipamento (EquipamentoId preenchido)
[ ] Recurso vinculado à Faixa (FaixaId preenchido)
[ ] ValorPrevisto > 0 (ex: R$ 15.000,00)
[ ] Bdi > 0 (ex: 25,00%)
[ ] Status do recurso = Ativo
[ ] DataInicio <= data da medição
[ ] DataFim >= data da medição (ou NULL)

OPERAÇÃO
[ ] Passagens registradas no período (TBPassagens)
[ ] Heartbeat funcionando (opcional)
[ ] Interrupções registradas (se houver)

MEDIÇÃO
[ ] Período selecionado correto (mês/ano)
[ ] Contrato selecionado correto
[ ] Equipamentos selecionados
```

---

## 🔧 Troubleshooting: Problemas Comuns

### Problema 1: Valores Zerados no Relatório

**Sintoma:**
```
VALOR PREVISTO = R$ 0,00
VALOR FAIXA = R$ 0,00
BDI = 0,00%
TOTAL = R$ 0,00
```

**Causa Raiz:** Recurso não cadastrado ou valores zerados

**Diagnóstico:**
```sql
-- Execute a query da Etapa 3.1 e veja a coluna "Diagnostico"
-- Se mostrar "🔴 RECURSO NÃO CADASTRADO", siga o passo abaixo
```

**Solução:** Execute o script da Etapa 3.2 (Cadastrar Recursos Ausentes)

---

### Problema 2: Equipamento Não Aparece no Relatório

**Causa Raiz:** Equipamento não vinculado ao contrato

**Diagnóstico:**
```sql
-- Verifique vínculo do equipamento com o contrato
SELECT 
    e.CodigoEquipamento,
    c.NumeroContrato,
    ce.Id AS VinculoId
FROM TBEquipamentos e
LEFT JOIN TBContratosEquipamentos ce ON ce.EquipamentoId = e.Id
LEFT JOIN TBContratos c ON c.Id = ce.ContratoId
WHERE e.CodigoEquipamento = 'GYN1R801';
```

**Solução:**
```sql
-- Se VinculoId = NULL, vincular equipamento ao contrato
DECLARE @EquipamentoId INT = (SELECT Id FROM TBEquipamentos WHERE CodigoEquipamento = 'GYN1R801');
DECLARE @ContratoId INT = 12; -- ID do contrato

INSERT INTO TBContratosEquipamentos (EquipamentoId, ContratoId, DataCriacao)
VALUES (@EquipamentoId, @ContratoId, GETDATE());
```

---

### Problema 3: Passagens Zeradas

**Causa Raiz:** Equipamento não está operando ou dados não estão sendo enviados

**Diagnóstico:**
```sql
-- Verificar última passagem registrada
SELECT TOP 10
    e.CodigoEquipamento,
    p.DataHora,
    p.Placa,
    f.NumeroFaixa
FROM TBPassagens p
JOIN TBEquipamentos e ON p.EquipamentoId = e.Id
JOIN TBFaixas f ON p.FaixaId = f.Id
WHERE e.CodigoEquipamento = 'GYN1R801'
ORDER BY p.DataHora DESC;
```

**Solução:** Verificar equipamento em campo, conexão, heartbeat

---

### Problema 4: Índice de Operação Baixo

**Causa Raiz:** Muitas interrupções registradas

**Diagnóstico:**
```sql
-- Calcular horas de interrupção
SELECT 
    e.CodigoEquipamento,
    SUM(DATEDIFF(HOUR, i.DataHoraInicio, i.DataHoraFim)) AS TotalHorasInterrupcao,
    744 AS HorasPrevistas,
    ((744 - SUM(DATEDIFF(HOUR, i.DataHoraInicio, i.DataHoraFim))) / 744.0) * 100 AS IndiceCalculado
FROM TBInterrupcoes i
JOIN TBEquipamentos e ON i.EquipamentoId = e.Id
WHERE e.CodigoEquipamento = 'GYN1R801'
  AND i.DataHoraInicio >= '2026-05-01'
  AND i.DataHoraInicio < '2026-06-01'
GROUP BY e.CodigoEquipamento;
```

**Solução:** Revisar interrupções cadastradas, corrigir se necessário

---

## 📈 Comparação: IPEMPE (Funcionando) vs Goiânia (Problemático)

### IPEMPE - Configuração Correta

**URL:** https://ipempe.axhub.axion.ws/medicao/relatoriomedicaoequipamento

**Exemplo de Equipamento:** ITZ022R

```sql
-- Query de validação IPEMPE
SELECT 
    e.CodigoEquipamento,
    f.NumeroFaixa,
    r.Id AS RecursoId,
    r.ValorPrevisto,
    r.Bdi,
    r.Status,
    c.NumeroContrato
FROM TBEquipamentos e
JOIN TBFaixas f ON f.EquipamentoId = e.Id
JOIN TBRecursos r ON r.EquipamentoId = e.Id AND r.FaixaId = f.Id
JOIN TBContratos c ON c.Id = r.ContratoId
WHERE e.CodigoEquipamento = 'ITZ022R';
```

**Resultado Esperado (IPEMPE):**
```
CodigoEquipamento | NumeroFaixa | RecursoId | ValorPrevisto | Bdi   | NumeroContrato
------------------|-------------|-----------|---------------|-------|---------------
ITZ022R           | 1           | 523       | 18500.00      | 30.00 | CT-IPEM-2026
ITZ022R           | 2           | 524       | 18500.00      | 30.00 | CT-IPEM-2026
```

✅ **Conclusão:** Cada faixa tem recurso com valores configurados

---

### Goiânia - Configuração Problemática

**URL:** https://goiania.axhub.axion.ws/medicao/relatoriomedicaoequipamento

**Exemplo de Equipamento:** GYN1R801

```sql
-- Query de validação Goiânia
SELECT 
    e.CodigoEquipamento,
    f.NumeroFaixa,
    r.Id AS RecursoId,
    r.ValorPrevisto,
    r.Bdi,
    r.Status,
    c.NumeroContrato
FROM TBEquipamentos e
JOIN TBFaixas f ON f.EquipamentoId = e.Id
LEFT JOIN TBRecursos r ON r.EquipamentoId = e.Id AND r.FaixaId = f.Id
LEFT JOIN TBContratos c ON c.Id = r.ContratoId
WHERE e.CodigoEquipamento = 'GYN1R801';
```

**Resultado Atual (Goiânia - PROBLEMÁTICO):**
```
CodigoEquipamento | NumeroFaixa | RecursoId | ValorPrevisto | Bdi  | NumeroContrato
------------------|-------------|-----------|---------------|------|---------------
GYN1R801          | 1           | NULL      | NULL          | NULL | NULL
GYN1R801          | 2           | NULL      | NULL          | NULL | NULL
```

❌ **Conclusão:** Faixas NÃO têm recursos cadastrados → Valores zerados no relatório

---

## 🎯 Resumo Executivo para Operador

### O que o operador precisa saber:

1. **Para aparecer valores no relatório:**
   - Equipamento deve estar ativo
   - Equipamento deve estar vinculado a um contrato ativo
   - **CADA FAIXA** deve ter um recurso cadastrado com:
     - Valor Previsto > 0
     - BDI > 0
     - Status = Ativo
     - Vigência válida para o período

2. **Ordem de cadastro:**
   ```
   1º → Equipamento e Faixas
   2º → Contrato
   3º → Vincular Equipamento ao Contrato
   4º → Criar Recursos (1 por faixa) ⚠️ CRÍTICO
   5º → Gerar Relatório
   ```

3. **Como validar se está tudo certo:**
   - Execute a query da **Etapa 3.1** (Validação de Recursos)
   - Se aparecer "✅ CONFIGURAÇÃO OK" → Pode gerar o relatório
   - Se aparecer "🔴 RECURSO NÃO CADASTRADO" → Siga Etapa 3.2

4. **Valores esperados no relatório (exemplo):**
   - VALOR PREVISTO: R$ 15.000,00
   - BDI: 25,00%
   - TOTAL: R$ 18.750,00 (se índice = 100%)

---

## 📚 Arquivos Relacionados

| Arquivo | Descrição |
|---------|-----------|
| `SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql` | 9 queries de diagnóstico completo |
| `VALIDACAO-CONTRATOS-POR-FAIXA-GOIANIA.sql` | 5 queries focadas em contratos |
| `COMPARACAO-REGRAS-VS-SISTEMA-MEDICAO.md` | Regras documentadas vs SQL |
| `GUIA-VALIDACAO-CONTRATOS-FAIXAS.md` | Guia de interpretação de queries |
| `ANALISE-MEDICAO-FAIXAS-VALORES-ZERADOS-GOIANIA.md` | Análise técnica do problema |
| `Guia-Calculo-Medicao.pdf` | Manual completo de cálculo |

---

## 🆘 Suporte

**Dúvidas?**
1. Execute a query de diagnóstico da Etapa 3.1
2. Cole o resultado completo
3. Informe qual linha está com problema
4. Informaremos a solução específica

---

**Documento criado em:** 18/06/2026  
**Última atualização:** 18/06/2026  
**Versão:** 1.0
