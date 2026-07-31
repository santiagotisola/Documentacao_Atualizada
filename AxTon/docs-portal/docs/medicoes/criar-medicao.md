---
sidebar_position: 4
title: Gerar Medição
description: Como gerar o relatório de medição contratual mensal no AxTon
---

# Gerar Medição

Gera o **relatório de medição mensal** vinculado a um contrato, consolidando indicadores de performance e disponibilidade para embasar o pagamento do serviço.

## Como acessar

**Menu lateral** → Medições → **Gerar Medição**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Contrato** | Sim | Contrato de referência |
| **Compêtência** | Sim | Mês e ano da medição |
| **Período início** | Sim | Data de início do período medido |
| **Período fim** | Sim | Data de fim do período medido |

## Passo a passo

1. Acesse **Medições → Gerar Medição**
2. Selecione o **Contrato**
3. Informe a **Compêtência** (mês/ano)
4. Defina o **Período** (início e fim)
5. Clique em **Gerar**
6. O sistema consolida automático os índices
7. Revise os resultados
8. Clique em **Finalizar Medição** para bloquear alterações
9. Exporte em **PDF** para envio ao contratante

:::info
A medição finalizada é **bloqueada para edição**. Para corrigi-la, é necessário reabrir com permissão de supervisor, o que gera log de auditoria.
:::

## O que a medição consolida

- Total de veículos fiscalizados no período
- Disponibilidade por equipamento (% uptime)
- Taxa OCR por equipamento
- Total de infrações geradas e exportadas
- Interrupções e impacto na meta contratual

## Impacto contratual

- A medição consolida os índices do período: disponibilidade, OCR e volume de infrações geradas e exportadas
- Interrupções não registradas antes da geração **não entram no cálculo** — revise-as antes de gerar
- Após finalizar a medição, nenhuma alteração é permitida; erros devem ser corrigidos na medição do próximo período
- Medições incompletas ou geradas com dados errados podem gerar glosas no pagamento contratual

## Erros comuns

| Erro | Causa | Solução |
|------|-------|---------|
| Disponibilidade zerada | Interrupções não registradas | Registrar antes de gerar |
| OCR incorreto | Dados desatualizados | Sincronizar e regenerar |
| Meta não calculada | Índice não configurado | Criar em Medições → Índices |

## Relacionado

- [Contratos](./contratos)
- [Índices de Performance](./indices-performance)
- [Interrupções](./interrupcoes)
- Disponibilidade por equipamento
- Taxa OCR por equipamento
- Interrupções de manutenção registradas

## Relacionado

- [Contratos](./contratos)
- [Índices de Performance](./indices-performance)
- [Interrupções](./interrupcoes)

- Interrupções e seus impactos

:::tip Antes de finalizar
Verifique se todas as [Interrupções](./interrupcoes) do período foram registradas. Após finalizar a medição, nenhuma alteração é possível.
:::
| **Contrato** | Sim | Contrato vinculado |
| **Período** | Sim | Mês/ano de referência |
| **Observações** | Não | Notas adicionais |

### Passo a passo

1. Acesse **Medições** → **Gerar Medição**
2. Selecione o Contrato
3. Informe o Período de referência
4. Clique em **Gerar**
5. Revise o Relatório gerado
6. Exporte em PDF ou Excel

## Perguntas frequentes

**Posso gerar a medição antes de registrar todas as interrupções do período?**
Não recomendado. Interrupções não registradas antes da geração não entram no cálculo de disponibilidade, distorcendo os índices. Revise todas as interrupções antes de gerar.

**O que acontece se eu perceber um erro após finalizar a medição?**
A medição finalizada é bloqueada para edição. Para correção, é necessário reabrir com permissão de supervisor, o que gera log de auditoria. Erros devem ser corrigidos antes da finalização.

**Como enviar o boletim de medição ao contratante?**
Após gerar e revisar a medição, clique em **Exportar PDF** para obter o documento formatado. Envie pelo canal definido em contrato (e-mail, sistema do órgão ou portal de prestação de contas).
