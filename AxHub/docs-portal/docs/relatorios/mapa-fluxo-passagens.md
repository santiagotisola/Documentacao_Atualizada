---
sidebar_position: 8
title: Mapa de Fluxo de Passagens
description: Mapa visual do fluxo de passagens por Equipamento
---

# Mapa de Fluxo de Passagens

Visualização geográfica do fluxo de passagens de Veículos por Equipamento Os Equipamentos são exibidos no mapa com indicadores de volume de tráfego, permitindo Análise espacial da distribuição de passagens e Infrações

![Mapa de Fluxo](../img/Relatorios%20-%20mapa%20de%20fluxo%20de%20passagens.png)

## Como acessar

**Menu lateral** → Relatórios → **Mapa de Fluxo de Passagens**

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Período** | Faixa de datas |
| **Região** | Filtrar por região geográfica |
| Equipamento | Exibir Equipamento específico |
| **Tipo de Dado** | Passagens, Infrações ou Aproveitamento OCR |

## Como usar

1. Selecione o **Período** desejado
2. Filtre por **Região** ou **Equipamento** (opcional)
3. Selecione o **Tipo de Dado** (Passagens, Infrações ou OCR)
4. O mapa exibirá os pontos com círculos proporcionais ao volume
5. Clique em qualquer equipamento para ver os dados detalhados

## Indicadores visuais

| Cor | Significado |
|-----|-------------|
| 🟢 Verde | Volume normal |
| 🟡 Amarelo | Volume elevado |
| 🔴 Vermelho | Volume crítico ou equipamento com alerta |

:::tip Exportar
Utilize o botão **Exportar** para gerar uma imagem do mapa ou um CSV com os dados por equipamento.
:::

## Casos de uso

- **Planejamento operacional** — identifique os pontos de maior fluxo para direcionar recursos de fiscalização
- **Detecção de anomalias** — volumes incomuns em horários atípicos podem indicar desvios de rota ou eventos extraordinários
- **Justificativa de expansão** — use dados georreferenciados para subsidiar propostas de instalação de novos equipamentos
- **Apresentação ao contratante** — o mapa oferece uma visão visual de cobertura para reuniões de prestação de contas

## Relacionado

- [Fluxo Diário de Veículos](./fluxo-diario-veiculos)
- [Eventos de Equipamentos](./eventos-equipamentos)
- [Aferições](../operacoes/afericoes)


## Funcionalidades do Mapa

| Recurso | Descrição |
|---------|-----------|
| **Marcadores coloridos** | Cor indica volume de tráfego (verde = baixo, vermelho = alto) |
| **Clique no Equipamento | Exibe resumo: passagens, Infrações e aproveitamento |
| **Zoom e navegação** | Mapa interativo com controle de zoom e arrasto |
| **Clusters** | Equipamentos próximos são agrupados em escala reduzida |

:::tip Dica
O mapa usa a posição geográfica configurada no cadastro de cada Equipamento Verifique a Configuração de equipamentos](../cadastros-basicos/equipamentos) caso algum aparelho não esteja visível.
:::

---

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Relacionado | [Fluxo Diário de Veículos](./fluxo-diario-veiculos) | Dados tabulares detalhados |
| Relacionado | [Monitoramento Online](../operacoes/monitoramento-online) | Status em tempo real |
| Relacionado | [Equipamentos](../cadastros-basicos/Equipamentos) | Cadastro de Equipamentos |

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Equipamento não aparece no mapa | Coordenadas geográficas não cadastradas | Verificar o cadastro do equipamento e preencher latitude/longitude |
| Mapa carrega sem pontos | Nenhuma passagem no período selecionado | Ampliar o período de consulta |
| Dados incorretos ao clicar no equipamento | Cache desatualizado do navegador | Limpar o cache e recarregar a página |
