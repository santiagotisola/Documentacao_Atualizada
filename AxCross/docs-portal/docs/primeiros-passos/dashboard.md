---
sidebar_position: 2
title: Dashboard Principal
description: Visão geral do Dashboard do AxCross com indicadores operacionais em tempo real
---

# Dashboard Principal

O **Dashboard** é a tela inicial do AxCross, exibida automaticamente após a autenticação. Apresenta uma visão consolidada da operação com indicadores em tempo real, gráfico de passagens, mapa georreferenciado e ocorrências recentes.

## Como acessar

Após o **Login**, o sistema redireciona automaticamente para o Dashboard. Para retornar: clique em **Dashboard** no menu lateral.

---

## Indicadores do topo

Cinco cartões exibem os principais números operacionais em tempo real. Cada valor reflete os dados cadastrados nos módulos correspondentes.

| Indicador | Descrição | Manual |
|---|---|---|
| **Equipamentos Ativos** | Total de equipamentos com status Ativo no cadastro | [📖 Equipamentos](../cadastros/equipamentos) |
| **Faixas Monitoradas** | Total de faixas cadastradas e ativas | [📖 Equipamentos → Faixas](../cadastros/equipamentos#faixas) |
| **Alertas Configurados** | Quantidade de regras de alerta ativas | [📖 Veículos Monitorados → Alertas](../operacoes/veiculos-monitorados#alertas) |
| **Veículos Monitorados** | Total de veículos cadastrados para monitoramento | [📖 Veículos Monitorados](../operacoes/veiculos-monitorados) |
| **Ocorrências (24h)** | Ocorrências detectadas nas últimas 24 horas, com variação percentual em relação às 24h anteriores | [📖 Relatório de Ocorrências](../relatorios/relatorio-passagens#ocorrências) |

:::tip Dica
Clique em qualquer indicador do topo para ser direcionado ao cadastro correspondente dentro do sistema.
:::

---

## Passagens Hoje

Exibe o total de passagens registradas no dia atual em **tempo real**, com gráfico de barras por hora do dia e variação percentual em relação ao dia anterior.

| Item | Descrição |
|---|---|
| **Total do dia** | Passagens acumuladas desde 00h00 até o momento atual |
| **Variação** | Percentual de variação em relação ao total de passagens do dia anterior |
| **Média/Hora** | Média de passagens por hora calculada sobre o período já decorrido |
| **Última Hora** | Total de passagens na última hora completa |
| **Maior Fluxo** | Horário e volume do pico máximo de passagens registrado no dia |
| **Gráfico de barras** | Distribuição das passagens hora a hora (0h a 23h) |

:::info Relatório histórico
Para consultar passagens de dias anteriores com filtros avançados: [📖 Relatório de Passagens](../relatorios/relatorio-passagens)
:::

---

## Mapa de Equipamentos

Exibido ao lado do gráfico de passagens, mostra a localização georreferenciada de todos os equipamentos via **Google Maps**.

| Item | Descrição |
|---|---|
| **Marcadores** | Cada ponto no mapa representa um equipamento cadastrado com coordenadas geográficas |
| **Alternância Mapa/Satélite** | Botões no canto superior para alternar entre visão de rua e imagem de satélite |
| **Zoom** | Controles **+** / **−** para ampliar ou reduzir a visualização |

:::tip Monitoramento ao vivo
Para acompanhar o mapa com todas as câmeras ativas em tempo real: [📖 Monitoramento Online](../operacoes/monitoramento-online)
:::

---

## Ocorrências por Tipo

Gráfico de barras que exibe a distribuição das ocorrências por categoria, com filtros de período.

| Item | Descrição |
|---|---|
| **Filtro 24h** | Exibe ocorrências das últimas 24 horas |
| **Filtro Mês** | Exibe ocorrências do mês atual |
| **Eixo X** | Categorias de ocorrência cadastradas no sistema |
| **Eixo Y** | Quantidade de ocorrências por categoria |

Os tipos exibidos correspondem às categorias configuradas em **Veículos Monitorados → Tipos de Ocorrências** (ex.: Veículo Furtado/Roubado, Veículo com Restrição, Veículo Baixado, MANCHA01, COMBOIO01).

:::info Gestão de tipos
Para criar, editar ou inativar tipos de ocorrência: [📖 Tipos de Ocorrências](../operacoes/veiculos-monitorados#tipos-de-ocorrências)
:::

---

## Passagens por Classificação

Gráfico de linhas exibindo a distribuição das passagens por **categoria de veículo** ao longo das últimas 24 horas.

| Categoria | Descrição |
|---|---|
| **Grande** | Veículos de grande porte (caminhões, ônibus, carretas) |
| **Médio** | Veículos de médio porte (vans, caminhonetes, utilitários) |
| **Pequeno** | Veículos de pequeno porte (automóveis, motos) |
| **Sem Classificação** | Veículos detectados pelo OCR mas não classificados pelo equipamento |

:::warning Sem Classificação elevado
Alto volume de **Sem Classificação** indica que o classificador dos equipamentos pode estar com parâmetro de confiabilidade mínima muito alto, impedindo a classificação. Verifique as configurações de cada equipamento.
:::

---

## Ocorrências Recentes

Painel com as últimas ocorrências registradas em **tempo real**, com atualização automática.

| Coluna | Descrição |
|---|---|
| **Placa** | Placa do veículo detectado |
| **Tipo** | Categoria da ocorrência (ex.: VEICULO FURTADO/ROUBADO, VEICULO BAIXADO) |
| **Equipamento** | Código do equipamento que realizou a detecção |
| **Data/Hora** | Momento exato da detecção |
| **🔍** | Ícone de detalhe — abre a passagem para consulta completa |

:::info
Para consultar o histórico completo com filtros: [📖 Relatório de Ocorrências](../relatorios/relatorio-passagens#ocorrências) | [📖 Rastreamento de Placas](../relatorios/relatorio-passagens#rastreamento-de-placas)
:::

---

## Novidades do AxCross

Painel exibido ao final do Dashboard listando as versões lançadas com as melhorias e correções de cada release. Útil para acompanhar evoluções do sistema e novos recursos disponíveis.