---
sidebar_position: 2
title: Índices de Performance
description: Configuração de índices de performance contratual
---

# Índices de Performance

Permite configurar os índices de performance exigidos pelos contratos.

![Lista de Índices](../img/Medição%20-%20indice%20de%20performance.png)

## Como acessar

**Menu lateral** → Medição → **Índices de Performance**

## Cadastro

![Cadastro de Índice](../img/Medição%20-%20indice%20de%20performance%20-%20cadastro.png)
## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome do índice |
| **Métrica** | Sim | O que será medido (ex.: disponibilidade) |
| **Meta (%)** | Sim | Valor mínimo exigido pelo contrato |
| **Tolerância (%)** | Não | Margem aceita antes da penalidade |
| **Penalidade** | Não | Descrição da penalidade contratual |

## Índices comuns

| Índice | Meta típica |
|--------|:-----------:|
| Disponibilidade | 95% |
| Aproveitamento OCR | 90% |
| Tempo de manutenção | ≤4h/mês |

## Como os índices são calculados

1. Ao gerar uma medição, o sistema acessa os índices cadastrados
2. Compara os dados apurados do período com as metas
3. Gera o **Boletim de Medição** com status: ✅ Dentro da meta ou ❌ Abaixo da meta

## Boas práticas

- Revise as metas sempre que houver aditivo contratual — índices desatualizados geram boletins incorretos
- Defina a tolerância para não penalizar variações pontuais que não representam falha sistemática
- Inclua **todos** os índices exigidos pelo contrato; índices ausentes não aparecem no boletim
- Documente o método de apuração de cada métrica para facilitar discussões com o contratante

:::tip
Os índices configurados aqui são calculados automaticamente ao gerar uma nova medição. Manter as metas atualizadas de acordo com o contrato vigente evita distorções no boletim.
:::

## Fluxo de gestão de índices

1. Consultar o contrato para identificar todas as metas de performance exigidas
2. Acessar **Medição → Índices de Performance** e criar um índice para cada meta contratual
3. Preencher **Nome**, **Métrica** e a **Meta (%)** exata prevista em contrato
4. Definir **Tolerância (%)** para evitar penalidades em variações pontuais
5. Mensalmente, gerar a medição — o sistema calculará cada índice automaticamente
6. Revisar o Boletim: índices abaixo da meta indicam não-conformidade e podem gerar glosa

## Tabela de referência — índices comuns e fórmulas

| Índice | Descrição | Meta típica | Fórmula básica |
|--------|-----------|:-----------:|----------------|
| **Disponibilidade** | % do tempo operacional do equipamento | ≥ 95% | (horas ativas / horas contratuais) × 100 |
| **Aproveitamento OCR** | % de imagens com placa reconhecida | ≥ 90% | (reconhecidas / total) × 100 |
| **Infrações exportadas** | % de infrações enviadas ao órgão | ≥ 98% | (exportadas / geradas) × 100 |
| **Tempo de manutenção** | Horas de parada por falha | ≤ 4h/mês | Soma das interrupções corretivas |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Índice não aparece no boletim | Índice não cadastrado | Criar o índice em Medição → Índices de Performance |
| Meta incorreta no boletim | Aditivo contratual não atualizado | Editar o índice com a nova meta |
| Disponibilidade calculada errada | Interrupção não registrada | Registrar a interrupção retroativamente em Medição → Interrupções |
| Boletim sem nenhum índice calculado | Contrato sem índices vinculados | Verificar a vinculação dos índices ao contrato |

## Relacionado

- [Contratos](./contratos)
- [Criar Medição](./criar-medicao)
- [Interrupções](./interrupcoes)

## Perguntas frequentes

**Preciso cadastrar um índice para cada mês ou ele é reutilizado?**
O mesmo índice é aplicado em todas as medições do contrato. Caso a meta mude por aditivo, edite o índice — o novo valor será usado na próxima medição gerada.

**O que acontece quando um índice fica abaixo da meta?**
O boletim de medição marca o índice com status ❌. Dependendo do contrato, pode haver glosa no pagamento mensal. Documente a causa e as ações corretivas para apresentar ao contratante.

**Posso ter índices diferentes por equipamento dentro do mesmo contrato?**
Sim. Configure um índice específico para cada equipamento ou grupo, vinculando ao mesmo contrato com metas distintas conforme as cláusulas contratuais.
