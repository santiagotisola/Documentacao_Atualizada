---
sidebar_position: 1
title: Contratos
description: Cadastro e gestão de contratos de medição no AxHub
---

# Contratos

Cadastro e gestão dos **contratos de prestação de serviço** vinculados às operações de fiscalização. Base para o cálculo mensal das medições e SLAs.

![Lista de Contratos](../img/Medição%20-%20contrato.png)

## Como acessar

**Menu lateral** → Medição → **Contratos**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Número** | Sim | Número do contrato |
| **Contratante** | Sim | Órgão ou empresa contratante |
| **Vigência Início** | Sim | Data de início |
| **Vigência Fim** | Sim | Data de encerramento |
| **Equipamentos** | Sim | Equipamentos cobertos |
| **Metas** | Sim | Índices de performance contratados |
| **Status** | Sim | Ativo, Encerrado ou Suspenso |

## Cadastro

![Cadastro de Contrato](../img/Medição%20-%20contrato%20-%20cadastro.png)

1. Acesse **Medição → Contratos**
2. Clique em **+ Novo**
3. Preencha todos os campos obrigatórios
4. Vincule os equipamentos ao contrato
5. Defina as metas de SLA
6. Clique em **Salvar**

## Navegação Relacionada

- [Criar Medição](./criar-medicao)
- [Índices de Performance](./indices-performance)
- [Recursos](./recursos)

## Fluxo contratual

1. Contrato assinado com o órgão contratante
2. Cadastrar o contrato em **Medição → Contratos**
3. Vincular os **Equipamentos** cobertos pelo contrato
4. Definir as **Metas** de disponibilidade e OCR
5. A cada mês: gerar a medição e revisar os índices apurados
6. Encaminhar o Boletim de Medição ao contratante dentro do prazo

## Tabela de referência — status de contratos

| Status | Descrição | Ação |
|--------|-----------|------|
| **Ativo** | Contrato em vigência | Gerar medições mensais |
| **Encerrado** | Prazo expirado | Não gerar novas medições |
| **Suspenso** | Pausa temporária | Aguardar retomada |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Medição não calcula dados do contrato | Contrato encerrado ou suspenso | Verificar status do contrato |
| Índice calculado incorreto | Equipamento não vinculado | Adicionar equipamento ao contrato |
| Meta não aparece no boletim | Meta não cadastrada | Editar contrato e preencher metas |
| Alerta de vencimento não aparece | Data fim não configurada | Verificar campo Vigência Fim |

## Alertas automáticos

O sistema envia alertas quando:
- A vigência do contrato está próxima do vencimento (30 dias antes)
- A meta de disponibilidade ou OCR está abaixo do estabelecido
- Nenhuma medição foi gerada no mês corrente

:::tip
Manteng ao contrato sempre atualizado com as metas vigentes. Metas desatualizadas geram boletins com dados incorretos de conformidade.
:::
| Tipo | Página |
|------|--------|
| Relacionado | [Medições](./criar-medicao) |
| Relacionado | [Índices de Performance](./indices-performance) |
| Relacionado | [Interrupções](./interrupcoes) |


| Campo | Descrição |
|-------|-----------|
| **Número do Contrato** | Identificador do contrato |
| **Órgão** | Órgão contratante |
| **Vigência Início** | Data de início do contrato |
| **Vigência Fim** | Data de término do contrato |
| Equipamentos | Equipamentos vinculados ao contrato |
| **Status** | Ativo, Encerrado, Suspenso |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Indices de Performance](./indices-performance) | Indicadores do contrato |
| Relacionado | [Recursos](./recursos) | Recursos alocados |
| Relacionado | [Criar Medicao](./criar-medicao) | Gerar medicao |
| Relacionado | [Interrupcoes](./interrupcoes) | Registrar interrupcoes |
| Glossario | [Medicao de Desempenho](../glossario/medicao-desempenho) | Definicao tecnica |

## Integração com outros módulos

| Módulo | Como usa este cadastro |
|--------|----------------------|
| **Medições** | Cada medição mensal precisa de um contrato ativo como referência para calcular os índices de performance |
| **Índices de Performance** | Os índices são vinculados ao contrato e usados para calcular conformidade no boletim |
| **Recursos** | Cada recurso humano e material é vinculado a um contrato para comprovação de fornecimento |
| **Interrupções** | As interrupções registradas são contabilizadas na medição do contrato vigente |

## Perguntas frequentes

**Um contrato encerrado pode ser reaberto para gerar uma medição retroativa?**
Não diretamente. Altere o status para Ativo temporariamente, gere a medição e reverta. Documente o procedimento para fins de auditoria.

**O que acontece se eu vincular um equipamento errado ao contrato?**
O boletim de medição incluirá dados do equipamento incorreto. Corrija o vínculo antes de gerar a próxima medição.

**Posso ter equipamentos em mais de um contrato simultaneamente?**
Sim, desde que os períodos de vigência sejam diferentes. Equipamentos ativos em dois contratos simultâneos podem gerar duplicidade no boletim.

## Ciclo mensal

| Etapa | Quando | Ação |
|-------|--------|------|
| **1. Verificar vigência** | Dia 1 do mês | Confirmar status Ativo e metas corretas |
| **2. Registrar interrupções** | Durante o mês | Lançar toda interrupção em [Interrupções](./interrupcoes) |
| **3. Gerar medição** | Até dia 5 do mês seguinte | Criar em [Criar Medição](./criar-medicao) |
| **4. Revisar índices** | Após geração | Comparar disponibilidade e OCR com as metas |
| **5. Finalizar e enviar** | Conforme contrato | Exportar boletim PDF e enviar ao contratante |

:::warning Prazo contratual
Verifique no contrato o prazo máximo para entrega do Boletim — em geral entre 5 e 10 dias após o encerramento do mês.
:::
