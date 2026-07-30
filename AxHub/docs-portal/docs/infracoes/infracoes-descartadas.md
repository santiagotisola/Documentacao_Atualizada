---
sidebar_position: 6
title: Infrações Descartadas
description: Consulta e revisão de Infrações descartadas no processamento
---

# Infrações Descartadas

As Infrações descartadas são consultadas diretamente pela tela de **Consulta de Infrações utilizando o filtro de **Status de Processamento = Descartada**. Não existe uma tela exclusiva para Infrações descartadas — o fluxo é unificado na consulta.

## Como acessar

**Menu lateral** → Infrações → **Consulta** → filtrar por **Status Processamento: Descartada**

Ou acesse diretamente: `/consultainfracao`

## Filtros disponíveis na Consulta

| Filtro | Descrição |
|--------|-----------|
| **Status Processamento** | Selecione **Descartada** para ver apenas as descartadas |
| **Motivo Descarte** | Filtrar pelo motivo do descarte |
| **Grupo de Equipamentos | Filtrar por grupo (ex: IMEPI-OCR) |
| Equipamento | Ponto de fiscalização específico |
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

- Consultar Infrações descartadas por analista, Equipamento e período
- Verificar o motivo de descarte por analista
- Identificar padrões de qualidade por equipamento

:::tip
Use este relatório regularmente para avaliar a qualidade de captura dos equipamentos. Alta taxa de descarte em um equipamento pode indicar necessidade de calibração ou limpeza.
:::

## Casos de uso

- **Análise de qualidade** — identifique equipamentos com alta taxa de descarte para direcionar manutenção preventiva
- **Auditoria de motivos** — verifique se os operadores estão usando os motivos corretos e não genéricos
- **Conformidade de exceções** — confirme que descartes automáticos por exceção estão aplicando a regra correta
- **Capacitação de equipe** — use os dados de descarte por operador para identificar necessidades de treinamento

## Relacionado

- [Triagem](./triagem)
- [Motivos de Descarte](../administracao/motivos-descartes)
- [Processamento por Usuário](../relatorios/processamento-por-usuario)
- Visualizar motivo do descarte e observações
- Exportar Relatório de descartadas

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
