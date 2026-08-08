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
| Relacionado | [Equipamentos](../cadastros-basicos/equipamentos) | Cadastro de Equipamentos |

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Equipamento não aparece no mapa | Coordenadas geográficas não cadastradas | Verificar o cadastro do equipamento e preencher latitude/longitude |
| Mapa carrega sem pontos | Nenhuma passagem no período selecionado | Ampliar o período de consulta |
| Dados incorretos ao clicar no equipamento | Cache desatualizado do navegador | Limpar o cache e recarregar a página |

## Perguntas frequentes

**Por que um equipamento não aparece no mapa?**
O equipamento precisa ter coordenadas geográficas (latitude e longitude) cadastradas. Verifique o cadastro do equipamento e preencha as coordenadas.

**Qual a diferença entre usar Passagens ou Infrações no Tipo de Dado?**
Passagens exibe o volume total de veículos detectados. Infrações exibe apenas os registros que geraram auto. Use Infrações para análise de fiscalização e Passagens para análise de tráfego.

**Posso exportar o mapa como imagem para apresentações?**
Sim. Clique em **Exportar** para salvar uma imagem do mapa ou um CSV com os dados por equipamento.

## Exemplo prático

**Cenário**: A equipe de planejamento precisa decidir onde instalar um novo radar de velocidade. O Mapa de Fluxo é usado para identificar os cruzamentos com maior volume de infrações.

**Passo a passo**:

1. Acesse **Relatórios → Mapa de Fluxo de Passagens**
2. Defina o **Período** = últimos 90 dias
3. Selecione **Tipo de Dado = Infrações** para visualizar a concentração de autos
4. Observe os pontos **vermelhos** no mapa — indicam os equipamentos com maior volume de infrações
5. Clique no ponto mais crítico: exibe resumo com número de passagens, infrações e aproveitamento OCR
6. Compare com o filtro **Tipo = Aproveitamento OCR** para avaliar se a taxa de leitura é boa naquele ponto
7. Exporte o CSV e use os dados para justificar a proposta de novo equipamento ao contratante

**Resultado**: O mapa evidencia que o cruzamento da Av. Brasil com a Rua XV concentra 38% das infrações do período com OCR de 93%. A proposta de instalação é aprovada com base nos dados.

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Fluxo Diário de Veículos](./fluxo-diario-veiculos)** | O mapa exibe uma visão geográfica do fluxo; o Fluxo Diário complementa com a série temporal detalhada |
| **[Equipamentos](../cadastros-basicos/equipamentos)** | Os equipamentos precisam ter coordenadas geográficas cadastradas para aparecer no mapa |
| **[Monitoramento Online](../operacoes/monitoramento-online)** | O monitoramento online exibe o status em tempo real dos equipamentos visíveis no mapa |
| **[Operações](../operacoes/cadastro-operacoes)** | O filtro por operação permite visualizar apenas os equipamentos associados a uma operação específica no mapa |
