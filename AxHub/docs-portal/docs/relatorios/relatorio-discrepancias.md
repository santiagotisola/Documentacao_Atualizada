---
sidebar_position: 3
title: Relatório de Discrepâncias
description: Relatório de discrepâncias identificadas no processamento
---

# Relatório de Discrepâncias

Identifica e exibe discrepâncias entre os dados registrados pelos Equipamentos e os dados esperados pelo sistema. Utilizado pela equipe técnica para auditar a qualidade dos registros e detectar problemas operacionais.

Relatório de Discrepâncias](../img/Relatorio%20-%20Relatorio%20de%20discrepancias.png)

## Como acessar

**Menu lateral** → Relatórios → Relatório de Discrepâncias**

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Período** | Faixa de datas |
| Equipamento | Filtrar por Equipamento |
| **Tipo de Discrepância** | Velocidade, placa, imagem, data/hora |
| **Operação** | Filtrar por operação vinculada |

## Tipos de Discrepância

| Tipo | Descrição |
|------|-----------|
| **Velocidade** | Velocidade registrada fora do intervalo esperado para o local |
| **Placa ilegível** | OCR não identificou a placa com confiança mínima |
| **Imagem ausente** | Infração sem imagem associada no prazo configurado |
| **Data/Hora inconsistente** | Registro com timestamp incoerente com o período da operação |
| **Sequencial duplicado** | Dois registros com o mesmo número sequencial |

## Campos exibidos

| Coluna | Descrição |
|--------|-----------|
| **Data/Hora** | Momento do registro |
| **Tipo** | Categoria da discrepancia |
| **Equipamento** | Equipamento envolvido |
| **Valor registrado** | Dado inconsistente capturado |
| **Acao recomendada** | Sugestão do sistema |

:::warning
Discrepancias não tratadas comprometem a qualidade dos lotes exportados. Revise diariamente antes de gerar novos lotes.
:::

## Relacionado

- [Falhas Sequenciais](./falhas-sequenciais)
- [Processamento de Imagens](./processamento-imagens)

| Equipamento | Equipamento que gerou a discrepância |
| **Tipo** | Categoria da discrepância |
| **Descrição** | Detalhamento do problema identificado |
| **Auto de Infração | Número do auto relacionado (quando aplicável) |
| **Status** | Pendente de revisão ou Resolvida |

## Exportação

Exportável em **Excel** para acompanhamento de pendências técnicas e registro em planos de ação.

---

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Relacionado | [Auditoria](../infracoes/auditoria) | Revisão de Infrações |
| Relacionado | [Triagem](../infracoes/triagem) | Origem das discrepâncias |
| Relacionado | [Equipamentos](../cadastros-basicos/Equipamentos) | Cadastro do Equipamento |
