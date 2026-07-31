---
sidebar_position: 1
title: Postos de Pesagem
description: Cadastro e gerenciamento de postos de pesagem
---

# Postos de Pesagem

![Tela Iniciar Pesagem](../img/inicar%20pesagem.png)

Os Postos de Pesagem representam os locais físicos onde os Veículos são pesados. Cada posto é vinculado a uma localidade e pode ter múltiplos Equipamentos de pesagem.

## Como acessar

**Menu lateral** → **Iniciar Pesagem**

![Informar a placa para iniciar pesagem](../img/iniciar%20pesagem%20-%20informar%20a%20placa%20para%20iniciar%20o%20processo%20de%20pesagem.png)

## Listagem

A tela exibe todos os postos cadastrados no sistema.

### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Código** | Identificador único do posto |
| **Nome** | Nome do posto de pesagem |
| **Localidade** | Município/UF onde o posto está localizado |
| **Status** | Ativo ou Inativo |

## Passo a passo — Cadastrar posto

1. Acesse **Cadastros Básicos → Postos de Pesagem**
2. Clique em **+ Novo**
3. Preencha o **Código**, **Nome** e **Localidade**
4. Vincule os **Equipamentos** e o **Contrato**
5. Clique em **Salvar**

:::tip
Após criar o posto, cadastre os **Equipamentos** vinculados em Cadastros Básicos → Equipamentos.
:::

## Boas práticas

- Cadastre o posto com o nome oficial do contrato para facilitar a filtragem nos relatórios e medições
- Vincule os equipamentos ao posto imediatamente após o cadastro para que pesagens sejam associadas corretamente
- Mantenha o posto com **Status Ativo** apenas enquanto estiver em operação; postos inativos devem ser inativados para não inflar os cálculos de disponibilidade
- Use a vinculação com **Grupos de Equipamentos** para facilitar a geração de medições contratuais por localidade

## Relacionado

- [Equipamentos](../cadastros-basicos/equipamentos)
- [Contratos](../medicoes/contratos)
- [Grupos de Equipamentos](../cadastros-basicos/grupos-equipamentos)

## Erros comuns

| Erro | Causa | Solução |
|------|-------|---------|
| Pesagens não ap. no posto | Contrato não vinculado | Associar contrato |
| Posto inativo cont. dados | Equipamentos ainda ativos | Inativar equipamentos |
| Relatório sem dados do posto | Filtro incorreto | Verificar seleção de posto |

| Erro | Causa | Solução |
|------|-------|---------|
| Pesagens não ap. no posto | Contrato não vinculado | Associar contrato ao posto |
| Posto inativo cont. dados | Equipamentos ativos | Inativar todos os equipamentos |


- Pesquisa por nome ou código
- Filtro por status (Ativo/Inativo)

## Cadastro

### Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome identificador do posto |
| **Localidade** | Sim | Município e UF do posto |
| **Endereço** | Não | Endereço completo |
| **Status** | Sim | Ativo ou Inativo |

### Passo a passo — Cadastrar Posto

1. No menu lateral, clique em **Iniciar Pesagem**
2. Clique em **+ Novo**
3. Preencha o Nome do posto
4. Selecione a Localidade
5. Informe o Endereço (opcional)
6. Marque como Ativo
7. Clique em **Salvar**

:::tip Dica
Mantenha os nomes dos postos padronizados para facilitar a identificação nos Relatórios
:::
