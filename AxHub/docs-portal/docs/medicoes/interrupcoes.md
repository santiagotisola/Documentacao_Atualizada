---
sidebar_position: 4
title: Interrupções
description: Registro e processamento de interrupções contratuais
---

# Interrupções

Permite registrar interrupções no funcionamento dos Equipamentos que impactam a medição contratual.

![Lista de Interrupções](../img/Medição%20-%20interrupções.png)

## Como acessar

**Menu lateral** → Medição → **Interrupções**

## Cadastro de interrupção

![Cadastro de Interrupção](../img/Medição%20-%20interrupções.-%20cadastro.png)

| Campo | Descrição |
|-------|-----------|
| Equipamento | Equipamento afetado |
| **Data/Hora Início** | Início da interrupção |
| **Data/Hora Fim** | Fim da interrupção |
| **Motivo** | Causa da interrupção |
| **Justificativa** | Detalhamento |

## Processar interrupções

Após registrar as interrupções, o sistema as contabiliza no cálculo de disponibilidade da próxima medição gerada.

| Tipo | Desconta da meta? |
|------|:-----------------:|
| Manutenção preventiva programada | Não |
| Falha de equipamento | Sim |
| Evento externo (acidente, obra) | Conforme contrato |

:::warning
Interrupções não registradas **não são consideradas** no cálculo de disponibilidade. Registrar imediatamente após a ocorrência.
:::

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Interrupção sem data/hora fim | Esquecimento | Corrigir antes de gerar medição |
| Tipo errado atribuido | Preventiva x corretiva confundidas | Revisar e corrigir o tipo |
| Interrupção não aparece na medição | Cadastro após geração | Reabrir medição e recalcular |

## Relacionado

- [Criar Medição](./criar-medicao)
- [Índices de Performance](./indices-performance)
- [Eventos de Equipamentos](../relatorios/eventos-equipamentos)

| Tipo | Prazo máximo |
|------|:------------:|
| Falha de equipamento | Até 2h após detecção |
| Manutenção preventiva | Antes de iniciar |
| Evento externo | Até 24h |

## Impacto contratual

- Interrupções não registradas antes da geração da medição **não são computadas** no desconto de disponibilidade
- Cada hora não registrada infla artificialmente o índice de disponibilidade, podendo mascarar inadimplemento contratual
- Registre dentro do prazo máximo definido — interrupções fora do prazo podem ser contestadas pelo contratante
- Use o Relatório de Eventos de Equipamentos para cruzar registros de falha com as interrupções cadastradas

## Relacionado

- [Criar Medição](./criar-medicao)
- [Índices de Performance](./indices-performance)
- [Eventos de Equipamentos](../relatorios/eventos-equipamentos)

| Falha de equipamento | Sim |
| Evento externo (acidente, obra) | Conforme contrato |

:::warning
Interrupções não registradas **não são consideradas** no cálculo de disponibilidade. Registrar imediatamente após a ocorrência.
:::

![Processar Interrupções](../img/Medição%20-%20interrupções%20-%20processar%20interrupções.png)

Processa as interrupções registradas para abatimento na medição contratual.

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Contratos](./contratos) | Contrato afetado |
| Relacionado | [Criar Medicao](./criar-medicao) | Impacto na medicao |

## Perguntas frequentes

**Interrupções de manutenção preventiva descontam da disponibilidade?**
Depende do contrato. Manutenções preventivas programadas geralmente não descontam; interrupções corretivas (falha) sim. Verifique as cláusulas contratuais e cadastre o tipo correto.

**Posso registrar uma interrupção retroativamente após a medição ser gerada?**
Não. Interrupções devem ser registradas antes da geração da medição. Após finalizar, é necessário reabrir a medição com autorização do supervisor para incluir interrupções esquecidas.

**Qual o prazo máximo para registrar uma interrupção?**
Registre imediatamente após o equipamento voltar à operação. O prazo máximo depende do contrato, mas o recomendado é até 24 horas após a normalização.
