---
sidebar_position: 15
title: Tipos de Imagens
description: Cadastro dos tipos de imagens capturadas pelos equipamentos no AxHub
---

# Tipos de Imagens

Define as **categorias de imagens** que os equipamentos devem capturar em cada infração. Configura quais imagens são obrigatórias para validação da autuação.

## Como acessar

**Menu lateral** → Configurações → **Tipos de Imagens**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Código** | Sim | Código identificador |
| **Descrição** | Sim | Tipo da imagem |
| **Obrigatória** | Sim | Se a imagem é exigida para a infração |
| **Ordem** | Não | Ordem de exibição |

## Tipos comuns

| Tipo | Obrigatória | Descrição |
|------|:-----------:|-----------|
| Frontal | Sim | Vista frontal do veículo |
| Traseira | Sim | Vista traseira com placa |
| Lateral esquerda | Não | Perfil do veículo |
| Painel | Não | Instrumento de aferíção |

## Passo a passo

1. Acesse **Configurações → Tipos de Imagens**
2. Clique em **+ Novo**
3. Preencha o **Código** e a **Descrição**
4. Marque se a imagem é **Obrigatória**
5. Clique em **Salvar**

:::info
Os tipos de imagens obrigatórios devem estar cadastrados antes de configurar os equipamentos. Equipamentos sem todos os tipos obrigatórios terão infrações incompletas.
:::

## Relacionado

- [Equipamentos](./equipamentos)
- [Aferições](../operacoes/afericoes)
- [Processamento de Imagens](../relatorios/processamento-imagens)


## Tipos comuns

| Tipo | Descrição | Obrigatória? |
|------|-----------|--------------|
| **Panorâmica** | Visão geral da via | Sim |
| **Zoom Placa** | Destaque da placa traseira | Sim |
| **Contexto** | Imagem com sinal/equipamento visível | Sim |
| **Perfil** | Lateral do veículo | Não |

:::caution
Infrações sem as imagens obrigatórias são automaticamente descartadas na triagem.
:::


:::note Sem screenshot
está tela ainda não possui screenshot cadastrada. Será adicionada em breve.
:::

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Triagem](../infracoes/triagem) | Tipos de imagem na triagem |
| Relacionado | [Equipamentos](../cadastros-basicos/Equipamentos) | Imagens por Equipamento |
