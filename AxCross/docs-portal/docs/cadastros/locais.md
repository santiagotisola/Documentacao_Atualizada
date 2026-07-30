---
sidebar_position: 1
title: Locais
description: Cadastro de locais (cruzamentos) monitorados no AxCross
---

# Locais

Cadastro dos cruzamentos e pontos monitorados pelo sistema AxCross. Todo equipamento precisa estar vinculado a um local para que passagens sejam registradas corretamente.

## Como acessar

No **menu lateral**, expanda **Cadastros** e clique em **Locais**.

![Lista de Áreas/Locais](<../img/Áreas.png>)

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome identificador do local (ex: "Av. Getúlio Vargas x R. Boa Vista") |
| **Endereço** | Sim | Endereço completo do cruzamento |
| **Latitude** | Não | Coordenada geográfica — necessária para o mapa |
| **Longitude** | Não | Coordenada geográfica — necessária para o mapa |
| **Município** | Sim | Município onde o local está situado |
| **UF** | Sim | Unidade Federativa |
| **Status** | Sim | Ativo ou Inativo |

## Passo a passo — Cadastrar novo local

1. Acesse **Cadastros → Locais** no menu lateral
2. Clique em **Novo Local**
3. Informe o **Nome** e **Endereço** completo
4. Informe o **Município** e **UF**
5. Opcionalmente informe **Latitude** e **Longitude** para posicionamento no mapa
6. Clique em **Salvar**

:::tip Coordenadas geográficas
Sempre informe latitude e longitude para que o cruzamento apareça corretamente no **Mapa de Equipamentos** do Dashboard.
:::

## Relacionado

- [Faixas](./faixas)
- [Equipamentos](./equipamentos)
- [Grupos de Equipamentos](./grupos-equipamentos)


## Hierárquia de cadastros

```
Local (cruzamento)
  └── Equipamentos cadastrados no local
        └── Faixas configuradas por equipamento
```

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Relacionado | [Equipamentos](./equipamentos) | Equipamentos do local |
| Relacionado | [Faixas](./faixas) | Faixas por equipamento |


![Novo Local/Área](<../img/Áreas novo.png>)

1. Acesse **Cadastros → Locais** no menu lateral
2. Clique em **Novo Local**
3. Preencha o **Nome** e **Endereço**
4. Informe **Município** e **UF**
5. Opcionalmente, informe **Latitude** e **Longitude** para geolocalização
6. Clique em **Salvar**

![Nome da Área](<../img/Área - nome da areas.png>)

:::tip Dica
Com as coordenadas geográficas preenchidas, o local será exibido no mapa do monitoramento online.
:::
