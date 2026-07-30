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
