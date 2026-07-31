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

- [Enquadramentos](../administracao/enquadramentos)
- [Configurações de Enquadramento](../administracao/configuracoes-enquadramento)

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Enquadramento errado | Velocidade da faixa mal configurada | Revisar configuração de faixas |
| Enquadramento não aparece | Equipamento sem configuração | Associar equip. a uma operação |
| Auto rejeitado pelo órgão | Código CTB desatualizado | Atualizar tabela de enquadramentos |

:::tip
Configure corretamente a velocidade regulamentada em cada faixa para que o sistema sugira enquadramentos corretos automaticamente durante a triagem.
:::

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

## Perguntas frequentes

**Por que o sistema sugeriu um enquadramento diferente do esperado?**
Provavelmente a velocidade regulamentada da faixa está configurada incorretamente. Verifique em **Administração → Configurações de Enquadramento** se o limite da via está correto.

**Posso alterar o enquadramento de uma infração já exportada?**
Não. Infrações já enviadas ao órgão autuador não podem ser alteradas no sistema. Em caso de erro, contate o órgão para cancelamento administrativo.

**Qual a diferença entre gravidade e pontuação na CNH?**
Gravidade define o valor da multa (Leve, Média, Grave, Gravíssima). Pontuação é a quantidade de pontos debitados na CNH. Ambos são definidos em conjunto pelo CTB para cada enquadramento.

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **Faixas** | A velocidade regulamentada de cada faixa é a base para o enquadramento automático sugerido pelo sistema |
| **Infrações** | Cada infração recebe um enquadramento que determina multa, pontuação e artigo CTB aplicável |
| **Configurações de Enquadramento** | Define as regras de enquadramento por operação e faixa de velocidade |

## Contexto operacional

O **enquadramento** é a decisão legal que transforma uma passagem em uma infração válida. Na prática, o sistema sugere automaticamente o enquadramento com base na velocidade medida vs. limite da faixa — mas o operador tem responsabilidade de validar essa sugestão na triagem. Um enquadramento incorreto é a causa mais comum de recursos aceitos no juízo administrativo.

Para o supervisor, a análise periódica dos enquadramentos mais freqüentes nas infrações permite identificar configurações incorretas: se um grande volume de infrações está sendo enquadrado como **Leve** em uma rodovia de alta velocidade, provavelmente o limite da faixa está mal configurado.

Para o gestor, manter a tabela de enquadramentos atualizada conforme as resoluções CONTRAN é obrigação legal. Enquadramentos desatualizados invalidam autos e geram recurs os em massa que prejudicam a receita contratual e a credibilidade do sistema junto ao órgão autuador.
