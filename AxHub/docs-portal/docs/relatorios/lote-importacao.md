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

## Fluxo de acompanhamento de importação

1. Acessar **Relatórios → Lotes de Importação** no início do turno
2. Verificar lotes com **Status = Erro** ou **Parcial** do dia anterior
3. Para cada lote com falha: clicar em **Visualizar detalhes** e identificar os registros com erro
4. Corrigir a causa da falha (configuração do equipamento, layout de arquivo, conectividade)
5. Clicar em **Reimportar** para tentar novamente
6. Confirmar que o status mudou para **Sucesso** antes de fechar

## Tabela de referência — status de lotes

| Status | Significado | Impacto | Ação |
|--------|-------------|:-------:|------|
| **Sucesso** | Todos os registros importados | Nenhum | Nenhuma |
| **Parcial** | Parte dos registros com falha | Passagens perdidas | Verificar erros e reimportar |
| **Erro** | Falha total na importação | Dados não disponíveis | Contatar suporte técnico |

## Perguntas frequentes

**O que fazer quando um lote tem status Parcial?**
Clique em **Visualizar detalhes** para identificar quais registros falharam e o motivo. Corrija a causa e clique em **Reimportar** para processar novamente os registros com falha.

**Posso reimportar um lote sem corrigir a causa do erro?**
Não recomendado. Reimportar sem correção replicará o mesmo erro. Identifique e resolva a causa antes de tentar novamente.

**Lotes com status Erro afetam as infrações do período?**
Sim. Registros não importados não geram infrações nem aparecem no relatório de passagens. Resolva rapidamente para não comprometer o volume contratual.
| **Processando** | Import em andamento | Aguardar | Aguardar e verificar novamente |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Lote com zero registros | Equipamento não enviou dados | Verificar conectividade do equipamento |
| Status Parcial persistente | Layout de arquivo incorreto | Conferir configuração em Administração → Layouts |
| Reimportar não resolve | Causa raiz não corrigida | Investigar o log detalhado antes de reimportar |
| Lote duplicado | Importação dupla do mesmo arquivo | Verificar no histórico antes de reimportar |

## Relacionado

- [Logs de Envios](./relatorio-logs-envios)
- [Relatório de Passagens](./relatorio-passagens)
- [Falhas Sequenciais](./falhas-sequenciais)
