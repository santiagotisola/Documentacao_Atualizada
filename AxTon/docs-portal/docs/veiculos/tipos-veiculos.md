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

## Tipos mais comuns na pesagem veicular

| Tipo | Eixos típicos | Situação mais comum |
|------|:------------:|---------------------|
| Caminhão simples (toco) | 2 | Carga leve/média |
| Caminhão truck | 3 | Carga média/pesada |
| Bi-truck | 4 | Carga pesada regional |
| Bitrem | 5-6 | Grãos, combustível |
| Rodotrem | 9 | Longas distâncias, carga pesada |

:::tip
Os tipos de veículos devem ser atualizados sempre que o CONTRAN publicar novas resoluções alterando os limites de PBT.
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

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| PBT máximo incorreto gerando infrações indevidas | Valor desatualizado em relação à CONTRAN 803/2021 | Atualizar o PBT conforme a resolução vigente |
| Tipo de veículo não aparece na pesagem | Tipo inativo no cadastro | Reativar o tipo ou cadastrar conforme a classificação correta |
| Inconsistência retroativa nos boletins | PBT alterado após infrações exportadas | Não alterar PBT de tipos já utilizados — criar nova classificação |

## Perguntas frequentes

**Quando devo atualizar os tipos de veículos cadastrados no sistema?**
Sempre que o CONTRAN publicar novas resoluções alterando os limites de PBT ou o número de eixos por categoria. Acompanhe as publicações do SENATRAN e acione o suporte técnico para orientar a atualização sem comprometer infrações já exportadas.

**Posso alterar o PBT máximo de um tipo de veículo que já foi utilizado em infrações exportadas?**
Não. Alterar o PBT máximo retroativamente gera inconsistências nos boletins de medição e nas infrações já enviadas ao órgão autuador. Crie um novo tipo com o PBT atualizado e inative o anterior.

**O que fazer quando um veículo com configuração de eixos incomum não corresponde a nenhum tipo cadastrado?**
Cadastre um novo tipo em **Veículos → Tipos de Veículos → + Novo** com o número de eixos e PBT máximo correspondente, seguindo a tabela CONTRAN 803/2021. Em caso de dúvida sobre o enquadramento legal, consulte o órgão contratante antes de criar o registro.
