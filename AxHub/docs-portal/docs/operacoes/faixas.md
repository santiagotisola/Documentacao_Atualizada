---
sidebar_position: 2
title: Faixas
description: Configuração de faixas de fiscalização por operação
---

# Faixas

Permite configurar as faixas de monitoramento de cada operação. Cada faixa representa uma pista de rolamento monitorada por um Equipamento de fiscalização.

![Lista de Faixas](../img/Operações%20-%20Faixas.png)

## Como acessar

**Menu lateral** → Operações → **Faixas**

## Cadastro de faixa

![Cadastro de Faixa](../img/Operações%20-%20Faixas%20-%20cadatro.png)

| Campo | Descrição |
|-------|-----------|
| **Código** | Código identificador da faixa (ex: GYNTM015-1) |
| **Operação** | Operação vinculada |
| **Número da Faixa** | Número sequencial da faixa no Equipamento |
| **Sentido** | Sentido de tráfego monitorado (Norte/Sul, Leste/Oeste, etc.) |
| **Logradouro** | Endereço/via onde a faixa está localizada |
| **Bairro** | Bairro da localização |
| **Município** | Município onde a faixa opera |
| **UF** | Estado (ex: GO, SP, MA) |
| **Código do Município** | Código IBGE do município (ex: Goiânia = 5208707) |

### Código do Município (IBGE)

O campo **Código do Município** é essencial para a exportação de Infrações Ele deve corresponder ao código IBGE oficial do município onde a faixa opera.

![Correção do Código do Município na Faixa](../img/operacao%20-%20faixa%20-%20codigo%20do%20municipio%20%20correção%20na%20faixa%203.png)

:::warning Importante
O código do município na faixa **deve ser o mesmo** da UF da operação. Se a operação é em Goiânia/GO, todas as faixas devem ter o código IBGE de um município de GO. Um código de município divergente (ex: código de MA em operação de GO) gera **erro na exportação** de Infrações.
:::

## Relacionado

- [Operações](./cadastro-operacoes)
- [Municípios](../veiculos/municipios)
- [Enquadramentos](../administracao/configuracoes-enquadramento)

:::

### Onde o Código do Município é utilizado

| Módulo | Utilização |
|--------|-----------|
| **Exportação de Infrações | Validação obrigatória: UF da faixa deve corresponder ao município |
| Relatórios | Agrupamento e filtros por localidade |
| **Medições** | Cálculos de desempenho por equipamento/local |
| **Triagem** | Dados de contexto da Infração |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Cadastro de Operacoes](./cadastro-operacoes) | Operacao que contem as faixas |
| Relacionado | [Equipamentos](../cadastros-basicos/equipamentos) | Equipamentos nas faixas |
