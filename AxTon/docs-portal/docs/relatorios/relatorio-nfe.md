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

- [NF-e](../glossario/nfe) — Glossário
- [MDF-e](../glossario/mdfe)
- [Relatório de Discrepancias](./relatorio-discrepancias)

## Fluxo de validação NF-e

1. Veículo de carga passa pelo equipamento de pesagem
2. OCR captura a placa e consulta o SEFAZ/MDF-e vinculado
3. Sistema verifica se há NF-e válida associada à placa no momento da passagem
4. Se ausente ou inválida → registro gerado com status **Ausente** ou **Cancelada**
5. Operador acessa este relatório e filtra por **Status = Ausente**
6. Exporta a lista e encaminha à Secretaria de Fazenda estadual

## Tabela de referência — status de NF-e

| Status | Significado | Ação recomendada |
|--------|-------------|------------------|
| **Válida** | NF-e ativa e dentro do prazo | Nenhuma |
| **Vencida** | NF-e expirada no momento da passagem | Registrar irregularidade |
| **Cancelada** | NF-e cancelada após emissão | Autuação por transporte irregular |
| **Ausente** | Nenhuma NF-e encontrada para a placa | Reportar à SEFAZ |

## Base legal

**Ajuste SINIEF 07/2005** — obrigatoriedade da NF-e para veículos de carga em trânsito. Fiscalização sancionada pela **Lei 8.137/90** (crimes contra a ordem tributária).

:::tip Auditoria fiscal
Exporte o relatório de NF-e ausente e compartilhe com a Secretaria de Fazenda estadual para notificação dos emitentes irregulares.
:::
| **Valor** | Valor total da nota |
| **Peso declarado** | Peso informado na NF-e |

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Relatório sem NF-e | Veículos sem consulta SEFAZ configurada | Verificar integração SEFAZ/MDF-e nas Configurações do Sistema |
| Status sempre "Ausente" | Integração SEFAZ inativa | Contatar suporte técnico para revisar a integração |
| NF-e com peso declarado zerado | NF-e emitida sem campo de peso | Orientar o emitente a corrigir o manifesto |
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
