---
sidebar_position: 4
title: Relatório de Discrepâncias
description: Divergências entre pesagens e dados esperados no AxTon
---

# Relatório de Discrepancias

Identifica **divergências** entre os dados registrados e os valores esperados: diferenças de peso, classificação incorreta e inconsistências fiscais.

## Como acessar

**Menu lateral** → Relatórios → **Relatório de Discrepancias**

## Tipos de discrepancia

| Tipo | Descrição | Causa comum |
|------|-----------|-------------|
| **Peso divergente** | Peso aferido ð peso declarado na NF-e | Sub-declaração de carga |
| **Classificação errada** | Categoria do veículo incorreta | OCR + classificação automática |
| **MDF-e inconsistente** | Manifesto não cobre todos os eixos | Erro do emitente |
| **PBT excedido na declaração** | Peso declarado > limite legal | Irregularidade intencional |

## Filtros

| Filtro | Descrição |
|--------|-----------|
| **Período** | Data início e fim |
| **Posto** | Local da pesagem |
| **Tipo de discrepancia** | Filtrar por categoria |

## Como usar

1. Acesse **Relatórios → Relatório de Discrepancias**
2. Selecione o **Período** e o **Posto**
3. Escolha o **Tipo de Discrepancia** (opcional)
4. Clique em **Gerar**
5. Exporte em CSV para análise ou envio à fiscalização

:::warning
Discrepancias entre peso declarado e aferido superior a 10% devem ser reportadas ao órgão fiscalizador conforme obrigação legal.
:::
| **Tolerância (%)** | Excluír discrepancias dentro da margem |

## Uso operacional

- Identificar veículos recorrentes com sub-declaração
- Auditar qualidade das classificações automáticas
- Embasar ações judiciais contra infratores recorrentes

## Exportação

Disponível em **Excel** e **PDF**.


### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Ticket** | Número do ticket |
| **Placa** | Veículo |
| **Peso Esperado** | Valor de referência |
| **Peso Real** | Peso registrado |
| **Diferença** | Valor divergente |

### Filtros disponíveis

- Período (data inicial e final)
- Posto de pesagem
- Exportar para Excel/PDF
