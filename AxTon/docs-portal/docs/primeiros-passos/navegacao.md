---
sidebar_position: 3
title: Navegação
description: Como navegar pelo sistema AxTon
---

# Navegação

O AxTon possui uma interface organizada em menu lateral fixo, que permite o acesso a todos os módulos disponíveis conforme o perfil de acesso do Usuário autenticado.

![Menu de Navegação](../img/menu.png)

## Estrutura da interface

| Elemento | Descrição |
|----------|-----------|
| **Menu lateral** | Use Dashboard à esquerda com a lista de módulos e categorias do sistema |
| **Área de conteúdo** | Região central onde as telas de cada módulo são exibidas |
| **Barra superior** | Exibe o nome do sistema, nome do Usuário autenticado e opção de sair |

## Módulos disponíveis

O menu lateral do AxTon é organizado com itens diretos e duas categorias expansíveis:

### Itens diretos

| Item do menu | Descrição |
|---|---|
| **Iniciar Pesagem** | Postos e início do processo de pesagem |
| **Operações** | Cadastro e gestão de operações de fiscalização |

## Dicas de navegação

| Atalho | Função |
|--------|--------|
| Clique no logo | Volta à página inicial |
| Menú recolhível | Clique na seta para expandir/recolher categorias |
| Busca | Utilize o campo de busca para localizar menus rapidamente |

:::tip
O menu exibe apenas os módulos que o perfil do usuário tem permissão de acessar. Se algum módulo estiver oculto, solicite ao administrador a concessão de permissão.
:::

## Estrutura geral do AxTon

| Módulo | Função |
|--------|--------|
| **Cadastros Básicos** | Postos, equipamentos, tipos, modelos |
| **Veículos** | Classificações, marcas, modelos |
| **Pesagem** | Tickets, reclassificar, liberar |
| **Operações** | Alertas, monitoramento, eventos |
| **Medições** | Contratos, índices, criar medição |
| **Relatórios** | Infrações, fluxo, OCR, Power BI |
| **Controle de Acesso** | Perfis, usuários, permissões |

| **Tickets de Pesagens** | Tickets em aberto e fechados |
| **Exportação** | Exportação de Infrações para o órgão autuador |
| **Sistema** | Configurações gerais, câmera IP e dados do órgão |
| Relatório de Pesagem** | Relatório de passagens e pesagens realizadas |
| **Sequenciais de Infração | Faixas de numeração sequencial |

### Categorias expansíveis

| Categoria | Itens |
|---|---|
| **Cadastros** | Locais, Classificações, Sequenciais de Infração |
| **Administração** | Usuários Permissões de acesso, Perfis de acesso |

:::tip Dica de navegação
Clique em uma categoria (Cadastros ou Administração) para expandir ou recolher os itens.

## Fluxo de trabalho típico

1. **Login** → Dashboard de status dos equipamentos
2. **Iniciar Pesagem** → Selecionar posto e abrir operação
3. Durante a operação → pesagens registradas automaticamente
4. Encerrar turno → **Operações** → Fechar operação
5. Revisar infrações → **Triagem** → validar/descartar
6. Exportar lote → **Exportação** → enviar ao órgão autuador
7. Relatórios → **Relatório de Infrações** → acompanhamento gerencial

## Tabela de referência rápida

| Situação | Onde ir no menu |
|----------|-----------------|
| Iniciar a pesagem de um veículo | **Iniciar Pesagem** |
| Ver tickets em aberto | **Tickets de Pesagens** |
| Exportar infrações ao órgão | **Exportação** |
| Configurar balança e câmera IP | **Sistema** |
| Adicionar ou editar usuários | **Administração → Usuários** |
| Verificar acessos recentes | **Controle de Acesso → Logs de Acesso** |
| Ver relatório de pesagens | **Relatório de Pesagem** |
| Criar nova operação de campo | **Operações** |

## Tabela de referência — perfis e acessos comuns

| Perfil | Módulos habilitados | Restrições |
|--------|--------------------|-----------|
| **Operador** | Pesagem, Triagem, Relatórios básicos | Sem acesso a configurações |
| **Supervisor** | Todos + Operações, Exportação | Sem acesso a Administração |
| **Administrador** | Acesso total | Sem restrições |
| **Auditor** | Relatórios somente leitura | Sem cadastros ou exportação |

## Perguntas frequentes

**Não encontro um módulo no menu. O que fazer?**  
O menu exibe apenas módulos com permissão ativa no seu perfil. Solicite ao administrador a concessão da permissão necessária.

**O sistema desconectou automaticamente. Por quê?**  
O AxTon possui timeout de sessão por inatividade. Faça login novamente — os dados são preservados.

**Como acessar o sistema de outro computador?**  
Acesse pelo navegador o mesmo endereço IP do servidor AxTon na rede local. Não é necessário instalar software adicional.
:::

## Relacionado

- [Login](./login)
- [Dashboard](./dashboard)
- [Perfis de Acesso](../administracao/perfis-acesso)
- [Permissões de Acesso](../administracao/permissoes)

## Orientações de navegação

- O menu exibe somente os módulos que o perfil do usuário tem permissão de acessar
- Itens ausentes no menu indicam permissões não concedidas — solicite ao administrador se necessário
- Use o breadcrumb no topo para entender em qual tela você está e navegar de volta sem perder o contexto
- Em dispositivos com tela pequena, o menu pode ser recolhido automaticamente para melhor aproveitamento de espaço

## Boas práticas

- Use o breadcrumb sempre que precisar retornar a uma tela anterior — evita navegar pelo menu do zero
- Se um item do menu estiver ausente, verifique com o administrador se as permissões do seu perfil estão corretas

## Erros comuns

| Situação | Causa | Solução |
|----------|-------|----------|
| Módulo ausente no menu | Perfil sem permissão para o módulo | Solicite ao administrador a concessão da permissão necessária |
| Sessão encerrada automaticamente | Timeout de inatividade | Faça login novamente — os dados são preservados |
| Menu não expande uma categoria | Erro de JavaScript ou cache | Recarregue a página (`F5`) ou limpe o cache do navegador |
| Tela em branco ao clicar em módulo | Permissão de visualização não concedida | Verifique com o administrador as permissões do perfil |

## Integração com outros módulos

| Módulo | Como se relaciona com a Navegação |
|--------|-----------------------------------|
| **Login** | O perfil autenticado determina quais itens aparecem no menu |
| **Perfis de Acesso** | Define quais módulos ficam visíveis no menu para cada perfil |
| **Permissões de Acesso** | Controla granularmente o acesso a funcionalidades dentro de cada módulo |
| **Dashboard** | Tela inicial exibida após o login, acessível pelo logo do AxTon |
- Em telas de listagem, utilize os filtros antes de exportar dados para reduzir o volume do arquivo gerado
