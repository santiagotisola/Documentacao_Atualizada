---
sidebar_position: 3
title: Faixas
description: Cadastro de faixas monitoradas no AxCross — configuração de vias por cruzamento
---

# Faixas

Configuração das faixas de monitoramento em cada cruzamento. Cada faixa representa uma via física monitorada por equipamentos de fiscalização. Uma faixa precisa existir para que passagens sejam registradas e alertas gerados.

## Como acessar

No **menu lateral**, expanda **Cadastros** e clique em **Faixas**.

:::info Permissão necessária
`equipment.lane` — criar faixa | `equipment.deletelane` — excluir
:::

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Local** | Sim | Cruzamento onde a faixa está localizada |
| **Número da Faixa** | Sim | Identificador numérico (1, 2, 3...) |
| **Sentido** | Sim | Sentido do fluxo (Norte, Sul, Leste, Oeste, Centro/Bairro) |
| **Equipamento** | Sim | Equipamento vinculado à faixa |
| **Velocidade Máxima** | Não | Velocidade máxima regulamentada (km/h) |
| **Status** | Sim | Ativa ou Inativa |

## Passo a passo — Cadastrar nova faixa

1. Acesse **Cadastros → Faixas** no menu lateral
2. Clique em **Nova Faixa**
3. Selecione o **Local** (cruzamento)
4. Informe o **Número da Faixa** e o **Sentido**
5. Vincule ao **Equipamento** monitorante
6. Opcionalmente informe a **Velocidade Máxima**
7. Clique em **Salvar**

:::warning Atenção
Apenas uma faixa pode estar ativa por equipamento por vez. Verifique antes de ativar uma nova faixa no mesmo equipamento.
:::

## Relação Arco → Faixa → Passagem

```
Arco (estrutura física)
  └── Faixa 1 → Equipamento OCR01 → Passagens registradas
  └── Faixa 2 → Equipamento OCR02 → Passagens registradas
```

## Boas práticas

- O código da faixa deve ser **exatamente igual** ao configurado no equipamento físico — qualquer divergência causa erro na geração de alertas
- Informe corretamente o **Sentido** da faixa (ex.: Norte-Sul, Leste-Oeste) para relatórios de fluxo direcional
- Vincule a faixa ao equipamento correto; faixas sem equipamento não registram passagens
- Não exclua faixas com histórico de passagens — inative-as para preservar a rastreabilidade dos registros

## Relacionado

- [Locais](./locais)
- [Equipamentos](./equipamentos)
- [Passagens](../glossario/passagem)


:::tip Dica
O código da faixa deve ser exatamente igual ao configurado no equipamento físico. Qualquer divergência causa erros na geração de alertas.
:::

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Relacionado | [Equipamentos](./equipamentos) | Equipamento da faixa |
| Relacionado | [Locais](./locais) | Cruzamento da faixa |

4. Informe o **Número da Faixa** e **Sentido**
5. Vincule o Equipamento responsável pelo monitoramento
6. Opcionalmente, defina a **Velocidade Máxima**
7. Clique em **Salvar**

:::info Dependência
Para cadastrar uma faixa, é necessário que o local e o Equipamento já estejam cadastrados.
:::
