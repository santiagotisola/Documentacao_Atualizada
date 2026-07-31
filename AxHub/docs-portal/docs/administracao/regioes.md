---
sidebar_position: 10
title: Regiões
description: Cadastro de regiões geográficas para agrupamento de operações no AxHub
---

# Regiões

Cadastro das regiões geográficas utilizadas para **agrupar operações e equipamentos** por área, facilitando filtros em relatórios e distribuição de responsabilidades.

## Como acessar

**Menu lateral** → Configurações → **Regiões**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Identificação da região (ex: "Região Metropolitana") |
| **Descrição** | Não | Detalhamento geográfico |
| **Status** | Sim | Ativo ou Inativo |

## Passo a passo — Cadastrar região

1. Acesse **Configurações → Regiões**
2. Clique em **+ Nova**
3. Preencha o **Nome** e, opcionalmente, a **Descrição**
4. Clique em **Salvar**

:::tip
Após cadastrar regiões, vincule os equipamentos a elas em **Configurações → Equipamentos**. Isso habilita o filtro de região nos relatórios.
:::

## Boas práticas

- Defina regiões com critérios claros (geográfico, contratual ou administrativo) antes de cadastrar equipamentos
- Evite regiões genéricas demais — quanto mais específica a região, mais úteis os filtros nos relatórios
- Uma vez criada e vinculada a equipamentos, renomear uma região pode confundir históricos já gerados

## Relacionado

- [Equipamentos](./equipamentos)
- [Relatórios](../relatorios/fluxo-diario-veiculos)
- [Operações](../operacoes/cadastro-operacoes)

## Fluxo de configuração de regiões

1. Definir critérios de divisão (geográfico, contratual ou administrativo)
2. Cadastrar as regiões em **Configurações → Regiões**
3. Acessar **Configurações → Equipamentos** e vincular cada equipamento à sua região
4. Verificar nos relatórios que o filtro por região funciona corretamente

## Exemplos de critérios de região

| Critério | Exemplo | Quando usar |
|---------|---------|-------------|
| Geográfico | Norte, Sul, Centro-Oeste | Distribuição territorial |
| Contratual | Contrato SINFRA, Prefeitura | Separação por cliente |
| Administrativo | Coordenadoria 01, 02 | Equipes distintas |
| Viário | Rodovias, vias urbanas | Tipo de via |

## Erros comuns

| Situação | Causa | Solução |
|----------|-------|----------|
| Equipamento sem região | Não vinculado no cadastro | Editar equipamento e vincular região |
| Filtro de região vazio nos relatórios | Nenhum equipamento vinculado | Verificar vínculos dos equipamentos |
| Região duplicada | Dois cadastros com mesmo escopo | Inativar o duplicado |

## Casos de uso

| Critério | Exemplo |
|----------|---------|
| Geográfico | Norte, Sul, Centro, Zona Industrial |
| Contratual | Contrato A (SINFRA), Contrato B (Prefeitura) |
| Administrativo | Coordenadoria 01, Coordenadoria 02 |

:::tip
Comece definindo as regiões antes de vincular equipamentos. Alterar regiões posteriormente requer revinculação manual de todos os equipamentos.
:::
## Uso das regiões

- **Filtro de relatórios:** Filtrar dados por área geográfica
- **Agrupamento de equipamentos:** Organizar equipes por região
- **Dashboard:** KPIs por região de operação

|-------|-----------|
| **Nome** | Nome da região |
| **UF** | Estado vinculado |
| **Descrição** | Detalhamento |
| **Ativo** | Status do registro |

:::note Sem screenshot
está tela ainda não possui screenshot cadastrada. Será adicionada em breve.
:::

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Operacoes](../operacoes/cadastro-operacoes) | Regiao da operacao |
| Relacionado | [Equipamentos](../cadastros-basicos/equipamentos) | Equipamentos na regiao |

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Filtro por região retorna vazio | Equipamento não vinculado a nenhuma região | Editar o cadastro do equipamento e vincular à região correta |
| Dados históricos com nome incorreto | Região renomeada após os registros | Considerar criar nova região para não afetar histórico |
| Dashboard sem KPIs por região | Equipamentos sem região associada | Revisar e vincular todos os equipamentos a suas regiões |

## Perguntas frequentes

**Posso vincular um equipamento a mais de uma região?**
Não. Cada equipamento é vinculado a uma única região. Se precisar reorganizar, edite o cadastro do equipamento e altere a região.

**O que acontece se eu renomear uma região já vinculada a equipamentos?**
Os relatórios históricos passam a exibir o novo nome, o que pode causar confusão ao comparar dados de períodos diferentes. Prefira criar uma nova região e migrar os equipamentos gradualmente.

**Excluir uma região afeta as infrações existentes?**
Sim. Infrações já geradas por equipamentos da região perderão a referência geográfica nos relatórios. Inative a região em vez de excluí-la.

## Integração com outros módulos

| Módulo | Como usa este cadastro/relatório |
|--------|----------------------------------|
| **Equipamentos** | Cada equipamento é vinculado a uma região — sem esse vínculo o filtro por região nos relatórios fica em branco |
| **Operações** | As operações herdam a região do equipamento a elas associado, permitindo agrupar resultados por área |
| **Relatórios** | Todos os relatórios de passagens, infrações e discrepâncias oferecem filtro por região cadastrada |
| **Dashboard** | KPIs de disponibilidade e OCR são exibidos agrupados por região, facilitando gestão territorial |
