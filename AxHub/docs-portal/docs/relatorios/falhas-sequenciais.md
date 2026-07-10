---
sidebar_position: 5
title: Relatório de Falhas Sequenciais
description: Relatório de falhas sequenciais nos Equipamentos
---

# Relatório de Falhas Sequenciais

Identifica Equipamentos que registraram falhas em sequência, o que pode indicar problemas técnicos persistentes, vandalismo ou defeito no hardware. Utilizado pela equipe de manutenção e pelo gestor do contrato para acompanhamento de SLA.

Relatório de Falhas](../img/Relatorios%20-%20relatorio%20de%20falhas%20sequenciais.png)

## Como acessar

**Menu lateral** → Relatórios → **Falhas Sequenciais**

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Período** | Faixa de datas |
| Equipamento | Filtrar por Equipamento |
| **Quantidade mínima** | Número mínimo de falhas consecutivas para exibir |
| **Tipo de Falha** | Comunicação, imagem, energia, sensor |

## Campos exibidos

| Coluna | Descrição |
|--------|-----------|
| Equipamento | Nome e código do Equipamento |
| **Período da Falha** | Início e fim da sequência de falhas |
| **Quantidade de Falhas** | Número de ocorrências consecutivas |
| **Tipo** | Categoria da falha registrada |
| **Duração Total** | Tempo total de indisponibilidade |
| **Impacto no SLA** | Indica se afeta o cálculo de disponibilidade contratual |

## O que são falhas sequenciais

Uma **falha sequencial** ocorre quando o mesmo Equipamento apresenta o mesmo tipo de problema em registros consecutivos, sem nenhum registro bem-sucedido entre eles. O threshold (quantidade mínima) é configurado em [Sequenciais de Infrações](../administracao/sequenciais-infracoes).

## Exportação

Exportável em **Excel** para uso em Relatórios técnicos e comprovantes de manutenção.

---

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Relacionado | [Sequenciais de Infrações](../administracao/sequenciais-infracoes) | Configuração do threshold |
| Relacionado | [Eventos dos Equipamentos](./eventos-equipamentos) | Histórico completo de eventos |
| Relacionado | [Interrupções](../medicoes/interrupcoes) | Impacto na medição contratual |
