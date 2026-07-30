---
sidebar_position: 12
title: Sequenciais de Lote de Exportação
description: Controle dos sequenciais numéricos dos lotes de exportação no AxHub
---

# Sequenciais de Lote de Exportação

Configura e monitora os **sequenciais dos lotes de exportação** de infrações. Cada lote recebe um número sequencial que deve ser único e continuo para validação pelo órgão autuador.

## Como acessar

**Menu lateral** → Configurações → **Sequenciais de Lote de Exportação**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Órgão** | Sim | Órgão destinatário do lote |
| **Sequencial Atual** | Sim | Número do último lote exportado |
| **Próximo** | Automático | Calculado pelo sistema |

## Diferença entre sequenciais de infração e de lote

| Tipo | O que numera |
|------|--------------|
| **Sequencial de Infração** | Cada auto de infração individualmente |
| **Sequencial de Lote** | Cada envio (lote) ao órgão |

## Boas práticas

- Registre no sistema o sequencial após cada envio manual
- Não reutilize sequenciais de períodos anteriores
- Comunique ao órgão autuador ao reiniciar a numeração

:::warning
Lotes com sequencial duplicado ou fora de ordem são rejeitados pelo órgão. Verifique o Relatório de Falhas de Sequenciais antes de cada exportação.
:::

## Impacto operacional

Sequenciais incorretos geram rejeição de lotes inteiros, exigindo reenvio. O impacto pode incluir:
- Atraso no processamento de multas
- Risco de prescrição (prazo de 30 dias)
- Relação contratual comprometida

## Relacionado

- [Sequenciais de Infrações](./sequenciais-infracoes)
- [Falhas de Sequenciais](../relatorios/falhas-sequenciais)

- Verificar seqüencial antes de cada nova exportação

## Navegação Relacionada

| Tipo | Página |
|------|--------|
| Relacionado | [Lote de Exportação](../infracoes/exportacao) |
| Relacionado | [Sequenciais de Infrações](./sequenciais-infracoes) |

| **Formato** | Layout do arquivo de exportação |
| **Status** | Ativo, Esgotado |

:::note Sem screenshot
está tela ainda não possui screenshot cadastrada. Será adicionada em breve.
:::

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Exportacao](../infracoes/exportacao) | Controle de lote |
| Glossario | [Lote de Exportacao](../glossario/lote-exportacao) | Definicao |
