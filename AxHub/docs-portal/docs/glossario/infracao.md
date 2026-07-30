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

## Relacionado

- [Triagem](./triagem)
- [Autuação](./autuacao)
- [Enquadramento](./enquadramento)

|--------|-----------|
| **Capturada** | Gerada pelo equipamento |
| **Em triagem** | Aguardando validação |
| **Em auditoria** | Validada, aguardando aprovação |
| **Aprovada** | Pronta para exportação |
| **Descartada** | Rejeitada na triagem/auditoria |
| **Exportada** | Enviada ao órgão autuador |

## Relacionados

- [Triagem](./triagem) — Processo de validação
- [Auditoria](../infracoes/auditoria) — Aprovação final
- [Enquadramento](./enquadramento) — Classificação legal


## Uso no Sistema AxHub

O sistema AxHub captura automaticamente evidencias de infracoes atraves de Equipamentos metrologicos (radares, cameras OCR, balancas). Cada registro passa pelo fluxo: **Captura - Triagem - Auditoria - Exportacao**.

## Paginas Relacionadas

- [Triagem de Infracoes](../infracoes/triagem)
- [Consulta de Infracoes](../infracoes/consulta-infracoes)
- [Infracoes Descartadas](../infracoes/infracoes-descartadas)
- [Enquadramento](./enquadramento)
