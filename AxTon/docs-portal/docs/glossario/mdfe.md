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

## Erros comuns no AxTon

| Erro | Causa | Solução |
|------|-------|----------|
| Alerta MDF-e sem infração | Configuração de alerta sem auto | Verificar regras de enquadramento |
| MDF-e válido mas alerta gerado | Consulta SEFAZ com delay | Aguardar sincronização e verificar novamente |
| Veículo sem MDF-e isento | Carga não obriga MDF-e | Verificar tabela de obrigatoriedades |

```
Veículo chega ao posto
    ↓
OCR lê placa
    ↓
Consulta SEFAZ pelo CNPJ do veículo
    ↓
    ├─ MDF-e válido → Passagem regular
    └─ MDF-e ausente/vencido → Alerta + possível retenção
```

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

## Perguntas frequentes

**O que fazer quando o AxTon gera alerta de MDF-e ausente mas o motorista exibe o documento?**
O sistema consulta o SEFAZ em tempo real. Se o manifesto foi emitido recentemente, pode haver um delay de sincronização. Aguarde alguns minutos e reconcepte a consulta ou valide manualmente o documento físico.

**Qual a diferença entre MDF-e vencido e MDF-e encerrado?**
MDF-e vencido é aquele que passou da data de validade. MDF-e encerrado é aquele que foi finalizado na plataforma SEFAZ antes de o veículo chegar ao destino declarado — ambos geram alerta.

**Todos os veículos de carga devem portar MDF-e?**
Não. A obrigatoriedade depende do tipo de carga e do percurso (interestadual vs. municipal). Consulte a legislação estadual vigente para confirmar a obrigatoriedade para cada tipo de operação.

## Base legal

| Dispositivo | Conteúdo |
|-------------|----------|
| **Ajuste SINIEF 21/2010** | Instituíção do MDF-e no Brasil |
| **NT 2013/005** | Especificações técnicas do MDF-e |
| **Art. 237-A, CTB** | Vedado o transporte de mercadorias sem documentação fiscal |
| **Convênio ICMS 58/2013** | Obrigatoriedade do MDF-e no transporte interestadual |

## Integração com outros módulos

| Módulo | Como usa este cadastro/relatório |
|--------|----------------------------------|
| **Pesagem** | O MDF-e é consultado automaticamente na chegada do veículo ao posto para verificar a conformidade fiscal |
| **NF-e** | As notas fiscais estão vinculadas ao MDF-e; a ausência do manifesto indica que as NF-es não foram devidamente acobertadas |
| **Triagem** | Alertas de MDF-e ausente ou vencido aparecem na fila de triagem para validação do operador |
| **Relatório de Discrepâncias** | Compara o peso declarado no MDF-e com o peso aferido na balança para identificar subdeclaração fiscal |
