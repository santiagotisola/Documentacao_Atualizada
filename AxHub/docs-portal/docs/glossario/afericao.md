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
