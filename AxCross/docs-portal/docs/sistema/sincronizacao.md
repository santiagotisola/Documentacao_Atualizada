---
sidebar_position: 2
title: Sincronização de Passagens
description: Sincronização de dados de passagens com Elastic Search no AxCross
---

# Sincronização de Passagens

Permite sincronizar os registros de passagens do banco de dados com o mecanismo de busca **Elastic Search**, garantindo que os Relatórios e consultas utilizem dados atualizados.

## Como acessar

No **menu lateral**, clique em Configurações e selecione **Sincronização de dados**.

![Sincronização de Passagens](../img/Sincronização de Passagens.png)

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Data de Início** | Sim | Data a partir da qual os dados serão sincronizados |

## Passo a passo — Executar sincronização

1. Acesse **Configurações → Sincronização de dados**
2. Informe a **Data de Início** da sincronização
3. Clique em **Iniciar Sincronização**
4. Aguarde a conclusão — o sistema exibirá o progresso

:::warning Quando sincronizar?
Execute a sincronização quando:
- Relatórios exibirem dados desatualizados
- Após restauração de backup
- Após manutenção no Elastic Search

Não execute durante horário de pico de operações.
::: no menu lateral
2. Informe a **Data de Início** da sincronização
3. Clique em **Sincronizar passagens com Elastic Search**
4. Aguarde a conclusão do processo

## Quando utilizar

A sincronização deve ser executada nas seguintes situações:

| Situação | Descrição |
|----------|-----------|
| **Após migração de dados** | Quando registros são importados em lote para o sistema |
| **Dados desatualizados** | Quando Relatórios não refletem as passagens mais recentes |
| **Após falha de sincronização** | Para reprocessar dados que não foram indexados corretamente |
| **Manutenção programada** | Como parte de rotinas de manutenção periódica |

:::warning Impacto no desempenho
A sincronização pode consumir recursos significativos do servidor. Recomenda-se executar em horários de baixo tráfego, preferencialmente fora do horário operacional.
:::

:::caution Permissão necessária
Apenas Usuários com perfil de **Administrador** têm acesso à função de sincronização.
:::
