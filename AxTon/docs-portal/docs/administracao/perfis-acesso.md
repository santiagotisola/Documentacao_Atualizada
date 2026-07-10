---
sidebar_position: 2
title: Perfis de Acesso
description: Gestão de perfis de acesso do sistema AxTon
---

# Perfis de Acesso

O módulo de perfis de acesso define os conjuntos de permissões que serão atribuídos aos Usuários do sistema. Cada perfil agrupa as funcionalidades às quais os Usuários vinculados a ele terão acesso.

## Como acessar

**Menu lateral** → **Perfis de Acesso**

## Listagem

![Tela de Perfis de Acesso](../img/axton-perfis-acesso.png)

### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Nome** | Nome do perfil de acesso |
| **Ações** | Editar e Excluir |

### Perfis cadastrados no sistema

| Perfil | Descrição de uso |
|--------|-----------------|
| **Porteiro** | Operador de cancela com acesso limitado à pesagem |

### Ações disponíveis

| Ação | Descrição |
|------|-----------|
| **+ Novo** | Cadastrar um novo perfil de acesso |
| **Editar** | Alterar nome e permissões do perfil |
| **Excluir** | Remover o perfil (não permitido se houver Usuários vinculados) |

## Cadastro

![Tela de Perfis de Acesso — Cadastro](../img/perfil-acesso-cadastro.png)

### Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Código** | Sim | Código único de identificação do perfil |
| **Descrição** | Sim | Nome descritivo do perfil (ex.: Administrador, Operador, Auditor) |
| **Ativo** | Sim | Define se o perfil estará disponível para atribuição a Usuários |

### Passo a passo — Cadastrar perfil de acesso

1. Na listagem, clique em **+ Novo**
2. Informe o **Código** e a **Descrição** do perfil
3. Confirme que o campo **Ativo** está marcado
4. Clique em **Salvar**
5. Após salvar, acesse o módulo de **Permissões de Acesso** para configurar as permissões vinculadas ao perfil

:::tip Boas práticas
Crie perfis com nomes descritivos que reflitam o cargo ou função dos Usuários que serão atribuídos a eles. Evite criar um perfil único com acesso total para todos os Usuários pois isso dificulta a rastreabilidade das operações realizadas no sistema.
:::

:::warning Exclusão de perfis
Um perfil de acesso somente poderá ser excluído se não houver Usuários vinculados a ele. Para desabilitar um perfil sem excluí-lo, utilize o campo **Ativo**.
:::
