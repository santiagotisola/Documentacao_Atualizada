---
sidebar_position: 3
title: Dashboard
description: Painel principal do AxHub com visão geral do sistema
---

# Dashboard

O Dashboard é a tela inicial do AxHub após o login. Ele apresenta uma visão geral do estado operacional de todos os equipamentos e do processamento de infrações.

![Tela do Dashboard](../img/Dasboard.png)

## Como acessar

**Menu lateral** → primeiro ícone (Dashboard)

## Painéis disponíveis

### Triagem Mensal

Gráfico de barras horizontais que mostra o volume de processamento mensal:

- **Total de Imagens** — quantidade total de imagens recebidas
- **Total Descartado** — imagens/infrações descartadas na triagem
- **Total Processado** — imagens/infrações validadas

Clique em **Atualizar** para recarregar os dados do gráfico.

### Mapa de Equipamentos

Mapa interativo (Google Maps) que exibe a localização de todos os equipamentos de trânsito. Cada grupo de equipamentos é representado por uma **cor diferente** no mapa, conforme configurado no cadastro de grupos.

- Use os controles de **Mapa/Satélite** para alternar a visualização
- Clique em um **marcador** para ver detalhes do equipamento
- A **legenda** lateral lista todos os grupos de equipamentos e suas cores

### Painel Sintético

Painel com dois resumos operacionais:

**Defasagem de Processamento:**
Mostra há quanto tempo existem imagens aguardando processamento (ex: "> 7 dias"), indicando possíveis atrasos na triagem.

**Imagens Capturadas na Semana:**
Resumo semanal por status:
- **Não Publicadas** — aguardando publicação
- **Invalidadas** — descartadas no processamento
- **Válidas** — aprovadas na triagem
- **Análise** — em processo de triagem
- **Auditoria** — em processo de auditoria

Use o filtro **Grupos de Equipamentos** para visualizar dados de um grupo específico.

### Status Equipamentos

Quatro indicadores coloridos mostram o status de conectividade dos equipamentos em tempo real:

| Cor | Status | Descrição |
|:---:|--------|-----------|
| Verde | **Online** | Equipamento operando normalmente |
| Laranja | **Offline recente** | Equipamento sem comunicação recente |
| Vermelho | **Offline** | Equipamento sem comunicação |
| Azul | **Total** | Total de equipamentos cadastrados |

### Últimos Eventos

Log em tempo real dos últimos eventos reportados pelos equipamentos:

- **Equipamento** — código do equipamento
- **Recebido** — data/hora do evento
- **Tipo de Evento** — classificação (Pânico, Comunicação, etc.)
- **Descrição** — detalhes do evento

:::warning Atenção
Eventos do tipo **Pânico** (indicados em vermelho) requerem atenção imediata, pois podem indicar violação ou mau funcionamento do equipamento.
:::
