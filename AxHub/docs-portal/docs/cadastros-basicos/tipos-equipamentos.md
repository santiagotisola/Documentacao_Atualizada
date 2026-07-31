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

## Fluxo de configuração de tipo de equipamento

1. Criar o tipo em **Equipamentos → Tipos de Equipamentos**
2. Informar o **Nome** e, opcionalmente, enviar um **ícone** representativo
3. Clicar em **Nova Forma de Atuação** e selecionar os tipos de infração que este equipamento detecta
4. Clicar em **Salvar**
5. Ao cadastrar equipamentos, selecionar este tipo para que o sistema saiba quais enquadramentos aplicar

## Tabela de referência — tipos padrão e infrações detectadas

| Tipo | Infrações detectadas | Uso típico |
|------|---------------------|:-----------:|
| **RADAR FIXO** | Excesso de velocidade | Via urbana e rodovia |
| **RADAR MISTO** | Velocidade + avanço de sinal vermelho | Cruzamento |
| **RADAR PORTÁTIL** | Excesso de velocidade | Operação móvel |
| **LOMBADA ELETRÔNICA** | Excesso de velocidade | Área escolar/hospitalar |
| **OCR** | Placa não autorizada / monitoramento | Monitoramento de fluxo |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Equipamento não gera infrações | Forma de atuação não configurada | Adicionar formas de atuação no tipo |
| Tipo não aparece ao cadastrar equipamento | Tipo inativo | Reativar o tipo no cadastro |
| Ícone não exibido no mapa | Arquivo de imagem inválido | Enviar nova imagem em formato PNG ou SVG |
| Enquadramento errado gerado | Forma de atuação incorreta | Revisar os tipos de infração vinculados ao tipo |

## Relacionado

- [Equipamentos](./equipamentos)
- [Modelos de Equipamentos](./modelos-equipamentos)
- [Enquadramentos](../administracao/enquadramentos)

## Integração com outros módulos

| Módulo | Como usa este cadastro |
|--------|----------------------|
| **Equipamentos** | O tipo é campo obrigatório; define quais enquadramentos podem ser aplicados pelo equipamento |
| **Operações** | O sistema valida se a forma de atuação da operação é compatível com o tipo do equipamento |
| **Dashboard/Mapa** | O ícone configurado no tipo é exibido no mapa para cada equipamento |
| **Monitoramento Online** | Permite filtrar equipamentos por tipo para monitorar radares fixos, móveis ou OCR separadamente |

## Perguntas frequentes

**Por que um equipamento não gera infrações mesmo estando online?**
Verifique se o tipo do equipamento tem **Formas de Atuação** configuradas. Sem esse vínculo, o sistema não sabe quais enquadramentos aplicar.

**Posso desabilitar o monitoramento só para um tipo específico?**
Sim. Marque **Desabilitar Monitoramento** no cadastro do tipo. Todos os equipamentos desse tipo pararão de aparecer no painel de status em tempo real.

**É possível usar um ícone personalizado para o tipo?**
Sim. Faça upload de uma imagem PNG ou SVG no campo **Selecione ícone** no cadastro do tipo. O ícone será exibido no mapa do Dashboard para todos os equipamentos desse tipo.
