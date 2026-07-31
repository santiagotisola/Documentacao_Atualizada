---
sidebar_position: 3
title: Modelos de Equipamentos
description: Cadastro dos modelos de Equipamentos e portarias INMETRO
---

# Modelos de Equipamentos

O cadastro de modelos de Equipamentos registra os modelos específicos de hardware com suas respectivas portarias INMETRO de homologação.

## Como acessar

**Menu lateral** → Equipamentos → **Modelos de Equipamentos

## Listagem

![Tela de Modelos de Equipamentos - Lista](../img/Modelos%20de%20Equipamentos%20-%20Lista.png)

### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Marca** | Marca comercial do Equipamento (ex: VELSIS, FOCALLE, PERKONS) |
| **Modelo** | Modelo específico (ex: F-DIP, VSIS-OCR, SmartPlu PRO) |
| **Número Portaria** | Número da portaria INMETRO de homologação |
| **Portaria** | Referência completa da portaria (ex: PORTARIA INMETRO/DIMEL Nº 245/2022) |
| **Fabricante** | Fabricante vinculado a este modelo |
| **Ações** | Botões de editar e excluir |

## Cadastro

![Tela de Modelos de Equipamentos - Cadastro](../img/Modelos%20de%20Equipamentos%20-%20Cadastro.png)

### Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Marca** | Sim | Marca comercial do Equipamento |
| **Modelo** | Sim | Nome/código do modelo |
| **Número da Portaria** | Sim | Número da portaria INMETRO que homologa este modelo |
| **Portaria** | Sim | Referência completa da portaria (ex: "PORTARIA INMETRO/DIMEL Nº 245/2022") |
| **Fabricante** | Sim | Fabricante do modelo (seleção a partir dos fabricantes cadastrados) |

### Passo a passo — Cadastrar modelo

1. Na listagem, clique em **+ Novo**
2. Informe a **Marca** e o **Modelo** do Equipamento
3. Preencha o **Número da Portaria** e a **Portaria** completa do INMETRO
4. Selecione o **Fabricante** no campo dropdown
5. Clique em **Salvar**

:::warning Importante
A portaria INMETRO é obrigatória para a validade legal das Infrações geradas pelo Equipamento Certifique-se de informar corretamente o número e a referência completa da portaria de homologação.

está informação aparece nas **tarjas das Infrações geradas por Equipamentos deste modelo.
:::

:::tip Como aparece na tarja
A portaria cadastrada aqui aparece automaticamente na tarja impressa nas Infrações  
Para entender como alterar ou corrigir a portaria que aparece na tarja, consulte:

👉 Configuração de Dados da Tarja](../administracao/configuracao-dados-tarja#portaria-do-equipamento)**
:::

:::tip Dica
Um mesmo fabricante pode possuir múltiplos modelos de Equipamento Cada modelo deve ser cadastrado individualmente com sua respectiva portaria INMETRO.
:::

---

## Fluxo de cadastro de modelo

1. Consultar a portaria INMETRO vigente no site do INMETRO (inmetro.gov.br)
2. Cadastrar o modelo em **Equipamentos → Modelos de Equipamentos**
3. Preencher **Marca**, **Modelo**, **Número da Portaria** e a referência completa
4. Vincular ao **Fabricante** correspondente
5. Clicar em **Salvar** e verificar se a portaria aparece corretamente nas tarjas dos equipamentos deste modelo

## Tabela de referência — campos e impacto

| Campo | Onde aparece | Impacto se incorreto |
|-------|:------------:|----------------------|
| **Número da Portaria** | Tarja da infração | Lavratura inválida — auto rejeitado pelo órgão |
| **Portaria** (referência completa) | Tarja e exportação | Texto incompleto na tarja impressa |
| **Fabricante** | Relatórios e API | Equipamentos não autenticam corretamente |
| **Marca** | Tarja da infração | Campo "Marca/Modelo" em branco na tarja |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Portaria não aparece na tarja | Campo "Número da Portaria" em branco | Editar modelo e preencher o campo |
| Modelo não listado ao cadastrar equipamento | Fabricante incorreto | Verificar e corrigir o fabricante vinculado |
| Número de portaria desatualizado | Portaria renovada pelo INMETRO | Atualizar com número e referência da nova portaria |
| Erro ao salvar modelo | Fabricante não cadastrado | Cadastrar o fabricante antes do modelo |

## Relacionado

- [Equipamentos](./equipamentos)
- [Fabricantes](./fabricantes)
- [Tipos de Equipamentos](./tipos-equipamentos)
- [Tarjas](../administracao/tarjas)

## Integração com outros módulos

| Módulo | Como usa este cadastro |
|--------|----------------------|
| **Equipamentos** | O modelo é campo obrigatório; define a portaria INMETRO exibida na tarja da infração |
| **Tarjas** | A portaria e a marca/modelo exibidos na tarja vêm diretamente deste cadastro |
| **Fabricantes** | O modelo precisa estar vinculado a um fabricante para aparecer como opção no cadastro |
| **Auditoria** | O modelo aparece nos registros para rastreabilidade do hardware usado em cada infração |

## Perguntas frequentes

**A portaria no modelo e a portaria na tarja estão diferentes. Qual prevalece?**
A tarja usa a portaria cadastrada no Modelo de Equipamento. Se a tarja está incorreta, corrija o campo **Portaria** no cadastro do modelo; a correção vale para novas infrações.

**Posso cadastrar o mesmo modelo para fabricantes diferentes?**
Não recomendado. Cada modelo deve estar vinculado ao fabricante correto. Modelos iguais de fabricantes diferentes devem ter cadastros distintos.

**O que fazer quando o INMETRO renova a portaria de um modelo?**
Atualize os campos Portaria e Número da Portaria no cadastro do modelo. A partir da atualização, as novas infrações passarão a exibir a portaria vigente na tarja.

## Exemplo prático

**Cadastrando um novo modelo de radar com portaria INMETRO:**

1. Consultar a portaria vigente no site inmetro.gov.br
2. Acessar **Equipamentos → Modelos de Equipamentos** e clicar em **+ Novo**
3. Preencher:

| Campo | Exemplo |
|-------|---------|
| **Marca** | VELSIS |
| **Modelo** | VSIS-OCR PRO |
| **Número da Portaria** | 245/2022 |
| **Portaria** | PORTARIA INMETRO/DIMEL Nº 245/2022 |
| **Fabricante** | VELSIS Sistemas |

4. Salvar e verificar nas tarjas de infrações se a portaria aparece corretamente

:::tip
Solicite ao fabricante o número exato da portaria INMETRO antes de cadastrar — portaria incorreta invalida os autos gerados.
:::
