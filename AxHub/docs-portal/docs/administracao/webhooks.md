---
sidebar_position: 4
title: Webhooks
description: Configuração de webhooks para integrações externas no AxHub
---

# Webhooks

Permite configurar **webhooks** para notificar sistemas externos sobre eventos do AxHub em tempo real — como geração de infrações, lotes e alterações de status.

![Webhooks](../img/Configurações%20-%20Webhooks.png)

## Como acessar

**Menu lateral** → Configurações → **Webhooks**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **URL** | Sim | Endpoint do sistema externo (HTTPS) |
| **Evento** | Sim | Tipo de evento que dispara o webhook |
| **Segredo** | Não | Token para validação HMAC |
| **Status** | Sim | Ativo ou Inativo |

## Eventos disponíveis

| Evento | Descrição |
|--------|-----------|
| `infracao.criada` | Nova infração registrada |
| `infracao.auditada` | Infração aprovada na auditoria |
| `lote.exportado` | Lote enviado ao órgão |
| `equipamento.offline` | Equipamento perdeu heartbeat |

## Boas práticas

- Use HTTPS no endpoint (nunca HTTP em produção)
- Valide o segredo HMAC no sistema receptor
- Configure retry com backoff exponencial no lado receptor

:::info
Webhooks com erro 4xx (cliente) não são reenviados automaticamente. Webhooks com erro 5xx (servidor) são reenviados até 3 vezes com intervalo de 60 segundos.
:::

## Relacionado

- [Logs de Envios](../relatorios/relatorio-logs-envios)
- [Integrações](../sistema/integracoes)

## Navegação Relacionada

| Tipo | Página |
|------|--------|
| Referencia | [Manual de Integração](../referencia-tecnica/webhooks) |

| **Método** | POST, PUT |
| **Headers** | Cabeçalhos customizados (autenticação, etc.) |
| **Ativo** | Status do webhook |

:::info Integrações
Webhooks permitem integrar o AxHub com sistemas de terceiros como ERPs, DETRAN e órgãos de trânsito.
:::

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Configuração'uração'uração'uração'uração'uração'uração'uração'uração'uração'uração'uração'uração'uração'uração'uração'uração'uração'uração'uração'uração'uração'uração'uração'uracoes do Sistema](./configuracoes-sistema) | Config geral |
| Relacionado | [Exportacao](../infracoes/exportacao) | Webhook de exportacao |
