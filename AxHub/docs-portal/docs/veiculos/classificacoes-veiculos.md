---
sidebar_position: 4
title: Classificações de Veículos
description: Classificações de veículos para enquadramento nas infrações do AxHub
---

# Classificações de Veículos

Subdivide as categorias de veículos em **classificações mais específicas** para fins de enquadramento preciso nas infrações.

![Lista de Classificações](../img/Veículos%20-%20Classificações%20dos%20Veiculos.png)

## Como acessar

**Menu lateral** → Veículos → **Classificações de Veículos**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Código** | Sim | Código da classificação |
| **Descrição** | Sim | Nome da classificação |
| **Categoria** | Sim | Categoria pai |
| **Status** | Sim | Ativo ou Inativo |

## Passo a passo

1. Acesse **Veículos → Classificações de Veículos**
2. Clique em **+ Nova**
3. Preencha o **Código**, **Descrição** e selecione a **Categoria** pai
4. Clique em **Salvar**

:::info Hierarquia
Categoria → Classificação → Veículo. A classificação é o nível mais específico, usada no enquadramento da infração.
:::

## Exemplos de classificação

| Categoria | Classificação |
|-----------|----------------|
| Moto | Motocicleta, Ciclomotor, Motoneta |
| Caminhão | Toco, Truck, Bi-truck |
| Passeio | Automóvel, Caminhoneta, Camponã |

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Enquadramento errado | Classificação incorreta | Verificar CTB e corrigir |
| Classificação sem categoria | Vínculo ausente | Associar categoria pai |
| Veículo com classificação obsoleta | Resolução desatualizada | Atualizar conforme CTB vigente |

## Relacionado

- [Tipos de Veículos](./tipos-veiculos)
- [Categorias de Veículos](./categorias-veiculo)
- [Enquadramento](../glossario/enquadramento)

| Carro | Sedan, Hatch, SUV, Pickup |
| Caminhão | Toco, Truck, Carreta |

## Passo a passo

1. Acesse **Veículos → Classificações**
2. Clique em **+ Novo**
3. Informe o **Código**, **Descrição** e **Categoria**
4. Clique em **Salvar**

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Classificação sem categoria pai | Criada sem selecionar a categoria | Editar e vincular a categoria correta |
| Enquadramento errado por classificação | Veículo enquadrado na classificação equivocada | Revisar no cadastro do veículo e reconsiderar a infração |
| Classificação duplicada | Criada mais de uma vez com nomes similares | Inativar a duplicata e reclassificar os veículos vinculados |


![Cadastro de Classificação](../img/Veículos%20-%20Classificações%20dos%20Veiculos%20-%20cadastros.png)

| Campo | Descrição |
|-------|-----------|
| **Código** | Código identificador |
| **Descrição** | Nome da classificação |
| **Tipo de Veículo | Tipo vinculado |
| **Ativo** | Status do registro |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Categorias](./categorias-veiculo) | Categorias vinculadas |
| Relacionado | [Tipos de Veiculos](./tipos-veiculos) | Tipos |

## Boas práticas

- Mantenha a hierarquia Categoria → Classificação coerente com a tabela DENATRAN para evitar enquadramentos inválidos
- Antes de criar uma nova classificação, pesquise se já existe com nome diferente — duplicidades prejudicam os relatórios
- Classificações vinculadas a infrações exportadas não devem ser renomeadas ou excluídas
- Revise periodicamente as classificações à luz das resoluções CONTRAN para garantir conformidade legal
