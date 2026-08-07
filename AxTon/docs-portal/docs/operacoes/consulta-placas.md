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

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Nenhum resultado | Período muito restrito | Ampliar o período |
| Passagens faltando | OCR não leu a placa | Verificar taxa OCR do posto |
| Velocidade não exibida | Equipamento sem radar | Normal para câmeras OCR puras |

## Relacionado

- [Tickets Abertos](./ticket-aberto)
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

## Perguntas frequentes

**Como identificar veículos com histórico recorrente de excesso de peso em um posto?**
Use o filtro de **Placa** combinado com um período amplo (ex.: últimos 3 meses) e verifique o campo **Resultado = Infrator**. Registros repetidos indicam reinciência. Para análise mais aprofundada, utilize o **Relatório de Infrações** com filtro por placa.

**Por que uma placa que passou pelo posto não aparece na consulta?**
As causas mais comuns são: o OCR não conseguiu ler a placa corretamente (verifique a taxa OCR do posto no **Processamento de Imagens**), o período de busca está muito restrito ou o posto selecionado não é o correto. Amplie o período e verifique o posto.

**É possível consultar placas no formato Mercosul e no formato antigo simultaneamente?**
Sim. A consulta aceita ambos os formatos. Se o OCR leu a placa no formato Mercosul (ex.: ABC1D23), busque com esse formato. Se houve erro de leitura, tente buscar pelas letras fixas com coringa ou amplie o período para localizar o registro.
- [Relatório de Infrações](../relatorios/relatorio-infracoes)
- [Reclassificar](../pesagem/reclassificar)

## Integração com outros módulos

| Módulo | Como se relaciona com Consulta de Placas |
|--------|------------------------------------------|
| **Pesagem → Tickets** | Os tickets de pesagem são a origem dos registros exibidos na consulta de placas |
| **Relatório de Passagens** | Para análises mais amplas por placa e período, use o relatório com filtros avançados |
| **Relatório de Infrações** | Cruza dados da consulta com infrações geradas para identificar reincidência |
| **Processamento de Imagens** | A qualidade do OCR impacta diretamente a precisão das placas armazenadas e consultadas |

## Tabela de referência rápida

| Situação | Ação recomendada | Resultado esperado |
|----------|:----------------:|-------------------|
| Nenhum resultado para a placa pesquisada | Ampliar período e verificar taxa OCR do posto | Identificar se houve falha de leitura ou ausência real |
| Placa com múltiplos registros de excesso | Exportar lista para relatório de reincidentes | Dados embasam autuações agravadas e escalonamento ao órgão |
| Peso zerado em passagem recente | Acionar manutenção da balança | Leitura corrigida; pesagens suspeitas auditadas |
| Passagem sem resultado (campo vazio) | Verificar se o ticket foi fechado corretamente | Ticket auditado e reclassificado se necessário |
| Placa no formato antigo não encontrada | Buscar equivalente Mercosul via RENAVAM | Registro localizado e histórico unificado |
