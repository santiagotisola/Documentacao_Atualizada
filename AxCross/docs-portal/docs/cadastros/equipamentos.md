---
sidebar_position: 2
title: Equipamentos
description: Cadastro de equipamentos no AxCross
---

# Equipamentos

Cadastro e gestão dos equipamentos de fiscalização instalados nos cruzamentos monitorados.

## Como acessar

No **menu lateral**, expanda **Cadastros** e clique em **Equipamentos**.

![Lista de Equipamentos](../img/Equipamentos.png)

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome identificador do equipamento |
| **Tipo** | Sim | Câmera, Detector, Sensor, Radar |
| **Modelo** | Sim | Modelo do equipamento |
| **Fabricante** | Sim | Fabricante do equipamento |
| **Número de Série** | Sim | Número de série do equipamento |
| **Local** | Sim | Cruzamento onde está instalado |
| **IP** | Não | Endereço IP para comunicação |
| **Status** | Sim | Online, Offline, Manutenção |

## Passo a passo — Cadastrar novo equipamento

![Novo Equipamento](../img/Equipamentos.- novo.png)

1. Acesse **Cadastros → Equipamentos** no menu lateral
2. Clique em **Novo Equipamento**
3. Preencha **Nome**, **Tipo**, **Modelo** e **Fabricante**
4. Informe o **Número de Série**
5. Selecione o **Local** (cruzamento) de instalação
6. Opcionalmente, informe o **IP** do equipamento
7. Clique em **Salvar**

![Editar Equipamento](../img/Equipamento - Editar.png)

![Botões de Ação - Equipamentos](../img/botoes Equipamentos.png)

:::warning Atenção
Equipamentos vinculados a operações ativas não podem ser desativados.
:::

## Importação em lote

![Importação de Equipamentos](../img/Importação de Equipamentos.png)

![Importação de Equipamentos - Selecionar Arquivo](../img/Importação de Equipamentos - importar.png)

1. Acesse **Cadastros → Equipamentos** no menu lateral
2. Clique em **Importar**
3. Selecione o arquivo CSV com os dados dos equipamentos
4. Confirme a importação
