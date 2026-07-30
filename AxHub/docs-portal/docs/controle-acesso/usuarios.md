---
sidebar_position: 1
title: Usuários
description: Cadastro e gestão de usuários do sistema AxHub
---

# Usuários

Cadastro e gestão dos **usuários** que terão acesso ao sistema AxHub. Cada usuário deve ter um **Perfil de Acesso** atribuído que define suas permissões.

![Lista de Usuários](../img/Controle%20de%20acessos%20-%20usuario.png)

## Como acessar

**Menu lateral** → Controle de Acesso → **Usuários**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome completo |
| **Login** | Sim | Nome de usuário para acesso |
| **E-mail** | Sim | E-mail para recuperação de senha |
| **Senha** | Sim | Senha inicial (mín. 6 caracteres) |
| **Perfil de Acesso** | Sim | Define as permissões |
| **Status** | Sim | Ativo ou Inativo |

## Cadastro

![Cadastro de Usuário](../img/Controle%20de%20acessos%20-%20usuario%20-%20cadastro.png)

1. Acesse **Controle de Acesso → Usuários**
2. Clique em **+ Novo Usuário**
3. Preencha **Nome**, **Login** e **E-mail**
4. Defina a **Senha** inicial
5. Selecione o **Perfil de Acesso**
6. Clique em **Salvar**

:::tip Fluxo correto
Crie o [Perfil de Acesso](./perfis-acesso) ANTES do usuário. Configure as [Permissões](./permissoes) do perfil antes de vincular usuários.
:::

## Boas práticas de segurança

- Um usuário por pessoa — nunca compartilhe contas
- Desativar imediatamente ao desligar um colaborador
- Redefinir senha após longo período de ausência
- Vincular ao perfil com mínimo de permissões necessárias

## Relacionado

- [Perfis de Acesso](./perfis-acesso)
- [Permissões](./permissoes)
- [Logs de Acesso](./logs-acesso)

:::warning Inativar vs. excluir
Nunca exclua usuários com histórico no sistema. Prefira **inativar** para preservar a rastreabilidade das ações.
:::


| Campo | Descrição |
|-------|-----------|
| **Nome** | Nome completo do Usuário |
| Login | Nome de acesso ao sistema |
| **E-mail** | E-mail para recuperação de senha e notificações |
| **Perfil de Acesso** | Perfil de permissões atribuído ao Usuário |
| **Ativo** | Define se o Usuário pode acessar o sistema |

:::info Segurança
Recomenda-se revisar periodicamente os Usuários cadastrados e desativar contas que não estejam mais em uso.
:::

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Perfis de Acesso](./perfis-acesso) | Perfil do Usuário |
| Relacionado | [Permissoes](./permissoes) | Permissoes atribuidas |
| Relacionado | [Logs de Acesso](./logs-acesso) | histórico do Usuário |
| Relacionado | [Acessos por IP](./acessos-por-ip) | Restricoes de IP |
