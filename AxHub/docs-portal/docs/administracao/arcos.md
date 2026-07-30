---
sidebar_position: 2
title: Arcos
description: Cadastro de arcos de fiscalização
---

# Arcos

Permite cadastrar e gerenciar os arcos de fiscalização vinculados às operações.

![Lista de Arcos](../img/Configurações%20-%20Arco.png)

## Como acessar

**Menu lateral** → Configurações → **Arcos**

## Cadastro de arco

![Cadastro de Arco](../img/Configurações%20-%20Arco%20-%20cadastro.png)
## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Identificação do arco |
| **Localidade** | Sim | Local de instalação |
| **Equipamentos** | Sim | Equipamentos vinculados ao arco |
| **Status** | Sim | Ativo ou Inativo |

## Passo a passo

1. Acesse **Configurações → Arcos**
2. Clique em **+ Novo**
3. Preencha o **Nome** e a **Localidade**
4. Vincule os **Equipamentos** do arco
5. Clique em **Salvar**

:::info O que é um Arco?
Um arco agrupa equipamentos instalados na mesma travessia (ex: radares das faixas 1, 2 e 3 de uma mesma pista), facilitando o gerenciamento e exportação conjunta.
:::

## Boas práticas

- Agrupe no mesmo arco todos os equipamentos instalados na mesma estrutura física (ex.: câmeras das faixas 1, 2 e 3 de uma mesma pista)
- Use nomenclatura padronizada (ex.: ARQ-001-ROD-SP330) para facilitar a identificação nos relatórios e lotes
- Vincule os equipamentos corretos — um equipamento em arco errado gera inconsistência nos lotes de exportação
- Mantenha arcos desativados como **Inativos** para preservar o histórico de infrações associadas

## Relacionado

- [Eventos de Equipamentos](../relatorios/eventos-equipamentos)
- [Operações](../operacoes/cadastro-operacoes)

:::info
Arcos permitem exportar dados de múltiplas faixas/equipamentos de uma mesma localidade em um único lote, mantendo consistência na numeração e registro.
:::
:::
| Campo | Descrição |
|-------|-----------|
| **Nome** | Identificação do arco |
| **Localização** | Endereço ou referência |
| Equipamentos | Equipamentos vinculados ao arco |
| **Status** | Ativo ou Inativo |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Equipamentos](../cadastros-basicos/equipamentos) | Equipamentos no arco |
| Relacionado | [Operacoes](../operacoes/cadastro-operacoes) | Operacao vinculada |
