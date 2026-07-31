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
- [Integrações VARCO](../referencia-tecnica/integracao-varco) — Variáveis disponíveis nos payloads de câmeras OCR/LPR
- [Banco de Dados](../referencia-tecnica/banco-de-dados)

## Integração com VARCO

Os equipamentos de câmera **VARCO** podem enviar dados diretamente ao AxHub via HTTP webhook. As variáveis do template VARCO são mapeadas automaticamente nos campos do AxHub.

**Variáveis VARCO disponíveis nos payloads:**

| Variável VARCO | Uso no webhook AxHub |
|----------------|---------------------|
| `{{plate}}` | Placa da passagem/infração |
| `{{cameraId}}` | Identificação do equipamento |
| `{{image}}` | Imagem base64 da captura |
| `{{plateProbability}}` | Confiança da leitura OCR |
| `{{vehicleType}}` | Tipo do veículo |
| `{{utcYear}}..{{utcSeconds}}` | Timestamp UTC da detecção |

→ Veja a [referência completa das variáveis VARCO](../referencia-tecnica/integracao-varco)

## Exemplos de uso

**Integração com sistema de BI:**  
Configure um webhook para `lote.exportado` apontando para o endpoint do BI. A cada exportação, o BI recebe automaticamente os dados e atualiza os dashboards.

**Alerta de equipamento offline:**  
Configure um webhook para `equipamento.offline` apontando para um sistema de tickets de suporte (ex.: Jira, Zendesk). Uma ocorrência é aberta automaticamente quando o equipamento perde heartbeat.

## Tabela de referência — eventos e payloads

| Evento | Quando dispara | Dados enviados |
|--------|:-------------:|----------------|
| `infracao.criada` | Nova infração registrada | ID, placa, data, velocidade |
| `infracao.auditada` | Infração aprovada | ID, auditor, data |
| `lote.exportado` | Lote enviado ao órgão | ID lote, sequencial, quantidades |
| `equipamento.offline` | Heartbeat perdido | ID equipamento, última comunicação |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Webhook não acionado | URL incorreta ou endpoint offline | Testar URL e verificar status do receptor |
| Erro 4xx no receptor | Payload rejeitado pelo sistema externo | Verificar formato esperado pelo receptor |
| Erro 5xx repetido | Receptor instável | Verificar disponibilidade do serviço externo |

## Navegação Relacionada

| Tipo | Página |
|------|--------|
| Referencia | [Manual de Integração](../referencia-tecnica/webhooks) |

| **Método** | POST, PUT |
| **Headers** | Cabeçalhos customizados (autenticação, etc.) |

## Configuração típica

**Webhook para notificação de lote exportado (integração com BI):**

| Campo | Valor de exemplo |
|-------|:----------------:|
| URL | `https://painel.empresa.com.br/api/axhub/events` |
| Evento | `lote.exportado` |
| Segredo | `axhub-secret-2026` |
| Status | Ativo |

**Webhook para alerta de equipamento offline (abertura de ticket):**

| Campo | Valor de exemplo |
|-------|:----------------:|
| URL | `https://suporte.empresa.com.br/api/tickets/create` |
| Evento | `equipamento.offline` |
| Segredo | `support-token-xyz` |
| Status | Ativo |

:::tip Dica de segurança
Sempre configure o campo **Segredo** e valide a assinatura HMAC no sistema receptor. Isso garante que apenas o AxHub possa disparar notificações no endpoint configurado.
:::
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

## Perguntas frequentes

**O que acontece quando o endpoint do webhook retorna erro 5xx?**
O sistema tenta reenviar automaticamente até 3 vezes com intervalo de 60 segundos. Após isso, o evento é descartado. Monitore os Logs de Envios para identificar falhas recorrentes.

**Posso testar um webhook antes de ativar em produção?**
Sim. Configure o webhook apontando para uma URL de teste (ex.: webhook.site) e gere um evento manualmente para validar o payload recebido.

**O segredo HMAC é obrigatório?**
Não obrigatório, mas altamente recomendado. Sem o HMAC, o sistema receptor não consegue verificar a autenticidade das notificações recebidas.

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Configurações do Sistema](./configuracoes-sistema)** | As credenciais e URLs base dos webhooks são configuradas nas Configurações do Sistema |
| **[Exportação de Infrações](../infracoes/exportacao)** | Webhooks podem ser acionados após cada exportação para notificar sistemas externos |
| **[Logs de Envios](../relatorios/relatorio-logs-envios)** | Falhas nos webhooks são registradas nos logs de envios para diagnóstico |
| **[Monitoramento Online](../operacoes/monitoramento-online)** | Eventos de equipamentos podem disparar webhooks configurados para notificações em tempo real |

## Exemplo prático

**Integrando o AxHub com um painel BI ao exportar lotes:**

1. Acessar **Configurações → Webhooks** e clicar em **+ Novo**
2. Preencher:
   - **URL**: `https://painel.empresa.com.br/api/axhub/events`
   - **Evento**: `lote.exportado`
   - **Segredo**: gerar token HMAC seguro
3. Clicar em **Salvar** e testar com `webhook.site` antes de apontar para produção
4. No sistema BI: configurar endpoint para receber POST com validação HMAC
5. Após confirmar o recebimento: ativar o webhook em **Status = Ativo**

:::tip
Sempre valide o campo **Segredo** HMAC no sistema receptor — garante que apenas o AxHub pode disparar notificações no endpoint configurado.
:::
