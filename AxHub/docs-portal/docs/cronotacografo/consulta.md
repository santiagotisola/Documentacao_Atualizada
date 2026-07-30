---
sidebar_position: 2
title: Consulta
description: Consulta de registros de cronotacógrafo
---

# Consulta de Cronotacógrafo

Permite consultar o histórico de registros de cronotacógrafo processados pelo sistema, com detalhes de placa, velocidade, status de verificação e resultado da consulta ao banco de certificados.

![Histórico Cronotacógrafo](../img/Cronotacógrafo%20-%20Triagem%20-%20historico.png)

## Como acessar

**Menu lateral** → Cronotacógrafo → **Consulta**

## O que é verificado

A cada registro de cronotacógrafo, o sistema verifica:

1. **Validade do certificado** — se o certificado do aparelho está dentro do prazo
2. **Regularidade do condutor** — se o tempo de jornada está dentro do limite legal
3. **Integridade do lacre** — se o Equipamento não foi adulterado

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Período** | Faixa de datas |
| **Placa** | Filtrar por placa do Veículo |
| Equipamento | Filtrar por Equipamento de fiscalização |
| **Status** | Processado, Pendente, Descartado, Irregular |

## Campos do resultado

| Coluna do Resultado | Descrição |
|---------------------|-----------|
| **Data/Hora** | Momento do registro |
| **Placa** | Placa do Veículo |
| Equipamento | Equipamento que registrou |
| **Velocidade** | Velocidade registrada |
| **Status Cronotacógrafo** | `Regular`, `Irregular`, `Vencido`, `NaoEncontrado` |
| **Status Processamento** | `Processado`, `Pendente`, `Descartado` |
| Infração Gerada** | Número do auto (quando houver Infração |

## Resultado por status

| Status Cronotacógrafo | Gera infração? | Ação |
|-----------------------|:--------------:|------|
| Regular | Não | Passagem liberada |
| Irregular | Sim | Auto de infração Art.162,II CTB |
| Vencido | Sim | Auto de infração Art.162,II CTB |
| NãoEncontrado | Revisão manual | Triagem pelo operador |

## Boas práticas

- Priorize registros com status **NãoEncontrado** na triagem — podem indicar veículos sem certificação ou placas divergentes
- Verifique periodicamente o banco de certificados: certifique-se de que a atualização está em dia para evitar falsos negativos
- Use os filtros de período e placa para auditar registros de uma operação específica rapidamente

## Fluxo de consulta

1. Veículo pesado passa pelo equipamento com leitor de cronotacógrafo
2. Sistema captura a placa e consulta automaticamente o status do cronotácografo
3. Resultado gravado: `Regular`, `Irregular`, `Vencido` ou `NãoEncontrado`
4. Se `Irregular` ou `Vencido` → infração gerada automaticamente
5. Se `NãoEncontrado` → encaminhado para triagem manual
6. Acessar **Cronotacógrafo → Consulta** para acompanhar e revisar registros

## Tabela de referência — erros de consulta

| Situação | Causa provável | Solução |
|----------|---------------|----------|
| Status `NãoEncontrado` frequente | Banco de certificados desatualizado | Acionar equipe técnica para atualizar |
| Infração gerada para veículo regular | Certif. vencido mas renovado recentemente | Verificar data de atualização do banco |
| Status `Erro` na consulta | Falha de conectividade com WS externo | Verificar integração de rede |

## Relacionado

- [Cronotacógrafo](../glossario/cronotacografo)
- [Triagem](../infracoes/triagem)

## Status do Cronotacógrafo

| Status | Significado |
|--------|-------------|
| **Regular** | Certificado válido, jornada dentro do limite |
| **Irregular** | Violação de jornada detectada |
| **Vencido** | Certificado expirado |
| **NaoEncontrado** | Placa não localizada no banco de dados de certificados |

## Exportação

Exportável em **Excel** para Análise e inclusão em autos de Infração administrativos.

---

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Anterior | [Triagem](./triagem) | Processo de triagem de registros |
| Glossário | [Cronotacógrafo](../glossario/cronotacografo) | Definição técnica e base legal |
