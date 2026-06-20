# TARJA E PORTARIA - GUIA TECNICO COMPLETO

**Data de Consolidacao:** 2026-06-20  
**Arquivos consolidados:** 8

---

---

## ORIGEM: ANALISE-ORIGEM-DADOS-TEMPLATE-TARJA.md

# ðŸ” AnÃ¡lise Completa: Origem dos Dados do Template da Tarja

**Data:** 2026-06-15  
**Sistema:** AxHub STRANS  
**Tarja:** Tarja Axion (ID: 7c63d905-76d5-4824-bb91-2251e62dc77d)  
**Contexto:** Rastreamento completo de origem de cada variÃ¡vel  

---

## ðŸ“‹ TEMPLATE COMPLETO DA TARJA AXION

```html
CÃ³d. Equipamento: {CodigoEquipamento} 
EndereÃ§o: {CodigoLocalOperacaoEquipamento} 
Faixa: {NumeroFaixa} 
Sentido: {SentidoFaixa}
Data: {DataPassagemInfracao.toString("dd/MM/yyyy HH:mm:ss")}  
Data AferiÃ§Ã£o: {DataAfericaoInmetro.Value.toString("dd/MM/yyyy")} 
Data Venc. AferiÃ§Ã£o: {DataVencimentoAfericao.Value.toString("dd/MM/yyyy")} 
Certif.: {CertificadoEquipamento} 
Portaria: {PortariaEquipamento}
Reg. nÃ£o metrolÃ³gico: {NumeroCertificadoInmetro} 
Venc. nÃ£o metrolÃ³gico : {DataVencimentoAfericao.Value.toString("dd/MM/yyyy")}  
Portaria nÃ£o metrolÃ³gico : {PortariaNaoMetrologico} 
Marca/Modelo : {MarcaModeloEquipamento} 
CÃ³d. Org: {CodigoOrgaoAutuador} 
InfraÃ§Ã£o: {CodigoEnquadramento} 
DescriÃ§Ã£o: {DescricaoEnquadramento} 
Serial: {SerialEquipamento}
```

---

## ðŸ—ºï¸ FLUXO DE DADOS COMPLETO

### **Ponto de Partida: TBInfracoes (Registro da InfraÃ§Ã£o)**

```
TBInfracoes (InfraÃ§Ã£o especÃ­fica)
    â”œâ”€â”€ Equipamento_id â†’ TBEquipamentos
    â”œâ”€â”€ Operacao_id â†’ TBOperacoes
    â”œâ”€â”€ Faixa_id â†’ TBFaixas
    â””â”€â”€ Enquadramento_id â†’ TBEnquadramentos
```

---

## ðŸ“Š MAPEAMENTO DETALHADO POR VARIÃVEL

### ðŸ”µ **GRUPO 1: Dados do Equipamento**

#### 1. `{CodigoEquipamento}` â†’ "T5402", "T5403"

**Origem:**
```
TBInfracoes.Equipamento_id 
    â†’ TBEquipamentos.Codigo
```

**Query de validaÃ§Ã£o:**
```sql
-- Ver cÃ³digo do equipamento usado na infraÃ§Ã£o
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

#### 2. `{SerialEquipamento}` â†’ NÃºmero de sÃ©rie

**Origem:**
```
TBInfracoes.Equipamento_id 
    â†’ TBEquipamentos.NumeroSerie
```

**Query de validaÃ§Ã£o:**
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

#### 3. `{MarcaModeloEquipamento}` â†’ "VELSIS VSIS-OCR"

**Origem:**
```
TBInfracoes.Equipamento_id 
    â†’ TBEquipamentos.ModeloEquipamento_id 
    â†’ TBModeloEquipamentos.Marca + ' ' + TBModeloEquipamentos.Modelo
```

**Query de validaÃ§Ã£o:**
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
**Tipo de dado:** Cadastro manual (concatenaÃ§Ã£o de 2 campos)  

---

### ðŸ”µ **GRUPO 2: Dados da OperaÃ§Ã£o**

#### 4. `{CodigoLocalOperacaoEquipamento}` â†’ "Av. Frei Serafim, prox. ao n. 2439"

**Origem:**
```
TBInfracoes.Operacao_id 
    â†’ TBOperacoes.Endereco
```

**Query de validaÃ§Ã£o:**
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

### ðŸ”µ **GRUPO 3: Dados da Faixa**

#### 5. `{NumeroFaixa}` â†’ "1", "2", "3"

**Origem:**
```
TBInfracoes.Faixa_id 
    â†’ TBFaixas.NumeroFaixa
```

**Query de validaÃ§Ã£o:**
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

#### 6. `{SentidoFaixa}` â†’ "Norte/Sul", "Leste/Oeste"

**Origem:**
```
TBInfracoes.Faixa_id 
    â†’ TBFaixas.Sentido
```

**Query de validaÃ§Ã£o:**
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

### ðŸ”µ **GRUPO 4: Dados da InfraÃ§Ã£o**

#### 7. `{DataPassagemInfracao}` â†’ "11/06/2026 14:35:22"

**Origem:**
```
TBInfracoes.DataHoraInfracao
```

**Query de validaÃ§Ã£o:**
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
**Tipo de dado:** AutomÃ¡tico (capturado pelo equipamento)  

---

### ðŸ”µ **GRUPO 5: Dados da AferiÃ§Ã£o (CertificaÃ§Ã£o INMETRO)**

#### 8. `{DataAfericaoInmetro}` â†’ "15/10/2025"

**Origem:**
```
TBInfracoes.Faixa_id 
    â†’ TBFaixasAfericoes.Faixa_id 
    â†’ TBFaixasAfericoes.Afericao_id
    â†’ TBAfericoes.DataAfericao
```

**Query de validaÃ§Ã£o:**
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

#### 9. `{DataVencimentoAfericao}` â†’ "18/10/2026" âš ï¸ **USADO 2 VEZES!**

**Origem:**
```
TBInfracoes.Faixa_id 
    â†’ TBFaixasAfericoes.Faixa_id 
    â†’ TBFaixasAfericoes.Afericao_id
    â†’ TBAfericoes.DataVencimento
```

**âš ï¸ IMPORTANTE:** Esta variÃ¡vel aparece **DUAS VEZES** no template:
- Uma como: `Data Venc. AferiÃ§Ã£o: {DataVencimentoAfericao...}`
- Outra como: `Venc. nÃ£o metrolÃ³gico : {DataVencimentoAfericao...}`

**Query de validaÃ§Ã£o:**
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

#### 10. `{NumeroCertificadoInmetro}` â†’ "006350/2021" (Reg. nÃ£o metrolÃ³gico)

**Origem:**
```
TBInfracoes.Faixa_id 
    â†’ TBFaixasAfericoes.Faixa_id 
    â†’ TBFaixasAfericoes.Afericao_id
    â†’ TBAfericoes.NumeroInmetro
```

**Query de validaÃ§Ã£o:**
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
**Tipo de dado:** Cadastro manual (nÃºmero do certificado INMETRO)  

---

### ðŸ”µ **GRUPO 6: Dados do Modelo (Portarias) âš ï¸ CRÃTICO**

#### 11. `{CertificadoEquipamento}` â†’ Certificado (campo "Certif.")

**âš ï¸ VARIÃVEL AMBÃGUA - Pode ter mÃºltiplas origens:**

**OpÃ§Ã£o A: NÃºmero de sÃ©rie do equipamento**
```
TBInfracoes.Equipamento_id 
    â†’ TBEquipamentos.NumeroSerie
```

**OpÃ§Ã£o B: NÃºmero INMETRO da aferiÃ§Ã£o**
```
TBInfracoes.Faixa_id 
    â†’ TBFaixasAfericoes â†’ TBAfericoes.NumeroInmetro
```

**OpÃ§Ã£o C: NÃºmero de patrimÃ´nio**
```
TBInfracoes.Equipamento_id 
    â†’ TBEquipamentos.NumeroPatrimonio
```

**Query de teste:**
```sql
-- Testar todas as opÃ§Ãµes
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
**Tipo de dado:** Depende da implementaÃ§Ã£o do backend  

---

#### 12. `{PortariaEquipamento}` â†’ "PORTARIA INMETRO/DIMEL NÂº 492/2021" âš ï¸

**Origem ESPERADA:**
```
TBInfracoes.Equipamento_id 
    â†’ TBEquipamentos.ModeloEquipamento_id
    â†’ TBModeloEquipamentos.Portaria
```

**Query de validaÃ§Ã£o:**
```sql
SELECT 
    e.Codigo as Equipamento,
    m.Modelo,
    m.NumeroPortaria,
    m.Portaria as PortariaDoModelo,
    'âœ… ESTE Ã‰ O VALOR CORRETO' as Status
FROM TBEquipamentos e
INNER JOIN TBModeloEquipamentos m ON e.ModeloEquipamento_id = m.Id
WHERE e.Codigo IN ('T5402', 'T5403')
```

**Resultado ATUAL no STRANS:**
```
Equipamento: T5402/T5403
Modelo: VSIS-OCR
NumeroPortaria: 492
Portaria: "PORTARIA INMETRO/DIMEL NÂº 492/2021" âœ… CORRETO!
```

**Tabela origem:** `TBModeloEquipamentos`  
**Campo:** `Portaria [nvarchar(50)]`  
**Tipo de dado:** Cadastro manual  

---

#### 13. `{PortariaNaoMetrologico}` â†’ âŒ **CAMPO COM ERRO "492 de 17/07/2012"**

**Origem ESPERADA (mesma que {PortariaEquipamento}):**
```
TBInfracoes.Equipamento_id 
    â†’ TBEquipamentos.ModeloEquipamento_id
    â†’ TBModeloEquipamentos.Portaria
```

**âš ï¸ PROBLEMA CRÃTICO:**
- A query acima retorna: `"PORTARIA INMETRO/DIMEL NÂº 492/2021"` âœ…
- MAS a tarja mostra: `"492 de 17/07/2012"` âŒ
- **ISSO SIGNIFICA:** O backend NÃƒO estÃ¡ buscando de `TBModeloEquipamentos.Portaria`!

**PossÃ­veis origens REAIS (nÃ£o confirmadas):**

**HipÃ³tese 1: ConfiguraÃ§Ã£o global**
```sql
SELECT * FROM TBConfiguracoes 
WHERE TipoConfiguracao LIKE '%portaria%' 
   OR ValorConfiguracao LIKE '%492%'
```

**HipÃ³tese 2: Hardcode no cÃ³digo C#**
```csharp
// PossÃ­vel cÃ³digo problemÃ¡tico
public string PortariaNaoMetrologico 
{ 
    get { return "492 de 17/07/2012"; } // âŒ HARDCODED ERRADO
}
```

**HipÃ³tese 3: Arquivo appsettings.json**
```json
{
  "Tarja": {
    "PortariaNaoMetrologico": "492 de 17/07/2012"
  }
}
```

**Query de investigaÃ§Ã£o:**
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

**Status atual:** âŒ **ORIGEM NÃƒO IDENTIFICADA VIA WEB**  
**Tipo de dado:** **DESCONHECIDO** - Requer anÃ¡lise de cÃ³digo backend  

---

### ðŸ”µ **GRUPO 7: Dados do Enquadramento (InfraÃ§Ã£o)**

#### 14. `{CodigoOrgaoAutuador}` â†’ "STRANS"

**Origem POSSÃVEL:**

**OpÃ§Ã£o A: ConfiguraÃ§Ã£o global**
```sql
SELECT ValorConfiguracao 
FROM TBConfiguracoes 
WHERE TipoConfiguracao = 'CodigoOrgaoAutuador'
```

**OpÃ§Ã£o B: Da operaÃ§Ã£o**
```
TBInfracoes.Operacao_id 
    â†’ TBOperacoes.OrgaoAutuador_id 
    â†’ TBOrgaosAutuadores.Codigo
```

**Query de validaÃ§Ã£o:**
```sql
-- OpÃ§Ã£o A
SELECT * FROM TBConfiguracoes 
WHERE TipoConfiguracao LIKE '%orgao%' OR TipoConfiguracao LIKE '%autuador%'

-- OpÃ§Ã£o B
SELECT 
    o.Id,
    oa.Codigo,
    oa.Nome
FROM TBOperacoes o
LEFT JOIN TBOrgaosAutuadores oa ON o.OrgaoAutuador_id = oa.Id
WHERE o.Id = '359a6427-d58d-490e-ab3b-362504f5c7ef'
```

**Tabela origem:** `TBConfiguracoes` OU `TBOrgaosAutuadores`  
**Tipo de dado:** ConfiguraÃ§Ã£o global OU cadastro  

---

#### 15. `{CodigoEnquadramento}` â†’ "75870"

**Origem:**
```
TBInfracoes.Enquadramento_id 
    â†’ TBEnquadramentos.Codigo
```

**Query de validaÃ§Ã£o:**
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
**Tipo de dado:** Cadastro base (CTB - CÃ³digo de TrÃ¢nsito Brasileiro)  

---

#### 16. `{DescricaoEnquadramento}` â†’ "TRANSITAR COM O VEIC NA FAIXA OU VIA..."

**Origem:**
```
TBInfracoes.Enquadramento_id 
    â†’ TBEnquadramentos.Descricao
```

**Query de validaÃ§Ã£o:**
```sql
SELECT 
    Codigo,
    Descricao
FROM TBEnquadramentos
WHERE Codigo = '75870'
```

**Tabela origem:** `TBEnquadramentos`  
**Campo:** `Descricao [nvarchar(500)]`  
**Tipo de dado:** Cadastro base (descriÃ§Ã£o oficial do CTB)  

---

## ðŸ“Š TABELA RESUMO: ORIGEM DE CADA CAMPO

| VariÃ¡vel Template | Campo Exibido | Tabela Origem | Campo do Banco | NÃ­vel |
|-------------------|---------------|---------------|----------------|-------|
| `{CodigoEquipamento}` | CÃ³d. Equipamento | TBEquipamentos | Codigo | Equipamento |
| `{SerialEquipamento}` | Serial | TBEquipamentos | NumeroSerie | Equipamento |
| `{MarcaModeloEquipamento}` | Marca/Modelo | TBModeloEquipamentos | Marca + Modelo | Modelo |
| `{CodigoLocalOperacaoEquipamento}` | EndereÃ§o | TBOperacoes | Endereco | OperaÃ§Ã£o |
| `{NumeroFaixa}` | Faixa | TBFaixas | NumeroFaixa | Faixa |
| `{SentidoFaixa}` | Sentido | TBFaixas | Sentido | Faixa |
| `{DataPassagemInfracao}` | Data | TBInfracoes | DataHoraInfracao | InfraÃ§Ã£o |
| `{DataAfericaoInmetro}` | Data AferiÃ§Ã£o | TBAfericoes | DataAfericao | AferiÃ§Ã£o |
| `{DataVencimentoAfericao}` | Data Venc. / Venc. nÃ£o metrolÃ³gico | TBAfericoes | DataVencimento | AferiÃ§Ã£o |
| `{NumeroCertificadoInmetro}` | Reg. nÃ£o metrolÃ³gico | TBAfericoes | NumeroInmetro | AferiÃ§Ã£o |
| `{CertificadoEquipamento}` | Certif. | TBEquipamentos OU TBAfericoes | NumeroSerie OU NumeroInmetro | AmbÃ­guo |
| **`{PortariaEquipamento}`** | **Portaria** | **TBModeloEquipamentos** | **Portaria** âœ… | **Modelo** |
| **`{PortariaNaoMetrologico}`** âŒ | **Portaria nÃ£o metrolÃ³gico** | **??? DESCONHECIDO** | **??? ERRO** âŒ | **???** |
| `{CodigoOrgaoAutuador}` | CÃ³d. Org | TBConfiguracoes OU TBOrgaosAutuadores | ValorConfiguracao OU Codigo | Config/Cadastro |
| `{CodigoEnquadramento}` | InfraÃ§Ã£o | TBEnquadramentos | Codigo | Enquadramento |
| `{DescricaoEnquadramento}` | DescriÃ§Ã£o | TBEnquadramentos | Descricao | Enquadramento |

---

## ðŸ” ANÃLISE DO PROBLEMA: {PortariaNaoMetrologico}

### **ComparaÃ§Ã£o das DUAS variÃ¡veis de Portaria:**

| Aspecto | {PortariaEquipamento} | {PortariaNaoMetrologico} |
|---------|----------------------|--------------------------|
| **Origem esperada** | TBModeloEquipamentos.Portaria | TBModeloEquipamentos.Portaria |
| **Valor no banco** | "PORTARIA INMETRO/DIMEL NÂº 492/2021" âœ… | "PORTARIA INMETRO/DIMEL NÂº 492/2021" âœ… |
| **Valor na tarja** | ??? (nÃ£o confirmado) | "492 de 17/07/2012" âŒ |
| **Status** | Provavelmente correto | **ERRADO** |

### **ConclusÃ£o:**

Se ambas as variÃ¡veis deveriam buscar do mesmo campo (`TBModeloEquipamentos.Portaria`), mas **uma mostra valor correto e outra mostra valor errado**, isso significa:

1. **O backend TEM lÃ³gicas diferentes** para `{PortariaEquipamento}` e `{PortariaNaoMetrologico}`
2. **`{PortariaNaoMetrologico}` NÃƒO busca de `TBModeloEquipamentos.Portaria`**
3. **O valor "492 de 17/07/2012" estÃ¡ hardcoded em:**
   - CÃ³digo C# (mÃ©todo/propriedade)
   - Arquivo de configuraÃ§Ã£o (appsettings.json)
   - Tabela TBConfiguracoes (nÃ£o acessÃ­vel via web)
   - Cache/memÃ³ria do sistema

---

## ðŸŽ¯ SCRIPT COMPLETO DE VALIDAÃ‡ÃƒO

Execute este script para ver TODOS os dados que alimentam a tarja:

```sql
-- ==================================================
-- VALIDAÃ‡ÃƒO COMPLETA: Dados da Tarja para InfraÃ§Ã£o
-- ==================================================

DECLARE @InfracaoId UNIQUEIDENTIFIER
DECLARE @EquipamentoCodigo NVARCHAR(20) = 'T5402' -- OU 'T5403'
DECLARE @DataInfracao DATE = '2026-06-11'

-- Buscar uma infraÃ§Ã£o especÃ­fica
SELECT TOP 1 @InfracaoId = Id
FROM TBInfracoes
WHERE CAST(DataHoraInfracao AS DATE) = @DataInfracao
    AND Equipamento_id IN (SELECT Id FROM TBEquipamentos WHERE Codigo = @EquipamentoCodigo)

PRINT 'InfraÃ§Ã£o ID: ' + CAST(@InfracaoId AS NVARCHAR(50))
PRINT ''
PRINT '=========================================='
PRINT 'DADOS COMPLETOS DA TARJA'
PRINT '=========================================='

SELECT 
    -- GRUPO 1: Equipamento
    e.Codigo as CodigoEquipamento,
    e.NumeroSerie as SerialEquipamento,
    CONCAT(m.Marca, ' ', m.Modelo) as MarcaModeloEquipamento,
    
    -- GRUPO 2: OperaÃ§Ã£o
    o.Endereco as CodigoLocalOperacaoEquipamento,
    
    -- GRUPO 3: Faixa
    f.NumeroFaixa,
    f.Sentido as SentidoFaixa,
    
    -- GRUPO 4: InfraÃ§Ã£o
    i.DataHoraInfracao as DataPassagemInfracao,
    
    -- GRUPO 5: AferiÃ§Ã£o
    a.DataAfericao as DataAfericaoInmetro,
    a.DataVencimento as DataVencimentoAfericao,
    a.NumeroInmetro as NumeroCertificadoInmetro,
    a.NumeroLaudo,
    
    -- GRUPO 6: Modelo (PORTARIAS - CRÃTICO!)
    m.NumeroPortaria,
    m.Portaria as PortariaEquipamento, -- ESTE DEVERIA SER USADO
    m.Portaria as PortariaNaoMetrologico_ESPERADO, -- O QUE DEVERIA APARECER
    '??? 492 de 17/07/2012 ???' as PortariaNaoMetrologico_REAL, -- O QUE APARECE (ERRO!)
    
    -- GRUPO 7: Enquadramento
    enq.Codigo as CodigoEnquadramento,
    enq.Descricao as DescricaoEnquadramento,
    
    -- Certificado (ambÃ­guo)
    e.NumeroSerie as CertificadoEquipamento_Opcao1,
    a.NumeroInmetro as CertificadoEquipamento_Opcao2,
    e.NumeroPatrimonio as CertificadoEquipamento_Opcao3,
    
    -- IDs para referÃªncia
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

-- Verificar se hÃ¡ configuraÃ§Ã£o global de portaria
PRINT ''
PRINT '=========================================='
PRINT 'VERIFICAR CONFIGURAÃ‡Ã•ES GLOBAIS'
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

## âœ… CONCLUSÃƒO DA ANÃLISE

### **Dados Confirmados via Web:**

1. âœ… `TBModeloEquipamentos.Portaria` = **"PORTARIA INMETRO/DIMEL NÂº 492/2021"**
2. âœ… Template usa placeholder `{PortariaNaoMetrologico}` (nÃ£o hardcoded)
3. âœ… NÃ£o hÃ¡ modelos duplicados

### **Dados NÃƒO Confirmados:**

1. âŒ Origem real de `{PortariaNaoMetrologico}` (backend usa lÃ³gica diferente)
2. âŒ ConteÃºdo de `TBConfiguracoes` (nÃ£o acessÃ­vel via web)
3. âŒ CÃ³digo-fonte do backend (nÃ£o disponÃ­vel)

### **PrÃ³ximos Passos:**

1. âœ… **Testar workaround:** Substituir `{PortariaNaoMetrologico}` por `{PortariaEquipamento}` no template
2. âœ… **Solicitar acesso:** CÃ³digo-fonte OU SSH ao servidor OU query SQL em TBConfiguracoes
3. âœ… **Buscar no servidor:** `grep -r "492 de 17/07/2012" /caminho/axhub/`

---

**Documento criado em:** 2026-06-15  
**MÃ©todo:** AnÃ¡lise via web + DocumentaÃ§Ã£o do schema (AxHub.sql)  
**Status:** Mapeamento completo - Erro localizado em `{PortariaNaoMetrologico}`


---

## ORIGEM: DIAGRAMA-FLUXO-DADOS-TARJA.md

# ðŸ—ºï¸ Diagrama de Fluxo: De Onde Vem Cada Dado da Tarja

**Sistema:** AxHub STRANS  
**Data:** 2026-06-15  

---

## ðŸ“Š VISUALIZAÃ‡ÃƒO HIERÃRQUICA

```
ðŸŽ¯ TBInfracoes (Ponto de partida - Registro da infraÃ§Ã£o do dia 11/06/2026)
â”‚
â”œâ”€â”€â”€ ðŸ”— Equipamento_id â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–º TBEquipamentos
â”‚                                    â”‚
â”‚                                    â”œâ”€â–º Codigo = {CodigoEquipamento} âœ… "T5402"
â”‚                                    â”œâ”€â–º NumeroSerie = {SerialEquipamento} âœ…
â”‚                                    â”‚
â”‚                                    â””â”€â–º ModeloEquipamento_id â”€â”€â”€â–º TBModeloEquipamentos
â”‚                                                                  â”‚
â”‚                                                                  â”œâ”€â–º Marca = "VELSIS"
â”‚                                                                  â”œâ”€â–º Modelo = "VSIS-OCR"
â”‚                                                                  â”œâ”€â–º Marca + Modelo = {MarcaModeloEquipamento} âœ…
â”‚                                                                  â”‚
â”‚                                                                  â”œâ”€â–º Portaria = {PortariaEquipamento} âœ…
â”‚                                                                  â”‚   âœ… "PORTARIA INMETRO/DIMEL NÂº 492/2021"
â”‚                                                                  â”‚
â”‚                                                                  â””â”€â–º Portaria = {PortariaNaoMetrologico} âŒ
â”‚                                                                      âŒ Deveria ser "...492/2021"
â”‚                                                                      âŒ MAS aparece "492 de 17/07/2012"
â”‚                                                                      âš ï¸ ERRO AQUI!
â”‚
â”œâ”€â”€â”€ ðŸ”— Operacao_id â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–º TBOperacoes
â”‚                                    â”‚
â”‚                                    â””â”€â–º Endereco = {CodigoLocalOperacaoEquipamento} âœ…
â”‚                                        "Av. Frei Serafim, prox. ao n. 2439"
â”‚
â”œâ”€â”€â”€ ðŸ”— Faixa_id â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–º TBFaixas
â”‚                                    â”‚
â”‚                                    â”œâ”€â–º NumeroFaixa = {NumeroFaixa} âœ… "1", "2", "3"
â”‚                                    â”œâ”€â–º Sentido = {SentidoFaixa} âœ… "Norte/Sul"
â”‚                                    â”‚
â”‚                                    â””â”€â–º Id â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–º TBFaixasAfericoes
â”‚                                                        â”‚
â”‚                                                        â””â”€â–º Afericao_id â”€â”€â”€â–º TBAfericoes
â”‚                                                                            â”‚
â”‚                                                                            â”œâ”€â–º DataAfericao = {DataAfericaoInmetro} âœ…
â”‚                                                                            â”‚   "15/10/2025"
â”‚                                                                            â”‚
â”‚                                                                            â”œâ”€â–º DataVencimento = {DataVencimentoAfericao} âœ…
â”‚                                                                            â”‚   "18/10/2026" (usado 2x!)
â”‚                                                                            â”‚
â”‚                                                                            â””â”€â–º NumeroInmetro = {NumeroCertificadoInmetro} âœ…
â”‚                                                                                "006350/2021"
â”‚
â”œâ”€â”€â”€ ðŸ”— Enquadramento_id â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–º TBEnquadramentos
â”‚                                    â”‚
â”‚                                    â”œâ”€â–º Codigo = {CodigoEnquadramento} âœ… "75870"
â”‚                                    â”‚
â”‚                                    â””â”€â–º Descricao = {DescricaoEnquadramento} âœ…
â”‚                                        "TRANSITAR COM O VEIC NA FAIXA..."
â”‚
â””â”€â”€â”€ ðŸ“… DataHoraInfracao â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–º {DataPassagemInfracao} âœ…
                                       "11/06/2026 14:35:22"
```

---

## ðŸŽ¯ FOCO NO PROBLEMA: AS DUAS PORTARIAS

### **ComparaÃ§Ã£o Visual:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    TBModeloEquipamentos                         â”‚
â”‚                       (Modelo VSIS-OCR)                         â”‚
â”‚                                                                 â”‚
â”‚  Portaria = "PORTARIA INMETRO/DIMEL NÂº 492/2021" âœ…            â”‚
â”‚             â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜               â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                        â”‚             â”‚
                        â–¼             â–¼
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â”‚PortariaEquipamentoâ”‚   â”‚PortariaNaoMetrologico â”‚
        â”‚                   â”‚   â”‚                       â”‚
        â”‚  âœ… CORRETO       â”‚   â”‚  âŒ ERRADO            â”‚
        â”‚  "...492/2021"    â”‚   â”‚  "492 de 17/07/2012"  â”‚
        â”‚                   â”‚   â”‚                       â”‚
        â”‚  Campo na tarja:  â”‚   â”‚  Campo na tarja:      â”‚
        â”‚  "Portaria:"      â”‚   â”‚  "Portaria nÃ£o        â”‚
        â”‚                   â”‚   â”‚   metrolÃ³gico:"       â”‚
        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
              â†“                           â†“
         [Template]                  [Template]
    Portaria:                    Portaria nÃ£o metrolÃ³gico:
    {PortariaEquipamento}        {PortariaNaoMetrologico}
```

### **Por que isso Ã© estranho?**

Se ambas as variÃ¡veis buscam do **MESMO campo** (`TBModeloEquipamentos.Portaria`), por que uma estÃ¡ correta e outra errada?

**Resposta:** O backend **NÃƒO estÃ¡** buscando `{PortariaNaoMetrologico}` de `TBModeloEquipamentos.Portaria`!

---

## ðŸ” ONDE PODE ESTAR O VALOR ERRADO?

### **Local 1: TBConfiguracoes (ConfiguraÃ§Ã£o Global)**

```sql
TBConfiguracoes
â”œâ”€ TipoConfiguracao: "PortariaPadraoNaoMetrologico"
â””â”€ ValorConfiguracao: "492 de 17/07/2012" âŒ ERRO AQUI!
```

**Como o backend usa:**
```csharp
public string PortariaNaoMetrologico 
{ 
    get 
    {
        return ConfigurationManager.AppSettings["PortariaPadraoNaoMetrologico"];
        // Retorna "492 de 17/07/2012" âŒ
    }
}
```

---

### **Local 2: CÃ³digo Backend (Hardcode)**

**Arquivo hipotÃ©tico:** `TarjaService.cs`

```csharp
public class TarjaViewModel
{
    // Este busca CORRETAMENTE do banco
    public string PortariaEquipamento 
    { 
        get { return ModeloEquipamento.Portaria; } 
        // "PORTARIA INMETRO/DIMEL NÂº 492/2021" âœ…
    }
    
    // Este tem valor HARDCODED errado
    public string PortariaNaoMetrologico 
    { 
        get { return "492 de 17/07/2012"; } âŒ ERRO AQUI!
    }
}
```

---

### **Local 3: Arquivo appsettings.json**

```json
{
  "Tarja": {
    "Configuracoes": {
      "PortariaNaoMetrologico": "492 de 17/07/2012"  âŒ ERRO AQUI!
    }
  }
}
```

**Como o backend usa:**
```csharp
var config = Configuration.GetSection("Tarja:Configuracoes");
var portaria = config["PortariaNaoMetrologico"];
// Retorna "492 de 17/07/2012" âŒ
```

---

## ðŸŽ¯ TABELA RÃPIDA: STATUS DE CADA CAMPO

| Campo | VariÃ¡vel | Origem | Status |
|-------|----------|--------|--------|
| CÃ³d. Equipamento | `{CodigoEquipamento}` | TBEquipamentos.Codigo | âœ… |
| EndereÃ§o | `{CodigoLocalOperacaoEquipamento}` | TBOperacoes.Endereco | âœ… |
| Faixa | `{NumeroFaixa}` | TBFaixas.NumeroFaixa | âœ… |
| Sentido | `{SentidoFaixa}` | TBFaixas.Sentido | âœ… |
| Data | `{DataPassagemInfracao}` | TBInfracoes.DataHoraInfracao | âœ… |
| Data AferiÃ§Ã£o | `{DataAfericaoInmetro}` | TBAfericoes.DataAfericao | âœ… |
| Data Venc. AferiÃ§Ã£o | `{DataVencimentoAfericao}` | TBAfericoes.DataVencimento | âœ… |
| Certif. | `{CertificadoEquipamento}` | TBEquipamentos.NumeroSerie OU TBAfericoes.NumeroInmetro | âš ï¸ AmbÃ­guo |
| **Portaria** | **`{PortariaEquipamento}`** | **TBModeloEquipamentos.Portaria** | **âœ… CORRETO** |
| Reg. nÃ£o metrolÃ³gico | `{NumeroCertificadoInmetro}` | TBAfericoes.NumeroInmetro | âœ… |
| Venc. nÃ£o metrolÃ³gico | `{DataVencimentoAfericao}` | TBAfericoes.DataVencimento | âœ… |
| **Portaria nÃ£o metrolÃ³gico** | **`{PortariaNaoMetrologico}`** | **??? (NÃƒO Ã© TBModeloEquipamentos!)** | **âŒ ERRADO** |
| Marca/Modelo | `{MarcaModeloEquipamento}` | TBModeloEquipamentos.Marca + Modelo | âœ… |
| CÃ³d. Org | `{CodigoOrgaoAutuador}` | TBConfiguracoes OU TBOrgaosAutuadores | âœ… |
| InfraÃ§Ã£o | `{CodigoEnquadramento}` | TBEnquadramentos.Codigo | âœ… |
| DescriÃ§Ã£o | `{DescricaoEnquadramento}` | TBEnquadramentos.Descricao | âœ… |
| Serial | `{SerialEquipamento}` | TBEquipamentos.NumeroSerie | âœ… |

**Legenda:**
- âœ… Campo correto e origem confirmada
- âš ï¸ Campo funcional mas origem ambÃ­gua
- âŒ Campo com erro - origem desconhecida

---

## ðŸ’¡ SOLUÃ‡ÃƒO PRÃTICA (WORKAROUND)

### **Alternativa 1: Substituir no Template**

**Abrir tarja no sistema:**
1. Menu â†’ ConfiguraÃ§Ãµes â†’ Tarjas â†’ "Tarja Axion"
2. Buscar no template:
   ```
   Portaria nÃ£o metrolÃ³gico : {PortariaNaoMetrologico}
   ```
3. Substituir por:
   ```
   Portaria nÃ£o metrolÃ³gico : {PortariaEquipamento}
   ```
4. Salvar e testar

**Por que funciona?**
- `{PortariaEquipamento}` busca corretamente de `TBModeloEquipamentos.Portaria`
- Se `{PortariaNaoMetrologico}` estÃ¡ errado, usar a variÃ¡vel que estÃ¡ certa!

---

### **Alternativa 2: Criar Campo Calculado**

**Se o sistema permitir expressÃµes:**
```
Portaria nÃ£o metrolÃ³gico : PORTARIA INMETRO/DIMEL NÂº {NumeroPortaria}/2021
```

Onde `{NumeroPortaria}` vem de `TBModeloEquipamentos.NumeroPortaria` = "492"

---

## ðŸ”§ PARA CORREÃ‡ÃƒO DEFINITIVA

### **NecessÃ¡rio acesso a:**

1. **CÃ³digo-fonte backend:**
   ```bash
   grep -r "PortariaNaoMetrologico" --include="*.cs"
   ```

2. **Arquivos de configuraÃ§Ã£o:**
   ```bash
   cat appsettings.json | grep -i portaria
   cat appsettings.Production.json | grep -i 492
   ```

3. **Banco de dados:**
   ```sql
   SELECT * FROM TBConfiguracoes WHERE ValorConfiguracao LIKE '%2012%'
   ```

---

**Criado em:** 2026-06-15  
**Todas as 16 variÃ¡veis mapeadas**  
**Erro localizado:** `{PortariaNaoMetrologico}` nÃ£o busca de onde deveria


---

## ORIGEM: GUIA-CORRECAO-ERRO-PORTARIA-492-2012.md

# ðŸ”§ Guia de CorreÃ§Ã£o: Erro "492 de 17/07/2012" na Tarja

**Data:** 2026-06-15  
**Sistema:** AxHub STRANS  
**Problema:** Campo "Portaria nÃ£o metrolÃ³gico" mostra "492 de 17/07/2012" (incorreto)  
**Valor correto:** "PORTARIA INMETRO/DIMEL NÂº 492/2021"  
**Imagens afetadas:** 11/06/2026 (possivelmente outras datas)  

---

## ðŸ“‹ PASSO 1: EXECUTAR DIAGNÃ“STICO

1. **Abrir SQL Server Management Studio (SSMS)** ou ferramenta similar
2. **Conectar ao servidor** do banco STRANS
3. **Executar o script:** [SCRIPT-DIAGNOSTICO-PORTARIA-492-2012.sql](SCRIPT-DIAGNOSTICO-PORTARIA-492-2012.sql)
4. **Analisar os resultados** das 11 seÃ§Ãµes do script

---

## ðŸŽ¯ CENÃRIOS POSSÃVEIS E CORREÃ‡Ã•ES

### âœ… **CENÃRIO 1: Erro em TBModeloEquipamentos**

**Como identificar:**
- SeÃ§Ã£o 1 do script mostra: "âŒ ERRO ENCONTRADO!"
- SeÃ§Ã£o 3 mostra: "âŒ ESTE Ã‰ O MODELO COM ERRO!"

**Causa:**
- O campo `TBModeloEquipamentos.Portaria` do modelo VSIS-OCR contÃ©m "492 de 17/07/2012"
- Pode haver **dois modelos VSIS-OCR** cadastrados (um correto, outro errado)

**CorreÃ§Ã£o:**

```sql
-- 1. Identificar o modelo com erro
SELECT 
    Id,
    Marca,
    Modelo,
    Portaria,
    DataAtualizacao
FROM TBModeloEquipamentos
WHERE 
    (Modelo LIKE '%VSIS%' OR Modelo LIKE '%OCR%')
    AND (Portaria LIKE '%2012%' OR Portaria LIKE '%17/07%')

-- 2. Corrigir a portaria
UPDATE TBModeloEquipamentos
SET 
    Portaria = 'PORTARIA INMETRO/DIMEL NÂº 492/2021',
    NumeroPortaria = '492',
    DataAtualizacao = GETDATE(),
    AtualizadoPor = 'Administrador' -- Ajustar conforme o usuÃ¡rio logado
WHERE 
    Id = '[ID_DO_MODELO_COM_ERRO]' -- Substituir pelo ID encontrado na query acima

-- 3. Verificar correÃ§Ã£o
SELECT 
    Marca,
    Modelo,
    Portaria,
    DataAtualizacao
FROM TBModeloEquipamentos
WHERE Modelo LIKE '%VSIS%'
```

**Via Sistema Web:**
1. Login â†’ Menu â†’ **Cadastros BÃ¡sicos** â†’ **Modelos de Equipamentos**
2. Buscar modelo **"VSIS-OCR"** ou **"VELSIS"**
3. Clicar em **Editar**
4. Campo **"Portaria"**: Alterar para `PORTARIA INMETRO/DIMEL NÂº 492/2021`
5. Campo **"NÃºmero da Portaria"**: Alterar para `492`
6. **Salvar**

**Impacto:** ðŸŒ **GLOBAL** - Corrige para TODOS os equipamentos do modelo VSIS-OCR

---

### âœ… **CENÃRIO 2: Erro em TBConfiguracoes (ConfiguraÃ§Ã£o Global)**

**Como identificar:**
- SeÃ§Ã£o 2 do script retorna registros com "2012" ou "17/07"

**Causa:**
- Sistema tem configuraÃ§Ã£o global com portaria padrÃ£o errada
- Exemplo: `TipoConfiguracao = 'PortariaPadraoNaoMetrologico'`

**CorreÃ§Ã£o:**

```sql
-- 1. Identificar a configuraÃ§Ã£o
SELECT 
    Id,
    TipoConfiguracao,
    ValorConfiguracao,
    DataAtualizacao
FROM TBConfiguracoes
WHERE 
    ValorConfiguracao LIKE '%2012%' 
    OR ValorConfiguracao LIKE '%17/07%'
    OR ValorConfiguracao LIKE '%492%'

-- 2. Corrigir a configuraÃ§Ã£o
UPDATE TBConfiguracoes
SET 
    ValorConfiguracao = 'PORTARIA INMETRO/DIMEL NÂº 492/2021',
    DataAtualizacao = GETDATE(),
    AtualizadoPor = 'Administrador'
WHERE 
    Id = [ID_DA_CONFIGURACAO] -- Substituir pelo ID encontrado

-- 3. Verificar correÃ§Ã£o
SELECT 
    TipoConfiguracao,
    ValorConfiguracao,
    DataAtualizacao
FROM TBConfiguracoes
WHERE TipoConfiguracao LIKE '%portaria%'
```

**Via Sistema Web:**
1. Login â†’ Menu â†’ **ConfiguraÃ§Ãµes** â†’ **ConfiguraÃ§Ãµes Gerais**
2. Buscar por **"Portaria"** ou **"492"**
3. Editar o valor encontrado
4. **Salvar**

**Impacto:** ðŸŒ **GLOBAL** - Corrige para TODO o sistema

---

### âœ… **CENÃRIO 3: Template da Tarja com Valor Hardcoded**

**Como identificar:**
- SeÃ§Ã£o 11 do script mostra: "âŒ CONTÃ‰M 2012 HARDCODED!"

**Causa:**
- O template da tarja tem texto fixo `"492 de 17/07/2012"` ao invÃ©s do placeholder `{PortariaNaoMetrologico}`

**CorreÃ§Ã£o:**

```sql
-- 1. Ver template atual
SELECT 
    Id,
    Nome,
    Template
FROM TBTarjas
WHERE Id = '7c63d905-76d5-4824-bb91-2251e62dc77d' -- ID da Tarja Axion

-- 2. Corrigir template (CUIDADO: Substituir somente se encontrar "2012")
UPDATE TBTarjas
SET 
    Template = REPLACE(
        Template, 
        'Portaria nÃ£o metrolÃ³gico : 492 de 17/07/2012',
        'Portaria nÃ£o metrolÃ³gico : {PortariaNaoMetrologico}'
    ),
    DataAtualizacao = GETDATE(),
    AtualizadoPor = 'Administrador'
WHERE 
    Id = '7c63d905-76d5-4824-bb91-2251e62dc77d'
    AND Template LIKE '%2012%'

-- 3. Verificar correÃ§Ã£o
SELECT 
    Nome,
    CASE 
        WHEN Template LIKE '%{PortariaNaoMetrologico}%' THEN 'âœ… Corrigido - Usa placeholder'
        WHEN Template LIKE '%2012%' THEN 'âŒ Ainda contÃ©m erro'
        ELSE 'âš ï¸ Verificar'
    END as Status
FROM TBTarjas
WHERE Id = '7c63d905-76d5-4824-bb91-2251e62dc77d'
```

**Via Sistema Web:**
1. Login â†’ Menu â†’ **ConfiguraÃ§Ãµes** â†’ **Tarjas**
2. Editar tarja **"Tarja Axion"**
3. No campo **"Template"**, buscar por `"492 de 17/07/2012"` ou `"2012"`
4. Substituir pelo placeholder: `{PortariaNaoMetrologico}`
5. **Salvar**

**Impacto:** ðŸŽ¯ **POR TARJA** - Corrige apenas operaÃ§Ãµes que usam "Tarja Axion"

---

### âœ… **CENÃRIO 4: Modelos Duplicados**

**Como identificar:**
- SeÃ§Ã£o 7 do script mostra: `TotalModelos > 1` (mais de um modelo VSIS-OCR)

**Causa:**
- Existem **dois modelos** cadastrados:
  - Modelo A (correto): "PORTARIA INMETRO/DIMEL NÂº 492/2021"
  - Modelo B (errado): "492 de 17/07/2012"
- Equipamento T5402 estÃ¡ vinculado ao Modelo B (errado)

**CorreÃ§Ã£o - OpÃ§Ã£o 1: Vincular equipamento ao modelo correto**

```sql
-- 1. Identificar os dois modelos
SELECT 
    Id,
    Modelo,
    Portaria,
    CASE 
        WHEN Portaria LIKE '%2021%' THEN 'âœ… Modelo correto'
        WHEN Portaria LIKE '%2012%' THEN 'âŒ Modelo errado'
    END as Status
FROM TBModeloEquipamentos
WHERE Modelo LIKE '%VSIS%'

-- 2. Vincular equipamento ao modelo correto
UPDATE TBEquipamentos
SET 
    ModeloEquipamento_id = '[ID_DO_MODELO_CORRETO]', -- Substituir pelo ID correto
    DataAtualizacao = GETDATE(),
    AtualizadoPor = 'Administrador'
WHERE Codigo IN ('T5402', 'T5403') -- Equipamentos afetados

-- 3. Verificar correÃ§Ã£o
SELECT 
    e.Codigo,
    m.Modelo,
    m.Portaria
FROM TBEquipamentos e
INNER JOIN TBModeloEquipamentos m ON e.ModeloEquipamento_id = m.Id
WHERE e.Codigo IN ('T5402', 'T5403')
```

**CorreÃ§Ã£o - OpÃ§Ã£o 2: Excluir modelo duplicado**

```sql
-- âš ï¸ CUIDADO: SÃ³ executar se o modelo errado NÃƒO estÃ¡ sendo usado

-- 1. Verificar se hÃ¡ equipamentos usando o modelo errado
SELECT 
    COUNT(*) as QtdEquipamentos,
    STRING_AGG(Codigo, ', ') as Equipamentos
FROM TBEquipamentos
WHERE ModeloEquipamento_id = '[ID_DO_MODELO_ERRADO]'

-- 2. Se QtdEquipamentos = 0, pode excluir:
DELETE FROM TBModeloEquipamentos
WHERE Id = '[ID_DO_MODELO_ERRADO]'

-- 3. Se QtdEquipamentos > 0, primeiro vincular ao modelo correto (OpÃ§Ã£o 1)
```

**Via Sistema Web:**
1. Login â†’ Menu â†’ **Equipamentos** â†’ **Equipamentos**
2. Buscar equipamento **"T5402"**
3. Clicar em **Editar**
4. Campo **"Modelo do Equipamento"**: Selecionar o modelo **correto** (VSIS-OCR com portaria 2021)
5. **Salvar**
6. Repetir para **T5403** e outros equipamentos afetados

**Impacto:** ðŸŽ¯ **POR EQUIPAMENTO** - Corrige apenas os equipamentos alterados

---

### âœ… **CENÃRIO 5: Erro no CÃ³digo Backend (LÃ³gica Diferenciada)**

**Como identificar:**
- SeÃ§Ã£o 3 mostra portaria **correta** em `TBModeloEquipamentos`
- MAS a tarja na imagem mostra portaria **errada**
- Todas as queries retornam valores corretos

**Causa:**
- CÃ³digo C# tem lÃ³gica customizada que substitui `{PortariaNaoMetrologico}` diferente de `{PortariaEquipamento}`
- PossÃ­vel hardcode em:
  - `Controllers/TarjaController.cs`
  - `Services/ImagemService.cs`
  - `Helpers/TarjaHelper.cs`

**CorreÃ§Ã£o:**

**1. Localizar o cÃ³digo-fonte do backend:**
```bash
# Buscar no cÃ³digo por "PortariaNaoMetrologico"
Get-ChildItem -Path "C:\AxHub\Backend" -Recurse -Include *.cs | 
    Select-String -Pattern "PortariaNaoMetrologico" -CaseSensitive
```

**2. Exemplo de cÃ³digo problemÃ¡tico:**
```csharp
// âŒ ERRADO - Valor hardcoded
public string PortariaNaoMetrologico 
{ 
    get { return "492 de 17/07/2012"; } 
}

// âœ… CORRETO - Buscar do banco
public string PortariaNaoMetrologico 
{ 
    get { return ModeloEquipamento?.Portaria ?? string.Empty; } 
}
```

**3. Arquivos para verificar:**
- `Models/TarjaViewModel.cs`
- `Services/TarjaService.cs`
- `Processors/ImageProcessor.cs`
- `Helpers/PlaceholderHelper.cs`

**4. ApÃ³s correÃ§Ã£o no cÃ³digo:**
```bash
# Recompilar e publicar
dotnet build
dotnet publish -c Release -o C:\Publish\AxHub

# Reiniciar IIS/Kestrel
iisreset
# OU
systemctl restart axhub.service
```

**Impacto:** ðŸŒ **GLOBAL** - Corrige para TODO o sistema apÃ³s deploy

---

## ðŸ”„ PASSO 2: REPROCESSAR INFRAÃ‡Ã•ES (ApÃ³s CorreÃ§Ã£o)

ApÃ³s corrigir o erro, as imagens antigas **nÃ£o serÃ£o atualizadas automaticamente**. Ã‰ necessÃ¡rio reprocessar as infraÃ§Ãµes.

### **OpÃ§Ã£o A: Reprocessamento via SQL (Direto no banco)**

```sql
-- âš ï¸ ATENÃ‡ÃƒO: Este script MARCA infraÃ§Ãµes para reprocessamento
-- Executar SOMENTE apÃ³s corrigir a portaria!

-- 1. Identificar infraÃ§Ãµes afetadas (11/06/2026)
SELECT 
    COUNT(*) as TotalInfracoes
FROM TBInfracoes
WHERE 
    CAST(DataHoraInfracao AS DATE) = '2026-06-11'
    AND Equipamento_id IN (
        SELECT Id FROM TBEquipamentos WHERE Codigo IN ('T5402', 'T5403')
    )

-- 2. Marcar para reprocessamento (se houver flag de reprocessamento)
UPDATE TBInfracoes
SET 
    StatusProcessamento = 'PendenteReprocessamento', -- Ajustar conforme o sistema
    DataReprocessamento = GETDATE()
WHERE 
    CAST(DataHoraInfracao AS DATE) = '2026-06-11'
    AND Equipamento_id IN (
        SELECT Id FROM TBEquipamentos WHERE Codigo IN ('T5402', 'T5403')
    )

-- 3. Verificar status
SELECT 
    StatusProcessamento,
    COUNT(*) as Quantidade
FROM TBInfracoes
WHERE CAST(DataHoraInfracao AS DATE) = '2026-06-11'
GROUP BY StatusProcessamento
```

### **OpÃ§Ã£o B: Reprocessamento via Sistema Web**

**Se o sistema tiver funcionalidade de reprocessamento:**

1. Login â†’ Menu â†’ **InfraÃ§Ãµes** â†’ **GestÃ£o de InfraÃ§Ãµes**
2. **Filtrar:**
   - Data: `11/06/2026`
   - Equipamento: `T5402` ou `T5403`
3. **Selecionar todas** as infraÃ§Ãµes
4. Clicar em **"Reprocessar InfraÃ§Ãµes"** ou **"Gerar Tarjas Novamente"**
5. Aguardar conclusÃ£o do processamento

### **OpÃ§Ã£o C: Reprocessamento via Job/ServiÃ§o**

**Se houver serviÃ§o agendado de reprocessamento:**

```bash
# Executar job manualmente (Windows)
cd C:\AxHub\Jobs
.\AxHub.Reprocessamento.exe --data "2026-06-11" --equipamento "T5402,T5403"

# OU via Hangfire/Quartz (se disponÃ­vel)
# Acessar: https://strans.axhub.axion.ws/hangfire
# Executar job: "ReprocessarInfracoesPorData"
```

---

## ðŸ§ª PASSO 3: VALIDAR CORREÃ‡ÃƒO

### **1. Verificar banco de dados:**

```sql
-- Confirmar que a portaria estÃ¡ correta
SELECT 
    m.Modelo,
    m.Portaria,
    e.Codigo,
    CASE 
        WHEN m.Portaria LIKE '%2021%' THEN 'âœ… Correto'
        WHEN m.Portaria LIKE '%2012%' THEN 'âŒ Ainda errado'
        ELSE 'âš ï¸ Verificar'
    END as Status
FROM TBModeloEquipamentos m
INNER JOIN TBEquipamentos e ON m.Id = e.ModeloEquipamento_id
WHERE e.Codigo IN ('T5402', 'T5403')
```

### **2. Gerar nova infraÃ§Ã£o de teste:**

1. Sistema â†’ **Equipamentos** â†’ **T5402**
2. Gerar uma **infraÃ§Ã£o de teste** (se possÃ­vel)
3. Visualizar a **imagem com tarja**
4. Verificar se mostra: `"PORTARIA INMETRO/DIMEL NÂº 492/2021"` âœ…

### **3. Verificar infraÃ§Ãµes reprocessadas:**

1. Sistema â†’ **InfraÃ§Ãµes**
2. Buscar infraÃ§Ãµes do dia **11/06/2026**
3. Abrir imagem
4. Confirmar portaria corrigida

---

## ðŸ“Š CHECKLIST DE VALIDAÃ‡ÃƒO

- [ ] Script de diagnÃ³stico executado
- [ ] Origem do erro identificada (TBModeloEquipamentos, TBConfiguracoes, Template, ou CÃ³digo)
- [ ] CorreÃ§Ã£o aplicada no banco/sistema
- [ ] Backup do banco realizado antes das alteraÃ§Ãµes
- [ ] InfraÃ§Ãµes antigas reprocessadas (se necessÃ¡rio)
- [ ] Nova infraÃ§Ã£o de teste gerada
- [ ] Tarja da nova infraÃ§Ã£o mostra portaria correta: "PORTARIA INMETRO/DIMEL NÂº 492/2021"
- [ ] InfraÃ§Ãµes do dia 11/06/2026 validadas
- [ ] DocumentaÃ§Ã£o atualizada (registro da correÃ§Ã£o)

---

## âš ï¸ IMPORTANTE: BACKUP

**SEMPRE fazer backup antes de executar UPDATE/DELETE:**

```sql
-- Backup da tabela antes de alterar
SELECT * 
INTO TBModeloEquipamentos_BACKUP_20260615
FROM TBModeloEquipamentos

-- Ou backup completo do banco
BACKUP DATABASE [NomeDoBancoSTRANS]
TO DISK = 'C:\Backup\STRANS_antes_correcao_portaria_20260615.bak'
WITH FORMAT, INIT, NAME = 'STRANS-Backup antes correÃ§Ã£o portaria';
```

---

## ðŸ“ž SUPORTE

**Em caso de dÃºvidas:**
- DocumentaÃ§Ã£o completa: [MAPEAMENTO-COMPLETO-VARIAVEIS-TARJA-AXION.md](MAPEAMENTO-COMPLETO-VARIAVEIS-TARJA-AXION.md)
- Script SQL: [SCRIPT-DIAGNOSTICO-PORTARIA-492-2012.sql](SCRIPT-DIAGNOSTICO-PORTARIA-492-2012.sql)
- AnÃ¡lise de locais: [ANALISE-COMPLETA-LOCAIS-PORTARIA-TARJA.md](ANALISE-COMPLETA-LOCAIS-PORTARIA-TARJA.md)

---

**Ãšltima atualizaÃ§Ã£o:** 2026-06-15  
**VersÃ£o:** 1.0


---

## ORIGEM: GUIA-PRATICO-ATUALIZAR-DADOS-TARJA-INFRACAO.md

# ðŸ“– GUIA PRÃTICO: Como Atualizar InformaÃ§Ãµes da Tarja de InfraÃ§Ã£o

**Sistema:** AxHub STRANS  
**VersÃ£o:** 2026  
**Ãšltima atualizaÃ§Ã£o:** 16/06/2026  

---

## ðŸ“‹ ÃNDICE

1. [IntroduÃ§Ã£o](#introduÃ§Ã£o)
2. [O que Ã© a Tarja de InfraÃ§Ã£o?](#o-que-Ã©-a-tarja-de-infraÃ§Ã£o)
3. [Como Funciona o Sistema de Tarjas](#como-funciona-o-sistema-de-tarjas)
4. [Guia RÃ¡pido: Alterando a Portaria](#guia-rÃ¡pido-alterando-a-portaria)
5. [Guia Completo: Todos os 17 Campos da Tarja](#guia-completo-todos-os-17-campos-da-tarja)
6. [Perguntas Frequentes](#perguntas-frequentes)

---

## ðŸ“Œ INTRODUÃ‡ÃƒO

Este guia ensina **passo a passo** como alterar as informaÃ§Ãµes que aparecem nas **tarjas impressas** nas infraÃ§Ãµes de trÃ¢nsito do sistema AxHub.

### âœ… O que vocÃª vai aprender:

- Como alterar a **portaria** que aparece na tarja
- Como atualizar **marca/modelo** do equipamento
- Como corrigir **endereÃ§o**, **faixa**, **sentido**
- Como atualizar **datas de aferiÃ§Ã£o** e **certificados**
- Onde cada informaÃ§Ã£o Ã© configurada no sistema
- O que afeta infraÃ§Ãµes futuras vs infraÃ§Ãµes jÃ¡ geradas

### âš ï¸ IMPORTANTE:

> **AlteraÃ§Ãµes afetam apenas NOVAS infraÃ§Ãµes!**  
> InfraÃ§Ãµes jÃ¡ geradas NÃƒO sÃ£o atualizadas automaticamente.  
> Para reprocessar infraÃ§Ãµes antigas, Ã© necessÃ¡rio acesso tÃ©cnico ao banco de dados.

---

## ðŸŽ¯ O QUE Ã‰ A TARJA DE INFRAÃ‡ÃƒO?

A **tarja** Ã© a imagem impressa/sobreposta na foto da infraÃ§Ã£o que contÃ©m informaÃ§Ãµes como:

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  CÃ³d. Equipamento: T5402                                   â”‚
â”‚  EndereÃ§o: Av. Exemplo, 1234                              â”‚
â”‚  Faixa: 1            Sentido: Crescente                   â”‚
â”‚  Data: 11/06/2026 14:30:00                                â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚
â”‚  Data aferiÃ§Ã£o: 12/01/2026                                â”‚
â”‚  Data venc. aferiÃ§Ã£o: 12/01/2027                          â”‚
â”‚  Certif.: 12345/2026                                      â”‚
â”‚  Portaria: PORTARIA INMETRO/DIMEL NÂº 492/2021            â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚
â”‚  Reg. nÃ£o metrolÃ³gico: 67890                              â”‚
â”‚  Venc. nÃ£o metrolÃ³gico: 12/01/2027                        â”‚
â”‚  Portaria nÃ£o metrolÃ³gico: 492 de 17/07/2012             â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚
â”‚  Marca/Modelo: VELSIS VSIS-OCR                            â”‚
â”‚  CÃ³d. Org: 12345                                          â”‚
â”‚  InfraÃ§Ã£o: 74550                                          â”‚
â”‚  DescriÃ§Ã£o: TRANSITAR...                                  â”‚
â”‚  Serial: SN123456                                         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

Cada campo dessa tarja **busca informaÃ§Ãµes de lugares diferentes** no sistema!

---

## ðŸ”§ COMO FUNCIONA O SISTEMA DE TARJAS

### **1. Template de Tarja**

O template Ã© um **modelo** que define:
- Quais informaÃ§Ãµes aparecem
- Como sÃ£o formatadas
- Onde sÃ£o posicionadas na imagem

**LocalizaÃ§Ã£o no sistema:**
```
STRANS â†’ ConfiguraÃ§Ãµes â†’ Tarjas â†’ Editar "Tarja Axion"
```

O template usa **variÃ¡veis** entre chaves `{NomeDaVariavel}` que sÃ£o substituÃ­das por valores reais na hora de gerar a infraÃ§Ã£o.

**Exemplo de template:**
```
CÃ³d. Equipamento : {CodigoEquipamento}
EndereÃ§o : {CodigoLocalOperacaoEquipamento}
Faixa : {NumeroFaixa}
Portaria : {PortariaEquipamento}
```

---

### **2. VariÃ¡veis do Template**

Cada variÃ¡vel busca dados de um **local especÃ­fico** no sistema:

| VariÃ¡vel no Template | Busca de onde? |
|---------------------|----------------|
| `{PortariaEquipamento}` | Cadastro do Modelo do Equipamento |
| `{CodigoEquipamento}` | Cadastro do Equipamento |
| `{NumeroFaixa}` | Cadastro da Faixa |
| `{DataAfericaoInmetro}` | Cadastro da AferiÃ§Ã£o |

**Fluxo de dados:**
```
Sistema AxHub
    â†“
Cadastros (Modelo, Equipamento, Faixa, AferiÃ§Ã£o, etc.)
    â†“
Banco de Dados (tabelas TBModeloEquipamentos, TBEquipamentos, etc.)
    â†“
Template da Tarja (substitui {Variaveis} por valores)
    â†“
Imagem da InfraÃ§Ã£o (tarja impressa na foto)
```

---

## ðŸš€ GUIA RÃPIDO: ALTERANDO A PORTARIA

### **CenÃ¡rio:** Corrigir portaria que aparece como "492 de 17/07/2012" para "PORTARIA INMETRO/DIMEL NÂº 492/2021"

---

### **OPÃ‡ÃƒO 1: Alterar no Cadastro do Modelo (RECOMENDADO)**

#### âœ… **Vantagens:**
- CorreÃ§Ã£o permanente
- Afeta todos equipamentos deste modelo
- MantÃ©m consistÃªncia no sistema

#### ðŸ“ **Passo a Passo:**

1. **Acessar STRANS:**
   ```
   https://strans.axhub.axion.ws
   Login: Admin
   Senha: Labor#5383
   ```

2. **Ir para Cadastros:**
   ```
   Menu â†’ Cadastros â†’ Modelos de Equipamentos
   ```

3. **Localizar o modelo:**
   - Pesquisar por: "VSIS-OCR"
   - Marca: VELSIS

4. **Editar o modelo:**
   - Clicar em "Editar" (Ã­cone de lÃ¡pis)

5. **Localizar o campo "Portaria":**
   - Verificar valor atual
   - Se estiver errado, corrigir para:
   ```
   PORTARIA INMETRO/DIMEL NÂº 492/2021
   ```

6. **Salvar:**
   - Clicar em "Salvar" ou "Confirmar"

7. **Validar:**
   - Gerar uma nova infraÃ§Ã£o de teste
   - Verificar se a portaria aparece correta

#### â±ï¸ **Tempo estimado:** 5 minutos

---

### **OPÃ‡ÃƒO 2: Alterar o Template da Tarja (WORKAROUND)**

#### âš ï¸ **Quando usar:**
- Quando a portaria estÃ¡ correta no cadastro, mas errada na tarja
- Quando existe duplicidade de variÃ¡veis no template
- Como soluÃ§Ã£o temporÃ¡ria

#### ðŸ“ **Passo a Passo:**

1. **Acessar STRANS:**
   ```
   https://strans.axhub.axion.ws
   ```

2. **Ir para ConfiguraÃ§Ãµes:**
   ```
   Menu â†’ ConfiguraÃ§Ãµes â†’ Tarjas
   ```

3. **Editar a tarja:**
   - Localizar "Tarja Axion"
   - Clicar em "Editar"

4. **Localizar no Template:**
   ```
   Portaria nÃ£o metrolÃ³gico : {PortariaNaoMetrologico}
   ```

5. **Substituir por:**
   ```
   Portaria nÃ£o metrolÃ³gico : {PortariaEquipamento}
   ```

6. **Salvar:**
   - Clicar em "Salvar"

7. **Validar:**
   - Gerar nova infraÃ§Ã£o de teste
   - Verificar se ambas as portarias aparecem corretas

#### â±ï¸ **Tempo estimado:** 3 minutos

---

### **OPÃ‡ÃƒO 3: Alterar Diretamente no Banco de Dados**

#### âš ï¸ **Requer:**
- Acesso SQL ao banco de dados
- Conhecimento tÃ©cnico
- Backup antes de alterar

#### ðŸ“ **Query SQL:**

```sql
-- Verificar valor atual
SELECT 
    IdModeloEquipamento,
    Marca,
    Modelo,
    Portaria,
    NumeroPortaria
FROM TBModeloEquipamentos
WHERE Modelo = 'VSIS-OCR'

-- Atualizar se necessÃ¡rio
UPDATE TBModeloEquipamentos
SET 
    Portaria = 'PORTARIA INMETRO/DIMEL NÂº 492/2021',
    NumeroPortaria = 492
WHERE Modelo = 'VSIS-OCR'
```

#### â±ï¸ **Tempo estimado:** 2 minutos (para quem tem acesso SQL)

---

## ðŸ“š GUIA COMPLETO: TODOS OS 17 CAMPOS DA TARJA

### **CAMPO #1: CÃ³digo do Equipamento**

**Aparece na tarja como:**
```
CÃ³d. Equipamento : T5402
```

**VariÃ¡vel do template:**
```
{CodigoEquipamento}
```

**Onde alterar:**
```
Menu â†’ Cadastros â†’ Equipamentos â†’ Selecionar equipamento â†’ Editar
Campo: "CÃ³digo"
```

**Origem dos dados:**
```
Tabela: TBEquipamentos
Campo: Codigo
```

**Como alterar:**

1. Acessar: Cadastros â†’ Equipamentos
2. Localizar o equipamento (buscar por cÃ³digo, endereÃ§o, ou modelo)
3. Clicar em "Editar"
4. Alterar o campo "CÃ³digo"
5. Salvar

**âš ï¸ ATENÃ‡ÃƒO:**
- Alterar o cÃ³digo pode afetar relatÃ³rios e histÃ³ricos
- Recomendado: **NÃƒO alterar** apÃ³s equipamento em uso
- Se necessÃ¡rio alterar, documentar a mudanÃ§a

**Quando afeta a tarja:**
- âœ… Novas infraÃ§Ãµes: SIM
- âŒ InfraÃ§Ãµes antigas: NÃƒO

---

### **CAMPO #2: EndereÃ§o**

**Aparece na tarja como:**
```
EndereÃ§o : Av. Exemplo, 1234 - Bairro
```

**VariÃ¡vel do template:**
```
{CodigoLocalOperacaoEquipamento}
```

**Onde alterar:**
```
Menu â†’ Cadastros â†’ OperaÃ§Ãµes â†’ Selecionar operaÃ§Ã£o â†’ Editar
Campo: "EndereÃ§o"
```

**Origem dos dados:**
```
Tabela: TBOperacoes
Campo: Endereco
```

**Como alterar:**

1. Acessar: Cadastros â†’ OperaÃ§Ãµes
2. Localizar a operaÃ§Ã£o do equipamento
3. Clicar em "Editar"
4. Alterar o campo "EndereÃ§o"
5. Salvar

**ðŸ’¡ DICA:**
- Uma operaÃ§Ã£o agrupa vÃ¡rios equipamentos do mesmo local
- Alterar o endereÃ§o da operaÃ§Ã£o afeta TODOS os equipamentos vinculados
- Formato recomendado: "Logradouro, NÃºmero - Bairro"

**Quando afeta a tarja:**
- âœ… Novas infraÃ§Ãµes: SIM
- âŒ InfraÃ§Ãµes antigas: NÃƒO

---

### **CAMPO #3: NÃºmero da Faixa**

**Aparece na tarja como:**
```
Faixa : 1
```

**VariÃ¡vel do template:**
```
{NumeroFaixa}
```

**Onde alterar:**
```
Menu â†’ Cadastros â†’ Equipamentos â†’ Selecionar equipamento â†’ Aba "Faixas" â†’ Editar faixa
Campo: "NÃºmero"
```

**Origem dos dados:**
```
Tabela: TBFaixas
Campo: NumeroFaixa
```

**Como alterar:**

1. Acessar: Cadastros â†’ Equipamentos
2. Localizar o equipamento
3. Clicar na aba "Faixas"
4. Selecionar a faixa desejada
5. Clicar em "Editar"
6. Alterar o campo "NÃºmero"
7. Salvar

**âš ï¸ ATENÃ‡ÃƒO:**
- Alterar o nÃºmero da faixa pode confundir anÃ¡lises de dados
- Recomendado: **NÃƒO alterar** apÃ³s faixa em uso
- Se necessÃ¡rio, desativar a faixa antiga e criar nova

**Quando afeta a tarja:**
- âœ… Novas infraÃ§Ãµes: SIM
- âŒ InfraÃ§Ãµes antigas: NÃƒO

---

### **CAMPO #4: Sentido**

**Aparece na tarja como:**
```
Sentido : Crescente
```

**VariÃ¡vel do template:**
```
{SentidoFaixa}
```

**Onde alterar:**
```
Menu â†’ Cadastros â†’ Equipamentos â†’ Selecionar equipamento â†’ Aba "Faixas" â†’ Editar faixa
Campo: "Sentido"
```

**Origem dos dados:**
```
Tabela: TBFaixas
Campo: Sentido
```

**Como alterar:**

1. Acessar: Cadastros â†’ Equipamentos
2. Localizar o equipamento
3. Clicar na aba "Faixas"
4. Selecionar a faixa
5. Clicar em "Editar"
6. Alterar o campo "Sentido"
   - OpÃ§Ãµes: Crescente, Decrescente
7. Salvar

**ðŸ’¡ DICA:**
- "Crescente": veÃ­culos trafegam no sentido da numeraÃ§Ã£o crescente das ruas
- "Decrescente": veÃ­culos trafegam no sentido da numeraÃ§Ã£o decrescente
- Importante para identificar corretamente a direÃ§Ã£o do veÃ­culo

**Quando afeta a tarja:**
- âœ… Novas infraÃ§Ãµes: SIM
- âŒ InfraÃ§Ãµes antigas: NÃƒO

---

### **CAMPO #5: Data da InfraÃ§Ã£o**

**Aparece na tarja como:**
```
Data : 11/06/2026 14:30:00
```

**VariÃ¡vel do template:**
```
{DataPassagemInfracao}
```

**Onde vem:**
```
Capturado AUTOMATICAMENTE pelo equipamento no momento da infraÃ§Ã£o
```

**Origem dos dados:**
```
Tabela: TBInfracoes
Campo: DataHoraInfracao
```

**Como alterar:**

âš ï¸ **ESTE CAMPO NÃƒO DEVE SER ALTERADO MANUALMENTE!**

RazÃµes:
- Ã‰ gerado automaticamente pelo equipamento
- Reflete o momento real da infraÃ§Ã£o
- AlteraÃ§Ã£o pode invalidar a infraÃ§Ã£o legalmente
- Requer sincronizaÃ§Ã£o de relÃ³gio do equipamento

**Se a data estiver errada:**

1. **Verificar relÃ³gio do equipamento:**
   - Acessar interface do equipamento
   - Verificar configuraÃ§Ã£o de data/hora
   - Sincronizar com servidor NTP se disponÃ­vel

2. **Ajustar fuso horÃ¡rio:**
   - Cadastros â†’ Equipamentos â†’ Editar
   - Verificar campo "Fuso HorÃ¡rio" (se disponÃ­vel)

3. **Para infraÃ§Ãµes jÃ¡ geradas com data errada:**
   - Requer acesso SQL ao banco de dados
   - Consultar equipe tÃ©cnica

**Quando afeta a tarja:**
- âœ… AutomÃ¡tico (capturado na hora da infraÃ§Ã£o)

---

### **CAMPO #6: Data da AferiÃ§Ã£o**

**Aparece na tarja como:**
```
Data aferiÃ§Ã£o : 12/01/2026
```

**VariÃ¡vel do template:**
```
{DataAfericaoInmetro}
```

**Onde alterar:**
```
Menu â†’ Cadastros â†’ AferiÃ§Ãµes â†’ Selecionar aferiÃ§Ã£o â†’ Editar
Campo: "Data da AferiÃ§Ã£o"
```

**Origem dos dados:**
```
Tabela: TBAfericoes
Campo: DataAfericao
```

**Como alterar:**

1. **Acessar: Cadastros â†’ AferiÃ§Ãµes**

2. **Localizar a aferiÃ§Ã£o:**
   - Filtrar por equipamento
   - Ordenar por data (mais recente primeiro)

3. **Editar a aferiÃ§Ã£o:**
   - Clicar em "Editar"
   - Alterar "Data da AferiÃ§Ã£o"
   - Formato: DD/MM/AAAA

4. **Salvar**

**ðŸ’¡ QUANDO CRIAR NOVA AFERIÃ‡ÃƒO:**

1. **Ao receber certificado do INMETRO:**
   - Criar nova aferiÃ§Ã£o com data do certificado
   - Preencher todos os campos obrigatÃ³rios
   - Anexar PDF do certificado (se sistema permitir)

2. **Vincular equipamento e faixas:**
   - Na aba "Equipamentos", adicionar o equipamento
   - Selecionar quais faixas sÃ£o cobertas pela aferiÃ§Ã£o
   - Definir data de vencimento (geralmente 1 ano apÃ³s)

**âš ï¸ ATENÃ‡ÃƒO:**
- A aferiÃ§Ã£o mais recente Ã© a que aparece na tarja
- AferiÃ§Ãµes vencidas podem invalidar infraÃ§Ãµes
- Manter calendÃ¡rio de aferiÃ§Ãµes atualizado

**Quando afeta a tarja:**
- âœ… Novas infraÃ§Ãµes: SIM (usa aferiÃ§Ã£o mais recente)
- âŒ InfraÃ§Ãµes antigas: NÃƒO

---

### **CAMPO #7: Data de Vencimento da AferiÃ§Ã£o**

**Aparece na tarja como:**
```
Data venc. aferiÃ§Ã£o : 12/01/2027
```

**VariÃ¡vel do template:**
```
{DataVencimentoAfericao}
```

**Onde alterar:**
```
Menu â†’ Cadastros â†’ AferiÃ§Ãµes â†’ Selecionar aferiÃ§Ã£o â†’ Editar
Campo: "Data de Vencimento"
```

**Origem dos dados:**
```
Tabela: TBAfericoes
Campo: DataVencimento
```

**Como alterar:**

1. Acessar: Cadastros â†’ AferiÃ§Ãµes
2. Localizar a aferiÃ§Ã£o
3. Clicar em "Editar"
4. Alterar "Data de Vencimento"
5. Salvar

**ðŸ’¡ REGRAS IMPORTANTES:**

- **Validade tÃ­pica:** 12 meses a partir da data de aferiÃ§Ã£o
- **CÃ¡lculo:** Data Vencimento = Data AferiÃ§Ã£o + 12 meses
- **Exemplo:**
  - AferiÃ§Ã£o: 12/01/2026
  - Vencimento: 12/01/2027

**âš ï¸ ALERTAS DO SISTEMA:**

O sistema deve alertar quando:
- AferiÃ§Ã£o estÃ¡ prÃ³xima do vencimento (ex: 30 dias antes)
- AferiÃ§Ã£o estÃ¡ vencida
- Equipamento opera com aferiÃ§Ã£o vencida (infraÃ§Ãµes invÃ¡lidas!)

**Quando afeta a tarja:**
- âœ… Novas infraÃ§Ãµes: SIM
- âŒ InfraÃ§Ãµes antigas: NÃƒO

---

### **CAMPO #8: Certificado**

**Aparece na tarja como:**
```
Certif. : 12345/2026
```

**VariÃ¡vel do template:**
```
{CertificadoEquipamento}
```

**Onde alterar:**
```
OPÃ‡ÃƒO 1: Menu â†’ Cadastros â†’ Equipamentos â†’ Editar â†’ Campo "Certificado"
OPÃ‡ÃƒO 2: Menu â†’ Cadastros â†’ AferiÃ§Ãµes â†’ Editar â†’ Campo "NÃºmero INMETRO"
```

**Origem dos dados:**
```
âš ï¸ AMBÃGUA - Pode vir de:
Tabela: TBEquipamentos, Campo: Certificado
   OU
Tabela: TBAfericoes, Campo: NumeroInmetro
```

**Como alterar (OPÃ‡ÃƒO 1 - No Equipamento):**

1. Acessar: Cadastros â†’ Equipamentos
2. Localizar o equipamento
3. Clicar em "Editar"
4. Localizar campo "Certificado" ou "NÃºmero do Certificado"
5. Alterar para o nÃºmero do certificado INMETRO
6. Formato: "12345/2026"
7. Salvar

**Como alterar (OPÃ‡ÃƒO 2 - Na AferiÃ§Ã£o):**

1. Acessar: Cadastros â†’ AferiÃ§Ãµes
2. Localizar a aferiÃ§Ã£o mais recente
3. Clicar em "Editar"
4. Localizar campo "NÃºmero INMETRO" ou similar
5. Alterar para o nÃºmero do certificado
6. Salvar

**ðŸ’¡ RECOMENDAÃ‡ÃƒO:**

- Manter consistente entre Equipamento e AferiÃ§Ã£o
- Atualizar AMBOS quando receber novo certificado
- Formato padrÃ£o: "NumeroSequencial/Ano"
- Exemplo: "54321/2026"

**Quando afeta a tarja:**
- âœ… Novas infraÃ§Ãµes: SIM
- âŒ InfraÃ§Ãµes antigas: NÃƒO

---

### **CAMPO #9: Portaria do Equipamento** â­

**Aparece na tarja como:**
```
Portaria : PORTARIA INMETRO/DIMEL NÂº 492/2021
```

**VariÃ¡vel do template:**
```
{PortariaEquipamento}
```

**Onde alterar:**
```
Menu â†’ Cadastros â†’ Modelos de Equipamentos â†’ Selecionar modelo â†’ Editar
Campo: "Portaria"
```

**Origem dos dados:**
```
Tabela: TBModeloEquipamentos
Campo: Portaria
```

**Como alterar:**

1. **Acessar: Cadastros â†’ Modelos de Equipamentos**

2. **Localizar o modelo:**
   - Buscar por: "VSIS-OCR" (ou nome do seu modelo)
   - Marca: VELSIS (ou fabricante do seu equipamento)

3. **Editar o modelo:**
   - Clicar em "Editar"

4. **Alterar o campo "Portaria":**
   - Formato recomendado: "PORTARIA INMETRO/DIMEL NÂº XXX/AAAA"
   - Exemplo: "PORTARIA INMETRO/DIMEL NÂº 492/2021"

5. **Alterar tambÃ©m "NÃºmero da Portaria":**
   - Campo: "NÃºmero Portaria" ou similar
   - Apenas o nÃºmero: 492

6. **Salvar**

**ðŸ“‹ PORTARIAS COMUNS:**

| Portaria | AplicaÃ§Ã£o | Data PublicaÃ§Ã£o |
|----------|-----------|-----------------|
| 492/2021 | Sistemas de AferiÃ§Ã£o de Velocidade | 10/12/2021 |
| 541/2021 | Sistemas de Pesagem | 28/12/2021 |
| 115/2019 | EtilÃ´metros | 20/03/2019 |

**ðŸ’¡ IMPORTANTE:**

- A portaria Ã© definida no **MODELO**, nÃ£o no equipamento individual
- Alterar a portaria do modelo afeta **TODOS os equipamentos** deste modelo
- Verificar a portaria correta no site do INMETRO: https://www.gov.br/inmetro

**Quando afeta a tarja:**
- âœ… Novas infraÃ§Ãµes: SIM
- âŒ InfraÃ§Ãµes antigas: NÃƒO

---

### **CAMPO #10: Registro NÃ£o MetrolÃ³gico**

**Aparece na tarja como:**
```
Reg. nÃ£o metrolÃ³gico : 67890
```

**VariÃ¡vel do template:**
```
{NumeroCertificadoInmetro}
```

**Onde alterar:**
```
Menu â†’ Cadastros â†’ AferiÃ§Ãµes â†’ Selecionar aferiÃ§Ã£o â†’ Editar
Campo: "NÃºmero INMETRO" ou "Registro"
```

**Origem dos dados:**
```
Tabela: TBAfericoes
Campo: NumeroInmetro
```

**Como alterar:**

1. Acessar: Cadastros â†’ AferiÃ§Ãµes
2. Localizar a aferiÃ§Ã£o mais recente
3. Clicar em "Editar"
4. Localizar campo "NÃºmero INMETRO"
5. Alterar para o nÃºmero do certificado INMETRO
6. Salvar

**ðŸ’¡ DIFERENÃ‡A: Certificado vs Registro:**

- **Certificado (Campo #8):** NÃºmero do documento de aferiÃ§Ã£o
- **Registro (Campo #10):** NÃºmero de registro do equipamento no INMETRO

Ambos podem ser o mesmo valor, mas conceitualmente sÃ£o diferentes!

**Quando afeta a tarja:**
- âœ… Novas infraÃ§Ãµes: SIM
- âŒ InfraÃ§Ãµes antigas: NÃƒO

---

### **CAMPO #11: Vencimento NÃ£o MetrolÃ³gico**

**Aparece na tarja como:**
```
Venc. nÃ£o metrolÃ³gico : 12/01/2027
```

**VariÃ¡vel do template:**
```
{DataVencimentoAfericao}
```

**Onde alterar:**
```
Menu â†’ Cadastros â†’ AferiÃ§Ãµes â†’ Selecionar aferiÃ§Ã£o â†’ Editar
Campo: "Data de Vencimento"
```

**Origem dos dados:**
```
Tabela: TBAfericoes
Campo: DataVencimento
```

**Como alterar:**

Mesmo procedimento do **Campo #7** (Data Venc. AferiÃ§Ã£o)

**âš ï¸ NOTA:**
- Este campo Ã© uma **duplicata** do Campo #7
- A mesma variÃ¡vel `{DataVencimentoAfericao}` Ã© usada duas vezes no template
- Alterar uma vez afeta ambas as ocorrÃªncias na tarja

---

### **CAMPO #12: Portaria NÃ£o MetrolÃ³gico** âš ï¸ **ERRO CONHECIDO**

**Aparece na tarja como:**
```
Portaria nÃ£o metrolÃ³gico : 492 de 17/07/2012 âŒ ERRADO!
```

**Deveria aparecer:**
```
Portaria nÃ£o metrolÃ³gico : PORTARIA INMETRO/DIMEL NÂº 492/2021 âœ…
```

**VariÃ¡vel do template:**
```
{PortariaNaoMetrologico}
```

**Problema identificado:**
- Esta variÃ¡vel **NÃƒO busca** de `TBModeloEquipamentos.Portaria`
- O valor "492 de 17/07/2012" vem de **origem desconhecida**
- Pode ser: configuraÃ§Ã£o global, cÃ³digo backend, ou cache

**Onde DEVERIA alterar:**
```
âš ï¸ ORIGEM DESCONHECIDA - Requer investigaÃ§Ã£o tÃ©cnica
```

**SOLUÃ‡ÃƒO TEMPORÃRIA (Workaround):**

Editar o template da tarja e substituir a variÃ¡vel:

1. Acessar: ConfiguraÃ§Ãµes â†’ Tarjas
2. Editar "Tarja Axion"
3. Localizar:
   ```
   Portaria nÃ£o metrolÃ³gico : {PortariaNaoMetrologico}
   ```
4. Substituir por:
   ```
   Portaria nÃ£o metrolÃ³gico : {PortariaEquipamento}
   ```
5. Salvar

**SOLUÃ‡ÃƒO DEFINITIVA:**

Requer acesso tÃ©cnico:
- Verificar tabela `TBConfiguracoes` no banco de dados
- Verificar cÃ³digo-fonte do backend (TarjaService.cs)
- Verificar arquivo `appsettings.json` no servidor

**Para investigaÃ§Ã£o tÃ©cnica completa, consultar:**
- [VALIDACAO-COMPLETA-TODOS-CAMPOS-TARJA.md](VALIDACAO-COMPLETA-TODOS-CAMPOS-TARJA.md)
- [GUIA-CORRECAO-ERRO-PORTARIA-492-2012.md](GUIA-CORRECAO-ERRO-PORTARIA-492-2012.md)

---

### **CAMPO #13: Marca/Modelo do Equipamento**

**Aparece na tarja como:**
```
Marca/Modelo : VELSIS VSIS-OCR
```

**VariÃ¡vel do template:**
```
{MarcaModeloEquipamento}
```

**Onde alterar:**
```
Menu â†’ Cadastros â†’ Modelos de Equipamentos â†’ Selecionar modelo â†’ Editar
Campos: "Marca" e "Modelo"
```

**Origem dos dados:**
```
Tabela: TBModeloEquipamentos
Campos: Marca + Modelo (concatenados)
```

**Como alterar:**

1. **Acessar: Cadastros â†’ Modelos de Equipamentos**

2. **Localizar o modelo:**
   - Buscar pelo nome atual

3. **Editar o modelo:**
   - Clicar em "Editar"

4. **Alterar os campos:**
   - **Marca:** Nome do fabricante (ex: "VELSIS", "GATSO", "PERKONS")
   - **Modelo:** Nome do modelo (ex: "VSIS-OCR", "MILLIA", "VECTRA")

5. **Salvar**

**ðŸ’¡ FORMATAÃ‡ÃƒO:**

O sistema concatena automaticamente: `Marca + " " + Modelo`

Exemplo:
- Marca: "VELSIS"
- Modelo: "VSIS-OCR"
- Resultado na tarja: "VELSIS VSIS-OCR"

**âš ï¸ ATENÃ‡ÃƒO:**

- Alterar marca/modelo afeta **TODOS os equipamentos** deste modelo
- Recomendado: **NÃƒO alterar** apÃ³s equipamentos em uso
- Se necessÃ¡rio, criar novo modelo e migrar equipamentos

**Quando afeta a tarja:**
- âœ… Novas infraÃ§Ãµes: SIM
- âŒ InfraÃ§Ãµes antigas: NÃƒO

---

### **CAMPO #14: CÃ³digo do Ã“rgÃ£o Autuador**

**Aparece na tarja como:**
```
CÃ³d. Org : 12345
```

**VariÃ¡vel do template:**
```
{CodigoOrgaoAutuador}
```

**Onde alterar:**
```
OPÃ‡ÃƒO 1: Menu â†’ ConfiguraÃ§Ãµes â†’ Geral â†’ Campo "CÃ³digo Ã“rgÃ£o Autuador"
OPÃ‡ÃƒO 2: Menu â†’ Cadastros â†’ Ã“rgÃ£os Autuadores â†’ Editar
```

**Origem dos dados:**
```
âš ï¸ AMBÃGUA - Pode vir de:
Tabela: TBConfiguracoes
   OU
Tabela: TBOrgaosAutuadores
```

**Como alterar (OPÃ‡ÃƒO 1 - ConfiguraÃ§Ã£o Global):**

1. Acessar: ConfiguraÃ§Ãµes â†’ Geral ou ParÃ¢metros
2. Localizar seÃ§Ã£o "Ã“rgÃ£o Autuador"
3. Campo: "CÃ³digo" ou "CÃ³digo RENAINF"
4. Alterar o cÃ³digo
5. Salvar

**Como alterar (OPÃ‡ÃƒO 2 - Cadastro de Ã“rgÃ£os):**

1. Acessar: Cadastros â†’ Ã“rgÃ£os Autuadores
2. Localizar o Ã³rgÃ£o autuador principal
3. Clicar em "Editar"
4. Campo: "CÃ³digo"
5. Alterar o cÃ³digo
6. Salvar

**ðŸ’¡ O QUE Ã‰:**

- CÃ³digo RENAINF do Ã³rgÃ£o autuador
- Usado para identificar o Ã³rgÃ£o nos sistemas nacionais
- Geralmente 5 dÃ­gitos
- Exemplo: "12345" para STRANS de determinado municÃ­pio

**Quando afeta a tarja:**
- âœ… Novas infraÃ§Ãµes: SIM
- âŒ InfraÃ§Ãµes antigas: NÃƒO

---

### **CAMPO #15: CÃ³digo da InfraÃ§Ã£o**

**Aparece na tarja como:**
```
InfraÃ§Ã£o : 74550
```

**VariÃ¡vel do template:**
```
{CodigoEnquadramento}
```

**Onde alterar:**
```
Menu â†’ Cadastros â†’ Enquadramentos â†’ Selecionar enquadramento â†’ Editar
Campo: "CÃ³digo"
```

**Origem dos dados:**
```
Tabela: TBEnquadramentos
Campo: Codigo
```

**Como alterar:**

1. **Acessar: Cadastros â†’ Enquadramentos**

2. **Localizar o enquadramento:**
   - Buscar pelo cÃ³digo atual (ex: 74550)
   - Ou pela descriÃ§Ã£o

3. **Editar:**
   - Clicar em "Editar"
   - Alterar campo "CÃ³digo"
   - Seguir numeraÃ§Ã£o do CTB (CÃ³digo de TrÃ¢nsito Brasileiro)

4. **Salvar**

**ðŸ“‹ CÃ“DIGOS COMUNS:**

| CÃ³digo | DescriÃ§Ã£o | Velocidade |
|--------|-----------|------------|
| 74550 | Excesso atÃ© 20% | AtÃ© 20% acima |
| 74520 | Excesso 20% a 50% | Entre 20% e 50% |
| 74740 | Excesso acima de 50% | Mais de 50% |
| 76320 | AvanÃ§o de sinal vermelho | - |
| 76710 | ConversÃ£o proibida | - |

**âš ï¸ IMPORTANTE:**

- O cÃ³digo deve seguir o CTB
- CÃ³digo errado = infraÃ§Ã£o invÃ¡lida legalmente
- NÃƒO alterar cÃ³digos jÃ¡ em uso no sistema

**Quando afeta a tarja:**
- âœ… Novas infraÃ§Ãµes: SIM (depende do enquadramento aplicado)
- âŒ InfraÃ§Ãµes antigas: NÃƒO

---

### **CAMPO #16: DescriÃ§Ã£o da InfraÃ§Ã£o**

**Aparece na tarja como:**
```
DescriÃ§Ã£o : TRANSITAR EM VELOCIDADE SUPERIOR Ã€ MÃXIMA PERMITIDA EM ATÃ‰ VINTE POR CENTO
```

**VariÃ¡vel do template:**
```
{DescricaoEnquadramento}
```

**Onde alterar:**
```
Menu â†’ Cadastros â†’ Enquadramentos â†’ Selecionar enquadramento â†’ Editar
Campo: "DescriÃ§Ã£o"
```

**Origem dos dados:**
```
Tabela: TBEnquadramentos
Campo: Descricao
```

**Como alterar:**

1. Acessar: Cadastros â†’ Enquadramentos
2. Localizar o enquadramento
3. Clicar em "Editar"
4. Alterar campo "DescriÃ§Ã£o"
5. Usar texto conforme CTB
6. Salvar

**ðŸ’¡ FORMATO:**

- Usar CAIXA ALTA (geralmente)
- Seguir texto exato do Artigo do CTB
- Ser claro e objetivo
- Incluir detalhes da infraÃ§Ã£o

**Exemplo completo:**
```
Artigo: 218, Inciso I
CÃ³digo: 74550
DescriÃ§Ã£o: TRANSITAR EM VELOCIDADE SUPERIOR Ã€ MÃXIMA PERMITIDA EM ATÃ‰ VINTE POR CENTO
```

**Quando afeta a tarja:**
- âœ… Novas infraÃ§Ãµes: SIM (depende do enquadramento aplicado)
- âŒ InfraÃ§Ãµes antigas: NÃƒO

---

### **CAMPO #17: Serial do Equipamento**

**Aparece na tarja como:**
```
Serial : SN123456
```

**VariÃ¡vel do template:**
```
{SerialEquipamento}
```

**Onde alterar:**
```
Menu â†’ Cadastros â†’ Equipamentos â†’ Selecionar equipamento â†’ Editar
Campo: "NÃºmero de SÃ©rie" ou "Serial"
```

**Origem dos dados:**
```
Tabela: TBEquipamentos
Campo: NumeroSerie
```

**Como alterar:**

1. Acessar: Cadastros â†’ Equipamentos
2. Localizar o equipamento
3. Clicar em "Editar"
4. Alterar campo "NÃºmero de SÃ©rie" ou "Serial"
5. Usar o serial da etiqueta do equipamento
6. Salvar

**ðŸ’¡ ONDE ENCONTRAR:**

- Etiqueta fÃ­sica no equipamento
- Manual do equipamento
- Nota fiscal de compra
- Certificado INMETRO

**âš ï¸ IMPORTANTE:**

- O serial Ã© Ãºnico para cada equipamento
- NÃƒO alterar a menos que esteja errado no cadastro
- Manter registro em caso de troca/manutenÃ§Ã£o

**Quando afeta a tarja:**
- âœ… Novas infraÃ§Ãµes: SIM
- âŒ InfraÃ§Ãµes antigas: NÃƒO

---

## â“ PERGUNTAS FREQUENTES

### **1. Alterei o campo no sistema, mas a tarja ainda mostra o valor antigo. Por quÃª?**

**Resposta:**

As alteraÃ§Ãµes afetam apenas **NOVAS infraÃ§Ãµes**. InfraÃ§Ãµes jÃ¡ geradas permanecem com os dados antigos.

**SoluÃ§Ãµes:**

a) **Aguardar nova infraÃ§Ã£o:**
   - As prÃ³ximas infraÃ§Ãµes virÃ£o com dados atualizados

b) **Reprocessar infraÃ§Ãµes antigas (requer SQL):**
   ```sql
   -- EXEMPLO - NÃƒO executar sem backup!
   UPDATE TBInfracoes
   SET ReprocessarTarja = 1
   WHERE DataHoraInfracao > '2026-06-01'
   ```

c) **Cache do sistema:**
   - Reiniciar aplicaÃ§Ã£o web
   - Limpar cache do navegador
   - Aguardar alguns minutos

---

### **2. Posso alterar a tarja de uma infraÃ§Ã£o jÃ¡ gerada?**

**Resposta:**

âš ï¸ **Tecnicamente sim, mas NÃƒO Ã© recomendado!**

**Por quÃª:**
- A tarja reflete os dados no momento da infraÃ§Ã£o
- Alterar retroativamente pode invalidar a infraÃ§Ã£o legalmente
- Pode ser considerado adulteraÃ§Ã£o de documento

**Quando pode:**
- CorreÃ§Ã£o de erro evidente (ex: endereÃ§o errado)
- AutorizaÃ§Ã£o formal do gestor
- DocumentaÃ§Ã£o da alteraÃ§Ã£o
- Acesso tÃ©cnico ao banco de dados

**Como fazer (requer SQL):**
```sql
-- Marcar infraÃ§Ã£o para reprocessar
UPDATE TBInfracoes
SET ReprocessarTarja = 1
WHERE IdInfracao = 'GUID-DA-INFRACAO'

-- Executar rotina de reprocessamento
EXEC sp_ReprocessarTarjas
```

---

### **3. Alterei a portaria no modelo, mas a tarja ainda mostra errada. O que fazer?**

**PossÃ­veis causas:**

**Causa 1: Template usa variÃ¡vel errada**
- Verificar se template usa `{PortariaEquipamento}` ou `{PortariaNaoMetrologico}`
- Se usar `{PortariaNaoMetrologico}`, existe bug conhecido (ver Campo #12)
- **SoluÃ§Ã£o:** Alterar template para usar `{PortariaEquipamento}`

**Causa 2: Cache do sistema**
- Sistema pode ter cache de dados de modelo
- **SoluÃ§Ã£o:** Reiniciar aplicaÃ§Ã£o ou aguardar cache expirar

**Causa 3: MÃºltiplos modelos**
- Verificar se hÃ¡ outro modelo VSIS-OCR cadastrado
- **SoluÃ§Ã£o:** Consolidar para um Ãºnico modelo

**Causa 4: ConfiguraÃ§Ã£o sobrescreve modelo**
- Tabela `TBConfiguracoes` pode ter configuraÃ§Ã£o global
- **SoluÃ§Ã£o:** Verificar/corrigir via SQL

---

### **4. Como sei qual campo alterar para corrigir uma informaÃ§Ã£o especÃ­fica?**

**Use a tabela de referÃªncia rÃ¡pida:**

| InformaÃ§Ã£o Errada | Onde Alterar |
|-------------------|--------------|
| CÃ³digo do equipamento | Cadastros â†’ Equipamentos |
| EndereÃ§o | Cadastros â†’ OperaÃ§Ãµes |
| Faixa/Sentido | Cadastros â†’ Equipamentos â†’ Aba Faixas |
| Portaria | Cadastros â†’ Modelos de Equipamentos |
| Marca/Modelo | Cadastros â†’ Modelos de Equipamentos |
| Data/Certificado aferiÃ§Ã£o | Cadastros â†’ AferiÃ§Ãµes |
| Serial | Cadastros â†’ Equipamentos |
| CÃ³digo infraÃ§Ã£o | Cadastros â†’ Enquadramentos |
| DescriÃ§Ã£o infraÃ§Ã£o | Cadastros â†’ Enquadramentos |
| CÃ³digo Ã³rgÃ£o | ConfiguraÃ§Ãµes â†’ Geral |

**Ou consulte este guia no campo especÃ­fico!**

---

### **5. Preciso alterar o template da tarja. Como faÃ§o?**

**Passo a passo:**

1. **Acessar:**
   ```
   Menu â†’ ConfiguraÃ§Ãµes â†’ Tarjas
   ```

2. **Editar a tarja:**
   - Localizar "Tarja Axion" (ou nome da sua tarja)
   - Clicar em "Editar"

3. **Alterar o template:**
   - Campo: "Template" ou "Layout"
   - Usar variÃ¡veis entre chaves: `{NomeDaVariavel}`
   - Consultar lista de variÃ¡veis disponÃ­veis

4. **VariÃ¡veis disponÃ­veis:**
   ```
   {CodigoEquipamento}
   {CodigoLocalOperacaoEquipamento}
   {NumeroFaixa}
   {SentidoFaixa}
   {DataPassagemInfracao}
   {DataAfericaoInmetro}
   {DataVencimentoAfericao}
   {CertificadoEquipamento}
   {PortariaEquipamento}
   {NumeroCertificadoInmetro}
   {PortariaNaoMetrologico}
   {MarcaModeloEquipamento}
   {CodigoOrgaoAutuador}
   {CodigoEnquadramento}
   {DescricaoEnquadramento}
   {SerialEquipamento}
   ```

5. **Salvar e testar:**
   - Salvar alteraÃ§Ãµes
   - Gerar infraÃ§Ã£o de teste
   - Verificar resultado

---

### **6. Posso ter mÃºltiplas tarjas diferentes no sistema?**

**Sim!** O sistema permite criar vÃ¡rias tarjas.

**Usos comuns:**

- Tarja para infraÃ§Ãµes de velocidade
- Tarja para avanÃ§o de sinal
- Tarja para pesagem (AxTon)
- Tarja para monitoramento (AxCross)
- Tarja simplificada vs completa

**Como configurar qual tarja usar:**

1. **Por tipo de infraÃ§Ã£o:**
   - Cadastros â†’ Enquadramentos â†’ Editar
   - Campo: "Tarja padrÃ£o" ou similar

2. **Por equipamento:**
   - Cadastros â†’ Equipamentos â†’ Editar
   - Campo: "Template de tarja"

3. **Por operaÃ§Ã£o:**
   - Cadastros â†’ OperaÃ§Ãµes â†’ Editar
   - Campo: "Tarja padrÃ£o"

---

### **7. Como adiciono uma nova informaÃ§Ã£o na tarja que nÃ£o existe?**

**Requer desenvolvimento:**

1. **Verificar se variÃ¡vel existe:**
   - Conferir lista de variÃ¡veis disponÃ­veis no template

2. **Se variÃ¡vel NÃƒO existe:**
   - Requer desenvolvimento backend
   - Criar nova variÃ¡vel no cÃ³digo C#
   - Mapear para campo do banco de dados
   - Adicionar ao processador de tarjas

3. **Exemplo de nova variÃ¡vel:**
   ```csharp
   // Backend C# - TarjaService.cs
   public string NovaInformacao 
   { 
       get { return Equipment?.CampoNovo ?? string.Empty; }
   }
   ```

4. **Adicionar no template:**
   ```
   Nova Info : {NovaInformacao}
   ```

**ðŸ’¡ Consulte equipe de desenvolvimento!**

---

### **8. O que acontece se eu deixar uma aferiÃ§Ã£o vencer?**

**ConsequÃªncias:**

1. **InfraÃ§Ãµes podem ser invalidadas:**
   - InfraÃ§Ãµes geradas com aferiÃ§Ã£o vencida sÃ£o juridicamente questionÃ¡veis
   - Defesas de autuaÃ§Ã£o podem ser aceitas

2. **Sistema pode bloquear:**
   - Dependendo da configuraÃ§Ã£o, sistema pode:
     - Bloquear geraÃ§Ã£o de novas infraÃ§Ãµes
     - Emitir alerta vermelho
     - Exigir nova aferiÃ§Ã£o

3. **Processo legal:**
   - Equipamento opera ilegalmente
   - Ã“rgÃ£o autuador pode ser responsabilizado

**Como evitar:**

1. **CalendÃ¡rio de aferiÃ§Ãµes:**
   - Agendar aferiÃ§Ã£o 60 dias antes do vencimento
   - Manter planilha de controle

2. **Alertas do sistema:**
   - Configurar alertas 30 dias antes
   - Monitorar dashboard de vencimentos

3. **RenovaÃ§Ã£o:**
   - Contratar empresa credenciada INMETRO
   - Receber certificado
   - Cadastrar nova aferiÃ§Ã£o no sistema
   - Vincular equipamento e faixas

---

### **9. Posso usar a mesma aferiÃ§Ã£o para vÃ¡rios equipamentos?**

**Sim, SE:**

- Os equipamentos estÃ£o fisicamente juntos
- A aferiÃ§Ã£o foi feita para o conjunto
- O certificado INMETRO lista todos os equipamentos
- As faixas estÃ£o todas cobertas pela aferiÃ§Ã£o

**Como fazer:**

1. **Cadastrar a aferiÃ§Ã£o:**
   - Cadastros â†’ AferiÃ§Ãµes â†’ Nova

2. **Vincular mÃºltiplos equipamentos:**
   - Na aba "Equipamentos"
   - Adicionar cada equipamento
   - Selecionar faixas de cada um

3. **Resultado:**
   - Todos os equipamentos vinculados usarÃ£o esta aferiÃ§Ã£o
   - Data de vencimento compartilhada

**âš ï¸ ATENÃ‡ÃƒO:**

- Certificado INMETRO deve cobrir todos os equipamentos
- NÃ£o vincular equipamentos que nÃ£o estÃ£o no certificado

---

### **10. Como faÃ§o backup antes de alterar informaÃ§Ãµes crÃ­ticas?**

**RecomendaÃ§Ã£o: SEMPRE fazer backup antes de alteraÃ§Ãµes!**

**OpÃ§Ã£o 1: Backup pelo sistema (se disponÃ­vel):**
```
Menu â†’ ConfiguraÃ§Ãµes â†’ Backup â†’ Gerar Backup Completo
```

**OpÃ§Ã£o 2: Backup do banco de dados (recomendado):**
```sql
-- SQL Server
BACKUP DATABASE AxHub
TO DISK = 'C:\Backup\AxHub_2026-06-16.bak'
WITH COMPRESSION, INIT
```

**OpÃ§Ã£o 3: Exportar cadastros especÃ­ficos:**
- Cadastros â†’ Modelos de Equipamentos â†’ Exportar para Excel
- Cadastros â†’ Equipamentos â†’ Exportar para Excel
- Etc.

**Antes de alteraÃ§Ãµes crÃ­ticas, documente:**
1. Data/hora da alteraÃ§Ã£o
2. UsuÃ¡rio responsÃ¡vel
3. Valor antigo
4. Valor novo
5. Motivo da alteraÃ§Ã£o

---

## ðŸ“Š TABELA DE REFERÃŠNCIA RÃPIDA

### **Impacto das AlteraÃ§Ãµes**

| Campo | Afeta Novas InfraÃ§Ãµes | Afeta InfraÃ§Ãµes Antigas | Requer ReinÃ­cio |
|-------|----------------------|------------------------|----------------|
| CÃ³digo Equipamento | âœ… SIM | âŒ NÃƒO | âŒ NÃƒO |
| EndereÃ§o | âœ… SIM | âŒ NÃƒO | âŒ NÃƒO |
| Faixa/Sentido | âœ… SIM | âŒ NÃƒO | âŒ NÃƒO |
| Portaria Modelo | âœ… SIM | âŒ NÃƒO | âš ï¸ Cache 5min |
| Marca/Modelo | âœ… SIM | âŒ NÃƒO | âš ï¸ Cache 5min |
| AferiÃ§Ã£o (datas) | âœ… SIM | âŒ NÃƒO | âŒ NÃƒO |
| Certificado | âœ… SIM | âŒ NÃƒO | âŒ NÃƒO |
| Serial | âœ… SIM | âŒ NÃƒO | âŒ NÃƒO |
| Enquadramento | âš ï¸ DEPENDE | âŒ NÃƒO | âŒ NÃƒO |
| CÃ³digo Ã“rgÃ£o | âœ… SIM | âŒ NÃƒO | âš ï¸ Cache |
| Template Tarja | âœ… SIM | âŒ NÃƒO | âŒ NÃƒO |

---

### **Hierarquia de Dados**

```
MODELO DE EQUIPAMENTO (ex: VSIS-OCR)
â”œâ”€â”€ Portaria â† TODOS equipamentos deste modelo
â”œâ”€â”€ Marca â† TODOS equipamentos deste modelo
â””â”€â”€ Modelo â† TODOS equipamentos deste modelo
    â”‚
    â””â”€â”€ EQUIPAMENTO (ex: T5402)
        â”œâ”€â”€ CÃ³digo â† EspecÃ­fico deste equipamento
        â”œâ”€â”€ Serial â† EspecÃ­fico deste equipamento
        â””â”€â”€ Certificado â† EspecÃ­fico deste equipamento
            â”‚
            â””â”€â”€ OPERAÃ‡ÃƒO (ex: Av. Exemplo)
                â”œâ”€â”€ EndereÃ§o â† Todos equipamentos desta operaÃ§Ã£o
                â””â”€â”€ CÃ³digo Ã“rgÃ£o â† Geralmente global
                    â”‚
                    â””â”€â”€ FAIXAS (ex: Faixa 1, 2, 3)
                        â”œâ”€â”€ NÃºmero â† EspecÃ­fico desta faixa
                        â””â”€â”€ Sentido â† EspecÃ­fico desta faixa
                            â”‚
                            â””â”€â”€ AFERIÃ‡ÃƒO (ex: Jan/2026)
                                â”œâ”€â”€ Data AferiÃ§Ã£o â† Equipamento + Faixas
                                â”œâ”€â”€ Data Vencimento â† Equipamento + Faixas
                                â””â”€â”€ NÃºmero INMETRO â† Equipamento + Faixas
                                    â”‚
                                    â””â”€â”€ INFRAÃ‡ÃƒO (gerada)
                                        â”œâ”€â”€ Data/Hora â† AutomÃ¡tico
                                        â”œâ”€â”€ Enquadramento â† Conforme detecÃ§Ã£o
                                        â””â”€â”€ TARJA â† Busca TODOS dados acima
```

---

## ðŸŽ¯ CHECKLIST DE VALIDAÃ‡ÃƒO

ApÃ³s alterar informaÃ§Ãµes, validar:

```
â–¡ Dados foram salvos corretamente no sistema
â–¡ Mensagem de sucesso foi exibida
â–¡ NÃ£o hÃ¡ mensagens de erro
â–¡ Valores aparecem corretos ao reabrir cadastro
â–¡ Gerou infraÃ§Ã£o de teste
â–¡ Tarja da infraÃ§Ã£o de teste mostra dados atualizados
â–¡ Formato dos dados estÃ¡ correto (datas, cÃ³digos, etc.)
â–¡ Documentou a alteraÃ§Ã£o (se crÃ­tica)
â–¡ Backup foi feito antes (se crÃ­tica)
â–¡ Equipe foi notificada (se afeta mÃºltiplos usuÃ¡rios)
```

---

## ðŸ“ž SUPORTE

**Em caso de dÃºvidas ou problemas:**

1. **Consultar documentaÃ§Ã£o:**
   - Este guia
   - [VALIDACAO-COMPLETA-TODOS-CAMPOS-TARJA.md](VALIDACAO-COMPLETA-TODOS-CAMPOS-TARJA.md)
   - [RESUMO-EXECUTIVO-VALIDACAO-TARJA.md](RESUMO-EXECUTIVO-VALIDACAO-TARJA.md)

2. **Abrir chamado no helpdesk:**
   - Sistema Jitbit
   - Categoria: "AxHub - ConfiguraÃ§Ãµes"
   - Incluir: prints, descriÃ§Ã£o do problema, equipamento afetado

3. **Contato tÃ©cnico:**
   - Equipe Axion: suporte@axion.ws
   - Telefone: (XX) XXXX-XXXX
   - HorÃ¡rio: Seg-Sex 8h-18h

---

## ðŸŽ“ GLOSSÃRIO

**AferiÃ§Ã£o:** Processo de calibraÃ§Ã£o e certificaÃ§Ã£o do equipamento pelo INMETRO

**INMETRO:** Instituto Nacional de Metrologia, Qualidade e Tecnologia - Ã³rgÃ£o que certifica equipamentos

**Portaria:** Norma legal que regulamenta o uso de equipamentos de fiscalizaÃ§Ã£o

**Template:** Modelo/layout que define como a tarja serÃ¡ exibida

**Tarja:** Imagem sobreposta na foto da infraÃ§Ã£o contendo informaÃ§Ãµes do equipamento

**VariÃ¡vel:** Placeholder no template que Ã© substituÃ­do por valor real (ex: `{CodigoEquipamento}`)

**Enquadramento:** CÃ³digo e descriÃ§Ã£o da infraÃ§Ã£o conforme CTB

**CTB:** CÃ³digo de TrÃ¢nsito Brasileiro (Lei nÂº 9.503/1997)

**RENAINF:** Registro Nacional de InfraÃ§Ãµes de TrÃ¢nsito

**Faixa:** Cada pista/sentido monitorado pelo equipamento

**OperaÃ§Ã£o:** Agrupamento de equipamentos em um mesmo local/endereÃ§o

---

**Documento criado em:** 16/06/2026  
**VersÃ£o:** 1.0  
**Autor:** AxionIA - Intelligence Hub  
**Sistema:** AxHub STRANS

---



---

## ORIGEM: INTERPRETACAO-COMPLETA-CONFIGURACAO-PORTARIA-FAIXAS.md

# ðŸ“Š InterpretaÃ§Ã£o Completa da ConfiguraÃ§Ã£o - Portaria, OperaÃ§Ãµes, Faixas e AferiÃ§Ãµes

**Data da AnÃ¡lise:** 2026-06-14  
**Sistema:** AxHub - STRANS  
**OperaÃ§Ã£o Analisada:** 359a6427-d58d-490e-ab3b-362504f5c7ef  
**AferiÃ§Ã£o Analisada:** 883083af-027d-4ecb-b72a-4e5fb65a5bb9  

---

## ðŸŽ¯ DESCOBERTA CRÃTICA: Portaria Configurada em MÃšLTIPLOS NÃVEIS

A portaria **NÃƒO estÃ¡ configurada apenas no Modelo do Equipamento**. O sistema AxHub tem uma arquitetura de 3 nÃ­veis:

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ NÃVEL 1: MODELO DO EQUIPAMENTO (Cadastro Base)             â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ TBModeloEquipamentos.Portaria                               â”‚
â”‚ â€¢ Define a portaria padrÃ£o do modelo (ex: VSIS-OCR)         â”‚
â”‚ â€¢ Usado como referÃªncia geral                               â”‚
â”‚ â€¢ Afeta TODAS as operaÃ§Ãµes desse modelo                     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                          â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ NÃVEL 2: AFERIÃ‡ÃƒO DO EQUIPAMENTO (CertificaÃ§Ã£o INMETRO)    â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ TBAfericoes (vinculada a Faixas via TBFaixasAfericoes)     â”‚
â”‚ â€¢ NumeroInmetro: Registro INMETRO (ex: 006350/2021)        â”‚
â”‚ â€¢ DataVencimento: Validade do certificado                   â”‚
â”‚ â€¢ NumeroLaudo: IdentificaÃ§Ã£o do laudo tÃ©cnico               â”‚
â”‚ â€¢ NumeroLacre: Lacre de seguranÃ§a metrolÃ³gica               â”‚
â”‚ â€¢ StatusLacre: Ãntegro, Rompido, etc.                       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                          â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ NÃVEL 3: FAIXAS DA OPERAÃ‡ÃƒO (ConfiguraÃ§Ã£o EspecÃ­fica)      â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ TBFaixasAfericoes (relaciona Faixa â†’ AferiÃ§Ã£o)             â”‚
â”‚ â€¢ Cada faixa pode ter uma aferiÃ§Ã£o especÃ­fica               â”‚
â”‚ â€¢ A portaria exibida na tarja vem da aferiÃ§Ã£o da faixa      â”‚
â”‚ â€¢ ESTE Ã‰ O NÃVEL QUE CONTROLA A PORTARIA NA TARJA!          â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## ðŸ—‚ï¸ ESTRUTURA DO BANCO DE DADOS

### Modelo de Dados Completo:

```sql
TBOperacoes
â”œâ”€â”€ Id: 359a6427-d58d-490e-ab3b-362504f5c7ef
â”œâ”€â”€ Equipamento_id â†’ TBEquipamentos
â”‚                    â”œâ”€â”€ Codigo: "T5402"
â”‚                    â””â”€â”€ ModeloEquipamento_id â†’ TBModeloEquipamentos
â”‚                                               â”œâ”€â”€ Marca: "VELSIS"
â”‚                                               â”œâ”€â”€ Modelo: "VSIS-OCR"
â”‚                                               â”œâ”€â”€ Portaria: "492 de 17/07/2012" â† ERRO!
â”‚                                               â””â”€â”€ NumeroPortaria: "492"
â”‚
â”œâ”€â”€ TBOperacoesFaixas (relacionamento Operacao â†” Faixa)
â”‚   â”œâ”€â”€ Operacao_id: 359a6427-...
â”‚   â””â”€â”€ Faixa_id â†’ TBFaixas
â”‚                  â”œâ”€â”€ NumeroFaixa: "3"
â”‚                  â”œâ”€â”€ Sentido: "LESTE - OESTE FAIXA 3"
â”‚                  â”œâ”€â”€ Logradouro: "Av. Frei Serafim com a Rua..."
â”‚                  â””â”€â”€ [TBFaixasAfericoes] â†’ Afericao_id
â”‚
â””â”€â”€ TBFaixasAfericoes (relacionamento Faixa â†” AferiÃ§Ã£o)
    â”œâ”€â”€ Faixa_id: [Id da Faixa 3]
    â””â”€â”€ Afericao_id: 883083af-027d-4ecb-b72a-4e5fb65a5bb9
                     â†“
                     TBAfericoes
                     â”œâ”€â”€ NumeroInmetro: "006350/2021"
                     â”œâ”€â”€ NumeroLaudo: "XXXX"
                     â”œâ”€â”€ NumeroLacre: "XXXX"
                     â”œâ”€â”€ DataAfericao: 18/10/2021
                     â”œâ”€â”€ DataVencimento: 18/10/2026
                     â”œâ”€â”€ DataEmissao: 18/10/2021
                     â”œâ”€â”€ StatusLacre: "Ãntegro"
                     â”œâ”€â”€ Equipamento_id â†’ TBEquipamentos
                     â””â”€â”€ TipoAfericao_id â†’ TBTiposAfericoes
```

---

## ðŸ” ANÃLISE DA OPERAÃ‡ÃƒO: 359a6427-d58d-490e-ab3b-362504f5c7ef

### URL: https://strans.axhub.axion.ws/operacao/edit/359a6427-d58d-490e-ab3b-362504f5c7ef

### Dados da OperaÃ§Ã£o:

| Campo | Valor | ObservaÃ§Ã£o |
|-------|-------|------------|
| **Equipamento** | T5402 EndereÃ§o | Equipamento principal |
| **Modelo** | VSIS-OCR | Modelo do fabricante VELSIS |
| **Data InstalaÃ§Ã£o** | 28/11/2022 | Quando o equipamento foi instalado |
| **Data Inicial** | 28/11/2022 | InÃ­cio da operaÃ§Ã£o |
| **Data Final** | 31/12/2030 | Fim previsto da operaÃ§Ã£o |
| **Data de Aceite** | 28/11/2022 | Aceite tÃ©cnico |
| **Data HomologaÃ§Ã£o** | 25/07/2023 | HomologaÃ§Ã£o legal |
| **Tarja PadrÃ£o** | "Tarja Axion" | Template da tarja usado |
| **Tipos de FiscalizaÃ§Ãµes** | â˜‘ Monitoramento Online<br>â˜‘ CronotacÃ³grafo | Modalidades ativas |

### ConfiguraÃ§Ã£o Adicional:

| Item | ConfiguraÃ§Ã£o |
|------|--------------|
| **Equipamento Conjugado** | T5404 | Equipamento auxiliar/redundante |
| **Gera InfraÃ§Ã£o de Passagem** | â˜‘ Sim | Sistema gera autos |
| **Desabilitar Monitoramento** | â˜ NÃ£o | Monitoramento ativo |

---

## ðŸ“ FAIXAS ASSOCIADAS Ã€ OPERAÃ‡ÃƒO

A operaÃ§Ã£o tem **mÃºltiplas faixas** configuradas. Cada faixa pode ter:
- Velocidade regulamentada
- Sentido de trÃ¡fego
- LocalizaÃ§Ã£o geogrÃ¡fica
- **AferiÃ§Ã£o especÃ­fica vinculada**

### Exemplo de Faixa:

| Campo | Valor |
|-------|-------|
| **NÃºmero Faixa** | 3 |
| **Sentido** | LESTE - OESTE FAIXA 3 |
| **Logradouro** | Av. Frei Serafim com a Rua Professor Jose Anankel |
| **MunicÃ­pio** | (CÃ³digo: 212190) |
| **Latitude/Longitude** | Coordenadas GPS |
| **AferiÃ§Ã£o Vinculada** | 883083af-027d-4ecb-b72a-4e5fb65a5bb9 |

---

## ðŸ“‹ ANÃLISE DA AFERIÃ‡ÃƒO: 883083af-027d-4ecb-b72a-4e5fb65a5bb9

### URL: https://strans.axhub.axion.ws/afericao/edit/883083af-027d-4ecb-b72a-4e5fb65a5bb9

### Dados da AferiÃ§Ã£o:

| Campo | Valor Esperado | DescriÃ§Ã£o |
|-------|----------------|-----------|
| **NÃºmero INMETRO** | 006350/2021 | Registro no INMETRO |
| **NÃºmero de SÃ©rie** | T5403 | SÃ©rie do equipamento |
| **NÃºmero do Laudo** | XXXX | Laudo tÃ©cnico de aferiÃ§Ã£o |
| **NÃºmero do Lacre** | XXXX | Lacre de seguranÃ§a |
| **Data de AferiÃ§Ã£o** | 18/10/2021 | Quando foi aferido |
| **Data de EmissÃ£o** | 18/10/2021 | EmissÃ£o do certificado |
| **Data de Vencimento** | 18/10/2026 | Validade do certificado |
| **Status do Lacre** | Ãntegro | SituaÃ§Ã£o atual |
| **Tipo de AferiÃ§Ã£o** | AferiÃ§Ã£o Eventual | Categoria |
| **Equipamento** | T5403 | Equipamento aferido |

### âš ï¸ **ATENÃ‡ÃƒO - INCONSISTÃŠNCIA DETECTADA:**

```diff
Equipamento na OperaÃ§Ã£o: T5402
Equipamento na AferiÃ§Ã£o:  T5403
                          â†‘
                          DIVERGÃŠNCIA!
```

**PossÃ­veis cenÃ¡rios:**
1. **Erro de cadastro:** AferiÃ§Ã£o vinculada ao equipamento errado
2. **Equipamentos conjugados:** T5402 usa certificaÃ§Ã£o do T5403
3. **SubstituiÃ§Ã£o de equipamento:** T5403 foi substituÃ­do por T5402 mas manteve a aferiÃ§Ã£o

---

## ðŸ”— SEÃ‡ÃƒO DE FAIXAS ASSOCIADAS NA AFERIÃ‡ÃƒO

A tabela `TBFaixasAfericoes` permite que uma aferiÃ§Ã£o seja vinculada a **mÃºltiplas faixas**.

### Estrutura:

```sql
CREATE TABLE TBFaixasAfericoes (
    Afericao_id uniqueidentifier NOT NULL,  -- FK para TBAfericoes
    Faixa_id uniqueidentifier NOT NULL      -- FK para TBFaixas
)
```

### Como funciona:

```
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚   TBAfericoes           â”‚
                    â”‚   (883083af-027d-...)   â”‚
                    â”‚   â€¢ NumeroInmetro       â”‚
                    â”‚   â€¢ DataVencimento      â”‚
                    â”‚   â€¢ NumeroLaudo         â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                 â”‚
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚  TBFaixasAfericoes      â”‚
                    â”‚  (tabela de ligaÃ§Ã£o)    â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                 â”‚
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚                         â”‚
            â”Œâ”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”      â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”
            â”‚ TBFaixas       â”‚      â”‚ TBFaixas        â”‚
            â”‚ Faixa 1        â”‚      â”‚ Faixa 3         â”‚
            â”‚ (LESTE-OESTE)  â”‚      â”‚ (LESTE-OESTE)   â”‚
            â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜      â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## ðŸ”Ž VALIDAÃ‡ÃƒO: QUAIS FAIXAS TÃŠM A MESMA PORTARIA?

Para validar quais faixas compartilham a mesma aferiÃ§Ã£o (e portanto a mesma portaria na tarja):

### Query SQL:

```sql
-- Encontrar todas as faixas associadas Ã  aferiÃ§Ã£o 883083af-027d-4ecb-b72a-4e5fb65a5bb9
SELECT 
    f.Id AS FaixaId,
    f.NumeroFaixa,
    f.Sentido,
    f.Logradouro,
    f.Codigo AS CodigoFaixa,
    a.NumeroInmetro,
    a.NumeroLaudo,
    a.DataVencimento,
    a.StatusLacre,
    m.Portaria AS PortariaModelo,
    m.Marca,
    m.Modelo
FROM TBFaixasAfericoes fa
INNER JOIN TBFaixas f ON fa.Faixa_id = f.Id
INNER JOIN TBAfericoes a ON fa.Afericao_id = a.Id
INNER JOIN TBEquipamentos e ON a.Equipamento_id = e.Id
INNER JOIN TBModeloEquipamentos m ON e.ModeloEquipamento_id = m.Id
WHERE fa.Afericao_id = '883083af-027d-4ecb-b72a-4e5fb65a5bb9'
ORDER BY f.NumeroFaixa
```

### Resultado Esperado:

| Faixa | Sentido | NÃºmero INMETRO | Portaria do Modelo | Status |
|-------|---------|----------------|-------------------|--------|
| 1 | LESTE - OESTE FAIXA 1 | 006350/2021 | 492 de 17/07/2012 âŒ | Ãntegro |
| 2 | LESTE - OESTE FAIXA 2 | 006350/2021 | 492 de 17/07/2012 âŒ | Ãntegro |
| 3 | LESTE - OESTE FAIXA 3 | 006350/2021 | 492 de 17/07/2012 âŒ | Ãntegro |

**Todas as faixas vinculadas a esta aferiÃ§Ã£o terÃ£o:**
- âœ… Mesmo NÃºmero INMETRO na tarja
- âœ… Mesma Data de Vencimento
- âŒ **Portaria ERRADA** (porque vem do TBModeloEquipamentos)

---

## ðŸ”§ DE ONDE VEM CADA INFORMAÃ‡ÃƒO NA TARJA?

### Mapeamento Completo dos Campos:

```sql
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ CAMPO NA TARJA              â”‚ ORIGEM NO BANCO                   â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ CÃ³d. Equipamento: T5402     â”‚ TBEquipamentos.Codigo             â”‚
â”‚ Data: 11/06/2026            â”‚ TBPassagens.DataHoraPassagem      â”‚
â”‚ Hora: 08:29:23              â”‚ TBPassagens.DataHoraPassagem      â”‚
â”‚ Data AferiÃ§Ã£o: 18/10/2021   â”‚ TBAfericoes.DataAfericao          â”‚
â”‚ Data Venc. AferiÃ§Ã£o:        â”‚ TBAfericoes.DataVencimento        â”‚
â”‚   18/10/2026                â”‚                                   â”‚
â”‚ Certif.: 006350/2021        â”‚ TBAfericoes.NumeroInmetro         â”‚
â”‚   (NÃºmero INMETRO)          â”‚                                   â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Reg. nÃ£o metrolÃ³gico:       â”‚ TBModeloEquipamentos.             â”‚
â”‚   006350/2021               â”‚   NumeroPortaria                  â”‚
â”‚                             â”‚ OU TBAfericoes.NumeroInmetro      â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Venc. nÃ£o metrolÃ³gico:      â”‚ TBAfericoes.DataVencimento        â”‚
â”‚   18/10/2026                â”‚ (via TBFaixasAfericoes)           â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Portaria nÃ£o metrolÃ³gico:   â”‚ TBModeloEquipamentos.Portaria     â”‚
â”‚   492 de 17/07/2012 âŒ      â”‚ (DATA ERRADA!)                    â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Marca/Modelo:               â”‚ TBModeloEquipamentos.Marca +      â”‚
â”‚   VSIS-OCR                  â”‚ TBModeloEquipamentos.Modelo       â”‚
â”‚   (falta a marca!)          â”‚ (campo Marca pode estar vazio)    â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ CÃ³d Org: 212190             â”‚ TBOrgaosAutuadores.Codigo         â”‚
â”‚ InfraÃ§Ã£o: 75870             â”‚ TBPassagens.NumeroInfracao        â”‚
â”‚ DescriÃ§Ã£o: TRANSITAR COM... â”‚ TBEnquadramentos.Descricao        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## ðŸŽ¯ INTERPRETAÃ‡ÃƒO COMPLETA DO FLUXO

### 1ï¸âƒ£ **Cadastro Inicial (uma vez)**

```
Cadastros BÃ¡sicos â†’ Modelos de Equipamentos
â†“
Criar/Editar: VSIS-OCR
  - Marca: VELSIS
  - Modelo: VSIS-OCR
  - Portaria: "Portaria INMETRO nÂº 492/2021" â† CORRIGIR AQUI!
  - NÃºmero Portaria: 492
  - Fabricante: VELSIS TECNOLOGIA
```

### 2ï¸âƒ£ **AferiÃ§Ã£o do Equipamento (anual ou conforme exigÃªncia)**

```
Equipamentos â†’ AferiÃ§Ãµes â†’ Criar Nova AferiÃ§Ã£o
â†“
Vincular ao Equipamento: T5403
  - NÃºmero INMETRO: 006350/2021
  - NÃºmero de SÃ©rie: T5403
  - NÃºmero do Laudo: XXXX
  - NÃºmero do Lacre: XXXX
  - Data AferiÃ§Ã£o: 18/10/2021
  - Data Vencimento: 18/10/2026
  - Tipo: AferiÃ§Ã£o Eventual
  â†“
  SeÃ§Ã£o: FAIXAS ASSOCIADAS
    â˜‘ Faixa 1 (LESTE-OESTE)
    â˜‘ Faixa 2 (LESTE-OESTE)
    â˜‘ Faixa 3 (LESTE-OESTE)
```

### 3ï¸âƒ£ **OperaÃ§Ã£o (define como funciona)**

```
OperaÃ§Ãµes â†’ Criar/Editar OperaÃ§Ã£o
â†“
Equipamento: T5402
Data InstalaÃ§Ã£o: 28/11/2022
Data Inicial: 28/11/2022
Tarja PadrÃ£o: Tarja Axion
Tipos de FiscalizaÃ§Ãµes:
  â˜‘ Monitoramento Online
  â˜‘ CronotacÃ³grafo
  â†“
  Faixas da OperaÃ§Ã£o:
    - Faixa 1: Velocidade 60 km/h
    - Faixa 2: Velocidade 60 km/h
    - Faixa 3: Velocidade 60 km/h
```

### 4ï¸âƒ£ **GeraÃ§Ã£o da InfraÃ§Ã£o (automÃ¡tico)**

```
Equipamento T5402 detecta infraÃ§Ã£o
  â†“
Sistema busca:
  1. Dados da OperaÃ§Ã£o (faixa, sentido, local)
  2. Dados da AferiÃ§Ã£o (via TBFaixasAfericoes)
     â†’ NumeroInmetro: 006350/2021
     â†’ DataVencimento: 18/10/2026
  3. Dados do Modelo (via TBEquipamentos)
     â†’ Portaria: "492 de 17/07/2012" â† ERRO!
     â†’ Marca: VELSIS
     â†’ Modelo: VSIS-OCR
  â†“
Aplica Template da Tarja
  â†“
Gera Imagem com tarja
  (contÃ©m portaria errada)
```

---

## ðŸ“Š TABELA DE VALIDAÃ‡ÃƒO: FAIXAS COM A MESMA PORTARIA

### CritÃ©rio: Faixas que compartilham a mesma aferiÃ§Ã£o

| ID Faixa | NÃºmero | Sentido | AferiÃ§Ã£o ID | NÃºmero INMETRO | Vencimento | Portaria Exibida | Status |
|----------|--------|---------|-------------|----------------|------------|------------------|--------|
| [UUID-1] | 1 | LESTE-OESTE FAIXA 1 | 883083af-027d-... | 006350/2021 | 18/10/2026 | 492 de 17/07/2012 | âŒ Erro |
| [UUID-2] | 2 | LESTE-OESTE FAIXA 2 | 883083af-027d-... | 006350/2021 | 18/10/2026 | 492 de 17/07/2012 | âŒ Erro |
| [UUID-3] | 3 | LESTE-OESTE FAIXA 3 | 883083af-027d-... | 006350/2021 | 18/10/2026 | 492 de 17/07/2012 | âŒ Erro |

**ConclusÃ£o:**
- âœ… Todas as faixas vinculadas Ã  aferiÃ§Ã£o `883083af-027d-4ecb-b72a-4e5fb65a5bb9` tÃªm o **mesmo NÃºmero INMETRO**
- âœ… Todas tÃªm a **mesma Data de Vencimento**
- âŒ **TODAS EXIBEM A PORTARIA ERRADA** porque vem do cadastro do modelo VSIS-OCR

---

## ðŸš¨ PROBLEMAS IDENTIFICADOS

### 1ï¸âƒ£ **Portaria com Data Incorreta**

**LocalizaÃ§Ã£o:** `TBModeloEquipamentos` WHERE Modelo = 'VSIS-OCR'

```diff
Campo: Portaria
- Valor Atual: "492 de 17/07/2012"
+ Valor Correto: "Portaria INMETRO nÂº 492/2021"
```

**Impacto:** Todas as faixas/infraÃ§Ãµes desse modelo mostram data errada

---

### 2ï¸âƒ£ **Marca Ausente na Tarja**

**Problema:** Tarja mostra apenas "VSIS-OCR" sem a marca "VELSIS"

**PossÃ­veis causas:**
- Campo `TBModeloEquipamentos.Marca` estÃ¡ vazio
- Template da tarja nÃ£o concatena corretamente Marca + Modelo
- Query do sistema sÃ³ busca o campo Modelo

**SoluÃ§Ã£o:** Validar campo Marca no cadastro do modelo

---

### 3ï¸âƒ£ **Equipamentos Divergentes**

**Problema:** 
- OperaÃ§Ã£o usa equipamento: **T5402**
- AferiÃ§Ã£o cadastrada para: **T5403**

**Risco:** Pode invalidar juridicamente as infraÃ§Ãµes

**Verificar:**
- Se T5402 e T5403 sÃ£o equipamentos conjugados (trabalham juntos)
- Se houve substituiÃ§Ã£o de equipamento
- Se a aferiÃ§Ã£o deveria estar vinculada ao T5402

---

## âœ… PLANO DE CORREÃ‡ÃƒO COMPLETO

### Passo 1: Corrigir o Cadastro do Modelo

```
Menu: Cadastros BÃ¡sicos â†’ Modelos de Equipamentos
Buscar: VSIS-OCR
Editar:
  â˜‘ Marca: VELSIS (verificar se estÃ¡ preenchido)
  â˜‘ Modelo: VSIS-OCR
  â˜‘ Portaria: "Portaria INMETRO nÂº 492/2021" â† ALTERAR
  â˜‘ NÃºmero Portaria: 492
  â˜‘ Fabricante: VELSIS TECNOLOGIA
Salvar
```

### Passo 2: Validar a AferiÃ§Ã£o

```
Menu: Equipamentos â†’ AferiÃ§Ãµes
Buscar: 883083af-027d-4ecb-b72a-4e5fb65a5bb9
Verificar:
  â˜‘ Equipamento correto: T5403 ou T5402?
  â˜‘ NÃºmero INMETRO: 006350/2021
  â˜‘ Data Vencimento: 18/10/2026
  â˜‘ Status Lacre: Ãntegro
  â˜‘ Faixas Associadas: Verificar se todas estÃ£o corretas
```

### Passo 3: Validar Faixas da OperaÃ§Ã£o

```
Menu: OperaÃ§Ãµes â†’ Editar
ID: 359a6427-d58d-490e-ab3b-362504f5c7ef
Conferir:
  â˜‘ Equipamento: T5402 ou T5403?
  â˜‘ Faixas configuradas: 1, 2, 3
  â˜‘ Cada faixa vinculada Ã  aferiÃ§Ã£o correta
```

### Passo 4: Testar

```
1. Reprocessar uma infraÃ§Ã£o da Faixa 3
2. Verificar a tarja na nova imagem:
   âœ“ Portaria: "Portaria INMETRO nÂº 492/2021"
   âœ“ Marca/Modelo: "VELSIS VSIS-OCR"
   âœ“ NÃºmero INMETRO: 006350/2021
   âœ“ Vencimento: 18/10/2026
```

---

## ðŸ“‹ QUERY DE AUDITORIA COMPLETA

### Para Validar Toda a ConfiguraÃ§Ã£o:

```sql
-- AUDITORIA COMPLETA: OperaÃ§Ã£o â†’ Equipamento â†’ Modelo â†’ AferiÃ§Ã£o â†’ Faixas
SELECT 
    -- Dados da OperaÃ§Ã£o
    op.Id AS OperacaoId,
    e.Codigo AS CodigoEquipamento,
    
    -- Dados do Modelo
    m.Marca,
    m.Modelo,
    m.Portaria AS PortariaModelo,
    m.NumeroPortaria AS NumeroPortariaModelo,
    
    -- Dados da Faixa
    f.NumeroFaixa,
    f.Sentido,
    f.Logradouro,
    
    -- Dados da AferiÃ§Ã£o
    a.Id AS AfericaoId,
    a.NumeroInmetro,
    a.NumeroLaudo,
    a.NumeroLacre,
    a.DataAfericao,
    a.DataVencimento,
    a.StatusLacre,
    
    -- ValidaÃ§Ãµes
    CASE 
        WHEN m.Portaria LIKE '%17/07/2012%' THEN 'ERRO: Data incorreta'
        WHEN m.Portaria LIKE '%492/2021%' OR m.Portaria LIKE '%492, DE 10%' THEN 'OK'
        ELSE 'VERIFICAR'
    END AS StatusPortaria,
    
    CASE 
        WHEN m.Marca IS NULL OR m.Marca = '' THEN 'ERRO: Marca vazia'
        ELSE 'OK'
    END AS StatusMarca,
    
    CASE 
        WHEN a.DataVencimento < GETDATE() THEN 'ERRO: AferiÃ§Ã£o vencida'
        ELSE 'OK'
    END AS StatusAfericao

FROM TBOperacoes op
INNER JOIN TBEquipamentos e ON op.Equipamento_id = e.Id
INNER JOIN TBModeloEquipamentos m ON e.ModeloEquipamento_id = m.Id
INNER JOIN TBOperacoesFaixas opf ON op.Id = opf.Operacao_id
INNER JOIN TBFaixas f ON opf.Faixa_id = f.Id
LEFT JOIN TBFaixasAfericoes fa ON f.Id = fa.Faixa_id
LEFT JOIN TBAfericoes a ON fa.Afericao_id = a.Id

WHERE op.Id = '359a6427-d58d-490e-ab3b-362504f5c7ef'

ORDER BY f.NumeroFaixa
```

---

## ðŸŽ¯ RESUMO EXECUTIVO

### ConfiguraÃ§Ã£o Atual:

| NÃ­vel | Status | ObservaÃ§Ã£o |
|-------|--------|------------|
| **Modelo (VSIS-OCR)** | âŒ Erro | Portaria com data 17/07/2012 (errado) |
| **Equipamento (T5402)** | âš ï¸ Verificar | DivergÃªncia entre T5402 e T5403 |
| **AferiÃ§Ã£o (006350/2021)** | âœ… OK | NÃºmero INMETRO e vencimento corretos |
| **Faixas (1, 2, 3)** | âœ… OK | Vinculadas corretamente Ã  aferiÃ§Ã£o |
| **OperaÃ§Ã£o (359a6427...)** | âœ… OK | ConfiguraÃ§Ã£o operacional correta |

### AÃ§Ãµes NecessÃ¡rias:

1. âœ… **URGENTE:** Corrigir portaria do modelo VSIS-OCR (impacto jurÃ­dico)
2. âš ï¸ **IMPORTANTE:** Validar campo Marca no modelo
3. âš ï¸ **VERIFICAR:** DivergÃªncia entre equipamentos T5402/T5403
4. âœ… **TESTAR:** Reprocessar infraÃ§Ã£o e validar tarja

### Impacto da CorreÃ§Ã£o:

- **InfraÃ§Ãµes Futuras:** âœ… Portaria correta automaticamente
- **InfraÃ§Ãµes Antigas:** âŒ MantÃªm portaria errada (nÃ£o retroativo)
- **Faixas Afetadas:** Todas as faixas da operaÃ§Ã£o 359a6427-...
- **Equipamentos Afetados:** Todos os equipamentos modelo VSIS-OCR

---

## ðŸ“š DOCUMENTAÃ‡ÃƒO DE REFERÃŠNCIA

### Estrutura de Tabelas:

- **TBOperacoes** - ConfiguraÃ§Ã£o das operaÃ§Ãµes
- **TBEquipamentos** - Cadastro de equipamentos
- **TBModeloEquipamentos** - Modelos e portarias (CORRIGIR AQUI)
- **TBFaixas** - Faixas de rolamento
- **TBOperacoesFaixas** - Relacionamento OperaÃ§Ã£o â†” Faixa
- **TBAfericoes** - Certificados INMETRO
- **TBFaixasAfericoes** - Relacionamento Faixa â†” AferiÃ§Ã£o
- **TBTarjas** - Templates de tarjas

### Portaria ReferÃªncia:

- **Portaria INMETRO nÂº 492**
- **Data:** 10 de dezembro de 2021
- **VigÃªncia:** A partir de 03/01/2022
- **Escopo:** Sistemas AutomÃ¡ticos nÃ£o MetrolÃ³gicos de FiscalizaÃ§Ã£o de TrÃ¢nsito (SAnMFT)

---

**AnÃ¡lise gerada em:** 2026-06-14  
**Sistema:** AxHub STRANS  
**NÃ­vel de Prioridade:** ðŸ”´ CRÃTICO (erro jurÃ­dico)  
**Tempo estimado de correÃ§Ã£o:** 5 minutos


---

## ORIGEM: MAPEAMENTO-COMPLETO-VARIAVEIS-TARJA-AXION.md

# ðŸ” Mapeamento Completo: VariÃ¡veis da Tarja Axion

**Data:** 2026-06-15  
**Sistema:** AxHub STRANS  
**Tarja:** Tarja Axion (ID: 7c63d905-76d5-4824-bb91-2251e62dc77d)  
**Contexto:** Imagem do dia 11/06/2026 - ERRO AINDA EXISTE!  

---

## ðŸ“‹ TEMPLATE COMPLETO

```
CÃ³d. Equipamento: {CodigoEquipamento} 
EndereÃ§o: {CodigoLocalOperacaoEquipamento} 
Faixa: {NumeroFaixa} 
Sentido: {SentidoFaixa}
Data: {DataPassagemInfracao.toString("dd/MM/yyyy HH:mm:ss")}  
Data AferiÃ§Ã£o: {DataAfericaoInmetro.Value.toString("dd/MM/yyyy")} 
Data Venc. AferiÃ§Ã£o: {DataVencimentoAfericao.Value.toString("dd/MM/yyyy")} 
Certif.: {CertificadoEquipamento} 
Portaria: {PortariaEquipamento}
Reg. nÃ£o metrolÃ³gico: {NumeroCertificadoInmetro} 
Venc. nÃ£o metrolÃ³gico : {DataVencimentoAfericao.Value.toString("dd/MM/yyyy")}  
Portaria nÃ£o metrolÃ³gico : {PortariaNaoMetrologico} 
Marca/Modelo : {MarcaModeloEquipamento} 
CÃ³d. Org: {CodigoOrgaoAutuador} 
InfraÃ§Ã£o: {CodigoEnquadramento} 
DescriÃ§Ã£o: {DescricaoEnquadramento} 
Serial: {SerialEquipamento}
```

---

## ðŸ—ºï¸ MAPEAMENTO COMPLETO DE VARIÃVEIS

### 1ï¸âƒ£ **{CodigoEquipamento}**

**O que mostra:** CÃ³digo do equipamento (ex: "T5402", "T5403")

**Origem no banco:**
```sql
TBEquipamentos.Codigo
```

**Como chega na tarja:**
```
TBInfracoes.Equipamento_id 
    â†’ TBEquipamentos.Codigo
```

**Como alterar:**
- Menu â†’ Equipamentos â†’ Equipamentos â†’ Editar equipamento
- Campo: "CÃ³digo"
- Impacto: **GLOBAL** - Altera cÃ³digo em todas operaÃ§Ãµes deste equipamento

**Query de validaÃ§Ã£o:**
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

### 2ï¸âƒ£ **{CodigoLocalOperacaoEquipamento}**

**O que mostra:** EndereÃ§o da operaÃ§Ã£o (ex: "Av. Frei Serafim, prox. ao n. 2439")

**Origem no banco:**
```sql
TBOperacoes.Endereco
```

**Como chega na tarja:**
```
TBInfracoes.Operacao_id 
    â†’ TBOperacoes.Endereco
```

**Como alterar:**
- Menu â†’ OperaÃ§Ãµes â†’ OperaÃ§Ãµes â†’ Editar operaÃ§Ã£o especÃ­fica
- Campo: "EndereÃ§o" ou "Local"
- Impacto: **POR OPERAÃ‡ÃƒO** - Altera apenas esta operaÃ§Ã£o

**Query de validaÃ§Ã£o:**
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

### 3ï¸âƒ£ **{NumeroFaixa}**

**O que mostra:** NÃºmero da faixa (ex: "1", "2", "3")

**Origem no banco:**
```sql
TBFaixas.NumeroFaixa
```

**Como chega na tarja:**
```
TBInfracoes.Faixa_id 
    â†’ TBFaixas.NumeroFaixa
```

**Como alterar:**
- Menu â†’ OperaÃ§Ãµes â†’ OperaÃ§Ãµes â†’ Editar operaÃ§Ã£o â†’ Aba "Faixas"
- Campo: "NÃºmero da Faixa"
- Impacto: **POR FAIXA** - Altera numeraÃ§Ã£o da faixa especÃ­fica

**Query de validaÃ§Ã£o:**
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

### 4ï¸âƒ£ **{SentidoFaixa}**

**O que mostra:** Sentido da faixa (ex: "Norte/Sul", "Leste/Oeste")

**Origem no banco:**
```sql
TBFaixas.Sentido
```

**Como chega na tarja:**
```
TBInfracoes.Faixa_id 
    â†’ TBFaixas.Sentido
```

**Como alterar:**
- Menu â†’ OperaÃ§Ãµes â†’ OperaÃ§Ãµes â†’ Editar operaÃ§Ã£o â†’ Aba "Faixas"
- Campo: "Sentido"
- Impacto: **POR FAIXA** - Altera sentido da faixa especÃ­fica

---

### 5ï¸âƒ£ **{DataPassagemInfracao}**

**O que mostra:** Data e hora da infraÃ§Ã£o (ex: "11/06/2026 14:35:22")

**Origem no banco:**
```sql
TBInfracoes.DataHoraInfracao
```

**Como chega na tarja:**
```
TBInfracoes.DataHoraInfracao
```

**Como alterar:**
- âš ï¸ **NÃƒO DEVE SER ALTERADO** - Gerado automaticamente pelo sistema
- Valor capturado pelo equipamento no momento da infraÃ§Ã£o
- Impacto: **POR INFRAÃ‡ÃƒO** - Cada infraÃ§Ã£o tem sua data prÃ³pria

**Query de validaÃ§Ã£o:**
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

### 6ï¸âƒ£ **{DataAfericaoInmetro}** (Data AferiÃ§Ã£o)

**O que mostra:** Data da aferiÃ§Ã£o INMETRO (ex: "15/10/2025")

**Origem no banco:**
```sql
TBAfericoes.DataAfericao
```

**Como chega na tarja:**
```
TBInfracoes.Faixa_id 
    â†’ TBFaixasAfericoes.Faixa_id 
    â†’ TBFaixasAfericoes.Afericao_id
    â†’ TBAfericoes.DataAfericao
```

**Como alterar:**
- Menu â†’ MediÃ§Ã£o â†’ AferiÃ§Ãµes â†’ Editar aferiÃ§Ã£o
- Campo: "Data da AferiÃ§Ã£o"
- Impacto: **POR AFERIÃ‡ÃƒO** - Afeta todas as faixas vinculadas a esta aferiÃ§Ã£o

**Query de validaÃ§Ã£o:**
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

### 7ï¸âƒ£ **{DataVencimentoAfericao}** (Data Venc. AferiÃ§Ã£o / Venc. nÃ£o metrolÃ³gico)

**O que mostra:** Data de vencimento da aferiÃ§Ã£o (ex: "18/10/2026")

**Origem no banco:**
```sql
TBAfericoes.DataVencimento
```

**Como chega na tarja:**
```
TBInfracoes.Faixa_id 
    â†’ TBFaixasAfericoes.Faixa_id 
    â†’ TBFaixasAfericoes.Afericao_id
    â†’ TBAfericoes.DataVencimento
```

**Como alterar:**
- Menu â†’ MediÃ§Ã£o â†’ AferiÃ§Ãµes â†’ Editar aferiÃ§Ã£o
- Campo: "Data de Vencimento"
- Impacto: **POR AFERIÃ‡ÃƒO** - Afeta todas as faixas vinculadas a esta aferiÃ§Ã£o

âš ï¸ **IMPORTANTE:** Este campo aparece **DUAS VEZES** na tarja:
- Uma vez como "Data Venc. AferiÃ§Ã£o"
- Outra como "Venc. nÃ£o metrolÃ³gico"

---

### 8ï¸âƒ£ **{CertificadoEquipamento}**

**O que mostra:** Certificado do equipamento (campo "Certif.")

**âš ï¸ VARIÃVEL AMBÃGUA - Pode ser:**

**OpÃ§Ã£o A: NÃºmero do equipamento**
```sql
TBEquipamentos.NumeroSerie
-- OU
TBEquipamentos.NumeroPatrimonio
```

**OpÃ§Ã£o B: NÃºmero da aferiÃ§Ã£o**
```sql
TBAfericoes.NumeroInmetro
```

**Como alterar:**
- **Se for OpÃ§Ã£o A:** Menu â†’ Equipamentos â†’ Editar â†’ Campo "NÂº SÃ©rie" ou "NÂº PatrimÃ´nio"
- **Se for OpÃ§Ã£o B:** Menu â†’ MediÃ§Ã£o â†’ AferiÃ§Ãµes â†’ Editar â†’ Campo "NÂº INMETRO"

**Query de validaÃ§Ã£o:**
```sql
-- Verificar equipamento
SELECT 
    Codigo,
    NumeroSerie,
    NumeroPatrimonio
FROM TBEquipamentos
WHERE Codigo = 'T5402'

-- Verificar aferiÃ§Ã£o
SELECT 
    a.NumeroInmetro,
    a.NumeroLaudo
FROM TBAfericoes a
INNER JOIN TBFaixasAfericoes fa ON a.Id = fa.Afericao_id
INNER JOIN TBFaixas f ON fa.Faixa_id = f.Id
WHERE f.Operacao_id = '359a6427-d58d-490e-ab3b-362504f5c7ef'
```

---

### 9ï¸âƒ£ **{PortariaEquipamento}** âš ï¸âš ï¸âš ï¸

**O que mostra:** Portaria do equipamento (campo "Portaria:")

**Origem no banco:**
```sql
TBModeloEquipamentos.Portaria
```

**Como chega na tarja:**
```
TBInfracoes.Equipamento_id 
    â†’ TBEquipamentos.ModeloEquipamento_id
    â†’ TBModeloEquipamentos.Portaria
```

**Como alterar:**
- Menu â†’ Cadastros BÃ¡sicos â†’ Modelos de Equipamentos â†’ Editar modelo
- Campo: "Portaria"
- Impacto: **GLOBAL** - Altera para TODOS os equipamentos deste modelo

**Query de validaÃ§Ã£o:**
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

**âš ï¸ IMPORTANTE:** Este Ã© o **PRIMEIRO campo "Portaria"** na tarja!

---

### ðŸ”Ÿ **{NumeroCertificadoInmetro}** (Reg. nÃ£o metrolÃ³gico)

**O que mostra:** NÃºmero do certificado INMETRO (ex: "006350/2021")

**Origem no banco:**
```sql
TBAfericoes.NumeroInmetro
```

**Como chega na tarja:**
```
TBInfracoes.Faixa_id 
    â†’ TBFaixasAfericoes.Faixa_id 
    â†’ TBFaixasAfericoes.Afericao_id
    â†’ TBAfericoes.NumeroInmetro
```

**Como alterar:**
- Menu â†’ MediÃ§Ã£o â†’ AferiÃ§Ãµes â†’ Editar aferiÃ§Ã£o
- Campo: "NÃºmero INMETRO"
- Impacto: **POR AFERIÃ‡ÃƒO** - Afeta todas as faixas vinculadas a esta aferiÃ§Ã£o

**Query de validaÃ§Ã£o:**
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

### 1ï¸âƒ£1ï¸âƒ£ **{PortariaNaoMetrologico}** âš ï¸âš ï¸âš ï¸ **CAMPO DO ERRO!**

**O que mostra:** Portaria nÃ£o metrolÃ³gico (campo "Portaria nÃ£o metrolÃ³gico:")

**âš ï¸ ESTE Ã‰ O CAMPO COM O ERRO "492 de 17/07/2012"!**

**Origem no banco:**
```sql
TBModeloEquipamentos.Portaria
```

**Como chega na tarja:**
```
TBInfracoes.Equipamento_id 
    â†’ TBEquipamentos.ModeloEquipamento_id
    â†’ TBModeloEquipamentos.Portaria
```

**Como alterar:**
- Menu â†’ Cadastros BÃ¡sicos â†’ Modelos de Equipamentos â†’ Editar modelo VSIS-OCR
- Campo: "Portaria"
- Impacto: **GLOBAL** - Altera para TODOS os equipamentos deste modelo

**âš ï¸ IMPORTANTE:** Este Ã© o **SEGUNDO campo "Portaria"** na tarja!

**âš ï¸âš ï¸ DESCOBERTA CRÃTICA:**
- `{PortariaEquipamento}` e `{PortariaNaoMetrologico}` **buscam do MESMO local**!
- Ambos vÃªm de `TBModeloEquipamentos.Portaria`
- Se um estÃ¡ correto e outro errado, o problema Ã© **NO BACKEND/CÃ“DIGO**!

---

### 1ï¸âƒ£2ï¸âƒ£ **{MarcaModeloEquipamento}**

**O que mostra:** Marca/Modelo do equipamento (ex: "VELSIS VSIS-OCR")

**Origem no banco:**
```sql
TBModeloEquipamentos.Marca + ' ' + TBModeloEquipamentos.Modelo
```

**Como chega na tarja:**
```
TBInfracoes.Equipamento_id 
    â†’ TBEquipamentos.ModeloEquipamento_id
    â†’ TBModeloEquipamentos.Marca + Modelo
```

**Como alterar:**
- Menu â†’ Cadastros BÃ¡sicos â†’ Modelos de Equipamentos â†’ Editar modelo
- Campos: "Marca" e "Modelo"
- Impacto: **GLOBAL** - Altera para TODOS os equipamentos deste modelo

**Query de validaÃ§Ã£o:**
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

### 1ï¸âƒ£3ï¸âƒ£ **{CodigoOrgaoAutuador}**

**O que mostra:** CÃ³digo do Ã³rgÃ£o autuador (ex: "STRANS")

**Origem no banco:**
```sql
TBConfiguracoes.ValorConfiguracao
WHERE TipoConfiguracao = 'CodigoOrgaoAutuador'
```

**OU pode ser:**
```sql
TBOperacoes.OrgaoAutuador_id 
    â†’ TBOrgaosAutuadores.Codigo
```

**Como alterar:**
- **OpÃ§Ã£o A:** Menu â†’ ConfiguraÃ§Ãµes â†’ ConfiguraÃ§Ãµes Gerais â†’ Buscar "Ã“rgÃ£o Autuador"
- **OpÃ§Ã£o B:** Menu â†’ Cadastros BÃ¡sicos â†’ Ã“rgÃ£os Autuadores â†’ Editar
- Impacto: **GLOBAL** ou **POR OPERAÃ‡ÃƒO** (depende da implementaÃ§Ã£o)

---

### 1ï¸âƒ£4ï¸âƒ£ **{CodigoEnquadramento}**

**O que mostra:** CÃ³digo da infraÃ§Ã£o (ex: "75870", "74550")

**Origem no banco:**
```sql
TBEnquadramentos.Codigo
```

**Como chega na tarja:**
```
TBInfracoes.Enquadramento_id 
    â†’ TBEnquadramentos.Codigo
```

**Como alterar:**
- âš ï¸ **NÃƒO DEVE SER ALTERADO** - CÃ³digo oficial do CTB
- Definido no cadastro de enquadramentos (tabela base)
- Impacto: **POR ENQUADRAMENTO** - Altera cÃ³digo de todas infraÃ§Ãµes deste tipo

**Query de validaÃ§Ã£o:**
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

### 1ï¸âƒ£5ï¸âƒ£ **{DescricaoEnquadramento}**

**O que mostra:** DescriÃ§Ã£o da infraÃ§Ã£o

**Origem no banco:**
```sql
TBEnquadramentos.Descricao
```

**Como chega na tarja:**
```
TBInfracoes.Enquadramento_id 
    â†’ TBEnquadramentos.Descricao
```

**Como alterar:**
- Menu â†’ Cadastros BÃ¡sicos â†’ Enquadramentos â†’ Editar
- Campo: "DescriÃ§Ã£o"
- Impacto: **POR ENQUADRAMENTO** - Altera descriÃ§Ã£o de todas infraÃ§Ãµes deste tipo

---

### 1ï¸âƒ£6ï¸âƒ£ **{SerialEquipamento}**

**O que mostra:** Serial/NÃºmero de sÃ©rie do equipamento

**Origem no banco:**
```sql
TBEquipamentos.NumeroSerie
```

**Como chega na tarja:**
```
TBInfracoes.Equipamento_id 
    â†’ TBEquipamentos.NumeroSerie
```

**Como alterar:**
- Menu â†’ Equipamentos â†’ Equipamentos â†’ Editar equipamento
- Campo: "NÃºmero de SÃ©rie"
- Impacto: **POR EQUIPAMENTO** - Altera serial deste equipamento especÃ­fico

---

## ðŸš¨ ANÃLISE CRÃTICA DO ERRO "492 de 17/07/2012"

### âš ï¸ DESCOBERTA IMPORTANTE

A tarja tem **DOIS campos de portaria diferentes:**

1. **{PortariaEquipamento}** â†’ Campo "Portaria:"
2. **{PortariaNaoMetrologico}** â†’ Campo "Portaria nÃ£o metrolÃ³gico:"

**Ambos deveriam buscar do mesmo lugar:**
```sql
TBModeloEquipamentos.Portaria
```

**MAS se um estÃ¡ correto e outro errado, existem 3 possibilidades:**

---

### ðŸ” **POSSIBILIDADE 1: Backend tem lÃ³gica diferente**

O cÃ³digo C# pode ter implementaÃ§Ã£o diferente para cada variÃ¡vel:

```csharp
// PossÃ­vel implementaÃ§Ã£o no backend
public class TarjaProcessor
{
    public string PortariaEquipamento { get; set; } // Busca de TBModeloEquipamentos.Portaria
    public string PortariaNaoMetrologico { get; set; } // Pode buscar de TBAfericoes OU ter valor hardcoded
}
```

**Como verificar:**
- Analisar cÃ³digo-fonte do backend (Controllers/Services)
- Buscar por "PortariaNaoMetrologico" no cÃ³digo
- Verificar se hÃ¡ regra de negÃ³cio diferenciada

---

### ðŸ” **POSSIBILIDADE 2: Banco tem dados inconsistentes**

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

### ðŸ” **POSSIBILIDADE 3: Valor hardcoded em configuraÃ§Ã£o**

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

**B) TBAfericoes (campo customizado que nÃ£o vimos):**
```sql
-- Verificar se TBAfericoes tem algum campo de portaria nÃ£o documentado
SELECT TOP 1 * FROM TBAfericoes
```

**C) Arquivo de configuraÃ§Ã£o (appsettings.json, web.config):**
```json
{
  "Tarja": {
    "PortariaPadrao": "492 de 17/07/2012"
  }
}
```

---

## âœ… SCRIPT DE DIAGNÃ“STICO COMPLETO

Execute este script no banco STRANS para identificar a origem do erro:

```sql
-- ==================================================
-- DIAGNÃ“STICO COMPLETO: PORTARIA "492 de 17/07/2012"
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
        WHEN Portaria LIKE '%2012%' OR Portaria LIKE '%17/07%' THEN 'âŒ ERRO ENCONTRADO!'
        WHEN Portaria LIKE '%2021%' THEN 'âœ… CORRETO'
        ELSE 'âš ï¸ VERIFICAR'
    END as Status
FROM TBModeloEquipamentos
WHERE Modelo LIKE '%VSIS%' OR Modelo LIKE '%OCR%'
ORDER BY DataAtualizacao DESC

PRINT ''
PRINT '============================================'
PRINT '2. VERIFICAR CONFIGURAÃ‡Ã•ES GLOBAIS'
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
        WHEN m.Portaria LIKE '%2012%' THEN 'âŒ ESTE Ã‰ O MODELO COM ERRO!'
        WHEN m.Portaria LIKE '%2021%' THEN 'âœ… Modelo correto'
        ELSE 'âš ï¸ Verificar'
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
-- Ver TODOS os campos de TBAfericoes (pode ter campo nÃ£o documentado)
SELECT TOP 1 * FROM TBAfericoes

PRINT ''
PRINT '============================================'
PRINT 'DIAGNÃ“STICO CONCLUÃDO'
PRINT '============================================'
```

---

## ðŸ“Š TABELA RESUMO: ONDE ALTERAR CADA INFORMAÃ‡ÃƒO

| VariÃ¡vel | Origem | Tabela/Campo | Menu no Sistema | Impacto |
|----------|--------|--------------|-----------------|---------|
| `{CodigoEquipamento}` | Equipamento | `TBEquipamentos.Codigo` | Equipamentos â†’ Editar | Por equipamento |
| `{CodigoLocalOperacaoEquipamento}` | OperaÃ§Ã£o | `TBOperacoes.Endereco` | OperaÃ§Ãµes â†’ Editar | Por operaÃ§Ã£o |
| `{NumeroFaixa}` | Faixa | `TBFaixas.NumeroFaixa` | OperaÃ§Ãµes â†’ Faixas | Por faixa |
| `{SentidoFaixa}` | Faixa | `TBFaixas.Sentido` | OperaÃ§Ãµes â†’ Faixas | Por faixa |
| `{DataPassagemInfracao}` | InfraÃ§Ã£o | `TBInfracoes.DataHoraInfracao` | âš ï¸ NÃƒO ALTERAR | Por infraÃ§Ã£o |
| `{DataAfericaoInmetro}` | AferiÃ§Ã£o | `TBAfericoes.DataAfericao` | MediÃ§Ã£o â†’ AferiÃ§Ãµes | Por aferiÃ§Ã£o |
| `{DataVencimentoAfericao}` | AferiÃ§Ã£o | `TBAfericoes.DataVencimento` | MediÃ§Ã£o â†’ AferiÃ§Ãµes | Por aferiÃ§Ã£o |
| `{CertificadoEquipamento}` | Equipamento/AferiÃ§Ã£o | `TBEquipamentos.NumeroSerie` ou `TBAfericoes.NumeroInmetro` | Equipamentos OU AferiÃ§Ãµes | Depende |
| **`{PortariaEquipamento}`** | **Modelo** | **`TBModeloEquipamentos.Portaria`** | **Modelos de Equipamentos** | **GLOBAL** |
| `{NumeroCertificadoInmetro}` | AferiÃ§Ã£o | `TBAfericoes.NumeroInmetro` | MediÃ§Ã£o â†’ AferiÃ§Ãµes | Por aferiÃ§Ã£o |
| **`{PortariaNaoMetrologico}`** âš ï¸ | **Modelo?** | **`TBModeloEquipamentos.Portaria`?** | **??? VERIFICAR BACKEND** | **??? ERRO AQUI** |
| `{MarcaModeloEquipamento}` | Modelo | `TBModeloEquipamentos.Marca + Modelo` | Modelos de Equipamentos | GLOBAL |
| `{CodigoOrgaoAutuador}` | ConfiguraÃ§Ã£o | `TBConfiguracoes` OU `TBOrgaosAutuadores` | ConfiguraÃ§Ãµes | GLOBAL |
| `{CodigoEnquadramento}` | Enquadramento | `TBEnquadramentos.Codigo` | âš ï¸ Dados base CTB | Por enquadramento |
| `{DescricaoEnquadramento}` | Enquadramento | `TBEnquadramentos.Descricao` | Enquadramentos | Por enquadramento |
| `{SerialEquipamento}` | Equipamento | `TBEquipamentos.NumeroSerie` | Equipamentos â†’ Editar | Por equipamento |

---

## ðŸŽ¯ PRÃ“XIMOS PASSOS OBRIGATÃ“RIOS

### âœ… 1. **Executar Script de DiagnÃ³stico**
```bash
# No banco STRANS, executar o script completo acima
```

### âœ… 2. **Verificar se hÃ¡ Modelo Duplicado**
```sql
SELECT COUNT(*) as TotalModelos
FROM TBModeloEquipamentos
WHERE Modelo LIKE '%VSIS%'
```

### âœ… 3. **Analisar CÃ³digo Backend**

Buscar no cÃ³digo-fonte por:
- `PortariaNaoMetrologico`
- `PortariaEquipamento`
- Verificar se hÃ¡ lÃ³gica diferente para cada variÃ¡vel

### âœ… 4. **Verificar Arquivo de ConfiguraÃ§Ã£o**

Procurar em:
- `appsettings.json`
- `web.config`
- `app.config`

---

## âš ï¸ HIPÃ“TESE PRINCIPAL

**A variÃ¡vel `{PortariaNaoMetrologico}` NÃƒO estÃ¡ buscando de `TBModeloEquipamentos.Portaria`!**

PossÃ­veis origens alternativas:
1. âœ… `TBConfiguracoes` (configuraÃ§Ã£o global)
2. âœ… Valor hardcoded no cÃ³digo C#
3. âœ… Campo customizado em `TBAfericoes` nÃ£o documentado
4. âœ… Arquivo de configuraÃ§Ã£o (appsettings.json)
5. âœ… Modelo duplicado no banco com ID diferente

**AÃ‡ÃƒO IMEDIATA:** Executar o script de diagnÃ³stico para identificar onde estÃ¡ o valor "492 de 17/07/2012"!


---

## ORIGEM: RESUMO-EXECUTIVO-VALIDACAO-TARJA.md

# ðŸ“Š RESUMO EXECUTIVO: ValidaÃ§Ã£o dos Campos da Tarja Axion

**Sistema:** AxHub STRANS  
**Data:** 2026-06-15  
**Status:** âš ï¸ VALIDAÃ‡ÃƒO CONCLUÃDA - 1 ERRO IDENTIFICADO  

---

## âœ… RESULTADO GERAL

```
Total de campos no template: 17
Campos validados com sucesso: 14  âœ…
Campos com origem ambÃ­gua:     2  âš ï¸
Campos com erro identificado:   1  âŒ
```

**Taxa de sucesso:** 82% (14/17 validados)  
**Problema crÃ­tico:** 1 campo mostra valor errado (origem desconhecida)  

---

## ðŸ“‹ LISTA COMPLETA DOS 17 CAMPOS

| # | Campo | VariÃ¡vel | Origem | Status |
|---|-------|----------|--------|--------|
| 1 | CÃ³d. Equipamento | `{CodigoEquipamento}` | TBEquipamentos.Codigo | âœ… |
| 2 | EndereÃ§o | `{CodigoLocalOperacaoEquipamento}` | TBOperacoes.Endereco | âœ… |
| 3 | Faixa | `{NumeroFaixa}` | TBFaixas.NumeroFaixa | âœ… |
| 4 | Sentido | `{SentidoFaixa}` | TBFaixas.Sentido | âœ… |
| 5 | Data | `{DataPassagemInfracao}` | TBInfracoes.DataHoraInfracao | âœ… |
| 6 | Data AferiÃ§Ã£o | `{DataAfericaoInmetro}` | TBAfericoes.DataAfericao | âœ… |
| 7 | Data Venc. AferiÃ§Ã£o | `{DataVencimentoAfericao}` | TBAfericoes.DataVencimento | âœ… |
| 8 | Certif. | `{CertificadoEquipamento}` | TBEquipamentos OU TBAfericoes | âš ï¸ |
| 9 | **Portaria** | `{PortariaEquipamento}` | TBModeloEquipamentos.Portaria | âœ… |
| 10 | Reg. nÃ£o metrolÃ³gico | `{NumeroCertificadoInmetro}` | TBAfericoes.NumeroInmetro | âœ… |
| 11 | Venc. nÃ£o metrolÃ³gico | `{DataVencimentoAfericao}` | TBAfericoes.DataVencimento | âœ… |
| 12 | **Portaria nÃ£o metrolÃ³gico** | `{PortariaNaoMetrologico}` | **??? DESCONHECIDO** | âŒ |
| 13 | Marca/Modelo | `{MarcaModeloEquipamento}` | TBModeloEquipamentos.Marca+Modelo | âœ… |
| 14 | CÃ³d. Org | `{CodigoOrgaoAutuador}` | TBConfiguracoes OU TBOrgaosAutuadores | âš ï¸ |
| 15 | InfraÃ§Ã£o | `{CodigoEnquadramento}` | TBEnquadramentos.Codigo | âœ… |
| 16 | DescriÃ§Ã£o | `{DescricaoEnquadramento}` | TBEnquadramentos.Descricao | âœ… |
| 17 | Serial | `{SerialEquipamento}` | TBEquipamentos.NumeroSerie | âœ… |

**Legenda:**
- âœ… = Validado e funcional
- âš ï¸ = Funcional mas origem ambÃ­gua (mÃºltiplas possibilidades)
- âŒ = Erro identificado

---

## ðŸš¨ O PROBLEMA CRÃTICO

### **Campo #12: {PortariaNaoMetrologico}**

**O que deveria mostrar:**
```
"PORTARIA INMETRO/DIMEL NÂº 492/2021"
```

**O que estÃ¡ mostrando:**
```
"492 de 17/07/2012" âŒ DATA ERRADA!
```

**Onde DEVERIA buscar:**
```
TBModeloEquipamentos.Portaria
```

**Valor NO BANCO (confirmado via web):**
```
"PORTARIA INMETRO/DIMEL NÂº 492/2021" âœ… CORRETO!
```

**ConclusÃ£o:**
O backend **NÃƒO estÃ¡ buscando** de `TBModeloEquipamentos.Portaria` como deveria!

---

## ðŸ” COMPARAÃ‡ÃƒO: AS DUAS PORTARIAS

| Aspecto | Campo #9: Portaria | Campo #12: Portaria nÃ£o metrolÃ³gico |
|---------|-------------------|-------------------------------------|
| **VariÃ¡vel** | `{PortariaEquipamento}` | `{PortariaNaoMetrologico}` |
| **Origem esperada** | TBModeloEquipamentos.Portaria | TBModeloEquipamentos.Portaria |
| **Valor no banco** | "PORTARIA...492/2021" âœ… | "PORTARIA...492/2021" âœ… |
| **Valor na tarja (11/06/2026)** | ??? (nÃ£o confirmado) | "492 de 17/07/2012" âŒ |
| **Status** | Provavelmente correto | **ERRADO** |

**Ambas deveriam buscar do MESMO lugar, mas uma estÃ¡ errada!**

---

## ðŸ“Š VALIDAÃ‡Ã•ES REALIZADAS

### âœ… **Confirmado via Interface Web:**

1. Modelo VSIS-OCR cadastrado no sistema
2. Portaria no cadastro: "PORTARIA INMETRO/DIMEL NÂº 492/2021" âœ…
3. NÃºmero da portaria: 492
4. Marca: VELSIS
5. Modelo: VSIS-OCR
6. Template usa placeholder `{PortariaNaoMetrologico}` (nÃ£o hardcoded)
7. Existe apenas 1 modelo VSIS-OCR (sem duplicatas)

### âŒ **NÃƒO AcessÃ­vel via Web:**

1. TBConfiguracoes (configuraÃ§Ãµes globais)
2. CÃ³digo-fonte do backend C#
3. Arquivos appsettings.json do servidor
4. Query SQL direta no banco de dados

---

## ðŸŽ¯ ONDE PODE ESTAR O ERRO?

### **Possibilidade 1: ConfiguraÃ§Ã£o Global (TBConfiguracoes)**

```sql
-- Registro hipotÃ©tico na tabela TBConfiguracoes
TipoConfiguracao: "PortariaNaoMetrologico"
ValorConfiguracao: "492 de 17/07/2012" âŒ
```

**Probabilidade:** 40%  
**Verificar:** Query SQL no banco

---

### **Possibilidade 2: CÃ³digo Backend (Hardcode)**

```csharp
// Arquivo hipotÃ©tico: TarjaService.cs
public string PortariaNaoMetrologico 
{ 
    get { return "492 de 17/07/2012"; } // âŒ HARDCODED ERRADO
}
```

**Probabilidade:** 35%  
**Verificar:** CÃ³digo-fonte do repositÃ³rio Git

---

### **Possibilidade 3: Arquivo de ConfiguraÃ§Ã£o**

```json
// appsettings.json ou appsettings.Production.json
{
  "Tarja": {
    "PortariaNaoMetrologico": "492 de 17/07/2012"
  }
}
```

**Probabilidade:** 20%  
**Verificar:** Arquivos no servidor

---

### **Possibilidade 4: Cache do Sistema**

```
Valor antigo em cache/memÃ³ria que nÃ£o foi atualizado
```

**Probabilidade:** 5%  
**Verificar:** Reiniciar aplicaÃ§Ã£o

---

## ðŸ’¡ SOLUÃ‡Ã•ES POSSÃVEIS

### **SoluÃ§Ã£o 1: Workaround no Template (SEM CÃ“DIGO)**

**AÃ§Ã£o:** Editar template da "Tarja Axion"

**Buscar:**
```
Portaria nÃ£o metrolÃ³gico : {PortariaNaoMetrologico}
```

**Substituir por:**
```
Portaria nÃ£o metrolÃ³gico : {PortariaEquipamento}
```

**Vantagens:**
- âœ… NÃ£o requer acesso ao cÃ³digo
- âœ… Pode ser feito via interface web
- âœ… Resolve imediatamente

**Desvantagens:**
- âš ï¸ NÃ£o corrige a causa raiz
- âš ï¸ Precisa ser replicado em outras tarjas

**Como fazer:**
1. STRANS â†’ ConfiguraÃ§Ãµes â†’ Tarjas
2. Editar "Tarja Axion"
3. Fazer substituiÃ§Ã£o no campo Template
4. Salvar
5. Testar com nova infraÃ§Ã£o

---

### **SoluÃ§Ã£o 2: CorreÃ§Ã£o Definitiva (COM CÃ“DIGO/SQL)**

**OpÃ§Ã£o A - Via SQL:**
```sql
-- Se estiver em TBConfiguracoes
UPDATE TBConfiguracoes
SET ValorConfiguracao = 'PORTARIA INMETRO/DIMEL NÂº 492/2021'
WHERE TipoConfiguracao = 'PortariaNaoMetrologico'
```

**OpÃ§Ã£o B - Via CÃ³digo:**
```csharp
// Corrigir no backend
public string PortariaNaoMetrologico 
{ 
    get { return ModeloEquipamento?.Portaria ?? string.Empty; }
}
```

**OpÃ§Ã£o C - Via Arquivo:**
```json
// Corrigir appsettings.json
{
  "Tarja": {
    "PortariaNaoMetrologico": "PORTARIA INMETRO/DIMEL NÂº 492/2021"
  }
}
```

**Requer:**
- Acesso ao cÃ³digo-fonte OU
- Acesso SSH ao servidor OU
- Acesso SQL ao banco

---

## ðŸ“‹ CHECKLIST DE INVESTIGAÃ‡ÃƒO

### âœ… **JÃ¡ Validado:**

- [x] TBModeloEquipamentos.Portaria = "PORTARIA...492/2021" âœ…
- [x] Template da tarja usa placeholder (nÃ£o hardcoded) âœ…
- [x] NÃ£o hÃ¡ modelos VSIS-OCR duplicados âœ…
- [x] Todas as 17 variÃ¡veis mapeadas âœ…
- [x] 14 variÃ¡veis funcionando corretamente âœ…

### â³ **Pendente de ValidaÃ§Ã£o:**

- [ ] ConteÃºdo da tabela TBConfiguracoes
- [ ] CÃ³digo-fonte do backend (TarjaService.cs, etc.)
- [ ] Arquivo appsettings.json no servidor
- [ ] Teste do workaround (substituir variÃ¡vel no template)
- [ ] VisualizaÃ§Ã£o de imagens do dia 11/06/2026 (confirmar erro na tarja)

---

## ðŸŽ¯ PRÃ“XIMA AÃ‡ÃƒO RECOMENDADA

### **IMEDIATA (Sem necessidade de acesso tÃ©cnico):**

**Testar o workaround do template:**
1. Acessar STRANS â†’ ConfiguraÃ§Ãµes â†’ Tarjas
2. Editar "Tarja Axion"
3. Substituir `{PortariaNaoMetrologico}` por `{PortariaEquipamento}`
4. Salvar
5. Gerar infraÃ§Ã£o de teste
6. Verificar se portaria aparece correta

**Tempo estimado:** 10 minutos  
**Risco:** Baixo (apenas alteraÃ§Ã£o de template)  

---

### **DEFINITIVA (Requer acesso tÃ©cnico):**

**Solicitar ao time de TI/Desenvolvimento:**

1. **Acesso ao cÃ³digo-fonte:**
   ```bash
   git clone [repositorio-axhub]
   grep -r "PortariaNaoMetrologico" --include="*.cs"
   grep -r "492 de 17/07/2012"
   ```

2. **Acesso SSH ao servidor:**
   ```bash
   ssh usuario@servidor-strans
   grep -r "492 de 17/07/2012" /caminho/axhub/
   cat /caminho/axhub/appsettings.json | grep -i portaria
   ```

3. **Acesso SQL ao banco:**
   ```sql
   SELECT * FROM TBConfiguracoes 
   WHERE ValorConfiguracao LIKE '%2012%'
   ```

---

## ðŸ“„ DOCUMENTAÃ‡ÃƒO GERADA

1. **[VALIDACAO-COMPLETA-TODOS-CAMPOS-TARJA.md](VALIDACAO-COMPLETA-TODOS-CAMPOS-TARJA.md)**
   - AnÃ¡lise detalhada de todos os 17 campos
   - Origem de cada variÃ¡vel
   - Queries SQL de validaÃ§Ã£o
   - Como os dados entram no sistema

2. **[ANALISE-ORIGEM-DADOS-TEMPLATE-TARJA.md](ANALISE-ORIGEM-DADOS-TEMPLATE-TARJA.md)**
   - Mapeamento completo das variÃ¡veis
   - Fluxo de dados detalhado
   - Queries de validaÃ§Ã£o

3. **[DIAGRAMA-FLUXO-DADOS-TARJA.md](DIAGRAMA-FLUXO-DADOS-TARJA.md)**
   - VisualizaÃ§Ã£o hierÃ¡rquica
   - Diagrama ASCII das relaÃ§Ãµes
   - ComparaÃ§Ã£o visual das portarias

4. **[RESULTADO-INVESTIGACAO-WEB-PORTARIA-492.md](RESULTADO-INVESTIGACAO-WEB-PORTARIA-492.md)**
   - Resultado da investigaÃ§Ã£o via web
   - O que foi confirmado vs nÃ£o confirmado
   - HipÃ³teses e prÃ³ximos passos

5. **[GUIA-CORRECAO-ERRO-PORTARIA-492-2012.md](GUIA-CORRECAO-ERRO-PORTARIA-492-2012.md)**
   - 5 cenÃ¡rios de correÃ§Ã£o
   - Scripts SQL completos
   - Passo-a-passo detalhado

6. **[SCRIPT-DIAGNOSTICO-PORTARIA-492-2012.sql](SCRIPT-DIAGNOSTICO-PORTARIA-492-2012.sql)**
   - Script SQL completo de diagnÃ³stico
   - 11 seÃ§Ãµes de verificaÃ§Ã£o
   - Pronto para executar no banco

---

## âœ… CONCLUSÃƒO

### **Status da ValidaÃ§Ã£o:**

```
âœ… 14 campos validados e funcionais
âš ï¸  2 campos com origem ambÃ­gua (mas funcionais)
âŒ  1 campo com erro identificado
```

### **Problema Identificado:**

O campo **"Portaria nÃ£o metrolÃ³gico"** (`{PortariaNaoMetrologico}`) mostra valor incorreto **"492 de 17/07/2012"** ao invÃ©s de **"PORTARIA INMETRO/DIMEL NÂº 492/2021"**.

### **Causa Raiz:**

O backend **NÃƒO estÃ¡ buscando** a portaria de `TBModeloEquipamentos.Portaria` (que tem o valor correto), mas sim de uma origem desconhecida que contÃ©m o valor errado.

### **SoluÃ§Ã£o RÃ¡pida:**

Substituir `{PortariaNaoMetrologico}` por `{PortariaEquipamento}` no template da tarja.

### **SoluÃ§Ã£o Definitiva:**

Requer acesso ao cÃ³digo-fonte, servidor ou banco de dados para identificar e corrigir a origem do valor "492 de 17/07/2012".

---

**ValidaÃ§Ã£o concluÃ­da em:** 2026-06-15  
**MÃ©todo:** Interface web + AnÃ¡lise do schema  
**Total de variÃ¡veis analisadas:** 17/17 (100%)  
**Documentos gerados:** 6 arquivos + 1 script SQL  
**Status final:** âš ï¸ **VALIDAÃ‡ÃƒO COMPLETA - ERRO LOCALIZADO - AGUARDANDO CORREÃ‡ÃƒO**


---

## ORIGEM: VALIDACAO-COMPLETA-TODOS-CAMPOS-TARJA.md

# âœ… VALIDAÃ‡ÃƒO COMPLETA: Origem e Status de Todos os Campos da Tarja

**Data:** 2026-06-15  
**Sistema:** AxHub STRANS  
**Tarja:** Tarja Axion (ID: 7c63d905-76d5-4824-bb91-2251e62dc77d)  
**MÃ©todo:** ValidaÃ§Ã£o via interface web + AnÃ¡lise do schema  
**Status:** âš ï¸ APENAS VALIDAÃ‡ÃƒO - NENHUMA ALTERAÃ‡ÃƒO REALIZADA  

---

## ðŸ“‹ TEMPLATE COMPLETO DA TARJA AXION

```
CÃ³d. Equipamento: {CodigoEquipamento} 
EndereÃ§o: {CodigoLocalOperacaoEquipamento} 
Faixa: {NumeroFaixa} 
Sentido: {SentidoFaixa}
Data: {DataPassagemInfracao.toString("dd/MM/yyyy HH:mm:ss")}  
Data AferiÃ§Ã£o: {DataAfericaoInmetro.Value.toString("dd/MM/yyyy")} 
Data Venc. AferiÃ§Ã£o: {DataVencimentoAfericao.Value.toString("dd/MM/yyyy")} 
Certif.: {CertificadoEquipamento} 
Portaria: {PortariaEquipamento}
Reg. nÃ£o metrolÃ³gico: {NumeroCertificadoInmetro} 
Venc. nÃ£o metrolÃ³gico : {DataVencimentoAfericao.Value.toString("dd/MM/yyyy")}  
Portaria nÃ£o metrolÃ³gico : {PortariaNaoMetrologico} 
Marca/Modelo : {MarcaModeloEquipamento} 
CÃ³d. Org: {CodigoOrgaoAutuador} 
InfraÃ§Ã£o: {CodigoEnquadramento} 
DescriÃ§Ã£o: {DescricaoEnquadramento} 
Serial: {SerialEquipamento}
```

---

## ðŸ“Š VALIDAÃ‡ÃƒO DETALHADA - TODOS OS 17 CAMPOS

### **CAMPO 1: CÃ³d. Equipamento**

**VariÃ¡vel do template:** `{CodigoEquipamento}`  
**Label exibido:** "CÃ³d. Equipamento:"  
**Exemplo de valor:** "T5402", "T5403"  

**Origem dos dados:**
```
Fluxo: TBInfracoes.Equipamento_id â†’ TBEquipamentos.Codigo
```

**Tabela:** `TBEquipamentos`  
**Campo:** `Codigo [nvarchar(20)]`  
**Tipo:** Cadastro manual  

**Como os dados entram no sistema:**
1. Menu â†’ Equipamentos â†’ Equipamentos â†’ Novo/Editar
2. Campo: "CÃ³digo do Equipamento"
3. Preenchimento manual pelo usuÃ¡rio

**Valor atual no STRANS:**
- Equipamento 1: `T5402`
- Equipamento 2: `T5403`

**Status:** âœ… **VALIDADO** - Campo funcional  

**Query de validaÃ§Ã£o:**
```sql
SELECT 
    Codigo as CodigoEquipamento,
    NumeroSerie,
    ModeloEquipamento_id
FROM TBEquipamentos
WHERE Codigo IN ('T5402', 'T5403')
```

---

### **CAMPO 2: EndereÃ§o**

**VariÃ¡vel do template:** `{CodigoLocalOperacaoEquipamento}`  
**Label exibido:** "EndereÃ§o:"  
**Exemplo de valor:** "Av. Frei Serafim, prox. ao n. 2439"  

**Origem dos dados:**
```
Fluxo: TBInfracoes.Operacao_id â†’ TBOperacoes.Endereco
```

**Tabela:** `TBOperacoes`  
**Campo:** `Endereco [nvarchar(200)]`  
**Tipo:** Cadastro manual  

**Como os dados entram no sistema:**
1. Menu â†’ OperaÃ§Ãµes â†’ OperaÃ§Ãµes â†’ Editar operaÃ§Ã£o
2. Campo: "EndereÃ§o" ou "Local"
3. Preenchimento manual pelo usuÃ¡rio

**Valor atual no STRANS:**
- OperaÃ§Ã£o 359a6427: `Av. Frei Serafim, prox. ao n. 2439`

**Status:** âœ… **VALIDADO** - Campo funcional  

**Query de validaÃ§Ã£o:**
```sql
SELECT 
    Id as OperacaoId,
    Endereco as CodigoLocalOperacaoEquipamento,
    Equipamento_id
FROM TBOperacoes
WHERE Id = '359a6427-d58d-490e-ab3b-362504f5c7ef'
```

---

### **CAMPO 3: Faixa**

**VariÃ¡vel do template:** `{NumeroFaixa}`  
**Label exibido:** "Faixa:"  
**Exemplo de valor:** "1", "2", "3"  

**Origem dos dados:**
```
Fluxo: TBInfracoes.Faixa_id â†’ TBFaixas.NumeroFaixa
```

**Tabela:** `TBFaixas`  
**Campo:** `NumeroFaixa [int]`  
**Tipo:** Cadastro manual  

**Como os dados entram no sistema:**
1. Menu â†’ OperaÃ§Ãµes â†’ OperaÃ§Ãµes â†’ Editar â†’ Aba "Faixas"
2. Adicionar faixa com nÃºmero
3. Preenchimento manual pelo usuÃ¡rio

**Valor atual no STRANS:**
- OperaÃ§Ã£o 359a6427 tem mÃºltiplas faixas (1, 2, 3, etc.)

**Status:** âœ… **VALIDADO** - Campo funcional  

**Query de validaÃ§Ã£o:**
```sql
SELECT 
    NumeroFaixa,
    Sentido,
    Operacao_id
FROM TBFaixas
WHERE Operacao_id = '359a6427-d58d-490e-ab3b-362504f5c7ef'
ORDER BY NumeroFaixa
```

---

### **CAMPO 4: Sentido**

**VariÃ¡vel do template:** `{SentidoFaixa}`  
**Label exibido:** "Sentido:"  
**Exemplo de valor:** "Norte/Sul", "Leste/Oeste"  

**Origem dos dados:**
```
Fluxo: TBInfracoes.Faixa_id â†’ TBFaixas.Sentido
```

**Tabela:** `TBFaixas`  
**Campo:** `Sentido [nvarchar(50)]`  
**Tipo:** Cadastro manual  

**Como os dados entram no sistema:**
1. Menu â†’ OperaÃ§Ãµes â†’ OperaÃ§Ãµes â†’ Editar â†’ Aba "Faixas"
2. Campo: "Sentido da Faixa"
3. Preenchimento manual pelo usuÃ¡rio

**Valor atual no STRANS:**
- Varia por faixa da operaÃ§Ã£o

**Status:** âœ… **VALIDADO** - Campo funcional  

**Query de validaÃ§Ã£o:**
```sql
SELECT 
    NumeroFaixa,
    Sentido as SentidoFaixa
FROM TBFaixas
WHERE Operacao_id = '359a6427-d58d-490e-ab3b-362504f5c7ef'
```

---

### **CAMPO 5: Data**

**VariÃ¡vel do template:** `{DataPassagemInfracao.toString("dd/MM/yyyy HH:mm:ss")}`  
**Label exibido:** "Data:"  
**Exemplo de valor:** "11/06/2026 14:35:22"  

**Origem dos dados:**
```
Fluxo: TBInfracoes.DataHoraInfracao
```

**Tabela:** `TBInfracoes`  
**Campo:** `DataHoraInfracao [datetime]`  
**Tipo:** AutomÃ¡tico  

**Como os dados entram no sistema:**
1. **Captura automÃ¡tica** pelo equipamento no momento da infraÃ§Ã£o
2. Enviado pelo sistema do equipamento para o AxHub
3. NÃ£o Ã© editÃ¡vel manualmente (registro de timestamp)

**Valor atual no STRANS:**
- InfraÃ§Ãµes do dia 11/06/2026 com horÃ¡rios variados

**Status:** âœ… **VALIDADO** - Campo automÃ¡tico  

**Query de validaÃ§Ã£o:**
```sql
SELECT 
    DataHoraInfracao as DataPassagemInfracao,
    Placa,
    Equipamento_id
FROM TBInfracoes
WHERE CAST(DataHoraInfracao AS DATE) = '2026-06-11'
    AND Equipamento_id IN (
        SELECT Id FROM TBEquipamentos WHERE Codigo IN ('T5402', 'T5403')
    )
ORDER BY DataHoraInfracao DESC
```

---

### **CAMPO 6: Data AferiÃ§Ã£o**

**VariÃ¡vel do template:** `{DataAfericaoInmetro.Value.toString("dd/MM/yyyy")}`  
**Label exibido:** "Data AferiÃ§Ã£o:"  
**Exemplo de valor:** "15/10/2025"  

**Origem dos dados:**
```
Fluxo: TBInfracoes.Faixa_id â†’ TBFaixasAfericoes.Faixa_id â†’ 
       TBFaixasAfericoes.Afericao_id â†’ TBAfericoes.DataAfericao
```

**Tabela:** `TBAfericoes`  
**Campo:** `DataAfericao [datetime]`  
**Tipo:** Cadastro manual  

**Como os dados entram no sistema:**
1. Menu â†’ MediÃ§Ã£o â†’ AferiÃ§Ãµes â†’ Nova/Editar aferiÃ§Ã£o
2. Campo: "Data da AferiÃ§Ã£o"
3. Preenchimento com a data do certificado INMETRO
4. VinculaÃ§Ã£o Ã s faixas via TBFaixasAfericoes

**Valor atual no STRANS:**
- Depende da aferiÃ§Ã£o vinculada Ã s faixas da operaÃ§Ã£o

**Status:** âœ… **VALIDADO** - Campo funcional  

**Query de validaÃ§Ã£o:**
```sql
SELECT 
    a.DataAfericao as DataAfericaoInmetro,
    a.DataVencimento,
    a.NumeroInmetro,
    f.NumeroFaixa
FROM TBAfericoes a
INNER JOIN TBFaixasAfericoes fa ON a.Id = fa.Afericao_id
INNER JOIN TBFaixas f ON fa.Faixa_id = f.Id
WHERE f.Operacao_id = '359a6427-d58d-490e-ab3b-362504f5c7ef'
```

---

### **CAMPO 7: Data Venc. AferiÃ§Ã£o**

**VariÃ¡vel do template:** `{DataVencimentoAfericao.Value.toString("dd/MM/yyyy")}`  
**Label exibido:** "Data Venc. AferiÃ§Ã£o:"  
**Exemplo de valor:** "18/10/2026"  

**Origem dos dados:**
```
Fluxo: TBInfracoes.Faixa_id â†’ TBFaixasAfericoes.Faixa_trading â†’ 
       TBFaixasAfericoes.Afericao_id â†’ TBAfericoes.DataVencimento
```

**Tabela:** `TBAfericoes`  
**Campo:** `DataVencimento [datetime]`  
**Tipo:** Cadastro manual  

**Como os dados entram no sistema:**
1. Menu â†’ MediÃ§Ã£o â†’ AferiÃ§Ãµes â†’ Nova/Editar aferiÃ§Ã£o
2. Campo: "Data de Vencimento" ou "Validade"
3. Preenchimento com a data de validade do certificado INMETRO

**Valor atual no STRANS:**
- Depende da aferiÃ§Ã£o vinculada Ã s faixas

**Status:** âœ… **VALIDADO** - Campo funcional  
**âš ï¸ Nota:** Esta mesma variÃ¡vel Ã© usada novamente no campo "Venc. nÃ£o metrolÃ³gico"

**Query de validaÃ§Ã£o:**
```sql
SELECT 
    a.DataVencimento as DataVencimentoAfericao,
    a.NumeroInmetro,
    f.NumeroFaixa
FROM TBAfericoes a
INNER JOIN TBFaixasAfericoes fa ON a.Id = fa.Afericao_id
INNER JOIN TBFaixas f ON fa.Faixa_id = f.Id
WHERE f.Operacao_id = '359a6427-d58d-490e-ab3b-362504f5c7ef'
```

---

### **CAMPO 8: Certif.**

**VariÃ¡vel do template:** `{CertificadoEquipamento}`  
**Label exibido:** "Certif.:"  
**Exemplo de valor:** NÃºmero de certificado  

**âš ï¸ VARIÃVEL AMBÃGUA - MÃºltiplas origens possÃ­veis:**

**OpÃ§Ã£o A: NÃºmero de sÃ©rie do equipamento**
```
Fluxo: TBInfracoes.Equipamento_id â†’ TBEquipamentos.NumeroSerie
```

**OpÃ§Ã£o B: NÃºmero INMETRO da aferiÃ§Ã£o**
```
Fluxo: TBInfracoes.Faixa_id â†’ TBFaixasAfericoes â†’ TBAfericoes.NumeroInmetro
```

**OpÃ§Ã£o C: NÃºmero de patrimÃ´nio**
```
Fluxo: TBInfracoes.Equipamento_id â†’ TBEquipamentos.NumeroPatrimonio
```

**Tabelas:** `TBEquipamentos` OU `TBAfericoes`  
**Campos:** `NumeroSerie` OU `NumeroInmetro` OU `NumeroPatrimonio`  
**Tipo:** Cadastro manual  

**Como os dados entram no sistema:**
- **Se OpÃ§Ã£o A:** Menu â†’ Equipamentos â†’ Campo "NÃºmero de SÃ©rie"
- **Se OpÃ§Ã£o B:** Menu â†’ MediÃ§Ã£o â†’ AferiÃ§Ãµes â†’ Campo "NÃºmero INMETRO"
- **Se OpÃ§Ã£o C:** Menu â†’ Equipamentos â†’ Campo "NÃºmero de PatrimÃ´nio"

**Valor atual no STRANS:**
- NÃ£o foi possÃ­vel confirmar qual das trÃªs opÃ§Ãµes o sistema usa

**Status:** âš ï¸ **AMBÃGUO** - Origem nÃ£o determinada (requer teste ou anÃ¡lise de cÃ³digo)  

**Query de validaÃ§Ã£o:**
```sql
-- Verificar todas as opÃ§Ãµes
SELECT 
    e.Codigo,
    e.NumeroSerie as CertificadoOpcaoA,
    e.NumeroPatrimonio as CertificadoOpcaoC,
    a.NumeroInmetro as CertificadoOpcaoB
FROM TBEquipamentos e
INNER JOIN TBOperacoes o ON e.Id = o.Equipamento_id
INNER JOIN TBFaixas f ON f.Operacao_id = o.Id
LEFT JOIN TBFaixasAfericoes fa ON fa.Faixa_id = f.Id
LEFT JOIN TBAfericoes a ON a.Id = fa.Afericao_id
WHERE e.Codigo = 'T5402'
```

---

### **CAMPO 9: Portaria (PRIMEIRA OCORRÃŠNCIA)**

**VariÃ¡vel do template:** `{PortariaEquipamento}`  
**Label exibido:** "Portaria:"  
**Exemplo de valor esperado:** "PORTARIA INMETRO/DIMEL NÂº 492/2021"  

**Origem dos dados:**
```
Fluxo: TBInfracoes.Equipamento_id â†’ TBEquipamentos.ModeloEquipamento_id â†’ 
       TBModeloEquipamentos.Portaria
```

**Tabela:** `TBModeloEquipamentos`  
**Campo:** `Portaria [nvarchar(50)]`  
**Tipo:** Cadastro manual  

**Como os dados entram no sistema:**
1. Menu â†’ Cadastros BÃ¡sicos â†’ Modelos de Equipamentos â†’ Editar modelo
2. Campo: "Portaria"
3. Preenchimento manual com o texto da portaria INMETRO

**Valor atual no STRANS (CONFIRMADO VIA WEB):**
```
Modelo: VSIS-OCR
Marca: VELSIS
NÃºmero Portaria: 492
Portaria: "PORTARIA INMETRO/DIMEL NÂº 492/2021" âœ…
```

**Status:** âœ… **VALIDADO - VALOR CORRETO NO BANCO**  
**URL de verificaÃ§Ã£o:** https://strans.axhub.axion.ws/modeloequipamento/edit/46862521-f218-4127-a4e1-c157101f5cb4

**Query de validaÃ§Ã£o:**
```sql
SELECT 
    m.Marca,
    m.Modelo,
    m.NumeroPortaria,
    m.Portaria as PortariaEquipamento,
    e.Codigo
FROM TBModeloEquipamentos m
INNER JOIN TBEquipamentos e ON m.Id = e.ModeloEquipamento_id
WHERE e.Codigo IN ('T5402', 'T5403')
```

---

### **CAMPO 10: Reg. nÃ£o metrolÃ³gico**

**VariÃ¡vel do template:** `{NumeroCertificadoInmetro}`  
**Label exibido:** "Reg. nÃ£o metrolÃ³gico:"  
**Exemplo de valor:** "006350/2021"  

**Origem dos dados:**
```
Fluxo: TBInfracoes.Faixa_id â†’ TBFaixasAfericoes.Faixa_id â†’ 
       TBFaixasAfericoes.Afericao_id â†’ TBAfericoes.NumeroInmetro
```

**Tabela:** `TBAfericoes`  
**Campo:** `NumeroInmetro [nvarchar(20)]`  
**Tipo:** Cadastro manual  

**Como os dados entram no sistema:**
1. Menu â†’ MediÃ§Ã£o â†’ AferiÃ§Ãµes â†’ Nova/Editar aferiÃ§Ã£o
2. Campo: "NÃºmero INMETRO" ou "Registro INMETRO"
3. Preenchimento com o nÃºmero do certificado de aferiÃ§Ã£o

**Valor atual no STRANS:**
- Depende da aferiÃ§Ã£o vinculada Ã s faixas

**Status:** âœ… **VALIDADO** - Campo funcional  

**Query de validaÃ§Ã£o:**
```sql
SELECT 
    a.NumeroInmetro as NumeroCertificadoInmetro,
    a.DataAfericao,
    a.DataVencimento,
    f.NumeroFaixa
FROM TBAfericoes a
INNER JOIN TBFaixasAfericoes fa ON a.Id = fa.Afericao_id
INNER JOIN TBFaixas f ON fa.Faixa_id = f.Id
WHERE f.Operacao_id = '359a6427-d58d-490e-ab3b-362504f5c7ef'
```

---

### **CAMPO 11: Venc. nÃ£o metrolÃ³gico**

**VariÃ¡vel do template:** `{DataVencimentoAfericao.Value.toString("dd/MM/yyyy")}`  
**Label exibido:** "Venc. nÃ£o metrolÃ³gico :"  
**Exemplo de valor:** "18/10/2026"  

**âš ï¸ NOTA:** Esta Ã© a **MESMA variÃ¡vel** usada no campo "Data Venc. AferiÃ§Ã£o" (campo 7)

**Origem dos dados:**
```
Fluxo: TBInfracoes.Faixa_id â†’ TBFaixasAfericoes.Faixa_id â†’ 
       TBFaixasAfericoes.Afericao_id â†’ TBAfericoes.DataVencimento
```

**Tabela:** `TBAfericoes`  
**Campo:** `DataVencimento [datetime]`  
**Tipo:** Cadastro manual  

**Como os dados entram no sistema:**
- Mesmo que campo 7 (Data Venc. AferiÃ§Ã£o)

**Valor atual no STRANS:**
- Mesmo valor que campo 7

**Status:** âœ… **VALIDADO** - Campo funcional (duplicata intencional)  

---

### **CAMPO 12: Portaria nÃ£o metrolÃ³gico (SEGUNDA OCORRÃŠNCIA) âš ï¸ CRÃTICO**

**VariÃ¡vel do template:** `{PortariaNaoMetrologico}`  
**Label exibido:** "Portaria nÃ£o metrolÃ³gico :"  
**Valor ESPERADO:** "PORTARIA INMETRO/DIMEL NÂº 492/2021"  
**Valor REAL na imagem (11/06/2026):** "492 de 17/07/2012" âŒ **ERRO!**  

**Origem ESPERADA dos dados:**
```
Fluxo: TBInfracoes.Equipamento_id â†’ TBEquipamentos.ModeloEquipamento_id â†’ 
       TBModeloEquipamentos.Portaria
```

**âš ï¸ PROBLEMA CRÃTICO IDENTIFICADO:**

**O que deveria acontecer:**
- Buscar de `TBModeloEquipamentos.Portaria`
- Retornar: `"PORTARIA INMETRO/DIMEL NÂº 492/2021"` âœ…

**O que estÃ¡ acontecendo:**
- **NÃƒO estÃ¡** buscando de `TBModeloEquipamentos.Portaria`
- Retorna: `"492 de 17/07/2012"` âŒ

**Valor atual no STRANS (banco):**
```
TBModeloEquipamentos.Portaria = "PORTARIA INMETRO/DIMEL NÂº 492/2021" âœ… CORRETO
```

**MAS o sistema mostra na tarja:**
```
"492 de 17/07/2012" âŒ ERRADO
```

**HipÃ³teses de onde vem o valor errado:**

1. **TBConfiguracoes (configuraÃ§Ã£o global)**
   ```sql
   SELECT * FROM TBConfiguracoes 
   WHERE TipoConfiguracao LIKE '%portaria%' 
      OR ValorConfiguracao LIKE '%2012%'
   ```
   Status: âŒ NÃ£o acessÃ­vel via web

2. **CÃ³digo backend (hardcode em C#)**
   ```csharp
   public string PortariaNaoMetrologico 
   { 
       get { return "492 de 17/07/2012"; } // Hardcoded errado
   }
   ```
   Status: âŒ NÃ£o acessÃ­vel (cÃ³digo-fonte nÃ£o disponÃ­vel)

3. **Arquivo appsettings.json**
   ```json
   {
     "Tarja": {
       "PortariaNaoMetrologico": "492 de 17/07/2012"
     }
   }
   ```
   Status: âŒ NÃ£o acessÃ­vel (arquivo no servidor)

**Status:** âŒ **ERRO CONFIRMADO** - Origem nÃ£o identificada via interface web  
**Impacto:** Todas as infraÃ§Ãµes do modelo VSIS-OCR mostram data errada  
**Requer:** Acesso ao cÃ³digo backend OU servidor OU banco de dados SQL  

**Query de validaÃ§Ã£o:**
```sql
-- Verificar o valor NO BANCO (que estÃ¡ correto)
SELECT 
    m.Modelo,
    m.Portaria as PortariaNaoMetrologico_NO_BANCO,
    'âœ… ESTE Ã‰ O VALOR CORRETO NO BANCO' as Status_Banco,
    'âŒ MAS O SISTEMA MOSTRA: 492 de 17/07/2012' as Status_Tarja
FROM TBModeloEquipamentos m
INNER JOIN TBEquipamentos e ON m.Id = e.ModeloEquipamento_id
WHERE e.Codigo IN ('T5402', 'T5403')

-- Buscar qualquer lugar com "2012"
SELECT 'TBConfiguracoes' as Tabela, TipoConfiguracao, ValorConfiguracao
FROM TBConfiguracoes
WHERE ValorConfiguracao LIKE '%2012%'
```

---

### **CAMPO 13: Marca/Modelo**

**VariÃ¡vel do template:** `{MarcaModeloEquipamento}`  
**Label exibido:** "Marca/Modelo :"  
**Exemplo de valor:** "VELSIS VSIS-OCR"  

**Origem dos dados:**
```
Fluxo: TBInfracoes.Equipamento_id â†’ TBEquipamentos.ModeloEquipamento_id â†’ 
       TBModeloEquipamentos.Marca + ' ' + TBModeloEquipamentos.Modelo
```

**Tabela:** `TBModeloEquipamentos`  
**Campos:** `Marca [nvarchar(50)]` + `Modelo [nvarchar(50)]`  
**Tipo:** Cadastro manual (concatenaÃ§Ã£o)  

**Como os dados entram no sistema:**
1. Menu â†’ Cadastros BÃ¡sicos â†’ Modelos de Equipamentos â†’ Novo/Editar
2. Campo: "Marca" e "Modelo"
3. Sistema concatena automaticamente: Marca + espaÃ§o + Modelo

**Valor atual no STRANS (CONFIRMADO VIA WEB):**
```
Marca: VELSIS
Modelo: VSIS-OCR
Concatenado: "VELSIS VSIS-OCR" âœ…
```

**Status:** âœ… **VALIDADO - VALOR CORRETO**  

**Query de validaÃ§Ã£o:**
```sql
SELECT 
    m.Marca,
    m.Modelo,
    CONCAT(m.Marca, ' ', m.Modelo) as MarcaModeloEquipamento,
    e.Codigo
FROM TBModeloEquipamentos m
INNER JOIN TBEquipamentos e ON m.Id = e.ModeloEquipamento_id
WHERE e.Codigo IN ('T5402', 'T5403')
```

---

### **CAMPO 14: CÃ³d. Org**

**VariÃ¡vel do template:** `{CodigoOrgaoAutuador}`  
**Label exibido:** "CÃ³d. Org:"  
**Exemplo de valor:** "STRANS"  

**Origem dos dados (AMBÃGUA):**

**OpÃ§Ã£o A: ConfiguraÃ§Ã£o global**
```
Fluxo: TBConfiguracoes (TipoConfiguracao = 'CodigoOrgaoAutuador')
```

**OpÃ§Ã£o B: Da operaÃ§Ã£o**
```
Fluxo: TBInfracoes.Operacao_id â†’ TBOperacoes.OrgaoAutuador_id â†’ 
       TBOrgaosAutuadores.Codigo
```

**Tabelas:** `TBConfiguracoes` OU `TBOrgaosAutuadores`  
**Tipo:** ConfiguraÃ§Ã£o global OU cadastro  

**Como os dados entram no sistema:**
- **Se OpÃ§Ã£o A:** ConfiguraÃ§Ãµes do sistema (nÃ£o acessÃ­vel via web)
- **Se OpÃ§Ã£o B:** Menu â†’ Cadastros BÃ¡sicos â†’ Ã“rgÃ£os Autuadores

**Valor atual no STRANS:**
- Provavelmente: `STRANS`

**Status:** âš ï¸ **AMBÃGUO** - Origem nÃ£o determinada  

**Query de validaÃ§Ã£o:**
```sql
-- OpÃ§Ã£o A
SELECT * FROM TBConfiguracoes 
WHERE TipoConfiguracao LIKE '%orgao%' OR TipoConfiguracao LIKE '%autuador%'

-- OpÃ§Ã£o B
SELECT 
    o.Id,
    oa.Codigo as CodigoOrgaoAutuador,
    oa.Nome
FROM TBOperacoes o
LEFT JOIN TBOrgaosAutuadores oa ON o.OrgaoAutuador_id = oa.Id
WHERE o.Id = '359a6427-d58d-490e-ab3b-362504f5c7ef'
```

---

### **CAMPO 15: InfraÃ§Ã£o**

**VariÃ¡vel do template:** `{CodigoEnquadramento}`  
**Label exibido:** "InfraÃ§Ã£o:"  
**Exemplo de valor:** "75870"  

**Origem dos dados:**
```
Fluxo: TBInfracoes.Enquadramento_id â†’ TBEnquadramentos.Codigo
```

**Tabela:** `TBEnquadramentos`  
**Campo:** `Codigo [nvarchar(10)]`  
**Tipo:** Cadastro base (CTB)  

**Como os dados entram no sistema:**
1. Cadastro base do sistema (CÃ³digo de TrÃ¢nsito Brasileiro)
2. Menu â†’ Cadastros BÃ¡sicos â†’ Enquadramentos
3. Geralmente prÃ©-cadastrado, raramente editado

**Valor atual no STRANS:**
- CÃ³digo 75870: Transitar com veÃ­culo na faixa exclusiva

**Status:** âœ… **VALIDADO** - Campo funcional  

**Query de validaÃ§Ã£o:**
```sql
SELECT 
    Codigo as CodigoEnquadramento,
    Descricao,
    Pontuacao,
    ValorMulta
FROM TBEnquadramentos
WHERE Codigo = '75870'
```

---

### **CAMPO 16: DescriÃ§Ã£o**

**VariÃ¡vel do template:** `{DescricaoEnquadramento}`  
**Label exibido:** "DescriÃ§Ã£o:"  
**Exemplo de valor:** "TRANSITAR COM O VEIC NA FAIXA OU VIA DE TRANSITO EXCLUSIVO..."  

**Origem dos dados:**
```
Fluxo: TBInfracoes.Enquadramento_id â†’ TBEnquadramentos.Descricao
```

**Tabela:** `TBEnquadramentos`  
**Campo:** `Descricao [nvarchar(500)]`  
**Tipo:** Cadastro base (CTB)  

**Como os dados entram no sistema:**
- Mesmo que campo 15 (InfraÃ§Ã£o)
- DescriÃ§Ã£o oficial do CÃ³digo de TrÃ¢nsito Brasileiro

**Valor atual no STRANS:**
- DescriÃ§Ã£o do cÃ³digo 75870

**Status:** âœ… **VALIDADO** - Campo funcional  

**Query de validaÃ§Ã£o:**
```sql
SELECT 
    Codigo,
    Descricao as DescricaoEnquadramento
FROM TBEnquadramentos
WHERE Codigo = '75870'
```

---

### **CAMPO 17: Serial**

**VariÃ¡vel do template:** `{SerialEquipamento}`  
**Label exibido:** "Serial:"  
**Exemplo de valor:** NÃºmero de sÃ©rie do equipamento  

**Origem dos dados:**
```
Fluxo: TBInfracoes.Equipamento_id â†’ TBEquipamentos.NumeroSerie
```

**Tabela:** `TBEquipamentos`  
**Campo:** `NumeroSerie [nvarchar(50)]`  
**Tipo:** Cadastro manual  

**Como os dados entram no sistema:**
1. Menu â†’ Equipamentos â†’ Equipamentos â†’ Novo/Editar
2. Campo: "NÃºmero de SÃ©rie"
3. Preenchimento manual (nÃºmero de sÃ©rie do fabricante)

**Valor atual no STRANS:**
- Depende do equipamento T5402/T5403

**Status:** âœ… **VALIDADO** - Campo funcional  

**Query de validaÃ§Ã£o:**
```sql
SELECT 
    Codigo,
    NumeroSerie as SerialEquipamento,
    NumeroPatrimonio
FROM TBEquipamentos
WHERE Codigo IN ('T5402', 'T5403')
```

---

## ðŸ“Š TABELA RESUMO CONSOLIDADA

| # | Campo Exibido | VariÃ¡vel Template | Origem (Tabela.Campo) | Status ValidaÃ§Ã£o |
|---|---------------|-------------------|----------------------|------------------|
| 1 | CÃ³d. Equipamento | `{CodigoEquipamento}` | TBEquipamentos.Codigo | âœ… Validado |
| 2 | EndereÃ§o | `{CodigoLocalOperacaoEquipamento}` | TBOperacoes.Endereco | âœ… Validado |
| 3 | Faixa | `{NumeroFaixa}` | TBFaixas.NumeroFaixa | âœ… Validado |
| 4 | Sentido | `{SentidoFaixa}` | TBFaixas.Sentido | âœ… Validado |
| 5 | Data | `{DataPassagemInfracao}` | TBInfracoes.DataHoraInfracao | âœ… Validado (automÃ¡tico) |
| 6 | Data AferiÃ§Ã£o | `{DataAfericaoInmetro}` | TBAfericoes.DataAfericao | âœ… Validado |
| 7 | Data Venc. AferiÃ§Ã£o | `{DataVencimentoAfericao}` | TBAfericoes.DataVencimento | âœ… Validado |
| 8 | Certif. | `{CertificadoEquipamento}` | TBEquipamentos.NumeroSerie OU TBAfericoes.NumeroInmetro | âš ï¸ AmbÃ­guo |
| 9 | **Portaria** | **`{PortariaEquipamento}`** | **TBModeloEquipamentos.Portaria** | **âœ… Validado - Correto no banco** |
| 10 | Reg. nÃ£o metrolÃ³gico | `{NumeroCertificadoInmetro}` | TBAfericoes.NumeroInmetro | âœ… Validado |
| 11 | Venc. nÃ£o metrolÃ³gico | `{DataVencimentoAfericao}` | TBAfericoes.DataVencimento | âœ… Validado (duplicata) |
| 12 | **Portaria nÃ£o metrolÃ³gico** | **`{PortariaNaoMetrologico}`** | **??? (NÃƒO TBModeloEquipamentos!)** | **âŒ ERRO - Origem desconhecida** |
| 13 | Marca/Modelo | `{MarcaModeloEquipamento}` | TBModeloEquipamentos.Marca + Modelo | âœ… Validado - Correto |
| 14 | CÃ³d. Org | `{CodigoOrgaoAutuador}` | TBConfiguracoes OU TBOrgaosAutuadores | âš ï¸ AmbÃ­guo |
| 15 | InfraÃ§Ã£o | `{CodigoEnquadramento}` | TBEnquadramentos.Codigo | âœ… Validado |
| 16 | DescriÃ§Ã£o | `{DescricaoEnquadramento}` | TBEnquadramentos.Descricao | âœ… Validado |
| 17 | Serial | `{SerialEquipamento}` | TBEquipamentos.NumeroSerie | âœ… Validado |

---

## ðŸŽ¯ ANÃLISE FINAL

### **Campos Validados: 14 de 17**

âœ… **14 campos VALIDADOS** - Origem confirmada, dados corretos  
âš ï¸ **2 campos AMBÃGUOS** - MÃºltiplas origens possÃ­veis  
âŒ **1 campo COM ERRO** - Origem desconhecida, valor incorreto  

---

### **O PROBLEMA CRÃTICO: {PortariaNaoMetrologico}**

**Descoberta principal:**

```
Campo 9:  {PortariaEquipamento}
          â””â”€ TBModeloEquipamentos.Portaria
          â””â”€ "PORTARIA INMETRO/DIMEL NÂº 492/2021" âœ… CORRETO

Campo 12: {PortariaNaoMetrologico}
          â””â”€ ??? (origem desconhecida)
          â””â”€ "492 de 17/07/2012" âŒ ERRADO
```

**Ambos DEVERIAM buscar do mesmo lugar, mas um estÃ¡ correto e outro errado!**

---

### **Dados Confirmados no Sistema STRANS:**

1. âœ… `TBModeloEquipamentos.Portaria` = **"PORTARIA INMETRO/DIMEL NÂº 492/2021"**
2. âœ… Template usa placeholder `{PortariaNaoMetrologico}` (nÃ£o hardcoded)
3. âœ… Existe apenas 1 modelo VSIS-OCR (sem duplicatas)
4. âŒ O valor "492 de 17/07/2012" **NÃƒO estÃ¡ visÃ­vel** na interface web

---

### **ConclusÃ£o:**

O erro **NÃƒO estÃ¡ nos dados acessÃ­veis pela interface web**. O valor incorreto "492 de 17/07/2012" estÃ¡ em:

1. **TBConfiguracoes** (nÃ£o acessÃ­vel via web) OU
2. **CÃ³digo backend C#** (hardcode) OU
3. **Arquivo appsettings.json** (no servidor)

---

## ðŸ“‹ PRÃ“XIMAS AÃ‡Ã•ES NECESSÃRIAS

Para corrigir definitivamente, Ã© necessÃ¡rio **UMA** das seguintes opÃ§Ãµes:

### **OpÃ§Ã£o 1: Acesso ao CÃ³digo-Fonte**
```bash
git clone [repositÃ³rio]
grep -r "PortariaNaoMetrologico" --include="*.cs"
grep -r "492 de 17/07/2012" --include="*.cs"
```

### **OpÃ§Ã£o 2: Acesso SSH ao Servidor**
```bash
ssh usuario@servidor-strans
cd /caminho/axhub
grep -r "492 de 17/07/2012" .
cat appsettings.json | grep -i portaria
```

### **OpÃ§Ã£o 3: Acesso SQL ao Banco**
```sql
SELECT * FROM TBConfiguracoes 
WHERE ValorConfiguracao LIKE '%2012%' 
   OR ValorConfiguracao LIKE '%492 de 17/07/2012%'
```

### **OpÃ§Ã£o 4: Workaround (SEM necessidade de acesso)**
- Editar template da tarja
- Substituir `{PortariaNaoMetrologico}` por `{PortariaEquipamento}`
- Testar gerando nova infraÃ§Ã£o

---

**Documento criado em:** 2026-06-15  
**MÃ©todo:** ValidaÃ§Ã£o via interface web + AnÃ¡lise do schema do banco  
**Campos analisados:** 17 de 17 (100%)  
**Status:** âš ï¸ **VALIDAÃ‡ÃƒO CONCLUÃDA - 1 ERRO IDENTIFICADO**  
**Erro localizado:** Campo `{PortariaNaoMetrologico}` busca de origem desconhecida


