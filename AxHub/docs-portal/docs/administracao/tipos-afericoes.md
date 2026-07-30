---
sidebar_position: 14
title: Tipos de Aferições
description: Cadastro de tipos de aferições metrológicas no AxHub
---

# Tipos de Aferições

Define as **categorias de aferição metrológica** realizadas nos equipamentos de fiscalização, conforme exigêancia do INMETRO.

## Como acessar

**Menu lateral** → Configurações → **Tipos de Aferições**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Tipo da aferição (ex: "Aferição Inicial", "Aferição Periódica") |
| **Descrição** | Não | Detalhamento do procedimento |
| **Validade (dias)** | Sim | Prazo de validade em dias |

## Tipos padrão

| Tipo | Descrição | Validade Comum |
|------|-----------|:--------------:|
| Aferição Inicial | Primeira verificação antes do uso | 1 ano |
| Aferição Periódica | Renovação anual obrigatória | 1 ano |
| Aferição Pós-Manutenção | Após intervenção técnica | Até próxima periódica |

:::info
Equipamentos com aferição vencida não podem gerar infrações válidas legalmente. O sistema exibe alerta quando a data de vencimento se aproxima.
:::

## Boas práticas

- Configure corretamente a **Validade (meses)** de cada tipo — o sistema usa esse prazo para alertar sobre vencimentos
- Alinhe os tipos padrão (Inicial, Periódica, Pós-Manutenção) com as exigências da Portaria INMETRO vigente
- Não exclua tipos já usados em aferições históricas — inative-os para preservar os registros
- O tipo **Aferição Extraordinária** deve ser usado apenas após manutenções com troca de componentes metrológicos

## Relacionado

- [Aferições](../operacoes/afericoes)
- [Aferição](../glossario/afericao)
- [Falhas de Sequenciais](../relatorios/falhas-sequenciais)

## Fluxo de aferição

1. Equipamento instalado ou após manutenção — acionar INMETRO para **Aferição Inicial**
2. Certificado emitido pelo INMETRO — cadastrar em **Operações → Aferições**
3. Sistema monitora o vencimento automaticamente
4. Próximo ao vencimento — sistema exibe alerta; acionar INMETRO com antecedência
5. Após nova verificação — registrar **Aferição Periódica** com novo certificado

## Tabela de referência — prazos e validades

| Tipo | Quando usar | Validade comum | Base legal |
|------|-------------|:--------------:|------------|
| Aferição Inicial | Instalação ou substituição | 1 ano | Portaria INMETRO |
| Aferição Periódica | Renovação anual | 1 ano | Portaria INMETRO |
| Aferição Pós-Manutenção | Após intervenção técnica | Até próxima periódica | Portaria INMETRO |
| Aferição Extraordinária | Exigência legal ou contratual | Variável | Contrato / órgão |

:::

|-------|-----------|
| **Código** | Código identificador |
| **Descrição** | Tipo da aferição (ex: Inicial, Periódica, Eventual) |
| **Validade (meses)** | Prazo de validade padrão |
| **Ativo** | Status do registro |

:::note Sem screenshot
está tela ainda não possui screenshot cadastrada. Será adicionada em breve.
:::

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Afericoes (Operacoes)](../operacoes/afericoes) | Uso operacional |
| Glossario | [Afericao](../glossario/afericao) | Definicao tecnica |
