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
