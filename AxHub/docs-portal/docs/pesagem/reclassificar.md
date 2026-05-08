---
sidebar_position: 6
title: Reclassificar
description: Reclassificação de veículos pesados
---

# Reclassificar

Permite reclassificar veículos que foram pesados com classificação incorreta. Necessário quando o sistema OCR ou o operador atribuiu uma categoria equivocada ao veículo durante a pesagem.

![Reclassificar](../img/Balança%20-%20Reclassificar.png)

## Como acessar

**Menu lateral** → Balança → **Reclassificar**

## Campos da reclassificação

| Campo | Descrição |
|-------|-----------|
| **Ticket** | Ticket da pesagem original |
| **Classificação Atual** | Tipo de veículo registrado na pesagem |
| **Nova Classificação** | Classificação correta do veículo |
| **Motivo** | Justificativa da reclassificação (obrigatório) |
| **Operador** | Usuário responsável pela correção |

## Impacto da reclassificação

A reclassificação recalcula automaticamente os limites de peso aplicáveis ao veículo:

| Impacto | Descrição |
|---------|-----------|
| **Limite de peso** | Ajustado conforme a nova categoria |
| **Infração** | Pode ser gerada, cancelada ou alterada conforme o novo limite |
| **Ticket** | Atualizado com a nova classificação e resultado |

:::warning Atenção
Ao reclassificar um veículo, o sistema recalcula o enquadramento da infração. Uma infração já exportada **não** pode ser reclassificada sem autorização do administrador.
:::

---

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Relacionado | [Ticket Fechado](./ticket-fechado) | Ticket a reclassificar |
| Relacionado | [Motivos](./motivos) | Motivos disponíveis |
| Relacionado | [Postos](./postos) | Posto de pesagem de origem |
