---
sidebar_position: 4
title: Relatório de Discrepâncias
description: Divergências entre pesagens e dados esperados no AxTon
---

# Relatório de Discrepancias

Identifica **divergências** entre os dados registrados e os valores esperados: diferenças de peso, classificação incorreta e inconsistências fiscais.

## Como acessar

**Menu lateral** → Relatórios → **Relatório de Discrepancias**

## Tipos de discrepancia

| Tipo | Descrição | Causa comum |
|------|-----------|-------------|
| **Peso divergente** | Peso aferido ð peso declarado na NF-e | Sub-declaração de carga |
| **Classificação errada** | Categoria do veículo incorreta | OCR + classificação automática |
| **MDF-e inconsistente** | Manifesto não cobre todos os eixos | Erro do emitente |
| **PBT excedido na declaração** | Peso declarado > limite legal | Irregularidade intencional |

## Filtros

| Filtro | Descrição |
|--------|-----------|
| **Período** | Data início e fim |
| **Posto** | Local da pesagem |
| **Tipo de discrepancia** | Filtrar por categoria |

## Como usar

1. Acesse **Relatórios → Relatório de Discrepancias**
2. Selecione o **Período** e o **Posto**
3. Escolha o **Tipo de Discrepancia** (opcional)
4. Clique em **Gerar**
5. Exporte em CSV para análise ou envio à fiscalização

:::warning
Discrepancias entre peso declarado e aferido superior a 10% devem ser reportadas ao órgão fiscalizador conforme obrigação legal.
:::

## Relacionado

- [NF-e](../glossario/nfe)
- [MDF-e](../glossario/mdfe)
- [Relatório de Notas Fiscais](./relatorio-nfe)

| **Tolerância (%)** | Excluír discrepancias dentro da margem |

## Uso operacional

- Identificar veículos recorrentes com sub-declaração
- Auditar qualidade das classificações automáticas
- Embasar ações judiciais contra infratores recorrentes

## Casos de uso

- **Fiscalização fiscal**: cruzar peso aferido com peso declarado na NF-e para identificar sub-declaração de carga
- **Auditoria técnica**: verificar classificações automáticas incorretas que geraram erros nos enquadramentos de infração
- **Relatório para contratante**: demonstrar volume de discrepancies identificadas e tratadas no período
- **Prevenção de rejeicao**: resolver inconsistências antes da exportação para evitar rejeicao de lotes pelo SENATRAN

## Exportação

Disponível em **Excel** e **PDF**.


## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Relatório vazio | Nenhuma divergência no período | Ampliar o período ou remover filtros |
| Peso esperado zerado | NF-e sem peso declarado | Verificar manifesto (MDF-e) no período |
| Classificação sempre errada | OCR com confiança baixa | Calibrar câmera ou ajustar configuração OCR |
| Discrepancia não aparece na exportação | Tipo não mapeado no layout | Revisar Configurações → Sistema |

## Tabela de referência — limites de tolerância

| Tipo | Tolerância legal | Obrigação de report |
|------|:---------------:|:-------------------:|
| **Peso aferido vs. declarado** | 5% | Ac ima de 10%: reportar à SEFAZ |
| **Classificação incorreta** | 0% | Qualquer ocorrência |
| **MDF-e inconsistente** | 0% | Qualquer ocorrência |

## Relacionado

- [NF-e](../glossario/nfe)
- [MDF-e](../glossario/mdfe)
- [Relatório de Notas Fiscais](./relatorio-nfe)

## Perguntas frequentes

**Qual percentual de discrepância entre peso declarado e aferido deve ser reportado à SEFAZ?**
Discrepâncias acima de 10% entre o peso aferido e o declarado na NF-e devem ser reportadas ao órgão fiscalizador, conforme obrigação legal. O relatório destaca automaticamente essas ocorrências.

**Por que o relatório retorna vazio mesmo havendo pesagens no período?**
Verifique os filtros aplicados. Se o tipo de discrepância estiver selecionado de forma muito restritiva, nenhum resultado será exibido. Remova filtros e amplie o período para confirmar se há dados disponíveis.

**A discrepância de classificação gera infração automática?**
Não diretamente. O relatório identifica a inconsistência, mas a geração de infração depende de triagem e validação pelo operador com base nos dados de eixo, PBT e documentação fiscal.

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **NF-e** | A nota fiscal é comparada com o peso aferido para detectar sub-declarações de carga |
| **MDF-e** | Inconsistências no manifesto eletrônico são identificadas e listadas pelo relatório |
| **Exportação de Infrações** | Discrepâncias devem ser resolvidas antes de cada exportação para evitar rejeição pelo SENATRAN |

## Exemplo prático

**Cenário**: O fiscal percebe que 23 registros da semana apresentam **peso declarado na NF-e de 28 t** mas o peso aferido é de **35 t** — diferença de 25%, bem acima dos 10% que obrigam reporte à SEFAZ.

**Configuração**:

1. Acesse **Relatórios → Relatório de Discrepâncias**
2. Filtre por **Período** = semana atual, **Tipo** = "Peso divergente"
3. Exporte em **Excel** para análise detalhada
4. Identifique placas recorrentes — veículos que aparecem 3+ vezes são candidatos à fiscalização ativa
5. Para cada ocorrência acima de 10%: registre a ocorrência na plataforma do órgão fiscalizador conforme exigência legal
6. Na triagem, revise se as infrações de excesso de PBT foram geradas corretamente para esses veículos

**Resultado**: O relatório documenta 23 casos de sub-declaração, permitindo ao fiscal encaminhar o relatório à SEFAZ e ao SENATRAN. A fiscalização ativa reduz a reincidência e aumenta a conformidade no posto.
