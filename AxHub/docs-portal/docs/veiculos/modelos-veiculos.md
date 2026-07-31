---
sidebar_position: 7
title: Modelos de Veículos
description: Cadastro de modelos de veículos por marca para classificação no AxHub
---

# Modelos de Veículos

Cadastro dos **modelos de veículos vinculados às marcas**. O modelo correto garante precisão na identificação do veículo nos registros de infração.

![Lista de Modelos](../img/Veículos%20-%20marcas-modelos%20de%20veiculos.png)

## Como acessar

**Menu lateral** → Veículos → **Modelos de Veículos**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome do modelo (ex.: Gol, Uno, Strada) |
| **Marca** | Sim | Marca vinculada |
| **Status** | Sim | Ativo ou Inativo |

## Passo a passo

1. Acesse **Veículos → Modelos de Veículos**
2. Clique em **+ Novo**
3. Preencha o **Nome** e selecione a **Marca**
4. Clique em **Salvar**

:::tip
Use a barra de busca para localizar um modelo existente antes de cadastrar um novo. Evita duplicidades na base de classificação.
:::

## Relacionado

- [Marcas de Veículos](./marcas-veiculos)
- [Classificações de Veículos](./classificacoes-veiculos)

## Modelos comuns por segmento

| Marca | Modelos comuns |
|-------|----------------|
| FIAT | Uno, Strada, Toro |
| VOLKSWAGEN | Gol, Amarok, Delivery |
| FORD | Ka, Ranger, Cargo |

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Modelo duplicado | Cadastrado 2x | Inativar duplicata |
| Modelo sem marca | Criação sem vínculo | Selecionar marca corretamente |
| Modelo desatualizado | Versão antiga no banco | Inativar e cadastrar versão atual |

## Relacionado

- [Marcas de Veículos](./marcas-veiculos)
- [Classificações de Veículos](./classificacoes-veiculos)
- [Tipos de Veículos](./tipos-veiculos)


1. Acesse **Veículos → Modelos de Veículos**
2. Clique em **+ Novo**
3. Informe o **Nome** e selecione a **Marca**
4. Clique em **Salvar**

## Hierarquia

```
Marca (ex.: FIAT)
  └── Modelo (ex.: Strada)
        └── Veículo identificado na infração
```


## Cadastro

![Cadastro de Modelo](../img/Veículos%20-%20marcas-modelos%20de%20veiculos%20-%20cadastro.png)

| Campo | Descrição |
|-------|-----------|
| **Marca** | Marca vinculada |
| **Código** | Código do modelo |
| **Descrição** | Nome do modelo (ex: Gol, Uno, Corolla) |
| **Ativo** | Status do registro |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Marcas de Veiculos](./marcas-veiculos) | Marca do modelo |

## Boas práticas

- Antes de cadastrar, pesquise se o modelo já existe vinculado à marca — duplicidades geram ambiguidade na identificação
- Vincule sempre o modelo à **Marca** correta do fabricante; um modelo sem marca impede a correta classificação do veículo
- Modelos já associados a infrações exportadas não devem ser renomeados — pode causar inconsistência nos registros históricos
- Para veículos de fabricantes internacionais pouco comuns, use a descrição oficial do RENAVAM para manter padronização

## Perguntas frequentes

**Posso cadastrar o mesmo modelo para marcas diferentes?**
Sim, desde que sejam vinculados à marca correta de cada um. Evite criar modelos genéricos sem vínculo de marca.

**O que fazer quando o modelo não aparece na consulta RENAVAM?**
Cadastre o modelo manualmente com a descrição do CRV do veículo, associando-o à marca correspondente.

**Posso renomear um modelo já vinculado a infrações exportadas?**
Não recomendado. Crie um novo modelo com o nome correto e inative o antigo para preservar a integridade dos registros históricos.

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Marcas de Veículos](./marcas-veiculos)** | Todo modelo deve estar vinculado a uma marca; sem a marca correta o modelo não é listado corretamente nas infrações |
| **[Consulta de Placas](../operacoes/consulta-placas)** | O modelo do veículo é preenchido automaticamente quando a consulta RENAVAM retorna o registro do CRV |
| **[Infrações — Consulta](../infracoes/consulta-infracoes)** | O modelo do veículo aparece nos detalhes da infração e pode ser corrigido manualmente durante a triagem |
| **[Exportação de Infrações](../infracoes/exportacao)** | O modelo e a marca compõem o campo de identificação do veículo nos arquivos exportados ao órgão autuador |
