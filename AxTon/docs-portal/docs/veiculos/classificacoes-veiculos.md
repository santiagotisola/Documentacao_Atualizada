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

## Passo a passo

1. Acesse **Veículos → Classificações de Veículos**
2. Clique em **+ Nova**
3. Preencha o **Código**, **Descrição** e **Número de eixos**
4. Informe o **PBT máximo**
5. Clique em **Salvar**

:::tip
Use a tabela do CONTRAN 803/2021 como referência para garantir que os limites cadastrados estejam atualizados.
:::

## Boas práticas

- Mantenha as classificações alinhadas com a Resolução CONTRAN 803/2021 e solicite atualização ao suporte após alterações legais
- Valide o PBT máximo de cada classificação com o contrato do cliente — alguns órgãos adotam limites mais restritivos
- Não exclua classificações com registros históricos — inative o registro para preservar a consistência dos dados
5. Clique em **Salvar**
