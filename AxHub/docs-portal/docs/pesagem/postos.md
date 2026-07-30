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

## Boas práticas

- Cadastre o posto com o nome oficial usado no contrato para facilitar a filtragem em relatórios e medições
- Vincule os equipamentos imediatamente após o cadastro para que pesagens sejam associadas corretamente
- Mantenha o status **Ativo** apenas enquanto o posto estiver operacional; postos inativos distorcem o índice de disponibilidade
- Confirme a vinculação ao grupo de equipamentos correto para garantir segmentação por contrato nos relatórios

## Relacionado

- [Equipamentos](../administracao/equipamentos)
- [Contratos](../medicoes/contratos)
- [Tickets Fechados](./ticket-fechado)

## Fluxo de ativação de posto

1. Cadastrar o posto com nome oficial do contrato em **Balança → Postos**
2. Acessar **Configurações → Equipamentos** e vincular cada equipamento ao posto
3. Vincular o posto ao **Contrato** correspondente
4. Registrar a **Aferição** dos equipamentos (obrigatório antes de operar)
5. Criar a **Operação** vinculada ao posto para iniciar a fiscalização

## Tabela de referência — status do posto

| Status | Descrição | Impacto no SLA |
|--------|-----------|:--------------:|
| **Ativo** | Posto operacional | Contabilizado |
| **Inativo** | Posto desativado | Exclui do cálculo |
| **Em manutenção** | Parada programática | Conforme contrato |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Posto sem dados no relatório | Equipamentos não vinculados | Vincular equipamentos ao posto |
| Disponibilidade calculada incorreta | Posto ativo sem operação | Verificar operáções vinculadas |
| Posto não aparece no filtro | Status inativo | Reativar ou verificar permissões |


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
