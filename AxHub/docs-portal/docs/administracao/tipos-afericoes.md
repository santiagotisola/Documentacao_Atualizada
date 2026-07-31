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

## Integração com outros módulos

| Módulo | Como usa este cadastro |
|--------|----------------------|
| **Aferições (Operações)** | Cada registro de aferição exige a seleção de um tipo cadastrado aqui; sem tipos ativos, não é possível registrar novas aferições |
| **Equipamentos** | O sistema monitora o vencimento com base no tipo e na data do último registro de aferição do equipamento |
| **Tarjas** | A data de aferição e o certificado exibidos na tarja vêm do último registro de aferição vinculado ao tipo correto |
| **Monitoramento Online** | Exibe alerta de aferição vencida quando o prazo do tipo cadastrado é ultrapassado |
## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Aferíção não aparece para registro | Tipo de aferíção inativo | Ativar o tipo de aferíção nas configurações |
| Alerta de vencimento não gerado | Prazo de validade não configurado no tipo | Definir a validade em dias no cadastro do tipo |
| Equipamento com certif. vencido gera infrações | Tipo incorreto selecionado no último registro | Corrigir o tipo de aferíção no registro e atualizar a data |

## Configuração típica

**Tipos de aferição obrigatórios (configuração inicial do sistema):**

| Tipo | Validade (dias) | Quando usar |
|------|:--------------:|-------------|
| Aferição Inicial | 365 | Instalação do equipamento ou substituição de componente |
| Aferição Periódica | 365 | Renovação anual obrigatória pelo INMETRO |
| Aferição Pós-Manutenção | 365 | Após qualquer intervenção técnica no equipamento |
| Aferição Extraordinária | 180 | Por exigência do órgão contratante ou incidente |

Configure esses quatro tipos antes de iniciar os registros de aferição. Sem eles, não é possível cadastrar certificados em **Operações → Aferições**.
## Perguntas frequentes

**Quantos tipos de aferição devo cadastrar?**
Ao menos três: Inicial, Periódica e Pós-Manutenção. Acrescente outros somente se exigido pela Portaria INMETRO ou contrato.

**O sistema bloqueia infrações automaticamente quando a aferição vence?**
O sistema exibe alertas de vencimento, mas o bloqueio automático depende da configuração. Consulte o suporte para habilitar o bloqueio preventivo.

**Posso alterar a validade de um tipo de aferição já em uso?**
Sim. A alteração afeta apenas novos registros; aferições já cadastradas mantêm a data de vencimento original calculada.
