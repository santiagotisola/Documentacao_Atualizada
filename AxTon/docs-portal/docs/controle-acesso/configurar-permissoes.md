---
sidebar_position: 3
title: Permissões Detalhadas
description: Configuração de permissões granulares por módulo no AxTon
---

# Permissões Detalhadas

Cada perfil de acesso pode ter **permissões específicas** por módulo: Visualizar, Criar, Editar e Excluir.

![Permissões de Acesso](../img/Permissoes%20de%20acesso.png)

## Como acessar

**Menu lateral** → Controle de Acesso → **Permissões de Acesso**

## Módulos com permissões configuráveis

| Módulo | Visualizar | Criar | Editar | Excluir |
|--------|:---------:|:-----:|:------:|:-------:|
| Pesagem | ✔ | ✔ | ✔ | ✔ |
| Infrações | ✔ | - | ✔ | ✔ |
| Triagem | ✔ | - | ✔ | - |
| Medições | ✔ | ✔ | ✔ | ✔ |
| Relatórios | ✔ | - | - | - |
| Configurações | ✔ | ✔ | ✔ | ✔ |

## Passo a passo

1. Acesse **Controle de Acesso → Permissões de Acesso**
2. Selecione o **Perfil de Acesso**
3. Marque ou desmarque as permissões por módulo
4. Clique em **Salvar**

:::warning
Alterações de permissão entram em vigor imediatamente. Usuários com sessão ativa podem precisar fazer logout e login novamente.
:::

## Princípio do mínimo privilégio

Configure cada perfil com apenas as permissões estritamente necessárias. Evite conceder **Criar/Editar/Excluir** para módulos que o perfil apenas consulta.

## Segurança

- Aplique o princípio do **menor privilégio**: conceda apenas as permissões que o perfil usa no dia a dia
- Separe perfis de **consulta** e perfis de **edição** — nunca combine as duas responsabilidades no mesmo usuário operacional
- Revise as permissões a cada mudança de função do colaborador; permissões obsoletas são riscos de segurança
- Utilize os **Logs de Acesso** periodicamente para verificar se usuários estão acessando áreas além do esperado

## Relacionado

- [Perfis de Acesso](./perfis-acesso)
- [Usuários](./usuarios)
- [Logs de Acesso](./logs-acesso)

## Exemplos de configuração por perfil

| Perfil | Módulos | Criar/Editar | Excluir |
|--------|---------|:------------:|:-------:|
| **Operador de Pesagem** | Pesagem, Triagem | Sim | Não |
| **Auditor** | Medições, Relatórios | Não | Não |
| **Supervisor** | Todos exceto Configurações | Sim | Não |
| **Administrador** | Todos | Sim | Sim |

## Fluxo de configuração de permissões

1. Criar ou selecionar o **Perfil de Acesso** em Controle de Acesso → Perfis
2. Acessar **Controle de Acesso → Permissões de Acesso**
3. Selecionar o perfil no filtro superior
4. Marcar/desmarcar permissões por módulo (Visualizar, Criar, Editar, Excluir)
5. Clicar em **Salvar**
6. Testar acessando com um usuário do perfil para validar

## Erros comuns

| Situação | Causa | Solução |
|----------|-------|----------|
| Usuário não vê módulo | Falta permissão de Visualizar | Marcar `Visualizar` no módulo |
| Não consegue salvar | Falta permissão de Criar/Editar | Marcar `Criar/Editar` no módulo |
| Alteração não reflete | Cache de sessão ativo | Pedir logout e login ao usuário |

## Perguntas frequentes

**As permissões são aplicadas imediatamente após salvar?**
Sim. As alterações têm efeito imediato. Usuários com sessão ativa podem precisar fazer logout e login para que as novas permissões sejam carregadas.

**Posso dar permissão de Excluir sem dar permissão de Criar?**
Sim. As permissões são independentes por ação. Configurações incomuns como essa devem ser revisadas periodicamente para garantir coerência com a função do usuário.

**Como verificar se as permissões de um perfil estão corretas?**
Crie um usuário de teste vinculado ao perfil e acesse o sistema para validar quais funcionalidades ficam visíveis e quais estão bloqueadas.


## Relacionado

- [Perfis de Acesso](./perfis-acesso)
- [Usuários](./usuarios)



### Matriz de Permissões

| Módulo | Visualizar | Criar | Editar | Excluir |
|--------|:----------:|:-----:|:------:|:-------:|
| Pesagem | ☐ | ☐ | ☐ | ☐ |
| Infrações | ☐ | ☐ | ☐ | ☐ |
| Operações | ☐ | ☐ | ☐ | ☐ |
| Relatórios | ☐ | ☐ | ☐ | ☐ |
| Cadastros | ☐ | ☐ | ☐ | ☐ |
| Administração | ☐ | ☐ | ☐ | ☐ |

### Passo a passo

1. No menu lateral, abra **Administração** e clique em **Permissões de acesso**
2. Selecione o **Perfil de Acesso**
3. Para cada módulo, marque as permissões desejadas
4. Clique em **Salvar**

:::tip Boas práticas
- **Operadores de triagem**: Visualizar + Criar em Infrações
- **Supervisores**: Todas as permissões em Infrações + Relatórios
- **Administradores**: Acesso total
:::

## Integração com outros módulos

| Módulo | Como se relaciona com Permissões |
|--------|----------------------------------|
| **Perfis de Acesso** | As permissões são configuradas por perfil — cada perfil tem sua própria matriz de controle de acesso |
| **Usuários** | As permissões do perfil vinculado ao usuário determinam o que ele pode ver e fazer no sistema |
| **Logs de Acesso** | Acessos negados por falta de permissão são registrados e rastreavies nos logs |
| **Login** | O menu exibido após o login é gerado dinamicamente com base nas permissões de visualização do perfil |
