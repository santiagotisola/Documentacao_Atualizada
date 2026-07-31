---
sidebar_position: 4
title: Grupos de Equipamentos
description: Cadastro de grupos de Equipamentos no AxCross
---

# Grupos de Equipamentos

Agrupamento lógico de Equipamentos para facilitar a gestão e o monitoramento de conjuntos relacionados (por exemplo, Equipamentos de uma mesma região ou tipo de fiscalização).

## Como acessar

No **menu lateral**, expanda **Cadastros** e clique em **Grupos de Equipamentos**.

![Lista de Grupos de Equipamentos](../img/Grupo de Equipamentos.png)

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome identificador do grupo |
| **Descrição** | Não | Descrição do propósito do grupo |
| **Equipamentos** | Não | Equipamentos vinculados ao grupo |

## Passo a passo

1. Acesse **Cadastros → Grupos de Equipamentos**
2. Clique em **+ Novo**
3. Informe o **Nome** e opcionalmente uma **Descrição**
4. Vincule os **Equipamentos** desejados
5. Clique em **Salvar**

:::tip
Agrupar por região geográfica facilita o monitoramento e a filtragem de relatórios. Ex.: "Centro", "Sul", "Rodovia SP-310".
:::

## Relacionado

- [Equipamentos](../cadastros/equipamentos)
- [Alertas](../operacoes/alertas)
- [Cadastro de Operações](../operacoes/cadastro-operacoes)

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Grupo vazio | Equipamentos não vinculados | Vincular após criar o grupo |
| Filtro de relatório não mostra grupo | Nome com acento/espaço | Verificar nome e vincular novamente |
| Equipamento em 2 grupos | Sem problema | Permitido para agrupamentos diferentes |

## Exemplos de agrupamento

| Nome do grupo | Critério |
|---------------|----------|
| Centro | Equipamentos do centro da cidade |
| Rodovia BR-040 | Equipamentos na BR-040 |
| Zona Norte | Equipamentos da zona norte |

| Nome do grupo | Critério |
|---------------|----------|
| Centro | Equipamentos do centro da cidade |
| Rodovia BR-040 | Equipamentos na BR-040 |
| Zona Norte | Equipamentos da zona norte |
| Blitz Noturna | Equipamentos ativos em operações noturnas |

:::tip
Grupos bem nomeados agilizam a busca e filtragem em operações e relatórios. Crie um grupo por área geográfica ou por contrato.
:::

## Boas práticas

- Crie grupos com critério consistente: geográfico (bairro, rodovia) ou operacional (contrato, tipo de fiscalização)
- Mantenha os grupos atualizados após instalação ou desativação de equipamentos
- Nomes descritivos facilitam a leitura nos relatórios e na triagem de alertas por equipes operacionais

## Passo a passo — Criar novo grupo

![Novo Grupo de Equipamentos](../img/Grupo de Equipamentos - novo.png)

1. Acesse **Cadastros → Grupos de Equipamentos** no menu lateral
2. Clique em **Novo Grupo**
3. Informe o **Nome** do grupo
4. Opcionalmente, adicione uma **Descrição**
5. Selecione os Equipamentos a vincular ao grupo
6. Clique em **Salvar**

:::tip Dica
Grupos de Equipamentos facilitam o monitoramento simultâneo de vários pontos de fiscalização, permitindo visualizar o status de todos os Equipamentos de um conjunto de uma só vez.
:::

## Perguntas frequentes

**Para que serve criar grupos de equipamentos no AxCross?**
Grupos permitem filtrar o monitoramento, alertas e relatórios por conjunto lógico de equipamentos (ex.: uma região geográfica ou um contrato específico). Isso facilita o acompanhamento operacional quando há muitos equipamentos instalados em diferentes locais.

**Um equipamento pode pertencer a mais de um grupo simultaneamente?**
Sim. O sistema permite vincular o mesmo equipamento a múltiplos grupos sem conflito. Isso é útil quando o equipamento precisa ser monitorado por diferentes critérios (ex.: por região geográfica e por tipo de fiscalização).

**Como usar grupos para filtrar relatórios no AxCross?**
Nos relatórios que oferecem o filtro **Grupo de Equipamentos**, selecione o grupo desejado para restringir os dados ao conjunto de equipamentos correspondente. Certifique-se de que todos os equipamentos relevantes estão vinculados ao grupo antes de gerar o relatório.

## Integração com outros módulos

| Módulo | Como usa este cadastro/relatório |
|--------|----------------------------------|
| **Equipamentos** | Os grupos são formados por equipamentos cadastrados — um equipamento pode pertencer a múltiplos grupos sem conflito |
| **Monitoramento Online** | Permite filtrar o painel de monitoramento por grupo, exibindo apenas os equipamentos do conjunto selecionado |
| **Alertas** | Regras de alerta e notificação podem ser configuradas por grupo, segmentando a gestão operacional por área |
| **Relatórios** | Todos os relatórios com filtro de equipamento suportam filtro por grupo para análise por região ou contrato |
