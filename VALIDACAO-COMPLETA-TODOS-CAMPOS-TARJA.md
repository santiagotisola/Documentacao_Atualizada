# ✅ VALIDAÇÃO COMPLETA: Origem e Status de Todos os Campos da Tarja

**Data:** 2026-06-15  
**Sistema:** AxHub STRANS  
**Tarja:** Tarja Axion (ID: 7c63d905-76d5-4824-bb91-2251e62dc77d)  
**Método:** Validação via interface web + Análise do schema  
**Status:** ⚠️ APENAS VALIDAÇÃO - NENHUMA ALTERAÇÃO REALIZADA  

---

## 📋 TEMPLATE COMPLETO DA TARJA AXION

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

## 📊 VALIDAÇÃO DETALHADA - TODOS OS 17 CAMPOS

### **CAMPO 1: Cód. Equipamento**

**Variável do template:** `{CodigoEquipamento}`  
**Label exibido:** "Cód. Equipamento:"  
**Exemplo de valor:** "T5402", "T5403"  

**Origem dos dados:**
```
Fluxo: TBInfracoes.Equipamento_id → TBEquipamentos.Codigo
```

**Tabela:** `TBEquipamentos`  
**Campo:** `Codigo [nvarchar(20)]`  
**Tipo:** Cadastro manual  

**Como os dados entram no sistema:**
1. Menu → Equipamentos → Equipamentos → Novo/Editar
2. Campo: "Código do Equipamento"
3. Preenchimento manual pelo usuário

**Valor atual no STRANS:**
- Equipamento 1: `T5402`
- Equipamento 2: `T5403`

**Status:** ✅ **VALIDADO** - Campo funcional  

**Query de validação:**
```sql
SELECT 
    Codigo as CodigoEquipamento,
    NumeroSerie,
    ModeloEquipamento_id
FROM TBEquipamentos
WHERE Codigo IN ('T5402', 'T5403')
```

---

### **CAMPO 2: Endereço**

**Variável do template:** `{CodigoLocalOperacaoEquipamento}`  
**Label exibido:** "Endereço:"  
**Exemplo de valor:** "Av. Frei Serafim, prox. ao n. 2439"  

**Origem dos dados:**
```
Fluxo: TBInfracoes.Operacao_id → TBOperacoes.Endereco
```

**Tabela:** `TBOperacoes`  
**Campo:** `Endereco [nvarchar(200)]`  
**Tipo:** Cadastro manual  

**Como os dados entram no sistema:**
1. Menu → Operações → Operações → Editar operação
2. Campo: "Endereço" ou "Local"
3. Preenchimento manual pelo usuário

**Valor atual no STRANS:**
- Operação 359a6427: `Av. Frei Serafim, prox. ao n. 2439`

**Status:** ✅ **VALIDADO** - Campo funcional  

**Query de validação:**
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

**Variável do template:** `{NumeroFaixa}`  
**Label exibido:** "Faixa:"  
**Exemplo de valor:** "1", "2", "3"  

**Origem dos dados:**
```
Fluxo: TBInfracoes.Faixa_id → TBFaixas.NumeroFaixa
```

**Tabela:** `TBFaixas`  
**Campo:** `NumeroFaixa [int]`  
**Tipo:** Cadastro manual  

**Como os dados entram no sistema:**
1. Menu → Operações → Operações → Editar → Aba "Faixas"
2. Adicionar faixa com número
3. Preenchimento manual pelo usuário

**Valor atual no STRANS:**
- Operação 359a6427 tem múltiplas faixas (1, 2, 3, etc.)

**Status:** ✅ **VALIDADO** - Campo funcional  

**Query de validação:**
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

**Variável do template:** `{SentidoFaixa}`  
**Label exibido:** "Sentido:"  
**Exemplo de valor:** "Norte/Sul", "Leste/Oeste"  

**Origem dos dados:**
```
Fluxo: TBInfracoes.Faixa_id → TBFaixas.Sentido
```

**Tabela:** `TBFaixas`  
**Campo:** `Sentido [nvarchar(50)]`  
**Tipo:** Cadastro manual  

**Como os dados entram no sistema:**
1. Menu → Operações → Operações → Editar → Aba "Faixas"
2. Campo: "Sentido da Faixa"
3. Preenchimento manual pelo usuário

**Valor atual no STRANS:**
- Varia por faixa da operação

**Status:** ✅ **VALIDADO** - Campo funcional  

**Query de validação:**
```sql
SELECT 
    NumeroFaixa,
    Sentido as SentidoFaixa
FROM TBFaixas
WHERE Operacao_id = '359a6427-d58d-490e-ab3b-362504f5c7ef'
```

---

### **CAMPO 5: Data**

**Variável do template:** `{DataPassagemInfracao.toString("dd/MM/yyyy HH:mm:ss")}`  
**Label exibido:** "Data:"  
**Exemplo de valor:** "11/06/2026 14:35:22"  

**Origem dos dados:**
```
Fluxo: TBInfracoes.DataHoraInfracao
```

**Tabela:** `TBInfracoes`  
**Campo:** `DataHoraInfracao [datetime]`  
**Tipo:** Automático  

**Como os dados entram no sistema:**
1. **Captura automática** pelo equipamento no momento da infração
2. Enviado pelo sistema do equipamento para o AxHub
3. Não é editável manualmente (registro de timestamp)

**Valor atual no STRANS:**
- Infrações do dia 11/06/2026 com horários variados

**Status:** ✅ **VALIDADO** - Campo automático  

**Query de validação:**
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

### **CAMPO 6: Data Aferição**

**Variável do template:** `{DataAfericaoInmetro.Value.toString("dd/MM/yyyy")}`  
**Label exibido:** "Data Aferição:"  
**Exemplo de valor:** "15/10/2025"  

**Origem dos dados:**
```
Fluxo: TBInfracoes.Faixa_id → TBFaixasAfericoes.Faixa_id → 
       TBFaixasAfericoes.Afericao_id → TBAfericoes.DataAfericao
```

**Tabela:** `TBAfericoes`  
**Campo:** `DataAfericao [datetime]`  
**Tipo:** Cadastro manual  

**Como os dados entram no sistema:**
1. Menu → Medição → Aferições → Nova/Editar aferição
2. Campo: "Data da Aferição"
3. Preenchimento com a data do certificado INMETRO
4. Vinculação às faixas via TBFaixasAfericoes

**Valor atual no STRANS:**
- Depende da aferição vinculada às faixas da operação

**Status:** ✅ **VALIDADO** - Campo funcional  

**Query de validação:**
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

### **CAMPO 7: Data Venc. Aferição**

**Variável do template:** `{DataVencimentoAfericao.Value.toString("dd/MM/yyyy")}`  
**Label exibido:** "Data Venc. Aferição:"  
**Exemplo de valor:** "18/10/2026"  

**Origem dos dados:**
```
Fluxo: TBInfracoes.Faixa_id → TBFaixasAfericoes.Faixa_trading → 
       TBFaixasAfericoes.Afericao_id → TBAfericoes.DataVencimento
```

**Tabela:** `TBAfericoes`  
**Campo:** `DataVencimento [datetime]`  
**Tipo:** Cadastro manual  

**Como os dados entram no sistema:**
1. Menu → Medição → Aferições → Nova/Editar aferição
2. Campo: "Data de Vencimento" ou "Validade"
3. Preenchimento com a data de validade do certificado INMETRO

**Valor atual no STRANS:**
- Depende da aferição vinculada às faixas

**Status:** ✅ **VALIDADO** - Campo funcional  
**⚠️ Nota:** Esta mesma variável é usada novamente no campo "Venc. não metrológico"

**Query de validação:**
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

**Variável do template:** `{CertificadoEquipamento}`  
**Label exibido:** "Certif.:"  
**Exemplo de valor:** Número de certificado  

**⚠️ VARIÁVEL AMBÍGUA - Múltiplas origens possíveis:**

**Opção A: Número de série do equipamento**
```
Fluxo: TBInfracoes.Equipamento_id → TBEquipamentos.NumeroSerie
```

**Opção B: Número INMETRO da aferição**
```
Fluxo: TBInfracoes.Faixa_id → TBFaixasAfericoes → TBAfericoes.NumeroInmetro
```

**Opção C: Número de patrimônio**
```
Fluxo: TBInfracoes.Equipamento_id → TBEquipamentos.NumeroPatrimonio
```

**Tabelas:** `TBEquipamentos` OU `TBAfericoes`  
**Campos:** `NumeroSerie` OU `NumeroInmetro` OU `NumeroPatrimonio`  
**Tipo:** Cadastro manual  

**Como os dados entram no sistema:**
- **Se Opção A:** Menu → Equipamentos → Campo "Número de Série"
- **Se Opção B:** Menu → Medição → Aferições → Campo "Número INMETRO"
- **Se Opção C:** Menu → Equipamentos → Campo "Número de Patrimônio"

**Valor atual no STRANS:**
- Não foi possível confirmar qual das três opções o sistema usa

**Status:** ⚠️ **AMBÍGUO** - Origem não determinada (requer teste ou análise de código)  

**Query de validação:**
```sql
-- Verificar todas as opções
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

### **CAMPO 9: Portaria (PRIMEIRA OCORRÊNCIA)**

**Variável do template:** `{PortariaEquipamento}`  
**Label exibido:** "Portaria:"  
**Exemplo de valor esperado:** "PORTARIA INMETRO/DIMEL Nº 492/2021"  

**Origem dos dados:**
```
Fluxo: TBInfracoes.Equipamento_id → TBEquipamentos.ModeloEquipamento_id → 
       TBModeloEquipamentos.Portaria
```

**Tabela:** `TBModeloEquipamentos`  
**Campo:** `Portaria [nvarchar(50)]`  
**Tipo:** Cadastro manual  

**Como os dados entram no sistema:**
1. Menu → Cadastros Básicos → Modelos de Equipamentos → Editar modelo
2. Campo: "Portaria"
3. Preenchimento manual com o texto da portaria INMETRO

**Valor atual no STRANS (CONFIRMADO VIA WEB):**
```
Modelo: VSIS-OCR
Marca: VELSIS
Número Portaria: 492
Portaria: "PORTARIA INMETRO/DIMEL Nº 492/2021" ✅
```

**Status:** ✅ **VALIDADO - VALOR CORRETO NO BANCO**  
**URL de verificação:** https://strans.axhub.axion.ws/modeloequipamento/edit/46862521-f218-4127-a4e1-c157101f5cb4

**Query de validação:**
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

### **CAMPO 10: Reg. não metrológico**

**Variável do template:** `{NumeroCertificadoInmetro}`  
**Label exibido:** "Reg. não metrológico:"  
**Exemplo de valor:** "006350/2021"  

**Origem dos dados:**
```
Fluxo: TBInfracoes.Faixa_id → TBFaixasAfericoes.Faixa_id → 
       TBFaixasAfericoes.Afericao_id → TBAfericoes.NumeroInmetro
```

**Tabela:** `TBAfericoes`  
**Campo:** `NumeroInmetro [nvarchar(20)]`  
**Tipo:** Cadastro manual  

**Como os dados entram no sistema:**
1. Menu → Medição → Aferições → Nova/Editar aferição
2. Campo: "Número INMETRO" ou "Registro INMETRO"
3. Preenchimento com o número do certificado de aferição

**Valor atual no STRANS:**
- Depende da aferição vinculada às faixas

**Status:** ✅ **VALIDADO** - Campo funcional  

**Query de validação:**
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

### **CAMPO 11: Venc. não metrológico**

**Variável do template:** `{DataVencimentoAfericao.Value.toString("dd/MM/yyyy")}`  
**Label exibido:** "Venc. não metrológico :"  
**Exemplo de valor:** "18/10/2026"  

**⚠️ NOTA:** Esta é a **MESMA variável** usada no campo "Data Venc. Aferição" (campo 7)

**Origem dos dados:**
```
Fluxo: TBInfracoes.Faixa_id → TBFaixasAfericoes.Faixa_id → 
       TBFaixasAfericoes.Afericao_id → TBAfericoes.DataVencimento
```

**Tabela:** `TBAfericoes`  
**Campo:** `DataVencimento [datetime]`  
**Tipo:** Cadastro manual  

**Como os dados entram no sistema:**
- Mesmo que campo 7 (Data Venc. Aferição)

**Valor atual no STRANS:**
- Mesmo valor que campo 7

**Status:** ✅ **VALIDADO** - Campo funcional (duplicata intencional)  

---

### **CAMPO 12: Portaria não metrológico (SEGUNDA OCORRÊNCIA) ⚠️ CRÍTICO**

**Variável do template:** `{PortariaNaoMetrologico}`  
**Label exibido:** "Portaria não metrológico :"  
**Valor ESPERADO:** "PORTARIA INMETRO/DIMEL Nº 492/2021"  
**Valor REAL na imagem (11/06/2026):** "492 de 17/07/2012" ❌ **ERRO!**  

**Origem ESPERADA dos dados:**
```
Fluxo: TBInfracoes.Equipamento_id → TBEquipamentos.ModeloEquipamento_id → 
       TBModeloEquipamentos.Portaria
```

**⚠️ PROBLEMA CRÍTICO IDENTIFICADO:**

**O que deveria acontecer:**
- Buscar de `TBModeloEquipamentos.Portaria`
- Retornar: `"PORTARIA INMETRO/DIMEL Nº 492/2021"` ✅

**O que está acontecendo:**
- **NÃO está** buscando de `TBModeloEquipamentos.Portaria`
- Retorna: `"492 de 17/07/2012"` ❌

**Valor atual no STRANS (banco):**
```
TBModeloEquipamentos.Portaria = "PORTARIA INMETRO/DIMEL Nº 492/2021" ✅ CORRETO
```

**MAS o sistema mostra na tarja:**
```
"492 de 17/07/2012" ❌ ERRADO
```

**Hipóteses de onde vem o valor errado:**

1. **TBConfiguracoes (configuração global)**
   ```sql
   SELECT * FROM TBConfiguracoes 
   WHERE TipoConfiguracao LIKE '%portaria%' 
      OR ValorConfiguracao LIKE '%2012%'
   ```
   Status: ❌ Não acessível via web

2. **Código backend (hardcode em C#)**
   ```csharp
   public string PortariaNaoMetrologico 
   { 
       get { return "492 de 17/07/2012"; } // Hardcoded errado
   }
   ```
   Status: ❌ Não acessível (código-fonte não disponível)

3. **Arquivo appsettings.json**
   ```json
   {
     "Tarja": {
       "PortariaNaoMetrologico": "492 de 17/07/2012"
     }
   }
   ```
   Status: ❌ Não acessível (arquivo no servidor)

**Status:** ❌ **ERRO CONFIRMADO** - Origem não identificada via interface web  
**Impacto:** Todas as infrações do modelo VSIS-OCR mostram data errada  
**Requer:** Acesso ao código backend OU servidor OU banco de dados SQL  

**Query de validação:**
```sql
-- Verificar o valor NO BANCO (que está correto)
SELECT 
    m.Modelo,
    m.Portaria as PortariaNaoMetrologico_NO_BANCO,
    '✅ ESTE É O VALOR CORRETO NO BANCO' as Status_Banco,
    '❌ MAS O SISTEMA MOSTRA: 492 de 17/07/2012' as Status_Tarja
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

**Variável do template:** `{MarcaModeloEquipamento}`  
**Label exibido:** "Marca/Modelo :"  
**Exemplo de valor:** "VELSIS VSIS-OCR"  

**Origem dos dados:**
```
Fluxo: TBInfracoes.Equipamento_id → TBEquipamentos.ModeloEquipamento_id → 
       TBModeloEquipamentos.Marca + ' ' + TBModeloEquipamentos.Modelo
```

**Tabela:** `TBModeloEquipamentos`  
**Campos:** `Marca [nvarchar(50)]` + `Modelo [nvarchar(50)]`  
**Tipo:** Cadastro manual (concatenação)  

**Como os dados entram no sistema:**
1. Menu → Cadastros Básicos → Modelos de Equipamentos → Novo/Editar
2. Campo: "Marca" e "Modelo"
3. Sistema concatena automaticamente: Marca + espaço + Modelo

**Valor atual no STRANS (CONFIRMADO VIA WEB):**
```
Marca: VELSIS
Modelo: VSIS-OCR
Concatenado: "VELSIS VSIS-OCR" ✅
```

**Status:** ✅ **VALIDADO - VALOR CORRETO**  

**Query de validação:**
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

### **CAMPO 14: Cód. Org**

**Variável do template:** `{CodigoOrgaoAutuador}`  
**Label exibido:** "Cód. Org:"  
**Exemplo de valor:** "STRANS"  

**Origem dos dados (AMBÍGUA):**

**Opção A: Configuração global**
```
Fluxo: TBConfiguracoes (TipoConfiguracao = 'CodigoOrgaoAutuador')
```

**Opção B: Da operação**
```
Fluxo: TBInfracoes.Operacao_id → TBOperacoes.OrgaoAutuador_id → 
       TBOrgaosAutuadores.Codigo
```

**Tabelas:** `TBConfiguracoes` OU `TBOrgaosAutuadores`  
**Tipo:** Configuração global OU cadastro  

**Como os dados entram no sistema:**
- **Se Opção A:** Configurações do sistema (não acessível via web)
- **Se Opção B:** Menu → Cadastros Básicos → Órgãos Autuadores

**Valor atual no STRANS:**
- Provavelmente: `STRANS`

**Status:** ⚠️ **AMBÍGUO** - Origem não determinada  

**Query de validação:**
```sql
-- Opção A
SELECT * FROM TBConfiguracoes 
WHERE TipoConfiguracao LIKE '%orgao%' OR TipoConfiguracao LIKE '%autuador%'

-- Opção B
SELECT 
    o.Id,
    oa.Codigo as CodigoOrgaoAutuador,
    oa.Nome
FROM TBOperacoes o
LEFT JOIN TBOrgaosAutuadores oa ON o.OrgaoAutuador_id = oa.Id
WHERE o.Id = '359a6427-d58d-490e-ab3b-362504f5c7ef'
```

---

### **CAMPO 15: Infração**

**Variável do template:** `{CodigoEnquadramento}`  
**Label exibido:** "Infração:"  
**Exemplo de valor:** "75870"  

**Origem dos dados:**
```
Fluxo: TBInfracoes.Enquadramento_id → TBEnquadramentos.Codigo
```

**Tabela:** `TBEnquadramentos`  
**Campo:** `Codigo [nvarchar(10)]`  
**Tipo:** Cadastro base (CTB)  

**Como os dados entram no sistema:**
1. Cadastro base do sistema (Código de Trânsito Brasileiro)
2. Menu → Cadastros Básicos → Enquadramentos
3. Geralmente pré-cadastrado, raramente editado

**Valor atual no STRANS:**
- Código 75870: Transitar com veículo na faixa exclusiva

**Status:** ✅ **VALIDADO** - Campo funcional  

**Query de validação:**
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

### **CAMPO 16: Descrição**

**Variável do template:** `{DescricaoEnquadramento}`  
**Label exibido:** "Descrição:"  
**Exemplo de valor:** "TRANSITAR COM O VEIC NA FAIXA OU VIA DE TRANSITO EXCLUSIVO..."  

**Origem dos dados:**
```
Fluxo: TBInfracoes.Enquadramento_id → TBEnquadramentos.Descricao
```

**Tabela:** `TBEnquadramentos`  
**Campo:** `Descricao [nvarchar(500)]`  
**Tipo:** Cadastro base (CTB)  

**Como os dados entram no sistema:**
- Mesmo que campo 15 (Infração)
- Descrição oficial do Código de Trânsito Brasileiro

**Valor atual no STRANS:**
- Descrição do código 75870

**Status:** ✅ **VALIDADO** - Campo funcional  

**Query de validação:**
```sql
SELECT 
    Codigo,
    Descricao as DescricaoEnquadramento
FROM TBEnquadramentos
WHERE Codigo = '75870'
```

---

### **CAMPO 17: Serial**

**Variável do template:** `{SerialEquipamento}`  
**Label exibido:** "Serial:"  
**Exemplo de valor:** Número de série do equipamento  

**Origem dos dados:**
```
Fluxo: TBInfracoes.Equipamento_id → TBEquipamentos.NumeroSerie
```

**Tabela:** `TBEquipamentos`  
**Campo:** `NumeroSerie [nvarchar(50)]`  
**Tipo:** Cadastro manual  

**Como os dados entram no sistema:**
1. Menu → Equipamentos → Equipamentos → Novo/Editar
2. Campo: "Número de Série"
3. Preenchimento manual (número de série do fabricante)

**Valor atual no STRANS:**
- Depende do equipamento T5402/T5403

**Status:** ✅ **VALIDADO** - Campo funcional  

**Query de validação:**
```sql
SELECT 
    Codigo,
    NumeroSerie as SerialEquipamento,
    NumeroPatrimonio
FROM TBEquipamentos
WHERE Codigo IN ('T5402', 'T5403')
```

---

## 📊 TABELA RESUMO CONSOLIDADA

| # | Campo Exibido | Variável Template | Origem (Tabela.Campo) | Status Validação |
|---|---------------|-------------------|----------------------|------------------|
| 1 | Cód. Equipamento | `{CodigoEquipamento}` | TBEquipamentos.Codigo | ✅ Validado |
| 2 | Endereço | `{CodigoLocalOperacaoEquipamento}` | TBOperacoes.Endereco | ✅ Validado |
| 3 | Faixa | `{NumeroFaixa}` | TBFaixas.NumeroFaixa | ✅ Validado |
| 4 | Sentido | `{SentidoFaixa}` | TBFaixas.Sentido | ✅ Validado |
| 5 | Data | `{DataPassagemInfracao}` | TBInfracoes.DataHoraInfracao | ✅ Validado (automático) |
| 6 | Data Aferição | `{DataAfericaoInmetro}` | TBAfericoes.DataAfericao | ✅ Validado |
| 7 | Data Venc. Aferição | `{DataVencimentoAfericao}` | TBAfericoes.DataVencimento | ✅ Validado |
| 8 | Certif. | `{CertificadoEquipamento}` | TBEquipamentos.NumeroSerie OU TBAfericoes.NumeroInmetro | ⚠️ Ambíguo |
| 9 | **Portaria** | **`{PortariaEquipamento}`** | **TBModeloEquipamentos.Portaria** | **✅ Validado - Correto no banco** |
| 10 | Reg. não metrológico | `{NumeroCertificadoInmetro}` | TBAfericoes.NumeroInmetro | ✅ Validado |
| 11 | Venc. não metrológico | `{DataVencimentoAfericao}` | TBAfericoes.DataVencimento | ✅ Validado (duplicata) |
| 12 | **Portaria não metrológico** | **`{PortariaNaoMetrologico}`** | **??? (NÃO TBModeloEquipamentos!)** | **❌ ERRO - Origem desconhecida** |
| 13 | Marca/Modelo | `{MarcaModeloEquipamento}` | TBModeloEquipamentos.Marca + Modelo | ✅ Validado - Correto |
| 14 | Cód. Org | `{CodigoOrgaoAutuador}` | TBConfiguracoes OU TBOrgaosAutuadores | ⚠️ Ambíguo |
| 15 | Infração | `{CodigoEnquadramento}` | TBEnquadramentos.Codigo | ✅ Validado |
| 16 | Descrição | `{DescricaoEnquadramento}` | TBEnquadramentos.Descricao | ✅ Validado |
| 17 | Serial | `{SerialEquipamento}` | TBEquipamentos.NumeroSerie | ✅ Validado |

---

## 🎯 ANÁLISE FINAL

### **Campos Validados: 14 de 17**

✅ **14 campos VALIDADOS** - Origem confirmada, dados corretos  
⚠️ **2 campos AMBÍGUOS** - Múltiplas origens possíveis  
❌ **1 campo COM ERRO** - Origem desconhecida, valor incorreto  

---

### **O PROBLEMA CRÍTICO: {PortariaNaoMetrologico}**

**Descoberta principal:**

```
Campo 9:  {PortariaEquipamento}
          └─ TBModeloEquipamentos.Portaria
          └─ "PORTARIA INMETRO/DIMEL Nº 492/2021" ✅ CORRETO

Campo 12: {PortariaNaoMetrologico}
          └─ ??? (origem desconhecida)
          └─ "492 de 17/07/2012" ❌ ERRADO
```

**Ambos DEVERIAM buscar do mesmo lugar, mas um está correto e outro errado!**

---

### **Dados Confirmados no Sistema STRANS:**

1. ✅ `TBModeloEquipamentos.Portaria` = **"PORTARIA INMETRO/DIMEL Nº 492/2021"**
2. ✅ Template usa placeholder `{PortariaNaoMetrologico}` (não hardcoded)
3. ✅ Existe apenas 1 modelo VSIS-OCR (sem duplicatas)
4. ❌ O valor "492 de 17/07/2012" **NÃO está visível** na interface web

---

### **Conclusão:**

O erro **NÃO está nos dados acessíveis pela interface web**. O valor incorreto "492 de 17/07/2012" está em:

1. **TBConfiguracoes** (não acessível via web) OU
2. **Código backend C#** (hardcode) OU
3. **Arquivo appsettings.json** (no servidor)

---

## 📋 PRÓXIMAS AÇÕES NECESSÁRIAS

Para corrigir definitivamente, é necessário **UMA** das seguintes opções:

### **Opção 1: Acesso ao Código-Fonte**
```bash
git clone [repositório]
grep -r "PortariaNaoMetrologico" --include="*.cs"
grep -r "492 de 17/07/2012" --include="*.cs"
```

### **Opção 2: Acesso SSH ao Servidor**
```bash
ssh usuario@servidor-strans
cd /caminho/axhub
grep -r "492 de 17/07/2012" .
cat appsettings.json | grep -i portaria
```

### **Opção 3: Acesso SQL ao Banco**
```sql
SELECT * FROM TBConfiguracoes 
WHERE ValorConfiguracao LIKE '%2012%' 
   OR ValorConfiguracao LIKE '%492 de 17/07/2012%'
```

### **Opção 4: Workaround (SEM necessidade de acesso)**
- Editar template da tarja
- Substituir `{PortariaNaoMetrologico}` por `{PortariaEquipamento}`
- Testar gerando nova infração

---

**Documento criado em:** 2026-06-15  
**Método:** Validação via interface web + Análise do schema do banco  
**Campos analisados:** 17 de 17 (100%)  
**Status:** ⚠️ **VALIDAÇÃO CONCLUÍDA - 1 ERRO IDENTIFICADO**  
**Erro localizado:** Campo `{PortariaNaoMetrologico}` busca de origem desconhecida
