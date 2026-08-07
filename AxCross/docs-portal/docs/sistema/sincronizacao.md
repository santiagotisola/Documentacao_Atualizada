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
:::

## Quando utilizar

A sincronização deve ser executada nas seguintes situações:

- Passagens não aparecem nos relatórios após 10 minutos
- Pesquisa de placa não retorna resultados esperados
- Após restauração de banco de dados

:::tip
A sincronização processa dados em background. Monitore o progresso na tela e evite navegar em outras áreas até a conclusão.
:::

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

## Relacionado

- [Configurações do Sistema](./configuracoes)
- [Logs de Acesso](../administracao/logs-acesso)
- [Relatório de Passagens](../relatorios/relatorio-passagens)

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Sincronização não conclui | Volume muito alto de registros ou servidor sobrecarregado | Executar em horário de baixo tráfego e parcelando por data |
| Passagens não aparecem após sincronização | Elastic Search offline ou sem índice | Verificar o status do Elastic Search e contatar o suporte |
| Erro de permissão ao iniciar | Usuário sem perfil de Administrador | Solicitar ao administrador do sistema acesso ao módulo |

## Quando usar

| Situação | Descrição |
|----------|-----------|
| **Dados desatualizados** | Relatórios não refletem passagens após 10+ minutos |
| **Após restauração de backup** | Reindexar dados importados do banco |
| **Após falha de sincronização** | Reprocessar registros não indexados |
| **Manutenção programada** | Como parte de rotinas periódicas do Elasticsearch |

:::warning
Execute a sincronização fora do horário de pico operacional. O processo consome recursos significativos do servidor e pode afetar o desempenho do monitoramento em tempo real.
:::

## Perguntas frequentes

**Quando devo executar a sincronização de passagens?**
Execute quando passagens não aparecerem nos relatórios após 10 minutos, após restauração de backup ou após manutenção no Elasticsearch. Não execute durante horário de pico, pois o processo consome recursos significativos do servidor.

**O que fazer quando a sincronização demora muito e não conclui?**
Divida a sincronização em faixas de data menores (ex.: sincronizar semana a semana) para reduzir o volume processado por vez. Se o problema persistir, verifique o status do Elasticsearch e contate o suporte técnico para investigação do serviço.

**Qual o impacto de não sincronizar após uma restauração de backup?**
Os relatórios continuarão usando o índice antigo do Elasticsearch, que pode não refletir os dados restaurados. Passagens e alertas do período afetado podem não aparecer ou aparecer incorretamente. A sincronização é essencial após qualquer restauração.

## Integração com outros módulos

| Módulo | Como usa este cadastro/relatório |
|--------|----------------------------------|
| **Relatório de Passagens** | Depende do Elastic Search indexado — passagens não sincronizadas não aparecem nos resultados de busca |
| **Monitoramento Online** | Passagens exibidas em tempo real são indexadas automaticamente; a sincronização manual recupera registros históricos perdidos |
| **Rastreamento de Placas** | Consultas por placa dependem do índice atualizado — sincronizar garante que todo o histórico esteja disponível |

## Exemplo prático

**Cenário**: Após a restauração de backup em um servidor que ficou offline por 6 horas, os operadores percebem que o **Rastreamento de Placas** não retorna passagens do período da falha. O índice do Elasticsearch ficou desatualizado.

**Passo a passo**:

1. Acesse **Configurações → Sincronização de dados** (perfil Administrador)
2. Informe a **Data de Início**: data de início da janela afetada pela falha
3. Clique em **Iniciar Sincronização**
4. Aguarde a progressão — não navegue para outras áreas durante o processo
5. Após conclusão, acesse **Relatórios → Rastreamento de Placas** e verifique se as passagens do período aparecem

**Resultado**: O Elasticsearch é reindexado com os dados restaurados. Passagens que não apareciam voltam a ser acessíveis em todos os relatórios e consultas de placa. O processo levou 12 minutos para reindexar 6 horas de dados.
| **Logs de Acesso** | Toda execução de sincronização é registrada no log de acesso com o usuário e horário de início |
