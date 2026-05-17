---
sidebar_position: 2
title: Painel Principal (Dashboard)
description: Painel principal do AxTon com indicadores operacionais de pesagem, infrações e últimas pesagens
---

# Painel Principal (Dashboard)

![Tela do Dashboard](../img/axton-dashboard.png)

O Painel Principal é a tela inicial do AxTon após a autenticação. Apresenta uma visão consolidada dos indicadores operacionais de pesagem veicular, incluindo contagens do mês, gráficos de distribuição e o histórico das últimas pesagens realizadas.

## Como acessar

- Ao realizar o login, o sistema redireciona automaticamente para o Dashboard
- Para retornar a qualquer momento: clique no **logo AxTon** no topo esquerdo ou no primeiro ícone do menu lateral

---

## Indicadores do Dashboard

O Dashboard apresenta **4 contadores principais** no topo da tela:

| Indicador | Descrição |
|-----------|----------|
| **Pesagens Realizadas em Maio** | Total de pesagens concluídas no mês atual |
| **Infrações Realizadas em Maio** | Total de infrações registradas no mês atual |
| **Total de Pesagens na Operação** | Soma de todas as pesagens no contexto da operação ativa |
| **Total de Infrações na Operação** | Soma de todas as infrações da operação ativa |

## Seções do Dashboard

### Distribuição de Pesagens e Infrações Diário

Gráfico que exibe a distribuição diária de pesagens e infrações. Permite visualizar:
- Volume de veículos pesados por dia
- Comparativo entre pesagens regulares e infrações
- Tendências ao longo da operação

### Últimas Pesagens

Lista cronológica das pesagens mais recentes. Cada registro exibe:

| Campo | Descrição |
|-------|-----------|
| **Placa** | Placa do veículo pesado |
| **Data/Hora** | Momento exato da pesagem |
| **Peso (kg)** | Peso bruto total medido |

Exemplos de registros reais do sistema:
- `SGD5E44` — 27/02/2026 13:42 — **42.800 kg**
- `RSC7D78` — 27/02/2026 09:06 — **78.450 kg**
- `RXQ0F30` — 27/02/2026 08:58 — **76.200 kg**
- `TNJ5R62` — 26/02/2026 16:15 — **92.400 kg** *(exemplo de sobrecarga)*

### Comparativo de Pesagens e Infrações

Gráfico comparativo que correlaciona o total de pesagens com as infrações geradas por período, útil para avaliação de eficiência da operação.
| **Utilidade** | Ação imediata sobre ocorrências em andamento |

Quando não há alertas recentes, o painel exibe: *"Nenhum alerta recente encontrado — Os alertas aparecerão aqui quando detectados"*.

### 5. Últimas Notas Fiscais

| Item | Descrição |
|------|-----------|
| **Atualização** | Últimas notas fiscais registradas no sistema |
| **Colunas** | Chave NFe, Placa, Origem, Destino, Data/Hora |
| **Dados** | Notas fiscais eletrônicas (NFe) capturadas dos veículos em trânsito |
| **Utilidade** | Rastrear a documentação fiscal vinculada às passagens |

---

## Menu lateral

O menu lateral exibe todos os módulos disponíveis para o perfil de acesso do usuário autenticado. Os itens são organizados de forma hierárquica, permitindo expandir e recolher as categorias.

---

## Dicas de uso

- **Acompanhe o Fluxo de Passagens** para dimensionar a equipe nos horários de pico
- **Verifique Alertas por Tipo** diariamente para identificar tendências (ex: muitos veículos sem MDF-e)
- **Use Origem das Cargas** para justificar estratégias de fiscalização por região
- **Monitore Alertas Recentes** para ação imediata em ocorrências críticas
- **Consulte Últimas Notas Fiscais** para validar a documentação fiscal dos veículos
