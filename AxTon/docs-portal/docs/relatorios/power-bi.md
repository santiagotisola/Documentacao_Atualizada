---
sidebar_position: 8
title: Power BI
description: Dashboards analíticos avançados do AxTon integrados com Microsoft Power BI
---

# Power BI

![Dashboard](../img/Dashborads.png)

O AxTon disponibiliza dashboards analíticos avançados integrados com o **Microsoft Power BI**, permitindo análises gerenciais aprofundadas além dos relatórios operacionais padrão.

## Como acessar

**Menu lateral** → Relatórios → **Power BI**

## Dashboards disponíveis

| Dashboard | Descrição |
|-----------|----------|
| **Boletim de Medição** | Desempenho mensal por equipamento e contrato |
| **Disponibilidade** | Uptime de equipamentos por período |
| **Infrações por Dia/Hora** | Heatmap de infrações por horário e dia da semana |
| **Processamento por Motivos** | Distribuição de descartes por motivo |
| **Comparativo de Placas** | Placas corrigidas vs. validadas no processamento |
| **Dados Descarte Radares** | Análise de descarte por equipamento |

## Filtros disponíveis

Cada dashboard do Power BI permite filtrar por:

- Período (dia, mês, ano)
- Posto de pesagem
- Contrato
- Equipamento específico

:::info
Os dashboards são gerados a partir dos dados do AxTon e atualizados conforme a configuração de refresh do Power BI Service. Para configurações avançadas, entre em contato com o suporte.
:::

## Casos de uso dos dashboards

| Dashboard | Quem usa | Frequência |
|-----------|----------|:----------:|
| Boletim de Medição | Gestor de contrato | Mensal |
| Disponibilidade | Supervisor técnico | Semanal |
| Infrações por Dia/Hora | Coordenador | Diário |

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Dashboard em branco | URL incorreta | Verificar URL de incorporação |
| Dados desatualizados | Refresh desconfigurado | Ajustar no Power BI Service |
| Não aparece no menu | Sem permissão | Adicionar grupo de acesso |

## Relacionado

- [Relatório de Infrações](./relatorio-infracoes)
- [Processamento de Imagens](./processamento-imagens)

| Erro | Causa | Solução |
|------|-------|----------|
| Dashboard em branco | URL incorreta ou permissão | Verificar URL e grupo de acesso |
| Dados desatualizados | Refresh desconfigurado | Ajustar agendamento no Power BI Service |
| Não aparece no menu | Perfil sem permissão | Adicionar grupo de acesso |

## Relacionado

- [Relatório de Infrações](./relatorio-infracoes)
- [Processamento de Imagens](./processamento-imagens)
- [Medições](../medicoes/criar-medicao)

- [Relatório de Infrações](./relatorio-infracoes)
- [Processamento de Imagens](./processamento-imagens)
- [Medições](../medicoes/criar-medicao)

- **Equipamento** específico
- **Grupo de Equipamentos**
- **Contrato**
- **Localidade**

## Como exportar

Dentro de cada dashboard Power BI, utilize o botão **Exportar** (ícone de download) para gerar:
- PDF — relatório formatado para impressão
- Excel — dados brutos para análise própria

## Requisitos

:::info Permissão necessária
Acesso ao Power BI requer permissão específica configurada no perfil. Solicite ao administrador do sistema.
:::

:::tip Dica gerencial
Use o Dashboard de **Disponibilidade** para acompanhar o SLA contratual e o **Boletim de Medição** para embasar pagamentos mensais de contratos.
:::

## Perguntas frequentes

**Com que frequência os dashboards Power BI são atualizados?**
Depende do agendamento configurado no Power BI Service. Por padrão pode ser diário ou sob demanda. Entre em contato com o suporte para ajustar a frequência de atualização.

**O dashboard aparece em branco mesmo tendo dados no sistema. O que verificar?**
Verifique se a URL de incorporação está correta e se o usuário possui acesso ao relatório no Power BI Service. O token de incorporação também pode ter expirado — acione o suporte para regenerá-lo.

**Posso exportar os dashboards em PDF ou Excel?**
Sim. Use os controles nativos do Power BI incorporado para exportar. A disponibilidade do botão de exportação depende das permissões configuradas no Power BI Service pelo administrador.

