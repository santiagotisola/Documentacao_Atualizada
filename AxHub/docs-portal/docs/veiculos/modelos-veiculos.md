---
sidebar_position: 7
title: Modelos de Veículos
description: Cadastro de modelos de veículos por marca para classificação no AxHub
---

# Modelos de Veículos

Cadastro dos **modelos de veículos vinculados às marcas**. O modelo correto garante precisão na identificação do veículo nos registros de infração.

![Lista de Modelos](../img/Veículos%20-%20marcas-modelos%20de%20veiculos.png)

## Como acessar

**Menu lateral** → Veículos → **Modelos de Veículos**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome do modelo (ex.: Gol, Uno, Strada) |
| **Marca** | Sim | Marca vinculada |
| **Status** | Sim | Ativo ou Inativo |

## Passo a passo

1. Acesse **Veículos → Modelos de Veículos**
2. Clique em **+ Novo**
3. Preencha o **Nome** e selecione a **Marca**
4. Clique em **Salvar**

:::tip
Use a barra de busca para localizar um modelo existente antes de cadastrar um novo. Evita duplicidades na base de classificação.
:::

## Relacionado

- [Marcas de Veículos](./marcas-veiculos)
- [Classificações de Veículos](./classificacoes-veiculos)

## Modelos comuns por segmento

| Marca | Modelos comuns |
|-------|----------------|
| FIAT | Uno, Strada, Toro |
| VOLKSWAGEN | Gol, Amarok, Delivery |
| FORD | Ka, Ranger, Cargo |

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Modelo duplicado | Cadastrado 2x | Inativar duplicata |
| Modelo sem marca | Criação sem vínculo | Selecionar marca corretamente |
| Modelo desatualizado | Versão antiga no banco | Inativar e cadastrar versão atual |

## Relacionado

- [Marcas de Veículos](./marcas-veiculos)
- [Classificações de Veículos](./classificacoes-veiculos)
- [Tipos de Veículos](./tipos-veiculos)


1. Acesse **Veículos → Modelos de Veículos**
2. Clique em **+ Novo**
3. Informe o **Nome** e selecione a **Marca**
4. Clique em **Salvar**

## Hierarquia

```
Marca (ex.: FIAT)
  └── Modelo (ex.: Strada)
        └── Veículo identificado na infração
```


## Cadastro

![Cadastro de Modelo](../img/Veículos%20-%20marcas-modelos%20de%20veiculos%20-%20cadastro.png)

| Campo | Descrição |
|-------|-----------|
| **Marca** | Marca vinculada |
| **Código** | Código do modelo |
| **Descrição** | Nome do modelo (ex: Gol, Uno, Corolla) |
| **Ativo** | Status do registro |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Marcas de Veiculos](./marcas-veiculos) | Marca do modelo |

## Boas práticas

- Antes de cadastrar, pesquise se o modelo já existe vinculado à marca — duplicidades geram ambiguidade na identificação
- Vincule sempre o modelo à **Marca** correta do fabricante; um modelo sem marca impede a correta classificação do veículo
- Modelos já associados a infrações exportadas não devem ser renomeados — pode causar inconsistência nos registros históricos
- Para veículos de fabricantes internacionais pouco comuns, use a descrição oficial do RENAVAM para manter padronização
