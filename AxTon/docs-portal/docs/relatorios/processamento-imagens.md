---
sidebar_position: 6
title: Processamento de Imagens
description: Volume e taxa de reconhecimento de imagens no AxTon
---

# Processamento de Imagens

![Tempo de Análise de Imagem](../img/tempo%20de%20analise%20de%20imagem.png)

Apresenta o **volume de imagens capturadas e processadas** pelo sistema, incluindo taxas de reconhecimento OCR e falhas. Permite monitorar a qualidade das capturas dos equipamentos.

## Como acessar

**Menu lateral** → Relatórios → **Processamento de Imagens**

## Indicadores exibidos

| Indicador | Descrição |
|----------|-----------|
| **Total capturado** | Imagens tiradas pelos equipamentos no período |
| **Reconhecidas** | Imagens com placa legível pelo OCR |
| **Não reconhecidas** | Imagens sem leitura de placa |
| **Taxa OCR** | Percentual de reconhecimento (meta: >90%) |
| **Tempo médio** | Tempo médio de processamento por imagem |

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Período** | Data início e fim |
| **Equipamento** | Filtrar por câmera/sensor específico |
| **Posto** | Filtrar por localidade |

## Interpretação da Taxa OCR

| Taxa | Status | Ação recomendada |
|------|--------|------------------|
| ≥90% | ✅ Normal | Monitorar |
| 80-89% | ⚠️ Atenção | Verificar limpeza das câmeras |
| <80% | ❌ Crítico | Solicitar manutenção técnica |

:::tip
Use este relatório semanalmente para identificar equipamentos com queda de OCR antes que impacte a medição contratual.
:::

## Casos de uso

- **Monitoramento de qualidade** — identifique semanalmente equipamentos com OCR abaixo de 85% antes que impactem a medição contratual
- **Solicitação de manutenção** — exporte os dados para embasar chamados técnicos com evidências de queda de desempenho
- **Avaliação pós-intervenção** — compare o aproveitamento antes e depois de limpeza ou calibração
- **Alerta de falha sistêmica** — múltiplos equipamentos com queda simultânea indicam problema de rede ou servidor

## Relacionado

- [Processamento por Usuário](./processamento-por-usuario)
- [Índices de Performance](../medicoes/indices-performance)
- [Fluxo Diário de Veículos](./fluxo-diario-veiculos)

| Taxa | Situação | Ação |
|------|----------|------|
| > 95% | Excelente | Manter |
| 85-95% | Aceitável | Monitorar |
| 70-85% | Atenção | Verificar calibração |
| < 70% | Crítico | Manutenção urgente |

:::tip Dica
Use este relatório mensalmente para embasar solicitações de manutenção em equipamentos com baixa taxa de reconhecimento.
:::


| Coluna | Descrição |
|--------|-----------|
| **Período** | Data referência |
| **Capturadas** | Total de imagens |
| **Processadas** | Imagens analisadas |
| **Reconhecidas** | Placas identificadas |
| **Taxa** | Percentual de sucesso |

### Filtros disponíveis

- Período (data inicial e final)
- Posto de pesagem
- Exportar para Excel/PDF
