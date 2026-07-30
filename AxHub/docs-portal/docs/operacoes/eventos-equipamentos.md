---
sidebar_position: 5
title: Eventos de Equipamentos
description: Registro e consulta de eventos operacionais dos equipamentos no AxHub
---

# Eventos de Equipamentos

Permite **consultar e registrar eventos** relacionados aos equipamentos de fiscalização: falhas, manutenções, reativações e alertas operacionais.

![Lista de Eventos](../img/Operações%20-%20eventos%20de%20equipamentos.png)

## Como acessar

**Menu lateral** → Operações → **Eventos de Equipamentos**

## Tipos de evento

| Tipo | Descrição | Origem |
|------|-----------|--------|
| **Falha** | Equipamento parou de funcionar | Automático |
| **Reativação** | Retomada do funcionamento | Automático |
| **Manutenção** | Intervenção técnica programada | Manual |
| **Calibração** | Ajuste técnico no equipamento | Manual |
| **Alerta** | Condição que exige atenção | Automático |

## Campos do cadastro de evento

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Equipamento** | Sim | Equipamento afetado |
| **Tipo** | Sim | Tipo do evento |
| **Data/Hora Início** | Sim | Quando ocorreu |
| **Data/Hora Fim** | Não | Quando foi resolvido |
| **Descrição** | Sim | Detalhamento da ocorrência |

## Impacto nas medições

Eventos de falha são contabilizados como **indisponibilidade** no cálculo das medições contratuais. Registre sempre com precisao.

:::info Permissão
`eventoequipamento.index` (visualizar) | `eventoequipamento.new` (registrar)
:::


![Cadastro de Evento](../img/Operações%20-%20eventos%20de%20equipamentos%20-%20Cadastros.png)

| Campo | Descrição |
|-------|-----------|
| Equipamento | Equipamento relacionado ao evento |
| **Tipo de Evento** | Falha, manutenção, vandalismo, etc. |
| **Data/Hora** | Momento da ocorrência |
| **Descrição** | Detalhamento do evento |
| **Responsável** | Técnico ou analista que registrou |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Monitoramento Online](./monitoramento-online) | Acompanhamento tempo real |
| Relacionado | [Equipamentos](../cadastros-basicos/Equipamentos) | Cadastro de Equipamentos |
| Relatório | [Rel. Eventos Equipamentos](../relatorios/eventos-equipamentos) | Relatório detalhado |
