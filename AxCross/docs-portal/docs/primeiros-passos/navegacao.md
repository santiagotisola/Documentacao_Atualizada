---
sidebar_position: 3
title: Navegação
description: Estrutura da interface e navegação no sistema AxCross
---

# Navegação

O AxCross possui uma interface organizada em **menu lateral fixo**, acessível em todas as telas do sistema. Os módulos disponíveis variam conforme o perfil de acesso do usuário autenticado.

## Estrutura da interface

| Elemento | Localização | Descrição |
|---|---|---|
| **Menu lateral** | Coluna esquerda | Acesso a todos os módulos do sistema |
| **Área de conteúdo** | Região central | Telas de cada módulo selecionado |
| **Barra superior** | Topo direito | Nome do usuário autenticado, sino de notificações e menu do perfil |
| **Sino de notificações** 🔔 | Barra superior | Alertas de vigência — veículos próximos de expirar ou já expirados |
| **Breadcrumb** | Abaixo da barra | Caminho de navegação atual (ex.: Dashboard → Configurações) |
| **Rodapé** | Parte inferior | Versão do sistema e link de suporte |

## Menu principal

O menu lateral segue a ordem dos módulos operacionais do sistema:

| # | Item do menu | Caminho | Descrição |
|---|---|---|---|
| 1 | **Dashboard** | `/` | Indicadores, passagens, mapa e ocorrências em tempo real |
| 2 | **Veículos Monitorados** | `/occurrences/monitoredvehicle` | Placas de interesse, alertas, tipos de ocorrências e importação |
| 3 | **Equipamentos** | `/equipments/equipment` | Câmeras, grupos, áreas, locais, faixas e importação |
| 4 | **Monitoramento** | `/monitoringonline/monitoring` | Monitoramento Online e Mural de Câmeras |
| 5 | **Relatórios** | `/reports/reports` | 10 relatórios operacionais com exportação |
| 6 | **Configurações** | `/settings/systemsettings` | Sistema, usuários, perfis, permissões, logs e sincronização |

## Submenu de Monitoramento

Ao clicar em **Monitoramento**, dois subitens ficam disponíveis:

| Subitem | Descrição |
|---|---|
| **Monitoramento Online** | Status em tempo real de cada câmera com filtros por alerta, equipamento e faixa |
| **Mural de Câmeras** | Grade visual personalizável com feeds ao vivo das câmeras selecionadas |

## Submenu de Relatórios

Ao clicar em **Relatórios**, os 10 tipos disponíveis são listados:

| Relatório | Descrição resumida |
|---|---|
| Passagens | Histórico completo com filtros e exportação |
| Mapeamento de Rotas | Rota de um veículo no mapa por período |
| Rastreamento de Placas | Todas as detecções de uma placa |
| Painel Analítico | Gráficos de desempenho por placa/período |
| Veículos Monitorados | Detecções de veículos cadastrados |
| Ocorrências | Ocorrências por placa, equipamento e tipo |
| Alertas | Alertas filtrados por área, tipo e placa |
| Mapa de Bolhas | Concentração geográfica de irregularidades |
| Gerados | PDFs disponíveis para download |
| Grafos de Comboio | Veículos em deslocamento conjunto |

## Submenu de Configurações

| Subitem | Descrição |
|---|---|
| **Sistema** | Parâmetros operacionais, MDF-e, comboio e alertas recorrentes |
| **Usuários** | Cadastro e gestão de usuários |
| **Perfis de Acesso** | Criação de perfis com conjuntos de permissões |
| **Permissões** | Controle granular por funcionalidade |
| **Logs de Acesso** | Auditoria de ações por usuário |
| **Sincronização de Passagens** | Reindexação no Elasticsearch |

:::tip Dica
Use o **breadcrumb** no topo da página para identificar rapidamente em qual módulo você está e navegar para níveis anteriores sem usar o botão Voltar do navegador.
:::
