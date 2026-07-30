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

:::info
Veículos com MDF-e vencido ou ausente não podem continuar o transporte até a regularização. O AxTon gera alerta automático para o operador ao detectar a irregularidade.
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

