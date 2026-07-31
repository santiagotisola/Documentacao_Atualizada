---
sidebar_position: 4
title: Modelos de Equipamentos
description: Modelos de equipamentos de pesagem por fabricante no AxTon
---

# Modelos de Equipamentos

Cadastro dos **modelos de equipamentos** por fabricante. Cada modelo define as características técnicas da balança ou sensor utilizado.

## Como acessar

**Menu lateral** → Cadastros Básicos → **Modelos de Equipamentos**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome do modelo |
| **Fabricante** | Sim | Fabricante vinculado |
| **Tipo** | Sim | Balança estática, dinâmica ou semiestática |
| **Capacidade (t)** | Não | Capacidade máxima de pesagem |

## Passo a passo

1. Acesse **Cadastros Básicos → Modelos de Equipamentos**
2. Clique em **+ Novo**
3. Preencha o **Nome**, selecione o **Fabricante** e o **Tipo**
4. Informe a **Capacidade** (opcional)
5. Clique em **Salvar**

:::info Hierarquia
Fabricante → Modelo → Equipamento. Antes de cadastrar um modelo, o Fabricante deve estar registrado em **Fabricantes de Equipamentos**.
:::

## Boas práticas

- Antes de cadastrar um novo modelo, pesquise se já existe para o mesmo fabricante — duplicidades prejudicam a rastreabilidade
- Informe o **Tipo de Equipamento** corretamente; um modelo mal classificado impede a configuração de parâmetros de pesagem
- Não renomeie modelos já associados a equipamentos em operação — pode causar inconsistência nos registros históricos
- Mantenha modelos descontinuados como **Inativos** para preservar o histórico sem prejudicar novos cadastros

## Modelos por fabricante

| Fabricante | Modelos |
|------------|---------|
| HAENNI | WL103, WL105, WL110 |
| Toledo do Brasil | ICS465, ICS685 |
| RODOANEL | WIM200, WIM400 |

## Quando atualizar o catálogo

- Ao adquirir novo equipamento de fabricante já cadastrado — cadastrar apenas o modelo novo
- Após homologação de novo fabricante pela ANTT/INMETRO
- Quando um modelo é descontinuado — inativar sem excluir

## Relacionado

- [Fabricantes](./fabricantes)
- [Equipamentos](./equipamentos)
- [Tipos de Equipamentos](./tipos-equipamentos)


## Passo a passo

1. Acesse **Cadastros Básicos → Modelos de Equipamentos**
2. Clique em **+ Novo**
3. Informe o **Nome** e selecione o **Fabricante**
4. Defina o **Tipo** de equipamento
5. Clique em **Salvar**

## Hierarquia

```
Fabricante → Modelo → Equipamento cadastrado no posto
```


| Coluna | Descrição |
|--------|-----------|
| **Código** | Identificador único |
| **Nome** | Nome do modelos de Equipamentos |
| **Ativo** | Status do registro |

### Passo a passo — Cadastrar

1. Acesse **Cadastros Básicos** → **Modelos de Equipamentos
2. Clique em **+ Novo**
3. Preencha os campos obrigatórios
4. Clique em **Salvar**

:::tip Dependência
Modelos dependem de Fabricante e Tipo previamente cadastrados.
:::

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Modelo não aparece para vincular ao equipamento | Modelo inativo ou fabricante diferente | Verificar se o modelo está ativo e vinculado ao fabricante correto |
| Não é possível salvar o equipamento | Modelo não cadastrado previamente | Cadastrar o modelo antes de criar o equipamento |
| Portaria INMETRO desatualizada no modelo | Certif. renovado sem atualizar o cadastro | Editar o modelo e atualizar a portaria INMETRO |

## Perguntas frequentes

**Preciso cadastrar todos os modelos antes de iniciar as operações?**
Sim. Cada equipamento precisa estar vinculado a um modelo existente. Cadastre os modelos mais comuns dos fabricantes utilizados durante a implantação para evitar bloqueios na criação dos equipamentos.

**O que fazer quando um modelo não está cadastrado e é identificado durante uma pesagem?**
Cadastre o modelo em **Cadastros Básicos → Modelos de Equipamentos → + Novo**, vinculando-o ao fabricante e tipo corretos. Em seguida, edite o equipamento correspondente para associá-lo ao novo modelo.

**Posso renomear um modelo já vinculado a equipamentos em operação?**
Não é recomendado. Renomear pode causar inconsistência nos relatórios históricos. Inative o modelo atual, crie um novo com o nome correto e redirecione os equipamentos para o novo cadastro.

## Integração com outros módulos

| Módulo | Como se relaciona com Modelos de Equipamentos |
|--------|------------------------------------------------|
| **Cadastros Básicos → Equipamentos** | Cada equipamento deve ser vinculado a um modelo — sem modelo, o cadastro é bloqueado |
| **Cadastros Básicos → Fabricantes** | O modelo é vinculado ao fabricante que o produz |
| **Cadastros Básicos → Tipos de Equipamentos** | Define a categoria do modelo (rádar, balança, câmera etc.) |
| **Operações → Monitoramento Online** | O modelo do equipamento aparece no painel de monitoramento para identificação |
