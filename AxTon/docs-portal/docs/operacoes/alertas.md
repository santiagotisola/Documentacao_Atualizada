---
sidebar_position: 5
title: Alertas
description: Gestão de alertas operacionais nos postos de pesagem do AxTon
---

# Alertas

Gerenciamento dos **alertas detectados automaticamente** pelo sistema: veículos sem documentação fiscal, excesso de peso e irregularidades operacionais.

## Como acessar

**Menu lateral** → Operações → **Alertas**

## Tipos de alerta

| Tipo | Descrição | Gera infração? |
|------|-----------|:--------------:|
| **Excesso de peso** | Veículo ultrapassou o PBT | Sim |
| **MDF-e ausente** | Veículo de carga sem manifesto | Sim |
| **NF-e inválida** | Nota fiscal cancelada ou vencida | Sim |
| **Equipamento offline** | Balança sem comunicação | Não |
| **Anomalia de peso** | Peso muito acima/abaixo do padrão | Não |

## Ações disponíveis

| Ação | Descrição |
|------|-----------|
| **Visualizar** | Ver detalhes do alerta |
| **Assumir** | Registrar responsável |
| **Resolver** | Marcar como tratado |
| **Descartar** | Ignorar com justificativa |

## Fluxo recomendado

```
Alerta gerado → Assumir → Verificar → Resolver ou Gerar infração
```

:::tip
Configure notificações automáticas por e-mail para alertas críticos (excesso de peso e equipamento offline) para resposta mais rápida da equipe operacional.
:::

## SLA de atendimento recomendado

| Tipo de alerta | Prazo de resolução |
|----------------|:--------------------:|
| Excesso de peso | Imediato (veículo retido) |
| MDF-e / NF-e | Até 1 hora |
| Equipamento offline | Até 4 horas |
| Anomalia de peso | Até 24 horas |

## Quando usar

| Tipo de alerta | Ação recomendada |
|----------------|-------------------|
| **Excesso de peso** | Reter o veículo e iniciar processo de autuação imediatamente |
| **Equipamento offline** | Acionar equipe técnica; sem dados até restaurar a conexão |
| **MDF-e / NF-e irregular** | Notificar o motorista e registrar ocorrência no ticket |
| **Reincidência** | Verificar histórico de passagens e escalar para supervisor |

## Relacionado

- [Consulta de Placas](./consulta-placas)
- [Monitoramento Online](./monitoramento-online)
- [Relatório de Infrações](../relatorios/relatorio-infracoes)

## Perguntas frequentes

**O alerta foi gerado mas o veículo já saiu. O que fazer?**
Registre a ocorrência com status Descartado e justificativa. Informe ao supervisor.

**Um alerta de MDF-e pode ser falso positivo?**
Sim. A consulta SEFAZ pode ter delay. Aguarde 5 minutos e reprocesse antes de autuar.

**Como configurar notificações automáticas?**
Acesse Configurações → Notificações e cadastre e-mails por tipo de alerta.
Responda alertas de equipamento offline antes de qualquer outro. Um equipamento inativo não registra pesagens.
:::


| Tipo | Descrição |
|------|-----------|
| Veículo sem MDF-e** | Veículo de carga sem Manifesto de Documento Fiscal Eletrônico |
| **Excesso de peso** | Veículo acima do PBT permitido |
| **Placa irregular** | Placa não reconhecida ou com restrição |
| **Reincidência** | Veículo com múltiplas ocorrências |

## Listagem

### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Placa** | Placa do Veículo |
| **Local** | Posto de detecção |
| **Data/Hora** | Momento do alerta |
| **Tipo** | Categoria do alerta |
| **Ações** | Visualizar, tratar |

### Filtros

- Período
- Tipo de alerta
- Posto/local
- Status (Pendente, Tratado)

:::info Dashboard
Os alertas recentes também são exibidos no Use Dashboard Principal Dashboard para ação imediata.
:::

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **Monitoramento Online** | Os alertas gerados são exibidos em tempo real no painel de monitoramento do posto |
| **Consulta de Placas** | A consulta de placas identifica veículos com histórico de alertas anteriores |
| **Relatório de Infrações** | Alertas de excesso de peso resultam em infrações registradas e rastreadas nos relatórios |
