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

---

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Relacionado | [Ticket Fechado](./ticket-fechado) | Ticket a reclassificar |
| Relacionado | [Motivos](./motivos) | Motivos disponíveis |
| Relacionado | [Postos](./postos) | Posto de pesagem de origem |
