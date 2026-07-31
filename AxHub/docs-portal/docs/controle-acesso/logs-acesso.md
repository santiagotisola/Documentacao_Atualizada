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

## Fluxo de auditoria de segurança

1. Suspeita de acesso indevido → filtrar por **Usuário** suspeito no período
2. Identificar ações realizadas (criar, editar, excluir) e módulos acessados
3. Cruzar com dados do módulo afetado para avaliar impacto
4. Exportar log em Excel para documentar o incidente
5. Tomar ação: bloquear, revogar acesso, redefinir senha, notificar gestor

## Tabela de referência — padrões de alerta

| Padrão | Risco | Ação |
|--------|:-----:|------|
| 5+ falhas consecutivas do mesmo IP | Alto | Bloquear IP |
| Login de madrugada incomum | Médio | Confirmar com usuário |
| Exportação em massa de dados | Alto | Verificar autorização |
| Acesso de IP externo não usual | Médio | Verificar uso de VPN |
| Usuário inativo com acessos | Alto | Revogar acesso imediatamente |

## Segurança

- Revise os logs de acesso **semanalmente** para identificar padrões de autenticação anormais
- Filtre por **Status = Falha** e analise os IPs de origem — múltiplas falhas do mesmo IP podem indicar ataque de força bruta
- Acessos em horários incomuns (madrugada, fins de semana) devem ser confirmados com o responsável da conta
- Exporte o log mensalmente para um repositório externo como parte do plano de auditoria de segurança

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

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Log não registra ações esperadas | Usuário sem permissão para o módulo monitorado | Verificar o perfil de acesso e as permissões atribuídas |
| Múltiplas falhas de login do mesmo IP | Tentativa de acesso não autorizado | Bloquear o IP em **Acessos por IP** e notificar o administrador |
| Log vazio para período | Período sem atividade ou filtro muito restrito | Ampliar o período de busca e verificar se o usuário operou no sistema |

## Perguntas frequentes

**Por quanto tempo os logs de acesso são retidos?**
Os logs são retidos conforme a política de retenção configurada no servidor. Recomenda-se exportar mensalmente para armazenamento externo como evidência de conformidade.

**Como detectar tentativas de acesso não autorizado?**
Filtre por **Status = Falha** e observe múltiplas tentativas do mesmo IP em curto intervalo. Combine com [Acessos por IP](./acessos-por-ip) para bloquear IPs suspeitos.

**O log registra o que o usuário fez dentro do sistema?**
Sim. Além de login/logout, o log registra criação, edição, exclusão e exportação por módulo, com o ID do registro afetado para rastreabilidade completa.

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Usuários](./usuarios)** | Os logs de acesso são vinculados a cada usuário; ao investigar uma ação, localize o usuário no cadastro para contexto adicional |
| **[Acessos por IP](./acessos-por-ip)** | IPs com múltiplas falhas de login identificadas nos logs devem ser bloqueados nas regras de Acessos por IP |
| **[Perfis de Acesso](./perfis-acesso)** | O perfil do usuário determina quais ações ele pode realizar; logs de ações não autorizadas indicam problema de configuração de perfil |
| **[Processamento por Usuário](../relatorios/processamento-por-usuario)** | Os logs de acesso cruzados com o relatório de processamento confirmam a presença e produtividade do analista no turno |
