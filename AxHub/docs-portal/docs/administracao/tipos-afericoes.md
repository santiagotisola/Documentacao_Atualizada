---
sidebar_position: 14
title: Tipos de Aferições
description: Cadastro de tipos de aferições metrológicas no AxHub
---

# Tipos de Aferições

Define as **categorias de aferição metrológica** realizadas nos equipamentos de fiscalização, conforme exigêancia do INMETRO.

## Como acessar

**Menu lateral** → Configurações → **Tipos de Aferições**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Tipo da aferição (ex: "Aferição Inicial", "Aferição Periódica") |
| **Descrição** | Não | Detalhamento do procedimento |
| **Validade (dias)** | Sim | Prazo de validade em dias |

## Tipos padrão

| Tipo | Descrição | Validade Comum |
|------|-----------|:--------------:|
| Aferição Inicial | Primeira verificação antes do uso | 1 ano |
| Aferição Periódica | Renovação anual obrigatória | 1 ano |
| Aferição Pós-Manutenção | Após intervenção técnica | Até próxima periódica |

:::info
Equipamentos com aferição vencida não podem gerar infrações válidas legalmente. O sistema exibe alerta quando a data de vencimento se aproxima.
:::
|------|-----------|----------------|
| **Aferição Inicial** | Realizada na instalação do equipamento | 365 dias |
| **Aferição Periódica** | Recalibração anual obrigatória | 365 dias |
| **Aferição Extraordinária** | Após manutenção ou acidente | 365 dias |

:::caution INMETRO
Equipamento com aferição vencida não pode gerar infrações legalmente válidas. O sistema bloqueia automaticamente.
:::

|-------|-----------|
| **Código** | Código identificador |
| **Descrição** | Tipo da aferição (ex: Inicial, Periódica, Eventual) |
| **Validade (meses)** | Prazo de validade padrão |
| **Ativo** | Status do registro |

:::note Sem screenshot
está tela ainda não possui screenshot cadastrada. Será adicionada em breve.
:::

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Afericoes (Operacoes)](../operacoes/afericoes) | Uso operacional |
| Glossario | [Afericao](../glossario/afericao) | Definicao tecnica |
