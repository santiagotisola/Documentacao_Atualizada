---
sidebar_position: 1
title: Módulo de Pesagem (Balança)
description: Visão geral do módulo de pesagem de veículos no AxHub
---

# Módulo de Pesagem (Balança)

O módulo de **Balança** gerencia o fluxo completo de pesagem de veículos integrada ao AxHub, desde a captura de infrações de excesso de peso até o encerramento e reclassificação dos tickets.

## Como acessar

**Menu lateral** → **Balança** → *(selecione o sub-item)*

## Sub-menus do Módulo de Pesagem

| Sub-menu | URL | Descrição |
|----------|-----|-----------|
| **Liberar Pesagem** | `/ticketpesagem/liberarpesagem` | Libera tickets pendentes para análise |
| **Ticket Aberto** | `/ticketpesagem/ticketabertos` | Lista tickets em andamento |
| **Ticket Fechado** | `/ticketpesagem/ticketfechados` | Lista tickets encerrados |
| **Reclassificar** | `/ticketpesagem/ticketreclassificacao` | Permite reclassificar tickets já processados |
| **Posto Pesagem** | `/posto` | Cadastro e gestão dos postos de pesagem |
| **Motivos** | `/motivoticketpesagem` | Cadastro de motivos de encerramento de tickets |

## Fluxo Operacional

```
Captura de Infração → Liberar Pesagem → Ticket Aberto → Análise → Ticket Fechado
                                                              ↓
                                                       Reclassificar (se necessário)
```

1. **Captura**: O sistema de pesagem registra automaticamente infrações de excesso de peso
2. **Liberar**: O operador acessa **Balança → Liberar Pesagem** e libera os tickets para análise
3. **Análise**: Os tickets liberados aparecem em **Ticket Aberto** para revisão
4. **Encerramento**: Após análise, o ticket é encerrado e vai para **Ticket Fechado**
5. **Reclassificação**: Se necessário, use **Reclassificar** para corrigir a classificação

## Tickets Abertos

![Tickets Abertos](../img/Balança%20-%20Tickets%20Abertos.png)

Exibe os tickets de pesagem que estão em aberto, aguardando análise ou encerramento.

## Tickets Fechados

![Tickets Fechados](../img/Balança%20-%20Tickets%20Fechados.png)

Exibe o histórico de tickets já encerrados, com data e motivo de encerramento.

## Liberar Tickets para Pesagem

![Liberar Tickets](../img/Balança%20-%20Liberar%20Tickets%20para%20Pesagem.png)

Tela para liberar em lote os tickets que chegaram do sistema de pesagem.

## Colunas Principais dos Tickets

| Coluna | Descrição |
|--------|-----------|
| **Data/Hora** | Momento da pesagem |
| **Placa** | Placa do veículo pesado |
| **PBT** | Peso Bruto Total registrado |
| **PBT Limite** | Limite legal de peso para o tipo de veículo |
| **Excesso** | Peso acima do limite, se houver |
| **Status** | Regular, Excesso ou Descartado |

## Navegacao relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Triagem de Balanca](./triagem-balanca) | Fluxo detalhado de triagem |
| Relacionado | [Liberar Pesagem](../pesagem/liberar-pesagem) | Sub-tela: liberar tickets |
| Relacionado | [Ticket Aberto](../pesagem/ticket-aberto) | Sub-tela: tickets em andamento |
| Relacionado | [Ticket Fechado](../pesagem/ticket-fechado) | Sub-tela: tickets encerrados |
| Relacionado | [Reclassificar](../pesagem/reclassificar) | Sub-tela: reclassificacao |
| Relacionado | [Posto Pesagem](../pesagem/postos) | Sub-tela: postos cadastrados |
| Relacionado | [Motivos](../pesagem/motivos) | Sub-tela: motivos de encerramento |
