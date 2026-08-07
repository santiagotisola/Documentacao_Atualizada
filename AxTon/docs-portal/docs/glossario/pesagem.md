---
sidebar_position: 1
title: "Pesagem"
description: "O que é pesagem no AxTon — fluxo completo, tipos e base legal"
---

# Pesagem

![Iniciar Pesagem](../img/inicar%20pesagem.png)

Processo de **verificação metrológica do peso** de veículos em postos fiscalizados. O AxTon controla todo o ciclo: da chegada do veículo à geração de infração por excesso de peso.

**Base legal:** Resolução CONTRAN 803/2021 — Lei 9.503/97 (CTB)

## Fluxo completo

```
Veículo chega ao posto
      ↓
   Passagem registrada
      ↓
   Pesagem (balança)
      ↓
   Classificação do veículo
      ↓
   Comparação com PBT
      ↓
   Regular (liberação) ou Infrator (retenção)
```

## Relacionado

- [PBT](./pbt) — Peso Bruto Total
- [Infração](./infracao)
- [Reclassificar](../pesagem/reclassificar)

## Tipos de balança

| Tipo | Velocidade | Uso |
|------|:----------:|-----|
| Estática | 0 km/h | Alta precisão, veículo parado |
| Semiestática | ≤5 km/h | Veículo em baixa velocidade |
| Dinâmica (WIM) | Até 80 km/h | Triagem rápida sem parar o tráfego |

## Fluxo de pesagem

```
Veículo chega ao posto
    ↓
Classificação automática (número de eixos)
    ↓
Pesagem na balança
    ↓
Comparação com PBT da classificação
    ↓
    ├─ Dentro do limite → Ticket Fechado (Regular)
    └─ Excedeu o limite → Infração gerada
```

:::tip
A balança dinâmica é usada para triagem rápida. Veículos que ultrapassam o limiar são direcionados para confirmação em balança estática.
:::

:::tip
A balança dinâmica é usada para triagem rápida. Veículos que ultrapassam o limiar são direcionados para confirmação em balança estática ou semiestática.
:::

## Base legal

- **Resolucao CONTRAN 803/2021** — limites de PBT por categoria
- **Lei 9.503/97 (CTB)** — Art. 231 — penalidades por excesso de peso
- **Portaria INMETRO** — requisitos metrológicos das balanças


:::tip
A balança dinâmica é usada para triagem rápida. Veículos que ultrapassam o limiar são direcionados para confirmação em balança estática.
:::| Estática | 0 km/h | Alta precisão, veículo parado |
| Semiestática | ≤5 km/h | Veículo em baixa velocidade |
| Dinâmica | Até 80 km/h | Triagem, sem interrupção do fluxo |

   Verificação de excesso
      ↓
   Infração gerada (se excesso) OU liberado
      ↓
   Triagem → Auditoria → Exportação
```

## Tipos de pesagem

| Tipo | Descrição |
|------|-----------|
| **Estática** | Veículo parado, maior precisão |
| **Dinâmica** | Veículo em movimento, agilidade operacional |
| **Semiestática** | Velocidade reduzida |

## Limites legais (CONTRAN 803/2021)

| Eixo | Peso máximo |
|------|------------|
| Simples | 10 toneladas |
| Tandem duplo | 17 toneladas |
| Tandem triplo | 25,5 toneladas |
| PBT máximo | 57 toneladas |

## Tolerâncias

- **5%** para equipamentos estáticos calibrados (INMETRO)
- **10%** para equipamentos dinâmicos

## Relacionados

- [Triagem](./triagem) — Processo após a pesagem
- [PBT](./pbt) — Peso Bruto Total
- [Infração](./infracao) — Resultado de excesso

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Infração gerada com peso abaixo do limite | Tolerância não configurada corretamente | Revisar o parâmetro de tolerância nas Configurações do Sistema |

## Contexto operacional

A **pesagem** é o processo físico que dá origem a todo o fluxo de fiscalização do AxTon. Do ponto de vista do operador, cada ticket de pesagem representa um veículo que passou pela balança e cujo peso foi comparado ao limite legal: veículos dentro do limite são liberados imediatamente; veículos com excesso entram na fila de triagem aguardando validação.

Para o supervisor, a qualidade das pesagens depende diretamente da aferição da balança e da calibração das tolerâncias. Tolerâncias muito baixas geram infrações indevidas para veículos dentro do limite legal; tolerâncias muito altas permitem que veículos com excesso real circulem sem autuação, comprometendo tanto a segurança viária quanto a efetividade contratual.

Para o gestor, o volume diário de pesagens é o principal indicador de produtividade do posto. O relatório de **Fluxo Diário de Veículos** permite comparar o volume por dia da semana e identificar períodos de pico para dimensionamento de equipe. Quedas bruscas no volume indicam falha de equipamento e devem ser investigadas imediatamente para não comprometer o SLA contratual.
| Balança não conecta ao sistema | URL ou porta da balança HAENNI incorreta | Verificar as configurações na aba **HAENNI** do Sistema |
| Peso registrado incorretamente | Balança com certif. vencido | Verificar a data de aferíção e acionar renovação do certificado |

## Perguntas frequentes

**Qual a diferença entre balança estática e dinâmica?**
A balança estática exige que o veículo pare completamente e oferece maior precisão. A dinâmica (WIM) mede em movimento com velocidade reduzida, sendo usada para triagem rápida antes da confirmação estática.

**A tolerância de 5% ou 10% é aplicada automaticamente pelo sistema?**
Sim. O AxTon aplica a tolerância configurada nas **Configurações do Sistema** antes de gerar a infração. O excesso é calculado sobre o peso aferido menos a tolerância.

**Pesagem realizada com aferição vencida gera infração válida?**
Não. Infrações geradas com balança sem aferição válida do INMETRO podem ser contestadas juridicamente. Mantenha o certificado sempre dentro do prazo.

## Integração com outros módulos

| Módulo | Como usa este cadastro/relatório |
|--------|----------------------------------|
| **PBT** | O peso aferido na balança é comparado ao PBT máximo da classificação do veículo para decidir se há excesso |
| **Classificações de Veículos** | O sistema identifica a classificação (eixos) do veículo para determinar qual limite de PBT aplicar |
| **Triagem** | Após a pesagem detectar excesso, a infração gerada entra na fila de triagem para validação |
| **Sistema → Configurações** | Tipo de balança, tolerâncias e parâmetros de pesagem são definidos nas Configurações do Sistema |

