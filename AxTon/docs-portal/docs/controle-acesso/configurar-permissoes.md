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
