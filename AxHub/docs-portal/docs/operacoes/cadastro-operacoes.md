---
sidebar_position: 1
title: Cadastro de Operacoes
description: Cadastro e gestao de operacoes de fiscalizacao
---

# Cadastro de Operacoes

Uma operacao e o registro formal de uma acao de fiscalizacao de transito.

## Como acessar

Menu lateral - Operacoes - Cadastro de Operacoes

## Listagem

![Lista de Operacoes](../img/Operações%20-%20operações.png)

## Cadastro de Operacao

![Cadastro de Operacao](../img/Operações%20-%20operações%20-%20cadastro.png)

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome da operação |
| **Data Início** | Sim | Data/hora de início |
| **Data Fim** | Não | Data/hora de encerramento |
| **Equipamentos** | Sim | Equipamentos participantes |
| **Responsável** | Sim | Agente responsável |
| **Descrição** | Não | Detalhes da operação |

## Passo a passo

1. Acesse **Operações → Cadastro de Operações**
2. Clique em **+ Nova Operação**
3. Preencha o **Nome**, **Data Início** e selecione os **Equipamentos**
4. Clique em **Salvar**

:::tip
Uma operação ativa vincula todos os registros de passagem dos equipamentos selecionados ao contexto da fiscalização, facilitando a exportação e a auditoria.
:::
1. Acesse **Operações → Cadastro de Operações**
2. Clique em **+ Nova Operação**
3. Preencha os campos obrigatórios
4. Vincule os **Equipamentos** participantes
5. Clique em **Salvar**

:::tip
Uma operação ativa vincula todos os registros de passagem dos equipamentos selecionados ao contexto da fiscalização, facilitando a exportação e auditoria.
:::
|-------|-------------|-----------|
| Equipamento | Sim | Equipamento vinculado a operacao |
| Arco | Sim | Arco onde a operacao ocorre |
| Data Inicio | Sim | Data e hora de inicio da operacao |
| Data Fim | Sim | Data e hora de termino da operacao |
| Enquadramentos | Sim | Enquadramentos legais habilitados |
| Velocidade Regulamentada | Condicional | Velocidade limite da via |
| Observacao | não | Informacoes adicionais |

## Relacionado

- [Faixas](./faixas)
- [Arcos](../administracao/arcos)
- [Aferições](./afericoes)
- [Enquadramentos](../administracao/enquadramentos)

## Fluxo de uma operação

1. **Pré-operação** — verificar aferíção dos equipamentos e enquadramentos configurados
2. **Abertura** — criar a operação com nome, data início e equipamentos vinculados
3. **Execução** — passagens registradas automaticamente pelos equipamentos vinculados
4. **Triagem** — infrações geradas passam pela triagem dos analistas
5. **Encerramento** — definir data fim ao concluir o período de fiscalização
6. **Exportação** — infrações da operação exportadas em lote para o órgão autuador

## Tabela de referência — tipos de operação

| Tipo | Duração típica | Observação |
|------|:---------------:|------------|
| Fiscalização rotineira | 1 dia | Operação diária padrão |
| Blitz especial | Horas | Vincular só os equipamentos do ponto |
| Operação de evento | 1–7 dias | Preencher descrição com justificativa |
| Operação continuada | Mensal | Encerrar no final do mês para medição |

## Boas práticas

- Vincule os equipamentos corretos antes de iniciar a operação — passagens de equipamentos não vinculados não serão associadas ao contexto da fiscalização
- Encerre a operação no mesmo dia para não misturar dados de períodos distintos nos relatórios
- Descreva o objetivo da operação no campo **Observação** para facilitar auditorias futuras
- Verifique se os equipamentos possuem aferição válida antes de iniciar — aferição vencida invalida as infrações geradas

## Navegacao relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Arcos](../administracao/arcos) | Pontos de fiscalizacao |
| Relacionado | [Afericoes](./afericoes) | Controle de afericoes |

## Checklist pré-operação

- [ ] Verificar aferição INMETRO válida de todos os equipamentos da operação
- [ ] Confirmar que os enquadramentos estão configurados para a velocidade da via
- [ ] Validar que as faixas têm código IBGE correto
- [ ] Confirmar que os equipamentos estão **Online** no monitoramento
- [ ] Definir data de início e encerramento corretas
- [ ] Verificar se o contrato vinculado está com status **Ativo**
