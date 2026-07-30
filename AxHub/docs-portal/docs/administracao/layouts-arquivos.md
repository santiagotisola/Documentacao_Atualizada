---
sidebar_position: 8
title: Layouts de Arquivos
description: Configuração dos layouts de importação e exportação de dados no AxHub
---

# Layouts de Arquivos

Define o **formato dos arquivos** utilizados para importação de dados e exportação de infrações para órgãos externos (DETRAN, SENATRAN, Prefeituras).

## Como acessar

**Menu lateral** → Configurações → **Layouts de Arquivos**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Identificação do layout |
| **Tipo** | Sim | Importação ou Exportação |
| **Formato** | Sim | CSV, TXT, XML, JSON |
| **Separador** | Cond. | Separador de campos (CSV) |
| **Campos** | Sim | Mapeamento de colunas/campos |

## Tipos de layout

| Tipo | Descrição |
|------|-----------|
| **Exportação DETRAN** | Formato para envio ao DETRAN estadual |
| **Exportação SENATRAN** | Formato federal para notificação |
| **Importação RENAVAM** | Dados do veículo da consulta RENAVAM |

## Passo a passo

1. Acesse **Configurações → Layouts de Arquivos**
2. Clique em **+ Novo**
3. Selecione o **Tipo** (Importação ou Exportação)
4. Defina o **Formato** e o **Separador**
5. Configure o **Mapeamento de campos**
6. Clique em **Salvar**

:::warning
Alterações em layouts de exportação ativos podem causar rejeição de lotes pelo órgão autuador. Testar antes em ambiente de homologação.
:::

## Relacionado

- [Lotes de Exportação](../glossario/lote-exportacao)
- [Sequenciais de Infrações](./sequenciais-infracoes)
- [Sequenciais de Lote](./sequenciais-lote-exportacao)

| **Importação veículos** | Carga de dados de veículos |
| **Importação placas** | Lista de placas para equipamentos |

:::caution
O layout de exportação deve seguir rigorosamente as especificações do órgão autuador. Erros causam rejeição do lote.
:::

| **Formato** | CSV, TXT, XML |
| **Delimitador** | Caractere separador de campos |
| **Encoding** | Codificação do arquivo (UTF-8, ISO-8859-1) |

:::note Sem screenshot
está tela ainda não possui screenshot cadastrada. Será adicionada em breve.
:::

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Exportacao](../infracoes/exportacao) | Exportacao usa o layout |
| Glossario | [Lote de Exportacao](../glossario/lote-exportacao) | Definicao |
