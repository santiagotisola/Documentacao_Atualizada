---
sidebar_position: 2
title: Aferições
description: Controle de aferições e certificados INMETRO dos equipamentos no AxHub
---

# Aferições

Controle das **aferições metrológicas** realizadas nos equipamentos de fiscalização. A aferição válida é requisito legal para que as infrações tenham valor jurídico.

## Como acessar

**Menu lateral** → Operações → **Aferições**

![Lista de Aferições](../img/Operações%20-%20aferição.png)

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Equipamento** | Sim | Equipamento aferição realizada |
| **Tipo de Aferição** | Sim | Inicial, Periódica ou Extraordinária |
| **Data de Emissão** | Sim | Data do certificado INMETRO |
| **Data de Vencimento** | Sim | Data limite de validade |
| **Nº Certificado** | Sim | Número do certificado INMETRO |
| **Observações** | Não | Informações adicionais |

## Passo a passo — Registrar aferição

1. Acesse **Operações → Aferições**
2. Clique em **+ Nova Aferição**
3. Selecione o **Equipamento**
4. Informe o **Tipo** e as datas
5. Digite o **Nº do Certificado**
6. Clique em **Salvar**

:::warning Alerta de vencimento
O Dashboard exibe alertas quando a aferição está próxima do vencimento (30 dias). Após o vencimento, o equipamento é bloqueado automaticamente.
:::

## Navegação Relacionada

| Tipo | Página |
|------|--------|
| Glossario | [Aferição](../glossario/afericao) |
| Relacionado | [Tipos de Aferições](../administracao/tipos-afericoes) |

## Fluxo de controle de aferições

1. **60 dias antes do vencimento**: Dashboard exibe alerta — acionar INMETRO com antecedência
2. **Realização da aferição**: INMETRO emite certificado com número e data de validade
3. **Registro no sistema**: acessar Operações → Aferições e cadastrar o certificado
4. **Validação automática**: sistema libera o equipamento para gerar infrações válidas
5. **Após vencimento**: equipamento bloqueado automaticamente — nenhuma infração válida é gerada

## Tabela de referência — status de aferição

| Status | Condição | Ação imediata |
|--------|----------|---------------|
| ✅ Válida | Dentro do prazo | Nenhuma |
| ⚠️ Vencendo | 30 dias para vencer | Agendar INMETRO |
| ❌ Vencida | Prazo expirado | Bloquear equipamento e agendar |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Equipamento bloqueado mesmo com aferição válida | Data de vencimento cadastrada incorretamente | Editar aferição e corrigir data |
| Alerta de vencimento não aparece | Aferição não registrada no sistema | Cadastrar o certificado |
| Certificado sem número | INMETRO não emitiu o documento correto | Solicitar novo certificado ao laboratório |


## Cadastro de Afericao

![Cadastro de Afericao](../img/Operações%20-%20aferição%20-%20cadastro.png)

## Campos

| Campo | Descricao |
|-------|-----------|
| Equipamento | código e serie do Equipamento |
| N Certificado | número do certificado INMETRO |
| Data Emissao | Data de emissao do certificado |
| Data Vencimento | Data de vencimento do certificado |
| Status | válido ou Vencendo ou Vencido |

:::warning Validade da Aferição
Infrações geradas com aferição vencida podem ser juridicamente questionáveis.  
Mantenha o controle de vencimentos atualizado e agende renovações com 60 dias de antecedência.
:::

## Integração com outros módulos

| Módulo | Como usa este cadastro |
|--------|----------------------|
| **Equipamentos** | O sistema monitora o vencimento da aferição por equipamento e exibe alertas quando o prazo se aproxima |
| **Tarjas** | A data de aferição e o número do certificado exibidos na tarja vêm do último registro de aferição ativo |
| **Dashboard** | Alertas de aferição vencida ou próxima do vencimento são exibidos no painel inicial |
| **Exportação** | Infrações de equipamentos com aferição vencida são bloqueadas e não entram no lote |

## Perguntas frequentes

**O equipamento é bloqueado automaticamente quando a aferição vence?**
Sim, após o vencimento o sistema bloqueia a geração de infrações válidas e o Dashboard exibe alerta. Renovar o certificado e cadastrar a nova aferição libera o equipamento.

**Com quanto de antecedência devo renovar a aferição?**
Recomenda-se acionar o INMETRO com pelo menos 60 dias de antecedência, pois o agendamento pode levar semanas. O Dashboard alerta a partir de 30 dias do vencimento.

**Posso registrar uma aferição retroativamente?**
Sim. Informe a data de emissão e vencimento corretas conforme o certificado do INMETRO. O sistema usará as datas do certificado, não a data do cadastro.

:::info Dados na Tarja
As informações de aferição aparecem nas **tarjas das Infrações
- **Data de Aferição** (Data Emissão)
- **Data de Vencimento**
- **Número do Certificado INMETRO**

Para entender como esses dados são exibidos e como mantê-los atualizados, consulte:  
👉 Configuração de Dados da Tarja](../administracao/configuracao-dados-tarja#data-da-afericao)**
:::

## Relacionado

- [Equipamentos](../cadastros-basicos/equipamentos)
- [Tipos de Aferições](../administracao/tipos-afericoes)
- [Aferição](../glossario/afericao)
- [Configuração de Dados da Tarja](../administracao/configuracao-dados-tarja)

## Boas práticas

- Registre a aferição imediatamente ao receber o certificado INMETRO — não aguarde a proximidade do vencimento
- Agende a renovação com pelo menos 30 dias de antecedência para evitar interrupções operacionais
- Mantenha cópia digital do certificado no sistema vinculada ao registro para facilitar auditorias
- Verifique o Dashboard diariamente para acompanhar alertas de aferições próximas do vencimento

## Navegacao relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Equipamentos](../cadastros-basicos/equipamentos) | Equipamento aferido |
| Relacionado | [Cadastro de Operacoes](./cadastro-operacoes) | Operacoes vinculadas |
| Guia | Configuração de Dados da Tarja](../administracao/configuracao-dados-tarja) | Como os dados aparecem na tarja |

## Exemplo prático

**Registrando o certificado de aferição periódica após vistoria INMETRO:**

1. Receber o certificado físico do INMETRO com número, datas de emissão e vencimento
2. Acessar **Operações → Aferições** e clicar em **+ Nova Aferição**
3. Preencher:

| Campo | Exemplo |
|-------|---------|
| **Equipamento** | CAM-SP310-45A |
| **Tipo de Aferição** | Aferição Periódica |
| **Nº Certificado** | INMETRO/DIMEL 2026-04521 |
| **Data de Emissão** | 15/01/2026 |
| **Data de Vencimento** | 14/01/2027 |

4. Salvar e confirmar que o alerta de vencimento desapareceu do Dashboard

:::tip
Digitalize e arquive o certificado físico imediatamente após o cadastro — será exigido em auditorias do contratante.
:::
