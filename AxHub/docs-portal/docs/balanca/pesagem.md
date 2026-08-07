---
sidebar_position: 1
title: Módulo de Pesagem (Balança)
description: Visão geral do módulo de pesagem de Veículos no AxHub
---

# Módulo de Pesagem (Balança)

O módulo de **Balança** gerencia o fluxo completo de pesagem de Veículos integrada ao AxHub, desde a captura de Infrações de excesso de peso até o encerramento e reclassificação dos tickets.

## Como acessar

**Menu lateral** → **Balança** → *(selecione o sub-item)*

## Sub-menus do Módulo de Pesagem

| Sub-menu | URL | Descrição |
|----------|-----|-----------|
| **Liberar Pesagem** | `/ticketpesagem/liberarpesagem` | Libera tickets pendentes para Análise |
| **Ticket Aberto** | `/ticketpesagem/ticketabertos` | Lista tickets em andamento |
| **Ticket Fechado** | `/ticketpesagem/ticketfechados` | Lista tickets encerrados |
| **Reclassificar** | `/ticketpesagem/ticketreclassificacao` | Permite reclassificar tickets já processados |
| **Posto Pesagem** | `/posto` | Cadastro e gestão dos postos de pesagem |
| **Motivos** | `/motivoticketpesagem` | Cadastro de motivos de encerramento de tickets |

## Fluxo Operacional

```
Captura de Infração → Liberar Pesagem → Ticket Aberto → Análise → Ticket Fechado
                                                              ↓
                                                       Reclassificar (se necessário)
```

1. **Captura**: O sistema de pesagem registra automaticamente Infrações de excesso de peso
2. **Liberar**: O operador acessa **Balança → Liberar Pesagem** e libera os tickets para Análise
3. Análise Os tickets liberados aparecem em **Ticket Aberto** para revisão
4. **Encerramento**: Após Análise o ticket é encerrado e vai para **Ticket Fechado**
5. **Reclassificação**: Se necessário, use **Reclassificar** para corrigir a classificação

## Tickets Abertos

![Tickets Abertos](../img/Balança%20-%20Tickets%20Abertos.png)

Exibe os tickets de pesagem que estão em aberto, aguardando Análise ou encerramento.

## Tickets Fechados

![Tickets Fechados](../img/Balança%20-%20Tickets%20Fechados.png)

Exibe o histórico de tickets já encerrados, com data e motivo de encerramento.

## Liberar Tickets para Pesagem

![Liberar Tickets](../img/Balança%20-%20Liberar%20Tickets%20para%20Pesagem.png)

Tela para liberar em lote os tickets que chegaram do sistema de pesagem.

## Colunas Principais dos Tickets

| Coluna | Descrição |

## Erros comuns no módulo de balança

| Problema | Causa provável | Solução |
|----------|---------------|----------|
| Ticket não aparece em Abertos | Operação não está ativa | Criar ou reativar a operação |
| Pesagem não gera infração | Tolerância configurada muito alta | Verificar Configurações do Sistema | 
| Ticket fechado com resultado errado | Classificação incorreta | Reclassificar antes de liberar |
| Liberação sem motivo disponível | Motivo não cadastrado | Cadastrar motivo em Balança → Motivos |

## Tabela de referência — status dos tickets

| Status | Descrição | Passo seguinte |
|--------|-----------|:--------------:|
| **Em andamento** | Pesagem iniciada, aguardando conclusão | Análise e encerramento |
| **Finalizado** | Pesagem concluída e registrada | Exportação ou consulta |
| **Reclassificado** | Categoria corrigida pelo operador | Verificar resultado após reclassificação |
| **Liberado** | Veículo liberado com motivo registrado | Registro encerrado |
|--------|-----------|
| **Data/Hora** | Momento da pesagem |
| **Placa** | Placa do Veículo pesado |
| **PBT** | Peso Bruto Total registrado |
| **PBT Limite** | Limite legal de peso para o tipo de Veículo |
| **Excesso** | Peso acima do limite, se houver |
| **Status** | Regular, Excesso ou Descartado |

## Navegacao relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Triagem de Balanca](./triagem-balanca) | Fluxo detalhado de triagem |
| Relacionado | [Liberar Pesagem](../pesagem/liberar-pesagem) | Sub-tela: liberar tickets |
| Relacionado | [Ticket Aberto](../pesagem/ticket-aberto) | Sub-tela: tickets em andamento |
| Relacionado | [Ticket Fechado](../pesagem/ticket-fechado) | Sub-tela: tickets encerrados |
| Relacionado | [Reclassificar](../pesagem/reclassificar) | Sub-tela: reclassificacao |
| Relacionado | [Posto Pesagem](../pesagem/postos) | Sub-tela: postos cadastrados |
| Relacionado | [Motivos](../pesagem/motivos) | Sub-tela: motivos de encerramento |

## Checklist pré-operação

- [ ] Verificar aferição INMETRO da balança dentro do prazo de validade
- [ ] Confirmar que o posto de pesagem está com status **Ativo** no sistema
- [ ] Validar que os equipamentos do posto estão **Online** no monitoramento
- [ ] Confirmar que os motivos de liberação estão cadastrados e ativos
- [ ] Verificar se há tickets abertos de turno anterior pendentes de encerramento
- [ ] Confirmar perfil de acesso do operador (liberação e reclassificação habilitados)

## Perguntas frequentes

**O sistema de balança integra automaticamente com o AxHub ou requer configuração manual?**
A integração é automática quando o equipamento de pesagem está devidamente cadastrado e vinculado ao posto. Infrações de excesso de peso são geradas sem intervenção manual.

**O que acontece quando um ticket aberto não é encerrado no fim do turno?**
O ticket permanece em aberto até encerramento manual. Tickets acumulados de turnos anteriores devem ser revisados e encerrados com o motivo correto antes de iniciar novo turno.

**Pesagens com peso dentro do limite sempre resultam em ticket regular?**
Sim. Tickets com PBT dentro do limite são encerrados como Regulares. Somente excessos de peso geram infrações.

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Postos de Pesagem](../pesagem/postos)** | O módulo de balança opera em conjunto com os postos de pesagem cadastrados |
| **[Tickets Abertos](../pesagem/ticket-aberto)** | Cada ciclo de pesagem gera um ticket aberto que aguarda liberação pelo operador |
| **[Tickets Fechados](../pesagem/ticket-fechado)** | Após a liberação, o ticket migra para o histórico de tickets fechados |
| **[Infrações — Triagem](../infracoes/triagem)** | Excesso de peso detectado pela balança gera infração que segue o fluxo normal de triagem e exportação |

## Fluxo decisório

```
Veículo detectado na balança dinâmica
        │
        ▼
Peso está acima do PBT + tolerância?
   ├── NÃO → Ticket encerrado como Regular
   └── SIM → Infração gerada → Ticket Aberto
              │
              ▼
        Balança estática confirma o excesso?
          ├── SIM → Liberar pesagem (com motivo) + Gerar Auto
          └── NÃO → Reclassificar ou Descartar ticket
```

:::tip Checklist de início de turno
Verifique: aferição válida, posto ativo, motivos cadastrados e tickets do turno anterior encerrados.
:::
