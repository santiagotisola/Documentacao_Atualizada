---
sidebar_position: 5
title: Liberar Tickets para Pesagem
description: Liberação de tickets para nova pesagem
---

# Liberar Tickets para Pesagem

Permite liberar tickets de pesagem para que Veículos retidos realizem nova pesagem. Utilizado quando um ticket foi cancelado, expirado ou precisa ser reaberto por decisão administrativa.

![Liberar Tickets](../img/Balança%20-%20Liberar%20Tickets%20para%20Pesagem.png)

## Como acessar

**Menu lateral** → Balança → **Liberar Tickets para Pesagem**

## Campos da liberação

| Campo | Descrição |
|-------|-----------|
| **Número do Ticket** | Ticket a ser liberado |
| **Motivo** | Justificativa para liberação |
| **Observação** | Detalhes adicionais da liberação |
| **Operador** | Usuário responsável pela liberação |

## Passo a passo

1. Acesse **Balança → Liberar Tickets para Pesagem**
2. Informe o **Número do Ticket**
3. Selecione o **Motivo**
4. Preencha as **Observações** (opcional)
5. Clique em **Liberar**

:::warning
A liberação de tickets é uma ação registrada em log. Certifique-se de selecionar o motivo correto — liberações sem justificativa coerente podem ser auditadas pelo órgão contratante.
:::

## Quando utilizar

| Situação | Motivo a usar |
|----------|---------------|
| Veículo transferiu carga para outro | Liberação por descarga |
| Decisão judicial ou administrativa | Liberação administrativa |
| Defeito no equipamento | Liberação por falha técnica |
| Reclassificação eliminou excesso | Liberar após reclassificar |

## Impacto legal

A liberação sem o motivo correto pode:
- Comprometer a validade do processo de autuação
- Gerar responsabilidade administrativa do operador
- Ser questionada em recurso pelo infrator

## Prazo de retenção

Veículos retidos têm direitos legais:
- **4 horas**: direito à alimentação
- **24 horas**: direito a remoção para pátio credenciado

**Base:** Art. 231, §2º do CTB + Portaria DENATRAN 40/2014

## Erros comuns

| Situação | Causa | Solução |
|----------|-------|----------|
| Liberação sem motivo válido | Motivo genérico selecionado | Selecionar motivo específico |
| Ticket não aparece para liberar | Número digitado incorretamente | Confirmar o número no Ticket Aberto |
| Infração exportada não pode ser liberada | Lote já transmitido | Contatar administrador |

## Tabela de referência — motivos de liberação

| Situação | Motivo correto | Documentar |
|----------|:-------------:|:----------:|
| Descarga de carga realizada | Liberação por descarga | Foto da descarga |
| Decisão judicial | Liberação administrativa | Cópia do documento |
| Defeito no equipamento | Liberação por falha técnica | Registro do evento |
| Veículo isento | Liberação por isenção legal | Embasamento legal |

## Relacionado

- [Motivos](./motivos)
- [Reclassificar](./reclassificar)
- [Tickets Abertos](./ticket-aberto)

## Relacionado

- [Motivos](./motivos) — Motivos de liberação disponíveis
- [Reclassificar](./reclassificar) — Reclassificação de veículo retido
- [Tickets Abertos](./ticket-aberto) — Consulta e gestão de tickets em aberto
- [Log de Acesso](../controle-acesso/logs-acesso) — Auditoria de liberações registradas
