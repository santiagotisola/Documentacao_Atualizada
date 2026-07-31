---
sidebar_position: 4
title: Exportação de Infrações
description: Exportar lotes de Infrações para o órgão autuador no AxTon
---

# Exportação de Infrações

![Tela de Exportação](../img/axton-exportacao.png)

A exportação envia as Infrações registradas para o órgão autuador em **lotes numerados**. Cada lote contém as Infrações de um determinado período e tipo, com sequencial próprio.

## Como acessar

**Menu lateral** → **Exportação**

## Listagem de Lotes

### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Arquivo** | Formato do arquivo exportado (ex: XTraffic) |
| **Tipo Exportação** | Sistema destino (XTraffic ou AxHub) |
| **Tipo Infração | Excesso de PBT, Eixo ou Eixo/PBT |
| **Sequencial** | Número do lote de exportação |
| **Data Gerada** | Data em que o lote foi criado |
| **Data Inicial** | Período inicial das Infrações |
| **Data Final** | Período final das Infrações |
| **Logs** | Informações de processamento |
| **Status** | Ok, Processando ou Error |
| **Ações** | Visualizar e Excluir |

### Exemplos de lotes exportados

| Tipo Exportação | Tipo Infração | Seq | Data Gerada | Período | Status |
|-----------------|--------------|-----|------------|---------|--------|
| XTraffic | Excesso de Eixo/PBT | **70** | 06/03/2026 | 01/01/2026 a 06/03/2026 | **Ok** |
| XTraffic | Excesso de Eixo/PBT | **69** | 23/02/2026 | 16/02 a 20/02/2026 | **Ok** |
| XTraffic | Excesso de Eixo | **66** | 23/02/2026 | 16/02 a 20/02/2026 | **Ok** |
| XTraffic | Excesso de Eixo/PBT | **68** | 18/02/2026 | 09/02 a 13/02/2026 | **Ok** |
| XTraffic | Excesso de PBT | **60** | 18/02/2026 | 09/02 a 13/02/2026 | **Ok** |

### Filtros disponíveis

| Filtro | Opções |
|--------|---------|
| **Status** | Todos, Ok, Processando, Error |
| **Data Inicial** | Data de início do período |
| **Data Final** | Data de fim do período |
| **Tipo de exportação** | Todos, AxHub, XTraffic |

### Status dos Lotes

| Status | Descrição |
|--------|-----------|
| **Ok** | Lote gerado e processado com sucesso |
| **Processando** | Lote em geração ou envio |
| **Error** | Falha no processamento — verificar logs |

## Tipos de Exportação

| Sistema | Descrição |
|----------|-----------|
| **XTraffic** | Formato padrão para o sistema XTraffic do órgão autuador |
| **AxHub** | Integração direta com o AxHub para consolidação |

## Gerar Novo Lote

### Passo a passo

1. No menu lateral, clique em **Exportação**
2. Clique em **+ Novo**
3. Selecione o **Tipo de Exportação** (XTraffic ou AxHub)
4. Selecione o **Tipo de Infração
5. Defina o **Período** (Data Inicial e Final)
6. Clique em **Salvar**
7. Aguarde o status mudar para **Ok**
8. Clique em **Visualizar** para conferir o conteúdo

:::tip Dica
Gere lotes separados para cada **Tipo de Infração órgão autuador geralmente exige arquivos separados por enquadramento.
:::

:::warning Atenção
Lotes com status **Error** devem ser analisados nos **Logs** antes de reenvio. Não exclua lotes antes de confirmar que foram recebidos pelo órgão.
:::

## Fluxo de exportação de infrações

1. Verificar **Sequênciais de Exportação** (Cadastros → Sequênciais) para garantir que todos os tipos têm sequêncial ativo
2. Acessar **Exportação** no menu lateral
3. Clicar em **+ Novo**
4. Selecionar o **Tipo de Exportação** (XTraffic ou AxHub) e o **Tipo de Infração**
5. Definir o **Período** das infrações a incluir
6. Clicar em **Salvar** e aguardar status **Ok**
7. Transmitir o arquivo ao órgão autuador e guardar o protocolo

## Tabela de referência — status dos lotes

| Status | Significado | Ação |
|--------|-------------|------|
| **Ok** | Lote gerado com sucesso | Download e transmissão |
| **Processando** | Geração em andamento | Aguardar |
| **Error** | Falha no processamento | Verificar Logs antes de reenviar |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Lote com status Error | Sequêncial não configurado | Criar sequêncial para o tipo de infração |
| Lote gerado sem infrações | Período sem infrações triadas | Verificar triagem pendente no período |
| Código de município divergente | Faixa com código IBGE incorreto | Corrigir o código IBGE nas configurações de faixa |
| Lote rejeitado pelo órgão | Formato XTraffic incorreto | Verificar versão do layout com o contratante |

## Veja também

| Funcionalidade | Descrição |
|---|---|
| [**Sequênciais de Exportação**](../cadastros/sequencial-exportacao) | Numeração dos lotes |
| [**Sequênciais de Infração**](../cadastros/sequencial-infracao) | Numeração dos autos |
| [**Tickets de Pesagens**](../pesagem/ticket-aberto) | Infrações geradas na pesagem |

## Integração com outros módulos

| Módulo | Como se relaciona com Exportação de Infrações |
|--------|---------------------------------------------------|
| **Cadastros → Sequencial de Exportação** | Define a numeração dos lotes gerados — obrigatório antes de exportar |
| **Cadastros → Sequencial de Infração** | Define a numeração dos autos incluídos no lote |
| **Falhas Sequenciais** | Execute antes de exportar para verificar integridade da numeração |
| **Relatório de Infrações** | Confirme o status **Auditada** de todas as infrações antes de gerar o lote |
