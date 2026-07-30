---
title: "Lote de Exportação"
sidebar_position: 6
description: "O que é lote de exportação no AxHub — fluxo, status e base legal"
---

# Lote de Exportação

Conjunto agrupado de **infrações processadas e validadas**, formatado e enviado ao órgão autuador (DETRAN, DER, Prefeitura) através de integração sistêmica.

**Base legal:** Resolução CONTRAN 619/2016

## Ciclo de vida do lote

```
Criado → Processando → Enviado → Aceito
                  ↓
                Erro → Tentar novamente → Enviado
```

## Status possíveis

| Status | Descrição |
|--------|-----------|
| **Criado** | Lote gerado, aguardando envio |
| **Processando** | Sendo formatado e validado |
| **Enviado** | Transmitido ao órgão autuador |
| **Aceito** | Confirmado pelo órgão |
| **Erro** | Falha no envio — precisa reprocessar |

## Relacionado

- [Lotes de Importação](../relatorios/lote-importacao)
- [Sequenciais de Lote](../administracao/sequenciais-lote-exportacao)

| **Processando** | Envio em andamento |
| **Enviado** | Transmitido com sucesso |
| **Aceito** | Confirmado pelo órgão |
| **Erro** | Falha no envio |
| **Cancelado** | Cancelado antes do envio |

## O que compõe um lote

- Infrações aprovadas na auditoria
- Dados do enquadramento (artigo CTB, pontos, valor)
- Imagens das infrações
- Informações do veículo e do equipamento

## Relacionados

- [Lote de Exportação](../infracoes/exportacao) — Gerenciamento de lotes
- [Auditoria](../infracoes/auditoria) — Pré-requisito para exportar


## Uso no Sistema AxHub

No modulo **Infracoes - Exportacao**, o sistema agrupa as infracoes auditadas em lotes conforme o layout definido em **Administracao - Layouts de Arquivos**. Os sequenciais sao controlados em **Sequenciais de Lote de Exportacao**.

## Paginas Relacionadas

- [Exportacao](../infracoes/exportacao)
- [Layouts de Arquivos](../administracao/layouts-arquivos)
- [Sequenciais de Lote](../administracao/sequenciais-lote-exportacao)
