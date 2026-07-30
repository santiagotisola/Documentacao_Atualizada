---
sidebar_position: 7
title: Processamento por Usuário
description: Produtividade de triagem por operador no AxTon
---

# Processamento por Usuário

Exibe a **produtividade de cada operador** na triagem de infrações: infrações triadas, aprovadas, descartadas e tempo médio por análise.

## Como acessar

**Menu lateral** → Relatórios → **Processamento por Usuário**

## Filtros

| Filtro | Descrição |
|--------|-----------|
| **Período** | Data início e fim |
| **Usuário** | Filtrar por operador |
| **Posto** | Filtrar por localidade |

## Colunas

| Coluna | Descrição |
|--------|-----------|
| **Usuário** | Nome do operador |
| **Triadas** | Infrações analisadas no período |
| **Aprovadas** | Infrações confirmadas |
| **Descartadas** | Infrações rejeitadas |

## Como usar

1. Acesse **Relatórios → Processamento por Usuário**
2. Selecione o **Período**, **Usuário** e **Posto** (opcional)
3. Clique em **Gerar**
4. Exporte em CSV para análise gerencial

:::tip
Alta taxa de descarte em um usuário pode indicar necessidade de treinamento. Baixa taxa pode indicar aprovação inadequada sem critério.
:::

## Interpretação das métricas

| Métrica | Normal | Alerta |
|---------|:------:|:------:|
| Taxa de descarte | 5-15% | >20% ou <2% |
| Infrações/hora | 80-120 | <40 ou >150 |
| Tempo médio | 15-45s | >60s |

## Relacionado

- [Triagem](../glossario/triagem)
- [Motivos de Descarte](../pesagem/motivos)
- [Logs de Acesso](../controle-acesso/logs-acesso)

| Perfil | Meta mín/hora |
|--------|:-------------:|
| Sênior | 120 infrações |
| Pleno | 80 infrações |
| Em treinamento | 40 infrações |

## Relacionado

- [Triagem](../glossario/triagem)
- [Motivos de Descarte](../pesagem/motivos)
- [Logs de Acesso](../controle-acesso/logs-acesso)

:::tip
Use este relatório para avaliar a produtividade de operadores e identificar possíveis inconsistências na taxa de descarte. Alta taxa de descarte em um usuário específico pode indicar necessidade de treinamento.
:::

## Metas de produtividade

| Perfil | Meta mín. infrações/hora |
|--------|:------------------------:|
| Analista sênior | 120 |
| Analista pleno | 80 |
| Em treinamento | 40 |

## Relacionado

- [Triagem](../glossario/triagem)
- [Motivos de Descarte](../pesagem/motivos)
- [Logs de Acesso](../controle-acesso/logs-acesso)


## Erros comuns

| Problema | Causa | Solução |
|----------|-------|---------|
| Usuário sem registros | Não realizou triagem no período | Verificar log de acesso do usuário |
| Taxa de descarte muito alta | Treinamento insuficiente | Revisar sessões de capacitação |
| Produtividade zerada | Sem operação no posto no período | Verificar operações vinculadas ao posto |

## Relacionado

- [Triagem](../glossario/triagem)
- [Motivos de Descarte](../pesagem/motivos)
- [Logs de Acesso](../controle-acesso/logs-acesso)
