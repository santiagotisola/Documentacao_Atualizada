---
sidebar_position: 2
title: Afericoes
description: Controle de afericoes e certificados INMETRO
---

# Afericoes

Controle das afericoes realizadas nos equipamentos de fiscalizacao. As informações de aferição são essenciais para a validade legal das infrações geradas.

## Como acessar

Menu lateral - Operacoes - Afericoes

## Listagem

![Lista de Afericoes](../img/Operações%20-%20aferição.png)

## Cadastro de Afericao

![Cadastro de Afericao](../img/Operações%20-%20aferição%20-%20cadastro.png)

## Campos

| Campo | Descricao |
|-------|-----------|
| Equipamento | Codigo e serie do equipamento |
| N Certificado | Numero do certificado INMETRO |
| Data Emissao | Data de emissao do certificado |
| Data Vencimento | Data de vencimento do certificado |
| Status | Valido ou Vencendo ou Vencido |

:::warning Validade da Aferição
Infrações geradas com aferição vencida podem ser juridicamente questionáveis.  
Mantenha o controle de vencimentos atualizado e agende renovações com 60 dias de antecedência.
:::

:::info Dados na Tarja
As informações de aferição aparecem nas **tarjas das infrações**:
- **Data de Aferição** (Data Emissão)
- **Data de Vencimento**
- **Número do Certificado INMETRO**

Para entender como esses dados são exibidos e como mantê-los atualizados, consulte:  
👉 **[Configuração de Dados da Tarja](../administracao/configuracao-dados-tarja#data-da-afericao)**
:::

## Navegacao relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Equipamentos](../cadastros-basicos/equipamentos) | Equipamento aferido |
| Relacionado | [Cadastro de Operacoes](./cadastro-operacoes) | Operacoes vinculadas |
| Guia | [Configuração de Dados da Tarja](../administracao/configuracao-dados-tarja) | Como os dados aparecem na tarja |
