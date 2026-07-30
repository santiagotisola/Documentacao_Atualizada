---
sidebar_position: 8
title: Processamento de Imagens
description: Relatório de processamento de imagens
---

# Relatório de Processamento de Imagens

Apresenta o volume total de imagens processadas no sistema em um determinado período, agrupadas por Equipamento e status. Permite identificar gargalos de processamento e acompanhar a produtividade operacional.

## Como acessar

**Menu lateral** → Relatórios → **Processamento de Imagens**

![Processamento de Imagens](../img/Relatorio%20-%20Relatorio%20de%20procesamento%20de%20imagens%20por%20usuário.png)

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Período** | Faixa de datas do processamento |
| Equipamento | Filtrar por Equipamento específico |
| **Operação** | Operação vinculada ao Equipamento |
| **Status** | Processada, Descartada, Pendente |

## Campos exibidos

| Coluna | Descrição |
|--------|-----------|
| Equipamento | Nome e código do Equipamento |
| **Imagens capturadas** | Total de imagens no período |
| **Processadas** | Imagens analisadas com sucesso |
| **Descartadas** | Imagens rejeitadas |
| **Aproveitamento (%)** | Taxa de imagens úteis |

:::tip
Use este relatório para identificar equipamentos com baixo aproveitamento de imagens. Aproveitamento abaixo de 85% pode indicar necessidade de calibração ou limpeza.
:::

## Relacionado

- [Processamento por Usuário](./processamento-por-usuario)
- [Eventos de Equipamentos](./eventos-equipamentos)
- [Aferições](../operacoes/afericoes)

| **Descartadas** | Imagens rejeitadas por critério de qualidade |
| **Pendentes** | Imagens aguardando processamento |
| **Aproveitamento (%)** | Percentual de imagens processadas com sucesso |

## Exportação

O Relatório pode ser exportado em **Excel** ou **PDF** para Análise externa e inclusão em Relatórios gerenciais.

:::tip Dica
Use este Relatório para identificar Equipamentos com baixo aproveitamento de imagens — pode indicar problemas de iluminação, posicionamento ou falha técnica.
:::

## Navegação relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Relacionado | [Processamento por Usuário](./processamento-por-usuario) | Produtividade por analista |
| Relacionado | [Eventos dos Equipamentos](./eventos-equipamentos) | Histórico de eventos |
| Relacionado | [Monitoramento Online](../operacoes/monitoramento-online) | Status em tempo real |
