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

## Boas práticas

- Informe sempre **latitude e longitude** para que o cruzamento apareça corretamente no Mapa de Equipamentos do Dashboard
- Use o nome oficial do cruzamento (ex.: Av. Brasil c/ Rua XV) para facilitar a busca em relatórios e alertas
- Vincule os equipamentos ao local imediatamente após o cadastro — locais sem equipamento não capturam passagens
- Mantenha locais inativos como **Inativos** em vez de excluir para preservar o histórico de passagens associadas

## Erros comuns

| Erro | Causa | Solução |
|------|-------|---------|
| Local não aparece no mapa | Sem coordenadas | Informar lat/lon |
| Faixa não aparece no local | Faixa não vinculada | Criar faixa e vincular |
| Passagens no local errado | Equipamento vinculado errado | Verificar vínculo faixa-equip. |

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

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Local não aparece no mapa do Dashboard | Coordenadas geográficas não preenchidas | Editar o local e informar latitude/longitude pelo Google Maps |
| Filtro por local sem resultados | Local inativo ou código incorreto | Verificar status do local e o código no cadastro |
| Equipamentos não vinculados ao local | Equipamento cadastrado com local diferente | Editar o equipamento e corrigir o local de instalação |

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Equipamentos](./equipamentos)** | Cada equipamento é instalado em um local; o local deve estar cadastrado antes do equipamento |
| **[Faixas](./faixas)** | As faixas pertencem a um local e herdam suas informações de localização |
| **[Monitoramento Online](../operacoes/monitoramento-online)** | O status em tempo real dos equipamentos é exibido por local no mapa de monitoramento |

## Perguntas frequentes

**O que acontece se eu não informar as coordenadas geográficas de um local?**
O cruzamento não aparecerá no mapa do Dashboard nem nos relatórios visuais. As passagens e alertas gerados pelo local ainda serão registrados normalmente, mas sem posicionamento no mapa. Preencha a latitude e longitude pelo Google Maps para corrigir.

**Posso vincular múltiplos equipamentos ao mesmo local?**
Sim. Um local pode ter vários equipamentos instalados (ex.: câmeras em diferentes direções do mesmo cruzamento). Cada equipamento deve ser cadastrado individualmente e vinculado ao local correspondente.

**Como inativo um local que não está mais em operação sem perder o histórico?**
Edite o cadastro do local e altere o **Status** para **Inativo**. O histórico de passagens, alertas e infrações vinculados ao local é preservado integralmente e continua acessível nos relatórios. Não exclua o local para não perder esse histórico.
