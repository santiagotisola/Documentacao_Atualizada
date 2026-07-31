---
sidebar_position: 2
title: "PBT (Peso Bruto Total)"
description: "O que é PBT no AxTon — cálculo, limites legais e enquadramento"
---

# PBT — Peso Bruto Total

Peso máximo permitido para circulação de um veículo, considerando sua classificação, número de eixos e tipo de carga. Veículos que ultrapassam o PBT estão sujeitos a autuação e retenção.

**Base legal:** Art. 99 do CTB — Resolução CONTRAN 803/2021

## Fórmula

```
PBT = Tara (peso do veículo vazio) + Carga (peso da mercadoria)
```

## Limites por configuração de eixos (CONTRAN 803/2021)

| Configuração | PBT Máximo |
|--------------|------------|
| 2 eixos | 16 toneladas |
| 3 eixos | 23 toneladas |
| 4 eixos | 29 toneladas |
| 5 eixos (bitrem) | 41,5 toneladas |
| 6 eixos (bitrem) | 45 toneladas |
| 9 eixos (rodotrem) | 57 toneladas |

## Tolerâncias

| Condição | Tolerância |
|----------|:----------:|
| Balança estática verificada | ±4% |
| Balança dinâmica | ±6% |

## Penalidade por excesso

| Faixa de excesso | Sancão |
|------------------|---------|
| Até 5% | Multa (gravíssima) + retenção até regularizar |
| 5-10% | Multa (gravíssima) + retenção obrigatória |
| Acima de 10% | Multa + remoção ao pátio credenciado |

:::warning
A retenção do veículo é obrigatória quando o excesso impede continúar a viagem com segurança. O veículo só é liberado após descarga suficiente.
:::

## Consequencias do excesso de PBT

| Excesso | Penalidade |
|---------|------------|
| Até 10% | Infração gravíssima + retenção |
| Acima de 10% | Infração gravíssima + recolhimento ao pátio |

## Base legal

- **Resolução CONTRAN nº 803/2021** — tabela de classificação de veículos e limites de PBT por número de eixos
- **Art. 99 do CTB (Lei nº 9.503/1997)** — responsabilidade do condutor e transportador pelo excesso de peso
- **Portaria DENATRAN nº 63/2009** — tolerâncias de pesagem e procedimentos de fiscalização em via
- **Resolução CONTRAN nº 425/2013** — limites máximos de peso e dimensões para veículos de carga

## Relacionado

- [Classificações de Veículos](../veiculos/classificacoes-veiculos)
- [Infração](./infracao)


## Consequencias do excesso

| Excesso | Penalidade |
|---------|------------|
| Até 10% | Infração grave + retenção até regularização |
| Acima de 10% | Infração gravíssima + recolhimento ao pátio |

## Relacionado

- [Classificações de Veículos](../veiculos/classificacoes-veiculos)
- [Pesagem](./pesagem)


| Tipo de equipamento | Tolerância |
|---------------------|------------|
| Balança estática INMETRO | 5% |
| Balança dinâmica | 10% |

## Como o AxTon verifica

1. Veículo passa pela balança
2. Sistema identifica categoria pelo OCR + dados do MDF-e
3. Compara peso aferido com PBT máximo da categoria
4. Excedeu o limite → gera infração automaticamente

## Relacionados

- [Pesagem](./pesagem) — Processo de verificação
- [Infração](./infracao) — Gerada quando PBT é excedido
- [MDF-e](./mdfe) — Documento que informa a carga transportada

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Infração gerada para veículo dentro do limite | Classificação incorreta selecionada na pesagem | Usar a função Reclassificar para corrigir |
| PBT máximo incorreto para a classificação | Valor desatualizado no cadastro | Revisar a legislação vigente e atualizar o PBT no cadastro de Classificações |
| Veículo com AEP não reconhecido | Autorização não cadastrada no sistema | Cadastrar a exceção ou AEP antes de realizar a pesagem |

## Perguntas frequentes

**O PBT inclui o peso da cabine do motorista?**
Sim. PBT = tara total do veículo (incluindo motorista e combustível) + peso da carga.

**Qual a diferença entre PBT e PBTC?**
PBTC (Peso Bruto Total Combinado) é para conjuntos veiculares (cavalo + semi reboque). O PBT se refere ao veículo isolado.

**Veículo de emergência é isento?**
Não. Somente veículos com autorização especial de excesso de peso (AEP) emitida pelo órgão competente.

## Integração com outros módulos

| Módulo | Como usa este cadastro/relatório |
|--------|----------------------------------|
| **Classificações de Veículos** | Cada classificação define o PBT máximo permitido para aquela configuração de eixos |
| **Pesagem** | O peso aferido na balança é comparado ao PBT da classificação para determinar se há excesso |
| **Infração** | O excesso de PBT é o fato gerador da infração automática de excesso de peso |
| **MDF-e** | O manifesto declara o peso da carga transportada, usado em confronto com o PBT aferido |

