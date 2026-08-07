---
sidebar_position: 6
title: Mapa de Bolhas por Irregularidade
description: Visualização geográfica da concentração de irregularidades por equipamento no AxCross
---

# Mapa de Bolhas por Irregularidade

O **Mapa de Bolhas** é uma visualização georreferenciada que mostra a **concentração de irregularidades por ponto de captura**. Cada bolha representa um equipamento, e seu tamanho é proporcional ao volume de irregularidades detectadas naquele local no período selecionado.

![Mapa de Bolhas](../img/Mapas de Bolhas.png)

## Como acessar

No **menu lateral**, clique em **Relatórios** e selecione **Mapa de Bolhas**.

:::info Permissões necessárias
`irregularitybubblemap.index` — acessar o mapa  
`irregularitybubblemap.data` — carregar os dados de irregularidades para renderização
:::

---

## Como interpretar

| Elemento | Descrição |
|----------|-----------|
| **Bolha grande / cor intensa** | Alto volume de irregularidades naquele equipamento no período |
| **Bolha pequena / cor suave** | Baixo volume de irregularidades |
| **Ausência de bolha** | Nenhuma irregularidade detectada no equipamento |

---

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Data Início / Fim** | Define o período de análise |
| **Tipo de Ocorrência** | Filtra por categoria específica de irregularidade |
| **Área** | Restringe a visualização a uma área de monitoramento |

## Como interpretar

| Cenário | Interpretação |
|---------|----------------|
| Vários equipamentos com bolhas grandes | Concentração de irregularidades na região |
| Um único equipamento com bolha grande | Possível alvo de atividade específica |
| Nenhuma bolha no período | Operação regular na área |

:::tip
Use filtros de **Tipo de Ocorrência** para focar em categorias específicas (ex.: veículos roubados) e identificar rotas ou padrões de atividade.
:::

---

## Uso operacional

O Mapa de Bolhas é ideal para:

- **Identificar pontos críticos** na malha viária com maior concentração de infrações ou veículos suspeitos
- **Priorizar a alocação de recursos** — direcionar patrulhamento para os cruzamentos com mais ocorrências
- **Comparar períodos** — avaliar se ações operacionais reduziram as irregularidades em determinado ponto
- **Apresentar resultados** em reuniões de gestão com visualização imediata da situação operacional

:::tip Dica
Combine o Mapa de Bolhas com o [Relatório de Ocorrências](ocorrencias-alertas.md) para detalhar quais irregularidades estão concentradas em cada ponto identificado no mapa.
:::

## Relacionado

- [Ocorrências e Alertas](./ocorrencias-alertas) — Detalhamento das irregularidades por equipamento
- [Mapeamento de Rotas](./mapeamento-rotas) — Visualização geográfica das rotas de veículos
- [Painel Analítico](./painel-analitico) — Análise aprofundada por placa

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Mapa sem bolhas | Nenhuma irregularidade no período | Ampliar o período ou verificar o tipo de ocorrência selecionado |
| Equipamento não aparece no mapa | Coordenadas não cadastradas | Verificar latitude/longitude no cadastro do equipamento |

## Perguntas frequentes

**Como identificar quais irregularidades estão concentradas em um ponto específico do Mapa de Bolhas?**
Clique na bolha do equipamento para expandir os detalhes, ou use o filtro **Tipo de Ocorrência** para restringir o mapa a uma categoria específica (ex.: veículos roubados). Em seguida, acesse o **Relatório de Ocorrências** com o mesmo filtro de equipamento para ver o detalhamento.

**Por que um equipamento cadastrado não aparece no Mapa de Bolhas?**
O equipamento não terá bolha se não houver irregularidades no período selecionado, ou se as coordenadas geográficas não estiverem cadastradas. Verifique a latitude e longitude no cadastro do equipamento em **Cadastros → Locais**.

**Qual a diferença entre o Mapa de Bolhas e o Mapa de Equipamentos do Dashboard?**
O **Mapa de Equipamentos** no Dashboard mostra a localização de todos os equipamentos ativos com status de conexão. O **Mapa de Bolhas** mostra a concentração de **irregularidades** por equipamento em um período, sendo uma ferramenta analítica de priorização operacional.
| Permissão negada ao acessar | Usuário sem `irregularitybubblemap.index` | Solicitar ao administrador a concessão da permissão |

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Tipos de Ocorrências](../operacoes/tipos-ocorrencias)** | Os tipos de ocorrência são os filtros disponíveis no Mapa de Bolhas |
| **[Relatório de Ocorrências](./ocorrencias-alertas)** | O mapa fornece visão espacial; o relatório detalha cada ocorrência individualmente |
| **[Cadastros — Equipamentos](../cadastros/equipamentos)** | As coordenadas geográficas dos equipamentos são essenciais para exibir as bolhas no mapa |

## Tabela de referência rápida

| Situação no mapa | Interpretação | Ação recomendada |
|------------------|--------------|-----------------|
| Bolha muito grande em ponto isolado | Alta concentração de irregularidades naquele cruzamento | Intensificar patrulhamento na área |
| Todas as bolhas pequenas | Operação regular — baixo volume de irregularidades | Monitorar normalmente |
| Equipamento sem bolha no mapa | Nenhuma irregularidade no período OU coordenadas ausentes | Verificar cadastro do equipamento |
| Muitas bolhas grandes na mesma região | Rota de alto risco | Operação especial e análise de comboio |
| Mapa vazio no período | Nenhuma irregularidade detectada | Verificar se equipamentos estão online |
