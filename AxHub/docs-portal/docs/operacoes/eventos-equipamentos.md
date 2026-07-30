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

## Tipos de evento

| Tipo | Descrição | Conta como indisponibilidade? |
|------|-----------|:----------------------------:|
| **Falha** | Equipamento parou de funcionar | Sim |
| **Manutenção preventiva** | Intervenção programada | Não |
| **Manutenção corretiva** | Reparo após falha | Sim |
| **Reinicialização** | Restart automático | Não (se < 5 min) |

## Relacionado

- [Aferições](./afericoes)
- [Relatório de Eventos](../relatorios/eventos-equipamentos)

## Fluxo de registro de eventos

1. Detectar a ocorrência (falha, manutenção, alerta)
2. Acessar **Operações → Eventos de Equipamentos**
3. Clicar em **+ Novo Evento**
4. Selecionar o **Equipamento** afetado e o **Tipo de Evento**
5. Informar a **Data/Hora de Início** e preencher a **Descrição** detalhada
6. Após resolução, informar a **Data/Hora de Fim**
7. O evento é calculado automaticamente na próxima medição

## Tabela de referência — impacto por tipo de evento

| Tipo | Conta como indisponibilidade? | Registrar Fim? |
|------|:----------------------------:|:--------------:|
| **Falha** | Sim | Obrigatório |
| **Manutenção preventiva** | Não | Sim |
| **Manutenção corretiva** | Sim | Obrigatório |
| **Reinicialização** | Não (se < 5 min) | Sim |
| **Calibração** | Não | Sim |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Evento sem data fim | Não registrado após resolução | Editar e informar data fim |
| Disponibilidade calculada errada | Falha sem evento registrado | Cadastrar retroativamente com justificativa |
| Tipo errado usado | Manutenção como Falha | Editar e corrigir o tipo |

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
