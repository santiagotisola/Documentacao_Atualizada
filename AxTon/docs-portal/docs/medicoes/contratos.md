---
sidebar_position: 1
title: Contratos
description: Cadastro de contratos de prestação de serviço
---

# Contratos

Relatório de Pesagem](../img/Relatorio%20de%20pesagem.png)

Registro dos contratos de prestação de serviço de pesagem, vinculando postos, períodos e metas de performance.

## Como acessar

**Menu lateral** → Medições → **Contratos**

## Listagem

### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Número** | Número do contrato |
| **Contratante** | Órgão ou empresa contratante |
| **Vigência Início** | Data de início |
| **Vigência Fim** | Data de encerramento |
| **Postos** | Postos de pesagem cobertos |
| **Status** | Ativo, Vencido, Suspenso |

## Campos de cadastro

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Número** | Sim | Número do contrato |
| **Contratante** | Sim | Nome da organização contratante |
| **Vigência Início** | Sim | Data de início da vigência |
| **Vigência Fim** | Sim | Data de encerramento |
| **Postos** | Sim | Postos cobertos pelo contrato |
| **Meta Disponibilidade** | Não | % mínimo de disponibilidade exigido |
| **Meta OCR** | Não | % mínimo de aproveitamento OCR |

## Passo a passo

1. Acesse **Medições → Contratos**
2. Clique em **+ Novo**
3. Preencha o **Número**, **Contratante** e **Vigência**
4. Selecione os **Postos** cobertos
5. Defina as metas de **Disponibilidade** e **OCR**
6. Clique em **Salvar**

:::tip
Contrato com metas bem configuradas garante que o sistema calcule automaticamente os índices ao gerar medições mensais.
:::

## Relacionado

- [Grupos de Equipamentos](./grupos-equipamentos)
- [Criar Medição](./criar-medicao)
- [Índices de Performance](./indices-performance)


| **Nº Contrato** | Número do contrato |
| **Contratante** | Órgão contratante |
| **Vigência** | Período de validade |
| **Postos** | Postos vinculados |
| **Status** | Ativo, Encerrado, Suspenso |

### Passo a passo — Cadastrar Contrato

1. Acesse **Medições** → **Contratos**
2. Clique em **+ Novo**
3. Informe o Número do contrato
4. Selecione o Contratante
5. Defina o período de Vigência
6. Vincule os Postos de pesagem
7. Clique em **Salvar**

---

## Funcionalidades de Medições

| Funcionalidade | Descrição |
|---|---|
| [**Índices de Performance**](../medicoes/indices-performance) | Indicadores de desempenho contratual |
| [**Interrupções**](../medicoes/interrupcoes) | Registro de interrupções operacionais |
| [**Gerar Medição**](../medicoes/criar-medicao) | Gerar Relatório de medição contratual |
