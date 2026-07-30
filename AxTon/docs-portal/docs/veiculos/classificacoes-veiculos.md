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

2. Clique em **+ Novo**
3. Preencha o Código e a Descrição
4. Marque como Ativo
5. Clique em **Salvar**
