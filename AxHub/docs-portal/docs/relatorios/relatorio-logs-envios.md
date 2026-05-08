---
sidebar_position: 12
title: Logs de Envios a Integração
description: Relatório de logs de passagens enviadas para integração
---

# Logs de Envios a Integração

Exibe o log de passagens e infrações enviadas para sistemas de integração externos (DETRAN, órgãos autuadores, etc.). Permite rastrear envios com sucesso e identificar falhas de comunicação.

![Logs de Envios](../img/Relatorio%20-%20Relatorio%20de%20log%20de%20passagens%20enviadas%20a%20integração.png)

## Como acessar

**Menu lateral** → Relatórios → **Logs de Envios a Integração**

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Período** | Faixa de datas do envio |
| **Destino** | Sistema de destino da integração |
| **Status** | Sucesso, Erro, Pendente |
| **Tipo de Registro** | Passagem, Infração, Lote |

## Campos exibidos

| Coluna | Descrição |
|--------|-----------|
| **Data/Hora** | Momento do envio |
| **Destino** | Sistema de destino |
| **Registros** | Quantidade de registros enviados |
| **Status** | Sucesso, Erro, Pendente |
| **Mensagem** | Retorno do sistema externo |
| **Tentativas** | Número de tentativas de envio |
| **Tempo Resposta** | Latência da integração (ms) |

## Ações disponíveis

| Ação | Descrição |
|------|-----------|
| **Reenviar** | Força novo envio de registros com erro |
| **Ver detalhes** | Exibe o payload completo enviado/recebido |

:::tip Dica
Registros com status **Erro** podem ser reenviados manualmente. Verifique a disponibilidade do sistema de destino antes de reenviar.
:::

---

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Relacionado | [Exportação](../infracoes/exportacao) | Lotes de infração exportados |
| Relacionado | [Webhooks](../administracao/webhooks) | Configuração de integrações |
| Relacionado | [Lotes de Importação](./lote-importacao) | Dados recebidos |
