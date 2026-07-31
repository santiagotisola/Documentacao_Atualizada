---
sidebar_position: 6
title: Enquadramentos
description: Tabela de enquadramentos de Infrações de trânsito
---

# Enquadramentos

Exibe a tabela completa de enquadramentos de Infrações de trânsito conforme o CTB.

## Como acessar

**Menu lateral** → Configurações → **Enquadramentos**

| Coluna | Descrição |
|--------|-----------|
| **Código** | Código do enquadramento |
| **Descrição** | Tipo da Infração |
| **Artigo** | Artigo do CTB |
| **Gravidade** | Leve, Média, Grave, Gravíssima |
| **Pontos** | Pontuação atribuída |
| **Valor (R$)** | Valor da multa |

## Filtros

| Filtro | Descrição |
|--------|-----------|
| **Gravidade** | Filtrar por nível de gravidade |
| **Código** | Busca por código CTB específico |
| **Texto** | Busca parcial na descrição |

## Gravidades CTB

| Gravidade | Pontos | Faixa de Valor |
|-----------|:------:|----------------|
| Leve | 3 | R$ 88,38 |
| Média | 4 | R$ 130,16 |
| Grave | 5 | R$ 195,23 |
| Gravíssima | 7 | R$ 293,47 + |

:::info
Os enquadramentos são pré-carregados conforme o CTB vigente. Para adicionar enquadramentos municipais específicos, entre em contato com o suporte técnico Axion.
:::

## Boas práticas

- Sempre use o código de enquadramento exato do CTB ao configurar operações — erros geram invalidade jurídica nas infrações
- Verifique periodicamente se há atualizações de valores de multa (reajuste anual do IPCA) e solicite atualização ao suporte
- Utilize os filtros de gravidade para validar que os enquadramentos configurados correspondem ao tipo de fiscalização da operação

## Relacionado

- [Enquadramento](../glossario/enquadramento) — Conceito e estrutura
- [Configurações de Enquadramento](./configuracoes-enquadramento)
- [Formas de Autuação](./formas-autuacao)

## Enquadramentos mais usados no AxHub

| Código | Descrição | Gravidade |
|--------|-----------|:---------:|
| 55411 | Velocidade superior à máxima em até 20% | Grave |
| 55412 | Velocidade superior à máxima entre 20% e 50% | Gravíssima |
| 55413 | Velocidade superior à máxima acima de 50% | Gravíssima |
| 60501 | Desrespeitar sinal vermelho | Gravíssima |
| 55500 | Ultrapassar pela contramão | Gravíssima |

:::

:::info Dados na Tarja
O **Código** e **Descrição** do enquadramento aparecem nas **tarjas das Infrações  
Para entender como esses dados são exibidos, consulte:  
👉 Configuração de Dados da Tarja](./configuracao-dados-tarja#codigo-da-infracao)**
:::

## Termos Tecnicos

| Termo | Definicao |
|-------|-----------|
| [Enquadramento](../glossario/enquadramento) | Ver definicao no glossario |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | Use Configuração Enquadramentos](./configuracoes-enquadramento) | Configuracao |
| Relacionado | [Formas de Autuacao](./formas-autuacao) | Forma de lavrar |
| Glossario | [Enquadramento](../glossario/enquadramento) | Definicao CTB |
| Glossario | [Autuacao](../glossario/autuacao) | Ato de autuacao |

## Perguntas frequentes

**Preciso cadastrar todos os artigos do CTB?**
Não. O sistema já vem com os enquadramentos pré-carregados conforme o CTB vigente. Apenas enquadramentos municipais específicos precisam ser adicionados — e sempre via suporte técnico Axion.

**Os valores de multa são atualizados automaticamente?**
Não. Os valores precisam ser atualizados manualmente após o reajuste anual pelo IPCA. Entre em contato com o suporte para solicitar a atualização.

**O que acontece se eu configurar um enquadramento errado em uma operação?**
As infrações geradas serão enquadradas no artigo CTB incorreto, o que pode causar anulação judicial dos autos. Revise as infrações do período e reconfigure o enquadramento antes de gerar novos lotes.
