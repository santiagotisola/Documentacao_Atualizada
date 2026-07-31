---
sidebar_position: 3
title: Tipos de Equipamentos
description: Categorias de equipamentos de pesagem no AxTon
---

# Tipos de Equipamentos

Categorias dos **equipamentos de pesagem** cadastrados no sistema. O tipo define o comportamento do equipamento no processo de fiscalização.

## Como acessar

**Menu lateral** → Cadastros Básicos → **Tipos de Equipamentos**

## Tipos comuns

| Tipo | Descrição |
|------|-----------|
| **Balança Estática** | Pesagem com veículo parado |
| **Balança Dinâmica** | Pesagem com veículo em movimento |
| **Balança Semiestática** | Pesagem com velocidade reduzida |
| **Sensor de Eixo** | Apenas conta e identifica eixos |

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome do tipo |
| **Descrição** | Não | Detalhes técnicos |
| **Status** | Sim | Ativo ou Inativo |

## Hierarquia

```
Tipo de Equipamento → Fabricante → Modelo → Equipamento no posto
```

## Passo a passo

1. Acesse **Cadastros Básicos → Tipos de Equipamentos**
2. Clique em **+ Novo**
3. Preencha o **Nome** e a **Descrição**
4. Clique em **Salvar**

:::tip
O tipo de equipamento determina as configurações de operação aplicáveis (velocidade, tolerância de pesagem etc.). Consulte o fabricante para o tipo correto.
:::

## Tipos e precisão

| Tipo | Precisão | Interrompe tráfego? |
|------|:--------:|:-------------------:|
| Estática | ±2% | Sim |
| Semiestática | ±5% | Sim (velocidade reduzida) |
| Dinâmica (WIM) | ±10% | Não |
| Sensor de eixo | N/A | Não |

## Integração com outros módulos

| Módulo | Como usa o Tipo de Equipamento |
|--------|--------------------------------|
| **Equipamentos** | O tipo é atributo obrigatório no cadastro |
| **Aferições** | O tipo define o protocolo de aferição INMETRO |
| **Medições** | Classifica a disponibilidade por categoria |
| **Relatórios** | Filtra dados por tipo de equipamento |

## Perguntas frequentes

**Qual tipo usar para fiscalização sem parar o tráfego?**
Balança Dinâmica (WIM). Veículos com excesso são direcionados para confirmação em balança estática.

**O tipo pode ser alterado após cadastro?**
Sim, mas somente se nenhum equipamento ativo estiver vinculado. Veículos em operação devem ser desvinculados antes.

- [Fabricantes](./fabricantes)
- [Modelos de Equipamentos](./modelos-equipamentos)
- [Equipamentos](./equipamentos)

## Boas práticas

- Use tipos padronizados (Estática, Semiestática, Dinâmica) para garantir que o sistema aplique a tolerância metrológica correta em cada pesagem
- Não altere o tipo de um equipamento já em operação — pode causar recalculo incorreto das infrações históricas
- Documente a descrição do tipo com informações técnicas (norma INMETRO, velocidade máxima) para referência da equipe de campo
- Mantenha tipos obsoletos como **Inativos** em vez de excluir para preservar o vínculo com equipamentos históricos

2. Clique em **+ Novo**
3. Preencha o **Nome** e a **Descrição**
4. Clique em **Salvar**

:::tip
O tipo de equipamento determina as configurações de operação aplicáveis (velocidade de passagem, tolerância de pesagem, etc.). Consulte o fabricante para o tipo correto.
:::

### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Código** | Identificador único |
| **Nome** | Nome do tipos de Equipamentos |
| **Ativo** | Status do registro |

### Passo a passo — Cadastrar

1. Acesse **Cadastros Básicos** → **Tipos de Equipamentos
2. Clique em **+ Novo**
3. Preencha os campos obrigatórios
4. Clique em **Salvar**

:::tip Dependência
Este cadastro é utilizado como referência em outros módulos do sistema.
:::
