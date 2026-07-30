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

## Relacionado

- [Criar Medição](./criar-medicao)
- [Índices de Performance](./indices-performance)

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
