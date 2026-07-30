---
sidebar_position: 5
title: Grupos de Equipamentos
description: Agrupamento lógico de equipamentos de pesagem no AxTon
---

# Grupos de Equipamentos

Agrupamento lógico de equipamentos para **organização por contrato, região ou tipo de operação**. Facilita filtros em relatórios e medições contratuais.

## Como acessar

**Menu lateral** → Cadastros Básicos → **Grupos de Equipamentos**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome do grupo |
| **Descrição** | Não | Finalidade do agrupamento |
| **Equipamentos** | Sim | Lista de equipamentos do grupo |
| **Status** | Sim | Ativo ou Inativo |

## Passo a passo

1. Acesse **Cadastros Básicos → Grupos de Equipamentos**
2. Clique em **+ Novo**
3. Informe o **Nome** do grupo
4. Vincule os **Equipamentos**
5. Clique em **Salvar**

:::tip
Organize grupos por **contrato** ou **região** para facilitar a geração de medições e relatórios segmentados por localidade.
:::

## Boas práticas

- Crie um grupo por contrato ou por área geográfica — evite grupos genéricos com muitos equipamentos misturados
- Nomeie os grupos de forma que o usuário identifique facilmente a localidade ou o contrato
- Mantenha a lista de equipamentos do grupo atualizada após instalações ou desativações

## Impacto nas medições

Grupos bem definidos permitem:
- Gerar medições contratuais por agrupamento
- Filtrar o Fluxo Diário por grupo
- Comparar OCR entre regiões diferentes

## Relacionado

- [Equipamentos](./equipamentos)
- [Contratos](../medicoes/contratos)
- [Medições](../medicoes/criar-medicao)

Grupos bem definidos permitem:
- Gerar medições contratuais por agrupamento
- Filtrar o Fluxo Diário de Veículos por grupo
- Comparar desempenho OCR entre regiões diferentes

## Relacionado

- [Equipamentos](./equipamentos)
- [Contratos](../medicoes/contratos)
- [Medições](../medicoes/criar-medicao)

## Relacionado

- [Equipamentos](./equipamentos)
- [Contratos](../medicoes/contratos)

## Uso dos grupos

- **Relatórios**: filtrar dados por grupo de equipamentos
- **Medições**: agrupar equipamentos de um mesmo contrato
- **Monitoramento**: visualizar status por grupo

:::info
Grupos bem definidos reduzem o tempo de criação de medições contratuais e facilitam a análise de desempenho por região ou contratante.
:::
| **Código** | Identificador único |
| **Nome** | Nome do grupos de Equipamentos |
| **Ativo** | Status do registro |

### Passo a passo — Cadastrar

1. Acesse **Cadastros Básicos** → **Grupos de Equipamentos
2. Clique em **+ Novo**
3. Preencha os campos obrigatórios
4. Clique em **Salvar**

:::tip Dependência
Este cadastro é utilizado como referência em outros módulos do sistema.
:::
