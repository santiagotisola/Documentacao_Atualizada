---
sidebar_position: 2
title: Triagem
description: Revisão e validação de infrações
---

# Triagem — Infrações

Permite revisar, validar ou descartar infrações pendentes antes da exportação para os órgãos autuadores.

## Como acessar

**Menu lateral** → Infrações → **Triagem**

![Menu principal da Triagem](../img/triagem-menu-principal.png)

## Tela principal

![Consultar Infrações](../img/triagem-consultar-infracoes.png)

## Campos exibidos

| Campo | Descrição |
|-------|-----------|
| **Número Auto** | Identificador único da infração |
| **Placa Veículo** | Placa do veículo infrator |
| **Data/Hora** | Momento da infração |
| **Imagem** | Foto capturada pelo equipamento |
| **Velocidade Medida** | Velocidade capturada |
| **Velocidade Considerada** | Velocidade após tolerância |
| **Velocidade Regulamentada** | Velocidade permitida no local |
| **Tipo Infração** | Tipo de infração registrada |
| **Status Triagem** | `Pendente` · `Validada` · `Descartada` |
| **Motivo Descarte** | Motivo informado ao descartar |
| **Operador** | Usuário que realizou a triagem |

## Filtros disponíveis

![Filtros de Triagem](../img/triagem-filtro-auditoria.png)

| Filtro | Descrição |
|--------|-----------|
| **Período** | Data/Hora da infração |
| **Status Triagem** | Estado atual da triagem |
| **Tipo Infração** | Tipo de infração |
| **Operação** | Operação vinculada |

## Resultado da consulta

![Resultado da Consulta](../img/triagem-consultar-resultado.png)

## Ações disponíveis

| Ação | Descrição |
|------|-----------|
| **Validar** | Confirma a infração para exportação |
| **Descartar** | Rejeita com motivo obrigatório |
| **Reabrir** | Reabre infração descartada para nova análise |

## Infrações descartadas

![Consultar Infrações Descartadas](../img/triagem-infracoes-descartadas.png)

## Auditoria

![Auditoria](../img/triagem-auditoria.png)

![Filtro Auditoria](../img/triagem-filtro-auditoria.png)

## Exceções

![Exceções](../img/triagem-excecoes.png)

## Exportação

![Exportação](../img/triagem-exportacao.png)

## Integrações

| Tabela | Descrição |
|--------|-----------|
| `TBInfracoes` | Registro principal da infração |
| `TBTriagens` | Registro da triagem realizada |
| `TBMotivosDescarte` | Motivos disponíveis para descarte |
| `TBUsuarios` | Operador que realizou a triagem |
