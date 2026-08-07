# Análise de Conformidade: AxTon × Lei 14.229/2021 (Resolução 882/2021)

**Data:** 28/05/2026  
**Contato:** DER-SE | Daniel Costa  
**AnyDesk:** 475 552 370  
**Placas analisadas:** SJW1J10, OEO3F06

---

## 1. Legislação Aplicável

### Lei 14.229/2021 (altera Lei 7.408/1985)

| Dispositivo | Regra |
|-------------|-------|
| **Art. 1º, I** | Tolerância PBT/PBTC: **5%** |
| **Art. 1º, II** | Tolerância por eixo: **12,5%** |
| **Art. 1º, §1º** | Veículos com PBT ≤ 50 t → fiscalizar **APENAS PBT** (não eixo) |
| **Art. 1º, §2º** | Se ultrapassar tolerância de PBT → **TAMBÉM** fiscalizar eixo (cumulativo) |
| **Art. 5º, II** | "Não poderá haver fiscalização de excesso de peso quanto ao peso bruto transmitido por eixo nos Veículos com PBT regulamentar ≤ 50 t, **exceto se for excedido o limite de peso bruto total**" |

### Resumo da Lógica Legal (≤ 50t):
```
SE PBT_Regulamentado ≤ 50.000 kg:
    → Verificar APENAS excesso de PBT (com tolerância 5%)
    → SE excede PBT (após tolerância):
        → TAMBÉM verificar excesso de eixo (cumulativo)
    → SE NÃO excede PBT:
        → NÃO pode autuar por eixo (mesmo que eixo exceda)
```

### Para Veículos > 50t:
```
SE PBT_Regulamentado > 50.000 kg:
    → Verificar PBT E eixo desde o início (ambas dimensões)
```

---

## 2. Configuração Atual do Sistema AxTon

### Tela: Administração → Sistema → Infração

| Parâmetro | Valor Atual | Significado |
|-----------|:-----------:|-------------|
| Peso regulamentado **máximo** para considerar Infrações de PBT ou Eixo | **50.000** | Se RegulatedPBT ≤ este valor → só verifica eixo |
| Peso regulamentado **mínimo** para considerar Infrações de PBT, Eixo, PBT e EIXO | **50.050** | Se RegulatedPBT > este valor → verifica ambos |

### Parâmetros em `Configuration` (MongoDB):

| Campo | Valor | Função |
|-------|:-----:|--------|
| `TolerancePercentage` | 5 | Tolerância PBT (5%) ✅ correto |
| `TolerancePercentageAxle` | 12.5 | Tolerância eixo (12,5%) ✅ correto |
| `InfractionLimitAxlePBT` | 50.000 | Divisor da lógica 50t |
| `InfractionMinAllInfraction` | 50.050 | Comentário no ticket PDF |
| `StructPBT` | (código) | Código de Infração PBT |
| `StructAxle` | (código) | Código de Infração eixo |
| `StructAxlePBT` | (código) | Código de Infração PBT+Eixo |

---

## 3. 🔴 DIVERGÊNCIA CRÍTICA: Lógica dos 50t está INVERTIDA

### O que a Lei manda:
```
SE RegulatedPBT ≤ 50.000:
    → Verificar APENAS PBT
    → Se PBT exceder tolerância → também eixo (cumulativo)
    
SE RegulatedPBT > 50.000:
    → Verificar PBT E eixo desde o início
```

### O que o Sistema faz (Weighing.cs):
```
SE RegulatedPBT ≤ 50.000 (InfractionLimitAxlePBT):
    → Verifica APENAS EIXO ← ❌ INVERTIDO!
    
SE RegulatedPBT > 50.000:
    → Verifica PBT E eixo ← ✅ correto para >50t
```

### Impacto:

| Cenário | Lei manda | Sistema faz | Status |
|---------|-----------|-------------|:------:|
| Caminhão 29t, pesou 32t (excede PBT) | ❌ Infração de PBT | ✅ Nenhuma Infração PBT (não olha PBT!) | **❌ ERRADO** |
| Caminhão 45t, pesou 47t PBT (tolerância 5% = 47,25t) | ✅ Sem Infração | ✅ Sem Infração | ✅ |
| Caminhão 45t no PBT, 1 eixo 200 kg acima tolerância | ✅ Sem Infração (PBT dentro; §2º não dispara) | ❌ Gera Infração de eixo | **❌ ERRADO** |
| Caminhão 45t, pesou 48t PBT + 1 eixo acima | ❌ Infração PBT + eixo | ❌ Sistema só gera Infração de eixo | **❌ ERRADO** |
| CVC 57t, pesou 60t + 1 eixo acima | ❌ Infração cumulativa PBT+eixo | ✅ Infração cumulativa | ✅ |

---

## 4. Análise da Placa SJW1J10 (18/05/2026)

### Dados do Ticket:
| Campo | Valor |
|-------|-------|
| Placa | SJW1J10 |
| Classificação | 4CD |
| PBT Regulamentado | 29.000 kg |
| PBT Considerado (29.000 + 5%) | 30.450 kg |
| PBT Constatado (medido) | 31.850 kg |
| **Excesso de PBT** | **1.400 kg** |
| Eixo E1E2 Regulamentado | 12.000 kg |
| Eixo E1E2 Considerado (12.000 + 12,5%) | 13.500 kg |
| Eixo E1E2 Constatado | 11.000 kg |
| **Excesso E1E2** | **0 kg** |
| Eixo E3E4 Regulamentado | 17.000 kg |
| Eixo E3E4 Considerado (17.000 + 12,5%) | 19.125 kg |
| Eixo E3E4 Constatado | 20.850 kg |
| **Excesso E3E4** | **1.725 kg** |

### Infração Gerada pelo Sistema:
**Excesso de Eixo** (somente)

### O que deveria ser segundo a Lei:

1. PBT Regulamentado = 29.000 kg (≤ 50t) → **fiscalizar APENAS PBT**
2. PBT Constatado (31.850) > PBT Considerado (30.450) → **HÁ excesso de PBT (1.400 kg)**
3. Como excedeu PBT → §2º ativa: **TAMBÉM** fiscalizar eixo
4. Eixo E3E4: 20.850 > 19.125 → **HÁ excesso de eixo (1.725 kg)**

**Infração correta:** `ExcessAxlePBT` (Excesso de PBT E Eixo — cumulativo)

### Fórmulas aplicadas:

```
PBT Considerado = PBT Regulamentado × (1 + TolerancePercentage/100)
PBT Considerado = 29.000 × 1,05 = 30.450 kg ✅

Excesso PBT = PBT Constatado - PBT Considerado
Excesso PBT = 31.850 - 30.450 = 1.400 kg ✅ (há excesso)

Eixo Considerado = Eixo Regulamentado × (1 + TolerancePercentageAxle/100)
E3E4 Considerado = 17.000 × 1,125 = 19.125 kg ✅

Excesso Eixo = Eixo Constatado - Eixo Considerado
Excesso E3E4 = 20.850 - 19.125 = 1.725 kg ✅ (há excesso)
```

### Por que o sistema errou:
O sistema vê `RegulatedPBT (29.000) ≤ InfractionLimitAxlePBT (50.000)` e chama **apenas** `_addInfractionAxle()` — que só verifica excesso por eixo. Nunca verifica PBT para Veículos ≤ 50t.

---

## 5. Problema na Exportação de Infrações

### Sintoma reportado:
Ao gerar exportação com filtro "Excesso Eixo", aparece o registro da placa SJW1J10. Mas ao filtrar por "Excesso PBT", nada aparece.

### Causa raiz:
O campo `Infraction.InfractionType` foi gravado como `ExcessAxle` no MongoDB (porque a lógica invertida só verificou eixo). Como a busca de exportação filtra por `InfractionType`, o registro só aparece em "Excesso Eixo".

### Tipos de Infração no dropdown da Exportação:
| Filtro | Enum | Descrição |
|--------|------|-----------|
| Excesso PBT | `ExcessPBT` | Só PBT excedido |
| Excesso Eixo | `ExcessAxle` | Só eixo excedido |
| Excesso de Eixo e PBT | `ExcessAxlePBT` | Ambos excedidos (cumulativo) |

---

## 6. Correção Necessária (Weighing.cs)

### Lógica atual (ERRADA):
```csharp
if (RegulatedPBT <= InfractionLimitAxlePBT) // ≤ 50.000
{
 _addInfractionAxle(); // Só verifica eixo ← INVERTIDO!
}
else // > 50.000
{
    _addInfractionsAxleOrPBT(); // Verifica ambos
}
```

### Lógica correta (conforme Lei 14.229/2021):
```csharp
if (RegulatedPBT <= InfractionLimitAxlePBT) // ≤ 50.000
{
    // §1º: Verificar APENAS PBT
    var excessoPBT = GetExcessPBT(); // PBT Constatado - PBT Considerado
    
    if (excessoPBT > 0)
    {
        // Há excesso de PBT → §2º: TAMBÉM verificar eixo (cumulativo)
        var excessoEixo = GetExcessAxle();
        
        if (excessoEixo > 0)
            _setInfraction(InfractionType.ExcessAxlePBT); // Ambos
        else
            _setInfraction(InfractionType.ExcessPBT); // Só PBT
    }
    // Se NÃO excede PBT → NÃO pode autuar (nem por eixo!)
}
else // > 50.000
{
    // Veículos pesados: verificar ambas dimensões independentemente
    _addInfractionsAxleOrPBT(); // Mantém lógica atual (está correto)
}
```

---

## 7. Validações de Campo Recomendadas

Antes de aplicar a correção no código, confirmar com dados reais do banco:

| # | Validação | Query sugerida |
|---|-----------|----------------|
| 1 | Pesagem de caminhão ≤ 50t que ficou dentro do PBT mas estourou eixo → sistema gerou Infração de eixo? **Se sim = bug confirmado** | `db.Weighing.find({ RegulatedPBT: { $lte: 50000 }, "Infraction.InfractionType": "ExcessAxle" })` |
| 2 | Pesagem de caminhão ≤ 50t que estourou só PBT (todos eixos OK) → ficou sem Infração **Se sim = bug confirmado** | Verificar se existe algum registro com PBT constatado > considerado mas sem Infração |
| 3 | CVC > 50t com excesso simultâneo → confirmar que entra como `ExcessAxlePBT` | `db.Weighing.find({ RegulatedPBT: { $gt: 50000 }, "Infraction.InfractionType": "ExcessAxlePBT" })` |

---

## 8. Resumo Executivo

| Item | Status |
|------|:------:|
| Tolerância PBT 5% | ✅ Correto |
| Tolerância Eixo 12,5% | ✅ Correto |
| Patamar 50t como divisor | ✅ Correto (InfractionLimitAxlePBT = 50.000) |
| Cálculo de excesso (fórmulas) | ✅ Correto |
| **Lógica de qual Infração gerar (≤ 50t)** | **❌ INVERTIDA** |
| Exportação filtra por InfractionType | ✅ Funciona corretamente (dado está errado na origem) |

### Consequências da inversão:

1. Veículos ≤ 50t com excesso de PBT puro** → passam sem Infração (o sistema ignora PBT)
2. Veículos ≤ 50t com excesso de eixo mas dentro do PBT** → são autuados indevidamente (a lei proíbe)
3. Veículos ≤ 50t com excesso de PBT + eixo** → recebem apenas Infração de eixo (deveria ser cumulativa)

### Ação requerida:
Correção no arquivo `Weighing.cs` (linhas ~77-121) para inverter a lógica conforme a Lei 14.229/2021, Art. 1º §1º e §2º.

---

## 9. Referências

- **Lei 14.229/2021**: https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14229.htm
- **Resolução 882/2021** (CONTRAN): Arquivo local `Resolucao8822021.pdf`
- **Código fonte**: `Axion.AxTon.Core/Domain/Weighing.cs` (linhas 77-121)
- **Configuração `StartWeighingFormComponent.cs` (linha 222 — lê InfractionLimitAxlePBT)
