---
sidebar_position: 3
title: Tipos de Equipamentos
description: Categorias de equipamentos de pesagem no AxTon
---

# Tipos de Equipamentos

Categorias dos **equipamentos de pesagem** cadastrados no sistema. O tipo define o comportamento do equipamento no processo de fiscalização.

## Como acessar

**Menu lateral** → Cadastros Básicos → **Tipos de Equipamentos**

## Tipos comuns

| Tipo | Descrição |
|------|-----------|
| **Balança Estática** | Pesagem com veículo parado |
| **Balança Dinâmica** | Pesagem com veículo em movimento |
| **Balança Semiestática** | Pesagem com velocidade reduzida |
| **Sensor de Eixo** | Apenas conta e identifica eixos |

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome do tipo |
| **Descrição** | Não | Detalhes técnicos |
| **Status** | Sim | Ativo ou Inativo |

## Hierarquia

```
Tipo de Equipamento → Fabricante → Modelo → Equipamento no posto
```

## Passo a passo

1. Acesse **Cadastros Básicos → Tipos de Equipamentos**
2. Clique em **+ Novo**
3. Preencha o **Nome** e a **Descrição**
4. Clique em **Salvar**

:::tip
O tipo de equipamento determina as configurações de operação aplicáveis (velocidade, tolerância de pesagem etc.). Consulte o fabricante para o tipo correto.
:::

## Relacionado

- [Fabricantes](./fabricantes)
- [Modelos de Equipamentos](./modelos-equipamentos)
- [Equipamentos](./equipamentos)
2. Clique em **+ Novo**
3. Preencha o **Nome** e a **Descrição**
4. Clique em **Salvar**

:::tip
O tipo de equipamento determina as configurações de operação aplicáveis (velocidade de passagem, tolerância de pesagem, etc.). Consulte o fabricante para o tipo correto.
:::

### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Código** | Identificador único |
| **Nome** | Nome do tipos de Equipamentos |
| **Ativo** | Status do registro |

### Passo a passo — Cadastrar

1. Acesse **Cadastros Básicos** → **Tipos de Equipamentos
2. Clique em **+ Novo**
3. Preencha os campos obrigatórios
4. Clique em **Salvar**

:::tip Dependência
Este cadastro é utilizado como referência em outros módulos do sistema.
:::
