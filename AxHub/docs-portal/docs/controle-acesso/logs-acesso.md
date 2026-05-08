---
sidebar_position: 5
title: Logs de Acesso
description: Registro de acessos e ações dos usuários
---

# Logs de Acesso

Exibe o histórico completo de acessos ao sistema com detalhes de data, hora, usuário e ações realizadas. Utilizado para auditoria de segurança, investigação de incidentes e comprovação de conformidade.

![Logs de Acesso](../img/Controle%20de%20acessos%20-%20logs%20de%20acesso.png)

## Como acessar

**Menu lateral** → Controle de Acesso → **Logs de Acesso**

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Período** | Faixa de datas e horas |
| **Usuário** | Filtrar por usuário específico |
| **IP** | Filtrar por endereço de origem |
| **Ação** | Tipo de operação (login, alteração, exclusão) |
| **Módulo** | Seção do sistema acessada |

## Campos exibidos

| Coluna | Descrição |
|--------|-----------|
| **Data/Hora** | Momento do acesso |
| **Usuário** | Quem realizou o acesso |
| **IP** | Endereço IP de origem |
| **Ação** | Tipo de operação (login, logout, criação, edição, exclusão) |
| **Módulo** | Seção do sistema acessada |
| **Registro** | ID do registro afetado (quando aplicável) |
| **Status** | Sucesso ou Falha (ex: tentativa de login inválido) |

## Tipos de Ações Registradas

| Ação | Descrição |
|------|-----------|
| **Login** | Autenticação bem-sucedida |
| **Login Falhou** | Tentativa de acesso com credenciais inválidas |
| **Logout** | Encerramento de sessão |
| **Criação** | Novo registro inserido |
| **Edição** | Registro alterado |
| **Exclusão** | Registro removido |
| **Exportação** | Dados exportados pelo usuário |
| **Aprovação** | Fluxo de aprovação executado |

## Exportação

Exportável em **Excel** para uso em auditorias externas e relatórios de conformidade.

:::tip Dica
Monitore tentativas de **Login Falhou** repetidas do mesmo IP — pode indicar tentativa de acesso não autorizado. Use em conjunto com [Acessos por IP](./acessos-por-ip) para bloquear IPs suspeitos.
:::

---

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Relacionado | [Usuários](./usuarios) | Usuário que gerou o log |
| Relacionado | [Acessos por IP](./acessos-por-ip) | Controle por endereço IP |
| Relacionado | [Perfis de Acesso](./perfis-acesso) | Perfil do usuário no log |
