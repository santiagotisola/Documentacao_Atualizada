---
sidebar_position: 7
title: Modelos de Veículos
description: Cadastro de modelos de veículos por marca para classificação no AxHub
---

# Modelos de Veículos

Cadastro dos **modelos de veículos vinculados às marcas**. O modelo correto garante precisão na identificação do veículo nos registros de infração.

![Lista de Modelos](../img/Veículos%20-%20marcas-modelos%20de%20veiculos.png)

## Como acessar

**Menu lateral** → Veículos → **Modelos de Veículos**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome do modelo (ex.: Gol, Uno, Strada) |
| **Marca** | Sim | Marca vinculada |
| **Status** | Sim | Ativo ou Inativo |

## Passo a passo

1. Acesse **Veículos → Modelos de Veículos**
2. Clique em **+ Novo**
3. Informe o **Nome** e selecione a **Marca**
4. Clique em **Salvar**

## Hierarquia

```
Marca (ex.: FIAT)
  └── Modelo (ex.: Strada)
        └── Veículo identificado na infração
```


## Cadastro

![Cadastro de Modelo](../img/Veículos%20-%20marcas-modelos%20de%20veiculos%20-%20cadastro.png)

| Campo | Descrição |
|-------|-----------|
| **Marca** | Marca vinculada |
| **Código** | Código do modelo |
| **Descrição** | Nome do modelo (ex: Gol, Uno, Corolla) |
| **Ativo** | Status do registro |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Marcas de Veiculos](./marcas-veiculos) | Marca do modelo |
