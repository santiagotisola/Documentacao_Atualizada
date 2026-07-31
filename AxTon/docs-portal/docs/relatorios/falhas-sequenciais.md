---
sidebar_position: 10
title: Falhas de Sequenciais
description: Detecção de lacunas ou duplicações na numeração sequencial de infrações no AxTon
---

# Falhas de Sequenciais

![Sequencial de Exportação](../img/sequencial%20de%20exportacao.png)

Identifica **lacunas ou duplicações** na numeração sequencial de infrações, garantindo a integridade dos registros antes da exportação ao órgão autuador.

## Como acessar

**Menu lateral** → Relatórios → **Falhas de Sequenciais**

## Por que é importante

O DENATRAN/SENATRAN exige numeração sequencial contínua nos lotes de exportação. Lacunas podem causar rejeição do lote e comprometer a validade legal das infrações.

## Tipos de falha detectadas

| Tipo | Descrição | Ação recomendada |
|------|-----------|------------------|
| **Lacuna** | Número pulado na sequência | Verificar se houve descarte |
| **Duplicidade** | Mesmo número em duas infrações | Corrigir antes de exportar |
| **Fora de ordem** | Sequência com salto inesperado | Auditar o lote |

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Período** | Data início e fim da análise |
| **Equipamento** | Filtrar por equipamento específico |
| **Tipo de falha** | Lacuna, duplicidade ou ambos |

## Passo a passo

1. Acesse **Relatórios → Falhas de Sequenciais**
2. Selecione o **Período** a analisar
3. Clique em **Verificar**
4. O sistema lista as falhas encontradas
5. Corrija cada falha antes de exportar o lote

:::warning
Não exporte um lote com falhas sequenciais identificadas. O órgão autuador pode rejeitar o lote inteiro, exigindo reenvio de todas as infrações.
:::

## Relacionado

- [Sequenciais de Infrações](../administracao/sequenciais-infracoes)
- [Relatório de Infrações](./relatorio-infracoes)

3. Opcionalmente filtre por **Equipamento**
4. Clique em **Consultar**
5. Para cada falha encontrada, verifique a causa e corrija antes de exportar

:::warning Antes de exportar
Sempre execute este relatório antes de gerar um novo lote de exportação. Falhas não corrigidas causam rejeição pelo órgão autuador.
:::

## Casos de uso

- **Pré-exportação**: executar antes de gerar cada novo lote para garantir a integridade sequencial exigida pelo DENATRAN/SENATRAN
- **Auditoria interna**: identificar descarte não documentado de infrações que causam lacunas na sequência
- **Diagnóstico de falha técnica**: detectar falhas de comunicação entre balanca e servidor que causaram números duplicados
- **Comprovação de integridade**: documentar a ausência de gaps para fins de auditoria contratual

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Lac una encontrada antes de exportar | Infração descartada sem motivo | Verificar descarte no período correspondente |
| Número duplicado | Reenvio duplicado do lote | Auditar os registros com mesmo número |
| Relatório vazio | Sequêncial não configurado | Criar sequêncial em Cadastros → Sequênciais |
| Falha não some após reenvio | Causa raiz não corrigida | Investigar o ticket da infração antes de reenviar |

## Tabela de referência — tipos de falha

| Tipo | Causa comum | Ação |
|------|-------------|------|
| **Lac una** | Infração descartada ou não triada | Verificar pipeline de triagem |
| **Duplicidade** | Reenvio duplo do lote | Auditar o histórico de exportação |
| **Fora de ordem** | Falha de sincronização | Verificar conectividade da balança |

## Relacionado

- [Sequênciais de Exportação](../cadastros/sequencial-exportacao)
- [Sequênciais de Infração](../cadastros/sequencial-infracao)
- [Exportação de Infrações](../infracoes/exportacao)

## Perguntas frequentes

**O que causa lacunas na numeração sequencial das infrações?**
As principais causas são: infração descartada sem motivo registrado, falha de comunicação entre a balança e o servidor, ou reenvio duplicado de lotes. Investigue os tickets do período correspondente à lacuna para identificar a origem.

**Devo verificar este relatório antes de cada exportação de lote?**
Sim. Lacunas ou duplicidades não corrigidas podem causar rejeição do lote inteiro pelo DENATRAN/SENATRAN. Execute o relatório e corrija todas as falhas antes de gerar um novo lote.

**Como resolver uma duplicidade identificada no relatório?**
Identifique os tickets com mesmo número sequencial, verifique qual registro é o correto e cancele ou corrija o duplicado. Se o lote já foi enviado, entre em contato com o órgão autuador para orientação sobre o procedimento de correção.
