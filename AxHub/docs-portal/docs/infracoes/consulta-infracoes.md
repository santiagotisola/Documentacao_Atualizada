---
sidebar_position: 5
title: Consulta de Infrações
description: Consultar Infrações processadas no sistema
---

# Consulta de Infrações

A tela de consulta de Infrações permite pesquisar e visualizar todas as Infrações registradas no sistema, com filtros por período, Equipamento status e outros critérios.

![Tela de Consulta de Infrações](../img/triagem-consultar-infracoes.png)

## Como acessar

**Menu lateral** → Infrações → **Consulta**

## Funcionalidades

- Consultar Infrações por período, Equipamento faixa e status
- Visualizar detalhes da Infração (imagens, dados do Veículo enquadramento)
- Acompanhar status do processamento
- Exportar resultados para Excel

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Período** | Data inicial e final de detecção da Infração |
| Equipamento | Filtrar por ponto de fiscalização |
| **Placa** | Busca por placa exata ou parcial |
| **Status** | Aguardando Triagem, Válida, Descartada, Exportada, etc. |
| **Operação** | Velocidade, sinal, faixa exclusiva, etc. |
| Usuário | Analista ou auditor responsável |

## Status das Infrações

| Status | Descrição |
|--------|-----------|
| **Aguardando Triagem** | Infração aguardando Análise do triador |
| **Em Triagem** | Infração sendo analisada |
| **Válida** | Infração aprovada na triagem |
| **Descartada** | Infração descartada na triagem |
| **Auditoria** | Infração em processo de auditoria |
| **Exportada** | Infração enviada ao órgão autuador |

## Resultado da consulta

![Resultado da Consulta de Infrações](../img/triagem-consultar-resultado.png)

Após aplicar os filtros e clicar em **Pesquisar**, a grade de resultados exibe cada Infração com:

| Coluna | Descrição |
|--------|-----------|
| **Data/Hora** | Momento em que a Infração foi detectada |
| Equipamento | Código do Equipamento que registrou a Infração |
| **Placa** | Placa do Veículo infrator (lida por OCR) |
| **Velocidade Medida / Permitida** | Velocidade no momento vs. limite da via |
| **Enquadramento** | Artigo do CTB que ampara a Infração |
| **Status** | Situação atual no fluxo de processamento |
| **Analista** | Responsável pela triagem |
| **Auditor** | Responsável pela auditoria |

Clique em qualquer linha para abrir os detalhes completos da Infração incluindo as imagens capturadas.

## Termos Tecnicos

| Termo | Definicao |
|-------|-----------|
| [Enquadramento](../glossario/enquadramento) | Ver definicao no glossario |
| Use Infração (com acento) de Transito](../glossario/infracao) | Ver definicao no glossario |
| [Triagem](../glossario/triagem) | Ver definicao no glossario |

## Relacionado

- [Triagem de Infrações](./triagem)
- [Auditoria](./auditoria)
- [Infrações Descartadas](./infracoes-descartadas)
- [Lote de Exportação](../glossario/lote-exportacao)

## Boas práticas

- Use os filtros de **Período** e **Equipamento** em combinação para reduzir o volume de resultados e agilizar a análise
- Filtre por **Status = Aguardando Triagem** para identificar o backlog pendente antes de começar o turno
- Exporte para Excel apenas o período necessário — exportações muito grandes podem demorar
- Use o filtro **Usuário** para auditar a produção de um analista específico

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Fluxo | [Triagem](./triagem) | Etapa inicial do fluxo |
| Fluxo | [Auditoria](./auditoria) | Etapa de revisao |
| Fluxo | [Exportacao](./exportacao) | Etapa de envio |
| Fluxo | [Infracoes Descartadas](./infracoes-descartadas) | Registros descartados |
| Glossario | [Infracao](../glossario/infracao) | Definicao tecnica |

## Perguntas frequentes

**Como localizar rapidamente uma infração pelo número do auto?**
Use o filtro **Número Auto** ou **Placa** com o período aproximado. O campo de busca aceita número parcial.

**Infração com status ‘Aguardando Triagem’ por mais de 24h. O que verificar?**
Verifique se há analistas disponíveis e se o equipamento está enviando dados corretamente. Um grande acumulado pode indicar gargalo no fluxo de triagem.

**Posso alterar o enquadramento de uma infração diretamente nesta tela?**
Não. Alterações de enquadramento só são possíveis durante a triagem. Esta tela é apenas de consulta e visualização.

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Infrações — Triagem](./triagem)** | A consulta de infrações é o ponto de acesso ao detalhe de cada infração; alterações de enquadramento só são possíveis na triagem |
| **[Infrações — Auditoria](./auditoria)** | O auditor usa esta tela para localizar e revisar infrações antes de aprovação final |
| **[Relatório de Infrações](../relatorios/relatorio-infracoes)** | O relatório de infrações oferece visão agregada; a consulta detalha um registro individual |
| **[Exportação de Infrações](./exportacao)** | Infrações com status **Auditada** localizadas aqui estão aptas para exportação ao órgão autuador |
