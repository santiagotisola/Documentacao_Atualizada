---
sidebar_position: 4
title: Relatório de Eventos dos Equipamentos
description: Relatório de eventos e ocorrências dos Equipamentos
---

# Relatório de Eventos dos Equipamentos

Exibe o histórico de eventos registrados nos Equipamentos de fiscalização. Permite identificar falhas, manutenções e ocorrências operacionais para acompanhamento do SLA contratual.

Relatório de Eventos](../img/Relatorios%20-%20relatorio%20de%20eventos%20dos%20equipamentos.png)

## Como acessar

**Menu lateral** → Relatórios → **Eventos dos Equipamentos

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Período** | Faixa de datas |
| Equipamento | Filtrar por Equipamento |
| **Tipo de Evento** | Falha, manutenção, vandalismo, reinicialização |
| **Região** | Filtrar por região geográfica |

## Campos exibidos

| Coluna | Descrição |
|--------|-----------|
| **Data/Hora** | Momento do evento |
| Equipamento | Nome e código do Equipamento |
| **Tipo de Evento** | Categoria do evento registrado |
| **Descrição** | Detalhamento do evento |
| **Duração** | Tempo de duração do evento (para falhas) |
| **Responsável** | Técnico ou sistema que registrou o evento |
| **Impacto na Medição** | Indica se o evento afeta o SLA contratual |

## Exportação

Exportável em **Excel** para inclusão em Relatórios de performance e planos de manutenção.

## Tipos de evento

| Tipo | Descrição | Impacto no SLA |
|------|-----------|:--------------:|
| **Falha** | Equipamento parou de funcionar | Sim |
| **Manutenção** | Intervenção técnica programada | Não (se prevista) |
| **Vandalismo** | Dano externo ao equipamento | Sim |
| **Reinicialização** | Reinicialização automática ou manual | Depende da duração |
| **Configuração** | Alteração de parâmetros | Não |

:::tip
Use este relatório mensalmente para subsidiar o **Boletim de Medição** e comprovar eventos que justificam interrupções contratuais.
:::

:::tip Dica
Use em conjunto com o Relatório de Falhas Sequenciais](./falhas-sequenciais) para identificar Equipamentos com problemas recorrentes.
:::

## Relacionado

- [Falhas Sequenciais](./falhas-sequenciais)
- [Processamento de Imagens](./processamento-imagens)
- [Aferições](../operacoes/afericoes)
- [Interrupções](../medicoes/interrupcoes)

## Boas práticas

- Exporte o relatório mensalmente para subsidiar o **Boletim de Medição** e comprovar eventos que impactam o SLA
- Filtre por **Tipo = Falha** para calcular horas de indisponibilidade e o impacto contratual
- Registre manutenções preventivas com **Tipo = Manutenção** e motivo detalhado para distingui-las de falhas não planejadas
- Use em conjunto com [Falhas Sequenciais](./falhas-sequenciais) para identificar equipamentos com problemas recorrentes

---

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Relacionado | [Eventos (Operações)](../operacoes/eventos-equipamentos) | Dados operacionais em tempo real |
| Relacionado | [Equipamentos](../cadastros-basicos/Equipamentos) | Cadastro do Equipamento |
| Relacionado | [Falhas Sequenciais](./falhas-sequenciais) | Relatório de falhas recorrentes |
| Relacionado | [Interrupções](../medicoes/interrupcoes) | Interrupções que afetam medição |
