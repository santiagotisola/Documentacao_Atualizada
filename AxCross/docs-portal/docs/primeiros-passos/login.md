---
sidebar_position: 1
title: Login
description: Como acessar o sistema AxCross
---

# Login

A tela de **Login** é o ponto de entrada do AxCross. Informe suas credenciais para acessar o sistema.

![Tela de Login do AxCross](<../img/Login.png>)

## Como acessar

Abra o navegador e acesse o endereço do AxCross fornecido pela sua organização. O sistema utiliza o **Identity Server (IS)** para autenticação segura.

## Campos

| Campo | Obrigatório | Descrição |
|---|:---:|---|
| **Usuário** | Sim | Nome de usuário cadastrado no sistema |
| **Senha** | Sim | Senha de acesso (respeitando maiúsculas e minúsculas) |

## Passo a passo

1. Acesse o endereço do AxCross no navegador
2. Informe o **Usuário** no campo correspondente
3. Informe a **Senha** de acesso
4. Clique em **ENTRAR**
5. O sistema redireciona automaticamente para o **Dashboard**

## Primeiro acesso

No primeiro acesso, utilize as credenciais temporárias fornecidas pelo administrador. Altere a senha imediatamente após o login.

:::warning Segurança
Nunca compartilhe suas credenciais. Cada ação realizada fica registrada com o seu usuário no log de auditoria.
:::

## Problemas comuns

| Problema | Solução |
|----------|---------|
| Senha incorreta | Tente novamente ou clique em **Esqueci minha senha** |
| Usuário bloqueado | Contate o administrador |
| Página não carrega | Verifique a conexão com a rede interna |

## Segurança

- Use senhas fortes com mínimo de 8 caracteres, combinando letras, números e caracteres especiais

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Login inválido após redefinição | Cache antigo | Limpar cache ou usar aba anônima |
| Conta bloqueada | Múltiplas falhas | Aguardar 30 min ou contatar admin |
| Link de redefinição expirado | Prazo ultrapassado | Solicitar novo link |

## Relacionado

- [Usuários](../administracao/usuarios)
- [Perfis de Acesso](../administracao/perfis-acesso)
- [Logs de Acesso](../administracao/logs-acesso)

- [Usuários](../administracao/usuarios)
- [Perfis de Acesso](../administracao/perfis-acesso)
- [Logs de Acesso](../administracao/logs-acesso)

| Problema | Solução |
|----------|---------|
| Senha incorreta | Tente novamente ou clique em **Esqueci minha senha** |
| Usuário bloqueado | Contate o administrador do sistema |
| Página não carrega | Verifique a conexão com a rede interna |

## Recuperação de senha

Clique em **Esqueceu a Senha?** na tela de login. O sistema enviará instruções de recuperação para o e-mail cadastrado no perfil do usuário.

:::warning Conta bloq
Após múltiplas tentativas incorretas de login, a conta poderá ser temporariamente bloq por segurança. Nesse caso, entre em contato com o administrador do sistema.
:::

:::info Primeiro acesso
No primeiro acesso, utilize as credenciais fornecidas pelo administrador e altere a senha imediatamente em **Configurações → Usuários**. Escolha uma senha forte com letras, números e símbolos.
:::