---
sidebar_position: 6
title: Reclassificar
description: Reclassificação de Veículos pesados
---

# Reclassificar

Permite reclassificar Veículos que foram pesados com classificação incorreta. Necessário quando o sistema OCR ou o operador atribuiu uma categoria equivocada ao Veículo durante a pesagem.

![Reclassificar](../img/Balança%20-%20Reclassificar.png)

## Como acessar

**Menu lateral** → Balança → **Reclassificar**

## Campos da reclassificação

| Campo | Descrição |
|-------|-----------|
| **Ticket** | Ticket da pesagem original |
| **Classificação Atual** | Tipo de Veículo registrado na pesagem |
| **Nova Classificação** | Classificação correta do Veículo |
| **Motivo** | Justificativa da reclassificação (obrigatório) |
| **Operador** | Usuário responsável pela correção |

## Passo a passo

1. Acesse **Balança → Reclassificar**
2. Informe o **Ticket** da pesagem original
3. Verifique a **Classificação Atual**
4. Selecione a **Nova Classificação** correta
5. Preencha o **Motivo** da reclassificação
6. Clique em **Confirmar**

## Impactos da reclassificação

- O **peso aferido** permanece inalterado
- O **limite de PBT** passa a considerar a nova categoria
- Se o excesso se mantiver, a infração é mantida com nova classificação
- Se o peso estiver dentro do limite com a nova categoria, a infração é cancelada

:::warning Auditoria
Todas as reclassificações são registradas em log com o operador responsável e a justificativa. Reclassificações sem motivo coerente podem ser revistas pela supervisão.
:::

## Impacto da reclassificação

A reclassificação recalcula automaticamente os limites de peso aplicáveis ao Veículo

| Impacto | Descrição |
|---------|-----------|
| **Limite de peso** | Ajustado conforme a nova categoria |
| Infração | Pode ser gerada, cancelada ou alterada conforme o novo limite |
| **Ticket** | Atualizado com a nova classificação e resultado |

:::warning Atenção
Ao reclassificar um Veículo o sistema recalcula o enquadramento da Infração Uma Infração já exportada **não** pode ser reclassificada sem autorização do administrador.
:::

## Relacionado

- [Tickets Fechados](./ticket-fechado)
- [Tickets Abertos](./ticket-aberto)
- [Motivos](./motivos)
- [Postos de Pesagem](./postos)

## Boas práticas

- Reclassifique **antes** de liberar o veículo — a liberação sem reclassificar mantém a classificação incorreta no histórico
- Selecione sempre o motivo correto para que a gestão identifique padrões de classificação equivocada pelos operadores
- Infrações já exportadas não podem ser reclassificadas sem autorização do administrador — verifique o status antes de agir
- Registre na observação por que a classificação original estava incorreta para embasar revisões de processo

---

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Relacionado | [Ticket Fechado](./ticket-fechado) | Ticket a reclassificar |
| Relacionado | [Motivos](./motivos) | Motivos disponíveis |
| Relacionado | [Postos](./postos) | Posto de pesagem de origem |
