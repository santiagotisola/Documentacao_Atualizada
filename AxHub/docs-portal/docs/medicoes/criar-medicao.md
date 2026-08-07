---
sidebar_position: 6
title: Criar Medição
description: Criação de nova medição contratual
---

# Criar Medição

Permite gerar uma nova medição contratual com base nos dados de operação do período.

Relatório de Medição](../img/Medição%20-%20nova%20medição%20-%20relatorio%20de%20medição%20de%20equipamento.png)

## Como acessar

**Menu lateral** → Medição → **Nova Medição**

## Filtros

![Filtros de Medição](../img/Medição%20-%20nova%20medição%20-%20relatorio%20de%20medição%20de%20equipamento%20-%20filtros.png)

| Campo | Descrição |
|-------|-----------|
| **Contrato** | Contrato a ser medido |
| **Período** | Mês/ano de referência |
| Equipamentos | Seleção dos Equipamentos incluídos |

## Fluxo

1. Selecione o contrato e período
2. O sistema calcula automaticamente os índices
3. Revise disponibilidade, OCR e interrupções
4. Exporte o **Boletim de Medição** em PDF ou Excel

## O que a medição calcula

- Horas de disponibilidade por equipamento
- Taxa de aproveitamento OCR
- Total de passagens e infrações do período
- Interrupções e impacto na meta

:::info Boletim
O Boletim gerado pode ser enviado ao contratante como comprovação do SLA contratual.
:::

## Impacto contratual

- A medição consolida os índices do período: disponibilidade, OCR e volume de infrações geradas e exportadas
- Interrupções não registradas antes da geração **não entram no cálculo** — revise-as antes de gerar
- Após finalizar a medição, nenhuma alteração é permitida; erros devem ser corrigidos na medição do próximo período
- Medições com dados errados podem gerar glosas no pagamento contratual

## Relacionado

- [Contratos](./contratos)
- [Medições Finalizadas](./medicoes-finalizadas)
- [Interrupções](./interrupcoes)

- Horas de disponibilidade por equipamento
- Taxa de aproveitamento OCR
- Total de passagens e infrações do período
- Interrupções e impacto na meta

:::info Boletim
O **Boletim de Medição** pode ser enviado ao contratante como comprovação do cumprimento do SLA contratual.
:::

## Relacionado

- [Medições Finalizadas](./medicoes-finalizadas)
- [Índices de Performance](./indices-performance)
- [Interrupções](./interrupcoes)

:::info Boletim
O **Boletim de Medição** pode ser enviado ao contratante como comprovação do cumprimento do SLA.
:::
- Horas de disponibilidade por equipamento
- Índice de aproveitamento OCR
- Total de passagens e infrações do período
- Interrupções e impacto na meta

:::info Boletim
O **Boletim de Medição** gerado pode ser enviado ao contratante como comprovação do cumprimento do SLA.
:::
3. Revise os valores e interrupções
4. Finalize a medição para aprovação

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Contratos](./contratos) | Contrato vinculado |
| Relacionado | [Medicoes Finalizadas](./medicoes-finalizadas) | histórico |
| Glossario | [Medicao de Desempenho](../glossario/medicao-desempenho) | Definicao tecnica |

## Checklist pré-geração de medição

- [ ] Confirmar que todas as **interrupções** do período foram registradas
- [ ] Verificar se os **equipamentos** do contrato estavam ativos no período
- [ ] Validar que nenhum ticket de pesagem relevante está com status **Aberto**
- [ ] Confirmar as metas de SLA definidas no contrato estão atualizadas
- [ ] Revisar o período selecionado (mês/ano corretos)
- [ ] Exportar o boletim em PDF após finalizar para envio ao contratante

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Índice de disponibilidade incorreto | Interrupções não registradas antes da geração | Registrar todas as paradas antes de gerar a medição |
| Não é possível gerar medição | Contrato inativo ou sem equipamentos vinculados | Verificar status do contrato e vínculos de equipamentos |
| Boletim gerado com dados incompletos | Período de referência incorreto | Conferir datas de início e fim da medição antes de gerar |

## Perguntas frequentes

**Com que frequência devo gerar a medição?**
A medição deve ser gerada mensalmente, ao final de cada mês de referência, após registrar todas as interrupções e validar os dados do período.

**Posso corrigir uma medição já finalizada?**
Não. Após finalizada, a medição é bloqueada. Erros devem ser documentados e corrigidos na medição do próximo período ou via ajuste manual pelo suporte técnico.

**Por que o índice de disponibilidade saiu maior do que o esperado?**
Interrupções não registradas antes da geração não entram no cálculo. Registre todas as paradas antes de gerar a medição.

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Contratos](./contratos)** | A medição é gerada a partir de um contrato ativo; os equipamentos e metas do contrato determinam o conteúdo do boletim |
| **[Interrupções](./interrupcoes)** | Todas as interrupções do período precisam estar registradas antes de gerar a medição para que o cálculo de disponibilidade seja correto |
| **[Índices de Performance](./indices-performance)** | Os índices vinculados ao contrato são calculados automaticamente durante a geração e exibidos no boletim |
| **[Medições Finalizadas](./medicoes-finalizadas)** | Após a finalização, a medição fica disponível no histórico de Medições Finalizadas para consulta e exportação |

## Ciclo mensal

| Dia | Atividade |
|-----|----------|
| **1-5 do mês** | Registrar interrupções pendentes do mês anterior |
| **5-10 do mês** | Gerar a medição em **Medição → Nova Medição** |
| **10 do mês** | Revisar índices: disponibilidade, OCR e volume de infrações |
| **Até prazo contratual** | Exportar Boletim PDF e enviar ao contratante |
| **Após envio** | Arquivar cópia do boletim por no mínimo 5 anos |

:::warning
Interrupções não registradas **antes** da geração da medição não entram no cálculo. Registre em tempo real.
:::
