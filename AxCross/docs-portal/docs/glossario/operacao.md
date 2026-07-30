---
sidebar_position: 3
title: "Operação"
---

# Operação

Atividade de fiscalização planejada e executada em um ou mais cruzamentos durante um período definido. Agrupa os registros de passagem e permite controle operacional da equipe em campo.

## Ciclo de vida de uma operação

| Status | Descrição |
|--------|-----------|
| **Ativa** | Operação em andamento — Equipamentos monitorando e registrando passagens |
| **Pausada** | Operação temporariamente interrompida — pode ser retomada |
| **Encerrada** | Operação finalizada — dados consolidados para Relatório |

## Campos principais

| Campo | Descrição |
|-------|-----------|
| **Nome** | Identificador da operação (ex.: "Blitz Centro - Mai/2026") |
| **Período** | Início e fim da operação |
| **Equipamentos** | Câmeras e sensores participantes |
| **Responsável** | Agente ou equipe responsável |

## Relacionado

- [Cadastro de Operações](../operacoes/cadastro-operacoes)
- [Passagens](./passagem)

## Ciclo de vida de uma operação

| Status | Descrição |
|--------|-----------|
| **Ativa** | Em andamento — equipamentos monitorando |
| **Pausada** | Temporariamente interrompida |
| **Encerrada** | Finalizada — dados consolidados |

:::tip
Encerre a operação após a atividade de campo para consolidar os dados e liberar os relatórios finais.
:::

## Fluxo de uma operação

```
Criar operação (definir local + equipamentos + período)
    ↓
Iniciar (status: Ativa)
    ↓
Monitorar alertas em tempo real
    ↓
Tratar ocorrências
    ↓
Encerrar (status: Encerrada)
    ↓
Gerar Relatório de Ocorrências
```

## Boas práticas

- Defina o período de fim da operação antes de encerrar — dados fora do período podem ser perdidos
- Vincule os equipamentos certos — equipamentos errados geram alertas na operação incorreta
- Documente o responsável para rastreabilidade em caso de auditoria

- Sempre vincule os equipamentos corretos antes de iniciar a operação
- Encerre a operação no mesmo dia para evitar dados mistos com a operação seguinte
- Registre o responsável para rastreabilidade em caso de auditoria

:::info
Operações encerradas aparecem nos relatórios de **Ocorrências e Alertas**, permitindo análise histórica das atividades de fiscalização.
:::

| **Local** | Cruzamento principal da operação |
| **Data Início** | Data e hora de início |
| **Data Fim** | Data e hora de encerramento previsto |
| **Observações** | Informações complementares para a equipe |

## Relação com outros módulos

- **Veículos Monitorados** — alertas gerados durante a operação são registrados automaticamente
- **Monitoramento Online** — visualização em tempo real das passagens da operação
- **Relatório de Passagens** — consulta dos registros consolidados por período
- **Relatório de Ocorrências** — listagem de alertas gerados durante a operação

Veja o cadastro completo em [Cadastro de Operações](../operacoes/cadastro-operacoes).
