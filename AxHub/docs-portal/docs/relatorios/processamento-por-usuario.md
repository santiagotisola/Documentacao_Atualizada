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

---

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Relacionado | [Processamento de Imagens](./processamento-imagens) | Visão agregada por Equipamento |
| Relacionado | [Usuários](../controle-acesso/usuarios) | Cadastro de Usuários |
| Relacionado | [Triagem](../infracoes/triagem) | Processo de triagem |
