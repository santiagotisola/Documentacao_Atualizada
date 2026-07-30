---
sidebar_position: 1
title: Cadastro de Operacoes
description: Cadastro e gestao de operacoes de fiscalizacao
---

# Cadastro de Operacoes

Uma operacao e o registro formal de uma acao de fiscalizacao de transito.

## Como acessar

Menu lateral - Operacoes - Cadastro de Operacoes

## Listagem

![Lista de Operacoes](../img/Operações%20-%20operações.png)

## Cadastro de Operacao

![Cadastro de Operacao](../img/Operações%20-%20operações%20-%20cadastro.png)

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome da operação |
| **Data Início** | Sim | Data/hora de início |
| **Data Fim** | Não | Data/hora de encerramento |
| **Equipamentos** | Sim | Equipamentos participantes |
| **Responsável** | Sim | Agente responsável |
| **Descrição** | Não | Detalhes da operação |

## Passo a passo

1. Acesse **Operações → Cadastro de Operações**
2. Clique em **+ Nova Operação**
3. Preencha o **Nome**, **Data Início** e selecione os **Equipamentos**
4. Clique em **Salvar**

:::tip
Uma operação ativa vincula todos os registros de passagem dos equipamentos selecionados ao contexto da fiscalização, facilitando a exportação e a auditoria.
:::
1. Acesse **Operações → Cadastro de Operações**
2. Clique em **+ Nova Operação**
3. Preencha os campos obrigatórios
4. Vincule os **Equipamentos** participantes
5. Clique em **Salvar**

:::tip
Uma operação ativa vincula todos os registros de passagem dos equipamentos selecionados ao contexto da fiscalização, facilitando a exportação e auditoria.
:::
|-------|-------------|-----------|
| Equipamento | Sim | Equipamento vinculado a operacao |
| Arco | Sim | Arco onde a operacao ocorre |
| Data Inicio | Sim | Data e hora de inicio da operacao |
| Data Fim | Sim | Data e hora de termino da operacao |
| Enquadramentos | Sim | Enquadramentos legais habilitados |
| Velocidade Regulamentada | Condicional | Velocidade limite da via |
| Observacao | não | Informacoes adicionais |

## Navegacao relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Arcos](../administracao/arcos) | Pontos de fiscalizacao |
| Relacionado | [Afericoes](./afericoes) | Controle de afericoes |
