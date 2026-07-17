---
sidebar_position: 5
title: Tipos de Ocorrências
description: Cadastro dos tipos de ocorrência para categorização de alertas no AxCross
---

# Tipos de Ocorrências

Define as categorias de ocorrência disponíveis para classificação de alertas e eventos registrados no sistema.

## Como acessar

No **menu lateral**, clique em **Veículos Monitorados** e selecione **Tipos de Ocorrências**.

![Tipos de Ocorrências](../img/Tipo de Ocorrência.png)

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome identificador do tipo de ocorrência |
| **Descrição** | Não | Detalhamento do tipo de ocorrência |
| **Status** | Sim | Ativo ou Inativo |

## Tipos padrão do sistema

| Tipo | Descrição |
|------|-----------|
| **Placa Monitorada** | Veículo cadastrado na lista de monitorados foi detectado |
| **MANCHA01 - Tempo na Mancha** | Veículo permaneceu na área monitorada além do tempo máximo configurado (padrão: 4 horas) |

## Passo a passo — Criar novo tipo de ocorrência

1. Acesse **Veículos Monitorados → Tipos de Ocorrências** no menu lateral
2. Clique em **Novo Tipo**
3. Informe o **Nome** do tipo
4. Opcionalmente, preencha a **Descrição**
5. Clique em **Salvar**

## Uso na operação

Os tipos de ocorrência são utilizados ao:

- **Criar alertas manuais** — na tela de Alertas, selecione o tipo para categorizar o evento
- **Gerar Relatórios** — no Relatório de Ocorrências, filtre por tipo para análise específica
- **Configurar regras automáticas** — o tipo MANCHA01 é disparado automaticamente pelas Configurações do sistema

:::info Configuração do MANCHA01
O tempo máximo na mancha é configurado em **Configurações do Sistema → MDF-e → Horas máximas na mancha**. O padrão é 4 horas.
:::

:::caution Tipos em uso
Tipos de ocorrência vinculados a alertas existentes não podem ser excluídos. Inative-os para impedir novos usos.
:::
