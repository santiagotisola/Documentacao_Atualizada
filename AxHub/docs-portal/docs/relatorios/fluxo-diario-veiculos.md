---
sidebar_position: 6
title: Fluxo Diário de Veículos
description: Relatório de fluxo diário de Veículos por Equipamento
---

# Fluxo Diário de Veículos

Exibe o volume diário de Veículos registrados por cada Equipamento em forma de tabela e gráfico. Permite acompanhar a evolução do fluxo ao longo do período selecionado e comparar o desempenho entre Equipamentos

![Fluxo Diário](../img/Relatorios%20-%20relatorio%20de%20fluxo%20diario%20de%20veiculos.png)

## Como acessar

**Menu lateral** → Relatórios → **Fluxo Diário de Veículos

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Período** | Faixa de datas |
| Equipamento | Filtrar por Equipamento |
| **Faixa** | Faixa de tráfego |
| **Região** | Filtrar por região geográfica |

## Campos exibidos

| Coluna | Descrição |
|--------|-----------|
| **Data** | Data de referência do registro |
| Equipamento | Nome e código do Equipamento |
| **Faixa** | Faixa de tráfego monitorada |
| **Total Passagens** | Quantidade total de Veículos registrados no dia |
| **Leituras OCR** | Placas lidas com sucesso pelo OCR |
| **Aproveitamento (%)** | Percentual de leitura de placas |

## Como usar

1. Acesse **Relatórios → Fluxo Diário de Veículos**
2. Selecione o **Período**
3. Filtre por **Equipamento** ou **Região** (opcional)
4. Clique em **Gerar**
5. Exporte em CSV para análise no Excel

:::tip
Use este relatório para monitorar quedas abruptas no fluxo — que podem indicar falha de equipamento — ou picos que demandam reforço operacional.
:::
| Infrações | Quantidade de Infrações geradas no dia |

## Exportação

Disponível em **Excel** para Análise em planilhas externas ou inclusão em Relatórios contratuais.

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Dias sem dados no relatório | Equipamento offline no período | Verificar Relatório de Eventos de Equipamentos |
| Aproveitamento OCR abaixo de 85% | Câmera suja, desalinhada ou com defeito | Acionar manutenção técnica imediata |
| Dados de apenas um equipamento exibidos | Filtro de equipamento aplicado | Remover o filtro para exibir todos os equipamentos |

## Perguntas frequentes

**Por que alguns dias não têm dados?**
O equipamento pode ter estado Offline no período. Verifique o Relatório de Eventos de Equipamentos.

**O aproveitamento baixou sem manutenção. O que fazer?**
Verifique limpeza da câmera OCR. Aproveitamento abaixo de 85% requer intervenção técnica imediata.

**Posso comparar dois equipamentos no mesmo relatório?**
Sim, retire o filtro de equipamento e o relatório exibirá todos os equipamentos no período.

:::tip Dica
Combine com o [Mapa de Fluxo de Passagens](./mapa-fluxo-passagens) para visualizar espacialmente os dados tabulares deste Relatório.
:::

## Interpretação do aproveitamento OCR

| Aproveitamento | Status | Ação |
|----------------|:------:|------|
| ≥95% | Excelente | Nenhuma |
| 90-94% | Normal | Monitorar |
| 85-89% | Atenção | Verificar limpeza da câmera |
| &lt;85% | Crítico | Solicitar manutenção técnica |
:::

## Casos de uso gerencial

- **Dimensionamento de equipe**: aumentar agentes nos horários de pico
- **Comparação dia a dia**: detectar anomalias de fluxo
- **Justificativa de SLA**: comprovar volume operacional ao contratante

## Relacionado

- [Mapa de Fluxo de Passagens](./mapa-fluxo-passagens)
- [Processamento de Imagens](./processamento-imagens)
- [Processamento por Usuário](./processamento-por-usuario)
:::

---

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Relacionado | [Monitoramento Online](../operacoes/monitoramento-online) | Status em tempo real |
| Relacionado | [Mapa Fluxo Passagens](./mapa-fluxo-passagens) | Visualização em mapa |
| Relacionado | Relatório de Passagens](./relatorio-passagens) | Detalhamento por passagem |

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Mapa de Fluxo de Passagens](./mapa-fluxo-passagens)** | Complemento visual georreferenciado dos mesmos dados tabulares apresentados neste relatório |
| **[Processamento de Imagens](./processamento-imagens)** | Fornece a taxa OCR por equipamento e dia que compõe o Aproveitamento (%) exibido |
| **[Operações / Faixas](../operacoes/faixas)** | As faixas e equipamentos da operação ativa são a fonte primária do fluxo diário de passagens |

## Exemplo prático

**Cenário**: O supervisor percebe que a segunda-feira da semana passada teve apenas 120 passagens no equipamento da Av. Brasil — bem abaixo da média de 850/dia. Precisa identificar se foi falha de equipamento ou baixo fluxo real.

**Passo a passo**:

1. Acesse **Relatórios → Fluxo Diário de Veículos**
2. Selecione o **Período** = semana em questão
3. Filtre por **Equipamento** = Av. Brasil
4. Compare os dias: segunda com 120 vs. terça com 870 passagens
5. Verifique a coluna **Aproveitamento (%)**: segunda mostra 12% vs. >90% nos outros dias
6. Acesse **Relatórios → Eventos dos Equipamentos** para confirmar: registro de falha de energia das 08h às 17h na segunda
7. Exporte em **Excel** e anexe ao Boletim de Medição como justificativa da indisponibilidade

**Resultado**: A queda é atribuída à falha de energia documentada, não a falha operacional. O contratante aceita a justificativa e não aplica desconto no contrato.
