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

## Integração com outros módulos

| Módulo | Como usa este cadastro |
|--------|----------------------|
| **Tickets de Pesagem** | Cada ticket registra o posto onde a pesagem foi realizada para rastreabilidade e filtragem |
| **Operações** | Equipamentos vinculados ao posto são usados nas operações de fiscalização |
| **Medições** | O boletim de medição agrupa os indicadores de disponibilidade e volume por posto |
| **Relatórios** | Relatórios de passagens e infrações permitem filtrar por posto para visão localizada |

## Perguntas frequentes

**Posso ter um equipamento vinculado a dois postos ao mesmo tempo?**
Não. Cada equipamento deve estar vinculado a um único posto. Se precisar redistribuir equipamentos, edite o cadastro de cada um e altere o posto de referência.

**O que acontece com os tickets registrados se eu inativar um posto?**
Tickets já gerados são preservados no histórico e continuam acessíveis nos relatórios. Apenas novos tickets deixam de ser criados para o posto inativo. Não exclua postos com histórico operacional.

**Como vincular equipamentos a um posto que já foi criado?**
Acesse **Configurações → Equipamentos**, edite cada equipamento que deve pertencer ao posto e selecione o posto correto no campo correspondente. A vinculação não é feita no cadastro do posto, mas sim no cadastro de cada equipamento.

## Perguntas frequentes

**O posto precisa estar vinculado a um contrato para registrar pesagens?**
Sim. Sem vínculo a um contrato, as pesagens do posto não são contabilizadas no boletim de medição.

**Como inativar um posto sem perder o histórico de pesagens?**
Alterando o status para **Inativo**. O histórico de tickets é preservado; apenas novas pesagens deixam de ser associadas ao posto.

**O posto precisa estar cadastrado antes ou depois do equipamento?**
O posto deve ser cadastrado primeiro. Em seguida, vincule os equipamentos ao posto no cadastro de cada equipamento.
