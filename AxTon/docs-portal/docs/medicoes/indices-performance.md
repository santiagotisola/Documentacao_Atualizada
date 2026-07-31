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

## Fluxo de gestão de índices

1. Consultar o contrato para identificar todas as metas de performance exigidas
2. Acessar **Medições → Índices de Performance** e criar um índice para cada meta contratual
3. Preencher **Nome**, **Métrica** e a **Meta (%)** exata prevista em contrato
4. Mensalmente, gerar a medição — o sistema calculará cada índice automaticamente
5. Revisar o Boletim: índices abaixo da meta indicam não-conformidade e podem gerar glosa

## Tabela de referência — índices comuns

| Índice | Meta típica | Base de cálculo |
|--------|:-----------:|-----------------|
| **Disponibilidade** | ≥ 95% | Horas ativas / horas contratuais |
| **Taxa OCR** | ≥ 90% | Reconhecidas / total de pesagens |
| **Infrações exportadas** | ≥ 98% | Exportadas / geradas |
| **Produtividade** | Contratual | Veículos / horas ativas |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|---------|
| Índice não aparece no boletim | Índice não cadastrado | Criar o índice em Medições → Índices de Performance |
| Meta incorreta no boletim | Aditivo contratual não atualizado | Editar o índice com a nova meta |
| Disponibilidade calculada errada | Interrupção não registrada | Registrar interrupção retroativamente |
| Boletim sem índices calculados | Contrato sem índices vinculados | Verificar vinculação dos índices ao contrato |

## Relacionado

- [Contratos](./contratos)
- [Criar Medição](./criar-medicao)
- [Interrupções](./interrupcoes)

## Perguntas frequentes

**O que acontece quando um índice fica abaixo da meta contratual?**
O boletim de medição registra a não conformidade, que pode acionar cláusulas de penalidade ou glosa no pagamento mensal conforme previsto no contrato. Avalie as causas com o contratante o mais rápido possível.

**Os índices de performance são calculados automaticamente?**
Sim. Ao gerar uma medição, o sistema calcula automaticamente cada índice com base nos dados operacionais do período — interrupções registradas, pesagens realizadas e taxa OCR registrada pelos equipamentos.

**Posso ter índices diferentes para postos distintos dentro do mesmo contrato?**
Sim. Cada índice pode ser configurado com metas específicas por posto ou por grupo de equipamentos, permitindo análise granular do desempenho contratual.
