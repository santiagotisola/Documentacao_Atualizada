---
sidebar_position: 2
title: Relatório de Infrações
description: Infrações de excesso de peso registradas por período, posto e status no AxTon
---

# Relatório de Infrações

Exibe as **infrações de excesso de peso** registradas pelo AxTon, agrupadas por período, posto e status de processamento. Essencial para auditoria e preparação de lotes de exportação.

## Como acessar

**Menu lateral** → Relatórios → **Relatório de Infrações**

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Período** | Data início e data fim |
| **Posto de pesagem** | Filtrar por localidade |
| **Status** | Triada, Auditada, Exportada, Descartada |
| **Placa** | Busca por placa específica |
| **Enquadramento** | Artigo do CTB |

## Colunas do resultado

| Coluna | Descrição |
|--------|-----------|
| **Nº Infração** | Identificador único |
| **Data/Hora** | Momento da pesagem |
| **Placa** | Placa do veículo infrator |
| **Peso aferido** | Peso real registrado |
| **Excesso (t)** | Quantidade acima do PBT |
| **Status** | Triada / Auditada / Exportada |
| **Posto** | Local da pesagem |

:::tip
Exporte o relatório em CSV para preparar o lote de envio ao órgão autuador.
:::

## Casos de uso

- **Fechamento de lote** — exporte infrações com status **Auditada** para compor o lote de envio ao órgão autuador
- **Auditoria de excesso de peso** — filtre por excesso percentual para identificar reincidentes e planejar operações de fiscalização
- **Acompanhamento do fluxo** — monitore o pipeline triagem → auditoria → exportação por posto e período
- **Preparo de CSV** — exporte em Excel para montar o arquivo de envio ao órgão autuador com os campos exigidos

## Relacionado

- [Infração](../glossario/infracao)
- [Triagem](../glossario/triagem)
- [Processamento por Usuário](./processamento-por-usuario)

| **Excesso (t)** | Toneladas acima do limite |
| **Excesso (%)** | Percentual de excesso |
| **Enquadramento** | Artigo do CTB aplicado |
| **Status** | Estado atual no fluxo |
| **Ações** | Visualizar detalhes |

## Exportação

- **Excel**: dados tabulados para análise
- **PDF**: relatório formatado para impressão

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Relacionado | [Triagem](../infracoes/triagem) | Validação das infrações |
| Relacionado | [Lote Exportação](../infracoes/exportacao) | Envio ao órgão |

