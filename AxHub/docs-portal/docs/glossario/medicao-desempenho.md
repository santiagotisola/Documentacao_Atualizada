---
title: "Medição de Desempenho"
sidebar_position: 7
description: "O que é medição de desempenho no AxHub — indicadores, metodologia e base legal"
---

# Medição de Desempenho

Processo de **mensuração da performance operacional** dos equipamentos de fiscalização, baseado em indicadores contratualmente definidos como disponibilidade, taxa OCR e produtividade.

**Base legal:** Lei 11.079/2004 (PPPs) — definida em contratos de concessão

## Indicadores principais

| Indicador | Fórmula | Meta comum |
|-----------|---------|------------|
| **Disponibilidade** | (horas ativas / horas contratuais) × 100 | ≥ 95% |
| **Taxa OCR** | (placas lidas / total capturas) × 100 | ≥ 90% |
| **Produtividade** | infrações geradas / horas ativas | Definida no contrato |

## Ciclo mensal

```
1. Registrar interrupções
2. Calcular disponibilidade
3. Apurar taxa OCR
4. Gerar Boletim de Medição
5. Enviar ao contratante
```

## Relacionado

- [Criar Medição](../medicoes/criar-medicao)
- [Interrupções](../medicoes/interrupcoes)
- [Índices de Performance](../medicoes/indices-performance)

:::info
A **medição de desempenho** é o principal instrumento de prestação de contas nos contratos de concessão e PPPs. Realize mensalmente dentro do prazo contratual.
:::

## Indicadores comuns

| Indicador | Fórmula simplificada | Meta típica |
|-----------|---------------------|:----------:|
| Disponibilidade | (horas ativas / horas contratuais) × 100 | ≥95% |
| Taxa OCR | (placas lidas / capturas) × 100 | ≥90% |
| Tempo de reparo | média de horas até corrigir falha | ≤4h |
| Produção de infracs | infrações exportadas / mês | Conforme contrato |

## Base legal

- **Lei 11.079/2004** — Parceria Público-Privada
- **Lei 8.987/95** — Concessões de serviço público
- Contrato específico da operação

3. Verificar índices de performance
4. Gerar relatório de medição
5. Finalizar e exportar PDF
```

## Relacionados

- [Medições](../medicoes/criar-medicao) — Processo de geração
- [Índices de Performance](../medicoes/indices-performance) — Configuração dos índices

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Disponibilidade calculada acima de 100% | Interrupções não registradas | Registrar todas as interrupções corretamente |
| Taxa OCR abaixo da meta sem explicação | Equipamento com câmera suja ou descalibrada | Programar manutenção preventiva |
| Boletim sem dados de um equipamento | Equipamento não vinculado ao contrato | Verificar vínculos no cadastro do contrato |
| Meta não aparece no boletim | Índice não cadastrado | Configurar índice em Medições → Índices de Performance |

## Tabela de referência — métricas de desempenho

| Métrica | Fórmula | Meta mínima | Alerta |
|--------|---------|:-----------:|:------:|
| Disponibilidade | (horas ativas / contratuais) × 100 | ≥95% | <90% |
| Taxa OCR | (placas lidas / capturas) × 100 | ≥90% | <85% |
| Tempo de reparo | média de horas até corrigir falha | ≤4h | >8h |
| Infracs exportadas | (exportadas / geradas) × 100 | ≥98% | <95% |


## Uso no Sistema AxHub

O modulo **Medicao** controla contratos, indices de performance, recursos alocados e interrupcoes operacionais. Permite gerar medicoes que comprovam o cumprimento dos SLAs contratuais.

## Paginas Relacionadas

- [Contratos](../medicoes/contratos)
- [Indices de Performance](../medicoes/indices-performance)
- [Interrupcoes](../medicoes/interrupcoes)
- [Criar Medicao](../medicoes/criar-medicao)

## Perguntas frequentes

**Com que frequência devo gerar a medição de desempenho?**
Mensalmente, conforme exigência contratual. Gere dentro dos primeiros 5 dias úteis do mês seguinte para envio ao contratante dentro do prazo.

## Contexto operacional

A **medição de desempenho** é o processo que transforma dados operacionais em comprovação contratual. Do ponto de vista do operador, manter os eventos de equipamento registrados corretamente é a contribuição direta para uma boa medição: cada interrupção não registrada pode ser erroneamente contabilizada como indisponibilidade não justificada.

Para o supervisor, o fechamento mensal envolve cruzar os dados de disponibilidade (com as interrupções registradas), taxa OCR (relatório de processamento de imagens) e volume de infrações exportadas. Inconsistências entre esses dados apontam para registros incompletos que precisam ser corrigidos antes da entrega do Boletim de Medição.

Para o gestor, o Boletim de Medição aprovado pelo contratante é o documento que embasa o pagamento mensal. Uma medição contestada pelo contratante é muito mais trabalhosa de defender do que uma medição bem documentada desde o início — portanto, manter o hábito de registrar interrupções e manutenções em tempo real é a melhor prática para um fechamento tranquilo.

**O que acontece se a disponibilidade ficar abaixo da meta?**
Dependendo do contrato, pode haver glosa no pagamento mensal. Documente as causas (eventos registrados) e as ações corretivas tomadas para apresentar ao contratante.

**A medição considera equipamentos que ficaram offline por causa do contratante?**
Depende da classificação da interrupção. Interrupções causadas por terceiros (fornecedoras de energia, contratante) geralmente não descontam da disponibilidade se registradas corretamente com o tipo adequado.

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **Contratos** | A medição de desempenho está sempre vinculada a um contrato de concessão com metas definidas |
| **Índices de Performance** | Os índices configurados por contrato são calculados e compõem o boletim de medição |
| **Interrupções** | Cada interrupção registrada impacta diretamente os indicadores de disponibilidade do boletim |
