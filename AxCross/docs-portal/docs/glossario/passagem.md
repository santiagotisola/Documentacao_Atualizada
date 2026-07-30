---
sidebar_position: 1
title: "Passagem"
description: "O que é uma passagem no AxCross — dados, fluxo e uso operacional"
---

# Passagem

Registro da **detecção de um veículo** por um equipamento de monitoramento em um cruzamento. Cada passagem é a unidade básica de dados do AxCross — a partir dela são gerados alertas, relatórios e análises.

## Dados de uma passagem

| Campo | Descrição |
|-------|-----------|
| **Data/Hora** | Momento exato da detecção |
| **Placa** | Placa lida pelo OCR do equipamento |
| **Local** | Cruzamento onde a detecção ocorreu |
| **Faixa** | Faixa de pista monitorada |
| **Equipamento** | Câmera ou sensor que registrou |
| **Velocidade** | Velocidade do veículo (quando disponível) |
| **Imagem** | Fotografia capturada pelo equipamento |
| **Alerta** | Se o veículo estava monitorado |

## Ciclo de vida

```
Veículo passa → OCR lê placa → Passagem registrada
                                    ↓
                     Veículo monitorado? → Sim → Alerta gerado
                                         → Não → Registrada sem alerta
```

## Onde consultar passagens

- **Monitoramento Online**: tempo real
- **Rastreamento por Placa**: histórico por placa
- **Relatório de Passagens**: exportação com filtros
- **Painel Analítico**: análise por veículo

## Relacionados

- [Equipamento](./equipamento) — Dispositivo que registra
- [Alerta](../operacoes/alertas) — Gerado quando veículo monitorado passa


## Como as passagens são registradas

1. O Veículo passa pelo cruzamento monitorado
2. O Equipamento detecta e fotografa o Veículo
3. O sistema realiza leitura OCR da placa
4. Consulta a lista de monitorados
5. Se encontrado: gera **Alerta** automático
6. Passagem salva no banco de dados

:::tip
A qualidade da leitura OCR depende diretamente da calibração e limpeza do equipamento. Acompanhe a taxa de reconhecimento no **Painel Analítico**.
:::
4. O registro é salvo no banco de dados
5. O sistema verifica se a placa consta na lista de Veículos monitorados
6. Se sim, um alerta é gerado automaticamente

## Consulta de passagens

As passagens podem ser consultadas nos seguintes módulos:

- **Relatório de Passagens** — consulta por período, local e Equipamento
- **Rastreamento de Placas** — histórico de um Veículo específico
- **Monitoramento Online** — visualização em tempo real
- **Mapeamento de Rotas** — trajetória no mapa
