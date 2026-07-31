---
sidebar_position: 1
title: Relatórios
description: Consulta, análise e exportação de relatórios operacionais no AxCross
---

# Relatórios

O módulo de **Relatórios** reúne todas as ferramentas de consulta, análise e exportação de dados operacionais do AxCross. Acesse pelo **menu lateral** clicando no ícone de **Relatórios**.

![Relatórios](<../img/Relatorios.png>)

O módulo disponibiliza 10 relatórios organizados conforme os ícones da tela principal:

| # | Relatório | Descrição |
|---|---|---|
| 1 | [**Passagens**](#passagens) | Histórico completo de passagens registradas nos cruzamentos, com filtros avançados e exportação em XLSX, CSV e PDF |
| 2 | [**Mapeamento de Rotas**](#mapeamento-de-rotas) | Visualização no mapa do percurso de um veículo por placa e período |
| 3 | [**Rastreamento de Placas**](#rastreamento-de-placas) | Histórico detalhado de todas as detecções de uma placa específica |
| 4 | [**Painel Analítico**](#painel-analítico) | Gráficos e indicadores de desempenho por placa e período |
| 5 | [**Veículos Monitorados**](#veículos-monitorados-1) | Detecções de veículos cadastrados na lista de monitorados, com tipo de ocorrência |
| 6 | [**Ocorrências**](#ocorrências) | Ocorrências registradas filtradas por placa, equipamento e tipo de alerta |
| 7 | [**Alertas**](#alertas-1) | Alertas gerados pelo sistema com filtros por área, tipo de ocorrência e placa |
| 8 | [**Mapa de Bolhas**](#mapa-de-bolhas) | Mapa geográfico com concentração de irregularidades por Equipamento |
| 9 | [**Gerados**](#gerados) | Arquivos PDF gerados disponíveis para download |
| 10 | [**Grafos de Comboio**](#grafos-de-comboio) | Identificação de veículos que se deslocam em conjunto (comboio) via Neo4j |

---

## Passagens

Consulta e exportação das passagens registradas nos cruzamentos monitorados, com filtros avançados, ordenação dinâmica e múltiplos formatos de exportação.

![Relatório de Passagens](<../img/Relatório de Passagens.png>)

### Filtros

| Filtro | Obrigatório | Descrição |
|---|:---:|---|
| **Data Início** | Sim | Data inicial do período de consulta |
| **Data Fim** | Sim | Data final do período de consulta |
| **Local** | Não | Filtrar por cruzamento específico |
| **Equipamento** | Não | Filtrar por Equipamento |
| **Faixa** | Não | Filtrar por faixa monitorada |

### Colunas do resultado

| Coluna | Descrição |
|---|---|
| **Data/Hora** | Momento exato da passagem |
| **Local** | Cruzamento onde a passagem foi registrada |
| **Faixa** | Faixa onde o veículo passou |
| **Placa** | Placa capturada do veículo |
| **Velocidade** | Velocidade registrada (quando disponível) |
| **Imagem** | Foto da passagem capturada pelo Equipamento |

### Exportação

| Formato | Descrição |
|---|---|
| **XLSX** | Planilha com formatação e metadados |
| **CSV** | Arquivo de texto com codificação UTF-8 e delimitador ";" |
| **PDF** | Relatório com imagens inline |

### Passo a passo

1. Acesse **Relatórios → Passagens** no menu lateral
2. Defina o **período** (Data Início e Data Fim)
3. Opcionalmente, aplique filtros por Local, Equipamento ou Faixa
4. Clique em **Consultar**
5. Para exportar, clique em **Exportar** e escolha o formato desejado

![Relatórios Gerados](<../img/Relatórios Gerados.png>)

:::tip Dica
Use o filtro por faixa para análise detalhada do fluxo em uma via específica.
:::

---

## Mapeamento de Rotas

Visualiza no mapa os percursos registrados por veículos detectados nas câmeras monitoradas, identificando rotas frequentes, trajetos e padrões de deslocamento.

![Mapeamento de Rotas](<../img/Mapeamento de Rotas.png>)

### Filtros

| Filtro | Obrigatório | Descrição |
|---|:---:|---|
| **Placa** | Sim | Placa do veículo a rastrear |
| **Data Início** | Sim | Data inicial do período de consulta |
| **Data Fim** | Sim | Data final do período de consulta |
| **Equipamento** | Não | Filtrar por câmera específica |

### Informações exibidas no mapa

| Informação | Descrição |
|---|---|
| **Marcadores** | Pontos no mapa onde o veículo foi detectado |
| **Sequência temporal** | Numeração indicando a ordem cronológica das passagens |
| **Local** | Nome do cruzamento onde a detecção ocorreu |
| **Data/Hora** | Momento de cada detecção |
| **Faixa** | Faixa onde o veículo passou |

### Passo a passo

1. Acesse **Relatórios → Mapeamento de Rotas** no menu lateral
2. Informe a **Placa** do veículo
3. Defina o **período** de consulta
4. Clique em **Consultar**
5. O mapa exibirá os pontos de detecção conectados em sequência cronológica

:::tip Dica
Combine o Mapeamento de Rotas com o **Rastreamento de Placas** para uma análise completa dos deslocamentos do veículo.
:::

---

## Rastreamento de Placas

Rastreia as passagens de um veículo específico em todos os cruzamentos monitorados, exibindo o histórico completo de detecções com imagens capturadas.

![Rastreamento de Veículos por Placa](<../img/Rastreamento de Veículos por Placa.png>)

### Filtros

| Filtro | Obrigatório | Descrição |
|---|:---:|---|
| **Placa** | Sim | Placa do veículo (formato Mercosul ou padrão antigo) |
| **Data Início** | Sim | Data inicial do período |
| **Data Fim** | Sim | Data final do período |
| **Equipamento** | Não | Filtrar por câmera específica |
| **Faixa** | Não | Filtrar por faixa de pista |

### Colunas do resultado

| Coluna | Descrição |
|---|---|
| **Data/Hora** | Momento da detecção |
| **Local** | Cruzamento onde o veículo foi detectado |
| **Equipamento** | Câmera que registrou a passagem |
| **Faixa** | Faixa onde passou o veículo |
| **Placa** | Placa detectada (pode haver leitura parcial por OCR) |
| **Velocidade** | Velocidade registrada (quando disponível) |
| **Imagem** | Foto da passagem |

### Passo a passo

1. Acesse **Relatórios → Rastreamento de Placas** no menu lateral
2. Informe a **Placa** do veículo
3. Defina o **período** de consulta
4. Clique em **Consultar**
5. Para exportar, clique em **Excel**

:::tip Veículos Monitorados
Se a placa consultada estiver cadastrada na lista de veículos monitorados, um ícone de alerta será exibido ao lado dos registros.
:::

:::info OCR e precisão de leitura
Em condições adversas (chuva, sujeira, ângulo), a leitura da placa pode ser parcial. Utilize a imagem capturada para confirmação visual.
:::

---

## Painel Analítico

O **Painel Analítico** apresenta gráficos e indicadores de desempenho com base nas passagens e ocorrências registradas no período selecionado.

![Painel Analítico](<../img/Painel Analítico.png>)

### Filtros

| Filtro | Obrigatório | Descrição |
|---|:---:|---|
| **Placa** | Não | Filtrar por placa específica |
| **Período** | Sim | 24h, 7d, 30d ou personalizado |

### Como usar

1. Acesse **Relatórios → Painel Analítico** no menu lateral
2. Opcionalmente, informe uma **Placa** para análise individual
3. Selecione o **Período** desejado (24h, 7d, 30d ou Custom)
4. Clique em **Filtrar**
5. Os cartões e gráficos serão exibidos na área direita da tela

:::tip Dica
Use o período **7d** ou **30d** para identificar tendências de fluxo e comparar o desempenho entre períodos distintos.
:::

---

## Veículos Monitorados {#veículos-monitorados-1}

Consolida as detecções de veículos cadastrados na lista de monitorados, exibindo cada ocorrência com dados de local, data/hora e imagem da passagem.

![Relatório Veículos Monitorados](<../img/Relatório Veículos Monitorados.png>)

![Veículos Monitorados - Resultado](<../img/2026-07-Veiculos Monitorados.png>)

### Filtros

| Filtro | Obrigatório | Descrição |
|---|:---:|---|
| **Data/Hora Inicial** | Sim | Data e hora de início do período (máximo 1 dia / 24h) |
| **Data/Hora Final** | Sim | Data e hora de fim do período |
| **Placa do Veículo** | Não | Filtrar por placa específica (ex.: ABC1D23) |
| **Tipo de Ocorrência** | Não | Filtrar por categoria da ocorrência (Todos por padrão) |

### Colunas do resultado

| Coluna | Descrição |
|---|---|
| **Data/Hora** | Momento da detecção |
| **Placa** | Placa detectada |
| **Classificação** | Categoria do veículo monitorado |
| **Local** | Cruzamento onde ocorreu a detecção |
| **Equipamento** | Câmera que registrou a passagem |
| **Status Alerta** | Estado da tratativa do alerta gerado |
| **Imagem** | Foto da passagem |

### Passo a passo

1. Acesse **Relatórios → Veículos Monitorados** no menu lateral
2. Defina o **período** de consulta
3. Opcionalmente, aplique filtros por placa, classificação ou status
4. Clique em **Consultar**
5. Para exportar, clique em **Excel** ou **PDF**

:::tip Acompanhamento de alertas
Use este relatório em conjunto com a tela de **Alertas** para acompanhar o status das tratativas de cada detecção.
:::

---

## Ocorrências

Consolida todas as ocorrências registradas no sistema com detalhes de tratativa, responsável e resolução, permitindo análise e prestação de contas das ações operacionais.

![Relatório de Ocorrências](<../img/Relatório de Ocorrências.png>)

### Filtros

| Filtro | Obrigatório | Descrição |
|---|:---:|---|
| **Data Início** | Sim | Data inicial do período |
| **Data Fim** | Sim | Data final do período |
| **Tipo de Ocorrência** | Não | Filtrar por categoria (ex.: Placa Monitorada, MANCHA01) |
| **Status** | Não | Aberto, Em atendimento, Resolvido, Descartado |
| **Usuário** | Não | Responsável pelo atendimento |
| **Local** | Não | Cruzamento relacionado |

### Colunas do resultado

| Coluna | Descrição |
|---|---|
| **Data/Hora** | Momento de geração do alerta |
| **Tipo** | Categoria da ocorrência |
| **Local** | Cruzamento associado |
| **Placa** | Veículo envolvido (quando aplicável) |
| **Status** | Estado atual da tratativa |
| **Assumido por** | Usuário que assumiu o atendimento |
| **Resolvido por** | Usuário que encerrou o alerta |
| **Observações** | Descrição da tratativa realizada |

### Passo a passo

1. Acesse **Relatórios → Ocorrências** no menu lateral
2. Defina o **período** de consulta
3. Opcionalmente, aplique filtros por tipo, status ou responsável
4. Clique em **Consultar**
5. Para exportar, clique em **Excel**

:::tip Fiscalização e auditoria
Este relatório é a principal ferramenta para demonstrar as atividades operacionais realizadas, incluindo alertas gerados, quem atendeu e como foram resolvidos.
:::

---

## Alertas {#alertas-1}

Lista todos os alertas gerados automaticamente pelo sistema — detecções de veículos monitorados, Equipamentos offline e falhas de imagem — com filtragem por período, área, tipo de ocorrência e placa.

![Alertas](<../img/Alertas.png>)

### Filtros

| Filtro | Obrigatório | Descrição |
|---|:---:|---|
| **Data Início** | Sim | Data inicial do período |
| **Data Final** | Sim | Data final do período |
| **Áreas** | Não | Filtrar por área geográfica (ex.: Todas as áreas) |
| **Tipos de Ocorrência** | Não | Filtrar por categoria do alerta (ex.: Todos os tipos) |
| **Placa** | Não | Filtrar por placa específica (ex.: ABC1D23) |

### Passo a passo

1. Acesse **Relatórios → Alertas** no menu lateral
2. Defina o **período** (Data Início e Data Final)
3. Opcionalmente, filtre por Área, Tipo de Ocorrência ou Placa
4. Clique em **Filtrar**
5. Os cartões e gráficos de alertas serão exibidos na área direita da tela

:::tip Dica
Combine o filtro de **Área** com **Tipo de Ocorrência** para focar em eventos específicos de uma região, como veículos monitorados detectados no centro da cidade.
:::

---

## Mapa de Bolhas

Exibe uma visualização geográfica onde cada bolha no mapa representa um Equipamento. O **tamanho da bolha** é proporcional à quantidade de ocorrências do tipo selecionado capturadas naquele Equipamento no período escolhido.

![Mapas de Bolhas](<../img/Mapas de Bolhas.png>)

### Filtros

| Filtro | Obrigatório | Descrição |
|---|:---:|---|
| **Tipo de Irregularidade** | Sim | Categoria da ocorrência a visualizar no mapa |
| **Período** | Sim | 24h, 7d, 30d ou Custom (personalizado) |

### Como usar

1. Acesse **Relatórios → Mapa de Bolhas** no menu lateral
2. Selecione o **Tipo de Irregularidade** desejado
3. Escolha o **Período** de análise (24h, 7d, 30d ou Custom)
4. Clique em **Aplicar**
5. O mapa exibirá bolhas em cada Equipamento — quanto maior a bolha, maior a concentração de ocorrências

:::tip Análise de fluxo
Use o Mapa de Bolhas para identificar os Equipamentos com maior concentração de um tipo específico de irregularidade e priorizar inspeções ou reforços operacionais nos pontos críticos.
:::

---

## Gerados

Lista todos os relatórios em formato PDF que foram gerados no sistema, permitindo download direto. Cada linha exibe a data/hora de geração, o status de processamento e a mensagem de conclusão.

![Gerados](<../img/Gerados.png>)

### Informações exibidas

| Campo | Descrição |
|---|---|
| **Nome do Arquivo** | Nome identificador do relatório gerado |
| **Tipo** | Tipo de relatório (Passagens, Ocorrências, Veículos Monitorados, etc.) |
| **Período** | Intervalo de datas do relatório |
| **Gerado por** | Usuário que solicitou a geração |
| **Data de Geração** | Data e hora em que o PDF foi criado |
| **Status** | Processando, Concluído ou Erro |

### Ações disponíveis

| Ação | Descrição |
|---|---|
| **Download** | Baixar o arquivo PDF gerado |
| **Visualizar** | Abrir o PDF diretamente no navegador |
| **Reprocessar** | Gerar novamente o relatório (quando houver erro) |
| **Excluir** | Remover o arquivo da lista |

:::tip Relatórios pendentes
Relatórios com grande volume de dados podem levar alguns minutos para serem gerados. Se o status aparecer como "Processando", aguarde e atualize a página.
:::

---

## Grafos de Comboio

Identifica veículos que percorrem trajetos semelhantes em conjunto (comboio), detectando padrões de deslocamento coordenado entre múltiplas placas. Utiliza o banco de dados de grafos **Neo4j** para análise de coocorrências.

![Grafos de Comboio](<../img/Grafos de Comboio.png>)

### Filtros

| Filtro | Obrigatório | Descrição |
|---|:---:|---|
| **Data Inicial** | Sim | Data de início da análise |
| **Data Final** | Sim | Data de fim da análise |
| **Placa do Veículo** | Não | Filtrar por placa âncora específica |

### Colunas do resultado

| Coluna | Descrição |
|---|---|
| **Placa-âncora** | Veículo de referência para o qual foram encontrados comboios |
| **Qtd. veículos** | Quantidade de veículos que integram o comboio |
| **Coocorrências** | Número de vezes que os veículos foram detectados juntos |
| **Última passagem** | Data e hora da última detecção conjunta registrada |

### Como usar

1. Acesse **Relatórios → Grafos de Comboio** no menu lateral
2. Defina o **período** (Data Inicial e Data Final)
3. Opcionalmente, informe uma **Placa do Veículo** para focar a análise
4. Clique em **Filtrar**
5. A grid exibirá os grupos de veículos com padrão de comboio identificado

:::info Neo4j
O módulo de Grafos de Comboio requer conexão ativa com o banco de dados Neo4j. O indicador **"Neo4j conectado"** (verde) na tela confirma que a integração está funcionando.
:::

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Relatório sem dados | Período sem passagens | Verificar equipamentos ativos |
| Exportação falhou | Dados muito volumosos | Reduzir período |
| Filtro não funciona | Cache desatualizado | Recarregar a página |

## Perguntas frequentes

**Posso exportar todos os relatórios de uma vez?**
Não. Cada relatório é exportado individualmente com seus filtros.

**Qual o período máximo para consulta?**
Não há limite definido, mas períodos longos podem demorar para carregar.

**Os relatórios em PDF são gerados automaticamente?**
Sim, o módulo de PDFs Gerados armazena os arquivos exportados.

## Integração com outros módulos

| Módulo | Relação |
|--------|----------|
| **Monitoramento Online** | Dados em tempo real vs histórico |
| **Veículos Monitorados** | Filtra passagens por veículos alvo |
| **Mapeamento de Rotas** | Visualiza geograficamente os dados |
