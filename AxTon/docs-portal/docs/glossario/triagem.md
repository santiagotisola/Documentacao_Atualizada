---
sidebar_position: 6
title: "Triagem"
description: "O que é triagem no AxTon — processo de análise e validação de infrações de pesagem"
---

# Triagem

Processo de **análise humana das infrações** detectadas automaticamente pelo sistema de pesagem. O agente de triagem valida ou descarta cada infração com base nas imagens capturadas e nos dados registrados.

## Quando ocorre

Após o equipamento registrar uma passagem com peso acima do limite legal, o sistema gera automaticamente uma infração. Essa infração entra na **fila de triagem** aguardando análise.

## O que o triador verifica

| Elemento | O que verificar |
|----------|----------------|
| **Imagem do veículo** | Placa legível, tipo correto de veículo |
| **Peso registrado** | Valor compatível com o eixo e categoria |
| **Classificação** | Categoria de veículo correta |
| **Enquadramento** | Artigo do CTB aplicado corretamente |
| **Dados do documento** | NF-e/MDF-e vinculado (quando aplicável) |

## Ações disponíveis

| Ação | Quando usar |
|------|-------------|
| **Aprovar** | Infração válida — segue para auditoria |
| **Descartar** | Erro técnico, imagem ilegível ou dados incorretos |

## Relacionado

- [Auditoria](../pesagem/auditoria)
- [Motivos](../pesagem/motivos)
- [Infração](./infracao)

| **Reencaminhar** | Dúvida que exige revisão por nível superior |

## Relação com outros processos

- **Antes da triagem:** Pesagem → Captura automática de infração
- **Após a triagem:** Auditoria → Exportação para DENATRAN/SENATRAN

## Boas práticas

- Sempre verificar a imagem antes de aprovar
- Descartar com motivo detalhado para rastreabilidade
- Manter a fila de triagem com menos de 24h de defasagem

:::info Permissão necessária
Para realizar triagem: `triagem.index` e `triagem.auditar`
:::

## Glossário relacionado

- [Pesagem](./pesagem) — Processo anterior à triagem
- [Infração](./infracao) — Objeto gerado pela pesagem
- [MDF-e](./mdfe) — Documento fiscal vinculado

