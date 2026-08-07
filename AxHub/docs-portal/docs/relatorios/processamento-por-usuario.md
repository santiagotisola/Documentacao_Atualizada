---
sidebar_position: 11
title: Processamento por Usuário
description: Produtividade de triagem por analista no AxHub
---

# Processamento por Usuário

Exibe a **produtividade de processamento por analista** em um período. Utilizado pela gestão para acompanhar desempenho individual e distribuir carga de trabalho.

![Processamento por Usuário](../img/Relatorio%20-%20Relatorio%20de%20procesamento%20de%20imagens%20por%20usuário.png)

## Como acessar

**Menu lateral** → Relatórios → **Processamento por Usuário**

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Período** | Faixa de datas |
| **Usuário** | Filtrar por analista específico |
| **Operação** | Filtrar por operação vinculada |
| **Status** | Processadas, Descartadas ou Todas |

## Colunas

| Coluna | Descrição |
|--------|-----------|
| **Usuário** | Analista responsável |
| **Processadas** | Quantidade triada no período |
| **Validadas** | Imagens confirmadas como infração |
| **Descartadas** | Imagens rejeitadas com motivo |
| **Média/Hora** | Produtividade média por hora |
| **Tempo Médio** | Tempo médio por análise (segundos) |

## Uso gerencial

- Identificar analistas com baixa produtividade
- Distribuir demandas de triagem equilibradamente
- Detectar possíveis inconsistências na taxa de descarte

:::tip
Além da quantidade, analise a **Qualidade** — taxas de descarte muito altas ou muito baixas merecem atenção do supervisor.
:::

## Casos de uso

- **Gestão de produtividade** — compare o volume processado por operador para identificar diferenças de desempenho entre turnos
- **Treinamento direcionado** — operadores com alto índice de descarte ou baixo volume podem precisar de capacitação
- **Evidências para gestão** — exporte os dados para inclusão em relatórios mensais de desempenho operacional
- **Detecção de gargalos** — volumes muito baixos em um período podem indicar interrupção no fluxo de triagem

## Relacionado

- [Triagem](../glossario/triagem)
- [Motivos de Descarte](../administracao/motivos-descartes)
- [Logs de Acesso](../controle-acesso/logs-acesso)

- Detectar gargalos no processamento
- Embasar feedback e treinamentos

## Exportação

Disponível em **Excel** e **PDF**.

| **Período** | Faixa de datas analisada |

## Exportação

Exportável em **Excel** para inclusão em Relatórios de gestão operacional.

:::tip Dica
Compare o **Tempo Médio** entre analistas para identificar Usuários que podem precisar de treinamento adicional no fluxo de triagem.
:::

## Fluxo de análise de produtividade

1. Acessar **Relatórios → Processamento por Usuário** após cada turno ou semana
2. Filtrar por **Usuário** e **Período** de interesse
3. Comparar **Média/Hora** entre analistas do mesmo turno
4. Verificar **Taxa de descarte** — valores acima de 15% merecem investigação
5. Identificar analistas com **Tempo Médio** muito acima da média para treinamento
6. Exportar em Excel para relatório gerencial mensal

## Tabela de referência — benchmarks de produtividade

| Métrica | Referência normal | Alerta |
|---------|:-----------------:|:------:|
| Imagens/hora | 40 – 80 | < 20 ou > 120 |
| Taxa de descarte | 5 – 15% | > 20% |
| Tempo médio/imagem | 30 – 90 seg | > 120 seg |

:::info
Os benchmarks vão variar conforme o tipo de operação. Use a média histórica da sua equipe como referência primária.
:::

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Usuário com zero registros | Não realizou triagem no período | Verificar log de acesso |
| Tempo médio muito alto | Treinamento insuficiente ou distrações | Avaliar fluxo de trabalho |
| Taxa de descarte muito baixa | Possível aprovação sem critério | Revisar amostras auditadas pelo analista |
| Dado ausente de usuário | Sessão compartilhada | Reforçar política de credenciais individuais |

## Relacionado

- [Triagem](../infracoes/triagem)
- [Motivos de Descarte](../administracao/motivos-descartes)
- [Logs de Acesso](../controle-acesso/logs-acesso)

## Perguntas frequentes

**Taxa de descarte muito baixa de um analista deve preocupar?**
Sim. Taxa abaixo de 5% pode indicar que o analista está aprovando imagens sem critério suficiente. O supervisor deve revisar uma amostra das triagens desse analista.

**Como saber se um analista processou menos porque estava em férias ou afastamento?**
Cruce com os Logs de Acesso para verificar os dias em que o usuário acessou o sistema. Dias sem acesso justificam produção zero.

**Qual o método correto para comparar produtividade entre analistas?**
Use a métrica **Média/Hora** em vez do total absoluto. Analistas com turnos diferentes têm totais distintos, mas a média por hora é comparável.

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Infrações — Triagem](../infracoes/triagem)** | O volume processado por usuário é gerado a partir das ações de triagem; cada aprovação ou descarte é contabilizado aqui |
| **[Logs de Acesso](../controle-acesso/logs-acesso)** | Os logs de acesso cruzados com este relatório permitem confirmar se um usuário com produção zero realmente não acessou o sistema |
| **[Motivos de Descarte](../administracao/motivos-descartes)** | A taxa de descarte por analista reflete os motivos de descarte utilizados; motivos inconsistentes indicam necessidade de treinamento |
| **[Medições — Índices de Performance](../medicoes/indices-performance)** | A produtividade da equipe de triagem impacta diretamente os índices de performance do contrato |
