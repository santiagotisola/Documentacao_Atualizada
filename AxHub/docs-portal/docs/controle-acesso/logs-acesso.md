---
sidebar_position: 5
title: Logs de Acesso
description: Registro de acessos e ações dos Usuários
---

# Logs de Acesso

Exibe o histórico completo de acessos ao sistema com detalhes de data, hora, Usuário e ações realizadas. Utilizado para auditoria de segurança, investigação de incidentes e comprovação de conformidade.

![Logs de Acesso](../img/Controle%20de%20acessos%20-%20logs%20de%20acesso.png)

## Como acessar

**Menu lateral** → Controle de Acesso → **Logs de Acesso**

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Período** | Faixa de datas e horas |
| Usuário | Filtrar por Usuário específico |
| **IP** | Filtrar por endereço de origem |
| **Ação** | Tipo de operação Login alteração, exclusão) |
| **Módulo** | Seção do sistema acessada |

## Campos exibidos

| Coluna | Descrição |
|--------|-----------|
| **Data/Hora** | Momento do acesso |
| Usuário | Quem realizou o acesso |
| **IP** | Endereço IP de origem |
| **Ação** | Tipo de operação Login Logout criação, edição, exclusão) |
| **Módulo** | Seção do sistema acessada |
| **Registro** | ID do registro afetado (quando aplicável) |
| **Status** | Sucesso ou Falha (ex: tentativa de Login inválido) |

## Tipos de Ações Registradas

| Ação | Descrição |
|------|-----------|
| **Login/Logout** | Entrada e saída do sistema |
| **Criar** | Inclusão de novo registro |
| **Editar** | Alteração de dado existente |
| **Excluir** | Remoção de registro |
| **Exportar** | Geração de relatório ou exportação |

:::tip
Filtre por **Status = Falha** para detectar tentativas de acesso não autorizado. Múltiplas falhas do mesmo IP podem indicar ataque de força bruta.
:::

## Relacionado

- [Usuários](./usuarios)
- [Perfis de Acesso](./perfis-acesso)
- [Acessos por IP](./acessos-por-ip)

| Login | Autenticação bem-sucedida |
| Login Falhou** | Tentativa de acesso com credenciais inválidas |
| Logout | Encerramento de sessão |
| **Criação** | Novo registro inserido |
| **Edição** | Registro alterado |
| **Exclusão** | Registro removido |
| **Exportação** | Dados exportados pelo Usuário |
| **Aprovação** | Fluxo de aprovação executado |

## Exportação

Exportável em **Excel** para uso em auditorias externas e Relatórios de conformidade.

:::tip Dica
Monitore tentativas de Login Falhou** repetidas do mesmo IP — pode indicar tentativa de acesso não autorizado. Use em conjunto com [Acessos por IP](./acessos-por-ip) para bloquear IPs suspeitos.
:::

---

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Relacionado | [Usuários](./usuarios) | Usuário que gerou o log |
| Relacionado | [Acessos por IP](./acessos-por-ip) | Controle por endereço IP |
| Relacionado | [Perfis de Acesso](./perfis-acesso) | Perfil do Usuário no log |
