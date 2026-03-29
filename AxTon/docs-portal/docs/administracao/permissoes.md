---
sidebar_position: 3
title: Permissões de Acesso
description: Configuração das permissões por perfil no sistema AxTon
---

# Permissões de Acesso

O módulo de permissões de acesso permite definir, para cada perfil cadastrado, quais funcionalidades do sistema estarão disponíveis. As permissões controlam o acesso a módulos, telas e ações específicas.

## Como acessar

**Menu lateral** → Administração → **Permissões de Acesso**

## Listagem

![Tela de Permissões de Acesso — Lista](../img/permissoes-acesso.png)

### Estrutura da tela

A tela exibe a matriz de permissões organizada por **perfil de acesso** e **funcionalidade**. Para cada combinação, é possível habilitar ou desabilitar o acesso.

## Configuração de permissões

![Tela de Permissão — Configuração](../img/permissao-acesso.png)

### Tipos de permissão

| Permissão | Descrição |
|-----------|-----------|
| **Visualizar** | Permite ao usuário acessar e visualizar os dados da funcionalidade |
| **Criar** | Permite ao usuário cadastrar novos registros na funcionalidade |
| **Editar** | Permite ao usuário alterar registros existentes |
| **Excluir** | Permite ao usuário remover registros do sistema |

### Passo a passo — Configurar permissões de um perfil

1. Acesse **Administração** → **Permissões de Acesso**
2. Selecione o **Perfil de Acesso** a ser configurado
3. Para cada funcionalidade listada, marque ou desmarque os tipos de permissão desejados
4. Clique em **Salvar** para aplicar as configurações

:::warning Impacto imediato
As alterações nas permissões de um perfil têm efeito imediato para todos os usuários vinculados a esse perfil. Usuários com sessão ativa poderão perceber a alteração no próximo acesso a uma funcionalidade afetada.
:::

## Funcionalidades por módulo

A tabela abaixo lista as funcionalidades disponíveis para configuração de permissões, agrupadas por módulo:

| Módulo | Funcionalidades |
|--------|----------------|
| **Pesagem** | Postos, Tickets em Aberto, Tickets Fechados, Reclassificar, Liberar, Motivos |
| **Operações** | Cadastro de Operações, Monitoramento Online, Eventos, Consulta de Placas, Alertas |
| **Infrações** | Triagem, Auditoria, Consulta, Exportação, Exceções, Descartadas |
| **Relatórios** | Passagens, Infrações, Fluxo Diário, Discrepâncias, NFe, Power BI |
| **Cadastros Básicos** | Equipamentos, Fabricantes, Tipos, Modelos, Grupos |
| **Veículos** | Tipos, Marcas, Modelos, Cores, Classificações, Municípios |
| **Medições** | Contratos, Índices de Performance, Interrupções, Gerar Medição |
| **Controle de Acesso** | Logs de Acesso, Restrição por IP, Permissões Detalhadas |
| **Administração** | Usuários, Perfis de Acesso, Permissões |

:::tip Boas práticas
- **Operadores de triagem**: Visualizar e Criar em Infrações, Visualizar em Pesagem e Relatórios
- **Supervisores**: Todas as permissões em Infrações + Relatórios + Operações
- **Administradores**: Acesso total a todos os módulos
- **Consulta**: Apenas Visualizar em Relatórios (perfil somente leitura)
:::
