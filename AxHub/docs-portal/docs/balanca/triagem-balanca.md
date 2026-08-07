---
sidebar_position: 2
title: Triagem de Balanca
description: Gestao e triagem de infracoes de excesso de peso
---

# Triagem de Balanca

Módulo de gerenciamento das Infrações de excesso de peso geradas pelo sistema de pesagem. O fluxo de trabalho envolve liberar pesagens para triagem, reclassificar tickets e gerenciar os postos e motivos de encerramento.

:::info
O menu **Balança** agrupa as seguintes telas: **Liberar Pesagem**, **Ticket Aberto**, **Ticket Fechado**, **Reclassificar**, **Posto Pesagem** e **Motivos**. Não há uma tela única de "Triagem de Balança" — cada etapa é acessada pelo sub-item correspondente.
:::

## Como acessar

**Menu lateral** → Balança → *(selecione o sub-item desejado)*

## Fluxo de Triagem de Pesagem

1. Acesse **Balança → Liberar Pesagem** para liberar tickets pendentes para Análise
2. Em **Balança → Ticket Aberto** visualize os tickets em andamento
3. Realize a Análise e classifique cada ticket
4. Tickets encerrados aparecem em **Balança → Ticket Fechado**
5. Para corrigir a classificação de um ticket, use **Balança → Reclassificar**

## Reclassificar

![Reclassificar](../img/Balança%20-%20Reclassificar.png)

Permite alterar a classificação de um ticket de pesagem já processado. Acessado em **Menu lateral → Balança → Reclassificar**.

## Postos de Pesagem

![Postos](../img/Balança%20-%20Postos.png)

![Cadastro de Posto](../img/Balança%20-%20Postos%20-%20Cadastro1.png)

![Cadastro de Posto 2](../img/Balança%20-%20Postos%20-%20Cadastro2.png)

Cadastro e gestão dos postos de pesagem. Acessado em **Menu lateral → Balança → Posto Pesagem**.

## Motivos

![Motivos](../img/Balança%20-%20Motivos.png)

![Cadastro de Motivo](../img/Balança%20-%20Motivos%20-%20cadastro.png)

Cadastro de motivos utilizados no encerramento dos tickets de pesagem. Acessado em **Menu lateral → Balança → Motivos**.

## Relacionado

- [Liberar Pesagem](../pesagem/liberar-pesagem)
- [Tickets Abertos](../pesagem/ticket-aberto)
- [Tickets Fechados](../pesagem/ticket-fechado)
- [Reclassificar](../pesagem/reclassificar)
- [Motivos](../pesagem/motivos)

## Boas práticas

- Libere tickets em lotes ao iniciar o turno para evitar acumular atraso na análise
- Reclassifique antes de encerrar o ticket — corrigir após encerramento requer autorização do administrador
- Registre sempre o motivo correto ao encerrar tickets para alimentar os relatórios gerenciais com dados confiáveis
- Monitore tickets com status **Em andamento** há mais de 4 horas e escale para o supervisor

## Navegacao relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Anterior | [Pesagem — Visão Geral](./pesagem) | Visão geral do módulo de pesagem |
| Relacionado | [Liberar Pesagem](../pesagem/liberar-pesagem) | Liberar tickets para triagem |
| Relacionado | [Ticket Aberto](../pesagem/ticket-aberto) | Tickets em andamento |
| Relacionado | [Ticket Fechado](../pesagem/ticket-fechado) | Tickets encerrados |
| Relacionado | [Reclassificar](../pesagem/reclassificar) | Alterar classificacao de ticket |
| Relacionado | [Posto Pesagem](../pesagem/postos) | Cadastro de postos |
| Relacionado | [Motivos](../pesagem/motivos) | Motivos de encerramento |

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Ticket sem classificação de veículo | Tipo de veículo não reconhecido automaticamente | Usar **Reclassificar** antes de liberar o ticket |
| Excesso de peso sem infração gerada | Operação de balança não vinculada | Verificar vínculo da operação e posto no cadastro |
| Ticket não aparece na triagem | Filtro de posto incorreto | Ajustar filtro para o posto correspondente ao turno |

## Integração com outros módulos; sem operação, tickets não são gerados |
| **Relatório de Passagens** | Tickets fechados alimentam o relatório de passagens com os dados da pesagem |
| **Medições** | O volume de pesagens por posto é contabilizado nos boletins de medição do contrato |
| **Infrações** | Tickets com excesso de peso geram infrações que seguem o fluxo normal de triagem e exportação |

## Perguntas frequentes

**O operador de balança precisa acessar o módulo de Infrações separadamente?**
Sim. Tickets com excesso de peso geram infrações que passam pelo fluxo normal de triagem no módulo Infrações. O operador de balança e o triador de infrações podem ser funcionários diferentes.

**É possível liberar um ticket de pesagem sem selecionar um motivo?**
Não. O campo Motivo é obrigatório na tela de liberação. Se não houver motivos cadastrados, o sistema bloqueará a operação. Cadastre os motivos em Balança → Motivos.

**Quanto tempo leva para um ticket de excesso de peso virar uma infração exportada?**
Depende do fluxo da equipe. Após o encerramento do ticket, a infração aguarda triagem, auditoria e inclusão no próximo lote de exportação.

## Fluxo decisório

```
Ticket de pesagem recebido
        ↓
Verificar peso vs. PBT regulamentado
        ↓
    Dentro do limite?
    ├─ Sim → Liberar veículo (Ticket Fechado — Regular)
    └─ Não → Iniciar análise de excesso
              ↓
        Classificação está correta?
        ├─ Não → Reclassificar (Reclassificar)
        │         ↓ Novo PBT dentro do limite? → Liberar
        └─ Sim → Excesso confirmado
                  ↓
            Veículo pode resolver sem infração?
            ├─ Sim (descarga/recurso) → Liberar Pesagem com motivo
            └─ Não → Infração gerada → Triagem → Auditoria → Exportação
```
