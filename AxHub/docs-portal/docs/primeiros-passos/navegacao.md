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

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Módulo não aparece no menu | Perfil sem permissão para o módulo | Solicitar ao administrador revisão das permissões |
| Menu lateral recolhido automaticamente | Tela menor que 1024px | Expandir a janela do navegador ou usar o ícone hamburguer |
| Breadcrumb com caminho incorreto | Navegação por URL direta sem passar pelo menu | Usar sempre o menu lateral para navegar entre módulos |

## Perguntas frequentes

**Um módulo não aparece no menu lateral. O que verificar?**
Módulos ausentes indicam que o perfil de acesso do usuário não tem permissão para aquele módulo. Solicite ao administrador a revisão das permissões em **Controle de Acesso → Permissões**.

**Como voltar ao Dashboard sem navegar pelo menu?**
Clique no logo do AxHub no topo da página. Esta ação sempre retorna ao Dashboard independente de onde você estiver no sistema.

**O menu lateral desapareceu. O que fazer?**
O menu pode estar recolhido. Clique no ícone de hamburguer (três linhas) no canto superior esquerdo para expá-lo. Em telas menores, ele recolhe automaticamente.

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Login](./login)** | O login define o usuário ativo; o perfil do usuário determina quais itens aparecem no menu lateral |
| **[Perfis de Acesso](../controle-acesso/perfis-acesso)** | As permissões do perfil controlam diretamente a visibilidade de cada módulo no menu de navegação |
| **[Dashboard](./dashboard)** | O Dashboard é a tela inicial após o login e o ponto de partida para navegar para todos os módulos |
| **[Controle de Acesso — Permissões](../controle-acesso/permissoes)** | Módulos ausentes no menu indicam falta de permissão; o administrador configura o acesso neste módulo |

## Exemplo prático

**Cenário**: Um analista reciém-contratado reporta que não vê o módulo **Medição** no menu lateral, que é essencial para o trabalho dele.

**Passo a passo**:

1. O administrador acessa **Controle de Acesso → Perfis de Acesso**
2. Localiza o perfil do novo analista (ex.: "Operador Padrão")
3. Clica em **Editar** e verifica as permissões: o módulo **Medição** não está marcado
4. Habilita as permissões de **Medição → Contratos** e **Medição → Criar Medição**
5. Clica em **Salvar**
6. O analista faz logout e login novamente — o módulo Medição passa a aparecer no menu lateral

**Resultado**: O analista acessa o módulo sem necessidade de criar um novo usuário. O ajuste de perfil resolve para todos os usuários vinculados ao mesmo perfil simultaneamente.
