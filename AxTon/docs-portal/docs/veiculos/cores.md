---
sidebar_position: 4
title: Cores
description: Cadastro de cores de veículos para classificação nas operações do AxTon
---

# Cores

Cadastro de **cores de veículos** utilizadas nas operações de pesagem e triagem de infrações.

## Como acessar

**Menu lateral** → Veículos → **Cores**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome da cor (ex.: Branco, Prata, Cinza) |
| **Código** | Não | Código do DENATRAN |
| **Status** | Sim | Ativo ou Inativo |

## Passo a passo

1. Acesse **Veículos → Cores**
2. Clique em **+ Nova**
3. Informe o **Nome** e o **Código DENATRAN** (se aplicável)
4. Clique em **Salvar**

:::info
As cores são extraídas automaticamente do RENAVAM quando o sistema consulta a placa. Mantenha a tabela atualizada com todas as cores da tabela DENATRAN para evitar campos vazios nos autos de infração.
:::

## Cores padrão DENATRAN

| Código | Cor |
|:------:|-----|
| 01 | Amarela |
| 02 | Azul |
| 03 | Bege |
| 04 | Branca |
| 05 | Cinza |
| 06 | Dourada |
| 07 | Grená |
| 08 | Laranja |
| 09 | Marrom |
| 10 | Prata |
| 11 | Preta |
| 12 | Rosa |
| 13 | Roxa |
| 14 | Verde |
| 15 | Vermelha |

## Passo a passo

1. Acesse **Veículos → Cores**
2. Clique em **+ Novo**
3. Informe o **Nome** da cor
4. Clique em **Salvar**

:::tip
Mantanha as cores sincronizadas com a tabela padrão do DENATRAN para evitar rejeicões nos arquivos de exportação.
:::


### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Código** | Identificador único |
| **Descrição** | Nome/descrição do registro |
| **Ativo** | Status (Ativo/Inativo) |

### Passo a passo — Cadastrar

1. Acesse Veículos → **Cores**
2. Clique em **+ Novo**
3. Preencha o Código e a Descrição
4. Marque como Ativo
5. Clique em **Salvar**
