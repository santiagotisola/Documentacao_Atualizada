---
sidebar_position: 14
title: Configuração de Dados da Tarja
description: Guia completo para atualizar informações exibidas nas tarjas de infrações
---

# Configuração de Dados da Tarja

Este guia explica **passo a passo** como alterar as informações que aparecem nas **tarjas impressas** nas infrações de trânsito do sistema AxHub.

:::info O que você vai aprender
- Como alterar a **portaria** que aparece na tarja
- Como atualizar **marca/modelo** do equipamento
- Como corrigir **endereço**, **faixa**, **sentido**
- Como atualizar **datas de aferição** e **certificados**
- Onde cada informação é configurada no sistema
:::

:::warning Importante
**Alterações afetam apenas NOVAS infrações!**  
Infrações já geradas NÃO são atualizadas automaticamente.  
Para reprocessar infrações antigas, é necessário acesso técnico ao banco de dados.
:::

## O que é a Tarja de Infração?

A **tarja** é a imagem impressa/sobreposta na foto da infração que contém informações como:

```
┌────────────────────────────────────────────────────────┐
│  Cód. Equipamento: [código]                           │
│  Endereço: [logradouro, número]                       │
│  Faixa: [nº]         Sentido: [crescente/decrescente] │
│  Data: 00/00/0000 00:00:00                            │
│  ─────────────────────────────────────────────────── │
│  Data aferição: 00/00/0000                            │
│  Data venc. aferição: 00/00/0000                      │
│  Certif.: 00000/0000                                  │
│  Portaria: PORTARIA INMETRO/DIMEL Nº 492/2021        │
│  ─────────────────────────────────────────────────── │
│  Marca/Modelo: VELSIS VSIS-OCR                        │
│  Infração: 00000                                      │
│  Descrição: TRANSITAR...                              │
└────────────────────────────────────────────────────────┘
```

Cada campo dessa tarja **busca informações de lugares diferentes** no sistema!

## Como Funciona o Sistema de Tarjas

### Template de Tarja

O template é um **modelo** que define quais informações aparecem e como são formatadas.

**Localização no sistema:**
```
Menu → Configurações → Tarjas → Editar "Tarja Axion"
```

O template usa **variáveis** entre chaves `{NomeDaVariavel}` que são substituídas por valores reais na hora de gerar a infração.

**Exemplo de template:**
```
Cód. Equipamento : {CodigoEquipamento}
Endereço : {CodigoLocalOperacaoEquipamento}
Faixa : {NumeroFaixa}        Sentido : {SentidoFaixa}
Portaria : {PortariaEquipamento}
```

### Fluxo de Dados

```
Cadastros do Sistema
    ↓
Banco de Dados (tabelas)
    ↓
Template da Tarja (substitui {Variaveis} por valores)
    ↓
Imagem da Infração (tarja impressa na foto)
```

## Guia Rápido: Alterando a Portaria

### Cenário Comum
Corrigir portaria que aparece com data incorreta ou formato antigo

### Opção 1: Alterar no Cadastro do Modelo ✅ RECOMENDADO

**Vantagens:**
- ✅ Correção permanente
- ✅ Afeta todos equipamentos deste modelo
- ✅ Mantém consistência no sistema

**Passo a passo:**

1. Acessar: **Menu** → **Equipamentos** → **Modelos de Equipamentos**
2. Localizar o modelo (ex: buscar por marca e modelo do equipamento)
3. Clicar em **Editar** (ícone de lápis)
4. No campo **"Portaria"**, corrigir para o formato correto:
   ```
   PORTARIA INMETRO/DIMEL Nº [número]/[ano]
   ```
   Exemplo: `PORTARIA INMETRO/DIMEL Nº 492/2021`
5. Verificar também o campo **"Número Portaria"**: apenas o número
6. Clicar em **Salvar**
7. Validar gerando uma nova infração de teste

⏱️ **Tempo estimado:** 5 minutos

:::tip Consulte a documentação oficial
Para mais detalhes sobre modelos de equipamentos, consulte [Modelos de Equipamentos](../cadastros-basicos/modelos-equipamentos).
:::

### Opção 2: Alterar o Template da Tarja (Workaround)

Use quando a portaria está correta no cadastro, mas errada na tarja (duplicidade de variáveis).

**Passo a passo:**

1. Acessar: **Menu** → **Configurações** → **Tarjas**
2. Localizar "Tarja Axion" e clicar em **Editar**
3. No campo **Template**, localizar:
   ```
   Portaria não metrológico : {PortariaNaoMetrologico}
   ```
4. Substituir por:
   ```
   Portaria não metrológico : {PortariaEquipamento}
   ```
5. Clicar em **Salvar**
6. Testar com nova infração

⏱️ **Tempo estimado:** 3 minutos

## Referência Completa: Todos os Campos da Tarja

### Tabela de Referência Rápida

| Campo | Variável | Onde Alterar |
|-------|----------|--------------|
| Código Equipamento | `{CodigoEquipamento}` | Equipamentos → Equipamentos → Editar |
| Endereço | `{CodigoLocalOperacaoEquipamento}` | Equipamentos → Operações → Editar |
| Faixa | `{NumeroFaixa}` | Equipamentos → Equipamentos → Aba Faixas |
| Sentido | `{SentidoFaixa}` | Equipamentos → Equipamentos → Aba Faixas |
| Data Infração | `{DataPassagemInfracao}` | 🔒 Automático (capturado pelo equipamento) |
| Data Aferição | `{DataAfericaoInmetro}` | Operações → Aferições → Editar |
| Data Venc. Aferição | `{DataVencimentoAfericao}` | Operações → Aferições → Editar |
| Certificado | `{CertificadoEquipamento}` | Equipamentos ou Aferições |
| **Portaria** | `{PortariaEquipamento}` | **Equipamentos → Modelos → Editar** |
| Reg. não metrológico | `{NumeroCertificadoInmetro}` | Operações → Aferições → Editar |
| Marca/Modelo | `{MarcaModeloEquipamento}` | Equipamentos → Modelos → Editar |
| Código Órgão | `{CodigoOrgaoAutuador}` | Configurações → Geral |
| Código Infração | `{CodigoEnquadramento}` | Configurações → Enquadramentos |
| Descrição Infração | `{DescricaoEnquadramento}` | Configurações → Enquadramentos |
| Serial | `{SerialEquipamento}` | Equipamentos → Equipamentos → Editar |

### 1. Código do Equipamento

**Aparece como:** `Cód. Equipamento : [código]`  
**Variável:** `{CodigoEquipamento}`  
**Origem:** Cadastro do Equipamento → Campo "Código"

**Como alterar:**
1. **Menu** → **Equipamentos** → **Equipamentos**
2. Localizar o equipamento (buscar por código, endereço ou modelo)
3. Clicar em **Editar**
4. Alterar o campo **"Código"**
5. Clicar em **Salvar**

:::caution Atenção
Alterar o código pode afetar relatórios e históricos.  
**Recomendado:** NÃO alterar após equipamento em uso.
:::

### 2. Endereço

**Aparece como:** `Endereço : [logradouro, número - bairro]`  
**Variável:** `{CodigoLocalOperacaoEquipamento}`  
**Origem:** Cadastro da Operação → Campo "Endereço"

**Como alterar:**
1. **Menu** → **Operações** → **Operações**
2. Localizar a operação do equipamento
3. Clicar em **Editar**
4. Alterar o campo **"Endereço"**
5. Formato recomendado: "Logradouro, Número - Bairro"
6. Clicar em **Salvar**

:::tip Dica
Uma operação agrupa vários equipamentos do mesmo local.  
Alterar o endereço da operação afeta **TODOS os equipamentos** vinculados.
:::

### 3. Número da Faixa

**Aparece como:** `Faixa : [número]`  
**Variável:** `{NumeroFaixa}`  
**Origem:** Cadastro do Equipamento → Aba "Faixas" → Campo "Número"

**Como alterar:**
1. **Menu** → **Equipamentos** → **Equipamentos**
2. Localizar o equipamento
3. Clicar na aba **"Faixas"**
4. Selecionar a faixa desejada
5. Clicar em **Editar**
6. Alterar o campo **"Número"**
7. Clicar em **Salvar**

:::caution Atenção
**Recomendado:** NÃO alterar após faixa em uso.  
Se necessário, desativar a faixa antiga e criar nova.
:::

### 4. Sentido

**Aparece como:** `Sentido : [Crescente/Decrescente]`  
**Variável:** `{SentidoFaixa}`  
**Origem:** Cadastro do Equipamento → Aba "Faixas" → Campo "Sentido"

**Como alterar:**
1. **Menu** → **Equipamentos** → **Equipamentos**
2. Localizar o equipamento
3. Clicar na aba **"Faixas"**
4. Selecionar a faixa
5. Clicar em **Editar**
6. Alterar o campo **"Sentido"**
   - Opções: **Crescente** ou **Decrescente**
7. Clicar em **Salvar**

:::info Definições
- **Crescente:** Veículos trafegam no sentido da numeração crescente das ruas
- **Decrescente:** Veículos trafegam no sentido da numeração decrescente
:::

### 5. Data da Infração

**Aparece como:** `Data : 00/00/0000 00:00:00`  
**Variável:** `{DataPassagemInfracao}`  
**Origem:** 🔒 Capturado AUTOMATICAMENTE pelo equipamento

:::danger Não alterar manualmente
Este campo é gerado automaticamente pelo equipamento no momento da infração.  
Reflete o momento real da infração e NÃO deve ser alterado manualmente.
:::

**Se a data estiver errada:**
- Verificar relógio do equipamento
- Verificar configuração de data/hora
- Sincronizar com servidor NTP se disponível
- Para infrações já geradas com data errada: consultar equipe técnica

### 6. Data da Aferição {#data-da-afericao}

**Aparece como:** `Data aferição : 00/00/0000`  
**Variável:** `{DataAfericaoInmetro}`  
**Origem:** Cadastro de Aferições → Campo "Data da Aferição"

**Como alterar:**
1. **Menu** → **Operações** → **Aferições**
2. Localizar a aferição (filtrar por equipamento)
3. Clicar em **Editar**
4. Alterar o campo **"Data da Aferição"**
5. Formato: DD/MM/AAAA
6. Clicar em **Salvar**

:::tip Quando criar nova aferição
1. Ao receber certificado do INMETRO
2. Preencher todos os campos obrigatórios
3. Vincular equipamento e faixas
4. Definir data de vencimento (geralmente 1 ano após)
:::

### 7. Data de Vencimento da Aferição

**Aparece como:** `Data venc. aferição : 00/00/0000`  
**Variável:** `{DataVencimentoAfericao}`  
**Origem:** Cadastro de Aferições → Campo "Data de Vencimento"

**Como alterar:**
1. **Menu** → **Operações** → **Aferições**
2. Localizar a aferição
3. Clicar em **Editar**
4. Alterar o campo **"Data de Vencimento"**
5. Clicar em **Salvar**

**Regra de cálculo:**
```
Data Vencimento = Data Aferição + 12 meses
Exemplo: 15/01/2026 → 15/01/2027
```

:::warning Aferição vencida
Infrações geradas com aferição vencida são juridicamente questionáveis!  
Mantenha calendário de aferições atualizado e agende renovação 60 dias antes do vencimento.
:::

### 8. Certificado

**Aparece como:** `Certif. : 00000/0000`  
**Variável:** `{CertificadoEquipamento}`  
**Origem:** ⚠️ Ambígua - pode vir de:
- Cadastro do Equipamento → Campo "Certificado"
- Cadastro de Aferições → Campo "Número INMETRO"

**Como alterar (Opção 1 - No Equipamento):**
1. **Menu** → **Equipamentos** → **Equipamentos**
2. Localizar o equipamento
3. Clicar em **Editar**
4. Localizar campo **"Certificado"** ou **"Número do Certificado"**
5. Formato: "00000/0000" (número/ano)
6. Clicar em **Salvar**

**Como alterar (Opção 2 - Na Aferição):**
1. **Menu** → **Operações** → **Aferições**
2. Localizar a aferição mais recente
3. Clicar em **Editar**
4. Localizar campo **"Número INMETRO"**
5. Alterar para o número do certificado
6. Clicar em **Salvar**

:::tip Recomendação
- Manter consistente entre Equipamento e Aferição
- Atualizar AMBOS quando receber novo certificado INMETRO
- Formato padrão: "NumeroSequencial/Ano" (ex: "54321/2026")
:::

### 9. Portaria do Equipamento ⭐ {#portaria-do-equipamento}

**Aparece como:** `Portaria : PORTARIA INMETRO/DIMEL Nº 492/2021`  
**Variável:** `{PortariaEquipamento}`  
**Origem:** Cadastro de Modelos de Equipamentos → Campo "Portaria"

**Como alterar:**
1. **Menu** → **Equipamentos** → **Modelos de Equipamentos**
2. Localizar o modelo (ex: "VSIS-OCR", marca "VELSIS")
3. Clicar em **Editar**
4. Alterar o campo **"Portaria"**
   - Formato: "PORTARIA INMETRO/DIMEL Nº XXX/AAAA"
   - Exemplo: "PORTARIA INMETRO/DIMEL Nº 492/2021"
5. Alterar também o campo **"Número Portaria"**: apenas o número (492)
6. Clicar em **Salvar**

**Portarias INMETRO comuns:**

| Portaria | Aplicação | Data Publicação |
|----------|-----------|-----------------|
| 492/2021 | Sistemas de Aferição de Velocidade | 10/12/2021 |
| 541/2021 | Sistemas de Pesagem | 28/12/2021 |
| 115/2019 | Etilômetros | 20/03/2019 |

:::info Importante
- A portaria é definida no **MODELO**, não no equipamento individual
- Alterar a portaria do modelo afeta **TODOS os equipamentos** deste modelo
- Verificar a portaria correta no site do INMETRO: https://www.gov.br/inmetro
:::

### 10. Marca/Modelo do Equipamento

**Aparece como:** `Marca/Modelo : VELSIS VSIS-OCR`  
**Variável:** `{MarcaModeloEquipamento}`  
**Origem:** Cadastro de Modelos → Campos "Marca" + "Modelo" (concatenados)

**Como alterar:**
1. **Menu** → **Equipamentos** → **Modelos de Equipamentos**
2. Localizar o modelo
3. Clicar em **Editar**
4. Alterar os campos:
   - **Marca:** Nome do fabricante (ex: "VELSIS", "GATSO", "PERKONS")
   - **Modelo:** Nome do modelo (ex: "VSIS-OCR", "MILLIA", "VECTRA")
5. Clicar em **Salvar**

**Formatação automática:**
```
Marca: "VELSIS"
Modelo: "VSIS-OCR"
Resultado na tarja: "VELSIS VSIS-OCR"

Marca: "PERKONS"
Modelo: "VECTRA"
Resultado na tarja: "PERKONS VECTRA"
```

:::caution Atenção
Alterar marca/modelo afeta **TODOS os equipamentos** deste modelo.  
**Recomendado:** NÃO alterar após equipamentos em uso.
:::

### 11. Código da Infração {#codigo-da-infracao}

**Aparece como:** `Infração : 00000`  
**Variável:** `{CodigoEnquadramento}`  
**Origem:** Cadastro de Enquadramentos → Campo "Código"

**Como alterar:**
1. **Menu** → **Configurações** → **Enquadramentos**
2. Localizar o enquadramento (buscar por código ou descrição)
3. Clicar em **Editar**
4. Alterar campo **"Código"**
5. Seguir numeração do CTB (Código de Trânsito Brasileiro)
6. Clicar em **Salvar**

**Códigos comuns de velocidade:**

| Código | Descrição | Excesso |
|--------|-----------|---------|
| 74550 | Excesso até 20% | Até 20% acima |
| 74520 | Excesso 20% a 50% | Entre 20% e 50% |
| 74740 | Excesso acima de 50% | Mais de 50% |

:::warning Importante
O código deve seguir o CTB. Código errado = infração inválida legalmente.
:::

### 12. Descrição da Infração

**Aparece como:** `Descrição : TRANSITAR EM VELOCIDADE SUPERIOR À MÁXIMA PERMITIDA...`  
**Variável:** `{DescricaoEnquadramento}`  
**Origem:** Cadastro de Enquadramentos → Campo "Descrição"

**Como alterar:**
1. **Menu** → **Configurações** → **Enquadramentos**
2. Localizar o enquadramento
3. Clicar em **Editar**
4. Alterar campo **"Descrição"**
5. Usar texto conforme CTB (geralmente em CAIXA ALTA)
6. Clicar em **Salvar**

### 13. Serial do Equipamento

**Aparece como:** `Serial : [número de série]`  
**Variável:** `{SerialEquipamento}`  
**Origem:** Cadastro do Equipamento → Campo "Número de Série"

**Como alterar:**
1. **Menu** → **Equipamentos** → **Equipamentos**
2. Localizar o equipamento
3. Clicar em **Editar**
4. Alterar campo **"Número de Série"** ou **"Serial"**
5. Usar o serial da etiqueta física do equipamento
6. Clicar em **Salvar**

:::tip Onde encontrar o serial
- Etiqueta física no equipamento
- Manual do equipamento
- Nota fiscal de compra
- Certificado INMETRO
:::

## Hierarquia de Dados

Entenda como os dados se relacionam:

```
MODELO DE EQUIPAMENTO (ex: VSIS-OCR, F-DIP, VECTRA)
├── Portaria ← Todos equipamentos deste modelo
├── Marca ← Todos equipamentos deste modelo
└── Modelo ← Todos equipamentos deste modelo
    │
    └── EQUIPAMENTO (ex: identificado por código)
        ├── Código ← Específico deste equipamento
        ├── Serial ← Específico deste equipamento
        └── Certificado ← Específico deste equipamento
            │
            └── OPERAÇÃO (ex: endereço do local)
                ├── Endereço ← Todos equipamentos desta operação
                └── Código Órgão ← Geralmente global
                    │
                    └── FAIXAS (ex: numeradas 1, 2, 3...)
                        ├── Número ← Específico desta faixa
                        └── Sentido ← Específico desta faixa
                            │
                            └── AFERIÇÃO (ex: período de validade)
                                ├── Data Aferição ← Equipamento + Faixas
                                ├── Data Vencimento ← Equipamento + Faixas
                                └── Número INMETRO ← Equipamento + Faixas
                                    │
                                    └── INFRAÇÃO (gerada)
                                        └── TARJA ← Busca TODOS dados acima
```

## Perguntas Frequentes

### Alterei o campo no sistema, mas a tarja ainda mostra o valor antigo. Por quê?

As alterações afetam apenas **NOVAS infrações**. Infrações já geradas permanecem com os dados antigos.

**Soluções:**
- ✅ Aguardar nova infração (dados virão atualizados)
- ⚠️ Reprocessar infrações antigas (requer acesso SQL ao banco de dados)
- ⏱️ Limpar cache do navegador e aguardar alguns minutos

### Posso alterar a tarja de uma infração já gerada?

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

### Como sei qual campo alterar para corrigir uma informação específica?

Use a **Tabela de Referência Rápida** no início desta página para localizar rapidamente onde alterar cada informação.

### Preciso alterar o template da tarja. Como faço?

1. **Menu** → **Configurações** → **Tarjas**
2. Localizar a tarja (ex: "Tarja Axion")
3. Clicar em **Editar**
4. Alterar o campo **"Template"** ou **"Layout"**
5. Usar variáveis entre chaves: `{NomeDaVariavel}`
6. Consultar a tabela de variáveis disponíveis acima
7. Clicar em **Salvar**
8. Testar com infração de teste

### O que acontece se eu deixar uma aferição vencer?

**Consequências:**
- ❌ Infrações geradas com aferição vencida são juridicamente questionáveis
- ⚠️ Sistema pode bloquear geração de novas infrações
- ⚖️ Equipamento opera ilegalmente
- 📝 Defesas de autuação podem ser aceitas

**Como evitar:**
- 📅 Agendar aferição 60 dias antes do vencimento
- 🔔 Configurar alertas 30 dias antes
- 📊 Monitorar dashboard de vencimentos

### Posso usar a mesma aferição para vários equipamentos?

✅ **Sim, SE:**
- Os equipamentos estão fisicamente juntos
- A aferição foi feita para o conjunto
- O certificado INMETRO lista todos os equipamentos
- As faixas estão todas cobertas pela aferição

**Como fazer:**
1. Cadastrar a aferição: **Operações** → **Aferições** → **Nova**
2. Na aba **"Equipamentos"**, adicionar cada equipamento
3. Selecionar faixas de cada um
4. Todos os equipamentos vinculados usarão esta aferição

:::caution Atenção
Certificado INMETRO deve cobrir todos os equipamentos.  
Não vincular equipamentos que não estão no certificado.
:::

## Checklist de Validação

Após alterar informações, validar:

- [ ] Dados foram salvos corretamente no sistema
- [ ] Mensagem de sucesso foi exibida
- [ ] Não há mensagens de erro
- [ ] Valores aparecem corretos ao reabrir cadastro
- [ ] Gerou infração de teste
- [ ] Tarja da infração de teste mostra dados atualizados
- [ ] Formato dos dados está correto (datas, códigos, etc.)
- [ ] Documentou a alteração (se crítica)
- [ ] Backup foi feito antes (se crítica)
- [ ] Equipe foi notificada (se afeta múltiplos usuários)

## Impacto das Alterações

| Campo | Afeta Novas Infrações | Afeta Infrações Antigas | Requer Reinício |
|-------|:---------------------:|:-----------------------:|:---------------:|
| Código Equipamento | ✅ | ❌ | ❌ |
| Endereço | ✅ | ❌ | ❌ |
| Faixa/Sentido | ✅ | ❌ | ❌ |
| Portaria Modelo | ✅ | ❌ | ⚠️ Cache 5min |
| Marca/Modelo | ✅ | ❌ | ⚠️ Cache 5min |
| Aferição (datas) | ✅ | ❌ | ❌ |
| Certificado | ✅ | ❌ | ❌ |
| Serial | ✅ | ❌ | ❌ |
| Enquadramento | ⚠️ Depende | ❌ | ❌ |
| Template Tarja | ✅ | ❌ | ❌ |

## Glossário

| Termo | Definição |
|-------|-----------|
| **Aferição** | Processo de calibração e certificação do equipamento pelo INMETRO |
| **INMETRO** | Instituto Nacional de Metrologia, Qualidade e Tecnologia |
| **Portaria** | Norma legal que regulamenta o uso de equipamentos de fiscalização |
| **Template** | Modelo/layout que define como a tarja será exibida |
| **Tarja** | Imagem sobreposta na foto da infração com informações do equipamento |
| **Variável** | Placeholder no template substituído por valor real (ex: `{CodigoEquipamento}`) |
| **Enquadramento** | Código e descrição da infração conforme CTB |
| **CTB** | Código de Trânsito Brasileiro (Lei nº 9.503/1997) |

---

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Configuração | [Tarjas](./tarjas) | Configuração básica de tarjas |
| Cadastro | [Modelos de Equipamentos](../cadastros-basicos/modelos-equipamentos) | Como cadastrar modelos e portarias |
| Cadastro | [Equipamentos](../cadastros-basicos/equipamentos) | Cadastro de equipamentos |
| Configuração | [Enquadramentos](./enquadramentos) | Cadastro de enquadramentos CTB |
| Operação | [Triagem](../infracoes/triagem) | Onde a tarja é visualizada |
| Operação | [Exportação](../infracoes/exportacao) | Imagem exportada com tarja |

---

:::tip Suporte
Em caso de dúvidas ou problemas técnicos, abra um chamado no helpdesk informando:
- Equipamento afetado
- Campo que precisa alterar
- Screenshots do problema
- Categoria: "AxHub - Configurações"
:::
