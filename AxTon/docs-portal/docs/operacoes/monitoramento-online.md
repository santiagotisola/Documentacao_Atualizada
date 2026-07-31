---
sidebar_position: 2
title: Monitoramento Online
description: Acompanhamento em tempo real das operações e equipamentos de pesagem no AxTon
---

# Monitoramento Online

Dashboard de acompanhamento **em tempo real** do status dos equipamentos de pesagem e das operações em campo.

## Como acessar

**Menu lateral** → Operações → **Monitoramento Online**

## Painel de status

| Informação | Descrição |
|-------------|-----------|
| **Status do posto** | Operacional / Offline / Em manutenção |
| **Veículos no momento** | Quantidade aguardando pesagem |
| **Última pesagem** | Data/hora e placa do último registro |
| **Infrações pendentes** | Tickets aguardando triagem |

## Indicadores em tempo real

- **Balança online/offline**: sinal de heartbeat dos sensores
- **Fila de espera**: veículos aguardando pesagem
- **Alertas ativos**: infrações geradas não triadas

## Usos operacionais

- Verificar se os postos estão ativos e respondendo
- Identificar acumulo de veículos aguardando pesagem
- Checar alertas de infrações não triadas

:::tip
O monitoramento online atualiza automaticamente a cada 30 segundos. Não é necessário atualizar a página manualmente.
:::

## Gestão operacional

- **Gestão de fila**: controlar o fluxo de veículos no posto
- **Resposta rápida**: acionar equipe em caso de alerta crítico
- **Documentação**: registrar ocorrências diretamente na operação

## Boas práticas

- Mantenha o monitoramento aberto durante o período de operação para identificar falhas de conectividade em tempo real
- Configure alertas de equipe para acionar manutenção imediatamente quando um posto entrar em modo offline
- Registre todas as ocorrências no sistema para garantir rastreabilidade perante o contratante

## Tabela de referência — indicadores de status

| Status | Cor | Significação | Ação |
|--------|-----|--------------|------|
| Operacional | 🟢 Verde | Balança respondendo normalmente | Nenhuma |
| Alerta | 🟡 Amarelo | Fila de triagem acumulada | Reforçar equipe de triagem |
| Offline | 🔴 Vermelho | Sem heartbeat do equipamento | Acionar manutenção |
| Em manutenção | 🔵 Azul | Parada programática registrada | Acompanhar previsão de retorno |

## Erros comuns

| Problema | Causa provável | Solução |
|----------|---------------|----------|
| Posto sempre offline no monitor | IP de balança incorreto | Verificar cadastro do equipamento |
| Fila acumulada sem novos tickets | Balança operando sem conexão | Verificar rede local do posto |
| Dados não atualizam após 30s | Browser sem conexão com servidor | Recarregar a página |

## Fluxo de monitoramento de turno

1. No início do turno, acessar **Operações → Monitoramento Online**
2. Verificar o **status de todos os postos** — todos devem estar Operacionais (🟢)
3. Postos em **Offline**: acionar imediatamente a equipe técnica e registrar em **Eventos de Equipamentos**
4. Acompanhar **Infrações pendentes** — acumulo indica que a triagem precisa de reforço
5. Ao final do turno: registrar ocorrências e garantir que nenhum posto permaneceu offline sem registro

## Tabela de referência — indicadores de status

| Status | Cor | Significado | Ação imediata |
|--------|:---:|-------------|:--------------:|
| **Operacional** | 🟢 Verde | Balança respondendo normalmente | Nenhuma |
| **Alerta** | 🟡 Amarelo | Fila de triagem acumulada | Reforçar equipe |
| **Offline** | 🔴 Vermelho | Sem heartbeat do equipamento | Acionar manutenção |
| **Em manutenção** | 🔵 Azul | Parada programática registrada | Acompanhar retorno |

## Erros comuns

| Problema | Causa provável | Solução |
|----------|---------------|----------|
| Posto sempre offline no monitor | IP da balança incorreto no cadastro | Verificar cadastro do equipamento |
| Fila acumulada sem novos tickets | Balança operando sem conexão | Verificar rede local do posto |
| Dados não atualizam após 30s | Conexão com servidor interrompida | Recarregar a página |
| Posto aparece sem pesagens | Operação não ativa no posto | Criar operação em Operações → + Novo |

## Relacionado

- [Alertas](./alertas)
- [Consulta de Placas](./consulta-placas)
- [Fluxo Diário de Veículos](../relatorios/fluxo-diario-veiculos)


## Elementos da tela

### Status dos Equipamentos

| Indicador | Significado |
|-----------|-------------|
| 🟢 **Online** | Equipamento comunicando normalmente |
| 🔴 **Offline** | Sem comunicação — verificar conectividade |
| 🟡 **Alerta** | Comunicando com advertências |

### Informações exibidas

- Nome do Equipamento e posto
- Última comunicação (data/hora)
- Tempo sem comunicação
- Quantidade de passagens nas últimas 24h

:::tip Dica
Mantenha está tela aberta durante as operações para detecção rápida de falhas de comunicação.
:::

## Perguntas frequentes

**Por que um posto aparece offline mesmo com a balança funcionando no campo?**
O heartbeat pode estar desabilitado ou com timeout muito curto. Verifique a URL do servidor da balança em **Sistema → HAENNI** e confirme que o endereço de rede está acessível pelo servidor AxTon.

**O monitoramento online atualiza automaticamente? Com que frequência?**
Sim. A tela atualiza automaticamente a cada 30 segundos sem necessidade de recarregar a página manualmente.

**Como registrar uma interrupção diretamente do monitoramento?**
Ao identificar um posto offline, acesse **Medições → Interrupções** e registre o evento com data/hora de início. Isso garante que o período de indisponibilidade seja contabilizado corretamente no boletim de medição.

## Integração com outros módulos

| Módulo | Como se relaciona com Monitoramento Online |
|--------|--------------------------------------------|
| **Operações** | Exibe o status dos equipamentos da operação ativa em tempo real |
| **Medições → Interrupções** | Falhas identificadas aqui devem ser registradas como interrupções para impacto no SLA contratual |
| **Eventos de Equipamentos** | Permite registrar o evento técnico correspondente à falha identificada no monitoramento |
| **Alertas** | Alertas configurados são exibidos no monitoramento quando os limiares são atingidos |
