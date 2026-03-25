---
sidebar_position: 2
title: Auditoria
description: Auditoria de infrações validadas e descartadas na triagem
---

# Auditoria

A tela de Auditoria permite que auditores revisem as infrações que foram validadas ou descartadas na etapa de triagem, garantindo a qualidade do processo antes da exportação para os órgãos autuadores.

![Tela de Auditoria](../img/triagem-auditoria.png)

## Como acessar

**Menu lateral** → Infrações → **Auditoria**

## Tipos de auditoria

| Tipo | Descrição |
|------|-----------|
| **Auditoria de Válidas** | Revisar infrações aprovadas pelo analista na triagem |
| **Auditoria de Descartadas** | Revisar infrações descartadas pelo analista na triagem |

## Filtros avançados

![Filtro de Auditoria](../img/triagem-filtro-auditoria.png)

| Filtro | Descrição |
|--------|-----------|
| **Faixa de data** | Período a ser auditado |
| **Equipamento** | Auditar equipamento específico |
| **Tipo de infração** | Velocidade, sinal, faixa exclusiva, etc. |
| **Analista responsável** | Auditar trabalho de analista específico |
| **Amostragem (%)** | Percentual de infrações a auditar (ex: 10%, 25%, 100%) |

## Fluxo de trabalho

1. O sistema apresenta a infração com todas as imagens e dados da triagem
2. O auditor analisa e decide:
   - ✅ **Confirma** — infração correta, segue para exportação
   - ❌ **Rejeita** — devolve para triagem com observação
   - 📝 **Adiciona observações** — registra comentários sem alterar o status
3. O contador de tempo controla a produtividade (configurado em **Configurações do Sistema → aba Triagem**)
4. O status é atualizado automaticamente após cada decisão

:::warning Impacto nas métricas
As decisões de auditoria alimentam os relatórios de qualidade e produtividade. Rejeições freqüentes do mesmo analista devem ser investigadas.
:::

## Termos Tecnicos

| Termo | Definicao |
|-------|-----------|
| [Triagem](../glossario/triagem) | Ver definicao no glossario |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Etapa anterior | [Triagem](./triagem) | Validacao inicial das infracoes |
| Proxima etapa | [Exportacao](./exportacao) | Gerar lote para envio ao orgao |
| Consulta | [Consulta de Infracoes](./consulta-infracoes) | Buscar infracoes |
| Glossario | [Autuacao](../glossario/autuacao) | Ato administrativo de registro |
| Glossario | [Infracao](../glossario/infracao) | Definicao tecnica |
