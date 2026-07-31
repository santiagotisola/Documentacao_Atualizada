---
sidebar_position: 2
title: Marcas de Veículos
description: Cadastro de marcas de veículos para classificação nas operações do AxTon
---

# Marcas de Veículos

Cadastro de **marcas e fabricantes** de veículos utilizados na identificação e classificação nas operações de pesagem e triagem de infrações.

## Como acessar

**Menu lateral** → Veículos → **Marcas de Veículos**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome da marca (ex.: MERCEDES-BENZ, SCANIA, VOLVO) |
| **Código DENATRAN** | Não | Código oficial do fabricante |
| **Status** | Sim | Ativo ou Inativo |

## Passo a passo

1. Acesse **Veículos → Marcas de Veículos**
2. Clique em **+ Nova**
3. Informe o **Nome** e o **Código DENATRAN** (se aplicável)
4. Clique em **Salvar**

:::info
As marcas são vinculadas aos **Modelos de Veículos**, formando a hierarquia Marca → Modelo → Classificação usada nos tickets de pesagem.
:::

## Marcas comuns no transporte de carga

| Marca | Segmento | Origem |
|-------|----------|--------|
| MERCEDES-BENZ | Caminhões e ônibus | Alemã |
| SCANIA | Caminhões pesados | Sueca |
| VOLVO | Caminhões e ônibus | Sueca |
| IVECO | Caminhões leves e médios | Italiana |
| DAF | Caminhões pesados | Holandesa |

## Relacionado

- [Modelos de Veículos](./modelos-veiculos)
- [Classificações de Veículos](./classificacoes-veiculos)
- [Tipos de Veículos](./tipos-veiculos)


| Marca | Segmento |
|-------|----------|
| MERCEDES-BENZ | Caminhões e ônibus |
| SCANIA | Caminhões pesados |
| VOLVO | Caminhões e ônibus |
| IVECO | Caminhões leves e médios |
| DAF | Caminhões pesados |
## Passo a passo

1. Acesse **Veículos → Marcas de Veículos**
2. Clique em **+ Novo**
3. Informe o **Nome** da marca
4. Clique em **Salvar**

## Boas práticas

- Use a grafia oficial do fabricante (ex.: MERCEDES-BENZ, SCANIA, VOLVO) para garantir compatibilidade com o RENAVAM e os arquivos SENATRAN
- Antes de criar, pesquise se a marca já existe com nome alternativo — duplicidades prejudicam a classificação nos tickets de pesagem
- O **Código DENATRAN** pode ser exigido em alguns layouts de exportação; confirme com o órgão autuador
- Mantenha marcas descontinuadas como **Inativas** para preservar o histórico de autos emitidos

```
Marca de Veículo → Modelo → Veículo identificado na pesagem
```


### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Código** | Identificador único |
| **Descrição** | Nome/descrição do registro |
| **Ativo** | Status (Ativo/Inativo) |

### Passo a passo — Cadastrar

1. Acesse Veículos → **Marcas de Veículos
2. Clique em **+ Novo**
3. Preencha o Código e a Descrição
4. Marque como Ativo
5. Clique em **Salvar**

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Marca duplicada (ex.: SCANIA e Scania) | Grafias diferentes no cadastro | Inativar a duplicata e padronizar em maiúsculas |
| Marca não aparece no ticket de pesagem | Marca com status inativo | Reativar o cadastro |
| Campo fabricante vazio no auto exportado | Consulta RENAVAM sem retorno para a placa | Verificar a integração RENAVAM e preencher manualmente |

## Perguntas frequentes

**Como faço para corrigir marcas duplicadas cadastradas com grafias diferentes (ex.: SCANIA e Scania)?**
Identifique qual das grafias está em conformidade com a tabela DENATRAN (geralmente em maiúsculas), inative a duplicata e, se necessário, transfira os modelos vinculados para a versão correta antes de inativar.

**O código DENATRAN da marca é obrigatório nos arquivos de exportação?**
Depende do layout exigido pelo órgão autuador. Alguns formatos de exportação, como o XTraffic, exigem o código do fabricante. Confirme com o órgão antes de gerar o primeiro lote para evitar rejeições.

**O que acontece quando a marca do veículo não é retornada na consulta do RENAVAM?**
O campo fabricante fica em branco no ticket de pesagem. O operador deve preencher manualmente durante a triagem. Se o problema for recorrente para uma placa específica, acione o suporte técnico para verificar a integração RENAVAM.

## Integração com outros módulos

| Módulo | Como se relaciona com Marcas de Veículos |
|--------|-------------------------------------------|
| **Veículos → Modelos** | Cada modelo de veículo deve ser vinculado a uma marca — marcas inativas bloqueiam os modelos associados |
| **Pesagem → Iniciar Pesagem** | A marca é identificada via consulta RENAVAM no momento da pesagem |
| **Relatório de Passagens** | A marca do veículo aparece nos registros para identificação |
| **Exportação de Infrações** | Layouts de exportação podem exigir o código DENATRAN da marca no arquivo do lote |