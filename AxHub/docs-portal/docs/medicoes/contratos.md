---
sidebar_position: 1
title: Contratos
description: Cadastro e gestão de contratos de medição no AxHub
---

# Contratos

Cadastro e gestão dos **contratos de prestação de serviço** vinculados às operações de fiscalização. Base para o cálculo mensal das medições e SLAs.

![Lista de Contratos](../img/Medição%20-%20contrato.png)

## Como acessar

**Menu lateral** → Medição → **Contratos**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Número** | Sim | Número do contrato |
| **Contratante** | Sim | Órgão ou empresa contratante |
| **Vigência Início** | Sim | Data de início |
| **Vigência Fim** | Sim | Data de encerramento |
| **Equipamentos** | Sim | Equipamentos cobertos |
| **Metas** | Sim | Índices de performance contratados |
| **Status** | Sim | Ativo, Encerrado ou Suspenso |

## Cadastro

![Cadastro de Contrato](../img/Medição%20-%20contrato%20-%20cadastro.png)

1. Acesse **Medição → Contratos**
2. Clique em **+ Novo**
3. Preencha todos os campos obrigatórios
4. Vincule os equipamentos ao contrato
5. Defina as metas de SLA
6. Clique em **Salvar**

## Navegação Relacionada

- [Criar Medição](./criar-medicao)
- [Índices de Performance](./indices-performance)
- [Recursos](./recursos)

:::tip
Configure as metas de SLA diretamente no contrato. O sistema calculará automaticamente a conformidade ao gerar as medições mensais.
:::
| Tipo | Página |
|------|--------|
| Relacionado | [Medições](./criar-medicao) |
| Relacionado | [Índices de Performance](./indices-performance) |
| Relacionado | [Interrupções](./interrupcoes) |


| Campo | Descrição |
|-------|-----------|
| **Número do Contrato** | Identificador do contrato |
| **Órgão** | Órgão contratante |
| **Vigência Início** | Data de início do contrato |
| **Vigência Fim** | Data de término do contrato |
| Equipamentos | Equipamentos vinculados ao contrato |
| **Status** | Ativo, Encerrado, Suspenso |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Indices de Performance](./indices-performance) | Indicadores do contrato |
| Relacionado | [Recursos](./recursos) | Recursos alocados |
| Relacionado | [Criar Medicao](./criar-medicao) | Gerar medicao |
| Relacionado | [Interrupcoes](./interrupcoes) | Registrar interrupcoes |
| Glossario | [Medicao de Desempenho](../glossario/medicao-desempenho) | Definicao tecnica |
