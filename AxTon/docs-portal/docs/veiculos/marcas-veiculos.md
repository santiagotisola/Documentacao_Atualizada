---
sidebar_position: 2
title: Marcas de Veículos
description: Cadastro de marcas de veículos para classificação nas operações do AxTon
---

# Marcas de Veículos

Cadastro de **marcas e fabricantes** de veículos utilizados na identificação e classificação nas operações de pesagem e triagem de infrações.

## Como acessar

**Menu lateral** → Veículos → **Marcas de Veículos**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome da marca (ex.: MERCEDES-BENZ, SCANIA, VOLVO) |
| **Código DENATRAN** | Não | Código oficial do fabricante |
| **Status** | Sim | Ativo ou Inativo |

## Passo a passo

1. Acesse **Veículos → Marcas de Veículos**
2. Clique em **+ Nova**
3. Informe o **Nome** e o **Código DENATRAN** (se aplicável)
4. Clique em **Salvar**

:::info
As marcas são vinculadas aos **Modelos de Veículos**, formando a hierarquia Marca → Modelo → Classificação usada nos tickets de pesagem.
:::

## Marcas comuns no transporte de carga

| Marca | Segmento | Origem |
|-------|----------|--------|
| MERCEDES-BENZ | Caminhões e ônibus | Alemã |
| SCANIA | Caminhões pesados | Sueca |
| VOLVO | Caminhões e ônibus | Sueca |
| IVECO | Caminhões leves e médios | Italiana |
| DAF | Caminhões pesados | Holandesa |

## Relacionado

- [Modelos de Veículos](./modelos-veiculos)
- [Classificações de Veículos](./classificacoes-veiculos)
- [Tipos de Veículos](./tipos-veiculos)


| Marca | Segmento |
|-------|----------|
| MERCEDES-BENZ | Caminhões e ônibus |
| SCANIA | Caminhões pesados |
| VOLVO | Caminhões e ônibus |
| IVECO | Caminhões leves e médios |
| DAF | Caminhões pesados |
## Passo a passo

1. Acesse **Veículos → Marcas de Veículos**
2. Clique em **+ Novo**
3. Informe o **Nome** da marca
4. Clique em **Salvar**

## Boas práticas

- Use a grafia oficial do fabricante (ex.: MERCEDES-BENZ, SCANIA, VOLVO) para garantir compatibilidade com o RENAVAM e os arquivos SENATRAN
- Antes de criar, pesquise se a marca já existe com nome alternativo — duplicidades prejudicam a classificação nos tickets de pesagem
- O **Código DENATRAN** pode ser exigido em alguns layouts de exportação; confirme com o órgão autuador
- Mantenha marcas descontinuadas como **Inativas** para preservar o histórico de autos emitidos

```
Marca de Veículo → Modelo → Veículo identificado na pesagem
```


### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Código** | Identificador único |
| **Descrição** | Nome/descrição do registro |
| **Ativo** | Status (Ativo/Inativo) |

### Passo a passo — Cadastrar

1. Acesse Veículos → **Marcas de Veículos
2. Clique em **+ Novo**
3. Preencha o Código e a Descrição
4. Marque como Ativo
5. Clique em **Salvar**
