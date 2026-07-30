---
sidebar_position: 2
title: Marcas de Veículos
description: Cadastro de marcas de veículos para classificação nas operações do AxTon
---

# Marcas de Veículos

Cadastro de **marcas e fabricantes** de veículos utilizados na identificação e classificação nas operações de pesagem e triagem de infrações.

## Como acessar

**Menu lateral** → Veículos → **Marcas de Veículos**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome da marca (ex.: MERCEDES-BENZ, SCANIA, VOLVO) |
| **Código DENATRAN** | Não | Código oficial do fabricante |
| **Status** | Sim | Ativo ou Inativo |

## Passo a passo

1. Acesse **Veículos → Marcas de Veículos**
2. Clique em **+ Nova**
3. Informe o **Nome** e o **Código DENATRAN** (se aplicável)
4. Clique em **Salvar**

:::info
As marcas são vinculadas aos **Modelos de Veículos**, formando a hierarquia Marca → Modelo → Classificação usada nos tickets de pesagem.
:::
## Marcas comuns no transporte de carga

| Marca | Segmento |
|-------|----------|
| MERCEDES-BENZ | Caminhões e ônibus |
| SCANIA | Caminhões pesados |
| VOLVO | Caminhões e ônibus |
| IVECO | Caminhões leves e médios |
| DAF | Caminhões pesados |
## Passo a passo

1. Acesse **Veículos → Marcas de Veículos**
2. Clique em **+ Novo**
3. Informe o **Nome** da marca
4. Clique em **Salvar**

## Hierarquia

```
Marca de Veículo → Modelo → Veículo identificado na pesagem
```


### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Código** | Identificador único |
| **Descrição** | Nome/descrição do registro |
| **Ativo** | Status (Ativo/Inativo) |

### Passo a passo — Cadastrar

1. Acesse Veículos → **Marcas de Veículos
2. Clique em **+ Novo**
3. Preencha o Código e a Descrição
4. Marque como Ativo
5. Clique em **Salvar**
