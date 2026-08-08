---
sidebar_position: 1
title: Contratos
description: Cadastro de contratos de prestação de serviço
---

# Contratos

Relatório de Pesagem](../img/Relatorio%20de%20pesagem.png)

Registro dos contratos de prestação de serviço de pesagem, vinculando postos, períodos e metas de performance.

## Como acessar

**Menu lateral** → Medições → **Contratos**

## Listagem

### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Número** | Número do contrato |
| **Contratante** | Órgão ou empresa contratante |
| **Vigência Início** | Data de início |
| **Vigência Fim** | Data de encerramento |
| **Postos** | Postos de pesagem cobertos |
| **Status** | Ativo, Vencido, Suspenso |

## Campos de cadastro

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Número** | Sim | Número do contrato |
| **Contratante** | Sim | Nome da organização contratante |
| **Vigência Início** | Sim | Data de início da vigência |
| **Vigência Fim** | Sim | Data de encerramento |
| **Postos** | Sim | Postos cobertos pelo contrato |
| **Meta Disponibilidade** | Não | % mínimo de disponibilidade exigido |
| **Meta OCR** | Não | % mínimo de aproveitamento OCR |

## Passo a passo

1. Acesse **Medições → Contratos**
2. Clique em **+ Novo**
3. Preencha o **Número**, **Contratante** e **Vigência**
4. Selecione os **Postos** cobertos
5. Defina as metas de **Disponibilidade** e **OCR**
6. Clique em **Salvar**

:::tip
Contrato com metas bem configuradas garante que o sistema calcule automaticamente os índices ao gerar medições mensais.
:::

## Impacto contratual

- A **disponibilidade** é calculada automaticamente com base no tempo ativo dos equipamentos vinculados ao contrato
- A **meta de OCR** define o nível mínimo de aproveitamento de imagens exigido pelo contratante
- Postos ou equipamentos mal vinculados distorcem os índices calculados e podem causar disputãs contratuais
- A vigência correta é fundamental: períodos incorretos geram medições fora do prazo do contrato

## Relacionado

- [Grupos de Equipamentos](../cadastros-basicos/grupos-equipamentos)
- [Criar Medição](./criar-medicao)

## Fluxo contratual

1. Contrato assinado com o órgão contratante
2. Cadastrar o contrato em **Medições → Contratos**
3. Vincular os **Postos de pesagem** cobertos
4. Definir as **Metas** de disponibilidade e OCR
5. A cada mês: gerar a medição e conferir os índices calculados
6. Encaminhar o Boletim de Medição ao contratante até o prazo

## Tabela de referência — status de contratos

| Status | Descrição | Ação |
|--------|-----------|------|
| **Ativo** | Contrato em vigência | Gerar medições mensais |
| **Vencido** | Prazo expirado | Renovar ou encerrar |
| **Suspenso** | Pausa temporária | Não gerar medições |

## Erros comuns

| Situação | Causa | Solução |
|----------|-------|----------|
| Medição não gera dados do contrato | Contrato vencido ou suspenso | Verificar e atualizar vigência |
| Índice calculado incorreto | Posto não vinculado ao contrato | Adicionar posto nas configurações |
| Meta não aparece no boletim | Meta não cadastrada | Editar contrato e preencher metas |
- [Índices de Performance](./indices-performance)


| **Nº Contrato** | Número do contrato |
| **Contratante** | Órgão contratante |
| **Vigência** | Período de validade |
| **Postos** | Postos vinculados |
| **Status** | Ativo, Encerrado, Suspenso |

### Passo a passo — Cadastrar Contrato

1. Acesse **Medições** → **Contratos**
2. Clique em **+ Novo**
3. Informe o Número do contrato
4. Selecione o Contratante
5. Defina o período de Vigência
6. Vincule os Postos de pesagem
7. Clique em **Salvar**

---

## Funcionalidades de Medições

| Funcionalidade | Descrição |
|---|---|
| [**Índices de Performance**](../medicoes/indices-performance) | Indicadores de desempenho contratual |
| [**Interrupções**](../medicoes/interrupcoes) | Registro de interrupções operacionais |
| [**Gerar Medição**](../medicoes/criar-medicao) | Gerar Relatório de medição contratual |

## Perguntas frequentes

**O que acontece com as medições se o contrato for inativado?**
Medições geradas no período de vigência são preservadas no histórico. Após inativar o contrato, não será mais possível gerar novas medições vinculadas a ele.

**Posso vincular o mesmo posto a múCtiplos contratos ao mesmo tempo?**
Não recomendado. Um posto deve estar associado a apenas um contrato ativo por vez para evitar conflito nos cálculos de disponibilidade e volume de pesagens.

**As metas de disponibilidade e OCR podem ser alteradas após o contrato ser criado?**
Sim. Edite o contrato e atualize as metas. No entanto, medições já geradas não são recalculadas retroativamente — a alteração vale apenas para as próximas medições.

## Integração com outros módulos

| Módulo | Como se relaciona com Contratos |
|--------|----------------------------------|
| **Medições → Criar Medição** | O contrato é selecionado ao gerar o boletim — define o período, os postos e as metas avaliadas |
| **Medições → Interrupções** | Interrupções registradas nos postos do contrato impactam o índice de disponibilidade |
| **Medições → Índices de Performance** | Exibe os indicadores contratuais calculados (OCR, disponibilidade, volume) por contrato |
| **Operações** | As operações realizadas nos postos vinculados ao contrato alimentam os cálculos do boletim |

## Ciclo mensal

| Etapa | Quando | Ação |
|-------|--------|------|
| **Verificar vigência** | Dia 1 do mês | Confirmar status Ativo e metas corretas |
| **Registrar interrupções** | Durante o mês | Lançar em [Interrupções](./interrupcoes) imediatamente |
| **Gerar medição** | Até dia 5 do mês seguinte | Acessar [Criar Medição](./criar-medicao) |
| **Revisar índices** | Após geração | Comparar disponibilidade e OCR com metas |
| **Finalizar e enviar** | Conforme contrato | Exportar boletim PDF e enviar ao contratante |

:::warning
Verifique o prazo contratual de entrega do Boletim de Medição — em geral entre 5 e 10 dias após o encerramento do mês.
:::
