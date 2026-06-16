# 🔍 Análise Completa: Origem dos Dados do Template da Tarja

**Data:** 2026-06-15  
**Sistema:** AxHub STRANS  
**Tarja:** Tarja Axion (ID: 7c63d905-76d5-4824-bb91-2251e62dc77d)  
**Contexto:** Rastreamento completo de origem de cada variável  

---

## 📋 TEMPLATE COMPLETO DA TARJA AXION

```html
Cód. Equipamento: {CodigoEquipamento} 
Endereço: {CodigoLocalOperacaoEquipamento} 
Faixa: {NumeroFaixa} 
Sentido: {SentidoFaixa}
Data: {DataPassagemInfracao.toString("dd/MM/yyyy HH:mm:ss")}  
Data Aferição: {DataAfericaoInmetro.Value.toString("dd/MM/yyyy")} 
Data Venc. Aferição: {DataVencimentoAfericao.Value.toString("dd/MM/yyyy")} 
Certif.: {CertificadoEquipamento} 
Portaria: {PortariaEquipamento}
Reg. não metrológico: {NumeroCertificadoInmetro} 
Venc. não metrológico : {DataVencimentoAfericao.Value.toString("dd/MM/yyyy")}  
Portaria não metrológico : {PortariaNaoMetrologico} 
Marca/Modelo : {MarcaModeloEquipamento} 
Cód. Org: {CodigoOrgaoAutuador} 
Infração: {CodigoEnquadramento} 
Descrição: {DescricaoEnquadramento} 
Serial: {SerialEquipamento}
```

---

## 🗺️ FLUXO DE DADOS COMPLETO

### **Ponto de Partida: TBInfracoes (Registro da Infração)**

```
TBInfracoes (Infração específica)
    ├── Equipamento_id → TBEquipamentos
    ├── Operacao_id → TBOperacoes
    ├── Faixa_id → TBFaixas
    └── Enquadramento_id → TBEnquadramentos
```

---

## 📊 MAPEAMENTO DETALHADO POR VARIÁVEL

### 🔵 **GRUPO 1: Dados do Equipamento**

#### 1. `{CodigoEquipamento}` → "T5402", "T5403"

**Origem:**
```
TBInfracoes.Equipamento_id 
    → TBEquipamentos.Codigo
```

**Query de validação:**
```sql
-- Ver código do equipamento usado na infração
SELECT 
    i.Id as InfracaoId,
    i.DataHoraInfracao,
    e.Codigo as CodigoEquipamento,
    e.NumeroSerie,
    e.ModeloEquipamento_id
FROM TBInfracoes i
INNER JOIN TBEquipamentos e ON i.Equipamento_id = e.Id
WHERE CAST(i.DataHoraInfracao AS DATE) = '2026-06-11'
    AND e.Codigo IN ('T5402', 'T5403')
ORDER BY i.DataHoraInfracao DESC
```

**Tabela origem:** `TBEquipamentos`  
**Campo:** `Codigo [nvarchar(20)]`  
**Tipo de dado:** Cadastro manual  

---

#### 2. `{SerialEquipamento}` → Número de série

**Origem:**
```
TBInfracoes.Equipamento_id 
    → TBEquipamentos.NumeroSerie
```

**Query de validação:**
```sql
SELECT 
    Codigo,
    NumeroSerie,
    NumeroPatrimonio
FROM TBEquipamentos
WHERE Codigo IN ('T5402', 'T5403')
```

**Tabela origem:** `TBEquipamentos`  
**Campo:** `NumeroSerie [nvarchar(50)]`  
**Tipo de dado:** Cadastro manual  

---

#### 3. `{MarcaModeloEquipamento}` → "VELSIS VSIS-OCR"

**Origem:**
```
TBInfracoes.Equipamento_id 
    → TBEquipamentos.ModeloEquipamento_id 
    → TBModeloEquipamentos.Marca + ' ' + TBModeloEquipamentos.Modelo
```

**Query de validação:**
```sql
SELECT 
    e.Codigo as Equipamento,
    m.Marca,
    m.Modelo,
    CONCAT(m.Marca, ' ', m.Modelo) as MarcaModelo
FROM TBEquipamentos e
INNER JOIN TBModeloEquipamentos m ON e.ModeloEquipamento_id = m.Id
WHERE e.Codigo IN ('T5402', 'T5403')
```

**Tabela origem:** `TBModeloEquipamentos`  
**Campos:** `Marca [nvarchar(50)]` + `Modelo [nvarchar(50)]`  
**Tipo de dado:** Cadastro manual (concatenação de 2 campos)  

---

### 🔵 **GRUPO 2: Dados da Operação**

#### 4. `{CodigoLocalOperacaoEquipamento}` → "Av. Frei Serafim, prox. ao n. 2439"

**Origem:**
```
TBInfracoes.Operacao_id 
    → TBOperacoes.Endereco
```

**Query de validação:**
```sql
SELECT 
    o.Id as OperacaoId,
    o.Endereco,
    o.DataInstalacao,
    e.Codigo as Equipamento
FROM TBOperacoes o
INNER JOIN TBEquipamentos e ON o.Equipamento_id = e.Id
WHERE o.Id = '359a6427-d58d-490e-ab3b-362504f5c7ef'
```

**Tabela origem:** `TBOperacoes`  
**Campo:** `Endereco [nvarchar(200)]` OU `Local [nvarchar(200)]`  
**Tipo de dado:** Cadastro manual  

---

### 🔵 **GRUPO 3: Dados da Faixa**

#### 5. `{NumeroFaixa}` → "1", "2", "3"

**Origem:**
```
TBInfracoes.Faixa_id 
    → TBFaixas.NumeroFaixa
```

**Query de validação:**
```sql
SELECT 
    f.NumeroFaixa,
    f.Sentido,
    f.VelocidadeRegulamentada,
    o.Id as OperacaoId
FROM TBFaixas f
INNER JOIN TBOperacoes o ON f.Operacao_id = o.Id
WHERE o.Id = '359a6427-d58d-490e-ab3b-362504f5c7ef'
ORDER BY f.NumeroFaixa
```

**Tabela origem:** `TBFaixas`  
**Campo:** `NumeroFaixa [int]`  
**Tipo de dado:** Cadastro manual  

---

#### 6. `{SentidoFaixa}` → "Norte/Sul", "Leste/Oeste"

**Origem:**
```
TBInfracoes.Faixa_id 
    → TBFaixas.Sentido
```

**Query de validação:**
```sql
SELECT 
    NumeroFaixa,
    Sentido,
    Operacao_id
FROM TBFaixas
WHERE Operacao_id = '359a6427-d58d-490e-ab3b-362504f5c7ef'
```

**Tabela origem:** `TBFaixas`  
**Campo:** `Sentido [nvarchar(50)]`  
**Tipo de dado:** Cadastro manual  

---

### 🔵 **GRUPO 4: Dados da Infração**

#### 7. `{DataPassagemInfracao}` → "11/06/2026 14:35:22"

**Origem:**
```
TBInfracoes.DataHoraInfracao
```

**Query de validação:**
```sql
SELECT TOP 10
    Id,
    DataHoraInfracao,
    Placa,
    Equipamento_id
FROM TBInfracoes
WHERE CAST(DataHoraInfracao AS DATE) = '2026-06-11'
    AND Equipamento_id IN (
        SELECT Id FROM TBEquipamentos WHERE Codigo IN ('T5402', 'T5403')
    )
ORDER BY DataHoraInfracao DESC
```

**Tabela origem:** `TBInfracoes`  
**Campo:** `DataHoraInfracao [datetime]`  
**Tipo de dado:** Automático (capturado pelo equipamento)  

---

### 🔵 **GRUPO 5: Dados da Aferição (Certificação INMETRO)**

#### 8. `{DataAfericaoInmetro}` → "15/10/2025"

**Origem:**
```
TBInfracoes.Faixa_id 
    → TBFaixasAfericoes.Faixa_id 
    → TBFaixasAfericoes.Afericao_id
    → TBAfericoes.DataAfericao
```

**Query de validação:**
```sql
SELECT 
    f.NumeroFaixa,
    a.DataAfericao,
    a.DataVencimento,
    a.NumeroInmetro,
    a.NumeroLaudo
FROM TBFaixas f
INNER JOIN TBFaixasAfericoes fa ON f.Id = fa.Faixa_id
INNER JOIN TBAfericoes a ON fa.Afericao_id = a.Id
WHERE f.Operacao_id = '359a6427-d58d-490e-ab3b-362504f5c7ef'
ORDER BY f.NumeroFaixa
```

**Tabela origem:** `TBAfericoes`  
**Campo:** `DataAfericao [datetime]`  
**Tipo de dado:** Cadastro manual (data do certificado INMETRO)  

---

#### 9. `{DataVencimentoAfericao}` → "18/10/2026" ⚠️ **USADO 2 VEZES!**

**Origem:**
```
TBInfracoes.Faixa_id 
    → TBFaixasAfericoes.Faixa_id 
    → TBFaixasAfericoes.Afericao_id
    → TBAfericoes.DataVencimento
```

**⚠️ IMPORTANTE:** Esta variável aparece **DUAS VEZES** no template:
- Uma como: `Data Venc. Aferição: {DataVencimentoAfericao...}`
- Outra como: `Venc. não metrológico : {DataVencimentoAfericao...}`

**Query de validação:**
```sql
SELECT 
    a.DataVencimento,
    a.NumeroInmetro,
    f.NumeroFaixa
FROM TBAfericoes a
INNER JOIN TBFaixasAfericoes fa ON a.Id = fa.Afericao_id
INNER JOIN TBFaixas f ON fa.Faixa_id = f.Id
WHERE f.Operacao_id = '359a6427-d58d-490e-ab3b-362504f5c7ef'
```

**Tabela origem:** `TBAfericoes`  
**Campo:** `DataVencimento [datetime]`  
**Tipo de dado:** Cadastro manual (validade do certificado INMETRO)  

---

#### 10. `{NumeroCertificadoInmetro}` → "006350/2021" (Reg. não metrológico)

**Origem:**
```
TBInfracoes.Faixa_id 
    → TBFaixasAfericoes.Faixa_id 
    → TBFaixasAfericoes.Afericao_id
    → TBAfericoes.NumeroInmetro
```

**Query de validação:**
```sql
SELECT 
    a.NumeroInmetro,
    a.NumeroLaudo,
    a.DataAfericao,
    f.NumeroFaixa
FROM TBAfericoes a
INNER JOIN TBFaixasAfericoes fa ON a.Id = fa.Afericao_id
INNER JOIN TBFaixas f ON fa.Faixa_id = f.Id
WHERE f.Operacao_id = '359a6427-d58d-490e-ab3b-362504f5c7ef'
```

**Tabela origem:** `TBAfericoes`  
**Campo:** `NumeroInmetro [nvarchar(20)]`  
**Tipo de dado:** Cadastro manual (número do certificado INMETRO)  

---

### 🔵 **GRUPO 6: Dados do Modelo (Portarias) ⚠️ CRÍTICO**

#### 11. `{CertificadoEquipamento}` → Certificado (campo "Certif.")

**⚠️ VARIÁVEL AMBÍGUA - Pode ter múltiplas origens:**

**Opção A: Número de série do equipamento**
```
TBInfracoes.Equipamento_id 
    → TBEquipamentos.NumeroSerie
```

**Opção B: Número INMETRO da aferição**
```
TBInfracoes.Faixa_id 
    → TBFaixasAfericoes → TBAfericoes.NumeroInmetro
```

**Opção C: Número de patrimônio**
```
TBInfracoes.Equipamento_id 
    → TBEquipamentos.NumeroPatrimonio
```

**Query de teste:**
```sql
-- Testar todas as opções
SELECT 
    e.Codigo,
    e.NumeroSerie as Opcao_A,
    e.NumeroPatrimonio as Opcao_C,
    a.NumeroInmetro as Opcao_B,
    a.NumeroLaudo
FROM TBEquipamentos e
INNER JOIN TBOperacoes o ON e.Id = o.Equipamento_id
INNER JOIN TBFaixas f ON f.Operacao_id = o.Id
LEFT JOIN TBFaixasAfericoes fa ON fa.Faixa_id = f.Id
LEFT JOIN TBAfericoes a ON a.Id = fa.Afericao_id
WHERE e.Codigo = 'T5402'
```

**Tabelas origem:** `TBEquipamentos` OU `TBAfericoes`  
**Tipo de dado:** Depende da implementação do backend  

---

#### 12. `{PortariaEquipamento}` → "PORTARIA INMETRO/DIMEL Nº 492/2021" ⚠️

**Origem ESPERADA:**
```
TBInfracoes.Equipamento_id 
    → TBEquipamentos.ModeloEquipamento_id
    → TBModeloEquipamentos.Portaria
```

**Query de validação:**
```sql
SELECT 
    e.Codigo as Equipamento,
    m.Modelo,
    m.NumeroPortaria,
    m.Portaria as PortariaDoModelo,
    '✅ ESTE É O VALOR CORRETO' as Status
FROM TBEquipamentos e
INNER JOIN TBModeloEquipamentos m ON e.ModeloEquipamento_id = m.Id
WHERE e.Codigo IN ('T5402', 'T5403')
```

**Resultado ATUAL no STRANS:**
```
Equipamento: T5402/T5403
Modelo: VSIS-OCR
NumeroPortaria: 492
Portaria: "PORTARIA INMETRO/DIMEL Nº 492/2021" ✅ CORRETO!
```

**Tabela origem:** `TBModeloEquipamentos`  
**Campo:** `Portaria [nvarchar(50)]`  
**Tipo de dado:** Cadastro manual  

---

#### 13. `{PortariaNaoMetrologico}` → ❌ **CAMPO COM ERRO "492 de 17/07/2012"**

**Origem ESPERADA (mesma que {PortariaEquipamento}):**
```
TBInfracoes.Equipamento_id 
    → TBEquipamentos.ModeloEquipamento_id
    → TBModeloEquipamentos.Portaria
```

**⚠️ PROBLEMA CRÍTICO:**
- A query acima retorna: `"PORTARIA INMETRO/DIMEL Nº 492/2021"` ✅
- MAS a tarja mostra: `"492 de 17/07/2012"` ❌
- **ISSO SIGNIFICA:** O backend NÃO está buscando de `TBModeloEquipamentos.Portaria`!

**Possíveis origens REAIS (não confirmadas):**

**Hipótese 1: Configuração global**
```sql
SELECT * FROM TBConfiguracoes 
WHERE TipoConfiguracao LIKE '%portaria%' 
   OR ValorConfiguracao LIKE '%492%'
```

**Hipótese 2: Hardcode no código C#**
```csharp
// Possível código problemático
public string PortariaNaoMetrologico 
{ 
    get { return "492 de 17/07/2012"; } // ❌ HARDCODED ERRADO
}
```

**Hipótese 3: Arquivo appsettings.json**
```json
{
  "Tarja": {
    "PortariaNaoMetrologico": "492 de 17/07/2012"
  }
}
```

**Query de investigação:**
```sql
-- Buscar QUALQUER tabela com "2012"
SELECT 'TBModeloEquipamentos' as Tabela, Id, Modelo, Portaria
FROM TBModeloEquipamentos
WHERE Portaria LIKE '%2012%'

UNION ALL

SELECT 'TBConfiguracoes', Id, TipoConfiguracao, ValorConfiguracao
FROM TBConfiguracoes
WHERE ValorConfiguracao LIKE '%2012%'

UNION ALL

SELECT 'TBAfericoes', Id, NumeroInmetro, NumeroLaudo
FROM TBAfericoes
WHERE NumeroLaudo LIKE '%2012%' OR NumeroInmetro LIKE '%2012%'
```

**Status atual:** ❌ **ORIGEM NÃO IDENTIFICADA VIA WEB**  
**Tipo de dado:** **DESCONHECIDO** - Requer análise de código backend  

---

### 🔵 **GRUPO 7: Dados do Enquadramento (Infração)**

#### 14. `{CodigoOrgaoAutuador}` → "STRANS"

**Origem POSSÍVEL:**

**Opção A: Configuração global**
```sql
SELECT ValorConfiguracao 
FROM TBConfiguracoes 
WHERE TipoConfiguracao = 'CodigoOrgaoAutuador'
```

**Opção B: Da operação**
```
TBInfracoes.Operacao_id 
    → TBOperacoes.OrgaoAutuador_id 
    → TBOrgaosAutuadores.Codigo
```

**Query de validação:**
```sql
-- Opção A
SELECT * FROM TBConfiguracoes 
WHERE TipoConfiguracao LIKE '%orgao%' OR TipoConfiguracao LIKE '%autuador%'

-- Opção B
SELECT 
    o.Id,
    oa.Codigo,
    oa.Nome
FROM TBOperacoes o
LEFT JOIN TBOrgaosAutuadores oa ON o.OrgaoAutuador_id = oa.Id
WHERE o.Id = '359a6427-d58d-490e-ab3b-362504f5c7ef'
```

**Tabela origem:** `TBConfiguracoes` OU `TBOrgaosAutuadores`  
**Tipo de dado:** Configuração global OU cadastro  

---

#### 15. `{CodigoEnquadramento}` → "75870"

**Origem:**
```
TBInfracoes.Enquadramento_id 
    → TBEnquadramentos.Codigo
```

**Query de validação:**
```sql
SELECT 
    Codigo,
    Descricao,
    Pontuacao,
    ValorMulta,
    Natureza
FROM TBEnquadramentos
WHERE Codigo = '75870'
```

**Tabela origem:** `TBEnquadramentos`  
**Campo:** `Codigo [nvarchar(10)]`  
**Tipo de dado:** Cadastro base (CTB - Código de Trânsito Brasileiro)  

---

#### 16. `{DescricaoEnquadramento}` → "TRANSITAR COM O VEIC NA FAIXA OU VIA..."

**Origem:**
```
TBInfracoes.Enquadramento_id 
    → TBEnquadramentos.Descricao
```

**Query de validação:**
```sql
SELECT 
    Codigo,
    Descricao
FROM TBEnquadramentos
WHERE Codigo = '75870'
```

**Tabela origem:** `TBEnquadramentos`  
**Campo:** `Descricao [nvarchar(500)]`  
**Tipo de dado:** Cadastro base (descrição oficial do CTB)  

---

## 📊 TABELA RESUMO: ORIGEM DE CADA CAMPO

| Variável Template | Campo Exibido | Tabela Origem | Campo do Banco | Nível |
|-------------------|---------------|---------------|----------------|-------|
| `{CodigoEquipamento}` | Cód. Equipamento | TBEquipamentos | Codigo | Equipamento |
| `{SerialEquipamento}` | Serial | TBEquipamentos | NumeroSerie | Equipamento |
| `{MarcaModeloEquipamento}` | Marca/Modelo | TBModeloEquipamentos | Marca + Modelo | Modelo |
| `{CodigoLocalOperacaoEquipamento}` | Endereço | TBOperacoes | Endereco | Operação |
| `{NumeroFaixa}` | Faixa | TBFaixas | NumeroFaixa | Faixa |
| `{SentidoFaixa}` | Sentido | TBFaixas | Sentido | Faixa |
| `{DataPassagemInfracao}` | Data | TBInfracoes | DataHoraInfracao | Infração |
| `{DataAfericaoInmetro}` | Data Aferição | TBAfericoes | DataAfericao | Aferição |
| `{DataVencimentoAfericao}` | Data Venc. / Venc. não metrológico | TBAfericoes | DataVencimento | Aferição |
| `{NumeroCertificadoInmetro}` | Reg. não metrológico | TBAfericoes | NumeroInmetro | Aferição |
| `{CertificadoEquipamento}` | Certif. | TBEquipamentos OU TBAfericoes | NumeroSerie OU NumeroInmetro | Ambíguo |
| **`{PortariaEquipamento}`** | **Portaria** | **TBModeloEquipamentos** | **Portaria** ✅ | **Modelo** |
| **`{PortariaNaoMetrologico}`** ❌ | **Portaria não metrológico** | **??? DESCONHECIDO** | **??? ERRO** ❌ | **???** |
| `{CodigoOrgaoAutuador}` | Cód. Org | TBConfiguracoes OU TBOrgaosAutuadores | ValorConfiguracao OU Codigo | Config/Cadastro |
| `{CodigoEnquadramento}` | Infração | TBEnquadramentos | Codigo | Enquadramento |
| `{DescricaoEnquadramento}` | Descrição | TBEnquadramentos | Descricao | Enquadramento |

---

## 🔍 ANÁLISE DO PROBLEMA: {PortariaNaoMetrologico}

### **Comparação das DUAS variáveis de Portaria:**

| Aspecto | {PortariaEquipamento} | {PortariaNaoMetrologico} |
|---------|----------------------|--------------------------|
| **Origem esperada** | TBModeloEquipamentos.Portaria | TBModeloEquipamentos.Portaria |
| **Valor no banco** | "PORTARIA INMETRO/DIMEL Nº 492/2021" ✅ | "PORTARIA INMETRO/DIMEL Nº 492/2021" ✅ |
| **Valor na tarja** | ??? (não confirmado) | "492 de 17/07/2012" ❌ |
| **Status** | Provavelmente correto | **ERRADO** |

### **Conclusão:**

Se ambas as variáveis deveriam buscar do mesmo campo (`TBModeloEquipamentos.Portaria`), mas **uma mostra valor correto e outra mostra valor errado**, isso significa:

1. **O backend TEM lógicas diferentes** para `{PortariaEquipamento}` e `{PortariaNaoMetrologico}`
2. **`{PortariaNaoMetrologico}` NÃO busca de `TBModeloEquipamentos.Portaria`**
3. **O valor "492 de 17/07/2012" está hardcoded em:**
   - Código C# (método/propriedade)
   - Arquivo de configuração (appsettings.json)
   - Tabela TBConfiguracoes (não acessível via web)
   - Cache/memória do sistema

---

## 🎯 SCRIPT COMPLETO DE VALIDAÇÃO

Execute este script para ver TODOS os dados que alimentam a tarja:

```sql
-- ==================================================
-- VALIDAÇÃO COMPLETA: Dados da Tarja para Infração
-- ==================================================

DECLARE @InfracaoId UNIQUEIDENTIFIER
DECLARE @EquipamentoCodigo NVARCHAR(20) = 'T5402' -- OU 'T5403'
DECLARE @DataInfracao DATE = '2026-06-11'

-- Buscar uma infração específica
SELECT TOP 1 @InfracaoId = Id
FROM TBInfracoes
WHERE CAST(DataHoraInfracao AS DATE) = @DataInfracao
    AND Equipamento_id IN (SELECT Id FROM TBEquipamentos WHERE Codigo = @EquipamentoCodigo)

PRINT 'Infração ID: ' + CAST(@InfracaoId AS NVARCHAR(50))
PRINT ''
PRINT '=========================================='
PRINT 'DADOS COMPLETOS DA TARJA'
PRINT '=========================================='

SELECT 
    -- GRUPO 1: Equipamento
    e.Codigo as CodigoEquipamento,
    e.NumeroSerie as SerialEquipamento,
    CONCAT(m.Marca, ' ', m.Modelo) as MarcaModeloEquipamento,
    
    -- GRUPO 2: Operação
    o.Endereco as CodigoLocalOperacaoEquipamento,
    
    -- GRUPO 3: Faixa
    f.NumeroFaixa,
    f.Sentido as SentidoFaixa,
    
    -- GRUPO 4: Infração
    i.DataHoraInfracao as DataPassagemInfracao,
    
    -- GRUPO 5: Aferição
    a.DataAfericao as DataAfericaoInmetro,
    a.DataVencimento as DataVencimentoAfericao,
    a.NumeroInmetro as NumeroCertificadoInmetro,
    a.NumeroLaudo,
    
    -- GRUPO 6: Modelo (PORTARIAS - CRÍTICO!)
    m.NumeroPortaria,
    m.Portaria as PortariaEquipamento, -- ESTE DEVERIA SER USADO
    m.Portaria as PortariaNaoMetrologico_ESPERADO, -- O QUE DEVERIA APARECER
    '??? 492 de 17/07/2012 ???' as PortariaNaoMetrologico_REAL, -- O QUE APARECE (ERRO!)
    
    -- GRUPO 7: Enquadramento
    enq.Codigo as CodigoEnquadramento,
    enq.Descricao as DescricaoEnquadramento,
    
    -- Certificado (ambíguo)
    e.NumeroSerie as CertificadoEquipamento_Opcao1,
    a.NumeroInmetro as CertificadoEquipamento_Opcao2,
    e.NumeroPatrimonio as CertificadoEquipamento_Opcao3,
    
    -- IDs para referência
    i.Id as InfracaoId,
    e.Id as EquipamentoId,
    m.Id as ModeloId,
    o.Id as OperacaoId,
    f.Id as FaixaId,
    a.Id as AfericaoId

FROM TBInfracoes i
INNER JOIN TBEquipamentos e ON i.Equipamento_id = e.Id
INNER JOIN TBModeloEquipamentos m ON e.ModeloEquipamento_id = m.Id
INNER JOIN TBOperacoes o ON i.Operacao_id = o.Id
INNER JOIN TBFaixas f ON i.Faixa_id = f.Id
INNER JOIN TBEnquadramentos enq ON i.Enquadramento_id = enq.Id
LEFT JOIN TBFaixasAfericoes fa ON fa.Faixa_id = f.Id
LEFT JOIN TBAfericoes a ON a.Id = fa.Afericao_id

WHERE i.Id = @InfracaoId

-- Verificar se há configuração global de portaria
PRINT ''
PRINT '=========================================='
PRINT 'VERIFICAR CONFIGURAÇÕES GLOBAIS'
PRINT '=========================================='
SELECT 
    TipoConfiguracao,
    ValorConfiguracao
FROM TBConfiguracoes
WHERE 
    TipoConfiguracao LIKE '%portaria%'
    OR ValorConfiguracao LIKE '%492%'
    OR ValorConfiguracao LIKE '%2012%'
```

---

## ✅ CONCLUSÃO DA ANÁLISE

### **Dados Confirmados via Web:**

1. ✅ `TBModeloEquipamentos.Portaria` = **"PORTARIA INMETRO/DIMEL Nº 492/2021"**
2. ✅ Template usa placeholder `{PortariaNaoMetrologico}` (não hardcoded)
3. ✅ Não há modelos duplicados

### **Dados NÃO Confirmados:**

1. ❌ Origem real de `{PortariaNaoMetrologico}` (backend usa lógica diferente)
2. ❌ Conteúdo de `TBConfiguracoes` (não acessível via web)
3. ❌ Código-fonte do backend (não disponível)

### **Próximos Passos:**

1. ✅ **Testar workaround:** Substituir `{PortariaNaoMetrologico}` por `{PortariaEquipamento}` no template
2. ✅ **Solicitar acesso:** Código-fonte OU SSH ao servidor OU query SQL em TBConfiguracoes
3. ✅ **Buscar no servidor:** `grep -r "492 de 17/07/2012" /caminho/axhub/`

---

**Documento criado em:** 2026-06-15  
**Método:** Análise via web + Documentação do schema (AxHub.sql)  
**Status:** Mapeamento completo - Erro localizado em `{PortariaNaoMetrologico}`
