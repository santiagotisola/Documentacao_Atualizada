---
sidebar_position: 3
title: Fluxo Diário de Veículos
description: Volume de tráfego por hora e dia nos postos de pesagem do AxTon
---

# Fluxo Diário de Veículos

Gráfico e tabela com o **volume horário de veículos** nos postos de pesagem. Essencial para dimensionamento de equipes operacionais e análise de padrões de tráfego.

## Como acessar

**Menu lateral** → Relatórios → **Fluxo Diário de Veículos**

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Data** | Dia específico para análise |
| **Posto de pesagem** | Filtrar por localidade |
| **Categoria de veículo** | Caminhão, bitrem, romeu/julieta, etc. |

## Informações exibidas

| Coluna/Elemento | Descrição |
|-----------------|-----------|
| **Gráfico por hora** | Barras mostrando volume de veículos por hora do dia (0h-23h) |
| **Pico do dia** | Horário e volume máximo de passagens |
| **Total do dia** | Somatório de todas as passagens |
| **Média horária** | Média de veículos por hora no período |

## Como usar

1. Acesse **Relatórios → Fluxo Diário de Veículos**
2. Selecione a **Data**
3. Filtre por **Posto** ou **Categoria** (opcional)
4. Clique em **Gerar**

:::tip
Identifique os horários de pico para dimensionar equipes operacionais com mais precisão e justificar demandas ao contratante.
:::

## Casos de uso

- **Planejamento operacional**: distribuir agentes nos horários críticos
- **Comparação semanal**: detectar anomalias de fluxo por dia da semana
- **Relatório ao contratante**: evidenciar volume operacional no período

## Tabela de referência — horários de pico típicos

| Período | Fluxo esperado | Observação |
|---------|:--------------:|------------|
| 06h – 09h | Alto | Saída de cargas das distribuidoras |
| 09h – 12h | Médio | Tráfego regular |
| 12h – 14h | Baixo | Almoço/pausa operacional |
| 14h – 17h | Alto | Retorno de cargas |
| 17h – 20h | Médio-alto | Tráfego misto |
| 20h – 06h | Baixo | Tráfego noturno |

## Integração com outros módulos

| Módulo | Relação |
|--------|----------|
| **Medições** | Evidencia o volume para o Boletim contratual |
| **Monitoramento Online** | Dados em tempo real vs histórico deste relatório |
| **Mapa de Fluxo** | Versão geográfica do mesmo dado |

## Perguntas frequentes

**O relatório não exibe dados para um posto específico. Por quê?**  
Verifique se o posto está com status **Ativo** e se houve pesagens no período. Postos inativos não geram dados no relatório.

**É possível comparar dois dias no mesmo relatório?**  
Não diretamente — exporte os dois períodos em Excel e compare nas planilhas lado a lado.

**Queda brusca no fluxo indica falha de equipamento?**  
Pode indicar. Confirme com o [Processamento de Imagens](./processamento-imagens) e, se necessário, abra um evento em [Eventos de Equipamentos](../operacoes/eventos-equipamentos).

## Relacionado

- [Relatório de Infrações](./relatorio-infracoes)
- [Processamento de Imagens](./processamento-imagens)

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|---------|
| Relatório vazio para um posto | Sem pesagens no dia ou posto inativo | Verificar status do posto em Operações |
| Volume muito baixo inesperado | Equipamento offline durante o dia | Verificar Eventos de Equipamentos |
| Gráfico sem dados de pico | Período selecionado sem operação | Confirmar operação ativa no dia consultado |

## Relacionado

- [Relatório de Infrações](./relatorio-infracoes)
- [Processamento de Imagens](./processamento-imagens)
- [Monitoramento Online](../operacoes/monitoramento-online)

## Exemplo prático

**Cenário**: O supervisor percebe que uma segunda-feira específica teve volume de passagens 40% abaixo da média semanal. Antes de reportar ao contratante, usa o Fluxo Diário para investigar.

**Passo a passo**:

1. Acesse **Relatórios → Fluxo Diário de Veículos**
2. Selecione a **Data** da segunda-feira em questão
3. Filtre pelo **Posto** com volume anormal
4. Observe o gráfico por hora: o volume cai a zero entre 08h e 14h
5. Acesse **Operações → Eventos de Equipamentos** e confirma que o equipamento ficou **Offline** no mesmo período
6. Registre o evento com causa (falha de energia no local) e hora de retorno
7. Exporte o relatório em Excel para documentar a causa da queda ao contratante

**Resultado**: O supervisor demonstra ao contratante que a queda de volume não foi operacional, mas causada por falha elétrica externa documentada. O incidente é registrado e não é descontado no Boletim de Medição.

## Tabela de referência rápida — padrões de fluxo

| Período do dia | Fluxo esperado | Desvio que indica alerta |
|----------------|:--------------:|:------------------------:|
| 06h-08h (pico manhã) | Alto | Queda > 40% vs média histórica |
| 08h-12h (operacional) | Médio-alto | Queda > 30% |
| 12h-14h (almoço) | Baixo | Normal |
| 14h-17h (pico tarde) | Alto | Queda > 40% |
| 17h-20h (fim expediente) | Médio | Queda > 25% |
| 20h-06h (noturno) | Baixo | Elevação suspeita |

