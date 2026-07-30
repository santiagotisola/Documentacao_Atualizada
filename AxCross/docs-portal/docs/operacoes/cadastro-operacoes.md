---
sidebar_position: 2
title: Cadastro de Operações
description: Cadastro e gestão de operações de fiscalização no AxCross
---

# Cadastro de Operações

Permite criar e gerenciar operações de fiscalização, definindo local, período, Equipamentos e parâmetros de monitoramento.

## Como acessar

No **menu lateral**, clique em **Operações**.

![Mapeamento de Rotas / Operações](../img/Mapeamento de Rotas.png)

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome identificador da operação |
| **Local** | Sim | Cruzamento onde a operação será realizada |
| **Data Início** | Sim | Data/hora de início |
| **Data Fim** | Não | Data/hora de encerramento |
| **Equipamentos** | Sim | Câmeras participantes |
| **Responsável** | Não | Agente responsável |

## Passo a passo

1. Acesse **Operações**
2. Clique em **+ Nova Operação**
3. Preencha o **Nome**, **Local** e **Data Início**
4. Adicione os **Equipamentos** participantes
5. Clique em **Salvar**

:::tip
Uma operação ativa vincula todas as passagens dos equipamentos selecionados ao contexto da fiscalização, facilitando a exportação e relatórios.
:::

## Relacionado

- [Alertas](./alertas)
- [Passagens](../relatorios/passagens)
- [Ocorrências e Alertas](../relatorios/ocorrencias-alertas)

| **Status** | Sim | Ativa, Pausada ou Encerrada |
| **Observações** | Não | Informações complementares |

## Passo a passo — Criar nova operação

1. Acesse **Operações** no menu lateral
2. Clique em **Nova Operação**
3. Preencha o **Nome** da operação
4. Selecione o **Local** (cruzamento)
5. Defina **Data Início** e **Data Fim**
6. Clique em **Salvar**

## Ações disponíveis

| Ação | Descrição |
|------|-----------|
| **Editar** | Alterar dados da operação |
| **Pausar** | Suspender temporariamente a operação |
| **Encerrar** | Finalizar a operação |
| **Excluir** | Remover operação (somente se não houver registros vinculados) |

:::warning Atenção
Operações com registros de passagem vinculados não podem ser excluídas, apenas encerradas.
:::

## Boas práticas

- Defina um **Nome** descritivo que identifique o local e o objetivo da operação (ex.: *Fiscalização Av. Paulista — Jul/2026*)
- Vincule somente os equipamentos ativos no período da operação para evitar registros de passagem em equipamentos inativos
- **Encerre** a operação assim que concluída — operações abertas continuam recebendo passagens e podem distorcer relatórios futuros
- Use o campo **Responsável** para rastrear qual agente conduziu a fiscalização em cada ponto

## Relacionado

- [Alertas](./alertas)
- [Veículos Monitorados](./veiculos-monitorados)
- [Relatório de Passagens](../relatorios/relatorio-passagens)
- [Ocorrências e Alertas](../relatorios/ocorrencias-alertas)
