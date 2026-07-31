---
sidebar_position: 5
title: Grupos de Equipamentos
description: Agrupamento lógico de equipamentos de pesagem no AxTon
---

# Grupos de Equipamentos

Agrupamento lógico de equipamentos para **organização por contrato, região ou tipo de operação**. Facilita filtros em relatórios e medições contratuais.

## Como acessar

**Menu lateral** → Cadastros Básicos → **Grupos de Equipamentos**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome do grupo |
| **Descrição** | Não | Finalidade do agrupamento |
| **Equipamentos** | Sim | Lista de equipamentos do grupo |
| **Status** | Sim | Ativo ou Inativo |

## Passo a passo

1. Acesse **Cadastros Básicos → Grupos de Equipamentos**
2. Clique em **+ Novo**
3. Informe o **Nome** do grupo
4. Vincule os **Equipamentos**
5. Clique em **Salvar**

:::tip
Organize grupos por **contrato** ou **região** para facilitar a geração de medições e relatórios segmentados por localidade.
:::

## Boas práticas

- Crie um grupo por contrato ou por área geográfica — evite grupos genéricos com muitos equipamentos misturados
- Nomeie os grupos de forma que o usuário identifique facilmente a localidade ou o contrato
- Mantenha a lista de equipamentos do grupo atualizada após instalações ou desativações

## Impacto nas medições

Grupos bem definidos permitem:
- Gerar medições contratuais por agrupamento
- Filtrar o Fluxo Diário por grupo
- Comparar OCR entre regiões diferentes

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Grupo vazio | Equipamentos não vinculados | Vincular após criar o grupo |
| Medição não filtra por grupo | Grupo não associado | Verificar configuração |
| Equipamento em dois grupos | Sem problema | Permitido para diferentes fins |

## Relacionado

- [Equipamentos](./equipamentos)
- [Contratos](../medicoes/contratos)
- [Medições](../medicoes/criar-medicao)

- Gerar medições contratuais por agrupamento
- Filtrar o Fluxo Diário de Veículos por grupo
- Comparar desempenho OCR entre regiões diferentes

## Relacionado

- [Equipamentos](./equipamentos)
- [Contratos](../medicoes/contratos)
- [Medições](../medicoes/criar-medicao)

## Relacionado

- [Equipamentos](./equipamentos)
- [Contratos](../medicoes/contratos)

## Uso dos grupos

- **Relatórios**: filtrar dados por grupo de equipamentos
- **Medições**: agrupar equipamentos de um mesmo contrato
- **Monitoramento**: visualizar status por grupo

:::info
Grupos bem definidos reduzem o tempo de criação de medições contratuais e facilitam a análise de desempenho por região ou contratante.
:::
| **Código** | Identificador único |
| **Nome** | Nome do grupos de Equipamentos |
| **Ativo** | Status do registro |

### Passo a passo — Cadastrar

1. Acesse **Cadastros Básicos** → **Grupos de Equipamentos
2. Clique em **+ Novo**
3. Preencha os campos obrigatórios
4. Clique em **Salvar**

:::tip Dependência
Este cadastro é utilizado como referência em outros módulos do sistema.
:::

## Perguntas frequentes

**Um equipamento pode estar em mais de um grupo?**
Sim. O sistema permite que um equipamento pertença a múltiplos grupos para diferentes finalidades (por contrato e por região, por exemplo).

**Grupos afetam o cálculo das medições contratuais?**
Sim. As medições podem ser geradas e filtradas por grupo. Mantenha os grupos atualizados com os equipamentos corretos para garantir boletins precisos.

**O que acontece quando inativo um grupo que tem equipamentos vinculados?**
Os equipamentos permanecem cadastrados e operacionais. O grupo inativo apenas deixa de aparecer nos filtros de relatórios e medições.

## Integração com outros módulos

| Módulo | Como se relaciona com Grupos de Equipamentos |
|--------|----------------------------------------------|
| **Cadastros Básicos → Equipamentos** | Os equipamentos são vinculados aos grupos aqui cadastrados |
| **Medições → Contratos** | Contratos podem ser filtrados por grupo para cálculos de disponibilidade segmentados |
| **Medições → Índices de Performance** | Índices podem ser configurados por grupo para análise granular do desempenho |
| **Operações → Monitoramento Online** | O monitoramento pode ser filtrado por grupo para visualizar apenas equipamentos relevantes |
