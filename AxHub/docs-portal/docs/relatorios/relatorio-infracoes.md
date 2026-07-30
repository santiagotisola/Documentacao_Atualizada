---
sidebar_position: 1
title: Relatório de Infrações
description: Relatório detalhado de Infrações processadas
---

# Relatório de Infrações

Permite gerar Relatórios detalhados das Infrações processadas pelo sistema, com filtros por período, Equipamento tipo de Infração e status. Utilizado para acompanhamento operacional, prestação de contas e auditoria interna.

Relatório de Infrações](../img/Relatorio%20-%20Relatorio%20de%20infrações.png)

## Como acessar

**Menu lateral** → Relatórios → Relatório de Infrações

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Período** | Faixa de datas |
| Equipamento | Filtrar por Equipamento |
| **Enquadramento** | Tipo de Infração |
| **Status** | Processada, descartada, exportada |
| **Operação** | Filtrar por operação vinculada |
| **Operador** | Filtrar por Usuário que realizou a triagem |

## Campos exibidos

| Coluna | Descrição |
|--------|-----------|
| **Número Auto** | Identificador único da Infração |
| **Data/Hora** | Momento da Infração |
| **Placa** | Placa do Veículo infrator |
| Equipamento | Equipamento que registrou |
| **Velocidade Medida** | Velocidade capturada |
| **Velocidade Considerada** | Velocidade após aplicação de tolerância |
| **Enquadramento** | Código e descrição do enquadramento aplicado |
| **Status** | Situação atual da Infração |
| **Operador** | Analista responsável pela triagem |
| **Lote de Exportação** | Lote ao qual foi exportada (quando aplicável) |

## Como usar

1. Acesse **Relatórios → Infrações**
2. Defina o **Período** e os filtros desejados
3. Clique em **Buscar**
4. Exporte em **Excel** para envio ou arquivoção

:::tip
Filtre por **Status = Auditada** para obter a lista de infrações prontas para incluir no próximo lote de exportação.
:::

## Casos de uso

- **Fechamento de lote** — exporte as infrações com status **Auditada** para compor o próximo lote de envio ao órgão autuador
- **Auditoria pré-envio** — revise enquadramentos e imagens antes da exportação para evitar rejeições
- **Análise de descartes** — identifique os principais motivos de descarte para ajustar a calibração dos equipamentos
- **Acompanhamento do fluxo** — monitore o pipeline completo: triagem → auditoria → exportação por período

## Relacionado

- [Triagem de Infrações](../infracoes/triagem)
- [Lotes de Exportação](../glossario/lote-exportacao)
- [Motivos de Descarte](../administracao/motivos-descartes)

## Exportação

Exportável em **Excel** e **PDF**. O formato PDF inclui imagens quando selecionado o campo correspondente.

## Termos Técnicos

| Termo | Definição |
|-------|-----------|
| [Enquadramento](../glossario/enquadramento) | Ver definição no glossário |
| [Triagem](../glossario/triagem) | Ver definição no glossário |
| [Autuação](../glossario/autuacao) | Ver definição no glossário |

---

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Relacionado | [Consulta de Infrações](../infracoes/consulta-infracoes) | Consulta detalhada |
| Relacionado | [Exportação](../infracoes/exportacao) | Lotes exportados |
| Relacionado | [Auditoria](../infracoes/auditoria) | Revisão de Infrações |
