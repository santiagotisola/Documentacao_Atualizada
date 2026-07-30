---
sidebar_position: 2
title: Mapeamento de Rotas
description: Consulta e visualização de rotas percorridas por Veículos no AxCross
---

# Mapeamento de Rotas

Permite visualizar no mapa os percursos registrados por Veículos detectados nas câmeras monitoradas, identificando rotas frequentes, trajetos e padrões de deslocamento.

## Como acessar

No **menu lateral**, clique em Relatórios e selecione **Mapeamento de Rotas**.

![Relatórios](../img/Relatórios.png)

![Mapeamento de Rotas](../img/Mapeamento de Rotas.png)

## Filtros

| Filtro | Obrigatório | Descrição |
|--------|:-----------:|-----------|
| **Placa** | Sim | Placa do Veículo a rastrear |
| **Data Início** | Sim | Data inicial do período de consulta |
| **Data Fim** | Sim | Data final do período de consulta |

## O que o relatório exibe

- Mapa com o percurso do veículo pelos cruzamentos monitorados
- Linha do tempo das detecções com data/hora e local
- Imagens das passagens registradas

## Passo a passo

1. Acesse **Relatórios → Mapeamento de Rotas**
2. Informe a **Placa** do veículo
3. Defina o **Período** (Data Início e Fim)
4. Clique em **Consultar**
5. O mapa exibirá o percurso com marcadores por cruzamento

:::tip Investigações
O mapeamento de rotas é especialmente útil em operações de busca de veículos furtados/roubados, permitindo traçar o último percurso conhecido.
:::

## Limitações

- O mapeamento mostra apenas cruzamentos cobertos por equipamentos AxCross
- Períodos acima de 30 dias podem ter desempenho reduzido
- Placas com baixa qualidade OCR podem ter passagens ausentes no mapa

## Relacionado

- [Passagens](../glossario/passagem)
- [Veículos Monitorados](./veiculos-monitorados)
- [Painel Analítico](../painel/painel-analitico)

:::
| Equipamento | Não | Filtrar por câmera específica |

## Informações exibidas no mapa

| Informação | Descrição |
|------------|-----------|
| **Marcadores** | Pontos no mapa onde o Veículo foi detectado |
| **Sequência temporal** | Numeração indicando a ordem das passagens |
| **Local** | Nome do cruzamento onde a detecção ocorreu |
| **Data/Hora** | Momento de cada detecção |
| **Faixa** | Faixa onde o Veículo passou |

## Passo a passo

1. Acesse **Relatórios → Mapeamento de Rotas** no menu lateral
2. Informe a **Placa** do Veículo
3. Defina o **período** de consulta
4. Clique em **Consultar**
5. O mapa exibirá os pontos de detecção conectados em sequência cronológica

:::tip Dica
Combine o Mapeamento de Rotas com o **Rastreamento de Placas** para uma Análise completa dos deslocamentos.
:::

## Casos de uso

- **Investigação de incídentes**: reconstruir o último percurso de um veículo furtado/roubado para identificar o trajeto após o crime
- **Comprovação de presença**: confirmar que um veículo passou por determinado cruzamento em uma hora específica
- **Análise de padrões de rota**: identificar trajetos habituais de veículos suspeitos para previsão operacional
- **Suporte jurídico**: fornecer evidência de localização de veículo para processos judiciais ou administrativos

## Relacionado

- [Rastreamento de Placas](./rastreamento-placas)
- [Veículos Monitorados](./veiculos-monitorados)
- [Painel Analítico](./painel-analitico)
