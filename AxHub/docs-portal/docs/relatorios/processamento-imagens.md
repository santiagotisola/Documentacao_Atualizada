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

## Casos de uso

- **Manutenção preventiva** — identifique equipamentos com aproveitamento abaixo de 85% para programar limpeza ou calibração
- **Avaliação de ajustes técnicos** — compare o aproveitamento antes e depois de intervenções para medir o impacto
- **Relatórios de manutenção** — exporte os dados para embasar chamados técnicos e contratos de manutenção
- **Detecção de falhas sistêmicas** — múltiplos equipamentos com queda simultânea indicam problema de rede ou servidor

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

## Fluxo de monitoramento de qualidade

1. Acessar **Relatórios → Processamento de Imagens** semanalmente
2. Filtrar por **período** e agrupar por **Equipamento**
3. Identificar equipamentos com **Aproveitamento < 85%**
4. Comparar com semanas anteriores para identificar tendência de queda
5. Taxa em queda: programar manutenção preventiva (limpeza, calibração)
6. Exportar em **Excel** para embasar chamado técnico com evidências

## Tabela de referência — faixas de aproveitamento

| Aproveitamento | Status | Ação recomendada |
|:--------------:|:------:|------------------|
| ≥ 95% | ✅ Excelente | Nenhuma |
| 85 – 94% | ⚠️ Aceitável | Monitorar |
| 70 – 84% | 🟠 Atenção | Verificar limpeza e posição |
| < 70% | 🔴 Crítico | Solicitar manutenção urgente |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Relatório mostra zero registros | Nenhuma operação no período | Verificar operações ativas |
| Aproveitamento 100% inesperado | Filtro muito restrito | Ampliar o período ou remover filtros |
| Equipamento sem dados | Offline ou sem operação | Verificar status no Monitoramento Online |
| Aproveitamento oscila muito | Condições climáticas ou iluminação | Avaliar período extendido de 30 dias |

## Relacionado

- [Processamento por Usuário](./processamento-por-usuario)
- [Eventos de Equipamentos](./eventos-equipamentos)
- [Afer ições](../operacoes/afericoes)
