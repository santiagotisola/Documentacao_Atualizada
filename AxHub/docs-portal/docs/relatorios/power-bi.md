---
sidebar_position: 9
title: Relatórios Power BI
description: Dashboards e Relatórios analíticos via Power BI
---

# Relatórios Power BI

Acesso aos dashboards e Relatórios analíticos integrados via Power BI.

![Menu Power BI](../img/Relatórios%20BI%20-.menu.png)

## Como acessar

**Menu lateral** → Relatórios → **Power BI**

## Relatórios disponíveis

| Relatório | Imagem |
|-----------|--------|
| Comparativo de Placas | ![](../img/Relatórios%20BI%20-.relatorio%20comparativo%20de%20placas%20corrigidas%20e%20validadas%20no%20processamento.png) |
| Dados Descartes Radares | ![](../img/Relatórios%20BI%20-.relatorio%20dados%20descartes%20radares%20cev.png) |
| Boletim de Medição | ![](../img/Relatórios%20BI%20-.relatorio%20de%20boletim%20de%20medição.png) |
| Disponibilidade | ![](../img/Relatórios%20BI%20-.relatorio%20de%20disponibilidade.png) |
| Infração - Dia x Hora | ![](../img/Relatórios%20BI%20-.relatorio%20de%20infração%20-%20dia%20X%20hora.png) |
| Infração | ![](../img/Relatórios%20BI%20-.relatorio%20de%20infração.png) |
| Processamento por Motivos | ![](../img/Relatórios%20BI%20-.relatorio%20de%20processamento%20por%20motivos.png) |
| Processamento | ![](../img/Relatórios%20BI%20-.relatorio%20de%20processamento.png) |
| Índice do OCR - Dia x Hora | ![](../img/Relatórios%20BI%20-.relatorio%20indice%20do%20ocr%20-%20dia%20X%20hora.png) |
| Índice do OCR | ![](../img/Relatórios%20BI%20-.relatorio%20indice%20do%20ocr.png) |
| Fluxo por Porte | ![](../img/Relatórios%20BI%20-.relatorio%20relatorio%20médio%20diário%20de%20fluxo%20por%20porte.png) |
| Triagem por Usuário | ![](../img/Relatórios%20BI%20-.relatorio%20triagem%20por%20Usua.png) |

## Termos Técnicos

| Termo | Definição |
|-------|-----------|
| **Taxa OCR** | Percentual de placas lidas com sucesso |
| **Disponibilidade** | % de tempo online dos equipamentos |
| **Triagem** | Processo de validação das infrações |

:::info
Os dados nos dashboards Power BI são atualizados conforme o agendamento configurado no Power BI Service. Contate o suporte para ajustar a freqüência de atualização.
:::

## Relacionado

- [Relatórios Power BI (Admin)](../administracao/relatorios-power-bi)
- [Fluxo Diário de Veículos](./fluxo-diario-veiculos)
- [Processamento por Usuário](./processamento-por-usuario)

## Casos de uso

- **Gestão de contrato**: acompanhar Boletim de Medição e índices de disponibilidade em tempo real
- **Análise de qualidade OCR**: identificar equipamentos com baixa taxa de leitura de placas
- **Relatório executivo**: apresentar indicadores operacionais ao contratante em formato visual
- **Auditoria interna**: cruzar dados de triagem por usuário com volume de descarte por motivo

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Dashboard em branco | URL incorreta ou sem permissão de acesso | Verificar a URL e adicionar o usuário ao grupo de acesso no Power BI |
| Dados desatualizados | Agendamento de refresh não configurado | Ajustar o agendamento no Power BI Service |
| Relatório não aparece no menu | Perfil sem permissão para o módulo Power BI | Adicionar o perfil ao grupo de acesso |

## Perguntas frequentes

**Com que frequência os dados dos dashboards Power BI são atualizados?**
Depende do agendamento configurado no Power BI Service. Por padrão pode ser diário ou sob demanda. Contate o suporte para ajustar a frequência.

**Posso exportar um relatório Power BI em PDF ou Excel?**
Sim. Use os controles nativos do Power BI incorporado para exportar. A disponibilidade depende das permissões configuradas no Power BI Service.

**O dashboard aparece em branco mesmo com dados no sistema. O que verificar?**
Verifique se a URL de incorporação está correta e se o usuário tem acesso ao relatório no Power BI Service. O token de incorporação pode ter expirado.

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Medições](../medicoes/contratos)** | Os dados de Boletim de Medição e disponibilidade alimentam diretamente os dashboards analíticos |
| **[Processamento de Imagens](./processamento-imagens)** | A taxa OCR por equipamento é exibida nos dashboards de desempenho e qualidade |
| **[Relatório de Infrações](./relatorio-infracoes)** | Volume e distribuição de infrações compõem os gráficos analíticos do Power BI |

## Exemplo prático

**Cenário**: O gestor do contrato precisa apresentar ao órgão fiscalizador o Índice de Disponibilidade mensal para validação do pagamento do Boletim de Medição. O Power BI é usado para gerar a evidência visual.

**Passo a passo**:

1. Acesse **Relatórios → Power BI** no menu lateral
2. Clique em **Disponibilidade** para abrir o dashboard de uptime por equipamento
3. Filtre por **Período** = mês anterior e **Equipamento** = todos do contrato
4. Verifique quais equipamentos ficaram abaixo de 95% de disponibilidade
5. Para cada queda, cruce com **Infração — Dia x Hora** para confirmar se houve impacto nas infrações
6. Exporte o dashboard de Disponibilidade em **PDF** pelo botão nativo do Power BI
7. Anexe o PDF ao processo de faturamento mensal

**Resultado**: O dashboard evidencia 98,2% de disponibilidade média no mês, com duas quedas documentadas por eventos de manutenção preventiva. O Boletim de Medição é aprovado sem contestações.
