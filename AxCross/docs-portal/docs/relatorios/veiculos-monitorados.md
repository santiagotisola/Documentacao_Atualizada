---
sidebar_position: 4
title: Relatório de Veículos Monitorados
description: Relatório de detecções de Veículos monitorados no AxCross
---

# Relatório de Veículos Monitorados

Consolida as detecções de Veículos cadastrados na lista de monitorados, exibindo cada ocorrência com dados de local, data/hora e imagem da passagem.

## Como acessar

No **menu lateral**, clique em **Relatórios** e selecione **Veículos Monitorados**.

![Relatório Veículos Monitorados](../img/Relatório Veículos Monitorados.png)
)

## Filtros

| Filtro | Obrigatório | Descrição |
|--------|:-----------:|-----------|
| **Data Início** | Sim | Data inicial do período |
| **Data Fim** | Sim | Data final do período |
| **Placa** | Não | Filtrar por placa específica |
| **Classificação** | Não | Filtrar por classificação do Veículo (ex.: Roubado, VIP) |

## Colunas

| Coluna | Descrição |
|--------|-----------|
| **Data/Hora** | Momento da detecção |
| **Placa** | Placa identificada |
| **Equipamento** | Câmera que registrou |
| **Classificação** | Categoria de monitoramento |
| **Imagem** | Foto da passagem |

:::warning
As detecções de veículos monitorados geram alertas automáticos. O operador deve verificar e tratar cada alerta dentro do prazo definido pela operação.
:::

## Relacionado

- [Alertas](../operacoes/alertas)
- [Mapeamento de Rotas](./mapeamento-rotas)
- [Ocorrências e Alertas](./ocorrencias-alertas)


## Colunas do resultado

| Coluna | Descrição |
|--------|-----------|
| **Data/Hora** | Momento da detecção |
| **Placa** | Placa detectada |
| **Classificação** | Categoria do Veículo monitorado |
| **Local** | Cruzamento onde ocorreu a detecção |
| Equipamento | Câmera que registrou a passagem |
| **Status Alerta** | Status da tratativa do alerta gerado |
| **Imagem** | Foto da passagem |

## Passo a passo

1. Acesse **Relatórios → Veículos Monitorados** no menu lateral
2. Defina o **período** de consulta
3. Opcionalmente, aplique filtros adicionais
4. Clique em **Consultar**
5. Para exportar, clique em **Excel** ou **PDF**

:::tip Acompanhamento de alertas
Use este Relatório em conjunto com a tela de **Alertas** para acompanhar o status das tratativas de cada detecção.
:::

## Casos de uso

- **Prestação de contas operacional**: demonstrar ao órgão contratante todas as detecções de veículos monitorados realizadas no período
- **Auditoria de alertas**: verificar se todos os alertas gerados foram devidamente tratados e registrados
- **Análise de padrões**: identificar veículos com alta frequência de detecção para priorizar investigações
- **Comprovação de monitoramento**: documentar que um veículo específico foi ou não detectado durante determinado período

