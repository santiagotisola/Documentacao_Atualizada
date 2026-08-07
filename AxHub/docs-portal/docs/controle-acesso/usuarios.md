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

## Fluxo de gestão de usuários

1. Criar o **Perfil de Acesso** com as permissões corretas para a função
2. Acessar **Controle de Acesso → Usuários** e criar o usuário
3. Vincular o usuário ao perfil criado
4. Comunicar as credenciais de forma segura ao colaborador
5. Ao desligar o colaborador: **inativar** imediatamente o usuário (não excluir)

## Tabela de referência — boas práticas de segurança

| Situação | Ação correta |
|----------|:-------------:|
| Colaborador desligado | Inativar imediatamente |
| Esquecimento de senha | Redefinir via admin |
| Suspeita de acesso indevido | Alterar senha + verificar logs |
| Mudança de função | Mudar o perfil de acesso |
| Usuários sem acesso há 90+ dias | Inativar após confirmação |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Usuário não consegue fazer login | Conta inativa | Verificar e reativar |
| Login já existe | Login duplicado | Usar nome de usuário único |
| Permissões incorretas | Perfil errado vinculado | Alterar o perfil do usuário |

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

## Perguntas frequentes

**O que fazer quando um colaborador é desligado?**
Inative o usuário imediatamente em **Controle de Acesso → Usuários**. Não exclua — a exclusão apaga o histórico de ações do usuário que pode ser necessário em auditorias.

**Posso ter dois usuários com o mesmo login?**
Não. O campo **Login** deve ser único no sistema. Use o e-mail como padrão de login para facilitar a gestão e evitar duplicidades.

**Como redefinir a senha de um usuário?**
O administrador pode editar o cadastro do usuário e definir uma nova senha temporária. Oriente o usuário a alterá-la no primeiro acesso.

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Perfis de Acesso](./perfis-acesso)** | O perfil vinculado ao usuário define quais módulos e funcionalidades ele pode acessar no sistema |
| **[Permissões](./permissoes)** | As permissões individuais do usuário podem complementar ou restringir o que o perfil permite |
| **[Logs de Acesso](./logs-acesso)** | Todas as ações do usuário são registradas nos logs de acesso para auditoria e rastreabilidade |
| **[Acessos por IP](./acessos-por-ip)** | Regras de restrição de IP podem ser configuradas por usuário ou grupo para aumentar a segurança de acesso |

## Perfis recomendados

| Perfil | Acesso sugerido | Quando usar |
|--------|----------------|-------------|
| **Administrador** | Total — todos os módulos | Gestor responsável pelo sistema |
| **Triador** | Infrações (triagem) + Relatórios básicos | Analista de triagem diária |
| **Auditor** | Infrações (auditoria) + Consultas | Responsável pela revisão final |
| **Operador de Campo** | Operações + Monitoramento | Técnico de equipamentos |
| **Gestor** | Relatórios + Medições + Dashboard | Fiscal do contrato |
| **Leitura** | Apenas visualização | Auditor externo ou fiscal do órgão |

:::tip Princípio do mínimo privilégio
Configure cada usuário com apenas as permissões necessárias para sua função — reduz o risco de alterações indevidas.
:::
