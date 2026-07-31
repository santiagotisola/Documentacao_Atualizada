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

## Perguntas frequentes

**O que fazer quando o peso declarado na NF-e diverge muito do peso aferido?**
Diferenças acima de 10% devem ser reportadas à Secretaria da Fazenda como indício de subdeclaração de carga. Documente a pesagem e a NF-e para embasar a ocorrência.

**Todos os veículos de carga verificados pelo AxTon precisam apresentar NF-e?**
Não. A obrigatoriedade depende da operação e do tipo de mercadoria. Consulte o CFOP e a legislação estadual vigente para confirmar a exigência.

**O alerta de NF-e ausente gera automaticamente uma infração?**
Depende da configuração das regras de enquadramento. O alerta pode ficar apenas na fila de triagem para validação manual antes de gerar um auto.

## Integração com outros módulos

| Módulo | Como usa este cadastro/relatório |
|--------|----------------------------------|
| **MDF-e** | As NF-es são vinculadas ao MDF-e que acompanha o transporte; ausência de uma impacta a validação do outro |
| **Pesagem** | O peso declarado na NF-e é automaticamente comparado ao peso aferido na balança para detectar subdeclaração |
| **Triagem** | Alertas de NF-e ausente ou inválida são exibidos na fila de triagem para que o operador valide antes de exportar |
| **Relatório de Notas Fiscais** | Exibe o histórico de NF-es consultadas, com status e informações do documento fiscal de cada pesagem |

## Contexto operacional

A **NF-e** representa a dimensão fiscal da pesagem veicular. Para o operador, o status da NF-e aparece na triagem como informação complementar: quando a nota está **Ausente** ou **Cancelada**, o operador deve analisar se isso configura infração documental além do excesso de peso físico.

Para o supervisor, a comparação sistêmática entre peso declarado na NF-e e peso aferido na balança é uma ferramenta poderosa de detecção de fraude fiscal: divergencias acima de 10% indicam sub-declaração de carga e devem ser reportadas à SEFAZ estadual, gerando cooperação fiscal com impacto além do contrato de pesagem.

Para o gestor, manter a integração com a SEFAZ funcionando corretamente é um diferencial competitivo e legal do AxTon. A efetividade das autuações fiscais depende da qualidade das consultas em tempo real ao banco de dados da SEFAZ — falhas de conectividade resultam em NF-es marcadas como **Ausentes** mesmo quando existem, gerando alertas falsos que sobrecarregam a triagem.
