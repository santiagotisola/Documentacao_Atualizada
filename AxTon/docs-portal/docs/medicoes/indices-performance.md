---
sidebar_position: 2
title: Índices de Performance
description: Indicadores de desempenho contratual dos postos de pesagem no AxTon
---

# Índices de Performance

Indicadores que medem o desempenho operacional dos postos de pesagem conforme os critérios definidos em contrato. Base para cálculo de pagamentos e SLA.

## Como acessar

**Menu lateral** → Medições → **Índices de Performance**

## Índices principais

| Índice | Descrição | Fórmula |
|--------|-----------|--------|
| **Disponibilidade** | % do tempo que o equipamento ficou operacional | (horas ativas / horas contratuais) × 100 |
| **Taxa OCR** | % de imagens com placa reconhecida | (reconhecidas / total) × 100 |
| **Produtividade** | Veículos fiscalizados por hora | total veículos / horas ativas |
| **Infrações exportadas** | % de infrações geradas que chegaram ao órgão | (exportadas / geradas) × 100 |

## Metas contratuais típicas

| Índice | Meta mínima |
|--------|-------------|
| Disponibilidade | ≥ 95% |
| Taxa OCR | ≥ 90% |
| Produtividade | Conforme contrato |
| Infrações exportadas | ≥ 98% |

## Como calcular

1. Acesse **Medições → Índices de Performance**
2. Clique em **+ Novo** para criar um índice
3. Preencha os campos e defina a **Meta**
4. Clique em **Salvar**

:::tip
Os índices são calculados automaticamente ao gerar cada medição. Mantenha-os atualizados conforme o contrato vigente.
:::

## Impacto no Boletim

Cada índice abaixo da meta gera uma **entrada de não conformidade** no Boletim de Medição, que pode acionar cláusulas de penalidade contratual.

## Relacionado

- [Contratos](./contratos)
- [Criar Medição](./criar-medicao)
- [Interrupções](./interrupcoes)

2. Selecione o **Contrato** e o **Período**
3. O sistema calcula automaticamente cada índice
4. Compare com as metas contratuais
5. Inclua os resultados na [medição mensal](./criar-medicao)

:::info Impacto no pagamento
Em contratos por desempenho, a disponibilidade abaixo da meta resulta em desconto proporcional no valor mensal.
:::

| **Disponibilidade** | Tempo que o Equipamento ficou online | ≥ 95% |
| **Tempo de Triagem** | Tempo médio para triar uma Infração | ≤ 20 min |
| **Produtividade** | Infrações processadas por dia | Conforme contrato |
| **Qualidade** | Taxa de aceitação dos lotes | ≥ 98% |
