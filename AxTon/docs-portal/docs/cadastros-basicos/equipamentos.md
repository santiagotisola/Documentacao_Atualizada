---
sidebar_position: 1
title: Equipamentos
description: Cadastro dos equipamentos de pesagem nos postos do AxTon
---

# Equipamentos

Cadastro dos **equipamentos de pesagem** instalados nos postos de fiscalização. Cada equipamento precisa estar cadastrado para que as pesagens sejam registradas corretamente.

## Como acessar

**Menu lateral** → Cadastros Básicos → **Equipamentos**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Código** | Sim | Identificador único do equipamento |
| **Número de Série** | Sim | S/N do fabricante |
| **Tipo** | Sim | Estática, Dinâmica ou Semiestática |
| **Fabricante** | Sim | Fabricante vinculado |
| **Modelo** | Sim | Modelo vinculado |
| **Posto** | Sim | Posto de pesagem onde está instalado |
| **Status** | Sim | Ativo, Inativo ou Em Manutenção |

## Passo a passo

1. Acesse **Cadastros Básicos → Equipamentos**
2. Clique em **+ Novo**
3. Preencha o **Código**, **Número de Série** e selecione **Tipo**, **Fabricante** e **Modelo**
4. Vincule ao **Posto**
5. Clique em **Salvar**

:::caution Aferição INMETRO
Após cadastrar o equipamento, registre a aferição inicial em **Operações → Aferições**. Sem aferição válida, as infrações não têm validade legal.
:::

## Manutencao e status

| Status | Significado | Ação |
|--------|-------------|------|
| Ativo | Operacional | Monitorar |
| Em Manutenção | Intervenção técnica | Registrar evento |
| Inativo | Fora de operação | Verificar antes de desativar |

## Boas práticas

- Sempre cadastre **Fabricante**, **Tipo** e **Modelo** antes de criar o equipamento — são dependências obrigatórias
- Use uma codificação padronizada para identificar rapidamente o equipamento por posto e número de série
- Mantenha o **Status** atualizado (Ativo / Em Manutenção / Inativo) para que o cálculo de disponibilidade contratual seja correto
- Vincule o equipamento ao **Grupo** correto para facilitar a geração de medições e relatórios segmentados por contrato

## Relacionado

- [Tipos de Equipamentos](./tipos-equipamentos)
- [Modelos de Equipamentos](./modelos-equipamentos)
- [Fabricantes](./fabricantes)

| **Ativo** | Status do registro |

### Passo a passo — Cadastrar

1. Acesse **Cadastros Básicos** → Equipamentos
2. Clique em **+ Novo**
3. Preencha os campos obrigatórios
4. Clique em **Salvar**

:::tip Dependência
Para cadastrar um Equipamento é necessário ter previamente cadastrado: Fabricante, Tipo e Modelo.
:::

---

## Cadastros Básicos

| Cadastro | Descrição |
|---|---|
| [**Fabricantes**](../cadastros-basicos/fabricantes) | Cadastro dos fabricantes de Equipamentos |
| [**Tipos de Equipamentos**](../cadastros-basicos/tipos-Equipamentos) | Categorias de Equipamentos de pesagem |
| [**Modelos de Equipamentos**](../cadastros-basicos/modelos-equipamentos) | Modelos por fabricante |
| [**Grupos de Equipamentos**](../cadastros-basicos/grupos-Equipamentos) | Agrupamento lógico de Equipamentos |

## Perguntas frequentes

**Posso ter dois equipamentos no mesmo posto?**
Sim. Um posto pode ter múltiplos equipamentos (ex: balança estática + sensor de eixo).

**O que acontece se eu desativar um equipamento com pesagens pendentes?**
As pesagens registradas são preservadas. Novas pesagens não serão associadas ao equipamento inativo.

**Com que frequência preciso atualizar o número de série?**
Nunca. O número de série é um identificador permanente do equipamento físico.
