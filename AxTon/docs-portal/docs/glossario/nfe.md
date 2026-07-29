---
sidebar_position: 3
title: "NF-e (Nota Fiscal Eletrônica)"
description: "O que é NF-e no AxTon — rastreabilidade fiscal e integração com pesagem"
---

# NF-e — Nota Fiscal Eletrônica

Documento fiscal digital obrigatório que acompanha o transporte de mercadorias. O AxTon captura automaticamente as chaves NF-e dos veículos em trânsito para garantir rastreabilidade fiscal.

**Base legal:** Ajuste SINIEF 07/2005 — Lei 8.137/90

## Como o AxTon usa a NF-e

| Ação | Descrição |
|------|----------|
| **Captura automática** | OCR lê a placa e consulta SEFAZ |
| **Vinculação** | Associa NF-e ao registro de pesagem |
| **Validação** | Verifica validade e dados do transporte |
| **Alerta** | Gera alerta se NF-e ausente ou inválida |

## Campos capturados

| Campo | Descrição |
|-------|-----------|
| **Chave de acesso** | 44 dígitos — identificador único |
| **Emitente** | CNPJ do remetente da mercadoria |
| **Destinatário** | CNPJ do destinatário |
| **Valor total** | Valor da nota fiscal |
| **Peso declarado** | Peso informado na NF-e (para conferência) |

## Inconsistências detectadas

- **NF-e ausente** → Alerta de irregularidade fiscal
- **Peso declarado ≠ peso aferido** → Possível sub-declaração de carga
- **NF-e cancelada** → Mercadoria sem documento válido

## Relacionados

- [MDF-e](./mdfe) — Manifesto que agrupa as NF-e
- [Pesagem](./pesagem) — Verificação do peso declarado vs aferido

