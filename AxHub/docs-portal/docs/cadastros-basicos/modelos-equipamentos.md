---
sidebar_position: 3
title: Modelos de Equipamentos
description: Cadastro dos modelos de equipamentos e portarias INMETRO
---

# Modelos de Equipamentos

O cadastro de modelos de equipamentos registra os modelos específicos de hardware com suas respectivas portarias INMETRO de homologação.

## Como acessar

**Menu lateral** → Equipamentos → **Modelos de Equipamentos**

## Listagem

![Tela de Modelos de Equipamentos - Lista](../img/Modelos%20de%20Equipamentos%20-%20Lista.png)

### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Marca** | Marca comercial do equipamento (ex: VELSIS, FOCALLE, PERKONS) |
| **Modelo** | Modelo específico (ex: F-DIP, VSIS-OCR, SmartPlu PRO) |
| **Número Portaria** | Número da portaria INMETRO de homologação |
| **Portaria** | Referência completa da portaria (ex: PORTARIA INMETRO/DIMEL Nº 245/2022) |
| **Fabricante** | Fabricante vinculado a este modelo |
| **Ações** | Botões de editar e excluir |

## Cadastro

![Tela de Modelos de Equipamentos - Cadastro](../img/Modelos%20de%20Equipamentos%20-%20Cadastro.png)

### Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Marca** | Sim | Marca comercial do equipamento |
| **Modelo** | Sim | Nome/código do modelo |
| **Número da Portaria** | Sim | Número da portaria INMETRO que homologa este modelo |
| **Portaria** | Sim | Referência completa da portaria (ex: "PORTARIA INMETRO/DIMEL Nº 245/2022") |
| **Fabricante** | Sim | Fabricante do modelo (seleção a partir dos fabricantes cadastrados) |

### Passo a passo — Cadastrar modelo

1. Na listagem, clique em **+ Novo**
2. Informe a **Marca** e o **Modelo** do equipamento
3. Preencha o **Número da Portaria** e a **Portaria** completa do INMETRO
4. Selecione o **Fabricante** no campo dropdown
5. Clique em **Salvar**

:::warning Importante
A portaria INMETRO é obrigatória para a validade legal das infrações geradas pelo equipamento. Certifique-se de informar corretamente o número e a referência completa da portaria de homologação.
:::

:::tip Dica
Um mesmo fabricante pode possuir múltiplos modelos de equipamento. Cada modelo deve ser cadastrado individualmente com sua respectiva portaria INMETRO.
:::

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Equipamentos](./equipamentos) | Equipamentos deste modelo |
| Relacionado | [Fabricantes](./fabricantes) | Fabricante |
| Relacionado | [Tipos](./tipos-equipamentos) | Tipo |
