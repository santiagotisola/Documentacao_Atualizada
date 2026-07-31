---
sidebar_position: 5
title: "Infração de Trânsito"
description: "O que é uma infração no AxTon — tipos, fluxo e base legal"
---

# Infração de Trânsito

Desobeidiência à legislação de trânsito. No AxTon, uma infração é gerada automaticamente quando um veículo ultrapassa o **limite de peso** permitido por eixo ou pelo Peso Bruto Total (PBT).

**Base legal:** Art. 161 e 231 do CTB — Resolução CONTRAN 803/2021

## Ciclo de vida da infração

```
Pesagem detecta excesso
      ↓
   Infração gerada automaticamente
      ↓
   Triagem (validação humana)
      ↓
   Auditoria (revisão e aprovação)
      ↓
   Exportação ao órgão autuador
      ↓
   Auto de infração emitido
```

## Tipos de excesso

| Tipo | Art. CTB | Gravidade |
|------|:--------:|:---------:|
| Excesso de PBT | 231, I | Gravíssima |
| Excesso por eixo | 231, II | Gravíssima |

## Penalidade

| Excesso | Sanção |
|---------|----------|
| Até 5% | Multa + retenção |
| Acima de 5% | Multa + retenção + remoção ao pátio |

## Fluxo da infração

```
Pesagem detecta excesso
    ↓
Infração gerada automaticamente
    ↓
Triagem (validação humana)
    ↓
Auditoria (supervisor)
    ↓
Exportação ao órgão autuador
    ↓
Auto de Infração emitido ao infrator
```

## Erros comuns

| Erro | Impacto | Prevenção |
|------|---------|----------|
| Veículo reclassificado incorretamente | Infração inválida | Verificar número de eixos e PBT |
| Aferição vencida | Infração bloqueada | Renovar certificação INMETRO antes do vencimento |
| Excesso calculado com tolerância errada | Auto incorreto | Conferir configuração da balança |

- [PBT](./pbt)
- [Reclassificar](../pesagem/reclassificar)
- [Triagem](./triagem)
- [Relatório de Infrações](../relatorios/relatorio-infracoes)

   Notificação ao infrator
```

## Tipos de infração por excesso de peso

| Excesso | Enquadramento CTB | Gravidade |
|---------|------------------|-----------|
| Até 5% (tolerância) | Não infraciona | — |
| 5% a 15% | Art. 231, V | Grave |
| 15% a 30% | Art. 231, V | Gravíssima |
| Acima de 30% | Art. 231, V | Gravíssima + extra |

## Dados da infração

| Campo | Descrição |
|-------|-----------|
| Número | Identificador único da infração |
| Placa | Placa do veículo infrator |
| Peso aferido | Peso registrado na balança |
| Peso máximo | Limite legal para o eixo |
| Excesso | Diferença em toneladas e percentual |
| Equipamento | Balança que realizou a aferição |
| Data/Hora | Momento do registro |

## Relacionados

- [Triagem](./triagem) — Processo de validação
- [Pesagem](./pesagem) — Processo de origem
- [PBT](./pbt) — Peso Bruto Total

## Perguntas frequentes

**Qual o prazo para triar uma infração de excesso de peso após a pesagem?**
O prazo máximo para lavrar o auto é definido pelo CTB e pelo órgão autuador. Monitore o backlog diariamente para evitar prescrição de infrações não triadas.

**Infração com veicu classificado incorretamente pode ser cancelada?**
Sim. Reclassifique o veículo antes de exportar. Se o novo PBT enquadrar o peso dentro do limite, a infração é cancelada automaticamente.

**Uma infração já exportada pode ser cancelada?**
Não diretamente pelo sistema. Após exportação, o cancelamento deve ser solicitado formalmente ao órgão autuador.

## Base legal

| Dispositivo | Contéudo |
|-------------|----------|
| **Art. 161, CTB** | Infração de trânsito: inobservância de qualquer preceito do CTB |
| **Art. 231, V, CTB** | Exceder o peso máximo permitido — gravíssima |
| **Resolução CONTRAN 803/2021** | Limites de PBT por configuração de eixos |
| **Art. 281, CTB** | Prazo de 30 dias para expedir o AIT após a infração |

## Integração com outros módulos

| Módulo | Como usa este cadastro/relatório |
|--------|----------------------------------|
| **Pesagem** | A pesagem com excesso de PBT é o processo que gera a infração automaticamente no sistema |
| **PBT** | O limite de PBT da classificação do veículo define o limiar de excesso que aciona a infração |
| **Triagem** | Infrações precisam ser validadas pelo operador na triagem antes de prosseguir para exportação |
| **Relatório de Infrações** | Exibe o histórico consolidado de infrações por posto, período, placa e status de exportação |
