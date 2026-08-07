---
title: "Infração de Trânsito"
sidebar_position: 2
description: "O que é infração no AxHub — classificação, fluxo e base legal"
---

# Infração de Trânsito

Ato de inobservância à legislação de trânsito. No AxHub, a infração é **gerada automaticamente** pelo equipamento (radar, OCR) e passa pelo fluxo de triagem e auditoria antes de ser exportada.

**Base legal:** Art. 161 do CTB (Lei 9.503/1997)

## Ciclo no AxHub

```
Equipamento captura → Triagem → Auditoria → Lote → Exportação
```

## Classificação por gravidade

| Gravidade | Pontos CNH | Valor base | Exemplo |
|-----------|:----------:|------------|---------|
| **Leve** | 3 | R$ 88,38 | Estacionar em local proibido |
| **Média** | 4 | R$ 130,16 | Não usar cinto |
| **Grave** | 5 | R$ 195,23 | Ultrapassar sinal vermelho |
| **Gravíssima** | 7 | R$ 293,47+ | Excesso de velocidade grave |

## Status da infração

| Status | Descrição |
|--------|-----------|
| **Capturada** | Registrada pelo equipamento |
| **Triada** | Validada pelo operador |
| **Auditada** | Aprovada pela supervisão |
| **Exportada** | Enviada ao órgão autuador |
| **Descartada** | Rejeitada na triagem |

## Prazos legais

| Etapa | Prazo |
|-------|:-----:|
| Expedir o AIT | Até 30 dias após a infração |
| Notificar o infrator | Até 30 dias após expedição |
| Prazo para recurso | 30 dias após notificação |

**Base:** Art. 281 do CTB

## Base legal

- **Art. 161 do CTB** — Define infração de trânsito como todo ato omissivo ou comissivo que contrariar preceito do CTB
- **Art. 256 do CTB** — Penalidades aplicáveis
- **Resolução CONTRAN 619/2016** — Fiscalização eletrônica e validade do AIT

## Como a infração eletrônica é gerada

No AxHub, a infração é gerada quando:
1. Equipamento detecta velocidade acima do limite + tolerância
2. OCR lê a placa corretamente
3. Imagens obrigatórias são capturadas
4. Aferição INMETRO do equipamento está válida

## Erros comuns que invalidam uma infração

| Problema | Consequência | Prevenção |
|----------|-------------|----------|
| Aferição vencida | Auto contestado e anulado | Monitorar vencimentos no Dashboard |
| Placa ilegível | Recurso aceito | Revisar OCR na triagem |
| Enquadramento incorreto | Anulação em julgamento | Verificar configuração de velocidade |
| AIT emitido após 30 dias | Prescrição | Monitorar backlog de triagem |
| Imagem obrigatória ausente | Recurso aceito | Configurar tipos de imagem corretos |

## Tabela de referência — gravidade e penalidades

| Gravidade | Pontos CNH | Valor base | Exemplos |
|-----------|:----------:|:----------:|----------|
| Leve | 3 | R$ 88,38 | Estacionar em local proibido |
| Média | 4 | R$ 130,16 | Não usar cinto |
| Grave | 5 | R$ 195,23 | Ultrapassar sinal vermelho |
| Graviíssima (1x) | 7 | R$ 293,47 | Excesso de velocidade > 20% |
| Graviíssima (3x) | 7 | R$ 880,41 | Reincidência grave |

:::warning
Infrações geradas por equipamentos com aferição vencida são automaticamente bloqueadas e não podem ser exportadas.
:::- **Art. 280 do CTB** — Regula a lavratura do Auto de Infração de Trânsito (AIT)
- **Art. 281 do CTB** — Estabelece os prazos para expedição do AIT e notificação ao infrator
- **Resolução CONTRAN 619/2016** — Define os procedimentos para fiscalização eletrônica

## Relacionado

- [Triagem](./triagem) — Processo de validação
- [Autuação](./autuacao) — Registro formal do ato infracional
- [Enquadramento](./enquadramento) — Classificação legal da infração
- [Consulta de Infrações](../infracoes/consulta-infracoes) — Histórico de infrações no sistema

## Perguntas frequentes

**O que invalida uma infração eletrônica?**
As principais causas são: aferição vencida, placa ilegível, enquadramento incorreto, AIT emitido após 30 dias e imagem obrigatória ausente. Cada um desses problemas dá embasamento para recurso aceito pelo órgão julgador.

**Qual a diferença entre infração e notificação de infração?**
A infração é o fato (ato infracional registrado). A notificação é o documento enviado ao proprietário do veículo comunicando que sua placa foi autuada. No AxHub, o sistema gera a infração; o órgão autuador emite a notificação.

**Infrações descartadas na triagem impactam as métricas do contrato?**
Sim. A taxa de descarte é monitorada no Dashboard e nos relatórios de processamento. Alta taxa de descarte pode indicar problemas nos equipamentos ou impactar métricas de aproveitamento do contrato.

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Infrações — Triagem](../infracoes/triagem)** | A triagem é o processo de validação de cada infração registrada; sem triagem a infração não avança para exportação |
| **[Enquadramento](./enquadramento)** | O enquadramento define o artigo CTB aplicável a cada tipo de infração; é a base legal da infração gerada |
| **[Autuação](./autuacao)** | A autuação é o ato formal que formaliza a infração; o AxHub gera infrações que são exportadas ao órgão autuador para autuação |
| **[Exportação de Infrações](../infracoes/exportacao)** | Infrações validadas e auditadas são exportadas em lotes ao órgão autuador para emissão do Auto de Infração de Trânsito |

## Contexto operacional

No dia a dia do operador, a **infração** é o ponto central de todas as atividades do AxHub. Cada imagem capturada pelo equipamento é uma infração em potencial que precisa ser analisada na triagem: a placa é legível? O enquadramento está correto? A imagem é suf iciente para embasar o auto? Essas decisões, feitas em 15-30 segundos cada uma, determinam a qualidade do lote exportado ao órgão.

Para o supervisor, acompanhar o pipeline de infrações — **Pendente → Triada → Auditada → Exportada** — é a tarefa mais crítica: backlog alto na triagem significa risco de prescrição (Art. 281 CTB); alta taxa de descarte pode indicar problema no equipamento; baixa taxa pode indicar aprovação sem critério.

Para o gestor, cada infração exportada é uma unidade de receita para o contrato e de conformidade legal. A rastreabilidade completa de cada auto — desde a captura até o aceite do órgão — é a prova de qualidade que embasa pagamentos e defende o contrato em auditorias.
