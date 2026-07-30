---
sidebar_position: 4
title: Tickets Fechados
description: Histórico de tickets de pesagem finalizados no AxHub
---

# Tickets Fechados

Exibe os tickets de pesagem **já finalizados** — histórico completo de todas as pesagens realizadas.

![Tickets Fechados](../img/Balança%20-%20Tickets%20Fechados.png)

## Como acessar

**Menu lateral** → Balança → **Tickets Fechados**

## Colunas

| Coluna | Descrição |
|--------|-----------|
| **Número** | Identificador do ticket |
| **Placa** | Placa do veículo |
| **Data/Hora** | Momento da pesagem |
| **Posto** | Local de pesagem |
| **Resultado** | Regular / Infrator |

## Exportação de tickets

Clique em **Exportar** para gerar CSV com os tickets do período. Útil para:
- Auditorias internas
- Relatórios ao contratante
- Comprovação de fiscalização

:::tip
Combine filtros **Infrator** + **Período** + **Posto** para gerar relatório focado por localidade e período de pico.
:::

## Quando usar

| Situação | Quando consultar |
|----------|------------------|
| **Auditoria de infrator** | Verificar se a pesagem gerou infração e foi encerrada corretamente |
| **Comprovante de regularidade** | Pesquisar veículos que passaram sem infração para registro operacional |
| **Relatório gerencial** | Exportar dados em CSV para compor boletim diário ou mensal de produção |
| **Conciliação contratual** | Validar o volume de pesagens do posto no período de medição |

## Relacionado

- [Tickets Abertos](./ticket-aberto)
- [Liberar Pesagem](./liberar-pesagem)
- [Relatório de Passagens](../relatorios/relatorio-passagens)

## Fluxo de uso do ticket fechado

1. Operação de pesagem concluída e ticket encerrado automaticamente
2. Ticket aparece em **Balança → Tickets Fechados**
3. Filtrar por **Período** e/ou **Resultado** conforme necessidade
4. Clicar em **Visualizar** para confirmar dados e imagens
5. Exportar em CSV para incluir no boletim diário ou mensal

## Tabela de referência — filtros e usos

| Filtro | Valor | Uso |
|--------|-------|-----|
| **Resultado = Infrator** + período | Mensal | Conciliação de infrações geradas |
| **Placa** específica | - | Verificar histórico de veículo |
| **Posto** + período | Semanal | Relatório gerencial por localidade |
| **Resultado = Regular** | - | Comprovante de regularidade |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Ticket não aparece na lista | Ticket ainda aberto | Verificar em Tickets Abertos |
| Resultado incorreto no ticket | Classificação errada | Reclassificar em Tickets Abertos |
| CSV exportado incompleto | Filtro muito restritivo | Ampliar o período de consulta |

| Filtro | Descrição |
|--------|-----------|
| **Período** | Faixa de datas da pesagem |
| **Placa** | Busca por placa parcial ou completa |
| **Posto** | Posto específico |
| **Resultado** | Regular ou Infrator |

## Exportar dados

Clique em **Exportar** para gerar um arquivo CSV com os tickets do período selecionado, útil para auditorias e relatórios gerenciais.

:::tip
Use o filtro **Infrator** para visualizar somente os tickets que geraram infração e acompanhar o status de processamento da multa.
:::

## Relacionado

- [Tickets Abertos](./ticket-aberto)
- [Reclassificar](./reclassificar)
- [Liberar Pesagem](./liberar-pesagem)


- **Período**: data início e fim
- **Placa**: busca direta
- **Posto**: filtrar por localidade
- **Resultado**: regular ou infrator

## Exportação

Clique em **Excel** ou **PDF** para exportar o histórico filtrado.

:::tip
Use os tickets fechados para gerar evidências de fiscalização e comprovação de operações para auditorias contratuais.
:::

| **Data/Hora** | Momento da pesagem |
| **Peso Bruto** | Peso total registrado |
| **Resultado** | Aprovado, excesso, liberado |
| **Motivo** | Motivo da liberação (quando aplicável) |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Anterior | [Ticket Aberto](./ticket-aberto) | Tickets em andamento |
| Acao | [Reclassificar](./reclassificar) | Reclassificar Use Veículo (com acento) |
