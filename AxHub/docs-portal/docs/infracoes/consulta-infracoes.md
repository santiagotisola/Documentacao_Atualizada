---
sidebar_position: 5
title: Consulta de Infrações
description: Consultar infrações processadas no sistema
---

# Consulta de Infrações

A tela de consulta de infrações permite pesquisar e visualizar todas as infrações registradas no sistema, com filtros por período, equipamento, status e outros critérios.

![Tela de Consulta de Infrações](../img/triagem-consultar-infracoes.png)

## Como acessar

**Menu lateral** → Infrações → **Consulta**

## Funcionalidades

- Consultar infrações por período, equipamento, faixa e status
- Visualizar detalhes da infração (imagens, dados do veículo, enquadramento)
- Acompanhar status do processamento
- Exportar resultados para Excel

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Período** | Data inicial e final de detecção da infração |
| **Equipamento** | Filtrar por ponto de fiscalização |
| **Placa** | Busca por placa exata ou parcial |
| **Status** | Aguardando Triagem, Válida, Descartada, Exportada, etc. |
| **Operação** | Velocidade, sinal, faixa exclusiva, etc. |
| **Usuário** | Analista ou auditor responsável |

## Status das infrações

| Status | Descrição |
|--------|-----------|
| **Aguardando Triagem** | Infração aguardando análise do triador |
| **Em Triagem** | Infração sendo analisada |
| **Válida** | Infração aprovada na triagem |
| **Descartada** | Infração descartada na triagem |
| **Auditoria** | Infração em processo de auditoria |
| **Exportada** | Infração enviada ao órgão autuador |

## Resultado da consulta

![Resultado da Consulta de Infrações](../img/triagem-consultar-resultado.png)

Após aplicar os filtros e clicar em **Pesquisar**, a grade de resultados exibe cada infração com:

| Coluna | Descrição |
|--------|-----------|
| **Data/Hora** | Momento em que a infração foi detectada |
| **Equipamento** | Código do equipamento que registrou a infração |
| **Placa** | Placa do veículo infrator (lida por OCR) |
| **Velocidade Medida / Permitida** | Velocidade no momento vs. limite da via |
| **Enquadramento** | Artigo do CTB que ampara a infração |
| **Status** | Situação atual no fluxo de processamento |
| **Analista** | Responsável pela triagem |
| **Auditor** | Responsável pela auditoria |

Clique em qualquer linha para abrir os detalhes completos da infração, incluindo as imagens capturadas.

## Termos Tecnicos

| Termo | Definicao |
|-------|-----------|
| [Enquadramento](../glossario/enquadramento) | Ver definicao no glossario |
| [Infracao de Transito](../glossario/infracao) | Ver definicao no glossario |
| [Triagem](../glossario/triagem) | Ver definicao no glossario |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Fluxo | [Triagem](./triagem) | Etapa inicial do fluxo |
| Fluxo | [Auditoria](./auditoria) | Etapa de revisao |
| Fluxo | [Exportacao](./exportacao) | Etapa de envio |
| Fluxo | [Infracoes Descartadas](./infracoes-descartadas) | Registros descartados |
| Glossario | [Infracao](../glossario/infracao) | Definicao tecnica |
