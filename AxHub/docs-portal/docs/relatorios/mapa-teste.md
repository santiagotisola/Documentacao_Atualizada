---
sidebar_position: 6
title: Mapa de Teste
description: Relatório de testes de captura dos Equipamentos
---

# Mapa de Teste

Relatório que exibe os resultados dos testes realizados nos Equipamentos para Validação de captura, leitura de placa e conformidade da imagem, apresentados em formato de mapa de acertos.

Relatório de Mapa de Teste de Equipamentos](../img/relatorio-mapa-teste.png)

## Como acessar

**Menu lateral** → Relatórios → **Mapa de Teste**

## Dados do Relatório

O mapa de teste exibe os resultados dos registros com `Homologacao = 1` em `TBInfracoes` e `TBOperacoes`, permitindo validar a qualidade de captura antes da homologação oficial.

### Fonte de dados: `TBPassagens` + `TBInfracoes`

| Campo usado | Origem | Descrição |
|------------|--------|-----------|
| **Placa Veículo | `TBPassagens.PlacaVeiculo` | Placa lida no teste |
| **Erro OCR** | `TBInfracoes.ErroOcr` | Indica se houve falha na leitura |
| **Velocidade Medida** | `TBPassagens.VelocidadeMedida` | Velocidade no momento |
| **Data Hora Passagem** | `TBPassagens.DataHoraPassagem` | Momento da passagem de teste |
| **Homologacao** | `TBInfracoes.Homologacao` | Flag que identifica registros de teste |

## Operação em modo Homologação

Quando `TBOperacoes.Homologacao = 1`, todas as Infrações geradas são marcadas como `Homologacao = 1` em `TBInfracoes`. Essas Infrações **não são exportadas** para o órgão autuador e ficam disponíveis apenas no mapa de teste.

## Integrações

| Tabela | Campo | Descrição |
|--------|-------|-----------|
| `TBOperacoes` | `Homologacao` | Operação em modo de teste |
| `TBInfracoes` | `Homologacao` | Infrações de teste isoladas das reais |
| `TBFaixas` | `Latitude`, `Longitude` | Posição geográfica no mapa |
