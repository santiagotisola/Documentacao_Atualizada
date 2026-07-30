---
sidebar_position: 12
title: Logs de Envios a Integração
description: Log de passagens e infrações enviadas para sistemas externos no AxHub
---

# Logs de Envios a Integração

Exibe o log completo de **passagens e infrações enviadas** para sistemas de integração externos. Permite rastrear envios com sucesso e identificar falhas de comunicação.

![Logs de Envios](../img/Relatorio%20-%20Relatorio%20de%20log%20de%20passagens%20enviadas%20a%20integração.png)

## Como acessar

**Menu lateral** → Relatórios → **Logs de Envios a Integração**

## Filtros

| Filtro | Descrição |
|--------|-----------|
| **Período** | Faixa de datas do envio |
| **Destino** | Sistema de destino |
| **Status** | Sucesso, Erro, Pendente |
| **Tipo** | Passagem, Infração ou Lote |

## Colunas

| Coluna | Descrição |
|--------|-----------|
| **Data/Hora** | Momento do envio |
| **Destino** | Sistema de destino |
| **Registros** | Quantidade enviada |
| **Status** | Sucesso / Erro / Pendente |
| **Mensagem** | Retorno do sistema externo |
| **Tentativas** | Número de tentativas |

## Uso operacional

- **Diagnóstico de falhas** — identificar lotes não entregues
- **Auditoria** — comprovar envios para órgãos externos

:::tip
Filtre por **Status = Erro** e reenvie manualmente os registros com falha. Erros repetidos no mesmo destino podem indicar problema de integração que requer suporte técnico.
:::

## Casos de uso

- **Confirmação de envio** — verifique se todos os registros foram entregues ao sistema integrador do órgão contratante
- **Diagnóstico de falhas** — filtre por **Status = Erro** para identificar registros que precisam de reenvio manual
- **Auditoria de integração** — exporte o histórico de comunicações para comprovação em prestação de contas
- **Alerta de conectividade** — erros repetidos no mesmo destino indicam problema de integração que requer suporte técnico

## Relacionado

- [Webhooks](../administracao/webhooks)
- [Lotes de Exportação](../glossario/lote-exportacao)

- **Reprocessamento** — identificar registros para reenvio

## Exportação

Disponível em **Excel** e **PDF**.

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
| Relacionado | [Exportação](../infracoes/exportacao) | Lotes de Infração exportados |
| Relacionado | [Webhooks](../administracao/webhooks) | Configuração de integrações |
| Relacionado | [Lotes de Importação](./lote-importacao) | Dados recebidos |
