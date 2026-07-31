---
sidebar_position: 3
title: Modelos de Veículos
description: Cadastro de modelos de Veículos
---

# Modelos de Veículos

![Classificação — Novo](../img/Classificacao%20-%20novo.png)

Cadastro de modelos de Veículos Estes dados são utilizados automaticamente nas operações de pesagem e triagem de Infrações

## Como acessar

**Menu lateral** → Veículos → **Modelos de Veículos

## Listagem

A tela exibe todos os registros cadastrados, com opção de pesquisa e filtro.

### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Nome** | Nome do modelo |
| **Marca** | Fabricante do veículo |
| **Status** | Ativo ou Inativo |

## Passo a passo

1. Acesse **Veículos → Modelos de Veículos**
2. Clique em **+ Novo**
3. Preencha o **Nome** e selecione a **Marca**
4. Clique em **Salvar**

:::tip
Verifique se o modelo já existe antes de criar. Duplicidades dificultam a classificação nos tickets de pesagem.
:::

## Modelos mais comuns por marca

| Marca | Modelos comuns |
|-------|----------------|
| MERCEDES-BENZ | Actros, Atego, Axor |
| SCANIA | R-Series, G-Series, P-Series |
| VOLVO | FH, FM, FMX |
| IVECO | Daily, Eurocargo, Stralis |

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Modelo duplicado | Cadastrado 2x | Inativar duplicata |
| Modelo sem marca | Criação sem vínculo | Corrigir no cadastro |
| Ticket sem modelo | Identificação falhou | Verificar base e OCR |

## Relacionado

- [Marcas de Veículos](./marcas-veiculos)
- [Classificações de Veículos](./classificacoes-veiculos)
- [Tipos de Veículos](./tipos-veiculos)

## Modelos comuns de veículos de carga

| Marca | Modelo |
|-------|--------|
| MERCEDES-BENZ | Actros, Atego, Axor |
| SCANIA | R-Series, G-Series, P-Series |
| VOLVO | FH, FM, FMX |
| IVECO | Daily, Eurocargo, Stralis |


1. Acesse **Veículos → Modelos de Veículos**
2. Clique em **+ Novo**
3. Preencha o **Nome** e selecione a **Marca**
4. Clique em **Salvar**


| Coluna | Descrição |
|--------|-----------|
| **Código** | Identificador único |
| **Descrição** | Nome/descrição do registro |
| **Ativo** | Status (Ativo/Inativo) |

### Passo a passo — Cadastrar

1. Acesse Veículos → **Modelos de Veículos
2. Clique em **+ Novo**
3. Preencha o Código e a Descrição
5. Clique em **Salvar**

## Boas práticas

- Pesquise o modelo existente antes de criar — duplicidades geram ambiguidade na classificação dos tickets de pesagem
- Vincule o modelo à **Marca** correta; modelos sem marca ficam inacessíveis nos filtros de relatório
- Para veículos de carga pesada, use a nomenclatura oficial do fabricante (ex.: Actros, Stralis, FH) para compatibilidade com o RENAVAM
- Não exclua modelos já vinculados a infrações — inative-os para preservar o histórico das operações