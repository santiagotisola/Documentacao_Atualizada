---
sidebar_position: 2
title: Índices de Performance
description: Configuração de índices de performance contratual
---

# Índices de Performance

Permite configurar os índices de performance exigidos pelos contratos.

![Lista de Índices](../img/Medição%20-%20indice%20de%20performance.png)

## Como acessar

**Menu lateral** → Medição → **Índices de Performance**

## Cadastro

![Cadastro de Índice](../img/Medição%20-%20indice%20de%20performance%20-%20cadastro.png)
## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome do índice |
| **Métrica** | Sim | O que será medido (ex.: disponibilidade) |
| **Meta (%)** | Sim | Valor mínimo exigido pelo contrato |
| **Tolerância (%)** | Não | Margem aceita antes da penalidade |
| **Penalidade** | Não | Descrição da penalidade contratual |

## Índices comuns

| Índice | Meta típica |
|--------|:-----------:|
| Disponibilidade | 95% |
| Aproveitamento OCR | 90% |
| Tempo de manutenção | ≤4h/mês |

:::tip
Os índices configurados aqui são calculados automaticamente ao gerar uma nova medição. Manter metas atualizadas de acordo com o contrato vigente.
:::

:::tip
Os índices configurados aqui são calculados automaticamente ao gerar uma nova medição.
:::
| Campo | Descrição |
|-------|-----------|
| **Contrato** | Contrato vinculado |
| **Indicador** | Nome do indicador (ex: Disponibilidade, Uptime) |
| **Meta (%)** | Percentual mínimo exigido |
| **Fórmula** | Regra de cálculo do índice |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Contratos](./contratos) | Contrato que define os indices |
| Relacionado | [Criar Medicao](./criar-medicao) | Usar indices na medicao |
