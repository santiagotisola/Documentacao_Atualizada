---
sidebar_position: 1
title: Visão Geral
description: Fluxo completo de triagem e auditoria de infrações
---

# Triagem e Auditoria

O módulo de triagem e auditoria é o coração do processamento de infrações no AxHub. Aqui, analistas revisam as infrações detectadas automaticamente, validando ou descartando cada uma.

## Fluxo de processamento

```
Importação → Triagem → Auditoria → Exportação
```

1. **Importação** — Imagens e dados chegam dos equipamentos
2. **Triagem** — Analista verifica placa, veículo e condições da infração
3. **Auditoria de Válidas** — Auditor revisa as infrações aprovadas na triagem
4. **Auditoria de Descartadas** — Auditor revisa as infrações descartadas na triagem
5. **Exportação** — Infrações validadas são exportadas para os órgãos autuadores

## Papéis

| Papel | Descrição |
|-------|-----------|
| **Analista de Triagem** | Realiza a primeira análise das infrações |
| **Auditor de Válidas** | Revisa infrações aprovadas pelo analista |
| **Auditor de Descartadas** | Revisa infrações descartadas pelo analista |
| **Supervisor** | Acesso completo a todos os estágios do fluxo |

## Motivos de descarte

As infrações podem ser descartadas por diversos motivos configuráveis, como:
- Placa ilegível
- Imagem com qualidade insuficiente
- Veículo oficial/emergência
- Erro do equipamento
- Exceção cadastrada

:::note Em construção
As telas detalhadas de triagem e auditoria serão documentadas em breve.
:::
