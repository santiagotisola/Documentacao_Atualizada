---
sidebar_position: 2
title: Aferições
description: Controle de aferições e certificados INMETRO dos equipamentos no AxHub
---

# Aferições

Controle das **aferições metrológicas** realizadas nos equipamentos de fiscalização. A aferição válida é requisito legal para que as infrações tenham valor jurídico.

## Como acessar

**Menu lateral** → Operações → **Aferições**

![Lista de Aferições](../img/Operações%20-%20aferição.png)

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Equipamento** | Sim | Equipamento aferição realizada |
| **Tipo de Aferição** | Sim | Inicial, Periódica ou Extraordinária |
| **Data de Emissão** | Sim | Data do certificado INMETRO |
| **Data de Vencimento** | Sim | Data limite de validade |
| **Nº Certificado** | Sim | Número do certificado INMETRO |
| **Observações** | Não | Informações adicionais |

## Passo a passo — Registrar aferição

1. Acesse **Operações → Aferições**
2. Clique em **+ Nova Aferição**
3. Selecione o **Equipamento**
4. Informe o **Tipo** e as datas
5. Digite o **Nº do Certificado**
6. Clique em **Salvar**

:::warning Alerta de vencimento
O Dashboard exibe alertas quando a aferição está próxima do vencimento (30 dias). Após o vencimento, o equipamento é bloqueado automaticamente.
:::

## Navegação Relacionada

| Tipo | Página |
|------|--------|
| Glossario | [Aferição](../glossario/afericao) |
| Relacionado | [Tipos de Aferições](../administracao/tipos-afericoes) |


## Cadastro de Afericao

![Cadastro de Afericao](../img/Operações%20-%20aferição%20-%20cadastro.png)

## Campos

| Campo | Descricao |
|-------|-----------|
| Equipamento | código e serie do Equipamento |
| N Certificado | número do certificado INMETRO |
| Data Emissao | Data de emissao do certificado |
| Data Vencimento | Data de vencimento do certificado |
| Status | válido ou Vencendo ou Vencido |

:::warning Validade da Aferição
Infrações geradas com aferição vencida podem ser juridicamente questionáveis.  
Mantenha o controle de vencimentos atualizado e agende renovações com 60 dias de antecedência.
:::

:::info Dados na Tarja
As informações de aferição aparecem nas **tarjas das Infrações
- **Data de Aferição** (Data Emissão)
- **Data de Vencimento**
- **Número do Certificado INMETRO**

Para entender como esses dados são exibidos e como mantê-los atualizados, consulte:  
👉 Configuração de Dados da Tarja](../administracao/configuracao-dados-tarja#data-da-afericao)**
:::

## Relacionado

- [Equipamentos](../cadastros-basicos/equipamentos)
- [Tipos de Aferições](../administracao/tipos-afericoes)
- [Aferição](../glossario/afericao)
- [Configuração de Dados da Tarja](../administracao/configuracao-dados-tarja)

## Boas práticas

- Registre a aferição imediatamente ao receber o certificado INMETRO — não aguarde a proximidade do vencimento
- Agende a renovação com pelo menos 30 dias de antecedência para evitar interrupções operacionais
- Mantenha cópia digital do certificado no sistema vinculada ao registro para facilitar auditorias
- Verifique o Dashboard diariamente para acompanhar alertas de aferições próximas do vencimento

## Navegacao relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Equipamentos](../cadastros-basicos/equipamentos) | Equipamento aferido |
| Relacionado | [Cadastro de Operacoes](./cadastro-operacoes) | Operacoes vinculadas |
| Guia | Configuração de Dados da Tarja](../administracao/configuracao-dados-tarja) | Como os dados aparecem na tarja |
