---
sidebar_position: 4
title: Grupos de Equipamentos
description: Agrupamento lógico de Equipamentos para organização e monitoramento
---

# Grupos de Equipamentos

Os grupos de Equipamentos permitem organizar logicamente os Equipamentos por projeto, cliente, região ou qualquer critério desejado. Cada grupo possui uma cor que o identifica no mapa do Dashboard

## Como acessar

**Menu lateral** → Equipamentos → **Grupos de Equipamentos

## Listagem

![Tela de Grupos de Equipamentos - Lista](../img/Grupos%20de%20Equipamentos%20-%20Lista.png)

### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Nome** | Nome do grupo (ordenável) |
| **Desabilitar Monitoramento** | Se ativado (✓), os Equipamentos do grupo não são monitorados em tempo real |
| **Desabilitado Limite Horas Importação** | Se ativado (✓), desabilita o controle de limite de horas para importação de dados |
| **Cor** | Cor do grupo exibida no mapa do Dashboard |
| **Ações** | Botões de editar e excluir |

## Cadastro

![Tela de Grupos de Equipamentos - Cadastro](../img/Grupos%20de%20Equipamentos%20-%20Cadastro.png)

### Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome do Grupo de Equipamentos | Sim | Nome identificador do grupo |
| **Cor** | Não | Cor usada para representar o grupo no mapa do Dashboard Selecione através do seletor de cores |
| **Desabilitar Monitoramento** | Não | Se marcado, desabilita o monitoramento em tempo real dos Equipamentos deste grupo |
| **Desabilitar Limite de Horas Importação** | Não | Se marcado, desabilita o controle de horas limite para importação de dados deste grupo |

### Equipamentos do grupo

A seção inferior exibe uma **tabela somente leitura** com todos os Equipamentos que pertencem a este grupo:

| Coluna | Descrição |
|--------|-----------|
| **Código** | Código do Equipamento |
| **Modelo do Equipamento | Modelo do Equipamento |
| **Modo de Operação** | Fixo ou Móvel |
| **Desabilitado Limite Horas Importação** | Configuração individual do Equipamento |

### Passo a passo — Cadastrar grupo

1. Na listagem, clique em **+ Novo**
2. Informe o **Nome do Grupo de Equipamentos
3. Selecione uma **Cor** para identificação visual no mapa
4. Configure as opções de **monitoramento** e **limite de horas** conforme necessário
5. Clique em **Salvar**

:::info Vinculando Equipamentos
Os Equipamentos são vinculados ao grupo através do **cadastro do Equipamento (campo "Grupo"). A tabela de Equipamentos nesta tela é apenas para consulta.
:::

:::tip Cores no mapa
Escolha cores distintas para cada grupo, facilitando a identificação visual dos Equipamentos no mapa do Dashboard As mesmas cores são exibidas na legenda do mapa.
:::

---

## Fluxo de configuração de grupo

1. Criar o grupo em **Equipamentos → Grupos de Equipamentos**
2. Definir o **Nome**, a **Cor** e as opções de monitoramento
3. Clicar em **Salvar**
4. Acessar cada **Equipamento** e vincular ao grupo no campo "Grupo de Equipamentos"
5. Verificar no **Mapa do Dashboard** se os equipamentos aparecem com a cor correta

## Tabela de referência — opções do grupo

| Opção | Quando ativar | Impacto |
|-------|:-------------:|----------|
| **Desabilitar Monitoramento** | Grupo em teste ou manutenção | Equipamentos não aparecem no painel de status em tempo real |
| **Desabilitar Limite Horas Importação** | Volume de importação muito alto | Remove o filtro de horas para importação de dados |
| **Cor** | Sempre | Identificação visual no mapa do Dashboard |

## Boas práticas

- Escolha cores distintas para cada grupo — facilita a identificação no mapa quando há muitos grupos simultâneos
- Use o campo **Nome** com o mesmo critério do contrato (ex.: Contrato SINFRA 2026) para facilitar a filtragem em relatórios
- Ao desativar um equipamento, revise se ele precisa ser removido do grupo para não distorcer os indicadores

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Equipamento não aparece no grupo | Não vinculado no cadastro do equipamento | Editar equipamento e selecionar o grupo correto |
| Cor não exibida no mapa | Nenhuma cor selecionada | Editar grupo e definir uma cor |
| Equipamentos do grupo não monitorados | Opção "Desabilitar Monitoramento" ativa | Desmarcar a opção no cadastro do grupo |

## Perguntas frequentes

**Como vincular um equipamento a um grupo?**
Acesse o cadastro do equipamento (Equipamentos → Equipamentos), edite o registro e selecione o grupo no campo correspondente. A tabela dentro do cadastro do grupo é apenas de leitura.

**O que acontece ao desabilitar o monitoramento de um grupo?**
Os equipamentos do grupo param de aparecer no painel de status em tempo real. Infrações e passagens continuam sendo registradas normalmente.

**Posso mover todos os equipamentos de um grupo para outro?**
Sim. Edite cada equipamento individualmente e altere o campo Grupo. Não há função de transferência em massa.

## Relacionado

- [Equipamentos](./equipamentos)
- [Dashboard](../primeiros-passos/dashboard)

## Integração com outros módulos

| Módulo | Como usa este cadastro |
|--------|----------------------|
| **Equipamentos** | Cada equipamento é vinculado a um grupo; o grupo define a cor no mapa e as opções de monitoramento |
| **Dashboard** | O mapa exibe equipamentos agrupados por cor conforme o grupo cadastrado |
| **Monitoramento Online** | Permite filtrar o status de equipamentos por grupo |
| **Relatórios** | Dados de passagens e infrações podem ser filtrados por grupo para análise por projeto ou contrato |

## Exemplo prático

**Criando um grupo para organizar equipamentos de um novo contrato:**

1. Acessar **Equipamentos → Grupos de Equipamentos** e clicar em **+ Novo**
2. Preencher:
   - **Nome**: `Contrato SINFRA 2026 — Piauí`
   - **Cor**: Azul escénico (para diferenciar no mapa)
3. Salvar o grupo
4. Acessar cada equipamento do contrato em **Equipamentos → Equipamentos**
5. Editar e selecionar o grupo recém-criado no campo **Grupo**
6. Verificar no **Mapa do Dashboard** se os equipamentos aparecem com a cor correta

:::tip
Use uma cor distinta para cada contrato — facilita a identificação visual no mapa quando há múltiplos projetos simultâneos.
:::
