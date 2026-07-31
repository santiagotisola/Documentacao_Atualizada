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

## Relação com outros processos

- **Antes da triagem:** Pesagem → Captura automática de infração
- **Após a triagem:** Auditoria → Exportação ao órgão

## Erros comuns

| Erro | Impacto | Prevenção |
|------|---------|----------|
| Aprovar com placa errada | Auto inválido | Verificar OCR antes de confirmar |
| Descartar sem motivo | Perde rastreabilidade | Sempre selecionar motivo |
| Aprovar sem imagem obrigatória | Rejeição pelo órgão | Verificar tipos de imagem |
| Backlog acima de 24h | Risco de prescrição | Redistribuir analistas |

## Relacionado

- [Auditoria](../pesagem/auditoria)
- [Motivos](../pesagem/motivos)
- [Infração](./infracao)
- **Após a triagem:** Auditoria → Exportação ao órgão autuador

:::warning
Infrações aprovadas com erros de placa ou classificação podem ser invalidadas pelo órgão autuador. Revise com atenção antes de confirmar.
:::
- **Após a triagem:** Auditoria → Exportação para DENATRAN/SENATRAN

## Boas práticas

- Analisar as imagens antes de aprovar — a qualidade das imagens determina a validade da infração
- Registrar sempre o motivo de descarte para análise gerencial
- Não aprovar infrações com placa ilegível — o auto pode ser contestado

:::warning
Infrações aprovadas com erros de placa ou classificação podem ser invalidadas pelo órgão autuador, gerando retrabalho e riscos contratuais.
:::
- Sempre verificar a imagem antes de aprovar
- Descartar com motivo detalhado para rastreabilidade
- Manter a fila de triagem com menos de 24h de defasagem

:::info Permissão necessária
Para realizar triagem: `triagem.index` e `triagem.auditar`
:::

## Perguntas frequentes

**Qual o prazo máximo para concluir a triagem de uma infração de pesagem?**
O prazo deve ser controlado pela equipe gestora. Infrações com mais de 24h sem triagem aumentam o risco de prescrição legal. Monitore o backlog diariamente.

**O que acontece quando uma infração é descartada sem motivo correto?**
A rastreabilidade fica comprometida. O supervisor não consegue identificar a causa-raiz dos descartes, dificultando a melhoria do processo. Sempre selecione o motivo correto.

**Um analista pode reabrir uma infração já descartada por outro?**
Depende das permissões configuradas no perfil. Normalmente apenas supervisores ou auditores têm permissão para reabrir registros descartados.

## Glossário relacionado

- [Pesagem](./pesagem) — Processo anterior à triagem
- [Infração](./infracao) — Objeto gerado pela pesagem
- [MDF-e](./mdfe) — Documento fiscal vinculado

## Integração com outros módulos

| Módulo | Como usa este cadastro/relatório |
|--------|----------------------------------|
| **Pesagem** | Processo anterior à triagem: a pesagem gera a infração que entra na fila de triagem |
| **Auditoria** | Processo posterior: infrações aprovadas na triagem seguem para revisão do auditor antes da exportação |
| **Motivos de Descarte** | Os motivos disponíveis na triagem são configurados em **Pesagem → Motivos**, garantindo rastreabilidade das rejeições |
| **Exportação** | Somente infrações com status **Aprovado** na triagem podem ser incluídas em lote e exportadas ao órgão autuador |

