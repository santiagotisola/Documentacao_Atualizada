---
sidebar_position: 9
title: Mapa de Fluxo de Passagens
description: Visualização geográfica do fluxo de veículos nos postos de pesagem do AxTon
---

# Mapa de Fluxo de Passagens

Mapa interativo exibindo o **volume de passagens por localidade geográfica**, permitindo identificar rotas com maior tráfego de veículos pesados.

## Como acessar

**Menu lateral** → Relatórios → **Mapa de Fluxo de Passagens**

## O que o mapa exibe

| Elemento | Descrição |
|----------|-----------|
| **Pontos quentes** | Localidades com maior volume de passagens |
| **Intensidade por cor** | Vermelho = alto volume, azul = baixo |
| **Marcadores** | Postos de pesagem com dados do período |
| **Linhas de rota** | Rotas mais utilizadas por veículos pesados |

## Filtros

| Filtro | Descrição |
|--------|-----------|
| **Período** | Faixa de datas |
| **Posto** | Posto específico |
| **Tipo** | Passagens, Infrações ou Retidos |

## Como usar

1. Acesse **Relatórios → Mapa de Fluxo de Passagens**
2. Selecione o **Período**
3. Filtre por **Posto** (opcional)
4. Clique em **Gerar Mapa**
5. Clique em qualquer marcador para ver o volume detalhado

## Indicadores visuais

| Cor | Significado |
|-----|-------------|
| 🔵 Azul | Volume baixo |
| 🟡 Amarelo | Volume médio |
| 🔴 Vermelho | Volume alto |

:::tip
Use o filtro **Retidos** para identificar postos com maior número de veículos retidos por excesso de peso.
:::3. Filtre por **Posto** (opcional)
4. Clique em **Gerar Mapa**
5. Clique em qualquer marcador para ver o volume detalhado do posto

## Indicadores visuais

| Cor | Significado |
|-----|-------------|
| 🔵 Azul | Volume baixo |
| 🟡 Amarelo | Volume médio |
| 🔴 Vermelho | Volume alto |

:::tip
Use o filtro **Retidos** para visualizar apenas os postos com maior número de veículos retidos por excesso de peso, indicando pontos críticos na fiscalização.
:::

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Período** | Data início e fim |
| **Posto** | Filtrar por posto específico |
| **Categoria** | Tipo de veículo |

## Casos de uso

- Identificar rodovias com maior concentração de infratores
- Planejar expansão de novos postos de fiscalização
- Subsidiar estudos de infraestrutura viária
- Apresentar dados para gestores em reuniões executivas

## Tabela de referência — indicadores visuais

| Cor no mapa | Volume de passagens | Ação sugerida |
|:-----------:|:-------------------:|---------------|
| 🔵 Azul | < 500/dia | Monitoramento regular |
| 🟡 Amarelo | 500 – 2.000/dia | Reforçar equipe em horário de pico |
| 🔴 Vermelho | > 2.000/dia | Avaliar segundo posto ou ampliação |
| Marcador piscando | Equipamento com alerta ativo | Verificar status técnico |

## Erros comuns

| Problema | Causa provável | Solução |
|----------|---------------|----------|
| Posto sem marcador no mapa | Coordenadas não cadastradas | Atualizar cadastro do posto |
| Mapa sem dados no período | Nenhuma pesagem no intervalo | Ampliar o período de consulta |
| Cor incorreta para o volume | Cache desatualizado | Recarregar a página |

## Relacionado

- [Fluxo Diário de Veículos](./fluxo-diario-veiculos)
- [Relatório de Infrações](./relatorio-infracoes)
- [Relatório de Passagens](./relatorio-passagens)
- [Power BI](./power-bi)
