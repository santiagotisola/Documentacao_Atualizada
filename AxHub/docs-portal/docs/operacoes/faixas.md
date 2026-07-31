---
sidebar_position: 2
title: Faixas
description: Configuração de faixas de fiscalização por operação
---

# Faixas

Permite configurar as faixas de monitoramento de cada operação. Cada faixa representa uma pista de rolamento monitorada por um Equipamento de fiscalização.

![Lista de Faixas](../img/Operações%20-%20Faixas.png)

## Como acessar

**Menu lateral** → Operações → **Faixas**

## Cadastro de faixa

![Cadastro de Faixa](../img/Operações%20-%20Faixas%20-%20cadatro.png)

| Campo | Descrição |
|-------|-----------|
| **Código** | Código identificador da faixa (ex: GYNTM015-1) |
| **Operação** | Operação vinculada |
| **Número da Faixa** | Número sequencial da faixa no Equipamento |
| **Sentido** | Sentido de tráfego monitorado (Norte/Sul, Leste/Oeste, etc.) |
| **Logradouro** | Endereço/via onde a faixa está localizada |
| **Bairro** | Bairro da localização |
| **Município** | Município onde a faixa opera |
| **UF** | Estado (ex: GO, SP, MA) |
| **Código do Município** | Código IBGE do município (ex: Goiânia = 5208707) |

### Código do Município (IBGE)

O campo **Código do Município** é essencial para a exportação de Infrações Ele deve corresponder ao código IBGE oficial do município onde a faixa opera.

![Correção do Código do Município na Faixa](../img/operacao%20-%20faixa%20-%20codigo%20do%20municipio%20%20correção%20na%20faixa%203.png)

:::warning Importante
O código do município na faixa **deve ser o mesmo** da UF da operação. Se a operação é em Goiânia/GO, todas as faixas devem ter o código IBGE de um município de GO. Um código de município divergente (ex: código de MA em operação de GO) gera **erro na exportação** de Infrações.
:::

## Boas práticas

- Valide o código IBGE do município antes de salvar a faixa — é o campo que mais causa erros na exportação
- Use códigos de faixa padronizados e consistentes com o contrato (ex: sigla da operação + número sequencial)
- Ao alterar o sentido de uma faixa, verifique se os equipamentos associados refletem a mudança no campo

## Relacionado

- [Operações](./cadastro-operacoes) — Operação que contém as faixas
- [Municípios](../veiculos/municipios) — Consulta de código IBGE por município
- [Enquadramentos](../administracao/configuracoes-enquadramento) — Configuração por operação/faixa

## Exemplos de cadastro de faixa

| Campo | Exemplo | Observação |
|-------|---------|------------|
| Código | `GYNTM015-1` | Sigla da operação + número da faixa |
| Operação | Goiânia TM-015 | Operação já cadastrada |
| Número da Faixa | 1 | Primeira faixa do equipamento |
| Sentido | Norte/Sul | Conforme instalação física |
| Logradouro | Av. Anhanguera | Via oficial |
| Código IBGE | 5208707 | Goiânia/GO |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Exportação falha por código IBGE | Código do município incorreto | Conferir com tabela IBGE e corrigir |
| Infração sem enquadramento | Faixa não vinculada ao enquadramento | Configurar em Configurações de Enquadramento |
| Sentido trocado no relatório | Sentido configurado errado | Editar faixa e corrigir sentido |
| Faixa sem passagens | Equipamento desvinculado | Verificar cadastro do equipamento |

## Perguntas frequentes

**Por que meu lote foi rejeitado com erro de código IBGE?**
O código IBGE na faixa deve ter 7 dígitos e corresponder ao município correto da operação. Consulte ibge.gov.br/cidades para confirmar o código antes de corrigir.

**Posso ter a mesma faixa em duas operações diferentes?**
Sim. Uma faixa pode ser reutilizada em operações distintas, mas apenas uma operação pode estar ativa por vez para o mesmo equipamento/faixa para evitar conflito de dados.

**O sentido da faixa impacta na exportação?**
Sim. O sentido é exigido em alguns layouts de exportação e aparece no relatório de passagens. Configure corretamente conforme a instalação física do equipamento.
