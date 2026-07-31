---
sidebar_position: 6
title: Municípios
description: Cadastro de municípios com código IBGE no AxTon
---

# Municípios

Cadastro dos **municípios** com código IBGE, utilizados na localização dos postos de pesagem e nas infrações exportadas.

## Como acessar

**Menu lateral** → Veículos → **Municípios**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome do município |
| **Código IBGE** | Sim | Código de 7 dígitos |
| **UF** | Sim | Estado |
| **Status** | Sim | Ativo ou Inativo |

## Passo a passo

1. Acesse **Veículos → Municípios**
2. Clique em **+ Novo**
3. Informe o **Nome**, **Código IBGE** e **UF**
4. Clique em **Salvar**

:::tip
O Código IBGE de 7 dígitos é obrigatório nos arquivos de exportação de infrações ao DENATRAN/SENATRAN. Consulte o portal do IBGE para o código correto.
:::

## Relacionado

- [Postos de Pesagem](../pesagem/postos)
- [Relatório de Infrações](../relatorios/relatorio-infracoes)

## Municípios mais comuns

O sistema já vem com uma base pré-carregada dos municípios brasileiros com códigos IBGE. Adicione entradas personalizadas apenas para subdivisões não listadas.

## Impacto na exportação

:::warning
Código IBGE incorreto causa rejeição do lote de exportação. Sempre use o código de 7 dígitos oficial. Verifique no portal do IBGE antes de cadastrar.
:::

:::info
A base de municípios é utilizada automaticamente na localização dos postos de pesagem nos boletins de medição e nos arquivos de exportação de infrações.
:::

A tela exibe todos os registros cadastrados, com opção de pesquisa e filtro.

### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Código** | Identificador único |
| **Descrição** | Nome/descrição do registro |
| **Ativo** | Status (Ativo/Inativo) |

### Passo a passo — Cadastrar

1. Acesse Veículos → **Municípios**
2. Clique em **+ Novo**
3. Preencha o Código e a Descrição
4. Marque como Ativo
5. Clique em **Salvar**
## Boas práticas

- Utilize o código IBGE de **7 dígitos** — o código com 6 dígitos causa rejeição nos arquivos SENATRAN
- A base pré-carregada cobre todos os municípios brasileiros; adicione entradas apenas para localidades não reconhecidas pelo IBGE
- O município do posto de pesagem é inserido automaticamente no boletim de medição — garanta que esteja cadastrado corretamente antes de gerar a primeira medição

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Lote rejeitado por código IBGE inválido | Código com 6 dígitos ao invés de 7 | Verificar e corrigir pelo portal oficial do IBGE |
| Município não encontrado na busca | Nome cadastrado diferente do oficial | Padronizar conforme o portal do IBGE |
| Boletim de medição sem município | Posto de pesagem sem município vinculado | Verificar o cadastro do posto e vincular o município correto |
- Consulte ibge.gov.br/cidades para confirmar o código oficial antes de cadastrar

## Relacionado

- [Postos de Pesagem](../pesagem/postos)
- [Contratos](../medicoes/contratos)
- [Relatório de Infrações](../relatorios/relatorio-infracoes)