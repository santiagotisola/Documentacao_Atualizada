---
sidebar_position: 5
title: Classificações de Veículos
description: Classificações de veículos por eixo e PBT no AxTon
---

# Classificações de Veículos

Classificações de veículos por **número de eixos e PBT** (Peso Bruto Total). Base para o cálculo de excesso de peso nas autuções.

![Classificação de Veículos](../img/classificacao-veiculos-cadastro.png)

## Como acessar

**Menu lateral** → Veículos → **Classificações de Veículos**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Código** | Sim | Código da classificação |
| **Descrição** | Sim | Nome da configuração de eixos |
| **Número de eixos** | Sim | Total de eixos do veículo |
| **PBT máximo (t)** | Sim | Limite de peso para esta classificação |

## Como é usada

1. OCR captura placa → consulta tipo do veículo no RENAVAM
2. Sistema identifica classificação (número de eixos)
3. Compara peso aferido com PBT desta classificação
4. Excedeu → gera infração automática

## Relacionado

- [PBT](../glossario/pbt) — Peso Bruto Total
- [Tipos de Veículos](./tipos-veiculos)
- [Infração](../glossario/infracao)

## Classificaoes comuns (CONTRAN 803/2021)

| Classificação | Eixos | PBT máximo |
|----------------|:-----:|:-----------:|
| Caminhão simples (2E) | 2 | 16 t |
| Caminhão truck (3E) | 3 | 23 t |
| Bi-truck (4E) | 4 | 29 t |
| Bitrem (5E) | 5 | 41,5 t |
| Bitrem (6E) | 6 | 45 t |
| Rodotrem (9E) | 9 | 57 t |

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| PBT errado calculado | Classificação desatualizada | Atualizar conforme CONTRAN 803/2021 |
| Veículo classif. errado | OCR não identificou eixos | Reclassificar manualmente |
| Classificação sem categoria | Vínculo ausente | Associar categoria pai |

## Relacionado

- [PBT](../glossario/pbt) — Peso Bruto Total
- [Tipos de Veículos](./tipos-veiculos)
- [Infração](../glossario/infracao)

| Classificação | Eixos | PBT máximo |
|----------------|:-----:|:-----------:|
| Caminhão simples (2E) | 2 | 16 t |
| Caminhão truck (3E) | 3 | 23 t |
| Bi-truck (4E) | 4 | 29 t |
| Bitrem (5E) | 5 | 41,5 t |
| Bitrem (6E) | 6 | 45 t |
| Rodotrem (9E) | 9 | 57 t |

## Passo a passo

1. Acesse **Veículos → Classificações de Veículos**
2. Clique em **+ Nova**
3. Preencha o **Código**, **Descrição** e **Número de eixos**
4. Informe o **PBT máximo**
5. Clique em **Salvar**

:::warning
Nunca altere o PBT máximo de uma classificação em uso sem autorização da fiscalização. Alterações afetam infrações já geradas.
:::

:::info Base legal
Limites definidos pela **Resolução CONTRAN 803/2021**. Consulte a portaria SENATRAN após cada publicação de nova resolução para verificar atualizações.
:::

## Boas práticas

- Mantenha as classificações alinhadas com a Resolução CONTRAN 803/2021 e solicite atualização ao suporte após alterações legais
- Valide o PBT máximo de cada classificação com o contrato do cliente — alguns órgãos adotam limites mais restritivos
- Não exclua classificações com registros históricos — inative o registro para preservar a consistência dos dados
5. Clique em **Salvar**

## Perguntas frequentes

**O que acontece se eu alterar o PBT máximo de uma classificação que já está em uso?**
As infrações geradas antes da alteração mantêm o PBT original registrado no momento da autuação. Contudo, novos registros passam a usar o valor atualizado, podendo gerar inconsistências retroativas em relatórios e boletins de medição. Somente altere com autorização da fiscalização.

**Como a classificação de veículos influencia diretamente no cálculo das infrações?**
Após o OCR capturar a placa, o sistema consulta o RENAVAM para identificar o número de eixos e busca a classificação correspondente. O peso aferido é comparado ao PBT máximo da classificação — se exceder, a infração é gerada automaticamente com o enquadramento correto.

**Quando devo criar uma nova classificação ao invés de editar uma existente?**
Crie uma nova classificação quando o CONTRAN publicar resolução alterando os limites de PBT ou quando o órgão contratante exigir limites mais restritivos que os legais. Nunca edite classificações já vinculadas a infrações exportadas — crie uma nova e inative a anterior.
