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

## Boas práticas

- Registre a interrupção **imediatamente** quando ocorrer — interrupções sem registro são contabilizadas como indisponibilidade penalizando o SLA
- Classifique corretamente o tipo: manutenção preventiva programada geralmente não penaliza; corretiva sim
- Descreva a causa e as ações tomadas com detalhes suficientes para embasar discussões contratuais
- Registre a **Data/Hora Fim** assim que o equipamento voltar a operar para calcular a duração com precisão
