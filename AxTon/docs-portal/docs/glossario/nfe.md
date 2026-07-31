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
| **Chave NF-e** | 44 dígitos da nota fiscal |
| **Emitente** | CNPJ e razão social do emitente |
| **Destinatário** | CNPJ do destinatário |
| **Valor total** | Valor declarado na nota |
| **Peso declarado** | Peso informado na NF-e |

:::info
A comparação entre o **peso declarado na NF-e** e o **peso aferido na balança** pode indicar subdeclaração fiscal.
:::

## Relacionado

- [MDF-e](./mdfe) — Manifesto de Documentos Fiscais
- [Relatório de NF-e](../relatorios/relatorio-nfe)
- [Discrepancias](../relatorios/relatorio-discrepancias)

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| NF-e ausente | Veículo saiu sem emitir | Notificar SEFAZ |
| NF-e vencida | Prazo de validade expirado | Regularizar com emitente |
| Dados divergentes | Peso declarado ≠ aferido | Apurar subdeclaração fiscal |
| Chave NF-e inválida | Erro de digitação | Solicitar chave correta ao emitente |

| Campo | Fonte |
|-------|-------|
| Chave NF-e (44 dígitos) | OCR + SEFAZ |
| CNPJ do emitente | SEFAZ |
| Valor total | SEFAZ |
| Peso declarado | SEFAZ |

:::tip Auditoria fiscal
Compare o **peso declarado na NF-e** com o **peso aferido** no AxTon. Diferenças acima de 10% devem ser reportadas à Secretaria da Fazenda.
:::
- [Relatório de Notas Fiscais](../relatorios/relatorio-nfe)

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

## Base legal

| Dispositivo | Conteúdo |
|-------------|----------|
| **Ajuste SINIEF 07/2005** | Instituição da NF-e no Brasil |
| **Lei 8.137/90** | Crimes contra a ordem tributária — sub-declaração fiscal |
| **Código Fiscal de Operações (CFOP)** | Classificação das operações fiscais na nota |
| **Portaria CAT 162/2008 (SP)** | Obrigatoriedade da NF-e no transporte interestadual |
