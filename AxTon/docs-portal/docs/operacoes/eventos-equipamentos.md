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

:::info Impacto nas medições
Eventos de falha registrados aqui são considerados no cálculo da disponibilidade das [Medições](../medicoes/criar-medicao).
:::


## Listagem

### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Data/Hora** | Momento do evento |
| Equipamento | Equipamento que gerou o evento |
| **Tipo** | Categoria do evento |
| **Descrição** | Detalhes do evento |
| **Severidade** | Info, Aviso, Erro, Crítico |

### Filtros disponíveis

- Período (data inicial e final)
- Equipamento específico
- Tipo de evento
- Severidade

### Tipos de evento comuns

| Tipo | Descrição |
|------|-----------|
| **Inicialização** | Equipamento ligado/reiniciado |
| **Falha de comunicação** | Perda de conexão |
| **Manutenção** | Intervenção técnica registrada |
| **Calibração** | Aferição realizada |
| **Alerta de peso** | Threshold de peso atingido |
