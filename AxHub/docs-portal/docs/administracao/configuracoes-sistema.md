---
sidebar_position: 3
title: Configurações do Sistema
description: Configurações gerais do AxHub
---

# Configurações do Sistema

As configurações gerais do AxHub permitem ajustar parâmetros globais do sistema como tarjas de imagem, índices de performance e layouts de arquivo.

## Como acessar

**Menu lateral** → Configurações

## Funcionalidades

- Configurar tarjas (overlays) de informações nas imagens de infração
- Definir índices de performance e suas penalidades
- Gerenciar layouts de arquivo para importação e exportação
- Configurar parâmetros gerais do sistema

## Configurações por Aba

As configurações do sistema são organizadas em abas temáticas:

### Aba Triagem

![Configurações - Tempo de Análise de Imagem](../img/triagem-tempo-analise.png)

Controla parâmetros relacionados ao processamento de infrações:

- **Prazo para Triagem**: Define em dias o prazo legal para realizar triagem (padrão: 20 dias)
- **Tempo de Análise de Imagem**: Tempo em minutos para análise individual de cada imagem (padrão: 5 minutos)
- **Motivo de Descarte**: Opções de invalidação de infrações
- **Exigências de Dados**: Modelo/marca, código do agente, código externo
- **Meta diária**: Quantidade esperada de processamento por usuário

:::info Documentação Detalhada
Para instruções completas sobre configuração de tempo de triagem com passo a passo ilustrado, veja a seção [Triagem de Infrações](../infracoes/triagem.md#filtros-disponíveis) na documentação de Triagem.
:::

### Outras Abas

- **Orgão**: Configurações específicas do órgão autuador
- **Enquadramentos**: Gestão de códigos de infração
- **Equipamentos**: Parâmetros técnicos dos dispositivos
- **Sistema**: Configurações globais e gerais

## Armazenamento

Todas as configurações do sistema são persistidas em `TBConfiguracoes` como pares chave-valor:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| **Tipo Configuração** | varchar(100) | Chave identificadora (ex: `PrazoTriagem`, `TempoAnaliseImagem`, `MetaDiaria`) |
| **Valor Configuração** | texto | Valor serializado em texto (número, JSON, string) |

Essa arquitetura de chave-valor permite adicionar novas configurações sem alteração de schema.

## Termos Tecnicos

| Termo | Definicao |
|-------|-----------|
| [Enquadramento](../glossario/enquadramento) | Ver definicao no glossario |
| [Infracao de Transito](../glossario/infracao) | Ver definicao no glossario |
| [Triagem](../glossario/triagem) | Ver definicao no glossario |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Webhooks](./webhooks) | Integracoes configuradas |
| Relacionado | [Relatorios Power BI](./relatorios-power-bi) | Dashboards de gestao |
