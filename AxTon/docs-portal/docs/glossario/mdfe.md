---
sidebar_position: 4
title: "MDF-e (Manifesto de Documento Fiscal)"
description: "O que é MDF-e no AxTon — obrigatoriedade, validação e impacto nas operações"
---

# MDF-e — Manifesto Eletrônico de Documentos Fiscais

Documento eletrônico obrigatório que vincula as notas fiscais (NF-e) ao transporte de mercadorias. Veículos de carga que circulam em rodovias devem portar MDF-e válido. A ausência ou irregularidade gera **alerta automático no AxTon**.

**Base legal:** Ajuste SINIEF 21/2010 — NT 2013/005

## O que o AxTon verifica

| Verificação | Status gerado |
|-------------|---------------|
| MDF-e ausente | ⚠️ Alerta — Veículo sem manifesto |
| MDF-e vencido | ⚠️ Alerta — Manifesto expirado |
| MDF-e válido | ✅ OK — Circulação regular |
| MDF-e encerrado sem chegar ao destino | ⚠️ Alerta — Possível irregularidade fiscal |

## Campos do MDF-e capturados

| Campo | Descrição |
|-------|-----------|
| **Chave de acesso** | 44 dígitos que identificam unicamente o manifesto |
| **Emitente** | CNPJ do transportador |
| **UF início/fim** | Estados de origem e destino |
| **Validade** | Período de vigência do manifesto |
| **NF-e vinculadas** | Notas fiscais incluídas no manifesto |

## Relacionado

- [NF-e](./nfe) — Nota Fiscal Eletrônica
- [Relatório de Notas Fiscais](../relatorios/relatorio-nfe)

## Penalidades por infração

| Situação | Penalidade |
|----------|------------|
| MDF-e ausente | Multa de 550 UFIRs (Art. 12, Lei 8.137/90) |
| MDF-e encerrado antes do destino | Retenção da carga |
| Dados divergentes do MDF-e | Apreensão da mercadoria |

:::info Base legal
**Ajuste SINIEF 21/2010** — institui o MDF-e. Fiscalização pelo SEFAZ estadual em rodovias.
:::


## Como o AxTon usa o MDF-e

1. Equipamento captura placa do veículo
2. Sistema consulta SEFAZ para verificar MDF-e ativo
3. Se ausente ou inválido: gera alerta na fila de triagem
4. Triador analisa e confirma infração se cabível

## Relacionados

- [NF-e](./nfe) — Notas fiscais vinculadas ao manifesto
- [PBT](./pbt) — Peso verificado junto ao MDF-e
- [Triagem](./triagem) — Processo de validação

## Base legal

| Dispositivo | Conteúdo |
|-------------|----------|
| **Ajuste SINIEF 21/2010** | Instituíção do MDF-e no Brasil |
| **NT 2013/005** | Especificações técnicas do MDF-e |
| **Art. 237-A, CTB** | Vedado o transporte de mercadorias sem documentação fiscal |
| **Convênio ICMS 58/2013** | Obrigatoriedade do MDF-e no transporte interestadual |
