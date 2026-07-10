---
sidebar_position: 3
title: Permissões de Acesso
description: Configuração granular de permissões por perfil
---

# Permissões de Acesso

Permite configurar permissões detalhadas para cada perfil de acesso, controlando quais operações cada grupo de Usuários pode executar em cada módulo do sistema.

![Permissões de Acesso](../img/Controle%20de%20acessos%20-%20permissao%20de%20acesso.png)

## Como acessar

**Menu lateral** → Controle de Acesso → **Permissões de Acesso**

## Estrutura de Permissões

As permissões são organizadas por **módulo** e **operação**. Cada combinação pode ser habilitada ou desabilitada individualmente por perfil.

| Coluna | Descrição |
|--------|-----------|
| **Módulo** | Seção do sistema Infrações Operações, etc.) |
| **Visualizar** | Permissão para consultar e listar dados |
| **Criar** | Permissão para inserir novos registros |
| **Editar** | Permissão para alterar registros existentes |
| **Excluir** | Permissão para remover registros |
| **Exportar** | Permissão para exportar dados |
| **Aprovar** | Permissão para aprovar fluxos (ex: auditoria) |

## Como configurar permissões

1. Selecione o **Perfil de Acesso** no filtro superior
2. O sistema exibe todos os módulos disponíveis
3. Marque ou desmarque cada combinação módulo/operação
4. Clique em **Salvar** para aplicar as alterações

:::warning Atenção
As alterações de permissão têm efeito imediato. Usuários com sessão ativa podem precisar fazer Logout e Login novamente para que as novas permissões sejam aplicadas.
:::

## Módulos disponíveis para Configuração

| Módulo | Funções configuráveis |
|--------|----------------------|
| Dashboard | Visualizar indicadores e gráficos |
| Infrações | Triagem, auditoria, exportação, consulta |
| **Cronotacógrafo** | Consulta e triagem de registros |
| **Balança** | Pesagem e triagem |
| **Operações** | Aferiçoes, monitoramento, cadastros |
| Veículos | Consulta e manutenção de cadastros |
| Equipamentos | Cadastro e manutenção |
| **Medição** | Contratos, criação e aprovação de medições |
| Relatórios | Acesso por tipo de Relatório |
| **Controle de Acesso** | Gestão de Usuários e perfis |
| Configurações | Parâmetros do sistema |

---

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Relacionado | [Perfis de Acesso](./perfis-acesso) | Perfis que usam estas permissões |
| Relacionado | [Usuários](./usuarios) | Usuários afetados pelas permissões |
| Relacionado | [Logs de Acesso](./logs-acesso) | Auditoria de ações realizadas |
