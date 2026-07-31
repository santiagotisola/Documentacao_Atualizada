---
sidebar_position: 5
title: Liberar Pesagem
description: Liberação manual de veículos retidos no processo de pesagem no AxTon
---

# Liberar Pesagem

![Dados da Pesagem](../img/inicar%20pesagem%20-%20dados%20da%20pesagem.png)

Permite **liberar manualmente** veículos retidos no processo de pesagem, seja após regularização, decisão de autoridade ou erro no processo.

## Como acessar

**Menu lateral** → **Tickets de Pesagens** → **Liberar**

## Quando liberar um veículo

| Situação | Descrição |
|----------|----------|
| **Excesso regularizado** | Veículo transferiu carga para outro veículo |
| **Autoridade competente** | Decisão judicial ou administrativa |
| **Erro de classificação** | Veículo classificado incorretamente |
| **Isento** | Categoria isenta conforme legislação |

## Passo a passo

1. Localize o ticket na lista de **Tickets Abertos**
2. Clique em **Liberar**
3. Selecione o **Motivo da liberação**
4. Preencha as **Observações** (opcional)
5. Clique em **Confirmar liberação**

:::warning
A liberação é irreversível. Todas as liberações são registradas em log com o operador e o motivo informado.
:::

## Situações que requerem liberação

| Situação | Motivo a usar |
|----------|---------------|
| Veículo transferiu carga | Liberação por descarga |
| Decisão judicial | Liberação administrativa |
| Erro de classificação | Reclassificar primeiro, depois liberar |
| Veículo isento por lei | Liberação por isenção |

## Quando usar

| Situação | Cuidado antes de liberar |
|----------|---------------------------|
| **Transferência de carga** | Confirme a descarga antes de liberar; registre no ticket |
| **Decisão judicial** | Exija o documento formal antes de qualquer ação |
| **Erro de classificação** | Reclassifique primeiro; nunca libere sem corrigir o tipo de eixo |
| **Isenção legal** | Verifique o enquadramento legal com o supervisor antes de liberar |

## Relacionado

- [Motivos](./motivos)
- [Reclassificar](./reclassificar)
- [Tickets Abertos](./ticket-aberto)

4. Opcionalmente informe uma **Observação**
5. Clique em **Confirmar Liberação**

:::caution Responsabilidade
Toda liberação é registrada com o usuário responsável. Selecione o motivo correto para fins de auditoria.
:::

- Correção de registro incorreto

### Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Ticket** | Sim | Número do ticket |
| **Placa** | — | Exibida automaticamente |
| **Motivo da Liberação** | Sim | Justificativa |
| **Responsável** | Sim | Quem autorizou |

### Passo a passo

1. Na tela de **Tickets de Pesagens**, localize o ticket e clique em **Liberar**
2. Localize o ticket pendente
3. Informe o Motivo da Liberação
4. Registre o Responsável pela autorização
5. Clique em **Liberar**

:::caution Importante
Toda liberação gera registro de auditoria com data, hora e responsável.
:::

## Perguntas frequentes

**A liberação pode ser revertida?**
Não. Uma vez liberado, o ticket é fechado. Qualquer reversão requer criação de novo ticket.

**Quem pode autorizar uma liberação administrativa?**
Somente perfis com permissão de Liberar Pesagem. Verifique em Controle de Acesso → Permissões.

**O que acontece com a infração após liberação?**
A infração permanece ativa para triagem. A liberação só libera o veículo, não cancela o auto.

