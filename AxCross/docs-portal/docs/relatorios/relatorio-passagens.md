---
sidebar_position: 1
title: Relatório de Passagens
description: Consulta e geração de Relatórios de passagens no AxCross
last_update:
  date: 2026-06-23
  author: Sistema Automático AxionIA
---

# Relatório de Passagens

Permite consultar e exportar as passagens registradas nos cruzamentos monitorados, com **ordenação dinâmica**, **filtros avançados** e **exportação em múltiplos formatos**.

## ✨ Novidades v4.0

- 🔄 **Ordenação dinâmica** por 6 campos (Data, Placa, Velocidade, Equipamento, Faixa, Local)
- 📊 **Exportação XLSX** com metadados e formatação profissional
- 📄 **Exportação CSV** com UTF-8 e delimitador ";"
- 📑 **Exportação PDF** com imagens inline
- ✅ **Validação de consistência** entre tela e arquivos exportados
- 👤 **Perfis de usuário** para salvar configurações

## Como acessar

No **menu lateral**, clique em Relatório de Passagens**.

![Relatórios](../img/Relatórios.png)

Relatório de Passagens](../img/Relatório de Passagens.png)

## Filtros

| Filtro | Obrigatório | Descrição |
|--------|:-----------:|-----------|
| **Data Início** | Sim | Data inicial do período de consulta |
| **Data Fim** | Sim | Data final do período de consulta |
| **Local** | Não | Filtrar por cruzamento específico |
| Equipamento | Não | Filtrar por Equipamento |
| **Faixa** | Não | Filtrar por faixa monitorada |

## Colunas do Relatório

| Coluna | Descrição |
|--------|-----------|
| **Data/Hora** | Momento exato da passagem |
| **Local** | Cruzamento onde a passagem foi registrada |
| **Faixa** | Faixa onde o Veículo passou |
| **Placa** | Placa capturada do Veículo |
| **Velocidade** | Velocidade registrada (se disponível) |
| **Imagem** | Link para imagem capturada |

## Passo a passo

1. Acesse Relatório de Passagens** no menu lateral
2. Defina o **período** (Data Início e Data Fim)
3. Opcionalmente, selecione filtros adicionais (Local, Equipamento Faixa)
4. Clique em **Consultar**
5. Para exportar, clique em **Exportar** (PDF ou CSV)

Relatórios Gerados](../img/Relatórios Gerados.png)

## Rastreamento de Veículos por Placa

![Rastreamento de Veículos por Placa](../img/Rastreamento de Veículos por Placa.png)

Alternativamente, utilize a busca por placa para visualizar o histórico completo de passagens de um Veículo específico em todos os cruzamentos monitorados.

:::tip Dica
Use o filtro por faixa para Análise detalhada do fluxo em uma via específica.
:::
