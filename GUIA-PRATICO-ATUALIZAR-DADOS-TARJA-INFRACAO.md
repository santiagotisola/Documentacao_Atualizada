# 📖 GUIA PRÁTICO: Como Atualizar Informações da Tarja de Infração

**Sistema:** AxHub STRANS  
**Versão:** 2026  
**Última atualização:** 16/06/2026  

---

## 📋 ÍNDICE

1. [Introdução](#introdução)
2. [O que é a Tarja de Infração?](#o-que-é-a-tarja-de-infração)
3. [Como Funciona o Sistema de Tarjas](#como-funciona-o-sistema-de-tarjas)
4. [Guia Rápido: Alterando a Portaria](#guia-rápido-alterando-a-portaria)
5. [Guia Completo: Todos os 17 Campos da Tarja](#guia-completo-todos-os-17-campos-da-tarja)
6. [Perguntas Frequentes](#perguntas-frequentes)

---

## 📌 INTRODUÇÃO

Este guia ensina **passo a passo** como alterar as informações que aparecem nas **tarjas impressas** nas infrações de trânsito do sistema AxHub.

### ✅ O que você vai aprender:

- Como alterar a **portaria** que aparece na tarja
- Como atualizar **marca/modelo** do equipamento
- Como corrigir **endereço**, **faixa**, **sentido**
- Como atualizar **datas de aferição** e **certificados**
- Onde cada informação é configurada no sistema
- O que afeta infrações futuras vs infrações já geradas

### ⚠️ IMPORTANTE:

> **Alterações afetam apenas NOVAS infrações!**  
> Infrações já geradas NÃO são atualizadas automaticamente.  
> Para reprocessar infrações antigas, é necessário acesso técnico ao banco de dados.

---

## 🎯 O QUE É A TARJA DE INFRAÇÃO?

A **tarja** é a imagem impressa/sobreposta na foto da infração que contém informações como:

```
┌────────────────────────────────────────────────────────────┐
│  Cód. Equipamento: T5402                                   │
│  Endereço: Av. Exemplo, 1234                              │
│  Faixa: 1            Sentido: Crescente                   │
│  Data: 11/06/2026 14:30:00                                │
│  ───────────────────────────────────────────────────────  │
│  Data aferição: 12/01/2026                                │
│  Data venc. aferição: 12/01/2027                          │
│  Certif.: 12345/2026                                      │
│  Portaria: PORTARIA INMETRO/DIMEL Nº 492/2021            │
│  ───────────────────────────────────────────────────────  │
│  Reg. não metrológico: 67890                              │
│  Venc. não metrológico: 12/01/2027                        │
│  Portaria não metrológico: 492 de 17/07/2012             │
│  ───────────────────────────────────────────────────────  │
│  Marca/Modelo: VELSIS VSIS-OCR                            │
│  Cód. Org: 12345                                          │
│  Infração: 74550                                          │
│  Descrição: TRANSITAR...                                  │
│  Serial: SN123456                                         │
└────────────────────────────────────────────────────────────┘
```

Cada campo dessa tarja **busca informações de lugares diferentes** no sistema!

---

## 🔧 COMO FUNCIONA O SISTEMA DE TARJAS

### **1. Template de Tarja**

O template é um **modelo** que define:
- Quais informações aparecem
- Como são formatadas
- Onde são posicionadas na imagem

**Localização no sistema:**
```
STRANS → Configurações → Tarjas → Editar "Tarja Axion"
```

O template usa **variáveis** entre chaves `{NomeDaVariavel}` que são substituídas por valores reais na hora de gerar a infração.

**Exemplo de template:**
```
Cód. Equipamento : {CodigoEquipamento}
Endereço : {CodigoLocalOperacaoEquipamento}
Faixa : {NumeroFaixa}
Portaria : {PortariaEquipamento}
```

---

### **2. Variáveis do Template**

Cada variável busca dados de um **local específico** no sistema:

| Variável no Template | Busca de onde? |
|---------------------|----------------|
| `{PortariaEquipamento}` | Cadastro do Modelo do Equipamento |
| `{CodigoEquipamento}` | Cadastro do Equipamento |
| `{NumeroFaixa}` | Cadastro da Faixa |
| `{DataAfericaoInmetro}` | Cadastro da Aferição |

**Fluxo de dados:**
```
Sistema AxHub
    ↓
Cadastros (Modelo, Equipamento, Faixa, Aferição, etc.)
    ↓
Banco de Dados (tabelas TBModeloEquipamentos, TBEquipamentos, etc.)
    ↓
Template da Tarja (substitui {Variaveis} por valores)
    ↓
Imagem da Infração (tarja impressa na foto)
```

---

## 🚀 GUIA RÁPIDO: ALTERANDO A PORTARIA

### **Cenário:** Corrigir portaria que aparece como "492 de 17/07/2012" para "PORTARIA INMETRO/DIMEL Nº 492/2021"

---

### **OPÇÃO 1: Alterar no Cadastro do Modelo (RECOMENDADO)**

#### ✅ **Vantagens:**
- Correção permanente
- Afeta todos equipamentos deste modelo
- Mantém consistência no sistema

#### 📍 **Passo a Passo:**

1. **Acessar STRANS:**
   ```
   https://strans.axhub.axion.ws
   Login: Admin
   Senha: Labor#5383
   ```

2. **Ir para Cadastros:**
   ```
   Menu → Cadastros → Modelos de Equipamentos
   ```

3. **Localizar o modelo:**
   - Pesquisar por: "VSIS-OCR"
   - Marca: VELSIS

4. **Editar o modelo:**
   - Clicar em "Editar" (ícone de lápis)

5. **Localizar o campo "Portaria":**
   - Verificar valor atual
   - Se estiver errado, corrigir para:
   ```
   PORTARIA INMETRO/DIMEL Nº 492/2021
   ```

6. **Salvar:**
   - Clicar em "Salvar" ou "Confirmar"

7. **Validar:**
   - Gerar uma nova infração de teste
   - Verificar se a portaria aparece correta

#### ⏱️ **Tempo estimado:** 5 minutos

---

### **OPÇÃO 2: Alterar o Template da Tarja (WORKAROUND)**

#### ⚠️ **Quando usar:**
- Quando a portaria está correta no cadastro, mas errada na tarja
- Quando existe duplicidade de variáveis no template
- Como solução temporária

#### 📍 **Passo a Passo:**

1. **Acessar STRANS:**
   ```
   https://strans.axhub.axion.ws
   ```

2. **Ir para Configurações:**
   ```
   Menu → Configurações → Tarjas
   ```

3. **Editar a tarja:**
   - Localizar "Tarja Axion"
   - Clicar em "Editar"

4. **Localizar no Template:**
   ```
   Portaria não metrológico : {PortariaNaoMetrologico}
   ```

5. **Substituir por:**
   ```
   Portaria não metrológico : {PortariaEquipamento}
   ```

6. **Salvar:**
   - Clicar em "Salvar"

7. **Validar:**
   - Gerar nova infração de teste
   - Verificar se ambas as portarias aparecem corretas

#### ⏱️ **Tempo estimado:** 3 minutos

---

### **OPÇÃO 3: Alterar Diretamente no Banco de Dados**

#### ⚠️ **Requer:**
- Acesso SQL ao banco de dados
- Conhecimento técnico
- Backup antes de alterar

#### 📍 **Query SQL:**

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

-- Atualizar se necessário
UPDATE TBModeloEquipamentos
SET 
    Portaria = 'PORTARIA INMETRO/DIMEL Nº 492/2021',
    NumeroPortaria = 492
WHERE Modelo = 'VSIS-OCR'
```

#### ⏱️ **Tempo estimado:** 2 minutos (para quem tem acesso SQL)

---

## 📚 GUIA COMPLETO: TODOS OS 17 CAMPOS DA TARJA

### **CAMPO #1: Código do Equipamento**

**Aparece na tarja como:**
```
Cód. Equipamento : T5402
```

**Variável do template:**
```
{CodigoEquipamento}
```

**Onde alterar:**
```
Menu → Cadastros → Equipamentos → Selecionar equipamento → Editar
Campo: "Código"
```

**Origem dos dados:**
```
Tabela: TBEquipamentos
Campo: Codigo
```

**Como alterar:**

1. Acessar: Cadastros → Equipamentos
2. Localizar o equipamento (buscar por código, endereço, ou modelo)
3. Clicar em "Editar"
4. Alterar o campo "Código"
5. Salvar

**⚠️ ATENÇÃO:**
- Alterar o código pode afetar relatórios e históricos
- Recomendado: **NÃO alterar** após equipamento em uso
- Se necessário alterar, documentar a mudança

**Quando afeta a tarja:**
- ✅ Novas infrações: SIM
- ❌ Infrações antigas: NÃO

---

### **CAMPO #2: Endereço**

**Aparece na tarja como:**
```
Endereço : Av. Exemplo, 1234 - Bairro
```

**Variável do template:**
```
{CodigoLocalOperacaoEquipamento}
```

**Onde alterar:**
```
Menu → Cadastros → Operações → Selecionar operação → Editar
Campo: "Endereço"
```

**Origem dos dados:**
```
Tabela: TBOperacoes
Campo: Endereco
```

**Como alterar:**

1. Acessar: Cadastros → Operações
2. Localizar a operação do equipamento
3. Clicar em "Editar"
4. Alterar o campo "Endereço"
5. Salvar

**💡 DICA:**
- Uma operação agrupa vários equipamentos do mesmo local
- Alterar o endereço da operação afeta TODOS os equipamentos vinculados
- Formato recomendado: "Logradouro, Número - Bairro"

**Quando afeta a tarja:**
- ✅ Novas infrações: SIM
- ❌ Infrações antigas: NÃO

---

### **CAMPO #3: Número da Faixa**

**Aparece na tarja como:**
```
Faixa : 1
```

**Variável do template:**
```
{NumeroFaixa}
```

**Onde alterar:**
```
Menu → Cadastros → Equipamentos → Selecionar equipamento → Aba "Faixas" → Editar faixa
Campo: "Número"
```

**Origem dos dados:**
```
Tabela: TBFaixas
Campo: NumeroFaixa
```

**Como alterar:**

1. Acessar: Cadastros → Equipamentos
2. Localizar o equipamento
3. Clicar na aba "Faixas"
4. Selecionar a faixa desejada
5. Clicar em "Editar"
6. Alterar o campo "Número"
7. Salvar

**⚠️ ATENÇÃO:**
- Alterar o número da faixa pode confundir análises de dados
- Recomendado: **NÃO alterar** após faixa em uso
- Se necessário, desativar a faixa antiga e criar nova

**Quando afeta a tarja:**
- ✅ Novas infrações: SIM
- ❌ Infrações antigas: NÃO

---

### **CAMPO #4: Sentido**

**Aparece na tarja como:**
```
Sentido : Crescente
```

**Variável do template:**
```
{SentidoFaixa}
```

**Onde alterar:**
```
Menu → Cadastros → Equipamentos → Selecionar equipamento → Aba "Faixas" → Editar faixa
Campo: "Sentido"
```

**Origem dos dados:**
```
Tabela: TBFaixas
Campo: Sentido
```

**Como alterar:**

1. Acessar: Cadastros → Equipamentos
2. Localizar o equipamento
3. Clicar na aba "Faixas"
4. Selecionar a faixa
5. Clicar em "Editar"
6. Alterar o campo "Sentido"
   - Opções: Crescente, Decrescente
7. Salvar

**💡 DICA:**
- "Crescente": veículos trafegam no sentido da numeração crescente das ruas
- "Decrescente": veículos trafegam no sentido da numeração decrescente
- Importante para identificar corretamente a direção do veículo

**Quando afeta a tarja:**
- ✅ Novas infrações: SIM
- ❌ Infrações antigas: NÃO

---

### **CAMPO #5: Data da Infração**

**Aparece na tarja como:**
```
Data : 11/06/2026 14:30:00
```

**Variável do template:**
```
{DataPassagemInfracao}
```

**Onde vem:**
```
Capturado AUTOMATICAMENTE pelo equipamento no momento da infração
```

**Origem dos dados:**
```
Tabela: TBInfracoes
Campo: DataHoraInfracao
```

**Como alterar:**

⚠️ **ESTE CAMPO NÃO DEVE SER ALTERADO MANUALMENTE!**

Razões:
- É gerado automaticamente pelo equipamento
- Reflete o momento real da infração
- Alteração pode invalidar a infração legalmente
- Requer sincronização de relógio do equipamento

**Se a data estiver errada:**

1. **Verificar relógio do equipamento:**
   - Acessar interface do equipamento
   - Verificar configuração de data/hora
   - Sincronizar com servidor NTP se disponível

2. **Ajustar fuso horário:**
   - Cadastros → Equipamentos → Editar
   - Verificar campo "Fuso Horário" (se disponível)

3. **Para infrações já geradas com data errada:**
   - Requer acesso SQL ao banco de dados
   - Consultar equipe técnica

**Quando afeta a tarja:**
- ✅ Automático (capturado na hora da infração)

---

### **CAMPO #6: Data da Aferição**

**Aparece na tarja como:**
```
Data aferição : 12/01/2026
```

**Variável do template:**
```
{DataAfericaoInmetro}
```

**Onde alterar:**
```
Menu → Cadastros → Aferições → Selecionar aferição → Editar
Campo: "Data da Aferição"
```

**Origem dos dados:**
```
Tabela: TBAfericoes
Campo: DataAfericao
```

**Como alterar:**

1. **Acessar: Cadastros → Aferições**

2. **Localizar a aferição:**
   - Filtrar por equipamento
   - Ordenar por data (mais recente primeiro)

3. **Editar a aferição:**
   - Clicar em "Editar"
   - Alterar "Data da Aferição"
   - Formato: DD/MM/AAAA

4. **Salvar**

**💡 QUANDO CRIAR NOVA AFERIÇÃO:**

1. **Ao receber certificado do INMETRO:**
   - Criar nova aferição com data do certificado
   - Preencher todos os campos obrigatórios
   - Anexar PDF do certificado (se sistema permitir)

2. **Vincular equipamento e faixas:**
   - Na aba "Equipamentos", adicionar o equipamento
   - Selecionar quais faixas são cobertas pela aferição
   - Definir data de vencimento (geralmente 1 ano após)

**⚠️ ATENÇÃO:**
- A aferição mais recente é a que aparece na tarja
- Aferições vencidas podem invalidar infrações
- Manter calendário de aferições atualizado

**Quando afeta a tarja:**
- ✅ Novas infrações: SIM (usa aferição mais recente)
- ❌ Infrações antigas: NÃO

---

### **CAMPO #7: Data de Vencimento da Aferição**

**Aparece na tarja como:**
```
Data venc. aferição : 12/01/2027
```

**Variável do template:**
```
{DataVencimentoAfericao}
```

**Onde alterar:**
```
Menu → Cadastros → Aferições → Selecionar aferição → Editar
Campo: "Data de Vencimento"
```

**Origem dos dados:**
```
Tabela: TBAfericoes
Campo: DataVencimento
```

**Como alterar:**

1. Acessar: Cadastros → Aferições
2. Localizar a aferição
3. Clicar em "Editar"
4. Alterar "Data de Vencimento"
5. Salvar

**💡 REGRAS IMPORTANTES:**

- **Validade típica:** 12 meses a partir da data de aferição
- **Cálculo:** Data Vencimento = Data Aferição + 12 meses
- **Exemplo:**
  - Aferição: 12/01/2026
  - Vencimento: 12/01/2027

**⚠️ ALERTAS DO SISTEMA:**

O sistema deve alertar quando:
- Aferição está próxima do vencimento (ex: 30 dias antes)
- Aferição está vencida
- Equipamento opera com aferição vencida (infrações inválidas!)

**Quando afeta a tarja:**
- ✅ Novas infrações: SIM
- ❌ Infrações antigas: NÃO

---

### **CAMPO #8: Certificado**

**Aparece na tarja como:**
```
Certif. : 12345/2026
```

**Variável do template:**
```
{CertificadoEquipamento}
```

**Onde alterar:**
```
OPÇÃO 1: Menu → Cadastros → Equipamentos → Editar → Campo "Certificado"
OPÇÃO 2: Menu → Cadastros → Aferições → Editar → Campo "Número INMETRO"
```

**Origem dos dados:**
```
⚠️ AMBÍGUA - Pode vir de:
Tabela: TBEquipamentos, Campo: Certificado
   OU
Tabela: TBAfericoes, Campo: NumeroInmetro
```

**Como alterar (OPÇÃO 1 - No Equipamento):**

1. Acessar: Cadastros → Equipamentos
2. Localizar o equipamento
3. Clicar em "Editar"
4. Localizar campo "Certificado" ou "Número do Certificado"
5. Alterar para o número do certificado INMETRO
6. Formato: "12345/2026"
7. Salvar

**Como alterar (OPÇÃO 2 - Na Aferição):**

1. Acessar: Cadastros → Aferições
2. Localizar a aferição mais recente
3. Clicar em "Editar"
4. Localizar campo "Número INMETRO" ou similar
5. Alterar para o número do certificado
6. Salvar

**💡 RECOMENDAÇÃO:**

- Manter consistente entre Equipamento e Aferição
- Atualizar AMBOS quando receber novo certificado
- Formato padrão: "NumeroSequencial/Ano"
- Exemplo: "54321/2026"

**Quando afeta a tarja:**
- ✅ Novas infrações: SIM
- ❌ Infrações antigas: NÃO

---

### **CAMPO #9: Portaria do Equipamento** ⭐

**Aparece na tarja como:**
```
Portaria : PORTARIA INMETRO/DIMEL Nº 492/2021
```

**Variável do template:**
```
{PortariaEquipamento}
```

**Onde alterar:**
```
Menu → Cadastros → Modelos de Equipamentos → Selecionar modelo → Editar
Campo: "Portaria"
```

**Origem dos dados:**
```
Tabela: TBModeloEquipamentos
Campo: Portaria
```

**Como alterar:**

1. **Acessar: Cadastros → Modelos de Equipamentos**

2. **Localizar o modelo:**
   - Buscar por: "VSIS-OCR" (ou nome do seu modelo)
   - Marca: VELSIS (ou fabricante do seu equipamento)

3. **Editar o modelo:**
   - Clicar em "Editar"

4. **Alterar o campo "Portaria":**
   - Formato recomendado: "PORTARIA INMETRO/DIMEL Nº XXX/AAAA"
   - Exemplo: "PORTARIA INMETRO/DIMEL Nº 492/2021"

5. **Alterar também "Número da Portaria":**
   - Campo: "Número Portaria" ou similar
   - Apenas o número: 492

6. **Salvar**

**📋 PORTARIAS COMUNS:**

| Portaria | Aplicação | Data Publicação |
|----------|-----------|-----------------|
| 492/2021 | Sistemas de Aferição de Velocidade | 10/12/2021 |
| 541/2021 | Sistemas de Pesagem | 28/12/2021 |
| 115/2019 | Etilômetros | 20/03/2019 |

**💡 IMPORTANTE:**

- A portaria é definida no **MODELO**, não no equipamento individual
- Alterar a portaria do modelo afeta **TODOS os equipamentos** deste modelo
- Verificar a portaria correta no site do INMETRO: https://www.gov.br/inmetro

**Quando afeta a tarja:**
- ✅ Novas infrações: SIM
- ❌ Infrações antigas: NÃO

---

### **CAMPO #10: Registro Não Metrológico**

**Aparece na tarja como:**
```
Reg. não metrológico : 67890
```

**Variável do template:**
```
{NumeroCertificadoInmetro}
```

**Onde alterar:**
```
Menu → Cadastros → Aferições → Selecionar aferição → Editar
Campo: "Número INMETRO" ou "Registro"
```

**Origem dos dados:**
```
Tabela: TBAfericoes
Campo: NumeroInmetro
```

**Como alterar:**

1. Acessar: Cadastros → Aferições
2. Localizar a aferição mais recente
3. Clicar em "Editar"
4. Localizar campo "Número INMETRO"
5. Alterar para o número do certificado INMETRO
6. Salvar

**💡 DIFERENÇA: Certificado vs Registro:**

- **Certificado (Campo #8):** Número do documento de aferição
- **Registro (Campo #10):** Número de registro do equipamento no INMETRO

Ambos podem ser o mesmo valor, mas conceitualmente são diferentes!

**Quando afeta a tarja:**
- ✅ Novas infrações: SIM
- ❌ Infrações antigas: NÃO

---

### **CAMPO #11: Vencimento Não Metrológico**

**Aparece na tarja como:**
```
Venc. não metrológico : 12/01/2027
```

**Variável do template:**
```
{DataVencimentoAfericao}
```

**Onde alterar:**
```
Menu → Cadastros → Aferições → Selecionar aferição → Editar
Campo: "Data de Vencimento"
```

**Origem dos dados:**
```
Tabela: TBAfericoes
Campo: DataVencimento
```

**Como alterar:**

Mesmo procedimento do **Campo #7** (Data Venc. Aferição)

**⚠️ NOTA:**
- Este campo é uma **duplicata** do Campo #7
- A mesma variável `{DataVencimentoAfericao}` é usada duas vezes no template
- Alterar uma vez afeta ambas as ocorrências na tarja

---

### **CAMPO #12: Portaria Não Metrológico** ⚠️ **ERRO CONHECIDO**

**Aparece na tarja como:**
```
Portaria não metrológico : 492 de 17/07/2012 ❌ ERRADO!
```

**Deveria aparecer:**
```
Portaria não metrológico : PORTARIA INMETRO/DIMEL Nº 492/2021 ✅
```

**Variável do template:**
```
{PortariaNaoMetrologico}
```

**Problema identificado:**
- Esta variável **NÃO busca** de `TBModeloEquipamentos.Portaria`
- O valor "492 de 17/07/2012" vem de **origem desconhecida**
- Pode ser: configuração global, código backend, ou cache

**Onde DEVERIA alterar:**
```
⚠️ ORIGEM DESCONHECIDA - Requer investigação técnica
```

**SOLUÇÃO TEMPORÁRIA (Workaround):**

Editar o template da tarja e substituir a variável:

1. Acessar: Configurações → Tarjas
2. Editar "Tarja Axion"
3. Localizar:
   ```
   Portaria não metrológico : {PortariaNaoMetrologico}
   ```
4. Substituir por:
   ```
   Portaria não metrológico : {PortariaEquipamento}
   ```
5. Salvar

**SOLUÇÃO DEFINITIVA:**

Requer acesso técnico:
- Verificar tabela `TBConfiguracoes` no banco de dados
- Verificar código-fonte do backend (TarjaService.cs)
- Verificar arquivo `appsettings.json` no servidor

**Para investigação técnica completa, consultar:**
- [VALIDACAO-COMPLETA-TODOS-CAMPOS-TARJA.md](VALIDACAO-COMPLETA-TODOS-CAMPOS-TARJA.md)
- [GUIA-CORRECAO-ERRO-PORTARIA-492-2012.md](GUIA-CORRECAO-ERRO-PORTARIA-492-2012.md)

---

### **CAMPO #13: Marca/Modelo do Equipamento**

**Aparece na tarja como:**
```
Marca/Modelo : VELSIS VSIS-OCR
```

**Variável do template:**
```
{MarcaModeloEquipamento}
```

**Onde alterar:**
```
Menu → Cadastros → Modelos de Equipamentos → Selecionar modelo → Editar
Campos: "Marca" e "Modelo"
```

**Origem dos dados:**
```
Tabela: TBModeloEquipamentos
Campos: Marca + Modelo (concatenados)
```

**Como alterar:**

1. **Acessar: Cadastros → Modelos de Equipamentos**

2. **Localizar o modelo:**
   - Buscar pelo nome atual

3. **Editar o modelo:**
   - Clicar em "Editar"

4. **Alterar os campos:**
   - **Marca:** Nome do fabricante (ex: "VELSIS", "GATSO", "PERKONS")
   - **Modelo:** Nome do modelo (ex: "VSIS-OCR", "MILLIA", "VECTRA")

5. **Salvar**

**💡 FORMATAÇÃO:**

O sistema concatena automaticamente: `Marca + " " + Modelo`

Exemplo:
- Marca: "VELSIS"
- Modelo: "VSIS-OCR"
- Resultado na tarja: "VELSIS VSIS-OCR"

**⚠️ ATENÇÃO:**

- Alterar marca/modelo afeta **TODOS os equipamentos** deste modelo
- Recomendado: **NÃO alterar** após equipamentos em uso
- Se necessário, criar novo modelo e migrar equipamentos

**Quando afeta a tarja:**
- ✅ Novas infrações: SIM
- ❌ Infrações antigas: NÃO

---

### **CAMPO #14: Código do Órgão Autuador**

**Aparece na tarja como:**
```
Cód. Org : 12345
```

**Variável do template:**
```
{CodigoOrgaoAutuador}
```

**Onde alterar:**
```
OPÇÃO 1: Menu → Configurações → Geral → Campo "Código Órgão Autuador"
OPÇÃO 2: Menu → Cadastros → Órgãos Autuadores → Editar
```

**Origem dos dados:**
```
⚠️ AMBÍGUA - Pode vir de:
Tabela: TBConfiguracoes
   OU
Tabela: TBOrgaosAutuadores
```

**Como alterar (OPÇÃO 1 - Configuração Global):**

1. Acessar: Configurações → Geral ou Parâmetros
2. Localizar seção "Órgão Autuador"
3. Campo: "Código" ou "Código RENAINF"
4. Alterar o código
5. Salvar

**Como alterar (OPÇÃO 2 - Cadastro de Órgãos):**

1. Acessar: Cadastros → Órgãos Autuadores
2. Localizar o órgão autuador principal
3. Clicar em "Editar"
4. Campo: "Código"
5. Alterar o código
6. Salvar

**💡 O QUE É:**

- Código RENAINF do órgão autuador
- Usado para identificar o órgão nos sistemas nacionais
- Geralmente 5 dígitos
- Exemplo: "12345" para STRANS de determinado município

**Quando afeta a tarja:**
- ✅ Novas infrações: SIM
- ❌ Infrações antigas: NÃO

---

### **CAMPO #15: Código da Infração**

**Aparece na tarja como:**
```
Infração : 74550
```

**Variável do template:**
```
{CodigoEnquadramento}
```

**Onde alterar:**
```
Menu → Cadastros → Enquadramentos → Selecionar enquadramento → Editar
Campo: "Código"
```

**Origem dos dados:**
```
Tabela: TBEnquadramentos
Campo: Codigo
```

**Como alterar:**

1. **Acessar: Cadastros → Enquadramentos**

2. **Localizar o enquadramento:**
   - Buscar pelo código atual (ex: 74550)
   - Ou pela descrição

3. **Editar:**
   - Clicar em "Editar"
   - Alterar campo "Código"
   - Seguir numeração do CTB (Código de Trânsito Brasileiro)

4. **Salvar**

**📋 CÓDIGOS COMUNS:**

| Código | Descrição | Velocidade |
|--------|-----------|------------|
| 74550 | Excesso até 20% | Até 20% acima |
| 74520 | Excesso 20% a 50% | Entre 20% e 50% |
| 74740 | Excesso acima de 50% | Mais de 50% |
| 76320 | Avanço de sinal vermelho | - |
| 76710 | Conversão proibida | - |

**⚠️ IMPORTANTE:**

- O código deve seguir o CTB
- Código errado = infração inválida legalmente
- NÃO alterar códigos já em uso no sistema

**Quando afeta a tarja:**
- ✅ Novas infrações: SIM (depende do enquadramento aplicado)
- ❌ Infrações antigas: NÃO

---

### **CAMPO #16: Descrição da Infração**

**Aparece na tarja como:**
```
Descrição : TRANSITAR EM VELOCIDADE SUPERIOR À MÁXIMA PERMITIDA EM ATÉ VINTE POR CENTO
```

**Variável do template:**
```
{DescricaoEnquadramento}
```

**Onde alterar:**
```
Menu → Cadastros → Enquadramentos → Selecionar enquadramento → Editar
Campo: "Descrição"
```

**Origem dos dados:**
```
Tabela: TBEnquadramentos
Campo: Descricao
```

**Como alterar:**

1. Acessar: Cadastros → Enquadramentos
2. Localizar o enquadramento
3. Clicar em "Editar"
4. Alterar campo "Descrição"
5. Usar texto conforme CTB
6. Salvar

**💡 FORMATO:**

- Usar CAIXA ALTA (geralmente)
- Seguir texto exato do Artigo do CTB
- Ser claro e objetivo
- Incluir detalhes da infração

**Exemplo completo:**
```
Artigo: 218, Inciso I
Código: 74550
Descrição: TRANSITAR EM VELOCIDADE SUPERIOR À MÁXIMA PERMITIDA EM ATÉ VINTE POR CENTO
```

**Quando afeta a tarja:**
- ✅ Novas infrações: SIM (depende do enquadramento aplicado)
- ❌ Infrações antigas: NÃO

---

### **CAMPO #17: Serial do Equipamento**

**Aparece na tarja como:**
```
Serial : SN123456
```

**Variável do template:**
```
{SerialEquipamento}
```

**Onde alterar:**
```
Menu → Cadastros → Equipamentos → Selecionar equipamento → Editar
Campo: "Número de Série" ou "Serial"
```

**Origem dos dados:**
```
Tabela: TBEquipamentos
Campo: NumeroSerie
```

**Como alterar:**

1. Acessar: Cadastros → Equipamentos
2. Localizar o equipamento
3. Clicar em "Editar"
4. Alterar campo "Número de Série" ou "Serial"
5. Usar o serial da etiqueta do equipamento
6. Salvar

**💡 ONDE ENCONTRAR:**

- Etiqueta física no equipamento
- Manual do equipamento
- Nota fiscal de compra
- Certificado INMETRO

**⚠️ IMPORTANTE:**

- O serial é único para cada equipamento
- NÃO alterar a menos que esteja errado no cadastro
- Manter registro em caso de troca/manutenção

**Quando afeta a tarja:**
- ✅ Novas infrações: SIM
- ❌ Infrações antigas: NÃO

---

## ❓ PERGUNTAS FREQUENTES

### **1. Alterei o campo no sistema, mas a tarja ainda mostra o valor antigo. Por quê?**

**Resposta:**

As alterações afetam apenas **NOVAS infrações**. Infrações já geradas permanecem com os dados antigos.

**Soluções:**

a) **Aguardar nova infração:**
   - As próximas infrações virão com dados atualizados

b) **Reprocessar infrações antigas (requer SQL):**
   ```sql
   -- EXEMPLO - NÃO executar sem backup!
   UPDATE TBInfracoes
   SET ReprocessarTarja = 1
   WHERE DataHoraInfracao > '2026-06-01'
   ```

c) **Cache do sistema:**
   - Reiniciar aplicação web
   - Limpar cache do navegador
   - Aguardar alguns minutos

---

### **2. Posso alterar a tarja de uma infração já gerada?**

**Resposta:**

⚠️ **Tecnicamente sim, mas NÃO é recomendado!**

**Por quê:**
- A tarja reflete os dados no momento da infração
- Alterar retroativamente pode invalidar a infração legalmente
- Pode ser considerado adulteração de documento

**Quando pode:**
- Correção de erro evidente (ex: endereço errado)
- Autorização formal do gestor
- Documentação da alteração
- Acesso técnico ao banco de dados

**Como fazer (requer SQL):**
```sql
-- Marcar infração para reprocessar
UPDATE TBInfracoes
SET ReprocessarTarja = 1
WHERE IdInfracao = 'GUID-DA-INFRACAO'

-- Executar rotina de reprocessamento
EXEC sp_ReprocessarTarjas
```

---

### **3. Alterei a portaria no modelo, mas a tarja ainda mostra errada. O que fazer?**

**Possíveis causas:**

**Causa 1: Template usa variável errada**
- Verificar se template usa `{PortariaEquipamento}` ou `{PortariaNaoMetrologico}`
- Se usar `{PortariaNaoMetrologico}`, existe bug conhecido (ver Campo #12)
- **Solução:** Alterar template para usar `{PortariaEquipamento}`

**Causa 2: Cache do sistema**
- Sistema pode ter cache de dados de modelo
- **Solução:** Reiniciar aplicação ou aguardar cache expirar

**Causa 3: Múltiplos modelos**
- Verificar se há outro modelo VSIS-OCR cadastrado
- **Solução:** Consolidar para um único modelo

**Causa 4: Configuração sobrescreve modelo**
- Tabela `TBConfiguracoes` pode ter configuração global
- **Solução:** Verificar/corrigir via SQL

---

### **4. Como sei qual campo alterar para corrigir uma informação específica?**

**Use a tabela de referência rápida:**

| Informação Errada | Onde Alterar |
|-------------------|--------------|
| Código do equipamento | Cadastros → Equipamentos |
| Endereço | Cadastros → Operações |
| Faixa/Sentido | Cadastros → Equipamentos → Aba Faixas |
| Portaria | Cadastros → Modelos de Equipamentos |
| Marca/Modelo | Cadastros → Modelos de Equipamentos |
| Data/Certificado aferição | Cadastros → Aferições |
| Serial | Cadastros → Equipamentos |
| Código infração | Cadastros → Enquadramentos |
| Descrição infração | Cadastros → Enquadramentos |
| Código órgão | Configurações → Geral |

**Ou consulte este guia no campo específico!**

---

### **5. Preciso alterar o template da tarja. Como faço?**

**Passo a passo:**

1. **Acessar:**
   ```
   Menu → Configurações → Tarjas
   ```

2. **Editar a tarja:**
   - Localizar "Tarja Axion" (ou nome da sua tarja)
   - Clicar em "Editar"

3. **Alterar o template:**
   - Campo: "Template" ou "Layout"
   - Usar variáveis entre chaves: `{NomeDaVariavel}`
   - Consultar lista de variáveis disponíveis

4. **Variáveis disponíveis:**
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
   - Salvar alterações
   - Gerar infração de teste
   - Verificar resultado

---

### **6. Posso ter múltiplas tarjas diferentes no sistema?**

**Sim!** O sistema permite criar várias tarjas.

**Usos comuns:**

- Tarja para infrações de velocidade
- Tarja para avanço de sinal
- Tarja para pesagem (AxTon)
- Tarja para monitoramento (AxCross)
- Tarja simplificada vs completa

**Como configurar qual tarja usar:**

1. **Por tipo de infração:**
   - Cadastros → Enquadramentos → Editar
   - Campo: "Tarja padrão" ou similar

2. **Por equipamento:**
   - Cadastros → Equipamentos → Editar
   - Campo: "Template de tarja"

3. **Por operação:**
   - Cadastros → Operações → Editar
   - Campo: "Tarja padrão"

---

### **7. Como adiciono uma nova informação na tarja que não existe?**

**Requer desenvolvimento:**

1. **Verificar se variável existe:**
   - Conferir lista de variáveis disponíveis no template

2. **Se variável NÃO existe:**
   - Requer desenvolvimento backend
   - Criar nova variável no código C#
   - Mapear para campo do banco de dados
   - Adicionar ao processador de tarjas

3. **Exemplo de nova variável:**
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

**💡 Consulte equipe de desenvolvimento!**

---

### **8. O que acontece se eu deixar uma aferição vencer?**

**Consequências:**

1. **Infrações podem ser invalidadas:**
   - Infrações geradas com aferição vencida são juridicamente questionáveis
   - Defesas de autuação podem ser aceitas

2. **Sistema pode bloquear:**
   - Dependendo da configuração, sistema pode:
     - Bloquear geração de novas infrações
     - Emitir alerta vermelho
     - Exigir nova aferição

3. **Processo legal:**
   - Equipamento opera ilegalmente
   - Órgão autuador pode ser responsabilizado

**Como evitar:**

1. **Calendário de aferições:**
   - Agendar aferição 60 dias antes do vencimento
   - Manter planilha de controle

2. **Alertas do sistema:**
   - Configurar alertas 30 dias antes
   - Monitorar dashboard de vencimentos

3. **Renovação:**
   - Contratar empresa credenciada INMETRO
   - Receber certificado
   - Cadastrar nova aferição no sistema
   - Vincular equipamento e faixas

---

### **9. Posso usar a mesma aferição para vários equipamentos?**

**Sim, SE:**

- Os equipamentos estão fisicamente juntos
- A aferição foi feita para o conjunto
- O certificado INMETRO lista todos os equipamentos
- As faixas estão todas cobertas pela aferição

**Como fazer:**

1. **Cadastrar a aferição:**
   - Cadastros → Aferições → Nova

2. **Vincular múltiplos equipamentos:**
   - Na aba "Equipamentos"
   - Adicionar cada equipamento
   - Selecionar faixas de cada um

3. **Resultado:**
   - Todos os equipamentos vinculados usarão esta aferição
   - Data de vencimento compartilhada

**⚠️ ATENÇÃO:**

- Certificado INMETRO deve cobrir todos os equipamentos
- Não vincular equipamentos que não estão no certificado

---

### **10. Como faço backup antes de alterar informações críticas?**

**Recomendação: SEMPRE fazer backup antes de alterações!**

**Opção 1: Backup pelo sistema (se disponível):**
```
Menu → Configurações → Backup → Gerar Backup Completo
```

**Opção 2: Backup do banco de dados (recomendado):**
```sql
-- SQL Server
BACKUP DATABASE AxHub
TO DISK = 'C:\Backup\AxHub_2026-06-16.bak'
WITH COMPRESSION, INIT
```

**Opção 3: Exportar cadastros específicos:**
- Cadastros → Modelos de Equipamentos → Exportar para Excel
- Cadastros → Equipamentos → Exportar para Excel
- Etc.

**Antes de alterações críticas, documente:**
1. Data/hora da alteração
2. Usuário responsável
3. Valor antigo
4. Valor novo
5. Motivo da alteração

---

## 📊 TABELA DE REFERÊNCIA RÁPIDA

### **Impacto das Alterações**

| Campo | Afeta Novas Infrações | Afeta Infrações Antigas | Requer Reinício |
|-------|----------------------|------------------------|----------------|
| Código Equipamento | ✅ SIM | ❌ NÃO | ❌ NÃO |
| Endereço | ✅ SIM | ❌ NÃO | ❌ NÃO |
| Faixa/Sentido | ✅ SIM | ❌ NÃO | ❌ NÃO |
| Portaria Modelo | ✅ SIM | ❌ NÃO | ⚠️ Cache 5min |
| Marca/Modelo | ✅ SIM | ❌ NÃO | ⚠️ Cache 5min |
| Aferição (datas) | ✅ SIM | ❌ NÃO | ❌ NÃO |
| Certificado | ✅ SIM | ❌ NÃO | ❌ NÃO |
| Serial | ✅ SIM | ❌ NÃO | ❌ NÃO |
| Enquadramento | ⚠️ DEPENDE | ❌ NÃO | ❌ NÃO |
| Código Órgão | ✅ SIM | ❌ NÃO | ⚠️ Cache |
| Template Tarja | ✅ SIM | ❌ NÃO | ❌ NÃO |

---

### **Hierarquia de Dados**

```
MODELO DE EQUIPAMENTO (ex: VSIS-OCR)
├── Portaria ← TODOS equipamentos deste modelo
├── Marca ← TODOS equipamentos deste modelo
└── Modelo ← TODOS equipamentos deste modelo
    │
    └── EQUIPAMENTO (ex: T5402)
        ├── Código ← Específico deste equipamento
        ├── Serial ← Específico deste equipamento
        └── Certificado ← Específico deste equipamento
            │
            └── OPERAÇÃO (ex: Av. Exemplo)
                ├── Endereço ← Todos equipamentos desta operação
                └── Código Órgão ← Geralmente global
                    │
                    └── FAIXAS (ex: Faixa 1, 2, 3)
                        ├── Número ← Específico desta faixa
                        └── Sentido ← Específico desta faixa
                            │
                            └── AFERIÇÃO (ex: Jan/2026)
                                ├── Data Aferição ← Equipamento + Faixas
                                ├── Data Vencimento ← Equipamento + Faixas
                                └── Número INMETRO ← Equipamento + Faixas
                                    │
                                    └── INFRAÇÃO (gerada)
                                        ├── Data/Hora ← Automático
                                        ├── Enquadramento ← Conforme detecção
                                        └── TARJA ← Busca TODOS dados acima
```

---

## 🎯 CHECKLIST DE VALIDAÇÃO

Após alterar informações, validar:

```
□ Dados foram salvos corretamente no sistema
□ Mensagem de sucesso foi exibida
□ Não há mensagens de erro
□ Valores aparecem corretos ao reabrir cadastro
□ Gerou infração de teste
□ Tarja da infração de teste mostra dados atualizados
□ Formato dos dados está correto (datas, códigos, etc.)
□ Documentou a alteração (se crítica)
□ Backup foi feito antes (se crítica)
□ Equipe foi notificada (se afeta múltiplos usuários)
```

---

## 📞 SUPORTE

**Em caso de dúvidas ou problemas:**

1. **Consultar documentação:**
   - Este guia
   - [VALIDACAO-COMPLETA-TODOS-CAMPOS-TARJA.md](VALIDACAO-COMPLETA-TODOS-CAMPOS-TARJA.md)
   - [RESUMO-EXECUTIVO-VALIDACAO-TARJA.md](RESUMO-EXECUTIVO-VALIDACAO-TARJA.md)

2. **Abrir chamado no helpdesk:**
   - Sistema Jitbit
   - Categoria: "AxHub - Configurações"
   - Incluir: prints, descrição do problema, equipamento afetado

3. **Contato técnico:**
   - Equipe Axion: suporte@axion.ws
   - Telefone: (XX) XXXX-XXXX
   - Horário: Seg-Sex 8h-18h

---

## 🎓 GLOSSÁRIO

**Aferição:** Processo de calibração e certificação do equipamento pelo INMETRO

**INMETRO:** Instituto Nacional de Metrologia, Qualidade e Tecnologia - órgão que certifica equipamentos

**Portaria:** Norma legal que regulamenta o uso de equipamentos de fiscalização

**Template:** Modelo/layout que define como a tarja será exibida

**Tarja:** Imagem sobreposta na foto da infração contendo informações do equipamento

**Variável:** Placeholder no template que é substituído por valor real (ex: `{CodigoEquipamento}`)

**Enquadramento:** Código e descrição da infração conforme CTB

**CTB:** Código de Trânsito Brasileiro (Lei nº 9.503/1997)

**RENAINF:** Registro Nacional de Infrações de Trânsito

**Faixa:** Cada pista/sentido monitorado pelo equipamento

**Operação:** Agrupamento de equipamentos em um mesmo local/endereço

---

**Documento criado em:** 16/06/2026  
**Versão:** 1.0  
**Autor:** AxionIA - Intelligence Hub  
**Sistema:** AxHub STRANS

---

