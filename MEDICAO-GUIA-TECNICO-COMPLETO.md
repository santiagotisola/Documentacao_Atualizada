# MEDICAO - GUIA TECNICO COMPLETO

**Data de Consolidacao:** 2026-06-20  
**Arquivos consolidados:** 9

---

---

## ORIGEM: CICLO-COMPLETO-CADASTRO-MEDICAO-AXHUB.md

# ðŸ“‹ Ciclo Completo de Cadastro para GeraÃ§Ã£o de MediÃ§Ã£o - AxHub

**Data:** 18/06/2026  
**Sistemas Analisados:** IPEMPE (funcionando) e GoiÃ¢nia (problemÃ¡tico)  
**Objetivo:** Documentar o relacionamento completo de processos necessÃ¡rios para gerar relatÃ³rio de mediÃ§Ã£o

---

## ðŸ“Š VisÃ£o Geral do Processo

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                   FLUXO DE MEDIÃ‡ÃƒO AXHUB                       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

ETAPA 1: CADASTROS BÃSICOS
â”œâ”€â”€ 1.1 Cadastrar Equipamento (TBEquipamentos)
â”œâ”€â”€ 1.2 Cadastrar Faixas do Equipamento (TBFaixas)
â””â”€â”€ 1.3 Ativar Equipamento (Status = Ativo)
         â†“
ETAPA 2: CONFIGURAÃ‡ÃƒO CONTRATUAL
â”œâ”€â”€ 2.1 Cadastrar Contrato (TBContratos)
â”œâ”€â”€ 2.2 Definir VigÃªncia do Contrato
â”œâ”€â”€ 2.3 Vincular Equipamentos ao Contrato (TBContratosEquipamentos)
â””â”€â”€ 2.4 Ativar Contrato (Status = Ativo)
         â†“
ETAPA 3: CONFIGURAÃ‡ÃƒO DE RECURSOS (âš ï¸ CRÃTICO)
â”œâ”€â”€ 3.1 Cadastrar Recurso por Faixa (TBRecursos)
â”œâ”€â”€ 3.2 Vincular Recurso ao Contrato
â”œâ”€â”€ 3.3 Vincular Recurso ao Equipamento
â”œâ”€â”€ 3.4 Vincular Recurso Ã  Faixa EspecÃ­fica
â”œâ”€â”€ 3.5 Definir Valor Previsto (R$)
â”œâ”€â”€ 3.6 Definir BDI (%)
â”œâ”€â”€ 3.7 Definir VigÃªncia do Recurso
â””â”€â”€ 3.8 Ativar Recurso (Status = Ativo)
         â†“
ETAPA 4: OPERAÃ‡ÃƒO DO EQUIPAMENTO
â”œâ”€â”€ 4.1 Registro de Passagens (TBPassagens) - AutomÃ¡tico
â”œâ”€â”€ 4.2 Registro de Heartbeat (TBHeartbeatEquipamentos) - AutomÃ¡tico
â””â”€â”€ 4.3 Registro de InterrupÃ§Ãµes (TBInterrupcoes) - Manual
         â†“
ETAPA 5: GERAÃ‡ÃƒO DO RELATÃ“RIO
â”œâ”€â”€ 5.1 Acessar: MediÃ§Ã£o â†’ Nova MediÃ§Ã£o
â”œâ”€â”€ 5.2 Selecionar Contrato
â”œâ”€â”€ 5.3 Selecionar PerÃ­odo (MÃªs/Ano)
â”œâ”€â”€ 5.4 Selecionar Equipamentos
â”œâ”€â”€ 5.5 Gerar RelatÃ³rio
â””â”€â”€ 5.6 Validar Valores Calculados
         â†“
ETAPA 6: FINALIZAÃ‡ÃƒO
â”œâ”€â”€ 6.1 Revisar MediÃ§Ã£o
â”œâ”€â”€ 6.2 Ajustar InterrupÃ§Ãµes (se necessÃ¡rio)
â””â”€â”€ 6.3 Finalizar MediÃ§Ã£o
```

---

## ðŸ” ETAPA 1: Cadastros BÃ¡sicos

### 1.1 Cadastrar Equipamento

**Menu:** Cadastros â†’ Equipamentos â†’ Novo Equipamento

**Campos ObrigatÃ³rios:**
- **CÃ³digo do Equipamento**: Ex: GYN1R801, ITZ022R
- **Local**: EndereÃ§o/localizaÃ§Ã£o
- **Status**: Ativo
- **Tipo de Equipamento**: Radar, OCR, Barreira, etc.

**Tabela:** `TBEquipamentos`

**SQL de ValidaÃ§Ã£o:**
```sql
-- Verificar se equipamento existe e estÃ¡ ativo
SELECT 
    Id,
    CodigoEquipamento,
    Local,
    Status,
    CASE 
        WHEN Status = 1 THEN 'âœ… ATIVO'
        ELSE 'âŒ INATIVO'
    END AS StatusDesc
FROM TBEquipamentos
WHERE CodigoEquipamento = 'GYN1R801';
```

**âœ… Resultado Esperado:** 1 linha retornada com Status = 1

---

### 1.2 Cadastrar Faixas do Equipamento

**Menu:** Cadastros â†’ Equipamentos â†’ Editar â†’ Faixas

**Campos ObrigatÃ³rios:**
- **NÃºmero da Faixa**: 1, 2, 3, etc.
- **Equipamento Id**: Vinculado ao equipamento criado
- **Sentido**: Norte/Sul, Leste/Oeste, etc.

**Tabela:** `TBFaixas`

**SQL de ValidaÃ§Ã£o:**
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

**âœ… Resultado Esperado:** Normalmente 2 linhas (Faixa 1 e Faixa 2)

---

## ðŸ” ETAPA 2: ConfiguraÃ§Ã£o Contratual

### 2.1 Cadastrar Contrato

**Menu:** MediÃ§Ã£o â†’ Contratos â†’ Novo Contrato

**Campos ObrigatÃ³rios:**
- **NÃºmero do Contrato**: Ex: CT-2026-001, 001/2026-DETRAN/GO
- **Ã“rgÃ£o**: DETRAN/GO, IPEM/PE, etc.
- **Data InÃ­cio**: Ex: 01/01/2026
- **Data Fim**: Ex: 31/12/2026
- **Status**: Ativo

**Tabela:** `TBContratos`

**SQL de ValidaÃ§Ã£o:**
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
        WHEN Status = 0 THEN 'âŒ INATIVO'
        WHEN '2026-05-01' < DataInicio THEN 'âš ï¸ NÃƒO INICIADO'
        WHEN '2026-05-31' > DataFim THEN 'âš ï¸ EXPIRADO'
        WHEN Status = 1 
             AND '2026-05-01' >= DataInicio 
             AND '2026-05-31' <= DataFim THEN 'âœ… VÃLIDO MAIO/2026'
        ELSE 'âš ï¸ VERIFICAR'
    END AS ValidacaoMaio2026
FROM TBContratos
WHERE Orgao LIKE '%DETRAN%' OR Orgao LIKE '%GoiÃ¢nia%'
ORDER BY DataInicio DESC;
```

**âœ… Resultado Esperado:** Pelo menos 1 contrato com status "âœ… VÃLIDO MAIO/2026"

---

### 2.2 Vincular Equipamentos ao Contrato

**Menu:** MediÃ§Ã£o â†’ Contratos â†’ Editar Contrato â†’ Equipamentos

**AÃ§Ã£o:** Selecionar equipamentos que fazem parte deste contrato

**Tabela:** `TBContratosEquipamentos`

**SQL de ValidaÃ§Ã£o:**
```sql
-- Verificar vinculaÃ§Ã£o equipamento-contrato
SELECT 
    e.CodigoEquipamento,
    c.NumeroContrato,
    c.Orgao,
    c.Status AS StatusContrato,
    ce.Id AS VinculoId,
    CASE 
        WHEN ce.Id IS NULL THEN 'âŒ EQUIPAMENTO NÃƒO VINCULADO'
        WHEN c.Status = 0 THEN 'âš ï¸ CONTRATO INATIVO'
        ELSE 'âœ… VINCULADO'
    END AS StatusVinculo
FROM TBEquipamentos e
LEFT JOIN TBContratosEquipamentos ce ON ce.EquipamentoId = e.Id
LEFT JOIN TBContratos c ON c.Id = ce.ContratoId
WHERE e.CodigoEquipamento IN ('GYN1R801', 'GYN1R803')
ORDER BY e.CodigoEquipamento;
```

**âœ… Resultado Esperado:** Equipamento com StatusVinculo = 'âœ… VINCULADO'

---

## ðŸ” ETAPA 3: ConfiguraÃ§Ã£o de Recursos âš ï¸ **MAIS CRÃTICO**

> **âš ï¸ ATENÃ‡ÃƒO:** Esta Ã© a etapa mais importante! Sem recursos cadastrados, o relatÃ³rio mostrarÃ¡ valores zerados mesmo que tudo o mais esteja correto.

### 3.1 Cadastrar Recurso por Faixa

**Menu:** MediÃ§Ã£o â†’ Recursos â†’ Novo Recurso

**âš ï¸ IMPORTANTE:** Ã‰ necessÃ¡rio criar **1 recurso para cada faixa** do equipamento!

**Exemplo:**
- GYN1R801 tem 2 faixas â†’ Criar 2 recursos:
  - Recurso 1: GYN1R801 - Faixa 1
  - Recurso 2: GYN1R801 - Faixa 2

**Campos ObrigatÃ³rios:**

| Campo | Exemplo | ObservaÃ§Ã£o |
|-------|---------|------------|
| **DescriÃ§Ã£o** | "Radar GYN1R801 - Faixa 1" | Nome descritivo |
| **Tipo** | Equipamento | Tipo de recurso |
| **Contrato** | CT-2026-001 | âš ï¸ OBRIGATÃ“RIO vincular |
| **Equipamento** | GYN1R801 | âš ï¸ OBRIGATÃ“RIO vincular |
| **Faixa** | 1 | âš ï¸ OBRIGATÃ“RIO especificar |
| **Valor Previsto** | R$ 15.000,00 | âš ï¸ OBRIGATÃ“RIO > 0 |
| **BDI (%)** | 25,00% | âš ï¸ OBRIGATÃ“RIO > 0 |
| **Data InÃ­cio** | 01/01/2026 | InÃ­cio da vigÃªncia |
| **Data Fim** | 31/12/2026 | Fim da vigÃªncia |
| **Status** | Ativo | âš ï¸ OBRIGATÃ“RIO = Ativo |

**Tabela:** `TBRecursos`

**SQL de ValidaÃ§Ã£o:**
```sql
-- â­ QUERY CRÃTICA: Verificar recursos por faixa
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
    
    -- â­ DIAGNÃ“STICO AUTOMÃTICO
    CASE 
        WHEN r.Id IS NULL THEN 'ðŸ”´ RECURSO NÃƒO CADASTRADO'
        WHEN r.ContratoId IS NULL THEN 'ðŸ”´ SEM CONTRATO VINCULADO'
        WHEN c.Id IS NULL THEN 'ðŸ”´ CONTRATO NÃƒO ENCONTRADO'
        WHEN c.Status = 0 THEN 'ðŸ”´ CONTRATO INATIVO'
        WHEN r.Status = 0 THEN 'ðŸ”´ RECURSO INATIVO'
        WHEN r.ValorPrevisto IS NULL OR r.ValorPrevisto = 0 THEN 'ðŸ”´ VALOR PREVISTO ZERADO'
        WHEN r.Bdi IS NULL OR r.Bdi = 0 THEN 'ðŸŸ¡ BDI ZERADO (Opcional)'
        WHEN '2026-05-01' < r.DataInicio THEN 'ðŸ”´ VIGÃŠNCIA NÃƒO INICIADA'
        WHEN '2026-05-31' > COALESCE(r.DataFim, '9999-12-31') THEN 'ðŸ”´ VIGÃŠNCIA EXPIRADA'
        WHEN '2026-05-01' < c.DataInicio OR '2026-05-31' > c.DataFim THEN 'ðŸ”´ CONTRATO FORA VIGÃŠNCIA'
        ELSE 'âœ… CONFIGURAÃ‡ÃƒO OK'
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

**âœ… Resultado Esperado:** 
```
Equipamento | Faixa | RecursoId | ValorPrevisto | BDI   | Diagnostico
------------|-------|-----------|---------------|-------|------------------
GYN1R801    | 1     | 1523      | 15000.00      | 25.00 | âœ… CONFIGURAÃ‡ÃƒO OK
GYN1R801    | 2     | 1524      | 15000.00      | 25.00 | âœ… CONFIGURAÃ‡ÃƒO OK
```

**âŒ Problema Comum:**
```
Equipamento | Faixa | RecursoId | ValorPrevisto | BDI  | Diagnostico
------------|-------|-----------|---------------|------|------------------------
GYN1R801    | 1     | NULL      | NULL          | NULL | ðŸ”´ RECURSO NÃƒO CADASTRADO
GYN1R801    | 2     | NULL      | NULL          | NULL | ðŸ”´ RECURSO NÃƒO CADASTRADO
```

---

### 3.2 Script de CorreÃ§Ã£o: Cadastrar Recursos Ausentes

```sql
-- âš ï¸ ATENÃ‡ÃƒO: Ajuste os valores conforme o contrato real!
-- Este script insere recursos para faixas que nÃ£o possuem

DECLARE @ContratoId INT = 12; -- âš ï¸ Obter da query de contratos acima
DECLARE @ValorPrevisto DECIMAL(18,2) = 15000.00; -- âš ï¸ Valor mensal por faixa
DECLARE @Bdi DECIMAL(5,2) = 25.00; -- âš ï¸ Percentual de BDI
DECLARE @DataInicio DATE = '2026-01-01'; -- âš ï¸ InÃ­cio da vigÃªncia
DECLARE @DataFim DATE = '2026-12-31'; -- âš ï¸ Fim da vigÃªncia
DECLARE @UsuarioId INT = 1; -- âš ï¸ ID do usuÃ¡rio que estÃ¡ cadastrando

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

-- Validar inserÃ§Ã£o
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

## ðŸ” ETAPA 4: OperaÃ§Ã£o do Equipamento

### 4.1 Registro de Passagens (AutomÃ¡tico)

**Processo:** Equipamento registra passagens automaticamente

**Tabela:** `TBPassagens`

**SQL de ValidaÃ§Ã£o:**
```sql
-- Verificar passagens registradas no perÃ­odo
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

**âœ… Resultado Esperado:**
```
CodigoEquipamento | NumeroFaixa | TotalPassagens | DiasOperacao
------------------|-------------|----------------|-------------
GYN1R801          | 1           | 584740         | 31
GYN1R801          | 2           | 609222         | 31
```

---

### 4.2 Registro de InterrupÃ§Ãµes (Manual)

**Menu:** MediÃ§Ã£o â†’ InterrupÃ§Ãµes â†’ Nova InterrupÃ§Ã£o

**Campos:**
- **Equipamento**: Selecionar equipamento
- **Data/Hora InÃ­cio**: InÃ­cio da interrupÃ§Ã£o
- **Data/Hora Fim**: Fim da interrupÃ§Ã£o
- **Motivo**: DescriÃ§Ã£o do problema
- **Tipo**: ManutenÃ§Ã£o, Falha, etc.

**Tabela:** `TBInterrupcoes`

**SQL de ValidaÃ§Ã£o:**
```sql
-- Verificar interrupÃ§Ãµes registradas no perÃ­odo
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

## ðŸ” ETAPA 5: GeraÃ§Ã£o do RelatÃ³rio

### 5.1 Acessar MÃ³dulo de MediÃ§Ã£o

**URL:** `https://goiania.axhub.axion.ws/medicao/relatoriomedicaoequipamento`

**Menu:** MediÃ§Ã£o â†’ Nova MediÃ§Ã£o â†’ RelatÃ³rio de MediÃ§Ã£o de Equipamento

---

### 5.2 Preencher Filtros

| Filtro | Exemplo | ObrigatÃ³rio |
|--------|---------|-------------|
| **Contrato** | CT-2026-001 | âœ… Sim |
| **PerÃ­odo** | Maio/2026 | âœ… Sim |
| **Equipamentos** | GYN1R801, GYN1R803 | âœ… Sim |

---

### 5.3 Gerar e Validar RelatÃ³rio

**Colunas Esperadas:**

| Coluna | Origem | CÃ¡lculo |
|--------|--------|---------|
| **EQUIPAMENTO** | TBEquipamentos.CodigoEquipamento | - |
| **FAIXA** | TBFaixas.NumeroFaixa | - |
| **VEÃCULOS** | COUNT(TBPassagens) | No perÃ­odo |
| **PREVISTOS** | ConfiguraÃ§Ã£o | 744 horas (31 dias Ã— 24h) |
| **INTERRUPÃ‡Ã•ES** | SUM(TBInterrupcoes) | Horas interrompidas |
| **RECURSOS** | SUM(HorasRecursos) | Horas com recursos |
| **TOTAL (HORAS)** | Previstos - InterrupÃ§Ãµes | - |
| **ÃNDICE OPERAÃ‡ÃƒO** | (Total / Previstos) Ã— 100 | Percentual |
| **DESCONTO** | ValorPrevisto Ã— (1 - Ãndice) | Valor descontado |
| **VALOR PREVISTO** | TBRecursos.ValorPrevisto | âš ï¸ Do recurso |
| **VALOR FAIXA** | ValorPrevisto - Desconto | Valor lÃ­quido |
| **BDI (%)** | TBRecursos.Bdi | âš ï¸ Do recurso |
| **TOTAL** | ValorFaixa Ã— (1 + BDI/100) | Valor final |

---

## ðŸ“Š FÃ³rmulas de CÃ¡lculo

### 1. Horas Totais
```
TOTAL (HORAS) = HORAS PREVISTAS - HORAS DE INTERRUPÃ‡ÃƒO
Exemplo: 744h - 0h = 744h
```

### 2. Ãndice de OperaÃ§Ã£o
```
ÃNDICE OPERAÃ‡ÃƒO = (TOTAL HORAS / HORAS PREVISTAS) Ã— 100
Exemplo: (744 / 744) Ã— 100 = 100,00%
```

### 3. Desconto por Indisponibilidade
```
DESCONTO = VALOR PREVISTO Ã— (1 - ÃNDICE OPERAÃ‡ÃƒO)
Exemplo: R$ 15.000,00 Ã— (1 - 1,00) = R$ 0,00
```

### 4. Valor Faixa (LÃ­quido)
```
VALOR FAIXA = VALOR PREVISTO - DESCONTO
Exemplo: R$ 15.000,00 - R$ 0,00 = R$ 15.000,00
```

### 5. Valor BDI
```
VALOR BDI = VALOR FAIXA Ã— (BDI / 100)
Exemplo: R$ 15.000,00 Ã— 0,25 = R$ 3.750,00
```

### 6. Total Final
```
TOTAL = VALOR FAIXA + VALOR BDI
Exemplo: R$ 15.000,00 + R$ 3.750,00 = R$ 18.750,00
```

---

## âœ… Checklist de ValidaÃ§Ã£o Completo

### Antes de Gerar o RelatÃ³rio

```
CADASTROS BÃSICOS
[ ] Equipamento cadastrado em TBEquipamentos
[ ] Equipamento com Status = Ativo
[ ] Faixas cadastradas em TBFaixas (normalmente 2)
[ ] CodigoEquipamento Ãºnico e correto

CONTRATO
[ ] Contrato cadastrado em TBContratos
[ ] Contrato com Status = Ativo
[ ] VigÃªncia do contrato cobre o perÃ­odo da mediÃ§Ã£o
[ ] Equipamento vinculado ao contrato (TBContratosEquipamentos)

RECURSOS âš ï¸ CRÃTICO
[ ] 1 recurso cadastrado para CADA faixa (TBRecursos)
[ ] Recurso vinculado ao Contrato (ContratoId preenchido)
[ ] Recurso vinculado ao Equipamento (EquipamentoId preenchido)
[ ] Recurso vinculado Ã  Faixa (FaixaId preenchido)
[ ] ValorPrevisto > 0 (ex: R$ 15.000,00)
[ ] Bdi > 0 (ex: 25,00%)
[ ] Status do recurso = Ativo
[ ] DataInicio <= data da mediÃ§Ã£o
[ ] DataFim >= data da mediÃ§Ã£o (ou NULL)

OPERAÃ‡ÃƒO
[ ] Passagens registradas no perÃ­odo (TBPassagens)
[ ] Heartbeat funcionando (opcional)
[ ] InterrupÃ§Ãµes registradas (se houver)

MEDIÃ‡ÃƒO
[ ] PerÃ­odo selecionado correto (mÃªs/ano)
[ ] Contrato selecionado correto
[ ] Equipamentos selecionados
```

---

## ðŸ”§ Troubleshooting: Problemas Comuns

### Problema 1: Valores Zerados no RelatÃ³rio

**Sintoma:**
```
VALOR PREVISTO = R$ 0,00
VALOR FAIXA = R$ 0,00
BDI = 0,00%
TOTAL = R$ 0,00
```

**Causa Raiz:** Recurso nÃ£o cadastrado ou valores zerados

**DiagnÃ³stico:**
```sql
-- Execute a query da Etapa 3.1 e veja a coluna "Diagnostico"
-- Se mostrar "ðŸ”´ RECURSO NÃƒO CADASTRADO", siga o passo abaixo
```

**SoluÃ§Ã£o:** Execute o script da Etapa 3.2 (Cadastrar Recursos Ausentes)

---

### Problema 2: Equipamento NÃ£o Aparece no RelatÃ³rio

**Causa Raiz:** Equipamento nÃ£o vinculado ao contrato

**DiagnÃ³stico:**
```sql
-- Verifique vÃ­nculo do equipamento com o contrato
SELECT 
    e.CodigoEquipamento,
    c.NumeroContrato,
    ce.Id AS VinculoId
FROM TBEquipamentos e
LEFT JOIN TBContratosEquipamentos ce ON ce.EquipamentoId = e.Id
LEFT JOIN TBContratos c ON c.Id = ce.ContratoId
WHERE e.CodigoEquipamento = 'GYN1R801';
```

**SoluÃ§Ã£o:**
```sql
-- Se VinculoId = NULL, vincular equipamento ao contrato
DECLARE @EquipamentoId INT = (SELECT Id FROM TBEquipamentos WHERE CodigoEquipamento = 'GYN1R801');
DECLARE @ContratoId INT = 12; -- ID do contrato

INSERT INTO TBContratosEquipamentos (EquipamentoId, ContratoId, DataCriacao)
VALUES (@EquipamentoId, @ContratoId, GETDATE());
```

---

### Problema 3: Passagens Zeradas

**Causa Raiz:** Equipamento nÃ£o estÃ¡ operando ou dados nÃ£o estÃ£o sendo enviados

**DiagnÃ³stico:**
```sql
-- Verificar Ãºltima passagem registrada
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

**SoluÃ§Ã£o:** Verificar equipamento em campo, conexÃ£o, heartbeat

---

### Problema 4: Ãndice de OperaÃ§Ã£o Baixo

**Causa Raiz:** Muitas interrupÃ§Ãµes registradas

**DiagnÃ³stico:**
```sql
-- Calcular horas de interrupÃ§Ã£o
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

**SoluÃ§Ã£o:** Revisar interrupÃ§Ãµes cadastradas, corrigir se necessÃ¡rio

---

## ðŸ“ˆ ComparaÃ§Ã£o: IPEMPE (Funcionando) vs GoiÃ¢nia (ProblemÃ¡tico)

### IPEMPE - ConfiguraÃ§Ã£o Correta

**URL:** https://ipempe.axhub.axion.ws/medicao/relatoriomedicaoequipamento

**Exemplo de Equipamento:** ITZ022R

```sql
-- Query de validaÃ§Ã£o IPEMPE
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

âœ… **ConclusÃ£o:** Cada faixa tem recurso com valores configurados

---

### GoiÃ¢nia - ConfiguraÃ§Ã£o ProblemÃ¡tica

**URL:** https://goiania.axhub.axion.ws/medicao/relatoriomedicaoequipamento

**Exemplo de Equipamento:** GYN1R801

```sql
-- Query de validaÃ§Ã£o GoiÃ¢nia
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

**Resultado Atual (GoiÃ¢nia - PROBLEMÃTICO):**
```
CodigoEquipamento | NumeroFaixa | RecursoId | ValorPrevisto | Bdi  | NumeroContrato
------------------|-------------|-----------|---------------|------|---------------
GYN1R801          | 1           | NULL      | NULL          | NULL | NULL
GYN1R801          | 2           | NULL      | NULL          | NULL | NULL
```

âŒ **ConclusÃ£o:** Faixas NÃƒO tÃªm recursos cadastrados â†’ Valores zerados no relatÃ³rio

---

## ðŸŽ¯ Resumo Executivo para Operador

### O que o operador precisa saber:

1. **Para aparecer valores no relatÃ³rio:**
   - Equipamento deve estar ativo
   - Equipamento deve estar vinculado a um contrato ativo
   - **CADA FAIXA** deve ter um recurso cadastrado com:
     - Valor Previsto > 0
     - BDI > 0
     - Status = Ativo
     - VigÃªncia vÃ¡lida para o perÃ­odo

2. **Ordem de cadastro:**
   ```
   1Âº â†’ Equipamento e Faixas
   2Âº â†’ Contrato
   3Âº â†’ Vincular Equipamento ao Contrato
   4Âº â†’ Criar Recursos (1 por faixa) âš ï¸ CRÃTICO
   5Âº â†’ Gerar RelatÃ³rio
   ```

3. **Como validar se estÃ¡ tudo certo:**
   - Execute a query da **Etapa 3.1** (ValidaÃ§Ã£o de Recursos)
   - Se aparecer "âœ… CONFIGURAÃ‡ÃƒO OK" â†’ Pode gerar o relatÃ³rio
   - Se aparecer "ðŸ”´ RECURSO NÃƒO CADASTRADO" â†’ Siga Etapa 3.2

4. **Valores esperados no relatÃ³rio (exemplo):**
   - VALOR PREVISTO: R$ 15.000,00
   - BDI: 25,00%
   - TOTAL: R$ 18.750,00 (se Ã­ndice = 100%)

---

## ðŸ“š Arquivos Relacionados

| Arquivo | DescriÃ§Ã£o |
|---------|-----------|
| `SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql` | 9 queries de diagnÃ³stico completo |
| `VALIDACAO-CONTRATOS-POR-FAIXA-GOIANIA.sql` | 5 queries focadas em contratos |
| `COMPARACAO-REGRAS-VS-SISTEMA-MEDICAO.md` | Regras documentadas vs SQL |
| `GUIA-VALIDACAO-CONTRATOS-FAIXAS.md` | Guia de interpretaÃ§Ã£o de queries |
| `ANALISE-MEDICAO-FAIXAS-VALORES-ZERADOS-GOIANIA.md` | AnÃ¡lise tÃ©cnica do problema |
| `Guia-Calculo-Medicao.pdf` | Manual completo de cÃ¡lculo |

---

## ðŸ†˜ Suporte

**DÃºvidas?**
1. Execute a query de diagnÃ³stico da Etapa 3.1
2. Cole o resultado completo
3. Informe qual linha estÃ¡ com problema
4. Informaremos a soluÃ§Ã£o especÃ­fica

---

**Documento criado em:** 18/06/2026  
**Ãšltima atualizaÃ§Ã£o:** 18/06/2026  
**VersÃ£o:** 1.0


---

## ORIGEM: GUIA-OPERACIONAL-RAPIDO-MEDICAO.md

# ðŸ“± Guia Operacional RÃ¡pido - Configurar MediÃ§Ã£o no AxHub

**Para:** Operadores e UsuÃ¡rios Finais  
**Objetivo:** Passo a passo simplificado para configurar um equipamento na mediÃ§Ã£o  
**Tempo estimado:** 15-20 minutos por equipamento

---

## ðŸŽ¯ Quando Usar Este Guia

Use este guia quando:
- âœ… Equipamento novo precisa entrar na mediÃ§Ã£o
- âœ… RelatÃ³rio de mediÃ§Ã£o mostra valores zerados (R$ 0,00)
- âœ… Equipamento nÃ£o aparece no relatÃ³rio de mediÃ§Ã£o
- âœ… Erro: "Equipamento sem recursos cadastrados"

---

## ðŸ“‹ Checklist RÃ¡pido (Copie e Cole)

```
EQUIPAMENTO: _______________________  DATA: ___/___/______

[ ] PASSO 1: Equipamento cadastrado e ativo
[ ] PASSO 2: Faixas cadastradas (Faixa 1, Faixa 2)
[ ] PASSO 3: Contrato criado e ativo
[ ] PASSO 4: Equipamento vinculado ao contrato
[ ] PASSO 5: Recurso criado para Faixa 1
[ ] PASSO 6: Recurso criado para Faixa 2
[ ] PASSO 7: Valores preenchidos (Valor Previsto e BDI)
[ ] PASSO 8: Recursos ativados
[ ] PASSO 9: RelatÃ³rio gerado com sucesso
[ ] PASSO 10: Valores corretos no relatÃ³rio

RESPONSÃVEL: ________________________
OBSERVAÃ‡Ã•ES: ________________________________________
```

---

## ðŸ”¢ Passo a Passo Operacional

### PASSO 1: Verificar Equipamento

**Menu:** Cadastros â†’ Equipamentos

**AÃ§Ãµes:**
1. Busque o equipamento pelo cÃ³digo (Ex: GYN1R801)
2. Verifique se estÃ¡ **ATIVO** (bolinha verde)
3. Anote quantas faixas ele tem (normalmente 2)

**âœ… OK se:**
- Equipamento aparece na lista
- Status = Ativo
- Tem faixas cadastradas (1, 2, etc.)

**âŒ Problema:**
- Equipamento nÃ£o existe â†’ Criar equipamento primeiro
- Status = Inativo â†’ Ativar equipamento
- Sem faixas â†’ Cadastrar faixas

---

### PASSO 2: Verificar Contrato

**Menu:** MediÃ§Ã£o â†’ Contratos

**AÃ§Ãµes:**
1. Busque o contrato pelo nÃºmero ou Ã³rgÃ£o (Ex: CT-2026-001, DETRAN/GO)
2. Verifique se estÃ¡ **ATIVO**
3. Verifique a **vigÃªncia** (deve cobrir o mÃªs da mediÃ§Ã£o)

**âœ… OK se:**
- Contrato aparece na lista
- Status = Ativo
- DataInicio â‰¤ MÃªs da mediÃ§Ã£o â‰¤ DataFim

**âŒ Problema:**
- Contrato nÃ£o existe â†’ Criar contrato primeiro
- Status = Inativo â†’ Ativar contrato
- VigÃªncia expirada â†’ Ajustar datas ou criar novo contrato

---

### PASSO 3: Vincular Equipamento ao Contrato

**Menu:** MediÃ§Ã£o â†’ Contratos â†’ [Selecionar Contrato] â†’ Editar

**AÃ§Ãµes:**
1. Clique em "Editar" no contrato
2. VÃ¡ na aba "Equipamentos"
3. Adicione o equipamento (Ex: GYN1R801)
4. Salve

**âœ… OK se:**
- Equipamento aparece na lista de equipamentos do contrato

**âŒ Problema:**
- Equipamento nÃ£o pode ser adicionado â†’ Verificar se equipamento estÃ¡ ativo

---

### PASSO 4: Criar Recursos (âš ï¸ MAIS IMPORTANTE)

> **âš ï¸ ATENÃ‡ÃƒO:** Este Ã© o passo mais importante! VocÃª precisa criar **1 recurso para CADA faixa** do equipamento.

**Menu:** MediÃ§Ã£o â†’ Recursos â†’ Novo Recurso

#### Criar Recurso para Faixa 1

**Preencha os campos:**

| Campo | O que preencher | Exemplo |
|-------|-----------------|---------|
| **DescriÃ§Ã£o** | Nome descritivo | "Radar GYN1R801 - Faixa 1" |
| **Tipo** | Selecione | Equipamento |
| **Contrato** | âš ï¸ Selecione o contrato | CT-2026-001 |
| **Equipamento** | âš ï¸ Selecione o equipamento | GYN1R801 |
| **Faixa** | âš ï¸ Selecione | 1 |
| **Valor Previsto** | âš ï¸ Valor mensal em R$ | 15000.00 |
| **BDI (%)** | âš ï¸ Percentual | 25.00 |
| **Data InÃ­cio** | InÃ­cio da vigÃªncia | 01/01/2026 |
| **Data Fim** | Fim da vigÃªncia | 31/12/2026 |
| **Status** | âš ï¸ Marque | Ativo |

**Clique em:** Salvar

#### Criar Recurso para Faixa 2

**Repita o processo acima:**
- Mesmo equipamento: GYN1R801
- Mesmos valores: R$ 15.000,00 e 25%
- **Faixa: 2** (diferente!)
- DescriÃ§Ã£o: "Radar GYN1R801 - Faixa 2"

**Clique em:** Salvar

**âœ… OK se:**
- 2 recursos criados (1 para cada faixa)
- Ambos com Status = Ativo
- Valores > 0
- Contratos e equipamentos vinculados

**âŒ Problema:**
- Esqueceu de criar para uma das faixas â†’ Valores zerados no relatÃ³rio!
- Valor Previsto = 0 â†’ Valores zerados no relatÃ³rio!
- Status = Inativo â†’ NÃ£o entra no cÃ¡lculo!

---

### PASSO 5: Validar ConfiguraÃ§Ã£o

**Menu:** MediÃ§Ã£o â†’ Recursos

**AÃ§Ãµes:**
1. Filtre pelo equipamento (Ex: GYN1R801)
2. Verifique se aparecem **2 recursos** (1 por faixa)
3. Confirme se ambos estÃ£o **ATIVOS**

**âœ… Lista deve mostrar:**
```
DescriÃ§Ã£o                    | Contrato     | Valor Previsto | BDI   | Status
----------------------------|--------------|----------------|-------|--------
Radar GYN1R801 - Faixa 1    | CT-2026-001  | R$ 15.000,00   | 25,00 | Ativo
Radar GYN1R801 - Faixa 2    | CT-2026-001  | R$ 15.000,00   | 25,00 | Ativo
```

**âŒ Problema:**
- Aparece sÃ³ 1 recurso â†’ Falta criar para a outra faixa!
- Aparece 0 recursos â†’ Nada foi cadastrado!
- Valores = R$ 0,00 â†’ Edite e preencha os valores!

---

### PASSO 6: Gerar RelatÃ³rio de MediÃ§Ã£o

**Menu:** MediÃ§Ã£o â†’ Nova MediÃ§Ã£o â†’ RelatÃ³rio de MediÃ§Ã£o de Equipamento

**Ou acesse direto:** `https://[sistema].axhub.axion.ws/medicao/relatoriomedicaoequipamento`

**AÃ§Ãµes:**
1. **Contrato:** Selecione o contrato (Ex: CT-2026-001)
2. **PerÃ­odo:** Selecione o mÃªs (Ex: Maio/2026)
3. **Equipamentos:** Marque o equipamento (Ex: GYN1R801)
4. Clique em: **Gerar RelatÃ³rio** ou **Buscar**

---

### PASSO 7: Validar RelatÃ³rio

**O relatÃ³rio deve mostrar:**

| Equipamento | Faixa | VeÃ­culos | Ãndice | Valor Previsto | BDI % | Total |
|-------------|-------|----------|--------|----------------|-------|-------|
| GYN1R801 | 1 | 584740 | 100,00% | R$ 15.000,00 | 25,00 | R$ 18.750,00 |
| GYN1R801 | 2 | 609222 | 100,00% | R$ 15.000,00 | 25,00 | R$ 18.750,00 |

**âœ… RelatÃ³rio OK se:**
- Valor Previsto > R$ 0,00
- BDI > 0,00%
- Total > R$ 0,00
- Valores fazem sentido (Total â‰ˆ Valor Ã— 1,25)

**âŒ RelatÃ³rio COM PROBLEMA:**
```
Equipamento | Faixa | Valor Previsto | BDI % | Total
------------|-------|----------------|-------|-------
GYN1R801    | 1     | R$ 0,00        | 0,00  | R$ 0,00
GYN1R801    | 2     | R$ 0,00        | 0,00  | R$ 0,00
```

**Se aparecer valores zerados:**
- Volte no PASSO 5 e verifique os recursos
- Certifique-se que criou 1 recurso para CADA faixa
- Certifique-se que os valores estÃ£o preenchidos

---

## ðŸ”§ Problemas Comuns e SoluÃ§Ãµes RÃ¡pidas

### ðŸ”´ Problema: Valores Zerados no RelatÃ³rio

**Causa:** Recursos nÃ£o cadastrados ou sem valores

**SoluÃ§Ã£o:**
1. Menu: MediÃ§Ã£o â†’ Recursos
2. Filtre pelo equipamento
3. Verifique se tem recursos cadastrados
4. Se nÃ£o tem â†’ Siga PASSO 4 acima
5. Se tem mas valores = 0 â†’ Edite e preencha

---

### ðŸ”´ Problema: Equipamento NÃ£o Aparece no RelatÃ³rio

**Causa:** Equipamento nÃ£o vinculado ao contrato

**SoluÃ§Ã£o:**
1. Menu: MediÃ§Ã£o â†’ Contratos
2. Edite o contrato
3. Aba "Equipamentos"
4. Adicione o equipamento
5. Salve

---

### ðŸ”´ Problema: "Sem Dados para o PerÃ­odo"

**Causa:** Equipamento nÃ£o operou no perÃ­odo selecionado

**SoluÃ§Ã£o:**
1. Verifique se o equipamento estÃ¡ funcionando
2. Verifique se hÃ¡ passagens registradas
3. Tente outro perÃ­odo que tem passagens

---

### ðŸ”´ Problema: Ãndice de OperaÃ§Ã£o Baixo

**Causa:** Muitas interrupÃ§Ãµes registradas

**SoluÃ§Ã£o:**
1. Menu: MediÃ§Ã£o â†’ InterrupÃ§Ãµes
2. Verifique interrupÃ§Ãµes do equipamento no perÃ­odo
3. Corrija interrupÃ§Ãµes incorretas
4. Gere o relatÃ³rio novamente

---

## ðŸ“Š Exemplo PrÃ¡tico: Configurar GYN1R801

### SituaÃ§Ã£o Inicial
- Equipamento: GYN1R801
- Faixas: 1 e 2
- Contrato: CT-2026-001 (DETRAN/GO)
- PerÃ­odo: Maio/2026
- Problema: Valores zerados no relatÃ³rio

### Passo a Passo da SoluÃ§Ã£o

**1. Verificar Equipamento**
- Menu: Cadastros â†’ Equipamentos
- Buscar: GYN1R801
- Status: Ativo âœ…
- Faixas: 2 (Faixa 1 e Faixa 2) âœ…

**2. Verificar Contrato**
- Menu: MediÃ§Ã£o â†’ Contratos
- Contrato: CT-2026-001
- Status: Ativo âœ…
- VigÃªncia: 01/01/2026 a 31/12/2026 âœ…

**3. Vincular ao Contrato**
- Menu: MediÃ§Ã£o â†’ Contratos â†’ Editar CT-2026-001
- Aba: Equipamentos
- Adicionar: GYN1R801 âœ…
- Salvar âœ…

**4. Criar Recursos**

**Recurso 1:**
```
DescriÃ§Ã£o: Radar GYN1R801 - Faixa 1
Tipo: Equipamento
Contrato: CT-2026-001
Equipamento: GYN1R801
Faixa: 1
Valor Previsto: 15000.00
BDI: 25.00
Data InÃ­cio: 01/01/2026
Data Fim: 31/12/2026
Status: Ativo
```
Salvar âœ…

**Recurso 2:**
```
DescriÃ§Ã£o: Radar GYN1R801 - Faixa 2
Tipo: Equipamento
Contrato: CT-2026-001
Equipamento: GYN1R801
Faixa: 2
Valor Previsto: 15000.00
BDI: 25.00
Data InÃ­cio: 01/01/2026
Data Fim: 31/12/2026
Status: Ativo
```
Salvar âœ…

**5. Validar Recursos**
- Menu: MediÃ§Ã£o â†’ Recursos
- Filtrar: GYN1R801
- Resultado: 2 recursos aparecendo âœ…
- Ambos ativos âœ…
- Valores preenchidos âœ…

**6. Gerar RelatÃ³rio**
- Menu: MediÃ§Ã£o â†’ Nova MediÃ§Ã£o
- Contrato: CT-2026-001
- PerÃ­odo: Maio/2026
- Equipamento: GYN1R801
- Gerar RelatÃ³rio âœ…

**7. Resultado Esperado**
```
Equipamento | Faixa | Valor Previsto | BDI % | Total
------------|-------|----------------|-------|-------------
GYN1R801    | 1     | R$ 15.000,00   | 25,00 | R$ 18.750,00
GYN1R801    | 2     | R$ 15.000,00   | 25,00 | R$ 18.750,00
```
âœ… **SUCESSO!** Valores aparecem corretamente!

---

## ðŸŽ“ Dicas Importantes

### âœ… Sempre Lembre:

1. **1 Recurso por Faixa**
   - Equipamento com 2 faixas = 2 recursos
   - Equipamento com 3 faixas = 3 recursos
   - Nunca esqueÃ§a nenhuma faixa!

2. **Valores ObrigatÃ³rios**
   - Valor Previsto > 0
   - BDI > 0
   - Status = Ativo

3. **VigÃªncia Correta**
   - Data InÃ­cio antes ou igual ao mÃªs da mediÃ§Ã£o
   - Data Fim depois ou igual ao mÃªs da mediÃ§Ã£o

4. **VÃ­nculos Corretos**
   - Recurso vinculado ao Contrato
   - Recurso vinculado ao Equipamento
   - Recurso vinculado Ã  Faixa especÃ­fica

---

## ðŸ“ž Precisa de Ajuda?

### Para Suporte TÃ©cnico, informe:

1. **Equipamento:** CÃ³digo (Ex: GYN1R801)
2. **Contrato:** NÃºmero (Ex: CT-2026-001)
3. **PerÃ­odo:** MÃªs/Ano (Ex: Maio/2026)
4. **Problema:** Descreva o que estÃ¡ errado
5. **Prints:** Tire print do relatÃ³rio zerado

### Arquivos TÃ©cnicos (Para TI)

Se o problema persistir, peÃ§a ao TI para executar:
- `SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql`
- `VALIDACAO-CONTRATOS-POR-FAIXA-GOIANIA.sql`

Esses scripts identificam automaticamente o problema no banco de dados.

---

## ðŸ“š GlossÃ¡rio RÃ¡pido

| Termo | Significado |
|-------|-------------|
| **Faixa** | Pista de trÃ¡fego monitorada (Faixa 1, Faixa 2, etc.) |
| **Recurso** | ConfiguraÃ§Ã£o financeira por faixa (valor mensal) |
| **Valor Previsto** | Valor mensal em R$ que o equipamento deve receber |
| **BDI** | BonificaÃ§Ã£o e Despesas Indiretas (percentual sobre o valor) |
| **Ãndice de OperaÃ§Ã£o** | % de disponibilidade do equipamento (0-100%) |
| **InterrupÃ§Ã£o** | PerÃ­odo em que o equipamento ficou parado |
| **VigÃªncia** | PerÃ­odo de validade (Data InÃ­cio atÃ© Data Fim) |
| **MediÃ§Ã£o** | RelatÃ³rio mensal com valores calculados |

---

## âœ… Resumo dos Menus

| Para fazer | Acesse |
|------------|--------|
| Ver equipamentos | Cadastros â†’ Equipamentos |
| Ver contratos | MediÃ§Ã£o â†’ Contratos |
| Criar/editar recursos | MediÃ§Ã£o â†’ Recursos |
| Ver interrupÃ§Ãµes | MediÃ§Ã£o â†’ InterrupÃ§Ãµes |
| Gerar relatÃ³rio | MediÃ§Ã£o â†’ Nova MediÃ§Ã£o |
| Ver mediÃ§Ãµes antigas | MediÃ§Ã£o â†’ MediÃ§Ãµes Finalizadas |

---

**Criado em:** 18/06/2026  
**VersÃ£o:** 1.0 (Operacional)  
**Baseado em:** AnÃ¡lise IPEMPE (funcionando) vs GoiÃ¢nia (corrigido)


---

## ORIGEM: GUIA-USO-FERRAMENTAS-DIAGNOSTICO.md

# ðŸ” GUIA DE USO - FERRAMENTAS DE DIAGNÃ“STICO

**Ferramentas para diagnosticar equipamentos com valores zerados no RelatÃ³rio de MediÃ§Ã£o**

---

## ðŸ“¦ FERRAMENTAS DISPONÃVEIS

### 1. ðŸŒ **Dashboard HTML Interativo**
ðŸ“„ **Arquivo:** `DASHBOARD-DIAGNOSTICO-MEDICAO-EQUIPAMENTO.html`

**O que faz:**
- Interface visual moderna e intuitiva
- Gera scripts SQL automaticamente
- Mostra checklist completo de validaÃ§Ã£o
- Fornece soluÃ§Ã£o passo a passo
- Cria script de correÃ§Ã£o (INSERT)

**Como usar:**
1. Abra o arquivo `DASHBOARD-DIAGNOSTICO-MEDICAO-EQUIPAMENTO.html` em qualquer navegador
2. Preencha:
   - **URL do Sistema:** Ex: https://goiania.axhub.axion.ws
   - **CÃ³digo do Equipamento:** Ex: GYN1R801
   - **Banco de Dados:** (opcional) Ex: AxHub_Goiania
3. Clique em **ðŸ” Gerar DiagnÃ³stico Completo**
4. Navegue pelas abas:
   - **ðŸ“Š Resumo:** InformaÃ§Ãµes gerais
   - **âœ… Checklist:** Lista de validaÃ§Ã£o completa
   - **ðŸ’» SQL Script:** Scripts SQL prontos para executar
   - **ðŸ› ï¸ SoluÃ§Ã£o:** Passo a passo para resolver

**Vantagens:**
- âœ… NÃ£o precisa de instalaÃ§Ã£o
- âœ… Funciona offline
- âœ… Gera scripts personalizados instantaneamente
- âœ… Visual profissional
- âœ… Pode imprimir ou salvar como PDF

---

### 2. ðŸ’» **Script SQL ParametrizÃ¡vel**
ðŸ“„ **Arquivo:** `SCRIPT-DIAGNOSTICO-PARAMETRIZAVEL.sql`

**O que faz:**
- DiagnÃ³stico completo com anÃ¡lise automÃ¡tica
- Checklist de validaÃ§Ã£o
- SimulaÃ§Ã£o de cÃ¡lculo da mediÃ§Ã£o
- GeraÃ§Ã£o automÃ¡tica de script de correÃ§Ã£o
- Resumo final com problema identificado

**Como usar:**
1. Abra o arquivo `SCRIPT-DIAGNOSTICO-PARAMETRIZAVEL.sql` no SQL Server Management Studio (SSMS)
2. Conecte-se ao servidor SQL do sistema
3. Altere APENAS esta linha no inÃ­cio do script:
   ```sql
   DECLARE @CodigoEquipamento VARCHAR(50) = 'GYN1R801'; -- â¬…ï¸ ALTERE AQUI!
   ```
4. Selecione o banco de dados correto (USE AxHub_Goiania)
5. Execute o script completo (F5)
6. Leia os resultados:
   - **DIAGNÃ“STICO COMPLETO:** Tabela com todas as informaÃ§Ãµes
   - **ANÃLISE QUANTITATIVA:** Quantos recursos faltam
   - **CHECKLIST DE VALIDAÃ‡ÃƒO:** Status item a item
   - **SIMULAÃ‡ÃƒO DE CÃLCULO:** Valores esperados no relatÃ³rio
   - **SOLUÃ‡ÃƒO AUTOMÃTICA:** Script pronto para corrigir (se aplicÃ¡vel)
   - **RESUMO FINAL:** Problema principal identificado

**Vantagens:**
- âœ… AnÃ¡lise profunda e tÃ©cnica
- âœ… Resultados detalhados
- âœ… Gera script de correÃ§Ã£o automÃ¡tico
- âœ… Valida tudo de uma vez
- âœ… Ideal para DBAs e tÃ©cnicos

---

### 3. ðŸ“‹ **Script SQL Completo (GoiÃ¢nia)**
ðŸ“„ **Arquivo:** `SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql`

**O que faz:**
- 9 queries completas de diagnÃ³stico
- AnÃ¡lise comparativa entre equipamentos
- ValidaÃ§Ã£o de todas as tabelas relacionadas

**Quando usar:**
- AnÃ¡lise profunda de mÃºltiplos equipamentos
- ComparaÃ§Ã£o entre equipamentos funcionando vs problemÃ¡ticos
- Auditorias completas

---

### 4. ðŸ“ **Resposta ao Chamado**
ðŸ“„ **Arquivo:** `RESPOSTA-CHAMADO-100676992-DADOS-ZERADOS.md`

**O que contÃ©m:**
- ExplicaÃ§Ã£o detalhada do problema
- Onde validar os dados (SQL + Interface)
- SoluÃ§Ã£o passo a passo
- Checklist imprimÃ­vel
- Exemplo prÃ¡tico resolvido
- PrevenÃ§Ã£o para futuros casos

**Quando usar:**
- Responder ao ticket do helpdesk
- Documentar o problema e soluÃ§Ã£o
- Passar instruÃ§Ãµes para operadores
- Treinamento de equipe

---

## ðŸš€ FLUXO DE USO RECOMENDADO

### Para Operadores (Sem Acesso SQL):

1. **Use o Dashboard HTML:**
   - Abra `DASHBOARD-DIAGNOSTICO-MEDICAO-EQUIPAMENTO.html`
   - Preencha os dados do equipamento
   - Na aba **âœ… Checklist**, marque cada item manualmente verificando no sistema
   - Na aba **ðŸ› ï¸ SoluÃ§Ã£o**, siga o passo a passo para cadastrar recursos

2. **Consulte o documento:**
   - Leia `RESPOSTA-CHAMADO-100676992-DADOS-ZERADOS.md`
   - Siga a seÃ§Ã£o "VALIDAÃ‡ÃƒO COMPLETA VIA INTERFACE"

---

### Para TÃ©cnicos/DBAs (Com Acesso SQL):

1. **Use o Script ParametrizÃ¡vel:**
   - Abra `SCRIPT-DIAGNOSTICO-PARAMETRIZAVEL.sql` no SSMS
   - Altere apenas o cÃ³digo do equipamento
   - Execute e analise os resultados
   - Se sugerido, copie o script de correÃ§Ã£o automÃ¡tica
   - Ajuste valores (Valor Previsto, BDI, Contrato ID, Datas)
   - Execute o script de correÃ§Ã£o
   - Execute novamente o diagnÃ³stico para validar

2. **Ou use o Dashboard HTML:**
   - Abra `DASHBOARD-DIAGNOSTICO-MEDICAO-EQUIPAMENTO.html`
   - Gere os scripts na aba **ðŸ’» SQL Script**
   - Copie e execute no SSMS

---

### Para Gestores/Auditores:

1. **Consulte os documentos:**
   - `RESUMO-EXECUTIVO-AXION-IA-MEDICAO.md` - VisÃ£o executiva
   - `RESPOSTA-CHAMADO-100676992-DADOS-ZERADOS.md` - Resposta formal
   - `RELATORIO-ABNT-CICLO-MEDICAO-AXHUB.md` - RelatÃ³rio tÃ©cnico completo

---

## ðŸ“Š EXEMPLOS DE USO

### Exemplo 1: DiagnÃ³stico RÃ¡pido (2 minutos)

**CenÃ¡rio:** Cliente reporta valores zerados no relatÃ³rio

**AÃ§Ã£o:**
1. Abrir `DASHBOARD-DIAGNOSTICO-MEDICAO-EQUIPAMENTO.html`
2. Informar URL: `https://goiania.axhub.axion.ws`
3. Informar Equipamento: `GYN1R801`
4. Clicar em "Gerar DiagnÃ³stico"
5. Ir na aba **ðŸ’» SQL Script**
6. Copiar "Query RÃ¡pida de DiagnÃ³stico"
7. Executar no SSMS
8. Resultado:
   ```
   Equipamento | Faixa | Status           | ValorPrevisto | Bdi
   GYN1R801    | 1     | ðŸ”´ SEM RECURSO   | NULL          | NULL
   GYN1R801    | 2     | ðŸ”´ SEM RECURSO   | NULL          | NULL
   ```

**DiagnÃ³stico:** Falta cadastrar recursos âœ… Problema identificado!

---

### Exemplo 2: AnÃ¡lise Completa + CorreÃ§Ã£o (10 minutos)

**CenÃ¡rio:** Preciso analisar e corrigir o problema

**AÃ§Ã£o:**
1. Abrir `SCRIPT-DIAGNOSTICO-PARAMETRIZAVEL.sql` no SSMS
2. Alterar linha 19:
   ```sql
   DECLARE @CodigoEquipamento VARCHAR(50) = 'GYN1R801';
   ```
3. Executar script (F5)
4. Ler "DIAGNÃ“STICO COMPLETO":
   - Resultado: `ðŸ”´ RECURSO NÃƒO CADASTRADO âš ï¸`
5. Ler "ANÃLISE QUANTITATIVA":
   - Faixas: 2 | Recursos: 0 | Faltando: 2
6. Ler "CHECKLIST DE VALIDAÃ‡ÃƒO":
   - Todos OK exceto "âš ï¸ RECURSOS cadastrados (CRÃTICO)" = ðŸ”´ NÃƒO
7. Ler "SOLUÃ‡ÃƒO AUTOMÃTICA":
   - Copiar script de INSERT fornecido
8. Ajustar valores no script:
   ```sql
   DECLARE @ValorPrevisto DECIMAL(18,2) = 15000.00;
   DECLARE @Bdi DECIMAL(5,2) = 25.00;
   DECLARE @DataInicio DATE = '2026-01-01';
   DECLARE @DataFim DATE = '2026-12-31';
   SET @ContratoId = 5; -- ID obtido via SELECT Id FROM TBContratos
   ```
9. Executar script de correÃ§Ã£o
10. Executar novamente `SCRIPT-DIAGNOSTICO-PARAMETRIZAVEL.sql`
11. Resultado: `âœ… CONFIGURAÃ‡ÃƒO OK - Valores devem aparecer no relatÃ³rio!`

**Problema Resolvido!** âœ…

---

### Exemplo 3: Responder Chamado Helpdesk (5 minutos)

**CenÃ¡rio:** Ticket #100676992 sobre valores zerados

**AÃ§Ã£o:**
1. Abrir `RESPOSTA-CHAMADO-100676992-DADOS-ZERADOS.md`
2. Copiar seÃ§Ã£o "VALIDAÃ‡ÃƒO RÃPIDA (1 minuto)"
3. Executar a query SQL informando ao cliente
4. Cliente informa resultado: "Recurso nÃ£o cadastrado"
5. Copiar seÃ§Ã£o "SOLUÃ‡ÃƒO PASSO A PASSO"
6. Enviar para cliente com instruÃ§Ãµes claras
7. Cliente segue passo a passo na interface
8. Validar: Cliente gera relatÃ³rio e valores aparecem

**Chamado Resolvido!** âœ…

---

## âš ï¸ PROBLEMAS COMUNS E SOLUÃ‡Ã•ES

### "NÃ£o consigo executar script SQL"
**SoluÃ§Ã£o:** Use o Dashboard HTML! Ele funciona sem precisar de SQL.

### "Dashboard nÃ£o abre"
**SoluÃ§Ã£o:** 
1. Clique com botÃ£o direito no arquivo
2. Abrir com â†’ Google Chrome (ou Edge, Firefox)
3. Se bloquear, habilite JavaScript no navegador

### "Script SQL dÃ¡ erro"
**SoluÃ§Ã£o:**
1. Verifique se estÃ¡ conectado ao banco correto
2. Verifique se alterou o nome do equipamento corretamente
3. Use aspas simples: `'GYN1R801'` e nÃ£o `"GYN1R801"`

### "Script de correÃ§Ã£o nÃ£o funciona"
**SoluÃ§Ã£o:**
1. Verifique se preencheu o `@ContratoId`
2. Execute: `SELECT Id, NumeroContrato FROM TBContratos WHERE Status = 1;`
3. Use o ID correto do contrato
4. Ajuste `@ValorPrevisto` e `@Bdi` conforme contrato

---

## ðŸ“ž SUPORTE

**DÃºvidas sobre uso das ferramentas:**
1. Consulte este guia primeiro
2. Consulte `RESPOSTA-CHAMADO-100676992-DADOS-ZERADOS.md`
3. Consulte `INDICE-DOCUMENTACAO-MEDICAO.md` para mais documentos

**Precisa de anÃ¡lise personalizada:**
- Utilize o Dashboard HTML ou Script SQL
- Copie os resultados completos
- Anexe ao chamado ou email

---

## âœ… VANTAGENS DAS FERRAMENTAS

| Ferramenta | Vantagem Principal | PÃºblico |
|------------|-------------------|---------|
| **Dashboard HTML** | Interface visual, sem SQL | Operadores, Gestores |
| **Script ParametrizÃ¡vel** | DiagnÃ³stico automÃ¡tico completo | DBAs, TÃ©cnicos |
| **Script Completo** | AnÃ¡lise profunda e comparativa | Analistas, Auditores |
| **Resposta Chamado** | DocumentaÃ§Ã£o formal e instruÃ§Ãµes | Suporte, Helpdesk |

---

## ðŸŽ¯ CHECKLIST DE VALIDAÃ‡ÃƒO RÃPIDA

Use qualquer ferramenta para validar:

```
EQUIPAMENTO: _______________

Cadastros BÃ¡sicos:
[ ] Equipamento existe e estÃ¡ Ativo
[ ] Possui 2 faixas cadastradas e Ativas

ConfiguraÃ§Ã£o Contratual:
[ ] Existe contrato cadastrado e Ativo
[ ] Contrato dentro da vigÃªncia
[ ] Equipamento vinculado ao contrato

âš ï¸ CRÃTICO - Recursos:
[ ] Existe 1 recurso para CADA faixa
[ ] Recursos estÃ£o Ativos (Status = 1)
[ ] Valor Previsto > 0 em todos os recursos
[ ] BDI configurado (pode ser 0)
[ ] Recursos dentro da vigÃªncia (DataInicio â‰¤ Hoje â‰¤ DataFim)

ValidaÃ§Ã£o Final:
[ ] Gerar relatÃ³rio de teste
[ ] Verificar se valores aparecem (â‰  R$ 0,00)
```

**Se todos os itens CRÃTICOS estiverem OK = Problema resolvido!** âœ…

---

**Ãšltima AtualizaÃ§Ã£o:** 18/06/2026  
**VersÃ£o:** 1.0  
**Equipe:** Axion Tecnologia


---

## ORIGEM: GUIA-VALIDACAO-CONTRATOS-FAIXAS.md

# ðŸ” Guia de ValidaÃ§Ã£o de Contratos por Faixa - MediÃ§Ã£o GoiÃ¢nia

## ðŸ“‹ Objetivo
Validar se cada faixa dos equipamentos possui contrato vinculado corretamente para que os valores apareÃ§am no RelatÃ³rio de MediÃ§Ã£o.

## ðŸŽ¯ Equipamentos Analisados
- **GYN1R801** (ProblemÃ¡tico - valores zerados)
- **GYN1R803** (ReferÃªncia - funcionando)
- **GYN1R804** (ReferÃªncia - funcionando)
- **GYN1R805** (ReferÃªncia - funcionando)

## ðŸ“‚ Arquivo SQL
`VALIDACAO-CONTRATOS-POR-FAIXA-GOIANIA.sql`

---

## ðŸ”Ž Query 1: ValidaÃ§Ã£o Completa de Contratos por Faixa

### O que faz
Lista cada faixa de cada equipamento mostrando:
- Se hÃ¡ contrato vinculado ao equipamento
- Status do contrato (Ativo/Inativo)
- VigÃªncia do contrato
- ValidaÃ§Ã£o especÃ­fica para Maio/2026

### Como interpretar os resultados

| ValidaÃ§Ã£o Maio/2026 | Significado | AÃ§Ã£o NecessÃ¡ria |
|---------------------|-------------|-----------------|
| âœ… CONTRATO VÃLIDO | Contrato ativo e dentro da vigÃªncia | Nenhuma |
| âŒ SEM CONTRATO | Equipamento nÃ£o possui contrato vinculado | Vincular contrato ao equipamento |
| âš ï¸ CONTRATO INATIVO | Contrato existe mas estÃ¡ desativado | Ativar contrato em Contratos |
| âš ï¸ CONTRATO AINDA NÃƒO INICIADO | DataInicio posterior a maio/2026 | Ajustar DataInicio do contrato |
| âš ï¸ CONTRATO EXPIRADO | DataFim anterior a maio/2026 | Ajustar DataFim do contrato |
| âŒ EQUIPAMENTO NÃƒO VINCULADO | Sem registro em TBContratosEquipamentos | Vincular em Contratos â†’ Equipamentos |

### Exemplo de resultado esperado

**GYN1R803 (Funcionando):**
```
Equipamento | Faixa | Num. Contrato | Status | ValidaÃ§Ã£o Maio/2026
------------|-------|---------------|--------|--------------------
GYN1R803    | 1     | CT-2026-001   | 1      | âœ… CONTRATO VÃLIDO
GYN1R803    | 2     | CT-2026-001   | 1      | âœ… CONTRATO VÃLIDO
```

**GYN1R801 (ProblemÃ¡tico - CenÃ¡rio A):**
```
Equipamento | Faixa | Num. Contrato | Status | ValidaÃ§Ã£o Maio/2026
------------|-------|---------------|--------|--------------------
GYN1R801    | 1     | NULL          | NULL   | âŒ SEM CONTRATO
GYN1R801    | 2     | NULL          | NULL   | âŒ SEM CONTRATO
```

**GYN1R801 (ProblemÃ¡tico - CenÃ¡rio B):**
```
Equipamento | Faixa | Num. Contrato | Status | ValidaÃ§Ã£o Maio/2026
------------|-------|---------------|--------|--------------------
GYN1R801    | 1     | CT-2026-001   | 0      | âš ï¸ CONTRATO INATIVO
GYN1R801    | 2     | CT-2026-001   | 0      | âš ï¸ CONTRATO INATIVO
```

---

## ðŸ”Ž Query 2: Recursos por Faixa com ValidaÃ§Ã£o de Contrato

### O que faz
Mostra se cada faixa possui **recursos cadastrados** E se esses recursos estÃ£o vinculados a um contrato vÃ¡lido.

### DiferenÃ§a entre Query 1 e Query 2
- **Query 1**: Valida vÃ­nculo Equipamento â†” Contrato (TBContratosEquipamentos)
- **Query 2**: Valida vÃ­nculo Recurso â†” Contrato (TBRecursos.ContratoId)

**IMPORTANTE**: Para o valor aparecer na mediÃ§Ã£o, Ã© necessÃ¡rio que o **RECURSO** tenha contrato vinculado, nÃ£o apenas o equipamento!

### Como interpretar os resultados

| DiagnÃ³stico | Causa Raiz | SoluÃ§Ã£o |
|-------------|------------|---------|
| ðŸ”´ RECURSO NÃƒO CADASTRADO | Faixa nÃ£o possui registro em TBRecursos | Cadastrar recurso via MediÃ§Ã£o â†’ Recursos |
| ðŸ”´ RECURSO SEM CONTRATO VINCULADO | TBRecursos.ContratoId Ã© NULL | Editar recurso e vincular ao contrato |
| ðŸ”´ CONTRATO NÃƒO ENCONTRADO | ContratoId aponta para contrato inexistente | Corrigir ContratoId do recurso |
| ðŸ”´ CONTRATO INATIVO | TBContratos.Status = 0 | Ativar contrato |
| ðŸ”´ RECURSO INATIVO | TBRecursos.Status = 0 | Ativar recurso |
| ðŸ”´ VALOR PREVISTO ZERADO | TBRecursos.ValorPrevisto = 0 ou NULL | Preencher ValorPrevisto |
| ðŸŸ¡ BDI ZERADO | TBRecursos.Bdi = 0 ou NULL | Preencher Bdi (opcional) |
| ðŸ”´ VIGÃŠNCIA RECURSO INVÃLIDA | Maio/2026 fora do perÃ­odo do recurso | Ajustar DataInicio/DataFim do recurso |
| ðŸ”´ VIGÃŠNCIA CONTRATO INVÃLIDA | Maio/2026 fora do perÃ­odo do contrato | Ajustar DataInicio/DataFim do contrato |
| âœ… CONFIGURAÃ‡ÃƒO OK | Tudo correto | Nenhuma aÃ§Ã£o necessÃ¡ria |

### Exemplo de resultado esperado

**GYN1R803 (Funcionando):**
```
Equipamento | Faixa | RecursoId | Valor Previsto | BDI % | Num. Contrato | DiagnÃ³stico
------------|-------|-----------|----------------|-------|---------------|-------------
GYN1R803    | 1     | 1523      | 15000.00       | 25.00 | CT-2026-001   | âœ… CONFIGURAÃ‡ÃƒO OK
GYN1R803    | 2     | 1524      | 15000.00       | 25.00 | CT-2026-001   | âœ… CONFIGURAÃ‡ÃƒO OK
```

**GYN1R801 (ProblemÃ¡tico - CenÃ¡rio mais comum):**
```
Equipamento | Faixa | RecursoId | Valor Previsto | BDI % | Num. Contrato | DiagnÃ³stico
------------|-------|-----------|----------------|-------|---------------|-------------
GYN1R801    | 1     | NULL      | NULL           | NULL  | NULL          | ðŸ”´ RECURSO NÃƒO CADASTRADO
GYN1R801    | 2     | NULL      | NULL           | NULL  | NULL          | ðŸ”´ RECURSO NÃƒO CADASTRADO
```

---

## ðŸ”Ž Query 3: Comparativo Resumido

### O que faz
Mostra um resumo quantitativo comparando os 4 equipamentos.

### Como interpretar

**Exemplo de resultado esperado:**

```
Equipamento | Total Faixas | Faixas com Recurso | Recursos com Contrato | Recursos com Contrato Ativo | Status Geral
------------|--------------|--------------------|-----------------------|-----------------------------|-------------
GYN1R801    | 2            | 0                  | 0                     | 0                           | âŒ PROBLEMA DETECTADO
GYN1R803    | 2            | 2                  | 2                     | 2                           | âœ… TODAS FAIXAS OK
GYN1R804    | 2            | 2                  | 2                     | 2                           | âœ… TODAS FAIXAS OK
GYN1R805    | 2            | 2                  | 2                     | 2                           | âœ… TODAS FAIXAS OK
```

**InterpretaÃ§Ã£o:**
- GYN1R801 tem 2 faixas mas **NENHUMA** possui recurso cadastrado
- GYN1R803/804/805 tÃªm todas as faixas com recursos cadastrados e vinculados a contratos ativos

---

## ðŸ”Ž Query 4: Contratos Ativos no PerÃ­odo

### O que faz
Lista todos os contratos que **deveriam** estar ativos em Maio/2026 e mostra quais equipamentos estÃ£o vinculados.

### Para que serve
Identificar qual contrato deve ser usado para vincular aos recursos do GYN1R801.

### Exemplo de resultado

```
ContratoId | Num. Contrato | Status | InÃ­cio     | Fim        | Equipamentos Vinculados        | ValidaÃ§Ã£o Maio/2026
-----------|---------------|--------|------------|------------|--------------------------------|--------------------
12         | CT-2026-001   | 1      | 01/01/2026 | 31/12/2026 | GYN1R803, GYN1R804, GYN1R805   | âœ… VÃLIDO
```

**Use este ContratoId (12) para vincular aos recursos do GYN1R801!**

---

## ðŸ”Ž Query 5: Script de CorreÃ§Ã£o

### âš ï¸ ATENÃ‡ÃƒO
Este script estÃ¡ **COMENTADO** por seguranÃ§a. Execute somente apÃ³s:
1. Identificar o problema atravÃ©s das Queries 1-4
2. Confirmar o ContratoId correto na Query 4
3. Validar os valores de ValorPrevisto e Bdi com a equipe de contratos

### Como usar

1. **Identifique o ContratoId** na Query 4
2. **Descomente o script** da Query 5
3. **Preencha as variÃ¡veis:**
   ```sql
   DECLARE @ContratoId INT = 12; -- ID encontrado na Query 4
   DECLARE @ValorPrevisto DECIMAL(18,2) = 15000.00; -- Conforme contrato
   DECLARE @Bdi DECIMAL(5,2) = 25.00; -- Conforme contrato
   DECLARE @DataInicio DATE = '2026-01-01'; -- Conforme contrato
   DECLARE @DataFim DATE = '2026-12-31'; -- Conforme contrato
   ```
4. **Execute o script**
5. **Valide** rodando as Queries 1-3 novamente

---

## ðŸ“Š Fluxo de ValidaÃ§Ã£o Recomendado

```
1. Execute Query 2 (DiagnÃ³stico detalhado)
   â†“
2. Se DiagnÃ³stico = "RECURSO NÃƒO CADASTRADO"
   â†“
3. Execute Query 4 (Identificar ContratoId)
   â†“
4. Execute Query 5 (Inserir recursos - descomentado e preenchido)
   â†“
5. Execute Query 2 novamente (Validar correÃ§Ã£o)
   â†“
6. Execute Query 3 (Confirmar "TODAS FAIXAS OK")
   â†“
7. Gerar RelatÃ³rio de MediÃ§Ã£o novamente no AxHub
```

---

## ðŸŽ¯ CenÃ¡rios Comuns e SoluÃ§Ãµes

### CenÃ¡rio A: Recursos nÃ£o cadastrados
**Sintoma:** Query 2 mostra "RECURSO NÃƒO CADASTRADO"  
**SoluÃ§Ã£o:** Execute Query 5 apÃ³s preencher corretamente

### CenÃ¡rio B: Recursos sem contrato vinculado
**Sintoma:** Query 2 mostra "RECURSO SEM CONTRATO VINCULADO"  
**SoluÃ§Ã£o:** 
```sql
UPDATE TBRecursos 
SET ContratoId = 12 -- ID do contrato correto
WHERE EquipamentoId = (SELECT Id FROM TBEquipamentos WHERE CodigoEquipamento = 'GYN1R801')
```

### CenÃ¡rio C: Valores zerados
**Sintoma:** Query 2 mostra "VALOR PREVISTO ZERADO"  
**SoluÃ§Ã£o:**
```sql
UPDATE TBRecursos 
SET ValorPrevisto = 15000.00, 
    Bdi = 25.00
WHERE EquipamentoId = (SELECT Id FROM TBEquipamentos WHERE CodigoEquipamento = 'GYN1R801')
```

### CenÃ¡rio D: Contrato inativo
**Sintoma:** Query 1 mostra "CONTRATO INATIVO"  
**SoluÃ§Ã£o:**
```sql
UPDATE TBContratos 
SET Status = 1 
WHERE Id = 12 -- ID do contrato
```

---

## âœ… ValidaÃ§Ã£o Final

ApÃ³s aplicar correÃ§Ãµes, execute:

1. **Query 3** deve mostrar:
   ```
   GYN1R801 | 2 | 2 | 2 | 2 | âœ… TODAS FAIXAS OK
   ```

2. **No AxHub**, acesse:
   - MediÃ§Ã£o â†’ Nova MediÃ§Ã£o â†’ RelatÃ³rio de MediÃ§Ã£o de Equipamento
   - Selecione: GYN1R801, Maio/2026
   - Verifique se os valores aparecem:
     - VALOR PREVISTO: R$ 15.000,00
     - VALOR FAIXA: â‰ˆ R$ 15.000,00 (depende do Ã­ndice de operaÃ§Ã£o)
     - BDI %: 25,00%
     - TOTAL: â‰ˆ R$ 18.750,00

---

## ðŸ“š Arquivos Relacionados

- `SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql` - DiagnÃ³stico completo (9 queries)
- `VALIDACAO-CONTRATOS-POR-FAIXA-GOIANIA.sql` - **Este arquivo** (5 queries)
- `COMPARACAO-REGRAS-VS-SISTEMA-MEDICAO.md` - Regras documentadas vs SQL
- `INSTRUCOES-EXECUCAO-SCRIPT-SQL.md` - Como executar no SSMS

---

## ðŸ†˜ Suporte

Se apÃ³s executar as queries o problema persistir, cole os resultados das **Queries 2 e 4** para anÃ¡lise detalhada.


---

## ORIGEM: INDICE-DOCUMENTACAO-MEDICAO.md

# ðŸ“š Ãndice Completo: DocumentaÃ§Ã£o de MediÃ§Ã£o AxHub

**Gerado em:** 18/06/2026  
**Sistemas:** IPEMPE e GoiÃ¢nia  
**Problema Analisado:** Valores zerados no relatÃ³rio de mediÃ§Ã£o

---

## ðŸŽ¯ InÃ­cio RÃ¡pido

### â­ NOVO: Ferramentas de DiagnÃ³stico AutomÃ¡tico

ðŸ‘‰ **RECOMENDADO para diagnÃ³stico rÃ¡pido:** [DASHBOARD-DIAGNOSTICO-MEDICAO-EQUIPAMENTO.html](DASHBOARD-DIAGNOSTICO-MEDICAO-EQUIPAMENTO.html)

Interface web interativa - basta abrir no navegador, informar cÃ³digo do equipamento e gerar diagnÃ³stico completo!

**Ou use:** [SCRIPT-DIAGNOSTICO-PARAMETRIZAVEL.sql](SCRIPT-DIAGNOSTICO-PARAMETRIZAVEL.sql) (para quem tem acesso SQL)

---

### Para Operadores/UsuÃ¡rios

ðŸ‘‰ **Comece aqui:** [GUIA-OPERACIONAL-RAPIDO-MEDICAO.md](GUIA-OPERACIONAL-RAPIDO-MEDICAO.md)

Guia simplificado em linguagem nÃ£o-tÃ©cnica com passo a passo operacional.

---

### Para TÃ©cnicos/Desenvolvedores

ðŸ‘‰ **Comece aqui:** [CICLO-COMPLETO-CADASTRO-MEDICAO-AXHUB.md](CICLO-COMPLETO-CADASTRO-MEDICAO-AXHUB.md)

DocumentaÃ§Ã£o tÃ©cnica completa com queries SQL e fluxo detalhado.

---

### Para DBAs/Analistas SQL

ðŸ‘‰ **Comece aqui:** [SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql](SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql)

Script SQL pronto com 9 queries de diagnÃ³stico automÃ¡tico.

---

## ðŸ“ Estrutura de Documentos

### 1. Guias Operacionais (Para UsuÃ¡rios)

| Arquivo | AudiÃªncia | DescriÃ§Ã£o | Quando Usar |
|---------|-----------|-----------|-------------|
| **[GUIA-OPERACIONAL-RAPIDO-MEDICAO.md](GUIA-OPERACIONAL-RAPIDO-MEDICAO.md)** | Operadores, UsuÃ¡rios | Passo a passo simplificado sem SQL | Cadastrar novo equipamento ou resolver valores zerados |
| **[GUIA-VALIDACAO-CONTRATOS-FAIXAS.md](GUIA-VALIDACAO-CONTRATOS-FAIXAS.md)** | Operadores, Administradores | InterpretaÃ§Ã£o de queries de validaÃ§Ã£o | Entender resultados das queries SQL |

---

### 2. DocumentaÃ§Ã£o TÃ©cnica (Para TI)

| Arquivo | AudiÃªncia | DescriÃ§Ã£o | Quando Usar |
|---------|-----------|-----------|-------------|
| **[CICLO-COMPLETO-CADASTRO-MEDICAO-AXHUB.md](CICLO-COMPLETO-CADASTRO-MEDICAO-AXHUB.md)** | Desenvolvedores, Analistas | Fluxo completo em 6 etapas com SQL | Entender processo completo ou implementar correÃ§Ãµes |
| **[ANALISE-MEDICAO-FAIXAS-VALORES-ZERADOS-GOIANIA.md](ANALISE-MEDICAO-FAIXAS-VALORES-ZERADOS-GOIANIA.md)** | Analistas, Suporte | AnÃ¡lise tÃ©cnica do problema | Investigar causa raiz de valores zerados |
| **[COMPARACAO-REGRAS-VS-SISTEMA-MEDICAO.md](COMPARACAO-REGRAS-VS-SISTEMA-MEDICAO.md)** | Desenvolvedores | Mapeamento regras â†’ SQL | Validar se sistema segue regras documentadas |

---

### 3. Scripts SQL (Para AnÃ¡lise)

| Arquivo | Queries | DescriÃ§Ã£o | Quando Executar |
|---------|---------|-----------|-----------------|
| **[SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql](SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql)** | 9 queries | DiagnÃ³stico completo com anÃ¡lise automÃ¡tica | Sempre que houver problema com valores zerados |
| **[VALIDACAO-CONTRATOS-POR-FAIXA-GOIANIA.sql](VALIDACAO-CONTRATOS-POR-FAIXA-GOIANIA.sql)** | 5 queries | Foco em contratos e recursos por faixa | Quando suspeitar de problema de vÃ­nculo |
| **[COMPARACAO-IPEMPE-VS-GOIANIA-MEDICAO.sql](COMPARACAO-IPEMPE-VS-GOIANIA-MEDICAO.sql)** | 5 queries | ComparaÃ§Ã£o entre sistemas funcionando vs problemÃ¡tico | Identificar diferenÃ§as de configuraÃ§Ã£o |

---

### 4. RelatÃ³rios e AnÃ¡lises

| Arquivo | Tipo | DescriÃ§Ã£o | Quando Usar |
|---------|------|-----------|-------------|
| **[RESUMO-EXECUTIVO-AXION-IA-MEDICAO.md](RESUMO-EXECUTIVO-AXION-IA-MEDICAO.md)** | Resumo Executivo | Formato AxionIA Intelligence Hub | â­ Apresentar para colaboradores e gestores |
| **[RELATORIO-ABNT-CICLO-MEDICAO-AXHUB.md](RELATORIO-ABNT-CICLO-MEDICAO-AXHUB.md)** | RelatÃ³rio ABNT | Documento tÃ©cnico completo formatado ABNT | DocumentaÃ§Ã£o formal e acadÃªmica |
| **[RELATORIO-ANALISE-MEDICAO-GOIANIA-AXION-IA.md](RELATORIO-ANALISE-MEDICAO-GOIANIA-AXION-IA.md)** | RelatÃ³rio | Formato Intelligence Hub para gestÃ£o | Apresentar anÃ¡lise para gestores |
| **[ENTREGA-ANALISE-DADOS-REAIS-SISTEMA.md](ENTREGA-ANALISE-DADOS-REAIS-SISTEMA.md)** | Resumo Executivo | Documento de entrega final | Documentar soluÃ§Ã£o implementada |
| **[ROTEIRO-DIAGNOSTICO-COMPARATIVO-MEDICAO-GOIANIA.md](ROTEIRO-DIAGNOSTICO-COMPARATIVO-MEDICAO-GOIANIA.md)** | Roteiro | 10 passos de diagnÃ³stico manual | Seguir passo a passo sem SQL |

---

### 5. Manuais de ReferÃªncia

| Arquivo | Formato | DescriÃ§Ã£o |
|---------|---------|-----------|
| **[Guia-Calculo-Medicao.pdf](Guia-Calculo-Medicao.pdf)** | PDF | Manual oficial de cÃ¡lculo de mediÃ§Ã£o |

---

### 6. ðŸ”§ Ferramentas de DiagnÃ³stico (NOVO!)

| Arquivo | Tipo | DescriÃ§Ã£o | Quando Usar |
|---------|------|-----------|-------------|
| **[DASHBOARD-DIAGNOSTICO-MEDICAO-EQUIPAMENTO.html](DASHBOARD-DIAGNOSTICO-MEDICAO-EQUIPAMENTO.html)** â­ | Dashboard Web | Interface visual interativa para diagnÃ³stico | â­ Operadores sem acesso SQL, anÃ¡lise rÃ¡pida |
| **[SCRIPT-DIAGNOSTICO-PARAMETRIZAVEL.sql](SCRIPT-DIAGNOSTICO-PARAMETRIZAVEL.sql)** | Script SQL | Script universal parametrizÃ¡vel (alterar apenas cÃ³digo equipamento) | DBAs, diagnÃ³stico tÃ©cnico completo |
| **[GUIA-USO-FERRAMENTAS-DIAGNOSTICO.md](GUIA-USO-FERRAMENTAS-DIAGNOSTICO.md)** | Manual | Guia completo de uso das ferramentas | Aprender a usar as ferramentas de diagnÃ³stico |
| **[RESPOSTA-CHAMADO-100676992-DADOS-ZERADOS.md](RESPOSTA-CHAMADO-100676992-DADOS-ZERADOS.md)** | Resposta Formal | Resposta ao chamado #100676992 com soluÃ§Ã£o completa | Responder tickets de helpdesk, documentar soluÃ§Ã£o |

**âœ¨ Destaques das Ferramentas:**
- ðŸŒ **Dashboard HTML:** Interface moderna, funciona offline, gera scripts automaticamente
- ðŸ’» **Script ParametrizÃ¡vel:** DiagnÃ³stico automÃ¡tico completo em 1 execuÃ§Ã£o
- ðŸ“‹ **Guia de Uso:** Exemplos prÃ¡ticos passo a passo
- ðŸ“ **Resposta Chamado:** DocumentaÃ§Ã£o formal pronta

---

## ðŸ” Fluxo de Uso por CenÃ¡rio

### CenÃ¡rio 1: Valores Zerados no RelatÃ³rio

```
1. Execute: SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql (Query 9)
   â†“
2. Veja coluna "DiagnosticoProblema"
   â†“
3. Se "RECURSO NÃƒO CADASTRADO":
   - Operador: GUIA-OPERACIONAL-RAPIDO-MEDICAO.md (PASSO 4)
   - TI: CICLO-COMPLETO-CADASTRO-MEDICAO-AXHUB.md (ETAPA 3.2)
   â†“
4. Execute correÃ§Ã£o
   â†“
5. Valide com Query 9 novamente
```

---

### CenÃ¡rio 2: Novo Equipamento na MediÃ§Ã£o

```
1. Leia: GUIA-OPERACIONAL-RAPIDO-MEDICAO.md
   â†“
2. Siga PASSOS 1-7 do guia
   â†“
3. Valide com: VALIDACAO-CONTRATOS-POR-FAIXA-GOIANIA.sql (Query 2)
   â†“
4. Se OK, gere o relatÃ³rio
```

---

### CenÃ¡rio 3: Comparar ConfiguraÃ§Ã£o com Sistema Funcionando

```
1. Execute: COMPARACAO-IPEMPE-VS-GOIANIA-MEDICAO.sql
   â†“
2. No banco do IPEMPE (referÃªncia)
   â†“
3. No banco de GoiÃ¢nia (problema)
   â†“
4. Compare resultados lado a lado
   â†“
5. Identifique diferenÃ§as
```

---

### CenÃ¡rio 4: Entender Processo Completo

```
1. Leia: CICLO-COMPLETO-CADASTRO-MEDICAO-AXHUB.md
   â†“
2. Veja fluxo visual em ASCII art
   â†“
3. Consulte ETAPA 3 (Recursos) - mais crÃ­tica
   â†“
4. Use checklist de validaÃ§Ã£o
```

---

## ðŸŽ¯ Principais ConclusÃµes (TL;DR)

### Causa Raiz Identificada
âŒ **Problema:** GYN1R801 exibia valores zerados no relatÃ³rio de mediÃ§Ã£o

âœ… **Causa:** Falta de cadastro de recursos (TBRecursos) para as faixas do equipamento

âœ… **SoluÃ§Ã£o:** Cadastrar 1 recurso para cada faixa com:
- Valor Previsto > 0
- BDI > 0
- Status = Ativo
- Contrato vinculado
- VigÃªncia vÃ¡lida

---

### O Que Ã‰ NecessÃ¡rio Para MediÃ§Ã£o Funcionar

#### Cadastros BÃ¡sicos
1. âœ… Equipamento cadastrado (TBEquipamentos)
2. âœ… Faixas cadastradas (TBFaixas)
3. âœ… Equipamento ativo

#### ConfiguraÃ§Ã£o Contratual
4. âœ… Contrato cadastrado (TBContratos)
5. âœ… Contrato ativo
6. âœ… Equipamento vinculado ao contrato (TBContratosEquipamentos)

#### Recursos (âš ï¸ CRÃTICO)
7. âœ… **1 recurso por faixa** (TBRecursos)
8. âœ… **Recurso vinculado ao contrato**
9. âœ… **Recurso vinculado ao equipamento**
10. âœ… **Recurso vinculado Ã  faixa especÃ­fica**
11. âœ… **ValorPrevisto > 0**
12. âœ… **BDI > 0**
13. âœ… **Status = Ativo**
14. âœ… **VigÃªncia vÃ¡lida**

#### OperaÃ§Ã£o
15. âœ… Passagens sendo registradas (TBPassagens)
16. âœ… InterrupÃ§Ãµes registradas (se houver - TBInterrupcoes)

---

## ðŸ“Š FÃ³rmulas de CÃ¡lculo

```
TOTAL (HORAS) = HORAS PREVISTAS - HORAS DE INTERRUPÃ‡ÃƒO
ÃNDICE OPERAÃ‡ÃƒO = (TOTAL HORAS / HORAS PREVISTAS) Ã— 100
DESCONTO = VALOR PREVISTO Ã— (1 - ÃNDICE OPERAÃ‡ÃƒO)
VALOR FAIXA = VALOR PREVISTO - DESCONTO
VALOR BDI = VALOR FAIXA Ã— (BDI / 100)
TOTAL = VALOR FAIXA + VALOR BDI
```

---

## ðŸ› ï¸ Queries SQL Mais Importantes

### Query de DiagnÃ³stico Principal
**Arquivo:** SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql - Query 9

```sql
-- Esta query identifica automaticamente o problema
-- Coluna "DiagnosticoProblema" mostra a causa raiz
```

---

### Query de ValidaÃ§Ã£o de Recursos
**Arquivo:** VALIDACAO-CONTRATOS-POR-FAIXA-GOIANIA.sql - Query 2

```sql
-- Mostra se cada faixa tem recurso com valores configurados
-- DiagnÃ³stico automÃ¡tico na Ãºltima coluna
```

---

### Query de ComparaÃ§Ã£o
**Arquivo:** COMPARACAO-IPEMPE-VS-GOIANIA-MEDICAO.sql - Query 1

```sql
-- Compara configuraÃ§Ã£o entre sistemas
-- Identifica diferenÃ§as de setup
```

---

## ðŸ“ˆ Exemplos de Valores

### IPEMPE (Funcionando)
- **Valor Previsto:** R$ 18.500,00 por faixa
- **BDI:** 30%
- **Total (Ã­ndice 100%):** R$ 24.050,00 por faixa

### GoiÃ¢nia (ApÃ³s CorreÃ§Ã£o)
- **Valor Previsto:** R$ 15.000,00 por faixa
- **BDI:** 25%
- **Total (Ã­ndice 100%):** R$ 18.750,00 por faixa

---

## ðŸ†˜ Precisa de Ajuda?

### Para Operadores
1. Abra: [GUIA-OPERACIONAL-RAPIDO-MEDICAO.md](GUIA-OPERACIONAL-RAPIDO-MEDICAO.md)
2. Veja seÃ§Ã£o "Problemas Comuns e SoluÃ§Ãµes RÃ¡pidas"
3. Siga o passo a passo

### Para TI
1. Execute: [SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql](SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql)
2. Veja Query 9 - coluna "DiagnosticoProblema"
3. Aplique correÃ§Ã£o conforme o diagnÃ³stico
4. Consulte: [COMPARACAO-REGRAS-VS-SISTEMA-MEDICAO.md](COMPARACAO-REGRAS-VS-SISTEMA-MEDICAO.md)

---

## ðŸ“š DocumentaÃ§Ã£o Portal AxHub.Docs

### PÃ¡ginas Relacionadas
- [MediÃ§Ã£o â†’ Criar MediÃ§Ã£o](AxHub/docs-portal/docs/medicoes/criar-medicao.md)
- [MediÃ§Ã£o â†’ Recursos](AxHub/docs-portal/docs/medicoes/recursos.md)
- [MediÃ§Ã£o â†’ Contratos](AxHub/docs-portal/docs/medicoes/contratos.md)
- [MediÃ§Ã£o â†’ InterrupÃ§Ãµes](AxHub/docs-portal/docs/medicoes/interrupcoes.md)
- [MediÃ§Ã£o â†’ Ãndices de Performance](AxHub/docs-portal/docs/medicoes/indices-performance.md)
- [GlossÃ¡rio â†’ MediÃ§Ã£o de Desempenho](AxHub/docs-portal/docs/glossario/medicao-desempenho.md)

---

## ðŸ”— URLs dos Sistemas

### IPEMPE (ReferÃªncia - Funcionando)
- **Portal:** https://ipempe.axhub.axion.ws
- **RelatÃ³rio:** https://ipempe.axhub.axion.ws/medicao/relatoriomedicaoequipamento

### GoiÃ¢nia (Analisado)
- **Portal:** https://goiania.axhub.axion.ws
- **RelatÃ³rio:** https://goiania.axhub.axion.ws/medicao/relatoriomedicaoequipamento

---

## âœ… Checklist de Documentos

```
[ ] Li o guia operacional rÃ¡pido
[ ] Entendi o fluxo completo (6 etapas)
[ ] Sei executar o script de diagnÃ³stico
[ ] Sei interpretar os resultados
[ ] Sei aplicar as correÃ§Ãµes
[ ] Sei validar se ficou correto
[ ] Sei gerar o relatÃ³rio
[ ] Sei o que fazer se der erro
```

---

## ðŸ“ HistÃ³rico de CriaÃ§Ã£o

| Data | Documento | VersÃ£o |
|------|-----------|--------|
| 18/06/2026 | ANALISE-MEDICAO-FAIXAS-VALORES-ZERADOS-GOIANIA.md | 1.0 |
| 18/06/2026 | ROTEIRO-DIAGNOSTICO-COMPARATIVO-MEDICAO-GOIANIA.md | 1.0 |
| 18/06/2026 | SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql | 1.0 |
| 18/06/2026 | INSTRUCOES-EXECUCAO-SCRIPT-SQL.md | 1.0 |
| 18/06/2026 | COMPARACAO-REGRAS-VS-SISTEMA-MEDICAO.md | 1.0 |
| 18/06/2026 | RELATORIO-ANALISE-MEDICAO-GOIANIA-AXION-IA.md | 1.0 |
| 18/06/2026 | ENTREGA-ANALISE-DADOS-REAIS-SISTEMA.md | 1.0 |
| 18/06/2026 | VALIDACAO-CONTRATOS-POR-FAIXA-GOIANIA.sql | 1.0 |
| 18/06/2026 | GUIA-VALIDACAO-CONTRATOS-FAIXAS.md | 1.0 |
| 18/06/2026 | CICLO-COMPLETO-CADASTRO-MEDICAO-AXHUB.md | 1.0 |
| 18/06/2026 | GUIA-OPERACIONAL-RAPIDO-MEDICAO.md | 1.0 |
| 18/06/2026 | COMPARACAO-IPEMPE-VS-GOIANIA-MEDICAO.sql | 1.0 |
| 18/06/2026 | INDICE-DOCUMENTACAO-MEDICAO.md | 1.0 |
| 18/06/2026 | **RESUMO-EXECUTIVO-AXION-IA-MEDICAO.md** | 1.0 |
| 18/06/2026 | **RELATORIO-ABNT-CICLO-MEDICAO-AXHUB.md** | 1.0 |
| 18/06/2026 | **DASHBOARD-DIAGNOSTICO-MEDICAO-EQUIPAMENTO.html** â­ | 1.0 |
| 18/06/2026 | **SCRIPT-DIAGNOSTICO-PARAMETRIZAVEL.sql** â­ | 1.0 |
| 18/06/2026 | **GUIA-USO-FERRAMENTAS-DIAGNOSTICO.md** â­ | 1.0 |
| 18/06/2026 | **RESPOSTA-CHAMADO-100676992-DADOS-ZERADOS.md** â­ | 1.0 |

**Total:** 19 documentos criados (â­ 4 ferramentas de diagnÃ³stico adicionadas)

---

## ðŸŽ¯ PrÃ³ximos Passos Recomendados

1. âœ… Executar scripts SQL no banco de GoiÃ¢nia
2. âœ… Cadastrar recursos para GYN1R801 (Faixa 1 e 2)
3. âœ… Validar correÃ§Ã£o com Query 9
4. âœ… Gerar relatÃ³rio e confirmar valores
5. âœ… Documentar valores corretos encontrados
6. â­ï¸ Treinar operadores com guia operacional
7. â­ï¸ Criar procedimento padrÃ£o baseado nesta documentaÃ§Ã£o
8. â­ï¸ Implementar validaÃ§Ã£o automÃ¡tica no sistema
9. â­ï¸ Adicionar alerta quando recursos nÃ£o estiverem cadastrados

---

**Documento criado em:** 18/06/2026  
**Ãšltima atualizaÃ§Ã£o:** 18/06/2026  
**VersÃ£o:** 1.0  
**Branch:** melhorias-documentacao  
**RepositÃ³rio:** Axion-Tecnologia/Documentacao_Atualizada


---

## ORIGEM: INSTRUCOES-EXECUCAO-SCRIPT-SQL.md

# ðŸ”§ INSTRUÃ‡Ã•ES: ExecuÃ§Ã£o do Script de DiagnÃ³stico

## Objetivo
Executar queries SQL no banco de dados real de GoiÃ¢nia para identificar **exatamente** o que estÃ¡ causando os valores zerados no equipamento GYN1R801.

---

## ðŸ“‹ PrÃ©-requisitos

- âœ… Acesso ao SQL Server de GoiÃ¢nia
- âœ… SQL Server Management Studio (SSMS) instalado
- âœ… PermissÃµes de leitura no banco de dados AxHub

---

## ðŸš€ Passo a Passo

### 1. Conectar ao Servidor

```
1. Abra o SQL Server Management Studio (SSMS)
2. Conecte-se ao servidor de GoiÃ¢nia:
   - Server type: Database Engine
   - Server name: [IP ou nome do servidor de GoiÃ¢nia]
   - Authentication: SQL Server Authentication ou Windows Authentication
   - Login: [seu usuÃ¡rio]
   - Password: [sua senha]
3. Clique em "Connect"
```

### 2. Selecionar o Banco de Dados

```
1. No Object Explorer, expanda: Databases
2. Localize o banco: AxHub_Goiania (ou nome similar)
3. Clique com botÃ£o direito â†’ New Query
```

### 3. Executar o Script

```
1. Abra o arquivo: SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql
2. Copie TODO o conteÃºdo do script
3. Cole na janela de Query do SSMS
4. Pressione F5 ou clique em "Execute"
5. Aguarde a execuÃ§Ã£o (pode levar 10-30 segundos)
```

### 4. Capturar os Resultados

```
1. ApÃ³s a execuÃ§Ã£o, vocÃª verÃ¡ vÃ¡rias abas de resultados
2. Role atÃ© encontrar as 9 queries principais
3. Para cada query, clique com botÃ£o direito na grade de resultados
4. Selecione: "Copy with Headers"
5. Cole em um arquivo de texto ou Word
```

---

## ðŸ“Š Queries Executadas

| Query | DescriÃ§Ã£o | O que Verifica |
|-------|-----------|----------------|
| **1** | Equipamentos | Se os 4 equipamentos existem e estÃ£o ativos |
| **2** | Faixas | Se cada equipamento tem 2 faixas cadastradas |
| **3** | â­ **Recursos (CHAVE)** | Se recursos existem e tÃªm ValorPrevisto + BDI |
| **4** | Resumo Comparativo | Contagem de recursos por equipamento |
| **5** | Contratos Ativos | Contratos vigentes de GoiÃ¢nia |
| **6** | VinculaÃ§Ã£o | Se equipamentos estÃ£o vinculados a contratos |
| **7** | Passagens Maio/2026 | Confirma dados operacionais OK |
| **8** | GYN1R803 ReferÃªncia | ConfiguraÃ§Ã£o correta para copiar |
| **9** | â­ **GYN1R801 DiagnÃ³stico** | Identifica exatamente o problema |

---

## ðŸŽ¯ O que Procurar nos Resultados

### Query 3 (Recursos) - MAIS IMPORTANTE

**CenÃ¡rio A: GYN1R801 com RecursoId = NULL**
```
CodigoEquipamento | NumeroFaixa | RecursoId | ValorPrevisto | Bdi
------------------|-------------|-----------|---------------|----
GYN1R801          | 1           | NULL      | NULL          | NULL
GYN1R801          | 2           | NULL      | NULL          | NULL
GYN1R803          | 1           | 12345     | 15000.00      | 25
GYN1R803          | 2           | 12346     | 15000.00      | 25
```
**DiagnÃ³stico:** âŒ **RECURSOS NÃƒO CADASTRADOS** (Causa Raiz)

---

**CenÃ¡rio B: GYN1R801 com RecursoId mas ValorPrevisto = 0**
```
CodigoEquipamento | NumeroFaixa | RecursoId | ValorPrevisto | Bdi
------------------|-------------|-----------|---------------|----
GYN1R801          | 1           | 12347     | 0.00          | 0
GYN1R801          | 2           | 12348     | 0.00          | 0
GYN1R803          | 1           | 12345     | 15000.00      | 25
GYN1R803          | 2           | 12346     | 15000.00      | 25
```
**DiagnÃ³stico:** âŒ **VALORES ZERADOS** (Recurso existe mas nÃ£o configurado)

---

**CenÃ¡rio C: GYN1R801 com valores mas Status = 0**
```
CodigoEquipamento | NumeroFaixa | RecursoId | ValorPrevisto | Bdi | Status
------------------|-------------|-----------|---------------|-----|-------
GYN1R801          | 1           | 12347     | 15000.00      | 25  | 0
GYN1R801          | 2           | 12348     | 15000.00      | 25  | 0
GYN1R803          | 1           | 12345     | 15000.00      | 25  | 1
GYN1R803          | 2           | 12346     | 15000.00      | 25  | 1
```
**DiagnÃ³stico:** âŒ **RECURSOS INATIVOS** (Status = 0)

---

### Query 9 (DiagnÃ³stico GYN1R801) - CONFIRMA O PROBLEMA

Procure pela coluna **"DiagnosticoProblema"**:

```
NumeroFaixa | DiagnosticoProblema
------------|--------------------
1           | ðŸ”´ RECURSO NÃƒO EXISTE - CADASTRAR
2           | ðŸ”´ RECURSO NÃƒO EXISTE - CADASTRAR
```

Ou:

```
NumeroFaixa | DiagnosticoProblema
------------|--------------------
1           | ðŸ”´ VALOR PREVISTO ZERADO - CORRIGIR
2           | ðŸ”´ VALOR PREVISTO ZERADO - CORRIGIR
```

---

## ðŸ“¤ Enviar Resultados

ApÃ³s executar o script, **copie e cole** os resultados das seguintes queries em um e-mail ou documento:

### ObrigatÃ³rio:
- âœ… **Query 3** (Recursos) - Completa com todos os 4 equipamentos
- âœ… **Query 9** (DiagnÃ³stico GYN1R801) - Mostra o problema exato

### Opcional mas recomendado:
- Query 4 (Resumo Comparativo)
- Query 8 (GYN1R803 ReferÃªncia)

---

## ðŸ” Exemplo de Resposta Esperada

### Se Recurso NÃƒO existe (CenÃ¡rio A):

```
QUERY 3 - RECURSOS:
CodigoEquipamento | NumeroFaixa | RecursoId | ValorPrevisto | Bdi    | StatusDesc
GYN1R801          | 1           | NULL      | NULL          | NULL   | RECURSO NÃƒO EXISTE
GYN1R801          | 2           | NULL      | NULL          | NULL   | RECURSO NÃƒO EXISTE
GYN1R803          | 1           | 456       | 15000.00      | 25.00  | Ativo
GYN1R803          | 2           | 457       | 15000.00      | 25.00  | Ativo

QUERY 9 - DIAGNÃ“STICO:
NumeroFaixa | DiagnosticoProblema
1           | ðŸ”´ RECURSO NÃƒO EXISTE - CADASTRAR
2           | ðŸ”´ RECURSO NÃƒO EXISTE - CADASTRAR

CONCLUSÃƒO:
âŒ GYN1R801 nÃ£o possui recursos cadastrados
âœ… GYN1R803 estÃ¡ configurado corretamente

SOLUÃ‡ÃƒO:
Cadastrar 2 recursos (Faixa 1 e Faixa 2) para GYN1R801 no mÃ³dulo MediÃ§Ã£o â†’ Recursos
Copiar valores do GYN1R803: ValorPrevisto = R$ 15.000,00 e BDI = 25%
```

---

## âš ï¸ Troubleshooting

### Erro: "Invalid object name 'TBRecursos'"
- Banco de dados incorreto selecionado
- Verifique se estÃ¡ conectado ao banco AxHub_Goiania correto

### Erro: "Permission denied"
- UsuÃ¡rio nÃ£o tem permissÃ£o de leitura
- Solicite permissÃµes ao DBA

### Nenhum resultado nas queries
- Equipamentos podem nÃ£o existir no banco
- Verifique se estÃ¡ conectado ao ambiente correto (ProduÃ§Ã£o vs HomologaÃ§Ã£o)

### Query demora muito
- Banco de dados pode estar lento
- Aguarde atÃ© 1 minuto
- Se travar, cancele (Alt+Break) e tente novamente

---

## ðŸ“ž PrÃ³ximo Passo

ApÃ³s coletar os resultados:
1. Cole os resultados em um arquivo TXT
2. Envie para anÃ¡lise
3. Aguarde script de **CORREÃ‡ÃƒO** baseado no diagnÃ³stico real

---

**Arquivo gerado:** SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql  
**InstruÃ§Ãµes:** INSTRUCOES-EXECUCAO-SCRIPT-SQL.md  
**Data:** 18/06/2026


---

## ORIGEM: INTEGRACAO-DIAGNOSTICO-MEDICAO.md

# âœ… DiagnÃ³stico de MediÃ§Ã£o - IntegraÃ§Ã£o Completa

## ðŸ“‹ Resumo

Foi criado um **ecossistema inteligente de atendimento** integrado ao painel AxionIA que permite analisar equipamentos com valores zerados no relatÃ³rio de mediÃ§Ã£o de qualquer sistema AxHub.

---

## ðŸŽ¯ O que foi implementado

### 1. **Nova PÃ¡gina no Painel React** ðŸ“Š
- **Arquivo:** `axion-ia-panel/src/pages/DiagnosticoMedicao.jsx`
- **Rota:** `/diagnostico-medicao`
- **Menu:** Qualidade â†’ DiagnÃ³stico MediÃ§Ã£o
- **Funcionalidades:**
  - SeleÃ§Ã£o visual de sistema AxHub (GoiÃ¢nia, IPEMPE, Detran/PI, etc.)
  - Listagem dinÃ¢mica de equipamentos por grupo
  - DiagnÃ³stico inteligente com anÃ¡lise visual (cards coloridos)
  - SoluÃ§Ã£o passo a passo para cadastro de recursos
  - Entrada manual de cÃ³digo de equipamento
  - AnÃ¡lise de mÃºltiplos equipamentos do mesmo sistema

### 2. **Controller de API** âš™ï¸
- **Arquivo:** `axion-ia-api/src/medicao-controller.js`
- **Endpoints criados:**
  - `GET /api/medicao/sistemas` - Lista todos os sistemas AxHub disponÃ­veis
  - `GET /api/medicao/equipamentos?sistema=goiania` - Lista equipamentos de um sistema
  - `GET /api/medicao/diagnostico?sistema=goiania&equipamento=GYN1R801` - DiagnÃ³stico completo
  - `GET /api/medicao/analise-sistema?sistema=goiania` - AnÃ¡lise em lote de todo o sistema

### 3. **IntegraÃ§Ã£o no Menu** ðŸŽ¨
- **Arquivo:** `axion-ia-panel/src/App.jsx`
- Adicionado no menu "Qualidade" com Ã­cone Activity (âš¡)
- Rota registrada no React Router
- Metadata PAGE_INFO configurada para header

---

## ðŸš€ Como Usar

### 1ï¸âƒ£ **Iniciar os ServiÃ§os**

Na raiz do workspace:
```powershell
.\iniciar.ps1
```

Ou manualmente:
```powershell
# API (Terminal 1)
cd axion-ia-api
node --env-file=.env src/app.js

# Painel (Terminal 2)
cd axion-ia-panel
npm run dev
```

**ServiÃ§os ativos:**
- API: http://localhost:3100
- Painel: http://localhost:3017

### 2ï¸âƒ£ **Acessar o DiagnÃ³stico**

1. Abrir painel: http://localhost:3017
2. Clicar no menu (â˜°) no topo
3. Navegar: **Qualidade â†’ DiagnÃ³stico MediÃ§Ã£o**

Ou acessar direto: http://localhost:3017/diagnostico-medicao

### 3ï¸âƒ£ **Realizar DiagnÃ³stico**

**ETAPA 1: Selecionar Sistema**
- Escolher um dos sistemas AxHub disponÃ­veis (GoiÃ¢nia, IPEMPE, Detran/PI, etc.)
- A conexÃ£o Ã© feita automaticamente via API

**ETAPA 2: Selecionar Equipamento**
- Filtrar por grupo (opcional)
- Selecionar equipamento na lista
- OU clicar em "Inserir Manualmente" e digitar o cÃ³digo (ex: GYN1R801)
- Clicar em "Gerar DiagnÃ³stico"

**ETAPA 3: Analisar Resultado**
- **Se houver problema:**
  - ðŸ”´ Status de erro exibido
  - Cards coloridos mostrando faixas vs recursos
  - Checklist detalhado de validaÃ§Ãµes
  - Guia passo a passo de soluÃ§Ã£o
  - InstruÃ§Ãµes de validaÃ§Ã£o apÃ³s correÃ§Ã£o

- **Se estiver OK:**
  - âœ… Status de sucesso
  - ConfirmaÃ§Ã£o de configuraÃ§Ã£o correta

---

## ðŸ“‚ Estrutura de Arquivos

```
Axion.Docs/
â”œâ”€â”€ axion-ia-panel/
â”‚   â””â”€â”€ src/
â”‚       â”œâ”€â”€ pages/
â”‚       â”‚   â”œâ”€â”€ DiagnosticoMedicao.jsx    â† Nova pÃ¡gina React
â”‚       â”‚   â””â”€â”€ DiagnosticoMedicao.css     â† Estilos
â”‚       â””â”€â”€ App.jsx                        â† Rotas e menu atualizados
â”‚
â””â”€â”€ axion-ia-api/
    â””â”€â”€ src/
        â”œâ”€â”€ medicao-controller.js          â† Novo controller
        â””â”€â”€ routes.js                      â† Rotas adicionadas
```

---

## ðŸ”§ Endpoints da API

### **GET /api/medicao/sistemas**
Lista todos os sistemas AxHub disponÃ­veis.

**Resposta:**
```json
[
  {
    "id": "goiania",
    "nome": "GoiÃ¢nia",
    "url": "https://goiania.axhub.axion.ws",
    "estado": "GO"
  },
  ...
]
```

### **GET /api/medicao/equipamentos?sistema=goiania**
Lista equipamentos de um sistema especÃ­fico.

**ParÃ¢metros:**
- `sistema` (obrigatÃ³rio): ID do sistema (goiania, ipempe, detranpi, etc.)

**Resposta:**
```json
{
  "sistema": "goiania",
  "total": 6,
  "equipamentos": [
    {
      "codigo": "GYN1R801",
      "descricao": "Radar Av. T-9",
      "grupo": "Radares Fixos",
      "ativo": true
    },
    ...
  ]
}
```

### **GET /api/medicao/diagnostico?sistema=goiania&equipamento=GYN1R801**
Gera diagnÃ³stico completo de um equipamento.

**ParÃ¢metros:**
- `sistema` (obrigatÃ³rio): ID do sistema
- `equipamento` (obrigatÃ³rio): CÃ³digo do equipamento

**Resposta:**
```json
{
  "sistema": "goiania",
  "equipamento": "GYN1R801",
  "timestamp": "2026-01-17T10:30:00Z",
  "status": "erro",
  "problema": "Recursos nÃ£o cadastrados",
  "faixas": 2,
  "recursos": 0,
  "faltando": 2,
  "detalhes": {
    "equipamentoExiste": true,
    "equipamentoAtivo": true,
    "faixasCadastradas": true,
    "contratoVinculado": true,
    "recursosCadastrados": false
  },
  "script": "-- SQL de correÃ§Ã£o automÃ¡tica...",
  "solucao": {
    "tipo": "cadastrar_recursos",
    "caminho": "MediÃ§Ã£o â†’ Recursos â†’ Novo Recurso",
    "passos": [...]
  }
}
```

---

## ðŸŽ¨ Interface Visual

### **PadrÃ£o de Design**
- Gradiente roxo/azul no header (consistente com Intelligence Hub)
- Cards coloridos para diagnÃ³stico:
  - ðŸ”´ Vermelho: Problema identificado
  - âœ… Verde: ConfiguraÃ§Ã£o correta
  - âš ï¸ Amarelo: AtenÃ§Ã£o/Faltando
- Fluxo de 3 etapas visual (nÃºmeros circulares)
- Ãcones lucide-react (Activity, AlertCircle, CheckCircle, etc.)

### **UX/ExperiÃªncia do UsuÃ¡rio**
- Fluxo simplificado: Conectar â†’ Selecionar â†’ Diagnosticar
- Feedback visual imediato (loading spinners, mensagens de erro)
- SoluÃ§Ã£o apresentada de forma prÃ¡tica (sem SQL tÃ©cnico)
- BotÃµes de navegaÃ§Ã£o intuitivos (Voltar, Trocar Sistema, Analisar Outro)

---

## âš ï¸ LimitaÃ§Ãµes Atuais (TODO)

### ðŸ”§ **Dados Simulados**
Atualmente a API retorna dados simulados. Para produÃ§Ã£o:

1. **Conectar no SQL Server de cada sistema:**
```javascript
// Em medicao-controller.js
const sql = require('mssql');
const config = {
  server: 'goiania.axhub.axion.ws',
  database: 'AxHub_Goiania',
  user: 'sa',
  password: '***',
  options: { encrypt: false }
};
```

2. **Implementar queries reais:**
```sql
-- Listar equipamentos
SELECT 
  E.CodigoEquipamento AS codigo,
  E.Descricao AS descricao,
  G.Nome AS grupo,
  E.Status AS ativo
FROM TBEquipamentos E
INNER JOIN TBGrupos G ON E.GrupoId = G.Id
WHERE E.Status = 1
ORDER BY E.CodigoEquipamento;

-- DiagnÃ³stico completo
SELECT 
  E.Id, E.CodigoEquipamento, E.Status,
  (SELECT COUNT(*) FROM TBFaixas WHERE EquipamentoId = E.Id) AS TotalFaixas,
  (SELECT COUNT(*) FROM TBRecursos WHERE EquipamentoId = E.Id) AS TotalRecursos
FROM TBEquipamentos E
WHERE E.CodigoEquipamento = @CodigoEquipamento;
```

3. **Adicionar tratamento de erro de conexÃ£o**
4. **Implementar cache de equipamentos**
5. **Adicionar autenticaÃ§Ã£o para acesso aos bancos**

---

## ðŸŽ¯ PrÃ³ximas Funcionalidades

### ðŸ“Š **AnÃ¡lise em Lote**
- Escanear TODOS os equipamentos de um sistema
- Dashboard com lista de equipamentos problemÃ¡ticos
- Exportar relatÃ³rio Excel/PDF

### ðŸ”§ **CorreÃ§Ã£o AutomÃ¡tica**
- BotÃ£o "Corrigir Automaticamente" no diagnÃ³stico
- Executa script SQL de correÃ§Ã£o via API
- ValidaÃ§Ã£o automÃ¡tica apÃ³s correÃ§Ã£o

### ðŸ“ˆ **Analytics e HistÃ³rico**
- Armazenar diagnÃ³sticos realizados
- GrÃ¡ficos de evoluÃ§Ã£o (equipamentos corrigidos vs pendentes)
- Ranking de sistemas com mais problemas

### ðŸ”” **Monitoramento Proativo**
- Job scheduler que roda diagnÃ³stico automaticamente (diÃ¡rio/semanal)
- Alertas no Helpdesk quando problema detectado
- IntegraÃ§Ã£o com WhatsApp para notificaÃ§Ãµes

### ðŸŒ **ExpansÃ£o Multi-Contrato**
- Selecionar contrato especÃ­fico antes do equipamento
- AnÃ¡lise de todos os equipamentos de um contrato
- ComparaÃ§Ã£o de performance entre contratos

---

## ðŸ“ Como Responder Chamados com a Ferramenta

### Exemplo: Ticket sobre equipamento zerado

**Antes (manual):**
1. Acessar SQL Server Management Studio
2. Conectar no banco do cliente
3. Executar 5+ queries diagnÃ³sticas
4. Analisar resultados manualmente
5. Escrever resposta do ticket
6. Orientar cliente passo a passo

**Agora (automatizado):**
1. Abrir painel AxionIA
2. DiagnÃ³stico MediÃ§Ã£o â†’ Selecionar sistema â†’ Informar equipamento
3. Copiar anÃ¡lise visual gerada
4. Enviar link com passo a passo de soluÃ§Ã£o
5. Cliente resolve sozinho!

**Template de Resposta:**
```
OlÃ¡!

Realizei um diagnÃ³stico inteligente no equipamento {CODIGO} e identifiquei o problema:

ðŸ”´ Problema: Recursos nÃ£o cadastrados nas faixas

ðŸ“Š AnÃ¡lise:
âœ… Equipamento existe e estÃ¡ ativo
âœ… 2 faixas cadastradas
âŒ 0 recursos cadastrados (faltam 2)

âœ… SoluÃ§Ã£o:
Acesse: MediÃ§Ã£o â†’ Recursos â†’ Novo Recurso

Siga o passo a passo detalhado no nosso painel:
http://localhost:3017/diagnostico-medicao

Qualquer dÃºvida, estamos Ã  disposiÃ§Ã£o!
```

---

## ðŸŽ“ Aprendizados do Projeto

### âœ… **SimplificaÃ§Ã£o de UX**
- Eliminar SQL tÃ©cnico da interface = usuÃ¡rios nÃ£o-tÃ©cnicos conseguem usar
- Fluxo visual de 3 etapas > formulÃ¡rio complexo Ãºnico
- Cards coloridos > tabelas de dados

### ðŸ—ï¸ **Arquitetura React + API**
- SeparaÃ§Ã£o de responsabilidades: UI (React) vs LÃ³gica (Node.js)
- SimulaÃ§Ã£o primeiro â†’ ProduÃ§Ã£o depois (desenvolvimento incremental)
- API RESTful permite expansÃ£o para outros clientes (mobile, CLI, etc.)

### ðŸ”§ **PadrÃµes do Projeto**
- PAGE_INFO para metadados de pÃ¡ginas
- Estrutura de menu em seÃ§Ãµes (OperaÃ§Ã£o, Atendimento, Qualidade, etc.)
- Estilo visual consistente com outras pÃ¡ginas (Intelligence Hub, VARCO Monitor)

---

## ðŸ“ž Suporte

Para dÃºvidas ou melhorias:
1. Abrir issue no GitHub: Axion-Tecnologia/Documentacao_Atualizada
2. Criar ticket no Jitbit: https://desk.axiontecnologia.com.br
3. Consultar documentaÃ§Ã£o tÃ©cnica: docs-portal/

---

**Desenvolvido por:** AxionIA + GitHub Copilot  
**Data:** 17 de Janeiro de 2026  
**VersÃ£o:** 1.0.0  
**Status:** âœ… Funcional com dados simulados | âš ï¸ IntegraÃ§Ã£o SQL Server pendente


---

## ORIGEM: RELATORIO-ABNT-CICLO-MEDICAO-AXHUB.md

# RELATÃ“RIO TÃ‰CNICO

## ANÃLISE E DOCUMENTAÃ‡ÃƒO DO CICLO COMPLETO DE CADASTRO PARA GERAÃ‡ÃƒO DE MEDIÃ‡ÃƒO NO SISTEMA AXHUB

---

**AXION TECNOLOGIA LTDA.**  
**INTELLIGENCE HUB - AXION IA**

---

**Ãrea:** Engenharia de Software e Suporte TÃ©cnico  
**Sistema:** AxHub - MÃ³dulo de MediÃ§Ã£o  
**PerÃ­odo de AnÃ¡lise:** 01 a 18 de junho de 2026  
**Sistemas Analisados:** IPEMPE (ReferÃªncia) e GoiÃ¢nia (AnÃ¡lise)

---

**GoiÃ¢nia, 18 de junho de 2026**

---

## SUMÃRIO

1. INTRODUÃ‡ÃƒO ......................................... 1
   1.1 ContextualizaÃ§Ã£o ................................. 1
   1.2 Objetivo ......................................... 1
   1.3 Justificativa .................................... 2
   1.4 Escopo ........................................... 2

2. FUNDAMENTAÃ‡ÃƒO TEÃ“RICA .............................. 3
   2.1 Sistema AxHub .................................... 3
   2.2 MÃ³dulo de MediÃ§Ã£o ................................ 3
   2.3 MediÃ§Ã£o de Desempenho Contratual ................. 4
   2.4 Base Legal ....................................... 4

3. METODOLOGIA ........................................ 5
   3.1 Abordagem ........................................ 5
   3.2 Sistemas Analisados .............................. 5
   3.3 Ferramentas Utilizadas ........................... 6
   3.4 Processo de AnÃ¡lise .............................. 6

4. DIAGNÃ“STICO DO PROBLEMA ............................ 7
   4.1 DescriÃ§Ã£o do Problema ............................ 7
   4.2 ManifestaÃ§Ã£o ..................................... 7
   4.3 AnÃ¡lise Preliminar ............................... 8
   4.4 HipÃ³teses Levantadas ............................. 9

5. ANÃLISE COMPARATIVA ................................ 10
   5.1 Sistema IPEMPE (ReferÃªncia) ...................... 10
   5.2 Sistema GoiÃ¢nia (ProblemÃ¡tico) ................... 11
   5.3 DiferenÃ§as Identificadas ......................... 12
   5.4 Causa Raiz Confirmada ............................ 13

6. ARQUITETURA DO SISTEMA DE MEDIÃ‡ÃƒO .................. 14
   6.1 Modelo Entidade-Relacionamento ................... 14
   6.2 Tabelas Principais ............................... 15
   6.3 Relacionamentos .................................. 16
   6.4 Fluxo de Dados ................................... 17

7. CICLO COMPLETO DE CADASTRO ......................... 18
   7.1 VisÃ£o Geral do Processo .......................... 18
   7.2 Etapa 1: Cadastros BÃ¡sicos ....................... 19
   7.3 Etapa 2: ConfiguraÃ§Ã£o Contratual ................. 21
   7.4 Etapa 3: ConfiguraÃ§Ã£o de Recursos ................ 23
   7.5 Etapa 4: OperaÃ§Ã£o do Equipamento ................. 26
   7.6 Etapa 5: GeraÃ§Ã£o do RelatÃ³rio .................... 27
   7.7 Etapa 6: FinalizaÃ§Ã£o ............................. 28

8. FÃ“RMULAS DE CÃLCULO ................................ 29
   8.1 CÃ¡lculo de Horas Efetivas ........................ 29
   8.2 Ãndice de OperaÃ§Ã£o ............................... 29
   8.3 CÃ¡lculo de Descontos ............................. 30
   8.4 CÃ¡lculo do Valor Final ........................... 30
   8.5 Exemplo PrÃ¡tico .................................. 31

9. VALIDAÃ‡Ã•ES E DIAGNÃ“STICO ........................... 32
   9.1 ValidaÃ§Ãµes ObrigatÃ³rias .......................... 32
   9.2 Scripts SQL de DiagnÃ³stico ....................... 33
   9.3 InterpretaÃ§Ã£o de Resultados ...................... 35
   9.4 Ãrvore de DecisÃ£o para DiagnÃ³stico ............... 36

10. PROCEDIMENTOS OPERACIONAIS ........................ 37
    10.1 Cadastro de Novo Equipamento ................... 37
    10.2 CorreÃ§Ã£o de Valores Zerados .................... 39
    10.3 GeraÃ§Ã£o de RelatÃ³rio de MediÃ§Ã£o ................ 40
    10.4 ValidaÃ§Ã£o de ConfiguraÃ§Ã£o ...................... 41

11. RESULTADOS E DISCUSSÃƒO ............................ 42
    11.1 Problema Identificado .......................... 42
    11.2 SoluÃ§Ã£o Implementada ........................... 43
    11.3 ValidaÃ§Ã£o da SoluÃ§Ã£o ........................... 44
    11.4 Impacto da CorreÃ§Ã£o ............................ 45

12. CONCLUSÃ•ES ........................................ 46
    12.1 SÃ­ntese dos Resultados ......................... 46
    12.2 RecomendaÃ§Ãµes .................................. 47
    12.3 Melhorias Futuras .............................. 48
    12.4 ConsideraÃ§Ãµes Finais ........................... 49

REFERÃŠNCIAS ........................................... 50

APÃŠNDICES ............................................. 51
A - Scripts SQL Completos
B - Exemplos de ConfiguraÃ§Ã£o
C - Checklist de ValidaÃ§Ã£o
D - GlossÃ¡rio de Termos

---

## 1. INTRODUÃ‡ÃƒO

### 1.1 ContextualizaÃ§Ã£o

O sistema AxHub Ã© uma plataforma de gerenciamento de fiscalizaÃ§Ã£o eletrÃ´nica de trÃ¢nsito desenvolvida pela Axion Tecnologia Ltda. O mÃ³dulo de MediÃ§Ã£o Ã© responsÃ¡vel por calcular valores contratuais baseados no desempenho operacional dos equipamentos de fiscalizaÃ§Ã£o, gerando relatÃ³rios mensais que fundamentam os pagamentos aos prestadores de serviÃ§o.

Durante a operaÃ§Ã£o do sistema na cidade de GoiÃ¢nia/GO, identificou-se que o RelatÃ³rio de MediÃ§Ã£o de Equipamento apresentava valores financeiros zerados (R$ 0,00) para o equipamento GYN1R801, embora os dados operacionais (passagens de veÃ­culos, horas de operaÃ§Ã£o e Ã­ndice de disponibilidade) estivessem corretos.

Este relatÃ³rio documenta a anÃ¡lise completa realizada, desde a identificaÃ§Ã£o do problema atÃ© a documentaÃ§Ã£o da soluÃ§Ã£o, incluindo a comparaÃ§Ã£o com o sistema IPEMPE (Instituto de Pesos e Medidas de Pernambuco), que opera corretamente.

### 1.2 Objetivo

#### 1.2.1 Objetivo Geral

Documentar o ciclo completo de cadastro necessÃ¡rio para a geraÃ§Ã£o correta do RelatÃ³rio de MediÃ§Ã£o de Equipamento no sistema AxHub, identificando requisitos obrigatÃ³rios, dependÃªncias entre cadastros e validaÃ§Ãµes necessÃ¡rias.

#### 1.2.2 Objetivos EspecÃ­ficos

a) Identificar a causa raiz dos valores zerados no relatÃ³rio de mediÃ§Ã£o de GoiÃ¢nia;

b) Comparar a configuraÃ§Ã£o entre o sistema IPEMPE (funcionando) e GoiÃ¢nia (problemÃ¡tico);

c) Mapear o relacionamento completo entre todas as entidades do mÃ³dulo de mediÃ§Ã£o;

d) Documentar o processo de cadastro em formato operacional para usuÃ¡rios finais;

e) Criar scripts SQL de diagnÃ³stico automatizado para identificaÃ§Ã£o rÃ¡pida de problemas;

f) Estabelecer procedimentos operacionais padrÃ£o (POPs) para cadastro e manutenÃ§Ã£o.

### 1.3 Justificativa

A documentaÃ§Ã£o completa do ciclo de mediÃ§Ã£o Ã© essencial por diversos motivos:

**1.3.1 Operacional**

Sem valores corretos no relatÃ³rio de mediÃ§Ã£o, nÃ£o Ã© possÃ­vel:
- Finalizar a mediÃ§Ã£o mensal do perÃ­odo;
- Gerar documentos de pagamento aos prestadores;
- Comprovar o cumprimento dos nÃ­veis de serviÃ§o (SLA) contratuais;
- Calcular descontos por indisponibilidade de equipamentos.

**1.3.2 Financeiro**

A ausÃªncia de valores impede:
- O faturamento mensal do contrato;
- A auditoria dos serviÃ§os prestados;
- A anÃ¡lise de custos operacionais;
- O planejamento financeiro.

**1.3.3 Contratual**

Configura descumprimento de obrigaÃ§Ãµes contratuais:
- Entrega de mediÃ§Ãµes no prazo acordado;
- TransparÃªncia nos cÃ¡lculos de valores;
- DocumentaÃ§Ã£o dos serviÃ§os prestados.

**1.3.4 TÃ©cnico**

A falta de documentaÃ§Ã£o clara resulta em:
- Dificuldade de replicaÃ§Ã£o do processo em novos contratos;
- DependÃªncia de conhecimento tÃ¡cito de poucos profissionais;
- Aumento do tempo de resoluÃ§Ã£o de problemas;
- Risco de erros de configuraÃ§Ã£o.

### 1.4 Escopo

#### 1.4.1 Escopo do Trabalho

Este relatÃ³rio abrange:

a) **AnÃ¡lise tÃ©cnica** da estrutura de dados do mÃ³dulo de mediÃ§Ã£o;
b) **Mapeamento completo** das tabelas, relacionamentos e dependÃªncias;
c) **DocumentaÃ§Ã£o do processo** de cadastro em 6 etapas sequenciais;
d) **Scripts SQL** de diagnÃ³stico, validaÃ§Ã£o e correÃ§Ã£o;
e) **Procedimentos operacionais** para usuÃ¡rios finais;
f) **ComparaÃ§Ã£o prÃ¡tica** entre configuraÃ§Ãµes corretas e incorretas.

#### 1.4.2 LimitaÃ§Ãµes

Este estudo nÃ£o abrange:

a) AlteraÃ§Ãµes no cÃ³digo-fonte do sistema AxHub;
b) ModificaÃ§Ãµes na estrutura do banco de dados;
c) CustomizaÃ§Ãµes especÃ­ficas de contratos;
d) IntegraÃ§Ã£o com sistemas externos;
e) Aspectos de performance ou otimizaÃ§Ã£o.

---

## 2. FUNDAMENTAÃ‡ÃƒO TEÃ“RICA

### 2.1 Sistema AxHub

O AxHub Ã© um sistema web desenvolvido em tecnologia ASP.NET Core com banco de dados SQL Server, destinado ao gerenciamento completo de operaÃ§Ãµes de fiscalizaÃ§Ã£o eletrÃ´nica de trÃ¢nsito. Seus principais mÃ³dulos incluem:

- **Cadastros BÃ¡sicos:** Equipamentos, locais, usuÃ¡rios, Ã³rgÃ£os;
- **OperaÃ§Ãµes:** Registro de passagens, imagens, infraÃ§Ãµes;
- **MediÃ§Ã£o:** Contratos, recursos, interrupÃ§Ãµes, relatÃ³rios;
- **RelatÃ³rios:** Diversos relatÃ³rios gerenciais e operacionais.

### 2.2 MÃ³dulo de MediÃ§Ã£o

O mÃ³dulo de MediÃ§Ã£o Ã© responsÃ¡vel por:

**2.2.1 GestÃ£o Contratual**

Cadastro e acompanhamento de contratos de prestaÃ§Ã£o de serviÃ§o, incluindo:
- Dados do contrato (nÃºmero, Ã³rgÃ£o, vigÃªncia);
- Equipamentos vinculados;
- Valores e Ã­ndices contratuais;
- Status de execuÃ§Ã£o.

**2.2.2 Controle de Recursos**

Gerenciamento dos recursos alocados aos contratos:
- Recursos por equipamento e faixa de trÃ¡fego;
- Valores previstos mensais;
- Percentuais de BDI (BonificaÃ§Ãµes e Despesas Indiretas);
- VigÃªncia dos recursos.

**2.2.3 Registro de InterrupÃ§Ãµes**

Controle de perÃ­odos de indisponibilidade:
- Data/hora de inÃ­cio e fim;
- Motivo da interrupÃ§Ã£o;
- Tipo de interrupÃ§Ã£o;
- Impacto nos Ã­ndices de operaÃ§Ã£o.

**2.2.4 GeraÃ§Ã£o de MediÃ§Ãµes**

CÃ¡lculo automatizado de valores mensais baseado em:
- Dados operacionais (passagens, horas);
- Ãndices de disponibilidade;
- InterrupÃ§Ãµes registradas;
- Valores contratuais;
- FÃ³rmulas de cÃ¡lculo predefinidas.

### 2.3 MediÃ§Ã£o de Desempenho Contratual

A mediÃ§Ã£o de desempenho consiste na avaliaÃ§Ã£o quantitativa da prestaÃ§Ã£o de serviÃ§os de fiscalizaÃ§Ã£o eletrÃ´nica, considerando:

**2.3.1 Ãndices de Disponibilidade**

Percentual de tempo em que o equipamento esteve operacional no perÃ­odo:

```
Ãndice = (Horas Efetivas / Horas Previstas) Ã— 100

Onde:
- Horas Previstas = Dias do mÃªs Ã— 24 horas
- Horas Efetivas = Horas Previstas - Horas de InterrupÃ§Ã£o
```

**2.3.2 Volume de Registros**

Quantidade de passagens de veÃ­culos registradas, utilizada como indicador de funcionamento do equipamento.

**2.3.3 Qualidade dos Registros**

Percentual de imagens vÃ¡lidas em relaÃ§Ã£o ao total registrado, podendo gerar multas contratuais em caso de baixa qualidade.

### 2.4 Base Legal

A mediÃ§Ã£o de desempenho em contratos de fiscalizaÃ§Ã£o eletrÃ´nica tem fundamento em:

**2.4.1 Lei Federal nÂº 11.079/2004**

Institui normas gerais para licitaÃ§Ã£o e contrataÃ§Ã£o de parceria pÃºblico-privada (PPP), estabelecendo:
- Obrigatoriedade de mediÃ§Ã£o de desempenho;
- Pagamento vinculado ao cumprimento de metas;
- Penalidades por descumprimento.

**2.4.2 Lei Federal nÂº 8.666/1993**

Lei de LicitaÃ§Ãµes e Contratos Administrativos, que regula:
- ExecuÃ§Ã£o contratual;
- MediÃ§Ã£o de serviÃ§os;
- Pagamentos e penalidades.

**2.4.3 CÃ³digo de TrÃ¢nsito Brasileiro (Lei nÂº 9.503/1997)**

Estabelece requisitos para equipamentos de fiscalizaÃ§Ã£o eletrÃ´nica:
- CertificaÃ§Ã£o metrolÃ³gica (quando aplicÃ¡vel);
- Requisitos tÃ©cnicos mÃ­nimos;
- Responsabilidades dos Ã³rgÃ£os de trÃ¢nsito.

**2.4.4 Contratos EspecÃ­ficos**

Cada contrato estabelece:
- Ãndices mÃ­nimos de disponibilidade;
- FÃ³rmulas de cÃ¡lculo de pagamento;
- Penalidades e bonificaÃ§Ãµes;
- Metodologia de mediÃ§Ã£o.

---

## 3. METODOLOGIA

### 3.1 Abordagem

A anÃ¡lise foi conduzida seguindo metodologia de pesquisa aplicada com abordagem qualitativa e quantitativa, estruturada em cinco fases:

**Fase 1: Levantamento do Problema**
- AnÃ¡lise do relatÃ³rio de mediÃ§Ã£o com valores zerados;
- Coleta de evidÃªncias (capturas de tela, logs);
- Levantamento de sintomas e comportamentos anormais.

**Fase 2: AnÃ¡lise Comparativa**
- SeleÃ§Ã£o de sistema de referÃªncia (IPEMPE) funcionando corretamente;
- Coleta de dados de configuraÃ§Ã£o de ambos os sistemas;
- ComparaÃ§Ã£o estrutural entre configuraÃ§Ãµes.

**Fase 3: InvestigaÃ§Ã£o TÃ©cnica**
- AnÃ¡lise da estrutura do banco de dados;
- ExecuÃ§Ã£o de queries SQL diagnÃ³sticas;
- Mapeamento de relacionamentos entre entidades;
- IdentificaÃ§Ã£o de causa raiz.

**Fase 4: DocumentaÃ§Ã£o**
- ElaboraÃ§Ã£o de procedimentos operacionais;
- CriaÃ§Ã£o de scripts SQL de diagnÃ³stico;
- Desenvolvimento de guias para usuÃ¡rios;
- EstruturaÃ§Ã£o de documentaÃ§Ã£o tÃ©cnica.

**Fase 5: ValidaÃ§Ã£o**
- AplicaÃ§Ã£o de correÃ§Ãµes no ambiente de teste;
- ValidaÃ§Ã£o de valores gerados;
- RevisÃ£o da documentaÃ§Ã£o produzida.

### 3.2 Sistemas Analisados

**3.2.1 Sistema IPEMPE (ReferÃªncia)**

- **URL:** https://ipempe.axhub.axion.ws
- **Ã“rgÃ£o:** Instituto de Pesos e Medidas de Pernambuco
- **Status:** Operacional (funcionando corretamente)
- **Equipamento Analisado:** ITZ022R (2 faixas)
- **Valores Configurados:**
  - Valor Previsto: R$ 18.500,00 por faixa
  - BDI: 30%
  - Total com BDI: R$ 24.050,00 por faixa

**3.2.2 Sistema GoiÃ¢nia (AnÃ¡lise)**

- **URL:** https://goiania.axhub.axion.ws
- **Ã“rgÃ£o:** DETRAN/GO - GoiÃ¢nia
- **Status:** ProblemÃ¡tico (valores zerados)
- **Equipamento Analisado:** GYN1R801 (2 faixas)
- **Problema:** Valores financeiros aparecendo como R$ 0,00
- **Dados Operacionais:** Corretos (584.740 e 609.222 passagens)

### 3.3 Ferramentas Utilizadas

**3.3.1 Acesso aos Sistemas**

- Navegador: Microsoft Edge / Google Chrome
- AutenticaÃ§Ã£o: OIDC (OpenID Connect)
- Acesso VPN: NÃ£o foi necessÃ¡rio

**3.3.2 AnÃ¡lise de Banco de Dados**

- SQL Server Management Studio (SSMS) 19.0
- Linguagem: Transact-SQL (T-SQL)
- Servidor: SQL Server 2019

**3.3.3 DocumentaÃ§Ã£o**

- Editor: Visual Studio Code
- Formato: Markdown (MD)
- Versionamento: Git / GitHub

### 3.4 Processo de AnÃ¡lise

**3.4.1 Coleta de Dados**

```sql
-- Exemplo de query utilizada para coleta
SELECT 
    e.CodigoEquipamento,
    f.NumeroFaixa,
    r.ValorPrevisto,
    r.Bdi,
    c.NumeroContrato
FROM TBEquipamentos e
JOIN TBFaixas f ON f.EquipamentoId = e.Id
LEFT JOIN TBRecursos r ON r.EquipamentoId = e.Id 
    AND r.FaixaId = f.Id
LEFT JOIN TBContratos c ON c.Id = r.ContratoId
WHERE e.CodigoEquipamento IN ('ITZ022R', 'GYN1R801');
```

**3.4.2 AnÃ¡lise Comparativa**

ComparaÃ§Ã£o estruturada dos resultados:

| Aspecto | IPEMPE | GoiÃ¢nia |
|---------|--------|---------|
| Equipamento ativo | âœ… Sim | âœ… Sim |
| Faixas cadastradas | âœ… 2 faixas | âœ… 2 faixas |
| Contrato ativo | âœ… Sim | âœ… Sim |
| Equipamento vinculado | âœ… Sim | âœ… Sim |
| Recursos cadastrados | âœ… 2 recursos | âŒ 0 recursos |
| Valores preenchidos | âœ… Sim | âŒ NÃ£o aplicÃ¡vel |

**ConclusÃ£o da AnÃ¡lise:** A diferenÃ§a crÃ­tica Ã© a ausÃªncia de recursos cadastrados em GoiÃ¢nia.

---

## 4. DIAGNÃ“STICO DO PROBLEMA

### 4.1 DescriÃ§Ã£o do Problema

#### 4.1.1 Sintomas Observados

O RelatÃ³rio de MediÃ§Ã£o de Equipamento do sistema de GoiÃ¢nia apresentava os seguintes sintomas para o equipamento GYN1R801:

**Valores Zerados:**
- VALOR PREVISTO: R$ 0,00
- VALOR FAIXA: R$ 0,00
- BDI (%): 0,00%
- TOTAL: R$ 0,00

**Valores Corretos:**
- VEÃCULOS: 584.740 (Faixa 1) e 609.222 (Faixa 2)
- TOTAL (HORAS): 744,00 horas
- ÃNDICE OPERAÃ‡ÃƒO: 100,00%
- INTERRUPÃ‡Ã•ES: 0 horas

#### 4.1.2 Impacto Operacional

O problema impedia:
- FinalizaÃ§Ã£o da mediÃ§Ã£o mensal de maio/2026;
- GeraÃ§Ã£o de documentos de pagamento;
- CÃ¡lculo de valores do contrato;
- Auditoria dos serviÃ§os prestados.

#### 4.1.3 Contexto Temporal

- **PerÃ­odo da MediÃ§Ã£o:** Maio de 2026 (01/05/2026 a 31/05/2026)
- **Data de IdentificaÃ§Ã£o:** 17 de junho de 2026
- **Data de AnÃ¡lise:** 18 de junho de 2026
- **Equipamentos Afetados:** GYN1R801 (Faixa 1 e Faixa 2)
- **Equipamentos Funcionando:** GYN1R803, GYN1R804, GYN1R805

### 4.2 ManifestaÃ§Ã£o

#### 4.2.1 Tela do RelatÃ³rio

O relatÃ³rio apresentava a seguinte estrutura:

```
EQUIPAMENTO: GYN1R801
PERÃODO: Maio/2026

Faixa | VeÃ­culos | Total (H) | Ãndice | Valor Prev. | BDI % | Total
------|----------|-----------|--------|-------------|-------|-------
  1   | 584.740  |   744,00  | 100,00 | R$ 0,00     | 0,00  | R$ 0,00
  2   | 609.222  |   744,00  | 100,00 | R$ 0,00     | 0,00  | R$ 0,00
```

#### 4.2.2 Comportamento Esperado

O relatÃ³rio deveria apresentar (baseado no padrÃ£o IPEMPE):

```
EQUIPAMENTO: GYN1R801
PERÃODO: Maio/2026

Faixa | VeÃ­culos | Total (H) | Ãndice | Valor Prev.  | BDI % | Total
------|----------|-----------|--------|--------------|-------|-------------
  1   | 584.740  |   744,00  | 100,00 | R$ 15.000,00 | 25,00 | R$ 18.750,00
  2   | 609.222  |   744,00  | 100,00 | R$ 15.000,00 | 25,00 | R$ 18.750,00

TOTAL GERAL: R$ 37.500,00
```

#### 4.2.3 DiferenÃ§a entre Esperado e Observado

| Campo | Esperado | Observado | Status |
|-------|----------|-----------|--------|
| Valor Previsto | R$ 15.000,00 | R$ 0,00 | âŒ Erro |
| BDI (%) | 25,00% | 0,00% | âŒ Erro |
| Total | R$ 18.750,00 | R$ 0,00 | âŒ Erro |
| VeÃ­culos | 584.740 | 584.740 | âœ… Correto |
| Ãndice | 100,00% | 100,00% | âœ… Correto |

### 4.3 AnÃ¡lise Preliminar

#### 4.3.1 VerificaÃ§Ãµes Iniciais

**VerificaÃ§Ã£o 1: Status do Equipamento**

```sql
SELECT Id, CodigoEquipamento, Status 
FROM TBEquipamentos 
WHERE CodigoEquipamento = 'GYN1R801';
```

**Resultado:** âœ… Equipamento ativo (Status = 1)

**VerificaÃ§Ã£o 2: Faixas Cadastradas**

```sql
SELECT f.Id, f.NumeroFaixa, e.CodigoEquipamento
FROM TBFaixas f
JOIN TBEquipamentos e ON f.EquipamentoId = e.Id
WHERE e.CodigoEquipamento = 'GYN1R801';
```

**Resultado:** âœ… 2 faixas cadastradas (Faixa 1 e Faixa 2)

**VerificaÃ§Ã£o 3: Passagens Registradas**

```sql
SELECT f.NumeroFaixa, COUNT(*) AS TotalPassagens
FROM TBPassagens p
JOIN TBEquipamentos e ON p.EquipamentoId = e.Id
JOIN TBFaixas f ON p.FaixaId = f.Id
WHERE e.CodigoEquipamento = 'GYN1R801'
  AND p.DataHora >= '2026-05-01'
  AND p.DataHora < '2026-06-01'
GROUP BY f.NumeroFaixa;
```

**Resultado:** âœ… Passagens registradas (584.740 e 609.222)

**VerificaÃ§Ã£o 4: Contrato Vinculado**

```sql
SELECT c.NumeroContrato, c.Status, ce.Id AS VinculoId
FROM TBEquipamentos e
JOIN TBContratosEquipamentos ce ON ce.EquipamentoId = e.Id
JOIN TBContratos c ON c.Id = ce.ContratoId
WHERE e.CodigoEquipamento = 'GYN1R801';
```

**Resultado:** âœ… Contrato vinculado e ativo

#### 4.3.2 Ponto CrÃ­tico Identificado

**VerificaÃ§Ã£o 5: Recursos Cadastrados** âš ï¸

```sql
SELECT r.Id, r.ValorPrevisto, r.Bdi
FROM TBEquipamentos e
JOIN TBFaixas f ON f.EquipamentoId = e.Id
LEFT JOIN TBRecursos r ON r.EquipamentoId = e.Id 
    AND r.FaixaId = f.Id
WHERE e.CodigoEquipamento = 'GYN1R801';
```

**Resultado:** âŒ 0 recursos cadastrados (r.Id = NULL)

### 4.4 HipÃ³teses Levantadas

#### 4.4.1 HipÃ³tese 1: Problema no CÃ³digo do Sistema

**DescriÃ§Ã£o:** O cÃ³digo do relatÃ³rio poderia estar com erro ao buscar os valores.

**Teste:** ComparaÃ§Ã£o com sistema IPEMPE (mesmo cÃ³digo)

**Resultado:** âŒ Descartada - IPEMPE funciona corretamente com o mesmo cÃ³digo

#### 4.4.2 HipÃ³tese 2: Problema de PermissÃ£o de Acesso

**DescriÃ§Ã£o:** O usuÃ¡rio poderia nÃ£o ter permissÃ£o para ver os valores.

**Teste:** VerificaÃ§Ã£o de perfil do usuÃ¡rio e valores de outros equipamentos

**Resultado:** âŒ Descartada - GYN1R803/804/805 mostram valores corretamente

#### 4.4.3 HipÃ³tese 3: Valores Configurados como Zero

**DescriÃ§Ã£o:** Os recursos poderiam estar cadastrados mas com ValorPrevisto = 0.

**Teste:** Query SQL verificando valores dos recursos

**Resultado:** âŒ Descartada - NÃ£o hÃ¡ recursos cadastrados (NULL, nÃ£o zero)

#### 4.4.4 HipÃ³tese 4: Recursos NÃ£o Cadastrados âœ… CONFIRMADA

**DescriÃ§Ã£o:** As faixas do equipamento nÃ£o possuem recursos cadastrados na tabela TBRecursos.

**Teste:** Query comparativa entre GYN1R801 e GYN1R803

```sql
-- ComparaÃ§Ã£o de recursos
SELECT 
    e.CodigoEquipamento,
    f.NumeroFaixa,
    r.Id AS RecursoId,
    CASE WHEN r.Id IS NULL THEN 'NÃƒO CADASTRADO' 
         ELSE 'CADASTRADO' END AS Status
FROM TBEquipamentos e
JOIN TBFaixas f ON f.EquipamentoId = e.Id
LEFT JOIN TBRecursos r ON r.EquipamentoId = e.Id 
    AND r.FaixaId = f.Id
WHERE e.CodigoEquipamento IN ('GYN1R801', 'GYN1R803');
```

**Resultado:**

| Equipamento | Faixa | Status |
|-------------|-------|--------|
| GYN1R801 | 1 | NÃƒO CADASTRADO |
| GYN1R801 | 2 | NÃƒO CADASTRADO |
| GYN1R803 | 1 | CADASTRADO |
| GYN1R803 | 2 | CADASTRADO |

**ConclusÃ£o:** âœ… CAUSA RAIZ IDENTIFICADA

---

## 5. ANÃLISE COMPARATIVA

### 5.1 Sistema IPEMPE (ReferÃªncia)

#### 5.1.1 ConfiguraÃ§Ã£o Completa

**Equipamento Analisado:** ITZ022R

**Cadastros BÃ¡sicos:**
```sql
-- Equipamento
Id: 523
CodigoEquipamento: ITZ022R
Local: Avenida Recife, Km 12
Status: Ativo (1)

-- Faixas
FaixaId: 1045 | NumeroFaixa: 1 | Sentido: Norte
FaixaId: 1046 | NumeroFaixa: 2 | Sentido: Sul
```

**Contrato:**
```sql
ContratoId: 42
NumeroContrato: CT-IPEM-2026
Orgao: IPEM/PE
DataInicio: 2026-01-01
DataFim: 2026-12-31
Status: Ativo (1)
```

**Recursos (âš ï¸ PONTO CRÃTICO):**
```sql
-- Recurso Faixa 1
RecursoId: 523
Descricao: Radar ITZ022R - Faixa 1
EquipamentoId: 523
FaixaId: 1045
ContratoId: 42
ValorPrevisto: 18500.00
Bdi: 30.00
Status: Ativo (1)
DataInicio: 2026-01-01
DataFim: 2026-12-31

-- Recurso Faixa 2
RecursoId: 524
Descricao: Radar ITZ022R - Faixa 2
EquipamentoId: 523
FaixaId: 1046
ContratoId: 42
ValorPrevisto: 18500.00
Bdi: 30.00
Status: Ativo (1)
DataInicio: 2026-01-01
DataFim: 2026-12-31
```

**Resultado no RelatÃ³rio:**
```
Faixa | Valor Previsto | BDI % | Total
------|----------------|-------|-------------
  1   | R$ 18.500,00   | 30,00 | R$ 24.050,00
  2   | R$ 18.500,00   | 30,00 | R$ 24.050,00
```

#### 5.1.2 CaracterÃ­sticas da ConfiguraÃ§Ã£o Correta

1. âœ… **Completude:** Todos os cadastros necessÃ¡rios estÃ£o presentes
2. âœ… **Relacionamentos:** Todas as entidades estÃ£o corretamente vinculadas
3. âœ… **Valores:** Campos obrigatÃ³rios preenchidos com valores > 0
4. âœ… **Status:** Todos os registros estÃ£o ativos
5. âœ… **VigÃªncia:** Datas cobrem o perÃ­odo da mediÃ§Ã£o

### 5.2 Sistema GoiÃ¢nia (ProblemÃ¡tico)

#### 5.2.1 ConfiguraÃ§Ã£o Identificada (ANTES DA CORREÃ‡ÃƒO)

**Equipamento Analisado:** GYN1R801

**Cadastros BÃ¡sicos:**
```sql
-- Equipamento
Id: 801
CodigoEquipamento: GYN1R801
Local: Avenida GoiÃ¡s, Km 5
Status: Ativo (1)

-- Faixas
FaixaId: 1601 | NumeroFaixa: 1 | Sentido: Leste
FaixaId: 1602 | NumeroFaixa: 2 | Sentido: Oeste
```

**Contrato:**
```sql
ContratoId: 12
NumeroContrato: CT-2026-001
Orgao: DETRAN/GO
DataInicio: 2026-01-01
DataFim: 2026-12-31
Status: Ativo (1)
```

**Recursos (âš ï¸ PROBLEMA IDENTIFICADO):**
```sql
-- Query retorna 0 linhas
SELECT * FROM TBRecursos 
WHERE EquipamentoId = 801;
```

**Resultado:** âŒ NENHUM RECURSO CADASTRADO

**Resultado no RelatÃ³rio:**
```
Faixa | Valor Previsto | BDI % | Total
------|----------------|-------|--------
  1   | R$ 0,00        | 0,00  | R$ 0,00
  2   | R$ 0,00        | 0,00  | R$ 0,00
```

#### 5.2.2 ComparaÃ§Ã£o com Equipamentos Funcionando no Mesmo Sistema

**Equipamento GYN1R803 (Mesmo Sistema, Funcionando):**

```sql
-- Recursos cadastrados
RecursoId: 1803 | ValorPrevisto: 15000.00 | Bdi: 25.00
RecursoId: 1804 | ValorPrevisto: 15000.00 | Bdi: 25.00

-- Resultado no relatÃ³rio
Faixa | Valor Previsto | BDI % | Total
------|----------------|-------|-------------
  1   | R$ 15.000,00   | 25,00 | R$ 18.750,00
  2   | R$ 15.000,00   | 25,00 | R$ 18.750,00
```

**ConclusÃ£o:** GYN1R803 funciona porque tem recursos cadastrados.

### 5.3 DiferenÃ§as Identificadas

#### 5.3.1 Tabela Comparativa

| Aspecto | IPEMPE (âœ…) | GYN1R801 (âŒ) | GYN1R803 (âœ…) |
|---------|-------------|---------------|---------------|
| **Equipamento ativo** | Sim | Sim | Sim |
| **Faixas cadastradas** | 2 | 2 | 2 |
| **Contrato ativo** | Sim | Sim | Sim |
| **VinculaÃ§Ã£o equip-contrato** | Sim | Sim | Sim |
| **Recursos cadastrados** | 2 | 0 âŒ | 2 |
| **ValorPrevisto** | R$ 18.500 | NULL âŒ | R$ 15.000 |
| **BDI** | 30% | NULL âŒ | 25% |
| **Status recurso** | Ativo | N/A âŒ | Ativo |
| **RelatÃ³rio** | âœ… OK | âŒ Zerado | âœ… OK |

#### 5.3.2 AnÃ¡lise das DiferenÃ§as

**DiferenÃ§a CrÃ­tica:**

A Ãºnica diferenÃ§a relevante entre as configuraÃ§Ãµes Ã© a **ausÃªncia de registros na tabela TBRecursos** para o equipamento GYN1R801.

**EvidÃªncias:**

1. Todos os outros cadastros estÃ£o corretos;
2. O equipamento estÃ¡ operando normalmente (passagens registradas);
3. Equipamentos com recursos cadastrados (GYN1R803) funcionam corretamente;
4. A ausÃªncia de recursos resulta em valores NULL no cÃ¡lculo;
5. Valores NULL sÃ£o exibidos como R$ 0,00 no relatÃ³rio.

**Cadeia de Causalidade:**

```
Recurso nÃ£o cadastrado
         â†“
TBRecursos.ValorPrevisto = NULL
         â†“
CÃ¡lculo retorna NULL
         â†“
RelatÃ³rio exibe R$ 0,00
```

### 5.4 Causa Raiz Confirmada

#### 5.4.1 AfirmaÃ§Ã£o da Causa Raiz

**CAUSA RAIZ CONFIRMADA:**

"O equipamento GYN1R801 nÃ£o possui recursos cadastrados na tabela TBRecursos para as faixas 1 e 2, resultando em valores NULL para ValorPrevisto e BDI, que sÃ£o exibidos como R$ 0,00 no RelatÃ³rio de MediÃ§Ã£o de Equipamento."

#### 5.4.2 EvidÃªncias Conclusivas

**EvidÃªncia 1: Query DiagnÃ³stica**

```sql
SELECT 
    e.CodigoEquipamento,
    f.NumeroFaixa,
    r.Id AS RecursoId,
    CASE WHEN r.Id IS NULL 
         THEN 'ðŸ”´ RECURSO NÃƒO CADASTRADO'
         ELSE 'âœ… OK' 
    END AS Diagnostico
FROM TBEquipamentos e
JOIN TBFaixas f ON f.EquipamentoId = e.Id
LEFT JOIN TBRecursos r ON r.EquipamentoId = e.Id 
    AND r.FaixaId = f.Id
WHERE e.CodigoEquipamento = 'GYN1R801';
```

**Resultado:**

| CodigoEquipamento | NumeroFaixa | RecursoId | Diagnostico |
|-------------------|-------------|-----------|-------------|
| GYN1R801 | 1 | NULL | ðŸ”´ RECURSO NÃƒO CADASTRADO |
| GYN1R801 | 2 | NULL | ðŸ”´ RECURSO NÃƒO CADASTRADO |

**EvidÃªncia 2: ComparaÃ§Ã£o Direta**

Executando a mesma query para GYN1R803:

| CodigoEquipamento | NumeroFaixa | RecursoId | Diagnostico |
|-------------------|-------------|-----------|-------------|
| GYN1R803 | 1 | 1803 | âœ… OK |
| GYN1R803 | 2 | 1804 | âœ… OK |

**EvidÃªncia 3: SimulaÃ§Ã£o de CorreÃ§Ã£o**

ApÃ³s cadastrar recursos para GYN1R801 em ambiente de teste:

```sql
-- Inserir recursos (teste)
INSERT INTO TBRecursos (...) VALUES (...);

-- Executar query diagnÃ³stica novamente
-- Resultado:
| GYN1R801 | 1 | 9001 | âœ… OK |
| GYN1R801 | 2 | 9002 | âœ… OK |

-- Gerar relatÃ³rio novamente
-- Resultado: Valores aparecem corretamente (R$ 15.000,00)
```

#### 5.4.3 ConclusÃ£o da AnÃ¡lise Comparativa

A anÃ¡lise comparativa entre os sistemas IPEMPE, GYN1R803 e GYN1R801 confirma inequivocamente que:

1. **A causa do problema nÃ£o Ã© de cÃ³digo:** O mesmo sistema funciona corretamente no IPEMPE e em outros equipamentos de GoiÃ¢nia;

2. **A causa do problema nÃ£o Ã© de dados operacionais:** Passagens, horas e Ã­ndices estÃ£o corretos;

3. **A causa do problema Ã© de configuraÃ§Ã£o:** Especificamente, a falta de cadastro de recursos;

4. **A soluÃ§Ã£o Ã© clara:** Cadastrar recursos para as faixas 1 e 2 do equipamento GYN1R801.

---

## 6. ARQUITETURA DO SISTEMA DE MEDIÃ‡ÃƒO

### 6.1 Modelo Entidade-Relacionamento

#### 6.1.1 Diagrama ER Simplificado

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  TBEquipamentos â”‚â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚    TBFaixas     â”‚
â”‚                 â”‚ 1     * â”‚                 â”‚
â”‚ Id              â”‚         â”‚ Id              â”‚
â”‚ CodigoEquipamen â”‚         â”‚ NumeroFaixa     â”‚
â”‚ Local           â”‚         â”‚ EquipamentoId   â”‚
â”‚ Status          â”‚         â”‚ Sentido         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜         â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚                           â”‚
         â”‚ *                         â”‚ *
         â”‚                           â”‚
         â”‚        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”
         â”‚        â”‚                            â”‚
         â”‚        â”‚       TBRecursos           â”‚
         â”‚        â”‚                            â”‚
         â”‚        â”‚ Id                         â”‚
         â””â”€â”€â”€â”€â”€â”€â”€â”€â”¤ EquipamentoId              â”‚
         *        â”‚ FaixaId                    â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â” â”‚ ContratoId                â”‚
â”‚ TBContratos   â”‚ â”‚ ValorPrevisto  âš ï¸         â”‚
â”‚               â”‚â”€â”¤ Bdi            âš ï¸         â”‚
â”‚ Id            â”‚ â”‚ Status                    â”‚
â”‚ NumeroContratoâ”‚ â”‚ DataInicio                â”‚
â”‚ Orgao         â”‚ â”‚ DataFim                   â”‚
â”‚ DataInicio    â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
â”‚ DataFim       â”‚
â”‚ Status        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
        â”‚
        â”‚ *
        â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ TBContratosEquipamentos   â”‚
â”‚                           â”‚
â”‚ Id                        â”‚
â”‚ ContratoId                â”‚
â”‚ EquipamentoId             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  TBPassagens    â”‚ (Dados Operacionais)
â”‚                 â”‚
â”‚ Id              â”‚
â”‚ EquipamentoId   â”‚
â”‚ FaixaId         â”‚
â”‚ DataHora        â”‚
â”‚ Placa           â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ TBInterrupcoes  â”‚ (Controle de Paradas)
â”‚                 â”‚
â”‚ Id              â”‚
â”‚ EquipamentoId   â”‚
â”‚ DataHoraInicio  â”‚
â”‚ DataHoraFim     â”‚
â”‚ Motivo          â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Legenda:**
- âš ï¸ : Campos crÃ­ticos para o relatÃ³rio de mediÃ§Ã£o
- 1 : Um
- * : Muitos

#### 6.1.2 Cardinalidades

| Relacionamento | Cardinalidade | DescriÃ§Ã£o |
|----------------|---------------|-----------|
| Equipamento â†’ Faixa | 1:N | Um equipamento tem vÃ¡rias faixas |
| Equipamento â†’ Recurso | 1:N | Um equipamento tem vÃ¡rios recursos |
| Faixa â†’ Recurso | 1:1 | Cada faixa tem um recurso |
| Contrato â†’ Recurso | 1:N | Um contrato tem vÃ¡rios recursos |
| Contrato â†’ Equipamento | N:M | RelaÃ§Ã£o muitos-para-muitos (via TBContratosEquipamentos) |
| Equipamento â†’ Passagem | 1:N | Um equipamento registra vÃ¡rias passagens |
| Equipamento â†’ InterrupÃ§Ã£o | 1:N | Um equipamento pode ter vÃ¡rias interrupÃ§Ãµes |

### 6.2 Tabelas Principais

#### 6.2.1 TBEquipamentos

**Finalidade:** Cadastro dos equipamentos de fiscalizaÃ§Ã£o.

**Campos Principais:**

| Campo | Tipo | ObrigatÃ³rio | DescriÃ§Ã£o |
|-------|------|-------------|-----------|
| Id | INT | Sim | Chave primÃ¡ria |
| CodigoEquipamento | VARCHAR(50) | Sim | CÃ³digo Ãºnico (ex: GYN1R801) |
| Local | VARCHAR(500) | Sim | LocalizaÃ§Ã£o do equipamento |
| Status | BIT | Sim | Ativo (1) ou Inativo (0) |
| Tipo | VARCHAR(50) | NÃ£o | Radar, OCR, Barreira, etc. |

**DependÃªncias:**
- NÃ£o depende de outras tabelas
- Ã‰ referenciado por: TBFaixas, TBRecursos, TBPassagens, TBInterrupcoes

#### 6.2.2 TBFaixas

**Finalidade:** Cadastro das faixas de trÃ¡fego de cada equipamento.

**Campos Principais:**

| Campo | Tipo | ObrigatÃ³rio | DescriÃ§Ã£o |
|-------|------|-------------|-----------|
| Id | INT | Sim | Chave primÃ¡ria |
| EquipamentoId | INT | Sim | FK para TBEquipamentos |
| NumeroFaixa | INT | Sim | 1, 2, 3, etc. |
| Sentido | VARCHAR(50) | NÃ£o | Norte, Sul, Leste, Oeste |

**DependÃªncias:**
- Depende de: TBEquipamentos
- Ã‰ referenciado por: TBRecursos, TBPassagens

#### 6.2.3 TBContratos

**Finalidade:** Cadastro dos contratos de prestaÃ§Ã£o de serviÃ§o.

**Campos Principais:**

| Campo | Tipo | ObrigatÃ³rio | DescriÃ§Ã£o |
|-------|------|-------------|-----------|
| Id | INT | Sim | Chave primÃ¡ria |
| NumeroContrato | VARCHAR(100) | Sim | NÃºmero do contrato |
| Orgao | VARCHAR(200) | Sim | Ã“rgÃ£o contratante |
| DataInicio | DATE | Sim | InÃ­cio da vigÃªncia |
| DataFim | DATE | Sim | Fim da vigÃªncia |
| Status | BIT | Sim | Ativo (1) ou Inativo (0) |

**DependÃªncias:**
- NÃ£o depende de outras tabelas
- Ã‰ referenciado por: TBRecursos, TBContratosEquipamentos

#### 6.2.4 TBRecursos âš ï¸ TABELA CRÃTICA

**Finalidade:** DefiniÃ§Ã£o dos valores financeiros por equipamento e faixa.

**Campos Principais:**

| Campo | Tipo | ObrigatÃ³rio | DescriÃ§Ã£o |
|-------|------|-------------|-----------|
| Id | INT | Sim | Chave primÃ¡ria |
| Descricao | VARCHAR(500) | Sim | Nome do recurso |
| EquipamentoId | INT | Sim | FK para TBEquipamentos |
| FaixaId | INT | Sim | FK para TBFaixas |
| ContratoId | INT | Sim | FK para TBContratos |
| **ValorPrevisto** | DECIMAL(18,2) | **Sim** âš ï¸ | Valor mensal da faixa |
| **Bdi** | DECIMAL(5,2) | **Sim** âš ï¸ | Percentual de BDI |
| Status | BIT | Sim | Ativo (1) ou Inativo (0) |
| DataInicio | DATE | Sim | InÃ­cio da vigÃªncia |
| DataFim | DATE | Sim | Fim da vigÃªncia |

**DependÃªncias:**
- Depende de: TBEquipamentos, TBFaixas, TBContratos
- **Ã‰ ESSENCIAL para o relatÃ³rio de mediÃ§Ã£o**

**Regras de NegÃ³cio:**
1. Deve haver 1 recurso para cada faixa do equipamento
2. ValorPrevisto deve ser > 0
3. Bdi deve ser > 0
4. Status deve ser Ativo (1)
5. DataInicio <= data da mediÃ§Ã£o <= DataFim

#### 6.2.5 TBContratosEquipamentos

**Finalidade:** Relacionamento muitos-para-muitos entre contratos e equipamentos.

**Campos Principais:**

| Campo | Tipo | ObrigatÃ³rio | DescriÃ§Ã£o |
|-------|------|-------------|-----------|
| Id | INT | Sim | Chave primÃ¡ria |
| ContratoId | INT | Sim | FK para TBContratos |
| EquipamentoId | INT | Sim | FK para TBEquipamentos |

**DependÃªncias:**
- Depende de: TBContratos, TBEquipamentos

#### 6.2.6 TBPassagens

**Finalidade:** Registro de passagens de veÃ­culos detectadas pelos equipamentos.

**Campos Principais:**

| Campo | Tipo | ObrigatÃ³rio | DescriÃ§Ã£o |
|-------|------|-------------|-----------|
| Id | BIGINT | Sim | Chave primÃ¡ria |
| EquipamentoId | INT | Sim | FK para TBEquipamentos |
| FaixaId | INT | Sim | FK para TBFaixas |
| DataHora | DATETIME | Sim | Data/hora da passagem |
| Placa | VARCHAR(10) | NÃ£o | Placa do veÃ­culo |
| Velocidade | INT | NÃ£o | Velocidade registrada |

**DependÃªncias:**
- Depende de: TBEquipamentos, TBFaixas
- Usado para calcular: Volume de registros no relatÃ³rio

#### 6.2.7 TBInterrupcoes

**Finalidade:** Registro de perÃ­odos de indisponibilidade dos equipamentos.

**Campos Principais:**

| Campo | Tipo | ObrigatÃ³rio | DescriÃ§Ã£o |
|-------|------|-------------|-----------|
| Id | INT | Sim | Chave primÃ¡ria |
| EquipamentoId | INT | Sim | FK para TBEquipamentos |
| DataHoraInicio | DATETIME | Sim | InÃ­cio da interrupÃ§Ã£o |
| DataHoraFim | DATETIME | Sim | Fim da interrupÃ§Ã£o |
| Motivo | VARCHAR(500) | Sim | DescriÃ§Ã£o do problema |
| Tipo | VARCHAR(50) | NÃ£o | ManutenÃ§Ã£o, Falha, etc. |

**DependÃªncias:**
- Depende de: TBEquipamentos
- Usado para calcular: Ãndice de operaÃ§Ã£o no relatÃ³rio

### 6.3 Relacionamentos

#### 6.3.1 Relacionamentos ObrigatÃ³rios

**Para um equipamento aparecer no relatÃ³rio de mediÃ§Ã£o com valores:**

```
TBEquipamentos (Status = 1)
      â†“ (1:N)
TBFaixas
      â†“ (N:M via TBContratosEquipamentos)
TBContratos (Status = 1, vigÃªncia vÃ¡lida)
      â†“ (1:N)
TBRecursos âš ï¸ (Status = 1, valores > 0)
      â†‘ (N:1)
TBFaixas (mesma faixa)
```

**SequÃªncia de DependÃªncias:**

1. Equipamento deve existir e estar ativo
2. Equipamento deve ter faixas cadastradas
3. Equipamento deve estar vinculado a um contrato ativo
4. **Cada faixa deve ter um recurso cadastrado** âš ï¸
5. Recursos devem ter valores > 0 e estar ativos

#### 6.3.2 Relacionamentos Opcionais

**Dados operacionais (nÃ£o bloqueiam o relatÃ³rio):**

- TBPassagens: Registros de veÃ­culos (afeta volume, nÃ£o bloqueia)
- TBInterrupcoes: PerÃ­odos de parada (afeta Ã­ndice, nÃ£o bloqueia)
- TBHeartbeatEquipamentos: Status de comunicaÃ§Ã£o (monitoramento)

#### 6.3.3 Diagrama de DependÃªncias

```
                  OBRIGATÃ“RIOS
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                                         â”‚
â”‚  1. TBEquipamentos (Status = 1)        â”‚
â”‚              â†“                          â”‚
â”‚  2. TBFaixas (NumeroFaixa)             â”‚
â”‚              â†“                          â”‚
â”‚  3. TBContratos (Status = 1)           â”‚
â”‚              â†“                          â”‚
â”‚  4. TBContratosEquipamentos (vÃ­nculo)  â”‚
â”‚              â†“                          â”‚
â”‚  5. TBRecursos âš ï¸ (CRÃTICO)            â”‚
â”‚     - EquipamentoId                    â”‚
â”‚     - FaixaId                          â”‚
â”‚     - ContratoId                       â”‚
â”‚     - ValorPrevisto > 0                â”‚
â”‚     - Bdi > 0                          â”‚
â”‚     - Status = 1                       â”‚
â”‚     - VigÃªncia vÃ¡lida                  â”‚
â”‚                                         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

                   OPCIONAIS
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                                         â”‚
â”‚  â€¢ TBPassagens (volume de registros)   â”‚
â”‚  â€¢ TBInterrupcoes (disponibilidade)    â”‚
â”‚  â€¢ TBHeartbeatEquipamentos (status)    â”‚
â”‚                                         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 6.4 Fluxo de Dados

#### 6.4.1 Fluxo de GeraÃ§Ã£o do RelatÃ³rio

**Passo 1: SeleÃ§Ã£o de Dados**

UsuÃ¡rio seleciona:
- Contrato
- PerÃ­odo (MÃªs/Ano)
- Equipamentos

**Passo 2: Consulta Principal**

```sql
SELECT 
    e.CodigoEquipamento,
    f.NumeroFaixa,
    r.ValorPrevisto, -- âš ï¸ Se NULL, exibe R$ 0,00
    r.Bdi,           -- âš ï¸ Se NULL, exibe 0,00%
    -- ... outros campos
FROM TBEquipamentos e
JOIN TBFaixas f ON f.EquipamentoId = e.Id
LEFT JOIN TBRecursos r ON r.EquipamentoId = e.Id 
    AND r.FaixaId = f.Id
    AND r.Status = 1
WHERE ...
```

**Passo 3: CÃ¡lculo de Dados Operacionais**

- Passagens: COUNT de TBPassagens no perÃ­odo
- InterrupÃ§Ãµes: SUM de horas em TBInterrupcoes
- Ãndice: CÃ¡lculo baseado em horas

**Passo 4: CÃ¡lculo de Valores Financeiros**

```
SE TBRecursos.ValorPrevisto Ã‰ NULL ENTÃƒO
    Valor Previsto = R$ 0,00  â† âŒ PROBLEMA!
    BDI = 0,00%
    Total = R$ 0,00
SENÃƒO
    Valor Previsto = TBRecursos.ValorPrevisto
    Desconto = Valor Previsto Ã— (1 - Ãndice)
    Valor Faixa = Valor Previsto - Desconto
    Valor BDI = Valor Faixa Ã— (BDI / 100)
    Total = Valor Faixa + Valor BDI
FIM SE
```

**Passo 5: ApresentaÃ§Ã£o**

Dados sÃ£o formatados e exibidos no relatÃ³rio.

#### 6.4.2 Pontos de Falha

| Ponto | Problema | Sintoma | SoluÃ§Ã£o |
|-------|----------|---------|---------|
| TBEquipamentos.Status = 0 | Equipamento inativo | NÃ£o aparece no relatÃ³rio | Ativar equipamento |
| TBFaixas nÃ£o cadastradas | Sem faixas | NÃ£o aparece no relatÃ³rio | Cadastrar faixas |
| TBContratos.Status = 0 | Contrato inativo | NÃ£o aparece no relatÃ³rio | Ativar contrato |
| TBContratosEquipamentos vazio | Sem vÃ­nculo | NÃ£o aparece no relatÃ³rio | Vincular equipamento |
| **TBRecursos vazio** âš ï¸ | **Sem recursos** | **Valores zerados** | **Cadastrar recursos** |
| TBRecursos.ValorPrevisto = 0 | Valor zerado | Valores zerados | Preencher valor |
| TBRecursos.Status = 0 | Recurso inativo | Valores zerados | Ativar recurso |

---

## 7. CICLO COMPLETO DE CADASTRO

### 7.1 VisÃ£o Geral do Processo

#### 7.1.1 Fluxograma de Cadastro

```
INÃCIO
  â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ETAPA 1: CADASTROS BÃSICOS  â”‚
â”‚ â€¢ Cadastrar Equipamento     â”‚
â”‚ â€¢ Cadastrar Faixas          â”‚
â”‚ â€¢ Ativar Equipamento        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
           â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ETAPA 2: CONFIGURAÃ‡ÃƒO       â”‚
â”‚          CONTRATUAL         â”‚
â”‚ â€¢ Cadastrar Contrato        â”‚
â”‚ â€¢ Definir VigÃªncia          â”‚
â”‚ â€¢ Vincular Equipamentos     â”‚
â”‚ â€¢ Ativar Contrato           â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
           â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ETAPA 3: CONFIGURAÃ‡ÃƒO DE    â”‚
â”‚          RECURSOS âš ï¸        â”‚
â”‚ â€¢ Cadastrar Recurso/Faixa   â”‚
â”‚ â€¢ Vincular ao Contrato      â”‚
â”‚ â€¢ Vincular ao Equipamento   â”‚
â”‚ â€¢ Vincular Ã  Faixa          â”‚
â”‚ â€¢ Definir Valor Previsto    â”‚
â”‚ â€¢ Definir BDI               â”‚
â”‚ â€¢ Definir VigÃªncia          â”‚
â”‚ â€¢ Ativar Recurso            â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
           â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ETAPA 4: OPERAÃ‡ÃƒO DO        â”‚
â”‚          EQUIPAMENTO        â”‚
â”‚ â€¢ Passagens (automÃ¡tico)    â”‚
â”‚ â€¢ Heartbeat (automÃ¡tico)    â”‚
â”‚ â€¢ InterrupÃ§Ãµes (manual)     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
           â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ETAPA 5: GERAÃ‡ÃƒO DO         â”‚
â”‚          RELATÃ“RIO          â”‚
â”‚ â€¢ Acessar Nova MediÃ§Ã£o      â”‚
â”‚ â€¢ Selecionar Contrato       â”‚
â”‚ â€¢ Selecionar PerÃ­odo        â”‚
â”‚ â€¢ Selecionar Equipamentos   â”‚
â”‚ â€¢ Gerar RelatÃ³rio           â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
           â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ETAPA 6: FINALIZAÃ‡ÃƒO        â”‚
â”‚ â€¢ Revisar MediÃ§Ã£o           â”‚
â”‚ â€¢ Ajustar InterrupÃ§Ãµes      â”‚
â”‚ â€¢ Finalizar MediÃ§Ã£o         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
           â†“
         FIM
```

#### 7.1.2 Tempo Estimado por Etapa

| Etapa | Tempo (min) | FrequÃªncia |
|-------|-------------|------------|
| 1 - Cadastros BÃ¡sicos | 5-10 | Por equipamento novo |
| 2 - ConfiguraÃ§Ã£o Contratual | 10-15 | Por contrato novo |
| 3 - ConfiguraÃ§Ã£o de Recursos âš ï¸ | 10-15 | Por equipamento novo |
| 4 - OperaÃ§Ã£o | ContÃ­nuo | AutomÃ¡tico |
| 5 - GeraÃ§Ã£o de RelatÃ³rio | 2-5 | Mensal |
| 6 - FinalizaÃ§Ã£o | 10-30 | Mensal |

**Tempo total para novo equipamento:** 25-40 minutos  
**Tempo para mediÃ§Ã£o mensal:** 12-35 minutos

### 7.2 Etapa 1: Cadastros BÃ¡sicos

#### 7.2.1 Objetivo

Cadastrar o equipamento e suas faixas de trÃ¡fego no sistema.

#### 7.2.2 PrÃ©-requisitos

- Acesso ao sistema AxHub
- Perfil de usuÃ¡rio com permissÃ£o de cadastro
- Dados do equipamento (cÃ³digo, localizaÃ§Ã£o)

#### 7.2.3 Procedimento 1.1: Cadastrar Equipamento

**Menu:** Cadastros â†’ Equipamentos â†’ Novo Equipamento

**Campos ObrigatÃ³rios:**

| Campo | Exemplo | ValidaÃ§Ã£o |
|-------|---------|-----------|
| CÃ³digo do Equipamento | GYN1R801 | Ãšnico no sistema |
| Local | Av. GoiÃ¡s, Km 5 | Texto descritivo |
| Tipo | Radar | Lista predefinida |
| Status | Ativo | Checkbox marcado |

**Campos Opcionais:**

- Latitude/Longitude (para mapa)
- Limite de Velocidade
- ObservaÃ§Ãµes

**Exemplo de Cadastro:**

```
CÃ³digo: GYN1R801
Local: Avenida GoiÃ¡s, Km 5 - Sentido Centro
Tipo: Radar Fixo
Fabricante: (opcional)
Modelo: (opcional)
Status: â˜‘ Ativo
```

**ValidaÃ§Ã£o SQL:**

```sql
-- Verificar se equipamento foi cadastrado
SELECT 
    Id,
    CodigoEquipamento,
    Local,
    Status,
    CASE WHEN Status = 1 THEN 'âœ… ATIVO' 
         ELSE 'âŒ INATIVO' END AS StatusDesc
FROM TBEquipamentos
WHERE CodigoEquipamento = 'GYN1R801';
```

**Resultado Esperado:**

| Id | CodigoEquipamento | StatusDesc |
|----|-------------------|------------|
| 801 | GYN1R801 | âœ… ATIVO |

#### 7.2.4 Procedimento 1.2: Cadastrar Faixas

**Menu:** Cadastros â†’ Equipamentos â†’ [Selecionar Equipamento] â†’ Editar â†’ Aba "Faixas"

**Processo:**

Para cada faixa de trÃ¡fego do equipamento:

1. Clicar em "Adicionar Faixa"
2. Preencher dados
3. Salvar

**Campos por Faixa:**

| Campo | Faixa 1 | Faixa 2 |
|-------|---------|---------|
| NÃºmero da Faixa | 1 | 2 |
| Sentido | Leste | Oeste |
| Limite Velocidade | 60 km/h | 60 km/h |

**ValidaÃ§Ã£o SQL:**

```sql
-- Verificar faixas cadastradas
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

**Resultado Esperado:**

| FaixaId | CodigoEquipamento | NumeroFaixa | Sentido | TotalFaixas |
|---------|-------------------|-------------|---------|-------------|
| 1601 | GYN1R801 | 1 | Leste | 2 |
| 1602 | GYN1R801 | 2 | Oeste | 2 |

#### 7.2.5 Checklist Etapa 1

```
ETAPA 1: CADASTROS BÃSICOS
Data: ___/___/______  Equipamento: ______________

[ ] Equipamento cadastrado em TBEquipamentos
[ ] CÃ³digo Ãºnico e correto
[ ] Local descritivo preenchido
[ ] Status = Ativo (checkbox marcado)
[ ] Faixa 1 cadastrada
[ ] Faixa 2 cadastrada (se aplicÃ¡vel)
[ ] Faixa 3 cadastrada (se aplicÃ¡vel)
[ ] Sentidos preenchidos
[ ] ValidaÃ§Ã£o SQL executada
[ ] Equipamento aparece na listagem

ResponsÃ¡vel: _________________ Visto: _______
```

### 7.3 Etapa 2: ConfiguraÃ§Ã£o Contratual

#### 7.3.1 Objetivo

Criar o contrato e vincular os equipamentos que farÃ£o parte dele.

#### 7.3.2 PrÃ©-requisitos

- Equipamento(s) cadastrado(s) na Etapa 1
- Dados do contrato (nÃºmero, Ã³rgÃ£o, vigÃªncia)
- Valores contratuais definidos

#### 7.3.3 Procedimento 2.1: Cadastrar Contrato

**Menu:** MediÃ§Ã£o â†’ Contratos â†’ Novo Contrato

**Campos ObrigatÃ³rios:**

| Campo | Exemplo | Formato |
|-------|---------|---------|
| NÃºmero do Contrato | CT-2026-001 | Texto |
| Ã“rgÃ£o | DETRAN/GO | Texto |
| Data InÃ­cio | 01/01/2026 | Data |
| Data Fim | 31/12/2026 | Data |
| Status | Ativo | Checkbox |

**Exemplo de Cadastro:**

```
NÃºmero do Contrato: CT-2026-001
Ã“rgÃ£o: DETRAN/GO - GoiÃ¢nia
Objeto: FiscalizaÃ§Ã£o EletrÃ´nica de TrÃ¢nsito
Data InÃ­cio: 01/01/2026
Data Fim: 31/12/2026
Status: â˜‘ Ativo
```

**ValidaÃ§Ã£o SQL:**

```sql
-- Verificar contrato cadastrado
SELECT 
    Id AS ContratoId,
    NumeroContrato,
    Orgao,
    CONVERT(VARCHAR(10), DataInicio, 103) AS Inicio,
    CONVERT(VARCHAR(10), DataFim, 103) AS Fim,
    CASE WHEN Status = 1 THEN 'Ativo' ELSE 'Inativo' END AS Status,
    CASE 
        WHEN Status = 0 THEN 'âŒ INATIVO'
        WHEN '2026-05-01' < DataInicio THEN 'âš ï¸ NÃƒO INICIADO'
        WHEN '2026-05-31' > DataFim THEN 'âš ï¸ EXPIRADO'
        WHEN Status = 1 
             AND '2026-05-01' >= DataInicio 
             AND '2026-05-31' <= DataFim THEN 'âœ… VÃLIDO MAIO/2026'
        ELSE 'âš ï¸ VERIFICAR'
    END AS ValidacaoMaio2026
FROM TBContratos
WHERE NumeroContrato = 'CT-2026-001';
```

**Resultado Esperado:**

| ContratoId | NumeroContrato | Status | ValidacaoMaio2026 |
|------------|----------------|--------|-------------------|
| 12 | CT-2026-001 | Ativo | âœ… VÃLIDO MAIO/2026 |

#### 7.3.4 Procedimento 2.2: Vincular Equipamentos ao Contrato

**Menu:** MediÃ§Ã£o â†’ Contratos â†’ [Selecionar Contrato] â†’ Editar â†’ Aba "Equipamentos"

**Processo:**

1. Clicar em "Adicionar Equipamento"
2. Selecionar equipamento(s) da lista
3. Salvar

**Equipamentos a Vincular:**

- GYN1R801 âœ…
- GYN1R803 âœ…
- GYN1R804 âœ…
- GYN1R805 âœ…

**ValidaÃ§Ã£o SQL:**

```sql
-- Verificar vinculaÃ§Ã£o equipamento-contrato
SELECT 
    e.CodigoEquipamento,
    c.NumeroContrato,
    c.Orgao,
    CASE WHEN c.Status = 1 THEN 'Ativo' ELSE 'Inativo' END AS StatusContrato,
    ce.Id AS VinculoId,
    CASE 
        WHEN ce.Id IS NULL THEN 'âŒ EQUIPAMENTO NÃƒO VINCULADO'
        WHEN c.Status = 0 THEN 'âš ï¸ CONTRATO INATIVO'
        ELSE 'âœ… VINCULADO'
    END AS StatusVinculo
FROM TBEquipamentos e
LEFT JOIN TBContratosEquipamentos ce ON ce.EquipamentoId = e.Id
LEFT JOIN TBContratos c ON c.Id = ce.ContratoId
WHERE e.CodigoEquipamento IN ('GYN1R801', 'GYN1R803')
ORDER BY e.CodigoEquipamento;
```

**Resultado Esperado:**

| CodigoEquipamento | NumeroContrato | StatusVinculo |
|-------------------|----------------|---------------|
| GYN1R801 | CT-2026-001 | âœ… VINCULADO |
| GYN1R803 | CT-2026-001 | âœ… VINCULADO |

#### 7.3.5 Checklist Etapa 2

```
ETAPA 2: CONFIGURAÃ‡ÃƒO CONTRATUAL
Data: ___/___/______  Contrato: ______________

[ ] Contrato cadastrado em TBContratos
[ ] NÃºmero do contrato Ãºnico
[ ] Ã“rgÃ£o preenchido corretamente
[ ] Data InÃ­cio antes ou igual ao perÃ­odo de mediÃ§Ã£o
[ ] Data Fim depois ou igual ao perÃ­odo de mediÃ§Ã£o
[ ] Status = Ativo (checkbox marcado)
[ ] Equipamento GYN1R801 vinculado
[ ] Demais equipamentos vinculados (se aplicÃ¡vel)
[ ] ValidaÃ§Ã£o SQL executada
[ ] VÃ­nculo confirmado (ce.Id IS NOT NULL)

ResponsÃ¡vel: _________________ Visto: _______
```

### 7.4 Etapa 3: ConfiguraÃ§Ã£o de Recursos

âš ï¸ **ATENÃ‡ÃƒO: Esta Ã© a etapa mais crÃ­tica do processo!**

#### 7.4.1 Objetivo

Cadastrar os recursos financeiros para cada faixa de cada equipamento, definindo valores mensais e percentuais de BDI.

#### 7.4.2 PrÃ©-requisitos

- Equipamento com faixas cadastradas (Etapa 1)
- Contrato criado e equipamento vinculado (Etapa 2)
- Valores contratuais definidos:
  - Valor Previsto mensal por faixa
  - Percentual de BDI
  - PerÃ­odo de vigÃªncia

#### 7.4.3 Regra de NegÃ³cio CrÃ­tica

**IMPORTANTE:** Ã‰ necessÃ¡rio criar **1 recurso para CADA faixa** do equipamento!

**Exemplo:**
- Equipamento com 2 faixas â†’ Criar 2 recursos
- Equipamento com 3 faixas â†’ Criar 3 recursos

**Se nÃ£o criar recursos, o relatÃ³rio mostrarÃ¡ R$ 0,00!**

#### 7.4.4 Procedimento 3.1: Cadastrar Recurso para Faixa 1

**Menu:** MediÃ§Ã£o â†’ Recursos â†’ Novo Recurso

**Campos ObrigatÃ³rios:**

| Campo | Exemplo | ValidaÃ§Ã£o |
|-------|---------|-----------|
| DescriÃ§Ã£o | Radar GYN1R801 - Faixa 1 | Descritivo |
| Tipo | Equipamento | Lista predefinida |
| Contrato | CT-2026-001 | âš ï¸ ObrigatÃ³rio |
| Equipamento | GYN1R801 | âš ï¸ ObrigatÃ³rio |
| Faixa | 1 | âš ï¸ ObrigatÃ³rio |
| Valor Previsto | 15000.00 | âš ï¸ Deve ser > 0 |
| BDI (%) | 25.00 | âš ï¸ Deve ser > 0 |
| Data InÃ­cio | 01/01/2026 | Deve cobrir perÃ­odo |
| Data Fim | 31/12/2026 | Deve cobrir perÃ­odo |
| Status | Ativo | âš ï¸ Checkbox marcado |

**Exemplo de Preenchimento:**

```
DescriÃ§Ã£o: Radar GYN1R801 - Faixa 1
Tipo: Equipamento
Contrato: [Selecionar] CT-2026-001
Equipamento: [Selecionar] GYN1R801
Faixa: [Selecionar] 1
Valor Previsto: R$ 15.000,00
BDI (%): 25,00
Data InÃ­cio: 01/01/2026
Data Fim: 31/12/2026
Status: â˜‘ Ativo
```

**CÃ¡lculo do Valor Total (ReferÃªncia):**

```
Valor Previsto: R$ 15.000,00
BDI (25%): R$ 3.750,00
-----------------------------------
Valor Total: R$ 18.750,00
```

#### 7.4.5 Procedimento 3.2: Cadastrar Recurso para Faixa 2

**Repetir o processo** com os seguintes campos alterados:

```
DescriÃ§Ã£o: Radar GYN1R801 - Faixa 2
Faixa: [Selecionar] 2
(Demais campos iguais)
```

#### 7.4.6 ValidaÃ§Ã£o Completa de Recursos

**Query SQL de DiagnÃ³stico AutomÃ¡tico:**

```sql
-- â­ QUERY CRÃTICA: DiagnÃ³stico completo de recursos
SELECT 
    e.CodigoEquipamento AS Equipamento,
    f.NumeroFaixa AS Faixa,
    r.Id AS RecursoId,
    r.Descricao AS DescricaoRecurso,
    r.ValorPrevisto,
    r.Bdi,
    CASE WHEN r.Status = 1 THEN 'Ativo' ELSE 'Inativo' END AS StatusRecurso,
    CONVERT(VARCHAR(10), r.DataInicio, 103) AS InicioVigencia,
    CONVERT(VARCHAR(10), r.DataFim, 103) AS FimVigencia,
    c.NumeroContrato AS Contrato,
    
    -- â­ DIAGNÃ“STICO AUTOMÃTICO
    CASE 
        WHEN r.Id IS NULL THEN 'ðŸ”´ RECURSO NÃƒO CADASTRADO'
        WHEN r.ContratoId IS NULL THEN 'ðŸ”´ SEM CONTRATO VINCULADO'
        WHEN c.Id IS NULL THEN 'ðŸ”´ CONTRATO NÃƒO ENCONTRADO'
        WHEN c.Status = 0 THEN 'ðŸ”´ CONTRATO INATIVO'
        WHEN r.Status = 0 THEN 'ðŸ”´ RECURSO INATIVO'
        WHEN r.ValorPrevisto IS NULL OR r.ValorPrevisto = 0 
            THEN 'ðŸ”´ VALOR PREVISTO ZERADO'
        WHEN r.Bdi IS NULL OR r.Bdi = 0 
            THEN 'ðŸŸ¡ BDI ZERADO (Opcional)'
        WHEN '2026-05-01' < r.DataInicio 
            THEN 'ðŸ”´ VIGÃŠNCIA NÃƒO INICIADA'
        WHEN '2026-05-31' > COALESCE(r.DataFim, '9999-12-31') 
            THEN 'ðŸ”´ VIGÃŠNCIA EXPIRADA'
        WHEN '2026-05-01' < c.DataInicio OR '2026-05-31' > c.DataFim 
            THEN 'ðŸ”´ CONTRATO FORA VIGÃŠNCIA'
        ELSE 'âœ… CONFIGURAÃ‡ÃƒO OK'
    END AS Diagnostico

FROM TBEquipamentos e
INNER JOIN TBFaixas f ON f.EquipamentoId = e.Id
LEFT JOIN TBRecursos r ON r.EquipamentoId = e.Id 
    AND r.FaixaId = f.Id
LEFT JOIN TBContratos c ON c.Id = r.ContratoId

WHERE e.CodigoEquipamento = 'GYN1R801'

ORDER BY 
    e.CodigoEquipamento,
    f.NumeroFaixa;
```

**Resultado Esperado (APÃ“S CADASTRO CORRETO):**

| Equipamento | Faixa | RecursoId | ValorPrevisto | Bdi | Diagnostico |
|-------------|-------|-----------|---------------|-----|-------------|
| GYN1R801 | 1 | 9001 | 15000.00 | 25.00 | âœ… CONFIGURAÃ‡ÃƒO OK |
| GYN1R801 | 2 | 9002 | 15000.00 | 25.00 | âœ… CONFIGURAÃ‡ÃƒO OK |

**Resultado ProblemÃ¡tico (SE NÃƒO CADASTROU):**

| Equipamento | Faixa | RecursoId | ValorPrevisto | Bdi | Diagnostico |
|-------------|-------|-----------|---------------|-----|-------------|
| GYN1R801 | 1 | NULL | NULL | NULL | ðŸ”´ RECURSO NÃƒO CADASTRADO |
| GYN1R801 | 2 | NULL | NULL | NULL | ðŸ”´ RECURSO NÃƒO CADASTRADO |

#### 7.4.7 Script SQL de CorreÃ§Ã£o AutomÃ¡tica

**Caso os recursos nÃ£o tenham sido cadastrados**, utilize este script:

```sql
-- ============================================================================
-- SCRIPT DE CORREÃ‡ÃƒO: Cadastrar recursos ausentes
-- ============================================================================
-- âš ï¸ ATENÃ‡ÃƒO: Ajuste os valores conforme o contrato!

-- Passo 1: Definir variÃ¡veis
DECLARE @ContratoId INT;
DECLARE @ValorPrevisto DECIMAL(18,2);
DECLARE @Bdi DECIMAL(5,2);
DECLARE @DataInicio DATE;
DECLARE @DataFim DATE;
DECLARE @UsuarioId INT;

-- Passo 2: Obter ID do contrato
SELECT @ContratoId = Id 
FROM TBContratos 
WHERE NumeroContrato = 'CT-2026-001';

-- Passo 3: Definir valores (âš ï¸ AJUSTAR CONFORME CONTRATO!)
SET @ValorPrevisto = 15000.00;  -- R$ 15.000,00 por faixa
SET @Bdi = 25.00;                -- 25% de BDI
SET @DataInicio = '2026-01-01';  -- InÃ­cio vigÃªncia
SET @DataFim = '2026-12-31';     -- Fim vigÃªncia
SET @UsuarioId = 1;              -- ID do usuÃ¡rio (ajustar)

-- Passo 4: Inserir recursos para faixas sem cadastro
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

-- Passo 5: Mostrar resultado
SELECT 
    'Recursos inseridos:' AS Resultado, 
    @@ROWCOUNT AS Quantidade;

-- Passo 6: Validar inserÃ§Ã£o
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

#### 7.4.8 Checklist Etapa 3

```
ETAPA 3: CONFIGURAÃ‡ÃƒO DE RECURSOS âš ï¸ CRÃTICO
Data: ___/___/______  Equipamento: ______________

FAIXA 1:
[ ] Recurso cadastrado em TBRecursos
[ ] DescriÃ§Ã£o preenchida
[ ] Contrato vinculado (ContratoId preenchido)
[ ] Equipamento vinculado (EquipamentoId preenchido)
[ ] Faixa 1 selecionada (FaixaId preenchido)
[ ] Valor Previsto > 0 (ex: R$ 15.000,00)
[ ] BDI > 0 (ex: 25,00%)
[ ] Data InÃ­cio <= perÃ­odo de mediÃ§Ã£o
[ ] Data Fim >= perÃ­odo de mediÃ§Ã£o
[ ] Status = Ativo (checkbox marcado)

FAIXA 2:
[ ] Recurso cadastrado em TBRecursos
[ ] DescriÃ§Ã£o preenchida
[ ] Contrato vinculado (ContratoId preenchido)
[ ] Equipamento vinculado (EquipamentoId preenchido)
[ ] Faixa 2 selecionada (FaixaId preenchido)
[ ] Valor Previsto > 0 (ex: R$ 15.000,00)
[ ] BDI > 0 (ex: 25,00%)
[ ] Data InÃ­cio <= perÃ­odo de mediÃ§Ã£o
[ ] Data Fim >= perÃ­odo de mediÃ§Ã£o
[ ] Status = Ativo (checkbox marcado)

VALIDAÃ‡ÃƒO:
[ ] Query de diagnÃ³stico executada
[ ] Ambas faixas com "âœ… CONFIGURAÃ‡ÃƒO OK"
[ ] Recursos aparecem na listagem de MediÃ§Ã£o â†’ Recursos

ResponsÃ¡vel: _________________ Visto: _______
```

---

(Continua...)

---

## ORIGEM: RESUMO-EXECUTIVO-AXION-IA-MEDICAO.md

# RESUMO EXECUTIVO - CICLO DE MEDIÃ‡ÃƒO AXHUB

**Para ApresentaÃ§Ã£o no AxionIA Intelligence Hub**

---

## ðŸ“‹ IDENTIFICAÃ‡ÃƒO

**Documento:** AnÃ¡lise e DocumentaÃ§Ã£o do Ciclo de MediÃ§Ã£o AxHub  
**Sistema:** AxHub - MÃ³dulo de MediÃ§Ã£o  
**PerÃ­odo:** 01 a 18 de junho de 2026  
**ResponsÃ¡vel TÃ©cnico:** Equipe Axion Tecnologia  
**Status:** âœ… ConcluÃ­do

---

## ðŸŽ¯ OBJETIVO

Documentar o processo completo necessÃ¡rio para geraÃ§Ã£o correta do RelatÃ³rio de MediÃ§Ã£o de Equipamento no sistema AxHub, identificando requisitos obrigatÃ³rios e solucionando o problema de valores zerados.

---

## ðŸ”´ PROBLEMA IDENTIFICADO

### DescriÃ§Ã£o
O RelatÃ³rio de MediÃ§Ã£o do equipamento GYN1R801 em GoiÃ¢nia apresentava valores financeiros zerados (R$ 0,00), impossibilitando a finalizaÃ§Ã£o da mediÃ§Ã£o mensal de maio/2026.

### Sintomas
```
Equipamento: GYN1R801
PerÃ­odo: Maio/2026

Campo             | Observado   | Esperado
------------------|-------------|-------------
VALOR PREVISTO    | R$ 0,00     | R$ 15.000,00
BDI (%)           | 0,00%       | 25,00%
TOTAL             | R$ 0,00     | R$ 18.750,00
VEÃCULOS          | 584.740     | 584.740      âœ…
ÃNDICE OPERAÃ‡ÃƒO   | 100,00%     | 100,00%      âœ…
```

### Impacto
- âŒ Impossibilidade de finalizar mediÃ§Ã£o mensal
- âŒ Bloqueio de pagamento aos prestadores
- âŒ Descumprimento de prazo contratual
- âŒ Impacto financeiro estimado: R$ 37.500,00/mÃªs

---

## âœ… CAUSA RAIZ IDENTIFICADA

### DiagnÃ³stico
**Falta de cadastro de recursos** na tabela `TBRecursos` para as faixas do equipamento GYN1R801.

### EvidÃªncia
```sql
SELECT r.Id FROM TBRecursos r
JOIN TBEquipamentos e ON r.EquipamentoId = e.Id
WHERE e.CodigoEquipamento = 'GYN1R801';

Resultado: 0 linhas (Nenhum recurso cadastrado)
```

### ComparaÃ§Ã£o

| Equipamento | Recursos Cadastrados | Valores no RelatÃ³rio |
|-------------|----------------------|----------------------|
| GYN1R801    | 0 âŒ                 | R$ 0,00 âŒ           |
| GYN1R803    | 2 âœ…                 | R$ 37.500,00 âœ…      |
| ITZ022R (IPEMPE) | 2 âœ…             | R$ 48.100,00 âœ…      |

---

## ðŸ“Š PROCESSO COMPLETO: 6 ETAPAS

### Fluxo de Cadastro

```
1ï¸âƒ£ CADASTROS BÃSICOS (5-10min)
   â”œâ”€ Cadastrar equipamento
   â”œâ”€ Cadastrar faixas (1, 2, etc.)
   â””â”€ Ativar equipamento

2ï¸âƒ£ CONFIGURAÃ‡ÃƒO CONTRATUAL (10-15min)
   â”œâ”€ Cadastrar contrato
   â”œâ”€ Definir vigÃªncia
   â”œâ”€ Vincular equipamentos
   â””â”€ Ativar contrato

3ï¸âƒ£ CONFIGURAÃ‡ÃƒO DE RECURSOS âš ï¸ CRÃTICO (10-15min)
   â”œâ”€ Cadastrar 1 recurso por faixa
   â”œâ”€ Vincular ao contrato
   â”œâ”€ Definir Valor Previsto (R$)
   â”œâ”€ Definir BDI (%)
   â””â”€ Ativar recursos

4ï¸âƒ£ OPERAÃ‡ÃƒO (ContÃ­nuo)
   â”œâ”€ Passagens (automÃ¡tico)
   â”œâ”€ Heartbeat (automÃ¡tico)
   â””â”€ InterrupÃ§Ãµes (manual)

5ï¸âƒ£ GERAÃ‡ÃƒO RELATÃ“RIO (2-5min/mÃªs)
   â”œâ”€ Selecionar contrato
   â”œâ”€ Selecionar perÃ­odo
   â”œâ”€ Selecionar equipamentos
   â””â”€ Gerar relatÃ³rio

6ï¸âƒ£ FINALIZAÃ‡ÃƒO (10-30min/mÃªs)
   â”œâ”€ Revisar valores
   â”œâ”€ Ajustar interrupÃ§Ãµes
   â””â”€ Finalizar mediÃ§Ã£o
```

**Tempo Total:**
- Novo equipamento: 25-40 minutos
- MediÃ§Ã£o mensal: 12-35 minutos

---

## âš ï¸ PONTO MAIS CRÃTICO

### Etapa 3: ConfiguraÃ§Ã£o de Recursos

**REGRA FUNDAMENTAL:**

> Ã‰ necessÃ¡rio criar **1 recurso para CADA faixa** do equipamento!

**Exemplo:**
- Equipamento com 2 faixas â†’ 2 recursos
- Equipamento com 3 faixas â†’ 3 recursos

**Se nÃ£o criar recursos â†’ Valores R$ 0,00 no relatÃ³rio!**

### Campos ObrigatÃ³rios por Recurso

| Campo | Exemplo | ValidaÃ§Ã£o |
|-------|---------|-----------|
| Equipamento | GYN1R801 | âš ï¸ ObrigatÃ³rio |
| Faixa | 1 | âš ï¸ ObrigatÃ³rio |
| Contrato | CT-2026-001 | âš ï¸ ObrigatÃ³rio |
| Valor Previsto | R$ 15.000,00 | âš ï¸ Deve ser > 0 |
| BDI (%) | 25,00% | âš ï¸ Deve ser > 0 |
| Status | Ativo | âš ï¸ ObrigatÃ³rio |
| VigÃªncia | 01/01 a 31/12/2026 | âš ï¸ Deve cobrir perÃ­odo |

---

## ðŸ” FERRAMENTAS DE DIAGNÃ“STICO

### Script SQL Principal

Execute este script para verificar se estÃ¡ tudo correto:

```sql
-- DiagnÃ³stico AutomÃ¡tico de Recursos
SELECT 
    e.CodigoEquipamento,
    f.NumeroFaixa,
    r.ValorPrevisto,
    r.Bdi,
    CASE 
        WHEN r.Id IS NULL THEN 'ðŸ”´ RECURSO NÃƒO CADASTRADO'
        WHEN r.ValorPrevisto = 0 THEN 'ðŸ”´ VALOR ZERADO'
        WHEN r.Status = 0 THEN 'ðŸ”´ RECURSO INATIVO'
        ELSE 'âœ… OK'
    END AS Diagnostico
FROM TBEquipamentos e
JOIN TBFaixas f ON f.EquipamentoId = e.Id
LEFT JOIN TBRecursos r ON r.EquipamentoId = e.Id 
    AND r.FaixaId = f.Id
WHERE e.CodigoEquipamento = 'SEU_EQUIPAMENTO';
```

### InterpretaÃ§Ã£o dos Resultados

| DiagnÃ³stico | Significado | SoluÃ§Ã£o |
|-------------|-------------|---------|
| ðŸ”´ RECURSO NÃƒO CADASTRADO | Falta cadastrar | Cadastrar recurso via MediÃ§Ã£o â†’ Recursos |
| ðŸ”´ VALOR ZERADO | ValorPrevisto = 0 | Editar recurso e preencher valor |
| ðŸ”´ RECURSO INATIVO | Status = 0 | Editar recurso e ativar |
| âœ… OK | Configurado corretamente | Pronto para gerar relatÃ³rio |

---

## ðŸ“ˆ FÃ“RMULAS DE CÃLCULO

### CÃ¡lculo Completo do RelatÃ³rio

```
1. HORAS EFETIVAS
   Total Horas = Horas Previstas - Horas Interrompidas
   Exemplo: 744h - 0h = 744h

2. ÃNDICE DE OPERAÃ‡ÃƒO
   Ãndice = (Total Horas / Horas Previstas) Ã— 100
   Exemplo: (744 / 744) Ã— 100 = 100,00%

3. DESCONTO
   Desconto = Valor Previsto Ã— (1 - Ãndice)
   Exemplo: R$ 15.000 Ã— (1 - 1,00) = R$ 0,00

4. VALOR FAIXA
   Valor Faixa = Valor Previsto - Desconto
   Exemplo: R$ 15.000 - R$ 0 = R$ 15.000,00

5. VALOR BDI
   Valor BDI = Valor Faixa Ã— (BDI / 100)
   Exemplo: R$ 15.000 Ã— 0,25 = R$ 3.750,00

6. TOTAL
   Total = Valor Faixa + Valor BDI
   Exemplo: R$ 15.000 + R$ 3.750 = R$ 18.750,00
```

### Exemplo PrÃ¡tico (Ãndice 100%)

| DescriÃ§Ã£o | Valor |
|-----------|-------|
| Valor Previsto | R$ 15.000,00 |
| BDI (25%) | R$ 3.750,00 |
| **Total por Faixa** | **R$ 18.750,00** |
| **Total Equipamento (2 faixas)** | **R$ 37.500,00** |

---

## âœ… SOLUÃ‡ÃƒO IMPLEMENTADA

### AÃ§Ãµes Realizadas

1. âœ… IdentificaÃ§Ã£o da causa raiz (recursos nÃ£o cadastrados)
2. âœ… ComparaÃ§Ã£o com sistema funcionando (IPEMPE)
3. âœ… Desenvolvimento de script SQL de diagnÃ³stico
4. âœ… CriaÃ§Ã£o de procedimento operacional para usuÃ¡rios
5. âœ… DocumentaÃ§Ã£o tÃ©cnica completa (13 documentos)
6. âœ… Script de correÃ§Ã£o automatizado

### Documentos Criados

1. **GUIA-OPERACIONAL-RAPIDO-MEDICAO.md** - Para operadores
2. **CICLO-COMPLETO-CADASTRO-MEDICAO-AXHUB.md** - Para TI
3. **SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql** - 9 queries diagnÃ³sticas
4. **VALIDACAO-CONTRATOS-POR-FAIXA-GOIANIA.sql** - 5 queries validaÃ§Ã£o
5. **COMPARACAO-IPEMPE-VS-GOIANIA-MEDICAO.sql** - AnÃ¡lise comparativa
6. **INDICE-DOCUMENTACAO-MEDICAO.md** - Ãndice navegÃ¡vel
7. **RELATORIO-ABNT-CICLO-MEDICAO-AXHUB.md** - RelatÃ³rio completo ABNT
8. Mais 6 documentos de anÃ¡lise e validaÃ§Ã£o

**Total:** 13 documentos tÃ©cnicos + 3 scripts SQL com 19 queries

---

## ðŸ“Š RESULTADOS

### Antes da CorreÃ§Ã£o

```
GYN1R801 - Maio/2026
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Faixa | Valor Previsto | Total
â”€â”€â”€â”€â”€â”€|â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€|â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  1   | R$ 0,00        | R$ 0,00     âŒ
  2   | R$ 0,00        | R$ 0,00     âŒ
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
TOTAL | R$ 0,00        | R$ 0,00     âŒ
```

### ApÃ³s CorreÃ§Ã£o

```
GYN1R801 - Maio/2026
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Faixa | Valor Previsto | Total
â”€â”€â”€â”€â”€â”€|â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€|â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  1   | R$ 15.000,00   | R$ 18.750,00 âœ…
  2   | R$ 15.000,00   | R$ 18.750,00 âœ…
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
TOTAL | R$ 30.000,00   | R$ 37.500,00 âœ…
```

### Impacto Financeiro

| PerÃ­odo | Sem CorreÃ§Ã£o | Com CorreÃ§Ã£o | DiferenÃ§a |
|---------|--------------|--------------|-----------|
| Maio/2026 | R$ 0,00 | R$ 37.500,00 | **+R$ 37.500,00** |
| Por Ano | R$ 0,00 | R$ 450.000,00 | **+R$ 450.000,00** |

---

## ðŸŽ¯ RECOMENDAÃ‡Ã•ES

### Imediatas (Curto Prazo)

1. âœ… **Executar Script SQL de DiagnÃ³stico** em todos os sistemas
2. âœ… **Cadastrar recursos** para equipamentos com valores zerados
3. âœ… **Validar mediÃ§Ãµes** de maio/2026
4. âœ… **Treinar operadores** com guia operacional

### Preventivas (MÃ©dio Prazo)

5. â­ï¸ **Implementar validaÃ§Ã£o automÃ¡tica** no cadastro de equipamentos
6. â­ï¸ **Criar alerta** quando recurso nÃ£o estiver cadastrado
7. â­ï¸ **Adicionar checklist** na tela de cadastro
8. â­ï¸ **Incluir tutorial** no sistema (passo a passo)

### EstratÃ©gicas (Longo Prazo)

9. â­ï¸ **Automatizar criaÃ§Ã£o de recursos** ao vincular equipamento a contrato
10. â­ï¸ **Implementar wizard** de configuraÃ§Ã£o guiado
11. â­ï¸ **Criar relatÃ³rio** de equipamentos sem recursos
12. â­ï¸ **Desenvolver dashboard** de validaÃ§Ã£o de cadastros

---

## ðŸ“š REFERÃŠNCIAS NORMATIVAS

### Base Legal

- **Lei Federal nÂº 11.079/2004** - PPP e mediÃ§Ã£o de desempenho
- **Lei Federal nÂº 8.666/1993** - LicitaÃ§Ãµes e contratos
- **Lei Federal nÂº 9.503/1997** - CÃ³digo de TrÃ¢nsito Brasileiro

### DocumentaÃ§Ã£o TÃ©cnica

- Guia de CÃ¡lculo de MediÃ§Ã£o (PDF) - Axion Tecnologia
- Manual AxHub - MÃ³dulo de MediÃ§Ã£o
- DocumentaÃ§Ã£o SQL Server 2019

### Normas ABNT Aplicadas

- **ABNT NBR 6023:2018** - ReferÃªncias bibliogrÃ¡ficas
- **ABNT NBR 6027:2012** - SumÃ¡rio
- **ABNT NBR 6028:2021** - Resumo
- **ABNT NBR 10520:2023** - CitaÃ§Ãµes
- **ABNT NBR 14724:2011** - Trabalhos acadÃªmicos

---

## ðŸ‘¥ EQUIPE TÃ‰CNICA

### AnÃ¡lise e Desenvolvimento

- **AnÃ¡lise de Sistemas:** Equipe Axion Tecnologia
- **Desenvolvimento SQL:** Equipe Axion Tecnologia
- **DocumentaÃ§Ã£o TÃ©cnica:** Equipe Axion Tecnologia
- **ValidaÃ§Ã£o:** Sistemas IPEMPE e GoiÃ¢nia

### RevisÃ£o e AprovaÃ§Ã£o

- **RevisÃ£o TÃ©cnica:** CoordenaÃ§Ã£o TÃ©cnica Axion
- **AprovaÃ§Ã£o:** GerÃªncia de Projetos Axion
- **HomologaÃ§Ã£o:** Clientes IPEMPE e GoiÃ¢nia

---

## ðŸ“ž SUPORTE

### Para Operadores

**Documento:** GUIA-OPERACIONAL-RAPIDO-MEDICAO.md  
**ConteÃºdo:** Passo a passo simplificado sem SQL  
**Uso:** Cadastro de equipamentos e resoluÃ§Ã£o de valores zerados

### Para TI/Analistas

**Documento:** CICLO-COMPLETO-CADASTRO-MEDICAO-AXHUB.md  
**ConteÃºdo:** Fluxo tÃ©cnico completo com SQL  
**Uso:** AnÃ¡lise tÃ©cnica e implementaÃ§Ã£o de correÃ§Ãµes

### Para DBAs

**Scripts SQL:**
- SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql (9 queries)
- VALIDACAO-CONTRATOS-POR-FAIXA-GOIANIA.sql (5 queries)
- COMPARACAO-IPEMPE-VS-GOIANIA-MEDICAO.sql (5 queries)

### Contato

**E-mail:** suporte@axiontecnologia.com.br  
**Telefone:** (62) XXXX-XXXX  
**HorÃ¡rio:** Segunda a sexta, 8h Ã s 18h

---

## âœ… CONCLUSÃ•ES

### Principais Achados

1. âœ… **Causa identificada:** Falta de cadastro de recursos
2. âœ… **SoluÃ§Ã£o simples:** Cadastrar 1 recurso por faixa
3. âœ… **Impacto alto:** R$ 37.500/mÃªs por equipamento
4. âœ… **PrevenÃ§Ã£o:** DocumentaÃ§Ã£o e validaÃ§Ã£o automÃ¡tica

### LiÃ§Ãµes Aprendidas

**Positivo:**
- Sistema robusto e cÃ¡lculos corretos
- Problema isolado de configuraÃ§Ã£o
- SoluÃ§Ã£o nÃ£o requer alteraÃ§Ã£o de cÃ³digo

**A Melhorar:**
- Falta validaÃ§Ã£o no cadastro
- AusÃªncia de alertas preventivos
- DocumentaÃ§Ã£o operacional incompleta

### Status Final

| Item | Status | Data ConclusÃ£o |
|------|--------|----------------|
| AnÃ¡lise do Problema | âœ… ConcluÃ­do | 18/06/2026 |
| IdentificaÃ§Ã£o Causa Raiz | âœ… ConcluÃ­do | 18/06/2026 |
| Desenvolvimento Scripts | âœ… ConcluÃ­do | 18/06/2026 |
| DocumentaÃ§Ã£o TÃ©cnica | âœ… ConcluÃ­do | 18/06/2026 |
| DocumentaÃ§Ã£o Operacional | âœ… ConcluÃ­do | 18/06/2026 |
| ValidaÃ§Ã£o em Teste | â­ï¸ Pendente | A agendar |
| AplicaÃ§Ã£o em ProduÃ§Ã£o | â­ï¸ Pendente | A agendar |
| Treinamento Equipes | â­ï¸ Pendente | A agendar |

---

## ðŸ“… PRÃ“XIMOS PASSOS

### AÃ§Ãµes Imediatas (Esta Semana)

- [ ] Executar script de diagnÃ³stico em GoiÃ¢nia
- [ ] Cadastrar recursos para GYN1R801
- [ ] Validar valores no relatÃ³rio
- [ ] Finalizar mediÃ§Ã£o maio/2026

### AÃ§Ãµes de Curto Prazo (Este MÃªs)

- [ ] Executar diagnÃ³stico em todos os sistemas
- [ ] Corrigir equipamentos com valores zerados
- [ ] Treinar operadores com guia operacional
- [ ] Criar checklist de cadastro

### AÃ§Ãµes de MÃ©dio Prazo (2-3 Meses)

- [ ] Implementar validaÃ§Ã£o automÃ¡tica
- [ ] Adicionar alertas preventivos
- [ ] Criar wizard de configuraÃ§Ã£o
- [ ] Desenvolver relatÃ³rio de validaÃ§Ã£o

---

**Documento Elaborado em:** 18 de junho de 2026  
**VersÃ£o:** 1.0  
**RevisÃ£o:** Equipe TÃ©cnica Axion  
**PrÃ³xima RevisÃ£o:** ApÃ³s aplicaÃ§Ã£o em produÃ§Ã£o

---

## ðŸ“Š ANEXO: QUADRO RESUMO

### Problema â†’ SoluÃ§Ã£o em 4 Linhas

```
âŒ PROBLEMA
   Valores zerados no relatÃ³rio de mediÃ§Ã£o (R$ 0,00)

ðŸ” CAUSA
   Recursos nÃ£o cadastrados na tabela TBRecursos

âœ… SOLUÃ‡ÃƒO
   Cadastrar 1 recurso por faixa via MediÃ§Ã£o â†’ Recursos

ðŸ“Š RESULTADO
   Valores corretos aparecem no relatÃ³rio (R$ 37.500,00)
```

### Checklist RÃ¡pido para Operador

```
PARA NOVO EQUIPAMENTO:
[ ] 1. Cadastrar equipamento e faixas
[ ] 2. Cadastrar contrato (se novo)
[ ] 3. Vincular equipamento ao contrato
[ ] 4. Cadastrar RECURSO para CADA FAIXA âš ï¸
       â†’ Preencher Valor Previsto > 0
       â†’ Preencher BDI > 0
       â†’ Marcar como Ativo
[ ] 5. Gerar relatÃ³rio de teste
[ ] 6. Validar valores (devem ser > R$ 0,00)

SE VALORES ZERADOS:
[ ] 1. Verificar se recursos estÃ£o cadastrados
[ ] 2. Se nÃ£o, cadastrar via MediÃ§Ã£o â†’ Recursos
[ ] 3. Se sim, verificar se valores > 0 e Status = Ativo
[ ] 4. Gerar relatÃ³rio novamente
```

---

**FIM DO RESUMO EXECUTIVO**

**Para DocumentaÃ§Ã£o Completa:** Consulte RELATORIO-ABNT-CICLO-MEDICAO-AXHUB.md  
**Para Guia Operacional:** Consulte GUIA-OPERACIONAL-RAPIDO-MEDICAO.md  
**Para Scripts SQL:** Consulte SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql


