---
sidebar_position: 3
title: Interrupções
description: Registro de interrupções operacionais que afetam a disponibilidade no AxTon
---

# Interrupções

Registro das **interrupções que afetam a disponibilidade** dos equipamentos ou das operações de pesagem. Esses registros são fundamentais para o cálculo correto da medição contratual.

## Como acessar

**Menu lateral** → Medições → **Interrupções**

## Tipos de Interrupção

| Tipo | Descrição | Impacto no SLA |
|------|-----------|----------------|
| **Preventiva** | Manutenção programada | Descontada conforme contrato |
| **Corretiva** | Falha não planejada | Penaliza a disponibilidade |
| **Força maior** | Causas externas (clima, acidente) | Geralmente isenta |
| **Operacional** | Decisão do contratante | Conforme cláusula contratual |

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Equipamento** | Sim | Equipamento afetado |
| **Tipo** | Sim | Tipo de interrupção |
| **Início** | Sim | Data/hora de início |
| **Fim** | Sim | Data/hora de encerramento |
| **Duração** | Automático | Calculada pelo sistema |
| **Descrição** | Sim | Causa e ações tomadas |

## Passo a passo — Registrar interrupção

1. Acesse **Medições → Interrupções**
2. Clique em **+ Nova Interrupção**
3. Selecione o **Equipamento** afetado
4. Informe o **Tipo** e as datas de início e fim
5. Descreva a causa e as ações tomadas
6. Clique em **Salvar**

:::warning
Registre toda interrupção logo que ocorrer. Interrupções não registradas serão contabilizadas como indisponibilidade penalizando o contrato.
:::

| **Manutenção preventiva** | Parada programada |
| **Manutenção corretiva** | Falha não prevista |
| **Queda de energia** | Interrupção no fornecimento elétrico |
| **Falha de comunicação** | Problemas de rede/internet |
| **Força maior** | Eventos climáticos, acidentes |

### Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| Equipamento | Sim | Equipamento afetado |
| **Tipo** | Sim | Categoria da interrupção |
| **Início** | Sim | Data/hora do início |
| **Fim** | Sim | Data/hora do término |
| **Justificativa** | Sim | Descrição detalhada |

### Passo a passo

1. Acesse **Medições** → **Interrupções**
2. Clique em **+ Novo**
3. Selecione o Equipamento
4. Informe o Tipo de interrupção
5. Defina o período (Início e Fim)
6. Descreva a Justificativa
7. Clique em **Salvar**

## Relacionado

- [Criar Medição](./criar-medicao)
- [Índices de Performance](./indices-performance)
- [Contratos](./contratos)
- [Eventos de Equipamentos](../operacoes/eventos-equipamentos)

## Fluxo mensal de registro

1. Monitorar status dos equipamentos diariamente via [Monitoramento Online](../operacoes/monitoramento-online)
2. Registrar cada interrupção imediatamente após a ocorrência com **Data/Hora Início** precisa
3. Ao encerrar a interrupção, registrar a **Data/Hora Fim**
4. No fechamento mensal, revisar todas as interrupções do período antes de gerar a medição
5. Gerar a medição — as interrupções são computadas automaticamente no índice de disponibilidade

## Tabela de referência — prazos de registro

| Tipo | Prazo máximo | Consequência do atraso |
|------|:------------:|------------------------|
| Falha de equipamento | 2h após detecção | Contabiliza como indisponibilidade total |
| Manutenção preventiva | Antes de iniciar | Pode ser contestada como penalidade |
| Evento externo | Até 24h | Sem isenção se não documentada |
| Parada operacional | Mesma data | Conforme cláusula contratual |

## Boas práticas

- Registre a interrupção imediatamente após o início do evento — interrupções não registradas são contabilizadas como indisponibilidade
- Para manutenções programadas, abra o registro com antecedência e classifique como **Preventiva** para que o sistema aplique o tratamento contratual correto
- Descreva a causa e as ações tomadas na justificativa — essa informação compõe o boletim de medição enviado ao contratante
- Interrupções de **Forca maior** devem ser documentadas com evidências (laudo técnico, BO, fotos) para isentar a penalidade contratual

## Boas práticas

- Registre a interrupção **imediatamente** quando ocorrer — interrupções sem registro são contabilizadas como indisponibilidade penalizando o SLA
- Classifique corretamente o tipo: manutenção preventiva programada geralmente não penaliza; corretiva sim
- Descreva a causa e as ações tomadas com detalhes suficientes para embasar discussões contratuais
- Registre a **Data/Hora Fim** assim que o equipamento voltar a operar para calcular a duração com precisão

## Perguntas frequentes

**O que acontece com a disponibilidade se eu não registrar uma interrupção?**
A interrupção será contabilizada como indisponibilidade não planejada no boletim de medição, penalizando o SLA mesmo que a causa fosse justificável. Registre sempre, mesmo retroativamente, com a justificativa correta.

**Posso registrar uma interrupção retroativamente?**
Sim. Informe as datas e horários corretos do início e fim da ocorrência. O sistema usará essas datas para o cálculo, não a data do cadastro.

**Qual a diferença entre interrupção Preventiva e Corretiva para o SLA contratual?**
Interrupções Preventivas (manutenções programadas e comunicadas) geralmente não penalizam a disponibilidade contratual. Corretivas (falhas não planejadas) impactam negativamente o índice de disponibilidade.

## Integração com outros módulos

| Módulo | Como se relaciona com Interrupções |
|--------|-------------------------------------|
| **Medições → Contratos** | O contrato define as metas de disponibilidade contra as quais as interrupções são calculadas |
| **Medições → Criar Medição** | As interrupções registradas impactam diretamente o índice de disponibilidade do boletim |
| **Operações → Eventos de Equipamentos** | Eventos técnicos devem ser espelhados aqui como interrupções quando impactam o SLA |
| **Monitoramento Online** | Falhas detectadas no monitoramento são o gatilho para abertura das interrupções |
