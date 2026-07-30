---
sidebar_position: 2
title: Relatório de Passagens
description: Relatório de passagens de Veículos registradas
---

# Relatório de Passagens

Permite consultar e exportar o histórico detalhado de passagens de Veículos registradas pelos Equipamentos Cada linha representa um evento de passagem com dados de placa, velocidade, imagem e status de leitura OCR.

Relatório de Passagens](../img/Relatorio%20-%20Relatorio%20de%20passagens.png)

## Como acessar

**Menu lateral** → Relatórios → Relatório de Passagens**

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Período** | Faixa de datas e horas |
| Equipamento | Filtrar por Equipamento |
| **Faixa** | Faixa de tráfego monitorada |
| **Placa** | Buscar passagem de placa específica |
| **Tipo de Veículo | Filtrar por categoria de Veículo |
| **Com Infração | Exibir apenas passagens que geraram Infração |

## Campos exibidos

| Coluna | Descrição |
|--------|-----------|
| **Data/Hora** | Momento exato da passagem |
| **Placa** | Placa lida pelo OCR |
| Equipamento | Equipamento que registrou a passagem |
| **Faixa** | Faixa de tráfego |
| **Velocidade Medida** | Velocidade capturada pelo radar |
| **Velocidade Regulamentada** | Limite de velocidade no local |
| **Confiança OCR (%)** | Percentual de confiança na leitura da placa |
| Infração | Número do auto gerado (se houver) |
| **Imagem** | Miniatura da imagem (clique para ampliar) |

:::tip
Use o filtro **Com Infração = Sim** para revisar apenas passagens que geraram auto. Combine com filtro por período para exportar dados para auditoria.
:::

## Casos de uso

- **Auditoria de placa suspeita** — filtre por placa + período para obter o histórico completo de passagens de um veículo
- **Conferência com o órgão autuador** — exporte os dados em Excel para cruzamento com os registros do contratante
- **Análise de aproveitamento** — combine com o Relatório de Processamento de Imagens para identificar equipamentos com baixa captura
- **Acompanhamento de autuações** — use o filtro **Com Infração = Sim** para revisar apenas passagens que geraram auto

## Relacionado

- [Processamento por Usuário](./processamento-por-usuario)
- [Lotes de Importação](./lote-importacao)


## Exportação

Exportável em **Excel** com todos os campos ou apenas os selecionados.

:::tip Dica
Para localizar passagens de uma placa suspeita, use o filtro **Placa** em combinação com **Período** para histórico completo de passagens daquele Veículo
:::

---

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Relacionado | [Consulta de Placas](../operacoes/consulta-placas) | Busca rápida por placa |
| Relacionado | [Monitoramento Online](../operacoes/monitoramento-online) | Passagens em tempo real |
| Relacionado | [Fluxo Diário de Veículos](./fluxo-diario-veiculos) | Resumo diário agregado |
