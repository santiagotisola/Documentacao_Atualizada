---
sidebar_position: 3
title: Modelos de Veículos
description: Cadastro de modelos de Veículos
---

# Modelos de Veículos

![Classificação — Novo](../img/Classificacao%20-%20novo.png)

Cadastro de modelos de Veículos Estes dados são utilizados automaticamente nas operações de pesagem e triagem de Infrações

## Como acessar

**Menu lateral** → Veículos → **Modelos de Veículos

## Listagem

A tela exibe todos os registros cadastrados, com opção de pesquisa e filtro.

### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Nome** | Nome do modelo |
| **Marca** | Fabricante do veículo |
| **Status** | Ativo ou Inativo |

## Passo a passo

1. Acesse **Veículos → Modelos de Veículos**
2. Clique em **+ Novo**
3. Preencha o **Nome** e selecione a **Marca**
4. Clique em **Salvar**

:::tip
Verifique se o modelo já existe antes de criar. Duplicidades dificultam a classificação nos tickets de pesagem.
:::

## Modelos mais comuns por marca

| Marca | Modelos comuns |
|-------|----------------|
| MERCEDES-BENZ | Actros, Atego, Axor |
| SCANIA | R-Series, G-Series, P-Series |
| VOLVO | FH, FM, FMX |
| IVECO | Daily, Eurocargo, Stralis |

## Quando atualizar

- Ao identificar um modelo não cadastrado durante a triagem
- Após laçamento de nova linha por fabricante já cadastrado

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Modelo duplicado | Cadastrado 2x | Inativar duplicata |
| Ticket sem modelo | Identificação falhou | Verificar OCR e base |

## Relacionado

- [Marcas de Veículos](./marcas-veiculos)
- [Classificações de Veículos](./classificacoes-veiculos)

## Modelos comuns de veículos de carga

| Marca | Modelo |
|-------|--------|
| MERCEDES-BENZ | Actros, Atego, Axor |
| SCANIA | R-Series, G-Series, P-Series |
| VOLVO | FH, FM, FMX |
| IVECO | Daily, Eurocargo, Stralis |


1. Acesse **Veículos → Modelos de Veículos**
2. Clique em **+ Novo**
3. Preencha o **Nome** e selecione a **Marca**
4. Clique em **Salvar**


| Coluna | Descrição |
|--------|-----------|
| **Código** | Identificador único |
| **Descrição** | Nome/descrição do registro |
| **Ativo** | Status (Ativo/Inativo) |

### Passo a passo — Cadastrar

1. Acesse Veículos → **Modelos de Veículos
2. Clique em **+ Novo**
3. Preencha o Código e a Descrição
5. Clique em **Salvar**

## Boas práticas

- Pesquise o modelo existente antes de criar — duplicidades geram ambiguidade na classificação dos tickets de pesagem
- Vincule o modelo à **Marca** correta; modelos sem marca ficam inacessíveis nos filtros de relatório
- Para veículos de carga pesada, use a nomenclatura oficial do fabricante (ex.: Actros, Stralis, FH) para compatibilidade com o RENAVAM
- Não exclua modelos já vinculados a infrações — inative-os para preservar o histórico das operações

## Perguntas frequentes

**O que fazer quando um modelo não está cadastrado e aparece durante a triagem de uma pesagem?**
Cadastre o modelo acessando **Veículos → Modelos de Veículos → + Novo**, vinculando-o à marca correta. Em seguida, retorne à triagem e atualize o registro com o modelo recém-cadastrado.

**Posso excluir modelos que já foram vinculados a infrações exportadas?**
Não. Excluir um modelo com infrações associadas compromete o histórico. Inative o registro — ele deixa de aparecer nas seleções ativas mas permanece nos registros históricos.

**É necessário cadastrar todos os modelos manualmente ou o sistema importa de alguma base?**
O cadastro é manual. Os dados de modelo são retornados pela consulta RENAVAM durante a pesagem, mas precisam estar pré-cadastrados no sistema para serem associados corretamente ao ticket. Cadastre os modelos mais comuns na implantação inicial.

## Integração com outros módulos

| Módulo | Como se relaciona com Modelos de Veículos |
|--------|--------------------------------------------|
| **Veículos → Marcas** | Cada modelo deve ser vinculado a uma marca — sem marca, o modelo fica inacessível nos filtros |
| **Pesagem → Iniciar Pesagem** | O modelo é identificado via consulta RENAVAM durante a pesagem e associado ao ticket |
| **Relatório de Passagens** | O modelo do veículo aparece nos registros do relatório para identificação |
| **Exportação de Infrações** | Alguns layouts de exportação exigem o modelo do veículo no arquivo enviado ao órgão autuador |

## Exemplo prático

**Cenário**: Durante a triagem, o operador percebe que todos os caminhões da marca **VOLVO** estão sem modelo no ticket. A consulta RENAVAM retorna "FH" mas o modelo não está cadastrado no sistema.

**Configuração**:

1. Acesse **Veículos → Modelos de Veículos** e clique em **+ Novo**
2. Cadastre os modelos VOLVO mais comuns no porto:
   - `FH` — vinculado à marca VOLVO
   - `FM` — vinculado à marca VOLVO
   - `FMX` — vinculado à marca VOLVO
3. Clique em **Salvar** para cada modelo
4. Retorne à triagem e atualize os tickets pendentes com o modelo correto

**Resultado**: Nas próximas pesagens de caminhões VOLVO, o modelo é associado automaticamente via RENAVAM. O relatório de passagens passa a exibir a identificação completa do veículo (Marca + Modelo), melhorando a rastreabilidade.