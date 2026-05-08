---
sidebar_position: 2
title: Consulta
description: Consulta de registros de cronotacógrafo
---

# Consulta de Cronotacógrafo

Permite consultar o histórico de registros de cronotacógrafo processados pelo sistema, com detalhes de placa, velocidade, status de verificação e resultado da consulta ao banco de certificados.

![Histórico Cronotacógrafo](../img/Cronotacógrafo%20-%20Triagem%20-%20historico.png)

## Como acessar

**Menu lateral** → Cronotacógrafo → **Consulta**

## O que é verificado

A cada registro de cronotacógrafo, o sistema verifica:

1. **Validade do certificado** — se o certificado do aparelho está dentro do prazo
2. **Regularidade do condutor** — se o tempo de jornada está dentro do limite legal
3. **Integridade do lacre** — se o equipamento não foi adulterado

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Período** | Faixa de datas |
| **Placa** | Filtrar por placa do veículo |
| **Equipamento** | Filtrar por equipamento de fiscalização |
| **Status** | Processado, Pendente, Descartado, Irregular |

## Campos do resultado

| Coluna do Resultado | Descrição |
|---------------------|-----------|
| **Data/Hora** | Momento do registro |
| **Placa** | Placa do veículo |
| **Equipamento** | Equipamento que registrou |
| **Velocidade** | Velocidade registrada |
| **Status Cronotacógrafo** | `Regular`, `Irregular`, `Vencido`, `NaoEncontrado` |
| **Status Processamento** | `Processado`, `Pendente`, `Descartado` |
| **Infração Gerada** | Número do auto (quando houver infração) |

## Status do Cronotacógrafo

| Status | Significado |
|--------|-------------|
| **Regular** | Certificado válido, jornada dentro do limite |
| **Irregular** | Violação de jornada detectada |
| **Vencido** | Certificado expirado |
| **NaoEncontrado** | Placa não localizada no banco de dados de certificados |

## Exportação

Exportável em **Excel** para análise e inclusão em autos de infração administrativos.

---

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Anterior | [Triagem](./triagem) | Processo de triagem de registros |
| Glossário | [Cronotacógrafo](../glossario/cronotacografo) | Definição técnica e base legal |
