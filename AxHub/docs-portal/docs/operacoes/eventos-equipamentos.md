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
| Relacionado | [Equipamentos](../cadastros-basicos/equipamentos) | Cadastro de Equipamentos |
| Relatório | [Rel. Eventos Equipamentos](../relatorios/eventos-equipamentos) | Relatório detalhado |

## Integração com outros módulos

| Módulo | Como usa este cadastro |
|--------|----------------------|
| **Medições** | Eventos de falha são contabilizados como indisponibilidade no boletim de medição do contrato |
| **Interrupções** | Cada evento de falha deve ter uma interrupção correspondente registrada em Medição |
| **Monitoramento Online** | O status em tempo real é atualizado conforme os eventos registrados |
| **Relatório de Eventos** | Exibe o histórico consolidado de todos os eventos por equipamento e período |

## Perguntas frequentes

**Eventos registrados automaticamente diferem dos manuais em algo?**
Sim. Eventos automáticos (falha, reativação) são gerados pelo monitoramento de heartbeat. Eventos manuais (manutenção, calibração) precisam ser registrados pelo operador e exigem descritos detalhados.

**Posso registrar um evento retroativamente?**
Sim. Informe as datas corretas de início e fim. O sistema calculará o impacto na disponibilidade com base nas datas informadas.

**Um evento sem data de fim impacta a disponibilidade indefinidamente?**
Sim. Eventos de falha sem data de fim são tratados como em andamento. Sempre informe a data de fim após a resolução para fechar corretamente o cálculo de indisponibilidade.

## Exemplo prático

**Registrando uma falha de equipamento com impacto no SLA:**

1. Detectar que o equipamento CAM-001 parou de comunicar às 14h30
2. Acessar **Operações → Eventos de Equipamentos** e clicar em **+ Novo Evento**
3. Preencher:

| Campo | Valor |
|-------|-------|
| **Equipamento** | CAM-001 |
| **Tipo** | Falha |
| **Data/Hora Início** | 15/07/2026 14:30 |
| **Descrição** | Perda de heartbeat — possivel queda de energia |

4. Após restauração às 16h45: preencher **Data/Hora Fim = 15/07/2026 16:45**
5. Registrar a interrupção correspondente em **Medição → Interrupções** para impactar o SLA

:::warning
Sempre registre a **Data/Hora Fim** após a resolução. Eventos sem fim são tratados como em andamento e inflam a indisponibilidade.
:::
