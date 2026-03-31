---
sidebar_position: 1
title: Monitoramento Online
description: Acompanhamento em tempo real dos equipamentos e passagens no AxCross
---

# Monitoramento Online

O módulo de **Monitoramento Online** centraliza o acompanhamento em tempo real de todos os equipamentos cadastrados no AxCross. A partir dele, é possível visualizar o status de cada câmera, aplicar filtros por alerta, equipamento e faixa, além de acessar o mapa visual de passagens registradas pelas câmeras.

![](<../img/Monitoramento Online.png>)

## Como acessar

No **menu lateral**, clique no ícone de **Monitoramento** e, em seguida, selecione a opção desejada:

| Opção | Descrição |
|---|---|
| **Monitoramento Online** | Visualização em tempo real com filtros por alerta, equipamento e faixa |
| **Mapa de Equipamentos** | Grade visual com as imagens capturadas por cada câmera ativa |

---

## Monitoramento Online

A tela de **Monitoramento Online** exibe o status de funcionamento das câmeras em tempo real, com filtros para segmentar a visualização por tipo de alerta, equipamento ou faixa de pista.

![](<../img/Monitoramento Online.- fitros.png>)

### Filtros disponíveis

Os filtros estão localizados no canto superior direito da tela e permitem refinar o que está sendo monitorado:

| Filtro | Descrição |
|---|---|
| **Todos os Alertas** | Filtra os equipamentos que possuem um tipo específico de alerta ativo. Selecione "Todos os Alertas" para exibir sem restrição de alerta. |
| **Todos Equipamentos** | Filtra por câmera ou equipamento específico. Exibe todos quando nenhum equipamento for selecionado. |
| **Todas Faixas** | Filtra por faixa de pista monitorada (Faixa 1, Faixa 2, etc.). Exibe todas as faixas por padrão. |

### Indicador de status

No canto superior direito, ao lado dos filtros, é exibido o indicador de status da conexão:

| Status | Cor | Significado |
|---|---|---|
| **ONLINE** | Verde | O sistema está conectado e recebendo dados em tempo real |
| **OFFLINE** | Vermelho | O sistema está sem conexão. Os dados exibidos podem estar desatualizados |

:::warning Equipamento OFFLINE
Quando o indicador estiver vermelho **(OFFLINE)**, verifique a conectividade da rede e o status dos equipamentos no cadastro. Nenhuma passagem será registrada enquanto a conexão estiver interrompida.
:::

### Botão de iniciar monitoramento

O botão **verde (▶)** ao lado dos filtros inicia ou atualiza a visualização do monitoramento com base nos filtros selecionados.

:::tip Dica
Selecione um equipamento específico nos filtros antes de iniciar para focar o monitoramento em um ponto de interesse.
:::

---

## Mapa de Equipamentos

O **Mapa de Equipamentos** apresenta uma grade visual com as capturas mais recentes de cada câmera ativa no sistema. Cada card exibe a imagem capturada, o nome do equipamento e informações da passagem registrada.

![](<../img/Mapa de Equipamentos.png>)

### Elementos da tela

| Elemento | Descrição |
|---|---|
| **Cards de câmeras** | Cada card representa uma câmera ativa. Exibe a imagem capturada mais recente e os dados da passagem. |
| **Ícone de notificações** | Exibe alertas ativos relacionados aos equipamentos monitorados. |
| **Ícone de equipamentos** | Acesso rápido à lista de equipamentos cadastrados. |
| **Botão Filtrar** | Abre o painel de filtros para segmentar a visualização por equipamento, local ou faixa. |
| **Horário (canto inferior direito)** | Indica o horário da última atualização da tela. |

:::info Atualização automática
Os cards do Mapa de Equipamentos são atualizados automaticamente conforme novas passagens são registradas, sem necessidade de recarregar a página.
:::

:::tip Dica
Use o botão **Filtrar** para exibir apenas as câmeras de um cruzamento específico quando houver muitos equipamentos cadastrados.
:::
