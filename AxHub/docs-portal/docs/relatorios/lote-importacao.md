---
sidebar_position: 7
title: Lotes de Importação
description: Consulta de lotes de importação de dados
---

# Lotes de Importação

Exibe os lotes de dados importados para o sistema, permitindo acompanhar o status de cada importação e identificar erros de processamento.

![Lotes de Importação](../img/Relatorios%20-%20lotes%20importação.png)

## Como acessar

**Menu lateral** → Relatórios → **Lotes de Importação**

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Período** | Faixa de datas da importação |
| Equipamento | Filtrar por Equipamento de origem |
| **Status** | Sucesso, Erro, Parcial |

## Campos exibidos

| Campo | Descrição |
|-------|-----------|
| **ID do Lote** | Identificador único da importação |
| **Data/Hora** | Quando a importação foi realizada |
| **Equipamento** | Origem dos dados |
| **Registros** | Total de registros no lote |
| **Sucesso** | Quantidade processada com sucesso |
| **Erros** | Quantidade com falha |
| **Status** | Sucesso / Erro / Parcial |

## Como interpretar erros

| Status | Significado | Ação |
|--------|-------------|------|
| **Sucesso** | Todos registros importados | Nenhuma |
| **Parcial** | Parte importada, parte com falha | Verificar registros com erro |
| **Erro** | Falha total na importação | Contatar suporte técnico |

:::tip
Exporte o relatório do lote para identificar quais registros específicos falharam e o motivo do erro.
:::

| Coluna | Descrição |
|--------|-----------|
| **Número do Lote** | Identificador do lote |
| **Data** | Data e hora da importação |
| **Registros** | Quantidade de registros importados |
| **Status** | Sucesso, Erro, Parcial |
| **Origem** | Equipamento ou sistema de origem |
| **Erros** | Quantidade de registros rejeitados |
| **Mensagem** | Detalhes de erro quando Status = Erro |

## Ações disponíveis

| Ação | Descrição |
|------|-----------|
| **Visualizar detalhes** | Abre o log completo do lote |
| **Reimportar** | Tenta reimportar o lote em caso de falha |
| **Exportar log** | Salva o log de erros em arquivo |

:::warning Atenção
Lotes com status **Parcial** importaram apenas parte dos registros. Verifique os erros antes de considerar a importação concluída.
:::

## Relacionado

- [Logs de Envios a Integração](./relatorio-logs-envios)
- [Relatório de Passagens](./relatorio-passagens)
- [Lote de Exportação](../glossario/lote-exportacao)
- [Falhas Sequenciais](./falhas-sequenciais)

## Boas práticas

- Priorize lotes com **Status = Erro** ou **Parcial** antes de processar novas importações
- Use **Reimportar** somente após identificar a causa da falha — reimportações sem correção repetirão o erro
- Exporte o log de erros para análise técnica ou encaminhamento ao suporte
- Monitore diariamente o volume importado para detectar falhas silenciosas (lotes com zero registros)

---

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Relacionado | [Equipamentos](../cadastros-basicos/equipamentos) | Origem dos dados |
| Relacionado | [Lote de Exportação](../glossario/lote-exportacao) | Glossário |
| Relacionado | [Logs de Envios](./relatorio-logs-envios) | Envios para integração |
