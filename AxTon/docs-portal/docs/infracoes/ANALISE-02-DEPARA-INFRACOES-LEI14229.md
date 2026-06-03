# Análise 02 — De-Para: Lógica de Infrações AxTon × Lei 14.229/2021

**Data:** 28/05/2026  
**Referência:** Continuação da Análise 01 (`ANALISE-DIVERGENCIA-LEI14229-AXTON.md`)  
**Placas analisadas:** SJW1J10 | OXY6J95  
**Objetivo:** Validar a fórmula de cálculo, rastrear a gravação do `Infraction.InfractionType` e realizar o de-para entre legislação, configuração e resultado real

---

## 1. Cronologia — Vigência Legal × Implementação do Sistema

### 1.1 Linha do Tempo Legislativa

| Data | Evento | Impacto |
|------|--------|---------|
| **25/11/1985** | Lei 7.408 publicada | Tolerância 5% PBT, sem regra de eixo isolada |
| **08/06/2021** | MP 1.050/2021 publicada | Introduz regra dos 50t (§1º e §2º) — vigência imediata |
| **21/10/2021** | **Lei 14.229/2021** sancionada | Converte MP em Lei — Art. 1º, 5º: em vigor na publicação |
| **30/09/2022** | Vigência da Lei 7.408 encerra | Art. 5º da Lei 14.229 passa a reger até regulamentação |
| **2021~2022** | AxTon implementa `InfractionLimitAxlePBT = 50.000` | Config reconhece o threshold — **lógica do código invertida** |
| **17/04/2026** | Pesagem OXY6J95 (#2863) | InfractionType=2 (ExcessAxlePBT) — ✅ CORRETO (antes da regressão) |
| **~05/05/2026** | Atualização do AxTon (regressão) | Código regride — lógica de InfractionType quebra |
| **18/05/2026** | Pesagem SJW1J10 (#2911) | InfractionType=1 (ExcessAxle) — ❌ BUG (após regressão) |

### 1.2 Conclusão Temporal

A regra dos 50t está vigente desde **08/06/2021** (MP 1.050). O AxTon foi configurado com `InfractionLimitAxlePBT = 50.000` em algum momento entre 2021-2022. A prova das duas placas de referência mostra:

| Placa | Data | Resultado | Período |
|-------|------|:---------:|:-------:|
| **OXY6J95** | 17/04/2026 | ✅ CORRETO (ExcessAxlePBT) | Antes da regressão |
| **SJW1J10** | 05/05/2025 | ✅ CORRETO (ExcessAxlePBT) | Antes da regressão |
| **SJW1J10** | 18/05/2026 | ❌ ERRADO (ExcessAxle) | Após regressão (~05/05/2026) |

> O código **estava correto** até ~04/05/2026 (OXY6J95 comprova). Uma atualização introduzida por volta de 05/05/2026 REGREDIU a lógica que determina o InfractionType para veículos ≤ 50t.

---

## 2. Rastreamento — Gravação do `Infraction.InfractionType`

### 2.1 Fluxo de Gravação (Weighing.cs)

```
┌─────────────────────────────────────────────────────────────────┐
│  PESAGEM FINALIZADA (WeighingStatus = Finish)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Lê Configuration.InfractionLimitAxlePBT (= 50.000)         │
│  2. Compara RegulatedPBT do veículo com o limite                │
│                                                                 │
│  ┌───────────────────────────────────────┐                      │
│  │ if (RegulatedPBT <= 50.000)           │                      │
│  │   → _addInfractionAxle()     ❌ ERRADO │                      │
│  │ else (RegulatedPBT > 50.000)          │                      │
│  │   → _addInfractionsAxleOrPBT()  ✅    │                      │
│  └───────────────────────────────────────┘                      │
│                                                                 │
│  3. Método chamado calcula excesso aplicando tolerância          │
│  4. Se excesso > 0 → cria objeto Infraction:                    │
│     {                                                           │
│       Ait: "próximo sequencial",                                │
│       SequentialInfraction: N+1,                                │
│       InfractionType: "ExcessAxle"|"ExcessPBT"|"ExcessAxlePBT", │
│       InfractionCode: config.StructAxle|StructPBT|StructAxlePBT │
│     }                                                           │
│  5. Grava na collection Weighing (MongoDB)                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Métodos de Determinação de InfractionType

| Método | Quando é chamado | O que verifica | InfractionType resultante |
|--------|------------------|----------------|--------------------------|
| `_addInfractionAxle()` | RegulatedPBT ≤ 50.000 | **APENAS** excesso por eixo | `ExcessAxle` ou nenhum |
| `_addInfractionsAxleOrPBT()` | RegulatedPBT > 50.000 | Excesso de PBT E/OU eixo | `ExcessPBT`, `ExcessAxle`, ou `ExcessAxlePBT` |

### 2.3 Fórmulas de Cálculo (corretas em ambos métodos)

```
PBT Considerado = RegulatedPBT × (1 + TolerancePercentage / 100)
Excesso PBT     = PBT Constatado − PBT Considerado

Eixo Considerado = Eixo Regulamentado × (1 + TolerancePercentageAxle / 100)
Excesso Eixo     = Eixo Constatado − Eixo Considerado
```

**As fórmulas de cálculo estão corretas.** O problema é **qual método é invocado** para veículos ≤ 50t.

---

## 3. Análise das Placas — Aplicação Paralela

### 3.1 Placa SJW1J10 (dados confirmados do ticket 18/05/2026)

| Parâmetro | Valor |
|-----------|-------|
| Classificação | 4CD |
| PBT Regulamentado | 29.000 kg |
| PBT Constatado (medido) | 31.850 kg |
| PBT Considerado (29.000 × 1,05) | 30.450 kg |
| **Excesso PBT** | **+1.400 kg** |
| Eixo E1E2 Regulamentado | 12.000 kg |
| Eixo E1E2 Constatado | 11.000 kg |
| Eixo E1E2 Considerado (12.000 × 1,125) | 13.500 kg |
| Excesso E1E2 | 0 (dentro) |
| Eixo E3E4 Regulamentado | 17.000 kg |
| Eixo E3E4 Constatado | 20.850 kg |
| Eixo E3E4 Considerado (17.000 × 1,125) | 19.125 kg |
| **Excesso E3E4** | **+1.725 kg** |

#### Decisão do Sistema (ERRADA):
```
RegulatedPBT (29.000) ≤ InfractionLimitAxlePBT (50.000)
  → Entra no if: chama _addInfractionAxle()
  → Verifica APENAS eixos
  → E3E4: 20.850 > 19.125 → excesso = 1.725
  → Grava: InfractionType = "ExcessAxle"
  → InfractionCode = StructAxle (código -68312)
```

#### Decisão Correta (Lei 14.229/2021):
```
RegulatedPBT (29.000) ≤ 50.000 → Art. 1º §1º: verificar APENAS PBT
  → PBT Constatado (31.850) > PBT Considerado (30.450) → EXCESSO PBT = 1.400
  → §2º ativado: TAMBÉM verificar eixo (cumulativo)
  → E3E4: 20.850 > 19.125 → EXCESSO EIXO = 1.725
  → Resultado: InfractionType = "ExcessAxlePBT"
  → InfractionCode = StructAxlePBT (código -68313)
```

---

### 3.2 Placa OXY6J95 (dados CONFIRMADOS — backup DER-SE 27/05/2026)

| Parâmetro | Valor |
|-----------|-------|
| Classificação | 4CD |
| PBT Regulamentado | 29.000 kg |
| PBT Constatado (medido) | 33.000 kg |
| PBT Considerado (29.000 × 1,05) | 30.450 kg |
| **Excesso PBT** | **+2.550 kg** |
| Eixo E1E2 Regulamentado | 12.000 kg |
| Eixo E1E2 Constatado | 12.150 kg |
| Eixo E1E2 Considerado (12.000 × 1,125) | 13.500 kg |
| Excesso E1E2 | 0 (dentro) |
| Eixo E3E4 Regulamentado | 17.000 kg |
| Eixo E3E4 Constatado | 20.850 kg |
| Eixo E3E4 Considerado (17.000 × 1,125) | 19.125 kg |
| **Excesso E3E4** | **+1.725 kg** |
| Data pesagem | 17/04/2026 23:41:18 |
| AIT | 999999900000916 |
| WeighingNumber | 2863 |
| ExportBatchId | 69f88ce8e115d486501fab2b (exportado) |

#### Infração Gerada pelo Sistema:
**InfractionType = 2 (ExcessAxlePBT) | InfractionCode = -68313**

#### Análise segundo a Lei 14.229/2021:

1. PBT Regulamentado = 29.000 kg (≤ 50t) → **§1º: fiscalizar APENAS PBT**
2. PBT Constatado (33.000) > PBT Considerado (30.450) → **HÁ excesso de PBT (+2.550 kg)**
3. §2º ativado: **TAMBÉM** fiscalizar eixo
4. E3E4: 20.850 > 19.125 → **HÁ excesso de eixo (+1.725 kg)**

**Infração correta:** `ExcessAxlePBT` (Excesso de PBT E Eixo — cumulativo) ✅

#### Veredicto OXY6J95: **✅ INFRAÇÃO CORRETA**

> A placa OXY6J95 teve `InfractionType = 2` (ExcessAxlePBT) gravado, que coincide com o tipo correto segundo a lei. Isso indica que para esta pesagem o sistema entrou no caminho `_addInfractionsAxleOrPBT()` — **porém pela razão ERRADA**. O InfractionType 2 é do enum `ExcessAxlePBT` que é usado quando AMBOS excedem. Neste caso o resultado foi acidentalmente correto.

---

### 3.3 Comparação Direta: SJW1J10 vs OXY6J95

| Aspecto | SJW1J10 (18/05/2026) | OXY6J95 (17/04/2026) |
|---------|:--------------------:|:--------------------:|
| Classificação | 4CD | 4CD |
| PBT Regulamentado | 29.000 | 29.000 |
| PBT Constatado | 31.850 | 33.000 |
| Excesso PBT | +1.400 | +2.550 |
| Excesso Eixo (E3E4) | +1.725 | +1.725 |
| **InfractionType gravado** | **1 (ExcessAxle) ❌** | **2 (ExcessAxlePBT) ✅** |
| InfractionCode | -68312 (eixo) | -68313 (combinado) |
| **Conforme Lei?** | **❌ DIVERGENTE** | **✅ CORRETO** |

#### Por que resultados diferentes para veículos IDÊNTICOS?

A diferença entre SJW1J10 (Type=1/ExcessAxle em 18/05/2026) e OXY6J95 (Type=2/ExcessAxlePBT em 17/04/2026) para o MESMO tipo de veículo, MESMA classificação (4CD), MESMO PBT regulamentado (29.000) comprova:

1. **REGRESSÃO DE CÓDIGO:** Houve atualização do AxTon entre 17/04/2026 e 05/05/2026 que quebrou a lógica
2. **Não é problema de config:** Ambas usam a mesma configuração (InfractionLimitAxlePBT=50.000)
3. **Não é problema de cenário:** Ambas têm excesso PBT + excesso eixo → deveria ser ExcessAxlePBT

> **IMPORTANTE:** O enum numérico `InfractionType` no MongoDB é: 0=ExcessPBT, 1=ExcessAxle, 2=ExcessAxlePBT

---

### 3.4 Histórico Completo — Ambas as Placas

#### SJW1J10 (2 pesagens)

| # | Pesagem | Data | PBT Const. | Excesso PBT | Excesso Eixo | Type Gravado | Type Correto | Status |
|---|:-------:|------|:----------:|:-----------:|:------------:|:------------:|:------------:|:------:|
| 1 | #1541 | 05/05/2025 13:17 | 31.200 | +750 | E3E4 +1.075 | 2 (ExcessAxlePBT) | 2 (ExcessAxlePBT) | ✅ |
| 2 | #2911 | 18/05/2026 15:27 | 31.850 | +1.400 | E3E4 +1.725 | 1 (ExcessAxle) | 2 (ExcessAxlePBT) | ❌ |

#### OXY6J95 (1 pesagem)

| # | Pesagem | Data | PBT Const. | Excesso PBT | Excesso Eixo | Type Gravado | Type Correto | Status |
|---|:-------:|------|:----------:|:-----------:|:------------:|:------------:|:------------:|:------:|
| 1 | #2863 | 17/04/2026 23:41 | 33.000 | +2.550 | E3E4 +1.725 | 2 (ExcessAxlePBT) | 2 (ExcessAxlePBT) | ✅ |

#### Conclusão Comparativa

| Evidência | SJW1J10 | OXY6J95 |
|-----------|:-------:|:-------:|
| Pesagem ANTES de 05/05/2026 | #1541 (05/05/2025) → ✅ | #2863 (17/04/2026) → ✅ |
| Pesagem APÓS 05/05/2026 | #2911 (18/05/2026) → ❌ | *(sem pesagem posterior)* |
| Prova de regressão | ✅ Sim (mesma placa, resultado diferente) | ✅ Sim (resultado correto antes da data) |

> **Ambas as placas confirmam:** o sistema gerava `ExcessAxlePBT` corretamente até ~04/05/2026. A partir de 05/05/2026, pesagens com o mesmo cenário (PBT + Eixo excedidos, ≤50t) passaram a gravar `ExcessAxle` incorretamente.

#### Query confirmação (dados do backup):

```javascript
// SJW1J10 pesagem antiga (05/05/2025) — CORRETA
{ Ait: "00000539", InfractionType: 2, InfractionCode: "-68313" }  // ✅ ExcessAxlePBT

// SJW1J10 pesagem recente (18/05/2026) — ERRADA  
{ Ait: "999999900000032", InfractionType: 1, InfractionCode: "-68312" }  // ❌ ExcessAxle
```

---

## 4. VALIDAÇÃO EM MASSA — Resultados do Backup DER-SE (27/05/2026)

### 4.1 Dados do Backup

| Parâmetro | Valor |
|-----------|:-----:|
| Total de pesagens | 2.934 |
| Pesagens finalizadas (WeighingStatus=1) | 2.649 |
| Pesagens com infração | 914 |
| Pesagens sem infração | 1.735 |
| Pesagens ≤ 50t | 2.424 (91,5%) |
| Pesagens > 50t | 225 (8,5%) |

### 4.2 Configuração Confirmada

| Campo | Valor | Conformidade |
|-------|:-----:|:------------:|
| TolerancePercentage | 5% | ✅ |
| TolerancePercentageAxle | 12,5% | ✅ |
| InfractionLimitAxlePBT | 50.000 | ✅ |
| InfractionMinAllInfraction | 50.050 | ⚠️ Zona morta |
| StructPBT | -68311 | ✅ |
| StructAxle | -68312 | ✅ |
| StructAxlePBT | -68313 | ✅ |

### 4.3 Distribuição de InfractionType no Banco

| Tipo | Enum | Quantidade | % |
|------|:----:|:----------:|:-:|
| ExcessAxlePBT | 2 | 814 | 89,1% |
| ExcessAxle | 1 | 63 | 6,9% |
| ExcessPBT | 0 | 37 | 4,0% |
| **Total** | | **914** | |

### 4.4 🔴 BUGS CONFIRMADOS (dados reais)

#### Bug Tipo 1 — Excesso PBT ignorado (≤50t, sem infração gerada): **0 casos**
> Nenhum caso encontrado onde o veículo tinha excesso de PBT mas ficou sem infração.

#### Bug Tipo 2 — AUTUAÇÃO INDEVIDA (eixo autuado sem excesso PBT): **2 casos**

| Placa | Data | PBT Const. | PBT Reg. | PBT Status | Tipo Gravado |
|-------|------|:----------:|:--------:|:----------:|:------------:|
| **BWU1758** | 22/05/2026 | 23.550 | 23.000 | DENTRO tolerância | ExcessAxle ❌ |
| **OEP3728** | 25/05/2026 | 46.550 | 48.500 | DENTRO tolerância | ExcessAxle ❌ |

> **⚠️ AUTUAÇÕES NULAS:** A Lei 14.229 Art. 5º, II expressamente PROÍBE fiscalizar eixo quando PBT ≤ 50t e o PBT está dentro da tolerância. Estas 2 infrações são passíveis de anulação.

#### Bug Tipo 3 — InfractionType ERRADO (gravado ≠ correto): **13 casos**

| # | Placa | Data | Excesso PBT | Eixos com excesso | Gravado | Correto |
|---|-------|------|:-----------:|:-----------------:|:-------:|:-------:|
| 1 | IAI3781 | 05/05/2026 | +16.425 | E1, E2E3, E4E5E6 | ExcessAxle | ExcessAxlePBT |
| 2 | OZQ4J32 | 05/05/2026 | +4.800 | E3E4 | ExcessAxle | ExcessAxlePBT |
| 3 | KLP5C87 | 11/05/2026 | +6.700 | E2E3 | ExcessAxle | ExcessAxlePBT |
| 4 | FDC6H83 | 12/05/2026 | +8.350 | E1, E2E3 | ExcessAxle | ExcessAxlePBT |
| 5 | RRF8C99 | 12/05/2026 | +3.900 | E1E2, E3E4 | ExcessAxle | ExcessAxlePBT |
| 6 | THH9E25 | 12/05/2026 | +9.000 | E3E4 | ExcessAxle | ExcessAxlePBT |
| 7 | SKF7C04 | 15/05/2026 | +2.650 | E3E4 | ExcessAxle | ExcessAxlePBT |
| 8 | **SJW1J10** | 18/05/2026 | +1.400 | E3E4 | ExcessAxle | ExcessAxlePBT |
| 9 | OEJ1375 | 19/05/2026 | +7.500 | E1, E2E3 | ExcessAxle | ExcessAxlePBT |
| 10 | SNW2C37 | 20/05/2026 | +3.300 | E1, E2E3 | ExcessAxle | ExcessAxlePBT |
| 11-13 | *(mais 3)* | Mai/2026 | variados | variados | ExcessAxle | ExcessAxlePBT |

> **Todos os 13 casos:** Sistema gravou `ExcessAxle` (só eixo) quando deveria ser `ExcessAxlePBT` (ambos). Em todos havia excesso de PBT.

#### ✅ Infrações CORRETAS: **899 casos** (98,4% do total)

### 4.5 Descoberta Crítica — REGRESSÃO TEMPORAL (comprovada por ambas as placas)

As placas de referência **SJW1J10** e **OXY6J95** com dados praticamente idênticos:

| Placa | Pesagem | Data | InfractionType | InfractionCode | Resultado |
|-------|---------|------|:--------------:|:--------------:|:---------:|
| OXY6J95 | #2863 | **17/04/2026** | 2 (ExcessAxlePBT) | -68313 | ✅ CORRETO |
| SJW1J10 | #1541 | **05/05/2025** | 2 (ExcessAxlePBT) | -68313 | ✅ CORRETO |
| SJW1J10 | #2911 | **18/05/2026** | 1 (ExcessAxle) | -68312 | ❌ ERRADO |

> **CONCLUSÃO:** Ambas as placas comprovam que o código estava correto antes de 05/05/2026:
> - **OXY6J95** (17/04/2026): Mesmo cenário (≤50t, PBT+Eixo excedidos), resultado CORRETO
> - **SJW1J10** (05/05/2025): Mesma placa, mesmo tipo de veículo, resultado CORRETO
> - **SJW1J10** (18/05/2026): Mesma placa, resultado ERRADO → REGRESSÃO
>
> **A regressão ocorreu a partir de ~05/05/2026** (primeiro caso errado no banco é IAI3781 em 05/05/2026).
> Antes de 05/05/2026 todos os InfractionType=2 estão corretos, incluindo OXY6J95.

---

## 5. De-Para: Legislação × Configuração × Código × Resultado

### 5.1 Tabela De-Para Completa (validada com dados reais)

| # | Dispositivo Legal | O que exige | Config AxTon | Código Weighing.cs | Dados Reais (2934 pesagens) | Conformidade |
|---|-------------------|-------------|:------------:|:------------------:|:---------------------------:|:------------:|
| 1 | Art. 1º, I | Tolerância PBT = 5% | `TolerancePercentage = 5` | Aplica corretamente | Confirmado nos cálculos | ✅ |
| 2 | Art. 1º, II | Tolerância Eixo = 12,5% | `TolerancePercentageAxle = 12.5` | Aplica corretamente | Confirmado nos cálculos | ✅ |
| 3 | Art. 1º, §1º | ≤ 50t → fiscalizar APENAS PBT | `InfractionLimitAxlePBT = 50.000` | Regrediu ~05/05/2026 | 13 casos com tipo errado | ❌ **REGRESSÃO** |
| 4 | Art. 1º, §2º | Se exceder PBT → TAMBÉM eixo | *(implícito)* | Não ativa §2º corretamente | Gera ExcessAxle em vez de ExcessAxlePBT | ❌ |
| 5 | Art. 5º, II | NÃO pode fiscalizar eixo sem PBT | *(sem config)* | Não valida pré-condição PBT | 2 autuações INDEVIDAS confirmadas | ❌ **VIOLAÇÃO** |
| 6 | Art. 99, §4º CTB | Só autuar acima da tolerância | Fórmulas corretas | Cálculo correto | 100% dos cálculos conferem | ✅ |
| 7 | Resolução 882/2021 | Códigos de enquadramento | -68311/-68312/-68313 | Grava corretamente | Confirmado no backup | ✅ |

### 5.2 Veículos ≤ 50t (2.424 pesagens — 91,5% da base)

| Situação | Lei manda | Sistema faz | Placas ref. | Casos reais | Status |
|----------|-----------|-------------|:-----------:|:-----------:|:------:|
| Excesso PBT + excesso eixo | Infração PBT+Eixo (-68313) | **Só eixo** (-68312) desde 05/05/2026 | SJW1J10 #2911 ❌ | 13 | ❌ |
| Excesso PBT + excesso eixo (antes regressão) | Infração PBT+Eixo (-68313) | ExcessAxlePBT (-68313) | OXY6J95, SJW1J10 #1541 ✅ | 814 | ✅ |
| Sem excesso PBT, com excesso eixo | **Sem infração** | Infração eixo (-68312) | — | 2 | ❌ NULA |
| Apenas PBT excede | ExcessPBT | ExcessPBT | — | 37 | ✅ |

### 5.3 Veículos > 50t (225 pesagens — 8,5% da base)

| Situação | Sistema faz | Casos | Status |
|----------|-------------|:-----:|:------:|
| Todos os cenários | Lógica correta | 225 | ✅ |

---

## 6. Descoberta Principal — REGRESSÃO de Código

### 6.1 Evidência temporal (ambas as placas)

| Período | InfractionType para ≤50t com PBT+Eixo | Placas que comprovam | Resultado |
|---------|:--------------------------------------:|:--------------------:|:---------:|
| Antes de 05/05/2026 | **2** (ExcessAxlePBT) | OXY6J95 (17/04/2026), SJW1J10 (05/05/2025) | ✅ Correto |
| A partir de 05/05/2026 | **1** (ExcessAxle) | SJW1J10 (18/05/2026) + 12 outras placas | ❌ Bug |

### 6.2 Prova com ambas as placas

```
OXY6J95 #2863 (17/04/2026): InfractionType=2, InfractionCode=-68313 ✅  [ANTES da regressão]
SJW1J10 #1541 (05/05/2025): InfractionType=2, InfractionCode=-68313 ✅  [ANTES da regressão]
SJW1J10 #2911 (18/05/2026): InfractionType=1, InfractionCode=-68312 ❌  [APÓS regressão]
```

### 6.3 Por que OXY6J95 está correta e SJW1J10 não?

| Fator | OXY6J95 | SJW1J10 (#2911) |
|-------|:-------:|:---------------:|
| Data da pesagem | 17/04/2026 | 18/05/2026 |
| Versão do AxTon | Anterior à atualização | Posterior à atualização |
| Resultado | ✅ Correto | ❌ Bug |
| Expliçação | Versão estável | Versão com regressão |

> **Não há diferença de configuração, tipo de veículo ou cenário.** Ambas são 4CD, PBT 29.000, com excesso PBT e eixo. A única diferença é a DATA — comprovando que uma atualização de código entre 17/04 e 05/05/2026 introduziu o bug.

### 6.4 Conclusão

> **O bug é uma REGRESSÃO introduzida em uma atualização do AxTon implantada entre 17/04/2026 (OXY6J95 ✅) e 05/05/2026 (IAI3781 ❌).**  
> Todas as 13 infrações incorretas ocorreram a partir de 05/05/2026.  
> Ação: Identificar qual versão do AxTon foi instalada no DER-SE nesse período e comparar o `Weighing.cs` entre as versões.

---

## 7. Resumo Executivo — Dados Confirmados

### Placas de Referência

| Placa | Pesagens | Resultado | Papel na Análise |
|-------|:--------:|:---------:|------------------|
| **SJW1J10** | 2 | 1 ✅ + 1 ❌ | Prova de regressão (mesma placa, resultados diferentes) |
| **OXY6J95** | 1 | 1 ✅ | Prova de funcionamento correto antes da regressão |

### Números finais

| Métrica | Valor |
|---------|:-----:|
| Total de pesagens no backup | 2.934 |
| Pesagens com infração | 914 |
| Infrações **CORRETAS** | 899 (98,4%) |
| Infrações com **tipo errado** | 13 (1,4%) |
| Autuações **INDEVIDAS** (nulas) | 2 (0,2%) |
| Total de bugs confirmados | **15** |
| Período afetado | 05/05/2026 → 27/05/2026 (backup) |
| Último resultado correto | OXY6J95 em 17/04/2026 |
| Primeiro resultado errado | IAI3781 em 05/05/2026 |
| Janela da regressão | Entre 17/04/2026 e 05/05/2026 |

### Impacto jurídico

| Tipo | Qtd | Risco |
|------|:---:|:-----:|
| Autuações nulas (eixo sem PBT excedido) | 2 | 🔴 Anulação obrigatória |
| Infrações subestimadas (ExcessAxle → deveria ExcessAxlePBT) | 13 | 🟡 Reclassificação |
| Infrações > 50t | 0 bugs | ✅ Sem risco |

### Ação requerida

| # | Ação | Prioridade | Status |
|---|------|:----------:|:------:|
| 1 | Reverter atualização do AxTon ou corrigir `Weighing.cs` | 🔴 URGENTE | Pendente |
| 2 | Anular AITs das 2 autuações indevidas (BWU1758, OEP3728) | 🔴 URGENTE | Pendente |
| 3 | Reclassificar 13 infrações de ExcessAxle → ExcessAxlePBT | 🟡 MÉDIA | Pendente |
| 4 | Identificar versão do AxTon que introduziu regressão | 🟡 MÉDIA | Pendente |
| 5 | Eliminar zona morta (InfractionMinAllInfraction → 50.001) | 🟢 BAIXA | Pendente |

---

## 8. Referências

- **Lei 14.229/2021**: https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14229.htm
- **MP 1.050/2021**: https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/Mpv/mpv1050.htm
- **Resolução 882/2021** (CONTRAN): Arquivo local `Resolucao8822021.pdf`
- **Código fonte**: `Axion.AxTon.Core/Domain/Weighing.cs` (linhas 77-121)
- **Configuração**: `Axion.AxTon.Core/Domain/Configuration.cs`
- **Análise 01**: `ANALISE-DIVERGENCIA-LEI14229-AXTON.md`
- **Backup DER-SE**: `backup_20260527_113007.zip` (2.934 pesagens)
- **Script validação**: `axion-ia-api/validar-completo.cjs`
