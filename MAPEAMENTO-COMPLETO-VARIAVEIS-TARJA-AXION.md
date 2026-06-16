# 🔍 Mapeamento Completo: Variáveis da Tarja Axion

**Data:** 2026-06-15  
**Sistema:** AxHub STRANS  
**Tarja:** Tarja Axion (ID: 7c63d905-76d5-4824-bb91-2251e62dc77d)  
**Contexto:** Imagem do dia 11/06/2026 - ERRO AINDA EXISTE!  

---

## 📋 TEMPLATE COMPLETO

```
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

## 🗺️ MAPEAMENTO COMPLETO DE VARIÁVEIS

### 1️⃣ **{CodigoEquipamento}**

**O que mostra:** Código do equipamento (ex: "T5402", "T5403")

**Origem no banco:**
```sql
TBEquipamentos.Codigo
```

**Como chega na tarja:**
```
TBInfracoes.Equipamento_id 
    → TBEquipamentos.Codigo
```

**Como alterar:**
- Menu → Equipamentos → Equipamentos → Editar equipamento
- Campo: "Código"
- Impacto: **GLOBAL** - Altera código em todas operações deste equipamento

**Query de validação:**
```sql
SELECT 
    Id,
    Codigo,
    NumeroSerie,
    NumeroPatrimonio,
    ModeloEquipamento_id
FROM TBEquipamentos
WHERE Codigo = 'T5402'
```

---

### 2️⃣ **{CodigoLocalOperacaoEquipamento}**

**O que mostra:** Endereço da operação (ex: "Av. Frei Serafim, prox. ao n. 2439")

**Origem no banco:**
```sql
TBOperacoes.Endereco
```

**Como chega na tarja:**
```
TBInfracoes.Operacao_id 
    → TBOperacoes.Endereco
```

**Como alterar:**
- Menu → Operações → Operações → Editar operação específica
- Campo: "Endereço" ou "Local"
- Impacto: **POR OPERAÇÃO** - Altera apenas esta operação

**Query de validação:**
```sql
SELECT 
    Id,
    Endereco,
    Equipamento_id,
    DataInstalacao
FROM TBOperacoes
WHERE Id = '359a6427-d58d-490e-ab3b-362504f5c7ef'
```

---

### 3️⃣ **{NumeroFaixa}**

**O que mostra:** Número da faixa (ex: "1", "2", "3")

**Origem no banco:**
```sql
TBFaixas.NumeroFaixa
```

**Como chega na tarja:**
```
TBInfracoes.Faixa_id 
    → TBFaixas.NumeroFaixa
```

**Como alterar:**
- Menu → Operações → Operações → Editar operação → Aba "Faixas"
- Campo: "Número da Faixa"
- Impacto: **POR FAIXA** - Altera numeração da faixa específica

**Query de validação:**
```sql
SELECT 
    f.Id,
    f.NumeroFaixa,
    f.Sentido,
    f.VelocidadeRegulamentada,
    f.Operacao_id
FROM TBFaixas f
WHERE f.Operacao_id = '359a6427-d58d-490e-ab3b-362504f5c7ef'
ORDER BY f.NumeroFaixa
```

---

### 4️⃣ **{SentidoFaixa}**

**O que mostra:** Sentido da faixa (ex: "Norte/Sul", "Leste/Oeste")

**Origem no banco:**
```sql
TBFaixas.Sentido
```

**Como chega na tarja:**
```
TBInfracoes.Faixa_id 
    → TBFaixas.Sentido
```

**Como alterar:**
- Menu → Operações → Operações → Editar operação → Aba "Faixas"
- Campo: "Sentido"
- Impacto: **POR FAIXA** - Altera sentido da faixa específica

---

### 5️⃣ **{DataPassagemInfracao}**

**O que mostra:** Data e hora da infração (ex: "11/06/2026 14:35:22")

**Origem no banco:**
```sql
TBInfracoes.DataHoraInfracao
```

**Como chega na tarja:**
```
TBInfracoes.DataHoraInfracao
```

**Como alterar:**
- ⚠️ **NÃO DEVE SER ALTERADO** - Gerado automaticamente pelo sistema
- Valor capturado pelo equipamento no momento da infração
- Impacto: **POR INFRAÇÃO** - Cada infração tem sua data própria

**Query de validação:**
```sql
SELECT 
    TOP 10
    Id,
    DataHoraInfracao,
    Placa,
    Equipamento_id,
    Faixa_id
FROM TBInfracoes
WHERE Equipamento_id IN (
    SELECT Id FROM TBEquipamentos WHERE Codigo = 'T5402'
)
ORDER BY DataHoraInfracao DESC
```

---

### 6️⃣ **{DataAfericaoInmetro}** (Data Aferição)

**O que mostra:** Data da aferição INMETRO (ex: "15/10/2025")

**Origem no banco:**
```sql
TBAfericoes.DataAfericao
```

**Como chega na tarja:**
```
TBInfracoes.Faixa_id 
    → TBFaixasAfericoes.Faixa_id 
    → TBFaixasAfericoes.Afericao_id
    → TBAfericoes.DataAfericao
```

**Como alterar:**
- Menu → Medição → Aferições → Editar aferição
- Campo: "Data da Aferição"
- Impacto: **POR AFERIÇÃO** - Afeta todas as faixas vinculadas a esta aferição

**Query de validação:**
```sql
SELECT 
    a.Id,
    a.DataAfericao,
    a.DataVencimento,
    a.NumeroInmetro,
    a.NumeroLaudo,
    fa.Faixa_id
FROM TBAfericoes a
INNER JOIN TBFaixasAfericoes fa ON a.Id = fa.Afericao_id
WHERE fa.Faixa_id IN (
    SELECT Id FROM TBFaixas WHERE Operacao_id = '359a6427-d58d-490e-ab3b-362504f5c7ef'
)
```

---

### 7️⃣ **{DataVencimentoAfericao}** (Data Venc. Aferição / Venc. não metrológico)

**O que mostra:** Data de vencimento da aferição (ex: "18/10/2026")

**Origem no banco:**
```sql
TBAfericoes.DataVencimento
```

**Como chega na tarja:**
```
TBInfracoes.Faixa_id 
    → TBFaixasAfericoes.Faixa_id 
    → TBFaixasAfericoes.Afericao_id
    → TBAfericoes.DataVencimento
```

**Como alterar:**
- Menu → Medição → Aferições → Editar aferição
- Campo: "Data de Vencimento"
- Impacto: **POR AFERIÇÃO** - Afeta todas as faixas vinculadas a esta aferição

⚠️ **IMPORTANTE:** Este campo aparece **DUAS VEZES** na tarja:
- Uma vez como "Data Venc. Aferição"
- Outra como "Venc. não metrológico"

---

### 8️⃣ **{CertificadoEquipamento}**

**O que mostra:** Certificado do equipamento (campo "Certif.")

**⚠️ VARIÁVEL AMBÍGUA - Pode ser:**

**Opção A: Número do equipamento**
```sql
TBEquipamentos.NumeroSerie
-- OU
TBEquipamentos.NumeroPatrimonio
```

**Opção B: Número da aferição**
```sql
TBAfericoes.NumeroInmetro
```

**Como alterar:**
- **Se for Opção A:** Menu → Equipamentos → Editar → Campo "Nº Série" ou "Nº Patrimônio"
- **Se for Opção B:** Menu → Medição → Aferições → Editar → Campo "Nº INMETRO"

**Query de validação:**
```sql
-- Verificar equipamento
SELECT 
    Codigo,
    NumeroSerie,
    NumeroPatrimonio
FROM TBEquipamentos
WHERE Codigo = 'T5402'

-- Verificar aferição
SELECT 
    a.NumeroInmetro,
    a.NumeroLaudo
FROM TBAfericoes a
INNER JOIN TBFaixasAfericoes fa ON a.Id = fa.Afericao_id
INNER JOIN TBFaixas f ON fa.Faixa_id = f.Id
WHERE f.Operacao_id = '359a6427-d58d-490e-ab3b-362504f5c7ef'
```

---

### 9️⃣ **{PortariaEquipamento}** ⚠️⚠️⚠️

**O que mostra:** Portaria do equipamento (campo "Portaria:")

**Origem no banco:**
```sql
TBModeloEquipamentos.Portaria
```

**Como chega na tarja:**
```
TBInfracoes.Equipamento_id 
    → TBEquipamentos.ModeloEquipamento_id
    → TBModeloEquipamentos.Portaria
```

**Como alterar:**
- Menu → Cadastros Básicos → Modelos de Equipamentos → Editar modelo
- Campo: "Portaria"
- Impacto: **GLOBAL** - Altera para TODOS os equipamentos deste modelo

**Query de validação:**
```sql
SELECT 
    m.Marca,
    m.Modelo,
    m.NumeroPortaria,
    m.Portaria,
    e.Codigo
FROM TBModeloEquipamentos m
INNER JOIN TBEquipamentos e ON m.Id = e.ModeloEquipamento_id
WHERE e.Codigo = 'T5402'
```

**⚠️ IMPORTANTE:** Este é o **PRIMEIRO campo "Portaria"** na tarja!

---

### 🔟 **{NumeroCertificadoInmetro}** (Reg. não metrológico)

**O que mostra:** Número do certificado INMETRO (ex: "006350/2021")

**Origem no banco:**
```sql
TBAfericoes.NumeroInmetro
```

**Como chega na tarja:**
```
TBInfracoes.Faixa_id 
    → TBFaixasAfericoes.Faixa_id 
    → TBFaixasAfericoes.Afericao_id
    → TBAfericoes.NumeroInmetro
```

**Como alterar:**
- Menu → Medição → Aferições → Editar aferição
- Campo: "Número INMETRO"
- Impacto: **POR AFERIÇÃO** - Afeta todas as faixas vinculadas a esta aferição

**Query de validação:**
```sql
SELECT 
    a.NumeroInmetro,
    a.NumeroLaudo,
    a.DataAfericao,
    a.DataVencimento
FROM TBAfericoes a
INNER JOIN TBFaixasAfericoes fa ON a.Id = fa.Afericao_id
INNER JOIN TBFaixas f ON fa.Faixa_id = f.Id
WHERE f.Operacao_id = '359a6427-d58d-490e-ab3b-362504f5c7ef'
```

---

### 1️⃣1️⃣ **{PortariaNaoMetrologico}** ⚠️⚠️⚠️ **CAMPO DO ERRO!**

**O que mostra:** Portaria não metrológico (campo "Portaria não metrológico:")

**⚠️ ESTE É O CAMPO COM O ERRO "492 de 17/07/2012"!**

**Origem no banco:**
```sql
TBModeloEquipamentos.Portaria
```

**Como chega na tarja:**
```
TBInfracoes.Equipamento_id 
    → TBEquipamentos.ModeloEquipamento_id
    → TBModeloEquipamentos.Portaria
```

**Como alterar:**
- Menu → Cadastros Básicos → Modelos de Equipamentos → Editar modelo VSIS-OCR
- Campo: "Portaria"
- Impacto: **GLOBAL** - Altera para TODOS os equipamentos deste modelo

**⚠️ IMPORTANTE:** Este é o **SEGUNDO campo "Portaria"** na tarja!

**⚠️⚠️ DESCOBERTA CRÍTICA:**
- `{PortariaEquipamento}` e `{PortariaNaoMetrologico}` **buscam do MESMO local**!
- Ambos vêm de `TBModeloEquipamentos.Portaria`
- Se um está correto e outro errado, o problema é **NO BACKEND/CÓDIGO**!

---

### 1️⃣2️⃣ **{MarcaModeloEquipamento}**

**O que mostra:** Marca/Modelo do equipamento (ex: "VELSIS VSIS-OCR")

**Origem no banco:**
```sql
TBModeloEquipamentos.Marca + ' ' + TBModeloEquipamentos.Modelo
```

**Como chega na tarja:**
```
TBInfracoes.Equipamento_id 
    → TBEquipamentos.ModeloEquipamento_id
    → TBModeloEquipamentos.Marca + Modelo
```

**Como alterar:**
- Menu → Cadastros Básicos → Modelos de Equipamentos → Editar modelo
- Campos: "Marca" e "Modelo"
- Impacto: **GLOBAL** - Altera para TODOS os equipamentos deste modelo

**Query de validação:**
```sql
SELECT 
    m.Marca,
    m.Modelo,
    CONCAT(m.Marca, ' ', m.Modelo) as MarcaModelo,
    e.Codigo
FROM TBModeloEquipamentos m
INNER JOIN TBEquipamentos e ON m.Id = e.ModeloEquipamento_id
WHERE e.Codigo = 'T5402'
```

---

### 1️⃣3️⃣ **{CodigoOrgaoAutuador}**

**O que mostra:** Código do órgão autuador (ex: "STRANS")

**Origem no banco:**
```sql
TBConfiguracoes.ValorConfiguracao
WHERE TipoConfiguracao = 'CodigoOrgaoAutuador'
```

**OU pode ser:**
```sql
TBOperacoes.OrgaoAutuador_id 
    → TBOrgaosAutuadores.Codigo
```

**Como alterar:**
- **Opção A:** Menu → Configurações → Configurações Gerais → Buscar "Órgão Autuador"
- **Opção B:** Menu → Cadastros Básicos → Órgãos Autuadores → Editar
- Impacto: **GLOBAL** ou **POR OPERAÇÃO** (depende da implementação)

---

### 1️⃣4️⃣ **{CodigoEnquadramento}**

**O que mostra:** Código da infração (ex: "75870", "74550")

**Origem no banco:**
```sql
TBEnquadramentos.Codigo
```

**Como chega na tarja:**
```
TBInfracoes.Enquadramento_id 
    → TBEnquadramentos.Codigo
```

**Como alterar:**
- ⚠️ **NÃO DEVE SER ALTERADO** - Código oficial do CTB
- Definido no cadastro de enquadramentos (tabela base)
- Impacto: **POR ENQUADRAMENTO** - Altera código de todas infrações deste tipo

**Query de validação:**
```sql
SELECT 
    Codigo,
    Descricao,
    Pontuacao,
    ValorMulta
FROM TBEnquadramentos
WHERE Codigo = '75870'
```

---

### 1️⃣5️⃣ **{DescricaoEnquadramento}**

**O que mostra:** Descrição da infração

**Origem no banco:**
```sql
TBEnquadramentos.Descricao
```

**Como chega na tarja:**
```
TBInfracoes.Enquadramento_id 
    → TBEnquadramentos.Descricao
```

**Como alterar:**
- Menu → Cadastros Básicos → Enquadramentos → Editar
- Campo: "Descrição"
- Impacto: **POR ENQUADRAMENTO** - Altera descrição de todas infrações deste tipo

---

### 1️⃣6️⃣ **{SerialEquipamento}**

**O que mostra:** Serial/Número de série do equipamento

**Origem no banco:**
```sql
TBEquipamentos.NumeroSerie
```

**Como chega na tarja:**
```
TBInfracoes.Equipamento_id 
    → TBEquipamentos.NumeroSerie
```

**Como alterar:**
- Menu → Equipamentos → Equipamentos → Editar equipamento
- Campo: "Número de Série"
- Impacto: **POR EQUIPAMENTO** - Altera serial deste equipamento específico

---

## 🚨 ANÁLISE CRÍTICA DO ERRO "492 de 17/07/2012"

### ⚠️ DESCOBERTA IMPORTANTE

A tarja tem **DOIS campos de portaria diferentes:**

1. **{PortariaEquipamento}** → Campo "Portaria:"
2. **{PortariaNaoMetrologico}** → Campo "Portaria não metrológico:"

**Ambos deveriam buscar do mesmo lugar:**
```sql
TBModeloEquipamentos.Portaria
```

**MAS se um está correto e outro errado, existem 3 possibilidades:**

---

### 🔍 **POSSIBILIDADE 1: Backend tem lógica diferente**

O código C# pode ter implementação diferente para cada variável:

```csharp
// Possível implementação no backend
public class TarjaProcessor
{
    public string PortariaEquipamento { get; set; } // Busca de TBModeloEquipamentos.Portaria
    public string PortariaNaoMetrologico { get; set; } // Pode buscar de TBAfericoes OU ter valor hardcoded
}
```

**Como verificar:**
- Analisar código-fonte do backend (Controllers/Services)
- Buscar por "PortariaNaoMetrologico" no código
- Verificar se há regra de negócio diferenciada

---

### 🔍 **POSSIBILIDADE 2: Banco tem dados inconsistentes**

Pode haver **DOIS registros** do modelo VSIS-OCR:
- Um com portaria correta (usado por `{PortariaEquipamento}`)
- Outro com portaria errada (usado por `{PortariaNaoMetrologico}`)

**Como verificar:**
```sql
-- Buscar TODOS os modelos VSIS-OCR (pode haver duplicatas)
SELECT 
    Id,
    Marca,
    Modelo,
    NumeroPortaria,
    Portaria,
    DataAtualizacao,
    AtualizadoPor
FROM TBModeloEquipamentos
WHERE Modelo LIKE '%VSIS-OCR%' OR Marca LIKE '%VELSIS%'
ORDER BY DataAtualizacao DESC
```

---

### 🔍 **POSSIBILIDADE 3: Valor hardcoded em configuração**

O valor "492 de 17/07/2012" pode estar em:

**A) TBConfiguracoes:**
```sql
SELECT 
    TipoConfiguracao,
    ValorConfiguracao,
    DataAtualizacao
FROM TBConfiguracoes
WHERE 
    ValorConfiguracao LIKE '%492%'
    OR ValorConfiguracao LIKE '%2012%'
    OR ValorConfiguracao LIKE '%17/07%'
    OR TipoConfiguracao LIKE '%portaria%'
```

**B) TBAfericoes (campo customizado que não vimos):**
```sql
-- Verificar se TBAfericoes tem algum campo de portaria não documentado
SELECT TOP 1 * FROM TBAfericoes
```

**C) Arquivo de configuração (appsettings.json, web.config):**
```json
{
  "Tarja": {
    "PortariaPadrao": "492 de 17/07/2012"
  }
}
```

---

## ✅ SCRIPT DE DIAGNÓSTICO COMPLETO

Execute este script no banco STRANS para identificar a origem do erro:

```sql
-- ==================================================
-- DIAGNÓSTICO COMPLETO: PORTARIA "492 de 17/07/2012"
-- ==================================================

PRINT '============================================'
PRINT '1. VERIFICAR TODOS OS MODELOS VSIS-OCR'
PRINT '============================================'
SELECT 
    Id,
    Marca,
    Modelo,
    NumeroPortaria,
    Portaria,
    DataAtualizacao,
    AtualizadoPor,
    CASE 
        WHEN Portaria LIKE '%2012%' OR Portaria LIKE '%17/07%' THEN '❌ ERRO ENCONTRADO!'
        WHEN Portaria LIKE '%2021%' THEN '✅ CORRETO'
        ELSE '⚠️ VERIFICAR'
    END as Status
FROM TBModeloEquipamentos
WHERE Modelo LIKE '%VSIS%' OR Modelo LIKE '%OCR%'
ORDER BY DataAtualizacao DESC

PRINT ''
PRINT '============================================'
PRINT '2. VERIFICAR CONFIGURAÇÕES GLOBAIS'
PRINT '============================================'
SELECT 
    Id,
    TipoConfiguracao,
    ValorConfiguracao,
    DataAtualizacao,
    AtualizadoPor
FROM TBConfiguracoes
WHERE 
    ValorConfiguracao LIKE '%492%'
    OR ValorConfiguracao LIKE '%2012%'
    OR ValorConfiguracao LIKE '%17/07%'
    OR ValorConfiguracao LIKE '%portaria%'
    OR TipoConfiguracao LIKE '%portaria%'

PRINT ''
PRINT '============================================'
PRINT '3. VERIFICAR MODELO USADO PELO EQUIPAMENTO T5402'
PRINT '============================================'
SELECT 
    e.Codigo as Equipamento,
    m.Marca,
    m.Modelo,
    m.NumeroPortaria,
    m.Portaria,
    m.Id as ModeloId,
    e.Id as EquipamentoId,
    CASE 
        WHEN m.Portaria LIKE '%2012%' THEN '❌ ESTE É O MODELO COM ERRO!'
        WHEN m.Portaria LIKE '%2021%' THEN '✅ Modelo correto'
        ELSE '⚠️ Verificar'
    END as Status
FROM TBEquipamentos e
INNER JOIN TBModeloEquipamentos m ON e.ModeloEquipamento_id = m.Id
WHERE e.Codigo = 'T5402'

PRINT ''
PRINT '============================================'
PRINT '4. VERIFICAR AFERICOES DA OPERACAO'
PRINT '============================================'
SELECT 
    a.Id,
    a.NumeroInmetro,
    a.NumeroLaudo,
    a.DataAfericao,
    a.DataVencimento,
    f.NumeroFaixa,
    o.Id as OperacaoId
FROM TBAfericoes a
INNER JOIN TBFaixasAfericoes fa ON a.Id = fa.Afericao_id
INNER JOIN TBFaixas f ON fa.Faixa_id = f.Id
INNER JOIN TBOperacoes o ON f.Operacao_id = o.Id
WHERE o.Id = '359a6427-d58d-490e-ab3b-362504f5c7ef'

PRINT ''
PRINT '============================================'
PRINT '5. BUSCAR TEXTO "2012" EM TODAS AS TABELAS'
PRINT '============================================'

-- TBModeloEquipamentos
SELECT 
    'TBModeloEquipamentos' as Tabela,
    Id,
    Modelo,
    Portaria
FROM TBModeloEquipamentos
WHERE Portaria LIKE '%2012%' OR Portaria LIKE '%17/07%'

UNION ALL

-- TBConfiguracoes
SELECT 
    'TBConfiguracoes' as Tabela,
    Id,
    TipoConfiguracao,
    ValorConfiguracao
FROM TBConfiguracoes
WHERE ValorConfiguracao LIKE '%2012%' OR ValorConfiguracao LIKE '%17/07%'

PRINT ''
PRINT '============================================'
PRINT '6. VERIFICAR ESTRUTURA COMPLETA TBAFERICOES'
PRINT '============================================'
-- Ver TODOS os campos de TBAfericoes (pode ter campo não documentado)
SELECT TOP 1 * FROM TBAfericoes

PRINT ''
PRINT '============================================'
PRINT 'DIAGNÓSTICO CONCLUÍDO'
PRINT '============================================'
```

---

## 📊 TABELA RESUMO: ONDE ALTERAR CADA INFORMAÇÃO

| Variável | Origem | Tabela/Campo | Menu no Sistema | Impacto |
|----------|--------|--------------|-----------------|---------|
| `{CodigoEquipamento}` | Equipamento | `TBEquipamentos.Codigo` | Equipamentos → Editar | Por equipamento |
| `{CodigoLocalOperacaoEquipamento}` | Operação | `TBOperacoes.Endereco` | Operações → Editar | Por operação |
| `{NumeroFaixa}` | Faixa | `TBFaixas.NumeroFaixa` | Operações → Faixas | Por faixa |
| `{SentidoFaixa}` | Faixa | `TBFaixas.Sentido` | Operações → Faixas | Por faixa |
| `{DataPassagemInfracao}` | Infração | `TBInfracoes.DataHoraInfracao` | ⚠️ NÃO ALTERAR | Por infração |
| `{DataAfericaoInmetro}` | Aferição | `TBAfericoes.DataAfericao` | Medição → Aferições | Por aferição |
| `{DataVencimentoAfericao}` | Aferição | `TBAfericoes.DataVencimento` | Medição → Aferições | Por aferição |
| `{CertificadoEquipamento}` | Equipamento/Aferição | `TBEquipamentos.NumeroSerie` ou `TBAfericoes.NumeroInmetro` | Equipamentos OU Aferições | Depende |
| **`{PortariaEquipamento}`** | **Modelo** | **`TBModeloEquipamentos.Portaria`** | **Modelos de Equipamentos** | **GLOBAL** |
| `{NumeroCertificadoInmetro}` | Aferição | `TBAfericoes.NumeroInmetro` | Medição → Aferições | Por aferição |
| **`{PortariaNaoMetrologico}`** ⚠️ | **Modelo?** | **`TBModeloEquipamentos.Portaria`?** | **??? VERIFICAR BACKEND** | **??? ERRO AQUI** |
| `{MarcaModeloEquipamento}` | Modelo | `TBModeloEquipamentos.Marca + Modelo` | Modelos de Equipamentos | GLOBAL |
| `{CodigoOrgaoAutuador}` | Configuração | `TBConfiguracoes` OU `TBOrgaosAutuadores` | Configurações | GLOBAL |
| `{CodigoEnquadramento}` | Enquadramento | `TBEnquadramentos.Codigo` | ⚠️ Dados base CTB | Por enquadramento |
| `{DescricaoEnquadramento}` | Enquadramento | `TBEnquadramentos.Descricao` | Enquadramentos | Por enquadramento |
| `{SerialEquipamento}` | Equipamento | `TBEquipamentos.NumeroSerie` | Equipamentos → Editar | Por equipamento |

---

## 🎯 PRÓXIMOS PASSOS OBRIGATÓRIOS

### ✅ 1. **Executar Script de Diagnóstico**
```bash
# No banco STRANS, executar o script completo acima
```

### ✅ 2. **Verificar se há Modelo Duplicado**
```sql
SELECT COUNT(*) as TotalModelos
FROM TBModeloEquipamentos
WHERE Modelo LIKE '%VSIS%'
```

### ✅ 3. **Analisar Código Backend**

Buscar no código-fonte por:
- `PortariaNaoMetrologico`
- `PortariaEquipamento`
- Verificar se há lógica diferente para cada variável

### ✅ 4. **Verificar Arquivo de Configuração**

Procurar em:
- `appsettings.json`
- `web.config`
- `app.config`

---

## ⚠️ HIPÓTESE PRINCIPAL

**A variável `{PortariaNaoMetrologico}` NÃO está buscando de `TBModeloEquipamentos.Portaria`!**

Possíveis origens alternativas:
1. ✅ `TBConfiguracoes` (configuração global)
2. ✅ Valor hardcoded no código C#
3. ✅ Campo customizado em `TBAfericoes` não documentado
4. ✅ Arquivo de configuração (appsettings.json)
5. ✅ Modelo duplicado no banco com ID diferente

**AÇÃO IMEDIATA:** Executar o script de diagnóstico para identificar onde está o valor "492 de 17/07/2012"!
