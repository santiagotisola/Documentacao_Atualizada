---
sidebar_position: 1
title: Tipos de Veículos
description: Tipos de veículos fiscalizados nos postos de pesagem do AxTon
---

# Tipos de Veículos

Cadastro dos **tipos de veículos** fiscalizados nos postos de pesagem, utilizados para determinar o limite de PBT aplicável.

![Classificação de Veículos](../img/Classificacao%20de%20Veiculos.png)

## Como acessar

**Menu lateral** → Veículos → **Tipos de Veículos**

## Tipos padrão (CONTRAN 803/2021)

| Tipo | Eixos | PBT máximo |
|------|:-----:|:-----------:|
| Caminhão toco | 2 | 16 t |
| Caminhão truck | 3 | 23 t |
| Bi-truck | 4 | 29 t |
| Bi-trem | 5-6 | 41,5 - 45 t |
| Ro-do-trem | 9 | 57 t |

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Descrição do tipo |
| **Número de eixos** | Sim | Quantidade de eixos |
| **PBT máximo (t)** | Sim | Peso máximo permitido |
| **Status** | Sim | Ativo ou Inativo |

## Relacionado

- [Classificações de Veículos](./classificacoes-veiculos)
- [PBT](../glossario/pbt)

:::tip
Os tipos de veículos devem ser atualizados sempre que o CONTRAN publicar novas resoluções alterando os limites de PBT. Verifique periodicamente a portaria INMETRO e o CONTRAN 803/2021.
:::

A tela exibe todos os registros cadastrados, com opção de pesquisa e filtro.

### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Código** | Identificador único |
| **Descrição** | Nome/descrição do registro |
| **Ativo** | Status (Ativo/Inativo) |

### Passo a passo — Cadastrar

1. Acesse Veículos → **Tipos de Veículos
2. Clique em **+ Novo**
3. Preencha o Código e a Descrição
4. Marque como Ativo
5. Clique em **Salvar**

---

## Cadastros de Veículos

| Cadastro | Descrição |
|---|---|
| [**Marcas de Veículos**](../veiculos/marcas-veiculos) | Cadastro de marcas/fabricantes de Veículos |
| [**Modelos de Veículos**](../veiculos/modelos-veiculos) | Cadastro de modelos de Veículos |
| [**Cores**](../veiculos/cores) | Cadastro de cores de Veículos |
| [**Classificações de Veículos**](../veiculos/classificacoes-veiculos) | Classificações por eixo e PBT |
| [**Municípios**](../veiculos/municipios) | Cadastro de municípios (código IBGE) |

## Boas práticas

- Atualize os tipos de veículos sempre que o CONTRAN publicar novas resoluções com alterações nos limites de PBT
- Não altere o **PBT máximo** de tipos já utilizados em infrações exportadas — pode gerar inconsistência retroativa nos boletins de medição
- Mantenha a correspondência entre número de eixos e PBT conforme a tabela CONTRAN 803/2021
- Utilize a nomenclatura oficial (ex.: Caminhão Toco, Bitrem, Rodotrem) para compatibilidade com o SENATRAN
