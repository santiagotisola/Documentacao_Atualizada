---
sidebar_position: 1
title: Monitoramento Online
description: Acompanhamento em tempo real dos Equipamentos e passagens no AxCross
---

# Monitoramento Online

O módulo de **Monitoramento Online** centraliza o acompanhamento em tempo real de todos os Equipamentos cadastrados no AxCross. A partir dele, é possível visualizar o status de cada câmera, aplicar filtros por alerta, Equipamento e faixa, além de acessar o mapa visual de passagens registradas pelas câmeras.

![](<../img/Monitoramento Online.png>)

## Como acessar

No **menu lateral**, clique no ícone de **Monitoramento** e, em seguida, selecione a opção desejada:

| Opção | Descrição |
|---|---|
| **Monitoramento Online** | Visualização em tempo real com filtros por alerta, Equipamento e faixa |
| **Mapa de Equipamentos** | Grade visual com as imagens capturadas por cada câmera ativa |

---

## Monitoramento Online

A tela de **Monitoramento Online** exibe o status de funcionamento das câmeras em tempo real, com filtros para segmentar a visualização por tipo de alerta, Equipamento ou faixa de pista.

![](<../img/Monitoramento Online.- fitros.png>)

### Filtros disponíveis

Os filtros estão localizados no canto superior direito da tela e permitem refinar o que está sendo monitorado:

| Filtro | Descrição |
|---|---|
| **Todos os Alertas** | Filtra os Equipamentos que possuem um tipo específico de alerta ativo. Selecione "Todos os Alertas" para exibir sem restrição de alerta. |
| **Todos os Equipamentos** | Filtra por câmera ou Equipamento específico. Exibe todos quando nenhum Equipamento for selecionado. |
| **Todas Faixas** | Filtra por faixa de pista monitorada (Faixa 1, Faixa 2, etc.). Exibe todas as faixas por padrão. |

### Indicador de status

No canto superior direito, ao lado dos filtros, é exibido o indicador de status da conexão:

| Status | Cor | Significado |
|---|---|---|
| **ONLINE** | Verde | O sistema está conectado e recebendo dados em tempo real |
| **OFFLINE** | Vermelho | O sistema está sem conexão. Os dados exibidos podem estar desatualizados |

:::warning Equipamento OFFLINE
Quando o indicador estiver vermelho **(OFFLINE)**, verifique a conectividade da rede e o status dos Equipamentos no cadastro. Nenhuma passagem será registrada enquanto a conexão estiver interrompida.
:::

### Botão de iniciar monitoramento

O botão **verde (▶)** ao lado dos filtros inicia ou atualiza a visualização do monitoramento com base nos filtros selecionados.

:::tip Dica
Selecione um Equipamento específico nos filtros antes de iniciar para focar o monitoramento em um ponto de interesse.
:::

---

## Mapa de Equipamentos

O **Mapa de Equipamentos** apresenta uma grade visual com as capturas mais recentes de cada câmera ativa no sistema. Cada card exibe a imagem capturada, o nome do Equipamento e informações da passagem registrada.

![](<../img/Mapa de Equipamentos.png>)

### Elementos da tela

| Elemento | Descrição |
|---|---|
| **Cards de câmeras** | Cada card representa uma câmera ativa. Exibe a imagem capturada mais recente e os dados da passagem. |
| **Ícone de notificações** | Exibe alertas ativos relacionados aos Equipamentos monitorados. |
| **Ícone de Equipamentos** | Acesso rápido à lista de Equipamentos cadastrados. |
| **Botão Filtrar** | Abre o Use Dashboard de filtros para segmentar a visualização por Equipamento local ou faixa. |
| **Horário (canto inferior direito)** | Indica o horário da última atualização da tela. |

:::info Atualização automática
Os cards do Mapa de Equipamentos são atualizados automaticamente conforme novas passagens são registradas, sem necessidade de recarregar a página.
:::

:::tip Dica
Use o botão **Filtrar** para exibir apenas as câmeras de um cruzamento específico quando houver muitos Equipamentos cadastrados.
:::

---

## Mural de Câmeras

O **Mural de Câmeras** é uma tela de monitoramento visual onde o operador monta uma grade personalizada com as câmeras dos Equipamentos desejados, acompanhando em tempo real as capturas de cada ponto monitorado.

![](<../img/Mural de Cameras.png>)

### Como acessar

No **menu lateral**, clique em **Monitoramento** → **Mural de Câmeras**.  
Ao abrir pela primeira vez, a tela exibe a mensagem **"Seu mural está vazio"** — clique no botão **+ Montar mural** para iniciar a configuração, ou selecione um layout salvo no painel de **Layouts**.

---

### Elementos da tela

| Elemento | Descrição |
|---|---|
| **Grade de câmeras** | Área principal onde as câmeras são exibidas em mosaico. Cada célula mostra a imagem capturada em tempo real pelo Equipamento selecionado. |
| **Botão de grade (ex.: 4×3)** | Define a divisão da tela em linhas e colunas. Veja a seção [Botão Auto (Layout de Grade)](#botão-auto-layout-de-grade). |
| **Botão de layout (ex.: Avenidas)** | Exibe o nome do layout atual e abre o painel de gerenciamento de layouts. Veja a seção [Layouts](#layouts). |
| **Botão Editar / Sair edição** | Alterna entre o modo de visualização e o modo de edição, onde é possível selecionar o Equipamento de cada célula da grade. |
| **Toggle Alertas** | Ativa ou desativa os alertas visuais no mural. Veja a seção [Alertas no Mural](#alertas-no-mural). |

---

### Botão Auto (Layout de Grade)

O botão de grade — exibido com a configuração atual, como **4×3**, **2×2** ou **Auto** — define a **divisão da tela** (também chamada de *grid layout*, *mosaico*, *matriz* ou *modo de exibição*).

- **Auto**: O sistema ajusta automaticamente o número de células conforme a quantidade de câmeras adicionadas ao mural.
- **Valores fixos** (ex.: 2×2, 3×3, 4×3, 4×4): O operador escolhe manualmente quantas linhas e colunas a grade deve ter, independentemente de quantas câmeras estão configuradas.

:::tip Dica
Use um layout fixo (ex.: **4×3**) quando quiser manter a visualização estável com um número predefinido de câmeras. Use **Auto** para murais dinâmicos que mudam conforme os Equipamentos adicionados.
:::

---

### Layouts

O botão de **Layouts** — exibido com o nome do layout ativo, como **"Avenidas"** — abre o painel de gerenciamento de layouts salvos.

Um **layout** é uma configuração nomeada que armazena quais Equipamentos estão dispostos em cada célula da grade. Layouts podem representar:

- Uma **região geográfica** (ex.: "Centro", "Setor Norte", "Zona Sul")
- Uma **via ou corredor** (ex.: "Avenidas", "Perimetral")
- Um **grupo de interesse** (ex.: "Saídas da cidade", "Terminais Rodoviários")

#### Painel de Layouts

Ao clicar no botão de layout, é exibido um painel lateral com as seguintes opções:

| Elemento | Descrição |
|---|---|
| **Lista de layouts** | Exibe os layouts criados, com o nome, a quantidade de Equipamentos e a data da última edição. |
| **Compartilhados com todos os operadores** | Indica que o layout está disponível para todos os usuários com acesso ao mural. |
| **+ Novo** | Cria um novo layout em branco para configuração. |

#### Como criar um layout

1. Clique no botão de layout e selecione **+ Novo**.
2. Dê um nome ao layout (ex.: "Avenidas", "Setor Leste").
3. Clique em **Editar** para entrar no modo de edição da grade.
4. Em cada célula, selecione o **Equipamento** desejado no menu suspenso.
5. Clique em **Sair edição** para salvar e voltar ao modo de visualização.

---

### Alertas no Mural

O toggle **Alertas** ativa o modo de monitoramento de alertas no mural. Quando habilitado, o sistema exibe um destaque visual na célula do Equipamento sempre que um veículo monitorado for detectado passando por aquele ponto.

:::info Como funciona
O mural compara as placas das passagens registradas em tempo real com os veículos cadastrados nas listas de alertas. Quando há correspondência, a câmera correspondente recebe um indicador visual de alerta.
:::

Para que os alertas funcionem no mural, é necessário que haja **alertas configurados** no sistema. Acesse:

- 📖 [Configuração de Alertas](../operacoes/alertas) — manual de configuração

:::tip Dica
Combine o Mural de Câmeras com alertas configurados para veículos de interesse para criar uma central de monitoramento ativo — o operador visualiza as câmeras e recebe destaque imediato quando um veículo alvo é detectado.
:::
