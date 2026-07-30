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

## Impacto na validade das infrações

Imagens obrigatórias ausentes podem levar à **invalidação do auto** pelo órgão julgador. Configure corretamente antes de iniciar operações.

## Relacionado

- [Equipamentos](./equipamentos)
- [Aferições](../operacoes/afericoes)
- [Processamento de Imagens](../relatorios/processamento-imagens)

## Fluxo de validação de imagens

1. Equipamento captura a passagem e gera as imagens configuradas
2. Sistema verifica se todas as imagens **Obrigatórias** foram recebidas
3. Se alguma imagem obrigatória estiver ausente → infração marcada como incompleta
4. Analista visualiza as imagens na **Triagem** e valida ou descarta
5. Órgão autuador pode rejeitar autos sem imagens obrigatórias

## Tabela de referência — tipos comuns e obrigatoriedade

| Tipo | Obrigatória | Descrição | Onde exibida |
|------|:-----------:|-----------|:------------:|
| Frontal | Sim | Vista frontal do veículo | Triagem |
| Traseira (placa) | Sim | Placa legível | Triagem e export. |
| Lateral esquerda | Não | Perfil do veículo | Triagem |
| Painel (instrumento) | Sim (radares) | Velocidade no display | Triagem e export. |
| Panorâmica | Sim | Contexto da via | Export. |

## Erros comuns

| Problema | Causa provável | Solução |
|----------|---------------|----------|
| Infração com imagem faltante | Tipo obrigatório não capturado | Verificar configuração do equipamento |
| Tipo criado mas não aparece | Tipo inativo | Reativar o tipo de imagem |
| Quantidade incorreta de fotos | Quantidade configurada errada | Editar tipo e ajustar quantidade |


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
