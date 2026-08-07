---
sidebar_position: 7
title: Processamento por Usuário
description: Produtividade de triagem por operador no AxTon
---

# Processamento por Usuário

Exibe a **produtividade de cada operador** na triagem de infrações: infrações triadas, aprovadas, descartadas e tempo médio por análise.

## Como acessar

**Menu lateral** → Relatórios → **Processamento por Usuário**

## Filtros

| Filtro | Descrição |
|--------|-----------|
| **Período** | Data início e fim |
| **Usuário** | Filtrar por operador |
| **Posto** | Filtrar por localidade |

## Colunas

| Coluna | Descrição |
|--------|-----------|
| **Usuário** | Nome do operador |
| **Triadas** | Infrações analisadas no período |
| **Aprovadas** | Infrações confirmadas |
| **Descartadas** | Infrações rejeitadas |

## Como usar

1. Acesse **Relatórios → Processamento por Usuário**
2. Selecione o **Período**, **Usuário** e **Posto** (opcional)
3. Clique em **Gerar**
4. Exporte em CSV para análise gerencial

:::tip
Alta taxa de descarte em um usuário pode indicar necessidade de treinamento. Baixa taxa pode indicar aprovação inadequada sem critério.
:::

## Interpretação das métricas

| Métrica | Normal | Alerta |
|---------|:------:|:------:|
| Taxa de descarte | 5-15% | >20% ou &lt;2% |
| Infrações/hora | 80-120 | &lt;40 ou >150 |
| Tempo médio | 15-45s | >60s |

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Usuário não aparece | Sem registros no período | Ampliar o período |
| Métricas zeradas | Triagem não registrada | Verificar configuração de posto |

## Relacionado

- [Triagem](../glossario/triagem)
- [Motivos de Descarte](../pesagem/motivos)
- [Logs de Acesso](../controle-acesso/logs-acesso)

| Perfil | Meta mín/hora |
|--------|:-------------:|
| Sênior | 120 infrações |
| Pleno | 80 infrações |
| Em treinamento | 40 infrações |

## Relacionado

- [Triagem](../glossario/triagem)
- [Motivos de Descarte](../pesagem/motivos)
- [Logs de Acesso](../controle-acesso/logs-acesso)

:::tip
Use este relatório para avaliar a produtividade de operadores e identificar possíveis inconsistências na taxa de descarte. Alta taxa de descarte em um usuário específico pode indicar necessidade de treinamento.
:::

## Metas de produtividade

| Perfil | Meta mín. infrações/hora |
|--------|:------------------------:|
| Analista sênior | 120 |
| Analista pleno | 80 |
| Em treinamento | 40 |

## Relacionado

- [Triagem](../glossario/triagem)
- [Motivos de Descarte](../pesagem/motivos)
- [Logs de Acesso](../controle-acesso/logs-acesso)


## Erros comuns

| Problema | Causa | Solução |
|----------|-------|---------|
| Usuário sem registros | Não realizou triagem no período | Verificar log de acesso do usuário |
| Taxa de descarte muito alta | Treinamento insuficiente | Revisar sessões de capacitação |
| Produtividade zerada | Sem operação no posto no período | Verificar operações vinculadas ao posto |

## Relacionado

- [Triagem](../glossario/triagem)
- [Motivos de Descarte](../pesagem/motivos)
- [Logs de Acesso](../controle-acesso/logs-acesso)

## Perguntas frequentes

**O que significa taxa de descarte muito alta em um operador específico?**
Taxa acima de 20% pode indicar treinamento insuficiente ou critério inadequado na triagem. Revise as sessões de capacitação e analise uma amostra das infrações descartadas por esse operador.

**Como identificar se um operador não realizou triagem no período?**
Se o usuário não aparecer no relatório, filtre os Logs de Acesso para verificar se ele sequer fez login durante o período. Ausência de registro indica que não acessou o sistema.

**A produtividade de triagem impacta diretamente o pagamento contratual?**
Depende do contrato. Em contratos com SLA de triagem (prazo máximo para processar infrações), queda de produtividade pode gerar atraso no lote de exportação e consequentemente penalidade por não conformidade.

## Integração com outros módulos

| Módulo | Como se relaciona com Processamento por Usuário |
|--------|--------------------------------------------------|
| **Controle de Acesso → Usuários** | Os usuários listados no relatório são os operadores de triagem cadastrados no sistema |
| **Relatório de Infrações** | As infrações processadas por cada usuário aparecem consolidadas neste relatório |
| **Logs de Acesso** | Cruza a atividade de triagem com os logs de login para confirmar presença do operador |
| **Medições → Contratos** | Em contratos com SLA de triagem, a produtividade deste relatório é monitorada para cumprimento |

## Exemplo prático

**Cenário**: O supervisor percebe que um operador junior tem taxa de descarte de apenas 1,5% — muito abaixo da referencia de 5-15%. Antes de dar feedback positivo, investiga se as aprovacões estão corretas.

**Passo a passo**:

1. Acesse **Relatórios → Processamento por Usuário**
2. Filtre por **Usuário** = operador em questão e **Período** = última semana
3. Confirme: 45 infrações triadas, apenas 1 descartada — taxa 2,2%
4. Acesse **Operações → Triagem** e filtre pelas infrações aprovadas pelo operador no mesmo período
5. Revise uma amostra aleatória de 10 infrações: 3 têm placa ilegível e foram aprovadas incorretamente
6. Reverte as 3 infrações incorretas e agenda treinamento sobre critérios de descarte

**Resultado**: As 3 infrações incorretas são corrigidas antes do lote de exportação. O operador recebe treinamento especifico em critérios de qualidade de imagem, elevando sua taxa de descarte para 8% na semana seguinte.
