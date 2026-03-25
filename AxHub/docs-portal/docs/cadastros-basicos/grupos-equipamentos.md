---
sidebar_position: 4
title: Grupos de Equipamentos
description: Agrupamento lógico de equipamentos para organização e monitoramento
---

# Grupos de Equipamentos

Os grupos de equipamentos permitem organizar logicamente os equipamentos por projeto, cliente, região ou qualquer critério desejado. Cada grupo possui uma cor que o identifica no mapa do Dashboard.

## Como acessar

**Menu lateral** → Equipamentos → **Grupos de Equipamentos**

## Listagem

![Tela de Grupos de Equipamentos - Lista](../img/Grupos%20de%20Equipamentos%20-%20Lista.png)

### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Nome** | Nome do grupo (ordenável) |
| **Desabilitar Monitoramento** | Se ativado (✓), os equipamentos do grupo não são monitorados em tempo real |
| **Desabilitado Limite Horas Importação** | Se ativado (✓), desabilita o controle de limite de horas para importação de dados |
| **Cor** | Cor do grupo exibida no mapa do Dashboard |
| **Ações** | Botões de editar e excluir |

## Cadastro

![Tela de Grupos de Equipamentos - Cadastro](../img/Grupos%20de%20Equipamentos%20-%20Cadastro.png)

### Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome do Grupo de Equipamentos** | Sim | Nome identificador do grupo |
| **Cor** | Não | Cor usada para representar o grupo no mapa do Dashboard. Selecione através do seletor de cores |
| **Desabilitar Monitoramento** | Não | Se marcado, desabilita o monitoramento em tempo real dos equipamentos deste grupo |
| **Desabilitar Limite de Horas Importação** | Não | Se marcado, desabilita o controle de horas limite para importação de dados deste grupo |

### Equipamentos do grupo

A seção inferior exibe uma **tabela somente leitura** com todos os equipamentos que pertencem a este grupo:

| Coluna | Descrição |
|--------|-----------|
| **Código** | Código do equipamento |
| **Modelo do Equipamento** | Modelo do equipamento |
| **Modo de Operação** | Fixo ou Móvel |
| **Desabilitado Limite Horas Importação** | Configuração individual do equipamento |

### Passo a passo — Cadastrar grupo

1. Na listagem, clique em **+ Novo**
2. Informe o **Nome do Grupo de Equipamentos**
3. Selecione uma **Cor** para identificação visual no mapa
4. Configure as opções de **monitoramento** e **limite de horas** conforme necessário
5. Clique em **Salvar**

:::info Vinculando equipamentos
Os equipamentos são vinculados ao grupo através do **cadastro do equipamento** (campo "Grupo"). A tabela de equipamentos nesta tela é apenas para consulta.
:::

:::tip Cores no mapa
Escolha cores distintas para cada grupo, facilitando a identificação visual dos equipamentos no mapa do Dashboard. As mesmas cores são exibidas na legenda do mapa.
:::

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Equipamentos](./equipamentos) | Equipamentos do grupo |
