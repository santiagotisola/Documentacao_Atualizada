---
sidebar_position: 6
title: Marcas de Veículos
description: Cadastro de marcas de veículos para classificação nas autuações do AxHub
---

# Marcas de Veículos

Tabela de marcas de veículos utilizada na identificação nos registros de infração. A marca correta garante a qualidade dos dados exportados ao órgão autuador.

![Lista de Marcas](../img/Veículos%20-%20marcas%20de%20veículos.png)

## Como acessar

**Menu lateral** → Veículos → **Marcas de Veículos**

## Cadastro

![Cadastro de Marca](../img/Veículos%20-%20marcas%20de%20veículos%20-%20cadastro.png)

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome da marca (ex.: FIAT, VOLKSWAGEN, MERCEDES-BENZ) |
| **Código** | Não | Código do órgão autuador |
| **Status** | Sim | Ativo ou Inativo |

## Passo a passo

1. Acesse **Veículos → Marcas de Veículos**
2. Clique em **+ Nova**
3. Preencha o **Nome** e o **Código** (se aplicável)
4. Clique em **Salvar**

:::tip
As marcas são vinculadas aos **Modelos de Veículos**, formando a hierarquia Marca → Modelo usada nas infrações.
:::

## Marcas comuns em infrações de trânsito

| Marca | Segmento |
|-------|----------|
| FIAT | Passeio e leve |
| VOLKSWAGEN | Passeio e comercial |
| CHEVROLET | Passeio |
| HONDA | Motos e passeio |
| YAMAHA | Motos |

## Relacionado

- [Modelos de Veículos](./modelos-veiculos)
- [Tipos de Veículos](./tipos-veiculos)
- [Classificações de Veículos](./classificacoes-veiculos)

|-------|----------|
| FIAT | Passeio e leve |
| VOLKSWAGEN | Passeio e comercial |
| CHEVROLET | Passeio |
| HONDA | Motos e passeio |
| YAMAHA | Motos |

:::

## Passo a passo

1. Acesse **Veículos → Marcas de Veículos**
2. Clique em **+ Novo**
3. Informe o **Nome** da marca
4. Clique em **Salvar**

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Relacionado | [Modelos](./modelos-veiculos) | Modelos por marca |
| Relacionado | [Categorias](./categorias-veiculo) | Categorias de veículo |


| Campo | Descrição |
|-------|-----------|
| **Código** | Código identificador |
| **Descrição** | Nome da marca (ex: Volkswagen, Fiat, Toyota) |
| **Ativo** | Status do registro |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Modelos de Veiculos](./modelos-veiculos) | Modelos da marca |

## Boas práticas

- Use a grafia oficial do fabricante (ex.: MERCEDES-BENZ, VOLKSWAGEN) para compatibilidade com o arquivo DENATRAN
- Pesquise a marca existente antes de criar — duplicidades (ex.: VW e VOLKSWAGEN) prejudicam a identificação nos relatórios
- Mantenha marcas descontinuadas como **Inativas** em vez de excluí-las, preservando o histórico de infrações
- O **Código DENATRAN** é exigido em alguns layouts de exportação; confirme com o órgão autuador se é obrigatório no contrato

## Erros comuns

| Erro | Causa | Solução |
|------|-------|---------|
| Marca duplicada na lista | Cadastrada com grafias diferentes (ex.: VW e VOLKSWAGEN) | Inativar a duplicata e padronizar pelo nome oficial |
| Marca não aparece nas infrações | Status inativo | Reativar o cadastro |
| Campo marca vazio no auto exportado | Consulta RENAVAM falhou | Verificar a integração RENAVAM e preencher manualmente |

## Perguntas frequentes

**A marca do veículo é preenchida automaticamente?**
Sim, quando a consulta RENAVAM retorna a marca cadastrada no CRV. Se a marca não estiver na tabela do sistema, o campo ficará em branco.

**Encontrei marcas duplicadas com grafias diferentes. O que fazer?**
Inative a grafia não oficial e padronize pela grafia do fabricante (ex.: VOLKSWAGEN em vez de VW). Reassocie os modelos à marca mantida.

**O Código DENATRAN da marca é obrigatório?**
Depende do layout de exportação exigido pelo órgão autuador. Confirme no contrato ou com o suporte técnico antes de deixar o campo em branco.

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Modelos de Veículos](./modelos-veiculos)** | Cada modelo deve ser vinculado a uma marca; a hierarquia Marca → Modelo garante a identificação completa do veículo |
| **[Consulta de Placas](../operacoes/consulta-placas)** | A marca é populada automaticamente via consulta RENAVAM; o cadastro deve estar atualizado para evitar campos em branco |
| **[Infrações — Triagem](../infracoes/triagem)** | A marca do veículo compõe os dados do auto e pode ser corrigida manualmente durante a triagem |
| **[Exportação de Infrações](../infracoes/exportacao)** | O Código DENATRAN da marca é exigido em alguns layouts de exportação — confirme o requisito do órgão autuador |
