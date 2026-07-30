---
sidebar_position: 5
title: Relatório de Notas Fiscais
description: NF-e capturadas e vinculadas às passagens no AxTon
---

# Relatório de Notas Fiscais

Lista as **notas fiscais eletrônicas (NF-e)** vinculadas às passagens de veículos, com dados de origem, destino, chave de acesso e status de validação.

## Como acessar

**Menu lateral** → Relatórios → **Relatório de Notas Fiscais**

## Filtros

| Filtro | Descrição |
|--------|-----------|
| **Período** | Data início e fim |
| **Chave NF-e** | Busca por chave específica |
| **CNPJ Emitente** | Filtrar por empresa emissora |
| **Status** | Válida, Vencida, Cancelada, Ausente |

## Colunas

| Coluna | Descrição |
|--------|-----------|
| **Chave** | 44 dígitos da NF-e |
| **Emitente** | CNPJ do remetente |
| **Destinatário** | CNPJ do destinatário |
| **Valor total** | Valor declarado na nota |
| **Status** | Válida / Vencida / Cancelada |

:::tip
Use o filtro **Status = Ausente** para identificar veículos de carga que circularam sem nota fiscal, possível irregularidade fiscal a ser reportada.
:::

## Relacionado

- [NF-e](../glossario/nfe) — Glossaróio
- [Relatório de Discrepancias](./relatorio-discrepancias)

| **Valor** | Valor total da nota |
| **Peso declarado** | Peso informado na NF-e |
| **Status** | Válida / Vencida / Cancelada |
| **Placa** | Veículo transportador |

## Uso

- Identificar NF-e canceladas em trânsito
- Detectar sub-declaração de peso (comparar com pesagem real)
- Subsidiar autuações por irregularidade fiscal

## Relacionado

- [NF-e](../glossario/nfe) — Definição e base legal
- [MDF-e](../glossario/mdfe) — Manifesto vinculado


### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Chave NFe** | Identificador único da nota |
| **Placa** | Veículo associado |
| **Origem** | UF/cidade de origem |
| **Destino** | UF/cidade de destino |
| **Data/Hora** | Registro da passagem |

### Filtros disponíveis

- Período (data inicial e final)
- Posto de pesagem
- Exportar para Excel/PDF
