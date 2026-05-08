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
| **Equipamento** | Filtrar por equipamento de origem |
| **Status** | Sucesso, Erro, Parcial |

## Campos exibidos

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

---

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Relacionado | [Equipamentos](../cadastros-basicos/equipamentos) | Origem dos dados |
| Relacionado | [Lote de Exportação](../glossario/lote-exportacao) | Glossário |
| Relacionado | [Logs de Envios](./relatorio-logs-envios) | Envios para integração |
