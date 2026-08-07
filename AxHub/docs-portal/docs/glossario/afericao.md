---
title: "Aferição"
sidebar_position: 3
description: "O que é aferição no AxHub — obrigatoriedade, prazo e consequências"
---

# Aferição

Procedimento técnico de **verificação metrológica** que atesta a conformidade de um instrumento de medição (radar, câmera OCR, balança) com os padrões do INMETRO.

**Base legal:** Resolução CONTRAN 798/2021 — Portaria INMETRO 544/2014

## Obrigatoriedade

Todo equipamento metrológico deve possuir **certificado de aferição válido** para que as infrações tenham validade jurídica. Prazo padrão: **12 meses**.

## Consequências da aferição vencida

| Situação | Consequência |
|----------|---------------|
| Certificação válida | Infrações com plena validade legal |
| Vencida (até 30 dias) | **Alerta** no Dashboard |
| Vencida | **Infrações bloqueadas** — não podem ser exportadas |

## Tipos de aferição

| Tipo | Descrição |
|------|-----------|
| **Inicial** | Realizada na instalação |
| **Periódica** | Recalibração anual obrigatória |
| **Extraordinária** | Após manutenção ou acidente |

## Base legal

- **Resolução CONTRAN 798/2021** — Requisitos para aprovação e uso de equipamentos de fiscalização eletrônica
- **Portaria INMETRO 544/2014** — Regulamento técnico de instrumentos de pesagem e velocimetria
- **Art. 291-A do CTB** — Validade das infrações dependente de equipamento regularmente aferido

## Relacionados

- [Aferições](../operacoes/afericoes) — Registro de aferições no sistema
- [Tipos de Aferições](../administracao/tipos-afericoes) — Configuração dos tipos

## Tabela de referência — prazos e obrigatoriedades

| Tipo | Prazo de validade | Quando realizar | Base legal |
|------|:-----------------:|-----------------|------------|
| Aferição Inicial | 12 meses | Antes de operar | CONTRAN 798/2021 |
| Aferição Periódica | 12 meses | Anualmente | CONTRAN 798/2021 |
| Aferição Pós-Manutenção | Até próxima periódica | Após intervenção | CONTRAN 798/2021 |
| Aferição Extraordinária | Variável | Por exigência do órgão | Contratual |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Infrações bloqueadas sem aviso | Aferição vencida | Registrar nova aferição |
| Alerta de vencimento não aparece | Aferição não registrada | Cadastrar o certificado INMETRO |
| Data de validade incorreta | Cadastro com data errada | Editar aferição e corrigir |

:::warning
Equipamentos com aferição vencida têm infrações **automaticamente invalidadas**. O sistema exibe alertas no Dashboard quando a data de vencimento se aproxima.
:::

## Passo a passo — Registrar aferição

1. Acesse **Operações → Aferições**
2. Clique em **+ Nova**
3. Selecione o **Equipamento**
4. Informe o **Tipo**, **Data** e **Validade**
5. Anexe o **Certificado INMETRO**
6. Clique em **Salvar**

## Quanto custa um equipamento com aferição vencida

Um equipamento com aferição vencida não gera infrações válidas. Cada dia de operação com aferição vencida representa:
- Perda de toda a produção de infrações (não podem ser exportadas)
- Risco de descumprimento do SLA contratual
- Possível penalidade por indisponibilidade efetiva

:::tip
Programe as aferições com **30 dias de antecedncia** em relação ao vencimento para evitar interrupções operacionais.
:::
- [Tipos de Afericoes](../administracao/tipos-afericoes)
- [Dashboard](../primeiros-passos/dashboard)
- [Equipamentos](../cadastros-basicos/equipamentos)

## Perguntas frequentes

**Quantas aferições um equipamento precisa ter por ano?**
No mínimo uma por ano (**Aferição Periódica** obrigatória). Manutenções que afetam componentes metrológicos exigem **Aferição Pós-Manutenção** adicional.

**Quem realiza a aferição dos equipamentos?**
Somente laboratórios credenciados pelo INMETRO. A empresa operadora não pode fazer a aferição — ela apenas agenda com o laboratório e registra o certificado no sistema.

**O que acontece com as infrações geradas durante um período com aferição vencida?**
Elas são bloqueadas automaticamente e não podem ser exportadas. Mesmo que a aferição seja renovada, as infrações do período vencido não são revalidadas.

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **Equipamentos** | Cada equipamento cadastrado precisa ter aferição válida para que suas infrações tenham valor legal |
| **Infrações** | Infrações são bloqueadas automaticamente quando a aferição do equipamento está vencida |
| **Dashboard** | Exibe alertas de vencimento próximo das aferições para ação preventiva |

## Contexto operacional

A **aferição** é o certificado de idoneidade do equipamento. Sem ela válida, nenhuma infração gerada tem valor jurídico — o sistema bloqueia automaticamente a exportação assim que a data de validade expira.

Para o operador, a aferição é transpar ente no dia a dia: ele recebe alertas no Dashboard quando o vencimento se aproxima (30 dias antes) e deve comunicar ao gestor para agendamento. Durante o período de aferição, o equipamento fica temporariamente fora de operação e esse tempo deve ser registrado como interrupção no módulo de Medição.

Para o gestor, o planejamento das aferições anuais com **30 dias de antecipacão** é obrigação estratégica: o agendamento tardio com laboratórios credenciados INMETRO pode resultar em operação com aferição vencida, gerando perda de toda a produção de infrações do período e possível penalidade contratual por indisponibilidade efetiva.
