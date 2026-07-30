---
sidebar_position: 1
title: Relatório de Infrações
description: Relatório detalhado de Infrações processadas
---

# Relatório de Infrações

Permite gerar Relatórios detalhados das Infrações processadas pelo sistema, com filtros por período, Equipamento tipo de Infração e status. Utilizado para acompanhamento operacional, prestação de contas e auditoria interna.

Relatório de Infrações](../img/Relatorio%20-%20Relatorio%20de%20infrações.png)

## Como acessar

**Menu lateral** → Relatórios → Relatório de Infrações

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Período** | Faixa de datas |
| Equipamento | Filtrar por Equipamento |
| **Enquadramento** | Tipo de Infração |
| **Status** | Processada, descartada, exportada |
| **Operação** | Filtrar por operação vinculada |
| **Operador** | Filtrar por Usuário que realizou a triagem |

## Campos exibidos

| Coluna | Descrição |
|--------|-----------|
| **Número Auto** | Identificador único da Infração |
| **Data/Hora** | Momento da Infração |
| **Placa** | Placa do Veículo infrator |
| Equipamento | Equipamento que registrou |
| **Velocidade Medida** | Velocidade capturada |
| **Velocidade Considerada** | Velocidade após aplicação de tolerância |
| **Enquadramento** | Código e descrição do enquadramento aplicado |
| **Status** | Situação atual da Infração |
| **Operador** | Analista responsável pela triagem |
| **Lote de Exportação** | Lote ao qual foi exportada (quando aplicável) |

## Como usar

1. Acesse **Relatórios → Infrações**
2. Defina o **Período** e os filtros desejados
3. Clique em **Buscar**
4. Exporte em **Excel** para envio ou arquivoção

:::tip
Filtre por **Status = Auditada** para obter a lista de infrações prontas para incluir no próximo lote de exportação.
:::

## Casos de uso

- **Fechamento de lote** — exporte as infrações com status **Auditada** para compor o próximo lote de envio ao órgão autuador
- **Auditoria pré-envio** — revise enquadramentos e imagens antes da exportação para evitar rejeições
- **Análise de descartes** — identifique os principais motivos de descarte para ajustar a calibração dos equipamentos
- **Acompanhamento do fluxo** — monitore o pipeline completo: triagem → auditoria → exportação por período

## Relacionado

- [Triagem de Infrações](../infracoes/triagem)
- [Lotes de Exportação](../glossario/lote-exportacao)
- [Motivos de Descarte](../administracao/motivos-descartes)

## Exportação

Exportável em **Excel** e **PDF**. O formato PDF inclui imagens quando selecionado o campo correspondente.

## Fluxo de uso do relatório

1. Acessar **Relatórios → Infrações**
2. Definir o **período** e filtrar por **Status = Auditada** para infrações prontas para exportar
3. Revisar enquadramentos e imagens duvidosos antes de exportar
4. Exportar em **Excel** para conciliação com o órgão autuador
5. Exportar em **PDF** para inclusão em boletim de medição

## Tabela de referência — status de infrações

| Status | Descrição | Próxima etapa |
|--------|-----------|:-------------:|
| **Pendente** | Aguardando triagem | Triagem |
| **Triada** | Aprovada na triagem | Auditoria |
| **Auditada** | Aprovada na auditoria | Exportar |
| **Descartada** | Rejeitada na triagem ou auditoria | Revisar motivo |
| **Exportada** | Incluída em lote e enviada | Arquivo externo |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Infração não aparece no relatório | Filtro de status ou período incorreto | Ampliar período e verificar status |
| Número do auto em branco | Sequêncial não configurado | Verificar Configurações → Sequênciais de Infrações |
| Velocidade considerada diferente da medida | Tolerância aplicada | Verificar configuração de tolerancia na operação |
| Exportação PDF sem imagens | Tipo de exportação sem imagens | Selecionar a opção "com imagens" |

## Relacionado

- [Triagem de Infrações](../infracoes/triagem)
- [Lotes de Exportação](../glossario/lote-exportacao)
- [Motivos de Descarte](../administracao/motivos-descartes)
