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

## Erros comuns

| Erro | Causa | Solução |
|------|-------|---------|
| Evento sem data fim | Esquecimento | Corrigir antes da medição |
| Tipo errado | Preventiva x corretiva | Corrigir o tipo |
| Evento não aparece na medição | Cadastrado após geração | Reabrir medição |

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

## Perguntas frequentes

**Por que um evento de falha registrado não impactou o cálculo de disponibilidade na medição?**
O evento precisa estar classificado com o tipo correto ("Falha") e ter a **Data/Hora Fim** preenchida. Eventos sem data de encerramento ou com tipo incorreto não são computados no cálculo de disponibilidade. Verifique e corrija o registro antes de gerar a medição.

**Como registrar retroativamente uma falha que não foi documentada no momento da ocorrência?**
Acesse **Operações → Eventos de Equipamentos → + Novo Evento**, selecione o equipamento, preencha o tipo, a descrição da causa e defina manualmente as datas de início e fim do ocorrido. O sistema aceita datas retroativas, mas garanta que a justificativa seja detalhada para fins de auditoria contratual.

**Qual a diferença entre registrar um Evento de Falha e uma Interrupção em Medições?**
Eventos de equipamentos são o registro operacional do que aconteceu (falha técnica, manutenção, reinicialização). Interrupções são o registro formal para cálculo de SLA contratual. Toda falha que impacta a disponibilidade deve ser registrada nos dois lugares: aqui como evento técnico e em **Medições → Interrupções** como impacto contratual.

## Integração com outros módulos

| Módulo | Como se relaciona com Eventos de Equipamentos |
|--------|-----------------------------------------------|
| **Medições → Interrupções** | Eventos de falha devem ser registrados também como interrupções para impactar o cálculo de disponibilidade contratual |
| **Monitoramento Online** | Exibe alertas em tempo real que originam os eventos de equipamentos |
| **Alertas** | Alertas configurados disparam notificações que podem ser convertidos em eventos |
| **Relatórios → Falhas Sequenciais** | Consolida eventos de falha por equipamento para análise de padrões e manutenção preventiva |

## Exemplo prático

**Cenário**: A balança HAENNI do Posto PI503B parou de comunicar com o AxTon às 08h42. A equipe técnica chegou ao posto às 10h15 e restaurou a comunicação às 11h00. O operador precisa registrar o evento de falha para que o período de indisponibilidade seja computado na medição contratual.

| Configuração | Valor |
|-------------|-------|
| Equipamento | HAENNI WL103 — PI503B |
| Tipo de evento | Falha |
| Descrição | Perda de comunicação entre balança e servidor |
| Data/Hora Início | 27/06/2026 08:42 |
| Data/Hora Fim | 27/06/2026 11:00 |
| Duração | 2h18min |

**Passo a passo**:
1. Acesse **Operações → Eventos de Equipamentos** e clique em **+ Novo Evento**
2. Selecione o equipamento **HAENNI WL103 — PI503B**
3. Selecione o tipo **Falha**
4. Preencha a descrição: `Perda de comunicação entre balança e servidor AxTon — causa: reinicialização do switch de rede`
5. Informe Data/Hora Início `27/06/2026 08:42` e Fim `27/06/2026 11:00`
6. Clique em **Salvar**
7. Acesse **Medições → Interrupções** e registre o mesmo período como interrupção corretiva

**Resultado**: As 2h18min de indisponibilidade são computadas no índice de disponibilidade do próximo boletim de medição. A equipe técnica tem evidência documentada do incidente para relatórios de manutenção.
