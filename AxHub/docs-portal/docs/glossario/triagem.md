---
title: "Triagem"
sidebar_position: 8
description: "O que é triagem no AxHub — processo, responsabilidades e boas práticas"
---

# Triagem

Processo de **análise preliminar** das infrações capturadas automaticamente, onde o operador valida a qualidade da evidência, confirma os dados do veículo e define o enquadramento aplicável.

**Base legal:** Resolução CONTRAN 619/2016, Art. 8º

## O que o triador verifica

| Elemento | O que verificar |
|----------|-----------------|
| **Imagem** | Placa legível e veículo visível |
| **Placa** | Leitura OCR correta |
| **Enquadramento** | Artigo CTB aplicável |
| **Data/Hora** | Registro coerente |
| **Equipamento** | Aferição INMETRO válida |

## Decisões disponíveis

| Decisão | Quando tomar |
|---------|-------------|
| **Confirmar** | Evidência válida, enquadramento correto |
| **Descartar** | Imagem ilegível, placa incorreta, enquadramento inválido |
| **Editar** | Placa ou dados incorretos — corrigir antes de confirmar |

## Relacionado

- [Autuação](./autuacao)
- [Enquadramentos](../administracao/enquadramentos)
- [Motivos de Descarte](../administracao/motivos-descartes)


## Boas práticas

- Manter defasagem de triagem abaixo de 24h
- Não aprovar infrações com placa ilegível — o auto pode ser contestado
- Registrar o motivo de descarte para análise estatística

## Produtividade recomendada

| Analista | Infrações/hora |
|----------|:--------------:|
| Sênior | 120 |
| Pleno | 80 |
| Trainee | 40 |

## Erros comuns

| Erro | Impacto | Prevenção |
|------|---------|----------|
| Aprovar com placa errada | Auto inválido | Verificar OCR |
| Descartar sem motivo | Sem rastreabilidade | Sempre selecionar motivo |
| Backlog alto | Prescrição das infrações | Redistribuir analistas |


## Tempo médio por infração

| Analista experiente | Analista em treinamento |
|:-------------------:|:-----------------------:|
| 15-30 segundos | 45-90 segundos |

## Fluxo da triagem

```
Infração capturada pelo equipamento
    ↓
Entra na fila de triagem
    ↓
Analista analisa imagem + dados
    ↓
    ├─ Confirmar → Aguarda auditoria
    ├─ Descartar (com motivo) → Arquivada
    └─ Editar placa → Confirmar → Aguarda auditoria
```

## Erros comuns

| Erro | Impacto | Prevenção |
|------|---------|----------|
| Aprovar com placa errada | Auto inválido | Verificar OCR antes de confirmar |
| Descartar sem motivo | Perde rastreabilidade | Sempre selecionar motivo |
| Aprovar sem imagens | Rejeição pelo órgão | Verificar tipos de imagem obrigatórios |
- Descartar sempre com motivo específico (afeta o Dashboard)
- Em dúvida sobre enquadramento, consultar o supervisor

## Perguntas frequentes

**Qual o prazo máximo para triar uma infração?**
O sistema possui um prazo configurável (padrão: 20 dias) em **Configurações do Sistema → Aba Triagem**. Infrações não triadas após 30 dias da captura estão sujeitas à prescrição legal (Art. 281 CTB).

**O que fazer quando há acumulo (backlog) de infrações para triar?**
Redistribua as demandas entre analistas, priorize infrações mais antigas e monitore diariamente o painel de **Processamento por Usuário** para garantir que o backlog diminua antes do prazo legal.

**Posso reverter uma infração descartada na triagem?**
Sim, mas somente até a etapa de auditoria. Infrações descartadas podem ser recuperadas por um auditor ou supervisor acessando **Infrações → Infrações Descartadas** e revertendo o descarte.

## Integração com outros módulos

| Módulo | Como usa este cadastro/relatório |
|--------|----------------------------------|
| **Auditoria** | Processo imediatamente posterior à triagem — infrações aprovadas pelo triador seguem para revisão do auditor |
| **Motivos de Descarte** | Configura as opções de motivo exibidas ao descartar; manter motivos precisos garante rastreabilidade estatística |
| **Processamento por Usuário** | Relatório que mede a produtividade individual de triagem (infrações/hora, taxa de descarte) por analista |
| **Configurações do Sistema** | Define o prazo máximo para triar antes da prescrição legal e os parâmetros de backlog exibidos no Dashboard |

## Relacionados

- [Triagem de Infrações](../infracoes/triagem) — Tela de triagem
- [Auditoria](../infracoes/auditoria) — Etapa seguinte


## Uso no Sistema AxHub

Acessivel em **Infracoes - Triagem**. E a etapa central do fluxo operacional. O operador analisa a imagem, válida os dados (placa, velocidade, faixa), define o enquadramento e encaminha para auditoria ou descarta com motivo justificado.

## Paginas Relacionadas

- [Triagem de Infracoes](../infracoes/triagem)
- [Excecoes](../infracoes/excecoes)
- [Auditoria](../infracoes/auditoria)
- [Motivos de Descarte](../administracao/motivos-descartes)
- [Enquadramento](./enquadramento)

## Contexto operacional

A **triagem** é o momento em que a qualidade de cada infração é determinada antes do envio ao órgão autuador. Do ponto de vista do operador, cada infração representa uma decisão: confirmar (encaminhar para auditoria), editar (corrigir placa ou enquadramento) ou descartar (rejeitar com motivo documentado). A qualidade dessas decisões impacta diretamente a taxa de aceite do lote pelo órgão.

Para o supervisor, o painel de **Processamento por Usuário** mostra a produtividade e a taxa de descarte de cada analista. Taxas fora da faixa esperada (5-15% de descarte) são sinais de alerta: muito alta indica treinamento insuficiente; muito baixa indica possível aprovação sem critério adequado.

Para o gestor, o acumulo de backlog de triagem é um risco contratual direto: infrações capturadas há mais de 30 dias sem triar estão sujeitas à prescrição pelo Art. 281 do CTB. Manter o backlog abaixo de 24 horas é a regra operacional mais crítica do fluxo de infrações.
