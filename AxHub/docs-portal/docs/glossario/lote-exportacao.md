---
title: "Lote de Exportação"
sidebar_position: 6
description: "O que é lote de exportação no AxHub — fluxo, status e base legal"
---

# Lote de Exportação

Conjunto agrupado de **infrações processadas e validadas**, formatado e enviado ao órgão autuador (DETRAN, DER, Prefeitura) através de integração sistêmica.

**Base legal:** Resolução CONTRAN 619/2016

## Ciclo de vida do lote

```
Criado → Processando → Enviado → Aceito
                  ↓
                Erro → Tentar novamente → Enviado
```

## Status possíveis

| Status | Descrição |
|--------|-----------|
| **Criado** | Lote gerado, aguardando envio |
| **Processando** | Sendo formatado e validado |
| **Enviado** | Transmitido ao órgão autuador |
| **Aceito** | Confirmado pelo órgão |
| **Erro** | Falha no envio — precisa reprocessar |

## Relacionado

- [Lotes de Importação](../relatorios/lote-importacao)
- [Sequenciais de Lote](../administracao/sequenciais-lote-exportacao)

## Boas práticas

- Verificar o relatório de **Falhas de Sequenciais** antes de gerar o lote
- Exportar apenas infrações com status **Auditada** ou superior
- Manter cópia dos recibos de confirmação do órgão por 5 anos

:::warning
Lotes rejeitados pelo órgão não são reprocessados automaticamente. É necessário corrigir o problema e gerar novo lote.
:::

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Lote rejeitado | Sequencial duplicado | Usar Relatório de Falhas |
| Status Erro | Falha de conexão | Reenviar após 24h |
| Infração ausente | Status não era Auditada | Revisar pipeline de triagem |

```
Infrações auditadas
    ↓
Verificar Falhas de Sequenciais
    ↓
Gerar Lote de Exportação
    ↓
Transmitir ao órgão (DETRAN/DER)
    ↓
Aguardar confirmação (status Aceito)
    ↓
Arquivar protocolo por 5 anos
```

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Lote rejeitado | Sequencial duplicado | Usar Relatório de Falhas |
| Status Erro | Falha de conexão | Reenviar após 24h |
| Infração ausente | Status não era Auditada | Revisar pipeline de triagem |

:::warning
Lotes cancelados não podem ser reenvidos. Uma nova exportação precisará ser gerada com as infrações correspondentes.
:::

## O que compõe um lote

- Infrações aprovadas na auditoria
- Dados do enquadramento (artigo CTB, pontos, valor)
- Imagens das infrações
- Informações do veículo e do equipamento

## Relacionados

- [Lote de Exportação](../infracoes/exportacao) — Gerenciamento de lotes
- [Auditoria](../infracoes/auditoria) — Pré-requisito para exportar

## Perguntas frequentes

**Quantas infrações podem compor um lote?**
Não há limite técnico no sistema. Porém, alguns órgãos autuadores imposts limites por lote (geralmente entre 500 e 5.000 autos). Verifique a especificação do órgão no layout de exportação.

**O que acontece se o órgão rejeitar o lote?**
O lote volta ao status **Erro**. Corrija o problema identificado na mensagem de retorno do órgão e reenvie com o **mesmo** número de lote. Nunca gere um novo número para um lote já transmitido.

**Por quanto tempo devo guardar os recibos de envio de lote?**
O mínimo recomendado é 5 anos, conforme a Lei 9.873/99 (prazo de prescrição administrativa). Exporte e arquive o protocolo de cada lote aceito como comprovação legal.


## Uso no Sistema AxHub

No modulo **Infracoes - Exportacao**, o sistema agrupa as infracoes auditadas em lotes conforme o layout definido em **Administracao - Layouts de Arquivos**. Os sequenciais sao controlados em **Sequenciais de Lote de Exportacao**.

## Paginas Relacionadas

- [Exportacao](../infracoes/exportacao)
- [Layouts de Arquivos](../administracao/layouts-arquivos)
- [Sequenciais de Lote](../administracao/sequenciais-lote-exportacao)

## Integração com outros módulos

| Módulo | Como usa este cadastro/relatório |
|--------|----------------------------------|
| **Exportação de Infrações** | O lote é gerado neste módulo agrupando infrações auditadas e transmitindo ao órgão autuador |
| **Auditoria** | Apenas infrações com status **Auditada** podem integrar um lote — a auditoria é pré-requisito para exportar |
| **Layouts de Arquivos** | O formato e os campos do lote são definidos pelo layout configurado em **Administração → Layouts** |
| **Sequenciais de Lote** | Controla a numeração sequencial dos lotes exportados, garantindo unicidade e rastreabilidade junto ao órgão |
