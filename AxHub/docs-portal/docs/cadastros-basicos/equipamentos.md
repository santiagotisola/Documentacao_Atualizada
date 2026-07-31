---
sidebar_position: 5
title: Equipamentos
description: Cadastro e gestão dos Equipamentos de trânsito
---

# Equipamentos

O cadastro de Equipamentos é o registro central de todos os dispositivos de fiscalização de trânsito gerenciados pelo AxHub. Aqui são registrados radares, câmeras OCR, lombadas eletrônicas e demais Equipamentos

## Como acessar

**Menu lateral** → Equipamentos → Equipamentos

## Listagem

![Tela de Equipamentos - Lista](../img/Equipamentos%20-%20Lista.png)

### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Nº Série** | Número de série do Equipamento |
| **Código** | Código único de identificação do Equipamento no sistema |
| **Fabricante** | Fabricante do Equipamento |
| **Modelo** | Modelo do Equipamento |
| **Tipo** | Tipo do Equipamento (OCR, Radar Fixo, Radar Misto, etc.) |
| **Modo Operação** | Modo de operação: Fixo ou Móvel |
| **Desabilitado Limite Horas Importação** | Indica se o limite de horas de importação está desabilitado (✓) |
| **Grupo de Equipamentos | Grupo ao qual o Equipamento pertence |

### Funcionalidades da listagem

| Ação | Descrição |
|------|-----------|
| **+ Novo** | Cadastrar um novo Equipamento |
| **Excel** | Exportar a lista para Excel |
| **Pesquisa** | Buscar Equipamentos por qualquer campo |
| **Editar** | Editar o Equipamento (ícone lápis) |
| **Excluir** | Remover o Equipamento (ícone X) |

## Cadastro

![Tela de Equipamentos - Cadastro](../img/Equipamentos%20-%20Cadastro.png)

### Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nº Série** | Sim | Número de série do Equipamento fornecido pelo fabricante |
| **Código** | Sim | Código único de identificação no sistema (ex: AX1, CONT001) |
| **Número Certificado Inmetro** | Sim | Número do certificado de aferição INMETRO vigente |
| **Emissão Certificado Inmetro** | Não | Data de emissão do certificado INMETRO |
| **Vencimento Certificado Inmetro** | Não | Data de vencimento do certificado INMETRO |
| **Modelo** | Sim | Modelo do Equipamento (seleção dos modelos cadastrados) |
| **Tipo** | Sim | Tipo do Equipamento (seleção dos tipos cadastrados) |
| **Grupo** | Sim | Grupo de Equipamentos ao qual pertence (seleção dos grupos cadastrados) |
| **Tipo da Operação** | Não | Modo de operação: **Fixo** (instalação permanente) ou **Móvel** (operações temporárias) |
| **Desabilitar Limite de Horas Importação** | Não | Se marcado, desabilita o controle de horas limite para importação de dados deste Equipamento |

### Passo a passo — Cadastrar Equipamento

1. Na listagem, clique em **+ Novo**
2. Preencha o **Nº Série** e o **Código** do Equipamento
3. Informe o **Número Certificado Inmetro** e as datas de emissão/vencimento
4. Selecione o **Modelo**, **Tipo** e **Grupo** nos campos dropdown
5. Escolha o **Tipo da Operação** (Fixo ou Móvel)
6. Clique em **Salvar**

:::warning Certificado INMETRO
O certificado INMETRO é obrigatório para que o Equipamento tenha validade legal na geração de Infrações Mantenha as datas de emissão e vencimento atualizadas para controle de prazos de aferição.
:::

:::info Dados na Tarja
Os seguintes dados cadastrados aqui aparecem nas **tarjas das Infrações
- **Código** do Equipamento
- **Nº Série** (Serial)
- **Certificado INMETRO**

Para entender como esses dados são exibidos e como alterá-los, consulte:  
👉 Configuração de Dados da Tarja](../administracao/configuracao-dados-tarja)**
:::

:::tip Hierarquia de cadastros
Antes de cadastrar um Equipamento certifique-se de que o **Fabricante**, **Modelo**, **Tipo** e **Grupo** já estão cadastrados no sistema. A ordem recomendada de cadastro é:
1. Fabricantes
2. Tipos de Equipamentos
3. Modelos de Equipamentos
4. Grupos de Equipamentos
5. Equipamentos
:::

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Fabricantes](./fabricantes) | Fabricante do Equipamento |
| Relacionado | [Tipos de Equipamentos](./tipos-equipamentos) | Classificacao |
| Relacionado | [Modelos de Equipamentos](./modelos-equipamentos) | Modelo |
| Relacionado | [Grupos de Equipamentos](./grupos-equipamentos) | Agrupamento |
| Glossario | [Afericao](../glossario/afericao) | Certificado de afericao |

## Perguntas frequentes

**O que precisa estar cadastrado antes de registrar um equipamento?**
Fabricante, Tipo de Equipamento, Modelo de Equipamento e Grupo de Equipamentos devem estar cadastrados previamente. Tente salvar sem eles resultará em erro de validação.

**Equipamento com certificado INMETRO vencido continua gerando infrações?**
O sistema exibe alertas, mas o bloqueio automático depende da configuração. Mantenha as datas atualizadas e renove o certificado antes do vencimento.

**O código do equipamento pode ser alterado após cadastro?**
Sim, mas tenha cuidado: o código aparece nas tarjas das infrações. Alterações afetam apenas novos registros; os históricos mantêm o código anterior.
