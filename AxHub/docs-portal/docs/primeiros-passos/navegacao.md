---
sidebar_position: 3
title: Navegação
description: Como navegar pelo sistema AxHub — estrutura de menus e atalhos
---

# Navegação

Guia de orientação sobre a **estrutura de menus e navegação geral** do sistema AxHub.

## Estrutura do menu lateral

| Seção | Submódulos principais |
|-------|----------------------|
| **Dashboard** | Indicadores em tempo real |
| **Infrações** | Triagem, Auditoria, Exportação, Exceções |
| **Cronotacógrafo** | Consulta e Triagem |
| **Balança** | Postos, Pesagem, Tickets |
| **Operações** | Monitoramento, Faixas, Aferições, Eventos |
| **Veículos** | Marcas, Modelos, Categorias, Cores |
| **Equipamentos** | Equipamentos, Grupos, Fabricantes |
| **Medição** | Contratos, Criação, Interrupções |
| **Relatórios** | 14 tipos disponíveis |
| **Controle de Acesso** | Usuários, Perfis, Permissões |
| **Configurações** | Enquadramentos, Tarjas, Layouts, Webhooks |

## Atalhos úteis

- **Logo AxHub** no topo: volta ao Dashboard
- **Breadcrumb**: mostra o caminho atual (ex.: Infrações → Triagem)
- **F5**: atualiza a página atual

## Mapa Online

![Mapa Online](../img/mapa%20online.png)

O mapa online exibe em tempo real os equipamentos ativos e seus status operacionais, permitindo monitoramento geográfico da operação.

## Boas práticas

- Use o **breadcrumb** no topo da tela para entender em qual módulo você está e navegar de volta sem perder contexto
- Acesse os atalhos no Dashboard para funcionalidades mais usadas sem navegar pelo menu lateral
- Módulos ausentes no menu indicam permissões não concedidas ao perfil — solicite ao administrador se necessário
- Em dispositivos com tela menor, recolha o menu lateral para maximizar a área de trabalho

## Fluxo de trabalho típico do operador

1. **Login** → Dashboard com status geral dos equipamentos
2. Verificar **Status dos Equipamentos** — confirmar que todos estão online
3. Acessar **Infrações → Triagem** para processar infrações pendentes
4. Ao final do turno: acessar **Infrações → Consulta** para revisar o backlog
5. Verificar relatórios gerenciais em **Relatórios → Processamento de Imagens**

## Tabela de referência — módulos por perfil

| Perfil | Módulos típicos | Acesso restrito |
|--------|----------------|:--------------:|
| **Operador** | Infrações, Cronotacógrafo, Balança | Configurações |
| **Auditor** | Infrações, Relatórios | Cadastros |
| **Gestor** | Todos + Medições | Sem restrição |
| **Administrador** | Acesso completo | Sem restrição |

## Relacionado

- [Login](./login)
- [Permissões](../controle-acesso/permissoes)
- [Dashboard](../relatorios/power-bi)
Use os atalhos nos ícones do Dashboard para acessar as funcionalidades mais usadas sem navegar pelo menu lateral.
:::

## Relacionado

- [Login](./login)
- [Permissões](../controle-acesso/permissoes)


| Modulo | Descricao |
|--------|-----------|
| Dashboard | Use Dashboard principal com indicadores e mapa |
| Infracoes | Triagem auditoria e consulta de infracoes |
| Operacoes | Cadastro de operacoes e afericoes |
| Equipamentos | Cadastro de Equipamentos fabricantes modelos tipos e grupos |
| Veiculos | Cadastro de tipos especies marcas modelos cores e municipios |
| Balanca | Pesagem de veiculos e triagem de balanca |
| Cronotacografo | Triagem e consulta de registros de cronotacografo |
| Relatórios | Relatórios operacionais e gerenciais |
| Administracao | Configuracoes arcos regioes faixas e enquadramentos |
| Controle de Acesso | Usuários perfis permissoes e logs |

## Navegacao relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Anterior | [Dashboard](./dashboard) | Tela principal |
| Relacionado | [Login](./login) | Acesso ao sistema |

## Perguntas frequentes

**Um módulo não aparece no menu lateral. O que verificar?**
Módulos ausentes indicam que o perfil de acesso do usuário não tem permissão para aquele módulo. Solicite ao administrador a revisão das permissões em **Controle de Acesso → Permissões**.

**Como voltar ao Dashboard sem navegar pelo menu?**
Clique no logo do AxHub no topo da página. Esta ação sempre retorna ao Dashboard independente de onde você estiver no sistema.

**O menu lateral desapareceu. O que fazer?**
O menu pode estar recolhido. Clique no ícone de hamburguer (três linhas) no canto superior esquerdo para expá-lo. Em telas menores, ele recolhe automaticamente.
