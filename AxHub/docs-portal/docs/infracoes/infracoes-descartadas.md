---
sidebar_position: 6
title: Infrações Descartadas
description: Consulta e revisão de infrações descartadas no processamento
---

# Infrações Descartadas

As infrações descartadas são consultadas diretamente pela tela de **Consulta de Infrações**, utilizando o filtro de **Status de Processamento = Descartada**. Não existe uma tela exclusiva para infrações descartadas — o fluxo é unificado na consulta.

## Como acessar

**Menu lateral** → Infrações → **Consulta** → filtrar por **Status Processamento: Descartada**

Ou acesse diretamente: `/consultainfracao`

## Filtros disponíveis na Consulta

| Filtro | Descrição |
|--------|-----------|
| **Status Processamento** | Selecione **Descartada** para ver apenas as descartadas |
| **Motivo Descarte** | Filtrar pelo motivo do descarte |
| **Grupo de Equipamentos** | Filtrar por grupo (ex: IMEPI-OCR) |
| **Equipamento** | Ponto de fiscalização específico |
| **Período** | Faixa de datas |

## Status de Processamento disponíveis

| Status | Descrição |
|--------|-----------|
| Triagem | Aguardando triagem manual |
| Classificação | Em processo de classificação |
| Reavaliar | Marcada para reavaliação |
| Consultar | Em consulta ao SERPRO/webservice |
| Processada | Processamento concluído |
| **Descartada** | Descartada na triagem, auditoria ou por exceção automática |
| Auditar | Aguardando auditoria |
| Homologada | Auditada e homologada |

## Funcionalidades

- Consultar infrações descartadas por analista, equipamento e período
- Visualizar motivo do descarte e observações
- Exportar relatório de descartadas

:::info
Infrações descartadas por **exceção automática** também aparecem com status "Descartada", identificadas pelo motivo configurado na regra de exceção. Veja [Exceções](./excecoes) para configurar regras de descarte automático.
:::

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Origem | [Consulta de Infrações](./consulta-infracoes) | Tela principal de consulta |
| Origem | [Triagem](./triagem) | Infrações descartadas durante a triagem |
| Relacionado | [Exceções](./excecoes) | Regras de descarte automático |
| Configuracao | [Motivos de Descarte](../administracao/motivos-descartes) | Lista de motivos disponíveis |
