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

## Integração com outros módulos

| Módulo | Como se relaciona com Power BI |
|--------|--------------------------------|
| **Medições → Criar Medição** | O boletim mensal gerado alimenta os dashboards de desempenho contratual no Power BI |
| **Administração → Relatórios Power BI** | Onde as URLs de incorporação dos dashboards são cadastradas e gerenciadas |
| **Relatório de Passagens** | Dados de pesagem e infrações alimentam os paineis gerenciais do Power BI |
| **Índices de Performance** | Os índices contratuais são exibidos nos dashboards de SLA e disponibilidade |

## Exemplo prático

**Cenário**: O gestor de contrato precisa preparar a apresentação mensal para o contratante mostrando o desempenho do posto de pesagem. Ele usa o Power BI para gerar os indicadores de forma visual e consolidada.

**Passo a passo**:

1. Acesse **Relatórios → Power BI** no menu lateral
2. Clique em **Boletim de Medição** para ver o desempenho mensal por equipamento
3. Filtre por **Período** = mês anterior e **Posto** = contrato em questão
4. Verifique o Índice de Disponibilidade: se estiver abaixo de 95%, prepare a justificativa (eventos de manutenção documentados)
5. Acesse **Infração — Dia x Hora** para identificar os horários de pico e validade
6. Use **Exportar** para gerar o PDF consolidado
7. Apresente ao contratante com os gráficos visuais do Power BI

**Resultado**: A apresentação com os dashboards do Power BI redu importou o tempo de preparação do relatório mensal de 4 horas para 30 minutos, e o contratante aprovou o boletim sem contestações.

