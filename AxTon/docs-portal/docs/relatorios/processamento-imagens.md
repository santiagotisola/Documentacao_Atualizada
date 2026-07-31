---
sidebar_position: 6
title: Processamento de Imagens
description: Volume e taxa de reconhecimento de imagens no AxTon
---

# Processamento de Imagens

![Tempo de Análise de Imagem](../img/tempo%20de%20analise%20de%20imagem.png)

Apresenta o **volume de imagens capturadas e processadas** pelo sistema, incluindo taxas de reconhecimento OCR e falhas. Permite monitorar a qualidade das capturas dos equipamentos.

## Como acessar

**Menu lateral** → Relatórios → **Processamento de Imagens**

## Indicadores exibidos

| Indicador | Descrição |
|----------|-----------|
| **Total capturado** | Imagens tiradas pelos equipamentos no período |
| **Reconhecidas** | Imagens com placa legível pelo OCR |
| **Não reconhecidas** | Imagens sem leitura de placa |
| **Taxa OCR** | Percentual de reconhecimento (meta: >90%) |
| **Tempo médio** | Tempo médio de processamento por imagem |

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Período** | Data início e fim |
| **Equipamento** | Filtrar por câmera/sensor específico |
| **Posto** | Filtrar por localidade |

## Interpretação da Taxa OCR

| Taxa | Status | Ação recomendada |
|------|--------|------------------|
| ≥90% | ✅ Normal | Monitorar |
| 80-89% | ⚠️ Atenção | Verificar limpeza das câmeras |
| <80% | ❌ Crítico | Solicitar manutenção técnica |

:::tip
Use este relatório semanalmente para identificar equipamentos com queda de OCR antes que impacte a medição contratual.
:::

## Casos de uso

- **Monitoramento de qualidade** — identifique semanalmente equipamentos com OCR abaixo de 85% antes que impactem a medição contratual
- **Solicitação de manutenção** — exporte os dados para embasar chamados técnicos com evidências de queda de desempenho
- **Avaliação pós-intervenção** — compare o aproveitamento antes e depois de limpeza ou calibração
- **Alerta de falha sistêmica** — múltiplos equipamentos com queda simultânea indicam problema de rede ou servidor

## Fluxo de monitoramento de qualidade OCR

1. Acessar **Relatórios → Processamento de Imagens** semanalmente
2. Filtrar pelo **período** da última semana por equipamento
3. Identificar equipamentos com **Taxa OCR < 85%**
4. Comparar com a semana anterior para verificar tendência
5. Taxa caindo: programar limpeza de lente ou visita técnica
6. Exportar os dados para embasar chamado técnico com evidências objetivas

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Relatório mostra zero imagens | Nenhuma pesagem no período | Ampliar o período de consulta |
| Taxa OCR zerada em equipamento | Equipamento offline no período | Verificar status no Monitoramento Online |
| Dados duplicados no relatório | Filtros conflitantes | Limpar filtros e refazer a consulta |
| Taxa OCR abaixo de 70% persistente | Falha de hardware ou posicionamento da câmera | Acionar manutenção técnica |

## Relacionado

- [Processamento por Usuário](./processamento-por-usuario)
- [Índices de Performance](../medicoes/indices-performance)
- [Fluxo Diário de Veículos](./fluxo-diario-veiculos)

:::tip Dica
Use este relatório mensalmente para embasar solicitações de manutenção em equipamentos com baixa taxa de reconhecimento.
:::


| Coluna | Descrição |
|--------|-----------|
| **Período** | Data referência |
| **Capturadas** | Total de imagens |
| **Processadas** | Imagens analisadas |
| **Reconhecidas** | Placas identificadas |
| **Taxa** | Percentual de sucesso |

### Filtros disponíveis

- Período (data inicial e final)
- Posto de pesagem
- Exportar para Excel/PDF

## Perguntas frequentes

**Taxa OCR abaixo de 80% em um equipamento exige manutenção imediata?**
Sim. Taxa abaixo de 80% é considerada crítica e deve acionar solicitação de manutenção técnica com urgência. Antes, verifique se há sujeira na lente da câmera, pois limpeza simples pode recuperar o desempenho rapidamente.

**Com que frequência devo consultar este relatório?**
Semanalmente para monitoramento preventivo. Quedas abruptas de OCR entre uma semana e outra indicam falha nascente no equipamento antes que ele pare completamente.

**O relatório diferencia imagens de teste das imagens operacionais?**
Depende da configuração do sistema. Verifique o parâmetro **Imagem de Teste** em **Sistema → Configurações** para entender se essas imagens são incluídas ou excluídas dos cálculos.

## Integração com outros módulos

| Módulo | Como se relaciona com Processamento de Imagens |
|--------|--------------------------------------------------|
| **Sistema → Configurações** | Parâmetros OCR e configuração de câmeras impactam diretamente a taxa de reconhecimento |
| **Medições → Índices de Performance** | A taxa OCR calculada aqui é o índice monitorado no contrato de medição |
| **Operações → Eventos de Equipamentos** | Quedas de OCR devem gerar eventos de equipamento para rastreabilidade e manutenção |
| **Relatório de Infrações** | Imagens não reconhecidas resultam em infrações sem placa — visíveis como filtro no relatório |

## Exemplo prático

**Cenário**: O contrato prevê índice mínimo de **OCR de 90%** para pagamento integral do boletim mensal. O supervisor percebe que dois equipamentos estão abaixo desse índice há 2 semanas.

**Passo a passo**:

1. Acesse **Relatórios → Processamento de Imagens**
2. Filtre por **Período** = últimas 2 semanas e agrupe por **Equipamento**
3. Identifique os 2 equipamentos com **Taxa OCR** = 76% e 71%
4. Compare com as semanas anteriores: ambos estavam acima de 90% até 3 semanas atrás
5. Exporte os dados em Excel para embasar o chamado técnico
6. Abra ocorrência em **Operações → Eventos de Equipamentos** documentando o início da queda
7. A equipe técnica realiza limpeza e calibração — OCR sobe para 94% na semana seguinte

**Resultado**: A intervenção documentada evita o desconto contratual por desempenho abaixo do SLA. O relatório exportado comprova o problema e a correção ao contratante.
