---
sidebar_position: 1
title: Usuários
description: Gestão de usuários e contas de acesso no AxTon
---

# Usuários

![Tela de Usuários](../img/axton-usuarios.png)

O módulo de usuários gerencia as contas de acesso ao AxTon, permitindo cadastrar operadores, definir credenciais de login e vincular perfis de acesso.

## Como acessar

**Menu lateral** → **Usuários**

## Listagem

### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Nome** | Nome completo do usuário |
| **Usuário** | Login utilizado no acesso ao sistema |
| **E-mail** | Endereço de e-mail do usuário |
| **Celular** | Número de telefone |
| **Código** | Código do usuário no sistema |
| **Ações** | Editar e Excluir |

### Usuários cadastrados no sistema

| Nome | Usuário | E-mail | Código |
|------|---------|--------|--------|
| **admin** | admin | — | — |
| **Operador** | operador | santiago@axion.com.br | — |

## Cadastro

### Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome completo do usuário |
| **Usuário** | Sim | Login de acesso ao sistema |
| **E-mail** | Não | E-mail para notificações |
| **Celular** | Não | Telefone de contato |
| **Código** | Não | Código funcional do operador |
| **Senha** | Sim | Senha de acesso (mínimo 8 caracteres) |

### Passo a passo — Cadastrar usuário

1. No menu lateral, clique em **Usuários**
2. Clique em **+ Novo**
3. Preencha o **Nome** e o **Usuário** (login)
4. Informe o **E-mail** e o **Celular** (opcional)
5. Defina uma **Senha** segura
6. Clique em **Salvar**

:::warning Segurança
Use senhas fortes com letras maiúsculas, minúsculas, números e caracteres especiais. Não compartilhe credenciais entre operadores.
:::

## Veja também

| Funcionalidade | Descrição |
|---|---|
| [**Perfis de Acesso**](../administracao/perfis-acesso) | Definir níveis de acesso |
| [**Permissões**](../administracao/permissoes) | Controle granular de permissões |

### Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome completo do usuário |
| **Nome de Usuário** | Sim | Identificador de login, sem espaços ou caracteres especiais |
| **E-mail** | Sim | Endereço de e-mail para comunicações e recuperação de senha |
| **Senha** | Sim | Senha de acesso ao sistema |
| **Confirmar Senha** | Sim | Repetição da senha para confirmação |
| **Perfil de Acesso** | Sim | Perfil que define as permissões do usuário no sistema |
| **Ativo** | Sim | Define se a conta estará habilitada para login |

### Passo a passo — Cadastrar usuário

1. Na listagem, clique em **+ Novo**
2. Preencha o **Nome** completo do usuário
3. Informe o **Nome de Usuário** para login
4. Informe o **E-mail** do usuário
5. Defina e confirme a **Senha**
6. Selecione o **Perfil de Acesso** correspondente
7. Confirme que o campo **Ativo** está marcado
8. Clique em **Salvar**

## Configuração de acesso

Após o cadastro, é possível configurar detalhes adicionais de acesso ao usuário, como restrições de horário, locais permitidos e outras parametrizações vinculadas ao perfil.

![Tela de Configuração de Acesso](../img/configurar-usuario-acesso.png)

:::warning Segurança de senha
As senhas devem ser informadas diretamente ao usuário de forma segura. O sistema não exibe a senha após o cadastro. Em caso de esquecimento, utilize a função de **recuperação de senha** disponível na tela de login.
:::

:::tip Desativação de usuários
Para revogar o acesso de um usuário sem excluir seu histórico de operações, desmarque o campo **Ativo** no cadastro. O usuário não conseguirá realizar login, mas seus registros serão preservados.
:::
