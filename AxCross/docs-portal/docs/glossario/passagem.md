---
sidebar_position: 1
title: "Passagem"
---

# Passagem

Registro da detecção de um veículo por um equipamento de monitoramento em um cruzamento. Cada passagem contém dados como placa, data/hora, local, faixa e imagem capturada.

## Dados de uma passagem

| Campo | Descrição |
|-------|-----------|
| **Data/Hora** | Momento exato da detecção |
| **Placa** | Placa lida pelo OCR do equipamento |
| **Local** | Cruzamento onde a detecção ocorreu |
| **Faixa** | Faixa de pista monitorada |
| **Equipamento** | Câmera ou sensor que registrou a passagem |
| **Velocidade** | Velocidade do veículo (quando disponível) |
| **Imagem** | Fotografia da passagem capturada pelo equipamento |

## Como as passagens são registradas

1. O veículo passa pelo cruzamento monitorado
2. O equipamento detecta e fotografa o veículo
3. O sistema realiza leitura OCR da placa
4. O registro é salvo no banco de dados
5. O sistema verifica se a placa consta na lista de veículos monitorados
6. Se sim, um alerta é gerado automaticamente

## Consulta de passagens

As passagens podem ser consultadas nos seguintes módulos:

- **Relatório de Passagens** — consulta por período, local e equipamento
- **Rastreamento de Placas** — histórico de um veículo específico
- **Monitoramento Online** — visualização em tempo real
- **Mapeamento de Rotas** — trajetória no mapa
