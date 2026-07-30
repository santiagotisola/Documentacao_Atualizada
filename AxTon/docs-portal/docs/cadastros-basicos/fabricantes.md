---
sidebar_position: 2
title: Fabricantes
description: Cadastro dos fabricantes de equipamentos de pesagem no AxTon
---

# Fabricantes

Cadastro dos **fabricantes dos equipamentos** de pesagem. Obrigatório para vincular equipamentos a modelos e garantir rastreabilidade técnica.

## Como acessar

**Menu lateral** → Cadastros Básicos → **Fabricantes**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome do fabricante |
| **CNPJ** | Não | CNPJ do fabricante |
| **Contato** | Não | E-mail ou telefone de suporte |
| **Status** | Sim | Ativo ou Inativo |

## Passo a passo

1. Acesse **Cadastros Básicos → Fabricantes**
2. Clique em **+ Novo**
3. Preencha o **Nome** e o **CNPJ** (se aplicável)
4. Clique em **Salvar**

:::info Hierarquia
Fabricante → Modelo → Equipamento. Cadastre o fabricante antes de criar modelos.
:::

## Fabricantes homologados comuns

| Fabricante | Tipo | Site |
|------------|------|------|
| HAENNI | Balanças portáteis | haenni.com |
| Toledo do Brasil | Balanças industriais | toledodobrasil.com.br |
| ID Logistics (RODOANEL) | WIM dinâmico | - |

## Relacionado

- [Modelos de Equipamentos](./modelos-equipamentos)
- [Tipos de Equipamentos](./tipos-equipamentos)
- [Equipamentos](./equipamentos)

## Boas práticas

- Cadastre o fabricante antes de criar modelos e equipamentos — a hierarquia Fabricante → Modelo → Equipamento é obrigatória
- Informe o **CNPJ** e o **Contato** de suporte para agilizar chamados técnicos em campo
- Não exclua fabricantes com equipamentos vinculados; inative-os para preservar o histórico de operações e certificações
- Utilize a nomenclatura oficial do fabricante para compatibilidade com laudos INMETRO e contratos de manutenção

| RODOANEL | Sistemas WIM dinâmicos |
| SCHENCK | Balanças de precisao |

3. Informe o **Nome** do fabricante
4. Clique em **Salvar**

## Hierarquia

```
Fabricante
  └── Modelo de Equipamento
        └── Equipamento cadastrado
```

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Relacionado | [Modelos](./modelos-equipamentos) | Modelos do fabricante |
| Relacionado | [Equipamentos](./equipamentos) | Equipamentos cadastrados |


| Coluna | Descrição |
|--------|-----------|
| **Código** | Identificador único |
| **Nome** | Nome do fabricantes |
| **Ativo** | Status do registro |

### Passo a passo — Cadastrar

1. Acesse **Cadastros Básicos** → **Fabricantes**
2. Clique em **+ Novo**
3. Preencha os campos obrigatórios
4. Clique em **Salvar**

:::tip Dependência
Este cadastro é utilizado como referência em outros módulos do sistema.
:::
