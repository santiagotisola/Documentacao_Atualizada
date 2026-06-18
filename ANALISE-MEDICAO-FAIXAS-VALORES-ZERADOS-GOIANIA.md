# Análise: Relatório de Medição de Equipamento - Valores Zerados  
**Sistema:** AxHub Goiânia  
**URL:** https://goiania.axhub.axion.ws/medicao/relatoriomedicaoequipamento  
**Data da Análise:** 18/06/2026  
**Solicitação:** Chamado interno - Análise de campos zerados no relatório de medição

---

## 📋 Contexto

O **Relatório de Medição de Equipamento por Faixas** é utilizado para:
- Calcular valores contratuais baseados no desempenho de cada faixa de tráfego
- Determinar pagamentos/descontos em contratos de fiscalização eletrônica
- Gerar medições mensais com base em métricas operacionais

### Campos Esperados no Relatório

Segundo a imagem anexa e estrutura do sistema, o relatório exibe para cada equipamento/faixa:

| Campo | Descrição | Origem do Dado |
|-------|-----------|----------------|
| **EQUIPAMENTO** | Código do equipamento | `TBEquipamentos.CodigoEquipamento` |
| **FAIXA** | Número da faixa | `TBFaixas.NumeroFaixa` |
| **MULTA SOBRE 0 X** | Percentual de multas sobre 0 imagens inválidas | Configuração do contrato |
| **MULTA SOBRE IMAGENS INVÁLIDAS** | Valor calculado de multa por imagens rejeitadas | Cálculo baseado em `TBPassagens` com flag de invalidade |
| **VEÍCULOS** | Quantidade de veículos/passagens registradas | COUNT de `TBPassagens` |
| **PREVISTOS** | Total de horas previstas de operação | Configuração mensal do contrato |
| **INTERRUPÇÕES** | Horas de interrupção registradas | `TBInterrupcoes` vinculadas ao equipamento |
| **RECURSOS** | Horas de recursos utilizados | `TBRecursos` vinculados |
| **TOTAL (HORAS)** | Horas efetivas (previstos - interrupções) | Cálculo |
| **ÍNDICE OPERAÇÃO** | Percentual de disponibilidade | (Total / Previstos) × 100 |
| **DESCONTO HORAS PARALISADAS** | Valor descontado por indisponibilidade | Cálculo baseado no índice |
| **DESCONTO** | Desconto total aplicado | Soma de descontos |
| **VALOR PREVISTO** | Valor contratual da faixa no período | `TBContratos` ou `TBRecursos.ValorPrevisto` |
| **VALOR FAIXA** | Valor líquido após descontos | Valor Previsto - Descontos |
| **BDI (%)** | Bonificações e Despesas Indiretas | Configuração do contrato |
| **TOTAL** | Valor final com BDI aplicado | Valor Faixa × (1 + BDI/100) |

---

## 🔴 Problema Identificado: Campos Zerados

### Campos Afetados (visível na imagem)

Observando o equipamento **GYN1R801** nas linhas apresentadas:

| Equipamento | Faixa | MULTA 0X | MULTA IMG INV | VEÍCULOS | TOTAL (Horas) | ÍNDICE | **VALOR PREVISTO** | **VALOR FAIXA** | **BDI (%)** | **TOTAL** |
|-------------|-------|----------|---------------|----------|---------------|--------|-------------------|----------------|------------|----------|
| GYN1R801 | 1 | 0,00% | R$ 0,00 | 584740 | 744,00 | 100,00% | **R$ 0,00** | **R$ 0,00** | **0,00%** | **R$ 0,00** |
| GYN1R801 | 2 | 0,00% | R$ 0,00 | 609222 | 744,00 | 100,00% | **R$ 0,00** | **R$ 0,00** | **0,00%** | **R$ 0,00** |

**Campos zerados:**
- ✅ VALOR PREVISTO = R$ 0,00
- ✅ VALOR FAIXA = R$ 0,00
- ✅ BDI (%) = 0,00%
- ✅ TOTAL = R$ 0,00

**Campos corretos:**
- ✅ VEÍCULOS com valores altos (584.740 e 609.222 passagens)
- ✅ TOTAL (Horas) = 744,00 (31 dias × 24 horas)
- ✅ ÍNDICE OPERAÇÃO = 100,00% (sem interrupções)

---

## 🔍 Causas Prováveis

### 1. **Falta de Configuração de Recurso no Contrato**

#### Sintoma
Os campos financeiros (VALOR PREVISTO, BDI) estão zerados, mas os dados operacionais (passagens, horas, índice) estão corretos.

#### Diagnóstico
O equipamento/faixa **não está vinculado a um recurso no módulo Medição → Recursos**.

#### Onde Verificar
**Menu:** Medição → Recursos

**Tabela:** `TBRecursos`

**SQL de Verificação:**
```sql
-- Verificar se existem recursos cadastrados para o equipamento GYN1R801
SELECT 
    r.Id,
    r.Descricao,
    r.Tipo,
    r.ValorPrevisto,
    r.Bdi,
    r.Status,
    e.CodigoEquipamento,
    f.NumeroFaixa
FROM TBRecursos r
LEFT JOIN TBEquipamentos e ON r.EquipamentoId = e.Id
LEFT JOIN TBFaixas f ON r.FaixaId = f.Id
WHERE e.CodigoEquipamento = 'GYN1R801'
```

**Resultado esperado:**
- Se retornar **0 linhas**: recurso não cadastrado (CAUSA RAIZ)
- Se retornar linhas com `ValorPrevisto = NULL` ou `0`: valor não configurado
- Se `Status = 'Inativo'`: recurso desativado

---

### 2. **Contrato sem Valores de Medição Definidos**

#### Sintoma
Todos os equipamentos do contrato exibem valores zerados.

#### Diagnóstico
O contrato de Goiânia não possui valores de medição cadastrados por equipamento/faixa.

#### Onde Verificar
**Menu:** Medição → Contratos → Editar Contrato de Goiânia

**Campos a Verificar:**
- Vigência (deve incluir maio/2026)
- Equipamentos vinculados
- Tipo de contrato (performance/disponibilidade/passagem)
- Valor unitário por faixa/equipamento

**SQL:**
```sql
-- Verificar configuração do contrato de Goiânia
SELECT 
    c.NumeroContrato,
    c.Orgao,
    c.VigenciaInicio,
    c.VigenciaFim,
    c.Status,
    c.TipoMedicao, -- Pode ser NULL
    ce.EquipamentoId,
    e.CodigoEquipamento
FROM TBContratos c
LEFT JOIN TBContratosEquipamentos ce ON c.Id = ce.ContratoId
LEFT JOIN TBEquipamentos e ON ce.EquipamentoId = e.Id
WHERE c.Orgao LIKE '%Goiânia%' OR c.Orgao LIKE '%SMT%'
```

---

### 3. **Período Selecionado Fora da Vigência do Contrato**

#### Sintoma
Valores zerados aparecem apenas para um período específico (ex: maio/2026).

#### Diagnóstico
O contrato pode estar vigente, mas sem recursos configurados para o mês selecionado no filtro.

#### Onde Verificar
Na tela de **Nova Medição**, os filtros incluem:
- Mês e Ano
- Grupo de equipamentos
- Lote 01 ou Lote 02

Se o período selecionado for anterior à ativação do recurso ou posterior ao encerramento, os valores aparecem zerados.

**SQL:**
```sql
-- Verificar vigência de recursos por período
SELECT 
    r.Descricao,
    r.DataInicio,
    r.DataFim,
    r.Status,
    e.CodigoEquipamento
FROM TBRecursos r
JOIN TBEquipamentos e ON r.EquipamentoId = e.Id
WHERE e.CodigoEquipamento = 'GYN1R801'
  AND '2026-05-01' BETWEEN ISNULL(r.DataInicio, '2000-01-01') 
                       AND ISNULL(r.DataFim, '2099-12-31')
```

---

### 4. **BDI Não Configurado no Recurso ou Contrato**

#### Sintoma
VALOR PREVISTO e VALOR FAIXA preenchidos, mas BDI = 0,00% e TOTAL zerado.

#### Diagnóstico
O campo `Bdi` (float) na tabela `TBRecursos` está NULL ou 0.

**BDI** (Bonificações e Despesas Indiretas) é um percentual aplicado sobre o valor líquido:
- Valores comuns: 10% a 30%
- Definido no edital/contrato

#### Onde Configurar
**Menu:** Medição → Recursos → Editar Recurso

**Campo:** BDI (%)

**SQL para Atualizar:**
```sql
-- Atualizar BDI para 25% (exemplo) nos recursos de Goiânia
UPDATE r
SET r.Bdi = 25.0
FROM TBRecursos r
JOIN TBEquipamentos e ON r.EquipamentoId = e.Id
WHERE e.CodigoEquipamento LIKE 'GYN%'
  AND r.Status = 'Ativo'
  AND (r.Bdi IS NULL OR r.Bdi = 0)
```

---

## ✅ Solução: Passo a Passo para Resolver

### **Etapa 1: Verificar Cadastro de Recursos**

1. Acesse: **Medição → Recursos**
2. Filtre por **Contrato de Goiânia** ou **Equipamento GYN1R801**
3. Verifique se existem recursos cadastrados

**Se não existir nenhum recurso:**
- Clique em **Novo Recurso**
- Preencha:
  - **Descrição:** "Faixa 1 - GYN1R801" (repetir para faixa 2)
  - **Tipo:** Equipamento
  - **Contrato:** Selecione o contrato de Goiânia
  - **Equipamento:** GYN1R801
  - **Faixa:** 1 (criar outro recurso para faixa 2)
  - **Valor Previsto:** Valor mensal acordado no contrato (ex: R$ 15.000,00)
  - **BDI (%):** Percentual do edital (ex: 25%)
  - **Data Início:** Início da vigência
  - **Status:** Ativo

---

### **Etapa 2: Configurar Valor Previsto e BDI**

Se o recurso existe mas está com valores zerados:

1. **Edite o recurso**
2. Preencha:
   - **Valor Previsto:** Consulte o contrato ou planilha de custos
   - **BDI (%):** Consulte o edital (geralmente entre 15% e 30%)

**Exemplo de Cálculo:**
- Valor bruto do contrato anual: R$ 3.600.000,00
- Quantidade de faixas: 571 (segundo dados de Goiânia)
- Valor mensal por faixa: R$ 3.600.000 ÷ 12 ÷ 571 ≈ **R$ 524,74**
- BDI contratual: 25%
- Valor final por faixa/mês: R$ 524,74 × 1,25 = **R$ 655,93**

---

### **Etapa 3: Vincular Equipamentos ao Contrato**

1. Acesse: **Medição → Contratos**
2. Edite o **Contrato de Goiânia**
3. Na aba **Equipamentos Vinculados**, adicione:
   - Todos os equipamentos do Lote 01 e Lote 02
   - Certifique-se de que GYN1R801 está na lista

---

### **Etapa 4: Recalcular a Medição**

Após configurar os recursos:

1. Acesse: **Medição → Criar Medição** (ou **Nova Medição**)
2. Selecione:
   - **Contrato:** Goiânia - SMT
   - **Período:** Maio/2026
   - **Equipamentos:** Todos ou filtrar por lote
3. Clique em **Buscar** ou **Gerar Relatório**

**Resultado esperado:**
Os campos VALOR PREVISTO, VALOR FAIXA, BDI (%) e TOTAL devem ser preenchidos automaticamente.

---

### **Etapa 5: Validar os Dados**

Após recalcular, valide:

| Campo | Validação |
|-------|-----------|
| VALOR PREVISTO | Deve corresponder ao valor mensal do recurso |
| DESCONTO | Deve ser 0 se índice = 100% (sem interrupções) |
| VALOR FAIXA | = VALOR PREVISTO - DESCONTO |
| BDI (%) | Deve ser o percentual configurado (ex: 25%) |
| TOTAL | = VALOR FAIXA × (1 + BDI/100) |

---

## 📊 Exemplo de Cálculo Correto

Para o equipamento **GYN1R801 - Faixa 1** em maio/2026:

```
Dados de Entrada:
- VALOR PREVISTO (configurado no recurso) = R$ 15.000,00
- Horas previstas = 744h (31 dias × 24h)
- Horas de interrupção = 0h
- Índice de operação = 100%
- BDI = 25%

Cálculo:
1. DESCONTO HORAS PARALISADAS = R$ 0,00 (índice 100%)
2. VALOR FAIXA = R$ 15.000,00 - R$ 0,00 = R$ 15.000,00
3. VALOR BDI = R$ 15.000,00 × 0,25 = R$ 3.750,00
4. TOTAL = R$ 15.000,00 + R$ 3.750,00 = R$ 18.750,00
```

**Relatório Esperado:**

| Equipamento | Faixa | Valor Previsto | Desconto | Valor Faixa | BDI (%) | Total |
|-------------|-------|----------------|----------|-------------|---------|-------------|
| GYN1R801 | 1 | R$ 15.000,00 | R$ 0,00 | R$ 15.000,00 | 25,00% | **R$ 18.750,00** |
| GYN1R801 | 2 | R$ 15.000,00 | R$ 0,00 | R$ 15.000,00 | 25,00% | **R$ 18.750,00** |

---

## 🔧 Verificação Técnica (SQL)

### Script Completo de Diagnóstico

```sql
-- DIAGNÓSTICO: Medição de Equipamento GYN1R801 com valores zerados

-- 1. Verificar se o equipamento existe
SELECT 
    Id, CodigoEquipamento, GrupoId, Status
FROM TBEquipamentos
WHERE CodigoEquipamento = 'GYN1R801'

-- 2. Verificar faixas do equipamento
SELECT 
    f.Id, f.NumeroFaixa, f.EquipamentoId, f.Status
FROM TBFaixas f
JOIN TBEquipamentos e ON f.EquipamentoId = e.Id
WHERE e.CodigoEquipamento = 'GYN1R801'

-- 3. Verificar contratos ativos de Goiânia
SELECT 
    c.Id, c.NumeroContrato, c.Orgao, c.VigenciaInicio, c.VigenciaFim, c.Status
FROM TBContratos c
WHERE c.Orgao LIKE '%Goiânia%' OR c.Orgao LIKE '%SMT%'
  AND c.Status = 'Ativo'
  AND GETDATE() BETWEEN c.VigenciaInicio AND c.VigenciaFim

-- 4. Verificar se o equipamento está vinculado ao contrato
SELECT 
    ce.ContratoId, ce.EquipamentoId, e.CodigoEquipamento, c.NumeroContrato
FROM TBContratosEquipamentos ce
JOIN TBEquipamentos e ON ce.EquipamentoId = e.Id
JOIN TBContratos c ON ce.ContratoId = c.Id
WHERE e.CodigoEquipamento = 'GYN1R801'

-- 5. Verificar recursos cadastrados para o equipamento [CAUSA RAIZ]
SELECT 
    r.Id,
    r.Descricao,
    r.Tipo,
    r.ValorPrevisto,  -- <-- SE NULL OU 0, AQUI ESTÁ O PROBLEMA
    r.Bdi,            -- <-- SE NULL OU 0, VALORES FINAIS ZERADOS
    r.DataInicio,
    r.DataFim,
    r.Status,
    e.CodigoEquipamento,
    f.NumeroFaixa,
    c.NumeroContrato
FROM TBRecursos r
LEFT JOIN TBEquipamentos e ON r.EquipamentoId = e.Id
LEFT JOIN TBFaixas f ON r.FaixaId = f.Id
LEFT JOIN TBContratos c ON r.ContratoId = c.Id
WHERE e.CodigoEquipamento = 'GYN1R801'

-- 6. Verificar passagens do equipamento em maio/2026
SELECT 
    COUNT(*) AS TotalPassagens,
    f.NumeroFaixa,
    e.CodigoEquipamento
FROM TBPassagens p
JOIN TBFaixas f ON p.FaixaId = f.Id
JOIN TBEquipamentos e ON f.EquipamentoId = e.Id
WHERE e.CodigoEquipamento = 'GYN1R801'
  AND p.DataHora >= '2026-05-01' AND p.DataHora < '2026-06-01'
GROUP BY f.NumeroFaixa, e.CodigoEquipamento

-- 7. Verificar interrupções no período
SELECT 
    i.Id, i.Descricao, i.DataInicio, i.DataFim, 
    DATEDIFF(HOUR, i.DataInicio, i.DataFim) AS HorasInterrompidas,
    e.CodigoEquipamento
FROM TBInterrupcoes i
JOIN TBEquipamentos e ON i.EquipamentoId = e.Id
WHERE e.CodigoEquipamento = 'GYN1R801'
  AND (i.DataInicio >= '2026-05-01' AND i.DataInicio < '2026-06-01')
```

---

## 📝 Checklist de Resolução

Use este checklist ao configurar a medição:

- [ ] **Contrato existe e está ativo?**
  - Verificar vigência (inclui maio/2026?)
  - Status = "Ativo"

- [ ] **Equipamento GYN1R801 está vinculado ao contrato?**
  - Verificar em `TBContratosEquipamentos`
  - Adicionar se não estiver

- [ ] **Recursos cadastrados para cada faixa?**
  - Faixa 1: Recurso ativo com ValorPrevisto preenchido
  - Faixa 2: Recurso ativo com ValorPrevisto preenchido

- [ ] **Valor Previsto configurado?**
  - Valor > 0
  - Valor condizente com o contrato

- [ ] **BDI configurado?**
  - BDI entre 10% e 30% (conferir edital)
  - Campo preenchido (não NULL)

- [ ] **Período de vigência do recurso correto?**
  - DataInicio <= 2026-05-01
  - DataFim >= 2026-05-31 (ou NULL)

- [ ] **Status do recurso = "Ativo"?**

- [ ] **Recalcular medição após configuração**

---

## 🎯 Resumo Executivo

### Problema
Relatório de medição de Goiânia mostra valores zerados (VALOR PREVISTO, VALOR FAIXA, BDI, TOTAL) para o equipamento GYN1R801, embora os dados operacionais (passagens, horas, índice) estejam corretos.

### Causa Raiz
**Recursos não cadastrados** ou **valores não configurados** no módulo Medição → Recursos.

### Solução
1. Cadastrar recursos para cada equipamento/faixa do contrato de Goiânia
2. Configurar VALOR PREVISTO mensal (baseado no contrato)
3. Configurar BDI (%) conforme edital
4. Recalcular a medição do período

### Impacto
- **Operacional:** Medição não pode ser finalizada sem valores
- **Financeiro:** Impossível gerar faturamento para o período
- **Contratual:** Atraso na entrega de medições mensais

### Urgência
🔴 **ALTA** - Bloqueia o fechamento da medição de maio/2026

---

## 📞 Referências

- **Documentação:** [AxHub.Docs → Medição → Criar Medição](./AxHub/docs-portal/docs/medicoes/criar-medicao.md)
- **Documentação:** [AxHub.Docs → Medição → Recursos](./AxHub/docs-portal/docs/medicoes/recursos.md)
- **Documentação:** [AxHub.Docs → Medição → Contratos](./AxHub/docs-portal/docs/medicoes/contratos.md)

---

**Documento gerado por:** AxionIA Engine  
**Versão:** 1.0  
**Data:** 18/06/2026
