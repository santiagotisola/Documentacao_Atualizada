---
sidebar_position: 2
title: Monitoramento Online
description: Acompanhamento em tempo real das operações e equipamentos de pesagem no AxTon
---

# Monitoramento Online

Dashboard de acompanhamento **em tempo real** do status dos equipamentos de pesagem e das operações em campo.

## Como acessar

**Menu lateral** → Operações → **Monitoramento Online**

## Painel de status

| Informação | Descrição |
|-------------|-----------|
| **Status do posto** | Operacional / Offline / Em manutenção |
| **Veículos no momento** | Quantidade aguardando pesagem |
| **Última pesagem** | Data/hora e placa do último registro |
| **Infrações pendentes** | Tickets aguardando triagem |

## Indicadores em tempo real

- **Balança online/offline**: sinal de heartbeat dos sensores
- **Fila de espera**: veículos aguardando pesagem
- **Alertas ativos**: infrações geradas não triadas

## Usos operacionais

- Verificar se os postos estão ativos e respondendo
- Identificar acumulo de veículos aguardando pesagem
- Checar alertas de infrações não triadas

:::tip
O monitoramento online atualiza automaticamente a cada 30 segundos. Não é necessário atualizar a página manualmente.
:::

- **Gestão de fila**: controlar o fluxo de veículos no posto
- **Alerta de falha**: identificar balança offline imediatamente
- **Produção**: acompanhar volume de pesagens por turno

:::tip Dica
Manter o Monitoramento Online aberto durante o turno permite agir rapidamente em caso de falha de equipamento.
:::


## Elementos da tela

### Status dos Equipamentos

| Indicador | Significado |
|-----------|-------------|
| 🟢 **Online** | Equipamento comunicando normalmente |
| 🔴 **Offline** | Sem comunicação — verificar conectividade |
| 🟡 **Alerta** | Comunicando com advertências |

### Informações exibidas

- Nome do Equipamento e posto
- Última comunicação (data/hora)
- Tempo sem comunicação
- Quantidade de passagens nas últimas 24h

:::tip Dica
Mantenha está tela aberta durante as operações para detecção rápida de falhas de comunicação.
:::
