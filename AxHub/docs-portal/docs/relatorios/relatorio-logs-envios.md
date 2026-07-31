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

## Fluxo de auditoria de envios

1. Acessar **Relatórios → Logs de Envios a Integração**
2. Filtrar por **Status = Erro** para identificar falhas de comunicação
3. Para cada erro: verificar a **Mensagem** de retorno do sistema externo
4. Se o problema for no destino: aguardar estabilidade e usar **Reenviar**
5. Se o problema for no payload: corrigir a configuração da integração
6. Exportar o histórico periódicamente como evidência de conformidade

## Tabela de referência — códigos de status HTTP

| Status HTTP | Significado | Ação |
|:-----------:|-------------|------|
| **200 / 201** | Envio aceito | Nenhuma |
| **400** | Payload inválido | Corrigir configuração da integração |
| **401 / 403** | Não autorizado | Verificar token/API key |
| **404** | Endpoint não encontrado | Verificar URL configurada |
| **5xx** | Erro no servidor destino | Aguardar estabilidade e reenviar |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Erro 401 persistente | Token expirado ou inválido | Atualizar token em Configurações → Webhooks |
| Erro 400 repetido | Formato do payload incorreto | Revisar layout de exportação com o destino |
| Envio pendente há mais de 1 hora | Sistema destino offline | Aguardar e acionar suporte do destino |
| Registros duplicados no destino | Reenvio duplo | Verificar histórico antes de usar Reenviar |

## Relacionado

- [Webhooks](../administracao/webhooks)
- [Exportação de Infrações](../infracoes/exportacao)
- [Lotes de Importação](./lote-importacao)

## Perguntas frequentes

**Posso reenviar um registro que já foi recebido com sucesso pelo destino?**
Não recomendado. Verificar o histórico antes de usar **Reenviar** — registros duplicados no destino podem causar dupla multa ou rejeição do lote completo.

**Erro 401 persiste mesmo após atualizar o token. O que verificar?**
Verifique se o token foi salvo corretamente em Configurações → Webhooks e se o sistema destino já aplicou a atualização. Alguns sistemas cacheêm tokens por até 15 minutos.

**Os logs de envios são retidos por quanto tempo?**
A retenção depende da política de armazenamento do servidor. Exporte mensalmente para arquivo externo como evidência de conformidade com o órgão contratante.
