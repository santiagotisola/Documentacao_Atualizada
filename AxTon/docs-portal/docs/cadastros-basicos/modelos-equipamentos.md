---
sidebar_position: 4
title: Modelos de Equipamentos
description: Modelos de equipamentos de pesagem por fabricante no AxTon
---

# Modelos de Equipamentos

Cadastro dos **modelos de equipamentos** por fabricante. Cada modelo define as características técnicas da balança ou sensor utilizado.

## Como acessar

**Menu lateral** → Cadastros Básicos → **Modelos de Equipamentos**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome do modelo |
| **Fabricante** | Sim | Fabricante vinculado |
| **Tipo** | Sim | Balança estática, dinâmica ou semiestática |
| **Capacidade (t)** | Não | Capacidade máxima de pesagem |

## Passo a passo

1. Acesse **Cadastros Básicos → Modelos de Equipamentos**
2. Clique em **+ Novo**
3. Preencha o **Nome**, selecione o **Fabricante** e o **Tipo**
4. Informe a **Capacidade** (opcional)
5. Clique em **Salvar**

:::info Hierarquia
Fabricante → Modelo → Equipamento. Antes de cadastrar um modelo, o Fabricante deve estar registrado em **Fabricantes de Equipamentos**.
:::

## Relacionado

- [Fabricantes](./fabricantes)
- [Equipamentos](./equipamentos)
- [Tipos de Equipamentos](./tipos-equipamentos)


## Passo a passo

1. Acesse **Cadastros Básicos → Modelos de Equipamentos**
2. Clique em **+ Novo**
3. Informe o **Nome** e selecione o **Fabricante**
4. Defina o **Tipo** de equipamento
5. Clique em **Salvar**

## Hierarquia

```
Fabricante → Modelo → Equipamento cadastrado no posto
```


| Coluna | Descrição |
|--------|-----------|
| **Código** | Identificador único |
| **Nome** | Nome do modelos de Equipamentos |
| **Ativo** | Status do registro |

### Passo a passo — Cadastrar

1. Acesse **Cadastros Básicos** → **Modelos de Equipamentos
2. Clique em **+ Novo**
3. Preencha os campos obrigatórios
4. Clique em **Salvar**

:::tip Dependência
Modelos dependem de Fabricante e Tipo previamente cadastrados.
:::
