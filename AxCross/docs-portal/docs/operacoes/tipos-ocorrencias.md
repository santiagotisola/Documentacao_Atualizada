---
sidebar_position: 5
title: Tipos de Ocorrências
description: Cadastro dos tipos de ocorrência para categorização de alertas no AxCross
---

# Tipos de Ocorrências

Define as categorias de ocorrência disponíveis para classificação de alertas e eventos registrados no sistema. Cada tipo determina a **identidade visual**, o **comportamento sonoro** e o **prazo de vigência** dos veículos monitorados vinculados a ele.

## Como acessar

No **menu lateral**, clique em **Veículos Monitorados** e selecione **Tipos de Ocorrências**.

![Tipos de Ocorrências](../img/Tipo de Ocorrência.png)

:::info Permissão necessária
Para **visualizar**: `occurrencetype.index`  
Para **criar**: `occurrencetype.create`  
Para **editar**: `occurrencetype.edit`  
Para **excluir**: `occurrencetype.delete`
:::

---

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Código** | Sim | Identificador único do tipo (ex.: `ROUBADO`, `VIP`, `MANCHA01`) |
| **Nome** | Sim | Nome descritivo exibido nos alertas e relatórios |
| **Cor** | Sim | Cor de identificação visual nos alertas e no painel (ex.: vermelho, amarelo, verde) |
| **Emitir Alerta Sonoro** | Não | Quando ativo, dispara sinal sonoro ao gerar alerta deste tipo |
| **Prazo de Expiração (dias)** | Não | Número de dias para expiração automática dos veículos vinculados. Vazio = sem expiração. |
| **Status** | Sim | Ativo ou Inativo |

---

## Tipos padrão do sistema

| Código | Nome | Descrição |
|--------|------|----------|
| **Placa Monitorada** | Veículo Monitorado | Veículo cadastrado na lista de monitorados foi detectado por um equipamento |
| **MANCHA01** | Tempo na Mancha | Veículo permaneceu na área monitorada além do tempo máximo configurado (padrão: 4 horas) |
| **COMBOIO01** | Detecção de Comboio | Grupo de veículos identificados deslocando-se em conjunto (requer Neo4j ativo) |

:::info Configuração do MANCHA01
O tempo máximo na mancha é definido em **Configurações do Sistema → MDF-e → Horas máximas na mancha**. O padrão é **4 horas**.
:::

---

## Passo a passo — Criar novo tipo de ocorrência

1. Acesse **Veículos Monitorados → Tipos de Ocorrências** no menu lateral
2. Clique em **+ NOVO**
3. Informe o **Código** e o **Nome** do tipo
4. Selecione a **Cor** de identificação visual
5. Se necessário, ative **Emitir Alerta Sonoro**
6. Para vigência automática, informe o **Prazo de Expiração (dias)**
7. Clique em **Salvar**

:::tip Exemplos de prazo de expiração
- **30 dias** — monitoramento mensal (ex.: mandado de prisão temporário)
- **90 dias** — vigência trimestral
- **365 dias** — vigência anual
- **Vazio** — nunca expira (ex.: veículos com restrição permanente)
:::

---

## Uso na operação

Os tipos de ocorrência são utilizados em três contextos principais:

| Contexto | Como o tipo é usado |
|----------|---------------------|
| **Cadastro de veículo monitorado** | O tipo define o prazo de vigência e a cor do alerta gerado ao detectar a placa |
| **Criação de alerta manual** | Na tela de Alertas, o operador seleciona o tipo para categorizar o evento registrado |
| **Relatório de Ocorrências** | Filtro disponível para análise específica por tipo |

---

## Atualização em bloco — Alterar prazo

Quando o **Prazo de Expiração** de um tipo é alterado, o sistema recalcula automaticamente a data de expiração de **todos os veículos vinculados** a esse tipo — sem necessidade de editar individualmente cada cadastro.

Consulte [Vigência dos Alertas](vigencia-alertas.md) para o detalhamento completo do controle de expiração.

:::caution Tipos em uso
Tipos de ocorrência vinculados a alertas ou veículos existentes **não podem ser excluídos**. Inative-os para impedir novos usos sem perder o histórico.
:::

## Boas práticas

- Defina um **Código** descritivo e único (ex.: `ROUBADO`, `SUSPEITO`) para facilitar a identificação nos relatórios e filtros
- Configure o **Prazo de Expiração** para ocorrências temporárias (mandados, buscas) e deixe vazio para monitoramentos permanentes
- Escolha cores distintas para cada tipo — cores semelhantes dificultam a identificação visual dos alertas no painel
- Ative **Alerta Sonoro** somente para tipos de alta prioridade para evitar fadiga operacional por excesso de alertas

## Relacionado

- [Alertas](./alertas)
- [Veículos Monitorados](./veiculos-monitorados)
- [Vigência dos Alertas](./vigencia-alertas)
- [Ocorrências e Alertas](../relatorios/ocorrencias-alertas)

## Perguntas frequentes

**Posso excluir um tipo de ocorrência que não é mais utilizado?**
Não, se o tipo já tiver alertas ou veículos vinculados. Inative o tipo para impedir novos usos sem perder o histórico de alertas já gerados com essa categorização.

**O que acontece com os veículos monitorados existentes quando altero o prazo de expiração de um tipo?**
O sistema recalcula automaticamente a data de expiração de todos os veículos vinculados ao tipo alterado. Não é necessário editar os veículos individualmente — a atualização é em bloco e imediata.

**Por que não devo ativar alerta sonoro para todos os tipos de ocorrência?**
Muitos alertas sonoros simultanâneos causam fadiga operacional, fazendo com que operadores passem a ignorar os alertas. Ative o som somente para tipos de alta prioridade (ex.: veículo roubado ou com mandado de prisão) para garantir que a equipe reaja de forma imediata e assertiva.
