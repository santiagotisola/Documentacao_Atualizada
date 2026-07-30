---
sidebar_position: 1
title: Postos de Pesagem
description: Cadastro e gestão dos postos de pesagem veicular no AxHub
---

# Postos de Pesagem

Cadastro dos **pontos físicos de fiscalização de peso veicular**. Cada posto vincula os equipamentos de pesagem à localidade e ao contrato.

![Lista de Postos](../img/Balança%20-%20Postos.png)

## Como acessar

**Menu lateral** → Balança → **Postos**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome identificador do posto |
| **Endereço** | Sim | Localização física |
| **Rodovia** | Não | Rodovia onde está instalado |
| **Km** | Não | Quilometro da rodovia |
| **Sentido** | Não | Sentido do tráfego monitorado |
| **Contrato** | Sim | Contrato vinculado |
| **Status** | Sim | Ativo, Inativo ou Em manutenção |

## Passo a passo

1. Acesse **Balança → Postos**
2. Clique em **+ Novo**
3. Preencha o **Nome**, **Endereço** e selecione o **Contrato**
4. Informe **Rodovia**, **Km** e **Sentido** (se aplicável)
5. Clique em **Salvar**

:::tip
Após criar o posto, vincule os **Equipamentos** a ele em **Configurações → Equipamentos**.
:::

## Relacionado

- [Equipamentos](../administracao/equipamentos)
- [Contratos](../medicoes/contratos)
- [Tickets Fechados](./ticket-fechado)


## Cadastro

![Cadastro de Posto](../img/Balança%20-%20Postos%20-%20Cadastro1.png)

1. Acesse **Balança → Postos**
2. Clique em **+ Novo**
3. Preencha os dados do posto
4. Vincule os equipamentos
5. Clique em **Salvar**


## Cadastro de posto

![Cadastro de Posto - Dados](../img/Balança%20-%20Postos%20-%20Cadastro1.png)

![Cadastro de Posto - Configurações](../img/Balança%20-%20Postos%20-%20Cadastro2.png)

| Campo | Descrição |
|-------|-----------|
| **Nome** | Identificação do posto |
| **Localização** | Endereço ou referência do posto |
| **Tipo de Balança** | Estática, dinâmica, etc. |
| **Status** | Ativo ou Inativo |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Fluxo | [Ticket Aberto](./ticket-aberto) | Tickets em andamento |
| Fluxo | [Ticket Fechado](./ticket-fechado) | Tickets finalizados |
| Configuracao | [Motivos](./motivos) | Motivos de reclassificacao |
