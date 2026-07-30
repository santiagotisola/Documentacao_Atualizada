---
title: "Autuação"
sidebar_position: 4
description: "O que é autuação no AxHub — processo, base legal e tipos de auto"
---

# Autuação

Ato administrativo pelo qual um agente de trânsito ou equipamento eletrônico **registra formalmente a ocorrência de uma infração**, gerando o Auto de Infração de Trânsito (AIT).

**Base legal:** Art. 280 do CTB — Resolução CONTRAN 619/2016

## Tipos de autuação

| Tipo | Descrição |
|------|-----------|
| **Eletrônica** | Gerada automaticamente por radar/câmera OCR (AxHub) |
| **Pessoal** | Lavrada por agente de trânsito em campo |
| **Mista** | Equipamento identifica + agente confirma |

## Fluxo de autuação eletrônica no AxHub

```
Equipamento captura infração
       ↓
   OCR lê a placa
       ↓
   Triagem pelo operador
       ↓
   Enquadramento confirmado
       ↓
   Inclusão no lote de exportação
       ↓
   Envio ao órgão autuador
```

## Relacionado

- [Triagem](./triagem)
- [Enquadramentos](../administracao/enquadramentos)
- [Lote de Exportação](./lote-exportacao)

   OCR lê a placa
       ↓
   Triagem (operador valida)
       ↓
   Auditoria (supervisor aprova)
       ↓
   Exportação ao órgão autuador
       ↓
   AIT emitido com validade legal
```

## O que é exigido para validade

- Equipamento com **aferição INMETRO válida**
- Imagem com **placa legível**
- **Enquadramento** correto
- Triagem e auditoria aprovadas

## Relacionados

- [Infração](./infracao) — O que gera o auto
- [Enquadramento](./enquadramento) — Classificação legal
- [Aferição](./afericao) — Pré-requisito do equipamento


## Uso no Sistema AxHub

No AxHub, a autuacao ocorre ao final do fluxo de triagem, quando o operador confirma a validade da Use Infração (com acento) O sistema gera o registro no formato exigido pelo orgao autuador. As **Formas de Autuacao** sao configuradas em Administracao.

## Paginas Relacionadas

- [Formas de Autuacao](../administracao/formas-autuacao)
- [Triagem de Infracoes](../infracoes/triagem)
- [Exportacao](../infracoes/exportacao)
- [Infracao](./infracao)
