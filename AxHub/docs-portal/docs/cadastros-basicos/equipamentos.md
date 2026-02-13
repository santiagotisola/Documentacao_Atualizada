---
sidebar_position: 5
title: Equipamentos
description: Cadastro e gestão dos equipamentos de trânsito
---

# Equipamentos

O cadastro de equipamentos é o registro central de todos os dispositivos de fiscalização de trânsito gerenciados pelo AxHub. Aqui são registrados radares, câmeras OCR, lombadas eletrônicas e demais equipamentos.

## Como acessar

**Menu lateral** → Equipamentos → **Equipamentos**

## Listagem

![Tela de Equipamentos - Lista](../img/Equipamentos%20-%20Lista.png)

### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Nº Série** | Número de série do equipamento |
| **Código** | Código único de identificação do equipamento no sistema |
| **Fabricante** | Fabricante do equipamento |
| **Modelo** | Modelo do equipamento |
| **Tipo** | Tipo do equipamento (OCR, Radar Fixo, Radar Misto, etc.) |
| **Modo Operação** | Modo de operação: Fixo ou Móvel |
| **Desabilitado Limite Horas Importação** | Indica se o limite de horas de importação está desabilitado (✓) |
| **Grupo de Equipamentos** | Grupo ao qual o equipamento pertence |

### Funcionalidades da listagem

| Ação | Descrição |
|------|-----------|
| **+ Novo** | Cadastrar um novo equipamento |
| **Excel** | Exportar a lista para Excel |
| **Pesquisa** | Buscar equipamentos por qualquer campo |
| **Editar** | Editar o equipamento (ícone lápis) |
| **Excluir** | Remover o equipamento (ícone X) |

## Cadastro

![Tela de Equipamentos - Cadastro](../img/Equipamentos%20-%20Cadastro.png)

### Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nº Série** | Sim | Número de série do equipamento fornecido pelo fabricante |
| **Código** | Sim | Código único de identificação no sistema (ex: AX1, CONT001) |
| **Número Certificado Inmetro** | Sim | Número do certificado de aferição INMETRO vigente |
| **Emissão Certificado Inmetro** | Não | Data de emissão do certificado INMETRO |
| **Vencimento Certificado Inmetro** | Não | Data de vencimento do certificado INMETRO |
| **Modelo** | Sim | Modelo do equipamento (seleção dos modelos cadastrados) |
| **Tipo** | Sim | Tipo do equipamento (seleção dos tipos cadastrados) |
| **Grupo** | Sim | Grupo de equipamentos ao qual pertence (seleção dos grupos cadastrados) |
| **Tipo da Operação** | Não | Modo de operação: **Fixo** (instalação permanente) ou **Móvel** (operações temporárias) |
| **Desabilitar Limite de Horas Importação** | Não | Se marcado, desabilita o controle de horas limite para importação de dados deste equipamento |

### Passo a passo — Cadastrar equipamento

1. Na listagem, clique em **+ Novo**
2. Preencha o **Nº Série** e o **Código** do equipamento
3. Informe o **Número Certificado Inmetro** e as datas de emissão/vencimento
4. Selecione o **Modelo**, **Tipo** e **Grupo** nos campos dropdown
5. Escolha o **Tipo da Operação** (Fixo ou Móvel)
6. Clique em **Salvar**

:::warning Certificado INMETRO
O certificado INMETRO é obrigatório para que o equipamento tenha validade legal na geração de infrações. Mantenha as datas de emissão e vencimento atualizadas para controle de prazos de aferição.
:::

:::tip Hierarquia de cadastros
Antes de cadastrar um equipamento, certifique-se de que o **Fabricante**, **Modelo**, **Tipo** e **Grupo** já estão cadastrados no sistema. A ordem recomendada de cadastro é:
1. Fabricantes
2. Tipos de Equipamentos
3. Modelos de Equipamentos
4. Grupos de Equipamentos
5. Equipamentos
:::
