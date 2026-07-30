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

| Situação | Ação |
|----------|------|
| Ticket expirado sem pesagem realizada | Liberar para nova tentativa |
| Erro no registro do ticket | Liberar e criar novo ticket correto |
| Veículo retido indevidamente | Liberar com motivo administrativo |
| Defeito no Equipamento durante a pesagem | Liberar para repetição em outro posto |

## Relacionado

- [Tickets Abertos](./ticket-aberto)
- [Motivos](./motivos)
- [Log de Acesso](../controle-acesso/logs-acesso)


:::warning Atenção
A liberação é registrada em log e requer justificativa obrigatória. Todas as liberações são auditáveis pela supervisão.
:::

---

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Relacionado | [Ticket Aberto](./ticket-aberto) | Ticket a liberar |
| Relacionado | [Postos](./postos) | Posto de pesagem |
| Relacionado | [Motivos](./motivos) | Motivos de liberação disponíveis |
