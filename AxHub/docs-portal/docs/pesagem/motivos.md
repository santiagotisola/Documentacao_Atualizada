---
sidebar_position: 2
title: Motivos
description: Cadastro de motivos de pesagem e liberação de veículos no AxHub
---

# Motivos

Cadastro dos **motivos utilizados nos processos de pesagem e liberação** de veículos. Registrar o motivo correto garante rastreabilidade e base para relatórios gerenciais.

![Lista de Motivos](../img/Balança%20-%20Motivos.png)

## Como acessar

**Menu lateral** → Balança → **Motivos**

## Cadastro de motivo

![Cadastro de Motivo](../img/Balança%20-%20Motivos%20-%20cadastro.png)

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Descrição do motivo |
| **Tipo** | Sim | Pesagem ou Liberação |
| **Status** | Sim | Ativo ou Inativo |

## Motivos de pesagem (exemplos)

| Motivo | Tipo |
|--------|------|
| Pesagem Aleatória | Pesagem |
| Suspeita de Excesso | Pesagem |
| Triagem Dinâmica | Pesagem |
| Liberação por Pagamento | Liberação |
| Liberação por Recurso | Liberação |
| Liberação por Descarga | Liberação |

:::tip
Configurar motivos detalhados facilita a análise gerencial e a identificação de padrões de retenção nos postos.
:::

## Impacto nos relatórios

Os motivos alimentam o **Dashboard gerencial** com:
- Top 5 motivos de liberação sem autuação
- Taxa de liberação por posto
- Evolução mensal por tipo

## Relacionado

- [Liberar Pesagem](./liberar-pesagem)
- [Reclassificar](./reclassificar)
- [Processamento por Usuário](../relatorios/processamento-por-usuario)

## Fluxo de uso dos motivos

1. Veículo pesado e resultado gerado (regular ou infrator)
2. Operador avalia a situação (descarga parcial, recurso, pagamento)
3. Seleciona o **Motivo** correspondente na tela de liberação
4. Sistema registra o motivo vinculado ao ticket
5. Gestores consultam os motivos nos relatórios de produção

## Tabela de referência — motivos e tipos

| Motivo | Tipo | Quando usar |
|--------|------|-------------|
| Pesagem Aleatória | Pesagem | Fiscalização rotineira |
| Su b  Suspeita de Excesso | Pesagem | Veículo com aspecto de sobrecarga |
| Liberação por Pagamento | Liberação | Multa paga no local |
| Liberação por Recurso | Liberação | Motorista apresentou defesa formal |
| Liberação por Descarga | Liberação | Carga removida do veículo |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Motivo genérico aplicado sempre | Falta de orientação à equipe | Treinamento e revisão de tickets |
| Motivo inativo no sistema | Cadastro desatualizado | Reativar ou criar novo motivo |
| Tipo errado selecionado | Pesagem em vez de Liberação | Auditar tickets e corrigir |


## Motivos comuns

| Tipo | Exemplos |
|------|---------|
| **Pesagem** | Peso excessivo confirmado, Veículo suspeito, Fiscalização aleatória |
| **Liberação** | Peso dentro do limite, Erro de captura, Veículo isento |

## Passo a passo

1. Acesse **Balança → Motivos**
2. Clique em **+ Novo**
3. Informe o **Nome** e o **Tipo**
4. Clique em **Salvar**


| Campo | Descrição |
|-------|-----------|
| **Descrição** | Nome do motivo |
| **Tipo** | Liberação, retenção, reclassificação |
| **Ativo** | Se o motivo está disponível para uso |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Reclassificar](./reclassificar) | Usar motivo na reclassificacao |
| Relacionado | [Postos](./postos) | Postos de pesagem |
