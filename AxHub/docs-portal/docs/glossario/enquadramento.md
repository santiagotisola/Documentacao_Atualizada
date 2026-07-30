---
title: "Enquadramento"
sidebar_position: 1
description: "O que é enquadramento no AxHub — classificação legal das infrações de trânsito"
---

# Enquadramento

Classificação legal atribuída a uma infração de trânsito. O enquadramento determina o **artigo, inciso, penalidade e pontuação** aplicáveis conforme a legislação vigente.

**Base legal:** Art. 161 e Anexo II do CTB — Resolução CONTRAN 619/2016

## Estrutura do enquadramento

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| **Código** | Código único do enquadramento | 55412 |
| **Descrição** | Descrição da infração | Exceder velocidade perm. em até 20% |
| **Artigo CTB** | Artigo da lei violado | Art. 218, I |
| **Gravidade** | Nível da infração | Leve / Média / Grave / Gravíssima |
| **Pontos** | Pontuação na CNH | 3 / 4 / 5 / 7 |
| **Valor R$** | Multa base | R$ 130,16 a R$ 880,41+ |

## Escalas de gravidade

| Gravidade | Pontos | Valor base |
|-----------|--------|------------|
| Leve | 3 | R$ 88,38 |
| Média | 4 | R$ 130,16 |
| Grave | 5 | R$ 195,23 |
| Gravíssima | 7 | R$ 293,47 (1x) a R$ 880,41 (3x) |

## Base legal

- **Art. 161 do CTB** — Define infração de trânsito e os princípios de gravidade e pontuação
- **Anexo II do CTB** — Tabela completa de infrações, artigos e penalidades
- **Resolução CONTRAN 619/2016** — Regula a fiscalização eletrônica e os enquadramentos aplicáveis

## Relacionados

- [Enquadramentos](../administracao/enquadramentos) — Tabela completa do CTB
- [Configurações de Enquadramento](../administracao/configuracoes-enquadramento) — Configuração por operação

:::info
Na **Triagem**, o operador valida ou altera o enquadramento sugerido automaticamente pelo sistema com base na velocidade/infração detectada.
:::

## Enquadramentos mais comuns no AxHub

| Código | Descrição | Gravidade |
|--------|-----------|:---------:|
| 55411 | Velocidade superior à máxima em até 20% | Grave |
| 55412 | Velocidade superior à máxima entre 20% e 50% | Gravíssima |
| 55413 | Velocidade superior à máxima acima de 50% | Gravíssima |
| 60501 | Desrespeitar sinal vermelho | Gravíssima |
| 55500 | Ultrapassar pela contramão | Gravíssima |

## Como o AxHub aplica o enquadramento

O sistema sugere automaticamente o enquadramento com base na **velocidade medida** x **velocidade regulamentada da faixa**. O operador pode aceitar, alterar ou questionar a sugestão durante a triagem.

:::tip
Configure corretamente a velocidade regulamentada em cada faixa para que o sistema sugira os enquadramentos corretos automaticamente.
:::
|--------|-----------|:---------:|
| 55411 | Velocidade superior à máxima em até 20% | Grave |
| 55412 | Velocidade superior à máxima entre 20% e 50% | Gravíssima |
| 55413 | Velocidade superior à máxima acima de 50% | Gravíssima |
