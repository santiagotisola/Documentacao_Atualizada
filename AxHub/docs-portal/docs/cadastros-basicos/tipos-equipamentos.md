---
sidebar_position: 2
title: Tipos de Equipamentos
description: Cadastro dos tipos de Equipamentos de trânsito
---

# Tipos de Equipamentos

Os tipos de Equipamentos classificam as categorias de dispositivos de fiscalização de trânsito que o AxHub suporta. Para cada tipo, é possível configurar as formas de atuação (quais Infrações o tipo de Equipamento pode detectar).

## Como acessar

**Menu lateral** → Equipamentos → **Tipos de Equipamentos

## Listagem

![Tela de Tipos de Equipamentos - Lista](../img/Tipos%20de%20Equipamentos%20-%20Lista.png)

### Tipos padrão do sistema

| Tipo | Descrição |
|------|-----------|
| **LOMBADA ELETRÔNICA** | Dispositivo de fiscalização de velocidade integrado ao pavimento |
| **OCR** | Câmera de reconhecimento óptico de caracteres (leitura de placas) |
| **RADAR FIXO** | Radar de velocidade instalado em posição fixa |
| **RADAR MISTO** | Radar combinado que detecta múltiplos tipos de Infração (velocidade, avanço de sinal, etc.) |
| **RADAR PORTÁTIL** | Radar de velocidade móvel/portátil para operações temporárias |

### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Nome** | Nome do tipo de Equipamento (ordenável) |
| **Desabilitar Monitoramento** | Indica se o monitoramento em tempo real está desabilitado para este tipo |
| **Ações** | Botões de editar e excluir |

## Cadastro

![Tela de Tipos de Equipamentos - Cadastro](../img/Tipos%20de%20Equipamentos%20-%20Cadastro.png)

### Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome do tipo de Equipamento |
| **Desabilitar Monitoramento** | Não | Se marcado, Equipamentos deste tipo não aparecerão no monitoramento em tempo real |
| **Selecione ícone** | Não | Ícone visual para representar este tipo no mapa e nas listagens. Arraste um arquivo de imagem ou clique para selecionar |

### Forma de Atuação

A seção **Forma de Atuação** define quais tipos de Infração Equipamento pode detectar e como ele atua:

| Coluna | Descrição |
|--------|-----------|
| **Tipo Infração | Tipo de Infração que o Equipamento detecta (ex: velocidade, avanço de sinal) |
| **Forma Atuação** | Modo de fiscalização (ex: fixo, móvel, portátil) |
| **Ações** | Botões para editar ou remover a forma de atuação |

Para adicionar uma nova forma de atuação, clique em **Nova Forma de Atuação**.

### Passo a passo — Cadastrar tipo de Equipamento

1. Na listagem, clique em **+ Novo**
2. Informe o **Nome** do tipo
3. Opcionalmente, envie um **ícone** para representação visual
4. Clique em **Nova Forma de Atuação** para vincular os tipos de Infração que este Equipamento detecta
5. Clique em **Salvar**

:::info Formas de Atuação
A Configuração das formas de atuação é essencial para que o sistema saiba quais enquadramentos legais (artigos do CTB) podem ser aplicados por cada tipo de Equipamento Sem está Configuração Equipamento não gerará Infrações automaticamente.
:::

## Termos Tecnicos

| Termo | Definicao |
|-------|-----------|
| [Enquadramento](../glossario/enquadramento) | Ver definicao no glossario |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Equipamentos](./equipamentos) | Equipamentos deste tipo |
| Relacionado | [Modelos](./modelos-equipamentos) | Modelos deste tipo |
