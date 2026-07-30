---
sidebar_position: 3
title: Eventos de Equipamentos
description: Histórico de eventos operacionais dos equipamentos de pesagem no AxTon
---

# Eventos de Equipamentos

Registro automático dos **eventos operacionais** dos equipamentos de pesagem: inicialização, falhas, manutenções e alertas.

## Como acessar

**Menu lateral** → Operações → **Eventos de Equipamentos**

## Tipos de evento

| Tipo | Ícone | Descrição |
|------|-------|-----------|
| **Inicialização** | ✅ | Equipamento ligado e operacional |
| **Falha** | ❌ | Equipamento com problema técnico |
| **Manutenção** | ὒ7 | Manutenção preventiva ou corretiva |
| **Alerta** | ⚠️ | Condição que requer atenção |
| **Reativado** | ↩ | Retorno após manutenção |

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Período** | Data início e fim |
| **Equipamento** | Filtrar por balança específica |
| **Tipo de evento** | Falha, manutenção, etc. |

## Passo a passo — Registrar evento manual

1. Acesse **Operações → Eventos de Equipamentos**
2. Clique em **+ Novo Evento**
3. Selecione o **Equipamento**
4. Informe o **Tipo** e a **Descrição**
5. Defina a **Data/Hora** de início e fim
6. Clique em **Salvar**

:::tip
Eventos registrados aqui alimentam o **Relatório de Eventos** e o cálculo de disponibilidade na medição contratual. Registre sempre com precisão de horário.
:::

## Quando usar

| Tipo de evento | Quando registrar |
|----------------|------------------|
| **Falha do equipamento** | Imediatamente ao detectar o problema; define o início da interrupção |
| **Reinicio/reativação** | Assim que o equipamento retornar à operação normal |
| **Manutenção preventiva** | Antes do início e após conclusão para calcular o tempo de parada |
| **Calibração / Aferição** | Registre data e hora exatas — impacta o cálculo de disponibilidade contratual |

## Relacionado

- [Alertas](./alertas)
- [Monitoramento Online](./monitoramento-online)
- [Medições → Interrupções](../medicoes/interrupcoes)

:::info Impacto nas medições
Eventos de falha registrados aqui são considerados no cálculo da disponibilidade das [Medições](../medicoes/criar-medicao).
:::


## Erros comuns

| Problema | Causa | Solução |
|----------|-------|---------|
| Evento não impacta disponibilidade | Tipo não mapeado como falha | Revisar tipo do evento (usar "Falha") |
| Duração zerada | Data fim não registrada | Editar o evento e adicionar data fim |
| Evento não aparece nos relatórios | Período de filtro incorreto | Ampliar período e verificar equipamento |
| Alerta sem evento vinculado | Falha automática não registrada | Registrar retroativamente com justificativa |

## Relacionado

- [Alertas](./alertas)
- [Monitoramento Online](./monitoramento-online)
- [Medições → Interrupções](../medicoes/interrupcoes)
