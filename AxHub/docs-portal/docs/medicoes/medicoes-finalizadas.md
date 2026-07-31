---
sidebar_position: 5
title: Medições Finalizadas
description: Histórico de medições contratuais finalizadas no AxHub
---

# Medições Finalizadas

Exibe o **histórico das medições contratuais** que já foram calculadas e finalizadas. Após a finalização, a medição é bloqueada para alterações.

![Medições Finalizadas](../img/Medição%20-Medição%20%20finalizada.png)

## Como acessar

**Menu lateral** → Medição → **Medições Finalizadas**

## Colunas exibidas

| Coluna | Descrição |
|--------|-----------|
| **Contrato** | Contrato de referência |
| **Período** | Mês/ano da medição |
| **Disponibilidade** | Índice de disponibilidade apurado |
| **Taxa OCR** | Taxa de reconhecimento do período |
| **Status** | Finalizada / Em revisão |

## Ações disponíveis

| Ação | Descrição |
|------|-----------|
| **Visualizar** | Exibe o Boletim de Medição completo |
| **Exportar** | Gera PDF ou Excel do boletim |
| **Reabrir** | Disponibiliza para revisão (requer permissão) |

:::info
Uma medição finalizada **não pode ser editada** sem ser reaberta. A reabertura exige permissão de supervisor e gera log de auditoria.
:::

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Não consigo reabrir | Permissão insuficiente | Solicitar ao supervisor |
| Boletim incorreto | Interrupção não registrada | Corrigir após reabrir |
| Medição não aparece na lista | Status diferente | Verificar filtros de status |

## Ciclo de vida da medição

```
Criada → Em elaboração → Finalizada
                           ↓ (se necessário)
                        Reaberta → Revisada → Finalizada
```

```
Criada → Em elaboração → Finalizada
                            ↓ (se preciso)
                         Reaberta → Revisada → Finalizada novamente
```

## Impacto contratual

- Uma medição finalizada representa o SLA entregue ao contratante no período — erros devem ser corrigidos no mês seguinte
- O boletim gerado é o documento oficial de comprovação do cumprimento das metas de disponibilidade e OCR
- Medições reabertas devem ser justificadas; a nova versão finalizada exige aprovação do gestor responsável
- Mantenha o histórico de medições finalizadas para auditoria e prestação de contas ao contratante

## Relacionado

- [Criar Medição](./criar-medicao)
- [Contratos](./contratos)
- [Índices de Performance](./indices-performance)


```
Criada → Em elaboração → Finalizada → (Reaberta → Revisada → Finalizada)
```

## Relacionado

- [Criar Medição](./criar-medicao)
- [Contratos](./contratos)
- [Índices de Performance](./indices-performance)


| Ação | Descrição |
|------|-----------|
| **Visualizar** | Ver detalhes completos da medição |
| **Exportar PDF** | Gerar relatório para o contratante |
| **Exportar Excel** | Dados para análise |

:::info Imutabilidade
Medições finalizadas não podem ser editadas. Para correções, entre em contato com o administrador.
:::

| **Disponibilidade** | Percentual de disponibilidade calculado |
| **Performance** | Índice de performance atingido |
| **Status** | Aprovada, pendente, contestada |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Criar Medicao](./criar-medicao) | Nova medicao |
| Relacionado | [Contratos](./contratos) | Contrato medido |

## Perguntas frequentes

**Posso reabrir uma medição finalizada?**
Sim, mas apenas com permissão de supervisor. A reabertura gera log de auditoria. Após as correções, a medição precisa ser finalizada novamente.

**O boletim exportado é o documento oficial para o contratante?**
Sim. O PDF gerado pela opção **Exportar** é o Boletim de Medição oficial para comprovar o SLA do período. Guarde uma cópia por no mínimo 5 anos.

**O que significa o status “Em Revisão”?**
A medição foi reaberta por um supervisor e está aguardando nova finalização. Nenhum dado deste período deve ser considerado definitivo até que retorne ao status **Finalizada**.

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Criar Medição](./criar-medicao)** | As medições finalizadas são geradas a partir do fluxo de criação; esta tela exibe o histórico de todas as medições concluídas |
| **[Contratos](./contratos)** | Cada medição finalizada está vinculada a um contrato e comprova o cumprimento do SLA do período |
| **[Índices de Performance](./indices-performance)** | Os índices calculados na medição são exibidos no boletim exportado e determinam a conformidade contratual |
| **[Medições — Interrupções](./interrupcoes)** | As interrupções registradas no período são consideradas no cálculo de disponibilidade exibido na medição finalizada |
