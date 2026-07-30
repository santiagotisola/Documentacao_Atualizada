---
sidebar_position: 4
title: Consulta de Placas
description: Pesquisar passagens de veículos por placa nos postos de pesagem do AxTon
---

# Consulta de Placas

Permite pesquisar o **histórico completo de passagens** de um veículo específico nos postos de pesagem.

## Como acessar

**Menu lateral** → Operações → **Consulta de Placas**

## Filtros

| Filtro | Obrigatório | Descrição |
|--------|:-----------:|-----------|
| **Placa** | Sim | Número da placa (Mercosul ou padrão antigo) |
| **Período** | Sim | Data início e data fim |
| **Posto** | Não | Filtrar por posto de pesagem específico |

## Resultado

| Coluna | Descrição |
|--------|-----------|
| **Data/Hora** | Momento da passagem |
| **Posto** | Local de pesagem |
| **Peso aferido** | Peso registrado |
| **PBT máximo** | Limite para a categoria |
| **Resultado** | Regular ou Infrator |

:::tip
Use a consulta de placas para verificar histórico de um veículo antes de liberar ou autuar. É possível identificar padrões de reincidência.
:::

## Casos de uso

- **Antes de liberar**: verificar se o veículo tem histórico de excessos de peso
- **Identificação de reincidentes**: veículos autuados 3+ vezes no mesmo mês
- **Auditorias**: comprovar passagens em período específico

## Relacionado

- [Tickets Abertos](../pesagem/ticket-aberto)
- [Relatório de Infrações](../relatorios/relatorio-infracoes)

| **Status** | Regular / Infrator |
| **Infração** | Número da infração (se gerada) |

## Passo a passo

1. Acesse **Operações → Consulta de Placas**
2. Informe a **Placa** do veículo
3. Defina o **Período** de busca
4. Clique em **Consultar**
5. Clique em qualquer registro para ver detalhes


## Filtros de pesquisa

| Filtro | Descrição |
|--------|-----------|
| **Placa** | Placa do Veículo (parcial ou completa) |
| **Período** | Data inicial e final |
| **Posto** | Posto de pesagem específico |

## Resultados

### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Placa** | Placa do Veículo |
| **Data/Hora** | Momento da passagem |
| **Posto** | Local da pesagem |
| **Peso Bruto** | Peso total registrado |
| **Classificação** | Tipo de Veículo identificado |
| **Excesso** | Peso excedente, se houver |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Placa não encontrada | Nenhuma passagem no período | Ampliar o período de busca |
| Peso zerado na passagem | Falha na leitura da balança | Verificar log do equipamento |
| Resultado incorreto | Classificação errada no momento da pesagem | Reclassificar o ticket em Balança → Reclassificar |
| Muitos registros duplicados | Placa lida mais de uma vez no mesmo evento | Verificar configuração do equipamento |

## Relacionado

- [Tickets Abertos](../pesagem/ticket-aberto)
- [Relatório de Infrações](../relatorios/relatorio-infracoes)
- [Reclassificar](../pesagem/reclassificar)
